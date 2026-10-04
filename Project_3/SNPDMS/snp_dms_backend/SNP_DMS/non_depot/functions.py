import datetime, openpyxl
from master.models_two import Client, ClientAbbreviation
from master.models import ContainerType, ContainerSize
from depot.functions_two import check_char_digit
from .models import *
from .models import NonDepotContainer
from SNP_DMS.settings.base import BASE_DIR
from report.xlsx_function2 import get_merge_format, get_merge_format2, get_merge_format3
import traceback, logging, xlsxwriter, os
from report.functions2 import user_data


def extract_excel_data(input_excel, location, site):
    try:
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["stock"]
        shipping_line_raw = [
            sheet["A" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        client_raw = [
            sheet["B" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        c_type_raw = [
            sheet["C" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        c_size_raw = [
            sheet["D" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        container_no_raw = [
            sheet["E" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        gross_wt_raw = [
            sheet["F" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        tare_wt_raw = [
            sheet["G" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        manufacturing_date_raw = [
            sheet["H" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        in_date_raw = [
            sheet["I" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        in_time_raw = [
            sheet["J" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        condition_raw = [
            sheet["K" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        grade_raw = [sheet["L" + str(row)].value for row in range(1, sheet.max_row + 1)]
        mode_raw = [sheet["M" + str(row)].value for row in range(1, sheet.max_row + 1)]
        dock_destuff_raw = [
            sheet["N" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]

        shipping_line = [each for each in shipping_line_raw if not each is None]
        client = [each for each in client_raw if not each is None]
        c_type = [each for each in c_type_raw if not each is None]
        c_size = [each for each in c_size_raw if not each is None]
        container_no = [each for each in container_no_raw if not each is None]
        gross_wt = [each for each in gross_wt_raw if not each is None]
        tare_wt = [each for each in tare_wt_raw if not each is None]
        manufacturing_date = [
            each for each in manufacturing_date_raw if not each is None
        ]
        in_date = [each for each in in_date_raw if not each is None]
        in_time = [each for each in in_time_raw if not each is None]
        condition = [each for each in condition_raw if not each is None]
        grade = [each for each in grade_raw if not each is None]
        mode = [each for each in mode_raw if not each is None]
        dock_destuff = [each for each in dock_destuff_raw if not each is None]

        popped = [
            shipping_line.pop(0),
            client.pop(0),
            c_type.pop(0),
            c_size.pop(0),
            container_no.pop(0),
            gross_wt.pop(0),
            tare_wt.pop(0),
            manufacturing_date.pop(0),
            in_date.pop(0),
            in_time.pop(0),
            condition.pop(0),
            grade.pop(0),
            mode.pop(0),
            dock_destuff.pop(0),
        ]

        headers = [
            "shipping_line",
            "client",
            "type",
            "size",
            "container_no",
            "gross_wt",
            "tare_wt",
            "manufacturing_date",
            "in_date",
            "in_time",
            "condition",
            "grade",
            "mode",
            "dock_destuff",
        ]

        if not popped == headers:
            return "Header Not Found"

        extracted_data_list = []

        for i in range(len(client)):
            extracted_data_list.append(
                {
                    "sr_no": str(i),
                    "shipping_line": str(shipping_line[i]),
                    "client": str(client[i]),
                    "type": str(c_type[i]),
                    "size": str(c_size[i]),
                    "container_no": str(container_no[i]),
                    "gross_wt": str(gross_wt[i]),
                    "tare_wt": str(tare_wt[i]),
                    "manufacturing_date": str(manufacturing_date[i]),
                    "in_date": str(in_date[i]),
                    "in_time": str(in_time[i]),
                    "condition": str(condition[i]),
                    "grade": str(grade[i]),
                    "mode": str(mode[i]),
                    "dock_destuff": str(dock_destuff[i]),
                }
            )
        ps.close()
        error_data = []
        error_data_msg = {}
        correct_data = []

        for each in extracted_data_list:
            error_msg = []

            client_name = each["client"]
            try:
                Client.objects.get(
                    name=client_name, type="Line", location=location, site=site
                )
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in client column, "
                    f"client not found in system database"
                )

            shipping_line_name = each["shipping_line"]
            try:
                client_obj = Client.objects.get(
                    name=client_name, type="Line", location=location, site=site
                )
                list(
                    ClientAbbreviation.objects.filter(
                        client=client_obj, name=shipping_line_name
                    )
                )[0]
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in shipping_line column, "
                    f"shipping_line not found in system database"
                )

            type_name = each["type"]
            try:
                ContainerType.objects.get(name=type_name)
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in type column,"
                    f"type not found in system database"
                )

            size_name = each["size"]
            try:
                ContainerSize.objects.get(name=str(int(float(size_name))))
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in size column,"
                    f"size not found in system database"
                )

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
                    NonDepotContainer.objects.get(
                        container_no=container_no_str,
                        status="IN",
                        location=location,
                        site=site,
                    )
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this container is already IN"
                    )
                except:
                    error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no is invalid"
                )

            gross_wt_str = each["gross_wt"]
            if not gross_wt_str == "_":
                try:
                    if str(int(float(gross_wt_str))).isdigit() is False:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in gross_wt column,"
                            f"gross_wt is not digit"
                        )
                    else:
                        error_msg.append("")
                except:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in gross_wt column,"
                        f"gross_wt is not digit"
                    )
            else:
                each["gross_wt"] = ""
                error_msg.append("")

            tare_wt_str = each["tare_wt"]
            if not tare_wt_str == "_":
                try:
                    if str(int(float(tare_wt_str))).isdigit() is False:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in tare_wt column,"
                            f"tare_wt is not digit"
                        )
                    else:
                        error_msg.append("")
                except:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in tare_wt column,"
                        f"tare_wt is not digit"
                    )
            else:
                each["tare_wt"] = ""
                error_msg.append("")

            manufacturing_date_str = each["manufacturing_date"]
            try:
                datetime.datetime.strptime(manufacturing_date_str, "%d_%m_%Y").date()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in manufacturing_date column,"
                    f"date is not in dd_mm_yyyy format"
                )

            in_date_str = each["in_date"]
            try:
                datetime.datetime.strptime(in_date_str, "%d_%m_%Y").date()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_date column,"
                    f"date is not in dd_mm_yyyy format"
                )

            in_time_str = each["in_time"]
            try:
                datetime.datetime.strptime(in_time_str, "%H_%M").time()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_time column,"
                    f"date is not in HH_MM format"
                )

            condition_str = each["condition"]
            condition_list = ["OK", "CLEANING", "LD", "MD", "HD"]
            if not condition_str in condition_list:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in condition column,"
                    f"condition provided is not correct, should be among these (OK, CLEANING, LD, MD, HD)"
                )
            else:
                error_msg.append("")

            grade_str = each["grade"]
            if not grade_str == "_":
                grade_list = ["A", "B", "C", "D", "E", "F"]
                if not grade_str in grade_list:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in grade column,"
                        f"grade provided is not correct, should be among these (A, B, C, D, E, F)"
                    )
                else:
                    error_msg.append("")
            else:
                each["grade"] = ""
                error_msg.append("")
            mode_str = each["mode"]
            mode_list = [
                "Factory",
                "Road/Rail",
                "CFS/ICD",
                "Port/Vessel",
                "FS RETURN",
            ]
            if not mode_str in mode_list:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in mode column,"
                    f"mode provided is not correct, should be among these (Factory, By Road,"
                    f" By Rail, CFS/ICD, Port/Vessel)"
                )
            else:
                error_msg.append("")

            dock_destuff_str = each["dock_destuff"]
            try:
                if dock_destuff_str == "_":
                    each["dock_destuff"] = ""
                    error_msg.append("")
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in dock_destuff column,"
                    f"please provide a valid dock destuff value"
                )

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)
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


def create_non_depot_stock_sheet(location, site, df_data, date, time):
    base_temp_dir = os.path.join(BASE_DIR, "temp")
    os.makedirs(base_temp_dir, exist_ok=True)

    temp_file_path = os.path.join(
        base_temp_dir, f"non_depot_stock_sheet_{date}_{time}.xlsx"
    )

    workbook = xlsxwriter.Workbook(temp_file_path)
    stock_sheet = workbook.add_worksheet("STOCK")

    user_data_dict = user_data(location=location, site=site)
    generic_merge_format = get_merge_format(workbook)
    generic_merge_format2 = get_merge_format2(workbook)
    generic_merge_format3 = get_merge_format3(workbook)
    stock_sheet.merge_range(
        "A1:U2", user_data_dict["company_name"], generic_merge_format
    )
    stock_sheet.merge_range(
        "A3:U3", user_data_dict["company_address"], generic_merge_format2
    )

    stock_sheet.merge_range(
        "A4:U4", "REPORT NAME : NON DEPOT STOCK", generic_merge_format3
    )
    stock_sheet.merge_range("A5:U5", None, generic_merge_format3)
    stock_sheet.merge_range(
        "A6:U6",
        f"DEPOT NAME : {user_data_dict['site']} , LOCATION: {user_data_dict['location']}",
        generic_merge_format3,
    )
    stock_sheet.merge_range("A7:U7", None, generic_merge_format3)

    stock_sheet.add_table(
        f"A9:M{9 + len(df_data)}",
        {
            "data": df_data,
            "columns": [
                {"header": "Sl.No."},
                {"header": "Client"},
                {"header": "Ref Code"},
                {"header": "Gate In Date"},
                {"header": "Container No"},
                {"header": "Size"},
                {"header": "Type"},
                {"header": "Stages"},
                {"header": "Estimate Status"},
                {"header": "Status"},
                {"header": "Condition"},
                {"header": "Estimate Westim Status"},
                {"header": "Repair Destim Status"},
            ],
        },
    )
    workbook.close()
    return temp_file_path


def stock_sheet_df(queryset):
    return [
        [
            i + 1,
            each.get("container__client__name", ""),
            each.get("container__client__ref_code", ""),
            (
                each.get("gate_in__in_date").strftime("%d/%m/%Y")
                if each.get("gate_in__in_date")
                else ""
            ),
            each.get("container__container_no", ""),
            each.get("container__size__name", ""),
            each.get("container__type__name", ""),
            each.get("stage", ""),
            each.get("estimate_status", ""),
            each.get("status", ""),
            each.get("container__condition", ""),
            "SENT" if each.get("is_estimate_westim_sent") else "NOT SENT",
            "SENT" if each.get("is_repair_destim_sent") else "NOT SENT",
        ]
        for i, each in enumerate(queryset, start=0)
    ]
