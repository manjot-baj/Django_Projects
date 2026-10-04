from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
from master.models import Location, Site
from procurement.models import ToolRoom, ToolTransfer, Requisition, Consumption
from account.permissions import HasAllowedRoles


class DeleteProcurementStockViews(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Automation", "Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"], location=location)
            ToolRoom.manager.filter(location=location, site=site).delete()
            Requisition.manager.filter(location=location, site=site).delete()
            Consumption.manager.filter(location=location, site=site).delete()
            ToolTransfer.manager.filter(location=location, site=site).delete()
            return Response({"successMsg": "Procurement data deleted"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)
