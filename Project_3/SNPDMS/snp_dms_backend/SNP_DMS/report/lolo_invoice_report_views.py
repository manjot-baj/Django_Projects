from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from .functions2 import (
    get_lolo_invoice_report_main_data
)
from .xlsx_function2 import create_lolo_invoice_report_wb
from master.models import Location, Site
from account.permissions import HasAllowedRoles
import logging
import traceback
import os


class LoloInvoiceReportView(views.APIView):
    """the post function will give the report"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            from_date = data["from_date"]
            to_date = data["to_date"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"], location=location)
            invoice_df_data = get_lolo_invoice_report_main_data(
                from_date, to_date, location, site
            )
            
            invoice_report_file_path = create_lolo_invoice_report_wb(
                invoice_df_data
            )
            filename = os.path.basename(invoice_report_file_path)
            with open(invoice_report_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="{filename}.xlsx"'
                )
                os.remove(invoice_report_file_path)
            return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Something went wrong!!!"}, status=200)
