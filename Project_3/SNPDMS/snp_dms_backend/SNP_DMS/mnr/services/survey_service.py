from mnr.models import (
    TariffMasterLine,
    Survey,
    SurveyLine,
    TariffSpecificLocation,
    Estimate,
    MnrStaff,
)
from common.exceptions import ValidationError
from datetime import datetime
from django.utils import timezone
import random
import pandas as pd
import os
from SNP_DMS.settings.base import BASE_DIR
import xlsxwriter
import openpyxl
from depot.functions_two import check_char_digit
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock


class SurveyService:

    def getSurveyLineData(self, parent, line):
        tariff_code = None
        main_component = None
        component_code = None
        component_description = None
        location_code = None
        location_description = None
        specific_location_code = None
        specific_location_description = None
        damage_code = None
        damage_description = None
        material_code = None
        material_description = None
        repair_code = None
        repair_description = None
        unit = None
        measurement = None
        length_and_width = None
        quantity = None
        labour_hrs_tariff = None
        wash_clean_tariff = None
        material_tariff = None
        labour_cost = None
        material_cost = None
        total_cost = None
        tariff_field_enabled = None
        remarks = None

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
            tariff_line = list(
                TariffMasterLine.objects.filter(
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
                )
            )[0]
            if not float(tariff_line.total_cost) == str(float(0)):
                specific_location_code = line["specific_location_code"]
                specific_location_description = line["specific_location_description"]
                remarks = line.get("remarks", None)

                if tariff_line.tariff_code is None:
                    tariff_code = ""
                else:
                    tariff_code = tariff_line.tariff_code

                if tariff_line.main_component is None:
                    main_component = ""
                else:
                    main_component = tariff_line.main_component

                if tariff_line.component_code is None:
                    component_code = ""
                else:
                    component_code = tariff_line.component_code

                if tariff_line.component_description is None:
                    component_description = ""
                else:
                    component_description = tariff_line.component_description

                if tariff_line.location_code is None:
                    location_code = ""
                else:
                    location_code = tariff_line.location_code

                if tariff_line.location_description is None:
                    location_description = ""
                else:
                    location_description = tariff_line.location_description

                if tariff_line.damage_code is None:
                    damage_code = ""
                else:
                    damage_code = tariff_line.damage_code

                if tariff_line.damage_description is None:
                    damage_description = ""
                else:
                    damage_description = tariff_line.damage_description

                if tariff_line.material_code is None:
                    material_code = ""
                else:
                    material_code = tariff_line.material_code

                if tariff_line.material_description is None:
                    material_description = ""
                else:
                    material_description = tariff_line.material_description

                if tariff_line.repair_code is None:
                    repair_code = ""
                else:
                    repair_code = tariff_line.repair_code

                if tariff_line.repair_description is None:
                    repair_description = ""
                else:
                    repair_description = tariff_line.repair_description

                if tariff_line.unit is None:
                    unit = ""
                else:
                    unit = tariff_line.unit

                if tariff_line.measurement is None:
                    measurement = ""
                else:
                    measurement = tariff_line.measurement

                if tariff_line.length_and_width is None:
                    length_and_width = ""
                else:
                    length_and_width = tariff_line.length_and_width

                quantity = int(line["quantity"])

                if tariff_line.labour_hrs_tariff is None:
                    labour_hrs_tariff = str(float(0))
                else:
                    labour_hrs_tariff = tariff_line.labour_hrs_tariff

                if tariff_line.wash_clean_tariff is None:
                    wash_clean_tariff = str(float(0))
                else:
                    wash_clean_tariff = tariff_line.wash_clean_tariff

                if tariff_line.material_tariff is None:
                    material_tariff = str(float(0))
                else:
                    material_tariff = tariff_line.material_tariff

                if tariff_line.labour_cost is None:
                    labour_cost = str(float(0))
                else:
                    labour_cost = round(float(tariff_line.labour_cost) * quantity, 2)

                if tariff_line.material_cost is None:
                    material_cost = str(float(0))
                else:
                    material_cost = round(
                        float(tariff_line.material_cost) * quantity, 2
                    )

                total_cost = labour_cost + material_cost

                tariff_field_enabled = False
            else:
                specific_location_code = line["specific_location_code"]
                specific_location_description = line["specific_location_description"]
                remarks = line.get("remarks", None)

                if tariff_line.tariff_code is None:
                    tariff_code = ""
                else:
                    tariff_code = tariff_line.tariff_code

                if tariff_line.main_component is None:
                    main_component = ""
                else:
                    main_component = tariff_line.main_component

                if tariff_line.component_code is None:
                    component_code = ""
                else:
                    component_code = tariff_line.component_code

                if tariff_line.component_description is None:
                    component_description = ""
                else:
                    component_description = tariff_line.component_description

                if tariff_line.location_code is None:
                    location_code = ""
                else:
                    location_code = tariff_line.location_code

                if tariff_line.location_description is None:
                    location_description = ""
                else:
                    location_description = tariff_line.location_description

                if tariff_line.damage_code is None:
                    damage_code = ""
                else:
                    damage_code = tariff_line.damage_code

                if tariff_line.damage_description is None:
                    damage_description = ""
                else:
                    damage_description = tariff_line.damage_description

                if tariff_line.material_code is None:
                    material_code = ""
                else:
                    material_code = tariff_line.material_code

                if tariff_line.material_description is None:
                    material_description = ""
                else:
                    material_description = tariff_line.material_description

                if tariff_line.repair_code is None:
                    repair_code = ""
                else:
                    repair_code = tariff_line.repair_code

                if tariff_line.repair_description is None:
                    repair_description = ""
                else:
                    repair_description = tariff_line.repair_description

                if tariff_line.unit is None:
                    unit = ""
                else:
                    unit = tariff_line.unit

                if tariff_line.measurement is None:
                    measurement = ""
                else:
                    measurement = tariff_line.measurement

                if tariff_line.length_and_width is None:
                    length_and_width = ""
                else:
                    length_and_width = tariff_line.length_and_width
                quantity = int(line["quantity"])
                labour_hrs_tariff = str(float(0))
                wash_clean_tariff = str(float(0))
                material_tariff = str(float(0))
                labour_cost = str(float(0))
                material_cost = str(float(0))
                total_cost = str(float(0))
                tariff_field_enabled = True
            data = {
                "tariff_code": tariff_code,
                "main_component": main_component,
                "component_code": component_code,
                "component_description": component_description,
                "location_code": location_code,
                "location_description": location_description,
                "specific_location_code": specific_location_code,
                "specific_location_description": specific_location_description,
                "damage_code": damage_code,
                "damage_description": damage_description,
                "material_code": material_code,
                "material_description": material_description,
                "repair_code": repair_code,
                "repair_description": repair_description,
                "unit": unit,
                "measurement": measurement,
                "length_and_width": length_and_width,
                "quantity": quantity,
                "labour_hrs_tariff": labour_hrs_tariff,
                "wash_clean_tariff": wash_clean_tariff,
                "material_tariff": material_tariff,
                "labour_cost": labour_cost,
                "material_cost": material_cost,
                "total_cost": total_cost,
                "tariff_field_enabled": tariff_field_enabled,
                "remarks": remarks,
            }
            return data

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
            tariff_line = list(
                TariffMasterLine.objects.filter(
                    parent=parent,
                    main_component=line["main_component"],
                    component_code=line["component_code"],
                    location_code=line["location_code"],
                    damage_code=line["damage_code"],
                    material_code=line["material_code"],
                    repair_code=line["repair_code"],
                    unit=line["unit"],
                )
            )[0]

            specific_location_code = line["specific_location_code"]
            specific_location_description = line["specific_location_description"]
            remarks = line.get("remarks", None)

            if tariff_line.tariff_code is None:
                tariff_code = ""
            else:
                tariff_code = tariff_line.tariff_code

            if tariff_line.main_component is None:
                main_component = ""
            else:
                main_component = tariff_line.main_component

            if tariff_line.component_code is None:
                component_code = ""
            else:
                component_code = tariff_line.component_code

            if tariff_line.component_description is None:
                component_description = ""
            else:
                component_description = tariff_line.component_description

            if tariff_line.location_code is None:
                location_code = ""
            else:
                location_code = tariff_line.location_code

            if tariff_line.location_description is None:
                location_description = ""
            else:
                location_description = tariff_line.location_description

            if tariff_line.damage_code is None:
                damage_code = ""
            else:
                damage_code = tariff_line.damage_code

            if tariff_line.damage_description is None:
                damage_description = ""
            else:
                damage_description = tariff_line.damage_description

            if tariff_line.material_code is None:
                material_code = ""
            else:
                material_code = tariff_line.material_code

            if tariff_line.material_description is None:
                material_description = ""
            else:
                material_description = tariff_line.material_description

            if tariff_line.repair_code is None:
                repair_code = ""
            else:
                repair_code = tariff_line.repair_code

            if tariff_line.repair_description is None:
                repair_description = ""
            else:
                repair_description = tariff_line.repair_description

            if tariff_line.unit is None:
                unit = ""
            else:
                unit = tariff_line.unit
            measurement = line["measurement"]
            length_and_width = line["length_and_width"]
            quantity = int(line["quantity"])
            labour_hrs_tariff = str(float(0))
            wash_clean_tariff = str(float(0))
            material_tariff = str(float(0))
            labour_cost = str(float(0))
            material_cost = str(float(0))
            total_cost = str(float(0))
            tariff_field_enabled = True
            data = {
                "tariff_code": tariff_code,
                "main_component": main_component,
                "component_code": component_code,
                "component_description": component_description,
                "location_code": location_code,
                "location_description": location_description,
                "specific_location_code": specific_location_code,
                "specific_location_description": specific_location_description,
                "damage_code": damage_code,
                "damage_description": damage_description,
                "material_code": material_code,
                "material_description": material_description,
                "repair_code": repair_code,
                "repair_description": repair_description,
                "unit": unit,
                "measurement": measurement,
                "length_and_width": length_and_width,
                "quantity": quantity,
                "labour_hrs_tariff": labour_hrs_tariff,
                "wash_clean_tariff": wash_clean_tariff,
                "material_tariff": material_tariff,
                "labour_cost": labour_cost,
                "material_cost": material_cost,
                "total_cost": total_cost,
                "tariff_field_enabled": tariff_field_enabled,
                "remarks": remarks,
            }
            return data
        else:
            data = {
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
                "labour_hrs_tariff": str(float(0)),
                "wash_clean_tariff": str(float(0)),
                "material_tariff": str(float(0)),
                "labour_cost": str(float(0)),
                "material_cost": str(float(0)),
                "total_cost": str(float(0)),
                "tariff_field_enabled": True,
                "remarks": None,
            }
            return data

    def convertNone(self, dict_data):
        for key in dict_data:
            if len(str(dict_data[key])) == 0:
                dict_data[key] = None
        return dict_data

    def createSurvey(
        self,
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
    ):
        if data["is_draft"] == "True":
            if survey_data is not None:
                survey_data.updateDraft(
                    created_by=created_by,
                    survey_by=survey_by,
                    date=date,
                    time=time,
                )
                if survey_lines_deleted is not None:
                    SurveyLine.objects.filter(pk__in=survey_lines_deleted).delete()
                if survey_lines is not None:
                    for line in survey_lines:
                        line = self.convertNone(line)
                        if not "pk" in line.keys():
                            line_data = self.getSurveyLineData(parent, line)
                            tariff_code = line_data["tariff_code"]
                            main_component = line_data["main_component"]
                            component_code = line_data["component_code"]
                            component_description = line_data["component_description"]
                            location_code = line_data["location_code"]
                            location_description = line_data["location_description"]
                            specific_location_code = line_data["specific_location_code"]
                            specific_location_description = line_data[
                                "specific_location_description"
                            ]
                            damage_code = line_data["damage_code"]
                            damage_description = line_data["damage_description"]
                            material_code = line_data["material_code"]
                            material_description = line_data["material_description"]
                            repair_code = line_data["repair_code"]
                            repair_description = line_data["repair_description"]
                            unit = line_data["unit"]
                            measurement = line_data["measurement"]
                            length_and_width = line_data["length_and_width"]
                            quantity = line_data["quantity"]
                            labour_hrs_tariff = line_data["labour_hrs_tariff"]
                            wash_clean_tariff = line_data["wash_clean_tariff"]
                            material_tariff = line_data["material_tariff"]
                            labour_cost = line_data["labour_cost"]
                            material_cost = line_data["material_cost"]
                            total_cost = line_data["total_cost"]
                            tariff_field_enabled = line_data["tariff_field_enabled"]
                            remarks = line_data["remarks"]

                            if not SurveyLine.objects.filter(
                                parent=survey_data,
                                tariff_code=tariff_code,
                                main_component=main_component,
                                component_code=component_code,
                                component_description=component_description,
                                location_code=location_code,
                                location_description=location_description,
                                specific_location_code=specific_location_code,
                                specific_location_description=specific_location_description,
                                damage_code=damage_code,
                                damage_description=damage_description,
                                material_code=material_code,
                                material_description=material_description,
                                repair_code=repair_code,
                                repair_description=repair_description,
                                unit=unit,
                                measurement=measurement,
                                length_and_width=length_and_width,
                                quantity=quantity,
                                labour_hrs_tariff=labour_hrs_tariff,
                                wash_clean_tariff=wash_clean_tariff,
                                material_tariff=material_tariff,
                                labour_cost=labour_cost,
                                material_cost=material_cost,
                                total_cost=total_cost,
                                tariff_field_enabled=tariff_field_enabled,
                                remarks=remarks,
                            ).exists():

                                SurveyLine(
                                    parent=survey_data,
                                    tariff_code=tariff_code,
                                    main_component=main_component,
                                    component_code=component_code,
                                    component_description=component_description,
                                    location_code=location_code,
                                    location_description=location_description,
                                    specific_location_code=specific_location_code,
                                    specific_location_description=specific_location_description,
                                    damage_code=damage_code,
                                    damage_description=damage_description,
                                    material_code=material_code,
                                    material_description=material_description,
                                    repair_code=repair_code,
                                    repair_description=repair_description,
                                    unit=unit,
                                    measurement=measurement,
                                    length_and_width=length_and_width,
                                    quantity=quantity,
                                    labour_hrs_tariff=labour_hrs_tariff,
                                    wash_clean_tariff=wash_clean_tariff,
                                    material_tariff=material_tariff,
                                    labour_cost=labour_cost,
                                    material_cost=material_cost,
                                    total_cost=total_cost,
                                    tariff_field_enabled=tariff_field_enabled,
                                    remarks=remarks,
                                ).save()
                        else:
                            if SurveyLine.objects.filter(pk=line["pk"]).exists():
                                survey_line_object = SurveyLine.objects.get(
                                    pk=line["pk"]
                                )
                                survey_line_object.remarks = line.get("remarks", None)
                                survey_line_object.save()
                else:
                    pass

            else:
                survey_data = Survey.createDraft(
                    depot=depot,
                    non_depot=non_depot,
                    created_by=created_by,
                    survey_by=survey_by,
                    date=date,
                    time=time,
                    labour_rate=float(data["labour_rate"]),
                )
                survey_data.estimate_number = self.randomNumber()
                survey_data.save(update_fields=["estimate_number"])
                if survey_lines_deleted is not None:
                    SurveyLine.objects.filter(pk__in=survey_lines_deleted).delete()
                if survey_lines is not None:
                    for line in survey_lines:
                        line = self.convertNone(line)
                        if not "pk" in line.keys():
                            line_data = self.getSurveyLineData(parent, line)
                            tariff_code = line_data["tariff_code"]
                            main_component = line_data["main_component"]
                            component_code = line_data["component_code"]
                            component_description = line_data["component_description"]
                            location_code = line_data["location_code"]
                            location_description = line_data["location_description"]
                            specific_location_code = line_data["specific_location_code"]
                            specific_location_description = line_data[
                                "specific_location_description"
                            ]
                            damage_code = line_data["damage_code"]
                            damage_description = line_data["damage_description"]
                            material_code = line_data["material_code"]
                            material_description = line_data["material_description"]
                            repair_code = line_data["repair_code"]
                            repair_description = line_data["repair_description"]
                            unit = line_data["unit"]
                            measurement = line_data["measurement"]
                            length_and_width = line_data["length_and_width"]
                            quantity = line_data["quantity"]
                            labour_hrs_tariff = line_data["labour_hrs_tariff"]
                            wash_clean_tariff = line_data["wash_clean_tariff"]
                            material_tariff = line_data["material_tariff"]
                            labour_cost = line_data["labour_cost"]
                            material_cost = line_data["material_cost"]
                            total_cost = line_data["total_cost"]
                            tariff_field_enabled = line_data["tariff_field_enabled"]
                            remarks = line_data["remarks"]

                            if not SurveyLine.objects.filter(
                                parent=survey_data,
                                tariff_code=tariff_code,
                                main_component=main_component,
                                component_code=component_code,
                                component_description=component_description,
                                location_code=location_code,
                                location_description=location_description,
                                specific_location_code=specific_location_code,
                                specific_location_description=specific_location_description,
                                damage_code=damage_code,
                                damage_description=damage_description,
                                material_code=material_code,
                                material_description=material_description,
                                repair_code=repair_code,
                                repair_description=repair_description,
                                unit=unit,
                                measurement=measurement,
                                length_and_width=length_and_width,
                                quantity=quantity,
                                labour_hrs_tariff=labour_hrs_tariff,
                                wash_clean_tariff=wash_clean_tariff,
                                material_tariff=material_tariff,
                                labour_cost=labour_cost,
                                material_cost=material_cost,
                                total_cost=total_cost,
                                tariff_field_enabled=tariff_field_enabled,
                                remarks=remarks,
                            ).exists():

                                SurveyLine(
                                    parent=survey_data,
                                    tariff_code=tariff_code,
                                    main_component=main_component,
                                    component_code=component_code,
                                    component_description=component_description,
                                    location_code=location_code,
                                    location_description=location_description,
                                    specific_location_code=specific_location_code,
                                    specific_location_description=specific_location_description,
                                    damage_code=damage_code,
                                    damage_description=damage_description,
                                    material_code=material_code,
                                    material_description=material_description,
                                    repair_code=repair_code,
                                    repair_description=repair_description,
                                    unit=unit,
                                    measurement=measurement,
                                    length_and_width=length_and_width,
                                    quantity=quantity,
                                    labour_hrs_tariff=labour_hrs_tariff,
                                    wash_clean_tariff=wash_clean_tariff,
                                    material_tariff=material_tariff,
                                    labour_cost=labour_cost,
                                    material_cost=material_cost,
                                    total_cost=total_cost,
                                    tariff_field_enabled=tariff_field_enabled,
                                    remarks=remarks,
                                ).save()
                        else:
                            if SurveyLine.objects.filter(pk=line["pk"]).exists():
                                survey_line_object = SurveyLine.objects.get(
                                    pk=line["pk"]
                                )
                                survey_line_object.remarks = line.get("remarks", None)
                                survey_line_object.save()
                else:
                    pass

        elif data["is_proceed"] == "True":
            if survey_data is not None:
                survey_data.makeDraftToProceed(
                    created_by=created_by,
                    survey_by=survey_by,
                    date=date,
                    time=time,
                )
                if survey_lines_deleted is not None:
                    SurveyLine.objects.filter(pk__in=survey_lines_deleted).delete()
                if survey_lines is not None:
                    for line in survey_lines:
                        line = self.convertNone(line)
                        if not "pk" in line.keys():
                            line_data = self.getSurveyLineData(parent, line)
                            tariff_code = line_data["tariff_code"]
                            main_component = line_data["main_component"]
                            component_code = line_data["component_code"]
                            component_description = line_data["component_description"]
                            location_code = line_data["location_code"]
                            location_description = line_data["location_description"]
                            specific_location_code = line_data["specific_location_code"]
                            specific_location_description = line_data[
                                "specific_location_description"
                            ]
                            damage_code = line_data["damage_code"]
                            damage_description = line_data["damage_description"]
                            material_code = line_data["material_code"]
                            material_description = line_data["material_description"]
                            repair_code = line_data["repair_code"]
                            repair_description = line_data["repair_description"]
                            unit = line_data["unit"]
                            measurement = line_data["measurement"]
                            length_and_width = line_data["length_and_width"]
                            quantity = line_data["quantity"]
                            labour_hrs_tariff = line_data["labour_hrs_tariff"]
                            wash_clean_tariff = line_data["wash_clean_tariff"]
                            material_tariff = line_data["material_tariff"]
                            labour_cost = line_data["labour_cost"]
                            material_cost = line_data["material_cost"]
                            total_cost = line_data["total_cost"]
                            tariff_field_enabled = line_data["tariff_field_enabled"]
                            remarks = line_data["remarks"]

                            if not SurveyLine.objects.filter(
                                parent=survey_data,
                                tariff_code=tariff_code,
                                main_component=main_component,
                                component_code=component_code,
                                component_description=component_description,
                                location_code=location_code,
                                location_description=location_description,
                                specific_location_code=specific_location_code,
                                specific_location_description=specific_location_description,
                                damage_code=damage_code,
                                damage_description=damage_description,
                                material_code=material_code,
                                material_description=material_description,
                                repair_code=repair_code,
                                repair_description=repair_description,
                                unit=unit,
                                measurement=measurement,
                                length_and_width=length_and_width,
                                quantity=quantity,
                                labour_hrs_tariff=labour_hrs_tariff,
                                wash_clean_tariff=wash_clean_tariff,
                                material_tariff=material_tariff,
                                labour_cost=labour_cost,
                                material_cost=material_cost,
                                total_cost=total_cost,
                                tariff_field_enabled=tariff_field_enabled,
                                remarks=remarks,
                            ).exists():

                                SurveyLine(
                                    parent=survey_data,
                                    tariff_code=tariff_code,
                                    main_component=main_component,
                                    component_code=component_code,
                                    component_description=component_description,
                                    location_code=location_code,
                                    location_description=location_description,
                                    specific_location_code=specific_location_code,
                                    specific_location_description=specific_location_description,
                                    damage_code=damage_code,
                                    damage_description=damage_description,
                                    material_code=material_code,
                                    material_description=material_description,
                                    repair_code=repair_code,
                                    repair_description=repair_description,
                                    unit=unit,
                                    measurement=measurement,
                                    length_and_width=length_and_width,
                                    quantity=quantity,
                                    labour_hrs_tariff=labour_hrs_tariff,
                                    wash_clean_tariff=wash_clean_tariff,
                                    material_tariff=material_tariff,
                                    labour_cost=labour_cost,
                                    material_cost=material_cost,
                                    total_cost=total_cost,
                                    tariff_field_enabled=tariff_field_enabled,
                                    remarks=remarks,
                                ).save()
                        else:
                            if SurveyLine.objects.filter(pk=line["pk"]).exists():
                                survey_line_object = SurveyLine.objects.get(
                                    pk=line["pk"]
                                )
                                survey_line_object.remarks = line.get("remarks", None)
                                survey_line_object.save()
                else:
                    pass
                survey_data.createNumber()
            else:
                if data["make_available"] == "True":
                    Survey.createNoDamage(
                        depot=depot,
                        non_depot=non_depot,
                        created_by=created_by,
                        survey_by=survey_by,
                        date=date,
                        time=time,
                        labour_rate=float(data["labour_rate"]),
                    )
                else:
                    survey_data = Survey.create(
                        depot=depot,
                        non_depot=non_depot,
                        created_by=created_by,
                        survey_by=survey_by,
                        date=date,
                        time=time,
                        labour_rate=float(data["labour_rate"]),
                    )
                    survey_data.estimate_number = self.randomNumber()
                    survey_data.save(update_fields=["estimate_number"])

                    if survey_lines_deleted is not None:
                        SurveyLine.objects.filter(pk__in=survey_lines_deleted).delete()
                    if survey_lines is not None:
                        for line in survey_lines:
                            line = self.convertNone(line)
                            line_data = self.getSurveyLineData(parent, line)
                            tariff_code = line_data["tariff_code"]
                            main_component = line_data["main_component"]
                            component_code = line_data["component_code"]
                            component_description = line_data["component_description"]
                            location_code = line_data["location_code"]
                            location_description = line_data["location_description"]
                            specific_location_code = line_data["specific_location_code"]
                            specific_location_description = line_data[
                                "specific_location_description"
                            ]
                            damage_code = line_data["damage_code"]
                            damage_description = line_data["damage_description"]
                            material_code = line_data["material_code"]
                            material_description = line_data["material_description"]
                            repair_code = line_data["repair_code"]
                            repair_description = line_data["repair_description"]
                            unit = line_data["unit"]
                            measurement = line_data["measurement"]
                            length_and_width = line_data["length_and_width"]
                            quantity = line_data["quantity"]
                            labour_hrs_tariff = line_data["labour_hrs_tariff"]
                            wash_clean_tariff = line_data["wash_clean_tariff"]
                            material_tariff = line_data["material_tariff"]
                            labour_cost = line_data["labour_cost"]
                            material_cost = line_data["material_cost"]
                            total_cost = line_data["total_cost"]
                            tariff_field_enabled = line_data["tariff_field_enabled"]
                            remarks = line_data["remarks"]

                            if not SurveyLine.objects.filter(
                                parent=survey_data,
                                tariff_code=tariff_code,
                                main_component=main_component,
                                component_code=component_code,
                                component_description=component_description,
                                location_code=location_code,
                                location_description=location_description,
                                specific_location_code=specific_location_code,
                                specific_location_description=specific_location_description,
                                damage_code=damage_code,
                                damage_description=damage_description,
                                material_code=material_code,
                                material_description=material_description,
                                repair_code=repair_code,
                                repair_description=repair_description,
                                unit=unit,
                                measurement=measurement,
                                length_and_width=length_and_width,
                                quantity=quantity,
                                labour_hrs_tariff=labour_hrs_tariff,
                                wash_clean_tariff=wash_clean_tariff,
                                material_tariff=material_tariff,
                                labour_cost=labour_cost,
                                material_cost=material_cost,
                                total_cost=total_cost,
                                tariff_field_enabled=tariff_field_enabled,
                                remarks=remarks,
                            ).exists():

                                SurveyLine(
                                    parent=survey_data,
                                    tariff_code=tariff_code,
                                    main_component=main_component,
                                    component_code=component_code,
                                    component_description=component_description,
                                    location_code=location_code,
                                    location_description=location_description,
                                    specific_location_code=specific_location_code,
                                    specific_location_description=specific_location_description,
                                    damage_code=damage_code,
                                    damage_description=damage_description,
                                    material_code=material_code,
                                    material_description=material_description,
                                    repair_code=repair_code,
                                    repair_description=repair_description,
                                    unit=unit,
                                    measurement=measurement,
                                    length_and_width=length_and_width,
                                    quantity=quantity,
                                    labour_hrs_tariff=labour_hrs_tariff,
                                    wash_clean_tariff=wash_clean_tariff,
                                    material_tariff=material_tariff,
                                    labour_cost=labour_cost,
                                    material_cost=material_cost,
                                    total_cost=total_cost,
                                    tariff_field_enabled=tariff_field_enabled,
                                    remarks=remarks,
                                ).save()
                    survey_data.createNumber()
        else:
            raise ValidationError("Please select draft or proceed")

    def updateSurvey(
        self,
        survey_data,
        updated_by,
        date,
        time,
        survey_lines_deleted,
        survey_lines,
        parent,
        survey_lines_rejected,
    ):
        survey_data.updated_by = updated_by
        survey_data.current_date = date
        survey_data.current_time = time
        survey_data.save()

        if survey_lines_deleted is not None:
            SurveyLine.objects.filter(pk__in=survey_lines_deleted).delete()

        if survey_lines is not None:
            for line in survey_lines:
                line = self.convertNone(line)

                if not "pk" in line.keys():
                    line_data = self.getSurveyLineData(parent, line)
                    tariff_code = line_data["tariff_code"]
                    main_component = line_data["main_component"]
                    component_code = line_data["component_code"]
                    component_description = line_data["component_description"]
                    location_code = line_data["location_code"]
                    location_description = line_data["location_description"]
                    specific_location_code = line_data["specific_location_code"]
                    specific_location_description = line_data[
                        "specific_location_description"
                    ]
                    damage_code = line_data["damage_code"]
                    damage_description = line_data["damage_description"]
                    material_code = line_data["material_code"]
                    material_description = line_data["material_description"]
                    repair_code = line_data["repair_code"]
                    repair_description = line_data["repair_description"]
                    unit = line_data["unit"]
                    measurement = line_data["measurement"]
                    length_and_width = line_data["length_and_width"]
                    quantity = line_data["quantity"]
                    labour_hrs_tariff = line_data["labour_hrs_tariff"]
                    wash_clean_tariff = line_data["wash_clean_tariff"]
                    material_tariff = line_data["material_tariff"]
                    labour_cost = line_data["labour_cost"]
                    material_cost = line_data["material_cost"]
                    total_cost = line_data["total_cost"]
                    tariff_field_enabled = line_data["tariff_field_enabled"]
                    remarks = line_data["remarks"]

                    if not SurveyLine.objects.filter(
                        parent=survey_data,
                        tariff_code=tariff_code,
                        main_component=main_component,
                        component_code=component_code,
                        component_description=component_description,
                        location_code=location_code,
                        location_description=location_description,
                        specific_location_code=specific_location_code,
                        specific_location_description=specific_location_description,
                        damage_code=damage_code,
                        damage_description=damage_description,
                        material_code=material_code,
                        material_description=material_description,
                        repair_code=repair_code,
                        repair_description=repair_description,
                        unit=unit,
                        measurement=measurement,
                        length_and_width=length_and_width,
                        quantity=quantity,
                        labour_hrs_tariff=labour_hrs_tariff,
                        wash_clean_tariff=wash_clean_tariff,
                        material_tariff=material_tariff,
                        labour_cost=labour_cost,
                        material_cost=material_cost,
                        total_cost=total_cost,
                        tariff_field_enabled=tariff_field_enabled,
                        remarks=remarks,
                    ).exists():
                        SurveyLine(
                            parent=survey_data,
                            tariff_code=tariff_code,
                            main_component=main_component,
                            component_code=component_code,
                            component_description=component_description,
                            location_code=location_code,
                            location_description=location_description,
                            specific_location_code=specific_location_code,
                            specific_location_description=specific_location_description,
                            damage_code=damage_code,
                            damage_description=damage_description,
                            material_code=material_code,
                            material_description=material_description,
                            repair_code=repair_code,
                            repair_description=repair_description,
                            unit=unit,
                            measurement=measurement,
                            length_and_width=length_and_width,
                            quantity=quantity,
                            labour_hrs_tariff=labour_hrs_tariff,
                            wash_clean_tariff=wash_clean_tariff,
                            material_tariff=material_tariff,
                            labour_cost=labour_cost,
                            material_cost=material_cost,
                            total_cost=total_cost,
                            tariff_field_enabled=tariff_field_enabled,
                            remarks=remarks,
                        ).save()
                else:
                    if SurveyLine.objects.filter(pk=line["pk"]).exists():
                        survey_line_object = SurveyLine.objects.get(pk=line["pk"])
                        survey_line_object.remarks = line.get("remarks", None)
                        survey_line_object.save()
        else:
            pass
        survey_data.incrementUpdateCount()
        survey_data.createNumber()

        if survey_lines_rejected is not None:
            SurveyLine.objects.filter(pk__in=survey_lines_rejected).update(
                is_rejected=True, total_cost=float(0)
            )

        if survey_data.depot is not None:
            survey_data.depot.survey_pending_out_date_time = datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey_data.depot.estimate_pending_in_date_time = datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
        else:
            survey_data.non_depot.survey_pending_out_date_time = datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey_data.non_depot.estimate_pending_in_date_time = datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())

    def getBulkTariffExcelData(self, parent):
        queryset = (
            TariffMasterLine.objects.filter(parent=parent)
            .exclude(wash_clean_tariff=0)
            .values(
                "tariff_code",
                "main_component",
                "component_code",
                "component_description",
                "location_code",
                "location_description",
                "damage_code",
                "damage_description",
                "material_code",
                "material_description",
                "repair_code",
                "repair_description",
                "unit",
                "measurement",
                "length_and_width",
                "quantity",
                "labour_hrs_tariff",
                "wash_clean_tariff",
                "material_tariff",
            )
        )
        df_data = [
            [
                each.get("tariff_code"),
                each.get("main_component"),
                each.get("component_code"),
                each.get("component_description"),
                each.get("location_code"),
                each.get("location_description"),
                each.get("damage_code"),
                each.get("damage_description"),
                each.get("material_code"),
                each.get("material_description"),
                each.get("repair_code"),
                each.get("repair_description"),
                each.get("unit"),
                each.get("measurement"),
                each.get("length_and_width"),
                each.get("quantity"),
                each.get("labour_hrs_tariff"),
                each.get("wash_clean_tariff"),
                each.get("material_tariff"),
            ]
            for each in queryset
        ]
        df_data = df_data or [["" for _ in range(19)]]

        main_response = {
            "client": parent.client,
            "labour_rate": parent.labour_rate,
            "tariff_lines": df_data,
        }
        return main_response

    def getSpecificLocationData(self):
        specific_locations = TariffSpecificLocation.objects.values(
            "location_code",
            "specific_location_code",
            "specific_location_description",
        )
        df_data = [
            [
                each.get("location_code"),
                each.get("specific_location_code"),
                each.get("specific_location_description"),
            ]
            for each in specific_locations
        ]
        df_data = df_data or [["" for _ in range(6)]]
        return df_data

    def makeBulkTariffExcel(self, data, specific_location_data):
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/tariff_{data['client']}_{date}{time}.xlsx"
        )
        workbook = xlsxwriter.Workbook(temp_file_path)
        sheet = workbook.add_worksheet("tariff")
        specific_location_sheet = workbook.add_worksheet("specific_location_code")
        sheet.write("D1", "Labour Rate")
        sheet.write("E1", f"{data['labour_rate']}")
        sheet.add_table(
            f"A2:S{2 + len(data['tariff_lines'])}",
            {
                "data": data["tariff_lines"],
                "columns": [
                    {"header": "TARIFF CODE"},
                    {"header": "MAIN COMPONENT"},
                    {"header": "COMPONENT CODE"},
                    {"header": "COMPONENT DESCRIPTION"},
                    {"header": "LOCATION CODE"},
                    {"header": "LOCATION DESCRIPTION"},
                    {"header": "DAMAGE CODE"},
                    {"header": "DAMAGE DESCRIPTION"},
                    {"header": "MATERIAL CODE"},
                    {"header": "MATERIAL DESCRIPTION"},
                    {"header": "REPAIR CODE"},
                    {"header": "REPAIR DESCRIPTION"},
                    {"header": "UNIT CODE"},
                    {"header": "UNIT DESCRIPTION"},
                    {"header": "L/W"},
                    {"header": "QTY"},
                    {"header": "Labour Hours Tarrif"},
                    {"header": "Wash/Clean Tarrif"},
                    {"header": "Material Rate Tarrif"},
                ],
            },
        )
        specific_location_sheet.add_table(
            f"A1:C{1 + len(specific_location_data)}",
            {
                "data": specific_location_data,
                "columns": [
                    {"header": "MAIN LOCATION CODE"},
                    {"header": "SPECIFIC LOCATION CODE"},
                    {"header": "SPECIFIC LOCATION DESCRIPTION"},
                ],
            },
        )
        workbook.close()
        return temp_file_path

    def extractSurveyUploadExcelData(self, input_excel, location, site):
        ps = openpyxl.load_workbook(input_excel, read_only=True)
        sheet = ps["washing_survey"]

        (
            container_no_raw,
            survey_by_raw,
            main_component_raw,
            component_code_raw,
            component_description_raw,
            location_code_raw,
            location_description_raw,
            damage_code_raw,
            damage_description_raw,
            material_code_raw,
            material_description_raw,
            repair_code_raw,
            repair_description_raw,
            unit_code_raw,
            unit_description_raw,
            length_width_raw,
            qty_raw,
            remarks_raw,
        ) = (
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
        )

        for row in sheet.iter_rows():
            container_no_raw.append(row[0].value or "")
            survey_by_raw.append(row[1].value or "")
            main_component_raw.append(row[2].value or "")
            component_code_raw.append(row[3].value or "")
            component_description_raw.append(row[4].value or "")
            location_code_raw.append(row[5].value or "")
            location_description_raw.append(row[6].value or "")
            damage_code_raw.append(row[7].value or "")
            damage_description_raw.append(row[8].value or "")
            material_code_raw.append(row[9].value or "")
            material_description_raw.append(row[10].value or "")
            repair_code_raw.append(row[11].value or "")
            repair_description_raw.append(row[12].value or "")
            unit_code_raw.append(row[13].value or "")
            unit_description_raw.append(row[14].value or "")
            length_width_raw.append(row[15].value or "")
            quantity_value = row[16].value
            if quantity_value == "Quantity":
                qty_raw.append("Quantity")
            elif quantity_value is not None:
                if isinstance(quantity_value, (int, float)):
                    qty_raw.append(quantity_value)
                else:
                    qty_raw.append("")
            else:
                qty_raw.append("")

            remarks_raw.append(
                "" if row[17].value == "_" or row[17].value is None else row[17].value
            )

        headers = [
            container_no_raw.pop(0),
            survey_by_raw.pop(0),
            main_component_raw.pop(0),
            component_code_raw.pop(0),
            component_description_raw.pop(0),
            location_code_raw.pop(0),
            location_description_raw.pop(0),
            damage_code_raw.pop(0),
            damage_description_raw.pop(0),
            material_code_raw.pop(0),
            material_description_raw.pop(0),
            repair_code_raw.pop(0),
            repair_description_raw.pop(0),
            unit_code_raw.pop(0),
            unit_description_raw.pop(0),
            length_width_raw.pop(0),
            qty_raw.pop(0),
            remarks_raw.pop(0),
        ]

        if headers != [
            "Container No",
            "Survey By",
            "Main Component",
            "Component Code",
            "Component Description",
            "Location Code",
            "Location Description",
            "Damage Code",
            "Damage Description",
            "Material Code",
            "Material Description",
            "Repair Code",
            "Repair Description",
            "Unit Code",
            "Unit Description",
            "Length Width",
            "Quantity",
            "Remarks",
        ]:
            return "Header Not Found"

        data = [
            (
                container_no,
                survey_by,
                main_component,
                component_code,
                component_description,
                location_code,
                location_description,
                damage_code,
                damage_description,
                material_code,
                material_description,
                repair_code,
                repair_description,
                unit_code,
                unit_description,
                length_width,
                qty,
                remarks,
            )
            for container_no, survey_by, main_component, component_code, component_description, location_code, location_description, damage_code, damage_description, material_code, material_description, repair_code, repair_description, unit_code, unit_description, length_width, qty, remarks in zip(
                container_no_raw,
                survey_by_raw,
                main_component_raw,
                component_code_raw,
                component_description_raw,
                location_code_raw,
                location_description_raw,
                damage_code_raw,
                damage_description_raw,
                material_code_raw,
                material_description_raw,
                repair_code_raw,
                repair_description_raw,
                unit_code_raw,
                unit_description_raw,
                length_width_raw,
                qty_raw,
                remarks_raw,
            )
            if container_no != ""
        ]

        extracted_data_list = [
            {
                "sr_no": str(i),
                "container_no": str(container_no),
                "survey_by": str(survey_by),
                "main_component": str(main_component),
                "component_code": str(component_code),
                "component_description": str(component_description),
                "location_code": str(location_code),
                "location_description": str(location_description),
                "damage_code": str(damage_code),
                "damage_description": str(damage_description),
                "material_code": str(material_code),
                "material_description": str(material_description),
                "repair_code": str(repair_code),
                "repair_description": str(repair_description),
                "unit_code": str(unit_code),
                "unit_description": str(unit_description),
                "length_width": str(length_width),
                "qty": str(qty),
                "remarks": str(remarks),
            }
            for i, (
                container_no,
                survey_by,
                main_component,
                component_code,
                component_description,
                location_code,
                location_description,
                damage_code,
                damage_description,
                material_code,
                material_description,
                repair_code,
                repair_description,
                unit_code,
                unit_description,
                length_width,
                qty,
                remarks,
            ) in enumerate(data, start=1)
        ]
        ps.close()

        correct_data, error_data, error_data_msg = self.checkErrors(
            location, site, extracted_data_list
        )

        correct_data_count = str(len(correct_data))
        error_data_count = str(len(error_data))
        main_data = {
            "importable_data": correct_data,
            "importable_data_count": correct_data_count,
            "rejected_data": error_data,
            "rejected_data_count": error_data_count,
            "faults": error_data_msg,
        }
        return main_data

    def checkContainerExistence(self, site, importable_data):
        if site.type == "DEPOT":
            return [
                Survey.objects.filter(
                    depot__container__container_no=each.get("container_no"),
                    depot__container__site=site,
                    is_draft=True,
                ).exists()
                for each in importable_data
            ]

        else:
            return [
                Survey.objects.filter(
                    non_depot__container__container_no=each.get("container_no"),
                    non_depot__container__site=site,
                    is_draft=True,
                ).exists()
                for each in importable_data
            ]

    def getTariffLineData(self, location, site, each):
        tarrif_line = TariffMasterLine.objects.get(
            parent__location=location,
            parent__site=site,
            main_component=each["main_component"],
            component_code=each["component_code"],
            location_code=each["location_code"],
            damage_code=each["damage_code"],
            material_code=each["material_code"],
            repair_code=each["repair_code"],
            unit=each["unit_code"],
            length_and_width=each["length_width"],
        )
        return tarrif_line

    def createSurveyLineObject(self, parent, tarrif_line, each):
        return SurveyLine.objects.create(
            parent=parent,
            tariff_code=tarrif_line.tariff_code,
            main_component=tarrif_line.main_component,
            component_code=tarrif_line.component_code,
            component_description=tarrif_line.component_description,
            location_code=tarrif_line.location_code,
            location_description=tarrif_line.location_description,
            specific_location_code="NA",
            specific_location_description="NA",
            damage_code=tarrif_line.damage_code,
            damage_description=tarrif_line.damage_description,
            material_code=tarrif_line.material_code,
            material_description=tarrif_line.material_description,
            repair_code=tarrif_line.repair_code,
            repair_description=tarrif_line.repair_description,
            unit=tarrif_line.unit,
            measurement=tarrif_line.measurement,
            length_and_width=tarrif_line.length_and_width,
            quantity=tarrif_line.quantity,
            labour_hrs_tariff=tarrif_line.labour_hrs_tariff,
            wash_clean_tariff=tarrif_line.wash_clean_tariff,
            material_tariff=tarrif_line.material_tariff,
            labour_cost=tarrif_line.labour_cost,
            material_cost=tarrif_line.material_cost,
            total_cost=tarrif_line.total_cost,
            tariff_field_enabled=False,
            remarks=each["remarks"],
        )

    def extractSurveyDataForRejectedFile(self, data):

        survey_df = pd.DataFrame(data)[
            [
                "container_no",
                "survey_by",
                "main_component",
                "component_code",
                "component_description",
                "location_code",
                "location_description",
                "damage_code",
                "damage_description",
                "material_code",
                "material_description",
                "repair_code",
                "repair_description",
                "unit_code",
                "unit_description",
                "length_width",
                "qty",
                "remarks",
            ]
        ]
        survey_df.columns = [
            "Container No",
            "Survey By",
            "Main Component",
            "Component Code",
            "Component Description",
            "Location Code",
            "Location Description",
            "Damage Code",
            "Damage Description",
            "Material Code",
            "Material Description",
            "Repair Code",
            "Repair Description",
            "Unit Code",
            "Unit Description",
            "Length Width",
            "Quantity",
            "Remarks",
        ]
        return survey_df

    def randomNumber(self):
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

    def checkErrors(self, location, site, extracted_data_list):
        error_data = []
        error_data_msg = {}
        correct_data = []

        # ----------------------------------------

        for each in extracted_data_list:
            error_msg = []

            # Container No
            container_no_str = each["container_no"]
            if (
                len(container_no_str) == 11
                and check_char_digit(container_no_str) is True
            ):
                try:
                    for obj_data in correct_data:
                        if container_no_str == obj_data["container_no"]:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                                f"this container is repeated in your file"
                            )
                        else:
                            pass
                except:
                    pass

                try:
                    if site.type == "DEPOT":
                        if ContainerStock.objects.filter(
                            container__container_no=container_no_str,
                            container__location=location,
                            container__site=site,
                            container__client__ref_code="MSC",
                            stage="Survey",
                        ).exists():
                            stock = ContainerStock.objects.filter(
                                container__container_no=container_no_str,
                                container__location=location,
                                container__site=site,
                                container__client__ref_code="MSC",
                                stage="Survey",
                            ).latest("pk")

                            if Survey.objects.filter(
                                depot=stock, is_draft=True
                            ).exists():

                                error_msg.append(
                                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                                    f"this container is in Survey stage with Draft data"
                                )
                        else:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                                f"this container is not on site or in Survey Stage"
                            )
                    else:
                        if NonDepotContainerStock.objects.filter(
                            container__container_no=container_no_str,
                            container__location=location,
                            container__site=site,
                            container__client__ref_code="MSC",
                            stage="Survey",
                        ).exists():
                            stock = NonDepotContainerStock.objects.filter(
                                container__container_no=container_no_str,
                                container__location=location,
                                container__site=site,
                                container__client__ref_code="MSC",
                                stage="Survey",
                            ).latest("pk")
                            if Survey.objects.filter(
                                non_depot=stock, is_draft=True
                            ).exists():
                                error_msg.append(
                                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                                    f"this container is in Survey stage with Draft data"
                                )
                        else:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                                f"this container is not on site or in Survey Stage"
                            )
                except:
                    error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no is invalid"
                )

            # ------------------------------------

            survey_by_str = each["survey_by"]
            if survey_by_str:
                name = survey_by_str.split()
                if len(name) == 1:
                    param = {
                        "firstName": survey_by_str,
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
                if MnrStaff.objects.filter(**param).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in survey_by column,"
                        f"Survey By does not exist in system"
                    )

            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in survey_by column,"
                    f"Survey By is Mandatory"
                )

            main_component_str = each["main_component"]
            if main_component_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                ).exists():
                    error_msg.append("")

                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in main_component column,"
                        f"Main Component does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in main_component column,"
                    f"Main Component is Mandatory"
                )

            component_code_str = each["component_code"]
            if component_code_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code__startswith=component_code_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in component_code column,"
                        f"Component Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in component_code column,"
                    f"Component Code is Mandatory"
                )

            component_description_str = each["component_description"]
            if component_description_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in component_description column,"
                        f"Component Description does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in component_description column,"
                    f"Component Description is Mandatory"
                )

            location_code_str = each["location_code"]
            if location_code_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in location_code column,"
                        f"Location Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in location_code column,"
                    f"Location Code is Mandatory"
                )

            location_description_str = each["location_description"]
            if location_description_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in location_description column,"
                        f"Location Description does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in location_description column,"
                    f"Location Description is Mandatory"
                )

            # specific_location_code_str = each["specific_location_code"]
            # if specific_location_code_str:
            #     if TariffSpecificLocation.objects.filter(
            #         specific_location_code=specific_location_code_str,
            #     ).exists():
            #         error_msg.append("")
            #     else:
            #         error_msg.append(
            #             f"In row {str(int(each['sr_no']) + 2)} there is problem in Specific Location Code  column,"
            #             f"Specific Location Code does not exist in system"
            #         )
            # else:
            #     error_msg.append(
            #         f"In row {str(int(each['sr_no']) + 2)} there is problem in Specific Location Code column,"
            #         f"Specific Location Code is Mandatory"
            #     )

            # specific_location_description_str = each["specific_location_description"]
            # if specific_location_description_str:
            #     if TariffSpecificLocation.objects.filter(
            #         specific_location_code=specific_location_code_str,
            #         specific_location_description=specific_location_description_str,
            #     ).exists():
            #         error_msg.append("")
            #     else:
            #         error_msg.append(
            #             f"In row {str(int(each['sr_no']) + 2)} there is problem in Specific Location Description Code  column,"
            #             f"Specific Location Description Code does not exist in system"
            #         )
            # else:
            #     error_msg.append(
            #         f"In row {str(int(each['sr_no']) + 2)} there is problem in Specific Location Description Code column,"
            #         f"Specific Location Description Code is Mandatory"
            #     )

            damage_code_str = each["damage_code"]
            if damage_code_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in damage_code column,"
                        f"Damage Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in damage_code column,"
                    f"Damage Code is Mandatory"
                )

            damage_description_str = each["damage_description"]
            if damage_description_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in damage_description column,"
                        f"Damage Description does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in damage_description column,"
                    f"Damage Description is Mandatory"
                )

            material_code_str = each["material_code"]
            if material_code_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in material_code column,"
                        f"Material Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in material_code column,"
                    f"Material Code is Mandatory"
                )

            material_description_str = each["material_description"]
            if material_description_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                    material_description__startswith=material_description_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in material_code column,"
                        f"Material Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in material_code column,"
                    f"Material Code is Mandatory"
                )

            repair_code_str = each["repair_code"]
            if repair_code_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                    material_description__startswith=material_description_str,
                    repair_code=repair_code_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in repair_code column,"
                        f"Repair Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in repair_code column,"
                    f"Repair Code is Mandatory"
                )

            repair_description_str = each["repair_description"]
            if repair_description_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                    material_description__startswith=material_description_str,
                    repair_code=repair_code_str,
                    repair_description__startswith=repair_description_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in repair_description column,"
                        f"Repair Description does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in repair_description column,"
                    f"Repair Description is Mandatory"
                )

            unit_code_str = each["unit_code"]
            if unit_code_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                    material_description__startswith=material_description_str,
                    repair_code=repair_code_str,
                    repair_description__startswith=repair_description_str,
                    unit__startswith=unit_code_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in unit_code column,"
                        f"Unit Code does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in unit_code column,"
                    f"Unit Code is Mandatory"
                )

            unit_description_str = each["unit_description"]
            if unit_description_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                    material_description__startswith=material_description_str,
                    repair_code=repair_code_str,
                    repair_description__startswith=repair_description_str,
                    unit__startswith=unit_code_str,
                    measurement__startswith=unit_description_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in unit_description column,"
                        f"Unit Description does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in unit_description column,"
                    f"Unit Description is Mandatory"
                )

            length_width_str = each["length_width"]
            if length_width_str:
                if TariffMasterLine.objects.filter(
                    main_component=main_component_str,
                    parent__location=location,
                    parent__site=site,
                    component_code=component_code_str,
                    component_description__startswith=component_description_str,
                    location_code=location_code_str,
                    location_description__startswith=location_description_str,
                    damage_code=damage_code_str,
                    damage_description__startswith=damage_description_str,
                    material_code=material_code_str,
                    material_description__startswith=material_description_str,
                    repair_code=repair_code_str,
                    repair_description__startswith=repair_description_str,
                    unit__startswith=unit_code_str,
                    measurement__startswith=unit_description_str,
                    length_and_width=length_width_str,
                ).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in length_width column,"
                        f"Length Width does not exist in system"
                    )
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in length_width column,"
                    f"Length Width is Mandatory"
                )

            qty_str = each["qty"]
            if qty_str:
                error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in qty column,"
                    f"Quantity is Mandatory"
                )
            remarks_str = each["remarks"]
            if remarks_str:
                error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in Remarks column,"
                    f"Remarks is Mandatory"
                )

            # if remarks_str:
            #     if remarks_str == "_":
            #         each["remarks"] = ""
            # else:
            #     error_msg.append(
            #         f"In row {str(int(each['sr_no']) + 2)} there is problem in remarks column,"
            #         f"Remarks can be either _ or some value"
            #     )

            # ------------------------------------------------------------
            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)

        return correct_data, error_data, error_data_msg
