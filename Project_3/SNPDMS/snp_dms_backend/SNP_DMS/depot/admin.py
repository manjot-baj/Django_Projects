from django.contrib import admin
from .models import *
from django.urls import reverse
from django.utils.html import format_html
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter
from .lolo_finance_models import (
    PreGateIn,
    PreGateOut,
    AdvancedHandlingPayment,
    DoValidityUpgradeHistory,
    AdvancePaymentDoUpload,
    CustomerFinAccount,
    FinAccountTransaction,
    AdvLoloPymtInvoiceRel,
)


@admin.register(Container)
class ContainerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "type",
        "size",
        "container_no",
        "payload",
        "gross_wt",
        "tare_wt",
        "manufacturing_date",
        "shipping_line",
        "leased_box",
        "is_available",
        "is_valid",
        "in_do_not_lift_queue",
        "queued_recently",
        "automatic_mnr_status_change",
        "status",
        "location",
        "site",
        "in_entry_count",
        "out_entry_count",
    )
    list_filter = (
        "client__ref_code",
        "type",
        "size",
        ("manufacturing_date", DateRangeFilter),
        "leased_box",
        "is_available",
        "is_valid",
        "status",
        "in_do_not_lift_queue",
        "queued_recently",
        "automatic_mnr_status_change",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client", "type", "size")


@admin.register(Eir)
class EirAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container",
        "eir_no",
        "done_by",
        "eir_date",
        "eir_time",
        "offload_date",
        "offload_time",
        "eir_amount",
        "repair_amount",
        "entry_type",
        "is_verified",
    )
    list_filter = (
        ("eir_date", DateRangeFilter),
        ("offload_date", DateRangeFilter),
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "entry_type",
        "is_verified",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container",
        )


@admin.register(EirLine)
class EirLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "eir",
        "grap_position",
        "damage_code",
        "description",
    )
    search_fields = ("eir__container__container_no",)
    list_filter = (
        "eir__container__status",
        "eir__container__client__ref_code",
        ("eir__container__location", admin.RelatedOnlyFieldListFilter),
        ("eir__container__site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "eir",
        )


@admin.register(GateIn)
class GateInAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container",
        "gate_pass_no",
        "in_date",
        "in_time",
        "condition",
        "grade",
        "arrived",
        "consignee",
        "shipper",
        "source",
        "from_location_code",
        "from_port_code",
        "vessel_name",
        "voyage_no",
        "do_ref",
        "cargo",
        "export_cargo_type",
        "transporter_name",
        "vehicle_no",
        "bl_no",
        "driver_name",
        "driver_license",
        "driver_mobile_no",
        "carrier_code",
        "location",
        "remarks",
        "do_s3_object_name",
        "do_s3_file_name",
        "is_verified",
    )
    list_filter = (
        ("in_date", DateRangeFilter),
        ("export_cargo_type", admin.RelatedOnlyFieldListFilter),
        ("transporter_name", admin.RelatedOnlyFieldListFilter),
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "is_verified",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("container", "location")


@admin.register(Handling)
class HandlingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container",
        "apply_charges",
        "customer_name",
        "invoice_no",
        "receipt_no",
        "invoice_date",
        "receipt_date",
        "delivery_date",
        "due_date",
        "lolo_type",
        "payment_type",
        "lolo_amount",
        "with_gst",
        "gst",
        "cgst",
        "cgst_amount",
        "sgst",
        "sgst_amount",
        "igst",
        "igst_amount",
        "net_amount",
        "taxable_amount",
        "gross_amount",
        "remark",
        "entry_type",
        "is_verified",
        "payment_id",
    )
    list_filter = (
        "with_gst",
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "entry_type",
        "is_verified",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container",
        )


@admin.register(HandlingPayment)
class HandlingPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "date",
        "bank_name",
        "account_name",
        "account_no",
        "cheque_no",
        "utr_no",
        "quantity",
        "remaining",
        "amount",
        "original_amount",
        "is_verified",
    )
    list_filter = (
        ("date", DateRangeFilter),
        "is_verified",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("id",)


@admin.register(SelfTransportation)
class SelfTransportationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container",
        "transporter",
        "apply_charges",
        "customer_name",
        "origin",
        "receipt_no",
        "receipt_date",
        "invoice_no",
        "invoice_date",
        "delivery_date",
        "due_date",
        "payment_type",
        "price",
        "with_gst",
        "gst",
        "cgst",
        "cgst_amount",
        "sgst",
        "sgst_amount",
        "igst",
        "igst_amount",
        "net_amount",
        "taxable_amount",
        "gross_amount",
        "remark",
        "entry_type",
        "is_verified",
        "payment_id",
    )
    list_filter = (
        "with_gst",
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "entry_type",
        "is_verified",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container",
        )


@admin.register(SelfTransportationPayment)
class SelfTransportationPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "date",
        "bank_name",
        "account_name",
        "account_no",
        "cheque_no",
        "utr_no",
        "quantity",
        "remaining",
        "amount",
        "original_amount",
        "is_verified",
    )
    list_filter = (("date", DateRangeFilter), "is_verified")
    search_fields = ("id",)


@admin.register(GateInHistory)
class GateInHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "updated_at",
        "is_date_updated",
        "date",
        "link_to_container",
        "eir",
        "gate_in",
        "lolo",
        "lolo_payment",
        "st",
        "st_payment",
        "is_email_sent",
        "invoice_id",
        "is_msc_excel_edi_sent",
    )
    list_filter = (
        ("created_at", DateTimeRangeFilter),
        ("date", DateTimeRangeFilter),
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "container__client__ref_code",
        "is_email_sent",
        "is_msc_excel_edi_sent",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container",
            "eir",
            "eir__container",
            "gate_in",
            "gate_in__container",
            "lolo",
            "lolo__container",
            "lolo_payment",
            "st",
            "st__container",
            "st_payment",
        )

    def link_to_container(self, obj):
        if obj.container is not None:
            link = reverse("admin:depot_container_change", args=[obj.container.id])
        else:
            link = reverse("admin:depot_container_change", args=[obj.container])
        return format_html('<a href="%s">%s</a>' % (link, obj.container))

    link_to_container.allow_tags = True
    link_to_container.short_description = "container"


@admin.register(GateOutHistory)
class GateOutHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "updated_at",
        "is_date_updated",
        "date",
        "link_to_container",
        "eir",
        "gate_out",
        "lolo",
        "lolo_payment",
        "st",
        "st_payment",
        "is_email_sent",
        "invoice_id",
        "is_msc_excel_edi_sent",
    )
    list_filter = (
        ("created_at", DateTimeRangeFilter),
        ("date", DateTimeRangeFilter),
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "container__client__ref_code",
        "is_email_sent",
        "is_msc_excel_edi_sent",
    )
    search_fields = ("container__container_no",)

    def link_to_container(self, obj):
        if obj.container is not None:
            link = reverse("admin:depot_container_change", args=[obj.container.id])
        else:
            link = reverse("admin:depot_container_change", args=[obj.container])
        return format_html('<a href="%s">%s</a>' % (link, obj.container))

    link_to_container.allow_tags = True
    link_to_container.short_description = "container"

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container",
            "eir",
            "eir__container",
            "gate_out",
            "gate_out__container",
            "lolo",
            "lolo__container",
            "lolo_payment",
            "st",
            "st__container",
            "st_payment",
        )


@admin.register(ContainerInOutRecord)
class ContainerInOutRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "link_to_container",
        "in_data",
        "out_data",
        "in_patched",
        "out_patched",
    )
    list_filter = (
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "container__client__ref_code",
        "in_patched",
        "out_patched",
    )
    search_fields = ("container__container_no",)

    def link_to_container(self, obj):
        if obj.container is not None:
            link = reverse("admin:depot_container_change", args=[obj.container.id])
        else:
            link = reverse("admin:depot_container_change", args=[obj.container])
        return format_html('<a href="%s">%s</a>' % (link, obj.container))

    link_to_container.allow_tags = True
    link_to_container.short_description = "container"

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container",
            "in_data",
            "in_data__container",
            "in_data__eir",
            "in_data__gate_in",
            "in_data__lolo",
            "in_data__lolo_payment",
            "in_data__st",
            "in_data__st_payment",
            "out_data",
            "out_data__container",
            "out_data__eir",
            "out_data__gate_out",
            "out_data__lolo",
            "out_data__lolo_payment",
            "out_data__st",
            "out_data__st_payment",
        )


@admin.register(ContainerStock)
class ContainerStockAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "link_to_container",
        "gate_in",
        "status",
        "grade",
        "empty_allotment_date",
        "available_date",
        "allotment_date",
        "booking_no",
        "seal_no",
        "container_status",
        "invoice_id",
        "is_rwm_edi_sent",
        "is_zim_repair_sent",
    )

    list_filter = (
        ("gate_in__in_date", DateRangeFilter),
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "container_status",
        "status",
        "container__client__ref_code",
        "is_rwm_edi_sent",
        "is_zim_repair_sent",
    )
    search_fields = ("container__container_no",)

    def link_to_container(self, obj):
        if obj.container is not None:
            link = reverse("admin:depot_container_change", args=[obj.container.id])
        else:
            link = reverse("admin:depot_container_change", args=[obj.container])
        return format_html('<a href="%s">%s</a>' % (link, obj.container))

    link_to_container.allow_tags = True
    link_to_container.short_description = "container"

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("container", "gate_in")


@admin.register(ContainerAllotment)
class ContainerAllotmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking_date",
        "booking_no",
        "booking_party",
        "validity_date",
        "quantity",
        "remaining",
        "remarks",
    )
    list_filter = (
        ("booking_date", DateRangeFilter),
        ("validity_date", DateRangeFilter),
    )

    def display_containers(self, obj):
        return ", ".join([container.container_no for container in obj.container.all()])

    display_containers.short_description = "Containers"

    # def get_queryset(self, request):
    #     queryset = super().get_queryset(request)
    #     return queryset.prefetch_related('container')


@admin.register(GateOut)
class GateOutAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container",
        "gate_pass_no",
        "out_date",
        "out_time",
        "condition",
        "grade",
        "departed",
        "destination",
        "consignee",
        "shipper",
        "delivery",
        "to_location_code",
        "to_port_code",
        "vessel_name",
        "voyage_no",
        "ro_ref",
        "export_cargo",
        "transporter_name",
        "vehicle_no",
        "driver_name",
        "driver_license",
        "driver_mobile_no",
        "carrier_code",
        "location",
        "port_of_loading",
        "port_of_discharge",
        "booking_no",
        "booking_date",
        "booking_party",
        "seal_no",
        "remarks",
        "do_s3_object_name",
        "do_s3_file_name",
        "is_verified",
    )
    list_filter = (
        ("out_date", DateRangeFilter),
        ("booking_date", DateRangeFilter),
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "is_verified",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("container", "location")


@admin.register(AllotmentTracker)
class AllotmentTrackerAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "updated_at",
        "booking_no",
        "container_no",
        "replaced_container_no",
        "stock_id",
        "replaced_stock_id",
        "booking_date",
        "booking_canceled",
        "replaced",
        "location",
        "site",
    )
    list_filter = (
        ("booking_date", DateRangeFilter),
        ("created_at", DateRangeFilter),
        ("updated_at", DateRangeFilter),
        "booking_canceled",
        "replaced",
        "location",
        "site",
    )
    search_fields = ("booking_no", "container_no", "replaced_container_no")

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(AdvancedHandlingPayment)
class AdvancedHandlingPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "created_at",
        "updated_at",
        "date",
        "bl_no",
        "bk_no",
        "client",
        "payment_type",
        "bank_name",
        "account_name",
        "account_no",
        "cheque_no",
        "utr_no",
        "transaction_id",
        "quantity",
        "remaining",
        "original_amount",
        "remaining_amount",
        "is_adjusted",
        "is_locked",
        "location",
        "site",
        "entry_type",
        "with_gst",
    )
    list_filter = (
        ("date", DateRangeFilter),
        "is_adjusted",
        "is_locked",
        "payment_type",
        "location",
        "site",
        "entry_type",
        "with_gst",
    )
    search_fields = (
        "cheque_no",
        "utr_no",
        "transaction_id",
        "bl_no",
        "bk_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(DoValidityUpgradeHistory)
class DoValidityUpgradeHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "pregate_in_id",
        "container_no",
        "old_do_validity_date",
        "old_do_validity_time",
        "new_do_validity_date",
        "new_do_validity_time",
        "location",
        "site",
        "entry_type",
    )
    list_filter = ("location", "site", "entry_type")
    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(PreGateIn)
class PreGateInAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "created_at",
        "updated_at",
        "container_no",
        "client",
        "shipping_line",
        "type",
        "size",
        "do_validity_in_date",
        "do_validity_in_time",
        "location",
        "site",
        "is_gatein_done",
        "on_hold",
        "validity_expired",
        "adv_payment_id",
    )
    list_filter = (
        "shipping_line",
        ("do_validity_in_date", DateRangeFilter),
        "location",
        "site",
        "is_gatein_done",
        "on_hold",
        "validity_expired",
    )
    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(PreGateOut)
class PreGateOutAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "created_at",
        "updated_at",
        "stock",
        "do_validity_out_date",
        "do_validity_out_time",
        "location",
        "site",
        "is_gateout_done",
        "on_hold",
        "validity_expired",
        "adv_payment_id",
    )
    list_filter = (
        ("do_validity_out_date", DateRangeFilter),
        "location",
        "site",
        "is_gateout_done",
        "on_hold",
        "validity_expired",
    )
    search_fields = ("stock__container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(AdvancePaymentDoUpload)
class AdvancePaymentDoUploadAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "created_at",
        "do_s3_object_name",
        "do_s3_file_name",
        "adv_payment_id",
        "entry_type",
    )
    list_filter = ("entry_type",)


@admin.register(EnBlockMovement)
class EnBlockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "line",
        "job_order_no",
        "vessel_no",
        "voyage_no",
        "quantity",
        "gate_ins",
        "pendency",
        "location",
        "site",
    )

    list_filter = ("location", "site", "line", "vessel_no", "voyage_no", "job_order_no")


@admin.register(EnBlockPreGateIn)
class EnBlockPreGateInAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "line",
        "container_no",
        "size",
        "type",
        "is_processed",
        "is_discarded",
        "en_block__vessel_no",
        "en_block__voyage_no",
        "en_block__job_order_no",
    )

    list_filter = (
        "en_block__location",
        "en_block__site",
        "line",
        "en_block__vessel_no",
        "en_block__voyage_no",
        "en_block__job_order_no",
    )


@admin.register(ManufacturingDateLog)
class ManufacturingDateLogAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "container_no",
        "previous_manufacturing_date",
        "current_manufacturing_date",
        "location",
        "site",
        "changed_by",
        "updated_at",
    )

    list_filter = (
        "location",
        "site",
        "changed_by",
    )


@admin.register(CustomerFinAccount)
class CustomerFinAccountAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "balance",
        "with_gst",
        "created_at",
        "updated_at",
    )
    search_fields = ("customer__name",)
    list_filter = ("created_at", "updated_at", "with_gst")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("customer", "balance", "with_gst")}),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(FinAccountTransaction)
class FinAccountTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "account",
        "transaction_type",
        "amount",
        "payment_type",
        "cheque_no",
        "utr_no",
        "bank_name",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "account__customer__name",
        "cheque_no",
        "utr_no",
        "linked_payment",
        "bank_name",
    )
    list_filter = (
        "transaction_type",
        "payment_type",
        "bank_name",
        "created_at",
        "updated_at",
    )
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)
    autocomplete_fields = ("account",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "account",
                    "transaction_type",
                    "payment_type",
                    "amount",
                    "date",
                ),
            },
        ),
        (
            "Payment Details",
            {
                "fields": (
                    "cheque_no",
                    "utr_no",
                    "bank_name",
                    "account_name",
                    "account_no",
                    "linked_payment",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(AdvLoloPymtInvoiceRel)
class AdvLoloPymtInvoiceRelAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "invoice_no",
    )
    list_filter = ("invoice_no",)
    search_fields = (
        "invoice_no",
        "parent__id",
    )
    ordering = ("-id",)
