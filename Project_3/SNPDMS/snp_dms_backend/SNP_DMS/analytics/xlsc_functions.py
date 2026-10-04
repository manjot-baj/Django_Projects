import xlsxwriter
from SNP_DMS.settings.base import BASE_DIR
import os
import datetime
from django.utils import timezone
from master.models_two import *
import logging
import traceback


def get_merge_format(workbook):
    return workbook.add_format(
        {
            "bold": 2,
            "align": "center",
            "valign": "vcenter",
            "font_color": "#e0a92a",
            "font_size": 18,
        }
    )


def get_merge_format2(workbook):
    return workbook.add_format(
        {
            "bold": 1,
            "align": "center",
            "valign": "vcenter",
            "font_size": 11,
        }
    )


def get_merge_format3(workbook):
    return workbook.add_format(
        {
            "bold": 1,
            "font_size": 11,
        }
    )


def approval_report(
    approval_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
    user_data,
):
    try:
        if from_date_str:
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
            if from_time_str:
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
            else:
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
            from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(
                timezone.get_current_timezone()
            )
            to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                timezone.get_current_timezone()
            )
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
        from_date = from_date_time.date().strftime("%d/%m/%Y")
        from_time = from_date_time.time().strftime("%I:%M %p")
        to_date = to_date_time.date().strftime("%d/%m/%Y")
        to_time = to_date_time.time().strftime("%I:%M %p")

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/approval_report_{date}{time}.xlsx"
        )
        msc_approval_workbook = xlsxwriter.Workbook(temp_file_path)
        msc_merge_format = get_merge_format(msc_approval_workbook)
        msc_merge_format3 = get_merge_format3(msc_approval_workbook)

        msc_re_approval_sheet = msc_approval_workbook.add_worksheet(
            "Re-Estimated Approved"
        )
        msc_re_approval_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_merge_format
        )

        msc_re_approval_sheet.merge_range(
            "A4:U4", "REPORT NAME : ESTIMATE", msc_merge_format3
        )
        msc_re_approval_sheet.merge_range("A5:U5", None, msc_merge_format3)
        msc_re_approval_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3
        )
        msc_re_approval_sheet.merge_range("A7:U7", None, msc_merge_format3)
        msc_re_approval_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        msc_re_approval_sheet.merge_range("A9:U9", None, msc_merge_format3)

        msc_re_approval_sheet.merge_range(
            "A10:U10",
            f"LABOUR RATE : {approval_df_data['labour_rate']}",
            msc_merge_format3,
        )
        msc_re_approval_sheet.merge_range("A11:U11", None, msc_merge_format3)

        msc_re_approval_sheet.add_table(
            f"A12:AH{12 + len(approval_df_data['df_data'])}",
            {
                "data": approval_df_data["df_data"],
                "columns": [
                    {"header": "Sr No"},
                    {"header": "Activity Month"},
                    {"header": "Year"},
                    {"header": "Repair Vendor Name"},
                    {"header": "Container No"},
                    {"header": "Type"},
                    {"header": "Size"},
                    {"header": "Move Code"},
                    {"header": "Arrival Date"},
                    {"header": "Depot Code"},
                    {"header": "Depot Name"},
                    {"header": "Location"},
                    {"header": "MFG Year"},
                    {"header": "MFG Month"},
                    {"header": "Item No"},
                    {"header": "Damage Details"},
                    {"header": "Repair Code"},
                    {"header": "QTY"},
                    {"header": "Man Hrs (Tarrif)"},
                    {"header": "Material (Tariff)"},
                    {"header": "Cleaning Cost (Tarrif)"},
                    {"header": "GST %"},
                    {"header": "Man Hrs (Cost)"},
                    {"header": "Materials Cost (INR)"},
                    {"header": "Cleaning Cost (INR)"},
                    {"header": "Total Cost (INR)"},
                    {"header": "GST Amount"},
                    {"header": "Total Cost (INR) WITH GST"},
                    {"header": "Grand Total Cost (INR)"},
                    {"header": "Update Count"},
                    {"header": "ORIGINAL Cost (INR)"},
                    {"header": "CURRENT Cost (INR)"},
                    {"header": "REMARKS"},
                    {"header": "Line Remark"},
                ],
            },
        )
        msc_approval_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
