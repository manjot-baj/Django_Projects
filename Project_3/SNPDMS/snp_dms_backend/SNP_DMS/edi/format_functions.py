from SNP_DMS.settings.base import BASE_DIR
from django.core.mail import EmailMessage, get_connection
import os
import datetime
from django.utils import timezone
from decouple import config
from depot.models import GateInHistory, GateOutHistory
from master.models import Site
from edi.models import EdiMailTracker, MscEdiContent
import logging, traceback


def mei_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.?'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}+{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}+{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def mei_line_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+MEI+1+9'"
            f"TDT+20++1++:172:20+++:::NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+13+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def mei_party_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+MEI+1+9'"
            f"TDT+20++1++:172:20+++:::NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+13+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.? 'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_line_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
    mir=False,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{current_location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:30480'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        if mir:
            context = (
                f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
                f"BGM+6+1+9'"
                f"TDT+20++1++:172:20+++:::'"
                f"NAD+MS+{current_location_code}'"
                f"NAD+CA+ZIM'"
                f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
                f"RFF+BN:{booking_no}'"
                f"TMD+4'"
                f"DTM+7:{date}{time}:203'"
                f"LOC+165+::+{current_location_code}:STO:ZZZ'"
                f"MEA+AAE+T+KGM:30480'"
                f"SEL+NA+CA+1'"
                f"TDT+1++3+31+ANY:172: 87+++:146'"
                f"CNT+1:1'"
                f"UNT+15+{msg_no}'"
            )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_line_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
    rwm=False,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{current_location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:30480'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        if rwm:
            context = (
                f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
                f"BGM+7+1+9'"
                f"TDT+20++1++:172:20+++:::'"
                f"NAD+MS+{current_location_code}'"
                f"NAD+CA+ZIM'"
                f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
                f"RFF+BN:{booking_no}'"
                f"TMD+4'"
                f"DTM+7:{date}{time}:203'"
                f"LOC+165+::+{current_location_code}:STO:ZZZ'"
                f"MEA+AAE+T+KGM:30480'"
                f"SEL+NA+CA+1'"
                f"TDT+1++3+31+ANY:172: 87+++:146'"
                f"CNT+1:1'"
                f"UNT+15+{msg_no}'"
            )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_party_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
    mir=False,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{current_location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:30480'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        if mir:
            context = (
                f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
                f"BGM+6+1+9'"
                f"TDT+20++1++:172:20+++:::'"
                f"NAD+MS+{current_location_code}'"
                f"NAD+CA+ZIM'"
                f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
                f"RFF+BN:{booking_no}'"
                f"TMD+4'"
                f"DTM+7:{date}{time}:203'"
                f"LOC+165+::+{current_location_code}:STO:ZZZ'"
                f"MEA+AAE+T+KGM:30480'"
                f"SEL+NA+CA+1'"
                f"TDT+1++3+31+ANY:172: 87+++:146'"
                f"CNT+1:1'"
                f"UNT+15+{msg_no}'"
            )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_edi_party_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
    rwm=False,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{current_location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:30480'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        if rwm:
            context = (
                f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
                f"BGM+7+1+9'"
                f"TDT+20++1++:172:20+++:::'"
                f"NAD+MS+{current_location_code}'"
                f"NAD+CA+ZIM'"
                f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
                f"RFF+BN:{booking_no}'"
                f"TMD+4'"
                f"DTM+7:{date}{time}:203'"
                f"LOC+165+::+{current_location_code}:STO:ZZZ'"
                f"MEA+AAE+T+KGM:30480'"
                f"SEL+NA+CA+1'"
                f"TDT+1++3+31+ANY:172: 87+++:146'"
                f"CNT+1:1'"
                f"UNT+15+{msg_no}'"
            )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.?'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}+{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}+{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_line_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_line_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_party_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def apl_edi_party_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.?'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}+{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}+{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_line_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_line_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_party_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def anl_edi_party_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:0'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+14+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        if site_code == "VR":
            site_code = "BR"
        header = f"UNA:+.? 'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_line_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    transporter,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++3+11+HMM+20:103'"
            f"NAD+CF+{location_code}+:172:20'"
            f"EQD+CN+{container_no}+45G1:102:5++3+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+{msg_no}'"
            f"UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_line_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    transporter,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++3+11+HMM+20:103'"
            f"NAD+CF+{location_code}+:172:20'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:{msg_no}'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_party_in_content_format(
    operator_code, date, time, msg_no, container_no, size_code, location_code, edi_code
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++3+11+HMM+20:103'"
            f"NAD+CF+{location_code}+:172:20'"
            f"EQD+CN+{container_no}+45G1:102:5++3+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+{msg_no}'"
            f"UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hmm_edi_party_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    booking_no,
    edi_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++3+11+HMM+20:103'"
            f"NAD+CF+{location_code}+:172:20'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:{msg_no}'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_line_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    grade,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+EG:{grade}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_line_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_party_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    grade,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+EG:{grade}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def rcl_edi_party_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_line_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    transporter,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"DTM+7:{date}{time}:203'"
            # f"LOC+165+::+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"LOC+165+::+{edi_code}:TER:ZZZ'"
            # f"FTX+DAR++{result}'"
            f"TDT+1++3++{transporter}:172'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_line_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    transporter,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            # f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            # f"LOC+165+::+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"LOC+165+::+{edi_code}:TER:ZZZ'"
            # f"FTX+DAR++{result}'"
            # f"TDT+1++3++{transporter}:172'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_party_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"DTM+7:{date}{time}:203'"
            # f"LOC+165+::+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"LOC+165+::+{edi_code}:TER:ZZZ'"
            # f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def esl_edi_party_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            # f"LOC+165+::+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"LOC+165+::+{edi_code}:TER:ZZZ'"
            # f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.?'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}+{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}+{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_line_in_content_format(
    date,
    time,
    msg_no,
    container_no,
    location_code,
    transporter,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG12'"
            f"BGM+34+{msg_no}+9'"
            f"NAD+MS+{location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+GLH01:REP:ZZZ'"
            f"TDT+1++2++31+{transporter}:172:87+++'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_line_out_content_format(
    date,
    time,
    msg_no,
    container_no,
    location_code,
    transporter,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG12'"
            f"BGM+36+{msg_no}+9'"
            f"NAD+MS+{location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+GLH01:REP:ZZZ'"
            f"TDT+1++2++31+{transporter}:172:87+++'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_party_in_content_format(
    date,
    time,
    msg_no,
    container_no,
    location_code,
    transporter,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG12'"
            f"BGM+34+{msg_no}+9'"
            f"NAD+MS+{location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+GLH01:REP:ZZZ'"
            f"TDT+1++2++31+{transporter}:172:87+++'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def qnl_edi_party_out_content_format(
    date,
    time,
    msg_no,
    container_no,
    location_code,
    transporter,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG12'"
            f"BGM+36+{msg_no}+9'"
            f"NAD+MS+{location_code}'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+GLH01:REP:ZZZ'"
            f"TDT+1++2++31+{transporter}:172:87+++'"
            f"CNT+1+1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_n_msk_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_line_in_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    carrier_code,
):
    try:
        if len(carrier_code) == 0:
            carrier_code = "INMERC"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++{carrier_code}:172'"
            f"CNT+1:1'"
            f" UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_line_out_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    carrier_code,
):
    try:
        if len(carrier_code) == 0:
            carrier_code = "INMERC"

        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++{carrier_code}:172'"
            f"CNT+1:1'"
            f" UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_party_in_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    carrier_code,
):
    try:
        if len(carrier_code) == 0:
            carrier_code = "INMERC"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++{carrier_code}:172'"
            f"CNT+1:1'"
            f" UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_edi_party_out_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    booking_no,
    carrier_code,
):
    try:
        if len(carrier_code) == 0:
            carrier_code = "INMERC"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:TER:ZZZ'"
            f"TDT+1++3++{carrier_code}:172'"
            f"CNT+1:1'"
            f" UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_line_in_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    transporter,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:139:6+{location_code}:TER:ZZZ'"
            f"TDT+1++3++{transporter}:172'"
            f"CNT+1+1'"
            f" UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_line_out_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    transporter,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:139:6+{location_code}:TER:ZZZ'"
            f"TDT+1++3++{transporter}:172'"
            f"CNT+1+1'"
            f" UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_party_in_content_format(
    location_code, msg_no, date, time, operator_code, container_no, size_code
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:139:6+{location_code}:TER:ZZZ'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+1'"
            f" UNT+9+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def egl_edi_party_out_content_format(
    location_code,
    msg_no,
    date,
    time,
    operator_code,
    container_no,
    size_code,
    booking_no,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}+:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{location_code}:139:6+{location_code}:TER:ZZZ'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1+1'"
            f" UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def make_edi_file(ref_code, site_code, date, time, content, move_code):
#     try:
#         if ref_code.lower() == "msc" and site_code == "TUT" or site_code == "kaki":
#             if not os.path.exists(os.path.join(BASE_DIR, f"temp/")):
#                 os.makedirs(os.path.join(BASE_DIR, f"temp/"))
#             temp_file_path = os.path.join(
#                 BASE_DIR,
#                 f"temp/{date}_{move_code}_{time}_{site_code}_{ref_code}.edi",
#             )
#             with open(temp_file_path, "w") as temp:
#                 temp.write(content)
#             return temp_file_path
#         else:
#             if ref_code.lower() == "zim":
#                 if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
#                     os.makedirs(os.path.join(BASE_DIR, "temp/"))
#                 temp_file_path = os.path.join(
#                     BASE_DIR, f"temp/codeco_{site_code}_{date}{time}.edi"
#                 )
#                 with open(temp_file_path, "w") as temp:
#                     temp.write(content)
#                 return temp_file_path

#             if ref_code.lower() == "cma" and move_code is not None:
#                 if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
#                     os.makedirs(os.path.join(BASE_DIR, "temp/"))
#                 temp_file_path = os.path.join(
#                     BASE_DIR,
#                     f"temp/{date}_{time}_{site_code}_{move_code}_{ref_code}.edi",
#                 )
#                 with open(temp_file_path, "w") as temp:
#                     temp.write(content)
#                 return temp_file_path

#             else:
#                 if move_code is not None:
#                     if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
#                         os.makedirs(os.path.join(BASE_DIR, "temp/"))
#                     temp_file_path = os.path.join(
#                         BASE_DIR,
#                         f"temp/{date}_{time}_{site_code}_{move_code}_{ref_code}.edi",
#                     )
#                     with open(temp_file_path, "w") as temp:
#                         temp.write(content)
#                     return temp_file_path
#                 else:
#                     if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
#                         os.makedirs(os.path.join(BASE_DIR, "temp/"))
#                     temp_file_path = os.path.join(
#                         BASE_DIR, f"temp/{date}_{time}_{site_code}_{ref_code}.edi"
#                     )
#                     with open(temp_file_path, "w") as temp:
#                         temp.write(content)
#                     return temp_file_path
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


def make_edi_file(
    ref_code,
    site_code,
    date,
    time,
    content,
    move_code,
    depot_code=None,
    dmg=False,
    back=False,
):
    try:

        file_name = f"{date}_{time}_{site_code}_{ref_code}"
        if ref_code.lower() == "msc" and site_code == "TUT" or site_code == "kaki":
            file_name = f"{date}_{move_code}_{time}_{site_code}_{ref_code}"
        elif ref_code.lower() == "zim":
            file_name = f"codeco_{site_code}_{date}{time}"
            if dmg:
                file_name = f"codeco_{site_code}_{date}{time}_dmg"
            if back:
                file_name = f"codeco_{site_code}_{date}{time}_back"
        elif ref_code.lower() == "cordelia" and depot_code is not None:
            file_name = f"{depot_code}_codeco_activity_{date}{time}"
        elif ref_code.lower() == "flk":
            file_name = f"{date}_{time}_flk_{move_code}"
        else:
            if move_code is not None:
                file_name = f"{date}_{time}_{site_code}_{move_code}_{ref_code}"
            else:
                pass
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))

        temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}.edi")
        with open(temp_file_path, "w") as temp:
            temp.write(content)
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def make_mei_file(ref_code, site_code, date, time, content):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{date}_{time}_{site_code}_{ref_code}.mei"
        )
        with open(temp_file_path, "w") as temp:
            temp.write(content)
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def track_mail(data_list, process_type, client, site, is_auto, db):
    try:
        for each in data_list:
            if not each.is_email_sent:
                container_data = each.container.get_container()
                process_date = each.date.astimezone(timezone.get_current_timezone())
                container_no = container_data["container_no"]
                size = container_data["size"]
                type = container_data["type"]
                if process_type == "IN":
                    if (
                        not EdiMailTracker.objects.using(db)
                        .filter(in_data_id=each.pk, is_excel_edi=False)
                        .exists()
                    ):
                        in_data_id = each.pk
                        out_data_id = None
                        tracker_object = EdiMailTracker.objects.using(db).create(
                            process_date=process_date,
                            client=client,
                            process_type=process_type,
                            container_no=container_no,
                            size=size,
                            type=type,
                            site=site,
                            in_data_id=in_data_id,
                            out_data_id=out_data_id,
                        )

                        tracker_object.add_time_diff()
                        tracker_object.is_auto = is_auto
                        tracker_object.save(update_fields=["is_auto"])
                        each.is_email_sent = True
                        each.save(update_fields=["is_email_sent"])

                    else:
                        pass
                else:
                    if (
                        not EdiMailTracker.objects.using(db)
                        .filter(out_data_id=each.pk, is_excel_edi=False)
                        .exists()
                    ):
                        in_data_id = None
                        out_data_id = each.pk
                        tracker_object = EdiMailTracker.objects.using(db).create(
                            process_date=process_date,
                            client=client,
                            process_type=process_type,
                            container_no=container_no,
                            size=size,
                            type=type,
                            site=site,
                            in_data_id=in_data_id,
                            out_data_id=out_data_id,
                        )
                        tracker_object.add_time_diff()
                        tracker_object.is_auto = is_auto
                        tracker_object.save(update_fields=["is_auto"])
                        each.is_email_sent = True
                        each.save(update_fields=["is_email_sent"])
                    else:
                        pass
            else:
                pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def send_edi_mail(
    ref_code,
    site,
    attachment_list,
    from_email,
    to_email_list,
    cc_email_list,
    in_out_pk_dict,
    organization,
    is_auto=True,
    depot_code=None,
):
    try:
        date = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%m/%d/%Y")
        )
        msg = None
        subject = f"EDI From {organization} - {ref_code} - {date}"

        if ref_code.lower() == "esl" and site.lower() == "varnama":
            subject = f"EDI From INVRMGLH00 - {ref_code} - {date}"

        if ref_code.lower() == "cordelia" and depot_code is not None:
            subject = f"{depot_code}_CODECO_ACTIVITY - {date}"

        if (
            ref_code.lower() == "msk"
            and site.lower() == "ahmedabad"
            and organization == config("DEFAULT_ORGANIZATION")
        ):
            host = config("EMAIL_HOST")
            port = 587
            username = config("EMAIL_HOST_USER_AMD")
            password = config("EMAIL_HOST_PASSWORD_AMD")
            use_tls = True
            connection = get_connection(
                host=host,
                username=username,
                password=password,
                port=port,
                use_tls=use_tls,
            )

            msg = EmailMessage(
                subject=subject,
                body="Please find the attachments",
                from_email=from_email,
                to=to_email_list,
                cc=cc_email_list,
                connection=connection,
            )
            for each in attachment_list:
                msg.attach_file(each)
        else:
            msg = EmailMessage(
                subject=subject,
                body="Please find the attachments",
                from_email=from_email,
                to=to_email_list,
                cc=cc_email_list,
            )
            for each in attachment_list:
                msg.attach_file(each)

        try:
            msg.send()
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            pass

        if in_out_pk_dict is not None:
            if not len(in_out_pk_dict) == 0:
                in_pk_list = in_out_pk_dict["in_pk_list"]
                out_pk_list = in_out_pk_dict["out_pk_list"]
                if not len(in_pk_list) == 0:
                    for db in in_pk_list:

                        in_data = GateInHistory.objects.using(db).filter(
                            pk__in=in_pk_list[db]
                        )

                        track_mail(
                            data_list=in_data,
                            process_type="IN",
                            client=ref_code,
                            site=site,
                            is_auto=is_auto,
                            db=db,
                        )
                        in_data.update(is_email_sent=True)
                        # for each in in_data:
                        #     each.is_email_sent = True
                        #     each.save()

                if not len(out_pk_list) == 0:
                    for db in out_pk_list:

                        out_data = GateOutHistory.objects.using(db).filter(
                            pk__in=out_pk_list[db]
                        )

                        track_mail(
                            data_list=out_data,
                            process_type="OUT",
                            client=ref_code,
                            site=site,
                            is_auto=is_auto,
                            db=db,
                        )
                        out_data.update(is_email_sent=True)
                        # for each in out_data:
                        #     each.is_email_sent = True
                        #     each.save()

        return True
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return str(e)


def send_zim_repair_edi_mail(
    ref_code,
    attachment_list,
    from_email,
    to_email_list,
    cc_email_list,
    organization,
):
    try:
        date = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%m/%d/%Y")
        )
        msg = None
        subject = f"EDI From {organization} - {ref_code} - {date}"
        msg = EmailMessage(
            subject=subject,
            body="Please find the attachments",
            from_email=from_email,
            to=to_email_list,
            cc=cc_email_list,
            # to=[
            #     "manjot.bajwa@sunandpearls.com",
            #     "pooja.kumari@sunandpearls.com",
            # ],
            # cc=[
            #     "manjot.bajwa@sunandpearls.com",
            #     "pooja.kumari@sunandpearls.com",
            # ],
        )
        for each in attachment_list:
            msg.attach_file(each)
        msg.send()
        return True
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return str(e)


def send_edi_track_report_mail(
    attachment_list,
    from_email,
    to_email_list,
    date_data,
    connection,
    move_code_tracking=False,
):
    try:
        from_date_str = date_data["from_date_str"]
        to_date_str = date_data["to_date_str"]
        from_time_str = date_data["from_time_str"]
        to_time_str = date_data["to_time_str"]
        subject = ""
        if move_code_tracking:
            subject = f"MSC_EDI_MOVE_CODE MAIL TRACK REPORT OF Last 06 hours - {from_date_str} {from_time_str} to {to_date_str} {to_time_str}"
        else:
            subject = f"EDI MAIL TRACK REPORT OF Last 12 hours - {from_date_str} {from_time_str} to {to_date_str} {to_time_str}"
        msg = EmailMessage(
            subject=subject,
            body="Please find the attachments",
            from_email=from_email,
            to=to_email_list,
        )
        for each in attachment_list:
            msg.attach_file(each)
        msg.send()
        return True
    except Exception as e:
        return str(e)


def zim_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.? '\nUNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}\n"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_line_in_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+34+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"SEL+NA+CA+1'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_line_out_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+36+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'\n"
            f"RFF+BN:{booking_no}'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"SEL+NA+CA+1'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_party_in_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+34+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"SEL+NA+CA+1'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_party_out_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+36+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'\n"
            f"RFF+BN:{booking_no}'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"SEL+NA+CA+1'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_line_dmg_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+999+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"FTX+DAR++5'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_line_back_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+999+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'\n"
            f"RFF+BN:{booking_no}'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_repair_edi_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    booking_no,
    container_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+999+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'\n"
            f"RFF+BN:{booking_no}'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_party_dmg_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+999+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"FTX+DAR++5'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_edi_party_back_content_format(
    current_location_code,
    location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'\n"
            f"BGM+999+1+9'\n"
            f"TDT+20++1++:172:20+++:::'\n"
            f"NAD+MS+{current_location_code}'\n"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'\n"
            f"RFF+BN:{booking_no}'\n"
            f"TMD+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{location_code}::+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:32500'\n"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'\n"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_line_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1:1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_line_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_party_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+1:1'"
            f"UNT+10+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hal_edi_party_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.? 'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_line_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'\n"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:30480'\n"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'\n"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_line_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'\n"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:30480'\n"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'\n"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_party_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'\n"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:30480'\n"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'\n"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cordelia_edi_party_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'\n"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'\n"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'\n"
            f"DTM+7:{date}{time}:203'\n"
            f"LOC+165+{current_location_code}:STO:ZZZ'\n"
            f"MEA+AAE+T+KGM:30480'\n"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'\n"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'\n"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_line_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    grade,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+EG:{grade}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_line_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_party_in_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    grade,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
            f"RFF+EG:{grade}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def tsline_edi_party_out_content_format(
    operator_code,
    date,
    time,
    msg_no,
    container_no,
    size_code,
    location_code,
    edi_code,
    condition,
    booking_no,
):
    try:
        if condition == "OK":
            result = "1"
        else:
            result = "5"
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"NAD+CF+{operator_code}:160'"
            f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
            f"RFF+BN:{booking_no}'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+{edi_code}:139:6+{location_code}:TER:ZZZ'"
            f"FTX+DAR++{result}'"
            f"TDT+1++3++ANY:172'"
            f"CNT+16:1'"
            f"UNT+11+{msg_no}'"
        )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def flk_edi_hf_format(
    current_location_code, line, date, time, site_code, no_of_containers, content
):
    try:
        header = f"UNA:+.? 'UNB+UNOA:1+{current_location_code}+{line}+{date}:{time}+{date}{time}{site_code}'"
        footer = f"UNZ+{no_of_containers}+{date}{time}{site_code}'"
        context = f"{header}\n{content}\n{footer}"
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def flk_edi_line_in_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
    rcvc=False,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+34+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{current_location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:30480'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        if rcvc:
            context = (
                f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
                f"BGM+34+1+9'"
                f"TDT+20++1++:172:20+++:::'"
                f"NAD+MS+{current_location_code}'"
                f"NAD+CA+ZIM'"
                f"EQD+CN+{container_no}+{size_code}:102:5++3+4'"
                f"RFF+BN:{booking_no}'"
                f"TMD+4'"
                f"DTM+7:{date}{time}:203'"
                f"LOC+165+::+{current_location_code}:STO:ZZZ'"
                f"MEA+AAE+T+KGM:30480'"
                f"SEL+NA+CA+1'"
                f"TDT+1++3+31+ANY:172: 87+++:146'"
                f"CNT+1:1'"
                f"UNT+15+{msg_no}'"
            )
        return context
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def flk_edi_line_out_content_format(
    current_location_code,
    date,
    time,
    msg_no,
    container_no,
    booking_no,
    size_code,
    snts=False,
):
    try:
        context = (
            f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
            f"BGM+36+1+9'"
            f"TDT+20++1++:172:20+++:::'"
            f"NAD+MS+{current_location_code}'"
            f"NAD+CA+ZIM'"
            f"EQD+CN+{container_no}+{size_code}:102:5+++4'"
            f"RFF+BN:{booking_no}'"
            f"TMD+4'"
            f"DTM+7:{date}{time}:203'"
            f"LOC+165+::+{current_location_code}:STO:ZZZ'"
            f"MEA+AAE+T+KGM:30480'"
            f"SEL+NA+CA+1'"
            f"TDT+1++3+31+ANY:172: 87+++:146'"
            f"CNT+1:1'"
            f"UNT+15+{msg_no}'"
        )
        if snts:
            context = (
                f"UNH+{msg_no}+CODECO:D:95B:UN:ITG14'"
                f"BGM+36+1+9'"
                f"TDT+20++1++:172:20+++:::'"
                f"NAD+MS+{current_location_code}'"
                f"NAD+CA+ZIM'"
                f"EQD+CN+{container_no}+{size_code}:102:5++2+4'"
                f"RFF+BN:{booking_no}'"
                f"TMD+4'"
                f"DTM+7:{date}{time}:203'"
                f"LOC+165+::+{current_location_code}:STO:ZZZ'"
                f"MEA+AAE+T+KGM:30480'"
                f"SEL+NA+CA+1'"
                f"TDT+1++3+31+ANY:172: 87+++:146'"
                f"CNT+1:1'"
                f"UNT+15+{msg_no}'"
            )
        return context

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
