import os
from datetime import datetime

# django
from django.http import HttpResponse

# rest framework
from rest_framework import status
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, AlreadyExists, ValidationError

# services
from procurement.services.requisition_services import RequisitionService
from procurement.services.consumption_services import ConsumptionService
from procurement.services.tool_room_services import ToolRoomService

# models
from procurement.models import (
    ConsumptionLine,
    ToolRoom,
    RequisitionLine,
)

from account.permissions import HasAllowedRoles
class ProcurementReport(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def requisitionReport(self, from_date, to_date, location, site, category, item):
        if item:
            data_object_list = RequisitionLine.manager.getDateWiseRequisitionObjectList(
                from_date, to_date, location, site, item
            )
            df_data = RequisitionService().requisitionDfData(data_object_list, True)
            temp_file_path = RequisitionService().createRequisitionReport(
                from_date, to_date, df_data, True
            )
        else:
            data_object_list = RequisitionLine.manager.getRequisitionObjectList(
                from_date=from_date,
                to_date=to_date,
                location=location,
                site=site,
                category=category,
            )
            df_data = RequisitionService().requisitionDfData(data_object_list)
            temp_file_path = RequisitionService().createRequisitionReport(
                from_date, to_date, df_data
            )

        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/xlsx")
            file_response["Content-Disposition"] = (
                f'attachment; filename="requisition_report_{from_date} to {to_date}.xlsx"'
            )
            os.remove(temp_file_path)
        return file_response

    def consumptionReport(self, from_date, to_date, location, site, category, item):
        if item:
            data_object_list = ConsumptionLine.manager.getDateWiseConsumptionObjectList(
                from_date, to_date, location, site, item
            )

            df_data = ConsumptionService().consumptionDfData(data_object_list, True)
            temp_file_path = ConsumptionService().createConsumptionReport(
                from_date, to_date, df_data, True
            )
        else:
            data_object_list = ConsumptionLine.manager.getConsumptionDataObjectList(
                from_date=from_date,
                to_date=to_date,
                location=location,
                site=site,
                category=category,
            )
            df_data = ConsumptionService().consumptionDfData(data_object_list)
            temp_file_path = ConsumptionService().createConsumptionReport(
                from_date, to_date, df_data
            )
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/xlsx")
            file_response["Content-Disposition"] = (
                f'attachment; filename="consumption_report_{from_date} to {to_date}.xlsx"'
            )
            os.remove(temp_file_path)
        return file_response

    def inventoryReport(self, from_date, to_date, location, site):
        data_object_list = ToolRoom.manager.getInventoryDataObjectList(
            location=location,
            site=site,
            from_date=from_date,
            to_date=to_date,
        )
        df_data = ToolRoomService().inventoryDfData(data_object_list)
        temp_file_path = ToolRoomService().createInventoryReport(
            from_date, to_date, df_data
        )
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/xlsx")
            file_response["Content-Disposition"] = (
                f'attachment; filename="inventory_report_{from_date} to {to_date}.xlsx"'
            )
            os.remove(temp_file_path)
        return file_response

    def stockReport(self, from_date, to_date, location, site):
        data_object_list = ToolRoom.manager.getStockDataObjectList(
            location=location,
            site=site,
            from_date=from_date,
            to_date=to_date,
        )
        df_data = ToolRoomService().stockDfData(data_object_list)
        temp_file_path = ToolRoomService().createStockReport(
            from_date, to_date, df_data
        )
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/xlsx")
            file_response["Content-Disposition"] = (
                f'attachment; filename="stock_report_{datetime.today().date()}.xlsx"'
            )
            os.remove(temp_file_path)
        return file_response

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            try:

                from_date = datetime.strptime(data.get("from_date"), "%Y-%m-%d").date()
                to_date = datetime.strptime(data.get("to_date"), "%Y-%m-%d").date()
            except:
                raise ValidationError("Date Format is wrong!")
            location = data.get("location")
            site = data.get("site")
            item = data.get("item")
            category = data.get("category")
            report = data.get("report")
            if report == "REQUISITION REPORT":

                return self.requisitionReport(
                    from_date, to_date, location, site, category, item
                )

            elif report == "CONSUMPTION REPORT":

                return self.consumptionReport(
                    from_date, to_date, location, site, category, item
                )
            elif report == "INVENTORY REPORT":
                return self.inventoryReport(from_date, to_date, location, site)

            elif report == "STOCK REPORT":

                return self.stockReport(from_date, to_date, location, site)

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
