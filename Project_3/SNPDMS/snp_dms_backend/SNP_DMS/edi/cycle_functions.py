from .data_collecter_functions import *
from .format_functions import *
from depot.models import GateInHistory, GateOutHistory
import datetime
from django.utils import timezone
from .models import *
from master.models_two import Client
from master.models import Site
from django.db import connections
import logging, traceback
from non_depot.models import NonDepotGateIn, NonDepotGateOut

# def get_edi_data():
#     try:
#         data = {}
#         now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
#         hour_before = now - datetime.timedelta(hours=1)

#         in_data = GateInHistory.objects.filter(date__range=(hour_before, now))

#         out_data = GateOutHistory.objects.filter(date__range=(hour_before, now))

#         # in_data = GateInHistory.objects.all()
#         # out_data = GateOutHistory.objects.all()

#         in_out_merge_list = list(in_data) + list(out_data)
#         edi_process_main_data = [
#             each for each in in_out_merge_list if is_edi_enabled(each) is True
#         ]
#         for each in edi_process_main_data:
#             line = detect_line(each)
#             if line in data.keys():
#                 data[line].append(each)
#             else:
#                 data[line] = [each]
#         return data
#     except:
#         return None


def get_msc_in_excel_edi_data():
    try:
        main_data = {}
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        last_30_days = now - datetime.timedelta(days=30)
        created_before = now - datetime.timedelta(minutes=30)
        connection_list = [each for each in connections if not each == "analytics"]
        site_list = [
            "INGHK",
            "INGHC",
            "AHMEDABAD",
            "SANAND",
            "ANKELESHWAR",
            "VARNAMA",
            "TUTICORIN",
            "MATRIX",
            "BIRGUNJ",
            "HEMC HALDIA",
            "HEMC KOLKATA",
            "PGL DEPOT",
            # "OM SHAILSHUTA LPL DEPOT",
            # "OMSSGRFL SAHNEWAL",
            "GOLDEN HORN CONTAINER SERVICE MUNDRA",
            "SATTVA CFS",
            "CHEKLA CONTAINER YARD",
            "GOLDEN HORN CONTAINER SERVICES TWO KOLKATA",
        ]

        for connection in connection_list:
            in_data = list(
                GateInHistory.objects.using(connection)
                .filter(
                    date__range=(last_30_days, now),
                    created_at__lte=created_before,
                    container__client__ref_code="MSC",
                    is_msc_excel_edi_sent=False,
                    container__site__name__in=site_list,
                )
                .exclude(
                    container__site__depot_msc_code=None,
                    container__site__event_location_msc_code=None,
                )
            )
            edi_process_main_data = in_data
            main_data[connection] = edi_process_main_data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_msc_out_excel_edi_data():
    try:
        main_data = {}
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        last_30_days = now - datetime.timedelta(days=30)
        created_before = now - datetime.timedelta(minutes=30)
        connection_list = [each for each in connections if not each == "analytics"]
        site_list = [
            "INGHK",
            "INGHC",
            "AHMEDABAD",
            "SANAND",
            "ANKELESHWAR",
            "VARNAMA",
            "TUTICORIN",
            "MATRIX",
            "BIRGUNJ",
            "HEMC HALDIA",
            "HEMC KOLKATA",
            "PGL DEPOT",
            # "OM SHAILSHUTA LPL DEPOT",
            # "OMSSGRFL SAHNEWAL",
            "GOLDEN HORN CONTAINER SERVICE MUNDRA",
            "SATTVA CFS",
            "CHEKLA CONTAINER YARD",
            "GOLDEN HORN CONTAINER SERVICES TWO KOLKATA",
        ]
        for connection in connection_list:
            out_data = list(
                GateOutHistory.objects.using(connection)
                .filter(
                    date__range=(last_30_days, now),
                    created_at__lte=created_before,
                    container__client__ref_code="MSC",
                    is_msc_excel_edi_sent=False,
                    container__site__name__in=site_list,
                )
                .exclude(
                    container__site__depot_msc_code=None,
                    container__site__event_location_msc_code=None,
                )
            )
            edi_process_main_data = out_data
            main_data[connection] = edi_process_main_data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_faridabad_msc_in_excel_edi_data():
    try:
        main_data = []
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        twenty_four_hour_before = now - datetime.timedelta(hours=48)
        twenty_four_hour_before = twenty_four_hour_before.astimezone(
            timezone.get_current_timezone()
        )
        date_now = now.date().strftime("%Y-%m-%d")
        date_24_hour = twenty_four_hour_before.date().strftime("%Y-%m-%d")
        in_data = list(
            NonDepotGateIn.objects.filter(
                in_date__range=[date_24_hour, date_now],
                container__location__name="HARYANA",
                container__site__name="FARIDABAD",
                container__client__ref_code="MSC",
                is_msc_excel_edi_sent=False,
            )
        )

        main_data = in_data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_faridabad_msc_out_excel_edi_data():
    try:
        main_data = []
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        twenty_four_hour_before = now - datetime.timedelta(hours=48)
        twenty_four_hour_before = twenty_four_hour_before.astimezone(
            timezone.get_current_timezone()
        )
        date_now = now.date().strftime("%Y-%m-%d")
        date_24_hour = twenty_four_hour_before.date().strftime("%Y-%m-%d")
        out_data = list(
            NonDepotGateOut.objects.filter(
                out_date__range=[date_24_hour, date_now],
                container__location__name="HARYANA",
                container__site__name="FARIDABAD",
                container__client__ref_code="MSC",
                is_msc_excel_edi_sent=False,
            )
        )
        main_data = out_data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_edi_data():
    try:
        main_data = {}
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        last_30_days = now - datetime.timedelta(days=30)
        created_before = now - datetime.timedelta(minutes=30)
        connection_list = [each for each in connections if not each == "analytics"]

        for connection in connection_list:
            data = {}
            in_data = []
            out_data = []

            for each_in_data in (
                GateInHistory.objects.using(connection)
                .filter(
                    date__range=(last_30_days, now),
                    created_at__lte=created_before,
                    container__client__edi_service=True,
                    is_email_sent=False,
                )
                .exclude(container__client__edi_to_email_id=None)
            ):
                in_data.append(each_in_data)
            for each_out_data in (
                GateOutHistory.objects.using(connection)
                .filter(
                    date__range=(last_30_days, now),
                    created_at__lte=created_before,
                    container__client__edi_service=True,
                    is_email_sent=False,
                )
                .exclude(container__client__edi_to_email_id=None)
            ):
                out_data.append(each_out_data)

            edi_process_main_data = in_data + out_data

            for each in edi_process_main_data:
                line = detect_line(each)
                if line in data.keys():
                    data[line].append(each)
                else:
                    data[line] = [each]

            main_data[connection] = data

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_cma_rwm_edi_data():
    try:
        main_data = {}
        connection_list = [each for each in connections if not each == "analytics"]
        for connection in connection_list:
            stock_data = []
            data = {}
            for each_in_data in (
                ContainerStock.objects.using(connection)
                .filter(
                    container__client__edi_service=True,
                    container__client__ref_code="CMA",
                    container__status="IN",
                    container_status="IN",
                    is_rwm_edi_sent=False,
                )
                .exclude(container__client__edi_to_email_id=None, available_date=None)
            ):
                stock_data.append(each_in_data)

            for each in stock_data:
                if each.status in ["Available", "Alloted", "Without_Repair_Available"]:
                    line = detect_line(each)
                    if line in data.keys():
                        data[line].append(each)
                    else:
                        data[line] = [each]

            main_data[connection] = data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def get_not_emailed_edi_data():
#     try:
#         data = {}
#         now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
#         twenty_four_hour_before = now - datetime.timedelta(hours=24)

#         in_data = GateInHistory.objects.filter(
#             date__range=(twenty_four_hour_before, now), is_email_sent=False
#         )

#         out_data = GateOutHistory.objects.filter(
#             date__range=(twenty_four_hour_before, now), is_email_sent=False
#         )

#         # in_data = GateInHistory.objects.all()
#         # out_data = GateOutHistory.objects.all()

#         in_out_merge_list = list(in_data) + list(out_data)
#         edi_process_main_data = [
#             each for each in in_out_merge_list if is_edi_enabled(each) is True
#         ]
#         for each in edi_process_main_data:
#             line = detect_line(each)
#             if line in data.keys():
#                 data[line].append(each)
#             else:
#                 data[line] = [each]
#         return data
#     except:
#         return None


def get_not_emailed_edi_data():
    try:
        main_data = {}
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        twenty_four_hour_before = now - datetime.timedelta(hours=24)
        connection_list = [each for each in connections if not each == "analytics"]

        for connection in connection_list:
            data = {}
            in_data = []
            out_data = []

            for each_in_data in GateInHistory.objects.using(connection).filter(
                date__range=(twenty_four_hour_before, now), is_email_sent=False
            ):
                in_data.append(each_in_data)

            for each_out_data in GateOutHistory.objects.using(connection).filter(
                date__range=(twenty_four_hour_before, now), is_email_sent=False
            ):
                out_data.append(each_out_data)

            in_out_merge_list = in_data + out_data

            edi_process_main_data = [
                each for each in in_out_merge_list if is_edi_enabled(each) is True
            ]

            for each in edi_process_main_data:
                line = detect_line(each)
                if line in data.keys():
                    data[line].append(each)
                else:
                    data[line] = [each]

            main_data[connection] = data

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_site_wise_line_data(line_data):
    data = {}
    for each in line_data:
        site = detect_site(each)
        if site in data.keys():
            data[site].append(each)
        else:
            data[site] = [each]
    return data


def get_line_wise_data(data_list):
    data = {}
    for each in data_list:
        line = detect_line(each)
        if line in data.keys():
            data[line].append(each)
        else:
            data[line] = [each]
    return data


def get_seperated_in_out_data(data_list):
    in_data_list = []
    out_data_list = []
    for each in data_list:
        try:
            gate_in = each.gate_in
            in_data_list.append(each)
        except:
            out_data_list.append(each)

    data = {"in_data_dict": in_data_list, "out_data_dict": out_data_list}
    return data


def make_cma_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        list_of_mei_content = []
        count = 0

        in_pk_list = {}
        out_pk_list = {}

        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                cma_content_data = cma_edi_line_in_content_data(each)
                line_in_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                line_in_date = cma_content_data["date"]
                line_in_time = cma_content_data["time"]
                line_in_size_code = cma_content_data["size_code"]
                line_in_container_no = cma_content_data["container_no"]
                line_in_location_code = cma_content_data["location_code"]
                line_in_booking_no = cma_content_data["booking_no"]
                line_in_merged_data = cma_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    # location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                line_in_merged_mei_data = mei_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                list_of_content.append(line_in_merged_data)
                list_of_mei_content.append(line_in_merged_mei_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                cma_content_data = cma_edi_line_out_content_data(each)
                line_out_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                line_out_date = cma_content_data["date"]
                line_out_time = cma_content_data["time"]
                line_out_size_code = cma_content_data["size_code"]
                line_out_container_no = cma_content_data["container_no"]
                # line_out_location_code = cma_content_data["location_code"]
                line_out_booking_no = cma_content_data["booking_no"]
                line_out_merged_data = cma_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    # location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                cma_content_data = cma_edi_party_in_content_data(each)
                party_in_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                party_in_date = cma_content_data["date"]
                party_in_time = cma_content_data["time"]
                party_in_size_code = cma_content_data["size_code"]
                party_in_container_no = cma_content_data["container_no"]
                party_in_location_code = cma_content_data["location_code"]
                party_in_booking_no = cma_content_data["booking_no"]
                party_in_merged_data = cma_edi_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    # location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                party_in_merged_mei_data = mei_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                list_of_content.append(party_in_merged_data)
                list_of_mei_content.append(party_in_merged_mei_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                cma_content_data = cma_edi_party_out_content_data(each)
                party_out_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                party_out_date = cma_content_data["date"]
                party_out_time = cma_content_data["time"]
                party_out_size_code = cma_content_data["size_code"]
                party_out_container_no = cma_content_data["container_no"]
                # party_out_location_code = cma_content_data["location_code"]
                party_out_booking_no = cma_content_data["booking_no"]
                party_out_merged_data = cma_edi_party_out_content_format(
                    current_location_code=party_out_current_location_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    # location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = cma_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "cma",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        if not len(list_of_mei_content) == 0:
            mei_content = "\n".join(list_of_mei_content)
            formatted_mei_data = mei_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=mei_content,
            )
            main_data["mei_data"] = {
                "ref_code": "cma",
                "site_code": hf_site_code,
                "date": hf_date,
                "time": hf_time,
                "content": formatted_mei_data,
            }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_cma_mir_rwm_edi(data, regenerate=False):
    try:
        hf_data = edi_hf_data(data[0])
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        pk_list = []

        for each in data:
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                list_of_content = []
                cma_content_data = cma_edi_line_in_content_data(each, mir=True)
                line_in_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                line_in_date = cma_content_data["date"]
                line_in_time = cma_content_data["time"]
                line_in_size_code = cma_content_data["size_code"]
                line_in_container_no = cma_content_data["container_no"]
                line_in_location_code = cma_content_data["location_code"]
                line_in_booking_no = cma_content_data["booking_no"]
                mir_date_time = cma_content_data["mir_date_time"]

                line_in_merged_data = cma_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=1,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    # location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                    mir=True,
                )
                list_of_content.append(line_in_merged_data)
                content = "\n".join(list_of_content)
                formatted_edi_data = cma_edi_hf_format(
                    current_location_code=hf_current_location_code,
                    line=hf_line,
                    date=hf_date,
                    time=hf_time,
                    site_code=hf_site_code,
                    no_of_containers=1,
                    content=content,
                )
                site = detect_site(each)
                stock_data = ContainerStock.objects.using(db).get(
                    container=each.container, gate_in=each.gate_in
                )
                obj, created = CmaEdiContent.objects.using(db).get_or_create(
                    date=mir_date_time,
                    container_no=line_in_container_no,
                    content=formatted_edi_data,
                    process="line_in",
                    move_code="MIR",
                    site=site,
                    is_deleted=False,
                    is_regenerated=regenerate,
                    stock_data_id=stock_data.pk,
                )
                pk_list.append(obj.pk)

            elif process == "Party_IN_Process":
                list_of_content = []
                cma_content_data = cma_edi_party_in_content_data(
                    each,
                    mir=True,
                )
                party_in_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                party_in_date = cma_content_data["date"]
                party_in_time = cma_content_data["time"]
                party_in_size_code = cma_content_data["size_code"]
                party_in_container_no = cma_content_data["container_no"]
                party_in_location_code = cma_content_data["location_code"]
                party_in_booking_no = cma_content_data["booking_no"]
                mir_date_time = cma_content_data["mir_date_time"]
                party_in_merged_data = cma_edi_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=1,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    # location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                    mir=True,
                )
                list_of_content.append(party_in_merged_data)
                content = "\n".join(list_of_content)
                formatted_edi_data = cma_edi_hf_format(
                    current_location_code=hf_current_location_code,
                    line=hf_line,
                    date=hf_date,
                    time=hf_time,
                    site_code=hf_site_code,
                    no_of_containers=1,
                    content=content,
                )
                site = detect_site(each)
                stock_data = ContainerStock.objects.using(db).get(
                    container=each.container, gate_in=each.gate_in
                )
                obj, created = CmaEdiContent.objects.using(db).get_or_create(
                    date=mir_date_time,
                    container_no=party_in_container_no,
                    content=formatted_edi_data,
                    process="party_in",
                    move_code="MIR",
                    site=site,
                    is_deleted=False,
                    is_regenerated=regenerate,
                    stock_data_id=stock_data.pk,
                )
                pk_list.append(obj.pk)
            else:
                pass

            if process == "Line_OUT_Process":
                list_of_content = []
                cma_content_data = cma_edi_line_out_content_data(each, rwm=True)
                line_out_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                line_out_date = cma_content_data["date"]
                line_out_time = cma_content_data["time"]
                line_out_size_code = cma_content_data["size_code"]
                line_out_container_no = cma_content_data["container_no"]
                # line_out_location_code = cma_content_data["location_code"]
                line_out_booking_no = cma_content_data["booking_no"]
                rwm_date_time = cma_content_data["rwm_date_time"]
                line_out_merged_data = cma_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=1,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    # location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                    rwm=True,
                )
                list_of_content.append(line_out_merged_data)
                content = "\n".join(list_of_content)
                formatted_edi_data = cma_edi_hf_format(
                    current_location_code=hf_current_location_code,
                    line=hf_line,
                    date=hf_date,
                    time=hf_time,
                    site_code=hf_site_code,
                    no_of_containers=1,
                    content=content,
                )
                site = detect_site(each)
                stock_data = ContainerStock.objects.using(db).get(
                    container=each.container, gate_out=each.gate_out
                )
                obj, created = CmaEdiContent.objects.using(db).get_or_create(
                    date=rwm_date_time,
                    container_no=line_out_container_no,
                    content=formatted_edi_data,
                    process="line_out",
                    move_code="RWM",
                    site=site,
                    is_deleted=False,
                    is_regenerated=regenerate,
                    stock_data_id=stock_data.pk,
                )
                stock_data.is_rwm_edi_sent = True
                stock_data.save(using=db)
                pk_list.append(obj.pk)

            elif process == "Party_OUT_Process":
                list_of_content = []
                cma_content_data = cma_edi_party_out_content_data(
                    each,
                    rwm=True,
                )
                party_out_current_location_code = cma_content_data[
                    "current_location_code"
                ]
                party_out_date = cma_content_data["date"]
                party_out_time = cma_content_data["time"]
                party_out_size_code = cma_content_data["size_code"]
                party_out_container_no = cma_content_data["container_no"]
                # party_out_location_code = cma_content_data["location_code"]
                party_out_booking_no = cma_content_data["booking_no"]
                rwm_date_time = cma_content_data["rwm_date_time"]
                party_out_merged_data = cma_edi_party_out_content_format(
                    current_location_code=party_out_current_location_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=1,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    # location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                    rwm=True,
                )
                list_of_content.append(party_out_merged_data)
                content = "\n".join(list_of_content)
                formatted_edi_data = cma_edi_hf_format(
                    current_location_code=hf_current_location_code,
                    line=hf_line,
                    date=hf_date,
                    time=hf_time,
                    site_code=hf_site_code,
                    no_of_containers=1,
                    content=content,
                )
                site = detect_site(each)
                stock_data = ContainerStock.objects.using(db).get(
                    container=each.container, gate_out=each.gate_out
                )
                obj, created = CmaEdiContent.objects.using(db).get_or_create(
                    date=rwm_date_time,
                    container_no=party_out_container_no,
                    content=formatted_edi_data,
                    process="party_out",
                    move_code="RWM",
                    site=site,
                    is_deleted=False,
                    is_regenerated=regenerate,
                    stock_data_id=stock_data.pk,
                )
                stock_data.is_rwm_edi_sent = True
                stock_data.save(using=db)
                pk_list.append(obj.pk)
            else:
                pass

        main_data = {
            "mir_rwm_obj_pk_list": pk_list,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_apl_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        list_of_mei_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                apl_content_data = apl_edi_line_in_content_data(each)
                line_in_current_location_code = apl_content_data[
                    "current_location_code"
                ]
                line_in_date = apl_content_data["date"]
                line_in_time = apl_content_data["time"]
                line_in_size_code = apl_content_data["size_code"]
                line_in_container_no = apl_content_data["container_no"]
                line_in_location_code = apl_content_data["location_code"]
                line_in_booking_no = apl_content_data["booking_no"]
                line_in_merged_data = apl_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                line_in_merged_mei_data = mei_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                list_of_content.append(line_in_merged_data)
                list_of_mei_content.append(line_in_merged_mei_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                apl_content_data = apl_edi_line_out_content_data(each)
                line_out_current_location_code = apl_content_data[
                    "current_location_code"
                ]
                line_out_date = apl_content_data["date"]
                line_out_time = apl_content_data["time"]
                line_out_size_code = apl_content_data["size_code"]
                line_out_container_no = apl_content_data["container_no"]
                line_out_location_code = apl_content_data["location_code"]
                line_out_booking_no = apl_content_data["booking_no"]
                line_out_merged_data = apl_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                apl_content_data = apl_edi_party_in_content_data(each)
                party_in_current_location_code = apl_content_data[
                    "current_location_code"
                ]
                party_in_date = apl_content_data["date"]
                party_in_time = apl_content_data["time"]
                party_in_size_code = apl_content_data["size_code"]
                party_in_container_no = apl_content_data["container_no"]
                party_in_location_code = apl_content_data["location_code"]
                party_in_booking_no = apl_content_data["booking_no"]
                party_in_merged_data = apl_edi_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                party_in_merged_mei_data = mei_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                list_of_content.append(party_in_merged_data)
                list_of_mei_content.append(party_in_merged_mei_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                apl_content_data = apl_edi_party_out_content_data(each)
                party_out_current_location_code = apl_content_data[
                    "current_location_code"
                ]
                party_out_date = apl_content_data["date"]
                party_out_time = apl_content_data["time"]
                party_out_size_code = apl_content_data["size_code"]
                party_out_container_no = apl_content_data["container_no"]
                party_out_location_code = apl_content_data["location_code"]
                party_out_booking_no = apl_content_data["booking_no"]
                party_out_merged_data = apl_edi_party_out_content_format(
                    current_location_code=party_out_current_location_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = apl_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "apl",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        if not len(list_of_mei_content) == 0:
            mei_content = "\n".join(list_of_mei_content)
            formatted_mei_data = mei_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=mei_content,
            )
            main_data["mei_data"] = {
                "ref_code": "apl",
                "site_code": hf_site_code,
                "date": hf_date,
                "time": hf_time,
                "content": formatted_mei_data,
            }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_anl_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        list_of_mei_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                anl_content_data = anl_edi_line_in_content_data(each)
                line_in_current_location_code = anl_content_data[
                    "current_location_code"
                ]
                line_in_date = anl_content_data["date"]
                line_in_time = anl_content_data["time"]
                line_in_size_code = anl_content_data["size_code"]
                line_in_container_no = anl_content_data["container_no"]
                line_in_location_code = anl_content_data["location_code"]
                line_in_booking_no = anl_content_data["booking_no"]
                line_in_merged_data = anl_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                line_in_merged_mei_data = mei_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                list_of_content.append(line_in_merged_data)
                list_of_mei_content.append(line_in_merged_mei_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                anl_content_data = anl_edi_line_out_content_data(each)
                line_out_current_location_code = anl_content_data[
                    "current_location_code"
                ]
                line_out_date = anl_content_data["date"]
                line_out_time = anl_content_data["time"]
                line_out_size_code = anl_content_data["size_code"]
                line_out_container_no = anl_content_data["container_no"]
                line_out_location_code = anl_content_data["location_code"]
                line_out_booking_no = anl_content_data["booking_no"]
                line_out_merged_data = anl_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                anl_content_data = anl_edi_party_in_content_data(each)
                party_in_current_location_code = anl_content_data[
                    "current_location_code"
                ]
                party_in_date = anl_content_data["date"]
                party_in_time = anl_content_data["time"]
                party_in_size_code = anl_content_data["size_code"]
                party_in_container_no = anl_content_data["container_no"]
                party_in_location_code = anl_content_data["location_code"]
                party_in_booking_no = anl_content_data["booking_no"]
                party_in_merged_data = anl_edi_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                party_in_merged_mei_data = mei_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                list_of_content.append(party_in_merged_data)
                list_of_mei_content.append(party_in_merged_mei_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                anl_content_data = anl_edi_party_out_content_data(each)
                party_out_current_location_code = anl_content_data[
                    "current_location_code"
                ]
                party_out_date = anl_content_data["date"]
                party_out_time = anl_content_data["time"]
                party_out_size_code = anl_content_data["size_code"]
                party_out_container_no = anl_content_data["container_no"]
                party_out_location_code = anl_content_data["location_code"]
                party_out_booking_no = anl_content_data["booking_no"]
                party_out_merged_data = anl_edi_party_out_content_format(
                    current_location_code=party_out_current_location_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = anl_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "anl",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        if not len(list_of_mei_content) == 0:
            mei_content = "\n".join(list_of_mei_content)
            formatted_mei_data = mei_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=mei_content,
            )
            main_data["mei_data"] = {
                "ref_code": "anl",
                "site_code": hf_site_code,
                "date": hf_date,
                "time": hf_time,
                "content": formatted_mei_data,
            }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_hmm_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                hmm_content_data = hmm_edi_line_in_content_data(each)
                line_in_operator_code = hmm_content_data["operator_code"]
                line_in_edi_code = hmm_content_data["edi_code"]
                line_in_date = hmm_content_data["date"]
                line_in_time = hmm_content_data["time"]
                line_in_size_code = hmm_content_data["size_code"]
                line_in_container_no = hmm_content_data["container_no"]
                line_in_location_code = hmm_content_data["location_code"]
                line_in_transporter = hmm_content_data["transporter"]
                line_in_merged_data = hmm_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    edi_code=line_in_edi_code,
                    transporter=line_in_transporter,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                hmm_content_data = hmm_edi_line_out_content_data(each)
                line_out_operator_code = hmm_content_data["operator_code"]
                line_out_edi_code = hmm_content_data["edi_code"]
                line_out_date = hmm_content_data["date"]
                line_out_time = hmm_content_data["time"]
                line_out_size_code = hmm_content_data["size_code"]
                line_out_container_no = hmm_content_data["container_no"]
                line_out_location_code = hmm_content_data["location_code"]
                line_out_transporter = hmm_content_data["transporter"]
                line_out_booking_no = hmm_content_data["booking_no"]
                line_out_merged_data = hmm_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    edi_code=line_out_edi_code,
                    transporter=line_out_transporter,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                hmm_content_data = hmm_edi_party_in_content_data(each)
                party_in_operator_code = hmm_content_data["operator_code"]
                party_in_edi_code = hmm_content_data["edi_code"]
                party_in_date = hmm_content_data["date"]
                party_in_time = hmm_content_data["time"]
                party_in_size_code = hmm_content_data["size_code"]
                party_in_container_no = hmm_content_data["container_no"]
                party_in_location_code = hmm_content_data["location_code"]
                party_in_merged_data = hmm_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    edi_code=party_in_edi_code,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                hmm_content_data = hmm_edi_party_out_content_data(each)
                party_out_operator_code = hmm_content_data["operator_code"]
                party_out_edi_code = hmm_content_data["edi_code"]
                party_out_date = hmm_content_data["date"]
                party_out_time = hmm_content_data["time"]
                party_out_size_code = hmm_content_data["size_code"]
                party_out_container_no = hmm_content_data["container_no"]
                party_out_location_code = hmm_content_data["location_code"]
                party_out_booking_no = hmm_content_data["booking_no"]
                party_out_merged_data = hmm_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    edi_code=party_out_edi_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = hmm_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "hmm",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_rcl_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                rcl_content_data = rcl_edi_line_in_content_data(each)
                line_in_operator_code = rcl_content_data["operator_code"]
                line_in_edi_code = rcl_content_data["edi_code"]
                line_in_date = rcl_content_data["date"]
                line_in_time = rcl_content_data["time"]
                line_in_size_code = rcl_content_data["size_code"]
                line_in_container_no = rcl_content_data["container_no"]
                line_in_location_code = rcl_content_data["location_code"]
                line_in_condition = rcl_content_data["condition"]
                line_in_grade = rcl_content_data["grade"]
                line_in_merged_data = rcl_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    edi_code=line_in_edi_code,
                    condition=line_in_condition,
                    grade=line_in_grade,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                rcl_content_data = rcl_edi_line_out_content_data(each)
                line_out_operator_code = rcl_content_data["operator_code"]
                line_out_edi_code = rcl_content_data["edi_code"]
                line_out_date = rcl_content_data["date"]
                line_out_time = rcl_content_data["time"]
                line_out_size_code = rcl_content_data["size_code"]
                line_out_container_no = rcl_content_data["container_no"]
                line_out_location_code = rcl_content_data["location_code"]
                line_out_condition = rcl_content_data["condition"]
                line_out_booking_no = rcl_content_data["booking_no"]
                # line_out_grade = rcl_content_data["grade"]
                line_out_merged_data = rcl_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    edi_code=line_out_edi_code,
                    condition=line_out_condition,
                    booking_no=line_out_booking_no,
                    # grade=line_out_grade,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                rcl_content_data = rcl_edi_party_in_content_data(each)
                party_in_operator_code = rcl_content_data["operator_code"]
                party_in_edi_code = rcl_content_data["edi_code"]
                party_in_date = rcl_content_data["date"]
                party_in_time = rcl_content_data["time"]
                party_in_size_code = rcl_content_data["size_code"]
                party_in_container_no = rcl_content_data["container_no"]
                party_in_location_code = rcl_content_data["location_code"]
                party_in_condition = rcl_content_data["condition"]
                party_in_grade = rcl_content_data["grade"]
                party_in_merged_data = rcl_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    condition=party_in_condition,
                    edi_code=party_in_edi_code,
                    grade=party_in_grade,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                rcl_content_data = rcl_edi_party_out_content_data(each)
                party_out_operator_code = rcl_content_data["operator_code"]
                party_out_edi_code = rcl_content_data["edi_code"]
                party_out_date = rcl_content_data["date"]
                party_out_time = rcl_content_data["time"]
                party_out_size_code = rcl_content_data["size_code"]
                party_out_container_no = rcl_content_data["container_no"]
                party_out_location_code = rcl_content_data["location_code"]
                party_out_booking_no = rcl_content_data["booking_no"]
                party_out_condition = rcl_content_data["condition"]
                # party_out_grade = rcl_content_data["grade"]
                party_out_merged_data = rcl_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    edi_code=party_out_edi_code,
                    condition=party_out_condition,
                    booking_no=party_out_booking_no,
                    # grade=party_out_grade
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = rcl_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "rcl",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_esl_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                esl_content_data = esl_edi_line_in_content_data(each)
                line_in_operator_code = esl_content_data["operator_code"]
                line_in_edi_code = esl_content_data["edi_code"]
                line_in_date = esl_content_data["date"]
                line_in_time = esl_content_data["time"]
                line_in_size_code = esl_content_data["size_code"]
                line_in_container_no = esl_content_data["container_no"]
                line_in_location_code = esl_content_data["location_code"]
                line_in_transporter = esl_content_data["transporter"]
                line_in_condition = esl_content_data["condition"]
                line_in_merged_data = esl_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    edi_code=line_in_edi_code,
                    transporter=line_in_transporter,
                    condition=line_in_condition,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                esl_content_data = esl_edi_line_out_content_data(each)
                line_out_operator_code = esl_content_data["operator_code"]
                line_out_edi_code = esl_content_data["edi_code"]
                line_out_date = esl_content_data["date"]
                line_out_time = esl_content_data["time"]
                line_out_size_code = esl_content_data["size_code"]
                line_out_container_no = esl_content_data["container_no"]
                line_out_location_code = esl_content_data["location_code"]
                line_out_transporter = esl_content_data["transporter"]
                line_out_booking_no = esl_content_data["booking_no"]
                line_out_condition = esl_content_data["condition"]
                line_out_merged_data = esl_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    edi_code=line_out_edi_code,
                    condition=line_out_condition,
                    transporter=line_out_transporter,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                esl_content_data = esl_edi_party_in_content_data(each)
                party_in_operator_code = esl_content_data["operator_code"]
                party_in_edi_code = esl_content_data["edi_code"]
                party_in_date = esl_content_data["date"]
                party_in_time = esl_content_data["time"]
                party_in_size_code = esl_content_data["size_code"]
                party_in_container_no = esl_content_data["container_no"]
                party_in_location_code = esl_content_data["location_code"]
                party_in_condition = esl_content_data["condition"]
                party_in_merged_data = esl_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    condition=party_in_condition,
                    edi_code=party_in_edi_code,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                esl_content_data = esl_edi_party_out_content_data(each)
                party_out_operator_code = esl_content_data["operator_code"]
                party_out_edi_code = esl_content_data["edi_code"]
                party_out_date = esl_content_data["date"]
                party_out_time = esl_content_data["time"]
                party_out_size_code = esl_content_data["size_code"]
                party_out_container_no = esl_content_data["container_no"]
                party_out_location_code = esl_content_data["location_code"]
                party_out_booking_no = esl_content_data["booking_no"]
                party_out_condition = esl_content_data["condition"]
                party_out_merged_data = esl_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    edi_code=party_out_edi_code,
                    condition=party_out_condition,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = esl_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "esl",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_qnl_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                qnl_content_data = qnl_edi_line_in_content_data(each)
                line_in_date = qnl_content_data["date"]
                line_in_time = qnl_content_data["time"]
                line_in_container_no = qnl_content_data["container_no"]
                line_in_location_code = qnl_content_data["location_code"]
                line_in_transporter = qnl_content_data["transporter"]
                line_in_booking_no = qnl_content_data["booking_no"]
                line_in_size_code = qnl_content_data["size_code"]
                line_in_merged_data = qnl_edi_line_in_content_format(
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    location_code=line_in_location_code,
                    transporter=line_in_transporter,
                    booking_no=line_in_booking_no,
                    size_code=line_in_size_code,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                qnl_content_data = qnl_edi_line_out_content_data(each)
                line_out_date = qnl_content_data["date"]
                line_out_time = qnl_content_data["time"]
                line_out_container_no = qnl_content_data["container_no"]
                line_out_location_code = qnl_content_data["location_code"]
                line_out_transporter = qnl_content_data["transporter"]
                line_out_booking_no = qnl_content_data["booking_no"]
                line_out_size_code = qnl_content_data["size_code"]
                line_out_merged_data = qnl_edi_line_out_content_format(
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                    transporter=line_out_transporter,
                    size_code=line_out_size_code,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                qnl_content_data = qnl_edi_party_in_content_data(each)
                party_in_transporter = qnl_content_data["transporter"]
                party_in_date = qnl_content_data["date"]
                party_in_time = qnl_content_data["time"]
                party_in_container_no = qnl_content_data["container_no"]
                party_in_location_code = qnl_content_data["location_code"]
                party_in_booking_no = qnl_content_data["booking_no"]
                party_in_size_code = qnl_content_data["size_code"]
                party_in_merged_data = qnl_edi_party_in_content_format(
                    transporter=party_in_transporter,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                    size_code=party_in_size_code,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                qnl_content_data = qnl_edi_party_out_content_data(each)
                party_out_transporter = qnl_content_data["transporter"]
                party_out_date = qnl_content_data["date"]
                party_out_time = qnl_content_data["time"]
                party_out_container_no = qnl_content_data["container_no"]
                party_out_location_code = qnl_content_data["location_code"]
                party_out_booking_no = qnl_content_data["booking_no"]
                party_out_size_code = qnl_content_data["size_code"]
                party_out_merged_data = qnl_edi_party_out_content_format(
                    transporter=party_out_transporter,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                    size_code=party_out_size_code,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = qnl_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "qnl",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_msk_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                msk_content_data = msk_edi_line_in_content_data(each)
                line_in_operator_code = msk_content_data["operator_code"]
                line_in_date = msk_content_data["date"]
                line_in_time = msk_content_data["time"]
                line_in_size_code = msk_content_data["size_code"]
                line_in_container_no = msk_content_data["container_no"]
                line_in_location_code = msk_content_data["location_code"]
                line_in_carrier_code = msk_content_data["carrier_code"]
                line_in_merged_data = msk_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    carrier_code=line_in_carrier_code,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                msk_content_data = msk_edi_line_out_content_data(each)
                line_out_operator_code = msk_content_data["operator_code"]
                line_out_date = msk_content_data["date"]
                line_out_time = msk_content_data["time"]
                line_out_size_code = msk_content_data["size_code"]
                line_out_container_no = msk_content_data["container_no"]
                line_out_location_code = msk_content_data["location_code"]
                line_out_carrier_code = msk_content_data["carrier_code"]
                line_out_merged_data = msk_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    carrier_code=line_out_carrier_code,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                msk_content_data = msk_edi_party_in_content_data(each)
                party_in_operator_code = msk_content_data["operator_code"]
                party_in_date = msk_content_data["date"]
                party_in_time = msk_content_data["time"]
                party_in_size_code = msk_content_data["size_code"]
                party_in_container_no = msk_content_data["container_no"]
                party_in_location_code = msk_content_data["location_code"]
                party_in_carrier_code = msk_content_data["carrier_code"]
                party_in_merged_data = msk_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    carrier_code=party_in_carrier_code,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                msk_content_data = msk_edi_party_out_content_data(each)
                party_out_operator_code = msk_content_data["operator_code"]
                party_out_date = msk_content_data["date"]
                party_out_time = msk_content_data["time"]
                party_out_size_code = msk_content_data["size_code"]
                party_out_container_no = msk_content_data["container_no"]
                party_out_location_code = msk_content_data["location_code"]
                party_out_booking_no = msk_content_data["booking_no"]
                party_out_carrier_code = msk_content_data["carrier_code"]
                party_out_merged_data = msk_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                    carrier_code=party_out_carrier_code,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = egl_n_msk_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "msk",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_egl_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                egl_content_data = egl_edi_line_in_content_data(each)
                line_in_operator_code = egl_content_data["operator_code"]
                line_in_date = egl_content_data["date"]
                line_in_time = egl_content_data["time"]
                line_in_size_code = egl_content_data["size_code"]
                line_in_container_no = egl_content_data["container_no"]
                line_in_location_code = egl_content_data["location_code"]
                line_in_transporter = egl_content_data["transporter"]
                line_in_merged_data = egl_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    transporter=line_in_transporter,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                egl_content_data = egl_edi_line_out_content_data(each)
                line_out_operator_code = egl_content_data["operator_code"]
                line_out_date = egl_content_data["date"]
                line_out_time = egl_content_data["time"]
                line_out_size_code = egl_content_data["size_code"]
                line_out_container_no = egl_content_data["container_no"]
                line_out_location_code = egl_content_data["location_code"]
                line_out_transporter = egl_content_data["transporter"]
                line_out_merged_data = egl_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    transporter=line_out_transporter,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                egl_content_data = egl_edi_party_in_content_data(each)
                party_in_operator_code = egl_content_data["operator_code"]
                party_in_date = egl_content_data["date"]
                party_in_time = egl_content_data["time"]
                party_in_size_code = egl_content_data["size_code"]
                party_in_container_no = egl_content_data["container_no"]
                party_in_location_code = egl_content_data["location_code"]
                party_in_merged_data = egl_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                egl_content_data = egl_edi_party_out_content_data(each)
                party_out_operator_code = egl_content_data["operator_code"]
                party_out_date = egl_content_data["date"]
                party_out_time = egl_content_data["time"]
                party_out_size_code = egl_content_data["size_code"]
                party_out_container_no = egl_content_data["container_no"]
                party_out_location_code = egl_content_data["location_code"]
                party_out_booking_no = egl_content_data["booking_no"]
                party_out_merged_data = egl_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = egl_n_msk_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "egl",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_msc_edi(data):
    try:
        site = detect_site(data[0])
        for each in data:
            process = detect_arrived_by(each)
            container_no = None
            db = each._state.db
            if process == "cfs_in":
                container_no = each.container.container_no
                first = msc_edi_cfs_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_edi_cfs_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_edi_cfs_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                fourth = msc_edi_cfs_in_fourth_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=fourth["date"],
                    content=fourth["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=fourth["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "cfs_out":
                container_no = each.container.container_no
                second = msc_edi_cfs_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_edi_cfs_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "factory_in":
                container_no = each.container.container_no
                first = msc_edi_factory_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_edi_factory_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_edi_factory_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "factory_out":
                container_no = each.container.container_no
                second = msc_edi_factory_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_edi_factory_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "vessel_in":
                container_no = each.container.container_no
                first = msc_edi_vessel_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_edi_vessel_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_edi_vessel_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "vessel_out":
                container_no = each.container.container_no
                second = msc_edi_vessel_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_edi_vessel_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "road_in":
                container_no = each.container.container_no
                first = msc_edi_road_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_edi_road_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_edi_road_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "road_out":
                container_no = each.container.container_no
                second = msc_edi_road_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_edi_road_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )

            elif process == "fs_return_in":
                container_no = each.container.container_no
                first = msc_edi_fs_return_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "fs_return_out":
                container_no = each.container.container_no
                first = msc_edi_fs_return_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )

            else:
                pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_msc_redi(data):
    try:
        site = detect_site(data[0])
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            process = detect_arrived_by(each)
            container_no = None
            db = each._state.db
            if process == "cfs_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_cfs_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_edi_cfs_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_edi_cfs_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
                fourth = msc_edi_cfs_in_fourth_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=fourth["date"],
                    content=fourth["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=fourth["move_code"],
                    is_deleted=False,
                )
            elif process == "cfs_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_edi_cfs_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_edi_cfs_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "factory_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_factory_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_edi_factory_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_edi_factory_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
            elif process == "factory_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_edi_factory_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_edi_factory_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "vessel_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_vessel_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_edi_vessel_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_edi_vessel_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
            elif process == "vessel_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_edi_vessel_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_edi_vessel_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "road_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_road_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_edi_road_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_edi_road_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
            elif process == "road_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_edi_road_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_edi_road_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "fs_return_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_fs_return_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "fs_return_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_fs_return_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            else:
                pass

        connection_list = [each for each in connections if not each == "analytics"]
        msc_object_data = MscREdiContent.objects.filter(site=site, is_deleted=False)
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        msc_edi_content_list = []
        for each in msc_object_data:
            if each.date <= dt:
                msc_edi_content_list.append(each.content)
                each.is_deleted = True
                each.save()
        msc_edi_content = "".join(msc_edi_content_list)
        date = dt.date().strftime("%d%m%Y")
        time = dt.time().strftime("%I%M%_p")
        site_code = get_msc_site_code(data[0])
        email_data = edi_get_email_data(data)
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "msc",
            "site_code": site_code,
            "date": date,
            "time": time,
            "content": msc_edi_content,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_msc_tuticorin_edi(data):
    try:
        site = detect_site(data[0])
        for each in data:
            process = detect_arrived_by(each)
            container_no = None
            db = each._state.db
            if process == "cfs_in":
                container_no = each.container.container_no
                first = msc_tuticorin_edi_cfs_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_tuticorin_edi_cfs_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_tuticorin_edi_cfs_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                fourth = msc_tuticorin_edi_cfs_in_fourth_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=fourth["date"],
                    content=fourth["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=fourth["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "cfs_out":
                container_no = each.container.container_no
                second = msc_tuticorin_edi_cfs_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_tuticorin_edi_cfs_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "factory_in":
                container_no = each.container.container_no
                first = msc_tuticorin_edi_factory_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_tuticorin_edi_factory_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_tuticorin_edi_factory_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "factory_out":
                container_no = each.container.container_no
                second = msc_tuticorin_edi_factory_out_second_content_data(
                    obj_data=each
                )
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_tuticorin_edi_factory_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "vessel_in":
                container_no = each.container.container_no
                first = msc_tuticorin_edi_vessel_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_tuticorin_edi_vessel_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_tuticorin_edi_vessel_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                fourth = msc_tuticorin_edi_vessel_in_fourth_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=fourth["date"],
                    content=fourth["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=fourth["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "vessel_out":
                container_no = each.container.container_no
                second = msc_tuticorin_edi_vessel_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_tuticorin_edi_vessel_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "road_in":
                container_no = each.container.container_no
                first = msc_tuticorin_edi_road_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                second = msc_tuticorin_edi_road_in_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
                third = msc_tuticorin_edi_road_in_third_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "road_out":
                container_no = each.container.container_no
                second = msc_tuticorin_edi_road_out_second_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
                first = msc_tuticorin_edi_road_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            elif process == "fs_return_in":
                container_no = each.container.container_no
                first = msc_edi_fs_return_in_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    in_data_id=each.pk,
                )
            elif process == "fs_return_out":
                container_no = each.container.container_no
                first = msc_edi_fs_return_out_first_content_data(obj_data=each)
                MscEdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                    out_data_id=each.pk,
                )
            else:
                pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_msc_tuticorin_redi(data):
    try:
        site = detect_site(data[0])
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            process = detect_arrived_by(each)
            container_no = None
            db = each._state.db
            if process == "cfs_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_tuticorin_edi_cfs_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_tuticorin_edi_cfs_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_tuticorin_edi_cfs_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
                fourth = msc_tuticorin_edi_cfs_in_fourth_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=fourth["date"],
                    content=fourth["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=fourth["move_code"],
                    is_deleted=False,
                )
            elif process == "cfs_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_tuticorin_edi_cfs_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_tuticorin_edi_cfs_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "factory_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_tuticorin_edi_factory_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_tuticorin_edi_factory_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_tuticorin_edi_factory_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
            elif process == "factory_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_tuticorin_edi_factory_out_second_content_data(
                    obj_data=each
                )
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_tuticorin_edi_factory_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "vessel_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_tuticorin_edi_vessel_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_tuticorin_edi_vessel_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_tuticorin_edi_vessel_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
                fourth = msc_tuticorin_edi_vessel_in_fourth_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=fourth["date"],
                    content=fourth["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=fourth["move_code"],
                    is_deleted=False,
                )
            elif process == "vessel_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_tuticorin_edi_vessel_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_tuticorin_edi_vessel_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "road_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_tuticorin_edi_road_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
                second = msc_tuticorin_edi_road_in_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                third = msc_tuticorin_edi_road_in_third_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=third["date"],
                    content=third["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=third["move_code"],
                    is_deleted=False,
                )
            elif process == "road_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                second = msc_tuticorin_edi_road_out_second_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=second["date"],
                    content=second["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=second["move_code"],
                    is_deleted=False,
                )
                first = msc_tuticorin_edi_road_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "fs_return_in":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_fs_return_in_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            elif process == "fs_return_out":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                container_no = each.container.container_no
                first = msc_edi_fs_return_out_first_content_data(obj_data=each)
                MscREdiContent.objects.using(db).get_or_create(
                    date=first["date"],
                    content=first["content"],
                    site=site,
                    container_no=container_no,
                    process=process,
                    move_code=first["move_code"],
                    is_deleted=False,
                )
            else:
                pass

        connection_list = [each for each in connections if not each == "analytics"]
        msc_object_data = []
        for connection in connection_list:
            for each_msc_object in MscREdiContent.objects.using(connection).filter(
                site=site, is_deleted=False
            ):
                msc_object_data.append(each_msc_object)

        move_code_wise_data = {}
        for mscObj in msc_object_data:
            if mscObj.move_code in move_code_wise_data.keys():
                move_code_wise_data[mscObj.move_code].append(mscObj)
            else:
                move_code_wise_data[mscObj.move_code] = [mscObj]

        main_data = []
        for each_data in move_code_wise_data:
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            msc_tuticorin_edi_content_list = []
            for each in move_code_wise_data[each_data]:
                # if each.date <= dt:
                msc_tuticorin_edi_content_list.append(each.content)
                each.is_deleted = True
                each.save()
            msc_tuticorin_edi_content = "".join(msc_tuticorin_edi_content_list)
            date = dt.date().strftime("%d%m%Y")
            time = dt.time().strftime("%I%M%_p")
            site_code = get_msc_site_code(data[0])
            email_data = edi_get_email_data(data)
            in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
            main_data.append(
                {
                    "ref_code": "msc",
                    "site_code": site_code,
                    "date": date,
                    "time": time,
                    "content": msc_tuticorin_edi_content,
                    "email_data": email_data,
                    "in_out_pk_dict": in_out_pk_dict,
                    "move_code": each_data,
                }
            )
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_remaining_msc_edi():
    try:
        connection_data = {}
        connection_list = [each for each in connections if not each == "analytics"]
        for connection in connection_list:
            main_data = []
            site_wise_data = {}
            for each_one in MscEdiContent.objects.using(connection).filter(
                is_deleted=False
            ):
                if each_one.site in site_wise_data.keys():
                    site_wise_data[each_one.site].append(each_one)
                else:
                    site_wise_data[each_one.site] = [each_one]

            for each in site_wise_data:
                if each == "TUTICORIN" or each == "KAKINADA":
                    move_code_wise_data = {}
                    for mscObj in site_wise_data[each]:
                        if mscObj.move_code in move_code_wise_data.keys():
                            move_code_wise_data[mscObj.move_code].append(mscObj)
                        else:
                            move_code_wise_data[mscObj.move_code] = [mscObj]
                    move_code_list = []
                    for each_data in move_code_wise_data:
                        dt = datetime.datetime.now().astimezone(
                            timezone.get_current_timezone()
                        )
                        msc_edi_content_list = []
                        in_pk_list = []
                        out_pk_list = []
                        for each_one in move_code_wise_data[each_data]:
                            if each_one.date <= dt:
                                msc_edi_content_list.append(each_one.content)
                                each_one.is_deleted = True
                                each_one.save()

                                if (
                                    GateInHistory.objects.using(connection)
                                    .filter(pk=each_one.in_data_id)
                                    .exists()
                                ):
                                    in_pk_list.append(each_one.in_data_id)

                                if (
                                    GateOutHistory.objects.using(connection)
                                    .filter(pk=each_one.out_data_id)
                                    .exists()
                                ):
                                    out_pk_list.append(each_one.out_data_id)

                        if not len(msc_edi_content_list) == 0:
                            msc_edi_content = "".join(msc_edi_content_list)
                            date = dt.date().strftime("%d%m%Y")
                            time = dt.time().strftime("%I%M%_p")
                            client_object = Client.objects.using(connection).filter(
                                ref_code="MSC",
                                edi_service=True,
                                site__name__icontains=each,
                            )
                            site = Site.objects.using(connection).get(
                                name__icontains=each
                            )
                            site_code = site.code
                            email_data = get_edi_email_data(client_object)
                            move_code_list.append(
                                {
                                    "ref_code": "msc",
                                    "site_code": site_code,
                                    "site": each,
                                    "date": date,
                                    "time": time,
                                    "content": msc_edi_content,
                                    "email_data": email_data,
                                    "move_code": each_data,
                                    "in_pk_list": in_pk_list,
                                    "out_pk_list": out_pk_list,
                                }
                            )

                    if not len(move_code_list) == 0:
                        main_data.append(move_code_list)
                else:
                    dt = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                    msc_edi_content_list = []
                    in_pk_list = []
                    out_pk_list = []
                    for each_data in site_wise_data[each]:
                        if each_data.date <= dt:
                            msc_edi_content_list.append(each_data.content)
                            each_data.is_deleted = True
                            each_data.save()
                            if (
                                GateInHistory.objects.using(connection)
                                .filter(pk=each_data.in_data_id, is_email_sent=False)
                                .exists()
                            ):
                                in_pk_list.append(each_data.in_data_id)

                            if (
                                GateOutHistory.objects.using(connection)
                                .filter(pk=each_data.out_data_id, is_email_sent=False)
                                .exists()
                            ):
                                out_pk_list.append(each_data.out_data_id)

                    if not len(msc_edi_content_list) == 0:
                        msc_edi_content = "".join(msc_edi_content_list)
                        date = dt.date().strftime("%d%m%Y")
                        time = dt.time().strftime("%I%M%_p")
                        client_object = Client.objects.using(connection).filter(
                            ref_code="MSC", edi_service=True, site__name__icontains=each
                        )
                        site = Site.objects.using(connection).filter(
                            name__icontains=each.lower()
                        )[0]
                        site_code = site.code
                        email_data = get_edi_email_data(client_object)
                        main_data.append(
                            {
                                "ref_code": "msc",
                                "site_code": site_code,
                                "site": each,
                                "date": date,
                                "time": time,
                                "content": msc_edi_content,
                                "email_data": email_data,
                                "in_pk_list": in_pk_list,
                                "out_pk_list": out_pk_list,
                            }
                        )
            connection_data[connection] = main_data
        return connection_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_zim_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        site_name = data[0].container.client.site.name
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        hf_depot_code = hf_data["depot_code"]
        list_of_content = []
        list_of_dmg_content = []
        # list_of_back_content = []
        count = 0

        in_pk_list = {}
        out_pk_list = {}

        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                zim_content_data = zim_edi_line_in_content_data(each)
                line_in_current_location_code = zim_content_data[
                    "current_location_code"
                ]
                line_in_date = zim_content_data["date"]
                line_in_time = zim_content_data["time"]
                line_in_size_code = zim_content_data["size_code"]
                line_in_container_no = zim_content_data["container_no"]
                line_in_location_code = zim_content_data["location_code"]
                line_in_merged_data = zim_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                )
                list_of_content.append(line_in_merged_data)

                # dmg
                zim_dmg_content_data = zim_edi_line_in_content_data(each, dmg=True)
                line_dmg_current_location_code = zim_dmg_content_data[
                    "current_location_code"
                ]
                line_dmg_date = zim_dmg_content_data["date"]
                line_dmg_time = zim_dmg_content_data["time"]
                line_dmg_size_code = zim_dmg_content_data["size_code"]
                line_dmg_container_no = zim_dmg_content_data["container_no"]
                line_dmg_location_code = zim_dmg_content_data["location_code"]
                line_dmg_merged_data = zim_edi_line_dmg_content_format(
                    current_location_code=line_dmg_current_location_code,
                    date=line_dmg_date,
                    time=line_dmg_time,
                    msg_no=msg_no,
                    container_no=line_dmg_container_no,
                    size_code=line_dmg_size_code,
                    location_code=line_dmg_location_code,
                )
                list_of_dmg_content.append(line_dmg_merged_data)

            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                zim_content_data = zim_edi_line_out_content_data(each)
                line_out_current_location_code = zim_content_data[
                    "current_location_code"
                ]
                line_out_date = zim_content_data["date"]
                line_out_time = zim_content_data["time"]
                line_out_size_code = zim_content_data["size_code"]
                line_out_container_no = zim_content_data["container_no"]
                line_out_location_code = zim_content_data["location_code"]
                line_out_booking_no = zim_content_data["booking_no"]
                line_out_merged_data = zim_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)

                # # back
                # zim_back_content_data = zim_edi_line_out_content_data(each, back=True)
                # line_back_current_location_code = zim_back_content_data[
                #     "current_location_code"
                # ]
                # line_back_date = zim_back_content_data["date"]
                # line_back_time = zim_back_content_data["time"]
                # line_back_size_code = zim_back_content_data["size_code"]
                # line_back_container_no = zim_back_content_data["container_no"]
                # line_back_location_code = zim_back_content_data["location_code"]
                # line_back_booking_no = zim_back_content_data["booking_no"]
                # line_back_merged_data = zim_edi_line_back_content_format(
                #     current_location_code=line_back_current_location_code,
                #     date=line_back_date,
                #     time=line_back_time,
                #     msg_no=msg_no,
                #     container_no=line_back_container_no,
                #     size_code=line_back_size_code,
                #     location_code=line_back_location_code,
                #     booking_no=line_back_booking_no,
                # )
                # list_of_back_content.append(line_back_merged_data)

            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                zim_content_data = zim_edi_party_in_content_data(each)
                party_in_current_location_code = zim_content_data[
                    "current_location_code"
                ]
                party_in_date = zim_content_data["date"]
                party_in_time = zim_content_data["time"]
                party_in_size_code = zim_content_data["size_code"]
                party_in_container_no = zim_content_data["container_no"]
                party_in_location_code = zim_content_data["location_code"]
                party_in_merged_data = zim_edi_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                )
                list_of_content.append(party_in_merged_data)

                # dmg
                zim_dmg_content_data = zim_edi_party_in_content_data(each, dmg=True)
                party_dmg_current_location_code = zim_dmg_content_data[
                    "current_location_code"
                ]
                party_dmg_date = zim_dmg_content_data["date"]
                party_dmg_time = zim_dmg_content_data["time"]
                party_dmg_size_code = zim_dmg_content_data["size_code"]
                party_dmg_container_no = zim_dmg_content_data["container_no"]
                party_dmg_location_code = zim_dmg_content_data["location_code"]
                party_dmg_merged_data = zim_edi_party_dmg_content_format(
                    current_location_code=party_dmg_current_location_code,
                    date=party_dmg_date,
                    time=party_dmg_time,
                    msg_no=msg_no,
                    container_no=party_dmg_container_no,
                    size_code=party_dmg_size_code,
                    location_code=party_dmg_location_code,
                )
                list_of_dmg_content.append(party_dmg_merged_data)

            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                zim_content_data = zim_edi_party_out_content_data(each)
                party_out_current_location_code = zim_content_data[
                    "current_location_code"
                ]
                party_out_date = zim_content_data["date"]
                party_out_time = zim_content_data["time"]
                party_out_size_code = zim_content_data["size_code"]
                party_out_container_no = zim_content_data["container_no"]
                party_out_location_code = zim_content_data["location_code"]
                party_out_booking_no = zim_content_data["booking_no"]
                party_out_merged_data = zim_edi_party_out_content_format(
                    current_location_code=party_out_current_location_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)

                # # back
                # zim_back_content_data = zim_edi_party_out_content_data(each, back=True)
                # party_back_current_location_code = zim_back_content_data[
                #     "current_location_code"
                # ]
                # party_back_date = zim_back_content_data["date"]
                # party_back_time = zim_back_content_data["time"]
                # party_back_size_code = zim_back_content_data["size_code"]
                # party_back_container_no = zim_back_content_data["container_no"]
                # party_back_location_code = zim_back_content_data["location_code"]
                # party_back_booking_no = zim_back_content_data["booking_no"]
                # party_back_merged_data = zim_edi_party_back_content_format(
                #     current_location_code=party_back_current_location_code,
                #     date=party_back_date,
                #     time=party_back_time,
                #     msg_no=msg_no,
                #     container_no=party_back_container_no,
                #     size_code=party_back_size_code,
                #     location_code=party_back_location_code,
                #     booking_no=party_back_booking_no,
                # )
                # list_of_back_content.append(party_back_merged_data)
            else:
                pass

        in_out_content = "\n".join(list_of_content)
        formatted_in_out_edi_data = zim_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=in_out_content,
        )
        # dmg
        formatted_dmg_edi_data = None
        if not len(list_of_dmg_content) == 0:
            dmg_content = "\n".join(list_of_dmg_content)
            formatted_dmg_edi_data = zim_edi_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=dmg_content,
            )
        # # back
        # formatted_back_edi_data = None
        # if not len(list_of_back_content) == 0:
        #     back_content = "\n".join(list_of_back_content)
        #     formatted_back_edi_data = zim_edi_hf_format(
        #         current_location_code=hf_current_location_code,
        #         line=hf_line,
        #         date=hf_date,
        #         time=hf_time,
        #         site_code=hf_site_code,
        #         no_of_containers=no_of_containers,
        #         content=back_content,
        #     )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}

        main_data = {
            "ref_code": "zim",
            "site_code": (
                "INVDRDGH" if site_name.upper() == "VARNAMA" else hf_depot_code
            ),
            "date": hf_date,
            "time": hf_time,
            "content": formatted_in_out_edi_data,
            "dmg_content": formatted_dmg_edi_data,
            # "back_content": formatted_back_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_zim_repair_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        site_name = data[0].container.client.site.name
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        hf_depot_code = hf_data["depot_code"]
        list_of_content = []
        msg_no = 0

        for each in data:
            msg_no = msg_no + 1
            # back
            zim_back_content_data = zim_repair_edi_content_data(each)
            current_location_code = zim_back_content_data["current_location_code"]
            date = zim_back_content_data["date"]
            time = zim_back_content_data["time"]
            location_code = zim_back_content_data["location_code"]
            booking_no = zim_back_content_data["booking_no"]
            size_code = zim_back_content_data["size_code"]
            container_no = zim_back_content_data["container_no"]
            merged_data = zim_repair_edi_content_format(
                current_location_code=current_location_code,
                date=date,
                time=time,
                msg_no=msg_no,
                location_code=location_code,
                booking_no=booking_no,
                container_no=container_no,
                size_code=size_code,
            )
            list_of_content.append(merged_data)

        # back
        formatted_back_edi_data = None
        if not len(list_of_content) == 0:
            back_content = "\n".join(list_of_content)
            formatted_back_edi_data = zim_edi_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=back_content,
            )

        main_data = {
            "ref_code": "zim",
            "site_code": (
                "INVDRDGH" if site_name.upper() == "VARNAMA" else hf_depot_code
            ),
            "date": hf_date,
            "time": hf_time,
            "content": formatted_back_edi_data,
            "email_data": email_data,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_hal_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = []
        out_pk_list = []
        for each in data:
            count = count + 1
            msg_no = count
            process = detect_process(each)
            if process == "Line_IN_Process":
                in_pk_list.append(each.pk)
                hal_content_data = hal_edi_line_in_content_data(each)
                line_in_operator_code = hal_content_data["operator_code"]
                line_in_edi_code = hal_content_data["edi_code"]
                line_in_date = hal_content_data["date"]
                line_in_time = hal_content_data["time"]
                line_in_size_code = hal_content_data["size_code"]
                line_in_container_no = hal_content_data["container_no"]
                line_in_location_code = hal_content_data["location_code"]
                line_in_condition = hal_content_data["condition"]
                line_in_merged_data = hal_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    edi_code=line_in_edi_code,
                    condition=line_in_condition,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                out_pk_list.append(each.pk)
                hal_content_data = hal_edi_line_out_content_data(each)
                line_out_operator_code = hal_content_data["operator_code"]
                line_out_edi_code = hal_content_data["edi_code"]
                line_out_date = hal_content_data["date"]
                line_out_time = hal_content_data["time"]
                line_out_size_code = hal_content_data["size_code"]
                line_out_container_no = hal_content_data["container_no"]
                line_out_location_code = hal_content_data["location_code"]
                line_out_condition = hal_content_data["condition"]
                line_out_booking_no = hal_content_data["booking_no"]
                line_out_merged_data = hal_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    edi_code=line_out_edi_code,
                    condition=line_out_condition,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                in_pk_list.append(each.pk)
                hal_content_data = hal_edi_party_in_content_data(each)
                party_in_operator_code = hal_content_data["operator_code"]
                party_in_edi_code = hal_content_data["edi_code"]
                party_in_date = hal_content_data["date"]
                party_in_time = hal_content_data["time"]
                party_in_size_code = hal_content_data["size_code"]
                party_in_container_no = hal_content_data["container_no"]
                party_in_location_code = hal_content_data["location_code"]
                party_in_condition = hal_content_data["condition"]
                party_in_merged_data = hal_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    condition=party_in_condition,
                    edi_code=party_in_edi_code,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                out_pk_list.append(each.pk)
                hal_content_data = hal_edi_party_out_content_data(each)
                party_out_operator_code = hal_content_data["operator_code"]
                party_out_edi_code = hal_content_data["edi_code"]
                party_out_date = hal_content_data["date"]
                party_out_time = hal_content_data["time"]
                party_out_size_code = hal_content_data["size_code"]
                party_out_container_no = hal_content_data["container_no"]
                party_out_location_code = hal_content_data["location_code"]
                party_out_booking_no = hal_content_data["booking_no"]
                party_out_condition = hal_content_data["condition"]
                party_out_merged_data = hal_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    edi_code=party_out_edi_code,
                    condition=party_out_condition,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = hal_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "hal",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_edi_tracking_data(
    from_date_str=None,
    to_date_str=None,
    from_time_str=None,
    to_time_str=None,
    line=None,
    location=None,
    site=None,
    move_code_tracking=False,
):
    try:

        main_data = {}

        if (
            from_date_str == None
            and to_date_str == None
            and from_time_str == None
            and to_time_str == None
            and line == None
            and location == None
            and site == None
        ):
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=12)
            if move_code_tracking:
                from_date_time = to_date_time - datetime.timedelta(hours=6)
            connection_list = [each for each in connections if not each == "analytics"]

            for connection in connection_list:
                in_data = (
                    GateInHistory.objects.using(connection)
                    .select_related(
                        "container",
                        "container__client",
                        "container__type",
                        "container__size",
                        "container__location",
                        "container__site",
                        "eir",
                        "gate_in",
                        "lolo",
                        "lolo_payment",
                        "st",
                        "st_payment",
                    )
                    .filter(
                        date__range=(from_date_time, to_date_time),
                        container__client__edi_service=True,
                    )
                    .exclude(container__client__edi_to_email_id=None)
                    .order_by("date")
                )

                out_data = (
                    GateOutHistory.objects.using(connection)
                    .select_related(
                        "container",
                        "container__client",
                        "container__type",
                        "container__size",
                        "container__location",
                        "container__site",
                        "eir",
                        "gate_out",
                        "lolo",
                        "lolo_payment",
                        "st",
                        "st_payment",
                    )
                    .filter(
                        date__range=(from_date_time, to_date_time),
                        container__client__edi_service=True,
                    )
                    .exclude(container__client__edi_to_email_id=None)
                    .order_by("date")
                )

                # in_data = GateInHistory.objects.all()
                # out_data = GateOutHistory.objects.all()

                data = list(in_data) + list(out_data)
                from_date_str = from_date_time.date().strftime("%Y-%m-%d")
                from_time_str = from_date_time.time().strftime("%H:%M")
                to_date_str = to_date_time.date().strftime("%Y-%m-%d")
                to_time_str = to_date_time.time().strftime("%H:%M")
                date_data = {
                    "from_date_str": from_date_str,
                    "to_date_str": to_date_str,
                    "from_time_str": from_time_str,
                    "to_time_str": to_time_str,
                }
                main_data[connection] = {"data": data, "date_data": date_data}
            return main_data

        else:
            if not len(from_date_str) == 0:
                if not len(from_time_str) == 0:
                    from_date = datetime.datetime.strptime(
                        from_date_str, "%Y-%m-%d"
                    ).date()
                    to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                    from_time = datetime.datetime.strptime(
                        from_time_str, "%H:%M"
                    ).time()
                    to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                    from_date_time = datetime.datetime.combine(
                        from_date, from_time
                    ).astimezone(timezone.get_current_timezone())
                    to_date_time = datetime.datetime.combine(
                        to_date, to_time
                    ).astimezone(timezone.get_current_timezone())
                    if line is None:
                        in_data = (
                            GateInHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_in",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                date__range=(from_date_time, to_date_time),
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )

                        out_data = (
                            GateOutHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_out",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                date__range=(from_date_time, to_date_time),
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )
                        data = {
                            "in_data_dict": list(in_data),
                            "out_data_dict": list(out_data),
                        }
                        return data
                    else:
                        in_data = (
                            GateInHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_in",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                date__range=(from_date_time, to_date_time),
                                container__client__ref_code=line,
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )

                        out_data = (
                            GateOutHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_out",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                date__range=(from_date_time, to_date_time),
                                container__client__ref_code=line,
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )
                        data = {
                            "in_data_dict": list(in_data),
                            "out_data_dict": list(out_data),
                        }
                        return data
                else:
                    if line is None:
                        in_data = (
                            GateInHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_in",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                gate_in__in_date__range=[from_date_str, to_date_str],
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )

                        out_data = (
                            GateOutHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_out",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                gate_out__out_date__range=[from_date_str, to_date_str],
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )
                        data = {
                            "in_data_dict": list(in_data),
                            "out_data_dict": list(out_data),
                        }
                        return data
                    else:
                        in_data = (
                            GateInHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_in",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                gate_in__in_date__range=[from_date_str, to_date_str],
                                container__client__ref_code=line,
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )

                        out_data = (
                            GateOutHistory.objects.select_related(
                                "container",
                                "container__client",
                                "container__type",
                                "container__size",
                                "container__location",
                                "container__site",
                                "eir",
                                "gate_out",
                                "lolo",
                                "lolo_payment",
                                "st",
                                "st_payment",
                            )
                            .filter(
                                gate_out__out_date__range=[from_date_str, to_date_str],
                                container__client__ref_code=line,
                                container__client__edi_service=True,
                                container__location=location,
                                container__site=site,
                            )
                            .exclude(container__client__edi_to_email_id=None)
                            .order_by("date")
                        )
                        data = {
                            "in_data_dict": list(in_data),
                            "out_data_dict": list(out_data),
                        }
                        return data
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)

                if line is None:
                    in_data = (
                        GateInHistory.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "eir",
                            "gate_in",
                            "lolo",
                            "lolo_payment",
                            "st",
                            "st_payment",
                        )
                        .filter(
                            date__range=(from_date_time, to_date_time),
                            container__client__edi_service=True,
                            container__location=location,
                            container__site=site,
                        )
                        .exclude(container__client__edi_to_email_id=None)
                        .order_by("date")
                    )

                    out_data = (
                        GateOutHistory.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "eir",
                            "gate_out",
                            "lolo",
                            "lolo_payment",
                            "st",
                            "st_payment",
                        )
                        .filter(
                            date__range=(from_date_time, to_date_time),
                            container__client__edi_service=True,
                            container__location=location,
                            container__site=site,
                        )
                        .exclude(container__client__edi_to_email_id=None)
                        .order_by("date")
                    )
                    data = {
                        "in_data_dict": list(in_data),
                        "out_data_dict": list(out_data),
                    }
                    return data

                else:
                    in_data = (
                        GateInHistory.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "eir",
                            "gate_in",
                            "lolo",
                            "lolo_payment",
                            "st",
                            "st_payment",
                        )
                        .filter(
                            date__range=(from_date_time, to_date_time),
                            container__client__ref_code=line,
                            container__client__edi_service=True,
                            container__location=location,
                            container__site=site,
                        )
                        .exclude(container__client__edi_to_email_id=None)
                        .order_by("date")
                    )

                    out_data = (
                        GateOutHistory.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "eir",
                            "gate_out",
                            "lolo",
                            "lolo_payment",
                            "st",
                            "st_payment",
                        )
                        .filter(
                            date__range=(from_date_time, to_date_time),
                            container__client__ref_code=line,
                            container__client__edi_service=True,
                            container__location=location,
                            container__site=site,
                        )
                        .exclude(container__client__edi_to_email_id=None)
                        .order_by("date")
                    )
                    data = {
                        "in_data_dict": list(in_data),
                        "out_data_dict": list(out_data),
                    }
                    return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_remaining_cma_edi():
    try:
        connection_data = {}
        connection_list = [each for each in connections if not each == "analytics"]
        for connection in connection_list:
            main_data = []
            site_wise_data = {}
            for each_one in CmaEdiContent.objects.using(connection).filter(
                is_deleted=False, is_regenerated=False
            ):
                if each_one.site in site_wise_data.keys():
                    site_wise_data[each_one.site].append(each_one)
                else:
                    site_wise_data[each_one.site] = [each_one]

            for each in site_wise_data:
                move_code_wise_data = {}
                for cmaObj in site_wise_data[each]:
                    if cmaObj.move_code in move_code_wise_data.keys():
                        move_code_wise_data[cmaObj.move_code].append(cmaObj)
                    else:
                        move_code_wise_data[cmaObj.move_code] = [cmaObj]
                move_code_list = []
                for each_data in move_code_wise_data:
                    dt = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                    cma_edi_content_list = []
                    for each_one in move_code_wise_data[each_data]:
                        if each_one.date <= dt:
                            cma_edi_content_list.append(each_one.content)
                            each_one.is_deleted = True
                            each_one.save()

                    date = dt.date().strftime("%d%m%Y")
                    time = dt.time().strftime("%I%M%_p")
                    client_object = Client.objects.using(connection).filter(
                        ref_code="CMA",
                        edi_service=True,
                        site__name__icontains=each,
                    )
                    site = Site.objects.using(connection).filter(
                        name__icontains=each.lower()
                    )[0]
                    site_code = site.code
                    email_data = get_edi_email_data(client_object)
                    move_code_list.append(
                        {
                            "ref_code": "cma",
                            "site_code": site_code,
                            "site": each,
                            "date": date,
                            "time": time,
                            "content_list": cma_edi_content_list,
                            "email_data": email_data,
                            "move_code": each_data,
                        }
                    )
                main_data.append(move_code_list)
            connection_data[connection] = main_data
        return connection_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_movecodewise_redi(data, process, move_code):
    try:
        site = detect_site(data[0])
        in_pk_list = {}
        out_pk_list = {}
        pk_list = []
        for each in data:
            if process == detect_arrived_by(each):
                container_no = None
                db = each._state.db
                if process == "cfs_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "DVAN":
                        first = msc_edi_cfs_in_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MTIN":
                        second = msc_edi_cfs_in_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        third = msc_edi_cfs_in_third_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        fourth = msc_edi_cfs_in_fourth_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=fourth["date"],
                            content=fourth["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=fourth["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "cfs_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_edi_cfs_out_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "VAN":
                        first = msc_edi_cfs_out_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "factory_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "MTIN":
                        first = msc_edi_factory_in_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        second = msc_edi_factory_in_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        third = msc_edi_factory_in_third_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "factory_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_edi_factory_out_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "VAN":
                        first = msc_edi_factory_out_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "vessel_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "MIR":
                        first = msc_edi_vessel_in_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        second = msc_edi_vessel_in_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        third = msc_edi_vessel_in_third_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "vessel_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_edi_vessel_out_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MOR":
                        first = msc_edi_vessel_out_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "road_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "MIR":
                        first = msc_edi_road_in_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        second = msc_edi_road_in_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        third = msc_edi_road_in_third_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "road_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_edi_road_out_second_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MOR":
                        first = msc_edi_road_out_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "fs_return_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "RET":
                        first = msc_edi_fs_return_in_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "fs_return_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "VAN":
                        first = msc_edi_fs_return_out_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                else:
                    pass

        if not len(pk_list) == 0:
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            msc_object_data = MscREdiContent.objects.filter(pk__in=pk_list)
            msc_edi_content_list = msc_object_data.values_list("content", flat=True)
            msc_object_data.update(is_deleted=True)
            msc_edi_content = "".join(msc_edi_content_list)
            date = dt.date().strftime("%d%m%Y")
            time = dt.time().strftime("%I%M%_p")
            site_code = get_msc_site_code(data[0])
            email_data = edi_get_email_data(data)
            # in_out_pk_dict = {}
            main_data = {
                "ref_code": "msc",
                "site_code": site_code,
                "date": date,
                "time": time,
                "content": msc_edi_content,
                "email_data": email_data,
                "in_out_pk_dict": None,
            }
            return main_data
        else:
            return None
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_msc_tuticorin_movecodewise_redi(data, process, move_code):
    try:
        site = detect_site(data[0])
        in_pk_list = {}
        out_pk_list = {}
        pk_list = []
        for each in data:
            if process == detect_arrived_by(each):
                container_no = None
                db = each._state.db
                if process == "cfs_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "DVAN":
                        first = msc_tuticorin_edi_cfs_in_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MTIN":
                        second = msc_tuticorin_edi_cfs_in_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        third = msc_tuticorin_edi_cfs_in_third_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        fourth = msc_tuticorin_edi_cfs_in_fourth_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=fourth["date"],
                            content=fourth["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=fourth["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "cfs_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_tuticorin_edi_cfs_out_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "VAN":
                        first = msc_tuticorin_edi_cfs_out_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "factory_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "MTIN":
                        first = msc_tuticorin_edi_factory_in_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        second = msc_tuticorin_edi_factory_in_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        third = msc_tuticorin_edi_factory_in_third_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "factory_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_tuticorin_edi_factory_out_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "VAN":
                        first = msc_tuticorin_edi_factory_out_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "vessel_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "MOR":
                        first = msc_tuticorin_edi_vessel_in_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MIR":
                        second = msc_tuticorin_edi_vessel_in_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        third = msc_tuticorin_edi_vessel_in_third_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        fourth = msc_tuticorin_edi_vessel_in_fourth_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=fourth["date"],
                            content=fourth["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=fourth["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "vessel_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_tuticorin_edi_vessel_out_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MOR":
                        first = msc_tuticorin_edi_vessel_out_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "road_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "MIR":
                        first = msc_tuticorin_edi_road_in_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "DMG_MT":
                        second = msc_tuticorin_edi_road_in_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "REP_OUT_MT":
                        third = msc_tuticorin_edi_road_in_third_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=third["date"],
                            content=third["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=third["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "road_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "REP_RET_MT":
                        second = msc_tuticorin_edi_road_out_second_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=second["date"],
                            content=second["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=second["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                    if move_code == "MOR":
                        first = msc_tuticorin_edi_road_out_first_content_data(
                            obj_data=each
                        )
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "fs_return_in":
                    if db in in_pk_list.keys():
                        in_pk_list[db].append(each.pk)
                    else:
                        in_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "RET":
                        first = msc_edi_fs_return_in_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                elif process == "fs_return_out":
                    if db in out_pk_list.keys():
                        out_pk_list[db].append(each.pk)
                    else:
                        out_pk_list[db] = [each.pk]
                    container_no = each.container.container_no
                    if move_code == "VAN":
                        first = msc_edi_fs_return_out_first_content_data(obj_data=each)
                        obj, created = MscREdiContent.objects.using(db).get_or_create(
                            date=first["date"],
                            content=first["content"],
                            site=site,
                            container_no=container_no,
                            process=process,
                            move_code=first["move_code"],
                            is_deleted=False,
                        )
                        pk_list.append(obj.pk)
                else:
                    pass

        if not len(pk_list) == 0:
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            msc_object_data = MscREdiContent.objects.filter(pk__in=pk_list)
            msc_edi_content_list = msc_object_data.values_list("content", flat=True)
            msc_object_data.update(is_deleted=True)
            msc_edi_content = "".join(msc_edi_content_list)
            date = dt.date().strftime("%d%m%Y")
            time = dt.time().strftime("%I%M%_p")
            site_code = get_msc_site_code(data[0])
            email_data = edi_get_email_data(data)
            # in_out_pk_dict = {}
            main_data = {
                "ref_code": "msc",
                "site_code": site_code,
                "date": date,
                "time": time,
                "content": msc_edi_content,
                "email_data": email_data,
                "in_out_pk_dict": None,
            }
            return main_data
        else:
            return None
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_cordelia_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        depot_code = hf_data["depot_code"]
        list_of_content = []
        count = 0

        in_pk_list = {}
        out_pk_list = {}

        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                cordelia_content_data = cordelia_edi_line_in_content_data(each)
                line_in_current_location_code = cordelia_content_data[
                    "current_location_code"
                ]
                line_in_date = cordelia_content_data["date"]
                line_in_time = cordelia_content_data["time"]
                line_in_size_code = cordelia_content_data["size_code"]
                line_in_container_no = cordelia_content_data["container_no"]
                line_in_location_code = cordelia_content_data["location_code"]
                line_in_booking_no = cordelia_content_data["booking_no"]
                line_in_merged_data = cordelia_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    # location_code=line_in_location_code,
                    booking_no=line_in_booking_no,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                cordelia_content_data = cordelia_edi_line_out_content_data(each)
                line_out_current_location_code = cordelia_content_data[
                    "current_location_code"
                ]
                line_out_date = cordelia_content_data["date"]
                line_out_time = cordelia_content_data["time"]
                line_out_size_code = cordelia_content_data["size_code"]
                line_out_container_no = cordelia_content_data["container_no"]
                # line_out_location_code = cordelia_content_data["location_code"]
                line_out_booking_no = cordelia_content_data["booking_no"]
                line_out_merged_data = cordelia_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    # location_code=line_out_location_code,
                    booking_no=line_out_booking_no,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                cordelia_content_data = cordelia_edi_party_in_content_data(each)
                party_in_current_location_code = cordelia_content_data[
                    "current_location_code"
                ]
                party_in_date = cordelia_content_data["date"]
                party_in_time = cordelia_content_data["time"]
                party_in_size_code = cordelia_content_data["size_code"]
                party_in_container_no = cordelia_content_data["container_no"]
                party_in_location_code = cordelia_content_data["location_code"]
                party_in_booking_no = cordelia_content_data["booking_no"]
                party_in_merged_data = cordelia_edi_party_in_content_format(
                    current_location_code=party_in_current_location_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    # location_code=party_in_location_code,
                    booking_no=party_in_booking_no,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                cordelia_content_data = cordelia_edi_party_out_content_data(each)
                party_out_current_location_code = cordelia_content_data[
                    "current_location_code"
                ]
                party_out_date = cordelia_content_data["date"]
                party_out_time = cordelia_content_data["time"]
                party_out_size_code = cordelia_content_data["size_code"]
                party_out_container_no = cordelia_content_data["container_no"]
                # party_out_location_code = cordelia_content_data["location_code"]
                party_out_booking_no = cordelia_content_data["booking_no"]
                party_out_merged_data = cordelia_edi_party_out_content_format(
                    current_location_code=party_out_current_location_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    # location_code=party_out_location_code,
                    booking_no=party_out_booking_no,
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = cordelia_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "cordelia",
            "site_code": hf_site_code,
            "depot_code": depot_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_repair_edi_mail_process(obj):
    try:
        zim_context = make_zim_repair_edi(data=[obj])
        attachment_list = []
        # back
        back_edi_file_path = None
        if zim_context["content"] is not None:
            back_edi_file_path = make_edi_file(
                ref_code=zim_context["ref_code"],
                site_code=zim_context["site_code"],
                date=zim_context["date"],
                time=zim_context["time"],
                content=zim_context["content"],
                move_code=None,
                back=True,
            )
            attachment_list.append(back_edi_file_path)

        email_data = zim_context["email_data"]
        site_object = obj.container.site
        organization = site_object.organization
        send_mail = send_zim_repair_edi_mail(
            ref_code=email_data["ref_code"],
            attachment_list=attachment_list,
            from_email=email_data["from_email"],
            to_email_list=email_data["to_email_list"],
            cc_email_list=email_data["cc_email_list"],
            organization=organization,
        )
        os.remove(back_edi_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def make_tsline_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}
        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_process(each)
            if process == "Line_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                tsline_content_data = tsline_edi_line_in_content_data(each)
                line_in_operator_code = tsline_content_data["operator_code"]
                line_in_edi_code = tsline_content_data["edi_code"]
                line_in_date = tsline_content_data["date"]
                line_in_time = tsline_content_data["time"]
                line_in_size_code = tsline_content_data["size_code"]
                line_in_container_no = tsline_content_data["container_no"]
                line_in_location_code = tsline_content_data["location_code"]
                line_in_condition = tsline_content_data["condition"]
                line_in_grade = tsline_content_data["grade"]
                line_in_merged_data = tsline_edi_line_in_content_format(
                    operator_code=line_in_operator_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    location_code=line_in_location_code,
                    edi_code=line_in_edi_code,
                    condition=line_in_condition,
                    grade=line_in_grade,
                )
                list_of_content.append(line_in_merged_data)
            elif process == "Line_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                tsline_content_data = tsline_edi_line_out_content_data(each)
                line_out_operator_code = tsline_content_data["operator_code"]
                line_out_edi_code = tsline_content_data["edi_code"]
                line_out_date = tsline_content_data["date"]
                line_out_time = tsline_content_data["time"]
                line_out_size_code = tsline_content_data["size_code"]
                line_out_container_no = tsline_content_data["container_no"]
                line_out_location_code = tsline_content_data["location_code"]
                line_out_condition = tsline_content_data["condition"]
                line_out_booking_no = tsline_content_data["booking_no"]
                # line_out_grade = tsline_content_data["grade"]
                line_out_merged_data = tsline_edi_line_out_content_format(
                    operator_code=line_out_operator_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    location_code=line_out_location_code,
                    edi_code=line_out_edi_code,
                    condition=line_out_condition,
                    booking_no=line_out_booking_no,
                    # grade=line_out_grade,
                )
                list_of_content.append(line_out_merged_data)
            elif process == "Party_IN_Process":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                tsline_content_data = tsline_edi_party_in_content_data(each)
                party_in_operator_code = tsline_content_data["operator_code"]
                party_in_edi_code = tsline_content_data["edi_code"]
                party_in_date = tsline_content_data["date"]
                party_in_time = tsline_content_data["time"]
                party_in_size_code = tsline_content_data["size_code"]
                party_in_container_no = tsline_content_data["container_no"]
                party_in_location_code = tsline_content_data["location_code"]
                party_in_condition = tsline_content_data["condition"]
                party_in_grade = tsline_content_data["grade"]
                party_in_merged_data = tsline_edi_party_in_content_format(
                    operator_code=party_in_operator_code,
                    date=party_in_date,
                    time=party_in_time,
                    msg_no=msg_no,
                    container_no=party_in_container_no,
                    size_code=party_in_size_code,
                    location_code=party_in_location_code,
                    condition=party_in_condition,
                    edi_code=party_in_edi_code,
                    grade=party_in_grade,
                )
                list_of_content.append(party_in_merged_data)
            elif process == "Party_OUT_Process":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                tsline_content_data = tsline_edi_party_out_content_data(each)
                party_out_operator_code = tsline_content_data["operator_code"]
                party_out_edi_code = tsline_content_data["edi_code"]
                party_out_date = tsline_content_data["date"]
                party_out_time = tsline_content_data["time"]
                party_out_size_code = tsline_content_data["size_code"]
                party_out_container_no = tsline_content_data["container_no"]
                party_out_location_code = tsline_content_data["location_code"]
                party_out_booking_no = tsline_content_data["booking_no"]
                party_out_condition = tsline_content_data["condition"]
                # party_out_grade = tsline_content_data["grade"]
                party_out_merged_data = tsline_edi_party_out_content_format(
                    operator_code=party_out_operator_code,
                    date=party_out_date,
                    time=party_out_time,
                    msg_no=msg_no,
                    container_no=party_out_container_no,
                    size_code=party_out_size_code,
                    location_code=party_out_location_code,
                    edi_code=party_out_edi_code,
                    condition=party_out_condition,
                    booking_no=party_out_booking_no,
                    # grade=party_out_grade
                )
                list_of_content.append(party_out_merged_data)
            else:
                pass
        content = "\n".join(list_of_content)
        formatted_edi_data = tsline_edi_hf_format(
            current_location_code=hf_current_location_code,
            line=hf_line,
            date=hf_date,
            time=hf_time,
            site_code=hf_site_code,
            no_of_containers=no_of_containers,
            content=content,
        )
        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}
        main_data = {
            "ref_code": "tsline",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "content": formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }

        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_flk_edi(data):
    try:
        no_of_containers = len(data)
        hf_data = edi_hf_data(data[0])
        email_data = edi_get_email_data(data)
        hf_current_location_code = hf_data["current_location_code"]
        hf_line = hf_data["line"]
        hf_date = hf_data["date"]
        hf_time = hf_data["time"]
        hf_site_code = hf_data["site_code"]
        list_of_rcve_content = []
        list_of_rcvc_content = []
        list_of_trfe_content = []
        list_of_snts_content = []
        count = 0
        in_pk_list = {}
        out_pk_list = {}

        for each in data:
            count = count + 1
            msg_no = count
            db = each._state.db
            process = detect_flk_process(each)

            if process == "RCVE":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                flk_content_data = flk_edi_line_in_content_data(each)
                line_in_current_location_code = flk_content_data[
                    "current_location_code"
                ]
                line_in_date = flk_content_data["date"]
                line_in_time = flk_content_data["time"]
                line_in_size_code = flk_content_data["size_code"]
                line_in_container_no = flk_content_data["container_no"]
                line_in_booking_no = flk_content_data["booking_no"]
                line_in_merged_data = flk_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    booking_no=line_in_booking_no,
                )
                list_of_rcve_content.append(line_in_merged_data)

            elif process == "RCVC":
                if db in in_pk_list.keys():
                    in_pk_list[db].append(each.pk)
                else:
                    in_pk_list[db] = [each.pk]
                flk_content_data = flk_edi_line_in_content_data(each)
                line_in_current_location_code = flk_content_data[
                    "current_location_code"
                ]
                line_in_date = flk_content_data["date"]
                line_in_time = flk_content_data["time"]
                line_in_size_code = flk_content_data["size_code"]
                line_in_container_no = flk_content_data["container_no"]
                line_in_booking_no = flk_content_data["booking_no"]
                line_in_merged_data = flk_edi_line_in_content_format(
                    current_location_code=line_in_current_location_code,
                    date=line_in_date,
                    time=line_in_time,
                    msg_no=msg_no,
                    container_no=line_in_container_no,
                    size_code=line_in_size_code,
                    booking_no=line_in_booking_no,
                    rcvc=True,
                )
                list_of_rcvc_content.append(line_in_merged_data)

            elif process == "TRFE":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                flk_content_data = flk_edi_line_out_content_data(each)
                line_out_current_location_code = flk_content_data[
                    "current_location_code"
                ]
                line_out_date = flk_content_data["date"]
                line_out_time = flk_content_data["time"]
                line_out_size_code = flk_content_data["size_code"]
                line_out_container_no = flk_content_data["container_no"]
                line_out_booking_no = flk_content_data["booking_no"]
                line_out_merged_data = flk_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    booking_no=line_out_booking_no,
                )
                list_of_trfe_content.append(line_out_merged_data)

            elif process == "SNTS":
                if db in out_pk_list.keys():
                    out_pk_list[db].append(each.pk)
                else:
                    out_pk_list[db] = [each.pk]
                flk_content_data = flk_edi_line_out_content_data(each)
                line_out_current_location_code = flk_content_data[
                    "current_location_code"
                ]
                line_out_date = flk_content_data["date"]
                line_out_time = flk_content_data["time"]
                line_out_size_code = flk_content_data["size_code"]
                line_out_container_no = flk_content_data["container_no"]
                line_out_booking_no = flk_content_data["booking_no"]
                line_out_merged_data = flk_edi_line_out_content_format(
                    current_location_code=line_out_current_location_code,
                    date=line_out_date,
                    time=line_out_time,
                    msg_no=msg_no,
                    container_no=line_out_container_no,
                    size_code=line_out_size_code,
                    booking_no=line_out_booking_no,
                    snts=True,
                )
                list_of_snts_content.append(line_out_merged_data)
            else:
                pass

        rcve_formatted_edi_data = None
        if not len(list_of_rcve_content) == 0:
            rcve_content = "\n".join(list_of_rcve_content)
            rcve_formatted_edi_data = flk_edi_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=rcve_content,
            )

        rcvc_formatted_edi_data = None
        if not len(list_of_rcvc_content) == 0:
            rcvc_content = "\n".join(list_of_rcvc_content)
            rcvc_formatted_edi_data = flk_edi_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=rcvc_content,
            )

        trfe_formatted_edi_data = None
        if not len(list_of_trfe_content) == 0:
            trfe_content = "\n".join(list_of_trfe_content)
            trfe_formatted_edi_data = flk_edi_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=trfe_content,
            )

        snts_formatted_edi_data = None
        if not len(list_of_snts_content) == 0:
            snts_content = "\n".join(list_of_snts_content)
            snts_formatted_edi_data = flk_edi_hf_format(
                current_location_code=hf_current_location_code,
                line=hf_line,
                date=hf_date,
                time=hf_time,
                site_code=hf_site_code,
                no_of_containers=no_of_containers,
                content=snts_content,
            )

        in_out_pk_dict = {"in_pk_list": in_pk_list, "out_pk_list": out_pk_list}

        main_data = {
            "ref_code": "flk",
            "site_code": hf_site_code,
            "date": hf_date,
            "time": hf_time,
            "rcve_content": rcve_formatted_edi_data,
            "rcvc_content": rcvc_formatted_edi_data,
            "trfe_content": trfe_formatted_edi_data,
            "snts_content": snts_formatted_edi_data,
            "email_data": email_data,
            "in_out_pk_dict": in_out_pk_dict,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
