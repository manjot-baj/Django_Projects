# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime
from common.functions import cache_api_view

# model_import
from master.models import Location, Site

# function imports
from analytics.functions import (
    location_site_weekly_lolo_st_volume_revenue,
    location_site_lolo_st_volume_revenue,
    lolo_st_top_client,
)
from account.permissions import HasAllowedRoles

class DATSDashboard(views.APIView):
    """
    The post function will give requested data,
    Weekly data  and quaterly data
    of DashBoard Analytics Second Screen,
    SelfTransportation Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dats_dashboard", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = {}
            main_data = request.data
            location = Location.objects.get(name=main_data["location"])
            site = Site.objects.get(name=main_data["site"])
            requirement = "This Month"
            line = request.data["line"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            year, week_num, dow = today.isocalendar()

            # st_in_weekly_volume_revenue_data
            st_in_weekly_volume_revenue_data = (
                location_site_weekly_lolo_st_volume_revenue(
                    movement="IN",
                    process="st",
                    year="This Year",
                    week_num=week_num,
                    location=location,
                    site=site,
                    line=line,
                )
            )
            data["st_in_weekly_volume_revenue_data"] = st_in_weekly_volume_revenue_data

            # st_out_weekly_volume_revenue_data
            st_out_weekly_volume_revenue_data = (
                location_site_weekly_lolo_st_volume_revenue(
                    movement="OUT",
                    process="st",
                    year="This Year",
                    week_num=week_num,
                    location=location,
                    site=site,
                    line=line,
                )
            )
            data[
                "st_out_weekly_volume_revenue_data"
            ] = st_out_weekly_volume_revenue_data

            # st_in_volume_revenue_data
            st_in_volume_revenue_data = location_site_lolo_st_volume_revenue(
                movement="IN",
                process="st",
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            data["st_in_volume_revenue_data"] = st_in_volume_revenue_data

            # st_out_volume_revenue_data
            st_out_volume_revenue_data = location_site_lolo_st_volume_revenue(
                movement="OUT",
                process="st",
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            data["st_out_volume_revenue_data"] = st_out_volume_revenue_data

            # st_in_volume_revenue_top_client
            st_in_top_client_volume_revenue_data = lolo_st_top_client(
                movement="IN",
                process="st",
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            data[
                "st_in_top_client_volume_revenue_data"
            ] = st_in_top_client_volume_revenue_data

            # st_out_volume_revenue_top_client
            st_out_top_client_volume_revenue_data = lolo_st_top_client(
                movement="OUT",
                process="st",
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            data[
                "st_out_top_client_volume_revenue_data"
            ] = st_out_top_client_volume_revenue_data

            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DATSWeeklyStVR(views.APIView):
    """
    The post function will give requested data,
    Weekly data of DashBoard Analytics Second Screen,
    SelfTransportation Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dats_weekly_st_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            year = request.data["year"]
            week_num = request.data["week_num"]
            movement = request.data["movement"]
            line = request.data["line"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            # weekly_volume_revenue_data --> IN and OUT of ST
            data = location_site_weekly_lolo_st_volume_revenue(
                movement=movement,
                process="st",
                year=year,
                week_num=week_num,
                location=location,
                site=site,
                line=line,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DATSQuaterlyStVR(views.APIView):
    """
    The post function will give requested data,
    Quaterly data of DashBoard Analytics Second Screen,
    SelfTransportation Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dats_quarterly_st_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            requirement = request.data["requirement"]
            movement = request.data["movement"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            line = request.data["line"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            # yearly and quaterly volume_revenue_data --> IN and OUT of ST
            data = location_site_lolo_st_volume_revenue(
                movement=movement,
                process="st",
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DASSTopClientStVR(views.APIView):
    """
    The post function will give requested data,
    Top Client data for DashBoard Analytics Second Screen,
    Self Transportation Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dass_top_client_st_vr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = request.data["requirement"]
            movement = request.data["movement"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            line = request.data["line"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            data = lolo_st_top_client(
                movement=movement,
                process="st",
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            return Response({"data": data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
