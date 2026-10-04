from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import (
    Location,
    Site,
)
from ..functions_two import *
from ..models import *
import datetime
from django.utils import timezone
from billing_invoice.functions import create_billing_lolo, create_billing_st
from depot.functions import (
    apply_lolo_night_charges,
    upload_driver_img_to_s3,
    unlock_mnr_bills,
)
from django.db import transaction
from account.permissions import HasAllowedRoles


class UpdateGateInProcess(views.APIView):
    """
    the Post function will update data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            main_data = {}
            container_no = data["container_no"]
            date_str = data["date"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            container_object = Container.objects.get(
                container_no=container_no, location=location, site=site
            )
            history_object = None
            req_date = datetime.datetime.strptime(date_str, "%d/%m/%Y").date()
            for obj in GateInHistory.objects.filter(container=container_object):
                if (
                    obj.date.astimezone(timezone.get_current_timezone()).date()
                    == req_date
                ):
                    history_object = obj
            container_obj = history_object.container.get_container()
            eir_obj = history_object.eir.get_eir()
            eir_obj["eir_line"] = [
                line.get_eir_line()
                for line in EirLine.objects.filter(eir=history_object.eir)
            ]
            gate_in_obj = history_object.gate_in.get_gate_in()
            lolo_obj = history_object.lolo.get_handling()
            if history_object.lolo_payment is not None:
                lolo_obj["lolo_payment"] = (
                    history_object.lolo_payment.get_payment_details()
                )
            else:
                lolo_obj["lolo_payment"] = ""
            if history_object.st is not None:
                st_obj = history_object.st.get_self_transportation()
                if history_object.st_payment is not None:
                    st_obj["self_transportation_payment"] = (
                        history_object.st_payment.get_payment_details()
                    )
                else:
                    st_obj["self_transportation_payment"] = ""
                main_data["self_transportation_data"] = st_obj
            else:
                main_data["self_transportation_data"] = ""
            main_data["container_data"] = container_obj
            main_data["eir_data"] = eir_obj
            main_data["gate_in_data"] = gate_in_obj
            main_data["lolo_data"] = lolo_obj
            main_data["gih_pk"] = history_object.pk
            return Response(main_data, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials {e}"}, status=200)

    def put(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            with transaction.atomic():
                # ************************************* Condition Check *************************************************
                lolo_data = data["lolo_data"]
                gih_object = GateInHistory.objects.get(pk=data["gih_pk"])
                new_lolo_payment_entry = None
                new_st_entry = None
                new_st_payment_entry = None
                lolo_payment_in = None
                st_payment_in = None
                lolo_payment = None
                lolo_cheque_no = None
                lolo_utr_no = None
                st_payment = None
                st_cheque_no = None
                st_utr_no = None
                validation = None

                previous_job_order_no = gih_object.gate_in.bl_no
                previous_vessel_name = (
                    gih_object.gate_in.vessel_name.strip()
                    if gih_object.gate_in.vessel_name
                    else ""
                )
                previous_voyage_no = (
                    gih_object.gate_in.voyage_no.strip()
                    if gih_object.gate_in.voyage_no
                    else ""
                )
                previous_line = gih_object.container.client.ref_code

                container_data = data["container_data"]
                container_no = container_data["container_no"]
                manufacturing_date_str = container_data["manufacturing_date"]

                if len(container_no) == 0:
                    return Response(
                        {"errorMsg": "Please Enter Container_no"}, status=200
                    )

                if len(manufacturing_date_str) == 0:
                    return Response(
                        {"errorMsg": "Please provide manufacturing date"},
                        status=200,
                    )
                else:
                    try:
                        manufacturing_date = datetime.datetime.strptime(
                            manufacturing_date_str, "%Y-%m-%d"
                        ).date()
                    except:
                        error_log = logging.getLogger("error_log")
                        error_log.error(traceback.format_exc())
                        return Response(
                            {"errorMsg": "Please provide Valid manufacturing date"},
                            status=200,
                        )
                previous_mfd = gih_object.container.manufacturing_date
                if previous_mfd != manufacturing_date:
                    ManufacturingDateLog.objects.create(
                        container_no=container_no,
                        previous_manufacturing_date=previous_mfd,
                        current_manufacturing_date=manufacturing_date,
                        location=location,
                        site=site,
                        changed_by=app_user,
                    )

                container_object = Container.objects.get(pk=container_data["pk"])

                if not container_object.container_no == container_no:
                    if not len(container_no) == 11:
                        return Response(
                            {
                                "errorMsg": "Invalid Entry, "
                                "Please Enter Container_no having first 4 uppercase alphabets and "
                                "rest 7 digits"
                            },
                            status=200,
                        )
                    if check_char_digit(container_no) is False:
                        return Response(
                            {
                                "errorMsg": "Invalid Entry, "
                                "Please Enter Container_no having first 4 uppercase alphabets and "
                                "rest 7 digits"
                            },
                            status=200,
                        )
                    validation = check_digit(container_no=container_no)
                    if validation is True:
                        try:
                            Container.objects.get(
                                container_no=container_no,
                                status="IN",
                                location=location,
                            )
                            return Response(
                                {"errorMsg": "Container_no Valid but already exist."},
                                status=200,
                            )
                        except:
                            pass
                    else:
                        try:
                            Container.objects.get(
                                container_no=container_no,
                                status="IN",
                                location=location,
                            )
                            return Response(
                                {
                                    "errorMsg": "Container_no Not Valid but already exist."
                                },
                                status=200,
                            )
                        except:
                            pass

                    if Container.objects.filter(
                        container_no=container_no, location=location, site=site
                    ).exists():
                        return Response(
                            {
                                "errorMsg": "Provided ContainerNo Already Exist in Current Site"
                            },
                            status=200,
                        )

                if (
                    gih_object.lolo_payment is None
                    and not len(lolo_data["lolo_payment"]) == 0
                ):
                    new_lolo_payment_entry = True
                    lolo_payment = lolo_data["lolo_payment"]
                    lolo_cheque_no = lolo_payment["cheque_no"]
                    lolo_utr_no = lolo_payment["utr_no"]
                    try:
                        if HandlingPayment.objects.filter(
                            cheque_no=lolo_cheque_no
                        ).exists():
                            handling_check_object = HandlingPayment.objects.filter(
                                cheque_no=lolo_cheque_no
                            ).first()
                            lolo_payment_in = "Cheque"
                            if (
                                handling_check_object.remaining == 0
                                or handling_check_object.amount == 0
                            ):
                                return Response(
                                    {
                                        "errorMsg": "No Remaining Quantity of Container Left on lolo cheque no"
                                    },
                                    status=200,
                                )

                        elif HandlingPayment.objects.filter(
                            utr_no=lolo_utr_no
                        ).exists():
                            handling_check_object = HandlingPayment.objects.filter(
                                utr_no=lolo_utr_no
                            ).first()
                            lolo_payment_in = "Utr"
                            if (
                                handling_check_object.remaining == 0
                                or handling_check_object.amount == 0
                            ):
                                return Response(
                                    {
                                        "errorMsg": "No Remaining Quantity of Container Left on lolo utr no"
                                    },
                                    status=200,
                                )

                        else:
                            pass
                    except:
                        pass
                elif (
                    gih_object.lolo_payment is not None
                    and not len(lolo_data["lolo_payment"]) == 0
                ):
                    new_lolo_payment_entry = False
                else:
                    pass

                try:
                    if (
                        gih_object.st is None
                        and not len(data["self_transportation_data"]) == 0
                    ):
                        new_st_entry = True
                        self_transportation_data = data["self_transportation_data"]
                        if (
                            gih_object.st_payment is None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = True
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_cheque_no = st_payment["cheque_no"]
                            st_utr_no = st_payment["utr_no"]
                            try:
                                if SelfTransportationPayment.objects.filter(
                                    cheque_no=st_cheque_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            cheque_no=st_cheque_no
                                        ).first()
                                    )
                                    st_payment_in = "Cheque"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st cheque no"
                                            },
                                            status=200,
                                        )

                                elif SelfTransportationPayment.objects.filter(
                                    utr_no=st_utr_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            utr_no=st_utr_no
                                        ).first()
                                    )
                                    st_payment_in = "Utr"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st utr no"
                                            },
                                            status=200,
                                        )

                                else:
                                    pass
                            except:
                                pass
                        elif (
                            gih_object.st_payment is not None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = False
                        else:
                            pass
                    elif (
                        gih_object.st is not None
                        and not len(data["self_transportation_data"]) == 0
                    ):
                        new_st_entry = False
                        self_transportation_data = data["self_transportation_data"]
                        if (
                            gih_object.st_payment is None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = True
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_cheque_no = st_payment["cheque_no"]
                            st_utr_no = st_payment["utr_no"]
                            try:
                                if SelfTransportationPayment.objects.filter(
                                    cheque_no=st_cheque_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            cheque_no=st_cheque_no
                                        ).first()
                                    )
                                    st_payment_in = "Cheque"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st cheque no"
                                            },
                                            status=200,
                                        )

                                elif SelfTransportationPayment.objects.filter(
                                    utr_no=st_utr_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            utr_no=st_utr_no
                                        ).first()
                                    )
                                    st_payment_in = "Utr"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st utr no"
                                            },
                                            status=200,
                                        )

                                else:
                                    pass
                            except:
                                pass
                        elif (
                            gih_object.st_payment is not None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = False
                        else:
                            pass
                    else:
                        pass
                except:
                    pass

                # **************************************** Update Container ************************************************
                try:
                    if data["container_data"]:
                        container_data = data["container_data"]
                        try:
                            if container_data["client"]:
                                client_name = container_data["client"]
                                if len(client_name) == 0:
                                    pass
                                else:
                                    client = Client.objects.get(
                                        name=client_name, location=location, site=site
                                    )
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(client=client)
                        except:
                            pass
                        try:
                            if container_data["type"]:
                                type_name = container_data["type"]
                                if len(type_name) == 0:
                                    type_object = ContainerType.objects.get(name="DV")
                                else:
                                    type_object = ContainerType.objects.get(
                                        name=type_name
                                    )
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(type=type_object)
                        except:
                            pass
                        try:
                            if container_data["size"]:
                                size_name = container_data["size"]
                                if len(size_name) == 0:
                                    size_object = ContainerSize.objects.get(name="20")
                                else:
                                    size_object = ContainerSize.objects.get(
                                        name=size_name
                                    )
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(size=size_object)
                        except:
                            pass
                        try:
                            if container_data["container_no"]:
                                if validation is not None:
                                    container_no = container_data["container_no"]
                                    if len(container_no) == 0:
                                        pass
                                    else:
                                        if site.lolo_finance:
                                            if not arrived in [
                                                "Factory",
                                                "FS RETURN",
                                                "CFS/ICD",
                                            ]:
                                                Container.objects.filter(
                                                    pk=container_data["pk"]
                                                ).update(
                                                    container_no=container_no,
                                                    is_valid=validation,
                                                )
                                            else:
                                                pass
                                        else:
                                            Container.objects.filter(
                                                pk=container_data["pk"]
                                            ).update(
                                                container_no=container_no,
                                                is_valid=validation,
                                            )
                        except:
                            pass
                        try:
                            if container_data["payload"]:
                                payload = container_data["payload"]
                                if len(payload) == 0:
                                    payload = None
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(payload=payload)
                        except:
                            pass
                        try:
                            if container_data["gross_wt"]:
                                gross_wt = container_data["gross_wt"]
                                if len(gross_wt) == 0:
                                    gross_wt = None
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(gross_wt=gross_wt)
                        except:
                            pass
                        try:
                            if container_data["tare_wt"]:
                                tare_wt = container_data["tare_wt"]
                                if len(tare_wt) == 0:
                                    tare_wt = None
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(tare_wt=tare_wt)
                        except:
                            pass
                        try:
                            if container_data["manufacturing_date"]:
                                manufacturing_date_str = container_data[
                                    "manufacturing_date"
                                ]
                                if len(manufacturing_date_str) == 0:
                                    return Response(
                                        {
                                            "errorMsg": "Please provide manufacturing date"
                                        },
                                        status=200,
                                    )
                                else:
                                    try:
                                        manufacturing_date = datetime.datetime.strptime(
                                            manufacturing_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        manufacturing_date = None

                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(manufacturing_date=manufacturing_date)
                        except:
                            pass
                        try:
                            if container_data["shipping_line"]:
                                shipping_line_name = container_data["shipping_line"]

                                if len(shipping_line_name) == 0:
                                    shipping_line_object = None
                                else:
                                    client = Client.objects.get(
                                        name=client_name, location=location, site=site
                                    )
                                    shipping_line_object = list(
                                        ClientAbbreviation.objects.filter(
                                            client=client, name=shipping_line_name
                                        )
                                    )[0]

                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(shipping_line=shipping_line_object)
                        except:
                            pass
                        try:
                            if container_data["leased_box"]:
                                leased_box = container_data["leased_box"]
                                if len(leased_box) == 0:
                                    leased_box = False
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(leased_box=leased_box)
                        except:
                            pass
                        try:
                            if container_data["do_not_lift"]:
                                do_not_lift = container_data["do_not_lift"]
                                if len(do_not_lift) == 0:
                                    do_not_lift = False
                                c_obj = Container.objects.get(pk=container_data["pk"])
                                if (
                                    c_obj.in_do_not_lift_queue is False
                                    and do_not_lift == str(True)
                                ):
                                    c_obj.in_do_not_lift_queue = do_not_lift
                                    c_obj.queued_recently = True
                                    c_obj.save()
                                else:
                                    c_obj.in_do_not_lift_queue = do_not_lift
                                    c_obj.save()
                        except:
                            pass

                        try:
                            do_not_lift_remarks = container_data.get(
                                "do_not_lift_remarks", None
                            )
                            if do_not_lift_remarks is not None:
                                if len(do_not_lift_remarks) == 0:
                                    do_not_lift_remarks = None
                                c_obj = Container.objects.get(pk=container_data["pk"])
                                c_obj.do_not_lift_remarks = do_not_lift_remarks
                                c_obj.save()
                        except:
                            pass

                        try:
                            if container_data["automatic_mnr_status_change"]:
                                automatic_mnr_status_change = container_data[
                                    "automatic_mnr_status_change"
                                ]
                                if len(automatic_mnr_status_change) == 0:
                                    automatic_mnr_status_change = False
                                Container.objects.filter(
                                    pk=container_data["pk"]
                                ).update(
                                    automatic_mnr_status_change=automatic_mnr_status_change
                                )
                        except:
                            pass
                except:
                    pass
                # *************************************** Update Eir *******************************************************
                try:
                    if data["eir_data"]:
                        eir_data = data["eir_data"]
                        try:
                            if eir_data["eir_date"]:
                                eir_date_str = eir_data["eir_date"]
                                if len(eir_date_str) == 0:
                                    eir_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        eir_date = datetime.datetime.strptime(
                                            eir_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        eir_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )
                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    eir_date=eir_date
                                )
                        except:
                            pass
                        try:
                            if eir_data["eir_time"]:
                                eir_time_str = eir_data["eir_time"]
                                if len(eir_time_str) == 0:
                                    eir_time = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .time()
                                    )
                                else:
                                    try:
                                        eir_time = datetime.datetime.strptime(
                                            eir_time_str, "%H:%M"
                                        ).time()
                                    except:
                                        eir_time = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .time()
                                        )
                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    eir_time=eir_time
                                )
                        except:
                            pass
                        try:
                            if eir_data["offload_date"]:
                                offload_date_str = eir_data["offload_date"]
                                if len(offload_date_str) == 0:
                                    offload_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        offload_date = datetime.datetime.strptime(
                                            offload_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        offload_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )
                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    offload_date=offload_date
                                )
                        except:
                            pass
                        try:
                            if eir_data["offload_time"]:
                                offload_time_str = eir_data["offload_time"]
                                if len(offload_time_str) == 0:
                                    offload_time = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .time()
                                    )
                                else:
                                    try:
                                        offload_time = datetime.datetime.strptime(
                                            offload_time_str, "%H:%M"
                                        ).time()
                                    except:
                                        offload_time = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .time()
                                        )

                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    offload_time=offload_time
                                )
                        except:
                            pass
                        try:
                            if eir_data["eir_amount"]:
                                eir_amount = eir_data["eir_amount"]
                                if (
                                    len(eir_amount) == 0
                                    or eir_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    eir_amount = 0
                                else:
                                    eir_amount = float(eir_amount)

                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    eir_amount=eir_amount
                                )
                        except:
                            pass
                        try:
                            if eir_data["repair_amount"]:
                                repair_amount = eir_data["repair_amount"]
                                if (
                                    len(repair_amount) == 0
                                    or repair_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    repair_amount = 0
                                else:
                                    repair_amount = float(repair_amount)

                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    repair_amount=repair_amount
                                )
                        except:
                            pass
                        try:
                            if eir_data["eir_line"]:
                                eir_line = eir_data["eir_line"]
                                try:
                                    eir_object = Eir.objects.get(pk=eir_data["pk"])
                                    try:
                                        eir_line_objects = EirLine.objects.filter(
                                            eir=eir_object
                                        )
                                        for obj in eir_line_objects:
                                            obj.delete()
                                    except:
                                        pass
                                    for line in eir_line:
                                        grap_position = line["grap_position"]
                                        if len(grap_position) == 0:
                                            grap_position = None
                                        damage_code = line["damage_code"]
                                        if len(damage_code) == 0:
                                            damage_code = None
                                        description = line["description"]
                                        if len(description) == 0:
                                            description = None
                                        if grap_position is not None:
                                            EirLine.create(
                                                eir=eir_object,
                                                grap_position=grap_position,
                                                damage_code=damage_code,
                                                description=description,
                                            ).save()

                                    try:
                                        eir_img = eir_data["eir_img"]
                                        if len(str(eir_img)) == 0:
                                            eir_img = save_default_eir_img()
                                        # eir_object.eir_img.delete()
                                        eir_object.eir_img = eir_img
                                        eir_object.save()
                                        eir_object.upload_eir_img()
                                    except:
                                        pass
                                except:
                                    pass
                        except:
                            pass
                except:
                    pass
                # ***************************************** Update Gate In ************************************************
                try:
                    if data["gate_in_data"]:
                        gate_in_data = data["gate_in_data"]
                        in_date = None
                        in_time = None
                        try:
                            if gate_in_data["in_date"]:
                                in_date_str = gate_in_data["in_date"]
                                if len(in_date_str) == 0:
                                    in_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        in_date = datetime.datetime.strptime(
                                            in_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        in_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    in_date=in_date
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["in_time"]:
                                in_time_str = gate_in_data["in_time"]
                                if len(in_time_str) == 0:
                                    in_time = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .time()
                                    )
                                else:
                                    try:
                                        in_time = datetime.datetime.strptime(
                                            in_time_str, "%H:%M"
                                        ).time()
                                    except:
                                        in_time = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .time()
                                        )

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    in_time=in_time
                                )
                        except:
                            pass
                        try:
                            # gate in time and eir time 15 mins difference
                            temp_date_time = datetime.datetime.combine(
                                in_date, in_time
                            ) - datetime.timedelta(minutes=15)
                            temp_date_time = temp_date_time.astimezone(
                                timezone.get_current_timezone()
                            )
                            eir_object = Eir.objects.get(pk=eir_data["pk"])
                            eir_object.eir_date = temp_date_time.date()
                            eir_object.eir_time = temp_date_time.time()
                            eir_object.save()

                            gih_date = datetime.datetime.combine(
                                in_date, in_time
                            ).astimezone(timezone.get_current_timezone())
                            gih_obj = GateInHistory.objects.filter(pk=data["gih_pk"])

                            if (
                                not list(gih_obj)[0].date.astimezone(
                                    timezone.get_current_timezone()
                                )
                                == gih_date
                            ):
                                list(gih_obj)[0].is_date_updated = True
                                list(gih_obj)[0].save()

                            gih_obj.update(date=gih_date)

                        except:
                            pass
                        try:
                            if gate_in_data["condition"]:
                                condition = gate_in_data["condition"]
                                if len(condition) == 0:
                                    condition = None

                                if condition == "AV":
                                    stock_object = ContainerStock.objects.get(
                                        gate_in__pk=gate_in_data["pk"]
                                    )
                                    stock_object.status = "Available"
                                    stock_object.stage = "Available"
                                    stock_object.save()
                                    stock_object.make_available()

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    condition=condition
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["grade"]:
                                grade = gate_in_data["grade"]
                                if len(grade) == 0:
                                    grade = None
                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    grade=grade
                                )
                                gate_in_object = GateIn.objects.get(
                                    pk=gate_in_data["pk"]
                                )
                                stock_object = ContainerStock.objects.get(
                                    gate_in=gate_in_object
                                )
                                stock_object.grade = grade
                                stock_object.save()
                        except:
                            pass
                        try:
                            if gate_in_data["arrived"]:
                                arrived = gate_in_data["arrived"]
                                if len(arrived) == 0:
                                    arrived = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    arrived=arrived
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["consignee"]:
                                consignee = gate_in_data["consignee"]
                                if len(consignee) == 0:
                                    consignee = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    consignee=consignee
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["shipper"]:
                                shipper = gate_in_data["shipper"]
                                if len(shipper) == 0:
                                    shipper = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    shipper=shipper
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["source"]:
                                source = gate_in_data["source"]
                                if len(source) == 0:
                                    source = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    source=source
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["from_location_code"]:
                                from_location_code = gate_in_data["from_location_code"]
                                if len(from_location_code) == 0:
                                    from_location_code = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    from_location_code=from_location_code
                                )
                        except:
                            pass
                        try:
                            from_location_name_code = gate_in_data.get(
                                "from_location_name_code", None
                            )
                            if (
                                from_location_name_code is not None
                                and len(from_location_name_code) == 0
                            ):
                                from_location_name_code = None
                            GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                from_location_name_code=from_location_name_code
                            )
                        except:
                            pass
                        try:
                            if gate_in_data["from_port_code"]:
                                from_port_code = gate_in_data["from_port_code"]
                                if len(from_port_code) == 0:
                                    from_port_code = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    from_port_code=from_port_code
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["vessel_name"]:
                                vessel_name = gate_in_data["vessel_name"]
                                if len(vessel_name) == 0:
                                    vessel_name = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    vessel_name=vessel_name
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["voyage_no"]:
                                voyage_no = gate_in_data["voyage_no"]
                                if len(voyage_no) == 0:
                                    voyage_no = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    voyage_no=voyage_no
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["do_ref"]:
                                do_ref = gate_in_data["do_ref"]
                                if len(do_ref) == 0:
                                    do_ref = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    do_ref=do_ref
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["cargo"]:
                                cargo = gate_in_data["cargo"]
                                if len(cargo) == 0:
                                    cargo = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    cargo=cargo
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["export_cargo_type"]:
                                export_cargo_type_str = gate_in_data[
                                    "export_cargo_type"
                                ]
                                if len(export_cargo_type_str) == 0:
                                    export_cargo_type = None
                                else:
                                    try:
                                        export_cargo_type = ExportCargoType.objects.get(
                                            name=export_cargo_type_str
                                        )
                                    except:
                                        export_cargo_type = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    export_cargo_type=export_cargo_type
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["transporter_name"]:
                                transporter_name_str = gate_in_data["transporter_name"]
                                if len(transporter_name_str) == 0:
                                    transporter_name = None
                                else:
                                    try:
                                        transporter_name = Transporter.objects.filter(
                                            name=transporter_name_str,
                                            location=location,
                                            site=site,
                                        ).first()
                                    except:
                                        pass
                                        # transporter_name = Transporter(
                                        #     name=transporter_name_str,
                                        #     location=location,
                                        #     site=site,
                                        # )
                                        # transporter_name.save()
                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    transporter_name=transporter_name
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["vehicle_no"]:
                                vehicle_no = gate_in_data["vehicle_no"]
                                if len(vehicle_no) == 0:
                                    vehicle_no = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    vehicle_no=vehicle_no
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["bl_no"]:
                                bl_no = gate_in_data["bl_no"]
                                if len(bl_no) == 0:
                                    bl_no = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    bl_no=bl_no
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["driver_name"]:
                                driver_name = gate_in_data["driver_name"]
                                if len(driver_name) == 0:
                                    driver_name = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    driver_name=driver_name
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["driver_license"]:
                                driver_license = gate_in_data["driver_license"]
                                if len(driver_license) == 0:
                                    driver_license = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    driver_license=driver_license
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["driver_mobile_no"]:
                                driver_mobile_no = gate_in_data["driver_mobile_no"]
                                if (
                                    len(driver_mobile_no) == 0
                                    or driver_mobile_no.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    driver_mobile_no = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    driver_mobile_no=driver_mobile_no
                                )
                        except:
                            pass
                        try:
                            if gate_in_data["carrier_code"]:
                                carrier_code = gate_in_data["carrier_code"]
                                if len(carrier_code) == 0:
                                    carrier_code = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    carrier_code=carrier_code
                                )
                        except:
                            pass
                        try:
                            GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                location=location
                            )
                        except:
                            pass
                        try:
                            if gate_in_data["remarks"]:
                                remarks = gate_in_data["remarks"]
                                if len(remarks) == 0:
                                    remarks = None

                                GateIn.objects.filter(pk=gate_in_data["pk"]).update(
                                    remarks=remarks
                                )
                        except:
                            pass

                        # try:
                        #     if site.lolo_finance and arrived in ["Factory", "FS RETURN", "CFS/ICD"]:
                        #         gate_in_obj = GateIn.objects.filter(pk=gate_in_data["pk"])
                        #         pregatein_obj = PreGateIn.objects.get(pk=gate_in_obj.pregatein_id)
                        #         pregatein_obj.container_no = container_object.container_no
                        #         pregatein_obj.save()
                        # except:
                        #     pass
                except:
                    pass
                # ***************************************** Update lolo data *********************************************

                gih_object = GateInHistory.objects.get(pk=data["gih_pk"])

                try:
                    if data["lolo_data"]:
                        lolo_data = data["lolo_data"]
                        try:
                            if lolo_data["apply_charges"]:
                                lolo_apply_charges = lolo_data["apply_charges"]
                                if len(lolo_apply_charges) == 0:
                                    lolo_apply_charges = None

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    apply_charges=lolo_apply_charges
                                )
                        except:
                            pass
                        try:
                            if lolo_data["customer_name"]:
                                lolo_customer_name_str = lolo_data["customer_name"]
                                if (
                                    len(lolo_customer_name_str) == 0
                                    or lolo_apply_charges is None
                                    # or lolo_apply_charges == "Line"
                                    or client_name == lolo_customer_name_str
                                    or Client.objects.filter(
                                        name=lolo_customer_name_str,
                                        location=location,
                                        site=site,
                                        type="Line",
                                    ).exists()
                                    is True
                                ):
                                    lolo_customer_name = None
                                else:
                                    try:
                                        lolo_customer_name = Client.objects.get(
                                            name=lolo_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                    except:
                                        lolo_customer_name = Client(
                                            name=lolo_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                        lolo_customer_name.save()
                                        lolo_customer_name.create_client_code()

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    customer_name=lolo_customer_name
                                )
                        except:
                            pass
                        try:
                            if lolo_data["invoice_date"]:
                                invoice_date_str = lolo_data["invoice_date"]
                                if len(invoice_date_str) == 0:
                                    lolo_invoice_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        lolo_invoice_date = datetime.datetime.strptime(
                                            invoice_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        lolo_invoice_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    invoice_date=lolo_invoice_date
                                )
                        except:
                            pass
                        try:
                            if lolo_data["receipt_date"]:
                                receipt_date_str = lolo_data["receipt_date"]
                                if len(receipt_date_str) == 0:
                                    lolo_receipt_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        lolo_receipt_date = datetime.datetime.strptime(
                                            receipt_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        lolo_receipt_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    receipt_date=lolo_receipt_date
                                )
                        except:
                            pass
                        try:
                            if lolo_data["lolo_type"]:
                                lolo_type = lolo_data["lolo_type"]
                                if len(lolo_type) == 0:
                                    lolo_type = None

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    lolo_type=lolo_type
                                )
                        except:
                            pass

                        try:
                            is_night_charges_applied = lolo_data.get(
                                "is_night_charges_applied", None
                            )
                            if is_night_charges_applied is not None:
                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    is_night_charges_applied=is_night_charges_applied
                                )
                        except:
                            pass
                        try:
                            if lolo_data["payment_type"]:
                                lolo_payment_type = lolo_data["payment_type"]
                                if len(lolo_payment_type) == 0:
                                    lolo_payment_type = "None"

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    payment_type=lolo_payment_type
                                )
                        except:
                            pass

                        try:
                            if lolo_data["lolo_amount"]:
                                lolo_amount = lolo_data["lolo_amount"]
                                if (
                                    len(lolo_amount) == 0
                                    or lolo_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    lolo_amount = 0
                                else:
                                    lolo_amount = float(lolo_amount)

                                lolo_object = Handling.objects.get(pk=lolo_data["pk"])
                                lolo_object.lolo_amount = lolo_amount
                                lolo_object.net_amount = lolo_amount
                                lolo_object.taxable_amount = lolo_amount
                                lolo_object.gross_amount = lolo_amount
                                lolo_object.save()
                                if not float(lolo_object.cgst) == float(
                                    0
                                ) and not float(lolo_object.sgst) == float(0):
                                    cgst_amount = float(lolo_amount) * float(
                                        lolo_object.cgst
                                    )
                                    sgst_amount = float(lolo_amount) * float(
                                        lolo_object.sgst
                                    )
                                    gross_amount = (
                                        float(lolo_amount)
                                        + float(cgst_amount)
                                        + float(sgst_amount)
                                    )
                                    lolo_object.cgst_amount = cgst_amount
                                    lolo_object.sgst_amount = sgst_amount
                                    lolo_object.gross_amount = gross_amount
                                    lolo_object.save()
                                elif not float(lolo_object.igst) == float(0):
                                    igst_amount = float(lolo_amount) * float(
                                        lolo_object.igst
                                    )
                                    gross_amount = float(lolo_amount) + float(
                                        igst_amount
                                    )
                                    lolo_object.igst_amount = igst_amount
                                    lolo_object.gross_amount = gross_amount
                                    lolo_object.save()
                                else:
                                    pass
                        except:
                            pass

                        try:
                            if lolo_data["remark"]:
                                lolo_remark = lolo_data["remark"]
                                if len(lolo_remark) == 0:
                                    lolo_remark = None

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    remark=lolo_remark
                                )
                        except:
                            pass
                        try:
                            if new_lolo_payment_entry is True:
                                container_object = Container.objects.get(
                                    pk=container_data["pk"]
                                )

                                lolo_amount = lolo_data["lolo_amount"]

                                if len(lolo_cheque_no) == 0:
                                    lolo_cheque_no = None

                                if len(lolo_utr_no) == 0:
                                    lolo_utr_no = None

                                lolo_date_str = lolo_payment["date"]

                                if len(lolo_date_str) == 0:
                                    lolo_date = None
                                else:
                                    try:
                                        lolo_date = datetime.datetime.strptime(
                                            lolo_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        lolo_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                lolo_bank_name = lolo_payment["bank_name"]
                                if len(lolo_bank_name) == 0:
                                    lolo_bank_name = None

                                lolo_account_name = lolo_payment["account_name"]
                                if len(lolo_account_name) == 0:
                                    lolo_account_name = None

                                lolo_account_no = lolo_payment["account_no"]
                                if len(lolo_account_no) == 0:
                                    lolo_account_no = None

                                lolo_quantity = lolo_payment["quantity"]
                                if (
                                    len(lolo_quantity) == 0
                                    or lolo_quantity.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    lolo_quantity = 0
                                else:
                                    lolo_quantity = int(lolo_quantity)

                                lolo_payment_amount = lolo_payment["amount"]
                                if (
                                    len(lolo_payment_amount) == 0
                                    or lolo_payment_amount.replace(
                                        ".", "", 1
                                    ).isnumeric()
                                    is False
                                ):
                                    lolo_payment_amount = 0
                                else:
                                    lolo_payment_amount = float(lolo_payment_amount)

                                if lolo_payment_in == "Cheque":
                                    lolo_payment_object = HandlingPayment.objects.get(
                                        cheque_no=lolo_cheque_no
                                    )
                                    lolo_payment_object.add_container(
                                        container=container_object, amount=lolo_amount
                                    )
                                elif lolo_payment_in == "Utr":
                                    lolo_payment_object = HandlingPayment.objects.get(
                                        utr_no=lolo_utr_no
                                    )
                                    lolo_payment_object.add_container(
                                        container=container_object, amount=lolo_amount
                                    )
                                GateInHistory.objects.filter(pk=data["gih_pk"]).update(
                                    lolo_payment=lolo_payment_object
                                )
                            else:
                                pass
                        except:
                            pass
                except:
                    pass

                # ***************************************** Update self-transportation ***********************************
                try:
                    if new_st_entry is True:
                        self_transportation_data = data["self_transportation_data"]
                        container_data = data["container_data"]
                        container_object = Container.objects.get(
                            pk=container_data["pk"]
                        )

                        transportername = self_transportation_data["transporter"]
                        if len(transportername) == 0:
                            st_transporter = None
                        else:
                            try:
                                st_transporter = Transporter.objects.get(
                                    name=transportername, location=location, site=site
                                )
                            except:
                                st_transporter = Transporter(
                                    name=transportername, location=location, site=site
                                )
                                st_transporter.save()

                        st_apply_charges = self_transportation_data["apply_charges"]
                        if len(st_apply_charges) == 0:
                            st_apply_charges = None

                        st_customer_name_str = self_transportation_data["customer_name"]
                        if (
                            len(st_customer_name_str) == 0
                            or st_apply_charges is None
                            # or st_apply_charges == "Line"
                            or client_name == st_customer_name_str
                            or Client.objects.filter(
                                name=st_customer_name_str,
                                location=location,
                                site=site,
                                type="Line",
                            ).exists()
                            is True
                        ):
                            st_customer_name = None
                        else:
                            try:
                                st_customer_name = Client.objects.get(
                                    name=st_customer_name_str,
                                    location=location,
                                    site=site,
                                    type="Party",
                                )
                            except:
                                st_customer_name = Client(
                                    name=st_customer_name_str,
                                    location=location,
                                    site=site,
                                    type="Party",
                                )
                                st_customer_name.save()
                                st_customer_name.create_client_code()

                        st_origin = self_transportation_data["origin"]
                        if len(st_origin) == 0:
                            st_origin = None

                        st_receipt_date_str = self_transportation_data["receipt_date"]
                        if len(st_receipt_date_str) == 0:
                            st_receipt_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )
                        else:
                            try:
                                st_receipt_date = datetime.datetime.strptime(
                                    st_receipt_date_str, "%Y-%m-%d"
                                ).date()
                            except:
                                st_receipt_date = (
                                    datetime.datetime.now()
                                    .astimezone(timezone.get_current_timezone())
                                    .date()
                                )

                        st_invoice_date_str = self_transportation_data["invoice_date"]
                        if len(st_invoice_date_str) == 0:
                            st_invoice_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )
                        else:
                            try:
                                st_invoice_date = datetime.datetime.strptime(
                                    st_invoice_date_str, "%Y-%m-%d"
                                ).date()
                            except:
                                st_invoice_date = (
                                    datetime.datetime.now()
                                    .astimezone(timezone.get_current_timezone())
                                    .date()
                                )

                        st_payment_type = self_transportation_data["payment_type"]
                        if len(st_payment_type) == 0:
                            st_payment_type = "None"

                        st_price = self_transportation_data["price"]
                        if (
                            len(st_price) == 0
                            or st_price.replace(".", "", 1).isnumeric() is False
                        ):
                            st_price = 0
                        else:
                            st_price = float(st_price)

                        st_remark = self_transportation_data["remark"]
                        if len(st_remark) == 0:
                            st_remark = None

                        self_transportation_object = SelfTransportation.create(
                            container=container_object,
                            transporter=st_transporter,
                            apply_charges=st_apply_charges,
                            customer_name=st_customer_name,
                            origin=st_origin,
                            receipt_date=st_receipt_date,
                            invoice_date=st_invoice_date,
                            payment_type=st_payment_type,
                            price=st_price,
                            remark=st_remark,
                            entry_type="IN",
                        )
                        self_transportation_object.save()
                        self_transportation_object.save_invoice_no(location=location)
                        self_transportation_object.save_receipt_no(location=location)

                        if new_st_payment_entry is True:
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_date_str = st_payment["date"]
                            if len(st_date_str) == 0:
                                st_date = None
                            else:
                                try:
                                    st_date = datetime.datetime.strptime(
                                        st_date_str, "%Y-%m-%d"
                                    ).date()
                                except:
                                    st_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )

                            st_bank_name = st_payment["bank_name"]
                            if len(st_bank_name) == 0:
                                st_bank_name = None

                            st_account_name = st_payment["account_name"]
                            if len(st_account_name) == 0:
                                st_account_name = None

                            st_account_no = st_payment["account_no"]
                            if len(st_account_no) == 0:
                                st_account_no = None

                            st_quantity = st_payment["quantity"]
                            if (
                                len(st_quantity) == 0
                                or st_quantity.replace(".", "", 1).isnumeric() is False
                            ):
                                st_quantity = 0
                            else:
                                st_quantity = int(st_quantity)

                            st_payment_amount = st_payment["amount"]
                            if (
                                len(st_payment_amount) == 0
                                or st_payment_amount.replace(".", "", 1).isnumeric()
                                is False
                            ):
                                st_payment_amount = 0
                            else:
                                st_payment_amount = float(st_payment_amount)

                            st_cheque_no = st_payment["cheque_no"]
                            if len(st_cheque_no) == 0:
                                st_cheque_no = None

                            st_utr_no = st_payment["utr_no"]
                            if len(st_utr_no) == 0:
                                st_utr_no = None

                            if st_payment_in == "Cheque":
                                st_payment_object = (
                                    SelfTransportationPayment.objects.get(
                                        cheque_no=st_cheque_no
                                    )
                                )
                                st_payment_object.add_container(
                                    container=container_object, amount=st_price
                                )
                            elif st_payment_in == "Utr":
                                st_payment_object = (
                                    SelfTransportationPayment.objects.get(
                                        utr_no=st_utr_no
                                    )
                                )
                                st_payment_object.add_container(
                                    container=container_object, amount=st_price
                                )
                            gih_obj = GateInHistory.objects.get(pk=data["gih_pk"])
                            gih_obj.st = self_transportation_object
                            gih_obj.st_payment = st_payment_object
                            gih_obj.save()
                        else:
                            gih_obj = GateInHistory.objects.get(pk=data["gih_pk"])
                            gih_obj.st = self_transportation_object
                            gih_obj.save()
                    elif new_st_entry is False:
                        gih_object = GateInHistory.objects.get(pk=data["gih_pk"])

                        self_transportation_data = data["self_transportation_data"]
                        try:
                            if self_transportation_data["transporter"]:
                                transportername = self_transportation_data[
                                    "transporter"
                                ]
                                if len(transportername) == 0:
                                    st_transporter = None
                                else:
                                    try:
                                        st_transporter = Transporter.objects.get(
                                            name=transportername,
                                            location=location,
                                            site=site,
                                        )
                                    except:
                                        st_transporter = Transporter(
                                            name=transportername,
                                            location=location,
                                            site=site,
                                        )
                                        st_transporter.save()

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(transporter=st_transporter)
                        except:
                            pass
                        try:
                            if self_transportation_data["apply_charges"]:
                                st_apply_charges = self_transportation_data[
                                    "apply_charges"
                                ]
                                if len(st_apply_charges) == 0:
                                    st_apply_charges = None

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(apply_charges=st_apply_charges)
                        except:
                            pass
                        try:
                            if self_transportation_data["customer_name"]:
                                st_customer_name_str = self_transportation_data[
                                    "customer_name"
                                ]
                                if (
                                    len(st_customer_name_str) == 0
                                    or st_apply_charges is None
                                    # or st_apply_charges == "Line"
                                    or client_name == st_customer_name_str
                                    or Client.objects.filter(
                                        name=st_customer_name_str,
                                        location=location,
                                        site=site,
                                        type="Line",
                                    ).exists()
                                    is True
                                ):
                                    st_customer_name = None
                                else:
                                    try:
                                        st_customer_name = Client.objects.get(
                                            name=st_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                    except:
                                        st_customer_name = Client(
                                            name=st_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                        st_customer_name.save()
                                        st_customer_name.create_client_code()

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(customer_name=st_customer_name)
                        except:
                            pass
                        try:
                            if self_transportation_data["origin"]:
                                st_origin = self_transportation_data["origin"]
                                if len(st_origin) == 0:
                                    st_origin = None

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(origin=st_origin)
                        except:
                            pass
                        try:
                            if self_transportation_data["receipt_date"]:
                                st_receipt_date_str = self_transportation_data[
                                    "receipt_date"
                                ]
                                if len(st_receipt_date_str) == 0:
                                    st_receipt_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        st_receipt_date = datetime.datetime.strptime(
                                            st_receipt_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        st_receipt_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(receipt_date=st_receipt_date)
                        except:
                            pass

                        try:
                            if self_transportation_data["invoice_date"]:
                                st_invoice_date_str = self_transportation_data[
                                    "invoice_date"
                                ]
                                if len(st_invoice_date_str) == 0:
                                    st_invoice_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        st_invoice_date = datetime.datetime.strptime(
                                            st_invoice_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        st_invoice_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(invoice_date=st_invoice_date)
                        except:
                            pass

                        try:
                            if self_transportation_data["payment_type"]:
                                st_payment_type = self_transportation_data[
                                    "payment_type"
                                ]
                                if len(st_payment_type) == 0:
                                    st_payment_type = "None"

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(payment_type=st_payment_type)
                        except:
                            pass

                        try:
                            if self_transportation_data["price"]:
                                st_price = self_transportation_data["price"]
                                if (
                                    len(st_price) == 0
                                    or st_price.replace(".", "", 1).isnumeric() is False
                                ):
                                    st_price = 0
                                else:
                                    st_price = float(st_price)

                                st_object = SelfTransportation.objects.get(
                                    pk=self_transportation_data["pk"]
                                )
                                st_object.price = st_price
                                st_object.net_amount = st_price
                                st_object.taxable_amount = st_price
                                st_object.gross_amount = st_price
                                st_object.save()
                                if not float(st_object.cgst) == float(0) and not float(
                                    st_object.sgst
                                ) == float(0):
                                    cgst_amount = float(st_price) * float(
                                        st_object.cgst
                                    )
                                    sgst_amount = float(st_price) * float(
                                        st_object.sgst
                                    )
                                    gross_amount = (
                                        float(st_price)
                                        + float(cgst_amount)
                                        + float(sgst_amount)
                                    )
                                    st_object.cgst_amount = cgst_amount
                                    st_object.sgst_amount = sgst_amount
                                    st_object.gross_amount = gross_amount
                                    st_object.save()
                                elif not float(st_object.igst) == float(0):
                                    igst_amount = float(st_price) * float(
                                        st_object.igst
                                    )
                                    gross_amount = float(st_price) + float(igst_amount)
                                    st_object.igst_amount = igst_amount
                                    st_object.gross_amount = gross_amount
                                    st_object.save()
                                else:
                                    pass
                        except:
                            pass

                        try:
                            if self_transportation_data["remark"]:
                                st_remark = self_transportation_data["remark"]
                                if len(st_remark) == 0:
                                    st_remark = None

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(remark=st_remark)
                        except:
                            pass
                        try:
                            if new_st_payment_entry is True:
                                st_payment = self_transportation_data[
                                    "self_transportation_payment"
                                ]
                                st_date_str = st_payment["date"]
                                if len(st_date_str) == 0:
                                    st_date = None
                                else:
                                    try:
                                        st_date = datetime.datetime.strptime(
                                            st_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        st_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                st_bank_name = st_payment["bank_name"]
                                if len(st_bank_name) == 0:
                                    st_bank_name = None

                                st_account_name = st_payment["account_name"]
                                if len(st_account_name) == 0:
                                    st_account_name = None

                                st_account_no = st_payment["account_no"]
                                if len(st_account_no) == 0:
                                    st_account_no = None

                                st_quantity = st_payment["quantity"]
                                if (
                                    len(st_quantity) == 0
                                    or st_quantity.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    st_quantity = 0
                                else:
                                    st_quantity = int(st_quantity)

                                st_payment_amount = st_payment["amount"]
                                if (
                                    len(st_payment_amount) == 0
                                    or st_payment_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    st_payment_amount = 0
                                else:
                                    st_payment_amount = float(st_payment_amount)

                                st_cheque_no = st_payment["cheque_no"]
                                if len(st_cheque_no) == 0:
                                    st_cheque_no = None

                                st_utr_no = st_payment["utr_no"]
                                if len(st_utr_no) == 0:
                                    st_utr_no = None

                                if st_payment_in == "Cheque":
                                    st_payment_object = (
                                        SelfTransportationPayment.objects.get(
                                            cheque_no=st_cheque_no
                                        )
                                    )
                                    st_payment_object.add_container(
                                        container=container_object, amount=st_price
                                    )
                                elif st_payment_in == "Utr":
                                    st_payment_object = (
                                        SelfTransportationPayment.objects.get(
                                            utr_no=st_utr_no
                                        )
                                    )
                                    st_payment_object.add_container(
                                        container=container_object, amount=st_price
                                    )

                                GateInHistory.objects.filter(pk=data["gih_pk"]).update(
                                    st_payment=st_payment_object
                                )
                            else:
                                pass
                        except:
                            pass
                        else:
                            pass
                    else:
                        pass
                except:
                    pass
                gih = GateInHistory.objects.get(pk=data["gih_pk"])
                if not gih.lolo.payment_type == "None":
                    lolo_bill = create_billing_lolo(obj=gih, process="IN")

                if (
                    "self_transportation_data" in data.keys()
                    and not gih.st.payment_type == "None"
                ):
                    st_bill = create_billing_st(obj=gih, process="IN")
                lolo_night_charges = apply_lolo_night_charges(obj=gih, process="IN")

                if "image_url" in gate_in_data.keys():
                    img_url = gate_in_data["image_url"]
                    if img_url:
                        upload_driver_img_to_s3(
                            img_url, gih, container_no, driver_license, "IN"
                        )

                updated_gih = GateInHistory.objects.get(pk=data["gih_pk"])
                if (
                    updated_gih.gate_in.arrived == "Port/Vessel"
                    and site.en_block_movement
                ):

                    gate_in = updated_gih.gate_in
                    job_order_no = gate_in.bl_no
                    vessel_name = (
                        gate_in.vessel_name.strip() if gate_in.vessel_name else ""
                    )
                    voyage_no = gate_in.voyage_no.strip() if gate_in.voyage_no else ""
                    location = updated_gih.container.location
                    site = updated_gih.container.site
                    ref_code = updated_gih.container.ref_code

                    if job_order_no == "" or vessel_name == "" or voyage_no == "":
                        raise ValidationError(
                            "Missing required fields for EnBlock Movement i.e Bl No, Vessel Name and Voyage No"
                        )

                    en_block_qs = EnBlockMovement.objects.filter(
                        line=ref_code,
                        job_order_no=job_order_no,
                        vessel_no=vessel_name,
                        voyage_no=voyage_no,
                        location=location,
                        site=site,
                    )
                    previous_en_block_qs = EnBlockMovement.objects.filter(
                        line=previous_line,
                        job_order_no=previous_job_order_no,
                        vessel_no=previous_vessel_name,
                        voyage_no=previous_voyage_no,
                        location=location,
                        site=site,
                    )

                    if not en_block_qs.exists() or not previous_en_block_qs.exists():
                        raise ValidationError(
                            "Invalid Bl No. or Vessel Name or Voyage No. for EnBlock Movement"
                        )

                    previous_en_block = previous_en_block_qs.first()
                    en_block = en_block_qs.first()

                    if previous_en_block.pendency < 1:
                        raise ValidationError(
                            "Not enough stock for this Bl No. i.e pendency is zero"
                        )

                    previous_en_block.pendency = previous_en_block.pendency - 1
                    previous_en_block.gate_ins = previous_en_block.gate_ins + 1
                    previous_en_block.save(update_fields=["pendency", "gate_ins"])

                    en_block.pendency = en_block.pendency - 1
                    en_block.gate_ins = en_block.gate_ins + 1
                    en_block.save(update_fields=["pendency", "gate_ins"])

            return Response(
                {"successMsg": "Data Update", "gih_pk": data["gih_pk"]}, status=200
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=200,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "errorMsg": f"An unexpected error occurred. Please try again later.",
                },
                status=200,
            )


class UpdateGateOutProcess(views.APIView):
    """
    the Post function will update data
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            main_data = {}
            container_no = data["container_no"]
            date_str = data["date"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            container_object = Container.objects.get(
                container_no=container_no, location=location, site=site
            )
            history_object = None
            req_date = datetime.datetime.strptime(date_str, "%d/%m/%Y").date()
            for obj in GateOutHistory.objects.filter(container=container_object):
                if (
                    obj.date.astimezone(timezone.get_current_timezone()).date()
                    == req_date
                ):
                    history_object = obj
            container_obj = history_object.container.get_container()
            try:
                manufacturing_date = (
                    datetime.datetime.strptime(
                        container_obj["manufacturing_date"], "%Y-%m-%d"
                    )
                    .date()
                    .strftime("%d/%m/%Y")
                )

            except:
                manufacturing_date = ""
            container_obj["manufacturing_date"] = manufacturing_date
            eir_obj = history_object.eir.get_eir()
            eir_obj["eir_line"] = [
                line.get_eir_line()
                for line in EirLine.objects.filter(eir=history_object.eir)
            ]
            gate_out_obj = history_object.gate_out.get_gate_out()
            lolo_obj = history_object.lolo.get_handling()
            if history_object.lolo_payment is not None:
                lolo_obj["lolo_payment"] = (
                    history_object.lolo_payment.get_payment_details()
                )
            else:
                lolo_obj["lolo_payment"] = ""
            if history_object.st is not None:
                st_obj = history_object.st.get_self_transportation()
                if history_object.st_payment is not None:
                    st_obj["self_transportation_payment"] = (
                        history_object.st_payment.get_payment_details()
                    )
                else:
                    st_obj["self_transportation_payment"] = ""
                main_data["self_transportation_data"] = st_obj
            else:
                main_data["self_transportation_data"] = ""
            main_data["container_data"] = container_obj
            main_data["eir_data"] = eir_obj
            main_data["gate_out_data"] = gate_out_obj
            main_data["lolo_data"] = lolo_obj
            main_data["goh_pk"] = history_object.pk
            return Response(main_data, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials {e}"}, status=200)

    def put(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            with transaction.atomic():
                # ************************************* Condition Check *************************************************
                lolo_data = data["lolo_data"]
                goh_object = GateOutHistory.objects.get(pk=data["goh_pk"])
                new_lolo_payment_entry = None
                new_st_entry = None
                new_st_payment_entry = None
                lolo_payment_in = None
                st_payment_in = None
                lolo_payment = None
                lolo_cheque_no = None
                lolo_utr_no = None
                st_payment = None
                st_cheque_no = None
                st_utr_no = None

                container_data = data["container_data"]
                container_no = container_data["container_no"]
                manufacturing_date_str = container_data["manufacturing_date"]

                if len(container_no) == 0:
                    return Response(
                        {"errorMsg": "Please Enter Container_no"}, status=200
                    )

                if len(manufacturing_date_str) == 0:
                    return Response(
                        {"errorMsg": "Please provide manufacturing date"},
                        status=200,
                    )
                else:
                    try:
                        manufacturing_date = datetime.datetime.strptime(
                            manufacturing_date_str, "%d/%m/%Y"
                        ).date()
                    except:
                        error_log = logging.getLogger("error_log")
                        error_log.error(traceback.format_exc())
                        return Response(
                            {"errorMsg": "Please provide Valid manufacturing date"},
                            status=200,
                        )

                container_object = Container.objects.get(pk=container_data["pk"])

                if not container_object.container_no == container_no:
                    if not len(container_no) == 11:
                        return Response(
                            {
                                "errorMsg": "Invalid Entry, "
                                "Please Enter Container_no having first 4 uppercase alphabets and "
                                "rest 7 digits"
                            },
                            status=200,
                        )
                    if check_char_digit(container_no) is False:
                        return Response(
                            {
                                "errorMsg": "Invalid Entry, "
                                "Please Enter Container_no having first 4 uppercase alphabets and "
                                "rest 7 digits"
                            },
                            status=200,
                        )
                    validation = check_digit(container_no=container_no)
                    if validation is True:
                        try:
                            Container.objects.get(
                                container_no=container_no,
                                status="IN",
                                location=location,
                            )
                            return Response(
                                {"errorMsg": "Container_no Valid but already exist."},
                                status=200,
                            )
                        except:
                            pass
                    else:
                        try:
                            Container.objects.get(
                                container_no=container_no,
                                status="IN",
                                location=location,
                            )
                            return Response(
                                {
                                    "errorMsg": "Container_no Not Valid but already exist."
                                },
                                status=200,
                            )
                        except:
                            pass

                    if Container.objects.filter(
                        container_no=container_no, location=location, site=site
                    ).exists():
                        return Response(
                            {
                                "errorMsg": "Provided ContainerNo Already Exist in Current Site"
                            },
                            status=200,
                        )

                if (
                    goh_object.lolo_payment is None
                    and not len(lolo_data["lolo_payment"]) == 0
                ):
                    new_lolo_payment_entry = True
                    lolo_payment = lolo_data["lolo_payment"]
                    lolo_cheque_no = lolo_payment["cheque_no"]
                    lolo_utr_no = lolo_payment["utr_no"]
                    try:
                        if HandlingPayment.objects.filter(
                            cheque_no=lolo_cheque_no
                        ).exists():
                            handling_check_object = HandlingPayment.objects.filter(
                                cheque_no=lolo_cheque_no
                            ).first()
                            lolo_payment_in = "Cheque"
                            if (
                                handling_check_object.remaining == 0
                                or handling_check_object.amount == 0
                            ):
                                return Response(
                                    {
                                        "errorMsg": "No Remaining Quantity of Container Left on lolo cheque no"
                                    },
                                    status=200,
                                )

                        elif HandlingPayment.objects.filter(
                            utr_no=lolo_utr_no
                        ).exists():
                            handling_check_object = HandlingPayment.objects.filter(
                                utr_no=lolo_utr_no
                            ).first()
                            lolo_payment_in = "Utr"
                            if (
                                handling_check_object.remaining == 0
                                or handling_check_object.amount == 0
                            ):
                                return Response(
                                    {
                                        "errorMsg": "No Remaining Quantity of Container Left on lolo utr no"
                                    },
                                    status=200,
                                )

                        else:
                            pass
                    except:
                        pass
                elif (
                    goh_object.lolo_payment is not None
                    and not len(lolo_data["lolo_payment"]) == 0
                ):
                    new_lolo_payment_entry = False
                else:
                    pass

                try:
                    if (
                        goh_object.st is None
                        and not len(data["self_transportation_data"]) == 0
                    ):
                        new_st_entry = True
                        self_transportation_data = data["self_transportation_data"]
                        if (
                            goh_object.st_payment is None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = True
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_cheque_no = st_payment["cheque_no"]
                            st_utr_no = st_payment["utr_no"]
                            try:
                                if SelfTransportationPayment.objects.filter(
                                    cheque_no=st_cheque_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            cheque_no=st_cheque_no
                                        ).first()
                                    )
                                    st_payment_in = "Cheque"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st cheque no"
                                            },
                                            status=200,
                                        )

                                elif SelfTransportationPayment.objects.filter(
                                    utr_no=st_utr_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            utr_no=st_utr_no
                                        ).first()
                                    )
                                    st_payment_in = "Utr"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st utr no"
                                            },
                                            status=200,
                                        )

                                else:
                                    pass
                            except:
                                pass
                        elif (
                            goh_object.st_payment is not None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = False
                        else:
                            pass
                    elif (
                        goh_object.st is not None
                        and not len(data["self_transportation_data"]) == 0
                    ):
                        new_st_entry = False
                        self_transportation_data = data["self_transportation_data"]
                        if (
                            goh_object.st_payment is None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = True
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_cheque_no = st_payment["cheque_no"]
                            st_utr_no = st_payment["utr_no"]
                            try:
                                if SelfTransportationPayment.objects.filter(
                                    cheque_no=st_cheque_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            cheque_no=st_cheque_no
                                        ).first()
                                    )
                                    st_payment_in = "Cheque"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st cheque no"
                                            },
                                            status=200,
                                        )

                                elif SelfTransportationPayment.objects.filter(
                                    utr_no=st_utr_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            utr_no=st_utr_no
                                        ).first()
                                    )
                                    st_payment_in = "Utr"
                                    if (
                                        st_check_object.remaining == 0
                                        or st_check_object.amount == 0
                                    ):
                                        return Response(
                                            {
                                                "errorMsg": "No Remaining Quantity of Container Left on st utr no"
                                            },
                                            status=200,
                                        )

                                else:
                                    pass
                            except:
                                pass
                        elif (
                            goh_object.st_payment is not None
                            and not len(
                                self_transportation_data["self_transportation_payment"]
                            )
                            == 0
                        ):
                            new_st_payment_entry = False
                        else:
                            pass
                    else:
                        pass
                except:
                    pass

                # *************************************** Update Eir *******************************************************
                try:
                    if data["eir_data"]:
                        eir_data = data["eir_data"]
                        try:
                            if eir_data["eir_date"]:
                                eir_date_str = eir_data["eir_date"]
                                if len(eir_date_str) == 0:
                                    eir_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        eir_date = datetime.datetime.strptime(
                                            eir_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        eir_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )
                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    eir_date=eir_date
                                )
                        except:
                            pass
                        try:
                            if eir_data["eir_time"]:
                                eir_time_str = eir_data["eir_time"]
                                if len(eir_time_str) == 0:
                                    eir_time = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .time()
                                    )
                                else:
                                    try:
                                        eir_time = datetime.datetime.strptime(
                                            eir_time_str, "%H:%M"
                                        ).time()
                                    except:
                                        eir_time = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .time()
                                        )
                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    eir_time=eir_time
                                )
                        except:
                            pass
                        try:
                            if eir_data["offload_date"]:
                                offload_date_str = eir_data["offload_date"]
                                if len(offload_date_str) == 0:
                                    offload_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        offload_date = datetime.datetime.strptime(
                                            offload_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        offload_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )
                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    offload_date=offload_date
                                )
                        except:
                            pass
                        try:
                            if eir_data["offload_time"]:
                                offload_time_str = eir_data["offload_time"]
                                if len(offload_time_str) == 0:
                                    offload_time = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .time()
                                    )
                                else:
                                    try:
                                        offload_time = datetime.datetime.strptime(
                                            offload_time_str, "%H:%M"
                                        ).time()
                                    except:
                                        offload_time = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .time()
                                        )

                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    offload_time=offload_time
                                )
                        except:
                            pass
                        try:
                            if eir_data["eir_amount"]:
                                eir_amount = eir_data["eir_amount"]
                                if (
                                    len(eir_amount) == 0
                                    or eir_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    eir_amount = 0
                                else:
                                    eir_amount = float(eir_amount)

                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    eir_amount=eir_amount
                                )
                        except:
                            pass
                        try:
                            if eir_data["repair_amount"]:
                                repair_amount = eir_data["repair_amount"]
                                if (
                                    len(repair_amount) == 0
                                    or repair_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    repair_amount = 0
                                else:
                                    repair_amount = float(repair_amount)

                                Eir.objects.filter(pk=eir_data["pk"]).update(
                                    repair_amount=repair_amount
                                )
                        except:
                            pass
                        try:
                            if eir_data["eir_line"]:
                                eir_line = eir_data["eir_line"]
                                try:
                                    eir_object = Eir.objects.get(pk=eir_data["pk"])
                                    try:
                                        eir_line_objects = EirLine.objects.filter(
                                            eir=eir_object
                                        )
                                        for obj in eir_line_objects:
                                            obj.delete()
                                    except:
                                        pass
                                    for line in eir_line:
                                        grap_position = line["grap_position"]
                                        if len(grap_position) == 0:
                                            grap_position = None
                                        damage_code = line["damage_code"]
                                        if len(damage_code) == 0:
                                            damage_code = None
                                        description = line["description"]
                                        if len(description) == 0:
                                            description = None
                                        if grap_position is not None:
                                            EirLine.create(
                                                eir=eir_object,
                                                grap_position=grap_position,
                                                damage_code=damage_code,
                                                description=description,
                                            ).save()

                                    try:
                                        eir_img = eir_data["eir_img"]
                                        if len(str(eir_img)) == 0:
                                            eir_img = save_default_eir_img()
                                        # eir_object.eir_img.delete()
                                        eir_object.eir_img = eir_img
                                        eir_object.save()
                                        eir_object.upload_eir_img()
                                    except:
                                        pass
                                except:
                                    pass
                        except:
                            pass
                except:
                    pass
                # ***************************************** Update Gate In ************************************************
                try:
                    if data["gate_out_data"]:
                        gate_out_data = data["gate_out_data"]
                        out_date = None
                        out_time = None
                        try:
                            if gate_out_data["out_date"]:
                                out_date_str = gate_out_data["out_date"]
                                if len(out_date_str) == 0:
                                    out_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        out_date = datetime.datetime.strptime(
                                            out_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        out_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    out_date=out_date
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["out_time"]:
                                out_time_str = gate_out_data["out_time"]
                                if len(out_time_str) == 0:
                                    out_time = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .time()
                                    )
                                else:
                                    try:
                                        out_time = datetime.datetime.strptime(
                                            out_time_str, "%H:%M"
                                        ).time()
                                    except:
                                        out_time = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .time()
                                        )

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    out_time=out_time
                                )
                        except:
                            pass
                        try:
                            # gate out time and eir time 15 mins difference
                            temp_date_time = datetime.datetime.combine(
                                out_date, out_time
                            ) - datetime.timedelta(minutes=15)
                            temp_date_time = temp_date_time.astimezone(
                                timezone.get_current_timezone()
                            )
                            eir_object = Eir.objects.get(pk=eir_data["pk"])
                            eir_object.eir_date = temp_date_time.date()
                            eir_object.eir_time = temp_date_time.time()
                            eir_object.save()

                            out_date_time = date = datetime.datetime.combine(
                                out_date, out_time
                            ).astimezone(timezone.get_current_timezone())

                            goh_obj = GateOutHistory.objects.filter(pk=data["goh_pk"])

                            if (
                                not list(goh_obj)[0].date.astimezone(
                                    timezone.get_current_timezone()
                                )
                                == out_date_time
                            ):
                                list(goh_obj)[0].is_date_updated = True
                                list(goh_obj)[0].save()

                            goh_obj.update(date=out_date_time)

                            if seal_no is not None:
                                seal_object = SealNo.objects.get(
                                    number=stock_object.seal_no
                                )
                                seal_object.in_use_date = out_date_time
                                seal_object.out_date = out_date_time
                                seal_object.is_lock = True
                                seal_object.save()

                        except:
                            pass
                        try:
                            if gate_out_data["condition"]:
                                condition = gate_out_data["condition"]
                                if len(condition) == 0:
                                    condition = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    condition=condition
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["grade"]:
                                grade = gate_out_data["grade"]
                                if len(grade) == 0:
                                    grade = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    grade=grade
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["departed"]:
                                departed = gate_out_data["departed"]
                                if len(departed) == 0:
                                    departed = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    departed=departed
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["destination"]:
                                destination = gate_out_data["destination"]
                                if len(destination) == 0:
                                    destination = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    destination=destination
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["consignee"]:
                                consignee = gate_out_data["consignee"]
                                if len(consignee) == 0:
                                    consignee = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    consignee=consignee
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["shipper"]:
                                shipper = gate_out_data["shipper"]
                                if len(shipper) == 0:
                                    shipper = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    shipper=shipper
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["delivery"]:
                                delivery = gate_out_data["delivery"]
                                if len(delivery) == 0:
                                    delivery = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    delivery=delivery
                                )
                        except:
                            pass
                        try:
                            to_location_code = gate_out_data["to_location_code"]

                            if len(to_location_code) == 0:
                                to_location_code = None

                            GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                to_location_code=to_location_code
                            )
                        except:
                            pass

                        try:
                            to_depot_code = gate_out_data["to_depot_code"]

                            if len(to_depot_code) == 0:
                                to_depot_code = None

                            GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                to_depot_code=to_depot_code
                            )
                        except:
                            pass

                        try:
                            road_rail_to_location_code = gate_out_data[
                                "road_rail_to_location_code"
                            ]

                            if len(road_rail_to_location_code) == 0:
                                road_rail_to_location_code = None

                            GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                road_rail_to_location_code=road_rail_to_location_code
                            )
                        except:
                            pass

                        try:
                            if gate_out_data["to_port_code"]:
                                to_port_code = gate_out_data["to_port_code"]
                                if len(to_port_code) == 0:
                                    to_port_code = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    to_port_code=to_port_code
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["vessel_name"]:
                                vessel_name = gate_out_data["vessel_name"]
                                if len(vessel_name) == 0:
                                    vessel_name = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    vessel_name=vessel_name
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["voyage_no"]:
                                voyage_no = gate_out_data["voyage_no"]
                                if len(voyage_no) == 0:
                                    voyage_no = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    voyage_no=voyage_no
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["ro_ref"]:
                                ro_ref = gate_out_data["ro_ref"]
                                if len(ro_ref) == 0:
                                    ro_ref = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    ro_ref=ro_ref
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["export_cargo"]:
                                export_cargo = gate_out_data["export_cargo"]
                                if len(export_cargo) == 0:
                                    export_cargo = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    export_cargo=export_cargo
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["transporter_name"]:
                                transporter_name_str = gate_out_data["transporter_name"]
                                if len(transporter_name_str) == 0:
                                    transporter_name = None
                                else:
                                    try:
                                        transporter_name = Transporter.objects.filter(
                                            name=transporter_name_str,
                                            location=location,
                                            site=site,
                                        ).first()
                                    except:
                                        pass
                                        # transporter_name = Transporter(
                                        #     name=transporter_name_str,
                                        #     location=location,
                                        #     site=site,
                                        # )
                                        # transporter_name.save()

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    transporter_name=transporter_name
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["vehicle_no"]:
                                vehicle_no = gate_out_data["vehicle_no"]
                                if len(vehicle_no) == 0:
                                    vehicle_no = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    vehicle_no=vehicle_no
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["driver_name"]:
                                driver_name = gate_out_data["driver_name"]
                                if len(driver_name) == 0:
                                    driver_name = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    driver_name=driver_name
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["driver_license"]:
                                driver_license = gate_out_data["driver_license"]
                                if len(driver_license) == 0:
                                    driver_license = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    driver_license=driver_license
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["driver_mobile_no"]:
                                driver_mobile_no = gate_out_data["driver_mobile_no"]
                                if (
                                    len(driver_mobile_no) == 0
                                    or driver_mobile_no.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    driver_mobile_no = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    driver_mobile_no=driver_mobile_no
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["carrier_code"]:
                                carrier_code = gate_out_data["carrier_code"]
                                if len(carrier_code) == 0:
                                    carrier_code = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    carrier_code=carrier_code
                                )
                        except:
                            pass
                        try:
                            location = app_user.location

                            GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                location=location
                            )
                        except:
                            pass
                        try:
                            if gate_out_data["port_of_loading"]:
                                port_of_loading = gate_out_data["port_of_loading"]
                                if len(port_of_loading) == 0:
                                    port_of_loading = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    port_of_loading=port_of_loading
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["port_of_discharge"]:
                                port_of_discharge = gate_out_data["port_of_discharge"]
                                if len(port_of_discharge) == 0:
                                    port_of_discharge = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    port_of_discharge=port_of_discharge
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["booking_no"]:
                                booking_no = gate_out_data["booking_no"]
                                if len(booking_no) == 0:
                                    booking_no = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    booking_no=booking_no
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["booking_date"]:
                                booking_date_str = gate_out_data["booking_date"]
                                if len(booking_date_str) == 0:
                                    booking_date = None
                                else:
                                    try:
                                        booking_date = datetime.datetime.strptime(
                                            booking_date_str, "%d/%m/%Y"
                                        ).date()
                                    except:
                                        booking_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    booking_date=booking_date
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["booking_party"]:
                                booking_party = gate_out_data["booking_party"]
                                if len(booking_party) == 0:
                                    booking_party = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    booking_party=booking_party
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["seal_no"]:
                                seal_no = gate_out_data["seal_no"]
                                if len(seal_no) == 0:
                                    seal_no = None

                                container_data = data["container_data"]
                                container_object = Container.objects.get(
                                    pk=container_data["pk"]
                                )
                                out_data = GateOutHistory.objects.get(pk=data["goh_pk"])
                                record = ContainerInOutRecord.objects.get(
                                    container=container_object, out_data=out_data
                                )
                                stock_object = ContainerStock.objects.get(
                                    container=record.container,
                                    gate_in=record.in_data.gate_in,
                                )

                                if not stock_object.seal_no == seal_no:
                                    if (
                                        stock_object.seal_no is not None
                                        and SealNo.objects.filter(
                                            number=stock_object.seal_no
                                        ).exists()
                                    ):
                                        old_seal_no_object = SealNo.objects.get(
                                            number=stock_object.seal_no
                                        )
                                        old_seal_no_object.is_available = True
                                        old_seal_no_object.in_use = False
                                        old_seal_no_object.container_no = None
                                        old_seal_no_object.in_use_date = None
                                        old_seal_no_object.out_date = None
                                        old_seal_no_object.is_lock = False
                                        old_seal_no_object.save()

                                    if seal_no is not None:
                                        seal_no_object = SealNo.objects.get(
                                            number=seal_no
                                        )
                                        seal_no = seal_no_object.number
                                        stock_object.seal_no = seal_no
                                        stock_object.save()
                                        seal_no_object.is_available = False
                                        seal_no_object.in_use = True
                                        seal_no_object.container_no = (
                                            stock_object.container.container_no
                                        )
                                        seal_no_object.in_use_date = (
                                            datetime.datetime.now().astimezone(
                                                timezone.get_current_timezone()
                                            )
                                        )
                                        seal_no_object.out_date = (
                                            datetime.datetime.now().astimezone(
                                                timezone.get_current_timezone()
                                            )
                                        )
                                        seal_no_object.is_lock = True
                                        seal_no_object.save()
                                    else:
                                        stock_object.seal_no = seal_no
                                        stock_object.save()

                                # if not stock_object.seal_no == seal_no:
                                #     if ContainerStock.objects.filter(
                                #         seal_no=seal_no
                                #     ).exists():
                                #         return Response(
                                #             {"errorMsg": "Given Seal no is in Use"},
                                #             status=200,
                                #         )

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    seal_no=seal_no
                                )
                        except:
                            pass
                        try:
                            if gate_out_data["remarks"]:
                                remarks = gate_out_data["remarks"]
                                if len(remarks) == 0:
                                    remarks = None

                                GateOut.objects.filter(pk=gate_out_data["pk"]).update(
                                    remarks=remarks
                                )
                        except:
                            pass
                except:
                    pass
                # ***************************************** Update lolo data *********************************************

                goh_object = GateOutHistory.objects.get(pk=data["goh_pk"])

                try:
                    if data["lolo_data"]:
                        lolo_data = data["lolo_data"]
                        try:
                            if lolo_data["apply_charges"]:
                                lolo_apply_charges = lolo_data["apply_charges"]
                                if len(lolo_apply_charges) == 0:
                                    lolo_apply_charges = None

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    apply_charges=lolo_apply_charges
                                )
                        except:
                            pass
                        try:
                            if lolo_data["customer_name"]:
                                lolo_customer_name_str = lolo_data["customer_name"]
                                client_name = container_data["client"]
                                if (
                                    len(lolo_customer_name_str) == 0
                                    or lolo_apply_charges is None
                                    # or lolo_apply_charges == "Line"
                                    or client_name == lolo_customer_name_str
                                    or Client.objects.filter(
                                        name=lolo_customer_name_str,
                                        location=location,
                                        site=site,
                                        type="Line",
                                    ).exists()
                                    is True
                                ):
                                    lolo_customer_name = None
                                else:
                                    try:
                                        lolo_customer_name = Client.objects.get(
                                            name=lolo_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                    except:
                                        lolo_customer_name = Client(
                                            name=lolo_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                        lolo_customer_name.save()
                                        lolo_customer_name.create_client_code()

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    customer_name=lolo_customer_name
                                )
                        except:
                            pass
                        try:
                            if lolo_data["invoice_date"]:
                                invoice_date_str = lolo_data["invoice_date"]
                                if len(invoice_date_str) == 0:
                                    lolo_invoice_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        lolo_invoice_date = datetime.datetime.strptime(
                                            invoice_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        lolo_invoice_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    invoice_date=lolo_invoice_date
                                )
                        except:
                            pass
                        try:
                            if lolo_data["receipt_date"]:
                                receipt_date_str = lolo_data["receipt_date"]
                                if len(receipt_date_str) == 0:
                                    lolo_receipt_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        lolo_receipt_date = datetime.datetime.strptime(
                                            receipt_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        lolo_receipt_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    receipt_date=lolo_receipt_date
                                )
                        except:
                            pass
                        try:
                            if lolo_data["lolo_type"]:
                                lolo_type = lolo_data["lolo_type"]
                                if len(lolo_type) == 0:
                                    lolo_type = None

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    lolo_type=lolo_type
                                )
                        except:
                            pass
                        try:
                            is_night_charges_applied = lolo_data.get(
                                "is_night_charges_applied", None
                            )
                            if is_night_charges_applied is not None:
                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    is_night_charges_applied=is_night_charges_applied
                                )
                        except:
                            pass
                        try:
                            if lolo_data["payment_type"]:
                                lolo_payment_type = lolo_data["payment_type"]
                                if len(lolo_payment_type) == 0:
                                    lolo_payment_type = "None"
                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    payment_type=lolo_payment_type
                                )
                        except:
                            pass
                        try:
                            if lolo_data["lolo_amount"]:
                                lolo_amount = lolo_data["lolo_amount"]
                                if (
                                    len(lolo_amount) == 0
                                    or lolo_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    lolo_amount = 0
                                else:
                                    lolo_amount = float(lolo_amount)

                                lolo_object = Handling.objects.get(pk=lolo_data["pk"])
                                lolo_object.lolo_amount = lolo_amount
                                lolo_object.net_amount = lolo_amount
                                lolo_object.taxable_amount = lolo_amount
                                lolo_object.gross_amount = lolo_amount
                                lolo_object.save()
                                if not float(lolo_object.cgst) == float(
                                    0
                                ) and not float(lolo_object.sgst) == float(0):
                                    cgst_amount = float(lolo_amount) * float(
                                        lolo_object.cgst
                                    )
                                    sgst_amount = float(lolo_amount) * float(
                                        lolo_object.sgst
                                    )
                                    gross_amount = (
                                        float(lolo_amount)
                                        + float(cgst_amount)
                                        + float(sgst_amount)
                                    )
                                    lolo_object.cgst_amount = cgst_amount
                                    lolo_object.sgst_amount = sgst_amount
                                    lolo_object.gross_amount = gross_amount
                                    lolo_object.save()
                                elif not float(lolo_object.igst) == float(0):
                                    igst_amount = float(lolo_amount) * float(
                                        lolo_object.igst
                                    )
                                    gross_amount = float(lolo_amount) + float(
                                        igst_amount
                                    )
                                    lolo_object.igst_amount = igst_amount
                                    lolo_object.gross_amount = gross_amount
                                    lolo_object.save()
                                else:
                                    pass
                        except:
                            pass

                        try:
                            if lolo_data["remark"]:
                                lolo_remark = lolo_data["remark"]
                                if len(lolo_remark) == 0:
                                    lolo_remark = None

                                Handling.objects.filter(pk=lolo_data["pk"]).update(
                                    remark=lolo_remark
                                )
                        except:
                            pass
                        try:
                            if new_lolo_payment_entry is True:
                                container_object = Container.objects.get(
                                    pk=container_data["pk"]
                                )

                                lolo_amount = lolo_data["lolo_amount"]

                                if len(lolo_cheque_no) == 0:
                                    lolo_cheque_no = None

                                if len(lolo_utr_no) == 0:
                                    lolo_utr_no = None

                                lolo_date_str = lolo_payment["date"]

                                if len(lolo_date_str) == 0:
                                    lolo_date = None
                                else:
                                    try:
                                        lolo_date = datetime.datetime.strptime(
                                            lolo_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        lolo_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                lolo_bank_name = lolo_payment["bank_name"]
                                if len(lolo_bank_name) == 0:
                                    lolo_bank_name = None

                                lolo_account_name = lolo_payment["account_name"]
                                if len(lolo_account_name) == 0:
                                    lolo_account_name = None

                                lolo_account_no = lolo_payment["account_no"]
                                if len(lolo_account_no) == 0:
                                    lolo_account_no = None

                                lolo_quantity = lolo_payment["quantity"]
                                if (
                                    len(lolo_quantity) == 0
                                    or lolo_quantity.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    lolo_quantity = 0
                                else:
                                    lolo_quantity = int(lolo_quantity)

                                lolo_payment_amount = lolo_payment["amount"]
                                if (
                                    len(lolo_payment_amount) == 0
                                    or lolo_payment_amount.replace(
                                        ".", "", 1
                                    ).isnumeric()
                                    is False
                                ):
                                    lolo_payment_amount = 0
                                else:
                                    lolo_payment_amount = float(lolo_payment_amount)

                                if lolo_payment_in == "Cheque":
                                    lolo_payment_object = HandlingPayment.objects.get(
                                        cheque_no=lolo_cheque_no
                                    )
                                    lolo_payment_object.add_container(
                                        container=container_object, amount=lolo_amount
                                    )
                                elif lolo_payment_in == "Utr":
                                    lolo_payment_object = HandlingPayment.objects.get(
                                        utr_no=lolo_utr_no
                                    )
                                    lolo_payment_object.add_container(
                                        container=container_object, amount=lolo_amount
                                    )
                                GateOutHistory.objects.filter(pk=data["goh_pk"]).update(
                                    lolo_payment=lolo_payment_object
                                )
                            else:
                                pass
                        except:
                            pass
                except:
                    pass

                # ***************************************** Update self-transportation ***********************************
                try:
                    if new_st_entry is True:
                        self_transportation_data = data["self_transportation_data"]
                        container_data = data["container_data"]
                        container_object = Container.objects.get(
                            pk=container_data["pk"]
                        )

                        transportername = self_transportation_data["transporter"]
                        if len(transportername) == 0:
                            st_transporter = None
                        else:
                            try:
                                st_transporter = Transporter.objects.get(
                                    name=transportername, location=location, site=site
                                )
                            except:
                                st_transporter = Transporter(
                                    name=transportername, location=location, site=site
                                )
                                st_transporter.save()

                        st_apply_charges = self_transportation_data["apply_charges"]
                        if len(st_apply_charges) == 0:
                            st_apply_charges = None

                        st_customer_name_str = self_transportation_data["customer_name"]
                        client_name = container_data["client"]
                        if (
                            len(st_customer_name_str) == 0
                            or st_apply_charges is None
                            # or st_apply_charges == "Line"
                            or client_name == st_customer_name_str
                            or Client.objects.filter(
                                name=st_customer_name_str,
                                location=location,
                                site=site,
                                type="Line",
                            ).exists()
                            is True
                        ):
                            st_customer_name = None
                        else:
                            try:
                                st_customer_name = Client.objects.get(
                                    name=st_customer_name_str,
                                    location=location,
                                    site=site,
                                    type="Party",
                                )
                            except:
                                st_customer_name = Client(
                                    name=st_customer_name_str,
                                    location=location,
                                    site=site,
                                    type="Party",
                                )
                                st_customer_name.save()
                                st_customer_name.create_client_code()

                        st_origin = self_transportation_data["origin"]
                        if len(st_origin) == 0:
                            st_origin = None

                        st_receipt_date_str = self_transportation_data["receipt_date"]
                        if len(st_receipt_date_str) == 0:
                            st_receipt_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )
                        else:
                            try:
                                st_receipt_date = datetime.datetime.strptime(
                                    st_receipt_date_str, "%Y-%m-%d"
                                ).date()
                            except:
                                st_receipt_date = (
                                    datetime.datetime.now()
                                    .astimezone(timezone.get_current_timezone())
                                    .date()
                                )

                        st_invoice_date_str = self_transportation_data["invoice_date"]
                        if len(st_invoice_date_str) == 0:
                            st_invoice_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )
                        else:
                            try:
                                st_invoice_date = datetime.datetime.strptime(
                                    st_invoice_date_str, "%Y-%m-%d"
                                ).date()
                            except:
                                st_invoice_date = (
                                    datetime.datetime.now()
                                    .astimezone(timezone.get_current_timezone())
                                    .date()
                                )

                        st_payment_type = self_transportation_data["payment_type"]
                        if len(st_payment_type) == 0:
                            st_payment_type = "None"

                        st_price = self_transportation_data["price"]
                        if (
                            len(st_price) == 0
                            or st_price.replace(".", "", 1).isnumeric() is False
                        ):
                            st_price = 0
                        else:
                            st_price = float(st_price)

                        st_remark = self_transportation_data["remark"]
                        if len(st_remark) == 0:
                            st_remark = None

                        self_transportation_object = SelfTransportation.create(
                            container=container_object,
                            transporter=st_transporter,
                            apply_charges=st_apply_charges,
                            customer_name=st_customer_name,
                            origin=st_origin,
                            receipt_date=st_receipt_date,
                            invoice_date=st_invoice_date,
                            payment_type=st_payment_type,
                            price=st_price,
                            remark=st_remark,
                            entry_type="IN",
                        )
                        self_transportation_object.save()
                        self_transportation_object.save_invoice_no(location=location)
                        self_transportation_object.save_receipt_no(location=location)

                        if new_st_payment_entry is True:
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_date_str = st_payment["date"]
                            if len(st_date_str) == 0:
                                st_date = None
                            else:
                                try:
                                    st_date = datetime.datetime.strptime(
                                        st_date_str, "%Y-%m-%d"
                                    ).date()
                                except:
                                    st_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )

                            st_bank_name = st_payment["bank_name"]
                            if len(st_bank_name) == 0:
                                st_bank_name = None

                            st_account_name = st_payment["account_name"]
                            if len(st_account_name) == 0:
                                st_account_name = None

                            st_account_no = st_payment["account_no"]
                            if len(st_account_no) == 0:
                                st_account_no = None

                            st_quantity = st_payment["quantity"]
                            if (
                                len(st_quantity) == 0
                                or st_quantity.replace(".", "", 1).isnumeric() is False
                            ):
                                st_quantity = 0
                            else:
                                st_quantity = int(st_quantity)

                            st_payment_amount = st_payment["amount"]
                            if (
                                len(st_payment_amount) == 0
                                or st_payment_amount.replace(".", "", 1).isnumeric()
                                is False
                            ):
                                st_payment_amount = 0
                            else:
                                st_payment_amount = float(st_payment_amount)

                            st_cheque_no = st_payment["cheque_no"]
                            if len(st_cheque_no) == 0:
                                st_cheque_no = None

                            st_utr_no = st_payment["utr_no"]
                            if len(st_utr_no) == 0:
                                st_utr_no = None

                            if st_payment_in == "Cheque":
                                st_payment_object = (
                                    SelfTransportationPayment.objects.get(
                                        cheque_no=st_cheque_no
                                    )
                                )
                                st_payment_object.add_container(
                                    container=container_object, amount=st_price
                                )
                            elif st_payment_in == "Utr":
                                st_payment_object = (
                                    SelfTransportationPayment.objects.get(
                                        utr_no=st_utr_no
                                    )
                                )
                                st_payment_object.add_container(
                                    container=container_object, amount=st_price
                                )

                            goh_obj = GateOutHistory.objects.get(pk=data["goh_pk"])
                            goh_obj.st = self_transportation_object
                            goh_obj.st_payment = st_payment_object
                            goh_obj.save()
                        else:
                            goh_obj = GateOutHistory.objects.get(pk=data["goh_pk"])
                            goh_obj.st = self_transportation_object
                            goh_obj.save()
                    elif new_st_entry is False:
                        goh_object = GateOutHistory.objects.get(pk=data["goh_pk"])

                        self_transportation_data = data["self_transportation_data"]
                        try:
                            if self_transportation_data["transporter"]:
                                transportername = self_transportation_data[
                                    "transporter"
                                ]
                                if len(transportername) == 0:
                                    st_transporter = None
                                else:
                                    try:
                                        st_transporter = Transporter.objects.get(
                                            name=transportername,
                                            location=location,
                                            site=site,
                                        )
                                    except:
                                        st_transporter = Transporter(
                                            name=transportername,
                                            location=location,
                                            site=site,
                                        )
                                        st_transporter.save()

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(transporter=st_transporter)
                        except:
                            pass
                        try:
                            if self_transportation_data["apply_charges"]:
                                st_apply_charges = self_transportation_data[
                                    "apply_charges"
                                ]
                                if len(st_apply_charges) == 0:
                                    st_apply_charges = None

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(apply_charges=st_apply_charges)
                        except:
                            pass
                        try:
                            if self_transportation_data["customer_name"]:
                                st_customer_name_str = self_transportation_data[
                                    "customer_name"
                                ]
                                client_name = container_data["client"]
                                if (
                                    len(st_customer_name_str) == 0
                                    or st_apply_charges is None
                                    # or st_apply_charges == "Line"
                                    or client_name == st_customer_name_str
                                    or Client.objects.filter(
                                        name=st_customer_name_str,
                                        location=location,
                                        site=site,
                                        type="Line",
                                    ).exists()
                                    is True
                                ):
                                    st_customer_name = None
                                else:
                                    try:
                                        st_customer_name = Client.objects.get(
                                            name=st_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                    except:
                                        st_customer_name = Client(
                                            name=st_customer_name_str,
                                            location=location,
                                            site=site,
                                            type="Party",
                                        )
                                        st_customer_name.save()
                                        st_customer_name.create_client_code()

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(customer_name=st_customer_name)
                        except:
                            pass
                        try:
                            if self_transportation_data["origin"]:
                                st_origin = self_transportation_data["origin"]
                                if len(st_origin) == 0:
                                    st_origin = None

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(origin=st_origin)
                        except:
                            pass
                        try:
                            if self_transportation_data["receipt_date"]:
                                st_receipt_date_str = self_transportation_data[
                                    "receipt_date"
                                ]
                                if len(st_receipt_date_str) == 0:
                                    st_receipt_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        st_receipt_date = datetime.datetime.strptime(
                                            st_receipt_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        st_receipt_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(receipt_date=st_receipt_date)
                        except:
                            pass

                        try:
                            if self_transportation_data["invoice_date"]:
                                st_invoice_date_str = self_transportation_data[
                                    "invoice_date"
                                ]
                                if len(st_invoice_date_str) == 0:
                                    st_invoice_date = (
                                        datetime.datetime.now()
                                        .astimezone(timezone.get_current_timezone())
                                        .date()
                                    )
                                else:
                                    try:
                                        st_invoice_date = datetime.datetime.strptime(
                                            st_invoice_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        st_invoice_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(invoice_date=st_invoice_date)
                        except:
                            pass

                        try:
                            if self_transportation_data["payment_type"]:
                                st_payment_type = self_transportation_data[
                                    "payment_type"
                                ]
                                if len(st_payment_type) == 0:
                                    st_payment_type = "None"

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(payment_type=st_payment_type)
                        except:
                            pass

                        try:
                            if self_transportation_data["price"]:
                                st_price = self_transportation_data["price"]
                                if (
                                    len(st_price) == 0
                                    or st_price.replace(".", "", 1).isnumeric() is False
                                ):
                                    st_price = 0
                                else:
                                    st_price = float(st_price)

                                st_object = SelfTransportation.objects.get(
                                    pk=self_transportation_data["pk"]
                                )
                                st_object.price = st_price
                                st_object.net_amount = st_price
                                st_object.taxable_amount = st_price
                                st_object.gross_amount = st_price
                                st_object.save()

                                if not float(st_object.cgst) == float(0) and not float(
                                    st_object.sgst
                                ) == float(0):
                                    cgst_amount = float(st_price) * float(
                                        st_object.cgst
                                    )
                                    sgst_amount = float(st_price) * float(
                                        st_object.sgst
                                    )
                                    gross_amount = (
                                        float(st_price)
                                        + float(cgst_amount)
                                        + float(sgst_amount)
                                    )
                                    st_object.cgst_amount = cgst_amount
                                    st_object.sgst_amount = sgst_amount
                                    st_object.gross_amount = gross_amount
                                    st_object.save()
                                elif not float(st_object.igst) == float(0):
                                    igst_amount = float(st_price) * float(
                                        st_object.igst
                                    )
                                    gross_amount = float(st_price) + float(igst_amount)
                                    st_object.igst_amount = igst_amount
                                    st_object.gross_amount = gross_amount
                                    st_object.save()
                                else:
                                    pass
                        except:
                            pass

                        try:
                            if self_transportation_data["remark"]:
                                st_remark = self_transportation_data["remark"]
                                if len(st_remark) == 0:
                                    st_remark = None

                                SelfTransportation.objects.filter(
                                    pk=self_transportation_data["pk"]
                                ).update(remark=st_remark)
                        except:
                            pass
                        try:
                            if new_st_payment_entry is True:
                                st_payment = self_transportation_data[
                                    "self_transportation_payment"
                                ]
                                st_date_str = st_payment["date"]
                                if len(st_date_str) == 0:
                                    st_date = None
                                else:
                                    try:
                                        st_date = datetime.datetime.strptime(
                                            st_date_str, "%Y-%m-%d"
                                        ).date()
                                    except:
                                        st_date = (
                                            datetime.datetime.now()
                                            .astimezone(timezone.get_current_timezone())
                                            .date()
                                        )

                                st_bank_name = st_payment["bank_name"]
                                if len(st_bank_name) == 0:
                                    st_bank_name = None

                                st_account_name = st_payment["account_name"]
                                if len(st_account_name) == 0:
                                    st_account_name = None

                                st_account_no = st_payment["account_no"]
                                if len(st_account_no) == 0:
                                    st_account_no = None

                                st_quantity = st_payment["quantity"]
                                if (
                                    len(st_quantity) == 0
                                    or st_quantity.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    st_quantity = 0
                                else:
                                    st_quantity = int(st_quantity)

                                st_payment_amount = st_payment["amount"]
                                if (
                                    len(st_payment_amount) == 0
                                    or st_payment_amount.replace(".", "", 1).isnumeric()
                                    is False
                                ):
                                    st_payment_amount = 0
                                else:
                                    st_payment_amount = float(st_payment_amount)

                                st_cheque_no = st_payment["cheque_no"]
                                if len(st_cheque_no) == 0:
                                    st_cheque_no = None

                                st_utr_no = st_payment["utr_no"]
                                if len(st_utr_no) == 0:
                                    st_utr_no = None

                                if st_payment_in == "Cheque":
                                    st_payment_object = (
                                        SelfTransportationPayment.objects.get(
                                            cheque_no=st_cheque_no
                                        )
                                    )
                                    st_payment_object.add_container(
                                        container=container_object, amount=st_price
                                    )
                                elif st_payment_in == "Utr":
                                    st_payment_object = (
                                        SelfTransportationPayment.objects.get(
                                            utr_no=st_utr_no
                                        )
                                    )
                                    st_payment_object.add_container(
                                        container=container_object, amount=st_price
                                    )

                                GateOutHistory.objects.filter(pk=data["goh_pk"]).update(
                                    st_payment=st_payment_object
                                )
                            else:
                                pass
                        except:
                            pass

                    else:
                        pass
                except:
                    pass
                goh = GateOutHistory.objects.get(pk=data["goh_pk"])
                if not goh.lolo.payment_type == "None":
                    lolo_bill = create_billing_lolo(obj=goh, process="OUT")
                if (
                    "self_transportation_data" in data.keys()
                    and not goh.st.payment_type == "None"
                ):
                    st_bill = create_billing_st(obj=goh, process="OUT")
                lolo_night_charges = apply_lolo_night_charges(obj=goh, process="OUT")

                if "image_url" in gate_out_data.keys():
                    img_url = gate_out_data["image_url"]
                    if img_url:
                        upload_driver_img_to_s3(
                            img_url, goh, container_no, driver_license, "OUT"
                        )

                unlock_mnr_bills(goh, site)

            return Response(
                {"successMsg": "Data Update", "goh_pk": data["goh_pk"]}, status=200
            )
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
