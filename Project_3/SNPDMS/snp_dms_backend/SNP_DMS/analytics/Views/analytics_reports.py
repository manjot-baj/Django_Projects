# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime
import ast, os
from django.db.models import F
from django.http import HttpResponse

# model_import
from master.models import Location, Site
from billing_invoice.models import MNRInvoiceLine, CustomerBill
from mnr.models import Approval

# function imports
from report.functions2 import msc_approval_report_main_data, user_data
from analytics.xlsc_functions import approval_report
from analytics.functions import get_approval_objects
from account.permissions import HasAllowedRoles

class AnalyticsReport(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            from_date = data.get("from_date")
            to_date = data.get("to_date")
            location = data.get("location")
            site = data.get("site")
            report_name = data.get("report_name")
            line = data.get("line")
            site_obj = Site.objects.get(name=site)
            user_data_dict = user_data(
                location=Location.objects.get(name=location),
                site=site_obj,
            )

            if report_name == "Re-Estimate":
                approval_objects = get_approval_objects(
                    from_date, to_date, location, site, site_obj, line
                )

                approval_df_data = msc_approval_report_main_data(
                    data_object_list=approval_objects
                )
                temp_file_path, date_str = approval_report(
                    approval_df_data=approval_df_data,
                    from_date_str=from_date,
                    to_date_str=to_date,
                    from_time_str="",
                    to_time_str="",
                    line=line,
                    user_data=user_data_dict,
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="approval_report_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
