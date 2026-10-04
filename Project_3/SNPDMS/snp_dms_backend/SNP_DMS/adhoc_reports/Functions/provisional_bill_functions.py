# Standard Library Imports
import os, logging, traceback, datetime, random

# Third-Party Packages
import xlsxwriter

# Django Utilities
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.db.models import Sum, FloatField

# Project Settings & Common Functions
from SNP_DMS.settings.base import BASE_DIR

# Models
## Depot
from depot.models import ContainerStock, GateInHistory, GateOutHistory

## Non-Depot
from non_depot.models import (
    NonDepotContainerStock,
    NonDepotGateOut,
)

## Master
from master.models import Site, Location

## MNR (Maintenance & Repair)
from mnr.models import Survey, Approval

## Billing & Invoice
from billing_invoice.models import *

## Adhoc Reports Utils
from adhoc_reports.utils import send_adhoc_report_to_mgmnt, upload_adhoc_report_to_s3


def get_total_site_lolo_amount(site, size, count):
    try:
        unit_rate = site.size_20_rate if size == "20" else site.size_40_rate
        total_amount = (float(unit_rate) + (float(unit_rate) * 0.18)) * count
        return round(total_amount)
    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False


def get_size_site_data(history_model, site, size_name, params):
    return history_model.objects.select_related(
        "container", "container__site", "container__size"
    ).filter(
        container__site=site,
        container__size__name=size_name,
        **params,
    )


def non_depot_bill_helper(from_date_str, to_date_str, site):
    try:
        site_data = {
            "site": site.name,
            "line": "",
            "lolo_in_20": 0,
            "lolo_in_40": 0,
            "lolo_out_20": 0,
            "lolo_out_40": 0,
            "lolo_bill_amount": 0,
            "mnr_20": 0,
            "mnr_40": 0,
            "mnr_bill_amount": 0,
        }
        tz = timezone.get_current_timezone()

        out_params = {"out_date__range": (from_date_str, to_date_str)}

        out_20_data = get_size_site_data(NonDepotGateOut, site, "20", out_params)
        out_40_data = get_size_site_data(NonDepotGateOut, site, "40", out_params)

        stock_20_data = [
            NonDepotContainerStock.objects.filter(
                container=data.container,
                container__site__mnr_module=True,
                gate_out=data,
                stage__in=["Repair", "Available"],
            )
            .order_by("-pk")
            .values_list("pk", flat=True)
            .first()
            for data in out_20_data
        ]

        stock_40_data = [
            NonDepotContainerStock.objects.filter(
                container=data.container,
                container__site__mnr_module=True,
                gate_out=data,
                stage__in=["Repair", "Available"],
            )
            .order_by("-pk")
            .values_list("pk", flat=True)
            .first()
            for data in out_40_data
        ]

        survey_20_data_filter = {"non_depot__pk__in": stock_20_data}
        survey_40_data_filter = {"non_depot__pk__in": stock_40_data}

        survey_20_data = Survey.objects.filter(**survey_20_data_filter)
        survey_40_data = Survey.objects.filter(**survey_40_data_filter)

        approval_20_data = Approval.objects.filter(
            parent__parent__in=survey_20_data, is_approved=True, is_proceed=True
        )
        site_data["mnr_20"] = approval_20_data.count()

        approval_40_data = Approval.objects.filter(
            parent__parent__in=survey_40_data, is_approved=True, is_proceed=True
        )
        site_data["mnr_40"] = approval_40_data.count()

        approval_20_data_revenue = approval_20_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        approval_40_data_revenue = approval_40_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        mnr_bill_amount = (
            approval_20_data_revenue["revenue"] + approval_40_data_revenue["revenue"]
        )
        site_data["mnr_bill_amount"] = round(mnr_bill_amount)

        return site_data
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error("Error in non_depot bill helper: %s", traceback.format_exc())
        return {}


def depot_bill_helper(from_date_str, to_date_str, site):
    try:
        site_data = {
            "site": site.name,
            "line": "",
            "lolo_in_20": 0,
            "lolo_in_40": 0,
            "lolo_out_20": 0,
            "lolo_out_40": 0,
            "lolo_bill_amount": 0,
            "mnr_20": 0,
            "mnr_40": 0,
            "mnr_bill_amount": 0,
        }
        tz = timezone.get_current_timezone()
        history_models = (GateInHistory, GateOutHistory)
        in_history_model, out_history_model = history_models
        from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
        to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()

        depot_date_param = {
            "date__range": (
                datetime.datetime.combine(
                    from_date, datetime.datetime.min.time()
                ).astimezone(tz),
                datetime.datetime.combine(
                    to_date, datetime.datetime.max.time()
                ).astimezone(tz),
            )
        }

        in_20_data = get_size_site_data(in_history_model, site, "20", depot_date_param)
        in_40_data = get_size_site_data(in_history_model, site, "40", depot_date_param)
        out_20_data = get_size_site_data(
            out_history_model, site, "20", depot_date_param
        )
        out_40_data = get_size_site_data(
            out_history_model, site, "40", depot_date_param
        )

        site_data.update(
            {
                "lolo_in_20": in_20_data.count(),
                "lolo_in_40": in_40_data.count(),
                "lolo_out_20": out_20_data.count(),
                "lolo_out_40": out_40_data.count(),
            }
        )

        site_data["lolo_bill_amount"] = round(
            sum(
                get_total_site_lolo_amount(site, size, data.count())
                for size, data in zip(
                    ["20", "40", "20", "40"],
                    [in_20_data, in_40_data, out_20_data, out_40_data],
                )
            )
        )

        stock_20_data = [
            ContainerStock.objects.filter(
                container=data.container,
                container__site__mnr_module=True,
                gate_out=data.gate_out,
                stage__in=["Repair", "Available"],
            )
            .order_by("-pk")
            .values_list("pk", flat=True)
            .first()
            for data in out_20_data
        ]

        stock_40_data = [
            ContainerStock.objects.filter(
                container=data.container,
                container__site__mnr_module=True,
                gate_out=data.gate_out,
                stage__in=["Repair", "Available"],
            )
            .order_by("-pk")
            .values_list("pk", flat=True)
            .first()
            for data in out_40_data
        ]

        survey_20_data_filter = (
            {"depot__pk__in": stock_20_data}
            if site.type == "DEPOT"
            else {"non_depot__pk__in": stock_20_data}
        )
        survey_40_data_filter = (
            {"depot__pk__in": stock_40_data}
            if site.type == "DEPOT"
            else {"non_depot__pk__in": stock_40_data}
        )

        survey_20_data = Survey.objects.filter(**survey_20_data_filter)
        survey_40_data = Survey.objects.filter(**survey_40_data_filter)

        approval_20_data = Approval.objects.filter(
            parent__parent__in=survey_20_data, is_approved=True, is_proceed=True
        )
        site_data["mnr_20"] = approval_20_data.count()

        approval_40_data = Approval.objects.filter(
            parent__parent__in=survey_40_data, is_approved=True, is_proceed=True
        )
        site_data["mnr_40"] = approval_40_data.count()

        approval_20_data_revenue = approval_20_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        approval_40_data_revenue = approval_40_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        mnr_bill_amount = (
            approval_20_data_revenue["revenue"] + approval_40_data_revenue["revenue"]
        )
        site_data["mnr_bill_amount"] = round(mnr_bill_amount)

        return site_data
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error("Error in depot bill helper: %s", traceback.format_exc())
        return {}


def mnr_bill_helper(site):
    try:
        site_data = {
            "site": site.name,
            "line": "",
            "mnr_20": 0,
            "mnr_40": 0,
            "mnr_bill_amount": 0,
        }
        tz = timezone.get_current_timezone()

        helper_model = (
            ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
        )

        stock = helper_model.objects.filter(
            container__site__mnr_module=True,
            container__site=site,
            container__status="IN",
            container_status="IN",
            stage__in=["Repair", "Available"],
        )

        stock_20_data = stock.filter(container__size__name="20").values_list(
            "pk", flat=True
        )
        stock_40_data = stock.filter(container__size__name="40").values_list(
            "pk", flat=True
        )

        survey_20_data_filter = (
            {"depot__pk__in": stock_20_data}
            if site.type == "DEPOT"
            else {"non_depot__pk__in": stock_20_data}
        )
        survey_40_data_filter = (
            {"depot__pk__in": stock_40_data}
            if site.type == "DEPOT"
            else {"non_depot__pk__in": stock_40_data}
        )

        survey_20_data = Survey.objects.filter(**survey_20_data_filter)
        survey_40_data = Survey.objects.filter(**survey_40_data_filter)

        approval_20_data = Approval.objects.filter(
            parent__parent__in=survey_20_data, is_approved=True, is_proceed=True
        )
        site_data["mnr_20"] = approval_20_data.count()

        approval_40_data = Approval.objects.filter(
            parent__parent__in=survey_40_data, is_approved=True, is_proceed=True
        )
        site_data["mnr_40"] = approval_40_data.count()

        approval_20_data_revenue = approval_20_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        approval_40_data_revenue = approval_40_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        mnr_bill_amount = (
            approval_20_data_revenue["revenue"] + approval_40_data_revenue["revenue"]
        )
        site_data["mnr_bill_amount"] = round(mnr_bill_amount)

        return site_data
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error("Error in depot bill helper: %s", traceback.format_exc())
        return {}


def get_provisional_bill_report_main_data(location, site, from_date_str, to_date_str):
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
            site_data = {
                "site": site.name,
                "line": "",
                "lolo_in_20": 0,
                "lolo_in_40": 0,
                "lolo_out_20": 0,
                "lolo_out_40": 0,
                "lolo_bill_amount": 0,
                "mnr_20": 0,
                "mnr_40": 0,
                "mnr_bill_amount": 0,
            }
            helper_function = (
                depot_bill_helper if site.type == "DEPOT" else non_depot_bill_helper
            )
            site_data = helper_function(from_date_str, to_date_str, site)

            data.append(site_data)

        # df data
        site = [each.get("site") for each in data]
        shipping_line = [each.get("line") for each in data]
        lolo_in_20 = [each.get("lolo_in_20") for each in data]
        lolo_in_40 = [each.get("lolo_in_40") for each in data]
        lolo_out_20 = [each.get("lolo_out_20") for each in data]
        lolo_out_40 = [each.get("lolo_out_40") for each in data]
        lolo_bill_amount = [each.get("lolo_bill_amount") for each in data]
        mnr_20 = [each.get("mnr_20") for each in data]
        mnr_40 = [each.get("mnr_40") for each in data]
        mnr_bill_amount = [each.get("mnr_bill_amount") for each in data]

        df_data = [
            [
                site[i],
                shipping_line[i],
                lolo_in_20[i],
                lolo_in_40[i],
                lolo_out_20[i],
                lolo_out_40[i],
                lolo_bill_amount[i],
                mnr_20[i],
                mnr_40[i],
                mnr_bill_amount[i],
            ]
            for i in range(len(site))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 10)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 10)]]
        return df_data


def get_as_on_date_mnr_bill_df_data(location, site):
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
            site_data = {
                "site": site.name,
                "line": "",
                "mnr_20": 0,
                "mnr_40": 0,
                "mnr_bill_amount": 0,
            }
            site_data = mnr_bill_helper(site)

            data.append(site_data)

        # df data
        site = [each.get("site") for each in data]
        shipping_line = [each.get("line") for each in data]
        mnr_20 = [each.get("mnr_20") for each in data]
        mnr_40 = [each.get("mnr_40") for each in data]
        mnr_bill_amount = [each.get("mnr_bill_amount") for each in data]

        df_data = [
            [
                site[i],
                shipping_line[i],
                mnr_20[i],
                mnr_40[i],
                mnr_bill_amount[i],
            ]
            for i in range(len(site))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 10)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 10)]]
        return df_data


def create_provisional_bill_report_wb(
    provisional_bill_df_data, as_on_date_mnr_bill_df_data, file_name
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.xlsx")
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = generic_workbook.add_worksheet("Report")
        mnr_sheet = generic_workbook.add_worksheet("As on Date")
        inward_sheet.add_table(
            f"A1:J{1 + len(provisional_bill_df_data)}",
            {
                "data": provisional_bill_df_data,
                "columns": [
                    {"header": "SITE"},
                    {"header": "LINE"},
                    {"header": "LOLO_IN_20"},
                    {"header": "LOLO_IN_40"},
                    {"header": "LOLO_OUT_20"},
                    {"header": "LOLO_OUT_40"},
                    {"header": "LOLO_BILL_AMOUNT"},
                    {"header": "MNR_20"},
                    {"header": "MNR_40"},
                    {"header": "MNR_BILL_AMOUNT"},
                ],
            },
        )
        mnr_sheet.add_table(
            f"A1:E{1 + len(as_on_date_mnr_bill_df_data)}",
            {
                "data": as_on_date_mnr_bill_df_data,
                "columns": [
                    {"header": "SITE"},
                    {"header": "LINE"},
                    {"header": "MNR_20"},
                    {"header": "MNR_40"},
                    {"header": "MNR_BILL_AMOUNT"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return e


def create_provisional_bill_lolo_mnr_report(
    location, site, from_date_str, to_date_str, request_report
):
    try:
        subject = None
        file_name = None
        if location is None and site is None:
            # Handle case: All locations and all sites data
            subject = f"Provisional Bill Report {from_date_str} to {to_date_str} for All Locations and Sites, for Management Team"
            file_name = f"Provisional_Bill_Report_{from_date_str}_to_{to_date_str}_all_locations_{random.randint(100000, 999999)}"
        elif location is not None and site is None:
            # Handle case: Only given location and all sites under it
            subject = f"Provisional Bill Report {from_date_str} to {to_date_str} for {location}, for Management Team"
            file_name = f"Provisional_Bill_Report_{from_date_str}_to_{to_date_str}_{location}_{random.randint(100000, 999999)}"
        elif location is not None and site is not None:
            # Handle case: Only given location and given site data
            subject = f"Provisional Bill Report {from_date_str} to {to_date_str} for location {location} and site {site}, for Management Team"
            file_name = f"Provisional_Bill_Report_{from_date_str}_to_{to_date_str}_{location}_{site}_{random.randint(100000, 999999)}"

        provisional_bill_df_data = get_provisional_bill_report_main_data(
            location, site, from_date_str, to_date_str
        )
        as_on_date_mnr_bill_df_data = get_as_on_date_mnr_bill_df_data(location, site)

        temp_file_path = create_provisional_bill_report_wb(
            provisional_bill_df_data, as_on_date_mnr_bill_df_data, file_name
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
        return e
