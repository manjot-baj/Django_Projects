# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime

# function import
from analytics.functions import mnr_plywood_material, total_mnr_data
from common.functions import cache_api_view

# model_import
from master.models import Location, Site
from account.permissions import HasAllowedRoles

class MaterialAnalyticsMNR(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("material_analytics", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            requirement = request.data["requirement"]

            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            data = mnr_plywood_material(
                requirement=requirement, location=location, site=site
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class TotalMNRData(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("total_mnr_data", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            location = Location.objects.get(name=request.data["location"])
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            line = request.data["line"]
            site = Site.objects.get(name=request.data["site"])
            data = total_mnr_data(
                from_date=from_date,
                to_date=to_date,
                location=location,
                site=site,
                line=line,
            )
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
