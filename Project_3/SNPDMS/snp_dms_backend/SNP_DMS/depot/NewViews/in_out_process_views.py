from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from common.error_logging import ErrorLogging
from depot.Services.in_out_process_services import InOutProcessService
from account.permissions import HasAllowedRoles


class GateInProcess(views.APIView):
    """
    the post function will store all IN Process data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InOutProcessService

    def post(self, request, *args, **kwargs):
        try:
            return self.service.save_in_process_data(request=request)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_200_OK,
            )


class GateOutProcess(views.APIView):
    """
    the post function will store all OUT Process data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = InOutProcessService

    def post(self, request, *args, **kwargs):
        try:
            gih_pk = request.data.get("gih_pk")
            if not gih_pk:
                return Response({"errorMsg": "Please provide gih_pk"}, status=400)
            return self.service.save_out_process_data(request, gih_pk)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_200_OK,
            )
