# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime
from common.functions import cache_api_view

# function imports
from analytics.functions import (
    all_location_weekly_lolo_st_volume_revenue,
    all_location_lolo_st_volume_revenue,
    all_location_weekly_mnr_volume_revenue,
    all_location_mnr_volume_revenue,
)
from account.permissions import HasAllowedRoles


class DAFSDashboard(views.APIView):
    """
    The get function will give requested data,
    Weekly, yearly, quaterly data of
    DashBoard Analytics First Screen,
    Handling SelfTransportation and MNR
    Volume and Revenue of all Locations
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    def get(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = "This Month"
            today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            year, week_num, dow = today.isocalendar()

            # mnr_weekly_volume_revenue_data
            mnr_weekly_volume_revenue_data = all_location_weekly_mnr_volume_revenue(
                year="This Year", week_num=week_num
            )
            data["mnr_weekly_volume_revenue_data"] = mnr_weekly_volume_revenue_data

            # mnr_volume_revenue_data
            mnr_volume_revenue_data = all_location_mnr_volume_revenue(
                requirement=requirement
            )
            data["mnr_volume_revenue_data"] = mnr_volume_revenue_data

            # lolo_in_weekly_volume_revenue_data
            lolo_in_weekly_volume_revenue_data = (
                all_location_weekly_lolo_st_volume_revenue(
                    movement="IN", process="lolo", year="This Year", week_num=week_num
                )
            )
            data[
                "lolo_in_weekly_volume_revenue_data"
            ] = lolo_in_weekly_volume_revenue_data

            # lolo_out_weekly_volume_revenue_data
            lolo_out_weekly_volume_revenue_data = (
                all_location_weekly_lolo_st_volume_revenue(
                    movement="OUT", process="lolo", year="This Year", week_num=week_num
                )
            )
            data[
                "lolo_out_weekly_volume_revenue_data"
            ] = lolo_out_weekly_volume_revenue_data

            # st_in_weekly_volume_revenue_data
            st_in_weekly_volume_revenue_data = (
                all_location_weekly_lolo_st_volume_revenue(
                    movement="IN", process="st", year="This Year", week_num=week_num
                )
            )
            data["st_in_weekly_volume_revenue_data"] = st_in_weekly_volume_revenue_data

            # st_out_weekly_volume_revenue_data
            st_out_weekly_volume_revenue_data = (
                all_location_weekly_lolo_st_volume_revenue(
                    movement="OUT", process="st", year="This Year", week_num=week_num
                )
            )
            data[
                "st_out_weekly_volume_revenue_data"
            ] = st_out_weekly_volume_revenue_data

            # lolo_in_volume_revenue_data
            lolo_in_volume_revenue_data = all_location_lolo_st_volume_revenue(
                movement="IN", process="lolo", requirement=requirement
            )
            data["lolo_in_volume_revenue_data"] = lolo_in_volume_revenue_data

            # lolo_out_volume_revenue_data
            lolo_out_volume_revenue_data = all_location_lolo_st_volume_revenue(
                movement="OUT", process="lolo", requirement=requirement
            )
            data["lolo_out_volume_revenue_data"] = lolo_out_volume_revenue_data

            # st_in_volume_revenue_data
            st_in_volume_revenue_data = all_location_lolo_st_volume_revenue(
                movement="IN", process="st", requirement=requirement
            )
            data["st_in_volume_revenue_data"] = st_in_volume_revenue_data

            # st_out_volume_revenue_data
            st_out_volume_revenue_data = all_location_lolo_st_volume_revenue(
                movement="OUT", process="st", requirement=requirement
            )
            data["st_out_volume_revenue_data"] = st_out_volume_revenue_data

            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFSWeeklyMNRVR(views.APIView):
    """
    The post function will give requested data,
    Weekly data of DashBoard Analytics First Screen,
    MNR
    Volume and Revenue of all Locations
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dafs_weekly_mnr_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            year = request.data["year"]
            week_num = request.data["week_num"]
            line = request.data["line"]
            # weekly_volume_revenue_data --> MNR
            data = all_location_weekly_mnr_volume_revenue(
                year=year, week_num=week_num, line=line
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFSQuaterlyMNRVR(views.APIView):
    """
    The post function will give requested data,
    Yearly and quaterly data of DashBoard Analytics First Screen,
    MNR
    Volume and Revenue of all Locations
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dafs_quarterly_mnr_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            requirement = request.data["requirement"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            line = request.data["line"]
            # yearly and quaterly volume_revenue_data --> MNR
            data = all_location_mnr_volume_revenue(
                requirement=requirement,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFSWeeklyLoloSTVR(views.APIView):
    """
    The post function will give requested data,
    Weekly data of DashBoard Analytics First Screen,
    Handling and SelfTransportation
    Volume and Revenue of all Locations
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dafs_weekly_lolo_st_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            year = request.data["year"]
            week_num = request.data["week_num"]
            process = request.data["process"]
            movement = request.data["movement"]
            line = request.data["line"]
            # weekly_volume_revenue_data --> IN and OUT of LOLO and ST
            data = all_location_weekly_lolo_st_volume_revenue(
                movement=movement,
                process=process,
                year=year,
                week_num=week_num,
                line=line,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFSQuaterlyLoloSTVR(views.APIView):
    """
    The post function will give requested data,
    Yearly and quaterly data of DashBoard Analytics First Screen,
    Handling and SelfTransportation
    Volume and Revenue of all Locations
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dafs_quarterly_lolo_st_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            requirement = request.data["requirement"]
            process = request.data["process"]
            movement = request.data["movement"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            line = request.data["line"]
            # yearly and quaterly volume_revenue_data --> IN and OUT of LOLO and ST
            data = all_location_lolo_st_volume_revenue(
                movement=movement,
                process=process,
                requirement=requirement,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )

            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
