from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import Location, Site
from non_depot.models import NonDepotContainerStock
from depot.models import ContainerStock
from ..models import Survey, TariffMaster, MnrStaff

from django.utils import timezone
from datetime import datetime
from ..functions import (
    upload_mnr_file_to_s3,
    upload_mnr_repair_img_to_s3,
    get_only_images,
    download_mnr_repair_img_to_s3,
    delete_mnr_repair_img_from_s3,
)
from django.db import transaction
from mnr.services.survey_service import SurveyService
from mnr.services.mnr_service import MNRService
from common.exceptions import AlreadyExists, ValidationError, ResourceNotFound
from common.error_logging import ErrorLogging
from rest_framework import status
import random
from django.http import HttpResponse
import os
from SNP_DMS.settings.base import BASE_DIR
from common.functions import get_location_site
import pandas as pd
import shutil
from openpyxl import load_workbook

from account.permissions import HasAllowedRoles


class SurveyEntry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = SurveyService()

    def post(self, request, *args, **kwargs):
        try:
            # General Data

            data = request.data
            site = Site.objects.get(name=data["site"])
            created_by = AccountUser.objects.get(username=request.user.username)
            survey_by = MnrStaff.objects.get(pk=data["survey_by"])

            survey_lines = data["survey_lines"]
            if len(data["survey_lines"]) == 0:
                survey_lines = None

            survey_lines_deleted = data["survey_lines_deleted"]
            if len(survey_lines_deleted) == 0:
                survey_lines_deleted = None

            # Data extraction on depot or non depot
            depot = None
            non_depot = None
            # client_ref_code = None
            if site.type == "DEPOT":
                depot = ContainerStock.objects.get(pk=data["stock_id"])
                # client_ref_code = depot.container.client.ref_code
            else:
                non_depot = NonDepotContainerStock.objects.get(pk=data["stock_id"])
                # client_ref_code = non_depot.container.client.ref_code

            parent = TariffMaster.objects.get(pk=data["parent_id"])

            # date stuff
            if len(data["date"]) == 0:
                date = datetime.now().astimezone(timezone.get_current_timezone()).date()
            else:
                try:
                    date = datetime.strptime(data["date"], "%Y-%m-%d").date()
                except:
                    date = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
            # time stuff
            if len(data["time"]) == 0:
                time = datetime.now().astimezone(timezone.get_current_timezone()).time()
            else:
                try:
                    time = datetime.strptime(data["time"], "%H:%M").time()
                except:
                    time = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )

            # Checking for draft data
            survey_data = None
            if depot is not None:
                if Survey.checkExistByDepotId(depot.pk):
                    if Survey.checkDraftExistByDepotId(id=depot.pk):
                        survey_data = Survey.getDraftByDepotId(id=depot.pk)
                    else:
                        raise AlreadyExists("Survey Already Done")
            else:
                if Survey.checkExistByNonDepotId(non_depot.pk):
                    if Survey.checkDraftExistByNonDepotId(id=non_depot.pk):
                        survey_data = Survey.getDraftByNonDepotId(id=non_depot.pk)
                    else:
                        raise AlreadyExists("Survey Already Done")

            with transaction.atomic():
                # Main data input
                self.service.createSurvey(
                    survey_data,
                    data,
                    created_by,
                    survey_by,
                    date,
                    time,
                    survey_lines_deleted,
                    survey_lines,
                    parent,
                    depot,
                    non_depot,
                )

            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
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
                {"errorMsg": "Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadSurveyFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = MNRService()

    def get(self, request, pk, *args, **kwargs):
        try:
            response = self.service.downloadMnrFileFromS3(
                process="Survey", process_id=pk
            )
            return response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateSurvey(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = SurveyService()

    def put(self, request, pk, *args, **kwargs):
        try:
            # General Data
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            updated_by = AccountUser.objects.get(username=request.user.username)
            survey_by = MnrStaff.objects.get(pk=data["survey_by"])

            survey_lines = data["survey_lines"]
            if len(data["survey_lines"]) == 0:
                survey_lines = None

            survey_lines_rejected = data["survey_lines_rejected"]
            if len(survey_lines_rejected) == 0:
                survey_lines_rejected = None

            survey_lines_deleted = data["survey_lines_deleted"]
            if len(survey_lines_deleted) == 0:
                survey_lines_deleted = None

            # Getting Survey Data
            survey_data = None
            if Survey.checkExistById(pk):
                survey_data = Survey.getById(pk)
            else:
                raise ValidationError("Data Not Exist with the given Id")

            parent = TariffMaster.objects.get(pk=data["parent_id"])

            # date stuff
            if len(data["date"]) == 0:
                date = datetime.now().astimezone(timezone.get_current_timezone()).date()
            else:
                try:
                    date = datetime.strptime(data["date"], "%Y-%m-%d").date()
                except:
                    date = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
            # time stuff
            if len(data["time"]) == 0:
                time = datetime.now().astimezone(timezone.get_current_timezone()).time()
            else:
                try:
                    time = datetime.strptime(data["time"], "%H:%M").time()
                except:
                    time = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )

            self.service.updateSurvey(
                survey_data,
                updated_by,
                date,
                time,
                survey_lines_deleted,
                survey_lines,
                parent,
                survey_lines_rejected,
            )

            return Response({"successMsg": "Data Saved"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MakeAvailableReverseView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                survey = Survey.getById(pk)
                stock_object = None
                if survey.depot is not None:
                    stock_object = survey.depot
                else:
                    stock_object = survey.non_depot
                stock_object.survey_date = None
                stock_object.survey_time = None
                stock_object.survey_pending_out_date_time = None
                stock_object.available_in_date_time = None
                stock_object.available_date = None
                stock_object.available_time = None
                stock_object.stage = "Survey"
                stock_object.status = "Survey Pending"
                stock_object.save()
                stock_object.make_not_available()
                survey.delete()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SurveyImageDeleteView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            image_id_list = data["image_id_list"]
            response = delete_mnr_repair_img_from_s3(
                process="Survey", process_id=pk, image_id_list=image_id_list
            )
            if response:
                return Response({"successMsg": "Successfully deleted images"})

            raise ValidationError("Failed to delete images, please try again")
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SurveyUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            if data["file"] is not None:
                site = Site.objects.get(name=data["site"])
                # Getting Survey Data
                survey_data = None
                if Survey.checkExistById(pk):
                    survey_data = Survey.getById(pk)
                else:
                    raise ValidationError("Data Not Exist with the given Id")
                container_no = None
                if site.type == "DEPOT":
                    container_no = survey_data.depot.container.container_no
                else:
                    container_no = survey_data.non_depot.container.container_no
                response = upload_mnr_file_to_s3(
                    location=data["location"],
                    site=data["site"],
                    site_type=site.type,
                    container_no=container_no,
                    process="Survey",
                    processId=pk,
                    file=data["file"],
                )
                if response is True:
                    return Response({"successMsg": "File Uploaded"}, status=200)
                else:
                    raise ValidationError("File Not Uploaded, Please Try Again")
            else:
                raise ValidationError("Please Provide File To Upload")

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SurveyImageUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            if not "file_list" in data.keys():
                raise ValidationError("Please upload a file")
            file_list = get_only_images(request.FILES.getlist("file_list"))
            if file_list is False:
                raise ValidationError("Please upload a [jpeg,png,jpg] file")

            if file_list is not None:
                # Condition
                survey_data = None
                # estimate_data = None
                try:
                    survey_data = Survey.getById(pk)
                except:
                    raise ResourceNotFound("Survey data not found")

                # getting data
                container_no = None
                site = Site.objects.get(name=data["site"])
                if site.type == "DEPOT":
                    container_no = survey_data.depot.container.container_no
                else:
                    container_no = survey_data.non_depot.container.container_no

                response = upload_mnr_repair_img_to_s3(
                    location=data["location"],
                    site=data["site"],
                    site_type=site.type,
                    container_no=container_no,
                    process="Survey",
                    processId=pk,
                    file_list=file_list,
                    add=data["add"],
                )

                if response is True:
                    return Response({"successMsg": "File Uploaded"}, status=200)
                else:
                    raise ValidationError("File Not Uploaded")
            else:
                raise ValidationError("Please Provide Images To Upload")

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SurveyImageDownloadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            image_id_list = data["image_id_list"]
            response = download_mnr_repair_img_to_s3(
                process="Survey", process_id=pk, image_id_list=image_id_list
            )
            return response
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DowloadTariffForBulkSurvey(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = SurveyService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site_object = Site.objects.select_related("location").get(
                location__name=data["location"], name=data["site"]
            )
            tariff = TariffMaster.objects.get(site=site_object, client="MSC")
            main_data = self.service.getBulkTariffExcelData(parent=tariff)
            specific_location_data = self.service.getSpecificLocationData()
            temp_file_path = self.service.makeBulkTariffExcel(
                main_data, specific_location_data
            )

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="msc_tariff.xlsx"'
                )
                os.remove(temp_file_path)
                return file_response
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadSurveySampleFile(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, *args, **kwargs):
        try:
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_washing_survey_bulk_upload.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_washing_survey_bulk_upload.xlsx"'
                )
            return file_response
        except Exception as e:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExtractSurveyData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = SurveyService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["file"]
            location, site = get_location_site(
                request.data["location"], request.data["site"]
            )
            result = self.service.extractSurveyUploadExcelData(
                input_excel=data, location=location, site=site
            )
            if result == "Header Not Found" or result is False:
                raise ValidationError("Data file is corrupted")
            else:
                return Response(result)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ImportWashingSurveyView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = SurveyService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            importable_data = data["importable_data"]
            accountUser = AccountUser.objects.get(username=request.user)
            labour_rate = TariffMaster.objects.get(
                client="MSC", location=location, site=site
            ).labour_rate

            if any(self.service.checkContainerExistence(site, importable_data)):
                raise AlreadyExists("Data already exists")

            with transaction.atomic():
                for each in importable_data:
                    name = each["survey_by"].split()
                    if len(name) == 1:
                        param = {
                            "firstName": each["survey_by"],
                            "role": "Surveyor",
                            "location": location,
                            "site": site,
                        }
                    else:
                        param = {
                            "firstName": name[0],
                            "lastName": name[1],
                            "role": "Surveyor",
                            "location": location,
                            "site": site,
                        }
                    surveyBy = MnrStaff.objects.get(**param)
                    if site.type == "DEPOT":
                        depot = ContainerStock.objects.filter(
                            container__container_no=each["container_no"],
                            container__location=location,
                            container__site=site,
                            container__client__ref_code="MSC",
                            stage="Survey",
                        ).latest("pk")
                        parent = Survey.objects.create(
                            depot=depot,
                            non_depot=None,
                            survey_by=surveyBy,
                            created_by=accountUser,
                            updated_by=accountUser,
                            is_draft=True,
                            is_proceed=False,
                            original_date=datetime.now().date(),
                            original_time=datetime.now().time(),
                            current_date=datetime.now().date(),
                            current_time=datetime.now().time(),
                            labour_rate=labour_rate,
                            estimate_number=self.service.randomNumber(),
                        )
                    else:
                        non_depot = NonDepotContainerStock.objects.filter(
                            container__container_no=each["container_no"],
                            container__location=location,
                            container__site=site,
                            container__client__ref_code="MSC",
                            stage="Survey",
                        ).latest("pk")

                        parent = Survey.objects.create(
                            depot=None,
                            non_depot=non_depot,
                            survey_by=surveyBy,
                            created_by=accountUser,
                            updated_by=accountUser,
                            is_draft=True,
                            is_proceed=False,
                            original_date=datetime.now().date(),
                            original_time=datetime.now().time(),
                            current_date=datetime.now().date(),
                            current_time=datetime.now().time(),
                            labour_rate=labour_rate,
                            estimate_number=self.service.randomNumber(),
                        )

                    tarrif_line = self.service.getTariffLineData(location, site, each)
                    self.service.createSurveyLineObject(parent, tarrif_line, each)

            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RejectedSurveyDataFile(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = SurveyService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]
            tool_room_df_data = self.service.extractSurveyDataForRejectedFile(data=data)

            if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

            new_temp_file_path = os.path.join(
                BASE_DIR, "temp/sample_stock/sample_washing_survey_bulk_upload.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_washing_survey_bulk_upload.xlsx"
            )

            shutil.copyfile(temp_file_path, new_temp_file_path)

            # New Version code
            book = load_workbook(new_temp_file_path)
            with pd.ExcelWriter(
                new_temp_file_path,
                engine="openpyxl",
                mode="a",
                if_sheet_exists="replace",
            ) as writer:
                tool_room_df_data.to_excel(
                    writer,
                    sheet_name="washing_survey",
                    startrow=0,
                    startcol=0,
                    index=False,
                )
                pd.DataFrame(faults).to_excel(
                    writer, sheet_name="faults", startrow=0, startcol=0, index=False
                )

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    'attachment; filename="rejected_survey_file.xlsx"'
                )

            os.remove(new_temp_file_path)

            return file_response
        except Exception:
            ErrorLogging().log_error()

            return Response(
                {"errorMsg": f"Please try again, later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
