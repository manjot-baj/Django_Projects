from django.contrib import admin
from transportation.models import *
from rangefilter.filters import DateRangeFilter


@admin.register(AccountMaster)
class AccountMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "account_type",
        "name",
        "address",
        "contact_no",
        "email_id",
        "remarks",
        "total_balance",
        "location",
        "site",
    )
    search_fields = ("name",)
    list_filter = (
        "account_type",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(CustomerMaster)
class CustomerMasterAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "address",
        "state",
        "state_code",
        "gstin",
        "pan_no",
        "contact_no",
        "email_id",
        "remarks",
        "tds",
        "location",
        "site",
    )
    search_fields = ("name",)
    list_filter = (
        "state",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(CreditorMaster)
class CreditorMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "address",
        "state",
        "state_code",
        "gstin",
        "pan_no",
        "contact_no",
        "email_id",
        "remarks",
        "tds",
        "location",
        "site",
    )
    search_fields = ("name",)
    list_filter = (
        "category",
        "state",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(DriverMaster)
class DriverMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "mobile_no",
        "pan_no",
        "license_no",
        "transporter",
    )
    search_fields = ("name",)
    list_filter = (
        ("transporter", admin.RelatedOnlyFieldListFilter),
        ("transporter__location", admin.RelatedOnlyFieldListFilter),
        ("transporter__site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(TruckMaster)
class TruckMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "transporter",
        "truck_no",
    )
    search_fields = ("truck_no",)
    list_filter = (
        ("transporter", admin.RelatedOnlyFieldListFilter),
        ("transporter__location", admin.RelatedOnlyFieldListFilter),
        ("transporter__site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(BookingMaster)
class BookingMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "entry_no",
        "booking_type",
        "lr_no",
        "bill_party",
        "transporter",
        "truck",
        "driver",
        "is_draft",
        "is_proceed",
        "location",
        "site",
    )
    list_filter = (
        "is_draft",
        "is_proceed",
        ("transporter", admin.RelatedOnlyFieldListFilter),
        ("bill_party", admin.RelatedOnlyFieldListFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("lr_no",)


@admin.register(BookingOptionMaster)
class BookingOptionMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "source_destination",
        "consignee",
        "particulars",
        "shipping_line",
        "port",
        "pod",
        "handling_company",
        "status",
        "location",
        "site",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(BookingBill)
class BookingBillAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking",
        "bill_party",
    )
    list_filter = (
        ("bill_party", admin.RelatedOnlyFieldListFilter),
        ("booking__location", admin.RelatedOnlyFieldListFilter),
        ("booking__site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(BookingBillLine)
class BookingBillLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "type_of_charge",
        "bill_amount",
        "rcm",
    )
    list_filter = (
        ("booking_bill__bill_party", admin.RelatedOnlyFieldListFilter),
        ("booking_bill__booking__location", admin.RelatedOnlyFieldListFilter),
        ("booking_bill__booking__site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(ServiceTaxMaster)
class ServiceTaxMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "description",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(PaymentReceiptMaster)
class PaymentReceiptMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "payment_receipt_type",
        "entry_type",
        "transaction",
        "entry_no",
        "entry_date",
        "customer",
        "creditor",
        "truck_no",
        "total_amount",
        "location",
        "site",
    )
    list_filter = (
        ("entry_date", DateRangeFilter),
        "payment_receipt_type",
        "entry_type",
        "transaction",
        "customer",
        "creditor",
        ("transaction_from", admin.RelatedOnlyFieldListFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(PaymentReceiptLine)
class PaymentReceiptLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "purchase_bill",
        "invoice_bill",
        "due_amount",
        "receipt_amount",
    )


@admin.register(ContraEntry)
class ContraEntryAdmin(admin.ModelAdmin):
    list_display = ("id", "entry_no", "entry_date", "account_debit", "account_credit")


@admin.register(JournalVoucher)
class JournalVoucherAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "transaction",
        "entry_no",
        "entry_date",
        "account_name",
        "under_account_name",
        "location",
        "site",
    )
    list_filter = (
        ("entry_date", DateRangeFilter),
        "under_account_name",
        "transaction",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(PurchaseMaster)
class PurchaseMasterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "entry_no",
        "entry_date",
        "transporter",
        "sup_bill_no",
        "sup_bill_date",
        "bill_amount",
        "due_bill_amount",
        "location",
        "site",
    )
    list_filter = (
        ("entry_date", DateRangeFilter),
        ("transporter", admin.RelatedOnlyFieldListFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )


@admin.register(PurchaseMasterLine)
class PurchaseMasterLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "due_amount",
    )


@admin.register(InvoiceBill)
class InvoiceBillAdmin(admin.ModelAdmin):
    list_display = ("id", "bill_no", "bill_date", "location", "site")


@admin.register(InvoiceBillLine)
class InvoiceBillLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking",
        "particulars",
        "services",
        "under_rcm",
        "freight_amount",
        "gst_rate",
        "total_amount",
    )


@admin.register(TransactionLog)
class TransactionLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "date",
        "vch_no",
        "vch_type",
        "particular",
        "creditor",
        "customer",
        "effect_on",
        "transaction_type",
        "transaction_method",
        "amount",
        "location",
        "site",
    )
    list_filter = (
        ("date", DateRangeFilter),
        ("created_at", DateRangeFilter),
        ("creditor", admin.RelatedOnlyFieldListFilter),
        ("customer", admin.RelatedOnlyFieldListFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
