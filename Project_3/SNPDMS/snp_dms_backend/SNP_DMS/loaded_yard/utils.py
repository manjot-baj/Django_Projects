from master.models import Location, Site
import openpyxl, os
from datetime import datetime
import traceback, logging
from SNP_DMS.settings.base import BASE_DIR
from django.http import HttpResponse
import pandas as pd


def get_location_site(location_name, site_name):
    location = Location.objects.get(name=location_name)
    site = Site.objects.get(name=site_name)
    return location, site


def get_date_obj(date_str):
    if date_str:
        date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
    else:
        date = None
    return date


def extract_data_list(input_excel):
    ps = openpyxl.load_workbook(input_excel)
    sheet = ps["loaded_yard"]
    container_no_raw = []
    size_raw = []
    port_raw = []
    liner_raw = []
    inward_rake_raw = []
    outward_rake_raw = []
    iit_date_raw = []
    iit_time_raw = []
    dvan_date_raw = []
    dvan_time_raw = []
    mtin_date_raw = []
    mtin_time_raw = []
    van_date_raw = []
    van_time_raw = []
    booking_no_raw = []
    seal_no_raw = []
    mir_date_raw = []
    mir_time_raw = []
    mot_date_raw = []
    mot_time_raw = []
    mit_date_raw = []
    mit_time_raw = []
    mor_date_raw = []
    mor_time_raw = []
    expin_date_raw = []
    expin_time_raw = []
    eot_date_raw = []
    eot_time_raw = []
    report_raw = []
    remarks_raw = []

    for row in sheet.iter_rows():
        container_no_raw.append(row[0].value if row[0].value is not None else "")
        size_raw.append(row[1].value if row[1].value is not None else "")
        port_raw.append(row[2].value if row[2].value is not None else "")
        liner_raw.append(row[3].value if row[3].value is not None else "")
        inward_rake_raw.append(row[4].value if row[4].value is not None else "")
        outward_rake_raw.append(row[5].value if row[5].value is not None else "")
        iit_date_raw.append(row[6].value if row[6].value is not None else "")
        iit_time_raw.append(row[7].value if row[7].value is not None else "")
        dvan_date_raw.append(row[8].value if row[8].value is not None else "")
        dvan_time_raw.append(row[9].value if row[9].value is not None else "")
        mtin_date_raw.append(row[10].value if row[10].value is not None else "")
        mtin_time_raw.append(row[11].value if row[11].value is not None else "")
        van_date_raw.append(row[12].value if row[12].value is not None else "")
        van_time_raw.append(row[13].value if row[13].value is not None else "")
        booking_no_raw.append(row[14].value if row[14].value is not None else "")
        seal_no_raw.append(row[15].value if row[15].value is not None else "")
        mir_date_raw.append(row[16].value if row[16].value is not None else "")
        mir_time_raw.append(row[17].value if row[17].value is not None else "")
        mot_date_raw.append(row[18].value if row[18].value is not None else "")
        mot_time_raw.append(row[19].value if row[19].value is not None else "")
        mit_date_raw.append(row[20].value if row[20].value is not None else "")
        mit_time_raw.append(row[21].value if row[21].value is not None else "")
        mor_date_raw.append(row[22].value if row[22].value is not None else "")
        mor_time_raw.append(row[23].value if row[23].value is not None else "")
        expin_date_raw.append(row[24].value if row[24].value is not None else "")
        expin_time_raw.append(row[25].value if row[25].value is not None else "")
        eot_date_raw.append(row[26].value if row[26].value is not None else "")
        eot_time_raw.append(row[27].value if row[27].value is not None else "")
        report_raw.append(row[28].value if row[28].value is not None else "")
        remarks_raw.append(row[29].value if row[29].value is not None else "")

    headers = [
        container_no_raw.pop(0),
        size_raw.pop(0),
        port_raw.pop(0),
        liner_raw.pop(0),
        inward_rake_raw.pop(0),
        outward_rake_raw.pop(0),
        iit_date_raw.pop(0),
        iit_time_raw.pop(0),
        dvan_date_raw.pop(0),
        dvan_time_raw.pop(0),
        mtin_date_raw.pop(0),
        mtin_time_raw.pop(0),
        van_date_raw.pop(0),
        van_time_raw.pop(0),
        booking_no_raw.pop(0),
        seal_no_raw.pop(0),
        mir_date_raw.pop(0),
        mir_time_raw.pop(0),
        mot_date_raw.pop(0),
        mot_time_raw.pop(0),
        mit_date_raw.pop(0),
        mit_time_raw.pop(0),
        mor_date_raw.pop(0),
        mor_time_raw.pop(0),
        expin_date_raw.pop(0),
        expin_time_raw.pop(0),
        eot_date_raw.pop(0),
        eot_time_raw.pop(0),
        report_raw.pop(0),
        remarks_raw.pop(0),
    ]
    if headers != [
        "CONTAINER",
        "SIZE",
        "PORT",
        "LINER/MERCHANT",
        "INWARD RAKE",
        "OUTWARD RAKE",
        "IIT",
        "IIT TIME",
        "DVAN",
        "DVAN TIME",
        "MTIN",
        "MTIN TIME",
        "VAN",
        "VAN TIME",
        "BOOKING NO",
        "SEAL NO",
        "MIR",
        "MIR TIME",
        "MOT",
        "MOT TIME",
        "MIT",
        "MIT TIME",
        "MOR",
        "MOR TIME",
        "EXPIN",
        "EXPIN TIME",
        "EOT",
        "EOT TIME",
        "REPORT",
        "REMARKS",
    ]:
        return "Header Not Found"

    data = [
        (
            container_no,
            size,
            port,
            liner,
            inward_rake,
            outward_rake,
            iit_date,
            iit_time.strftime("%H:%M:%S") if iit_time else "",
            dvan_date,
            dvan_time.strftime("%H:%M:%S") if dvan_time else "",
            mtin_date,
            mtin_time.strftime("%H:%M:%S") if mtin_time else "",
            van_date,
            van_time.strftime("%H:%M:%S") if van_date else "",
            booking_no,
            seal_no,
            mir_date,
            mir_time.strftime("%H:%M:%S") if mir_time else "",
            mot_date,
            mot_time.strftime("%H:%M:%S") if mot_time else "",
            mit_date,
            mit_time.strftime("%H:%M:%S") if mit_time else "",
            mor_date,
            mor_time.strftime("%H:%M:%S") if mor_time else "",
            expin_date,
            expin_time.strftime("%H:%M:%S") if expin_time else "",
            eot_date,
            eot_time.strftime("%H:%M:%S") if eot_time else "",
            report,
            remarks,
        )
        for container_no, size, port, liner, inward_rake, outward_rake, iit_date, iit_time, dvan_date, dvan_time, mtin_date, mtin_time, van_date, van_time, booking_no, seal_no, mir_date, mir_time, mot_date, mot_time, mit_date, mit_time, mor_date, mor_time, expin_date, expin_time, eot_date, eot_time, report, remarks in zip(
            container_no_raw,
            size_raw,
            port_raw,
            liner_raw,
            inward_rake_raw,
            outward_rake_raw,
            iit_date_raw,
            iit_time_raw,
            dvan_date_raw,
            dvan_time_raw,
            mtin_date_raw,
            mtin_time_raw,
            van_date_raw,
            van_time_raw,
            booking_no_raw,
            seal_no_raw,
            mir_date_raw,
            mir_time_raw,
            mot_date_raw,
            mot_time_raw,
            mit_date_raw,
            mit_time_raw,
            mor_date_raw,
            mor_time_raw,
            expin_date_raw,
            expin_time_raw,
            eot_date_raw,
            eot_time_raw,
            report_raw,
            remarks_raw,
        )
        if container_no != ""
    ]

    extracted_data_list = [
        {
            "sr_no": str(i),
            "container_no": str(container_no),
            "size": str(size),
            "port": str(port),
            "liner": str(liner),
            "inward_rake": str(inward_rake),
            "outward_rake": str(outward_rake),
            "iit_date": str(iit_date),
            "iit_time": str(iit_time),
            "dvan_date": str(dvan_date),
            "dvan_time": str(dvan_time),
            "mtin_date": str(mtin_date),
            "mtin_time": str(mtin_time),
            "van_date": str(van_date),
            "van_time": str(van_time),
            "booking_no": str(booking_no),
            "seal_no": str(seal_no),
            "mir_date": str(mir_date),
            "mir_time": str(mir_time),
            "mot_date": str(mot_date),
            "mot_time": str(mot_time),
            "mit_date": str(mit_date),
            "mit_time": str(mit_time),
            "mor_date": str(mor_date),
            "mor_time": str(mor_time),
            "expin_date": str(expin_date),
            "expin_time": str(expin_time),
            "eot_date": str(eot_date),
            "eot_time": str(eot_time),
            "report": str(report),
            "remarks": str(remarks),
        }
        for i, (
            container_no,
            size,
            port,
            liner,
            inward_rake,
            outward_rake,
            iit_date,
            iit_time,
            dvan_date,
            dvan_time,
            mtin_date,
            mtin_time,
            van_date,
            van_time,
            booking_no,
            seal_no,
            mir_date,
            mir_time,
            mot_date,
            mot_time,
            mit_date,
            mit_time,
            mor_date,
            mor_time,
            expin_date,
            expin_time,
            eot_date,
            eot_time,
            report,
            remarks,
        ) in enumerate(data, start=1)
    ]

    ps.close()

    return extracted_data_list


def collect_main_data(correct_data, error_data, error_data_msg):
    correct_data_count = str(len(correct_data))
    error_data_count = str(len(error_data))
    return {
        "importable_data": correct_data,
        "importable_data_count": correct_data_count,
        "rejected_data": error_data,
        "rejected_data_count": error_data_count,
        "faults": error_data_msg,
    }


def make_loaded_yard_edi_file(edi_content):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/loaded_yard_edi/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/loaded_yard_edi/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/loaded_yard_edi/loaded_yard.edi")

        with open(temp_file_path, "w") as temp:
            temp.write(edi_content)

        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def download_loaded_yard_edi(temp_file_path):
    try:
        current_date_time = datetime.now()
        current_date_time_str = current_date_time.strftime("%Y-%m-%d %H:%M:%S")
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/edi")
            file_response["Content-Disposition"] = (
                f'attachment; filename="{current_date_time_str}_loaded_yard.edi"'
            )
            os.remove(temp_file_path)
        return file_response
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def extract_loaded_yard_data_for_rejected_file(data):
    loaded_yard_df_data = pd.DataFrame(data)[
        [
            "container_no",
            "size",
            "port",
            "liner",
            "inward_rake",
            "outward_rake",
            "iit_date",
            "iit_time",
            "dvan_date",
            "dvan_time",
            "mtin_date",
            "mtin_time",
            "van_date",
            "van_time",
            "booking_no",
            "seal_no",
            "mir_date",
            "mir_time",
            "mot_date",
            "mot_time",
            "mit_date",
            "mit_time",
            "mor_date",
            "mor_time",
            "expin_date",
            "expin_time",
            "eot_date",
            "eot_time",
            "report",
            "remarks",
        ]
    ]
    loaded_yard_df_data.columns = [
        "CONTAINER",
        "SIZE",
        "PORT",
        "LINER/MERCHANT",
        "INWARD RAKE",
        "OUTWARD RAKE",
        "IIT",
        "IIT TIME",
        "DVAN",
        "DVAN TIME",
        "MTIN",
        "MTIN TIME",
        "VAN",
        "VAN TIME",
        "BOOKING NO",
        "SEAL NO",
        "MIR",
        "MIR TIME",
        "MOT",
        "MOT TIME",
        "MIT",
        "MIT TIME",
        "MOR",
        "MOR TIME",
        "EXPIN",
        "EXPIN TIME",
        "EOT",
        "EOT TIME",
        "REPORT",
        "REMARKS",
    ]
    return loaded_yard_df_data


def get_date_time_obj(date_str, time_str):
    if date_str:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        time = datetime.strptime(time_str, "%H:%M").time()
    else:
        date = None
        time = None
    return date, time
