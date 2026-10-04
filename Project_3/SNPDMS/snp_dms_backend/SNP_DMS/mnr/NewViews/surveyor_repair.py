from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from common.functions import get_location_site

from ..models import Repair, Approval
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from mnr.services.repair_service import RepairService
from account.permissions import HasAllowedRoles


class GetRepairData(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    service = RepairService()

    def getParams(self, data):
        container_no = data.get("container_no")
        location, site = get_location_site(
            location_name=data.get("location"), site_name=data.get("site")
        )
        return container_no, location, site

    def post(self, request, *args, **kwargs):

        try:
            container_no, location, site = self.getParams(data=request.data)
            model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
            if site.type == "DEPOT":

                params = {
                    "parent__parent__depot__container__location": location,
                    "parent__parent__depot__container__site": site,
                    "parent__parent__depot__container_status": "IN",
                }
            else:
                params = {
                    "parent__parent__non_depot__container__location": location,
                    "parent__parent__non_depot__container__site": site,
                    "parent__parent__non_depot__container_status": "IN",
                }
            staff_data = self.service.staffData(location, site)

            if Repair.objects.filter(
                is_img_uploaded=False,
                **params,
            ).exists():
                repair = Repair.objects.filter(is_img_uploaded=False, **params).first()
                repair_container_no = (
                    repair.parent.parent.depot.container.container_no
                    if site.type == "DEPOT"
                    else repair.parent.parent.non_depot.container.container_no
                )
                stock = model.objects.get(
                    container__container_no=repair_container_no,
                    container__location=location,
                    container__site=site,
                    container_status="IN",
                )
                repair_data = self.service.getRepairData(
                    repair, repair_container_no, stock, staff_data
                )
            stock = model.objects.get(
                container__container_no=container_no,
                container__location=location,
                container__site=site,
                container_status="IN",
            )
            if site.type == "DEPOT":
                params.pop("parent__parent__depot__container__location")
                params.pop("parent__parent__depot__container__site")
                params["parent__parent__depot"] = stock
            else:
                params.pop("parent__parent__non_depot__container__location")
                params.pop("parent__parent__non_depot__container__site")
                params["parent__parent__non_depot"] = stock

            if Repair.objects.filter(**params).exists():
                repair = Repair.objects.get(**params)
                repair_container_no = (
                    repair.parent.parent.depot.container.container_no
                    if site.type == "DEPOT"
                    else repair.parent.parent.non_depot.container.container_no
                )
                repair_data = self.service.getRepairData(
                    repair, repair_container_no, stock, staff_data
                )
            else:
                if Approval.objects.filter(
                    **params,
                    is_approved=True,
                ).exists():
                    approval = Approval.objects.get(
                        **params,
                        is_approved=True,
                    )
                    approval_container_no = (
                        approval.parent.parent.depot.container.container_no
                        if site.type == "DEPOT"
                        else approval.parent.parent.non_depot.container.container_no
                    )
                    repair_data = self.service.getApprovalData(
                        approval_container_no, approval, stock, staff_data
                    )
                else:
                    raise ValidationError("Container not founnd in Repair Stage")

            return Response(repair_data, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Something went wrong, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetContainersList(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def getParams(self, data):

        location, site = get_location_site(
            location_name=data.get("location"), site_name=data.get("site")
        )
        return location, site

    def post(self, request, *args, **kwargs):
        try:
            location, site = self.getParams(data=request.data)
            model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
            stocks = model.objects.filter(
                container__location=location,
                container__site=site,
                container_status="IN",
            )
            if site.type == "DEPOT":
                params = {"parent__parent__depot__in": stocks}
                sel_rel = "parent__parent__depot__container"
                values = "parent__parent__depot__container__container_no"
            else:
                params = {"parent__parent__non_depot__in": stocks}
                sel_rel = "parent__parent__non_depot__container"
                values = "parent__parent__non_depot__container__container_no"

            approved_containers = list(
                Approval.objects.select_related(sel_rel)
                .filter(**params, is_approved=True)
                .values_list(values, flat=True)
            )
            complete_containers = list(
                Repair.objects.select_related(sel_rel)
                .filter(**params, placement=True, complete=True)
                .values_list(values, flat=True)
            )

            complete_pending_containers = list(
                Repair.objects.select_related(sel_rel)
                .filter(**params, placement=True, complete=False)
                .values_list(values, flat=True)
            )
            placement_pending_containers = list(
                set(approved_containers)
                - (set(complete_pending_containers) | set(complete_containers))
            )
            return Response(
                {
                    "placement_pending_containers": placement_pending_containers,
                    "complete_pending_containers": complete_pending_containers,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Something went wrong, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
