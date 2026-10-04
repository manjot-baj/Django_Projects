from django.contrib import admin
from .models import *
from django.urls import reverse
from django.utils.html import format_html
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter


@admin.register(NonDepotContainer)
class NonDepotContainerAdmin(admin.ModelAdmin):
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
        "dock_destuff",
        "mode",
        "is_available",
        "status",
        "location",
        "site",
        "condition",
        "grade",
        "automatic_mnr_status_change",
        "in_entry_count",
        "out_entry_count",
    )
    list_filter = (
        "client__ref_code",
        "type",
        "size",
        ("manufacturing_date", DateRangeFilter),
        "is_available",
        "status",
        "automatic_mnr_status_change",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client", "type", "size")


@admin.register(NonDepotGateIn)
class NonDepotGateInAdmin(admin.ModelAdmin):
    list_display = ("id", "container", "in_date", "in_time")
    list_filter = (
        ("in_date", DateRangeFilter),
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container__location",
            "container__site",
            "container",
        )


@admin.register(NonDepotGateOut)
class NonDepotGateOutAdmin(admin.ModelAdmin):
    list_display = ("id", "container", "out_date", "out_time")
    list_filter = (
        ("out_date", DateRangeFilter),
        "container__status",
        "container__client__ref_code",
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "container__location",
            "container__site",
            "container",
        )


@admin.register(NonDepotContainerStock)
class NonDepotContainerStockAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "gate_in",
        "gate_out",
        "link_to_container",
        "status",
        "stage",
        "container_status",
        "survey_date",
        "survey_time",
        "estimate_date",
        "estimate_time",
        "approval_date",
        "approval_time",
        "repair_date",
        "repair_time",
        "available_date",
        "available_time",
        "survey_pending_in_date_time",
        "survey_pending_out_date_time",
        "estimate_pending_in_date_time",
        "estimate_pending_out_date_time",
        "approval_pending_in_date_time",
        "approval_pending_out_date_time",
        "approved_in_date_time",
        "approved_out_date_time",
        "under_repair_in_date_time",
        "under_repair_out_date_time",
        "available_in_date_time",
        "available_out_date_time",
        "estimate_status",
    )
    list_filter = (
        ("gate_in__in_date", DateRangeFilter),
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        "container_status",
        "status",
        ("container__client", admin.RelatedOnlyFieldListFilter),
        "container__client__ref_code",
    )
    search_fields = ("container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("container", "gate_in", "gate_out")

    def link_to_container(self, obj):
        if obj.container is not None:
            link = reverse(
                "admin:non_depot_nondepotcontainer_change", args=[obj.container.id]
            )
        else:
            link = reverse(
                "admin:non_depot_nondepotcontainer_change", args=[obj.container]
            )
        return format_html('<a href="%s">%s</a>' % (link, obj.container))

    link_to_container.allow_tags = True
    link_to_container.short_description = "container"


@admin.register(NonDepotContainerInOutRecord)
class NonDepotContainerInOutRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "link_to_container", "gate_in", "gate_out")
    list_filter = (
        ("container__location", admin.RelatedOnlyFieldListFilter),
        ("container__site", admin.RelatedOnlyFieldListFilter),
        ("container__client", admin.RelatedOnlyFieldListFilter),
        "container__client__ref_code",
    )
    search_fields = ("container__container_no",)

    def link_to_container(self, obj):
        if obj.container is not None:
            link = reverse(
                "admin:non_depot_nondepotcontainer_change", args=[obj.container.id]
            )
        else:
            link = reverse(
                "admin:non_depot_nondepotcontainer_change", args=[obj.container]
            )
        return format_html('<a href="%s">%s</a>' % (link, obj.container))

    link_to_container.allow_tags = True
    link_to_container.short_description = "container"

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "gate_in",
            "gate_out",
            "container",
        )
