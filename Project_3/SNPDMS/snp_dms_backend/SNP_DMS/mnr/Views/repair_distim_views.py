from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
import os, datetime, logging, traceback
from django.utils import timezone
from mnr.models import Repair, AfterRepairImage
from master.models import TypeSizeCode
from wistim_distim.functions import make_repair_distim_edi
from django.http import HttpResponse
from django.db import transaction
from rest_framework.response import Response
from ..functions import (
    upload_wistim_to_s3,
    get_site_ftp_detail,
    upload_file_to_ftp_server,
)
from common.functions import download_file
from decouple import config
from notification.utils import send_notification
from ..functions import mnr_img_validation
from account.permissions import HasAllowedRoles

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


class RepairDistimView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            with transaction.atomic():
                data = request.data
                site = Site.objects.get(name=data["site"])
                location = Location.objects.get(name=data["location"])
                stock_id = data["stock_id"]
                dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
                date = dt.date()
                time = dt.time()
                client = None
                repair_list = []

                if site.type == "DEPOT":
                    repair_list = [
                        Repair.objects.get(parent__parent__depot__pk=id)
                        for id in stock_id
                        if Repair.objects.filter(
                            parent__parent__depot__pk=id, is_proceed=True
                        ).exists()
                    ]
                    client = repair_list[
                        0
                    ].parent.parent.depot.container.client.ref_code

                    if len(repair_list) == 0:
                        return Response(
                            {
                                "errorMsg": f"Please select stock objects whose Repair stage is completed"
                            },
                            status=200,
                        )
                else:
                    repair_list = [
                        Repair.objects.get(parent__parent__non_depot__pk=id)
                        for id in stock_id
                        if Repair.objects.filter(
                            parent__parent__non_depot__pk=id, is_proceed=True
                        ).exists()
                    ]
                    client = repair_list[
                        0
                    ].parent.parent.non_depot.container.client.ref_code

                    if len(repair_list) == 0:
                        return Response(
                            {
                                "errorMsg": f"Please select stock objects whose Repair stage is completed"
                            },
                            status=200,
                        )

                # special condition
                if not client.lower() == "msc":
                    return Response(
                        {
                            "errorMsg": f"Sorry, Wistim Format is not available for {client.upper()}"
                        },
                        status=200,
                    )

                response = {}
                response["shipping_line"] = client
                if site.vendor_code is None:
                    response["vendor_code"] = ""
                else:
                    response["vendor_code"] = site.vendor_code

                if site.depot_code is None:
                    response["depot_code"] = ""
                else:
                    response["depot_code"] = site.depot_code

                container_data = []
                sr_no = 1
                for repair in repair_list:
                    single_container_data = {}
                    container_object = None
                    if repair.parent.parent.depot is not None:
                        container_object = repair.parent.parent.depot.container
                        stock = repair.parent.parent.depot
                        stock.is_repair_destim_sent = True
                        stock.save()
                    else:
                        container_object = repair.parent.parent.non_depot.container
                        stock = repair.parent.parent.non_depot
                        stock.is_repair_destim_sent = True
                        stock.save()

                    ###container_data
                    single_container_data["sr_no"] = sr_no
                    single_container_data["equipment_no"] = (
                        container_object.container_no
                    )

                    if (
                        TypeSizeCode.objects.select_related("size", "type")
                        .filter(size=container_object.size, type=container_object.type)
                        .exists()
                    ):
                        single_container_data["iso_code"] = (
                            TypeSizeCode.objects.select_related("size", "type")
                            .get(size=container_object.size, type=container_object.type)
                            .code
                        )
                    else:
                        single_container_data["iso_code"] = ""

                    if repair.parent.current_date is None:
                        single_container_data["estimate_date"] = ""
                    else:
                        single_container_data["estimate_date"] = (
                            repair.parent.current_date
                        )

                    if repair.number is None:
                        single_container_data["repair_ref_no"] = ""
                    else:
                        single_container_data["repair_ref_no"] = repair.number

                    if repair.parent.number is None:
                        single_container_data["estimate_ref_no"] = ""
                    else:
                        single_container_data["estimate_ref_no"] = repair.parent.number

                    if repair.current_repair_date is None:
                        single_container_data["repair_completion_date"] = ""
                    else:
                        single_container_data["repair_completion_date"] = (
                            repair.current_repair_date
                        )

                    container_data.append(single_container_data)
                    sr_no = sr_no + 1
                response["container_data"] = container_data

                # EDI
                edi_file_path = make_repair_distim_edi(response)
                date_str = date.strftime("%Y%m%d")
                time_str = time.strftime("%H%M")
                file_name = f"{date_str}{time_str}_{client.lower()}_repair_distim.edi"

                upload_wistim_to_s3(
                    location=location.name,
                    site=site.name,
                    site_type=site.type,
                    process="Repair",
                    date=dt,
                    object_list=repair_list,
                    file_name=file_name,
                    file_path=edi_file_path,
                )

                # ftp_data = get_site_ftp_detail(site=site.name, process="repair_distim")
                # if ftp_data is not None:
                #     upload_file_to_ftp_server(
                #         host=ftp_data["host"],
                #         username=ftp_data["username"],
                #         password=ftp_data["password"],
                #         working_directory=ftp_data["working_directory"],
                #         file_name=file_name,
                #         file_path=edi_file_path,
                #     )

                with open(edi_file_path, "r") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/edi"
                    )
                    file_response["Content-Disposition"] = (
                        f"attachment; filename={file_name}"
                    )
                    os.remove(edi_file_path)
                return file_response
        except Exception as e:
            return Response({"errorMsg": str(e)}, status=200)


class DestimEdiFtpUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            # General Data
            with transaction.atomic():
                repair = Repair.objects.get(pk=pk)
                estimate_obj = repair.parent
                survey_obj = estimate_obj.parent
                location = None
                site = None
                container_object = None
                stock = None
                line = None
                try:
                    stock = survey_obj.depot
                    container_object = stock.container
                    location = container_object.location
                    site = container_object.site
                    line = container_object.client.ref_code
                except:
                    stock = survey_obj.non_depot
                    container_object = stock.container
                    location = container_object.location
                    line = container_object.client.ref_code

                if not line.lower() == "msc":
                    return Response({"errorMsg": "Line Should be 'MSC'"}, status=200)

                if stock.post_mnr_edi_uploaded_to_ftp is True:
                    return Response(
                        {"errorMsg": "Repair Destim EDI Already Uploaded to FTP"},
                        status=200,
                    )

                if container_object.client.ref_code.lower() == "msc":
                    container_no = container_object.container_no
                    iso_code = (
                        TypeSizeCode.objects.filter(
                            size=container_object.size, type=container_object.type
                        )
                        .values_list("code", flat=True)
                        .first()
                        or ""
                    )

                    response = {
                        "vendor_code": site.vendor_code or "",
                        "depot_code": site.depot_code or "",
                        "shipping_line": "MSC",
                        "container_data": [
                            {
                                "sr_no": 1,
                                "equipment_no": container_object.container_no,
                                "iso_code": iso_code,
                                "estimate_date": repair.parent.current_date or "",
                                "repair_ref_no": repair.number or "",
                                "estimate_ref_no": repair.parent.number or "",
                                "repair_completion_date": repair.current_repair_date
                                or "",
                            }
                        ],
                    }

                    # EDI
                    edi_file_path = make_repair_distim_edi(response)
                    tz = timezone.get_current_timezone()
                    dt = timezone.now().astimezone(tz)
                    date_str = dt.strftime("%Y%m%d")
                    time_str = dt.strftime("%H%M")
                    file_name = f"{date_str}{time_str}_msc_repair_distim.edi"
                    upload_wistim_to_s3(
                        location=location.name,
                        site=site.name,
                        site_type=site.type,
                        process="Repair",
                        date=dt,
                        object_list=[repair],
                        file_name=file_name,
                        file_path=edi_file_path,
                    )
                    # ftp
                    ftp_data = get_site_ftp_detail(site.name, "repair_distim")
                    if ftp_data is not None:
                        ftp_response = upload_file_to_ftp_server(
                            host=ftp_data["host"],
                            username=ftp_data["username"],
                            password=ftp_data["password"],
                            working_directory=ftp_data["working_directory"],
                            file_name=file_name,
                            file_path=edi_file_path,
                        )
                        if ftp_response is True:
                            stock.post_mnr_edi_uploaded_to_ftp = True
                            stock.save()
                            send_notification(
                                location=location.name,
                                site=site.name,
                                category="MNR",
                                notification_type="SUCCESS",
                                message=f"Container No {container_no}, Repair Destim EDI FTP Upload Successful",
                            )
                        else:
                            send_notification(
                                location=location.name,
                                site=site.name,
                                category="MNR",
                                notification_type="FAILURE",
                                message=f"Container No {container_no}, Repair Destim EDI FTP Upload Failed !!!",
                            )
                else:
                    pass

                with open(edi_file_path, "r") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/edi"
                    )
                    file_response["Content-Disposition"] = (
                        f"attachment; filename={file_name}"
                    )
                    os.remove(edi_file_path)
                return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    # class DestimImgFtpUploadView(APIView):
    #     permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]


#     def get(self, request, pk, *args, **kwargs):
#         try:
#             repair_obj = Repair.objects.get(pk=pk)
#             line = None
#             try:
#                 line = repair_obj.parent.parent.depot.container.client.ref_code
#             except:
#                 line = repair_obj.parent.parent.non_depot.container.client.ref_code
#             if not line.lower() == "msc":
#                 return Response({"errorMsg": "Line Should be 'MSC'"}, status=200)

#             validation = mnr_img_validation(obj=repair_obj, after_repair=True)
#             if validation == True:
#                 images = AfterRepairImage.objects.filter(
#                     parent=repair_obj, upload_to_ftp=False, ftp_upload_successful=False
#                 )
#                 for image in images:
#                     image.upload_to_ftp = True
#                     image.save()
#                 return Response(
#                     {"successMsg": "Ftp upload Intiated, we will notify you soon"},
#                     status=200,
#                 )
#             else:
#                 return Response({"errorMsg": validation}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": str(e)}, status=200)


class DestimImgFtpUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            repair_obj = Repair.objects.get(pk=pk)
            line = None
            site = None
            container = None
            stock = None
            try:
                stock = repair_obj.parent.parent.depot
                container = stock.container
                site = container.site
                line = container.client.ref_code
            except:
                stock = repair_obj.parent.parent.non_depot
                container = stock.container
                site = container.site
                line = container.client.ref_code

            if not line.lower() == "msc":
                return Response({"errorMsg": "Line Should be 'MSC'"}, status=200)

            validation = mnr_img_validation(obj=repair_obj, after_repair=True)
            if validation == True:

                if not AfterRepairImage.objects.filter(
                    parent=repair_obj, upload_to_ftp=False, ftp_upload_successful=False
                ).exists():
                    return Response(
                        {"errorMsg": "Current Images already uploaded to FTP server"},
                        status=200,
                    )

                images = AfterRepairImage.objects.filter(
                    parent=repair_obj, upload_to_ftp=False, ftp_upload_successful=False
                )
                bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
                for image in images:
                    process = "after_repair_image_upload"
                    file_name = image.s3_file_name
                    object_name = image.s3_object_name
                    temp_file_path = download_file(
                        bucket=bucket_name, object_name=object_name, file_name=file_name
                    )
                    ftp_data = get_site_ftp_detail(site.name, process)
                    if ftp_data is not None:
                        ftp_response = upload_file_to_ftp_server(
                            host=ftp_data["host"],
                            username=ftp_data["username"],
                            password=ftp_data["password"],
                            working_directory=ftp_data["working_directory"],
                            file_name=file_name,
                            file_path=temp_file_path,
                        )
                        os.remove(temp_file_path)
                        if ftp_response is True:
                            image.ftp_upload_successful = True
                            image.save()
                            send_notification(
                                location=site.location.name,
                                site=site.name,
                                category="MNR",
                                notification_type="SUCCESS",
                                message=f"Container No {container.container_no}, {file_name} Image FTP Upload Successful",
                            )
                        else:
                            send_notification(
                                location=site.location.name,
                                site=site.name,
                                category="MNR",
                                notification_type="FAILURE",
                                message=f"Container No {container.container_no}, {file_name} Image FTP Upload Failed !!!",
                            )
                    image.upload_to_ftp = True
                    image.save()
                    stock.post_mnr_img_uploaded_to_ftp = True
                    stock.save()
                return Response(
                    {"successMsg": "Image FTP Upload Successful"},
                    status=200,
                )
            else:
                return Response({"errorMsg": validation}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)
