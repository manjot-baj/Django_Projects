from datetime import datetime

# rest framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# django
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# cache
from common.functions import cache_api_view

# models
from master.models import VesselBkgNo

# serializer
from master.Serializers.vessel_bkg_no_serializer import VesselBkgNoSerializer

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import (
    ValidationError,
    ResourceNotFound,
)

# service
from master.services.vessel_booking_no_service import (
    VesselBookingService,
)

from account.permissions import HasAllowedRoles
class AddVesselBookingNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            serializer = VesselBkgNoSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            serializer.save()
            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetVesselBookingNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            vessel_bkg_no = VesselBkgNo.objects.getVesselBookingNoById(pk)
            data = vessel_bkg_no.get_vessel_bkgno()
            return Response(data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateVesselBookingNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):

        try:

            vessel_bkgno_object = VesselBkgNo.objects.getVesselBookingNoById(pk=pk)
            serializer = VesselBkgNoSerializer(vessel_bkgno_object, data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()
            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListVesselBookingNo(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    vesselBookingService = VesselBookingService()

    def getParams(self, payload):
        params = {
            "location__name": payload.get("location"),
            "site__name": payload.get("site"),
        }
        number = payload.get("number")
        from_date = payload.get("from_date")
        to_date = payload.get("to_date")

        if number:
            params["number"] = number
        if from_date and to_date:
            from_date_object = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_object = datetime.strptime(to_date, "%Y-%m-%d").date()
            params["date__range"] = (from_date_object, to_date_object)

        return params

    # def get_object(self, data):
    #     query = Q()
    #     if data["location"]:
    #         query &= Q(location__name=data["location"])
    #     if data["site"]:
    #         query &= Q(site__name=data["site"])
    #     if data["number"]:
    #         query &= Q(number=data["number"])
    #     if data["from_date"] and data["to_date"]:
    #         from_date = datetime.datetime.strptime(data["from_date"], "%Y-%m-%d").date()
    #         to_date = datetime.datetime.strptime(data["to_date"], "%Y-%m-%d").date()
    #         query &= Q(date__range=(from_date, to_date))
    #
    #     return VesselBkgNo.objects.select_related("location", "site").filter(query)

    @cache_api_view("vessel_bkg_no", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            pg_no = request.data.get("pg_no", None)
            on_page_data = request.data.get("on_page_data", None)
            data = self.vesselBookingService.listOfVesselBookingNo(
                params, on_page_data, pg_no
            )
            return Response(data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# class VesselBkgNoMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             serializer = VesselBkgNoSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             vessel_bkgno_object = VesselBkgNo.objects.get(pk=pk)
#             return Response(vessel_bkgno_object.get_vessel_bkgno(), status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#
#             vessel_bkgno_object = VesselBkgNo.objects.get(pk=pk)
#             serializer = VesselBkgNoSerializer(vessel_bkgno_object, data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
#


class DeleteVesselBkgNo(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    vesselBookingService = VesselBookingService()

    def post(self, request, *args, **kwargs):
        try:

            not_deleted = self.vesselBookingService.deleteVesselBookingNo(request.data)
            if not_deleted:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response({"successMsg": "Data Deleted"}, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender in [VesselBkgNo]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_vessel_bkg_no_{location}_{site}_movement")
        cache.delete(f"request_body_vessel_bkg_no_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [VesselBkgNo]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_vessel_bkg_no_{location}_{site}_movement")
        cache.delete(f"request_body_vessel_bkg_no_{location}_{site}_movement")
