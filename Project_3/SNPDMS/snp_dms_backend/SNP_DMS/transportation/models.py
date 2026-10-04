from django.db import models
from master.models import *
from master.models_two import *
import traceback, logging
from common.functions import *

# Choices
PAYMENT_TYPE = [
    ("CASH", "CASH"),
    ("CHEQUE", "CHEQUE"),
]

ACCOUNT_TYPE = [("CASH_ON_HAND", "CASH_ON_HAND"), ("BANK", "BANK")]

CATEGORY = [
    ("Container Yard", "Container Yard"),
    ("Transporter", "Transporter"),
    ("Maintenance", "Maintenance"),
    ("Fuel Pump", "Fuel Pump"),
    ("Other Expenses", "Other Expenses"),
]

TYPE = [
    ("EXPORT", "EXPORT"),
    ("IMPORT", "IMPORT"),
    ("BY ROAD", "BY ROAD"),
    ("LOOSE", "LOOSE"),
]
BOOKING_TYPE = [
    ("BOOKING", "BOOKING"),
    ("RENT", "RENT"),
]

RCM_TYPE = [
    ("Yes", "Yes"),
    ("No", "No"),
]

BOOKING_CATEGORY = [
    ("Freight", "Freight"),
]

ENTRY_TYPE = [
    ("Billwise", "Billwise"),
    ("Normal", "Normal"),
]
TRANSACTION = [
    ("Payment", "Payment"),
    ("Receipt", "Receipt"),
]
CHEQUE_TYPE = [
    ("A/C Payee", "A/C Payee"),
    ("Blank", "Blank"),
    ("No", "No"),
]

BILL_TYPE = [("LR Wise", "LR Wise")]

TRANSPORTATION_TYPE = [
    ("Credit", "Credit"),
    ("Debit", "Debit"),
]

PURPOSE = [
    ("PAYMENT", "PAYMENT"),
    ("RECEIPT", "RECEIPT"),
    ("INVOICE", "INVOICE"),
    ("CONTRA", "CONTRA"),
    ("JOURNAL", "JOURNAL"),
    ("BOOKING", "BOOKING"),
    ("INVOICE", "INVOICE"),
]


class AccountMaster(models.Model):
    account_type = models.CharField(
        max_length=200, null=True, blank=True, choices=ACCOUNT_TYPE
    )
    name = models.CharField(max_length=200, null=True, blank=False)
    address = models.TextField(null=True, blank=True)
    contact_no = models.CharField(max_length=15, null=True, blank=True)
    email_id = models.CharField(max_length=200, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    total_balance = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        related_name="account_masters_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="account_masters_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.name

    @classmethod
    def create(
        cls,
        account_type,
        name,
        address,
        contact_no,
        email_id,
        remarks,
        total_balance,
        location,
        site,
    ):
        try:
            account_master = cls(name=name)
            account_master.address = address
            account_master.account_type = account_type
            account_master.contact_no = contact_no
            account_master.email_id = email_id
            account_master.remarks = remarks
            account_master.total_balance = total_balance
            account_master.location = location
            account_master.site = site
            return account_master
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_account(self):
        try:
            data = {
                "pk": str(self.pk),
                "name": self.name,
                "account_type": self.account_type,
                "address": self.address,
                "contact_no": self.contact_no,
                "email_id": self.email_id,
                "remarks": self.remarks,
                "total_balance": str(self.total_balance),
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class CustomerMaster(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    address = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=200, null=True, blank=True)
    state_code = models.CharField(max_length=200, null=True, blank=True)
    gstin = models.CharField(max_length=100, null=True, blank=True)
    pan_no = models.CharField(max_length=100, null=True, blank=True)
    contact_no = models.CharField(max_length=15, null=True, blank=True)
    email_id = models.CharField(max_length=200, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    tds = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="customer_master_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="customer_master_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.name

    @classmethod
    def create(
        cls,
        name,
        address,
        state,
        state_code,
        gstin,
        pan_no,
        contact_no,
        email_id,
        remarks,
        tds,
        location,
        site,
    ):
        try:
            customer_master = cls(name=name)
            customer_master.address = address
            customer_master.state = state
            customer_master.state_code = state_code
            customer_master.gstin = gstin
            customer_master.pan_no = pan_no
            customer_master.contact_no = contact_no
            customer_master.email_id = email_id
            customer_master.remarks = remarks
            customer_master.tds = tds
            customer_master.location = location
            customer_master.site = site
            return customer_master
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_customer(self):
        try:
            data = {
                "pk": str(self.pk),
                "name": self.name,
                "address": self.address,
                "state": self.state,
                "state_code": self.state_code,
                "gstin": self.gstin,
                "pan_no": self.pan_no,
                "contact_no": self.contact_no,
                "email_id": self.email_id,
                "remarks": self.remarks,
                "tds": self.tds,
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class CreditorMaster(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    category = models.CharField(max_length=200, null=True, blank=True, choices=CATEGORY)
    address = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=200, null=True, blank=True)
    state_code = models.CharField(max_length=200, null=True, blank=True)
    gstin = models.CharField(max_length=100, null=True, blank=True)
    pan_no = models.CharField(max_length=100, null=True, blank=True)
    contact_no = models.CharField(max_length=15, null=True, blank=True)
    email_id = models.CharField(max_length=200, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    tds = models.CharField(max_length=100, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="creditor_master_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="creditor_master_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.name

    @classmethod
    def create(
        cls,
        name,
        category,
        address,
        state,
        state_code,
        gstin,
        pan_no,
        contact_no,
        email_id,
        remarks,
        tds,
        location,
        site,
    ):
        try:
            creditor_master = cls(name=name)
            creditor_master.category = category
            creditor_master.address = address
            creditor_master.state = state
            creditor_master.state_code = state_code
            creditor_master.gstin = gstin
            creditor_master.pan_no = pan_no
            creditor_master.contact_no = contact_no
            creditor_master.email_id = email_id
            creditor_master.remarks = remarks
            creditor_master.tds = tds
            creditor_master.location = location
            creditor_master.site = site
            return creditor_master
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_creditor(self):
        try:
            data = {
                "pk": str(self.pk),
                "name": self.name,
                "category": self.category,
                "address": self.address,
                "state": self.state,
                "state_code": self.state_code,
                "gstin": self.gstin,
                "pan_no": self.pan_no,
                "contact_no": self.contact_no,
                "email_id": self.email_id,
                "remarks": self.remarks,
                "tds": self.tds,
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class DriverMaster(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)
    mobile_no = models.CharField(max_length=15, null=True, blank=True)
    pan_no = models.CharField(max_length=100, null=True, blank=True)
    license_no = models.CharField(max_length=100, null=True, blank=True)
    transporter = models.ForeignKey(
        CreditorMaster,
        null=True,
        blank=True,
        related_name="driver_info_transporter_rel",
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, name, mobile_no, pan_no, license_no, transporter_obj):
        try:
            driver_master = cls(name=name)
            driver_master.mobile_no = mobile_no
            driver_master.pan_no = pan_no
            driver_master.license_no = license_no
            driver_master.transporter = transporter_obj
            return driver_master
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_driver(self):
        try:
            data = {
                "pk": str(self.pk),
                "name": self.name,
                "mobile_no": self.mobile_no,
                "pan_no": self.pan_no,
                "license_no": self.license_no,
                "transporter": self.transporter.name,
                "location": self.transporter.location.name,
                "site": self.transporter.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class TruckMaster(models.Model):
    transporter = models.ForeignKey(
        CreditorMaster,
        related_name="truck_transporter_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    truck_no = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.truck_no

    @classmethod
    def create(cls, transporter, truck_no):
        try:
            truck_entry = cls(transporter=transporter)
            truck_entry.truck_no = truck_no
            return truck_entry
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_truck_details(self):
        try:
            data = {
                "pk": str(self.pk),
                "transporter": self.transporter.name,
                "truck_no": self.truck_no,
                "location": self.transporter.location.name,
                "site": self.transporter.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class ServiceTaxMaster(models.Model):
    description = models.CharField(max_length=300, null=True, blank=True)
    sac_code = models.CharField(max_length=200, null=True, blank=True)
    under_rcm = models.CharField(
        max_length=200, null=True, blank=True, choices=RCM_TYPE
    )
    total_tax = models.CharField(max_length=200, null=True, blank=True)
    cgst = models.CharField(max_length=200, null=True, blank=True)
    sgst = models.CharField(max_length=200, null=True, blank=True)
    igst = models.CharField(max_length=200, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="service_tax_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="service_tax_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.description

    @classmethod
    def create(
        cls,
        description,
        sac_code,
        under_rcm,
        total_tax,
        cgst,
        sgst,
        igst,
        location,
        site,
    ):
        try:
            tax_entry = cls(description=description)
            tax_entry.sac_code = sac_code
            tax_entry.under_rcm = under_rcm
            tax_entry.total_tax = total_tax
            tax_entry.cgst = cgst
            tax_entry.sgst = sgst
            tax_entry.igst = igst
            tax_entry.location = location
            tax_entry.site = site
            return tax_entry
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_tax(self):
        try:
            data = {
                "pk": str(self.pk),
                "description": self.description,
                "sac_code": self.sac_code,
                "under_rcm": self.under_rcm,
                "total_tax": self.total_tax,
                "cgst": self.cgst,
                "sgst": self.sgst,
                "igst": self.igst,
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class BookingOptionMaster(models.Model):
    source_destination = models.CharField(max_length=200, null=True, blank=True)
    consignor = models.CharField(max_length=200, null=True, blank=True)
    consignee = models.CharField(max_length=200, null=True, blank=True)
    particulars = models.CharField(max_length=200, null=True, blank=True)
    shipping_line = models.CharField(max_length=200, null=True, blank=True)
    status = models.CharField(max_length=200, null=True, blank=True)
    port = models.CharField(max_length=200, null=True, blank=True)
    pod = models.CharField(max_length=200, null=True, blank=True)
    handling_company = models.CharField(max_length=200, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="booking_option_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="booking_option_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    # def __str__(self):
    #     return self.consignee

    @classmethod
    def create(
        cls,
        consignee,
        source_destination,
        particulars,
        shipping_line,
        status,
        port,
        pod,
        handling_company,
        location,
        site,
    ):

        try:
            booking_option_entry = cls(consignee=consignee)
            booking_option_entry.source_destination = source_destination
            booking_option_entry.particulars = particulars
            booking_option_entry.shipping_line = shipping_line
            booking_option_entry.status = status
            booking_option_entry.port = port
            booking_option_entry.pod = pod
            booking_option_entry.handling_company = handling_company
            booking_option_entry.location = location
            booking_option_entry.site = site
            return booking_option_entry
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class BookingMaster(models.Model):
    # General Details
    entry_no = models.CharField(max_length=200, null=True, blank=True)
    booking_no = models.CharField(max_length=200, null=True, blank=True)
    booking_type = models.CharField(
        max_length=200, null=True, blank=True, choices=BOOKING_TYPE
    )
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    lr_no = models.CharField(max_length=200, null=True, blank=True)
    l_date = models.DateField(null=True, blank=True)
    s_date = models.DateField(null=True, blank=True)
    from_dest = models.CharField(max_length=200, null=True, blank=True)
    to_dest = models.CharField(max_length=200, null=True, blank=True)
    destination = models.CharField(max_length=200, null=True, blank=True)
    consignor = models.CharField(max_length=200, null=True, blank=True)
    consignee = models.CharField(max_length=200, null=True, blank=True)
    no_of_pallets = models.IntegerField(null=True, blank=True)
    actual_weight = models.CharField(max_length=100, null=True, blank=True)
    charge_weight = models.CharField(max_length=100, null=True, blank=True)
    particulars = models.CharField(max_length=200, null=True, blank=True)
    is_invoiced = models.BooleanField(null=True, blank=True, default=False)
    is_purchased = models.BooleanField(null=True, blank=True, default=False)
    transaction_effected = models.BooleanField(null=True, blank=True, default=False)
    purchase_id = models.CharField(max_length=200, null=True, blank=True)
    invoice_id = models.CharField(max_length=200, null=True, blank=True)
    is_draft = models.BooleanField(null=True, blank=True, default=False)
    is_proceed = models.BooleanField(null=True, blank=True, default=False)
    bill_party = models.ForeignKey(
        CustomerMaster,
        related_name="booking_bill_party_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    # Transporter Details
    transporter = models.ForeignKey(
        CreditorMaster,
        related_name="booking_transporter_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    truck = models.ForeignKey(
        TruckMaster,
        related_name="booking_truck_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    driver = models.ForeignKey(
        DriverMaster,
        related_name="booking_driver_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )

    # Container Details
    container_type = models.CharField(
        max_length=200, null=True, blank=True, choices=TYPE
    )
    container_size = models.CharField(max_length=200, null=True, blank=True)
    container_no = models.CharField(max_length=200, null=True, blank=True)
    shipping_line = models.CharField(max_length=200, null=True, blank=True)
    seal_no = models.CharField(max_length=200, null=True, blank=True)
    status = models.CharField(max_length=200, null=True, blank=True)
    port = models.CharField(max_length=200, null=True, blank=True)
    pod = models.CharField(max_length=200, null=True, blank=True)

    # Transportation Charges
    tr_freight = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    advance = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    diesel_quantity = models.FloatField(
        null=True,
        blank=True,
    )
    diesel_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    diesel_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    fuel_pump = models.ForeignKey(
        CreditorMaster,
        related_name="booking_fuel_pump_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    detention_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    extra_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    balance = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    # Handling Details
    loading_unloading = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    handling_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    handling_company = models.CharField(max_length=200, null=True, blank=True)

    # MNR Details
    washing_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    repair_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    # Weighing Details
    weighment_charges = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    location = models.ForeignKey(
        Location,
        related_name="booking_master_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="booking_master_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.lr_no

    @classmethod
    def create(
        cls,
        entry_no,
        booking_no,
        booking_type,
        financial_year,
        is_draft,
        is_proceed,
        lr_no,
        l_date,
        s_date,
        from_dest,
        to_dest,
        destination,
        consignor,
        consignee,
        no_of_pallets,
        actual_weight,
        charge_weight,
        particulars,
        bill_party,
        transporter,
        truck,
        driver,
        container_type,
        container_size,
        container_no,
        shipping_line,
        seal_no,
        status,
        port,
        pod,
        tr_freight,
        advance,
        diesel_quantity,
        diesel_rate,
        diesel_cost,
        fuel_pump,
        detention_charges,
        extra_charges,
        balance,
        loading_unloading,
        handling_charges,
        handling_company,
        washing_charges,
        repair_charges,
        weighment_charges,
        transaction_effected,
        location,
        site,
    ):
        try:
            booking_entry = cls(booking_type=booking_type)
            booking_entry.entry_no = entry_no
            booking_entry.booking_no = booking_no
            booking_entry.lr_no = lr_no
            booking_entry.financial_year = financial_year
            booking_entry.is_draft = is_draft
            booking_entry.is_proceed = is_proceed
            booking_entry.l_date = l_date
            booking_entry.s_date = s_date
            booking_entry.from_dest = from_dest
            booking_entry.to_dest = to_dest
            booking_entry.destination = destination
            booking_entry.consignor = consignor
            booking_entry.consignee = consignee
            booking_entry.no_of_pallets = no_of_pallets
            booking_entry.actual_weight = actual_weight
            booking_entry.charge_weight = charge_weight
            booking_entry.particulars = particulars
            booking_entry.bill_party = bill_party
            booking_entry.transporter = transporter
            booking_entry.truck = truck
            booking_entry.driver = driver
            booking_entry.container_no = container_no
            booking_entry.container_type = container_type
            booking_entry.container_size = container_size
            booking_entry.shipping_line = shipping_line
            booking_entry.seal_no = seal_no
            booking_entry.status = status
            booking_entry.port = port
            booking_entry.pod = pod
            booking_entry.tr_freight = tr_freight
            booking_entry.advance = advance
            booking_entry.diesel_quantity = diesel_quantity
            booking_entry.diesel_rate = diesel_rate
            booking_entry.diesel_cost = diesel_cost
            booking_entry.fuel_pump = fuel_pump
            booking_entry.detention_charges = detention_charges
            booking_entry.extra_charges = extra_charges
            booking_entry.balance = balance
            booking_entry.loading_unloading = loading_unloading
            booking_entry.handling_charges = handling_charges
            booking_entry.handling_company = handling_company
            booking_entry.washing_charges = washing_charges
            booking_entry.repair_charges = repair_charges
            booking_entry.weighment_charges = weighment_charges
            booking_entry.transaction_effected = transaction_effected
            booking_entry.location = location
            booking_entry.site = site
            return booking_entry
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def checkEntryNo(
        cls,
        entry_no,
        lr_no,
        financial_year,
        location,
        site,
    ):
        return cls.objects.select_related("location", "site").filter(
            entry_no=entry_no,
            lr_no=lr_no,
            financial_year=financial_year,
            location=location,
            site=site,
        )

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_booking_data(self):
        try:
            general_data = {
                "entry_no": self.entry_no,
                "booking_no": self.booking_no,
                "booking_type": self.booking_type,
                "lr_no": self.lr_no,
                "l_date": self.l_date.strftime("%Y-%m-%d"),
                "s_date": self.s_date.strftime("%Y-%m-%d"),
                "from_dest": self.from_dest,
                "to_dest": self.to_dest,
                "destination": self.destination,
                "consignor": self.consignor,
                "consignee": self.consignee,
                "no_of_pallets": str(self.no_of_pallets),
                "actual_weight": self.actual_weight,
                "charge_weight": self.charge_weight,
                "particulars": self.particulars,
            }
            transportation_data = {
                "transporter": None
                if self.transporter is None
                else self.transporter.name,
                "truck_no": None if self.truck is None else self.truck.truck_no,
                "driver_name": None if self.driver is None else self.driver.name,
                "license_no": None if self.driver is None else self.driver.license_no,
                "mobile_no": None if self.driver is None else self.driver.mobile_no,
                "container_type": self.container_type,
                "container_size": self.container_size,
                "container_no": self.container_no,
                "shipping_line": self.shipping_line,
                "seal_no": self.seal_no,
                "status": self.status,
                "port": self.port,
                "pod": self.pod,
            }
            charges = {
                "tr_freight": str(int(0))
                if self.tr_freight == float(0)
                else str(float(self.tr_freight)),
                "advance": str(int(0))
                if self.advance == float(0)
                else str(float(self.advance)),
                "diesel_quantity": str(int(0))
                if self.advance == float(0)
                else str(float(self.diesel_quantity)),
                "diesel_rate": str(int(0))
                if self.diesel_rate == float(0)
                else str(float(self.diesel_rate)),
                "diesel_cost": str(int(0))
                if self.diesel_cost == float(0)
                else str(float(self.diesel_cost)),
                "fuel_pump": None if self.fuel_pump is None else self.fuel_pump.name,
                "detention_charges": str(int(0))
                if self.detention_charges == float(0)
                else str(float(self.detention_charges)),
                "extra_charges": str(int(0))
                if self.extra_charges == float(0)
                else str(float(self.extra_charges)),
                "balance": str(int(0))
                if self.balance == float(0)
                else str(float(self.balance)),
                "loading_unloading": str(int(0))
                if self.loading_unloading == float(0)
                else str(float(self.loading_unloading)),
                "handling_charges": str(int(0))
                if self.handling_charges == float(0)
                else str(float(self.handling_charges)),
                "handling_company": self.handling_company,
                "washing_charges": str(int(0))
                if self.washing_charges == float(0)
                else str(float(self.washing_charges)),
                "repair_charges": str(int(0))
                if self.repair_charges == float(0)
                else str(float(self.repair_charges)),
                "weighment_charges": str(int(0))
                if self.weighment_charges == float(0)
                else str(float(self.weighment_charges)),
            }
            data = {
                "pk": str(self.pk),
                "general_data": self.none_to_empty_str(items=general_data),
                "transportation_data": self.none_to_empty_str(
                    items=transportation_data
                ),
                "charges": self.none_to_empty_str(items=charges),
                "transaction_effected": self.transaction_effected,
                "is_draft": self.is_draft,
                "is_proceed": self.is_proceed,
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}

    def get_booking_table_data(self):
        try:
            data = {
                "pk": str(self.pk),
                "entry_no": self.entry_no,
                "lr_no": self.lr_no,
                "l_date": self.l_date,
                "bill_party": None if self.bill_party is None else self.bill_party.name,
                "destination": self.destination,
                "transporter": None
                if self.transporter is None
                else self.transporter.name,
                "truck_no": None if self.truck is None else self.truck.truck_no,
                "location": self.location.name,
                "site": self.site.name,
                "is_draft": self.is_draft,
                "is_proceed": self.is_proceed,
                "transaction_effected":self.transaction_effected,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}

    def get_purchase_lr_data(self):
        try:
            data = {
                "booking_pk": str(self.pk),
                "lr_no": self.lr_no,
                "l_date": self.l_date,
                "due_amount": str(self.balance),
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}

    # def get_transporter_payment_reciept_data(self):
    #     try:
    #         data = {
    #             "pk": str(self.pk),
    #             "booking": self.lr_no,
    #             "due_amount": str(self.balance)
    #         }
    #         return self.none_to_empty_str(items=data)
    #     except Exception:
    #         error_log = logging.getLogger("error_log")
    #         error_log.error(traceback.format_exc())
    #         return {}


class BookingBill(models.Model):
    booking = models.ForeignKey(
        BookingMaster,
        blank=True,
        null=True,
        related_name="booking_bill_booking_master_rel",
        on_delete=models.CASCADE,
    )
    bill_party = models.ForeignKey(
        CustomerMaster,
        blank=True,
        null=True,
        related_name="booking_bill_customer_rel",
        on_delete=models.CASCADE,
    )
    company_account_name = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.booking.entry_no

    @classmethod
    def create(
        cls,
        booking,
        bill_party,
        company_account_name,
    ):
        try:
            bill_obj = cls(booking=booking)
            bill_obj.bill_party = bill_party
            bill_obj.company_account_name = company_account_name
            return bill_obj
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class BookingBillLine(models.Model):
    type_of_charge = models.ForeignKey(
        ServiceTaxMaster,
        blank=True,
        null=True,
        related_name="booking_bill_line_service_tax_master_rel",
        on_delete=models.CASCADE,
    )
    bill_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    rcm = models.CharField(max_length=200, null=True, blank=True)
    booking_bill = models.ForeignKey(
        BookingBill,
        blank=True,
        null=True,
        related_name="booking_bill_line_service_tax_master_rel",
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(
        cls,
        type_of_charge,
        bill_amount,
        rcm,
        booking_bill,
    ):
        try:
            bill_obj = cls(type_of_charge=type_of_charge)
            bill_obj.bill_amount = bill_amount
            bill_obj.rcm = rcm
            bill_obj.booking_bill = booking_bill
            return bill_obj
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_line_data(self):
        try:
            data = {
                "pk": str(self.pk),
                "booking": self.booking_bill.booking.lr_no,
                "particular": f"LR No : {self.booking_bill.booking.lr_no}",
                "services": self.type_of_charge.description,
                "sac_code": self.type_of_charge.sac_code,
                "under_rcm": self.type_of_charge.under_rcm,
                "freight_amount": str(self.booking_bill.booking.tr_freight),
                "gst_rate": self.type_of_charge.total_tax,
                "total_amount": str(
                    float(self.booking_bill.booking.tr_freight)
                    + float(self.booking_bill.booking.tr_freight)
                    * float(self.type_of_charge.total_tax)
                    / float(100)
                )
                if not self.type_of_charge.total_tax == float(0)
                else str(float(self.booking_bill.booking.tr_freight)),
                # "total_amount":str(self.booking_bill.booking.tr_freight*(self.type_of_charge.total_tax)/float(100)),
            }
            # total_amount = str(float(self.booking_bill.booking.tr_freight) * (float(self.type_of_charge.total_tax))/float(100))
            # data["total_amount"] = str(total_amount)
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class PurchaseMaster(models.Model):
    bill_type = models.CharField(max_length=200, null=True, blank=True)
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    entry_no = models.CharField(max_length=200, null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    transporter = models.ForeignKey(
        CreditorMaster,
        related_name="purchase_master_transporter_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    sup_bill_no = models.CharField(max_length=200, null=True, blank=True)
    sup_bill_date = models.DateField(null=True, blank=True)
    narration = models.TextField(null=True, blank=True)
    bill_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    due_bill_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_purchase_completed = models.BooleanField(null=True, blank=True, default=False)
    is_transaction_effected = models.BooleanField(null=True, blank=True, default=False)
    location = models.ForeignKey(
        Location,
        related_name="purchase_master_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="purchase_master_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.entry_no

    @classmethod
    def create(
        cls,
        bill_type,
        entry_no,
        financial_year,
        entry_date,
        transporter,
        sup_bill_no,
        sup_bill_date,
        narration,
        bill_amount,
        due_bill_amount,
        location,
        site,
    ):
        try:
            purchase_lr = cls(entry_no=entry_no)
            purchase_lr.bill_type = bill_type
            purchase_lr.financial_year = financial_year
            purchase_lr.entry_date = entry_date
            purchase_lr.transporter = transporter
            purchase_lr.sup_bill_no = sup_bill_no
            purchase_lr.sup_bill_date = sup_bill_date
            purchase_lr.narration = narration
            purchase_lr.bill_amount = bill_amount
            purchase_lr.due_bill_amount = due_bill_amount
            purchase_lr.location = location
            purchase_lr.site = site
            return purchase_lr
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def checkEntryNo(
        cls,
        entry_no,
        financial_year,
        location,
        site,
    ):
        return cls.objects.select_related("location", "site").filter(
            entry_no=entry_no,
            financial_year=financial_year,
            location=location,
            site=site,
        )

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_purchase_lr(self):
        try:
            data = {
                "pk": str(self.pk),
                "bill_type": self.bill_type,
                "entry_no": self.entry_no,
                "entry_date": self.entry_date.strftime("%Y-%m-%d")
                if self.entry_date is not None
                else None,
                "transporter": self.transporter.name,
                "sup_bill_no": self.sup_bill_no,
                "sup_bill_date": self.sup_bill_date.strftime("%Y-%m-%d")
                if self.sup_bill_date is not None
                else None,
                "narration": self.narration,
                "due_bill_amount": str(self.due_bill_amount),
                "bill_amount": str(self.bill_amount),
                "is_transaction_effected": self.is_transaction_effected,
                "is_purchase_completed": self.is_purchase_completed,
                "location": self.location.name,
                "site": self.site.name,
            }
            # main_data = self.none_to_empty_str(items=data)
            # main_data["lines"] = [
            #     {
            #         "pk": str(each.pk),
            #         "lr_no": each.lr_no,
            #         "lr_date": self.l_date.strftime("%Y-%m-%d")
            #         if self.l_date is not None
            #         else None,
            #         "due_balance": str(self.balance),
            #         "amount": str(self.balance),
            #     }
            #     for each in self.booking.all()
            # ]
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def purchase_payment_receipt_data(self):
        try:
            data = {
                "pk": str(self.pk),
                "against_bill": self.entry_no,
                "ref_date": self.entry_date,
                "original_bill_amount": str(self.bill_amount),
                "due_bill_amount": str(self.due_bill_amount),
                "kasar": "0",
                "tds": "0",
                "receipt_amount": "0",
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}


class PurchaseMasterLine(models.Model):
    parent = models.ForeignKey(
        PurchaseMaster,
        related_name="purchase_master_line_parent_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    booking = models.ForeignKey(
        BookingMaster,
        related_name="purchase_master_line_booking_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    due_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    gst_rate = models.CharField(max_length=200, null=True, blank=True)

    sgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    cgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    igst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return self.parent.entry_no

    @classmethod
    def create(
        cls,
        parent,
        booking,
        due_amount,
        gst_rate,
        sgst_amount,
        cgst_amount,
        igst_amount,
        total_amount,
    ):
        try:
            purchase_bill = cls(parent=parent)
            purchase_bill.booking = booking
            purchase_bill.due_amount = due_amount
            purchase_bill.gst_rate = gst_rate
            purchase_bill.sgst_amount = sgst_amount
            purchase_bill.cgst_amount = cgst_amount
            purchase_bill.igst_amount = igst_amount
            purchase_bill.total_amount = total_amount
            return purchase_bill
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class InvoiceBill(models.Model):
    booking_type = models.CharField(max_length=200, null=True, blank=True)
    bill_no = models.CharField(max_length=200, null=True, blank=True)
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    bill_date = models.DateField(null=True, blank=True)
    bill_type = models.CharField(max_length=200, null=True, blank=True)
    customer = models.ForeignKey(
        CustomerMaster,
        related_name="invoice_bill_customer_name_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    address = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=200, null=True, blank=True)
    state_code = models.CharField(max_length=200, null=True, blank=True)
    gst_no = models.CharField(max_length=200, null=True, blank=True)
    pan_no = models.CharField(max_length=200, null=True, blank=True)
    company_account = models.CharField(max_length=200, null=True, blank=True)
    is_invoice_completed = models.BooleanField(null=True, blank=True, default=False)
    is_transaction_effected = models.BooleanField(null=True, blank=True, default=False)
    total_amount_without_tax = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    sgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    cgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    igst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    due_total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    amount_in_words = models.CharField(max_length=400, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="invoice_bill_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="invoice_bill_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.bill_no

    @classmethod
    def create(
        cls,
        bill_no,
        financial_year,
        booking_type,
        bill_date,
        bill_type,
        customer,
        address,
        state,
        state_code,
        gst_no,
        pan_no,
        company_account,
        total_amount_without_tax,
        sgst_amount,
        cgst_amount,
        igst_amount,
        total_amount,
        due_total_amount,
        location,
        site,
    ):
        try:
            invoice_bill = cls(bill_no=bill_no)
            invoice_bill.financial_year = financial_year
            invoice_bill.booking_type = booking_type
            invoice_bill.bill_date = bill_date
            invoice_bill.bill_type = bill_type
            invoice_bill.customer = customer
            invoice_bill.address = address
            invoice_bill.state = state
            invoice_bill.state_code = state_code
            invoice_bill.gst_no = gst_no
            invoice_bill.pan_no = pan_no
            invoice_bill.company_account = company_account
            invoice_bill.total_amount_without_tax = total_amount_without_tax
            invoice_bill.sgst_amount = sgst_amount
            invoice_bill.cgst_amount = cgst_amount
            invoice_bill.igst_amount = igst_amount
            invoice_bill.total_amount = total_amount
            invoice_bill.due_total_amount = due_total_amount
            invoice_bill.location = location
            invoice_bill.site = site
            return invoice_bill
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_invoice_bill(self):
        try:
            data = {
                "pk": str(self.pk),
                "bill_no": self.bill_no,
                "booking_type": self.booking_type,
                "bill_date": self.bill_date.strftime("%Y-%m-%d")
                if self.bill_date is not None
                else None,
                "bill_type": self.bill_type,
                "customer": self.customer.name,
                "address": self.address,
                "state": self.state,
                "state_code": self.state_code,
                "gst_no": self.gst_no,
                "pan_no": self.pan_no,
                "company_account": self.company_account,
                "due_total_amount": str(self.due_total_amount),
                "total_amount_without_tax": str(self.total_amount_without_tax),
                "total_amount": str(self.total_amount),
                "amount_in_words": self.amount_in_words,
                "is_transaction_effected": self.is_transaction_effected,
                "is_invoice_completed": self.is_invoice_completed,
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def invoice_payment_receipt_data(self):
        try:
            data = {
                "pk": str(self.pk),
                "against_bill": self.bill_no,
                "ref_date": self.bill_date,
                "original_bill_amount": str(self.total_amount),
                "due_bill_amount": str(self.due_total_amount),
                "kasar": "0",
                "tds": "0",
                "receipt_amount": "0",
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {}

    @classmethod
    def checkEntryNo(
        cls,
        bill_no,
        financial_year,
        location,
        site,
    ):
        return cls.objects.select_related("location", "site").filter(
            bill_no=bill_no,
            financial_year=financial_year,
            location=location,
            site=site,
        )


class InvoiceBillLine(models.Model):
    parent = models.ForeignKey(
        InvoiceBill,
        related_name="invoice_bill_line_parent_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    booking = models.ForeignKey(
        BookingMaster,
        related_name="invoice_bill_line_booking_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    particulars = models.CharField(max_length=200, null=True, blank=True)
    services = models.CharField(max_length=200, null=True, blank=True)
    sac_code = models.CharField(max_length=200, null=True, blank=True)
    under_rcm = models.CharField(max_length=200, null=True, blank=True)
    freight_amount = models.CharField(max_length=200, null=True, blank=True)
    gst_rate = models.CharField(max_length=200, null=True, blank=True)
    # due_amount = models.DecimalField(
    #     null=True, blank=True, decimal_places=2, default=0, max_digits=10
    # )

    sgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    cgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    igst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return self.parent.bill_no

    @classmethod
    def create(
        cls,
        parent,
        booking,
        particulars,
        services,
        sac_code,
        under_rcm,
        freight_amount,
        gst_rate,
        sgst_amount,
        cgst_amount,
        igst_amount,
        total_amount,
    ):
        try:
            invoice_bill = cls(parent=parent)
            invoice_bill.booking = booking
            invoice_bill.particulars = particulars
            invoice_bill.services = services
            invoice_bill.sac_code = sac_code
            invoice_bill.under_rcm = under_rcm
            invoice_bill.freight_amount = freight_amount
            invoice_bill.gst_rate = gst_rate
            invoice_bill.sgst_amount = sgst_amount
            invoice_bill.cgst_amount = cgst_amount
            invoice_bill.igst_amount = igst_amount
            invoice_bill.total_amount = total_amount
            return invoice_bill
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class PaymentReceiptMaster(models.Model):
    payment_receipt_type = models.CharField(
        max_length=200, null=True, blank=True, choices=PAYMENT_TYPE
    )
    entry_type = models.CharField(
        max_length=200, null=True, blank=True, choices=ENTRY_TYPE
    )
    transaction = models.CharField(
        max_length=200, null=True, blank=True, choices=TRANSACTION
    )
    entry_no = models.CharField(max_length=200, null=True, blank=True)
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    customer = models.ForeignKey(
        CustomerMaster,
        related_name="payment_receipt_customer_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    creditor = models.ForeignKey(
        CreditorMaster,
        related_name="payment_receipt_creditor_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    truck_no = models.CharField(max_length=200, null=True, blank=True)
    extra_charges = models.CharField(max_length=200, null=True, blank=True)
    narration = models.TextField(null=True, blank=True)
    pay_remarks = models.CharField(max_length=200, null=True, blank=True)
    receipt_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    kasar = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    tds = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    transaction_from = models.ForeignKey(
        AccountMaster,
        related_name="payment_receipt_account_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    booking_id = models.CharField(max_length=200, null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="payment_receipt_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="payment_receipt_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.entry_no

    @classmethod
    def create(
        cls,
        payment_receipt_type,
        entry_type,
        transaction,
        entry_no,
        financial_year,
        entry_date,
        customer,
        creditor,
        truck_no,
        extra_charges,
        narration,
        pay_remarks,
        receipt_amount,
        kasar,
        tds,
        total_amount,
        transaction_from,
        booking_id,
        location,
        site,
    ):
        try:
            pay_rec_entry = cls(entry_no=entry_no)
            pay_rec_entry.payment_receipt_type = payment_receipt_type
            pay_rec_entry.entry_type = entry_type
            pay_rec_entry.transaction = transaction
            pay_rec_entry.financial_year = financial_year
            pay_rec_entry.entry_date = entry_date
            pay_rec_entry.customer = customer
            pay_rec_entry.creditor = creditor
            pay_rec_entry.truck_no = truck_no
            pay_rec_entry.extra_charges = extra_charges
            pay_rec_entry.narration = narration
            pay_rec_entry.pay_remarks = pay_remarks
            pay_rec_entry.receipt_amount = receipt_amount
            pay_rec_entry.kasar = kasar
            pay_rec_entry.tds = tds
            pay_rec_entry.total_amount = total_amount
            pay_rec_entry.transaction_from = transaction_from
            pay_rec_entry.booking_id = booking_id
            pay_rec_entry.location = location
            pay_rec_entry.site = site
            return pay_rec_entry
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def checkEntryNo(
        cls,
        entry_no,
        financial_year,
        location,
        site,
    ):
        return cls.objects.select_related("location", "site").filter(
            entry_no=entry_no,
            financial_year=financial_year,
            location=location,
            site=site,
        )

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_payment_receipt(self):

        try:
            data = {
                "pk": str(self.pk),
                "payment_receipt_type": self.payment_receipt_type,
                "entry_type": self.entry_type,
                "transaction": self.transaction,
                "entry_no": self.entry_no,
                "entry_date": self.entry_date.strftime("%Y-%m-%d")
                if self.entry_date is not None
                else None,
                "customer": self.customer.name if self.customer is not None else None,
                "creditor": self.creditor.name if self.creditor is not None else None,
                "truck_no": self.truck_no,
                "extra_charges": self.extra_charges,
                "narration": self.narration,
                "pay_remarks": self.pay_remarks,
                "receipt_amount": str(float(self.receipt_amount)),
                "kasar": str(float(self.kasar)),
                "tds": str(float(self.tds)),
                "total_amount": str(float(self.total_amount)),
                "transaction_from": self.transaction_from.name
                if self.transaction_from is not None
                else None,
                "location": self.location.name,
                "site": self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class PaymentReceiptLine(models.Model):
    parent = models.ForeignKey(
        PaymentReceiptMaster,
        related_name="payment_receipt_line_parent_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    purchase_bill = models.ForeignKey(
        PurchaseMaster,
        related_name="payment_receipt_purchase_master_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    invoice_bill = models.ForeignKey(
        InvoiceBill,
        related_name="payment_receipt_invoice_bill_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    due_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    receipt_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    kasar = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    tds = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(
        cls, parent, purchase_bill, invoice_bill, due_amount, receipt_amount, kasar, tds
    ):
        try:
            line_obj = cls(parent=parent)
            line_obj.purchase_bill = purchase_bill
            line_obj.invoice_bill = invoice_bill
            line_obj.due_amount = due_amount
            line_obj.receipt_amount = receipt_amount
            line_obj.kasar = kasar
            line_obj.tds = tds
            return line_obj
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class ContraEntry(models.Model):
    entry_no = models.CharField(max_length=200, null=True, blank=True)
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    account_debit = models.ForeignKey(
        AccountMaster,
        related_name="contra_entry_account_debit_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    account_credit = models.ForeignKey(
        AccountMaster,
        related_name="contra_entry_account_credit_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    narration = models.TextField(null=True, blank=True)
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    def __str__(self):
        return self.entry_no

    @classmethod
    def create(
        cls,
        entry_no,
        financial_year,
        entry_date,
        account_debit,
        account_credit,
        narration,
        amount,
    ):
        try:
            contra_object = cls(entry_no=entry_no)
            contra_object.financial_year = financial_year
            contra_object.entry_date = entry_date
            contra_object.account_debit = account_debit
            contra_object.account_credit = account_credit
            contra_object.narration = narration
            contra_object.amount = amount
            return contra_object
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def checkEntryNo(
        cls,
        entry_no,
        financial_year,
        location,
        site,
    ):
        return cls.objects.select_related(
            "account_debit__location", "account_debit__site"
        ).filter(
            account_debit__location=location,
            account_debit__site=site,
            financial_year=financial_year,
            entry_no=entry_no,
        )

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_contra_entry(self):
        try:
            data = {
                "pk": str(self.pk),
                "entry_no": self.entry_no,
                "entry_date": self.entry_date.strftime("%Y-%m-%d")
                if self.entry_date is not None
                else None,
                "account_debit": None
                if self.account_debit is None
                else self.account_debit.name,
                "account_credit": None
                if self.account_credit is None
                else self.account_credit.name,
                "narration": self.narration,
                "amount": str(self.amount),
                "location": None
                if self.account_debit is None
                else self.account_debit.location.name,
                "site": None
                if self.account_debit is None
                else self.account_debit.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class JournalVoucher(models.Model):
    transaction = models.CharField(
        max_length=200, null=True, blank=True, choices=TRANSPORTATION_TYPE
    )
    financial_year = models.CharField(max_length=200, null=True, blank=True)
    entry_no = models.CharField(max_length=200, null=True, blank=True)
    entry_date = models.DateField(null=True, blank=True)
    account_name = models.CharField(
        max_length=200,
        null=True,
        blank=True,
    )
    narration = models.TextField(null=True, blank=True)
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    under_account_name = models.CharField(max_length=200, null=True, blank=True)
    booking = models.ForeignKey(
        BookingMaster,
        null=True,
        blank=True,
        related_name="journal_booking_rel",
        on_delete=models.CASCADE,
    )
    location = models.ForeignKey(
        Location,
        related_name="journal_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="journal_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.entry_no

    @classmethod
    def create(
        cls,
        transaction,
        financial_year,
        entry_no,
        entry_date,
        account_name,
        narration,
        amount,
        under_account_name,
        booking,
        location,
        site,
    ):
        try:
            jv_object = cls(entry_no=entry_no)
            jv_object.transaction = transaction
            jv_object.financial_year = financial_year
            jv_object.entry_date = entry_date
            jv_object.account_name = account_name
            jv_object.narration = narration
            jv_object.amount = amount
            jv_object.under_account_name = under_account_name
            jv_object.booking = booking
            jv_object.location = location
            jv_object.site = site
            return jv_object
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def checkEntryNo(
        cls,
        entry_no,
        financial_year,
        location,
        site,
    ):
        return cls.objects.select_related("location", "site").filter(
            entry_no=entry_no,
            financial_year=financial_year,
            location=location,
            site=site,
        )

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get_journal_voucher(self):
        try:
            data = {
                "pk": str(self.pk),
                "transaction": self.transaction,
                "entry_no": self.entry_no,
                "entry_date": self.entry_date.strftime("%Y-%m-%d")
                if self.entry_date is not None
                else None,
                "account_name": self.account_name,
                "narration": self.narration,
                "amount": str(self.amount),
                "under_account_name": self.under_account_name,
                "location": None if self.location is None else self.location.name,
                "site": None if self.site is None else self.site.name,
            }
            return self.none_to_empty_str(items=data)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class TransactionLog(models.Model):
    created_at = models.DateField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    vch_no = models.CharField(max_length=300, blank=True, null=True)
    vch_type = models.CharField(max_length=300, blank=True, null=True, choices=PURPOSE)
    particular = models.TextField(blank=True, null=True)
    creditor = models.ForeignKey(
        CreditorMaster,
        related_name="transaction_logs_creditor_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    customer = models.ForeignKey(
        CustomerMaster,
        related_name="transacion_logs_customer_rel",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
    )
    effect_on = models.ForeignKey(
        AccountMaster,
        related_name="transaction_logs_effect_on_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    transaction_type = models.CharField(
        max_length=200, blank=True, null=True, choices=TRANSPORTATION_TYPE
    )
    transaction_method = models.CharField(
        max_length=200, blank=True, null=True, choices=PAYMENT_TYPE
    )
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        related_name="transaction_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="transaction_logs_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    booking_id = models.CharField(max_length=200, blank=True, null=True)
    invoice_id = models.CharField(max_length=200, blank=True, null=True)
    payment_receipt_id = models.CharField(max_length=200, blank=True, null=True)
    contra_id = models.CharField(max_length=200, blank=True, null=True)
    journal_id = models.CharField(max_length=200, blank=True, null=True)
    account_id = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create(
        cls,
        created_at,
        date,
        vch_no,
        vch_type,
        particular,
        creditor,
        customer,
        effect_on,
        transaction_type,
        transaction_method,
        booking_id,
        invoice_id,
        payment_receipt_id,
        contra_id,
        journal_id,
        amount,
        location,
        site,
        account_id=None,
    ):
        try:
            log_obj = cls(vch_no=vch_no)
            log_obj.date = date
            log_obj.created_at = created_at
            log_obj.creditor = creditor
            log_obj.customer = customer
            log_obj.vch_type = vch_type
            log_obj.transaction_type = transaction_type
            log_obj.transaction_method = transaction_method
            log_obj.effect_on = effect_on
            log_obj.particular = particular
            log_obj.amount = amount
            log_obj.booking_id = booking_id
            log_obj.invoice_id = invoice_id
            log_obj.payment_receipt_id = payment_receipt_id
            log_obj.contra_id = contra_id
            log_obj.journal_id = journal_id
            log_obj.location = location
            log_obj.site = site
            log_obj.account_id = account_id
            return log_obj
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
