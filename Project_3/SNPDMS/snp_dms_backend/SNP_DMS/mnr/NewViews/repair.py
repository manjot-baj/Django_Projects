from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
import os
from SNP_DMS.settings.base import BASE_DIR
import pandas as pd
from openpyxl import load_workbook
from django.db import transaction

from account.models import AccountUser
from ..models import Estimate, Repair
from master.models import Site, Location
from ..functions import (
    upload_mnr_file_to_s3,
    download_mnr_file_from_s3,
    upload_mnr_repair_img_to_s3,
    get_only_images,
    download_mnr_repair_img_to_s3,
    get_bill_type_for_mnr,
    delete_mnr_repair_img_from_s3,
)
from datetime import datetime
from django.utils import timezone
import logging, traceback
from common.exceptions import ValidationError, ResourceNotFound, AlreadyExists
from common.error_logging import ErrorLogging
from rest_framework import status
from mnr.services.repair_service import RepairService
from account.permissions import HasAllowedRoles


class RepairImageDownloadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def post(self, request, pk, *args, **kwargs):
        try:
            repair_data = Repair.getById(pk)
            data = request.data
            image_id_list = data["image_id_list"]
            response = download_mnr_repair_img_to_s3(
                process="Repair",
                process_id=repair_data.parent.parent.pk,
                image_id_list=image_id_list,
            )
            return response
        except Exception as e:
            ErrorLogging().log_error()


class RepairImageUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            file_list = get_only_images(request.FILES.getlist("file_list"))
            if file_list is not None:
                # Condition
                repair_data = None
                try:
                    repair_data = Repair.getById(pk)
                    if not repair_data.is_proceed:
                        raise ValidationError(
                            "Please Complete Repair stage before Image Upload"
                        )
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    raise ValidationError("Data Not Exist with the given Repair Id")

                # getting data
                container_no = None
                site = Site.objects.get(name=data["site"])
                if site.type == "DEPOT":
                    container_no = (
                        repair_data.parent.parent.depot.container.container_no
                    )
                else:
                    container_no = (
                        repair_data.parent.parent.non_depot.container.container_no
                    )

                response = upload_mnr_repair_img_to_s3(
                    location=data["location"],
                    site=data["site"],
                    site_type=site.type,
                    container_no=container_no,
                    process="Repair",
                    processId=repair_data.parent.parent.pk,
                    file_list=file_list,
                    add=data["add"],
                )

                if response is True:
                    return Response({"successMsg": "File Uploaded"}, status=200)
                else:
                    raise ValidationError("File Upload Failed, Please Try Again")
            else:
                raise ValidationError("Please Provide Images To Upload")
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
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RepairUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            if data["file"] is not None:
                site = Site.objects.get(name=data["site"])
                # Getting Repair Data
                repair_data = None
                if Repair.checkExistById(pk):
                    repair_data = Repair.getById(pk)
                else:
                    raise AlreadyExists("Data Not Exist with the given Repair Id")
                container_no = None
                if site.type == "DEPOT":
                    container_no = (
                        repair_data.parent.parent.depot.container.container_no
                    )
                else:
                    container_no = (
                        repair_data.parent.parent.non_depot.container.container_no
                    )
                response = upload_mnr_file_to_s3(
                    location=data["location"],
                    site=data["site"],
                    site_type=site.type,
                    container_no=container_no,
                    process="Repair",
                    processId=repair_data.parent.parent.pk,
                    file=data["file"],
                )
                if response is True:
                    return Response({"successMsg": "File Uploaded"}, status=200)
                else:
                    raise ValidationError("File Upload Failed, Please Try Again")
            else:
                raise ValidationError("Please Provide File To Upload")
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
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RepairView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    service = RepairService()

    def get(self, request, pk, *args, **kwargs):
        try:
            repair_data = Repair.getById(pk)
            response = download_mnr_file_from_s3(
                process="Repair", process_id=repair_data.parent.parent.pk
            )
            return response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            app_user = AccountUser.objects.get(username=request.user.username)
            damage_category = None
            man_power = None
            grade = None
            remarks = None
            billing = None
            repair_billing = None
            wash_billing = None
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])

            if not len(data["damage_category"]) == 0:
                damage_category = data["damage_category"]

            if not len(data["man_power"]) == 0:
                man_power = data["man_power"]

            if not len(data["grade"]) == 0:
                grade = data["grade"]

            if not len(data["remarks"]) == 0:
                remarks = data["remarks"]

            with transaction.atomic():
                # Getting Estimate Data
                self.service.createRepair(
                    data, app_user, site, damage_category, man_power, grade, remarks
                )

            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"errorMsg": "Please try again later!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, pk, *args, **kwargs):
        try:
            # General Data
            app_user = AccountUser.objects.get(username=request.user.username)

            with transaction.atomic():
                self.service.updateRepair(request.data, pk, app_user)

            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"errorMsg": "Please try again later!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadSampleFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def get(self, request, *args, **kwargs):
        try:
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_repair_upload.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_repair_upload.xlsx"'
                )
            return file_response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExtractRepairData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]
    service = RepairService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["file"]
            location_str = request.data["location"]
            site_str = request.data["site"]
            option = request.data["option"]
            location = Location.objects.get(name=location_str)
            site = Site.objects.get(name=site_str)
            result = self.service.extractRepairData(
                input_excel=data, option=option, location=location, site=site
            )
            if result == "Header Not Found" or result is False:
                raise ValidationError("Invalid Data Provided, Please Check the File")

            return Response(result, status=200)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ImportRepairData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]
    service = RepairService()

    def post(self, request, *args, **kwargs):

        try:
            app_user = AccountUser.objects.get(username=request.user.username)
            data = request.data["importable_data"]
            location = Location.objects.get(name=request.data["location"])
            site = Site.objects.get(name=request.data["site"])
            with transaction.atomic():
                rejected_data = []
                for each in data:
                    damage_category = each["damage"]
                    man_power = each["man_power"]
                    grade = each["grade"]
                    remarks = each["remarks"]
                    container_no = each["container_no"]
                    current_date = each["current_date"]
                    current_time = each["current_time"]
                    site_type = site.type

                    estimate = (
                        Estimate.objects.filter(
                            parent__depot__container__container_no=container_no
                        ).latest("pk")
                        if site_type == "DEPOT"
                        else Estimate.objects.filter(
                            parent__non_depot__container__container_no=container_no
                        ).latest("pk")
                    )

                    if request.data["option"] == "Placement":
                        if Repair.objects.filter(parent=estimate).exists():
                            if Repair.objects.get(parent=estimate).is_draft:
                                rejected_data.append(container_no)
                                continue
                        self.service.createPlacementData(
                            estimate, damage_category, man_power, app_user
                        )

                    if request.data["option"] == "Complete and Placement":
                        if Repair.objects.filter(parent=estimate).exists():
                            if Repair.objects.get(parent=estimate).is_proceed:
                                rejected_data.append(container_no)
                                continue
                        self.service.createPlacementData(
                            estimate, damage_category, man_power, app_user
                        )
                        if Repair.checkExistByParentId(estimate.pk):
                            repair_data = Repair.getByParentId(estimate.pk)

                            repair_data.RepairWorkComplete(
                                current_date=current_date,
                                current_time=current_time,
                                grade=grade,
                                remarks=remarks,
                                updated_by=app_user,
                            )
                            repair_data.createNumber()

                            bill_type = get_bill_type_for_mnr(estimate.parent)
                            if bill_type["type"] == "repair and wash":
                                self.service.createRepairBilling(
                                    estimate, bill_type, location, site, repair_data
                                )

                                self.service.createWashBilling(
                                    estimate, bill_type, location, site, repair_data
                                )

                            else:
                                self.service.createBilling(
                                    estimate, bill_type, location, site, repair_data
                                )

                if rejected_data:
                    raise ValidationError(
                        f"All other data imported except {rejected_data}"
                    )

            return Response(
                {"successMsg": "Repair Data Imported"}, status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadRejectedFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]
    service = RepairService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]

            repair_df_data = self.service.getRepairDfData(data)
            if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))
            new_temp_file_path = os.path.join(
                BASE_DIR, f"temp/sample_stock/sample_repair_upload.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_repair_upload.xlsx"
            )
            old_temp_data = None
            with open(temp_file_path, "rb") as temp:
                old_temp_data = temp.read()
            with open(new_temp_file_path, "wb") as f:
                f.write(old_temp_data)

            # New Version code
            book = load_workbook(new_temp_file_path)
            with pd.ExcelWriter(
                new_temp_file_path,
                engine="openpyxl",
                mode="a",
                if_sheet_exists="replace",
            ) as writer:
                repair_df = pd.DataFrame(repair_df_data)
                repair_df.to_excel(
                    writer,
                    sheet_name="repair_upload",
                    startrow=0,
                    startcol=0,
                    index=False,
                )

                faults_df = pd.DataFrame(faults)
                faults_df.to_excel(
                    writer, sheet_name="faults", startrow=0, startcol=0, index=False
                )

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="rejected_repair_file.xlsx"'
                )
                os.remove(new_temp_file_path)
            return file_response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RepairImageDeleteView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]

    def post(self, request, pk, *args, **kwargs):
        try:
            repair_data = Repair.getById(pk)
            data = request.data
            image_id_list = data["image_id_list"]
            response = delete_mnr_repair_img_from_s3(
                process="Repair",
                process_id=repair_data.parent.parent.pk,
                image_id_list=image_id_list,
            )
            if response:
                return Response({"successMsg": "Successfully deleted images"})
            else:
                raise ResourceNotFound("Images not found")

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadJobSheetView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "MNR Team",
        "Repair",
    ]
    service = RepairService()

    def post(self, request, *args, **kwargs):
        try:
            sheet_data = self.service.getGenericJobSheetMainData([request.data["pk"]])
            temp_file_path = self.service.createGenericJobSheetWb(sheet_data)
            dt = datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M")
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="job_sheet_{date}{time}.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
