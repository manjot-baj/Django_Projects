from django.contrib import admin
from .models import *
from .models_two import *
from rangefilter.filters import DateRangeFilter, DateTimeRangeFilter


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "currency")
    search_fields = ("name",)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "code",
        "target",
        "company_name",
        "company_address",
        "state_code",
        "country",
        "gst_no",
    )
    list_filter = (("country", admin.RelatedOnlyFieldListFilter),)
    search_fields = ("name",)


def get_queryset(self, request):
    queryset = super().get_queryset(request)
    return queryset.select_related(
        "country",
    )


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "location",
        "address",
        "contact",
        "code",
        "type",
        "depot_code",
        "depot_name",
        "vendor_code",
        "vendor_name",
        "automatic_mnr_status_change",
        "mnr_module",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        "automatic_mnr_status_change",
        "mnr_module",
        "mnr_ftp_upload",
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related(
            "location",
        )


@admin.register(Transporter)
class TransporterAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "location", "site", "code")
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(RefCodeMaster)
class RefCodeMasterAdmin(admin.ModelAdmin):
    list_display = ("id", "ref_code")
    search_fields = ("ref_code",)


@admin.register(ContainerType)
class ContainerTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(ContainerSize)
class ContainerSizeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(TypeSizeCode)
class TypeSizeCodeAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "size", "code")
    list_filter = (
        ("type", admin.RelatedOnlyFieldListFilter),
        ("size", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("type", "size")


@admin.register(VesselBkgNo)
class VesselBkgNoAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "number", "location", "site")
    list_filter = (
        ("date", DateRangeFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(VesselVoyageDetail)
class VesselVoyageDetailAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "bkg",
        "vessel_voyage",
        "voyage_no",
        "vessel_name",
        "location",
        "site",
    )
    list_filter = (
        "bkg__number",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("bkg__number",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(LocationCodeDetail)
class LocationCodeDetailAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name_code",
        "name",
        "code",
        "type",
        "location",
        "site",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(ExportCargoType)
class ExportCargoTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "code",
        "name",
        "alias_name_one",
        "alias_name_two",
        "contact_person",
        "type",
        "office_address",
        "city",
        "state",
        "zip",
        "office_phone_no",
        "mobile_no",
        "email_id",
        "website",
        "fax",
        "business_description",
        "notes",
        "location",
        "site",
        "cst_no",
        "service_tax_no",
        "bank_name",
        "account_name",
        "vat_no",
        "ecc_no",
        "bank_branch",
        "account_no",
        "gst_no",
        "pan_no",
        "ifsc_code",
        "swift_code",
        "edi_service",
        "ref_code",
        "operator_code",
        "current_location_code",
        "location_code",
        "edi_code",
        "edi_to_email_id",
        "edi_cc_email_id",
        "reported_by_from",
        "reported_by_to",
    )
    list_filter = (
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        "edi_service",
        "ref_code",
        "type",
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(ClientAbbreviation)
class ClientAbbreviationAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "name")
    list_filter = (("client", admin.RelatedOnlyFieldListFilter), "client__ref_code")
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("client")


@admin.register(ClientChildCompany)
class ClientChildCompanyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "parent",
        "name",
        "address",
        "gst_no",
        "state",
        "state_code",
        "zip_code",
    )
    list_filter = (
        "parent__ref_code",
        ("parent", admin.RelatedOnlyFieldListFilter),
        ("parent__location", admin.RelatedOnlyFieldListFilter),
        ("parent__site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "parent")


@admin.register(ClientRepresentative)
class ClientRepresentativeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "name",
        "designation",
        "phone_no",
        "mobile_no",
        "email_id",
    )
    list_filter = (
        ("client", admin.RelatedOnlyFieldListFilter),
        "client__ref_code",
    )
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("client")


@admin.register(ClientDocument)
class ClientDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "name",
        "document_s3_object_name",
        "document_s3_file_name",
    )
    list_filter = (("client", admin.RelatedOnlyFieldListFilter), "client__ref_code")
    search_fields = ("name",)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("client")


@admin.register(HandlingCharge)
class HandlingChargeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "type",
        "rate_of",
        "location",
        "site",
        "size",
        "amount",
    )
    list_filter = (
        "client__ref_code",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        ("size", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client", "size")


@admin.register(TransportationCharge)
class TransportationChargeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client",
        "type",
        "location",
        "site",
        "size",
        "amount",
    )
    list_filter = (
        "client__ref_code",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        ("size", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client", "size")


@admin.register(GroundRent)
class GroundRentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client_ref_code",
        "location",
        "site",
        "size",
        "day_1_to_30_amount",
        "day_31_to_60_amount",
        "day_61_to_90_amount",
        "day_91_to_120_amount",
        "day_over_120_amount",
    )
    list_filter = (
        "client_ref_code",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
        ("size", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site", "client", "size")


@admin.register(SealNo)
class SealNoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "number",
        "seal_box_number",
        "location",
        "site",
        "line",
        "in_date",
        "in_use_date",
        "out_date",
        "is_available",
        "is_damaged",
        "is_cut",
        "in_use",
        "is_first_allotment",
        "is_lock",
    )
    list_filter = (
        "line",
        "is_available",
        "is_damaged",
        "is_cut",
        "in_use",
        "is_lock",
        "is_first_allotment",
        ("in_date", DateTimeRangeFilter),
        ("in_use_date", DateTimeRangeFilter),
        ("out_date", DateTimeRangeFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ("number", "seal_box_number")

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(SealUpdateTracker)
class SealUpdateTrackerAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "container_no",
        "stock_id",
        "old_seal_no",
        "new_seal_no",
        "location",
        "site",
        "updated_at",
        "remarks",
    )
    list_filter = (
        ("updated_at", DateTimeRangeFilter),
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = (
        "container_no",
        "old_seal_no__number",
        "new_seal_no__number",
        "stock_id",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")


@admin.register(LineHandlingCharges)
class LineHandlingChargesAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ref_code",
        "location",
        "site",
        "size_20_rate",
        "size_40_rate",
        "night_charge_size_20_rate",
        "night_charge_size_40_rate",
    )
    list_filter = (
        "location",
        "site",
    )
    search_fields = (
        "ref_code",
        "location__name",
        "site__name",
    )
    ordering = ("-id",)


@admin.register(HandlingChargesHistory)
class HandlingChargesHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ref_code",
        "client_type",
        "location",
        "site",
        "size_20_rate",
        "size_40_rate",
        "night_charge_size_20_rate",
        "night_charge_size_40_rate",
    )
    list_filter = (
        "client_type",
        "location",
        "site",
    )
    search_fields = (
        "ref_code",
        "client_type",
        "location__name",
        "site__name",
    )
    ordering = ("-id",)
