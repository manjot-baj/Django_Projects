from wistim_distim.functions import extract_edi_data, make_excel_data
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from rest_framework.response import Response
from django.http import HttpResponse
from ..functions import set_estimate_status
from account.models import AccountUser
import os, datetime
from decouple import config
from common.functions import upload_file
from django.utils import timezone
from ..models import WistimS3Upload
import logging, traceback

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
from account.permissions import HasAllowedRoles


class EstimateDistimView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            site = Site.objects.get(name=data["site"])
            location = Location.objects.get(name=data["location"])
            file = request.FILES.getlist("file")
            client = data["ref_code"]
            app_user = AccountUser.objects.get(username=request.user.username)

            # special condition
            if not client.lower() == "msc":
                return Response(
                    {
                        "errorMsg": f"Sorry, Distim Format is not available for {client.upper()}"
                    },
                    status=200,
                )

            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            bucket_name = AWS_STORAGE_BUCKET_NAME
            total_containers = 0
            approved = []
            rejected = []
            wrong_file_count = 0
            total_file_count = 0

            depot_code = None
            line = None
            labour_rate = None
            currency = None

            for each_file in file:
                total_file_count = total_file_count + 1
                extracted_data = extract_edi_data(each_file)
                if extracted_data is None:
                    # return Response(
                    #     {"errorMsg": "Data file is corrupted, unable to extract data"},
                    #     status=200,
                    # )
                    wrong_file_count = wrong_file_count + 1
                else:
                    distim_object_name = f"MNR/WISTIM_DISTIM/{location.name}/{site.type}/{site.name}/Distim/{each_file.name}"
                    upload_file(each_file, bucket_name, distim_object_name)
                    distim_wistim_object = WistimS3Upload(
                        date=dt,
                        s3_object_name=distim_object_name,
                        s3_file_name=each_file.name,
                        type="Distim",
                        location=location,
                        site=site,
                    )
                    distim_wistim_object.save()

                    total_containers = int(total_containers) + int(
                        len(extracted_data["container_data"])
                    )

                    depot_code = extracted_data["depot_code"]
                    line = extracted_data["line"]
                    labour_rate = extracted_data["labour_rate"]
                    currency = extracted_data["currency"]

                    for each in extracted_data["container_data"]:
                        remark1 = each["remark1"]
                        if remark1 == "APPROVED":
                            approved.append(each)
                        else:
                            rejected.append(each)

            # operation for approved and rejected
            if len(approved) == 0 and len(rejected) == 0:
                return Response(
                    {"errorMsg": "Data file is corrupted, unable to extract data"},
                    status=200,
                )
            else:
                try:
                    approved, rejected = set_estimate_status(
                        location=location,
                        site=site,
                        approved=approved,
                        rejected=rejected,
                        app_user=app_user,
                    )
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    # return Response(
                    #     {"errorMsg": "Unable to Change Container Status"},
                    #     status=200,
                    # )

            response = {}
            response["no_of_total_containers"] = total_containers
            no_of_approved_containers = len(approved)
            response["no_of_approved_containers"] = no_of_approved_containers
            no_of_rejected_containers = len(rejected)
            response["no_of_rejected_containers"] = no_of_rejected_containers
            response["wrong_file_count"] = wrong_file_count
            response["total_file_count"] = total_file_count

            if not len(approved) == 0:
                approved_container_data = {
                    "depot_code": depot_code,
                    "line": line,
                    "labour_rate": labour_rate,
                    "currency": currency,
                    "container_data": approved,
                    "location": location.name,
                    "site": site.name,
                }
                response["approved_container_data"] = approved_container_data

            if not len(rejected) == 0:
                rejected_container_data = {
                    "depot_code": depot_code,
                    "line": line,
                    "labour_rate": labour_rate,
                    "currency": currency,
                    "container_data": rejected,
                    "location": location.name,
                    "site": site.name,
                }
                response["rejected_container_data"] = rejected_container_data

            return Response(response, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class EstimateDistimExcelView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            excel_file_path = make_excel_data(data)
            site = Site.objects.get(name=data["site"])
            location = Location.objects.get(name=data["location"])
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            bucket_name = AWS_STORAGE_BUCKET_NAME
            wistim_type = None
            file_name = None
            object_name = None
            remark = data["container_data"][0]["remark1"]
            if remark == "APPROVED":
                file_name = f"{dt.strftime('%Y%m%d%H%M%S')}_approved_destim.xlsx"
                object_name = f"MNR/WISTIM_DISTIM/{location.name}/{site.type}/{site.name}/ApprovedWistim/{file_name}"
                wistim_type = "Approved Wistim"
            else:
                file_name = f"{dt.strftime('%Y%m%d%H%M%S')}_rejected_destim.xlsx"
                object_name = f"MNR/WISTIM_DISTIM/{location.name}/{site.type}/{site.name}/RejectedWistim/{file_name}"
                wistim_type = "Rejected Wistim"
            upload_file(excel_file_path, bucket_name, object_name)
            wistim_object = WistimS3Upload(
                date=dt,
                s3_object_name=object_name,
                s3_file_name=file_name,
                type=wistim_type,
                location=location,
                site=site,
            )
            wistim_object.save()

            with open(excel_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="msc.xlsx"'
                )
                os.remove(excel_file_path)
            return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)
