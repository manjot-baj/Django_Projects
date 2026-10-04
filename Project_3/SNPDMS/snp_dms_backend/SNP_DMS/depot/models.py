from django.db import models
from master.models_two import Client, ClientAbbreviation, CLIENT_TYPE, SealNo
from master.models import (
    ContainerType,
    ContainerSize,
    ExportCargoType,
    Transporter,
    Location,
    Site,
)
from account.models import AccountUser
import datetime
from django.utils import timezone
from django.db.models import signals
from SNP_DMS.settings.base import BASE_DIR
import os, logging, traceback
from decouple import config
from common.functions import upload_file, download_file, delete_file
from dateutil.relativedelta import relativedelta
from django.db.models.signals import post_save
from django.dispatch import receiver

CONTAINER_STATUS = [("IN", "IN"), ("OUT", "OUT")]

AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


class Container(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="container_client_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    type = models.ForeignKey(
        ContainerType,
        related_name="container_type_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="container_size_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    container_no = models.CharField(max_length=50, null=True, blank=False)
    payload = models.CharField(max_length=100, null=True, blank=True)
    gross_wt = models.CharField(max_length=100, null=True, blank=True)
    tare_wt = models.CharField(max_length=100, null=True, blank=True)
    manufacturing_date = models.DateField(null=True, blank=True)
    shipping_line = models.ForeignKey(
        ClientAbbreviation,
        related_name="container_shipping_line_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    leased_box = models.BooleanField(null=True, blank=True)
    is_available = models.BooleanField(null=True, blank=True)
    is_valid = models.BooleanField(null=True, blank=True, default=True)
    in_do_not_lift_queue = models.BooleanField(null=True, blank=True, default=False)
    do_not_lift_remarks = models.CharField(max_length=200, null=True, blank=True)
    queued_recently = models.BooleanField(null=True, blank=True, default=False)
    automatic_mnr_status_change = models.BooleanField(null=True, blank=True)
    status = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )
    location = models.ForeignKey(
        Location,
        related_name="container_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="container_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    in_entry_count = models.PositiveIntegerField(null=True, blank=True, default=0)
    out_entry_count = models.PositiveIntegerField(null=True, blank=True, default=0)

    def __str__(self):
        return self.container_no

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "container_no",
                    "type",
                    "size",
                    "manufacturing_date",
                    "location",
                    "site",
                ],
                name="uniq_dep_ctn_combo",
            )
        ]

        indexes = [
            models.Index(fields=["container_no"], name="idx_dep_ctn_container_no"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_dep_ctn_location_site",
            ),
        ]

    @classmethod
    def create(
        cls,
        client,
        type_object,
        size_object,
        container_no,
        payload,
        gross_wt,
        tare_wt,
        manufacturing_date,
        shipping_line,
        leased_box,
        is_valid,
        in_do_not_lift_queue,
        do_not_lift_remarks,
        automatic_mnr_status_change,
        queued_recently,
        location,
        site,
    ):
        try:
            container = cls(client=client)
            container.type = type_object
            container.size = size_object
            container.container_no = container_no
            container.payload = payload
            container.gross_wt = gross_wt
            container.tare_wt = tare_wt
            container.manufacturing_date = manufacturing_date
            container.shipping_line = shipping_line
            container.leased_box = leased_box
            container.in_do_not_lift_queue = in_do_not_lift_queue
            container.do_not_lift_remarks = do_not_lift_remarks
            container.automatic_mnr_status_change = automatic_mnr_status_change
            container.status = "IN"
            container.is_available = False
            container.is_valid = is_valid
            container.queued_recently = queued_recently
            container.location = location
            container.site = site
            return container
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def make_it_available(self):
        self.is_available = True
        self.save()

    def make_it_unavailable(self):
        self.is_available = False
        self.save()

    def get_container(self):
        try:
            data = {"pk": self.pk}
            if self.client is None:
                data["client"] = ""
            else:
                data["client"] = self.client.get_client_name()
            if self.type is None:
                data["type"] = ""
            else:
                data["type"] = self.type.get_type()
            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size.get_size()
            if self.container_no is None:
                data["container_no"] = ""
            else:
                data["container_no"] = self.container_no
            if self.payload is None:
                data["payload"] = ""
            else:
                data["payload"] = self.payload
            if self.gross_wt is None:
                data["gross_wt"] = ""
            else:
                data["gross_wt"] = self.gross_wt
            if self.tare_wt is None:
                data["tare_wt"] = ""
            else:
                data["tare_wt"] = self.tare_wt
            if self.manufacturing_date is None:
                data["manufacturing_date"] = ""
            else:
                data["manufacturing_date"] = self.manufacturing_date.strftime(
                    "%Y-%m-%d"
                )
            if self.shipping_line is None:
                data["shipping_line"] = ""
            else:
                data["shipping_line"] = self.shipping_line.get_abbreviation_name()
            if self.leased_box is None:
                data["leased_box"] = ""
            else:
                data["leased_box"] = str(self.leased_box)

            if self.is_valid is None:
                data["is_valid"] = "True"
            else:
                data["is_valid"] = str(self.is_valid)

            if self.in_do_not_lift_queue is None:
                data["do_not_lift"] = ""
            else:
                data["do_not_lift"] = str(self.in_do_not_lift_queue)

            if self.do_not_lift_remarks is None:
                data["do_not_lift_remarks"] = ""
            else:
                data["do_not_lift_remarks"] = str(self.do_not_lift_remarks)

            if self.automatic_mnr_status_change is None:
                data["automatic_mnr_status_change"] = ""
            else:
                data["automatic_mnr_status_change"] = str(
                    self.automatic_mnr_status_change
                )

            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name

            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


EIR_DAMAGE_CODE = [
    ("OK", "OK"),
    ("CLEANING", "CLEANING"),
    ("LD", "LD"),
    ("MD", "MD"),
    ("HD", "HD"),
    ("AV", "AV"),
    ("AR", "AR"),
    ("DM", "DM"),
]

ARRIVED = [
    ("Factory", "Factory"),
    ("Road/Rail", "Road/Rail"),
    ("FS RETURN", "FS RETURN"),
    ("CFS/ICD", "CFS/ICD"),
    ("Port/Vessel", "Port/Vessel"),
]


def save_default_eir_img():
    try:
        temp_file_path = os.path.join(BASE_DIR, "eir_img/eir_buffer_img.txt")
        with open(temp_file_path, "r") as temp:
            return temp.read()
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


class Eir(models.Model):
    container = models.ForeignKey(
        Container,
        related_name="container_eir_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    eir_no = models.CharField(max_length=50, null=True, blank=False)
    done_by = models.ForeignKey(
        AccountUser,
        related_name="eir_done_by_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    eir_date = models.DateField(null=True, blank=True)
    eir_time = models.TimeField(null=True, blank=True)
    offload_date = models.DateField(null=True, blank=True)
    offload_time = models.TimeField(null=True, blank=True)
    eir_img = models.TextField(null=True, blank=True, default=save_default_eir_img)
    eir_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    repair_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    entry_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )
    is_verified = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return self.container.container_no

    class Meta:
        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_eir_container_id"),
        ]

    @classmethod
    def create(
        cls,
        container,
        done_by,
        eir_date,
        eir_time,
        offload_date,
        offload_time,
        eir_img,
        eir_amount,
        repair_amount,
        entry_type,
    ):
        try:
            # TODO: eir_no random according to format and eir date_time should be 15 min earlier then gatein date_time
            eir = cls(container=container)
            eir.done_by = done_by
            eir.eir_date = eir_date
            eir.eir_time = eir_time
            eir.offload_date = offload_date
            eir.offload_time = offload_time
            eir.eir_img = eir_img
            eir.eir_amount = eir_amount
            eir.repair_amount = repair_amount
            eir.entry_type = entry_type
            return eir
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def save_eir_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.eir_no = f"{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def get_eir(self):
        try:
            data = {"pk": self.pk}
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = self.container.get_container()["container_no"]
            if self.eir_no is None:
                data["eir_no"] = ""
            else:
                data["eir_no"] = self.eir_no
            if self.done_by is None:
                data["done_by"] = ""
            else:
                data["done_by"] = (
                    str(self.done_by.firstname) + " " + str(self.done_by.lastname)
                )
            if self.eir_date is None:
                data["eir_date"] = ""
            else:
                data["eir_date"] = self.eir_date.strftime("%Y-%m-%d")
            if self.eir_time is None:
                data["eir_time"] = ""
            else:
                data["eir_time"] = self.eir_time.strftime("%H:%M")
            if self.offload_date is None:
                data["offload_date"] = ""
            else:
                data["offload_date"] = self.offload_date.strftime("%Y-%m-%d")
            if self.offload_time is None:
                data["offload_time"] = ""
            else:
                data["offload_time"] = self.offload_time.strftime("%H:%M")

            if self.eir_amount is None:
                data["eir_amount"] = ""
            else:
                data["eir_amount"] = str(self.eir_amount)
            if self.repair_amount is None:
                data["repair_amount"] = ""
            else:
                data["repair_amount"] = str(self.repair_amount)

            data["eir_img"] = save_default_eir_img()

            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_eir_img(self):
        try:
            bucket_name = config("AWS_STORAGE_BUCKET_NAME")
            file_name = f"{self.container.container_no}_{self.eir_date.strftime('%Y%m%d')}_{self.eir_time.strftime('%H%M')}_{self.pk}.txt"
            location = self.container.location.name
            site_name = self.container.site.name
            object_name = (
                f"EIR_IMG/{location}/{site_name}/{self.entry_type}/{file_name}"
            )
            temp_file_path = download_file(bucket_name, object_name, file_name)
            with open(temp_file_path, "r") as temp:
                img = temp.read()
            os.remove(temp_file_path)
            return img
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return save_default_eir_img()

    def upload_eir_img(self):
        try:
            eir_img_text = self.eir_img
            file_name = f"{self.container.container_no}_{self.eir_date.strftime('%Y%m%d')}_{self.eir_time.strftime('%H%M')}_{self.pk}.txt"
            location = self.container.location.name
            site_name = self.container.site.name
            bucket_name = config("AWS_STORAGE_BUCKET_NAME")
            object_name = (
                f"EIR_IMG/{location}/{site_name}/{self.entry_type}/{file_name}"
            )
            if not os.path.exists(os.path.join(BASE_DIR, "temp/EIR_IMG/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/EIR_IMG/"))
            temp_file_path = os.path.join(BASE_DIR, f"temp/EIR_IMG/{file_name}")
            with open(temp_file_path, "w") as fh:
                fh.write(eir_img_text)
            try:
                delete_file(bucket=bucket_name, object_name=object_name)
            except:
                pass
            upload_file(temp_file_path, bucket_name, object_name)
            self.eir_img = None
            self.save()
            os.remove(temp_file_path)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class EirLine(models.Model):
    eir = models.ForeignKey(
        Eir,
        related_name="eir_lines_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    grap_position = models.CharField(max_length=100, null=True, blank=True)
    damage_code = models.CharField(
        max_length=100, null=True, blank=True, choices=EIR_DAMAGE_CODE
    )
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.eir.container.container_no

    class Meta:
        indexes = [
            models.Index(fields=["eir_id"], name="idx_dep_eirline_eir_id"),
        ]

    @classmethod
    def create(cls, eir, grap_position, damage_code, description):
        try:
            eir_line = cls(eir=eir)
            eir_line.grap_position = grap_position
            eir_line.damage_code = damage_code
            eir_line.description = description
            return eir_line
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_eir_line(self):
        try:
            data = {}
            if self.eir is None:
                data["eir_no"] = ""
            else:
                data["eir_no"] = self.eir.eir_no
            if self.grap_position is None:
                data["grap_position"] = ""
            else:
                data["grap_position"] = self.grap_position
            if self.damage_code is None:
                data["damage_code"] = ""
            else:
                data["damage_code"] = self.damage_code
            if self.description is None:
                data["description"] = ""
            else:
                data["description"] = self.description
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


GRADE_CODE = [
    ("A", "A"),
    ("B+", "B+"),
    ("B", "B"),
    ("C+", "C+"),
    ("C", "C"),
    ("D", "D"),
]


class GateIn(models.Model):
    container = models.ForeignKey(
        Container,
        related_name="container_gate_in_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_pass_no = models.CharField(max_length=50, null=True, blank=False)
    in_date = models.DateField(null=True, blank=True)
    in_time = models.TimeField(null=True, blank=True)
    condition = models.CharField(
        max_length=100, null=True, blank=True, choices=EIR_DAMAGE_CODE
    )
    grade = models.CharField(max_length=100, null=True, blank=True, choices=GRADE_CODE)
    arrived = models.CharField(max_length=100, null=True, blank=True, choices=ARRIVED)
    consignee = models.CharField(max_length=100, null=True, blank=True)
    shipper = models.CharField(max_length=100, null=True, blank=True)
    source = models.CharField(max_length=100, null=True, blank=True)
    from_location_code = models.CharField(max_length=100, null=True, blank=True)
    from_location_name_code = models.CharField(max_length=100, null=True, blank=True)
    from_port_code = models.CharField(max_length=100, null=True, blank=True)
    vessel_name = models.CharField(max_length=100, null=True, blank=True)
    voyage_no = models.CharField(max_length=100, null=True, blank=True)
    do_ref = models.CharField(max_length=100, null=True, blank=True)
    cargo = models.CharField(max_length=100, null=True, blank=True)
    export_cargo_type = models.ForeignKey(
        ExportCargoType,
        related_name="gate_in_export_cargo",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    transporter_name = models.ForeignKey(
        Transporter,
        related_name="gate_in_transporter_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    vehicle_no = models.CharField(max_length=100, null=True, blank=True)
    bl_no = models.CharField(max_length=100, null=True, blank=True)
    pregatein_id = models.CharField(max_length=100, null=True, blank=True)
    driver_name = models.CharField(max_length=100, null=True, blank=True)
    driver_license = models.CharField(max_length=100, null=True, blank=True)
    driver_mobile_no = models.CharField(max_length=15, null=True, blank=True)
    carrier_code = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="gate_in_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    remarks = models.TextField(null=True, blank=True)
    do_s3_object_name = models.TextField(null=True, blank=True)
    do_s3_file_name = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(null=True, blank=True)
    driver_image_s3_object_name = models.TextField(null=True, blank=True)
    driver_image_s3_file_name = models.TextField(null=True, blank=True)
    is_driver_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    surveyor = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.container.container_no

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["container", "in_date", "in_time"],
                name="uniq_dep_gatein_combo",
            )
        ]

        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_gatein_container_id"),
            models.Index(fields=["is_verified"], name="idx_dep_gatein_is_verified"),
        ]

    @classmethod
    def create(
        cls,
        container,
        in_date,
        in_time,
        condition,
        grade,
        arrived,
        consignee,
        shipper,
        source,
        from_location_code,
        from_port_code,
        vessel_name,
        voyage_no,
        do_ref,
        cargo,
        export_cargo_type,
        transporter_name,
        vehicle_no,
        bl_no,
        driver_name,
        driver_license,
        driver_mobile_no,
        carrier_code,
        location,
        remarks,
        from_location_name_code,
        surveyor,
    ):
        try:
            # TODO: gate_pass_no random according to format and eir date_time should be 15 min earlier then gatein
            #  date_time
            gate_in = cls(container=container)
            gate_in.in_date = in_date
            gate_in.in_time = in_time
            gate_in.condition = condition
            gate_in.grade = grade
            gate_in.arrived = arrived
            gate_in.consignee = consignee
            gate_in.shipper = shipper
            gate_in.source = source
            gate_in.from_location_code = from_location_code
            gate_in.from_port_code = from_port_code
            gate_in.vessel_name = vessel_name
            gate_in.voyage_no = voyage_no
            gate_in.do_ref = do_ref
            gate_in.cargo = cargo
            gate_in.export_cargo_type = export_cargo_type
            gate_in.transporter_name = transporter_name
            gate_in.vehicle_no = vehicle_no
            gate_in.bl_no = bl_no
            gate_in.driver_name = driver_name
            gate_in.driver_license = driver_license
            gate_in.driver_mobile_no = driver_mobile_no
            gate_in.carrier_code = carrier_code
            gate_in.location = location
            gate_in.remarks = remarks
            gate_in.from_location_name_code = from_location_name_code
            gate_in.surveyor = surveyor
            return gate_in
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def save_gate_pass_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.gate_pass_no = f"GIP/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            return False

    def get_gate_in(self):
        try:
            data = {"pk": self.pk}
            if self.gate_pass_no is None:
                data["gate_pass_no"] = ""
            else:
                data["gate_pass_no"] = self.gate_pass_no
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = self.container.get_container()["container_no"]
            if self.in_date is None:
                data["in_date"] = ""
            else:
                data["in_date"] = self.in_date.strftime("%Y-%m-%d")
            if self.in_time is None:
                data["in_time"] = ""
            else:
                data["in_time"] = self.in_time.strftime("%H:%M")
            if self.condition is None:
                data["condition"] = ""
            else:
                data["condition"] = self.condition
            if self.grade is None:
                data["grade"] = ""
            else:
                data["grade"] = self.grade
            if self.arrived is None:
                data["arrived"] = ""
            else:
                data["arrived"] = self.arrived
            if self.consignee is None:
                data["consignee"] = ""
            else:
                data["consignee"] = self.consignee
            if self.shipper is None:
                data["shipper"] = ""
            else:
                data["shipper"] = self.shipper
            if self.source is None:
                data["source"] = ""
            else:
                data["source"] = self.source
            if self.surveyor is None:
                data["surveyor"] = ""
            else:
                data["surveyor"] = self.surveyor
            if self.from_location_code is None:
                data["from_location_code"] = ""
            else:
                data["from_location_code"] = self.from_location_code
            if self.from_location_name_code is None:
                data["from_location_name_code"] = ""
            else:
                data["from_location_name_code"] = self.from_location_name_code
            if self.from_port_code is None:
                data["from_port_code"] = ""
            else:
                data["from_port_code"] = self.from_port_code
            if self.vessel_name is None:
                data["vessel_name"] = ""
            else:
                data["vessel_name"] = self.vessel_name
            if self.voyage_no is None:
                data["voyage_no"] = ""
            else:
                data["voyage_no"] = self.voyage_no
            if self.do_ref is None:
                data["do_ref"] = ""
            else:
                data["do_ref"] = self.do_ref
            if self.cargo is None:
                data["cargo"] = ""
            else:
                data["cargo"] = self.cargo
            if self.export_cargo_type is None:
                data["export_cargo_type"] = ""
            else:
                data["export_cargo_type"] = self.export_cargo_type.name
            if self.transporter_name is None:
                data["transporter_name"] = ""
            else:
                data["transporter_name"] = self.transporter_name.name
            if self.vehicle_no is None:
                data["vehicle_no"] = ""
            else:
                data["vehicle_no"] = self.vehicle_no
            if self.bl_no is None:
                data["bl_no"] = ""
            else:
                data["bl_no"] = self.bl_no
            if self.pregatein_id is None:
                data["pregatein_id"] = ""
            else:
                data["pregatein_id"] = self.pregatein_id
            if self.driver_name is None:
                data["driver_name"] = ""
            else:
                data["driver_name"] = self.driver_name
            if self.driver_license is None:
                data["driver_license"] = ""
            else:
                data["driver_license"] = self.driver_license
            if self.driver_mobile_no is None:
                data["driver_mobile_no"] = ""
            else:
                data["driver_mobile_no"] = self.driver_mobile_no
            if self.carrier_code is None:
                data["carrier_code"] = ""
            else:
                data["carrier_code"] = self.carrier_code
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.remarks is None:
                data["remarks"] = ""
            else:
                data["remarks"] = self.remarks
            if self.do_s3_object_name is None:
                data["do_uploaded"] = "NO"
            else:
                data["do_uploaded"] = "YES"

            if self.pregatein_id is None:
                data["pregatein_id"] = ""
            else:
                data["pregatein_id"] = self.pregatein_id

            if self.is_driver_img_uploaded:
                data["driver_img_uploaded"] = True
            else:
                data["driver_img_uploaded"] = False

            if self.driver_image_s3_object_name:
                data["image_link"] = (
                    f"https://{AWS_REPAIR_IMAGE_BUCKET_NAME}.s3.amazonaws.com/{self.driver_image_s3_object_name}"
                )
            else:
                data["image_link"] = ""

            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


LOLO_TYPE = [
    ("Lift ON / Lift OFF", "Lift ON / Lift OFF"),
    ("ON ", "ON"),
    ("OFF", "OFF"),
]

PAYMENT_TYPE = [
    ("None", "None"),
    ("Advance", "Advance"),
    ("Cash", "Cash"),
    ("Cheque", "Cheque"),
    ("NEFT", "NEFT"),
    ("RTGS", "RTGS"),
    ("Outstanding", "Outstanding"),
    ("Credit", "Credit"),
]

LOLO_ST_PAYMENT_TYPE = [
    ("Cheque", "Cheque"),
    ("NEFT", "NEFT"),
    ("RTGS", "RTGS"),
]

GST_TYPE = [
    ("GST 0%", "GST 0%"),
    ("GST 5%", "GST 5%"),
    ("GST 12%", "GST 12%"),
    ("GST 18%", "GST 18%"),
    ("GST 28%", "GST 28%"),
    ("IGST 0%", "IGST 0%"),
    ("IGST 5%", "IGST 5%"),
    ("IGST 12%", "IGST 12%"),
    ("IGST 18%", "IGST 18%"),
    ("IGST 28%", "IGST 28%"),
]


class Handling(models.Model):
    container = models.ForeignKey(
        Container,
        related_name="container_handling_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    apply_charges = models.CharField(
        max_length=100, null=True, blank=True, choices=CLIENT_TYPE
    )
    customer_name = models.ForeignKey(
        Client,
        related_name="handling_client_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    invoice_no = models.CharField(max_length=100, null=True, blank=True)
    receipt_no = models.CharField(max_length=100, null=True, blank=True)
    invoice_date = models.DateField(null=True, blank=True)
    receipt_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    lolo_type = models.CharField(
        max_length=100, null=True, blank=True, choices=LOLO_TYPE
    )
    payment_type = models.CharField(
        max_length=100, null=True, blank=True, choices=PAYMENT_TYPE
    )
    lolo_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    with_gst = models.BooleanField(null=True, blank=True, default=False)
    gst = models.CharField(max_length=100, null=True, blank=True, choices=GST_TYPE)
    cgst = models.CharField(max_length=100, null=True, blank=True)
    cgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    sgst = models.CharField(max_length=100, null=True, blank=True)
    sgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    igst = models.CharField(max_length=100, null=True, blank=True)
    igst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    net_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    taxable_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    gross_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remark = models.TextField(null=True, blank=True)
    entry_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    is_verified = models.BooleanField(null=True, blank=True)
    is_invoiced = models.BooleanField(null=True, blank=True, default=False)
    is_night_charge_bill_invoiced = models.BooleanField(
        null=True, blank=True, default=False
    )
    is_night_charges_applied = models.BooleanField(null=True, blank=True, default=False)
    night_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_amt_editable = models.BooleanField(null=True, blank=True, default=True)

    def __str__(self):
        return self.container.container_no

    class Meta:
        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_lolo_container_id"),
            models.Index(
                fields=["entry_type", "is_verified"], name="idx_dep_lolo_etry_verified"
            ),
        ]

    @classmethod
    def create(
        cls,
        container,
        apply_charges,
        customer_name,
        invoice_date,
        receipt_date,
        lolo_type,
        payment_type,
        lolo_amount,
        remark,
        entry_type,
    ):
        try:
            handling = cls(container=container)
            handling.apply_charges = apply_charges
            handling.customer_name = customer_name
            handling.invoice_date = invoice_date
            handling.receipt_date = receipt_date
            handling.lolo_type = lolo_type
            handling.payment_type = payment_type
            handling.lolo_amount = lolo_amount
            handling.remark = remark
            handling.net_amount = lolo_amount
            handling.taxable_amount = lolo_amount
            handling.gross_amount = lolo_amount
            handling.entry_type = entry_type
            return handling
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def save_invoice_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.invoice_no = f"INV/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def save_receipt_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.receipt_no = f"PAYIN/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def save_out_receipt_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.receipt_no = f"PAYOUT/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def get_handling(self):
        try:
            data = {"pk": self.pk}
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = self.container.get_container()["container_no"]
            if self.apply_charges is None:
                data["apply_charges"] = ""
            else:
                data["apply_charges"] = self.apply_charges
            if self.customer_name is None:
                data["customer_name"] = ""
            else:
                data["customer_name"] = self.customer_name.name
            if self.invoice_no is None:
                data["invoice_no"] = ""
            else:
                data["invoice_no"] = self.invoice_no
            if self.receipt_no is None:
                data["receipt_no"] = ""
            else:
                data["receipt_no"] = self.receipt_no
            if self.invoice_date is None:
                data["invoice_date"] = ""
            else:
                data["invoice_date"] = self.invoice_date.strftime("%Y-%m-%d")
            if self.receipt_date is None:
                data["receipt_date"] = ""
            else:
                data["receipt_date"] = self.receipt_date.strftime("%Y-%m-%d")
            if self.delivery_date is None:
                data["delivery_date"] = ""
            else:
                data["delivery_date"] = self.delivery_date.strftime("%Y-%m-%d")
            if self.due_date is None:
                data["due_date"] = ""
            else:
                data["due_date"] = self.due_date.strftime("%Y-%m-%d")
            if self.lolo_type is None:
                data["lolo_type"] = ""
            else:
                data["lolo_type"] = self.lolo_type
            if self.payment_type is None:
                data["payment_type"] = ""
            else:
                data["payment_type"] = self.payment_type
            if self.lolo_amount is None:
                data["lolo_amount"] = ""
            else:
                data["lolo_amount"] = str(self.lolo_amount)
            if self.night_charges is None:
                data["night_charges"] = ""
            else:
                data["night_charges"] = str(self.night_charges)
            if self.with_gst is None:
                data["with_gst"] = ""
            else:
                data["with_gst"] = self.with_gst
            if self.is_night_charges_applied is None:
                data["is_night_charges_applied"] = ""
            else:
                data["is_night_charges_applied"] = self.is_night_charges_applied
            if self.is_night_charge_bill_invoiced is None:
                data["is_night_charge_bill_invoiced"] = ""
            else:
                data["is_night_charge_bill_invoiced"] = (
                    self.is_night_charge_bill_invoiced
                )
            if self.gst is None:
                data["gst"] = ""
            else:
                data["gst"] = self.gst
            if self.cgst is None:
                data["cgst"] = ""
            else:
                data["cgst"] = self.cgst
            if self.igst is None:
                data["igst"] = ""
            else:
                data["igst"] = self.igst
            if self.sgst is None:
                data["sgst"] = ""
            else:
                data["sgst"] = self.sgst
            if self.cgst_amount is None:
                data["cgst_amount"] = ""
            else:
                data["cgst_amount"] = str(self.cgst_amount)
            if self.igst_amount is None:
                data["igst_amount"] = ""
            else:
                data["igst_amount"] = str(self.igst_amount)
            if self.sgst_amount is None:
                data["sgst_amount"] = ""
            else:
                data["sgst_amount"] = str(self.sgst_amount)
            if self.net_amount is None:
                data["net_amount"] = ""
            else:
                data["net_amount"] = str(self.net_amount)
            if self.taxable_amount is None:
                data["taxable_amount"] = ""
            else:
                data["taxable_amount"] = str(self.taxable_amount)
            if self.gross_amount is None:
                data["gross_amount"] = ""
            else:
                data["gross_amount"] = str(self.gross_amount)
            if self.remark is None:
                data["remark"] = ""
            else:
                data["remark"] = self.remark
            data["is_amt_editable"] = self.is_amt_editable
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class HandlingPayment(models.Model):
    date = models.DateField(null=True, blank=True)
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    account_name = models.CharField(max_length=200, null=True, blank=True)
    account_no = models.CharField(max_length=200, null=True, blank=True)
    cheque_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    utr_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    quantity = models.IntegerField(null=True, blank=True)
    remaining = models.IntegerField(null=True, blank=True)
    container = models.ManyToManyField(
        Container, related_name="container_handling_payment_rel", blank=True
    )
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    original_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_verified = models.BooleanField(null=True, blank=True)
    payment_type = models.CharField(
        max_length=100, null=True, blank=True, choices=LOLO_ST_PAYMENT_TYPE
    )
    location = models.ForeignKey(
        Location,
        related_name="lolo_payment_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="lolo_payment_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    class Meta:
        indexes = [
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_lolo_pmt_location_site",
            ),
        ]

    @classmethod
    def create(
        cls,
        date,
        bank_name,
        account_name,
        account_no,
        cheque_no,
        utr_no,
        quantity,
        amount,
        payment_type,
        location,
        site,
    ):
        try:
            payment = cls(bank_name=bank_name)
            payment.account_name = account_name
            payment.account_no = account_no
            payment.date = date
            payment.cheque_no = cheque_no
            payment.utr_no = utr_no
            payment.quantity = quantity
            payment.remaining = quantity
            payment.amount = amount
            payment.original_amount = amount
            payment.payment_type = payment_type
            payment.location = location
            payment.site = site
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def add_container(self, container, amount):
        try:
            self.container.add(container)
            self.remaining = self.remaining - 1
            self.amount = float(self.amount) - float(amount)
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def remove_container(self, container, amount):
        try:
            self.container.remove(container)
            self.remaining = self.remaining + 1
            self.amount = float(self.amount) + float(amount)
            self.save()

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    # def add_amount_with_gst(self, amount):
    #     try:
    #         gst_object = GST.objects.get(name=self.gst)
    #         gst_type = gst_object.name
    #         gst_percent = gst_object.percent
    #         if "IGST" in gst_type:
    #             self.igst = gst_percent
    #             self.igst_amount = amount * self.igst
    #             self.net_amount = amount + self.igst_amount
    #             self.taxable_amount = amount
    #             self.gross_amount = self.net_amount
    #             self.save()
    #             return "IGST added to amount"
    #         else:
    #             self.cgst = gst_percent / 2
    #             self.sgst = gst_percent / 2
    #             self.cgst_amount = amount * self.cgst
    #             self.sgst_amount = amount * self.sgst
    #             cnsgst = self.cgst_amount + self.sgst_amount
    #             self.net_amount = amount + cnsgst
    #             self.taxable_amount = amount
    #             self.gross_amount = self.net_amount
    #             self.save()
    #             return "GST added to amount"
    #     except:
    #         return None
    #
    # def add_amount(self, amount):
    #     try:
    #         self.net_amount = amount
    #         self.taxable_amount = amount
    #         self.gross_amount = self.net_amount
    #         self.save()
    #         return True
    #     except:
    #         return None

    def get_payment_details(self):
        try:
            data = {"pk": self.pk}
            if self.date is None:
                data["date"] = ""
            else:
                data["date"] = self.date
            if self.bank_name is None:
                data["bank_name"] = ""
            else:
                data["bank_name"] = self.bank_name
            if self.account_name is None:
                data["account_name"] = ""
            else:
                data["account_name"] = self.account_name

            if self.account_no is None:
                data["account_no"] = ""
            else:
                data["account_no"] = self.account_no

            if self.cheque_no is None:
                data["cheque_no"] = ""
            else:
                data["cheque_no"] = self.cheque_no
            if self.utr_no is None:
                data["utr_no"] = ""
            else:
                data["utr_no"] = self.utr_no
            if self.quantity is None:
                data["quantity"] = ""
            else:
                data["quantity"] = str(self.quantity)
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = [c.container_no for c in list(self.container.all())]
            if self.remaining is None:
                data["remaining"] = ""
            else:
                data["remaining"] = str(self.remaining)
            if self.amount is None:
                data["amount"] = ""
            else:
                data["amount"] = str(self.amount)
            if self.original_amount is None:
                data["original_amount"] = ""
            else:
                data["original_amount"] = str(self.original_amount)
            if self.payment_type is None:
                data["payment_type"] = ""
            else:
                data["payment_type"] = str(self.payment_type)

            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class SelfTransportation(models.Model):
    container = models.ForeignKey(
        Container,
        related_name="container_self_transportation_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    transporter = models.ForeignKey(
        Transporter,
        related_name="self_transportation_transporter_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    apply_charges = models.CharField(
        max_length=100, null=True, blank=True, choices=CLIENT_TYPE
    )
    customer_name = models.ForeignKey(
        Client,
        related_name="self_transportation_client_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    origin = models.CharField(max_length=100, null=True, blank=True)
    receipt_no = models.CharField(max_length=100, null=True, blank=True)
    receipt_date = models.DateField(null=True, blank=True)
    invoice_no = models.CharField(max_length=100, null=True, blank=True)
    invoice_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    payment_type = models.CharField(
        max_length=100, null=True, blank=True, choices=PAYMENT_TYPE
    )
    price = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    with_gst = models.BooleanField(null=True, blank=True)
    gst = models.CharField(max_length=100, null=True, blank=True, choices=GST_TYPE)
    cgst = models.CharField(max_length=100, null=True, blank=True)
    cgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    sgst = models.CharField(max_length=100, null=True, blank=True)
    sgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    igst = models.CharField(max_length=100, null=True, blank=True)
    igst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    net_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    taxable_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    gross_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remark = models.TextField(null=True, blank=True)
    entry_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    is_verified = models.BooleanField(null=True, blank=True)
    is_invoiced = models.BooleanField(null=True, blank=True, default=False)
    is_amt_editable = models.BooleanField(null=True, blank=True, default=True)

    def __str__(self):
        return self.container.container_no

    class Meta:
        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_st_container_id"),
            models.Index(
                fields=["entry_type", "is_verified"], name="idx_dep_st_etry_verified"
            ),
        ]

    @classmethod
    def create(
        cls,
        container,
        transporter,
        apply_charges,
        customer_name,
        origin,
        receipt_date,
        invoice_date,
        payment_type,
        price,
        remark,
        entry_type,
    ):
        try:
            transportation = cls(container=container)
            transportation.transporter = transporter
            transportation.apply_charges = apply_charges
            transportation.customer_name = customer_name
            transportation.origin = origin
            transportation.invoice_date = invoice_date
            transportation.receipt_date = receipt_date
            transportation.payment_type = payment_type
            transportation.price = price
            transportation.remark = remark
            transportation.net_amount = price
            transportation.taxable_amount = price
            transportation.gross_amount = price
            transportation.entry_type = entry_type
            return transportation
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def save_invoice_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.invoice_no = f"INV/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def save_receipt_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.receipt_no = f"PAYIN/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def save_out_receipt_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.receipt_no = f"PAYOUT/{location.location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def get_self_transportation(self):
        try:
            data = {"pk": self.pk}
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = self.container.get_container()["container_no"]
            if self.apply_charges is None:
                data["apply_charges"] = ""
            else:
                data["apply_charges"] = self.apply_charges
            if self.customer_name is None:
                data["customer_name"] = ""
            else:
                data["customer_name"] = self.customer_name.name
            if self.transporter is None:
                data["transporter"] = ""
            else:
                data["transporter"] = self.transporter.name

            if self.invoice_no is None:
                data["invoice_no"] = ""
            else:
                data["invoice_no"] = self.invoice_no

            if self.receipt_no is None:
                data["receipt_no"] = ""
            else:
                data["receipt_no"] = self.receipt_no
            if self.origin is None:
                data["origin"] = ""
            else:
                data["origin"] = self.origin
            if self.receipt_date is None:
                data["receipt_date"] = ""
            else:
                data["receipt_date"] = self.receipt_date.strftime("%Y-%m-%d")
            if self.invoice_date is None:
                data["invoice_date"] = ""
            else:
                data["invoice_date"] = self.invoice_date.strftime("%Y-%m-%d")
            if self.delivery_date is None:
                data["delivery_date"] = ""
            else:
                data["delivery_date"] = self.delivery_date.strftime("%Y-%m-%d")
            if self.due_date is None:
                data["due_date"] = ""
            else:
                data["due_date"] = self.due_date.strftime("%Y-%m-%d")
            if self.payment_type is None:
                data["payment_type"] = ""
            else:
                data["payment_type"] = self.payment_type
            if self.price is None:
                data["price"] = ""
            else:
                data["price"] = str(self.price)
            if self.with_gst is None:
                data["with_gst"] = ""
            else:
                data["with_gst"] = self.with_gst
            if self.gst is None:
                data["gst"] = ""
            else:
                data["gst"] = self.gst
            if self.cgst is None:
                data["cgst"] = ""
            else:
                data["cgst"] = self.cgst
            if self.igst is None:
                data["igst"] = ""
            else:
                data["igst"] = self.igst
            if self.sgst is None:
                data["sgst"] = ""
            else:
                data["sgst"] = self.sgst
            if self.cgst_amount is None:
                data["cgst_amount"] = ""
            else:
                data["cgst_amount"] = str(self.cgst_amount)
            if self.igst_amount is None:
                data["igst_amount"] = ""
            else:
                data["igst_amount"] = str(self.igst_amount)
            if self.sgst_amount is None:
                data["sgst_amount"] = ""
            else:
                data["sgst_amount"] = str(self.sgst_amount)
            if self.net_amount is None:
                data["net_amount"] = ""
            else:
                data["net_amount"] = str(self.net_amount)
            if self.taxable_amount is None:
                data["taxable_amount"] = ""
            else:
                data["taxable_amount"] = str(self.taxable_amount)
            if self.gross_amount is None:
                data["gross_amount"] = ""
            else:
                data["gross_amount"] = str(self.gross_amount)
            if self.remark is None:
                data["remark"] = ""
            else:
                data["remark"] = self.remark

            data["is_amt_editable"] = self.is_amt_editable
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class SelfTransportationPayment(models.Model):
    date = models.DateField(null=True, blank=True)
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    account_name = models.CharField(max_length=200, null=True, blank=True)
    account_no = models.CharField(max_length=200, null=True, blank=True)
    cheque_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    utr_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    quantity = models.IntegerField(null=True, blank=True)
    remaining = models.IntegerField(null=True, blank=True)
    container = models.ManyToManyField(
        Container, related_name="container_self_transportation_payment_rel", blank=True
    )
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    original_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_verified = models.BooleanField(null=True, blank=True)
    payment_type = models.CharField(
        max_length=100, null=True, blank=True, choices=LOLO_ST_PAYMENT_TYPE
    )
    location = models.ForeignKey(
        Location,
        related_name="st_payment_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="st_payment_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    class Meta:
        indexes = [
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_st_pmt_location_site",
            ),
        ]

    @classmethod
    def create(
        cls,
        date,
        bank_name,
        account_name,
        account_no,
        cheque_no,
        utr_no,
        quantity,
        amount,
        payment_type,
        location,
        site,
    ):
        try:
            payment = cls(bank_name=bank_name)
            payment.account_name = account_name
            payment.account_no = account_no
            payment.date = date
            payment.cheque_no = cheque_no
            payment.utr_no = utr_no
            payment.quantity = quantity
            payment.remaining = quantity
            payment.amount = amount
            payment.original_amount = amount
            payment.payment_type = payment_type
            payment.location = location
            payment.site = site
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def add_container(self, container, amount):
        try:
            self.container.add(container)
            self.remaining = self.remaining - 1
            self.amount = float(self.amount) - float(amount)
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def remove_container(self, container, amount):
        try:
            self.container.remove(container)
            self.remaining = self.remaining + 1
            self.amount = float(self.amount) + float(amount)
            self.save()

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_payment_details(self):
        try:
            data = {"pk": self.pk}
            if self.date is None:
                data["date"] = ""
            else:
                data["date"] = self.date
            if self.bank_name is None:
                data["bank_name"] = ""
            else:
                data["bank_name"] = self.bank_name
            if self.account_name is None:
                data["account_name"] = ""
            else:
                data["account_name"] = self.account_name
            if self.account_no is None:
                data["account_no"] = ""
            else:
                data["account_no"] = self.account_no
            if self.cheque_no is None:
                data["cheque_no"] = ""
            else:
                data["cheque_no"] = self.cheque_no
            if self.utr_no is None:
                data["utr_no"] = ""
            else:
                data["utr_no"] = self.utr_no
            if self.quantity is None:
                data["quantity"] = ""
            else:
                data["quantity"] = str(self.quantity)
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = [c.container_no for c in list(self.container.all())]
            if self.remaining is None:
                data["remaining"] = ""
            else:
                data["remaining"] = str(self.remaining)
            if self.amount is None:
                data["amount"] = ""
            else:
                data["amount"] = str(self.amount)
            if self.original_amount is None:
                data["original_amount"] = ""
            else:
                data["original_amount"] = str(self.original_amount)
            if self.payment_type is None:
                data["payment_type"] = ""
            else:
                data["payment_type"] = str(self.payment_type)
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class GateInHistory(models.Model):
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_date_updated = models.BooleanField(default=False)
    date = models.DateTimeField(null=True, blank=True, default=timezone.now)
    container = models.ForeignKey(
        Container,
        related_name="gin_history_container",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    eir = models.ForeignKey(
        Eir,
        related_name="gin_history_eir",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_in = models.ForeignKey(
        GateIn,
        related_name="gin_history_gate_in",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    lolo = models.ForeignKey(
        Handling,
        related_name="gin_history_lolo",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    lolo_payment = models.ForeignKey(
        HandlingPayment,
        related_name="gin_history_lolo_payment",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    st = models.ForeignKey(
        SelfTransportation,
        related_name="gin_history_self_transportation",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    st_payment = models.ForeignKey(
        SelfTransportationPayment,
        related_name="gin_history_self_transportation_payment",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    is_email_sent = models.BooleanField(null=True, blank=True, default=False)
    invoice_id = models.CharField(max_length=100, null=True, blank=True)
    is_msc_excel_edi_sent = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return self.container.container_no

    class Meta:
        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_gih_container_id"),
            models.Index(
                fields=["container_id", "gate_in_id"],
                name="idx_gih_container_gatein_id",
            ),
        ]


class GateOut(models.Model):
    container = models.ForeignKey(
        Container,
        related_name="container_gate_out_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_pass_no = models.CharField(max_length=50, null=True, blank=False)
    out_date = models.DateField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)
    condition = models.CharField(
        max_length=100, null=True, blank=True, choices=EIR_DAMAGE_CODE
    )
    grade = models.CharField(max_length=100, null=True, blank=True, choices=GRADE_CODE)
    departed = models.CharField(max_length=100, null=True, blank=True, choices=ARRIVED)
    destination = models.CharField(max_length=100, null=True, blank=True)
    consignee = models.CharField(max_length=100, null=True, blank=True)
    shipper = models.CharField(max_length=100, null=True, blank=True)
    delivery = models.CharField(max_length=100, null=True, blank=True)
    to_location_code = models.CharField(max_length=100, null=True, blank=True)
    road_rail_to_location_code = models.CharField(max_length=100, null=True, blank=True)
    to_depot_code = models.CharField(max_length=100, null=True, blank=True)
    to_port_code = models.CharField(max_length=100, null=True, blank=True)
    vessel_name = models.CharField(max_length=100, null=True, blank=True)
    voyage_no = models.CharField(max_length=100, null=True, blank=True)
    ro_ref = models.CharField(max_length=100, null=True, blank=True)
    export_cargo = models.CharField(max_length=100, null=True, blank=True)
    transporter_name = models.ForeignKey(
        Transporter,
        related_name="gate_out_transporter_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    vehicle_no = models.CharField(max_length=100, null=True, blank=True)
    driver_name = models.CharField(max_length=100, null=True, blank=True)
    driver_license = models.CharField(max_length=100, null=True, blank=True)
    driver_mobile_no = models.CharField(max_length=15, null=True, blank=True)
    carrier_code = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="gate_out_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    port_of_loading = models.CharField(max_length=100, null=True, blank=True)
    port_of_discharge = models.CharField(max_length=100, null=True, blank=True)
    booking_no = models.CharField(max_length=100, null=True, blank=True)
    booking_date = models.DateField(null=True, blank=True)
    booking_party = models.CharField(max_length=100, null=True, blank=True)
    seal_no = models.CharField(max_length=100, null=True, blank=True, unique=True)
    remarks = models.TextField(null=True, blank=True)
    do_s3_object_name = models.TextField(null=True, blank=True)
    do_s3_file_name = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(null=True, blank=True)
    pregateout_id = models.CharField(max_length=100, null=True, blank=True)
    driver_image_s3_object_name = models.TextField(null=True, blank=True)
    driver_image_s3_file_name = models.TextField(null=True, blank=True)
    is_driver_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    surveyor = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.container.container_no

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["container", "out_date", "out_time"],
                name="uniq_dep_gateout_combo",
            )
        ]

        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_gateout_container_id"),
            models.Index(fields=["is_verified"], name="idx_dep_gateout_is_verified"),
        ]

    @classmethod
    def create(
        cls,
        container,
        out_date,
        out_time,
        condition,
        grade,
        departed,
        destination,
        consignee,
        shipper,
        delivery,
        to_location_code,
        road_rail_to_location_code,
        to_depot_code,
        to_port_code,
        vessel_name,
        voyage_no,
        ro_ref,
        export_cargo,
        transporter_name,
        vehicle_no,
        driver_name,
        driver_license,
        driver_mobile_no,
        carrier_code,
        location,
        port_of_loading,
        port_of_discharge,
        booking_no,
        booking_date,
        booking_party,
        seal_no,
        remarks,
        surveyor,
    ):
        try:
            # TODO: gate_pass_no random according to format and eir date_time should be 15 min earlier then gateout
            #  date_time
            gate_out = cls(container=container)
            gate_out.out_date = out_date
            gate_out.out_time = out_time
            gate_out.condition = condition
            gate_out.grade = grade
            gate_out.departed = departed
            gate_out.destination = destination
            gate_out.consignee = consignee
            gate_out.shipper = shipper
            gate_out.delivery = delivery
            gate_out.to_location_code = to_location_code
            gate_out.road_rail_to_location_code = road_rail_to_location_code
            gate_out.to_depot_code = to_depot_code
            gate_out.to_port_code = to_port_code
            gate_out.vessel_name = vessel_name
            gate_out.voyage_no = voyage_no
            gate_out.ro_ref = ro_ref
            gate_out.export_cargo = export_cargo
            gate_out.transporter_name = transporter_name
            gate_out.vehicle_no = vehicle_no
            gate_out.driver_name = driver_name
            gate_out.driver_license = driver_license
            gate_out.driver_mobile_no = driver_mobile_no
            gate_out.carrier_code = carrier_code
            gate_out.location = location
            gate_out.port_of_loading = port_of_loading
            gate_out.port_of_discharge = port_of_discharge
            gate_out.booking_no = booking_no
            gate_out.booking_date = booking_date
            gate_out.booking_party = booking_party
            gate_out.seal_no = seal_no
            gate_out.remarks = remarks
            gate_out.surveyor = surveyor
            return gate_out
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def save_gate_pass_no(self, location):
        try:
            now = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            serial_no = str(self.pk).zfill(5)
            self.gate_pass_no = f"GOP/{location.code}/{now.year}/{serial_no}"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def get_gate_out(self):
        try:
            data = {"pk": self.pk}
            if self.gate_pass_no is None:
                data["gate_pass_no"] = ""
            else:
                data["gate_pass_no"] = self.gate_pass_no
            if self.container is None:
                data["container"] = ""
            else:
                data["container"] = self.container.get_container()["container_no"]
            if self.out_date is None:
                data["out_date"] = ""
            else:
                data["out_date"] = self.out_date.strftime("%Y-%m-%d")
            if self.out_time is None:
                data["out_time"] = ""
            else:
                data["out_time"] = self.out_time.strftime("%H:%M")
            if self.condition is None:
                data["condition"] = ""
            else:
                data["condition"] = self.condition
            if self.grade is None:
                data["grade"] = ""
            else:
                data["grade"] = self.grade
            if self.departed is None:
                data["departed"] = ""
            else:
                data["departed"] = self.departed
            if self.destination is None:
                data["destination"] = ""
            else:
                data["destination"] = self.destination
            if self.consignee is None:
                data["consignee"] = ""
            else:
                data["consignee"] = self.consignee
            if self.shipper is None:
                data["shipper"] = ""
            else:
                data["shipper"] = self.shipper
            if self.surveyor is None:
                data["surveyor"] = ""
            else:
                data["surveyor"] = self.surveyor
            if self.delivery is None:
                data["delivery"] = ""
            else:
                data["delivery"] = self.delivery
            if self.to_location_code is None:
                data["to_location_code"] = ""
            else:
                data["to_location_code"] = self.to_location_code
            if self.road_rail_to_location_code is None:
                data["road_rail_to_location_code"] = ""
            else:
                data["road_rail_to_location_code"] = self.road_rail_to_location_code
            if self.to_depot_code is None:
                data["to_depot_code"] = ""
            else:
                data["to_depot_code"] = self.to_depot_code
            if self.to_port_code is None:
                data["to_port_code"] = ""
            else:
                data["to_port_code"] = self.to_port_code
            if self.vessel_name is None:
                data["vessel_name"] = ""
            else:
                data["vessel_name"] = self.vessel_name
            if self.voyage_no is None:
                data["voyage_no"] = ""
            else:
                data["voyage_no"] = self.voyage_no
            if self.ro_ref is None:
                data["ro_ref"] = ""
            else:
                data["ro_ref"] = self.ro_ref
            if self.export_cargo is None:
                data["export_cargo"] = ""
            else:
                data["export_cargo"] = self.export_cargo
            if self.transporter_name is None:
                data["transporter_name"] = ""
                data["transporter_code"] = ""
            else:
                data["transporter_name"] = self.transporter_name.name
                if self.transporter_name.code is None:
                    data["transporter_code"] = ""
                else:
                    data["transporter_code"] = self.transporter_name.code
            if self.vehicle_no is None:
                data["vehicle_no"] = ""
            else:
                data["vehicle_no"] = self.vehicle_no
            if self.driver_name is None:
                data["driver_name"] = ""
            else:
                data["driver_name"] = self.driver_name
            if self.driver_license is None:
                data["driver_license"] = ""
            else:
                data["driver_license"] = self.driver_license
            if self.driver_mobile_no is None:
                data["driver_mobile_no"] = ""
            else:
                data["driver_mobile_no"] = self.driver_mobile_no
            if self.carrier_code is None:
                data["carrier_code"] = ""
            else:
                data["carrier_code"] = self.carrier_code
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.port_of_loading is None:
                data["port_of_loading"] = ""
            else:
                data["port_of_loading"] = self.port_of_loading
            if self.port_of_discharge is None:
                data["port_of_discharge"] = ""
            else:
                data["port_of_discharge"] = self.port_of_discharge
            if self.booking_no is None:
                data["booking_no"] = ""
            else:
                data["booking_no"] = self.booking_no
            if self.booking_date is None:
                data["booking_date"] = ""
            else:
                data["booking_date"] = self.booking_date
            if self.booking_party is None:
                data["booking_party"] = ""
            else:
                data["booking_party"] = self.booking_party
            if self.seal_no is None:
                data["seal_no"] = ""
            else:
                data["seal_no"] = self.seal_no
            if self.remarks is None:
                data["remarks"] = ""
            else:
                data["remarks"] = self.remarks
            if self.do_s3_object_name is None:
                data["do_uploaded"] = "NO"
            else:
                data["do_uploaded"] = "YES"

            if self.pregateout_id is None:
                data["pregateout_id"] = ""
            else:
                data["pregateout_id"] = self.pregateout_id
            if self.is_driver_img_uploaded:
                data["driver_img_uploaded"] = True
            else:
                data["driver_img_uploaded"] = False

            if self.driver_image_s3_object_name:
                data["image_link"] = (
                    f"https://{AWS_REPAIR_IMAGE_BUCKET_NAME}.s3.amazonaws.com/{self.driver_image_s3_object_name}"
                )
            else:
                data["image_link"] = ""
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class GateOutHistory(models.Model):
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_date_updated = models.BooleanField(default=False)
    date = models.DateTimeField(null=True, blank=True, default=timezone.now)
    container = models.ForeignKey(
        Container,
        related_name="gout_history_container",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    eir = models.ForeignKey(
        Eir,
        related_name="gout_history_eir",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_out = models.ForeignKey(
        GateOut,
        related_name="gout_history_gate_out",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    lolo = models.ForeignKey(
        Handling,
        related_name="gout_history_lolo",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    lolo_payment = models.ForeignKey(
        HandlingPayment,
        related_name="gout_history_lolo_payment",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    st = models.ForeignKey(
        SelfTransportation,
        related_name="gout_history_self_transportation",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    st_payment = models.ForeignKey(
        SelfTransportationPayment,
        related_name="gout_history_self_transportation_payment",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    is_email_sent = models.BooleanField(null=True, blank=True, default=False)
    invoice_id = models.CharField(max_length=100, null=True, blank=True)
    is_msc_excel_edi_sent = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return self.container.container_no

    class Meta:
        indexes = [
            models.Index(fields=["container_id"], name="idx_dep_goh_container_id"),
        ]


STOCK_STATUS = [
    ("Survey Pending", "Survey Pending"),
    ("Estimate Pending", "Estimate Pending"),
    ("Approval Pending", "Approval Pending"),
    ("Approved", "Approved"),
    ("Under Repairing", "Under Repairing"),
    ("Empty Alloted", "Empty Alloted"),
    ("Without_Repair_Available", "Without_Repair_Available"),
    ("Available", "Available"),
    ("Alloted", "Alloted"),
]

STOCK_STAGE = [
    ("Survey", "Survey"),
    ("Estimate", "Estimate"),
    ("Approval", "Approval"),
    ("Repair", "Repair"),
    ("Available", "Available"),
]

ESTIMATE_STATUS = [
    ("ESTIMATE SENT", "ESTIMATE SENT"),
    ("APPROVED", "APPROVED"),
    (
        "APPROVED & POST REPAIR IMAGES REQUIRED",
        "APPROVED & POST REPAIR IMAGES REQUIRED",
    ),
    ("REJECTED", "REJECTED"),
    ("CANCEL", "CANCEL"),
    ("PARTIALLY", "PARTIALLY"),
]
REPAIR_STATUS = [
    ("Placement", "Placement"),
    ("Complete", "Complete"),
]


class ContainerStock(models.Model):
    gate_in = models.ForeignKey(
        GateIn,
        related_name="container_stock_gate_in",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_out = models.ForeignKey(
        GateOut,
        related_name="container_stock_gate_out",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    container = models.ForeignKey(
        Container,
        related_name="container_in_stock",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    grade = models.CharField(max_length=100, null=True, blank=True, choices=GRADE_CODE)
    status = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        choices=STOCK_STATUS,
        default="Estimate Pending",
    )
    stage = models.CharField(
        max_length=200, null=True, blank=True, choices=STOCK_STAGE, default="Survey"
    )
    empty_allotment_date = models.DateField(null=True, blank=True)
    allotment_date = models.DateField(null=True, blank=True)
    booking_no = models.CharField(max_length=200, null=True, blank=True)
    seal_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    container_status = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS, default="IN"
    )

    survey_date = models.DateField(null=True, blank=True)
    survey_time = models.TimeField(null=True, blank=True)

    estimate_date = models.DateField(null=True, blank=True)
    estimate_time = models.TimeField(null=True, blank=True)

    approval_date = models.DateField(null=True, blank=True)
    approval_time = models.TimeField(null=True, blank=True)

    repair_date = models.DateField(null=True, blank=True)
    repair_time = models.TimeField(null=True, blank=True)

    available_date = models.DateField(null=True, blank=True)
    available_time = models.TimeField(null=True, blank=True)

    # for reports status sheet
    survey_pending_in_date_time = models.DateTimeField(null=True, blank=True)
    survey_pending_out_date_time = models.DateTimeField(null=True, blank=True)
    estimate_pending_in_date_time = models.DateTimeField(null=True, blank=True)
    estimate_pending_out_date_time = models.DateTimeField(null=True, blank=True)
    approval_pending_in_date_time = models.DateTimeField(null=True, blank=True)
    approval_pending_out_date_time = models.DateTimeField(null=True, blank=True)
    approved_in_date_time = models.DateTimeField(null=True, blank=True)
    approved_out_date_time = models.DateTimeField(null=True, blank=True)
    under_repair_in_date_time = models.DateTimeField(null=True, blank=True)
    under_repair_out_date_time = models.DateTimeField(null=True, blank=True)
    empty_allotment_in_date_time = models.DateTimeField(null=True, blank=True)
    empty_allotment_out_date_time = models.DateTimeField(null=True, blank=True)
    available_in_date_time = models.DateTimeField(null=True, blank=True)
    available_out_date_time = models.DateTimeField(null=True, blank=True)
    allotment_in_date_time = models.DateTimeField(null=True, blank=True)
    allotment_out_date_time = models.DateTimeField(null=True, blank=True)

    # mnr
    estimate_status = models.CharField(
        max_length=200, null=True, blank=True, choices=ESTIMATE_STATUS
    )
    is_estimate_westim_sent = models.BooleanField(null=True, blank=True, default=False)
    is_repair_destim_sent = models.BooleanField(null=True, blank=True, default=False)

    # for groundRent
    ground_rent_last_invoice_date = models.DateField(null=True, blank=True)
    invoice_id = models.CharField(max_length=100, null=True, blank=True)

    # cma edi
    is_rwm_edi_sent = models.BooleanField(null=True, blank=True, default=False)
    # is_gate_in_data_imported = models.BooleanField(null=True, blank=True, default=False)
    is_survey_import_available = models.BooleanField(
        null=True, blank=True, default=False
    )
    is_mnr_data_imported = models.BooleanField(null=True, blank=True, default=False)
    pre_mnr_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    pre_mnr_img_uploaded_to_ftp = models.BooleanField(
        null=True, blank=True, default=False
    )
    pre_mnr_edi_uploaded_to_ftp = models.BooleanField(
        null=True, blank=True, default=False
    )
    post_mnr_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    post_mnr_img_uploaded_to_ftp = models.BooleanField(
        null=True, blank=True, default=False
    )
    post_mnr_edi_uploaded_to_ftp = models.BooleanField(
        null=True, blank=True, default=False
    )
    is_zim_repair_sent = models.BooleanField(null=True, blank=True, default=False)
    usa_approval_container = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return self.container.container_no

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["container", "gate_in"], name="uniq_dep_stock_combo"
            )
        ]

        indexes = [
            models.Index(fields=["status"], name="idx_dep_stock_status"),
            models.Index(fields=["container_id"], name="idx_dep_stock_container_id"),
            models.Index(
                fields=["container_id", "gate_in_id"], name="idx_stock_gatein_id"
            ),
            models.Index(
                fields=["container_id", "gate_out_id"], name="idx_stock_gateout_id"
            ),
        ]

    @classmethod
    def create(cls, gate_in, container, grade):
        try:
            stock = cls(gate_in=gate_in)
            stock.container = container
            stock.grade = grade
            stock.survey_pending_in_date_time = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            return stock
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def make_available(self):
        try:
            self.available_date = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )
            self.container.make_it_available()
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def make_not_available(self):
        try:
            self.available_date = None
            self.container.make_it_unavailable()
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False

    def make_out_of_stock(self):
        try:
            self.container_status = "OUT"
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def replace_none(self, dict_data):
        try:
            for key in dict_data:
                if dict_data[key] is None:
                    dict_data[key] = ""
            return dict_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_stock(self):
        try:
            data = {
                "pk": self.pk,
                "client": self.container.client.name,
                "line": self.container.client.ref_code,
                "gate_in": self.gate_in.in_date.strftime("%d/%m/%Y"),
                "container_no": self.container.container_no,
                "container_no_is_valid": (
                    "True"
                    if self.container.is_valid is None
                    else self.container.is_valid
                ),
                "type": self.container.type.name,
                "size": self.container.size.name,
                "is_estimate_westim_sent": self.is_estimate_westim_sent,
                "is_repair_destim_sent": self.is_repair_destim_sent,
                "container_status": self.container_status,
                "usa_approval_container": self.usa_approval_container,
            }
            cal = ""
            if not self.gate_out is None:
                cal = self.gate_out.out_date - self.gate_in.in_date
            else:
                cal = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                    - self.gate_in.in_date
                )

            data["aging"] = str(cal.days)

            if self.gate_out is None:
                data["gate_out"] = ""
            else:
                data["gate_out"] = self.gate_out.out_date.strftime("%d/%m/%Y")

            if self.grade is None:
                data["grade"] = ""
            else:
                data["grade"] = self.grade
            if self.status is None:
                data["status"] = ""
            else:
                data["status"] = self.status
            if self.empty_allotment_date is None:
                data["empty_allotment_date"] = ""
            else:
                data["empty_allotment_date"] = self.empty_allotment_date.strftime(
                    "%d/%m/%Y"
                )
            if self.allotment_date is None:
                data["allotment_date"] = ""
                data["is_alloted"] = "False"
            else:
                data["allotment_date"] = self.allotment_date.strftime("%d/%m/%Y")
                data["is_alloted"] = "True"
            if self.booking_no is None:
                data["booking_no"] = ""
            else:
                data["booking_no"] = self.booking_no
            if self.seal_no is None:
                data["seal_no"] = ""
            else:
                data["seal_no"] = self.seal_no
            data["in_do_not_lift_queue"] = str(self.container.in_do_not_lift_queue)
            data["remarks"] = self.gate_in.remarks

            if self.survey_date is None:
                data["survey_date"] = ""
            else:
                data["survey_date"] = self.survey_date.strftime("%d/%m/%Y")
            if self.survey_time is None:
                data["survey_time"] = ""
            else:
                data["survey_time"] = self.survey_time.strftime("%I:%M %p")

            if self.estimate_date is None:
                data["estimate_date"] = ""
            else:
                data["estimate_date"] = self.estimate_date.strftime("%d/%m/%Y")
            if self.estimate_time is None:
                data["estimate_time"] = ""
            else:
                data["estimate_time"] = self.estimate_time.strftime("%I:%M %p")

            if self.approval_date is None:
                data["approval_date"] = ""
            else:
                data["approval_date"] = self.approval_date.strftime("%d/%m/%Y")
            if self.approval_time is None:
                data["approval_time"] = ""
            else:
                data["approval_time"] = self.approval_time.strftime("%I:%M %p")

            if self.repair_date is None:
                data["repair_date"] = ""
            else:
                data["repair_date"] = self.repair_date.strftime("%d/%m/%Y")
            if self.repair_time is None:
                data["repair_time"] = ""
            else:
                data["repair_time"] = self.repair_time.strftime("%I:%M %p")

            if self.available_date is None:
                data["available_date"] = ""
            else:
                data["available_date"] = self.available_date.strftime("%d/%m/%Y")
            if self.available_time is None:
                data["available_time"] = ""
            else:
                data["available_time"] = self.available_time.strftime("%I:%M %p")
            data = self.replace_none(data)

            if self.container.automatic_mnr_status_change is None:
                data["automatic_mnr_status_change"] = ""
            else:
                data["automatic_mnr_status_change"] = str(
                    self.container.automatic_mnr_status_change
                )
            if self.gate_in.remarks is None:
                data["remarks"] = ""
            else:
                data["remarks"] = self.gate_in.remarks

            if self.container.queued_recently is None:
                data["queued_recently"] = ""
            else:
                data["queued_recently"] = self.container.queued_recently

            if self.container.do_not_lift_remarks is None:
                data["do_not_lift_remarks"] = ""
            else:
                data["do_not_lift_remarks"] = self.container.do_not_lift_remarks

            sealno_list = []
            try:
                sealno_list = (
                    SealNo.objects.select_related("location", "site")
                    .filter(
                        is_available=True,
                        is_damaged=False,
                        is_cut=False,
                        in_use=False,
                        location=self.container.location,
                        site=self.container.site,
                        line=self.container.client.ref_code,
                    )
                    .values_list("number", flat=True)
                )
            except:
                pass
            data["sealno_list"] = sealno_list

            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_mnr_container_header_data(self):
        try:
            data = {
                "stock_id": self.pk,
                "location": self.container.location.name,
                "site": self.container.site.name,
                "container_status": self.container_status,
                "line": self.container.client.ref_code,
                "client": self.container.client.name,
                "in_date": self.gate_in.in_date.strftime("%d/%m/%Y"),
                "manufacturing_date": self.container.manufacturing_date.strftime(
                    "%Y-%m-%d"
                ),
                "condition": self.gate_in.condition,
                "grade": self.grade,
                "container_no": self.container.container_no,
                "size_type": f"{self.container.size.name} / {self.container.type.name}",
                "type": f"{self.container.type.name}",
                "size": f"{self.container.size.name}",
                "is_estimate_westim_sent": f"{self.is_estimate_westim_sent} | {self.pre_mnr_edi_uploaded_to_ftp}",
                "is_repair_destim_sent": f"{self.is_repair_destim_sent} | {self.post_mnr_edi_uploaded_to_ftp}",
                "is_survey_import_available": self.is_survey_import_available,
                "is_mnr_data_imported": self.is_mnr_data_imported,
                "pre_mnr_img_uploaded": f"{self.pre_mnr_img_uploaded} | {self.pre_mnr_img_uploaded_to_ftp}",
                "post_mnr_img_uploaded": f"{self.post_mnr_img_uploaded} | {self.post_mnr_img_uploaded_to_ftp}",
                "mnr_ftp_upload": self.container.site.mnr_ftp_upload,
            }
            cal = ""
            if not self.gate_out is None:
                cal = self.gate_out.out_date - self.gate_in.in_date
            else:
                cal = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                    - self.gate_in.in_date
                )
            data["aging"] = str(cal.days)

            if self.gate_out is None:
                data["gate_out"] = ""
            else:
                data["gate_out"] = self.gate_out.out_date.strftime("%d/%m/%Y")
            if self.status is None:
                data["status"] = ""
            else:
                data["status"] = self.status

            if self.stage is None:
                data["stage"] = ""
            else:
                data["stage"] = self.stage

            if self.container.automatic_mnr_status_change is None:
                data["automatic_mnr_status_change"] = ""
            else:
                data["automatic_mnr_status_change"] = str(
                    self.container.automatic_mnr_status_change
                )

            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_pregateout_prefill_data(self):
        try:
            data = {
                "stock_id": self.pk,
                "bk_no": self.booking_no,
                "location": self.container.location.name,
                "site": self.container.site.name,
                "shipping_line": self.container.client.ref_code,
                "client": self.container.client.name,
                "manufacturing_date": self.container.manufacturing_date.strftime(
                    "%Y-%m-%d"
                ),
                "container_no": self.container.container_no,
                "type": f"{self.container.type.name}",
                "size": f"{self.container.size.name}",
            }
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_stock_for_grid(self):
        try:
            data = {
                "pk": self.pk,
                "client": self.container.client.name,
                "line": self.container.client.ref_code,
                "gate_in": self.gate_in.in_date.strftime("%d/%m/%Y"),
                "container_no": self.container.container_no,
                "type": (
                    self.container.type.name if self.container.type is not None else ""
                ),
                "size": (
                    self.container.size.name if self.container.size is not None else ""
                ),
                "condition": (
                    "" if self.gate_in.condition is None else self.gate_in.condition
                ),
                "is_estimate_westim_sent": f"{'Yes' if self.is_estimate_westim_sent else 'No'} | {'Yes' if self.pre_mnr_edi_uploaded_to_ftp else 'No'}",
                "is_repair_destim_sent": f"{'Yes' if self.is_repair_destim_sent else 'No'} | {'Yes' if self.post_mnr_edi_uploaded_to_ftp else 'No'}",
                "is_survey_import_available": self.is_survey_import_available,
                "is_mnr_data_imported": self.is_mnr_data_imported,
                "pre_mnr_img_uploaded": f"{'Yes' if self.pre_mnr_img_uploaded else 'No'} | {'Yes' if self.pre_mnr_img_uploaded_to_ftp else 'No'}",
                "post_mnr_img_uploaded": f"{'Yes' if self.post_mnr_img_uploaded else 'No'} | {'Yes' if self.post_mnr_img_uploaded_to_ftp else 'No'}",
            }

            cal = ""
            if not self.gate_out is None:
                cal = self.gate_out.out_date - self.gate_in.in_date
            else:
                cal = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                    - self.gate_in.in_date
                )
            data["aging"] = str(cal.days)

            if self.estimate_status is None:
                data["estimate_status"] = ""
            else:
                data["estimate_status"] = self.estimate_status

            if self.gate_out is None:
                data["gate_out"] = ""
            else:
                data["gate_out"] = self.gate_out.out_date.strftime("%d/%m/%Y")

            if self.gate_in.arrived is None:
                data["mode"] = ""
            else:
                data["mode"] = self.gate_in.arrived

            if self.status is None:
                data["status"] = ""
            else:
                data["status"] = self.status

            if self.stage is None:
                data["stage"] = ""
            else:
                data["stage"] = self.stage

            if self.survey_date is None:
                data["survey_date"] = ""
            else:
                data["survey_date"] = self.survey_date.strftime("%d/%m/%Y")
            if self.survey_time is None:
                data["survey_time"] = ""
            else:
                data["survey_time"] = self.survey_time.strftime("%I:%M %p")

            if self.estimate_date is None:
                data["estimate_date"] = ""
            else:
                data["estimate_date"] = self.estimate_date.strftime("%d/%m/%Y")
            if self.estimate_time is None:
                data["estimate_time"] = ""
            else:
                data["estimate_time"] = self.estimate_time.strftime("%I:%M %p")

            if self.approval_date is None:
                data["approval_date"] = ""
            else:
                data["approval_date"] = self.approval_date.strftime("%d/%m/%Y")
            if self.approval_time is None:
                data["approval_time"] = ""
            else:
                data["approval_time"] = self.approval_time.strftime("%I:%M %p")

            if self.repair_date is None:
                data["repair_date"] = ""
            else:
                data["repair_date"] = self.repair_date.strftime("%d/%m/%Y")
            if self.repair_time is None:
                data["repair_time"] = ""
            else:
                data["repair_time"] = self.repair_time.strftime("%I:%M %p")

            if self.available_date is None:
                data["available_date"] = ""
            else:
                data["available_date"] = self.available_date.strftime("%d/%m/%Y")
            if self.available_time is None:
                data["available_time"] = ""
            else:
                data["available_time"] = self.available_time.strftime("%I:%M %p")

            if self.container.automatic_mnr_status_change is None:
                data["automatic_mnr_status_change"] = ""
            else:
                data["automatic_mnr_status_change"] = str(
                    self.container.automatic_mnr_status_change
                )

            data = self.replace_none(data)
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ContainerAllotment(models.Model):
    booking_date = models.DateField(null=True, blank=True)
    booking_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    booking_party = models.CharField(max_length=200, null=True, blank=True)
    validity_date = models.DateField(null=True, blank=True)
    container = models.ManyToManyField(
        Container, related_name="container_alloted_rel", blank=True
    )
    quantity = models.IntegerField(null=True, blank=True)
    remaining = models.IntegerField(null=True, blank=True)
    remarks = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return str(self.booking_no)

    class Meta:
        indexes = [
            models.Index(fields=["booking_no"], name="idx_dep_allotment_booking_no"),
        ]

    @classmethod
    def create(
        cls, booking_date, booking_no, booking_party, validity_date, quantity, remarks
    ):
        try:
            allotment = cls(booking_no=booking_no)
            allotment.booking_date = booking_date
            allotment.booking_party = booking_party
            allotment.validity_date = validity_date
            allotment.quantity = quantity
            allotment.remaining = quantity
            allotment.remarks = remarks
            return allotment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def add_container(self, container):
        try:
            self.container.add(container)
            self.remaining = int(self.quantity) - int(self.container.all().count())
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def remove_container(self, container):
        try:
            self.container.remove(container)
            self.remaining = int(self.quantity) - int(self.container.all().count())
            self.save()
            if self.container.all().count() == 0:
                self.delete()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    # def check_expiry(self):
    #     try:
    #         out_list = [each for each in self.container.all() if each.status == "OUT"]
    #         if len(out_list) == len(self.container.all()):
    #             return True
    #         else:
    #             return False
    #     except:
    #         return None

    def get_allotment(self):
        try:
            data = {"pk": self.pk}
            if self.booking_date is None:
                data["booking_date"] = ""
            else:
                data["booking_date"] = self.booking_date.strftime("%Y-%m-%d")
            if self.validity_date is None:
                data["validity_date"] = ""
            else:
                data["validity_date"] = self.validity_date.strftime("%Y-%m-%d")
            if self.booking_no is None:
                data["booking_no"] = ""
            else:
                data["booking_no"] = self.booking_no
            if self.booking_party is None:
                data["booking_party"] = ""
            else:
                data["booking_party"] = self.booking_party
            if self.quantity is None:
                data["quantity"] = ""
            else:
                data["quantity"] = str(self.quantity)
            if self.remaining is None:
                data["remaining"] = ""
            else:
                data["remaining"] = str(self.remaining)
            if self.container is None:
                data["container_list"] = ""
            else:
                data["container_list"] = [
                    c.container_no for c in list(self.container.all())
                ]
            if self.remarks is None:
                data["remarks"] = ""
            else:
                data["remarks"] = self.remarks
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ContainerInOutRecord(models.Model):
    container = models.ForeignKey(
        Container,
        related_name="container_data_record_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    in_data = models.ForeignKey(
        GateInHistory,
        related_name="in_data_record_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    out_data = models.ForeignKey(
        GateOutHistory,
        related_name="out_data_record_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    in_patched = models.BooleanField(null=True, blank=True, default=False)
    out_patched = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.container.container_no)


class AllotmentTracker(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    booking_date = models.DateField()
    booking_no = models.CharField(max_length=255)
    container_no = models.CharField(max_length=255)
    stock_id = models.CharField(max_length=255)
    replaced_container_no = models.CharField(max_length=255, blank=True, null=True)
    replaced_stock_id = models.CharField(max_length=255, blank=True, null=True)
    booking_canceled = models.BooleanField(default=False)
    replaced = models.BooleanField(default=False)
    location = models.ForeignKey(
        Location,
        related_name="allotment_tracker_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="allotment_tracker_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.booking_no

    @classmethod
    def create_allotment_tracker(
        cls,
        location,
        site,
        booking_date,
        booking_no,
        container_no,
        stock_id,
        replaced_container_no=None,
        replaced_stock_id=None,
        booking_canceled=False,
        replaced=False,
    ):
        return cls.objects.create(
            booking_date=booking_date,
            booking_no=booking_no,
            container_no=container_no,
            stock_id=stock_id,
            replaced_container_no=replaced_container_no,
            replaced_stock_id=replaced_stock_id,
            booking_canceled=booking_canceled,
            replaced=replaced,
            location=location,
            site=site,
        )


class EnBlockMovement(models.Model):
    line = models.CharField(max_length=100)
    job_order_no = models.CharField(max_length=50)
    vessel_no = models.CharField(max_length=100)
    voyage_no = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)
    gate_ins = models.IntegerField(default=0)
    pendency = models.IntegerField(default=0)
    discarded = models.IntegerField(default=0)
    location = models.ForeignKey(
        Location,
        related_name="en_block_movement_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="en_block_movement_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.job_order_no


class EnBlockPreGateIn(models.Model):
    line = models.CharField(max_length=100)
    size = models.CharField(max_length=10)
    type = models.CharField(max_length=20)
    container_no = models.CharField(max_length=20)
    is_processed = models.BooleanField(default=False)
    is_discarded = models.BooleanField(default=False)
    remarks = models.TextField(blank=True, null=True)
    en_block = models.ForeignKey(
        EnBlockMovement,
        related_name="en_block_pre_gate_in_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.container_no


class ManufacturingDateLog(models.Model):
    container_no = models.CharField(max_length=20)
    previous_manufacturing_date = models.DateField(null=True, blank=True)
    current_manufacturing_date = models.DateField(null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="manufacturing_date_log_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="manufacturing_date_log_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    changed_by = models.ForeignKey(
        AccountUser,
        related_name="manufacturing_date_log_user_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    updated_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.container_no


# class DriverDetails(models.Model):
#     container_no = models.CharField(max_length=10)
#     name = models.CharField(max_length=255)
#     licence_no = models.CharField(max_length=255)
#     mobile_no = models.CharField(max_length=255)
#     s3_object_name = models.TextField(null=True, blank=True)
#     s3_file_name = models.TextField(null=True, blank=True)
#     process = models.CharField(null=True, blank=True, choices=[("IN", "IN"), ("OUT", "OUT")])
#     is_used = models.BooleanField(null=True, blank=True, default=False)

#     def __str__(self):
#         return self.name


def delete_handling_payment(**kwargs):
    container = kwargs["instance"]
    for each in container.container_handling_payment_rel.all():
        if each.container.all().count() == 0:
            each.delete()
        else:
            pass
    return True


def delete_self_transportation_payment(**kwargs):
    container = kwargs["instance"]
    for each in container.container_self_transportation_payment_rel.all():
        if each.container.all().count() == 0:
            each.delete()
        else:
            pass
    return True


def delete_allotment_object(**kwargs):
    container = kwargs["instance"]
    for each in container.container_alloted_rel.all():
        if each.container.all().count() == 0:
            each.delete()
        else:
            pass
    return True


@receiver(post_save, sender=ContainerStock)
def detect_usa_approval_from_stock_object(**kwargs):
    try:
        stock = kwargs["instance"]
        if getattr(stock, "_is_saving", False):
            return
        stock._is_saving = True
        tz = timezone.get_current_timezone()
        five_years_ago = datetime.datetime.now().astimezone(tz).date() - relativedelta(
            years=5
        )
        if (
            stock.container.manufacturing_date > five_years_ago
            and stock.container_status == "IN"
            and stock.container.status == "IN"
            and stock.grade in ["A", "B+"]
        ):
            stock.usa_approval_container = True
            stock.save(update_fields=["usa_approval_container"])
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
    finally:
        if hasattr(stock, "_is_saving"):
            del stock._is_saving


signals.post_delete.connect(receiver=delete_handling_payment, sender=Container)
signals.post_delete.connect(
    receiver=delete_self_transportation_payment, sender=Container
)
signals.post_delete.connect(receiver=delete_allotment_object, sender=Container)
signals.post_save.connect(
    receiver=detect_usa_approval_from_stock_object, sender=ContainerStock
)
