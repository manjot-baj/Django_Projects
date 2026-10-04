from django.db import models
from account.models import AccountUser
from twilio.http.client_token_manager import ClientTokenManager

from .models import Location, Site, ContainerSize
from common.functions import *
from django.utils import timezone
import traceback, logging

from common.exceptions import ResourceNotFound

# from depot.models import ContainerStock, GateOut


CLIENT_TYPE = [("Line", "Line"), ("Party", "Party")]

STATE_CHOICES = [
    ("Andhra Pradesh", "Andhra Pradesh"),
    ("Arunachal Pradesh", "Arunachal Pradesh"),
    ("Assam", "Assam"),
    ("Bihar", "Bihar"),
    ("Chhattisgarh", "Chhattisgarh"),
    ("Goa", "Goa"),
    ("Gujarat", "Gujarat"),
    ("Haryana", "Haryana"),
    ("Himachal Pradesh", "Himachal Pradesh"),
    ("Jammu and Kashmir", "Jammu and Kashmir"),
    ("Jharkhand", "Jharkhand"),
    ("Karnataka", "Karnataka"),
    ("Kerala", "Kerala"),
    ("Madhya Pradesh", "Madhya Pradesh"),
    ("Maharashtra", "Maharashtra"),
    ("Manipur", "Manipur"),
    ("Meghalaya", "Meghalaya"),
    ("Mizoram", "Mizoram"),
    ("Nagaland", "Nagaland"),
    ("Odisha", "Odisha"),
    ("Punjab", "Punjab"),
    ("Rajasthan", "Rajasthan"),
    ("Sikkim", "Sikkim"),
    ("Tamil Nadu", "Tamil Nadu"),
    ("Telangana", "Telangana"),
    ("Tripura", "Tripura"),
    ("Uttar Pradesh", "Uttar Pradesh"),
    ("Uttarakhand", "Uttarakhand"),
    ("West Bengal", "West Bengal"),
    ("Andaman and Nicobar Islands", "Andaman and Nicobar Islands"),
    ("Chandigarh", "Chandigarh"),
    ("Dadra and Nagar Haveli", "Dadra and Nagar Haveli"),
    ("Daman and Diu", "Daman and Diu"),
    ("Lakshadweep", "Lakshadweep"),
    ("Delhi", "Delhi"),
    ("Puducherry", "Puducherry"),
]


class ClientManager(models.Manager):
    def createClient(self, params):
        return self.create(**params)

    def getClientById(self, pk):
        return self.get(pk=pk)

    def getClientQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Client Not Found")

    def getClientObjectByParams(self, params):
        try:
            return self.get(**params)
        except:
            raise ResourceNotFound("Client Not Found")

    def createClientDocument(self, **params):
        return self.create(params)


class Client(models.Model):
    code = models.CharField(max_length=200, null=True, blank=False)
    name = models.CharField(max_length=200, null=True, blank=False)
    alias_name_one = models.CharField(max_length=200, null=True, blank=True)
    alias_name_two = models.CharField(max_length=200, null=True, blank=True)
    contact_person = models.CharField(max_length=200, null=True, blank=True)
    type = models.CharField(max_length=200, null=True, blank=False, choices=CLIENT_TYPE)
    office_address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(
        choices=STATE_CHOICES, max_length=255, null=True, blank=True, default=None
    )
    zip = models.CharField(max_length=10, null=True, blank=True)
    office_phone_no = models.CharField(max_length=12, null=True, blank=True)
    mobile_no = models.CharField(max_length=15, null=True, blank=True)
    email_id = models.CharField(max_length=200, null=True, blank=True)
    website = models.CharField(max_length=200, null=True, blank=True)
    fax = models.CharField(max_length=200, null=True, blank=True)
    business_description = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="client_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="client_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    cst_no = models.CharField(max_length=100, null=True, blank=True)
    service_tax_no = models.CharField(max_length=100, null=True, blank=True)
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    account_name = models.CharField(max_length=200, null=True, blank=True)
    vat_no = models.CharField(max_length=100, null=True, blank=True)
    ecc_no = models.CharField(max_length=100, null=True, blank=True)
    bank_branch = models.CharField(max_length=200, null=True, blank=True)
    account_no = models.CharField(max_length=200, null=True, blank=True)
    gst_no = models.CharField(max_length=100, null=True, blank=True)
    pan_no = models.CharField(max_length=100, null=True, blank=True)
    ifsc_code = models.CharField(max_length=100, null=True, blank=True)
    swift_code = models.CharField(max_length=100, null=True, blank=True)

    # edi
    edi_service = models.BooleanField(null=True, blank=True, default=False)
    ref_code = models.CharField(max_length=100, null=True, blank=True)
    operator_code = models.CharField(max_length=100, null=True, blank=True)
    current_location_code = models.CharField(max_length=100, null=True, blank=True)
    location_code = models.CharField(max_length=100, null=True, blank=True)
    edi_code = models.CharField(max_length=100, null=True, blank=True)
    edi_to_email_id = models.TextField(null=True, blank=True)
    edi_cc_email_id = models.TextField(null=True, blank=True)
    reported_by_from = models.CharField(max_length=200, null=True, blank=True)
    reported_by_to = models.CharField(max_length=200, null=True, blank=True)
    sales_term = models.BooleanField(null=True, blank=True, default=False)
    is_sez = models.BooleanField(null=True, blank=True, default=False)
    objects = ClientManager()

    def __str__(self):
        return self.name or ""

    class Meta:
        indexes = [
            models.Index(fields=["name"], name="idx_clit_name"),
            models.Index(fields=["type"], name="idx_clit_type"),
            models.Index(fields=["ref_code"], name="idx_clit_ref_code"),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_clit_location_site",
            ),
        ]

    @classmethod
    def create(
        cls,
        name,
        alias_name_one,
        alias_name_two,
        contact_person,
        type,
        office_address,
        city,
        state,
        zip,
        office_phone_no,
        mobile_no,
        email_id,
        website,
        fax,
        business_description,
        notes,
        location,
        site,
        cst_no,
        service_tax_no,
        bank_name,
        account_name,
        vat_no,
        ecc_no,
        bank_branch,
        account_no,
        gst_no,
        pan_no,
        ifsc_code,
        swift_code,
        edi_service,
        ref_code,
        operator_code,
        current_location_code,
        location_code,
        edi_code,
        edi_to_email_id,
        edi_cc_email_id,
        reported_by_from,
        reported_by_to,
        is_sez,
    ):
        try:
            client = cls(name=name)
            client.alias_name_one = alias_name_one
            client.alias_name_two = alias_name_two
            client.contact_person = contact_person
            client.type = type
            client.office_address = office_address
            client.city = city
            client.state = state
            client.zip = zip
            client.office_phone_no = office_phone_no
            client.mobile_no = mobile_no
            client.email_id = email_id
            client.website = website
            client.fax = fax
            client.business_description = business_description
            client.notes = notes
            client.location = location
            client.site = site
            client.cst_no = cst_no
            client.service_tax_no = service_tax_no
            client.bank_name = bank_name
            client.account_name = account_name
            client.vat_no = vat_no
            client.ecc_no = ecc_no
            client.bank_branch = bank_branch
            client.account_no = account_no
            client.gst_no = gst_no
            client.pan_no = pan_no
            client.ifsc_code = ifsc_code
            client.swift_code = swift_code
            client.edi_service = edi_service
            client.ref_code = ref_code
            client.operator_code = operator_code
            client.current_location_code = current_location_code
            client.location_code = location_code
            client.edi_code = edi_code
            client.edi_to_email_id = edi_to_email_id
            client.edi_cc_email_id = edi_cc_email_id
            client.reported_by_from = reported_by_from
            client.reported_by_to = reported_by_to
            client.is_sez = is_sez
            return client
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def create_obj(cls, client_data, location, site):
        try:
            client = cls(name=client_data["name"])
            client.alias_name_one = client_data["alias_name_one"]
            client.alias_name_two = client_data["alias_name_two"]
            client.contact_person = client_data["contact_person"]
            client.type = client_data["type"]
            client.office_address = client_data["office_address"]
            client.city = client_data["city"]
            client.state = client_data["state"]
            client.zip = client_data["zip"]
            client.office_phone_no = client_data["office_phone_no"]
            client.mobile_no = client_data["mobile_no"]
            client.email_id = client_data["email_id"]
            client.website = client_data["website"]
            client.fax = client_data["fax"]
            client.business_description = client_data["business_description"]
            client.notes = client_data["notes"]
            client.location = location
            client.site = site
            client.cst_no = client_data["cst_no"]
            client.service_tax_no = client_data["service_tax_no"]
            client.bank_name = client_data["bank_name"]
            client.account_name = client_data["account_name"]
            client.vat_no = client_data["vat_no"]
            client.ecc_no = client_data["ecc_no"]
            client.bank_branch = client_data["bank_branch"]
            client.account_no = client_data["account_no"]
            client.gst_no = client_data["gst_no"]
            client.pan_no = client_data["pan_no"]
            client.ifsc_code = client_data["ifsc_code"]
            client.swift_code = client_data["swift_code"]
            client.edi_service = client_data["edi_service"]
            client.ref_code = client_data["ref_code"]
            client.operator_code = client_data["operator_code"]
            client.current_location_code = client_data["current_location_code"]
            client.location_code = client_data["location_code"]
            client.edi_code = client_data["edi_code"]
            client.edi_to_email_id = client_data["edi_to_email_id"]
            client.edi_cc_email_id = client_data["edi_cc_email_id"]
            client.reported_by_from = client_data["reported_by_from"]
            client.reported_by_to = client_data["reported_by_to"]
            client.sales_term = client_data["sales_term"]
            client.is_sez = client_data["is_sez"]
            return client
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def create_client_code(self):
        self.code = f"GH/{str(self.pk).zfill(5)}"
        self.save()

    def get_client_name(self):
        return self.name

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

    def get_client(self):
        try:
            data = {
                "pk": self.pk,
                "name": self.name,
                "code": self.code,
                "alias_name_one": self.alias_name_one,
                "alias_name_two": self.alias_name_two,
                "type": self.type,
                "office_address": self.office_address,
                "city": self.city,
                "state": self.state,
                "zip": self.zip,
                "office_phone_no": self.office_phone_no,
                "mobile_no": self.mobile_no,
                "email_id": self.email_id,
                "website": self.website,
                "fax": self.fax,
                "business_description": self.business_description,
                "notes": self.notes,
                "cst_no": self.cst_no,
                "service_tax_no": self.service_tax_no,
                "bank_name": self.bank_name,
                "account_name": self.account_name,
                "vat_no": self.vat_no,
                "ecc_no": self.ecc_no,
                "bank_branch": self.bank_branch,
                "account_no": self.account_no,
                "gst_no": self.gst_no,
                "pan_no": self.pan_no,
                "ifsc_code": self.ifsc_code,
                "swift_code": self.swift_code,
                "edi_service": self.edi_service,
                "ref_code": self.ref_code,
                "operator_code": self.operator_code,
                "current_location_code": self.current_location_code,
                "location_code": self.location_code,
                "edi_code": self.edi_code,
                "edi_to_email_id": self.edi_to_email_id,
                "edi_cc_email_id": self.edi_cc_email_id,
                "reported_by_from": self.reported_by_from,
                "reported_by_to": self.reported_by_to,
                "sales_term": self.sales_term,
                "is_sez": self.is_sez,
            }
            if self.contact_person is None:
                data["contact_person"] = ""
            else:
                data["contact_person"] = self.contact_person
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            new_data = self.replace_none(dict_data=data)
            return new_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_client_row(self):
        try:
            data = {
                "name": self.name,
                "type": self.type,
                "gst_no": (
                    "_" if self.gst_no is None or len(self.gst_no) == 0 else self.gst_no
                ),
                "required": "_",
            }
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ClientAbbreviationManager(models.Manager):
    def getOrCreateClientAbbriation(self, params):
        self.get_or_create(**params)

    def getClientAbbreviationByParams(self, **params):
        return self.filter(params)

    def getClientAbbreviationById(self, pk):
        return self.get(pk=pk)

    def getClientAbbreviationByClient(self, client):
        return self.filter(client=client)


class ClientAbbreviation(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="client_abbreviation_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=200, null=True, blank=False)
    objects = ClientAbbreviationManager()

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=["name"], name="idx_clit_shippingline_name"),
            models.Index(
                fields=["client_id"],
                name="idx_clit_shippingline_client",
            ),
        ]

    @classmethod
    def create(cls, client, name):
        try:
            abbreviation = cls(client=client)
            abbreviation.name = name
            return abbreviation
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_abbreviation_name(self):
        return self.name


class ClientChildCompany(models.Model):
    parent = models.ForeignKey(
        Client,
        related_name="client_parent_child_company_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=200, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    gst_no = models.CharField(max_length=200, null=True, blank=True)
    state = models.CharField(
        choices=STATE_CHOICES, max_length=255, null=True, blank=True, default=None
    )
    state_code = models.CharField(max_length=200, null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        unique_together = ["name", "state", "zip_code"]

    class Meta:
        indexes = [
            models.Index(fields=["name"], name="idx_clit_chldcmpny_name"),
            models.Index(
                fields=["parent_id"],
                name="idx_clit_chldcmpny_parent",
            ),
        ]

    @classmethod
    def create(cls, parent, name, address, gst_no, state, zip_code, state_code):
        try:
            child_company = cls(parent=parent)
            child_company.name = name
            child_company.address = address
            child_company.state = state
            child_company.zip_code = zip_code
            child_company.gst_no = gst_no
            child_company.state_code = state_code
            # if gst_no is not None:
            #     child_company.state_code = gst_no[:2]
            # else:
            #     child_company.state_code = None
            child_company.zip_code = zip_code
            return child_company
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def checkExistByParent(cls, pk):
        return cls.objects.select_related("parent").filter(parent__pk=pk).exists()

    @classmethod
    def getByParent(cls, pk):
        return cls.objects.select_related("parent").filter(parent__pk=pk)

    @classmethod
    def getById(cls, pk):
        return cls.objects.get(pk=pk)

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

    def get_child_client_details(self):
        try:
            data = {
                "pk": str(self.pk),
                "parent_company": self.parent.name,
                "name": self.name,
                "address": self.address,
                "state": self.state,
                "gst_no": self.gst_no,
                "state_code": self.state_code,
                "zip_code": self.zip_code,
            }
            new_data = self.replace_none(dict_data=data)
            return new_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ClientRepresentativeManager(models.Manager):
    def bulkCreate(self, params):
        self.bulk_create(params)

    def bulkUpdate(self, params):
        self.bulk_update(params)

    def getClientRepresentativeByParams(self, **params):
        return self.filter(params)

    def getClientRepresentativeByClient(self, client):
        return self.filter(client=client)


class ClientRepresentative(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="client_representative_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=200, null=True, blank=False)
    designation = models.CharField(max_length=200, null=True, blank=False)
    phone_no = models.CharField(max_length=15, null=True, blank=True)
    mobile_no = models.CharField(max_length=15, null=True, blank=True)
    email_id = models.CharField(max_length=200, null=True, blank=True)
    objects = ClientRepresentativeManager()

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, client, name, designation, phone_no, mobile_no, email_id):
        try:
            representative = cls(client=client)
            representative.name = name
            representative.designation = designation
            representative.phone_no = phone_no
            representative.mobile_no = mobile_no
            representative.email_id = email_id
            return representative
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

    def get_representative(self):
        try:
            data = {
                "pk": self.pk,
                "client": self.client.name,
                "name": self.name,
                "designation": self.designation,
                "phone_no": self.phone_no,
                "mobile_no": self.mobile_no,
                "email_id": self.email_id,
            }
            new_data = self.replace_none(dict_data=data)
            return new_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ClientDocumentManager(models.Manager):
    def getClientDocumentQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Client Document Not Found")

    def getClientDocumentById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Client Document Not Found")


class ClientDocument(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="client_document_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=200, null=True, blank=False)
    document_s3_object_name = models.TextField(null=True, blank=True)
    document_s3_file_name = models.TextField(null=True, blank=True)
    objects = ClientDocumentManager()

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, client, name):
        try:
            doc = cls(client=client)
            doc.name = name
            return doc
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

    def get_doc_detail(self):
        try:
            data = {"pk": self.pk, "client": self.client.name, "name": self.name}
            new_data = self.replace_none(dict_data=data)
            return new_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


HANDLING_TYPE = [("Lift ON ", "Lift ON"), ("Lift OFF", "Lift OFF")]

TRANSPORTATION_TYPE = [
    ("Factory", "Factory"),
    ("Road", "Road"),
    ("Rail", "Rail"),
    ("CFS/ICD", "CFS/ICD"),
    ("Port/Vessel", "Port/Vessel"),
]


class HandlingChargeManager(models.Manager):
    def getHandlingChargeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Handling Charge not found")

    def getHandlingChargeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Handling Charge not found")


class HandlingCharge(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="client_handling_charge_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    type = models.CharField(
        max_length=200, null=True, blank=False, choices=HANDLING_TYPE
    )
    rate_of = models.CharField(
        max_length=200, null=True, blank=False, choices=CLIENT_TYPE
    )
    location = models.ForeignKey(
        Location,
        related_name="handling_charge_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="handling_charge_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="handling_charge_container_size_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    objects = HandlingChargeManager()

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, client, type, rate_of, location, site, size, amount):
        try:
            charge = cls(client=client)
            charge.type = type
            charge.rate_of = rate_of
            charge.location = location
            charge.site = site
            charge.size = size
            charge.amount = amount
            return charge
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

    def get_charge_detail(self):
        try:
            data = {
                "pk": self.pk,
                "type": self.type,
                "rate_of": self.rate_of,
                "amount": str(self.amount),
            }
            if self.client is None:
                data["client"] = ""
            else:
                data["client"] = self.client.name

            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size.name

            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            new_data = self.replace_none(dict_data=data)
            return new_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class TransportationChargeManager(models.Manager):
    def getTransportationChargeQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Transportation Charge not found")

    def getTransportationChargeById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Transportation Charge not found")


class TransportationCharge(models.Model):
    client = models.ForeignKey(
        Client,
        related_name="client_transportation_charge_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    type = models.CharField(
        max_length=200, null=True, blank=False, choices=TRANSPORTATION_TYPE
    )
    location = models.ForeignKey(
        Location,
        related_name="transportation_charge_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="transportation_charge_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="transportation_charge_container_size_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    objects = TransportationChargeManager()

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, client, type, location, site, size, amount):
        try:
            charge = cls(client=client)
            charge.type = type
            charge.location = location
            charge.site = site
            charge.size = size
            charge.amount = amount
            return charge
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

    def get_charge_detail(self):
        try:
            data = {"pk": self.pk, "type": self.type, "amount": str(self.amount)}
            if self.client is None:
                data["client"] = ""
            else:
                data["client"] = self.client.name

            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size.name

            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            new_data = self.replace_none(dict_data=data)
            return new_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class GroundRentManager(models.Manager):
    def getGroundRentQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Ground Rent not found")

    def getGroundRentById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Ground Rent not found")


class GroundRent(models.Model):
    client_ref_code = models.CharField(max_length=200, null=True, blank=False)
    location = models.ForeignKey(
        Location,
        related_name="ground_rent_location_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="ground_rent_site_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="ground_rent_container_size_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    day_1_to_30_amount = models.DecimalField(
        null=True, blank=False, decimal_places=2, default=0, max_digits=10
    )
    day_31_to_60_amount = models.DecimalField(
        null=True, blank=False, decimal_places=2, default=0, max_digits=10
    )
    day_61_to_90_amount = models.DecimalField(
        null=True, blank=False, decimal_places=2, default=0, max_digits=10
    )
    day_91_to_120_amount = models.DecimalField(
        null=True, blank=False, decimal_places=2, default=0, max_digits=10
    )
    day_over_120_amount = models.DecimalField(
        null=True, blank=False, decimal_places=2, default=0, max_digits=10
    )
    objects = GroundRentManager()

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(
        cls,
        client_ref_code,
        location,
        site,
        size,
        day_1_to_30_amount,
        day_31_to_60_amount,
        day_61_to_90_amount,
        day_91_to_120_amount,
        day_over_120_amount,
    ):
        try:
            rent_object = cls(client_ref_code=client_ref_code)
            rent_object.location = location
            rent_object.site = site
            rent_object.size = size
            rent_object.day_1_to_30_amount = day_1_to_30_amount
            rent_object.day_31_to_60_amount = day_31_to_60_amount
            rent_object.day_61_to_90_amount = day_61_to_90_amount
            rent_object.day_91_to_120_amount = day_91_to_120_amount
            rent_object.day_over_120_amount = day_over_120_amount
            return rent_object
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_ground_rent_detail(self):
        try:
            data = {
                "pk": self.pk,
                "client_ref_code": self.client_ref_code,
                "day_1_to_30_amount": str(self.day_1_to_30_amount),
                "day_31_to_60_amount": str(self.day_31_to_60_amount),
                "day_61_to_90_amount": str(self.day_61_to_90_amount),
                "day_91_to_120_amount": str(self.day_91_to_120_amount),
                "day_over_120_amount": str(self.day_over_120_amount),
            }
            if self.size is None:
                data["size"] = ""
            else:
                data["size"] = self.size.name

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


class SealNoManager(models.Manager):
    def getSealNoQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Seal No Not Found")

    # def existsSealNoInSystem(self,number):
    #     return SealNo.objects.filter(number=number).exists() or ContainerStock.objects.filter(seal_no=number).exists() or GateOut.objects.filter(seal_no=number).exists()

    def createSealNo(self, params):
        return self.create(**params)

    def getSealNoById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Seal No Not Found")


class SealNo(models.Model):
    number = models.CharField(max_length=100, blank=True, null=True, unique=True)
    seal_box_number = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="seal_no_location_rel",
        blank=False,
        null=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="seal_no_site_rel",
        blank=False,
        null=True,
        on_delete=models.CASCADE,
    )
    line = models.CharField(max_length=100, blank=True, null=True)
    container_no = models.CharField(max_length=100, blank=True, null=True)
    in_date = models.DateTimeField(null=True, blank=True)
    in_use_date = models.DateTimeField(null=True, blank=True)
    out_date = models.DateTimeField(null=True, blank=True)
    is_available = models.BooleanField(null=True, blank=True, default=True)
    is_damaged = models.BooleanField(null=True, blank=True, default=False)
    is_cut = models.BooleanField(null=True, blank=True, default=False)
    in_use = models.BooleanField(null=True, blank=True, default=False)
    is_first_allotment = models.BooleanField(null=True, blank=True, default=True)
    is_lock = models.BooleanField(null=True, blank=True, default=False)
    objects = SealNoManager()

    def __str__(self):
        return self.number

    @classmethod
    def create(cls, number, seal_box_number, location, site, line, in_date):
        try:
            seal_no = cls(number=number, seal_box_number=seal_box_number)
            seal_no.location = location
            seal_no.site = site
            seal_no.line = line
            seal_no.in_date = in_date
            return seal_no
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_seal_no(self):
        try:
            data = {"pk": self.pk}

            if self.number is None:
                data["number"] = ""
            else:
                data["number"] = self.number

            if self.seal_box_number is None:
                data["seal_box_number"] = ""
            else:
                data["seal_box_number"] = self.seal_box_number

            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name

            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name

            if self.line is None:
                data["line"] = ""
            else:
                data["line"] = self.line

            if self.container_no is None:
                data["container_no"] = ""
            else:
                data["container_no"] = self.container_no

            if self.in_date is None:
                data["in_date"] = ""
                data["in_time"] = ""
            else:
                data["in_date"] = (
                    self.in_date.astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%Y-%m-%d")
                )
                data["in_time"] = (
                    self.in_date.astimezone(timezone.get_current_timezone())
                    .time()
                    .strftime("%H:%M")
                )

            if self.out_date is None:
                data["out_date"] = ""
                data["out_time"] = ""
            else:
                data["out_date"] = (
                    self.out_date.astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%Y-%m-%d")
                )
                data["out_time"] = (
                    self.out_date.astimezone(timezone.get_current_timezone())
                    .time()
                    .strftime("%H:%M")
                )

            if self.in_use_date is None:
                data["in_use_date"] = ""
                data["in_use_time"] = ""
            else:
                data["in_use_date"] = (
                    self.in_use_date.astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%Y-%m-%d")
                )
                data["in_use_time"] = (
                    self.in_use_date.astimezone(timezone.get_current_timezone())
                    .time()
                    .strftime("%H:%M")
                )

            if self.is_available is None:
                data["is_available"] = ""
            else:
                data["is_available"] = self.is_available

            if self.is_damaged is None:
                data["is_damaged"] = ""
            else:
                data["is_damaged"] = self.is_damaged

            if self.is_cut is None:
                data["is_cut"] = ""
            else:
                data["is_cut"] = self.is_cut

            if self.in_use is None:
                data["in_use"] = ""
            else:
                data["in_use"] = self.in_use

            if self.is_first_allotment is None:
                data["is_first_allotment"] = ""
            else:
                data["is_first_allotment"] = self.is_first_allotment

            if self.is_lock is None:
                data["is_lock"] = ""
            else:
                data["is_lock"] = self.is_lock
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


SEAL_UPDATE_REMARKS = [
    ("Damaged", "Damaged"),
    ("Cut", "Cut"),
    ("Wrong Allotment", "Wrong Allotment"),
]


class SealUpdateTracker(models.Model):
    container_no = models.CharField(max_length=100)
    stock_id = models.CharField(max_length=100)
    location = models.ForeignKey(
        Location,
        related_name="sealnout_loc_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="sealnout_site_rel",
        on_delete=models.CASCADE,
    )
    old_seal_no = models.ForeignKey(
        SealNo,
        related_name="old_seal_no_rel",
        on_delete=models.CASCADE,
    )
    new_seal_no = models.ForeignKey(
        SealNo,
        related_name="new_seal_no_rel",
        on_delete=models.CASCADE,
    )
    updated_at = models.DateTimeField(auto_now_add=True)
    remarks = models.CharField(choices=SEAL_UPDATE_REMARKS, max_length=255)

    def __str__(self):
        return f"{self.container_no} - {self.old_seal_no.number} to {self.new_seal_no.number}"

    @classmethod
    def create(
        cls, container_no, stock_id, location, site, old_seal_no, new_seal_no, remarks
    ):
        try:
            tracker = cls(
                container_no=container_no,
                stock_id=stock_id,
                location=location,
                site=site,
                old_seal_no=old_seal_no,
                new_seal_no=new_seal_no,
                remarks=remarks,
            )
            if remarks == "Damaged":
                old_seal_no.is_damaged = True
                old_seal_no.is_cut = False
                old_seal_no.save()
                new_seal_no.is_first_allotment = False
                new_seal_no.save()
            elif remarks == "Cut":
                old_seal_no.is_cut = True
                old_seal_no.is_damaged = False
                old_seal_no.save()
                new_seal_no.is_first_allotment = False
                new_seal_no.save()
            else:
                old_seal_no.is_cut = False
                old_seal_no.is_damaged = False
                old_seal_no.save()
                new_seal_no.is_first_allotment = False
                new_seal_no.save()
            tracker.save()
            return tracker
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_tracker_detail(self):
        try:
            data = {
                "container_no": self.container_no,
                "old_seal_no": self.old_seal_no.number if self.old_seal_no else "",
                "new_seal_no": self.new_seal_no.number if self.new_seal_no else "",
                "updated_at": (
                    self.updated_at.date().strftime("%d-%m-%Y")
                    if self.updated_at
                    else ""
                ),
                "remarks": self.remarks,
            }
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class LineHandlingCharges(models.Model):
    ref_code = models.CharField(max_length=100, null=True, blank=True)

    size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    night_charge_size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    night_charge_size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        related_name="line_lolo_chg_loc_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="line_lolo_chg_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, payload):
        params = {
            "ref_code": payload.get("ref_code"),
            "size_20_rate": payload.get("size_20_rate"),
            "size_40_rate": payload.get("size_40_rate"),
            "night_charge_size_20_rate": payload.get("night_charge_size_20_rate"),
            "night_charge_size_40_rate": payload.get("night_charge_size_40_rate"),
            "location": payload.get("location"),
            "site": payload.get("site"),
        }
        return cls.objects.create(**params)

    def get_data(self):
        data = {
            "pk": self.pk,
            "ref_code": self.ref_code,
            "size_20_rate": float(self.size_20_rate),
            "size_40_rate": float(self.size_40_rate),
            "night_charge_size_20_rate": float(self.night_charge_size_20_rate),
            "night_charge_size_40_rate": float(self.night_charge_size_40_rate),
            "location": self.location.name,
            "site": self.site.name,
        }
        return data


class HandlingChargesHistory(models.Model):
    ref_code = models.CharField(max_length=100, null=True, blank=True)
    client_type = models.CharField(
        max_length=200, null=True, blank=False, choices=CLIENT_TYPE
    )
    size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    night_charge_size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    night_charge_size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        related_name="lolo_his_chg_loc_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="lolo_his_chg_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, payload):
        params = {
            "ref_code": (
                payload.get("ref_code")
                if payload.get("client_type") == "Line"
                else None
            ),
            "client_type": payload.get("client_type"),
            "size_20_rate": payload.get("size_20_rate"),
            "size_40_rate": payload.get("size_40_rate"),
            "night_charge_size_20_rate": payload.get("night_charge_size_20_rate"),
            "night_charge_size_40_rate": payload.get("night_charge_size_40_rate"),
            "location": payload.get("location"),
            "site": payload.get("site"),
        }
        return cls.objects.create(**params)

    def get_data(self):
        data = {
            "pk": self.pk,
            "ref_code": self.ref_code,
            "client_type": self.client_type,
            "size_20_rate": float(self.size_20_rate),
            "size_40_rate": float(self.size_40_rate),
            "night_charge_size_20_rate": float(self.night_charge_size_20_rate),
            "night_charge_size_40_rate": float(self.night_charge_size_40_rate),
            "location": self.location.name,
            "site": self.site.name,
        }
        return data
