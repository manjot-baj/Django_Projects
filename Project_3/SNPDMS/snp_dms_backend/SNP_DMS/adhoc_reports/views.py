# Standard Library Imports
import logging
import traceback

# Third-Party Packages
from decouple import config

# Django Utilities
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

# Model
## Adhoc
from .models import AdhocReportRequest
from .utils import download_adhoc_report_from_s3
from common.functions import delete_file
from account.permissions import HasAllowedRoles

class AdhocReportRequestListView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            query = Q()
            if data.get("report_type"):
                query &= Q(report_type=data["report_type"])
            if data.get("status"):
                query &= Q(status=data["status"])
            if data.get("email_sent") is not None:
                query &= Q(email_sent=data["email_sent"])
            if data.get("location"):
                query &= Q(location=data["location"])
            if data.get("site"):
                query &= Q(site=data["site"])
            report_requests = AdhocReportRequest.objects.filter(query)
            data = [
                {
                    "id": obj.id,
                    "from_date": obj.from_date.strftime("%Y-%m-%d"),
                    "to_date": obj.to_date.strftime("%Y-%m-%d"),
                    "report_type": obj.report_type,
                    "status": obj.status,
                    "email_sent": obj.email_sent,
                    "location": obj.location,
                    "site": obj.site,
                    "created_at": obj.created_at.date().strftime("%Y-%m-%d"),
                    "updated_at": obj.updated_at.date().strftime("%Y-%m-%d"),
                    "s3_file_name": obj.s3_file_name,
                    "s3_object_name": obj.s3_object_name,
                }
                for obj in report_requests
            ]
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response(
                {"errorMsg": str(e)}, status=status.HTTP_417_EXPECTATION_FAILED
            )


class AdhocReportRequestView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    def get(self, request, pk, *args, **kwargs):
        try:
            report_request = get_object_or_404(AdhocReportRequest, pk=pk)
            return download_adhoc_report_from_s3(report_request)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response(
                {"errorMsg": str(e)}, status=status.HTTP_417_EXPECTATION_FAILED
            )

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            report_request, created = AdhocReportRequest.objects.get_or_create(
                from_date=data.get("from_date"),
                to_date=data.get("to_date"),
                status="Pending",
                report_type=data.get("report_type"),
                location=data.get("location"),
                site=data.get("site"),
            )

            if not created:
                return Response(
                    {
                        "errorMsg": "Report Request Already Exists. Please check the Report Request table for updates."
                    },
                    status=status.HTTP_208_ALREADY_REPORTED,
                )

            return Response(
                {
                    "successMsg": "Report Request Saved for Processing. Please check the Report Request table for updates."
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response(
                {"errorMsg": str(e)}, status=status.HTTP_417_EXPECTATION_FAILED
            )


class AdhocReportRequestBulkDeleteView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            pk_list = request.data.get("pk_list", [])
            if not pk_list:
                return Response(
                    {"errorMsg": "No IDs provided"}, status=status.HTTP_400_BAD_REQUEST
                )
            bucket_name = config("AWS_STORAGE_BUCKET_NAME")
            for each in AdhocReportRequest.objects.filter(pk__in=pk_list):
                delete_file(bucket=bucket_name, object_name=each.s3_object_name)
                each.delete()
            return Response(
                {"successMsg": "Request Reports Deleted"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response(
                {"errorMsg": str(e)}, status=status.HTTP_417_EXPECTATION_FAILED
            )
