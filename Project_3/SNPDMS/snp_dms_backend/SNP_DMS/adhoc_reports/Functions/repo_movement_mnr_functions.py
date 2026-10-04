import datetime
import logging
import os
import random
import traceback

from django.utils import timezone

from depot.models import GateOutHistory, ContainerStock
from mnr.models import Estimate, Repair
from master.models import Location, Site

import xlsxwriter

from SNP_DMS.settings.base import BASE_DIR
from adhoc_reports.utils import (
    send_adhoc_report_to_mgmnt,
    upload_adhoc_report_to_s3,
)

logger = logging.getLogger("error_log")


def get_repo_out_stock_data(
    from_date_str,
    to_date_str,
    location,
    site,
):
    try:
        from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
        to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        from_time = datetime.datetime.strptime("00:00", "%H:%M").time()
        to_time = datetime.datetime.strptime("23:59", "%H:%M").time()
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(
            timezone.get_current_timezone()
        )
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
            timezone.get_current_timezone()
        )
        params = {}
        location_obj = None
        site_obj = None

        if location and site is None:
            location_obj = Location.objects.get(name=location)
            site_obj = Site.objects.filter(location=location_obj)
            params["container__location"] = location_obj

        elif location and site:
            location_obj = Location.objects.get(name=location)
            site_obj = Site.objects.get(name=site, location=location_obj)
            params["container__location"] = location_obj
            params["container__site"] = site_obj

        gate_out_pk_list = (
            GateOutHistory.objects.select_related(
                "container",
                "container__location",
                "container__site",
                "lolo",
            )
            .filter(
                date__range=(from_date_time, to_date_time),
                lolo__apply_charges="Line",
                **params,
            )
            .order_by("date")
            .values_list("gate_out__pk", flat=True)
        )

        stock_data = ContainerStock.objects.select_related("gate_out").filter(
            gate_out__pk__in=gate_out_pk_list
        )

        return stock_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def build_estimate_repair_maps(stock_queryset):
    estimates = Estimate.objects.filter(
        parent__depot__in=stock_queryset, is_proceed=True
    ).select_related("parent")

    estimate_map = {e.parent.depot_id: e for e in estimates}

    repairs = Repair.objects.filter(parent__in=estimates, complete=True).select_related(
        "parent"
    )

    repair_map = {r.parent_id: r for r in repairs}

    return estimate_map, repair_map


def get_mnr_repo_movement_main_data(stock_queryset):
    try:
        if not stock_queryset:
            return [["" for _ in range(12)]]

        estimate_map, repair_map = build_estimate_repair_maps(stock_queryset)

        data = []

        for stock in stock_queryset:
            container = stock.container
            gate_out = stock.gate_out

            estimate = estimate_map.get(stock.id)
            repair = repair_map.get(estimate.id) if estimate else None

            data.append(
                [
                    container.location.name,
                    container.site.name,
                    container.container_no,
                    gate_out.out_date.strftime("%Y-%m-%d"),
                    gate_out.out_time.strftime("%H:%M"),
                    "Yes" if estimate else "No",
                    estimate.current_date.strftime("%Y-%m-%d") if estimate else "",
                    estimate.current_time.strftime("%H:%M") if estimate else "",
                    float(estimate.current_amount) if estimate else 0,
                    "Yes" if repair else "No",
                    repair.current_repair_date.strftime("%Y-%m-%d") if repair else "",
                    repair.current_repair_time.strftime("%H:%M") if repair else "",
                ]
            )

        return data

    except Exception:
        logger.exception("Error transforming data")
        return [["" for _ in range(12)]]


def create_mnr_repo_movement_report_wb(df_data):
    try:
        temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(temp_dir, exist_ok=True)

        now = timezone.now()
        file_name = f"mnr_repo_movement_{now.strftime('%Y%m%d_%H%M%S')}.xlsx"
        file_path = os.path.join(temp_dir, file_name)

        workbook = xlsxwriter.Workbook(file_path)
        sheet = workbook.add_worksheet("MNR Repo Movement")

        headers = [
            "Location",
            "Site",
            "Container",
            "Gate Out Date",
            "Gate Out Time",
            "Estimated",
            "Estimate Date",
            "Estimate Time",
            "Estimated Amount",
            "Repaired",
            "Repaired Date",
            "Repaired Time",
        ]

        sheet.add_table(
            f"A1:L{len(df_data) + 1}",
            {"data": df_data, "columns": [{"header": h} for h in headers]},
        )

        workbook.close()
        return file_path

    except Exception:
        logger.exception("Error creating Excel file")
        return None


def create_mnr_repo_movement_report_report(
    location, site, from_date_str, to_date_str, request_report
):
    try:
        if not location and not site:
            subject = (
                f"MNR Repo Movement Report {from_date_str} to {to_date_str} "
                f"for All Locations and Sites"
            )
            file_name = f"MNR_Report_ALL_{random.randint(100000,999999)}"

        elif location and not site:
            subject = (
                f"MNR Repo Movement Report {from_date_str} to {to_date_str} "
                f"for {location}"
            )
            file_name = f"MNR_Report_{location}_{random.randint(100000,999999)}"

        else:
            subject = (
                f"MNR Repo Movement Report {from_date_str} to {to_date_str} "
                f"for {location} - {site}"
            )
            file_name = f"MNR_Report_{location}_{site}_{random.randint(100000,999999)}"

        # ---------- DATA ----------
        stock_queryset = get_repo_out_stock_data(
            from_date_str, to_date_str, location, site
        )

        df_data = get_mnr_repo_movement_main_data(stock_queryset)

        file_path = create_mnr_repo_movement_report_wb(df_data)

        if not file_path:
            raise Exception("File generation failed")

        # ---------- SEND EMAIL ----------
        send_adhoc_report_to_mgmnt(
            attachment_list=[file_path],
            subject=subject,
            to_email_list=["manjot.bajwa@sunandpearls.com"],
            cc_email_list=["manjot.bajwa@sunandpearls.com"],
            request_report=request_report,
        )

        # ---------- UPLOAD ----------
        upload_adhoc_report_to_s3(
            request_report=request_report,
            file=file_path,
            file_name=file_name,
        )

        # ---------- CLEANUP ----------
        os.remove(file_path)

        request_report.status = "Completed"
        request_report.save()

        return True

    except Exception:
        logger.exception("Report generation failed")

        request_report.status = "Failed"
        request_report.save()

        return False
