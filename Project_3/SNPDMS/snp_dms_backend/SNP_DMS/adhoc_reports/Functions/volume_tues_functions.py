import os
import xlsxwriter
import logging
import traceback
import datetime
import random
from django.utils import timezone
from SNP_DMS.settings.base import BASE_DIR
from depot.models import GateInHistory, GateOutHistory, ContainerStock
from master.models import Site, Location
from adhoc_reports.utils import send_adhoc_report_to_mgmnt, upload_adhoc_report_to_s3
from non_depot.models import (
    NonDepotContainerStock,
    NonDepotGateOut,
)
from mnr.models import Survey, Estimate, Approval, Repair


def get_depot_site_list(location, site):
    try:
        if location is None and site is None:
            return Site.objects.filter(
                location__in=Location.objects.all(), type="DEPOT"
            )
        elif location and site is None:
            location_obj = Location.objects.get(name=location)
            return Site.objects.filter(location=location_obj, type="DEPOT")
        elif location and site:
            location_obj = Location.objects.get(name=location)
            return [Site.objects.get(name=site, location=location_obj, type="DEPOT")]
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
    return None


def get_site_list(location, site):
    try:
        if location is None and site is None:
            return Site.objects.filter(location__in=Location.objects.all())
        elif location and site is None:
            location_obj = Location.objects.get(name=location)
            return Site.objects.filter(location=location_obj)
        elif location and site:
            location_obj = Location.objects.get(name=location)
            return [Site.objects.get(name=site, location=location_obj)]
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
    return None


def get_requested_date_stock(
    from_date_str, to_date_str, site, movement, client_type, size
):
    try:
        from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
        to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        tz = timezone.get_current_timezone()
        history_model = GateInHistory if movement == "IN" else GateOutHistory

        return history_model.objects.filter(
            date__range=(
                datetime.datetime.combine(
                    from_date, datetime.datetime.min.time()
                ).astimezone(tz),
                datetime.datetime.combine(
                    to_date, datetime.datetime.max.time()
                ).astimezone(tz),
            ),
            container__site=site,
            container__size__name=size,
            lolo__apply_charges=client_type,
        ).count()
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
    return None


def get_opening_stock(from_date_str, site, movement, size):
    try:
        from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
        history_model = GateInHistory if movement == "IN" else GateOutHistory
        filter_key = (
            "gate_in__in_date__lt" if movement == "IN" else "gate_out__out_date__lt"
        )

        return history_model.objects.filter(
            **{filter_key: from_date},
            container__site=site,
            container__size__name=size,
        ).count()
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None


def detect_mnr_stage(site_type, stock):
    survey = None

    if site_type == "DEPOT":
        if Survey.objects.select_related("depot").filter(depot=stock).exists():
            survey = (
                Survey.objects.select_related("depot").filter(depot=stock).latest("pk")
            )
    else:
        if Survey.objects.select_related("non_depot").filter(non_depot=stock).exists():
            survey = (
                Survey.objects.select_related("non_depot")
                .filter(non_depot=stock)
                .latest("pk")
            )

    if survey:
        if Repair.objects.filter(parent__parent=survey).exists():
            repair = Repair.objects.filter(parent__parent=survey).latest("pk")
            if repair.placement and not repair.complete:
                return "repair_pending"

            elif repair.placement and repair.complete:
                return "available"

        elif Approval.objects.filter(parent__parent=survey).exists():
            approval = Approval.objects.filter(parent__parent=survey).latest("pk")
            if approval.is_proceed and approval.is_approved:
                return "repair_pending"

        elif Estimate.objects.filter(parent=survey).exists():
            estimate = Estimate.objects.filter(parent=survey).latest("pk")
            if estimate.is_proceed:
                return "approval_pending"
        else:
            if survey.is_draft:
                return "survey_pending"

            elif survey.is_proceed:
                return "estimate_pending"
    return "survey_pending"


def dsr_helper(site):
    try:
        less_than_15_days = {
            "site": site.name,
            "oos_days": "<= 15",
            "pending_survey_20": 0,
            "pending_survey_40": 0,
            "pending_estimation_20": 0,
            "pending_estimation_40": 0,
            "pending_approval_20": 0,
            "pending_approval_40": 0,
            "pending_repair_20": 0,
            "pending_repair_40": 0,
            "av_20": 0,
            "av_40": 0,
        }
        between_16_to_30_days = {
            "site": "",
            "oos_days": "16 to 30",
            "pending_survey_20": 0,
            "pending_survey_40": 0,
            "pending_estimation_20": 0,
            "pending_estimation_40": 0,
            "pending_approval_20": 0,
            "pending_approval_40": 0,
            "pending_repair_20": 0,
            "pending_repair_40": 0,
            "av_20": 0,
            "av_40": 0,
        }
        above_30_days = {
            "site": "",
            "oos_days": "> 30",
            "pending_survey_20": 0,
            "pending_survey_40": 0,
            "pending_estimation_20": 0,
            "pending_estimation_40": 0,
            "pending_approval_20": 0,
            "pending_approval_40": 0,
            "pending_repair_20": 0,
            "pending_repair_40": 0,
            "av_20": 0,
            "av_40": 0,
        }

        tz = timezone.get_current_timezone()
        today = datetime.datetime.now().astimezone(tz)

        stock_model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
        stocks = stock_model.objects.filter(
            container__site=site,
            container__site__mnr_module=True,
            container_status="IN",
            container__status="IN",
        )

        less_than_15_days_stock = []
        between_16_to_30_days_stock = []
        above_30_days_stock = []
        for stock in stocks:
            age = today.date() - stock.gate_in.in_date
            if int(age.days) <= 15:
                less_than_15_days_stock.append(stock)
            elif int(age.days) > 15 and int(age.days) <= 30:
                between_16_to_30_days_stock.append(stock)
            elif int(age.days) > 30:
                above_30_days_stock.append(stock)

        for stock in less_than_15_days_stock:
            result = detect_mnr_stage(site_type=site.type, stock=stock)
            if stock.container.size.name == "20":
                if result == "survey_pending":
                    less_than_15_days["pending_survey_20"] = (
                        less_than_15_days["pending_survey_20"] + 1
                    )

                if result == "estimate_pending":
                    less_than_15_days["pending_estimation_20"] = (
                        less_than_15_days["pending_estimation_20"] + 1
                    )

                if result == "approval_pending":
                    less_than_15_days["pending_approval_20"] = (
                        less_than_15_days["pending_approval_20"] + 1
                    )

                if result == "repair_pending":
                    less_than_15_days["pending_repair_20"] = (
                        less_than_15_days["pending_repair_20"] + 1
                    )

                if result == "available":
                    less_than_15_days["av_20"] = less_than_15_days["av_20"] + 1

            if stock.container.size.name == "40":
                if result == "survey_pending":
                    less_than_15_days["pending_survey_40"] = (
                        less_than_15_days["pending_survey_40"] + 1
                    )

                if result == "estimate_pending":
                    less_than_15_days["pending_estimation_40"] = (
                        less_than_15_days["pending_estimation_40"] + 1
                    )

                if result == "approval_pending":
                    less_than_15_days["pending_approval_40"] = (
                        less_than_15_days["pending_approval_40"] + 1
                    )

                if result == "repair_pending":
                    less_than_15_days["pending_repair_40"] = (
                        less_than_15_days["pending_repair_40"] + 1
                    )

                if result == "available":
                    less_than_15_days["av_40"] = less_than_15_days["av_40"] + 1

        for stock in between_16_to_30_days_stock:
            result = detect_mnr_stage(site_type=site.type, stock=stock)
            if stock.container.size.name == "20":
                if result == "survey_pending":
                    between_16_to_30_days["pending_survey_20"] = (
                        between_16_to_30_days["pending_survey_20"] + 1
                    )

                if result == "estimate_pending":
                    between_16_to_30_days["pending_estimation_20"] = (
                        between_16_to_30_days["pending_estimation_20"] + 1
                    )

                if result == "approval_pending":
                    between_16_to_30_days["pending_approval_20"] = (
                        between_16_to_30_days["pending_approval_20"] + 1
                    )

                if result == "repair_pending":
                    between_16_to_30_days["pending_repair_20"] = (
                        between_16_to_30_days["pending_repair_20"] + 1
                    )

                if result == "available":
                    between_16_to_30_days["av_20"] = between_16_to_30_days["av_20"] + 1

            if stock.container.size.name == "40":
                if result == "survey_pending":
                    between_16_to_30_days["pending_survey_40"] = (
                        between_16_to_30_days["pending_survey_40"] + 1
                    )

                if result == "estimate_pending":
                    between_16_to_30_days["pending_estimation_40"] = (
                        between_16_to_30_days["pending_estimation_40"] + 1
                    )

                if result == "approval_pending":
                    between_16_to_30_days["pending_approval_40"] = (
                        between_16_to_30_days["pending_approval_40"] + 1
                    )

                if result == "repair_pending":
                    between_16_to_30_days["pending_repair_40"] = (
                        between_16_to_30_days["pending_repair_40"] + 1
                    )

                if result == "available":
                    between_16_to_30_days["av_40"] = between_16_to_30_days["av_40"] + 1

        for stock in above_30_days_stock:
            result = detect_mnr_stage(site_type=site.type, stock=stock)
            if stock.container.size.name == "20":
                if result == "survey_pending":
                    above_30_days["pending_survey_20"] = (
                        above_30_days["pending_survey_20"] + 1
                    )

                if result == "estimate_pending":
                    above_30_days["pending_estimation_20"] = (
                        above_30_days["pending_estimation_20"] + 1
                    )

                if result == "approval_pending":
                    above_30_days["pending_approval_20"] = (
                        above_30_days["pending_approval_20"] + 1
                    )

                if result == "repair_pending":
                    above_30_days["pending_repair_20"] = (
                        above_30_days["pending_repair_20"] + 1
                    )

                if result == "available":
                    above_30_days["av_20"] = above_30_days["av_20"] + 1

            if stock.container.size.name == "40":
                if result == "survey_pending":
                    above_30_days["pending_survey_40"] = (
                        above_30_days["pending_survey_40"] + 1
                    )

                if result == "estimate_pending":
                    above_30_days["pending_estimation_40"] = (
                        above_30_days["pending_estimation_40"] + 1
                    )

                if result == "approval_pending":
                    above_30_days["pending_approval_40"] = (
                        above_30_days["pending_approval_40"] + 1
                    )

                if result == "repair_pending":
                    above_30_days["pending_repair_40"] = (
                        above_30_days["pending_repair_40"] + 1
                    )

                if result == "available":
                    above_30_days["av_40"] = above_30_days["av_40"] + 1

        return less_than_15_days, between_16_to_30_days, above_30_days

    except:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None


def get_dsr_report_main_data(location, site):
    try:
        data = []
        case_no = 0

        if location is None and site is None:
            location_objs = Location.objects.all()
            case_no = 1
        elif location and site is None:
            location_objs = Location.objects.get(name=location)
            site_objs = Site.objects.filter(location=location_objs)
            case_no = 2
        elif location and site:
            location_objs = Location.objects.get(name=location)
            site_objs = [Site.objects.get(name=site, location=location_objs)]
            case_no = 3

        site_list = []
        if case_no == 1:
            for location_obj in location_objs:
                site_list.extend(Site.objects.filter(location=location_obj))
        elif case_no in [2, 3]:
            site_list = site_objs

        for site in site_list:
            less_than_15_days, between_16_to_30_days, above_30_days = dsr_helper(site)
            data.append(less_than_15_days)
            data.append(between_16_to_30_days)
            data.append(above_30_days)

        # df data
        site = [each.get("site") for each in data]
        oos_days = [each.get("oos_days") for each in data]
        pending_survey_20 = [each.get("pending_survey_20") for each in data]
        pending_survey_40 = [each.get("pending_survey_40") for each in data]
        pending_estimation_20 = [each.get("pending_estimation_20") for each in data]
        pending_estimation_40 = [each.get("pending_estimation_40") for each in data]
        pending_approval_20 = [each.get("pending_approval_20") for each in data]
        pending_approval_40 = [each.get("pending_approval_40") for each in data]
        pending_repair_20 = [each.get("pending_repair_20") for each in data]
        pending_repair_40 = [each.get("pending_repair_40") for each in data]
        av_20 = [each.get("av_20") for each in data]
        av_40 = [each.get("av_40") for each in data]

        df_data = [
            [
                site[i],
                oos_days[i],
                pending_survey_20[i],
                pending_survey_40[i],
                pending_estimation_20[i],
                pending_estimation_40[i],
                pending_approval_20[i],
                pending_approval_40[i],
                pending_repair_20[i],
                pending_repair_40[i],
                av_20[i],
                av_40[i],
            ]
            for i in range(len(site))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 12)])
        return df_data
        return data
    except:
        logging.getLogger("error_log").error(traceback.format_exc())
        df_data = [["" for i in range(0, 12)]]
        return data


def get_vol_tues_dmr_report_main_data(location, site, from_date_str, to_date_str):
    try:
        site_list = get_depot_site_list(location=location, site=site)
        if not site_list:
            return []

        main_data = []
        for site_obj in site_list:
            opening_stock_20 = get_opening_stock(
                from_date_str, site_obj, "IN", "20"
            ) - get_opening_stock(from_date_str, site_obj, "OUT", "20")
            opening_stock_40 = get_opening_stock(
                from_date_str, site_obj, "IN", "40"
            ) - get_opening_stock(from_date_str, site_obj, "OUT", "40")

            in_20_line_stock, out_20_line_stock = get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "IN", "Line", "20"
            ), get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "OUT", "Line", "20"
            )
            in_40_line_stock, out_40_line_stock = get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "IN", "Line", "40"
            ), get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "OUT", "Line", "40"
            )
            in_20_party_stock, out_20_party_stock = get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "IN", "Party", "20"
            ), get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "OUT", "Party", "20"
            )
            in_40_party_stock, out_40_party_stock = get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "IN", "Party", "40"
            ), get_requested_date_stock(
                from_date_str, to_date_str, site_obj, "OUT", "Party", "40"
            )

            closing_stock_20 = (
                opening_stock_20
                + (in_20_line_stock + in_20_party_stock)
                - (out_20_line_stock + out_20_party_stock)
            )
            closing_stock_40 = (
                opening_stock_40
                + (in_40_line_stock + in_40_party_stock)
                - (out_40_line_stock + out_40_party_stock)
            )

            main_data.append(
                {
                    "site": site_obj.name,
                    "opening_20_stock": opening_stock_20,
                    "opening_40_stock": opening_stock_40,
                    "opening_tues": (opening_stock_20 * 1) + (opening_stock_40 * 2),
                    "in_line_20_stock": in_20_line_stock,
                    "in_party_20_stock": in_20_party_stock,
                    "in_line_40_stock": in_40_line_stock,
                    "in_party_40_stock": in_40_party_stock,
                    "out_line_20_stock": out_20_line_stock,
                    "out_party_20_stock": out_20_party_stock,
                    "out_line_40_stock": out_40_line_stock,
                    "out_party_40_stock": out_40_party_stock,
                    "closing_20_stock": closing_stock_20,
                    "closing_40_stock": closing_stock_40,
                    "closing_tues": (closing_stock_20 * 1) + (closing_stock_40 * 2),
                }
            )

        # df data
        site = [each.get("site") for each in main_data]
        opening_20_stock = [each.get("opening_20_stock") for each in main_data]
        opening_40_stock = [each.get("opening_40_stock") for each in main_data]
        opening_tues = [each.get("opening_tues") for each in main_data]
        in_line_20_stock = [each.get("in_line_20_stock") for each in main_data]
        in_line_40_stock = [each.get("in_line_40_stock") for each in main_data]
        in_party_20_stock = [each.get("in_party_20_stock") for each in main_data]
        in_party_40_stock = [each.get("in_party_40_stock") for each in main_data]
        out_line_20_stock = [each.get("out_line_20_stock") for each in main_data]
        out_line_40_stock = [each.get("out_line_40_stock") for each in main_data]
        out_party_20_stock = [each.get("out_party_20_stock") for each in main_data]
        out_party_40_stock = [each.get("out_party_40_stock") for each in main_data]
        closing_20_stock = [each.get("closing_20_stock") for each in main_data]
        closing_40_stock = [each.get("closing_40_stock") for each in main_data]
        closing_tues = [each.get("closing_tues") for each in main_data]

        df_data = [
            [
                site[i],
                opening_20_stock[i],
                opening_40_stock[i],
                opening_tues[i],
                in_line_20_stock[i],
                in_line_40_stock[i],
                in_party_20_stock[i],
                in_party_40_stock[i],
                out_line_20_stock[i],
                out_line_40_stock[i],
                out_party_20_stock[i],
                out_party_40_stock[i],
                closing_20_stock[i],
                closing_40_stock[i],
                closing_tues[i],
            ]
            for i in range(len(site))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 15)])
        return df_data
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        df_data = [["" for i in range(0, 15)]]
        return df_data


def create_dmr_dsr_report_wb(dmr_df_data, dsr_df_data, file_name):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.xlsx")
        workbook = xlsxwriter.Workbook(temp_file_path)
        dmr_sheet = workbook.add_worksheet("DMR")
        dsr_sheet = workbook.add_worksheet("DSR")
        dmr_sheet.add_table(
            f"A1:O{1 + len(dmr_df_data)}",
            {
                "data": dmr_df_data,
                "columns": [
                    {"header": "SITE"},
                    {"header": "OPENING_20_STOCK"},
                    {"header": "OPENING_40_STOCK"},
                    {"header": "OPENING_TUES"},
                    {"header": "IN_LINE_20_STOCK"},
                    {"header": "IN_LINE_40_STOCK"},
                    {"header": "IN_PARTY_20_STOCK"},
                    {"header": "IN_PARTY_40_STOCK"},
                    {"header": "OUT_LINE_20_STOCK"},
                    {"header": "OUT_LINE_40_STOCK"},
                    {"header": "OUT_PARTY_20_STOCK"},
                    {"header": "OUT_PARTY_40_STOCK"},
                    {"header": "CLOSING_20_STOCK"},
                    {"header": "CLOSING_40_STOCK"},
                    {"header": "CLOSING_TUES"},
                ],
            },
        )

        # DSR
        dsr_sheet.add_table(
            f"A1:L{1 + len(dsr_df_data)}",
            {
                "data": dsr_df_data,
                "columns": [
                    {"header": "SITE"},
                    {"header": "OOS_DAYS"},
                    {"header": "PENDING_SURVEY_20"},
                    {"header": "PENDING_SURVEY_40"},
                    {"header": "PENDING_ESTIMATION_20"},
                    {"header": "PENDING_ESTIMATION_40"},
                    {"header": "PENDING_APPROVAL_20"},
                    {"header": "PENDING_APPROVAL_40"},
                    {"header": "PENDING_REPAIR_20"},
                    {"header": "PENDING_REPAIR_40"},
                    {"header": "AV_20"},
                    {"header": "AV_40"},
                ],
            },
        )

        workbook.close()
        return temp_file_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_daily_activity_report(
    location, site, from_date_str, to_date_str, request_report
):
    try:
        subject = None
        file_name = None
        if location is None and site is None:
            # Handle case: All locations and all sites data
            subject = f"Daily_Activity_Report_{from_date_str} to {to_date_str} for All Locations and Sites, for Management Team"
            file_name = f"Daily_Activity_Report_{from_date_str}_to_{to_date_str}_all_locations_{random.randint(100000, 999999)}"
        elif location is not None and site is None:
            # Handle case: Only given location and all sites under it
            subject = f"Daily_Activity_Report_{from_date_str} to {to_date_str} for {location}, for Management Team"
            file_name = f"Daily_Activity_Report_{from_date_str}_to_{to_date_str}_{location}_{random.randint(100000, 999999)}"
        elif location is not None and site is not None:
            # Handle case: Only given location and given site data
            subject = f"Daily_Activity_Report_{from_date_str} to {to_date_str} for location {location} and site {site}, for Management Team"
            file_name = f"Daily_Activity_Report_{from_date_str}_to_{to_date_str}_{location}_{site}_{random.randint(100000, 999999)}"

        vol_tues_dmr_df_data = get_vol_tues_dmr_report_main_data(
            location, site, from_date_str, to_date_str
        )
        dsr_df_data = get_dsr_report_main_data(location, site)
        temp_file_path = create_dmr_dsr_report_wb(
            vol_tues_dmr_df_data, dsr_df_data, file_name
        )
        send_adhoc_report_to_mgmnt(
            attachment_list=[temp_file_path],
            subject=subject,
            to_email_list=["manjot.bajwa@sunandpearls.com"],
            cc_email_list=["manjot.bajwa@sunandpearls.com"],
            request_report=request_report,
        )
        upload_adhoc_report_to_s3(
            request_report=request_report, file=temp_file_path, file_name=file_name
        )
        os.remove(temp_file_path)
        request_report.status = "Completed"
        request_report.save()
        return True
    except Exception as e:
        request_report.status = "Failed"
        request_report.save()
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
