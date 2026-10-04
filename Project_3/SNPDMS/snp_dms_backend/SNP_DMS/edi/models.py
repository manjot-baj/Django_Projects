from django.db import models
from django.utils import timezone
import logging, traceback

PROCESS_TWO = [
    ("line_in", "line_in"),
    ("line_out", "line_out"),
    ("party_in", "party_in"),
    ("party_out", "party_out"),
]

PROCESS = [
    ("factory_in", "factory_in"),
    ("factory_out", "factory_out"),
    ("road_in", "road_in"),
    ("road_out", "road_out"),
    ("fs_return_in", "fs_return_in"),
    ("fs_return_out", "fs_return_out"),
    ("cfs_in", "cfs_in"),
    ("cfs_out", "cfs_out"),
    ("vessel_in", "vessel_in"),
    ("vessel_out", "vessel_out"),
]

MOVECODE_TWO = [
    ("MIR", "MIR"),
    ("RWM", "RWM"),
]

MOVECODE = [
    ("DVAN", "DVAN"),
    ("MTIN", "MTIN"),
    ("DMG_MT", "DMG_MT"),
    ("REP_OUT_MT", "REP_OUT_MT"),
    ("MOR", "MOR"),
    ("MIR", "MIR"),
    ("VAN", "VAN"),
    ("REP_RET_MT", "REP_RET_MT"),
    ("RET", "RET"),
]

EXCEL_EDI_MOVECODE = [
    ("ICO", "ICO"),
    ("MCY", "MCY"),
    ("DAM", "DAM"),
    ("TBR", "TBR"),
    ("MPO", "MPO"),
    ("MPI", "MPI"),
    ("MSH", "MSH"),
    ("REP", "REP"),
    ("ERM", "ERM"),
]


class CmaEdiContent(models.Model):
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    date = models.DateTimeField(null=True, blank=True)
    container_no = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    process = models.CharField(
        max_length=100, null=True, blank=True, choices=PROCESS_TWO
    )
    move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=MOVECODE_TWO
    )
    site = models.CharField(max_length=100, null=True, blank=True)
    is_deleted = models.BooleanField(null=True, blank=True, default=False)
    is_regenerated = models.BooleanField(null=True, blank=True, default=False)
    stock_data_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return str(self.date)

    class Meta:
        indexes = [
            models.Index(fields=["is_deleted"], name="idx_cma_edi_is_deleted"),
            models.Index(fields=["site"], name="idx_cma_edi_site"),
            models.Index(fields=["is_regenerated"], name="idx_cma_edi_regenerated"),
            models.Index(
                fields=["is_deleted", "is_regenerated"],
                name="idx_cma_edi_del_regen",
            ),
        ]


class MscExcelEdiMoveCodeInfo(models.Model):
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    date = models.DateTimeField(null=True, blank=True)
    container_no = models.CharField(max_length=100, null=True, blank=True)
    process = models.CharField(max_length=100, null=True, blank=True, choices=PROCESS)
    move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=EXCEL_EDI_MOVECODE
    )
    site = models.CharField(max_length=100, null=True, blank=True)
    is_deleted = models.BooleanField(null=True, blank=True, default=False)
    in_data_id = models.CharField(max_length=100, null=True, blank=True)
    out_data_id = models.CharField(max_length=100, null=True, blank=True)
    is_tracked = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.date)

    class Meta:
        indexes = [
            models.Index(fields=["site"], name="idx_msc_excel_edi_site"),
            models.Index(fields=["is_deleted"], name="idx_msc_excel_edi_is_deleted"),
            models.Index(
                fields=["is_deleted", "site"],
                name="idx_msc_excel_edi_site_del",
            ),
        ]


class MscEdiContent(models.Model):
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    date = models.DateTimeField(null=True, blank=True)
    container_no = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    process = models.CharField(max_length=100, null=True, blank=True, choices=PROCESS)
    move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=MOVECODE
    )
    site = models.CharField(max_length=100, null=True, blank=True)
    is_deleted = models.BooleanField(null=True, blank=True, default=False)
    in_data_id = models.CharField(max_length=100, null=True, blank=True)
    out_data_id = models.CharField(max_length=100, null=True, blank=True)
    is_tracked = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.date)

    class Meta:
        indexes = [
            models.Index(fields=["site"], name="idx_msc_edi_site"),
            models.Index(fields=["is_deleted"], name="idx_msc_edi_is_deleted"),
            models.Index(
                fields=["is_deleted", "site"],
                name="idx_msc_edi_site_del",
            ),
        ]


class MscREdiContent(models.Model):
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    date = models.DateTimeField(null=True, blank=True)
    container_no = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField(null=True, blank=True)
    process = models.CharField(max_length=100, null=True, blank=True, choices=PROCESS)
    move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=MOVECODE
    )
    site = models.CharField(max_length=100, null=True, blank=True)
    is_deleted = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.date)


DEPOT_TYPE = [("DEPOT", "DEPOT"), ("NON DEPOT", "NON DEPOT")]

EDI_TYPE = [("IN", "IN"), ("OUT", "OUT")]


class EdiMailTracker(models.Model):
    email_date = models.DateTimeField(null=True, blank=True, default=timezone.now)
    process_date = models.DateTimeField(null=True, blank=True)
    client = models.CharField(max_length=100, null=True, blank=True)
    process_type = models.CharField(
        max_length=100, null=True, blank=True, choices=EDI_TYPE
    )
    container_no = models.CharField(max_length=100, null=True, blank=True)
    size = models.CharField(max_length=100, null=True, blank=True)
    type = models.CharField(max_length=100, null=True, blank=True)
    site = models.CharField(max_length=100, null=True, blank=True)
    is_auto = models.BooleanField(null=True, blank=True, default=True)
    time_diff = models.CharField(max_length=100, null=True, blank=True)
    in_data_id = models.CharField(max_length=100, null=True, blank=True)
    out_data_id = models.CharField(max_length=100, null=True, blank=True)
    move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=MOVECODE
    )
    depot_type = models.CharField(
        max_length=100, null=True, blank=True, choices=DEPOT_TYPE, default="DEPOT"
    )
    is_excel_edi = models.BooleanField(null=True, blank=True, default=False)
    excel_edi_move_code = models.CharField(
        max_length=100, null=True, blank=True, choices=EXCEL_EDI_MOVECODE
    )

    def __str__(self):
        return str(self.pk)

    class Meta:
        indexes = [
            models.Index(
                fields=["is_excel_edi", "move_code", "in_data_id"],
                name="idx_in_move_code_is_excel",
            ),
            models.Index(
                fields=["is_excel_edi", "move_code", "out_data_id"],
                name="idx_out_move_code_is_excel",
            ),
            models.Index(
                fields=["is_excel_edi", "in_data_id"],
                name="idx_excel_indata",
            ),
            models.Index(
                fields=["is_excel_edi", "out_data_id"],
                name="idx_excel_outdata",
            ),
        ]


    def add_time_diff(self, connection=None):
        try:
            time_diff = self.email_date.astimezone(
                timezone.get_current_timezone()
            ) - self.process_date.astimezone(timezone.get_current_timezone())
            self.time_diff = str(time_diff)
            if not connection is None:
                self.save(using=connection, update_fields=["time_diff"])
            else:
                self.save(update_fields=["time_diff"])
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_tracked_detail(self):
        try:
            data = {"pk": self.pk}

            if self.email_date is None:
                data["email_date"] = ""
            else:
                data["email_date"] = self.email_date.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M")

            if self.process_date is None:
                data["process_date"] = ""
            else:
                data["process_date"] = self.process_date.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M")

            if self.client is None:
                data["client"] = ""
            else:
                data["client"] = self.client

            if self.process_type is None:
                data["process_type"] = ""
            else:
                data["process_type"] = self.process_type

            if self.container_no is None:
                data["container_no"] = ""
            else:
                data["container_no"] = self.container_no

            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size

            if self.type is None:
                data["type"] = ""
            else:
                data["type"] = self.type

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site

            if self.is_auto is None:
                data["is_auto"] = ""
            else:
                data["is_auto"] = self.is_auto

            if self.time_diff is None:
                data["time_diff"] = ""
            else:
                data["time_diff"] = self.time_diff

            if self.move_code is None:
                data["move_code"] = ""
            else:
                data["move_code"] = self.move_code

            if self.depot_type is None:
                data["depot_type"] = ""
            else:
                data["depot_type"] = self.depot_type

            if self.is_excel_edi is None:
                data["is_excel_edi"] = ""
            else:
                data["is_excel_edi"] = self.is_excel_edi

            if self.excel_edi_move_code is None:
                data["excel_edi_move_code"] = ""
            else:
                data["excel_edi_move_code"] = self.excel_edi_move_code
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class MscExcelEdiFTPCredential(models.Model):
    site = models.CharField(max_length=200)
    ftp_username = models.CharField(max_length=200)
    ftp_password = models.CharField(max_length=200)
    is_disabled = models.BooleanField(default=False)

    def __str__(self):
        return self.site


class MscExcelEdiEmail(models.Model):
    parent = models.ForeignKey(MscExcelEdiFTPCredential, on_delete=models.CASCADE)
    email = models.CharField(max_length=200)

    def __str__(self):
        return self.parent.site
