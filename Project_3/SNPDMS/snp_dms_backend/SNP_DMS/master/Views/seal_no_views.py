from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db import transaction
from django.db.models import Q

import datetime
from django.core.cache import cache
from common.functions import cache_api_view
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from master.models_two import SealNo, Location, Site
from depot.models import ContainerStock, GateOut
from rest_framework.views import APIView

from common.error_logging import ErrorLogging
from common.exceptions import (
    ResourceNotFound,
    ValidationError,
)
from master.services.seal_no_service import (
    SealNoService,
)

from account.permissions import HasAllowedRoles


class AddSealNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    sealService = SealNoService()

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                self.sealService.createData(request.data)
            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )

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


class UpdateSealNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = SealNoService()

    def put(self, request, pk, *args, **kwargs):
        try:
            self.service.updateData(request.data, pk)
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


class GetSealNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            seal_no_object = SealNo.objects.getSealNoById(pk)
            data = seal_no_object.get_seal_no()
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


#
# class SealNoMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def empty_str_to_none(self, item):
#         return {key: None if value == "" else value for key, value in item.items()}
#
#     def validate_data(self, data):
#         try:
#             converted_data = self.empty_str_to_none(data)
#             mandatory_list = [
#                 converted_data["number"],
#                 converted_data["line"],
#                 converted_data["in_date"],
#                 converted_data["in_time"],
#                 converted_data["location"],
#                 converted_data["site"],
#             ]
#             if None in mandatory_list:
#                 return {"errorMsg": "Please provide mandatory data"}
#
#             return converted_data
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return {"errorMsg": f"Invalid credentials [{e}]"}
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             data = self.validate_data(request.data)
#
#             # number = data["number"]
#             # if number == "":
#             #     return Response({"errorMsg": "Please provide Seal No"}, status=200)
#             #
#             # line = data["line"]
#             # if not line:
#             #     return Response({"errorMsg": "Please provide Line"}, status=200)
#
#             location = Location.objects.get(name=data["location"])
#
#             site = Site.objects.get(name=data["site"])
#
#             in_date = None
#             in_time = None
#             in_date_str = data["in_date"]
#             if not data["in_date"]:
#                 in_date = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .date()
#                 )
#             else:
#
#                 in_date = datetime.datetime.strptime(in_date_str, "%Y-%m-%d").date()
#
#             if not data["in_time"]:
#                 in_time = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .time()
#                 )
#             else:
#
#                 in_time = datetime.datetime.strptime(data["in_time"], "%H:%M").time()
#
#             in_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
#                 timezone.get_current_timezone()
#             )
#
#             if (
#                 SealNo.objects.filter(number=number).exists()
#                 or ContainerStock.objects.filter(seal_no=number).exists()
#                 or GateOut.objects.filter(seal_no=number).exists()
#             ):
#                 return Response({"errorMsg": "Seal NO already exists"})
#
#             seal_no_entry = SealNo.objects.createData(
#                 number=number,
#                 location=location,
#                 site=site,
#                 line=line,
#                 in_date=in_date_time,
#             )
#             # seal_no_entry = SealNo.create(
#             #     number=number,
#             #     location=location,
#             #     site=site,
#             #     line=line,
#             #     in_date=in_date_time,
#             # )
#             # seal_no_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             seal_no_object = SealNo.objects.get(pk=pk)
#             data = seal_no_object.get_seal_no()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = self.validate_data(request.data)
#
#             number = data["number"]
#             if not number:
#                 return Response({"errorMsg": "Please provide Seal No"}, status=200)
#
#             line = data["line"]
#             if not line:
#                 return Response({"errorMsg": "Please provide Line"}, status=200)
#
#             location = Location.objects.get(name=data["location"])
#
#             site = Site.objects.get(name=data["site"])
#
#             in_date = None
#             in_time = None
#             in_date_str = data["in_date"]
#             if not in_date_str:
#                 in_date = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .date()
#                 )
#             else:
#                 in_date = datetime.datetime.strptime(in_date_str, "%Y-%m-%d").date()
#
#             in_time_str = data["in_time"]
#             if len(in_time_str) == 0:
#                 in_time = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .time()
#                 )
#             else:
#                 in_time = datetime.datetime.strptime(in_time_str, "%H:%M").time()
#
#             in_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
#                 timezone.get_current_timezone()
#             )
#
#             is_cut = data["is_cut"]
#             is_damaged = data["is_damaged"]
#             is_first_allotment = data["is_first_allotment"]
#
#             seal_no_object = SealNo.objects.get(pk=pk)
#
#             if seal_no_object.is_lock:
#                 return Response(
#                     {"errorMsg": "Sorry Seal No is Locked, Cannot Update"},
#                     status=200,
#                 )
#             if seal_no_object.in_use and not seal_no_object.number == number:
#                 old_seal_no = seal_no_object.number
#                 stock = ContainerStock.objects.get(seal_no=old_seal_no)
#                 stock.seal_no = number
#                 stock.save()
#
#             if not seal_no_object.in_use:
#                 seal_no_object.line = line
#                 seal_no_object.location = location
#                 seal_no_object.site = site
#
#             seal_no_object.number = number
#             seal_no_object.in_date = in_date_time
#             seal_no_object.is_cut = is_cut
#             seal_no_object.is_damaged = is_damaged
#             seal_no_object.is_first_allotment = is_first_allotment
#             seal_no_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteSealNo(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            SealNo.objects.filter(pk__in=data).delete()
            return Response({"successMsg": "Data Deleted"}, status=status.HTTP_200_OK)
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListSealNo(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = SealNoService()

    def getParams(self, data):
        location = data["location"]
        site = data["site"]
        line = data["line"]
        number = data["number"]
        seal_box_number = data["seal_box_number"]
        container_no = data.get("container_no", None)
        is_available = data["is_available"]
        is_history = data["is_history"]
        is_damaged = data["is_damaged"]
        is_cut = data["is_cut"]
        is_first_allotment = data["is_first_allotment"]
        query = Q()
        params = {}

        if location != "ALL":
            params["location__name"] = location

        if site != "ALL":
            params["site__name"] = site

        if line:
            params["line"] = line

        if number:
            params["number"] = number

        if seal_box_number:
            params["seal_box_number"] = seal_box_number

        if is_available is True:
            params["is_lock"] = False
            params["is_available"] = True
        else:
            params["is_lock"] = False
            params["is_available"] = False
            params["is_damaged"] = is_damaged
            params["is_cut"] = is_cut

        if container_no:
            query &= Q(container_no=container_no)
            params["container_no"] = container_no

        if is_first_allotment:
            params["is_first_allotment"] = is_first_allotment

        if is_history is True:
            params["is_lock"] = True
            params["is_damaged"] = is_damaged
            params["is_cut"] = is_cut

        in_date = data["in_date"]
        if in_date["from"] and in_date["to"]:
            from_date = datetime.datetime.strptime(in_date["from"], "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(in_date["to"], "%Y-%m-%d").date()
            params["in_date__range"] = (from_date, to_date)

        out_date = data["out_date"]
        if out_date["from"] and out_date["to"]:
            from_date = datetime.datetime.strptime(out_date["from"], "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(out_date["to"], "%Y-%m-%d").date()
            params["out_date__range"] = (from_date, to_date)

        in_use_date = data["in_use_date"]
        if in_use_date["from"] and in_use_date["to"]:
            from_date = datetime.datetime.strptime(
                in_use_date["from"], "%Y-%m-%d"
            ).date()
            to_date = datetime.datetime.strptime(in_use_date["to"], "%Y-%m-%d").date()
            params["in_use_date__range"] = (from_date, to_date)

        return params

    @cache_api_view("seal_no", time=86400)
    def post(self, request, *args, **kwargs):

        try:
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            params = self.getParams(request.data)

            data = self.service.listOfSealNos(params, on_page_data, pg_no)

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


class GetAvailableSealNoView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            try:
                stock = ContainerStock.objects.get(pk=pk)
            except:
                raise ResourceNotFound("Stock Data not found!")
            line = stock.container.client.ref_code
            location = stock.container.location
            site = stock.container.site
            data = SealNo.objects.filter(
                is_available=True, location=location, site=site, line=line
            ).values_list("number", flat=True)

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
    if sender in [SealNo]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_seal_no_{location}_{site}_movement")
        cache.delete(f"request_body_seal_no_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [SealNo]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_seal_no_{location}_{site}_movement")
        cache.delete(f"request_body_seal_no_{location}_{site}_movement")
