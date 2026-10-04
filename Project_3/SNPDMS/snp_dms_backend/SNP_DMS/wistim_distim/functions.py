from SNP_DMS.settings.base import BASE_DIR
import os, datetime, openpyxl, xlsxwriter
from django.utils import timezone
import traceback, logging
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock


def extract_excel_data(input_excel):
    try:
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["Sheet1"]
        # Data Extraction
        # General data
        general_info_key_raw = [sheet["A" + str(row)].value for row in range(1, 6)]
        general_info_key = [each for each in general_info_key_raw if not each is None]

        general_info_value_raw = [sheet["B" + str(row)].value for row in range(1, 6)]
        general_info_value = [
            each for each in general_info_value_raw if not each is None
        ]
        # container data
        sr_no_raw = [sheet["A" + str(row)].value for row in range(6, sheet.max_row + 1)]
        sr_no = [each for each in sr_no_raw if not each is None]

        equipment_no_raw = [
            sheet["B" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        equipment_no = [each for each in equipment_no_raw if not each is None]

        iso_code_raw = [
            sheet["C" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        iso_code = [each for each in iso_code_raw if not each is None]

        estimate_date_time_raw = [
            sheet["D" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        estimate_date_time = [
            each for each in estimate_date_time_raw if not each is None
        ]

        repair_estimate_ref_no_raw = [
            sheet["E" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        repair_estimate_ref_no = [
            each for each in repair_estimate_ref_no_raw if not each is None
        ]
        # seq data
        repair_sequence_raw = [
            sheet["F" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        repair_sequence = [each for each in repair_sequence_raw if not each is None]

        damage_location_raw = [
            sheet["G" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        damage_location = [each for each in damage_location_raw if not each is None]

        component_raw = [
            sheet["H" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        component = [each for each in component_raw if not each is None]

        damage_type_raw = [
            sheet["I" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        damage_type = [each for each in damage_type_raw if not each is None]

        material_type_raw = [
            sheet["J" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        material_type = [each for each in material_type_raw if not each is None]

        repair_type_raw = [
            sheet["K" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        repair_type = [each for each in repair_type_raw if not each is None]

        length_raw = [
            sheet["L" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        length = [each for each in length_raw if not each is None]

        width_raw = [sheet["M" + str(row)].value for row in range(6, sheet.max_row + 1)]
        width = [each for each in width_raw if not each is None]

        unit_type_raw = [
            sheet["N" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        unit_type = [each for each in unit_type_raw if not each is None]

        quantity_raw = [
            sheet["O" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        quantity = [each for each in quantity_raw if not each is None]

        man_hrs_tariff_raw = [
            sheet["P" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        man_hrs_tariff = [each for each in man_hrs_tariff_raw if not each is None]

        material_tariff_raw = [
            sheet["Q" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        material_tariff = [each for each in material_tariff_raw if not each is None]

        cleaning_cost_tariff_raw = [
            sheet["R" + str(row)].value for row in range(6, sheet.max_row + 1)
        ]
        cleaning_cost_tariff = [
            each for each in cleaning_cost_tariff_raw if not each is None
        ]
        ps.close()
        # Checking excel data if valid
        popped = [
            sr_no.pop(0),
            equipment_no.pop(0),
            iso_code.pop(0),
            estimate_date_time.pop(0),
            repair_estimate_ref_no.pop(0),
            repair_sequence.pop(0),
            damage_location.pop(0),
            component.pop(0),
            damage_type.pop(0),
            material_type.pop(0),
            repair_type.pop(0),
            length.pop(0),
            width.pop(0),
            unit_type.pop(0),
            quantity.pop(0),
            man_hrs_tariff.pop(0),
            material_tariff.pop(0),
            cleaning_cost_tariff.pop(0),
        ]

        headers = [
            "Sr.No",
            "Equipment No",
            "ISO Code",
            "Estimate Date Time",
            "Repair Estimate Ref No",
            "Repair Sequence",
            "Damage Location",
            "Component",
            "Damage Type",
            "Material Type",
            "Repair Type",
            "L",
            "W",
            "Unit Type",
            "Qty",
            "Man Hrs(Tariff)",
            "Material(Tariff)",
            "Cleaning Cost(Tariff)",
        ]

        req_general_info_key = [
            "Vendor Code",
            "Depot Code",
            "Shipping Line",
            "Labour Hourly Rate",
            "Currency",
        ]
        if not popped == headers and not req_general_info_key == general_info_key:
            return "Header Not Found"
        # Data Gatheration
        container_data_list = [
            {
                "sr_no": sr_no[no],
                "equipment_no": equipment_no[no],
                "iso_code": iso_code[no],
                "estimate_date_time": estimate_date_time[no],
                "repair_estimate_ref_no": repair_estimate_ref_no[no],
                "seq_data": [],
            }
            for no in range(len(sr_no))
        ]
        damage_seq_data_list = [
            {
                "repair_sequence": repair_sequence[no],
                "damage_location": damage_location[no],
                "component": component[no],
                "damage_type": damage_type[no],
                "material_type": material_type[no],
                "repair_type": repair_type[no],
                "length": length[no],
                "width": width[no],
                "unit_type": unit_type[no],
                "quantity": quantity[no],
                "man_hrs_tariff": man_hrs_tariff[no],
                "material_tariff": material_tariff[no],
                "cleaning_cost_tariff": cleaning_cost_tariff[no],
            }
            for no in range(len(repair_sequence))
        ]

        new_damage_seq_data_list = []

        placement_list = []
        for i in range(len(damage_seq_data_list)):
            if int(damage_seq_data_list[i]["repair_sequence"]) == 1:
                placement_list.append(i)

        placement_list.append(len(damage_seq_data_list))

        for each in range(len(placement_list)):
            if each > 0:
                count = each - 1
            else:
                count = 0
            new_damage_seq_data_list.append(
                damage_seq_data_list[placement_list[count] : placement_list[each]]
            )

        new_damage_seq_data_list.pop(0)

        for i in range(len(new_damage_seq_data_list)):
            container_data_list[i]["seq_data"] = new_damage_seq_data_list[i]

        main_data = {
            "vendor_code": general_info_value[0],
            "depot_code": general_info_value[1],
            "shipping_line": general_info_value[2],
            "labour_hourly_rate": general_info_value[3],
            "currency": general_info_value[4],
            "container_data": container_data_list,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_repair_distim_excel_data(input_excel):
    try:
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["RepairSheet"]
        # Data Extraction
        # General data
        general_info_key_raw = [sheet["A" + str(row)].value for row in range(1, 4)]
        general_info_key = [each for each in general_info_key_raw if not each is None]

        general_info_value_raw = [sheet["B" + str(row)].value for row in range(1, 4)]
        general_info_value = [
            each for each in general_info_value_raw if not each is None
        ]
        # container data
        sr_no_raw = [sheet["A" + str(row)].value for row in range(4, sheet.max_row + 1)]
        sr_no = [each for each in sr_no_raw if not each is None]

        equipment_no_raw = [
            sheet["B" + str(row)].value for row in range(4, sheet.max_row + 1)
        ]
        equipment_no = [each for each in equipment_no_raw if not each is None]

        iso_code_raw = [
            sheet["C" + str(row)].value for row in range(4, sheet.max_row + 1)
        ]
        iso_code = [each for each in iso_code_raw if not each is None]

        estimate_date_raw = [
            sheet["D" + str(row)].value for row in range(4, sheet.max_row + 1)
        ]
        estimate_date = [each for each in estimate_date_raw if not each is None]

        estimate_ref_no_raw = [
            sheet["E" + str(row)].value for row in range(4, sheet.max_row + 1)
        ]
        estimate_ref_no = [each for each in estimate_ref_no_raw if not each is None]
        repair_ref_no_raw = [
            sheet["F" + str(row)].value for row in range(4, sheet.max_row + 1)
        ]
        repair_ref_no = [each for each in repair_ref_no_raw if not each is None]
        repair_completion_date_raw = [
            sheet["G" + str(row)].value for row in range(4, sheet.max_row + 1)
        ]
        repair_completion_date = [
            each for each in repair_completion_date_raw if not each is None
        ]
        ps.close()
        # Checking excel data if valid
        popped = [
            sr_no.pop(0),
            equipment_no.pop(0),
            iso_code.pop(0),
            estimate_date.pop(0),
            estimate_ref_no.pop(0),
            repair_ref_no.pop(0),
            repair_completion_date.pop(0),
        ]

        headers = [
            "Sr.No",
            "Equipment No",
            "ISO Code",
            "Estimate Date",
            "Estimate Ref No",
            "Repair Ref No",
            "Repair Completion Date",
        ]

        req_general_info_key = [
            "Vendor Code",
            "Depot Code",
            "Shipping Line",
            "Labour Hourly Rate",
            "Currency",
        ]
        if not popped == headers and not req_general_info_key == general_info_key:
            return "Header Not Found"
        # Data Gatheration
        container_data_list = [
            {
                "sr_no": sr_no[no],
                "equipment_no": equipment_no[no],
                "iso_code": iso_code[no],
                "estimate_date": estimate_date[no],
                "estimate_ref_no": estimate_ref_no[no],
                "repair_ref_no": repair_ref_no[no],
                "repair_completion_date": repair_completion_date[no],
            }
            for no in range(len(sr_no))
        ]
        main_data = {
            "vendor_code": general_info_value[0],
            "depot_code": general_info_value[1],
            "shipping_line": general_info_value[2],
            "container_data": container_data_list,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def edi_hf_format(depot_code, line, date, time, edi_seq_no, no_of_containers, content):
    try:
        header = f"UNB+UNOA:1+{depot_code}:ZZZ+{line}:ZZZ+{date}:{time}+{edi_seq_no}'"
        footer = f"UNZ+{no_of_containers}+{edi_seq_no}'"
        context = f"{header}\n{content}{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def repair_distim_container_edi_format(
    sr_no,
    repair_ref_no,
    repair_completion_date,
    estimate_date,
    estimate_ref_no,
    container_no,
    vendor_code,
    iso_code,
):
    try:
        content = (
            f"UNH+{sr_no}+DESTIM:D:96B:UN'\n"
            f"BGM+28+{repair_ref_no}+7'\n"
            f"DTM+137:{repair_completion_date}:102'\n"
            f"DTM+500:{estimate_date}:203'\n"
            f"RFF+TES:{estimate_ref_no}'\n"
            f"EQD+CN+{container_no}+{iso_code}:102:ZZZ'\n"
            f"NAD+MS+{vendor_code}'\n"
            f"UNS+D'\n"
            f"CNT+8:1'\n"
            f"UNT+10+{sr_no}'\n"
        )
        return content
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def repair_distim_edi_hf_format(
    depot_code, line, date, time, edi_seq_no, no_of_containers, content
):
    try:
        header = f"UNA:+.?*'\nUNB+UNOB:1+{depot_code}:ZZ+{line}:ZZ+{date}:{time}+{edi_seq_no}'"
        footer = f"UNZ+{no_of_containers}+{edi_seq_no}'"
        context = f"{header}\n{content}{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def container_hf_format(
    sr_no,
    est_date,
    est_no,
    currency,
    labour_rate,
    line,
    vendor_code,
    container_no_letter,
    container_no_numeric,
    iso_code,
    total_man_hour_cost,
    total_material_cost,
    tax,
    grand_total_without_tax,
    grand_total,
    total_damage_seq_no,
    content,
    customer=False,
    terminal=False,
):
    try:
        header = (
            f"UNH+{sr_no}+WESTIM:00++0'\n"
            + f"DTM+ATR+{est_date}'\n"
            + f"RFF+EST+{est_no}+{est_date}:0000'\n"
            + f"ACA+{currency}+STD:0'\n"
            + f"LBR+{labour_rate}'\n"
            + f"NAD+LED+{line}'\n"
            + f"NAD+DED+{vendor_code}'\n"
            + f"EQF+CON+{container_no_letter}:{container_no_numeric}+{iso_code}+MGW:0:KGM'\n"
            + f"ECI+D'\n"
            + f"CUI+++E'\n"
        )
        total_unh_lines = (total_damage_seq_no * 3) + 13
        footer = ""

        if terminal is False and customer is False:
            footer = (
                f"CTO+O+{total_man_hour_cost}+{total_material_cost}+0+{tax}+{grand_total_without_tax}'\n"
                + f"TMA+{grand_total}'\n"
                + f"UNT+{total_unh_lines}+{sr_no}'\n"
            )

        if customer is True and terminal is False:
            footer = (
                f"CTO+C+{total_man_hour_cost}+{total_material_cost}+0+{tax}+{grand_total_without_tax}'\n"
                + f"TMA+{grand_total}'\n"
                + f"UNT+{total_unh_lines}+{sr_no}'\n"
            )

        if terminal is True and customer is False:
            footer = (
                f"CTO+S+{total_man_hour_cost}+{total_material_cost}+0+{tax}+{grand_total_without_tax}'\n"
                + f"TMA+{grand_total}'\n"
                + f"UNT+{total_unh_lines}+{sr_no}'\n"
            )

        context = f"{header}{content}{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def damage_line_format(
    damage_location,
    repair_seq_no,
    component,
    damage_type,
    material_type,
    repair_type,
    unit_type,
    length,
    width,
    quantity,
    man_hour_tarrif,
    material_tarrif,
    labour_rate,
    customer=False,
    terminal=False,
):
    try:
        context = ""

        if terminal is False and customer is False:
            context = (
                f"DAM+{repair_seq_no}+{damage_location}+{component}+{damage_type}+{material_type}'\n"
                + f"WOR+{repair_type}+{unit_type}:{length}:{width}:0+{quantity}'\n"
                + f"COS+00+{man_hour_tarrif}+{material_tarrif}+O+{labour_rate}+N'\n"
            )

        if customer is True and terminal is False:
            context = (
                f"DAM+{repair_seq_no}+{damage_location}+{component}+{damage_type}+{material_type}'\n"
                + f"WOR+{repair_type}+{unit_type}:{length}:{width}:0+{quantity}'\n"
                + f"COS+00+{man_hour_tarrif}+{material_tarrif}+C+{labour_rate}+N'\n"
            )

        if terminal is True and customer is False:
            context = (
                f"DAM+{repair_seq_no}+{damage_location}+{component}+{damage_type}+{material_type}'\n"
                + f"WOR+{repair_type}+{unit_type}:{length}:{width}:0+{quantity}'\n"
                + f"COS+00+{man_hour_tarrif}+{material_tarrif}+S+{labour_rate}+N'\n"
            )

        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_edi_file(date, time, content):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/msc_edi/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/msc_edi/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/{date}{time}msc.edi")
        with open(temp_file_path, "w") as temp:
            temp.write(content)
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_edi(data):
    try:
        vendor_code = data["vendor_code"]
        depot_code = data["depot_code"]
        line = data["shipping_line"]
        labour_rate = data["labour_hourly_rate"]
        currency = data["currency"]
        no_of_containers = len(data["container_data"])
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%d%m%y")
        time = dt.time().strftime("%H%M")
        edi_seq_no = f"{date}{time}"
        container_edi_text_list = []

        for container in data["container_data"]:
            sr_no = container["sr_no"]
            est_date = None
            try:
                est_date_str = str(container["estimate_date_time"].date())
                est_date = (
                    datetime.datetime.strptime(est_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%y%m%d")
                )
            except:
                est_date_str = str(container["estimate_date_time"])
                est_date = (
                    datetime.datetime.strptime(est_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%y%m%d")
                )

            container_no = container["equipment_no"]
            iso_code = container["iso_code"]
            container_no_letter = container_no[:4]
            container_no_numeric = container_no[4:11]
            total_damage_seq_no = len(container["seq_data"])
            est_no = container["repair_estimate_ref_no"]
            total_man_hour_cost_list = []
            total_material_cost_list = []
            dmg_line_edi_text_list = []

            for seq in container["seq_data"]:
                repair_seq_no = seq["repair_sequence"]
                damage_location = seq["damage_location"]
                component = seq["component"]
                damage_type = seq["damage_type"]
                material_type = seq["material_type"]
                repair_type = seq["repair_type"]
                length = seq["length"]
                width = seq["width"]
                unit_type = seq["unit_type"]
                quantity = seq["quantity"]
                man_hour_tarrif = seq["man_hrs_tariff"]

                if not float(seq["cleaning_cost_tariff"]) == float(0):
                    material_tarrif = seq["cleaning_cost_tariff"]
                else:
                    material_tarrif = seq["material_tariff"]

                man_hour_cost = float(man_hour_tarrif) * int(quantity)
                material_cost = float(material_tarrif) * int(quantity)
                appendable_man_hour_cost = float(man_hour_cost) * float(labour_rate)
                total_man_hour_cost_list.append(appendable_man_hour_cost)
                total_material_cost_list.append(material_cost)

                single_dmg_line_edi_text = damage_line_format(
                    damage_location=damage_location,
                    repair_seq_no=repair_seq_no,
                    component=component,
                    damage_type=damage_type,
                    material_type=material_type,
                    repair_type=repair_type,
                    unit_type=unit_type,
                    length=length,
                    width=width,
                    quantity=quantity,
                    man_hour_tarrif=man_hour_cost,
                    material_tarrif=material_cost,
                    labour_rate=labour_rate,
                )
                dmg_line_edi_text_list.append(single_dmg_line_edi_text)

            dmg_line_edi_text = "".join(dmg_line_edi_text_list)

            total_man_hour_cost = round(sum(total_man_hour_cost_list), 2)
            total_material_cost = round(sum(total_material_cost_list), 2)

            grand_total_without_tax_raw = total_man_hour_cost + total_material_cost
            grand_total_without_tax = round(grand_total_without_tax_raw, 2)

            tax_raw = grand_total_without_tax * 0
            tax = round(tax_raw, 2)

            grand_total_raw = grand_total_without_tax + tax
            grand_total = round(grand_total_raw, 2)

            single_container_edi_text = container_hf_format(
                sr_no=sr_no,
                est_date=est_date,
                est_no=est_no,
                currency=currency,
                labour_rate=labour_rate,
                line=line,
                vendor_code=vendor_code,
                container_no_letter=container_no_letter,
                container_no_numeric=container_no_numeric,
                iso_code=iso_code,
                total_man_hour_cost=total_man_hour_cost,
                total_material_cost=total_material_cost,
                tax=tax,
                grand_total_without_tax=grand_total_without_tax,
                grand_total=grand_total,
                total_damage_seq_no=total_damage_seq_no,
                content=dmg_line_edi_text,
            )
            container_edi_text_list.append(single_container_edi_text)

        container_edi_text = "".join(container_edi_text_list)
        main_edi_text = edi_hf_format(
            depot_code=depot_code,
            line=line,
            date=date,
            time=time,
            edi_seq_no=edi_seq_no,
            no_of_containers=no_of_containers,
            content=container_edi_text,
        )
        temp_path = make_edi_file(date=date, time=time, content=main_edi_text)
        return temp_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_estimate_edi_func(data, site_type):
    try:
        vendor_code = data["vendor_code"]
        depot_code = data["depot_code"]
        line = data["shipping_line"]
        labour_rate = data["labour_hourly_rate"]
        currency = data["currency"]
        no_of_containers = len(data["container_data"])
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%d%m%y")
        time = dt.time().strftime("%H%M")
        edi_seq_no = f"{date}{time}"
        container_edi_text_list = []
        damage_codes = [
            "CH",
            "CO",
            "CW",
            "DL",
            "FQ",
            "FZ",
            "GD",
            "LK",
            "LO",
            "ME",
            "ML",
            "MS",
            "NI",
            "OD",
            "PF",
            "PH",
            "RA",
            "RO",
        ]

        for container in data["container_data"]:
            sr_no = container["sr_no"]
            stock_id = container["stock_id"]
            est_date = None
            try:
                est_date_str = str(container["estimate_date_time"].date())
                est_date = (
                    datetime.datetime.strptime(est_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%y%m%d")
                )
            except:
                est_date_str = str(container["estimate_date_time"])
                est_date = (
                    datetime.datetime.strptime(est_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%y%m%d")
                )

            container_no = container["equipment_no"]
            iso_code = container["iso_code"]
            container_no_letter = container_no[:4]
            container_no_numeric = container_no[4:11]
            total_damage_seq_no = len(container["seq_data"])
            est_no = container["repair_estimate_ref_no"]
            total_man_hour_cost_list = []
            total_material_cost_list = []
            dmg_line_edi_text_list = []
            stock = None
            customer = None
            terminal = None
            if site_type == "DEPOT":
                stock = ContainerStock.objects.get(pk=stock_id)
                if stock.gate_in.arrived == "Port/Vessel":
                    terminal = True
                else:
                    terminal = False
            else:
                stock = NonDepotContainerStock.objects.get(pk=stock_id)
                if stock.container.mode == "Port/Vessel":
                    terminal = True
                else:
                    terminal = False
            responsive_party_list = []
            for seq in container["seq_data"]:
                repair_seq_no = seq["repair_sequence"]
                damage_location = seq["damage_location"]
                component = seq["component"]
                damage_type = seq["damage_type"]
                material_type = seq["material_type"]
                repair_type = seq["repair_type"]
                length = seq["length"]
                width = seq["width"]
                unit_type = seq["unit_type"]
                quantity = seq["quantity"]
                man_hour_tarrif = seq["man_hrs_tariff"]

                if not float(seq["cleaning_cost_tariff"]) == float(0):
                    material_tarrif = seq["cleaning_cost_tariff"]
                else:
                    material_tarrif = seq["material_tariff"]

                man_hour_cost = float(man_hour_tarrif) * int(quantity)
                material_cost = float(material_tarrif) * int(quantity)
                appendable_man_hour_cost = float(man_hour_cost) * float(labour_rate)
                total_man_hour_cost_list.append(appendable_man_hour_cost)
                total_material_cost_list.append(material_cost)

                if terminal is True:
                    single_dmg_line_edi_text = damage_line_format(
                        damage_location=damage_location,
                        repair_seq_no=repair_seq_no,
                        component=component,
                        damage_type=damage_type,
                        material_type=material_type,
                        repair_type=repair_type,
                        unit_type=unit_type,
                        length=length,
                        width=width,
                        quantity=quantity,
                        man_hour_tarrif=man_hour_cost,
                        material_tarrif=material_cost,
                        labour_rate=labour_rate,
                        terminal=True,
                        customer=False,
                    )
                else:
                    if not damage_type in damage_codes:
                        single_dmg_line_edi_text = damage_line_format(
                            damage_location=damage_location,
                            repair_seq_no=repair_seq_no,
                            component=component,
                            damage_type=damage_type,
                            material_type=material_type,
                            repair_type=repair_type,
                            unit_type=unit_type,
                            length=length,
                            width=width,
                            quantity=quantity,
                            man_hour_tarrif=man_hour_cost,
                            material_tarrif=material_cost,
                            labour_rate=labour_rate,
                            customer=True,
                            terminal=False,
                        )
                        responsive_party_list.append("C")
                    else:
                        single_dmg_line_edi_text = damage_line_format(
                            damage_location=damage_location,
                            repair_seq_no=repair_seq_no,
                            component=component,
                            damage_type=damage_type,
                            material_type=material_type,
                            repair_type=repair_type,
                            unit_type=unit_type,
                            length=length,
                            width=width,
                            quantity=quantity,
                            man_hour_tarrif=man_hour_cost,
                            material_tarrif=material_cost,
                            labour_rate=labour_rate,
                        )
                        responsive_party_list.append("O")
                dmg_line_edi_text_list.append(single_dmg_line_edi_text)

            dmg_line_edi_text = "".join(dmg_line_edi_text_list)

            total_man_hour_cost = round(sum(total_man_hour_cost_list), 2)
            total_material_cost = round(sum(total_material_cost_list), 2)

            grand_total_without_tax_raw = total_man_hour_cost + total_material_cost
            grand_total_without_tax = round(grand_total_without_tax_raw, 2)

            tax_raw = grand_total_without_tax * 0
            tax = round(tax_raw, 2)

            grand_total_raw = grand_total_without_tax + tax
            grand_total = round(grand_total_raw, 2)

            result = (
                responsive_party_list[0]
                if len(set(responsive_party_list)) == 1
                else None
            )

            if result == "C":
                customer = True
            else:
                if float(grand_total) > float(25000):
                    customer = True
                else:
                    customer = False

            if terminal is True:
                single_container_edi_text = container_hf_format(
                    sr_no=sr_no,
                    est_date=est_date,
                    est_no=est_no,
                    currency=currency,
                    labour_rate=labour_rate,
                    line=line,
                    vendor_code=vendor_code,
                    container_no_letter=container_no_letter,
                    container_no_numeric=container_no_numeric,
                    iso_code=iso_code,
                    total_man_hour_cost=total_man_hour_cost,
                    total_material_cost=total_material_cost,
                    tax=tax,
                    grand_total_without_tax=grand_total_without_tax,
                    grand_total=grand_total,
                    total_damage_seq_no=total_damage_seq_no,
                    content=dmg_line_edi_text,
                    terminal=True,
                    customer=False,
                )
            else:
                if customer is True:
                    single_container_edi_text = container_hf_format(
                        sr_no=sr_no,
                        est_date=est_date,
                        est_no=est_no,
                        currency=currency,
                        labour_rate=labour_rate,
                        line=line,
                        vendor_code=vendor_code,
                        container_no_letter=container_no_letter,
                        container_no_numeric=container_no_numeric,
                        iso_code=iso_code,
                        total_man_hour_cost=total_man_hour_cost,
                        total_material_cost=total_material_cost,
                        tax=tax,
                        grand_total_without_tax=grand_total_without_tax,
                        grand_total=grand_total,
                        total_damage_seq_no=total_damage_seq_no,
                        content=dmg_line_edi_text,
                        customer=True,
                        terminal=False,
                    )
                else:
                    single_container_edi_text = container_hf_format(
                        sr_no=sr_no,
                        est_date=est_date,
                        est_no=est_no,
                        currency=currency,
                        labour_rate=labour_rate,
                        line=line,
                        vendor_code=vendor_code,
                        container_no_letter=container_no_letter,
                        container_no_numeric=container_no_numeric,
                        iso_code=iso_code,
                        total_man_hour_cost=total_man_hour_cost,
                        total_material_cost=total_material_cost,
                        tax=tax,
                        grand_total_without_tax=grand_total_without_tax,
                        grand_total=grand_total,
                        total_damage_seq_no=total_damage_seq_no,
                        content=dmg_line_edi_text,
                    )
            container_edi_text_list.append(single_container_edi_text)

        container_edi_text = "".join(container_edi_text_list)
        main_edi_text = edi_hf_format(
            depot_code=depot_code,
            line=line,
            date=date,
            time=time,
            edi_seq_no=edi_seq_no,
            no_of_containers=no_of_containers,
            content=container_edi_text,
        )
        temp_path = make_edi_file(date=date, time=time, content=main_edi_text)
        return temp_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_repair_distim_edi(data):
    try:
        vendor_code = data["vendor_code"]
        depot_code = data["depot_code"]
        line = data["shipping_line"]
        no_of_containers = len(data["container_data"])
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%y%m%d")
        time = dt.time().strftime("%H%M")
        edi_seq_no = f"{date}{time}"
        container_edi_text_list = []

        for container in data["container_data"]:
            sr_no = container["sr_no"]
            try:
                est_date_str = str(container["estimate_date"].date())
                est_date = (
                    datetime.datetime.strptime(est_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%Y%m%d")
                )
            except:
                est_date_str = str(container["estimate_date"])
                est_date = (
                    datetime.datetime.strptime(est_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%Y%m%d")
                )
            try:
                repair_completion_date_str = str(
                    container["repair_completion_date"].date()
                )
                repair_completion_date = (
                    datetime.datetime.strptime(repair_completion_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%Y%m%d")
                )
            except:
                repair_completion_date_str = str(container["repair_completion_date"])
                repair_completion_date = (
                    datetime.datetime.strptime(repair_completion_date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%Y%m%d")
                )
            container_no = container["equipment_no"]
            iso_code = container["iso_code"]
            estimate_ref_no = container["estimate_ref_no"]
            repair_ref_no = container["repair_ref_no"]

            single_container_edi_text = repair_distim_container_edi_format(
                sr_no=int(sr_no),
                estimate_date=est_date,
                repair_completion_date=repair_completion_date,
                repair_ref_no=repair_ref_no,
                estimate_ref_no=estimate_ref_no,
                vendor_code=vendor_code,
                container_no=container_no,
                iso_code=iso_code,
            )
            container_edi_text_list.append(single_container_edi_text)
        container_edi_text = "".join(container_edi_text_list)
        main_edi_text = repair_distim_edi_hf_format(
            depot_code=depot_code,
            line=line,
            date=date,
            time=time,
            edi_seq_no=edi_seq_no,
            no_of_containers=no_of_containers,
            content=container_edi_text,
        )
        temp_path = make_edi_file(date=date, time=time, content=main_edi_text)
        return temp_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_edi_data(file):
    try:
        # main whole string pack
        try:
            edi_content = file.read().decode("utf-8")
        except:
            with open(file, "rb") as file:
                edi_content = file.read().decode("utf-8")

        # getting depot data
        edi_header_string = edi_content[0 : edi_content.find("UNH+")]
        depot_string_raw = edi_header_string[
            edi_header_string.find("UNB+UNOD:") : len(edi_header_string)
        ].replace("UNB+UNOD:1+MSC:ZZZ+", "")
        depot_code = depot_string_raw.replace(":ZZZ+", " ").split()[0]

        # general variable declare
        line = "MSC"
        labour_rate = ""
        currency = ""
        remark1 = ""
        remark2 = ""
        approved_cost = ""

        # seperating container string pack and storing in list
        no_of_container = edi_content.count("UNH+")
        container_string_list = []
        for each in range(1, int(no_of_container) + 1):
            first = edi_content.rfind(f"UNH+")
            second = edi_content.find("UNZ+")
            container_string_list.insert(0, edi_content[first:second])
            edi_content = edi_content.replace(edi_content[first:second], "")

        # getting each container data from each string pack
        container_data = []
        for each in container_string_list:
            # getting sr_no
            sr_no = (
                each[each.find("UNH+") : each.find("BGM+")]
                .replace("UNH+", "")
                .replace("+", " ")
                .split()[0]
            )

            # getting container header
            container_header_string = each[each.find(f"UNH+") : each.find("UNS+D'")]

            # getting container footer
            container_footer_string = each[each.find("CNT+") : len(each)]

            # getting tax cost
            total_tax_list = []

            # getting approved cost
            approved_cost_raw = None
            try:
                approved_cost_raw = (
                    container_footer_string[
                        container_footer_string.find(
                            "CNT+12:"
                        ) : container_footer_string.find("UNT+")
                    ]
                    .replace("CNT+12:", "")
                    .replace("'", "")
                )
            except:
                pass

            # getting estimate status
            status_no = (
                container_header_string[
                    container_header_string.find("BGM+") : container_header_string.find(
                        "DTM+"
                    )
                ]
                .split("+")[3]
                .split("'")[0]
            )

            if status_no == "9":
                remark1 = "APPROVED"
            elif status_no == "27":
                remark1 = "REJECTED"
            elif status_no == "1":
                remark1 = "CANCEL"
            elif status_no == "5":
                remark1 = "PARTIALLY"
            else:
                remark1 = ""

            # getting estimate date
            est_date_raw = (
                container_header_string[
                    container_header_string.find(
                        "DTM+137:"
                    ) : container_header_string.find("CUX+:")
                ]
                .replace("DTM+137:", "")
                .replace(":", " ")
                .split()[0]
            )
            est_date = (
                datetime.datetime.strptime(est_date_raw[0:8], "%Y%m%d")
                .date()
                .strftime("%d/%m/%Y")
            )

            # getting currency
            currency = (
                container_header_string[
                    container_header_string.find(
                        "CUX+5:"
                    ) : container_header_string.find("RFF+")
                ]
                .replace("CUX+5:", "")
                .replace("'", " ")
                .split()[0]
            )

            # getting estimate no
            est_no = (
                container_header_string[
                    container_header_string.find(
                        "RFF+TES:"
                    ) : container_header_string.find("FTX+")
                ]
                .replace("RFF+TES:", "")
                .replace("'", " ")
                .split()[0]
            )

            # getting estimate status msg
            # remark1 = (
            #     container_header_string[
            #         container_header_string.find(
            #             "FTX+AAE+++"
            #         ) : container_header_string.find("EQD+")
            #     ]
            #     .replace("FTX+AAE+++", "")
            #     .replace("'", "sEpArStR")
            #     .split("sEpArStR")[0]
            # )

            # getting general msg
            remark2 = (
                container_header_string[
                    container_header_string.find(
                        "FTX+AAI+++"
                    ) : container_header_string.find("EQD+")
                ]
                .replace("FTX+AAI+++", "")
                .replace("'", "sEpArStR")
                .split("sEpArStR")[0]
            )

            if (
                container_header_string.find("FTX+ACB+++POST REPAIR IMAGES REQUIRED")
                >= 0
            ):
                remark2 = "POST REPAIR IMAGES REQUIRED"

            # getting container no aka equipment_no and iso code
            container_iso_string = container_header_string[
                container_header_string.find("EQD+CN+") : container_header_string.find(
                    "NAD+"
                )
            ]
            container_iso_split = (
                container_iso_string.replace("EQD+CN+", "").replace("+", " ").split()
            )
            equipment_no = container_iso_split[0]
            iso_code = container_iso_split[1].replace(":", " ").split()[0]

            # getting total no of line item estimates and seperating each string pack in list
            total_seq_no = each.count("LIN+")
            seq_string = each.replace(container_header_string, "").replace("UNS+D'", "")
            seq_string_list = []
            seq_count = 0
            for i in range(1, int(total_seq_no) + 1):
                seq_string.find(f"LIN+{i}+")

                one = seq_string.find(f"LIN+{i}+")
                seq_count = i + 1
                if seq_count > int(total_seq_no):
                    two = seq_string.find("CNT+")
                else:
                    two = seq_string.find(f"LIN+{seq_count}+")
                seq_string_list.append(seq_string[one:two])

            # getting data from each line item estimates string pack
            seq_data = []
            seq_loop_count = 0
            for seq in seq_string_list:
                seq_loop_count = seq_loop_count + 1

                # getting repair_seq_no
                repair_sequence_no = seq_loop_count

                # getting unit type
                unit_type = (
                    seq[seq.find("DIM+10+") : seq.find("QTY+1:")]
                    .replace("DIM+10+", "")
                    .replace("'", "")[0:3]
                )

                # getting quantity
                quantity = (
                    seq[seq.find("QTY+1:") : seq.find("DAM+")]
                    .replace("QTY+1:", "")
                    .split("'")[0]
                )

                # getting free msg

                remark3 = ""
                try:
                    # rejecting per line if LIN ends with 2
                    per_line = seq[seq.find("LIN+") : seq.find("DIM+")]
                    if per_line.split("+")[2] == "2'":
                        remark3 = "REJECTED"
                except:
                    pass

                # print(per_line, remark3)

                # if seq.count("FTX+AAE+++") > 0:
                #     remark3 = (
                #         seq[seq.find("FTX+AAE+++") : seq.find("DAM+")]
                #         .replace("FTX+AAE+++", "")
                #         .replace("'", "sEpArStR")
                #         .split("sEpArStR")[0]
                #     )

                # getting free msg
                remark4 = ""
                # if seq.count("FTX+AAI+++") > 0:
                #     remark4 = (
                #         seq[seq.find("FTX+AAI+++") : seq.find("DAM+")]
                #         .replace("FTX+AAI+++", "")
                #         .replace("'", "sEpArStR")
                #         .split("sEpArStR")[0]
                #     )

                # getting damage type, location and repair type
                dmg_loc_rep_string = seq[seq.find("DAM+") : seq.find("COD+")]
                dmg_loc_rep_string_list = (
                    dmg_loc_rep_string.replace("DAM+", "")
                    .replace(":ZZZ:5+", " ")
                    .split()
                )

                damage_type = dmg_loc_rep_string_list[0]
                location = dmg_loc_rep_string_list[1]
                repair_type = (
                    dmg_loc_rep_string_list[2].replace("+", "").replace(":ZZZ:5'", "")
                )

                # getting component and material type
                compo_mtrl_string = seq[seq.find("COD+") : seq.find("RTE+")]
                component = (
                    compo_mtrl_string.replace("COD+", "")
                    .replace(":ZZZ:5", " ")
                    .split()[0]
                )
                material_type = (
                    compo_mtrl_string.replace("COD+", "")
                    .replace(":ZZZ:5", " ")
                    .split()[1]
                    .replace("+", "")
                )

                # getting labour rate
                labour_rate = (
                    seq[seq.find("RTE+2:") : seq.find("QTY+207:")]
                    .replace("RTE+2:", "")
                    .replace("'", "")
                )

                # getting man hours
                man_hours = (
                    seq[seq.find("QTY+207:") : seq.find("NAD+")]
                    .replace("QTY+207:", "")
                    .replace("'", "")
                )

                # getting material cost
                material_cost = (
                    seq[seq.find("MOA+186:") : len(seq)]
                    .replace("MOA+186:", "")
                    .split(":")[0]
                )
                if len(material_cost) == 0:
                    material_cost = str(0)

                # getting labour_cost
                labour_cost = (
                    seq[seq.find("MOA+185:") : len(seq)]
                    .replace("MOA+185:", "")
                    .split(":")[0]
                )
                if len(labour_cost) == 0:
                    labour_cost = str(0)

                # getting tax
                tax = (
                    seq[seq.find("MOA+124:") : len(seq)]
                    .replace("MOA+124:", "")
                    .split(":")[0]
                )
                if len(tax) == 0 or tax == "'":
                    tax = str(0)
                total_tax_list.append(float(tax))

                seq_data.append(
                    {
                        "repair_sequence": repair_sequence_no,
                        "damage_location": location.replace("\n", ""),
                        "component": component.replace("\n", ""),
                        "damage_type": damage_type.replace("\n", ""),
                        "material_type": material_type.replace("\n", ""),
                        "repair_type": repair_type.replace("\n", ""),
                        "unit_type": unit_type.replace("\n", ""),
                        "quantity": quantity.replace("\n", ""),
                        "labour_cost": labour_cost.replace("\n", ""),
                        "tax": tax.replace("\n", ""),
                        "material_cost": (
                            0
                            if float(man_hours.replace("\n", "")) == float(0)
                            else material_cost.replace("\n", "")
                        ),
                        "cleaning_cost": (
                            material_cost.replace("\n", "")
                            if float(man_hours.replace("\n", "")) == float(0)
                            else 0
                        ),
                        "remark3": remark3.replace("\n", ""),
                        "remark4": remark4.replace("\n", ""),
                    }
                )
            total_tax = round(sum(total_tax_list), 2)

            approved_cost = 0
            try:
                approved_cost_raw = float(approved_cost_raw)
                approved_cost = round(approved_cost_raw, 2)
            except:
                pass

            container_data.append(
                {
                    "sr_no": sr_no.replace("\n", ""),
                    "equipment_no": equipment_no.replace("\n", ""),
                    "iso_code": iso_code.replace("\n", ""),
                    "estimate_date_time": est_date,
                    "estimate_ref_no": est_no.replace("\n", ""),
                    "seq_data": seq_data,
                    "remark1": remark1.replace("\n", ""),
                    "remark2": remark2.replace("\n", ""),
                    "approved_cost": approved_cost,
                    "total_tax": total_tax,
                }
            )
        general_data = {
            "depot_code": depot_code.replace("\n", ""),
            "line": line,
            "labour_rate": labour_rate.replace("\n", ""),
            "currency": currency.replace("\n", ""),
            "container_data": container_data,
        }
        return general_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_excel(general_data, container_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_inward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        sheet = msc_workbook.add_worksheet("Sheet1")
        msc_merge_format = msc_workbook.add_format({"bold": 1, "font_size": 11})
        sheet.merge_range(
            "A1:B1", f"Depot Code : {general_data['depot_code']}", msc_merge_format
        )
        sheet.merge_range(
            "A2:B2", f"Shipping Line : {general_data['line']}", msc_merge_format
        )
        sheet.merge_range(
            "A3:B3",
            f"Labour Hourly Rate : {general_data['labour_rate']}",
            msc_merge_format,
        )
        sheet.merge_range(
            "A4:B4", f"Currency : {general_data['currency']}", msc_merge_format
        )
        sheet.add_table(
            f"A5:W{5 + len(container_data)}",
            {
                "data": container_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Equipment No"},
                    {"header": "ISO Code"},
                    {"header": "Estimate Date Time"},
                    {"header": "Repair Estimate Ref no"},
                    {"header": "Remark1"},
                    {"header": "Remark2"},
                    {"header": "Approved Cost"},
                    {"header": "Estimated Cost"},
                    {"header": "Total Tax"},
                    {"header": "Repair Sequence"},
                    {"header": "Damage Location"},
                    {"header": "Component"},
                    {"header": "Damage Type"},
                    {"header": "Material Type"},
                    {"header": "Repair Type"},
                    {"header": "Unit Type"},
                    {"header": "Qty"},
                    {"header": "Labour Cost"},
                    {"header": "Material Cost"},
                    {"header": "Cleaning Cost"},
                    {"header": "Tax"},
                    {"header": "Remark3"},
                    {"header": "Remark4"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_excel_data(data):
    try:
        general_data = {
            "depot_code": data["depot_code"],
            "line": data["line"],
            "labour_rate": data["labour_rate"],
            "currency": data["currency"],
        }

        sr_no = []
        equipment_no = []
        iso_code = []
        estimate_date_time = []
        estimate_ref_no = []
        remark1 = []
        remark2 = []
        approved_cost = []
        edp_estimated_cost = []
        total_tax = []
        repair_sequence = []
        damage_location = []
        component = []
        damage_type = []
        material_type = []
        repair_type = []
        unit_type = []
        quantity = []
        labour_cost = []
        material_cost = []
        cleaning_cost = []
        tax = []
        remark3 = []
        remark4 = []

        for container in data["container_data"]:
            sr_no.append(container["sr_no"])
            equipment_no.append(container["equipment_no"])
            iso_code.append(container["iso_code"])
            estimate_date_time.append(container["estimate_date_time"])
            estimate_ref_no.append(container["estimate_ref_no"])
            remark1.append(container["remark1"])
            remark2.append(container["remark2"])
            approved_cost.append(container["approved_cost"])
            try:
                edp_estimated_cost.append(container["edp_estimated_cost"])
            except:
                edp_estimated_cost.append("")
            total_tax.append(container["total_tax"])
            count = 0
            for seq in container["seq_data"]:
                count = count + 1
                if count > 1:
                    sr_no.append("")
                    equipment_no.append("")
                    iso_code.append("")
                    estimate_date_time.append("")
                    estimate_ref_no.append("")
                    remark1.append("")
                    remark2.append("")
                    approved_cost.append("")
                    edp_estimated_cost.append("")
                    total_tax.append("")
                repair_sequence.append(seq["repair_sequence"])
                damage_location.append(seq["damage_location"])
                component.append(seq["component"])
                damage_type.append(seq["damage_type"])
                material_type.append(seq["material_type"])
                repair_type.append(seq["repair_type"])
                unit_type.append(seq["unit_type"])
                quantity.append(seq["quantity"])
                labour_cost.append(seq["labour_cost"])
                material_cost.append(seq["material_cost"])
                cleaning_cost.append(seq["cleaning_cost"])
                tax.append(seq["tax"])
                remark3.append(seq["remark3"])
                remark4.append(seq["remark4"])
            sr_no.append("")
            equipment_no.append("")
            iso_code.append("")
            estimate_date_time.append("")
            estimate_ref_no.append("")
            remark1.append("")
            remark2.append("")
            approved_cost.append("")
            edp_estimated_cost.append("")
            total_tax.append("")
            repair_sequence.append("")
            damage_location.append("")
            component.append("")
            damage_type.append("")
            material_type.append("")
            repair_type.append("")
            unit_type.append("")
            quantity.append("")
            labour_cost.append("")
            material_cost.append("")
            cleaning_cost.append("")
            tax.append("")
            remark3.append("")
            remark4.append("")

        container_data = [
            [
                sr_no[i],
                equipment_no[i],
                iso_code[i],
                estimate_date_time[i],
                estimate_ref_no[i],
                remark1[i],
                remark2[i],
                approved_cost[i],
                edp_estimated_cost[i],
                total_tax[i],
                repair_sequence[i],
                damage_location[i],
                component[i],
                damage_type[i],
                material_type[i],
                repair_type[i],
                unit_type[i],
                quantity[i],
                labour_cost[i],
                material_cost[i],
                cleaning_cost[i],
                tax[i],
                remark3[i],
                remark4[i],
            ]
            for i in range(len(sr_no))
        ]

        temp_path = make_excel(general_data, container_data)
        return temp_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
