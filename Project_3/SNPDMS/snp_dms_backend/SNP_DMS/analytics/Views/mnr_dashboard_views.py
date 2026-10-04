# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime

# model_import
from master.models import Location, Site

# function imports
from analytics.functions import (
    location_site_weekly_mnr_volume_revenue,
    location_site_quaterly_mnr_volume_revenue,
    location_site_mnr_stage_data,
    mnr_top_client,
    top_client_partially_approved,
)
from common.functions import cache_api_view
from account.permissions import HasAllowedRoles

class DAFthDashboard(views.APIView):
    """
    The post function will give requested data,
    Weekly data  and quaterly data
    of DashBoard Analytics Second Screen,
    MNR Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("daft_dashboard", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = {}
            main_data = request.data
            location = Location.objects.get(name=main_data["location"])
            site = Site.objects.get(name=main_data["site"])
            ref_code = request.data["ref_code"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            requirement = "This Month"
            today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            year, week_num, dow = today.isocalendar()

            # location_site_weekly_mnr_volume_revenue
            weekly_mnr_volume_revenue = location_site_weekly_mnr_volume_revenue(
                year="This Year",
                week_num=week_num,
                location=location,
                site=site,
                ref_code=ref_code,
            )
            data["weekly_mnr_volume_revenue"] = weekly_mnr_volume_revenue

            # location_site_quaterly_mnr_volume_revenue
            quaterly_mnr_volume_revenue = location_site_quaterly_mnr_volume_revenue(
                requirement=requirement,
                location=location,
                site=site,
                ref_code=ref_code,
                from_date=from_date,
                to_date=to_date,
            )
            data["quaterly_mnr_volume_revenue"] = quaterly_mnr_volume_revenue

            # location_site_mnr_stage_data
            mnr_stage_data = location_site_mnr_stage_data(
                ref_code=ref_code, location=location, site=site
            )
            data["mnr_stage_data"] = mnr_stage_data

            # mnr_volume_revenue_top_client
            mnr_top_client_volume_revenue_data = mnr_top_client(
                requirement=requirement,
                location=location,
                site=site,
                ref_code=ref_code,
                from_date=from_date,
                to_date=to_date,
            )
            data[
                "mnr_top_client_volume_revenue_data"
            ] = mnr_top_client_volume_revenue_data
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFthWeeklyMNR(views.APIView):
    """
    The post function will give requested data,
    Weekly data of DashBoard Analytics Second Screen,
    MNR Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("daft_weekly_mnr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            year = request.data["year"]
            week_num = request.data["week_num"]
            ref_code = request.data["ref_code"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            # weekly_volume_revenue_data --> MNR
            data = location_site_weekly_mnr_volume_revenue(
                ref_code=ref_code,
                year=year,
                week_num=week_num,
                location=location,
                site=site,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFthQuaterlyMNR(views.APIView):
    """
    The post function will give requested data,
    Quaterly data of DashBoard Analytics Second Screen,
    MNR Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("daft_quarterly_mnr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            requirement = request.data["requirement"]
            ref_code = request.data["ref_code"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            # yearly and quaterly volume_revenue_data --> MNR
            data = location_site_quaterly_mnr_volume_revenue(
                requirement=requirement,
                ref_code=ref_code,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DAFthTopClientMNR(views.APIView):
    """
    The post function will give requested data,
    Top Client data for DashBoard Analytics Second Screen,
    MNR Volume and Revenue of requested Location and Site
    based on size and client type
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("top_client_mnr", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = request.data["requirement"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            ref_code = request.data["ref_code"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            data = mnr_top_client(
                requirement=requirement,
                location=location,
                site=site,
                ref_code=ref_code,
                from_date=from_date,
                to_date=to_date,
            )
            return Response({"data": data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class TopClientPartiallyApproved(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("top_client_partially_approved", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            requirement = request.data["requirement"]
            # movement = request.data["movement"]
            line = request.data["line"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            location = request.data["location"]
            site = request.data["site"]
            site_obj = Site.objects.get(name=site)
            data = top_client_partially_approved(
                requirement, location, site, site_obj, from_date, to_date, line
            )
            return Response({"data": data})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
