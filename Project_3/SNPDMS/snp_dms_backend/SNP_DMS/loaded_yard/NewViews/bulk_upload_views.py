from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from loaded_yard.services.loaded_yard_service import LoadedYardService
from rest_framework import status
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError
from master.models import Site, Location

from SNP_DMS.settings.base import BASE_DIR
import os
from django.http import HttpResponse
import shutil
import pandas as pd
from account.permissions import HasAllowedRoles

class DownloadSampleFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]


    service = LoadedYardService()

    def get(self, request, site, *args, **kwargs):
        try:
            response = self.service.getSampleFile(site)
            return response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExtractLoadedYardData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]


    service = LoadedYardService()

    def post(self, request, *args, **kwargs):

        try:
            data = request.data["file"]
            site = request.data.get("site")
            location = request.data.get("location")

            site_obj = Site.objects.get(name=request.data["site"])

            if site_obj.organization == "Golden Horn Containers Service":
                result = self.service.extractLoadedYardData(
                    input_excel=data, location=location, site=site
                )
            else:
                result = self.service.clientSpecificExtractLoadedYardData(
                    input_excel=data, location=location, site=site
                )

            if result == "Header Not Found" or result is False:
                raise ValidationError(
                    "The uploaded file does not contain the required headers or is not formatted correctly. Please check the file and try again."
                )
            else:
                return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoadedYardImport(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]


    service = LoadedYardService()

    def post(self, request, *args, **kwargs):

        try:
            importable_data = request.data["importable_data"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])

            with transaction.atomic():
                if site.organization == "Golden Horn Containers Service":
                    edi_content = self.service.createLoadedYardData(
                        importable_data=importable_data, location=location, site=site
                    )
                else:
                    edi_content = self.service.clientSpecificCreateLoadedYardData(
                        importable_data=importable_data,
                        location=location,
                        site=site,
                    )

                temp_file_path = self.service.makeLoadedYardEdiFile(edi_content)

            return self.service.downloadLoadedYardEdi(temp_file_path)
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RejectedLoadedYardFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]


    service = LoadedYardService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]
            if (
                Site.objects.get(name=request.data["site"]).organization
                == "Golden Horn Containers Service"
            ):

                if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

                new_temp_file_path = os.path.join(
                    BASE_DIR, "temp/sample_stock/sample_loaded_yard_upload.xlsx"
                )
                temp_file_path = os.path.join(
                    BASE_DIR, "sample_stock/sample_loaded_yard_upload.xlsx"
                )

                shutil.copyfile(temp_file_path, new_temp_file_path)

                with pd.ExcelWriter(
                    temp_file_path,
                    engine="openpyxl",
                    mode="a",
                    if_sheet_exists="replace",
                ) as writer:
                    df_data = self.service.extractLoadedYardDataForRejectedFile(
                        data=data
                    )
                    df_data.to_excel(writer, sheet_name="loaded_yard", index=False)
                    faults_df = pd.DataFrame(faults)
                    faults_df.to_excel(writer, sheet_name="faults", index=False)

                with open(new_temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type="application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        'attachment; filename="rejected_loaded_yard_file.xlsx"'
                    )

                os.remove(new_temp_file_path)

                return file_response

            else:

                if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

                new_temp_file_path = os.path.join(
                    BASE_DIR,
                    "temp/sample_stock/sample_loaded_yard_client_specific.xlsx",
                )
                temp_file_path = os.path.join(
                    BASE_DIR,
                    "sample_stock/sample_loaded_yard_client_specific.xlsx",
                )

                shutil.copyfile(temp_file_path, new_temp_file_path)

                with pd.ExcelWriter(
                    temp_file_path,
                    engine="openpyxl",
                    mode="a",
                    if_sheet_exists="replace",
                ) as writer:
                    df_data = (
                        self.service.clientSpecificExtractLoadedYardDataForRejectedFile(
                            data=data
                        )
                    )
                    df_data.to_excel(writer, sheet_name="loaded_yard", index=False)
                    faults_df = pd.DataFrame(faults)
                    faults_df.to_excel(writer, sheet_name="faults", index=False)

                with open(new_temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type="application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        'attachment; filename="rejected_loaded_yard_file.xlsx"'
                    )

                os.remove(new_temp_file_path)

                return file_response

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
