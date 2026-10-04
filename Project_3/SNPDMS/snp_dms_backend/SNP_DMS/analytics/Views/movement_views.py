# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
from common.functions import cache_api_view


# model_import
from master.models import Location, Site

# function imports
from analytics.functions import (
    top_consignee_shipper,
    top_transporter,
    top_cargo,
)
from account.permissions import HasAllowedRoles


class TopConsigneeShipper(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("top_consignee_shipper", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            # data = {}
            requirement = request.data["requirement"]
            line = request.data["line"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            # movement = request.data["movement"]
            location = Location.objects.get(name=request.data["location"])

            site = Site.objects.get(name=request.data["site"])
            data = top_consignee_shipper(
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            return Response({"data": data})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class TopTransporter(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("top_transporter", time=86400)
    def post(self, request, *args, **kwargs):
        try:

            requirement = request.data["requirement"]
            movement = request.data["movement"]
            line = request.data["line"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            data = top_transporter(
                requirement=requirement,
                location=location,
                site=site,
                movement=movement,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            return Response({"data": data})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class TopCargo(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Analytics",
        "Admin",
    ]

    @cache_api_view("top_cargo", time=86400)
    def post(self, request, *args, **kwargs):
        try:

            requirement = request.data["requirement"]
            # movement = request.data["movement"]
            line = request.data["line"]
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            data = top_cargo(
                requirement=requirement,
                location=location,
                site=site,
                from_date=from_date,
                to_date=to_date,
                line=line,
            )
            return Response({"data": data})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
