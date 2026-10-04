from django.contrib import admin
from .models import *
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter


@admin.register(CmaEdiContent)
class CmaEdiContentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "date",
        "container_no",
        "process",
        "move_code",
        "site",
        "is_deleted",
        "is_regenerated",
        "stock_data_id",
    )
    list_filter = (
        ("date", DateTimeRangeFilter),
        ("created_at", DateTimeRangeFilter),
        "process",
        "move_code",
        "site",
        "is_deleted",
        "is_regenerated",
    )
    search_fields = ("container_no",)


@admin.register(MscEdiContent)
class MscEdiContentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "date",
        "container_no",
        "process",
        "move_code",
        "site",
        "is_deleted",
        "in_data_id",
        "out_data_id",
        "is_tracked",
    )
    list_filter = (
        ("date", DateTimeRangeFilter),
        ("created_at", DateTimeRangeFilter),
        "process",
        "move_code",
        "site",
        "is_deleted",
        "is_tracked",
    )
    search_fields = ("container_no",)


@admin.register(MscREdiContent)
class MscREdiContentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "date",
        "container_no",
        "process",
        "move_code",
        "site",
        "is_deleted",
    )
    list_filter = (
        ("date", DateTimeRangeFilter),
        ("created_at", DateTimeRangeFilter),
        "process",
        "move_code",
        "site",
        "is_deleted",
    )
    search_fields = ("container_no",)


@admin.register(EdiMailTracker)
class EdiMailTrackerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email_date",
        "process_date",
        "client",
        "process_type",
        "depot_type",
        "container_no",
        "size",
        "type",
        "site",
        "is_auto",
        "time_diff",
        "in_data_id",
        "out_data_id",
        "move_code",
        "excel_edi_move_code",
        "is_excel_edi",
    )
    list_filter = (
        ("email_date", DateTimeRangeFilter),
        ("process_date", DateTimeRangeFilter),
        "depot_type",
        "is_excel_edi",
        "is_auto",
        "process_type",
        "size",
        "type",
        "site",
        "move_code",
        "excel_edi_move_code",
    )
    search_fields = ("container_no",)


@admin.register(MscExcelEdiMoveCodeInfo)
class MscExcelEdiMoveCodeInfoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "date",
        "container_no",
        "process",
        "move_code",
        "site",
        "is_deleted",
        "in_data_id",
        "out_data_id",
        "is_tracked",
    )
    list_filter = (
        ("date", DateTimeRangeFilter),
        ("created_at", DateTimeRangeFilter),
        "process",
        "move_code",
        "site",
        "is_deleted",
        "is_tracked",
    )
    search_fields = ("container_no",)


class MscExcelEdiEmailInline(admin.TabularInline):
    model = MscExcelEdiEmail
    extra = 1


@admin.register(MscExcelEdiFTPCredential)
class MscExcelEdiFTPCredentialAdmin(admin.ModelAdmin):
    list_display = (
        "site",
        "ftp_username",
        "is_disabled",
    )
    list_filter = ("is_disabled",)
    search_fields = ("site", "ftp_username")
    inlines = [MscExcelEdiEmailInline]
    ordering = ("site",)


@admin.register(MscExcelEdiEmail)
class MscExcelEdiEmailAdmin(admin.ModelAdmin):
    list_display = ("email", "parent")
    search_fields = ("email", "parent__site")
    list_filter = ("parent__site",)