from ..models import *
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
from common.functions import *

from account.permissions import HasAllowedRoles
class ContainerFix(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        containers = request.data["containers"]
        site_obj = request.data["site"]
        checked_containers = []
        corrupted_containers = {}
        try:
            for each in containers:
                if ContainerInOutRecord.objects.filter(
                    container__container_no=each, container__site__name=site_obj
                ).exists():

                    if ContainerStock.objects.filter(
                        container__container_no=each,
                        container_status="IN",
                        container__status="IN",
                        container__site__name=site_obj,
                    ).exists():
                        container_stock_obj = ContainerStock.objects.get(
                            container__container_no=each,
                            container_status="IN",
                            container__status="IN",
                            container__site__name=site_obj,
                        )

                        if (
                            container_stock_obj.status == "Available"
                            or container_stock_obj.status == "Alloted"
                        ):
                            if not container_stock_obj.container.is_available:

                                container_stock_obj.container.is_available = True
                                container_stock_obj.container.save()
                                checked_containers.append(each)
                            else:
                                corrupted_containers[
                                    each
                                ] = "Container status is already available"
                        else:
                            corrupted_containers[
                                each
                            ] = "Container  status is other than available or alloted"
                    else:
                        corrupted_containers[
                            each
                        ] = "Container Record Not Found in stocks"
                else:
                    corrupted_containers[each] = "Container InOut Record Not Found"

            data = {
                "Succesfully changed containers": checked_containers,
                "Unable to changed containers": corrupted_containers,
            }
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
