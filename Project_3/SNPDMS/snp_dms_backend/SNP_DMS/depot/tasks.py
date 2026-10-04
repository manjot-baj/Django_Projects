from __future__ import absolute_import, unicode_literals
from celery import shared_task
from .models import *
import logging, traceback, random, xlsxwriter
from django.utils import timezone
import datetime
from django.db import connections
from decouple import config
from django.core.mail import EmailMessage, get_connection
from .lolo_finance_functions import mark_expire_pre_gate
from common.redis_lock import RedisLock


def in_patch(connection):
    corrupted_container_list = []
    patched_container_list = []
    data = Eir.objects.using(connection).filter(is_verified=None, entry_type="IN")
    for each in data:
        try:
            container = None
            eir = None
            gate_in = None
            lolo = None
            lolo_payment = None
            st = None
            st_payment = None
            if not GateInHistory.objects.using(connection).filter(eir=each).exists():
                container = each.container
                eir = each
                gate_in = GateIn.objects.using(connection).get(
                    container=container, is_verified=None
                )
                lolo = Handling.objects.using(connection).get(
                    container=container, is_verified=None, entry_type="IN"
                )
                if lolo.payment_id is not None:
                    lolo_payment = HandlingPayment.objects.using(connection).get(
                        pk=lolo.payment_id
                    )
                if (
                    SelfTransportation.objects.using(connection)
                    .filter(container=container, is_verified=None, entry_type="IN")
                    .exists()
                ):
                    st = SelfTransportation.objects.using(connection).get(
                        container=container, is_verified=None, entry_type="IN"
                    )
                    if st.payment_id is not None:
                        st_payment = SelfTransportationPayment.objects.using(
                            connection
                        ).get(pk=st.payment_id)
                date_time = datetime.datetime.combine(
                    gate_in.in_date, gate_in.in_time
                ).astimezone(timezone.get_current_timezone())
                in_data = GateInHistory(
                    created_at=date_time,
                    date=date_time,
                    container=container,
                    eir=eir,
                    gate_in=gate_in,
                    lolo=lolo,
                    lolo_payment=lolo_payment,
                    st=st,
                    st_payment=st_payment,
                )
                in_data.save(using=connection)
                record = ContainerInOutRecord(
                    container=container, in_data=in_data, out_data=None
                )
                record.save(using=connection)
                eir.is_verified = True
                eir.save(using=connection)
                gate_in.is_verified = True
                gate_in.save(using=connection)
                lolo.is_verified = True
                lolo.save(using=connection)
                if lolo_payment is not None:
                    lolo_payment.is_verified = True
                    lolo_payment.save(using=connection)
                if st is not None:
                    st.is_verified = True
                    st.save(using=connection)
                if st_payment is not None:
                    st_payment.is_verified = True
                    st_payment.save(using=connection)
                record.in_patched = True
                record.save(using=connection)
                entry_count = (
                    GateInHistory.objects.using(connection)
                    .filter(container=container)
                    .count()
                )
                container.in_entry_count = entry_count
                container.save(using=connection)
                patched_container_list.append(
                    {
                        "date": in_data.date.strftime("%Y-%m-%d %H:%M"),
                        "container": container.container_no,
                        "site": container.site.name,
                        "db": connection,
                    }
                )
            else:
                in_data = GateInHistory.objects.using(connection).get(eir=each)
                container = in_data.container
                eir = in_data.eir
                gate_in = in_data.gate_in
                lolo = in_data.gate_in
                if in_data.lolo_payment is not None:
                    lolo_payment = in_data.lolo_payment
                if in_data.st is not None:
                    st = in_data.st
                if in_data.st_payment is not None:
                    st_payment = in_data.st_payment

                if (
                    not ContainerInOutRecord.objects.using(connection)
                    .filter(in_data=in_data)
                    .exists()
                ):
                    record = ContainerInOutRecord(
                        container=container, in_data=in_data, out_data=None
                    )
                    record.save(using=connection)
                    eir.is_verified = True
                    eir.save(using=connection)
                    gate_in.is_verified = True
                    gate_in.save(using=connection)
                    lolo.is_verified = True
                    lolo.save(using=connection)
                    if lolo_payment is not None:
                        lolo_payment.is_verified = True
                        lolo_payment.save(using=connection)
                    if st is not None:
                        st.is_verified = True
                        st.save(using=connection)
                    if st_payment is not None:
                        st_payment.is_verified = True
                        st_payment.save(using=connection)
                    record.in_patched = True
                    record.save(using=connection)
                    entry_count = (
                        GateInHistory.objects.using(connection)
                        .filter(container=container)
                        .count()
                    )
                    container.in_entry_count = entry_count
                    container.save(using=connection)
                    patched_container_list.append(
                        {
                            "date": in_data.date.strftime("%Y-%m-%d %H:%M"),
                            "container": container.container_no,
                            "site": container.site.name,
                            "db": connection,
                        }
                    )
                else:
                    pass
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            corrupted_container_list.append(
                {
                    "date": each.eir_date.strftime("%Y-%m-%d"),
                    "container": each.container.container_no,
                    "site": each.container.site.name,
                    "db": connection,
                }
            )
    return {
        "corrupted": corrupted_container_list,
        "patched": patched_container_list,
    }


def out_patch(connection):
    corrupted_container_list = []
    patched_container_list = []
    data = Eir.objects.using(connection).filter(is_verified=None, entry_type="OUT")
    for each in data:
        try:
            container = None
            eir = None
            gate_out = None
            lolo = None
            lolo_payment = None
            st = None
            st_payment = None
            if not GateOutHistory.objects.using(connection).filter(eir=each).exists():
                container = each.container
                eir = each
                gate_out = GateOut.objects.using(connection).get(
                    container=container, is_verified=None
                )
                lolo = Handling.objects.using(connection).get(
                    container=container, is_verified=None, entry_type="OUT"
                )
                if lolo.payment_id is not None:
                    lolo_payment = HandlingPayment.objects.using(connection).get(
                        pk=lolo.payment_id
                    )
                if (
                    SelfTransportation.objects.using(connection)
                    .filter(container=container, is_verified=None, entry_type="OUT")
                    .exists()
                ):
                    st = SelfTransportation.objects.using(connection).get(
                        container=container, is_verified=None, entry_type="OUT"
                    )
                    if st.payment_id is not None:
                        st_payment = SelfTransportationPayment.objects.using(
                            connection
                        ).get(pk=st.payment_id)
                date_time = datetime.datetime.combine(
                    gate_out.out_date, gate_out.out_time
                ).astimezone(timezone.get_current_timezone())
                out_data = GateOutHistory(
                    created_at=date_time,
                    date=date_time,
                    container=container,
                    eir=eir,
                    gate_out=gate_out,
                    lolo=lolo,
                    lolo_payment=lolo_payment,
                    st=st,
                    st_payment=st_payment,
                )
                out_data.save(using=connection)
                stock = ContainerStock.objects.using(connection).get(
                    container=container, gate_out=gate_out
                )
                in_data = GateInHistory.objects.using(connection).get(
                    container=container, gate_in=stock.gate_in
                )
                record = ContainerInOutRecord.objects.using(connection).get(
                    container=container, in_data=in_data
                )
                record.out_data = out_data
                record.out_patched = True
                record.save(using=connection)
                eir.is_verified = True
                eir.save(using=connection)
                gate_out.is_verified = True
                gate_out.save(using=connection)
                lolo.is_verified = True
                lolo.save(using=connection)
                if lolo_payment is not None:
                    lolo_payment.is_verified = True
                    lolo_payment.save(using=connection)
                if st is not None:
                    st.is_verified = True
                    st.save(using=connection)
                if st_payment is not None:
                    st_payment.is_verified = True
                    st_payment.save(using=connection)

                entry_count = (
                    GateOutHistory.objects.using(connection)
                    .filter(container=container)
                    .count()
                )
                container.out_entry_count = entry_count
                container.save(using=connection)
                patched_container_list.append(
                    {
                        "date": out_data.date.strftime("%Y-%m-%d %H:%M"),
                        "container": container.container_no,
                        "site": container.site.name,
                        "db": connection,
                    }
                )
            else:
                out_data = GateOutHistory.objects.using(connection).get(eir=each)
                container = out_data.container
                eir = out_data.eir
                gate_out = out_data.gate_out
                lolo = out_data.gate_out
                if out_data.lolo_payment is not None:
                    lolo_payment = out_data.lolo_payment
                if out_data.st is not None:
                    st = out_data.st
                if out_data.st_payment is not None:
                    st_payment = out_data.st_payment
                if not ContainerInOutRecord.objects.filter(
                    container=container, out_data=out_data
                ).exists():
                    stock = ContainerStock.objects.using(connection).get(
                        container=container, gate_out=out_data.gate_out
                    )
                    in_data = GateInHistory.objects.using(connection).get(
                        container=container, gate_in=stock.gate_in
                    )
                    record = ContainerInOutRecord.objects.using(connection).get(
                        container=container, in_data=in_data
                    )
                    record.out_data = out_data
                    record.out_patched = True
                    record.save(using=connection)
                    eir.is_verified = True
                    eir.save(using=connection)
                    gate_out.is_verified = True
                    gate_out.save(using=connection)
                    lolo.is_verified = True
                    lolo.save(using=connection)
                    if lolo_payment is not None:
                        lolo_payment.is_verified = True
                        lolo_payment.save(using=connection)
                    if st is not None:
                        st.is_verified = True
                        st.save(using=connection)
                    if st_payment is not None:
                        st_payment.is_verified = True
                        st_payment.save(using=connection)
                    entry_count = (
                        GateOutHistory.objects.using(connection)
                        .filter(container=container)
                        .count()
                    )
                    container.out_entry_count = entry_count
                    container.save(using=connection)
                    patched_container_list.append(
                        {
                            "date": out_data.date.strftime("%Y-%m-%d %H:%M"),
                            "container": container.container_no,
                            "site": container.site.name,
                            "db": connection,
                        }
                    )
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            corrupted_container_list.append(
                {
                    "date": each.eir_date.strftime("%Y-%m-%d"),
                    "container": each.container.container_no,
                    "site": each.container.site.name,
                    "db": connection,
                }
            )
    return {
        "corrupted": corrupted_container_list,
        "patched": patched_container_list,
    }


def get_df_data(data):
    try:
        date = [each.get("date") for each in data]
        container = [each.get("container") for each in data]
        site = [each.get("site") for each in data]
        db = [each.get("db") for each in data]
        main_data = [
            [
                date[i],
                container[i],
                site[i],
                db[i],
            ]
            for i in range(len(container))
        ]
        if len(main_data) == 0:
            main_data.append(["" for i in range(0, 3)])
        return main_data
    except:
        main_data = []
        main_data.append(["" for i in range(0, 3)])
        return main_data


def create_patch_report_wb(
    in_patched_df_data,
    out_patched_df_data,
    in_corrupted_df_data,
    out_corrupted_df_data,
):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR,
            f"temp/{random.randint(100000, 999999)}_patch_report_{date}{time}.xlsx",
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        in_patch_sheet = generic_workbook.add_worksheet("IN PATCHED")
        in_patch_sheet.add_table(
            f"A1:D{1 + len(in_patched_df_data)}",
            {
                "data": in_patched_df_data,
                "columns": [
                    {"header": "Date"},
                    {"header": "Container"},
                    {"header": "Site"},
                    {"header": "DB"},
                ],
            },
        )
        out_patch_sheet = generic_workbook.add_worksheet("OUT PATCHED")
        out_patch_sheet.add_table(
            f"A1:D{1 + len(out_patched_df_data)}",
            {
                "data": out_patched_df_data,
                "columns": [
                    {"header": "Date"},
                    {"header": "Container"},
                    {"header": "Site"},
                    {"header": "DB"},
                ],
            },
        )
        in_corrupted_sheet = generic_workbook.add_worksheet("IN CORRUPTED")
        in_corrupted_sheet.add_table(
            f"A1:D{1 + len(in_corrupted_df_data)}",
            {
                "data": in_corrupted_df_data,
                "columns": [
                    {"header": "Date"},
                    {"header": "Container"},
                    {"header": "Site"},
                    {"header": "DB"},
                ],
            },
        )
        out_corrupted_sheet = generic_workbook.add_worksheet("OUT CORRUPTED")
        out_corrupted_sheet.add_table(
            f"A1:D{1 + len(out_corrupted_df_data)}",
            {
                "data": out_corrupted_df_data,
                "columns": [
                    {"header": "Date"},
                    {"header": "Container"},
                    {"header": "Site"},
                    {"header": "DB"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path
    except:
        return None


@shared_task
def patch_process():
    lock = RedisLock(
        "in_out_patch_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}
    try:
        connection_list = [each for each in connections if not each == "analytics"]
        for connection in connection_list:
            in_patch_data = in_patch(connection)
            out_patch_data = out_patch(connection)
            if (
                not len(in_patch_data["corrupted"]) == 0
                or not len(out_patch_data["corrupted"]) == 0
                or not len(in_patch_data["patched"]) == 0
                or not len(out_patch_data["patched"]) == 0
            ):
                in_corrupted = get_df_data(data=in_patch_data["corrupted"])
                out_corrupted = get_df_data(data=out_patch_data["corrupted"])
                in_patched = get_df_data(data=in_patch_data["patched"])
                out_patched = get_df_data(data=out_patch_data["patched"])
                report_temp_file = create_patch_report_wb(
                    in_patched_df_data=in_patched,
                    out_patched_df_data=out_patched,
                    in_corrupted_df_data=in_corrupted,
                    out_corrupted_df_data=out_corrupted,
                )
                if report_temp_file is not None:
                    host = config("EMAIL_HOST")
                    port = 587
                    username = config("EMAIL_HOST_USER")
                    password = config("EMAIL_HOST_PASSWORD")
                    use_tls = True
                    email_connection = get_connection(
                        host=host,
                        username=username,
                        password=password,
                        port=port,
                        use_tls=use_tls,
                    )
                    email_date_time = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .strftime("%Y-%m-%d %H:%M")
                    )
                    msg = EmailMessage(
                        subject=f"Patch Notification {email_date_time}",
                        body=(
                            f"Please find the attachment,"
                            f"\n Patched --> IN --> {0 if len(in_patched[0][0]) == 0 else len(in_patched)}"
                            f"\n Patched --> OUT --> {0 if len(out_patched[0][0]) == 0 else len(out_patched)}"
                            f"\n Corrupted --> IN --> {0 if len(in_corrupted[0][0]) == 0 else len(in_corrupted)}"
                            f"\n Corrupted --> OUT --> {0 if len(out_corrupted[0][0]) == 0 else len(out_corrupted)}"
                            f"\nThanks and Regards\n"
                            f"Team"
                        ),
                        from_email=config("EMAIL_HOST_USER"),
                        to=[
                            "pooja.kumari@sunandpearls.com",
                        ],
                        cc=[
                            "manjot.bajwa@sunandpearls.com",
                        ],
                        connection=email_connection,
                    )
                    msg.attach_file(report_temp_file)
                    msg.send()
                    os.remove(report_temp_file)
                else:
                    pass
            else:
                pass
        return True
    except:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def mark_expire_pre_gate_process():
    lock = RedisLock(
        "mark_expire_pre_gate_process", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}
    try:
        _ = mark_expire_pre_gate()
        return True
    except:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False
    finally:
        lock.release()  # Release the lock after completion
