# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# django
from django.db import transaction

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, AlreadyExists, ValidationError

# services
from procurement.services.consumption_services import ConsumptionService

# models
from procurement.models import Consumption, ConsumptionLine, SharedClass

from account.permissions import HasAllowedRoles


class CreateConsumption(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = data.get("location_id")
            site = data.get("site_id")
            consumption_line = data.get("consumption_line")
            if not "pk" in data.keys():
                if SharedClass().checkOrderNoExistence(
                    "Consumption",
                    data.get("consumption_no"),
                    location,
                    site,
                ):
                    raise ValidationError("Order No already exists")

            if not any(
                ConsumptionService().validateConsumptionLines(
                    data=consumption_line, location=location, site=site
                )
            ):
                raise ValidationError("Some tools do not have sufficient IN Stock")

            with transaction.atomic():
                instance = ConsumptionService().addConsumption(
                    request.data, location, site
                )

                for each in consumption_line:
                    consumed_quantity = each.get("consumed_quantity")
                    if float(consumed_quantity) < 0:
                        raise ValidationError("consumed_quantity cannot be less than 0")
                    else:
                        pass

                ConsumptionService().addConsumptionLine(
                    instance,
                    consumption_line,
                    location,
                    site,
                )
            return Response(
                {"success": "Consumption created succesfully"},
                status=status.HTTP_201_CREATED,
            )
        except ValidationError as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetConsumption(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            data = ConsumptionService().consumption(pk)
            return Response(data)

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateConsumption(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            location = data.get("location_id")
            site = data.get("site_id")
            consumption_line = data.get("consumption_line")
            deleted_lines = data.get("delete_history_lines")
            with transaction.atomic():
                instance = ConsumptionService().updateConsumption(
                    pk, data, location, site
                )

                for each in consumption_line:
                    consumed_quantity = each.get("consumed_quantity")
                    if float(consumed_quantity) < 0:
                        raise ValidationError("consumed_quantity cannot be less than 0")
                    else:
                        pass

                if deleted_lines:
                    ConsumptionLine.manager.delete_history_lines(data=deleted_lines)

                ConsumptionService().updateConsumptionLine(
                    instance,
                    consumption_line,
                    location,
                    site,
                )

            data = ConsumptionService().consumption(pk)

            return Response(
                {"successMsg": "Consumption updated succesfully", "data": data},
                status=status.HTTP_200_OK,
            )

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteConsumption(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            instance = Consumption.manager.getConsumptionById(pk)
            with transaction.atomic():
                ConsumptionService().revertChanges(parent=instance)
                instance.delete()

            return Response(
                {"successMsg": "Consumption deleted succesfully"},
                status=status.HTTP_200_OK,
            )
        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListConsumptions(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            main_data = ConsumptionService().listConsumption(request.data)
            return Response(main_data, status=status.HTTP_200_OK)

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
