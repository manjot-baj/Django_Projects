from django.contrib import admin
from .models import AdhocReportRequest


@admin.register(AdhocReportRequest)
class AdhocReportRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id", "report_type", "status", "email_sent", "location", "site", "created_at", "updated_at"
    )
    list_filter = ("status", "email_sent", "report_type", "location", "site")
    search_fields = ("report_type", "status", "location", "site")
    ordering = ("-created_at",)
    # actions = ["mark_as_completed", "mark_as_failed", "delete_selected"]

    # def mark_as_completed(self, request, queryset):
    #     queryset.update(status="Completed")
    # mark_as_completed.short_description = "Mark selected reports as Completed"

    # def mark_as_failed(self, request, queryset):
    #     queryset.update(status="Failed")
    # mark_as_failed.short_description = "Mark selected reports as Failed"
