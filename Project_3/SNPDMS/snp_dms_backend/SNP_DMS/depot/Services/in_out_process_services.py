import datetime
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from account.models import AccountUser
from master.models import (
    Location,
    Site,
    ContainerType,
    ContainerSize,
    Transporter,
)
from master.models_two import Client, ClientAbbreviation
from depot.lolo_finance_models import PreGateIn, PreGateOut
from surveyor.models import Surveyor
from depot.models import (
    Container,
    Eir,
    EirLine,
    GateIn,
    GateOut,
    ContainerStock,
    Handling,
    HandlingPayment,
    SelfTransportation,
    SelfTransportationPayment,
    SealNo,
    GateInHistory,
    GateOutHistory,
    ContainerInOutRecord,
    EnBlockMovement,
    EnBlockPreGateIn,
    ExportCargoType,
    save_default_eir_img,
)
from depot.functions_two import check_char_digit, check_digit
from billing_invoice.functions import create_billing_lolo, create_billing_st
from depot.functions import (
    apply_lolo_night_charges,
    upload_driver_img_to_s3,
    change_status_of_truck,
    unlock_mnr_bills,
)


class InOutProcessService:

    @staticmethod
    def validate_request_data(data):
        """Validate that request data is not empty."""
        if not data:
            raise ValidationError("Please provide Data")
        else:
            return data

    @staticmethod
    def validate_location_and_site(request_data):
        """Validate location and site"""
        location = None
        site = None
        if Location.objects.filter(name=request_data["location"]).exists():
            location = Location.objects.filter(name=request_data["location"]).first()
        else:
            raise ValidationError("Please Provide Location")

        if Site.objects.filter(name=request_data["site"]).exists():
            site = Site.objects.filter(name=request_data["site"]).first()
        else:
            raise ValidationError("Please Provide Site")
        return location, site, request_data

    @staticmethod
    def validate_eir_amounts(eir_amount, repair_amount):
        """Validate EIR and repair amounts are numeric."""
        validated_eir_amount = 0
        validated_repair_amount = 0

        if eir_amount and eir_amount.replace(".", "", 1).isnumeric():
            validated_eir_amount = float(eir_amount)

        if repair_amount and repair_amount.replace(".", "", 1).isnumeric():
            validated_repair_amount = float(repair_amount)

        return validated_eir_amount, validated_repair_amount

    @staticmethod
    def validate_date_field(date_str, format_str="%Y-%m-%d"):
        """Validate date field and return parsed date or current date."""
        if not date_str:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )
        try:
            return datetime.datetime.strptime(date_str, format_str).date()
        except:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )

    @staticmethod
    def validate_time_field(time_str, format_str="%H:%M"):
        """Validate time field and return parsed time or current time."""
        if not time_str:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .time()
            )
        try:
            return datetime.datetime.strptime(time_str, format_str).time()
        except:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .time()
            )

    @staticmethod
    def validate_numeric_field(value, is_float=True):
        """Validate if a field is numeric and return converted value or default."""
        if not value or not value.replace(".", "", 1).isnumeric():
            return 0
        return float(value) if is_float else int(value)

    @staticmethod
    def validate_container_data(container_data, location, site):
        """Validate container_data section of the payload."""

        # Container number validation
        container_no = container_data.get("container_no", "")
        if not container_no:
            raise ValidationError("Please provide container no")

        elif len(container_no) != 11:
            raise ValidationError(
                "Invalid Entry, Please Enter Container_no having first 4 uppercase alphabets and rest 7 digits"
            )
        elif not check_char_digit(container_no):
            raise ValidationError(
                "Invalid Entry, Please Enter Container_no having first 4 uppercase alphabets and rest 7 digits"
            )

        # Manufacturing date validation
        manufacturing_date_str = container_data.get("manufacturing_date", "")
        manufacturing_date = None
        if not manufacturing_date_str:
            raise ValidationError("Please provide manufacturing date")
        else:
            try:
                manufacturing_date = datetime.datetime.strptime(
                    manufacturing_date_str, "%Y-%m-%d"
                ).date()
            except ValueError:
                raise ValidationError("Please provide Valid manufacturing date")

        # Client validation
        client_name = container_data.get("client", "")
        client = None
        if not client_name:
            raise ValidationError("Please provide Client")
        else:
            if not Client.objects.filter(
                name=client_name, location=location, site=site
            ).exists():
                raise ValidationError("Provided Client Not Found")

            client = Client.objects.filter(
                name=client_name, location=location, site=site
            ).first()
            if not client.ref_code:
                raise ValidationError(
                    "Client Reference code is missing, Please update client in client master."
                )

        shipping_line_name = container_data.get("shipping_line")
        shipping_line = None
        if ClientAbbreviation.objects.filter(
            client=client, name=shipping_line_name
        ).exists():
            shipping_line = ClientAbbreviation.objects.filter(
                client=client, name=shipping_line_name
            ).first()
        else:
            shipping_line = ClientAbbreviation(client=client, name=shipping_line_name)
            shipping_line.save()

        # Container type validation
        type_name = container_data.get("type", "")
        if not type_name:
            raise ValidationError("Please Provide Container Type")
        if not ContainerType.objects.filter(name=type_name).exists():
            raise ValidationError("Provided container type does not exists")
        type_object = ContainerType.objects.filter(name=type_name).first()

        # Container size validation
        size_name = container_data.get("size", "")
        if not size_name:
            raise ValidationError("Please Provide Container Size")
        if not ContainerSize.objects.filter(name=size_name).exists():
            raise ValidationError("Provided container size does not exists")
        size_object = ContainerSize.objects.filter(name=size_name).first()

        # Container existence validation
        if (
            container_no
            and Container.objects.filter(
                container_no=container_no, status="IN", location=location
            ).exists()
        ):
            raise ValidationError(
                f"Container_no {'Valid' if check_digit(container_no) else 'Not Valid'} but already exist."
            )

        # Validate numeric fields
        gross_wt = container_data.get("gross_wt", "0")
        tare_wt = container_data.get("tare_wt", "0")
        payload = container_data.get("payload", "0")

        return {
            "client": client,
            "type_object": type_object,
            "size_object": size_object,
            "container_no": container_no,
            "manufacturing_date": manufacturing_date,
            "gross_wt": gross_wt if gross_wt else None,
            "tare_wt": tare_wt if tare_wt else None,
            "payload": payload if payload else None,
            "shipping_line": shipping_line,
            "leased_box": container_data.get("leased_box", False),
            "do_not_lift": container_data.get("do_not_lift", False),
            "do_not_lift_remarks": container_data.get("do_not_lift_remarks"),
            "automatic_mnr_status_change": container_data.get(
                "automatic_mnr_status_change", False
            ),
            "is_valid": check_digit(container_no),
        }

    @staticmethod
    def validate_eir_data(eir_data):
        """Validate eir_data section of the payload."""

        # Date and time validation
        eir_date = InOutProcessService.validate_date_field(eir_data.get("eir_date", ""))
        eir_time = InOutProcessService.validate_time_field(eir_data.get("eir_time", ""))
        offload_date = InOutProcessService.validate_date_field(
            eir_data.get("offload_date", "")
        )
        offload_time = InOutProcessService.validate_time_field(
            eir_data.get("offload_time", "")
        )

        # Amount validation
        eir_amount, repair_amount = InOutProcessService.validate_eir_amounts(
            eir_data.get("eir_amount", ""), eir_data.get("repair_amount", "")
        )

        # EIR line validation
        eir_line_data = []
        for line in eir_data.get("eir_line", []):
            grap_position = line.get("grap_position") or None
            damage_code = line.get("damage_code") or None
            description = line.get("description") or None
            if grap_position:  # Only include lines with grap_position
                eir_line_data.append(
                    {
                        "grap_position": grap_position,
                        "damage_code": damage_code,
                        "description": description,
                    }
                )

        return {
            "eir_date": eir_date,
            "eir_time": eir_time,
            "offload_date": offload_date,
            "offload_time": offload_time,
            "eir_img": save_default_eir_img(),
            "eir_amount": eir_amount,
            "repair_amount": repair_amount,
            "eir_line": eir_line_data,
        }

    @staticmethod
    def validate_gate_in_data(gate_in_data, location, site, container_no, client):
        """Validate gate_in_data section of the payload."""

        # Date and time validation
        in_date = InOutProcessService.validate_date_field(
            gate_in_data.get("in_date", "")
        )
        in_time = InOutProcessService.validate_time_field(
            gate_in_data.get("in_time", "")
        )

        # PreGateIn validation for specific arrival types
        arrived = gate_in_data.get("arrived", "")
        if (
            arrived
            and site.lolo_finance
            and arrived in ["Factory", "FS RETURN", "CFS/ICD"]
        ):
            if not PreGateIn.objects.filter(
                container_no=container_no,
                location=location,
                site=site,
                on_hold=False,
                validity_expired=False,
                is_gatein_done=False,
            ).exists():
                raise ValidationError(
                    "Only PreGateIn Containers with do_validity are allowed for IN Process."
                )

        # EnBlock movement validation
        if arrived == "Port/Vessel" and site.en_block_movement:
            job_order_no = gate_in_data.get("bl_no", "")
            vessel_name = gate_in_data.get("vessel_name", "")
            voyage_no = gate_in_data.get("voyage_no", "")
            if not all([job_order_no, vessel_name, voyage_no]):
                raise ValidationError(
                    "Missing required fields for EnBlock Movement i.e Bl No, Vessel Name and Voyage No"
                )
            else:
                if EnBlockMovement.objects.filter(
                    line=client.ref_code,
                    job_order_no=job_order_no,
                    vessel_no=vessel_name.strip(),
                    voyage_no=voyage_no.strip(),
                    location=location,
                    site=site,
                ).exists():
                    en_block = EnBlockMovement.objects.get(
                        line=client.ref_code,
                        job_order_no=job_order_no,
                        vessel_no=vessel_name.strip(),
                        voyage_no=voyage_no.strip(),
                        location=location,
                        site=site,
                    )
                    if en_block.pendency < 1:
                        raise ValidationError(
                            "Not enough stock for this Bl No. i.e pendency is zero"
                        )

        # EnBlock pregatein validation
        if EnBlockPreGateIn.objects.filter(
            container_no=container_no,
            en_block__location=location,
            en_block__site=site,
            is_processed=False,
        ).exists():
            en_block_pregatein_obj = EnBlockPreGateIn.objects.filter(
                container_no=container_no,
                en_block__location=location,
                en_block__site=site,
                is_processed=False,
            ).first()
            if en_block_pregatein_obj.en_block.pendency < 1:
                raise ValidationError(
                    "Not enough stock for this Bl No. i.e pendency is zero"
                )

        # Transporter validation
        transporter_name_str = gate_in_data.get("transporter_name", "")
        if not transporter_name_str:
            raise ValidationError("Please provide Transporter")

        transporter, created = Transporter.objects.get_or_create(
            name=transporter_name_str, location=location, site=site
        )
        export_cargo_type, created = ExportCargoType.objects.get_or_create(
            name=gate_in_data.get("export_cargo_type")
        )

        return {
            "in_date": in_date,
            "in_time": in_time,
            "condition": gate_in_data.get("condition"),
            "grade": gate_in_data.get("grade"),
            "arrived": arrived,
            "consignee": gate_in_data.get("consignee"),
            "shipper": gate_in_data.get("shipper"),
            "source": gate_in_data.get("source"),
            "from_location_code": gate_in_data.get("from_location_code"),
            "from_location_name_code": gate_in_data.get("from_location_name_code"),
            "from_port_code": gate_in_data.get("from_port_code"),
            "vessel_name": gate_in_data.get("vessel_name"),
            "voyage_no": gate_in_data.get("voyage_no"),
            "do_ref": gate_in_data.get("do_ref"),
            "cargo": gate_in_data.get("cargo"),
            "export_cargo_type": export_cargo_type,
            "transporter_name": transporter,
            "vehicle_no": gate_in_data.get("vehicle_no"),
            "bl_no": gate_in_data.get("bl_no"),
            "driver_name": gate_in_data.get("driver_name"),
            "driver_license": gate_in_data.get("driver_license"),
            # "driver_mobile_no": InOutProcessService.validate_numeric_field(
            #     gate_in_data.get("driver_mobile_no", ""), is_float=False
            # ),
            "driver_mobile_no": (
                None
                if not gate_in_data.get("driver_mobile_no", "")
                or not gate_in_data.get("driver_mobile_no", "")
                .replace(".", "", 1)
                .isnumeric()
                else int(gate_in_data.get("driver_mobile_no", ""))
            ),
            "carrier_code": gate_in_data.get("carrier_code"),
            "remarks": gate_in_data.get("remarks"),
            "image_url": gate_in_data.get("image_url"),
            "surveyor": gate_in_data.get("surveyor"),
        }

    @staticmethod
    def validate_lolo_data(lolo_data, location, site, client_name):
        """Validate lolo_data section of the payload."""

        # Customer validation
        lolo_customer_name = None
        lolo_apply_charges = lolo_data.get("apply_charges")
        lolo_customer_name_str = lolo_data.get("customer_name", "")
        if (
            lolo_customer_name_str
            and lolo_apply_charges
            and lolo_apply_charges != "Line"
            and lolo_customer_name_str != client_name
            and not Client.objects.filter(
                name=lolo_customer_name_str,
                location=location,
                site=site,
                type="Line",
            ).exists()
        ):
            lolo_customer_name = Client.objects.filter(
                name=lolo_customer_name_str,
                location=location,
                site=site,
                type=lolo_apply_charges,
            ).first()

        # Date validation
        invoice_date = InOutProcessService.validate_date_field(
            lolo_data.get("invoice_date", "")
        )
        receipt_date = InOutProcessService.validate_date_field(
            lolo_data.get("receipt_date", "")
        )

        # Amount validation
        lolo_amount = InOutProcessService.validate_numeric_field(
            lolo_data.get("lolo_amount", "")
        )

        # Payment validation
        lolo_payment = lolo_data.get("lolo_payment", {})
        lolo_payment_data = None
        if lolo_payment:
            lolo_cheque_no, lolo_utr_no = InOutProcessService.validate_payment(
                payment_data=lolo_payment, payment_for="lolo"
            )
            lolo_payment_data = {
                "cheque_no": lolo_cheque_no,
                "utr_no": lolo_utr_no,
                "date": InOutProcessService.validate_date_field(
                    lolo_payment.get("date", "")
                ),
                "bank_name": lolo_payment.get("bank_name") or None,
                "account_name": lolo_payment.get("account_name") or None,
                "account_no": lolo_payment.get("account_no") or None,
                "quantity": InOutProcessService.validate_numeric_field(
                    lolo_payment.get("quantity", ""), is_float=False
                ),
                "amount": InOutProcessService.validate_numeric_field(
                    lolo_payment.get("amount", "")
                ),
            }

        return {
            "apply_charges": lolo_apply_charges,
            "customer_name": lolo_customer_name,
            "invoice_date": invoice_date,
            "receipt_date": receipt_date,
            "lolo_type": lolo_data.get("lolo_type") or None,
            "payment_type": lolo_data.get("payment_type", "None"),
            "lolo_amount": lolo_amount,
            "remark": lolo_data.get("remark") or None,
            "is_night_charges_applied": lolo_data.get("is_night_charges_applied"),
            "lolo_payment": lolo_payment_data,
        }

    @staticmethod
    def validate_payment(payment_data, payment_for):
        """Validate payment details."""
        payment_model = (
            HandlingPayment if payment_for == "lolo" else SelfTransportationPayment
        )

        cheque_no = payment_data.get("cheque_no", None)
        utr_no = payment_data.get("utr_no", None)

        if not cheque_no and not utr_no and len(cheque_no) == 0 and len(utr_no) == 0:
            cheque_no = None
            utr_no = None

        if (
            cheque_no
            and not len(cheque_no) == 0
            and payment_model.objects.filter(cheque_no=cheque_no).exists()
        ):
            utr_no = None
            payment_obj = payment_model.objects.get(cheque_no=cheque_no)
            if payment_obj.remaining == 0 or payment_obj.amount == 0:
                raise ValidationError(
                    f"No Remaining Quantity of Container Left on {payment_for} cheque no"
                )

        if (
            utr_no
            and not len(utr_no) == 0
            and payment_model.objects.filter(utr_no=utr_no).exists()
        ):
            cheque_no = None
            payment_obj = payment_model.objects.get(utr_no=utr_no)
            if payment_obj.remaining == 0 or payment_obj.amount == 0:
                raise ValidationError(
                    f"No Remaining Quantity of Container Left on {payment_for} utr no"
                )

        return cheque_no, utr_no

    @staticmethod
    def validate_self_transportation_data(
        self_transportation_data, location, site, client_name
    ):
        """Validate self_transportation_data section of the payload."""

        if not self_transportation_data:
            return {"validated_data": None}

        # Transporter validation
        transporter_name = self_transportation_data.get("transporter", "")
        transporter = None
        if not len(transporter_name) == 0:
            transporter, created = Transporter.objects.get_or_create(
                name=transporter_name, location=location, site=site
            )
        # Customer validation
        st_customer_name = None
        st_apply_charges = self_transportation_data.get("apply_charges")
        st_customer_name_str = self_transportation_data.get("customer_name", "")
        if (
            st_customer_name_str
            and st_apply_charges
            and st_apply_charges != "Line"
            and st_customer_name_str != client_name
            and not Client.objects.filter(
                name=st_customer_name_str,
                location=location,
                site=site,
                type="Line",
            ).exists()
        ):
            st_customer_name = Client.objects.filter(
                name=st_customer_name_str,
                location=location,
                site=site,
                type=st_apply_charges,
            ).first

        # Date validation
        invoice_date = InOutProcessService.validate_date_field(
            self_transportation_data.get("invoice_date", "")
        )
        receipt_date = InOutProcessService.validate_date_field(
            self_transportation_data.get("receipt_date", "")
        )

        # Amount validation
        price = InOutProcessService.validate_numeric_field(
            self_transportation_data.get("price", "")
        )

        # Payment validation
        st_payment = self_transportation_data.get("self_transportation_payment", {})
        st_payment_data = None
        if st_payment:
            st_cheque_no, st_utr_no = InOutProcessService.validate_payment(
                payment_data=st_payment, payment_for="st"
            )
            st_payment_data = {
                "cheque_no": st_cheque_no,
                "utr_no": st_utr_no,
                "date": InOutProcessService.validate_date_field(
                    st_payment.get("date", "")
                ),
                "bank_name": st_payment.get("bank_name") or None,
                "account_name": st_payment.get("account_name") or None,
                "account_no": st_payment.get("account_no") or None,
                "quantity": InOutProcessService.validate_numeric_field(
                    st_payment.get("quantity", ""), is_float=False
                ),
                "amount": InOutProcessService.validate_numeric_field(
                    st_payment.get("amount", "")
                ),
            }

        return {
            "transporter": transporter,
            "apply_charges": st_apply_charges,
            "customer_name": st_customer_name,
            "origin": self_transportation_data.get("origin") or None,
            "receipt_date": receipt_date,
            "invoice_date": invoice_date,
            "payment_type": self_transportation_data.get("payment_type", "None"),
            "price": price,
            "remark": self_transportation_data.get("remark") or None,
            "self_transportation_payment": st_payment_data,
        }

    @staticmethod
    def save_container(validated_data, location, site):
        """Save or update Container object."""
        try:
            container_data = validated_data
            container_no = container_data["container_no"]

            try:
                container = Container.objects.get(
                    container_no=container_no, location=location, site=site
                )
                container.client = container_data["client"]
                container.type = container_data["type_object"]
                container.size = container_data["size_object"]
                container.payload = container_data["payload"]
                container.gross_wt = container_data["gross_wt"]
                container.tare_wt = container_data["tare_wt"]
                container.manufacturing_date = container_data["manufacturing_date"]
                container.shipping_line = container_data["shipping_line"]
                container.leased_box = container_data["leased_box"]
                container.is_valid = container_data["is_valid"]
                container.in_do_not_lift_queue = container_data["do_not_lift"]
                container.do_not_lift_remarks = container_data["do_not_lift_remarks"]
                container.queued_recently = container_data["do_not_lift"]
                container.automatic_mnr_status_change = container_data[
                    "automatic_mnr_status_change"
                ]
                container.status = "IN"
                container.is_available = False
                container.save()
            except Container.DoesNotExist:
                container = Container.create(
                    client=container_data["client"],
                    type_object=container_data["type_object"],
                    size_object=container_data["size_object"],
                    container_no=container_no,
                    payload=container_data["payload"],
                    gross_wt=container_data["gross_wt"],
                    tare_wt=container_data["tare_wt"],
                    manufacturing_date=container_data["manufacturing_date"],
                    shipping_line=container_data["shipping_line"],
                    leased_box=container_data["leased_box"],
                    is_valid=container_data["is_valid"],
                    in_do_not_lift_queue=container_data["do_not_lift"],
                    do_not_lift_remarks=container_data["do_not_lift_remarks"],
                    automatic_mnr_status_change=container_data[
                        "automatic_mnr_status_change"
                    ],
                    queued_recently=container_data["do_not_lift"],
                    location=location,
                    site=site,
                )
            container.save()
            return container
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_eir(validated_data, container, user):
        """Save Eir and EirLine objects."""
        try:
            eir_data = validated_data
            eir = Eir.create(
                container=container,
                done_by=user,
                eir_date=eir_data["eir_date"],
                eir_time=eir_data["eir_time"],
                offload_date=eir_data["offload_date"],
                offload_time=eir_data["offload_time"],
                eir_img=eir_data["eir_img"],
                eir_amount=eir_data["eir_amount"],
                repair_amount=eir_data["repair_amount"],
                entry_type="IN",
            )
            eir.save()
            eir.save_eir_no(location=container.location)
            eir.upload_eir_img()

            for line in eir_data["eir_line"]:
                if line["grap_position"]:  # Only create if grap_position is not None
                    EirLine.create(
                        eir=eir,
                        grap_position=line["grap_position"],
                        damage_code=line["damage_code"],
                        description=line["description"],
                    ).save()

            return eir
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_gate_in(validated_data, container, location, site):
        """Save GateIn object and link to PreGateIn if applicable."""
        try:
            gate_in_data = validated_data
            gate_in = GateIn.create(
                container=container,
                in_date=gate_in_data["in_date"],
                in_time=gate_in_data["in_time"],
                condition=gate_in_data["condition"],
                grade=gate_in_data["grade"],
                arrived=gate_in_data["arrived"],
                consignee=gate_in_data["consignee"],
                shipper=gate_in_data["shipper"],
                source=gate_in_data["source"],
                from_location_code=gate_in_data["from_location_code"],
                from_port_code=gate_in_data["from_port_code"],
                vessel_name=gate_in_data["vessel_name"],
                voyage_no=gate_in_data["voyage_no"],
                do_ref=gate_in_data["do_ref"],
                cargo=gate_in_data["cargo"],
                export_cargo_type=gate_in_data["export_cargo_type"],
                transporter_name=gate_in_data["transporter_name"],
                vehicle_no=gate_in_data["vehicle_no"],
                bl_no=gate_in_data["bl_no"],
                driver_name=gate_in_data["driver_name"],
                driver_license=gate_in_data["driver_license"],
                driver_mobile_no=gate_in_data["driver_mobile_no"],
                carrier_code=gate_in_data["carrier_code"],
                location=location,
                remarks=gate_in_data["remarks"],
                from_location_name_code=gate_in_data["from_location_name_code"],
                surveyor=gate_in_data["surveyor"],
            )
            gate_in.save()
            gate_in.save_gate_pass_no(location=location)

            # Link to PreGateIn if applicable
            if site.lolo_finance and gate_in_data["arrived"] in [
                "Factory",
                "FS RETURN",
                "CFS/ICD",
            ]:
                try:
                    pregatein = PreGateIn.objects.get(
                        container_no=container.container_no,
                        location=location,
                        site=site,
                        on_hold=False,
                        validity_expired=False,
                        is_gatein_done=False,
                    )
                    gate_in.pregatein_id = pregatein.pk
                    gate_in.save()
                    pregatein.is_gatein_done = True
                    pregatein.save()
                except PreGateIn.DoesNotExist:
                    ErrorLogging().log_error()

            return gate_in
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_container_stock(gate_in, container):
        """Save ContainerStock object."""
        try:
            stock = ContainerStock.create(
                gate_in=gate_in, container=container, grade=gate_in.grade
            )
            stock.save()

            temp_date_time = datetime.datetime.combine(
                gate_in.in_date, gate_in.in_time
            ) - datetime.timedelta(minutes=15)
            temp_date_time = temp_date_time.astimezone(timezone.get_current_timezone())

            if not container.automatic_mnr_status_change:
                stock.status = "Estimate Pending"
                stock.survey_pending_out_date_time = temp_date_time
                stock.estimate_pending_in_date_time = temp_date_time
                stock.save()

            if gate_in.condition == "AV":
                stock.status = "Available"
                stock.save()
                stock.make_available()

            if Surveyor.objects.filter(
                container_no=container.container_no,
                location=container.location,
                site=container.site,
                is_new_container=True,
            ).exists():
                stock.is_survey_import_available = True
                stock.save(update_fields=["is_survey_import_available"])

            return stock
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_handling(validated_data, container, location):
        """Save Handling and HandlingPayment objects."""
        try:
            lolo_data = validated_data
            handling = Handling.create(
                container=container,
                apply_charges=lolo_data["apply_charges"],
                customer_name=lolo_data["customer_name"],
                invoice_date=lolo_data["invoice_date"],
                receipt_date=lolo_data["receipt_date"],
                lolo_type=lolo_data["lolo_type"],
                payment_type=lolo_data["payment_type"],
                lolo_amount=lolo_data["lolo_amount"],
                remark=lolo_data["remark"],
                entry_type="IN",
            )
            handling.save()
            handling.save_invoice_no(location=location)
            handling.save_receipt_no(location=location)

            if lolo_data.get("is_night_charges_applied") and location.name in [
                "INGHK",
                "INGHC",
            ]:
                handling.is_night_charges_applied = lolo_data[
                    "is_night_charges_applied"
                ]
                handling.save()

            lolo_payment = None
            if lolo_data["lolo_payment"]:
                lolo_payment_data = lolo_data["lolo_payment"]
                cheque_no = lolo_payment_data["cheque_no"]
                utr_no = lolo_payment_data["utr_no"]

                if (
                    cheque_no
                    and HandlingPayment.objects.filter(cheque_no=cheque_no).exists()
                ):
                    lolo_payment = HandlingPayment.objects.get(cheque_no=cheque_no)
                    lolo_payment.add_container(
                        container=container, amount=lolo_data["lolo_amount"]
                    )
                    handling.payment_id = lolo_payment.pk
                    handling.save()
                elif utr_no and HandlingPayment.objects.filter(utr_no=utr_no).exists():
                    lolo_payment = HandlingPayment.objects.get(utr_no=utr_no)
                    lolo_payment.add_container(
                        container=container, amount=lolo_data["lolo_amount"]
                    )
                    handling.payment_id = lolo_payment.pk
                    handling.save()
                else:
                    pass

            return handling, lolo_payment
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_self_transportation(validated_data, container, location):
        """Save SelfTransportation and SelfTransportationPayment objects."""
        try:
            st_data = validated_data
            if not st_data:
                return None, None

            st = SelfTransportation.create(
                container=container,
                transporter=st_data["transporter"],
                apply_charges=st_data["apply_charges"],
                customer_name=st_data["customer_name"],
                origin=st_data["origin"],
                receipt_date=st_data["receipt_date"],
                invoice_date=st_data["invoice_date"],
                payment_type=st_data["payment_type"],
                price=st_data["price"],
                remark=st_data["remark"],
                entry_type="IN",
            )
            st.save()
            st.save_invoice_no(location=location)
            st.save_receipt_no(location=location)

            st_payment = None
            if st_data.get("self_transportation_payment"):
                st_payment_data = st_data["self_transportation_payment"]
                cheque_no = st_payment_data["cheque_no"]
                utr_no = st_payment_data["utr_no"]

                if (
                    cheque_no
                    and SelfTransportationPayment.objects.filter(
                        cheque_no=cheque_no
                    ).exists()
                ):
                    st_payment = SelfTransportationPayment.objects.get(
                        cheque_no=cheque_no
                    )
                    st_payment.add_container(
                        container=container, amount=st_data["price"]
                    )
                    st.payment_id = st_payment.pk
                    st.save()
                elif (
                    utr_no
                    and SelfTransportationPayment.objects.filter(utr_no=utr_no).exists()
                ):
                    st_payment = SelfTransportationPayment.objects.get(utr_no=utr_no)
                    st_payment.add_container(
                        container=container, amount=st_data["price"]
                    )
                    st.payment_id = st_payment.pk
                    st.save()
                else:
                    pass

            return st, st_payment
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_gate_in_history(
        container, eir, gate_in, handling, lolo_payment, st, st_payment
    ):
        """Save GateInHistory and ContainerInOutRecord."""
        try:
            in_date_time = datetime.datetime.combine(
                gate_in.in_date, gate_in.in_time
            ).astimezone(timezone.get_current_timezone())

            gih = GateInHistory(
                created_at=timezone.now(),
                date=in_date_time,
                container=container,
                eir=eir,
                gate_in=gate_in,
                lolo=handling,
                lolo_payment=lolo_payment,
                st=st,
                st_payment=st_payment,
            )
            gih.save()

            ContainerInOutRecord(container=container, in_data=gih, out_data=None).save()

            entry_count = GateInHistory.objects.filter(container=container).count()
            container.in_entry_count = entry_count
            container.save()

            return gih
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def handle_en_block_movement(gate_in, site):
        """Update EnBlockMovement and EnBlockPreGateIn."""
        try:
            container_no = gate_in.container.container_no
            location = gate_in.container.location

            if gate_in.arrived == "Port/Vessel" and site.en_block_movement:
                job_order_no = gate_in.bl_no
                vessel_name = gate_in.vessel_name
                voyage_no = gate_in.voyage_no
                if not (job_order_no and vessel_name and voyage_no):
                    raise ValidationError(
                        "Missing required fields for EnBlock Movement i.e Bl No, Vessel Name and Voyage No"
                    )

                try:
                    en_block = EnBlockMovement.objects.get(
                        line=gate_in.container.client.ref_code,
                        job_order_no=job_order_no,
                        vessel_no=vessel_name.strip(),
                        voyage_no=voyage_no.strip(),
                        location=location,
                        site=site,
                    )
                    if en_block.pendency < 1:
                        raise ValidationError(
                            "Not enough stock for this Bl No. i.e pendency is zero"
                        )
                    en_block.pendency -= 1
                    en_block.gate_ins += 1
                    en_block.save(update_fields=["pendency", "gate_ins"])
                except EnBlockMovement.DoesNotExist:
                    pass

            if site.en_block_movement_v2:
                en_block_pregatein_qs = EnBlockPreGateIn.objects.filter(
                    container_no=container_no,
                    en_block__location=location,
                    en_block__site=site,
                    is_processed=False,
                    is_discarded=False,
                )
                if en_block_pregatein_qs.exists():
                    en_block_pregatein = en_block_pregatein_qs.first()
                    if en_block_pregatein.en_block.pendency < 1:
                        raise ValidationError(
                            "Not enough stock for this Bl No. i.e pendency is zero"
                        )
                    en_block_pregatein.en_block.pendency -= 1
                    en_block_pregatein.en_block.gate_ins += 1
                    en_block_pregatein.en_block.save(
                        update_fields=["pendency", "gate_ins"]
                    )
                    en_block_pregatein.is_processed = True
                    en_block_pregatein.save(update_fields=["is_processed"])
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_in_process_data(request):
        """Orchestrate saving all data within a transaction by validating the payload"""
        try:
            with transaction.atomic():
                request_data = request.data
                request_data = InOutProcessService.validate_request_data(
                    data=request_data
                )
                location, site, request_data = (
                    InOutProcessService.validate_location_and_site(request_data)
                )
                app_user = AccountUser.objects.get(username=request.user.username)

                # Save Container
                validated_container_data = InOutProcessService.validate_container_data(
                    container_data=request_data.get("container_data"),
                    location=location,
                    site=site,
                )

                container = InOutProcessService.save_container(
                    validated_data=validated_container_data,
                    location=location,
                    site=site,
                )

                # Save EIR
                validated_eir_data = InOutProcessService.validate_eir_data(
                    eir_data=request_data.get("eir_data")
                )

                eir = InOutProcessService.save_eir(
                    validated_data=validated_eir_data,
                    container=container,
                    user=app_user,
                )

                # Save GateIn
                validated_gate_in_data = InOutProcessService.validate_gate_in_data(
                    gate_in_data=request_data.get("gate_in_data"),
                    location=location,
                    site=site,
                    container_no=container.container_no,
                    client=container.client,
                )

                gate_in = InOutProcessService.save_gate_in(
                    validated_data=validated_gate_in_data,
                    container=container,
                    location=location,
                    site=site,
                )

                # Adjust EIR time (15-minute offset)
                temp_date_time = datetime.datetime.combine(
                    gate_in.in_date, gate_in.in_time
                ).astimezone(timezone.get_current_timezone()) - datetime.timedelta(
                    minutes=15
                )
                temp_date_time = temp_date_time.astimezone(
                    timezone.get_current_timezone()
                )
                eir.eir_date = temp_date_time.date()
                eir.eir_time = temp_date_time.time()
                eir.save()

                # Save ContainerStock
                stock = InOutProcessService.save_container_stock(
                    gate_in=gate_in, container=container
                )

                # Save Handling and HandlingPayment
                validate_lolo_data = InOutProcessService.validate_lolo_data(
                    lolo_data=request_data.get("lolo_data"),
                    location=location,
                    site=site,
                    client_name=container.client.name,
                )

                handling, lolo_payment = InOutProcessService.save_handling(
                    validated_data=validate_lolo_data,
                    container=container,
                    location=location,
                )

                st = None
                st_payment = None
                if request_data.get("self_transportation_data"):
                    # Save SelfTransportation and SelfTransportationPayment
                    validate_self_transportation_data = (
                        InOutProcessService.validate_self_transportation_data(
                            self_transportation_data=request_data.get(
                                "self_transportation_data"
                            ),
                            location=location,
                            site=site,
                            client_name=container.client.name,
                        )
                    )

                    st, st_payment = InOutProcessService.save_self_transportation(
                        validated_data=validate_self_transportation_data,
                        container=container,
                        location=location,
                    )

                # Save GateInHistory and ContainerInOutRecord
                gih = InOutProcessService.save_gate_in_history(
                    container=container,
                    eir=eir,
                    gate_in=gate_in,
                    handling=handling,
                    lolo_payment=lolo_payment,
                    st=st,
                    st_payment=st_payment,
                )

                # Set verification flags
                eir.is_verified = True
                eir.save()
                gate_in.is_verified = True
                gate_in.save()
                handling.is_verified = True
                handling.save()
                if lolo_payment:
                    lolo_payment.is_verified = True
                    lolo_payment.save()
                if st:
                    st.is_verified = True
                    st.save()
                if st_payment:
                    st_payment.is_verified = True
                    st_payment.save()

                # Handle billing
                lolo_bill = None
                st_bill = None
                if handling.payment_type != "None":
                    lolo_bill = create_billing_lolo(obj=gih, process="IN")
                if st:
                    if st.payment_type != "None":
                        st_bill = create_billing_st(obj=gih, process="IN")

                # Apply LOLO night charges
                lolo_night_charges = apply_lolo_night_charges(obj=gih, process="IN")

                # Handle driver image upload
                if validated_gate_in_data.get("image_url"):
                    upload_driver_img_to_s3(
                        validated_gate_in_data.get("image_url"),
                        gih,
                        container.container_no,
                        validated_gate_in_data.get("driver_license"),
                        "IN",
                    )

                # Update truck status
                if site.truck_tracking:
                    change_status_of_truck(
                        container.container_no,
                        gate_in.transporter_name,
                        location,
                        site,
                        gate_in.vehicle_no,
                        "IN",
                    )

                # Handle en-block movement
                InOutProcessService.handle_en_block_movement(gate_in=gate_in, site=site)

                return Response(
                    {"successMsg": "Data Saved", "gih_pk": gih.pk},
                    status=status.HTTP_200_OK,
                )

        except KeyError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)

        except:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @staticmethod
    def validate_container_status(container):
        """Check if container is already OUT."""
        try:
            if container.status == "OUT":
                raise ValidationError("Container Already OUT")
            return container
        except Container.DoesNotExist:
            raise ValidationError("Container Not Found")

    @staticmethod
    def validate_gate_out_data(gate_out_data, location, site, container_no):
        """Validate gate_out_data section of the payload."""
        out_date = InOutProcessService.validate_date_field(
            gate_out_data.get("out_date", "")
        )
        out_time = InOutProcessService.validate_time_field(
            gate_out_data.get("out_time", "")
        )
        condition = gate_out_data.get("condition", "")
        if not condition or condition != "OK":
            raise ValidationError("Container Condition is not OK")

        departed = gate_out_data.get("departed") or None
        if (
            departed
            and site.lolo_finance
            and departed in ["Factory", "FS RETURN", "CFS/ICD"]
        ):
            if not PreGateOut.objects.filter(
                stock__container__container_no=container_no,
                location=location,
                site=site,
                on_hold=False,
                validity_expired=False,
                is_gateout_done=False,
            ).exists():
                raise ValidationError(
                    "Only PreGateOut Containers with do_validity are allowed for OUT Process."
                )

        booking_no = gate_out_data.get("booking_no") or None
        seal_no = gate_out_data.get("seal_no") or None

        if site.name in ["Ahmedabad", "Sanand", "CHEKLA CONTAINER YARD"]:
            if departed and departed in ["Factory", "FS RETURN"]:
                if (
                    not booking_no
                    or not seal_no
                    or len(booking_no) == 0
                    or len(seal_no) == 0
                ):
                    raise ValidationError(
                        "BookingNo and SealNo are Mandatory, for departed type Factory and FS RETURN in Out Process."
                    )

        transporter_name_str = gate_out_data.get("transporter_name", "")
        transporter = None
        if transporter_name_str:
            transporter, _ = Transporter.objects.get_or_create(
                name=transporter_name_str, location=location, site=site
            )

        return {
            "out_date": out_date,
            "out_time": out_time,
            "condition": condition,
            "grade": gate_out_data.get("grade") or None,
            "departed": departed,
            "destination": gate_out_data.get("destination") or None,
            "consignee": gate_out_data.get("consignee") or None,
            "shipper": gate_out_data.get("shipper") or None,
            "delivery": gate_out_data.get("delivery") or None,
            "to_location_code": gate_out_data.get("to_location_code") or None,
            "to_depot_code": gate_out_data.get("to_depot_code") or None,
            "road_rail_to_location_code": gate_out_data.get(
                "road_rail_to_location_code"
            )
            or None,
            "to_port_code": gate_out_data.get("to_port_code") or None,
            "vessel_name": gate_out_data.get("vessel_name") or None,
            "voyage_no": gate_out_data.get("voyage_no") or None,
            "ro_ref": gate_out_data.get("ro_ref") or None,
            "export_cargo": gate_out_data.get("export_cargo") or None,
            "transporter_name": transporter,
            "vehicle_no": gate_out_data.get("vehicle_no") or None,
            "driver_name": gate_out_data.get("driver_name") or None,
            "driver_license": gate_out_data.get("driver_license") or None,
            # "driver_mobile_no": InOutProcessService.validate_numeric_field(
            #     gate_out_data.get("driver_mobile_no", ""), is_float=False
            # ),
            "driver_mobile_no": (
                None
                if not gate_out_data.get("driver_mobile_no", "")
                or not gate_out_data.get("driver_mobile_no", "")
                .replace(".", "", 1)
                .isnumeric()
                else int(gate_out_data.get("driver_mobile_no", ""))
            ),
            "carrier_code": gate_out_data.get("carrier_code") or None,
            "port_of_loading": gate_out_data.get("port_of_loading") or None,
            "port_of_discharge": gate_out_data.get("port_of_discharge") or None,
            "booking_no": gate_out_data.get("booking_no") or None,
            "booking_date": InOutProcessService.validate_date_field(
                gate_out_data.get("booking_date", ""), "%d/%m/%Y"
            )
            or None,
            "booking_party": gate_out_data.get("booking_party") or None,
            "seal_no": seal_no,
            "remarks": gate_out_data.get("remarks") or None,
            "image_url": gate_out_data.get("image_url") or None,
            "surveyor": gate_out_data.get("surveyor") or None,
        }

    @staticmethod
    def validate_seal_no(seal_no, gih):
        """Validate and update seal number."""
        try:
            container_no = gih.container.container_no
            stock = ContainerStock.objects.get(
                container=gih.container,
                gate_in=gih.gate_in,
                container_status="IN",
            )

            if seal_no != stock.seal_no:
                if (
                    stock.seal_no
                    and SealNo.objects.filter(number=stock.seal_no).exists()
                ):
                    old_seal_no = SealNo.objects.get(number=stock.seal_no)
                    old_seal_no.is_available = True
                    old_seal_no.in_use = False
                    old_seal_no.container_no = None
                    old_seal_no.in_use_date = None
                    old_seal_no.out_date = None
                    old_seal_no.is_lock = False
                    old_seal_no.save()

                if seal_no:
                    seal_no_object = SealNo.objects.get(number=seal_no)
                    seal_no_object.is_available = False
                    seal_no_object.in_use = True
                    seal_no_object.container_no = container_no
                    seal_no_object.in_use_date = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                    seal_no_object.out_date = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                    seal_no_object.is_lock = True
                    seal_no_object.save()
                    stock.seal_no = seal_no
                    stock.save()
                else:
                    stock.seal_no = None
                    stock.save()
            elif seal_no:
                seal_no_object = SealNo.objects.get(number=seal_no)
                seal_no_object.out_date = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                seal_no_object.is_lock = True
                seal_no_object.save()

            return seal_no
        except SealNo.DoesNotExist:
            raise ValidationError("Given Seal no does not exist")
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_gate_out(validated_data, container, location, site):
        """Save GateOut object and link to PreGateOut if applicable."""
        try:
            gate_out_data = validated_data
            gate_out = GateOut.create(
                container=container,
                out_date=gate_out_data["out_date"],
                out_time=gate_out_data["out_time"],
                condition=gate_out_data["condition"],
                grade=gate_out_data["grade"],
                departed=gate_out_data["departed"],
                destination=gate_out_data["destination"],
                consignee=gate_out_data["consignee"],
                shipper=gate_out_data["shipper"],
                delivery=gate_out_data["delivery"],
                to_location_code=gate_out_data["to_location_code"],
                to_depot_code=gate_out_data["to_depot_code"],
                road_rail_to_location_code=gate_out_data["road_rail_to_location_code"],
                to_port_code=gate_out_data["to_port_code"],
                vessel_name=gate_out_data["vessel_name"],
                voyage_no=gate_out_data["voyage_no"],
                ro_ref=gate_out_data["ro_ref"],
                export_cargo=gate_out_data["export_cargo"],
                transporter_name=gate_out_data["transporter_name"],
                vehicle_no=gate_out_data["vehicle_no"],
                driver_name=gate_out_data["driver_name"],
                driver_license=gate_out_data["driver_license"],
                driver_mobile_no=gate_out_data["driver_mobile_no"],
                carrier_code=gate_out_data["carrier_code"],
                location=location,
                port_of_loading=gate_out_data["port_of_loading"],
                port_of_discharge=gate_out_data["port_of_discharge"],
                booking_no=gate_out_data["booking_no"],
                booking_date=gate_out_data["booking_date"],
                booking_party=gate_out_data["booking_party"],
                seal_no=gate_out_data["seal_no"],
                remarks=gate_out_data["remarks"],
                surveyor=gate_out_data["surveyor"],
            )
            gate_out.save()
            gate_out.save_gate_pass_no(location=location)

            if site.lolo_finance and gate_out_data["departed"] in [
                "Factory",
                "FS RETURN",
                "CFS/ICD",
            ]:
                try:
                    pregateout = PreGateOut.objects.get(
                        stock__container__container_no=container.container_no,
                        location=location,
                        site=site,
                        on_hold=False,
                        validity_expired=False,
                        is_gateout_done=False,
                    )
                    gate_out.pregateout_id = pregateout.pk
                    gate_out.save()
                    pregateout.is_gateout_done = True
                    pregateout.save()
                except PreGateOut.DoesNotExist:
                    ErrorLogging().log_error()

            return gate_out
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_container_stock_out(gate_out, gih):
        """Update ContainerStock object for gate-out."""
        try:
            stock = ContainerStock.objects.get(
                container=gih.container,
                gate_in=gih.gate_in,
                container_status="IN",
            )
            stock.gate_out = gate_out
            stock.save()
            stock.make_out_of_stock()
            if stock.status == "Alloted":
                stock.allotment_out_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.save()

            if stock.seal_no:
                seal_object = SealNo.objects.get(number=stock.seal_no)
                out_date_time = datetime.datetime.combine(
                    gate_out.out_date, gate_out.out_time
                )
                seal_object.in_use_date = out_date_time
                seal_object.out_date = out_date_time
                seal_object.is_lock = True
                seal_object.save()

            return stock
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_gate_out_history(
        container, eir, gate_out, handling, lolo_payment, st, st_payment, gih
    ):
        """Save GateOutHistory and update ContainerInOutRecord."""
        try:
            out_date_time = datetime.datetime.combine(
                gate_out.out_date, gate_out.out_time
            ).astimezone(timezone.get_current_timezone())
            goh = GateOutHistory(
                created_at=timezone.now(),
                date=out_date_time,
                container=container,
                eir=eir,
                gate_out=gate_out,
                lolo=handling,
                lolo_payment=lolo_payment,
                st=st,
                st_payment=st_payment,
            )
            goh.save()

            container_in_out_record = ContainerInOutRecord.objects.get(
                container=container, in_data=gih
            )
            container_in_out_record.out_data = goh
            container_in_out_record.save()

            entry_count = GateOutHistory.objects.filter(container=container).count()
            container.out_entry_count = entry_count
            container.save()

            return goh
        except:
            ErrorLogging().log_error()
            return None

    @staticmethod
    def save_out_eir(validated_data, container, user):
        """Save Eir and EirLine objects."""
        eir = InOutProcessService.save_eir(validated_data, container, user)
        if eir:
            eir.entry_type = "OUT"
            eir.save()
        return eir

    @staticmethod
    def save_out_handling(validated_data, container, location):
        """Save Eir and EirLine objects."""
        lolo, lolo_payment = InOutProcessService.save_handling(
            validated_data, container, location
        )
        if lolo:
            lolo.entry_type = "OUT"
            lolo.save()
        return lolo, lolo_payment

    @staticmethod
    def save_out_self_transportation(validated_data, container, location):
        """Save SelfTransportation and SelfTransportationPayment objects."""
        st, st_payment = InOutProcessService.save_self_transportation(
            validated_data, container, location
        )
        if st:
            st.entry_type = "OUT"
            st.save()
        return st, st_payment

    @staticmethod
    def save_out_process_data(request, gih_pk):
        try:
            with transaction.atomic():
                request_data = InOutProcessService.validate_request_data(request.data)
                user = request.user
                gih_obj = GateInHistory.objects.get(pk=gih_pk)
                location = gih_obj.container.location
                site = gih_obj.container.site
                container = InOutProcessService.validate_container_status(
                    container=gih_obj.container
                )
                container.status = "OUT"
                container.save()

                validated_eir_data = InOutProcessService.validate_eir_data(
                    eir_data=request_data.get("eir_data")
                )
                eir = InOutProcessService.save_out_eir(
                    validated_data=validated_eir_data,
                    container=container,
                    user=AccountUser.objects.get(username=user.username),
                )

                validated_gate_out_data = InOutProcessService.validate_gate_out_data(
                    gate_out_data=request_data.get("gate_out_data"),
                    location=location,
                    site=site,
                    container_no=container.container_no,
                )
                seal_no_str = validated_gate_out_data.get("seal_no") or None
                seal_no = InOutProcessService.validate_seal_no(
                    seal_no=seal_no_str,
                    gih=gih_obj,
                )
                validated_gate_out_data["seal_no"] = seal_no
                gate_out = InOutProcessService.save_gate_out(
                    validated_data=validated_gate_out_data,
                    container=container,
                    location=location,
                    site=site,
                )

                temp_date_time = datetime.datetime.combine(
                    gate_out.out_date, gate_out.out_time
                ).astimezone(timezone.get_current_timezone()) - datetime.timedelta(
                    minutes=15
                )
                eir.eir_date = temp_date_time.date()
                eir.eir_time = temp_date_time.time()
                eir.save()

                stock = InOutProcessService.save_container_stock_out(
                    gate_out=gate_out, gih=gih_obj
                )

                validated_lolo_data = InOutProcessService.validate_lolo_data(
                    lolo_data=request_data.get("lolo_data"),
                    location=location,
                    site=site,
                    client_name=container.client.name if container.client else "",
                )
                handling, lolo_payment = InOutProcessService.save_out_handling(
                    validated_data=validated_lolo_data,
                    container=container,
                    location=location,
                )

                st, st_payment = None, None
                if request_data.get("self_transportation_data"):
                    validated_self_transportation_data = (
                        InOutProcessService.validate_self_transportation_data(
                            self_transportation_data=request_data.get(
                                "self_transportation_data"
                            ),
                            location=location,
                            site=site,
                            client_name=(
                                container.client.name if container.client else ""
                            ),
                        )
                    )
                    st, st_payment = InOutProcessService.save_out_self_transportation(
                        validated_data=validated_self_transportation_data,
                        container=container,
                        location=location,
                    )

                goh = InOutProcessService.save_gate_out_history(
                    container=container,
                    eir=eir,
                    gate_out=gate_out,
                    handling=handling,
                    lolo_payment=lolo_payment,
                    st=st,
                    st_payment=st_payment,
                    gih=gih_obj,
                )

                eir.is_verified = True
                eir.save()
                gate_out.is_verified = True
                gate_out.save()
                handling.is_verified = True
                handling.save()
                if lolo_payment:
                    lolo_payment.is_verified = True
                    lolo_payment.save()
                if st:
                    st.is_verified = True
                    st.save()
                if st_payment:
                    st_payment.is_verified = True
                    st_payment.save()

                lolo_bill = None
                st_bill = None
                if handling.payment_type != "None":
                    lolo_bill = create_billing_lolo(obj=goh, process="OUT")
                if st and st.payment_type != "None":
                    st_bill = create_billing_st(obj=goh, process="OUT")

                lolo_night_charges = apply_lolo_night_charges(obj=goh, process="OUT")

                if validated_gate_out_data.get("image_url"):
                    upload_driver_img_to_s3(
                        validated_gate_out_data.get("image_url"),
                        goh,
                        container.container_no,
                        validated_gate_out_data.get("driver_license"),
                        "OUT",
                    )

                unlock_mnr_bills(goh, site)

                if site.truck_tracking:
                    change_status_of_truck(
                        container.container_no,
                        gate_out.transporter_name,
                        location,
                        site,
                        gate_out.vehicle_no,
                        "OUT",
                        gate_out.booking_no,
                        (
                            container.shipping_line.name
                            if container.shipping_line
                            else None
                        ),
                    )

                return Response(
                    {"successMsg": "Data Saved", "goh_pk": goh.pk},
                    status=status.HTTP_200_OK,
                )

        except KeyError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid credentials: {str(e)}"},
                status=status.HTTP_200_OK,
            )
