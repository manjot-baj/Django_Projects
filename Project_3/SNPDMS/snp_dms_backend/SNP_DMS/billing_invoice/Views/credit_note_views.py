# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.functions import pagination_func
import traceback, logging, datetime
from django.utils import timezone
from billing_invoice.functions import (
    get_credit_note_no,
    get_financial_year,
)
import ast
from django.db import transaction
from num2words import num2words
from django.utils import formats
from wkhtmltopdf.views import PDFTemplateResponse


# model imports
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoice,
    MNRInvoiceLine,
    CustomerBillInvoiceLine,
    CreditNote,
)
from mnr.models import Survey
from depot.models import GateInHistory, GateOutHistory


class GetInvoicesByInvoiceNumber(views.APIView):
    permission_classes = (IsAuthenticated,)

    def getParams(self, payload):
        params = {
            "invoice_no": payload.get("invoice_number"),
            "location__name": payload.get("location"),
            "site__name": payload.get("site"),
        }
        return params

    def getMNRData(self, invoice):
        bill_ids_in_char = MNRInvoiceLine.objects.filter(parent=invoice).values_list(
            "bill_ids", flat=True
        )
        bill_ids = []
        for each in bill_ids_in_char:
            ids = ast.literal_eval(each)
            bill_ids.extend(ids)

        bills = CustomerBill.objects.filter(
            pk__in=bill_ids, credit_note_mnr=False
        ).values("pk", "container_no", "client__name", "original_amount", "bill_type")
        return [
            {
                "pk": each["pk"],
                "container_no": each["container_no"],
                "client": each["client__name"],
                "original_amount": each["original_amount"],
                "bill_type": each["bill_type"],
            }
            for each in bills
        ]

    def getOtherData(self, invoice):
        line = CustomerBillInvoiceLine.objects.filter(
            parent=invoice, credit_note=False
        ).values(
            "pk",
            "container_no",
            "parent__client__name",
            "original_amount",
            "parent__bill_type",
        )
        return [
            {
                "pk": each["pk"],
                "container_no": each["container_no"],
                "client": each["parent__client__name"],
                "original_amount": each["original_amount"],
                "bill_type": each["parent__bill_type"],
            }
            for each in line
        ]

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            invoice = CustomerBillInvoice.objects.get(**params)
            if request.data.get("bill_type") == "Repair/Washing":
                if MNRInvoiceLine.objects.filter(parent=invoice).exists():
                    main_data = self.getMNRData(invoice)

                    return Response({"data": main_data})

            elif request.data.get("bill_type") == "Other":
                if CustomerBillInvoiceLine.objects.filter(parent=invoice).exists():
                    main_data = self.getOtherData(invoice)

                    return Response({"data": main_data})

            return Response({"data": []})
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class CollectCreditNoteData(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            pk_list = request.data.get("pk_list", [])
            invoices = CustomerBillInvoiceLine.objects.filter(pk__in=pk_list)
            credit_note_lines = []
            total_amount = float(0)
            invoice_pk_list = []
            for each in invoices:
                credit_note_lines.append(
                    {
                        "pk": each.pk,
                        "container_no": each.container_no,
                        "amount": each.original_amount,
                        "bill_type": each.parent.bill_type,
                    }
                )
                total_amount += float(each.original_amount)
                invoice_pk_list.append(each.pk)

            parent = invoices.first().parent
            data = {
                "bill_to_party_client": (
                    parent.bill_to_party_client.name
                    if parent.bill_to_party_client
                    else ""
                ),
                "ship_to_party_client": (
                    parent.ship_to_party_client.name
                    if parent.ship_to_party_client
                    else ""
                ),
                "main_client": parent.client.name,
                "credit_note_no": "0000",
                "bill_type": parent.bill_type,
                "location": parent.location.name,
                "site": parent.site.name,
                "apply_igst": parent.apply_igst,
                "hsn_code": parent.hsn_code,
                "ref_booking_no": parent.ref_booking_no,
                "ref_bl_no": parent.ref_bl_no,
                "place_of_supply": parent.place_of_supply,
                "supply_date": (
                    parent.supply_date.strftime("%d/%m/%Y")
                    if parent.supply_date
                    else ""
                ),
                "credit_note_date": datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y"),
                "remark": "",
                "total_amount": total_amount,
                "discount": parent.discount,
                "credit_note_label": get_credit_note_no(parent.site, parent.bill_type),
                "credit_note_lines": credit_note_lines,
                "invoice_pk": parent.pk,
                "pk_list": invoice_pk_list,
            }

            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class CollectCreditNoteDataMNR(views.APIView):

    permission_classes = (IsAuthenticated,)

    def getCreditNoteLines(self, bills):
        credit_note_lines = []
        total_amount = float(0)
        bills_pk_list = []

        for each in bills:
            credit_note_lines.append(
                {
                    "pk": each.pk,
                    "container_no": each.container_no,
                    "amount": each.original_amount,
                    "bill_type": each.bill_type,
                }
            )
            bills_pk_list.append(each.pk)
            total_amount += float(each.original_amount)
        return credit_note_lines, total_amount, bills_pk_list

    def post(self, request, *args, **kwargs):
        try:

            pk_list = request.data.get("pk_list", [])

            bills = CustomerBill.objects.filter(pk__in=pk_list)

            credit_note_lines, total_amount, bills_pk_list = self.getCreditNoteLines(
                bills
            )

            invoice_id = bills.first().mnr_invoice_id
            parent = CustomerBillInvoice.objects.get(pk=invoice_id)

            data = {
                "bill_to_party_client": (
                    parent.bill_to_party_client.name
                    if parent.bill_to_party_client
                    else ""
                ),
                "ship_to_party_client": (
                    parent.ship_to_party_client.name
                    if parent.ship_to_party_client
                    else ""
                ),
                "main_client": parent.client.name,
                "credit_note_no": "0000",
                "bill_type": parent.bill_type,
                "location": parent.location.name,
                "site": parent.site.name,
                "apply_igst": parent.apply_igst,
                "hsn_code": parent.hsn_code,
                "ref_booking_no": parent.ref_booking_no,
                "ref_bl_no": parent.ref_bl_no,
                "place_of_supply": parent.place_of_supply,
                "supply_date": (
                    parent.supply_date.strftime("%d/%m/%Y")
                    if parent.supply_date
                    else ""
                ),
                "credit_note_date": datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y"),
                "remark": "",
                "total_amount": total_amount,
                "discount": parent.discount,
                "credit_note_label": get_credit_note_no(parent.site, parent.bill_type),
                "credit_note_lines": credit_note_lines,
                "invoice_pk": parent.pk,
                "pk_list": bills_pk_list,
            }
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class BuildCreditNote(views.APIView):

    permission_classes = (IsAuthenticated,)

    def getParams(self, payload):
        fin_year = get_financial_year()
        credit_note_no = (
            f"{payload.get('credit_note_label')}{payload.get('credit_note_no')}"
        )
        bill_type = payload.get("bill_type")
        credit_note_date = payload.get("credit_note_date")
        total_amount = payload.get("total_amount")
        remark = payload.get("remark")
        invoice = CustomerBillInvoice.objects.get(pk=payload.get("invoice_pk"))
        params = {
            "credit_note_no": credit_note_no,
            "bill_type": bill_type,
            "credit_note_date": datetime.datetime.strptime(
                credit_note_date, "%d/%m/%Y"
            ).date(),
            "total_amount": total_amount,
            "remark": remark,
            "invoice": invoice,
            "financial_year": fin_year,
        }
        return params

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                params = self.getParams(request.data)

                if CreditNote.objects.filter(
                    credit_note_no=params["credit_note_no"],
                    invoice__location=params["invoice"].location,
                    invoice__site=params["invoice"].site,
                ).exists():
                    return Response(
                        {"errorMsg": "Credit Note with same number already exists."},
                        status=403,
                    )

                obj = CreditNote.objects.create(**params)

                if params["bill_type"] in ["Repair", "Washing/Cleaning"]:
                    CustomerBill.objects.filter(
                        pk__in=request.data.get("pk_list")
                    ).update(credit_note_mnr=True)
                else:
                    CustomerBillInvoiceLine.objects.filter(
                        pk__in=request.data.get("pk_list")
                    ).update(credit_note=True)
            return Response(
                {"message": "Credit Note Created Successfully", "pk": obj.pk},
                status=201,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class ListCreditNotes(views.APIView):
    permission_classes = (IsAuthenticated,)

    def getParams(self, payload):
        credit_note_no = payload.get("credit_note_no")
        from_credit_note_date = payload.get("from_credit_note_date")
        to_credit_note_date = payload.get("to_credit_note_date")
        bill_type = payload.get("bill_type")
        invoice_no = payload.get("invoice_no")
        params = {
            "invoice__location__name": payload.get("location"),
            "invoice__site__name": payload.get("site"),
        }
        if credit_note_no:
            params["credit_note_no"] = credit_note_no
        if from_credit_note_date and to_credit_note_date:
            from_date = datetime.datetime.strptime(from_credit_note_date, "%d/%m/%Y")
            to_date = datetime.datetime.strptime(to_credit_note_date, "%d/%m/%Y")
            params["credit_note_date__range"] = (from_date, to_date)
        if bill_type:
            if bill_type == "MNR":
                params["bill_type__in"] = ["Repair", "Washing/Cleaning"]
            else:
                params["bill_type"] = bill_type
        if invoice_no:
            params["invoice__invoice_no"] = invoice_no
        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            credit_note = CreditNote.objects.select_related("invoice").filter(**params)
            on_page_data = request.data.get("on_page_data")
            pg_no = request.data.get("pg_no")
            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = pagination_func(credit_note, on_page_data, pg_no)

            credit_note_data = []
            for each in current_page.object_list:
                credit_note_data.append(
                    {
                        "pk": each.pk,
                        "credit_note_date": each.credit_note_date.strftime("%d/%m/%Y"),
                        "credit_note_no": each.credit_note_no,
                        "bill_type": each.bill_type,
                        "total_amount": each.total_amount,
                    }
                )
            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": credit_note_data,
                },
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class GetCreditNote(views.APIView):

    permission_classes = (IsAuthenticated,)

    def getMNRData(self, credit_note):
        bills = CustomerBill.objects.filter(
            mnr_invoice_id=credit_note.invoice.pk, credit_note_mnr=True
        )
        credit_note_lines = []
        for each in bills:
            credit_note_lines.append(
                {
                    "pk": each.pk,
                    "container_no": each.container_no,
                    "amount": each.original_amount,
                    "bill_type": each.bill_type,
                }
            )
        return credit_note_lines

    def getOtherData(self, credit_note):
        credit_note_lines = []

        lines = CustomerBillInvoiceLine.objects.filter(
            parent=credit_note.invoice, credit_note=True
        )

        for each in lines:
            credit_note_lines.append(
                {
                    "pk": each.pk,
                    "container_no": each.container_no,
                    "amount": each.original_amount,
                    "bill_type": each.parent.bill_type,
                }
            )
        return credit_note_lines

    def get(self, request, pk, *args, **kwargs):
        try:

            credit_note = CreditNote.objects.get(pk=pk)

            if credit_note.bill_type in ["Washing/Cleaning", "Repair"]:

                credit_note_lines = self.getMNRData(credit_note)

            else:
                credit_note_lines = self.getOtherData(credit_note)

            data = {
                "pk": credit_note.pk,
                "bill_to_party_client": (
                    credit_note.invoice.bill_to_party_client.name
                    if credit_note.invoice.bill_to_party_client
                    else ""
                ),
                "ship_to_party_client": (
                    credit_note.invoice.ship_to_party_client.name
                    if credit_note.invoice.ship_to_party_client
                    else ""
                ),
                "main_client": credit_note.invoice.client.name,
                "credit_note_label": credit_note.credit_note_no[:-5],
                "credit_note_no": credit_note.credit_note_no[-5:],
                "bill_type": credit_note.invoice.bill_type,
                "location": credit_note.invoice.location.name,
                "site": credit_note.invoice.site.name,
                "apply_igst": credit_note.invoice.apply_igst,
                "hsn_code": credit_note.invoice.hsn_code,
                "ref_booking_no": credit_note.invoice.ref_booking_no,
                "ref_bl_no": credit_note.invoice.ref_bl_no,
                "place_of_supply": credit_note.invoice.place_of_supply,
                "supply_date": (
                    credit_note.invoice.supply_date.strftime("%d/%m/%Y")
                    if credit_note.invoice.supply_date
                    else ""
                ),
                "credit_note_date": credit_note.credit_note_date.strftime("%d/%m/%Y"),
                "remark": credit_note.remark,
                "total_amount": credit_note.total_amount,
                "discount": credit_note.invoice.discount,
                "credit_note_lines": credit_note_lines,
                "invoice_pk": credit_note.invoice.pk,
            }
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class DownloadCreditNoteInvoice(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        try:
            credit_note = CreditNote.objects.get(pk=pk)

            hsn_code = credit_note.invoice.hsn_code

            if credit_note.bill_type in ["Washing/Cleaning", "Repair"]:

                bills = CustomerBill.objects.filter(
                    mnr_invoice_id=credit_note.invoice.pk, credit_note_mnr=True
                )
                total_amount = float(0)
                credit_line_data = []
                for each in bills:
                    survey = Survey.objects.get(pk=each.survey_id)
                    if each.site.type == "DEPOT":
                        uom_type = survey.depot.container.size.name
                    else:
                        uom_type = survey.non_depot.container.size.name

                    # credit_line_data = []

                    credit_line_data.append(
                        {
                            "uom": uom_type,
                            "hsn_code": hsn_code,
                            "qty": 1,
                            "rate": round(each.original_amount, 2),
                            "disc": "",
                            "amount": round(each.original_amount, 2),
                            "taxable_amount": round(each.original_amount, 2),
                            "cgst_amount": (float(0)),
                            "sgst_amount": (float(0)),
                            "igst_amount": float(0),
                            "total_amount": round(each.original_amount, 2),
                            "container_no": each.container_no,
                        }
                    )
                    total_amount += float(each.original_amount)
                    total_tax_amount = float(0.0)

            else:
                lines = CustomerBillInvoiceLine.objects.filter(
                    parent=credit_note.invoice, credit_note=True
                )

                total_amount = float(0)
                credit_line_data = []
                for each in lines:

                    customer_bill = CustomerBill.objects.get(pk=each.bill_id)
                    model = (
                        GateInHistory
                        if customer_bill.bill_for == "IN"
                        else GateOutHistory
                    )
                    if customer_bill.bill_type in ["Handling", "Night Charge"]:

                        obj = model.objects.get(lolo__pk=customer_bill.lolo_id)
                        uom_type = obj.container.size.name
                    elif customer_bill.bill_type == "Transportation":
                        obj = model.objects.get(st__pk=customer_bill.st_id)
                        uom_type = obj.container.size.name

                    credit_line_data.append(
                        {
                            "uom": uom_type,
                            "hsn_code": hsn_code,
                            "qty": 1,
                            "rate": round(each.original_amount, 2),
                            "disc": "",
                            "amount": round(each.original_amount, 2),
                            "taxable_amount": round(each.original_amount, 2),
                            "cgst_amount": (float(0)),
                            "sgst_amount": (float(0)),
                            "igst_amount": float(0),
                            "total_amount": round(each.original_amount, 2),
                            "container_no": each.container_no,
                        }
                    )
                    total_amount += float(each.original_amount)
                    total_tax_amount = float(0.0)

            bill_to_party_client = credit_note.invoice.bill_to_party_client
            ship_to_party_client = credit_note.invoice.ship_to_party_client
            location = credit_note.invoice.location
            site = credit_note.invoice.site
            try:
                location_icon = location.icon.url
            except:
                location_icon = None

            data = {
                "credit_note_no": credit_note.credit_note_no,
                "credit_note_date": formats.date_format(
                    credit_note.credit_note_date, "d/m/Y"
                ),
                "location_state": credit_note.invoice.location.name,
                "location_gst_no": credit_note.invoice.location.gst_no,
                "location_icon": location_icon,
                "location_state_code": (
                    credit_note.invoice.location.gst_no[:2]
                    if credit_note.invoice.location.gst_no
                    else ""
                ),
                "site_address": site.address,
                "site_contact": site.contact,
                "ref_booking_no": credit_note.invoice.ref_booking_no,
                "ref_bl_no": credit_note.invoice.ref_bl_no,
                "place_of_supply": credit_note.invoice.place_of_supply,
                "supply_date": (
                    formats.date_format(credit_note.invoice.supply_date, "d/m/Y")
                    if credit_note.invoice.supply_date
                    else ""
                ),
                "main_client": credit_note.invoice.client.name,
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
                "total_taxable_amount": round(total_amount, 2),
                "total_cgst_amount": (float(0)),
                "total_sgst_amount": (float(0)),
                "total_igst_amount": (float(0)),
                "grand_total_amount": round(total_amount),
                "grand_total_amount_word": "Rupees "
                + (str(num2words(round(total_amount))).title()).replace(",", "")
                + " Only/-",
                "total_tax_amount": round(total_tax_amount, 2),
                "credit_line": credit_line_data,
                "remark": credit_note.remark,
                "bank_name": site.bank_name if site.bank_name else "",
                "account_no": site.bank_account_no if site.bank_account_no else "",
                "ifsc_code": site.ifsc_code if site.ifsc_code else "",
                "bank_branch": site.bank_branch if site.bank_branch else "",
                "organization": site.organization if site.organization else "",
            }
            response = PDFTemplateResponse(
                request=request,
                template="billing_invoice/credit_note_invoice.html",
                filename="foo.pdf",
                context=data,
                show_content_in_browser=True,
                cmd_options={
                    "margin-top": 50,
                },
            )

            return response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


# class RemoveContainerFromCreditNote(views.APIView):

#     permission_classes = (IsAuthenticated,)

#     def put(self, request, pk,*args, **kwargs):
#         try:
#             credit_note = CreditNote.objects.get(pk=pk)

#             if credit_note.bill_type in ["Repair","Washing/Cleaning"]:

#                 CustomerBill.objects.filter(
#                     mnr_invoice_id=credit_note.invoice.pk, credit_note_mnr=True
#                 ).update(credit_note_mnr=False)
#             else:
#                 CustomerBillInvoiceLine.objects.filter(
#                     parent=credit_note.invoice, credit_note=True
#                 ).update(credit_note = False)


#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
