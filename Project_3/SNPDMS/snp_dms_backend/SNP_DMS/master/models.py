from email.policy import default

from django.db import models
import traceback, logging

from common.exceptions import ResourceNotFound


class CountryManager(models.Manager):
    def getCountryQuerysetByParameter(self, params):

        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Data not Found!")

    def getCountryData(self, pk=None):
        try:
            if pk is None:
                return self.values("pk", "name", "currency")
            else:
                return self.values("pk", "name", "currency").get(pk=pk)
        except:
            raise ResourceNotFound("Country not Found!")

    def getCountryById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Country not Found!")


class Country(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    currency = models.CharField(max_length=100, null=True, blank=False)
    objects = CountryManager()

    def __str__(self):
        return self.name

    class Meta:
        indexes = [models.Index(fields=["name"], name="idx_ctry_name")]

    # @classmethod
    # def create(cls, name, currency):
    #     try:
    #         country = cls(name=name)
    #         country.currency = currency
    #         return country
    #     except:
    #         error_log = logging.getLogger("error_log")
    #         error_log.error(traceback.format_exc())
    #         return None

    # def get_country_detail(self):
    #     try:
    #         data = {"pk": self.pk, "name": self.name, "currency": self.currency}
    #         return data
    #     except:
    #         error_log = logging.getLogger("error_log")
    #         error_log.error(traceback.format_exc())
    #         return None


class LocationManager(models.Manager):
    def getLocationQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Data not Found!")

    def getLocationById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Data not Found!")

    def getLocationByName(self, name):
        try:
            return self.get(name=name)
        except:
            raise ResourceNotFound("Data not Found!")


class Location(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    code = models.CharField(max_length=100, null=False, blank=False)
    target = models.CharField(max_length=100, null=True, blank=True)
    company_name = models.CharField(max_length=200, null=False, blank=False)
    company_address = models.TextField(null=False, blank=False)
    state_code = models.CharField(max_length=100, null=True, blank=True)
    country = models.ForeignKey(
        Country,
        related_name="location_country_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    icon = models.ImageField(upload_to="location_icon/", null=True, blank=True)
    gst_no = models.CharField(max_length=100, null=True, blank=True)
    organization = models.CharField(max_length=200, null=True, blank=True)
    lut_no = models.CharField(max_length=200, null=True, blank=True)

    objects = LocationManager()

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=["name"], name="idx_loc_name"),
            models.Index(
                fields=["country_id"],
                name="idx_loc_country",
            ),
        ]

    @classmethod
    def create(
        cls,
        name,
        code,
        target,
        company_name,
        company_address,
        state_code,
        country,
        icon,
        gst_no,
        lut_no,
    ):
        try:
            location = cls(name=name)
            location.code = code
            location.target = target
            location.company_name = company_name
            location.company_address = company_address
            location.state_code = state_code
            location.country = country
            location.icon = icon
            location.gst_no = gst_no
            location.lut_no = lut_no
            return location
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_location_detail(self):
        try:
            data = {"pk": self.pk}
            if self.name is None:
                data["name"] = ""
            else:
                data["name"] = self.name
            if self.code is None:
                data["code"] = ""
            else:
                data["code"] = self.code
            if self.target is None:
                data["target"] = ""
            else:
                data["target"] = self.target
            if self.company_name is None:
                data["company_name"] = ""
            else:
                data["company_name"] = self.company_name
            if self.company_address is None:
                data["company_address"] = ""
            else:
                data["company_address"] = self.company_address
            if self.state_code is None:
                data["state_code"] = ""
            else:
                data["state_code"] = self.state_code
            if self.country is None:
                data["country"] = ""
            else:
                data["country"] = self.country.name
            try:
                data["icon"] = self.icon.url
            except:
                data["icon"] = ""
            if self.gst_no is None:
                data["gst_no"] = ""
            else:
                data["gst_no"] = self.gst_no
            if self.lut_no is None:
                data["lut_no"] = ""
            else:
                data["lut_no"] = self.lut_no
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


SITE_TYPE = [("DEPOT", "DEPOT"), ("NON DEPOT", "NON DEPOT")]


class SiteManager(models.Manager):
    def getSiteById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Site not found")

    def getSiteByName(self, name):
        try:
            return self.get(name=name)
        except:
            raise ResourceNotFound("Site not found")

    def getSiteQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Data not found")


class Site(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    location = models.ForeignKey(
        Location,
        related_name="site_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    address = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=200, null=True, blank=True)
    state_code = models.CharField(max_length=100, null=True, blank=True)
    contact = models.CharField(max_length=200, null=True, blank=True)
    code = models.CharField(max_length=200, null=True, blank=True)
    type = models.CharField(
        max_length=200, null=True, blank=True, choices=SITE_TYPE, default="DEPOT"
    )
    depot_code = models.CharField(max_length=200, null=True, blank=True)
    depot_name = models.CharField(max_length=200, null=True, blank=True)
    vendor_code = models.CharField(max_length=200, null=True, blank=True)
    vendor_name = models.CharField(max_length=200, null=True, blank=True)
    automatic_mnr_status_change = models.BooleanField(
        null=True, blank=True, default=False
    )
    mnr_module = models.BooleanField(null=True, blank=True, default=False)
    organization = models.CharField(max_length=200, null=True, blank=True)
    transportation_module = models.BooleanField(null=True, blank=True, default=False)
    new_billing_module = models.BooleanField(null=True, blank=True, default=False)
    depot_msc_code = models.CharField(max_length=200, null=True, blank=True)
    event_location_msc_code = models.CharField(max_length=200, null=True, blank=True)
    loaded_yard_module = models.BooleanField(null=True, blank=True)
    procurement_module = models.BooleanField(null=True, blank=True)
    procurement_admin = models.BooleanField(null=True, blank=True)
    truck_tracking = models.BooleanField(default=False)
    en_block_movement = models.BooleanField(null=True, blank=True, default=False)
    en_block_movement_v2 = models.BooleanField(null=True, blank=True, default=False)
    invoice_start_from = models.IntegerField(default=1)
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    bank_account_no = models.CharField(max_length=200, null=True, blank=True)
    ifsc_code = models.CharField(max_length=200, null=True, blank=True)
    bank_branch = models.CharField(max_length=200, null=True, blank=True)
    size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    mnr_ftp_upload = models.BooleanField(null=True, blank=True, default=False)
    lolo_finance = models.BooleanField(null=True, blank=True, default=False)
    ftp_host = models.CharField(max_length=100, null=True, blank=True)
    ftp_username = models.CharField(max_length=100, null=True, blank=True)
    ftp_password = models.CharField(max_length=100, null=True, blank=True)
    objects = SiteManager()
    night_charge_size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    night_charge_size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    mnr_team = models.BooleanField(default=False)
    payment_due_date = models.CharField(max_length=50, null=True, blank=True)
    objects = SiteManager()

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=["name"], name="idx_site_name"),
            models.Index(
                fields=["location_id"],
                name="idx_site_country",
            ),
        ]

    # @classmethod
    # def create(cls, name, location, address, contact, code, type):
    #     try:
    #         site = cls(name=name)
    #         site.location = location
    #         site.address = address
    #         site.contact = contact
    #         site.code = code
    #         site.type = type
    #         return site
    #     except:
    #         return None
    @classmethod
    def create(
        cls,
        name,
        location,
        address,
        state,
        state_code,
        contact,
        code,
        type,
        depot_code,
        vendor_code,
        depot_name,
        vendor_name,
        automatic_mnr_status_change,
        mnr_module,
        transportation_module,
        loaded_yard_module,
        procurement_module,
        new_billing_module,
        invoice_start_from,
        lolo_finance,
        procurement_admin,
        en_block_movement,
    ):
        try:
            site = cls(name=name)
            site.location = location
            site.address = address
            site.state = state
            site.state_code = state_code
            site.contact = contact
            site.code = code
            site.type = type
            site.depot_code = depot_code
            site.vendor_code = vendor_code
            site.depot_name = depot_name
            site.vendor_name = vendor_name
            site.automatic_mnr_status_change = automatic_mnr_status_change
            site.mnr_module = mnr_module
            site.transportation_module = transportation_module
            site.loaded_yard_module = loaded_yard_module
            site.new_billing_module = new_billing_module
            site.procurement_module = procurement_module
            site.lolo_finance = lolo_finance
            site.procurement_admin = procurement_admin
            site.invoice_start_from = invoice_start_from
            site.en_block_movement = en_block_movement
            return site
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_site_detail(self):
        try:
            data = {"pk": self.pk, "mnr_ftp_upload": self.mnr_ftp_upload}
            if self.name is None:
                data["name"] = ""
            else:
                data["name"] = self.name
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.address is None:
                data["address"] = ""
            else:
                data["address"] = self.address
            if self.state is None:
                data["state"] = ""
            else:
                data["state"] = self.state
            if self.state_code is None:
                data["state_code"] = ""
            else:
                data["state_code"] = self.state_code
            if self.contact is None:
                data["contact"] = ""
            else:
                data["contact"] = self.contact
            if self.code is None:
                data["code"] = ""
            else:
                data["code"] = self.code
            if self.type is None:
                data["type"] = ""
            else:
                data["type"] = self.type

            if self.depot_code is None:
                data["depot_code"] = ""
            else:
                data["depot_code"] = self.depot_code

            if self.vendor_code is None:
                data["vendor_code"] = ""
            else:
                data["vendor_code"] = self.vendor_code

            if self.depot_name is None:
                data["depot_name"] = ""
            else:
                data["depot_name"] = self.depot_name

            if self.vendor_name is None:
                data["vendor_name"] = ""
            else:
                data["vendor_name"] = self.vendor_name

            if self.automatic_mnr_status_change is None:
                data["automatic_mnr_status_change"] = ""
            else:
                data["automatic_mnr_status_change"] = str(
                    self.automatic_mnr_status_change
                )
            if self.mnr_module is None:
                data["mnr_module"] = ""
            else:
                data["mnr_module"] = str(self.mnr_module)
            if self.transportation_module is None:
                data["transportation_module"] = ""
            else:
                data["transportation_module"] = str(self.transportation_module)
            if self.loaded_yard_module is None:
                data["loaded_yard_module"] = ""
            else:
                data["loaded_yard_module"] = str(self.loaded_yard_module)
            if self.new_billing_module is None:
                data["new_billing_module"] = ""
            else:
                data["new_billing_module"] = str(self.new_billing_module)
            if self.procurement_module is None:
                data["procurement_module"] = ""
            else:
                data["procurement_module"] = str(self.procurement_module)

            if self.lolo_finance is None:
                data["lolo_finance"] = ""
            else:
                data["lolo_finance"] = str(self.lolo_finance)

            if self.procurement_admin is None:
                data["procurement_admin"] = ""
            else:
                data["procurement_admin"] = str(self.procurement_admin)
            if self.invoice_start_from is None:
                data["invoice_start_from"] = ""
            else:
                data["invoice_start_from"] = str(self.invoice_start_from)
            if self.truck_tracking is None:
                data["truck_tracking"] = ""
            else:
                data["truck_tracking"] = str(self.truck_tracking)
            if self.en_block_movement is None:
                data["en_block_movement"] = ""
            else:
                data["en_block_movement"] = str(self.en_block_movement)
            if self.en_block_movement_v2 is None:
                data["en_block_movement_v2"] = ""
            else:
                data["en_block_movement_v2"] = str(self.en_block_movement_v2)
            if self.mnr_team is None:
                data["mnr_team"] = ""
            else:
                data["mnr_team"] = str(self.mnr_team)
            data["bank_name"] = self.bank_name if self.bank_name else ""
            data["bank_account_no"] = (
                self.bank_account_no if self.bank_account_no else ""
            )
            data["bank_branch"] = self.bank_branch if self.bank_branch else ""
            data["ifsc_code"] = self.ifsc_code if self.ifsc_code else ""
            data["size_20_rate"] = self.size_20_rate if self.size_20_rate else ""
            data["size_40_rate"] = self.size_40_rate if self.size_40_rate else ""
            data["night_charge_size_20_rate"] = (
                self.night_charge_size_20_rate if self.night_charge_size_20_rate else ""
            )
            data["night_charge_size_40_rate"] = (
                self.night_charge_size_40_rate if self.night_charge_size_40_rate else ""
            )
            data["payment_due_date"] = self.payment_due_date or ""
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class TransporterManager(models.Manager):
    def getTransporterQuerysetByParams(self, params):
        return self.filter(**params)

    def getTransporterById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Transporter Not Found")


class Transporter(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    location = models.ForeignKey(
        Location,
        related_name="transporter_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="transporter_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    code = models.CharField(max_length=200, null=True, blank=True)
    objects = TransporterManager()
    enblock_transporter = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=["name"], name="idx_transport_name"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_transport_location_site",
            ),
        ]

    @classmethod
    def create(cls, name, location, site, code):
        try:
            transporter = cls(name=name)
            transporter.location = location
            transporter.site = site
            transporter.code = code
            return transporter
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_transporter(self):
        try:
            data = {"pk": self.pk}
            if self.name is None:
                data["name"] = ""
            else:
                data["name"] = self.name
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            if self.code is None:
                data["code"] = ""
            else:
                data["code"] = self.code
            data["enblock_transporter"] = self.enblock_transporter
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class RefCodeManager(models.Manager):
    def getRefCodeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Ref Code  not found")

    def getRefCodeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Ref Code not Found")


class RefCodeMaster(models.Model):
    ref_code = models.CharField(max_length=200, null=False, blank=False)
    objects = RefCodeManager()

    def __str__(self):
        return self.ref_code

    # @classmethod
    # def create(cls, ref_code):
    #     try:
    #         ref_code_data = cls(ref_code=ref_code)
    #         ref_code_data.save()
    #         return ref_code_data
    #     except:
    #         error_log = logging.getLogger("error_log")
    #         error_log.error(traceback.format_exc())
    #         return None

    def get_ref_code_data(self):
        try:
            data = {"pk": self.pk, "ref_code": self.ref_code}
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ContainerTypeManager(models.Manager):
    def getTypeData(self, pk=None):
        try:
            if pk is None:
                return self.values("pk", "name")
            else:
                return self.values("pk", "name").get(pk=pk)
        except:
            raise ResourceNotFound("Type not Found!")

    def getTypeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Size not Found")


class ContainerType(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    objects = ContainerTypeManager()

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, name):
        try:
            container_type = cls(name=name)
            return container_type
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_type(self):
        return self.name

    def get_type_display(self):
        return {"pk": self.pk, "name": self.name}

    class Meta:
        indexes = [models.Index(fields=["name"], name="idx_type_name")]


class ContainerSizeManager(models.Manager):
    def getListofSize(self):
        try:
            return self.values("pk", "name")
        except:
            raise ResourceNotFound("Size not Found")

    def getSizeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Size not Found")

    def getSizeData(self, pk=None):
        try:
            if pk is None:
                return self.values("pk", "name")
            else:
                return self.values("pk", "name").get(pk=pk)
        except:
            raise ResourceNotFound("Size not Found!")

    def getSizeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Size not Found!")


class ContainerSize(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    objects = ContainerSizeManager()

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, name):
        try:
            container_size = cls(name=name)
            return container_size
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_size(self):
        return self.name

    def get_size_display(self):
        return {"pk": self.pk, "name": self.name}

    class Meta:
        indexes = [models.Index(fields=["name"], name="idx_size_name")]


class TypeSizeCodeManager(models.Manager):
    def getTypeSizeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Type Size not Found")

    def getTypeSizeCodeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Type Size not Found")


class TypeSizeCode(models.Model):
    type = models.ForeignKey(
        ContainerType,
        related_name="ts_code_type_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="ts_code_size_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    code = models.CharField(max_length=100, null=True, blank=True)
    objects = TypeSizeCodeManager()

    def __str__(self):
        return self.code

    class Meta:
        indexes = [
            models.Index(
                fields=["type_id", "size_id"],
                name="idx_isocode_type_size",
            ),
        ]

    @classmethod
    def create(cls, c_type, c_size, code):
        try:
            code = cls(code=code)
            code.type = c_type
            code.size = c_size
            return code
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_container_type_size_code(self):
        try:
            data = {"pk": self.pk}
            if self.type is None:
                data["type"] = ""
            else:
                data["type"] = self.type.name
            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size.name
            if self.code is None:
                data["code"] = ""
            else:
                data["code"] = self.code
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class VesselBkgNoManager(models.Manager):
    def getVesselBookingNoById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Vessel Booking No not found")

    def getVesselBookingNoQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Vessel Booking Not Found")


class VesselBkgNo(models.Model):
    date = models.DateField(null=True, blank=True)
    number = models.CharField(max_length=100, null=True, blank=True, unique=True)
    location = models.ForeignKey(
        Location,
        related_name="vessel_bkgno_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="vessel_bkgno_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    objects = VesselBkgNoManager()

    def __str__(self):
        return str(self.number)

    class Meta:
        indexes = [
            models.Index(fields=["number"], name="idx_vesselbkg_number"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_vesselbkg_location_site",
            ),
        ]

    @classmethod
    def create(cls, date, number, location, site):
        try:
            vessel_bkgno = cls(date=date)
            vessel_bkgno.number = number
            vessel_bkgno.location = location
            vessel_bkgno.site = site
            return vessel_bkgno
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_vessel_bkgno(self):
        try:
            data = {"pk": self.pk}
            if self.date is None:
                data["date"] = ""
            else:
                data["date"] = self.date.strftime("%Y-%m-%d")
            if self.number is None:
                data["number"] = ""
            else:
                data["number"] = self.number
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


class VesselVoyageDetailManager(models.Manager):
    def getVesselVoyageById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Vessel Voyage not found")

    def getVesselVoyageQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Vessel Voyage Not Found")


class VesselVoyageDetail(models.Model):
    bkg = models.ForeignKey(
        VesselBkgNo,
        related_name="vessel_voyage_bkgno_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    vessel_voyage = models.CharField(
        max_length=100, null=True, blank=False, unique=True
    )
    voyage_no = models.CharField(max_length=100, null=True, blank=False, unique=True)
    vessel_name = models.CharField(max_length=100, null=True, blank=False)
    location = models.ForeignKey(
        Location,
        related_name="vessel_voyage_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="vessel_voyage_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    objects = VesselVoyageDetailManager()

    def __str__(self):
        return str(self.voyage_no)

    class Meta:
        indexes = [
            models.Index(fields=["vessel_voyage"], name="idx_vvdtl_vessel_voyage"),
            models.Index(fields=["voyage_no"], name="idx_vvdtl_voyage_no"),
            models.Index(fields=["vessel_name"], name="idx_vvdtl_vessel_name"),
            models.Index(
                fields=["bkg_id"],
                name="idx_vvdtl_bkg",
            ),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_vvdtl_location_site",
            ),
        ]

    @classmethod
    def create(cls, bkg, vessel_voyage, vessel_name, voyage_no, location, site):
        try:
            vessel_voyage_detail = cls(bkg=bkg)
            vessel_voyage_detail.vessel_voyage = vessel_voyage
            vessel_voyage_detail.vessel_name = vessel_name
            vessel_voyage_detail.voyage_no = voyage_no
            vessel_voyage_detail.location = location
            vessel_voyage_detail.site = site
            return vessel_voyage_detail
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_vessel_voyage_detail(self):
        try:
            data = {"pk": self.pk}
            if self.bkg is None:
                data["booking_no"] = ""
            else:
                data["booking_no"] = self.bkg.number

            if self.vessel_voyage is None:
                data["vessel_voyage_name"] = ""
            else:
                data["vessel_voyage_name"] = self.vessel_voyage
            if self.vessel_name is None:
                data["vessel_name"] = ""
            else:
                data["vessel_name"] = self.vessel_name
            if self.voyage_no is None:
                data["voyage_no"] = ""
            else:
                data["voyage_no"] = self.voyage_no
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


LOC_TYPE = [
    ("Factory", "Factory"),
    ("Road/Rail", "Road/Rail"),
    ("FS RETURN", "FS RETURN"),
    ("CFS/ICD", "CFS/ICD"),
    ("Port/Vessel", "Port/Vessel"),
]


class LocationCodeManager(models.Manager):

    def getLocationCodeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Location Code No not found")

    def getLocationCodeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Location Code Not Found")


class LocationCodeDetail(models.Model):
    name_code = models.CharField(max_length=100, null=True, blank=False, unique=True)
    name = models.CharField(max_length=100, null=True, blank=False)
    code = models.CharField(max_length=100, null=True, blank=False)
    type = models.CharField(max_length=100, null=True, blank=False, choices=LOC_TYPE)
    location = models.ForeignKey(
        Location,
        related_name="loc_code_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="loc_code_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    depot_name = models.CharField(max_length=100, null=True, blank=False)
    ova_code = models.CharField(max_length=100, null=True, blank=False)
    objects = LocationCodeManager()

    def __str__(self):
        return str(self.code)

    class Meta:
        indexes = [
            models.Index(fields=["name_code"], name="idx_loccodedtl_name_code"),
            models.Index(fields=["name"], name="idx_loccodedtl_name"),
            models.Index(fields=["code"], name="idx_loccodedtl_code"),
            models.Index(fields=["type"], name="idx_loccodedtl_type"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_loccodedtl_location_site",
            ),
        ]

    @classmethod
    def create(cls, name_code, name, code, type, location, site, depot_name, ova_code):
        try:
            location_code_detail = cls(name_code=name_code)
            location_code_detail.name = name
            location_code_detail.code = code
            location_code_detail.type = type
            location_code_detail.location = location
            location_code_detail.site = site
            location_code_detail.depot_name = depot_name
            location_code_detail.ova_code = ova_code
            return location_code_detail
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_location_code_detail(self):
        try:
            data = {"pk": self.pk}
            if self.name_code is None:
                data["name_code"] = ""
            else:
                data["name_code"] = self.name_code
            if self.name is None:
                data["name"] = ""
            else:
                data["name"] = self.name
            if self.code is None:
                data["code"] = ""
            else:
                data["code"] = self.code
            if self.type is None:
                data["type"] = ""
            else:
                data["type"] = self.type
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            if self.depot_name is None:
                data["depot_name"] = ""
            else:
                data["depot_name"] = self.depot_name
            if self.ova_code is None:
                data["ova_code"] = ""
            else:
                data["ova_code"] = self.ova_code
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ExportCargoTypeManager(models.Manager):
    def getExportCargoById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Export Cargo  not found")

    def getExportCargoQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Export Cargo not Found")


class ExportCargoType(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    objects = ExportCargoTypeManager()

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, name):
        try:
            export_cargo_type = cls(name=name)
            return export_cargo_type
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_export_cargo_type(self):
        return self.name

    def get_export_cargo_type_display(self):
        return {"pk": self.pk, "name": self.name}


class CarrierCodeManager(models.Manager):
    def getCarrierCodeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Carrier Code  not found")

    def getCarrierCodeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Carrier Code not Found")


class CarrierCode(models.Model):
    code = models.CharField(max_length=200, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="carrier_code_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="carrier_code_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    objects = CarrierCodeManager()

    def __str__(self):
        return self.code

    class Meta:
        indexes = [
            models.Index(fields=["code"], name="idx_carriercode_name"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_carriercode_location_site",
            ),
        ]

    @classmethod
    def create(cls, location, site, code):
        try:
            carrier_code = cls(code=code)
            carrier_code.location = location
            carrier_code.site = site
            return carrier_code
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_carrier_code(self):
        try:
            data = {"pk": self.pk}
            data["location"] = "" if self.location is None else self.location.name
            data["site"] = "" if self.site is None else self.site.name
            data["code"] = "" if self.code is None else self.code
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


# class SharedClass:
#
#     def getAccountUser(self, user):
#         return AccountUser.objects.get(username=user)


class SiteInchargeManager(models.Manager):
    def getSiteInchargeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Site Incharge not found")

    def getSiteInchargeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Site Incharge not Found")


class SiteIncharge(models.Model):
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    mobile_no = models.CharField(max_length=50)
    location = models.ForeignKey(
        Location,
        related_name="site_manager_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="site_manager_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    objects = SiteInchargeManager()
