from __future__ import absolute_import, unicode_literals
import json
from celery import shared_task
from .cycle_functions import *
from .format_functions import *
import os
from master.models import Site
from report.functions import (
    inward_edi_tracking_main_data,
    outward_edi_tracking_main_data,
    inward_edi_movecode_tracking_main_data,
    outward_edi_movecode_tracking_main_data,
    user_data,
)
from report.xlsx_functions import create_edi_tracking_report_wb
from common.functions import send_sms
import random, ftplib
from .msc_edi_excel_generation import *
from mnr.functions import get_site_ftp_detail, upload_file_to_ftp_server
from django.db import connections
from .ftp_monitor_script import check_all_sites_ftp_folder_process
from common.redis_lock import RedisLock


@shared_task
def monitor_all_sites_ftp_folder_process():
    lock = RedisLock(
        "monitor_all_sites_ftp_folder_process", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}
    try:
        _ = check_all_sites_ftp_folder_process()
        return True
    except:
        logging.error(traceback.format_exc())
        return False
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def edi_process():
    lock = RedisLock(
        "edi_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        edi_data = get_edi_data()
        for each_connection_data in edi_data:
            if not len(edi_data[each_connection_data]) == 0:
                for each_data in edi_data[each_connection_data]:
                    if each_data == "CMA":
                        cma_data = edi_data[each_connection_data][each_data]
                        cma_site_data = get_site_wise_line_data(cma_data)
                        for each in cma_site_data:
                            cma_context = make_cma_edi(cma_site_data[each])
                            cma_mir_rwm_context = make_cma_mir_rwm_edi(
                                cma_site_data[each]
                            )
                            mir_rwm_obj_pk_list = cma_mir_rwm_context[
                                "mir_rwm_obj_pk_list"
                            ]
                            cma_attachment_list = []
                            edi_file_path = make_edi_file(
                                ref_code=cma_context["ref_code"],
                                site_code=cma_context["site_code"],
                                date=cma_context["date"],
                                time=cma_context["time"],
                                content=cma_context["content"],
                                move_code=None,
                            )
                            cma_attachment_list.append(edi_file_path)

                            for pk in mir_rwm_obj_pk_list:
                                cma_edi_obj = CmaEdiContent.objects.get(pk=pk)
                                random_no = str(random.randint(100000, 999999))
                                cma_moves_file_path = make_edi_file(
                                    ref_code=cma_context["ref_code"],
                                    site_code=cma_context["site_code"],
                                    date=f'{random_no}_{cma_edi_obj.date.date().strftime("%y%m%d")}',
                                    time=f'{cma_edi_obj.date.time().strftime("%H%M")}',
                                    content=cma_edi_obj.content,
                                    move_code=cma_edi_obj.move_code,
                                )
                                cma_edi_obj.is_deleted = True
                                cma_edi_obj.save()
                                cma_attachment_list.append(cma_moves_file_path)

                            try:
                                mei_context = cma_context["mei_data"]
                                mei_file_path = make_mei_file(
                                    ref_code=mei_context["ref_code"],
                                    site_code=mei_context["site_code"],
                                    date=mei_context["date"],
                                    time=mei_context["time"],
                                    content=mei_context["content"],
                                )
                                email_data = cma_context["email_data"]
                                site_object = Site.objects.using(
                                    each_connection_data
                                ).get(name=each)
                                organization = site_object.organization
                                cma_attachment_list.append(mei_file_path)
                                send_mail = send_edi_mail(
                                    ref_code=email_data["ref_code"],
                                    site=each,
                                    attachment_list=cma_attachment_list,
                                    from_email=email_data["from_email"],
                                    to_email_list=email_data["to_email_list"],
                                    cc_email_list=email_data["cc_email_list"],
                                    in_out_pk_dict=cma_context["in_out_pk_dict"],
                                    organization=organization,
                                )
                                for each_path in cma_attachment_list:
                                    os.remove(each_path)
                            except:
                                email_data = cma_context["email_data"]
                                site_object = Site.objects.using(
                                    each_connection_data
                                ).get(name=each)
                                organization = site_object.organization
                                send_mail = send_edi_mail(
                                    ref_code=email_data["ref_code"],
                                    site=each,
                                    attachment_list=cma_attachment_list,
                                    from_email=email_data["from_email"],
                                    to_email_list=email_data["to_email_list"],
                                    cc_email_list=email_data["cc_email_list"],
                                    in_out_pk_dict=cma_context["in_out_pk_dict"],
                                    organization=organization,
                                )
                                for each_path in cma_attachment_list:
                                    os.remove(each_path)

                    elif each_data == "CORDELIA":
                        cordelia_data = edi_data[each_connection_data][each_data]
                        cordelia_site_data = get_site_wise_line_data(cordelia_data)
                        for each in cordelia_site_data:
                            cordelia_context = make_cordelia_edi(
                                cordelia_site_data[each]
                            )
                            edi_file_path = make_edi_file(
                                ref_code=cordelia_context["ref_code"],
                                site_code=cordelia_context["site_code"],
                                depot_code=cordelia_context["depot_code"],
                                date=cordelia_context["date"],
                                time=cordelia_context["time"],
                                content=cordelia_context["content"],
                                move_code=None,
                            )
                            email_data = cordelia_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                depot_code=cordelia_context["depot_code"],
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=cordelia_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)
                    elif each_data == "FLK":
                        flk_data = edi_data[each_connection_data][each_data]
                        flk_site_data = get_site_wise_line_data(flk_data)
                        for each in flk_site_data:
                            flk_context = make_flk_edi(flk_site_data[each])
                            rcve_edi_file_path = None
                            rcvc_edi_file_path = None
                            trfe_edi_file_path = None
                            snts_edi_file_path = None
                            flk_attachment_list = []

                            if flk_context["rcve_content"]:
                                rcve_edi_file_path = make_edi_file(
                                    ref_code=flk_context["ref_code"],
                                    site_code=flk_context["site_code"],
                                    date=flk_context["date"],
                                    time=flk_context["time"],
                                    content=flk_context["rcve_content"],
                                    move_code="RCVE",
                                )
                                flk_attachment_list.append(rcve_edi_file_path)

                            if flk_context["rcvc_content"]:
                                rcvc_edi_file_path = make_edi_file(
                                    ref_code=flk_context["ref_code"],
                                    site_code=flk_context["site_code"],
                                    date=flk_context["date"],
                                    time=flk_context["time"],
                                    content=flk_context["rcvc_content"],
                                    move_code="RCVC",
                                )
                                flk_attachment_list.append(rcvc_edi_file_path)

                            if flk_context["trfe_content"]:
                                trfe_edi_file_path = make_edi_file(
                                    ref_code=flk_context["ref_code"],
                                    site_code=flk_context["site_code"],
                                    date=flk_context["date"],
                                    time=flk_context["time"],
                                    content=flk_context["trfe_content"],
                                    move_code="TRFE",
                                )
                                flk_attachment_list.append(trfe_edi_file_path)

                            if flk_context["snts_content"]:
                                snts_edi_file_path = make_edi_file(
                                    ref_code=flk_context["ref_code"],
                                    site_code=flk_context["site_code"],
                                    date=flk_context["date"],
                                    time=flk_context["time"],
                                    content=flk_context["snts_content"],
                                    move_code="SNTS",
                                )
                                flk_attachment_list.append(snts_edi_file_path)

                            email_data = flk_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=flk_attachment_list,
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=flk_context["in_out_pk_dict"],
                                organization=organization,
                            )

                            for each in flk_attachment_list:
                                os.remove(each)

                    elif each_data == "APL":
                        apl_data = edi_data[each_connection_data][each_data]
                        apl_site_data = get_site_wise_line_data(apl_data)
                        for each in apl_site_data:
                            apl_context = make_apl_edi(apl_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=apl_context["ref_code"],
                                site_code=apl_context["site_code"],
                                date=apl_context["date"],
                                time=apl_context["time"],
                                content=apl_context["content"],
                                move_code=None,
                            )

                            try:
                                mei_context = apl_context["mei_data"]
                                mei_file_path = make_mei_file(
                                    ref_code=mei_context["ref_code"],
                                    site_code=mei_context["site_code"],
                                    date=mei_context["date"],
                                    time=mei_context["time"],
                                    content=mei_context["content"],
                                )
                                email_data = apl_context["email_data"]
                                site_object = Site.objects.using(
                                    each_connection_data
                                ).get(name=each)
                                organization = site_object.organization
                                send_mail = send_edi_mail(
                                    ref_code=email_data["ref_code"],
                                    site=each,
                                    attachment_list=[edi_file_path, mei_file_path],
                                    from_email=email_data["from_email"],
                                    to_email_list=email_data["to_email_list"],
                                    cc_email_list=email_data["cc_email_list"],
                                    in_out_pk_dict=apl_context["in_out_pk_dict"],
                                    organization=organization,
                                )
                                os.remove(edi_file_path)
                                os.remove(mei_file_path)
                            except:
                                email_data = apl_context["email_data"]
                                site_object = Site.objects.using(
                                    each_connection_data
                                ).get(name=each)
                                organization = site_object.organization
                                send_mail = send_edi_mail(
                                    ref_code=email_data["ref_code"],
                                    site=each,
                                    attachment_list=[edi_file_path],
                                    from_email=email_data["from_email"],
                                    to_email_list=email_data["to_email_list"],
                                    cc_email_list=email_data["cc_email_list"],
                                    in_out_pk_dict=apl_context["in_out_pk_dict"],
                                    organization=organization,
                                )
                                os.remove(edi_file_path)

                    elif each_data == "ANL":
                        anl_data = edi_data[each_connection_data][each_data]
                        anl_site_data = get_site_wise_line_data(anl_data)
                        for each in anl_site_data:
                            anl_context = make_anl_edi(anl_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=anl_context["ref_code"],
                                site_code=anl_context["site_code"],
                                date=anl_context["date"],
                                time=anl_context["time"],
                                content=anl_context["content"],
                                move_code=None,
                            )

                            try:
                                mei_context = anl_context["mei_data"]
                                mei_file_path = make_mei_file(
                                    ref_code=mei_context["ref_code"],
                                    site_code=mei_context["site_code"],
                                    date=mei_context["date"],
                                    time=mei_context["time"],
                                    content=mei_context["content"],
                                )
                                email_data = anl_context["email_data"]
                                site_object = Site.objects.using(
                                    each_connection_data
                                ).get(name=each)
                                organization = site_object.organization
                                send_mail = send_edi_mail(
                                    ref_code=email_data["ref_code"],
                                    site=each,
                                    attachment_list=[edi_file_path, mei_file_path],
                                    from_email=email_data["from_email"],
                                    to_email_list=email_data["to_email_list"],
                                    cc_email_list=email_data["cc_email_list"],
                                    in_out_pk_dict=anl_context["in_out_pk_dict"],
                                    organization=organization,
                                )
                                os.remove(edi_file_path)
                                os.remove(mei_file_path)
                            except:
                                email_data = anl_context["email_data"]
                                site_object = Site.objects.using(
                                    each_connection_data
                                ).get(name=each)
                                organization = site_object.organization
                                send_mail = send_edi_mail(
                                    ref_code=email_data["ref_code"],
                                    site=each,
                                    attachment_list=[edi_file_path],
                                    from_email=email_data["from_email"],
                                    to_email_list=email_data["to_email_list"],
                                    cc_email_list=email_data["cc_email_list"],
                                    in_out_pk_dict=anl_context["in_out_pk_dict"],
                                    organization=organization,
                                )
                                os.remove(edi_file_path)

                    elif each_data == "HMM":
                        hmm_data = edi_data[each_connection_data][each_data]
                        hmm_site_data = get_site_wise_line_data(hmm_data)
                        for each in hmm_site_data:
                            hmm_context = make_hmm_edi(hmm_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=hmm_context["ref_code"],
                                site_code=hmm_context["site_code"],
                                date=hmm_context["date"],
                                time=hmm_context["time"],
                                content=hmm_context["content"],
                                move_code=None,
                            )
                            email_data = hmm_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=hmm_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "RCL":
                        rcl_data = edi_data[each_connection_data][each_data]
                        rcl_site_data = get_site_wise_line_data(rcl_data)
                        for each in rcl_site_data:
                            rcl_context = make_rcl_edi(rcl_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=rcl_context["ref_code"],
                                site_code=rcl_context["site_code"],
                                date=rcl_context["date"],
                                time=rcl_context["time"],
                                content=rcl_context["content"],
                                move_code=None,
                            )
                            email_data = rcl_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=rcl_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "TS LINE":
                        tsline_data = edi_data[each_connection_data][each_data]
                        tsline_site_data = get_site_wise_line_data(tsline_data)
                        for each in tsline_site_data:
                            tsline_context = make_tsline_edi(tsline_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=tsline_context["ref_code"],
                                site_code=tsline_context["site_code"],
                                date=tsline_context["date"],
                                time=tsline_context["time"],
                                content=tsline_context["content"],
                                move_code=None,
                            )
                            email_data = tsline_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=tsline_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "HAL":
                        hal_data = edi_data[each_connection_data][each_data]
                        hal_site_data = get_site_wise_line_data(hal_data)
                        for each in hal_site_data:
                            hal_context = make_hal_edi(hal_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=hal_context["ref_code"],
                                site_code=hal_context["site_code"],
                                date=hal_context["date"],
                                time=hal_context["time"],
                                content=hal_context["content"],
                                move_code=None,
                            )
                            email_data = hal_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=hal_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "ESL":
                        esl_data = edi_data[each_connection_data][each_data]
                        esl_site_data = get_site_wise_line_data(esl_data)
                        for each in esl_site_data:
                            esl_context = make_esl_edi(esl_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=esl_context["ref_code"],
                                site_code=esl_context["site_code"],
                                date=esl_context["date"],
                                time=esl_context["time"],
                                content=esl_context["content"],
                                move_code=None,
                            )
                            email_data = esl_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=esl_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "QNL":
                        qnl_data = edi_data[each_connection_data][each_data]
                        qnl_site_data = get_site_wise_line_data(qnl_data)
                        for each in qnl_site_data:
                            qnl_context = make_qnl_edi(qnl_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=qnl_context["ref_code"],
                                site_code=qnl_context["site_code"],
                                date=qnl_context["date"],
                                time=qnl_context["time"],
                                content=qnl_context["content"],
                                move_code=None,
                            )
                            email_data = qnl_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=qnl_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "MSK":
                        msk_data = edi_data[each_connection_data][each_data]
                        msk_site_data = get_site_wise_line_data(msk_data)
                        for each in msk_site_data:
                            msk_context = make_msk_edi(msk_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=msk_context["ref_code"],
                                site_code=msk_context["site_code"],
                                date=msk_context["date"],
                                time=msk_context["time"],
                                content=msk_context["content"],
                                move_code=None,
                            )
                            email_data = msk_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=msk_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "EGL":
                        egl_data = edi_data[each_connection_data][each_data]
                        egl_site_data = get_site_wise_line_data(egl_data)
                        for each in egl_site_data:
                            egl_context = make_egl_edi(egl_site_data[each])
                            edi_file_path = make_edi_file(
                                ref_code=egl_context["ref_code"],
                                site_code=egl_context["site_code"],
                                date=egl_context["date"],
                                time=egl_context["time"],
                                content=egl_context["content"],
                                move_code=None,
                            )
                            email_data = egl_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=[edi_file_path],
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=egl_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)
                    elif each_data == "ZIM":
                        zim_data = edi_data[each_connection_data][each_data]
                        zim_site_data = get_site_wise_line_data(zim_data)
                        for each in zim_site_data:
                            zim_context = make_zim_edi(zim_site_data[each])
                            attachment_list = []

                            # IN OUT EDI
                            edi_file_path = make_edi_file(
                                ref_code=zim_context["ref_code"],
                                site_code=zim_context["site_code"],
                                date=zim_context["date"],
                                time=zim_context["time"],
                                content=zim_context["content"],
                                move_code=None,
                            )
                            attachment_list.append(edi_file_path)

                            # dmg
                            dmg_edi_file_path = None
                            if zim_context["dmg_content"] is not None:
                                dmg_edi_file_path = make_edi_file(
                                    ref_code=zim_context["ref_code"],
                                    site_code=zim_context["site_code"],
                                    date=zim_context["date"],
                                    time=zim_context["time"],
                                    content=zim_context["dmg_content"],
                                    move_code=None,
                                    dmg=True,
                                )
                                attachment_list.append(dmg_edi_file_path)

                            # # back
                            # back_edi_file_path = None
                            # if zim_context["back_content"] is not None:
                            #     back_edi_file_path = make_edi_file(
                            #         ref_code=zim_context["ref_code"],
                            #         site_code=zim_context["site_code"],
                            #         date=zim_context["date"],
                            #         time=zim_context["time"],
                            #         content=zim_context["back_content"],
                            #         move_code=None,
                            #         back=True,
                            #     )
                            #     attachment_list.append(back_edi_file_path)

                            email_data = zim_context["email_data"]
                            site_object = Site.objects.using(each_connection_data).get(
                                name=each
                            )
                            organization = site_object.organization
                            send_mail = send_edi_mail(
                                ref_code=email_data["ref_code"],
                                site=each,
                                attachment_list=attachment_list,
                                from_email=email_data["from_email"],
                                to_email_list=email_data["to_email_list"],
                                cc_email_list=email_data["cc_email_list"],
                                in_out_pk_dict=zim_context["in_out_pk_dict"],
                                organization=organization,
                            )
                            os.remove(edi_file_path)

                    elif each_data == "MSC":
                        msc_data = edi_data[each_connection_data][each_data]
                        msc_site_data = get_site_wise_line_data(msc_data)
                        for each in msc_site_data:
                            if each == "TUTICORIN" or each == "KAKINADA":
                                msc_context_data_list = make_msc_tuticorin_edi(
                                    msc_site_data[each]
                                )
                            else:
                                msc_context = make_msc_edi(msc_site_data[each])

                    else:
                        pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def msc_edi_process():
    lock = RedisLock(
        "msc_move_code_edi_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}
    try:
        edi_data = get_remaining_msc_edi()
        for each_connection_data in edi_data:
            if not len(edi_data[each_connection_data]) == 0:
                for msc_context in edi_data[each_connection_data]:
                    if type(msc_context) is list:
                        attachment_list = []
                        in_pk_sublist = []
                        out_pk_sublist = []
                        for msc_move_code_context in msc_context:
                            in_pk_sublist.append(msc_move_code_context["in_pk_list"])
                            out_pk_sublist.append(msc_move_code_context["out_pk_list"])
                            edi_file_path = make_edi_file(
                                ref_code=msc_move_code_context["ref_code"],
                                site_code=msc_move_code_context["site_code"],
                                date=msc_move_code_context["date"],
                                time=msc_move_code_context["time"],
                                content=msc_move_code_context["content"],
                                move_code=msc_move_code_context["move_code"],
                            )
                            attachment_list.append(edi_file_path)
                        in_pk_list = [
                            element
                            for nestedlist in in_pk_sublist
                            for element in nestedlist
                        ]
                        out_pk_list = [
                            element
                            for nestedlist in out_pk_sublist
                            for element in nestedlist
                        ]
                        in_out_pk_dict = {
                            "in_pk_list": {each_connection_data: in_pk_list},
                            "out_pk_list": {each_connection_data: out_pk_list},
                        }
                        email_data = msc_context[0]["email_data"]
                        site = msc_context[0]["site"]
                        site_object = Site.objects.using(each_connection_data).get(
                            name=site
                        )
                        organization = site_object.organization
                        send_mail = send_edi_mail(
                            ref_code=email_data["ref_code"],
                            site=site,
                            attachment_list=attachment_list,
                            from_email=email_data["from_email"],
                            to_email_list=email_data["to_email_list"],
                            cc_email_list=email_data["cc_email_list"],
                            in_out_pk_dict=in_out_pk_dict,
                            organization=organization,
                        )
                        for path in attachment_list:
                            os.remove(path)
                    else:
                        edi_file_path = make_edi_file(
                            ref_code=msc_context["ref_code"],
                            site_code=msc_context["site_code"],
                            date=msc_context["date"],
                            time=msc_context["time"],
                            content=msc_context["content"],
                            move_code=None,
                        )
                        in_out_pk_dict = {
                            "in_pk_list": {
                                each_connection_data: msc_context["in_pk_list"]
                            },
                            "out_pk_list": {
                                each_connection_data: msc_context["out_pk_list"]
                            },
                        }
                        email_data = msc_context["email_data"]
                        site = msc_context["site"]
                        site_object = Site.objects.using(each_connection_data).get(
                            name=site
                        )
                        organization = site_object.organization
                        send_mail = send_edi_mail(
                            ref_code=email_data["ref_code"],
                            site=msc_context["site"],
                            attachment_list=[edi_file_path],
                            from_email=email_data["from_email"],
                            to_email_list=email_data["to_email_list"],
                            cc_email_list=email_data["cc_email_list"],
                            in_out_pk_dict=in_out_pk_dict,
                            organization=organization,
                        )
                        os.remove(edi_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def send_edi_mail_tracked_report():
    lock = RedisLock(
        "edi_tracker_report_mail_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}
    try:
        main_data = get_edi_tracking_data()
        for connection in main_data:
            edi_track_data = main_data[connection]["data"]
            date_data = main_data[connection]["date_data"]
            site_wise_edi_track_data = get_site_wise_line_data(edi_track_data)
            for site in site_wise_edi_track_data:
                mix_data = site_wise_edi_track_data[site]
                data = get_seperated_in_out_data(mix_data)
                in_data = data["in_data_dict"]
                out_data = data["out_data_dict"]
                site_object = Site.objects.using(connection).get(name=site)
                user_data_dict = user_data(
                    location=site_object.location, site=site_object
                )
                inward_df_data = inward_edi_tracking_main_data(
                    data_object_list=in_data, connection=connection
                )
                outward_df_data = outward_edi_tracking_main_data(
                    data_object_list=out_data, connection=connection
                )
                temp_file_path, date_str = create_edi_tracking_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    from_date_str=date_data["from_date_str"],
                    to_date_str=date_data["to_date_str"],
                    from_time_str=date_data["from_time_str"],
                    to_time_str=date_data["to_time_str"],
                    line="ALL",
                )
                email_data = get_site_user_email_mobile_data(site, connection)
                send_mail = send_edi_track_report_mail(
                    attachment_list=[temp_file_path],
                    from_email=email_data["from_email"],
                    to_email_list=email_data["to_email_list"],
                    date_data=date_data,
                    connection=connection,
                )
                os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def send_edi_mail_tracked_sms():
    lock = RedisLock(
        "edi_tracker_sms_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        main_data = get_edi_tracking_data()
        for connection in main_data:
            edi_track_data = main_data[connection]["data"]
            date_data = main_data[connection]["date_data"]
            from_date_str = date_data["from_date_str"]
            to_date_str = date_data["to_date_str"]
            from_time_str = date_data["from_time_str"]
            to_time_str = date_data["to_time_str"]
            site_wise_edi_track_data = get_site_wise_line_data(edi_track_data)
            for site in site_wise_edi_track_data:
                mix_data = site_wise_edi_track_data[site]
                line_wise_data = get_line_wise_data(mix_data)
                line_wise_tracked_detail = []
                for line in line_wise_data:
                    data = get_seperated_in_out_data(line_wise_data[line])
                    in_data = data["in_data_dict"]
                    email_in_data = [
                        each for each in in_data if each.is_email_sent is True
                    ]
                    out_data = data["out_data_dict"]
                    email_out_data = [
                        each for each in out_data if each.is_email_sent is True
                    ]
                    total_in = int(len(in_data))
                    total_email_in = int(len(email_in_data))
                    remaining_in = total_in - total_email_in
                    total_out = int(len(out_data))
                    total_email_out = int(len(email_out_data))
                    remaining_out = total_out - total_email_out
                    in_detail = (
                        f"{line}--> I={total_in}, E={total_email_in}, R={remaining_in}"
                    )
                    out_detail = f"{line}--> O={total_out}, E={total_email_out}, R={remaining_out}"
                    line_wise_tracked_detail.append(in_detail)
                    line_wise_tracked_detail.append(out_detail)
                message = (
                    "EDI MAIL DETAILS OF Last 12 hours\n"
                    f"From {from_date_str} {from_time_str} to {to_date_str} {to_time_str}\n\n"
                    f"I=Inward, O=Outward, E=Emailed, R=Remaining\n"
                    f"{json.dumps(line_wise_tracked_detail)}\n\n"
                    "Thanks & Regards\n"
                    "Team\n"
                )
                mobile_data = get_site_user_email_mobile_data(site, connection)
                from_no = mobile_data["from_mobile_no"]
                to_no_list = mobile_data["to_mobile_no_list"]
                for to_no in to_no_list:
                    send_sms(from_no=from_no, to_no=to_no, body=message)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


# def cma_edi_process():
#     try:
#         edi_data = get_remaining_cma_edi()
#         for each_connection_data in edi_data:
#             if not len(edi_data[each_connection_data]) == 0:
#                 for cma_context in edi_data[each_connection_data]:
#                     attachment_list = []
#                     for cma_move_code_context in cma_context:
#                         for content in cma_move_code_context["content_list"]:
#                             random_no = str(random.randint(100000, 999999))
#                             edi_file_path = make_edi_file(
#                                 ref_code=cma_move_code_context["ref_code"],
#                                 site_code=cma_move_code_context["site_code"],
#                                 date=f'{random_no}_{cma_move_code_context["date"]}',
#                                 time=cma_move_code_context["time"],
#                                 content=content,
#                                 move_code=cma_move_code_context["move_code"],
#                             )
#                             attachment_list.append(edi_file_path)
#                     email_data = cma_context[0]["email_data"]
#                     site = cma_context[0]["site"]
#                     site_object = Site.objects.using(each_connection_data).get(
#                         name=site
#                     )
#                     organization = site_object.organization
#                     send_mail = send_edi_mail(
#                         ref_code=email_data["ref_code"],
#                         site=site,
#                         attachment_list=attachment_list,
#                         from_email=email_data["from_email"],
#                         to_email_list=email_data["to_email_list"],
#                         cc_email_list=email_data["cc_email_list"],
#                         in_out_pk_dict=None,
#                         organization=organization,
#                     )
#                     for path in attachment_list:
#                         os.remove(path)
#         return True
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


# def create_cma_rwm_edi_object():
#     try:
#         edi_data = get_cma_rwm_edi_data()
#         for each_connection_data in edi_data:
#             if not len(edi_data[each_connection_data]) == 0:
#                 for each_data in edi_data[each_connection_data]:
#                     if each_data == "CMA":
#                         cma_data = edi_data[each_connection_data][each_data]
#                         cma_site_data = get_site_wise_line_data(cma_data)
#                         for each in cma_site_data:
#                             data_object_list = cma_site_data[each]
#                             hf_data = edi_hf_data(data_object_list[0])
#                             hf_current_location_code = hf_data["current_location_code"]
#                             hf_line = hf_data["line"]
#                             hf_date = hf_data["date"]
#                             hf_time = hf_data["time"]
#                             hf_site_code = hf_data["site_code"]
#                             for each_one in data_object_list:
#                                 db = each_connection_data
#                                 process = detect_rwm_process(each_one)
#                                 if process == "Line_OUT_Process":
#                                     list_of_content = []
#                                     cma_content_data = cma_edi_line_out_content_data(
#                                         each_one, rwm=True, stock=True
#                                     )
#                                     line_out_current_location_code = cma_content_data[
#                                         "current_location_code"
#                                     ]
#                                     line_out_date = cma_content_data["date"]
#                                     line_out_time = cma_content_data["time"]
#                                     line_out_size_code = cma_content_data["size_code"]
#                                     line_out_container_no = cma_content_data[
#                                         "container_no"
#                                     ]
#                                     # line_out_location_code = cma_content_data["location_code"]
#                                     line_out_booking_no = cma_content_data["booking_no"]
#                                     rwm_date_time = cma_content_data["rwm_date_time"]
#                                     line_out_merged_data = cma_edi_line_out_content_format(
#                                         current_location_code=line_out_current_location_code,
#                                         date=line_out_date,
#                                         time=line_out_time,
#                                         msg_no=1,
#                                         container_no=line_out_container_no,
#                                         size_code=line_out_size_code,
#                                         # location_code=line_out_location_code,
#                                         booking_no=line_out_booking_no,
#                                         rwm=True,
#                                     )
#                                     list_of_content.append(line_out_merged_data)
#                                     content = "\n".join(list_of_content)
#                                     formatted_edi_data = cma_edi_hf_format(
#                                         current_location_code=hf_current_location_code,
#                                         line=hf_line,
#                                         date=hf_date,
#                                         time=hf_time,
#                                         site_code=hf_site_code,
#                                         no_of_containers=1,
#                                         content=content,
#                                     )
#                                     site = each
#                                     if (
#                                         CmaEdiContent.objects.using(db)
#                                         .filter(
#                                             stock_data_id=each_one.pk,
#                                             process="line_in",
#                                             move_code="MIR",
#                                             site=site,
#                                             container_no=line_out_container_no,
#                                             is_deleted=True,
#                                         )
#                                         .exists()
#                                     ):
#                                         CmaEdiContent.objects.using(db).get_or_create(
#                                             date=rwm_date_time,
#                                             container_no=line_out_container_no,
#                                             content=formatted_edi_data,
#                                             process="line_out",
#                                             move_code="RWM",
#                                             site=site,
#                                             is_deleted=False,
#                                             is_regenerated=False,
#                                             stock_data_id=each_one.pk,
#                                         )
#                                         each_one.is_rwm_edi_sent = True
#                                         each_one.save(using=db)

#                                 elif process == "Party_OUT_Process":
#                                     list_of_content = []
#                                     cma_content_data = cma_edi_party_out_content_data(
#                                         each_one, rwm=True, stock=True
#                                     )
#                                     party_out_current_location_code = cma_content_data[
#                                         "current_location_code"
#                                     ]
#                                     party_out_date = cma_content_data["date"]
#                                     party_out_time = cma_content_data["time"]
#                                     party_out_size_code = cma_content_data["size_code"]
#                                     party_out_container_no = cma_content_data[
#                                         "container_no"
#                                     ]
#                                     # party_out_location_code = cma_content_data["location_code"]
#                                     party_out_booking_no = cma_content_data[
#                                         "booking_no"
#                                     ]
#                                     rwm_date_time = cma_content_data["rwm_date_time"]
#                                     party_out_merged_data = cma_edi_party_out_content_format(
#                                         current_location_code=party_out_current_location_code,
#                                         date=party_out_date,
#                                         time=party_out_time,
#                                         msg_no=1,
#                                         container_no=party_out_container_no,
#                                         size_code=party_out_size_code,
#                                         # location_code=party_out_location_code,
#                                         booking_no=party_out_booking_no,
#                                         rwm=True,
#                                     )
#                                     list_of_content.append(party_out_merged_data)
#                                     content = "\n".join(list_of_content)
#                                     formatted_edi_data = cma_edi_hf_format(
#                                         current_location_code=hf_current_location_code,
#                                         line=hf_line,
#                                         date=hf_date,
#                                         time=hf_time,
#                                         site_code=hf_site_code,
#                                         no_of_containers=1,
#                                         content=content,
#                                     )
#                                     site = each
#                                     if (
#                                         CmaEdiContent.objects.using(db)
#                                         .filter(
#                                             stock_data_id=each_one.pk,
#                                             process="party_in",
#                                             move_code="MIR",
#                                             site=site,
#                                             container_no=party_out_container_no,
#                                             is_deleted=True,
#                                         )
#                                         .exists()
#                                     ):
#                                         CmaEdiContent.objects.using(db).get_or_create(
#                                             date=rwm_date_time,
#                                             container_no=party_out_container_no,
#                                             content=formatted_edi_data,
#                                             process="party_out",
#                                             move_code="RWM",
#                                             site=site,
#                                             is_deleted=False,
#                                             is_regenerated=False,
#                                             stock_data_id=each_one.pk,
#                                         )
#                                         each_one.is_rwm_edi_sent = True
#                                         each_one.save(using=db)
#                                 else:
#                                     pass
#         return True
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


def create_excel_edi_tracker(data, connection, process):
    try:
        container = data.container
        container_no = container.container_no
        site = container.site.name
        client = container.client.name
        size = container.size.name
        type = container.type.name

        if process == "IN":
            in_data_id = data.pk
            out_data_id = None
            if (
                not EdiMailTracker.objects.using(connection)
                .filter(in_data_id=in_data_id, is_excel_edi=True)
                .exists()
            ):
                tracker_object = EdiMailTracker.objects.using(connection).create(
                    process_date=data.date.astimezone(timezone.get_current_timezone()),
                    client=client,
                    process_type=process,
                    container_no=container_no,
                    size=size,
                    type=type,
                    site=site,
                    in_data_id=in_data_id,
                    out_data_id=out_data_id,
                    is_excel_edi=True,
                )

                tracker_object.add_time_diff(connection=connection)
                tracker_object.is_auto = True
                tracker_object.save(using=connection, update_fields=["is_auto"])

            obj_list = MscExcelEdiMoveCodeInfo.objects.using(connection).filter(
                is_deleted=False, in_data_id=in_data_id
            )
            for each_data in obj_list:
                if (
                    not EdiMailTracker.objects.using(connection)
                    .filter(
                        in_data_id=in_data_id,
                        excel_edi_move_code=each_data.move_code,
                        is_excel_edi=True,
                    )
                    .exists()
                ):
                    tracker_object = EdiMailTracker.objects.using(connection).create(
                        process_date=each_data.date.astimezone(
                            timezone.get_current_timezone()
                        ),
                        client=client,
                        process_type=process,
                        container_no=container_no,
                        size=size,
                        type=type,
                        site=site,
                        in_data_id=in_data_id,
                        out_data_id=out_data_id,
                        excel_edi_move_code=each_data.move_code,
                        is_excel_edi=True,
                    )
                    tracker_object.add_time_diff(connection=connection)
                    tracker_object.is_auto = True
                    tracker_object.save(using=connection, update_fields=["is_auto"])

                    each_data.is_deleted = True
                    each_data.is_tracked = True
                    each_data.save(using=connection)
        else:
            in_data_id = None
            out_data_id = data.pk
            if (
                not EdiMailTracker.objects.using(connection)
                .filter(out_data_id=out_data_id, is_excel_edi=True)
                .exists()
            ):
                tracker_object = EdiMailTracker.objects.using(connection).create(
                    process_date=data.date.astimezone(timezone.get_current_timezone()),
                    client=client,
                    process_type=process,
                    container_no=container_no,
                    size=size,
                    type=type,
                    site=site,
                    in_data_id=in_data_id,
                    out_data_id=out_data_id,
                    is_excel_edi=True,
                )

                tracker_object.add_time_diff(connection=connection)
                tracker_object.is_auto = True
                tracker_object.save(using=connection, update_fields=["is_auto"])

            obj_list = MscExcelEdiMoveCodeInfo.objects.using(connection).filter(
                is_deleted=False, out_data_id=out_data_id
            )
            for each_data in obj_list:
                if (
                    not EdiMailTracker.objects.using(connection)
                    .filter(
                        out_data_id=out_data_id,
                        excel_edi_move_code=each_data.move_code,
                        is_excel_edi=True,
                    )
                    .exists()
                ):
                    tracker_object = EdiMailTracker.objects.using(connection).create(
                        process_date=each_data.date.astimezone(
                            timezone.get_current_timezone()
                        ),
                        client=client,
                        process_type=process,
                        container_no=container_no,
                        size=size,
                        type=type,
                        site=site,
                        in_data_id=in_data_id,
                        out_data_id=out_data_id,
                        excel_edi_move_code=each_data.move_code,
                        is_excel_edi=True,
                    )

                    tracker_object.add_time_diff(connection=connection)
                    tracker_object.is_auto = True
                    tracker_object.save(using=connection, update_fields=["is_auto"])

                    each_data.is_deleted = True
                    each_data.is_tracked = True
                    each_data.save(using=connection)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


@shared_task
def msc_in_excel_edi_upload_process():
    lock = RedisLock(
        "msc_in_excel_edi_upload_process", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        edi_data = get_msc_in_excel_edi_data()
        for each_connection_data in edi_data:
            if not len(edi_data[each_connection_data]) == 0:
                msc_data = edi_data[each_connection_data]
                msc_site_data = get_site_wise_line_data(msc_data)
                for each in msc_site_data:
                    location = msc_site_data[each][0].container.location
                    site = msc_site_data[each][0].container.site
                    # process data
                    msc_df_data_dict = get_msc_edi_excel_main_data(
                        data_object_list=msc_site_data[each]
                    )
                    if not msc_df_data_dict is None:
                        msc_df_data = msc_df_data_dict["main_data"]
                        eligible_data_list = msc_df_data_dict["eligible_data_list"]
                        # filename
                        tz = timezone.get_current_timezone()
                        today = datetime.datetime.now().astimezone(tz)
                        date = today.date().strftime("%d%m%Y")
                        time = today.time().strftime("%H%M%S")
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_GOLDENHORN_GATEIN_{date}{time}"

                        if site.name.upper() in ["HEMC HALDIA", "HEMC KOLKATA"]:
                            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_HEMC_GATEIN_{date}{time}"

                        if site.name.upper() == "MATRIX":
                            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_MATRIXCONTAINERYARD_GATEIN_{date}{time}"

                        if site.name.upper() == "PGL DEPOT":
                            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_PGLPL_GATEIN_{date}{time}"

                        if site.name.upper() == "OM SHAILSHUTA LPL DEPOT":
                            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSHAILSHUTALPL_GATEIN_{date}{time}"

                        if site.name.upper() == "OMSSGRFL SAHNEWAL":
                            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSSGRFLSAHNEWAL_GATEIN_{date}{time}"

                        if site.name.upper() == "SATTVA CFS":
                            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_SATTVACFS_GATEIN_{date}{time}"

                        # file creation
                        temp_file_path = make_msc_edi_excel_file(
                            context=msc_df_data, filename=file_name
                        )
                        """ftp stuff"""
                        session = ftplib.FTP(
                            config("WINDOWS_FTP_HOST"),
                            config("WINDOWS_FTP_USERNAME"),
                            config("WINDOWS_FTP_PASSWORD"),
                        )
                        file = open(temp_file_path, "rb")
                        session.storbinary(
                            f"STOR /inetpub/myFTPDirectory/edi_excel_files/{site.name.upper()}/{file_name}.xlsx",
                            file,
                        )
                        file.close()
                        session.quit()

                        for one in eligible_data_list:
                            one.is_msc_excel_edi_sent = True
                            one.save(using=each_connection_data)
                            create_excel_edi_tracker(
                                data=one, connection=each_connection_data, process="IN"
                            )
                        os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def msc_out_excel_edi_upload_process():
    lock = RedisLock(
        "msc_out_excel_edi_upload_process", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        edi_data = get_msc_out_excel_edi_data()
        for each_connection_data in edi_data:
            if not len(edi_data[each_connection_data]) == 0:
                msc_data = edi_data[each_connection_data]
                msc_site_data = get_site_wise_line_data(msc_data)
                for each in msc_site_data:
                    location = msc_site_data[each][0].container.location
                    site = msc_site_data[each][0].container.site
                    # process data
                    msc_df_data_dict = get_msc_edi_excel_main_data(
                        data_object_list=msc_site_data[each]
                    )
                    msc_df_data = msc_df_data_dict["main_data"]
                    eligible_data_list = msc_df_data_dict["eligible_data_list"]
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d%m%Y")
                    time = today.time().strftime("%H%M%S")
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_GOLDENHORN_GATEOUT_{date}{time}"

                    if site.name.upper() in ["HEMC HALDIA", "HEMC KOLKATA"]:
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_HEMC_GATEOUT_{date}{time}"

                    if site.name.upper() == "MATRIX":
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_MATRIXCONTAINERYARD_GATEOUT_{date}{time}"

                    if site.name.upper() == "PGL DEPOT":
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_PGLPL_GATEOUT_{date}{time}"

                    if site.name.upper() == "OM SHAILSHUTA LPL DEPOT":
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSHAILSHUTALPL_GATEOUT_{date}{time}"

                    if site.name.upper() == "OMSSGRFL SAHNEWAL":
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSSGRFLSAHNEWAL_GATEOUT_{date}{time}"

                    if site.name.upper() == "SATTVA CFS":
                        file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_SATTVACFS_GATEOUT_{date}{time}"

                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    """ftp stuff"""
                    session = ftplib.FTP(
                        config("WINDOWS_FTP_HOST"),
                        config("WINDOWS_FTP_USERNAME"),
                        config("WINDOWS_FTP_PASSWORD"),
                    )
                    file = open(temp_file_path, "rb")
                    session.storbinary(
                        f"STOR /inetpub/myFTPDirectory/edi_excel_files/{site.name.upper()}/{file_name}.xlsx",
                        file,
                    )
                    file.close()
                    session.quit()

                    for one in eligible_data_list:
                        one.is_msc_excel_edi_sent = True
                        one.save(using=each_connection_data)
                        create_excel_edi_tracker(
                            data=one, connection=each_connection_data, process="OUT"
                        )
                    os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def send_msc_edi_movecode_mail_tracked_report():
    lock = RedisLock(
        "msc_move_code_edi_tracker_report_mail_service",
        expire=120,
        heartbeat_interval=30,
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        main_data = get_edi_tracking_data(move_code_tracking=True)
        for connection in main_data:
            edi_track_data = main_data[connection]["data"]
            date_data = main_data[connection]["date_data"]
            site_wise_edi_track_data = get_site_wise_line_data(edi_track_data)
            for site in site_wise_edi_track_data:
                mix_data = site_wise_edi_track_data[site]
                data = get_seperated_in_out_data(mix_data)
                in_data = data["in_data_dict"]
                out_data = data["out_data_dict"]
                site_object = Site.objects.using(connection).get(name=site)
                user_data_dict = user_data(
                    location=site_object.location, site=site_object
                )
                inward_df_data = inward_edi_movecode_tracking_main_data(
                    data_object_list=in_data,
                    connection=connection,
                )
                outward_df_data = outward_edi_movecode_tracking_main_data(
                    data_object_list=out_data,
                    connection=connection,
                )
                temp_file_path, date_str = create_edi_tracking_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    from_date_str=date_data["from_date_str"],
                    to_date_str=date_data["to_date_str"],
                    from_time_str=date_data["from_time_str"],
                    to_time_str=date_data["to_time_str"],
                    line="ALL",
                    move_code_tracking=True,
                )
                email_data = get_site_user_email_mobile_data(site, connection)
                send_mail = send_edi_track_report_mail(
                    attachment_list=[temp_file_path],
                    from_email=email_data["from_email"],
                    to_email_list=email_data["to_email_list"],
                    date_data=date_data,
                    connection=connection,
                    move_code_tracking=True,
                )
                os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def create_movecode_edi_mail_track_objects():
    lock = RedisLock(
        "create_movecode_edi_mail_track_objects_process",
        expire=120,
        heartbeat_interval=30,
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        connection_list = [each for each in connections if not each == "analytics"]
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        fourty_eight_hour_before = now - datetime.timedelta(hours=48)
        for connection in connection_list:
            obj_list = MscEdiContent.objects.using(connection).filter(
                date__range=(fourty_eight_hour_before, now),
                is_tracked=False,
                is_deleted=True,
            )
            for each in obj_list:
                if each.in_data_id is not None:
                    try:
                        container_no = each.container_no
                        site = each.site
                        container = Container.objects.using(connection).get(
                            container_no=container_no,
                            site__name__icontains=site,
                            site__type="DEPOT",
                        )
                        client = container.client.name
                        size = container.size.name
                        type = container.type.name
                        in_data_id = each.in_data_id
                        out_data_id = None
                        process_date = each.date.astimezone(
                            timezone.get_current_timezone()
                        )
                        if (
                            not EdiMailTracker.objects.using(connection)
                            .filter(
                                in_data_id=in_data_id,
                                is_excel_edi=False,
                                move_code=each.move_code,
                            )
                            .exists()
                        ):
                            tracker_object = EdiMailTracker.objects.using(
                                connection
                            ).create(
                                process_date=process_date,
                                client=client,
                                process_type="IN",
                                container_no=container_no,
                                size=size,
                                type=type,
                                site=site,
                                in_data_id=in_data_id,
                                out_data_id=out_data_id,
                                move_code=each.move_code,
                            )
                            tracker_object.save(using=connection)
                            tracker_object.add_time_diff(connection=connection)
                            tracker_object.is_auto = True
                            tracker_object.save(using=connection)
                            each.is_tracked = True
                            each.save(using=connection)
                    except:
                        error_log = logging.getLogger("error_log")
                        error_log.error(traceback.format_exc())
                        pass
                else:
                    try:
                        container_no = each.container_no
                        site = each.site
                        container = Container.objects.using(connection).get(
                            container_no=container_no,
                            site__name__icontains=site,
                            site__type="DEPOT",
                        )
                        client = container.client.name
                        size = container.size.name
                        type = container.type.name
                        in_data_id = None
                        out_data_id = each.out_data_id
                        process_date = each.date.astimezone(
                            timezone.get_current_timezone()
                        )
                        if (
                            not EdiMailTracker.objects.using(connection)
                            .filter(
                                out_data_id=out_data_id,
                                is_excel_edi=False,
                                move_code=each.move_code,
                            )
                            .exists()
                        ):
                            tracker_object = EdiMailTracker.objects.using(
                                connection
                            ).create(
                                process_date=process_date,
                                client=client,
                                process_type="OUT",
                                container_no=container_no,
                                size=size,
                                type=type,
                                site=site,
                                in_data_id=in_data_id,
                                out_data_id=out_data_id,
                                move_code=each.move_code,
                            )
                            tracker_object.save(using=connection)
                            tracker_object.add_time_diff(connection=connection)
                            tracker_object.is_auto = True
                            tracker_object.save(using=connection)
                            each.is_tracked = True
                            each.save(using=connection)
                    except:
                        error_log = logging.getLogger("error_log")
                        error_log.error(traceback.format_exc())
                        pass

        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


def create_movecode_edi_mail_track_objects_support(obj_list):
    try:
        # obj_list = MscEdiContent.objects.exclude(move_code=None).filter(is_tracked=False, is_deleted=True)
        print(f"starts with ... {obj_list.count()}")
        count = 0
        for each in obj_list:
            count = count + 1
            container_no = each.container_no
            site = each.site
            container = Container.objects.get(
                container_no=container_no,
                site__name__icontains=site,
                site__type="DEPOT",
            )
            client = container.client.name
            size = container.size.name
            type = container.type.name
            in_data_id = each.in_data_id
            out_data_id = each.out_data_id
            process_date = each.date.astimezone(timezone.get_current_timezone())
            if not each.in_data_id is None:
                if not EdiMailTracker.objects.filter(
                    in_data_id=in_data_id, is_excel_edi=False, move_code=each.move_code
                ).exists():
                    print("IM in IN")
                    tracker_object = EdiMailTracker.objects.create(
                        process_date=process_date,
                        client=client,
                        process_type="IN",
                        container_no=container_no,
                        size=size,
                        type=type,
                        site=site,
                        in_data_id=in_data_id,
                        out_data_id=out_data_id,
                        move_code=each.move_code,
                    )
                    tracker_object.save()
                    tracker_object.add_time_diff()
                    tracker_object.is_auto = True
                    tracker_object.save()
                    each.is_tracked = True
                    each.save()
            elif not each.out_data_id is None:
                if not EdiMailTracker.objects.filter(
                    out_data_id=out_data_id,
                    is_excel_edi=False,
                    move_code=each.move_code,
                ).exists():
                    print("IM in OUT")
                    tracker_object = EdiMailTracker.objects.create(
                        process_date=process_date,
                        client=client,
                        process_type="OUT",
                        container_no=container_no,
                        size=size,
                        type=type,
                        site=site,
                        in_data_id=in_data_id,
                        out_data_id=out_data_id,
                        move_code=each.move_code,
                    )
                    tracker_object.save()
                    tracker_object.add_time_diff()
                    tracker_object.is_auto = True
                    tracker_object.save()
                    each.is_tracked = True
                    each.save()
            else:
                print("IM in Nothing")
            print(f"{count}...of..{obj_list.count()}")
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def faridabad_msc_in_excel_edi_upload_process():
#     try:
#         edi_data = get_faridabad_msc_in_excel_edi_data()
#         location = Location.objects.get(name="HARYANA")
#         site = Site.objects.get(name="FARIDABAD", location=location)
#         if not len(edi_data) == 0:
#             # process data
#             msc_df_data, in_pk_list, out_pk_list = get_faridabad_msc_edi_excel_main_data(
#                 data_object_list=edi_data
#             )
#             # filename
#             tz = timezone.get_current_timezone()
#             today = datetime.datetime.now().astimezone(tz)
#             date = today.date().strftime("%d_%m_%Y")
#             time = today.time().strftime("%H_%M_%S")
#             file_name = (f"{site.event_location_msc_code}_{site.depot_msc_code}_GOLDENHORN_GATEIN_{date}{time}")
#             # file creation
#             temp_file_path = make_msc_edi_excel_file(
#                 context=msc_df_data, filename=file_name
#             )
#             """ftp stuff"""
#             session = ftplib.FTP(
#                 config("WINDOWS_FTP_HOST"),
#                 config("WINDOWS_FTP_USERNAME"),
#                 config("WINDOWS_FTP_PASSWORD"),
#             )
#             file = open(temp_file_path, "rb")
#             session.storbinary(
#                 f"STOR /edi_excel_files/{site.name.upper()}/{file_name}.xlsx",
#                 file,
#             )
#             file.close()
#             session.quit()

#             if not len(in_pk_list) == 0:
#                 for each in in_pk_list:
#                     obj = NonDepotGateIn.objects.get(pk=each)
#                     obj.is_msc_excel_edi_sent = True
#                     obj.save()

#             os.remove(temp_file_path)
#         return True
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


# def faridabad_msc_out_excel_edi_upload_process():
#     try:
#         edi_data = get_faridabad_msc_out_excel_edi_data()
#         location = Location.objects.get(name="HARYANA")
#         site = Site.objects.get(name="FARIDABAD", location=location)
#         if not len(edi_data) == 0:
#             # process data
#             msc_df_data, in_pk_list, out_pk_list = get_faridabad_msc_edi_excel_main_data(
#                 data_object_list=edi_data
#             )
#             # filename
#             tz = timezone.get_current_timezone()
#             today = datetime.datetime.now().astimezone(tz)
#             date = today.date().strftime("%d_%m_%Y")
#             time = today.time().strftime("%H_%M_%S")
#             file_name = (f"{site.event_location_msc_code}_{site.depot_msc_code}_GOLDENHORN_GATEOUT_{date}{time}")
#             # file creation
#             temp_file_path = make_msc_edi_excel_file(
#                 context=msc_df_data, filename=file_name
#             )
#             """ftp stuff"""
#             session = ftplib.FTP(
#                 config("WINDOWS_FTP_HOST"),
#                 config("WINDOWS_FTP_USERNAME"),
#                 config("WINDOWS_FTP_PASSWORD"),
#             )
#             file = open(temp_file_path, "rb")
#             session.storbinary(
#                 f"STOR /edi_excel_files/{site.name.upper()}/{file_name}.xlsx",
#                 file,
#             )
#             file.close()
#             session.quit()

#             if not len(out_pk_list) == 0:
#                 for each in out_pk_list:
#                     obj = NonDepotGateOut.objects.get(pk=each)
#                     obj.is_msc_excel_edi_sent = True
#                     obj.save()
#             os.remove(temp_file_path)
#         return True
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


@shared_task
def msc_edi_useless_db_object_delete():
    lock = RedisLock(
        "msc_edi_useless_db_object_delete_service",
        expire=120,
        heartbeat_interval=30,
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date_one_month = dt - datetime.timedelta(days=30)
        MscREdiContent.objects.filter(is_deleted=True).delete()
        MscEdiContent.objects.filter(date__lte=date_one_month, is_deleted=True).delete()
        MscExcelEdiMoveCodeInfo.objects.filter(
            date__lte=date_one_month, is_deleted=True
        ).delete()
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion
