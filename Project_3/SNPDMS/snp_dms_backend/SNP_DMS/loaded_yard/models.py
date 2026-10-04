from django.db import models
from master.models import Location, Site
import traceback, logging
from loaded_yard.utils import (
    extract_data_list,
    collect_main_data,
    get_date_obj,
    get_location_site,
    get_date_time_obj,
)
from depot.functions import check_char_digit
from loaded_yard.edi_functions import loaded_yard_edi_content
from datetime import datetime
from django.utils import timezone
from django.db.models import Q
from master.functions import pagination_func
from loaded_yard.client_specific_functions import client_specific_extract_data_list

TYPE = [("IN", "IN"), ("OUT", "OUT")]


class LoadedYardManager(models.Manager):
    def check_errors(self, extracted_data_list, location, site):
        error_data = []
        error_data_msg = {}
        correct_data = []

        for each in extracted_data_list:
            error_msg = []
            in_move_code_count = 0
            out_move_code_count = 0
            container_no_str = each["container_no"]

            if len(container_no_str) == 11 and check_char_digit(container_no_str):
                is_container_repeated = any(
                    obj_data["container_no"] == container_no_str
                    for obj_data in correct_data
                )
                if is_container_repeated:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this({container_no_str}) container is repeated in your file"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no ({container_no_str}) is invalid"
                )

            size_str = each["size"]
            if not size_str == "":
                error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in SIZE column, "
                    f"Please Fill Data"
                )

            columns = [
                "iit",
                "dvan",
                "mtin",
                "van",
                "mir",
                "mot",
                "mit",
                "mor",
                "expin",
                "eot",
            ]
            for column in columns:
                date_str = each[f"{column}_date"]
                time_str = each[f"{column}_time"]

                if not date_str == "":
                    try:
                        datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
                        error_msg.append("")
                    except:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} column,"
                            f"date is not in dd-mm-yyyy format"
                        )
                    if time_str == "":
                        time_str = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                            .strftime("%H:%M:%S")
                        )
                    else:
                        try:
                            datetime.strptime(time_str, "%H:%M:%S").time()
                            error_msg.append("")
                        except:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} TIME column,"
                                f"time is not in HH:MM format"
                            )
                else:
                    error_msg.extend([""] * 2)

            in_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["iit", "mtin", "mir", "mit", "expin"]
            )
            out_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["dvan", "van", "mot", "mor", "eot"]
            )

            booking_no_str = each["booking_no"]
            if booking_no_str == "":
                if out_move_code_count > 0:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                        f"Cannot keep booking_no column empty for out move code"
                    )
                else:
                    error_msg.append("")
            else:
                error_msg.append("")

            iit_date = get_date_obj(date_str=each["iit_date"])
            dvan_date = get_date_obj(date_str=each["dvan_date"])
            # mtin_date = get_date_obj(date_str=each["mtin_date"])
            # van_date = get_date_obj(date_str=each["van_date"])
            # mir_date = get_date_obj(date_str=each["mir_date"])
            # mot_date = get_date_obj(date_str=each["mot_date"])
            # mit_date = get_date_obj(date_str=each["mit_date"])
            # mor_date = get_date_obj(date_str=each["mor_date"])
            # expin_date = get_date_obj(date_str=each["expin_date"])
            # eot_date = get_date_obj(date_str=each["eot_date"])

            if in_move_code_count == 0 and out_move_code_count == 0:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} Please fill atleast one move code data"
                )
            else:
                if (
                    self.filter(
                        Q(container_no=each["container_no"])
                        & Q(process_type="IN")
                        & Q(iit_date=iit_date)
                        & Q(location=location)
                        & Q(site=site)
                    ).exists()
                    or self.filter(
                        Q(container_no=each["container_no"])
                        & Q(process_type="OUT")
                        & Q(dvan_date=dvan_date)
                        & Q(location=location)
                        & Q(site=site)
                    ).exists()
                ):
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} {container_no_str} Similar Data Exists"
                    )
                else:
                    error_msg.append("")
                if each["dvan_date"] == "" and out_move_code_count != 0:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} DVAN DATE is mandatory if you want to fill OUT move codes,"
                    )
                else:
                    error_msg.append("")
                if each["iit_date"] == "" and in_move_code_count != 0:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} IIT DATE is mandatory if you want to fill IN move codes,"
                    )
                else:
                    error_msg.append("")
                error_msg.append("")

            each["in_move_code_count"] = in_move_code_count
            each["out_move_code_count"] = out_move_code_count

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)

        return correct_data, error_data, error_data_msg

    def client_specific_check_errors(self, extracted_data_list, location, site):
        error_data = []
        error_data_msg = {}
        correct_data = []

        for each in extracted_data_list:
            error_msg = []
            in_move_code_count = 0
            out_move_code_count = 0
            container_no_str = each["container_no"]

            if len(container_no_str) == 11 and check_char_digit(container_no_str):
                is_container_repeated = any(
                    obj_data["container_no"] == container_no_str
                    for obj_data in correct_data
                )
                if is_container_repeated:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this({container_no_str}) container is repeated in your file"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no ({container_no_str}) is invalid"
                )

            size_str = each["size"]
            if not size_str == "":
                error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in SIZE column, "
                    f"Please Fill Data"
                )

            columns = [
                "iit",
                "dvan",
                "mtin",
                "van",
                "mir",
                "mot",
                "mit",
                "mor",
                "expin",
                "eot",
            ]
            for column in columns:
                date_str = each[f"{column}_date"]
                time_str = each[f"{column}_time"]

                if not date_str == "":
                    try:
                        datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
                        error_msg.append("")
                    except:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} column,"
                            f"date is not in dd-mm-yyyy format"
                        )
                    if time_str == "":
                        time_str = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                            .strftime("%H:%M:%S")
                        )
                    else:
                        try:
                            datetime.strptime(time_str, "%H:%M:%S").time()
                            error_msg.append("")
                        except:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} TIME column,"
                                f"time is not in HH:MM format"
                            )
                else:
                    error_msg.extend([""] * 2)

            in_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["iit", "mtin", "mir", "mit", "expin"]
            )
            out_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["dvan", "van", "mot", "mor", "eot"]
            )

            # In move codes validation

            if each["iit_date"]:
                if self.filter(
                    container_no=container_no_str,
                    iit_date=datetime.strptime(
                        each["iit_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in IIT DATE column,"
                        f"Container {container_no_str} with same IIT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["expin_date"]:
                if self.filter(
                    container_no=container_no_str,
                    expin_date=datetime.strptime(
                        each["expin_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in EXPIN DATE column,"
                        f"Container {container_no_str} with same EXPIN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mtin_date"]:
                if self.filter(
                    container_no=container_no_str,
                    mtin_date=datetime.strptime(
                        each["mtin_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MTIN DATE column,"
                        f"Container {container_no_str} with same MTIN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mir_date"]:
                if self.filter(
                    container_no=container_no_str,
                    mir_date=datetime.strptime(
                        each["mir_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MIR DATE column,"
                        f"Container {container_no_str} with same MIR date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mit_date"]:
                if self.filter(
                    container_no=container_no_str,
                    mit_date=datetime.strptime(
                        each["mit_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MIT DATE column,"
                        f"Container {container_no_str} with same MIT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            # Out Move code validations

            if each["dvan_date"]:
                if self.filter(
                    container_no=container_no_str,
                    dvan_date=datetime.strptime(
                        each["dvan_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in DVAN DATE column,"
                        f"Container {container_no_str} with same DVAN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["van_date"]:
                if self.filter(
                    container_no=container_no_str,
                    van_date=datetime.strptime(
                        each["van_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in VAN DATE column,"
                        f"Container {container_no_str} with same VAN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mot_date"]:
                if self.filter(
                    container_no=container_no_str,
                    mot_date=datetime.strptime(
                        each["mot_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT DATE column,"
                        f"Container {container_no_str} with same MOT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mor_date"]:
                if self.filter(
                    container_no=container_no_str,
                    mor_date=datetime.strptime(
                        each["mor_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR DATE column,"
                        f"Container {container_no_str} with same MOR date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            eot_to_location_str = each["eot_to_location"]
            eot_to_depot_code_str = each["eot_to_depot_code"]
            eot_transporter_str = each["eot_transporter"]

            if each["eot_date"]:
                if self.filter(
                    container_no=container_no_str,
                    eot_date=datetime.strptime(
                        each["eot_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location=location,
                    site=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in EOT DATE column,"
                        f"Container {container_no_str} with same EOT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            booking_no_str = each["booking_no"]
            if each["van_date"]:
                if booking_no_str == "":

                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                        f"Cannot keep booking_no column empty for VAN DATE"
                    )
                    # if out_move_code_count > 0:
                    #     error_msg.append(
                    #         f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                    #         f"Cannot keep booking_no column empty for out move code"
                    #     )
                else:
                    error_msg.append("")
            else:
                error_msg.append("")

            seal_no_str = each["seal_no"]
            if each["van_date"]:
                if seal_no_str == "":

                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in SEAL NO column,"
                        f"Cannot keep seal_no column empty for VAN DATE"
                    )
                    # if out_move_code_count > 0:
                    #     error_msg.append(
                    #         f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                    #         f"Cannot keep seal_no column empty for out move code"
                    #     )
                else:
                    error_msg.append("")
            else:
                error_msg.append("")

            mot_current_location_str = each["mot_current_location"]
            mot_to_location_str = each["mot_to_location"]
            mot_booking_no_str = each["mot_booking_no"]
            mot_transporter_str = each["mot_transporter"]
            mot_truck_no_str = each["mot_truck_no"]
            mot_to_depot_code_str = each["mot_to_depot_code"]

            if each["mot_date"]:
                if mot_current_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT CURRENT LOCATION column,"
                        f"Cannot keep MOT CURRENT LOCATION column empty for MOT move code"
                    )
                else:
                    error_msg.append("")
                if mot_to_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT TO LOCATION column,"
                        f"Cannot keep MOT TO LOCATION column empty for MOT move code"
                    )
                else:
                    error_msg.append("")
                if mot_booking_no_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT BOOKING NO REF column,"
                        f"Cannot keep MOT BOOKING NO REF column empty for MOT move code"
                    )
                else:
                    error_msg.append("")
                if mot_transporter_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT TRANSPORTER column,"
                        f"Cannot keep MOT TRANSPORTER column empty for MOT move code"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.extend([""] * 4)

            mit_current_location_str = each["mit_current_location"]

            if each["mit_date"]:
                if mit_current_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MIT CURRENT LOCATION column,"
                        f"Cannot keep MIT CURRENT LOCATION column empty for MIT move code"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mor_date"]:
                mor_current_location_str = each["mor_current_location"]
                mor_to_location_str = each["mor_to_location"]
                mor_booking_no_str = each["mor_booking_no"]
                mor_transporter_str = each["mor_transporter"]
                mor_truck_no_str = each["mor_truck_no"]
                mor_to_depot_code_str = each["mor_to_depot_code"]

                if mor_current_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR CURRENT LOCATION column,"
                        f"Cannot keep MOR CURRENT LOCATION column empty for MOR move code"
                    )
                else:
                    error_msg.append("")
                if mor_to_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR TO LOCATION column,"
                        f"Cannot keep MOR TO LOCATION column empty for MOR move code"
                    )
                else:
                    error_msg.append("")
                if mor_booking_no_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR BOOKING NO REF column,"
                        f"Cannot keep MOR BOOKING NO REF column empty for MOR move code"
                    )
                else:
                    error_msg.append("")
                if mor_transporter_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR TRANSPORTER column,"
                        f"Cannot keep MOR TRANSPORTER column empty for MOR move code"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.extend([""] * 4)

            iit_date = get_date_obj(date_str=each["iit_date"])
            dvan_date = get_date_obj(date_str=each["dvan_date"])

            if in_move_code_count == 0 and out_move_code_count == 0:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} Please fill atleast one move code data"
                )
            else:
                # if (
                #     self.filter(
                #         Q(container_no=each["container_no"])
                #         & Q(process_type="IN")
                #         & Q(iit_date=iit_date)
                #         & Q(location=location)
                #         & Q(site=site)
                #     ).exists()
                #     or self.filter(
                #         Q(container_no=each["container_no"])
                #         & Q(process_type="OUT")
                #         & Q(dvan_date=dvan_date)
                #         & Q(location=location)
                #         & Q(site=site)
                #     ).exists()
                # ):
                #     error_msg.append(
                #         f"In row {str(int(each['sr_no']) + 2)} {container_no_str} Similar Data Exists"
                #     )
                # else:
                #     error_msg.append("")
                # if each["dvan_date"] == "" and out_move_code_count != 0:
                #     error_msg.append(
                #         f"In row {str(int(each['sr_no']) + 2)} DVAN DATE is mandatory if you want to fill OUT move codes,"
                #     )
                # else:
                #     error_msg.append("")
                # if each["iit_date"] == "" and in_move_code_count != 0:
                #     error_msg.append(
                #         f"In row {str(int(each['sr_no']) + 2)} IIT DATE is mandatory if you want to fill IN move codes,"
                #     )
                # else:
                #     error_msg.append("")
                error_msg.append("")

            each["in_move_code_count"] = in_move_code_count
            each["out_move_code_count"] = out_move_code_count

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)

        return correct_data, error_data, error_data_msg

    def extract_loaded_yard_excel_data(self, input_excel, location, site):
        try:
            extracted_data_list = extract_data_list(input_excel)

            correct_data, error_data, error_data_msg = self.check_errors(
                extracted_data_list, location, site
            )
            main_data = collect_main_data(correct_data, error_data, error_data_msg)

            return main_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def client_specific_extract_loaded_yard_excel_data(
        self, input_excel, location, site
    ):
        try:
            extracted_data_list = client_specific_extract_data_list(input_excel)

            correct_data, error_data, error_data_msg = (
                self.client_specific_check_errors(extracted_data_list, location, site)
            )
            main_data = collect_main_data(correct_data, error_data, error_data_msg)

            return main_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    # def check_container_existence(self, data, location, site):
    #     return [
    #         (
    #             True
    #             if LoadedYard.objects.filter(
    #                 container_no=each["container_no"], location=location, site=site
    #             ).exists()
    #             else False
    #         )
    #         for each in data
    #     ]

    def get_date_time_obj_for_move_code(self, date_str, time_str):
        if date_str:
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
            time = datetime.strptime(time_str, "%H:%M:%S").time()
        else:
            date = None
            time = None
        return date, time

    def get_move_code_content(self, each, MOVE_CODES, attachment_list):
        for (
            move_code,
            current_location,
            to_location,
            mode_of_transport,
            transporter,
            job_order_no,
        ) in MOVE_CODES:
            if each[f"{move_code.lower()}_date"] != "":
                date, time = self.get_date_time_obj_for_move_code(
                    date_str=each[f"{move_code.lower()}_date"],
                    time_str=each[f"{move_code.lower()}_time"],
                )
                move_code_content = loaded_yard_edi_content(
                    container_no=each["container_no"],
                    type_size=each["size"],
                    move_code=move_code,
                    date=date,
                    time=time,
                    current_location=current_location,
                    to_location=to_location,
                    booking_no=each["booking_no"],
                    customer="",
                    transporter=transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport=mode_of_transport,
                    job_order_no=job_order_no,
                )
                attachment_list.append(move_code_content["content"])
        return attachment_list

    def client_specific_get_move_code_content(self, each, MOVE_CODES, attachment_list):
        for (
            move_code,
            current_location,
            to_location,
            mode_of_transport,
            transporter,
            job_order_no,
        ) in MOVE_CODES:
            if each[f"{move_code.lower()}_date"] != "":
                if move_code in ["MOT", "MOR"]:
                    booking_no = each[f"{move_code.lower()}_booking_no"]
                else:
                    booking_no = each["booking_no"]
                date, time = self.get_date_time_obj_for_move_code(
                    date_str=each[f"{move_code.lower()}_date"],
                    time_str=each[f"{move_code.lower()}_time"],
                )
                move_code_content = loaded_yard_edi_content(
                    container_no=each["container_no"],
                    type_size=each["size"],
                    move_code=move_code,
                    date=date,
                    time=time,
                    current_location=current_location,
                    to_location=to_location,
                    booking_no=booking_no,
                    customer="",
                    transporter=transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport=mode_of_transport,
                    job_order_no=job_order_no,
                )
                attachment_list.append(move_code_content["content"])
        return attachment_list

    def create_loaded_yard_data(self, importable_data, location, site):
        attachment_list = []
        for each in importable_data:
            container_no = each["container_no"]
            type_size = each["size"]
            port = each["port"]
            liner_merchant = each["liner"]
            inward_rake = each["inward_rake"]
            outward_rake = each["outward_rake"]
            iit_date, iit_time = self.get_date_time_obj_for_move_code(
                date_str=each["iit_date"], time_str=each["iit_time"]
            )

            dvan_date, dvan_time = self.get_date_time_obj_for_move_code(
                date_str=each["dvan_date"], time_str=each["dvan_time"]
            )

            mtin_date, mtin_time = self.get_date_time_obj_for_move_code(
                date_str=each["mtin_date"], time_str=each["mtin_time"]
            )

            van_date, van_time = self.get_date_time_obj_for_move_code(
                date_str=each["van_date"], time_str=each["van_time"]
            )

            mir_date, mir_time = self.get_date_time_obj_for_move_code(
                date_str=each["mir_date"], time_str=each["mir_time"]
            )

            mot_date, mot_time = self.get_date_time_obj_for_move_code(
                date_str=each["mot_date"], time_str=each["mot_time"]
            )

            mit_date, mit_time = self.get_date_time_obj_for_move_code(
                date_str=each["mit_date"], time_str=each["mit_time"]
            )

            mor_date, mor_time = self.get_date_time_obj_for_move_code(
                date_str=each["mor_date"], time_str=each["mor_time"]
            )

            expin_date, expin_time = self.get_date_time_obj_for_move_code(
                date_str=each["expin_date"], time_str=each["expin_time"]
            )
            eot_date, eot_time = self.get_date_time_obj_for_move_code(
                date_str=each["eot_date"], time_str=each["eot_time"]
            )
            booking_no = each["booking_no"]
            seal_no = each["seal_no"]
            report = each["report"]
            remarks = each["remarks"]

            if not each["in_move_code_count"] == 0:
                LoadedYard.objects.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="IN",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=iit_date,
                    iit_time=iit_time,
                    dvan_date=None,
                    dvan_time=None,
                    mtin_date=mtin_date,
                    mtin_time=mtin_time,
                    van_date=None,
                    van_time=None,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=None,
                    mot_time=None,
                    mit_date=mit_date,
                    mit_time=mit_time,
                    mor_date=None,
                    mor_time=None,
                    expin_date=expin_date,
                    expin_time=expin_time,
                    eot_date=None,
                    eot_time=None,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )

            if not each["out_move_code_count"] == 0:
                self.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="OUT",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=None,
                    iit_time=None,
                    dvan_date=dvan_date,
                    dvan_time=dvan_time,
                    mtin_date=None,
                    mtin_time=None,
                    van_date=van_date,
                    van_time=van_time,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=mot_date,
                    mot_time=mot_time,
                    mit_date=None,
                    mit_time=None,
                    mor_date=mor_date,
                    mor_time=mor_time,
                    expin_date=None,
                    expin_time=None,
                    eot_date=eot_date,
                    eot_time=eot_time,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )
            MOVE_CODES = [
                ("IIT", "NPBRG", "", "", "", ""),
                ("DVAN", "NPBRG", "", "R", "", ""),
                ("MTIN", "NPBRG", "", "", "", ""),
                ("MIR", "NPBRG", "", "", "", ""),
                ("MOT", "NPBRG", "INMJ1", "", "CONKOL", ""),
                ("MIT", "INMJ1", "", "", "", ""),
                ("MOR", "INMJ1", "INGHK", "", "HRL001", ""),
                ("VAN", "NPBRG", "INMJ1", "", "CONKOL", seal_no),
                ("EXPIN", "NPBRG", "", "R", "", ""),
                ("EOT", "NPBRG", "INMJ1", "T", "CONKOL", ""),
            ]

            move_code_content = self.get_move_code_content(
                each, MOVE_CODES, attachment_list
            )
        edi_content = "".join(move_code_content)

        return edi_content

    def client_specific_create_loaded_yard_data(self, importable_data, location, site):
        attachment_list = []
        for each in importable_data:
            container_no = each["container_no"]
            type_size = each["size"]
            port = each["port"]
            liner_merchant = each["liner"]
            inward_rake = each["inward_rake"]
            outward_rake = each["outward_rake"]
            iit_date, iit_time = self.get_date_time_obj_for_move_code(
                date_str=each["iit_date"], time_str=each["iit_time"]
            )

            dvan_date, dvan_time = self.get_date_time_obj_for_move_code(
                date_str=each["dvan_date"], time_str=each["dvan_time"]
            )

            mtin_date, mtin_time = self.get_date_time_obj_for_move_code(
                date_str=each["mtin_date"], time_str=each["mtin_time"]
            )

            van_date, van_time = self.get_date_time_obj_for_move_code(
                date_str=each["van_date"], time_str=each["van_time"]
            )

            mir_date, mir_time = self.get_date_time_obj_for_move_code(
                date_str=each["mir_date"], time_str=each["mir_time"]
            )

            mot_date, mot_time = self.get_date_time_obj_for_move_code(
                date_str=each["mot_date"], time_str=each["mot_time"]
            )

            mit_date, mit_time = self.get_date_time_obj_for_move_code(
                date_str=each["mit_date"], time_str=each["mit_time"]
            )

            mor_date, mor_time = self.get_date_time_obj_for_move_code(
                date_str=each["mor_date"], time_str=each["mor_time"]
            )

            expin_date, expin_time = self.get_date_time_obj_for_move_code(
                date_str=each["expin_date"], time_str=each["expin_time"]
            )
            eot_date, eot_time = self.get_date_time_obj_for_move_code(
                date_str=each["eot_date"], time_str=each["eot_time"]
            )
            mot_current_location = each["mot_current_location"]
            mot_to_location = each["mot_to_location"]
            mot_booking_no = each["mot_booking_no"]
            mot_transporter = each["mot_transporter"]
            mot_truck_no = each["mot_truck_no"]
            mot_to_depot_code = each["mot_to_depot_code"]
            mit_current_location = each["mit_current_location"]
            mor_current_location = each["mor_current_location"]
            mor_to_location = each["mor_to_location"]
            mor_booking_no = each["mor_booking_no"]
            mor_transporter = each["mor_transporter"]
            mor_truck_no = each["mor_truck_no"]
            mor_to_depot_code = each["mor_to_depot_code"]
            booking_no = each["booking_no"]
            seal_no = each["seal_no"]
            report = each["report"]
            remarks = each["remarks"]
            eot_to_location = each["eot_to_location"]
            eot_transporter = each["eot_transporter"]
            eot_to_depot_code = each["eot_to_depot_code"]

            if not each["in_move_code_count"] == 0:
                LoadedYard.objects.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="IN",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=iit_date,
                    iit_time=iit_time,
                    dvan_date=None,
                    dvan_time=None,
                    mtin_date=mtin_date,
                    mtin_time=mtin_time,
                    van_date=None,
                    van_time=None,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=None,
                    mot_time=None,
                    mot_current_location=None,
                    mot_to_location=None,
                    mot_booking_no=None,
                    mot_transporter=None,
                    mot_to_depot_code=None,
                    mot_truck_no=None,
                    mit_date=mit_date,
                    mit_time=mit_time,
                    mit_current_location=mit_current_location,
                    mor_date=None,
                    mor_time=None,
                    mor_current_location=None,
                    mor_to_location=None,
                    mor_booking_no=None,
                    mor_transporter=None,
                    mor_to_depot_code=None,
                    mor_truck_no=None,
                    expin_date=expin_date,
                    expin_time=expin_time,
                    eot_date=None,
                    eot_time=None,
                    eot_to_location=None,
                    eot_transporter=None,
                    eot_to_depot_code=None,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )

            if not each["out_move_code_count"] == 0:
                self.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="OUT",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=None,
                    iit_time=None,
                    dvan_date=dvan_date,
                    dvan_time=dvan_time,
                    mtin_date=None,
                    mtin_time=None,
                    van_date=van_date,
                    van_time=van_time,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=mot_date,
                    mot_time=mot_time,
                    mot_current_location=mot_current_location,
                    mot_to_location=mot_to_location,
                    mot_booking_no=mot_booking_no,
                    mot_transporter=mot_transporter,
                    mot_truck_no=mot_truck_no,
                    mot_to_depot_code=mot_to_depot_code,
                    mit_date=None,
                    mit_time=None,
                    mit_current_location=None,
                    mor_date=mor_date,
                    mor_time=mor_time,
                    mor_current_location=mor_current_location,
                    mor_to_location=mor_to_location,
                    mor_booking_no=mor_booking_no,
                    mor_transporter=mor_transporter,
                    mor_truck_no=mor_truck_no,
                    mor_to_depot_code=mor_to_depot_code,
                    expin_date=None,
                    expin_time=None,
                    eot_date=eot_date,
                    eot_time=eot_time,
                    eot_to_location=eot_to_location,
                    eot_transporter=eot_transporter,
                    eot_to_depot_code=eot_to_depot_code,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )
            MOVE_CODES = [
                ("IIT", "NPBRG", "", "", "", ""),
                ("DVAN", "NPBRG", "", "R", "", ""),
                ("MTIN", "NPBRG", "", "", "", ""),
                ("MIR", "NPBRG", "", "", "", ""),
                ("MOT", mot_current_location, mot_to_location, "", mot_transporter, ""),
                ("MIT", mit_current_location, "", "", "", ""),
                ("MOR", mor_current_location, mor_to_location, "", mor_transporter, ""),
                ("VAN", "NPBRG", "INMJ1", "", "CONKOL", seal_no),
                ("EXPIN", "NPBRG", "", "R", "", ""),
                # ("EOT", "NPBRG", "INMJ1", "T", "CONKOL", ""),
                ("EOT", "NPBRG", eot_to_location, "T", eot_transporter, ""),
            ]

            move_code_content = self.client_specific_get_move_code_content(
                each, MOVE_CODES, attachment_list
            )
        edi_content = "".join(move_code_content)

        return edi_content

    def get_filtered_data(self, object):
        return [
            self.loaded_yard_view(data=each, count=index + 1)
            for index, each in enumerate(object, object.start_index() - 1)
        ]

    def loaded_yard_view(self, data, count):
        return {
            "pk": data.pk,
            "sr_no": count,
            "container_no": data.container_no,
            "size": data.type_size or "",
            "port": data.port or "",
            "process_type": data.process_type or "",
            "booking_no": data.booking_no or "",
        }

    def get_all_loaded_yard(self, data):
        pg_no = data.get("pg_no")
        on_page_data = data.get("on_page_data")
        location_name = data.get("location")
        site_name = data.get("site")
        container_no = data.get("container_no")
        size = data.get("size")
        in_date = data.get("in_date")
        out_date = data.get("out_date")
        history = data.get("history")
        booking_no = data.get("booking_no")
        port = data.get("port")
        location, site = get_location_site(
            location_name=location_name, site_name=site_name
        )
        param = {}
        if location:
            param["location"] = location
        if site:
            param["site"] = site
        if container_no:
            param["container_no"] = container_no
        if size:
            param["type_size"] = size
        if in_date["from"] and in_date["to"]:
            param["iit_date__range"] = (in_date["from"], in_date["to"])
        if out_date["from"] and out_date["to"]:
            param["dvan_date__range"] = (out_date["from"], out_date["to"])
        if booking_no:
            param["booking_no"] = booking_no
        if port:
            param["port"] = port
        if history == "True":
            param["process_type"] = "OUT"
        else:
            param["process_type"] = "IN"

        filtered_data = self.filter(**param)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(filtered_data, on_page_data, pg_no)
        filtered_data = self.get_filtered_data(object=current_page)
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": filtered_data,
        }

    def loaded_yard_in_data(self, data):
        return {
            "pk": data.pk,
            "container_no": data.container_no or "",
            "size": data.type_size or "",
            "port": data.port or "",
            "process_type": data.process_type or "",
            "liner": data.liner_merchant or "",
            "inward_rake": data.inward_rake or "",
            "outward_rake": data.outward_rake or "",
            "in_date": data.iit_date if data.iit_date else "",
            "iit_date": data.iit_date if data.iit_date else "",
            "iit_time": data.iit_time.strftime("%H:%M") if data.iit_time else "",
            "iit_move_code": "Loaded IN ICD" if data.iit_date else "",
            "mtin_date": data.mtin_date if data.mtin_date else "",
            "mtin_time": data.mtin_time.strftime("%H:%M") if data.mtin_time else "",
            "mtin_move_code": "Empty IN ICD from Party" if data.mtin_date else "",
            "mir_date": data.mir_date if data.mir_date else "",
            "mir_time": data.mir_time.strftime("%H:%M") if data.mir_time else "",
            "mir_move_code": (
                "Empty IN ICD plot from Golden Plot" if data.mir_date else ""
            ),
            "mit_date": data.mit_date if data.mit_date else "",
            "mit_time": data.mit_time.strftime("%H:%M") if data.mit_time else "",
            "mit_current_location": data.mit_current_location or "",
            "mit_move_code": (
                "Terminal IN empty (kol) from Nepal rake" if data.mit_date else ""
            ),
            "expin_date": data.expin_date if data.expin_date else "",
            "expin_time": data.expin_time.strftime("%H:%M") if data.expin_time else "",
            "expin_move_code": "Party IN Loaded" if data.expin_date else "",
            "booking_no": data.booking_no or "",
            "seal_no": data.seal_no or "",
            "report": data.report or "",
            "remarks": data.remarks or "",
            "location": data.location.name if data.location else "",
            "site": data.site.name if data.site else "",
        }

    def loaded_yard_out_data(self, data):
        return {
            "pk": data.pk,
            "container_no": data.container_no or "",
            "size": data.type_size or "",
            "port": data.port or "",
            "process_type": data.process_type or "",
            "liner": data.liner_merchant or "",
            "inward_rake": data.inward_rake or "",
            "outward_rake": data.outward_rake or "",
            "out_date": data.dvan_date if data.dvan_date else "",
            "dvan_date": data.dvan_date if data.dvan_date else "",
            "dvan_time": data.dvan_time.strftime("%H:%M") if data.dvan_time else "",
            "dvan_move_code": (
                "Load OUT factory,CFS etc from ICD" if data.dvan_date else ""
            ),
            "van_date": data.van_date if data.van_date else "",
            "van_time": data.van_time.strftime("%H:%M") if data.van_time else "",
            "van_move_code": "Empty Out Party from ICD" if data.van_date else "",
            "mot_date": data.mot_date if data.mot_date else "",
            "mot_time": data.mot_time.strftime("%H:%M") if data.mot_time else "",
            "mot_current_location": data.mot_current_location or "",
            "mot_to_location": data.mot_to_location or "",
            "mot_booking_no": data.mot_booking_no or "",
            "mot_transporter": data.mot_transporter or "",
            "mot_truck_no": data.mot_truck_no or "",
            "mot_to_depot_code": data.mot_to_depot_code or "",
            "mot_move_code": "rake out empty from ICD" if data.mot_date else "",
            "mor_date": data.mor_date if data.mor_date else "",
            "mor_time": data.mor_time.strftime("%H:%M") if data.mor_time else "",
            "mor_current_location": data.mor_current_location or "",
            "mor_to_location": data.mor_to_location or "",
            "mor_booking_no": data.mor_booking_no or "",
            "mor_transporter": data.mor_transporter or "",
            "mor_truck_no": data.mor_truck_no or "",
            "mor_to_depot_code": data.mor_to_depot_code or "",
            "mor_move_code": (
                "Terminal OUT empty (kol) to Golden Plot" if data.mor_date else ""
            ),
            "eot_date": data.eot_date if data.eot_date else "",
            "eot_time": data.eot_time.strftime("%H:%M") if data.eot_time else "",
            "eot_move_code": "Rake Out Loaded" if data.eot_date else "",
            "eot_to_location": data.eot_to_location or "",
            "eot_transporter": data.eot_transporter or "",
            "eot_to_depot_code": data.eot_to_depot_code or "",
            "booking_no": data.booking_no or "",
            "seal_no": data.seal_no or "",
            "report": data.report or "",
            "remarks": data.remarks or "",
            "location": data.location.name if data.location else "",
            "site": data.site.name if data.site else "",
        }

    def get_loaded_yard(self, pk):
        instance = self.get(pk=pk)
        return self.loaded_yard_view(data=instance)

    def client_specific_detail_of_in_container(self, container_no, location, site):
        data = []
        for each in self.filter(
            container_no=container_no,
            process_type="IN",
            location=location,
            site=site,
        ).values(
            "pk",
            "container_no",
            "iit_date",
            "mtin_date",
            "mir_date",
            "mit_date",
            "expin_date",
        ):

            data_dict = {
                "container_no": each["container_no"],
                "move_codes": [],
                "pk": each["pk"],
            }
            if each["iit_date"]:
                data_dict["move_codes"].append("IIT")
            if each["mtin_date"]:
                data_dict["move_codes"].append("MTIN")
            if each["mir_date"]:
                data_dict["move_codes"].append("MIR")
            if each["mit_date"]:
                data_dict["move_codes"].append("MIT")
            if each["expin_date"]:
                data_dict["move_codes"].append("EXPIN")
            data.append(data_dict)
        return {
            "data": data,
            "process_type": "IN",
        }

    def get_detail_of_in_container(self, container_no, location, site):

        date = [
            each.iit_date.strftime("%d/%m/%Y")
            for each in self.filter(
                container_no=container_no,
                process_type="IN",
                location=location,
                site=site,
            )
        ]
        return {
            "container_no": container_no,
            "dates": date,
            "process_type": "IN",
        }

    def client_specific_detail_of_out_container(self, container_no, location, site):
        data = []
        for each in self.filter(
            container_no=container_no,
            process_type="OUT",
            location=location,
            site=site,
        ).values(
            "pk",
            "container_no",
            "dvan_date",
            "van_date",
            "mot_date",
            "mor_date",
            "eot_date",
        ):
            data_dict = {
                "container_no": each["container_no"],
                "move_codes": [],
                "pk": each["pk"],
            }
            if each["dvan_date"]:
                data_dict["move_codes"].append("DVAN")
            if each["van_date"]:
                data_dict["move_codes"].append("VAN")
            if each["mot_date"]:
                data_dict["move_codes"].append("MOT")
            if each["mor_date"]:
                data_dict["move_codes"].append("MOR")
            if each["eot_date"]:
                data_dict["move_codes"].append("EOT")
            data.append(data_dict)
        return {
            "data": data,
            "process_type": "OUT",
        }

    def get_detail_of_out_container(self, container_no, location, site):
        date = [
            each.dvan_date.strftime("%d/%m/%Y")
            for each in self.filter(
                container_no=container_no,
                process_type="OUT",
                location=location,
                site=site,
            )
        ]
        return {"container_no": container_no, "dates": date, "process_type": "OUT"}

    def get_loaded_yard_data_for_in_out(
        self, process, date, container_no, location, site
    ):
        if process == "IN":
            instance = LoadedYard.objects.select_related("location", "site").get(
                container_no=container_no,
                iit_date=date,
                location=location,
                site=site,
            )
            return self.loaded_yard_in_data(data=instance)
        if process == "OUT":
            instance = LoadedYard.objects.select_related("location", "site").get(
                container_no=container_no,
                dvan_date=date,
                location=location,
                site=site,
            )
            return self.loaded_yard_out_data(data=instance)

    def get_move_code_content_by_checkbox(self, stock_id):
        attachment_list = []
        for pk in stock_id:
            stock = self.get(pk=pk)
            if stock.iit_date:
                iit_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="IIT",
                    date=stock.iit_date,
                    time=stock.iit_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(iit_content["content"])
            if stock.dvan_date:
                dvan_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="DVAN",
                    date=stock.dvan_date,
                    time=stock.dvan_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="R",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(dvan_content["content"])

            if stock.mtin_date:
                mtin_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="MTIN",
                    date=stock.mtin_date,
                    time=stock.mtin_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(mtin_content["content"])
            if stock.mir_date:
                mir_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="MIR",
                    date=stock.mir_date,
                    time=stock.mir_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(mir_content["content"])

            if stock.mot_date:
                if stock.site.organization == "Golden Horn Container Service":
                    mot_content = loaded_yard_edi_content(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOT",
                        date=stock.mot_date,
                        time=stock.mot_time,
                        current_location="NPBRG",
                        to_location="INMJ1",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="CONKOL",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                else:
                    mot_content = loaded_yard_edi_content(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOT",
                        date=stock.mot_date,
                        time=stock.mot_time,
                        current_location=stock.mot_current_location,
                        to_location=stock.mot_to_location,
                        booking_no=stock.mot_booking_no,
                        customer="",
                        transporter=stock.mot_transporter,
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                attachment_list.append(mot_content["content"])

            if stock.mit_date:
                if stock.site.organization == "Golden Horn Container Service":
                    mit_content = loaded_yard_edi_content(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MIT",
                        date=stock.mit_date,
                        time=stock.mit_time,
                        current_location="INMJ1",
                        to_location="",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                else:
                    mit_content = loaded_yard_edi_content(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MIT",
                        date=stock.mit_date,
                        time=stock.mit_time,
                        current_location=stock.mit_current_location,
                        to_location="",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                attachment_list.append(mit_content["content"])

            if stock.mor_date:
                if stock.site.organization == "Golden Horn Container Service":
                    mor_content = loaded_yard_edi_content(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOR",
                        date=stock.mor_date,
                        time=stock.mor_time,
                        current_location="INMJ1",
                        to_location="INGHK",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="HRL001",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )
                else:
                    mor_content = loaded_yard_edi_content(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOR",
                        date=stock.mor_date,
                        time=stock.mor_time,
                        current_location=stock.mor_current_location,
                        to_location=stock.mor_to_location,
                        booking_no=stock.mor_booking_no,
                        customer="",
                        transporter=stock.mor_transporter,
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                attachment_list.append(mor_content["content"])

            if stock.van_date:
                van_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="VAN",
                    date=stock.van_date,
                    time=stock.van_time,
                    current_location="NPBRG",
                    to_location="INMJ1",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="CONKOL",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(van_content["content"])
            if stock.expin_date:
                expin_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="EXPIN",
                    date=stock.expin_date,
                    time=stock.expin_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="R",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(expin_content["content"])

            if stock.eot_date:
                eot_content = loaded_yard_edi_content(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="EOT",
                    date=stock.eot_date,
                    time=stock.eot_time,
                    current_location="NPBRG",
                    to_location=stock.eot_to_location,
                    booking_no=stock.booking_no,
                    customer="",
                    transporter=stock.eot_transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport="T",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(eot_content["content"])
        return attachment_list

    def get_data_for_by_date_report(self, param, move_code, process):
        if process == "IN":
            stock = (
                self.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "iit_date",
                    "iit_time",
                    "mtin_date",
                    "mtin_time",
                    "mir_date",
                    "mir_time",
                    "mit_date",
                    "mit_time",
                    "expin_date",
                    "expin_time",
                    "booking_no",
                    "seal_no",
                )
                .order_by("iit_date")
            )
        else:
            stock = (
                self.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "dvan_date",
                    "dvan_time",
                    "van_date",
                    "van_time",
                    "mot_date",
                    "mot_time",
                    "mor_date",
                    "mor_time",
                    "eot_date",
                    "eot_time",
                    "booking_no",
                    "seal_no",
                )
                .order_by("dvan_date")
            )
        attachment_list = []

        for each in stock:
            move_codes = {
                "IIT": ["NPBRG", "", "", ""],
                "DVAN": ["NPBRG", "", "R", ""],
                "MTIN": ["NPBRG", "", "", ""],
                "MIR": ["NPBRG", "", "", ""],
                "MOT": ["NPBRG", "INMJ1", "", "CONKOL"],
                "MIT": ["INMJ1", "", "", ""],
                "MOR": ["INMJ1", "INGHK", "", "HRL001"],
                "VAN": ["NPBRG", "INMJ1", "", "CONKOL"],
                "EXPIN": ["NPBRG", "", "R", ""],
                "EOT": ["NPBRG", "INMJ1", "T", "CONKOL"],
            }
            current_location, to_location, mode_of_transport, transporter = move_codes[
                move_code
            ]
            code = f"{move_code.lower()}"

            if each[f"{code}_date"]:
                edi_content = loaded_yard_edi_content(
                    container_no=each["container_no"],
                    type_size=each["type_size"],
                    move_code=move_code,
                    date=each[f"{code}_date"],
                    time=each[f"{code}_time"],
                    current_location=current_location,
                    to_location=to_location,
                    booking_no=each["booking_no"],
                    customer="",
                    transporter=transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport=mode_of_transport,
                    job_order_no=each["seal_no"],
                )
                attachment_list.append(edi_content["content"])
        return attachment_list

    def get_data_for_by_container_report(self, param, move_code, process):
        if process == "IN":
            stock = (
                self.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "iit_date",
                    "iit_time",
                    "mtin_date",
                    "mtin_time",
                    "mir_date",
                    "mir_time",
                    "mit_date",
                    "mit_time",
                    "expin_date",
                    "expin_time",
                    "booking_no",
                    "seal_no",
                )
                .latest("iit_date")
            )
        else:
            stock = (
                self.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "dvan_date",
                    "dvan_time",
                    "van_date",
                    "van_time",
                    "mot_date",
                    "mot_time",
                    "mor_date",
                    "mor_time",
                    "eot_date",
                    "eot_time",
                    "booking_no",
                    "seal_no",
                )
                .latest("dvan_date")
            )
        attachment_list = []

        move_codes = {
            "IIT": ["NPBRG", "", "", ""],
            "DVAN": ["NPBRG", "", "R", ""],
            "MTIN": ["NPBRG", "", "", ""],
            "MIR": ["NPBRG", "", "", ""],
            "MOT": ["NPBRG", "INMJ1", "", "CONKOL"],
            "MIT": ["INMJ1", "", "", ""],
            "MOR": ["INMJ1", "INGHK", "", "HRL001"],
            "VAN": ["NPBRG", "INMJ1", "", "CONKOL"],
            "EXPIN": ["NPBRG", "", "R", ""],
            "EOT": ["NPBRG", "INMJ1", "T", "CONKOL"],
        }
        current_location, to_location, mode_of_transport, transporter = move_codes[
            move_code
        ]
        code = f"{move_code.lower()}"

        if stock[f"{code}_date"]:
            edi_content = loaded_yard_edi_content(
                container_no=stock["container_no"],
                type_size=stock["type_size"],
                move_code=move_code,
                date=stock[f"{code}_date"],
                time=stock[f"{code}_time"],
                current_location=current_location,
                to_location=to_location,
                booking_no=stock["booking_no"],
                customer="",
                transporter=transporter,
                truck_no="",
                condition="",
                mode_of_transport=mode_of_transport,
                job_order_no=stock["seal_no"],
            )
            attachment_list.append(edi_content["content"])
        return attachment_list

    def client_specific_get_data_for_by_container_report(
        self, param, move_code, process
    ):
        if process == "IN":
            stock = (
                self.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "iit_date",
                    "iit_time",
                    "mtin_date",
                    "mtin_time",
                    "mir_date",
                    "mir_time",
                    "mit_date",
                    "mit_time",
                    "mit_current_location",
                    "expin_date",
                    "expin_time",
                    "booking_no",
                    "seal_no",
                )
                .latest("iit_date")
            )
        else:
            stock = (
                self.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "dvan_date",
                    "dvan_time",
                    "van_date",
                    "van_time",
                    "mot_date",
                    "mot_time",
                    "mot_current_location",
                    "mot_to_location",
                    "mot_booking_no",
                    "mot_transporter",
                    "mot_to_depot_code",
                    "mot_truck_no",
                    "mor_date",
                    "mor_time",
                    "mor_current_location",
                    "mor_to_location",
                    "mor_booking_no",
                    "mor_transporter",
                    "mor_to_depot_code",
                    "mor_truck_no",
                    "eot_date",
                    "eot_time",
                    "eot_to_location",
                    "eot_transporter",
                    "eot_to_depot_code",
                    "booking_no",
                    "seal_no",
                )
                .latest("dvan_date")
            )
        attachment_list = []
        move_codes = {
            "IIT": ["NPBRG", "", "", ""],
            "DVAN": ["NPBRG", "", "R", ""],
            "MTIN": ["NPBRG", "", "", ""],
            "MIR": ["NPBRG", "", "", ""],
            "MOT": ["NPBRG", "INMJ1", "", "CONKOL"],
            "MIT": ["INMJ1", "", "", ""],
            "MOR": ["INMJ1", "INGHK", "", "HRL001"],
            "VAN": ["NPBRG", "INMJ1", "", "CONKOL"],
            "EXPIN": ["NPBRG", "", "R", ""],
            "EOT": ["NPBRG", "INMJ1", "T", "CONKOL"],
        }
        current_location, to_location, mode_of_transport, transporter = move_codes[
            move_code
        ]
        code = f"{move_code.lower()}"

        if stock[f"{code}_date"]:
            if move_code in ["MOT", "MOR"]:
                booking_no = stock[f"{code}_booking_no"]
            else:
                booking_no = stock["booking_no"]
            if move_code == "MIT":
                current_location = stock["mit_current_location"]
            if move_code in ["MOT", "MOR"]:
                current_location = stock[f"{code}_current_location"]
                to_location = stock[f"{code}_to_location"]
                transporter = stock[f"{code}_transporter"]
            edi_content = loaded_yard_edi_content(
                container_no=stock["container_no"],
                type_size=stock["type_size"],
                move_code=move_code,
                date=stock[f"{code}_date"],
                time=stock[f"{code}_time"],
                current_location=current_location,
                to_location=to_location,
                booking_no=booking_no,
                customer="",
                transporter=transporter,
                truck_no="",
                condition="",
                mode_of_transport=mode_of_transport,
                job_order_no=stock["seal_no"],
            )
            attachment_list.append(edi_content["content"])
        return attachment_list

    def get_edi_report(self, data, location, site):
        from_date = data.get("from_date")
        to_date = data.get("to_date")
        from_date_obj = (
            datetime.strptime(from_date, "%Y-%m-%d").date() if from_date else None
        )
        to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date() if to_date else None
        from_time = data.get("from_time")
        to_time = data.get("to_time")
        from_time_obj = (
            datetime.strptime(from_time, "%H:%M").time() if from_time else None
        )
        to_time_obj = datetime.strptime(to_time, "%H:%M").time() if to_time else None
        container_no = data.get("container_no")
        process = data.get("process")
        move_code = data.get("move_code")

        param = {}
        if process == "IN":
            param["process_type"] = "IN"
        else:
            param["process_type"] = "OUT"
        if from_date and to_date:
            if process == "IN":
                param["iit_date__range"] = (from_date_obj, to_date_obj)
                if from_time_obj and to_time_obj:
                    param["iit_time__range"] = (from_time_obj, to_time_obj)
            else:
                param["dvan_date__range"] = (from_date_obj, to_date_obj)
                if from_time_obj and to_time_obj:
                    param["dvan_time__range"] = (from_time_obj, to_time_obj)
        if container_no:
            param["container_no"] = container_no
        if location:
            param["location"] = location
        if site:
            param["site"] = site

        if site.organization == "Golden Horn Containers Service":
            if container_no:
                attachment_list = self.get_data_for_by_container_report(
                    param, move_code, process
                )
            else:
                attachment_list = self.get_data_for_by_date_report(
                    param, move_code, process
                )
        else:
            attachment_list = self.client_specific_get_data_for_by_container_report(
                param, move_code, process
            )

        edi_content = "".join(attachment_list)
        return edi_content

    def update_instance(self, data):
        try:
            instance = self.get(pk=data["pk"])
            instance.container_no = data["container_no"]
            instance.type_size = data["size"]
            instance.port = data["port"]
            instance.process_type = data["process_type"]
            instance.liner_merchant = data["liner"]
            instance.inward_rake = data["inward_rake"]
            instance.outward_rake = data["outward_rake"]
            instance.booking_no = data["booking_no"]
            instance.seal_no = data["seal_no"]
            instance.report = data["report"]
            instance.remarks = data["remarks"]

            if data["process_type"] == "IN":
                iit_date, iit_time = get_date_time_obj(
                    date_str=data["iit_date"], time_str=data["iit_time"]
                )

                mtin_date, mtin_time = get_date_time_obj(
                    date_str=data["mtin_date"], time_str=data["mtin_time"]
                )

                mir_date, mir_time = get_date_time_obj(
                    date_str=data["mir_date"], time_str=data["mir_time"]
                )

                mit_date, mit_time = get_date_time_obj(
                    date_str=data["mit_date"], time_str=data["mit_time"]
                )

                expin_date, expin_time = get_date_time_obj(
                    date_str=data["expin_date"], time_str=data["expin_time"]
                )

                instance.iit_date = iit_date
                instance.iit_time = iit_time
                instance.mtin_date = mtin_date
                instance.mtin_time = mtin_time
                instance.mir_date = mir_date
                instance.mir_time = mir_time
                instance.mit_date = mit_date
                instance.mit_time = mit_time
                instance.expin_date = expin_date
                instance.expin_time = expin_time
                if instance.site.organization != "Golden Horn Containers Service":
                    instance.mit_current_location = data["mit_current_location"]

            if data["process_type"] == "OUT":
                dvan_date, dvan_time = get_date_time_obj(
                    date_str=data["dvan_date"], time_str=data["dvan_time"]
                )

                van_date, van_time = get_date_time_obj(
                    date_str=data["van_date"], time_str=data["van_time"]
                )

                mot_date, mot_time = get_date_time_obj(
                    date_str=data["mot_date"], time_str=data["mot_time"]
                )

                mor_date, mor_time = get_date_time_obj(
                    date_str=data["mor_date"], time_str=data["mor_time"]
                )

                eot_date, eot_time = get_date_time_obj(
                    date_str=data["eot_date"], time_str=data["eot_time"]
                )
                instance.dvan_date = dvan_date
                instance.dvan_time = dvan_time
                instance.van_date = van_date
                instance.van_time = van_time
                instance.mot_date = mot_date
                instance.mot_time = mot_time
                instance.mor_date = mor_date
                instance.mor_time = mor_time
                instance.eot_date = eot_date
                instance.eot_time = eot_time
                if instance.site.organization != "Golden Horn Containers Service":
                    instance.mot_current_location = data["mot_current_location"]
                    instance.mot_to_location = data["mot_to_location"]
                    instance.mot_booking_no = data["mot_booking_no"]
                    instance.mot_transporter = data["mot_transporter"]
                    instance.mot_truck_no = data["mot_truck_no"]
                    instance.mot_to_depot_code = data["mot_to_depot_code"]
                    instance.mor_current_location = data["mor_current_location"]
                    instance.mor_to_location = data["mor_to_location"]
                    instance.mor_booking_no = data["mor_booking_no"]
                    instance.mor_transporter = data["mor_transporter"]
                    instance.mor_truck_no = data["mor_truck_no"]
                    instance.mor_to_depot_code = data["mor_to_depot_code"]
                    instance.eot_to_location = data["eot_to_location"]
                    instance.eot_transporter = data["eot_transporter"]
                    instance.eot_to_depot_code = data["eot_to_depot_code"]
            instance.save()
            return instance
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())

    def get_client_specific_container_data(self, pk):
        instance = self.get(pk=pk)
        if instance.process_type == "IN":
            return self.loaded_yard_in_data(data=instance)
        else:
            return self.loaded_yard_out_data(data=instance)

    def client_specific_validate_move_codes(self, data):
        try:
            move_codes = []
            if data["process_type"] == "IN":
                for date_field, move_code in [
                    ("iit_date", "IIT"),
                    ("mtin_date", "MTIN"),
                    ("mir_date", "MIR"),
                    ("mit_date", "MIT"),
                    ("expin_date", "EXPIN"),
                ]:
                    if data[date_field]:
                        date_obj = datetime.strptime(
                            data[date_field], "%Y-%m-%d"
                        ).date()
                        if (
                            self.filter(
                                container_no=data["container_no"],
                                **{date_field: date_obj},
                                location__name=data["location"],
                                site__name=data["site"],
                            )
                            .exclude(pk=data["pk"])
                            .exists()
                        ):
                            move_codes.append(move_code)
            else:
                for date_field, move_code in [
                    ("dvan_date", "DVAN"),
                    ("mot_date", "MOT"),
                    ("mor_date", "MOR"),
                    ("van_date", "VAN"),
                    ("eot_date", "EOT"),
                ]:
                    if data[date_field]:
                        date_obj = datetime.strptime(
                            data[date_field], "%Y-%m-%d"
                        ).date()
                        if (
                            self.filter(
                                container_no=data["container_no"],
                                **{date_field: date_obj},
                                location__name=data["location"],
                                site__name=data["site"],
                            )
                            .exclude(pk=data["pk"])
                            .exists()
                        ):
                            move_codes.append(move_code)

            return move_codes
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())


class LoadedYard(models.Model):
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    container_no = models.CharField(max_length=200, blank=True, null=True)
    process_type = models.CharField(
        max_length=100, null=True, blank=False, choices=TYPE
    )
    type_size = models.CharField(max_length=100, blank=True, null=True)
    port = models.CharField(max_length=200, blank=True, null=True)
    liner_merchant = models.CharField(max_length=200, blank=True, null=True)
    inward_rake = models.CharField(max_length=200, blank=True, null=True)
    outward_rake = models.CharField(max_length=200, blank=True, null=True)
    iit_date = models.DateField(null=True, blank=True)
    iit_time = models.TimeField(null=True, blank=True)
    iit_is_sent = models.BooleanField(null=True, blank=True, default=False)
    iit_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    dvan_date = models.DateField(null=True, blank=True)
    dvan_time = models.TimeField(null=True, blank=True)
    dvan_is_sent = models.BooleanField(null=True, blank=True, default=False)
    dvan_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    mtin_date = models.DateField(null=True, blank=True)
    mtin_time = models.TimeField(null=True, blank=True)
    mtin_is_sent = models.BooleanField(null=True, blank=True, default=False)
    mtin_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    van_date = models.DateField(null=True, blank=True)
    van_time = models.TimeField(null=True, blank=True)
    van_is_sent = models.BooleanField(null=True, blank=True, default=False)
    van_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    mir_date = models.DateField(null=True, blank=True)
    mir_time = models.TimeField(null=True, blank=True)
    mir_is_sent = models.BooleanField(null=True, blank=True, default=False)
    mir_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    mot_date = models.DateField(null=True, blank=True)
    mot_time = models.TimeField(null=True, blank=True)
    mot_is_sent = models.BooleanField(null=True, blank=True, default=False)
    mot_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    mot_current_location = models.CharField(max_length=200, blank=True, null=True)
    mot_to_location = models.CharField(max_length=200, blank=True, null=True)
    mot_booking_no = models.CharField(max_length=200, blank=True, null=True)
    mot_transporter = models.CharField(max_length=200, blank=True, null=True)
    mot_truck_no = models.CharField(max_length=200, blank=True, null=True)
    mot_to_depot_code = models.CharField(max_length=200, blank=True, null=True)
    mit_date = models.DateField(null=True, blank=True)
    mit_time = models.TimeField(null=True, blank=True)
    mit_is_sent = models.BooleanField(null=True, blank=True, default=False)
    mit_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    mit_current_location = models.CharField(max_length=200, blank=True, null=True)
    mor_date = models.DateField(null=True, blank=True)
    mor_time = models.TimeField(null=True, blank=True)
    mor_is_sent = models.BooleanField(null=True, blank=True, default=False)
    mor_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    mor_current_location = models.CharField(max_length=200, blank=True, null=True)
    mor_to_location = models.CharField(max_length=200, blank=True, null=True)
    mor_booking_no = models.CharField(max_length=200, blank=True, null=True)
    mor_transporter = models.CharField(max_length=200, blank=True, null=True)
    mor_truck_no = models.CharField(max_length=200, blank=True, null=True)
    mor_to_depot_code = models.CharField(max_length=200, blank=True, null=True)
    expin_date = models.DateField(null=True, blank=True)
    expin_time = models.TimeField(null=True, blank=True)
    expin_is_sent = models.BooleanField(null=True, blank=True, default=False)
    expin_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    eot_date = models.DateField(null=True, blank=True)
    eot_time = models.TimeField(null=True, blank=True)
    eot_is_sent = models.BooleanField(null=True, blank=True, default=False)
    eot_is_tracked = models.BooleanField(null=True, blank=True, default=False)
    eot_to_location = models.CharField(max_length=200, blank=True, null=True)
    eot_to_depot_code = models.CharField(max_length=200, blank=True, null=True)
    eot_transporter = models.CharField(max_length=200, blank=True, null=True)
    booking_no = models.CharField(max_length=200, blank=True, null=True)
    seal_no = models.CharField(max_length=200, blank=True, null=True)
    report = models.CharField(max_length=200, blank=True, null=True)
    remarks = models.CharField(max_length=200, blank=True, null=True)
    location = models.ForeignKey(
        Location,
        related_name="loaded_yard_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="loaded_yard_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    objects = LoadedYardManager()

    def __str__(self):
        return self.container_no

    def get_loaded_yard_data(self):
        try:
            data = {
                "pk": self.pk,
                "container_no": self.container_no,
                "size": self.type_size if self.type_size else "",
                "port": self.port if self.port else "",
                "process_type": self.process_type if self.process_type else "",
                "liner": self.liner_merchant if self.liner_merchant else "",
                "inward_rake": self.inward_rake if self.inward_rake else "",
                "outward_rake": self.outward_rake if self.outward_rake else "",
                "in_date": self.iit_date if self.iit_date else "",
                "out_date": self.dvan_date if self.dvan_date else "",
                "iit_date": self.iit_date if self.iit_date else "",
                "iit_time": self.iit_time.strftime("%H:%M") if self.iit_time else "",
                "iit_move_code": "Loaded IN ICD" if self.iit_date else "",
                "dvan_date": self.dvan_date if self.dvan_date else "",
                "dvan_time": self.dvan_time.strftime("%H:%M") if self.dvan_time else "",
                "dvan_move_code": (
                    "Load OUT factory,CFS etc from ICD" if self.dvan_date else ""
                ),
                "mtin_date": self.mtin_date if self.mtin_date else "",
                "mtin_time": self.mtin_time.strftime("%H:%M") if self.mtin_time else "",
                "mtin_move_code": "Empty IN ICD from Party" if self.mtin_date else "",
                "van_date": self.van_date if self.van_date else "",
                "van_time": self.van_time.strftime("%H:%M") if self.van_time else "",
                "van_move_code": "Empty Out Party from ICD" if self.van_date else "",
                "mir_date": self.mir_date if self.mir_date else "",
                "mir_time": self.mir_time.strftime("%H:%M") if self.mir_time else "",
                "mir_move_code": (
                    "Empty IN ICD plot from Golden Plot" if self.mir_date else ""
                ),
                "mot_date": self.mot_date if self.mot_date else "",
                "mot_time": self.mot_time.strftime("%H:%M") if self.mot_time else "",
                "mot_move_code": "rake out empty from ICD" if self.mot_date else "",
                "mit_date": self.mit_date if self.mit_date else "",
                "mit_time": self.mit_time.strftime("%H:%M") if self.mit_time else "",
                "mit_move_code": (
                    "Terminal IN empty (kol) from Nepal rake" if self.mit_date else ""
                ),
                "mor_date": self.mor_date if self.mor_date else "",
                "mor_time": self.mor_time.strftime("%H:%M") if self.mor_time else "",
                "mor_move_code": (
                    "Terminal OUT empty (kol) to Golden Plot" if self.mor_date else ""
                ),
                "expin_date": self.expin_date if self.expin_date else "",
                "expin_time": (
                    self.expin_time.strftime("%H:%M") if self.expin_time else ""
                ),
                "expin_move_code": "Party IN Loaded" if self.expin_date else "",
                "eot_date": self.eot_date if self.eot_date else "",
                "eot_time": self.eot_time.strftime("%H:%M") if self.eot_time else "",
                "eot_move_code": "Rake Out Loaded" if self.eot_date else "",
                "booking_no": self.booking_no if self.booking_no else "",
                "seal_no": self.seal_no if self.seal_no else "",
                "report": self.report if self.report else "",
                "remarks": self.remarks if self.remarks else "",
                "location": self.location.name if self.location else "",
                "site": self.site.name if self.site else "",
            }
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


LY_MOVECODE = [
    ("IIT", "IIT"),
    ("MTIN", "MTIN"),
    ("EXPIN", "EXPIN"),
    ("MIR", "MIR"),
    ("MIT", "MIT"),
    ("DVAN", "DVAN"),
    ("MOT", "MOT"),
    ("MOR", "MOR"),
    ("VAN", "VAN"),
    ("EOT", "EOT"),
]

LY_EXCEL_MOVECODE = [
    ("IDR", "IDR"),
    ("MCY", "MCY"),
    ("ERY", "ERY"),
    ("MPI", "MPI"),
    ("MDR", "MDR"),
    ("ICO", "ICO"),
    ("MLR", "MLR"),
    ("MPO", "MPO"),
    ("MSH", "MSH"),
    ("ELR", "ELR"),
]


class LyExcelEdiMailTracker(models.Model):
    email_date = models.DateTimeField(null=True, blank=True, default=timezone.now)
    container_no = models.CharField(max_length=100, null=True, blank=True)
    site = models.CharField(max_length=100, null=True, blank=True)
    data_id = models.CharField(max_length=100, null=True, blank=True)
    move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=LY_MOVECODE
    )
    excel_move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=LY_EXCEL_MOVECODE
    )

    def __str__(self):
        return str(self.pk)

    def get_tracked_detail(self):
        try:
            data = {"pk": self.pk}

            if self.email_date is None:
                data["email_date"] = ""
            else:
                data["email_date"] = self.email_date.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M")

            if self.container_no is None:
                data["container_no"] = ""
            else:
                data["container_no"] = self.container_no

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site

            if self.move_code is None:
                data["move_code"] = ""
            else:
                data["move_code"] = self.move_code

            if self.excel_move_code is None:
                data["excel_move_code"] = ""
            else:
                data["excel_move_code"] = self.excel_move_code
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
