# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback
import logging

from surveyor.functions import get_survey_line_tarrif, getTariffData
from common.functions import get_location_site
from common.functions import cache_api_view
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

# model imports

from mnr.models import TariffMaster, MnrStaff
from master.models_two import Client, ClientAbbreviation
from depot.models import ContainerSize, ContainerType
from account.permissions import HasAllowedRoles

class SurveyorTariffView(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data

            tarrif = TariffMaster.objects.get(pk=data["tariff_id"])
            main_component = data.get("main_component", None)
            component_code = data.get("component_code", None)
            component_description = data.get("component_description", None)
            location_code = data.get("location_code", None)
            location_description = data.get("location_description", None)
            specific_location_code = data.get("specific_location_code", None)
            specific_location_description = data.get(
                "specific_location_description", None
            )
            damage_code = data.get("damage_code", None)
            damage_description = data.get("damage_description", None)
            material_code = data.get("material_code", None)
            material_description = data.get("material_description", None)
            repair_code = data.get("repair_code", None)
            repair_description = data.get("repair_description", None)
            measurement = data.get("measurement", None)
            unit = data.get("unit", None)

            main_data = get_survey_line_tarrif(
                tarrif,
                main_component,
                component_code,
                component_description,
                location_code,
                location_description,
                specific_location_code,
                specific_location_description,
                damage_code,
                damage_description,
                material_code,
                material_description,
                repair_code,
                repair_description,
                unit,
                measurement,
            )
            return Response(main_data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class SurveyorInformView(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Surveyor",
    ]

    @cache_api_view("surveyor_inform_dependency", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = data.get("location")
            site = data.get("site")
            location_obj, site_obj = get_location_site(
                location_name=location, site_name=site
            )
            client_data = []

            for client in Client.objects.filter(
                location=location_obj, site=site_obj, type="Line", ref_code="MSC"
            ).distinct():
                try:
                    client_abbreviations = (
                        ClientAbbreviation.objects.filter(client=client)
                        .latest("pk")
                        .name
                    )
                except:
                    client_abbreviations = ""

                try:
                    tariff = TariffMaster.objects.filter(
                        client="MSC",
                        location=location_obj,
                        site=site_obj,
                    ).first()
                except:
                    tariff = ""

                client_data.append(
                    {
                        "name": client.name,
                        "line": client_abbreviations,
                        "tariff_id": tariff.pk if tariff else "",
                    }
                )

            size_data = [size.name for size in ContainerSize.objects.all()]
            type_data = [type.name for type in ContainerType.objects.all()]
            mnr_staff = [
                {
                    "name": f"{staff['firstName']} {staff['lastName'] or ''}",
                    "pk": staff["pk"],
                }
                for staff in MnrStaff.objects.filter(
                    role="Surveyor", location=location_obj, site=site_obj
                ).values("firstName", "lastName", "pk")
            ]
            main_data = {
                "client_data": client_data if client_data else [],
                "size_data": size_data,
                "type_data": type_data,
                "staff_data": mnr_staff,
            }
            main_data["tariff_data"] = getTariffData(
                client="MSC",
                location=location,
                site=site,
            )
            return Response(main_data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender in [Client, TariffMaster, MnrStaff]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_surveyor_inform_dependency_{location}_{site}_movement")
        cache.delete(f"request_surveyor_inform_dependency_{location}_{site}_movement")
    # elif sender in [ClientAbbreviation]:
    #     location = instance.client.location
    #     site = instance.client.site
    #     cache.delete(f"response_surveyor_inform_dependency_{location}_{site}_movement")
    #     cache.delete(f"request_body_surveyor_inform_dependency_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [Client, TariffMaster, MnrStaff]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_surveyor_inform_dependency_{location}_{site}_movement")
        cache.delete(f"request_surveyor_inform_dependency_{location}_{site}_movement")
    # elif sender in [ClientAbbreviation]:
    #     location = instance.client.location
    #     site = instance.client.site
    #     cache.delete(f"response_surveyor_inform_dependency_{location}_{site}_movement")
    #     cache.delete(f"request_body_surveyor_inform_dependency_{location}_{site}_movement")
