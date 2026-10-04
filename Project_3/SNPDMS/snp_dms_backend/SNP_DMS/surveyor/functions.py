# model imports
# from aiohttp.web_routedef import delete
from django.db.models import Count, Max
from mnr.models import TariffMaster, TariffMasterLine, TariffSpecificLocation
from django.db import transaction

# from .models import Surveyor
import logging, traceback

from surveyor.models import Surveyor


def get_survey_line_data(parent, line):
    if TariffMasterLine.objects.filter(
        parent=parent,
        main_component=line["main_component"],
        component_code=line["component_code"],
        location_code=line["location_code"],
        damage_code=line["damage_code"],
        material_code=line["material_code"],
        repair_code=line["repair_code"],
        unit=line["unit"],
        measurement=line["measurement"],
        length_and_width=line["length_and_width"],
    ).exists():
        tariff_line = TariffMasterLine.objects.filter(
            parent=parent,
            main_component=line["main_component"],
            component_code=line["component_code"],
            location_code=line["location_code"],
            damage_code=line["damage_code"],
            material_code=line["material_code"],
            repair_code=line["repair_code"],
            unit=line["unit"],
            measurement=line["measurement"],
            length_and_width=line["length_and_width"],
        ).first()

        common_data = {
            "specific_location_code": line["specific_location_code"],
            "specific_location_description": line["specific_location_description"],
            "remarks": line.get("remarks", None),
            "tariff_code": tariff_line.tariff_code or "",
            "main_component": tariff_line.main_component or "",
            "component_code": tariff_line.component_code or "",
            "component_description": tariff_line.component_description or "",
            "location_code": tariff_line.location_code or "",
            "location_description": tariff_line.location_description or "",
            "damage_code": tariff_line.damage_code or "",
            "damage_description": tariff_line.damage_description or "",
            "material_code": tariff_line.material_code or "",
            "material_description": tariff_line.material_description or "",
            "repair_code": tariff_line.repair_code or "",
            "repair_description": tariff_line.repair_description or "",
            "unit": tariff_line.unit or "",
            "measurement": tariff_line.measurement or "",
            "length_and_width": tariff_line.length_and_width or "",
            "quantity": int(line["quantity"]),
        }
        labour_cost = round(
            float(tariff_line.labour_cost) * common_data["quantity"],
            2,
        )
        material_cost = round(
            float(tariff_line.material_cost) * common_data["quantity"],
            2,
        )
        total_cost = labour_cost + material_cost

        if float(tariff_line.total_cost) != 0:
            line_data = {
                **common_data,
                "labour_hrs_tariff": tariff_line.labour_hrs_tariff or 0,
                "wash_clean_tariff": tariff_line.wash_clean_tariff or 0,
                "material_tariff": tariff_line.material_tariff or 0,
                "labour_cost": labour_cost,
                "material_cost": material_cost,
                "total_cost": total_cost,
                "tariff_field_enabled": False,
            }
        else:
            line_data = {
                **common_data,
                "labour_hrs_tariff": 0,
                "wash_clean_tariff": 0,
                "material_tariff": 0,
                "labour_cost": 0,
                "material_cost": 0,
                "total_cost": 0,
                "tariff_field_enabled": True,
            }
    elif TariffMasterLine.objects.filter(
        parent=parent,
        main_component=line["main_component"],
        component_code=line["component_code"],
        location_code=line["location_code"],
        damage_code=line["damage_code"],
        material_code=line["material_code"],
        repair_code=line["repair_code"],
        unit=line["unit"],
    ).exists():
        tariff_line = TariffMasterLine.objects.filter(
            parent=parent,
            main_component=line["main_component"],
            component_code=line["component_code"],
            location_code=line["location_code"],
            damage_code=line["damage_code"],
            material_code=line["material_code"],
            repair_code=line["repair_code"],
            unit=line["unit"],
        ).first()
        common_data = {
            "specific_location_code": line["specific_location_code"],
            "specific_location_description": line["specific_location_description"],
            "remarks": line.get("remarks", None),
            "tariff_code": tariff_line.tariff_code or "",
            "main_component": tariff_line.main_component or "",
            "component_code": tariff_line.component_code or "",
            "component_description": tariff_line.component_description or "",
            "location_code": tariff_line.location_code or "",
            "location_description": tariff_line.location_description or "",
            "damage_code": tariff_line.damage_code or "",
            "damage_description": tariff_line.damage_description or "",
            "material_code": tariff_line.material_code or "",
            "material_description": tariff_line.material_description or "",
            "repair_code": tariff_line.repair_code or "",
            "repair_description": tariff_line.repair_description or "",
            "unit": tariff_line.unit or "",
            "measurement": tariff_line.measurement or "",
            "length_and_width": tariff_line.length_and_width or "",
            "quantity": int(line["quantity"]),
        }

        line_data = {
            **common_data,
            "labour_hrs_tariff": 0,
            "wash_clean_tariff": 0,
            "material_tariff": 0,
            "labour_cost": 0,
            "material_cost": 0,
            "total_cost": 0,
            "tariff_field_enabled": True,
        }
    else:
        line_data = {
            "tariff_code": None,
            "main_component": line["main_component"],
            "component_code": line["component_code"],
            "component_description": None,
            "location_code": line["location_code"],
            "location_description": None,
            "specific_location_code": line["specific_location_code"],
            "specific_location_description": None,
            "damage_code": line["damage_code"],
            "damage_description": None,
            "material_code": line["material_code"],
            "material_description": None,
            "repair_code": line["repair_code"],
            "repair_description": None,
            "unit": line["unit"],
            "measurement": line["measurement"],
            "length_and_width": line["length_and_width"],
            "quantity": line["quantity"],
            "labour_hrs_tariff": 0,
            "wash_clean_tariff": 0,
            "material_tariff": 0,
            "labour_cost": 0,
            "material_cost": 0,
            "total_cost": 0,
            "tariff_field_enabled": True,
            "remarks": None,
        }

    return line_data


def get_survey_line_tarrif(
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
):
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
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
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
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
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
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
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
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
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

    elif (
        main_component is not None
        and component_code is not None
        and component_description is not None
        and location_code is not None
        and location_description is not None
        and specific_location_code is not None
        and specific_location_description is not None
    ):
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
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

    elif (
        main_component is not None
        and component_code is not None
        and component_description is not None
        and location_code is not None
        and location_description is not None
    ):
        data = list(
            TariffSpecificLocation.objects.filter(
                location_code=location_code.split("_")[0],
            )
            .values("specific_location_code", "specific_location_description")
            .distinct()
        )
        data.append(
            {
                "specific_location_code": "NA",
                "specific_location_description": "NA",
            }
        )

    elif (
        main_component is not None
        and component_code is not None
        and component_description is not None
    ):
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
                main_component=main_component,
                component_code=component_code,
                component_description=component_description,
            )
            .exclude(location_code=None, location_description=None)
            .values("location_code", "location_description")
            .distinct()
        )

    elif main_component is not None:
        data = list(
            TariffMasterLine.objects.filter(
                parent=tarrif,
                main_component=main_component,
            )
            .exclude(component_code=None, component_description=None)
            .values("component_code", "component_description")
            .distinct()
        )

    return data


# def randomNumber():
#     existing_numbers = set(
#         Estimate.objects.values_list("number", flat=True)
#         | Surveyor.objects.values_list("number", flat=True)
#         | Survey.objects.values_list("number", flat=True)
#     )
#     random_no = f"E{random.randint(1000000, 9999999)}"
#     while random_no in existing_numbers:
#         random_no = f"E{random.randint(1000000, 9999999)}"

#     # random_no = f"E{random.randint(1000000, 9999999)}"
#     # while (
#     #     Estimate.objects.filter(number=random_no).exists()
#     #     and Surveyor.objects.filter(number=random_no).exists()
#     #     and Survey.objects.filter(number=random_no).exists()
#     # ):
#     #     random_no = f"E{random.randint(1000000, 9999999)}"
#     #     if (
#     #         Estimate.objects.filter(number=random_no).exists()
#     #         and Surveyor.objects.filter(number=random_no).exists()
#     #         and Survey.objects.filter(number=random_no).exists()
#     #     ):
#     #         break
#     return random_no


def getTariffData(client, location, site):
    try:
        parent = TariffMaster.objects.get(
            client=client,
            location__name=location,
            site__name=site,
        )
        labour_rate = str(parent.labour_rate)
        queryset = TariffMasterLine.objects.filter(parent=parent)
        main_component_list = list(
            set(
                [
                    each.main_component
                    for each in queryset
                    if each.main_component is not None
                ]
            )
        )
        # main_component_list.append("UnSpecified")
        data = {
            "parent_id": parent.pk,
            "main_component": main_component_list,
            "labour_rate": labour_rate,
        }
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def service_to_remove_corrupted_data():
#     with transaction.atomic():
#         Surveyor.objects.filter(container_no__isnull=True).delete()
#         duplicates = (
#             Surveyor.objects.values("container_no", "location", "site", "gate_in_date")
#             .annotate(count=Count("id"), latest_id=Max("id"))
#             .filter(count__gt=1)
#         )
#         count = 0
#         for each in duplicates:
#             Surveyor.objects.filter(
#                 container_no=each["container_no"],
#                 location=each["location"],
#                 site=each["site"],
#                 id=each["latest_id"],
#             ).delete()
#             count += 1
#         return count


def remove_corrupted_surveyor_data():
    try:
        with transaction.atomic():

            # delete null container_no data
            Surveyor.objects.filter(container_no__isnull=True).delete()

            # Identify duplicate entries (keeping the latest id)
            duplicates = (
                Surveyor.objects.values("container_no", "location", "site", "gate_in_date")
                .annotate(count=Count("id"), latest_id=Max("id"))
                .filter(count__gt=1)
            )

            # Collect IDs to delete (excluding the latest entry)
            ids_to_delete = []
            for each in duplicates:
                ids_to_delete.extend(
                    Surveyor.objects.filter(
                        container_no=each["container_no"],
                        location=each["location"],
                        site=each["site"],
                        gate_in_date=each["gate_in_date"]
                    )
                    .exclude(id=each["latest_id"])  # Keep the latest entry
                    .values_list("id", flat=True)
                )

            # Bulk delete all duplicate records
            deleted_count, _ = Surveyor.objects.filter(id__in=ids_to_delete).delete()

            return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
