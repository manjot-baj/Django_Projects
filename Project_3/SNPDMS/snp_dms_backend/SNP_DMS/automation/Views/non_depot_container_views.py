from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback
import logging
from django.db import transaction


from master.models import Location, Site
from non_depot.models import NonDepotContainer
from account.permissions import HasAllowedRoles


class DeleteNonDepotContainer(views.APIView):
    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data.get("container_no")
            location = Location.objects.get(name=data.get("location"))
            site = Site.objects.get(name=data.get("site"))
            if not NonDepotContainer.objects.filter(
                container_no=container_no, location=location, site=site
            ).exists():
                return Response({"errorMsg": "Given container does not exist"})
            with transaction.atomic():
                NonDepotContainer.objects.filter(
                    container_no=container_no, location=location, site=site
                ).delete()
            return Response({"successMsg": "NonDepotContainer deleted successfully"})
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
