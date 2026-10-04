from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from depot.models import (
    HandlingPayment,
    Container,
    Handling,
    GateInHistory,
    GateOutHistory,
)
from datetime import datetime
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError, ResourceNotFound, AlreadyExists
from rest_framework import status
from master.functions import pagination_func
from django.db import transaction


class AddHandlingPayment(APIView):

    permission_classes = (IsAuthenticated,)

    def getParams(self, payload):
        try:
            date = datetime.strptime(payload.get("date"), "%Y-%m-%d")
        except ValueError:
            raise ValidationError("Invalid date format. Please use YYYY-MM-DD.")

        location = payload.get("location", None)
        site = payload.get("site", None)
        if not location or not site:
            raise ValidationError("Location and Site Required.")
        location_obj = Location.objects.filter(name=location).first()
        site_obj = Site.objects.filter(name=site, location=location_obj).first()

        amount = payload.get("original_amount")
        quantity = payload.get("quantity")
        if not amount or float(amount) <= float(0):
            raise ValidationError("Original amount must be greater than zero.")
        if not quantity or int(quantity) <= 0:
            raise ValidationError("Quantity must be greater than zero.")
        params = {
            "amount": amount,
            "original_amount": amount,
            "date": date,
            "bank_name": payload.get("bank_name"),
            "account_no": payload.get("account_no"),
            "account_name": payload.get("account_name"),
            "quantity": quantity,
            "remaining": quantity,
            "location": location_obj,
            "site": site_obj,
        }
        if payload.get("payment_type") == "Cheque":
            if not payload.get("cheque_no"):
                raise ValidationError(
                    "Cheque number is required for CHEQUE payment method."
                )
            if HandlingPayment.objects.filter(
                cheque_no=payload.get("cheque_no"),
            ).exists():
                raise AlreadyExists(
                    "Payment with this cheque number already exists for the specified location and site."
                )
            params["cheque_no"] = payload.get("cheque_no")
            params["utr_no"] = None
            params["payment_type"] = payload.get("payment_type")
        elif (
            payload.get("payment_type") == "NEFT"
            or payload.get("payment_type") == "RTGS"
        ):
            if not payload.get("utr_no"):
                raise ValidationError(
                    "UTR number is required for NEFT/RTGS payment method."
                )
            if HandlingPayment.objects.filter(
                utr_no=payload.get("utr_no"),
            ).exists():
                raise AlreadyExists(
                    "Payment with this UTR number already exists for the specified location and site."
                )
            params["utr_no"] = payload.get("utr_no")
            params["cheque_no"] = None
            params["payment_type"] = payload.get("payment_type")
        return params

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                params = self.getParams(request.data)
                handling_payment = HandlingPayment.objects.create(**params)
                return Response(
                    {
                        "message": "Handling Payment added successfully",
                        "data": handling_payment.get_payment_details(),
                    },
                    status=status.HTTP_201_CREATED,
                )

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListHandlingPayment(APIView):
    permission_classes = (IsAuthenticated,)

    def getParams(self, payload):
        params = {}
        cheque_no = payload.get("cheque_no")
        utr_no = payload.get("utr_no")
        container_no = payload.get("container_no")

        location = payload.get("location", None)
        site = payload.get("site", None)
        if not location or not site:
            raise ValidationError("Location and Site Required.")
        location_obj = Location.objects.filter(name=location).first()
        site_obj = Site.objects.filter(name=site, location=location_obj).first()
        params["location"] = location_obj
        params["site"] = site_obj

        if cheque_no:
            params["cheque_no"] = cheque_no
        if utr_no:
            params["utr_no"] = utr_no
        if container_no:
            params["container__container_no"] = container_no
        return params

    def post(self, request, *args, **kwargs):
        try:

            params = self.getParams(request.data)
            payments = HandlingPayment.objects.filter(**params).order_by("-date")
            on_page_data = request.data.get("on_page_data", 10)
            pg_no = request.data.get("pg_no", 1)
            if not payments:
                raise ResourceNotFound("No payments found with the provided criteria.")
            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = pagination_func(payments, on_page_data, pg_no)

            main_data = [
                payment.get_payment_details() for payment in current_page.object_list
            ]

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": main_data,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetHandlingPayment(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        try:
            payment = HandlingPayment.objects.get(pk=pk)
            return Response(payment.get_payment_details(), status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
class DeleteHandlingPayment(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                payment = HandlingPayment.objects.get(pk=pk)
                if not payment.container.count() == 0:
                    raise ValidationError("Payment is locked, Can't Delete")
                payment.delete()
                return Response({"sucessMsg": "Payment Deleted"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateHandlingPayment(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request, pk, *args, **kwargs):
        try:
            cheque_no = request.data.get("cheque_no", None)
            utr_no = request.data.get("utr_no", None)
            original_amount = request.data.get("original_amount", 0)
            quantity = request.data.get("quantity", 0)

            if not original_amount or float(original_amount) <= float(0):
                raise ValidationError("Original amount must be greater than zero.")
            if not quantity or int(quantity) <= 0:
                raise ValidationError("Quantity must be greater than zero.")

            with transaction.atomic():
                payment = HandlingPayment.objects.get(pk=pk)

                if not len(cheque_no) == 0 and not payment.cheque_no == cheque_no:
                    if HandlingPayment.objects.filter(cheque_no=cheque_no).exists():
                        raise AlreadyExists(
                            "Payment with this cheque number already exists"
                        )
                    else:
                        payment.cheque_no = cheque_no
                        payment.utr_no = None

                if not len(utr_no) == 0 and not payment.utr_no == utr_no:
                    if HandlingPayment.objects.filter(utr_no=utr_no).exists():
                        raise AlreadyExists(
                            "Payment with this UTR number already exists"
                        )
                    else:
                        payment.utr_no = utr_no
                        payment.cheque_no = None

                consumed_amount = float(payment.original_amount) - float(payment.amount)
                consumed_quantity = int(payment.quantity) - int(payment.remaining)
                if float(original_amount) < float(consumed_amount):
                    raise ValidationError(
                        "Original amount cannot be less than the consumed amount."
                    )
                else:
                    payment.original_amount = float(original_amount)
                    payment.amount = float(original_amount) - float(consumed_amount)

                if int(quantity) < int(consumed_quantity):
                    raise ValidationError(
                        "Original quantity cannot be less than the consumed quantity."
                    )
                else:
                    payment.quantity = int(quantity)
                    payment.remaining = int(quantity) - int(consumed_quantity)

                # Update the payment details
                payment.bank_name = request.data.get("bank_name", "")
                payment.account_no = request.data.get("account_no", "")
                payment.account_name = request.data.get("account_name", "")
                try:
                    date = datetime.strptime(request.data.get("date"), "%Y-%m-%d")
                except:
                    raise ValidationError("Invalid date format. Please use YYYY-MM-DD.")
                payment.date = date
                payment.save()
                return Response(
                    {
                        "successMsg": "Handling Payment updated successfully",
                        "data": payment.get_payment_details(),
                    },
                    status=status.HTTP_200_OK,
                )

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RemoveHandlingPayment(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        try:
            payment = HandlingPayment.objects.get(pk=pk)
            amount = request.data.get("lolo_amount", 0)
            location = request.data.get("location", "")
            site = request.data.get("site", "")
            container_no = request.data.get("container_no", "")
            handling_pk = request.data.get("handling_pk", None)
            if not handling_pk:
                raise ValidationError("Handling ID is required.")
            if float(amount) < 0:
                raise ValidationError("Amount cannot be negative.")

            if not payment:
                raise ResourceNotFound("Payment not found.")

            container = Container.objects.get(
                container_no=container_no, location_id=location, site_id=site
            )
            # Check if the payment is associated with the container
            if not payment.container.filter(container_no=container_no).exists():
                raise ResourceNotFound(
                    "This payment is not associated with the specified container."
                )
            handling = Handling.objects.get(pk=handling_pk)

            with transaction.atomic():
                payment.remove_container(container, amount)
                handling.payment_type = "Cash"
                handling.save(update_fields=["payment_type"])

                if GateInHistory.objects.filter(lolo=handling).exists():
                    gih = GateInHistory.objects.filter(lolo=handling).first()
                    gih.lolo_payment = None
                    gih.save(update_fields=["lolo_payment"])

                if GateOutHistory.objects.filter(lolo=handling).exists():
                    goh = GateOutHistory.objects.filter(lolo=handling).first()
                    goh.lolo_payment = None
                    goh.save(update_fields=["lolo_payment"])

                return Response(
                    {"message": "Handling Payment removed successfully"},
                    status=status.HTTP_200_OK,
                )

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
