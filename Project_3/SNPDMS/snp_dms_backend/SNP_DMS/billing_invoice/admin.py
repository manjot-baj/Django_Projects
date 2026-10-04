from django.contrib import admin
from .models import *
from rangefilter.filters import DateRangeFilter


@admin.register(CustomerBill)
class CustomerBillAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "bill_type",
        "bill_for",
        "container_no",
        "client",
        "is_payment_completed",
        "payment_type",
        "original_amount",
        "remaining_amount",
        "location",
        "site",
    )
    search_fields = ("container_no",)
    list_filter = (
        "bill_type",
        "payment_type",
        "is_payment_completed",
        "bill_for",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client")


@admin.register(CustomerBillInvoice)
class CustomerBillInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "invoice_no",
        "financial_year",
        "invoice_date",
        "bill_type",
        "client",
        "total_amount",
        "bill_to_party_client",
        "ship_to_party_client",
        "location",
        "site",
    )
    search_fields = ("invoice_no",)
    list_filter = (
        "bill_type",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client")


@admin.register(CustomerBillInvoiceLine)
class CustomerBillInvoiceLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "original_amount",
        "remaining_amount",
        "container_no",
        "rec_amount",
        "bill_id",
    )
    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(MNRInvoiceLine)
class MNRInvoiceLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "process",
        "size",
        "bill_count",
        "total_amount",
        "discount",
        "total_amount_after_discount",
    )

    list_filter = (
        "process",
        "size",
        "discount",
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(CreditNote)
class CreditNoteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "credit_note_no",
        "financial_year",
        "credit_note_date",
        "bill_type",
        "total_amount",
    )
    search_fields = ("credit_note_no",)
    list_filter = (
        "bill_type",
        # ("location", admin.RelatedOnlyFieldListFilter),
        # ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("invoice")
