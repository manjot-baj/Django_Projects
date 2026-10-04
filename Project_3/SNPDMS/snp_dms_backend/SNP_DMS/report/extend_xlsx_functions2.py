import xlsxwriter
from SNP_DMS.settings.base import BASE_DIR
import os
import datetime
from django.utils import timezone
import logging
import traceback


def create_seal_summary_report_wb(
    seal_issued_df_data,
    seal_stock_df_data,
    seal_stock_summary_df_data,
    seal_update_track_df_data,
    site,
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M%S")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/seal_summary_report_{date}{time}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)

        # sheet 1
        seal_sheet = generic_workbook.add_worksheet(f"{site}")
        seal_sheet.add_table(
            f"A1:I{1 + len(seal_issued_df_data)}",
            {
                "data": seal_issued_df_data,
                "columns": [
                    {"header": "Location"},
                    {"header": "Business Entity"},
                    {"header": "Box No"},
                    {"header": "Seal No"},
                    {"header": "Container No"},
                    {"header": "Booking Party Name"},
                    {"header": "Booking No"},
                    {"header": "Issued Date"},
                    {"header": "CLOSING STOCK"},
                ],
            },
        )

        # sheet 2
        stock_sheet = generic_workbook.add_worksheet(f"{site} STOCK")
        stock_sheet.add_table(
            f"A1:E{1 + len(seal_stock_df_data)}",
            {
                "data": seal_stock_df_data,
                "columns": [
                    {"header": "Location"},
                    {"header": "Business Entity"},
                    {"header": "Box No"},
                    {"header": "Seal No"},
                    {"header": "Closing Stock"},
                ],
            },
        )

        # sheet 3
        stock_summary_sheet = generic_workbook.add_worksheet(f"{site} STOCK SUMMARY")
        stock_summary_sheet.add_table(
            f"A1:D{1 + len(seal_stock_summary_df_data)}",
            {
                "data": seal_stock_summary_df_data,
                "columns": [
                    {"header": "Location"},
                    {"header": "Business Entity"},
                    {"header": "Box No"},
                    {"header": "Closing Stock"},
                ],
            },
        )

        # sheet 4
        seal_update_track_sheet = generic_workbook.add_worksheet(
            f"{site} SEAL UPDATE TRACK"
        )
        seal_update_track_sheet.add_table(
            f"A1:E{1 + len(seal_update_track_df_data)}",
            {
                "data": seal_update_track_df_data,
                "columns": [
                    {"header": "Container No"},
                    {"header": "Old Seal No"},
                    {"header": "New Seal No"},
                    {"header": "Updated At"},
                    {"header": "Remarks"},
                ],
            },
        )

        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None


def create_client_report_report_wb(client_df_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M%S")
        temp_file_path = os.path.join(BASE_DIR, f"temp/client_report_{date}{time}.xlsx")
        generic_workbook = xlsxwriter.Workbook(temp_file_path)

        # sheet 1
        client_sheet = generic_workbook.add_worksheet(f"clients")

        client_sheet.add_table(
            f"A1:D{1 + len(client_df_data)}",
            {
                "data": client_df_data,
                "columns": [
                    {"header": "name"},
                    {"header": "type"},
                    {"header": "gst_no"},
                    {"header": "required Y/N "},
                ],
            },
        )

        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None
