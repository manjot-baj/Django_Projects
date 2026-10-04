# rest framework
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, AlreadyExists

# models
from truck_tracking.models import TruckTracking

# services
from truck_tracking.service import TruckTrackingService

from account.permissions import HasAllowedRoles
class TruckEntry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        transporter = TruckTracking.objects.getTransporterByName(
            payload.get("transporter"),
            payload.get("location_id"),
            payload.get("site_id"),
        )
        payload["transporter"] = transporter
        return payload

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                truckService = TruckTrackingService()
                params = self.getParams(request.data)
                if "container_no" in params.keys():
                    truckService.validateDuplicateData(
                        params["transporter"],
                        params["location_id"],
                        params["site_id"],
                        params["vehicle_no"],
                        params["container_no"],
                    )
                else:
                    truckService.validateDuplicateData(
                        params["transporter"],
                        params["location_id"],
                        params["site_id"],
                        params["vehicle_no"],
                    )

                obj = truckService.addTruck(params)

                data = truckService.truckDto(obj)

            return Response(
                {"message": "Truck Entry Successful", "data": data},
                status=status.HTTP_201_CREATED,
            )
        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except AlreadyExists as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetTruckData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):

        try:
            data = TruckTrackingService().truckData(pk)

            return Response(
                {"message": "Truck Tracking Data Found", "data": data},
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


class ListTruckEntries(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        line = payload.get("line")
        status = payload.get("status")
        transporter = payload.get("transporter")
        container_no = payload.get("container_no")
        page_no = payload.get("page_no")
        on_page_data = payload.get("on_page_data")
        type = payload.get("type")

        params = {
            "location_id": payload.get("location_id"),
            "site_id": payload.get("site_id"),
        }

        if line:
            params["line"] = line
        if status:
            params["status"] = status
        if type == "Loaded":
            params["move_mode"] = "IMPORT"
        else:
            params["move_mode__in"] = ["EXPORT", "RE-EXPORT"]
        if transporter:
            params["transporter__name"] = transporter
        if container_no:
            params["container_no"] = container_no

        return params, page_no, on_page_data

    def post(self, request, *args, **kwargs):

        try:
            params, page_no, on_page_data = self.getParams(request.data)
            data = TruckTrackingService().listOfTruckData(params, page_no, on_page_data)

            return Response(data, status=status.HTTP_200_OK)
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


class UpdateTruckeEntry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):

        try:
            with transaction.atomic():
                TruckTrackingService().updateData(pk, request.data.get("container_no"))
                data = TruckTrackingService().truckData(pk)

            return Response(
                {"message": "Data Updated Successfully!", "data": data},
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


class TruckDataRelatedToContainer(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        container_no = payload.get("container_no")
        location = payload.get("location_id")
        site = payload.get("site_id")
        params = {
            "container_no": container_no,
            "location_id": location,
            "site_id": site,
            "status": "IN QUEUE",
            "move_mode": "IMPORT",
        }
        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            data = TruckTrackingService().fetchTransporterRelatedToContainer(params)
            return Response(
                {"data": data},
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


class VehicleNoAvailableUnderTransporter(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        transporter = payload.get("transporter")
        location = payload.get("location_id")
        site = payload.get("site_id")
        transporter = TruckTracking.objects.getTransporterByName(
            transporter,
            location,
            site,
        )
        return {
            "transporter": transporter,
            "location_id": location,
            "site_id": site,
            "status": "IN QUEUE",
            "move_mode__in": ["EXPORT", "RE-EXPORT"],
        }

    def post(self, request, *args, **kwargs):
        try:
            truckService = TruckTrackingService()
            params = self.getParams(request.data)
            data = truckService.fetchVehicleNoRelatedToTransporter(params)
            return Response(
                {"data": data},
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


class ListOfTransporters(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        location = payload.get("location_id")
        site = payload.get("site_id")

        return {
            "location_id": location,
            "site_id": site,
            "status": "IN QUEUE",
            "move_mode__in": ["EXPORT", "RE-EXPORT"],
        }

    def post(self, request, *args, **kwargs):
        try:
            truckService = TruckTrackingService()
            params = self.getParams(request.data)

            data = truckService.listOfTransporters(params)

            return Response(
                {"message": "Found", "data": data}, status=status.HTTP_200_OK
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
