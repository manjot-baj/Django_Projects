from cmath import e
from django.db import models
from account.models import AccountUser
from master.models import Location, Site
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock, CONDITION_CODE, GRADE_CODE
from django.utils import timezone
import datetime, random, logging, traceback
from django.db.models import Q


class TariffMaster(models.Model):
    client = models.CharField(max_length=200, null=True, blank=False)
    location = models.ForeignKey(
        Location,
        related_name="tariff_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="tariff_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    labour_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return str(self.client)


class TariffMasterLine(models.Model):
    parent = models.ForeignKey(
        TariffMaster,
        related_name="tariff_master_line_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    size = models.CharField(null=True, blank=True, max_length=200)
    type = models.CharField(null=True, blank=True, max_length=200)
    tariff_code = models.CharField(null=True, blank=True, max_length=200)
    main_component = models.CharField(null=True, blank=True, max_length=200)
    component_code = models.CharField(null=True, blank=True, max_length=200)
    component_description = models.CharField(null=True, blank=True, max_length=200)
    location_code = models.CharField(null=True, blank=True, max_length=200)
    location_description = models.CharField(null=True, blank=True, max_length=200)
    damage_code = models.CharField(null=True, blank=True, max_length=200)
    damage_description = models.CharField(null=True, blank=True, max_length=200)
    material_code = models.CharField(null=True, blank=True, max_length=200)
    material_description = models.CharField(null=True, blank=True, max_length=200)
    repair_code = models.CharField(null=True, blank=True, max_length=200)
    repair_description = models.CharField(null=True, blank=True, max_length=200)
    unit = models.CharField(null=True, blank=True, max_length=200)
    measurement = models.CharField(null=True, blank=True, max_length=200)
    length_and_width = models.CharField(null=True, blank=True, max_length=200)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    labour_hrs_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    wash_clean_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    material_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    labour_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    material_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return str(self.parent.client)


STAFF_ROLE = [("Surveyor", "Surveyor"), ("EDP", "EDP"), ("Worker", "Worker")]


class MnrStaff(models.Model):
    firstName = models.CharField(null=True, blank=True, max_length=100)
    lastName = models.CharField(null=True, blank=True, max_length=100)
    emailId = models.CharField(null=True, blank=True, max_length=100)
    mobileNo = models.CharField(null=True, blank=True, max_length=15)
    qualification = models.CharField(null=True, blank=True, max_length=100)
    role = models.CharField(null=True, blank=True, max_length=100, choices=STAFF_ROLE)
    location = models.ForeignKey(
        Location,
        related_name="mnr_staff_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="mnr_staff_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.firstName)

    def get_staff(self):
        try:
            data = {"pk": self.pk}
            if self.firstName is None:
                data["firstName"] = ""
            else:
                data["firstName"] = self.firstName

            if self.lastName is None:
                data["lastName"] = ""
            else:
                data["lastName"] = self.lastName

            if self.emailId is None:
                data["emailId"] = ""
            else:
                data["emailId"] = self.emailId

            if self.mobileNo is None:
                data["mobileNo"] = ""
            else:
                data["mobileNo"] = self.mobileNo

            if self.role is None:
                data["role"] = ""
            else:
                data["role"] = self.role

            if self.qualification is None:
                data["qualification"] = ""
            else:
                data["qualification"] = self.qualification

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


class MnrStaffAttendance(models.Model):
    STATUS_CHOICES = [
        ("Present", "Present"),
        ("Absent", "Absent"),
        ("Leave", "Leave"),
        ("Half Day", "Half Day"),
    ]
    date = models.DateField()
    employee = models.ForeignKey(MnrStaff, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Absent")
    in_time = models.TimeField(blank=True, null=True)
    out_time = models.TimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]

    def __str__(self):
        return str(self.employee.firstName)


class Survey(models.Model):

    depot = models.OneToOneField(
        ContainerStock,
        related_name="depot_stock_survey_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    non_depot = models.OneToOneField(
        NonDepotContainerStock,
        related_name="non_depot_stock_survey_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    number = models.CharField(
        null=True, blank=True, max_length=200, unique=True, default=None
    )
    original_date = models.DateField(null=True, blank=True)
    original_time = models.TimeField(null=True, blank=True)
    current_date = models.DateField(null=True, blank=True)
    current_time = models.TimeField(null=True, blank=True)
    survey_by = models.ForeignKey(
        MnrStaff,
        related_name="survey_by_staff_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    created_by = models.ForeignKey(
        AccountUser,
        related_name="survey_created_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    updated_by = models.ForeignKey(
        AccountUser,
        related_name="survey_updated_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    make_available = models.BooleanField(null=True, blank=True, default=False)
    is_locked = models.BooleanField(null=True, blank=True, default=False)
    is_draft = models.BooleanField(null=True, blank=True, default=False)
    is_proceed = models.BooleanField(null=True, blank=True, default=False)
    is_uploaded = models.BooleanField(null=True, blank=True, default=False)
    is_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    update_count = models.PositiveIntegerField(null=True, blank=True, default=0)
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    labour_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    invoice_id = models.CharField(max_length=100, null=True, blank=True)
    estimate_number = models.CharField(
        null=True, blank=True, max_length=200, unique=True, default=None
    )

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, depot, non_depot, survey_by, created_by, date, time, labour_rate):
        survey = cls(
            depot=depot,
            non_depot=non_depot,
            survey_by=survey_by,
            created_by=created_by,
            updated_by=created_by,
            is_draft=False,
            is_proceed=True,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            labour_rate=labour_rate,
        )
        survey.save()
        if depot is not None:
            if (
                depot.container.status == "IN"
                and depot.container.is_available is False
                and depot.container.automatic_mnr_status_change is True
                # and survey.is_img_uploaded
            ):
                survey.depot.status = "Estimate Pending"
                survey.depot.save()
            survey.depot.survey_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.depot.estimate_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.depot.survey_date = date
            survey.depot.survey_time = time
            # if survey.is_img_uploaded:
            #     survey.depot.stage = "Estimate"
            survey.depot.stage = "Estimate"
            survey.depot.save()
        if non_depot is not None:
            if (
                non_depot.container.status == "IN"
                and non_depot.container.is_available is False
                and non_depot.container.automatic_mnr_status_change is True
                # and survey.is_img_uploaded
            ):
                survey.non_depot.status = "Estimate Pending"
                survey.non_depot.save()
            survey.non_depot.survey_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.non_depot.estimate_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.non_depot.survey_date = date
            survey.non_depot.survey_time = time
            # if survey.is_img_uploaded:
            #     survey.non_depot.stage = "Estimate"
            survey.non_depot.stage = "Estimate"
            survey.non_depot.save()
        return survey

    def updateDraft(self, survey_by, created_by, date, time):
        self.survey_by = survey_by
        self.created_by = created_by
        self.updated_by = created_by
        self.is_draft = True
        self.is_proceed = False
        self.original_date = date
        self.original_time = time
        self.current_date = date
        self.current_time = time
        self.save()
        return self

    def makeDraftToProceed(self, survey_by, created_by, date, time):
        self.survey_by = survey_by
        self.created_by = created_by
        self.updated_by = created_by
        self.is_draft = False
        self.is_proceed = True
        self.original_date = date
        self.original_time = time
        self.current_date = date
        self.current_time = time
        if self.depot is not None:
            if (
                self.depot.container.status == "IN"
                and self.depot.container.is_available is False
                and self.depot.container.automatic_mnr_status_change is True
                # and self.is_img_uploaded
            ):
                self.depot.status = "Estimate Pending"
                self.depot.save()
            self.depot.survey_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            self.depot.estimate_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            self.depot.survey_date = date
            self.depot.survey_time = time
            # if self.is_img_uploaded:
            #     self.depot.stage = "Estimate"
            self.depot.stage = "Estimate"
            self.depot.save()
        if self.non_depot is not None:
            if (
                self.non_depot.container.status == "IN"
                and self.non_depot.container.is_available is False
                and self.non_depot.container.automatic_mnr_status_change is True
                # and self.is_img_uploaded
            ):
                self.non_depot.status = "Estimate Pending"
                self.non_depot.save()
            self.non_depot.survey_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            self.non_depot.estimate_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            self.non_depot.survey_date = date
            self.non_depot.survey_time = time
            # if self.is_img_uploaded:
            #     self.non_depot.stage = "Estimate"
            self.non_depot.stage = "Estimate"
            self.non_depot.save()
        self.save()
        return self

    @classmethod
    def createDraft(
        cls, depot, non_depot, survey_by, created_by, date, time, labour_rate
    ):
        survey = cls(
            depot=depot,
            non_depot=non_depot,
            survey_by=survey_by,
            created_by=created_by,
            updated_by=created_by,
            is_draft=True,
            is_proceed=False,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            labour_rate=labour_rate,
        )
        survey.save()
        return survey

    @classmethod
    def createNoDamage(
        cls,
        depot,
        non_depot,
        survey_by,
        created_by,
        date,
        time,
        labour_rate,
    ):
        survey = cls(
            depot=depot,
            non_depot=non_depot,
            survey_by=survey_by,
            created_by=created_by,
            updated_by=created_by,
            make_available=True,
            is_draft=False,
            is_proceed=True,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            labour_rate=labour_rate,
        )
        survey.save()
        if survey.depot is not None:
            # if (
            #     survey.depot.container.status == "IN"
            #     and survey.depot.container.is_available is False
            #     and survey.depot.container.automatic_mnr_status_change is True
            # ):
            survey.depot.survey_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.depot.available_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())

            survey.depot.container.is_available = True
            survey.depot.container.save()
            survey.depot.status = "Available"
            survey.depot.save()
            survey.depot.survey_date = date
            survey.depot.survey_time = time
            survey.depot.available_date = date
            survey.depot.available_time = time
            survey.depot.stage = "Available"
            survey.depot.save()
        if survey.non_depot is not None:
            # if (
            #     survey.non_depot.container.status == "IN"
            #     and survey.non_depot.container.is_available is False
            #     and survey.non_depot.container.automatic_mnr_status_change is True
            # ):
            survey.non_depot.container.is_available = True
            survey.non_depot.container.save()
            survey.non_depot.survey_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.non_depot.available_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            survey.non_depot.status = "Available"
            survey.non_depot.save()
            survey.non_depot.survey_date = date
            survey.non_depot.survey_time = time
            survey.non_depot.available_date = date
            survey.non_depot.available_time = time
            survey.non_depot.stage = "Available"
            survey.non_depot.save()
        survey.save()
        return survey

    @classmethod
    def checkExistById(cls, id):
        return cls.objects.filter(pk=id).exists()

    @classmethod
    def checkDraftExistById(cls, id):
        return cls.objects.filter(pk=id, is_draft=True).exists()

    @classmethod
    def checkProceedExistById(cls, id):
        return cls.objects.filter(pk=id, is_proceed=True).exists()

    @classmethod
    def checkExistByDepotId(cls, id):
        return cls.objects.filter(depot__pk=id).exists()

    @classmethod
    def getByDepotId(cls, id):
        return cls.objects.get(depot__pk=id)

    @classmethod
    def checkProceedExistByDepotId(cls, id):
        return cls.objects.filter(depot__pk=id, is_proceed=True).exists()

    @classmethod
    def checkDraftExistByDepotId(cls, id):
        return cls.objects.filter(depot__pk=id, is_draft=True).exists()

    @classmethod
    def checkExistByNonDepotId(cls, id):
        return cls.objects.filter(non_depot__pk=id).exists()

    @classmethod
    def getByNonDepotId(cls, id):
        return cls.objects.get(non_depot__pk=id)

    @classmethod
    def checkProceedExistByNonDepotId(cls, id):
        return cls.objects.filter(non_depot__pk=id, is_proceed=True).exists()

    @classmethod
    def checkDraftExistByNonDepotId(cls, id):
        return cls.objects.filter(non_depot__pk=id, is_draft=True).exists()

    @classmethod
    def getById(cls, id):
        return cls.objects.get(pk=id)

    @classmethod
    def getDraftById(cls, id):
        return cls.objects.get(pk=id, is_draft=True)

    @classmethod
    def getProceedById(cls, id):
        return cls.objects.get(pk=id, is_proceed=True)

    @classmethod
    def getProceedByDepotId(cls, id):
        return cls.objects.get(depot__pk=id, is_proceed=True)

    @classmethod
    def getDraftByDepotId(cls, id):
        return cls.objects.get(depot__pk=id, is_draft=True)

    @classmethod
    def getProceedByNonDepotId(cls, id):
        return cls.objects.get(non_depot__pk=id, is_proceed=True)

    @classmethod
    def getDraftByNonDepotId(cls, id):
        return cls.objects.get(non_depot__pk=id, is_draft=True)

    # def createNumber(self, location, site):
    #     todays_date = datetime.date.today()
    #     random_4_digit = random.randint(1000, 9999)
    #     self.number = f"Sur/{location.code}/{site.code}/{todays_date.year}/{todays_date.month}/{random_4_digit}"
    #     self.save()

    def createNumber(self):
        random_no = f"S{random.randint(1000000, 9999999)}"
        while Survey.objects.filter(number=random_no).exists():
            random_no = f"S{random.randint(1000000, 9999999)}"
            if not Survey.objects.filter(number=random_no).exists():
                break
        self.number = random_no
        self.save()

    def incrementUpdateCount(self):
        self.update_count = int(self.update_count) + 1
        self.save()

    def lockStage(self):
        self.is_locked = True
        self.save()


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


class BeforeRepairImage(models.Model):
    parent = models.ForeignKey(
        Survey,
        related_name="before_repair_image_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    upload_to_ftp = models.BooleanField(null=True, blank=True, default=False)
    ftp_upload_successful = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.pk)


class SurveyUnlockDetail(models.Model):
    parent = models.ForeignKey(
        Survey,
        related_name="survey_unlock_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    reason_to_unlock = models.TextField(null=True, blank=True)

    def __str__(self):
        return str(self.pk)


class SurveyLine(models.Model):
    parent = models.ForeignKey(
        Survey,
        related_name="line_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    is_rejected = models.BooleanField(null=True, blank=True, default=False)
    is_partial_rejected = models.BooleanField(null=True, blank=True, default=False)
    delete_disabled = models.BooleanField(null=True, blank=True, default=False)
    tariff_field_enabled = models.BooleanField(null=True, blank=True, default=False)
    tariff_code = models.CharField(null=True, blank=True, max_length=200)
    main_component = models.CharField(null=True, blank=True, max_length=200)
    component_code = models.CharField(null=True, blank=True, max_length=200)
    component_description = models.CharField(null=True, blank=True, max_length=200)
    location_code = models.CharField(null=True, blank=True, max_length=200)
    location_description = models.CharField(null=True, blank=True, max_length=200)
    specific_location_code = models.CharField(null=True, blank=True, max_length=200)
    specific_location_description = models.CharField(
        null=True, blank=True, max_length=200
    )
    damage_code = models.CharField(null=True, blank=True, max_length=200)
    damage_description = models.CharField(null=True, blank=True, max_length=200)
    material_code = models.CharField(null=True, blank=True, max_length=200)
    material_description = models.CharField(null=True, blank=True, max_length=200)
    repair_code = models.CharField(null=True, blank=True, max_length=200)
    repair_description = models.CharField(null=True, blank=True, max_length=200)
    unit = models.CharField(null=True, blank=True, max_length=200)
    measurement = models.CharField(null=True, blank=True, max_length=200)
    length_and_width = models.CharField(null=True, blank=True, max_length=200)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    labour_hrs_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    wash_clean_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    material_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    labour_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    material_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    # tax
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
    total_tax_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_cost_with_tax = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remarks = models.TextField(null=True, blank=True)

    def __str__(self):
        return str(self.pk)


class Estimate(models.Model):

    parent = models.OneToOneField(
        Survey,
        related_name="estimate_parent_rel",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    number = models.CharField(
        null=True, blank=True, max_length=200, unique=True, default=None
    )
    est_rep_common_number = models.CharField(
        null=True, blank=True, max_length=200, unique=True, default=None
    )
    original_date = models.DateField(null=True, blank=True)
    original_time = models.TimeField(null=True, blank=True)
    current_date = models.DateField(null=True, blank=True)
    current_time = models.TimeField(null=True, blank=True)
    current_date_time = models.DateTimeField(null=True, blank=True)
    estimate_by = models.ForeignKey(
        MnrStaff,
        related_name="estimate_by_staff_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    created_by = models.ForeignKey(
        AccountUser,
        related_name="estimate_created_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    updated_by = models.ForeignKey(
        AccountUser,
        related_name="estimate_updated_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    is_draft = models.BooleanField(null=True, blank=True, default=False)
    is_proceed = models.BooleanField(null=True, blank=True, default=False)
    original_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    current_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_locked = models.BooleanField(null=True, blank=True, default=False)
    is_approved = models.BooleanField(null=True, blank=True, default=False)
    is_repair_started = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, parent, estimate_by, created_by, date, time, amount):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        estimate = cls(
            parent=parent,
            estimate_by=estimate_by,
            created_by=created_by,
            updated_by=created_by,
            is_draft=False,
            is_proceed=True,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            current_date_time=current_date_time,
            original_amount=amount,
            current_amount=amount,
        )
        estimate.save()
        if parent.depot is not None:
            if (
                parent.depot.container.status == "IN"
                and parent.depot.container.is_available is False
                and parent.depot.container.automatic_mnr_status_change is True
            ):
                parent.depot.status = "Approval Pending"
                parent.depot.save()
            parent.depot.estimate_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            parent.depot.approval_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            parent.depot.estimate_date = date
            parent.depot.estimate_time = time
            parent.depot.stage = "Approval"
            parent.depot.save()
        if parent.non_depot is not None:
            if (
                parent.non_depot.container.status == "IN"
                and parent.non_depot.container.is_available is False
                and parent.non_depot.container.automatic_mnr_status_change is True
            ):
                parent.non_depot.status = "Approval Pending"
                parent.non_depot.save()
            parent.non_depot.estimate_pending_out_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            parent.non_depot.approval_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            parent.non_depot.estimate_date = date
            parent.non_depot.estimate_time = time
            parent.non_depot.stage = "Approval"
            parent.non_depot.save()
        return estimate

    def updateDraft(self, estimate_by, created_by, date, time, amount):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        self.estimate_by = estimate_by
        self.created_by = created_by
        self.updated_by = created_by
        self.is_draft = True
        self.is_proceed = False
        self.original_date = date
        self.original_time = time
        self.current_date = date
        self.current_time = time
        self.current_date_time = current_date_time
        self.original_amount = amount
        self.current_amount = amount
        self.save()
        return self

    def makeDraftToProceed(self, estimate_by, created_by, date, time, amount):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        self.estimate_by = estimate_by
        self.created_by = created_by
        self.updated_by = created_by
        self.is_draft = False
        self.is_proceed = True
        self.original_date = date
        self.original_time = time
        self.current_date = date
        self.current_time = time
        self.current_date_time = current_date_time
        self.original_amount = amount
        self.current_amount = amount
        if self.parent.depot is not None:
            if (
                self.parent.depot.container.status == "IN"
                and self.parent.depot.container.is_available is False
                and self.parent.depot.container.automatic_mnr_status_change is True
            ):
                self.parent.depot.status = "Approval Pending"
                self.parent.depot.save()
            self.parent.depot.estimate_pending_out_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            self.parent.depot.approval_pending_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            self.parent.depot.estimate_date = date
            self.parent.depot.estimate_time = time
            self.parent.depot.stage = "Approval"
            self.parent.depot.save()
        if self.parent.non_depot is not None:
            if (
                self.parent.non_depot.container.status == "IN"
                and self.parent.non_depot.container.is_available is False
                and self.parent.non_depot.container.automatic_mnr_status_change is True
            ):
                self.parent.non_depot.status = "Approval Pending"
                self.parent.non_depot.save()
            self.parent.non_depot.estimate_pending_out_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            self.parent.non_depot.approval_pending_in_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            self.parent.non_depot.estimate_date = date
            self.parent.non_depot.estimate_time = time
            self.parent.non_depot.stage = "Approval"
            self.parent.non_depot.save()
        self.save()
        return self

    @classmethod
    def createDraft(cls, parent, estimate_by, created_by, date, time, amount):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        estimate = cls(
            parent=parent,
            estimate_by=estimate_by,
            created_by=created_by,
            updated_by=created_by,
            is_draft=True,
            is_proceed=False,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            current_date_time=current_date_time,
            original_amount=amount,
            current_amount=amount,
        )
        estimate.save()
        return estimate

    @classmethod
    def checkExistById(cls, id):
        return cls.objects.filter(pk=id).exists()

    @classmethod
    def checkDraftExistById(cls, id):
        return cls.objects.filter(pk=id, is_draft=True).exists()

    @classmethod
    def checkProceedExistById(cls, id):
        return cls.objects.filter(pk=id, is_proceed=True).exists()

    @classmethod
    def checkExistByParentId(cls, id):
        return cls.objects.filter(parent__pk=id).exists()

    @classmethod
    def checkDraftExistByParentId(cls, id):
        return cls.objects.filter(parent__pk=id, is_draft=True).exists()

    @classmethod
    def getById(cls, id):
        return cls.objects.get(pk=id)

    @classmethod
    def getDraftById(cls, id):
        return cls.objects.get(pk=id, is_draft=True)

    @classmethod
    def getProceedById(cls, id):
        return cls.objects.get(pk=id, is_proceed=True)

    @classmethod
    def getByParentId(cls, id):
        return cls.objects.get(parent__pk=id)

    @classmethod
    def getDraftByParentId(cls, id):
        return cls.objects.get(parent__pk=id, is_draft=True)

    # def createNumber(self, location, site):
    #     todays_date = datetime.date.today()
    #     random_4_digit = random.randint(1000, 9999)
    #     self.number = f"Est/{location.code}/{site.code}/{todays_date.year}/{todays_date.month}/{random_4_digit}"
    #     self.save()

    def createNumber(self):
        random_no = f"E{random.randint(1000000, 9999999)}"
        while Estimate.objects.filter(number=random_no).exists():
            random_no = f"E{random.randint(1000000, 9999999)}"
            if not Estimate.objects.filter(number=random_no).exists():
                break
        self.number = random_no
        self.est_rep_common_number = random_no[1:]
        self.save()

    def lockStage(self):
        self.is_locked = True
        self.save()


DENIAL_REASON = [
    ("REJECTED", "REJECTED"),
    ("CANCEL", "CANCEL"),
    ("PARTIALLY", "PARTIALLY"),
]


class Approval(models.Model):

    parent = models.OneToOneField(
        Estimate,
        related_name="approval_parent_rel",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    original_date = models.DateField(null=True, blank=True)
    original_time = models.TimeField(null=True, blank=True)
    current_date = models.DateField(null=True, blank=True)
    current_time = models.TimeField(null=True, blank=True)
    current_date_time = models.DateTimeField(null=True, blank=True)
    approved_date = models.DateField(null=True, blank=True)
    approved_time = models.TimeField(null=True, blank=True)
    denial_reason = models.CharField(
        null=True, blank=True, max_length=100, choices=DENIAL_REASON
    )
    approval_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    approved_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    denied_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    sent_to_line = models.BooleanField(null=True, blank=True, default=False)
    is_approved = models.BooleanField(null=True, blank=True, default=False)
    is_denied = models.BooleanField(null=True, blank=True, default=False)
    is_partial_denied = models.BooleanField(null=True, blank=True, default=False)
    proceed_without_approval = models.BooleanField(null=True, blank=True, default=False)
    is_draft = models.BooleanField(null=True, blank=True, default=False)
    is_proceed = models.BooleanField(null=True, blank=True, default=False)
    created_by = models.ForeignKey(
        AccountUser,
        related_name="approval_created_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    updated_by = models.ForeignKey(
        AccountUser,
        related_name="approval_updated_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    is_locked = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.pk)

    # If created by just proceed_without_approval entry
    @classmethod
    def createWithoutApprovalProceed(cls, parent, created_by):
        approval = cls(
            parent=parent,
            created_by=created_by,
            updated_by=created_by,
            proceed_without_approval=True,
            is_draft=True,
            is_proceed=False,
        )
        approval.save()
        if parent.parent.depot is not None:
            # if (
            #     parent.parent.depot.container.status == "IN"
            #     and parent.parent.depot.container.is_available is False
            #     and parent.parent.depot.container.automatic_mnr_status_change is True
            # ):
            parent.parent.depot.approval_pending_in_date_time = None
        if parent.parent.non_depot is not None:
            # if (
            #     parent.parent.non_depot.container.status == "IN"
            #     and parent.parent.non_depot.container.is_available is False
            #     and parent.parent.non_depot.container.automatic_mnr_status_change
            #     is True
            # ):
            parent.parent.non_depot.approval_pending_in_date_time = None
        return approval

    # If created by just sent to line entry
    @classmethod
    def createWithSentToLine(cls, parent, date, time, approval_amount, created_by):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        approval = cls(
            parent=parent,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            current_date_time=current_date_time,
            approval_amount=approval_amount,
            created_by=created_by,
            updated_by=created_by,
            sent_to_line=True,
            is_draft=True,
            is_proceed=False,
        )
        approval.save()
        SurveyLine.objects.filter(parent=parent.parent).update(delete_disabled=True)

        if parent.parent.depot is not None:
            if (
                parent.parent.depot.container.status == "IN"
                and parent.parent.depot.container.is_available is False
                and parent.parent.depot.container.automatic_mnr_status_change is True
            ):
                parent.parent.depot.estimate_status = "ESTIMATE SENT"
                parent.parent.depot.save()
        if parent.parent.non_depot is not None:
            if (
                parent.parent.non_depot.container.status == "IN"
                and parent.parent.non_depot.container.is_available is False
                and parent.parent.non_depot.container.automatic_mnr_status_change
                is True
            ):
                parent.parent.non_depot.estimate_status = "ESTIMATE SENT"
                parent.parent.non_depot.save()
        return approval

    # If created a proceed with sent to line and is_approved entry
    @classmethod
    def createWithApproved(
        cls,
        parent,
        date,
        time,
        approved_date,
        approved_time,
        approval_amount,
        approved_amount,
        created_by,
    ):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        approval = cls(
            parent=parent,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            current_date_time=current_date_time,
            approved_date=approved_date,
            approved_time=approved_time,
            approval_amount=approval_amount,
            approved_amount=approved_amount,
            created_by=created_by,
            updated_by=created_by,
            sent_to_line=True,
            is_approved=True,
            is_draft=False,
            is_proceed=True,
        )
        approval.save()
        SurveyLine.objects.filter(parent=parent.parent).update(delete_disabled=True)
        approval.denial_reason = None
        if approved_amount is None:
            approved_amount = approval_amount
        approval.denied_amount = float(approval_amount) - float(approved_amount)
        approval.save()
        approval.parent.is_approved = True
        approval.parent.save()
        approval.lockStage()
        if parent.parent.depot is not None:
            if (
                parent.parent.depot.container.status == "IN"
                and parent.parent.depot.container.is_available is False
                and parent.parent.depot.container.automatic_mnr_status_change is True
            ):
                parent.parent.depot.status = "Approved"
                parent.parent.depot.save()
            parent.parent.depot.approval_pending_out_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            parent.parent.depot.approved_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            parent.parent.depot.approval_date = date
            parent.parent.depot.approval_time = time
            parent.parent.depot.stage = "Repair"
            parent.parent.depot.estimate_status = "APPROVED"
            parent.parent.depot.save()
        if parent.parent.non_depot is not None:
            if (
                parent.parent.non_depot.container.status == "IN"
                and parent.parent.non_depot.container.is_available is False
                and parent.parent.non_depot.container.automatic_mnr_status_change
                is True
            ):
                parent.parent.non_depot.status = "Approved"
                parent.parent.non_depot.save()
            parent.parent.non_depot.approval_pending_out_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            parent.parent.non_depot.approved_in_date_time = datetime.datetime.combine(
                date, time
            ).astimezone(timezone.get_current_timezone())
            parent.parent.non_depot.approval_date = date
            parent.parent.non_depot.approval_time = time
            parent.parent.non_depot.stage = "Repair"
            parent.parent.non_depot.estimate_status = "APPROVED"
            parent.parent.non_depot.save()
        parent.parent.lockStage()
        parent.lockStage()
        return approval

    # If created by sent to line and is_denied entry
    @classmethod
    def createWithDenied(
        cls,
        parent,
        date,
        time,
        approval_amount,
        approved_amount,
        denial_reason,
        created_by,
    ):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        approval = cls(
            parent=parent,
            original_date=date,
            original_time=time,
            current_date=date,
            current_time=time,
            current_date_time=current_date_time,
            approval_amount=approval_amount,
            approved_amount=approved_amount,
            denial_reason=denial_reason,
            created_by=created_by,
            updated_by=created_by,
            sent_to_line=True,
            is_denied=True,
            is_draft=True,
            is_proceed=False,
        )
        approval.save()
        if denial_reason == "PARTIALLY":
            approval.is_partial_denied = True
            approval.save()
        SurveyLine.objects.filter(parent=parent.parent).update(delete_disabled=True)
        if approved_amount is None:
            approved_amount = 0
        approval.denied_amount = float(approval_amount) - float(approved_amount)
        approval.save()

        if parent.parent.depot is not None:
            parent.parent.depot.estimate_status = denial_reason
            parent.parent.depot.save()
        if parent.parent.non_depot is not None:
            parent.parent.non_depot.estimate_status = denial_reason
            parent.parent.non_depot.save()
        return approval

    # If updated by just sent to line entry
    def updateWithSentToLine(self, date, time, approval_amount, updated_by):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        self.original_date = date
        self.original_time = time
        self.current_date = date
        self.current_time = time
        self.current_date_time = current_date_time
        self.approval_amount = approval_amount
        self.updated_by = updated_by
        self.sent_to_line = True
        self.proceed_without_approval = False
        self.is_draft = True
        self.is_proceed = False
        self.save()

        if self.parent.is_approved is False and self.parent.is_repair_started is True:
            pass
        else:
            if self.parent.parent.depot is not None:
                if (
                    self.parent.parent.depot.container.status == "IN"
                    and self.parent.parent.depot.container.is_available is False
                    and self.parent.parent.depot.container.automatic_mnr_status_change
                    is True
                ):
                    self.parent.parent.depot.estimate_status = "ESTIMATE SENT"
                    self.parent.parent.depot.save()
                self.parent.parent.depot.approval_pending_in_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                self.parent.parent.depot.save()
            if self.parent.parent.non_depot is not None:
                if (
                    self.parent.parent.non_depot.container.status == "IN"
                    and self.parent.parent.non_depot.container.is_available is False
                    and self.parent.parent.non_depot.container.automatic_mnr_status_change
                    is True
                ):
                    self.parent.parent.non_depot.estimate_status = "ESTIMATE SENT"
                    self.parent.parent.non_depot.save()
                self.parent.parent.non_depot.approval_pending_in_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                self.parent.parent.non_depot.save()
        SurveyLine.objects.filter(parent=self.parent.parent).update(
            delete_disabled=True
        )
        return self

    # If first created by sent to line and then is_approved entry is updated and proceeded

    def updateWithApproved_helper(self, date, time):
        self.is_draft = False
        self.is_proceed = True
        self.save()

        if self.parent.is_approved is False and self.parent.is_repair_started is True:
            pass
        else:
            if self.parent.parent.depot is not None:
                if (
                    self.parent.parent.depot.container.status == "IN"
                    and self.parent.parent.depot.container.is_available is False
                    and self.parent.parent.depot.container.automatic_mnr_status_change
                    is True
                ):
                    self.parent.parent.depot.status = "Approved"
                    self.parent.parent.depot.save()
                self.parent.parent.depot.approval_pending_out_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                self.parent.parent.depot.approved_in_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                self.parent.parent.depot.approval_date = date
                self.parent.parent.depot.approval_time = time
                self.parent.parent.depot.stage = "Repair"
                self.parent.parent.depot.save()
            if self.parent.parent.non_depot is not None:
                if (
                    self.parent.parent.non_depot.container.status == "IN"
                    and self.parent.parent.non_depot.container.is_available is False
                    and self.parent.parent.non_depot.container.automatic_mnr_status_change
                    is True
                ):
                    self.parent.parent.non_depot.status = "Approved"
                    self.parent.parent.non_depot.save()
                self.parent.parent.non_depot.approval_pending_out_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                self.parent.parent.non_depot.approved_in_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                self.parent.parent.non_depot.approval_date = date
                self.parent.parent.non_depot.approval_time = time
                self.parent.parent.non_depot.stage = "Repair"
                self.parent.parent.non_depot.save()
        self.lockStage()
        self.parent.lockStage()
        self.parent.parent.lockStage()
        return self

    def updateWithApproved(
        self,
        date,
        time,
        approved_date,
        approved_time,
        approval_amount,
        approved_amount,
        updated_by,
        response_upload=False,
    ):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        self.current_date = date
        self.current_time = time
        self.current_date_time = current_date_time
        self.approved_date = approved_date
        self.approved_time = approved_time
        self.approval_amount = approval_amount
        self.approved_amount = approved_amount
        self.updated_by = updated_by
        if approval_amount is None:
            approved_amount = approval_amount
        self.denial_reason = None
        self.denied_amount = float(approval_amount) - float(approved_amount)
        self.is_approved = True
        self.is_denied = False
        self.is_draft = True
        self.is_proceed = False
        self.save()
        self.parent.is_approved = True
        self.parent.save()

        if self.parent.parent.depot is not None:
            self.parent.parent.depot.estimate_status = "APPROVED"
            self.parent.parent.depot.save()
        if self.parent.parent.non_depot is not None:
            self.parent.parent.non_depot.estimate_status = "APPROVED"
            self.parent.parent.non_depot.save()

        if not response_upload:
            self.updateWithApproved_helper(date, time)

        return self

    # If first created by sent to line and then is_denied entry is updated
    def updateWithDenied(
        self, date, time, approval_amount, approved_amount, denial_reason, updated_by
    ):
        current_date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        self.current_date = date
        self.current_time = time
        self.current_date_time = current_date_time
        self.approval_amount = approval_amount
        self.approved_amount = approved_amount
        self.denial_reason = denial_reason
        self.updated_by = updated_by
        self.sent_to_line = True
        if denial_reason == "PARTIALLY":
            self.is_partial_denied = True
        self.is_denied = True
        self.is_draft = True
        self.is_proceed = False
        self.save()
        if approved_amount is None:
            approved_amount = 0
        self.denied_amount = float(approval_amount) - float(approved_amount)
        self.save()
        if self.parent.parent.depot is not None:
            self.parent.parent.depot.estimate_status = denial_reason
            self.parent.parent.depot.save()
        if self.parent.parent.non_depot is not None:
            self.parent.parent.non_depot.estimate_status = denial_reason
            self.parent.parent.non_depot.save()
        return self

    @classmethod
    def checkExistByParentId(cls, id):
        return cls.objects.filter(parent__pk=id).exists()

    @classmethod
    def getByParentId(cls, id):
        return cls.objects.get(parent__pk=id)

    def lockStage(self):
        self.is_locked = True
        self.save()


class Repair(models.Model):

    parent = models.OneToOneField(
        Estimate,
        related_name="repair_parent_rel",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    number = models.CharField(
        null=True, blank=True, max_length=200, unique=True, default=None
    )
    placement = models.BooleanField(null=True, blank=True, default=False)
    placement_date = models.DateField(null=True, blank=True)
    placement_time = models.TimeField(null=True, blank=True)
    damage_category = models.CharField(
        max_length=100, null=True, blank=True, choices=CONDITION_CODE
    )
    grade = models.CharField(max_length=100, null=True, blank=True, choices=GRADE_CODE)
    complete = models.BooleanField(null=True, blank=True, default=False)
    repair_date = models.DateField(null=True, blank=True)
    repair_time = models.TimeField(null=True, blank=True)
    repair_date_time = models.DateTimeField(null=True, blank=True)
    current_repair_date = models.DateField(null=True, blank=True)
    current_repair_time = models.TimeField(null=True, blank=True)
    current_repair_date_time = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    man_power = models.ManyToManyField(
        MnrStaff,
        related_name="repair_man_power_staff_rel",
        blank=True,
        default=None,
    )
    created_by = models.ForeignKey(
        AccountUser,
        related_name="repair_created_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    updated_by = models.ForeignKey(
        AccountUser,
        related_name="repair_updated_by_user_rel",
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        default=None,
    )
    is_uploaded = models.BooleanField(null=True, blank=True, default=False)
    is_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    is_draft = models.BooleanField(null=True, blank=True, default=False)
    is_proceed = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.pk)

    @classmethod
    def createPlacement(cls, parent, damage_category, created_by):
        today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        placementObj = cls(
            parent=parent,
            placement_date=today.date(),
            placement_time=today.time(),
            damage_category=damage_category,
            created_by=created_by,
            updated_by=created_by,
            placement=True,
            is_draft=True,
            is_proceed=False,
        )
        placementObj.save()
        if placementObj.parent.parent.depot is not None:
            if (
                placementObj.parent.parent.depot.container.status == "IN"
                and placementObj.parent.parent.depot.container.is_available is False
                and placementObj.parent.parent.depot.container.automatic_mnr_status_change
                is True
            ):
                placementObj.parent.parent.depot.status = "Under Repairing"
                placementObj.parent.parent.depot.save()
            placementObj.parent.parent.depot.approved_out_date_time = today
            placementObj.parent.parent.depot.under_repair_in_date_time = today
            placementObj.parent.parent.depot.repair_date = today.date()
            placementObj.parent.parent.depot.repair_time = today.time()
            placementObj.parent.parent.depot.stage = "Repair"
            placementObj.parent.parent.depot.save()
        if placementObj.parent.parent.non_depot is not None:
            if (
                placementObj.parent.parent.non_depot.container.status == "IN"
                and placementObj.parent.parent.non_depot.container.is_available is False
                and placementObj.parent.parent.non_depot.container.automatic_mnr_status_change
                is True
            ):
                placementObj.parent.parent.non_depot.status = "Under Repairing"
                placementObj.parent.parent.non_depot.save()
            placementObj.parent.parent.non_depot.approved_out_date_time = today
            placementObj.parent.parent.non_depot.under_repair_in_date_time = today
            placementObj.parent.parent.non_depot.repair_date = today.date()
            placementObj.parent.parent.non_depot.repair_time = today.time()
            placementObj.parent.parent.non_depot.stage = "Repair"
            placementObj.parent.parent.non_depot.save()
        placementObj.parent.is_repair_started = True
        placementObj.parent.save()
        return placementObj

    def createNumber(self):
        random_no = self.parent.est_rep_common_number
        self.number = f"R{random_no}"
        self.save()

    def workComplete(self, grade, remarks, updated_by):
        today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        self.repair_date = today.date()
        self.repair_time = today.time()
        self.repair_date_time = today
        self.current_repair_date = today.date()
        self.current_repair_time = today.time()
        self.current_repair_date_time = today
        self.complete = True
        self.grade = grade
        self.remarks = remarks
        self.updated_by = updated_by
        self.is_draft = False
        self.is_proceed = True
        self.save()
        if self.parent.parent.depot is not None:
            if (
                self.parent.parent.depot.container.status == "IN"
                and self.parent.parent.depot.container.is_available is False
                and self.parent.parent.depot.container.automatic_mnr_status_change
                is True
                # and self.is_img_uploaded
            ):
                self.parent.parent.depot.status = "Available"
                self.parent.parent.depot.save()
            self.parent.parent.depot.under_repair_out_date_time = today
            self.parent.parent.depot.available_in_date_time = today
            self.parent.parent.depot.container.is_available = True
            self.parent.parent.depot.container.save()
            self.parent.parent.depot.available_date = today.date()
            self.parent.parent.depot.available_time = today.time()
            # if self.is_img_uploaded:
            #     self.parent.parent.depot.stage = "Available"
            self.parent.parent.depot.stage = "Available"
            self.parent.parent.depot.save()
        if self.parent.parent.non_depot is not None:
            if (
                self.parent.parent.non_depot.container.status == "IN"
                and self.parent.parent.non_depot.container.is_available is False
                and self.parent.parent.non_depot.container.automatic_mnr_status_change
                is True
                # and self.is_img_uploaded
            ):
                self.parent.parent.non_depot.status = "Available"
                self.parent.parent.non_depot.save()
            self.parent.parent.non_depot.under_repair_out_date_time = today
            self.parent.parent.non_depot.available_in_date_time = today
            self.parent.parent.non_depot.container.is_available = True
            self.parent.parent.non_depot.container.save()
            self.parent.parent.non_depot.available_date = today.date()
            self.parent.parent.non_depot.available_time = today.time()
            # if self.is_img_uploaded:
            #     self.parent.parent.non_depot.stage = "Available"
            self.parent.parent.non_depot.stage = "Available"
            self.parent.parent.non_depot.save()
        return self

    def RepairWorkComplete(
        self, current_date, current_time, grade, remarks, updated_by
    ):
        today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        time = datetime.datetime.strptime(current_time, "%H_%M").time()
        date = datetime.datetime.strptime(current_date, "%d_%m_%Y").date()
        self.repair_date = today.date()
        self.repair_time = today.time()
        self.repair_date_time = today
        self.current_repair_date = date
        self.current_repair_time = time
        self.current_repair_date_time = datetime.datetime.combine(
            date, time
        ).astimezone(timezone.get_current_timezone())
        self.complete = True
        self.grade = grade
        self.remarks = remarks
        self.updated_by = updated_by
        self.is_draft = False
        self.is_proceed = True
        self.save()
        if self.parent.parent.depot is not None:
            if (
                self.parent.parent.depot.container.status == "IN"
                and self.parent.parent.depot.container.is_available is False
                and self.parent.parent.depot.container.automatic_mnr_status_change
                is True
                # and self.is_img_uploaded
            ):
                self.parent.parent.depot.status = "Available"
                self.parent.parent.depot.save()
            self.parent.parent.depot.under_repair_out_date_time = today
            self.parent.parent.depot.available_in_date_time = today
            self.parent.parent.depot.container.is_available = True
            self.parent.parent.depot.container.save()
            self.parent.parent.depot.available_date = today.date()
            self.parent.parent.depot.available_time = today.time()
            # if self.is_img_uploaded:
            #     self.parent.parent.depot.stage = "Available"
            self.parent.parent.depot.stage = "Available"
            self.parent.parent.depot.save()
        if self.parent.parent.non_depot is not None:
            if (
                self.parent.parent.non_depot.container.status == "IN"
                and self.parent.parent.non_depot.container.is_available is False
                and self.parent.parent.non_depot.container.automatic_mnr_status_change
                is True
                # and self.is_img_uploaded
            ):
                self.parent.parent.non_depot.status = "Available"
                self.parent.parent.non_depot.save()
            self.parent.parent.non_depot.under_repair_out_date_time = today
            self.parent.parent.non_depot.available_in_date_time = today
            self.parent.parent.non_depot.container.is_available = True
            self.parent.parent.non_depot.container.save()
            self.parent.parent.non_depot.available_date = today.date()
            self.parent.parent.non_depot.available_time = today.time()
            # if self.is_img_uploaded:
            #     self.parent.parent.non_depot.stage = "Available"
            self.parent.parent.non_depot.stage = "Available"
            self.parent.parent.non_depot.save()
        return self

    def updateRepairDateTime(self, date, time):
        date_time = datetime.datetime.combine(date, time).astimezone(
            timezone.get_current_timezone()
        )
        self.current_repair_date = date
        self.current_repair_time = time
        self.current_repair_date_time = date_time
        self.save()
        if self.parent.parent.depot is not None:
            self.parent.parent.depot.available_in_date_time = date_time
            self.parent.parent.depot.available_date = date
            self.parent.parent.depot.available_time = time
            self.parent.parent.depot.save()

        if self.parent.parent.non_depot is not None:
            self.parent.parent.non_depot.available_in_date_time = date_time
            self.parent.parent.non_depot.available_date = date
            self.parent.parent.non_depot.available_time = time
            self.parent.parent.non_depot.save()
        return self

    @classmethod
    def checkExistById(cls, id):
        return cls.objects.filter(pk=id).exists()

    @classmethod
    def checkExistByParentId(cls, id):
        return cls.objects.filter(parent__pk=id).exists()

    @classmethod
    def getById(cls, id):
        return cls.objects.get(pk=id)

    @classmethod
    def getByParentId(cls, id):
        return cls.objects.get(parent__pk=id)

    # def createNumber(self, location, site):
    #     todays_date = datetime.date.today()
    #     random_4_digit = random.randint(1000, 9999)
    #     self.number = f"Rep/{location.code}/{site.code}/{todays_date.year}/{todays_date.month}/{random_4_digit}"
    #     self.number = f"Rep{random_4_digit}"
    #     self.save()


class AfterRepairImage(models.Model):
    parent = models.ForeignKey(
        Repair,
        related_name="after_repair_image_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    upload_to_ftp = models.BooleanField(null=True, blank=True, default=False)
    ftp_upload_successful = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return str(self.pk)


WISTIM_TYPE = [
    ("Estimate", "Estimate"),
    ("Repair", "Repair"),
    ("Distim", "Distim"),
    ("Rejected Wistim", "Rejected Wistim"),
    ("Approved Wistim", "Approved Wistim"),
]


class WistimS3Upload(models.Model):
    date = models.DateTimeField(null=True, blank=True)
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    type = models.CharField(null=True, blank=True, max_length=100, choices=WISTIM_TYPE)
    estimate = models.ManyToManyField(
        Estimate, related_name="estimate_wistim_s3_upload_rel", blank=True, default=None
    )
    repair = models.ManyToManyField(
        Repair, related_name="repair_wistim_s3_upload_rel", blank=True, default=None
    )
    location = models.ForeignKey(
        Location,
        related_name="wistim_distim_s3_upload_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="wistim_distim_s3_upload_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    def get_wistim_distim_s3_detail(self):
        try:
            type_dict = {
                "Estimate": "Estimate Westim",
                "Repair": "Repair Destim",
                "Distim": "Destim",
                "Rejected Wistim": "Rejected Westim",
                "Approved Wistim": "Approved Westim",
            }
            data = {
                "pk": self.pk,
                "date": self.date.date().strftime("%Y-%m-%d"),
                "s3_object_name": self.s3_object_name,
                "s3_file_name": self.s3_file_name,
                "type": type_dict[self.type],
                "location": self.location.name,
                "site": self.site.name,
            }
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class TariffSpecificLocation(models.Model):
    location_code = models.CharField(null=True, blank=True, max_length=200)
    specific_location_code = models.CharField(null=True, blank=True, max_length=200)
    specific_location_description = models.CharField(
        null=True, blank=True, max_length=200
    )

    def __str__(self):
        return str(self.pk)
