# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback
import logging, os, random
from decouple import config
from django.db import transaction
from surveyor.utils import (
    upload_mnr_repair_img_to_s3,
    compressed_images,
)
from surveyor.functions import get_survey_line_data
from depot.functions_two import check_char_digit
from common.functions import get_location_site

# model imports
from surveyor.models import Surveyor, SurveyorLine, SurveyorBeforeRepairImage
from mnr.models import TariffMaster, Estimate, Survey
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock

# permission imports
from account.permissions import HasAllowedRoles


def randomNumber():
    random_no = f"E{random.randint(1000000, 9999999)}"
    while (
        Estimate.objects.filter(number=random_no).exists()
        or Survey.objects.filter(estimate_number=random_no).exists()
    ):
        random_no = f"E{random.randint(1000000, 9999999)}"
        if (
            not Estimate.objects.filter(number=random_no).exists()
            and not Survey.objects.filter(estimate_number=random_no).exists()
        ):
            break
    return random_no


AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


class SurveyorView(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                location = data.get("location")
                site = data.get("site")

                survey_line = data.pop("survey_line")
                parent = Surveyor.objects.create_instance(
                    location=location, site=site, data=data
                )

                location_obj, site_obj = get_location_site(
                    location_name=location, site_name=site
                )
                arrived = data.get("arrived", None)
                if (
                    site_obj.lolo_finance
                    and arrived in ["Factory", "FS RETURN", "CFS/ICD"]
                    and parent is None
                ):
                    return Response(
                        {
                            "errorMsg": "Container should be PreGateIn First and should be under do_validity"
                        },
                        status=200,
                    )

                tariff_master = TariffMaster.objects.get(pk=data["tariff_id"])

                for line in survey_line:

                    line_data = get_survey_line_data(parent=tariff_master, line=line)
                    SurveyorLine.objects.create_instance(parent, line_data)
                return Response(
                    {"message": "Data Successfully Created", "surveyor_id": parent.pk},
                    status=200,
                )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class GetSurveyDetails(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    def validate_container(self, container_no, location, site):
        try:
            params = {
                "container__location": location,
                "container__site": site,
                "stage": "Survey",
                "container__client__ref_code": "MSC",
                "container__container_no": container_no,
            }
            if site.type == "DEPOT":
                stock = ContainerStock.objects.filter(**params).latest("pk")
                if (
                    Survey.objects.filter(depot=stock).exists()
                    or Surveyor.objects.filter(
                        container_no=stock.container.container_no,
                        location=location,
                        site=site,
                        gate_in_date=stock.gate_in.in_date,
                        gate_in_time=stock.gate_in.in_time,
                    ).exists()
                ):
                    return False
                else:
                    return True

            else:
                stock = NonDepotContainerStock.objects.filter(**params).latest("pk")
                if (
                    Survey.objects.filter(non_depot=stock).exists()
                    or Surveyor.objects.filter(
                        container_no=stock.container.container_no,
                        location=location,
                        site=site,
                        gate_in_date=stock.gate_in.in_date,
                        gate_in_time=stock.gate_in.in_time,
                    ).exists()
                ):
                    return False
                else:
                    return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data.get("container_no")
            location = data.get("location")
            site = data.get("site")
            location_obj, site_obj = get_location_site(
                location_name=location, site_name=site
            )
            model = (
                ContainerStock if site_obj.type == "DEPOT" else NonDepotContainerStock
            )
            if Surveyor.objects.filter(
                is_img_uploaded=False,
                location=location_obj,
                site=site_obj,
            ).exists():
                main_data = Surveyor.objects.get_surveyor_data(
                    container_no, location_obj, site_obj, flag=True
                )
                return Response(main_data, status=200)

            if self.validate_container(container_no, location_obj, site_obj) is False:
                return Response(
                    {
                        "errorMsg": f"Survey of {container_no} already exists either in MNR System  or Surveyor Login",
                    },
                    status=200,
                )

            elif model.objects.filter(
                container__container_no=container_no,
                container__location=location_obj,
                container__site=site_obj,
                stage="Survey",
            ).exists():

                data = Surveyor.objects.get_stock_data_for_surveyor(
                    container_no, location_obj, site_obj
                )
                return Response(data, status=200)
            else:
                return Response(
                    {"errorMsg": "Container not found, Please add the container"},
                    status=200,
                )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class UploadSurveyorImages(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    def post(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                if not "file_list" in data.keys():
                    return Response(
                        {"errorMsg": "Please upload a file"},
                        status=400,
                    )
                file_list = request.FILES.getlist("file_list")

                images = [
                    file
                    for file in file_list
                    if file.name.endswith((".jpeg", ".png", ".jpg"))
                ]

                if not images:
                    return Response(
                        {"errorMsg": "Please upload a [jpeg,png,jpg,zip] file"}
                    )
                suveyor = Surveyor.objects.get(pk=pk)
                if (
                    SurveyorLine.objects.filter(parent=suveyor).count() == 1
                    and not SurveyorBeforeRepairImage.objects.filter(
                        parent=suveyor
                    ).exists()
                    and not len(images) > 4
                ):
                    return Response({"errorMsg": "Please upload at least 5 images"})
                elif (
                    SurveyorLine.objects.filter(parent=suveyor).count() > 1
                    and not SurveyorBeforeRepairImage.objects.filter(
                        parent=suveyor
                    ).exists()
                    and not len(images) > 9
                ):
                    return Response({"errorMsg": "Please upload at least 10images"})
                elif len(images) > 40:
                    return Response({"errorMsg": "Cannot upload more than 40 images"})

                compressed_img = compressed_images(images)

                if not suveyor.estimate_number:
                    suveyor.estimate_number = randomNumber()
                    suveyor.save(update_fields=["estimate_number"])

                upload_mnr_repair_img_to_s3(
                    process="Survey",
                    pk=pk,
                    file_list=compressed_img,
                )
                suveyor_data = Surveyor.objects.get_surveyor_data(
                    suveyor.container_no, suveyor.location, suveyor.site
                )
                return Response(suveyor_data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class ContainerValidation(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data.get("container_no")
            location = data.get("location")
            site = data.get("site")
            location_obj, site_obj = get_location_site(
                location_name=location, site_name=site
            )
            if Surveyor.objects.filter(
                is_img_uploaded=False, location=location_obj, site=site_obj
            ).exists():
                main_data = Surveyor.objects.get_surveyor_data(
                    container_no, location_obj, site_obj, flag=True
                )
                return Response(main_data, status=200)
            elif ContainerStock.objects.filter(
                container__container_no=container_no,
                container__location=location_obj,
                container__site=site_obj,
                stage="Survey",
            ).exists():
                return Response(
                    {
                        "errorMsg": "Container already exists in stock, please search for container"
                    }
                )
            elif not len(container_no) == 11:

                return Response(
                    {
                        "errorMsg": "Invalid Entry, "
                        "Please Enter Container_no having first 4 uppercase alphabets and "
                        "rest 7 digits"
                    },
                    status=200,
                )
            elif check_char_digit(container_no) is False:
                return Response(
                    {
                        "errorMsg": "Invalid Entry, "
                        "Please Enter Container_no having first 4 uppercase alphabets and "
                        "rest 7 digits"
                    },
                    status=200,
                )
            else:
                return Response({})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class SurveyContainers(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            containers = Surveyor.objects.get_survey_containers(data)
            return Response(containers)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}
