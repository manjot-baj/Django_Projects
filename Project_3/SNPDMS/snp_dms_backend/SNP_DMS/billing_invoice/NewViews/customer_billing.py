# rest framework
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# other imports
import os
from billing_invoice.functions import create_billing_statement_excel

# django
from django.http import HttpResponse

# error handling
from common.exceptions import ResourceNotFound
from common.error_logging import ErrorLogging

# services
from billing_invoice.services.customer_bill_service import CustomerBillService

# models
from master.models import Location, Site

import logging
import traceback
from SNP_DMS.settings.base import BASE_DIR
import os
import datetime
from django.utils import timezone
import xlsxwriter


from account.permissions import HasAllowedRoles


class CustomerBillingView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CustomerBillService()

    def post(self, request, *args, **kwargs):
        try:
            page_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]

            data = self.service.getBills(request.data, on_page_data, page_no)

            if data:
                return Response(
                    data,
                    status=status.HTTP_200_OK,
                )
            else:
                raise ResourceNotFound("Data Not Found")
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


class PreInvoiceStatement(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CustomerBillService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pk_list = data["pk_list"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            main_data = self.service.getMnrData(pk_list, location, site)

            temp_file_path = create_billing_statement_excel(
                main_data, type="pre_billing_statement"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="pre_billing_statement.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CustomerBillingViewDownload(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = CustomerBillService()

    def get_df_data(self, request_data):
        try:
            data = self.service.getBillsForExcelDownload(request_data)
            df_data = [
                [
                    row.get("bill_type"),
                    row.get("container_no"),
                    row.get("bill_date"),
                    row.get("client"),
                    row.get("apply_charge"),
                    row.get("customer"),
                    row.get("original_amount"),
                    row.get("remaining_amount"),
                ]
                for row in data
            ]

            if not df_data:
                df_data = [["" for _ in range(10)]]
            return df_data
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return [["" for _ in range(10)]]

    def get_report_wb(self, df_data):
        try:
            if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/"))
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M%S")
            temp_file_path = os.path.join(
                BASE_DIR, f"temp/bill_list_report_{date}{time}.xlsx"
            )
            generic_workbook = xlsxwriter.Workbook(temp_file_path)

            bill_sheet = generic_workbook.add_worksheet(f"bill_list")
            bill_sheet.add_table(
                f"A1:H{1 + len(df_data)}",
                {
                    "data": df_data,
                    "columns": [
                        {"header": "bill_type"},
                        {"header": "container_no"},
                        {"header": "bill_date"},
                        {"header": "client"},
                        {"header": "apply_charge"},
                        {"header": "customer"},
                        {"header": "original_amount"},
                        {"header": "remaining_amount"},
                    ],
                },
            )
            generic_workbook.close()
            return temp_file_path
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return None

    def post(self, request, *args, **kwargs):
        try:
            df_data = self.get_df_data(request_data=request.data)
            invoice_report_file_path = self.get_report_wb(df_data=df_data)
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
