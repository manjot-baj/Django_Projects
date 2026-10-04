from master.models import TypeSizeCode, Transporter
from depot.models import ContainerStock
import datetime
from decouple import config
from django.utils import timezone
from account.models import AccountUser
import logging, traceback
from depot.models import *


def is_edi_enabled(obj_data):
    try:
        edi_service = obj_data.container.client.edi_service
        if (
            edi_service is True
            and obj_data.container.client.edi_to_email_id is not None
        ):
            return edi_service
        else:
            return False
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def is_edi_service_enabled(obj_data):
    try:
        edi_service = obj_data.container.client.edi_service
        return edi_service
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def detect_line(obj_data):
    try:
        line = obj_data.container.client.ref_code
        return line.upper()
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def detect_site(obj_data):
    try:
        site = obj_data.container.site.name
        return site.upper()
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def detect_process(obj_data):
    try:
        try:
            gate_in = obj_data.gate_in
            if gate_in:
                if obj_data.lolo.apply_charges == "Line":
                    return "Line_IN_Process"
                else:
                    return "Party_IN_Process"
        except:
            gate_out = obj_data.gate_out
            if gate_out:
                if obj_data.lolo.apply_charges == "Line":
                    return "Line_OUT_Process"
                else:
                    return "Party_OUT_Process"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    
    
def detect_flk_process(obj_data):
    try:
        try:
            if obj_data.gate_in.arrived == "Factory":
                return "RCVC"
            else:
                return "RCVE"
        except:
            if obj_data.gate_out.departed == "Factory":
                return "SNTS"
            else:
                return "TRFE"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def detect_rwm_process(obj_data):
    try:
        in_record = GateInHistory.objects.get(
            container=obj_data.container, gate_in=obj_data.gate_in
        )
        if in_record.lolo.apply_charges == "Line":
            return "Line_OUT_Process"
        else:
            return "Party_OUT_Process"
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def edi_hf_data(obj_data):
    try:
        data = {}
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        line = obj_data.container.client.ref_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%y%m%d")
        time = dt.time().strftime("%H%M")
        site_code = obj_data.container.client.site.code
        depot_code = obj_data.container.client.site.depot_code
        data["current_location_code"] = current_location_code
        data["line"] = line
        data["date"] = date
        data["time"] = time
        data["site_code"] = site_code
        data["depot_code"] = depot_code
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def edi_get_email_data(obj_data_list):
    try:
        data = {}
        to_email_id_sub_list = []
        cc_email_id_sub_list = []
        to_email_id_list = []
        cc_email_id_list = []
        site = None
        for obj_data in obj_data_list:
            try:
                if (
                    not obj_data.container.site.organization
                    == "Golden Horn Containers Service"
                ):
                    site = obj_data.container.site
            except:
                pass
            to_email_id = obj_data.container.client.edi_to_email_id
            cc_email_id = obj_data.container.client.edi_cc_email_id
            if to_email_id is not None and cc_email_id is not None:
                to_email_id_sub_list.append(to_email_id.split(","))
                cc_email_id_sub_list.append(cc_email_id.split(","))
        if not site is None:
            cc_email_id_list.append("clients@sunandpearls.com")
        for i in to_email_id_sub_list:
            to_email_id_list += i
        for j in cc_email_id_sub_list:
            if site is None:
                cc_email_id_list += j
        ref_code = obj_data_list[0].container.client.ref_code
        data["from_email"] = config("EMAIL_HOST_USER")
        data["to_email_list"] = to_email_id_list
        data["cc_email_list"] = cc_email_id_list
        data["ref_code"] = ref_code
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_site_user_email_mobile_data(site, connection):
    try:
        data = {}
        location_admin = AccountUser.objects.using(connection).filter(
            site__name=site, role__name="Location Admin", edi_track_notification=True
        )
        site_admin = AccountUser.objects.using(connection).filter(
            site__name=site, role__name="Site Admin", edi_track_notification=True
        )
        depot_user = AccountUser.objects.using(connection).filter(
            site__name=site, role__name="Depot User", edi_track_notification=True
        )
        to_email_id_list = []
        to_email_id_list_main = []
        to_mobile_no_list = []
        to_mobile_no_list_main = []

        for each in location_admin:
            if each.email_id is not None and not each.email_id == "NA":
                to_email_id_list.append(each.email_id)

            if each.mobile_no is not None and not each.mobile_no == "NA":
                to_mobile_no_list.append(each.mobile_no)

        for each in site_admin:
            if each.email_id is not None and not each.email_id == "NA":
                to_email_id_list.append(each.email_id)
            if each.mobile_no is not None and not each.mobile_no == "NA":
                to_mobile_no_list.append(each.mobile_no)

        for each in depot_user:
            if each.email_id is not None and not each.email_id == "NA":
                to_email_id_list.append(each.email_id)
            if each.mobile_no is not None and not each.mobile_no == "NA":
                to_mobile_no_list.append(each.mobile_no)

        for id in to_email_id_list:
            if not id in to_email_id_list_main:
                to_email_id_list_main.append(id)

        for no in to_mobile_no_list:
            if not id in to_mobile_no_list_main:
                to_mobile_no_list_main.append(no)

        data["from_email"] = config("EMAIL_HOST_USER")
        data["from_mobile_no"] = config("TWILIO_HOST_MOBILE_NO")
        data["to_email_list"] = to_email_id_list_main
        data["to_mobile_no_list"] = to_mobile_no_list_main
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_edi_email_data(obj_data_list):
    try:
        data = {}
        to_email_id_sub_list = []
        cc_email_id_sub_list = []
        to_email_id_list = []
        cc_email_id_list = []
        ref_code = list(obj_data_list)[0].ref_code.upper()
        for obj_data in obj_data_list:
            to_email_id = obj_data.edi_to_email_id
            cc_email_id = obj_data.edi_cc_email_id
            if to_email_id is not None and cc_email_id is not None:
                to_email_id_sub_list.append(to_email_id.split(","))
                cc_email_id_sub_list.append(cc_email_id.split(","))
        for i in to_email_id_sub_list:
            to_email_id_list += i
        for j in cc_email_id_sub_list:
            cc_email_id_list += j
        data["from_email"] = config("EMAIL_HOST_USER")
        data["to_email_list"] = to_email_id_list
        data["cc_email_list"] = cc_email_id_list
        data["ref_code"] = ref_code
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_content_data(obj_data, is_gate_in):
    try:
        data = {}
        db = obj_data._state.db
        size_code = ""
        if (
            TypeSizeCode.objects.using(db)
            .filter(type=obj_data.container.type, size=obj_data.container.size)
            .exists()
        ):
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=obj_data.container.type, size=obj_data.container.size
            )
            size_code = ts_code_object.code

        booking_no = ""
        date_str = ""
        time_str = ""
        if is_gate_in:
            stock_object = ContainerStock.objects.using(db).get(
                container=obj_data.container, gate_in=obj_data.gate_in
            )
            if not stock_object.booking_no is None:
                booking_no = stock_object.booking_no
            date_str = obj_data.gate_in.in_date.strftime("%Y%m%d")
            time_str = obj_data.gate_in.in_time.strftime("%H%M")
        else:
            if obj_data.gate_out.booking_no is not None:
                booking_no = (
                    ""
                    if obj_data.gate_out.booking_no is None
                    else obj_data.gate_out.booking_no
                )
            date_str = obj_data.gate_out.out_date.strftime("%Y%m%d")
            time_str = obj_data.gate_out.out_time.strftime("%H%M")

        data["current_location_code"] = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        data["date"] = date_str
        data["time"] = time_str
        data["size_code"] = size_code
        data["container_no"] = obj_data.container.container_no
        data["location_code"] = (
            ""
            if obj_data.container.client.location_code is None
            else obj_data.container.client.location_code
        )
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_line_in_content_data(obj_data, mir=False):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")

        if mir:
            gate_in_date_time = datetime.datetime.combine(
                obj_data.gate_in.in_date, obj_data.gate_in.in_time
            ).astimezone(timezone.get_current_timezone())
            mir_date_time = gate_in_date_time + datetime.timedelta(minutes=10)
            date = mir_date_time.date().strftime("%Y%m%d")
            time = mir_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if mir:
            data["mir_date_time"] = mir_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_party_in_content_data(obj_data, mir=False):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")

        if mir:
            gate_in_date_time = datetime.datetime.combine(
                obj_data.gate_in.in_date, obj_data.gate_in.in_time
            ).astimezone(timezone.get_current_timezone())
            mir_date_time = gate_in_date_time + datetime.timedelta(minutes=10)
            date = mir_date_time.date().strftime("%Y%m%d")
            time = mir_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if mir:
            data["mir_date_time"] = mir_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_line_out_content_data(obj_data, rwm=False, stock=False):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = ""
        time = ""
        try:
            date = obj_data.gate_out.out_date.strftime("%Y%m%d")
            time = obj_data.gate_out.out_time.strftime("%H%M")
        except:
            date = ""
            time = ""

        if rwm:
            rwm_date_time = None
            if stock is False:
                out_data = GateOutHistory.objects.using(db).get(
                    container=obj_data.container, gate_out=obj_data.gate_out
                )
                rwm_date_time = out_data.date - datetime.timedelta(minutes=10)
            else:
                rwm_date_time = dt
                if obj_data.available_in_date_time is not None:
                    rwm_date_time = obj_data.available_in_date_time
            date = rwm_date_time.date().strftime("%Y%m%d")
            time = rwm_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        booking_no = ""
        try:
            gate_out_object = obj_data.gate_out
            if gate_out_object.booking_no is None:
                booking_no = ""
            else:
                booking_no = gate_out_object.booking_no
        except:
            booking_no = ""
        if stock is True and obj_data.booking_no is not None:
            booking_no = obj_data.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if rwm:
            data["rwm_date_time"] = rwm_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_party_out_content_data(obj_data, rwm=False, stock=False):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = ""
        time = ""
        try:
            date = obj_data.gate_out.out_date.strftime("%Y%m%d")
            time = obj_data.gate_out.out_time.strftime("%H%M")
        except:
            date = ""
            time = ""

        if rwm:
            rwm_date_time = None
            if stock is False:
                out_data = GateOutHistory.objects.using(db).get(
                    container=obj_data.container, gate_out=obj_data.gate_out
                )
                rwm_date_time = out_data.date - datetime.timedelta(minutes=10)
            else:
                rwm_date_time = dt
                if obj_data.available_in_date_time is not None:
                    rwm_date_time = obj_data.available_in_date_time
            date = rwm_date_time.date().strftime("%Y%m%d")
            time = rwm_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        booking_no = ""
        try:
            gate_out_object = obj_data.gate_out
            if gate_out_object.booking_no is None:
                booking_no = ""
            else:
                booking_no = gate_out_object.booking_no
        except:
            booking_no = ""
        if stock is True and obj_data.booking_no is not None:
            booking_no = obj_data.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if rwm:
            data["rwm_date_time"] = rwm_date_time

        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"

        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no

        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        grade = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        # grade = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        if obj_data.gate_out.booking_no is None:
            booking_no = ""
        else:
            booking_no = (
                ""
                if obj_data.gate_out.booking_no is None
                else obj_data.gate_out.booking_no
            )
        data["booking_no"] = booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        # data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        grade = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        # grade = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        # data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        data["size_code"] = size_code
        data["date"] = date
        data["time"] = time
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        data["size_code"] = size_code
        data["date"] = date
        data["time"] = time
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        data["size_code"] = size_code
        data["date"] = date
        data["time"] = time
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        data["size_code"] = size_code
        data["date"] = date
        data["time"] = time
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_in.carrier_code is None:
            carrier_code = ""
        else:
            carrier_code = obj_data.gate_in.carrier_code
        data["carrier_code"] = carrier_code
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_out.carrier_code is None:
            carrier_code = ""
        else:
            carrier_code = obj_data.gate_out.carrier_code
        data["carrier_code"] = carrier_code
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        if obj_data.gate_in.carrier_code is None:
            carrier_code = ""
        else:
            carrier_code = obj_data.gate_in.carrier_code
        data["carrier_code"] = carrier_code
        location_code = obj_data.container.client.location_code
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        if obj_data.gate_out.carrier_code is None:
            carrier_code = ""
        else:
            carrier_code = obj_data.gate_out.carrier_code
        data["carrier_code"] = carrier_code
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["transporter"] = transporter
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_msc_site_code(obj_data):
    try:
        site_code = obj_data.container.client.site.code
        return site_code
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def detect_arrived_by(obj_data):
    try:
        arrived = obj_data.gate_in.get_gate_in()["arrived"]
        if arrived == "Factory":
            process = "factory_in"
            return process
        elif arrived == "Road/Rail":
            process = "road_in"
            return process
        elif arrived == "FS RETURN":
            process = "fs_return_in"
            return process
        elif arrived == "CFS/ICD":
            process = "cfs_in"
            return process
        elif arrived == "Port/Vessel":
            process = "vessel_in"
            return process
        else:
            process = None
            return process
    except:
        departed = obj_data.gate_out.get_gate_out()["departed"]
        if departed == "Factory":
            process = "factory_out"
            return process
        elif departed == "Road/Rail":
            process = "road_out"
            return process
        elif departed == "FS RETURN":
            process = "fs_return_out"
            return process
        elif departed == "CFS/ICD":
            process = "cfs_out"
            return process
        elif departed == "Port/Vessel":
            process = "vessel_out"
            return process
        else:
            process = None
            return process


def detect_repair_type(obj_data):
    condition = None
    try:
        condition = obj_data.gate_in.condition
    except:
        container_stock = ContainerStock.objects.filter(
            gate_out=obj_data.gate_out
        ).first()
        condition = container_stock.gate_in.condition

    if condition and condition in ["OK", "CLEANING", "AV"]:
        return "Washing"
    else:
        return "Damage"


def msc_edi_cfs_in_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DVAN"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time - datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.gate_in.from_location_code is None
            else obj_data.gate_in.from_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_location_code = "{:<5}".format(location_code)
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        # transporter = "" if obj_data.gate_in.transporter_name is None else obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_cfs_in_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MTIN"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_location_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_cfs_in_third_content_data(obj_data):
    try:
        db = obj_data._state.db

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_location_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_cfs_in_fourth_content_data(obj_data):
    try:
        db = obj_data._state.db

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_location_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_factory_in_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MTIN"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_factory_in_second_content_data(obj_data):
    try:
        db = obj_data._state.db

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_factory_in_third_content_data(obj_data):
    try:
        db = obj_data._state.db

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = ""
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_vessel_in_first_content_data(obj_data):
    try:
        db = obj_data._state.db
        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MIR"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_port_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        vessel_voyage = ""
        if (
            not obj_data.gate_in.vessel_name is None
            and not obj_data.gate_in.voyage_no is None
        ):
            vessel_voyage = (
                f"{obj_data.gate_in.vessel_name} - {obj_data.gate_in.voyage_no}"
            )
        booking_no = vessel_voyage
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_in.vehicle_no is None else obj_data.gate_in.vehicle_no
        )
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_vessel_in_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_port_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = (
            "" if obj_data.gate_in.vehicle_no is None else obj_data.gate_in.vehicle_no
        )
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        if obj_data.container.location.name == "MUNDRA":
            mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_vessel_in_third_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_port_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = (
            "" if obj_data.gate_in.vehicle_no is None else obj_data.gate_in.vehicle_no
        )
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        if obj_data.container.location.name == "MUNDRA":
            mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_road_in_first_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MIR"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_road_in_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = ""
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_road_in_third_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = ""
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_fs_return_in_first_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "RET"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_in.get_gate_in()["from_location_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = obj_data.gate_in.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_fs_return_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "VAN"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_cfs_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "VAN"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_cfs_out_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_factory_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "VAN"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_factory_out_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_vessel_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MOR"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_out.get_gate_out()["to_location_code"]
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        if (
            obj_data.container.site.name == "INGHK"
            or obj_data.container.site.name == "INGHC"
        ):
            if (
                obj_data.gate_out.transporter_name is not None
                and obj_data.gate_out.transporter_name.code is not None
            ):
                transporter = obj_data.gate_out.transporter_name.code

        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        if obj_data.container.site.name == "PGL Depot":
            mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_vessel_out_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = obj_data.gate_out.get_gate_out()["to_port_code"]
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_road_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MOR"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = (
            ""
            if obj_data.gate_out.to_location_code is None
            else obj_data.gate_out.to_location_code
        )
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        transporter = ""
        if not obj_data.gate_out.transporter_name is None:
            if not obj_data.gate_out.transporter_name.code is None:
                transporter = obj_data.gate_out.transporter_name.code
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        if obj_data.container.site.name == "PGL Depot":
            mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_edi_road_out_second_content_data(obj_data):
    try:

        #

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = "" if obj_data.gate_out.to_location_code is None else obj_data.gate_out.to_location_code
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        # customer = "" if obj_data.lolo.customer_name is None else obj_data.lolo.customer_name.name
        customer = ""
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.code
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        # truck_no = "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        truck_no = ""
        format_truck_no = "{:<25}".format(truck_no)
        # condition = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_cfs_in_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DVAN"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time - datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.gate_in.from_location_code is None
            else obj_data.gate_in.from_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""
        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_cfs_in_second_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MTIN"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_in.from_location_code

        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""

        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_cfs_in_third_content_data(obj_data):
    try:
        db = obj_data._state.db

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_in.from_location_code

        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_cfs_in_fourth_content_data(obj_data):
    try:
        db = obj_data._state.db

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_in.from_location_code

        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_factory_in_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MTIN"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_factory_in_second_content_data(obj_data):
    try:
        db = obj_data._state.db

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_factory_in_third_content_data(obj_data):
    try:
        db = obj_data._state.db

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = ""
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_vessel_in_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MOR"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time - datetime.timedelta(minutes=60)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.gate_in.from_location_code is None
            else obj_data.gate_in.from_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_location_code = "{:<5}".format(location_code)
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = obj_data.container.client.reported_by_to
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_vessel_in_second_content_data(obj_data):
    try:
        db = obj_data._state.db

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MIR"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_in.get_gate_in()["from_port_code"]

        format_location_code = "{:<5}".format(location_code)
        # stock_object = ContainerStock.objects.using(db).get(gate_in=obj_data.gate_in)
        # stock_data = stock_object.get_stock()
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_vessel_in_third_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_in.get_gate_in()["from_port_code"]

        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_vessel_in_fourth_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_in.get_gate_in()["from_port_code"]

        format_location_code = "{:<5}".format(location_code)
        # booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref
        booking_no = ""

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_road_in_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MIR"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_road_in_second_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "DMG_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = ""
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_road_in_third_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_OUT_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_in_date = obj_data.gate_in.in_date
        gate_in_time = obj_data.gate_in.in_time
        gate_in_date_time = datetime.datetime.combine(
            date=gate_in_date, time=gate_in_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_in_date_time + datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        # location_code = ""
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = "" if obj_data.gate_in.do_ref is None else obj_data.gate_in.do_ref

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = obj_data.gate_in.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = obj_data.gate_in.vehicle_no
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        # if container_data["site"] == "kakinada":
        #     condition = ""
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = "" if obj_data.gate_in.remarks is None else obj_data.gate_in.remarks

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = ""
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_cfs_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "VAN"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_cfs_out_second_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""

        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""

        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_factory_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "VAN"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )
        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_factory_out_second_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = ""
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""

        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_vessel_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MOR"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_out.get_gate_out()["to_location_code"]
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_vessel_out_second_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = obj_data.gate_out.get_gate_out()["to_port_code"]

        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""

        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_road_out_first_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "MOR"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = (
            ""
            if obj_data.gate_out.to_location_code is None
            else obj_data.gate_out.to_location_code
        )
        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )
        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""
        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = "R"
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_edi_road_out_second_content_data(obj_data):
    try:

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        container_no = obj_data.container.container_no
        format_container_no = "{:<15}".format(container_no)
        c_size = obj_data.container.size.name
        c_type = obj_data.container.type.name
        c_size_type = c_size + c_type
        format_c_size_type = "{:<10}".format(c_size_type)
        move_code = "REP_RET_MT"
        format_move_code = "{:<10}".format(move_code)
        gate_out_date = obj_data.gate_out.out_date
        gate_out_time = obj_data.gate_out.out_time
        gate_out_date_time = datetime.datetime.combine(
            date=gate_out_date, time=gate_out_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = gate_out_date_time - datetime.timedelta(minutes=15)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        current_location = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        format_current_location = "{:<5}".format(current_location)
        location_code = (
            ""
            if obj_data.gate_out.to_location_code is None
            else obj_data.gate_out.to_location_code
        )

        format_location_code = "{:<5}".format(location_code)
        booking_no = (
            "" if obj_data.gate_out.booking_no is None else obj_data.gate_out.booking_no
        )

        format_booking_no = "{:<25}".format(booking_no)
        customer = (
            ""
            if obj_data.lolo.customer_name is None
            else obj_data.lolo.customer_name.name
        )

        format_customer = "{:<10}".format(customer)
        # transporter = "" if obj_data.gate_out.transporter_name is None else obj_data.gate_out.transporter_name.name
        transporter = ""
        format_transporter = "{:<10}".format(transporter)
        truck_no = (
            "" if obj_data.gate_out.vehicle_no is None else obj_data.gate_out.vehicle_no
        )
        if truck_no == "_" or truck_no == "-" or truck_no == "-NA-" or truck_no == "NA":
            truck_no = ""

        format_truck_no = "{:<25}".format(truck_no)
        condition = ""

        format_condition = "{:<1}".format(condition)
        reported_by = (
            ""
            if obj_data.container.client.reported_by_from is None
            else obj_data.container.client.reported_by_from
        )
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        # remarks = obj_data.gate_out.seal_no
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        mode_of_transport = ""
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        job_order_no = (
            "" if obj_data.gate_out.seal_no is None else obj_data.gate_out.seal_no
        )
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_location_code[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_line_in_content_data(obj_data, dmg=False):
    try:
        data = {}

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        db = obj_data._state.db
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""

        if dmg:
            dmg_date_time = obj_data.date.astimezone(
                timezone.get_current_timezone()
            ) + datetime.timedelta(minutes=15)
            date = (
                dmg_date_time.astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%Y%m%d")
            )
            time = (
                dmg_date_time.astimezone(timezone.get_current_timezone())
                .time()
                .strftime("%H%M")
            )

        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_party_in_content_data(obj_data, dmg=False):
    try:
        data = {}

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        db = obj_data._state.db
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""

        if dmg:
            dmg_date_time = obj_data.date.astimezone(
                timezone.get_current_timezone()
            ) + datetime.timedelta(minutes=15)
            date = (
                dmg_date_time.astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%Y%m%d")
            )
            time = (
                dmg_date_time.astimezone(timezone.get_current_timezone())
                .time()
                .strftime("%H%M")
            )

        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_line_out_content_data(obj_data, back=False):
    try:
        data = {}

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        db = obj_data._state.db
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""

        # if back:
        #     back_date_time = obj_data.date.astimezone(
        #         timezone.get_current_timezone()
        #     ) - datetime.timedelta(minutes=15)
        #     date = (
        #         back_date_time.astimezone(timezone.get_current_timezone())
        #         .date()
        #         .strftime("%Y%m%d")
        #     )
        #     time = (
        #         back_date_time.astimezone(timezone.get_current_timezone())
        #         .time()
        #         .strftime("%H%M")
        #     )

        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_party_out_content_data(obj_data, back=False):
    try:
        data = {}

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        db = obj_data._state.db
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""

        # if back:
        #     back_date_time = obj_data.date.astimezone(
        #         timezone.get_current_timezone()
        #     ) - datetime.timedelta(minutes=15)
        #     date = (
        #         back_date_time.astimezone(timezone.get_current_timezone())
        #         .date()
        #         .strftime("%Y%m%d")
        #     )
        #     time = (
        #         back_date_time.astimezone(timezone.get_current_timezone())
        #         .time()
        #         .strftime("%H%M")
        #     )

        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def fix_available_date_issue(obj_data):
    try:
        if obj_data.gate_out:
            temp_date_time = datetime.datetime.combine(
                obj_data.gate_out.out_date, obj_data.gate_out.out_time
            ).astimezone(timezone.get_current_timezone()) - datetime.timedelta(
                minutes=15
            )
            obj_data.available_date = temp_date_time.date()
            obj_data.available_time = temp_date_time.time()
            obj_data.save()
        else:
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            obj_data.available_date = dt.date()
            obj_data.available_time = dt.time()
            obj_data.save()
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_repair_edi_content_data(obj_data):
    try:
        data = {}
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        if not obj_data.available_date or not obj_data.available_time:
            _ = fix_available_date_issue(obj_data)
        date = obj_data.available_date.strftime("%Y%m%d")
        time = obj_data.available_time.strftime("%H%M")
        location_code = obj_data.container.client.location_code
        if obj_data.booking_no is None:
            booking_no = ""
        else:
            booking_no = obj_data.booking_no
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        db = obj_data._state.db
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        if obj_data.gate_out.booking_no is None:
            booking_no = ""
        else:
            booking_no = (
                ""
                if obj_data.gate_out.booking_no is None
                else obj_data.gate_out.booking_no
            )
        data["booking_no"] = booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_line_in_content_data(obj_data, mir=False):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")

        if mir:
            gate_in_date_time = datetime.datetime.combine(
                obj_data.gate_in.in_date, obj_data.gate_in.in_time
            ).astimezone(timezone.get_current_timezone())
            mir_date_time = gate_in_date_time + datetime.timedelta(minutes=10)
            date = mir_date_time.date().strftime("%Y%m%d")
            time = mir_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if obj_data.gate_in.bl_no is None:
            booking_no = ""
        else:
            booking_no = obj_data.gate_in.bl_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if mir:
            data["mir_date_time"] = mir_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_party_in_content_data(obj_data, mir=False):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")

        if mir:
            gate_in_date_time = datetime.datetime.combine(
                obj_data.gate_in.in_date, obj_data.gate_in.in_time
            ).astimezone(timezone.get_current_timezone())
            mir_date_time = gate_in_date_time + datetime.timedelta(minutes=10)
            date = mir_date_time.date().strftime("%Y%m%d")
            time = mir_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if obj_data.gate_in.bl_no is None:
            booking_no = ""
        else:
            booking_no = obj_data.gate_in.bl_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if mir:
            data["mir_date_time"] = mir_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_line_out_content_data(obj_data, rwm=False, stock=False):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = ""
        time = ""
        try:
            date = obj_data.gate_out.out_date.strftime("%Y%m%d")
            time = obj_data.gate_out.out_time.strftime("%H%M")
        except:
            date = ""
            time = ""

        if rwm:
            rwm_date_time = None
            if stock is False:
                out_data = GateOutHistory.objects.using(db).get(
                    container=obj_data.container, gate_out=obj_data.gate_out
                )
                rwm_date_time = out_data.date - datetime.timedelta(minutes=10)
            else:
                rwm_date_time = dt
                if obj_data.available_in_date_time is not None:
                    rwm_date_time = obj_data.available_in_date_time
            date = rwm_date_time.date().strftime("%Y%m%d")
            time = rwm_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        booking_no = ""
        try:
            gate_out_object = obj_data.gate_out
            if gate_out_object.booking_no is None:
                booking_no = ""
            else:
                booking_no = gate_out_object.booking_no
        except:
            booking_no = ""
        if stock is True and obj_data.booking_no is not None:
            booking_no = obj_data.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if rwm:
            data["rwm_date_time"] = rwm_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_party_out_content_data(obj_data, rwm=False, stock=False):
    try:
        data = {}
        db = obj_data._state.db

        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = ""
        time = ""
        try:
            date = obj_data.gate_out.out_date.strftime("%Y%m%d")
            time = obj_data.gate_out.out_time.strftime("%H%M")
        except:
            date = ""
            time = ""

        if rwm:
            rwm_date_time = None
            if stock is False:
                out_data = GateOutHistory.objects.using(db).get(
                    container=obj_data.container, gate_out=obj_data.gate_out
                )
                rwm_date_time = out_data.date - datetime.timedelta(minutes=10)
            else:
                rwm_date_time = dt
                if obj_data.available_in_date_time is not None:
                    rwm_date_time = obj_data.available_in_date_time
            date = rwm_date_time.date().strftime("%Y%m%d")
            time = rwm_date_time.time().strftime("%H%M")

        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        booking_no = ""
        try:
            gate_out_object = obj_data.gate_out
            if gate_out_object.booking_no is None:
                booking_no = ""
            else:
                booking_no = gate_out_object.booking_no
        except:
            booking_no = ""
        if stock is True and obj_data.booking_no is not None:
            booking_no = obj_data.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        if rwm:
            data["rwm_date_time"] = rwm_date_time
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        grade = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_in.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        # grade = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        try:
            transporter_name = obj_data.gate_out.transporter_name
            transporter_object = Transporter.objects.using(db).get(
                name=transporter_name
            )
            transporter = transporter_object.code
        except:
            transporter = "ANY"
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        if obj_data.gate_out.booking_no is None:
            booking_no = ""
        else:
            booking_no = (
                ""
                if obj_data.gate_out.booking_no is None
                else obj_data.gate_out.booking_no
            )
        data["booking_no"] = booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["transporter"] = transporter
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        # data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_party_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        grade = "" if obj_data.gate_in.grade is None else obj_data.gate_in.grade
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_in.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data = {key: value if value is not None else "" for key, value in data.items()}
        data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_party_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db

        operator_code = obj_data.container.client.operator_code
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_out.out_date.strftime("%Y%m%d")
        time = obj_data.gate_out.out_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        # grade = "" if obj_data.gate_out.grade is None else obj_data.gate_out.grade
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        edi_code = obj_data.container.client.edi_code
        if obj_data.gate_out.condition == "OK":
            condition = "OK"
        else:
            condition = "NOT OK"
        gate_out_object = obj_data.gate_out
        if gate_out_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = gate_out_object.booking_no
        data["operator_code"] = operator_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["edi_code"] = edi_code
        data["condition"] = condition
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        # data["grade"] = grade
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def flk_edi_line_in_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = obj_data.gate_in.in_date.strftime("%Y%m%d")
        time = obj_data.gate_in.in_time.strftime("%H%M")
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        gate_in_object = obj_data.gate_in
        container_object = obj_data.container
        stock_object = ContainerStock.objects.using(db).get(
            container=container_object, gate_in=gate_in_object
        )
        if stock_object.booking_no is None:
            booking_no = ""
        else:
            booking_no = stock_object.booking_no
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def flk_edi_line_out_content_data(obj_data):
    try:
        data = {}
        db = obj_data._state.db
        current_location_code = (
            ""
            if obj_data.container.client.current_location_code is None
            else obj_data.container.client.current_location_code
        )
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = ""
        time = ""
        try:
            date = obj_data.gate_out.out_date.strftime("%Y%m%d")
            time = obj_data.gate_out.out_time.strftime("%H%M")
        except:
            date = ""
            time = ""
        type_object = obj_data.container.type
        size_object = obj_data.container.size
        try:
            ts_code_object = TypeSizeCode.objects.using(db).get(
                type=type_object, size=size_object
            )
            size_code = ts_code_object.code
        except:
            size_code = ""
        container_no = obj_data.container.container_no
        location_code = obj_data.container.client.location_code
        booking_no = ""
        try:
            gate_out_object = obj_data.gate_out
            if gate_out_object.booking_no is None:
                booking_no = ""
            else:
                booking_no = gate_out_object.booking_no
        except:
            booking_no = ""
        data["current_location_code"] = current_location_code
        data["date"] = date
        data["time"] = time
        data["size_code"] = size_code
        data["container_no"] = container_no
        data["location_code"] = location_code
        data["booking_no"] = booking_no
        data = {key: value if value is not None else "" for key, value in data.items()}
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
