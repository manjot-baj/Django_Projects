import os
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from rest_framework import status
from SNP_DMS.settings.base import BASE_DIR
from account.models import AccountUser
from master.models import Location, Site
from depot.functions_two import *
import pandas as pd
from django.utils import timezone
from non_depot.models import NonDepotContainerStock
from datetime import datetime
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from non_depot.services.non_depot_service import NonDepotService
import shutil


from account.permissions import HasAllowedRoles
class DownloadSampleFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_stock_upload_non_depot.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_stock_upload_non_depot.xlsx"'
                )
            return file_response

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExtractNonDepotData(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["file"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            result = self.service.extractExcelData(
                input_excel=data, location=location, site=site
            )

            if result == "Header Not Found" or result is False:
                raise ValidationError("Data file is corrupted, unable to import data")

            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StockImport(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["importable_data"]

            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            automatic_mnr_status_change = site.automatic_mnr_status_change

            self.service.importData(data, location, site, automatic_mnr_status_change)

            return Response({"successMsg": "Stock Imported"}, status=status.HTTP_200_OK)

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadRejectedStockDataFile(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]
            columns = [
                "shipping_line",
                "client",
                "type",
                "size",
                "container_no",
                "gross_wt",
                "tare_wt",
                "manufacturing_date",
                "in_date",
                "in_time",
                "condition",
                "grade",
                "mode",
                "dock_destuff",
            ]
            df = pd.DataFrame(data)[columns]
            df.columns = columns

            if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

            new_temp_file_path = os.path.join(
                BASE_DIR, "temp/sample_stock/sample_stock_upload_non_depot.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_stock_upload_non_depot.xlsx"
            )

            shutil.copyfile(temp_file_path, new_temp_file_path)

            self.service.writeDataToExcel(new_temp_file_path, df, faults)

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    'attachment; filename="rejected_tool_file.xlsx"'
                )

            os.remove(new_temp_file_path)
            return file_response
        except Exception as e:
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {e} ]"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class StockSheetDownload(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotService()

    def getParams(self, data):
        site = Site.objects.get(name=data["site"])
        location = Location.objects.get(name=data["location"])
        parameters = {
            "container__location": location,
            "container__site": site,
        }
        if data["ref_code"]:
            parameters["container__client__ref_code"] = data["ref_code"]
        if data["client"]:
            parameters["container__client__name"] = data["client"]

        if data["container_no"]:
            parameters["container__container_no__in"] = data["container_no"]

        if data["stage"]:
            parameters["stage"] = data["stage"]

        if data["from_date"] and data["to_date"]:
            parameters["gate_in__in_date__range"] = [
                data["from_date"],
                data["to_date"],
            ]

        if data["ref_code"]:
            parameters["container__client__ref_code"] = data["ref_code"]

        if "status" in data:
            if data["status"]:
                parameters["status"] = data["status"]

        if data["out_history"] == "True":
            parameters["container_status"] = "OUT"
        else:
            parameters["container_status"] = "IN"

        return location, site, parameters

    def post(self, request, *args, **kwargs):

        try:

            location, site, param = self.getParams(data=request.data)

            dt = datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M%S")

            queryset = (
                NonDepotContainerStock.objects.select_related(
                    "container",
                    "container__client",
                    "container__type",
                    "container__size",
                    "gate_in",
                )
                .filter(**param)
                .values(
                    "container__client__name",
                    "container__client__ref_code",
                    "gate_in__in_date",
                    "container__container_no",
                    "container__size__name",
                    "container__type__name",
                    "stage",
                    "estimate_status",
                    "status",
                    "container__condition",
                    "is_estimate_westim_sent",
                    "is_repair_destim_sent",
                )
                .order_by("-gate_in__in_date")
            )

            df_data = self.service.stockSheetData(queryset)

            temp_file_path = self.service.createNonDepotStockSheet(
                location, site, df_data, date, time
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="non_depot_stock_sheet_{date}_{time}.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
