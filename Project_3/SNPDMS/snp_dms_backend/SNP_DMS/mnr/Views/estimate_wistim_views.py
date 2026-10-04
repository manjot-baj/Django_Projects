from account.models import AccountUser
from master.models import Location, Site
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import TypeSizeCode
from mnr.models import Estimate, SurveyLine, TariffMaster, Approval, BeforeRepairImage
from wistim_distim.functions import make_edi
from django.http import HttpResponse
import os, datetime
from django.utils import timezone
from django.db import transaction
from ..functions import (
    get_survey_line_length_width,
    upload_wistim_to_s3,
    get_site_ftp_detail,
    upload_file_to_ftp_server,
)
import logging, traceback
from decouple import config
from notification.utils import send_notification
from ..functions import mnr_img_validation
from common.functions import download_file
from account.permissions import HasAllowedRoles

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


class EstimateWistimView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            # General Data
            data = request.data
            site = Site.objects.get(name=data["site"])
            location = Location.objects.get(name=data["location"])
            stock_id = data["stock_id"]
            app_user = AccountUser.objects.get(username=request.user.username)
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date()
            time = dt.time()
            client = None
            estimate_list = []

            with transaction.atomic():
                if site.type == "DEPOT":
                    estimate_list = [
                        Estimate.objects.get(parent__depot__pk=id)
                        for id in stock_id
                        if Estimate.objects.filter(
                            parent__depot__pk=id, is_proceed=True
                        ).exists()
                    ]
                    client = estimate_list[0].parent.depot.container.client.ref_code

                    if len(estimate_list) == 0:
                        return Response(
                            {
                                "errorMsg": f"Please select stock objects whose Estimate stage is completed"
                            },
                            status=200,
                        )
                else:
                    estimate_list = [
                        Estimate.objects.get(parent__non_depot__pk=id)
                        for id in stock_id
                        if Estimate.objects.filter(
                            parent__non_depot__pk=id, is_proceed=True
                        ).exists()
                    ]
                    client = estimate_list[0].parent.non_depot.container.client.ref_code

                    if len(estimate_list) == 0:
                        return Response(
                            {
                                "errorMsg": f"Please select stock objects whose Estimate stage is completed"
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
                if site.vendor_code is None:
                    response["vendor_code"] = ""
                else:
                    response["vendor_code"] = site.vendor_code

                if site.depot_code is None:
                    response["depot_code"] = ""
                else:
                    response["depot_code"] = site.depot_code

                if location.country.currency is None:
                    response["currency"] = ""
                else:
                    response["currency"] = location.country.currency

                response["shipping_line"] = client
                tariff_object = TariffMaster.objects.select_related(
                    "location", "site"
                ).get(client=client, location=location, site=site)

                if tariff_object.labour_rate is None:
                    response["labour_hourly_rate"] = 0
                else:
                    response["labour_hourly_rate"] = tariff_object.labour_rate

                container_data = []
                sr_no = 1
                for estimate in estimate_list:
                    single_container_data = {}
                    container_object = None
                    if estimate.parent.depot is not None:
                        container_object = estimate.parent.depot.container
                        stock = estimate.parent.depot
                        stock.is_estimate_westim_sent = True
                        stock.save()
                    else:
                        container_object = estimate.parent.non_depot.container
                        stock = estimate.parent.non_depot
                        stock.is_estimate_westim_sent = True
                        stock.save()
                    surveyline_data = SurveyLine.objects.filter(
                        parent=estimate.parent, is_rejected=False
                    )

                    # Approval Check
                    if Approval.checkExistByParentId(id=estimate.pk):
                        approval_data = Approval.getByParentId(id=estimate.pk)
                        if approval_data.sent_to_line is False:
                            approval_data.updateWithSentToLine(
                                date=date,
                                time=time,
                                approval_amount=estimate.current_amount,
                                updated_by=app_user,
                            )
                        else:
                            pass
                    else:
                        Approval.createWithSentToLine(
                            parent=estimate,
                            date=date,
                            time=time,
                            approval_amount=estimate.current_amount,
                            created_by=app_user,
                        )

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

                    if estimate.current_date is None:
                        single_container_data["estimate_date_time"] = ""
                    else:
                        single_container_data["estimate_date_time"] = (
                            estimate.current_date
                        )

                    if estimate.number is None:
                        single_container_data["repair_estimate_ref_no"] = ""
                    else:
                        single_container_data["repair_estimate_ref_no"] = (
                            estimate.number
                        )
                    ###seq_data
                    repair_seq_no = 1
                    seq_data = []
                    for surveyline in surveyline_data:
                        seq = {}
                        seq["repair_sequence"] = repair_seq_no
                        if (
                            surveyline.specific_location_code is None
                            or surveyline.specific_location_code == "NA"
                        ):
                            seq["damage_location"] = surveyline.location_code.split(
                                "_"
                            )[0]
                        else:
                            seq["damage_location"] = surveyline.specific_location_code

                        if surveyline.component_code is None:
                            seq["component"] = ""
                        else:
                            seq["component"] = surveyline.component_code.split("_")[0]

                        if surveyline.damage_code is None:
                            seq["damage_type"] = ""
                        else:
                            seq["damage_type"] = surveyline.damage_code.split("_")[
                                0
                            ].split("/")[0]

                        if surveyline.material_code is None:
                            seq["material_type"] = ""
                        else:
                            seq["material_type"] = surveyline.material_code.split("_")[
                                0
                            ]

                        if surveyline.repair_code is None:
                            seq["repair_type"] = ""
                        else:
                            seq["repair_type"] = surveyline.repair_code.split("_")[0]

                        if surveyline.length_and_width is None:
                            length = ""
                            width = ""
                            seq["length"] = length
                            seq["width"] = width
                        else:
                            length, width = get_survey_line_length_width(
                                surveyline.length_and_width
                            )
                            seq["length"] = length
                            seq["width"] = width

                        if surveyline.unit is None:
                            seq["unit_type"] = ""
                        else:
                            seq["unit_type"] = surveyline.unit

                        if surveyline.quantity is None:
                            seq["quantity"] = ""
                        else:
                            seq["quantity"] = surveyline.quantity

                        if surveyline.labour_hrs_tariff is None:
                            seq["man_hrs_tariff"] = str(float(0))
                        else:
                            seq["man_hrs_tariff"] = surveyline.labour_hrs_tariff

                        if surveyline.material_tariff is None:
                            seq["material_tariff"] = str(float(0))
                        else:
                            seq["material_tariff"] = surveyline.material_tariff

                        if surveyline.wash_clean_tariff is None:
                            seq["cleaning_cost_tariff"] = str(float(0))
                        else:
                            seq["cleaning_cost_tariff"] = surveyline.wash_clean_tariff

                        seq_data.append(seq)
                        repair_seq_no = repair_seq_no + 1
                    single_container_data["seq_data"] = seq_data
                    container_data.append(single_container_data)
                    sr_no = sr_no + 1
                response["container_data"] = container_data

                # EDI
                edi_file_path = None
                if site.name == "FARIDABAD":
                    edi_file_path = make_edi(response, site=site.name)
                else:
                    edi_file_path = make_edi(response)

                date_str = date.strftime("%Y%m%d")
                time_str = time.strftime("%H%M")
                file_name = f"{date_str}{time_str}_{client.lower()}_estimate_wistim.edi"

                upload_wistim_to_s3(
                    location=location.name,
                    site=site.name,
                    site_type=site.type,
                    process="Estimate",
                    date=dt,
                    object_list=estimate_list,
                    file_name=file_name,
                    file_path=edi_file_path,
                )

                # ftp_data = get_site_ftp_detail(
                #     site=site.name, process="estimate_wistim"
                # # )
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
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class WestimEdiFtpUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def seq_data_helper(self, surveyline_data):
        try:
            seq_data = []
            for repair_seq_no, surveyline in enumerate(surveyline_data, start=1):
                seq = {
                    "repair_sequence": repair_seq_no,
                    "damage_location": (
                        surveyline.specific_location_code.split("_")[0]
                        if surveyline.specific_location_code
                        and surveyline.specific_location_code != "NA"
                        else surveyline.location_code.split("_")[0]
                    ),
                    "component": (
                        surveyline.component_code.split("_")[0]
                        if surveyline.component_code
                        else ""
                    ),
                    "damage_type": (
                        surveyline.damage_code.split("_")[0].split("/")[0]
                        if surveyline.damage_code
                        else ""
                    ),
                    "material_type": (
                        surveyline.material_code.split("_")[0]
                        if surveyline.material_code
                        else ""
                    ),
                    "repair_type": (
                        surveyline.repair_code.split("_")[0]
                        if surveyline.repair_code
                        else ""
                    ),
                    "length": "",
                    "width": "",
                    "unit_type": surveyline.unit or "",
                    "quantity": surveyline.quantity or "",
                    "man_hrs_tariff": (
                        str(float(surveyline.labour_hrs_tariff))
                        if surveyline.labour_hrs_tariff
                        else "0"
                    ),
                    "material_tariff": (
                        str(float(surveyline.material_tariff))
                        if surveyline.material_tariff
                        else "0"
                    ),
                    "cleaning_cost_tariff": (
                        str(float(surveyline.wash_clean_tariff))
                        if surveyline.wash_clean_tariff
                        else "0"
                    ),
                }
                if surveyline.length_and_width:
                    seq["length"], seq["width"] = get_survey_line_length_width(
                        surveyline.length_and_width
                    )
                seq_data.append(seq)
            return seq_data
        except:
            # Log any exceptions
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get(self, request, pk, *args, **kwargs):
        try:
            # General Data
            with transaction.atomic():
                estimate = Estimate.objects.get(pk=pk)
                survey_obj = estimate.parent
                location = None
                site = None
                app_user = AccountUser.objects.get(username=request.user.username)
                stock = None
                try:
                    stock = survey_obj.depot
                    location = stock.container.location
                    site = stock.container.site
                    line = stock.container.client.ref_code
                except:
                    stock = survey_obj.non_depot
                    location = stock.container.location
                    site = stock.container.site
                    line = stock.container.client.ref_code

                if not line.lower() == "msc":
                    return Response({"errorMsg": "Line Should be 'MSC'"}, status=200)

                if stock.pre_mnr_edi_uploaded_to_ftp is True:
                    return Response(
                        {"errorMsg": "Estimate Westim EDI Already Uploaded to FTP"},
                        status=200,
                    )

                tariff_object = TariffMaster.objects.select_related(
                    "location", "site"
                ).get(client="MSC", location=location, site=site)
                container_object = (
                    estimate.parent.depot.container
                    if estimate.parent.depot
                    else estimate.parent.non_depot.container
                )
                if container_object.client.ref_code.lower() == "msc":
                    container_no = container_object.container_no
                    response = {
                        "vendor_code": site.vendor_code or "",
                        "depot_code": site.depot_code or "",
                        "currency": location.country.currency or "",
                        "shipping_line": "MSC",
                        "labour_hourly_rate": tariff_object.labour_rate or 0,
                        "container_data": [],
                    }
                    single_container_data = {}
                    surveyline_data = SurveyLine.objects.filter(
                        parent=estimate.parent, is_rejected=False
                    )
                    # Process container data
                    single_container_data["sr_no"] = 1
                    single_container_data["equipment_no"] = (
                        container_object.container_no
                    )
                    iso_code = (
                        TypeSizeCode.objects.filter(
                            size=container_object.size, type=container_object.type
                        )
                        .values_list("code", flat=True)
                        .first()
                        or ""
                    )
                    single_container_data["iso_code"] = iso_code
                    single_container_data["estimate_date_time"] = (
                        estimate.current_date or ""
                    )
                    single_container_data["repair_estimate_ref_no"] = (
                        estimate.number or ""
                    )
                    # Process sequence data
                    seq_data = self.seq_data_helper(surveyline_data)
                    single_container_data["seq_data"] = seq_data
                    response["container_data"].append(single_container_data)

                    # Generate EDI file
                    edi_file_path = None
                    if site.name == "FARIDABAD":
                        edi_file_path = make_edi(response, site=site.name)
                    else:
                        edi_file_path = make_edi(response)
                    # Prepare file name for S3 and FTP
                    tz = timezone.get_current_timezone()
                    dt = timezone.now().astimezone(tz)
                    date_str = dt.strftime("%Y%m%d")
                    time_str = dt.strftime("%H%M")
                    date = dt.date()
                    time = dt.time()
                    file_name = f"{date_str}{time_str}_msc_estimate_wistim.edi"

                    # Approval Check
                    if Approval.checkExistByParentId(id=estimate.pk):
                        approval_data = Approval.getByParentId(id=estimate.pk)
                        if approval_data.sent_to_line is False:
                            approval_data.updateWithSentToLine(
                                date=date,
                                time=time,
                                approval_amount=estimate.current_amount,
                                updated_by=app_user,
                            )
                        else:
                            pass
                    else:
                        Approval.createWithSentToLine(
                            parent=estimate,
                            date=date,
                            time=time,
                            approval_amount=estimate.current_amount,
                            created_by=app_user,
                        )

                    # Upload to S3
                    upload_wistim_to_s3(
                        location=location.name,
                        site=site.name,
                        site_type=site.type,
                        process="Estimate",
                        date=dt,
                        object_list=[estimate],
                        file_name=file_name,
                        file_path=edi_file_path,
                    )

                    # Upload to FTP
                    ftp_data = get_site_ftp_detail(site.name, "estimate_wistim")
                    if ftp_data:
                        ftp_response = upload_file_to_ftp_server(
                            host=ftp_data["host"],
                            username=ftp_data["username"],
                            password=ftp_data["password"],
                            working_directory=ftp_data["working_directory"],
                            file_name=file_name,
                            file_path=edi_file_path,
                        )

                        if ftp_response is True:
                            stock.pre_mnr_edi_uploaded_to_ftp = True
                            stock.save()
                            send_notification(
                                location=location.name,
                                site=site.name,
                                category="MNR",
                                notification_type="SUCCESS",
                                message=f"Container No {container_no}, Estimate updated {str(survey_obj.update_count)} time and Estimate Westim EDI Uploaded to FTP Successfully",
                            )
                        else:
                            send_notification(
                                location=location.name,
                                site=site.name,
                                category="MNR",
                                notification_type="FAILURE",
                                message=f"Container No {container_no}, Estimated updated {str(survey_obj.update_count)} time and Estimate Westim EDI Uploaded to FTP Failed !!!",
                            )

                    with open(edi_file_path, "r") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/edi"
                        )
                        file_response["Content-Disposition"] = (
                            f"attachment; filename={file_name}"
                        )
                        os.remove(edi_file_path)
                    return file_response
                else:
                    return Response({"errorMsg": "Data Not Found"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    # class WestimImgFtpUploadView(APIView):
    #     permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]


#     def get(self, request, pk, *args, **kwargs):
#         try:
#             est_obj = Estimate.objects.get(pk=pk)
#             survey_obj = est_obj.parent
#             line = None
#             try:
#                 line = survey_obj.depot.container.client.ref_code
#             except:
#                 line = survey_obj.non_depot.container.client.ref_code
#             if not line.lower() == "msc":
#                 return Response({"errorMsg": "Line Should be 'MSC'"}, status=200)

#             validation = mnr_img_validation(survey_obj)
#             if validation == True:
#                 images = BeforeRepairImage.objects.filter(
#                     parent=survey_obj, upload_to_ftp=False, ftp_upload_successful=False
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


class WestimImgFtpUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            est_obj = Estimate.objects.get(pk=pk)
            survey_obj = est_obj.parent
            line = None
            site = None
            container = None
            stock = None
            try:
                stock = survey_obj.depot
                container = stock.container
                site = container.site
                line = container.client.ref_code
            except:
                stock = survey_obj.non_depot
                container = stock.container
                site = container.site
                line = container.client.ref_code

            if not line.lower() == "msc":
                return Response({"errorMsg": "Line Should be 'MSC'"}, status=200)

            validation = mnr_img_validation(survey_obj)
            if validation == True:

                if not BeforeRepairImage.objects.filter(
                    parent=survey_obj, upload_to_ftp=False, ftp_upload_successful=False
                ).exists():
                    return Response(
                        {"errorMsg": "Current Images already uploaded to FTP server"},
                        status=200,
                    )

                images = BeforeRepairImage.objects.filter(
                    parent=survey_obj, upload_to_ftp=False, ftp_upload_successful=False
                )
                bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
                for image in images:
                    process = "before_repair_image_upload"
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
                    stock.pre_mnr_img_uploaded_to_ftp = True
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
