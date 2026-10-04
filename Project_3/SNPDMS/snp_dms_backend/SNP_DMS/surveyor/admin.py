from django.contrib import admin
from surveyor.models import Surveyor, SurveyorLine, SurveyorBeforeRepairImage
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter

# Register your models here.


@admin.register(Surveyor)
class SurveyorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container_no",
        "client",
        "survey_by",
        "is_img_uploaded",
        "location",
        "site",
    )

    list_filter = (
        ("manufacturing_date", DateRangeFilter),
        ("survey_date", DateRangeFilter),
        ("gate_in_date", DateRangeFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        ("survey_by", admin.RelatedOnlyFieldListFilter),
        ("client", admin.RelatedOnlyFieldListFilter),
    )

    search_fields = ("container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client", "survey_by")


@admin.register(SurveyorLine)
class SurveyLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "tariff_field_enabled",
        "main_component",
        "component_code",
        "component_description",
        "location_code",
        "location_description",
        "specific_location_code",
        "specific_location_description",
        "damage_code",
        "damage_description",
        "material_code",
        "material_description",
        "repair_code",
        "repair_description",
        "unit",
        "measurement",
        "length_and_width",
        "quantity",
        "labour_hrs_tariff",
        "wash_clean_tariff",
        "material_tariff",
        "labour_cost",
        "material_cost",
        "total_cost",
        "gst",
        "cgst",
        "cgst_amount",
        "sgst",
        "sgst_amount",
        "igst",
        "igst_amount",
        "total_tax_amount",
        "total_cost_with_tax",
    )
    list_filter = (
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
        "tariff_field_enabled",
    )
    search_fields = ("parent__container__container_no",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(SurveyorBeforeRepairImage)
class SurveyorBeforeRepairImageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "s3_object_name",
        "s3_file_name",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")
