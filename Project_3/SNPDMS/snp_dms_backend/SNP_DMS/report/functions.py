from depot.models import (
    ContainerStock,
    GateInHistory,
    GateOutHistory,
    ContainerInOutRecord,
)
from mnr.models import Approval, Estimate, Repair, SurveyLine, Survey
import datetime
from datetime import timedelta
from django.utils import timezone
from common.functions import *
from master.models_two import *
from edi.models import EdiMailTracker
import logging, traceback
from django.db.models import Sum
from django.db.models.functions import Coalesce


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


def inward_data_object_list(
    from_date_str, to_date_str, from_time_str, to_time_str, line, location, site
):
    try:
        to_date_time = datetime.datetime.now().astimezone(
            timezone.get_current_timezone()
        )
        from_date_time = to_date_time - datetime.timedelta(hours=24)
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
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(
            timezone.get_current_timezone()
        )
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
            timezone.get_current_timezone()
        )
        inward_data = (
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
                container__location=location,
                container__site=site,
            )
            .order_by("date")
        )
        if not line is None:
            inward_data = inward_data.filter(container__client__ref_code=line)
        return list(inward_data)
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def outward_data_object_list(
    from_date_str, to_date_str, from_time_str, to_time_str, line, location, site
):
    try:
        to_date_time = datetime.datetime.now().astimezone(
            timezone.get_current_timezone()
        )
        from_date_time = to_date_time - datetime.timedelta(hours=24)
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
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(
            timezone.get_current_timezone()
        )
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
            timezone.get_current_timezone()
        )
        outward_data = (
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
                container__location=location,
                container__site=site,
            )
            .order_by("date")
        )
        if not line is None:
            outward_data = outward_data.filter(container__client__ref_code=line)
        return list(outward_data)
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def stock_data_object_list(line, location, site):
    try:
        if line is None:
            stock_data_list = list(
                ContainerStock.objects.select_related(
                    "container",
                    "container__client",
                    "container__type",
                    "container__size",
                    "container__location",
                    "container__site",
                    "gate_in",
                    "gate_out",
                )
                .filter(
                    container_status="IN",
                    container__location=location,
                    container__site=site,
                )
                .order_by("gate_in__in_date")
            )
            return stock_data_list
        else:
            stock_data_list = list(
                ContainerStock.objects.select_related(
                    "container",
                    "container__client",
                    "container__type",
                    "container__size",
                    "container__location",
                    "container__site",
                    "gate_in",
                    "gate_out",
                )
                .filter(
                    container__client__ref_code=line,
                    container_status="IN",
                    container__location=location,
                    container__site=site,
                )
                .order_by("gate_in__in_date")
            )
            return stock_data_list
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def user_data(location, site):
    try:
        date = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%m/%d/%Y")
        )
        data = {
            # "company_name": location.company_name.upper(),
            "company_name": site.organization.upper(),
            "company_address": site.address,
            "site_code": site.get_site_detail()["code"],
            "location": location.name.upper(),
            "site": site.name.upper(),
            "report_date": date,
        }
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        lolo_data = data_object.lolo.get_handling()
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["import_cargo"] = gate_in_data["cargo"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["grade"] = gate_in_data["grade"]
        data["arrived_by"] = gate_in_data["arrived"]
        data["status"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%b %d %Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str + " " + in_time_str
        data["gate_in_date"] = gate_in_date
        data["line"] = container_data["client"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_in_data["shipper"]
        data["vessel"] = gate_in_data["vessel_name"]
        data["voyage"] = gate_in_data["voyage_no"]
        data["place"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        if data_object.container.client.ref_code is None:
            ref_code = ""
        else:
            ref_code = data_object.container.client.ref_code
        data["opr"] = ref_code
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = generic_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        import_cargo = [each.get("import_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        grade = [each.get("grade") for each in data]
        arrived_by = [each.get("arrived_by") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        place = [each.get("place") for each in data]
        transporter = [each.get("transporter") for each in data]
        opr = [each.get("opr") for each in data]
        df_data = [
            [
                sl_no[i],
                vehicle_no[i],
                import_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                mfg_date[i],
                grade[i],
                arrived_by[i],
                status[i],
                remarks[i],
                gate_in_date[i],
                line[i],
                customer[i],
                shipper[i],
                vessel[i],
                voyage[i],
                place[i],
                transporter[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 22)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 22)]]
        return df_data


def generic_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        lolo_data = data_object.lolo.get_handling()
        stock = ContainerStock.objects.get(
            container=data_object.container, gate_out=data_object.gate_out
        )
        gate_in = stock.gate_in
        in_date_str = gate_in.in_date.strftime("%b %d %Y")
        in_time_str = gate_in.in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str + " " + in_time_str
        data["gate_in_date"] = gate_in_date
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%b %d %Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str + " " + out_time_str
        data["gate_out_date"] = gate_out_date
        data["line"] = container_data["client"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_out_data["shipper"]
        data["place"] = gate_out_data["destination"]
        data["vessel"] = gate_out_data["vessel_name"]
        data["voyage"] = gate_out_data["voyage_no"]
        data["transporter"] = gate_out_data["transporter_name"]
        data["vehicle_no"] = gate_out_data["vehicle_no"]
        data["export_cargo"] = gate_out_data["export_cargo"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["grade"] = gate_out_data["grade"]
        data["status"] = gate_out_data["condition"]
        data["remarks"] = gate_out_data["remarks"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["destination"] = gate_out_data["destination"]
        data["to_port_code"] = gate_out_data["to_port_code"]
        data["port_of_loading"] = gate_out_data["port_of_loading"]
        data["port_of_discharge"] = gate_out_data["port_of_discharge"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["seal_no"] = gate_out_data["seal_no"]
        if data_object.container.client.ref_code is None:
            ref_code = ""
        else:
            ref_code = data_object.container.client.ref_code
        data["opr"] = ref_code
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = generic_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        export_cargo = [each.get("export_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        grade = [each.get("grade") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        port_of_loading = [each.get("port_of_loading") for each in data]
        port_of_discharge = [each.get("port_of_discharge") for each in data]
        destination = [each.get("destination") for each in data]
        opr = [each.get("opr") for each in data]
        to_port_code = [each.get("to_port_code") for each in data]
        df_data = [
            [
                sl_no[i],
                gate_in_date[i],
                gate_out_date[i],
                line[i],
                customer[i],
                shipper[i],
                place[i],
                vessel[i],
                voyage[i],
                transporter[i],
                vehicle_no[i],
                export_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                grade[i],
                booking_no[i],
                seal_no[i],
                status[i],
                remarks[i],
                mfg_date[i],
                port_of_loading[i],
                port_of_discharge[i],
                destination[i],
                opr[i],
                to_port_code[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 29)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 29)]]
        return df_data


def generic_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%b %d %Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str + " " + in_time_str
        data["gate_in_date"] = gate_in_date
        data["container_no"] = container_data["container_no"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["age"] = stock_data["aging"]
        data["status"] = stock_data["status"]
        data["condition"] = gate_in_data["condition"]
        data["available_date"] = stock_data["available_date"]
        data["approval_date"] = stock_data["allotment_date"]
        data["booking_no"] = stock_data["booking_no"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = generic_stock_row_data(each)
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
        condition = [each.get("condition") for each in data]
        available_date = [each.get("available_date") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        remarks = [each.get("remarks") for each in data]
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
                condition[i],
                available_date[i],
                approval_date[i],
                booking_no[i],
                remarks[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 15)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 15)]]
        return df_data


def generic_stock_summary_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time
        data = []

        dv2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_op_data_count = dv2_op_in_data_count - dv2_op_out_data_count

        dv2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count
        data.append(
            {
                "SizeType": "20'DV",
                "OpBal": dv2_op_data_count,
                "InQty": dv2_in_data_count,
                "OutQty": dv2_out_data_count,
                "ClBal": dv2_cl_bal,
            }
        )
        dv4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_op_data_count = dv4_op_in_data_count - dv4_op_out_data_count

        dv4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count
        data.append(
            {
                "SizeType": "40'DV",
                "OpBal": dv4_op_data_count,
                "InQty": dv4_in_data_count,
                "OutQty": dv4_out_data_count,
                "ClBal": dv4_cl_bal,
            }
        )

        fr2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_op_data_count = fr2_op_in_data_count - fr2_op_out_data_count

        fr2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count
        data.append(
            {
                "SizeType": "20'FR",
                "OpBal": fr2_op_data_count,
                "InQty": fr2_in_data_count,
                "OutQty": fr2_out_data_count,
                "ClBal": fr2_cl_bal,
            }
        )
        fr4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_op_data_count = fr4_op_in_data_count - fr4_op_out_data_count

        fr4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count
        data.append(
            {
                "SizeType": "40'FR",
                "OpBal": fr4_op_data_count,
                "InQty": fr4_in_data_count,
                "OutQty": fr4_out_data_count,
                "ClBal": fr4_cl_bal,
            }
        )

        hc2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_op_data_count = hc2_op_in_data_count - hc2_op_out_data_count

        hc2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count
        data.append(
            {
                "SizeType": "20'H/C",
                "OpBal": hc2_op_data_count,
                "InQty": hc2_in_data_count,
                "OutQty": hc2_out_data_count,
                "ClBal": hc2_cl_bal,
            }
        )

        hc4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_op_data_count = hc4_op_in_data_count - hc4_op_out_data_count

        hc4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count
        data.append(
            {
                "SizeType": "40'H/C",
                "OpBal": hc4_op_data_count,
                "InQty": hc4_in_data_count,
                "OutQty": hc4_out_data_count,
                "ClBal": hc4_cl_bal,
            }
        )

        ht2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht2_op_data_count = ht2_op_in_data_count - ht2_op_out_data_count

        ht2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht2_cl_bal = ht2_op_data_count + ht2_in_data_count - ht2_out_data_count
        data.append(
            {
                "SizeType": "20'HT",
                "OpBal": ht2_op_data_count,
                "InQty": ht2_in_data_count,
                "OutQty": ht2_out_data_count,
                "ClBal": ht2_cl_bal,
            }
        )

        ht4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht4_op_data_count = ht4_op_in_data_count - ht4_op_out_data_count

        ht4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ht4_cl_bal = ht4_op_data_count + ht4_in_data_count - ht4_out_data_count
        data.append(
            {
                "SizeType": "40'HT",
                "OpBal": ht4_op_data_count,
                "InQty": ht4_in_data_count,
                "OutQty": ht4_out_data_count,
                "ClBal": ht4_cl_bal,
            }
        )

        ot2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_op_data_count = ot2_op_in_data_count - ot2_op_out_data_count

        ot2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count
        data.append(
            {
                "SizeType": "20'OT",
                "OpBal": ot2_op_data_count,
                "InQty": ot2_in_data_count,
                "OutQty": ot2_out_data_count,
                "ClBal": ot2_cl_bal,
            }
        )

        ot4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_op_data_count = ot4_op_in_data_count - ot4_op_out_data_count

        ot4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count
        data.append(
            {
                "SizeType": "40'OT",
                "OpBal": ot4_op_data_count,
                "InQty": ot4_in_data_count,
                "OutQty": ot4_out_data_count,
                "ClBal": ot4_cl_bal,
            }
        )

        std2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_op_data_count = std2_op_in_data_count - std2_op_out_data_count

        std2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count
        data.append(
            {
                "SizeType": "20'STD",
                "OpBal": std2_op_data_count,
                "InQty": std2_in_data_count,
                "OutQty": std2_out_data_count,
                "ClBal": std2_cl_bal,
            }
        )

        std4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_op_data_count = std4_op_in_data_count - std4_op_out_data_count

        std4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count
        data.append(
            {
                "SizeType": "40'STD",
                "OpBal": std4_op_data_count,
                "InQty": std4_in_data_count,
                "OutQty": std4_out_data_count,
                "ClBal": std4_cl_bal,
            }
        )

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ht2_op_data_count
            + ht4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
        )

        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ht2_in_data_count
            + ht4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
        )

        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ht2_out_data_count
            + ht4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
        )

        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ht2_cl_bal
            + ht4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
        )

        data.append(
            {
                "SizeType": "Total",
                "OpBal": op_bal_total,
                "InQty": in_qty_total,
                "OutQty": out_qty_total,
                "ClBal": cl_bal_total,
            }
        )

        SizeType = [each.get("SizeType") for each in data]
        OpBal = [each.get("OpBal") for each in data]
        InQty = [each.get("InQty") for each in data]
        OutQty = [each.get("OutQty") for each in data]
        ClBal = [each.get("ClBal") for each in data]

        df_data = [
            [SizeType[i], OpBal[i], InQty[i], OutQty[i], ClBal[i]]
            for i in range(len(SizeType))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def generic_stock_summary_b_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        dv_20_condition_ok_count = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_condition_ok_count = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_empty_allotment = int(dv_20_data.filter(status="Empty Alloted").count())
        dv_40_empty_allotment = int(dv_40_data.filter(status="Empty Alloted").count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_approved = int(dv_20_data.filter(status="Approved").count())
        dv_40_approved = int(dv_40_data.filter(status="Approved").count())
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_empty_allotment
            + dv_20_allotment
            + dv_20_estimate_pending
            + dv_20_approval_pending
            + dv_20_approved
            + dv_20_under_repairing
        )
        dv_20_tues = dv_20_total * 1
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_empty_allotment
            + dv_40_allotment
            + dv_40_estimate_pending
            + dv_40_approval_pending
            + dv_40_approved
            + dv_40_under_repairing
        )
        dv_40_tues = dv_40_total * 2
        dv_20_sale = 0
        dv_40_sale = 0
        dv_20_list = [
            dv_20_condition_ok_count,
            dv_20_empty_allotment,
            dv_20_allotment,
            dv_20_estimate_pending,
            dv_20_approval_pending,
            dv_20_approved,
            dv_20_under_repairing,
            dv_20_sale,
            dv_20_total,
            dv_20_tues,
        ]
        dv_40_list = [
            dv_40_condition_ok_count,
            dv_40_empty_allotment,
            dv_40_allotment,
            dv_40_estimate_pending,
            dv_40_approval_pending,
            dv_40_approved,
            dv_40_under_repairing,
            dv_20_sale,
            dv_40_total,
            dv_40_tues,
        ]

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        std_20_condition_ok_count = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_condition_ok_count = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_empty_allotment = int(std_20_data.filter(status="Empty Alloted").count())
        std_40_empty_allotment = int(std_40_data.filter(status="Empty Alloted").count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_approved = int(std_20_data.filter(status="Approved").count())
        std_40_approved = int(std_40_data.filter(status="Approved").count())
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_empty_allotment
            + std_20_allotment
            + std_20_estimate_pending
            + std_20_approval_pending
            + std_20_approved
            + std_20_under_repairing
        )
        std_20_tues = std_20_total * 1
        std_40_total = (
            std_40_condition_ok_count
            + std_40_empty_allotment
            + std_40_allotment
            + std_40_estimate_pending
            + std_40_approval_pending
            + std_40_approved
            + std_40_under_repairing
        )
        std_40_tues = std_40_total * 2
        std_20_sale = 0
        std_40_sale = 0
        std_20_list = [
            std_20_condition_ok_count,
            std_20_empty_allotment,
            std_20_allotment,
            std_20_estimate_pending,
            std_20_approval_pending,
            std_20_approved,
            std_20_under_repairing,
            std_20_sale,
            std_20_total,
            std_20_tues,
        ]
        std_40_list = [
            std_40_condition_ok_count,
            std_40_empty_allotment,
            std_40_allotment,
            std_40_estimate_pending,
            std_40_approval_pending,
            std_40_approved,
            std_40_under_repairing,
            std_20_sale,
            std_40_total,
            std_40_tues,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        hc_20_condition_ok_count = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_condition_ok_count = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_empty_allotment = int(hc_20_data.filter(status="Empty Alloted").count())
        hc_40_empty_allotment = int(hc_40_data.filter(status="Empty Alloted").count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_approved = int(hc_20_data.filter(status="Approved").count())
        hc_40_approved = int(hc_40_data.filter(status="Approved").count())
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_empty_allotment
            + hc_20_allotment
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_approved
            + hc_20_under_repairing
        )
        hc_20_tues = hc_20_total * 1
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_empty_allotment
            + hc_40_allotment
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_approved
            + hc_40_under_repairing
        )
        hc_40_tues = hc_40_total * 2
        hc_20_sale = 0
        hc_40_sale = 0
        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_empty_allotment,
            hc_20_allotment,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_approved,
            hc_20_under_repairing,
            hc_20_sale,
            hc_20_total,
            hc_20_tues,
        ]
        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_empty_allotment,
            hc_40_allotment,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_approved,
            hc_40_under_repairing,
            hc_40_sale,
            hc_40_total,
            hc_40_tues,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        ot_20_condition_ok_count = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_condition_ok_count = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_empty_allotment = int(ot_20_data.filter(status="Empty Alloted").count())
        ot_40_empty_allotment = int(ot_40_data.filter(status="Empty Alloted").count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_approved = int(ot_20_data.filter(status="Approved").count())
        ot_40_approved = int(ot_40_data.filter(status="Approved").count())
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_empty_allotment
            + ot_20_allotment
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_approved
            + ot_20_under_repairing
        )
        ot_20_tues = ot_20_total * 1
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_empty_allotment
            + ot_40_allotment
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_approved
            + ot_40_under_repairing
        )
        ot_40_tues = ot_40_total * 2
        ot_20_sale = 0
        ot_40_sale = 0
        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_empty_allotment,
            ot_20_allotment,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_approved,
            ot_20_under_repairing,
            ot_20_sale,
            ot_20_total,
            ot_20_tues,
        ]
        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_empty_allotment,
            ot_40_allotment,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_approved,
            ot_40_under_repairing,
            ot_40_sale,
            ot_40_total,
            ot_40_tues,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        fr_20_condition_ok_count = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_condition_ok_count = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_empty_allotment = int(fr_20_data.filter(status="Empty Alloted").count())
        fr_40_empty_allotment = int(fr_40_data.filter(status="Empty Alloted").count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_approved = int(fr_20_data.filter(status="Approved").count())
        fr_40_approved = int(fr_40_data.filter(status="Approved").count())
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_empty_allotment
            + fr_20_allotment
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_approved
            + fr_20_under_repairing
        )
        fr_20_tues = fr_20_total * 1
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_empty_allotment
            + fr_40_allotment
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_approved
            + fr_40_under_repairing
        )
        fr_40_tues = fr_40_total * 2
        fr_20_sale = 0
        fr_40_sale = 0
        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_empty_allotment,
            fr_20_allotment,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_approved,
            fr_20_under_repairing,
            fr_20_sale,
            fr_20_total,
            fr_20_tues,
        ]
        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_empty_allotment,
            fr_40_allotment,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_approved,
            fr_40_under_repairing,
            fr_40_sale,
            fr_40_total,
            fr_40_tues,
        ]

        condition_ok_total = (
            dv_20_condition_ok_count
            + dv_40_condition_ok_count
            + std_20_condition_ok_count
            + std_40_condition_ok_count
            + hc_20_condition_ok_count
            + hc_40_condition_ok_count
            + ot_20_condition_ok_count
            + ot_40_condition_ok_count
            + fr_20_condition_ok_count
            + fr_40_condition_ok_count
        )

        empty_allotment_total = (
            dv_20_empty_allotment
            + dv_40_empty_allotment
            + std_20_empty_allotment
            + std_40_empty_allotment
            + hc_20_empty_allotment
            + hc_40_empty_allotment
            + ot_20_empty_allotment
            + ot_40_empty_allotment
            + fr_20_empty_allotment
            + fr_40_empty_allotment
        )

        allotment_total = (
            dv_20_allotment
            + dv_40_allotment
            + std_20_allotment
            + std_40_allotment
            + hc_20_allotment
            + hc_40_allotment
            + ot_20_allotment
            + ot_40_allotment
            + fr_20_allotment
            + fr_40_allotment
        )

        estimate_pending_total = (
            dv_20_estimate_pending
            + dv_40_estimate_pending
            + std_20_estimate_pending
            + std_40_estimate_pending
            + hc_20_estimate_pending
            + hc_40_estimate_pending
            + ot_20_estimate_pending
            + ot_40_estimate_pending
            + fr_20_estimate_pending
            + fr_40_estimate_pending
        )

        approval_pending_total = (
            dv_20_approval_pending
            + dv_40_approval_pending
            + std_20_approval_pending
            + std_40_approval_pending
            + hc_20_approval_pending
            + hc_40_approval_pending
            + ot_20_approval_pending
            + ot_40_approval_pending
            + fr_20_approval_pending
            + fr_40_approval_pending
        )

        approved_total = (
            dv_20_approved
            + dv_40_approved
            + std_20_approved
            + std_40_approved
            + hc_20_approved
            + hc_40_approved
            + ot_20_approved
            + ot_40_approved
            + fr_20_approved
            + fr_40_approved
        )

        under_repairing_total = (
            dv_20_under_repairing
            + dv_40_under_repairing
            + std_20_under_repairing
            + std_40_under_repairing
            + hc_20_under_repairing
            + hc_40_under_repairing
            + ot_20_under_repairing
            + ot_40_under_repairing
            + fr_20_under_repairing
            + fr_40_under_repairing
        )

        sale_total = (
            dv_20_sale
            + dv_40_sale
            + std_20_sale
            + std_40_sale
            + hc_20_sale
            + hc_40_sale
            + ot_20_sale
            + ot_40_sale
            + fr_20_sale
            + fr_40_sale
        )

        all_total = (
            dv_20_total
            + dv_40_total
            + std_20_total
            + std_40_total
            + hc_20_total
            + hc_40_total
            + ot_20_total
            + ot_40_total
            + fr_20_total
            + fr_40_total
        )

        tues_total = (
            dv_20_tues
            + dv_40_tues
            + std_20_tues
            + std_40_tues
            + hc_20_tues
            + hc_40_tues
            + ot_20_tues
            + ot_40_tues
            + fr_20_tues
            + fr_40_tues
        )

        total_list = [
            condition_ok_total,
            empty_allotment_total,
            allotment_total,
            estimate_pending_total,
            approval_pending_total,
            approved_total,
            under_repairing_total,
            sale_total,
            all_total,
            tues_total,
        ]

        import_total_list = [
            "Ok Containers",
            "Empty Alloted",
            "Alloted",
            "Awaiting Est",
            "Awaiting Authorisation",
            "Authorised",
            "Under Repair",
            "Sale",
            "TOTAL",
            "TUES",
        ]

        # remark_list = ["", "", "", "", "", "", "", "", "", ""]

        data = [
            [
                import_total_list[i],
                dv_20_list[i],
                dv_40_list[i],
                std_20_list[i],
                std_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
                total_list[i],
                # remark_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        data2 = generic_stock_summary_data(
            from_date_str=from_date_str,
            from_time_str=from_time_str,
            to_date_str=to_date_str,
            to_time_str=to_time_str,
            location=location,
            site=site,
            line=line,
        )
        return [data, data2]
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        data2 = [[]]
        return [data, data2]


def generic_stock_av_aa_ar_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["status"] = stock_data["status"]
        data["available_date"] = stock_data["available_date"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_stock_av_aa_ar_main_data(location, site, line):
    try:
        data = []
        stock_object_data = list(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            ).filter(
                container__client__ref_code=line,
                container_status="IN",
                container__location=location,
                container__site=site,
                status__in=["Available", "Without_Repair_Available"],
            )
        )
        count = 0
        for each in stock_object_data:
            count += 1
            each_data = generic_stock_av_aa_ar_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("container_size") for each in data]
        container_type = [each.get("container_type") for each in data]
        status = [each.get("status") for each in data]
        available_date = [each.get("available_date") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                container_size[i],
                container_type[i],
                status[i],
                available_date[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 6)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 6)]]
        return df_data


def generic_movement_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)

        size1_in_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        size1_in_tues = size1_in_total * 1

        size2_in_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        size2_in_tues = size2_in_total * 2

        size1_out_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        size1_out_tues = size1_out_total * 1

        size2_out_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        size2_out_tues = size2_out_total * 2

        data = [
            {
                "Movement": "Total",
                "In-20'": size1_in_total,
                "In-40'": size2_in_total,
                "Out-20'": size1_out_total,
                "Out-40'": size2_out_total,
            },
            {
                "Movement": "Tues",
                "In-20'": size1_in_tues,
                "In-40'": size2_in_tues,
                "Out-20'": size1_out_tues,
                "Out-40'": size2_out_tues,
            },
        ]
        Movement = [each.get("Movement") for each in data]
        In1 = [each.get("In-20'") for each in data]
        In2 = [each.get("In-40'") for each in data]
        Out1 = [each.get("Out-20'") for each in data]
        Out2 = [each.get("Out-40'") for each in data]
        df_data = [
            [Movement[i], In1[i], In2[i], Out1[i], Out2[i]]
            for i in range(len(Movement))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def generic_total_inward_data(to_date_str, location, site, line):
    try:
        to_date = (
            datetime.datetime.strptime(to_date_str, "%Y-%m-%d")
            .astimezone(timezone.get_current_timezone())
            .date()
        )
        from_date = to_date - datetime.timedelta(days=120)

        in_object_data = list(
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
            ).filter(
                gate_in__in_date__gte=from_date,
                gate_in__in_date__lte=to_date,
                container__status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
        )
        count = 0
        data = []
        for each in in_object_data:
            count += 1
            each_data = generic_inward_row_data(each)
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
        mfg_date = [each.get("mfg_date") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        customer = [each.get("customer") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        import_cargo = [each.get("import_cargo") for each in data]
        transporter = [each.get("transporter") for each in data]
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
                mfg_date[i],
                vessel[i],
                voyage[i],
                customer[i],
                vehicle_no[i],
                import_cargo[i],
                transporter[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 15)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 15)]]
        return df_data


def generic_total_outward_data(to_date_str, location, site, line):
    try:
        to_date = (
            datetime.datetime.strptime(to_date_str, "%Y-%m-%d")
            .astimezone(timezone.get_current_timezone())
            .date()
        )
        from_date = to_date - datetime.timedelta(days=120)
        out_object_data = list(
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
            ).filter(
                gate_out__out_date__gte=from_date,
                gate_out__out_date__lte=to_date,
                container__status="OUT",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
        )
        count = 0
        data = []
        for each in out_object_data:
            count += 1
            each_data = generic_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        export_cargo = [each.get("export_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        grade = [each.get("grade") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        port_of_loading = [each.get("port_of_loading") for each in data]
        port_of_discharge = [each.get("port_of_discharge") for each in data]
        destination = [each.get("destination") for each in data]
        opr = [each.get("opr") for each in data]
        to_port_code = [each.get("to_port_code") for each in data]
        df_data = [
            [
                sl_no[i],
                gate_in_date[i],
                gate_out_date[i],
                line[i],
                customer[i],
                shipper[i],
                place[i],
                vessel[i],
                voyage[i],
                transporter[i],
                vehicle_no[i],
                export_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                grade[i],
                booking_no[i],
                seal_no[i],
                status[i],
                remarks[i],
                mfg_date[i],
                port_of_loading[i],
                port_of_discharge[i],
                destination[i],
                opr[i],
                to_port_code[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 29)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 29)]]
        return df_data


def generic_stock_status_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time

        survey_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        survey_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        survey_pending_opb = survey_pending_in_opb - survey_pending_out_opb

        survey_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        survey_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        survey_pending_calb = (
            survey_pending_opb + survey_pending_in - survey_pending_out
        )

        estimate_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        estimate_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        estimate_pending_opb = estimate_pending_in_opb - estimate_pending_out_opb

        estimate_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        estimate_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        estimate_pending_calb = (
            estimate_pending_opb + estimate_pending_in - estimate_pending_out
        )

        approval_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        approval_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        approval_pending_opb = approval_pending_in_opb - approval_pending_out_opb

        approval_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        approval_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        approval_pending_calb = (
            approval_pending_opb + approval_pending_in - approval_pending_out
        )

        approved_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        approved_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        approved_opb = approved_in_opb - approved_out_opb

        approved_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        approved_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        approved_calb = approved_opb + approved_in - approved_out

        under_repair_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        under_repair_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        under_repair_opb = under_repair_in_opb - under_repair_out_opb

        under_repair_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        under_repair_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        under_repair_calb = under_repair_opb + under_repair_in - under_repair_out

        available_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        available_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        available_opb = available_in_opb - available_out_opb

        available_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        available_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        available_calb = available_opb + available_in - available_out

        allotment_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        allotment_out_opb = int(
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
                date__lte=yesterday_for_from_date_time,
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        allotment_opb = allotment_in_opb - allotment_out_opb

        allotment_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        allotment_out = int(
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
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        allotment_calb = allotment_opb + allotment_in - allotment_out

        status_list = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Approved",
            "Under Repairing",
            "Available",
            "Allotment",
        ]

        op_bal_list = [
            survey_pending_opb,
            estimate_pending_opb,
            approval_pending_opb,
            approved_opb,
            under_repair_opb,
            available_opb,
            allotment_opb,
        ]

        in_bal_list = [
            survey_pending_in,
            estimate_pending_in,
            approval_pending_in,
            approved_in,
            under_repair_in,
            available_in,
            allotment_in,
        ]

        out_bal_list = [
            survey_pending_out,
            estimate_pending_out,
            approval_pending_out,
            approved_out,
            under_repair_out,
            available_out,
            allotment_out,
        ]

        cal_bal_list = [
            survey_pending_calb,
            estimate_pending_calb,
            approval_pending_calb,
            approved_calb,
            under_repair_calb,
            available_calb,
            allotment_calb,
        ]

        data = [
            [
                status_list[i],
                op_bal_list[i],
                in_bal_list[i],
                out_bal_list[i],
                cal_bal_list[i],
            ]
            for i in range(len(status_list))
        ]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        return data


def zim_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["gwt"] = container_data["gross_wt"]
        data["twt"] = container_data["tare_wt"]
        data["nwt"] = container_data["payload"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d-%b-%Y")
        gate_in_date = in_date_str
        data["fds_in"] = gate_in_date
        data["from"] = gate_in_data["from_location_code"]
        data["condition"] = gate_in_data["condition"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = zim_inward_row_data(each)
            each_data["s_no"] = count
            data.append(each_data)
        s_no = [each.get("s_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gwt = [each.get("gwt") for each in data]
        twt = [each.get("twt") for each in data]
        nwt = [each.get("nwt") for each in data]
        fds_in = [each.get("fds_in") for each in data]
        c_from = [each.get("from") for each in data]
        condition = [each.get("condition") for each in data]

        df_data = [
            [
                s_no[i],
                container_no[i],
                size[i],
                fds_in[i],
                c_from[i],
                gwt[i],
                twt[i],
                nwt[i],
                condition[i],
            ]
            for i in range(len(s_no))
        ]

        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 9)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 9)]]
        return df_data


def zim_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d/%b/%Y")
        gate_out_date = out_date_str
        data["fs_out"] = gate_out_date
        data["shipper"] = gate_out_data["shipper"]
        data["destination"] = gate_out_data["destination"]
        data["seal_no"] = gate_out_data["seal_no"]
        data["booking_no"] = gate_out_data["booking_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = zim_outward_row_data(each)
            each_data["s_no"] = count
            data.append(each_data)
        s_no = [each.get("s_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        fs_out = [each.get("fs_out") for each in data]
        shipper = [each.get("shipper") for each in data]
        destination = [each.get("destination") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        booking_no = [each.get("booking_no") for each in data]

        df_data = [
            [
                s_no[i],
                container_no[i],
                size[i],
                fs_out[i],
                shipper[i],
                destination[i],
                seal_no[i],
                booking_no[i],
            ]
            for i in range(len(s_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 8)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 8)]]
        return df_data


def zim_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        gate_in_date = in_date_str
        data["in_date"] = gate_in_date
        data["condition"] = gate_in_data["condition"]
        data["approx_amt"] = "Nil"
        data["approval_date"] = stock_data["allotment_date"]
        data["app_amt"] = "Nil"
        data["repair_date"] = "Nil"
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def zim_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = zim_stock_row_data(each)
            each_data["sr_no"] = count
            data.append(each_data)
        sr_no = [each.get("sr_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        in_date = [each.get("in_date") for each in data]
        condition = [each.get("condition") for each in data]
        approx_amt = [each.get("approx_amt") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        app_amt = [each.get("app_amt") for each in data]
        repair_date = [each.get("repair_date") for each in data]

        df_data = [
            [
                sr_no[i],
                container_no[i],
                size[i],
                in_date[i],
                condition[i],
                approx_amt[i],
                approval_date[i],
                app_amt[i],
                repair_date[i],
            ]
            for i in range(len(sr_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 9)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 9)]]
        return df_data


def cma_summary_main_data(location, site):
    try:

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        std_20_condition_ok_count = int(
            std_20_data.filter(gate_in__condition="OK").count()
        )
        std_40_condition_ok_count = int(
            std_40_data.filter(gate_in__condition="OK").count()
        )
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_survey_pending = int(std_20_data.filter(status="Survey Pending").count())
        std_40_survey_pending = int(std_40_data.filter(status="Survey Pending").count())
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_allotment
            + std_20_survey_pending
            + std_20_approval_pending
            + std_20_under_repairing
        )
        std_40_total = (
            std_40_condition_ok_count
            + std_40_allotment
            + std_40_survey_pending
            + std_40_approval_pending
            + std_40_under_repairing
        )
        std_20_list = [
            0,
            0,
            0,
            std_20_condition_ok_count,
            std_20_allotment,
            std_20_survey_pending,
            std_20_approval_pending,
            std_20_under_repairing,
            std_20_total,
        ]
        std_40_list = [
            0,
            0,
            0,
            std_40_condition_ok_count,
            std_40_allotment,
            std_40_survey_pending,
            std_40_approval_pending,
            std_40_under_repairing,
            std_40_total,
        ]

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        dv_20_condition_ok_count = int(
            dv_20_data.filter(gate_in__condition="OK").count()
        )
        dv_40_condition_ok_count = int(
            dv_40_data.filter(gate_in__condition="OK").count()
        )
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_survey_pending = int(dv_20_data.filter(status="Survey Pending").count())
        dv_40_survey_pending = int(dv_40_data.filter(status="Survey Pending").count())
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_allotment
            + dv_20_survey_pending
            + dv_20_approval_pending
            + dv_20_under_repairing
        )
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_allotment
            + dv_40_survey_pending
            + dv_40_approval_pending
            + dv_40_under_repairing
        )
        dv_20_list = [
            0,
            0,
            0,
            dv_20_condition_ok_count,
            dv_20_allotment,
            dv_20_survey_pending,
            dv_20_approval_pending,
            dv_20_under_repairing,
            dv_20_total,
        ]
        dv_40_list = [
            0,
            0,
            0,
            dv_40_condition_ok_count,
            dv_40_allotment,
            dv_40_survey_pending,
            dv_40_approval_pending,
            dv_40_under_repairing,
            dv_40_total,
        ]

        ht_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        ht_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        ht_20_condition_ok_count = int(
            ht_20_data.filter(gate_in__condition="OK").count()
        )
        ht_40_condition_ok_count = int(
            ht_40_data.filter(gate_in__condition="OK").count()
        )
        ht_20_allotment = int(
            len([each for each in list(ht_20_data) if not each.allotment_date is None])
        )
        ht_40_allotment = int(
            len([each for each in list(ht_40_data) if not each.allotment_date is None])
        )
        ht_20_survey_pending = int(ht_20_data.filter(status="Survey Pending").count())
        ht_40_survey_pending = int(ht_40_data.filter(status="Survey Pending").count())
        ht_20_approval_pending = int(
            ht_20_data.filter(status="Approval Pending").count()
        )
        ht_40_approval_pending = int(
            ht_40_data.filter(status="Approval Pending").count()
        )
        ht_20_under_repairing = int(ht_20_data.filter(status="Under Repairing").count())
        ht_40_under_repairing = int(ht_40_data.filter(status="Under Repairing").count())
        ht_20_total = (
            ht_20_condition_ok_count
            + ht_20_allotment
            + ht_20_survey_pending
            + ht_20_approval_pending
            + ht_20_under_repairing
        )
        ht_40_total = (
            ht_40_condition_ok_count
            + ht_40_allotment
            + ht_40_survey_pending
            + ht_40_approval_pending
            + ht_40_under_repairing
        )
        ht_20_list = [
            0,
            0,
            0,
            ht_20_condition_ok_count,
            ht_20_allotment,
            ht_20_survey_pending,
            ht_20_approval_pending,
            ht_20_under_repairing,
            ht_20_total,
        ]
        ht_40_list = [
            0,
            0,
            0,
            ht_40_condition_ok_count,
            ht_40_allotment,
            ht_40_survey_pending,
            ht_40_approval_pending,
            ht_40_under_repairing,
            ht_40_total,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        hc_20_condition_ok_count = int(
            hc_20_data.filter(gate_in__condition="OK").count()
        )
        hc_40_condition_ok_count = int(
            hc_40_data.filter(gate_in__condition="OK").count()
        )
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_survey_pending = int(hc_20_data.filter(status="Survey Pending").count())
        hc_40_survey_pending = int(hc_40_data.filter(status="Survey Pending").count())
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_allotment
            + hc_20_survey_pending
            + hc_20_approval_pending
            + hc_20_under_repairing
        )
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_allotment
            + hc_40_survey_pending
            + hc_40_approval_pending
            + hc_40_under_repairing
        )
        hc_20_list = [
            0,
            0,
            0,
            hc_20_condition_ok_count,
            hc_20_allotment,
            hc_20_survey_pending,
            hc_20_approval_pending,
            hc_20_under_repairing,
            hc_20_total,
        ]
        hc_40_list = [
            0,
            0,
            0,
            hc_40_condition_ok_count,
            hc_40_allotment,
            hc_40_survey_pending,
            hc_40_approval_pending,
            hc_40_under_repairing,
            hc_40_total,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        ot_20_condition_ok_count = int(
            ot_20_data.filter(gate_in__condition="OK").count()
        )
        ot_40_condition_ok_count = int(
            ot_40_data.filter(gate_in__condition="OK").count()
        )
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_survey_pending = int(ot_20_data.filter(status="Survey Pending").count())
        ot_40_survey_pending = int(ot_40_data.filter(status="Survey Pending").count())
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_allotment
            + ot_20_survey_pending
            + ot_20_approval_pending
            + ot_20_under_repairing
        )
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_allotment
            + ot_40_survey_pending
            + ot_40_approval_pending
            + ot_40_under_repairing
        )
        ot_20_list = [
            0,
            0,
            0,
            ot_20_condition_ok_count,
            ot_20_allotment,
            ot_20_survey_pending,
            ot_20_approval_pending,
            ot_20_under_repairing,
            ot_20_total,
        ]
        ot_40_list = [
            0,
            0,
            0,
            ot_40_condition_ok_count,
            ot_40_allotment,
            ot_40_survey_pending,
            ot_40_approval_pending,
            ot_40_under_repairing,
            ot_40_total,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="CMA",
        )
        fr_20_condition_ok_count = int(
            fr_20_data.filter(gate_in__condition="OK").count()
        )
        fr_40_condition_ok_count = int(
            fr_40_data.filter(gate_in__condition="OK").count()
        )
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_survey_pending = int(fr_20_data.filter(status="Survey Pending").count())
        fr_40_survey_pending = int(fr_40_data.filter(status="Survey Pending").count())
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_allotment
            + fr_20_survey_pending
            + fr_20_approval_pending
            + fr_20_under_repairing
        )
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_allotment
            + fr_40_survey_pending
            + fr_40_approval_pending
            + fr_40_under_repairing
        )
        fr_20_list = [
            0,
            0,
            0,
            fr_20_condition_ok_count,
            fr_20_allotment,
            fr_20_survey_pending,
            fr_20_approval_pending,
            fr_20_under_repairing,
            fr_20_total,
        ]
        fr_40_list = [
            0,
            0,
            0,
            fr_40_condition_ok_count,
            fr_40_allotment,
            fr_40_survey_pending,
            fr_40_approval_pending,
            fr_40_under_repairing,
            fr_40_total,
        ]

        import_total_list = [
            "IMPORT LDD",
            "OUT FOR DE-STUFFING",
            "IMPORT TOTAL",
            "MTY CNTRS BALANCE (INV.)",
            "MTY CNTRS ALLOTED FOR STFG",
            "DAMAGE CNTRS.(INV.)",
            "DAMAGE CNTRS AWATING APPROVAL(INV)",
            "CNTRS UNDER REPAIR(UR INV)",
            "MTY TOTAL",
        ]

        data = [
            [
                import_total_list[i],
                std_20_list[i],
                std_40_list[i],
                dv_20_list[i],
                dv_40_list[i],
                ht_20_list[i],
                ht_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        return data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        return data


def cma_allotted_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["allotment_date"] = stock_data["allotment_date"]
        data["booking_no"] = stock_data["booking_no"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_alloted_main_data(location, site):
    try:
        stock_data = list(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            ).filter(
                container_status="IN",
                container__location=location,
                container__site=site,
                container__client__ref_code="cma",
            )
        )
        alloted_data = [each for each in stock_data if not each.allotment_date is None]
        count = 0
        data = []
        for each in alloted_data:
            count += 1
            each_data = cma_allotted_row_data(each)
            each_data["sr_no"] = count
            data.append(each_data)
        sr_no = [each.get("sr_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        remarks = [each.get("remarks") for each in data]
        df_data = [
            [
                sr_no[i],
                container_no[i],
                size[i],
                allotment_date[i],
                booking_no[i],
                remarks[i],
            ]
            for i in range(len(sr_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 6)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 6)]]
        return df_data


def cma_inventory_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        gate_in_date = in_date_str
        data["gate_in_date"] = gate_in_date
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_time = in_time_str
        data["gate_in_time"] = gate_in_time
        data["line"] = "CMA"
        data["condition"] = gate_in_data["condition"]
        data["category"] = gate_in_data["grade"]
        data["location"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["remarks"] = gate_in_data["remarks"]
        data["days"] = data_object.get_stock()["aging"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_inventory_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = cma_inventory_row_data(each)
            each_data["sr_no"] = count
            data.append(each_data)
        sr_no = [each.get("sr_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        line = [each.get("line") for each in data]
        condition = [each.get("condition") for each in data]
        category = [each.get("category") for each in data]
        location = [each.get("location") for each in data]
        transporter = [each.get("transporter") for each in data]
        remarks = [each.get("remarks") for each in data]
        days = [each.get("days") for each in data]
        df_data = [
            [
                sr_no[i],
                container_no[i],
                size[i],
                gate_in_date[i],
                gate_in_time[i],
                line[i],
                condition[i],
                category[i],
                location[i],
                transporter[i],
                remarks[i],
                days[i],
            ]
            for i in range(len(sr_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 11)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 11)]]
        return df_data


def cma_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["date_of_reporting"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%d/%b/%Y")
        )
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["gate_in_date"] = gate_in_date
        data["gate_in_time"] = gate_in_time
        data["line"] = "CMA"
        data["condition"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_inward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = cma_inward_row_data(each)
            each_data["sr_no"] = count
            data.append(each_data)
        sr_no = [each.get("sr_no") for each in data]
        date_of_reporting = [each.get("date_of_reporting") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        line = [each.get("line") for each in data]
        condition = [each.get("condition") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [
                sr_no[i],
                date_of_reporting[i],
                container_no[i],
                size[i],
                gate_in_date[i],
                gate_in_time[i],
                line[i],
                condition[i],
                remarks[i],
            ]
            for i in range(len(sr_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 10)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 10)]]
        return df_data


def cma_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["date_of_reporting"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%d/%b/%Y")
        )
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d/%b/%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str
        gate_out_time = out_time_str
        data["gate_out_date"] = gate_out_date
        data["gate_out_time"] = gate_out_time
        data["line"] = "CMA"
        data["condition"] = gate_out_data["condition"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["remarks"] = gate_out_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def cma_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = cma_outward_row_data(each)
            each_data["sr_no"] = count
            data.append(each_data)
        sr_no = [each.get("sr_no") for each in data]
        date_of_reporting = [each.get("date_of_reporting") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        line = [each.get("line") for each in data]
        condition = [each.get("condition") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [
                sr_no[i],
                date_of_reporting[i],
                container_no[i],
                size[i],
                gate_out_date[i],
                gate_out_time[i],
                line[i],
                condition[i],
                booking_no[i],
                remarks[i],
            ]
            for i in range(len(sr_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 10)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 10)]]
        return df_data


def msc_stock_main_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_20_condition_ok_count = int(
            std_20_data.filter(gate_in__condition="OK").count()
        )
        std_40_condition_ok_count = int(
            std_40_data.filter(gate_in__condition="OK").count()
        )
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_survey_pending = int(std_20_data.filter(status="Survey Pending").count())
        std_40_survey_pending = int(std_40_data.filter(status="Survey Pending").count())
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_allotment
            + std_20_survey_pending
            + std_20_approval_pending
            + std_20_under_repairing
        )
        std_20_tues = std_20_total * 1
        std_40_total = (
            std_40_condition_ok_count
            + std_40_allotment
            + std_40_survey_pending
            + std_40_approval_pending
            + std_40_under_repairing
        )
        std_40_tues = std_40_total * 2
        std_20_list = [
            std_20_condition_ok_count,
            std_20_allotment,
            std_20_survey_pending,
            std_20_approval_pending,
            std_20_under_repairing,
            std_20_total,
            std_20_tues,
        ]
        std_40_list = [
            std_40_condition_ok_count,
            std_40_allotment,
            std_40_survey_pending,
            std_40_approval_pending,
            std_40_under_repairing,
            std_40_total,
            std_40_tues,
        ]

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_20_condition_ok_count = int(
            dv_20_data.filter(gate_in__condition="OK").count()
        )
        dv_40_condition_ok_count = int(
            dv_40_data.filter(gate_in__condition="OK").count()
        )
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_survey_pending = int(dv_20_data.filter(status="Survey Pending").count())
        dv_40_survey_pending = int(dv_40_data.filter(status="Survey Pending").count())
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_allotment
            + dv_20_survey_pending
            + dv_20_approval_pending
            + dv_20_under_repairing
        )
        dv_20_tues = dv_20_total * 1
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_allotment
            + dv_40_survey_pending
            + dv_40_approval_pending
            + dv_40_under_repairing
        )
        dv_40_tues = dv_40_total * 2
        dv_20_list = [
            dv_20_condition_ok_count,
            dv_20_allotment,
            dv_20_survey_pending,
            dv_20_approval_pending,
            dv_20_under_repairing,
            dv_20_total,
            dv_20_tues,
        ]
        dv_40_list = [
            dv_40_condition_ok_count,
            dv_40_allotment,
            dv_40_survey_pending,
            dv_40_approval_pending,
            dv_40_under_repairing,
            dv_40_total,
            dv_40_tues,
        ]

        ht_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ht_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ht_20_condition_ok_count = int(
            ht_20_data.filter(gate_in__condition="OK").count()
        )
        ht_40_condition_ok_count = int(
            ht_40_data.filter(gate_in__condition="OK").count()
        )
        ht_20_allotment = int(
            len([each for each in list(ht_20_data) if not each.allotment_date is None])
        )
        ht_40_allotment = int(
            len([each for each in list(ht_40_data) if not each.allotment_date is None])
        )
        ht_20_survey_pending = int(ht_20_data.filter(status="Survey Pending").count())
        ht_40_survey_pending = int(ht_40_data.filter(status="Survey Pending").count())
        ht_20_approval_pending = int(
            ht_20_data.filter(status="Approval Pending").count()
        )
        ht_40_approval_pending = int(
            ht_40_data.filter(status="Approval Pending").count()
        )
        ht_20_under_repairing = int(ht_20_data.filter(status="Under Repairing").count())
        ht_40_under_repairing = int(ht_40_data.filter(status="Under Repairing").count())
        ht_20_total = (
            ht_20_condition_ok_count
            + ht_20_allotment
            + ht_20_survey_pending
            + ht_20_approval_pending
            + ht_20_under_repairing
        )
        ht_20_tues = ht_20_total * 1
        ht_40_total = (
            ht_40_condition_ok_count
            + ht_40_allotment
            + ht_40_survey_pending
            + ht_40_approval_pending
            + ht_40_under_repairing
        )
        ht_40_tues = ht_40_total * 2
        ht_20_list = [
            ht_20_condition_ok_count,
            ht_20_allotment,
            ht_20_survey_pending,
            ht_20_approval_pending,
            ht_20_under_repairing,
            ht_20_total,
            ht_20_tues,
        ]
        ht_40_list = [
            ht_40_condition_ok_count,
            ht_40_allotment,
            ht_40_survey_pending,
            ht_40_approval_pending,
            ht_40_under_repairing,
            ht_40_total,
            ht_40_tues,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_20_condition_ok_count = int(
            hc_20_data.filter(gate_in__condition="OK").count()
        )
        hc_40_condition_ok_count = int(
            hc_40_data.filter(gate_in__condition="OK").count()
        )
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_survey_pending = int(hc_20_data.filter(status="Survey Pending").count())
        hc_40_survey_pending = int(hc_40_data.filter(status="Survey Pending").count())
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_allotment
            + hc_20_survey_pending
            + hc_20_approval_pending
            + hc_20_under_repairing
        )
        hc_20_tues = hc_20_total * 1
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_allotment
            + hc_40_survey_pending
            + hc_40_approval_pending
            + hc_40_under_repairing
        )
        hc_40_tues = hc_40_total * 2
        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_allotment,
            hc_20_survey_pending,
            hc_20_approval_pending,
            hc_20_under_repairing,
            hc_20_total,
            hc_20_tues,
        ]
        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_allotment,
            hc_40_survey_pending,
            hc_40_approval_pending,
            hc_40_under_repairing,
            hc_40_total,
            hc_40_tues,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_20_condition_ok_count = int(
            ot_20_data.filter(gate_in__condition="OK").count()
        )
        ot_40_condition_ok_count = int(
            ot_40_data.filter(gate_in__condition="OK").count()
        )
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_survey_pending = int(ot_20_data.filter(status="Survey Pending").count())
        ot_40_survey_pending = int(ot_40_data.filter(status="Survey Pending").count())
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_allotment
            + ot_20_survey_pending
            + ot_20_approval_pending
            + ot_20_under_repairing
        )
        ot_20_tues = ot_20_total * 1
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_allotment
            + ot_40_survey_pending
            + ot_40_approval_pending
            + ot_40_under_repairing
        )
        ot_40_tues = ot_40_total * 2
        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_allotment,
            ot_20_survey_pending,
            ot_20_approval_pending,
            ot_20_under_repairing,
            ot_20_total,
            ot_20_tues,
        ]
        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_allotment,
            ot_40_survey_pending,
            ot_40_approval_pending,
            ot_40_under_repairing,
            ot_40_total,
            ot_40_tues,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_20_condition_ok_count = int(
            fr_20_data.filter(gate_in__condition="OK").count()
        )
        fr_40_condition_ok_count = int(
            fr_40_data.filter(gate_in__condition="OK").count()
        )
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_survey_pending = int(fr_20_data.filter(status="Survey Pending").count())
        fr_40_survey_pending = int(fr_40_data.filter(status="Survey Pending").count())
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_allotment
            + fr_20_survey_pending
            + fr_20_approval_pending
            + fr_20_under_repairing
        )
        fr_20_tues = fr_20_total * 1
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_allotment
            + fr_40_survey_pending
            + fr_40_approval_pending
            + fr_40_under_repairing
        )
        fr_40_tues = fr_40_total * 2
        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_allotment,
            fr_20_survey_pending,
            fr_20_approval_pending,
            fr_20_under_repairing,
            fr_20_total,
            fr_20_tues,
        ]
        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_allotment,
            fr_40_survey_pending,
            fr_40_approval_pending,
            fr_40_under_repairing,
            fr_40_total,
            fr_40_tues,
        ]

        condition_ok_total = (
            std_20_condition_ok_count
            + std_40_condition_ok_count
            + dv_20_condition_ok_count
            + dv_40_condition_ok_count
            + ht_20_condition_ok_count
            + ht_40_condition_ok_count
            + hc_20_condition_ok_count
            + hc_40_condition_ok_count
            + ot_20_condition_ok_count
            + ot_40_condition_ok_count
            + fr_20_condition_ok_count
            + fr_40_condition_ok_count
        )

        allotment_total = (
            std_20_allotment
            + std_40_allotment
            + dv_20_allotment
            + dv_40_allotment
            + ht_20_allotment
            + ht_40_allotment
            + hc_20_allotment
            + hc_40_allotment
            + ot_20_allotment
            + ot_40_allotment
            + fr_20_allotment
            + fr_40_allotment
        )

        survey_pending_total = (
            std_20_survey_pending
            + std_40_survey_pending
            + dv_20_survey_pending
            + dv_40_survey_pending
            + ht_20_survey_pending
            + ht_40_survey_pending
            + hc_20_survey_pending
            + hc_40_survey_pending
            + ot_20_survey_pending
            + ot_40_survey_pending
            + fr_20_survey_pending
            + fr_40_survey_pending
        )

        approval_pending_total = (
            std_20_approval_pending
            + std_40_approval_pending
            + dv_20_approval_pending
            + dv_40_approval_pending
            + ht_20_approval_pending
            + ht_40_approval_pending
            + hc_20_approval_pending
            + hc_40_approval_pending
            + ot_20_approval_pending
            + ot_40_approval_pending
            + fr_20_approval_pending
            + fr_40_approval_pending
        )

        under_repairing_total = (
            std_20_under_repairing
            + std_40_under_repairing
            + dv_20_under_repairing
            + dv_40_under_repairing
            + ht_20_under_repairing
            + ht_40_under_repairing
            + hc_20_under_repairing
            + hc_40_under_repairing
            + ot_20_under_repairing
            + ot_40_under_repairing
            + fr_20_under_repairing
            + fr_40_under_repairing
        )

        all_total = (
            std_20_total
            + std_40_total
            + dv_20_total
            + dv_40_total
            + ht_20_total
            + ht_40_total
            + hc_20_total
            + hc_40_total
            + ot_20_total
            + ot_40_total
            + fr_20_total
            + fr_40_total
        )

        tues_total = (
            std_20_tues
            + std_40_tues
            + dv_20_tues
            + dv_40_tues
            + ht_20_tues
            + ht_40_tues
            + hc_20_tues
            + hc_40_tues
            + ot_20_tues
            + ot_40_tues
            + fr_20_tues
            + fr_40_tues
        )

        total_list = [
            condition_ok_total,
            allotment_total,
            survey_pending_total,
            approval_pending_total,
            under_repairing_total,
            all_total,
            tues_total,
        ]

        import_total_list = [
            "Ok Containers",
            "Sale",
            "Awaiting Est",
            "Awaiting Authorisation",
            "Under Repair",
            "TOTAL",
            "TUES",
        ]
        data = [
            [
                import_total_list[i],
                std_20_list[i],
                std_40_list[i],
                dv_20_list[i],
                dv_40_list[i],
                ht_20_list[i],
                ht_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
                total_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        in_20_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        out_20_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        in_40_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        out_40_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        in_total = in_20_total + in_40_total
        in_remark = f"{in_20_total}X20 {in_40_total}X40"
        out_total = out_20_total + out_40_total
        out_remark = f"{out_20_total}X20 {out_40_total}X40"
        cal = ["TOTAL", "REMARKS"]
        in_col = [in_total, in_remark]
        out_col = [out_total, out_remark]

        data2 = [[cal[i], in_col[i], out_col[i]] for i in range(len(cal))]

        return [data, data2]

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        data2 = [[]]
        return [data, data2]


def msc_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d-%b-%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["gate_in_date"] = gate_in_date
        data["gate_in_time"] = gate_in_time
        data["line"] = "MSC"
        data["from"] = gate_in_data["from_location_code"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["condition"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = msc_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        line = [each.get("line") for each in data]
        c_from = [each.get("from") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        condition = [each.get("condition") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                gate_in_date[i],
                gate_in_time[i],
                line[i],
                c_from[i],
                transporter[i],
                vehicle_no[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                condition[i],
                remarks[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 14)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 14)]]
        return df_data


def msc_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = "MSC"
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d-%b-%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str
        gate_out_time = out_time_str
        data["gate_out_date"] = gate_out_date
        data["gate_out_time"] = gate_out_time
        data["shipper"] = gate_out_data["shipper"]
        data["destination"] = gate_out_data["destination"]
        data["transporter"] = gate_out_data["transporter_name"]
        data["vehicle_no"] = gate_out_data["vehicle_no"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["seal_no"] = gate_out_data["seal_no"]
        data["available_seal"] = ""
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        shipper = [each.get("shipper") for each in data]
        destination = [each.get("destination") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        available_seal = [each.get("available_seal") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                gate_out_date[i],
                gate_out_time[i],
                shipper[i],
                destination[i],
                transporter[i],
                vehicle_no[i],
                booking_no[i],
                seal_no[i],
                available_seal[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 13)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 13)]]
        return df_data


def msc_status_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d-%b-%Y")
        gate_in_date = in_date_str
        data["gate_in_date"] = gate_in_date
        data["condition"] = gate_in_data["condition"]
        data["app_date"] = ""
        data["available_date"] = stock_data["available_date"]
        data["status"] = stock_data["status"]
        data["line"] = "MSC"
        data["account"] = "MSC"
        data["days"] = stock_data["aging"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_status_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_status_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        condition = [each.get("condition") for each in data]
        app_date = [each.get("app_date") for each in data]
        available_date = [each.get("available_date") for each in data]
        status = [each.get("status") for each in data]
        line = [each.get("line") for each in data]
        account = [each.get("account") for each in data]
        days = [each.get("days") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                gate_in_date[i],
                condition[i],
                app_date[i],
                available_date[i],
                status[i],
                line[i],
                account[i],
                days[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 11)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 11)]]
        return df_data


def msc_summary_main_data(location, site):
    try:

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_20_condition_ok_count = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_condition_ok_count = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_empty_allotment = int(dv_20_data.filter(status="Empty Alloted").count())
        dv_40_empty_allotment = int(dv_40_data.filter(status="Empty Alloted").count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_approved = int(dv_20_data.filter(status="Approved").count())
        dv_40_approved = int(dv_40_data.filter(status="Approved").count())
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_empty_allotment
            + dv_20_allotment
            + dv_20_estimate_pending
            + dv_20_approval_pending
            + dv_20_approved
            + dv_20_under_repairing
        )
        dv_20_tues = dv_20_total * 1
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_empty_allotment
            + dv_40_allotment
            + dv_40_estimate_pending
            + dv_40_approval_pending
            + dv_40_approved
            + dv_40_under_repairing
        )
        dv_40_tues = dv_40_total * 2
        dv_20_sale = 0
        dv_40_sale = 0
        dv_20_list = [
            dv_20_condition_ok_count,
            dv_20_empty_allotment,
            dv_20_allotment,
            dv_20_estimate_pending,
            dv_20_approval_pending,
            dv_20_approved,
            dv_20_under_repairing,
            dv_20_sale,
            dv_20_total,
            dv_20_tues,
        ]
        dv_40_list = [
            dv_40_condition_ok_count,
            dv_40_empty_allotment,
            dv_40_allotment,
            dv_40_estimate_pending,
            dv_40_approval_pending,
            dv_40_approved,
            dv_40_under_repairing,
            dv_20_sale,
            dv_40_total,
            dv_40_tues,
        ]

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_20_condition_ok_count = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_condition_ok_count = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_empty_allotment = int(std_20_data.filter(status="Empty Alloted").count())
        std_40_empty_allotment = int(std_40_data.filter(status="Empty Alloted").count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_approved = int(std_20_data.filter(status="Approved").count())
        std_40_approved = int(std_40_data.filter(status="Approved").count())
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_empty_allotment
            + std_20_allotment
            + std_20_estimate_pending
            + std_20_approval_pending
            + std_20_approved
            + std_20_under_repairing
        )
        std_20_tues = std_20_total * 1
        std_40_total = (
            std_40_condition_ok_count
            + std_40_empty_allotment
            + std_40_allotment
            + std_40_estimate_pending
            + std_40_approval_pending
            + std_40_approved
            + std_40_under_repairing
        )
        std_40_tues = std_40_total * 2
        std_20_sale = 0
        std_40_sale = 0
        std_20_list = [
            std_20_condition_ok_count,
            std_20_empty_allotment,
            std_20_allotment,
            std_20_estimate_pending,
            std_20_approval_pending,
            std_20_approved,
            std_20_under_repairing,
            std_20_sale,
            std_20_total,
            std_20_tues,
        ]
        std_40_list = [
            std_40_condition_ok_count,
            std_40_empty_allotment,
            std_40_allotment,
            std_40_estimate_pending,
            std_40_approval_pending,
            std_40_approved,
            std_40_under_repairing,
            std_20_sale,
            std_40_total,
            std_40_tues,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_20_condition_ok_count = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_condition_ok_count = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_empty_allotment = int(hc_20_data.filter(status="Empty Alloted").count())
        hc_40_empty_allotment = int(hc_40_data.filter(status="Empty Alloted").count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_approved = int(hc_20_data.filter(status="Approved").count())
        hc_40_approved = int(hc_40_data.filter(status="Approved").count())
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_empty_allotment
            + hc_20_allotment
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_approved
            + hc_20_under_repairing
        )
        hc_20_tues = hc_20_total * 1
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_empty_allotment
            + hc_40_allotment
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_approved
            + hc_40_under_repairing
        )
        hc_40_tues = hc_40_total * 2
        hc_20_sale = 0
        hc_40_sale = 0
        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_empty_allotment,
            hc_20_allotment,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_approved,
            hc_20_under_repairing,
            hc_20_sale,
            hc_20_total,
            hc_20_tues,
        ]
        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_empty_allotment,
            hc_40_allotment,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_approved,
            hc_40_under_repairing,
            hc_40_sale,
            hc_40_total,
            hc_40_tues,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_20_condition_ok_count = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_condition_ok_count = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_empty_allotment = int(ot_20_data.filter(status="Empty Alloted").count())
        ot_40_empty_allotment = int(ot_40_data.filter(status="Empty Alloted").count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_approved = int(ot_20_data.filter(status="Approved").count())
        ot_40_approved = int(ot_40_data.filter(status="Approved").count())
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_empty_allotment
            + ot_20_allotment
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_approved
            + ot_20_under_repairing
        )
        ot_20_tues = ot_20_total * 1
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_empty_allotment
            + ot_40_allotment
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_approved
            + ot_40_under_repairing
        )
        ot_40_tues = ot_40_total * 2
        ot_20_sale = 0
        ot_40_sale = 0
        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_empty_allotment,
            ot_20_allotment,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_approved,
            ot_20_under_repairing,
            ot_20_sale,
            ot_20_total,
            ot_20_tues,
        ]
        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_empty_allotment,
            ot_40_allotment,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_approved,
            ot_40_under_repairing,
            ot_40_sale,
            ot_40_total,
            ot_40_tues,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_20_condition_ok_count = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_condition_ok_count = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_empty_allotment = int(fr_20_data.filter(status="Empty Alloted").count())
        fr_40_empty_allotment = int(fr_40_data.filter(status="Empty Alloted").count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_approved = int(fr_20_data.filter(status="Approved").count())
        fr_40_approved = int(fr_40_data.filter(status="Approved").count())
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_empty_allotment
            + fr_20_allotment
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_approved
            + fr_20_under_repairing
        )
        fr_20_tues = fr_20_total * 1
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_empty_allotment
            + fr_40_allotment
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_approved
            + fr_40_under_repairing
        )
        fr_40_tues = fr_40_total * 2
        fr_20_sale = 0
        fr_40_sale = 0
        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_empty_allotment,
            fr_20_allotment,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_approved,
            fr_20_under_repairing,
            fr_20_sale,
            fr_20_total,
            fr_20_tues,
        ]
        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_empty_allotment,
            fr_40_allotment,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_approved,
            fr_40_under_repairing,
            fr_40_sale,
            fr_40_total,
            fr_40_tues,
        ]

        condition_ok_total = (
            dv_20_condition_ok_count
            + dv_40_condition_ok_count
            + std_20_condition_ok_count
            + std_40_condition_ok_count
            + hc_20_condition_ok_count
            + hc_40_condition_ok_count
            + ot_20_condition_ok_count
            + ot_40_condition_ok_count
            + fr_20_condition_ok_count
            + fr_40_condition_ok_count
        )

        empty_allotment_total = (
            dv_20_empty_allotment
            + dv_40_empty_allotment
            + std_20_empty_allotment
            + std_40_empty_allotment
            + hc_20_empty_allotment
            + hc_40_empty_allotment
            + ot_20_empty_allotment
            + ot_40_empty_allotment
            + fr_20_empty_allotment
            + fr_40_empty_allotment
        )

        allotment_total = (
            dv_20_allotment
            + dv_40_allotment
            + std_20_allotment
            + std_40_allotment
            + hc_20_allotment
            + hc_40_allotment
            + ot_20_allotment
            + ot_40_allotment
            + fr_20_allotment
            + fr_40_allotment
        )

        estimate_pending_total = (
            dv_20_estimate_pending
            + dv_40_estimate_pending
            + std_20_estimate_pending
            + std_40_estimate_pending
            + hc_20_estimate_pending
            + hc_40_estimate_pending
            + ot_20_estimate_pending
            + ot_40_estimate_pending
            + fr_20_estimate_pending
            + fr_40_estimate_pending
        )

        approval_pending_total = (
            dv_20_approval_pending
            + dv_40_approval_pending
            + std_20_approval_pending
            + std_40_approval_pending
            + hc_20_approval_pending
            + hc_40_approval_pending
            + ot_20_approval_pending
            + ot_40_approval_pending
            + fr_20_approval_pending
            + fr_40_approval_pending
        )

        approved_total = (
            dv_20_approved
            + dv_40_approved
            + std_20_approved
            + std_40_approved
            + hc_20_approved
            + hc_40_approved
            + ot_20_approved
            + ot_40_approved
            + fr_20_approved
            + fr_40_approved
        )

        under_repairing_total = (
            dv_20_under_repairing
            + dv_40_under_repairing
            + std_20_under_repairing
            + std_40_under_repairing
            + hc_20_under_repairing
            + hc_40_under_repairing
            + ot_20_under_repairing
            + ot_40_under_repairing
            + fr_20_under_repairing
            + fr_40_under_repairing
        )

        sale_total = (
            dv_20_sale
            + dv_40_sale
            + std_20_sale
            + std_40_sale
            + hc_20_sale
            + hc_40_sale
            + ot_20_sale
            + ot_40_sale
            + fr_20_sale
            + fr_40_sale
        )

        all_total = (
            dv_20_total
            + dv_40_total
            + std_20_total
            + std_40_total
            + hc_20_total
            + hc_40_total
            + ot_20_total
            + ot_40_total
            + fr_20_total
            + fr_40_total
        )

        tues_total = (
            dv_20_tues
            + dv_40_tues
            + std_20_tues
            + std_40_tues
            + hc_20_tues
            + hc_40_tues
            + ot_20_tues
            + ot_40_tues
            + fr_20_tues
            + fr_40_tues
        )

        total_list = [
            condition_ok_total,
            empty_allotment_total,
            allotment_total,
            estimate_pending_total,
            approval_pending_total,
            approved_total,
            under_repairing_total,
            sale_total,
            all_total,
            tues_total,
        ]

        import_total_list = [
            "Ok Containers",
            "Empty Alloted",
            "Alloted",
            "Awaiting Est",
            "Awaiting Authorisation",
            "Authorised",
            "Under Repair",
            "Sale",
            "TOTAL",
            "TUES",
        ]

        # remark_list = ["", "", "", "", "", "", "", "", "", ""]

        data = [
            [
                import_total_list[i],
                dv_20_list[i],
                dv_40_list[i],
                std_20_list[i],
                std_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
                total_list[i],
                # remark_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        return data


def msc_seal_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        gate_in_date = in_date_str
        data["gate_in_date"] = gate_in_date
        data["seal_no"] = stock_data["seal_no"]
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["booking_no"] = stock_data["booking_no"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_seal_main_data(data_object_list):
    try:
        count = 0
        data = []
        seal_data_object_list = [
            each for each in data_object_list if not each.seal_no is None
        ]
        for each in seal_data_object_list:
            count += 1
            each_data = msc_seal_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [sl_no[i], seal_no[i], container_no[i], size[i], booking_no[i], remarks[i]]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 6)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 6)]]
        return df_data


def msc_amd_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["gate_in_date"] = gate_in_date
        data["gate_in_time"] = gate_in_time

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["gross_wt"] = container_data["gross_wt"]
        data["payload"] = container_data["payload"]
        data["location"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["status"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        data["opr"] = "MSC"
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_amd_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = msc_amd_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        payload = [each.get("payload") for each in data]
        location = [each.get("location") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        opr = [each.get("opr") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                gate_in_date[i],
                gate_in_time[i],
                mfg_date[i],
                gross_wt[i],
                payload[i],
                location[i],
                transporter[i],
                vehicle_no[i],
                status[i],
                remarks[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 14)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 14)]]
        return df_data


def msc_amd_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d/%b/%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str
        gate_out_time = out_time_str
        data["gate_out_date"] = gate_out_date
        data["gate_out_time"] = gate_out_time
        data["booking_no"] = gate_out_data["booking_no"]
        data["booking_party"] = gate_out_data["booking_party"]
        data["shipper"] = gate_out_data["shipper"]
        data["port_of_loading"] = gate_out_data["port_of_loading"]
        data["port_of_discharge"] = gate_out_data["port_of_discharge"]
        data["place"] = gate_out_data["destination"]
        data["destination"] = gate_out_data["destination"]
        data["seal_no"] = gate_out_data["seal_no"]
        data["trailor_no"] = gate_out_data["vehicle_no"]
        data["transporter"] = gate_out_data["transporter_name"]
        data["status"] = gate_out_data["condition"]
        data["remarks"] = gate_out_data["remarks"]
        data["opr"] = "MSC"
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_amd_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_amd_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        booking_party = [each.get("booking_party") for each in data]
        shipper = [each.get("shipper") for each in data]
        port_of_loading = [each.get("port_of_loading") for each in data]
        port_of_discharge = [each.get("port_of_discharge") for each in data]
        place = [each.get("place") for each in data]
        destination = [each.get("destination") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        trailor_no = [each.get("trailor_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        opr = [each.get("opr") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                gate_out_date[i],
                gate_out_time[i],
                booking_no[i],
                booking_party[i],
                shipper[i],
                port_of_loading[i],
                port_of_discharge[i],
                place[i],
                destination[i],
                seal_no[i],
                trailor_no[i],
                transporter[i],
                status[i],
                remarks[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 18)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 18)]]
        return df_data


def msc_amd_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        gate_in_date = in_date_str
        data["gate_in_date"] = gate_in_date
        data["opr"] = "MSC"
        data["location"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["payload"] = container_data["payload"]
        data["gross_wt"] = container_data["gross_wt"]
        data["condition"] = gate_in_data["condition"]
        data["status"] = stock_data["status"]
        data["available_date"] = stock_data["available_date"]
        data["age"] = stock_data["aging"]
        data["allotment_date"] = stock_data["allotment_date"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_amd_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_amd_stock_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        opr = [each.get("opr") for each in data]
        location = [each.get("location") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        payload = [each.get("payload") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        condition = [each.get("condition") for each in data]
        status = [each.get("status") for each in data]
        available_date = [each.get("available_date") for each in data]
        age = [each.get("age") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                mfg_date[i],
                gate_in_date[i],
                opr[i],
                location[i],
                transporter[i],
                vehicle_no[i],
                payload[i],
                gross_wt[i],
                condition[i],
                status[i],
                available_date[i],
                age[i],
                allotment_date[i],
                remarks[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 17)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 17)]]
        return df_data


def msc_amd_summary_main_data(location, site):
    try:

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_20_condition_ok_count = int(
            std_20_data.filter(gate_in__condition="OK").count()
        )
        std_40_condition_ok_count = int(
            std_40_data.filter(gate_in__condition="OK").count()
        )
        std_20_survey_pending = int(std_20_data.filter(status="Survey Pending").count())
        std_40_survey_pending = int(std_40_data.filter(status="Survey Pending").count())
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_available = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_available = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_20_condition_ok_count = int(
            dv_20_data.filter(gate_in__condition="OK").count()
        )
        dv_40_condition_ok_count = int(
            dv_40_data.filter(gate_in__condition="OK").count()
        )
        dv_20_survey_pending = int(dv_20_data.filter(status="Survey Pending").count())
        dv_40_survey_pending = int(dv_40_data.filter(status="Survey Pending").count())
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_available = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_available = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )

        dry_20_condition_ok_count = std_20_condition_ok_count + dv_20_condition_ok_count
        dry_40_condition_ok_count = std_40_condition_ok_count + dv_40_condition_ok_count
        dry_20_survey_pending = std_20_survey_pending + dv_20_survey_pending
        dry_40_survey_pending = std_40_survey_pending + dv_40_survey_pending
        dry_20_estimate_pending = std_20_estimate_pending + dv_20_estimate_pending
        dry_40_estimate_pending = std_40_estimate_pending + dv_40_estimate_pending
        dry_20_approval_pending = std_20_approval_pending + dv_20_approval_pending
        dry_40_approval_pending = std_40_approval_pending + dv_40_approval_pending
        dry_20_under_repairing = std_20_under_repairing + dv_20_under_repairing
        dry_40_under_repairing = std_40_under_repairing + dv_40_under_repairing
        dry_20_available = std_20_available + dv_20_available
        dry_40_available = std_40_available + dv_40_available
        dry_20_allotment = std_20_allotment + dv_20_allotment
        dry_40_allotment = std_40_allotment + dv_40_allotment

        dry_20_total = (
            dry_20_condition_ok_count
            + dry_20_survey_pending
            + dry_20_estimate_pending
            + dry_20_approval_pending
            + dry_20_under_repairing
            + dry_20_available
            + dry_20_allotment
        )

        dry_40_total = (
            dry_40_condition_ok_count
            + dry_40_survey_pending
            + dry_40_estimate_pending
            + dry_40_approval_pending
            + dry_40_under_repairing
            + dry_40_available
            + dry_40_allotment
        )

        dry_20_list = [
            dry_20_condition_ok_count,
            dry_20_survey_pending,
            dry_20_estimate_pending,
            dry_20_approval_pending,
            dry_20_under_repairing,
            dry_20_available,
            dry_20_allotment,
            dry_20_total,
        ]

        dry_40_list = [
            dry_40_condition_ok_count,
            dry_40_survey_pending,
            dry_40_estimate_pending,
            dry_40_approval_pending,
            dry_40_under_repairing,
            dry_40_available,
            dry_40_allotment,
            dry_40_total,
        ]

        ht_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ht_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ht_20_condition_ok_count = int(
            ht_20_data.filter(gate_in__condition="OK").count()
        )
        ht_40_condition_ok_count = int(
            ht_40_data.filter(gate_in__condition="OK").count()
        )
        ht_20_survey_pending = int(ht_20_data.filter(status="Survey Pending").count())
        ht_40_survey_pending = int(ht_40_data.filter(status="Survey Pending").count())
        ht_20_estimate_pending = int(
            ht_20_data.filter(status="Estimate Pending").count()
        )
        ht_40_estimate_pending = int(
            ht_40_data.filter(status="Estimate Pending").count()
        )
        ht_20_approval_pending = int(
            ht_20_data.filter(status="Approval Pending").count()
        )
        ht_40_approval_pending = int(
            ht_40_data.filter(status="Approval Pending").count()
        )
        ht_20_under_repairing = int(ht_20_data.filter(status="Under Repairing").count())
        ht_40_under_repairing = int(ht_40_data.filter(status="Under Repairing").count())
        ht_20_available = int(ht_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ht_40_available = int(ht_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ht_20_allotment = int(
            len([each for each in list(ht_20_data) if not each.allotment_date is None])
        )
        ht_40_allotment = int(
            len([each for each in list(ht_40_data) if not each.allotment_date is None])
        )

        ht_20_total = (
            ht_20_condition_ok_count
            + ht_20_survey_pending
            + ht_20_estimate_pending
            + ht_20_approval_pending
            + ht_20_under_repairing
            + ht_20_available
            + ht_20_allotment
        )

        ht_40_total = (
            ht_40_condition_ok_count
            + ht_40_survey_pending
            + ht_40_estimate_pending
            + ht_40_approval_pending
            + ht_40_under_repairing
            + ht_40_available
            + ht_40_allotment
        )

        ht_20_list = [
            ht_20_condition_ok_count,
            ht_20_survey_pending,
            ht_20_estimate_pending,
            ht_20_approval_pending,
            ht_20_under_repairing,
            ht_20_available,
            ht_20_allotment,
            ht_20_total,
        ]

        ht_40_list = [
            ht_40_condition_ok_count,
            ht_40_survey_pending,
            ht_40_estimate_pending,
            ht_40_approval_pending,
            ht_40_under_repairing,
            ht_40_available,
            ht_40_allotment,
            ht_40_total,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_20_condition_ok_count = int(
            hc_20_data.filter(gate_in__condition="OK").count()
        )
        hc_40_condition_ok_count = int(
            hc_40_data.filter(gate_in__condition="OK").count()
        )
        hc_20_survey_pending = int(hc_20_data.filter(status="Survey Pending").count())
        hc_40_survey_pending = int(hc_40_data.filter(status="Survey Pending").count())
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_available = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_available = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )

        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_survey_pending
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_under_repairing
            + hc_20_available
            + hc_20_allotment
        )

        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_survey_pending
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_under_repairing
            + hc_40_available
            + hc_40_allotment
        )

        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_survey_pending,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_under_repairing,
            hc_20_available,
            hc_20_allotment,
            hc_20_total,
        ]

        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_survey_pending,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_under_repairing,
            hc_40_available,
            hc_40_allotment,
            hc_40_total,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_20_condition_ok_count = int(
            ot_20_data.filter(gate_in__condition="OK").count()
        )
        ot_40_condition_ok_count = int(
            ot_40_data.filter(gate_in__condition="OK").count()
        )
        ot_20_survey_pending = int(ot_20_data.filter(status="Survey Pending").count())
        ot_40_survey_pending = int(ot_40_data.filter(status="Survey Pending").count())
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_available = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_available = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )

        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_survey_pending
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_under_repairing
            + ot_20_available
            + ot_20_allotment
        )

        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_survey_pending
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_under_repairing
            + ot_40_available
            + ot_40_allotment
        )

        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_survey_pending,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_under_repairing,
            ot_20_available,
            ot_20_allotment,
            ot_20_total,
        ]

        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_survey_pending,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_under_repairing,
            ot_40_available,
            ot_40_allotment,
            ot_40_total,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_20_condition_ok_count = int(
            fr_20_data.filter(gate_in__condition="OK").count()
        )
        fr_40_condition_ok_count = int(
            fr_40_data.filter(gate_in__condition="OK").count()
        )
        fr_20_survey_pending = int(fr_20_data.filter(status="Survey Pending").count())
        fr_40_survey_pending = int(fr_40_data.filter(status="Survey Pending").count())
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_available = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_available = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )

        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_survey_pending
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_under_repairing
            + fr_20_available
            + fr_20_allotment
        )

        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_survey_pending
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_under_repairing
            + fr_40_available
            + fr_40_allotment
        )

        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_survey_pending,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_under_repairing,
            fr_20_available,
            fr_20_allotment,
            fr_20_total,
        ]

        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_survey_pending,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_under_repairing,
            fr_40_available,
            fr_40_allotment,
            fr_40_total,
        ]

        ref_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="REF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ref_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="REF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ref_20_condition_ok_count = int(
            ref_20_data.filter(gate_in__condition="OK").count()
        )
        ref_40_condition_ok_count = int(
            ref_40_data.filter(gate_in__condition="OK").count()
        )
        ref_20_survey_pending = int(ref_20_data.filter(status="Survey Pending").count())
        ref_40_survey_pending = int(ref_40_data.filter(status="Survey Pending").count())
        ref_20_estimate_pending = int(
            ref_20_data.filter(status="Estimate Pending").count()
        )
        ref_40_estimate_pending = int(
            ref_40_data.filter(status="Estimate Pending").count()
        )
        ref_20_approval_pending = int(
            ref_20_data.filter(status="Approval Pending").count()
        )
        ref_40_approval_pending = int(
            ref_40_data.filter(status="Approval Pending").count()
        )
        ref_20_under_repairing = int(
            ref_20_data.filter(status="Under Repairing").count()
        )
        ref_40_under_repairing = int(
            ref_40_data.filter(status="Under Repairing").count()
        )
        ref_20_available = int(ref_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ref_40_available = int(ref_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ref_20_allotment = int(
            len([each for each in list(ref_20_data) if not each.allotment_date is None])
        )
        ref_40_allotment = int(
            len([each for each in list(ref_40_data) if not each.allotment_date is None])
        )

        ref_20_total = (
            ref_20_condition_ok_count
            + ref_20_survey_pending
            + ref_20_estimate_pending
            + ref_20_approval_pending
            + ref_20_under_repairing
            + ref_20_available
            + ref_20_allotment
        )

        ref_40_total = (
            ref_40_condition_ok_count
            + ref_40_survey_pending
            + ref_40_estimate_pending
            + ref_40_approval_pending
            + ref_40_under_repairing
            + ref_40_available
            + ref_40_allotment
        )

        ref_20_list = [
            ref_20_condition_ok_count,
            ref_20_survey_pending,
            ref_20_estimate_pending,
            ref_20_approval_pending,
            ref_20_under_repairing,
            ref_20_available,
            ref_20_allotment,
            ref_20_total,
        ]

        ref_40_list = [
            ref_40_condition_ok_count,
            ref_40_survey_pending,
            ref_40_estimate_pending,
            ref_40_approval_pending,
            ref_40_under_repairing,
            ref_40_available,
            ref_40_allotment,
            ref_40_total,
        ]

        refven_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="REFVEN",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        refven_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="REFVEN",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        refven_20_condition_ok_count = int(
            refven_20_data.filter(gate_in__condition="OK").count()
        )
        refven_40_condition_ok_count = int(
            refven_40_data.filter(gate_in__condition="OK").count()
        )
        refven_20_survey_pending = int(
            refven_20_data.filter(status="Survey Pending").count()
        )
        refven_40_survey_pending = int(
            refven_40_data.filter(status="Survey Pending").count()
        )
        refven_20_estimate_pending = int(
            refven_20_data.filter(status="Estimate Pending").count()
        )
        refven_40_estimate_pending = int(
            refven_40_data.filter(status="Estimate Pending").count()
        )
        refven_20_approval_pending = int(
            refven_20_data.filter(status="Approval Pending").count()
        )
        refven_40_approval_pending = int(
            refven_40_data.filter(status="Approval Pending").count()
        )
        refven_20_under_repairing = int(
            refven_20_data.filter(status="Under Repairing").count()
        )
        refven_40_under_repairing = int(
            refven_40_data.filter(status="Under Repairing").count()
        )
        refven_20_available = int(refven_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        refven_40_available = int(refven_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        refven_20_allotment = int(
            len(
                [
                    each
                    for each in list(refven_20_data)
                    if not each.allotment_date is None
                ]
            )
        )
        refven_40_allotment = int(
            len(
                [
                    each
                    for each in list(refven_40_data)
                    if not each.allotment_date is None
                ]
            )
        )

        refven_20_total = (
            refven_20_condition_ok_count
            + refven_20_survey_pending
            + refven_20_estimate_pending
            + refven_20_approval_pending
            + refven_20_under_repairing
            + refven_20_available
            + refven_20_allotment
        )

        refven_40_total = (
            refven_40_condition_ok_count
            + refven_40_survey_pending
            + refven_40_estimate_pending
            + refven_40_approval_pending
            + refven_40_under_repairing
            + refven_40_available
            + refven_40_allotment
        )

        refven_20_list = [
            refven_20_condition_ok_count,
            refven_20_survey_pending,
            refven_20_estimate_pending,
            refven_20_approval_pending,
            refven_20_under_repairing,
            refven_20_available,
            refven_20_allotment,
            refven_20_total,
        ]

        refven_40_list = [
            refven_40_condition_ok_count,
            refven_40_survey_pending,
            refven_40_estimate_pending,
            refven_40_approval_pending,
            refven_40_under_repairing,
            refven_40_available,
            refven_40_allotment,
            refven_40_total,
        ]

        hcref_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="HCREF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hcref_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="HCREF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hcref_20_condition_ok_count = int(
            hcref_20_data.filter(gate_in__condition="OK").count()
        )
        hcref_40_condition_ok_count = int(
            hcref_40_data.filter(gate_in__condition="OK").count()
        )
        hcref_20_survey_pending = int(
            hcref_20_data.filter(status="Survey Pending").count()
        )
        hcref_40_survey_pending = int(
            hcref_40_data.filter(status="Survey Pending").count()
        )
        hcref_20_estimate_pending = int(
            hcref_20_data.filter(status="Estimate Pending").count()
        )
        hcref_40_estimate_pending = int(
            hcref_40_data.filter(status="Estimate Pending").count()
        )
        hcref_20_approval_pending = int(
            hcref_20_data.filter(status="Approval Pending").count()
        )
        hcref_40_approval_pending = int(
            hcref_40_data.filter(status="Approval Pending").count()
        )
        hcref_20_under_repairing = int(
            hcref_20_data.filter(status="Under Repairing").count()
        )
        hcref_40_under_repairing = int(
            hcref_40_data.filter(status="Under Repairing").count()
        )
        hcref_20_available = int(hcref_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hcref_40_available = int(hcref_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hcref_20_allotment = int(
            len(
                [
                    each
                    for each in list(hcref_20_data)
                    if not each.allotment_date is None
                ]
            )
        )
        hcref_40_allotment = int(
            len(
                [
                    each
                    for each in list(hcref_40_data)
                    if not each.allotment_date is None
                ]
            )
        )

        hcref_20_total = (
            hcref_20_condition_ok_count
            + hcref_20_survey_pending
            + hcref_20_estimate_pending
            + hcref_20_approval_pending
            + hcref_20_under_repairing
            + hcref_20_available
            + hcref_20_allotment
        )

        hcref_40_total = (
            hcref_40_condition_ok_count
            + hcref_40_survey_pending
            + hcref_40_estimate_pending
            + hcref_40_approval_pending
            + hcref_40_under_repairing
            + hcref_40_available
            + hcref_40_allotment
        )

        hcref_20_list = [
            hcref_20_condition_ok_count,
            hcref_20_survey_pending,
            hcref_20_estimate_pending,
            hcref_20_approval_pending,
            hcref_20_under_repairing,
            hcref_20_available,
            hcref_20_allotment,
            hcref_20_total,
        ]

        hcref_40_list = [
            hcref_40_condition_ok_count,
            hcref_40_survey_pending,
            hcref_40_estimate_pending,
            hcref_40_approval_pending,
            hcref_40_under_repairing,
            hcref_40_available,
            hcref_40_allotment,
            hcref_40_total,
        ]

        tank_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="TANK",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        tank_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="TANK",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        tank_20_condition_ok_count = int(
            tank_20_data.filter(gate_in__condition="OK").count()
        )
        tank_40_condition_ok_count = int(
            tank_40_data.filter(gate_in__condition="OK").count()
        )
        tank_20_survey_pending = int(
            tank_20_data.filter(status="Survey Pending").count()
        )
        tank_40_survey_pending = int(
            tank_40_data.filter(status="Survey Pending").count()
        )
        tank_20_estimate_pending = int(
            tank_20_data.filter(status="Estimate Pending").count()
        )
        tank_40_estimate_pending = int(
            tank_40_data.filter(status="Estimate Pending").count()
        )
        tank_20_approval_pending = int(
            tank_20_data.filter(status="Approval Pending").count()
        )
        tank_40_approval_pending = int(
            tank_40_data.filter(status="Approval Pending").count()
        )
        tank_20_under_repairing = int(
            tank_20_data.filter(status="Under Repairing").count()
        )
        tank_40_under_repairing = int(
            tank_40_data.filter(status="Under Repairing").count()
        )
        tank_20_available = int(tank_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        tank_40_available = int(tank_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        tank_20_allotment = int(
            len(
                [each for each in list(tank_20_data) if not each.allotment_date is None]
            )
        )
        tank_40_allotment = int(
            len(
                [each for each in list(tank_40_data) if not each.allotment_date is None]
            )
        )

        tank_20_total = (
            tank_20_condition_ok_count
            + tank_20_survey_pending
            + tank_20_estimate_pending
            + tank_20_approval_pending
            + tank_20_under_repairing
            + tank_20_available
            + tank_20_allotment
        )

        tank_40_total = (
            tank_40_condition_ok_count
            + tank_40_survey_pending
            + tank_40_estimate_pending
            + tank_40_approval_pending
            + tank_40_under_repairing
            + tank_40_available
            + tank_40_allotment
        )

        tank_20_list = [
            tank_20_condition_ok_count,
            tank_20_survey_pending,
            tank_20_estimate_pending,
            tank_20_approval_pending,
            tank_20_under_repairing,
            tank_20_available,
            tank_20_allotment,
            tank_20_total,
        ]

        tank_40_list = [
            tank_40_condition_ok_count,
            tank_40_survey_pending,
            tank_40_estimate_pending,
            tank_40_approval_pending,
            tank_40_under_repairing,
            tank_40_available,
            tank_40_allotment,
            tank_40_total,
        ]

        condition_ok_20_total_count = (
            dry_20_condition_ok_count
            + ht_20_condition_ok_count
            + hc_20_condition_ok_count
            + ot_20_condition_ok_count
            + fr_20_condition_ok_count
            + ref_20_condition_ok_count
            + hcref_20_condition_ok_count
            + refven_20_condition_ok_count
            + tank_20_condition_ok_count
        )

        survey_pending_20_total_count = (
            dry_20_survey_pending
            + ht_20_survey_pending
            + hc_20_survey_pending
            + ot_20_survey_pending
            + fr_20_survey_pending
            + ref_20_survey_pending
            + hcref_20_survey_pending
            + refven_20_survey_pending
            + tank_20_survey_pending
        )

        estimate_pending_20_total_count = (
            dry_20_estimate_pending
            + ht_20_estimate_pending
            + hc_20_estimate_pending
            + ot_20_estimate_pending
            + fr_20_estimate_pending
            + ref_20_estimate_pending
            + hcref_20_estimate_pending
            + refven_20_estimate_pending
            + tank_20_estimate_pending
        )

        approval_pending_20_total_count = (
            dry_20_approval_pending
            + ht_20_approval_pending
            + hc_20_approval_pending
            + ot_20_approval_pending
            + fr_20_approval_pending
            + ref_20_approval_pending
            + hcref_20_approval_pending
            + refven_20_approval_pending
            + tank_20_approval_pending
        )

        under_repairing_20_total_count = (
            dry_20_under_repairing
            + ht_20_under_repairing
            + hc_20_under_repairing
            + ot_20_under_repairing
            + fr_20_under_repairing
            + ref_20_under_repairing
            + hcref_20_under_repairing
            + refven_20_under_repairing
            + tank_20_under_repairing
        )

        available_20_total_count = (
            dry_20_available
            + ht_20_available
            + hc_20_available
            + ot_20_available
            + fr_20_available
            + ref_20_available
            + hcref_20_available
            + refven_20_available
            + tank_20_available
        )

        allotment_20_total_count = (
            dry_20_allotment
            + ht_20_allotment
            + hc_20_allotment
            + ot_20_allotment
            + fr_20_allotment
            + ref_20_allotment
            + hcref_20_allotment
            + refven_20_allotment
            + tank_20_allotment
        )

        total_20_all_count = (
            dry_20_total
            + ht_20_total
            + hc_20_total
            + ot_20_total
            + fr_20_total
            + ref_20_total
            + hcref_20_total
            + refven_20_total
            + tank_20_total
        )

        last_total_20_list = [
            condition_ok_20_total_count,
            survey_pending_20_total_count,
            estimate_pending_20_total_count,
            approval_pending_20_total_count,
            under_repairing_20_total_count,
            available_20_total_count,
            allotment_20_total_count,
            total_20_all_count,
        ]

        condition_ok_40_total_count = (
            dry_40_condition_ok_count
            + ht_40_condition_ok_count
            + hc_40_condition_ok_count
            + ot_40_condition_ok_count
            + fr_40_condition_ok_count
            + ref_40_condition_ok_count
            + hcref_40_condition_ok_count
            + refven_40_condition_ok_count
            + tank_40_condition_ok_count
        )

        survey_pending_40_total_count = (
            dry_40_survey_pending
            + ht_40_survey_pending
            + hc_40_survey_pending
            + ot_40_survey_pending
            + fr_40_survey_pending
            + ref_40_survey_pending
            + hcref_40_survey_pending
            + refven_40_survey_pending
            + tank_40_survey_pending
        )

        estimate_pending_40_total_count = (
            dry_40_estimate_pending
            + ht_40_estimate_pending
            + hc_40_estimate_pending
            + ot_40_estimate_pending
            + fr_40_estimate_pending
            + ref_40_estimate_pending
            + hcref_40_estimate_pending
            + refven_40_estimate_pending
            + tank_40_estimate_pending
        )

        approval_pending_40_total_count = (
            dry_40_approval_pending
            + ht_40_approval_pending
            + hc_40_approval_pending
            + ot_40_approval_pending
            + fr_40_approval_pending
            + ref_40_approval_pending
            + hcref_40_approval_pending
            + refven_40_approval_pending
            + tank_40_approval_pending
        )

        under_repairing_40_total_count = (
            dry_40_under_repairing
            + ht_40_under_repairing
            + hc_40_under_repairing
            + ot_40_under_repairing
            + fr_40_under_repairing
            + ref_40_under_repairing
            + hcref_40_under_repairing
            + refven_40_under_repairing
            + tank_40_under_repairing
        )

        available_40_total_count = (
            dry_40_available
            + ht_40_available
            + hc_40_available
            + ot_40_available
            + fr_40_available
            + ref_40_available
            + hcref_40_available
            + refven_40_available
            + tank_40_available
        )

        allotment_40_total_count = (
            dry_40_allotment
            + ht_40_allotment
            + hc_40_allotment
            + ot_40_allotment
            + fr_40_allotment
            + ref_40_allotment
            + hcref_40_allotment
            + refven_40_allotment
            + tank_40_allotment
        )

        total_40_all_count = (
            dry_40_total
            + ht_40_total
            + hc_40_total
            + ot_40_total
            + fr_40_total
            + ref_40_total
            + hcref_40_total
            + refven_40_total
            + tank_40_total
        )

        last_total_40_list = [
            condition_ok_40_total_count,
            survey_pending_40_total_count,
            estimate_pending_40_total_count,
            approval_pending_40_total_count,
            under_repairing_40_total_count,
            available_40_total_count,
            allotment_40_total_count,
            total_40_all_count,
        ]

        type_list = ["OK", "AS", "AE", "AA", "AR", "AV", "ALLOTMENT", "TOTAL"]

        df_20_data = [
            [
                type_list[i],
                hc_20_list[i],
                hcref_20_list[i],
                refven_20_list[i],
                fr_20_list[i],
                ot_20_list[i],
                ref_20_list[i],
                tank_20_list[i],
                ht_20_list[i],
                dry_20_list[i],
                last_total_20_list[i],
            ]
            for i in range(len(type_list))
        ]

        df_40_data = [
            [
                type_list[i],
                hc_40_list[i],
                hcref_40_list[i],
                refven_40_list[i],
                fr_40_list[i],
                ot_40_list[i],
                ref_40_list[i],
                tank_40_list[i],
                ht_40_list[i],
                dry_40_list[i],
                last_total_40_list[i],
            ]
            for i in range(len(type_list))
        ]

        return [df_20_data, df_40_data]

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_20_data = [[]]
        df_40_data = [[]]
        return [df_20_data, df_40_data]


def msc_tuticorin_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        lolo_data = data_object.lolo.get_handling()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%m/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%H:%M")
        data["in_date_time"] = in_date_str + " " + in_time_str
        data["in_date"] = in_date_str
        data["in_time"] = in_time_str
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["tr_weight"] = container_data["tare_wt"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["vessel_voyage"] = (
            gate_in_data["vessel_name"] + ", " + gate_in_data["voyage_no"]
        )
        data["customer"] = lolo_data["customer_name"]
        data["truck_no"] = gate_in_data["vehicle_no"]
        data["import_cgo"] = gate_in_data["cargo"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_inward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_tuticorin_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        tr_weight = [each.get("tr_weight") for each in data]
        mfg_dt = [each.get("mfg_date") for each in data]
        vessel_voyage = [each.get("vessel_voyage") for each in data]
        customer = [each.get("customer") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        import_cgo = [each.get("import_cgo") for each in data]
        df_data = [
            [
                sl_no[i],
                in_date_time[i],
                in_date[i],
                in_time[i],
                container_no[i],
                size_type[i],
                tr_weight[i],
                mfg_dt[i],
                vessel_voyage[i],
                customer[i],
                truck_no[i],
                import_cgo[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 11)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 11)]]
        return df_data


def msc_tuticorin_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        lolo_data = data_object.lolo.get_handling()
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d/%m/%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%H:%M")
        data["out_date_time"] = out_date_str + " " + out_time_str
        data["out_date"] = out_date_str
        data["out_time"] = out_time_str
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["truck_no"] = gate_out_data["vehicle_no"]
        data["customer"] = lolo_data["customer_name"]
        data["export_cgo"] = gate_out_data["export_cargo"]
        data["seal_no"] = gate_out_data["seal_no"]
        data["booking_no"] = gate_out_data["booking_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_tuticorin_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        out_date_time = [each.get("out_date_time") for each in data]
        out_date = [each.get("out_date") for each in data]
        out_time = [each.get("out_time") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        customer = [each.get("customer") for each in data]
        export_cgo = [each.get("export_cgo") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        booking_no = [each.get("booking_no") for each in data]

        df_data = [
            [
                sl_no[i],
                out_date_time[i],
                out_date[i],
                out_time[i],
                container_no[i],
                size_type[i],
                truck_no[i],
                customer[i],
                export_cgo[i],
                seal_no[i],
                booking_no[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 10)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 10)]]
        return df_data


def msc_tuticorin_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%m/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%H:%M")
        in_date_time = in_date_str + " " + in_time_str
        in_date = in_date_str
        in_time = in_time_str
        data["in_date_time"] = in_date_time
        data["in_date"] = in_date
        data["in_time"] = in_time
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["gr_weight"] = container_data["gross_wt"]
        data["tr_weight"] = container_data["tare_wt"]
        data["customer"] = container_data["client"]
        data["import_cgo"] = gate_in_data["cargo"]
        data["age"] = stock_data["aging"]
        data["status"] = gate_in_data["condition"]
        data["av_date"] = stock_data["available_date"]
        data["payload"] = container_data["payload"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_tuticorin_stock_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        mfg_dt = [each.get("mfg_date") for each in data]
        gr_weight = [each.get("gr_weight") for each in data]
        tr_weight = [each.get("tr_weight") for each in data]
        customer = [each.get("customer") for each in data]
        import_cgo = [each.get("import_cgo") for each in data]
        age = [each.get("age") for each in data]
        status = [each.get("status") for each in data]
        av_date = [each.get("av_date") for each in data]
        payload = [each.get("payload") for each in data]

        df_data = [
            [
                sl_no[i],
                in_date_time[i],
                in_date[i],
                in_time[i],
                container_no[i],
                size_type[i],
                mfg_dt[i],
                gr_weight[i],
                tr_weight[i],
                customer[i],
                import_cgo[i],
                age[i],
                status[i],
                av_date[i],
                payload[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 14)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 14)]]
        return df_data


def msc_tuticorin_stock_av_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%m/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%H:%M")
        in_date_time = in_date_str + " " + in_time_str
        in_date = in_date_str
        in_time = in_time_str
        data["in_date_time"] = in_date_time
        data["in_date"] = in_date
        data["in_time"] = in_time
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["av_date"] = stock_data["available_date"]
        data["import_cgo"] = gate_in_data["cargo"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_tuticorin_stock_av_main_data(location, site):
    try:
        count = 0
        data = []
        stock_object_data = list(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            ).filter(
                container__client__ref_code="MSC",
                container_status="IN",
                container__location=location,
                container__site=site,
                status__in=["Available", "Without_Repair_Available"],
            )
        )
        for each in stock_object_data:
            count += 1
            each_data = msc_tuticorin_stock_av_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        av_date = [each.get("av_date") for each in data]
        import_cgo = [each.get("import_cgo") for each in data]

        df_data = [
            [
                sl_no[i],
                in_date_time[i],
                in_date[i],
                in_time[i],
                container_no[i],
                size_type[i],
                av_date[i],
                import_cgo[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 6)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 6)]]
        return df_data


def msc_tuticorin_summary_main_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time
        data = []

        dv2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv2_op_data_count = dv2_op_in_data_count - dv2_op_out_data_count

        dv2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count
        data.append(
            {
                "SizeType": "20'DV",
                "OpBal": dv2_op_data_count,
                "InQty": dv2_in_data_count,
                "OutQty": dv2_out_data_count,
                "ClBal": dv2_cl_bal,
            }
        )
        dv4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv4_op_data_count = dv4_op_in_data_count - dv4_op_out_data_count

        dv4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count
        data.append(
            {
                "SizeType": "40'DV",
                "OpBal": dv4_op_data_count,
                "InQty": dv4_in_data_count,
                "OutQty": dv4_out_data_count,
                "ClBal": dv4_cl_bal,
            }
        )

        fr2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr2_op_data_count = fr2_op_in_data_count - fr2_op_out_data_count

        fr2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count
        data.append(
            {
                "SizeType": "20'FR",
                "OpBal": fr2_op_data_count,
                "InQty": fr2_in_data_count,
                "OutQty": fr2_out_data_count,
                "ClBal": fr2_cl_bal,
            }
        )
        fr4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr4_op_data_count = fr4_op_in_data_count - fr4_op_out_data_count

        fr4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count
        data.append(
            {
                "SizeType": "40'FR",
                "OpBal": fr4_op_data_count,
                "InQty": fr4_in_data_count,
                "OutQty": fr4_out_data_count,
                "ClBal": fr4_cl_bal,
            }
        )

        hc2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc2_op_data_count = hc2_op_in_data_count - hc2_op_out_data_count

        hc2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count
        data.append(
            {
                "SizeType": "20'H/C",
                "OpBal": hc2_op_data_count,
                "InQty": hc2_in_data_count,
                "OutQty": hc2_out_data_count,
                "ClBal": hc2_cl_bal,
            }
        )

        hc4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc4_op_data_count = hc4_op_in_data_count - hc4_op_out_data_count

        hc4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count
        data.append(
            {
                "SizeType": "40'H/C",
                "OpBal": hc4_op_data_count,
                "InQty": hc4_in_data_count,
                "OutQty": hc4_out_data_count,
                "ClBal": hc4_cl_bal,
            }
        )

        ht2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht2_op_data_count = ht2_op_in_data_count - ht2_op_out_data_count

        ht2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht2_cl_bal = ht2_op_data_count + ht2_in_data_count - ht2_out_data_count
        data.append(
            {
                "SizeType": "20'HT",
                "OpBal": ht2_op_data_count,
                "InQty": ht2_in_data_count,
                "OutQty": ht2_out_data_count,
                "ClBal": ht2_cl_bal,
            }
        )

        ht4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht4_op_data_count = ht4_op_in_data_count - ht4_op_out_data_count

        ht4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ht4_cl_bal = ht4_op_data_count + ht4_in_data_count - ht4_out_data_count
        data.append(
            {
                "SizeType": "40'HT",
                "OpBal": ht4_op_data_count,
                "InQty": ht4_in_data_count,
                "OutQty": ht4_out_data_count,
                "ClBal": ht4_cl_bal,
            }
        )

        ot2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot2_op_data_count = ot2_op_in_data_count - ot2_op_out_data_count

        ot2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count
        data.append(
            {
                "SizeType": "20'OT",
                "OpBal": ot2_op_data_count,
                "InQty": ot2_in_data_count,
                "OutQty": ot2_out_data_count,
                "ClBal": ot2_cl_bal,
            }
        )

        ot4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot4_op_data_count = ot4_op_in_data_count - ot4_op_out_data_count

        ot4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count
        data.append(
            {
                "SizeType": "40'OT",
                "OpBal": ot4_op_data_count,
                "InQty": ot4_in_data_count,
                "OutQty": ot4_out_data_count,
                "ClBal": ot4_cl_bal,
            }
        )

        std2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std2_op_data_count = std2_op_in_data_count - std2_op_out_data_count

        std2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count
        data.append(
            {
                "SizeType": "20'STD",
                "OpBal": std2_op_data_count,
                "InQty": std2_in_data_count,
                "OutQty": std2_out_data_count,
                "ClBal": std2_cl_bal,
            }
        )

        std4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std4_op_data_count = std4_op_in_data_count - std4_op_out_data_count

        std4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="MSC",
            )
            .count()
        )
        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count
        data.append(
            {
                "SizeType": "40'STD",
                "OpBal": std4_op_data_count,
                "InQty": std4_in_data_count,
                "OutQty": std4_out_data_count,
                "ClBal": std4_cl_bal,
            }
        )

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ht2_op_data_count
            + ht4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
        )

        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ht2_in_data_count
            + ht4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
        )

        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ht2_out_data_count
            + ht4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
        )

        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ht2_cl_bal
            + ht4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
        )

        data.append(
            {
                "SizeType": "Total",
                "OpBal": op_bal_total,
                "InQty": in_qty_total,
                "OutQty": out_qty_total,
                "ClBal": cl_bal_total,
            }
        )

        SizeType = [each.get("SizeType") for each in data]
        OpBal = [each.get("OpBal") for each in data]
        InQty = [each.get("InQty") for each in data]
        OutQty = [each.get("OutQty") for each in data]
        ClBal = [each.get("ClBal") for each in data]

        df_data = [
            [SizeType[i], OpBal[i], InQty[i], OutQty[i], ClBal[i]]
            for i in range(len(SizeType))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def all_line_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        lolo_data = data_object.lolo.get_handling()
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["import_cargo"] = gate_in_data["cargo"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%b/%Y")
            data["mfg_date"] = manufacturing_date_str
        data["grade"] = gate_in_data["grade"]
        data["arrived_by"] = gate_in_data["arrived"]
        data["status"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%b %d %Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        data["gate_in_date"] = in_date_str
        data["gate_in_time"] = in_time_str
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_in_data["shipper"]
        data["vessel"] = gate_in_data["vessel_name"]
        data["voyage"] = gate_in_data["voyage_no"]
        data["place"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        if data_object.container.client.ref_code is None:
            ref_code = ""
        else:
            ref_code = data_object.container.client.ref_code
        data["opr"] = ref_code
        data["line"] = container_data["client"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def all_line_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = all_line_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        import_cargo = [each.get("import_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        grade = [each.get("grade") for each in data]
        arrived_by = [each.get("arrived_by") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        place = [each.get("place") for each in data]
        transporter = [each.get("transporter") for each in data]
        opr = [each.get("opr") for each in data]

        df_data = [
            [
                sl_no[i],
                vehicle_no[i],
                import_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                mfg_date[i],
                grade[i],
                arrived_by[i],
                status[i],
                remarks[i],
                gate_in_date[i],
                gate_in_time[i],
                line[i],
                customer[i],
                shipper[i],
                vessel[i],
                voyage[i],
                place[i],
                transporter[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]

        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 22)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 22)]]
        return df_data


def all_line_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        lolo_data = data_object.lolo.get_handling()
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%b %d %Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        data["gate_out_date"] = out_date_str
        data["gate_out_time"] = out_time_str
        data["line"] = container_data["client"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_out_data["shipper"]
        data["place"] = gate_out_data["destination"]
        data["vessel"] = gate_out_data["vessel_name"]
        data["voyage"] = gate_out_data["voyage_no"]
        data["transporter"] = gate_out_data["transporter_name"]
        data["vehicle_no"] = gate_out_data["vehicle_no"]
        data["export_cargo"] = gate_out_data["export_cargo"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["grade"] = gate_out_data["grade"]
        data["status"] = gate_out_data["condition"]
        data["remarks"] = gate_out_data["remarks"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["destination"] = gate_out_data["destination"]
        data["to_port_code"] = gate_out_data["to_port_code"]
        data["port_of_loading"] = gate_out_data["port_of_loading"]
        data["port_of_discharge"] = gate_out_data["port_of_discharge"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["seal_no"] = gate_out_data["seal_no"]
        if data_object.container.client.ref_code is None:
            ref_code = ""
        else:
            ref_code = data_object.container.client.ref_code
        data["opr"] = ref_code
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def all_line_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = all_line_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        export_cargo = [each.get("export_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        grade = [each.get("grade") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        port_of_loading = [each.get("port_of_loading") for each in data]
        port_of_discharge = [each.get("port_of_discharge") for each in data]
        destination = [each.get("destination") for each in data]
        opr = [each.get("opr") for each in data]
        to_port_code = [each.get("to_port_code") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_out_date[i],
                gate_out_time[i],
                line[i],
                customer[i],
                shipper[i],
                place[i],
                vessel[i],
                voyage[i],
                transporter[i],
                vehicle_no[i],
                export_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                grade[i],
                booking_no[i],
                seal_no[i],
                status[i],
                remarks[i],
                mfg_date[i],
                port_of_loading[i],
                port_of_discharge[i],
                destination[i],
                opr[i],
                to_port_code[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 28)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 28)]]
        return df_data


def all_line_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%b %d %Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str + " " + in_time_str
        data["gate_in_date"] = gate_in_date
        data["client"] = container_data["client"]
        data["container_no"] = container_data["container_no"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["age"] = stock_data["aging"]
        data["status"] = stock_data["status"]
        data["condition"] = gate_in_data["condition"]
        data["available_date"] = stock_data["available_date"]
        data["approval_date"] = stock_data["allotment_date"]
        data["booking_no"] = stock_data["booking_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def all_line_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = all_line_stock_row_data(each)
            each_data["sl_no"] = count

            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        client = [each.get("client") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("container_size") for each in data]
        container_type = [each.get("container_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        age = [each.get("age") for each in data]
        status = [each.get("status") for each in data]
        condition = [each.get("condition") for each in data]
        available_date = [each.get("available_date") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        booking_no = [each.get("booking_no") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_in_date[i],
                client[i],
                container_no[i],
                container_size[i],
                container_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                age[i],
                status[i],
                condition[i],
                available_date[i],
                approval_date[i],
                booking_no[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 15)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 15)]]
        return df_data


def all_line_stock_summary_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time
        data = []

        in_data = GateInHistory.objects.select_related(
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
        ).filter(container__location=location, container__site=site)

        out_data = GateOutHistory.objects.select_related(
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
        ).filter(container__location=location, container__site=site)

        in_data_20_size = in_data.filter(container__size__name="20")
        in_data_40_size = in_data.filter(container__size__name="40")
        out_data_20_size = out_data.filter(container__size__name="20")
        out_data_40_size = out_data.filter(container__size__name="40")

        # DV
        # 20
        # op
        dv2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="DV"
            ).count()
        )

        dv2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="DV",
            ).count()
        )
        dv2_op_data_count = dv2_op_in_data_count - dv2_op_out_data_count
        # cl
        dv2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'DV",
                "OpBal": dv2_op_data_count,
                "InQty": dv2_in_data_count,
                "OutQty": dv2_out_data_count,
                "ClBal": dv2_cl_bal,
            }
        )
        # 40
        # op
        dv4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="DV"
            ).count()
        )
        dv4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="DV",
            ).count()
        )
        dv4_op_data_count = dv4_op_in_data_count - dv4_op_out_data_count
        # cl
        dv4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'DV",
                "OpBal": dv4_op_data_count,
                "InQty": dv4_in_data_count,
                "OutQty": dv4_out_data_count,
                "ClBal": dv4_cl_bal,
            }
        )

        # FR
        # 20
        # op
        fr2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="FR"
            ).count()
        )

        fr2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="FR",
            ).count()
        )
        fr2_op_data_count = fr2_op_in_data_count - fr2_op_out_data_count
        # cl
        fr2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'FR",
                "OpBal": fr2_op_data_count,
                "InQty": fr2_in_data_count,
                "OutQty": fr2_out_data_count,
                "ClBal": fr2_cl_bal,
            }
        )
        # 40
        # op
        fr4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="FR"
            ).count()
        )
        fr4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="FR",
            ).count()
        )
        fr4_op_data_count = fr4_op_in_data_count - fr4_op_out_data_count
        # cl
        fr4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'FR",
                "OpBal": fr4_op_data_count,
                "InQty": fr4_in_data_count,
                "OutQty": fr4_out_data_count,
                "ClBal": fr4_cl_bal,
            }
        )

        # H/C
        # 20
        # op
        hc2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="H/C"
            ).count()
        )

        hc2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="H/C",
            ).count()
        )
        hc2_op_data_count = hc2_op_in_data_count - hc2_op_out_data_count
        # cl
        hc2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'H/C",
                "OpBal": hc2_op_data_count,
                "InQty": hc2_in_data_count,
                "OutQty": hc2_out_data_count,
                "ClBal": hc2_cl_bal,
            }
        )
        # 40
        # op
        hc4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="H/C"
            ).count()
        )
        hc4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="H/C",
            ).count()
        )
        hc4_op_data_count = hc4_op_in_data_count - hc4_op_out_data_count
        # cl
        hc4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'H/C",
                "OpBal": hc4_op_data_count,
                "InQty": hc4_in_data_count,
                "OutQty": hc4_out_data_count,
                "ClBal": hc4_cl_bal,
            }
        )

        # HT
        # 20
        # op
        ht2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="HT"
            ).count()
        )

        ht2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="HT",
            ).count()
        )
        ht2_op_data_count = ht2_op_in_data_count - ht2_op_out_data_count
        # cl
        ht2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht2_cl_bal = ht2_op_data_count + ht2_in_data_count - ht2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'HT",
                "OpBal": ht2_op_data_count,
                "InQty": ht2_in_data_count,
                "OutQty": ht2_out_data_count,
                "ClBal": ht2_cl_bal,
            }
        )
        # 40
        # op
        ht4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="HT"
            ).count()
        )
        ht4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="HT",
            ).count()
        )
        ht4_op_data_count = ht4_op_in_data_count - ht4_op_out_data_count
        # cl
        ht4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht4_cl_bal = ht4_op_data_count + ht4_in_data_count - ht4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'HT",
                "OpBal": ht4_op_data_count,
                "InQty": ht4_in_data_count,
                "OutQty": ht4_out_data_count,
                "ClBal": ht4_cl_bal,
            }
        )

        # O/T
        # 20
        # op
        ot2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="O/T"
            ).count()
        )

        ot2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="O/T",
            ).count()
        )
        ot2_op_data_count = ot2_op_in_data_count - ot2_op_out_data_count
        # cl
        ot2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'O/T",
                "OpBal": ot2_op_data_count,
                "InQty": ot2_in_data_count,
                "OutQty": ot2_out_data_count,
                "ClBal": ot2_cl_bal,
            }
        )
        # 40
        # op
        ot4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="O/T"
            ).count()
        )
        ot4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="O/T",
            ).count()
        )
        ot4_op_data_count = ot4_op_in_data_count - ot4_op_out_data_count
        # cl
        ot4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'O/T",
                "OpBal": ot4_op_data_count,
                "InQty": ot4_in_data_count,
                "OutQty": ot4_out_data_count,
                "ClBal": ot4_cl_bal,
            }
        )

        # STD
        # 20
        # op
        std2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="STD"
            ).count()
        )

        std2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="STD",
            ).count()
        )
        std2_op_data_count = std2_op_in_data_count - std2_op_out_data_count
        # cl
        std2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'STD",
                "OpBal": std2_op_data_count,
                "InQty": std2_in_data_count,
                "OutQty": std2_out_data_count,
                "ClBal": std2_cl_bal,
            }
        )
        # 40
        # op
        std4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="STD"
            ).count()
        )
        std4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="STD",
            ).count()
        )
        std4_op_data_count = std4_op_in_data_count - std4_op_out_data_count
        # cl
        std4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'STD",
                "OpBal": std4_op_data_count,
                "InQty": std4_in_data_count,
                "OutQty": std4_out_data_count,
                "ClBal": std4_cl_bal,
            }
        )

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ht2_op_data_count
            + ht4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
        )

        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ht2_in_data_count
            + ht4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
        )

        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ht2_out_data_count
            + ht4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
        )

        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ht2_cl_bal
            + ht4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
        )

        data.append(
            {
                "SizeType": "Total",
                "OpBal": op_bal_total,
                "InQty": in_qty_total,
                "OutQty": out_qty_total,
                "ClBal": cl_bal_total,
            }
        )

        SizeType = [each.get("SizeType") for each in data]
        OpBal = [each.get("OpBal") for each in data]
        InQty = [each.get("InQty") for each in data]
        OutQty = [each.get("OutQty") for each in data]
        ClBal = [each.get("ClBal") for each in data]

        df_data = [
            [SizeType[i], OpBal[i], InQty[i], OutQty[i], ClBal[i]]
            for i in range(len(SizeType))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def all_line_stock_summary_b_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:

        stock_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__location=location,
            container__site=site,
            container_status="IN",
        )
        stock_20_data = stock_data.filter(container__size__name="20")
        stock_40_data = stock_data.filter(container__size__name="40")

        dv_20_data = stock_20_data.filter(container__type__name="DV")
        dv_40_data = stock_40_data.filter(container__type__name="DV")
        dv_20_condition_ok_count = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_condition_ok_count = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_empty_allotment = int(dv_20_data.filter(status="Empty Alloted").count())
        dv_40_empty_allotment = int(dv_40_data.filter(status="Empty Alloted").count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_approved = int(dv_20_data.filter(status="Approved").count())
        dv_40_approved = int(dv_40_data.filter(status="Approved").count())
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_empty_allotment
            + dv_20_allotment
            + dv_20_estimate_pending
            + dv_20_approval_pending
            + dv_20_approved
            + dv_20_under_repairing
        )
        dv_20_tues = dv_20_total * 1
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_empty_allotment
            + dv_40_allotment
            + dv_40_estimate_pending
            + dv_40_approval_pending
            + dv_40_approved
            + dv_40_under_repairing
        )
        dv_40_tues = dv_40_total * 2
        dv_20_sale = 0
        dv_40_sale = 0
        dv_20_list = [
            dv_20_condition_ok_count,
            dv_20_empty_allotment,
            dv_20_allotment,
            dv_20_estimate_pending,
            dv_20_approval_pending,
            dv_20_approved,
            dv_20_under_repairing,
            dv_20_sale,
            dv_20_total,
            dv_20_tues,
        ]
        dv_40_list = [
            dv_40_condition_ok_count,
            dv_40_empty_allotment,
            dv_40_allotment,
            dv_40_estimate_pending,
            dv_40_approval_pending,
            dv_40_approved,
            dv_40_under_repairing,
            dv_20_sale,
            dv_40_total,
            dv_40_tues,
        ]

        std_20_data = stock_20_data.filter(container__type__name="STD")
        std_40_data = stock_40_data.filter(container__type__name="STD")
        std_20_condition_ok_count = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_condition_ok_count = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_empty_allotment = int(std_20_data.filter(status="Empty Alloted").count())
        std_40_empty_allotment = int(std_40_data.filter(status="Empty Alloted").count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_approved = int(std_20_data.filter(status="Approved").count())
        std_40_approved = int(std_40_data.filter(status="Approved").count())
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_empty_allotment
            + std_20_allotment
            + std_20_estimate_pending
            + std_20_approval_pending
            + std_20_approved
            + std_20_under_repairing
        )
        std_20_tues = std_20_total * 1
        std_40_total = (
            std_40_condition_ok_count
            + std_40_empty_allotment
            + std_40_allotment
            + std_40_estimate_pending
            + std_40_approval_pending
            + std_40_approved
            + std_40_under_repairing
        )
        std_40_tues = std_40_total * 2
        std_20_sale = 0
        std_40_sale = 0
        std_20_list = [
            std_20_condition_ok_count,
            std_20_empty_allotment,
            std_20_allotment,
            std_20_estimate_pending,
            std_20_approval_pending,
            std_20_approved,
            std_20_under_repairing,
            std_20_sale,
            std_20_total,
            std_20_tues,
        ]
        std_40_list = [
            std_40_condition_ok_count,
            std_40_empty_allotment,
            std_40_allotment,
            std_40_estimate_pending,
            std_40_approval_pending,
            std_40_approved,
            std_40_under_repairing,
            std_20_sale,
            std_40_total,
            std_40_tues,
        ]

        hc_20_data = stock_20_data.filter(container__type__name="H/C")
        hc_40_data = stock_40_data.filter(container__type__name="H/C")
        hc_20_condition_ok_count = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_condition_ok_count = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_empty_allotment = int(hc_20_data.filter(status="Empty Alloted").count())
        hc_40_empty_allotment = int(hc_40_data.filter(status="Empty Alloted").count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_approved = int(hc_20_data.filter(status="Approved").count())
        hc_40_approved = int(hc_40_data.filter(status="Approved").count())
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_empty_allotment
            + hc_20_allotment
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_approved
            + hc_20_under_repairing
        )
        hc_20_tues = hc_20_total * 1
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_empty_allotment
            + hc_40_allotment
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_approved
            + hc_40_under_repairing
        )
        hc_40_tues = hc_40_total * 2
        hc_20_sale = 0
        hc_40_sale = 0
        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_empty_allotment,
            hc_20_allotment,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_approved,
            hc_20_under_repairing,
            hc_20_sale,
            hc_20_total,
            hc_20_tues,
        ]
        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_empty_allotment,
            hc_40_allotment,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_approved,
            hc_40_under_repairing,
            hc_40_sale,
            hc_40_total,
            hc_40_tues,
        ]

        ot_20_data = stock_20_data.filter(container__type__name="O/T")
        ot_40_data = stock_40_data.filter(container__type__name="O/T")
        ot_20_condition_ok_count = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_condition_ok_count = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_empty_allotment = int(ot_20_data.filter(status="Empty Alloted").count())
        ot_40_empty_allotment = int(ot_40_data.filter(status="Empty Alloted").count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_approved = int(ot_20_data.filter(status="Approved").count())
        ot_40_approved = int(ot_40_data.filter(status="Approved").count())
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_empty_allotment
            + ot_20_allotment
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_approved
            + ot_20_under_repairing
        )
        ot_20_tues = ot_20_total * 1
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_empty_allotment
            + ot_40_allotment
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_approved
            + ot_40_under_repairing
        )
        ot_40_tues = ot_40_total * 2
        ot_20_sale = 0
        ot_40_sale = 0
        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_empty_allotment,
            ot_20_allotment,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_approved,
            ot_20_under_repairing,
            ot_20_sale,
            ot_20_total,
            ot_20_tues,
        ]
        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_empty_allotment,
            ot_40_allotment,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_approved,
            ot_40_under_repairing,
            ot_40_sale,
            ot_40_total,
            ot_40_tues,
        ]

        fr_20_data = stock_20_data.filter(container__type__name="FR")
        fr_40_data = stock_40_data.filter(container__type__name="FR")
        fr_20_condition_ok_count = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_condition_ok_count = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_empty_allotment = int(fr_20_data.filter(status="Empty Alloted").count())
        fr_40_empty_allotment = int(fr_40_data.filter(status="Empty Alloted").count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_approved = int(fr_20_data.filter(status="Approved").count())
        fr_40_approved = int(fr_40_data.filter(status="Approved").count())
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_empty_allotment
            + fr_20_allotment
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_approved
            + fr_20_under_repairing
        )
        fr_20_tues = fr_20_total * 1
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_empty_allotment
            + fr_40_allotment
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_approved
            + fr_40_under_repairing
        )
        fr_40_tues = fr_40_total * 2
        fr_20_sale = 0
        fr_40_sale = 0
        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_empty_allotment,
            fr_20_allotment,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_approved,
            fr_20_under_repairing,
            fr_20_sale,
            fr_20_total,
            fr_20_tues,
        ]
        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_empty_allotment,
            fr_40_allotment,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_approved,
            fr_40_under_repairing,
            fr_40_sale,
            fr_40_total,
            fr_40_tues,
        ]

        condition_ok_total = (
            dv_20_condition_ok_count
            + dv_40_condition_ok_count
            + std_20_condition_ok_count
            + std_40_condition_ok_count
            + hc_20_condition_ok_count
            + hc_40_condition_ok_count
            + ot_20_condition_ok_count
            + ot_40_condition_ok_count
            + fr_20_condition_ok_count
            + fr_40_condition_ok_count
        )

        empty_allotment_total = (
            dv_20_empty_allotment
            + dv_40_empty_allotment
            + std_20_empty_allotment
            + std_40_empty_allotment
            + hc_20_empty_allotment
            + hc_40_empty_allotment
            + ot_20_empty_allotment
            + ot_40_empty_allotment
            + fr_20_empty_allotment
            + fr_40_empty_allotment
        )

        allotment_total = (
            dv_20_allotment
            + dv_40_allotment
            + std_20_allotment
            + std_40_allotment
            + hc_20_allotment
            + hc_40_allotment
            + ot_20_allotment
            + ot_40_allotment
            + fr_20_allotment
            + fr_40_allotment
        )

        estimate_pending_total = (
            dv_20_estimate_pending
            + dv_40_estimate_pending
            + std_20_estimate_pending
            + std_40_estimate_pending
            + hc_20_estimate_pending
            + hc_40_estimate_pending
            + ot_20_estimate_pending
            + ot_40_estimate_pending
            + fr_20_estimate_pending
            + fr_40_estimate_pending
        )

        approval_pending_total = (
            dv_20_approval_pending
            + dv_40_approval_pending
            + std_20_approval_pending
            + std_40_approval_pending
            + hc_20_approval_pending
            + hc_40_approval_pending
            + ot_20_approval_pending
            + ot_40_approval_pending
            + fr_20_approval_pending
            + fr_40_approval_pending
        )

        approved_total = (
            dv_20_approved
            + dv_40_approved
            + std_20_approved
            + std_40_approved
            + hc_20_approved
            + hc_40_approved
            + ot_20_approved
            + ot_40_approved
            + fr_20_approved
            + fr_40_approved
        )

        under_repairing_total = (
            dv_20_under_repairing
            + dv_40_under_repairing
            + std_20_under_repairing
            + std_40_under_repairing
            + hc_20_under_repairing
            + hc_40_under_repairing
            + ot_20_under_repairing
            + ot_40_under_repairing
            + fr_20_under_repairing
            + fr_40_under_repairing
        )

        sale_total = (
            dv_20_sale
            + dv_40_sale
            + std_20_sale
            + std_40_sale
            + hc_20_sale
            + hc_40_sale
            + ot_20_sale
            + ot_40_sale
            + fr_20_sale
            + fr_40_sale
        )

        all_total = (
            dv_20_total
            + dv_40_total
            + std_20_total
            + std_40_total
            + hc_20_total
            + hc_40_total
            + ot_20_total
            + ot_40_total
            + fr_20_total
            + fr_40_total
        )

        tues_total = (
            dv_20_tues
            + dv_40_tues
            + std_20_tues
            + std_40_tues
            + hc_20_tues
            + hc_40_tues
            + ot_20_tues
            + ot_40_tues
            + fr_20_tues
            + fr_40_tues
        )

        total_list = [
            condition_ok_total,
            empty_allotment_total,
            allotment_total,
            estimate_pending_total,
            approval_pending_total,
            approved_total,
            under_repairing_total,
            sale_total,
            all_total,
            tues_total,
        ]

        import_total_list = [
            "Ok Containers",
            "Empty Alloted",
            "Alloted",
            "Awaiting Est",
            "Awaiting Authorisation",
            "Authorised",
            "Under Repair",
            "Sale",
            "TOTAL",
            "TUES",
        ]

        # remark_list = ["", "", "", "", "", "", "", "", "", ""]

        data = [
            [
                import_total_list[i],
                dv_20_list[i],
                dv_40_list[i],
                std_20_list[i],
                std_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
                total_list[i],
                # remark_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        data2 = all_line_stock_summary_data(
            from_date_str=from_date_str,
            from_time_str=from_time_str,
            to_date_str=to_date_str,
            to_time_str=to_time_str,
            location=location,
            site=site,
        )
        return [data, data2]
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        data2 = [[]]
        return [data, data2]


def all_line_stock_av_aa_ar_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["status"] = stock_data["status"]
        data["available_date"] = stock_data["available_date"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def all_line_stock_av_aa_ar_main_data(location, site):
    try:
        data = []
        stock_object_data = list(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            ).filter(
                container_status="IN",
                container__location=location,
                container__site=site,
                status__in=["Available", "Without_Repair_Available"],
            )
        )
        count = 0
        for each in stock_object_data:
            count += 1
            each_data = all_line_stock_av_aa_ar_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("container_size") for each in data]
        container_type = [each.get("container_type") for each in data]
        status = [each.get("status") for each in data]
        available_date = [each.get("available_date") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                container_size[i],
                container_type[i],
                status[i],
                available_date[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 6)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 6)]]
        return df_data


def all_line_movement_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)

        size1_in_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size1_in_tues = size1_in_total * 1

        size2_in_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size2_in_tues = size2_in_total * 2

        size1_out_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size1_out_tues = size1_out_total * 1

        size2_out_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size2_out_tues = size2_out_total * 2

        data = [
            {
                "Movement": "Total",
                "In-20'": size1_in_total,
                "In-40'": size2_in_total,
                "Out-20'": size1_out_total,
                "Out-40'": size2_out_total,
            },
            {
                "Movement": "Tues",
                "In-20'": size1_in_tues,
                "In-40'": size2_in_tues,
                "Out-20'": size1_out_tues,
                "Out-40'": size2_out_tues,
            },
        ]
        Movement = [each.get("Movement") for each in data]
        In1 = [each.get("In-20'") for each in data]
        In2 = [each.get("In-40'") for each in data]
        Out1 = [each.get("Out-20'") for each in data]
        Out2 = [each.get("Out-40'") for each in data]

        df_data = [
            [Movement[i], In1[i], In2[i], Out1[i], Out2[i]]
            for i in range(len(Movement))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def all_line_total_inward_data(to_date_str, location, site):
    try:
        to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        in_object_data = list(
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
            ).filter(
                gate_in__in_date__lte=to_date,
                container__status="IN",
                container__location=location,
                container__site=site,
            )
        )
        count = 0
        data = []
        for each in in_object_data:
            count += 1
            each_data = all_line_inward_row_data(each)
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
        mfg_date = [each.get("mfg_date") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        customer = [each.get("customer") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        import_cargo = [each.get("import_cargo") for each in data]
        transporter = [each.get("transporter") for each in data]

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
                mfg_date[i],
                vessel[i],
                voyage[i],
                customer[i],
                vehicle_no[i],
                import_cargo[i],
                transporter[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 15)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 15)]]
        return df_data


def all_line_stock_status_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time

        survey_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        survey_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        survey_pending_opb = survey_pending_in_opb - survey_pending_out_opb

        survey_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        survey_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        survey_pending_calb = (
            survey_pending_opb + survey_pending_in - survey_pending_out
        )

        estimate_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        estimate_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        estimate_pending_opb = estimate_pending_in_opb - estimate_pending_out_opb

        estimate_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        estimate_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        estimate_pending_calb = (
            estimate_pending_opb + estimate_pending_in - estimate_pending_out
        )

        approval_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approval_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approval_pending_opb = approval_pending_in_opb - approval_pending_out_opb

        approval_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approval_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approval_pending_calb = (
            approval_pending_opb + approval_pending_in - approval_pending_out
        )

        approved_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approved_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approved_opb = approved_in_opb - approved_out_opb

        approved_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approved_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approved_calb = approved_opb + approved_in - approved_out

        under_repair_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        under_repair_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        under_repair_opb = under_repair_in_opb - under_repair_out_opb

        under_repair_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        under_repair_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        under_repair_calb = under_repair_opb + under_repair_in - under_repair_out

        empty_allotment_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        empty_allotment_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        empty_allotment_opb = empty_allotment_in_opb - empty_allotment_out_opb

        empty_allotment_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        empty_allotment_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        empty_allotment_calb = (
            empty_allotment_opb + empty_allotment_in - empty_allotment_out
        )

        available_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        available_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        available_opb = available_in_opb - available_out_opb

        available_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        available_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        available_calb = available_opb + available_in - available_out

        allotment_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        allotment_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_out_date_time__lte=yesterday_for_from_date_time,
                container_status="OUT",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        allotment_opb = allotment_in_opb - allotment_out_opb
        if allotment_opb < 0:
            allotment_opb = 0

        allotment_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        allotment_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_out_date_time__range=(from_date_time, to_date_time),
                container_status="OUT",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        allotment_calb = allotment_opb + allotment_in - allotment_out
        if allotment_calb < 0:
            allotment_calb = 0

        status_list = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Approved",
            "Under Repairing",
            "Empty Allotment",
            "Available",
            "Allotment",
        ]

        op_bal_list = [
            survey_pending_opb,
            estimate_pending_opb,
            approval_pending_opb,
            approved_opb,
            under_repair_opb,
            empty_allotment_opb,
            available_opb,
            allotment_opb,
        ]

        in_bal_list = [
            survey_pending_in,
            estimate_pending_in,
            approval_pending_in,
            approved_in,
            under_repair_in,
            empty_allotment_in,
            available_in,
            allotment_in,
        ]

        out_bal_list = [
            survey_pending_out,
            estimate_pending_out,
            approval_pending_out,
            approved_out,
            under_repair_out,
            empty_allotment_out,
            available_out,
            allotment_out,
        ]

        cal_bal_list = [
            survey_pending_calb,
            estimate_pending_calb,
            approval_pending_calb,
            approved_calb,
            under_repair_calb,
            empty_allotment_calb,
            available_calb,
            allotment_calb,
        ]

        data = [
            [
                status_list[i],
                op_bal_list[i],
                in_bal_list[i],
                out_bal_list[i],
                cal_bal_list[i],
            ]
            for i in range(len(status_list))
        ]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        return data


def sarjak_tuticorin_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        client_data = data_object.container.client.get_client()
        lolo_data = data_object.lolo.get_handling()
        data["gate_pass_no"] = gate_in_data["gate_pass_no"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%H:%M")
        data["in_date_time"] = in_date_str + " " + in_time_str
        data["in_date"] = in_date_str
        data["in_time"] = in_time_str
        data["line"] = client_data["ref_code"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_in_data["shipper"]
        data["movement"] = lolo_data["apply_charges"]
        data["place"] = gate_in_data["source"]
        data["vessel"] = gate_in_data["vessel_name"]
        data["voyage"] = gate_in_data["voyage_no"]
        data["vessel_voyage"] = (
            gate_in_data["vessel_name"] + ", " + gate_in_data["voyage_no"]
        )
        data["transporter"] = gate_in_data["transporter_name"]
        data["truck_no"] = gate_in_data["vehicle_no"]
        data["import_cgo"] = gate_in_data["cargo"]
        data["bl_no"] = gate_in_data["bl_no"]
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["size"] = container_data["size"]
        data["type"] = container_data["type"]
        data["mty_ldn"] = ""
        data["gr_weight"] = container_data["gross_wt"]
        data["tr_weight"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["cbm"] = ""

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["grade"] = gate_in_data["grade"]
        data["status"] = ""
        data["action"] = ""
        data["remarks"] = gate_in_data["remarks"]
        if data_object.container.in_do_not_lift_queue is True:
            data["dont_lift"] = "Yes"
        else:
            data["dont_lift"] = "No"
        data["prefix"] = container_data["container_no"][:4]
        data["suffix"] = container_data["container_no"][4:11]
        data["yard_id"] = ""
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def sarjak_tuticorin_inward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = sarjak_tuticorin_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_pass_no = [each.get("gate_pass_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        movement = [each.get("movement") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        vessel_voyage = [each.get("vessel_voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        import_cgo = [each.get("import_cgo") for each in data]
        bl_no = [each.get("bl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        size = [each.get("size") for each in data]
        type = [each.get("type") for each in data]
        mty_ldn = [each.get("mty_ldn") for each in data]
        gr_weight = [each.get("gr_weight") for each in data]
        tr_weight = [each.get("tr_weight") for each in data]
        payload = [each.get("payload") for each in data]
        cbm = [each.get("cbm") for each in data]
        mfg_dt = [each.get("mfg_date") for each in data]
        grade = [each.get("grade") for each in data]
        status = [each.get("status") for each in data]
        action = [each.get("action") for each in data]
        remarks = [each.get("remarks") for each in data]
        dont_lift = [each.get("dont_lift") for each in data]
        prefix = [each.get("prefix") for each in data]
        suffix = [each.get("suffix") for each in data]
        yard_id = [each.get("yard_id") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_pass_no[i],
                in_date_time[i],
                in_date[i],
                in_time[i],
                line[i],
                customer[i],
                shipper[i],
                movement[i],
                place[i],
                vessel[i],
                voyage[i],
                vessel_voyage[i],
                transporter[i],
                truck_no[i],
                import_cgo[i],
                bl_no[i],
                container_no[i],
                size_type[i],
                size[i],
                type[i],
                mty_ldn[i],
                gr_weight[i],
                tr_weight[i],
                payload[i],
                cbm[i],
                mfg_dt[i],
                grade[i],
                status[i],
                action[i],
                remarks[i],
                dont_lift[i],
                prefix[i],
                suffix[i],
                yard_id[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 35)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 35)]]
        return df_data


def sarjak_tuticorin_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        client_data = data_object.container.client.get_client()
        lolo_data = data_object.lolo.get_handling()
        data["gate_pass_no"] = gate_out_data["gate_pass_no"]
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d/%b/%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%H:%M")
        data["out_date_time"] = out_date_str + " " + out_time_str
        data["out_date"] = out_date_str
        data["out_time"] = out_time_str
        data["line"] = client_data["ref_code"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_out_data["shipper"]
        data["movement"] = lolo_data["apply_charges"]
        data["place"] = gate_out_data["destination"]
        data["vessel"] = gate_out_data["vessel_name"]
        data["voyage"] = gate_out_data["voyage_no"]
        data["vessel_voyage"] = (
            gate_out_data["vessel_name"] + ", " + gate_out_data["voyage_no"]
        )
        data["transporter"] = gate_out_data["transporter_name"]
        data["truck_no"] = gate_out_data["vehicle_no"]
        data["export_cargo"] = gate_out_data["export_cargo"]
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["size"] = container_data["size"]
        data["type"] = container_data["type"]
        data["mty_ldn"] = ""
        data["prefix"] = container_data["container_no"][:4]
        data["suffix"] = container_data["container_no"][4:11]
        data["payload"] = container_data["payload"]
        data["cbm"] = ""
        data["grade"] = gate_out_data["grade"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["seal_no"] = gate_out_data["seal_no"]
        data["status"] = ""
        data["remarks"] = gate_out_data["remarks"]
        data["truck_in"] = ""
        data["arrived_on"] = ""

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        return data
    except Exception as e:
        return None


def sarjak_tuticorin_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = sarjak_tuticorin_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_pass_no = [each.get("gate_pass_no") for each in data]
        out_date_time = [each.get("out_date_time") for each in data]
        out_date = [each.get("out_date") for each in data]
        out_time = [each.get("out_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        movement = [each.get("movement") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        vessel_voyage = [each.get("vessel_voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        export_cargo = [each.get("export_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        size = [each.get("size") for each in data]
        type = [each.get("type") for each in data]
        mty_ldn = [each.get("mty_ldn") for each in data]
        prefix = [each.get("prefix") for each in data]
        suffix = [each.get("suffix") for each in data]
        payload = [each.get("payload") for each in data]
        cbm = [each.get("cbm") for each in data]
        grade = [each.get("grade") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        truck_in = [each.get("truck_in") for each in data]
        arrived_on = [each.get("arrived_on") for each in data]
        mfg_dt = [each.get("mfg_date") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_pass_no[i],
                out_date_time[i],
                out_date[i],
                out_time[i],
                line[i],
                customer[i],
                shipper[i],
                movement[i],
                place[i],
                vessel[i],
                voyage[i],
                vessel_voyage[i],
                transporter[i],
                truck_no[i],
                export_cargo[i],
                container_no[i],
                size_type[i],
                size[i],
                type[i],
                mty_ldn[i],
                prefix[i],
                suffix[i],
                payload[i],
                cbm[i],
                grade[i],
                booking_no[i],
                seal_no[i],
                status[i],
                remarks[i],
                truck_in[i],
                arrived_on[i],
                mfg_dt[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 33)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 33)]]
        return df_data


def sarjak_tuticorin_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        client_data = data_object.container.client.get_client()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        gih_object = GateInHistory.objects.select_related(
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
        ).get(container=data_object.container, gate_in=data_object.gate_in)
        lolo_data = gih_object.lolo.get_handling()

        data["gate_pass_no"] = gate_in_data["gate_pass_no"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%H:%M")
        data["in_date_time"] = in_date_str + " " + in_time_str
        data["in_date"] = in_date_str
        data["in_time"] = in_time_str
        data["line"] = client_data["ref_code"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_in_data["shipper"]
        data["movement"] = lolo_data["apply_charges"]
        data["place"] = gate_in_data["source"]
        data["vessel"] = gate_in_data["vessel_name"]
        data["voyage"] = gate_in_data["voyage_no"]
        data["vessel_voyage"] = (
            gate_in_data["vessel_name"] + ", " + gate_in_data["voyage_no"]
        )
        data["transporter"] = gate_in_data["transporter_name"]
        data["truck_no"] = gate_in_data["vehicle_no"]
        data["import_cgo"] = gate_in_data["cargo"]
        data["bl_no"] = gate_in_data["bl_no"]
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["size"] = container_data["size"]
        data["type"] = container_data["type"]
        data["mty_ldn"] = ""
        data["gr_weight"] = container_data["gross_wt"]
        data["tr_weight"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["cbm"] = ""

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["grade"] = gate_in_data["grade"]
        data["status"] = stock_data["status"]
        data["action"] = ""
        data["remarks"] = gate_in_data["remarks"]
        data["age"] = stock_data["aging"]
        data["av_date"] = stock_data["available_date"]
        if data_object.container.in_do_not_lift_queue is True:
            data["dont_lift"] = "Yes"
        else:
            data["dont_lift"] = "No"
        data["prefix"] = container_data["container_no"][:4]
        data["suffix"] = container_data["container_no"][4:11]
        data["instruction"] = ""
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def sarjak_tuticorin_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = sarjak_tuticorin_stock_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_pass_no = [each.get("gate_pass_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        movement = [each.get("movement") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        vessel_voyage = [each.get("vessel_voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        import_cgo = [each.get("import_cgo") for each in data]
        bl_no = [each.get("bl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        size = [each.get("size") for each in data]
        type = [each.get("type") for each in data]
        mty_ldn = [each.get("mty_ldn") for each in data]
        gr_weight = [each.get("gr_weight") for each in data]
        tr_weight = [each.get("tr_weight") for each in data]
        payload = [each.get("payload") for each in data]
        cbm = [each.get("cbm") for each in data]
        mfg_dt = [each.get("mfg_date") for each in data]
        grade = [each.get("grade") for each in data]
        status = [each.get("status") for each in data]
        action = [each.get("action") for each in data]
        remarks = [each.get("remarks") for each in data]
        age = [each.get("age") for each in data]
        av_date = [each.get("av_date") for each in data]
        dont_lift = [each.get("dont_lift") for each in data]
        prefix = [each.get("prefix") for each in data]
        suffix = [each.get("suffix") for each in data]
        instruction = [each.get("instruction") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_pass_no[i],
                in_date_time[i],
                in_date[i],
                in_time[i],
                line[i],
                customer[i],
                shipper[i],
                movement[i],
                place[i],
                vessel[i],
                voyage[i],
                vessel_voyage[i],
                transporter[i],
                truck_no[i],
                import_cgo[i],
                bl_no[i],
                container_no[i],
                size_type[i],
                size[i],
                mty_ldn[i],
                gr_weight[i],
                tr_weight[i],
                payload[i],
                cbm[i],
                mfg_dt[i],
                grade[i],
                status[i],
                action[i],
                remarks[i],
                type[i],
                age[i],
                av_date[i],
                dont_lift[i],
                prefix[i],
                suffix[i],
                instruction[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 37)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 37)]]
        return df_data


def sarjak_tuticorin_stock_av_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        client_data = data_object.container.client.get_client()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        gih_object = GateInHistory.objects.select_related(
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
        ).get(container=data_object.container, gate_in=data_object.gate_in)
        lolo_data = gih_object.lolo.get_handling()

        data["gate_pass_no"] = gate_in_data["gate_pass_no"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%H:%M")
        data["in_date_time"] = in_date_str + " " + in_time_str
        data["in_date"] = in_date_str
        data["in_time"] = in_time_str
        data["line"] = client_data["ref_code"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_in_data["shipper"]
        data["movement"] = lolo_data["apply_charges"]
        data["place"] = gate_in_data["source"]
        data["vessel"] = gate_in_data["vessel_name"]
        data["voyage"] = gate_in_data["voyage_no"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["truck_no"] = gate_in_data["vehicle_no"]
        data["import_cgo"] = gate_in_data["cargo"]
        data["container_no"] = container_data["container_no"]
        data["size_type"] = container_data["size"] + container_data["type"]
        data["size"] = container_data["size"]
        data["type"] = container_data["type"]
        data["mty_ldn"] = ""
        data["gr_weight"] = container_data["gross_wt"]
        data["tr_weight"] = container_data["tare_wt"]
        data["cbm"] = ""

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["grade"] = gate_in_data["grade"]
        data["status"] = stock_data["status"]
        data["action"] = ""
        data["remarks"] = gate_in_data["remarks"]
        data["av_date"] = stock_data["available_date"]
        data["prefix"] = container_data["container_no"][:4]
        data["suffix"] = container_data["container_no"][4:11]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def sarjak_tuticorin_stock_av_main_data(location, site):
    try:
        count = 0
        data = []
        stock_object_data = list(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            ).filter(
                container__client__ref_code="SARJAK",
                container_status="IN",
                container__location=location,
                container__site=site,
                status__in=["Available", "Without_Repair_Available"],
            )
        )
        for each in stock_object_data:
            count += 1
            each_data = sarjak_tuticorin_stock_av_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_pass_no = [each.get("gate_pass_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        movement = [each.get("movement") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        import_cgo = [each.get("import_cgo") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        size = [each.get("size") for each in data]
        type = [each.get("type") for each in data]
        mty_ldn = [each.get("mty_ldn") for each in data]
        gr_weight = [each.get("gr_weight") for each in data]
        tr_weight = [each.get("tr_weight") for each in data]
        cbm = [each.get("cbm") for each in data]
        mfg_dt = [each.get("mfg_date") for each in data]
        grade = [each.get("grade") for each in data]
        status = [each.get("status") for each in data]
        action = [each.get("action") for each in data]
        remarks = [each.get("remarks") for each in data]
        av_date = [each.get("av_date") for each in data]
        prefix = [each.get("prefix") for each in data]
        suffix = [each.get("suffix") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_pass_no[i],
                in_date_time[i],
                in_date[i],
                in_time[i],
                line[i],
                customer[i],
                shipper[i],
                movement[i],
                place[i],
                vessel[i],
                voyage[i],
                transporter[i],
                truck_no[i],
                import_cgo[i],
                container_no[i],
                size_type[i],
                size[i],
                type[i],
                mty_ldn[i],
                gr_weight[i],
                tr_weight[i],
                cbm[i],
                mfg_dt[i],
                grade[i],
                status[i],
                action[i],
                remarks[i],
                av_date[i],
                prefix[i],
                suffix[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 31)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 31)]]
        return df_data


def sarjak_tuticorin_summary_main_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time
        data = []

        dv2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv2_op_data_count = dv2_op_in_data_count - dv2_op_out_data_count

        dv2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count
        data.append(
            {
                "SizeType": "20'DV",
                "OpBal": dv2_op_data_count,
                "InQty": dv2_in_data_count,
                "OutQty": dv2_out_data_count,
                "ClBal": dv2_cl_bal,
            }
        )
        dv4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv4_op_data_count = dv4_op_in_data_count - dv4_op_out_data_count

        dv4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count
        data.append(
            {
                "SizeType": "40'DV",
                "OpBal": dv4_op_data_count,
                "InQty": dv4_in_data_count,
                "OutQty": dv4_out_data_count,
                "ClBal": dv4_cl_bal,
            }
        )

        fr2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr2_op_data_count = fr2_op_in_data_count - fr2_op_out_data_count

        fr2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count
        data.append(
            {
                "SizeType": "20'FR",
                "OpBal": fr2_op_data_count,
                "InQty": fr2_in_data_count,
                "OutQty": fr2_out_data_count,
                "ClBal": fr2_cl_bal,
            }
        )
        fr4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr4_op_data_count = fr4_op_in_data_count - fr4_op_out_data_count

        fr4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count
        data.append(
            {
                "SizeType": "40'FR",
                "OpBal": fr4_op_data_count,
                "InQty": fr4_in_data_count,
                "OutQty": fr4_out_data_count,
                "ClBal": fr4_cl_bal,
            }
        )

        hc2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc2_op_data_count = hc2_op_in_data_count - hc2_op_out_data_count

        hc2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count
        data.append(
            {
                "SizeType": "20'H/C",
                "OpBal": hc2_op_data_count,
                "InQty": hc2_in_data_count,
                "OutQty": hc2_out_data_count,
                "ClBal": hc2_cl_bal,
            }
        )

        hc4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc4_op_data_count = hc4_op_in_data_count - hc4_op_out_data_count

        hc4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count
        data.append(
            {
                "SizeType": "40'H/C",
                "OpBal": hc4_op_data_count,
                "InQty": hc4_in_data_count,
                "OutQty": hc4_out_data_count,
                "ClBal": hc4_cl_bal,
            }
        )

        ht2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht2_op_data_count = ht2_op_in_data_count - ht2_op_out_data_count

        ht2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht2_cl_bal = ht2_op_data_count + ht2_in_data_count - ht2_out_data_count
        data.append(
            {
                "SizeType": "20'HT",
                "OpBal": ht2_op_data_count,
                "InQty": ht2_in_data_count,
                "OutQty": ht2_out_data_count,
                "ClBal": ht2_cl_bal,
            }
        )

        ht4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht4_op_data_count = ht4_op_in_data_count - ht4_op_out_data_count

        ht4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="HT",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ht4_cl_bal = ht4_op_data_count + ht4_in_data_count - ht4_out_data_count
        data.append(
            {
                "SizeType": "40'HT",
                "OpBal": ht4_op_data_count,
                "InQty": ht4_in_data_count,
                "OutQty": ht4_out_data_count,
                "ClBal": ht4_cl_bal,
            }
        )

        ot2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot2_op_data_count = ot2_op_in_data_count - ot2_op_out_data_count

        ot2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count
        data.append(
            {
                "SizeType": "20'OT",
                "OpBal": ot2_op_data_count,
                "InQty": ot2_in_data_count,
                "OutQty": ot2_out_data_count,
                "ClBal": ot2_cl_bal,
            }
        )

        ot4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot4_op_data_count = ot4_op_in_data_count - ot4_op_out_data_count

        ot4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count
        data.append(
            {
                "SizeType": "40'OT",
                "OpBal": ot4_op_data_count,
                "InQty": ot4_in_data_count,
                "OutQty": ot4_out_data_count,
                "ClBal": ot4_cl_bal,
            }
        )

        std2_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std2_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std2_op_data_count = std2_op_in_data_count - std2_op_out_data_count

        std2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count
        data.append(
            {
                "SizeType": "20'STD",
                "OpBal": std2_op_data_count,
                "InQty": std2_in_data_count,
                "OutQty": std2_out_data_count,
                "ClBal": std2_cl_bal,
            }
        )

        std4_op_in_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std4_op_out_data_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std4_op_data_count = std4_op_in_data_count - std4_op_out_data_count

        std4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code="SARJAK",
            )
            .count()
        )
        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count
        data.append(
            {
                "SizeType": "40'STD",
                "OpBal": std4_op_data_count,
                "InQty": std4_in_data_count,
                "OutQty": std4_out_data_count,
                "ClBal": std4_cl_bal,
            }
        )

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ht2_op_data_count
            + ht4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
        )

        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ht2_in_data_count
            + ht4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
        )

        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ht2_out_data_count
            + ht4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
        )

        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ht2_cl_bal
            + ht4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
        )

        data.append(
            {
                "SizeType": "Total",
                "OpBal": op_bal_total,
                "InQty": in_qty_total,
                "OutQty": out_qty_total,
                "ClBal": cl_bal_total,
            }
        )

        SizeType = [each.get("SizeType") for each in data]
        OpBal = [each.get("OpBal") for each in data]
        InQty = [each.get("InQty") for each in data]
        OutQty = [each.get("OutQty") for each in data]
        ClBal = [each.get("ClBal") for each in data]

        df_data = [
            [SizeType[i], OpBal[i], InQty[i], OutQty[i], ClBal[i]]
            for i in range(len(SizeType))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def generic_inghk_inghc_summary_main_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        dv_20_condition_ok_count = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_condition_ok_count = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_empty_allotment = int(dv_20_data.filter(status="Empty Alloted").count())
        dv_40_empty_allotment = int(dv_40_data.filter(status="Empty Alloted").count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_approved = int(dv_20_data.filter(status="Approved").count())
        dv_40_approved = int(dv_40_data.filter(status="Approved").count())
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_empty_allotment
            + dv_20_allotment
            + dv_20_estimate_pending
            + dv_20_approval_pending
            + dv_20_approved
            + dv_20_under_repairing
        )
        dv_20_tues = dv_20_total * 1
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_empty_allotment
            + dv_40_allotment
            + dv_40_estimate_pending
            + dv_40_approval_pending
            + dv_40_approved
            + dv_40_under_repairing
        )
        dv_40_tues = dv_40_total * 2
        dv_20_sale = 0
        dv_40_sale = 0
        dv_20_list = [
            dv_20_condition_ok_count,
            dv_20_empty_allotment,
            dv_20_allotment,
            dv_20_estimate_pending,
            dv_20_approval_pending,
            dv_20_approved,
            dv_20_under_repairing,
            dv_20_sale,
            dv_20_total,
            dv_20_tues,
        ]
        dv_40_list = [
            dv_40_condition_ok_count,
            dv_40_empty_allotment,
            dv_40_allotment,
            dv_40_estimate_pending,
            dv_40_approval_pending,
            dv_40_approved,
            dv_40_under_repairing,
            dv_20_sale,
            dv_40_total,
            dv_40_tues,
        ]

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        std_20_condition_ok_count = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_condition_ok_count = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_empty_allotment = int(std_20_data.filter(status="Empty Alloted").count())
        std_40_empty_allotment = int(std_40_data.filter(status="Empty Alloted").count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_approved = int(std_20_data.filter(status="Approved").count())
        std_40_approved = int(std_40_data.filter(status="Approved").count())
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_empty_allotment
            + std_20_allotment
            + std_20_estimate_pending
            + std_20_approval_pending
            + std_20_approved
            + std_20_under_repairing
        )
        std_20_tues = std_20_total * 1
        std_40_total = (
            std_40_condition_ok_count
            + std_40_empty_allotment
            + std_40_allotment
            + std_40_estimate_pending
            + std_40_approval_pending
            + std_40_approved
            + std_40_under_repairing
        )
        std_40_tues = std_40_total * 2
        std_20_sale = 0
        std_40_sale = 0
        std_20_list = [
            std_20_condition_ok_count,
            std_20_empty_allotment,
            std_20_allotment,
            std_20_estimate_pending,
            std_20_approval_pending,
            std_20_approved,
            std_20_under_repairing,
            std_20_sale,
            std_20_total,
            std_20_tues,
        ]
        std_40_list = [
            std_40_condition_ok_count,
            std_40_empty_allotment,
            std_40_allotment,
            std_40_estimate_pending,
            std_40_approval_pending,
            std_40_approved,
            std_40_under_repairing,
            std_20_sale,
            std_40_total,
            std_40_tues,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        hc_20_condition_ok_count = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_condition_ok_count = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_empty_allotment = int(hc_20_data.filter(status="Empty Alloted").count())
        hc_40_empty_allotment = int(hc_40_data.filter(status="Empty Alloted").count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_approved = int(hc_20_data.filter(status="Approved").count())
        hc_40_approved = int(hc_40_data.filter(status="Approved").count())
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_empty_allotment
            + hc_20_allotment
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_approved
            + hc_20_under_repairing
        )
        hc_20_tues = hc_20_total * 1
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_empty_allotment
            + hc_40_allotment
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_approved
            + hc_40_under_repairing
        )
        hc_40_tues = hc_40_total * 2
        hc_20_sale = 0
        hc_40_sale = 0
        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_empty_allotment,
            hc_20_allotment,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_approved,
            hc_20_under_repairing,
            hc_20_sale,
            hc_20_total,
            hc_20_tues,
        ]
        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_empty_allotment,
            hc_40_allotment,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_approved,
            hc_40_under_repairing,
            hc_40_sale,
            hc_40_total,
            hc_40_tues,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        ot_20_condition_ok_count = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_condition_ok_count = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_empty_allotment = int(ot_20_data.filter(status="Empty Alloted").count())
        ot_40_empty_allotment = int(ot_40_data.filter(status="Empty Alloted").count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_approved = int(ot_20_data.filter(status="Approved").count())
        ot_40_approved = int(ot_40_data.filter(status="Approved").count())
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_empty_allotment
            + ot_20_allotment
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_approved
            + ot_20_under_repairing
        )
        ot_20_tues = ot_20_total * 1
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_empty_allotment
            + ot_40_allotment
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_approved
            + ot_40_under_repairing
        )
        ot_40_tues = ot_40_total * 2
        ot_20_sale = 0
        ot_40_sale = 0
        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_empty_allotment,
            ot_20_allotment,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_approved,
            ot_20_under_repairing,
            ot_20_sale,
            ot_20_total,
            ot_20_tues,
        ]
        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_empty_allotment,
            ot_40_allotment,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_approved,
            ot_40_under_repairing,
            ot_40_sale,
            ot_40_total,
            ot_40_tues,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        fr_20_condition_ok_count = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_condition_ok_count = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_empty_allotment = int(fr_20_data.filter(status="Empty Alloted").count())
        fr_40_empty_allotment = int(fr_40_data.filter(status="Empty Alloted").count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_approved = int(fr_20_data.filter(status="Approved").count())
        fr_40_approved = int(fr_40_data.filter(status="Approved").count())
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_empty_allotment
            + fr_20_allotment
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_approved
            + fr_20_under_repairing
        )
        fr_20_tues = fr_20_total * 1
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_empty_allotment
            + fr_40_allotment
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_approved
            + fr_40_under_repairing
        )
        fr_40_tues = fr_40_total * 2
        fr_20_sale = 0
        fr_40_sale = 0
        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_empty_allotment,
            fr_20_allotment,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_approved,
            fr_20_under_repairing,
            fr_20_sale,
            fr_20_total,
            fr_20_tues,
        ]
        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_empty_allotment,
            fr_40_allotment,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_approved,
            fr_40_under_repairing,
            fr_40_sale,
            fr_40_total,
            fr_40_tues,
        ]

        condition_ok_total = (
            dv_20_condition_ok_count
            + dv_40_condition_ok_count
            + std_20_condition_ok_count
            + std_40_condition_ok_count
            + hc_20_condition_ok_count
            + hc_40_condition_ok_count
            + ot_20_condition_ok_count
            + ot_40_condition_ok_count
            + fr_20_condition_ok_count
            + fr_40_condition_ok_count
        )

        empty_allotment_total = (
            dv_20_empty_allotment
            + dv_40_empty_allotment
            + std_20_empty_allotment
            + std_40_empty_allotment
            + hc_20_empty_allotment
            + hc_40_empty_allotment
            + ot_20_empty_allotment
            + ot_40_empty_allotment
            + fr_20_empty_allotment
            + fr_40_empty_allotment
        )

        allotment_total = (
            dv_20_allotment
            + dv_40_allotment
            + std_20_allotment
            + std_40_allotment
            + hc_20_allotment
            + hc_40_allotment
            + ot_20_allotment
            + ot_40_allotment
            + fr_20_allotment
            + fr_40_allotment
        )

        estimate_pending_total = (
            dv_20_estimate_pending
            + dv_40_estimate_pending
            + std_20_estimate_pending
            + std_40_estimate_pending
            + hc_20_estimate_pending
            + hc_40_estimate_pending
            + ot_20_estimate_pending
            + ot_40_estimate_pending
            + fr_20_estimate_pending
            + fr_40_estimate_pending
        )

        approval_pending_total = (
            dv_20_approval_pending
            + dv_40_approval_pending
            + std_20_approval_pending
            + std_40_approval_pending
            + hc_20_approval_pending
            + hc_40_approval_pending
            + ot_20_approval_pending
            + ot_40_approval_pending
            + fr_20_approval_pending
            + fr_40_approval_pending
        )

        approved_total = (
            dv_20_approved
            + dv_40_approved
            + std_20_approved
            + std_40_approved
            + hc_20_approved
            + hc_40_approved
            + ot_20_approved
            + ot_40_approved
            + fr_20_approved
            + fr_40_approved
        )

        under_repairing_total = (
            dv_20_under_repairing
            + dv_40_under_repairing
            + std_20_under_repairing
            + std_40_under_repairing
            + hc_20_under_repairing
            + hc_40_under_repairing
            + ot_20_under_repairing
            + ot_40_under_repairing
            + fr_20_under_repairing
            + fr_40_under_repairing
        )

        sale_total = (
            dv_20_sale
            + dv_40_sale
            + std_20_sale
            + std_40_sale
            + hc_20_sale
            + hc_40_sale
            + ot_20_sale
            + ot_40_sale
            + fr_20_sale
            + fr_40_sale
        )

        all_total = (
            dv_20_total
            + dv_40_total
            + std_20_total
            + std_40_total
            + hc_20_total
            + hc_40_total
            + ot_20_total
            + ot_40_total
            + fr_20_total
            + fr_40_total
        )

        tues_total = (
            dv_20_tues
            + dv_40_tues
            + std_20_tues
            + std_40_tues
            + hc_20_tues
            + hc_40_tues
            + ot_20_tues
            + ot_40_tues
            + fr_20_tues
            + fr_40_tues
        )

        total_list = [
            condition_ok_total,
            empty_allotment_total,
            allotment_total,
            estimate_pending_total,
            approval_pending_total,
            approved_total,
            under_repairing_total,
            sale_total,
            all_total,
            tues_total,
        ]

        import_total_list = [
            "Ok Containers",
            "Empty Alloted",
            "Alloted",
            "Awaiting Est",
            "Awaiting Authorisation",
            "Authorised",
            "Under Repair",
            "Sale",
            "TOTAL",
            "TUES",
        ]

        remark_list = ["", "", "", "", "", "", "", "", "", ""]

        df_data1 = [
            [
                import_total_list[i],
                dv_20_list[i],
                dv_40_list[i],
                std_20_list[i],
                std_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
                total_list[i],
                remark_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        dv2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_op_data_count = dv2_in_data_op_count - dv2_out_data_op_count

        dv2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count

        dv2_tues = dv2_cl_bal * 1

        dv2_list = [
            dv2_op_data_count,
            dv2_in_data_count,
            dv2_out_data_count,
            dv2_cl_bal,
            dv2_tues,
        ]

        dv4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_op_data_count = dv4_in_data_op_count - dv4_out_data_op_count

        dv4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count

        dv4_tues = dv4_cl_bal * 2

        dv4_list = [
            dv4_op_data_count,
            dv4_in_data_count,
            dv4_out_data_count,
            dv4_cl_bal,
            dv4_tues,
        ]

        std2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_op_data_count = std2_in_data_op_count - std2_out_data_op_count

        std2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count

        std2_tues = std2_cl_bal * 1

        std2_list = [
            std2_op_data_count,
            std2_in_data_count,
            std2_out_data_count,
            std2_cl_bal,
            std2_tues,
        ]

        std4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_op_data_count = std4_in_data_op_count - std4_out_data_op_count

        std4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count

        std4_tues = std4_cl_bal * 2

        std4_list = [
            std4_op_data_count,
            std4_in_data_count,
            std4_out_data_count,
            std4_cl_bal,
            std4_tues,
        ]

        fr2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_op_data_count = fr2_in_data_op_count - fr2_out_data_op_count

        fr2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count

        fr2_tues = fr2_cl_bal * 1

        fr2_list = [
            fr2_op_data_count,
            fr2_in_data_count,
            fr2_out_data_count,
            fr2_cl_bal,
            fr2_tues,
        ]

        fr4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_op_data_count = fr4_in_data_op_count - fr4_out_data_op_count

        fr4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count

        fr4_tues = fr4_cl_bal * 2

        fr4_list = [
            fr4_op_data_count,
            fr4_in_data_count,
            fr4_out_data_count,
            fr4_cl_bal,
            fr4_tues,
        ]

        hc2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_op_data_count = hc2_in_data_op_count - hc2_out_data_op_count

        hc2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count

        hc2_tues = hc2_cl_bal * 1

        hc2_list = [
            hc2_op_data_count,
            hc2_in_data_count,
            hc2_out_data_count,
            hc2_cl_bal,
            hc2_tues,
        ]

        hc4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_op_data_count = hc4_in_data_op_count - hc4_out_data_op_count

        hc4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count

        hc4_tues = hc4_cl_bal * 2

        hc4_list = [
            hc4_op_data_count,
            hc4_in_data_count,
            hc4_out_data_count,
            hc4_cl_bal,
            hc4_tues,
        ]

        ot2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_op_data_count = ot2_in_data_op_count - ot2_out_data_op_count

        ot2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count

        ot2_tues = ot2_cl_bal * 1

        ot2_list = [
            ot2_op_data_count,
            ot2_in_data_count,
            ot2_out_data_count,
            ot2_cl_bal,
            ot2_tues,
        ]

        ot4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_op_data_count = ot4_in_data_op_count - ot4_out_data_op_count

        ot4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count

        ot4_tues = ot4_cl_bal * 2

        ot4_list = [
            ot4_op_data_count,
            ot4_in_data_count,
            ot4_out_data_count,
            ot4_cl_bal,
            ot4_tues,
        ]

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
        )
        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
        )
        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
        )
        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
        )

        tues_total = (
            dv2_tues
            + dv4_tues
            + std2_tues
            + std4_tues
            + fr2_tues
            + fr4_tues
            + hc2_tues
            + hc4_tues
            + ot2_tues
            + ot4_tues
        )

        total_list = [
            op_bal_total,
            in_qty_total,
            out_qty_total,
            cl_bal_total,
            tues_total,
        ]

        stat_list = ["PRV. BAL.", "IN", "OUT", "ON DATE POSITION", "TUES"]

        df_data2 = [
            [
                stat_list[i],
                dv2_list[i],
                dv4_list[i],
                std2_list[i],
                std4_list[i],
                hc2_list[i],
                hc4_list[i],
                ot2_list[i],
                ot4_list[i],
                fr2_list[i],
                fr4_list[i],
                total_list[i],
            ]
            for i in range(len(stat_list))
        ]

        condition_ok_20_total = (
            dv_20_condition_ok_count
            + std_20_condition_ok_count
            + hc_20_condition_ok_count
            + ot_20_condition_ok_count
            + fr_20_condition_ok_count
        )
        condition_ok_20_tues = condition_ok_20_total * 1

        condition_ok_40_total = (
            dv_40_condition_ok_count
            + std_40_condition_ok_count
            + hc_40_condition_ok_count
            + ot_40_condition_ok_count
            + fr_40_condition_ok_count
        )
        condition_ok_40_tues = condition_ok_40_total * 2

        condition_ok_total = condition_ok_20_total + condition_ok_40_total
        condition_ok_total_tues = condition_ok_20_tues + condition_ok_40_tues

        stat = ["TOTAL", "TUES"]
        ready_condition_20 = [condition_ok_20_total, condition_ok_20_tues]
        ready_condition_40 = [condition_ok_40_total, condition_ok_40_tues]
        ready_condition_total = [condition_ok_total, condition_ok_total_tues]

        df_data3 = [
            [
                stat[i],
                ready_condition_20[i],
                ready_condition_40[i],
                ready_condition_total[i],
            ]
            for i in range(len(stat))
        ]

        size = ["HEAVY DUTY", "NORMAL"]
        dv_20 = [0, 0]
        dv_40 = [0, 0]
        std_20 = [0, 0]
        std_40 = [0, 0]
        hc_20 = [0, 0]
        hc_40 = [0, 0]
        ot_20 = [0, 0]
        ot_40 = [0, 0]
        fr_20 = [0, 0]
        fr_40 = [0, 0]
        total = [0, 0]

        df_data4 = [
            [
                size[i],
                dv_20[i],
                dv_40[i],
                std_20[i],
                std_40[i],
                hc_20[i],
                hc_40[i],
                ot_20[i],
                ot_40[i],
                fr_20[i],
                fr_40[i],
                total[i],
            ]
            for i in range(len(size))
        ]

        return [df_data1, df_data2, df_data3, df_data4]

    except Exception as e:
        return [[[]], [[]], [[]], [[]]]


def generic_inghk_inghc_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = "MSC"
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["in_date"] = gate_in_date
        data["in_time"] = gate_in_time
        data["account"] = container_data["client"]
        data["bl_no"] = gate_in_data["bl_no"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%b/%Y")
            data["mfg_date"] = manufacturing_date_str
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["cargo"] = gate_in_data["export_cargo_type"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_inghk_inghc_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = generic_inghk_inghc_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        account = [each.get("account") for each in data]
        bl_no = [each.get("bl_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        cargo = [each.get("cargo") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                in_date[i],
                in_time[i],
                account[i],
                bl_no[i],
                transporter[i],
                vehicle_no[i],
                mfg_date[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                cargo[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 15)])
        return main_data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 15)]]
        return main_data


def generic_inghk_inghc_outward_row_data(data_object):
    try:
        data = {}
        container_record = ContainerInOutRecord.objects.get(
            container=data_object.container, out_data=data_object
        )
        in_data_object = container_record.in_data
        gate_in_data = in_data_object.gate_in.get_gate_in()
        stock_data_object = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).get(
            container=data_object.container,
            gate_in=in_data_object.gate_in,
            container_status="OUT",
        )
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = "MSC"
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d-%b-%Y")
        data["in_date"] = in_date_str
        if stock_data_object.approved_in_date_time is None:
            data["approval_date"] = ""
        else:
            approved_date_str = stock_data_object.approved_in_date_time.date().strftime(
                "%d-%b-%Y"
            )
            data["approval_date"] = approved_date_str
        if stock_data_object.available_date is None:
            data["available_date"] = ""
        else:
            available_date_str = stock_data_object.available_date.strftime("%d-%b-%Y")
            data["available_date"] = available_date_str
        if stock_data_object.empty_allotment_date is None:
            data["empty_allotment_date"] = ""
        else:
            empty_allotment_date_str = stock_data_object.empty_allotment_date.strftime(
                "%d-%b-%Y"
            )
            data["empty_allotment_date"] = empty_allotment_date_str
        if stock_data_object.allotment_date is None:
            data["allotment_date"] = ""
        else:
            allotment_date_str = stock_data_object.allotment_date.strftime("%d-%b-%Y")
            data["allotment_date"] = allotment_date_str
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d-%b-%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str
        gate_out_time = out_time_str
        data["out_date"] = gate_out_date
        data["out_time"] = gate_out_time
        data["transporter"] = gate_out_data["transporter_name"]
        data["shipper"] = gate_out_data["shipper"]
        data["do_no"] = gate_out_data["booking_no"]
        data["vehicle_no"] = gate_out_data["vehicle_no"]
        data["status"] = "OUT"
        data["otl"] = gate_out_data["seal_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_inghk_inghc_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = generic_inghk_inghc_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        in_date = [each.get("in_date") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        available_date = [each.get("available_date") for each in data]
        empty_allotment_date = [each.get("empty_allotment_date") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        out_date = [each.get("out_date") for each in data]
        out_time = [each.get("out_time") for each in data]
        transporter = [each.get("transporter") for each in data]
        shipper = [each.get("shipper") for each in data]
        do_no = [each.get("do_no") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        status = [each.get("status") for each in data]
        otl = [each.get("otl") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                in_date[i],
                approval_date[i],
                available_date[i],
                empty_allotment_date[i],
                allotment_date[i],
                out_date[i],
                out_time[i],
                transporter[i],
                shipper[i],
                do_no[i],
                vehicle_no[i],
                status[i],
                otl[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 15)])
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 15)]]
        return main_data


def generic_inghk_inghc_inventory_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = "MSC"
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["in_date"] = gate_in_date
        data["in_time"] = gate_in_time
        data["account"] = container_data["client"]
        data["bl_no"] = gate_in_data["bl_no"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%b/%Y")
            data["mfg_date"] = manufacturing_date_str
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["hd_nr"] = ""
        data["cargo"] = gate_in_data["export_cargo_type"]
        if data_object.survey_pending_in_date_time is None:
            data["survey_pending_date"] = ""
        else:
            survey_pending_date_str = (
                data_object.survey_pending_in_date_time.date().strftime("%d-%b-%Y")
            )
            data["survey_pending_date"] = survey_pending_date_str
        if data_object.estimate_pending_in_date_time is None:
            data["estimate_pending_date"] = ""
        else:
            estimate_pending_date_str = (
                data_object.estimate_pending_in_date_time.date().strftime("%d-%b-%Y")
            )
            data["estimate_pending_date"] = estimate_pending_date_str
        data["estimate_no"] = ""
        data["damage_grade"] = gate_in_data["condition"]
        data["man_hrs"] = ""
        data["lbr_cost"] = ""
        data["mtrl_cost"] = ""
        data["wash_amount"] = ""
        data["total_cost"] = ""

        if data_object.approval_pending_in_date_time is None:
            data["approval_pending_date"] = ""
        else:
            approval_pending_date_str = (
                data_object.approval_pending_in_date_time.date().strftime("%d-%b-%Y")
            )
            data["approval_pending_date"] = approval_pending_date_str

        if stock_data["available_date"] == "":
            data["available_date"] = stock_data["available_date"]
        else:
            available_date = datetime.datetime.strptime(
                stock_data["available_date"], "%d/%m/%Y"
            ).date()
            available_date_str = available_date.strftime("%d-%b-%Y")
            data["available_date"] = available_date_str

        if stock_data["empty_allotment_date"] == "":
            data["empty_allotment_date"] = stock_data["empty_allotment_date"]
        else:
            empty_allotment_date = datetime.datetime.strptime(
                stock_data["empty_allotment_date"], "%d/%m/%Y"
            ).date()
            empty_allotment_date_str = empty_allotment_date.strftime("%d-%b-%Y")
            data["empty_allotment_date"] = empty_allotment_date_str

        if stock_data["allotment_date"] == "":
            data["allotment_date"] = stock_data["allotment_date"]
        else:
            allotment_date = datetime.datetime.strptime(
                stock_data["allotment_date"], "%d/%m/%Y"
            ).date()
            allotment_date_str = allotment_date.strftime("%d-%b-%Y")
            data["allotment_date"] = allotment_date_str
        data["out_date"] = ""
        data["out_time"] = ""
        data["shipper"] = gate_in_data["shipper"]
        data["do_no"] = ""
        data["status"] = stock_data["status"]
        data["otl"] = ""
        data["no_of_days"] = stock_data["aging"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def generic_inghk_inghc_inventory_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = generic_inghk_inghc_inventory_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        account = [each.get("account") for each in data]
        bl_no = [each.get("bl_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        hd_nr = [each.get("hd_nr") for each in data]
        cargo = [each.get("cargo") for each in data]
        survey_pending_date = [each.get("survey_pending_date") for each in data]
        estimate_pending_date = [each.get("estimate_pending_date") for each in data]
        estimate_no = [each.get("estimate_no") for each in data]
        damage_grade = [each.get("damage_grade") for each in data]
        man_hrs = [each.get("man_hrs") for each in data]
        lbr_cost = [each.get("lbr_cost") for each in data]
        mtrl_cost = [each.get("mtrl_cost") for each in data]
        wash_amount = [each.get("wash_amount") for each in data]
        total_cost = [each.get("total_cost") for each in data]
        approval_pending_date = [each.get("approval_pending_date") for each in data]
        available_date = [each.get("available_date") for each in data]
        empty_allotment_date = [each.get("empty_allotment_date") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        out_date = [each.get("out_date") for each in data]
        out_time = [each.get("out_time") for each in data]
        shipper = [each.get("shipper") for each in data]
        do_no = [each.get("do_no") for each in data]
        status = [each.get("status") for each in data]
        otl = [each.get("otl") for each in data]
        no_of_days = [each.get("no_of_days") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                in_date[i],
                in_time[i],
                account[i],
                bl_no[i],
                transporter[i],
                mfg_date[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                hd_nr[i],
                cargo[i],
                survey_pending_date[i],
                estimate_pending_date[i],
                estimate_no[i],
                damage_grade[i],
                man_hrs[i],
                lbr_cost[i],
                mtrl_cost[i],
                wash_amount[i],
                total_cost[i],
                approval_pending_date[i],
                available_date[i],
                empty_allotment_date[i],
                allotment_date[i],
                out_date[i],
                out_time[i],
                shipper[i],
                do_no[i],
                vehicle_no[i],
                status[i],
                otl[i],
                no_of_days[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 35)])
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 35)]]
        return main_data


def handling_revenue_row_data(data_object, object_type):
    try:
        data = {}
        container = None
        in_data = None
        out_data = None
        gate_in_data = None
        in_lolo_data = None
        gate_out_data = None
        out_lolo_data = None
        in_lolo_payment_data = None
        out_lolo_payment_data = None

        if object_type == "IN":
            container = data_object.container
            in_data = data_object
            gate_in_data = in_data.gate_in.get_gate_in()
            in_lolo_data = in_data.lolo.get_handling()
            if not in_data.lolo_payment is None:
                in_lolo_payment_data = in_data.lolo_payment.get_payment_details()
            data["container_no"] = container.container_no
            data["size_type"] = f"{container.size.name} / {container.type.name}"
            in_date = datetime.datetime.strptime(
                gate_in_data["in_date"], "%Y-%m-%d"
            ).date()
            in_date_str = in_date.strftime("%d/%b/%Y")
            in_time = datetime.datetime.strptime(
                gate_in_data["in_time"], "%H:%M"
            ).time()
            in_time_str = in_time.strftime("%I:%M %p")
            gate_in_date = in_date_str
            gate_in_time = in_time_str
            data["in_date_time"] = gate_in_date + " " + gate_in_time
            data["out_date_time"] = ""
            data["receipt_no"] = in_lolo_data["receipt_no"]
            data["invoice_no"] = in_lolo_data["invoice_no"]
            data["amount"] = in_lolo_data["gross_amount"]
            data["line"] = container.client.ref_code
            if in_lolo_data["apply_charges"] == "Line":
                data["apply_charges_to"] = container.client.name
            else:
                data["apply_charges_to"] = in_lolo_data["customer_name"]
            data["transporter_name"] = gate_in_data["transporter_name"]
            data["receipt_amount"] = in_lolo_data["gross_amount"]
            if not in_lolo_data["receipt_date"] == "":
                receipt_date = datetime.datetime.strptime(
                    in_lolo_data["receipt_date"], "%Y-%m-%d"
                ).date()
                data["receipt_date"] = receipt_date.strftime("%d/%b/%Y")
            else:
                data["receipt_date"] = ""
            data["payment_mode"] = in_lolo_data["apply_charges"]
            data["payment_type"] = in_lolo_data["payment_type"]
            if in_lolo_payment_data is None:
                data["cheque_neft_no"] = ""
            else:
                if not in_lolo_payment_data["cheque_no"] == "":
                    data["cheque_neft_no"] = in_lolo_payment_data["cheque_no"]
                else:
                    data["cheque_neft_no"] = in_lolo_payment_data["utr_no"]
            data["remarks"] = gate_in_data["remarks"]
            data["pd_balance"] = ""
            return data
        else:
            container = data_object.container
            out_data = data_object
            gate_out_data = out_data.gate_out.get_gate_out()
            out_lolo_data = out_data.lolo.get_handling()
            if not out_data.lolo_payment is None:
                out_lolo_payment_data = out_data.lolo_payment.get_payment_details()
            data["container_no"] = container.container_no
            data["size_type"] = f"{container.size.name} / {container.type.name}"
            out_date = datetime.datetime.strptime(
                gate_out_data["out_date"], "%Y-%m-%d"
            ).date()
            out_date_str = out_date.strftime("%d/%b/%Y")
            out_time = datetime.datetime.strptime(
                gate_out_data["out_time"], "%H:%M"
            ).time()
            out_time_str = out_time.strftime("%I:%M %p")
            gate_out_date = out_date_str
            gate_out_time = out_time_str
            data["out_date_time"] = gate_out_date + " " + gate_out_time
            data["in_date_time"] = ""
            data["receipt_no"] = out_lolo_data["receipt_no"]
            data["invoice_no"] = out_lolo_data["invoice_no"]
            data["amount"] = out_lolo_data["gross_amount"]
            data["line"] = container.client.ref_code
            if out_lolo_data["apply_charges"] == "Line":
                data["apply_charges_to"] = container.client.name
            else:
                data["apply_charges_to"] = out_lolo_data["customer_name"]
            data["transporter_name"] = gate_out_data["transporter_name"]
            data["receipt_amount"] = out_lolo_data["gross_amount"]
            if not out_lolo_data["receipt_date"] == "":
                receipt_date = datetime.datetime.strptime(
                    out_lolo_data["receipt_date"], "%Y-%m-%d"
                ).date()
                data["receipt_date"] = receipt_date.strftime("%d/%b/%Y")
            else:
                data["receipt_date"] = ""
            data["payment_mode"] = out_lolo_data["apply_charges"]
            data["payment_type"] = out_lolo_data["payment_type"]
            if out_lolo_payment_data is None:
                data["cheque_neft_no"] = ""
            else:
                if not out_lolo_payment_data["cheque_no"] == "":
                    data["cheque_neft_no"] = out_lolo_payment_data["cheque_no"]
                else:
                    data["cheque_neft_no"] = out_lolo_payment_data["utr_no"]
            data["remarks"] = gate_out_data["remarks"]
            data["pd_balance"] = ""
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def handling_revenue_main_data(in_data_object_list, out_data_object_list):
    try:
        in_data_list = []
        out_data_list = []
        if not len(in_data_object_list) == 0:
            in_data_list = [
                handling_revenue_row_data(data_object=each, object_type="IN")
                for each in in_data_object_list
            ]
        if not len(out_data_object_list) == 0:
            out_data_list = [
                handling_revenue_row_data(data_object=each, object_type="OUT")
                for each in out_data_object_list
            ]

        data = in_data_list + out_data_list

        if len(data) == 0:
            df_data.append(["" for i in range(0, 17)])

        count = 0
        for each in data:
            count += 1
            each["sl_no"] = count

        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        out_date_time = [each.get("out_date_time") for each in data]
        receipt_no = [each.get("receipt_no") for each in data]
        invoice_no = [each.get("invoice_no") for each in data]
        line = [each.get("line") for each in data]
        apply_charges_to = [each.get("apply_charges_to") for each in data]
        transporter_name = [each.get("transporter_name") for each in data]
        receipt_amount = [each.get("receipt_amount") for each in data]
        receipt_date = [each.get("receipt_date") for each in data]
        payment_mode = [each.get("payment_mode") for each in data]
        payment_type = [each.get("payment_type") for each in data]
        cheque_neft_no = [each.get("cheque_neft_no") for each in data]
        remarks = [each.get("remarks") for each in data]
        pd_balance = [each.get("pd_balance") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size_type[i],
                in_date_time[i],
                out_date_time[i],
                receipt_no[i],
                invoice_no[i],
                line[i],
                apply_charges_to[i],
                transporter_name[i],
                receipt_amount[i],
                receipt_date[i],
                payment_mode[i],
                payment_type[i],
                cheque_neft_no[i],
                remarks[i],
                pd_balance[i],
            ]
            for i in range(len(sl_no))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 17)]]
        return df_data


def self_transportation_revenue_row_data(data_object, object_type):
    try:
        data = {}
        container = None
        in_data = None
        out_data = None
        gate_in_data = None
        in_st_data = None
        gate_out_data = None
        out_st_data = None
        in_st_payment_data = None
        out_st_payment_data = None

        if object_type == "IN":
            container = data_object.container
            in_data = data_object
            gate_in_data = in_data.gate_in.get_gate_in()
            in_st_data = in_data.st.get_self_transportation()
            if not in_data.st_payment is None:
                in_st_payment_data = in_data.st_payment.get_payment_details()
            data["container_no"] = container.container_no
            data["size_type"] = f"{container.size.name} / {container.type.name}"
            in_date = datetime.datetime.strptime(
                gate_in_data["in_date"], "%Y-%m-%d"
            ).date()
            in_date_str = in_date.strftime("%d/%b/%Y")
            in_time = datetime.datetime.strptime(
                gate_in_data["in_time"], "%H:%M"
            ).time()
            in_time_str = in_time.strftime("%I:%M %p")
            gate_in_date = in_date_str
            gate_in_time = in_time_str
            data["in_date_time"] = gate_in_date + " " + gate_in_time
            data["out_date_time"] = ""
            data["receipt_no"] = in_st_data["receipt_no"]
            data["invoice_no"] = in_st_data["invoice_no"]
            data["amount"] = in_st_data["gross_amount"]
            data["line"] = container.client.ref_code
            if in_st_data["apply_charges"] == "Line":
                data["apply_charges_to"] = container.client.name
            else:
                data["apply_charges_to"] = in_st_data["customer_name"]
            data["transporter_name"] = gate_in_data["transporter_name"]
            data["receipt_amount"] = in_st_data["gross_amount"]
            if not in_st_data["receipt_date"] == "":
                receipt_date = datetime.datetime.strptime(
                    in_st_data["receipt_date"], "%Y-%m-%d"
                ).date()
                data["receipt_date"] = receipt_date.strftime("%d/%b/%Y")
            else:
                data["receipt_date"] = ""
            data["payment_mode"] = in_st_data["apply_charges"]
            data["payment_type"] = in_st_data["payment_type"]
            if in_st_payment_data is None:
                data["cheque_neft_no"] = ""
            else:
                if not in_st_payment_data["cheque_no"] == "":
                    data["cheque_neft_no"] = in_st_payment_data["cheque_no"]
                else:
                    data["cheque_neft_no"] = in_st_payment_data["utr_no"]
            data["remarks"] = gate_in_data["remarks"]
            data["pd_balance"] = ""
            return data
        else:
            container = data_object.container
            out_data = data_object
            gate_out_data = out_data.gate_out.get_gate_out()
            out_st_data = out_data.st.get_self_transportation()
            if not out_data.st_payment is None:
                out_st_payment_data = out_data.st_payment.get_payment_details()
            data["container_no"] = container.container_no
            data["size_type"] = f"{container.size.name} / {container.type.name}"
            out_date = datetime.datetime.strptime(
                gate_out_data["out_date"], "%Y-%m-%d"
            ).date()
            out_date_str = out_date.strftime("%d/%b/%Y")
            out_time = datetime.datetime.strptime(
                gate_out_data["out_time"], "%H:%M"
            ).time()
            out_time_str = out_time.strftime("%I:%M %p")
            gate_out_date = out_date_str
            gate_out_time = out_time_str
            data["out_date_time"] = gate_out_date + " " + gate_out_time
            data["in_date_time"] = ""
            data["receipt_no"] = out_st_data["receipt_no"]
            data["invoice_no"] = out_st_data["invoice_no"]
            data["amount"] = out_st_data["gross_amount"]
            data["line"] = container.client.ref_code
            if out_st_data["apply_charges"] == "Line":
                data["apply_charges_to"] = container.client.name
            else:
                data["apply_charges_to"] = out_st_data["customer_name"]
            data["transporter_name"] = gate_out_data["transporter_name"]
            data["receipt_amount"] = out_st_data["gross_amount"]
            if not out_st_data["receipt_date"] == "":
                receipt_date = datetime.datetime.strptime(
                    out_st_data["receipt_date"], "%Y-%m-%d"
                ).date()
                data["receipt_date"] = receipt_date.strftime("%d/%b/%Y")
            else:
                data["receipt_date"] = ""
            data["payment_mode"] = out_st_data["apply_charges"]
            data["payment_type"] = out_st_data["payment_type"]
            if out_st_payment_data is None:
                data["cheque_neft_no"] = ""
            else:
                if not out_st_payment_data["cheque_no"] == "":
                    data["cheque_neft_no"] = out_st_payment_data["cheque_no"]
                else:
                    data["cheque_neft_no"] = out_st_payment_data["utr_no"]
            data["remarks"] = gate_out_data["remarks"]
            data["pd_balance"] = ""
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def self_transportation_revenue_main_data(in_data_object_list, out_data_object_list):
    try:
        in_data_list = []
        out_data_list = []
        if not len(in_data_object_list) == 0:
            in_data_list_raw = [
                self_transportation_revenue_row_data(data_object=each, object_type="IN")
                for each in in_data_object_list
            ]
            in_data_list = [each for each in in_data_list_raw if each is not None]
        if not len(out_data_object_list) == 0:
            out_data_list_raw = [
                self_transportation_revenue_row_data(
                    data_object=each, object_type="OUT"
                )
                for each in out_data_object_list
            ]
            out_data_list = [each for each in out_data_list_raw if each is not None]

        data = in_data_list + out_data_list

        if len(data) == 0:
            df_data.append(["" for i in range(0, 17)])

        count = 0
        for each in data:
            count += 1
            each["sl_no"] = count

        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size_type = [each.get("size_type") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        out_date_time = [each.get("out_date_time") for each in data]
        receipt_no = [each.get("receipt_no") for each in data]
        invoice_no = [each.get("invoice_no") for each in data]
        line = [each.get("line") for each in data]
        apply_charges_to = [each.get("apply_charges_to") for each in data]
        transporter_name = [each.get("transporter_name") for each in data]
        receipt_amount = [each.get("receipt_amount") for each in data]
        receipt_date = [each.get("receipt_date") for each in data]
        payment_mode = [each.get("payment_mode") for each in data]
        payment_type = [each.get("payment_type") for each in data]
        cheque_neft_no = [each.get("cheque_neft_no") for each in data]
        remarks = [each.get("remarks") for each in data]
        pd_balance = [each.get("pd_balance") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size_type[i],
                in_date_time[i],
                out_date_time[i],
                receipt_no[i],
                invoice_no[i],
                line[i],
                apply_charges_to[i],
                transporter_name[i],
                receipt_amount[i],
                receipt_date[i],
                payment_mode[i],
                payment_type[i],
                cheque_neft_no[i],
                remarks[i],
                pd_balance[i],
            ]
            for i in range(len(sl_no))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 17)]]
        return df_data


def msc_sanand_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["gate_in_date"] = gate_in_date
        data["gate_in_time"] = gate_in_time

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["gross_wt"] = container_data["gross_wt"]
        data["payload"] = container_data["payload"]
        data["location"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["status"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        data["opr"] = "MSC"
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_sanand_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = msc_sanand_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        payload = [each.get("payload") for each in data]
        location = [each.get("location") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        opr = [each.get("opr") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                gate_in_date[i],
                gate_in_time[i],
                mfg_date[i],
                gross_wt[i],
                payload[i],
                location[i],
                transporter[i],
                vehicle_no[i],
                status[i],
                remarks[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 14)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 14)]]
        return df_data


def msc_sanand_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d/%b/%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str
        gate_out_time = out_time_str
        data["gate_out_date"] = gate_out_date
        data["gate_out_time"] = gate_out_time
        data["booking_no"] = gate_out_data["booking_no"]
        data["booking_party"] = gate_out_data["booking_party"]
        data["shipper"] = gate_out_data["shipper"]
        data["port_of_loading"] = gate_out_data["port_of_loading"]
        data["port_of_discharge"] = gate_out_data["port_of_discharge"]
        data["place"] = gate_out_data["destination"]
        data["destination"] = gate_out_data["destination"]
        data["seal_no"] = gate_out_data["seal_no"]
        data["trailor_no"] = gate_out_data["vehicle_no"]
        data["transporter"] = gate_out_data["transporter_name"]
        data["status"] = gate_out_data["condition"]
        data["remarks"] = gate_out_data["remarks"]
        data["opr"] = "MSC"
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_sanand_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_sanand_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        booking_party = [each.get("booking_party") for each in data]
        shipper = [each.get("shipper") for each in data]
        port_of_loading = [each.get("port_of_loading") for each in data]
        port_of_discharge = [each.get("port_of_discharge") for each in data]
        place = [each.get("place") for each in data]
        destination = [each.get("destination") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        trailor_no = [each.get("trailor_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        opr = [each.get("opr") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                gate_out_date[i],
                gate_out_time[i],
                booking_no[i],
                booking_party[i],
                shipper[i],
                port_of_loading[i],
                port_of_discharge[i],
                place[i],
                destination[i],
                seal_no[i],
                trailor_no[i],
                transporter[i],
                status[i],
                remarks[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 18)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 18)]]
        return df_data


def msc_sanand_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        gate_in_date = in_date_str
        data["gate_in_date"] = gate_in_date
        data["opr"] = "MSC"
        data["location"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["payload"] = container_data["payload"]
        data["gross_wt"] = container_data["gross_wt"]
        data["condition"] = gate_in_data["condition"]
        data["status"] = stock_data["status"]
        data["available_date"] = stock_data["available_date"]
        data["age"] = stock_data["aging"]
        data["allotment_date"] = stock_data["allotment_date"]
        data["remarks"] = gate_in_data["remarks"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_sanand_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msc_sanand_stock_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        opr = [each.get("opr") for each in data]
        location = [each.get("location") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        payload = [each.get("payload") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        condition = [each.get("condition") for each in data]
        status = [each.get("status") for each in data]
        available_date = [each.get("available_date") for each in data]
        age = [each.get("age") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                mfg_date[i],
                gate_in_date[i],
                opr[i],
                location[i],
                transporter[i],
                vehicle_no[i],
                payload[i],
                gross_wt[i],
                condition[i],
                status[i],
                available_date[i],
                age[i],
                allotment_date[i],
                remarks[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 17)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 17)]]
        return df_data


def msc_sanand_summary_main_data(location, site):
    try:

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        std_20_condition_ok_count = int(
            std_20_data.filter(gate_in__condition="OK").count()
        )
        std_40_condition_ok_count = int(
            std_40_data.filter(gate_in__condition="OK").count()
        )
        std_20_survey_pending = int(std_20_data.filter(status="Survey Pending").count())
        std_40_survey_pending = int(std_40_data.filter(status="Survey Pending").count())
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_available = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_available = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        dv_20_condition_ok_count = int(
            dv_20_data.filter(gate_in__condition="OK").count()
        )
        dv_40_condition_ok_count = int(
            dv_40_data.filter(gate_in__condition="OK").count()
        )
        dv_20_survey_pending = int(dv_20_data.filter(status="Survey Pending").count())
        dv_40_survey_pending = int(dv_40_data.filter(status="Survey Pending").count())
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_available = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_available = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )

        dry_20_condition_ok_count = std_20_condition_ok_count + dv_20_condition_ok_count
        dry_40_condition_ok_count = std_40_condition_ok_count + dv_40_condition_ok_count
        dry_20_survey_pending = std_20_survey_pending + dv_20_survey_pending
        dry_40_survey_pending = std_40_survey_pending + dv_40_survey_pending
        dry_20_estimate_pending = std_20_estimate_pending + dv_20_estimate_pending
        dry_40_estimate_pending = std_40_estimate_pending + dv_40_estimate_pending
        dry_20_approval_pending = std_20_approval_pending + dv_20_approval_pending
        dry_40_approval_pending = std_40_approval_pending + dv_40_approval_pending
        dry_20_under_repairing = std_20_under_repairing + dv_20_under_repairing
        dry_40_under_repairing = std_40_under_repairing + dv_40_under_repairing
        dry_20_available = std_20_available + dv_20_available
        dry_40_available = std_40_available + dv_40_available
        dry_20_allotment = std_20_allotment + dv_20_allotment
        dry_40_allotment = std_40_allotment + dv_40_allotment

        dry_20_total = (
            dry_20_condition_ok_count
            + dry_20_survey_pending
            + dry_20_estimate_pending
            + dry_20_approval_pending
            + dry_20_under_repairing
            + dry_20_available
            + dry_20_allotment
        )

        dry_40_total = (
            dry_40_condition_ok_count
            + dry_40_survey_pending
            + dry_40_estimate_pending
            + dry_40_approval_pending
            + dry_40_under_repairing
            + dry_40_available
            + dry_40_allotment
        )

        dry_20_list = [
            dry_20_condition_ok_count,
            dry_20_survey_pending,
            dry_20_estimate_pending,
            dry_20_approval_pending,
            dry_20_under_repairing,
            dry_20_available,
            dry_20_allotment,
            dry_20_total,
        ]

        dry_40_list = [
            dry_40_condition_ok_count,
            dry_40_survey_pending,
            dry_40_estimate_pending,
            dry_40_approval_pending,
            dry_40_under_repairing,
            dry_40_available,
            dry_40_allotment,
            dry_40_total,
        ]

        ht_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ht_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="HT",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ht_20_condition_ok_count = int(
            ht_20_data.filter(gate_in__condition="OK").count()
        )
        ht_40_condition_ok_count = int(
            ht_40_data.filter(gate_in__condition="OK").count()
        )
        ht_20_survey_pending = int(ht_20_data.filter(status="Survey Pending").count())
        ht_40_survey_pending = int(ht_40_data.filter(status="Survey Pending").count())
        ht_20_estimate_pending = int(
            ht_20_data.filter(status="Estimate Pending").count()
        )
        ht_40_estimate_pending = int(
            ht_40_data.filter(status="Estimate Pending").count()
        )
        ht_20_approval_pending = int(
            ht_20_data.filter(status="Approval Pending").count()
        )
        ht_40_approval_pending = int(
            ht_40_data.filter(status="Approval Pending").count()
        )
        ht_20_under_repairing = int(ht_20_data.filter(status="Under Repairing").count())
        ht_40_under_repairing = int(ht_40_data.filter(status="Under Repairing").count())
        ht_20_available = int(ht_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ht_40_available = int(ht_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ht_20_allotment = int(
            len([each for each in list(ht_20_data) if not each.allotment_date is None])
        )
        ht_40_allotment = int(
            len([each for each in list(ht_40_data) if not each.allotment_date is None])
        )

        ht_20_total = (
            ht_20_condition_ok_count
            + ht_20_survey_pending
            + ht_20_estimate_pending
            + ht_20_approval_pending
            + ht_20_under_repairing
            + ht_20_available
            + ht_20_allotment
        )

        ht_40_total = (
            ht_40_condition_ok_count
            + ht_40_survey_pending
            + ht_40_estimate_pending
            + ht_40_approval_pending
            + ht_40_under_repairing
            + ht_40_available
            + ht_40_allotment
        )

        ht_20_list = [
            ht_20_condition_ok_count,
            ht_20_survey_pending,
            ht_20_estimate_pending,
            ht_20_approval_pending,
            ht_20_under_repairing,
            ht_20_available,
            ht_20_allotment,
            ht_20_total,
        ]

        ht_40_list = [
            ht_40_condition_ok_count,
            ht_40_survey_pending,
            ht_40_estimate_pending,
            ht_40_approval_pending,
            ht_40_under_repairing,
            ht_40_available,
            ht_40_allotment,
            ht_40_total,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hc_20_condition_ok_count = int(
            hc_20_data.filter(gate_in__condition="OK").count()
        )
        hc_40_condition_ok_count = int(
            hc_40_data.filter(gate_in__condition="OK").count()
        )
        hc_20_survey_pending = int(hc_20_data.filter(status="Survey Pending").count())
        hc_40_survey_pending = int(hc_40_data.filter(status="Survey Pending").count())
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_available = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_available = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )

        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_survey_pending
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_under_repairing
            + hc_20_available
            + hc_20_allotment
        )

        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_survey_pending
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_under_repairing
            + hc_40_available
            + hc_40_allotment
        )

        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_survey_pending,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_under_repairing,
            hc_20_available,
            hc_20_allotment,
            hc_20_total,
        ]

        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_survey_pending,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_under_repairing,
            hc_40_available,
            hc_40_allotment,
            hc_40_total,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ot_20_condition_ok_count = int(
            ot_20_data.filter(gate_in__condition="OK").count()
        )
        ot_40_condition_ok_count = int(
            ot_40_data.filter(gate_in__condition="OK").count()
        )
        ot_20_survey_pending = int(ot_20_data.filter(status="Survey Pending").count())
        ot_40_survey_pending = int(ot_40_data.filter(status="Survey Pending").count())
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_available = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_available = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )

        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_survey_pending
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_under_repairing
            + ot_20_available
            + ot_20_allotment
        )

        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_survey_pending
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_under_repairing
            + ot_40_available
            + ot_40_allotment
        )

        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_survey_pending,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_under_repairing,
            ot_20_available,
            ot_20_allotment,
            ot_20_total,
        ]

        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_survey_pending,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_under_repairing,
            ot_40_available,
            ot_40_allotment,
            ot_40_total,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        fr_20_condition_ok_count = int(
            fr_20_data.filter(gate_in__condition="OK").count()
        )
        fr_40_condition_ok_count = int(
            fr_40_data.filter(gate_in__condition="OK").count()
        )
        fr_20_survey_pending = int(fr_20_data.filter(status="Survey Pending").count())
        fr_40_survey_pending = int(fr_40_data.filter(status="Survey Pending").count())
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_available = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_available = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )

        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_survey_pending
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_under_repairing
            + fr_20_available
            + fr_20_allotment
        )

        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_survey_pending
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_under_repairing
            + fr_40_available
            + fr_40_allotment
        )

        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_survey_pending,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_under_repairing,
            fr_20_available,
            fr_20_allotment,
            fr_20_total,
        ]

        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_survey_pending,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_under_repairing,
            fr_40_available,
            fr_40_allotment,
            fr_40_total,
        ]

        ref_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="REF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ref_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="REF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        ref_20_condition_ok_count = int(
            ref_20_data.filter(gate_in__condition="OK").count()
        )
        ref_40_condition_ok_count = int(
            ref_40_data.filter(gate_in__condition="OK").count()
        )
        ref_20_survey_pending = int(ref_20_data.filter(status="Survey Pending").count())
        ref_40_survey_pending = int(ref_40_data.filter(status="Survey Pending").count())
        ref_20_estimate_pending = int(
            ref_20_data.filter(status="Estimate Pending").count()
        )
        ref_40_estimate_pending = int(
            ref_40_data.filter(status="Estimate Pending").count()
        )
        ref_20_approval_pending = int(
            ref_20_data.filter(status="Approval Pending").count()
        )
        ref_40_approval_pending = int(
            ref_40_data.filter(status="Approval Pending").count()
        )
        ref_20_under_repairing = int(
            ref_20_data.filter(status="Under Repairing").count()
        )
        ref_40_under_repairing = int(
            ref_40_data.filter(status="Under Repairing").count()
        )
        ref_20_available = int(ref_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ref_40_available = int(ref_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ref_20_allotment = int(
            len([each for each in list(ref_20_data) if not each.allotment_date is None])
        )
        ref_40_allotment = int(
            len([each for each in list(ref_40_data) if not each.allotment_date is None])
        )

        ref_20_total = (
            ref_20_condition_ok_count
            + ref_20_survey_pending
            + ref_20_estimate_pending
            + ref_20_approval_pending
            + ref_20_under_repairing
            + ref_20_available
            + ref_20_allotment
        )

        ref_40_total = (
            ref_40_condition_ok_count
            + ref_40_survey_pending
            + ref_40_estimate_pending
            + ref_40_approval_pending
            + ref_40_under_repairing
            + ref_40_available
            + ref_40_allotment
        )

        ref_20_list = [
            ref_20_condition_ok_count,
            ref_20_survey_pending,
            ref_20_estimate_pending,
            ref_20_approval_pending,
            ref_20_under_repairing,
            ref_20_available,
            ref_20_allotment,
            ref_20_total,
        ]

        ref_40_list = [
            ref_40_condition_ok_count,
            ref_40_survey_pending,
            ref_40_estimate_pending,
            ref_40_approval_pending,
            ref_40_under_repairing,
            ref_40_available,
            ref_40_allotment,
            ref_40_total,
        ]

        refven_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="REFVEN",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        refven_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="REFVEN",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        refven_20_condition_ok_count = int(
            refven_20_data.filter(gate_in__condition="OK").count()
        )
        refven_40_condition_ok_count = int(
            refven_40_data.filter(gate_in__condition="OK").count()
        )
        refven_20_survey_pending = int(
            refven_20_data.filter(status="Survey Pending").count()
        )
        refven_40_survey_pending = int(
            refven_40_data.filter(status="Survey Pending").count()
        )
        refven_20_estimate_pending = int(
            refven_20_data.filter(status="Estimate Pending").count()
        )
        refven_40_estimate_pending = int(
            refven_40_data.filter(status="Estimate Pending").count()
        )
        refven_20_approval_pending = int(
            refven_20_data.filter(status="Approval Pending").count()
        )
        refven_40_approval_pending = int(
            refven_40_data.filter(status="Approval Pending").count()
        )
        refven_20_under_repairing = int(
            refven_20_data.filter(status="Under Repairing").count()
        )
        refven_40_under_repairing = int(
            refven_40_data.filter(status="Under Repairing").count()
        )
        refven_20_available = int(refven_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        refven_40_available = int(refven_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        refven_20_allotment = int(
            len(
                [
                    each
                    for each in list(refven_20_data)
                    if not each.allotment_date is None
                ]
            )
        )
        refven_40_allotment = int(
            len(
                [
                    each
                    for each in list(refven_40_data)
                    if not each.allotment_date is None
                ]
            )
        )

        refven_20_total = (
            refven_20_condition_ok_count
            + refven_20_survey_pending
            + refven_20_estimate_pending
            + refven_20_approval_pending
            + refven_20_under_repairing
            + refven_20_available
            + refven_20_allotment
        )

        refven_40_total = (
            refven_40_condition_ok_count
            + refven_40_survey_pending
            + refven_40_estimate_pending
            + refven_40_approval_pending
            + refven_40_under_repairing
            + refven_40_available
            + refven_40_allotment
        )

        refven_20_list = [
            refven_20_condition_ok_count,
            refven_20_survey_pending,
            refven_20_estimate_pending,
            refven_20_approval_pending,
            refven_20_under_repairing,
            refven_20_available,
            refven_20_allotment,
            refven_20_total,
        ]

        refven_40_list = [
            refven_40_condition_ok_count,
            refven_40_survey_pending,
            refven_40_estimate_pending,
            refven_40_approval_pending,
            refven_40_under_repairing,
            refven_40_available,
            refven_40_allotment,
            refven_40_total,
        ]

        hcref_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="HCREF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hcref_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="HCREF",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        hcref_20_condition_ok_count = int(
            hcref_20_data.filter(gate_in__condition="OK").count()
        )
        hcref_40_condition_ok_count = int(
            hcref_40_data.filter(gate_in__condition="OK").count()
        )
        hcref_20_survey_pending = int(
            hcref_20_data.filter(status="Survey Pending").count()
        )
        hcref_40_survey_pending = int(
            hcref_40_data.filter(status="Survey Pending").count()
        )
        hcref_20_estimate_pending = int(
            hcref_20_data.filter(status="Estimate Pending").count()
        )
        hcref_40_estimate_pending = int(
            hcref_40_data.filter(status="Estimate Pending").count()
        )
        hcref_20_approval_pending = int(
            hcref_20_data.filter(status="Approval Pending").count()
        )
        hcref_40_approval_pending = int(
            hcref_40_data.filter(status="Approval Pending").count()
        )
        hcref_20_under_repairing = int(
            hcref_20_data.filter(status="Under Repairing").count()
        )
        hcref_40_under_repairing = int(
            hcref_40_data.filter(status="Under Repairing").count()
        )
        hcref_20_available = int(hcref_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hcref_40_available = int(hcref_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hcref_20_allotment = int(
            len(
                [
                    each
                    for each in list(hcref_20_data)
                    if not each.allotment_date is None
                ]
            )
        )
        hcref_40_allotment = int(
            len(
                [
                    each
                    for each in list(hcref_40_data)
                    if not each.allotment_date is None
                ]
            )
        )

        hcref_20_total = (
            hcref_20_condition_ok_count
            + hcref_20_survey_pending
            + hcref_20_estimate_pending
            + hcref_20_approval_pending
            + hcref_20_under_repairing
            + hcref_20_available
            + hcref_20_allotment
        )

        hcref_40_total = (
            hcref_40_condition_ok_count
            + hcref_40_survey_pending
            + hcref_40_estimate_pending
            + hcref_40_approval_pending
            + hcref_40_under_repairing
            + hcref_40_available
            + hcref_40_allotment
        )

        hcref_20_list = [
            hcref_20_condition_ok_count,
            hcref_20_survey_pending,
            hcref_20_estimate_pending,
            hcref_20_approval_pending,
            hcref_20_under_repairing,
            hcref_20_available,
            hcref_20_allotment,
            hcref_20_total,
        ]

        hcref_40_list = [
            hcref_40_condition_ok_count,
            hcref_40_survey_pending,
            hcref_40_estimate_pending,
            hcref_40_approval_pending,
            hcref_40_under_repairing,
            hcref_40_available,
            hcref_40_allotment,
            hcref_40_total,
        ]

        tank_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="TANK",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        tank_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="TANK",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code="MSC",
        )
        tank_20_condition_ok_count = int(
            tank_20_data.filter(gate_in__condition="OK").count()
        )
        tank_40_condition_ok_count = int(
            tank_40_data.filter(gate_in__condition="OK").count()
        )
        tank_20_survey_pending = int(
            tank_20_data.filter(status="Survey Pending").count()
        )
        tank_40_survey_pending = int(
            tank_40_data.filter(status="Survey Pending").count()
        )
        tank_20_estimate_pending = int(
            tank_20_data.filter(status="Estimate Pending").count()
        )
        tank_40_estimate_pending = int(
            tank_40_data.filter(status="Estimate Pending").count()
        )
        tank_20_approval_pending = int(
            tank_20_data.filter(status="Approval Pending").count()
        )
        tank_40_approval_pending = int(
            tank_40_data.filter(status="Approval Pending").count()
        )
        tank_20_under_repairing = int(
            tank_20_data.filter(status="Under Repairing").count()
        )
        tank_40_under_repairing = int(
            tank_40_data.filter(status="Under Repairing").count()
        )
        tank_20_available = int(tank_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        tank_40_available = int(tank_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        tank_20_allotment = int(
            len(
                [each for each in list(tank_20_data) if not each.allotment_date is None]
            )
        )
        tank_40_allotment = int(
            len(
                [each for each in list(tank_40_data) if not each.allotment_date is None]
            )
        )

        tank_20_total = (
            tank_20_condition_ok_count
            + tank_20_survey_pending
            + tank_20_estimate_pending
            + tank_20_approval_pending
            + tank_20_under_repairing
            + tank_20_available
            + tank_20_allotment
        )

        tank_40_total = (
            tank_40_condition_ok_count
            + tank_40_survey_pending
            + tank_40_estimate_pending
            + tank_40_approval_pending
            + tank_40_under_repairing
            + tank_40_available
            + tank_40_allotment
        )

        tank_20_list = [
            tank_20_condition_ok_count,
            tank_20_survey_pending,
            tank_20_estimate_pending,
            tank_20_approval_pending,
            tank_20_under_repairing,
            tank_20_available,
            tank_20_allotment,
            tank_20_total,
        ]

        tank_40_list = [
            tank_40_condition_ok_count,
            tank_40_survey_pending,
            tank_40_estimate_pending,
            tank_40_approval_pending,
            tank_40_under_repairing,
            tank_40_available,
            tank_40_allotment,
            tank_40_total,
        ]

        condition_ok_20_total_count = (
            dry_20_condition_ok_count
            + ht_20_condition_ok_count
            + hc_20_condition_ok_count
            + ot_20_condition_ok_count
            + fr_20_condition_ok_count
            + ref_20_condition_ok_count
            + hcref_20_condition_ok_count
            + refven_20_condition_ok_count
            + tank_20_condition_ok_count
        )

        survey_pending_20_total_count = (
            dry_20_survey_pending
            + ht_20_survey_pending
            + hc_20_survey_pending
            + ot_20_survey_pending
            + fr_20_survey_pending
            + ref_20_survey_pending
            + hcref_20_survey_pending
            + refven_20_survey_pending
            + tank_20_survey_pending
        )

        estimate_pending_20_total_count = (
            dry_20_estimate_pending
            + ht_20_estimate_pending
            + hc_20_estimate_pending
            + ot_20_estimate_pending
            + fr_20_estimate_pending
            + ref_20_estimate_pending
            + hcref_20_estimate_pending
            + refven_20_estimate_pending
            + tank_20_estimate_pending
        )

        approval_pending_20_total_count = (
            dry_20_approval_pending
            + ht_20_approval_pending
            + hc_20_approval_pending
            + ot_20_approval_pending
            + fr_20_approval_pending
            + ref_20_approval_pending
            + hcref_20_approval_pending
            + refven_20_approval_pending
            + tank_20_approval_pending
        )

        under_repairing_20_total_count = (
            dry_20_under_repairing
            + ht_20_under_repairing
            + hc_20_under_repairing
            + ot_20_under_repairing
            + fr_20_under_repairing
            + ref_20_under_repairing
            + hcref_20_under_repairing
            + refven_20_under_repairing
            + tank_20_under_repairing
        )

        available_20_total_count = (
            dry_20_available
            + ht_20_available
            + hc_20_available
            + ot_20_available
            + fr_20_available
            + ref_20_available
            + hcref_20_available
            + refven_20_available
            + tank_20_available
        )

        allotment_20_total_count = (
            dry_20_allotment
            + ht_20_allotment
            + hc_20_allotment
            + ot_20_allotment
            + fr_20_allotment
            + ref_20_allotment
            + hcref_20_allotment
            + refven_20_allotment
            + tank_20_allotment
        )

        total_20_all_count = (
            dry_20_total
            + ht_20_total
            + hc_20_total
            + ot_20_total
            + fr_20_total
            + ref_20_total
            + hcref_20_total
            + refven_20_total
            + tank_20_total
        )

        last_total_20_list = [
            condition_ok_20_total_count,
            survey_pending_20_total_count,
            estimate_pending_20_total_count,
            approval_pending_20_total_count,
            under_repairing_20_total_count,
            available_20_total_count,
            allotment_20_total_count,
            total_20_all_count,
        ]

        condition_ok_40_total_count = (
            dry_40_condition_ok_count
            + ht_40_condition_ok_count
            + hc_40_condition_ok_count
            + ot_40_condition_ok_count
            + fr_40_condition_ok_count
            + ref_40_condition_ok_count
            + hcref_40_condition_ok_count
            + refven_40_condition_ok_count
            + tank_40_condition_ok_count
        )

        survey_pending_40_total_count = (
            dry_40_survey_pending
            + ht_40_survey_pending
            + hc_40_survey_pending
            + ot_40_survey_pending
            + fr_40_survey_pending
            + ref_40_survey_pending
            + hcref_40_survey_pending
            + refven_40_survey_pending
            + tank_40_survey_pending
        )

        estimate_pending_40_total_count = (
            dry_40_estimate_pending
            + ht_40_estimate_pending
            + hc_40_estimate_pending
            + ot_40_estimate_pending
            + fr_40_estimate_pending
            + ref_40_estimate_pending
            + hcref_40_estimate_pending
            + refven_40_estimate_pending
            + tank_40_estimate_pending
        )

        approval_pending_40_total_count = (
            dry_40_approval_pending
            + ht_40_approval_pending
            + hc_40_approval_pending
            + ot_40_approval_pending
            + fr_40_approval_pending
            + ref_40_approval_pending
            + hcref_40_approval_pending
            + refven_40_approval_pending
            + tank_40_approval_pending
        )

        under_repairing_40_total_count = (
            dry_40_under_repairing
            + ht_40_under_repairing
            + hc_40_under_repairing
            + ot_40_under_repairing
            + fr_40_under_repairing
            + ref_40_under_repairing
            + hcref_40_under_repairing
            + refven_40_under_repairing
            + tank_40_under_repairing
        )

        available_40_total_count = (
            dry_40_available
            + ht_40_available
            + hc_40_available
            + ot_40_available
            + fr_40_available
            + ref_40_available
            + hcref_40_available
            + refven_40_available
            + tank_40_available
        )

        allotment_40_total_count = (
            dry_40_allotment
            + ht_40_allotment
            + hc_40_allotment
            + ot_40_allotment
            + fr_40_allotment
            + ref_40_allotment
            + hcref_40_allotment
            + refven_40_allotment
            + tank_40_allotment
        )

        total_40_all_count = (
            dry_40_total
            + ht_40_total
            + hc_40_total
            + ot_40_total
            + fr_40_total
            + ref_40_total
            + hcref_40_total
            + refven_40_total
            + tank_40_total
        )

        last_total_40_list = [
            condition_ok_40_total_count,
            survey_pending_40_total_count,
            estimate_pending_40_total_count,
            approval_pending_40_total_count,
            under_repairing_40_total_count,
            available_40_total_count,
            allotment_40_total_count,
            total_40_all_count,
        ]

        type_list = ["OK", "AS", "AE", "AA", "AR", "AV", "ALLOTMENT", "TOTAL"]

        df_20_data = [
            [
                type_list[i],
                hc_20_list[i],
                hcref_20_list[i],
                refven_20_list[i],
                fr_20_list[i],
                ot_20_list[i],
                ref_20_list[i],
                tank_20_list[i],
                ht_20_list[i],
                dry_20_list[i],
                last_total_20_list[i],
            ]
            for i in range(len(type_list))
        ]

        df_40_data = [
            [
                type_list[i],
                hc_40_list[i],
                hcref_40_list[i],
                refven_40_list[i],
                fr_40_list[i],
                ot_40_list[i],
                ref_40_list[i],
                tank_40_list[i],
                ht_40_list[i],
                dry_40_list[i],
                last_total_40_list[i],
            ]
            for i in range(len(type_list))
        ]

        return [df_20_data, df_40_data]

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_20_data = [[]]
        df_40_data = [[]]
        return [df_20_data, df_40_data]


def msc_estimate_data_object_list(
    from_date_str, to_date_str, from_time_str, to_time_str, line, location, site
):
    try:
        if site.type == "DEPOT":
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
                    msc_estimate_data_list = list(
                        Estimate.objects.filter(
                            current_date_time__range=(from_date_time, to_date_time),
                            parent__depot__container__location=location,
                            parent__depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_estimate_data_list

                else:
                    msc_estimate_data_list = list(
                        Estimate.objects.filter(
                            current_date__range=[from_date_str, to_date_str],
                            parent__depot__container__location=location,
                            parent__depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_estimate_data_list
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)
                msc_estimate_data_list = list(
                    Estimate.objects.filter(
                        current_date_time__range=(from_date_time, to_date_time),
                        parent__depot__container__location=location,
                        parent__depot__container__site=site,
                    ).order_by("current_date")
                )
                return msc_estimate_data_list
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
                    msc_estimate_data_list = list(
                        Estimate.objects.filter(
                            current_date_time__range=(from_date_time, to_date_time),
                            parent__non_depot__container__location=location,
                            parent__non_depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_estimate_data_list

                else:
                    msc_estimate_data_list = list(
                        Estimate.objects.filter(
                            current_date__range=[from_date_str, to_date_str],
                            parent__non_depot__container__location=location,
                            parent__non_depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_estimate_data_list
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)
                msc_estimate_data_list = list(
                    Estimate.objects.filter(
                        current_date_time__range=(from_date_time, to_date_time),
                        parent__non_depot__container__location=location,
                        parent__non_depot__container__site=site,
                    ).order_by("current_date")
                )
                return msc_estimate_data_list
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_approval_data_object_list(
    from_date_str, to_date_str, from_time_str, to_time_str, line, location, site
):
    try:
        if site.type == "DEPOT":
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
                    msc_approval_data_list = list(
                        Approval.objects.filter(
                            current_date_time__range=(from_date_time, to_date_time),
                            parent__parent__depot__container__location=location,
                            parent__parent__depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_approval_data_list

                else:
                    msc_approval_data_list = list(
                        Approval.objects.filter(
                            current_date__range=[from_date_str, to_date_str],
                            parent__parent__depot__container__location=location,
                            parent__parent__depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_approval_data_list
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)
                msc_approval_data_list = list(
                    Approval.objects.filter(
                        current_date_time__range=(from_date_time, to_date_time),
                        parent__parent__depot__container__location=location,
                        parent__parent__depot__container__site=site,
                    ).order_by("current_date")
                )
                return msc_approval_data_list
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
                    msc_approval_data_list = list(
                        Approval.objects.filter(
                            current_date_time__range=(from_date_time, to_date_time),
                            parent__parent__non_depot__container__location=location,
                            parent__parent__non_depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_approval_data_list

                else:
                    msc_approval_data_list = list(
                        Approval.objects.filter(
                            current_date__range=[from_date_str, to_date_str],
                            parent__parent__non_depot__container__location=location,
                            parent__parent__non_depot__container__site=site,
                        ).order_by("current_date")
                    )
                    return msc_approval_data_list
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)
                msc_approval_data_list = list(
                    Approval.objects.filter(
                        current_date_time__range=(from_date_time, to_date_time),
                        parent__parent__non_depot__container__location=location,
                        parent__parent__non_depot__container__site=site,
                    ).order_by("current_date")
                )
                return msc_approval_data_list
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_repair_data_object_list(
    from_date_str, to_date_str, from_time_str, to_time_str, line, location, site
):
    try:
        if site.type == "DEPOT":
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
                    msc_repair_data_list = list(
                        Repair.objects.filter(
                            repair_date_time__range=(from_date_time, to_date_time),
                            parent__parent__depot__container__location=location,
                            parent__parent__depot__container__site=site,
                        ).order_by("repair_date")
                    )
                    return msc_repair_data_list

                else:
                    msc_repair_data_list = list(
                        Repair.objects.filter(
                            repair_date__range=[from_date_str, to_date_str],
                            parent__parent__depot__container__location=location,
                            parent__parent__depot__container__site=site,
                        ).order_by("repair_date")
                    )
                    return msc_repair_data_list
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)
                msc_repair_data_list = list(
                    Repair.objects.filter(
                        repair_date_time__range=(from_date_time, to_date_time),
                        parent__parent__depot__container__location=location,
                        parent__parent__depot__container__site=site,
                    ).order_by("repair_date")
                )
                return msc_repair_data_list
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
                    msc_repair_data_list = list(
                        Repair.objects.filter(
                            repair_date_time__range=(from_date_time, to_date_time),
                            parent__parent__non_depot__container__location=location,
                            parent__parent__non_depot__container__site=site,
                        ).order_by("repair_date")
                    )
                    return msc_repair_data_list

                else:
                    msc_repair_data_list = list(
                        Repair.objects.filter(
                            repair_date__range=[from_date_str, to_date_str],
                            parent__parent__non_depot__container__location=location,
                            parent__parent__non_depot__container__site=site,
                        ).order_by("repair_date")
                    )
                    return msc_repair_data_list
            else:
                to_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                from_date_time = to_date_time - datetime.timedelta(hours=24)
                msc_repair_data_list = list(
                    Repair.objects.filter(
                        repair_date_time__range=(from_date_time, to_date_time),
                        parent__parent__non_depot__container__location=location,
                        parent__parent__non_depot__container__site=site,
                    ).order_by("repair_date")
                )
                return msc_repair_data_list
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_repair_completion_report_row_data(data_object):
    try:
        data = {}
        container_data = None
        line = None
        location = None
        organization = None
        if data_object.parent.parent.depot is not None:
            container_data = data_object.parent.parent.depot.container.get_container()
            line = data_object.parent.parent.depot.container.client.ref_code
            location = data_object.parent.parent.depot.container.location.name
            organization = (
                data_object.parent.parent.depot.container.location.organization
            )
        else:
            container_data = (
                data_object.parent.parent.non_depot.container.get_container()
            )
            line = data_object.parent.parent.non_depot.container.client.ref_code
            location = data_object.parent.parent.non_depot.container.location.name
            organization = (
                data_object.parent.parent.non_depot.container.location.organization
            )

        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = line
        data["location"] = location
        data["vendor"] = organization
        if data_object.repair_date is None:
            data["repair_date"] = ""
        else:
            data["repair_date"] = data_object.repair_date.strftime("%d/%b/%Y")
        if data_object.grade is None:
            data["grade"] = ""
        else:
            data["grade"] = data_object.grade
        if data_object.remarks is None:
            data["remarks"] = ""
        else:
            data["remarks"] = data_object.remarks
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_repair_completion_report_main_data(data_object_list):
    try:
        data = []
        count = 0
        for each in data_object_list:
            count += 1
            each_data = msc_repair_completion_report_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)

        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        location = [each.get("location") for each in data]
        vendor = [each.get("vendor") for each in data]
        repair_date = [each.get("repair_date") for each in data]
        grade = [each.get("grade") for each in data]
        remarks = [each.get("remarks") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                location[i],
                vendor[i],
                repair_date[i],
                grade[i],
                remarks[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 8)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 8)]]
        return df_data


def get_move_code(arrived):
    try:
        code_dict = {
            "Factory": "MTIN",
            "Road/Rail": "MIR",
            "CFS/ICD": "MTIN",
            "Port/Vessel": "MIR",
            "FS RETURN": "RET",
        }
        move_code = code_dict.get(arrived)
        return move_code
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_estimate_report_row_data(data_object):
    try:
        data = {}
        container_object = None
        depot = None
        non_depot = None
        move_code = None
        arrival_date = None
        surveyline_data_list = []
        organization = None

        if data_object.parent.depot is not None:
            depot = data_object.parent.depot
            container_object = depot.container
            organization = depot.container.location.organization

            if depot.gate_in.arrived is None:
                move_code = ""
            else:
                move_code = get_move_code(depot.gate_in.arrived)

            if depot.gate_in.in_date is None:
                arrival_date = ""
            else:
                arrival_date = depot.gate_in.in_date.strftime("%d/%m/%Y")
        else:
            non_depot = data_object.parent.non_depot
            container_object = non_depot.container
            organization = non_depot.container.location.organization

            if container_object.mode is None:
                move_code = ""
            else:
                move_code = get_move_code(container_object.mode)

            if non_depot.gate_in.in_date is None:
                arrival_date = ""
            else:
                arrival_date = non_depot.gate_in.in_date.strftime("%d/%m/%Y")

        data["estimate_ref_no"] = data_object.number

        if data_object.current_date is None:
            data["activity_month"] = ""
        else:
            data["activity_month"] = data_object.current_date.month

        if data_object.current_date is None:
            data["year"] = ""
        else:
            data["year"] = str(data_object.current_date.year)

        data["repair_vendor_name"] = organization

        if container_object.container_no is None:
            data["container_no"] = ""
        else:
            data["container_no"] = container_object.container_no

        if container_object.type is None:
            data["type"] = ""
        else:
            data["type"] = container_object.type.name

        if container_object.size.name is None:
            data["size"] = ""
        else:
            data["size"] = container_object.size.name

        data["move_code"] = move_code

        data["arrival_date"] = arrival_date

        if container_object.site.depot_code is None:
            data["depot_code"] = ""
        else:
            data["depot_code"] = container_object.site.depot_code

        if container_object.site.depot_name is None:
            data["depot_name"] = ""
        else:
            data["depot_name"] = container_object.site.depot_name

        if container_object.location.name is None:
            data["location"] = ""
        else:
            data["location"] = container_object.location.name

        if container_object.manufacturing_date is None:
            data["mfg_year"] = ""
        else:
            data["mfg_year"] = str(container_object.manufacturing_date.year)

        if container_object.manufacturing_date is None:
            data["mfg_month"] = ""
        else:
            data["mfg_month"] = container_object.manufacturing_date.month

        if data_object.parent.labour_rate is None:
            data["labour_rate"] = ""
        else:
            data["labour_rate"] = data_object.parent.labour_rate

        data["grand_total_cost"] = data_object.current_amount

        item_no = 0

        for surveyline in SurveyLine.objects.filter(parent=data_object.parent):
            surveyline_data = {}
            item_no = item_no + 1
            surveyline_data["item_no"] = item_no

            if surveyline.remarks is None:
                surveyline_data["damage_details"] = ""
            else:
                surveyline_data["damage_details"] = surveyline.remarks

            if surveyline.tariff_code is None:
                surveyline_data["repair_code"] = ""
            else:
                surveyline_data["repair_code"] = surveyline.tariff_code

            quantity = surveyline.quantity
            labour_hrs_tariff = surveyline.labour_hrs_tariff
            material_tariff = surveyline.material_tariff
            labour_cost = surveyline.labour_cost
            total_cost = surveyline.total_cost
            gst_percentage = surveyline.gst
            gst_amount = surveyline.total_tax_amount
            total_cost_with_gst = surveyline.total_cost_with_tax

            if quantity is None:
                surveyline_data["quantity"] = ""
            else:
                surveyline_data["quantity"] = quantity

            if labour_hrs_tariff is None:
                surveyline_data["man_hrs_tarrif"] = ""
            else:
                surveyline_data["man_hrs_tarrif"] = labour_hrs_tariff

            if material_tariff is None:
                surveyline_data["material_tariff"] = ""
            else:
                surveyline_data["material_tariff"] = material_tariff

            if surveyline.wash_clean_tariff is None:
                surveyline_data["cleaning_cost_tarrif"] = ""
            else:
                surveyline_data["cleaning_cost_tarrif"] = surveyline.wash_clean_tariff

            if gst_percentage is None:
                surveyline_data["gst_percentage"] = "18"
            else:
                surveyline_data["gst_percentage"] = gst_percentage

            if labour_cost is None:
                surveyline_data["man_hrs_cost"] = ""
            else:
                surveyline_data["man_hrs_cost"] = labour_cost

            if material_tariff is None or quantity is None:
                surveyline_data["material_cost"] = ""
            else:
                surveyline_data["material_cost"] = material_tariff * quantity

            if surveyline.wash_clean_tariff is None:
                surveyline_data["cleaning_cost"] = ""
            else:
                surveyline_data["cleaning_cost"] = (
                    surveyline.wash_clean_tariff * quantity
                )

            if total_cost is None:
                surveyline_data["total_cost"] = ""
            else:
                surveyline_data["total_cost"] = total_cost

            if gst_amount is None or float(gst_amount) == float(0):
                gst_amount = float(total_cost) * 0
                surveyline_data["gst_amount"] = round(gst_amount, 2)
            else:
                surveyline_data["gst_amount"] = gst_amount

            if total_cost_with_gst is None or float(total_cost_with_gst) == float(0):
                gst_amount = float(total_cost) * 0
                total_cost_with_gst = float(total_cost) + float(round(gst_amount, 2))
                surveyline_data["total_cost_with_gst"] = round(total_cost_with_gst, 2)
            else:
                surveyline_data["total_cost_with_gst"] = total_cost_with_gst

            surveyline_data_list.append(surveyline_data)

        data["surveyline_data_list"] = surveyline_data_list
        return data
    except Exception as e:
        return None


def msc_estimate_report_main_data(data_object_list):
    try:
        data = []
        sr_no = 0
        for object in data_object_list:
            data_dict = msc_estimate_report_row_data(object)
            sr_no = sr_no + 1
            data_dict["sr_no"] = sr_no
            data.append(data_dict)

        labour_rate = data[0].get("labour_rate")

        sr_no = []
        estimate_ref_no = []
        activity_month = []
        year = []
        repair_vendor_name = []
        container_no = []
        type = []
        size = []
        move_code = []
        arrival_date = []
        depot_code = []
        depot_name = []
        location = []
        mfg_year = []
        mfg_month = []
        item_no = []
        damage_details = []
        repair_code = []
        quantity = []
        man_hrs_tarrif = []
        material_tariff = []
        cleaning_cost_tarrif = []
        gst_percentage = []
        man_hrs_cost = []
        materials_cost = []
        cleaning_cost = []
        total_cost = []
        gst_amount = []
        total_cost_with_gst = []
        grand_total = []

        for each in data:
            sr_no.append(each.get("sr_no"))
            estimate_ref_no.append(each.get("estimate_ref_no"))
            activity_month.append(each.get("activity_month"))
            year.append(each.get("year"))
            repair_vendor_name.append(each.get("repair_vendor_name"))
            container_no.append(each.get("container_no"))
            type.append(each.get("type"))
            size.append(each.get("size"))
            move_code.append(each.get("move_code"))
            arrival_date.append(each.get("arrival_date"))
            depot_code.append(each.get("depot_code"))
            depot_name.append(each.get("depot_name"))
            location.append(each.get("location"))
            mfg_year.append(each.get("mfg_year"))
            mfg_month.append(each.get("mfg_month"))
            grand_total.append(each.get("grand_total_cost"))

            count = 0
            for seq in each["surveyline_data_list"]:
                count = count + 1
                if count > 1:
                    sr_no.append("")
                    estimate_ref_no.append("")
                    activity_month.append("")
                    year.append("")
                    repair_vendor_name.append("")
                    container_no.append("")
                    type.append("")
                    size.append("")
                    move_code.append("")
                    arrival_date.append("")
                    depot_code.append("")
                    depot_name.append("")
                    location.append("")
                    mfg_year.append("")
                    mfg_month.append("")
                    grand_total.append("")

                item_no.append(seq.get("item_no"))
                damage_details.append(seq.get("damage_details"))
                repair_code.append(seq.get("repair_code"))
                quantity.append(seq.get("quantity"))
                man_hrs_tarrif.append(seq.get("man_hrs_tarrif"))
                material_tariff.append(seq.get("material_tariff"))
                cleaning_cost_tarrif.append(seq.get("cleaning_cost_tarrif"))
                gst_percentage.append(seq.get("gst_percentage"))
                man_hrs_cost.append(seq.get("man_hrs_cost"))
                materials_cost.append(seq.get("material_cost"))
                cleaning_cost.append(seq.get("cleaning_cost"))
                total_cost.append(seq.get("total_cost"))
                gst_amount.append(seq.get("gst_amount"))
                total_cost_with_gst.append(seq.get("total_cost_with_gst"))
            sr_no.append("")
            estimate_ref_no.append("")
            activity_month.append("")
            year.append("")
            repair_vendor_name.append("")
            container_no.append("")
            type.append("")
            size.append("")
            move_code.append("")
            arrival_date.append("")
            depot_code.append("")
            depot_name.append("")
            location.append("")
            mfg_year.append("")
            mfg_month.append("")
            item_no.append("")
            damage_details.append("")
            repair_code.append("")
            quantity.append("")
            man_hrs_tarrif.append("")
            material_tariff.append("")
            cleaning_cost_tarrif.append("")
            gst_percentage.append("")
            man_hrs_cost.append("")
            materials_cost.append("")
            cleaning_cost.append("")
            total_cost.append("")
            gst_amount.append("")
            total_cost_with_gst.append("")
            grand_total.append("")
        df_data = [
            [
                sr_no[i],
                estimate_ref_no[i],
                activity_month[i],
                year[i],
                repair_vendor_name[i],
                container_no[i],
                type[i],
                size[i],
                move_code[i],
                arrival_date[i],
                depot_code[i],
                depot_name[i],
                location[i],
                mfg_year[i],
                mfg_month[i],
                item_no[i],
                damage_details[i],
                repair_code[i],
                quantity[i],
                man_hrs_tarrif[i],
                material_tariff[i],
                cleaning_cost_tarrif[i],
                gst_percentage[i],
                man_hrs_cost[i],
                materials_cost[i],
                cleaning_cost[i],
                total_cost[i],
                gst_amount[i],
                total_cost_with_gst[i],
                grand_total[i],
            ]
            for i in range(len(sr_no))
        ]

        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 30)])
        return {"df_data": df_data, "labour_rate": labour_rate}
    except Exception as e:
        df_data = [["" for i in range(0, 30)]]
        return {"df_data": df_data, "labour_rate": ""}


def msc_approval_report_row_data(data_object):
    try:
        data = {}
        container_object = None
        depot = None
        non_depot = None
        move_code = None
        arrival_date = None
        surveyline_data_list = []
        organization = None

        if data_object.parent.parent.depot is not None:
            depot = data_object.parent.parent.depot
            container_object = depot.container
            organization = depot.container.location.organization

            if depot.gate_in.arrived is None:
                move_code = ""
            else:
                move_code = get_move_code(depot.gate_in.arrived)

            if depot.gate_in.in_date is None:
                arrival_date = ""
            else:
                arrival_date = depot.gate_in.in_date.strftime("%d/%m/%Y")
        else:
            non_depot = data_object.parent.parent.non_depot
            container_object = non_depot.container
            organization = non_depot.container.location.organization

            if container_object.mode is None:
                move_code = ""
            else:
                move_code = get_move_code(container_object.mode)

            if non_depot.gate_in.in_date is None:
                arrival_date = ""
            else:
                arrival_date = non_depot.gate_in.in_date.strftime("%d/%m/%Y")

        if data_object.current_date is None:
            data["activity_month"] = ""
        else:
            data["activity_month"] = data_object.current_date.month

        if data_object.current_date is None:
            data["year"] = ""
        else:
            data["year"] = str(data_object.current_date.year)

        data["repair_vendor_name"] = organization

        if container_object.container_no is None:
            data["container_no"] = ""
        else:
            data["container_no"] = container_object.container_no

        if container_object.type is None:
            data["type"] = ""
        else:
            data["type"] = container_object.type.name

        if container_object.size.name is None:
            data["size"] = ""
        else:
            data["size"] = container_object.size.name

        data["move_code"] = move_code

        data["arrival_date"] = arrival_date

        if container_object.site.depot_code is None:
            data["depot_code"] = ""
        else:
            data["depot_code"] = container_object.site.depot_code

        if container_object.site.depot_name is None:
            data["depot_name"] = ""
        else:
            data["depot_name"] = container_object.site.depot_name

        if container_object.location.name is None:
            data["location"] = ""
        else:
            data["location"] = container_object.location.name

        if container_object.manufacturing_date is None:
            data["mfg_year"] = ""
        else:
            data["mfg_year"] = str(container_object.manufacturing_date.year)

        if container_object.manufacturing_date is None:
            data["mfg_month"] = ""
        else:
            data["mfg_month"] = container_object.manufacturing_date.month

        if data_object.parent.parent.labour_rate is None:
            data["labour_rate"] = ""
        else:
            data["labour_rate"] = data_object.parent.parent.labour_rate

        data["grand_total_cost"] = data_object.parent.current_amount

        item_no = 0

        for surveyline in SurveyLine.objects.filter(parent=data_object.parent.parent):
            surveyline_data = {}
            item_no = item_no + 1
            surveyline_data["item_no"] = item_no

            if surveyline.remarks is None:
                surveyline_data["damage_details"] = ""
            else:
                surveyline_data["damage_details"] = surveyline.remarks

            if surveyline.tariff_code is None:
                surveyline_data["repair_code"] = ""
            else:
                surveyline_data["repair_code"] = surveyline.tariff_code

            quantity = surveyline.quantity
            labour_hrs_tariff = surveyline.labour_hrs_tariff
            material_tariff = surveyline.material_tariff
            labour_cost = surveyline.labour_cost
            total_cost = surveyline.total_cost
            gst_percentage = surveyline.gst
            gst_amount = surveyline.total_tax_amount
            total_cost_with_gst = surveyline.total_cost_with_tax

            if quantity is None:
                surveyline_data["quantity"] = ""
            else:
                surveyline_data["quantity"] = quantity

            if labour_hrs_tariff is None:
                surveyline_data["man_hrs_tarrif"] = ""
            else:
                surveyline_data["man_hrs_tarrif"] = labour_hrs_tariff

            if material_tariff is None:
                surveyline_data["material_tariff"] = ""
            else:
                surveyline_data["material_tariff"] = material_tariff

            if surveyline.wash_clean_tariff is None:
                surveyline_data["cleaning_cost_tarrif"] = ""
            else:
                surveyline_data["cleaning_cost_tarrif"] = surveyline.wash_clean_tariff

            if gst_percentage is None:
                surveyline_data["gst_percentage"] = "18"
            else:
                surveyline_data["gst_percentage"] = gst_percentage

            if labour_cost is None:
                surveyline_data["man_hrs_cost"] = ""
            else:
                surveyline_data["man_hrs_cost"] = labour_cost

            if material_tariff is None or quantity is None:
                surveyline_data["material_cost"] = ""
            else:
                surveyline_data["material_cost"] = material_tariff * quantity

            if surveyline.wash_clean_tariff is None:
                surveyline_data["cleaning_cost"] = ""
            else:
                surveyline_data["cleaning_cost"] = (
                    surveyline.wash_clean_tariff * quantity
                )

            if total_cost is None:
                surveyline_data["total_cost"] = ""
            else:
                surveyline_data["total_cost"] = total_cost

            if gst_amount is None or float(gst_amount) == float(0):
                gst_amount = float(total_cost) * 0
                surveyline_data["gst_amount"] = round(gst_amount, 2)
            else:
                surveyline_data["gst_amount"] = gst_amount

            if total_cost_with_gst is None or float(total_cost_with_gst) == float(0):
                gst_amount = float(total_cost) * 0
                total_cost_with_gst = float(total_cost) + float(round(gst_amount, 2))
                surveyline_data["total_cost_with_gst"] = round(total_cost_with_gst, 2)
            else:
                surveyline_data["total_cost_with_gst"] = total_cost_with_gst

            surveyline_data_list.append(surveyline_data)

        if data_object.parent.is_approved is None:
            data["remarks"] = ""
        else:
            if data_object.parent.is_approved is True:
                data["remarks"] = "cost_accepted"
            else:
                data["remarks"] = "cost_not_accepted"

        data["surveyline_data_list"] = surveyline_data_list
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msc_approval_report_main_data(data_object_list):
    try:
        data = []
        sr_no = 0
        for object in data_object_list:
            data_dict = msc_approval_report_row_data(object)
            sr_no = sr_no + 1
            data_dict["sr_no"] = sr_no
            data.append(data_dict)

        labour_rate = data[0].get("labour_rate")

        sr_no = []
        activity_month = []
        year = []
        repair_vendor_name = []
        container_no = []
        type = []
        size = []
        move_code = []
        arrival_date = []
        depot_code = []
        depot_name = []
        location = []
        mfg_year = []
        mfg_month = []
        item_no = []
        damage_details = []
        repair_code = []
        quantity = []
        man_hrs_tarrif = []
        material_tariff = []
        cleaning_cost_tarrif = []
        gst_percentage = []
        man_hrs_cost = []
        materials_cost = []
        cleaning_cost = []
        total_cost = []
        gst_amount = []
        total_cost_with_gst = []
        grand_total = []
        remarks = []

        for each in data:
            sr_no.append(each.get("sr_no"))
            activity_month.append(each.get("activity_month"))
            year.append(each.get("year"))
            repair_vendor_name.append(each.get("repair_vendor_name"))
            container_no.append(each.get("container_no"))
            type.append(each.get("type"))
            size.append(each.get("size"))
            move_code.append(each.get("move_code"))
            arrival_date.append(each.get("arrival_date"))
            depot_code.append(each.get("depot_code"))
            depot_name.append(each.get("depot_name"))
            location.append(each.get("location"))
            mfg_year.append(each.get("mfg_year"))
            mfg_month.append(each.get("mfg_month"))
            grand_total.append(each.get("grand_total_cost"))
            remarks.append(each.get("remarks"))

            count = 0
            for seq in each["surveyline_data_list"]:
                count = count + 1
                if count > 1:
                    sr_no.append("")
                    activity_month.append("")
                    year.append("")
                    repair_vendor_name.append("")
                    container_no.append("")
                    type.append("")
                    size.append("")
                    move_code.append("")
                    arrival_date.append("")
                    depot_code.append("")
                    depot_name.append("")
                    location.append("")
                    mfg_year.append("")
                    mfg_month.append("")
                    grand_total.append("")
                    remarks.append("")

                item_no.append(seq.get("item_no"))
                damage_details.append(seq.get("damage_details"))
                repair_code.append(seq.get("repair_code"))
                quantity.append(seq.get("quantity"))
                man_hrs_tarrif.append(seq.get("man_hrs_tarrif"))
                material_tariff.append(seq.get("material_tariff"))
                cleaning_cost_tarrif.append(seq.get("cleaning_cost_tarrif"))
                gst_percentage.append(seq.get("gst_percentage"))
                man_hrs_cost.append(seq.get("man_hrs_cost"))
                materials_cost.append(seq.get("material_cost"))
                cleaning_cost.append(seq.get("cleaning_cost"))
                total_cost.append(seq.get("total_cost"))
                gst_amount.append(seq.get("gst_amount"))
                total_cost_with_gst.append(seq.get("total_cost_with_gst"))

            sr_no.append("")
            activity_month.append("")
            year.append("")
            repair_vendor_name.append("")
            container_no.append("")
            type.append("")
            size.append("")
            move_code.append("")
            arrival_date.append("")
            depot_code.append("")
            depot_name.append("")
            location.append("")
            mfg_year.append("")
            mfg_month.append("")
            item_no.append("")
            damage_details.append("")
            repair_code.append("")
            quantity.append("")
            man_hrs_tarrif.append("")
            material_tariff.append("")
            cleaning_cost_tarrif.append("")
            gst_percentage.append("")
            man_hrs_cost.append("")
            materials_cost.append("")
            cleaning_cost.append("")
            total_cost.append("")
            gst_amount.append("")
            total_cost_with_gst.append("")
            grand_total.append("")
            remarks.append("")

        df_data = [
            [
                sr_no[i],
                activity_month[i],
                year[i],
                repair_vendor_name[i],
                container_no[i],
                type[i],
                size[i],
                move_code[i],
                arrival_date[i],
                depot_code[i],
                depot_name[i],
                location[i],
                mfg_year[i],
                mfg_month[i],
                item_no[i],
                damage_details[i],
                repair_code[i],
                quantity[i],
                man_hrs_tarrif[i],
                material_tariff[i],
                cleaning_cost_tarrif[i],
                gst_percentage[i],
                man_hrs_cost[i],
                materials_cost[i],
                cleaning_cost[i],
                total_cost[i],
                gst_amount[i],
                total_cost_with_gst[i],
                grand_total[i],
                remarks[i],
            ]
            for i in range(len(sr_no))
        ]

        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 31)])
        return {"df_data": df_data, "labour_rate": labour_rate}
    except Exception as e:
        df_data = [["" for i in range(0, 31)]]
        return {"df_data": df_data, "labour_rate": ""}


def seal_row_data(data_object):
    try:
        data = {}
        gate_out_data = data_object.gate_out.get_gate_out()
        data["booking_party"] = gate_out_data["booking_party"]
        data["booking_no"] = gate_out_data["booking_no"]
        seal_no = gate_out_data["seal_no"]
        data["seal_no"] = seal_no
        seal_object = SealNo.objects.get(number=seal_no)
        data["issued_date"] = datetime.datetime.strftime(
            seal_object.in_use_date, "%d/%m/%Y"
        )
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def seal_main_data(data_object):
    try:
        data_object_list = data_object["outward_data_list"]
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = seal_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        booking_party = [each.get("booking_party") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        issued_date = [each.get("issued_date") for each in data]
        df_data = [
            [
                sl_no[i],
                seal_no[i],
                booking_party[i],
                booking_no[i],
                issued_date[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 5)])
        main_data = {
            "df_data": df_data,
            "seal_no_opening": data_object["seal_no_opening"],
            "seal_no_closing": data_object["seal_no_closing"],
            "seal_no_available": data_object["seal_no_available"],
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 5)]]
        main_data = {
            "df_data": df_data,
            "seal_no_opening": "",
            "seal_no_closing": "",
            "seal_no_available": "",
        }
        return main_data


def seal_request_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%b %d %Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        data["gate_out_date"] = out_date_str
        data["gate_out_time"] = out_time_str
        data["transporter"] = gate_out_data["transporter_name"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["seal_no"] = gate_out_data["seal_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def seal_request_main_data(data_object):
    try:
        data_object_list = data_object["outward_data_list"]
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = seal_request_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        transporter = [each.get("transporter") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                container_size_type[i],
                gate_out_date[i],
                gate_out_time[i],
                seal_no[i],
                booking_no[i],
                transporter[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 8)])
        main_data = {
            "df_data": df_data,
            "seal_no_opening": data_object["seal_no_opening"],
            "seal_no_closing": data_object["seal_no_closing"],
            "seal_no_available": data_object["seal_no_available"],
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 8)]]
        main_data = {
            "df_data": df_data,
            "seal_no_opening": "",
            "seal_no_closing": "",
            "seal_no_available": "",
        }
        return main_data


def seal_stock_main_data(data_object):
    try:
        data_object_list = data_object["seal_stock_data_list"]
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = {"sl_no": count, "seal_no": each.number}
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]

        df_data = [
            [
                sl_no[i],
                seal_no[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 2)])

        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 2)]]
        return df_data


def seal_raw_detail_dict(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time

        today = datetime.datetime.now().astimezone(timezone.get_current_timezone())

        seal_data = None
        outward_data_list = None
        if line is None:
            seal_data = SealNo.objects.select_related("location", "site").filter(
                location=location, site=site
            )
            outward_data_list = list(
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
                    container__location=location,
                    container__site=site,
                )
                .exclude(gate_out__seal_no=None)
                .order_by("date")
            )
        else:
            seal_data = SealNo.objects.select_related("location", "site").filter(
                location=location, site=site, line=line
            )
            outward_data_list = list(
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
                    container__location=location,
                    container__site=site,
                )
                .exclude(gate_out__seal_no=None)
                .order_by("date")
            )

        seal_op_in_data_count = int(
            seal_data.filter(in_date__lte=yesterday_for_from_date_time).count()
        )
        seal_op_out_data_count = int(
            seal_data.filter(out_date__lte=yesterday_for_from_date_time).count()
        )
        seal_op_data_count = seal_op_in_data_count - seal_op_out_data_count
        if seal_op_data_count < 0:
            seal_op_data_count = 0

        seal_in_data_count = int(
            seal_data.filter(in_date__range=(from_date_time, to_date_time)).count()
        )
        seal_out_data_count = int(
            seal_data.filter(out_date__range=(from_date_time, to_date_time)).count()
        )
        seal_cl_data_count = (
            seal_op_data_count + seal_in_data_count - seal_out_data_count
        )
        if seal_cl_data_count < 0:
            seal_cl_data_count = 0

        available_seal_data = seal_data.filter(is_available=True)
        available_seal_data_count = available_seal_data.count()

        yesterday_str = yesterday_for_from_date_time.strftime("%d/%m/%Y %I:%M %p")
        from_str = from_date_time.strftime("%d/%m/%Y %I:%M %p")
        to_str = to_date_time.strftime("%d/%m/%Y %I:%M %p")
        today_str = today.strftime("%d/%m/%Y %I:%M %p")

        seal_no_opening = (
            f"Seal No opening balance as on {yesterday_str} = {seal_op_data_count}"
        )
        seal_no_closing = f"Seal No closing balance for {to_str} = {seal_cl_data_count}"
        seal_no_available = (
            f"Seal No available balance for {today_str} = {available_seal_data_count}"
        )

        main_data = {
            "seal_no_opening": seal_no_opening,
            "seal_no_closing": seal_no_closing,
            "seal_no_available": seal_no_available,
            "seal_stock_data_list": list(available_seal_data),
            "outward_data_list": outward_data_list,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def inward_edi_tracking_row_data(data_object, connection=None, is_excel_edi=False):
    try:
        data = {}
        if connection is not None:
            if data_object.is_email_sent:
                if (
                    EdiMailTracker.objects.using(connection)
                    .filter(in_data_id=data_object.pk, is_excel_edi=is_excel_edi)
                    .exists()
                ):
                    tracked_object = EdiMailTracker.objects.using(connection).get(
                        in_data_id=data_object.pk, is_excel_edi=is_excel_edi
                    )
                    tracked_data = tracked_object.get_tracked_detail()
                    data["line"] = tracked_data["client"]
                    data["client"] = data_object.container.client.name
                    data["in_date"] = tracked_data["process_date"]
                    data["container_no"] = tracked_data["container_no"]
                    data["size"] = tracked_data["size"]
                    data["type"] = tracked_data["type"]
                    data["site"] = tracked_data["site"]
                    data["email_sent"] = "YES"
                    data["in_email_date"] = tracked_data["email_date"]
                    if tracked_data["is_auto"] is True:
                        data["auto_email"] = "YES"
                    else:
                        data["auto_email"] = "NO"
                    data["time_diff"] = tracked_data["time_diff"]
                else:
                    container_data = data_object.container.get_container()
                    gate_in_data = data_object.gate_in.get_gate_in()
                    data["line"] = data_object.container.client.ref_code
                    data["client"] = data_object.container.client.name
                    data["in_date"] = gate_in_data["in_date"]
                    data["container_no"] = container_data["container_no"]
                    data["size"] = container_data["size"]
                    data["type"] = container_data["type"]
                    data["site"] = container_data["site"]
                    data["email_sent"] = "YES"
                    data["in_email_date"] = ""
                    data["auto_email"] = ""
                    data["time_diff"] = ""
            else:
                container_data = data_object.container.get_container()
                gate_in_data = data_object.gate_in.get_gate_in()
                data["line"] = data_object.container.client.ref_code
                data["client"] = data_object.container.client.name
                data["in_date"] = gate_in_data["in_date"]
                data["container_no"] = container_data["container_no"]
                data["size"] = container_data["size"]
                data["type"] = container_data["type"]
                data["site"] = container_data["site"]
                data["email_sent"] = "NO"
                data["in_email_date"] = ""
                data["auto_email"] = ""
                data["time_diff"] = ""
            return data
        else:
            if data_object.is_email_sent:
                if EdiMailTracker.objects.filter(in_data_id=data_object.pk, is_excel_edi=is_excel_edi).exists():
                    tracked_object = EdiMailTracker.objects.get(
                        in_data_id=data_object.pk, is_excel_edi=is_excel_edi
                    )
                    tracked_data = tracked_object.get_tracked_detail()
                    data["line"] = tracked_data["client"]
                    data["client"] = data_object.container.client.name
                    data["in_date"] = tracked_data["process_date"]
                    data["container_no"] = tracked_data["container_no"]
                    data["size"] = tracked_data["size"]
                    data["type"] = tracked_data["type"]
                    data["site"] = tracked_data["site"]
                    data["email_sent"] = "YES"
                    data["in_email_date"] = tracked_data["email_date"]
                    if tracked_data["is_auto"] is True:
                        data["auto_email"] = "YES"
                    else:
                        data["auto_email"] = "NO"
                    data["time_diff"] = tracked_data["time_diff"]
                else:
                    container_data = data_object.container.get_container()
                    gate_in_data = data_object.gate_in.get_gate_in()
                    data["line"] = data_object.container.client.ref_code
                    data["client"] = data_object.container.client.name
                    data["in_date"] = gate_in_data["in_date"]
                    data["container_no"] = container_data["container_no"]
                    data["size"] = container_data["size"]
                    data["type"] = container_data["type"]
                    data["site"] = container_data["site"]
                    data["email_sent"] = "YES"
                    data["in_email_date"] = ""
                    data["auto_email"] = ""
                    data["time_diff"] = ""
            else:
                container_data = data_object.container.get_container()
                gate_in_data = data_object.gate_in.get_gate_in()
                data["line"] = data_object.container.client.ref_code
                data["client"] = data_object.container.client.name
                data["in_date"] = gate_in_data["in_date"]
                data["container_no"] = container_data["container_no"]
                data["size"] = container_data["size"]
                data["type"] = container_data["type"]
                data["site"] = container_data["site"]
                data["email_sent"] = "NO"
                data["in_email_date"] = ""
                data["auto_email"] = ""
                data["time_diff"] = ""
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def inward_edi_tracking_main_data(data_object_list, connection=None, is_excel_edi=False):
    try:
        count = 0
        data = []
        for obj in data_object_list:
            count += 1
            each_data = inward_edi_tracking_row_data(obj, connection=connection, is_excel_edi=is_excel_edi)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        line = [each.get("line") for each in data]
        client = [each.get("client") for each in data]
        in_date = [each.get("in_date") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("size") for each in data]
        container_type = [each.get("type") for each in data]
        site = [each.get("site") for each in data]
        email_sent = [each.get("email_sent") for each in data]
        in_email_date = [each.get("in_email_date") for each in data]
        auto_email = [each.get("auto_email") for each in data]
        time_diff = [each.get("time_diff") for each in data]

        df_data = [
            [
                sl_no[i],
                line[i],
                client[i],
                in_date[i],
                container_no[i],
                container_size[i],
                container_type[i],
                site[i],
                email_sent[i],
                in_email_date[i],
                auto_email[i],
                time_diff[i],
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


def outward_edi_tracking_row_data(data_object, connection=None, is_excel_edi=False):
    try:
        data = {}
        if connection is not None:
            if data_object.is_email_sent:
                if (
                    EdiMailTracker.objects.using(connection)
                    .filter(out_data_id=data_object.pk, is_excel_edi=is_excel_edi)
                    .exists()
                ):
                    tracked_object = EdiMailTracker.objects.using(connection).get(
                        out_data_id=data_object.pk, is_excel_edi=is_excel_edi
                    )
                    tracked_data = tracked_object.get_tracked_detail()
                    data["line"] = tracked_data["client"]
                    data["client"] = data_object.container.client.name
                    data["out_date"] = tracked_data["process_date"]
                    data["container_no"] = tracked_data["container_no"]
                    data["size"] = tracked_data["size"]
                    data["type"] = tracked_data["type"]
                    data["site"] = tracked_data["site"]
                    data["email_sent"] = "YES"
                    data["out_email_date"] = tracked_data["email_date"]
                    if tracked_data["is_auto"] is True:
                        data["auto_email"] = "YES"
                    else:
                        data["auto_email"] = "NO"
                    data["time_diff"] = tracked_data["time_diff"]
                else:
                    container_data = data_object.container.get_container()
                    gate_out_data = data_object.gate_out.get_gate_out()
                    data["line"] = data_object.container.client.ref_code
                    data["client"] = data_object.container.client.name
                    data["out_date"] = gate_out_data["out_date"]
                    data["container_no"] = container_data["container_no"]
                    data["size"] = container_data["size"]
                    data["type"] = container_data["type"]
                    data["site"] = container_data["site"]
                    data["email_sent"] = "YES"
                    data["out_email_date"] = ""
                    data["auto_email"] = ""
                    data["time_diff"] = ""
            else:
                container_data = data_object.container.get_container()
                gate_out_data = data_object.gate_out.get_gate_out()
                data["line"] = data_object.container.client.ref_code
                data["client"] = data_object.container.client.name
                data["out_date"] = gate_out_data["out_date"]
                data["container_no"] = container_data["container_no"]
                data["size"] = container_data["size"]
                data["type"] = container_data["type"]
                data["site"] = container_data["site"]
                data["email_sent"] = "NO"
                data["out_email_date"] = ""
                data["auto_email"] = ""
                data["time_diff"] = ""
            return data
        else:
            if data_object.is_email_sent:
                if EdiMailTracker.objects.filter(out_data_id=data_object.pk, is_excel_edi=is_excel_edi).exists():
                    tracked_object = EdiMailTracker.objects.get(
                        out_data_id=data_object.pk, is_excel_edi=is_excel_edi
                    )
                    tracked_data = tracked_object.get_tracked_detail()
                    data["line"] = tracked_data["client"]
                    data["client"] = data_object.container.client.name
                    data["out_date"] = tracked_data["process_date"]
                    data["container_no"] = tracked_data["container_no"]
                    data["size"] = tracked_data["size"]
                    data["type"] = tracked_data["type"]
                    data["site"] = tracked_data["site"]
                    data["email_sent"] = "YES"
                    data["out_email_date"] = tracked_data["email_date"]
                    if tracked_data["is_auto"] is True:
                        data["auto_email"] = "YES"
                    else:
                        data["auto_email"] = "NO"
                    data["time_diff"] = tracked_data["time_diff"]
                else:
                    container_data = data_object.container.get_container()
                    gate_out_data = data_object.gate_out.get_gate_out()
                    data["line"] = data_object.container.client.ref_code
                    data["client"] = data_object.container.client.name
                    data["out_date"] = gate_out_data["out_date"]
                    data["container_no"] = container_data["container_no"]
                    data["size"] = container_data["size"]
                    data["type"] = container_data["type"]
                    data["site"] = container_data["site"]
                    data["email_sent"] = "YES"
                    data["out_email_date"] = ""
                    data["auto_email"] = ""
                    data["time_diff"] = ""
            else:
                container_data = data_object.container.get_container()
                gate_out_data = data_object.gate_out.get_gate_out()
                data["line"] = data_object.container.client.ref_code
                data["client"] = data_object.container.client.name
                data["out_date"] = gate_out_data["out_date"]
                data["container_no"] = container_data["container_no"]
                data["size"] = container_data["size"]
                data["type"] = container_data["type"]
                data["site"] = container_data["site"]
                data["email_sent"] = "NO"
                data["out_email_date"] = ""
                data["auto_email"] = ""
                data["time_diff"] = ""
            return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def outward_edi_tracking_main_data(data_object_list, connection=None, is_excel_edi=False):
    try:
        count = 0
        data = []
        for obj in data_object_list:
            count += 1
            each_data = outward_edi_tracking_row_data(obj, connection=connection, is_excel_edi=is_excel_edi)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        line = [each.get("line") for each in data]
        client = [each.get("client") for each in data]
        out_date = [each.get("out_date") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("size") for each in data]
        container_type = [each.get("type") for each in data]
        site = [each.get("site") for each in data]
        email_sent = [each.get("email_sent") for each in data]
        out_email_date = [each.get("out_email_date") for each in data]
        auto_email = [each.get("auto_email") for each in data]
        time_diff = [each.get("time_diff") for each in data]

        df_data = [
            [
                sl_no[i],
                line[i],
                client[i],
                out_date[i],
                container_no[i],
                container_size[i],
                container_type[i],
                site[i],
                email_sent[i],
                out_email_date[i],
                auto_email[i],
                time_diff[i],
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


def hemck_hemchc_summary_main_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site, line
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time

        dv_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        dv_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="DV",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        dv_20_condition_ok_count = int(dv_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_40_condition_ok_count = int(dv_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        dv_20_empty_allotment = int(dv_20_data.filter(status="Empty Alloted").count())
        dv_40_empty_allotment = int(dv_40_data.filter(status="Empty Alloted").count())
        dv_20_allotment = int(
            len([each for each in list(dv_20_data) if not each.allotment_date is None])
        )
        dv_40_allotment = int(
            len([each for each in list(dv_40_data) if not each.allotment_date is None])
        )
        dv_20_estimate_pending = int(
            dv_20_data.filter(status="Estimate Pending").count()
        )
        dv_40_estimate_pending = int(
            dv_40_data.filter(status="Estimate Pending").count()
        )
        dv_20_approval_pending = int(
            dv_20_data.filter(status="Approval Pending").count()
        )
        dv_40_approval_pending = int(
            dv_40_data.filter(status="Approval Pending").count()
        )
        dv_20_approved = int(dv_20_data.filter(status="Approved").count())
        dv_40_approved = int(dv_40_data.filter(status="Approved").count())
        dv_20_under_repairing = int(dv_20_data.filter(status="Under Repairing").count())
        dv_40_under_repairing = int(dv_40_data.filter(status="Under Repairing").count())
        dv_20_total = (
            dv_20_condition_ok_count
            + dv_20_empty_allotment
            + dv_20_allotment
            + dv_20_estimate_pending
            + dv_20_approval_pending
            + dv_20_approved
            + dv_20_under_repairing
        )
        dv_20_tues = dv_20_total * 1
        dv_40_total = (
            dv_40_condition_ok_count
            + dv_40_empty_allotment
            + dv_40_allotment
            + dv_40_estimate_pending
            + dv_40_approval_pending
            + dv_40_approved
            + dv_40_under_repairing
        )
        dv_40_tues = dv_40_total * 2
        dv_20_sale = 0
        dv_40_sale = 0
        dv_20_list = [
            dv_20_condition_ok_count,
            dv_20_empty_allotment,
            dv_20_allotment,
            dv_20_estimate_pending,
            dv_20_approval_pending,
            dv_20_approved,
            dv_20_under_repairing,
            dv_20_sale,
            dv_20_total,
            dv_20_tues,
        ]
        dv_40_list = [
            dv_40_condition_ok_count,
            dv_40_empty_allotment,
            dv_40_allotment,
            dv_40_estimate_pending,
            dv_40_approval_pending,
            dv_40_approved,
            dv_40_under_repairing,
            dv_20_sale,
            dv_40_total,
            dv_40_tues,
        ]

        std_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        std_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="STD",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        std_20_condition_ok_count = int(std_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_40_condition_ok_count = int(std_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        std_20_empty_allotment = int(std_20_data.filter(status="Empty Alloted").count())
        std_40_empty_allotment = int(std_40_data.filter(status="Empty Alloted").count())
        std_20_allotment = int(
            len([each for each in list(std_20_data) if not each.allotment_date is None])
        )
        std_40_allotment = int(
            len([each for each in list(std_40_data) if not each.allotment_date is None])
        )
        std_20_estimate_pending = int(
            std_20_data.filter(status="Estimate Pending").count()
        )
        std_40_estimate_pending = int(
            std_40_data.filter(status="Estimate Pending").count()
        )
        std_20_approval_pending = int(
            std_20_data.filter(status="Approval Pending").count()
        )
        std_40_approval_pending = int(
            std_40_data.filter(status="Approval Pending").count()
        )
        std_20_approved = int(std_20_data.filter(status="Approved").count())
        std_40_approved = int(std_40_data.filter(status="Approved").count())
        std_20_under_repairing = int(
            std_20_data.filter(status="Under Repairing").count()
        )
        std_40_under_repairing = int(
            std_40_data.filter(status="Under Repairing").count()
        )
        std_20_total = (
            std_20_condition_ok_count
            + std_20_empty_allotment
            + std_20_allotment
            + std_20_estimate_pending
            + std_20_approval_pending
            + std_20_approved
            + std_20_under_repairing
        )
        std_20_tues = std_20_total * 1
        std_40_total = (
            std_40_condition_ok_count
            + std_40_empty_allotment
            + std_40_allotment
            + std_40_estimate_pending
            + std_40_approval_pending
            + std_40_approved
            + std_40_under_repairing
        )
        std_40_tues = std_40_total * 2
        std_20_sale = 0
        std_40_sale = 0
        std_20_list = [
            std_20_condition_ok_count,
            std_20_empty_allotment,
            std_20_allotment,
            std_20_estimate_pending,
            std_20_approval_pending,
            std_20_approved,
            std_20_under_repairing,
            std_20_sale,
            std_20_total,
            std_20_tues,
        ]
        std_40_list = [
            std_40_condition_ok_count,
            std_40_empty_allotment,
            std_40_allotment,
            std_40_estimate_pending,
            std_40_approval_pending,
            std_40_approved,
            std_40_under_repairing,
            std_20_sale,
            std_40_total,
            std_40_tues,
        ]

        hc_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        hc_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="H/C",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        hc_20_condition_ok_count = int(hc_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_40_condition_ok_count = int(hc_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        hc_20_empty_allotment = int(hc_20_data.filter(status="Empty Alloted").count())
        hc_40_empty_allotment = int(hc_40_data.filter(status="Empty Alloted").count())
        hc_20_allotment = int(
            len([each for each in list(hc_20_data) if not each.allotment_date is None])
        )
        hc_40_allotment = int(
            len([each for each in list(hc_40_data) if not each.allotment_date is None])
        )
        hc_20_estimate_pending = int(
            hc_20_data.filter(status="Estimate Pending").count()
        )
        hc_40_estimate_pending = int(
            hc_40_data.filter(status="Estimate Pending").count()
        )
        hc_20_approval_pending = int(
            hc_20_data.filter(status="Approval Pending").count()
        )
        hc_40_approval_pending = int(
            hc_40_data.filter(status="Approval Pending").count()
        )
        hc_20_approved = int(hc_20_data.filter(status="Approved").count())
        hc_40_approved = int(hc_40_data.filter(status="Approved").count())
        hc_20_under_repairing = int(hc_20_data.filter(status="Under Repairing").count())
        hc_40_under_repairing = int(hc_40_data.filter(status="Under Repairing").count())
        hc_20_total = (
            hc_20_condition_ok_count
            + hc_20_empty_allotment
            + hc_20_allotment
            + hc_20_estimate_pending
            + hc_20_approval_pending
            + hc_20_approved
            + hc_20_under_repairing
        )
        hc_20_tues = hc_20_total * 1
        hc_40_total = (
            hc_40_condition_ok_count
            + hc_40_empty_allotment
            + hc_40_allotment
            + hc_40_estimate_pending
            + hc_40_approval_pending
            + hc_40_approved
            + hc_40_under_repairing
        )
        hc_40_tues = hc_40_total * 2
        hc_20_sale = 0
        hc_40_sale = 0
        hc_20_list = [
            hc_20_condition_ok_count,
            hc_20_empty_allotment,
            hc_20_allotment,
            hc_20_estimate_pending,
            hc_20_approval_pending,
            hc_20_approved,
            hc_20_under_repairing,
            hc_20_sale,
            hc_20_total,
            hc_20_tues,
        ]
        hc_40_list = [
            hc_40_condition_ok_count,
            hc_40_empty_allotment,
            hc_40_allotment,
            hc_40_estimate_pending,
            hc_40_approval_pending,
            hc_40_approved,
            hc_40_under_repairing,
            hc_40_sale,
            hc_40_total,
            hc_40_tues,
        ]

        ot_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        ot_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="O/T",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        ot_20_condition_ok_count = int(ot_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_40_condition_ok_count = int(ot_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        ot_20_empty_allotment = int(ot_20_data.filter(status="Empty Alloted").count())
        ot_40_empty_allotment = int(ot_40_data.filter(status="Empty Alloted").count())
        ot_20_allotment = int(
            len([each for each in list(ot_20_data) if not each.allotment_date is None])
        )
        ot_40_allotment = int(
            len([each for each in list(ot_40_data) if not each.allotment_date is None])
        )
        ot_20_estimate_pending = int(
            ot_20_data.filter(status="Estimate Pending").count()
        )
        ot_40_estimate_pending = int(
            ot_40_data.filter(status="Estimate Pending").count()
        )
        ot_20_approval_pending = int(
            ot_20_data.filter(status="Approval Pending").count()
        )
        ot_40_approval_pending = int(
            ot_40_data.filter(status="Approval Pending").count()
        )
        ot_20_approved = int(ot_20_data.filter(status="Approved").count())
        ot_40_approved = int(ot_40_data.filter(status="Approved").count())
        ot_20_under_repairing = int(ot_20_data.filter(status="Under Repairing").count())
        ot_40_under_repairing = int(ot_40_data.filter(status="Under Repairing").count())
        ot_20_total = (
            ot_20_condition_ok_count
            + ot_20_empty_allotment
            + ot_20_allotment
            + ot_20_estimate_pending
            + ot_20_approval_pending
            + ot_20_approved
            + ot_20_under_repairing
        )
        ot_20_tues = ot_20_total * 1
        ot_40_total = (
            ot_40_condition_ok_count
            + ot_40_empty_allotment
            + ot_40_allotment
            + ot_40_estimate_pending
            + ot_40_approval_pending
            + ot_40_approved
            + ot_40_under_repairing
        )
        ot_40_tues = ot_40_total * 2
        ot_20_sale = 0
        ot_40_sale = 0
        ot_20_list = [
            ot_20_condition_ok_count,
            ot_20_empty_allotment,
            ot_20_allotment,
            ot_20_estimate_pending,
            ot_20_approval_pending,
            ot_20_approved,
            ot_20_under_repairing,
            ot_20_sale,
            ot_20_total,
            ot_20_tues,
        ]
        ot_40_list = [
            ot_40_condition_ok_count,
            ot_40_empty_allotment,
            ot_40_allotment,
            ot_40_estimate_pending,
            ot_40_approval_pending,
            ot_40_approved,
            ot_40_under_repairing,
            ot_40_sale,
            ot_40_total,
            ot_40_tues,
        ]

        fr_20_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="20",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        fr_40_data = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).filter(
            container__size__name="40",
            container__type__name="FR",
            container__location=location,
            container__site=site,
            container_status="IN",
            container__client__ref_code=line,
        )
        fr_20_condition_ok_count = int(fr_20_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_40_condition_ok_count = int(fr_40_data.filter(status__in=["Available", "Without_Repair_Available"]).count())
        fr_20_empty_allotment = int(fr_20_data.filter(status="Empty Alloted").count())
        fr_40_empty_allotment = int(fr_40_data.filter(status="Empty Alloted").count())
        fr_20_allotment = int(
            len([each for each in list(fr_20_data) if not each.allotment_date is None])
        )
        fr_40_allotment = int(
            len([each for each in list(fr_40_data) if not each.allotment_date is None])
        )
        fr_20_estimate_pending = int(
            fr_20_data.filter(status="Estimate Pending").count()
        )
        fr_40_estimate_pending = int(
            fr_40_data.filter(status="Estimate Pending").count()
        )
        fr_20_approval_pending = int(
            fr_20_data.filter(status="Approval Pending").count()
        )
        fr_40_approval_pending = int(
            fr_40_data.filter(status="Approval Pending").count()
        )
        fr_20_approved = int(fr_20_data.filter(status="Approved").count())
        fr_40_approved = int(fr_40_data.filter(status="Approved").count())
        fr_20_under_repairing = int(fr_20_data.filter(status="Under Repairing").count())
        fr_40_under_repairing = int(fr_40_data.filter(status="Under Repairing").count())
        fr_20_total = (
            fr_20_condition_ok_count
            + fr_20_empty_allotment
            + fr_20_allotment
            + fr_20_estimate_pending
            + fr_20_approval_pending
            + fr_20_approved
            + fr_20_under_repairing
        )
        fr_20_tues = fr_20_total * 1
        fr_40_total = (
            fr_40_condition_ok_count
            + fr_40_empty_allotment
            + fr_40_allotment
            + fr_40_estimate_pending
            + fr_40_approval_pending
            + fr_40_approved
            + fr_40_under_repairing
        )
        fr_40_tues = fr_40_total * 2
        fr_20_sale = 0
        fr_40_sale = 0
        fr_20_list = [
            fr_20_condition_ok_count,
            fr_20_empty_allotment,
            fr_20_allotment,
            fr_20_estimate_pending,
            fr_20_approval_pending,
            fr_20_approved,
            fr_20_under_repairing,
            fr_20_sale,
            fr_20_total,
            fr_20_tues,
        ]
        fr_40_list = [
            fr_40_condition_ok_count,
            fr_40_empty_allotment,
            fr_40_allotment,
            fr_40_estimate_pending,
            fr_40_approval_pending,
            fr_40_approved,
            fr_40_under_repairing,
            fr_40_sale,
            fr_40_total,
            fr_40_tues,
        ]

        condition_ok_total = (
            dv_20_condition_ok_count
            + dv_40_condition_ok_count
            + std_20_condition_ok_count
            + std_40_condition_ok_count
            + hc_20_condition_ok_count
            + hc_40_condition_ok_count
            + ot_20_condition_ok_count
            + ot_40_condition_ok_count
            + fr_20_condition_ok_count
            + fr_40_condition_ok_count
        )

        empty_allotment_total = (
            dv_20_empty_allotment
            + dv_40_empty_allotment
            + std_20_empty_allotment
            + std_40_empty_allotment
            + hc_20_empty_allotment
            + hc_40_empty_allotment
            + ot_20_empty_allotment
            + ot_40_empty_allotment
            + fr_20_empty_allotment
            + fr_40_empty_allotment
        )

        allotment_total = (
            dv_20_allotment
            + dv_40_allotment
            + std_20_allotment
            + std_40_allotment
            + hc_20_allotment
            + hc_40_allotment
            + ot_20_allotment
            + ot_40_allotment
            + fr_20_allotment
            + fr_40_allotment
        )

        estimate_pending_total = (
            dv_20_estimate_pending
            + dv_40_estimate_pending
            + std_20_estimate_pending
            + std_40_estimate_pending
            + hc_20_estimate_pending
            + hc_40_estimate_pending
            + ot_20_estimate_pending
            + ot_40_estimate_pending
            + fr_20_estimate_pending
            + fr_40_estimate_pending
        )

        approval_pending_total = (
            dv_20_approval_pending
            + dv_40_approval_pending
            + std_20_approval_pending
            + std_40_approval_pending
            + hc_20_approval_pending
            + hc_40_approval_pending
            + ot_20_approval_pending
            + ot_40_approval_pending
            + fr_20_approval_pending
            + fr_40_approval_pending
        )

        approved_total = (
            dv_20_approved
            + dv_40_approved
            + std_20_approved
            + std_40_approved
            + hc_20_approved
            + hc_40_approved
            + ot_20_approved
            + ot_40_approved
            + fr_20_approved
            + fr_40_approved
        )

        under_repairing_total = (
            dv_20_under_repairing
            + dv_40_under_repairing
            + std_20_under_repairing
            + std_40_under_repairing
            + hc_20_under_repairing
            + hc_40_under_repairing
            + ot_20_under_repairing
            + ot_40_under_repairing
            + fr_20_under_repairing
            + fr_40_under_repairing
        )

        sale_total = (
            dv_20_sale
            + dv_40_sale
            + std_20_sale
            + std_40_sale
            + hc_20_sale
            + hc_40_sale
            + ot_20_sale
            + ot_40_sale
            + fr_20_sale
            + fr_40_sale
        )

        all_total = (
            dv_20_total
            + dv_40_total
            + std_20_total
            + std_40_total
            + hc_20_total
            + hc_40_total
            + ot_20_total
            + ot_40_total
            + fr_20_total
            + fr_40_total
        )

        tues_total = (
            dv_20_tues
            + dv_40_tues
            + std_20_tues
            + std_40_tues
            + hc_20_tues
            + hc_40_tues
            + ot_20_tues
            + ot_40_tues
            + fr_20_tues
            + fr_40_tues
        )

        total_list = [
            condition_ok_total,
            empty_allotment_total,
            allotment_total,
            estimate_pending_total,
            approval_pending_total,
            approved_total,
            under_repairing_total,
            sale_total,
            all_total,
            tues_total,
        ]

        import_total_list = [
            "Ok Containers",
            "Empty Alloted",
            "Alloted",
            "Awaiting Est",
            "Awaiting Authorisation",
            "Authorised",
            "Under Repair",
            "Sale",
            "TOTAL",
            "TUES",
        ]

        remark_list = ["", "", "", "", "", "", "", "", "", ""]

        df_data1 = [
            [
                import_total_list[i],
                dv_20_list[i],
                dv_40_list[i],
                std_20_list[i],
                std_40_list[i],
                hc_20_list[i],
                hc_40_list[i],
                ot_20_list[i],
                ot_40_list[i],
                fr_20_list[i],
                fr_40_list[i],
                total_list[i],
                remark_list[i],
            ]
            for i in range(len(import_total_list))
        ]

        dv2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv2_op_data_count = dv2_in_data_op_count - dv2_out_data_op_count

        dv2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count

        dv2_tues = dv2_cl_bal * 1

        dv2_list = [
            dv2_op_data_count,
            dv2_in_data_count,
            dv2_out_data_count,
            dv2_cl_bal,
            dv2_tues,
        ]

        dv4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        dv4_op_data_count = dv4_in_data_op_count - dv4_out_data_op_count

        dv4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="DV",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count

        dv4_tues = dv4_cl_bal * 2

        dv4_list = [
            dv4_op_data_count,
            dv4_in_data_count,
            dv4_out_data_count,
            dv4_cl_bal,
            dv4_tues,
        ]

        std2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std2_op_data_count = std2_in_data_op_count - std2_out_data_op_count

        std2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count

        std2_tues = std2_cl_bal * 1

        std2_list = [
            std2_op_data_count,
            std2_in_data_count,
            std2_out_data_count,
            std2_cl_bal,
            std2_tues,
        ]

        std4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        std4_op_data_count = std4_in_data_op_count - std4_out_data_op_count

        std4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="STD",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count

        std4_tues = std4_cl_bal * 2

        std4_list = [
            std4_op_data_count,
            std4_in_data_count,
            std4_out_data_count,
            std4_cl_bal,
            std4_tues,
        ]

        fr2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr2_op_data_count = fr2_in_data_op_count - fr2_out_data_op_count

        fr2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count

        fr2_tues = fr2_cl_bal * 1

        fr2_list = [
            fr2_op_data_count,
            fr2_in_data_count,
            fr2_out_data_count,
            fr2_cl_bal,
            fr2_tues,
        ]

        fr4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        fr4_op_data_count = fr4_in_data_op_count - fr4_out_data_op_count

        fr4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="FR",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count

        fr4_tues = fr4_cl_bal * 2

        fr4_list = [
            fr4_op_data_count,
            fr4_in_data_count,
            fr4_out_data_count,
            fr4_cl_bal,
            fr4_tues,
        ]

        hc2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc2_op_data_count = hc2_in_data_op_count - hc2_out_data_op_count

        hc2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count

        hc2_tues = hc2_cl_bal * 1

        hc2_list = [
            hc2_op_data_count,
            hc2_in_data_count,
            hc2_out_data_count,
            hc2_cl_bal,
            hc2_tues,
        ]

        hc4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        hc4_op_data_count = hc4_in_data_op_count - hc4_out_data_op_count

        hc4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="H/C",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count

        hc4_tues = hc4_cl_bal * 2

        hc4_list = [
            hc4_op_data_count,
            hc4_in_data_count,
            hc4_out_data_count,
            hc4_cl_bal,
            hc4_tues,
        ]

        ot2_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot2_op_data_count = ot2_in_data_op_count - ot2_out_data_op_count

        ot2_in_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot2_out_data_count = int(
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
                container__size__name="20",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count

        ot2_tues = ot2_cl_bal * 1

        ot2_list = [
            ot2_op_data_count,
            ot2_in_data_count,
            ot2_out_data_count,
            ot2_cl_bal,
            ot2_tues,
        ]

        ot4_in_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_out_data_op_count = int(
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
                date__lte=yesterday_for_from_date_time,
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )
        ot4_op_data_count = ot4_in_data_op_count - ot4_out_data_op_count

        ot4_in_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot4_out_data_count = int(
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
                container__size__name="40",
                container__type__name="O/T",
                container__location=location,
                container__site=site,
                container__client__ref_code=line,
            )
            .count()
        )

        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count

        ot4_tues = ot4_cl_bal * 2

        ot4_list = [
            ot4_op_data_count,
            ot4_in_data_count,
            ot4_out_data_count,
            ot4_cl_bal,
            ot4_tues,
        ]

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
        )
        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
        )
        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
        )
        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
        )

        tues_total = (
            dv2_tues
            + dv4_tues
            + std2_tues
            + std4_tues
            + fr2_tues
            + fr4_tues
            + hc2_tues
            + hc4_tues
            + ot2_tues
            + ot4_tues
        )

        total_list = [
            op_bal_total,
            in_qty_total,
            out_qty_total,
            cl_bal_total,
            tues_total,
        ]

        stat_list = ["PRV. BAL.", "IN", "OUT", "ON DATE POSITION", "TUES"]

        df_data2 = [
            [
                stat_list[i],
                dv2_list[i],
                dv4_list[i],
                std2_list[i],
                std4_list[i],
                hc2_list[i],
                hc4_list[i],
                ot2_list[i],
                ot4_list[i],
                fr2_list[i],
                fr4_list[i],
                total_list[i],
            ]
            for i in range(len(stat_list))
        ]

        condition_ok_20_total = (
            dv_20_condition_ok_count
            + std_20_condition_ok_count
            + hc_20_condition_ok_count
            + ot_20_condition_ok_count
            + fr_20_condition_ok_count
        )
        condition_ok_20_tues = condition_ok_20_total * 1

        condition_ok_40_total = (
            dv_40_condition_ok_count
            + std_40_condition_ok_count
            + hc_40_condition_ok_count
            + ot_40_condition_ok_count
            + fr_40_condition_ok_count
        )
        condition_ok_40_tues = condition_ok_40_total * 2

        condition_ok_total = condition_ok_20_total + condition_ok_40_total
        condition_ok_total_tues = condition_ok_20_tues + condition_ok_40_tues

        stat = ["TOTAL", "TUES"]
        ready_condition_20 = [condition_ok_20_total, condition_ok_20_tues]
        ready_condition_40 = [condition_ok_40_total, condition_ok_40_tues]
        ready_condition_total = [condition_ok_total, condition_ok_total_tues]

        df_data3 = [
            [
                stat[i],
                ready_condition_20[i],
                ready_condition_40[i],
                ready_condition_total[i],
            ]
            for i in range(len(stat))
        ]

        size = ["HEAVY DUTY", "NORMAL"]
        dv_20 = [0, 0]
        dv_40 = [0, 0]
        std_20 = [0, 0]
        std_40 = [0, 0]
        hc_20 = [0, 0]
        hc_40 = [0, 0]
        ot_20 = [0, 0]
        ot_40 = [0, 0]
        fr_20 = [0, 0]
        fr_40 = [0, 0]
        total = [0, 0]

        df_data4 = [
            [
                size[i],
                dv_20[i],
                dv_40[i],
                std_20[i],
                std_40[i],
                hc_20[i],
                hc_40[i],
                ot_20[i],
                ot_40[i],
                fr_20[i],
                fr_40[i],
                total[i],
            ]
            for i in range(len(size))
        ]

        return [df_data1, df_data2, df_data3, df_data4]

    except Exception as e:
        return [[[]], [[]], [[]], [[]]]


def hemck_hemchc_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = data_object.container.client.ref_code
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["in_date"] = gate_in_date
        data["in_time"] = gate_in_time
        data["account"] = container_data["client"]
        data["bl_no"] = gate_in_data["bl_no"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%b/%Y")
            data["mfg_date"] = manufacturing_date_str
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["cargo"] = gate_in_data["export_cargo_type"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hemck_hemchc_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = hemck_hemchc_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        account = [each.get("account") for each in data]
        bl_no = [each.get("bl_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        cargo = [each.get("cargo") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                in_date[i],
                in_time[i],
                account[i],
                bl_no[i],
                transporter[i],
                vehicle_no[i],
                mfg_date[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                cargo[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 15)])
        return main_data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 15)]]
        return main_data


def hemck_hemchc_outward_row_data(data_object):
    try:
        data = {}
        container_record = ContainerInOutRecord.objects.get(
            container=data_object.container, out_data=data_object
        )
        in_data_object = container_record.in_data
        gate_in_data = in_data_object.gate_in.get_gate_in()
        stock_data_object = ContainerStock.objects.select_related(
            "container",
            "container__client",
            "container__type",
            "container__size",
            "container__location",
            "container__site",
            "gate_in",
            "gate_out",
        ).get(
            container=data_object.container,
            gate_in=in_data_object.gate_in,
            container_status="OUT",
        )
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = data_object.container.client.ref_code
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d-%b-%Y")
        data["in_date"] = in_date_str
        if stock_data_object.approved_in_date_time is None:
            data["approval_date"] = ""
        else:
            approved_date_str = stock_data_object.approved_in_date_time.date().strftime(
                "%d-%b-%Y"
            )
            data["approval_date"] = approved_date_str
        if stock_data_object.available_date is None:
            data["available_date"] = ""
        else:
            available_date_str = stock_data_object.available_date.strftime("%d-%b-%Y")
            data["available_date"] = available_date_str
        if stock_data_object.empty_allotment_date is None:
            data["empty_allotment_date"] = ""
        else:
            empty_allotment_date_str = stock_data_object.empty_allotment_date.strftime(
                "%d-%b-%Y"
            )
            data["empty_allotment_date"] = empty_allotment_date_str
        if stock_data_object.allotment_date is None:
            data["allotment_date"] = ""
        else:
            allotment_date_str = stock_data_object.allotment_date.strftime("%d-%b-%Y")
            data["allotment_date"] = allotment_date_str
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%d-%b-%Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        gate_out_date = out_date_str
        gate_out_time = out_time_str
        data["out_date"] = gate_out_date
        data["out_time"] = gate_out_time
        data["transporter"] = gate_out_data["transporter_name"]
        data["shipper"] = gate_out_data["shipper"]
        data["do_no"] = gate_out_data["booking_no"]
        data["vehicle_no"] = gate_out_data["vehicle_no"]
        data["status"] = "OUT"
        data["otl"] = gate_out_data["seal_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hemck_hemchc_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = hemck_hemchc_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        in_date = [each.get("in_date") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        available_date = [each.get("available_date") for each in data]
        empty_allotment_date = [each.get("empty_allotment_date") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        out_date = [each.get("out_date") for each in data]
        out_time = [each.get("out_time") for each in data]
        transporter = [each.get("transporter") for each in data]
        shipper = [each.get("shipper") for each in data]
        do_no = [each.get("do_no") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        status = [each.get("status") for each in data]
        otl = [each.get("otl") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                in_date[i],
                approval_date[i],
                available_date[i],
                empty_allotment_date[i],
                allotment_date[i],
                out_date[i],
                out_time[i],
                transporter[i],
                shipper[i],
                do_no[i],
                vehicle_no[i],
                status[i],
                otl[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 15)])
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 15)]]
        return main_data


def hemck_hemchc_inventory_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["size"] = container_data["size"] + container_data["type"]
        data["line"] = data_object.container.client.ref_code
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%d/%b/%Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str
        gate_in_time = in_time_str
        data["in_date"] = gate_in_date
        data["in_time"] = gate_in_time
        data["account"] = container_data["client"]
        data["bl_no"] = gate_in_data["bl_no"]
        data["transporter"] = gate_in_data["transporter_name"]
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%b/%Y")
            data["mfg_date"] = manufacturing_date_str
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["hd_nr"] = ""
        data["cargo"] = gate_in_data["export_cargo_type"]
        if data_object.survey_pending_in_date_time is None:
            data["survey_pending_date"] = ""
        else:
            survey_pending_date_str = (
                data_object.survey_pending_in_date_time.date().strftime("%d-%b-%Y")
            )
            data["survey_pending_date"] = survey_pending_date_str
        if data_object.estimate_pending_in_date_time is None:
            data["estimate_pending_date"] = ""
        else:
            estimate_pending_date_str = (
                data_object.estimate_pending_in_date_time.date().strftime("%d-%b-%Y")
            )
            data["estimate_pending_date"] = estimate_pending_date_str
        data["estimate_no"] = ""
        data["damage_grade"] = gate_in_data["condition"]
        data["man_hrs"] = ""
        data["lbr_cost"] = ""
        data["mtrl_cost"] = ""
        data["wash_amount"] = ""
        data["total_cost"] = ""

        if data_object.approval_pending_in_date_time is None:
            data["approval_pending_date"] = ""
        else:
            approval_pending_date_str = (
                data_object.approval_pending_in_date_time.date().strftime("%d-%b-%Y")
            )
            data["approval_pending_date"] = approval_pending_date_str

        if stock_data["available_date"] == "":
            data["available_date"] = stock_data["available_date"]
        else:
            available_date = datetime.datetime.strptime(
                stock_data["available_date"], "%d/%m/%Y"
            ).date()
            available_date_str = available_date.strftime("%d-%b-%Y")
            data["available_date"] = available_date_str

        if stock_data["empty_allotment_date"] == "":
            data["empty_allotment_date"] = stock_data["empty_allotment_date"]
        else:
            empty_allotment_date = datetime.datetime.strptime(
                stock_data["empty_allotment_date"], "%d/%m/%Y"
            ).date()
            empty_allotment_date_str = empty_allotment_date.strftime("%d-%b-%Y")
            data["empty_allotment_date"] = empty_allotment_date_str

        if stock_data["allotment_date"] == "":
            data["allotment_date"] = stock_data["allotment_date"]
        else:
            allotment_date = datetime.datetime.strptime(
                stock_data["allotment_date"], "%d/%m/%Y"
            ).date()
            allotment_date_str = allotment_date.strftime("%d-%b-%Y")
            data["allotment_date"] = allotment_date_str
        data["out_date"] = ""
        data["out_time"] = ""
        data["shipper"] = gate_in_data["shipper"]
        data["do_no"] = ""
        data["status"] = stock_data["status"]
        data["otl"] = ""
        data["no_of_days"] = stock_data["aging"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def hemck_hemchc_inventory_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = hemck_hemchc_inventory_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        size = [each.get("size") for each in data]
        line = [each.get("line") for each in data]
        in_date = [each.get("in_date") for each in data]
        in_time = [each.get("in_time") for each in data]
        account = [each.get("account") for each in data]
        bl_no = [each.get("bl_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        hd_nr = [each.get("hd_nr") for each in data]
        cargo = [each.get("cargo") for each in data]
        survey_pending_date = [each.get("survey_pending_date") for each in data]
        estimate_pending_date = [each.get("estimate_pending_date") for each in data]
        estimate_no = [each.get("estimate_no") for each in data]
        damage_grade = [each.get("damage_grade") for each in data]
        man_hrs = [each.get("man_hrs") for each in data]
        lbr_cost = [each.get("lbr_cost") for each in data]
        mtrl_cost = [each.get("mtrl_cost") for each in data]
        wash_amount = [each.get("wash_amount") for each in data]
        total_cost = [each.get("total_cost") for each in data]
        approval_pending_date = [each.get("approval_pending_date") for each in data]
        available_date = [each.get("available_date") for each in data]
        empty_allotment_date = [each.get("empty_allotment_date") for each in data]
        allotment_date = [each.get("allotment_date") for each in data]
        out_date = [each.get("out_date") for each in data]
        out_time = [each.get("out_time") for each in data]
        shipper = [each.get("shipper") for each in data]
        do_no = [each.get("do_no") for each in data]
        status = [each.get("status") for each in data]
        otl = [each.get("otl") for each in data]
        no_of_days = [each.get("no_of_days") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                size[i],
                line[i],
                in_date[i],
                in_time[i],
                account[i],
                bl_no[i],
                transporter[i],
                mfg_date[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                hd_nr[i],
                cargo[i],
                survey_pending_date[i],
                estimate_pending_date[i],
                estimate_no[i],
                damage_grade[i],
                man_hrs[i],
                lbr_cost[i],
                mtrl_cost[i],
                wash_amount[i],
                total_cost[i],
                approval_pending_date[i],
                available_date[i],
                empty_allotment_date[i],
                allotment_date[i],
                out_date[i],
                out_time[i],
                shipper[i],
                do_no[i],
                vehicle_no[i],
                status[i],
                otl[i],
                no_of_days[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 35)])
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 35)]]
        return main_data


def edi_movecode_tracking_row_data(tracked_object, client_name):
    try:
        data = {}
        tracked_data = tracked_object.get_tracked_detail()
        data["line"] = tracked_data["client"]
        data["client"] = client_name
        data["email_date"] = tracked_data["email_date"]
        data["process_date"] = tracked_data["process_date"]
        data["container_no"] = tracked_data["container_no"]
        data["size"] = tracked_data["size"]
        data["type"] = tracked_data["type"]
        data["move_code"] = tracked_data["move_code"]
        data["site"] = tracked_data["site"]
        data["email_sent"] = "YES"
        data["in_email_date"] = tracked_data["email_date"]
        if tracked_data["is_auto"] is True:
            data["auto_email"] = "YES"
        else:
            data["auto_email"] = "NO"
        data["time_diff"] = tracked_data["time_diff"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def inward_edi_movecode_tracking_main_data(data_object_list, connection=None):
    try:
        count = 0
        data = []
        for obj in data_object_list:
            tracked_objects = []
            client_name = obj.container.client.name
            if obj.is_email_sent:
                if not connection is None:
                    if (
                        EdiMailTracker.objects.using(connection)
                        .filter(in_data_id=obj.pk)
                        .exclude(move_code=None)
                        .exists()
                    ):
                        tracked_objects = (
                            EdiMailTracker.objects.using(connection)
                            .filter(in_data_id=obj.pk)
                            .exclude(move_code=None)
                        )
                    else:
                        pass
                else:
                    if (
                        EdiMailTracker.objects.filter(in_data_id=obj.pk)
                        .exclude(move_code=None)
                        .exists()
                    ):
                        tracked_objects = EdiMailTracker.objects.filter(
                            in_data_id=obj.pk
                        ).exclude(move_code=None)
                    else:
                        pass
            else:
                pass

            for tracked_object in tracked_objects:
                count += 1
                each_data = edi_movecode_tracking_row_data(
                    tracked_object, client_name=client_name
                )
                each_data["sl_no"] = count
                data.append(each_data)

        sl_no = [each.get("sl_no") for each in data]
        line = [each.get("line") for each in data]
        client = [each.get("client") for each in data]
        email_date = [each.get("email_date") for each in data]
        process_date = [each.get("process_date") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("size") for each in data]
        container_type = [each.get("type") for each in data]
        move_code = [each.get("move_code") for each in data]
        site = [each.get("site") for each in data]
        email_sent = [each.get("email_sent") for each in data]
        in_email_date = [each.get("in_email_date") for each in data]
        auto_email = [each.get("auto_email") for each in data]
        time_diff = [each.get("time_diff") for each in data]

        df_data = [
            [
                sl_no[i],
                line[i],
                client[i],
                email_date[i],
                process_date[i],
                container_no[i],
                container_size[i],
                container_type[i],
                move_code[i],
                site[i],
                email_sent[i],
                in_email_date[i],
                auto_email[i],
                time_diff[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 14)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 14)]]
        return df_data


def outward_edi_movecode_tracking_main_data(data_object_list, connection=None):
    try:
        count = 0
        data = []
        for obj in data_object_list:
            tracked_objects = []
            client_name = obj.container.client.name
            if obj.is_email_sent:
                if not connection is None:
                    if (
                        EdiMailTracker.objects.using(connection)
                        .filter(out_data_id=obj.pk)
                        .exclude(move_code=None)
                        .exists()
                    ):
                        tracked_objects = (
                            EdiMailTracker.objects.using(connection)
                            .filter(out_data_id=obj.pk)
                            .exclude(move_code=None)
                        )
                    else:
                        pass
                else:
                    if (
                        EdiMailTracker.objects.using(connection)
                        .filter(out_data_id=obj.pk)
                        .exclude(move_code=None)
                        .exists()
                    ):
                        tracked_objects = EdiMailTracker.objects.filter(
                            out_data_id=obj.pk
                        ).exclude(move_code=None)
                    else:
                        pass
            else:
                pass

            for tracked_object in tracked_objects:
                count += 1
                each_data = edi_movecode_tracking_row_data(
                    tracked_object, client_name=client_name
                )
                each_data["sl_no"] = count
                data.append(each_data)

        sl_no = [each.get("sl_no") for each in data]
        line = [each.get("line") for each in data]
        client = [each.get("client") for each in data]
        email_date = [each.get("email_date") for each in data]
        process_date = [each.get("process_date") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("size") for each in data]
        container_type = [each.get("type") for each in data]
        move_code = [each.get("move_code") for each in data]
        site = [each.get("site") for each in data]
        email_sent = [each.get("email_sent") for each in data]
        in_email_date = [each.get("in_email_date") for each in data]
        auto_email = [each.get("auto_email") for each in data]
        time_diff = [each.get("time_diff") for each in data]

        df_data = [
            [
                sl_no[i],
                line[i],
                client[i],
                email_date[i],
                process_date[i],
                container_no[i],
                container_size[i],
                container_type[i],
                move_code[i],
                site[i],
                email_sent[i],
                in_email_date[i],
                auto_email[i],
                time_diff[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 14)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 14)]]
        return df_data


def ovmnr_data_object_list(
    from_date_str, to_date_str, from_time_str, to_time_str, line, location, site
):
    try:
        to_date_time = datetime.datetime.now().astimezone(
            timezone.get_current_timezone()
        )
        from_date_time = to_date_time - datetime.timedelta(hours=24)
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
        survey = None
        if site.type == "DEPOT":
            survey = Survey.objects.select_related(
                "depot__container__location", "depot__container__site"
            ).filter(
                depot__container__location=location,
                depot__container__site=site,
                current_date__gte=from_date,
                current_time__gte=from_time,
                current_date__lte=to_date,
                current_time__lte=to_time,
            )
            if line is not None:
                survey.filter(depot__container__client__ref_code=line)
        else:
            survey = Survey.objects.select_related(
                "non_depot__container__location", "non_depot__container__site"
            ).filter(
                non_depot__container__location=location,
                non_depot__container__site=site,
                current_date__gte=from_date,
                current_time__gte=from_time,
                current_date__lte=to_date,
                current_time__lte=to_time,
            )

            if line is not None:
                survey.filter(non_depot__container__client__ref_code=line)
        return survey
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def ovmnr_detail_row_data(data_object):
    try:

        container_no = ""
        in_date_time = ""
        out_date_time = ""
        estimate_date = ""
        estimate_ref_no = ""
        estimate_cost = ""
        approval_date = ""
        approval_status = ""
        approval_cost = ""
        repair_date = ""
        repair_ref_no = ""

        estimate = None
        approval = None
        repair = None

        if data_object.depot is not None:
            container_no = data_object.depot.container.container_no
            in_date_time = (
                datetime.datetime.combine(
                    data_object.depot.gate_in.in_date, data_object.depot.gate_in.in_time
                )
                .astimezone(timezone.get_current_timezone())
                .strftime("%d/%m/%Y %H:%M")
            )
            if data_object.depot.gate_out is not None:
                out_date_time = (
                    datetime.datetime.combine(
                        data_object.depot.gate_out.out_date,
                        data_object.depot.gate_out.out_time,
                    )
                    .astimezone(timezone.get_current_timezone())
                    .strftime("%d/%m/%Y %H:%M")
                )

            if data_object.depot.estimate_status is not None:
                approval_status = data_object.depot.estimate_status
        else:
            container_no = data_object.non_depot.container.container_no
            in_date_time = (
                datetime.datetime.combine(
                    data_object.non_depot.gate_in.in_date,
                    data_object.non_depot.gate_in.in_time,
                )
                .astimezone(timezone.get_current_timezone())
                .strftime("%d/%m/%Y %H:%M")
            )
            if data_object.non_depot.gate_out is not None:
                out_date_time = (
                    datetime.datetime.combine(
                        data_object.non_depot.gate_out.out_date,
                        data_object.non_depot.gate_out.out_time,
                    )
                    .astimezone(timezone.get_current_timezone())
                    .strftime("%d/%m/%Y %H:%M")
                )

            if data_object.non_depot.estimate_status is not None:
                approval_status = data_object.non_depot.estimate_status

        if data_object.is_proceed:
            if Estimate.objects.filter(parent=data_object, is_proceed=True).exists():
                estimate = Estimate.objects.get(parent=data_object, is_proceed=True)
                estimate_date = estimate.current_date.strftime("%d/%m/%Y")
                estimate_ref_no = estimate.number
                estimate_cost = estimate.current_amount

        if not estimate is None:
            if Approval.objects.filter(parent=estimate).exists():
                approval = Approval.objects.get(parent=estimate)
                approval_date = approval.current_date.strftime("%d/%m/%Y")
                approval_cost = approval.approval_amount
                if approval.is_proceed:
                    if Repair.objects.filter(parent=estimate).exists():
                        repair = Repair.objects.get(parent=estimate)
                        if repair.is_proceed:
                            repair_date = repair.repair_date.strftime("%d/%m/%Y")
                            repair_ref_no = repair.number

        data = {
            "container_no": container_no,
            "in_date_time": in_date_time,
            "out_date_time": out_date_time,
            "estimate_date": estimate_date,
            "estimate_ref_no": estimate_ref_no,
            "estimate_cost": estimate_cost,
            "approval_date": approval_date,
            "approval_status": approval_status,
            "approval_cost": approval_cost,
            "repair_date": repair_date,
            "repair_ref_no": repair_ref_no,
        }
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def ovmnr_detail_main_data(data_object_list):
    try:
        count = 0
        data = []
        main_data = []
        for each in data_object_list:
            count += 1
            each_data = ovmnr_detail_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)

        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        in_date_time = [each.get("in_date_time") for each in data]
        out_date_time = [each.get("out_date_time") for each in data]
        estimate_date = [each.get("estimate_date") for each in data]
        estimate_ref_no = [each.get("estimate_ref_no") for each in data]
        estimate_cost = [each.get("estimate_cost") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        approval_status = [each.get("approval_status") for each in data]
        approval_cost = [each.get("approval_cost") for each in data]
        repair_date = [each.get("repair_date") for each in data]
        repair_ref_no = [each.get("repair_ref_no") for each in data]

        main_data = [
            [
                sl_no[i],
                container_no[i],
                in_date_time[i],
                out_date_time[i],
                estimate_date[i],
                estimate_ref_no[i],
                estimate_cost[i],
                approval_date[i],
                approval_status[i],
                approval_cost[i],
                repair_date[i],
                repair_ref_no[i],
            ]
            for i in range(len(sl_no))
        ]

        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 12)])
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 12)]]
        return main_data


def ovmnr_summary_row_data(location, site, line, date):
    try:
        if site.type == "DEPOT":
            survey = Survey.objects.select_related(
                "depot__container__location", "depot__container__site"
            ).filter(
                depot__container__location=location,
                depot__container__site=site,
                current_date=date,
            )
            if line is not None:
                survey.filter(depot__container__client__ref_code=line)
        else:
            survey = Survey.objects.select_related(
                "non_depot__container__location", "non_depot__container__site"
            ).filter(
                non_depot__container__location=location,
                non_depot__container__site=site,
                current_date=date,
            )
            if line is not None:
                survey.filter(non_depot__container__client__ref_code=line)

        estimate = Estimate.objects.filter(parent__in=list(survey), is_proceed=True)
        approval = Approval.objects.filter(parent__in=list(estimate))
        repair = Repair.objects.filter(parent__in=list(estimate))

        no_of_container_westim = 0
        westim_cost = 0
        if not estimate.count() == 0:
            no_of_container_westim = estimate.count()
            westim_cost = estimate.aggregate(
                amount=Coalesce(Sum("current_amount", default=0), 0)
            )["amount"]

        no_of_container_destim = 0
        destim_cost = 0
        if not approval.count() == 0:
            no_of_container_destim = approval.count()
            destim_cost = approval.aggregate(
                amount=Coalesce(Sum("approval_amount", default=0), 0)
            )["amount"]

        no_of_container_repair_destim = 0
        repair_destim_cost = 0
        if not repair.count() == 0:
            no_of_container_repair_destim = repair.count()
            repair_destim_cost = approval.aggregate(
                amount=Coalesce(Sum("approved_amount", default=0), 0)
            )["amount"]

        return {
            "date": date.strftime("%d/%m/%Y"),
            "no_of_container_westim": no_of_container_westim,
            "westim_cost": westim_cost,
            "no_of_container_destim": no_of_container_destim,
            "destim_cost": destim_cost,
            "no_of_container_repair_destim": no_of_container_repair_destim,
            "repair_destim_cost": repair_destim_cost,
        }

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def ovmnr_summary_main_data(location, site, line, from_date_str, to_date_str):
    try:
        to_date_time = datetime.datetime.now().astimezone(
            timezone.get_current_timezone()
        )
        from_date_time = to_date_time - datetime.timedelta(hours=24)
        from_date = from_date_time.date()
        to_date = to_date_time.date()

        if not len(from_date_str) == 0:
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()

        data = []
        main_data = []
        date_range = get_date_range(start_date=from_date, end_date=to_date)

        for each in date_range:
            each_data = ovmnr_summary_row_data(location, site, line, each)
            data.append(each_data)

        date = [each.get("date") for each in data]
        no_of_container_westim = [each.get("no_of_container_westim") for each in data]
        westim_cost = [each.get("westim_cost") for each in data]
        no_of_container_destim = [each.get("no_of_container_destim") for each in data]
        destim_cost = [each.get("destim_cost") for each in data]
        no_of_container_repair_destim = [
            each.get("no_of_container_repair_destim") for each in data
        ]
        repair_destim_cost = [each.get("repair_destim_cost") for each in data]

        main_data = [
            [
                date[i],
                no_of_container_westim[i],
                westim_cost[i],
                no_of_container_destim[i],
                destim_cost[i],
                no_of_container_repair_destim[i],
                repair_destim_cost[i],
            ]
            for i in range(len(date))
        ]

        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 7)])
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        main_data = [["" for i in range(0, 7)]]
        return main_data


def msk_line_inward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        lolo_data = data_object.lolo.get_handling()
        data["vehicle_no"] = gate_in_data["vehicle_no"]
        data["import_cargo"] = gate_in_data["cargo"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%b/%Y")
            data["mfg_date"] = manufacturing_date_str
        data["grade"] = gate_in_data["grade"]
        data["arrived_by"] = gate_in_data["arrived"]
        data["status"] = gate_in_data["condition"]
        data["remarks"] = gate_in_data["remarks"]
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%b %d %Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        data["gate_in_date"] = in_date_str
        data["gate_in_time"] = in_time_str
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_in_data["shipper"]
        data["vessel"] = gate_in_data["vessel_name"]
        data["voyage"] = gate_in_data["voyage_no"]
        data["place"] = gate_in_data["source"]
        data["transporter"] = gate_in_data["transporter_name"]
        if data_object.container.client.ref_code is None:
            ref_code = ""
        else:
            ref_code = data_object.container.client.ref_code
        data["opr"] = ref_code
        data["line"] = container_data["client"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_line_inward_main_data(data_object_list):
    try:
        count = 0
        data = []

        for each in data_object_list:
            count += 1
            each_data = msk_line_inward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        import_cargo = [each.get("import_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        grade = [each.get("grade") for each in data]
        arrived_by = [each.get("arrived_by") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        gate_in_time = [each.get("gate_in_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        place = [each.get("place") for each in data]
        transporter = [each.get("transporter") for each in data]
        opr = [each.get("opr") for each in data]

        df_data = [
            [
                sl_no[i],
                vehicle_no[i],
                import_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                mfg_date[i],
                grade[i],
                arrived_by[i],
                status[i],
                remarks[i],
                gate_in_date[i],
                gate_in_time[i],
                line[i],
                customer[i],
                shipper[i],
                vessel[i],
                voyage[i],
                place[i],
                transporter[i],
                opr[i],
            ]
            for i in range(len(sl_no))
        ]

        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 22)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 22)]]
        return df_data


def msk_line_outward_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_out_data = data_object.gate_out.get_gate_out()
        lolo_data = data_object.lolo.get_handling()
        out_date = datetime.datetime.strptime(
            gate_out_data["out_date"], "%Y-%m-%d"
        ).date()
        out_date_str = out_date.strftime("%b %d %Y")
        out_time = datetime.datetime.strptime(gate_out_data["out_time"], "%H:%M").time()
        out_time_str = out_time.strftime("%I:%M %p")
        data["gate_out_date"] = out_date_str
        data["gate_out_time"] = out_time_str
        data["line"] = container_data["client"]
        data["customer"] = lolo_data["customer_name"]
        data["shipper"] = gate_out_data["shipper"]
        data["place"] = gate_out_data["destination"]
        data["vessel"] = gate_out_data["vessel_name"]
        data["voyage"] = gate_out_data["voyage_no"]
        data["transporter"] = gate_out_data["transporter_name"]
        data["vehicle_no"] = gate_out_data["vehicle_no"]
        data["export_cargo"] = gate_out_data["export_cargo"]
        data["container_no"] = container_data["container_no"]
        data["container_size_type"] = container_data["size"] + container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["grade"] = gate_out_data["grade"]
        data["status"] = gate_out_data["condition"]
        data["remarks"] = gate_out_data["remarks"]

        if container_data["manufacturing_date"] == "":
            data["mfg_date"] = ""
        else:
            manufacturing_date = datetime.datetime.strptime(
                container_data["manufacturing_date"], "%Y-%m-%d"
            ).date()
            manufacturing_date_str = manufacturing_date.strftime("%d/%m/%Y")
            data["mfg_date"] = manufacturing_date_str

        data["destination"] = gate_out_data["destination"]
        data["to_port_code"] = gate_out_data["to_port_code"]
        data["port_of_loading"] = gate_out_data["port_of_loading"]
        data["port_of_discharge"] = gate_out_data["port_of_discharge"]
        data["booking_no"] = gate_out_data["booking_no"]
        data["seal_no"] = gate_out_data["seal_no"]
        if data_object.container.client.ref_code is None:
            ref_code = ""
        else:
            ref_code = data_object.container.client.ref_code
        data["opr"] = ref_code
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_line_outward_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msk_line_outward_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_out_date = [each.get("gate_out_date") for each in data]
        gate_out_time = [each.get("gate_out_time") for each in data]
        line = [each.get("line") for each in data]
        customer = [each.get("customer") for each in data]
        shipper = [each.get("shipper") for each in data]
        place = [each.get("place") for each in data]
        vessel = [each.get("vessel") for each in data]
        voyage = [each.get("voyage") for each in data]
        transporter = [each.get("transporter") for each in data]
        vehicle_no = [each.get("vehicle_no") for each in data]
        export_cargo = [each.get("export_cargo") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size_type = [each.get("container_size_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        grade = [each.get("grade") for each in data]
        booking_no = [each.get("booking_no") for each in data]
        seal_no = [each.get("seal_no") for each in data]
        status = [each.get("status") for each in data]
        remarks = [each.get("remarks") for each in data]
        mfg_date = [each.get("mfg_date") for each in data]
        port_of_loading = [each.get("port_of_loading") for each in data]
        port_of_discharge = [each.get("port_of_discharge") for each in data]
        destination = [each.get("destination") for each in data]
        opr = [each.get("opr") for each in data]
        to_port_code = [each.get("to_port_code") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_out_date[i],
                gate_out_time[i],
                line[i],
                customer[i],
                shipper[i],
                place[i],
                vessel[i],
                voyage[i],
                transporter[i],
                vehicle_no[i],
                export_cargo[i],
                container_no[i],
                container_size_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                grade[i],
                booking_no[i],
                seal_no[i],
                status[i],
                remarks[i],
                mfg_date[i],
                port_of_loading[i],
                port_of_discharge[i],
                destination[i],
                opr[i],
                to_port_code[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 28)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 28)]]
        return df_data


def msk_line_stock_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        gate_in_data = data_object.gate_in.get_gate_in()
        stock_data = data_object.get_stock()
        in_date = datetime.datetime.strptime(gate_in_data["in_date"], "%Y-%m-%d").date()
        in_date_str = in_date.strftime("%b %d %Y")
        in_time = datetime.datetime.strptime(gate_in_data["in_time"], "%H:%M").time()
        in_time_str = in_time.strftime("%I:%M %p")
        gate_in_date = in_date_str + " " + in_time_str
        data["gate_in_date"] = gate_in_date
        data["client"] = container_data["client"]
        data["container_no"] = container_data["container_no"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["gross_wt"] = container_data["gross_wt"]
        data["tare_wt"] = container_data["tare_wt"]
        data["payload"] = container_data["payload"]
        data["age"] = stock_data["aging"]
        data["status"] = stock_data["status"]
        data["condition"] = gate_in_data["condition"]
        data["available_date"] = stock_data["available_date"]
        data["approval_date"] = stock_data["allotment_date"]
        data["booking_no"] = stock_data["booking_no"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_line_stock_main_data(data_object_list):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = msk_line_stock_row_data(each)
            each_data["sl_no"] = count

            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        gate_in_date = [each.get("gate_in_date") for each in data]
        client = [each.get("client") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("container_size") for each in data]
        container_type = [each.get("container_type") for each in data]
        gross_wt = [each.get("gross_wt") for each in data]
        tare_wt = [each.get("tare_wt") for each in data]
        payload = [each.get("payload") for each in data]
        age = [each.get("age") for each in data]
        status = [each.get("status") for each in data]
        condition = [each.get("condition") for each in data]
        available_date = [each.get("available_date") for each in data]
        approval_date = [each.get("approval_date") for each in data]
        booking_no = [each.get("booking_no") for each in data]

        df_data = [
            [
                sl_no[i],
                gate_in_date[i],
                client[i],
                container_no[i],
                container_size[i],
                container_type[i],
                gross_wt[i],
                tare_wt[i],
                payload[i],
                age[i],
                status[i],
                condition[i],
                available_date[i],
                approval_date[i],
                booking_no[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 15)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 15)]]
        return df_data


def msk_line_stock_summary_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time
        data = []

        in_data = GateInHistory.objects.select_related(
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
        ).filter(container__location=location, container__site=site)

        out_data = GateOutHistory.objects.select_related(
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
        ).filter(container__location=location, container__site=site)

        in_data_20_size = in_data.filter(container__size__name="20")
        in_data_40_size = in_data.filter(container__size__name="40")
        out_data_20_size = out_data.filter(container__size__name="20")
        out_data_40_size = out_data.filter(container__size__name="40")

        # DV
        # 20
        # op
        dv2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="DV"
            ).count()
        )

        dv2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="DV",
            ).count()
        )
        dv2_op_data_count = dv2_op_in_data_count - dv2_op_out_data_count
        # cl
        dv2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv2_cl_bal = dv2_op_data_count + dv2_in_data_count - dv2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'DV",
                "OpBal": dv2_op_data_count,
                "InQty": dv2_in_data_count,
                "OutQty": dv2_out_data_count,
                "ClBal": dv2_cl_bal,
            }
        )
        # 40
        # op
        dv4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="DV"
            ).count()
        )
        dv4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="DV",
            ).count()
        )
        dv4_op_data_count = dv4_op_in_data_count - dv4_op_out_data_count
        # cl
        dv4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="DV",
            ).count()
        )
        dv4_cl_bal = dv4_op_data_count + dv4_in_data_count - dv4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'DV",
                "OpBal": dv4_op_data_count,
                "InQty": dv4_in_data_count,
                "OutQty": dv4_out_data_count,
                "ClBal": dv4_cl_bal,
            }
        )

        # FR
        # 20
        # op
        fr2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="FR"
            ).count()
        )

        fr2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="FR",
            ).count()
        )
        fr2_op_data_count = fr2_op_in_data_count - fr2_op_out_data_count
        # cl
        fr2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr2_cl_bal = fr2_op_data_count + fr2_in_data_count - fr2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'FR",
                "OpBal": fr2_op_data_count,
                "InQty": fr2_in_data_count,
                "OutQty": fr2_out_data_count,
                "ClBal": fr2_cl_bal,
            }
        )
        # 40
        # op
        fr4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="FR"
            ).count()
        )
        fr4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="FR",
            ).count()
        )
        fr4_op_data_count = fr4_op_in_data_count - fr4_op_out_data_count
        # cl
        fr4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="FR",
            ).count()
        )
        fr4_cl_bal = fr4_op_data_count + fr4_in_data_count - fr4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'FR",
                "OpBal": fr4_op_data_count,
                "InQty": fr4_in_data_count,
                "OutQty": fr4_out_data_count,
                "ClBal": fr4_cl_bal,
            }
        )

        # H/C
        # 20
        # op
        hc2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="H/C"
            ).count()
        )

        hc2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="H/C",
            ).count()
        )
        hc2_op_data_count = hc2_op_in_data_count - hc2_op_out_data_count
        # cl
        hc2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc2_cl_bal = hc2_op_data_count + hc2_in_data_count - hc2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'H/C",
                "OpBal": hc2_op_data_count,
                "InQty": hc2_in_data_count,
                "OutQty": hc2_out_data_count,
                "ClBal": hc2_cl_bal,
            }
        )
        # 40
        # op
        hc4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="H/C"
            ).count()
        )
        hc4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="H/C",
            ).count()
        )
        hc4_op_data_count = hc4_op_in_data_count - hc4_op_out_data_count
        # cl
        hc4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="H/C",
            ).count()
        )
        hc4_cl_bal = hc4_op_data_count + hc4_in_data_count - hc4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'H/C",
                "OpBal": hc4_op_data_count,
                "InQty": hc4_in_data_count,
                "OutQty": hc4_out_data_count,
                "ClBal": hc4_cl_bal,
            }
        )

        # HT
        # 20
        # op
        ht2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="HT"
            ).count()
        )

        ht2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="HT",
            ).count()
        )
        ht2_op_data_count = ht2_op_in_data_count - ht2_op_out_data_count
        # cl
        ht2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht2_cl_bal = ht2_op_data_count + ht2_in_data_count - ht2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'HT",
                "OpBal": ht2_op_data_count,
                "InQty": ht2_in_data_count,
                "OutQty": ht2_out_data_count,
                "ClBal": ht2_cl_bal,
            }
        )
        # 40
        # op
        ht4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="HT"
            ).count()
        )
        ht4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="HT",
            ).count()
        )
        ht4_op_data_count = ht4_op_in_data_count - ht4_op_out_data_count
        # cl
        ht4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="HT",
            ).count()
        )
        ht4_cl_bal = ht4_op_data_count + ht4_in_data_count - ht4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'HT",
                "OpBal": ht4_op_data_count,
                "InQty": ht4_in_data_count,
                "OutQty": ht4_out_data_count,
                "ClBal": ht4_cl_bal,
            }
        )

        # O/T
        # 20
        # op
        ot2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="O/T"
            ).count()
        )

        ot2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="O/T",
            ).count()
        )
        ot2_op_data_count = ot2_op_in_data_count - ot2_op_out_data_count
        # cl
        ot2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot2_cl_bal = ot2_op_data_count + ot2_in_data_count - ot2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'O/T",
                "OpBal": ot2_op_data_count,
                "InQty": ot2_in_data_count,
                "OutQty": ot2_out_data_count,
                "ClBal": ot2_cl_bal,
            }
        )
        # 40
        # op
        ot4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="O/T"
            ).count()
        )
        ot4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="O/T",
            ).count()
        )
        ot4_op_data_count = ot4_op_in_data_count - ot4_op_out_data_count
        # cl
        ot4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="O/T",
            ).count()
        )
        ot4_cl_bal = ot4_op_data_count + ot4_in_data_count - ot4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'O/T",
                "OpBal": ot4_op_data_count,
                "InQty": ot4_in_data_count,
                "OutQty": ot4_out_data_count,
                "ClBal": ot4_cl_bal,
            }
        )

        # STD
        # 20
        # op
        std2_op_in_data_count = int(
            in_data_20_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="STD"
            ).count()
        )

        std2_op_out_data_count = int(
            out_data_20_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="STD",
            ).count()
        )
        std2_op_data_count = std2_op_in_data_count - std2_op_out_data_count
        # cl
        std2_in_data_count = int(
            in_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std2_out_data_count = int(
            out_data_20_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std2_cl_bal = std2_op_data_count + std2_in_data_count - std2_out_data_count
        # data
        data.append(
            {
                "SizeType": "20'STD",
                "OpBal": std2_op_data_count,
                "InQty": std2_in_data_count,
                "OutQty": std2_out_data_count,
                "ClBal": std2_cl_bal,
            }
        )
        # 40
        # op
        std4_op_in_data_count = int(
            in_data_40_size.filter(
                date__lte=yesterday_for_from_date_time, container__type__name="STD"
            ).count()
        )
        std4_op_out_data_count = int(
            out_data_40_size.filter(
                date__lte=yesterday_for_from_date_time,
                container__type__name="STD",
            ).count()
        )
        std4_op_data_count = std4_op_in_data_count - std4_op_out_data_count
        # cl
        std4_in_data_count = int(
            in_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std4_out_data_count = int(
            out_data_40_size.filter(
                date__range=(from_date_time, to_date_time),
                container__type__name="STD",
            ).count()
        )
        std4_cl_bal = std4_op_data_count + std4_in_data_count - std4_out_data_count
        # data
        data.append(
            {
                "SizeType": "40'STD",
                "OpBal": std4_op_data_count,
                "InQty": std4_in_data_count,
                "OutQty": std4_out_data_count,
                "ClBal": std4_cl_bal,
            }
        )

        op_bal_total = (
            dv2_op_data_count
            + dv4_op_data_count
            + fr2_op_data_count
            + fr4_op_data_count
            + hc2_op_data_count
            + hc4_op_data_count
            + ht2_op_data_count
            + ht4_op_data_count
            + ot2_op_data_count
            + ot4_op_data_count
            + std2_op_data_count
            + std4_op_data_count
        )

        in_qty_total = (
            dv2_in_data_count
            + dv4_in_data_count
            + fr2_in_data_count
            + fr4_in_data_count
            + hc2_in_data_count
            + hc4_in_data_count
            + ht2_in_data_count
            + ht4_in_data_count
            + ot2_in_data_count
            + ot4_in_data_count
            + std2_in_data_count
            + std4_in_data_count
        )

        out_qty_total = (
            dv2_out_data_count
            + dv4_out_data_count
            + fr2_out_data_count
            + fr4_out_data_count
            + hc2_out_data_count
            + hc4_out_data_count
            + ht2_out_data_count
            + ht4_out_data_count
            + ot2_out_data_count
            + ot4_out_data_count
            + std2_out_data_count
            + std4_out_data_count
        )

        cl_bal_total = (
            dv2_cl_bal
            + dv4_cl_bal
            + fr2_cl_bal
            + fr4_cl_bal
            + hc2_cl_bal
            + hc4_cl_bal
            + ht2_cl_bal
            + ht4_cl_bal
            + ot2_cl_bal
            + ot4_cl_bal
            + std2_cl_bal
            + std4_cl_bal
        )

        data.append(
            {
                "SizeType": "Total",
                "OpBal": op_bal_total,
                "InQty": in_qty_total,
                "OutQty": out_qty_total,
                "ClBal": cl_bal_total,
            }
        )

        SizeType = [each.get("SizeType") for each in data]
        OpBal = [each.get("OpBal") for each in data]
        InQty = [each.get("InQty") for each in data]
        OutQty = [each.get("OutQty") for each in data]
        ClBal = [each.get("ClBal") for each in data]

        df_data = [
            [SizeType[i], OpBal[i], InQty[i], OutQty[i], ClBal[i]]
            for i in range(len(SizeType))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def msk_line_stock_av_aa_ar_row_data(data_object):
    try:
        data = {}
        container_data = data_object.container.get_container()
        stock_data = data_object.get_stock()
        data["container_no"] = container_data["container_no"]
        data["container_size"] = container_data["size"]
        data["container_type"] = container_data["type"]
        data["status"] = stock_data["status"]
        data["available_date"] = stock_data["available_date"]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def msk_line_stock_av_aa_ar_main_data(location, site):
    try:
        data = []
        stock_object_data = list(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            ).filter(
                container_status="IN",
                container__location=location,
                container__site=site,
                status__in=["Available", "Without_Repair_Available"],
            )
        )
        count = 0
        for each in stock_object_data:
            count += 1
            each_data = msk_line_stock_av_aa_ar_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        container_size = [each.get("container_size") for each in data]
        container_type = [each.get("container_type") for each in data]
        status = [each.get("status") for each in data]
        available_date = [each.get("available_date") for each in data]

        df_data = [
            [
                sl_no[i],
                container_no[i],
                container_size[i],
                container_type[i],
                status[i],
                available_date[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 6)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 6)]]
        return df_data


def msk_line_movement_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)

        size1_in_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size1_in_tues = size1_in_total * 1

        size2_in_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size2_in_tues = size2_in_total * 2

        size1_out_total = int(
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
                container__size__name="20",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size1_out_tues = size1_out_total * 1

        size2_out_total = int(
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
                container__size__name="40",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        size2_out_tues = size2_out_total * 2

        data = [
            {
                "Movement": "Total",
                "In-20'": size1_in_total,
                "In-40'": size2_in_total,
                "Out-20'": size1_out_total,
                "Out-40'": size2_out_total,
            },
            {
                "Movement": "Tues",
                "In-20'": size1_in_tues,
                "In-40'": size2_in_tues,
                "Out-20'": size1_out_tues,
                "Out-40'": size2_out_tues,
            },
        ]
        Movement = [each.get("Movement") for each in data]
        In1 = [each.get("In-20'") for each in data]
        In2 = [each.get("In-40'") for each in data]
        Out1 = [each.get("Out-20'") for each in data]
        Out2 = [each.get("Out-40'") for each in data]

        df_data = [
            [Movement[i], In1[i], In2[i], Out1[i], Out2[i]]
            for i in range(len(Movement))
        ]
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [[]]
        return df_data


def msk_line_stock_status_data(
    from_date_str, from_time_str, to_date_str, to_time_str, location, site
):
    try:
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                from_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                to_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
                from_date_time = datetime.datetime.combine(
                    from_date, from_time
                ).astimezone(timezone.get_current_timezone())
                to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(
                    timezone.get_current_timezone()
                )
                yesterday_for_from_date_time = from_date_time
        else:
            to_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            from_date_time = to_date_time - datetime.timedelta(hours=24)
            yesterday_for_from_date_time = from_date_time

        survey_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        survey_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        survey_pending_opb = survey_pending_in_opb - survey_pending_out_opb

        survey_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        survey_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                survey_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        survey_pending_calb = (
            survey_pending_opb + survey_pending_in - survey_pending_out
        )

        estimate_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        estimate_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        estimate_pending_opb = estimate_pending_in_opb - estimate_pending_out_opb

        estimate_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        estimate_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                estimate_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        estimate_pending_calb = (
            estimate_pending_opb + estimate_pending_in - estimate_pending_out
        )

        approval_pending_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approval_pending_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approval_pending_opb = approval_pending_in_opb - approval_pending_out_opb

        approval_pending_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approval_pending_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approval_pending_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approval_pending_calb = (
            approval_pending_opb + approval_pending_in - approval_pending_out
        )

        approved_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approved_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        approved_opb = approved_in_opb - approved_out_opb

        approved_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approved_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                approved_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        approved_calb = approved_opb + approved_in - approved_out

        under_repair_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        under_repair_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        under_repair_opb = under_repair_in_opb - under_repair_out_opb

        under_repair_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        under_repair_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                under_repair_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        under_repair_calb = under_repair_opb + under_repair_in - under_repair_out

        empty_allotment_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        empty_allotment_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        empty_allotment_opb = empty_allotment_in_opb - empty_allotment_out_opb

        empty_allotment_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        empty_allotment_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                empty_allotment_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        empty_allotment_calb = (
            empty_allotment_opb + empty_allotment_in - empty_allotment_out
        )

        available_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        available_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_out_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        available_opb = available_in_opb - available_out_opb

        available_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        available_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                available_out_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        available_calb = available_opb + available_in - available_out

        allotment_in_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_in_date_time__lte=yesterday_for_from_date_time,
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        allotment_out_opb = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_out_date_time__lte=yesterday_for_from_date_time,
                container_status="OUT",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        allotment_opb = allotment_in_opb - allotment_out_opb
        if allotment_opb < 0:
            allotment_opb = 0

        allotment_in = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_in_date_time__range=(from_date_time, to_date_time),
                container_status="IN",
                container__location=location,
                container__site=site,
            )
            .count()
        )

        allotment_out = int(
            ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
                "gate_out",
            )
            .filter(
                allotment_out_date_time__range=(from_date_time, to_date_time),
                container_status="OUT",
                container__location=location,
                container__site=site,
            )
            .count()
        )
        allotment_calb = allotment_opb + allotment_in - allotment_out
        if allotment_calb < 0:
            allotment_calb = 0

        status_list = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Approved",
            "Under Repairing",
            "Empty Allotment",
            "Available",
            "Allotment",
        ]

        op_bal_list = [
            survey_pending_opb,
            estimate_pending_opb,
            approval_pending_opb,
            approved_opb,
            under_repair_opb,
            empty_allotment_opb,
            available_opb,
            allotment_opb,
        ]

        in_bal_list = [
            survey_pending_in,
            estimate_pending_in,
            approval_pending_in,
            approved_in,
            under_repair_in,
            empty_allotment_in,
            available_in,
            allotment_in,
        ]

        out_bal_list = [
            survey_pending_out,
            estimate_pending_out,
            approval_pending_out,
            approved_out,
            under_repair_out,
            empty_allotment_out,
            available_out,
            allotment_out,
        ]

        cal_bal_list = [
            survey_pending_calb,
            estimate_pending_calb,
            approval_pending_calb,
            approved_calb,
            under_repair_calb,
            empty_allotment_calb,
            available_calb,
            allotment_calb,
        ]

        data = [
            [
                status_list[i],
                op_bal_list[i],
                in_bal_list[i],
                out_bal_list[i],
                cal_bal_list[i],
            ]
            for i in range(len(status_list))
        ]
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [[]]
        return data
