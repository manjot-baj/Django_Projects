# IN Move Codes: IIT, MTIN, MIR,MIT,EXPIN
# Out Move Codes: DVAN, MOT, MOR, VAN, EOT
# sequence
# IIT --> 1ST	Fully loaded cargo container shipped by Train.
# DVAN --> 2ND	import loaded containers out to shipper
# MTIN --> 3RD	After Cargo destuff, Container store in ECY.
# MOT --> 4TH	Empty containers move from ECY to Port/Terminal by Train.
# VAN --> 5TH	Empty containers alloted to shippers for export use.
# EXPIN --> 6TH	Loaded containers moved from Shippers/consignee/party
# EOT --> 7TH	Export Loaded Containers onload on Train
# MIR --> 8TH	After MNR, containers gated in ICD
# MIT --> 9TH	Empty Containers onloadedon Train.
# MOR --> 10TH	After MNR, containers gated out from ICD

from django.utils import timezone
import logging, traceback, datetime, ftplib
from master.models import Location, Site
from loaded_yard.models import LoadedYard, LyExcelEdiMailTracker
from edi.msc_edi_excel_generation import make_msc_edi_excel_file
from decouple import config
import os

LOADEDYARD_CONTAINER_MOVE_CODE_STATUS = {
    "IIT": "IDR",
    "MTIN": "MCY",
    "EXPIN": "ERY",
    "MIR": "MPI",
    "MIT": "MDR",
    "DVAN": "ICO",
    "MOT": "MLR",
    "MOR": "MPO",
    "VAN": "MSH",
    "EOT": "ELR",
}


def ly_excel_edi_row_data(obj_data, row_dict, move_code):
    try:
        tz = timezone.get_current_timezone()
        # depot_name = obj_data.site.name
        depot_name = None
        depot_msc_code = obj_data.site.depot_msc_code
        event_location = obj_data.site.event_location_msc_code
        container_status = LOADEDYARD_CONTAINER_MOVE_CODE_STATUS[move_code]
        full_empty = "F" if move_code in ["IIT", "EXPIN", "DVAN", "EOT"] else "E"
        container_no = obj_data.container_no

        date = None
        time = None
        transporter_name = None
        next_event_location = None
        next_depot_code = None
        truck_no = None
        edi_partner_code = None

        if move_code == "IIT":
            date = obj_data.iit_date
            time = obj_data.iit_time
        elif move_code == "MTIN":
            date = obj_data.mtin_date
            time = obj_data.mtin_time
        elif move_code == "EXPIN":
            date = obj_data.expin_date
            time = obj_data.expin_time
        elif move_code == "MIR":
            date = obj_data.mir_date
            time = obj_data.mir_time
        elif move_code == "MIT":
            date = obj_data.mit_date
            time = obj_data.mit_time
        elif move_code == "DVAN":
            date = obj_data.dvan_date
            time = obj_data.dvan_time
            # edi_partner_code = obj_data.site.vendor_name
        elif move_code == "MOT":
            date = obj_data.mot_date
            time = obj_data.mot_time
            transporter_name = obj_data.mot_transporter
            truck_no = obj_data.mot_truck_no
            next_event_location = obj_data.mot_to_location
            next_depot_code = obj_data.mot_to_depot_code
            edi_partner_code = obj_data.site.vendor_name

        elif move_code == "MOR":
            date = obj_data.mor_date
            time = obj_data.mor_time
            transporter_name = obj_data.mor_transporter
            truck_no = obj_data.mor_truck_no
            next_event_location = obj_data.mor_to_location
            next_depot_code = obj_data.mor_to_depot_code
            edi_partner_code = obj_data.site.vendor_name

        elif move_code == "VAN":
            date = obj_data.van_date
            time = obj_data.van_time
        elif move_code == "EOT":
            date = obj_data.eot_date
            time = obj_data.eot_time
            transporter_name = obj_data.eot_transporter
            next_event_location = obj_data.eot_to_location
            next_depot_code = obj_data.eot_to_depot_code
            edi_partner_code = obj_data.site.vendor_name
        else:
            pass
        date_time = datetime.datetime.combine(date=date, time=time).astimezone(tz)
        move_date_time = date_time.astimezone(tz).strftime("%d-%m-%Y %H:%M")
        cargo_wt = 0
        booking_no = obj_data.booking_no if move_code == "VAN" else None
        seal_no_1 = obj_data.seal_no if booking_no is not None else None
        seal_type_1 = "M" if seal_no_1 is not None else None

        # row update
        row_dict["depot_name"] = depot_name
        row_dict["depot_msc_code"] = depot_msc_code
        row_dict["edi_partner_code"] = edi_partner_code
        row_dict["event_location"] = event_location
        row_dict["container_status"] = container_status
        row_dict["full_empty"] = full_empty
        row_dict["container_no"] = container_no
        row_dict["move_date_time"] = move_date_time
        row_dict["booking_no"] = booking_no
        row_dict["cargo_wt"] = int(cargo_wt)
        row_dict["seal_type_1"] = seal_type_1
        row_dict["seal_no_1"] = seal_no_1
        row_dict["transporter_name"] = (
            transporter_name[:35] if transporter_name is not None else transporter_name
        )
        row_dict["truck_no"] = truck_no[:35] if truck_no is not None else truck_no
        row_dict["next_event_location"] = (
            next_event_location[:5]
            if next_event_location is not None
            else next_event_location
        )
        row_dict["next_depot_code"] = (
            next_depot_code[:7] if next_depot_code is not None else next_depot_code
        )

        return row_dict
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def ly_excel_edi_main_data(data_object_list, move_code):
    try:
        main_row_dict = {
            "depot_name": None,
            "depot_msc_code": None,
            "edi_partner_code": None,
            "event_location": None,
            "container_status": None,
            "full_empty": None,
            "container_no": None,
            "move_date_time": None,
            "booking_no": None,
            "bl_no": None,
            "vessel": None,
            "voyage": None,
            "pol": None,
            "pod": None,
            "cargo_wt": None,
            "seal_type_1": None,
            "seal_no_1": None,
            "seal_type_2": None,
            "seal_no_2": None,
            "seal_type_3": None,
            "seal_no_3": None,
            "transport_carrier": None,
            "vehicle": None,
            "lease_company": None,
            "remarks": None,
            "lease_company_code": None,
            "pick_up_ref": None,
            "lesser_code": None,
            "transporter_name": None,
            "truck_no": None,
            "next_event_location": None,
            "next_depot_code": None,
        }
        main_dict_list = [
            ly_excel_edi_row_data(
                obj_data=each, row_dict=main_row_dict.copy(), move_code=move_code
            )
            for each in data_object_list
        ]
        main_data = {
            "depot_name": [each.get("depot_name") for each in main_dict_list],
            "depot_msc_code": [each.get("depot_msc_code") for each in main_dict_list],
            "edi_partner_code": [
                each.get("edi_partner_code") for each in main_dict_list
            ],
            "event_location": [each.get("event_location") for each in main_dict_list],
            "container_status": [
                each.get("container_status") for each in main_dict_list
            ],
            "full_empty": [each.get("full_empty") for each in main_dict_list],
            "container_no": [each.get("container_no") for each in main_dict_list],
            "move_date_time": [each.get("move_date_time") for each in main_dict_list],
            "booking_no": [each.get("booking_no") for each in main_dict_list],
            "bl_no": [each.get("bl_no") for each in main_dict_list],
            "vessel": [each.get("vessel") for each in main_dict_list],
            "voyage": [each.get("voyage") for each in main_dict_list],
            "pol": [each.get("pol") for each in main_dict_list],
            "pod": [each.get("pod") for each in main_dict_list],
            "cargo_wt": [each.get("cargo_wt") for each in main_dict_list],
            "seal_type_1": [each.get("seal_type_1") for each in main_dict_list],
            "seal_no_1": [each.get("seal_no_1") for each in main_dict_list],
            "seal_type_2": [each.get("seal_type_2") for each in main_dict_list],
            "seal_no_2": [each.get("seal_no_2") for each in main_dict_list],
            "seal_type_3": [each.get("seal_type_3") for each in main_dict_list],
            "seal_no_3": [each.get("seal_no_3") for each in main_dict_list],
            "transport_carrier": [
                each.get("transport_carrier") for each in main_dict_list
            ],
            "vehicle": [each.get("vehicle") for each in main_dict_list],
            "lease_company": [each.get("lease_company") for each in main_dict_list],
            "remarks": [each.get("remarks") for each in main_dict_list],
            "lease_company_code": [
                each.get("lease_company_code") for each in main_dict_list
            ],
            "pick_up_ref": [each.get("pick_up_ref") for each in main_dict_list],
            "lesser_code": [each.get("lesser_code") for each in main_dict_list],
            "transporter_name": [
                each.get("transporter_name") for each in main_dict_list
            ],
            "truck_no": [each.get("truck_no") for each in main_dict_list],
            "next_event_location": [
                each.get("next_event_location") for each in main_dict_list
            ],
            "next_depot_code": [each.get("next_depot_code") for each in main_dict_list],
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_dates(from_date_str, to_date_str, from_time_str, to_time_str):
    try:
        tz = timezone.get_current_timezone()
        to_date_time = datetime.datetime.now().astimezone(tz)
        from_date_time = to_date_time - datetime.timedelta(hours=24)
        from_date_time = from_date_time.astimezone(tz)
        from_date = from_date_time.date()
        to_date = to_date_time.date()
        from_time = datetime.datetime.strptime("00:00", "%H:%M").time()
        to_time = datetime.datetime.strptime("23:59", "%H:%M").time()
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(tz)
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(tz)
        return from_date_time, to_date_time
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None, None


def get_ly_edi_data(request):
    try:
        data = request.data
        from_date_str = data["from_date"]
        to_date_str = data["to_date"]
        from_time_str = data["from_time"]
        to_time_str = data["to_time"]
        container_no = data["container_no"]
        move_code = data["move_code"]
        process = data["process"]
        location_str = data["location"]
        site_str = data["site"]
        data_list = []

        if len(location_str) == 0 or len(site_str) == 0 or len(move_code) == 0:
            return None, {"errorMsg": "Please provide proper data"}

        # location and site
        location = Location.objects.get(name=location_str)
        site = Site.objects.get(name=site_str, location=location)
        param = {
            "location": location,
            "site": site,
            "process_type": process,
        }
        if not len(container_no) == 0:
            param["container_no"] = container_no
            move_code_date = f"{move_code.lower()}_date"
            move_code_time = f"{move_code.lower()}_time"
            exclude_params = {}
            exclude_params[move_code_date] = None
            exclude_params[move_code_time] = None
            data_list = LoadedYard.objects.filter(**param).exclude(**exclude_params)
        else:
            # dates
            from_date_time, to_date_time = get_dates(
                from_date_str, to_date_str, from_time_str, to_time_str
            )
            # data based on movecode
            move_code_date_gte = f"{move_code.lower()}_date__gte"
            move_code_time_gte = f"{move_code.lower()}_time__gte"
            move_code_date_lte = f"{move_code.lower()}_date__lte"
            move_code_time_lte = f"{move_code.lower()}_time__lte"
            param[move_code_date_gte] = from_date_time.date()
            param[move_code_time_gte] = from_date_time.time()
            param[move_code_date_lte] = to_date_time.date()
            param[move_code_time_lte] = to_date_time.time()
            data_list = LoadedYard.objects.filter(**param)
        if len(list(data_list)) == 0:
            return None, {"errorMsg": "Data Not Found"}
        return move_code, data_list
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None, {"errorMsg": "Data Not Found"}


def ly_excel_edi_upload_process():
    try:
        movecodes = [
            "IIT",
            "MTIN",
            "EXPIN",
            "MIR",
            "MIT",
            "DVAN",
            "MOT",
            "MOR",
            "VAN",
            "EOT",
        ]
        sites = ["LYBALMER LAWRIE", "CONCOR HALDIA", "MAJERHAT TERMINAL", "ICD Birgunj"]
        for site in sites:
            count = 0
            for movecode in movecodes:
                count = count + 1
                filter_params = {
                    "site__name": site,
                    f"{movecode.lower()}_is_sent": False,
                }
                exclude_params = {
                    f"{movecode.lower()}_date": None,
                    f"{movecode.lower()}_time": None,
                }
                update_params = {
                    f"{movecode.lower()}_is_sent": True,
                    f"{movecode.lower()}_is_tracked": True,
                }

                if (
                    LoadedYard.objects.filter(**filter_params)
                    .exclude(**exclude_params)
                    .exists()
                ):
                    ly_data = LoadedYard.objects.filter(**filter_params).exclude(
                        **exclude_params
                    )
                    ly_df_data = ly_excel_edi_main_data(
                        data_object_list=ly_data, move_code=movecode
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz) + datetime.timedelta(
                        minutes=count
                    )
                    date = today.date().strftime("%d%m%Y")
                    time = today.time().strftime("%H%M%S")
                    site_obj = Site.objects.get(name=site)
                    depot_name = site.upper().replace(" ", "")
                    file_name = f"{site_obj.event_location_msc_code}_{site_obj.depot_msc_code}_{depot_name}_{date}{time}"
                    temp_file_path = make_msc_edi_excel_file(
                        context=ly_df_data, filename=file_name
                    )
                    """ftp stuff"""
                    session = ftplib.FTP(
                        config("WINDOWS_FTP_HOST"),
                        config("WINDOWS_FTP_USERNAME"),
                        config("WINDOWS_FTP_PASSWORD"),
                    )
                    file = open(temp_file_path, "rb")
                    session.storbinary(
                        f"STOR /inetpub/myFTPDirectory/ly_edi_excel_files/{site}/{file_name}.xlsx",
                        file,
                    )
                    file.close()
                    session.quit()

                    for each_data in ly_data:
                        tracker_object = LyExcelEdiMailTracker.objects.create(
                            container_no=each_data.container_no,
                            site=site,
                            data_id=each_data.pk,
                            move_code=movecode,
                            excel_move_code=LOADEDYARD_CONTAINER_MOVE_CODE_STATUS[
                                movecode
                            ],
                        )
                        tracker_object.save()

                    ly_data.update(**update_params)
                    os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
