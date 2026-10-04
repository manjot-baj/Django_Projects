from .models import *
from .models_two import *
from decouple import config
from SNP_DMS.settings.base import BASE_DIR
import os
from django.http import HttpResponse
from datetime import timedelta
from common.functions import upload_file, download_file, delete_file
import datetime, openpyxl
from master.models_two import Client, ClientAbbreviation, SealNo
from .models import *
from depot.models import ContainerStock, GateOut
import traceback, logging
from django.core.paginator import Paginator

AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME")


def none_data_converter(dict_data):
    try:
        for key in dict_data:
            if dict_data[key] == "":
                dict_data[key] = None
        return dict_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_date_range(start_date, end_date):
    try:
        date_range = []
        delta = end_date - start_date
        for i in range(delta.days + 1):
            day = start_date + timedelta(days=i)
            date_range.append(day)
        return date_range
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def location_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            location = Location.objects.get(name=name)
            data = [each for each in data_list if each.location == location]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def site_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            site = Site.objects.get(name=name)
            data = [each for each in data_list if each.site == site]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def client_location_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            location = Location.objects.get(name=name)
            data = [each for each in data_list if each.client.location == location]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def client_site_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            site = Site.objects.get(name=name)
            data = [each for each in data_list if each.client.site == site]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def name_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.name == name]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def client_name_filter(client_name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.client.name == client_name]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def client_ref_code_filter(ref_code, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.client_ref_code == ref_code]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def code_filter(code, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.code == code]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def ref_code_filter(ref_code, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.ref_code == ref_code]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def vessel_bkgno_number_filter(number, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.number == number]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def date_filter(from_date, to_date, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            date_range = get_date_range(start_date=from_date, end_date=to_date)
            data = [
                each_data
                for each_data in data_list
                for each_date in date_range
                if each_data.date == each_date
            ]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def vessel_bkgno_filter(bkgno, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.bkg.number == bkgno]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def vessel_name_filter(vessel_name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.vessel_name == vessel_name]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def voyage_no_filter(voyage_no, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.voyage_no == voyage_no]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def vessel_voyage_filter(vessel_voyage, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.vessel_voyage == vessel_voyage]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def vessel_location_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            location = Location.objects.get(name=name)
            data = [each for each in data_list if each.location == location]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def vessel_site_filter(name, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            site = Site.objects.get(name=name)
            data = [each for each in data_list if each.site == site]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def type_filter(type, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.type == type]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def name_code_filter(name_code, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.name_code == name_code]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def upload_client_doc_to_s3(location, site, client_name, doc_id, file):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        object_name = f"Client_Documents/{location}/{site}/{client_name}/{doc_id}/{client_name}_{doc_id}_{file}"
        document_object = ClientDocument.objects.get(pk=doc_id)
        if (
            document_object.document_s3_object_name is not None
            and len(document_object.document_s3_object_name) != 0
        ):
            delete_file(
                bucket=bucket_name,
                object_name=document_object.document_s3_object_name,
            )
        try:
            if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/"))
            temp_file_path = os.path.join(BASE_DIR, f"temp/{file}")
            with open(temp_file_path, "wb") as temp:
                temp.write(file.read())
            upload_file(temp_file_path, bucket_name, object_name)
            document_object.document_s3_object_name = object_name
            document_object.document_s3_file_name = (
                f"{client_name}_{doc_id}_{file.name}"
            )
            document_object.save()
            os.remove(temp_file_path)
            return True
        except Exception as e:
            os.remove(temp_file_path)
            return False
    except Exception as e:
        return False


def download_client_doc_from_s3(doc_id):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        document_object = ClientDocument.objects.get(pk=doc_id)
        object_name = document_object.document_s3_object_name
        file_name = document_object.document_s3_file_name
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


def delete_client_doc_from_s3(doc_id):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        document_object = ClientDocument.objects.get(pk=doc_id)
        object_name = document_object.document_s3_object_name
        delete_file(bucket=bucket_name, object_name=object_name)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def extract_excel_data(input_excel):
    try:
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["seal_number"]
        seal_no_raw = [
            sheet["A" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        seal_box_number_raw = [
            sheet["B" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        line_raw = [sheet["C" + str(row)].value for row in range(1, sheet.max_row + 1)]
        in_date_raw = [
            sheet["D" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        in_time_raw = [
            sheet["E" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]

        seal_no = [each for each in seal_no_raw if not each is None]
        seal_box_number = [each for each in seal_box_number_raw if not each is None]
        line = [each for each in line_raw if not each is None]
        in_date = [each for each in in_date_raw if not each is None]
        in_time = [each for each in in_time_raw if not each is None]

        popped = [
            seal_no.pop(0),
            seal_box_number.pop(0),
            line.pop(0),
            in_date.pop(0),
            in_time.pop(0),
        ]

        headers = [
            "Number",
            "Seal Box Number",
            "Line",
            "In Date",
            "In Time",
        ]

        if not popped == headers:
            return "Header Not Found"

        extracted_data_list = []
        for i in range(len(seal_no)):
            extracted_data_list.append(
                {
                    "sr_no": str(i),
                    "number": str(seal_no[i]),
                    "seal_box_number": str(seal_box_number[i]),
                    "line": str(line[i]),
                    "in_date": str(in_date[i]),
                    "in_time": str(in_time[i]),
                }
            )
        ps.close()

        error_data = []
        error_data_msg = {}
        correct_data = []
        for each in extracted_data_list:
            error_msg = []

            seal_no_str = each["number"]
            try:
                for obj_data in correct_data:
                    if seal_no_str == obj_data["number"]:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in seal_no column, "
                            f"this seal number is repeated in your file"
                        )
                    else:
                        pass
            except:
                pass

            try:
                if (
                    SealNo.objects.filter(number=seal_no_str).exists()
                    or ContainerStock.objects.filter(seal_no=seal_no_str).exists()
                    or GateOut.objects.filter(seal_no=seal_no_str).exists()
                ):
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in number column, "
                        f"this seal number is already exists"
                    )
            except:
                error_msg.append("")

            seal_box_number_str = each["seal_box_number"]
            try:
                if (
                    seal_box_number_str == "_"
                    or seal_box_number_str == ""
                    or seal_box_number_str is None
                ):
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in seal_box_number column, "
                        f"this field is mandatory"
                    )
                else:
                    error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in seal_box_number column, "
                    f"this field is mandatory"
                )

            line_str = each["line"]
            try:
                if Client.objects.filter(ref_code=line_str).exists():
                    error_msg.append("")
                else:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in line column, "
                        f"Line not found in system database"
                    )
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in line column, "
                    f"Line not found in system database"
                )

            in_date_str = each["in_date"]
            try:
                datetime.datetime.strptime(in_date_str, "%Y_%m_%d").date()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_date column,"
                    f"date is not in yyyy_mm_dd format"
                )

            in_time_str = each["in_time"]
            try:
                datetime.datetime.strptime(in_time_str, "%H_%M").time()
                error_msg.append("")
            except:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in in_time column,"
                    f"time not in H_M format"
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


def pagination_func(filtered_data, on_page_data, pg_no):
    paginator = Paginator(filtered_data, on_page_data)
    no_of_data_count = paginator.count
    no_of_pages = paginator.num_pages
    current_page = paginator.page(pg_no)
    on_page_data_count = current_page.end_index() - current_page.start_index() + 1
    prev_page = (
        current_page.previous_page_number() if current_page.has_previous() else ""
    )
    next_page = current_page.next_page_number() if current_page.has_next() else ""

    return (
        no_of_data_count,
        on_page_data_count,
        no_of_pages,
        prev_page,
        next_page,
        current_page,
    )


def none_to_empty_str(self, items):
    return {key: value if value is not None else "" for key, value in items.items()}
