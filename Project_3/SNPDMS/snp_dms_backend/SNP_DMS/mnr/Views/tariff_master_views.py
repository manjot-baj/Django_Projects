import os

# from regex import F
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from ..models import TariffMaster, TariffMasterLine, TariffSpecificLocation
from ..functions import (
    extract_tariff_excel_data,
    getTariffExcelData,
    make_tariff_excel,
    extract_specific_location_excel_data,
)
from django.http import HttpResponse
import logging, traceback
from django.db import transaction
from account.permissions import HasAllowedRoles

class TariffRowDataApiView(views.APIView):
    """Post Function will tariff row data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            parent = TariffMaster.objects.get(pk=data["parent_id"])
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

            queryset = TariffMasterLine.objects.filter(parent=parent)
            if (
                main_component is not None
                and component_code is not None
                and component_description is not None
                and location_code is not None
                and location_description is not None
                and specific_location_code is not None
                and specific_location_description is not None
                and damage_code is not None
                and damage_description is not None
                and material_code is not None
                and material_description is not None
                and repair_code is not None
                and repair_description is not None
                and unit is not None
                and measurement is not None
            ):
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                        location_code=location_code,
                        location_description=location_description,
                        damage_code=damage_code,
                        damage_description=damage_description,
                        material_code=material_code,
                        material_description=material_description,
                        repair_code=repair_code,
                        repair_description=repair_description,
                        unit=unit,
                        measurement=measurement,
                    )
                    .exclude(length_and_width=None)
                    .values("length_and_width")
                    .distinct()
                )
                main_list = list(queryset)
                return Response(main_list, status=200)

            elif (
                main_component is not None
                and component_code is not None
                and component_description is not None
                and location_code is not None
                and location_description is not None
                and specific_location_code is not None
                and specific_location_description is not None
                and damage_code is not None
                and damage_description is not None
                and material_code is not None
                and material_description is not None
                and repair_code is not None
                and repair_description is not None
            ):
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                        location_code=location_code,
                        location_description=location_description,
                        damage_code=damage_code,
                        damage_description=damage_description,
                        material_code=material_code,
                        material_description=material_description,
                        repair_code=repair_code,
                        repair_description=repair_description,
                    )
                    .exclude(unit=None, measurement=None)
                    .values("unit", "measurement")
                    .distinct()
                )
                main_list = list(queryset)
                return Response(main_list, status=200)

            elif (
                main_component is not None
                and component_code is not None
                and component_description is not None
                and location_code is not None
                and location_description is not None
                and specific_location_code is not None
                and specific_location_description is not None
                and damage_code is not None
                and damage_description is not None
                and material_code is not None
                and material_description is not None
            ):
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                        location_code=location_code,
                        location_description=location_description,
                        damage_code=damage_code,
                        damage_description=damage_description,
                        material_code=material_code,
                        material_description=material_description,
                    )
                    .exclude(repair_code=None, repair_description=None)
                    .values("repair_code", "repair_description")
                    .distinct()
                )
                main_list = list(queryset)
                return Response(main_list, status=200)

            elif (
                main_component is not None
                and component_code is not None
                and component_description is not None
                and location_code is not None
                and location_description is not None
                and specific_location_code is not None
                and specific_location_description is not None
                and damage_code is not None
                and damage_description is not None
            ):
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                        location_code=location_code,
                        location_description=location_description,
                        damage_code=damage_code,
                        damage_description=damage_description,
                    )
                    .exclude(material_code=None, material_description=None)
                    .values("material_code", "material_description")
                    .distinct()
                )
                main_list = list(queryset)
                return Response(main_list, status=200)

            elif (
                main_component is not None
                and component_code is not None
                and component_description is not None
                and location_code is not None
                and location_description is not None
                and specific_location_code is not None
                and specific_location_description is not None
            ):
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                        location_code=location_code,
                        location_description=location_description,
                    )
                    .exclude(damage_code=None, damage_description=None)
                    .values("damage_code", "damage_description")
                    .distinct()
                )
                main_list = list(queryset)
                return Response(main_list, status=200)

            elif (
                main_component is not None
                and component_code is not None
                and component_description is not None
                and location_code is not None
                and location_description is not None
            ):
                queryset = (
                    TariffSpecificLocation.objects.filter(
                        location_code=location_code.split("_")[0],
                    )
                    .values("specific_location_code", "specific_location_description")
                    .distinct()
                )
                main_list = list(queryset)
                main_list.append(
                    {
                        "specific_location_code": "NA",
                        "specific_location_description": "NA",
                    }
                )
                return Response(main_list, status=200)

            elif (
                main_component is not None
                and component_code is not None
                and component_description is not None
            ):
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                    )
                    .exclude(location_code=None, location_description=None)
                    .values("location_code", "location_description")
                    .distinct()
                )
                main_list = list(queryset)
                return Response(main_list, status=200)

            elif main_component is not None:
                queryset = (
                    queryset.filter(
                        main_component=main_component,
                    )
                    .exclude(component_code=None, component_description=None)
                    .values("component_code", "component_description")
                    .distinct()
                )

                main_list = list(queryset)
                return Response(main_list, status=200)
            else:
                return Response({"errorMsg": "InValid Data"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class DowloadTariff(views.APIView):
    """Post Function will download tariff data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            if len(data) > 1:
                return Response(
                    {"errorMsg": "Only Single Client Tariff is Downloadable"},
                    status=200,
                )
            pk = data[0]
            main_data = getTariffExcelData(pk)
            temp_file_path = make_tariff_excel(main_data)

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="{main_data["client"]}_tariff.xlsx"'
                )
                os.remove(temp_file_path)
                return file_response
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class GetAllTariff(views.APIView):
    """Post Function will give all tariff data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data

            queryset = TariffMaster.objects.all()

            if not len(data["client"]) == 0:
                queryset = queryset.filter(client=data["client"])

            if not len(data["location"]) == 0:
                queryset = queryset.filter(location__name=data["location"])

            if not len(data["site"]) == 0:
                queryset = queryset.filter(site__name=data["site"])

            response = [
                {
                    "pk": each.pk,
                    "client": each.client,
                    "location": each.location.name,
                    "site": each.site.name,
                    "labour_rate": str(each.labour_rate),
                }
                for each in queryset
            ]
            return Response(response, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class UploadSpecificLocationCodeDesc(views.APIView):
    """Post Function will give the upload tariff data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            file = data["file"]
            _ = extract_specific_location_excel_data(input_excel=file)
            return Response(
                {"successMsg": f"Data Saved"},
                status=200,
            )
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class UploadTariff(views.APIView):
    """Post Function will give the upload tariff data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            file = data["file"]
            client = data["client"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])

            if TariffMaster.objects.filter(
                client=client, location=location, site=site
            ).exists():
                return Response(
                    {"errorMsg": "Tariff Already Uploaded"},
                    status=200,
                )

            extracted_data = extract_tariff_excel_data(input_excel=file)
            if extracted_data == "Header Not Found":
                return Response(
                    {"errorMsg": "Data file is corrupted, unable to extract data"},
                    status=200,
                )
            else:
                try:
                    labour_rate = float(extracted_data[0]["labour_rate"])
                except Exception as e:
                    return Response(
                        {
                            "errorMsg": f"Please Provide Valid Data for Tariff Calculation"
                        },
                        status=200,
                    )

                parent = TariffMaster(
                    client=client, location=location, site=site, labour_rate=labour_rate
                )
                parent.save()

                objList = []
                for each in extracted_data:
                    try:
                        labour_hrs_tariff = float(each["labour_hrs_tariff"])
                        quantity = int(each["quantity"])
                        material_tariff = float(each["material_rate_tariff"])
                        wash_clean_tariff = float(each["wash_clean_tariff"])
                        total_cost = float(0)
                        labour_cost = float(0)
                        material_cost = float(0)

                        labour_cost = labour_rate * labour_hrs_tariff * quantity
                        if not wash_clean_tariff == float(0):
                            material_cost = wash_clean_tariff * quantity
                        else:
                            material_cost = material_tariff * quantity

                        total_cost = float(labour_cost) + float(material_cost)

                    except Exception as e:
                        TariffMaster.objects.filter(
                            client=client, location=location, site=site
                        ).delete()
                        return Response(
                            {
                                "errorMsg": f"Please Provide Valid Data for Tariff Calculation"
                            },
                            status=200,
                        )

                    objList.append(
                        TariffMasterLine(
                            parent=parent,
                            size=None,
                            type=None,
                            tariff_code=each["tariff_code"],
                            main_component=each["main_component"],
                            component_code=each["component_code"],
                            component_description=each["component_description"],
                            location_code=each["location_code"],
                            location_description=each["location_description"],
                            damage_code=each["damage_code"],
                            damage_description=each["damage_description"],
                            material_code=each["material_code"],
                            material_description=each["material_description"],
                            repair_code=each["repair_code"],
                            repair_description=each["repair_description"],
                            unit=each["unit_code"],
                            measurement=each["unit_description"],
                            length_and_width=each["length_width"],
                            quantity=quantity,
                            labour_hrs_tariff=labour_hrs_tariff,
                            wash_clean_tariff=wash_clean_tariff,
                            material_tariff=material_tariff,
                            labour_cost=labour_cost,
                            material_cost=material_cost,
                            total_cost=total_cost,
                        )
                    )
                TariffMasterLine.objects.bulk_create(objList)
                return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class DeleteTariff(views.APIView):
    """Post Function will delete tariff data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            with transaction.atomic():
                for pk in data:
                    TariffMaster.objects.get(pk=pk).delete()
            return Response({"successMsg": "Data Deleted"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
