import xlsxwriter
from SNP_DMS.settings.base import BASE_DIR
import os, datetime
from django.utils import timezone
import logging, traceback


def create_creditor_wise_daily_report_wb(
    user_data, creditor, booking_df_data, from_date, to_date
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/creditor_wise_report_{date}{time}.xlsx"
        )
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Creditor")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", "REPORT NAME : CREDITOR WISE REPORT", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6", f"Creditor : {creditor}", booking_merge_format3
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date}  to {to_date} ",
            booking_merge_format3,
        )
        booking_sheet.merge_range("A9:U9", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A12:K{12 + len(booking_df_data)}",
            {
                "data": booking_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Lr No"},
                    {"header": "Lr date"},
                    {"header": "Truck No"},
                    {"header": "Containers No"},
                    {"header": "Destination"},
                    {"header": "Freight"},
                    {"header": "Advance"},
                    {"header": "Diesel"},
                    {"header": "Detention"},
                    {"header": "Balance"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path, f"{from_date}_to_{to_date}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_creditor_against_bill_ledger_wb(
    user_data, creditor, creditor_bill_df_data, from_date, to_date
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/creditor_wise_report_{date}{time}.xlsx"
        )
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Creditor_BillWise")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", "REPORT NAME : CREDITOR LEDGER BILL WISE", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6", f"Creditor : {creditor}", booking_merge_format3
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date}  to {to_date} ",
            booking_merge_format3,
        )
        booking_sheet.merge_range("A9:U9", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A12:H{12 + len(creditor_bill_df_data)}",
            {
                "data": creditor_bill_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Entry No"},
                    {"header": "Entry Date"},
                    {"header": "Total Amount"},
                    {"header": "Receipt Amount"},
                    {"header": "Kasar"},
                    {"header": "TDS"},
                    {"header": "Due Bill Amount"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path, f"{from_date}_to_{to_date}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_booking_daily_report_wb(user_data, booking_df_data, from_date, to_date):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/creditor_wise_report_{date}{time}.xlsx"
        )
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Booking_Report")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", "REPORT NAME : DAILY BOOKING REPORT", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)

        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6",
            f"REPORT DATE : {from_date}  to {to_date} ",
            booking_merge_format3,
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A8:U8",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A10:M{10 + len(booking_df_data)}",
            {
                "data": booking_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Lr No"},
                    {"header": "Lr date"},
                    {"header": "Truck No"},
                    {"header": "Creditor"},
                    {"header": "Containers No"},
                    {"header": "Destination"},
                    {"header": "Bill Party"},
                    {"header": "Freight"},
                    {"header": "Advance"},
                    {"header": "Diesel"},
                    {"header": "Detention"},
                    {"header": "Balance"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path, f"{from_date}_to_{to_date}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_all_creditor_balance_ledger_wb(
    user_data,
    creditor,
    creditor_bill_df_data,
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/creditor_balance_ledger{date}{time}.xlsx"
        )
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Creditor Balance Ledger")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", "REPORT NAME : CREDITOR BALANCE LEDGER ", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6", f"Creditor : {creditor}", booking_merge_format3
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)

        booking_sheet.merge_range(
            "A8:U8",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A10:H{10 + len(creditor_bill_df_data)}",
            {
                "data": creditor_bill_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Entry No"},
                    {"header": "Entry Date"},
                    {"header": "Total Amount"},
                    {"header": "Receipt Amount"},
                    {"header": "Kasar"},
                    {"header": "TDS"},
                    {"header": "Due Bill Amount"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_customer_against_bill_ledger_wb(
    user_data, customer, customer_bill_df_data, from_date, to_date
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/customer_wise_report_{date}{time}.xlsx"
        )
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Customer_Bill_Wise")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", "REPORT NAME : CUSTOMER LEDGER BILL WISE", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6", f"CUSTOMER : {customer}", booking_merge_format3
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date}  to {to_date} ",
            booking_merge_format3,
        )
        booking_sheet.merge_range("A9:U9", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A12:H{12 + len(customer_bill_df_data)}",
            {
                "data": customer_bill_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Entry No"},
                    {"header": "Entry Date"},
                    {"header": "Total Amount"},
                    {"header": "Receipt Amount"},
                    {"header": "Kasar"},
                    {"header": "TDS"},
                    {"header": "Due Bill Amount"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path, f"{from_date}_to_{to_date}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_all_customer_balance_ledger_wb(user_data, customer, customer_bill_df_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/customer_wise_report_{date}{time}.xlsx"
        )
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Customer_Bill_Wise")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", "REPORT NAME : CUSTOMER LEDGER BILL WISE", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6", f"CUSTOMER : {customer}", booking_merge_format3
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {date}",
            booking_merge_format3,
        )
        booking_sheet.merge_range("A9:U9", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A12:H{12 + len(customer_bill_df_data)}",
            {
                "data": customer_bill_df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Entry No"},
                    {"header": "Entry Date"},
                    {"header": "Total Amount"},
                    {"header": "Receipt Amount"},
                    {"header": "Kasar"},
                    {"header": "TDS"},
                    {"header": "Due Bill Amount"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_ledger_wb(
    user_data,
    from_date,
    to_date,
    entity,
    ledger_df_data,
    ledger_type,
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(BASE_DIR, f"temp/ledger_report_{date}{time}.xlsx")
        booking_workbook = xlsxwriter.Workbook(temp_file_path)
        booking_sheet = booking_workbook.add_worksheet("Ledger")
        booking_merge_format = booking_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = booking_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = booking_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        booking_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        booking_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        booking_sheet.merge_range(
            "A4:U4", f"REPORT NAME : {ledger_type}", booking_merge_format3
        )
        booking_sheet.merge_range("A5:U5", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A6:U6", f"LEDGER FOR : {entity}", booking_merge_format3
        )
        booking_sheet.merge_range("A7:U7", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A8:U8",
            f"REPORT DATE : {from_date}  to {to_date} ",
            booking_merge_format3,
        )
        booking_sheet.merge_range("A9:U9", None, booking_merge_format3)
        booking_sheet.merge_range(
            "A10:U10",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            booking_merge_format3,
        )

        booking_sheet.add_table(
            f"A12:G{12 + len(ledger_df_data)}",
            {
                "data": ledger_df_data,
                "columns": [
                    {"header": "Date"},
                    {"header": "Vch No"},
                    {"header": "Vch Type"},
                    {"header": "Particular"},
                    {"header": "Debit"},
                    {"header": "Credit"},
                    {"header": "Outstanding"},
                ],
            },
        )
        booking_workbook.close()
        return temp_file_path, f"{from_date}_to_{to_date}"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
