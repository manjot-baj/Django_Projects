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
from master.models import LocationCodeDetail

# serializers
from master.Serializers.location_code_detail_serializer import (
    LocationCodeDetailSerializer,
)

# services
from master.services.location_code_service import LocationCodeService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, ValidationError

from account.permissions import HasAllowedRoles


class AddLocationCode(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):

        try:
            serializer = LocationCodeDetailSerializer(instance=None, data=request.data)
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


class UpdateLocationCode(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):

        try:
            obj = LocationCodeDetail.objects.getLocationCodeById(pk)

            serializer = LocationCodeDetailSerializer(instance=obj, data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()

            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
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


class GetLocationCode(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            location_code_object = LocationCodeDetail.objects.getLocationCodeById(pk)
            return Response(
                location_code_object.get_location_code_detail(),
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


# class LocationCodeDetailMaster(APIView):

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):

#         try:
#             serializer = LocationCodeDetailSerializer(instance=None, data=request.data)
#             if not serializer.is_valid():
#                 raise ValidationError(serializer.errors)
#             serializer.save()
#             return Response({"errorMsg": "Data Saved"}, status=status.HTTP_201_CREATED)
#         except ValidationError as e:

#             return Response(
#                 {"errorMsg": str(e.message), "data": None},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         except Exception as e:

#             ErrorLogging().log_error()

#             return Response(
#                 {"errorMsg": "An unexpected error occurred. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             location_code_object = LocationCodeDetail.objects.get(pk=pk)
#             return Response(
#                 location_code_object.get_location_code_detail(),
#                 status=status.HTTP_200_OK,
#             )
#         except ResourceNotFound as e:

#             return Response(
#                 {"errorMsg": str(e.message), "data": None},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         except Exception as e:

#             ErrorLogging().log_error()

#             return Response(
#                 {"errorMsg": "An unexpected error occurred. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )

#     def put(self, request, pk, *args, **kwargs):

#         try:
#             obj = LocationCodeDetail.objects.get(pk=pk)

#             serializer = LocationCodeDetailSerializer(instance=obj, data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()

#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except ResourceNotFound as e:

#             return Response(
#                 {"errorMsg": str(e.message), "data": None},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         except Exception as e:

#             ErrorLogging().log_error()

#             return Response(
#                 {"errorMsg": "An unexpected error occurred. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )


class DeleteLocationCodeDetail(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            LocationCodeDetail.objects.filter(pk__in=data).delete()
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


class ListLocationCodeDetail(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    locationCodeService = LocationCodeService()

    #
    # def get_object(self, data):
    #     query = Q()
    #     if data["location"]:
    #         query &= Q(location__name=data["location"])
    #     if data["site"]:
    #         query &= Q(site__name=data["site"])
    #     if data["type"]:
    #         query &= Q(type=data["type"])
    #     if data["name_code"]:
    #         query &= Q(name_code=data["name_code"])
    #     if data["name"]:
    #         query &= Q(name=data["name"])
    #     if data["code"]:
    #         query &= Q(code=data["code"])
    #
    #     return LocationCodeDetail.objects.select_related("location", "site").filter(
    #         query
    #     )
    def getParams(self, payload):
        if payload.get("site") == "GOLDEN HORN CONTAINER SERVICES TWO KOLKATA":
            params = {
                "site__name__in": [
                    payload.get("site"),
                    "INGHK",
                ],
            }
        else:
            params = {
                "location__name": payload.get("location"),
                "site__name": payload.get("site"),
            }
        if payload["type"]:
            params["type"] = payload["type"]
        if payload["name_code"]:
            params["name_code"] = payload["name_code"]
        if payload["name"]:
            params["name"] = payload["name"]
        if payload["code"]:
            params["code"] = payload["code"]
        return params

    @cache_api_view("location_code", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            pg_no = request.data.get("pg_no", None)
            on_page_data = request.data.get("on_page_data", None)
            params = self.getParams(request.data)
            data = self.locationCodeService.listOfLocationCodes(
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
def location_save(sender, instance, created, **kwargs):
    if sender in [LocationCodeDetail]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_location_code_{location}_{site}_movement")
        cache.delete(f"request_body_location_code_{location}_{site}_movement")


@receiver(post_delete)
def location_delete(sender, instance, **kwargs):
    if sender in [LocationCodeDetail]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_location_code_{location}_{site}_movement")
        cache.delete(f"request_body_location_code_{location}_{site}_movement")
