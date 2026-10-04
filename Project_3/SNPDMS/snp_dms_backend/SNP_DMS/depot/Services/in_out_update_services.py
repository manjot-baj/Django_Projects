from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import (
    ContainerType,
    ContainerSize,
    ExportCargoType,
    Location,
    Transporter,
    Site,
)
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from depot.lolo_finance_models import PreGateIn
from master.models_two import Client, ClientAbbreviation, SealNo
from ..functions_two import *
from ..models import *
import datetime
from django.utils import timezone
from billing_invoice.models import CustomerBill
from billing_invoice.functions import create_billing_lolo, create_billing_st
from depot.functions import (
    apply_lolo_night_charges,
    upload_driver_img_to_s3,
    unlock_mnr_bills,
)
from django.db import transaction
from common.functions import delete_file
import uuid
import base64
from account.permissions import HasAllowedRoles
from rest_framework import status


class GateUpdateService:
    @staticmethod
    def get_user_and_location(request):
        user = request.user
        app_user = AccountUser.objects.get(username=user.username)
        try:
            location = Location.objects.get(name=request.data.get("location"))
            site = Site.objects.get(name=request.data.get("site"))
        except:
            location = app_user.location
            site = app_user.site
        return app_user, location, site

    @staticmethod
    def validate_container_no(container_no, location, site, existing_container):
        if not container_no:
            raise ValidationError("Please Enter Container_no")
        if not existing_container.container_no == container_no:
            if len(container_no) != 11 or not check_char_digit(container_no):
                raise ValidationError(
                    "Invalid Entry, Please Enter Container_no having first 4 uppercase alphabets and rest 7 digits"
                )
            validation = check_digit(container_no=container_no)
            if (
                validation
                and Container.objects.filter(
                    container_no=container_no, status="IN", location=location
                ).exists()
            ):
                raise ValidationError("Container_no Valid but already exist.")
            if (
                not validation
                and Container.objects.filter(
                    container_no=container_no, status="IN", location=location
                ).exists()
            ):
                raise ValidationError("Container_no Not Valid but already exist.")
            if Container.objects.filter(
                container_no=container_no, location=location, site=site
            ).exists():
                raise ValidationError(
                    "Provided ContainerNo Already Exist in Current Site"
                )
        return (
            check_digit(container_no=container_no)
            if container_no != existing_container.container_no
            else None
        )

    @staticmethod
    def validate_manufacturing_date(
        container_no,
        manufacturing_date_str,
        location,
        site,
        app_user,
        existing_container,
        date_format="%Y-%m-%d",
    ):
        if not manufacturing_date_str:
            raise ValidationError("Please provide manufacturing date")
        try:
            manufacturing_date = datetime.datetime.strptime(
                manufacturing_date_str, date_format
            ).date()
        except:
            raise ValidationError("Please provide Valid manufacturing date")
        if existing_container.manufacturing_date != manufacturing_date:
            ManufacturingDateLog.objects.create(
                container_no=container_no,
                previous_manufacturing_date=existing_container.manufacturing_date,
                current_manufacturing_date=manufacturing_date,
                location=location,
                site=site,
                changed_by=app_user,
            )
        return manufacturing_date

    @staticmethod
    def validate_payment(payment_model, cheque_no, utr_no, payment_type):
        if not cheque_no and not utr_no and len(cheque_no) == 0 and len(utr_no) == 0:
            return None
        try:
            payment_obj = (
                payment_model.objects.get(cheque_no=cheque_no)
                if cheque_no
                else payment_model.objects.get(utr_no=utr_no)
            )
            if payment_obj.remaining == 0 or payment_obj.amount == 0:
                raise ValidationError(
                    f"No Remaining Quantity of Container Left on {payment_type.lower()} {'cheque no' if cheque_no else 'utr no'}"
                )
            return "Cheque" if cheque_no else "Utr"
        except payment_model.DoesNotExist:
            return None

    @staticmethod
    def get_gate_data(data, container_no, date_str, location, site, process_type="IN"):
        try:
            main_data = {}
            container = Container.objects.get(
                container_no=container_no, location=location, site=site
            )
            req_date = datetime.datetime.strptime(date_str, "%d/%m/%Y").date()
            history_model = GateInHistory if process_type == "IN" else GateOutHistory
            history_object = None
            for obj in history_model.objects.filter(container=container):
                if (
                    obj.date.astimezone(timezone.get_current_timezone()).date()
                    == req_date
                ):
                    history_object = obj

            if not history_object:
                raise Exception(f"{process_type} History not found")

            container_obj = history_object.container.get_container()
            main_data["container_data"] = container_obj

            eir_obj = history_object.eir.get_eir()
            eir_obj["eir_line"] = [
                line.get_eir_line()
                for line in EirLine.objects.filter(eir=history_object.eir)
            ]
            main_data["eir_data"] = eir_obj

            lolo_obj = history_object.lolo.get_handling()
            if history_object.lolo_payment is not None:
                lolo_obj["lolo_payment"] = (
                    history_object.lolo_payment.get_payment_details()
                )
            else:
                lolo_obj["lolo_payment"] = ""
            main_data["lolo_data"] = lolo_obj

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

            if history_model == GateInHistory:
                gate_in_obj = history_object.gate_in.get_gate_in()
                main_data["gate_in_data"] = gate_in_obj
                main_data["gih_pk"] = history_object.pk
            else:
                gate_out_obj = history_object.gate_out.get_gate_out()
                main_data["gate_out_data"] = gate_out_obj
                main_data["goh_pk"] = history_object.pk

            return main_data
        except Exception as e:
            raise ValidationError(f"Invalid credentials {e}")

    @staticmethod
    def update_container(
        container_data, location, site, validation, client_name, process_type="IN"
    ):
        container = Container.objects.get(pk=container_data["pk"])
        updates = {}

        if container_data.get("client"):
            client = (
                Client.objects.get(
                    name=container_data["client"], location=location, site=site
                )
                if container_data["client"]
                else None
            )
            updates["client"] = client

        if container_data.get("type"):
            updates["type"] = ContainerType.objects.get(
                name=container_data["type"] or "DV"
            )

        if container_data.get("size"):
            updates["size"] = ContainerSize.objects.get(
                name=container_data["size"] or "20"
            )

        if (
            container_data.get("container_no")
            and validation is not None
            and not (
                site.lolo_finance
                and container_data.get("arrived") in ["Factory", "FS RETURN", "CFS/ICD"]
            )
        ):
            updates["container_no"] = container_data["container_no"]
            updates["is_valid"] = validation

        for field in ["payload", "gross_wt", "tare_wt"]:
            if container_data.get(field):
                updates[field] = container_data[field] or None

        if container_data.get("manufacturing_date"):
            date_format = "%d/%m/%Y" if process_type == "OUT" else "%Y-%m-%d"
            updates["manufacturing_date"] = datetime.datetime.strptime(
                container_data["manufacturing_date"], date_format
            ).date()

        if container_data.get("shipping_line"):
            updates["shipping_line"] = (
                ClientAbbreviation.objects.filter(
                    client=Client.objects.get(
                        name=client_name, location=location, site=site
                    ),
                    name=container_data["shipping_line"],
                ).first()
                if container_data["shipping_line"]
                else None
            )

        for field in ["leased_box", "automatic_mnr_status_change"]:
            if container_data.get(field):
                updates[field] = container_data[field] == "True"

        if container_data.get("do_not_lift") == "True":
            updates["in_do_not_lift_queue"] = True
        else:
            updates["in_do_not_lift_queue"] = False

        if container_data.get("do_not_lift_remarks"):
            updates["do_not_lift_remarks"] = (
                container_data["do_not_lift_remarks"] or None
            )

        if updates:
            Container.objects.filter(pk=container_data["pk"]).update(**updates)
            if "do_not_lift" in updates:
                c_obj = Container.objects.get(pk=container_data["pk"])
                c_obj.in_do_not_lift_queue = updates["do_not_lift"]
                c_obj.queued_recently = (
                    updates["do_not_lift"] and not c_obj.in_do_not_lift_queue
                )
                c_obj.save()

    @staticmethod
    def update_eir(eir_data):
        eir = Eir.objects.get(pk=eir_data["pk"])
        updates = {}

        for field, format_str, default in [
            (
                "eir_date",
                "%Y-%m-%d",
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date(),
            ),
            (
                "offload_date",
                "%Y-%m-%d",
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date(),
            ),
        ]:
            if eir_data.get(field):
                updates[field] = (
                    datetime.datetime.strptime(eir_data[field], format_str).date()
                    if eir_data[field]
                    else default
                )

        for field, format_str, default in [
            (
                "eir_time",
                "%H:%M",
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .time(),
            ),
            (
                "offload_time",
                "%H:%M",
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .time(),
            ),
        ]:
            if eir_data.get(field):
                updates[field] = (
                    datetime.datetime.strptime(eir_data[field], format_str).time()
                    if eir_data[field]
                    else default
                )

        for field in ["eir_amount", "repair_amount"]:
            if eir_data.get(field):
                updates[field] = (
                    float(eir_data[field])
                    if eir_data[field]
                    and eir_data[field].replace(".", "", 1).isnumeric()
                    else 0
                )

        if updates:
            Eir.objects.filter(pk=eir_data["pk"]).update(**updates)

        if eir_data.get("eir_line"):
            EirLine.objects.filter(eir=eir).delete()
            for line in eir_data["eir_line"]:
                EirLine.create(
                    eir=eir,
                    grap_position=line["grap_position"] or None,
                    damage_code=line["damage_code"] or None,
                    description=line["description"] or None,
                ).save()

        if eir_data.get("eir_img"):
            eir.eir_img = eir_data["eir_img"] or save_default_eir_img()
            eir.save()
            eir.upload_eir_img()

    @staticmethod
    def update_gate_in(gate_in_data, eir_data, gih_pk):
        gate_in = GateIn.objects.get(pk=gate_in_data["pk"])
        updates = {}

        in_date = (
            datetime.datetime.strptime(
                gate_in_data.get("in_date", ""), "%Y-%m-%d"
            ).date()
            if gate_in_data.get("in_date")
            else datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
        )
        in_time = (
            datetime.datetime.strptime(gate_in_data.get("in_time", ""), "%H:%M").time()
            if gate_in_data.get("in_time")
            else datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .time()
        )
        updates["in_date"] = in_date
        updates["in_time"] = in_time

        temp_date_time = datetime.datetime.combine(
            in_date, in_time
        ) - datetime.timedelta(minutes=15)
        temp_date_time = temp_date_time.astimezone(timezone.get_current_timezone())
        Eir.objects.filter(pk=eir_data["pk"]).update(
            eir_date=temp_date_time.date(), eir_time=temp_date_time.time()
        )

        gih = GateInHistory.objects.get(pk=gih_pk)
        in_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
            timezone.get_current_timezone()
        )
        if gih.date.astimezone(timezone.get_current_timezone()) != in_date_time:
            gih.is_date_updated = True
            gih.save()
        GateInHistory.objects.filter(pk=gih_pk).update(date=in_date_time)

        for field in [
            "condition",
            "grade",
            "arrived",
            "origin",
            "consignee",
            "shipper",
            "vehicle_no",
            "driver_name",
            "driver_license",
            "carrier_code",
            "remarks",
            "from_location_code",
            "from_location_name_code",
            "surveyor",
        ]:
            if gate_in_data.get(field):
                updates[field] = gate_in_data[field] or None

        if gate_in_data.get("transporter_name"):
            transporter = Transporter.objects.filter(
                name=gate_in_data["transporter_name"],
                location=gate_in.container.location,
                site=gate_in.container.site,
            ).first()
            updates["transporter_name"] = transporter

        if gate_in_data.get("driver_mobile_no"):
            updates["driver_mobile_no"] = (
                gate_in_data["driver_mobile_no"]
                if gate_in_data["driver_mobile_no"]
                and gate_in_data["driver_mobile_no"].replace(".", "", 1).isnumeric()
                else None
            )

        updates["location"] = gate_in.location
        GateIn.objects.filter(pk=gate_in_data["pk"]).update(**updates)

        if updates["condition"] == "AV":
            stock_object = ContainerStock.objects.get(gate_in__pk=gate_in_data["pk"])
            stock_object.status = "Available"
            stock_object.stage = "Available"
            stock_object.save()
            stock_object.make_available()

    @staticmethod
    def update_gate_out(gate_out_data, eir_data, goh_pk):
        gate_out = GateOut.objects.get(pk=gate_out_data["pk"])
        updates = {}

        out_date = (
            datetime.datetime.strptime(
                gate_out_data.get("out_date", ""), "%Y-%m-%d"
            ).date()
            if gate_out_data.get("out_date")
            else datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
        )
        out_time = (
            datetime.datetime.strptime(
                gate_out_data.get("out_time", ""), "%H:%M"
            ).time()
            if gate_out_data.get("out_time")
            else datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .time()
        )
        updates["out_date"] = out_date
        updates["out_time"] = out_time

        temp_date_time = datetime.datetime.combine(
            out_date, out_time
        ) - datetime.timedelta(minutes=15)
        temp_date_time = temp_date_time.astimezone(timezone.get_current_timezone())
        Eir.objects.filter(pk=eir_data["pk"]).update(
            eir_date=temp_date_time.date(), eir_time=temp_date_time.time()
        )

        goh = GateOutHistory.objects.get(pk=goh_pk)
        out_date_time = datetime.datetime.combine(out_date, out_time).astimezone(
            timezone.get_current_timezone()
        )
        if goh.date.astimezone(timezone.get_current_timezone()) != out_date_time:
            goh.is_date_updated = True
            goh.save()
        GateOutHistory.objects.filter(pk=goh_pk).update(date=out_date_time)

        for field in [
            "condition",
            "grade",
            "departed",
            "destination",
            "consignee",
            "shipper",
            "delivery",
            "to_location_code",
            "to_depot_code",
            "road_rail_to_location_code",
            "to_port_code",
            "vessel_name",
            "voyage_no",
            "ro_ref",
            "export_cargo",
            "vehicle_no",
            "driver_name",
            "driver_license",
            "carrier_code",
            "port_of_loading",
            "port_of_discharge",
            "booking_no",
            "booking_party",
            "remarks",
            "surveyor",
        ]:
            if gate_out_data.get(field):
                updates[field] = gate_out_data[field] or None

        if gate_out_data.get("booking_date"):
            updates["booking_date"] = (
                datetime.datetime.strptime(
                    gate_out_data["booking_date"], "%Y-%m-%d"
                ).date()
                if gate_out_data["booking_date"]
                else None
            )

        if gate_out_data.get("transporter_name"):
            transporter = Transporter.objects.filter(
                name=gate_out_data["transporter_name"],
                location=gate_out.container.location,
                site=gate_out.container.site,
            ).first()
            updates["transporter_name"] = transporter

        if gate_out_data.get("driver_mobile_no"):
            updates["driver_mobile_no"] = (
                gate_out_data["driver_mobile_no"]
                if gate_out_data["driver_mobile_no"]
                and gate_out_data["driver_mobile_no"].replace(".", "", 1).isnumeric()
                else None
            )

        if gate_out_data.get("seal_no"):
            seal_no = gate_out_data["seal_no"] or None
            stock = ContainerStock.objects.get(
                container=goh.container, gate_out=goh.gate_out
            )
            if stock.seal_no != seal_no:
                if (
                    stock.seal_no
                    and SealNo.objects.filter(number=stock.seal_no).exists()
                ):
                    old_seal = SealNo.objects.get(number=stock.seal_no)
                    old_seal.is_available = True
                    old_seal.in_use = False
                    old_seal.container_no = None
                    old_seal.in_use_date = None
                    old_seal.out_date = None
                    old_seal.is_lock = False
                    old_seal.save()

                if seal_no:
                    seal_obj = SealNo.objects.get(number=seal_no)
                    seal_obj.is_available = False
                    seal_obj.in_use = True
                    seal_obj.container_no = goh.container.container_no
                    seal_obj.in_use_date = out_date_time
                    seal_obj.out_date = out_date_time
                    seal_obj.is_lock = True
                    seal_obj.save()

                stock.seal_no = seal_no
                stock.save()
            updates["seal_no"] = seal_no

        updates["location"] = gate_out.location
        GateOut.objects.filter(pk=gate_out_data["pk"]).update(**updates)

    @staticmethod
    def update_lolo(
        lolo_data,
        container_data,
        location,
        site,
        client_name,
        history_pk,
        process_type="IN",
    ):
        lolo = Handling.objects.get(pk=lolo_data["pk"])
        updates = {}

        if lolo_data.get("apply_charges"):
            updates["apply_charges"] = lolo_data["apply_charges"] or None

        if (
            lolo_data.get("customer_name")
            and lolo_data["customer_name"] != client_name
            and not Client.objects.filter(
                name=lolo_data["customer_name"],
                location=location,
                site=site,
                type="Line",
            ).exists()
        ):
            customer = Client.objects.filter(
                name=lolo_data["customer_name"],
                location=location,
                site=site,
                type="Party",
            ).first()
            # if not customer:
            #     customer = Client(
            #         name=lolo_data["customer_name"],
            #         location=location,
            #         site=site,
            #         type="Party",
            #     )
            #     customer.save()
            #     customer.create_client_code()
            updates["customer_name"] = customer

        for field, format_str in [
            ("invoice_date", "%Y-%m-%d"),
            ("receipt_date", "%Y-%m-%d"),
        ]:
            if lolo_data.get(field):
                updates[field] = (
                    datetime.datetime.strptime(lolo_data[field], format_str).date()
                    if lolo_data[field]
                    else datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )

        for field in ["lolo_type", "remark"]:
            if lolo_data.get(field):
                updates[field] = lolo_data[field] or None

        if lolo_data.get("is_night_charges_applied") is not None:
            updates["is_night_charges_applied"] = lolo_data["is_night_charges_applied"]

        if lolo_data.get("payment_type"):
            updates["payment_type"] = lolo_data["payment_type"] or "None"

        if lolo_data.get("lolo_amount"):
            lolo_amount = (
                float(lolo_data["lolo_amount"])
                if lolo_data["lolo_amount"]
                and lolo_data["lolo_amount"].replace(".", "", 1).isnumeric()
                else 0
            )
            lolo.lolo_amount = lolo_amount
            lolo.net_amount = lolo_amount
            lolo.taxable_amount = lolo_amount
            lolo.gross_amount = lolo_amount
            lolo.save()
            if lolo.cgst and lolo.sgst:
                lolo.cgst_amount = lolo_amount * float(lolo.cgst)
                lolo.sgst_amount = lolo_amount * float(lolo.sgst)
                lolo.gross_amount = lolo_amount + lolo.cgst_amount + lolo.sgst_amount
                lolo.save()
            elif lolo.igst:
                lolo.igst_amount = lolo_amount * float(lolo.igst)
                lolo.gross_amount = lolo_amount + lolo.igst_amount
                lolo.save()

        if updates:
            Handling.objects.filter(pk=lolo_data["pk"]).update(**updates)

        if lolo_data.get("lolo_payment"):
            GateUpdateService.update_lolo_payment(
                lolo_data["lolo_payment"],
                lolo_data,
                container_data,
                history_pk,
                process_type,
            )

    @staticmethod
    def update_lolo_payment(
        lolo_payment, lolo_data, container_data, history_pk, process_type="IN"
    ):
        history_model = GateInHistory if process_type == "IN" else GateOutHistory
        new_entry = not history_model.objects.get(pk=history_pk).lolo_payment
        container = Container.objects.get(pk=container_data["pk"])

        if new_entry:
            lolo_cheque_no = lolo_payment.get("cheque_no") or None
            lolo_utr_no = lolo_payment.get("utr_no") or None
            payment_in = GateUpdateService.validate_payment(
                HandlingPayment, lolo_cheque_no, lolo_utr_no, "lolo"
            )
            lolo_quantity = (
                int(lolo_payment["quantity"])
                if lolo_payment.get("quantity")
                and lolo_payment["quantity"].replace(".", "", 1).isnumeric()
                else 0
            )
            lolo_amount = (
                float(lolo_data["lolo_amount"])
                if lolo_data.get("lolo_amount")
                and lolo_data["lolo_amount"].replace(".", "", 1).isnumeric()
                else 0
            )

            if payment_in == "Cheque":
                payment_obj = HandlingPayment.objects.get(cheque_no=lolo_cheque_no)
            elif payment_in == "Utr":
                payment_obj = HandlingPayment.objects.get(utr_no=lolo_utr_no)
            else:
                pass

            if lolo_quantity > 0:
                payment_obj.add_container(container=container, amount=lolo_amount)
            history_model.objects.filter(pk=history_pk).update(lolo_payment=payment_obj)
            # Set verification flags
            payment_obj.is_verified = True
            payment_obj.save()
        else:
            pass

    @staticmethod
    def update_self_transportation(
        self_transportation_data,
        container_data,
        location,
        site,
        client_name,
        history_pk,
        process_type="IN",
    ):
        history_model = GateInHistory if process_type == "IN" else GateOutHistory
        new_entry = not history_model.objects.get(pk=history_pk).st
        container = Container.objects.get(pk=container_data["pk"])

        if new_entry:
            transporter_name = self_transportation_data.get("transporter", "")
            transporter = None
            if not len(transporter_name) == 0:
                transporter, created = Transporter.objects.get_or_create(
                    name=transporter_name, location=location, site=site
                )

            customer = None
            if (
                self_transportation_data.get("customer_name")
                and self_transportation_data["customer_name"] != client_name
                and not Client.objects.filter(
                    name=self_transportation_data["customer_name"],
                    location=location,
                    site=site,
                    type="Line",
                ).exists()
            ):
                customer = Client.objects.filter(
                    name=self_transportation_data["customer_name"],
                    location=location,
                    site=site,
                    type="Party",
                ).first()

                # Client(
                #     name=self_transportation_data["customer_name"],
                #     location=location,
                #     site=site,
                #     type="Party",
                # )
                # if not customer.pk:
                #     customer.save()
                #     customer.create_client_code()

            st_obj = SelfTransportation.create(
                container=container,
                transporter=transporter,
                apply_charges=self_transportation_data.get("apply_charges") or None,
                customer_name=customer,
                origin=self_transportation_data.get("origin") or None,
                receipt_date=(
                    datetime.datetime.strptime(
                        self_transportation_data["receipt_date"], "%Y-%m-%d"
                    ).date()
                    if self_transportation_data.get("receipt_date")
                    else datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                ),
                invoice_date=(
                    datetime.datetime.strptime(
                        self_transportation_data["invoice_date"], "%Y-%m-%d"
                    ).date()
                    if self_transportation_data.get("invoice_date")
                    else datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                ),
                payment_type=self_transportation_data.get("payment_type") or "None",
                price=(
                    float(self_transportation_data["price"])
                    if self_transportation_data.get("price")
                    and self_transportation_data["price"]
                    .replace(".", "", 1)
                    .isnumeric()
                    else 0
                ),
                remark=self_transportation_data.get("remark") or None,
                entry_type=process_type,
            )
            st_obj.save()
            st_obj.save_invoice_no(location=location)
            st_obj.save_receipt_no(location=location)
            history_model.objects.filter(pk=history_pk).update(st=st_obj)
            st_obj.is_verified = True
            st_obj.save()
            if self_transportation_data.get("self_transportation_payment"):
                GateUpdateService.update_self_transportation_payment(
                    self_transportation_data["self_transportation_payment"],
                    self_transportation_data,
                    container,
                    history_pk,
                    new_entry=True,
                    process_type=process_type,
                )
        else:
            st = SelfTransportation.objects.get(pk=self_transportation_data["pk"])
            updates = {}

            if self_transportation_data.get("transporter"):
                transporter_name = self_transportation_data.get("transporter", "")
                transporter = None
                if not len(transporter_name) == 0:
                    transporter, created = Transporter.objects.get_or_create(
                        name=transporter_name, location=location, site=site
                    )
                updates["transporter"] = transporter

            if self_transportation_data.get("apply_charges"):
                updates["apply_charges"] = (
                    self_transportation_data["apply_charges"] or None
                )

            if (
                self_transportation_data.get("customer_name")
                and self_transportation_data["customer_name"] != client_name
                and not Client.objects.filter(
                    name=self_transportation_data["customer_name"],
                    location=location,
                    site=site,
                    type="Line",
                ).exists()
            ):
                customer = Client.objects.filter(
                    name=self_transportation_data["customer_name"],
                    location=location,
                    site=site,
                    type="Party",
                ).first()

                # Client(
                #     name=self_transportation_data["customer_name"],
                #     location=location,
                #     site=site,
                #     type="Party",
                # )
                # if not customer.pk:
                #     customer.save()
                #     customer.create_client_code()
                updates["customer_name"] = customer

            for field in ["origin", "remark"]:
                if self_transportation_data.get(field):
                    updates[field] = self_transportation_data[field] or None

            for field, format_str in [
                ("receipt_date", "%Y-%m-%d"),
                ("invoice_date", "%Y-%m-%d"),
            ]:
                if self_transportation_data.get(field):
                    updates[field] = (
                        datetime.datetime.strptime(
                            self_transportation_data[field], format_str
                        ).date()
                        if self_transportation_data[field]
                        else datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            if self_transportation_data.get("payment_type"):
                updates["payment_type"] = (
                    self_transportation_data["payment_type"] or "None"
                )

            if self_transportation_data.get("price"):
                price = (
                    float(self_transportation_data["price"])
                    if self_transportation_data["price"]
                    and self_transportation_data["price"]
                    .replace(".", "", 1)
                    .isnumeric()
                    else 0
                )
                st.price = price
                st.net_amount = price
                st.taxable_amount = price
                st.gross_amount = price
                st.save()
                if st.cgst and st.sgst:
                    st.cgst_amount = price * float(st.cgst)
                    st.sgst_amount = price * float(st.sgst)
                    st.gross_amount = price + st.cgst_amount + st.sgst_amount
                    st.save()
                elif st.igst:
                    st.igst_amount = price * float(st.igst)
                    st.gross_amount = price + st.igst_amount
                    st.save()

            if updates:
                SelfTransportation.objects.filter(
                    pk=self_transportation_data["pk"]
                ).update(**updates)

            if self_transportation_data.get("self_transportation_payment"):
                GateUpdateService.update_self_transportation_payment(
                    self_transportation_data["self_transportation_payment"],
                    self_transportation_data,
                    container,
                    history_pk,
                    new_entry=False,
                    process_type=process_type,
                )

    @staticmethod
    def update_self_transportation_payment(
        st_payment, st_data, container, history_pk, new_entry, process_type="IN"
    ):
        history_model = GateInHistory if process_type == "IN" else GateOutHistory
        if new_entry:
            st_cheque_no = st_payment.get("cheque_no") or None
            st_utr_no = st_payment.get("utr_no") or None
            payment_in = GateUpdateService.validate_payment(
                SelfTransportationPayment, st_cheque_no, st_utr_no, "st"
            )

            st_quantity = (
                int(st_payment["quantity"])
                if st_payment.get("quantity")
                and st_payment["quantity"].replace(".", "", 1).isnumeric()
                else 0
            )

            st_price = (
                float(st_data["price"])
                if st_data.get("price")
                and st_data["price"].replace(".", "", 1).isnumeric()
                else 0
            )

            if payment_in == "Cheque":
                payment_obj = SelfTransportationPayment.objects.get(
                    cheque_no=st_cheque_no
                )
            elif payment_in == "Utr":
                payment_obj = SelfTransportationPayment.objects.get(utr_no=st_utr_no)
            else:
                pass

            if st_quantity > 0:
                payment_obj.add_container(container=container, amount=st_price)
            history_model.objects.filter(pk=history_pk).update(st_payment=payment_obj)
            payment_obj.is_verified = True
            payment_obj.save()
        else:
            pass

    @staticmethod
    def handle_en_block_movement(gih_object):
        """Handle EnBlock movement updates."""
        location = gih_object.container.location
        site = gih_object.container.site
        if gih_object.gate_in.arrived == "Port/Vessel" and site.en_block_movement:
            gate_in = gih_object.gate_in
            job_order_no = gate_in.bl_no or ""
            vessel_name = gate_in.vessel_name.strip() if gate_in.vessel_name else ""
            voyage_no = gate_in.voyage_no.strip() if gate_in.voyage_no else ""
            ref_code = gih_object.container.ref_code
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

            if not all([job_order_no, vessel_name, voyage_no]):
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

            previous_en_block.pendency -= 1
            previous_en_block.gate_ins += 1
            previous_en_block.save(update_fields=["pendency", "gate_ins"])

            en_block.pendency -= 1
            en_block.gate_ins += 1
            en_block.save(update_fields=["pendency", "gate_ins"])
