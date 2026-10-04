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
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError, AlreadyExists, ResourceNotFound
from mnr.services.mnr_service import MNRService
from rest_framework import status
from account.permissions import HasAllowedRoles


class MnrDataViewBySearch(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = MNRService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site = Site.objects.get(name=data["site"], location__name=data["location"])

            response = self.service.getMNRDataBySearch(site=site, data=data)
            return Response(response, status=status.HTTP_200_OK)
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


class MnrDataViewByEdit(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = MNRService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site = Site.objects.get(name=data["site"], location__name=data["location"])
            response = self.service.getMNRDataByEdit(site=site, data=data)
            return Response(response, status=200)
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


class UnlockSurveyEstimateViews(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = MNRService()

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():

                data = request.data
                location = Location.objects.get(name=data["location"])
                site = Site.objects.get(name=data["site"], location=location)
                response = self.service.unlockSurveyEstimates(
                    data=data, site=site, location=location
                )
                if response:
                    return Response(response, status=status.HTTP_200_OK)

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
