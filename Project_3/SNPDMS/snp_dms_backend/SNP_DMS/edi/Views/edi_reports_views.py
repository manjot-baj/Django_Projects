# functions imports
from edi.report_functions import (
    getInOutEdiMailObjects,
    getBackDatedData,
    getMissingEdiData,
    getEDIMoveCodeData,
)
from edi.utils import (
    getStartAndEndDate,
    getInEDIMailDfData,
    createEdiReport,
    getOutEDIMailDfData,
    getInEDIMailDfData,
    getTextExcelMoveCodeDFData,
    createMoveCodeReport,
)

# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
import os
from datetime import timedelta
from django.http import HttpResponse
from account.permissions import HasAllowedRoles

class EDIReports(views.APIView):
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
            data = request.data
            month_str = data.get("month")
            location = data.get("location")
            site = data.get("site")
            edi_type = data.get("edi_type")
            month = self.month_mapping[month_str]
            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": data.get("line"),
                "container__client__edi_service": True,
                "container__location__name": location,
                "container__site__name": site,
            }

            in_data, out_data = getInOutEdiMailObjects(param, edi_type)
            inward_df_data = getInEDIMailDfData(in_data)
            outward_df_data = getOutEDIMailDfData(out_data)
            temp_file_path = createEdiReport(
                inward_df_data,
                outward_df_data,
                start_date.date(),
                end_date.date(),
                "EDI REPORT",
                location,
                site,
                data.get("line"),
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="edi_report.xlsx"'
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class EDIBackdatedReports(views.APIView):
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
            data = request.data
            month_str = data.get("month")
            location = data.get("location")
            site = data.get("site")
            edi_type = data.get("edi_type")
            month = self.month_mapping[month_str]
            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": data.get("line"),
                "container__client__edi_service": True,
                "container__location__name": location,
                "container__site__name": site,
            }

            in_data, out_data = getBackDatedData(param, edi_type)
            inward_df_data = getInEDIMailDfData(in_data)
            outward_df_data = getOutEDIMailDfData(out_data)
            temp_file_path = createEdiReport(
                inward_df_data,
                outward_df_data,
                start_date.date(),
                end_date.date(),
                "EDI BACKDATED REPORT",
                location,
                site,
                data.get("line"),
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="edi_backdated_report.xlsx"'
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class EDIMissingReports(views.APIView):
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
            data = request.data
            month_str = data.get("month")
            location = data.get("location")
            site = data.get("site")
            edi_type = data.get("edi_type")
            month = self.month_mapping[month_str]
            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": data.get("line"),
                "container__client__edi_service": True,
                "container__location__name": location,
                "container__site__name": site,
            }

            in_data, out_data = getMissingEdiData(param, edi_type)
            inward_df_data = getInEDIMailDfData(in_data)
            outward_df_data = getOutEDIMailDfData(out_data)
            temp_file_path = createEdiReport(
                inward_df_data,
                outward_df_data,
                start_date.date(),
                end_date.date(),
                "EDI MISSING REPORT",
                location,
                site,
                data.get("line"),
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="edi_missing_report.xlsx"'
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class EDIMoveCodeReport(views.APIView):
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
            data = request.data
            month_str = data.get("month")

            edi_type = data.get("edi_type")
            location = data.get("location")
            site = data.get("site")
            month = self.month_mapping[month_str]
            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": "MSC",
                "container__client__edi_service": True,
                "container__location__name": location,
                "container__site__name": site,
            }

            sent_data, waiting_data = getEDIMoveCodeData(
                param, edi_type, data.get("process"), data.get("type")
            )
            sent_df_data, waiting_df_data = getTextExcelMoveCodeDFData(
                sent_data, waiting_data, edi_type
            )

            temp_file_path = createMoveCodeReport(
                sent_df_data,
                waiting_df_data,
                start_date.date(),
                end_date.date(),
                location,
                site,
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="edi_move_code_report.xlsx"'
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
