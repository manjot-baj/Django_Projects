from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from depot.Services.do_challan_services import DoFileProcessService
from account.permissions import HasAllowedRoles


class InProcessDoFile(APIView):
    """
    API view to handle upload and download of DO challan files for gate-in process.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = DoFileProcessService

    def get(self, request, pk, *args, **kwargs):
        """
        Handle GET requests to download DO challan file for gate-in process.
        """
        return self.service.process_in_do_file(request, pk)

    def post(self, request, pk, *args, **kwargs):
        """
        Handle POST requests to upload DO challan file for gate-in process.
        """
        return self.service.process_in_do_file(request, pk)


class OutProcessDoFile(APIView):
    """
    API view to handle upload and download of DO challan files for gate-out process.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = DoFileProcessService

    def get(self, request, pk, *args, **kwargs):
        """
        Handle GET requests to download DO challan file for gate-out process.
        """
        return self.service.process_out_do_file(request, pk)

    def post(self, request, pk, *args, **kwargs):
        """
        Handle POST requests to upload DO challan file for gate-out process.
        """
        return self.service.process_out_do_file(request, pk)
