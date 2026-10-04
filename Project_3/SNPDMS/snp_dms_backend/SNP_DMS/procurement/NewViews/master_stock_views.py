# other imports
import os
from datetime import datetime

# rest framework
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# django
from django.http import HttpResponse

# services
from procurement.services.tool_room_services import ToolRoomService

# error handling
from common.exceptions import AlreadyExists, ResourceNotFound, ValidationError
from common.error_logging import ErrorLogging

from account.permissions import HasAllowedRoles
class MasterStockTableView(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        category = payload.get("category")
        name = payload.get("name")
        sku_code = payload.get("sku_code")

        params = {"location_id": payload.get("location_id")}

        if category:
            params["category__name"] = category
        if name:
            params["name"] = name
        if sku_code:
            params["sku_code"] = sku_code

        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            main_data = ToolRoomService().getMasterStockTableData(
                params, request.data.get("on_page_data"), request.data.get("pg_no")
            )

            return Response(main_data)

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


class MasterStockReport(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        return {"location_id": payload.get("location_id")}

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            data_object_list = ToolRoomService().masterStockReportObjectList(params)
            df_data = ToolRoomService().masterStockDfData(data_object_list)
            temp_file_path = ToolRoomService().createMasterStockReport(df_data)
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="master_stock_report_{datetime.today().date()}.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

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
