from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from depot.Services.receipt_services import (
    HandlingReceiptService,
)
from account.permissions import HasAllowedRoles


class HandlingReceipt(views.APIView):
    """
    POST: Retrieve handling receipt data for GateInHistory.
    PUT: Update handling receipt data for GateInHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = HandlingReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.get_handling_receipt_data(pk, request, is_out=False)

    def put(self, request, pk, *args, **kwargs):
        return self.service.update_handling_receipt_data(pk, request, is_out=False)


class OutHandlingReceipt(views.APIView):
    """
    POST: Retrieve handling receipt data for GateOutHistory.
    PUT: Update handling receipt data for GateOutHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = HandlingReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.get_handling_receipt_data(pk, request, is_out=True)

    def put(self, request, pk, *args, **kwargs):
        return self.service.update_handling_receipt_data(pk, request, is_out=True)


class HandlingReceiptDownload(views.APIView):
    """
    POST: Download handling receipt PDF for GateInHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = HandlingReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.download_handling_receipt(pk, request, is_out=False)


class OutHandlingReceiptDownload(views.APIView):
    """
    POST: Download handling receipt PDF for GateOutHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = HandlingReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.download_handling_receipt(pk, request, is_out=True)
