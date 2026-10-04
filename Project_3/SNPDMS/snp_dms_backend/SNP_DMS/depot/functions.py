from collections import defaultdict

import pandas as pd
from decouple import config
from SNP_DMS.settings.base import BASE_DIR
from depot.lolo_finance_models import PreGateIn
from django.db.models import Case, When, Value, CharField, Count, IntegerField

from .models import GateIn, GateOut
from django.http import HttpResponse
from master.models_two import Client, ClientAbbreviation
from master.models import ContainerType, ContainerSize, Transporter, ExportCargoType
from .functions_two import check_char_digit
from .models import *
from common.functions import upload_file, download_file, delete_file
from billing_invoice.models import CustomerBill
import xlsxwriter
from report.xlsx_function2 import get_merge_format, get_merge_format2, get_merge_format3
import uuid
import base64
from django.db import transaction
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from mnr.models import Survey
import os, datetime, openpyxl, logging, traceback
from truck_tracking.models import TruckTracking

from master.models import Site, Location

AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME")


def upload_to_s3(location, site, container_no, process, gate_pass_no, file):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        gate_pass_no_new = gate_pass_no.replace("/", "_")
        object_name = (
            f"DO_Challan/{location}/{site}/{container_no}/{process}/{gate_pass_no_new}/"
            f"{container_no}_{gate_pass_no_new}_{file}"
        )
        if process == "IN":
            gate_in = GateIn.objects.get(gate_pass_no=gate_pass_no)
            if gate_in.do_s3_object_name is not None:
                if not len(gate_in.do_s3_object_name) == 0:
                    delete_file(
                        bucket=bucket_name, object_name=gate_in.do_s3_object_name
                    )
            try:
                if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/"))
                temp_file_path = os.path.join(BASE_DIR, f"temp/{file}")
                with open(temp_file_path, "wb") as temp:
                    temp.write(file.read())
                upload_file(temp_file_path, bucket_name, object_name)
                gate_in.do_s3_object_name = object_name
                gate_in.do_s3_file_name = (
                    f"{container_no}_{gate_pass_no_new}_{file.name}"
                )
                gate_in.save()
                os.remove(temp_file_path)
                return True
            except Exception as e:
                os.remove(temp_file_path)
                return False
        else:
            gate_out = GateOut.objects.get(gate_pass_no=gate_pass_no)
            if gate_out.do_s3_object_name is not None:
                if not len(gate_out.do_s3_object_name) == 0:
                    delete_file(
                        bucket=bucket_name, object_name=gate_out.do_s3_object_name
                    )
            try:
                if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/"))
                temp_file_path = os.path.join(BASE_DIR, f"temp/{file}")
                with open(temp_file_path, "wb") as temp:
                    temp.write(file.read())
                upload_file(temp_file_path, bucket_name, object_name)
                gate_out.do_s3_object_name = object_name
                gate_out.do_s3_file_name = (
                    f"{container_no}_{gate_pass_no_new}_{file.name}"
                )
                gate_out.save()
                os.remove(temp_file_path)
                return True
            except Exception as e:
                os.remove(temp_file_path)
                return False
    except Exception as e:
        return False


def download_from_s3(process, gate_pass_no):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        file_name = None
        object_name = None
        if process == "IN":
            gate_in = GateIn.objects.get(gate_pass_no=gate_pass_no)
            file_name = gate_in.do_s3_file_name
            object_name = gate_in.do_s3_object_name
        else:
            gate_out = GateOut.objects.get(gate_pass_no=gate_pass_no)
            file_name = gate_out.do_s3_file_name
            object_name = gate_out.do_s3_object_name
        temp_file_path = download_file(
            bucket=bucket_name, object_name=object_name, file_name=file_name
        )
        extension = os.path.splitext(file_name)[1]
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(
                temp.read(), content_type=f"application/{extension}"
            )
            file_response["Content-Disposition"] = f'attachment; filename="{file_name}"'
            os.remove(temp_file_path)
            return file_response
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_excel_data(input_excel, location, site):
    try:
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["stock"]
        shipping_line_raw = [
            sheet["A" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        client_raw = [
            sheet["B" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        c_type_raw = [
            sheet["C" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        c_size_raw = [
            sheet["D" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        container_no_raw = [
            sheet["E" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        gross_wt_raw = [
            sheet["F" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        tare_wt_raw = [
            sheet["G" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        manufacturing_date_raw = [
            sheet["H" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        in_date_raw = [
            sheet["I" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        in_time_raw = [
            sheet["J" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        condition_raw = [
            sheet["K" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        grade_raw = [sheet["L" + str(row)].value for row in range(1, sheet.max_row + 1)]
        arrived_raw = [
            sheet["M" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        transporter_raw = [
            sheet["N" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        vehicle_no_raw = [
            sheet["O" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        shipper_raw = [
            sheet["P" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        vessel_raw = [
            sheet["Q" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        voyage_raw = [
            sheet["R" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        cargo_raw = [sheet["S" + str(row)].value for row in range(1, sheet.max_row + 1)]
        cargo_type_raw = [
            sheet["T" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]

        shipping_line = [each for each in shipping_line_raw if not each is None]
        client = [each for each in client_raw if not each is None]
        c_type = [each for each in c_type_raw if not each is None]
        c_size = [each for each in c_size_raw if not each is None]
        container_no = [each for each in container_no_raw if not each is None]
        gross_wt = [each for each in gross_wt_raw if not each is None]
        tare_wt = [each for each in tare_wt_raw if not each is None]
        manufacturing_date = [
            each for each in manufacturing_date_raw if not each is None
        ]
        in_date = [each for each in in_date_raw if not each is None]
        in_time = [each for each in in_time_raw if not each is None]
        condition = [each for each in condition_raw if not each is None]
        grade = [each for each in grade_raw if not each is None]
        arrived = [each for each in arrived_raw if not each is None]
        transporter = [each for each in transporter_raw if not each is None]
        vehicle_no = [each for each in vehicle_no_raw if not each is None]
        shipper = [each for each in shipper_raw if not each is None]
        vessel = [each for each in vessel_raw if not each is None]
        voyage = [each for each in voyage_raw if not each is None]
        cargo = [each for each in cargo_raw if not each is None]
        cargo_type = [each for each in cargo_type_raw if not each is None]

        popped = [
            shipping_line.pop(0),
            client.pop(0),
            c_type.pop(0),
            c_size.pop(0),
            container_no.pop(0),
            gross_wt.pop(0),
            tare_wt.pop(0),
            manufacturing_date.pop(0),
            in_date.pop(0),
            in_time.pop(0),
            condition.pop(0),
            grade.pop(0),
            arrived.pop(0),
            transporter.pop(0),
            vehicle_no.pop(0),
            shipper.pop(0),
            vessel.pop(0),
            voyage.pop(0),
            cargo.pop(0),
            cargo_type.pop(0),
        ]

        headers = [
            "shipping_line",
            "client",
            "type",
            "size",
            "container_no",
            "gross_wt",
            "tare_wt",
            "manufacturing_date",
            "in_date",
            "in_time",
            "condition",
            "grade",
            "arrived",
            "transporter",
            "vehicle_no",
            "shipper",
            "vessel",
            "voyage",
            "cargo",
            "cargo_type",
        ]

        if not popped == headers:
            return "Header Not Found"

        extracted_data_list = []

        for i in range(len(client)):
            extracted_data_list.append(
                {
                    "sr_no": str(i),
                    "shipping_line": str(shipping_line[i]),
                    "client": str(client[i]),
                    "type": str(c_type[i]),
                    "size": str(c_size[i]),
                    "container_no": str(container_no[i]),
                    "gross_wt": str(gross_wt[i]),
                    "tare_wt": str(tare_wt[i]),
                    "manufacturing_date": str(manufacturing_date[i]),
                    "in_date": str(in_date[i]),
                    "in_time": str(in_time[i]),
                    "condition": str(condition[i]),
                    "grade": str(grade[i]),
                    "arrived": str(arrived[i]),
                    "transporter": str(transporter[i]),
                    "vehicle_no": str(vehicle_no[i]),
                    "shipper": str(shipper[i]),
                    "vessel": str(vessel[i]),
                    "voyage": str(voyage[i]),
                    "cargo": str(cargo[i]),
                    "cargo_type": str(cargo_type[i]),
                }
            )
        ps.close()
        error_data = []
        error_data_msg = {}
        correct_data = []

        for each in extracted_data_list:
            error_msg = []

            client_name = each["client"]
            try:
                Client.objects.get(
                    name=client_name, type="Line", location=location, site=site
                )
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in client column, "
                    f"client not found in system database"
                )

            shipping_line_name = each["shipping_line"]
            try:
                client_obj = Client.objects.get(
                    name=client_name, type="Line", location=location, site=site
                )
                list(
                    ClientAbbreviation.objects.filter(
                        client=client_obj, name=shipping_line_name
                    )
                )[0]
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in shipping_line column, "
                    f"shipping_line not found in system database"
                )

            type_name = each["type"]
            try:
                ContainerType.objects.get(name=type_name)
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in type column,"
                    f"type not found in system database"
                )

            size_name = each["size"]
            try:
                ContainerSize.objects.get(name=str(int(float(size_name))))
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in size column,"
                    f"size not found in system database"
                )

            arrived_str = each["arrived"]
            arrived_list = [
                "Factory",
                "Road/Rail",
                "CFS/ICD",
                "Port/Vessel",
                "FS RETURN",
            ]
            if not arrived_str in arrived_list:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in arrived column,"
                    f"arrived provided is not correct, should be among these (Factory, Road/Rail"
                    f"CFS/ICD, Port/Vessel)"
                )
            else:
                error_msg.append("")

            container_no_str = each["container_no"]
            if (
                len(container_no_str) == 11
                and check_char_digit(container_no_str) is True
            ):
                try:
                    for obj_data in correct_data:
                        if container_no_str == obj_data["container_no"]:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                                f"this container is repeated in your file"
                            )
                        else:
                            pass
                except:
                    pass
                try:
                    Container.objects.get(
                        container_no=container_no_str,
                        status="IN",
                        location=location,
                        # site=site,
                    )
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this container is already IN"
                    )
                except:
                    error_msg.append("")
                try:
                    if (
                        site.lolo_finance
                        and not PreGateIn.objects.filter(
                            container_no=container_no,
                            location=location,
                            site=site,
                            on_hold=False,
                            validity_expired=False,
                            is_gatein_done=False,
                        ).exists()
                        and arrived_str in ["Factory", "FS RETURN", "CFS/ICD"]
                    ):
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                            f"this container should be PreGateIn first and should be under do_valididty"
                        )
                except:
                    error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no is invalid"
                )

            gross_wt_str = each["gross_wt"]
            if not gross_wt_str == "_":
                try:
                    if str(int(float(gross_wt_str))).isdigit() is False:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in gross_wt column,"
                            f"gross_wt is not digit"
                        )
                    else:
                        error_msg.append("")
                except:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in gross_wt column,"
                        f"gross_wt is not digit"
                    )
            else:
                each["gross_wt"] = ""
                error_msg.append("")

            tare_wt_str = each["tare_wt"]
            if not tare_wt_str == "_":
                try:
                    if str(int(float(tare_wt_str))).isdigit() is False:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in tare_wt column,"
                            f"tare_wt is not digit"
                        )
                    else:
                        error_msg.append("")
                except:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in tare_wt column,"
                        f"tare_wt is not digit"
                    )
            else:
                each["tare_wt"] = ""
                error_msg.append("")

            manufacturing_date_str = each["manufacturing_date"]
            try:
                datetime.datetime.strptime(manufacturing_date_str, "%d_%m_%Y").date()
                error_msg.append("")
            except:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in manufacturing_date column,"
                    f"date is not in dd_mm_yyyy format"
                )

            in_date_str = each["in_date"]
            try:
                datetime.datetime.strptime(in_date_str, "%d_%m_%Y").date()
                error_msg.append("")
            except:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_date column,"
                    f"date is not in dd_mm_yyyy format"
                )

            in_time_str = each["in_time"]
            try:
                datetime.datetime.strptime(in_time_str, "%H_%M").time()
                error_msg.append("")
            except:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_time column,"
                    f"date is not in HH_MM format"
                )

            condition_str = each["condition"]
            condition_list = ["OK", "CLEANING", "LD", "MD", "HD"]
            if not condition_str in condition_list:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in condition column,"
                    f"condition provided is not correct, should be among these (OK, CLEANING, LD, MD, HD)"
                )
            else:
                error_msg.append("")

            grade_str = each["grade"]
            if not grade_str == "_":
                grade_list = ["A", "B", "C", "D", "E", "F"]
                if not grade_str in grade_list:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in grade column,"
                        f"grade provided is not correct, should be among these (A, B, C, D, E, F)"
                    )
                else:
                    error_msg.append("")
            else:
                each["grade"] = ""
                error_msg.append("")

            transporter_name = each["transporter"]
            try:
                Transporter.objects.get(
                    name=transporter_name, location=location, site=site
                )
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in transporter column, "
                    f"transporter not found in system database"
                )

            vehicle_no_str = each["vehicle_no"]
            try:
                if vehicle_no_str == "_":
                    each["vehicle_no"] = ""
                    error_msg.append("")
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in vehicle_no column"
                )

            shipper_str = each["shipper"]
            try:
                if shipper_str == "_":
                    each["shipper"] = ""
                    error_msg.append("")
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in shipper column"
                )

            vessel_str = each["vessel"]
            try:
                if vessel_str == "_":
                    each["vessel"] = ""
                    error_msg.append("")
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in vessel column"
                )

            voyage_str = each["voyage"]
            try:
                if voyage_str == "_":
                    each["voyage"] = ""
                    error_msg.append("")
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in voyage column"
                )

            cargo_str = each["cargo"]
            try:
                if cargo_str == "_":
                    each["cargo"] = ""
                    error_msg.append("")
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in cargo column"
                )

            cargo_type_str = each["cargo_type"]
            try:
                if cargo_type_str == "_":
                    each["cargo_type"] = ""
                    error_msg.append("")
                else:
                    ExportCargoType.objects.get(name=cargo_type_str)
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in cargo_type column, May be given Cargo_type Don't exists"
                )

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)
        correct_data_count = str(len(correct_data))
        error_data_count = str(len(error_data))
        main_data = {
            "importable_data": correct_data,
            "importable_data_count": correct_data_count,
            "rejected_data": error_data,
            "rejected_data_count": error_data_count,
            "faults": error_data_msg,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


# def create_billing_lolo(object, bill_date, location, site):
#     client_obj = (
#         object.container.client
#         if object.lolo.apply_charges == "Line"
#         else object.lolo.customer_name
#     )
#     lolo_billing = CustomerBill.create(
#         lolo_id=object.lolo.pk,
#         st_id=None,
#         survey_id=None,
#         bill_type="Handling",
#         bill_date=bill_date,
#         apply_charge=object.lolo.apply_charges,
#         container_no=object.container.container_no,
#         client=object.container.client,
#         customer=client_obj,
#         ref_code=object.container.client.ref_code,
#         is_payment_completed=False,
#         payment_type=object.lolo.payment_type,
#         original_amount=float(object.lolo.lolo_amount),
#         remaining_amount=float(object.lolo.lolo_amount),
#         location=location,
#         site=site,
#     )
#     lolo_billing.save()
#     return lolo_billing


# def create_billing_st(object, bill_date, location, site):
#     client_obj = (
#         object.container.client
#         if object.st.apply_charges == "Line"
#         else object.st.customer_name
#     )
#     st_billing = CustomerBill.create(
#         lolo_id=None,
#         st_id=object.st.pk,
#         survey_id=None,
#         bill_type="Transportation",
#         bill_date=bill_date,
#         apply_charge=object.st.apply_charges,
#         container_no=object.container.container_no,
#         client=object.container.client,
#         customer=client_obj,
#         ref_code=object.container.client.ref_code,
#         is_payment_completed=False,
#         payment_type=object.st.payment_type,
#         original_amount=float(object.st.price),
#         remaining_amount=float(object.st.price),
#         location=location,
#         site=site,
#     )
#     st_billing.save()
#     return st_billing


def apply_lolo_night_charges(obj, process):
    try:
        lolo = obj.lolo
        bill_date = obj.gate_in.in_date if process == "IN" else obj.gate_out.out_date
        container = obj.lolo.container
        site_name = container.site.name
        customer = (
            obj.container.client
            if obj.lolo.apply_charges == "Line" or obj.lolo.customer_name is None
            else obj.lolo.customer_name
        )
        if site_name in [
            "INGHK",
            "INGHC",
            "GOLDEN HORN CONTAINER SERVICES TWO KOLKATA",
        ]:
            charge = (
                obj.container.site.night_charge_size_20_rate
                if container.size.name == "20"
                else obj.container.site.night_charge_size_40_rate
            )
            tax = float(charge) * 0.18
            charge_with_tax = float(charge) + float(tax)
            # create
            if (
                lolo.is_night_charges_applied
                and int(lolo.night_charges) == 0
                and not lolo.payment_type == "None"
            ):
                # charge_with_tax = 600 if container.size.name == "20" else 1200

                lolo.night_charges = charge_with_tax
                lolo.save()
                if CustomerBill.objects.filter(
                    lolo_id=lolo.pk, bill_type="Night Charge"
                ).exists():
                    if not lolo.is_night_charge_bill_invoiced:
                        night_charge_obj = CustomerBill.objects.get(
                            lolo_id=lolo.pk, bill_type="Night Charge"
                        )
                        night_charge_obj.bill_date = bill_date
                        night_charge_obj.container_no = obj.container.container_no
                        night_charge_obj.client = obj.container.client
                        night_charge_obj.customer = customer
                        night_charge_obj.ref_code = obj.container.client.ref_code
                        night_charge_obj.payment_type = obj.lolo.payment_type
                        night_charge_obj.apply_charge = obj.lolo.apply_charges
                        night_charge_obj.original_amount = float(charge_with_tax)
                        night_charge_obj.remaining_amount = float(charge_with_tax)
                        night_charge_obj.save()

                else:
                    night_charge_obj = CustomerBill.create(
                        lolo_id=lolo.pk,
                        st_id=None,
                        survey_id=None,
                        bill_type="Night Charge",
                        bill_date=bill_date,
                        apply_charge=obj.lolo.apply_charges,
                        container_no=obj.container.container_no,
                        client=obj.container.client,
                        customer=customer,
                        ref_code=obj.container.client.ref_code,
                        is_payment_completed=False,
                        payment_type=obj.lolo.payment_type,
                        original_amount=float(charge_with_tax),
                        remaining_amount=float(charge_with_tax),
                        bill_for=process,
                        location=obj.container.location,
                        site=obj.container.site,
                    )
                    night_charge_obj.save()
            # remove
            if not lolo.is_night_charges_applied and lolo.night_charges > 0:
                lolo.night_charges = float(0)
                lolo.save()
                if CustomerBill.objects.filter(
                    lolo_id=lolo.pk, bill_type="Night Charge"
                ).exists():
                    night_charge_bill = CustomerBill.objects.get(
                        lolo_id=lolo.pk, bill_type="Night Charge"
                    )
                    night_charge_bill.delete()
        else:
            pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def generic_stock_sheet_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container
        gate_in_data = data_object.gate_in
        in_date_str = gate_in_data.in_date.strftime("%b %d %Y")
        in_time_str = gate_in_data.in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str + " " + in_time_str
        data["gate_in_date"] = gate_in_date
        data["container_no"] = container_data.container_no
        data["container_size"] = container_data.size.name
        data["container_type"] = container_data.type.name
        data["gross_wt"] = container_data.gross_wt
        data["tare_wt"] = container_data.tare_wt
        data["payload"] = container_data.payload
        if not data_object.gate_out is None:
            cal = data_object.gate_out.out_date - data_object.gate_in.in_date
        else:
            cal = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                - data_object.gate_in.in_date
            )
        data["age"] = str(cal.days)
        data["status"] = data_object.status
        data["stage"] = data_object.stage
        data["condition"] = gate_in_data.condition
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_stock_sheet_main_data(stock_data):
    try:
        count = 0
        data = []
        for each in stock_data:
            count += 1
            each_data = generic_stock_sheet_row_data(each)
            each_data["sl_no"] = count

            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("container_size") for each in data]
        container_type = [each.get("container_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        age = [each.get("age") for each in data]
        status = [each.get("status") for each in data]
        stage = [each.get("stage") for each in data]
        condition = [each.get("condition") for each in data]
        df_data = [
            [
                sl_no[i],
                gate_in_date[i],
                container_no[i],
                container_size[i],
                container_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                age[i],
                status[i],
                stage[i],
                condition[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 12)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 12)]]
        return df_data


def create_generic_stock_sheet_wb(
    user_data,
    stock_df_data,
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M%S")
        temp_file_path = os.path.join(BASE_DIR, f"temp/stock_sheet_{date}{time}.xlsx")
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        stock_sheet = generic_workbook.add_worksheet("STOCK")
        generic_merge_format = get_merge_format(generic_workbook)
        generic_merge_format2 = get_merge_format2(generic_workbook)
        generic_merge_format3 = get_merge_format3(generic_workbook)
        stock_sheet.merge_range(
            "A1:U2", user_data["company_name"], generic_merge_format
        )
        stock_sheet.merge_range(
            "A3:U3", user_data["company_address"], generic_merge_format2
        )

        stock_sheet.merge_range("A4:U4", "REPORT NAME : STOCK", generic_merge_format3)
        stock_sheet.merge_range("A5:U5", None, generic_merge_format3)
        stock_sheet.merge_range(
            "A6:U6",
            f"DEPOT NAME : {user_data['site']} , LOCATION: {user_data['location']}",
            generic_merge_format3,
        )
        stock_sheet.merge_range("A7:U7", None, generic_merge_format3)
        stock_sheet.add_table(
            f"A9:L{9 + len(stock_df_data)}",
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
                    {"header": "Age"},
                    {"header": "Status"},
                    {"header": "Stage"},
                    {"header": "Condition"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())


def create_allotment_track_record(
    location, site, booking_date, booking_no, container_no, stock_id
):
    try:
        if AllotmentTracker.objects.filter(
            location=location,
            site=site,
            booking_no=booking_no,
            booking_canceled=True,
            replaced=False,
        ).exists():
            canceled_booking_track_record = AllotmentTracker.objects.filter(
                location=location,
                site=site,
                booking_no=booking_no,
                booking_canceled=True,
                replaced=False,
            ).latest("pk")
            AllotmentTracker.create_allotment_tracker(
                location=location,
                site=site,
                booking_date=booking_date,
                booking_no=booking_no,
                container_no=container_no,
                stock_id=stock_id,
                replaced_container_no=canceled_booking_track_record.container_no,
                replaced_stock_id=canceled_booking_track_record.stock_id,
            )
            canceled_booking_track_record.replaced = True
            canceled_booking_track_record.save()
        else:
            AllotmentTracker.create_allotment_tracker(
                location=location,
                site=site,
                booking_date=booking_date,
                booking_no=booking_no,
                container_no=container_no,
                stock_id=stock_id,
            )
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def upload_driver_img_to_s3(img_url, obj, container_no, driver_license, process):
    AWS_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")
    bucket_name = AWS_BUCKET_NAME

    if process == "IN":
        child_obj = obj.gate_in
    else:
        child_obj = obj.gate_out

    if child_obj.is_driver_img_uploaded:
        existing_object_name = child_obj.driver_image_s3_object_name
        delete_file(bucket_name, existing_object_name)
        child_obj.driver_image_s3_file_name = None
        child_obj.driver_image_s3_object_name = None
        child_obj.is_driver_img_uploaded = False
        child_obj.save(
            update_fields=[
                "driver_image_s3_file_name",
                "driver_image_s3_object_name",
                "is_driver_img_uploaded",
            ]
        )

    meta_data = img_url.split(",")[0]
    header = meta_data.split(";")[0]
    mime_type = header.split(":")[1]
    extension = mime_type.split("/")[1]
    img_file = base64.b64decode(img_url.split(",")[1])

    filename = f"{container_no}_{obj.pk}_{driver_license}.{extension}"

    if process == "IN":
        object_name = f"Driver/IN/{filename}"
        unique_filename = f"{uuid.uuid4()}.{extension}"
        temp_file_path = os.path.join(BASE_DIR, "temp/Depot/IN/", unique_filename)
    else:
        object_name = f"Driver/OUT/{filename}"
        unique_filename = f"{uuid.uuid4()}.{extension}"
        temp_file_path = os.path.join(BASE_DIR, "temp/Depot/OUT/", unique_filename)

    try:
        os.makedirs(os.path.dirname(temp_file_path), exist_ok=True)

        with open(temp_file_path, "wb") as temp:
            temp.write(img_file)
        upload_file(temp_file_path, bucket_name, object_name, True)

        os.remove(temp_file_path)

        child_obj.driver_image_s3_file_name = filename
        child_obj.driver_image_s3_object_name = object_name
        child_obj.is_driver_img_uploaded = True
        child_obj.save(
            update_fields=[
                "driver_image_s3_file_name",
                "driver_image_s3_object_name",
                "is_driver_img_uploaded",
            ]
        )

    except:
        os.remove(temp_file_path)


def detect_usa_approval_containers_shell_script():
    try:
        with transaction.atomic():
            tz = timezone.get_current_timezone()
            five_years_ago = datetime.datetime.now().astimezone(
                tz
            ).date() - relativedelta(years=5)
            ContainerStock.objects.filter(
                container__manufacturing_date__gt=five_years_ago,
                grade__in=["A", "B"],
                container__status="IN",
                container_status="IN",
            ).update(usa_approval_container=True)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def unlock_mnr_bills(goh, site):
    if site.type == "DEPOT":
        param = {"depot__gate_out": goh.gate_out}
    else:
        param = {"non_depot__gate_out": goh.gate_out}

    if Survey.objects.filter(**param).exists():
        survey = Survey.objects.get(**param)
        if CustomerBill.objects.filter(survey_id=survey.pk).exists():
            CustomerBill.objects.filter(survey_id=survey.pk).update(is_locked=False)


def extract_advance_list_data(file):
    wb = openpyxl.load_workbook(file, read_only=True)
    sheet = wb["advance_list"]
    (
        line_raw,
        job_order_no_raw,
        vessel_name_raw,
        voyage_no_raw,
        quantity_raw,
        gate_ins_raw,
        pendency_raw,
    ) = ([], [], [], [], [], [], [])
    for row in sheet.iter_rows():
        line_raw.append(row[0].value or "")
        job_order_no_raw.append(row[1].value or "")
        vessel_name_raw.append(row[2].value or "")
        voyage_no_raw.append(row[3].value or "")
        quantity_value = row[4].value
        if quantity_value == "QUANTITY":
            quantity_raw.append("QUANTITY")
        elif quantity_value is not None:
            if isinstance(quantity_value, (int, float)):
                quantity_raw.append(quantity_value)
            else:
                quantity_raw.append("")
        else:
            quantity_raw.append("")
        gate_ins_value = row[5].value
        if gate_ins_value == "GATE IN":
            gate_ins_raw.append("GATE IN")
        elif gate_ins_value is not None:
            if isinstance(gate_ins_value, (int, float)):
                gate_ins_raw.append(gate_ins_value)
            else:
                gate_ins_raw.append("")
        else:
            gate_ins_raw.append("")
        pendency_value = row[6].value
        if pendency_value == "PENDENCY":
            pendency_raw.append("PENDENCY")
        elif pendency_value is not None:
            if isinstance(pendency_value, (int, float)):
                pendency_raw.append(pendency_value)
            else:
                pendency_raw.append("")
        else:
            pendency_raw.append("")
    headers = [
        line_raw.pop(0),
        job_order_no_raw.pop(0),
        vessel_name_raw.pop(0),
        voyage_no_raw.pop(0),
        quantity_raw.pop(0),
        gate_ins_raw.pop(0),
        pendency_raw.pop(0),
    ]
    if headers != [
        "LINE",
        "JOB ORDER NO",
        "VESSEL NAME",
        "VOYAGE NO",
        "QUANTITY",
        "GATE IN",
        "PENDENCY",
    ]:
        return "Header not Found"
    data = [
        (line, job_order_no, vessel_name, voyage_no, quantity, gate_ins, pendency)
        for line, job_order_no, vessel_name, voyage_no, quantity, gate_ins, pendency in zip(
            line_raw,
            job_order_no_raw,
            vessel_name_raw,
            voyage_no_raw,
            quantity_raw,
            gate_ins_raw,
            pendency_raw,
        )
        if line
        or job_order_no
        or vessel_name
        or voyage_no
        or quantity
        or gate_ins
        or pendency
    ]
    extracted_data_list = [
        {
            "sr_no": str(i),
            "line": str(line),
            "job_order_no": str(job_order_no),
            "vessel_name": str(vessel_name),
            "voyage_no": str(voyage_no),
            "quantity": quantity,
            "gate_ins": gate_ins,
            "pendency": pendency,
        }
        for i, (
            line,
            job_order_no,
            vessel_name,
            voyage_no,
            quantity,
            gate_ins,
            pendency,
        ) in enumerate(data, start=1)
    ]
    wb.close()
    return extracted_data_list


def extract_advance_list_data_for_enblock_pregate_in(file):
    wb = openpyxl.load_workbook(file, read_only=True)
    sheet = wb["enblock_pregatein"]
    (
        line_raw,
        container_no_raw,
        size_raw,
        type_raw,
        vessel_name_raw,
        voyage_no_raw,
        job_order_no_raw,
    ) = ([], [], [], [], [], [], [])
    for row in sheet.iter_rows():
        line_raw.append(row[0].value or "")
        container_no_raw.append(row[1].value or "")
        size_raw.append(row[2].value or "")
        type_raw.append(row[3].value or "")
        vessel_name_raw.append(row[4].value or "")
        voyage_no_raw.append(row[5].value or "")
        job_order_no_raw.append(row[6].value or "")

    headers = [
        line_raw.pop(0),
        container_no_raw.pop(0),
        size_raw.pop(0),
        type_raw.pop(0),
        vessel_name_raw.pop(0),
        voyage_no_raw.pop(0),
        job_order_no_raw.pop(0),
    ]
    if headers != [
        "LINE",
        "CONTAINER NO",
        "SIZE",
        "TYPE",
        "VESSEL NAME",
        "VOYAGE NO",
        "JOB ORDER NO",
    ]:
        return "Header not Found"
    data = [
        (line, container_no, size, type, vessel_name, voyage_no, job_order_no)
        for line, container_no, size, type, vessel_name, voyage_no, job_order_no in zip(
            line_raw,
            container_no_raw,
            size_raw,
            type_raw,
            vessel_name_raw,
            voyage_no_raw,
            job_order_no_raw,
        )
        if line
        or container_no
        or size
        or type
        or vessel_name
        or voyage_no
        or job_order_no
    ]
    extracted_data_list = [
        {
            "sr_no": str(i),
            "line": str(line),
            "container_no": str(container_no),
            "size": str(size),
            "type": str(type),
            "vessel_name": str(vessel_name),
            "voyage_no": str(voyage_no),
            "job_order_no": str(job_order_no),
        }
        for i, (
            line,
            container_no,
            size,
            type,
            vessel_name,
            voyage_no,
            job_order_no,
        ) in enumerate(data, start=1)
    ]
    wb.close()
    return extracted_data_list


def check_errors_in_advance_list(extracted_data_list, location, site):
    error_data_msg = {}
    correct_data = []
    error_data = []
    for each in extracted_data_list:
        error_msg = []
        line = each["line"]
        job_order_no = each["job_order_no"]
        vessel_name = each["vessel_name"]
        voyage_no = each["voyage_no"]
        quantity = each["quantity"]
        gate_ins = each["gate_ins"]
        pendency = each["pendency"]
        if not line:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in LINE column, "
                f"LINE is Mandatory"
            )
        elif not Client.objects.filter(
            location_id=location, site_id=site, name=line
        ).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in LINE column, "
                f"({line}) not found in system"
            )
        else:
            error_msg.append("")
        if not job_order_no:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in JOB ORDER NO column, "
                f"JOB ORDER NO is Mandatory"
            )
        else:
            error_msg.append("")

        if not vessel_name:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in VESSEL NAME column, "
                f"VESSEL NAME is Mandatory"
            )
        elif vessel_name != vessel_name.strip():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in VESSEL NAME column, "
                f"VESSEL NAME should not contain any space"
            )
        elif EnBlockMovement.objects.filter(
            location_id=location, site_id=site, vessel_no=vessel_name
        ).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in VESSEL NAME column, "
                f"({vessel_name}) already exists!"
            )
        else:
            error_msg.append("")

        if not voyage_no:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in VOYAGE NO column, "
                f"VOYAGE NO is Mandatory"
            )
        elif voyage_no != voyage_no.strip():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in VOYAGE NO column, "
                f"VOYAGE NO should not contain any space"
            )
        elif EnBlockMovement.objects.filter(
            location_id=location, site_id=site, voyage_no=voyage_no
        ).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in VOYAGE NO column, "
                f"({voyage_no}) already exists!"
            )
        else:
            error_msg.append("")

        if quantity > -1:
            error_msg.append("")
        else:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in QUANTITY column, "
                f"QUANTITY is Mandatory"
            )
        if gate_ins > -1:
            error_msg.append("")
        else:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in GATE IN column, "
                f"GATE IN is Mandatory"
            )
        if pendency > -1:
            error_msg.append("")
        else:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 1)} there is problem in PENDENCY column, "
                f"PENDENCY is Mandatory"
            )
        error_data_msg[f"row {str(int(each['sr_no']) + 1)}"] = error_msg
        if any(error_data_msg[f"row {str(int(each['sr_no']) + 1)}"]) is True:
            error_data.append(each)
        if not each in error_data:
            correct_data.append(each)
    return correct_data, error_data, error_data_msg


def check_errors_in_advance_list_for_enblock_pre_gatein(
    extracted_data_list, location, site
):

    error_data_msg = {}
    correct_data = []
    error_data = []

    container_counts = {}
    job_order_list = []
    vessel_name_list = []
    voyage_no_list = []
    lines = set()
    container_sizes = set()
    container_types = set()
    job_order_nos = set()

    for each in extracted_data_list:
        cn = each["container_no"]
        container_counts[cn] = container_counts.get(cn, 0) + 1

        lines.add(each["line"])
        container_types.add(each["type"])
        container_sizes.add(each["size"])
        job_order_nos.add(each["job_order_no"])
        job_order_list.append(each["job_order_no"])
        vessel_name_list.append(each["vessel_name"])
        voyage_no_list.append(each["voyage_no"])

    job_order_repeated = defaultdict(list)
    for jb, vs, vy in zip(job_order_list, vessel_name_list, voyage_no_list):
        job_order_repeated[jb].append((vs, vy))

    existing_clients = set(
        Client.objects.filter(
            name__in=lines, location_id=location, site_id=site
        ).values_list("name", flat=True)
    )
    existing_container_types = set(
        ContainerType.objects.filter(name__in=container_types).values_list(
            "name", flat=True
        )
    )
    existing_container_sizes = set(
        ContainerSize.objects.filter(name__in=container_sizes).values_list(
            "name", flat=True
        )
    )
    existing_job_orders = EnBlockMovement.objects.filter(
        job_order_no__in=job_order_nos, location_id=location, site_id=site
    ).values_list("job_order_no", "vessel_no", "voyage_no")

    job_order_vessel_voyage_map = {
        job[0]: (job[1], job[2]) for job in existing_job_orders
    }
    existing_containers = set(
        Container.objects.filter(
            container_no__in=container_counts.keys(),
            status="IN",
            location_id=location,
            site_id=site,
        ).values_list("container_no", flat=True)
    )

    for row_data in extracted_data_list:
        error_msg = []
        line = row_data["line"]
        container_no = row_data["container_no"]
        job_order_no = row_data["job_order_no"]
        container_size = row_data["size"]
        container_type = row_data["type"]
        vessel_name = row_data["vessel_name"].strip()
        voyage_no = row_data["voyage_no"].strip()

        # Line
        if not line:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in LINE column, "
                f"LINE is Mandatory"
            )

        elif line not in existing_clients:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in LINE column, "
                f"({line}) not found in system"
            )
        else:
            error_msg.append("")

        # container no
        if len(container_no) != 11 or not check_char_digit(container_no):

            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 2)} there is problem in CONTAINER NO column,"
                f"container_no is invalid"
            )

        elif container_counts[container_no] > 1:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 2)} there is problem in CONTAINER NO column, "
                f"container is repeated in your file"
            )
        elif container_no in existing_containers:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 2)} there is problem in CONTAINER NO column, "
                f"this container is already IN"
            )

        else:
            error_msg.append("")

        # size

        if not container_size:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in CONTAINER SIZE column, "
                f"CONTAINER SIZE is Mandatory"
            )

        elif container_size not in existing_container_sizes:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in CONTAINER SIZE column, "
                f"{container_size} does not exists"
            )

        else:
            error_msg.append("")

        # type

        if not container_type:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in CONTAINER TYPE column, "
                f"CONTAINER TYPE is Mandatory"
            )
        elif container_type not in existing_container_types:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in CONTAINER TYPE column, "
                f"{container_type} does not exists"
            )
        else:
            error_msg.append("")

        # job order no

        if not job_order_no:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in JOB ORDER NO column, "
                f"JOB ORDER NO is Mandatory"
            )
        elif job_order_no in job_order_vessel_voyage_map:
            existing_vessel, existing_voyage = job_order_vessel_voyage_map[job_order_no]
            if existing_vessel != vessel_name or existing_voyage != voyage_no:
                error_msg.append(
                    f"In row {str(int(row_data['sr_no']) + 1)} there is problem in JOB ORDER NO column, "
                    f"JOB ORDER NO :{job_order_no} already exsits"
                )
        elif (
            job_order_no in job_order_repeated
            and len(job_order_repeated[job_order_no]) > 1
            and not all(
                job_order_repeated[job_order_no][0] == item
                for item in job_order_repeated[job_order_no]
            )
        ):
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in JOB ORDER NO column, "
                f"JOB ORDER NO {job_order_no} is Repeated"
            )

        else:
            error_msg.append("")

        # vessel name
        if not vessel_name:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in VESSEL NAME column, "
                f"VESSEL NAME is Mandatory"
            )
        elif vessel_name != vessel_name.strip():
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in VESSEL NAME column, "
                f"VESSEL NAME should not contain any space"
            )
        else:
            error_msg.append("")

        # voyage no
        if not voyage_no:
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in VOYAGE NO column, "
                f"VOYAGE NO is Mandatory"
            )
        elif voyage_no != voyage_no.strip():
            error_msg.append(
                f"In row {str(int(row_data['sr_no']) + 1)} there is problem in VOYAGE NO column, "
                f"VOYAGE NO should not contain any space"
            )
        else:
            error_msg.append("")

        error_data_msg[f"row {str(int(row_data['sr_no']) + 1)}"] = error_msg
        if any(error_data_msg[f"row {str(int(row_data['sr_no']) + 1)}"]) is True:
            error_data.append(row_data)
        if not row_data in error_data:
            correct_data.append(row_data)

    return correct_data, error_data, error_data_msg


def extract_advance_list_data_for_rejected_file(data):
    en_block_df = pd.DataFrame(data)[
        [
            "line",
            "job_order_no",
            "vessel_name",
            "voyage_no",
            "quantity",
            "gate_ins",
            "pendency",
        ]
    ]
    en_block_df.columns = [
        "LINE",
        "JOB ORDER NO",
        "VESSEL NAME",
        "VOYAGE NO",
        "QUANTITY",
        "GATE IN",
        "PENDENCY",
    ]
    return en_block_df


def extract_advance_list_data_for_rejected_file_for_pregate_in(data):
    en_block_df = pd.DataFrame(data)[
        [
            "line",
            "container_no",
            "size",
            "type",
            "job_order_no",
            "vessel_name",
            "voyage_no",
        ]
    ]
    en_block_df.columns = [
        "LINE",
        "CONTAINER NO",
        "SIZE",
        "TYPE",
        "JOB ORDER NO",
        "VESSEL NAME",
        "VOYAGE NO",
    ]
    return en_block_df


def transform_data(item):
    i, each = item
    return [
        i + 1,
        each.get("vehicle_no", ""),
        each.get("container__container_no", ""),
        each.get("container__size__name", ""),
        each.get("container__type__name"),
        each.get("in_date", "").strftime("%d/%m/%Y"),
        each.get("container__client__ref_code", ""),
        each.get("transporter_name__name", ""),
        each.get("bl_no", ""),
        f"{each.get('vessel_name','')} – {each.get('voyage_no', '')}",
    ]


def get_enblock_df(job_order_no, location, site):
    gate_in_qs = GateIn.objects.filter(
        bl_no=job_order_no, container__location_id=location, container__site_id=site
    )
    gate_in_data_objs = gate_in_qs.values(
        "vehicle_no",
        "container__container_no",
        "container__size__name",
        "container__type__name",
        "in_date",
        "container__client__name",
        "transporter_name__name",
        "bl_no",
        "vessel_name",
        "voyage_no",
    )
    # En block Summary data df
    en_block_df_data = list(map(transform_data, enumerate(gate_in_data_objs, start=0)))

    enblock_object = EnBlockMovement.objects.get(
        job_order_no=job_order_no, location_id=location, site_id=site
    )
    enblock_summary_df_data = [
        [
            enblock_object.line,
            enblock_object.job_order_no,
            enblock_object.vessel_no,
            enblock_object.voyage_no,
            enblock_object.quantity,
            enblock_object.gate_ins,
            enblock_object.pendency,
        ]
    ]

    # Aggregating transporter count which is listed under en block for en block summary df
    transporter_list = Transporter.objects.filter(
        enblock_transporter=True, location_id=location, site_id=site
    ).values_list("name", flat=True)
    aggregate_data_of_transporter = (
        gate_in_qs.annotate(
            transporter_category=Case(
                *[
                    When(transporter_name__name=transporter, then=Value(transporter))
                    for transporter in transporter_list
                ],
                default=Value("Other"),
                output_field=CharField(),
            )
        )
        .values("transporter_category")
        .annotate(transporter_count=Count("transporter_name"))
        .order_by(
            Case(
                When(transporter_category="Other", then=1),
                default=0,
                output_field=IntegerField(),
            ),
            "transporter_category",
        )
    )

    # Header of Transporter
    headers = list(
        map(lambda x: x["transporter_category"], aggregate_data_of_transporter)
    )

    # Transporter count for each transporter
    transporter_count = list(
        map(lambda x: x["transporter_count"], aggregate_data_of_transporter)
    )

    # Appending 0 for transporters which are not present in the gate in data
    transporter_count += [0] * sum(not each in headers for each in transporter_list)

    # Appending transporter name which are not present in the gate in data
    headers.extend(filter(lambda item: item not in headers, map(str, transporter_list)))
    # Adding total arrival count at the end of the list
    total_count = sum(transporter_count)
    # Adding total arrival count at the end of the list to headers
    headers.append("Total Arrival")
    # Adding total arrival count to transporter_count
    transporter_count.append(total_count)
    # Adding total arrival count to enblock_summary_df_data
    enblock_summary_df_data[0].extend(transporter_count)

    return en_block_df_data, enblock_summary_df_data, headers


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


def create_en_block_movement_report(
    location,
    site,
    en_block_df_data,
    enblock_summary_df_data,
    headers,
):
    site_obj = Site.objects.get(pk=site)
    location_obj = Location.objects.get(pk=location)
    if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
        os.makedirs(os.path.join(BASE_DIR, "temp/"))
    dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
    date = dt.date().strftime("%Y-%m-%d")
    temp_file_path = os.path.join(BASE_DIR, f"temp/msc_mundra_daily_report_{date}.xlsx")
    enblock_workbook = xlsxwriter.Workbook(temp_file_path)
    enblock_sheet = enblock_workbook.add_worksheet("en_block")
    en_block_merge_format = get_merge_format(enblock_workbook)
    en_block_merge_format2 = get_merge_format2(enblock_workbook)
    en_block_merge_format3 = get_merge_format3(enblock_workbook)
    enblock_sheet.merge_range(
        "A1:U2", site_obj.organization.upper(), en_block_merge_format
    )
    enblock_sheet.merge_range("A3:U3", site_obj.address, en_block_merge_format2)
    enblock_sheet.merge_range(
        "A4:U4", "REPORT NAME : EN BLOCK MOVEMENT REPORT", en_block_merge_format3
    )
    enblock_sheet.merge_range("A5:U5", None, en_block_merge_format3)
    enblock_sheet.merge_range("A6:U6", f"SHIPPING LINE : MSC", en_block_merge_format3)
    enblock_sheet.merge_range("A7:U7", None, en_block_merge_format3)
    enblock_sheet.merge_range(
        "A8:U8",
        f"LOCATION : {location_obj.name} , DEPOT NAME: {site_obj.name}",
        en_block_merge_format3,
    )
    separator_format = enblock_workbook.add_format(
        {
            "bg_color": "#000000",
        }
    )
    summary_data_headers = [
        "Line",
        "Job Order No",
        "Vessel Name",
        "Voyage No",
        "Quantity",
        "Gate In",
        "Pendency",
    ]
    summary_data_headers.extend(headers)
    end_column_of_summary_data = chr(64 + len(summary_data_headers))
    # Summary Data Table
    enblock_sheet.add_table(
        f"A10:{end_column_of_summary_data}{10 + len(enblock_summary_df_data)}",
        {
            "data": enblock_summary_df_data,
            "columns": [{"header": header} for header in summary_data_headers],
        },
    )

    enblock_sheet.merge_range(f"A13:Z13", None, separator_format)
    # Comprehensive Data Table
    enblock_sheet.add_table(
        f"A15:J{15 + len(en_block_df_data)}",
        {
            "data": en_block_df_data,
            "columns": [
                {"header": "Sr No"},
                {"header": "Vehicle No"},
                {"header": "Container No"},
                {"header": "Size"},
                {"header": "Type"},
                {"header": "Gate In Date"},
                {"header": "Line"},
                {"header": "Transporter"},
                {"header": "Job Order No"},
                {"header": "Vessel Voyage"},
            ],
        },
    )
    enblock_workbook.close()
    return temp_file_path


def change_status_of_truck(
    container_no,
    transporter_name,
    location,
    site,
    vehicle_no,
    movement,
    booking_no=None,
    line=None,
):
    tz = timezone.get_current_timezone()
    current_date_time = datetime.datetime.now().astimezone(tz)
    if movement == "OUT":
        truck_qs = TruckTracking.objects.filter(
            transporter=transporter_name,
            location=location,
            site=site,
            status="IN QUEUE",
            move_mode__in=["EXPORT", "RE-EXPORT"],
            vehicle_no=vehicle_no,
        )
        if truck_qs.exists():
            truck_obj = truck_qs.first()
            truck_obj.status = "OUT"
            truck_obj.gate_out_time = current_date_time
            truck_obj.time_since = current_date_time - truck_obj.gate_in_time
            truck_obj.container_no = container_no
            truck_obj.booking_no = booking_no
            truck_obj.line = line
            truck_obj.save(
                update_fields=[
                    "status",
                    "gate_out_time",
                    "time_since",
                    "container_no",
                    "booking_no",
                    "line",
                ]
            )

        pass
    else:
        truck_qs = TruckTracking.objects.filter(
            container_no=container_no,
            transporter=transporter_name,
            location=location,
            site=site,
            status="IN QUEUE",
            move_mode="IMPORT",
            vehicle_no=vehicle_no,
        )
        if truck_qs.exists():
            truck_obj = truck_qs.first()
            truck_obj.status = "OUT"
            truck_obj.gate_out_time = current_date_time
            truck_obj.time_since = current_date_time - truck_obj.gate_in_time
            truck_obj.save(update_fields=["status", "gate_out_time", "time_since"])


def en_block_pregate_in_summary_report(
    enblock_workbook, site_obj, location_obj, headers, enblock_summary_df_data
):
    summary_sheet = enblock_workbook.add_worksheet("summary")
    en_block_merge_format = get_merge_format(enblock_workbook)
    en_block_merge_format2 = get_merge_format2(enblock_workbook)
    en_block_merge_format3 = get_merge_format3(enblock_workbook)
    summary_sheet.merge_range(
        "A1:U2", site_obj.organization.upper(), en_block_merge_format
    )
    summary_sheet.merge_range("A3:U3", site_obj.address, en_block_merge_format2)
    summary_sheet.merge_range(
        "A4:U4", "REPORT NAME : EN BLOCK PREGATE IN SUMMARY", en_block_merge_format3
    )
    summary_sheet.merge_range("A5:U5", None, en_block_merge_format3)
    summary_sheet.merge_range(
        "A6:U6",
        f"LOCATION : {location_obj.name} , DEPOT NAME: {site_obj.name}",
        en_block_merge_format3,
    )
    # separator_format = enblock_workbook.add_format(
    #     {
    #         "bg_color": "#000000",
    #     }
    # )
    summary_data_headers = [
        "Line",
        "Job Order No",
        "Vessel Name",
        "Voyage No",
        "Quantity",
        "Gate In",
        "Pendency",
    ]
    summary_data_headers.extend(headers)
    end_column_of_summary_data = chr(64 + len(summary_data_headers))
    # Summary Data Table
    summary_sheet.add_table(
        f"A10:{end_column_of_summary_data}{10 + len(enblock_summary_df_data)}",
        {
            "data": enblock_summary_df_data,
            "columns": [{"header": header} for header in summary_data_headers],
        },
    )


def en_block_pregate_in_pendency_report(
    enblock_workbook, site_obj, location_obj, pendency_df_data
):
    pendency_sheet = enblock_workbook.add_worksheet("pendency")
    en_block_merge_format = get_merge_format(enblock_workbook)
    en_block_merge_format2 = get_merge_format2(enblock_workbook)
    en_block_merge_format3 = get_merge_format3(enblock_workbook)
    pendency_sheet.merge_range(
        "A1:U2", site_obj.organization.upper(), en_block_merge_format
    )
    pendency_sheet.merge_range("A3:U3", site_obj.address, en_block_merge_format2)
    pendency_sheet.merge_range(
        "A4:U4",
        "REPORT NAME : EN BLOCK PREGATE IN PENDENCY REPORT",
        en_block_merge_format3,
    )
    pendency_sheet.merge_range("A5:U5", None, en_block_merge_format3)
    pendency_sheet.merge_range(
        "A6:U6",
        f"LOCATION : {location_obj.name} , DEPOT NAME: {site_obj.name}",
        en_block_merge_format3,
    )
    pendency_sheet.add_table(
        f"A9:F{9 + len(pendency_df_data)}",
        {
            "data": pendency_df_data,
            "columns": [
                {"header": "Sr No"},
                {"header": "Client"},
                {"header": "Container No"},
                {"header": "Size"},
                {"header": "Type"},
                {"header": "Vessel Voyage"},
                {"header": "Job Order No"},
            ],
        },
    )


def en_block_pregate_in_processed_report(
    enblock_workbook, site_obj, location_obj, en_block_df_data
):
    processed_sheet = enblock_workbook.add_worksheet("processed")
    en_block_merge_format = get_merge_format(enblock_workbook)
    en_block_merge_format2 = get_merge_format2(enblock_workbook)
    en_block_merge_format3 = get_merge_format3(enblock_workbook)
    processed_sheet.merge_range(
        "A1:U2", site_obj.organization.upper(), en_block_merge_format
    )
    processed_sheet.merge_range("A3:U3", site_obj.address, en_block_merge_format2)
    processed_sheet.merge_range(
        "A4:U4",
        "REPORT NAME : EN BLOCK PREGATE IN PROCESSED REPORT",
        en_block_merge_format3,
    )
    processed_sheet.merge_range("A5:U5", None, en_block_merge_format3)
    processed_sheet.merge_range(
        "A6:U6",
        f"LOCATION : {location_obj.name} , DEPOT NAME: {site_obj.name}",
        en_block_merge_format3,
    )

    processed_sheet.add_table(
        f"A9:J{9 + len(en_block_df_data)}",
        {
            "data": en_block_df_data,
            "columns": [
                {"header": "Sr No"},
                {"header": "Vehicle No"},
                {"header": "Container No"},
                {"header": "Size"},
                {"header": "Type"},
                {"header": "Gate In Date"},
                {"header": "Client"},
                {"header": "Transporter"},
                {"header": "Job Order No"},
                {"header": "Vessel Voyage"},
            ],
        },
    )


def en_block_pragate_in_discarded_report(
    enblock_workbook, site_obj, location_obj, discarded_df_data
):
    discarded_sheet = enblock_workbook.add_worksheet("discarded")
    en_block_merge_format = get_merge_format(enblock_workbook)
    en_block_merge_format2 = get_merge_format2(enblock_workbook)
    en_block_merge_format3 = get_merge_format3(enblock_workbook)
    discarded_sheet.merge_range(
        "A1:U2", site_obj.organization.upper(), en_block_merge_format
    )
    discarded_sheet.merge_range("A3:U3", site_obj.address, en_block_merge_format2)
    discarded_sheet.merge_range(
        "A4:U4",
        "REPORT NAME : EN BLOCK PREGATE IN DISCARDED REPORT",
        en_block_merge_format3,
    )
    discarded_sheet.merge_range("A5:U5", None, en_block_merge_format3)
    discarded_sheet.merge_range(
        "A6:U6",
        f"LOCATION : {location_obj.name} , DEPOT NAME: {site_obj.name}",
        en_block_merge_format3,
    )
    discarded_sheet.add_table(
        f"A9:F{9 + len(discarded_df_data)}",
        {
            "data": discarded_df_data,
            "columns": [
                {"header": "Sr No"},
                {"header": "Client"},
                {"header": "Container No"},
                {"header": "Size"},
                {"header": "Type"},
                {"header": "Vessel Voyage"},
                {"header": "Job Order No"},
            ],
        },
    )


def create_en_block_pregatein_report(
    location,
    site,
    en_block_df_data,
    enblock_summary_df_data,
    headers,
    pendency_df_data,
    discarded_df_data,
):
    site_obj = Site.objects.get(pk=site)
    location_obj = Location.objects.get(pk=location)
    if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
        os.makedirs(os.path.join(BASE_DIR, "temp/"))
    dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
    date = dt.date().strftime("%Y-%m-%d")
    temp_file_path = os.path.join(
        BASE_DIR, f"temp/en_block_pregatein_report_{date}.xlsx"
    )
    enblock_workbook = xlsxwriter.Workbook(temp_file_path)

    # enblock_sheet.merge_range(f"A13:Z13", None, separator_format)
    en_block_pregate_in_summary_report(
        enblock_workbook, site_obj, location_obj, headers, enblock_summary_df_data
    )
    # Pendency Table
    en_block_pregate_in_pendency_report(
        enblock_workbook, site_obj, location_obj, pendency_df_data
    )

    # Processed data table
    en_block_pregate_in_processed_report(
        enblock_workbook, site_obj, location_obj, en_block_df_data
    )
    # Discarded Table
    en_block_pragate_in_discarded_report(
        enblock_workbook, site_obj, location_obj, discarded_df_data
    )

    enblock_workbook.close()
    return temp_file_path


def en_block_pregatein_df_data(queryset):
    df_data = [
        [
            i + 1,
            each.line,
            each.container_no,
            each.size,
            each.type,
            each.en_block.vessel_no,
            each.en_block.voyage_no,
            each.en_block.job_order_no,
        ]
        for i, each in enumerate(queryset)
    ] or [[""] * 8]

    return df_data


def get_pendency_df_data(job_order_no, location, site):
    pendency_objects = EnBlockPreGateIn.objects.select_related("en_block").filter(
        en_block__job_order_no=job_order_no,
        en_block__location_id=location,
        en_block__site_id=site,
        is_processed=False,
        is_discarded=False,
    )

    pendency_df_data = [
        [
            index,
            pendency.line,
            pendency.container_no,
            pendency.size,
            pendency.type,
            pendency.en_block.vessel_no + "-" + pendency.en_block.voyage_no,
            pendency.en_block.job_order_no,
        ]
        for index, pendency in enumerate(pendency_objects, start=1)
    ]
    return pendency_df_data


def get_discarded_df_data(job_order_no, location, site):
    discarded_objects = EnBlockPreGateIn.objects.select_related("en_block").filter(
        en_block__job_order_no=job_order_no,
        en_block__location_id=location,
        en_block__site_id=site,
        is_discarded=True,
    )

    discarded_df_data = [
        [
            index,
            discarded.line,
            discarded.container_no,
            discarded.size,
            discarded.type,
            discarded.en_block.vessel_no + "-" + discarded.en_block.voyage_no,
            discarded.en_block.job_order_no,
        ]
        for index, discarded in enumerate(discarded_objects, start=1)
    ]
    return discarded_df_data
