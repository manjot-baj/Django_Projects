from rest_framework.response import Response
from non_depot.models import NonDepotContainer
from depot.functions_two import check_char_digit, check_digit
from common.exceptions import ValidationError, AlreadyExists

from master.models import ContainerType, ContainerSize
from master.models_two import Client, ClientAbbreviation
import openpyxl
from non_depot.models import (
    NonDepotGateIn,
    NonDepotContainerStock,
    NonDepotContainerInOutRecord,
    NonDepotGateOut,
)
from datetime import datetime
from openpyxl import load_workbook
import os
import pandas as pd
from report.xlsx_function2 import get_merge_format, get_merge_format2, get_merge_format3
from report.functions2 import user_data
from SNP_DMS.settings.base import BASE_DIR
import xlsxwriter
from django.utils import timezone
from surveyor.models import Surveyor

digit_data_dict = {
    "A": 10,
    "B": 12,
    "C": 13,
    "D": 14,
    "E": 15,
    "F": 16,
    "G": 17,
    "H": 18,
    "I": 19,
    "J": 20,
    "K": 21,
    "L": 23,
    "M": 24,
    "N": 25,
    "O": 26,
    "P": 27,
    "Q": 28,
    "R": 29,
    "S": 30,
    "T": 31,
    "U": 32,
    "V": 34,
    "W": 35,
    "X": 36,
    "Y": 37,
    "Z": 38,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "0": 0,
}


class NonDepotService:
    def checkCharDigit(self, string):
        mylist = []
        mylist.append(string[0].isalpha())
        mylist.append(string[1].isalpha())
        mylist.append(string[2].isalpha())
        mylist.append(string[3].isalpha())
        mylist.append(string[0].isupper())
        mylist.append(string[1].isupper())
        mylist.append(string[2].isupper())
        mylist.append(string[3].isupper())
        mylist.append(string[4].isdigit())
        mylist.append(string[5].isdigit())
        mylist.append(string[6].isdigit())
        mylist.append(string[7].isdigit())
        mylist.append(string[8].isdigit())
        mylist.append(string[9].isdigit())
        mylist.append(string[10].isdigit())
        if not mylist[0] is True:
            return False
        if all(mylist) is True:
            return True
        else:
            return False

    def check_digit(self, container_no):
        last_digit = container_no[10]
        digit_0 = digit_data_dict[container_no[0]] * 1
        digit_1 = digit_data_dict[container_no[1]] * 2
        digit_2 = digit_data_dict[container_no[2]] * 4
        digit_3 = digit_data_dict[container_no[3]] * 8
        digit_4 = digit_data_dict[container_no[4]] * 16
        digit_5 = digit_data_dict[container_no[5]] * 32
        digit_6 = digit_data_dict[container_no[6]] * 64
        digit_7 = digit_data_dict[container_no[7]] * 128
        digit_8 = digit_data_dict[container_no[8]] * 256
        digit_9 = digit_data_dict[container_no[9]] * 512
        digit_list = [
            digit_0,
            digit_1,
            digit_2,
            digit_3,
            digit_4,
            digit_5,
            digit_6,
            digit_7,
            digit_8,
            digit_9,
        ]
        summed_digit = int(sum(digit_list))
        first_answer = summed_digit / 11
        second_answer = int(first_answer) * 11
        main_answer = summed_digit - int(second_answer)
        if int(main_answer) == 10:
            main_answer = 0
        if int(main_answer) == int(last_digit):
            return True
        else:
            return False

    def checkErrors(self, extracted_data_list, location, site):
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
                datetime.strptime(manufacturing_date_str, "%d_%m_%Y").date()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in manufacturing_date column,"
                    f"date is not in dd_mm_yyyy format"
                )

            in_date_str = each["in_date"]
            try:
                datetime.strptime(in_date_str, "%d_%m_%Y").date()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_date column,"
                    f"date is not in dd_mm_yyyy format"
                )

            in_time_str = each["in_time"]
            try:
                datetime.strptime(in_time_str, "%H_%M").time()
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

        return correct_data, error_data, error_data_msg

    def extractDataList(self, input_excel):
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
            raise ValidationError("Header Not Found")

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
        return extracted_data_list

    def extractExcelData(self, input_excel, location, site):
        extracted_data_list = self.extractDataList(input_excel)

        correct_data, error_data, error_data_msg = self.checkErrors(
            extracted_data_list, location, site
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

    def importData(self, data, location, site, automatic_mnr_status_change):
        for each in data:
            client_str = each["client"]
            shipping_line_str = each["shipping_line"]
            type_str = each["type"]
            size_str = each["size"]
            container_no_str = each["container_no"]
            if each["gross_wt"] == "":
                gross_wt_str = 0
            else:
                gross_wt_str = str(int(float(each["gross_wt"])))
            if each["tare_wt"] == "":
                tare_wt_str = 0
            else:
                tare_wt_str = str(int(float(each["tare_wt"])))
            manufacturing_date_str = each["manufacturing_date"]
            in_date_str = each["in_date"]
            in_time_str = each["in_time"]
            condition_str = each["condition"]
            grade_str = each["grade"]
            dock_destuff_str = each["dock_destuff"]
            mode_str = each["mode"]
            client_object = Client.objects.get(
                name=client_str, location=location, site=site
            )
            shipping_line = list(
                ClientAbbreviation.objects.filter(
                    client=client_object, name=shipping_line_str
                )
            )[0]
            type_object = ContainerType.objects.get(name=type_str)
            size_object = ContainerSize.objects.get(name=str(int(float(size_str))))
            manufacturing_date = datetime.strptime(
                manufacturing_date_str, "%d_%m_%Y"
            ).date()
            in_date = datetime.strptime(in_date_str, "%d_%m_%Y").date()
            in_time = datetime.strptime(in_time_str, "%H_%M").time()

            # Container Check
            try:
                container_object = NonDepotContainer.objects.get(
                    container_no=container_no_str, location=location, site=site
                )

                if container_object.status == "IN":
                    return Response({"errorMsg": "Container Already In"}, status=200)
                else:
                    container_object.status = "IN"
                    container_object.is_available = False
                    container_object.save()
            except:
                container_no_response = check_digit(container_no=container_no_str)

                #     Adding Non Depot Container
                container_object = NonDepotContainer.create(
                    client=client_object,
                    type_object=type_object,
                    size_object=size_object,
                    container_no=container_no_str,
                    payload=None,
                    gross_wt=gross_wt_str,
                    tare_wt=tare_wt_str,
                    manufacturing_date=manufacturing_date,
                    shipping_line=shipping_line,
                    dock_destuff=dock_destuff_str,
                    mode=mode_str,
                    condition=condition_str,
                    grade=grade_str,
                    automatic_mnr_status_change=automatic_mnr_status_change,
                )
                container_object.save()
                container_object.location = location
                container_object.site = site
                container_object.save()

                # Adding Non Depot GateIn
            gate_in_object = NonDepotGateIn.create(
                container=container_object,
                in_date=in_date,
                in_time=in_time,
            )
            gate_in_object.save()

            # Adding Non Depot Container Stock
            NonDepotContainerStock.create(
                gate_in=gate_in_object, container=container_object
            ).save()

            # Adding Non Depot Container InOut Record
            container_in_out_record = NonDepotContainerInOutRecord(
                container=container_object, gate_in=gate_in_object, gate_out=None
            )
            container_in_out_record.save()

    def writeDataToExcel(self, new_temp_file_path, tool_room_df_data, faults):
        book = load_workbook(new_temp_file_path)

        with pd.ExcelWriter(new_temp_file_path, engine="openpyxl") as writer:

            writer.workbook = book

            writer.worksheets = dict((ws.title, ws) for ws in book.worksheets)

            tool_room_df_data.to_excel(
                writer,
                sheet_name="stock",
                startrow=0,
                startcol=0,
                index=False,
            )
            pd.DataFrame(faults).to_excel(
                writer, sheet_name="faults", startrow=0, startcol=0, index=False
            )

    def stockSheetData(self, queryset):

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

    def get_merge_format(workbook):
        merge_format = workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        merge_format3 = workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )
        return merge_format, merge_format3

    def createNonDepotStockSheet(self, location, site, df_data, date, time):
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

    def validateContainerDetails(self, payload, location, site):
        try:
            container_no = payload["container_no"]
            container_object = NonDepotContainer.objects.get(
                container_no=container_no, location=location, site=site
            )

            in_date_str = payload["in_date"]
            if len(in_date_str) == 0:
                in_date = (
                    datetime.now().astimezone(timezone.get_current_timezone()).date()
                )
            else:
                try:
                    in_date = datetime.strptime(in_date_str, "%Y-%m-%d").date()
                except:
                    in_date = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            if NonDepotGateIn.objects.filter(
                container=container_object, in_date=in_date
            ).exists():
                raise ValidationError("Container already exists with same in date")
        except:
            pass

    def createNonDepotEntry(self, data, location, site):
        client_name = data["client"]
        if len(client_name) == 0:
            client = None
        else:
            client = Client.objects.get(name=client_name, location=location, site=site)

        type_name = data["type"]
        if len(type_name) == 0:
            type_object = None
        else:
            try:
                type_object = ContainerType.objects.get(name=type_name)
            except:
                type_object = None

        size_name = data["size"]
        if len(size_name) == 0:
            size_object = None
        else:
            try:
                size_object = ContainerSize.objects.get(name=size_name)
            except:
                size_object = None

        container_no = data["container_no"]
        if len(container_no) == 0:
            raise ValidationError("Please provide container no")

        validation = check_digit(container_no=container_no)
        if validation is True:
            if NonDepotContainer.objects.filter(
                container_no=container_no, status="IN", location__name=location
            ).exists():
                raise AlreadyExists("Container_no Valid but already exist.")
            else:
                pass
        else:
            if NonDepotContainer.objects.filter(
                container_no=container_no, status="IN", location__name=location
            ).exists():
                raise AlreadyExists("Container_no Not Valid but already exist.")
            else:
                pass

        payload = data["payload"]
        if len(payload) == 0:
            payload = None

        gross_wt = data["gross_wt"]
        if len(gross_wt) == 0:
            gross_wt = None

        tare_wt = data["tare_wt"]
        if len(tare_wt) == 0:
            tare_wt = None

        manufacturing_date_str = data["manufacturing_date"]
        if len(manufacturing_date_str) == 0:
            raise ValidationError("Please provide manufacturing date")
        else:
            try:
                manufacturing_date = datetime.strptime(
                    manufacturing_date_str, "%Y-%m-%d"
                ).date()
            except:
                manufacturing_date = None

        shipping_line_name = data["shipping_line"]
        if len(shipping_line_name) == 0:
            shipping_line = None
        else:
            try:
                shipping_line = ClientAbbreviation.objects.get(
                    client=client, name=shipping_line_name
                )
            except:
                shipping_line = None

        mode = data["mode"]
        if len(mode) == 0:
            mode = None

        dock_destuff = data["dock_destuff"]
        if len(dock_destuff) == 0:
            dock_destuff = None

        automatic_mnr_status_change = data["automatic_mnr_status_change"]
        if len(automatic_mnr_status_change) == 0:
            automatic_mnr_status_change = None

        condition = data["condition"]
        if len(condition) == 0:
            condition = None
        try:
            grade = data["grade"]
            if len(grade) == 0:
                grade = None
        except:
            grade = None

        if client.ref_code is None:
            raise ValidationError(
                "Client Reference code is missing, "
                "Please update client in client master."
            )

        try:
            container_object = NonDepotContainer.objects.get(
                container_no=container_no, location=location, site=site
            )
            container_object.status = "IN"
            container_object.is_available = False
            entry_count = int(container_object.in_entry_count) + 1
            container_object.in_entry_count = entry_count
            container_object.save()
        except:
            container_object = NonDepotContainer.create(
                client=client,
                type_object=type_object,
                size_object=size_object,
                container_no=container_no,
                payload=payload,
                gross_wt=gross_wt,
                tare_wt=tare_wt,
                manufacturing_date=manufacturing_date,
                shipping_line=shipping_line,
                dock_destuff=dock_destuff,
                mode=mode,
                condition=condition,
                grade=grade,
                automatic_mnr_status_change=automatic_mnr_status_change,
            )
            container_object.save()
            container_object.is_valid = validation
            container_object.location = location
            container_object.site = site
            entry_count = int(container_object.in_entry_count) + 1
            container_object.in_entry_count = entry_count
            container_object.save()

        # *************************************** In ********************************************************

        in_date_str = data["in_date"]
        if len(in_date_str) == 0:
            in_date = datetime.now().astimezone(timezone.get_current_timezone()).date()
        else:
            try:
                in_date = datetime.strptime(in_date_str, "%Y-%m-%d").date()
            except:
                in_date = (
                    datetime.now().astimezone(timezone.get_current_timezone()).date()
                )

        in_time_str = data["in_time"]
        if len(in_time_str) == 0:
            in_time = datetime.now().astimezone(timezone.get_current_timezone()).time()
        else:
            try:
                in_time = datetime.strptime(in_time_str, "%H:%M").time()
            except:
                in_time = (
                    datetime.now().astimezone(timezone.get_current_timezone()).time()
                )

        in_date_time = datetime.combine(in_date, in_time).astimezone(
            timezone.get_current_timezone()
        )

        gate_in_object, created = NonDepotGateIn.objects.get_or_create(
            container=container_object,
            in_date=in_date_time.date(),
            in_time=in_date_time.time(),
        )

        # *********************************** Stock IN ***********************************************************

        NonDepotContainerStock.objects.get_or_create(
            gate_in=gate_in_object, container=container_object
        )
        stock_object = NonDepotContainerStock.objects.get(
            gate_in=gate_in_object, container=container_object
        )

        if Surveyor.objects.filter(
            container_no=container_no,
            location=location,
            site=site,
            is_new_container=True,
        ).exists():
            stock_object.is_survey_import_available = True
            stock_object.save(update_fields=["is_survey_import_available"])

        # *********************************** In Out Record ****************************************************

        NonDepotContainerInOutRecord.objects.get_or_create(
            container=container_object, gate_in=gate_in_object, gate_out=None
        )

    def updateNonDepot(self, data):

        try:
            if data["client"]:
                client_name = data["client"]
                if len(client_name) == 0:
                    client = None
                else:
                    client = Client.objects.get(name=client_name)
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    client=client
                )
        except:
            pass

        try:
            if data["type"]:
                type_name = data["type"]
                if len(data) == 0:
                    type_object = None
                else:
                    type_object = ContainerType.objects.get(name=type_name)
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    type=type_object
                )
        except:
            pass

        try:
            if data["size"]:
                size_name = data["size"]
                if len(size_name) == 0:
                    size_object = None
                else:
                    size_object = ContainerSize.objects.get(name=size_name)
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    size=size_object
                )
        except:
            pass

        try:
            if data["container_no"]:
                non_depot_container_object = NonDepotContainer.objects.get(
                    pk=data["container_pk"]
                )
                container_no = data["container_no"]
                validation = None
                if len(container_no) == 0:
                    return Response(
                        {"errorMsg": "Please Enter Container_no"}, status=200
                    )
                if not len(container_no) == 11:
                    return Response(
                        {
                            "errorMsg": "Invalid Entry, "
                            "Please Enter Container_no having first 4 uppercase alphabets and "
                            "rest 7 digits"
                        },
                        status=200,
                    )
                if check_char_digit(container_no) is False:
                    return Response(
                        {
                            "errorMsg": "Invalid Entry, "
                            "Please Enter Container_no having first 4 uppercase alphabets and "
                            "rest 7 digits"
                        },
                        status=200,
                    )
                if not non_depot_container_object.container_no == container_no:
                    validation = check_digit(container_no=container_no)
                    if validation is True:
                        if NonDepotContainer.objects.filter(
                            container_no=container_no,
                            status="IN",
                            location__name=data["location"],
                        ).exists():
                            return Response(
                                {"errorMsg": "Container_no Valid but already exist."},
                                status=200,
                            )
                        else:
                            pass
                    else:
                        if NonDepotContainer.objects.filter(
                            container_no=container_no,
                            status="IN",
                            location__name=data["location"],
                        ).exists():
                            return Response(
                                {
                                    "errorMsg": "Container_no Not Valid but already exist."
                                },
                                status=200,
                            )
                        else:
                            pass

                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        container_no=container_no, is_valid=validation
                    )
        except:
            pass

        try:
            if data["payload"]:
                payload = data["payload"]
                if len(payload) == 0:
                    payload = None
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    payload=payload
                )
        except:
            pass

        try:
            if data["gross_wt"]:
                gross_wt = data["gross_wt"]
                if len(gross_wt) == 0:
                    gross_wt = None
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    gross_wt=gross_wt
                )
        except:
            pass

        try:
            if data["tare_wt"]:
                tare_wt = data["tare_wt"]
                if len(tare_wt) == 0:
                    tare_wt = None
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    tare_wt=tare_wt
                )
        except:
            pass

        try:
            if data["manufacturing_date"]:
                manufacturing_date_str = data["manufacturing_date"]
                if len(manufacturing_date_str) == 0:
                    manufacturing_date = None
                else:
                    try:
                        manufacturing_date = datetime.datetime.strptime(
                            manufacturing_date_str, "%Y-%m-%d"
                        ).date()
                    except:
                        manufacturing_date = None

                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    manufacturing_date=manufacturing_date
                )
        except:
            pass

        try:
            if data["shipping_line"]:
                shipping_line_name = data["shipping_line"]
                try:
                    client = NonDepotContainer.objects.get(
                        pk=data["container_pk"]
                    ).client
                except:
                    client = None
                if len(shipping_line_name) == 0 or client is None:
                    shipping_line_object = None
                else:
                    shipping_line_object = ClientAbbreviation.objects.get_or_create(
                        client=client, name=shipping_line_name
                    )
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    shipping_line=shipping_line_object
                )
        except:
            pass

        try:
            if data["mode"]:
                mode = data["mode"]
                if len(mode) == 0:
                    mode = False
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    mode=mode
                )
        except:
            pass

        try:
            if data["dock_destuff"]:
                dock_destuff = data["dock_destuff"]
                if len(dock_destuff) == 0:
                    dock_destuff = False
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    dock_destuff=dock_destuff
                )
        except:
            pass
        try:
            if data["automatic_mnr_status_change"]:
                automatic_mnr_status_change = data["automatic_mnr_status_change"]
                if len(automatic_mnr_status_change) == 0:
                    automatic_mnr_status_change = False
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    automatic_mnr_status_change=automatic_mnr_status_change
                )
        except:
            pass

        try:
            if data["condition"]:
                condition = data["condition"]
                if len(condition) == 0:
                    condition = None

                if (
                    not len(str(data["gate_out_pk"])) == 0
                    and not data["condition"] == "OK"
                ):
                    return Response(
                        {"errorMsg": "OUT Container Condition should be 'OK'"},
                        status=200,
                    )

                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    condition=condition
                )
        except:
            pass

        try:
            if data["grade"]:
                grade = data["grade"]
                if len(grade) == 0:
                    grade = None
                NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                    grade=grade
                )
        except:
            pass

        # ***************************************** Update In ************************************************

        in_date = None
        in_time = None

        if data["in_date"]:
            in_date_str = data["in_date"]
            if len(in_date_str) == 0:
                in_date = (
                    datetime.now().astimezone(timezone.get_current_timezone()).date()
                )
            else:
                try:
                    in_date = datetime.strptime(in_date_str, "%Y-%m-%d").date()
                except:
                    in_date = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
        if data["in_time"]:
            in_time_str = data["in_time"]
            if len(in_time_str) == 0:
                in_time = (
                    datetime.now().astimezone(timezone.get_current_timezone()).time()
                )
            else:
                try:
                    in_time = datetime.strptime(in_time_str, "%H:%M").time()
                except:
                    in_time = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )

        temp_date_time = datetime.combine(in_date, in_time).astimezone(
            timezone.get_current_timezone()
        )

        NonDepotGateIn.objects.filter(pk=data["gate_in_pk"]).update(
            in_date=temp_date_time.date(), in_time=temp_date_time.time()
        )

        # *********************************** Out *************************************************

        if len(str(data["gate_out_pk"])) == 0:
            if not len(data["out_date"]) == 0 and not len(data["out_time"]) == 0:
                out_date_str = data["out_date"]
                if len(out_date_str) == 0:
                    out_date = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
                else:
                    try:
                        out_date = datetime.strptime(out_date_str, "%Y-%m-%d").date()
                    except:
                        out_date = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date()
                        )

                out_time_str = data["out_time"]
                if len(out_time_str) == 0:
                    out_time = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )
                else:
                    try:
                        out_time = datetime.strptime(out_time_str, "%H:%M").time()
                    except:
                        out_time = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                        )

                out_date_time = datetime.combine(out_date, out_time)
                out_date_time = out_date_time.astimezone(
                    timezone.get_current_timezone()
                )
                container_object = NonDepotContainer.objects.get(
                    pk=data["container_pk"]
                )

                if container_object.is_available is False:
                    return Response(
                        {"errorMsg": "Container is not available yet for Out process."},
                        status=200,
                    )

                if not data["condition"] == "OK":
                    return Response(
                        {"errorMsg": "Container Condition should be 'OK'."},
                        status=200,
                    )

                if NonDepotGateOut.objects.filter(
                    container=container_object,
                    out_date=out_date_time.date(),
                    out_time=out_date_time.time(),
                ).exists():
                    return Response(
                        {"errorMsg": "Container already exists with same Out date"},
                        status=200,
                    )
                else:
                    pass

                gate_out_object, created = NonDepotGateOut.objects.get_or_create(
                    container=container_object,
                    out_date=out_date_time.date(),
                    out_time=out_date_time.time(),
                )

                # ************************** Stock Update ***************************************
                gin_object = NonDepotGateIn.objects.get(pk=data["gate_in_pk"])

                stock_object = NonDepotContainerStock.objects.get(
                    container__container_no=container_no, gate_in=gin_object
                )
                stock_object.gate_out = gate_out_object
                stock_object.save()
                stock_object.make_out_of_stock()
                container_object.status = "OUT"
                entry_count = int(container_object.out_entry_count) + 1
                container_object.out_entry_count = entry_count
                container_object.save()

                # *********************************** In Out Record *************************************************

                container_in_out_record = NonDepotContainerInOutRecord.objects.get(
                    container=container_object, gate_in=gin_object
                )
                container_in_out_record.gate_out = gate_out_object
                container_in_out_record.save()

        else:

            out_date = None
            out_time = None

            if data["out_date"]:
                out_date_str = data["out_date"]
                if len(out_date_str) == 0:
                    out_date = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
                else:
                    try:
                        out_date = datetime.strptime(out_date_str, "%Y-%m-%d").date()
                    except:
                        out_date = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date()
                        )
            if data["out_time"]:
                out_time_str = data["out_time"]
                if len(out_time_str) == 0:
                    out_time = (
                        datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )
                else:
                    try:
                        out_time = datetime.strptime(out_time_str, "%H:%M").time()
                    except:
                        out_time = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                        )

            temp_date_time = datetime.combine(out_date, out_time).astimezone(
                timezone.get_current_timezone()
            )

            NonDepotGateOut.objects.filter(pk=data["gate_out_pk"]).update(
                out_date=temp_date_time.date(), out_time=temp_date_time.time()
            )
