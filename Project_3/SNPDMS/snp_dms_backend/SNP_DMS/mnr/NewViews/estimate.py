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
from mnr.services.estimate_service import EstimateService
from common.exceptions import ValidationError, AlreadyExists, ResourceNotFound
from common.error_logging import ErrorLogging
from rest_framework import status
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


class EstimateEntry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = EstimateService()

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            created_by = AccountUser.objects.get(username=request.user.username)
            estimate_by = MnrStaff.objects.get(pk=data["estimate_by"])

            with transaction.atomic():

                self.service.createEstimate(data, created_by, estimate_by)
            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EstimateUpdate(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = EstimateService()

    def put(self, request, pk, *args, **kwargs):
        try:
            # General Data
            data = request.data
            updated_by = AccountUser.objects.get(username=request.user.username)
            estimate_by = MnrStaff.objects.get(pk=data["estimate_by"])

            with transaction.atomic():
                self.service.updateEstimate(data, updated_by, estimate_by, pk)

            return Response({"successMsg": "Data Saved"}, status=status.HTTP_200_OK)
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
