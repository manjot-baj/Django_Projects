# Standard Library Imports
import os
import logging
import traceback
import datetime
import random
import calendar

# Third-Party Packages
import xlsxwriter
from decouple import config

# Django Utilities
from django.utils import timezone
from django.db.models import Sum

# Project Settings & Common Functions
from SNP_DMS.settings.base import BASE_DIR
from common.functions import upload_file

# Models
## Depot
from depot.models import ContainerStock

## Non-Depot
from non_depot.models import (
    NonDepotContainerStock,
)

## Master
from master.models import Site, Location

## MNR (Maintenance & Repair)
from mnr.models import Survey, SurveyLine, Approval

from adhoc_reports.utils import send_adhoc_report_to_mgmnt, upload_adhoc_report_to_s3


def get_length_width_value_string(string):
    if "*" in string:
        return string.replace("*", " x ")
    else:
        return f"{string} x 0"


def get_mnr_material_usage_sheet_row_data(pk):
    try:
        survey_object = Survey.objects.get(pk=pk)
        if survey_object.depot is not None:
            container_header_data = survey_object.depot.get_mnr_container_header_data()
        else:
            container_header_data = (
                survey_object.non_depot.get_mnr_container_header_data()
            )
        approval = Approval.objects.get(parent__parent=survey_object)
        approved_amount = str(float(approval.approved_amount))
        main_data = {
            "container_no": container_header_data["container_no"],
            "size_type": container_header_data["size_type"],
            "line": container_header_data["line"],
            "aging": container_header_data["aging"],
            "total_approved_amount": approved_amount,
        }
        survey_line_objects = SurveyLine.objects.filter(
            parent=survey_object, is_rejected=False
        )
        survey_line_data = [
            {
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else get_length_width_value_string(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "total_cost": (
                    "0" if line.total_cost is None else str(float(line.total_cost))
                ),
            }
            for line in survey_line_objects
        ]
        main_data["survey_lines"] = survey_line_data
        return main_data
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_mnr_material_usage_sheet_main_data(pk_list):
    try:
        main_data = []
        sr_no_count = 0
        for pk in pk_list:
            sr_no_count += 1
            row_data = get_mnr_material_usage_sheet_row_data(pk)
            row_data["sr_no"] = str(sr_no_count)
            main_data.append(row_data)

        sr_no = []
        container_no = []
        size_type = []
        line = []
        aging = []
        total_approved_amount = []
        seq_no = []
        tariff_code = []
        main_component = []
        component_description = []
        location_description = []
        specific_location_description = []
        damage_description = []
        material_description = []
        repair_description = []
        measurement = []
        unit = []
        length_and_width = []
        quantity = []
        total_cost = []

        for each in main_data:
            sr_no.append(each["sr_no"])
            container_no.append(each["container_no"])
            size_type.append(each["size_type"])
            line.append(each["line"])
            aging.append(each["aging"])
            total_approved_amount.append(each["total_approved_amount"])
            seq_no_count = 0
            for line_data in each["survey_lines"]:
                seq_no_count += 1
                if seq_no_count > 1:
                    sr_no.append("")
                    container_no.append("")
                    size_type.append("")
                    line.append("")
                    aging.append("")
                    total_approved_amount.append("")
                seq_no.append(seq_no_count)
                tariff_code.append(line_data["tariff_code"])
                main_component.append(line_data["main_component"])
                component_description.append(line_data["component_description"])
                location_description.append(line_data["location_description"])
                specific_location_description.append(
                    line_data["specific_location_description"]
                )
                damage_description.append(line_data["damage_description"])
                material_description.append(line_data["material_description"])
                repair_description.append(line_data["repair_description"])
                measurement.append(line_data["measurement"])
                unit.append(line_data["unit"])
                length_and_width.append(line_data["length_and_width"])
                quantity.append(line_data["quantity"])
                total_cost.append(line_data["total_cost"])
            sr_no.append("")
            container_no.append("")
            size_type.append("")
            line.append("")
            aging.append("")
            total_approved_amount.append("")
            seq_no.append("")
            tariff_code.append("")
            main_component.append("")
            component_description.append("")
            location_description.append("")
            specific_location_description.append("")
            damage_description.append("")
            material_description.append("")
            repair_description.append("")
            measurement.append("")
            unit.append("")
            length_and_width.append("")
            quantity.append("")
            total_cost.append("")

        excel_data = [
            [
                sr_no[i],
                container_no[i],
                size_type[i],
                line[i],
                aging[i],
                total_approved_amount[i],
                seq_no[i],
                tariff_code[i],
                main_component[i],
                component_description[i],
                location_description[i],
                specific_location_description[i],
                damage_description[i],
                material_description[i],
                repair_description[i],
                measurement[i],
                unit[i],
                length_and_width[i],
                quantity[i],
                total_cost[i],
            ]
            for i in range(len(sr_no))
        ]
        return excel_data
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_mnr_material_usage_sheet_wb(
    less_than_or_equalto_1000_sheet_data,
    less_than_or_equalto_3000_sheet_data,
    greater_than_3000_sheet_data,
    report_summary_main_data,
    yearly_summary_main_data,
    file_name,
):
    try:
        line = ""
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.xlsx")
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        less_than_or_equalto_1000_sheet = generic_workbook.add_worksheet(
            "LESS_THAN_EQUAL_1000"
        )
        less_than_or_equalto_3000_sheet = generic_workbook.add_worksheet(
            "LESS_THAN_EQUAL_3000"
        )
        greater_than_3000_sheet = generic_workbook.add_worksheet("GREATER_THAN_3000")
        report_summary_sheet = generic_workbook.add_worksheet("SUMMARY")

        less_than_or_equalto_1000_sheet.add_table(
            f"A1:T{1 + len(less_than_or_equalto_1000_sheet_data)}",
            {
                "data": less_than_or_equalto_1000_sheet_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Container No"},
                    {"header": "Size Type"},
                    {"header": "Line"},
                    {"header": "Aging"},
                    {"header": "Approved Amt"},
                    {"header": "Seq No"},
                    {"header": "Tariff Code"},
                    {"header": "Main Component"},
                    {"header": "Component"},
                    {"header": "Location"},
                    {"header": "Specific Location"},
                    {"header": "Damage"},
                    {"header": "Material"},
                    {"header": "Repair"},
                    {"header": "Measurement"},
                    {"header": "Unit"},
                    {"header": "L x W"},
                    {"header": "QTY"},
                    {"header": "Total Cost"},
                ],
            },
        )
        less_than_or_equalto_3000_sheet.add_table(
            f"A1:T{1 + len(less_than_or_equalto_3000_sheet_data)}",
            {
                "data": less_than_or_equalto_3000_sheet_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Container No"},
                    {"header": "Size Type"},
                    {"header": "Line"},
                    {"header": "Aging"},
                    {"header": "Approved Amt"},
                    {"header": "Seq No"},
                    {"header": "Tariff Code"},
                    {"header": "Main Component"},
                    {"header": "Component"},
                    {"header": "Location"},
                    {"header": "Specific Location"},
                    {"header": "Damage"},
                    {"header": "Material"},
                    {"header": "Repair"},
                    {"header": "Measurement"},
                    {"header": "Unit"},
                    {"header": "L x W"},
                    {"header": "QTY"},
                    {"header": "Total Cost"},
                ],
            },
        )
        greater_than_3000_sheet.add_table(
            f"A1:T{1 + len(greater_than_3000_sheet_data)}",
            {
                "data": greater_than_3000_sheet_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Container No"},
                    {"header": "Size Type"},
                    {"header": "Line"},
                    {"header": "Aging"},
                    {"header": "Approved Amt"},
                    {"header": "Seq No"},
                    {"header": "Tariff Code"},
                    {"header": "Main Component"},
                    {"header": "Component"},
                    {"header": "Location"},
                    {"header": "Specific Location"},
                    {"header": "Damage"},
                    {"header": "Material"},
                    {"header": "Repair"},
                    {"header": "Measurement"},
                    {"header": "Unit"},
                    {"header": "L x W"},
                    {"header": "QTY"},
                    {"header": "Total Cost"},
                ],
            },
        )

        report_summary_sheet.add_table(
            f"A1:F{1 + len(report_summary_main_data)}",
            {
                "data": report_summary_main_data,
                "columns": [
                    {"header": "DAMAGE TYPE"},
                    {"header": "QTY"},
                    {"header": "TOTAL REPAIR AMT"},
                    # {"header": "STEEL AMT"},
                    # {"header": "STEEL USAGE %"},
                    {"header": "PLYWOOD QTY"},
                    {"header": "PLYWOOD AMT"},
                    {"header": "PLYWOOD USAGE %"},
                ],
            },
        )

        # Create a Pie chart
        chart1 = generic_workbook.add_chart({"type": "pie"})
        # chart2 = generic_workbook.add_chart({"type": "pie"})

        # Add data series for the Pie chart
        chart1.add_series(
            {
                "name": "PLYWOOD USAGE %",
                "categories": f"='SUMMARY'!$A$2:$A${1 + len(report_summary_main_data)}",
                "values": f"='SUMMARY'!$F$2:$F${1 + len(report_summary_main_data)}",
                "data_labels": {"value": True},
            }
        )

        # chart2.add_series(
        #     {
        #         "name": "PLYWOOD USAGE %",
        #         "categories": f"='SUMMARY'!$A$2:$A${1 + len(report_summary_main_data)}",
        #         "values": f"='SUMMARY'!$G$2:$G${1 + len(report_summary_main_data)}",
        #         "data_labels": {"value": True},
        #     }
        # )

        # Insert the Pie chart into the report_summary_sheet
        report_summary_sheet.insert_chart("I2", chart1)
        # report_summary_sheet.insert_chart(
        #     f"I{1 + len(report_summary_main_data)}", chart2
        # )

        for each in yearly_summary_main_data:
            month_summary_sheet = generic_workbook.add_worksheet(each.upper())
            month_summary_sheet.add_table(
                f"A1:F{1 + len(yearly_summary_main_data[each])}",
                {
                    "data": yearly_summary_main_data[each],
                    "columns": [
                        {"header": "DAMAGE TYPE"},
                        {"header": "QTY"},
                        {"header": "TOTAL REPAIR AMT"},
                        {"header": "PLYWOOD QTY"},
                        {"header": "PLYWOOD AMT"},
                        {"header": "PLYWOOD USAGE %"},
                    ],
                },
            )

            # Create a Pie chart
            chart = generic_workbook.add_chart({"type": "pie"})

            # Add data series for the Pie chart
            chart.add_series(
                {
                    "name": "PLYWOOD USAGE %",
                    "categories": f"='{each.upper()}'!$A$2:$A${1 + len(yearly_summary_main_data[each])}",
                    "values": f"='{each.upper()}'!$F$2:$F${1 + len(yearly_summary_main_data[each])}",
                    "data_labels": {"value": True},
                }
            )

            # Insert the Pie chart into the report_summary_sheet
            month_summary_sheet.insert_chart("I2", chart)

        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_plywood_qty_amt(query_data):
    try:
        plywood_qty = 0
        plywood_amt = 0
        for each in query_data:
            l = int(each.length_and_width.split("*")[0])
            w = int(each.length_and_width.split("*")[1])
            sqinches = l * w
            sqft = float(sqinches) / 144
            sqft_plywood = float(sqft) / 32
            plywood_used = float(sqft_plywood) * each.quantity
            plywood_qty = float(plywood_qty) + float(plywood_used)
            plywood_amt = float(plywood_amt) + float(each.total_cost)
        return plywood_qty, plywood_amt
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return 0


def get_mnr_material_usage_summary(
    ld,
    ld_amt_list,
    md,
    md_amt_list,
    hd,
    hd_amt_list,
):
    try:
        # LD
        # ld_steel = SurveyLine.objects.filter(
        #     parent__pk__in=ld, material_description__icontains="Steel"
        # )
        # ld_steel_cost = ld_steel.aggregate(Sum("total_cost"))["total_cost__sum"]
        # if ld_steel_cost is None:
        #     ld_steel_cost = 0
        # ld_steel_cost_percent = (round(ld_steel_cost) * 100) / round(ld_amt)

        ld_plywood = SurveyLine.objects.filter(
            parent__pk__in=ld,
            material_description__icontains="Plywood",
            unit="INH",
            length_and_width__icontains="*",
        )
        ld_plywood_qty, ld_plywood_cost = get_plywood_qty_amt(ld_plywood)
        ld_container_count = len(ld)
        ld_amt = float(sum(ld_amt_list))

        ld_plywood_cost_percent = float(0)
        if not float(ld_plywood_cost) == float(0):
            ld_plywood_cost_percent = (round(ld_plywood_cost) * 100) / round(ld_amt)

        # MD
        # md_steel = SurveyLine.objects.filter(
        #     parent__pk__in=md, material_description__icontains="Steel"
        # )
        # md_steel_cost = md_steel.aggregate(Sum("total_cost"))["total_cost__sum"]
        # if md_steel_cost is None:
        #     md_steel_cost = 0
        # md_steel_cost_percent = (round(md_steel_cost) * 100) / round(md_amt)

        md_plywood = SurveyLine.objects.filter(
            parent__pk__in=md,
            material_description__icontains="Plywood",
            unit="INH",
            length_and_width__icontains="*",
        )
        md_plywood_qty, md_plywood_cost = get_plywood_qty_amt(md_plywood)
        md_container_count = len(md)
        md_amt = float(sum(md_amt_list))

        md_plywood_cost_percent = float(0)
        if not float(md_plywood_cost) == float(0):
            md_plywood_cost_percent = (round(md_plywood_cost) * 100) / round(md_amt)

        # HD
        # hd_steel = SurveyLine.objects.filter(
        #     parent__pk__in=hd, material_description__icontains="Steel"
        # )
        # hd_steel_cost = hd_steel.aggregate(Sum("total_cost"))["total_cost__sum"]
        # if hd_steel_cost is None:
        #     hd_steel_cost = 0
        # hd_steel_cost_percent = (round(hd_steel_cost) * 100) / round(hd_amt)

        hd_plywood = SurveyLine.objects.filter(
            parent__pk__in=hd,
            material_description__icontains="Plywood",
            unit="INH",
            length_and_width__icontains="*",
        )
        hd_plywood_qty, hd_plywood_cost = get_plywood_qty_amt(hd_plywood)
        hd_container_count = len(hd)
        hd_amt = float(sum(hd_amt_list))

        hd_plywood_cost_percent = float(0)
        if not float(hd_plywood_cost) == float(0):
            hd_plywood_cost_percent = (round(hd_plywood_cost) * 100) / round(hd_amt)

        # data
        damage_type = ["LD (<= 1000)", "MD (>1000 & <= 3000)", "HD (> 3000)"]
        qty = [ld_container_count, md_container_count, hd_container_count]
        total_repair_amt = [round(ld_amt), round(md_amt), round(hd_amt)]
        # steel_amt = [round(ld_steel_cost), round(md_steel_cost), round(hd_steel_cost)]
        # steel_usage_percent = [
        #     round(ld_steel_cost_percent, 2),
        #     round(md_steel_cost_percent, 2),
        #     round(hd_steel_cost_percent, 2),
        # ]
        plywood_qty = [
            round(ld_plywood_qty),
            round(md_plywood_qty),
            round(hd_plywood_qty),
        ]
        plywood_amt = [
            round(ld_plywood_cost),
            round(md_plywood_cost),
            round(hd_plywood_cost),
        ]
        plywood_usage_percent = [
            round(ld_plywood_cost_percent, 2),
            round(md_plywood_cost_percent, 2),
            round(hd_plywood_cost_percent, 2),
        ]

        excel_data = [
            [
                damage_type[i],
                qty[i],
                total_repair_amt[i],
                # steel_amt[i],
                # steel_usage_percent[i],
                plywood_qty[i],
                plywood_amt[i],
                plywood_usage_percent[i],
            ]
            for i in range(len(damage_type))
        ]
        return excel_data
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_mnr_material_usage_raw_data(location, site, from_date_str, to_date_str):
    try:
        from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
        to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        survey_pk_list = []
        location_objs = None
        site_objs = None
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
            site_objs = Site.objects.get(name=site, location=location_objs)
            case_no = 3

        def get_survey_pk(site_obj):
            """Helper function to get survey primary keys for a site"""
            stock_model = (
                ContainerStock if site_obj.type == "DEPOT" else NonDepotContainerStock
            )
            parent_field = "depot" if site_obj.type == "DEPOT" else "non_depot"

            stock = stock_model.objects.filter(
                container__site=site_obj,
                available_date__gte=from_date,
                available_date__lte=to_date,
                stage="Available",
            )

            return set(
                SurveyLine.objects.filter(
                    **{f"parent__{parent_field}__in": stock}
                ).values_list("parent__pk", flat=True)
            )

        if case_no == 1:
            for location_obj in location_objs:
                site_objs = Site.objects.filter(location=location_obj)
                for site_obj in site_objs:
                    survey_pk_list.extend(get_survey_pk(site_obj))

        elif case_no == 2:
            for site_obj in site_objs:
                survey_pk_list.extend(get_survey_pk(site_obj))

        elif case_no == 3:
            survey_pk_list.extend(get_survey_pk(site_objs))

        return list(survey_pk_list)

    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def get_month_dates(year):
    months = []
    for month in range(1, 13):
        start_date = f"{year}-{month:02d}-01"
        end_day = calendar.monthrange(year, month)[1]
        end_date = f"{year}-{month:02d}-{end_day:02d}"
        months.append(
            {
                "month": calendar.month_name[month],
                "start_date": start_date,
                "end_date": end_date,
            }
        )
    return months


def get_mnr_material_yearly_usage_raw_data(location, site, from_date_str):
    try:
        required_year = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").year
        required_months = get_month_dates(required_year)
        yearly_survey_pk_list = {}
        for each in required_months:
            from_date_str = each["start_date"]
            to_date_str = each["end_date"]
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
            survey_pk_list = []
            location_objs = None
            site_objs = None
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
                site_objs = Site.objects.get(name=site, location=location_objs)
                case_no = 3

            def get_survey_pk(site_obj):
                """Helper function to get survey primary keys for a site"""
                stock_model = (
                    ContainerStock
                    if site_obj.type == "DEPOT"
                    else NonDepotContainerStock
                )
                parent_field = "depot" if site_obj.type == "DEPOT" else "non_depot"

                stock = stock_model.objects.filter(
                    container__site=site_obj,
                    available_date__gte=from_date,
                    available_date__lte=to_date,
                    stage="Available",
                )

                return set(
                    SurveyLine.objects.filter(
                        **{f"parent__{parent_field}__in": stock}
                    ).values_list("parent__pk", flat=True)
                )

            if case_no == 1:
                for location_obj in location_objs:
                    site_objs = Site.objects.filter(location=location_obj)
                    for site_obj in site_objs:
                        survey_pk_list.extend(get_survey_pk(site_obj))

            elif case_no == 2:
                for site_obj in site_objs:
                    survey_pk_list.extend(get_survey_pk(site_obj))

            elif case_no == 3:
                survey_pk_list.extend(get_survey_pk(site_objs))

            yearly_survey_pk_list[each["month"]] = survey_pk_list
        return yearly_survey_pk_list
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {}


def bifurcate_ld_md_hd(survey_pk_list):
    try:
        less_than_or_equalto_1000 = []
        less_than_or_equalto_1000_amt_list = []
        less_than_or_equalto_3000 = []
        less_than_or_equalto_3000_amt_list = []
        greater_than_3000 = []
        greater_than_3000_amt_list = []
        for pk in survey_pk_list:
            survey_object = Survey.objects.get(pk=pk)
            approval = Approval.objects.get(parent__parent=survey_object)
            approved_amount = float(approval.approved_amount)
            if approved_amount <= float(1000):
                less_than_or_equalto_1000.append(pk)
                less_than_or_equalto_1000_amt_list.append(float(approved_amount))
            if approved_amount > float(1000) and approved_amount <= float(3000):
                less_than_or_equalto_3000.append(pk)
                less_than_or_equalto_3000_amt_list.append(float(approved_amount))
            if approved_amount > float(3000):
                greater_than_3000.append(pk)
                greater_than_3000_amt_list.append(float(approved_amount))
        return {
            "less_than_or_equalto_1000": less_than_or_equalto_1000,
            "less_than_or_equalto_1000_amt_list": less_than_or_equalto_1000_amt_list,
            "less_than_or_equalto_3000": less_than_or_equalto_3000,
            "less_than_or_equalto_3000_amt_list": less_than_or_equalto_3000_amt_list,
            "greater_than_3000": greater_than_3000,
            "greater_than_3000_amt_list": greater_than_3000_amt_list,
        }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {}


def process_mnr_material_usage_report(survey_pk_list, yearly_survey_pk_list, file_name):
    try:
        ld_md_hd_data = bifurcate_ld_md_hd(survey_pk_list=survey_pk_list)
        less_than_or_equalto_1000 = ld_md_hd_data["less_than_or_equalto_1000"]
        less_than_or_equalto_1000_amt_list = ld_md_hd_data[
            "less_than_or_equalto_1000_amt_list"
        ]
        less_than_or_equalto_3000 = ld_md_hd_data["less_than_or_equalto_3000"]
        less_than_or_equalto_3000_amt_list = ld_md_hd_data[
            "less_than_or_equalto_3000_amt_list"
        ]
        greater_than_3000 = ld_md_hd_data["greater_than_3000"]
        greater_than_3000_amt_list = ld_md_hd_data["greater_than_3000_amt_list"]

        less_than_or_equalto_1000_sheet_data = get_mnr_material_usage_sheet_main_data(
            less_than_or_equalto_1000
        )
        less_than_or_equalto_3000_sheet_data = get_mnr_material_usage_sheet_main_data(
            less_than_or_equalto_3000
        )
        greater_than_3000_sheet_data = get_mnr_material_usage_sheet_main_data(
            greater_than_3000
        )

        report_summary_main_data = get_mnr_material_usage_summary(
            ld=less_than_or_equalto_1000,
            ld_amt_list=less_than_or_equalto_1000_amt_list,
            md=less_than_or_equalto_3000,
            md_amt_list=less_than_or_equalto_3000_amt_list,
            hd=greater_than_3000,
            hd_amt_list=greater_than_3000_amt_list,
        )
        yearly_summary_main_data = process_yearly_mnr_material_usage_report(
            yearly_survey_pk_list
        )
        temp_file_path = create_mnr_material_usage_sheet_wb(
            less_than_or_equalto_1000_sheet_data,
            less_than_or_equalto_3000_sheet_data,
            greater_than_3000_sheet_data,
            report_summary_main_data,
            yearly_summary_main_data,
            file_name,
        )
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def process_yearly_mnr_material_usage_report(yearly_survey_pk_list):
    try:
        yearly_summary = {}
        for each in yearly_survey_pk_list:
            if not len(yearly_survey_pk_list[each]) == 0:
                ld_md_hd_data = bifurcate_ld_md_hd(
                    survey_pk_list=yearly_survey_pk_list[each]
                )
                less_than_or_equalto_1000 = ld_md_hd_data["less_than_or_equalto_1000"]
                less_than_or_equalto_1000_amt_list = ld_md_hd_data[
                    "less_than_or_equalto_1000_amt_list"
                ]
                less_than_or_equalto_3000 = ld_md_hd_data["less_than_or_equalto_3000"]
                less_than_or_equalto_3000_amt_list = ld_md_hd_data[
                    "less_than_or_equalto_3000_amt_list"
                ]
                greater_than_3000 = ld_md_hd_data["greater_than_3000"]
                greater_than_3000_amt_list = ld_md_hd_data["greater_than_3000_amt_list"]

                month_summary_data = get_mnr_material_usage_summary(
                    ld=less_than_or_equalto_1000,
                    ld_amt_list=less_than_or_equalto_1000_amt_list,
                    md=less_than_or_equalto_3000,
                    md_amt_list=less_than_or_equalto_3000_amt_list,
                    hd=greater_than_3000,
                    hd_amt_list=greater_than_3000_amt_list,
                )

                yearly_summary[each] = month_summary_data
        return yearly_summary
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {}


def create_mnr_material_usage_report(
    location, site, from_date_str, to_date_str, request_report
):
    try:
        subject = None
        file_name = None
        if location is None and site is None:
            # Handle case: All locations and all sites data
            subject = f"MNR Material Usage Report {from_date_str} to {to_date_str} for All Locations and Sites, for Management Team"
            file_name = f"MNR_Material_Usage_Report_{from_date_str}_to_{to_date_str}_all_locations_{random.randint(100000, 999999)}"
        elif location is not None and site is None:
            # Handle case: Only given location and all sites under it
            subject = f"MNR Material Usage Report {from_date_str} to {to_date_str} for {location}, for Management Team"
            file_name = f"MNR_Material_Usage_Report_{from_date_str}_to_{to_date_str}_{location}_{random.randint(100000, 999999)}"
        elif location is not None and site is not None:
            # Handle case: Only given location and given site data
            subject = f"MNR Material Usage Report {from_date_str} to {to_date_str} for location {location} and site {site}, for Management Team"
            file_name = f"MNR_Material_Usage_Report_{from_date_str}_to_{to_date_str}_{location}_{site}_{random.randint(100000, 999999)}"

        survey_pk_list = get_mnr_material_usage_raw_data(
            location, site, from_date_str, to_date_str
        )
        yearly_survey_pk_list = get_mnr_material_yearly_usage_raw_data(
            location, site, from_date_str
        )
        temp_file_path = process_mnr_material_usage_report(
            survey_pk_list, yearly_survey_pk_list, file_name
        )

        if temp_file_path is not None:
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
        return False
