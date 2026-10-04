import xlsxwriter
from SNP_DMS.settings.base import BASE_DIR
import os
import datetime
from django.utils import timezone
from master.models_two import *
import logging
import traceback


def get_from_to_date_and_time(from_date_str, to_date_str, from_time_str, to_time_str):
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

    return from_date, from_time, to_date, to_time


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


def create_generic_daily_report_wb(
    user_data,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    summary_df_data,
    # summary_b_df_data,
    av_aa_ar_df_data,
    movement_summary_df_data,
    total_inward_df_data,
    total_outward_df_data,
    status_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_daily_report_{date}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = generic_workbook.add_worksheet("INWARD")
        outward_sheet = generic_workbook.add_worksheet("OUTWARD")
        stock_sheet = generic_workbook.add_worksheet("STOCK")
        summary_sheet = generic_workbook.add_worksheet("SUMMARY")
        # summary_b_sheet = generic_workbook.add_worksheet("SUMMARY B")
        av_aa_ar_sheet = generic_workbook.add_worksheet("AV&AA&AR")
        movement_summary_sheet = generic_workbook.add_worksheet("MOVEMENT_SUMMARY")

        total_inward_sheet = None
        total_outward_sheet = None
        if total_inward_df_data is not None and total_outward_df_data is not None:
            total_inward_sheet = generic_workbook.add_worksheet("TOTAL_INWARD")
            total_outward_sheet = generic_workbook.add_worksheet("TOTAL_OUTWARD")

        status_sheet = generic_workbook.add_worksheet("STATUS")
        generic_merge_format = get_merge_format(generic_workbook)
        generic_merge_format2 = get_merge_format2(generic_workbook)
        generic_merge_format3 = get_merge_format3(generic_workbook)

        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", generic_merge_format3)
        inward_sheet.merge_range("A5:U5", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:W{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "BL No"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", generic_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateInDate"},
                    {"header": "GateOutDate"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )

        stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        stock_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : STOCK", generic_merge_format3)
        stock_sheet.merge_range("A5:U5", None, generic_merge_format3)
        stock_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        stock_sheet.merge_range("A7:U7", None, generic_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, generic_merge_format3)
        stock_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        stock_sheet.add_table(
            f"A12:O{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateInDate"},
                    {"header": "ContainerNo"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Age"},
                    {"header": "Status"},
                    {"header": "Condition"},
                    {"header": "AvailableDate"},
                    {"header": "ApprovalDate"},
                    {"header": "BookingNo"},
                    {"header": "Remarks"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : SUMMARY", generic_merge_format3
        )
        summary_sheet.merge_range("A5:U5", None, generic_merge_format3)
        summary_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        summary_sheet.merge_range("A7:U7", None, generic_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, generic_merge_format3)
        summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        summary_sheet.add_table(
            f"A12:E{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "SizeType"},
                    {"header": "OpBal"},
                    {"header": "InQty"},
                    {"header": "OutQty"},
                    {"header": "ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        # summary_b_sheet.merge_range(
        #     "A1:U2", user_data["company_name"], generic_merge_format
        # )
        # summary_b_sheet.merge_range(
        #     "A3:U3", user_data["company_address"], generic_merge_format2
        # )

        # summary_b_sheet.merge_range(
        #     "A4:U4", "REPORT NAME : SUMMARY B", generic_merge_format3
        # )
        # summary_b_sheet.merge_range("A5:U5", None, generic_merge_format3)
        # summary_b_sheet.merge_range(
        #     "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        # )
        # summary_b_sheet.merge_range("A7:U7", None, generic_merge_format3)
        # summary_b_sheet.merge_range(
        #     "A8:U8",
        #     f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        #     generic_merge_format3,
        # )
        # summary_b_sheet.merge_range("A9:U9", None, generic_merge_format3)
        # summary_b_sheet.merge_range(
        #     "A10:U10",
        #     f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        #     generic_merge_format3,
        # )

        # summary_b_sheet.add_table(
        #     f"A12:L{12 + len(summary_b_df_data[0])}",
        #     {
        #         "data": summary_b_df_data[0],
        #         "columns": [
        #             {"header": "Size"},
        #             {"header": "20'DV"},
        #             {"header": "40'DV"},
        #             {"header": "20'STD"},
        #             {"header": "40'STD"},
        #             {"header": "20'HC"},
        #             {"header": "40'HC"},
        #             {"header": "20'OT"},
        #             {"header": "40'OT"},
        #             {"header": "20'FR"},
        #             {"header": "40'FR"},
        #             {"header": "TOTAL"},
        #             # {"header": "REMARKS"},
        #         ],
        #         "first_column": True,
        #         "autofilter": False,
        #     },
        # )

        # summary_b_sheet.add_table(
        #     f"A{15 + len(summary_b_df_data[0])}:E{15 + len(summary_b_df_data[0]) + len(summary_b_df_data[1])}",
        #     {
        #         "data": summary_b_df_data[1],
        #         "columns": [
        #             {"header": "SizeType"},
        #             {"header": "OpBal"},
        #             {"header": "InQty"},
        #             {"header": "OutQty"},
        #             {"header": "ClBal"},
        #         ],
        #         "first_column": True,
        #         "autofilter": False,
        #     },
        # )

        av_aa_ar_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        av_aa_ar_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        av_aa_ar_sheet.merge_range(
            "A4:U4", "REPORT NAME : AV&AA&AR", generic_merge_format3
        )
        av_aa_ar_sheet.merge_range("A5:U5", None, generic_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        av_aa_ar_sheet.merge_range("A7:U7", None, generic_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        av_aa_ar_sheet.merge_range("A9:U9", None, generic_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        av_aa_ar_sheet.add_table(
            f"A12:F{12 + len(av_aa_ar_df_data)}",
            {
                "data": av_aa_ar_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "ContainerNo"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Status"},
                    {"header": "AvailableDate"},
                ],
            },
        )

        movement_summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        movement_summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        movement_summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : MOVEMENT SUMMARY", generic_merge_format3
        )
        movement_summary_sheet.merge_range("A5:U5", None, generic_merge_format3)
        movement_summary_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        movement_summary_sheet.merge_range("A7:U7", None, generic_merge_format3)
        movement_summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        movement_summary_sheet.merge_range("A9:U9", None, generic_merge_format3)
        movement_summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        movement_summary_sheet.add_table(
            f"A12:E{12 + len(movement_summary_df_data)}",
            {
                "data": movement_summary_df_data,
                "columns": [
                    {"header": "Movement"},
                    {"header": "In-20'"},
                    {"header": "In-40'"},
                    {"header": "Out-20'"},
                    {"header": "Out-40'"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        if total_inward_sheet is not None:
            total_inward_sheet.merge_range(
                "A1:U2", user_data["company_name"], generic_merge_format
            )
            total_inward_sheet.merge_range(
                "A3:U3", user_data["company_address"], generic_merge_format2
            )

            total_inward_sheet.merge_range(
                "A4:U4", "REPORT NAME : TOTAL INWARD", generic_merge_format3
            )
            total_inward_sheet.merge_range("A5:U5", None, generic_merge_format3)
            total_inward_sheet.merge_range(
                "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
            )
            total_inward_sheet.merge_range("A7:U7", None, generic_merge_format3)
            total_inward_sheet.merge_range(
                "A8:U8",
                f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
                generic_merge_format3,
            )
            total_inward_sheet.merge_range("A9:U9", None, generic_merge_format3)
            total_inward_sheet.merge_range(
                "A10:U10",
                f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
                generic_merge_format3,
            )

            total_inward_sheet.add_table(
                f"A12:O{12 + len(total_inward_df_data)}",
                {
                    "data": total_inward_df_data,
                    "columns": [
                        {"header": "Sl.No"},
                        {"header": "GateInDate"},
                        {"header": "ContainerNo"},
                        {"header": "Size"},
                        {"header": "Type"},
                        {"header": "Gross Wt"},
                        {"header": "Tare Wt"},
                        {"header": "Payload"},
                        {"header": "MfgDate"},
                        {"header": "Vessel"},
                        {"header": "Voyage"},
                        {"header": "Customer"},
                        {"header": "VehicleNo"},
                        {"header": "ImportCargo"},
                        {"header": "Transporter"},
                    ],
                },
            )

        if total_outward_sheet is not None:
            total_outward_sheet.merge_range(
                "A1:U2", user_data["company_name"], generic_merge_format
            )
            total_outward_sheet.merge_range(
                "A3:U3", user_data["company_address"], generic_merge_format2
            )

            total_outward_sheet.merge_range(
                "A4:U4", "REPORT NAME : TOTAL OUTWARD", generic_merge_format3
            )
            total_outward_sheet.merge_range("A5:U5", None, generic_merge_format3)
            total_outward_sheet.merge_range(
                "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
            )
            total_outward_sheet.merge_range("A7:U7", None, generic_merge_format3)
            total_outward_sheet.merge_range(
                "A8:U8",
                f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
                generic_merge_format3,
            )
            total_outward_sheet.merge_range("A9:U9", None, generic_merge_format3)
            total_outward_sheet.merge_range(
                "A10:U10",
                f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
                generic_merge_format3,
            )

            total_outward_sheet.add_table(
                f"A12:AB{12 + len(total_outward_df_data)}",
                {
                    "data": total_outward_df_data,
                    "columns": [
                        {"header": "Sl.No"},
                        {"header": "GateInDate"},
                        {"header": "GateOutDate"},
                        {"header": "Line"},
                        {"header": "Customer"},
                        {"header": "Shipper"},
                        {"header": "Place"},
                        {"header": "Vessel"},
                        {"header": "Voyage"},
                        {"header": "Transporter"},
                        {"header": "VehicleNo"},
                        {"header": "ExportCargo"},
                        {"header": "ContainerNo"},
                        {"header": "Size Type"},
                        {"header": "GrossWt"},
                        {"header": "TareWt"},
                        {"header": "Payload"},
                        {"header": "Grade"},
                        {"header": "BookingNo"},
                        {"header": "SealNo"},
                        {"header": "Status"},
                        {"header": "Remarks"},
                        {"header": "MfgDate"},
                        {"header": "PortOfLoading"},
                        {"header": "PortOfDischarge"},
                        {"header": "Destination"},
                        {"header": "OPR"},
                        {"header": "ToPort"},
                    ],
                },
            )

        status_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        status_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        status_sheet.merge_range("A4:U4", "REPORT NAME : STATUS", generic_merge_format3)
        status_sheet.merge_range("A5:U5", None, generic_merge_format3)
        status_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        status_sheet.merge_range("A7:U7", None, generic_merge_format3)
        status_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        status_sheet.merge_range("A9:U9", None, generic_merge_format3)
        status_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        status_sheet.add_table(
            f"A12:E{12 + len(status_df_data)}",
            {
                "data": status_df_data,
                "columns": [
                    {"header": "Status"},
                    {"header": "OpBal"},
                    {"header": "InBal"},
                    {"header": "OutBal"},
                    {"header": "CalBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        generic_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_generic_inward_report_wb(
    user_data,
    inward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_inward_report_{date}{time}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = generic_workbook.add_worksheet("INWARD")
        generic_merge_format = get_merge_format(generic_workbook)
        generic_merge_format2 = get_merge_format2(generic_workbook)
        generic_merge_format3 = get_merge_format3(generic_workbook)
        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", generic_merge_format3)
        inward_sheet.merge_range("A5:U5", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:W{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "BL No"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except Exception as e:
        return e


def create_generic_outward_report_wb(
    user_data,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_outward_report_{date}{time}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = generic_workbook.add_worksheet("OUTWARD")
        generic_merge_format = get_merge_format(generic_workbook)
        generic_merge_format2 = get_merge_format2(generic_workbook)
        generic_merge_format3 = get_merge_format3(generic_workbook)

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", generic_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateInDate"},
                    {"header": "GateOutDate"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_zim_daily_report_wb(
    user_data,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/zim_daily_report_{date}{time}.xlsx"
        )
        zim_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = zim_workbook.add_worksheet("INWARD")
        outward_sheet = zim_workbook.add_worksheet("OUTWARD")
        stock_sheet = zim_workbook.add_worksheet("STOCK")
        zim_merge_format = get_merge_format(zim_workbook)
        zim_merge_format2 = get_merge_format2(zim_workbook)
        zim_merge_format3 = get_merge_format3(zim_workbook)
        inward_sheet.merge_range("A1:U2", user_data["company_name"], zim_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            zim_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", zim_merge_format3)
        inward_sheet.merge_range("A5:U5", None, zim_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : ZIM", zim_merge_format3)
        inward_sheet.merge_range("A7:U7", None, zim_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            zim_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, zim_merge_format3)
        inward_sheet.merge_range("A10:U10", None, zim_merge_format3)

        inward_sheet.add_table(
            f"A12:I{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "S.NO."},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "FDS/IN"},
                    {"header": "FROM"},
                    {"header": "G.WT."},
                    {"header": "T.WT."},
                    {"header": "N.WT."},
                    {"header": "CONDITION"},
                ],
            },
        )

        outward_sheet.merge_range("A1:U2", user_data["company_name"], zim_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            zim_merge_format2,
        )

        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUTWARD", zim_merge_format3)
        outward_sheet.merge_range("A5:U5", None, zim_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : ZIM", zim_merge_format3)
        outward_sheet.merge_range("A7:U7", None, zim_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            zim_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, zim_merge_format3)
        outward_sheet.merge_range("A10:U10", None, zim_merge_format3)

        outward_sheet.add_table(
            f"A12:H{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "S.NO."},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "FS/OUT"},
                    {"header": "SHIPPER"},
                    {"header": "DESTINATION"},
                    {"header": "SEAL NUMBER"},
                    {"header": "BOOKING NO"},
                ],
            },
        )

        stock_sheet.merge_range("A1:U2", user_data["company_name"], zim_merge_format)
        stock_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            zim_merge_format2,
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : STOCK", zim_merge_format3)
        stock_sheet.merge_range("A5:U5", None, zim_merge_format3)
        stock_sheet.merge_range("A6:U6", "SHIPPING LINE : ZIM", zim_merge_format3)
        stock_sheet.merge_range("A7:U7", None, zim_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            zim_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, zim_merge_format3)
        stock_sheet.merge_range("A10:U10", None, zim_merge_format3)

        stock_sheet.add_table(
            f"A12:I{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "SR NO"},
                    {"header": "CONT. NO."},
                    {"header": "SZ/TY"},
                    {"header": "IN DATE"},
                    {"header": "MFG DATE"},
                    {"header": "CONDITION"},
                    {"header": "APROXX AMT."},
                    {"header": "APPROVAL DATE"},
                    {"header": "APP. AMT."},
                    {"header": "REPAIR DATE"},
                ],
            },
        )
        zim_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_zim_inward_report_wb(
    inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/zim_inward_report_{date}{time}.xlsx"
        )
        zim_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = zim_workbook.add_worksheet("INWARD")
        zim_merge_format = get_merge_format(zim_workbook)
        zim_merge_format2 = get_merge_format2(zim_workbook)
        zim_merge_format3 = get_merge_format3(zim_workbook)
        inward_sheet.merge_range("A1:U2", user_data["company_name"], zim_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            zim_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", zim_merge_format3)
        inward_sheet.merge_range("A5:U5", None, zim_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : ZIM", zim_merge_format3)
        inward_sheet.merge_range("A7:U7", None, zim_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            zim_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, zim_merge_format3)
        inward_sheet.merge_range("A10:U10", None, zim_merge_format3)

        inward_sheet.add_table(
            f"A12:I{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "S.NO."},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "FDS/IN"},
                    {"header": "FROM"},
                    {"header": "G.WT."},
                    {"header": "T.WT."},
                    {"header": "N.WT."},
                    {"header": "CONDITION"},
                ],
            },
        )

        zim_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_zim_outward_report_wb(
    outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/zim_outward_report_{date}{time}.xlsx"
        )
        zim_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = zim_workbook.add_worksheet("OUTWARD")
        zim_merge_format = get_merge_format(zim_workbook)
        zim_merge_format2 = get_merge_format2(zim_workbook)
        zim_merge_format3 = get_merge_format3(zim_workbook)
        outward_sheet.merge_range("A1:U2", user_data["company_name"], zim_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            zim_merge_format2,
        )

        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUTWARD", zim_merge_format3)
        outward_sheet.merge_range("A5:U5", None, zim_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : ZIM", zim_merge_format3)
        outward_sheet.merge_range("A7:U7", None, zim_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            zim_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, zim_merge_format3)
        outward_sheet.merge_range("A10:U10", None, zim_merge_format3)

        outward_sheet.add_table(
            f"A12:H{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "S.NO."},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "FS/OUT"},
                    {"header": "SHIPPER"},
                    {"header": "DESTINATION"},
                    {"header": "SEAL NUMBER"},
                    {"header": "BOOKING NO"},
                ],
            },
        )

        zim_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_cma_daily_report_wb(
    user_data,
    inventory_df_data,
    inward_df_data,
    outward_df_data,
    summary_df_data,
    allotment_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/cma_daily_report_{date}{time}.xlsx"
        )
        cma_workbook = xlsxwriter.Workbook(temp_file_path)
        summary_sheet = cma_workbook.add_worksheet("SUMMARY")
        allotment_sheet = cma_workbook.add_worksheet("ALLOTED")
        inventory_sheet = cma_workbook.add_worksheet("EMPTY INVENTORY")
        inward_sheet = cma_workbook.add_worksheet("EMPTY IN")
        outward_sheet = cma_workbook.add_worksheet("EMPTY OUT")
        cma_merge_format = cma_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "black",
                "font_size": 18,
            }
        )
        cma_merge_format3 = get_merge_format3(cma_workbook)
        summary_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )
        summary_sheet.merge_range("A4:U4", "REPORT NAME : SUMMARY", cma_merge_format3)
        summary_sheet.merge_range("A5:U5", None, cma_merge_format3)
        summary_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        summary_sheet.merge_range("A7:U7", None, cma_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, cma_merge_format3)
        summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        summary_sheet.add_table(
            f"A12:M{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "STAT"},
                    {"header": "20'_STD"},
                    {"header": "40'_STD"},
                    {"header": "20'_HQ"},
                    {"header": "40'_HQ"},
                    {"header": "20'_R/F"},
                    {"header": "40'_R/F"},
                    {"header": "20'_R/HC"},
                    {"header": "40'_R/HC"},
                    {"header": "20'_O/TOP"},
                    {"header": "40'_O/TOP"},
                    {"header": "20'_F/RACK"},
                    {"header": "40'_F/RACK"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        allotment_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )

        allotment_sheet.merge_range(
            "A4:U4", "REPORT NAME : ALLOTMENT", cma_merge_format3
        )
        allotment_sheet.merge_range("A5:U5", None, cma_merge_format3)
        allotment_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        allotment_sheet.merge_range("A7:U7", None, cma_merge_format3)
        allotment_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        allotment_sheet.merge_range("A9:U9", None, cma_merge_format3)
        allotment_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        allotment_sheet.add_table(
            f"A12:F{12 + len(allotment_df_data)}",
            {
                "data": allotment_df_data,
                "columns": [
                    {"header": "Sr.No."},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "ALLOTMENT DATE"},
                    {"header": "BOOKING NO"},
                    {"header": "Remarks"},
                ],
            },
        )

        inventory_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )

        inventory_sheet.merge_range(
            "A4:U4", "REPORT NAME : INVENTORY", cma_merge_format3
        )
        inventory_sheet.merge_range("A5:U5", None, cma_merge_format3)
        inventory_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        inventory_sheet.merge_range("A7:U7", None, cma_merge_format3)
        inventory_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        inventory_sheet.merge_range("A9:U9", None, cma_merge_format3)
        inventory_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        inventory_sheet.add_table(
            f"A12:K{12 + len(inventory_df_data)}",
            {
                "data": inventory_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Gate In Date"},
                    {"header": "Gate In Time"},
                    {"header": "LINE"},
                    {"header": "Condition"},
                    {"header": "CATEGORY"},
                    {"header": "LOCATION"},
                    {"header": "TRANSPORTER"},
                    {"header": "Remarks"},
                    {"header": "DAYS"},
                ],
            },
        )

        inward_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )
        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", cma_merge_format3)
        inward_sheet.merge_range("A5:U5", None, cma_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        inward_sheet.merge_range("A7:U7", None, cma_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, cma_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:I{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Date of Reporting"},
                    {"header": "Container No"},
                    {"header": "SIZE"},
                    {"header": "Gate In Date"},
                    {"header": "TIME"},
                    {"header": "LINE"},
                    {"header": "Condition"},
                    {"header": "Remarks"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )
        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUTWARD", cma_merge_format3)
        outward_sheet.merge_range("A5:U5", None, cma_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        outward_sheet.merge_range("A7:U7", None, cma_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, cma_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:J{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Date of Reporting"},
                    {"header": "Container No"},
                    {"header": "SIZE"},
                    {"header": "Gate Out Date"},
                    {"header": "TIME"},
                    {"header": "LINE"},
                    {"header": "Condition"},
                    {"header": "BOOKING NO"},
                    {"header": "Remarks"},
                ],
            },
        )
        cma_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_cma_inward_report_wb(
    user_data, inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/cma_inward_report_{date}{time}.xlsx"
        )
        cma_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = cma_workbook.add_worksheet("EMPTY INVENTORY")
        cma_merge_format = cma_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "black",
                "font_size": 18,
            }
        )
        cma_merge_format3 = get_merge_format3(cma_workbook)

        inward_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )
        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", cma_merge_format3)
        inward_sheet.merge_range("A5:U5", None, cma_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        inward_sheet.merge_range("A7:U7", None, cma_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, cma_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:I{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Date of Reporting"},
                    {"header": "Container No"},
                    {"header": "SIZE"},
                    {"header": "Gate In Date"},
                    {"header": "TIME"},
                    {"header": "LINE"},
                    {"header": "Condition"},
                    {"header": "Remarks"},
                ],
            },
        )
        cma_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_cma_outward_report_wb(
    user_data, outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/cma_outward_report_{date}{time}.xlsx"
        )
        cma_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = cma_workbook.add_worksheet("EMPTY OUT")
        cma_merge_format = cma_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "black",
                "font_size": 18,
            }
        )
        cma_merge_format3 = get_merge_format3(cma_workbook)
        outward_sheet.merge_range(
            "A1:U3",
            f"{user_data['company_name']} - {user_data['site_code']}",
            cma_merge_format,
        )
        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUTWARD", cma_merge_format3)
        outward_sheet.merge_range("A5:U5", None, cma_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : CMA", cma_merge_format3)
        outward_sheet.merge_range("A7:U7", None, cma_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            cma_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, cma_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            cma_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:J{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Date of Reporting"},
                    {"header": "Container No"},
                    {"header": "SIZE"},
                    {"header": "Gate Out Date"},
                    {"header": "TIME"},
                    {"header": "LINE"},
                    {"header": "Condition"},
                    {"header": "BOOKING NO"},
                    {"header": "Remarks"},
                ],
            },
        )
        cma_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_daily_report_wb(
    user_data,
    stock_df_data,
    inward_df_data,
    outward_df_data,
    summary_df_data,
    status_df_data,
    seal_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_daily_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        stock_sheet = msc_workbook.add_worksheet("DAILY STOCK")
        inward_sheet = msc_workbook.add_worksheet("IN REPORT")
        outward_sheet = msc_workbook.add_worksheet("OUT REPORT")
        status_sheet = msc_workbook.add_worksheet("STATUS")
        summary_sheet = msc_workbook.add_worksheet("SUMMARY")
        seal_sheet = msc_workbook.add_worksheet("SEAL DETAILS")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        stock_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        stock_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : DAILY STOCK", msc_merge_format3)
        stock_sheet.merge_range("A5:U5", None, msc_merge_format3)
        stock_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        stock_sheet.merge_range("A7:U7", None, msc_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, msc_merge_format3)
        stock_sheet.merge_range("A10:U10", None, msc_merge_format3)

        stock_sheet.add_table(
            f"A12:N{12 + len(stock_df_data[0])}",
            {
                "data": stock_df_data[0],
                "columns": [
                    {"header": "STOCK"},
                    {"header": "20'_GOH"},
                    {"header": "40'_GOH"},
                    {"header": "20'_DV"},
                    {"header": "40'_DV"},
                    {"header": "20'_HD"},
                    {"header": "40'_HD"},
                    {"header": "20'_HC"},
                    {"header": "40'_HC"},
                    {"header": "20'_OT"},
                    {"header": "40'_OT"},
                    {"header": "20'_FR"},
                    {"header": "40'_FR"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        stock_sheet.add_table(
            f"A{15 + len(stock_df_data[0])}:C{15 + len(stock_df_data[0]) + len(stock_df_data[1])}",
            {
                "data": stock_df_data[1],
                "columns": [{"header": "CAL"}, {"header": "IN"}, {"header": "OUT"}],
                "first_column": True,
                "autofilter": False,
            },
        )

        inward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", msc_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        inward_sheet.add_table(
            f"A12:N{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "SR NO"},
                    {"header": "CONT. NO"},
                    {"header": "SZ/TY"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "SHIPPING LINE"},
                    {"header": "FROM"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "GROSS WT"},
                    {"header": "TARE WT"},
                    {"header": "PAYLOAD"},
                    {"header": "CONDITION"},
                    {"header": "REMARK"},
                ],
            },
        )

        outward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUTWARD", msc_merge_format3)
        outward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        outward_sheet.add_table(
            f"A12:M{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "SR NO"},
                    {"header": "CONT. NO"},
                    {"header": "SZ/TY"},
                    {"header": "SHIPPING LINE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "SHIPPER"},
                    {"header": "DESTINATATION"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "BOOKING NO"},
                    {"header": "SEAL NO"},
                    {"header": "AVALIBLE SEAL"},
                ],
            },
        )

        status_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        status_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        status_sheet.merge_range("A4:U4", "REPORT NAME : STATUS", msc_merge_format3)
        status_sheet.merge_range("A5:U5", None, msc_merge_format3)
        status_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        status_sheet.merge_range("A7:U7", None, msc_merge_format3)
        status_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        status_sheet.merge_range("A9:U9", None, msc_merge_format3)
        status_sheet.merge_range("A10:U10", None, msc_merge_format3)

        status_sheet.add_table(
            f"A12:K{12 + len(status_df_data)}",
            {
                "data": status_df_data,
                "columns": [
                    {"header": "SR NO"},
                    {"header": "CONT. NO"},
                    {"header": "SIZE"},
                    {"header": "IN DATE"},
                    {"header": "CONDITION"},
                    {"header": "APP / DATE"},
                    {"header": "AV/ DATE"},
                    {"header": "STATUS"},
                    {"header": "SHIPPING LINE"},
                    {"header": "ACCOUNT"},
                    {"header": "DAYS"},
                ],
            },
        )

        summary_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        summary_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        summary_sheet.merge_range("A4:U4", "REPORT NAME : SUMMARY", msc_merge_format3)
        summary_sheet.merge_range("A5:U5", None, msc_merge_format3)
        summary_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        summary_sheet.merge_range("A7:U7", None, msc_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, msc_merge_format3)
        summary_sheet.merge_range("A10:U10", None, msc_merge_format3)

        summary_sheet.add_table(
            f"A12:N{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "STOCK"},
                    {"header": "20'_STD"},
                    {"header": "40'_STD"},
                    {"header": "20'_DV"},
                    {"header": "40'_DV"},
                    {"header": "20'_HT"},
                    {"header": "40'_HT"},
                    {"header": "20'_HC"},
                    {"header": "40'_HC"},
                    {"header": "20'_OT"},
                    {"header": "40'_OT"},
                    {"header": "20'_FR"},
                    {"header": "40'_FR"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        seal_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        seal_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        seal_sheet.merge_range("A4:U4", "REPORT NAME : SEAL", msc_merge_format3)
        seal_sheet.merge_range("A5:U5", None, msc_merge_format3)
        seal_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        seal_sheet.merge_range("A7:U7", None, msc_merge_format3)
        seal_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        seal_sheet.merge_range("A9:U9", None, msc_merge_format3)
        seal_sheet.merge_range("A10:U10", None, msc_merge_format3)

        seal_sheet.add_table(
            f"A12:F{12 + len(seal_df_data)}",
            {
                "data": seal_df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "SEAL NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "BOOKING NO"},
                    {"header": "REMARKS"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_inward_report_wb(
    inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_inward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_workbook.add_worksheet("IN REPORT")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        inward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", msc_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        inward_sheet.add_table(
            f"A12:N{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "SR NO"},
                    {"header": "CONT. NO"},
                    {"header": "SZ/TY"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "SHIPPING LINE"},
                    {"header": "FROM"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "GROSS WT"},
                    {"header": "TARE WT"},
                    {"header": "PAYLOAD"},
                    {"header": "CONDITION"},
                    {"header": "REMARK"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_outward_report_wb(
    outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_outward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msc_workbook.add_worksheet("OUT REPORT")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        outward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUTWARD", msc_merge_format3)
        outward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        outward_sheet.add_table(
            f"A12:M{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "SR NO"},
                    {"header": "CONT. NO"},
                    {"header": "SZ/TY"},
                    {"header": "SHIPPING LINE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "SHIPPER"},
                    {"header": "DESTINATATION"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "BOOKING NO"},
                    {"header": "SEAL NO"},
                    {"header": "AVALIBLE SEAL"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_amd_daily_report_wb(
    inward_df_data,
    outward_df_data,
    summary_df_data,
    stock_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_amd_daily_report_{date}{time}.xlsx"
        )
        msc_amd_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_amd_workbook.add_worksheet("IN")
        outward_sheet = msc_amd_workbook.add_worksheet("OUT")
        summary_sheet = msc_amd_workbook.add_worksheet("SUMMARY")
        stock_sheet = msc_amd_workbook.add_worksheet("STOCK")
        msc_amd_merge_format = get_merge_format(msc_amd_workbook)
        msc_amd_merge_format3 = get_merge_format3(msc_amd_workbook)

        inward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_amd_merge_format
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN", msc_amd_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_amd_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_amd_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_amd_merge_format3)
        inward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard", msc_amd_merge_format3
        )
        inward_sheet.merge_range("A9:U9", None, msc_amd_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_amd_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:N{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "InDate"},
                    {"header": "InTime"},
                    {"header": "MFG Year"},
                    {"header": "GR. WT"},
                    {"header": "Pay Load"},
                    {"header": "Location"},
                    {"header": "Transporter"},
                    {"header": "Vehicle No"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_amd_merge_format
        )

        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUT", msc_amd_merge_format3)
        outward_sheet.merge_range("A5:U5", None, msc_amd_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_amd_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_amd_merge_format3)
        outward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard", msc_amd_merge_format3
        )
        outward_sheet.merge_range("A9:U9", None, msc_amd_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_amd_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:R{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Out Date"},
                    {"header": "Out Time"},
                    {"header": "Booking No"},
                    {"header": "Booking Party"},
                    {"header": "Shipper Name"},
                    {"header": "Port Of Loading"},
                    {"header": "Port Of Discharge"},
                    {"header": "Place"},
                    {"header": "Place of Delivery"},
                    {"header": "Seal No"},
                    {"header": "Trailor In"},
                    {"header": "Transporter"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_amd_merge_format
        )
        summary_sheet.merge_range("A4:U10", None, msc_amd_merge_format3)
        summary_sheet.write(
            "A4",
            f"REPORT NAME : SUMMARY\n\nSHIPPING LINE : MSC"
            f"\n\nDEPOT NAME : GHCS Empty Yard"
            f"\n\nREPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        )
        summary_sheet.write("A12", "20'")
        summary_sheet.write("A23", "40'")
        summary_sheet.add_table(
            f"A13:K{13 + len(summary_df_data[0])}",
            {
                "data": summary_df_data[0],
                "columns": [
                    {"header": "TYPE"},
                    {"header": "HC"},
                    {"header": "HREF"},
                    {"header": "REFVEN"},
                    {"header": "FLAT"},
                    {"header": "OPEN"},
                    {"header": "REF"},
                    {"header": "TANK"},
                    {"header": "DRYHT"},
                    {"header": "DRY"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{16 + len(summary_df_data[0])}:K{16 + len(summary_df_data[0]) + len(summary_df_data[1])}",
            {
                "data": summary_df_data[1],
                "columns": [
                    {"header": "TYPE"},
                    {"header": "HC"},
                    {"header": "HREF"},
                    {"header": "REFVEN"},
                    {"header": "FLAT"},
                    {"header": "OPEN"},
                    {"header": "REF"},
                    {"header": "TANK"},
                    {"header": "DRYHT"},
                    {"header": "DRY"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        stock_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_amd_merge_format
        )
        stock_sheet.merge_range("A4:U10", None, msc_amd_merge_format3)
        stock_sheet.write(
            "A4",
            f"REPORT NAME : STOCK\n\nSHIPPING LINE : MSC"
            f"\n\nDEPOT NAME : GHCS Empty Yard"
            f"\n\nREPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        )
        stock_sheet.add_table(
            f"A12:Q{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "CONTAINER"},
                    {"header": "SIZE"},
                    {"header": "M/FDATE"},
                    {"header": "IN DATE"},
                    {"header": "OPR"},
                    {"header": "Location"},
                    {"header": "Transporter"},
                    {"header": "Vehicle No"},
                    {"header": "Pay Load"},
                    {"header": "GR. WT"},
                    {"header": "IN Condition Code"},
                    {"header": "MNR Status"},
                    {"header": "AV Date"},
                    {"header": "Age"},
                    {"header": "ALLOTED"},
                    {"header": "Remarks"},
                ],
            },
        )
        msc_amd_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_amd_inward_report_wb(
    inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_amd_inward_report_{date}{time}.xlsx"
        )
        msc_amd_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_amd_workbook.add_worksheet("IN")
        msc_amd_merge_format = get_merge_format(msc_amd_workbook)
        msc_amd_merge_format3 = get_merge_format3(msc_amd_workbook)

        inward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_amd_merge_format
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN", msc_amd_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_amd_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_amd_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_amd_merge_format3)
        inward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard", msc_amd_merge_format3
        )
        inward_sheet.merge_range("A9:U9", None, msc_amd_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_amd_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:N{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "InDate"},
                    {"header": "InTime"},
                    {"header": "MFG Year"},
                    {"header": "GR. WT"},
                    {"header": "Pay Load"},
                    {"header": "Location"},
                    {"header": "Transporter"},
                    {"header": "Vehicle No"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )
        msc_amd_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_amd_outward_report_wb(
    outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_amd_outward_report_{date}{time}.xlsx"
        )
        msc_amd_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msc_amd_workbook.add_worksheet("OUT")
        msc_amd_merge_format = get_merge_format(msc_amd_workbook)
        msc_amd_merge_format3 = get_merge_format3(msc_amd_workbook)

        outward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_amd_merge_format
        )

        outward_sheet.merge_range("A4:U4", "REPORT NAME : OUT", msc_amd_merge_format3)
        outward_sheet.merge_range("A5:U5", None, msc_amd_merge_format3)
        outward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSC", msc_amd_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_amd_merge_format3)
        outward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard", msc_amd_merge_format3
        )
        outward_sheet.merge_range("A9:U9", None, msc_amd_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_amd_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:R{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Out Date"},
                    {"header": "Out Time"},
                    {"header": "Booking No"},
                    {"header": "Booking Party"},
                    {"header": "Shipper Name"},
                    {"header": "Port Of Loading"},
                    {"header": "Port Of Discharge"},
                    {"header": "Place"},
                    {"header": "Place of Delivery"},
                    {"header": "Seal No"},
                    {"header": "Trailor In"},
                    {"header": "Transporter"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )
        msc_amd_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_tuticorin_daily_report_wb(
    date,
    time,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    stock_av_df_data,
    summary_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_tuticorin_daily_report_on_{date}_{time}.xlsx"
        )
        msc_tuticorin_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_tuticorin_workbook.add_worksheet("Inward")
        outward_sheet = msc_tuticorin_workbook.add_worksheet("Outward")
        stock_sheet = msc_tuticorin_workbook.add_worksheet("Stock")
        stock_av_sheet = msc_tuticorin_workbook.add_worksheet("AV Stock")
        summary_sheet = msc_tuticorin_workbook.add_worksheet("Summary")

        msc_tuticorin_merge_format = get_merge_format(msc_tuticorin_workbook)
        msc_tuticorin_merge_format2 = get_merge_format2(msc_tuticorin_workbook)

        msc_tuticorin_merge_format3 = get_merge_format3(msc_tuticorin_workbook)

        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Inward", msc_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        inward_sheet.add_table(
            f"A12:L{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "TR WEIGHT"},
                    {"header": "MFG DT"},
                    {"header": "VESSEL & VOY"},
                    {"header": "CUSTOMER"},
                    {"header": "TRUCK NO"},
                    {"header": "IMPORT CGO"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Outward", msc_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        outward_sheet.add_table(
            f"A12:K{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "OUT DATE TIME"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "TRUCK NO"},
                    {"header": "CUSTOMER"},
                    {"header": "EXPORT CGO"},
                    {"header": "SEAL NO"},
                    {"header": "BOOKING NO"},
                ],
            },
        )

        stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        stock_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        stock_sheet.merge_range(
            "A4:U4", "REPORT NAME : Stock", msc_tuticorin_merge_format3
        )
        stock_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        stock_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        stock_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        stock_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        stock_sheet.add_table(
            f"A12:O{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "MFG DT"},
                    {"header": "GR WEIGHT"},
                    {"header": "TR WEIGHT"},
                    {"header": "CUSTOMER"},
                    {"header": "IMPORT CGO"},
                    {"header": "AGE"},
                    {"header": "STATUS"},
                    {"header": "AV DATE"},
                    {"header": "PAY LOAD"},
                ],
            },
        )

        stock_av_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        stock_av_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        stock_av_sheet.merge_range(
            "A4:U4", "REPORT NAME : Stock AV", msc_tuticorin_merge_format3
        )
        stock_av_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        stock_av_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        stock_av_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        stock_av_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        stock_av_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        stock_av_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        stock_av_sheet.add_table(
            f"A12:H{12 + len(stock_av_df_data)}",
            {
                "data": stock_av_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "AV DATE"},
                    {"header": "IMPORT CGO"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        summary_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : Summary", msc_tuticorin_merge_format3
        )
        summary_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        summary_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        summary_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        summary_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        summary_sheet.add_table(
            f"A12:E{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "SizeType"},
                    {"header": "OpBal"},
                    {"header": "InQty"},
                    {"header": "OutQty"},
                    {"header": "ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        msc_tuticorin_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_tuticorin_inward_report_wb(
    date,
    time,
    inward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_tuticorin_inward_report_on_{date}_{time}.xlsx"
        )
        msc_tuticorin_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_tuticorin_workbook.add_worksheet("Inward")

        msc_tuticorin_merge_format = get_merge_format(msc_tuticorin_workbook)
        msc_tuticorin_merge_format2 = get_merge_format2(msc_tuticorin_workbook)

        msc_tuticorin_merge_format3 = get_merge_format3(msc_tuticorin_workbook)

        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Inward", msc_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        inward_sheet.add_table(
            f"A12:L{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "TR WEIGHT"},
                    {"header": "MFG DT"},
                    {"header": "VESSEL & VOY"},
                    {"header": "CUSTOMER"},
                    {"header": "TRUCK NO"},
                    {"header": "IMPORT CGO"},
                ],
            },
        )
        msc_tuticorin_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_tuticorin_outward_report_wb(
    date,
    time,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_tuticorin_outward_report_on_{date}_{time}.xlsx"
        )
        msc_tuticorin_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msc_tuticorin_workbook.add_worksheet("Outward")

        msc_tuticorin_merge_format = get_merge_format(msc_tuticorin_workbook)
        msc_tuticorin_merge_format2 = get_merge_format2(msc_tuticorin_workbook)

        msc_tuticorin_merge_format3 = get_merge_format3(msc_tuticorin_workbook)

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msc_tuticorin_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_tuticorin_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Outward", msc_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, msc_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_tuticorin_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_tuticorin_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_tuticorin_merge_format3)

        outward_sheet.add_table(
            f"A12:K{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "OUT DATE TIME"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "TRUCK NO"},
                    {"header": "CUSTOMER"},
                    {"header": "EXPORT CGO"},
                    {"header": "SEAL NO"},
                    {"header": "BOOKING NO"},
                ],
            },
        )
        msc_tuticorin_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_all_line_daily_report_wb(
    user_data,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    summary_df_data,
    summary_b_df_data,
    av_aa_ar_df_data,
    movement_summary_df_data,
    # total_inward_df_data,
    status_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/all_line_daily_report_{date}.xlsx"
        )
        all_line_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = all_line_workbook.add_worksheet("INWARD")
        outward_sheet = all_line_workbook.add_worksheet("OUTWARD")
        stock_sheet = all_line_workbook.add_worksheet("STOCK")
        summary_sheet = all_line_workbook.add_worksheet("SUMMARY A")
        summary_b_sheet = all_line_workbook.add_worksheet("SUMMARY B")
        av_aa_ar_sheet = all_line_workbook.add_worksheet("AV&AA&AR")
        movement_summary_sheet = all_line_workbook.add_worksheet("MOVEMENT_SUMMARY")
        # total_inward_sheet = all_line_workbook.add_worksheet("TOTAL_INWARD")
        status_sheet = all_line_workbook.add_worksheet("STATUS")
        all_line_merge_format = get_merge_format(all_line_workbook)
        all_line_merge_format2 = get_merge_format2(all_line_workbook)
        all_line_merge_format3 = get_merge_format3(all_line_workbook)
        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : INWARD", all_line_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3)
        inward_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:W{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "GateInTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", all_line_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateOutDate"},
                    {"header": "GateOutTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )

        stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        stock_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : STOCK", all_line_merge_format3)
        stock_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        stock_sheet.merge_range("A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3)
        stock_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        stock_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        stock_sheet.add_table(
            f"A12:O{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateInDate"},
                    {"header": "Client"},
                    {"header": "ContainerNo"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Age"},
                    {"header": "Status"},
                    {"header": "Condition"},
                    {"header": "AvailableDate"},
                    {"header": "ApprovalDate"},
                    {"header": "BookingNo"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : SUMMARY", all_line_merge_format3
        )
        summary_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        summary_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        )
        summary_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        summary_sheet.add_table(
            f"A12:E{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "SizeType"},
                    {"header": "OpBal"},
                    {"header": "InQty"},
                    {"header": "OutQty"},
                    {"header": "ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        summary_b_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        summary_b_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        summary_b_sheet.merge_range(
            "A4:U4", "REPORT NAME : SUMMARY B", all_line_merge_format3
        )
        summary_b_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        summary_b_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        )
        summary_b_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        summary_b_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        summary_b_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        summary_b_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        summary_b_sheet.add_table(
            f"A12:L{12 + len(summary_b_df_data[0])}",
            {
                "data": summary_b_df_data[0],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "TOTAL"},
                    # {"header": "REMARKS"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        summary_b_sheet.add_table(
            f"A{15 + len(summary_b_df_data[0])}:E{15 + len(summary_b_df_data[0]) + len(summary_b_df_data[1])}",
            {
                "data": summary_b_df_data[1],
                "columns": [
                    {"header": "SizeType"},
                    {"header": "OpBal"},
                    {"header": "InQty"},
                    {"header": "OutQty"},
                    {"header": "ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        av_aa_ar_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        av_aa_ar_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        av_aa_ar_sheet.merge_range(
            "A4:U4", "REPORT NAME : AV&AA&AR", all_line_merge_format3
        )
        av_aa_ar_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        )
        av_aa_ar_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        av_aa_ar_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        av_aa_ar_sheet.add_table(
            f"A12:F{12 + len(av_aa_ar_df_data)}",
            {
                "data": av_aa_ar_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "ContainerNo"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Status"},
                    {"header": "AvailableDate"},
                ],
            },
        )

        movement_summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        movement_summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        movement_summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : MOVEMENT SUMMARY", all_line_merge_format3
        )
        movement_summary_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        movement_summary_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        )
        movement_summary_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        movement_summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        movement_summary_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        movement_summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        movement_summary_sheet.add_table(
            f"A12:E{12 + len(movement_summary_df_data)}",
            {
                "data": movement_summary_df_data,
                "columns": [
                    {"header": "Movement"},
                    {"header": "In-20'"},
                    {"header": "In-40'"},
                    {"header": "Out-20'"},
                    {"header": "Out-40'"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        # total_inward_sheet.merge_range(
        #     "A1:U2", user_data["company_name"], all_line_merge_format
        # )
        # total_inward_sheet.merge_range(
        #     "A3:U3", user_data["company_address"], all_line_merge_format2
        # )

        # total_inward_sheet.merge_range(
        #     "A4:U4", "REPORT NAME : TOTAL INWARD", all_line_merge_format3
        # )
        # total_inward_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        # total_inward_sheet.merge_range(
        #     "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        # )
        # total_inward_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        # total_inward_sheet.merge_range(
        #     "A8:U8",
        #     f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        #     all_line_merge_format3,
        # )
        # total_inward_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        # total_inward_sheet.merge_range(
        #     "A10:U10",
        #     f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        #     all_line_merge_format3,
        # )

        # total_inward_sheet.add_table(
        #     f"A12:O{12 + len(total_inward_df_data)}",
        #     {
        #         "data": total_inward_df_data,
        #         "columns": [
        #             {"header": "Sl.No"},
        #             {"header": "GateInDate"},
        #             {"header": "ContainerNo"},
        #             {"header": "Size"},
        #             {"header": "Type"},
        #             {"header": "Gross Wt"},
        #             {"header": "Tare Wt"},
        #             {"header": "Payload"},
        #             {"header": "MfgDate"},
        #             {"header": "Vessel"},
        #             {"header": "Voyage"},
        #             {"header": "Customer"},
        #             {"header": "VehicleNo"},
        #             {"header": "ImportCargo"},
        #             {"header": "Transporter"},
        #         ],
        #     },
        # )

        status_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        status_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        status_sheet.merge_range(
            "A4:U4", "REPORT NAME : STATUS", all_line_merge_format3
        )
        status_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        status_sheet.merge_range("A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3)
        status_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        status_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        status_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        status_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        status_sheet.add_table(
            f"A12:E{12 + len(status_df_data)}",
            {
                "data": status_df_data,
                "columns": [
                    {"header": "Status"},
                    {"header": "OpBal"},
                    {"header": "InBal"},
                    {"header": "OutBal"},
                    {"header": "CalBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        all_line_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_all_line_inward_report_wb(
    user_data, inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/all_line_inward_report_{date}{time}.xlsx"
        )
        all_line_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = all_line_workbook.add_worksheet("INWARD")
        all_line_merge_format = get_merge_format(all_line_workbook)
        all_line_merge_format2 = get_merge_format2(all_line_workbook)
        all_line_merge_format3 = get_merge_format3(all_line_workbook)
        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : INWARD", all_line_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3)
        inward_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:V{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "GateInTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )
        all_line_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except Exception as e:
        return e


def create_all_line_outward_report_wb(
    user_data, outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/all_line_outward_report_{date}{time}.xlsx"
        )
        all_line_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = all_line_workbook.add_worksheet("OUTWARD")
        all_line_merge_format = get_merge_format(all_line_workbook)
        all_line_merge_format2 = get_merge_format2(all_line_workbook)
        all_line_merge_format3 = get_merge_format3(all_line_workbook)

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], all_line_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], all_line_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", all_line_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, all_line_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : ALL", all_line_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, all_line_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            all_line_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, all_line_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            all_line_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateOutDate"},
                    {"header": "GateOutTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )
        all_line_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_sarjak_tuticorin_daily_report_wb(
    date,
    time,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    stock_av_df_data,
    summary_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/sarjak_tuticorin_daily_report_on_{date}_{time}.xlsx"
        )
        sarjak_tuticorin_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = sarjak_tuticorin_workbook.add_worksheet("Inward")
        outward_sheet = sarjak_tuticorin_workbook.add_worksheet("Outward")
        stock_sheet = sarjak_tuticorin_workbook.add_worksheet("Stock")
        stock_av_sheet = sarjak_tuticorin_workbook.add_worksheet("AV Stock")
        summary_sheet = sarjak_tuticorin_workbook.add_worksheet("Summary")

        sarjak_tuticorin_merge_format = get_merge_format(sarjak_tuticorin_workbook)
        sarjak_tuticorin_merge_format2 = get_merge_format2(sarjak_tuticorin_workbook)

        sarjak_tuticorin_merge_format3 = get_merge_format3(sarjak_tuticorin_workbook)

        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Inward", sarjak_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        inward_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        inward_sheet.add_table(
            f"A12:AI{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "GP NO"},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "LINE"},
                    {"header": "CUSTOMER"},
                    {"header": "SHIPPER"},
                    {"header": "MOVEMENT"},
                    {"header": "PLACE"},
                    {"header": "VESSEL NAME"},
                    {"header": "VOYAGE"},
                    {"header": "VESSEL & VOY"},
                    {"header": "TRANSPORTER"},
                    {"header": "TRUCK NO"},
                    {"header": "IMPORT CGO"},
                    {"header": "BL NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "SIZE"},
                    {"header": "TYPE"},
                    {"header": "MTY/LDN"},
                    {"header": "GR WEIGHT"},
                    {"header": "TR WEIGHT"},
                    {"header": "PAY LOAD"},
                    {"header": "CBM"},
                    {"header": "MFG DT"},
                    {"header": "GRADE"},
                    {"header": "STATUS"},
                    {"header": "ACTION"},
                    {"header": "REMARKS"},
                    {"header": "DONT LIFT"},
                    {"header": "PREFIX"},
                    {"header": "SUFFIX"},
                    {"header": "YARD ID"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Outward", sarjak_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        outward_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        outward_sheet.add_table(
            f"A12:AG{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "GP NO"},
                    {"header": "OUT DATE TIME"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "LINE"},
                    {"header": "CUSTOMER"},
                    {"header": "SHIPPER"},
                    {"header": "MOVEMENT"},
                    {"header": "PLACE"},
                    {"header": "VESSEL NAME"},
                    {"header": "VOYAGE"},
                    {"header": "VESSEL & VOY"},
                    {"header": "TRANSPORTER"},
                    {"header": "TRUCK NO"},
                    {"header": "EXPORT CGO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "SIZE"},
                    {"header": "TYPE"},
                    {"header": "MTY/LDN"},
                    {"header": "PREFIX"},
                    {"header": "SUFFIX"},
                    {"header": "PAY LOAD"},
                    {"header": "CBM"},
                    {"header": "GRADE"},
                    {"header": "BOOKING NO"},
                    {"header": "SEAL NO"},
                    {"header": "STATUS"},
                    {"header": "REMARKS"},
                    {"header": "TRUCK IN"},
                    {"header": "ARRIVED ON"},
                    {"header": "MFG DT"},
                ],
            },
        )

        stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        stock_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        stock_sheet.merge_range(
            "A4:U4", "REPORT NAME : Stock", sarjak_tuticorin_merge_format3
        )
        stock_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        stock_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        stock_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        stock_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        stock_sheet.add_table(
            f"A12:AK{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "GP NO"},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "LINE"},
                    {"header": "CUSTOMER"},
                    {"header": "SHIPPER"},
                    {"header": "MOVEMENT"},
                    {"header": "PLACE"},
                    {"header": "VESSEL NAME"},
                    {"header": "VOYAGE"},
                    {"header": "VESSEL & VOY"},
                    {"header": "TRANSPORTER"},
                    {"header": "TRUCK NO"},
                    {"header": "IMPORT CGO"},
                    {"header": "BL NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "SIZE"},
                    {"header": "MTY/LDN"},
                    {"header": "GR WEIGHT"},
                    {"header": "TR WEIGHT"},
                    {"header": "PAY LOAD"},
                    {"header": "CBM"},
                    {"header": "MFG DT"},
                    {"header": "GRADE"},
                    {"header": "STATUS"},
                    {"header": "ACTION"},
                    {"header": "REMARKS"},
                    {"header": "TYPE"},
                    {"header": "AGE"},
                    {"header": "AV DATE"},
                    {"header": "DONT LIFT"},
                    {"header": "PREFIX"},
                    {"header": "SUFFIX"},
                    {"header": "INSTRUCTION"},
                ],
            },
        )

        stock_av_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        stock_av_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        stock_av_sheet.merge_range(
            "A4:U4", "REPORT NAME : Stock AV", sarjak_tuticorin_merge_format3
        )
        stock_av_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        stock_av_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        stock_av_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        stock_av_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        stock_av_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        stock_av_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        stock_av_sheet.add_table(
            f"A12:AE{12 + len(stock_av_df_data)}",
            {
                "data": stock_av_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "GP NO"},
                    {"header": "IN DATE TIME"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "LINE"},
                    {"header": "CUSTOMER"},
                    {"header": "SHIPPER"},
                    {"header": "MOVEMENT"},
                    {"header": "PLACE"},
                    {"header": "VESSEL NAME"},
                    {"header": "VOYAGE"},
                    {"header": "TRANSPORTER"},
                    {"header": "TRUCK NO"},
                    {"header": "IMPORT CGO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "SIZE"},
                    {"header": "TYPE"},
                    {"header": "MTY/LDN"},
                    {"header": "GR WEIGHT"},
                    {"header": "TR WEIGHT"},
                    {"header": "CBM"},
                    {"header": "MFG DT"},
                    {"header": "GRADE"},
                    {"header": "STATUS"},
                    {"header": "ACTION"},
                    {"header": "REMARKS"},
                    {"header": "AV DATE"},
                    {"header": "PREFIX"},
                    {"header": "SUFFIX"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        summary_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : Summary", sarjak_tuticorin_merge_format3
        )
        summary_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        summary_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        summary_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        summary_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        summary_sheet.add_table(
            f"A12:E{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "SizeType"},
                    {"header": "OpBal"},
                    {"header": "InQty"},
                    {"header": "OutQty"},
                    {"header": "ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        sarjak_tuticorin_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_sarjak_tuticorin_inward_report_wb(
    date,
    time,
    inward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/sarjak_tuticorin_inward_report_on_{date}_{time}.xlsx"
        )
        sarjak_tuticorin_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = sarjak_tuticorin_workbook.add_worksheet("Inward")

        sarjak_tuticorin_merge_format = get_merge_format(sarjak_tuticorin_workbook)
        sarjak_tuticorin_merge_format2 = get_merge_format2(sarjak_tuticorin_workbook)

        sarjak_tuticorin_merge_format3 = get_merge_format3(sarjak_tuticorin_workbook)

        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Inward", sarjak_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        inward_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        inward_sheet.add_table(
            f"A12:AI{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "GP NO"},
                    {"header": "IN DATE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "LINE"},
                    {"header": "CUSTOMER"},
                    {"header": "SHIPPER"},
                    {"header": "MOVEMENT"},
                    {"header": "PLACE"},
                    {"header": "VESSEL NAME"},
                    {"header": "VOYAGE"},
                    {"header": "VESSEL & VOY"},
                    {"header": "TRANSPORTER"},
                    {"header": "TRUCK NO"},
                    {"header": "IMPORT CGO"},
                    {"header": "BL NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "SIZE"},
                    {"header": "TYPE"},
                    {"header": "MTY/LDN"},
                    {"header": "GR WEIGHT"},
                    {"header": "TR WEIGHT"},
                    {"header": "PAY LOAD"},
                    {"header": "CBM"},
                    {"header": "MFG DT"},
                    {"header": "GRADE"},
                    {"header": "STATUS"},
                    {"header": "ACTION"},
                    {"header": "REMARKS"},
                    {"header": "DONT LIFT"},
                    {"header": "PREFIX"},
                    {"header": "SUFFIX"},
                    {"header": "YARD ID"},
                ],
            },
        )
        sarjak_tuticorin_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_sarjak_tuticorin_outward_report_wb(
    date,
    time,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/sarjak_tuticorin_outward_report_on_{date}_{time}.xlsx"
        )
        sarjak_tuticorin_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = sarjak_tuticorin_workbook.add_worksheet("Outward")

        sarjak_tuticorin_merge_format = get_merge_format(sarjak_tuticorin_workbook)
        sarjak_tuticorin_merge_format2 = get_merge_format2(sarjak_tuticorin_workbook)

        sarjak_tuticorin_merge_format3 = get_merge_format3(sarjak_tuticorin_workbook)

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], sarjak_tuticorin_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            sarjak_tuticorin_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : Outward", sarjak_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, sarjak_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : SARJAK", sarjak_tuticorin_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, sarjak_tuticorin_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            sarjak_tuticorin_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, sarjak_tuticorin_merge_format3)
        outward_sheet.merge_range("A10:U10", None, sarjak_tuticorin_merge_format3)

        outward_sheet.add_table(
            f"A12:AG{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No."},
                    {"header": "GP NO"},
                    {"header": "OUT DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "LINE"},
                    {"header": "CUSTOMER"},
                    {"header": "SHIPPER"},
                    {"header": "MOVEMENT"},
                    {"header": "PLACE"},
                    {"header": "VESSEL NAME"},
                    {"header": "VOYAGE"},
                    {"header": "VESSEL & VOY"},
                    {"header": "TRANSPORTER"},
                    {"header": "TRUCK NO"},
                    {"header": "EXPORT CGO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE TYPE"},
                    {"header": "SIZE"},
                    {"header": "TYPE"},
                    {"header": "MTY/LDN"},
                    {"header": "PREFIX"},
                    {"header": "SUFFIX"},
                    {"header": "PAY LOAD"},
                    {"header": "CBM"},
                    {"header": "GRADE"},
                    {"header": "BOOKING NO"},
                    {"header": "SEAL NO"},
                    {"header": "STATUS"},
                    {"header": "REMARKS"},
                    {"header": "TRUCK IN"},
                    {"header": "ARRIVED ON"},
                    {"header": "MFG DT"},
                ],
            },
        )
        sarjak_tuticorin_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_generic_inghk_inghc_daily_report_wb(
    user_data,
    stock_df_data,
    inward_df_data,
    outward_df_data,
    summary_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/generic_inghk_inghc_daily_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        stock_sheet = msc_workbook.add_worksheet("INVENTORY")
        inward_sheet = msc_workbook.add_worksheet("IN REPORT")
        outward_sheet = msc_workbook.add_worksheet("OUT REPORT")
        summary_sheet = msc_workbook.add_worksheet("SUMMARY")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        stock_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        stock_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : INVENTORY", msc_merge_format3)
        stock_sheet.merge_range("A5:U5", None, msc_merge_format3)
        stock_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        stock_sheet.merge_range("A7:U7", None, msc_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, msc_merge_format3)
        stock_sheet.merge_range("A10:U10", None, msc_merge_format3)

        stock_sheet.add_table(
            f"A12:AJ{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "ACCOUNT"},
                    {"header": "B/L NO"},
                    {"header": "TRANSPORTER"},
                    {"header": "MFG.DATE"},
                    {"header": "GROSS.WT"},
                    {"header": "TARE.WT"},
                    {"header": "PAY LOAD"},
                    {"header": "HD/NR"},
                    {"header": "CARGO"},
                    {"header": "Survey Date"},
                    {"header": "EST DATE"},
                    {"header": "Estimate No"},
                    {"header": "Damage Grade"},
                    {"header": "MAN HRS"},
                    {"header": "LBR COST"},
                    {"header": "MTRL COST"},
                    {"header": "WASH. AMT"},
                    {"header": "TOTAL COST"},
                    {"header": "APPROVAL Dt"},
                    {"header": "AV/ DATE"},
                    {"header": "EMPTY ALLOTMENT/DATE"},
                    {"header": "ALLOTMENT/DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "SHIPPER"},
                    {"header": "D. O. NO"},
                    {"header": "VEHICLE NO"},
                    {"header": "STATUS"},
                    {"header": "OTL"},
                    {"header": "No. of Days"},
                ],
            },
        )

        inward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN REPORT", msc_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        inward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        inward_sheet.add_table(
            f"A12:O{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "ACCOUNT"},
                    {"header": "B/L NO"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "MFG.DATE"},
                    {"header": "GROSS.WT"},
                    {"header": "TARE.WT"},
                    {"header": "PAY LOAD"},
                    {"header": "CARGO"},
                ],
            },
        )

        outward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUT REPORT", msc_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        outward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        outward_sheet.add_table(
            f"A12:Q{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "SHIPPING LINE"},
                    {"header": "IN DATE"},
                    {"header": "APPROVAL DATE"},
                    {"header": "AV/ DATE"},
                    {"header": "EMPTY ALLOTMENT/DATE"},
                    {"header": "ALLOTMENT/DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "TRANSPORTER"},
                    {"header": "SHIPPER"},
                    {"header": "D. O. NO."},
                    {"header": "VEHICLE NO"},
                    {"header": "STATUS"},
                    {"header": "OTL"},
                ],
            },
        )

        summary_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        summary_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        summary_sheet.merge_range("A4:U4", "REPORT NAME : SUMMARY", msc_merge_format3)
        summary_sheet.merge_range("A5:U5", None, msc_merge_format3)
        summary_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        summary_sheet.merge_range("A7:U7", None, msc_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, msc_merge_format3)
        summary_sheet.merge_range("A10:U10", None, msc_merge_format3)

        summary_sheet.add_table(
            f"A12:M{12 + len(summary_df_data[0])}",
            {
                "data": summary_df_data[0],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "TOTAL"},
                    {"header": "REMARKS"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{15 + len(summary_df_data[0])}:L{15 + len(summary_df_data[0]) + len(summary_df_data[1])}",
            {
                "data": summary_df_data[1],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{18 + len(summary_df_data[0]) + len(summary_df_data[1])}:D{18 + len(summary_df_data[0]) + len(summary_df_data[1]) + len(summary_df_data[2])}",
            {
                "data": summary_df_data[2],
                "columns": [
                    {"header": "Stat"},
                    {"header": "READY CONDICTION 20'"},
                    {"header": "READY CONDICTION 40'"},
                    {"header": "TOTAL'"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{(21 + len(summary_df_data[0]) + len(summary_df_data[1]) + len(summary_df_data[2]))}:L{21 + len(summary_df_data[0]) + len(summary_df_data[1]) + len(summary_df_data[2])  + len(summary_df_data[3])}",
            {
                "data": summary_df_data[3],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_generic_inghk_inghc_inward_report_wb(
    user_data,
    inward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/generic_inghk_inghc_inward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_workbook.add_worksheet("IN REPORT")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        inward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN REPORT", msc_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        inward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        inward_sheet.add_table(
            f"A12:O{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "ACCOUNT"},
                    {"header": "B/L NO"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "MFG.DATE"},
                    {"header": "GROSS.WT"},
                    {"header": "TARE.WT"},
                    {"header": "PAY LOAD"},
                    {"header": "CARGO"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_generic_inghk_inghc_outward_report_wb(
    user_data,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/generic_inghk_inghc_outward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msc_workbook.add_worksheet("OUT REPORT")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        outward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUT REPORT", msc_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        outward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        outward_sheet.add_table(
            f"A12:Q{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "SHIPPING LINE"},
                    {"header": "IN DATE"},
                    {"header": "APPROVAL DATE"},
                    {"header": "AV/ DATE"},
                    {"header": "EMPTY ALLOTMENT/DATE"},
                    {"header": "ALLOTMENT/DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "TRANSPORTER"},
                    {"header": "SHIPPER"},
                    {"header": "D. O. NO."},
                    {"header": "VEHICLE NO"},
                    {"header": "STATUS"},
                    {"header": "OTL"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_handling_revenue_report_wb(
    line,
    revenue_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/handling_revenue_report_{date}{time}.xlsx"
        )
        revenue_workbook = xlsxwriter.Workbook(temp_file_path)
        revenue_sheet = revenue_workbook.add_worksheet("REVENUE_REPORT")

        revenue_merge_format = get_merge_format(revenue_workbook)
        revenue_merge_format2 = get_merge_format2(revenue_workbook)
        revenue_merge_format3 = get_merge_format3(revenue_workbook)

        revenue_sheet.merge_range(
            "A1:U2", user_data["company_name"], revenue_merge_format
        )
        revenue_sheet.merge_range(
            "A3:U3",
            None,
            revenue_merge_format2,
        )

        revenue_sheet.merge_range(
            "A4:U4", "REPORT NAME : HANDLING REVENUE REPORT", revenue_merge_format3
        )
        revenue_sheet.merge_range("A5:U5", None, revenue_merge_format3)
        revenue_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", revenue_merge_format3
        )
        revenue_sheet.merge_range("A7:U7", None, revenue_merge_format3)
        revenue_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            revenue_merge_format3,
        )
        revenue_sheet.merge_range("A9:U9", None, revenue_merge_format3)
        revenue_sheet.merge_range("A10:U10", None, revenue_merge_format3)

        revenue_sheet.add_table(
            f"A12:Q{12 + len(revenue_df_data)}",
            {
                "data": revenue_df_data,
                "columns": [
                    {"header": "SrNo"},
                    {"header": "Container No"},
                    {"header": "Size/Type"},
                    {"header": "IN Date"},
                    {"header": "Out Date"},
                    {"header": "Receipt No"},
                    {"header": "Invoice No"},
                    {"header": "Line"},
                    {"header": "Apply Charges To"},
                    {"header": "Transporter"},
                    {"header": "Receipt Amount"},
                    {"header": "Receipt Date"},
                    {"header": "Payment Mode"},
                    {"header": "Payment Type"},
                    {"header": "Cheque/NEFT No"},
                    {"header": "Remarks"},
                    {"header": "PD Balance"},
                ],
            },
        )
        revenue_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_self_transportation_revenue_report_wb(
    line,
    revenue_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/self_transportation_revenue_report_{date}{time}.xlsx"
        )
        revenue_workbook = xlsxwriter.Workbook(temp_file_path)
        revenue_sheet = revenue_workbook.add_worksheet("REVENUE_REPORT")

        revenue_merge_format = get_merge_format(revenue_workbook)
        revenue_merge_format2 = get_merge_format2(revenue_workbook)
        revenue_merge_format3 = get_merge_format3(revenue_workbook)

        revenue_sheet.merge_range(
            "A1:U2", user_data["company_name"], revenue_merge_format
        )
        revenue_sheet.merge_range(
            "A3:U3",
            None,
            revenue_merge_format2,
        )

        revenue_sheet.merge_range(
            "A4:U4",
            "REPORT NAME : TRANSPORTATION REVENUE REPORT",
            revenue_merge_format3,
        )
        revenue_sheet.merge_range("A5:U5", None, revenue_merge_format3)
        revenue_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", revenue_merge_format3
        )
        revenue_sheet.merge_range("A7:U7", None, revenue_merge_format3)
        revenue_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            revenue_merge_format3,
        )
        revenue_sheet.merge_range("A9:U9", None, revenue_merge_format3)
        revenue_sheet.merge_range("A10:U10", None, revenue_merge_format3)

        revenue_sheet.add_table(
            f"A12:Q{12 + len(revenue_df_data)}",
            {
                "data": revenue_df_data,
                "columns": [
                    {"header": "SrNo"},
                    {"header": "Container No"},
                    {"header": "Size/Type"},
                    {"header": "IN Date"},
                    {"header": "Out Date"},
                    {"header": "Receipt No"},
                    {"header": "Invoice No"},
                    {"header": "Line"},
                    {"header": "Apply Charges To"},
                    {"header": "Transporter"},
                    {"header": "Receipt Amount"},
                    {"header": "Receipt Date"},
                    {"header": "Payment Mode"},
                    {"header": "Payment Type"},
                    {"header": "Cheque/NEFT No"},
                    {"header": "Remarks"},
                    {"header": "PD Balance"},
                ],
            },
        )
        revenue_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_sanand_daily_report_wb(
    inward_df_data,
    outward_df_data,
    summary_df_data,
    stock_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_sanand_daily_report_{date}{time}.xlsx"
        )
        msc_sanand_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_sanand_workbook.add_worksheet("IN")
        outward_sheet = msc_sanand_workbook.add_worksheet("OUT")
        summary_sheet = msc_sanand_workbook.add_worksheet("SUMMARY")
        stock_sheet = msc_sanand_workbook.add_worksheet("STOCK")
        msc_sanand_merge_format = get_merge_format(msc_sanand_workbook)
        msc_sanand_merge_format3 = get_merge_format3(msc_sanand_workbook)

        inward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_sanand_merge_format
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN", msc_sanand_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_sanand_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_sanand_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, msc_sanand_merge_format3)
        inward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard- SANAND", msc_sanand_merge_format3
        )
        inward_sheet.merge_range("A9:U9", None, msc_sanand_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_sanand_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:N{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "InDate"},
                    {"header": "InTime"},
                    {"header": "MFG Year"},
                    {"header": "GR. WT"},
                    {"header": "Pay Load"},
                    {"header": "Location"},
                    {"header": "Transporter"},
                    {"header": "Vehicle No"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_sanand_merge_format
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUT", msc_sanand_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_sanand_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_sanand_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, msc_sanand_merge_format3)
        outward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard- SANAND", msc_sanand_merge_format3
        )
        outward_sheet.merge_range("A9:U9", None, msc_sanand_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_sanand_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:R{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Out Date"},
                    {"header": "Out Time"},
                    {"header": "Booking No"},
                    {"header": "Booking Party"},
                    {"header": "Shipper Name"},
                    {"header": "Port Of Loading"},
                    {"header": "Port Of Discharge"},
                    {"header": "Place"},
                    {"header": "Place of Delivery"},
                    {"header": "Seal No"},
                    {"header": "Trailor In"},
                    {"header": "Transporter"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_sanand_merge_format
        )
        summary_sheet.merge_range("A4:U10", None, msc_sanand_merge_format3)
        summary_sheet.write(
            "A4",
            f"REPORT NAME : SUMMARY\n\nSHIPPING LINE : MSC"
            f"\n\nDEPOT NAME : GHCS Empty Yard- SANAND"
            f"\n\nREPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        )
        summary_sheet.write("A12", "20'")
        summary_sheet.write("A23", "40'")
        summary_sheet.add_table(
            f"A13:K{13 + len(summary_df_data[0])}",
            {
                "data": summary_df_data[0],
                "columns": [
                    {"header": "TYPE"},
                    {"header": "HC"},
                    {"header": "HREF"},
                    {"header": "REFVEN"},
                    {"header": "FLAT"},
                    {"header": "OPEN"},
                    {"header": "REF"},
                    {"header": "TANK"},
                    {"header": "DRYHT"},
                    {"header": "DRY"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{16 + len(summary_df_data[0])}:K{16 + len(summary_df_data[0]) + len(summary_df_data[1])}",
            {
                "data": summary_df_data[1],
                "columns": [
                    {"header": "TYPE"},
                    {"header": "HC"},
                    {"header": "HREF"},
                    {"header": "REFVEN"},
                    {"header": "FLAT"},
                    {"header": "OPEN"},
                    {"header": "REF"},
                    {"header": "TANK"},
                    {"header": "DRYHT"},
                    {"header": "DRY"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        stock_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_sanand_merge_format
        )
        stock_sheet.merge_range("A4:U10", None, msc_sanand_merge_format3)
        stock_sheet.write(
            "A4",
            f"REPORT NAME : STOCK\n\nSHIPPING LINE : MSC"
            f"\n\nDEPOT NAME : GHCS Empty Yard- SANAND"
            f"\n\nREPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        )
        stock_sheet.add_table(
            f"A12:Q{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "CONTAINER"},
                    {"header": "SIZE"},
                    {"header": "M/FDATE"},
                    {"header": "IN DATE"},
                    {"header": "OPR"},
                    {"header": "Location"},
                    {"header": "Transporter"},
                    {"header": "Vehicle No"},
                    {"header": "Pay Load"},
                    {"header": "GR. WT"},
                    {"header": "IN Condition Code"},
                    {"header": "MNR Status"},
                    {"header": "AV Date"},
                    {"header": "Age"},
                    {"header": "ALLOTED"},
                    {"header": "Remarks"},
                ],
            },
        )
        msc_sanand_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_sanand_inward_report_wb(
    inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_sanand_inward_report_{date}{time}.xlsx"
        )
        msc_sanand_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_sanand_workbook.add_worksheet("IN")
        msc_sanand_merge_format = get_merge_format(msc_sanand_workbook)
        msc_sanand_merge_format3 = get_merge_format3(msc_sanand_workbook)

        inward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_sanand_merge_format
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN", msc_sanand_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_sanand_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_sanand_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, msc_sanand_merge_format3)
        inward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard- SANAND", msc_sanand_merge_format3
        )
        inward_sheet.merge_range("A9:U9", None, msc_sanand_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_sanand_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:N{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE"},
                    {"header": "InDate"},
                    {"header": "InTime"},
                    {"header": "MFG Year"},
                    {"header": "GR. WT"},
                    {"header": "Pay Load"},
                    {"header": "Location"},
                    {"header": "Transporter"},
                    {"header": "Vehicle No"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )
        msc_sanand_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_sanand_outward_report_wb(
    outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_sanand_outward_report_{date}{time}.xlsx"
        )
        msc_sanand_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msc_sanand_workbook.add_worksheet("OUT")
        msc_sanand_merge_format = get_merge_format(msc_sanand_workbook)
        msc_sanand_merge_format3 = get_merge_format3(msc_sanand_workbook)

        outward_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_sanand_merge_format
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUT", msc_sanand_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_sanand_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_sanand_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, msc_sanand_merge_format3)
        outward_sheet.merge_range(
            "A8:U8", "DEPOT NAME : GHCS Empty Yard- SANAND", msc_sanand_merge_format3
        )
        outward_sheet.merge_range("A9:U9", None, msc_sanand_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_sanand_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:R{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "S.NO"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Out Date"},
                    {"header": "Out Time"},
                    {"header": "Booking No"},
                    {"header": "Booking Party"},
                    {"header": "Shipper Name"},
                    {"header": "Port Of Loading"},
                    {"header": "Port Of Discharge"},
                    {"header": "Place"},
                    {"header": "Place of Delivery"},
                    {"header": "Seal No"},
                    {"header": "Trailor In"},
                    {"header": "Transporter"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "OPR"},
                ],
            },
        )
        msc_sanand_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_repair_completion_report_wb(
    repair_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_repair_completion_report_{date}{time}.xlsx"
        )
        msc_repair_completion_workbook = xlsxwriter.Workbook(temp_file_path)

        msc_repair_completion_sheet = msc_repair_completion_workbook.add_worksheet(
            "Repair"
        )
        msc_merge_format = get_merge_format(msc_repair_completion_workbook)
        msc_merge_format3 = get_merge_format3(msc_repair_completion_workbook)

        msc_repair_completion_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_merge_format
        )

        msc_repair_completion_sheet.merge_range(
            "A4:U4", "REPORT NAME : REPAIR COMPLETION", msc_merge_format3
        )
        msc_repair_completion_sheet.merge_range("A5:U5", None, msc_merge_format3)
        msc_repair_completion_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_merge_format3
        )
        msc_repair_completion_sheet.merge_range("A7:U7", None, msc_merge_format3)
        msc_repair_completion_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        msc_repair_completion_sheet.merge_range("A9:U9", None, msc_merge_format3)

        msc_repair_completion_sheet.add_table(
            f"A12:I{12 + len(repair_df_data)}",
            {
                "data": repair_df_data,
                "columns": [
                    {"header": "Sr No"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Line"},
                    {"header": "Location"},
                    {"header": "Vendor"},
                    {"header": "Repair Date"},
                    {"header": "Grade"},
                    {"header": "Remarks"},
                ],
            },
        )
        msc_repair_completion_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_estimate_report_wb(
    estimate_df_data, from_date_str, from_time_str, to_date_str, to_time_str, user_data
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_estimate_report_{date}{time}.xlsx"
        )
        msc_estimate_workbook = xlsxwriter.Workbook(temp_file_path)

        msc_estimate_sheet = msc_estimate_workbook.add_worksheet("Estimate")
        msc_merge_format = get_merge_format(msc_estimate_workbook)
        msc_merge_format3 = get_merge_format3(msc_estimate_workbook)

        msc_estimate_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_merge_format
        )

        msc_estimate_sheet.merge_range(
            "A4:U4", "REPORT NAME : ESTIMATE", msc_merge_format3
        )
        msc_estimate_sheet.merge_range("A5:U5", None, msc_merge_format3)
        msc_estimate_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_merge_format3
        )
        msc_estimate_sheet.merge_range("A7:U7", None, msc_merge_format3)
        msc_estimate_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        msc_estimate_sheet.merge_range("A9:U9", None, msc_merge_format3)
        msc_estimate_sheet.merge_range(
            "A10:U10",
            f"LABOUR RATE : {estimate_df_data['labour_rate']}",
            msc_merge_format3,
        )
        msc_estimate_sheet.merge_range("A11:U11", None, msc_merge_format3)

        msc_estimate_sheet.add_table(
            f"A12:AD{12 + len(estimate_df_data['df_data'])}",
            {
                "data": estimate_df_data["df_data"],
                "columns": [
                    {"header": "Sr No"},
                    {"header": "Estimate Ref No"},
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
                ],
            },
        )
        msc_estimate_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_approval_report_wb(
    approval_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    user_data,
    is_rejected,
    re_estimated_approval_df_data=None,
):
    try:
        sheet = "Rejected" if is_rejected else "Approved"
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_approval_report_{date}{time}.xlsx"
        )
        msc_approval_workbook = xlsxwriter.Workbook(temp_file_path)

        msc_approval_sheet = msc_approval_workbook.add_worksheet(sheet)
        msc_merge_format = get_merge_format(msc_approval_workbook)
        msc_merge_format3 = get_merge_format3(msc_approval_workbook)

        msc_approval_sheet.merge_range(
            "A1:U3", user_data["company_name"], msc_merge_format
        )

        msc_approval_sheet.merge_range(
            "A4:U4", "REPORT NAME : ESTIMATE", msc_merge_format3
        )
        msc_approval_sheet.merge_range("A5:U5", None, msc_merge_format3)
        msc_approval_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSC", msc_merge_format3
        )
        msc_approval_sheet.merge_range("A7:U7", None, msc_merge_format3)
        msc_approval_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        msc_approval_sheet.merge_range("A9:U9", None, msc_merge_format3)

        msc_approval_sheet.merge_range(
            "A10:U10",
            f"LABOUR RATE : {approval_df_data['labour_rate']}",
            msc_merge_format3,
        )
        msc_approval_sheet.merge_range("A11:U11", None, msc_merge_format3)

        msc_approval_sheet.add_table(
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

        # Re
        if re_estimated_approval_df_data is not None:
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
                "A6:U6", "SHIPPING LINE : MSC", msc_merge_format3
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
                f"LABOUR RATE : {re_estimated_approval_df_data['labour_rate']}",
                msc_merge_format3,
            )
            msc_re_approval_sheet.merge_range("A11:U11", None, msc_merge_format3)

            msc_re_approval_sheet.add_table(
                f"A12:AH{12 + len(re_estimated_approval_df_data['df_data'])}",
                {
                    "data": re_estimated_approval_df_data["df_data"],
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


def create_generic_seal_request_report_wb(
    user_data,
    seal_request_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/seal_request_report_{date}{time}.xlsx"
        )

        seal_request_workbook = xlsxwriter.Workbook(temp_file_path)
        seal_request_sheet = seal_request_workbook.add_worksheet("SEAL REQUEST")
        seal_request_merge_format = get_merge_format(seal_request_workbook)
        seal_request_merge_format2 = get_merge_format2(seal_request_workbook)
        seal_request_merge_format3 = get_merge_format3(seal_request_workbook)

        seal_request_sheet.merge_range(
            "A1:U2", user_data["company_name"], seal_request_merge_format
        )
        seal_request_sheet.merge_range(
            "A3:U3", user_data["company_address"], seal_request_merge_format2
        )

        seal_request_sheet.merge_range(
            "A4:U4", "REPORT NAME : SEAL REQUEST REPORT", seal_request_merge_format3
        )
        seal_request_sheet.merge_range("A5:U5", None, seal_request_merge_format3)
        seal_request_sheet.merge_range(
            "A6:U6",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            seal_request_merge_format3,
        )
        seal_request_sheet.merge_range("A7:U7", None, seal_request_merge_format3)
        seal_request_sheet.merge_range(
            "A8:U8",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            seal_request_merge_format3,
        )
        seal_request_sheet.merge_range("A9:U9", None, seal_request_merge_format3)

        seal_request_sheet.merge_range(
            "A10:U10",
            f"{seal_request_df_data['seal_no_opening']}",
            seal_request_merge_format3,
        )
        seal_request_sheet.merge_range(
            "A11:U11",
            f"{seal_request_df_data['seal_no_closing']}",
            seal_request_merge_format3,
        )
        seal_request_sheet.merge_range(
            "A12:U12",
            f"{seal_request_df_data['seal_no_available']}",
            seal_request_merge_format3,
        )

        seal_request_sheet.add_table(
            f"A14:H{14 + len(seal_request_df_data['df_data'])}",
            {
                "data": seal_request_df_data["df_data"],
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GateOutDate"},
                    {"header": "GateOutTime"},
                    {"header": "SealNo"},
                    {"header": "BookingNo"},
                    {"header": "Transporter"},
                ],
            },
        )
        seal_request_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_generic_seal_report_wb(
    user_data,
    seal_df_data,
    seal_stock_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_daily_report_{date}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        seal_sheet = generic_workbook.add_worksheet("SEAL_DETAILS")
        seal_stock_sheet = generic_workbook.add_worksheet("SEAL_STOCK")

        generic_merge_format = get_merge_format(generic_workbook)
        generic_merge_format2 = get_merge_format2(generic_workbook)
        generic_merge_format3 = get_merge_format3(generic_workbook)

        seal_sheet.merge_range("A1:U2", user_data["company_name"], generic_merge_format)
        seal_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        seal_sheet.merge_range(
            "A4:U4", "REPORT NAME : SEAL REPORT", generic_merge_format3
        )
        seal_sheet.merge_range("A5:U5", None, generic_merge_format3)
        seal_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line.lower()}", generic_merge_format3
        )
        seal_sheet.merge_range("A7:U7", None, generic_merge_format3)
        seal_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        seal_sheet.merge_range("A9:U9", None, generic_merge_format3)
        seal_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )
        seal_sheet.merge_range("A11:U11", None, generic_merge_format3)
        seal_sheet.merge_range(
            "A12:U12",
            f"{seal_df_data['seal_no_opening']}",
            generic_merge_format3,
        )
        seal_sheet.merge_range(
            "A13:U13",
            f"{seal_df_data['seal_no_closing']}",
            generic_merge_format3,
        )
        seal_sheet.merge_range(
            "A14:U14",
            f"{seal_df_data['seal_no_available']}",
            generic_merge_format3,
        )

        seal_sheet.add_table(
            f"A15:E{15 + len(seal_df_data['df_data'])}",
            {
                "data": seal_df_data["df_data"],
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "seal_no"},
                    {"header": "booking_party"},
                    {"header": "booking_no"},
                    {"header": "issued_date"},
                ],
            },
        )

        seal_stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        seal_stock_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        seal_stock_sheet.merge_range(
            "A4:U4", "REPORT NAME : SEAL STOCKS REPORT", generic_merge_format3
        )
        seal_stock_sheet.merge_range("A5:U5", None, generic_merge_format3)
        seal_stock_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line.lower()}", generic_merge_format3
        )
        seal_stock_sheet.merge_range("A7:U7", None, generic_merge_format3)
        seal_stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        seal_stock_sheet.merge_range("A9:U9", None, generic_merge_format3)
        seal_stock_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )
        seal_stock_sheet.merge_range("A11:U11", None, generic_merge_format3)

        seal_stock_sheet.add_table(
            f"A12:B{12 + len(seal_stock_df_data)}",
            {
                "data": seal_stock_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Seal No"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_edi_tracking_report_wb(
    user_data,
    inward_df_data,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
    move_code_tracking=False,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_daily_report_{date}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = generic_workbook.add_worksheet("INWARD")
        outward_sheet = generic_workbook.add_worksheet("OUTWARD")

        generic_merge_format = get_merge_format(generic_workbook)
        generic_merge_format2 = get_merge_format2(generic_workbook)
        generic_merge_format3 = get_merge_format3(generic_workbook)

        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : INWARD", generic_merge_format3)
        inward_sheet.merge_range("A5:U5", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, generic_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )

        if move_code_tracking:
            inward_sheet.add_table(
                f"A12:N{12 + len(inward_df_data)}",
                {
                    "data": inward_df_data,
                    "columns": [
                        {"header": "Sl.No"},
                        {"header": "Line"},
                        {"header": "Client"},
                        {"header": "Email Date"},
                        {"header": "Process Date"},
                        {"header": "Container No"},
                        {"header": "Size"},
                        {"header": "Type"},
                        {"header": "MoveCode"},
                        {"header": "Site"},
                        {"header": "Email Sent"},
                        {"header": "IN Email Date"},
                        {"header": "Auto Email"},
                        {"header": "Time Difference"},
                    ],
                },
            )
        else:
            inward_sheet.add_table(
                f"A12:L{12 + len(inward_df_data)}",
                {
                    "data": inward_df_data,
                    "columns": [
                        {"header": "Sl.No"},
                        {"header": "Line"},
                        {"header": "Client"},
                        {"header": "IN Date"},
                        {"header": "Container No"},
                        {"header": "Size"},
                        {"header": "Type"},
                        {"header": "Site"},
                        {"header": "Email Sent"},
                        {"header": "IN Email Date"},
                        {"header": "Auto Email"},
                        {"header": "Time Difference"},
                    ],
                },
            )

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", generic_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", generic_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            generic_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, generic_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )
        if move_code_tracking:
            outward_sheet.add_table(
                f"A12:N{12 + len(outward_df_data)}",
                {
                    "data": outward_df_data,
                    "columns": [
                        {"header": "Sl.No"},
                        {"header": "Line"},
                        {"header": "Client"},
                        {"header": "Email Date"},
                        {"header": "Process Date"},
                        {"header": "Container No"},
                        {"header": "Size"},
                        {"header": "Type"},
                        {"header": "MoveCode"},
                        {"header": "Site"},
                        {"header": "Email Sent"},
                        {"header": "OUT Email Date"},
                        {"header": "Auto Email"},
                        {"header": "Time Difference"},
                    ],
                },
            )
        else:
            outward_sheet.add_table(
                f"A12:L{12 + len(outward_df_data)}",
                {
                    "data": outward_df_data,
                    "columns": [
                        {"header": "Sl.No"},
                        {"header": "Line"},
                        {"header": "Client"},
                        {"header": "OUT Date"},
                        {"header": "Container No"},
                        {"header": "Size"},
                        {"header": "Type"},
                        {"header": "Site"},
                        {"header": "Email Sent"},
                        {"header": "OUT Email Date"},
                        {"header": "Auto Email"},
                        {"header": "Time Difference"},
                    ],
                },
            )
        generic_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_hemck_hemchc_daily_report_wb(
    user_data,
    stock_df_data,
    inward_df_data,
    outward_df_data,
    summary_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/hemck_hemchc_daily_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        stock_sheet = msc_workbook.add_worksheet("INVENTORY")
        inward_sheet = msc_workbook.add_worksheet("IN REPORT")
        outward_sheet = msc_workbook.add_worksheet("OUT REPORT")
        summary_sheet = msc_workbook.add_worksheet("SUMMARY")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        stock_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        stock_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : INVENTORY", msc_merge_format3)
        stock_sheet.merge_range("A5:U5", None, msc_merge_format3)
        stock_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        stock_sheet.merge_range("A7:U7", None, msc_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, msc_merge_format3)
        stock_sheet.merge_range("A10:U10", None, msc_merge_format3)

        stock_sheet.add_table(
            f"A12:AK{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "ACCOUNT"},
                    {"header": "CUSTOMER NAME"},
                    {"header": "B/L NO"},
                    {"header": "TRANSPORTER"},
                    {"header": "MFG.DATE"},
                    {"header": "GROSS.WT"},
                    {"header": "TARE.WT"},
                    {"header": "PAY LOAD"},
                    {"header": "HD/NR"},
                    {"header": "CARGO"},
                    {"header": "Survey Date"},
                    {"header": "EST DATE"},
                    {"header": "Estimate No"},
                    {"header": "Damage Grade"},
                    {"header": "MAN HRS"},
                    {"header": "LBR COST"},
                    {"header": "MTRL COST"},
                    {"header": "WASH. AMT"},
                    {"header": "TOTAL COST"},
                    {"header": "APPROVAL Dt"},
                    {"header": "AV/ DATE"},
                    {"header": "EMPTY ALLOTMENT/DATE"},
                    {"header": "ALLOTMENT/DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "SHIPPER"},
                    {"header": "D. O. NO"},
                    {"header": "VEHICLE NO"},
                    {"header": "STATUS"},
                    {"header": "OTL"},
                    {"header": "No. of Days"},
                ],
            },
        )

        inward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN REPORT", msc_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        inward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        inward_sheet.add_table(
            f"A12:P{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "ACCOUNT"},
                    {"header": "CUSTOMER NAME"},
                    {"header": "B/L NO"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "MFG.DATE"},
                    {"header": "GROSS.WT"},
                    {"header": "TARE.WT"},
                    {"header": "PAY LOAD"},
                    {"header": "CARGO"},
                ],
            },
        )

        outward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUT REPORT", msc_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        outward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        outward_sheet.add_table(
            f"A12:R{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "SHIPPING LINE"},
                    {"header": "CUSTOMER NAME"},
                    {"header": "IN DATE"},
                    {"header": "APPROVAL DATE"},
                    {"header": "AV/ DATE"},
                    {"header": "EMPTY ALLOTMENT/DATE"},
                    {"header": "ALLOTMENT/DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "TRANSPORTER"},
                    {"header": "SHIPPER"},
                    {"header": "D. O. NO."},
                    {"header": "VEHICLE NO"},
                    {"header": "STATUS"},
                    {"header": "OTL"},
                ],
            },
        )

        summary_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        summary_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        summary_sheet.merge_range("A4:U4", "REPORT NAME : SUMMARY", msc_merge_format3)
        summary_sheet.merge_range("A5:U5", None, msc_merge_format3)
        summary_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        summary_sheet.merge_range("A7:U7", None, msc_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, msc_merge_format3)
        summary_sheet.merge_range("A10:U10", None, msc_merge_format3)

        summary_sheet.add_table(
            f"A12:O{12 + len(summary_df_data[0])}",
            {
                "data": summary_df_data[0],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "20'FL"},
                    {"header": "40'FL"},
                    {"header": "TOTAL"},
                    {"header": "REMARKS"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{15 + len(summary_df_data[0])}:N{15 + len(summary_df_data[0]) + len(summary_df_data[1])}",
            {
                "data": summary_df_data[1],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "20'FL"},
                    {"header": "40'FL"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{18 + len(summary_df_data[0]) + len(summary_df_data[1])}:D{18 + len(summary_df_data[0]) + len(summary_df_data[1]) + len(summary_df_data[2])}",
            {
                "data": summary_df_data[2],
                "columns": [
                    {"header": "Stat"},
                    {"header": "READY CONDICTION 20'"},
                    {"header": "READY CONDICTION 40'"},
                    {"header": "TOTAL'"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"A{(21 + len(summary_df_data[0]) + len(summary_df_data[1]) + len(summary_df_data[2]))}:N{21 + len(summary_df_data[0]) + len(summary_df_data[1]) + len(summary_df_data[2])  + len(summary_df_data[3])}",
            {
                "data": summary_df_data[3],
                "columns": [
                    {"header": "Size"},
                    {"header": "20'DV"},
                    {"header": "40'DV"},
                    {"header": "20'STD"},
                    {"header": "40'STD"},
                    {"header": "20'HC"},
                    {"header": "40'HC"},
                    {"header": "20'OT"},
                    {"header": "40'OT"},
                    {"header": "20'FR"},
                    {"header": "40'FR"},
                    {"header": "20'FL"},
                    {"header": "40'FL"},
                    {"header": "TOTAL"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_hemck_hemchc_inward_report_wb(
    user_data,
    inward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/hemck_hemchc_inward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msc_workbook.add_worksheet("IN REPORT")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        inward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        inward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        inward_sheet.merge_range("A4:U4", "REPORT NAME : IN REPORT", msc_merge_format3)
        inward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        inward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        inward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        inward_sheet.add_table(
            f"A12:P{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "IN TIME"},
                    {"header": "ACCOUNT"},
                    {"header": "CUSTOMER NAME"},
                    {"header": "B/L NO"},
                    {"header": "TRANSPORTER"},
                    {"header": "VEHICLE NO"},
                    {"header": "MFG.DATE"},
                    {"header": "GROSS.WT"},
                    {"header": "TARE.WT"},
                    {"header": "PAY LOAD"},
                    {"header": "CARGO"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_hemck_hemchc_outward_report_wb(
    user_data,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/hemck_hemchc_outward_report_{date}{time}.xlsx"
        )
        msc_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msc_workbook.add_worksheet("OUT REPORT")

        msc_merge_format = get_merge_format(msc_workbook)
        msc_merge_format2 = get_merge_format2(msc_workbook)
        msc_merge_format3 = get_merge_format3(msc_workbook)

        outward_sheet.merge_range("A1:U2", user_data["company_name"], msc_merge_format)
        outward_sheet.merge_range(
            "A3:U3",
            user_data["company_address"],
            msc_merge_format2,
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUT REPORT", msc_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msc_merge_format3)
        outward_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", msc_merge_format3)
        outward_sheet.merge_range("A7:U7", None, msc_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msc_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msc_merge_format3)
        outward_sheet.merge_range("A10:U10", None, msc_merge_format3)

        outward_sheet.add_table(
            f"A12:R{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "SHIPPING LINE"},
                    {"header": "CUSTOMER NAME"},
                    {"header": "IN DATE"},
                    {"header": "APPROVAL DATE"},
                    {"header": "AV/ DATE"},
                    {"header": "EMPTY ALLOTMENT/DATE"},
                    {"header": "ALLOTMENT/DATE"},
                    {"header": "OUT DATE"},
                    {"header": "OUT TIME"},
                    {"header": "TRANSPORTER"},
                    {"header": "SHIPPER"},
                    {"header": "D. O. NO."},
                    {"header": "VEHICLE NO"},
                    {"header": "STATUS"},
                    {"header": "OTL"},
                ],
            },
        )
        msc_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_ovmnr_report_wb(
    user_data,
    ovmnr_df_data,
    ovmnr_summary_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_ovmnr_report_{date}{time}.xlsx"
        )
        ovmnr_workbook = xlsxwriter.Workbook(temp_file_path)
        ovmnr_sheet = ovmnr_workbook.add_worksheet("OVMNR")
        ovmnr_summary_sheet = ovmnr_workbook.add_worksheet("OVMNR Summary")
        ovmnr_merge_format = get_merge_format(ovmnr_workbook)
        ovmnr_merge_format2 = get_merge_format2(ovmnr_workbook)
        ovmnr_merge_format3 = get_merge_format3(ovmnr_workbook)
        ovmnr_sheet.merge_range("A1:U2", user_data["company_name"], ovmnr_merge_format)
        ovmnr_sheet.merge_range(
            "A3:U3", user_data["company_address"], ovmnr_merge_format2
        )

        ovmnr_sheet.merge_range("A4:U4", "REPORT NAME : OVMNR", ovmnr_merge_format3)
        ovmnr_sheet.merge_range("A5:U5", None, ovmnr_merge_format3)
        ovmnr_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line}", ovmnr_merge_format3)
        ovmnr_sheet.merge_range("A7:U7", None, ovmnr_merge_format3)
        ovmnr_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            ovmnr_merge_format3,
        )
        ovmnr_sheet.merge_range("A9:U9", None, ovmnr_merge_format3)
        ovmnr_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            ovmnr_merge_format3,
        )

        ovmnr_sheet.add_table(
            f"A12:L{12 + len(ovmnr_df_data)}",
            {
                "data": ovmnr_df_data,
                "columns": [
                    {"header": "SR.NO"},
                    {"header": "CONTAINER NO"},
                    {"header": "IN DATE &TIME"},
                    {"header": "OUT DATE & TIME"},
                    {"header": "WESTIM UPLOAD DATE"},
                    {"header": "WESTIM REF NO"},
                    {"header": "WESTM ESTIMATE COST"},
                    {"header": "DESTIM RESPONSE APPROVAL DATE"},
                    {"header": "DESTIM RESPONSE APPROVAL STATUS"},
                    {"header": "DESTIM APPROVAL COST"},
                    {"header": "REPAIR COMPLETION UPLOAD DATE"},
                    {"header": "REPAIR DESTIM REF. NO"},
                ],
            },
        )

        ovmnr_summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], ovmnr_merge_format
        )
        ovmnr_summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], ovmnr_merge_format2
        )

        ovmnr_summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : OVMNR Summary", ovmnr_merge_format3
        )
        ovmnr_summary_sheet.merge_range("A5:U5", None, ovmnr_merge_format3)
        ovmnr_summary_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", ovmnr_merge_format3
        )
        ovmnr_summary_sheet.merge_range("A7:U7", None, ovmnr_merge_format3)
        ovmnr_summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            ovmnr_merge_format3,
        )
        ovmnr_summary_sheet.merge_range("A9:U9", None, ovmnr_merge_format3)
        ovmnr_summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            ovmnr_merge_format3,
        )

        ovmnr_summary_sheet.add_table(
            f"A12:G{12 + len(ovmnr_summary_df_data)}",
            {
                "data": ovmnr_summary_df_data,
                "columns": [
                    {"header": "Date"},
                    {"header": "No of Westim Container"},
                    {"header": "Westim Cost"},
                    {"header": "No of Destim Container"},
                    {"header": "Destim Cost"},
                    {"header": "No of Repair Destim Container"},
                    {"header": "Repair Destim Cost"},
                ],
            },
        )
        ovmnr_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except Exception as e:
        return e


def create_msk_line_daily_report_wb(
    user_data,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    summary_df_data,
    av_aa_ar_df_data,
    movement_summary_df_data,
    status_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msk_line_daily_report_{date}.xlsx"
        )
        msk_line_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msk_line_workbook.add_worksheet("INWARD")
        outward_sheet = msk_line_workbook.add_worksheet("OUTWARD")
        stock_sheet = msk_line_workbook.add_worksheet("STOCK")
        summary_sheet = msk_line_workbook.add_worksheet("SUMMARY")
        av_aa_ar_sheet = msk_line_workbook.add_worksheet("AV&AA&AR")
        movement_summary_sheet = msk_line_workbook.add_worksheet("MOVEMENT_SUMMARY")
        status_sheet = msk_line_workbook.add_worksheet("STATUS")
        msk_line_merge_format = get_merge_format(msk_line_workbook)
        msk_line_merge_format2 = get_merge_format2(msk_line_workbook)
        msk_line_merge_format3 = get_merge_format3(msk_line_workbook)
        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : INWARD", msk_line_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:W{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "GateInTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", msk_line_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateOutDate"},
                    {"header": "GateOutTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )

        stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        stock_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : STOCK", msk_line_merge_format3)
        stock_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        stock_sheet.merge_range("A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3)
        stock_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        stock_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        stock_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        stock_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        stock_sheet.add_table(
            f"A12:O{12 + len(stock_df_data)}",
            {
                "data": stock_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateInDate"},
                    {"header": "Client"},
                    {"header": "ContainerNo"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Age"},
                    {"header": "Status"},
                    {"header": "Condition"},
                    {"header": "AvailableDate"},
                    {"header": "ApprovalDate"},
                    {"header": "BookingNo"},
                ],
            },
        )

        summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : SUMMARY", msk_line_merge_format3
        )
        summary_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        summary_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3
        )
        summary_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        summary_sheet.add_table(
            f"A12:E{12 + len(summary_df_data)}",
            {
                "data": summary_df_data,
                "columns": [
                    {"header": "SizeType"},
                    {"header": "OpBal"},
                    {"header": "InQty"},
                    {"header": "OutQty"},
                    {"header": "ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        av_aa_ar_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        av_aa_ar_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        av_aa_ar_sheet.merge_range(
            "A4:U4", "REPORT NAME : AV&AA&AR", msk_line_merge_format3
        )
        av_aa_ar_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3
        )
        av_aa_ar_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        av_aa_ar_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        av_aa_ar_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        av_aa_ar_sheet.add_table(
            f"A12:F{12 + len(av_aa_ar_df_data)}",
            {
                "data": av_aa_ar_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "ContainerNo"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Status"},
                    {"header": "AvailableDate"},
                ],
            },
        )

        movement_summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        movement_summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        movement_summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : MOVEMENT SUMMARY", msk_line_merge_format3
        )
        movement_summary_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        movement_summary_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3
        )
        movement_summary_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        movement_summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        movement_summary_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        movement_summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        movement_summary_sheet.add_table(
            f"A12:E{12 + len(movement_summary_df_data)}",
            {
                "data": movement_summary_df_data,
                "columns": [
                    {"header": "Movement"},
                    {"header": "In-20'"},
                    {"header": "In-40'"},
                    {"header": "Out-20'"},
                    {"header": "Out-40'"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )

        status_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        status_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        status_sheet.merge_range(
            "A4:U4", "REPORT NAME : STATUS", msk_line_merge_format3
        )
        status_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        status_sheet.merge_range("A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3)
        status_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        status_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        status_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        status_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        status_sheet.add_table(
            f"A12:E{12 + len(status_df_data)}",
            {
                "data": status_df_data,
                "columns": [
                    {"header": "Status"},
                    {"header": "OpBal"},
                    {"header": "InBal"},
                    {"header": "OutBal"},
                    {"header": "CalBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        msk_line_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msk_line_inward_report_wb(
    user_data, inward_df_data, from_date_str, from_time_str, to_date_str, to_time_str
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msk_line_inward_report_{date}{time}.xlsx"
        )
        msk_line_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = msk_line_workbook.add_worksheet("INWARD")
        msk_line_merge_format = get_merge_format(msk_line_workbook)
        msk_line_merge_format2 = get_merge_format2(msk_line_workbook)
        msk_line_merge_format3 = get_merge_format3(msk_line_workbook)
        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : INWARD", msk_line_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        inward_sheet.merge_range("A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3)
        inward_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:V{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "GateInTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )
        msk_line_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except Exception as e:
        return e


def create_msk_line_outward_report_wb(
    user_data, outward_df_data, from_date_str, from_time_str, to_date_str, to_time_str
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msk_line_outward_report_{date}{time}.xlsx"
        )
        msk_line_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = msk_line_workbook.add_worksheet("OUTWARD")
        msk_line_merge_format = get_merge_format(msk_line_workbook)
        msk_line_merge_format2 = get_merge_format2(msk_line_workbook)
        msk_line_merge_format3 = get_merge_format3(msk_line_workbook)

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], msk_line_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], msk_line_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", msk_line_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, msk_line_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", "SHIPPING LINE : MSK", msk_line_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, msk_line_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            msk_line_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, msk_line_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            msk_line_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateOutDate"},
                    {"header": "GateOutTime"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )
        msk_line_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_mundra_depot_daily_report_wb(
    user_data,
    inward_df_data,
    outward_df_data,
    stock_df_data,
    summary_df_data,
    cancel_allotment_df_data,
    change_allotment_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
    start_date,
    end_date,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/msc_mundra_daily_report_{date}.xlsx"
        )
        mundra_depot_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = mundra_depot_workbook.add_worksheet("INWARD")
        outward_sheet = mundra_depot_workbook.add_worksheet("OUTWARD")
        stock_sheet = mundra_depot_workbook.add_worksheet("STOCK")
        summary_sheet = mundra_depot_workbook.add_worksheet("SUMMARY")
        cancel_allotment_sheet = mundra_depot_workbook.add_worksheet("CANCEL ALLOTMENT")
        change_allotment_sheet = mundra_depot_workbook.add_worksheet("CHANGE")

        mundra_depot_merge_format = get_merge_format(mundra_depot_workbook)
        mundra_depot_merge_format2 = get_merge_format2(mundra_depot_workbook)
        mundra_depot_merge_format3 = get_merge_format3(mundra_depot_workbook)
        separator_format = mundra_depot_workbook.add_format(
            {
                "bg_color": "#000000",
            }
        )

        create_mundra_inward_sheet_table(
            inward_sheet,
            mundra_depot_merge_format,
            mundra_depot_merge_format2,
            mundra_depot_merge_format3,
            user_data,
            from_date,
            from_time,
            to_date,
            to_time,
            inward_df_data,
        )
        create_mundra_outward_sheet_table(
            outward_sheet,
            mundra_depot_merge_format,
            mundra_depot_merge_format2,
            mundra_depot_merge_format3,
            user_data,
            from_date,
            from_time,
            to_date,
            to_time,
            outward_df_data,
        )
        create_mundra_stock_sheet_table(
            stock_sheet,
            mundra_depot_merge_format,
            mundra_depot_merge_format2,
            mundra_depot_merge_format3,
            user_data,
            from_date,
            from_time,
            to_date,
            to_time,
            stock_df_data,
        )

        summary_sheet.merge_range(
            "A1:U2", user_data["company_name"], mundra_depot_merge_format
        )
        summary_sheet.merge_range(
            "A3:U3", user_data["company_address"], mundra_depot_merge_format2
        )

        summary_sheet.merge_range(
            "A4:U4", "REPORT NAME : SUMMARY", mundra_depot_merge_format3
        )
        summary_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
        summary_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : MSC", mundra_depot_merge_format3
        )
        summary_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
        summary_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            mundra_depot_merge_format3,
        )
        summary_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
        summary_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            mundra_depot_merge_format3,
        )

        create_opening_inventory_table(
            summary_sheet, mundra_depot_merge_format2, date, summary_df_data
        )

        summary_sheet.merge_range(f"A16:Z16", None, separator_format)

        create_invetory_summary_table(
            summary_df_data,
            summary_sheet,
            date,
            mundra_depot_merge_format2,
        )

        summary_sheet.merge_range(f"A32:Z32", None, separator_format)

        create_daily_monthly_summary_table(
            summary_df_data,
            summary_sheet,
            mundra_depot_merge_format2,
            from_date_str,
            to_date_str,
            start_date,
            end_date,
            custom=True,
        )

        summary_sheet.merge_range(f"A49:Z49", None, separator_format)

        create_daily_monthly_summary_table(
            summary_df_data,
            summary_sheet,
            mundra_depot_merge_format2,
            from_date_str,
            to_date_str,
            start_date,
            end_date,
        )

        summary_sheet.merge_range(f"A67:Z67", None, separator_format)
        create_line_wise_inventory_table(
            summary_sheet,
            date,
            mundra_depot_merge_format2,
            summary_df_data,
        )
        # create_opening_inventory_table(
        #     summary_sheet,
        #     mundra_depot_merge_format2,
        #     date,
        #     summary_df_data,
        #     mundra_depot_merge_format3,
        # )
        create_mundra_cancel_sheet_table(
            cancel_allotment_sheet,
            mundra_depot_merge_format,
            mundra_depot_merge_format2,
            mundra_depot_merge_format3,
            user_data,
            from_date,
            from_time,
            to_date,
            to_time,
            cancel_allotment_df_data,
        )
        create_mundra_change_sheet_table(
            change_allotment_sheet,
            mundra_depot_merge_format,
            mundra_depot_merge_format2,
            mundra_depot_merge_format3,
            user_data,
            from_date,
            from_time,
            to_date,
            to_time,
            change_allotment_df_data,
        )

        mundra_depot_workbook.close()

        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_mundra_depot_inward_report_wb(
    user_data,
    inward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_inward_report_{date}{time}.xlsx"
        )
        mundra_depot_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = mundra_depot_workbook.add_worksheet("INWARD")
        mundra_depot_merge_format = get_merge_format(mundra_depot_workbook)
        mundra_depot_merge_format2 = get_merge_format2(mundra_depot_workbook)
        mundra_depot_merge_format3 = get_merge_format3(mundra_depot_workbook)
        inward_sheet.merge_range(
            "A1:U2", user_data["company_name"], mundra_depot_merge_format
        )
        inward_sheet.merge_range(
            "A3:U3", user_data["company_address"], mundra_depot_merge_format2
        )

        inward_sheet.merge_range(
            "A4:U4", "REPORT NAME : INWARD", mundra_depot_merge_format3
        )
        inward_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
        inward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", mundra_depot_merge_format3
        )
        inward_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
        inward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            mundra_depot_merge_format3,
        )
        inward_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
        inward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            mundra_depot_merge_format3,
        )

        inward_sheet.add_table(
            f"A12:V{12 + len(inward_df_data)}",
            {
                "data": inward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "VehicleNo"},
                    {"header": "ImportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "Gross Wt"},
                    {"header": "Tare Wt"},
                    {"header": "Payload"},
                    {"header": "MfgDate"},
                    {"header": "Grade"},
                    {"header": "ArrivedBy"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "GateInDate"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Place"},
                    {"header": "Transporter"},
                    {"header": "OPR"},
                ],
            },
        )
        mundra_depot_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except Exception as e:
        return e


def create_mundra_depot_outward_report_wb(
    user_data,
    outward_df_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):
    try:
        from_date, from_time, to_date, to_time = get_from_to_date_and_time(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_outward_report_{date}{time}.xlsx"
        )
        mundra_depot_workbook = xlsxwriter.Workbook(temp_file_path)
        outward_sheet = mundra_depot_workbook.add_worksheet("OUTWARD")
        mundra_depot_merge_format = get_merge_format(mundra_depot_workbook)
        mundra_depot_merge_format2 = get_merge_format2(mundra_depot_workbook)
        mundra_depot_merge_format3 = get_merge_format3(mundra_depot_workbook)

        outward_sheet.merge_range(
            "A1:U2", user_data["company_name"], mundra_depot_merge_format
        )
        outward_sheet.merge_range(
            "A3:U3", user_data["company_address"], mundra_depot_merge_format2
        )

        outward_sheet.merge_range(
            "A4:U4", "REPORT NAME : OUTWARD", mundra_depot_merge_format3
        )
        outward_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
        outward_sheet.merge_range(
            "A6:U6", f"SHIPPING LINE : {line}", mundra_depot_merge_format3
        )
        outward_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
        outward_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
            mundra_depot_merge_format3,
        )
        outward_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
        outward_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            mundra_depot_merge_format3,
        )

        outward_sheet.add_table(
            f"A12:AB{12 + len(outward_df_data)}",
            {
                "data": outward_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "GateInDate"},
                    {"header": "GateOutDate"},
                    {"header": "Line"},
                    {"header": "Customer"},
                    {"header": "Shipper"},
                    {"header": "Place"},
                    {"header": "Vessel"},
                    {"header": "Voyage"},
                    {"header": "Transporter"},
                    {"header": "VehicleNo"},
                    {"header": "ExportCargo"},
                    {"header": "ContainerNo"},
                    {"header": "Size Type"},
                    {"header": "GrossWt"},
                    {"header": "TareWt"},
                    {"header": "Payload"},
                    {"header": "Grade"},
                    {"header": "BookingNo"},
                    {"header": "SealNo"},
                    {"header": "Status"},
                    {"header": "Remarks"},
                    {"header": "MfgDate"},
                    {"header": "PortOfLoading"},
                    {"header": "PortOfDischarge"},
                    {"header": "Destination"},
                    {"header": "OPR"},
                    {"header": "ToPort"},
                ],
            },
        )
        mundra_depot_workbook.close()
        return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_opening_inventory_table(
    summary_sheet,
    mundra_depot_merge_format2,
    date,
    summary_df_data,
):
    data = summary_df_data["opening_inventory"]

    summary_sheet.merge_range(
        "A12:D12", f"Opening inventory As on {date}", mundra_depot_merge_format2
    )

    table_data = [data["20"], data["40"], data["total"], data["tues"]]

    summary_sheet.add_table(
        "A13:D14",
        {
            "data": [table_data],
            "columns": [
                {"header": "20"},
                {"header": "40"},
                {"header": "Total"},
                {"header": "Total Tues"},
            ],
        },
    )


def create_line_wise_inventory_table(
    summary_sheet,
    date,
    mundra_depot_merge_format2,
    summary_df_data,
):
    data = summary_df_data["line_wise_total_inventory"]

    summary_sheet.merge_range(
        "A71:E71",
        f"Line Wise Total Inventory As On Date {date}",
        mundra_depot_merge_format2,
    )

    table_data = [["Line", "20'", "40'", "Total", "Teus"]]

    for entry in data:
        table_data.append(
            [
                entry["client"],
                entry["line_20"],
                entry["line_40"],
                entry["total_line_count"],
                entry["tues_count"],
            ]
        )

    total_line_20 = sum(item["line_20"] for item in data)
    total_line_40 = sum(item["line_40"] for item in data)
    total_total_line_count = sum(item["total_line_count"] for item in data)
    total_tues_count = sum(item["tues_count"] for item in data)

    table_data.append(
        [
            "Total",
            total_line_20,
            total_line_40,
            total_total_line_count,
            total_tues_count,
        ]
    )

    summary_sheet.add_table(
        "A72:E{}".format(72 + len(table_data)),
        {
            "data": table_data[1:],
            "columns": [
                {"header": table_data[0][0]},
                {"header": table_data[0][1]},
                {"header": table_data[0][2]},
                {"header": table_data[0][3]},
                {"header": table_data[0][4]},
            ],
        },
    )

    for col_num, value in enumerate(table_data[0]):
        summary_sheet.write(1, col_num, value)

    summary_sheet.write("A{}".format(73 + len(data)), "Total")
    summary_sheet.write("B{}".format(73 + len(data)), total_line_20)
    summary_sheet.write("C{}".format(73 + len(data)), total_line_40)
    summary_sheet.write("D{}".format(73 + len(data)), total_total_line_count)
    summary_sheet.write("E{}".format(73 + len(data)), total_tues_count)


def create_invetory_summary_table(
    summary_df_data,
    summary_sheet,
    date,
    mundra_depot_merge_format2,
):
    inventory_data = summary_df_data["inventory_data"]
    headers = sorted(
        set(
            key
            for values in inventory_data.values()
            for d in values
            for key in d.keys()
        )
    )
    headers.append("Total")
    start_col = 0
    start_row = 18

    table_data = []
    totals = [0] * len(headers)

    categories = list(inventory_data.keys())
    for category in categories:

        row_data = [category]
        row_total = 0
        tues_total = 0
        for i, header in enumerate(headers[:-1]):
            value = list(inventory_data[category][i].values())[0]
            row_data.append(value)

            totals[i] += value
            row_total += value

        row_data.append(row_total)
        totals[-1] += row_total

        table_data.append(row_data)

    table_data.append(["Total"] + totals)

    tues_data = ["Tues Total"]
    tues_total = 0
    total_len = len(table_data[-1:][0])
    for value, header in zip(table_data[-1:][0][1:total_len], headers[:-1]):
        if header.startswith("40"):
            value *= 2
        tues_data.append(value)
        tues_total += int(value)

    tues_data.append(tues_total)
    table_data.append(tues_data)
    summary_sheet.merge_range(
        "A19:V19", f"Inventory Summary As on {date}", mundra_depot_merge_format2
    )
    summary_sheet.add_table(
        start_row + 1,
        start_col,
        start_row + len(table_data) + 1,
        start_col + len(headers),
        {
            "data": table_data,
            "columns": [{"header": " "}] + [{"header": header} for header in headers],
        },
    )


def create_daily_monthly_summary_table(
    summary_df_data,
    summary_sheet,
    mundra_depot_merge_format2,
    from_date,
    to_date,
    start_date,
    end_date,
    custom=False,
):

    if custom:
        data = summary_df_data["custom_summary"]
        summary_sheet.merge_range(
            "A36:F36",
            f"Daily Summary From: {from_date} to {to_date}",
            mundra_depot_merge_format2,
        )

        summary_sheet.merge_range(
            "A37:C37",
            "IN",
        )
        summary_sheet.merge_range(
            "D37:F37",
            "OUT",
        )

        table_data = [
            [
                "MIR - Empty En-Block IN",
                data["mir_empty_20_in"],
                data["mir_empty_40_in"],
                "MOR - Re-Export to Terminal",
                data["mor_export_20_out"],
                data["mor_export_40_out"],
            ],
            [
                "MTIN - Factory De-stuffed IN",
                data["mtin_20_in"],
                data["mtin_40_in"],
                "VAN - Out for Factory stuffing on Booking",
                data["van_20_out"],
                data["van_40_out"],
            ],
            [
                "RET - Returned from Factory",
                data["ret_20_in"],
                data["ret_40_in"],
                "MOR - Out for ICD Location on Line DO",
                data["mor_20_out"],
                data["mor_40_out"],
            ],
            [
                "MIR - ICD Repo. IN",
                data["mir_icd_20_in"],
                data["mir_icd_40_in"],
                "OUT - Other",
                data["out_other_20"],
                data["out_other_40"],
            ],
            [
                "IN - Other",
                data["in_other_20"],
                data["in_other_40"],
            ],
            [
                "IN",
                data["total_in_20"],
                data["total_in_40"],
                "OUT",
                data["total_out_20"],
                data["total_out_40"],
            ],
            # [
            #     "Total",
            #     "",
            #     data["total_in_data"],
            #     "Total",
            #     "",
            #     data["total_out_data"],
            # ],
            # [
            #     "Total TEUS",
            #     "",
            #     data["total_in_tues"],
            #     "Total TEUS",
            #     "",
            #     data["total_out_tues"],
            # ],
        ]

        summary_sheet.add_table(
            "A38:F44",
            {
                "data": table_data,
                "columns": [
                    {"header": "Activity Type IN "},
                    {"header": "20 IN"},
                    {"header": "40 IN"},
                    {"header": "Activity Type OUT"},
                    {"header": "20 OUT"},
                    {"header": "40 OUT"},
                ],
            },
        )
        summary_sheet.write("A45", "Total")
        summary_sheet.merge_range("B45:C45", data["total_in_data"])
        summary_sheet.write("A46", "Total TUES")
        summary_sheet.merge_range("B46:C46", data["total_in_tues"])
        summary_sheet.write("D45", "Total")
        summary_sheet.merge_range("E45:F45", data["total_out_data"])
        summary_sheet.write("D46", "Total TUES")
        summary_sheet.merge_range("E46:F46", data["total_out_tues"])

    else:
        data = summary_df_data["monthly_summary"]
        summary_sheet.merge_range(
            "A53:F53",
            f"Monthly Summary From {start_date.date()} to {end_date.date()}",
            mundra_depot_merge_format2,
        )

        summary_sheet.merge_range(
            "A54:C54",
            "IN",
        )
        summary_sheet.merge_range(
            "D54:F54",
            "OUT",
        )

        table_data = [
            [
                "MIR - Empty En-Block IN",
                data["mir_empty_20_in"],
                data["mir_empty_40_in"],
                "MOR - Re-Export to Terminal",
                data["mor_export_20_out"],
                data["mor_export_40_out"],
            ],
            [
                "MTIN - Factory De-stuffed IN",
                data["mtin_20_in"],
                data["mtin_40_in"],
                "VAN - Out for Factory stuffing on Booking",
                data["van_20_out"],
                data["van_40_out"],
            ],
            [
                "RET - Returned from Factory",
                data["ret_20_in"],
                data["ret_40_in"],
                "MOR - Out for ICD Location on Line DO",
                data["mor_20_out"],
                data["mor_40_out"],
            ],
            [
                "MIR - ICD Repo. IN",
                data["mir_icd_20_in"],
                data["mir_icd_40_in"],
                "OUT - Other",
                data["out_other_20"],
                data["out_other_40"],
            ],
            [
                "IN - Other",
                data["in_other_20"],
                data["in_other_40"],
            ],
            [
                "IN",
                data["total_in_20"],
                data["total_in_40"],
                "OUT",
                data["total_out_20"],
                data["total_out_40"],
            ],
            # [
            #     "Total",
            #     "",
            #     data["total_in_data"],
            #     "Total",
            #     "",
            #     data["total_out_data"],
            # ],
            # [
            #     "Total TEUS",
            #     "",
            #     data["total_in_tues"],
            #     "Total TEUS",
            #     "",
            #     data["total_out_tues"],
            # ],
        ]

        summary_sheet.add_table(
            "A55:F61",
            {
                "data": table_data,
                "columns": [
                    {"header": "Activity Type IN "},
                    {"header": "20 IN"},
                    {"header": "40 IN"},
                    {"header": "Activity Type OUT"},
                    {"header": "20 OUT"},
                    {"header": "40 OUT"},
                ],
            },
        )
        summary_sheet.write("A62", "Total")
        summary_sheet.merge_range("B62:C62", data["total_in_data"])
        summary_sheet.write("A63", "Total TUES")
        summary_sheet.merge_range("B63:C63", data["total_in_tues"])
        summary_sheet.write("D62", "Total")
        summary_sheet.merge_range("E62:F62", data["total_out_data"])
        summary_sheet.write("D63", "Total TUES")
        summary_sheet.merge_range("E63:F63", data["total_out_tues"])


def create_mundra_inward_sheet_table(
    inward_sheet,
    mundra_depot_merge_format,
    mundra_depot_merge_format2,
    mundra_depot_merge_format3,
    user_data,
    from_date,
    from_time,
    to_date,
    to_time,
    inward_df_data,
):
    inward_sheet.merge_range(
        "A1:U2", user_data["company_name"], mundra_depot_merge_format
    )
    inward_sheet.merge_range(
        "A3:U3", user_data["company_address"], mundra_depot_merge_format2
    )

    inward_sheet.merge_range(
        "A4:U4", "REPORT NAME : INWARD", mundra_depot_merge_format3
    )
    inward_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
    inward_sheet.merge_range(
        "A6:U6", f"SHIPPING LINE : MSC", mundra_depot_merge_format3
    )
    inward_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
    inward_sheet.merge_range(
        "A8:U8",
        f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        mundra_depot_merge_format3,
    )
    inward_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
    inward_sheet.merge_range(
        "A10:U10",
        f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        mundra_depot_merge_format3,
    )

    inward_sheet.add_table(
        f"A12:Z{12 + len(inward_df_data)}",
        {
            "data": inward_df_data,
            "columns": [
                {"header": "Sr.No"},
                {"header": "CONTAINER NO"},
                {"header": "SIZE"},
                {"header": "MOVE/ACTIVITy"},
                {"header": "IN DATE & TIME"},
                {"header": "GROSS WT"},
                {"header": "TARE WT"},
                {"header": "PAYLOAD"},
                {"header": "MTY TRUCK GATE OUT"},
                {"header": "CURRENT LOCATION"},
                {"header": "DO LINE / VESSEL NAME"},
                {"header": "DO VALIDITY DT."},
                {"header": "CUSTOMER/SHIPPER"},
                {"header": "TRANSPORTER"},
                {"header": "VEHICLE NO"},
                {"header": "GATE PASS NO"},
                {"header": "COMPLETE DAMAGE DESCRIPTION"},
                {"header": "CONDITION"},
                {"header": "PAYMENT RECEIPT NO"},
                {"header": "PAYMENT DATE"},
                {"header": "VENDOR"},
                {"header": "GRADE"},
                {"header": "MANUFACTURING DATE"},
                {"header": "DAMAGE STATUS"},
                {"header": "REMARKS"},
                {"header": "YARD"},
            ],
        },
    )


def create_mundra_outward_sheet_table(
    outward_sheet,
    mundra_depot_merge_format,
    mundra_depot_merge_format2,
    mundra_depot_merge_format3,
    user_data,
    from_date,
    from_time,
    to_date,
    to_time,
    outward_df_data,
):
    outward_sheet.merge_range(
        "A1:U2", user_data["company_name"], mundra_depot_merge_format
    )
    outward_sheet.merge_range(
        "A3:U3", user_data["company_address"], mundra_depot_merge_format2
    )

    outward_sheet.merge_range(
        "A4:U4", "REPORT NAME : OUTWARD", mundra_depot_merge_format3
    )
    outward_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
    outward_sheet.merge_range(
        "A6:U6", f"SHIPPING LINE : MSC", mundra_depot_merge_format3
    )
    outward_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
    outward_sheet.merge_range(
        "A8:U8",
        f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        mundra_depot_merge_format3,
    )
    outward_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
    outward_sheet.merge_range(
        "A10:U10",
        f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        mundra_depot_merge_format3,
    )

    outward_sheet.add_table(
        f"A12:AG{12 + len(outward_df_data)}",
        {
            "data": outward_df_data,
            "columns": [
                {"header": "Sr.No"},
                {"header": "CONTAINER NO"},
                {"header": "SIZE"},
                {"header": "IN DATE & TIME"},
                {"header": "CONDITION"},
                {"header": "GRADE"},
                {"header": "GROSS WT"},
                {"header": "TARE WT"},
                {"header": "ALLOTED DT"},
                {"header": "MOVE/ACTIVITY"},
                {"header": "OUT DATE & TIME"},
                {"header": "MTY TRUCK GATE IN"},
                {"header": "CURRENT LOCATION"},
                {"header": "TO LOCATION"},
                {"header": "BOOKING NO"},
                {"header": "NO OF CONT"},
                {"header": "CUSTOMER/SHIPPER"},
                {"header": "BOOKING VALIDITY"},
                {"header": "TRANSPORTER NAME"},
                {"header": "TRANSPORTER CODE"},
                {"header": "VEHICLE NO"},
                {"header": "CHA/SUB CHA/ACCOUNT"},
                {"header": "COMMODITY"},
                {"header": "GATE PASS NO"},
                {"header": "PORT OF DISCHARGE"},
                {"header": "PAYMENT RECEIPT NO"},
                {"header": "PAYMENT DATE"},
                {"header": "SEAL ALLOTED"},
                {"header": "SEAL 2 ALLOTED"},
                {"header": "REMARKS"},
                {"header": "VENDOR"},
                {"header": "SURVEY GRADE"},
                {"header": "YARD"},
            ],
        },
    )


def create_mundra_stock_sheet_table(
    stock_sheet,
    mundra_depot_merge_format,
    mundra_depot_merge_format2,
    mundra_depot_merge_format3,
    user_data,
    from_date,
    from_time,
    to_date,
    to_time,
    stock_df_data,
):
    stock_sheet.merge_range(
        "A1:U2", user_data["company_name"], mundra_depot_merge_format
    )
    stock_sheet.merge_range(
        "A3:U3", user_data["company_address"], mundra_depot_merge_format2
    )

    stock_sheet.merge_range("A4:U4", "REPORT NAME : STOCK", mundra_depot_merge_format3)
    stock_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
    stock_sheet.merge_range("A6:U6", f"SHIPPING LINE : MSC", mundra_depot_merge_format3)
    stock_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
    stock_sheet.merge_range(
        "A8:U8",
        f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        mundra_depot_merge_format3,
    )
    stock_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
    stock_sheet.merge_range(
        "A10:U10",
        f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        mundra_depot_merge_format3,
    )

    stock_sheet.add_table(
        f"A12:AI{12 + len(stock_df_data)}",
        {
            "data": stock_df_data,
            "columns": [
                {"header": "Sr.No"},
                {"header": "CONTAINER NO"},
                {"header": "SIZE"},
                {"header": "IN DATE & TIME"},
                {"header": "CONDITION"},
                {"header": "GRADE"},
                {"header": "GROSS WT"},
                {"header": "TARE WT"},
                {"header": "MFG DATE"},
                {"header": "ALLOTED DT"},
                {"header": "MOVE/ACTIVITY"},
                {"header": "OUT DATE & TIME"},
                {"header": "MTY TRUCK GATE IN"},
                {"header": "CURRENT LOCATION"},
                {"header": "TO LOCATION"},
                {"header": "BOOKING NO"},
                {"header": "NO OF CONT"},
                {"header": "CUSTOMER/SHIPPER"},
                {"header": "BOOKING VALIDITY"},
                {"header": "TRANSPORTER NAME"},
                {"header": "TRANSPORTER CODE"},
                {"header": "VEHICLE NO"},
                {"header": "CHA/SUB CHA/ACCOUNT"},
                {"header": "COMMODITY"},
                {"header": "GATE PASS NO"},
                {"header": "PORT OF DISCHARGE"},
                {"header": "PAYMENT RECEIPT NO"},
                {"header": "PAYMENT DATE"},
                {"header": "SEAL ALLOTED"},
                {"header": "SEAL 2 ALLOTED"},
                {"header": "REMARKS"},
                {"header": "VENDOR"},
                {"header": "SURVEY GRADE"},
                {"header": "YARD"},
                {"header": "LOCATION"},
                {"header": "Dwell days"},
            ],
        },
    )


def create_mundra_cancel_sheet_table(
    cancel_allotment_sheet,
    mundra_depot_merge_format,
    mundra_depot_merge_format2,
    mundra_depot_merge_format3,
    user_data,
    from_date,
    from_time,
    to_date,
    to_time,
    cancel_allotment_df_data,
):
    cancel_allotment_sheet.merge_range(
        "A1:U2", user_data["company_name"], mundra_depot_merge_format
    )
    cancel_allotment_sheet.merge_range(
        "A3:U3", user_data["company_address"], mundra_depot_merge_format2
    )

    cancel_allotment_sheet.merge_range(
        "A4:U4", "REPORT NAME : CANCEL ALLOTMENT", mundra_depot_merge_format3
    )
    cancel_allotment_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
    cancel_allotment_sheet.merge_range(
        "A6:U6", f"SHIPPING LINE : MSC", mundra_depot_merge_format3
    )
    cancel_allotment_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
    cancel_allotment_sheet.merge_range(
        "A8:U8",
        f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        mundra_depot_merge_format3,
    )
    cancel_allotment_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
    cancel_allotment_sheet.merge_range(
        "A10:U10",
        f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        mundra_depot_merge_format3,
    )

    cancel_allotment_sheet.add_table(
        f"A12:AL{12 + len(cancel_allotment_df_data)}",
        {
            "data": cancel_allotment_df_data,
            "columns": [
                {"header": "Sr.No"},
                {"header": "CONTAINER NO"},
                {"header": "SIZE"},
                {"header": "IN DATE & TIME"},
                {"header": "CONDITION"},
                {"header": "GRADE"},
                {"header": "GROSS WT"},
                {"header": "TARE WT"},
                {"header": "ALLOTED DT"},
                {"header": "MOVE/ACTIVITY"},
                {"header": "OUT DATE & TIME"},
                {"header": "MTY TRUCK GATE IN"},
                {"header": "CURRENT LOCATION"},
                {"header": "TO LOCATION"},
                {"header": "BOOKING NO"},
                {"header": "NO OF CONT"},
                {"header": "CUSTOMER/SHIPPER"},
                {"header": "BOOKING VALIDITY"},
                {"header": "TRANSPORTER NAME"},
                {"header": "TRANSPORTER CODE"},
                {"header": "VEHICLE NO"},
                {"header": "CHA/SUB CHA/ACCOUNT"},
                {"header": "COMMODITY"},
                {"header": "GATE PASS NO"},
                {"header": "PORT OF DISCHARGE"},
                {"header": "PAYMENT RECEIPT NO"},
                {"header": "PAYMENT DATE"},
                {"header": "SEAL ALLOTED"},
                {"header": "REMARKS"},
                {"header": "VENDOR"},
                {"header": "SURVEY GRADE"},
                {"header": "YARD"},
                {"header": "LOCATION"},
                {"header": "DAYS"},
                {"header": "CANCEL DATE"},
                {"header": "CANCEL"},
                {"header": "SEAL RETURN"},
                {"header": "SEAL NUMBER"},
            ],
        },
    )


def create_mundra_change_sheet_table(
    change_allotment_sheet,
    mundra_depot_merge_format,
    mundra_depot_merge_format2,
    mundra_depot_merge_format3,
    user_data,
    from_date,
    from_time,
    to_date,
    to_time,
    change_allotment_df_data,
):
    change_allotment_sheet.merge_range(
        "A1:U2", user_data["company_name"], mundra_depot_merge_format
    )
    change_allotment_sheet.merge_range(
        "A3:U3", user_data["company_address"], mundra_depot_merge_format2
    )

    change_allotment_sheet.merge_range(
        "A4:U4", "REPORT NAME : CHANGED ALLOTMENT", mundra_depot_merge_format3
    )
    change_allotment_sheet.merge_range("A5:U5", None, mundra_depot_merge_format3)
    change_allotment_sheet.merge_range(
        "A6:U6", f"SHIPPING LINE : MSC", mundra_depot_merge_format3
    )
    change_allotment_sheet.merge_range("A7:U7", None, mundra_depot_merge_format3)
    change_allotment_sheet.merge_range(
        "A8:U8",
        f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        mundra_depot_merge_format3,
    )
    change_allotment_sheet.merge_range("A9:U9", None, mundra_depot_merge_format3)
    change_allotment_sheet.merge_range(
        "A10:U10",
        f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        mundra_depot_merge_format3,
    )

    change_allotment_sheet.add_table(
        f"A12:H{12 + len(change_allotment_df_data)}",
        {
            "data": change_allotment_df_data,
            "columns": [
                {"header": "Sr.No"},
                {"header": "OLD CONTAINER NO"},
                {"header": "SIZE"},
                {"header": "BOOKING NO"},
                {"header": "REPLACED CONTAINER NO"},
                {"header": "DATE"},
                {"header": "TIME"},
                {"header": "SHIFT"},
            ],
        },
    )


def createSurveyorContainerReport(
    df_data,
    location,
    site,
    user_data,
    from_date_str,
    from_time_str,
    to_date_str,
    to_time_str,
    line,
):

    from_date, from_time, to_date, to_time = get_from_to_date_and_time(
        from_date_str, to_date_str, from_time_str, to_time_str
    )
    if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
        os.makedirs(os.path.join(BASE_DIR, "temp/"))
    dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
    base_temp_dir = os.path.join(BASE_DIR, "temp")
    os.makedirs(base_temp_dir, exist_ok=True)
    temp_file_path = os.path.join(base_temp_dir, f"surveyor_containers.xlsx")
    workbook = xlsxwriter.Workbook(temp_file_path)
    stock_sheet = workbook.add_worksheet("Surveyor Containers")
    merge_format = get_merge_format(workbook)
    merge_format2 = get_merge_format2(workbook)
    merge_format3 = get_merge_format3(workbook)
    line_name = "ALL" if line is None else line

    site = Site.objects.get(name=site, location__name=location)
    stock_sheet.merge_range("A1:U2", user_data["company_name"], merge_format)
    stock_sheet.merge_range("A3:U3", user_data["company_address"], merge_format2)

    stock_sheet.merge_range("A4:U4", "REPORT NAME : SURVEYOR CONTAINERS", merge_format3)
    stock_sheet.merge_range("A5:U5", None, merge_format3)
    stock_sheet.merge_range("A6:U6", f"SHIPPING LINE : {line_name}", merge_format3)
    stock_sheet.merge_range("A7:U7", None, merge_format3)
    stock_sheet.merge_range(
        "A8:U8",
        f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}",
        merge_format3,
    )
    stock_sheet.merge_range("A9:U9", None, merge_format3)
    stock_sheet.merge_range(
        "A10:U10",
        f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
        merge_format3,
    )
    stock_sheet.add_table(
        f"A12:J{12 + len(df_data)}",
        {
            "data": df_data,
            "columns": [
                {"header": "Sr No."},
                {"header": "Gate In Date Time"},
                {"header": "Container No"},
                {"header": "Size"},
                {"header": "Type"},
                {"header": "Client"},
                {"header": "Line"},
                {"header": "Manufacturing Date"},
                {"header": "Status"},
                {"header": "Stage"},
            ],
        },
    )
    workbook.close()
    return temp_file_path, f"{from_date}_{from_time}_to_{to_date}_{to_time}"


def create_lolo_invoice_report_wb(invoice_df_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M%S")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/lolo_invoice_report_{date}{time}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)

        invoice_sheet = generic_workbook.add_worksheet("dailyinvoice")
        invoice_sheet.add_table(
            f"A1:S{1 + len(invoice_df_data)}",
            {
                "data": invoice_df_data,
                "columns": [
                    {"header": "INVOICE"},
                    {"header": "DATE"},
                    {"header": "CUSTOMER"},
                    {"header": "GST No."},
                    {"header": "SalesLedger"},
                    {"header": "ITEM"},
                    {"header": "size"},
                    {"header": "Quantity"},
                    {"header": "Rate"},
                    {"header": "Value(qty *rate=value)"},
                    {"header": "IGST"},
                    {"header": "CGST"},
                    {"header": "SGST"},
                    {"header": "TOTAL"},
                    {"header": "Voucher Type(location)"},
                    {"header": "Cost Centre(site)"},
                    {"header": "P&L DATE(gate- in /gate-out date)"},
                    {"header": "Bill to"},
                    {"header": "Ship to"},
                ],
            },
        )

        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None
