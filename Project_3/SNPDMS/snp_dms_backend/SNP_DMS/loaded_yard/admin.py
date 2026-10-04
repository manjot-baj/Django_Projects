from django.contrib import admin
from loaded_yard.models import LoadedYard, LyExcelEdiMailTracker
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter


@admin.register(LoadedYard)
class LoadedYardAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
        "container_no",
        "process_type",
        "type_size",
        "port",
        "liner_merchant",
        "inward_rake",
        "outward_rake",
        "iit_date",
        "iit_time",
        "iit_is_sent",
        "iit_is_tracked",
        "dvan_date",
        "dvan_time",
        "dvan_is_sent",
        "dvan_is_tracked",
        "mtin_date",
        "mtin_time",
        "mtin_is_sent",
        "mtin_is_tracked",
        "van_date",
        "van_time",
        "van_is_sent",
        "van_is_tracked",
        "mir_date",
        "mir_time",
        "mir_is_sent",
        "mir_is_tracked",
        "mot_date",
        "mot_time",
        "mot_is_sent",
        "mot_is_tracked",
        "mot_current_location",
        "mot_to_location",
        "mot_booking_no",
        "mot_transporter",
        "mit_date",
        "mit_time",
        "mit_is_sent",
        "mit_is_tracked",
        "mit_current_location",
        "mor_date",
        "mor_time",
        "mor_is_sent",
        "mor_is_tracked",
        "mor_current_location",
        "mor_to_location",
        "mor_booking_no",
        "mor_transporter",
        "expin_date",
        "expin_time",
        "expin_is_sent",
        "expin_is_tracked",
        "eot_date",
        "eot_time",
        "eot_is_sent",
        "eot_is_tracked",
        "eot_to_location",
        "eot_to_depot_code",
        "eot_transporter",
        "booking_no",
        "seal_no",
        "report",
        "remarks",
        "location",
        "site",
    )
    list_filter = (
        ("created_at", DateTimeRangeFilter),
        "site",
        "iit_is_sent",
        "iit_is_tracked",
        "dvan_is_sent",
        "dvan_is_tracked",
        "mtin_is_sent",
        "mtin_is_tracked",
        "van_is_sent",
        "van_is_tracked",
        "mir_is_sent",
        "mir_is_tracked",
        "mot_is_sent",
        "mot_is_tracked",
        "mit_is_sent",
        "mit_is_tracked",
        "mor_is_sent",
        "mor_is_tracked",
        "expin_is_sent",
        "expin_is_tracked",
        "eot_is_sent",
        "eot_is_tracked",
    )
    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(LyExcelEdiMailTracker)
class LyExcelEdiMailTrackerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email_date",
        "container_no",
        "site",
        "data_id",
        "move_code",
        "excel_move_code",
    )
    list_filter = (
        ("email_date", DateTimeRangeFilter),
        "move_code",
        "excel_move_code",
    )
    search_fields = ("container_no",)
