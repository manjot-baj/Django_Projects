# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# django
from django.db import transaction

# models
from billing_invoice.models import (
    CustomerBillInvoice,
)
from master.models import Location, Site
from master.models_two import Client

# services
from billing_invoice.services.mnr_invoice_service import MNRInvoiceService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError, AlreadyExists
from account.permissions import HasAllowedRoles


class ListMNRInvoices(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = MNRInvoiceService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]

            data = self.service.getMNRInvoices(request.data, on_page_data, pg_no)

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # class GetMNRInvoice(APIView):
    #     permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]


#     service = MNRInvoiceService()

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             data = self.service.getMNRInvoiceData(pk)
#             return Response(data, status=status.HTTP_200_OK)

#         except ValidationError as e:
#             return Response(
#                 {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
#             )

#         except Exception as e:
#             ErrorLogging().log_error()
#             return Response(
#                 {"errorMsg": "An unexpected error occurred. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )


class BuildMNRInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = MNRInvoiceService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
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
                raise AlreadyExists(
                    f"Invoice no {data['invoice_label']}{data['invoice_no']} already exists"
                )
            if len(data["invoice_no"]) > 4 or len(data["invoice_no"]) < 4:
                raise ValidationError(f"Invoice no should be of 4 digits")
            with transaction.atomic():
                customer_bill = self.service.createInvoiceLine(
                    data, client, location, site
                )

            return Response(
                {
                    "successMsg": "Invoice successfully created",
                    "invoice_pk": customer_bill.pk,
                },
                status=status.HTTP_201_CREATED,
            )

        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateMNRInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = MNRInvoiceService()

    def get(self, request, pk, *args, **kwargs):
        try:
            data = self.service.getMNRInvoiceData(pk)
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

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
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
                self.service.updateInvoice(data, client, location, site, customer_bill)

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


class DeleteMNRInvoice(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = MNRInvoiceService()

    def delete(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                self.service.deleteMNRInvoice(pk)

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
