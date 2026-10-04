# rest framework
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# django
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# cache
from common.functions import cache_api_view

# model
from master.models import VesselVoyageDetail

# serializer
from master.Serializers.vessel_voyage_detail_serializer import (
    VesselVoyageDetailSerializer,
)

# service
from master.services.vessel_voyage_service import VesselVoyageService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError, ResourceNotFound

from account.permissions import HasAllowedRoles
class AddVesselVoyage(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            serializer = VesselVoyageDetailSerializer(instance=None, data=request.data)
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


class GetVesselVoyage(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    def get(self, request, pk, *args, **kwargs):
        try:
            vessel_voyage_detail_object = (
                VesselVoyageDetail.objects.getVesselVoyageById(pk)
            )

            return Response(
                vessel_voyage_detail_object.get_vessel_voyage_detail(),
                status=status.HTTP_200_OK,
            )
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


class UpdateVesselVoyage(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:
            vessel_voyage_detail_object = (
                VesselVoyageDetail.objects.getVesselVoyageById(pk=pk)
            )

            serializer = VesselVoyageDetailSerializer(
                instance=vessel_voyage_detail_object, data=request.data
            )
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()

            return Response({"successMsg": "Data Updated"}, status=200)
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )
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


# class VesselVoyageDetailMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             serializer = VesselVoyageDetailSerializer(instance=None, data=request.data)
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
#             vessel_voyage_detail_object = VesselVoyageDetail.objects.get(pk=pk)
#             return Response(
#                 vessel_voyage_detail_object.get_vessel_voyage_detail(),
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             vessel_voyage_detail_object = VesselVoyageDetail.objects.get(pk=pk)
#
#             serializer = VesselVoyageDetailSerializer(
#                 instance=vessel_voyage_detail_object, data=request.data
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
#


class DeleteVesselVoyage(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            VesselVoyageDetail.objects.filter(pk__in=data).delete()
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


class ListVesselVoyage(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    vesselVoyageService = VesselVoyageService()

    # def get_object(self, data):
    #     query = Q()
    #     if data["location"]:
    #         query &= Q(location__name=data["location"])
    #     if data["site"]:
    #         query &= Q(site__name=data["site"])
    #     if data["booking_no"]:
    #         query &= Q(bkg__number=data["booking_no"])
    #     if data["vessel_name"]:
    #         query &= Q(vessel_name=data["vessel_name"])
    #     if data["vessel_voyage"]:
    #         query &= Q(vessel_voyage=data["vessel_voyage"])
    #     if data["voyage_no"]:
    #         query &= Q(voyage_no=data["voyage_no"])
    #
    #     return VesselVoyageDetail.objects.select_related(
    #         "bkg", "location", "site"
    #     ).filter(query)
    def getParams(self, payload):
        params = {
            "location__name": payload.get("location"),
            "site__name": payload.get("site"),
        }
        booking_no = payload.get("booking_no")
        vessel_name = payload.get("vessel_name")
        voyage_no = payload.get("voyage_no")
        vessel_voyage = payload.get("vessel_voyage")
        if booking_no:
            params["bkg__number"] = booking_no
        if vessel_name:
            params["vessel_name"] = vessel_name
        if voyage_no:
            params["voyage_no"] = voyage_no
        if vessel_voyage:
            params["vessel_voyage"] = vessel_voyage
        return params

    @cache_api_view(key="voyage_detail", time=86400)
    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            params = self.getParams(request.data)
            pg_no = request.data.get("pg_no", None)
            on_page_data = request.data.get("on_page_data", None)
            data = self.vesselVoyageService.listOfVesselVoyage(
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


@receiver(post_save)
def voyage_save(sender, instance, created, **kwargs):
    if sender in [VesselVoyageDetail]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_voyage_detail_{location}_{site}_movement")
        cache.delete(f"request_body_voyage_detail_{location}_{site}_movement")


@receiver(post_delete)
def voyage_delete(sender, instance, **kwargs):
    if sender in [VesselVoyageDetail]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_voyage_detail_{location}_{site}_movement")
        cache.delete(f"request_body_voyage_detail_{location}_{site}_movement")
