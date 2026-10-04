from .models import *
from master.models_two import Client
from datetime import date, timedelta
import logging, traceback


def get_date_list(sdate, edate):
    date_list = []
    delta = edate - sdate
    for i in range(delta.days + 1):
        day = sdate + timedelta(days=i)
        date_list.append(day)
    return date_list


def container_no_filter(container_no_list, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [
                each
                for each in data_list
                for container_no in container_no_list
                if each.container.container_no == container_no
            ]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def client_filter(client, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if each.container.client.name == client]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def booking_no_filter(booking_no, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if booking_no == each.booking_no]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def status_filter(status, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            data = [each for each in data_list if status == each.status]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def gate_in_date_filter(from_date, to_date, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            date_list = get_date_list(sdate=from_date, edate=to_date)
            gate_in_object_list = [
                each
                for date_object in date_list
                for each in GateIn.objects.all()
                if date_object == each.in_date
            ]
            data = [
                each
                for gate_in_object in gate_in_object_list
                for each in data_list
                if gate_in_object == each.gate_in
            ]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def available_date_filter(from_date, to_date, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            date_list = get_date_list(sdate=from_date, edate=to_date)
            data = [
                each
                for date_object in date_list
                for each in data_list
                if date_object == each.available_date
            ]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def allotment_date_filter(from_date, to_date, data_list):
    try:
        if len(data_list) == 0:
            return []
        else:
            date_list = get_date_list(sdate=from_date, edate=to_date)
            data = [
                each
                for date_object in date_list
                for each in data_list
                if date_object == each.allotment_date
            ]
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []
