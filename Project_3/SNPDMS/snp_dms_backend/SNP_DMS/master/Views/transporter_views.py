# rest framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView


# django
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

# cache
from common.functions import cache_api_view

# models
from master.models import Transporter

# serializer
from master.Serializers.transporter_serializer import TransporterSerializer

# service
from master.services.transporter_service import TransporterService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, ValidationError

from account.permissions import HasAllowedRoles
class AddTransporter(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:

            serializer = TransporterSerializer(
                data=request.data, context={"request": request}
            )

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


class GetTransporter(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            transporter_object = Transporter.objects.getTransporterById(pk)
            return Response(
                transporter_object.get_transporter(), status=status.HTTP_200_OK
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


class UpdateTransporter(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:

            transporter_object = Transporter.objects.getTransporterById(pk)
            serializer = TransporterSerializer(
                instance=transporter_object,
                data=request.data,
                context={"request": request},
            )
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()
            return Response({"successMsg": "Data Updated"}, status=200)
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


# class TransporterMaster(views.APIView):
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#
#             serializer = TransporterSerializer(
#                 data=request.data, context={"request": request}
#             )
#
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
#             transporter_object = Transporter.objects.get(pk=pk)
#             return Response(transporter_object.get_transporter(), status=200)
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
#             transporter_object = Transporter.objects.get(pk=pk)
#             serializer = TransporterSerializer(
#                 instance=transporter_object,
#                 data=request.data,
#                 context={"request": request},
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


class DeleteTransporter(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    transporterService = TransporterService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            params = {"pk__in": data}
            transporter_qs = Transporter.objects.getTransporterQuerysetByParams(params)
            not_deleted = self.transporterService.deleteTransporter(transporter_qs)
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


class ListTransporter(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    transporterService = TransporterService()

    def getParams(self, payload):
        params = {"location__name": payload["location"], "site__name": payload["site"]}
        if payload["transporter_name"]:
            params["name"] = payload["transporter_name"]

        if payload["transporter_code"]:
            params["code"] = payload["transporter_code"]
        return params

    @cache_api_view("transporter", time=86400)
    def post(self, request, *args, **kwargs):
        try:

            params = self.getParams(request.data)
            page_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            data = self.transporterService.listOfTransporter(
                params, on_page_data, page_no
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
def log_save(sender, instance, created, **kwargs):
    if sender in [Transporter]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_transporter_{location}_{site}_movement")
        cache.delete(f"request_body_transporter_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [Transporter]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_transporter_{location}_{site}_movement")
        cache.delete(f"request_body_transporter_{location}_{site}_movement")
