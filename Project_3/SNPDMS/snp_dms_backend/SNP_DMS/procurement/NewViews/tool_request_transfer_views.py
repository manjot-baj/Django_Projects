# other imports
from datetime import datetime

# django
from django.db import transaction

# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# error handling
from common.exceptions import AlreadyExists, ResourceNotFound, ValidationError
from common.error_logging import ErrorLogging

# models
from procurement.models import (
    ToolTransfer,
    ToolTransferLine,
    ToolRoom,
    SharedClass,
)
from master.models import Location, Site
from procurement.services.tool_transfer_services import ToolTransferService
from account.permissions import HasAllowedRoles


class CreateToolRequest(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        params = {
            "date": datetime.strptime(payload.get("date"), "%Y-%m-%d"),
            "tool_transfer_no": payload.get("tool_transfer_no"),
            "status": "Pending",
            "location_id": payload.get("location_id"),
            "site_id": payload.get("site_id"),
            "requested_from_id": payload.get("requested_from"),
            "transfer_type": payload.get("transfer_type"),
        }
        return params

    def getLineParams(self, payload, location, site, parent):
        lineParams = []
        for each in payload.get("tool_request_line"):
            category = each.get("category_id")
            tool, _ = ToolRoom.manager.get_or_create(
                category_id=category,
                name=each.get("name"),
                location_id=location,
                site_id=site,
            )
            lineParams.append(
                {
                    "tool": tool,
                    "parent": parent,
                    "required_quantity": each.get("quantity"),
                }
            )
        return lineParams

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)

            if params.get("transfer_type") == "Site Transfer":
                if not Site.objects.filter(
                    pk=params.get("site_id"), procurement_admin=False
                ).exists():
                    raise ValidationError(
                        "Procurement Admin cannot request Site Tool Transfer"
                    )

                if not SharedClass().checkIfProcurementAdminExists(
                    params.get("location_id")
                ):
                    raise ValidationError("Does not have Procurement Admin")

            if params.get("transfer_type") == "Location Transfer":
                if not Site.objects.filter(
                    pk=params.get("site_id"), procurement_admin=True
                ).exists():
                    raise ValidationError(
                        "Only Sites with Procurement Admin enabled, can request Location Tool Transfer"
                    )

            if not Site.objects.filter(
                pk=params.get("requested_from_id"), procurement_admin=True
            ).exists():
                raise ValidationError(
                    "You can request for Tool Transfer, only from Sites with Procurement Admin enabled"
                )

            if ToolTransfer.manager.checkIfToolTransferNoExists(
                params.get("location_id"),
                params.get("site_id"),
                params.get("tool_transfer_no"),
                params.get("transfer_type"),
            ):
                raise AlreadyExists("Tool Transfer No Already Exists")

            with transaction.atomic():
                parent = ToolTransfer.manager.createToolTransfer(params)
                lineParams = self.getLineParams(
                    request.data,
                    params["location_id"],
                    params["site_id"],
                    parent,
                )

                for each in lineParams:
                    required_quantity = each.get("required_quantity")
                    if float(required_quantity) < 0:
                        raise ValidationError("required_quantity cannot be less than 0")
                    else:
                        pass

                ToolTransferLine.manager.createToolTransferLine(lineParams)
            return Response(
                {
                    "message": "Tool Transfer Request Successful, Wait for Tool Approval",
                    "tool_transfer_pk": parent.pk,
                },
                status=status.HTTP_201_CREATED,
            )
        except AlreadyExists as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
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


class GetToolTransfer(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            main_data = ToolTransferService().toolRequestFormData(pk)
            return Response(main_data, status=status.HTTP_200_OK)
        except AlreadyExists as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
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


class ApproveToolRequest(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        params = {
            "date": datetime.strptime(payload.get("date"), "%Y-%m-%d"),
            "status": payload.get("status"),
            "location_id": payload.get("location_id"),
            "site_id": payload.get("site_id"),
        }
        return params

    def put(self, request, pk, *args, **kwargs):
        try:
            tool_transfer = ToolTransfer.manager.getToolTransferById(pk)

            if tool_transfer.requested_from.pk != int(
                request.data.get("site_id")
            ) or tool_transfer.site.pk == int(request.data.get("site_id")):
                raise ValidationError(
                    f"You are not authorized to approve this Tool Transfer Request!"
                )

            params = self.getParams(request.data)
            for each in request.data.get("tool_request_line"):
                tool = ToolRoom.manager.getToolByName(
                    each.get("name"), params.get("location_id"), params.get("site_id")
                )
                line = ToolTransferLine.manager.getToolTransferLineById(each.get("pk"))
                if float(each.get("received_quantity")) > line.received_quantity:
                    quantity = float(each.get("received_quantity")) - float(
                        line.received_quantity
                    )
                    if quantity > float(tool.in_stock):
                        raise ValidationError(f"Not enough stock for tool {tool.name}")

            with transaction.atomic():
                tool_transfer = ToolTransfer.manager.getToolTransferById(pk)
                tool_transfer.date = params["date"]
                tool_transfer.status = params["status"]
                tool_transfer.save(update_fields=["date", "status"])

                for each in request.data.get("tool_request_line"):
                    received_quantity = each.get("received_quantity")
                    if float(received_quantity) < 0:
                        raise ValidationError("received_quantity cannot be less than 0")
                    else:
                        pass

                ToolTransferService().updateToolTransferLine(
                    request.data.get("tool_request_line"),
                    tool_transfer,
                    request.data.get("location_id"),
                    request.data.get("site_id"),
                )

            data = ToolTransferService().toolRequestFormData(pk)
            return Response(
                {"message": "Tool Request Approved", "data": data},
                status=status.HTTP_200_OK,
            )

        except AlreadyExists as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
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


class ToolRequestTable(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        category = payload.get("category")
        item = payload.get("item")
        sku_code = payload.get("sku_code")
        status = payload.get("status")
        site = payload.get("site_id")
        is_admin = payload.get("is_admin")
        tool_transfer_no = payload.get("tool_transfer_no")
        transfer_type = payload.get("transfer_type")
        params = {}
        if transfer_type:
            params["parent__transfer_type"] = transfer_type
        if is_admin:
            params["parent__requested_from_id"] = site
        else:
            params["parent__location_id"] = payload.get("location_id")
            params["parent__site_id"] = site
        if category:
            params["tool__category__name"] = category
        if item:
            params["tool__name"] = item
        if sku_code:
            params["tool__sku_code"] = sku_code
        if status:
            params["parent__status"] = status
        if tool_transfer_no:
            params["parent__tool_transfer_no"] = tool_transfer_no

        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)
            main_data = ToolTransferService().getToolRequestTableData(
                params, request.data
            )

            return Response(main_data, status=status.HTTP_200_OK)

        except AlreadyExists as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
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
