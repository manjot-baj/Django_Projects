import traceback, logging
from common.functions import cache_api_view

# rest framework
from rest_framework import views
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


# django
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# services
from master.services.carrier_code_service import CarrierCodeService

# models
from master.models import CarrierCode

# serializer
from master.Serializers.carrier_code_serializer import (
    CarrierCodeSerializer,
)

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import (
    ValidationError,
    ResourceNotFound,
)

from account.permissions import HasAllowedRoles

class AddCarrierCode(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):

        try:
            serializer = CarrierCodeSerializer(instance=None, data=request.data)
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


class GetCarrierCode(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CarrierCodeService()

    def get(self, request, pk, *args, **kwargs):
        try:
            carrier_code = CarrierCode.objects.getCarrierCodeById(pk)
            data = self.service.carrierCodeData(carrier_code)

            return Response(
                data,
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


class UpdateCarrierCode(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:
            carrier_code = CarrierCode.objects.getCarrierCodeById(pk)

            serializer = CarrierCodeSerializer(instance=carrier_code, data=request.data)
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


# class CarrierCodeMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             serializer = CarrierCodeSerializer(instance=None, data=request.data)
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
#             obj = CarrierCode.objects.get(pk=pk)
#
#             data = obj.get_carrier_code()
#
#             return Response(
#                 data,
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
#             obj = CarrierCode.objects.get(pk=pk)
#
#             serializer = CarrierCodeSerializer(instance=obj, data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)

# def delete(self, request, *args, **kwargs):
#     if not request.data:
#         return Response({"errorMsg": "Please provide Data"}, status=200)
#     try:
#         data = request.data
#         CarrierCode.objects.filter(pk__in=data).delete()
#         return Response({"errorMsg": "Data Deleted"}, status=200)
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return Response({"errorMsg": "Data Not Found"}, status=200)


class DeleteCarrierCode(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            carrier_code = CarrierCode.objects.filter(pk__in=data)
            carrier_code.delete()
            return Response({"successMsg": "Data Deleted"}, status=200)
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


class ListCarrierCode(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    carrierCodeService = CarrierCodeService()

    def getParams(self, payload):
        location = payload.get("location")
        site = payload.get("site")
        code = payload.get("code")
        params = {}
        if location:
            params["location__name"] = location
        if site:
            params["site__name"] = site
        if code:
            params["code"] = code

        return params

    @cache_api_view("carrier_code", time=86400)
    def post(self, request, *args, **kwargs):

        try:
            params = self.getParams(request.data)
            page_no = request.data.get("pg_no", None)
            on_page_data = request.data.get("on_page_data", None)

            data = self.carrierCodeService.listOfCarrierCodes(
                params, on_page_data, page_no
            )

            return Response(
                data,
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


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender in [CarrierCode]:
        location = instance.location
        site = instance.site
        # location = location.replace("\xa0", "")  # Removes non-breaking spaces
        # location = location.replace(" ", "")
        #
        # site = site.replace("\xa0", "")  # Removes non-breaking spaces
        # site = site.replace(" ", "")
        cache.delete(f"response_carrier_code_{location}_{site}_movement")
        cache.delete(f"request_body_carrier_code_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [CarrierCode]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_carrier_code_{location}_{site}_movement")
        cache.delete(f"request_body_carrier_code_{location}_{site}_movement")
