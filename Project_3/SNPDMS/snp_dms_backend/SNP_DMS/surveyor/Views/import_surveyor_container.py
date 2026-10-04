# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback
import logging
from common.functions import get_location_site
from django.db import transaction
from datetime import datetime

# model imports

from mnr.models import TariffMaster, Survey, SurveyLine, BeforeRepairImage
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock
from surveyor.models import Surveyor, SurveyorLine, SurveyorBeforeRepairImage
from account.models import AccountUser

from account.permissions import HasAllowedRoles

class SurveyorContainer(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
        "MNR Team",
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
    ]

    def post(self, request, *args, **kwargs):
        try:
            surveyor_containers = Surveyor.objects.get_list_of_to_be_imported_contaiers(
                data=request.data
            )
            return Response(surveyor_containers, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            data = Surveyor.objects.get_gate_in_data(pk)
            return Response(data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class ImportSurveyorContainers(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
        "Admin",
    ]
    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                location, site = get_location_site(
                    location_name=request.data.get("location"),
                    site_name=request.data.get("site"),
                )
                container_no = request.data.get("container_no")
                created_by = AccountUser.objects.get(username=request.user.username)
                model = (
                    ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
                )
                stock = model.objects.get(
                    container_status="IN",
                    container__container_no=container_no,
                    container__location=location,
                    container__site=site,
                )
                surveyor_data = Surveyor.objects.get(
                    container_no=container_no,
                    gate_in_date=stock.gate_in.in_date,
                    location=location,
                    site=site,
                )

                if site.type == "DEPOT":
                    params = {"depot": stock}
                else:
                    params = {"non_depot": stock}

                try:
                    labour_rate = (
                        TariffMaster.objects.filter(
                            client=surveyor_data.line, location=location, site=site
                        )
                        .first()
                        .labour_rate
                    )
                except:
                    labour_rate = 0

                if not surveyor_data.is_img_uploaded:
                    return Response(
                        {
                            "errorMsg": "Cannot import data as images in surveyor are not uploaded"
                        }
                    )

                if (
                    Survey.objects.filter(**params).exists()
                    and not stock.is_mnr_data_imported
                    and stock.is_survey_import_available
                ):
                    survey = Survey.objects.filter(**params)
                    survey.delete()

                if not Survey.objects.filter(**params).exists():
                    survey = Surveyor.objects.create_survey_object(
                        site, stock, surveyor_data, created_by, labour_rate
                    )
                    # if site.lolo_finance and survey is None:
                    #     return Response(
                    #         {
                    #             "errorMsg": "Container should be PreGateIn First and should be under do_validity"
                    #         },
                    #         status=200,
                    #     )

                    Surveyor.objects.create_survey_line_object(survey, surveyor_data)

                    Surveyor.objects.create_survey_image_objects(survey, surveyor_data)

                    stock.is_mnr_data_imported = True
                    stock.save(update_fields=["is_mnr_data_imported"])
                else:
                    return Response({"errorMsg": "Data already imported"})

                return Response({"successMsg": "Succesfully Imported Data"}, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}
