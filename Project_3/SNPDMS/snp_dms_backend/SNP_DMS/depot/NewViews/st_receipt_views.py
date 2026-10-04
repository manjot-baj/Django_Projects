from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from depot.Services.receipt_services import (
    SelfTransportationReceiptService,
)
from account.permissions import HasAllowedRoles


class SelfTransportationReceipt(views.APIView):
    """
    POST: Retrieve self-transportation receipt data for GateInHistory.
    PUT: Update self-transportation receipt data for GateInHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = SelfTransportationReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.get_self_transportation_receipt_data(
            pk, request, is_out=False
        )

    def put(self, request, pk, *args, **kwargs):
        return self.service.update_self_transportation_receipt_data(
            pk, request, is_out=False
        )


class OutSelfTransportationReceipt(views.APIView):
    """
    POST: Retrieve self-transportation receipt data for GateOutHistory.
    PUT: Update self-transportation receipt data for GateOutHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = SelfTransportationReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.get_self_transportation_receipt_data(
            pk, request, is_out=True
        )

    def put(self, request, pk, *args, **kwargs):
        return self.service.update_self_transportation_receipt_data(
            pk, request, is_out=True
        )


class SelfTransportationReceiptDownload(views.APIView):
    """
    POST: Download self-transportation receipt PDF for GateInHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = SelfTransportationReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.download_self_transportation_receipt(
            pk, request, is_out=False
        )


class OutSelfTransportationReceiptDownload(views.APIView):
    """
    POST: Download self-transportation receipt PDF for GateOutHistory.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = SelfTransportationReceiptService

    def post(self, request, pk, *args, **kwargs):
        return self.service.download_self_transportation_receipt(
            pk, request, is_out=True
        )
