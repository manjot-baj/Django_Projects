from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decouple import config
from common.functions import get_location_site

from ..models import Repair, AfterRepairImage, Approval, MnrStaff, SurveyLine
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock


import logging, traceback
from account.permissions import HasAllowedRoles

AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


class GetRepairData(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def params(self, data):
        container_no = data.get("container_no")
        location, site = get_location_site(
            location_name=data.get("location"), site_name=data.get("site")
        )
        return container_no, location, site

    def staff_data(self, location, site):
        return [
            {
                "name": f"{staff['firstName']} {staff['lastName'] or ''}",
                "pk": staff["pk"],
            }
            for staff in MnrStaff.objects.filter(
                location=location, site=site, role="Worker"
            ).values("firstName", "lastName", "pk")
        ]

    def get_repair_data(self, repair, repair_container_no, stock, staff_data):
        man_hours = sum(
            list(
                SurveyLine.objects.filter(parent=repair.parent.parent).values_list(
                    "labour_hrs_tariff", flat=True
                )
            )
        )

        return {
            "pk": repair.pk,
            "container_no": repair_container_no or "",
            "repair_id": repair.pk,
            "is_draft": repair.is_draft,
            "is_proceed": repair.is_proceed,
            "estimate_id": repair.parent.pk,
            "number": repair.number or "",
            "created_by": repair.created_by.username or "",
            "updated_by": repair.updated_by.username or "",
            "line": stock.container.shipping_line.name or "",
            "size_type": f"{stock.container.size.name} / {stock.container.type.name}"
            or "",
            "in_date": stock.gate_in.in_date or "",
            "condition": stock.get_mnr_container_header_data()["condition"],
            "placement": repair.placement,
            "complete": repair.complete,
            "damage_category": repair.damage_category or "",
            "placement_date": repair.placement_date or "",
            "placement_time": (
                repair.placement_time.strftime("%H:%M") if repair.placement_time else ""
            ),
            "repair_date": repair.repair_date or "",
            "repair_time": (
                repair.repair_time.strftime("%H:%M") if repair.repair_time else ""
            ),
            "current_repair_date": repair.current_repair_date or "",
            "current_repair_time": (
                repair.current_repair_time.strftime("%H:%M")
                if repair.current_repair_time
                else ""
            ),
            "grade": repair.grade or "",
            "remarks": repair.remarks or "",
            "location": stock.container.location.name or "",
            "site": stock.container.site.name or "",
            "man_power": [each.pk for each in repair.man_power.all()],
            "is_img_uploaded": repair.is_img_uploaded,
            "man_hours": man_hours,
            "image_data": [
                {
                    "pk": image.pk,
                    "s3_object_name": image.s3_object_name,
                    "s3_file_name": image.s3_file_name,
                    "s3_image_link": f"https://{AWS_REPAIR_IMAGE_BUCKET_NAME}.s3.amazonaws.com/{image.s3_object_name}",
                }
                for image in AfterRepairImage.objects.filter(parent=repair)
            ],
            "staff_data": staff_data,
        }

    def get_approval_data(self, approval_container_no, approval, stock, staff_data):
        return {
            "container_no": approval_container_no or "",
            "estimate_id": approval.parent.pk,
            "line": stock.container.shipping_line.name or "",
            "size_type": f"{stock.container.size.name} / {stock.container.type.name}"
            or "",
            "in_date": stock.gate_in.in_date or "",
            "condition": stock.get_mnr_container_header_data()["condition"],
            "location": stock.container.location.name or "",
            "site": stock.container.site.name or "",
            "staff_data": staff_data,
            "man_hours": "",
        }

    def post(self, request, *args, **kwargs):

        try:
            container_no, location, site = self.params(data=request.data)
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
            staff_data = self.staff_data(location, site)

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
                repair_data = self.get_repair_data(
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
                repair_data = repair_data = self.get_repair_data(
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
                    repair_data = self.get_approval_data(
                        approval_container_no, approval, stock, staff_data
                    )
                else:
                    return Response(
                        {"errorMsg": "Container not founnd in Repair Stage"}
                    )

            return Response(repair_data)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class GetContainersList(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def params(self, data):

        location, site = get_location_site(
            location_name=data.get("location"), site_name=data.get("site")
        )
        return location, site

    def post(self, request, *args, **kwargs):
        try:
            location, site = self.params(data=request.data)
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
                }
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)
