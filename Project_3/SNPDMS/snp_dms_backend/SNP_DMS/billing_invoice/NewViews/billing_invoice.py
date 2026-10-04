# other imports
import os
from wkhtmltopdf.views import PDFTemplateResponse
from report.functions import user_data

# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# django
from django.http import HttpResponse
from django.db import transaction

# services
from billing_invoice.services.biiling_invoice_service import InvoiceService

# models
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoice,
    CustomerBillInvoiceLine,
    MNRInvoiceLine,
)
from master.models import Location, Site
from master.models_two import Client, LineHandlingCharges, HandlingChargesHistory
from depot.models import GateInHistory, GateOutHistory
from depot.lolo_finance_models import AdvLoloPymtInvoiceRel, AdvancedHandlingPayment

# error handling
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from account.permissions import HasAllowedRoles

from django.db.models import Q
import logging
import traceback
from SNP_DMS.settings.base import BASE_DIR
import os
import datetime
from django.utils import timezone
import xlsxwriter


class CollectCustomerInvoiceData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pk_list = data["pk_list"]
            from_date = data["from_date"]
            to_date = data["to_date"]
            data = self.service.collectInvoiceData(pk_list, from_date, to_date)

            return Response(data, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListInvoices(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def post(self, request, *args, **kwargs):
        try:
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]

            data = self.service.getInvoices(request.data, on_page_data, pg_no)
            return Response(
                data,
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListInvoicesDownload(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def get_df_data(self, request_data):
        try:
            data = self.service.getInvoicesListToDownload(request_data)
            df_data = [
                [
                    row.get("container_no"),
                    row.get("invoice_no"),
                    row.get("invoice_date"),
                    row.get("bill_type"),
                    row.get("client"),
                    row.get("total_amount"),
                ]
                for row in data
            ]

            if not df_data:
                df_data = [["" for _ in range(6)]]
            return df_data
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return [["" for _ in range(6)]]

    def get_report_wb(self, df_data):
        try:
            if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/"))
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M%S")
            temp_file_path = os.path.join(
                BASE_DIR, f"temp/invoice_list_report_{date}{time}.xlsx"
            )
            generic_workbook = xlsxwriter.Workbook(temp_file_path)

            invoice_sheet = generic_workbook.add_worksheet(f"invoice_list")
            invoice_sheet.add_table(
                f"A1:F{1 + len(df_data)}",
                {
                    "data": df_data,
                    "columns": [
                        {"header": "container_no"},
                        {"header": "invoice_no"},
                        {"header": "invoice_date"},
                        {"header": "bill_type"},
                        {"header": "client"},
                        {"header": "total_amount"},
                    ],
                },
            )
            generic_workbook.close()
            return temp_file_path
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return None

    def post(self, request, *args, **kwargs):
        try:
            df_data = self.get_df_data(request_data=request.data)
            invoice_report_file_path = self.get_report_wb(df_data=df_data)
            filename = os.path.basename(invoice_report_file_path)
            with open(invoice_report_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="{filename}.xlsx"'
                )
                os.remove(invoice_report_file_path)
            return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Something went wrong!!!"}, status=200)


# class GetInvoice(APIView):
#     permission_classes = (IsAuthenticated, HasAllowedRoles)
# allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
#     service = InvoiceService()

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             data = self.service.getInvoiceData(pk)

#             return Response(data, status=status.HTTP_200_OK)

#         except Exception as e:
#             ErrorLogging().log_error()
#             return Response(
#                 {"errorMsg": "An unexpected error occurred. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )


class DownloadInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice = CustomerBillInvoice.objects.select_related(
                "site",
                "client",
                "ship_to_party_client",
                "bill_to_party_client",
                "location",
            ).get(pk=pk)
            apply_igst = invoice.apply_igst
            sales_term = invoice.client.sales_term
            hsn_code = invoice.hsn_code
            from_supply_date = invoice.from_supply_date
            to_supply_date = invoice.to_supply_date
            bill_type = invoice.bill_type
            location = invoice.location
            site = invoice.site
            bill_to_party_client = invoice.bill_to_party_client
            ship_to_party_client = invoice.ship_to_party_client
            location_icon = None
            try:
                location_icon = location.icon.url
            except:
                location_icon = None
            if bill_type in ["Washing/Cleaning", "Repair"]:
                df = InvoiceService().getMnrDataForPrintInvoice(
                    invoice, apply_igst, hsn_code, sales_term
                )

                # Calculate overall tax amount, taxable amount and total amount
                overall_tax_amount = (
                    df["igst_amount"].sum()
                    if apply_igst
                    else df["cgst_amount"].sum() + df["sgst_amount"].sum()
                )
                overall_taxable_amount = df["taxable_amount"].sum()
                total_amount = df["total_amount"].sum()

                context = self.service.getContextData(
                    invoice=invoice,
                    location_icon=location_icon,
                    location=location,
                    site=site,
                    bill_to_party_client=bill_to_party_client,
                    ship_to_party_client=ship_to_party_client,
                    overall_taxable_amount=overall_taxable_amount,
                    overall_tax_amount=overall_tax_amount,
                    total_amount=total_amount,
                    new_list=df.to_dict(orient="records"),
                    from_supply_date=from_supply_date,
                    to_supply_date=to_supply_date,
                    is_multiple_container=True,
                    bill_date=None,
                )

            else:
                invoice_qs = CustomerBillInvoiceLine.objects.filter(parent=invoice)

                # container = (
                #     ""
                #     if invoice_qs.count() > 1
                #     else invoice_qs.first().container_no
                # )
                is_multiple_container = True if invoice_qs.count() > 1 else False

                discount = invoice.discount
                if discount == "0" or discount == None or discount == "":
                    discount_value = 0
                else:
                    discount_value = float(discount) / 100

                if bill_type == "Handling":
                    ids = invoice_qs.values_list("bill_id", flat=True)
                    bill_date = (
                        CustomerBill.objects.filter(pk__in=ids).first().bill_date
                    )

                    site_20_rate = 0
                    site_40_rate = 0
                    night_charge_20_rate = 0
                    night_charge_40_rate = 0

                    if (
                        float(invoice.size_20_rate) == float(0)
                        and float(invoice.size_40_rate) == float(0)
                        and float(invoice.night_charge_size_20_rate) == float(0)
                        and float(invoice.night_charge_size_40_rate) == float(0)
                    ):
                        if (
                            invoice.client.type == "Line"
                            and LineHandlingCharges.objects.filter(
                                ref_code=invoice.client.ref_code,
                                location=invoice.location,
                                site=invoice.site,
                            ).exists()
                        ):
                            line_lolo_rate_obj = LineHandlingCharges.objects.filter(
                                ref_code=invoice.client.ref_code,
                                location=invoice.location,
                                site=invoice.site,
                            ).first()

                            site_20_rate = line_lolo_rate_obj.size_20_rate
                            site_40_rate = line_lolo_rate_obj.size_40_rate
                            night_charge_20_rate = (
                                line_lolo_rate_obj.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                line_lolo_rate_obj.night_charge_size_40_rate
                            )
                        else:
                            site_20_rate = invoice.site.size_20_rate
                            site_40_rate = invoice.site.size_40_rate
                            night_charge_20_rate = (
                                invoice.site.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                invoice.site.night_charge_size_40_rate
                            )
                    else:
                        site_20_rate = invoice.size_20_rate
                        site_40_rate = invoice.size_40_rate
                        night_charge_20_rate = invoice.night_charge_size_20_rate
                        night_charge_40_rate = invoice.night_charge_size_40_rate

                    if invoice.invoice_on_old_lolo_rate:
                        if (
                            invoice.client.type == "Line"
                            and HandlingChargesHistory.objects.filter(
                                ref_code=invoice.client.ref_code,
                                client_type="Line",
                                location=invoice.location,
                                site=invoice.site,
                            ).exists()
                        ):
                            lolo_rate_obj = HandlingChargesHistory.objects.filter(
                                ref_code=invoice.client.ref_code,
                                client_type="Line",
                                location=invoice.location,
                                site=invoice.site,
                            ).first()
                            site_20_rate = lolo_rate_obj.size_20_rate
                            site_40_rate = lolo_rate_obj.size_40_rate
                            night_charge_20_rate = (
                                lolo_rate_obj.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                lolo_rate_obj.night_charge_size_40_rate
                            )

                        if (
                            invoice.client.type == "Party"
                            and HandlingChargesHistory.objects.filter(
                                ref_code=None,
                                client_type="Party",
                                location=invoice.location,
                                site=invoice.site,
                            ).exists()
                        ):
                            lolo_rate_obj = HandlingChargesHistory.objects.filter(
                                ref_code=None,
                                client_type="Party",
                                location=invoice.location,
                                site=invoice.site,
                            ).first()

                            site_20_rate = lolo_rate_obj.size_20_rate
                            site_40_rate = lolo_rate_obj.size_40_rate
                            night_charge_20_rate = (
                                lolo_rate_obj.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                lolo_rate_obj.night_charge_size_40_rate
                            )

                    df = self.service.getHandlingPrintInvoiceData(
                        ids,
                        invoice,
                        apply_igst,
                        discount,
                        discount_value,
                        hsn_code,
                        site_20_rate,
                        site_40_rate,
                        night_charge_20_rate,
                        night_charge_40_rate,
                        is_multiple_container,
                        invoice_qs,
                    )

                elif bill_type == "Night Charge":

                    # ----------------------------------Night Charge_---------

                    site_20_rate = 0
                    site_40_rate = 0
                    night_charge_20_rate = 0
                    night_charge_40_rate = 0

                    if (
                        float(invoice.size_20_rate) == float(0)
                        and float(invoice.size_40_rate) == float(0)
                        and float(invoice.night_charge_size_20_rate) == float(0)
                        and float(invoice.night_charge_size_40_rate) == float(0)
                    ):
                        if (
                            invoice.client.type == "Line"
                            and LineHandlingCharges.objects.filter(
                                ref_code=invoice.client.ref_code,
                                location=invoice.location,
                                site=invoice.site,
                            ).exists()
                        ):
                            line_lolo_rate_obj = LineHandlingCharges.objects.filter(
                                ref_code=invoice.client.ref_code,
                                location=invoice.location,
                                site=invoice.site,
                            ).first()
                            site_20_rate = line_lolo_rate_obj.size_20_rate
                            site_40_rate = line_lolo_rate_obj.size_40_rate
                            night_charge_20_rate = (
                                line_lolo_rate_obj.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                line_lolo_rate_obj.night_charge_size_40_rate
                            )
                        else:
                            site_20_rate = invoice.site.size_20_rate
                            site_40_rate = invoice.site.size_40_rate
                            night_charge_20_rate = (
                                invoice.site.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                invoice.site.night_charge_size_40_rate
                            )
                    else:
                        site_20_rate = invoice.size_20_rate
                        site_40_rate = invoice.size_40_rate
                        night_charge_20_rate = invoice.night_charge_size_20_rate
                        night_charge_40_rate = invoice.night_charge_size_40_rate

                    if invoice.invoice_on_old_lolo_rate:
                        if (
                            invoice.client.type == "Line"
                            and HandlingChargesHistory.objects.filter(
                                ref_code=invoice.client.ref_code,
                                client_type="Line",
                                location=invoice.location,
                                site=invoice.site,
                            ).exists()
                        ):
                            lolo_rate_obj = HandlingChargesHistory.objects.filter(
                                ref_code=invoice.client.ref_code,
                                client_type="Line",
                                location=invoice.location,
                                site=invoice.site,
                            ).first()
                            site_20_rate = lolo_rate_obj.size_20_rate
                            site_40_rate = lolo_rate_obj.size_40_rate
                            night_charge_20_rate = (
                                lolo_rate_obj.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                lolo_rate_obj.night_charge_size_40_rate
                            )

                        if (
                            invoice.client.type == "Party"
                            and HandlingChargesHistory.objects.filter(
                                ref_code=None,
                                client_type="Party",
                                location=invoice.location,
                                site=invoice.site,
                            ).exists()
                        ):
                            lolo_rate_obj = HandlingChargesHistory.objects.filter(
                                ref_code=None,
                                client_type="Party",
                                location=invoice.location,
                                site=invoice.site,
                            ).first()

                            site_20_rate = lolo_rate_obj.size_20_rate
                            site_40_rate = lolo_rate_obj.size_40_rate
                            night_charge_20_rate = (
                                lolo_rate_obj.night_charge_size_20_rate
                            )
                            night_charge_40_rate = (
                                lolo_rate_obj.night_charge_size_40_rate
                            )

                    ids = invoice_qs.values_list("bill_id", flat=True)
                    bill_date = (
                        CustomerBill.objects.filter(pk__in=ids).first().bill_date
                    )
                    df = self.service.getNightChargePrintInvoiceData(
                        ids,
                        invoice,
                        apply_igst,
                        discount,
                        discount_value,
                        hsn_code,
                        night_charge_20_rate,
                        night_charge_40_rate,
                        is_multiple_container,
                        invoice_qs,
                    )

                else:
                    # ----------------------------------Transportation_---------
                    ids = invoice_qs.values_list("bill_id", flat=True)
                    bill_date = (
                        CustomerBill.objects.filter(pk__in=ids).first().bill_date
                    )

                    df = self.service.getTransportationPrintInvoiceData(
                        ids,
                        invoice_qs,
                        apply_igst,
                        discount,
                        hsn_code,
                        is_multiple_container,
                    )

                # ----------------------------------------------------------------------------------------
                overall_tax_amount = (
                    df["igst_amount"].sum()
                    if apply_igst
                    else df["cgst_amount"].sum() + df["sgst_amount"].sum()
                )
                overall_taxable_amount = df["taxable_amount"].sum()
                total_amount = df["total_amount"].sum()

                context = self.service.getContextData(
                    invoice=invoice,
                    location_icon=location_icon,
                    location=location,
                    site=site,
                    bill_to_party_client=bill_to_party_client,
                    ship_to_party_client=ship_to_party_client,
                    overall_taxable_amount=overall_taxable_amount,
                    overall_tax_amount=overall_tax_amount,
                    total_amount=total_amount,
                    new_list=df.to_dict(orient="records"),
                    from_supply_date=from_supply_date,
                    to_supply_date=to_supply_date,
                    is_multiple_container=is_multiple_container,
                    bill_date=bill_date,
                )

            response = PDFTemplateResponse(
                request=request,
                template="billing_invoice/invoice.html",
                filename="foo.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={
                    "margin-top": 50,
                },
            )
            return response

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def delete(self, request, pk, *args, **kwargs):
        try:
            customer_bill_invoice = CustomerBillInvoice.objects.get(pk=pk)
            invoice_line_obj = CustomerBillInvoiceLine.objects.filter(
                parent=customer_bill_invoice
            )
            for each in invoice_line_obj:
                self.service.adjustCustomerBills(each)

            AdvLoloPymtInvoiceRel.objects.filter(
                invoice_no=customer_bill_invoice.invoice_no
            ).delete()

            customer_bill_invoice.delete()

            return Response(
                {"successMsg": "Customer Invoice Deleted Succesfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BuildBillingInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def create_adv_lolo_pymt_invoice_rel(self, invoice_obj):
        try:
            bill_ids = CustomerBillInvoiceLine.objects.filter(
                parent=invoice_obj
            ).values_list("bill_id", flat=True)

            lolo_ids = CustomerBill.objects.filter(pk__in=bill_ids).values_list(
                "lolo_id", flat=True
            )

            bl_nos = GateInHistory.objects.filter(lolo_id__in=lolo_ids).values_list(
                "gate_in__bl_no", flat=True
            )

            bk_nos = GateOutHistory.objects.filter(lolo_id__in=lolo_ids).values_list(
                "gate_out__booking_no", flat=True
            )

            payments = AdvancedHandlingPayment.objects.filter(
                Q(bl_no__in=bl_nos) | Q(bk_no__in=bk_nos)
            ).distinct()

            if not payments.exists():
                return

            existing_payment_ids = set(
                AdvLoloPymtInvoiceRel.objects.filter(
                    parent_id__in=payments.values_list("pk", flat=True),
                    invoice_no=invoice_obj.invoice_no,
                ).values_list("parent_id", flat=True)
            )

            relations_to_create = [
                AdvLoloPymtInvoiceRel(
                    parent=payment,
                    invoice_no=invoice_obj.invoice_no,
                )
                for payment in payments
                if payment.pk not in existing_payment_ids
            ]

            if relations_to_create:
                AdvLoloPymtInvoiceRel.objects.bulk_create(
                    relations_to_create,
                    ignore_conflicts=True,
                )

        except Exception:
            ErrorLogging().log_error()
            raise

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            self.service.validateInvoiceLines(
                data=data["invoice_lines"], method=request.method
            )

            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            client = Client.objects.get(
                name=data["main_client"], location=location, site=site
            )
            fin_year = self.service.getFinancialYear()
            if CustomerBillInvoice.objects.filter(
                invoice_no=data["invoice_label"] + data["invoice_no"],
                financial_year=fin_year,
                location=location,
                site=site,
            ).exists():
                raise ValidationError(
                    f"Invoice no {data['invoice_label']}{data['invoice_no']} already exists"
                )

            if len(data["invoice_no"]) > 4 or len(data["invoice_no"]) < 4:
                raise ValidationError(f"Invoice no should be of 4 digits")

            with transaction.atomic():
                invoice = self.service.createInvoice(data, client, location, site)
                _ = self.create_adv_lolo_pymt_invoice_rel(invoice_obj=invoice)

            return Response(
                {
                    "successMsg": "Invoice successfully created",
                    "invoice_pk": invoice.pk,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def get(self, request, pk, *args, **kwargs):
        try:
            data = self.service.getInvoiceData(pk)

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            invoice_lines = data["invoice_lines"]
            self.service.validateInvoiceLines(data=invoice_lines, method=request.method)

            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            client = Client.objects.get(
                name=data["main_client"], location=location, site=site
            )
            customer_bill = CustomerBillInvoice.objects.get(pk=data["pk"])

            # Invoice_no update validation
            form_invoice_no = data["invoice_label"] + data["invoice_no"]
            if not customer_bill.invoice_no == form_invoice_no:
                fin_year = self.service.getFinancialYear()
                if CustomerBillInvoice.objects.filter(
                    invoice_no=form_invoice_no,
                    financial_year=fin_year,
                    location=location,
                    site=site,
                ).exists():
                    raise ValidationError(
                        f"Invoice no {data['invoice_label']}{data['invoice_no']} already exists"
                    )

                if len(data["invoice_no"]) > 4 or len(data["invoice_no"]) < 4:
                    raise ValidationError(f"Invoice no should be of 4 digits")

            with transaction.atomic():
                self.service.updateInvoice(
                    data, client, invoice_lines, customer_bill, location, site
                )

            return Response(
                {"successMsg": "Invoice successfully updated"},
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadExcelBillingStatement(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def get(self, request, pk, *args, **kwargs):
        try:

            parent = CustomerBillInvoice.objects.select_related(
                "location", "bill_to_party_client"
            ).get(pk=pk)

            bill_type = parent.bill_type

            data, lines = self.service.getQuerysetDataForBillingStatement(
                bill_type, parent
            )

            if bill_type in ["Repair", "Washing/Cleaning"]:
                main_data = self.service.getMnrDfDataForExcelStatement(data, parent)
            else:
                main_data = self.service.getDfDataForExcelStatement(
                    lines, data, bill_type, parent
                )

            temp_file_path = self.service.generateExcel(main_data)

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="billing_statement.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetBillingStatement(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InvoiceService()

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice = CustomerBillInvoice.objects.select_related(
                "location", "site", "bill_to_party_client"
            ).get(pk=pk)
            discount = invoice.discount
            bill_type = invoice.bill_type

            location_str = invoice.location.name
            location = invoice.location
            site = invoice.site

            user_data_dict = user_data(location=location, site=site)
            invoice_date_str = invoice.invoice_date.strftime("%d/%m/%Y")
            gst_no_str = (
                invoice.bill_to_party_client.gst_no
                if invoice.bill_to_party_client
                else ""
            )
            party_name_str = invoice.bill_to_party_client.name

            invoice_no_str = invoice.invoice_no

            apply_igst = invoice.apply_igst
            if bill_type in ["Repair", "Washing/Cleaning"]:
                invoice_line = MNRInvoiceLine.objects.select_related("parent").filter(
                    parent=invoice
                )
                invoice_line_data = self.service.getMNRDataForBillingStatement(
                    invoice_line, invoice, user_data_dict
                )

                response = PDFTemplateResponse(
                    request=request,
                    template="billing_invoice/repair_invoice.html",
                    filename="foo.pdf",
                    context=invoice_line_data,
                    show_content_in_browser=True,
                    cmd_options={
                        "margin-top": 50,
                    },
                )
                return response
            elif bill_type in ["Handling"]:
                invoice_line = CustomerBillInvoiceLine.objects.select_related(
                    "parent"
                ).filter(parent=invoice)
                invoice_line_data = self.service.getHandlingDataForBillingStatement(
                    location_str,
                    invoice_date_str,
                    gst_no_str,
                    invoice_no_str,
                    party_name_str,
                    apply_igst,
                    invoice_line,
                    user_data_dict,
                )
                response = PDFTemplateResponse(
                    request=request,
                    template="billing_invoice/Handling_statement.html",
                    filename="foo.pdf",
                    context=invoice_line_data,
                    show_content_in_browser=True,
                    cmd_options={
                        "margin-top": 50,
                    },
                )
                return response
            else:
                invoice_line = CustomerBillInvoiceLine.objects.select_related(
                    "parent"
                ).filter(parent=invoice)
                invoice_line_data = self.service.getOtherDataForBillingStatement(
                    location_str,
                    invoice_date_str,
                    gst_no_str,
                    invoice_no_str,
                    party_name_str,
                    apply_igst,
                    invoice_line,
                    user_data_dict,
                )

                response = PDFTemplateResponse(
                    request=request,
                    template="billing_invoice/Handling_statement.html",
                    filename="foo.pdf",
                    context=invoice_line_data,
                    show_content_in_browser=True,
                    cmd_options={
                        "margin-top": 50,
                    },
                )
                return response

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
