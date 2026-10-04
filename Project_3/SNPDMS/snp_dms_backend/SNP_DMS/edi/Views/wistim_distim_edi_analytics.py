# functions imports
from edi.functions import getEstimateWistimData, getRepairDistimData
from edi.utils import getStartAndEndDate
from master.models import Site

# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
from datetime import datetime, timedelta
from account.permissions import HasAllowedRoles

class EstimateEdiAnalytics(views.APIView):
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

    def appendData(
        self, gate_in_count, estimate_and_response_count, approval_data, data, site_type
    ):
        for each in gate_in_count:
            date_str = each["gate_in__in_date"].strftime("%Y-%m-%d")
            if date_str in data.keys():
                data[date_str]["gate_in_count"] = each["gate_in_count"]

        for each in estimate_and_response_count:
            date_str = each["gate_in__in_date"].strftime("%Y-%m-%d")
            if date_str in data.keys():
                if each["is_estimate_westim_sent"]:
                    data[date_str]["estimate_wistim_sent"] += 1
                else:
                    data[date_str]["estimate_wistim_not_sent"] += 1
                if each["is_repair_destim_sent"]:
                    data[date_str]["repair_distim_sent"] += 1
                else:
                    data[date_str]["repair_distim_not_sent"] += 1
        for each in approval_data:
            date_str = each["parent__parent__depot__gate_in__in_date"].strftime(
                "%Y-%m-%d"
            )

            if each["is_approved"]:
                data[date_str]["response_distim_approved"] += 1
            elif each["is_denied"]:
                if each["denial_reason"] == "REJECTED":
                    data[date_str]["response_distim_rejected"] += 1
                elif each["denial_reason"] == "PARTIALLY":
                    data[date_str]["response_distim_partially_approved"] += 1
                elif each["denial_reason"] == "CANCEL":
                    data[date_str]["response_distim_cancel"] += 1
            else:
                data[date_str]["response_distim_no_action"] += 1

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
            # Inititalize dict which contains date of specific month from start to end
            data = {}
            current_date = start_date
            while current_date <= end_date:
                data[current_date.strftime("%Y-%m-%d")] = {
                    "gate_in_count": 0,
                    "estimate_wistim_sent": 0,
                    "estimate_wistim_not_sent": 0,
                    "repair_distim_sent": 0,
                    "repair_distim_not_sent": 0,
                    "response_distim_approved": 0,
                    "response_distim_partially_approved": 0,
                    "response_distim_rejected": 0,
                    "response_distim_cancel": 0,
                    "response_distim_no_action": 0,
                }
                current_date += timedelta(days=1)
            (
                gate_in_count,
                estimate_and_response_count,
                approval_data,
            ) = getEstimateWistimData(param, site_obj.type)
            # Appends data to dictionary which contains start to end date of month
            self.appendData(
                gate_in_count,
                estimate_and_response_count,
                approval_data,
                data,
                site_obj.type,
            )

            return Response(data)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class RepairDistimAnalytics(views.APIView):
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

    def appendData(
        self, gate_in_count, estimate_data, approval_data, repair_data, data, site_type
    ):
        for each in gate_in_count:
            date_str = each["gate_in__in_date"].strftime("%Y-%m-%d")
            if date_str in data.keys():
                data[date_str]["gate_in_count"] = each["gate_in_count"]
        for each in estimate_data:
            date_str = each["gate_in__in_date"].strftime("%Y-%m-%d")
            gate_in_date_time = datetime.combine(
                each["gate_in__in_date"], each["gate_in__in_time"]
            )
            estimate_date_time = datetime.combine(
                each["estimate_date"], each["estimate_time"]
            )
            time_difference = estimate_date_time - gate_in_date_time

            if time_difference <= timedelta(hours=24):
                data[date_str]["wistim_within_24_hrs"] += 1
            else:
                data[date_str]["wistim_above_24_hrs"] += 1

        for each in approval_data:
            date_str = each["parent__parent__depot__gate_in__in_date"].strftime(
                "%Y-%m-%d"
            )
            gate_in_date_time = datetime.combine(
                each["parent__parent__depot__gate_in__in_date"],
                each["parent__parent__depot__gate_in__in_time"],
            )
            approval_date_time = datetime.combine(
                each["approved_date"], each["approved_time"]
            )
            time_difference = approval_date_time - gate_in_date_time
            if time_difference <= timedelta(hours=48):

                data[date_str]["approved_under_48_hrs"] += 1
            else:
                data[date_str]["approved_above_48_hrs"] += 1

        for each in repair_data:
            date_str = each["parent__parent__depot__gate_in__in_date"].strftime(
                "%Y-%m-%d"
            )
            gate_in_date_time = datetime.combine(
                each["parent__parent__depot__gate_in__in_date"],
                each["parent__parent__depot__gate_in__in_time"],
            )
            repair_date_time = datetime.combine(
                each["repair_date"], each["repair_time"]
            )
            time_difference = repair_date_time - gate_in_date_time
            if each["damage_category"] == "LD":
                if time_difference <= timedelta(days=3):
                    data[date_str]["repair_ld_within_3_days"] += 1
                else:
                    data[date_str]["repair_ld_above_3_days"] += 1
            elif each["damage_category"] == "MD":
                if time_difference <= timedelta(days=5):
                    data[date_str]["repair_md_within_5_days"] += 1
                else:
                    data[date_str]["repair_md_above_5_days"] += 1
            elif each["damage_category"] == "HD":
                if time_difference <= timedelta(days=10):
                    data[date_str]["repair_hd_within_10_days"] += 1
                else:
                    data[date_str]["repair_hd_above_10_days"] += 1

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
            # Inititalize dict which contains date of specific month from start to end
            data = {}
            current_date = start_date
            while current_date <= end_date:
                data[current_date.strftime("%Y-%m-%d")] = {
                    "gate_in_count": 0,
                    "wistim_within_24_hrs": 0,
                    "wistim_above_24_hrs": 0,
                    "approved_under_48_hrs": 0,
                    "approved_above_48_hrs": 0,
                    "repair_ld_within_3_days": 0,
                    "repair_ld_above_3_days": 0,
                    "repair_md_within_5_days": 0,
                    "repair_md_above_5_days": 0,
                    "repair_hd_within_10_days": 0,
                    "repair_hd_above_10_days": 0,
                }
                current_date += timedelta(days=1)
            (
                gate_in_count,
                estimate_data,
                approval_data,
                repair_data,
            ) = getRepairDistimData(param, site_obj.type)
            # Appends data to dictionary which contains start to end date of month
            self.appendData(
                gate_in_count,
                estimate_data,
                approval_data,
                repair_data,
                data,
                site_obj.type,
            )
            return Response(data)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
