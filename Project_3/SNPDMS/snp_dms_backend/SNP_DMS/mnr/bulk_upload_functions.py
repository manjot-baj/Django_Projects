import os, xlsxwriter, datetime, logging, traceback, openpyxl
from SNP_DMS.settings.base import BASE_DIR
from .models import (
    Survey,
    TariffMasterLine,
    MnrStaff,
    TariffSpecificLocation,
    SurveyLine,
)
import pandas as pd
from django.utils import timezone
from depot.functions_two import check_char_digit
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock


def getBulkTariffExcelRowData(data_object):
    try:
        data = {}
        tariff_code = "_"
        main_component = "_"
        component_code = "_"
        component_description = "_"
        location_code = "_"
        location_description = "_"
        damage_code = "_"
        damage_description = "_"
        material_code = "_"
        material_description = "_"
        repair_code = "_"
        repair_description = "_"
        unit = "_"
        measurement = "_"
        length_and_width = "_"
        quantity = "0"
        labour_hrs_tariff = "0"
        wash_clean_tariff = "0"
        material_tariff = "0"

        if data_object.tariff_code is not None:
            tariff_code = data_object.tariff_code
        data["tariff_code"] = tariff_code

        if data_object.main_component is not None:
            main_component = data_object.main_component
        data["main_component"] = main_component

        if data_object.component_code is not None:
            component_code = str(data_object.component_code)
        data["component_code"] = component_code

        if data_object.component_description is not None:
            component_description = data_object.component_description
        data["component_description"] = component_description

        if data_object.location_code is not None:
            location_code = str(data_object.location_code)
        data["location_code"] = location_code

        if data_object.location_description is not None:
            location_description = data_object.location_description
        data["location_description"] = location_description

        if data_object.damage_code is not None:
            damage_code = str(data_object.damage_code)
        data["damage_code"] = damage_code

        if data_object.damage_description is not None:
            damage_description = data_object.damage_description
        data["damage_description"] = damage_description

        if data_object.material_code is not None:
            material_code = str(data_object.material_code)
        data["material_code"] = material_code

        if data_object.material_description is not None:
            material_description = data_object.material_description
        data["material_description"] = material_description

        if data_object.repair_code is not None:
            repair_code = str(data_object.repair_code)
        data["repair_code"] = repair_code

        if data_object.repair_description is not None:
            repair_description = data_object.repair_description
        data["repair_description"] = repair_description

        if data_object.unit is not None:
            unit = data_object.unit
        data["unit"] = unit

        if data_object.measurement is not None:
            measurement = data_object.measurement
        data["measurement"] = measurement

        if data_object.length_and_width is not None:
            length_and_width = data_object.length_and_width
        data["length_and_width"] = length_and_width

        if data_object.quantity is not None:
            quantity = str(data_object.quantity)
        data["quantity"] = quantity

        if data_object.labour_hrs_tariff is not None:
            labour_hrs_tariff = str(data_object.labour_hrs_tariff)
        data["labour_hrs_tariff"] = labour_hrs_tariff

        if data_object.wash_clean_tariff is not None:
            wash_clean_tariff = str(data_object.wash_clean_tariff)
        data["wash_clean_tariff"] = wash_clean_tariff

        if data_object.material_tariff is not None:
            material_tariff = str(data_object.material_tariff)
        data["material_tariff"] = material_tariff

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getBulkTariffExcelData(parent):
    try:
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 18)]]
        main_response = {"client": "", "labour_rate": "", "tariff_lines": df_data}
        return main_response


def make_bulk_tariff_excel(data, specific_location_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_survey_upload_excel_data(input_excel, location, site):
    try:
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

        correct_data, error_data, error_data_msg = check_errors(
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False

    finally:
        ps.close()


def check_errors(location, site, extracted_data_list):
    error_data = []
    error_data_msg = {}
    correct_data = []

    # ----------------------------------------

    for each in extracted_data_list:
        error_msg = []

        # Container No
        container_no_str = each["container_no"]
        if len(container_no_str) == 11 and check_char_digit(container_no_str) is True:
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

                        if Survey.objects.filter(depot=stock, is_draft=True).exists():

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


def extract_survey_data_for_rejected_file(data):

    tool_room_df_data = pd.DataFrame(data)[
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
    tool_room_df_data.columns = [
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
    return tool_room_df_data


def getSpecificLocationData():
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


def getTariffLineData(location, site, each):
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


def createSurveyLineObject(parent, tarrif_line, each):
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


def checkContainerExistence(site, importable_data):
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
