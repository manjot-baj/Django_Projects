# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from master.functions import pagination_func
import traceback
import logging
import ast
import datetime
from django.db import transaction
from num2words import num2words
from wkhtmltopdf.views import PDFTemplateResponse
from django.http import HttpResponse
import os
from django.utils import formats
from billing_invoice.functions import (
    create_billing_statement_excel,
)
from report.functions import user_data

# model imports
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoice,
    CustomerBillInvoiceLine,
    MNRInvoiceLine,
)
from master.models import Location, Site
from master.models_two import Client, ClientChildCompany
from depot.models import (
    Handling,
    SelfTransportation,
    Container,
    GateInHistory,
    GateOutHistory,
)
from non_depot.models import NonDepotContainer
from mnr.models import Survey, SurveyLine
from billing_invoice.functions import get_financial_year

ERROR_MSG = "Data Not Found"


def none_to_empty_str(items):
    return {each: "" if items[each] is None else items[each] for each in items}


class BuildandUpdateCustomerBillingInvoice(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_or_create_client_child_company(self, client_child_company_pk, **data):
        if client_child_company_pk:
            client_child_company_object = ClientChildCompany.getById(
                client_child_company_pk
            )
            client_child_company_object.name = data["name"]
            client_child_company_object.address = data["address"]
            client_child_company_object.state = data["state"]
            client_child_company_object.gst_no = data["gst_no"]
            client_child_company_object.state_code = data["state_code"]
            client_child_company_object.zip_code = data["zip_code"]
            client_child_company_object.save()
        else:
            client_child_company_object = ClientChildCompany.create(
                parent=data["client"],
                name=data["name"],
                address=data["address"],
                state=data["state"],
                gst_no=data["gst_no"],
                zip_code=data["zip_code"],
                state_code=data["state_code"],
            )
        return client_child_company_object

    def get_bill_to_party_client(self, data, client):
        bill_to_party_client_object = self.get_or_create_client_child_company(
            data["bill_to_party_client_pk"],
            client=client,
            name=data["bill_to_party_client"],
            address=data["bill_to_party_address"],
            state=data["bill_to_party_state"],
            state_code=data["bill_to_party_state_code"],
            gst_no=data["bill_to_party_gst_no"],
            zip_code=data["bill_to_party_zip_code"],
        )

        bill_to_party_client_object.save()
        return bill_to_party_client_object

    def get_ship_to_party_client(self, data, bill_to_party_client_object, client):
        ship_to_party_client_object = None
        if (
            data["ship_to_party_client_pk"]
            and int(data["ship_to_party_client_pk"]) == bill_to_party_client_object.pk
        ):
            ship_to_party_client_object = bill_to_party_client_object
        elif data["ship_to_party_client"]:
            if (
                data["ship_to_party_client"] == bill_to_party_client_object.name
                and data["ship_to_party_state"] == bill_to_party_client_object.state
                and data["ship_to_party_zip_code"]
                == bill_to_party_client_object.zip_code
            ):
                ship_to_party_client_object = bill_to_party_client_object
            else:
                ship_to_party_client_object = self.get_or_create_client_child_company(
                    data.get("ship_to_party_client_pk"),
                    client=client,
                    name=data.get("ship_to_party_client"),
                    address=data.get("ship_to_party_address"),
                    state=data.get("ship_to_party_state"),
                    state_code=data.get("ship_to_party_state_code"),
                    gst_no=data.get("ship_to_party_gst_no"),
                    zip_code=data.get("ship_to_party_zip_code"),
                )
                ship_to_party_client_object.save()

        return ship_to_party_client_object

    def create_line_objects(self, customer_bill, each_line):
        invoice_line = CustomerBillInvoiceLine.create(
            parent=customer_bill, data=each_line
        )
        invoice_line.save()
        return invoice_line

    def adjust_customer_bill(self, each_line, customer_bill):
        bill = CustomerBill.objects.get(pk=each_line["bill_id"])

        if bill.lolo_id:
            lolo_obj = Handling.objects.get(pk=bill.lolo_id)
            if lolo_obj.is_night_charges_applied and bill.bill_type == "Night Charge":
                lolo_obj.is_night_charge_bill_invoiced = True
                lolo_obj.save(update_fields=["is_night_charge_bill_invoiced"])
            if bill.bill_type == "Handling":
                lolo_obj.is_invoiced = True
                lolo_obj.is_amt_editable = False
                lolo_obj.save(update_fields=["is_invoiced", "is_amt_editable"])

        if bill.st_id:
            st_obj = SelfTransportation.objects.get(pk=bill.st_id)
            st_obj.is_invoiced = True
            st_obj.is_amt_editable = False
            st_obj.save(update_fields=["is_invoiced", "is_amt_editable"])
        if bill.survey_id:
            survey_id = Survey.objects.get(pk=bill.survey_id)
            survey_id.invoice_id = customer_bill.pk
            survey_id.save(update_fields=["invoice_id"])

        bill.remaining_amount = float(bill.remaining_amount) - float(
            each_line["rec_amount"]
        )
        bill.save(update_fields=["remaining_amount"])
        if bill.remaining_amount == float(0):
            bill.is_payment_completed = True
            bill.save(update_fields=["is_payment_completed"])

        return bill

    def validate_invoice_lines(self, data, method):
        for each in data:
            if float(each["rec_amount"]) < float(0):
                return {"errorMsg": "Recieved Amount cannot be negative or zero"}

            if (
                float(each["rec_amount"]) > float(each["remaining_amount"])
                and method == "POST"
            ):
                return {
                    "errorMsg": "Received Amount cannot be greater than Remaining Amount"
                }

        return data

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            validated_data = self.validate_invoice_lines(
                data=data["invoice_lines"], method=request.method
            )

            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            client = Client.objects.get(
                name=data["main_client"], location=location, site=site
            )
            fin_year = get_financial_year()
            # fin_year = f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            if CustomerBillInvoice.objects.filter(
                invoice_no=data["invoice_label"] + data["invoice_no"],
                financial_year=fin_year,
                location=location,
                site=site,
            ).exists():
                return Response(
                    {
                        "errorMsg": f"Invoice no {data['invoice_label']}{data['invoice_no']} already exists"
                    }
                )

            with transaction.atomic():
                bill_to_party_client_object = self.get_bill_to_party_client(
                    data, client
                )
                ship_to_party_client_object = self.get_ship_to_party_client(
                    data, bill_to_party_client_object, client
                )
                customer_bill = CustomerBillInvoice.create(
                    client=client,
                    bill_to_party_client=bill_to_party_client_object,
                    ship_to_party_client=ship_to_party_client_object,
                    apply_igst=data["apply_igst"],
                    location=location,
                    site=site,
                    data=data,
                )
                customer_bill.save()
                total_amount = float(0)
                for each_line in data["invoice_lines"]:
                    total_amount = float(total_amount) + float(each_line["rec_amount"])
                    invoice_line_object = self.create_line_objects(
                        customer_bill, each_line
                    )
                    bill = self.adjust_customer_bill(each_line, customer_bill)
                customer_bill.total_amount = float(total_amount)
                customer_bill.save()

            return Response(
                {
                    "successMsg": "Invoice successfully created",
                    "invoice_pk": customer_bill.pk,
                }
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            validated_data = self.validate_invoice_lines(
                data=data["invoice_lines"], method=request.method
            )

            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            client = Client.objects.get(
                name=data["main_client"], location=location, site=site
            )
            customer_bill = CustomerBillInvoice.objects.get(pk=data["pk"])
            # if customer_bill.is_transaction_effected:
            #     return Response(
            #         {
            #             "errorMsg": "Please Revert Before Updating Customer Bill Invoice",
            #         },
            #         status=200,
            #     )

            with transaction.atomic():
                bill_to_party_client_object = self.get_bill_to_party_client(
                    data, client
                )
                ship_to_party_client_object = self.get_ship_to_party_client(
                    data, bill_to_party_client_object, client
                )
                total_amount = float(0)
                sum_of_recieved_amount = float(0)

                for each_line in validated_data:
                    sum_of_recieved_amount = sum_of_recieved_amount + float(
                        each_line["rec_amount"]
                    )
                    line = CustomerBillInvoiceLine.objects.get(pk=each_line["pk"])
                    bill = CustomerBill.objects.get(pk=each_line["bill_id"])
                    if not float(each_line["rec_amount"]) == float(line.rec_amount):
                        total_amount = total_amount + float(each_line["rec_amount"])

                        bill.is_payment_completed = False
                        bill.remaining_amount = float(bill.remaining_amount) + float(
                            line.rec_amount
                        )
                        bill.save()
                        line.remaining_amount = float(line.remaining_amount) + float(
                            line.rec_amount
                        )
                        line.save()
                        line.container_no = each_line["container_no"]
                        line.original_amount = each_line["original_amount"]
                        line.rec_amount = each_line["rec_amount"]
                        line.remaining_amount = float(line.remaining_amount) - float(
                            each_line["rec_amount"]
                        )
                        line.save()
                        bill.remaining_amount = float(bill.remaining_amount) - float(
                            each_line["rec_amount"]
                        )
                        bill.save()
                        if bill.remaining_amount == float(0):
                            bill.is_payment_completed = True
                            bill.save()

                customer_bill.invoice_no = data["invoice_label"] + data["invoice_no"]
                customer_bill.invoice_date = datetime.datetime.strptime(
                    data["invoice_date"], "%d/%m/%Y"
                ).date()
                customer_bill.bill_type = data["bill_type"]
                customer_bill.hsn_code = data["hsn_code"]
                customer_bill.client = client
                customer_bill.ref_booking_no = data["ref_booking_no"]
                customer_bill.ref_bl_no = data["ref_bl_no"]
                customer_bill.place_of_supply = data["place_of_supply"]
                customer_bill.supply_date = (
                    datetime.datetime.strptime(data["supply_date"], "%d/%m/%Y").date()
                    if data["supply_date"]
                    else None
                )

                customer_bill.apply_igst = data["apply_igst"]
                customer_bill.bill_to_party_client = bill_to_party_client_object
                customer_bill.ship_to_party_client = ship_to_party_client_object
                customer_bill.total_amount = float(sum_of_recieved_amount)
                customer_bill.remark = data["remark"]
                customer_bill.location = location
                customer_bill.site = site
                customer_bill.is_transaction_effected = True
                customer_bill.discount = data["discount"]
                customer_bill.save()

                # for each_line in data["invoice_lines"]:

                #     invoice_line = CustomerBillInvoiceLine.objects.get(pk=data["pk"])

                #     bill = CustomerBill.objects.get(pk=invoice_line.bill_id)

                # invoice_line_object = self.create_line_objects(
                #     customer_bill, each_line
                # )
                # bill = self.adjust_customer_bill(each_line, customer_bill)

            return Response(
                {"successMsg": "Invoice successfully updated"},
                status=200,
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)

    def get(self, request, pk, *args, **kwargs):
        try:
            customer_invoice = CustomerBillInvoice.objects.get(pk=pk)
            data = customer_invoice.get_customer_bill_invoice()
            data["invoice_lines"] = [
                {
                    "pk": bill.pk,
                    "container_no": bill.container_no,
                    "original_amount": str(bill.original_amount),
                    "remaining_amount": str(bill.remaining_amount),
                    "rec_amount": str(bill.rec_amount),
                    "bill_id": bill.bill_id,
                }
                for bill in CustomerBillInvoiceLine.objects.filter(
                    parent=customer_invoice
                )
            ]
            client = customer_invoice.client
            if ClientChildCompany.checkExistByParent(client.pk):
                data["client_child_company_list"] = [
                    each.get_child_client_details()
                    for each in ClientChildCompany.getByParent(client.pk)
                ]
            else:
                data["client_child_company_list"] = []

            return Response(data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class CancelEffectandDeleteInvoice(views.APIView):
    permission_classes = (IsAuthenticated,)

    def adjust_customer_invoice_data(self, customer_bill_invoice):
        customer_bill_invoice.is_transaction_effected = False
        customer_bill_invoice.total_amount = float(0)
        customer_bill_invoice.save()
        return customer_bill_invoice

    def adjust_customer_bill_data(self, each):
        customer_bill = CustomerBill.objects.get(pk=each.bill_id)
        customer_bill.is_payment_completed = False
        customer_bill.remaining_amount = (
            customer_bill.remaining_amount + each.rec_amount
        )
        customer_bill.save()
        if customer_bill.lolo_id:
            lolo_obj = Handling.objects.get(pk=customer_bill.lolo_id)
            if customer_bill.bill_type == "Night Charge":
                lolo_obj.is_night_charge_bill_invoiced = False
                lolo_obj.save(update_fields=["is_night_charge_bill_invoiced"])
            else:
                lolo_obj.is_invoiced = False
                lolo_obj.is_amt_editable = True
                lolo_obj.save(update_fields=["is_invoiced", "is_amt_editable"])
        if customer_bill.st_id:
            st_obj = SelfTransportation.objects.get(pk=customer_bill.st_id)
            st_obj.is_amt_editable = True
            st_obj.is_invoiced = False
            st_obj.save(update_fields=["is_amt_editable", "is_invoiced"])
        # if customer_bill.remaining_amount == customer_bill.original_amount:
        #     if customer_bill.lolo_id:
        #         lolo_obj = Handling.objects.get(pk=customer_bill.lolo_id)
        #         lolo_obj.is_invoiced = False
        #         lolo_obj.save()
        #     if customer_bill.st_id:
        #         st_obj = SelfTransportation.objects.get(pk=customer_bill.st_id)
        #         st_obj.is_invoiced = False
        #         st_obj.save()
        #     if customer_bill.survey_id:
        #         survey_id = Survey.objects.get(pk=customer_bill.survey_id)
        #         survey_id.invoice_id = (
        #             CustomerBillInvoiceLine.objects.filter(bill_id=customer_bill.pk)
        #             .latest()
        #             .pk
        #         )
        #         survey_id.save()

        return customer_bill

    def check_client_consistency(self, customer_bill_id):
        client_list = [each.client.name for each in customer_bill_id]
        return client_list

    def get_or_create_client_child_company(self, client_obj, client_data, client_name):
        existing_client_child = ClientChildCompany.objects.filter(
            parent=client_obj, name=client_name
        ).first()

        if existing_client_child:
            existing_client_child.address = client_data.office_address
            existing_client_child.gst_no = client_data.gst_no
            existing_client_child.state = client_data.state
            existing_client_child.state_code = (
                client_data.gst_no[:2] if client_data.gst_no else ""
            )
            existing_client_child.zip_code = client_data.zip
            existing_client_child.save()

        else:
            existing_client_child = ClientChildCompany.create(
                parent=client_obj,
                name=client_name,
                address=client_data.office_address,
                gst_no=client_data.gst_no,
                state=client_data.state,
                zip_code=client_data.zip,
                state_code=client_data.state_code,
            )
            existing_client_child.save()

        return existing_client_child

    def get_client_child_list(self, client_obj):
        if ClientChildCompany.checkExistByParent(client_obj.pk):
            return [
                each.get_child_client_details()
                for each in ClientChildCompany.getByParent(client_obj.pk)
            ]
        return []

    # def get(self, request, pk, *args, **kwargs):

    #     try:
    #         customer_bill_invoice = CustomerBillInvoice.objects.get(pk=pk)
    #         if not customer_bill_invoice.is_transaction_effected:
    #             return Response(
    #                 {"errorMsg": "Transaction Effect already cancelled"}, status=200
    #             )
    #         customer_bill_invoice = self.adjust_customer_invoice_data(
    #             customer_bill_invoice
    #         )

    #         invoice_line_obj = CustomerBillInvoiceLine.objects.filter(
    #             parent=customer_bill_invoice
    #         )
    #         bill_id_list = []
    #         for each in invoice_line_obj:
    #             customer_bill = self.adjust_customer_bill_data(each)
    #             bill_id_list.append(each.bill_id)
    #         invoice_line_obj.delete()

    #         customer_bill_id = CustomerBill.objects.filter(pk__in=bill_id_list)
    #         client_list = self.check_client_consistency(customer_bill_id)

    #         client_data = customer_bill_id[0].client
    #         client_obj = Client.objects.get(pk=client_data.pk)
    #         client_name = client_list[0]
    #         client_child_company = self.get_or_create_client_child_company(
    #             client_obj, client_data, client_name
    #         )
    #         client_child_company_list = self.get_client_child_list(client_obj)
    #         invoice_no = customer_bill_invoice.invoice_no
    #         data = {
    #             "bill_to_party_address": client_data.office_address,
    #             "bill_to_party_client": client_name,
    #             "bill_to_party_client_pk": str(client_child_company.pk),
    #             "bill_to_party_gst_no": client_data.gst_no,
    #             "bill_to_party_state": client_data.state,
    #             "bill_to_party_state_code": client_data.gst_no[:2]
    #             if client_data.gst_no
    #             else None,
    #             "bill_to_party_zip_code": client_data.zip,
    #             "main_client": client_name,
    #             "indian_state_list": INDIAN_STATES,
    #             "invoice_no": invoice_no,
    #             "bill_type": customer_bill_id[0].bill_type,
    #             "client_child_company_list": client_child_company_list,
    #             "ship_to_party_client_pk": "",
    #             "ship_to_party_client": "",
    #             "ship_to_party_address": "",
    #             "ship_to_party_gst_no": "",
    #             "ship_to_party_state": "",
    #             "ship_to_party_state_code": "",
    #             "ship_to_party_zip_code": "",
    #             "remark": "",
    #         }

    #         data["invoice_lines"] = [
    #             {
    #                 "pk": bill.pk,
    #                 "container_no": bill.container_no,
    #                 "original_amount": str(bill.original_amount),
    #                 "remaining_amount": str(bill.remaining_amount),
    #                 "rec_amount": "",
    #                 "bill_id": bill.pk,
    #             }
    #             for bill in customer_bill_id
    #         ]

    #         return Response(data, status=200)

    #     except Exception as e:
    #         error_log = logging.getLogger("error_log")
    #         error_log.error(traceback.format_exc())
    #         return Response({"errorMsg": ERROR_MSG}, status=200)

    def delete(self, request, pk, *args, **kwargs):
        try:
            customer_bill_invoice = CustomerBillInvoice.objects.get(pk=pk)
            invoice_line_obj = CustomerBillInvoiceLine.objects.filter(
                parent=customer_bill_invoice
            )
            for each in invoice_line_obj:
                customer_bill = self.adjust_customer_bill_data(each)

            customer_bill_invoice.delete()

            return Response(
                {"successMsg": "Customer Invoice Deleted Succesfully"}, status=200
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class GetAllInvoiceData(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self, data):
        query = Q()
        if data["location"]:
            query &= Q(parent__location__name=data["location"])
        if data["site"]:
            query &= Q(parent__site__name=data["site"])
        if data["client"]:
            query &= Q(parent__client__name=data["client"])
        if data["container_no"]:
            query &= Q(container_no=data["container_no"])
        invoice_date = data["invoice_date"]
        if not len(invoice_date["from"]) == 0 and not len(invoice_date["to"]) == 0:
            query &= Q(
                parent__invoice_date__range=(invoice_date["from"], invoice_date["to"])
            )
        if data["invoice_no"]:
            query &= Q(parent__invoice_no=data["invoice_no"])
        if data["bill_type"]:
            query &= Q(parent__bill_type=data["bill_type"])

        return CustomerBillInvoiceLine.objects.prefetch_related(
            "parent__location",
            "parent__site",
            "parent__client",
        ).filter(query)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]

            filtered_data = self.get_object(data)
            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = pagination_func(filtered_data, on_page_data, pg_no)

            data = [each.get_customer_bill_view() for each in current_page.object_list]

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": data,
                },
                status=200,
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class DownloadCustomerInvoice(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_size(self, bill_type, uom_type, invoice):
        if not bill_type in ["Handling", "Transportation", "Night Charge"]:
            return (
                uom_type.depot.container.size.name
                if invoice.site.type == "DEPOT"
                else uom_type.non_depot.container.size.name
            )
        else:
            return uom_type.container.size.name

    def get_uom_type(self, bill_type, bill):
        if bill_type == "Handling":
            return Handling.objects.select_related("container", "container__size").get(
                pk=bill.lolo_id
            )
        elif bill_type == "Night Charge":
            return Handling.objects.select_related("container", "container__size").get(
                pk=bill.lolo_id, is_night_charges_applied=True
            )
        elif bill_type == "Transportation":
            return SelfTransportation.objects.select_related(
                "container", "container__size"
            ).get(pk=bill.st_id)
        else:
            return Survey.objects.get(pk=bill.survey_id)

    def get_context_data(
        self,
        invoice,
        location_icon,
        location,
        site,
        bill_to_party_client,
        ship_to_party_client,
        overall_taxable_amount,
        overall_tax_amount,
        total_amount,
        new_list,
        from_supply_date,
        to_supply_date,
        is_multiple_container,
        bill_date,
    ):
        if not is_multiple_container:
            bill_date = (
                formats.date_format(invoice.supply_date, "d/m/Y")
                if invoice.supply_date
                else formats.date_format(datetime.datetime.now().date(), "d/m/Y")
            )
        elif from_supply_date is not None and to_supply_date is not None:
            from_supply_date = formats.date_format(from_supply_date, "d/m/Y")
            to_supply_date = formats.date_format(to_supply_date, "d/m/Y")

        return {
            "invoice_no": invoice.invoice_no,
            "invoice_date": formats.date_format(invoice.invoice_date, "d/m/Y"),
            "location_state": location.name,
            "location_gst_no": location.gst_no,
            "location_icon": location_icon,
            "location_state_code": location.gst_no[:2] if location.gst_no else "",
            "site_address": site.address,
            "site_contact": site.contact,
            "ref_booking_no": invoice.ref_booking_no,
            "ref_bl_no": invoice.ref_bl_no,
            "place_of_supply": invoice.place_of_supply,
            "supply_date": (
                f"{from_supply_date} to {to_supply_date}"
                if is_multiple_container
                else bill_date
            ),
            "main_client": invoice.client.name,
            "bill_to_party_client": (
                bill_to_party_client.name if bill_to_party_client else ""
            ),
            "bill_to_party_address": (
                bill_to_party_client.address if bill_to_party_client else ""
            ),
            "bill_to_party_state": (
                bill_to_party_client.state if bill_to_party_client else ""
            ),
            "bill_to_party_gst_no": (
                bill_to_party_client.gst_no if bill_to_party_client else ""
            ),
            "bill_to_party_state_code": (
                bill_to_party_client.state_code if bill_to_party_client else ""
            ),
            "bill_to_party_zip_code": (
                bill_to_party_client.zip_code if bill_to_party_client else ""
            ),
            "ship_to_party_client": (
                ship_to_party_client.name if ship_to_party_client else ""
            ),
            "ship_to_party_address": (
                ship_to_party_client.address if ship_to_party_client else ""
            ),
            "ship_to_party_state": (
                ship_to_party_client.state if ship_to_party_client else ""
            ),
            "ship_to_party_gst_no": (
                ship_to_party_client.gst_no if ship_to_party_client else ""
            ),
            "ship_to_party_state_code": (
                ship_to_party_client.state_code if ship_to_party_client else ""
            ),
            "ship_to_party_zip_code": (
                ship_to_party_client.zip_code if ship_to_party_client else ""
            ),
            "total_taxable_amount": round(overall_taxable_amount, 2),
            "total_cgst_amount": (
                float(0)
                if invoice.apply_igst
                else round(
                    (overall_tax_amount / float(2)),
                    2,
                )
            ),
            "total_sgst_amount": (
                float(0)
                if invoice.apply_igst
                else round(
                    (overall_tax_amount / float(2)),
                    2,
                )
            ),
            "total_igst_amount": (
                round(overall_tax_amount, 2) if invoice.apply_igst else float(0)
            ),
            "grand_total_amount": round(total_amount),
            "grand_total_amount_word": "Rupees "
            + (str(num2words(round(total_amount))).title()).replace(",", "")
            + " Only/-",
            "total_tax_amount": round(overall_tax_amount, 2),
            "invoice_line": new_list,
            "remark": invoice.remark,
            "bank_name": site.bank_name if site.bank_name else "",
            "account_no": site.bank_account_no if site.bank_account_no else "",
            "ifsc_code": site.ifsc_code if site.ifsc_code else "",
            "bank_branch": site.bank_branch if site.bank_branch else "",
            "organization": site.organization if site.organization else "",
        }

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice = CustomerBillInvoice.objects.select_related(
                "site", "client", "ship_to_party_client", "bill_to_party_client"
            ).get(pk=pk)
            apply_igst = invoice.apply_igst
            sales_term = invoice.client.sales_term
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
                invoice_line_data = []
                overall_tax_amount = float(0)
                overall_taxable_amount = float(0)
                total_amount = float(0)
                invoice_line = MNRInvoiceLine.objects.select_related("parent").filter(
                    parent=invoice
                )

                for each in invoice_line:
                    total_amount_after_discount = float(
                        each.total_amount_after_discount
                    )
                    if not apply_igst and sales_term:
                        tax = float(0)
                    else:
                        tax = total_amount_after_discount * 0.18
                    overall_tax_amount += round(tax, 2)
                    overall_taxable_amount += round(total_amount_after_discount, 2)
                    total_amount += round((total_amount_after_discount + tax), 2)
                    invoice_line_data.append(
                        {
                            "uom": each.size,
                            "hsn_code": invoice.hsn_code,
                            "charge_type": each.process,
                            "qty": each.bill_count,
                            "rate": 0,
                            "disc": each.discount,
                            "amount": round(each.total_amount, 2),
                            "taxable_amount": round(total_amount_after_discount, 2),
                            "cgst_amount": (
                                float(0)
                                if apply_igst
                                else float(0) if sales_term else round((tax / 2), 2)
                            ),
                            "sgst_amount": (
                                float(0)
                                if apply_igst
                                else float(0) if sales_term else round((tax / 2), 2)
                            ),
                            "igst_amount": round(tax, 2) if apply_igst else float(0),
                            "total_amount": round(
                                (total_amount_after_discount + tax), 2
                            ),
                        }
                    )
                context = self.get_context_data(
                    invoice=invoice,
                    location_icon=location_icon,
                    location=location,
                    site=site,
                    bill_to_party_client=bill_to_party_client,
                    ship_to_party_client=ship_to_party_client,
                    overall_taxable_amount=overall_taxable_amount,
                    overall_tax_amount=overall_tax_amount,
                    total_amount=total_amount,
                    new_list=invoice_line_data,
                    from_supply_date=from_supply_date,
                    to_supply_date=to_supply_date,
                    is_multiple_container=True,
                    bill_date=None,
                )

            else:
                invoice_line = CustomerBillInvoiceLine.objects.filter(parent=invoice)

                container = (
                    ""
                    if invoice_line.count() > 1
                    else invoice_line.first().container_no
                )
                is_multiple_container = True if invoice_line.count() > 1 else False

                invoice_line_data = []
                night_charge_data = []
                gst_18 = float(1.18)
                gst_9 = float(0.09)
                discount = invoice.discount
                if discount == "0" or discount == None or discount == "":
                    discount_value = 0
                else:
                    discount_value = float(discount) / 100

                for each in invoice_line:
                    bill = CustomerBill.objects.get(pk=each.bill_id)
                    uom_type = self.get_uom_type(bill_type, bill)
                    size = self.get_size(bill_type, uom_type, invoice)

                    if bill_type == "Handling":
                        size_20_rate = invoice.site.size_20_rate
                        size_40_rate = invoice.site.size_40_rate
                        rate = (
                            float(size_20_rate) if size == "20" else float(size_40_rate)
                        )
                        taxable_amt = rate - (rate * discount_value)
                        lolo_tax = taxable_amt * 0.18

                        invoice_line_data.append(
                            {
                                "uom": size,
                                "qty": 1,
                                "amount": float(rate),
                                "taxable_amount": taxable_amt,
                                "cgst_amount": (
                                    float(0)
                                    if apply_igst or float(lolo_tax) == float(0)
                                    else lolo_tax / 2
                                ),
                                "sgst_amount": (
                                    float(0)
                                    if apply_igst or float(lolo_tax) == float(0)
                                    else lolo_tax / 2
                                ),
                                "igst_amount": (
                                    float(lolo_tax) if apply_igst else float(0)
                                ),
                                "total_amount": float(taxable_amt) + float(lolo_tax),
                            }
                        )
                        customer_bill = CustomerBill.objects.get(pk=each.bill_id)

                        if CustomerBill.objects.filter(
                            lolo_id=customer_bill.lolo_id, bill_type="Night Charge"
                        ):

                            night_charge_size_20_rate = float(
                                site.night_charge_size_20_rate
                            )
                            night_charge_size_40_rate = float(
                                site.night_charge_size_40_rate
                            )
                            rate = (
                                night_charge_size_20_rate
                                if size == "20"
                                else night_charge_size_40_rate
                            )
                            night_charge_tax = float(rate) * 0.18
                            if night_charge_data:
                                if any(
                                    size in item.values() for item in night_charge_data
                                ):
                                    for item in night_charge_data:
                                        if size in item.values():
                                            item["qty"] += 1
                                            item["total_amount"] += float(rate)
                                            item["taxable_amount"] += (
                                                night_charge_size_20_rate
                                                if size == "20"
                                                else night_charge_size_40_rate
                                            )
                                            item["cgst_amount"] = (
                                                float(0)
                                                if apply_igst
                                                or float(night_charge_tax) == float(0)
                                                else night_charge_tax / 2
                                            )
                                            item["sgst_amount"] = (
                                                float(0)
                                                if apply_igst
                                                or float(night_charge_tax) == float(0)
                                                else night_charge_tax / 2
                                            )
                                            item["igst_amount"] = (
                                                float(night_charge_tax)
                                                if apply_igst
                                                else float(0)
                                            )
                                            item["total_amount"] += night_charge_tax
                                            break
                                else:
                                    night_charge_data.append(
                                        {
                                            "uom": size,
                                            "qty": 1,
                                            "amount": float(rate),
                                            "taxable_amount": (
                                                night_charge_size_20_rate
                                                if size == "20"
                                                else night_charge_size_40_rate
                                            ),
                                            "cgst_amount": (
                                                float(0)
                                                if apply_igst
                                                or float(night_charge_tax) == float(0)
                                                else night_charge_tax / 2
                                            ),
                                            "sgst_amount": (
                                                float(0)
                                                if apply_igst
                                                or float(night_charge_tax) == float(0)
                                                else night_charge_tax / 2
                                            ),
                                            "igst_amount": (
                                                float(night_charge_tax)
                                                if apply_igst
                                                else float(0)
                                            ),
                                            "total_amount": float(rate)
                                            + float(night_charge_tax),
                                        }
                                    )
                            else:
                                night_charge_data.append(
                                    {
                                        "uom": size,
                                        "qty": 1,
                                        "amount": float(rate),
                                        "taxable_amount": (
                                            night_charge_size_20_rate
                                            if size == "20"
                                            else night_charge_size_40_rate
                                        ),
                                        "cgst_amount": (
                                            float(0)
                                            if apply_igst
                                            or float(night_charge_tax) == float(0)
                                            else night_charge_tax / 2
                                        ),
                                        "sgst_amount": (
                                            float(0)
                                            if apply_igst
                                            or float(night_charge_tax) == float(0)
                                            else night_charge_tax / 2
                                        ),
                                        "igst_amount": (
                                            float(night_charge_tax)
                                            if apply_igst
                                            else float(0)
                                        ),
                                        "total_amount": float(rate)
                                        + float(night_charge_tax),
                                    }
                                )

                            # night_charge_data.append(
                            #     {
                            #         "uom": size,
                            #         "qty": 1,
                            #         "amount": float(rate),
                            #         "taxable_amount": (
                            #             night_charge_size_20_rate
                            #             if size == "20"
                            #             else night_charge_size_40_rate
                            #         ),
                            #         "cgst_amount": (
                            #             float(0)
                            #             if apply_igst
                            #             or float(night_charge_tax) == float(0)
                            #             else night_charge_tax / 2
                            #         ),
                            #         "sgst_amount": (
                            #             float(0)
                            #             if apply_igst
                            #             or float(night_charge_tax) == float(0)
                            #             else night_charge_tax / 2
                            #         ),
                            #         "igst_amount": (
                            #             float(night_charge_tax)
                            #             if apply_igst
                            #             else float(0)
                            #         ),
                            #         "total_amount": float(rate)
                            #         + float(night_charge_tax),
                            #     }
                            # )

                    elif bill_type == "Night Charge":
                        size_20_rate = float(site.night_charge_size_20_rate)
                        size_40_rate = float(site.night_charge_size_40_rate)
                        rate = size_20_rate if size == "20" else size_40_rate
                        night_charge_tax = float(rate) * 0.18

                        invoice_line_data.append(
                            {
                                "uom": size,
                                "qty": 1,
                                "amount": float(rate),
                                "taxable_amount": (
                                    size_20_rate * discount_value
                                    if size == "20"
                                    else size_40_rate
                                ),
                                "cgst_amount": (
                                    float(0)
                                    if apply_igst or float(night_charge_tax) == float(0)
                                    else night_charge_tax / 2
                                ),
                                "sgst_amount": (
                                    float(0)
                                    if apply_igst or float(night_charge_tax) == float(0)
                                    else night_charge_tax / 2
                                ),
                                "igst_amount": (
                                    float(night_charge_tax) if apply_igst else float(0)
                                ),
                                "total_amount": float(rate) + float(night_charge_tax),
                            }
                        )

                    else:
                        st_mnr_taxable_amount = (
                            float(each.rec_amount) / gst_18
                            if float(each.rec_amount) != 0
                            else 0
                        )
                        st_mnr_tax_amount = float(each.rec_amount) - float(
                            st_mnr_taxable_amount
                        )

                        invoice_line_data.append(
                            {
                                "uom": size,
                                "qty": 1,
                                "rate": st_mnr_taxable_amount,
                                "amount": st_mnr_taxable_amount,
                                "taxable_amount": st_mnr_taxable_amount,
                                "cgst_amount": (
                                    float(0)
                                    if apply_igst
                                    or float(st_mnr_tax_amount) == float(0)
                                    else st_mnr_tax_amount / 2
                                ),
                                "sgst_amount": (
                                    float(0)
                                    if apply_igst
                                    or float(st_mnr_tax_amount) == float(0)
                                    else st_mnr_tax_amount / 2
                                ),
                                "igst_amount": (
                                    st_mnr_tax_amount if apply_igst else float(0)
                                ),
                                "total_amount": each.rec_amount,
                            }
                        )
                    bill_date = (
                        None
                        if is_multiple_container
                        else CustomerBill.objects.get(
                            pk=invoice_line.first().bill_id
                        ).bill_date
                    )

                    result = {}
                    keys = [
                        "qty",
                        "amount",
                        "taxable_amount",
                        "cgst_amount",
                        "sgst_amount",
                        "igst_amount",
                        "total_amount",
                    ]
                    uom_keys = [
                        "uom",
                        "qty",
                        "amount",
                        "taxable_amount",
                        "cgst_amount",
                        "sgst_amount",
                        "igst_amount",
                        "total_amount",
                    ]

                    if bill_type not in ["Handling", "Night Charge"]:
                        keys.append("rate")
                        uom_keys.append("rate")

                    for item in invoice_line_data:
                        uom = item["uom"]
                        if uom in result:
                            for key in keys:
                                result[uom][key] += item[key]
                        else:
                            result[uom] = {key: item[key] for key in uom_keys}

                    new_list = list(result.values())

                    total_amount = float(0)

                    for each in new_list:
                        total_amount += float(each["total_amount"])
                        if bill_type == "Handling" or bill_type == "Night Charge":
                            each["rate"] = (
                                size_20_rate if each["uom"] == "20" else size_40_rate
                            )
                        if bill_type == "Handling":
                            each["charge_type"] = (
                                f"MNR (Lift-On & Lift-Off) {container}"
                            )
                        elif bill_type == "Night Charge":
                            each["charge_type"] = f"Night Charge {container}"
                        else:
                            each["charge_type"] = f"MNR {container}"

                        # each["charge_type"] = (
                        #     f"MNR (Lift-On & Lift-Off) {container}"
                        #     if bill_type == "Handling"
                        #     else f"MNR {container}"
                        # )
                        each["hsn_code"] = invoice.hsn_code
                        each["disc"] = (
                            discount or "0" if bill_type == "Handling" else "0"
                        )
                        each["cgst_rate"] = (
                            "0%" if each["cgst_amount"] == float(0) else "9%"
                        )
                        each["sgst_rate"] = (
                            "0%" if each["sgst_amount"] == float(0) else "9%"
                        )
                        each["igst_rate"] = (
                            "0%" if each["igst_amount"] == float(0) else "18%"
                        )

                    if bill_type == "Handling" and night_charge_data:
                        for each in night_charge_data:
                            total_amount += float(each["total_amount"])
                            if bill_type == "Handling":
                                each["rate"] = (
                                    night_charge_size_20_rate
                                    if each["uom"] == "20"
                                    else night_charge_size_40_rate
                                )
                            if bill_type == "Handling":
                                each["charge_type"] = f"Night Charge"

                            each["hsn_code"] = invoice.hsn_code
                            each["disc"] = (
                                discount or "0" if bill_type == "Handling" else "0"
                            )
                            each["cgst_rate"] = (
                                "0%" if each["cgst_amount"] == float(0) else "9%"
                            )
                            each["sgst_rate"] = (
                                "0%" if each["sgst_amount"] == float(0) else "9%"
                            )
                            each["igst_rate"] = (
                                "0%" if each["igst_amount"] == float(0) else "18%"
                            )
                        for each in night_charge_data:
                            new_list.append(each)

                    for each in new_list:
                        each["amount"] = round(each["amount"], 2)
                        each["taxable_amount"] = round(each["taxable_amount"], 2)
                        each["cgst_amount"] = round(each["cgst_amount"], 2)
                        each["sgst_amount"] = round(each["sgst_amount"], 2)
                        each["igst_amount"] = round(each["igst_amount"], 2)
                        each["total_amount"] = round(each["total_amount"], 2)
                        each["rate"] = round(each["rate"], 2)

                overall_tax_amount = float(total_amount) - (
                    float(total_amount) / gst_18
                )
                overall_taxable_amount = float(total_amount) / gst_18

                context = self.get_context_data(
                    invoice=invoice,
                    location_icon=location_icon,
                    location=location,
                    site=site,
                    bill_to_party_client=bill_to_party_client,
                    ship_to_party_client=ship_to_party_client,
                    overall_taxable_amount=overall_taxable_amount,
                    overall_tax_amount=overall_tax_amount,
                    total_amount=total_amount,
                    new_list=new_list,
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
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class GetBillingStatement(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_handling_data(
        self,
        location_str,
        invoice_date_str,
        gst_no_str,
        invoice_no_str,
        party_name_str,
        apply_igst,
        invoice_line,
        user_data_dict,
        discount,
    ):
        invoice_line_data = []
        context = {
            "company_name": user_data_dict["company_name"],
            "company_address": user_data_dict["company_address"],
        }
        total_original_amount = float(0)
        total_received_amount = float(0)
        for each in invoice_line:
            bill = CustomerBill.objects.get(pk=each.bill_id)
            lolo = Handling.objects.select_related(
                "container__site", "container__size"
            ).get(pk=bill.lolo_id)
            taxable_amount = (
                lolo.container.site.size_20_rate
                if lolo.container.size.name == "20"
                else lolo.container.site.size_40_rate
            )
            in_out_date = None
            if bill.lolo_id is not None:
                if GateInHistory.objects.filter(lolo__pk=bill.lolo_id).exists():
                    in_history = GateInHistory.objects.select_related(
                        "container", "gate_in"
                    ).get(lolo__pk=bill.lolo_id)

                    in_out_date = in_history.gate_in.in_date
                else:
                    out_history = GateOutHistory.objects.select_related(
                        "container", "gate_out"
                    ).get(lolo__pk=bill.lolo_id)
                    in_out_date = out_history.gate_out.out_date

            lolo_tax = float(taxable_amount) * 0.18
            received_amt = float(taxable_amount) + lolo_tax
            original_amt = received_amt

            total_received_amount += received_amt
            total_original_amount += float(original_amt)
            invoice_line_data.append(
                {
                    "location": location_str,
                    "invoice_date": invoice_date_str,
                    "container_no": each.container_no,
                    "gate_in_out_date": (
                        in_out_date.strftime("%d/%m/%Y") if in_out_date else ""
                    ),
                    "gst_no": gst_no_str,
                    "invoice_no": invoice_no_str,
                    "party_name": party_name_str,
                    "payment_type": CustomerBill.objects.get(
                        pk=each.bill_id
                    ).payment_type,
                    "taxable_amount": round(taxable_amount, 2),
                    "cgst_amount": (
                        float(0) if apply_igst else round((lolo_tax / float(2)), 2)
                    ),
                    "sgst_amount": (
                        float(0) if apply_igst else round((lolo_tax / float(2)), 2)
                    ),
                    "igst_amount": round(lolo_tax, 2) if apply_igst else float(0),
                    "received_amount": round(received_amt, 2),
                    "original_amount": round(original_amt, 2),
                }
            )

        context["invoice_lines"] = invoice_line_data
        context["total_original_amount"] = round(total_original_amount)
        context["total_received_amount"] = round(total_received_amount)
        context["total_remaining_amount"] = 0

        return context

    def get_invoice_line_data(
        self,
        location_str,
        invoice_date_str,
        gst_no_str,
        invoice_no_str,
        party_name_str,
        apply_igst,
        invoice_line,
        user_data_dict,
    ):
        invoice_line_data = []
        context = {
            "company_name": user_data_dict["company_name"],
            "company_address": user_data_dict["company_address"],
        }
        total_original_amount = float(0)
        total_received_amount = float(0)
        for each in invoice_line:
            bill = CustomerBill.objects.get(pk=each.bill_id)

            container = None
            in_out_date = None
            if bill.lolo_id is not None:
                if GateInHistory.objects.filter(lolo__pk=bill.lolo_id).exists():
                    in_history = GateInHistory.objects.get(lolo__pk=bill.lolo_id)
                    container = in_history.container
                    in_out_date = in_history.gate_in.in_date
                else:
                    out_history = GateOutHistory.objects.get(lolo__pk=bill.lolo_id)
                    container = out_history.container
                    in_out_date = out_history.gate_out.out_date
            if bill.st_id is not None:
                if GateInHistory.objects.filter(st__pk=bill.st_id).exists():
                    in_history = GateInHistory.objects.get(st__pk=bill.st_id)
                    container = in_history.container
                    in_out_date = in_history.gate_in.in_date
                else:
                    out_history = GateOutHistory.objects.get(st__pk=bill.st_id)
                    container = out_history.container
                    in_out_date = out_history.gate_out.out_date
            tax_amount = float(each.rec_amount) - (float(each.rec_amount) / float(1.18))
            total_received_amount = total_received_amount + float(each.rec_amount)
            total_original_amount = total_original_amount + float(each.original_amount)
            invoice_line_data.append(
                {
                    "location": location_str,
                    "invoice_date": invoice_date_str,
                    "container_no": each.container_no,
                    "gate_in_out_date": (
                        in_out_date.strftime("%d/%m/%Y") if in_out_date else ""
                    ),
                    "gst_no": gst_no_str,
                    "invoice_no": invoice_no_str,
                    "party_name": party_name_str,
                    "payment_type": CustomerBill.objects.get(
                        pk=each.bill_id
                    ).payment_type,
                    "taxable_amount": round(float(each.rec_amount) / float(1.18), 2),
                    "cgst_amount": (
                        float(0) if apply_igst else round((tax_amount / float(2)), 2)
                    ),
                    "sgst_amount": (
                        float(0) if apply_igst else round((tax_amount / float(2)), 2)
                    ),
                    "igst_amount": round(tax_amount, 2) if apply_igst else float(0),
                    "received_amount": float(each.rec_amount),
                    "original_amount": float(each.original_amount),
                }
            )

        context["invoice_lines"] = invoice_line_data
        context["total_original_amount"] = round(total_original_amount, 2)
        context["total_received_amount"] = round(total_received_amount, 2)
        total_remaining_amount = float(round(total_original_amount, 2)) - float(
            round(total_received_amount, 2)
        )
        context["total_remaining_amount"] = total_remaining_amount

        return context

    # def get_headers_field(self, bill_type):
    #     if bill_type in ["Repair", "Washing/Cleaning"]:
    #         return [
    #             "sl_no",
    #             "container_no",
    #             "type",
    #             "client_name",
    #             "container_type",
    #             "container_size",
    #             "billing_date",
    #             "labour_hours",
    #             "labour_cost",
    #             "material_cost",
    #             "cleaning_cost",
    #             "amount",
    #             "name",
    #             "doref",
    #             "line",
    #         ]
    #     else:
    #         return [
    #             "sl_no",
    #             "location",
    #             "invoice_date",
    #             "container_no",
    #             "gate_in_out_date",
    #             "gst_no",
    #             "invoice_no",
    #             "party_name",
    #             "payment_type",
    #             "taxable_amount",
    #             "cgst_amount",
    #             "sgst_amount",
    #             "igst_amount",
    #             "received_amount",
    #             "original_amount",
    #         ]

    # def get_df_data(self, invoice_line_data, bill_type):

    #     fields = self.get_headers_field(bill_type)
    #     df_data = pd.DataFrame(invoice_line_data, columns=fields)
    #     if bill_type in ["Repair", "Washing/Cleaning"]:
    #         amount_sum = df_data["amount"].sum()
    #     else:
    #         total_original_sum = df_data["original_amount"].sum()
    #         total_received_sum = df_data["received_amount"].sum()
    #         total_remaining_amount = total_original_sum - total_received_sum

    #     # For two empty rows
    #     for _ in range(4):
    #         empty_row = pd.Series(["" for _ in range(len(fields))], index=fields)
    #         df_data = df_data.append(empty_row, ignore_index=True)

    #     if bill_type in ["Repair", "Washing/Cleaning"]:
    #         df_data.at[df_data.index[-1], "material_cost"] = "TOTAL"
    #         df_data.at[df_data.index[-1], "amount"] = amount_sum
    #     else:
    #         df_data.at[df_data.index[-3], "igst_amount"] = "TOTAL ORIGINAL AMOUNT"
    #         df_data.at[df_data.index[-3], "original_amount"] = total_original_sum
    #         df_data.at[df_data.index[-2], "igst_amount"] = "TOTAL RECEIVED AMOUNT"
    #         df_data.at[df_data.index[-2], "original_amount"] = total_received_sum
    #         df_data.at[df_data.index[-1], "igst_amount"] = "TOTAL REMAINING AMOUNT"
    #         df_data.at[df_data.index[-1], "original_amount"] = total_remaining_amount

    #     if df_data.empty:
    #         df_data = df_data.append(
    #             pd.Series(["" for _ in range(len(fields))], index=fields),
    #             ignore_index=True,
    #         )

    #     return df_data.values.tolist()

    def convert_to_float(self, value):
        return float(value) if value != "" else float(0)

    def get_invoice_line_data_mnr(self, invoice_line, invoice, user_data_dict):
        invoice_line_data = []
        context = {
            "company_name": user_data_dict["company_name"],
            "company_address": user_data_dict["company_address"],
            "location": user_data_dict["location"],
        }

        bill_ids = [
            item for each in invoice_line for item in ast.literal_eval(each.bill_ids)
        ]

        bills = CustomerBill.objects.filter(pk__in=bill_ids).values(
            "survey_id", "container_no", "bill_type", "original_amount"
        )

        for each in bills:
            labour_cost = 0
            material_cost = 0
            cleaning_cost = 0
            survey_line = SurveyLine.objects.filter(
                parent__pk=each["survey_id"]
            ).values("labour_cost", "material_cost", "wash_clean_tariff")
            for each_survey in survey_line:
                if each_survey["wash_clean_tariff"] == 0:
                    labour_cost += each_survey["labour_cost"]
                    material_cost += each_survey["material_cost"]
                else:
                    cleaning_cost += each_survey["material_cost"]

            model = Container if invoice.site.type == "DEPOT" else NonDepotContainer

            container = (
                model.objects.select_related("type", "size")
                .filter(
                    container_no=each["container_no"],
                    location=invoice.location,
                    site=invoice.site,
                )
                .values(
                    "size__name",
                    "type__name",
                )
                .first()
            )
            invoice_line_data.append(
                {
                    "container_no": each["container_no"],
                    "line": invoice.client.name,
                    "container_size": f"{container['size__name']}{container['type__name']}",
                    "labour_cost": labour_cost if each["bill_type"] == "Repair" else "",
                    "material_cost": (
                        material_cost if each["bill_type"] == "Repair" else ""
                    ),
                    "cleaning_cost": (
                        cleaning_cost if each["bill_type"] == "Washing/Cleaning" else ""
                    ),
                    "amount": each["original_amount"],
                }
            )
        context["invoice_lines"] = invoice_line_data
        total_labour_cost = float(0)
        total_material_cost = float(0)
        total_cleaning_cost = float(0)
        total_amount = float(0)
        for each in invoice_line_data:
            labour_cost_sum = self.convert_to_float(each["labour_cost"])
            material_cost_sum = self.convert_to_float(each["material_cost"])
            cleaning_cost_sum = self.convert_to_float(each["cleaning_cost"])
            amount_sum = self.convert_to_float(each["amount"])
            total_labour_cost += labour_cost_sum
            total_material_cost += material_cost_sum
            total_cleaning_cost += cleaning_cost_sum
            total_amount += amount_sum

        context["total_labour_cost"] = round(total_labour_cost, 2)
        context["total_material_cost"] = round(total_material_cost, 2)
        context["total_cleaning_cost"] = round(total_cleaning_cost, 2)
        context["total_amount"] = round(total_amount, 2)

        return context

    def get(self, request, pk, *args, **kwargs):
        try:
            invoice = CustomerBillInvoice.objects.get(pk=pk)
            discount = invoice.discount
            bill_type = invoice.bill_type

            location_str = invoice.location.name
            location = invoice.location
            site = invoice.site

            user_data_dict = user_data(location=invoice.location, site=invoice.site)
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
                invoice_line_data = self.get_invoice_line_data_mnr(
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
                invoice_line_data = self.get_handling_data(
                    location_str,
                    invoice_date_str,
                    gst_no_str,
                    invoice_no_str,
                    party_name_str,
                    apply_igst,
                    invoice_line,
                    user_data_dict,
                    discount,
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
                invoice_line_data = self.get_invoice_line_data(
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
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class BillingStatementExcelFormat(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get_invoice_line_data(self, lines, data, bill_type, parent):
        invoice_date_str = parent.invoice_date.strftime("%d/%m/%Y")
        parent_location = parent.location.name
        parent_invoice_no = parent.invoice_no
        is_igst_applied = parent.apply_igst
        party_name = parent.bill_to_party_client.name
        main_data = {
            "Sr.No": [],
            "Location": [],
            "Invoice Date": [],
            "Container No": [],
            "Gate IN OUT Date": [],
            "GST No": [],
            "Invoice No": [],
            "Party Name": [],
            "Payment Type": [],
            "Taxable Amount": [],
            "CGST Amount": [],
            "SGST Amount": [],
            "IGST Amount": [],
            "Received Amount": [],
            "Original Amount": [],
        }
        total_original_amount = float(0)
        total_received_amount = float(0)

        for count, (line, each) in enumerate(zip(lines, data), start=1):
            if bill_type in ["Handling", "Night Charge"]:
                if GateInHistory.objects.filter(lolo=each).exists():
                    in_history = GateInHistory.objects.select_related(
                        "container", "gate_in"
                    ).get(lolo=each)

                    in_out_date = in_history.gate_in.in_date.strftime("%d/%m/%Y")
                else:
                    out_history = GateOutHistory.objects.select_related(
                        "container", "gate_out"
                    ).get(lolo=each)
                    in_out_date = out_history.gate_out.out_date.strftime("%d/%m/%Y")
            elif bill_type in ["Transportation"]:
                if GateInHistory.objects.filter(st=each).exists():
                    in_history = GateInHistory.objects.select_related(
                        "container", "gate_in"
                    ).get(st=each)

                    in_out_date = in_history.gate_in.in_date.strftime("%d/%m/%Y")
                else:
                    out_history = GateOutHistory.objects.select_related(
                        "container", "gate_out"
                    ).get(st=each)
                    in_out_date = out_history.gate_out.out_date.strftime("%d/%m/%Y")

            bill = CustomerBill.objects.get(pk=line["bill_id"])
            if bill_type in ["Handling"]:
                taxable_amount = (
                    float(each.container.site.size_20_rate)
                    if each.container.size.name == "20"
                    else float(each.container.site.size_40_rate)
                )
                tax_amount = taxable_amount * 0.18
            elif bill_type in ["Night Charge", "Transportation"]:
                taxable_amount = float(line["rec_amount"]) / 1.18
                tax_amount = float(line["rec_amount"]) - taxable_amount
            cgst_sgst = 0 if is_igst_applied else round(tax_amount / 2, 2)
            igst = round(tax_amount, 2) if is_igst_applied else 0
            received_amt = taxable_amount + tax_amount

            main_data["Sr.No"].append(count)
            main_data["Location"].append(parent_location)
            main_data["Invoice Date"].append(invoice_date_str)
            main_data["Container No"].append(line["container_no"])
            main_data["Gate IN OUT Date"].append(in_out_date)
            main_data["GST No"].append("")
            main_data["Invoice No"].append(parent_invoice_no)
            main_data["Party Name"].append(party_name)
            main_data["Payment Type"].append(bill.payment_type)
            main_data["Taxable Amount"].append(round(taxable_amount, 2))
            main_data["CGST Amount"].append(cgst_sgst)
            main_data["SGST Amount"].append(cgst_sgst)
            main_data["IGST Amount"].append(igst)
            main_data["Received Amount"].append(round(received_amt, 2))
            main_data["Original Amount"].append(round(received_amt, 2))
            total_received_amount += received_amt
            total_original_amount += received_amt
        for _ in range(4):
            main_data["Sr.No"].append("")
            main_data["Location"].append("")
            main_data["Invoice Date"].append("")
            main_data["Container No"].append("")
            main_data["Gate IN OUT Date"].append("")
            main_data["GST No"].append("")
            main_data["Invoice No"].append("")
            main_data["Party Name"].append("")
            main_data["Payment Type"].append("")
            main_data["Taxable Amount"].append("")
            main_data["CGST Amount"].append("")
            main_data["SGST Amount"].append("")
            main_data["IGST Amount"].append("")
            main_data["Received Amount"].append(
                ""
                if _ == 0
                else (
                    "TOTAL INVOICE AMOUNT"
                    if _ == 1
                    else (
                        "TOTAL RECEIVED AMOUNT" if _ == 2 else "TOTAL REMAINING AMOUNT"
                    )
                )
            )
            main_data["Original Amount"].append(
                ""
                if _ == 0
                else (
                    round(total_original_amount)
                    if _ == 1
                    else round(total_received_amount) if _ == 2 else 0
                )
            )
        return main_data

    def get_mnr_lines_data(self, data, parent):
        main_data = {
            "Sr.No": [],
            "Container No": [],
            "Size": [],
            "Line": [],
            "Labour Cost": [],
            "Material Cost": [],
            "Washing Cost": [],
            "Total Cost": [],
        }
        for count, each in enumerate(data, start=1):
            labour_cost = 0
            material_cost = 0
            cleaning_cost = 0
            survey_line = SurveyLine.objects.filter(
                parent__pk=each["survey_id"]
            ).values("labour_cost", "material_cost", "wash_clean_tariff")
            for each_survey in survey_line:
                if each_survey["wash_clean_tariff"] == 0:
                    labour_cost += each_survey["labour_cost"]
                    material_cost += each_survey["material_cost"]
                else:
                    cleaning_cost += each_survey["material_cost"]

            model = Container if parent.site.type == "DEPOT" else NonDepotContainer

            container = (
                model.objects.select_related("type", "size")
                .filter(
                    container_no=each["container_no"],
                    location=parent.location,
                    site=parent.site,
                )
                .values(
                    "size__name",
                    "type__name",
                )
                .first()
            )

            main_data["Sr.No"].append(count)
            main_data["Container No"].append(each["container_no"])
            main_data["Size"].append(
                f"{container['size__name']}{container['type__name']}"
            )
            main_data["Line"].append(parent.client.name)
            main_data["Labour Cost"].append(
                labour_cost if each["bill_type"] == "Repair" else 0
            )
            main_data["Material Cost"].append(
                (material_cost if each["bill_type"] == "Repair" else 0)
            )
            main_data["Washing Cost"].append(
                (cleaning_cost if each["bill_type"] == "Washing/Cleaning" else 0)
            )
            main_data["Total Cost"].append(each["original_amount"])

        total_labour_cost = sum(main_data["Labour Cost"])
        total_material_cost = sum(main_data["Material Cost"])
        total_cleaning_cost = sum(main_data["Washing Cost"])
        total_amount = sum(main_data["Total Cost"])

        for _ in range(2):
            main_data["Sr.No"].append("")
            main_data["Container No"].append("")
            main_data["Size"].append("")
            main_data["Line"].append("" if _ == 0 else "Total")
            main_data["Labour Cost"].append(
                "" if _ == 0 else round(total_labour_cost, 2)
            )
            main_data["Material Cost"].append(
                "" if _ == 0 else round(total_material_cost, 2)
            )
            main_data["Washing Cost"].append(
                "" if _ == 0 else round(total_cleaning_cost, 2)
            )
            main_data["Total Cost"].append("" if _ == 0 else round(total_amount, 2))

        return main_data

    def get(self, request, pk, *args, **kwargs):
        try:

            parent = CustomerBillInvoice.objects.select_related(
                "location", "bill_to_party_client"
            ).get(pk=pk)

            bill_type = parent.bill_type

            if bill_type in ["Handling", "Night Charge"]:
                lines = CustomerBillInvoiceLine.objects.filter(parent=parent).values(
                    "bill_id", "rec_amount", "container_no"
                )
                bill_ids = [line["bill_id"] for line in lines]
                lolo_ids = [
                    bill["lolo_id"]
                    for bill in CustomerBill.objects.filter(pk__in=bill_ids).values(
                        "lolo_id"
                    )
                ]
                data = Handling.objects.select_related(
                    "container__site", "container__size"
                ).filter(pk__in=lolo_ids)

            elif bill_type in ["Transportation"]:
                lines = CustomerBillInvoiceLine.objects.filter(parent=parent).values(
                    "bill_id", "rec_amount", "container_no"
                )
                bill_ids = [line["bill_id"] for line in lines]
                st_ids = [
                    bill["st_id"]
                    for bill in CustomerBill.objects.filter(pk__in=bill_ids).values(
                        "st_id"
                    )
                ]
                data = SelfTransportation.objects.select_related(
                    "container__site", "container__size"
                ).filter(pk__in=st_ids)
            else:
                lines = MNRInvoiceLine.objects.filter(parent=parent)
                bill_ids = [
                    each for line in lines for each in ast.literal_eval(line.bill_ids)
                ]
                data = CustomerBill.objects.filter(pk__in=bill_ids).values(
                    "survey_id", "container_no", "bill_type", "original_amount"
                )

            if bill_type in ["Repair", "Washing/Cleaning"]:
                main_data = self.get_mnr_lines_data(data, parent)
            else:
                main_data = self.get_invoice_line_data(lines, data, bill_type, parent)

            temp_file_path = create_billing_statement_excel(
                main_data, type="billing_statement"
            )

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="billing_statement.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)
