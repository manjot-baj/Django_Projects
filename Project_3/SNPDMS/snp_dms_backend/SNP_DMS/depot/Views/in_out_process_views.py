from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from account.models import AccountUser
from master.models import (
    ContainerType,
    ContainerSize,
    ExportCargoType,
    Location,
    Transporter,
    Site,
)
from depot.lolo_finance_models import PreGateIn, PreGateOut
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from surveyor.models import Surveyor
from master.models_two import Client, ClientAbbreviation, SealNo


from ..functions_two import *
from ..models import *
import datetime
from django.utils import timezone
from billing_invoice.functions import create_billing_lolo, create_billing_st
from depot.functions import (
    apply_lolo_night_charges,
    upload_driver_img_to_s3,
    unlock_mnr_bills,
    change_status_of_truck,
)
from django.db import transaction

from account.permissions import HasAllowedRoles


class GateInProcess(views.APIView):
    """
    the post function will store all IN Process data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
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
                if len(lolo_data["lolo_payment"]) == 0:
                    lolo_payment = None
                else:
                    lolo_payment = lolo_data["lolo_payment"]
                    lolo_cheque_no = lolo_payment["cheque_no"]
                    lolo_utr_no = lolo_payment["utr_no"]
                lolo_payment_in = None
                st_payment_in = None
                self_transportation_status = False
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
                        gate_in_data = data["gate_in_data"]
                        arrived = gate_in_data["arrived"]
                        if len(arrived) == 0:
                            arrived = None

                        if arrived is not None:
                            if (
                                site.lolo_finance
                                and not PreGateIn.objects.filter(
                                    container_no=container_no,
                                    location=location,
                                    site=site,
                                    on_hold=False,
                                    validity_expired=False,
                                    is_gatein_done=False,
                                ).exists()
                                and arrived in ["Factory", "FS RETURN", "CFS/ICD"]
                            ):
                                return Response(
                                    {
                                        "errorMsg": "Only PreGateIn Containers with do_validity are allowed for IN Process."
                                    },
                                    status=200,
                                )
                    except:
                        pass

                    try:
                        Container.objects.get(
                            container_no=container_no, status="IN", location=location
                        )
                        return Response(
                            {"errorMsg": "Container_no Valid but already exist."},
                            status=200,
                        )
                    except:
                        pass
                else:
                    try:

                        gate_in_data = data["gate_in_data"]
                        arrived = gate_in_data["arrived"]
                        if len(arrived) == 0:
                            arrived = None

                        if arrived is not None:
                            if (
                                site.lolo_finance
                                and not PreGateIn.objects.filter(
                                    container_no=container_no,
                                    location=location,
                                    site=site,
                                    on_hold=False,
                                    validity_expired=False,
                                    is_gatein_done=False,
                                ).exists()
                                and arrived in ["Factory", "FS RETURN", "CFS/ICD"]
                            ):
                                return Response(
                                    {
                                        "errorMsg": "Only PreGateIn Containers with do_validity are allowed for IN Process."
                                    },
                                    status=200,
                                )
                    except:
                        pass

                    try:
                        Container.objects.get(
                            container_no=container_no, status="IN", location=location
                        )
                        return Response(
                            {"errorMsg": "Container_no Not Valid but already exist."},
                            status=200,
                        )
                    except:
                        pass

                try:
                    container_object = Container.objects.get(
                        container_no=container_no, location=location, site=site
                    )
                    if container_object.status == "IN":
                        return Response(
                            {"errorMsg": "Container Already In"}, status=200
                        )
                    else:
                        pass
                except:
                    pass

                try:
                    if lolo_payment is not None:
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
                    else:
                        pass
                except:
                    pass
                try:
                    if not len(data["self_transportation_data"]) == 0:
                        self_transportation_status = True
                        self_transportation_data = data["self_transportation_data"]
                        if (
                            len(self_transportation_data["self_transportation_payment"])
                            == 0
                        ):
                            st_payment = None
                        else:
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_cheque_no = st_payment["cheque_no"]
                            st_utr_no = st_payment["utr_no"]

                        try:
                            if st_payment is not None:
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
                            else:
                                pass
                        except:
                            pass
                    else:
                        pass
                except:
                    pass

                # ***************************************** Adding Container *****************************************

                container_data = data["container_data"]

                client_name = container_data["client"]
                if len(client_name) == 0:
                    client = None
                else:
                    client = Client.objects.get(
                        name=client_name, location=location, site=site
                    )

                type_name = container_data["type"]
                if len(type_name) == 0:
                    type_object = ContainerType.objects.get(name="DV")
                else:
                    try:
                        type_object = ContainerType.objects.get(name=type_name)
                    except:
                        type_object = ContainerType.objects.get(name="DV")

                size_name = container_data["size"]
                if len(size_name) == 0:
                    size_object = ContainerSize.objects.get(name="20")
                else:
                    try:
                        size_object = ContainerSize.objects.get(name=size_name)
                    except:
                        size_object = ContainerSize.objects.get(name="20")

                container_no = container_data["container_no"]
                if len(container_no) == 0:
                    return Response(
                        {"errorMsg": "Please provide container no"}, status=200
                    )

                container_no_response = check_digit(container_no=container_no)

                payload = container_data["payload"]
                if len(payload) == 0:
                    payload = None

                gross_wt = container_data["gross_wt"]
                if len(gross_wt) == 0:
                    gross_wt = None

                tare_wt = container_data["tare_wt"]
                if len(tare_wt) == 0:
                    tare_wt = None

                manufacturing_date_str = container_data["manufacturing_date"]
                if len(manufacturing_date_str) == 0:
                    return Response(
                        {"errorMsg": "Please provide manufacturing date"}, status=200
                    )
                else:
                    try:
                        manufacturing_date = datetime.datetime.strptime(
                            manufacturing_date_str, "%Y-%m-%d"
                        ).date()
                    except:
                        manufacturing_date = None

                shipping_line_name = container_data["shipping_line"]
                if len(shipping_line_name) == 0:
                    shipping_line = None
                else:
                    try:
                        shipping_line = list(
                            ClientAbbreviation.objects.filter(
                                client=client, name=shipping_line_name
                            )
                        )[0]
                    except:
                        shipping_line = None

                leased_box = container_data["leased_box"]
                if len(leased_box) == 0:
                    leased_box = False

                do_not_lift = container_data["do_not_lift"]
                if len(do_not_lift) == 0:
                    do_not_lift = False

                do_not_lift_remarks = container_data.get("do_not_lift_remarks", None)
                if do_not_lift_remarks is not None:
                    if len(do_not_lift_remarks) == 0:
                        do_not_lift_remarks = None

                automatic_mnr_status_change = container_data[
                    "automatic_mnr_status_change"
                ]
                if len(automatic_mnr_status_change) == 0:
                    automatic_mnr_status_change = False

                if client.ref_code is None:
                    return Response(
                        {
                            "errorMsg": "Client Reference code is missing, "
                            "Please update client in client master."
                        },
                        status=200,
                    )
                # else:
                #     try:
                #         rent_object = GroundRent.objects.get(client_ref_code=client.ref_code,
                #                                                 location=location, site=site, size=size_object)
                #     except:
                #         return Response({"errorMsg": "Client Ground Rent Details are missing, "
                #                                      "Please enter ground rent details in "
                #                                      "Ground Rent Master for this Client."}, status=200)
                try:
                    container_object = Container.objects.get(
                        container_no=container_no, location=location, site=site
                    )
                    container_object.client = client
                    container_object.type = type_object
                    container_object.size = size_object
                    container_object.payload = payload
                    container_object.gross_wt = gross_wt
                    container_object.tare_wt = tare_wt
                    container_object.manufacturing_date = manufacturing_date
                    container_object.shipping_line = shipping_line
                    container_object.leased_box = leased_box
                    container_object.is_valid = container_no_response
                    container_object.in_do_not_lift_queue = do_not_lift
                    container_object.do_not_lift_remarks = do_not_lift_remarks
                    container_object.queued_recently = do_not_lift
                    container_object.automatic_mnr_status_change = (
                        automatic_mnr_status_change
                    )
                    container_object.status = "IN"
                    container_object.is_available = False
                    container_object.save()
                except:
                    container_object = Container.create(
                        client=client,
                        type_object=type_object,
                        size_object=size_object,
                        container_no=container_no,
                        payload=payload,
                        gross_wt=gross_wt,
                        tare_wt=tare_wt,
                        manufacturing_date=manufacturing_date,
                        shipping_line=shipping_line,
                        leased_box=leased_box,
                        is_valid=container_no_response,
                        in_do_not_lift_queue=do_not_lift,
                        do_not_lift_remarks=do_not_lift_remarks,
                        automatic_mnr_status_change=automatic_mnr_status_change,
                        queued_recently=do_not_lift,
                        location=location,
                        site=site,
                    )
                    # container_object.queued_recently = do_not_lift
                    # container_object.save()
                    # container_object.location = location
                    # container_object.site = site
                    container_object.save()

                # ******************************************* EIR *******************************************************
                eir_data = data["eir_data"]

                done_by = app_user

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

                eir_img = eir_data["eir_img"]
                if len(str(eir_img)) == 0:
                    eir_img = save_default_eir_img()

                eir_amount = eir_data["eir_amount"]
                if (
                    len(eir_amount) == 0
                    or eir_amount.replace(".", "", 1).isnumeric() is False
                ):
                    eir_amount = 0
                else:
                    eir_amount = float(eir_amount)

                repair_amount = eir_data["repair_amount"]
                if (
                    len(repair_amount) == 0
                    or repair_amount.replace(".", "", 1).isnumeric() is False
                ):
                    repair_amount = 0
                else:
                    repair_amount = float(repair_amount)

                eir_object = Eir.create(
                    container=container_object,
                    done_by=done_by,
                    eir_date=eir_date,
                    eir_time=eir_time,
                    offload_date=offload_date,
                    offload_time=offload_time,
                    eir_img=eir_img,
                    eir_amount=eir_amount,
                    repair_amount=repair_amount,
                    entry_type="IN",
                )
                eir_object.save()
                eir_object.save_eir_no(location=location)
                eir_object.upload_eir_img()

                eir_line = eir_data["eir_line"]

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
                        line_object = EirLine.create(
                            eir=eir_object,
                            grap_position=grap_position,
                            damage_code=damage_code,
                            description=description,
                        )
                        line_object.save()

                # *************************************** GateIn ********************************************************

                gate_in_data = data["gate_in_data"]

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

                condition = gate_in_data["condition"]
                if len(condition) == 0:
                    condition = None
                try:
                    grade = gate_in_data["grade"]
                    if len(grade) == 0:
                        grade = None
                except:
                    grade = None

                arrived = gate_in_data["arrived"]
                if len(arrived) == 0:
                    arrived = None

                consignee = gate_in_data["consignee"]
                if len(consignee) == 0:
                    consignee = None

                shipper = gate_in_data["shipper"]
                if len(shipper) == 0:
                    shipper = None

                source = gate_in_data["source"]
                if len(source) == 0:
                    source = None

                from_location_code = gate_in_data["from_location_code"]
                if len(from_location_code) == 0:
                    from_location_code = None

                from_location_name_code = gate_in_data.get(
                    "from_location_name_code", None
                )
                if (
                    from_location_name_code is not None
                    and len(from_location_name_code) == 0
                ):
                    from_location_name_code = None

                from_port_code = gate_in_data["from_port_code"]
                if len(from_port_code) == 0:
                    from_port_code = None

                vessel_name = gate_in_data["vessel_name"]
                if len(vessel_name) == 0:
                    vessel_name = None

                voyage_no = gate_in_data["voyage_no"]
                if len(voyage_no) == 0:
                    voyage_no = None

                do_ref = gate_in_data["do_ref"]
                if len(do_ref) == 0:
                    do_ref = None

                cargo = gate_in_data["cargo"]
                if len(cargo) == 0:
                    cargo = None

                try:
                    export_cargo_type = None
                    if not len(gate_in_data["export_cargo_type"]) == 0:
                        export_cargo_type = ExportCargoType.objects.get(
                            name=gate_in_data["export_cargo_type"]
                        )
                except:
                    export_cargo_type = None

                transporter_name_str = gate_in_data["transporter_name"]
                if len(transporter_name_str) == 0:
                    transporter_name = None
                else:
                    try:
                        transporter_name = Transporter.objects.filter(
                            name=transporter_name_str, location=location, site=site
                        ).first()
                    except:
                        transporter_name = None
                        # transporter_name = Transporter(
                        #     name=transporter_name_str, location=location, site=site
                        # )
                        # transporter_name.save()

                vehicle_no = gate_in_data["vehicle_no"]
                if len(vehicle_no) == 0:
                    vehicle_no = None
                try:
                    bl_no = gate_in_data["bl_no"]
                    if len(bl_no) == 0:
                        bl_no = None
                except:
                    bl_no = None

                driver_name = gate_in_data["driver_name"]
                if len(driver_name) == 0:
                    driver_name = None

                driver_license = gate_in_data["driver_license"]
                if len(driver_license) == 0:
                    driver_license = None

                driver_mobile_no = gate_in_data["driver_mobile_no"]
                if (
                    len(driver_mobile_no) == 0
                    or driver_mobile_no.replace(".", "", 1).isnumeric() is False
                ):
                    driver_mobile_no = None

                carrier_code = gate_in_data["carrier_code"]
                if len(carrier_code) == 0:
                    carrier_code = None

                remarks = gate_in_data["remarks"]
                if len(remarks) == 0:
                    remarks = None

                gate_in_object = GateIn.create(
                    container=container_object,
                    in_date=in_date,
                    in_time=in_time,
                    condition=condition,
                    grade=grade,
                    arrived=arrived,
                    consignee=consignee,
                    shipper=shipper,
                    source=source,
                    from_location_code=from_location_code,
                    from_port_code=from_port_code,
                    vessel_name=vessel_name,
                    voyage_no=voyage_no,
                    do_ref=do_ref,
                    cargo=cargo,
                    export_cargo_type=export_cargo_type,
                    transporter_name=transporter_name,
                    vehicle_no=vehicle_no,
                    bl_no=bl_no,
                    driver_name=driver_name,
                    driver_license=driver_license,
                    driver_mobile_no=driver_mobile_no,
                    carrier_code=carrier_code,
                    location=location,
                    remarks=remarks,
                    from_location_name_code=from_location_name_code,
                )
                gate_in_object.save()
                # gate in time and eir time 15 mins difference
                temp_date_time = datetime.datetime.combine(
                    gate_in_object.in_date, gate_in_object.in_time
                ) - datetime.timedelta(minutes=15)
                temp_date_time = temp_date_time.astimezone(
                    timezone.get_current_timezone()
                )
                eir_object.eir_date = temp_date_time.date()
                eir_object.eir_time = temp_date_time.time()
                eir_object.save()

                gate_in_object.save_gate_pass_no(location=location)
                try:
                    if site.lolo_finance and arrived in [
                        "Factory",
                        "FS RETURN",
                        "CFS/ICD",
                    ]:
                        pregatein_obj = PreGateIn.objects.get(
                            container_no=container_no,
                            location=location,
                            site=site,
                            on_hold=False,
                            validity_expired=False,
                            is_gatein_done=False,
                        )
                        gate_in_object.pregatein_id = pregatein_obj.pk
                        gate_in_object.save()
                        pregatein_obj.is_gatein_done = True
                        pregatein_obj.save()
                except:
                    logging.getLogger("error_log").error(traceback.format_exc())
                    pass

                # *********************************** Stock IN ***********************************************************

                stock_object = ContainerStock.create(
                    gate_in=gate_in_object, container=container_object, grade=grade
                )
                stock_object.save()

                if automatic_mnr_status_change == "False":
                    stock_object.status = "Estimate Pending"
                    stock_object.survey_pending_out_date_time = temp_date_time
                    stock_object.estimate_pending_in_date_time = temp_date_time
                    stock_object.save()

                if condition == "AV":
                    stock_object.status = "Available"
                    stock_object.save()
                    stock_object.make_available()

                # *********************************** Handling/ LOLO *************************************************

                lolo_apply_charges = lolo_data["apply_charges"]
                if len(lolo_apply_charges) == 0:
                    lolo_apply_charges = None

                lolo_customer_name_str = lolo_data["customer_name"]
                if (
                    len(lolo_customer_name_str) == 0
                    or lolo_apply_charges is None
                    or lolo_apply_charges == "Line"
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
                            type=lolo_apply_charges,
                        )
                    except:
                        lolo_customer_name = Client(
                            name=lolo_customer_name_str,
                            location=location,
                            site=site,
                            type=lolo_apply_charges,
                        )
                        lolo_customer_name.save()
                        lolo_customer_name.create_client_code()

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

                lolo_type = lolo_data["lolo_type"]
                if len(lolo_type) == 0:
                    lolo_type = None

                lolo_payment_type = lolo_data["payment_type"]
                if len(lolo_payment_type) == 0:
                    lolo_payment_type = "None"

                lolo_amount = lolo_data["lolo_amount"]
                if len(lolo_amount) == 0 or lolo_amount.isnumeric is False:
                    lolo_amount = 0
                else:
                    lolo_amount = float(lolo_amount)

                lolo_remark = lolo_data["remark"]
                if len(lolo_remark) == 0:
                    lolo_remark = None

                handling_objects = Handling.create(
                    container=container_object,
                    apply_charges=lolo_apply_charges,
                    customer_name=lolo_customer_name,
                    invoice_date=lolo_invoice_date,
                    receipt_date=lolo_receipt_date,
                    lolo_type=lolo_type,
                    payment_type=lolo_payment_type,
                    lolo_amount=lolo_amount,
                    remark=lolo_remark,
                    entry_type="IN",
                )
                handling_objects.save()
                handling_objects.save_invoice_no(location=location)
                handling_objects.save_receipt_no(location=location)

                # night_charges
                is_night_charges_applied = lolo_data.get(
                    "is_night_charges_applied", None
                )
                if is_night_charges_applied is not None and site_str in [
                    "INGHK",
                    "INGHC",
                ]:
                    handling_objects.is_night_charges_applied = is_night_charges_applied
                    handling_objects.save()

                # **************************************** lolo payment *************************************************
                lolo_payment_object = None
                if lolo_payment is not None:
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
                        or lolo_quantity.replace(".", "", 1).isnumeric() is False
                    ):
                        lolo_quantity = 0
                    else:
                        lolo_quantity = int(lolo_quantity)

                    lolo_payment_amount = lolo_payment["amount"]
                    if (
                        len(lolo_payment_amount) == 0
                        or lolo_payment_amount.replace(".", "", 1).isnumeric() is False
                    ):
                        lolo_payment_amount = 0
                    else:
                        lolo_payment_amount = float(lolo_payment_amount)
                    print(lolo_payment_in)
                    if lolo_payment_in == "Cheque":
                        lolo_payment_object = HandlingPayment.objects.get(
                            cheque_no=lolo_cheque_no
                        )
                        lolo_payment_object.add_container(
                            container=container_object, amount=lolo_amount
                        )
                        handling_objects.payment_id = lolo_payment_object.pk
                        handling_objects.save()
                    elif lolo_payment_in == "Utr":
                        lolo_payment_object = HandlingPayment.objects.get(
                            utr_no=lolo_utr_no
                        )
                        lolo_payment_object.add_container(
                            container=container_object, amount=lolo_amount
                        )
                        handling_objects.payment_id = lolo_payment_object.pk
                        handling_objects.save()
                else:
                    pass

                # ************************************ Self Transportation ************************************************
                self_transportation_object = None

                st_payment_object = None

                st_payment_type = None

                st_apply_charges = None

                if self_transportation_status is True:
                    self_transportation_data = data["self_transportation_data"]

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
                        or st_apply_charges == "Line"
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
                                type=st_apply_charges,
                            )
                        except:
                            st_customer_name = Client(
                                name=st_customer_name_str,
                                location=location,
                                site=site,
                                type=st_apply_charges,
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

                    # **************************************** self transportation payment ********************************
                    st_payment_object = None
                    if st_payment is not None:
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
                            st_payment_object = SelfTransportationPayment.objects.get(
                                cheque_no=st_cheque_no
                            )
                            st_payment_object.add_container(
                                container=container_object, amount=st_price
                            )
                            self_transportation_object.payment_id = st_payment_object.pk
                            self_transportation_object.save()
                        elif st_payment_in == "Utr":
                            st_payment_object = SelfTransportationPayment.objects.get(
                                utr_no=st_utr_no
                            )
                            st_payment_object.add_container(
                                container=container_object, amount=st_price
                            )
                            self_transportation_object.payment_id = st_payment_object.pk
                            self_transportation_object.save()
                    else:
                        pass
                else:
                    pass
                in_date_time = datetime.datetime.combine(
                    gate_in_object.in_date, gate_in_object.in_time
                )
                gih = GateInHistory(
                    created_at=datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    ),
                    date=in_date_time.astimezone(timezone.get_current_timezone()),
                    container=container_object,
                    eir=eir_object,
                    gate_in=gate_in_object,
                    lolo=handling_objects,
                    lolo_payment=lolo_payment_object,
                    st=self_transportation_object,
                    st_payment=st_payment_object,
                )
                gih.save()
                container_in_out_record = ContainerInOutRecord(
                    container=container_object, in_data=gih, out_data=None
                )
                container_in_out_record.save()

                entry_count = GateInHistory.objects.filter(
                    container=container_object
                ).count()
                container_object.in_entry_count = entry_count
                container_object.save()
                eir_object.is_verified = True
                eir_object.save()
                gate_in_object.is_verified = True
                gate_in_object.save()
                handling_objects.is_verified = True
                handling_objects.save()
                if lolo_payment_object is not None:
                    lolo_payment_object.is_verified = True
                    lolo_payment_object.save()
                if self_transportation_object is not None:
                    self_transportation_object.is_verified = True
                    self_transportation_object.save()
                if st_payment_object is not None:
                    st_payment_object.is_verified = True
                    st_payment_object.save()

                if not lolo_payment_type == "None":
                    lolo_bill = create_billing_lolo(obj=gih, process="IN")
                if (
                    "self_transportation_data" in data.keys()
                    and not st_payment_type == "None"
                ):
                    st_bill = create_billing_st(obj=gih, process="IN")

                lolo_night_charges = apply_lolo_night_charges(obj=gih, process="IN")
                if Surveyor.objects.filter(
                    container_no=container_no,
                    location=location,
                    site=site,
                    is_new_container=True,
                ).exists():
                    stock_object.is_survey_import_available = True
                    stock_object.save(update_fields=["is_survey_import_available"])

                if "image_url" in gate_in_data.keys():
                    img_url = gate_in_data["image_url"]
                    if img_url:
                        upload_driver_img_to_s3(
                            img_url, gih, container_no, driver_license, "IN"
                        )

                if gate_in_object.arrived == "Port/Vessel" and site.en_block_movement:
                    job_order_no = gate_in_object.bl_no
                    vessel_name = gate_in_object.vessel_name
                    voyage_no = gate_in_object.voyage_no
                    if job_order_no == "" or vessel_name == "" or voyage_no == "":
                        raise ValidationError(
                            "Missing required fields for EnBlock Movement i.e Bl No, Vessel Name and Voyage No"
                        )

                    if EnBlockMovement.objects.filter(
                        line=gate_in_object.container.client.ref_code,
                        job_order_no=job_order_no,
                        vessel_no=vessel_name.strip(),
                        voyage_no=voyage_no.strip(),
                        location=gate_in_object.container.location,
                        site=gate_in_object.container.site,
                    ).exists():
                        en_block = EnBlockMovement.objects.get(
                            line=gate_in_object.container.client.ref_code,
                            job_order_no=job_order_no,
                            vessel_no=vessel_name.strip(),
                            voyage_no=voyage_no.strip(),
                            location=gate_in_object.container.location,
                            site=gate_in_object.container.site,
                        )
                        if en_block.pendency < 1:
                            raise ValidationError(
                                "Not enough stock for this Bl No. i.e pendency is zero"
                            )
                        en_block.pendency = en_block.pendency - 1
                        en_block.gate_ins = en_block.gate_ins + 1
                        en_block.save(update_fields=["pendency", "gate_ins"])
                if site.en_block_movement_v2:
                    en_block_pregatein_qs = EnBlockPreGateIn.objects.filter(
                        container_no=container_no,
                        en_block__location=location,
                        en_block__site=site,
                        is_processed=False,
                        is_discarded=False,
                    )
                    if en_block_pregatein_qs.exists():

                        en_block_pregatein_obj = en_block_pregatein_qs.first()
                        if en_block_pregatein_obj.en_block.pendency < 1:
                            raise ValidationError(
                                "Not enough stock for this Bl No. i.e pendency is zero"
                            )
                        en_block_pregatein_obj.en_block.pendency = (
                            en_block_pregatein_obj.en_block.pendency - 1
                        )
                        en_block_pregatein_obj.en_block.gate_ins = (
                            en_block_pregatein_obj.en_block.gate_ins + 1
                        )
                        en_block_pregatein_obj.en_block.save(
                            update_fields=["pendency", "gate_ins"]
                        )
                        en_block_pregatein_obj.is_processed = True
                        en_block_pregatein_obj.save(update_fields=["is_processed"])

                if site.truck_tracking:
                    change_status_of_truck(
                        container_no, transporter_name, location, site, vehicle_no, "IN"
                    )

            return Response({"successMsg": "Data Saved", "gih_pk": gih.pk}, status=200)

        except ValidationError as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GateOutProcess(views.APIView):
    """
    the post function will store all OUT Process data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
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
                if len(lolo_data["lolo_payment"]) == 0:
                    lolo_payment = None
                else:
                    lolo_payment = lolo_data["lolo_payment"]
                    lolo_cheque_no = lolo_payment["cheque_no"]
                    lolo_utr_no = lolo_payment["utr_no"]
                lolo_payment_in = None
                st_payment_in = None
                self_transportation_status = False
                gate_out_data = data["gate_out_data"]
                condition = gate_out_data["condition"]
                container_data = data["container_data"]
                container_no = container_data["container_no"]

                try:
                    container_object = Container.objects.get(
                        container_no=container_no, location=location, site=site
                    )
                    if container_object.status == "OUT":
                        return Response(
                            {"errorMsg": "Container Already OUT"}, status=200
                        )
                    else:
                        pass
                except:
                    pass

                try:
                    departed = gate_out_data["departed"]
                    if len(departed) == 0:
                        departed = None

                    if departed is not None:
                        if (
                            site.lolo_finance
                            and not PreGateOut.objects.filter(
                                stock__container__container_no=container_no,
                                location=location,
                                site=site,
                                on_hold=False,
                                validity_expired=False,
                                is_gateout_done=False,
                            ).exists()
                            and departed in ["Factory", "FS RETURN", "CFS/ICD"]
                        ):
                            return Response(
                                {
                                    "errorMsg": "Only PreGateOut Containers with do_validity are allowed for OUT Process."
                                },
                                status=200,
                            )
                except:
                    pass

                try:
                    gih_object = GateInHistory.objects.get(pk=data["gih_pk"])
                    stock_object = ContainerStock.objects.get(
                        container__container_no=container_no,
                        gate_in=gih_object.gate_in,
                        container_status="IN",
                    )

                    seal_no = gate_out_data["seal_no"]
                    if len(seal_no) == 0:
                        seal_no = None

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
                            seal_no_object = SealNo.objects.get(number=seal_no)
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
                    else:
                        if seal_no is not None:
                            seal_no_object.out_date = (
                                datetime.datetime.now().astimezone(
                                    timezone.get_current_timezone()
                                )
                            )
                            seal_no_object.is_lock = True
                            seal_no_object.save()

                    # if not len(seal_no) == 0:
                    #     gih_object = GateInHistory.objects.get(pk=data["gih_pk"])
                    #     stock_object = ContainerStock.objects.get(
                    #         container__container_no=container_no, gate_in=gih_object.gate_in
                    #     )
                    #     if not stock_object.seal_no == seal_no:
                    #         if ContainerStock.objects.filter(seal_no=seal_no).exists():
                    #             return Response(
                    #                 {"errorMsg": "Given Seal no is in Use"}, status=200
                    #             )
                except:
                    pass

                try:
                    if len(condition) == 0 or not condition == "OK":
                        return Response(
                            {"errorMsg": "Container Condition is not OK"}, status=200
                        )
                    else:
                        pass
                except:
                    pass

                try:
                    if lolo_payment is not None:
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
                    else:
                        pass
                except:
                    pass
                try:
                    if not len(data["self_transportation_data"]) == 0:
                        self_transportation_status = True
                        self_transportation_data = data["self_transportation_data"]
                        if (
                            len(self_transportation_data["self_transportation_payment"])
                            == 0
                        ):
                            st_payment = None
                        else:
                            st_payment = self_transportation_data[
                                "self_transportation_payment"
                            ]
                            st_cheque_no = st_payment["cheque_no"]
                            st_utr_no = st_payment["utr_no"]

                        try:
                            if st_payment is not None:
                                if SelfTransportationPayment.objects.filter(
                                    cheque_no=st_cheque_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            cheque_no=st_cheque_no
                                        ).first()
                                    )
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
                                    else:
                                        st_payment_in = "Cheque"
                                elif SelfTransportationPayment.objects.filter(
                                    utr_no=st_utr_no
                                ).exists():
                                    st_check_object = (
                                        SelfTransportationPayment.objects.filter(
                                            utr_no=st_utr_no
                                        ).first()
                                    )
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
                                        st_payment_in = "Utr"
                                else:
                                    pass
                            else:
                                pass
                        except:
                            pass
                    else:
                        pass
                except:
                    pass
                # ***************************************** Adding Container *****************************************

                container_data = data["container_data"]

                client_name = container_data["client"]
                if len(client_name) == 0:
                    client = None
                else:
                    try:
                        client = Client.objects.get(
                            name=client_name, location=location, site=site
                        )
                    except:
                        client = None

                type_name = container_data["type"]
                if len(type_name) == 0:
                    type_object = None
                else:
                    try:
                        type_object = ContainerType.objects.get(name=type_name)
                    except:
                        type_object = None

                size_name = container_data["size"]
                if len(size_name) == 0:
                    size_object = None
                else:
                    try:
                        size_object = ContainerSize.objects.get(name=size_name)
                    except:
                        size_object = None

                container_no = container_data["container_no"]
                if len(container_no) == 0:
                    return Response(
                        {"errorMsg": "Please provide container no"}, status=200
                    )

                payload = container_data["payload"]
                if len(payload) == 0:
                    payload = None

                gross_wt = container_data["gross_wt"]
                if len(gross_wt) == 0:
                    gross_wt = None

                tare_wt = container_data["tare_wt"]
                if len(tare_wt) == 0:
                    tare_wt = None

                manufacturing_date_str = container_data["manufacturing_date"]
                if len(manufacturing_date_str) == 0:
                    return Response(
                        {"errorMsg": "Please provide manufacturing date"}, status=200
                    )
                else:
                    try:
                        manufacturing_date = datetime.datetime.strptime(
                            manufacturing_date_str, "%d/%m/%Y"
                        ).date()
                    except:
                        manufacturing_date = None

                shipping_line_name = container_data["shipping_line"]
                if len(shipping_line_name) == 0:
                    shipping_line = None
                else:
                    try:
                        shipping_line = list(
                            ClientAbbreviation.objects.filter(
                                client=client, name=shipping_line_name
                            )
                        )[0]
                    except:
                        shipping_line = None

                leased_box = container_data["leased_box"]
                if len(leased_box) == 0:
                    leased_box = False

                container_object = Container.objects.get(
                    container_no=container_no, location=location, site=site
                )
                container_object.status = "OUT"
                container_object.save()

                # ******************************************* EIR *******************************************************
                eir_data = data["eir_data"]

                done_by = app_user

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

                eir_img = eir_data["eir_img"]
                if len(str(eir_img)) == 0:
                    eir_img = save_default_eir_img()

                eir_amount = eir_data["eir_amount"]
                if (
                    len(eir_amount) == 0
                    or eir_amount.replace(".", "", 1).isnumeric() is False
                ):
                    eir_amount = 0
                else:
                    eir_amount = float(eir_amount)

                repair_amount = eir_data["repair_amount"]
                if (
                    len(repair_amount) == 0
                    or repair_amount.replace(".", "", 1).isnumeric() is False
                ):
                    repair_amount = 0
                else:
                    repair_amount = float(repair_amount)

                eir_object = Eir.create(
                    container=container_object,
                    done_by=done_by,
                    eir_date=eir_date,
                    eir_time=eir_time,
                    offload_date=offload_date,
                    offload_time=offload_time,
                    eir_img=eir_img,
                    eir_amount=eir_amount,
                    repair_amount=repair_amount,
                    entry_type="OUT",
                )
                eir_object.save()
                eir_object.save_eir_no(location=location)
                eir_object.upload_eir_img()

                eir_line = eir_data["eir_line"]

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
                        line_object = EirLine.create(
                            eir=eir_object,
                            grap_position=grap_position,
                            damage_code=damage_code,
                            description=description,
                        )
                        line_object.save()

                # *************************************** GateOut ********************************************************

                gate_out_data = data["gate_out_data"]

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

                condition = gate_out_data["condition"]
                if len(condition) == 0:
                    condition = None
                try:
                    grade = gate_out_data["grade"]
                    if len(grade) == 0:
                        grade = None
                except:
                    grade = None

                departed = gate_out_data["departed"]
                if len(departed) == 0:
                    departed = None

                destination = gate_out_data["destination"]
                if len(destination) == 0:
                    destination = None

                consignee = gate_out_data["consignee"]
                if len(consignee) == 0:
                    consignee = None

                shipper = gate_out_data["shipper"]
                if len(shipper) == 0:
                    shipper = None

                delivery = gate_out_data["delivery"]
                if len(delivery) == 0:
                    delivery = None

                to_location_code = gate_out_data["to_location_code"]
                if len(to_location_code) == 0:
                    to_location_code = None

                to_depot_code = gate_out_data["to_depot_code"]
                if len(to_depot_code) == 0:
                    to_depot_code = None

                road_rail_to_location_code = gate_out_data["road_rail_to_location_code"]
                if len(road_rail_to_location_code) == 0:
                    road_rail_to_location_code = None

                to_port_code = gate_out_data["to_port_code"]
                if len(to_port_code) == 0:
                    to_port_code = None

                vessel_name = gate_out_data["vessel_name"]
                if len(vessel_name) == 0:
                    vessel_name = None

                voyage_no = gate_out_data["voyage_no"]
                if len(voyage_no) == 0:
                    voyage_no = None

                ro_ref = gate_out_data["ro_ref"]
                if len(ro_ref) == 0:
                    ro_ref = None

                export_cargo = gate_out_data["export_cargo"]
                if len(export_cargo) == 0:
                    export_cargo = None

                transporter_name_str = gate_out_data["transporter_name"]
                if len(transporter_name_str) == 0:
                    transporter_name = None
                else:
                    try:
                        transporter_name = Transporter.objects.filter(
                            name=transporter_name_str, location=location, site=site
                        ).first()
                    except:
                        transporter_name = None
                        # transporter_name = Transporter(
                        #     name=transporter_name_str, location=location, site=site
                        # )
                        # transporter_name.save()

                vehicle_no = gate_out_data["vehicle_no"]
                if len(vehicle_no) == 0:
                    vehicle_no = None

                driver_name = gate_out_data["driver_name"]
                if len(driver_name) == 0:
                    driver_name = None

                driver_license = gate_out_data["driver_license"]
                if len(driver_license) == 0:
                    driver_license = None

                driver_mobile_no = gate_out_data["driver_mobile_no"]
                if (
                    len(driver_mobile_no) == 0
                    or driver_mobile_no.replace(".", "", 1).isnumeric() is False
                ):
                    driver_mobile_no = None

                carrier_code = gate_out_data["carrier_code"]
                if len(carrier_code) == 0:
                    carrier_code = None

                port_of_loading = gate_out_data["port_of_loading"]
                if len(port_of_loading) == 0:
                    port_of_loading = None

                port_of_discharge = gate_out_data["port_of_discharge"]
                if len(port_of_discharge) == 0:
                    port_of_discharge = None

                booking_no = gate_out_data["booking_no"]
                if len(booking_no) == 0:
                    booking_no = None

                booking_date_str = gate_out_data["booking_date"]
                if len(booking_date_str) == 0:
                    booking_date = None
                else:
                    booking_date = datetime.datetime.strptime(
                        booking_date_str, "%d/%m/%Y"
                    ).date()

                booking_party = gate_out_data["booking_party"]
                if len(booking_party) == 0:
                    booking_party = None

                seal_no = gate_out_data["seal_no"]
                if len(seal_no) == 0:
                    seal_no = None

                remarks = gate_out_data["remarks"]
                if len(remarks) == 0:
                    remarks = None

                gate_out_object = GateOut.create(
                    container=container_object,
                    out_date=out_date,
                    out_time=out_time,
                    condition=condition,
                    grade=grade,
                    departed=departed,
                    destination=destination,
                    consignee=consignee,
                    shipper=shipper,
                    delivery=delivery,
                    to_location_code=to_location_code,
                    to_depot_code=to_depot_code,
                    road_rail_to_location_code=road_rail_to_location_code,
                    to_port_code=to_port_code,
                    vessel_name=vessel_name,
                    voyage_no=voyage_no,
                    ro_ref=ro_ref,
                    export_cargo=export_cargo,
                    transporter_name=transporter_name,
                    vehicle_no=vehicle_no,
                    driver_name=driver_name,
                    driver_license=driver_license,
                    driver_mobile_no=driver_mobile_no,
                    carrier_code=carrier_code,
                    location=location,
                    port_of_loading=port_of_loading,
                    port_of_discharge=port_of_discharge,
                    booking_no=booking_no,
                    booking_date=booking_date,
                    booking_party=booking_party,
                    seal_no=seal_no,
                    remarks=remarks,
                )
                gate_out_object.save()

                # gate out time and eir time 15 mins difference
                temp_date_time = datetime.datetime.combine(
                    gate_out_object.out_date, gate_out_object.out_time
                ) - datetime.timedelta(minutes=15)
                temp_date_time = temp_date_time.astimezone(
                    timezone.get_current_timezone()
                )
                eir_object.eir_date = temp_date_time.date()
                eir_object.eir_time = temp_date_time.time()
                eir_object.save()

                gate_out_object.save_gate_pass_no(location=location)

                try:
                    if site.lolo_finance and departed in [
                        "Factory",
                        "FS RETURN",
                        "CFS/ICD",
                    ]:
                        pregateout_obj = PreGateOut.objects.get(
                            stock__container__container_no=container_no,
                            location=location,
                            site=site,
                            on_hold=False,
                            validity_expired=False,
                            is_gateout_done=False,
                        )
                        gate_out_object.pregateout_id = pregateout_obj.pk
                        gate_out_object.save()
                        pregateout_obj.is_gateout_done = True
                        pregateout_obj.save()
                except:
                    logging.getLogger("error_log").error(traceback.format_exc())
                    pass

                # ************************** Stock and Allotment(Booking No) Update ***************************************

                gih_object = GateInHistory.objects.get(pk=data["gih_pk"])
                stock_object = ContainerStock.objects.get(
                    container__container_no=container_no,
                    gate_in=gih_object.gate_in,
                    container_status="IN",
                )
                stock_object.gate_out = gate_out_object
                stock_object.save()
                stock_object.make_out_of_stock()
                if stock_object.status == "Alloted":
                    stock_object.allotment_out_date_time = (
                        datetime.datetime.now().astimezone(
                            timezone.get_current_timezone()
                        )
                    )
                    stock_object.save()

                out_date_time = datetime.datetime.combine(
                    gate_out_object.out_date, gate_out_object.out_time
                )
                if seal_no is not None:
                    seal_object = SealNo.objects.get(number=stock_object.seal_no)
                    seal_object.in_use_date = out_date_time
                    seal_object.out_date = out_date_time
                    seal_object.is_lock = True
                    seal_object.save()

                # *********************************** Handling/ LOLO *************************************************

                lolo_apply_charges = lolo_data["apply_charges"]
                if len(lolo_apply_charges) == 0:
                    lolo_apply_charges = None

                lolo_customer_name_str = lolo_data["customer_name"]
                if (
                    len(lolo_customer_name_str) == 0
                    or lolo_apply_charges is None
                    or lolo_apply_charges == "Line"
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
                            type=lolo_apply_charges,
                        )
                    except:
                        lolo_customer_name = Client(
                            name=lolo_customer_name_str,
                            location=location,
                            site=site,
                            type=lolo_apply_charges,
                        )
                        lolo_customer_name.save()
                        lolo_customer_name.create_client_code()

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

                lolo_type = lolo_data["lolo_type"]
                if len(lolo_type) == 0:
                    lolo_type = None

                lolo_payment_type = lolo_data["payment_type"]
                if len(lolo_payment_type) == 0:
                    lolo_payment_type = "None"

                lolo_amount = lolo_data["lolo_amount"]
                if len(lolo_amount) == 0 or lolo_amount.isnumeric is False:
                    lolo_amount = 0
                else:
                    lolo_amount = float(lolo_amount)

                lolo_remark = lolo_data["remark"]
                if len(lolo_remark) == 0:
                    lolo_remark = None

                handling_objects = Handling.create(
                    container=container_object,
                    apply_charges=lolo_apply_charges,
                    customer_name=lolo_customer_name,
                    invoice_date=lolo_invoice_date,
                    receipt_date=lolo_receipt_date,
                    lolo_type=lolo_type,
                    payment_type=lolo_payment_type,
                    lolo_amount=lolo_amount,
                    remark=lolo_remark,
                    entry_type="OUT",
                )
                handling_objects.save()
                handling_objects.save_invoice_no(location=location)
                handling_objects.save_out_receipt_no(location=location)

                # night_charges
                is_night_charges_applied = lolo_data.get(
                    "is_night_charges_applied", None
                )
                if is_night_charges_applied is not None and site_str in [
                    "INGHK",
                    "INGHC",
                ]:
                    handling_objects.is_night_charges_applied = is_night_charges_applied
                    handling_objects.save()

                # **************************************** lolo payment *************************************************

                lolo_payment_object = None
                if lolo_payment is not None:
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
                        or lolo_quantity.replace(".", "", 1).isnumeric() is False
                    ):
                        lolo_quantity = 0
                    else:
                        lolo_quantity = int(lolo_quantity)

                    lolo_payment_amount = lolo_payment["amount"]
                    if (
                        len(lolo_payment_amount) == 0
                        or lolo_payment_amount.replace(".", "", 1).isnumeric() is False
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
                        handling_objects.payment_id = lolo_payment_object.pk
                        handling_objects.save()
                    elif lolo_payment_in == "Utr":
                        lolo_payment_object = HandlingPayment.objects.get(
                            utr_no=lolo_utr_no
                        )
                        lolo_payment_object.add_container(
                            container=container_object, amount=lolo_amount
                        )
                        handling_objects.payment_id = lolo_payment_object.pk
                        handling_objects.save()
                else:
                    pass

                # ************************************ Self Transportation ************************************************
                self_transportation_object = None

                st_payment_object = None

                st_payment_type = None

                st_apply_charges = None

                if self_transportation_status is True:
                    self_transportation_data = data["self_transportation_data"]

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
                        or st_apply_charges == "Line"
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
                                type=st_apply_charges,
                            )
                        except:
                            st_customer_name = Client(
                                name=st_customer_name_str,
                                location=location,
                                site=site,
                                type=st_apply_charges,
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
                        entry_type="OUT",
                    )
                    self_transportation_object.save()
                    self_transportation_object.save_invoice_no(location=location)
                    self_transportation_object.save_receipt_no(location=location)

                    # **************************************** self transportation payment ********************************
                    st_payment_object = None
                    if st_payment is not None:
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
                            st_payment_object = SelfTransportationPayment.objects.get(
                                cheque_no=st_cheque_no
                            )
                            st_payment_object.add_container(
                                container=container_object, amount=st_price
                            )
                            self_transportation_object.payment_id = st_payment_object.pk
                            self_transportation_object.save()
                        elif st_payment_in == "Utr":
                            st_payment_object = SelfTransportationPayment.objects.get(
                                utr_no=st_utr_no
                            )
                            st_payment_object.add_container(
                                container=container_object, amount=st_price
                            )
                            self_transportation_object.payment_id = st_payment_object.pk
                            self_transportation_object.save()
                    else:
                        pass
                else:
                    pass
                out_date_time = datetime.datetime.combine(
                    gate_out_object.out_date, gate_out_object.out_time
                )
                goh = GateOutHistory(
                    created_at=datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    ),
                    date=out_date_time.astimezone(timezone.get_current_timezone()),
                    container=container_object,
                    eir=eir_object,
                    gate_out=gate_out_object,
                    lolo=handling_objects,
                    lolo_payment=lolo_payment_object,
                    st=self_transportation_object,
                    st_payment=st_payment_object,
                )
                goh.save()
                gih_object = GateInHistory.objects.get(pk=data["gih_pk"])
                container_in_out_record = ContainerInOutRecord.objects.get(
                    container=container_object, in_data=gih_object
                )
                container_in_out_record.out_data = goh
                container_in_out_record.save()

                entry_count = GateOutHistory.objects.filter(
                    container=container_object
                ).count()
                container_object.out_entry_count = entry_count
                container_object.save()
                eir_object.is_verified = True
                eir_object.save()
                gate_out_object.is_verified = True
                gate_out_object.save()
                handling_objects.is_verified = True
                handling_objects.save()
                if lolo_payment_object is not None:
                    lolo_payment_object.is_verified = True
                    lolo_payment_object.save()
                if self_transportation_object is not None:
                    self_transportation_object.is_verified = True
                    self_transportation_object.save()
                if st_payment_object is not None:
                    st_payment_object.is_verified = True
                    st_payment_object.save()

                if not lolo_payment_type == "None":
                    lolo_bill = create_billing_lolo(obj=goh, process="OUT")
                if (
                    "self_transportation_data" in data.keys()
                    and not st_payment_type == "None"
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
                if site.truck_tracking:
                    change_status_of_truck(
                        container_no,
                        transporter_name,
                        location,
                        site,
                        vehicle_no,
                        "OUT",
                        booking_no,
                        shipping_line_name,
                    )

            return Response({"successMsg": "Data Saved", "goh_pk": goh.pk}, status=200)

        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)
