from django.contrib import admin
from procurement.models import (
    ToolRoom,
    ToolCategory,
    Requisition,
    RequisitionLine,
    Consumption,
    ConsumptionLine,
    RequisitionHistoryLine,
    ToolRateHistory,
    BillUpload,
    ToolTransfer,
    ToolTransferLine,
    ToolTransferHistory,
)
from rangefilter.filters import DateRangeFilter


@admin.register(ToolRoom)
class ToolRoomAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "category",
        "name",
        "sku_code",
        "rate",
        "in_stock",
        "unit",
        "location",
        "site",
    )
    list_filter = (
        ("unit"),
        ("category", admin.RelatedOnlyFieldListFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "category")


@admin.register(Consumption)
class ConsumptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "consumption_no",
        "date",
        "location",
        "site",
    )
    search_fields = ("consumption_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(Requisition)
class RequisitionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_no",
        "date",
        "status",
        "total_amount",
        "location",
        "site",
    )
    search_fields = ("order_no",)
    list_filter = (
        "status",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(RequisitionLine)
class RequisitionLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "tool",
        "rate",
        "required_qty",
        "received_qty",
        "remaining_qty",
        "amount",
    )
    list_filter = (
        ("tool", admin.RelatedOnlyFieldListFilter),
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
    )
    # search_fields = ("description",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(ConsumptionLine)
class ConsumptionLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "tool",
        "consumed_quantity",
    )
    list_filter = (
        ("tool", admin.RelatedOnlyFieldListFilter),
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
    )

    # search_fields = ("description",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(ToolCategory)
class ToolCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
    )
    search_fields = ("name",)


@admin.register(RequisitionHistoryLine)
class RequisitionHistoryLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_no",
        "date",
        "parent",
        "bill_date",
        "received_date",
        "bill_no",
        "total_amount",
    )
    list_filter = (
        ("date", DateRangeFilter),
        ("bill_date", DateRangeFilter),
        ("received_date", DateRangeFilter),
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
    )

    search_fields = ("order_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(ToolRateHistory)
class ToolRateHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "tool",
        "modified_rate",
        "previous_rate",
        "location",
        "site",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        ("tool__category"),
    )
    search_fields = ("tool__name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(BillUpload)
class BillUploadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "s3_object_name",
        "s3_file_name",
    )
    search_fields = ("s3_file_name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(ToolTransfer)
class ToolTransferAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "date",
        "created_at",
        "location",
        "site",
        "tool_transfer_no",
        "transfer_type",
        "requested_from",
    )
    search_fields = ("tool_transfer_no",)

    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        ("transfer_type"),
        ("requested_from", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(ToolTransferLine)
class ToolTransferLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "required_quantity",
        "received_quantity",
        "tool",
    )
    search_fields = ("tool",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(ToolTransferHistory)
class ToolTransferHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "approved_by",
        "tool",
        "tools_added",
        "tools_removed",
    )
    search_fields = ("tool",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")
