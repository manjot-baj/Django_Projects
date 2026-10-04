import re
from depot.models import GateInHistory, GateOutHistory, ContainerStock
from non_depot.models import NonDepotContainerStock
from master.models import Site
from datetime import datetime, timedelta
from SNP_DMS.settings.base import BASE_DIR
from django.utils import timezone
import xlsxwriter, os, logging, traceback
from django.core.mail import EmailMessage, get_connection
from decouple import config
from master.models_two import Client
from django.db.models import Sum, Value


def get_mgmt_lolo_revenue_data(
    movement, from_date_time, to_date_time, size, apply_charges, line, site
):
    history_model = GateInHistory if movement == "IN" else GateOutHistory
    data = history_model.objects.select_related(
        "container",
        "container__client",
        "lolo",
        "container__size",
        "container__location",
        "container__site",
    ).filter(
        date__range=(from_date_time, to_date_time),
        container__client__ref_code=line,
        lolo__apply_charges=apply_charges,
        container__size__name=size,
        container__site=site,
    )
    data = data.annotate(revenue=Sum("lolo__gross_amount"))
    data_amt = data.aggregate(Sum("revenue"))["revenue__sum"]
    if data_amt is None:
        data_amt = 0
    return data.count(), data_amt


def get_size_summary_data(from_date_time, to_date_time, size, line, site):
    # op count
    op_bal_in_count_size = (
        GateInHistory.objects.select_related(
            "container",
            "container__client",
            "container__size",
            "container__location",
            "container__site",
        )
        .filter(
            date__lte=from_date_time,
            container__client__ref_code=line,
            container__size__name=size,
            container__site=site,
        )
        .count()
    )
    op_bal_out_count_size = (
        GateOutHistory.objects.select_related(
            "container",
            "container__client",
            "container__size",
            "container__location",
            "container__site",
        )
        .filter(
            date__lte=from_date_time,
            container__client__ref_code=line,
            container__size__name=size,
            container__site=site,
        )
        .count()
    )
    op_bal_count = op_bal_in_count_size - op_bal_out_count_size
    # current count
    in_data_count_size = (
        GateInHistory.objects.select_related(
            "container",
            "container__client",
            "container__size",
            "container__location",
            "container__site",
        )
        .filter(
            date__range=(from_date_time, to_date_time),
            container__client__ref_code=line,
            container__size__name=size,
            container__site=site,
        )
        .count()
    )
    out_data_count_size = (
        GateOutHistory.objects.select_related(
            "container",
            "container__client",
            "container__size",
            "container__location",
            "container__site",
        )
        .filter(
            date__range=(from_date_time, to_date_time),
            container__client__ref_code=line,
            container__size__name=size,
            container__site=site,
        )
        .count()
    )
    # close count
    cl_bal_count_size = op_bal_count + in_data_count_size - out_data_count_size
    return op_bal_count, in_data_count_size, out_data_count_size, cl_bal_count_size


def get_lolo_revenue_df_data(revenue_data):
    revenue_data.append(
        {
            "line": "Total",
            "party_20_qty": sum(item["party_20_qty"] for item in revenue_data),
            "party_20_amt": sum(item["party_20_amt"] for item in revenue_data),
            "line_20_qty": sum(item["line_20_qty"] for item in revenue_data),
            "line_20_amt": sum(item["line_20_amt"] for item in revenue_data),
            "party_40_qty": sum(item["party_40_qty"] for item in revenue_data),
            "party_40_amt": sum(item["party_40_amt"] for item in revenue_data),
            "line_40_qty": sum(item["line_40_qty"] for item in revenue_data),
            "line_40_amt": sum(item["line_40_amt"] for item in revenue_data),
        }
    )
    revenue_df_data = [
        [
            each.get("line"),
            each.get("party_20_qty"),
            each.get("party_20_amt"),
            each.get("line_20_qty"),
            each.get("line_20_amt"),
            each.get("party_40_qty"),
            each.get("party_40_amt"),
            each.get("line_40_qty"),
            each.get("line_40_amt"),
        ]
        for each in revenue_data
    ]
    return revenue_df_data


def get_summary_df_data(summary_data):
    summary_data.append(
        {
            "Line": "Total",
            "OpBal": sum(item["OpBal"] for item in summary_data),
            "InQty": sum(item["InQty"] for item in summary_data),
            "OutQty": sum(item["OutQty"] for item in summary_data),
            "ClBal": sum(item["ClBal"] for item in summary_data),
        }
    )
    summary_df_data = [
        [
            each.get("Line"),
            each.get("OpBal"),
            each.get("InQty"),
            each.get("OutQty"),
            each.get("ClBal"),
        ]
        for each in summary_data
    ]
    return summary_df_data


def get_merge_format(all_line_workbook):
    all_line_merge_format = all_line_workbook.add_format(
        {
            "bold": 2,
            "align": "center",
            "valign": "vcenter",
            "font_color": "#e0a92a",
            "font_size": 18,
        }
    )
    all_line_merge_format3 = all_line_workbook.add_format(
        {
            "bold": 1,
            "font_size": 11,
        }
    )
    all_site_seperator = all_line_workbook.add_format(
        {
            "bg_color": "#000000",
        }
    )
    return all_line_merge_format, all_line_merge_format3, all_site_seperator


def summary_sheet_data(
    summary_sheet,
    all_line_merge_format,
    all_line_merge_format3,
    all_site_seperator,
    from_date,
    from_time,
    to_date,
    to_time,
    movemnt_summary_df_data,
):
    report_name = "REPORT NAME : SUMMARY"
    report_date = f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}"
    summary_sheet.merge_range(
        "A1:U2", "Golden Horn Containers Service", all_line_merge_format
    )
    summary_sheet.merge_range("A3:U3", report_name, all_line_merge_format3)
    summary_sheet.merge_range("A4:U4", report_date, all_line_merge_format3)
    summary_sheet.merge_range("A5:U5", None, all_line_merge_format3)

    count = 7
    for df_data in movemnt_summary_df_data:
        summary_sheet.merge_range(
            f"A{count - 2}:L{count - 2}", None, all_site_seperator
        )
        summary_sheet.write(f"A{count}", df_data["site_name"])
        summary_sheet.add_table(
            f"B{count}:F{count + len(df_data['summary_20_df_data'])}",
            {
                "data": df_data["summary_20_df_data"],
                "columns": [
                    {"header": "Line"},
                    {"header": "20_OpBal"},
                    {"header": "20_InQty"},
                    {"header": "20_OutQty"},
                    {"header": "20_ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        summary_sheet.add_table(
            f"H{count}:L{count + len(df_data['summary_40_df_data'])}",
            {
                "data": df_data["summary_40_df_data"],
                "columns": [
                    {"header": "Line"},
                    {"header": "40_OpBal"},
                    {"header": "40_InQty"},
                    {"header": "40_OutQty"},
                    {"header": "40_ClBal"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        # summary_sheet.add_table(
        #     f"B{count + len(df_data['summary_20_df_data']) + 2}:F{count + len(df_data['summary_20_df_data']) + 2 + len(df_data['summary_40_df_data'])}",
        #     {
        #         "data": df_data["summary_40_df_data"],
        #         "columns": [
        #             {"header": "Line"},
        #             {"header": "40_OpBal"},
        #             {"header": "40_InQty"},
        #             {"header": "40_OutQty"},
        #             {"header": "40_ClBal"},
        #         ],
        #         "first_column": True,
        #         "autofilter": False,
        #     },
        # )
        count = count + len(df_data["summary_20_df_data"]) + 5
    return summary_sheet


def lolo_revenue_sheet_data(
    lolo_revenue_sheet,
    all_line_merge_format,
    all_line_merge_format3,
    all_site_seperator,
    from_date,
    from_time,
    to_date,
    to_time,
    lolo_revenue_df_data,
):
    report_name = "REPORT NAME : LOLO REVENUE"
    report_date = f"REPORT DATE : {from_date} {from_time} to {to_date} {to_time}"
    lolo_revenue_sheet.merge_range(
        "A1:U2", "Golden Horn Containers Service", all_line_merge_format
    )
    lolo_revenue_sheet.merge_range("A3:U3", report_name, all_line_merge_format3)
    lolo_revenue_sheet.merge_range("A4:U4", report_date, all_line_merge_format3)
    lolo_revenue_sheet.merge_range("A5:U5", None, all_line_merge_format3)

    count = 7
    for df_data in lolo_revenue_df_data:
        lolo_revenue_sheet.merge_range(
            f"A{count - 2}:L{count - 2}", None, all_site_seperator
        )
        lolo_revenue_sheet.write(f"A{count}", df_data["site_name"])
        lolo_revenue_sheet.write(f"F{count - 1}", "IN")
        lolo_revenue_sheet.add_table(
            f"B{count}:J{count + len(df_data['lolo_in_revenue_df_data'])}",
            {
                "data": df_data["lolo_in_revenue_df_data"],
                "columns": [
                    {"header": "Line"},
                    {"header": "Party 20 QTY"},
                    {"header": "Party 20 AMT"},
                    {"header": "Line 20 QTY"},
                    {"header": "Line 20 AMT"},
                    {"header": "Party 40 QTY"},
                    {"header": "Party 40 AMT"},
                    {"header": "Line 40 QTY"},
                    {"header": "Line 40 AMT"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        lolo_revenue_sheet.write(f"P{count - 1}", "OUT")
        lolo_revenue_sheet.add_table(
            f"L{count}:T{count + len(df_data['lolo_out_revenue_df_data'])}",
            {
                "data": df_data["lolo_out_revenue_df_data"],
                "columns": [
                    {"header": "Line"},
                    {"header": "Party 20 QTY"},
                    {"header": "Party 20 AMT"},
                    {"header": "Line 20 QTY"},
                    {"header": "Line 20 AMT"},
                    {"header": "Party 40 QTY"},
                    {"header": "Party 40 AMT"},
                    {"header": "Line 40 QTY"},
                    {"header": "Line 40 AMT"},
                ],
                "first_column": True,
                "autofilter": False,
            },
        )
        count = count + len(df_data["lolo_in_revenue_df_data"]) + 5
    return lolo_revenue_sheet


def create_all_line_daily_report_wb(
    movemnt_summary_df_data,
    lolo_revenue_df_data,
    pendency_df_data,
    from_date,
    from_time,
    to_date,
    to_time,
    file_name,
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.now().astimezone(timezone.get_current_timezone())
        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.xlsx")
        all_line_workbook = xlsxwriter.Workbook(temp_file_path)
        summary_sheet = all_line_workbook.add_worksheet("SUMMARY")
        lolo_revenue_sheet = all_line_workbook.add_worksheet("LOLO REVENUE")
        pendency_sheet = all_line_workbook.add_worksheet("PENDENCY REPORT")
        (
            all_line_merge_format,
            all_line_merge_format3,
            all_site_seperator,
        ) = get_merge_format(all_line_workbook)

        # SUMMARY Sheet Data
        summary_sheet_data(
            summary_sheet,
            all_line_merge_format,
            all_line_merge_format3,
            all_site_seperator,
            from_date,
            from_time,
            to_date,
            to_time,
            movemnt_summary_df_data,
        )
        lolo_revenue_sheet_data(
            lolo_revenue_sheet,
            all_line_merge_format,
            all_line_merge_format3,
            all_site_seperator,
            from_date,
            from_time,
            to_date,
            to_time,
            lolo_revenue_df_data,
        )
        pendency_sheet_data(
            pendency_sheet,
            all_line_merge_format,
            all_line_merge_format3,
            all_site_seperator,
            to_date,
            pendency_df_data,
        )
        all_line_workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def send_report_mail_to_mgmt(attachment_list, from_date, to_date):
    try:
        subject = f"Daily Activity Report {from_date} to {to_date}, for Management Team"
        to_email_list = [
            "tapash.kumar@goldenhorncontainers.com",
            "manash.samaddar@goldenhorncontainers.com",
        ]
        cc_email_list = [
            "prakash.rewani@sunandpearls.com",
            "manjot.bajwa@sunandpearls.com",
            "pooja.kumari@sunandpearls.com",
            "arun.jeyabalan@sunandpearls.com",
            "samir.jena@sunandpearls.com",
        ]
        # to_email_list = ["manjot.bajwa@sunandpearls.com"]
        # cc_email_list = ["manjot.bajwa@sunandpearls.com"]
        msg = EmailMessage(
            subject=subject,
            body="Please find the attachments",
            from_email=config("EMAIL_HOST_USER"),
            to=to_email_list,
            cc=cc_email_list,
        )
        for each in attachment_list:
            msg.attach_file(each)
        msg.send()
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def send_report_mail_to_manager(
    attachment_list,
    manager,
    site,
    to_email_list,
    cc_email_list,
    is_westim_destim=True,
    data=None,
):
    try:
        body = f"Dear {manager},\n\nI hope this message finds you well. This is to inform you that containers at your site, {site}, are currently marked as OUT. However, the Westim and Destim status of these containers is still pending.\n\nKindly find the necessary attachments enclosed with this email for your reference.\n\nThank you for your attention to this matter.\n\nSincerely,\nTeam"
        subject = f"Westim Destim Report of Already Out Containers of {site}"
        if not is_westim_destim:
            body = f"""Dear {manager},
On your site {site}, System showing some containers in stock stuck for 30 or more days, Please check details in below order,\n
{data}\n\nKindly find the necessary attachments enclosed with this email for your reference.\n\nThank you for your attention to this matter.\n\nSincerely,\nTeam"""
            subject = f"System Showing Stuck Stock on {site}"
        msg = EmailMessage(
            subject=subject,
            body=body,
            from_email=config("EMAIL_HOST_USER"),
            to=to_email_list,
            cc=cc_email_list,
        )
        for each in attachment_list:
            msg.attach_file(each)
        msg.send()
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def calculate_days_difference(current_date, date_value):
    return (current_date - date_value.date()).days


def get_pendency_count_data(size, line, site):
    try:
        data = ContainerStock.objects.filter(
            container__client__ref_code=line,
            container__size__name=size,
            container__site=site,
            container__status="IN",
            container_status="IN",
        ).values(
            "status",
            "survey_pending_in_date_time",
            "estimate_pending_in_date_time",
            "approval_pending_in_date_time",
            "approved_in_date_time",
            "under_repair_in_date_time",
        )

        survey_pending_30_days_count = 0
        survey_pending_31_to_60_days_count = 0
        survey_pending_61_to_90_days_count = 0
        survey_pending_above_90_days_count = 0
        estimate_pending_30_days_count = 0
        estimate_pending_31_to_60_days_count = 0
        estimate_pending_61_to_90_days_count = 0
        estimate_pending_above_90_days_count = 0
        approval_pending_30_days_count = 0
        approval_pending_31_to_60_days_count = 0
        approval_pending_61_to_90_days_count = 0
        approval_pending_above_90_days_count = 0
        repair_pending_30_days_count = 0
        repair_pending_31_to_60_days_count = 0
        repair_pending_61_to_90_days_count = 0
        repair_pending_above_90_days_count = 0
        current_date = datetime.today().date()

        for each in data:
            if each["status"] == "Survey Pending":
                survey_date = each["survey_pending_in_date_time"]
                if calculate_days_difference(current_date, survey_date) < 31:
                    survey_pending_30_days_count += 1
                elif (
                    calculate_days_difference(current_date, survey_date) > 30
                    and calculate_days_difference(current_date, survey_date) < 61
                ):
                    survey_pending_31_to_60_days_count += 1
                elif (
                    calculate_days_difference(current_date, survey_date) > 60
                    and calculate_days_difference(current_date, survey_date) < 91
                ):
                    survey_pending_61_to_90_days_count += 1
                else:
                    survey_pending_above_90_days_count += 1

            if each["status"] == "Estimate Pending":
                estimate_date = each["estimate_pending_in_date_time"]
                if calculate_days_difference(current_date, estimate_date) < 31:
                    estimate_pending_30_days_count += 1
                elif (
                    calculate_days_difference(current_date, estimate_date) > 30
                    and calculate_days_difference(current_date, estimate_date) < 61
                ):
                    estimate_pending_31_to_60_days_count += 1
                elif (
                    calculate_days_difference(current_date, estimate_date) > 60
                    and calculate_days_difference(current_date, estimate_date) < 91
                ):
                    estimate_pending_61_to_90_days_count += 1
                else:
                    estimate_pending_above_90_days_count += 1

            if each["status"] == "Approval Pending":
                approval_date = each["approval_pending_in_date_time"]
                if calculate_days_difference(current_date, approval_date) < 31:
                    approval_pending_30_days_count += 1
                elif (
                    calculate_days_difference(current_date, approval_date) > 30
                    and calculate_days_difference(current_date, approval_date) < 61
                ):
                    approval_pending_31_to_60_days_count += 1
                elif (
                    calculate_days_difference(current_date, approval_date) > 60
                    and calculate_days_difference(current_date, approval_date) < 91
                ):
                    approval_pending_61_to_90_days_count += 1
                else:
                    approval_pending_above_90_days_count += 1

            if each["status"] == "Approved":
                approved_date = each["approved_in_date_time"]
                if calculate_days_difference(current_date, approved_date) < 31:
                    repair_pending_30_days_count += 1
                elif (
                    calculate_days_difference(current_date, approved_date) > 30
                    and calculate_days_difference(current_date, approved_date) < 61
                ):
                    repair_pending_31_to_60_days_count += 1
                elif (
                    calculate_days_difference(current_date, approved_date) > 60
                    and calculate_days_difference(current_date, approved_date) < 91
                ):
                    repair_pending_61_to_90_days_count += 1
                else:
                    repair_pending_above_90_days_count += 1

            if each["status"] == "Under Repairing":
                repair_date = each["under_repair_in_date_time"]
                if calculate_days_difference(current_date, repair_date) < 31:
                    repair_pending_30_days_count += 1
                elif (
                    calculate_days_difference(current_date, repair_date) > 30
                    and calculate_days_difference(current_date, repair_date) < 61
                ):
                    repair_pending_31_to_60_days_count += 1
                elif (
                    calculate_days_difference(current_date, repair_date) > 60
                    and calculate_days_difference(current_date, repair_date) < 91
                ):
                    repair_pending_61_to_90_days_count += 1
                else:
                    repair_pending_above_90_days_count += 1

        return (
            survey_pending_30_days_count,
            survey_pending_31_to_60_days_count,
            survey_pending_61_to_90_days_count,
            survey_pending_above_90_days_count,
            estimate_pending_30_days_count,
            estimate_pending_31_to_60_days_count,
            estimate_pending_61_to_90_days_count,
            estimate_pending_above_90_days_count,
            approval_pending_30_days_count,
            approval_pending_31_to_60_days_count,
            approval_pending_61_to_90_days_count,
            approval_pending_above_90_days_count,
            repair_pending_30_days_count,
            repair_pending_31_to_60_days_count,
            repair_pending_61_to_90_days_count,
            repair_pending_above_90_days_count,
        )
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_pendency_df_data(pendency_data):
    try:
        pendency_data.append(
            {
                "line": "Total",
                "survey_pending_20_count": sum(
                    item["survey_pending_20_count"] for item in pendency_data
                ),
                "survey_pending_40_count": sum(
                    item["survey_pending_40_count"] for item in pendency_data
                ),
                "estimate_pending_20_count": sum(
                    item["estimate_pending_20_count"] for item in pendency_data
                ),
                "estimate_pending_40_count": sum(
                    item["estimate_pending_40_count"] for item in pendency_data
                ),
                "approval_pending_20_count": sum(
                    item["approval_pending_20_count"] for item in pendency_data
                ),
                "approval_pending_40_count": sum(
                    item["approval_pending_40_count"] for item in pendency_data
                ),
                "repair_pending_20_count": sum(
                    item["repair_pending_20_count"] for item in pendency_data
                ),
                "repair_pending_40_count": sum(
                    item["repair_pending_40_count"] for item in pendency_data
                ),
            }
        )

        pendency_df_data = [
            [
                each.get("line"),
                each.get("survey_pending_20_count"),
                each.get("survey_pending_40_count"),
                each.get("estimate_pending_20_count"),
                each.get("estimate_pending_40_count"),
                each.get("approval_pending_20_count"),
                each.get("approval_pending_40_count"),
                each.get("repair_pending_20_count"),
                each.get("repair_pending_40_count"),
            ]
            for each in pendency_data
        ]
        return pendency_df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def pendency_sheet_data(
    pendency_sheet,
    all_line_merge_format,
    all_line_merge_format3,
    all_site_seperator,
    to_date,
    pendency_df_data,
):
    try:
        report_name = "REPORT NAME : PENDENCY REPORT"
        report_date = f"REPORT TILL : {to_date}"
        pendency_sheet.merge_range(
            "A1:U2", "Golden Horn Containers Service", all_line_merge_format
        )
        pendency_sheet.merge_range("A3:U3", report_name, all_line_merge_format3)
        pendency_sheet.merge_range("A4:U4", report_date, all_line_merge_format3)
        pendency_sheet.merge_range("A5:U5", None, all_line_merge_format3)

        count = 7
        for df_data in pendency_df_data:
            pendency_sheet.merge_range(
                f"A{count - 2}:L{count - 2}", None, all_site_seperator
            )
            pendency_sheet.write(f"A{count}", df_data["site_name"])
            pendency_sheet.write(f"F{count - 1}", "UPTO 30 DAYS")
            pendency_sheet.add_table(
                f"B{count}:J{count + len(df_data['pendency_upto_30_days_df_data'])}",
                {
                    "data": df_data["pendency_upto_30_days_df_data"],
                    "columns": [
                        {"header": "Line"},
                        {"header": "SP-20"},
                        {"header": "SP-40"},
                        {"header": "EP-20"},
                        {"header": "EP-40"},
                        {"header": "AP-20"},
                        {"header": "AP-40"},
                        {"header": "RP-20"},
                        {"header": "RP-40"},
                    ],
                    "first_column": True,
                    "autofilter": False,
                },
            )

            pendency_sheet.write(f"P{count - 1}", "31-60 DAYS")
            pendency_sheet.add_table(
                f"L{count}:T{count + len(df_data['pendency_30_to_60_days_df_data'])}",
                {
                    "data": df_data["pendency_30_to_60_days_df_data"],
                    "columns": [
                        {"header": "Line"},
                        {"header": "SP-20"},
                        {"header": "SP-40"},
                        {"header": "EP-20"},
                        {"header": "EP-40"},
                        {"header": "AP-20"},
                        {"header": "AP-40"},
                        {"header": "RP-20"},
                        {"header": "RP-40"},
                    ],
                    "first_column": True,
                    "autofilter": False,
                },
            )
            pendency_sheet.write(f"Z{count - 1}", "61-90 DAYS")
            pendency_sheet.add_table(
                f"V{count}:AD{count + len(df_data['pendency_61_to_90_days_df_data'])}",
                {
                    "data": df_data["pendency_61_to_90_days_df_data"],
                    "columns": [
                        {"header": "Line"},
                        {"header": "SP-20"},
                        {"header": "SP-40"},
                        {"header": "EP-20"},
                        {"header": "EP-40"},
                        {"header": "AP-20"},
                        {"header": "AP-40"},
                        {"header": "RP-20"},
                        {"header": "RP-40"},
                    ],
                    "first_column": True,
                    "autofilter": False,
                },
            )
            pendency_sheet.write(f"AJ{count - 1}", "ABOVE 90 DAYS")
            pendency_sheet.add_table(
                f"AF{count}:AN{count + len(df_data['pendency_above_90_days_df_data'])}",
                {
                    "data": df_data["pendency_above_90_days_df_data"],
                    "columns": [
                        {"header": "Line"},
                        {"header": "SP-20"},
                        {"header": "SP-40"},
                        {"header": "EP-20"},
                        {"header": "EP-40"},
                        {"header": "AP-20"},
                        {"header": "AP-40"},
                        {"header": "RP-20"},
                        {"header": "RP-40"},
                    ],
                    "first_column": True,
                    "autofilter": False,
                },
            )
            count = count + len(df_data["pendency_upto_30_days_df_data"]) + 5
        return pendency_sheet
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def destim_westim_row_data(each):
    try:
        data = {}
        gate_in_data = each.gate_in
        gate_out_data = each.gate_out
        container_data = each.container
        data["in_date_time"] = (
            gate_in_data.in_date.strftime("%d/%m/%Y")
            + " "
            + gate_in_data.in_time.strftime("%H:%M")
        )
        data["out_date_time"] = (
            gate_out_data.out_date.strftime("%d/%m/%Y")
            + " "
            + gate_out_data.out_time.strftime("%H:%M")
        )
        data["container_no"] = container_data.container_no
        data["stage"] = each.stage
        data["status"] = each.status
        cal = ""
        if not gate_out_data is None:
            cal = gate_out_data.out_date - gate_in_data.in_date
        else:
            cal = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                - gate_in_data.in_date
            )

        data["age"] = str(cal.days)

        data["estimate_westim"] = "NOT SENT"
        if each.is_estimate_westim_sent is True:
            data["estimate_westim"] = "SENT"

        data["repair_destim"] = "NOT SENT"
        if each.is_repair_destim_sent is True:
            data["repair_destim"] = "SENT"
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_data_for_destim_westim(site_name):
    try:
        site = Site.objects.get(name=site_name)
        site_type = site.type
        model = ContainerStock if site_type == "DEPOT" else NonDepotContainerStock
        data = model.objects.filter(
            is_repair_destim_sent=False,
            container__site=site,
            container_status="OUT",
            container__site__mnr_module=True,
            container__automatic_mnr_status_change=True,
        )
        count = 0
        data_list = []
        for each_one in data:
            count += 1
            each_data = destim_westim_row_data(each_one)
            each_data["sl_no"] = count
            data_list.append(each_data)
        sl_no = [each.get("sl_no") for each in data_list]
        in_date_time = [each.get("in_date_time") for each in data_list]
        out_date_time = [each.get("out_date_time") for each in data_list]
        container_no = [each.get("container_no") for each in data_list]
        stage = [each.get("stage") for each in data_list]
        status = [each.get("status") for each in data_list]
        age = [each.get("age") for each in data_list]
        estimate_westim = [each.get("estimate_westim") for each in data_list]
        repair_destim = [each.get("repair_destim") for each in data_list]
        df_data = [
            [
                sl_no[i],
                in_date_time[i],
                out_date_time[i],
                container_no[i],
                stage[i],
                status[i],
                age[i],
                estimate_westim[i],
                repair_destim[i],
            ]
            for i in range(len(sl_no))
        ]
        return df_data
    except:
        df_data = []
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return df_data


def create_westim_destim_reports(df_data, site):
    try:
        tz = timezone.get_current_timezone()
        current_datetime = datetime.now().astimezone(tz)
        datetime_24_hours_ago = current_datetime - timedelta(hours=24)
        datetime_24_hours_ago = datetime_24_hours_ago.astimezone(tz)
        from_date = datetime_24_hours_ago.date()
        to_date = current_datetime.date()
        time_obj = datetime.strptime("08:00", "%H:%M").time()
        file_name = (
            f"all_location_site_summary_{from_date}_{time_obj}_to_{to_date}_{time_obj}"
        )
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.now().astimezone(timezone.get_current_timezone())
        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.xlsx")
        workbook = xlsxwriter.Workbook(temp_file_path)
        destim_westim_sheet = workbook.add_worksheet("DESTIM WESTIM")
        (
            merge_format,
            merge_format3,
            site_seperator,
        ) = get_merge_format(workbook)
        report_name = "REPORT NAME : WESTIM DESTIM STATUS OF ALREADY OUT CONTAINERS WITH PENDING MNR"
        report_date = f"REPORT DATE : {from_date} to {to_date} "
        destim_westim_sheet.merge_range(
            "A1:U2", "Golden Horn Containers Service", merge_format
        )
        destim_westim_sheet.merge_range("A3:U3", report_name, merge_format3)
        destim_westim_sheet.merge_range("A4:U4", report_date, merge_format3)
        destim_westim_sheet.merge_range("A5:U5", f"SITE: {site}", merge_format3)
        destim_westim_sheet.merge_range("A6:U6", None, merge_format3)
        destim_westim_sheet.add_table(
            f"A8:I{8 + len(df_data)}",
            {
                "data": df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "IN DATE TIME"},
                    {"header": "OUT DATE TIME"},
                    {"header": "CONTAINER NO"},
                    {"header": "STAGE"},
                    {"header": "STATUS"},
                    {"header": "AGE"},
                    {"header": "ESTIMATE WESTIM"},
                    {"header": "REPAIR DESTIM"},
                ],
            },
        )
        workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_stuck_stock_containers(site_name):
    try:
        site = Site.objects.get(name=site_name)
        site_stock = None
        if site.type == "DEPOT":
            site_stock = (
                ContainerStock.objects.select_related(
                    "container",
                    "gate_in",
                )
                .filter(
                    container_status="IN",
                    container__status="IN",
                    container__site=site,
                )
                .order_by("-gate_in__in_date")
            )
        else:
            site_stock = (
                NonDepotContainerStock.objects.select_related(
                    "container",
                    "gate_in",
                )
                .filter(
                    container_status="IN",
                    container__status="IN",
                    container__site=site,
                )
                .order_by("-gate_in__in_date")
            )

        stock_info = {}
        stock_data = []
        for stock in site_stock:
            container_age = (
                datetime.now().astimezone(timezone.get_current_timezone()).date()
                - stock.gate_in.in_date
            ).days

            if container_age >= 30:
                stock_data.append(stock)
                ref_code = stock.container.client.ref_code
                if ref_code not in stock_info:
                    stock_info.update({ref_code: 1})
                else:
                    stock_info[ref_code] = stock_info.get(ref_code, 0) + 1
        return stock_info, stock_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_data_for_stuck_stock_report(stock_data):
    try:
        count = 0
        data_list = []
        for each_one in stock_data:
            count += 1
            each_data = each_one.get_mnr_container_header_data()
            each_data["sl_no"] = count
            data_list.append(each_data)
        sl_no = [each.get("sl_no") for each in data_list]
        container_no = [each.get("container_no") for each in data_list]
        size_type = [each.get("size_type") for each in data_list]
        line = [each.get("line") for each in data_list]
        in_date = [each.get("in_date") for each in data_list]
        status = [each.get("status") for each in data_list]
        stage = [each.get("stage") for each in data_list]
        age = [each.get("aging") for each in data_list]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size_type[i],
                line[i],
                in_date[i],
                status[i],
                stage[i],
                age[i],
            ]
            for i in range(len(sl_no))
        ]
        return df_data
    except:
        df_data = []
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return df_data


def create_stuck_stock_reports(df_data, site):
    try:
        tz = timezone.get_current_timezone()
        current_datetime = datetime.now().astimezone(tz)
        date = current_datetime.date()
        time = current_datetime.time()
        file_name = f"{site}_stuck_stock_report_{date}_{time}"
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.now().astimezone(timezone.get_current_timezone())
        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.xlsx")
        workbook = xlsxwriter.Workbook(temp_file_path)
        stuck_stock_sheet = workbook.add_worksheet("STUCK STOCK")
        (
            merge_format,
            merge_format3,
            site_seperator,
        ) = get_merge_format(workbook)
        report_name = "REPORT NAME : Stuck Stock"
        report_date = f"REPORT DATE : {date} "
        stuck_stock_sheet.merge_range(
            "A1:U2", "Golden Horn Containers Service", merge_format
        )
        stuck_stock_sheet.merge_range("A3:U3", report_name, merge_format3)
        stuck_stock_sheet.merge_range("A4:U4", report_date, merge_format3)
        stuck_stock_sheet.merge_range("A5:U5", f"SITE: {site}", merge_format3)
        stuck_stock_sheet.merge_range("A6:U6", None, merge_format3)
        stuck_stock_sheet.add_table(
            f"A7:H{7 + len(df_data)}",
            {
                "data": df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "CONTAINER NO"},
                    {"header": "SIZE/TYPE"},
                    {"header": "LINE"},
                    {"header": "IN DATE"},
                    {"header": "STATUS"},
                    {"header": "STAGE"},
                    {"header": "AGE"},
                ],
            },
        )
        workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
