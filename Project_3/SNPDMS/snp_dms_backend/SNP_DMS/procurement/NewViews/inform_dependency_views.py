# rest framework
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status

# error handling
from common.exceptions import ResourceNotFound
from common.error_logging import ErrorLogging

# services
from procurement.services.tool_room_services import ToolRoomService
from procurement.services.consumption_services import ConsumptionService
from procurement.services.requisition_services import RequisitionService
from procurement.services.tool_transfer_services import ToolTransferService

# models
from procurement.models import SharedClass

from account.permissions import HasAllowedRoles


class ToolsDropdown(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            fields = request.data.get("fields")
            id = request.data.get("id")
            location = request.data.get("location")
            site = request.data.get("site")
            main_data = {}
            tool = ToolRoomService()
            if "tool_list_under_category" in fields:
                main_data["tool_list_under_category"] = (
                    tool.toolListForDropdownByCategory(id, location, site)
                )
            if "get_tool_data_by_id" in fields:
                main_data["tool_data"] = tool.toolInfo(request.data)
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


class ProcurementDropdownAndOrderNo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            fields = data.get("fields")
            location = data.get("location_id")
            site = data.get("site_id")
            transfer_type = data.get("transfer_type", None)
            main_data = {}

            if "category_list" in fields:
                tool = ToolRoomService()
                main_data["category_list"] = tool.toolCategories(location, site)
            if "tools_list" in fields:
                tool = ToolRoomService()
                main_data["tools_list"] = tool.toolListForDropdown(location, site)
            if "requisition_order_no" in fields:
                requistion = RequisitionService()
                main_data["requisition_order_no"] = requistion.requisitionOrderNo(
                    location, site
                )
            if "consumption_order_no" in fields:
                consumption = ConsumptionService()
                main_data["consumption_order_no"] = consumption.consumptionNo(
                    location, site
                )
            if "tool_transfer_no" in fields and transfer_type is not None:
                main_data["tool_transfer_no"] = ToolTransferService().toolTransferNo(
                    location, site, transfer_type
                )
            if "admin_sites" in fields:
                main_data["admin_sites"] = SharedClass().adminSites(location)

            if "all_admin_sites" in fields:
                main_data["all_admin_sites"] = SharedClass().allAdminSites(site)

            if "sku_codes" in fields:
                tool = ToolRoomService()
                main_data["sku_codes"] = tool.skuCodes(location, site)
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
