# model imports
from depot.models import GateInHistory, GateOutHistory
from master.models import Location, Site
from edi.models import *

# functions imports
from edi.functions import *
from edi.data_collecter_functions import *
from edi.cycle_functions import *

# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
from django.http import HttpResponse
import datetime, zipfile
from account.permissions import HasAllowedRoles


class DownloadEmailEdi(views.APIView):
    """the post function will generate edi"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "Loaded Yard",
    ]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=400)
        try:

            data = request.data
            process = data["process"]
            edi_move_code_process = data.get("edi_move_code_process", None)
            edi_move_code = data.get("edi_move_code", None)
            location_str = data["location"]
            site_str = data["site"]
            location = Location.objects.get(name=location_str)
            site = Site.objects.get(name=site_str)
            main_data = None
            in_out_pk_dict = None
            line, gate_object = get_redi_data(request=request)
            if type(gate_object) is dict:
                return Response(gate_object, status=400)

            if line == "cma":
                cma_context = make_cma_edi(data=gate_object)
                cma_mir_rwm_edi = make_cma_mir_rwm_edi(
                    data=gate_object, regenerate=True
                )
                mir_rwm_obj_pk_list = cma_mir_rwm_edi["mir_rwm_obj_pk_list"]
                in_out_pk_dict = cma_context["in_out_pk_dict"]
                attachment_list = []
                edi_file_path = make_edi_file(
                    ref_code=cma_context["ref_code"],
                    site_code=cma_context["site_code"],
                    date=cma_context["date"],
                    time=cma_context["time"],
                    content=cma_context["content"],
                    move_code=None,
                )
                attachment_list.append(edi_file_path)

                for pk in mir_rwm_obj_pk_list:
                    cma_edi_obj = CmaEdiContent.objects.get(pk=pk)
                    edi_file_path = make_edi_file(
                        ref_code=cma_context["ref_code"],
                        site_code=cma_context["site_code"],
                        date=f'{pk}_{cma_edi_obj.date.date().strftime("%y%m%d")}',
                        time=f'{cma_edi_obj.date.time().strftime("%H%M")}_{pk}',
                        content=cma_edi_obj.content,
                        move_code=cma_edi_obj.move_code,
                    )
                    cma_edi_obj.is_deleted = True
                    cma_edi_obj.save()
                    attachment_list.append(edi_file_path)
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
                    main_data = {
                        "edi_file_path": attachment_list,
                        "mei_file_path": mei_file_path,
                        "email_data": email_data,
                        "process": process,
                    }

                except:
                    email_data = cma_context["email_data"]
                    main_data = {
                        "edi_file_path": attachment_list,
                        "email_data": email_data,
                        "process": process,
                    }

            elif line == "flk":
                flk_context = make_flk_edi(data=gate_object)
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
                main_data = {
                    "edi_file_path": flk_attachment_list,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "cordelia":
                cordelia_context = make_cordelia_edi(data=gate_object)
                in_out_pk_dict = cordelia_context["in_out_pk_dict"]
                attachment_list = []
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
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "apl":
                apl_context = make_apl_edi(data=gate_object)
                in_out_pk_dict = apl_context["in_out_pk_dict"]
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
                    main_data = {
                        "edi_file_path": edi_file_path,
                        "mei_file_path": mei_file_path,
                        "email_data": email_data,
                        "process": process,
                    }

                except:
                    email_data = apl_context["email_data"]
                    main_data = {
                        "edi_file_path": edi_file_path,
                        "email_data": email_data,
                        "process": process,
                    }

            elif line == "anl":
                anl_context = make_anl_edi(data=gate_object)
                in_out_pk_dict = anl_context["in_out_pk_dict"]
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
                    main_data = {
                        "edi_file_path": edi_file_path,
                        "mei_file_path": mei_file_path,
                        "email_data": email_data,
                        "process": process,
                    }

                except:
                    email_data = anl_context["email_data"]
                    main_data = {
                        "edi_file_path": edi_file_path,
                        "email_data": email_data,
                        "process": process,
                    }

            elif line == "hmm":
                hmm_context = make_hmm_edi(data=gate_object)
                in_out_pk_dict = hmm_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=hmm_context["ref_code"],
                    site_code=hmm_context["site_code"],
                    date=hmm_context["date"],
                    time=hmm_context["time"],
                    content=hmm_context["content"],
                    move_code=None,
                )
                email_data = hmm_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "rcl":
                rcl_context = make_rcl_edi(data=gate_object)
                in_out_pk_dict = rcl_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=rcl_context["ref_code"],
                    site_code=rcl_context["site_code"],
                    date=rcl_context["date"],
                    time=rcl_context["time"],
                    content=rcl_context["content"],
                    move_code=None,
                )
                email_data = rcl_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "ts line":
                tsline_context = make_tsline_edi(data=gate_object)
                in_out_pk_dict = tsline_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=tsline_context["ref_code"],
                    site_code=tsline_context["site_code"],
                    date=tsline_context["date"],
                    time=tsline_context["time"],
                    content=tsline_context["content"],
                    move_code=None,
                )
                email_data = tsline_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "hal":
                hal_context = make_hal_edi(data=gate_object)
                in_out_pk_dict = hal_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=hal_context["ref_code"],
                    site_code=hal_context["site_code"],
                    date=hal_context["date"],
                    time=hal_context["time"],
                    content=hal_context["content"],
                    move_code=None,
                )
                email_data = hal_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "esl":
                esl_context = make_esl_edi(data=gate_object)
                in_out_pk_dict = esl_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=esl_context["ref_code"],
                    site_code=esl_context["site_code"],
                    date=esl_context["date"],
                    time=esl_context["time"],
                    content=esl_context["content"],
                    move_code=None,
                )
                email_data = esl_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "qnl":
                qnl_context = make_qnl_edi(data=gate_object)
                in_out_pk_dict = qnl_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=qnl_context["ref_code"],
                    site_code=qnl_context["site_code"],
                    date=qnl_context["date"],
                    time=qnl_context["time"],
                    content=qnl_context["content"],
                    move_code=None,
                )
                email_data = qnl_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "msk":
                msk_context = make_msk_edi(data=gate_object)
                in_out_pk_dict = msk_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=msk_context["ref_code"],
                    site_code=msk_context["site_code"],
                    date=msk_context["date"],
                    time=msk_context["time"],
                    content=msk_context["content"],
                    move_code=None,
                )
                email_data = msk_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "egl":
                egl_context = make_egl_edi(data=gate_object)
                in_out_pk_dict = egl_context["in_out_pk_dict"]
                edi_file_path = make_edi_file(
                    ref_code=egl_context["ref_code"],
                    site_code=egl_context["site_code"],
                    date=egl_context["date"],
                    time=egl_context["time"],
                    content=egl_context["content"],
                    move_code=None,
                )
                email_data = egl_context["email_data"]
                main_data = {
                    "edi_file_path": edi_file_path,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "zim":
                zim_context = make_zim_edi(data=gate_object)
                in_out_pk_dict = zim_context["in_out_pk_dict"]
                attachment_list = []
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
                main_data = {
                    "edi_file_path": attachment_list,
                    "email_data": email_data,
                    "process": process,
                }

            elif line == "msc":
                if (
                    not edi_move_code_process is None
                    and not edi_move_code is None
                    and not len(edi_move_code_process) == 0
                    and not len(edi_move_code) == 0
                ):
                    msc_context = None
                    if (
                        str(site.name).lower() == "tuticorin"
                        or str(site.name).lower() == "kakinada"
                    ):
                        msc_context = create_msc_tuticorin_movecodewise_redi(
                            data=gate_object,
                            process=edi_move_code_process,
                            move_code=edi_move_code,
                        )
                    else:
                        msc_context = create_msc_movecodewise_redi(
                            data=gate_object,
                            process=edi_move_code_process,
                            move_code=edi_move_code,
                        )

                    if msc_context is None:
                        return Response({"errorMsg": f"Data Not Found"}, status=400)
                    else:
                        in_out_pk_dict = None
                        edi_file_path = make_edi_file(
                            ref_code=msc_context["ref_code"],
                            site_code=msc_context["site_code"],
                            date=msc_context["date"],
                            time=msc_context["time"],
                            content=msc_context["content"],
                            move_code=edi_move_code,
                        )
                        email_data = msc_context["email_data"]
                        main_data = {
                            "edi_file_path": edi_file_path,
                            "email_data": email_data,
                            "process": process,
                        }
                else:
                    if (
                        str(site.name).lower() == "tuticorin"
                        or str(site.name).lower() == "kakinada"
                    ):
                        msc_context = make_msc_tuticorin_redi(data=gate_object)
                        in_out_pk_dict = msc_context[0]["in_out_pk_dict"]
                        attachment_list = []
                        for move_code_context in msc_context:
                            edi_file_path = make_edi_file(
                                ref_code=move_code_context["ref_code"],
                                site_code=move_code_context["site_code"],
                                date=move_code_context["date"],
                                time=move_code_context["time"],
                                content=move_code_context["content"],
                                move_code=move_code_context["move_code"],
                            )
                            attachment_list.append(edi_file_path)
                        email_data = msc_context[0]["email_data"]
                        main_data = {
                            "edi_file_path": attachment_list,
                            "email_data": email_data,
                            "process": process,
                        }
                    else:
                        msc_context = make_msc_redi(data=gate_object)
                        in_out_pk_dict = msc_context["in_out_pk_dict"]
                        edi_file_path = make_edi_file(
                            ref_code=msc_context["ref_code"],
                            site_code=msc_context["site_code"],
                            date=msc_context["date"],
                            time=msc_context["time"],
                            content=msc_context["content"],
                            move_code=None,
                        )
                        email_data = msc_context["email_data"]
                        main_data = {
                            "edi_file_path": edi_file_path,
                            "email_data": email_data,
                            "process": process,
                        }
            data = main_data
            if type(data["edi_file_path"]) is list:
                edi_file_path = data["edi_file_path"]
            else:
                edi_file_path = [data["edi_file_path"]]
            try:
                mei_file_path = [data["mei_file_path"]]
            except:
                mei_file_path = None
            process = data["process"]

            if process == "D":
                email_data = data["email_data"]
                dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
                date = dt.date().strftime("%Y%m%d")
                time = dt.time().strftime("%H%M%S")
                ref_code = email_data["ref_code"]

                if not os.path.exists(os.path.join(BASE_DIR, f"temp/zip/")):
                    os.makedirs(os.path.join(BASE_DIR, f"temp/zip/"))
                temp_zip_file_path = os.path.join(
                    BASE_DIR, f"temp/zip/{site.name}{date}{time}.zip"
                )

                if not mei_file_path is None:
                    attachments = edi_file_path + mei_file_path
                    with zipfile.ZipFile(temp_zip_file_path, "w") as zipF:
                        for file in attachments:
                            arcname = file.split(os.path.join(BASE_DIR, f"temp/"))[1]
                            zipF.write(
                                file,
                                compress_type=zipfile.ZIP_DEFLATED,
                                arcname=arcname,
                            )
                    with open(temp_zip_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/zip"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{site.name}{date}{time}.zip"'
                        )

                        for path in attachments:
                            os.remove(path)
                        os.remove(temp_zip_file_path)
                else:
                    with zipfile.ZipFile(temp_zip_file_path, "w") as zipF:
                        for file in edi_file_path:
                            arcname = file.split(os.path.join(BASE_DIR, f"temp/"))[1]
                            zipF.write(
                                file,
                                compress_type=zipfile.ZIP_DEFLATED,
                                arcname=arcname,
                            )

                    with open(temp_zip_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/zip"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{site.name}{date}{time}.zip"'
                        )

                        for path in edi_file_path:
                            os.remove(path)
                        os.remove(temp_zip_file_path)
                return file_response

            elif process == "DE" and not in_out_pk_dict is None:
                dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
                date = dt.date().strftime("%Y%m%d")
                time = dt.time().strftime("%H%M%S")

                if not os.path.exists(os.path.join(BASE_DIR, f"temp/zip/")):
                    os.makedirs(os.path.join(BASE_DIR, f"temp/zip/"))
                temp_zip_file_path = os.path.join(
                    BASE_DIR, f"temp/zip/{site.name}{date}{time}.zip"
                )

                if mei_file_path is None:
                    email_data = data["email_data"]
                    if line == "cordelia":
                        send_edi_mail(
                            ref_code=email_data["ref_code"],
                            site=site.name,
                            depot_code=site.depot_code,
                            attachment_list=edi_file_path,
                            from_email=email_data["from_email"],
                            to_email_list=email_data["to_email_list"],
                            cc_email_list=email_data["cc_email_list"],
                            in_out_pk_dict=in_out_pk_dict,
                            organization=site.organization,
                            is_auto=False,
                        )
                    else:
                        send_edi_mail(
                            ref_code=email_data["ref_code"],
                            site=site.name,
                            attachment_list=edi_file_path,
                            from_email=email_data["from_email"],
                            to_email_list=email_data["to_email_list"],
                            cc_email_list=email_data["cc_email_list"],
                            in_out_pk_dict=in_out_pk_dict,
                            organization=site.organization,
                            is_auto=False,
                        )
                    dt = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                    date = dt.date().strftime("%Y%m%d")
                    time = dt.time().strftime("%H%M%S")
                    ref_code = email_data["ref_code"]

                    with zipfile.ZipFile(temp_zip_file_path, "w") as zipF:
                        for file in edi_file_path:
                            arcname = file.split(os.path.join(BASE_DIR, f"temp/"))[1]
                            zipF.write(
                                file,
                                compress_type=zipfile.ZIP_DEFLATED,
                                arcname=arcname,
                            )

                    with open(temp_zip_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/zip"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{site.name}{date}{time}.zip"'
                        )

                        for path in edi_file_path:
                            os.remove(path)
                        os.remove(temp_zip_file_path)
                    return file_response
                else:
                    email_data = data["email_data"]
                    attachments = edi_file_path + mei_file_path
                    send_edi_mail(
                        ref_code=email_data["ref_code"],
                        site=site.name,
                        attachment_list=attachments,
                        from_email=email_data["from_email"],
                        to_email_list=email_data["to_email_list"],
                        cc_email_list=email_data["cc_email_list"],
                        in_out_pk_dict=in_out_pk_dict,
                        organization=site.organization,
                        is_auto=False,
                    )
                    dt = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                    date = dt.date().strftime("%Y%m%d")
                    time = dt.time().strftime("%H%M%S")
                    ref_code = email_data["ref_code"]

                    with zipfile.ZipFile(temp_zip_file_path, "w") as zipF:
                        for file in attachments:
                            arcname = file.split(os.path.join(BASE_DIR, f"temp/"))[1]
                            zipF.write(
                                file,
                                compress_type=zipfile.ZIP_DEFLATED,
                                arcname=arcname,
                            )

                    with open(temp_zip_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/zip"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{site.name}{date}{time}.zip"'
                        )

                        for path in attachments:
                            os.remove(path)
                        os.remove(temp_zip_file_path)
                    return file_response
            else:
                return Response(
                    {
                        "errorMsg": f"Please Select 'D' to download specific movecode edi"
                    },
                    status=400,
                )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=400)
