# other imports
from django.db import models
import traceback
import logging
import datetime
import fiscalyear
from django.utils import timezone
from common.exceptions import ResourceNotFound

# model imports
from master.models import Location, Site
from master.models_two import Client, ClientChildCompany

# Create your models here.
CUSTOMER_TYPE = [("Line", "Line"), ("Party", "Party")]

BILL_FOR = [("IN", "IN"), ("OUT", "OUT")]
SIZE = [("20", "20"), ("40", "40")]
PROCESS = [("Repair", "Repair"), ("Washing/Cleaning", "Washing/Cleaning")]

PAYMENT_TYPE = [
    ("Cash", "Cash"),
    ("Cheque", "Cheque"),
    ("NEFT", "NEFT"),
    ("RTGS", "RTGS"),
    ("Outstanding", "Outstanding"),
    ("Credit", "Credit"),
]
CHARGE_TYPE = [
    ("Washing/Cleaning", "Washing/Cleaning"),
    ("Repair", "Repair"),
    ("Handling", "Handling"),
    ("Transportation", "Transportation"),
    ("Ground Rent", "Ground Rent"),
    ("Night Charge", "Night Charge"),
]
INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Lakshadweep",
    "Delhi",
    "Puducherry",
]
STATE_CODES = {
    "Andhra Pradesh": "37",
    "Arunachal Pradesh ": "12",
    "Assam": "18",
    "Bihar": "10",
    "Chattisgarh": "22",
    "Goa": "30",
    "Gujarat": "24",
    "Haryana": "06",
    "Himachal Pradesh": "02",
    "Jammu and Kashmir": "01",
    "Jharkhand": "20",
    "Karnataka": "29",
    "Kerala": "32",
    "Madhya Pradesh": "23",
    "Maharashtra": "27",
    "Manipur": "14",
    "Meghalaya": "17",
    "Mizoram": "15",
    "Nagaland": "13",
    "Odisha": "21",
    "Punjab": "03",
    "Rajasthan": "08",
    "Sikkim": "11",
    "Tamil Nadu": "33",
    "Telangana": "36",
    "Tripura": "16",
    "Uttar Pradesh": "09",
    "Uttarakhand": "05",
    "West Bengal": "19",
    "Andaman and Nicobar Islands": "35",
    "Chandigarh": "04",
    "Dadra and Nagar Haveli": "26",
    "Daman and Diu": "26",
    "Lakshadweep": "31",
    "Delhi": "07",
    "Puducherry": "97",
}


def get_fiscal_year_date():
    fiscalyear.START_MONTH = 4
    cur_y = fiscalyear.FiscalYear(
        datetime.datetime.now().astimezone(timezone.get_current_timezone()).year + 1
    )
    start_date = cur_y.start.date()
    end_date = cur_y.end.date()
    return start_date, end_date


def getFinancialYear():
    current = datetime.datetime.now()
    year = current.year
    if current.month >= 4:
        return f"{str(year)[2:]}-{str(year+1)[2:]}"
    else:
        return f"{str(year-1)[2:]}-{str(year)[2:]}"


def none_to_empty_str(items):
    return {each: "" if items[each] is None else items[each] for each in items}


class CustomerBillManager(models.Manager):

    def getBillQuerysetByParams(self, params):
        try:
            return self.select_related("client", "customer").filter(**params)
        except:
            raise ResourceNotFound("Data not found")

    def getBillQuerysetByPkList(self, pks):
        try:
            return self.select_related("client", "customer").filter(pk__in=pks)
        except:
            raise ResourceNotFound("Data not found")


class CustomerBill(models.Model):
    lolo_id = models.CharField(max_length=100, null=True, blank=True)
    st_id = models.CharField(max_length=100, null=True, blank=True)
    survey_id = models.CharField(max_length=100, null=True, blank=True)
    bill_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CHARGE_TYPE
    )
    bill_date = models.DateField(null=True, blank=True)
    apply_charge = models.CharField(
        max_length=100, null=True, blank=False, choices=CUSTOMER_TYPE
    )
    bill_for = models.CharField(
        max_length=100, null=True, blank=False, choices=BILL_FOR
    )
    ref_code = models.CharField(max_length=100, null=True, blank=True)
    container_no = models.CharField(max_length=200, null=True, blank=False)
    client = models.ForeignKey(
        Client,
        related_name="customer_bill_client_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    customer = models.ForeignKey(
        Client,
        related_name="customer_bill_customer_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    is_payment_completed = models.BooleanField(null=True, blank=True, default=False)
    payment_type = models.CharField(
        max_length=200, null=True, blank=True, choices=PAYMENT_TYPE
    )
    original_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remaining_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        related_name="customer_bill_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="customer_bill_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    mnr_invoice_id = models.CharField(max_length=100, null=True, blank=True)
    is_locked = models.BooleanField(default=False)
    credit_note_mnr = models.BooleanField(null=True, blank=True, default=False)
    objects = CustomerBillManager()

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(
        cls,
        lolo_id,
        st_id,
        survey_id,
        bill_type,
        bill_date,
        apply_charge,
        container_no,
        client,
        customer,
        ref_code,
        is_payment_completed,
        payment_type,
        original_amount,
        remaining_amount,
        bill_for,
        location,
        site,
    ):
        try:
            customer_bill = cls(container_no=container_no)
            customer_bill.lolo_id = lolo_id
            customer_bill.st_id = st_id
            customer_bill.survey_id = survey_id
            customer_bill.bill_type = bill_type
            customer_bill.bill_date = bill_date
            customer_bill.apply_charge = apply_charge
            customer_bill.client = client
            customer_bill.customer = customer
            customer_bill.ref_code = ref_code
            customer_bill.is_payment_completed = is_payment_completed
            customer_bill.payment_type = payment_type
            customer_bill.original_amount = original_amount
            customer_bill.remaining_amount = remaining_amount
            customer_bill.bill_for = bill_for
            customer_bill.location = location
            customer_bill.site = site

            return customer_bill
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_customer_bill(self):
        try:
            data = {
                "pk": self.pk,
                "bill_type": self.bill_type,
                "bill_date": (
                    self.bill_date.strftime("%d/%m/%Y") if self.bill_date else None
                ),
                "apply_charge": self.apply_charge,
                "container_no": self.container_no,
                "client": self.client.name if self.client else None,
                "customer": self.customer.name if self.customer else None,
                "ref_code": self.ref_code,
                "is_payment_completed": self.is_payment_completed,
                "payment_type": self.payment_type,
                "bill_for": self.bill_for,
                "original_amount": str(self.original_amount),
                "remaining_amount": str(self.remaining_amount),
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
            }
            return none_to_empty_str(items=data)

        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_customer_bill_view(self):
        try:
            data = {
                "pk": self.pk,
                "bill_type": self.bill_type,
                "bill_date": (
                    self.bill_date.strftime("%d/%m/%Y") if self.bill_date else None
                ),
                "apply_charge": self.apply_charge,
                "container_no": self.container_no,
                "client": self.client.name if self.client else None,
                "customer": self.customer.name if self.customer else None,
                "original_amount": str(self.original_amount),
                "remaining_amount": str(self.remaining_amount),
                "bill_for": self.bill_for,
                "is_locked": self.is_locked,
            }
            return none_to_empty_str(items=data)

        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_mnr_invoice_view(self):
        try:
            invoice = CustomerBillInvoice.objects.select_related("client").get(
                pk=self.mnr_invoice_id
            )
            data = {
                "pk": self.mnr_invoice_id,
                "invoice_no": invoice.invoice_no,
                "invoice_date": (
                    invoice.invoice_date.strftime("%d/%m/%Y")
                    if invoice.invoice_date
                    else None
                ),
                "bill_type": self.bill_type,
                "client": invoice.client.name if invoice.client else None,
                "total_amount": str(self.original_amount),
                "container_no": self.container_no,
                "credit_note": self.credit_note_mnr,
            }

            return none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class CustomerBillInvoice(models.Model):
    invoice_no = models.CharField(max_length=100, null=True, blank=True)
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    invoice_date = models.DateField(null=True, blank=True)
    bill_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CHARGE_TYPE
    )
    discount = models.CharField(max_length=100, null=True, blank=True)
    client_discount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_transaction_effected = models.BooleanField(null=True, blank=True, default=True)
    apply_igst = models.BooleanField(null=True, blank=True, default=False)
    hsn_code = models.CharField(max_length=200, null=True, blank=True, default=None)
    ref_booking_no = models.CharField(max_length=200, null=True, blank=True)
    ref_bl_no = models.CharField(max_length=200, null=True, blank=True)
    place_of_supply = models.CharField(max_length=200, null=True, blank=True)
    from_supply_date = models.DateField(null=True, blank=True)
    to_supply_date = models.DateField(null=True, blank=True)
    supply_date = models.DateField(null=True, blank=True)
    client = models.ForeignKey(
        Client,
        related_name="client_customer_bill_invoice_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    bill_to_party_client = models.ForeignKey(
        ClientChildCompany,
        related_name="bill_to_party_customer_bill_invoice_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    ship_to_party_client = models.ForeignKey(
        ClientChildCompany,
        related_name="ship_to_party_customer_bill_invoice_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remark = models.TextField(null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="customer_bill_invoice_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="customer_bill_invoice_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
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
    invoice_on_old_lolo_rate = models.BooleanField(null=True, blank=True, default=False)
    apply_gst = models.BooleanField(null=True, blank=True, default=True)

    def __str__(self):
        return self.invoice_no

    @classmethod
    def create(
        cls,
        client,
        bill_to_party_client,
        ship_to_party_client,
        apply_igst,
        location,
        site,
        data,
        apply_gst
    ):
        try:
            invoice_no = data["invoice_label"] + data["invoice_no"]
            fin_year = getFinancialYear()
            invoice_bill = cls(invoice_no=invoice_no)
            invoice_bill.financial_year = fin_year
            invoice_bill.invoice_date = datetime.datetime.strptime(
                data["invoice_date"], "%d/%m/%Y"
            ).date()
            invoice_bill.bill_type = data["bill_type"]
            invoice_bill.hsn_code = data["hsn_code"]
            invoice_bill.client = client
            invoice_bill.ref_booking_no = data["ref_booking_no"]
            invoice_bill.ref_bl_no = data["ref_bl_no"]
            invoice_bill.place_of_supply = data["place_of_supply"]
            invoice_bill.supply_date = (
                datetime.datetime.strptime(data["supply_date"], "%d/%m/%Y").date()
                if data["supply_date"]
                else None
            )
            invoice_bill.from_supply_date = (
                datetime.datetime.strptime(data["from_supply_date"], "%Y-%m-%d").date()
                if data["from_supply_date"]
                else None
            )
            invoice_bill.to_supply_date = (
                datetime.datetime.strptime(data["to_supply_date"], "%Y-%m-%d").date()
                if data["to_supply_date"]
                else None
            )
            invoice_bill.bill_to_party_client = bill_to_party_client
            invoice_bill.ship_to_party_client = ship_to_party_client
            invoice_bill.apply_igst = apply_igst
            invoice_bill.apply_gst = apply_gst
            invoice_bill.total_amount = data["total_amount"]
            invoice_bill.remark = data["remark"]
            invoice_bill.location = location
            invoice_bill.site = site
            if data["bill_type"] == "Handling":
                invoice_bill.discount = data["discount"]
            else:
                invoice_bill.discount = "0"
            invoice_bill.client_discount = data.get("client_discount", 0)

            return invoice_bill
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_customer_bill_invoice(self):
        try:
            data = {
                "pk": self.pk,
                "invoice_label": self.invoice_no[:-4],
                "invoice_no": self.invoice_no[-4:].replace("/", ""),
                "apply_igst": self.apply_igst,
                "apply_gst": self.apply_gst,
                "invoice_date": (
                    self.invoice_date.strftime("%d/%m/%Y")
                    if self.invoice_date
                    else None
                ),
                "bill_type": self.bill_type,
                "hsn_code": self.hsn_code,
                "ref_booking_no": self.ref_booking_no,
                "ref_bl_no": self.ref_bl_no,
                "place_of_supply": self.place_of_supply,
                "supply_date": (
                    self.supply_date.strftime("%d/%m/%Y") if self.supply_date else None
                ),
                "from_supply_date": (
                    self.from_supply_date.strftime("%Y-%m-%d")
                    if self.from_supply_date
                    else None
                ),
                "to_supply_date": (
                    self.to_supply_date.strftime("%Y-%m-%d")
                    if self.to_supply_date
                    else None
                ),
                "main_client": self.client.name if self.client else None,
                "bill_to_party_client": (
                    self.bill_to_party_client.name
                    if self.bill_to_party_client
                    else None
                ),
                "bill_to_party_client_pk": (
                    str(self.bill_to_party_client.pk)
                    if self.bill_to_party_client
                    else None
                ),
                "bill_to_party_address": self.bill_to_party_client.address,
                "bill_to_party_gst_no": self.bill_to_party_client.gst_no,
                "bill_to_party_state": self.bill_to_party_client.state,
                "bill_to_party_state_code": (
                    self.bill_to_party_client.state_code
                    if self.bill_to_party_client
                    else None
                ),
                "bill_to_party_zip_code": self.bill_to_party_client.zip_code,
                "ship_to_party_client": (
                    self.ship_to_party_client.name
                    if self.ship_to_party_client
                    else None
                ),
                "ship_to_party_client_pk": (
                    str(self.ship_to_party_client.pk)
                    if self.ship_to_party_client
                    else None
                ),
                "ship_to_party_address": (
                    self.ship_to_party_client.address
                    if self.ship_to_party_client
                    else None
                ),
                "ship_to_party_gst_no": (
                    self.ship_to_party_client.gst_no
                    if self.ship_to_party_client
                    else None
                ),
                "ship_to_party_state": (
                    self.ship_to_party_client.state
                    if self.ship_to_party_client
                    else None
                ),
                "ship_to_party_state_code": (
                    self.ship_to_party_client.state_code
                    if self.ship_to_party_client
                    else None
                ),
                "ship_to_party_zip_code": (
                    self.ship_to_party_client.zip_code
                    if self.ship_to_party_client
                    else None
                ),
                "total_amount": str(self.total_amount),
                "remark": self.remark,
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
                "indian_state_list": INDIAN_STATES,
                "state_codes": STATE_CODES,
                "discount": self.discount,
                "client_discount": self.client_discount,
                "invoice_on_old_lolo_rate": self.invoice_on_old_lolo_rate,
            }
            return none_to_empty_str(items=data)

        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    # def get_customer_bill_view(self):
    #     try:
    #         data = {
    #             "pk": self.pk,
    #             "invoice_no": self.invoice_no,
    #             "invoice_date": self.invoice_date.strftime("%d/%m/%Y")
    #             if self.invoice_date
    #             else None,
    #             "bill_type": self.bill_type,
    #             "client": self.client.name if self.client else None,
    #             "total_amount": str(self.total_amount),

    #         }
    #         return none_to_empty_str(items=data)
    #     except Exception:
    #         error_log = logging.getLogger("error_log")
    #         error_log.error(traceback.format_exc())
    #         return None


class CustomerBillInvoiceLineManager(models.Manager):
    def getCustomerBillInvoiceLineQuerysetByParams(self, params):
        try:
            return self.select_related(
                "parent__client",
            ).filter(**params)
        except:
            raise ResourceNotFound("Data not found")

    def getCustomerBillInvoiceLineQuerysetByPkList(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Data not found")


class CustomerBillInvoiceLine(models.Model):
    parent = models.ForeignKey(
        CustomerBillInvoice,
        related_name="customer_bill_invoice_line_parent_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    original_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remaining_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    container_no = models.CharField(max_length=200, null=True, blank=True)
    rec_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    bill_id = models.CharField(max_length=100, null=True, blank=True)
    credit_note = models.BooleanField(null=True, blank=True, default=False)
    objects = CustomerBillInvoiceLineManager()

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, parent, data):
        try:
            invoice_line = cls(container_no=data["container_no"])
            invoice_line.parent = parent

            invoice_line.original_amount = data["original_amount"]

            invoice_line.rec_amount = float(data["rec_amount"])
            if parent.bill_type == "Handling":
                invoice_line.remaining_amount = 0
            else:
                invoice_line.remaining_amount = float(data["remaining_amount"]) - float(
                    data["rec_amount"]
                )

            invoice_line.bill_id = data["bill_id"]
            return invoice_line
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_customer_bill_invoice_line(self):
        try:
            data = {
                "pk": self.pk,
                "parent": self.parent.invoice_no,
                "original_amount": self.original_amount,
                "remaining_amount": self.remaining_amount,
                "container_no": self.container_no,
                "rec_amount": self.rec_amount,
                "bill_id": self.bill_id,
            }
            return none_to_empty_str(items=data)

        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_customer_bill_view(self):
        try:
            data = {
                "pk": self.parent.pk,
                "invoice_no": self.parent.invoice_no,
                "invoice_date": (
                    self.parent.invoice_date.strftime("%d/%m/%Y")
                    if self.parent.invoice_date
                    else None
                ),
                "bill_type": self.parent.bill_type,
                "client": self.parent.client.name if self.parent.client else None,
                "total_amount": str(self.rec_amount),
                "container_no": self.container_no,
                "credit_note": self.credit_note,
            }
            return none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class MNRInvoiceLine(models.Model):
    parent = models.ForeignKey(
        CustomerBillInvoice,
        related_name="mnr_invoice_line_parent_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    process = models.CharField(max_length=100, null=True, blank=True, choices=PROCESS)
    size = models.CharField(max_length=100, null=True, blank=True, choices=SIZE)
    bill_ids = models.CharField(max_length=200, null=True, blank=True)
    bill_count = models.IntegerField(null=True, blank=True)
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    discount = models.CharField(max_length=100, null=True, blank=True)
    total_amount_after_discount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(cls, parent, data):
        try:
            invoice_line = cls(process=data["process"])
            invoice_line.parent = parent

            invoice_line.size = data["size"]

            invoice_line.bill_ids = data["bill_ids"]
            invoice_line.discount = data["discount"]
            invoice_line.total_amount = float(data["total_amount"])
            invoice_line.total_amount_after_discount = float(
                data["total_amount_after_discount"]
            )
            invoice_line.bill_count = data["bill_count"]
            return invoice_line
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class CreditNote(models.Model):
    credit_note_no = models.CharField(max_length=100, null=True, blank=True)
    credit_note_date = models.DateField(null=True, blank=True)
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    bill_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CHARGE_TYPE
    )
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remark = models.TextField(null=True, blank=True)
    invoice = models.ForeignKey(
        CustomerBillInvoice,
        related_name="credit_note_customer_bill_invoice_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
