# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
from SNP_DMS.settings.base import BASE_DIR
import os
from django.http import HttpResponse
from openpyxl import load_workbook
import pandas as pd
from django.db import transaction
import shutil

# function imports
from loaded_yard.utils import (
    make_loaded_yard_edi_file,
    download_loaded_yard_edi,
    extract_loaded_yard_data_for_rejected_file,
    get_location_site,
)
from loaded_yard.client_specific_functions import (
    client_specific_extract_loaded_yard_data_for_rejected_file,
)

# models imports
from loaded_yard.models import LoadedYard
from master.models import Site


class LoadedYardUploadSampleFile(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, site, *args, **kwargs):
        try:
            if (
                Site.objects.get(name=site).organization
                == "Golden Horn Containers Service"
            ):

                temp_file_path = os.path.join(
                    BASE_DIR, "sample_stock/sample_loaded_yard_upload.xlsx"
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="sample_loaded_yard_upload.xlsx"'
                    )
                return file_response

            else:

                temp_file_path = os.path.join(
                    BASE_DIR, "sample_stock/sample_loaded_yard_client_specific.xlsx"
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="sample_loaded_yard_client_specific.xlsx"'
                    )
                return file_response
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found"}, status=200)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data["file"]

            location, site = get_location_site(
                location_name=request.data["location"], site_name=request.data["site"]
            )
            if site.organization == "Golden Horn Containers Service":
                result = LoadedYard.objects.extract_loaded_yard_excel_data(
                    input_excel=data, location=location, site=site
                )
            else:
                result = (
                    LoadedYard.objects.client_specific_extract_loaded_yard_excel_data(
                        input_excel=data, location=location, site=site
                    )
                )

            if result == "Header Not Found" or result is False:
                return Response(
                    {"errorMsg": "Data file is corrupted, unable to import data"},
                    status=200,
                )
            else:
                return Response(result, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class LoadedYardImport(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            importable_data = request.data["importable_data"]
            location, site = get_location_site(
                location_name=request.data["location"], site_name=request.data["site"]
            )
            # container_validation = LoadedYard.objects.check_container_existence(
            #     data=importable_data, location=location, site=site
            # )
            # if any(container_validation):
            #     return Response({"errorMsg": "Data already exists"}, status=200)
            with transaction.atomic():
                if site.organization == "Golden Horn Containers Service":
                    edi_content = LoadedYard.objects.create_loaded_yard_data(
                        importable_data=importable_data, location=location, site=site
                    )
                else:
                    edi_content = (
                        LoadedYard.objects.client_specific_create_loaded_yard_data(
                            importable_data=importable_data,
                            location=location,
                            site=site,
                        )
                    )

                temp_file_path = make_loaded_yard_edi_file(edi_content)

            return download_loaded_yard_edi(temp_file_path)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class RejectedLoadedYardFile(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
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
                    df_data = extract_loaded_yard_data_for_rejected_file(data=data)
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
                        client_specific_extract_loaded_yard_data_for_rejected_file(
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
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)
