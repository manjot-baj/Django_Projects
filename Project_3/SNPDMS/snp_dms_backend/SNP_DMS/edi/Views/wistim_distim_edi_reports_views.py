# functions imports
from edi.report_functions import getEstimateWistimReportData, getRepairDistimReportData
from edi.utils import (
    getStartAndEndDate,
    getEstimateWistimDfData,
    createEstimateWistimReport,
    createRepairDistimReport,
    getRepairDistimDfData,
)
from master.models import Site

# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
import os
from datetime import timedelta
from django.http import HttpResponse

from account.permissions import HasAllowedRoles
class EstimateEdiReports(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    month_mapping = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12,
    }

    def post(self, request, *args, **kwargs):
        try:

            payload = request.data
            month_str = payload.get("month")
            month = self.month_mapping[month_str]
            site_obj = Site.objects.get(name=payload.get("site"))

            start_date, end_date = getStartAndEndDate(month)
            param = {
                "gate_in__in_date__range": (start_date, end_date),
                "container__location__name": payload.get("location"),
                "container__site__name": payload.get("site"),
                "container__client__edi_service": True,
                "container__client__ref_code": payload.get("line"),
            }
            stock_data = getEstimateWistimReportData(site_obj.type, param)
            estimate_wistim_df_data = getEstimateWistimDfData(stock_data, site_obj.type)
            temp_file_path = createEstimateWistimReport(
                estimate_wistim_df_data,
                start_date.date(),
                end_date.date(),
                payload.get("location"),
                payload.get("site"),
                payload.get("line"),
            )

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="estimate_wistim_report.xlsx"'
                os.remove(temp_file_path)
            return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class RepairEdiReports(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    month_mapping = {
        "January": 1,
        "February": 2,
        "March": 3,
        "April": 4,
        "May": 5,
        "June": 6,
        "July": 7,
        "August": 8,
        "September": 9,
        "October": 10,
        "November": 11,
        "December": 12,
    }

    def post(self, request, *args, **kwargs):
        try:

            payload = request.data
            month_str = payload.get("month")
            month = self.month_mapping[month_str]
            site_obj = Site.objects.get(name=payload.get("site"))

            start_date, end_date = getStartAndEndDate(month)
            param = {
                "gate_in__in_date__range": (start_date, end_date),
                "container__location__name": payload.get("location"),
                "container__site__name": payload.get("site"),
                "container__client__edi_service": True,
                "container__client__ref_code": payload.get("line"),
            }
            stock_data = getRepairDistimReportData(site_obj.type, param)
            repair_distim_df_data = getRepairDistimDfData(stock_data, site_obj.type)
            temp_file_path = createRepairDistimReport(
                repair_distim_df_data,
                start_date.date(),
                end_date.date(),
                payload.get("location"),
                payload.get("site"),
                payload.get("line"),
            )

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="repair_distim_report.xlsx"'
                os.remove(temp_file_path)
            return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
