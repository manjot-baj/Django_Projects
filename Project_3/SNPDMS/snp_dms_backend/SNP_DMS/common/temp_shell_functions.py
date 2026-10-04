# Standard Library Imports
import os
import datetime, random
from datetime import date, timedelta

# Third-Party Packages
import xlsxwriter
from decouple import config

# Django Utilities
from django.utils import timezone
from django.db.models import Sum
from django.core.mail import EmailMessage
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from django.db.models.functions import Coalesce
from django.db.models import Sum, Value, FloatField, Count, F

# Project Settings & Common Functions
from SNP_DMS.settings.base import BASE_DIR
from common.functions import upload_file

# Models
## Depot
from depot.models import (
    Eir,
    ContainerStock,
    GateInHistory,
    GateOutHistory,
    HandlingPayment,
    Handling,
    SelfTransportation,
    SelfTransportationPayment,
)

from depot.lolo_finance_models import AdvancedHandlingPayment, AdvLoloPymtInvoiceRel

## Non-Depot
from non_depot.models import (
    NonDepotContainerStock,
    NonDepotContainer,
    NonDepotContainerInOutRecord,
    NonDepotGateIn,
    NonDepotGateOut,
)

## Master
from master.models import Site, Location

## MNR (Maintenance & Repair)
from mnr.models import Survey, SurveyLine, Estimate, Approval, Repair

## Billing & Invoice
from billing_invoice.models import *
from django.db import transaction
from edi.models import EdiMailTracker


def eir_img_upload_to_s3():
    # dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
    # date_6months = dt - datetime.timedelta(days=200)
    site_total = Site.objects.select_related().count()
    site_count = 0
    for site in Site.objects.select_related():
        site_count = site_count + 1
        total = (
            Eir.objects.select_related("container", "container__site")
            .filter(container__site=site)
            .exclude(eir_img=None)
            .count()
        )
        count = 0
        for each in (
            Eir.objects.select_related("container", "container__site")
            .filter(container__site=site)
            .exclude(eir_img=None)
        ):
            eir_img_text = each.eir_img
            file_name = f"{each.container.container_no}_{each.eir_date.strftime('%Y%m%d')}_{each.eir_time.strftime('%H%M')}_{each.pk}.txt"
            location = each.container.location.name
            site_name = each.container.site.name
            bucket_name = config("AWS_STORAGE_BUCKET_NAME")
            object_name = (
                f"EIR_IMG/{location}/{site_name}/{each.entry_type}/{file_name}"
            )
            if not os.path.exists(os.path.join(BASE_DIR, "temp/EIR_IMG/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/EIR_IMG/"))
            temp_file_path = os.path.join(BASE_DIR, f"temp/EIR_IMG/{file_name}")
            with open(temp_file_path, "w") as fh:
                fh.write(eir_img_text)
            upload_file(temp_file_path, bucket_name, object_name)
            each.eir_img = None
            each.save()
            os.remove(temp_file_path)
            count = count + 1
            print(
                f"Uploaded...SITE: {site_count}...of...{site_total} *** EIR: {site.name}...{count}...of...{total}"
            )


def get_length_width_value_string(string):
    if "*" in string:
        return string.replace("*", " x ")
    else:
        return f"{string} x 0"


def get_heavy_repair_sheet_row_data(pk):
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
        return None


def get_heavy_repair_sheet_main_data(pk_list):
    try:
        main_data = []
        sr_no_count = 0
        for pk in pk_list:
            sr_no_count += 1
            row_data = get_heavy_repair_sheet_row_data(pk)
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
        return None


def create_heavy_repair_sheet_wb(
    less_than_or_equalto_1000_sheet_data,
    less_than_or_equalto_3000_sheet_data,
    greater_than_3000_sheet_data,
    report_summary_main_data,
):
    try:
        line = ""
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_heavy_repair_sheet_{date}{time}.xlsx"
        )
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
            f"A1:G{1 + len(report_summary_main_data)}",
            {
                "data": report_summary_main_data,
                "columns": [
                    {"header": "DAMAGE TYPE"},
                    {"header": "QTY"},
                    {"header": "TOTAL REPAIR AMT"},
                    {"header": "STEEL AMT"},
                    {"header": "STEEL USAGE %"},
                    {"header": "PLYWOOD AMT"},
                    {"header": "PLYWOOD USAGE %"},
                ],
            },
        )

        # Create a Pie chart
        chart1 = generic_workbook.add_chart({"type": "pie"})
        chart2 = generic_workbook.add_chart({"type": "pie"})

        # Add data series for the Pie chart
        chart1.add_series(
            {
                "name": "STEEL USAGE %",
                "categories": f"='SUMMARY'!$A$2:$A${1 + len(report_summary_main_data)}",
                "values": f"='SUMMARY'!$E$2:$E${1 + len(report_summary_main_data)}",
                "data_labels": {"value": True},
            }
        )

        chart2.add_series(
            {
                "name": "PLYWOOD USAGE %",
                "categories": f"='SUMMARY'!$A$2:$A${1 + len(report_summary_main_data)}",
                "values": f"='SUMMARY'!$G$2:$G${1 + len(report_summary_main_data)}",
                "data_labels": {"value": True},
            }
        )

        # Insert the Pie chart into the report_summary_sheet
        report_summary_sheet.insert_chart("I2", chart1)
        report_summary_sheet.insert_chart(
            f"I{1 + len(report_summary_main_data)}", chart2
        )

        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        return e


def send_report_to_me(attachment_list, from_date, to_date, location):
    try:
        subject = f"MNR Heavy Repair Report {from_date} to {to_date} for {location}, for Management Team"
        to_email_list = ["manjot.bajwa@sunandpearls.com"]
        cc_email_list = ["manjot.bajwa@sunandpearls.com"]
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
        return None


def get_repair_sheet_summary(
    ld,
    ld_amt_list,
    md,
    md_amt_list,
    hd,
    hd_amt_list,
):
    try:
        # LD
        # ld_plywood = SurveyLine.objects.filter(
        #     parent__pk__in=ld, material_description="PP - (Plywood)"
        # )
        # ld_steel = SurveyLine.objects.filter(
        #     parent__pk__in=ld, material_description="SK - (Steel, corten)"
        # )
        ld_plywood = SurveyLine.objects.filter(
            parent__pk__in=ld, material_description__icontains="Plywood"
        )
        ld_steel = SurveyLine.objects.filter(
            parent__pk__in=ld, material_description__icontains="Steel"
        )

        ld_plywood_cost = ld_plywood.aggregate(Sum("total_cost"))["total_cost__sum"]
        ld_steel_cost = ld_steel.aggregate(Sum("total_cost"))["total_cost__sum"]
        ld_container_count = len(ld)
        ld_amt = float(sum(ld_amt_list))

        if ld_plywood_cost is None:
            ld_plywood_cost = 0
        if ld_steel_cost is None:
            ld_steel_cost = 0

        ld_plywood_cost_percent = (round(ld_plywood_cost) * 100) / round(ld_amt)
        ld_steel_cost_percent = (round(ld_steel_cost) * 100) / round(ld_amt)

        # MD
        # md_plywood = SurveyLine.objects.filter(
        #     parent__pk__in=md, material_description="PP - (Plywood)"
        # )
        # md_steel = SurveyLine.objects.filter(
        #     parent__pk__in=md, material_description="SK - (Steel, corten)"
        # )
        md_plywood = SurveyLine.objects.filter(
            parent__pk__in=md, material_description__icontains="Plywood"
        )
        md_steel = SurveyLine.objects.filter(
            parent__pk__in=md, material_description__icontains="Steel"
        )

        md_plywood_cost = md_plywood.aggregate(Sum("total_cost"))["total_cost__sum"]
        md_steel_cost = md_steel.aggregate(Sum("total_cost"))["total_cost__sum"]
        md_container_count = len(md)
        md_amt = float(sum(md_amt_list))

        if md_plywood_cost is None:
            md_plywood_cost = 0
        if md_steel_cost is None:
            md_steel_cost = 0

        md_plywood_cost_percent = (round(md_plywood_cost) * 100) / round(md_amt)
        md_steel_cost_percent = (round(md_steel_cost) * 100) / round(md_amt)

        # HD
        # hd_plywood = SurveyLine.objects.filter(
        #     parent__pk__in=hd, material_description="PP - (Plywood)"
        # )
        # hd_steel = SurveyLine.objects.filter(
        #     parent__pk__in=hd, material_description="SK - (Steel, corten)"
        # )
        hd_plywood = SurveyLine.objects.filter(
            parent__pk__in=hd, material_description__icontains="Plywood"
        )
        hd_steel = SurveyLine.objects.filter(
            parent__pk__in=hd, material_description__icontains="Steel"
        )

        hd_plywood_cost = hd_plywood.aggregate(Sum("total_cost"))["total_cost__sum"]
        hd_steel_cost = hd_steel.aggregate(Sum("total_cost"))["total_cost__sum"]
        hd_container_count = len(hd)
        hd_amt = float(sum(hd_amt_list))

        if hd_plywood_cost is None:
            hd_plywood_cost = 0
        if hd_steel_cost is None:
            hd_steel_cost = 0

        hd_plywood_cost_percent = (round(hd_plywood_cost) * 100) / round(hd_amt)
        hd_steel_cost_percent = (round(hd_steel_cost) * 100) / round(hd_amt)

        # data
        damage_type = ["LD (<= 1000)", "MD (>1000 & <= 3000)", "HD (> 3000)"]
        qty = [ld_container_count, md_container_count, hd_container_count]
        total_repair_amt = [round(ld_amt), round(md_amt), round(hd_amt)]
        steel_amt = [round(ld_steel_cost), round(md_steel_cost), round(hd_steel_cost)]
        steel_usage_percent = [
            round(ld_steel_cost_percent, 2),
            round(md_steel_cost_percent, 2),
            round(hd_steel_cost_percent, 2),
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
                steel_amt[i],
                steel_usage_percent[i],
                plywood_amt[i],
                plywood_usage_percent[i],
            ]
            for i in range(len(damage_type))
        ]
        return excel_data
    except Exception as e:
        return e


def get_repair_mnr_data_report(location, from_date_str=None, to_date_str=None):
    print("Starting ...")
    to_date_time = datetime.datetime.now().astimezone(timezone.get_current_timezone())
    from_date_time = to_date_time - datetime.timedelta(days=130)
    from_date = from_date_time.date()
    to_date = to_date_time.date()
    if not from_date_str is None and not to_date_str is None:
        from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
        to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
    location_obj = Location.objects.get(name=location)
    site_objs = Site.objects.filter(location=location_obj)
    # repair_desc = [
    #     "RP - (Replace)",
    #     "RP - (Replace) - 20FT",
    #     "RP - (Replace) - 40FT",
    #     "SN - (Section)",
    # ]
    survey_pk_list = []
    for site_obj in site_objs:
        if site_obj.type == "DEPOT":
            stock = ContainerStock.objects.filter(
                container__site=site_obj,
                available_date__gte=from_date,
                available_date__lte=to_date,
                stage="Available",
            )

            survey_pk_list.extend(
                list(
                    set(
                        list(
                            SurveyLine.objects.filter(
                                parent__depot__in=list(stock),
                                # repair_description__in=repair_desc,
                            ).values_list("parent__pk", flat=True)
                        )
                    )
                )
            )
        else:
            stock = NonDepotContainerStock.objects.filter(
                container__site=site_obj,
                available_date__gte=from_date,
                available_date__lte=to_date,
                stage="Available",
            )
            survey_pk_list.extend(
                list(
                    set(
                        list(
                            SurveyLine.objects.filter(
                                parent__non_depot__in=list(stock),
                                # repair_description__in=repair_desc,
                            ).values_list("parent__pk", flat=True)
                        )
                    )
                )
            )
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

    less_than_or_equalto_1000_sheet_data = get_heavy_repair_sheet_main_data(
        less_than_or_equalto_1000
    )
    less_than_or_equalto_3000_sheet_data = get_heavy_repair_sheet_main_data(
        less_than_or_equalto_3000
    )
    greater_than_3000_sheet_data = get_heavy_repair_sheet_main_data(greater_than_3000)

    report_summary_main_data = get_repair_sheet_summary(
        ld=less_than_or_equalto_1000,
        ld_amt_list=less_than_or_equalto_1000_amt_list,
        md=less_than_or_equalto_3000,
        md_amt_list=less_than_or_equalto_3000_amt_list,
        hd=greater_than_3000,
        hd_amt_list=greater_than_3000_amt_list,
    )
    temp_file_path = create_heavy_repair_sheet_wb(
        less_than_or_equalto_1000_sheet_data,
        less_than_or_equalto_3000_sheet_data,
        greater_than_3000_sheet_data,
        report_summary_main_data,
    )
    send_report_to_me(
        attachment_list=[temp_file_path],
        from_date=str(from_date),
        to_date=str(to_date),
        location=location_obj.name,
    )
    os.remove(temp_file_path)
    print(f"Sent for {location_obj.name}")
    return True


def get_transpoter_from_invoice_no():
    try:
        data = []
        invoice_no = [
            "MNR/2324/KL03277",
            "MNR/2324/KL03278",
            "MNR/2324/KL02986",
            "MNR/2324/KL02987",
            "MNR/2324/KL02988",
            "MNR/2324/KL03057",
            "MNR/2324/KL03098",
            "MNR/2324/KL03146",
            "MNR/2324/KL03188",
            "MNR/2324/KL03198",
            "MNR/2324/KL03211",
            "MNR/2324/KL02262",
            "MNR/2324/KL02503",
            "MNR/2324/KL02967",
        ]
        for no in invoice_no:
            if CustomerBillInvoice.objects.filter(invoice_no=no).exists():
                invoice = CustomerBillInvoice.objects.get(invoice_no=no)
                bill_ids = list(
                    CustomerBillInvoiceLine.objects.filter(parent=invoice).values_list(
                        "bill_id", flat=True
                    )
                )
                in_lolo_ids = list(
                    CustomerBill.objects.filter(
                        pk__in=bill_ids, bill_for="IN"
                    ).values_list("lolo_id", flat=True)
                )
                out_lolo_ids = list(
                    CustomerBill.objects.filter(
                        pk__in=bill_ids, bill_for="OUT"
                    ).values_list("lolo_id", flat=True)
                )
                in_transporters = list(
                    GateInHistory.objects.filter(lolo__pk__in=in_lolo_ids).values_list(
                        "gate_in__transporter_name__name", flat=True
                    )
                )
                out_transporters = list(
                    GateOutHistory.objects.filter(
                        lolo__pk__in=out_lolo_ids
                    ).values_list("gate_out__transporter_name__name", flat=True)
                )
                transporters = in_transporters + out_transporters
                data.append(
                    {
                        "invoice_no": invoice.invoice_no,
                        "client": invoice.client.name,
                        "transporters": transporters,
                    }
                )
            else:
                print(no)
        return data
    except Exception as e:
        return e


def admin_panel_assign_only_view_permission(username):
    user = User.objects.get(username=username)
    for model in apps.get_models():
        content_type = ContentType.objects.get_for_model(model)
        try:
            permission = Permission.objects.get(
                codename=f"view_{model._meta.model_name}", content_type=content_type
            )
            user.user_permissions.add(permission)
        except Permission.DoesNotExist:
            pass


# Utility function to get start and end dates of a given month
def get_month_start_end(year, month):
    """Get the start and end dates of a given month."""
    start_date = date(year, month, 1)
    next_month = month + 1 if month < 12 else 1
    next_year = year if month < 12 else year + 1
    end_date = date(next_year, next_month, 1) - timedelta(days=1)
    return start_date, end_date


# Utility function to query site data
def get_site_data(history_model, site, size_name, params):
    """Query site data for a specific container size."""
    return (
        history_model.objects.select_related(
            "container", "container__site", "container__size"
        )
        .filter(container__site=site, container__size__name=size_name, **params)
        .count()
    )


# Process data for all sites and months
def process_monthly_data(year, movement):
    """Process monthly TEU data for all sites."""
    months_dict = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December",
    }

    data = {}
    sites = Site.objects.all()

    for site in sites:
        site_data = {}

        for month in months_dict.keys():
            start, end = get_month_start_end(year, month)
            tz = timezone.get_current_timezone()

            # Determine the appropriate model and parameters based on site type and movement
            if site.type == "DEPOT":
                history_model = GateInHistory if movement == "IN" else GateOutHistory
                params = {
                    "date__range": (
                        datetime.datetime.combine(
                            start, datetime.datetime.min.time()
                        ).astimezone(tz),
                        datetime.datetime.combine(
                            end, datetime.datetime.max.time()
                        ).astimezone(tz),
                    )
                }
            else:
                history_model = NonDepotGateIn if movement == "IN" else NonDepotGateOut
                params = (
                    {"in_date__range": (start, end)}
                    if movement == "IN"
                    else {"out_date__range": (start, end)}
                )

            # Fetch 20ft and 40ft container counts
            site_20_count = get_site_data(history_model, site, "20", params)
            site_20_tues = site_20_count * 1
            site_40_count = get_site_data(history_model, site, "40", params)
            site_40_tues = site_40_count * 2

            # "20_volume_data": site_20_count,
            # "20_tues_data": site_20_tues,
            # "40_volume_data": site_40_count,
            # "40_tues_data": site_40_tues,

            # Populate monthly data
            site_data[months_dict[month]] = site_20_tues + site_40_tues

        # Add site data to overall data
        data[site.name.upper()] = site_data

    return data


# Main function to calculate and return volume and TEU data
def volume_tues_yearly_detail(year, movement):
    """Main function to calculate volume and TEU data for all sites monthly."""
    try:
        data = process_monthly_data(year, movement)
        return {"data": data}
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error("Error processing monthly TEU data: %s", traceback.format_exc())
        return {"data": []}


"""
Task: Provisional Bill Report
Collect Handling count and amount based on IN/OUT process and 20'ft and 40'ft container
Collect MNR count and amount based on OUT process and 20'ft and 40'ft container
Do all this Site wise and based on from and to date

"""


def get_total_site_lolo_amount(site, size, count):
    try:
        unit_rate = site.size_20_rate if size == "20" else site.size_40_rate
        total_amount = (float(unit_rate) + (float(unit_rate) * 0.18)) * count
        return round(total_amount)
    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False


def get_size_site_data(history_model, site, size_name, line, params):
    return history_model.objects.select_related(
        "container", "container__site", "container__size"
    ).filter(
        container__site=site,
        container__size__name=size_name,
        container__client__ref_code=line,
        **params,
    )


def non_depot_bill_helper(from_date_str, to_date_str, line, site):
    try:
        site_data = {
            "site": site.name,
            "line": line,
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

        out_20_data = get_size_site_data(NonDepotGateOut, site, "20", line, out_params)
        out_40_data = get_size_site_data(NonDepotGateOut, site, "40", line, out_params)

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


def depot_bill_helper(from_date_str, to_date_str, line, site):
    try:
        site_data = {
            "site": site.name,
            "line": line,
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

        in_20_data = get_size_site_data(
            in_history_model, site, "20", line, depot_date_param
        )
        in_40_data = get_size_site_data(
            in_history_model, site, "40", line, depot_date_param
        )
        out_20_data = get_size_site_data(
            out_history_model, site, "20", line, depot_date_param
        )
        out_40_data = get_size_site_data(
            out_history_model, site, "40", line, depot_date_param
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


def get_provisional_bill_report_main_data(from_date_str, to_date_str, line):
    try:
        site_objs = Site.objects.filter(
            organization__icontains="Golden Horn Containers Service"
        )
        data = []

        for site in site_objs:
            site_data = {
                "site": site.name,
                "line": line,
                "lolo_in_20": 0,
                "lolo_in_40": 0,
                "lolo_out_20": 0,
                "lolo_out_40": 0,
                "lolo_bill_amount": 0,
                "mnr_20": 0,
                "mnr_40": 0,
                "mnr_bill_amount": 0,
            }
            if site.type == "DEPOT":
                site_data = depot_bill_helper(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    line=line,
                    site=site,
                )
            else:
                site_data = non_depot_bill_helper(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    line=line,
                    site=site,
                )
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


def create_provisional_bill_report_wb(provisional_bill_df_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR,
            f"temp/provisional_bill_report_{date}{time}_{random.randint(100000, 999999)}.xlsx",
        )

        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        inward_sheet = generic_workbook.add_worksheet("Report")
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
        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return e


def generate_provisional_bill_lolo_mnr(from_date_str, to_date_str, line):
    try:
        provisional_bill_df_data = get_provisional_bill_report_main_data(
            from_date_str, to_date_str, line
        )
        temp_file_path = create_provisional_bill_report_wb(provisional_bill_df_data)

        send_report_to_me(
            attachment_list=[temp_file_path],
            from_date=from_date_str,
            to_date=to_date_str,
            location="ALL",
        )
        os.remove(temp_file_path)
        return True
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return e


"""
Script to remove the garbage data in Handling and SelfTransportation Payment 
"""


def remove_lolo_st_payment_garbage_data():
    try:
        with transaction.atomic():

            lolo_payment = HandlingPayment.objects.filter(cheque_no=None, utr_no=None)
            for each in lolo_payment:
                lolo_history_object = None
                if GateInHistory.objects.filter(lolo_payment=each).exists():
                    lolo_history_object = GateInHistory.objects.filter(
                        lolo_payment=each
                    ).first()
                elif GateOutHistory.objects.filter(lolo_payment=each).exists():
                    lolo_history_object = GateOutHistory.objects.filter(
                        lolo_payment=each
                    ).first()
                else:
                    pass
                if lolo_history_object:
                    lolo_history_object.lolo.payment_id = None
                    lolo_history_object.lolo_payment = None
                    each.delete()
                else:
                    each.delete()

            st_payment = SelfTransportationPayment.objects.filter(
                cheque_no=None, utr_no=None
            )
            for each in st_payment:
                st_history_object = None
                if GateInHistory.objects.filter(st_payment=each).exists():
                    st_history_object = GateInHistory.objects.filter(
                        st_payment=each
                    ).first()
                elif GateOutHistory.objects.filter(st_payment=each).exists():
                    st_history_object = GateOutHistory.objects.filter(
                        st_payment=each
                    ).first()
                else:
                    pass
                if st_history_object:
                    st_history_object.st.payment_id = None
                    st_history_object.st_payment = None
                    each.delete()
                else:
                    each.delete()

            return True
    except:
        print(traceback.format_exc())
        return False


"""
Script to add payment type in Handling and SelfTransportation Payment 
"""


def add_payment_type_lolo_st_payment_data():
    try:
        with transaction.atomic():
            HandlingPayment.objects.exclude(cheque_no=None).update(
                payment_type="Cheque"
            )
            HandlingPayment.objects.exclude(utr_no=None).update(payment_type="NEFT")
            SelfTransportationPayment.objects.exclude(cheque_no=None).update(
                payment_type="Cheque"
            )
            SelfTransportationPayment.objects.exclude(utr_no=None).update(
                payment_type="NEFT"
            )

            return True
    except:
        print(traceback.format_exc())
        return False


"""
Script to bifurcate existing Handling and SelfTransportation Payment data based on location and site 
"""


def bifurcate_lolo_st_payment_site_wise():
    try:
        with transaction.atomic():

            for each in HandlingPayment.objects.all():
                if not each.container.count() == 0:
                    _container = each.container.first()
                    each.location = _container.location
                    each.site = _container.site
                    each.save()
                    print("**lolo**", " --> ", each.site.name)

            for each in SelfTransportationPayment.objects.all():
                if not each.container.count() == 0:
                    _container = each.container.first()
                    each.location = _container.location
                    each.site = _container.site
                    each.save()
                    print("**st**", " --> ", each.site.name)

            return True
    except:
        print(traceback.format_exc())
        return False


"""
Script to fix the Corrupted Gate In/Out History data
"""
from depot.models import *


def verify_correct_in_out_data():
    try:
        with transaction.atomic():
            in_out_record = ContainerInOutRecord.objects.select_related()
            count = 0
            total = in_out_record.count()
            for record in in_out_record:
                if record.in_data:
                    gate_in_history = record.in_data
                    gate_in_history.eir.is_verified = True
                    gate_in_history.eir.save()
                    gate_in_history.gate_in.is_verified = True
                    gate_in_history.gate_in.save()
                    if gate_in_history.lolo:
                        gate_in_history.lolo.is_verified = True
                        gate_in_history.lolo.save()
                        if gate_in_history.lolo_payment:
                            gate_in_history.lolo_payment.is_verified = True
                            gate_in_history.lolo_payment.save()
                    if gate_in_history.st:
                        gate_in_history.st.is_verified = True
                        gate_in_history.st.save()
                        if gate_in_history.st_payment:
                            gate_in_history.st_payment.is_verified = True
                            gate_in_history.st_payment.save()
                    record.in_patched = True
                    record.save()

                if record.out_data:
                    gate_out_history = record.out_data
                    gate_out_history.eir.is_verified = True
                    gate_out_history.eir.save()
                    gate_out_history.gate_out.is_verified = True
                    gate_out_history.gate_out.save()
                    if gate_out_history.lolo:
                        gate_out_history.lolo.is_verified = True
                        gate_out_history.lolo.save()
                        if gate_out_history.lolo_payment:
                            gate_out_history.lolo_payment.is_verified = True
                            gate_out_history.lolo_payment.save()
                    if gate_out_history.st:
                        gate_out_history.st.is_verified = True
                        gate_out_history.st.save()
                        if gate_out_history.st_payment:
                            gate_out_history.st_payment.is_verified = True
                            gate_out_history.st_payment.save()
                    record.out_patched = True
                    record.save()
                count += 1
                print(f"Processed {count} of {total}")
            return True
    except:
        print(traceback.format_exc())
        return False


def patch_orphan_in_data():
    try:
        with transaction.atomic():
            in_records = GateInHistory.objects.select_related()
            count = 0
            total = in_records.count()
            for in_data in in_records:
                if not ContainerInOutRecord.objects.filter(in_data=in_data).exists():
                    container = in_data.container
                    eir = in_data.eir
                    gate_in = in_data.gate_in
                    lolo = in_data.gate_in
                    lolo_payment = None
                    st = None
                    st_payment = None
                    if in_data.lolo_payment is not None:
                        lolo_payment = in_data.lolo_payment
                    if in_data.st is not None:
                        st = in_data.st
                    if in_data.st_payment is not None:
                        st_payment = in_data.st_payment

                    record = ContainerInOutRecord(
                        container=container, in_data=in_data, out_data=None
                    )
                    record.save()
                    eir.is_verified = True
                    eir.save()
                    gate_in.is_verified = True
                    gate_in.save()
                    lolo.is_verified = True
                    lolo.save()
                    if lolo_payment is not None:
                        lolo_payment.is_verified = True
                        lolo_payment.save()
                    if st is not None:
                        st.is_verified = True
                        st.save()
                    if st_payment is not None:
                        st_payment.is_verified = True
                        st_payment.save()
                    record.in_patched = True
                    record.save()
                    count += 1
                    print(f"Patched {count} of {total}")
            return True
    except:
        print(traceback.format_exc())
        return False


def patch_orphan_out_data():
    try:
        with transaction.atomic():
            out_records = GateOutHistory.objects.select_related()
            count = 0
            total = out_records.count()
            for out_data in out_records:
                if not ContainerInOutRecord.objects.filter(out_data=out_data).exists():
                    container = out_data.container
                    eir = out_data.eir
                    gate_out = out_data.gate_out
                    lolo = out_data.gate_out
                    lolo_payment = None
                    st = None
                    st_payment = None
                    if out_data.lolo_payment is not None:
                        lolo_payment = out_data.lolo_payment
                    if out_data.st is not None:
                        st = out_data.st
                    if out_data.st_payment is not None:
                        st_payment = out_data.st_payment

                    if ContainerStock.objects.filter(
                        container=container, gate_out=out_data.gate_out
                    ).exists():
                        stock = ContainerStock.objects.get(
                            container=container, gate_out=out_data.gate_out
                        )
                        if GateInHistory.objects.filter(
                            container=container, gate_in=stock.gate_in
                        ).exists():
                            in_data = GateInHistory.objects.get(
                                container=container, gate_in=stock.gate_in
                            )
                            if ContainerInOutRecord.objects.filter(
                                in_data=in_data
                            ).exists():
                                record = ContainerInOutRecord.objects.get(
                                    container=container, in_data=in_data
                                )
                                record.out_data = out_data
                                record.save()
                                eir.is_verified = True
                                eir.save()
                                gate_out.is_verified = True
                                gate_out.save()
                                lolo.is_verified = True
                                lolo.save()
                                if lolo_payment is not None:
                                    lolo_payment.is_verified = True
                                    lolo_payment.save()
                                if st is not None:
                                    st.is_verified = True
                                    st.save()
                                if st_payment is not None:
                                    st_payment.is_verified = True
                                    st_payment.save()
                                record.out_patched = True
                                record.save()
                                count += 1
                                print(f"Patched {count} of {total}")
            return True
    except:
        print(traceback.format_exc())
        return False


def patch_container_entry_count_and_status():
    try:
        with transaction.atomic():
            containers = Container.objects.select_related()
            count = 0
            total = containers.count()
            for container in containers:
                in_entry_count = GateInHistory.objects.filter(
                    container=container
                ).count()
                out_entry_count = GateOutHistory.objects.filter(
                    container=container
                ).count()
                container.in_entry_count = in_entry_count
                container.out_entry_count = out_entry_count
                container.save()
                if ContainerStock.objects.filter(
                    container=container, container_status="IN"
                ).exists():
                    container.status = "IN"
                    container.is_available = False
                    container.save()
                else:
                    container.status = "OUT"
                    container.is_available = True
                    container.save()
                count += 1
                print(f"Patched {count} of {total}")
            return True
    except:
        print(traceback.format_exc())
        return False


def delete_unverified_in_out_data():
    try:
        with transaction.atomic():
            eir_data = Eir.objects.select_related()
            count = 0
            total = eir_data.count()
            for eir in eir_data:
                if (
                    not GateInHistory.objects.filter(eir=eir).exists()
                    and not GateOutHistory.objects.filter(eir=eir).exists()
                ):
                    eir.delete()
                    count += 1
                    print(f"Deleted EIR {count} of {total}")

            gate_in_data = GateIn.objects.select_related()
            count = 0
            total = gate_in_data.count()
            for gate_in in gate_in_data:
                if not GateInHistory.objects.filter(gate_in=gate_in).exists():
                    gate_in.delete()
                    count += 1
                    print(f"Deleted GATEIN {count} of {total}")

            gate_out_data = GateOut.objects.select_related()
            count = 0
            total = gate_out_data.count()
            for gate_out in gate_out_data:
                if not GateOutHistory.objects.filter(gate_out=gate_out).exists():
                    gate_out.delete()
                    count += 1
                    print(f"Deleted GATEOUT {count} of {total}")

            lolo_data = Handling.objects.select_related()
            count = 0
            total = lolo_data.count()
            for lolo in lolo_data:
                if (
                    not GateInHistory.objects.filter(lolo=lolo).exists()
                    and not GateOutHistory.objects.filter(lolo=lolo).exists()
                ):
                    lolo.delete()
                    count += 1
                    print(f"Deleted LOLO {count} of {total}")

            lolo_payment = HandlingPayment.objects.select_related()
            count = 0
            total = lolo_payment.count()
            for payment in lolo_payment:
                if (
                    not GateInHistory.objects.filter(lolo_payment=payment).exists()
                    and not GateOutHistory.objects.filter(lolo_payment=payment).exists()
                ):
                    payment.delete()
                    count += 1
                    print(f"Deleted LOLO PAYMENT {count} of {total}")

            st_data = SelfTransportation.objects.select_related()
            count = 0
            total = st_data.count()
            for st in st_data:
                if (
                    not GateInHistory.objects.filter(st=st).exists()
                    and not GateOutHistory.objects.filter(st=st).exists()
                ):
                    st.delete()
                    count += 1
                    print(f"Deleted ST {count} of {total}")

            st_payment = SelfTransportationPayment.objects.select_related()
            count = 0
            total = st_payment.count()
            for payment in st_payment:
                if (
                    not GateInHistory.objects.filter(st_payment=payment).exists()
                    and not GateOutHistory.objects.filter(st_payment=payment).exists()
                ):
                    payment.delete()
                    count += 1
                    print(f"Deleted ST PAYMENT {count} of {total}")
            return True
    except:
        return False


def delete_unverified_eir_data():
    try:
        with transaction.atomic():
            eir_data = Eir.objects.select_related()
            count = 0
            for eir in eir_data:
                if (
                    not GateInHistory.objects.filter(eir=eir).exists()
                    and not GateOutHistory.objects.filter(eir=eir).exists()
                ):
                    eir.delete()
                    count += 1
                    print(f"Deleted EIR {count}")
            return True
    except:
        return False


def delete_unverified_gate_in_data():
    try:
        with transaction.atomic():
            gate_in_data = GateIn.objects.select_related()
            count = 0
            for gate_in in gate_in_data:
                if not GateInHistory.objects.filter(gate_in=gate_in).exists():
                    try:
                        gate_in.delete()
                        count += 1
                        print(f"Deleted GATEIN {count}")
                    except:
                        pass

            return True
    except:
        return False


def delete_unverified_stock():
    try:
        with transaction.atomic():
            stock = ContainerStock.objects.select_related()
            count = 0
            for each in stock:
                if not GateInHistory.objects.filter(gate_in=each.gate_in).exists():
                    each.delete()
                    count += 1
                    print(f"Deleted STOCK {count}")

            return True
    except:
        return False


def delete_unverified_gate_out_data():
    try:
        with transaction.atomic():
            gate_out_data = GateOut.objects.select_related()
            count = 0
            for gate_out in gate_out_data:
                if not GateOutHistory.objects.filter(gate_out=gate_out).exists():
                    try:
                        gate_out.delete()
                        count += 1
                        print(f"Deleted GATEOUT {count}")
                    except:
                        pass
            return True
    except:
        return False


def delete_unverified_lolo_data():
    try:
        with transaction.atomic():

            lolo_data = Handling.objects.select_related()
            count = 0
            for lolo in lolo_data:
                if (
                    not GateInHistory.objects.filter(lolo=lolo).exists()
                    and not GateOutHistory.objects.filter(lolo=lolo).exists()
                ):
                    try:
                        lolo.delete()
                        count += 1
                        print(f"Deleted LOLO {count}")
                    except:
                        pass
            return True
    except:
        return False


def delete_unverified_st_data():
    try:
        with transaction.atomic():

            st_data = SelfTransportation.objects.select_related()
            count = 0
            for st in st_data:
                if (
                    not GateInHistory.objects.filter(st=st).exists()
                    and not GateOutHistory.objects.filter(st=st).exists()
                ):
                    st.delete()
                    count += 1
                    print(f"Deleted ST {count}")
            return True
    except:
        return False


def delete_unverified_lolo_payment_data():
    try:
        with transaction.atomic():

            lolo_payment = HandlingPayment.objects.select_related()
            count = 0
            for payment in lolo_payment:
                if (
                    not GateInHistory.objects.filter(lolo_payment=payment).exists()
                    and not GateOutHistory.objects.filter(lolo_payment=payment).exists()
                ):
                    payment.delete()
                    count += 1
                    print(f"Deleted LOLO PAYMENT {count}")

            return True
    except:
        return False


def delete_unverified_st_payment_data():
    try:
        with transaction.atomic():

            st_payment = SelfTransportationPayment.objects.select_related()
            count = 0
            for payment in st_payment:
                if (
                    not GateInHistory.objects.filter(st_payment=payment).exists()
                    and not GateOutHistory.objects.filter(st_payment=payment).exists()
                ):
                    payment.delete()
                    count += 1
                    print(f"Deleted LOLO PAYMENT {count}")

            return True
    except:
        return False


"""
"""


def delete_useless_email_tracker_data():
    try:
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        last_six_months = dt - datetime.timedelta(days=180)
        EdiMailTracker.objects.filter(email_date__lt=last_six_months).delete()
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


"""
create_adv_lolo_pymt_invoice_rel_patch
"""


def create_adv_lolo_pymt_invoice_rel_patch():
    error_log = logging.getLogger("error_log")

    try:
        print("Started ...")

        payments = AdvancedHandlingPayment.objects.all()
        total = payments.count()

        print(f"Total ... {total}")

        for count, payment_obj in enumerate(payments.iterator(), start=1):
            invoice_no = ""

            if payment_obj.bl_no:
                lolo_pk_list = list(
                    GateInHistory.objects.filter(
                        container__location=payment_obj.location,
                        container__site=payment_obj.site,
                        gate_in__bl_no=payment_obj.bl_no,
                    )
                    .values_list("lolo_id", flat=True)
                    .distinct()
                )
            else:
                lolo_pk_list = list(
                    GateOutHistory.objects.filter(
                        container__location=payment_obj.location,
                        container__site=payment_obj.site,
                        gate_out__booking_no=payment_obj.bk_no,
                    )
                    .values_list("lolo_id", flat=True)
                    .distinct()
                )

            bill_pk_list = list(
                CustomerBill.objects.filter(lolo_id__in=lolo_pk_list).values_list(
                    "pk", flat=True
                )
            )

            if bill_pk_list:
                invoice_no = (
                    CustomerBillInvoiceLine.objects.filter(bill_id__in=bill_pk_list)
                    .values_list("parent__invoice_no", flat=True)
                    .distinct()
                    .first()
                )

            if invoice_no:
                AdvLoloPymtInvoiceRel.objects.get_or_create(
                    parent=payment_obj,
                    invoice_no=invoice_no,
                )

            print(f"{count} ... of ... {total} ... Completed")

        return "All Done..."

    except Exception:
        error_log.error(traceback.format_exc())
        return ""
