from django.db import models
from master.models_two import Client, ClientAbbreviation
from master.models import ContainerType, ContainerSize, Location, Site
import datetime
from django.utils import timezone
import traceback, logging

CONTAINER_STATUS = [("IN", "IN"), ("OUT", "OUT")]

CONDITION_CODE = [
    ("OK", "OK"),
    ("CLEANING", "CLEANING"),
    ("LD", "LD"),
    ("MD", "MD"),
    ("HD", "HD"),
    ("AV", "AV"),
    ("AR", "AR"),
    ("DM", "DM"),
]

GRADE_CODE = [("A", "A"), ("B", "B"), ("C", "C"), ("D", "D"), ("E", "E"), ("F", "F")]

ARRIVED = [
    ("Factory", "Factory"),
    ("Road/Rail", "Road/Rail"),
    ("FS RETURN", "FS RETURN"),
    ("CFS/ICD", "CFS/ICD"),
    ("Port/Vessel", "Port/Vessel"),
]


class NonDepotContainer(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="non_depot_container_client_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    type = models.ForeignKey(
        ContainerType,
        related_name="non_depot_container_type_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="non_depot_container_size_rel",
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
        related_name="non_depot_container_shipping_line_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    dock_destuff = models.CharField(max_length=100, null=True, blank=True)
    mode = models.CharField(max_length=100, null=True, blank=True, choices=ARRIVED)
    is_available = models.BooleanField(null=True, blank=True)
    is_valid = models.BooleanField(null=True, blank=True, default=True)
    status = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )
    location = models.ForeignKey(
        Location,
        related_name="non_depot_container_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="non_depot_container_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    condition = models.CharField(
        max_length=100, null=True, blank=True, choices=CONDITION_CODE
    )
    grade = models.CharField(max_length=100, null=True, blank=True, choices=GRADE_CODE)
    automatic_mnr_status_change = models.BooleanField(null=True, blank=True)
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
                name="uniq_non_dep_ctn_combo",
            )
        ]

        indexes = [
            models.Index(fields=["container_no"], name="idx_non_dep_ctn_no"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_non_dep_ctn_loc_site",
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
        dock_destuff,
        mode,
        condition,
        grade,
        automatic_mnr_status_change,
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
            container.dock_destuff = dock_destuff
            container.mode = mode
            container.status = "IN"
            container.is_available = False
            container.condition = condition
            container.grade = grade
            container.automatic_mnr_status_change = automatic_mnr_status_change
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
            data = {"container_pk": self.pk}
            if self.client is None:
                data["client"] = ""
            else:
                data["client"] = self.client.name
            if self.type is None:
                data["type"] = ""
            else:
                data["type"] = self.type.name
            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size.name
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
                data["shipping_line"] = self.shipping_line.name

            if self.automatic_mnr_status_change is None:
                data["automatic_mnr_status_change"] = ""
            else:
                data["automatic_mnr_status_change"] = str(
                    self.automatic_mnr_status_change
                )

            if self.mode is None:
                data["mode"] = ""
            else:
                data["mode"] = self.mode

            if self.dock_destuff is None:
                data["dock_destuff"] = ""
            else:
                data["dock_destuff"] = self.dock_destuff

            if self.is_valid is None:
                data["is_valid"] = "True"
            else:
                data["is_valid"] = str(self.is_valid)

            if self.condition is None:
                data["condition"] = ""
            else:
                data["condition"] = self.condition
            if self.grade is None:
                data["grade"] = ""
            else:
                data["grade"] = self.grade

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


class NonDepotGateIn(models.Model):
    container = models.ForeignKey(
        NonDepotContainer,
        related_name="non_depot_gate_in_container_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    in_date = models.DateField(null=True, blank=True)
    in_time = models.TimeField(null=True, blank=True)
    is_msc_excel_edi_sent = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return self.container.container_no

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["container", "in_date", "in_time"],
                name="uniq_non_dep_gatein_combo",
            )
        ]

        indexes = [
            models.Index(fields=["container_id"], name="idx_non_dep_gatein_ctn_id"),
        ]

    @classmethod
    def create(cls, container, in_date, in_time):
        try:
            gate_in = cls(container=container)
            gate_in.in_date = in_date
            gate_in.in_time = in_time
            return gate_in
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_gate_in(self):
        try:
            data = {"gate_in_pk": self.pk}
            if self.container is None:
                data["container_no"] = ""
            else:
                data["container_no"] = self.container.container_no
            if self.in_date is None:
                data["in_date"] = ""
            else:
                data["in_date"] = self.in_date.strftime("%Y-%m-%d")
            if self.in_time is None:
                data["in_time"] = ""
            else:
                data["in_time"] = self.in_time.strftime("%H:%M")
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class NonDepotGateOut(models.Model):
    container = models.ForeignKey(
        NonDepotContainer,
        related_name="non_depot_gate_out_container_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    out_date = models.DateField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)
    is_msc_excel_edi_sent = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return self.container.container_no

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["container", "out_date", "out_time"],
                name="uniq_non_dep_gateout_combo",
            )
        ]

        indexes = [
            models.Index(fields=["container_id"], name="idx_non_dep_gateout_ctn_id"),
        ]

    @classmethod
    def create(cls, container, out_date, out_time):
        try:
            gate_out = cls(container=container)
            gate_out.out_date = out_date
            gate_out.out_time = out_time
            return gate_out
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_gate_out(self):
        try:
            data = {"gate_out_pk": self.pk}
            if self.container is None:
                data["container_no"] = ""
            else:
                data["container_no"] = self.container.container_no
            if self.out_date is None:
                data["out_date"] = ""
            else:
                data["out_date"] = self.out_date.strftime("%Y-%m-%d")
            if self.out_time is None:
                data["out_time"] = ""
            else:
                data["out_time"] = self.out_time.strftime("%H:%M")
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


STOCK_STATUS = [
    ("Survey Pending", "Survey Pending"),
    ("Estimate Pending", "Estimate Pending"),
    ("Approval Pending", "Approval Pending"),
    ("Approved", "Approved"),
    ("Under Repairing", "Under Repairing"),
    ("Available", "Available"),
]

STOCK_STAGE = [
    ("Survey", "Survey"),
    ("Estimate", "Estimate"),
    ("Approval", "Approval"),
    ("Repair", "Repair"),
    ("Available", "Available"),
]

ESTIMATE_STATUS = [
    ("APPROVED", "APPROVED"),
    ("REJECTED", "REJECTED"),
    ("CANCEL", "CANCEL"),
    ("PARTIALLY", "PARTIALLY"),
]
REPAIR_STATUS = [
    ("Placement", "Placement"),
    ("Complete", "Complete"),
]


class NonDepotContainerStock(models.Model):
    gate_in = models.ForeignKey(
        NonDepotGateIn,
        related_name="non_depot_container_stock_gate_in",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_out = models.ForeignKey(
        NonDepotGateOut,
        related_name="non_depot_container_stock_gate_out",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    container = models.ForeignKey(
        NonDepotContainer,
        related_name="non_depot_container_in_stock",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    status = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        choices=STOCK_STATUS,
        default="Survey Pending",
    )
    stage = models.CharField(
        max_length=200, null=True, blank=True, choices=STOCK_STAGE, default="Survey"
    )
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

    available_in_date_time = models.DateTimeField(null=True, blank=True)
    available_out_date_time = models.DateTimeField(null=True, blank=True)

    # mnr
    estimate_status = models.CharField(
        max_length=200, null=True, blank=True, choices=ESTIMATE_STATUS
    )
    is_estimate_westim_sent = models.BooleanField(null=True, blank=True, default=False)
    is_repair_destim_sent = models.BooleanField(null=True, blank=True, default=False)
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

    def __str__(self):
        return self.container.container_no

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["container", "gate_in"], name="uniq_non_dep_stock_combo"
            )
        ]

        indexes = [
            models.Index(fields=["status"], name="idx_non_dep_stock_status"),
            models.Index(
                fields=["container_id"], name="idx_non_dep_stock_container_id"
            ),
            models.Index(
                fields=["container_id", "gate_in_id"],
                name="idx_non_dep_stock_gatein_id",
            ),
            models.Index(
                fields=["container_id", "gate_out_id"],
                name="idx_non_dep_stock_gateout_id",
            ),
        ]

    @classmethod
    def create(cls, gate_in, container):
        try:
            stock = cls(gate_in=gate_in)
            stock.container = container
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

    def get_mnr_container_header_data(self):
        try:
            data = {
                "stock_id": self.pk,
                "location": self.container.location.name,
                "site": self.container.site.name,
                "container_status": self.container_status,
                "line": self.container.client.ref_code,
                "in_date": self.gate_in.in_date.strftime("%d/%m/%Y"),
                "container_no": self.container.container_no,
                "size_type": f"{self.container.size.name} / {self.container.type.name}",
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

    def get_stock_for_grid(self):
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
                "condition": (
                    "" if self.container.condition is None else self.container.condition
                ),
                "size": self.container.size.name,
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

            if self.gate_out is None:
                data["gate_out"] = ""
            else:
                data["gate_out"] = self.gate_out.out_date.strftime("%d/%m/%Y")

            if self.estimate_status is None:
                data["estimate_status"] = ""
            else:
                data["estimate_status"] = self.estimate_status

            if self.container.mode is None:
                data["mode"] = ""
            else:
                data["mode"] = self.container.mode

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


class NonDepotContainerInOutRecord(models.Model):
    container = models.ForeignKey(
        NonDepotContainer,
        related_name="non_depot_container_record",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_in = models.ForeignKey(
        NonDepotGateIn,
        related_name="non_depot_container_in_record",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    gate_out = models.ForeignKey(
        NonDepotGateOut,
        related_name="non_depot_container_out_record",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.container.container_no
