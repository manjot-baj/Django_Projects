from datetime import datetime

# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# error handling
from common.exceptions import ResourceNotFound, AlreadyExists, ValidationError
from common.error_logging import ErrorLogging

# services
from procurement.services.tool_room_services import ToolRoomService
from account.permissions import HasAllowedRoles

class ToolRateHistoryView(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):

        from_date = payload.get("from_date")
        to_date = payload.get("to_date")
        name = payload.get("name")
        category = payload.get("category")
        location = payload.get("location_id")
        site = payload.get("site_id")
        params = {
            "location_id": location,
            "site_id": site,
        }
        if from_date and to_date:
            from_time = (
                datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).time()
            )
            to_time = (
                datetime.now()
                .replace(hour=23, minute=59, second=0, microsecond=0)
                .time()
            )
            from_date_obj = datetime.strptime(from_date, "%Y-%m-%d")
            to_date_obj = datetime.strptime(to_date, "%Y-%m-%d")
            from_date_time = datetime.combine(from_date_obj, from_time)
            to_date_time = datetime.combine(to_date_obj, to_time)
            params["created_at__range"] = (from_date_time, to_date_time)
        if name:
            params["tool__name"] = name
        if category:
            params["tool__category__name"] = category

        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            main_data = ToolRoomService().toolRateHistory(params, request.data)
            return Response(main_data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
