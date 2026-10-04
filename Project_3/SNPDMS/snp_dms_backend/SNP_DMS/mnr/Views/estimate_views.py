from re import escape
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import Location, Site
from ..models import Estimate, Survey, MnrStaff, SurveyLine
from ..functions import calculateEstimate, mnr_img_validation
from django.utils import timezone
import datetime
import logging, traceback
from django.db import transaction

from account.permissions import HasAllowedRoles


class CalculateEstimateView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            response = calculateEstimate(request.data)
            return Response(response, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class EstimateView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            created_by = AccountUser.objects.get(username=request.user.username)
            estimate_by = MnrStaff.objects.get(pk=data["estimate_by"])

            with transaction.atomic():
                # Getting Survey Data
                survey_data = None
                if Survey.checkExistById(data["survey_id"]):
                    survey_data = Survey.getById(data["survey_id"])
                else:
                    return Response(
                        {"errorMsg": "Data Not Exist with the given Survey Id"},
                        status=200,
                    )

                # if not survey_data.is_img_uploaded:
                #     return Response(
                #         {"errorMsg": "Please Upload image before Estimate Process"}
                #     )

                # Date stuff
                if len(data["date"]) == 0:
                    date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
                else:
                    try:
                        date = datetime.datetime.strptime(
                            data["date"], "%Y-%m-%d"
                        ).date()
                    except:
                        date = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date()
                        )

                # Time Stuff
                if len(data["time"]) == 0:
                    time = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )
                else:
                    try:
                        time = datetime.datetime.strptime(data["time"], "%H:%M").time()
                    except:
                        time = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                        )

                amount = data["amount"]
                if data["amount"] == "":
                    amount = None

                # Checking for draft data
                estimate_data = None
                if Estimate.checkExistByParentId(data["survey_id"]):
                    if Estimate.checkDraftExistByParentId(data["survey_id"]):
                        estimate_data = Estimate.getDraftByParentId(data["survey_id"])
                    else:
                        return Response(
                            {"errorMsg": "Estimate Already Done"}, status=200
                        )

                # Main data input
                if data["is_draft"] == "True":
                    if estimate_data is not None:
                        estimate_data.updateDraft(
                            created_by=created_by,
                            estimate_by=estimate_by,
                            date=date,
                            time=time,
                            amount=amount,
                        )
                    else:
                        estimate_data = Estimate.createDraft(
                            parent=survey_data,
                            created_by=created_by,
                            estimate_by=estimate_by,
                            date=date,
                            time=time,
                            amount=amount,
                        )
                elif data["is_proceed"] == "True":
                    if estimate_data is not None:
                        estimate_data.makeDraftToProceed(
                            created_by=created_by,
                            estimate_by=estimate_by,
                            date=date,
                            time=time,
                            amount=amount,
                        )
                        if not survey_data.estimate_number:
                            estimate_data.createNumber()
                        else:
                            estimate_data.number = survey_data.estimate_number
                            estimate_data.est_rep_common_number = (
                                survey_data.estimate_number[1:]
                            )
                            estimate_data.save(
                                update_fields=["number", "est_rep_common_number"]
                            )
                    else:
                        estimate_data = Estimate.create(
                            parent=survey_data,
                            created_by=created_by,
                            estimate_by=estimate_by,
                            date=date,
                            time=time,
                            amount=amount,
                        )
                        if not survey_data.estimate_number:
                            estimate_data.createNumber()
                        else:
                            estimate_data.number = survey_data.estimate_number
                            estimate_data.est_rep_common_number = (
                                survey_data.estimate_number[1:]
                            )
                            estimate_data.save(
                                update_fields=["number", "est_rep_common_number"]
                            )
                else:
                    return Response(
                        {"errorMsg": "Please select draft or proceed"}, status=200
                    )
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    def put(self, request, pk, *args, **kwargs):
        try:
            # General Data
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            updated_by = AccountUser.objects.get(username=request.user.username)
            estimate_by = MnrStaff.objects.get(pk=data["estimate_by"])

            with transaction.atomic():
                # Getting Estimate Data
                estimate_data = None
                if Estimate.checkExistById(pk):
                    estimate_data = Estimate.getById(pk)
                else:
                    return Response(
                        {"errorMsg": "Data Not Exist with the given Estimate Id"},
                        status=200,
                    )

                # Date stuff
                if len(data["date"]) == 0:
                    date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
                else:
                    try:
                        date = datetime.datetime.strptime(
                            data["date"], "%Y-%m-%d"
                        ).date()
                    except:
                        date = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date()
                        )

                # Time Stuff
                if len(data["time"]) == 0:
                    time = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )
                else:
                    try:
                        time = datetime.datetime.strptime(data["time"], "%H:%M").time()
                    except:
                        time = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                        )

                amount = data["amount"]
                if data["amount"] == "":
                    amount = None

                estimate_data.estimate_by = estimate_by
                estimate_data.updated_by = updated_by
                estimate_data.current_date = date
                estimate_data.current_time = time
                estimate_data.current_amount = amount
                estimate_data.save()

                if estimate_data.parent.depot is not None:
                    estimate_data.parent.depot.estimate_pending_out_date_time = (
                        datetime.datetime.combine(date, time).astimezone(
                            timezone.get_current_timezone()
                        )
                    )
                    estimate_data.parent.depot.approval_pending_in_date_time = (
                        datetime.datetime.combine(date, time).astimezone(
                            timezone.get_current_timezone()
                        )
                    )
                    estimate_data.parent.depot.pre_mnr_edi_uploaded_to_ftp = False
                    estimate_data.parent.depot.save()
                else:
                    estimate_data.parent.non_depot.estimate_pending_out_date_time = (
                        datetime.datetime.combine(date, time).astimezone(
                            timezone.get_current_timezone()
                        )
                    )
                    estimate_data.parent.non_depot.approval_pending_in_date_time = (
                        datetime.datetime.combine(date, time).astimezone(
                            timezone.get_current_timezone()
                        )
                    )
                    estimate_data.parent.non_depot.pre_mnr_edi_uploaded_to_ftp = False
                    estimate_data.parent.non_depot.save()

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)
