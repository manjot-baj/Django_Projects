from django.contrib import admin
from .models import *
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter


@admin.register(TariffMaster)
class TariffMasterAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "location", "site", "labour_rate")
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        "client",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(TariffMasterLine)
class TariffMasterLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "size",
        "type",
        "tariff_code",
        "main_component",
        "component_code",
        "component_description",
        "location_code",
        "location_description",
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
    )
    list_filter = (
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
        "parent__client",
        "main_component",
        "component_description",
        "location_description",
        "damage_description",
        "material_description",
        "repair_description",
        "unit",
        "measurement",
        "length_and_width",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(MnrStaff)
class MnrStaffAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "firstName",
        "lastName",
        "emailId",
        "mobileNo",
        "qualification",
        "role",
        "location",
        "site",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        "role",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "depot",
        "non_depot",
        "number",
        "original_date",
        "original_time",
        "current_date",
        "current_time",
        "survey_by",
        "created_by",
        "updated_by",
        "make_available",
        "is_locked",
        "is_draft",
        "is_proceed",
        "is_uploaded",
        "is_img_uploaded",
        "update_count",
        "s3_object_name",
        "s3_file_name",
        "labour_rate",
        "invoice_id",
    )
    list_filter = (
        ("depot__container__location", admin.RelatedOnlyFieldListFilter),
        ("non_depot__container__site", admin.RelatedOnlyFieldListFilter),
        ("original_date", DateRangeFilter),
        ("current_date", DateRangeFilter),
        ("survey_by", admin.RelatedOnlyFieldListFilter),
        ("created_by", admin.RelatedOnlyFieldListFilter),
        ("updated_by", admin.RelatedOnlyFieldListFilter),
        "make_available",
        "is_locked",
        "is_draft",
        "is_proceed",
        "is_uploaded",
        "is_img_uploaded",
        "depot__container__status",
        "non_depot__container__status",
    )
    search_fields = (
        "depot__container__container_no",
        "non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "depot", "non_depot", "survey_by", "created_by", "updated_by"
        )


@admin.register(BeforeRepairImage)
class BeforeRepairImageAdmin(admin.ModelAdmin):
    list_display = ("id", "parent", "s3_object_name", "s3_file_name")
    list_filter = (
        ("parent__depot__container__location", admin.RelatedOnlyFieldListFilter),
        ("parent__non_depot__container__site", admin.RelatedOnlyFieldListFilter),
        "parent__depot__container__status",
        "parent__non_depot__container__status",
    )
    search_fields = (
        "parent__depot__container__container_no",
        "parent__non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(SurveyLine)
class SurveyLineAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "is_rejected",
        "delete_disabled",
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
        ("parent__depot__container__location", admin.RelatedOnlyFieldListFilter),
        ("parent__non_depot__container__site", admin.RelatedOnlyFieldListFilter),
        "parent__depot__container__status",
        "parent__non_depot__container__status",
        "is_rejected",
        "delete_disabled",
        "tariff_field_enabled",
    )
    search_fields = (
        "parent__depot__container__container_no",
        "parent__non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(Estimate)
class EstimateAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "number",
        "est_rep_common_number",
        "original_date",
        "original_time",
        "current_date",
        "current_time",
        "current_date_time",
        "estimate_by",
        "created_by",
        "updated_by",
        "is_draft",
        "is_proceed",
        "original_amount",
        "current_amount",
        "is_locked",
        "is_approved",
        "is_repair_started",
    )
    list_filter = (
        ("parent__depot__container__location", admin.RelatedOnlyFieldListFilter),
        ("parent__non_depot__container__site", admin.RelatedOnlyFieldListFilter),
        "parent__depot__container__status",
        "parent__non_depot__container__status",
        ("original_date", DateRangeFilter),
        ("current_date", DateRangeFilter),
        ("estimate_by", admin.RelatedOnlyFieldListFilter),
        ("created_by", admin.RelatedOnlyFieldListFilter),
        ("updated_by", admin.RelatedOnlyFieldListFilter),
        "is_draft",
        "is_proceed",
        "is_locked",
        "is_approved",
        "is_repair_started",
    )
    search_fields = (
        "parent__depot__container__container_no",
        "parent__non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "original_date",
        "original_time",
        "current_date",
        "current_time",
        "current_date_time",
        "approved_date",
        "approved_time",
        "denial_reason",
        "approval_amount",
        "approved_amount",
        "denied_amount",
        "sent_to_line",
        "is_approved",
        "is_denied",
        "proceed_without_approval",
        "is_draft",
        "is_proceed",
        "created_by",
        "updated_by",
        "is_locked",
    )
    list_filter = (
        (
            "parent__parent__depot__container__location",
            admin.RelatedOnlyFieldListFilter,
        ),
        (
            "parent__parent__non_depot__container__site",
            admin.RelatedOnlyFieldListFilter,
        ),
        "parent__parent__depot__container__status",
        "parent__parent__non_depot__container__status",
        ("original_date", DateRangeFilter),
        ("current_date", DateRangeFilter),
        ("approved_date", DateRangeFilter),
        "sent_to_line",
        "is_approved",
        "is_denied",
        "proceed_without_approval",
        "is_draft",
        "is_proceed",
        ("created_by", admin.RelatedOnlyFieldListFilter),
        ("updated_by", admin.RelatedOnlyFieldListFilter),
        "is_locked",
    )
    search_fields = (
        "parent__parent__depot__container__container_no",
        "parent__parent__non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(Repair)
class RepairAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "number",
        "placement",
        "placement_date",
        "placement_time",
        "damage_category",
        "grade",
        "complete",
        "repair_date",
        "repair_time",
        "repair_date_time",
        "current_repair_date",
        "current_repair_time",
        "current_repair_date_time",
        "remarks",
        "s3_object_name",
        "s3_file_name",
        "created_by",
        "updated_by",
        "is_uploaded",
        "is_img_uploaded",
        "is_draft",
        "is_proceed",
    )
    list_filter = (
        (
            "parent__parent__depot__container__location",
            admin.RelatedOnlyFieldListFilter,
        ),
        (
            "parent__parent__non_depot__container__site",
            admin.RelatedOnlyFieldListFilter,
        ),
        "parent__parent__depot__container__status",
        "parent__parent__non_depot__container__status",
        "placement",
        ("placement_date", DateRangeFilter),
        "complete",
        ("repair_date", DateRangeFilter),
        ("current_repair_date", DateRangeFilter),
        ("created_by", admin.RelatedOnlyFieldListFilter),
        ("updated_by", admin.RelatedOnlyFieldListFilter),
        "is_uploaded",
        "is_img_uploaded",
        "is_draft",
        "is_proceed",
    )
    search_fields = (
        "parent__parent__depot__container__container_no",
        "parent__parent__non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(AfterRepairImage)
class AfterRepairImageAdmin(admin.ModelAdmin):
    list_display = ("id", "parent", "s3_object_name", "s3_file_name")
    list_filter = (
        (
            "parent__parent__parent__depot__container__location",
            admin.RelatedOnlyFieldListFilter,
        ),
        (
            "parent__parent__parent__non_depot__container__site",
            admin.RelatedOnlyFieldListFilter,
        ),
        "parent__parent__parent__depot__container__status",
        "parent__parent__parent__non_depot__container__status",
    )
    search_fields = (
        "parent__parent__depot__container__container_no",
        "parent__parent__non_depot__container__container_no",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("parent")


@admin.register(WistimS3Upload)
class WistimS3UploadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "date",
        "s3_object_name",
        "s3_file_name",
        "type",
        "location",
        "site",
    )
    list_filter = (
        ("date", DateTimeRangeFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(TariffSpecificLocation)
class TariffSpecificLocationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "location_code",
        "specific_location_code",
        "specific_location_description",
    )
    list_filter = ("location_code",)
