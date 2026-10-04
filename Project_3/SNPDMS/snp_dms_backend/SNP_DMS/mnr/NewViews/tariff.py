import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from ..models import TariffMaster, TariffMasterLine

from django.http import HttpResponse
from django.db import transaction
from mnr.services.tariff_service import TariffService
from rest_framework import status
from common.error_logging import ErrorLogging
from common.exceptions import AlreadyExists, ValidationError, ResourceNotFound
from account.permissions import HasAllowedRoles


class TariffRowDataApiView(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = TariffService()

    def post(self, request, *args, **kwargs):
        try:
            data = self.service.getTariffData(request.data)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {e} ]"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ListTariff(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = TariffService()

    def getParams(self, payload):
        params = {
            "location__name": payload.get("location", ""),
            "site__name": payload.get("site", ""),
        }
        if payload.get("client", ""):
            params["client"] = payload.get("client")

        return params

    def post(self, request, *args, **kwargs):

        try:
            params = self.getParams(request.data)

            data = self.service.getListOfTariff(params)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DowloadTariff(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = TariffService()

    def post(self, request, *args, **kwargs):

        try:
            data = request.data
            if len(data) > 1:
                raise ValidationError("Only Single Client Tariff is Downloadable")
            pk = data[0]
            main_data = self.service.getTariffExcelData(pk)
            temp_file_path = self.service.makeTariffExcel(main_data)

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="{main_data["client"]}_tariff.xlsx"'
                )
                os.remove(temp_file_path)
                return file_response
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UploadTariff(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = TariffService()

    def post(self, request, *args, **kwargs):

        try:
            data = request.data
            file = data["file"]
            client = data["client"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])

            self.service.uploadTariff(file, client, location, site)
            return Response({"successMsg": "Data Saved"}, status=200)
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UploadSpecificLocationCodeDesc(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = TariffService()

    def post(self, request, *args, **kwargs):

        try:
            data = request.data
            file = data["file"]
            self.service.extractSpecificLocationExcelData(input_excel=file)
            return Response(
                {"successMsg": f"Data Saved"},
                status=200,
            )
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class DeleteTariff(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            with transaction.atomic():
                queryset = TariffMaster.objects.filter(pk__in=data)
                if not queryset.exists():
                    raise ResourceNotFound(
                        "Tariff data not found for the provided IDs."
                    )
                # Delete TariffMaster objects
                queryset.delete()
                # Delete related TariffMasterLine and TariffSpecificLocation objects
                # TariffMasterLine.objects.filter(parent__in=queryset).delete()

            return Response({"successMsg": "Data Deleted"}, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
