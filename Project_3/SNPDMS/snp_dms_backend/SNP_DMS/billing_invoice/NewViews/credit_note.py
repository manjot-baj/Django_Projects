# other imports
from wkhtmltopdf.views import PDFTemplateResponse
from datetime import datetime

# models
from billing_invoice.models import (
    CreditNote,
    CustomerBill,
    CustomerBillInvoice,
    CustomerBillInvoiceLine,
    MNRInvoiceLine,
)

# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# services
from billing_invoice.services.credit_note_service import CreditNoteService

# django
from django.utils import timezone
from django.db import transaction

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError, ResourceNotFound, AlreadyExists

from account.permissions import HasAllowedRoles


class ListCreditNotes(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def post(self, request, *args, **kwargs):
        try:

            on_page_data = request.data.get("on_page_data")
            page_no = request.data.get("pg_no")

            data = self.service.getCreditNotes(request.data, on_page_data, page_no)
            return Response(
                data,
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetCreditNote(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def get(self, request, pk, *args, **kwargs):
        try:

            credit_note = CreditNote.objects.select_related(
                "invoice",
                "invoice__bill_to_party_client",
                "invoice__ship_to_party_client",
                "invoice__location",
                "invoice__site",
            ).get(pk=pk)

            if credit_note.bill_type in ["Washing/Cleaning", "Repair"]:

                credit_note_lines = self.service.getMNRData(credit_note)

            else:
                credit_note_lines = self.service.getOtherData(credit_note)

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
                "credit_note_label": credit_note.credit_note_no[:-4],
                "credit_note_no": credit_note.credit_note_no[-4:].replace("/", ""),
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
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CollectCreditNoteDataMNR(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def post(self, request, *args, **kwargs):
        try:

            pk_list = request.data.get("pk_list", [])

            bills = CustomerBill.objects.filter(pk__in=pk_list)

            credit_note_lines, total_amount, bills_pk_list = (
                self.service.getCreditNoteLinesMNR(bills)
            )

            invoice_id = bills.first().mnr_invoice_id
            parent = CustomerBillInvoice.objects.select_related(
                "bill_to_party_client",
                "ship_to_party_client",
                "client",
                "location",
                "site",
            ).get(pk=invoice_id)
            site = parent.site
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
                "credit_note_date": datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y"),
                "remark": "",
                "total_amount": total_amount,
                "discount": parent.discount,
                "credit_note_label": self.service.getCreditNoteNo(site),
                "credit_note_lines": credit_note_lines,
                "invoice_pk": parent.pk,
                "pk_list": bills_pk_list,
            }
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


class CollectCreditNoteData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def post(self, request, *args, **kwargs):
        try:
            pk_list = request.data.get("pk_list", [])
            invoices = CustomerBillInvoiceLine.objects.filter(pk__in=pk_list)

            credit_note_lines, total_amount, invoice_pk_list = (
                self.service.getCreditNoteLines(invoices)
            )
            parent = invoices.first().parent
            site = parent.site
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
                "credit_note_date": datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y"),
                "remark": "",
                "total_amount": total_amount,
                "discount": parent.discount,
                "credit_note_label": self.service.getCreditNoteNo(site),
                "credit_note_lines": credit_note_lines,
                "invoice_pk": parent.pk,
                "pk_list": invoice_pk_list,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetInvoicesByInvoiceNumber(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def getParams(self, payload):
        params = {
            "invoice_no": payload.get("invoice_number"),
            "location__name": payload.get("location"),
            "site__name": payload.get("site"),
        }
        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            invoice = CustomerBillInvoice.objects.get(**params)
            if request.data.get("bill_type") == "Repair/Washing":
                if MNRInvoiceLine.objects.filter(parent=invoice).exists():
                    main_data = self.service.getMNRInvoiceData(invoice)

                    return Response({"data": main_data}, status=status.HTTP_200_OK)

            elif request.data.get("bill_type") == "Other":
                if CustomerBillInvoiceLine.objects.filter(parent=invoice).exists():
                    main_data = self.service.getOtherInvoiceData(invoice)

                    return Response({"data": main_data}, status=status.HTTP_200_OK)

            else:
                raise ResourceNotFound("Invoice not found")

        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BuildCreditNote(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def getParams(self, payload):
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
            "credit_note_date": datetime.strptime(credit_note_date, "%d/%m/%Y").date(),
            "total_amount": total_amount,
            "remark": remark,
            "invoice": invoice,
            "financial_year": invoice.financial_year,
        }
        return params

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                if (
                    len(request.data["credit_note_no"]) > 4
                    or len(request.data["credit_note_no"]) < 4
                ):
                    raise ValidationError(f"credit_note_no should be of 4 digits")

                params = self.getParams(request.data)

                if CreditNote.objects.filter(
                    credit_note_no=params["credit_note_no"],
                    invoice__location=params["invoice"].location,
                    invoice__site=params["invoice"].site,
                ).exists():
                    raise AlreadyExists("Credit Note with same number already exists.")

                obj = self.service.createCreditNote(params, request.data)

            return Response(
                {"message": "Credit Note Created Successfully", "pk": obj.pk},
                status=status.HTTP_201_CREATED,
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
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


class DownloadCreditNoteInvoice(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CreditNoteService()

    def get(self, request, pk, *args, **kwargs):
        try:
            credit_note = CreditNote.objects.get(pk=pk)
            data = self.service.buildDataForCreditNoteInvoice(credit_note)

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
