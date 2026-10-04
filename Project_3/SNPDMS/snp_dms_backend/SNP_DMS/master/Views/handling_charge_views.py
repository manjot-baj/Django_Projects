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

# model
from master.models_two import HandlingCharge

# serializer
from master.Serializers.handling_charge_serializer import HandlingChargeSerializer

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, ValidationError

# service
from master.services.handling_charge_service import HandlingChargeService

from account.permissions import HasAllowedRoles
class AddHandlingCharge(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            serializer = HandlingChargeSerializer(instance=None, data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()

            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
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


class GetHandlingCharge(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    handlingChargeService = HandlingChargeService()

    def get(self, request, pk, *args, **kwargs):
        try:
            obj = HandlingCharge.objects.getHandlingChargeById(pk=pk)
            data = obj.get_charge_detail()
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


class UpdateHandlingCharge(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):

        try:
            obj = HandlingCharge.objects.get(pk=pk)
            serializer = HandlingChargeSerializer(instance=obj, data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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


class ListHandlingCharge(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    handlingChargeService = HandlingChargeService()

    # def get_object(self, data):
    #     query = Q()
    #     if data["location"]:
    #         query &= Q(location__name=data["location"])
    #     if data["site"]:
    #         query &= Q(site__name=data["site"])
    #     if data["client_name"]:
    #         query &= Q(client_name=data["client_name"])
    #
    #     return HandlingCharge.objects.select_related(
    #         "client", "location", "site"
    #     ).filter(query)

    def getParams(self, payload):
        params = {
            "location__name": payload.get("location"),
            "site__name": payload.get("site"),
        }
        client = payload.get("client_name")
        if client:
            params["client__name"] = client
        return params

    @cache_api_view("handling_charge", time=86400)
    def post(self, request, *args, **kwargs):

        try:
            params = self.getParams(request.data)
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            data = self.handlingChargeService.listOfHandlingCharge(
                params, on_page_data, pg_no
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


# class HandlingChargeMaster(APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             serializer = HandlingChargeSerializer(instance=None, data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#
#             return Response({"errorMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             charge_object = HandlingCharge.objects.get(pk=pk)
#             return Response(charge_object.get_charge_detail(), status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             obj = HandlingCharge.objects.get(pk=pk)
#             serializer = HandlingChargeSerializer(instance=obj, data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


class DeleteHandlingCharge(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            HandlingCharge.objects.filter(pk__in=data).delete()
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
    if sender in [HandlingCharge]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_handling_charge_{location}_{site}_movement")
        cache.delete(f"request_body_handling_charge_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [HandlingCharge]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_handling_charge_{location}_{site}_movement")
        cache.delete(f"request_body_handling_charge_{location}_{site}_movement")
