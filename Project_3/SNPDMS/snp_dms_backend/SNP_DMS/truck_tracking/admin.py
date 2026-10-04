from django.contrib import admin

from truck_tracking.models import TruckTracking


@admin.register(TruckTracking)
class TruckTrackingAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "line",
        "transporter",
        "container_no",
        "gate_in_time",
        "gate_out_time",
        "time_since",
        "location",
        "site",
    )
    readonly_fields = ("gate_in_time",)
