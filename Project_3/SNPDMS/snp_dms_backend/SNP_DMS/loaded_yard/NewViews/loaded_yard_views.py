
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db import transaction
from loaded_yard.services.loaded_yard_service import LoadedYardService
from rest_framework import status
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, ValidationError, AlreadyExists
from master.models import Site
from datetime import datetime

from account.permissions import HasAllowedRoles
class ListLoadedYard(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def getParams(self, payload):

        location = payload.get("location")
        site = payload.get("site")
        container_no = payload.get("container_no")
        size = payload.get("size")
        in_date = payload.get("in_date")
        out_date = payload.get("out_date")
        history = payload.get("history")
        booking_no = payload.get("booking_no")
        port = payload.get("port")
        params = {}
        if location:
            params["location__name"] = location
        if site:
            params["site__name"] = site
        if container_no:
            params["container_no"] = container_no
        if size:
            params["type_size"] = size
        if in_date["from"] and in_date["to"]:
            params["iit_date__range"] = (in_date["from"], in_date["to"])
        if out_date["from"] and out_date["to"]:
            params["dvan_date__range"] = (out_date["from"], out_date["to"])
        if booking_no:
            params["booking_no"] = booking_no
        if port:
            params["port"] = port
        if history == "True":
            params["process_type"] = "OUT"
        else:
            params["process_type"] = "IN"

        return params

    def post(self, request):
        try:
            params = self.getParams(request.data)
            page_no = request.data.get("pg_no")
            on_page_data = request.data.get("on_page_data")
            data = self.service.getLoadedYardData(params, on_page_data, page_no)
            return Response(data, status=status.HTTP_200_OK)

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


class LoadedYardINContainerDetails(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def post(self, request, *args, **kwargs):

        try:
            data = request.data
            container_no = data["container_no"]
            location = data["location"]
            site = data["site"]
            site_obj = Site.objects.get(name=site)
            if site_obj.organization == "Golden Horn Containers Service":
                data = self.service.getDetailOfINContainer(container_no, location, site)
            else:
                data = self.service.clientSpecificDetailOfINContainer(
                    container_no, location, site
                )
            return Response(data, status=status.HTTP_200_OK)
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


class LoadedYardOUTContainerDetails(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data["container_no"]
            location = data["location"]
            site = data["site"]
            site_obj = Site.objects.get(name=site)
            if site_obj.organization == "Golden Horn Containers Service":
                data = self.service.getDetailOfOutContainer(
                    container_no, location, site
                )
            else:
                data = self.service.clientSpecificDetailOfOutContainer(
                    container_no, location, site
                )

            return Response(data, status=status.HTTP_200_OK)
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


class GetLoadedYardEDI(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            stock_id = data["stock_id"]

            attachment_list = self.service.getMoveCodeContentByCheckbox(stock_id)

            edi_content = "".join(attachment_list)
            temp_file_path = self.service.makeLoadedYardEdiFile(edi_content)

            return self.service.downloadLoadedYardEdi(temp_file_path)

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetClientSpecificData(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def get(self, request, pk, *args, **kwargs):
        try:
            data = self.service.getClientSpecificContainerData(pk=pk)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateLoadedYard(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def put(self, request, *args, **kwargs):
        try:

            if not request.data["container_no"]:
                raise ValidationError("Container Number is mandatory")
            if not request.data["size"]:
                raise ValidationError("Size is mandatory")

            # Checks if specific move with same date and container not exists or not
            move_codes = self.service.validateMoveCodesClientSpecific(request.data)
            if move_codes:
                raise AlreadyExists(
                    f"{move_codes} dates already exists for {request.data['container_no']}"
                )

            with transaction.atomic():
                self.service.updateInstance(request.data)
            return Response(
                {"successMsg": "Data Updated Successfully"}, status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetLoadedYardDataForInOut(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data["container_no"]
            process = data["process_type"]
            location = data["location"]
            site = data["site"]

            date = datetime.strptime(data["date"], "%d/%m/%Y").date()
            response = self.service.getLoadedYardDataForInOut(
                process=process,
                date=date,
                container_no=container_no,
                location=location,
                site=site,
            )

            return Response(response, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
