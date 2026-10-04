from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from ..models import Estimate, Approval
import datetime
from django.db import transaction
from common.exceptions import ValidationError, AlreadyExists, ResourceNotFound
from common.error_logging import ErrorLogging
from mnr.services.approval_service import ApprovalService
from rest_framework import status
from account.permissions import HasAllowedRoles


class ApprovalView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = ApprovalService()

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            app_user = AccountUser.objects.get(username=request.user.username)
            with transaction.atomic():
                self.service.approvalEntry(data, app_user)
            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
