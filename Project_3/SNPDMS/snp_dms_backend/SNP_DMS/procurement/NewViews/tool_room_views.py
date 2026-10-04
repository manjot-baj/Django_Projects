import os
import shutil
from SNP_DMS.settings.base import BASE_DIR

# django
from django.http import HttpResponse
from django.db import transaction

# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# Error management
from common.exceptions import AlreadyExists, ResourceNotFound, ValidationError
from common.error_logging import ErrorLogging

# services
from procurement.services.tool_room_services import ToolRoomService

# models
from procurement.models import ToolRoom, ToolCategory

from account.permissions import HasAllowedRoles
class CreateTool(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):

        category = ToolCategory.manager.getOrCreateCategoryByName(
            payload.get("category")
        )
        params = {
            "location_id": payload.get("location"),
            "site_id": payload.get("site"),
            "category": category,
            "name": payload.get("name"),
            "sku_code": payload.get("sku_code"),
            "rate": payload.get("rate"),
            "unit": payload.get("unit"),
            "in_stock": payload.get("in_stock"),
        }
        return params

    def post(self, request, *args, **kwargs):

        try:
            with transaction.atomic():
                params = self.getParams(request.data)
                tool_exist_params = {
                    "name": params["name"],
                    "category": params["category"],
                    "location_id": params["location_id"],
                    "site_id": params["site_id"],
                    "sku_code": params["sku_code"],
                }
                ToolRoom.manager.checkToolNameExistence(
                    params["name"],
                    params["category"],
                    params["location_id"],
                    params["site_id"],
                )
                ToolRoom.manager.checkSKUExistence(
                    params["sku_code"], params["location_id"], params["site_id"]
                )

                tool = ToolRoom.manager.createTool(params)
                if float(params.get("in_stock")) > float(0):
                    value = float(tool.in_stock)
                    ToolRoomService().automateRequisition(params, tool, value)

            return Response(
                {"message": "Tool created successfully"}, status=status.HTTP_201_CREATED
            )

        except AlreadyExists as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetTool(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):

        try:

            tool = ToolRoomService().getTool(pk)

            return Response({"message": "Tool Found", "data": tool})

        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                    "data": None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateTool(CreateTool, APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:

            with transaction.atomic():
                params = super().getParams(request.data)

                if ToolRoom.manager.toolExists(params, exclude_pk=pk):
                    raise AlreadyExists(
                        f"Tool with name {params.get('name')} already exists"
                    )

                ToolRoomService().updateTool(pk, params, request.user)
                tool = ToolRoomService().getTool(pk)
            return Response(
                {"message": "Tool updated successfully!", "data": tool},
                status=status.HTTP_200_OK,
            )

        except AlreadyExists as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListTools(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            tool_list = ToolRoomService().toolList(request.data)

            return Response(tool_list, status=status.HTTP_200_OK)

        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                    "data": None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteTool(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            not_deleted_tools = ToolRoomService().deleteTool(request.data)
            if not_deleted_tools:
                return Response(
                    {
                        "message": f"Can't Delete {not_deleted_tools}, data have dependencies"
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            return Response(
                {"message": "Tool deleted succesfully!"}, status=status.HTTP_200_OK
            )
        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as e:
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


class DownloadToolUploadSampleFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            try:
                temp_file_path = os.path.join(
                    BASE_DIR, "sample_stock/sample_upload_tool_master.xlsx"
                )
            except:
                raise ResourceNotFound("File not found")
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_upload_tool_master.xlsx"'
                )
            return file_response

        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UploadToolsExcel(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            tool_room = ToolRoomService()
            extracted_data_list = tool_room.extractDataList(request.data["file"])
            correct_data, error_data, error_data_msg = tool_room.checkErrors(
                extracted_data_list, request.data["location"], request.data["site"]
            )
            response_file = tool_room.collectMainData(
                correct_data, error_data, error_data_msg
            )
            if response_file == "Header Not Found" or response_file is False:
                raise ValidationError(
                    "Unable to import data, due to data file mismatch"
                )
            else:

                return Response(response_file, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ImportTools(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    def post(self, request, *args, **kwargs):
        try:
            tool = ToolRoomService()
            location = request.data["location"]
            site = request.data["site"]

            if tool.checkToolExistence(request.data["importable_data"], location, site):
                raise AlreadyExists("Data Already Exists!")

            with transaction.atomic():
                tool.uploadBulkToolData(request.data["importable_data"], location, site)
            return Response(
                {"message": "Tool added in inventory!"}, status=status.HTTP_201_CREATED
            )
        except AlreadyExists as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadRejectedDataFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=422)
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]
            tool = ToolRoomService()

            tool_room_df_data = tool.extractDataForRejectedFile(data)

            if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

            new_temp_file_path = os.path.join(
                BASE_DIR, "temp/sample_stock/sample_upload_tool_master.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_upload_tool_master.xlsx"
            )

            shutil.copyfile(temp_file_path, new_temp_file_path)

            tool.writeDataToExcel(new_temp_file_path, tool_room_df_data, faults)

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    'attachment; filename="rejected_tool_file.xlsx"'
                )

            os.remove(new_temp_file_path)

            return file_response

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
