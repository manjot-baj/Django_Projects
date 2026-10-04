from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from depot.Services.gate_pass_services import GatePassService
from account.permissions import HasAllowedRoles


class GateInpass(views.APIView):
    """API to download gate-in pass PDF."""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = GatePassService

    def post(self, request, pk, *args, **kwargs):
        return self.service.generate_gate_in_pass(request, pk)


class GateOutpass(views.APIView):
    """API to download gate-out pass PDF."""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = GatePassService

    def post(self, request, pk, *args, **kwargs):
        return self.service.generate_gate_out_pass(request, pk)
