from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Site
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock
from django.utils import timezone
import datetime
from django.db import transaction
from common.error_logging import ErrorLogging
from rest_framework import status
from account.permissions import HasAllowedRoles


class BulkMakeAvailableView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site = Site.objects.get(name=data["site"], location__name=data["location"])
            stock_id = data["stock_id"]
            stock_object_list = None
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())

            if site.type == "DEPOT":
                stock_object_list = [
                    ContainerStock.objects.get(pk=id) for id in stock_id
                ]
            else:
                stock_object_list = [
                    NonDepotContainerStock.objects.get(pk=id) for id in stock_id
                ]
            with transaction.atomic():
                for each in stock_object_list:
                    if each.status == "Survey Pending":
                        each.survey_pending_out_date_time = now
                        each.save()
                    elif each.status == "Estimate Pending":
                        each.estimate_pending_out_date_time = now
                        each.save()
                    elif each.status == "Approval Pending":
                        each.approval_pending_out_date_time = now
                        each.save()
                    elif each.status == "Approved":
                        each.approved_out_date_time = now
                        each.save()
                    elif each.status == "Under Repairing":
                        each.under_repair_out_date_time = now
                        each.save()
                    elif each.status == "Empty Alloted":
                        each.empty_allotment_out_date_time = now
                        each.save()
                    each.stage = "Available"
                    each.status = "Available"
                    each.save()
                    each.make_available()
            return Response({"successMsg": "Data saved"}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging.log_exception(e)
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
