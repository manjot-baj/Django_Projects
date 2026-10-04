from django.db import models
from django.utils import timezone
from master.models_two import Client
from master.models import (
    ContainerType,
    ContainerSize,
    Location,
    Site,
)
from depot.models import CONTAINER_STATUS, ContainerStock, ARRIVED
import traceback, logging
from django.db import transaction

ADV_PAYMENT_TYPE = [
    ("Cash", "Cash"),
    ("UPI", "UPI"),
    ("Cheque", "Cheque"),
    ("NEFT", "NEFT"),
    ("RTGS", "RTGS"),
    ("Finance_Account", "Finance_Account"),
]

FIN_TRANS_PAYMENT_TYPE = [
    ("Cheque", "Cheque"),
    ("NEFT", "NEFT"),
    ("RTGS", "RTGS"),
]

TRANSACTION_TYPE = [
    ("Credit", "Credit"),
    ("Debit", "Debit"),
]


class AdvancedHandlingPayment(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date = models.DateTimeField(default=timezone.now)
    bl_no = models.CharField(max_length=200, null=True, blank=True)
    bk_no = models.CharField(max_length=200, null=True, blank=True)
    client = models.ForeignKey(
        Client,
        related_name="adv_handling_payment_client_rel",
        on_delete=models.CASCADE,
    )
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    account_name = models.CharField(max_length=200, null=True, blank=True)
    account_no = models.CharField(max_length=200, null=True, blank=True)
    cheque_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    utr_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    transaction_id = models.CharField(
        max_length=200, null=True, blank=True, unique=True
    )
    payment_type = models.CharField(max_length=50, choices=ADV_PAYMENT_TYPE)
    quantity = models.PositiveIntegerField(default=0)
    remaining = models.PositiveIntegerField(default=0)
    original_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remaining_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    balance_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_adjusted = models.BooleanField(null=True, blank=True, default=False)
    is_balance_pymt_adjusted = models.BooleanField(null=True, blank=True, default=False)
    is_locked = models.BooleanField(null=True, blank=True, default=False)
    location = models.ForeignKey(
        Location,
        related_name="adv_handling_payment_location_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="adv_handling_payment_site_rel",
        on_delete=models.CASCADE,
    )
    entry_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )
    tds = models.PositiveIntegerField(default=1)
    with_gst = models.BooleanField(null=True, blank=True, default=True)

    # 20
    size_20_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    size_20_quantity = models.PositiveIntegerField(default=0)
    size_20_tds_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    # 40
    size_40_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    size_40_quantity = models.PositiveIntegerField(default=0)

    size_40_tds_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remarks = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return str(self.pk)

    @classmethod
    def create_in_adv_payment(cls, **kwargs):
        try:
            payment = cls(
                bl_no=kwargs.get("bl_no"),
                bank_name=kwargs.get("bank_name", ""),
                client=kwargs.get("client", ""),
                account_name=kwargs.get("account_name", ""),
                account_no=kwargs.get("account_no", ""),
                cheque_no=kwargs.get("cheque_no", ""),
                utr_no=kwargs.get("utr_no", ""),
                transaction_id=kwargs.get("transaction_id", ""),
                payment_type=kwargs.get("payment_type", ""),
                quantity=kwargs.get("quantity", 0),
                remaining=kwargs.get("quantity", 0),
                original_amount=kwargs.get("original_amount", 0.00),
                remaining_amount=kwargs.get("original_amount", 0.00),
                location=kwargs.get("location"),
                site=kwargs.get("site"),
                tds=kwargs.get("tds"),
                with_gst=kwargs.get("with_gst", True),
                entry_type="IN",
                # 20
                size_20_rate=kwargs.get("size_20_rate"),
                size_20_quantity=kwargs.get("size_20_quantity"),
                size_20_tds_amount=kwargs.get("size_20_tds_amount"),
                # 40
                size_40_rate=kwargs.get("size_40_rate"),
                size_40_quantity=kwargs.get("size_40_quantity"),
                size_40_tds_amount=kwargs.get("size_40_tds_amount"),
                remarks=kwargs.get("remarks"),
            )
            payment.save()
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def create_out_adv_payment(cls, **kwargs):
        try:
            payment = cls(
                bk_no=kwargs.get("bk_no"),
                bank_name=kwargs.get("bank_name", ""),
                client=kwargs.get("client", ""),
                account_name=kwargs.get("account_name", ""),
                account_no=kwargs.get("account_no", ""),
                cheque_no=kwargs.get("cheque_no", ""),
                utr_no=kwargs.get("utr_no", ""),
                transaction_id=kwargs.get("transaction_id", ""),
                payment_type=kwargs.get("payment_type", ""),
                quantity=kwargs.get("quantity", 0),
                remaining=kwargs.get("quantity", 0),
                original_amount=kwargs.get("original_amount", 0.00),
                remaining_amount=kwargs.get("original_amount", 0.00),
                location=kwargs.get("location"),
                site=kwargs.get("site"),
                tds=kwargs.get("tds"),
                with_gst=kwargs.get("with_gst", True),
                entry_type="OUT",
                # 20
                size_20_rate=kwargs.get("size_20_rate"),
                size_20_quantity=kwargs.get("size_20_quantity"),
                size_20_tds_amount=kwargs.get("size_20_tds_amount"),
                # 40
                size_40_rate=kwargs.get("size_40_rate"),
                size_40_quantity=kwargs.get("size_40_quantity"),
                size_40_tds_amount=kwargs.get("size_40_tds_amount"),
                remarks=kwargs.get("remarks"),
            )
            payment.save()
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_payment_data(self):
        try:
            return {
                "pk": self.pk,
                "bl_no": self.bl_no,
                "bk_no": self.bk_no,
                "date": self.date.astimezone(timezone.get_current_timezone()).strftime(
                    "%Y-%m-%d %H:%M"
                ),
                "client": self.client.name if self.client else None,
                "bank_name": self.bank_name,
                "account_name": self.account_name,
                "account_no": self.account_no,
                "cheque_no": self.cheque_no,
                "utr_no": self.utr_no,
                "transaction_id": self.transaction_id,
                "quantity": self.quantity,
                "remaining": self.remaining,
                "original_amount": float(self.original_amount),
                "remaining_amount": float(self.remaining_amount),
                "balance_amount": float(self.balance_amount),
                "payment_type": self.payment_type,
                "is_adjusted": self.is_adjusted,
                "is_locked": self.is_locked,
                "is_balance_pymt_adjusted": self.is_balance_pymt_adjusted,
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "updated_at": self.updated_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
                "entry_type": self.entry_type,
                "tds": self.tds,
                "with_gst": self.with_gst,
                # 20
                "size_20_rate": self.size_20_rate,
                "size_20_quantity": self.size_20_quantity,
                "size_20_tds_amount": self.size_20_tds_amount,
                # "size_20_full_amount": self.get_full_amount(size="20"),
                # 40
                "size_40_rate": self.size_40_rate,
                "size_40_quantity": self.size_40_quantity,
                "size_40_tds_amount": self.size_40_tds_amount,
                # "size_40_full_amount": self.get_full_amount(size="40"),
                "remarks": self.remarks,
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_full_amount(self, size):
        try:
            prefix = "size_20" if size == "20" else "size_40"
            unit_rate = float(getattr(self, f"{prefix}_rate"))
            total_qty = int(getattr(self, f"{prefix}_quantity"))
            tax = 0.18 if self.with_gst else 0
            tax_amt = float(unit_rate) * tax
            unit_rate_with_tax = round(float(unit_rate) + float(tax_amt))
            total_amount = unit_rate_with_tax * total_qty
            total_amount = round(total_amount, 2)
            return total_amount
        except Exception:
            logging.getLogger("error_log").error(traceback.format_exc())
            return False

    def get_ap_finacnt_debit_trans_data(self):
        try:
            return {
                "pk": self.pk,
                "bl_no": self.bl_no,
                "bk_no": self.bk_no,
                "date": self.date.astimezone(timezone.get_current_timezone()).strftime(
                    "%Y-%m-%d %H:%M"
                ),
                "client": self.client.name if self.client else None,
                "quantity": self.quantity,
                "original_amount": float(self.original_amount),
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "entry_type": self.entry_type,
                "tds": self.tds,
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def manage_qty_n_payment(self, size, increment=False, total_amount=None):
        try:
            if not total_amount:
                count = 1
                prefix = "size_20" if size == "20" else "size_40"
                unit_rate = float(getattr(self, f"{prefix}_rate"))
                total_tds = float(getattr(self, f"{prefix}_tds_amount"))
                total_qty = int(getattr(self, f"{prefix}_quantity"))
                unit_tds = total_tds / total_qty if total_qty else 0
                tax = 0.18 if self.with_gst else 0
                tax_amt = float(unit_rate) * tax
                unit_rate_with_tax = round(float(unit_rate) + float(tax_amt))
                total_amount = (unit_rate_with_tax - unit_tds) * count
                total_amount = round(total_amount, 2)

            if increment is True:
                self.remaining = int(self.remaining) + 1
                self.remaining_amount = (
                    float(self.remaining_amount)
                    + float(total_amount)
                    + float(self.balance_amount)
                )
                self.balance_amount = 0
            else:
                self.remaining = int(self.remaining) - 1
                self.remaining_amount = float(self.remaining_amount) - float(
                    total_amount
                )
            self.save()
            return True
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return False


class AdvLoloPymtInvoiceRel(models.Model):
    parent = models.ForeignKey(
        AdvancedHandlingPayment,
        related_name="advance_lolo_payment_rel",
        on_delete=models.CASCADE,
    )
    invoice_no = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "invoice_no"],
                name="unique_adv_lolo_payment_invoice",
            ),
        ]

    def __str__(self):
        return str(self.pk)


class DoValidityUpgradeHistory(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    pregate_in_id = models.CharField(max_length=50)
    pregate_out_id = models.CharField(max_length=50)
    container_no = models.CharField(max_length=50)
    old_do_validity_date = models.DateField()
    old_do_validity_time = models.TimeField()
    new_do_validity_date = models.DateField()
    new_do_validity_time = models.TimeField()
    location = models.ForeignKey(
        Location,
        related_name="do_validity_upgrade_history_location_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="do_validity_upgrade_history_site_rel",
        on_delete=models.CASCADE,
    )
    entry_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )

    def __str__(self):
        return self.container_no


class AdvancePaymentDoUpload(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    do_s3_object_name = models.TextField(null=True, blank=True)
    do_s3_file_name = models.TextField(null=True, blank=True)
    adv_payment_id = models.CharField(max_length=200)
    entry_type = models.CharField(
        max_length=100, null=True, blank=True, choices=CONTAINER_STATUS
    )

    def __str__(self):
        return str(self.pk)


class PreGateIn(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    client = models.ForeignKey(
        Client,
        related_name="pre_gatein_client_rel",
        on_delete=models.CASCADE,
    )
    type = models.ForeignKey(
        ContainerType,
        related_name="pre_gatein_type_rel",
        on_delete=models.CASCADE,
    )
    size = models.ForeignKey(
        ContainerSize,
        related_name="pre_gatein_size_rel",
        on_delete=models.CASCADE,
    )
    container_no = models.CharField(max_length=50)
    shipping_line = models.CharField(max_length=50)
    # history for revalidate, Only Admin and LocAdmin can Upgrade the validity
    do_validity_in_date = models.DateField()
    do_validity_in_time = models.TimeField()
    consignee = models.CharField(max_length=100, null=True, blank=True)
    shipper = models.CharField(max_length=100, null=True, blank=True)
    bl_no = models.CharField(max_length=100)
    cargo = models.CharField(max_length=100, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="pre_gatein_location_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="pre_gatein_site_rel",
        on_delete=models.CASCADE,
    )
    on_hold = models.BooleanField(null=True, blank=True, default=False)
    validity_expired = models.BooleanField(null=True, blank=True, default=False)
    is_gatein_done = models.BooleanField(null=True, blank=True, default=False)
    is_survey_done = models.BooleanField(null=True, blank=True, default=False)
    adv_payment_id = models.CharField(max_length=200)
    arrived = models.CharField(max_length=100, null=True, blank=True, choices=ARRIVED)
    lolo_amount = models.DecimalField(decimal_places=2, default=0, max_digits=10)

    def __str__(self):
        return self.container_no

    @classmethod
    def create_pre_gatein(cls, **kwargs):
        try:
            instance = cls(
                client=kwargs.get("client"),
                type=kwargs.get("type"),
                size=kwargs.get("size"),
                container_no=kwargs.get("container_no"),
                shipping_line=kwargs.get("shipping_line"),
                do_validity_in_date=kwargs.get("do_validity_in_date"),
                do_validity_in_time=kwargs.get("do_validity_in_time"),
                consignee=kwargs.get("consignee", None),
                shipper=kwargs.get("shipper", None),
                bl_no=kwargs.get("bl_no", None),
                cargo=kwargs.get("cargo", None),
                remarks=kwargs.get("remarks", None),
                location=kwargs.get("location"),
                site=kwargs.get("site"),
                arrived=kwargs.get("arrived"),
                lolo_amount=kwargs.get("lolo_amount"),
            )
            instance.save()
            return instance
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_pre_gatein_data(self):
        try:
            return {
                "pk": self.pk,
                "container_no": self.container_no,
                "client": self.client.name if self.client else None,
                "arrived": self.arrived if self.arrived else None,
                "lolo_amount": self.lolo_amount,
                "type": self.type.name if self.type else None,
                "size": self.size.name if self.size else None,
                "shipping_line": self.shipping_line,
                "do_validity_in_date": (
                    self.do_validity_in_date.strftime("%Y-%m-%d")
                    if self.do_validity_in_date
                    else ""
                ),
                "do_validity_in_time": (
                    self.do_validity_in_time.strftime("%H:%M")
                    if self.do_validity_in_time
                    else ""
                ),
                "adv_payment_id": self.adv_payment_id,
                "consignee": self.consignee,
                "shipper": self.shipper,
                "bl_no": self.bl_no,
                "cargo": self.cargo,
                "remarks": self.remarks,
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
                "on_hold": self.on_hold,
                "validity_expired": self.validity_expired,
                "is_gatein_done": self.is_gatein_done,
                "is_survey_done": self.is_survey_done,
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "updated_at": self.updated_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def upgrade_do_validity(self, date, time):
        try:
            self.do_validity_in_date = date
            self.do_validity_in_time = time
            self.validity_expired = False
            self.on_hold = False
            self.save()
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class PreGateOut(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    stock = models.ForeignKey(
        ContainerStock,
        related_name="pre_gateout_stock_rel",
        on_delete=models.CASCADE,
    )
    do_validity_out_date = models.DateField()
    do_validity_out_time = models.TimeField()
    bk_no = models.CharField(max_length=100)
    consignee = models.CharField(max_length=100, null=True, blank=True)
    shipper = models.CharField(max_length=100, null=True, blank=True)
    cargo = models.CharField(max_length=100, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    location = models.ForeignKey(
        Location,
        related_name="pre_gateout_location_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="pre_gateout_site_rel",
        on_delete=models.CASCADE,
    )
    on_hold = models.BooleanField(null=True, blank=True, default=False)
    validity_expired = models.BooleanField(null=True, blank=True, default=False)
    is_gateout_done = models.BooleanField(null=True, blank=True, default=False)
    adv_payment_id = models.CharField(max_length=200)
    departed = models.CharField(max_length=100, null=True, blank=True, choices=ARRIVED)
    lolo_amount = models.DecimalField(decimal_places=2, default=0, max_digits=10)

    def __str__(self):
        return self.stock.container.container_no

    @classmethod
    def create_pre_gateout(cls, **kwargs):
        try:
            instance = cls(
                stock=kwargs.get("stock"),
                do_validity_out_date=kwargs.get("do_validity_out_date"),
                do_validity_out_time=kwargs.get("do_validity_out_time"),
                bk_no=kwargs.get("bk_no", None),
                consignee=kwargs.get("consignee", None),
                shipper=kwargs.get("shipper", None),
                cargo=kwargs.get("cargo", None),
                remarks=kwargs.get("remarks", None),
                location=kwargs.get("location"),
                site=kwargs.get("site"),
                departed=kwargs.get("departed"),
                lolo_amount=kwargs.get("lolo_amount"),
            )
            instance.save()
            return instance
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_pre_gateout_data(self):
        try:
            return {
                "pk": self.pk,
                "container_no": self.stock.container.container_no,
                "client": self.stock.container.client.name,
                "type": self.stock.container.type.name,
                "size": self.stock.container.size.name,
                "departed": self.departed,
                "lolo_amount": self.lolo_amount,
                "shipping_line": self.stock.container.client.ref_code,
                "do_validity_out_date": (
                    self.do_validity_out_date.strftime("%Y-%m-%d")
                    if self.do_validity_out_date
                    else ""
                ),
                "do_validity_out_time": (
                    self.do_validity_out_time.strftime("%H:%M")
                    if self.do_validity_out_time
                    else ""
                ),
                "adv_payment_id": self.adv_payment_id,
                "consignee": self.consignee,
                "shipper": self.shipper,
                "bk_no": self.bk_no,
                "cargo": self.cargo,
                "remarks": self.remarks,
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
                "on_hold": self.on_hold,
                "validity_expired": self.validity_expired,
                "is_gateout_done": self.is_gateout_done,
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "updated_at": self.updated_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def upgrade_do_validity(self, date, time):
        try:
            self.do_validity_out_date = date
            self.do_validity_out_time = time
            self.validity_expired = False
            self.on_hold = False
            self.save()
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class CustomerFinAccount(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    customer = models.OneToOneField(
        Client,
        related_name="fin_account_customer",
        on_delete=models.CASCADE,
    )
    balance = models.DecimalField(decimal_places=2, default=0, max_digits=12)
    with_gst = models.BooleanField(null=True, blank=True, default=True)

    def __str__(self):
        return f"{self.customer.name}_fin_account"

    def get_fin_account_data(self):
        try:
            return {
                "pk": self.pk,
                "client": self.customer.name,
                "balance": float(self.balance),
                "with_gst": self.with_gst,
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "updated_at": self.updated_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_fin_account_trans_data(self):
        try:
            return {
                "pk": self.pk,
                "client": self.customer.name,
                "balance": float(self.balance),
                "with_gst": self.with_gst,
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "updated_at": self.updated_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "transactions": [
                    each.get_transaction_data()
                    for each in FinAccountTransaction.objects.filter(account=self)
                ],
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class FinAccountTransaction(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date = models.DateTimeField(default=timezone.now)
    account = models.ForeignKey(
        CustomerFinAccount,
        related_name="transactions",
        on_delete=models.CASCADE,
    )
    amount = models.DecimalField(decimal_places=2, max_digits=12)
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPE)
    payment_type = models.CharField(
        max_length=50, choices=FIN_TRANS_PAYMENT_TYPE, null=True, blank=True
    )
    cheque_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    utr_no = models.CharField(max_length=200, null=True, blank=True, unique=True)
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    account_name = models.CharField(max_length=200, null=True, blank=True)
    account_no = models.CharField(max_length=200, null=True, blank=True)
    linked_payment = models.CharField(
        max_length=200,
        null=True,
        blank=True,
    )
    is_balance_adjust = models.BooleanField(null=True, blank=True, default=False)

    def __str__(self):
        return (
            f"{self.transaction_type} - {self.amount} for {self.account.customer.name}"
        )

    @classmethod
    def credit_amount(cls, **kwargs):
        try:
            payment = cls(
                account=kwargs.get("account"),
                cheque_no=kwargs.get("cheque_no", ""),
                utr_no=kwargs.get("utr_no", ""),
                bank_name=kwargs.get("bank_name", ""),
                account_name=kwargs.get("account_name", ""),
                account_no=kwargs.get("account_no", ""),
                payment_type=kwargs.get("payment_type", ""),
                amount=kwargs.get("amount", 0.00),
                transaction_type="Credit",
            )
            payment.save()
            account = kwargs.get("account")
            account.balance = float(account.balance) + float(payment.amount)
            account.save()
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def debit_amount(cls, **kwargs):
        try:
            payment = cls(
                account=kwargs.get("account"),
                cheque_no=None,
                utr_no=None,
                bank_name=None,
                account_name=None,
                account_no=None,
                payment_type=None,
                amount=kwargs.get("amount", 0.00),
                transaction_type="Debit",
                linked_payment=kwargs.get("linked_payment"),
            )
            payment.save()
            account = kwargs.get("account")
            account.balance = float(account.balance) - float(payment.amount)
            account.save()
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    @classmethod
    def balance_adjust(cls, **kwargs):
        try:
            payment = cls(
                account=kwargs.get("account"),
                cheque_no=None,
                utr_no=None,
                bank_name=None,
                account_name=None,
                account_no=None,
                payment_type=None,
                amount=kwargs.get("amount", 0.00),
                transaction_type="Credit",
                linked_payment=kwargs.get("linked_payment"),
                is_balance_adjust=True,
            )
            payment.save()
            account = kwargs.get("account")
            account.balance = float(account.balance) + float(payment.amount)
            account.save()
            return payment
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_transaction_data(self):
        try:
            return {
                "pk": self.pk,
                "date": self.date.astimezone(timezone.get_current_timezone()).strftime(
                    "%Y-%m-%d %H:%M"
                ),
                "account": self.account.customer.name if self.account else None,
                "amount": float(self.amount),
                "transaction_type": self.transaction_type,
                "payment_type": self.payment_type,
                "cheque_no": self.cheque_no,
                "utr_no": self.utr_no,
                "bank_name": self.bank_name,
                "account_name": self.account_name,
                "account_no": self.account_no,
                "is_balance_adjust": self.is_balance_adjust,
                "created_at": self.created_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "updated_at": self.updated_at.astimezone(
                    timezone.get_current_timezone()
                ).strftime("%Y-%m-%d %H:%M"),
                "linked_payment": (
                    None
                    if not self.linked_payment
                    else AdvancedHandlingPayment.objects.get(
                        pk=self.linked_payment
                    ).get_ap_finacnt_debit_trans_data()
                ),
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_ledger_trans_row_data(self):
        try:
            if self.transaction_type == "Credit":
                tp = "Cr"
                date = f"{self.date.astimezone(timezone.get_current_timezone()).date().strftime("%-d-%b-%y")} {tp}"
                vch_type = "Receipt"
                particular = f"{self.payment_type} {self.bank_name} {self.account_no}"
                vch_no = ""

                if self.payment_type == "Cheque":
                    vch_no = self.cheque_no
                else:
                    vch_no = self.utr_no

                return [
                    {
                        "date": date,
                        "particular": particular,
                        "vch_type": vch_type,
                        "vch_no": vch_no,
                        "credit": str(float(self.amount)),
                        "debit": "",
                    }
                ]

            row_list = []
            tp = "Dr"
            date = f"{self.date.astimezone(timezone.get_current_timezone()).date().strftime("%-d-%b-%y")} {tp}"
            vch_type = f"Sales {self.account.customer.location.code} {self.account.customer.site.code}"
            particular = f"Container Lift Off & Lift On"
            vch_no = ""
            adv_payment = None
            if self.linked_payment:
                adv_payment = AdvancedHandlingPayment.objects.get(
                    pk=self.linked_payment
                )
                vch_no = adv_payment.bl_no if adv_payment.bl_no else adv_payment.bk_no

            row_list.append(
                {
                    "date": date,
                    "particular": particular,
                    "vch_type": vch_type,
                    "vch_no": vch_no,
                    "credit": "",
                    "debit": str(float(self.amount)),
                }
            )

            if adv_payment and adv_payment.tds > 0:
                tp = "Dr"
                date = f"{' ' * 9}{tp}"
                vch_type = f"Journal"
                particular = f"TDS Receivable"
                vch_no = ""
                total_tds_amount = float(adv_payment.size_20_tds_amount) + float(
                    adv_payment.size_40_tds_amount
                )
                row_list.append(
                    {
                        "date": date,
                        "particular": particular,
                        "vch_type": vch_type,
                        "vch_no": vch_no,
                        "credit": "",
                        "debit": str(total_tds_amount),
                    }
                )
            return row_list

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
