# functions imports
from edi.functions import (
    getInOutEdiMailData,
    getBackDatedData,
    getMissingEdiData,
    getEDIMoveCodeData,
)
from edi.utils import getStartAndEndDate, appendData, calculateSuccessRate

# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
from datetime import datetime, timedelta
from django.db.models import F

from account.permissions import HasAllowedRoles
class EDIAnalytics(views.APIView):

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
            month = self.month_mapping[month_str]

            start_date, end_date = getStartAndEndDate(month)

            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": data.get("line"),
                "container__client__edi_service": True,
                "container__location__name": data.get("location"),
                "container__site__name": data.get("site"),
            }

            (
                in_count,
                out_count,
                in_mail_sent_count,
                out_mail_sent_count,
            ) = getInOutEdiMailData(param, edi_type)

            data = {}

            current_date = start_date
            while current_date <= end_date:
                data[current_date.strftime("%Y-%m-%d")] = {
                    "in_count": 0,
                    "in_edi_sent_count": 0,
                    "in_success_rate": "",
                    "out_count": 0,
                    "out_edi_sent_count": 0,
                    "out_success_rate": "",
                }
                current_date += timedelta(days=1)

            appendData(in_count, "in_count", data)

            appendData(in_mail_sent_count, "in_edi_sent_count", data)

            appendData(out_count, "out_count", data)

            appendData(out_mail_sent_count, "out_edi_sent_count", data)

            calculateSuccessRate(data)

            return Response(data)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class EDIBackDatedStatus(views.APIView):

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
            line = data.get("line")
            edi_type = data.get("edi_type")
            month = self.month_mapping[month_str]

            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": line,
                "container__client__edi_service": True,
                "container__location__name": data.get("location"),
                "container__site__name": data.get("site"),
            }

            (
                in_count,
                out_count,
                in_mail_sent_count,
                out_mail_sent_count,
            ) = getBackDatedData(param, edi_type)

            data = {}

            current_date = start_date
            while current_date <= end_date:
                data[current_date.strftime("%Y-%m-%d")] = {
                    "in_count": 0,
                    "in_edi_sent_count": 0,
                    "in_success_rate": "",
                    "out_count": 0,
                    "out_edi_sent_count": 0,
                    "out_success_rate": "",
                }
                current_date += timedelta(days=1)

            appendData(in_count, "in_count", data)

            appendData(in_mail_sent_count, "in_edi_sent_count", data)

            appendData(out_count, "out_count", data)

            appendData(out_mail_sent_count, "out_edi_sent_count", data)

            calculateSuccessRate(data)

            return Response(data)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class EDIMIssingStatus(views.APIView):

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
            line = data.get("line")
            edi_type = data.get("edi_type")
            month = self.month_mapping[month_str]

            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": line,
                "container__client__edi_service": True,
                "container__location__name": data.get("location"),
                "container__site__name": data.get("site"),
            }

            (
                in_count,
                out_count,
            ) = getMissingEdiData(param, edi_type)

            data = {}

            current_date = start_date
            while current_date <= end_date:
                data[current_date.strftime("%Y-%m-%d")] = {
                    "in_count": 0,
                    "out_count": 0,
                }
                current_date += timedelta(days=1)

            appendData(in_count, "in_count", data)

            appendData(out_count, "out_count", data)

            return Response(data)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class EDIMoveCodeData(views.APIView):
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
        self,
        data,
        total_data,
        total_count,
        sent_count,
        waiting_count,
        type,
        start_date,
        end_date,
        edi_type,
    ):
        key = "in_data_id" if type == "Arrived" else "out_data_id"
        move_code_key = "move_code" if edi_type == "text" else "excel_edi_move_code"
        for each in sent_count:
            for i in total_data:
                if str(i["pk"]) == (each[key]):

                    result = i
                    break
            date_str = result["created_at"].date().strftime("%Y-%m-%d")
            move_code = each[move_code_key]
            if date_str in data.keys():
                if move_code in data[date_str].keys():

                    data[date_str][move_code]["sent"] += each["count"]
                else:
                    data[date_str][move_code] = {
                        "total": 0,
                        "sent": each["count"],
                        "waiting": 0,
                    }
        for each in waiting_count:
            for i in total_data:

                if str(i["pk"]) == (each[key]):
                    result = i
                    break
            date_str = result["created_at"].date().strftime("%Y-%m-%d")
            move_code = each["move_code"]
            if date_str in data.keys():
                if move_code in data[date_str].keys():
                    data[date_str][move_code]["waiting"] += each["count"]
                else:
                    data[date_str][move_code] = {
                        "total": 0,
                        "sent": 0,
                        "waiting": each["count"],
                    }

        for each in total_count:
            if (
                each["created_at"].date() >= start_date
                and each["created_at"].date() <= end_date
            ):
                date_str = each["created_at"].date().strftime("%Y-%m-%d")
                if data[date_str]:
                    for _, v in data[date_str].items():
                        v["total"] += each["count"]

        # for each in total_count:
        #     date_str = each["date"].strftime("%Y-%m-%d")
        #     move_code = each["move_code"]
        #     if date_str in data.keys():
        #         if move_code in data[date_str].keys():
        #             data[date_str][move_code]["total"] += each["count"]
        #         else:
        #             data[date_str][move_code] = {
        #                 "total": each["count"],
        #                 "sent": 0,
        #                 "waiting": 0,
        #             }

        # for each in sent_count:
        #     date_str = each["date"].strftime("%Y-%m-%d")
        #     move_code = each["move_code"]
        #     if date_str in data.keys():
        #         if move_code in data[date_str].keys():
        #             data[date_str][move_code]["sent"] += each["count"]
        #         else:
        #             data[date_str][move_code] = {
        #                 "total": 0,
        #                 "sent": each["count"],
        #                 "waiting": 0,
        #             }
        # for each in waiting_count:
        #     date_str = each["date"].strftime("%Y-%m-%d")
        #     move_code = each["move_code"]
        #     if date_str in data.keys():
        #         if move_code in data[date_str].keys():
        #             data[date_str][move_code]["waiting"] += each["count"]
        #         else:
        #             data[date_str][move_code] = {
        #                 "total": 0,
        #                 "sent": 0,
        #                 "waiting": each["count"],
        # }

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            month_str = data.get("month")

            edi_type = data.get("edi_type")
            month = self.month_mapping[month_str]
            start_date, end_date = getStartAndEndDate(month)
            param = {
                "created_at__range": (start_date, end_date),
                "container__client__ref_code": "MSC",
                "container__client__edi_service": True,
                "container__location__name": data.get("location"),
                "container__site__name": data.get("site"),
            }

            main_data = {}
            total_data, total_count, sent_count, waiting_count = getEDIMoveCodeData(
                param,
                edi_type,
                data.get("process"),
                data.get("type"),
            )
            current_date = start_date
            while current_date <= end_date:
                main_data[current_date.strftime("%Y-%m-%d")] = {}
                current_date += timedelta(days=1)

            self.appendData(
                main_data,
                total_data,
                total_count,
                sent_count,
                waiting_count,
                data.get("type"),
                start_date.date(),
                end_date.date(),
                edi_type,
            )

            return Response(main_data)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
