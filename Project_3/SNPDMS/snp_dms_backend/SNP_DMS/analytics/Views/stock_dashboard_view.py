# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime
from common.functions import cache_api_view

# model imports
from master.models import Location, Site

# function imports
from analytics.functions import location_site_stock_data

from account.permissions import HasAllowedRoles


class DAFTSDashboard(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("dafts_dashboard", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            ref_code = data["ref_code"]
            data = {}
            stock_data = location_site_stock_data(
                ref_code=ref_code, location=location, site=site
            )
            data["stock_data"] = stock_data
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
