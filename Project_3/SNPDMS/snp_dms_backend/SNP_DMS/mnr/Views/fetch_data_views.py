from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Site
from non_depot.models import NonDepotContainerStock
from depot.models import ContainerStock
from ..models import Survey, Estimate, Approval, Repair, MnrStaff, SurveyUnlockDetail
from ..functions import *
import datetime
from django.db import transaction

from account.permissions import HasAllowedRoles


class MnrDataViewBySearch(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site = Site.objects.get(name=data["site"], location__name=data["location"])
            response = {}
            if site.type == "DEPOT":
                req_date = datetime.datetime.strptime(data["date"], "%d/%m/%Y").date()
                stock = ContainerStock.objects.get(
                    container__container_no=data["container_no"],
                    gate_in__in_date=req_date,
                    container__location__name=data["location"],
                    container__site__name=data["site"],
                )
                client = stock.container.client.ref_code
                response["container_data"] = stock.get_mnr_container_header_data()
                response["tariff_data"] = getTariffData(
                    client=client,
                    location=data["location"],
                    site=data["site"],
                )
                surveyor_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Surveyor",
                    ).values("pk", "firstName", "lastName", "role")
                )
                edp_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="EDP",
                    ).values("pk", "firstName", "lastName", "role")
                )
                worker_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Worker",
                    ).values("pk", "firstName", "lastName", "role")
                )
                response["staff_data"] = {
                    "surveyor_list": surveyor_list,
                    "edp_list": edp_list,
                    "worker_list": worker_list,
                }
                if Survey.checkExistByDepotId(stock.pk):
                    survey_data = Survey.getByDepotId(stock.pk)
                    response["survey"] = getSurveyData(
                        survey_data=survey_data,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Estimate.checkExistByParentId(survey_data.pk):
                        estimate_data = Estimate.getByParentId(survey_data.pk)
                        response["estimate"] = getEstimateData(
                            estimate_data=estimate_data,
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Approval.checkExistByParentId(estimate_data.pk):
                            approval_data = Approval.getByParentId(estimate_data.pk)
                            response["approval"] = getApprovalData(
                                approval_data=approval_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                            if Repair.checkExistByParentId(estimate_data.pk):
                                repair_data = Repair.getByParentId(estimate_data.pk)
                                response["repair"] = getRepairData(
                                    repair_data=repair_data,
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                            else:
                                response["repair"] = getRepairEntryFormat(
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                        else:
                            response["approval"] = getApprovalEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["estimate"] = getEstimateEntryFormat(
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["survey"] = getSurveyEntryFormat(
                        stock_id=stock.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            else:
                req_date = datetime.datetime.strptime(data["date"], "%d/%m/%Y").date()
                stock = NonDepotContainerStock.objects.get(
                    container__container_no=data["container_no"],
                    gate_in__in_date=req_date,
                    container__location__name=data["location"],
                    container__site__name=data["site"],
                )
                client = stock.container.client.ref_code
                response["container_data"] = stock.get_mnr_container_header_data()
                response["tariff_data"] = getTariffData(
                    client=client,
                    location=data["location"],
                    site=data["site"],
                )
                surveyor_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Surveyor",
                    ).values("pk", "firstName", "lastName", "role")
                )
                edp_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="EDP",
                    ).values("pk", "firstName", "lastName", "role")
                )
                worker_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Worker",
                    ).values("pk", "firstName", "lastName", "role")
                )
                response["staff_data"] = {
                    "surveyor_list": surveyor_list,
                    "edp_list": edp_list,
                    "worker_list": worker_list,
                }
                if Survey.checkExistByNonDepotId(stock.pk):
                    survey_data = Survey.getByNonDepotId(stock.pk)
                    response["survey"] = getSurveyData(
                        survey_data=survey_data,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Estimate.checkExistByParentId(survey_data.pk):
                        estimate_data = Estimate.getByParentId(survey_data.pk)
                        response["estimate"] = getEstimateData(
                            estimate_data=estimate_data,
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Approval.checkExistByParentId(estimate_data.pk):
                            approval_data = Approval.getByParentId(estimate_data.pk)
                            response["approval"] = getApprovalData(
                                approval_data=approval_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                            if Repair.checkExistByParentId(estimate_data.pk):
                                repair_data = Repair.getByParentId(estimate_data.pk)
                                response["repair"] = getRepairData(
                                    repair_data=repair_data,
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                            else:
                                response["repair"] = getRepairEntryFormat(
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                        else:
                            response["approval"] = getApprovalEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["estimate"] = getEstimateEntryFormat(
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["survey"] = getSurveyEntryFormat(
                        stock_id=stock.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            return Response(response, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class MnrDataViewByEdit(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site = Site.objects.get(name=data["site"], location__name=data["location"])
            response = {}
            if site.type == "DEPOT":
                stock = ContainerStock.objects.get(pk=data["stock_id"])
                client = stock.container.client.ref_code
                response["container_data"] = stock.get_mnr_container_header_data()
                response["tariff_data"] = getTariffData(
                    client=client,
                    location=data["location"],
                    site=data["site"],
                )
                surveyor_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Surveyor",
                    ).values("pk", "firstName", "lastName", "role")
                )
                edp_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="EDP",
                    ).values("pk", "firstName", "lastName", "role")
                )
                worker_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Worker",
                    ).values("pk", "firstName", "lastName", "role")
                )
                response["staff_data"] = {
                    "surveyor_list": surveyor_list,
                    "edp_list": edp_list,
                    "worker_list": worker_list,
                }
                if Survey.checkExistByDepotId(stock.pk):
                    survey_data = Survey.getByDepotId(stock.pk)
                    response["survey"] = getSurveyData(
                        survey_data=survey_data,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Estimate.checkExistByParentId(survey_data.pk):
                        estimate_data = Estimate.getByParentId(survey_data.pk)
                        response["estimate"] = getEstimateData(
                            estimate_data=estimate_data,
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Approval.checkExistByParentId(estimate_data.pk):
                            approval_data = Approval.getByParentId(estimate_data.pk)
                            response["approval"] = getApprovalData(
                                approval_data=approval_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                            if Repair.checkExistByParentId(estimate_data.pk):
                                repair_data = Repair.getByParentId(estimate_data.pk)
                                response["repair"] = getRepairData(
                                    repair_data=repair_data,
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                            else:
                                response["repair"] = getRepairEntryFormat(
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                        else:
                            response["approval"] = getApprovalEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["estimate"] = getEstimateEntryFormat(
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["survey"] = getSurveyEntryFormat(
                        stock_id=stock.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            else:
                stock = NonDepotContainerStock.objects.get(pk=data["stock_id"])
                client = stock.container.client.ref_code
                response["container_data"] = stock.get_mnr_container_header_data()
                response["tariff_data"] = getTariffData(
                    client=client,
                    location=data["location"],
                    site=data["site"],
                )
                surveyor_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Surveyor",
                    ).values("pk", "firstName", "lastName", "role")
                )
                edp_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="EDP",
                    ).values("pk", "firstName", "lastName", "role")
                )
                worker_list = list(
                    MnrStaff.objects.filter(
                        location__name=data["location"],
                        site__name=data["site"],
                        role="Worker",
                    ).values("pk", "firstName", "lastName", "role")
                )
                response["staff_data"] = {
                    "surveyor_list": surveyor_list,
                    "edp_list": edp_list,
                    "worker_list": worker_list,
                }
                if Survey.checkExistByNonDepotId(stock.pk):
                    survey_data = Survey.getByNonDepotId(stock.pk)
                    response["survey"] = getSurveyData(
                        survey_data=survey_data,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Estimate.checkExistByParentId(survey_data.pk):
                        estimate_data = Estimate.getByParentId(survey_data.pk)
                        response["estimate"] = getEstimateData(
                            estimate_data=estimate_data,
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Approval.checkExistByParentId(estimate_data.pk):
                            approval_data = Approval.getByParentId(estimate_data.pk)
                            response["approval"] = getApprovalData(
                                approval_data=approval_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                            if Repair.checkExistByParentId(estimate_data.pk):
                                repair_data = Repair.getByParentId(estimate_data.pk)
                                response["repair"] = getRepairData(
                                    repair_data=repair_data,
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                            else:
                                response["repair"] = getRepairEntryFormat(
                                    estimate_id=estimate_data.pk,
                                    location=data["location"],
                                    site=data["site"],
                                )
                        else:
                            response["approval"] = getApprovalEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["estimate"] = getEstimateEntryFormat(
                            survey_id=survey_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["survey"] = getSurveyEntryFormat(
                        stock_id=stock.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            return Response(response, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class UnlockSurveyEstimateViews(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                response = {}
                data = request.data
                location = Location.objects.get(name=data["location"])
                site = Site.objects.get(name=data["site"], location=location)
                if len(data["reason_to_unlock"]) == 0:
                    return Response(
                        {
                            "errorMsg": "Sorry, You Can't Unlock Survey, without a reason"
                        },
                        status=200,
                    )
                reason_to_unlock = data["reason_to_unlock"]
                stock_model = (
                    ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
                )
                stock = stock_model.objects.get(pk=data["stock_id"])
                client = stock.container.client.ref_code
                automatic_mnr_status_change = (
                    stock.container.automatic_mnr_status_change
                )
                if stock.stage in ["Available", "Repair"]:
                    survey = None
                    estimate = None
                    approval = None
                    repair = None
                    if site.type == "DEPOT":
                        if Survey.objects.filter(depot=stock).exists():
                            survey = Survey.objects.get(depot=stock)
                    else:
                        if Survey.objects.filter(non_depot=stock).exists():
                            survey = Survey.objects.get(non_depot=stock)
                    if Estimate.objects.filter(parent=survey).exists():
                        estimate = Estimate.objects.get(parent=survey)
                    if Approval.objects.filter(parent=estimate).exists():
                        approval = Approval.objects.get(parent=estimate)
                    if Repair.objects.filter(parent=estimate).exists():
                        repair = Repair.objects.get(parent=estimate)
                    if survey is not None:
                        survey.is_locked = False
                        survey.save()
                    if estimate is not None:
                        estimate.is_locked = False
                        estimate.save()
                    if approval is not None:
                        approval.delete()
                    if repair is not None:
                        repair.delete()
                    stock.approval_date = None
                    stock.approval_time = None
                    stock.repair_date = None
                    stock.repair_time = None
                    stock.available_date = None
                    stock.available_time = None
                    stock.estimate_status = None
                    stock.is_repair_destim_sent = False
                    stock.stage = "Approval"
                    stock.container.is_available = False
                    stock.container.save()
                    if automatic_mnr_status_change is True:
                        stock.status = "Approval Pending"
                        stock.approval_pending_out_date_time = None
                        stock.approved_in_date_time = None
                        stock.approved_out_date_time = None
                        stock.under_repair_in_date_time = None
                        stock.under_repair_out_date_time = None
                        stock.available_in_date_time = None
                        stock.available_out_date_time = None
                    stock.save()

                    # Saving unlock reason
                    SurveyUnlockDetail(
                        parent=survey, reason_to_unlock=reason_to_unlock
                    ).save()

                    # response
                    response["container_data"] = stock.get_mnr_container_header_data()
                    response["tariff_data"] = getTariffData(
                        client=client,
                        location=location,
                        site=site,
                    )
                    surveyor_list = list(
                        MnrStaff.objects.filter(
                            location=location,
                            site=site,
                            role="Surveyor",
                        ).values("pk", "firstName", "lastName", "role")
                    )
                    edp_list = list(
                        MnrStaff.objects.filter(
                            location=location,
                            site=site,
                            role="EDP",
                        ).values("pk", "firstName", "lastName", "role")
                    )
                    worker_list = list(
                        MnrStaff.objects.filter(
                            location=location,
                            site=site,
                            role="Worker",
                        ).values("pk", "firstName", "lastName", "role")
                    )
                    response["staff_data"] = {
                        "surveyor_list": surveyor_list,
                        "edp_list": edp_list,
                        "worker_list": worker_list,
                    }
                    if survey is not None:
                        response["survey"] = getSurveyData(
                            survey_data=survey,
                            location=data["location"],
                            site=data["site"],
                        )
                        if estimate is not None:
                            response["estimate"] = getEstimateData(
                                estimate_data=estimate,
                                survey_id=survey.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                            response["approval"] = getApprovalEntryFormat(
                                estimate_id=estimate.pk,
                                location=data["location"],
                                site=data["site"],
                            )

                    return Response(response, status=200)
                else:
                    return Response(
                        {
                            "errorMsg": "Sorry, You Can't Unlock Survey, Estimate and Approval"
                        },
                        status=200,
                    )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
