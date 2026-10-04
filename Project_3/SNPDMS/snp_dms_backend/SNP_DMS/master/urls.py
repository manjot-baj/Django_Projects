from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# from . import views
from .Views import (
    country_views,
    location_views,
    site_views,
    transporter_views,
    size_views,
    type_views,
    type_size_code_views,
    client_views,
    client_document_views,
    handling_charge_views,
    transportation_charge_views,
    ground_rent_views,
    vessel_bkg_no_views,
    vessel_voyage_detail_views,
    location_code_detail_views,
    export_cargo_type_views,
    ref_code_views,
    carrier_code_views,
    seal_no_views,
    site_incharge_views,
)
from . import bulk_upload_views

urlpatterns = [
    # COUNTRY
    path("country/add/", country_views.AddCountry.as_view()),
    path("country/all/", country_views.ListCountries.as_view()),
    path("country/delete/", country_views.DeleteCountry.as_view()),
    path("country/<int:pk>/", country_views.GetCountry.as_view()),
    path("country/<int:pk>/update/", country_views.UpdateCountry.as_view()),
    # LOCATION
    path("location/add/", location_views.AddLocation.as_view()),
    path("location/all/", location_views.ListLocation.as_view()),
    path("location/delete/", location_views.DeleteLocation.as_view()),
    path("location/<int:pk>/", location_views.GetLocation.as_view()),
    path("location/<int:pk>/update/", location_views.UpdateLocation.as_view()),
    # SITE
    path("site/add/", site_views.AddSite.as_view()),
    path("site/all/", site_views.ListSite.as_view()),
    path("site/delete/", site_views.DeleteSite.as_view()),
    path("site/<int:pk>/", site_views.GetSite.as_view()),
    path("site/<int:pk>/update/", site_views.UpdateSite.as_view()),
    # # TRANSPORTER
    path("transporter/add/", transporter_views.AddTransporter.as_view()),
    path("transporter/all/", transporter_views.ListTransporter.as_view()),
    path(
        "transporter/delete/",
        transporter_views.DeleteTransporter.as_view(),
    ),
    path("transporter/<int:pk>/", transporter_views.GetTransporter.as_view()),
    path("transporter/<int:pk>/update/", transporter_views.UpdateTransporter.as_view()),
    # SIZE
    path("size/add/", size_views.AddSize.as_view()),
    path("size/all/", size_views.ListSize.as_view()),
    path("size/delete/", size_views.DeleteSize.as_view()),
    path("size/<int:pk>/", size_views.GetSize.as_view()),
    path("size/<int:pk>/update/", size_views.UpdateSize.as_view()),
    # TYPE
    path("type/add/", type_views.AddType.as_view()),
    path("type/all/", type_views.ListTypes.as_view()),
    path("type/delete/", type_views.DeleteType.as_view()),
    path("type/<int:pk>/", type_views.GetType.as_view()),
    path("type/<int:pk>/update/", type_views.UpdateType.as_view()),
    # TYPE_SIZE_CODE --- AKA --- ISOCODE
    path("type_size_code/add/", type_size_code_views.AddTypeSize.as_view()),
    path(
        "type_size_code/all/",
        type_size_code_views.ListTypeSizeCode.as_view(),
    ),
    path(
        "type_size_code/delete/",
        type_size_code_views.DeleteTypeSizeCode.as_view(),
    ),
    path(
        "type_size_code/<int:pk>/",
        type_size_code_views.GetTypeSize.as_view(),
    ),
    path(
        "type_size_code/<int:pk>/update/",
        type_size_code_views.UpdateTypeSize.as_view(),
    ),
    # CLIENT
    path("client/add/", client_views.AddClient.as_view()),
    path("client/all/", client_views.ListClients.as_view()),
    path("client/delete/", client_views.DeleteClient.as_view()),
    path("client/<int:pk>/", client_views.GetClient.as_view()),
    path("client/<int:pk>/update/", client_views.UpdateClient.as_view()),
    # CLIENT DOCUMENT
    path("client_document/add/", client_document_views.AddClientDocument.as_view()),
    path(
        "client_document/all/",
        client_document_views.ListClientDocument.as_view(),
    ),
    path(
        "client_document/<int:pk>/",
        client_document_views.GetClientDocument.as_view(),
    ),
    path(
        "client_document/<int:pk>/update/",
        client_document_views.UpdateClientDocument.as_view(),
    ),
    path(
        "client_document/<int:pk>/download/",
        client_document_views.DownloadClientDocument.as_view(),
    ),
    path(
        "client_document/delete/",
        client_document_views.DeleteClientDocument.as_view(),
    ),
    # HANDLING CHARGE
    path("handling_charge/add/", handling_charge_views.AddHandlingCharge.as_view()),
    path(
        "handling_charge/all/",
        handling_charge_views.ListHandlingCharge.as_view(),
    ),
    path(
        "handling_charge/delete/",
        handling_charge_views.DeleteHandlingCharge.as_view(),
    ),
    path(
        "handling_charge/<int:pk>/",
        handling_charge_views.GetHandlingCharge.as_view(),
    ),
    path(
        "handling_charge/<int:pk>/update/",
        handling_charge_views.UpdateHandlingCharge.as_view(),
    ),
    # TRANSPORTATION CHARGE
    path(
        "transportation_charge/add/",
        transportation_charge_views.AddTransportationCharge.as_view(),
    ),
    path(
        "transportation_charge/all/",
        transportation_charge_views.ListTransportationChargeMaster.as_view(),
    ),
    path(
        "transportation_charge/delete/",
        transportation_charge_views.DeleteTransportationCharge.as_view(),
    ),
    path(
        "transportation_charge/<int:pk>/",
        transportation_charge_views.GetTransportationCharge.as_view(),
    ),
    path(
        "transportation_charge/<int:pk>/update/",
        transportation_charge_views.UpdateTransportationCharge.as_view(),
    ),
    # GROUND RENT
    path("ground_rent/add/", ground_rent_views.AddGroundRent.as_view()),
    path("ground_rent/all/", ground_rent_views.ListGroundRent.as_view()),
    path(
        "ground_rent/delete/",
        ground_rent_views.DeleteGroundRent.as_view(),
    ),
    path("ground_rent/<int:pk>/", ground_rent_views.GetGroundRent.as_view()),
    path("ground_rent/<int:pk>/update/", ground_rent_views.UpdateGroundRent.as_view()),
    # VESSEL BOOKING NO
    path("vessel_bkgno/add/", vessel_bkg_no_views.AddVesselBookingNo.as_view()),
    path("vessel_bkgno/all/", vessel_bkg_no_views.ListVesselBookingNo.as_view()),
    path(
        "vessel_bkgno/delete/",
        vessel_bkg_no_views.DeleteVesselBkgNo.as_view(),
    ),
    path(
        "vessel_bkgno/<int:pk>/",
        vessel_bkg_no_views.GetVesselBookingNo.as_view(),
    ),
    path(
        "vessel_bkgno/<int:pk>/update/",
        vessel_bkg_no_views.UpdateVesselBookingNo.as_view(),
    ),
    # VESSEL VOYAGE
    path(
        "vessel_voyage_detail/add/",
        vessel_voyage_detail_views.AddVesselVoyage.as_view(),
    ),
    path(
        "vessel_voyage_detail/all/",
        vessel_voyage_detail_views.ListVesselVoyage.as_view(),
    ),
    path(
        "vessel_voyage_detail/delete/",
        vessel_voyage_detail_views.DeleteVesselVoyage.as_view(),
    ),
    path(
        "vessel_voyage_detail/<int:pk>/",
        vessel_voyage_detail_views.GetVesselVoyage.as_view(),
    ),
    path(
        "vessel_voyage_detail/<int:pk>/update/",
        vessel_voyage_detail_views.UpdateVesselVoyage.as_view(),
    ),
    # LOCATION CODE DETAIL
    path(
        "location_code_detail/add/",
        location_code_detail_views.AddLocationCode.as_view(),
    ),
    path(
        "location_code_detail/all/",
        location_code_detail_views.ListLocationCodeDetail.as_view(),
    ),
    path(
        "location_code_detail/delete/",
        location_code_detail_views.DeleteLocationCodeDetail.as_view(),
    ),
    path(
        "location_code_detail/<int:pk>/",
        location_code_detail_views.GetLocationCode.as_view(),
    ),
    path(
        "location_code_detail/<int:pk>/update/",
        location_code_detail_views.UpdateLocationCode.as_view(),
    ),
    # EXPORT CARGO TYPE
    path(
        "export_cargo_type/add/",
        export_cargo_type_views.AddExportCargoType.as_view(),
    ),
    path(
        "export_cargo_type/all/",
        export_cargo_type_views.ListExportCargoType.as_view(),
    ),
    path(
        "export_cargo_type/delete/",
        export_cargo_type_views.DeleteExportCargoTypeMaster.as_view(),
    ),
    path(
        "export_cargo_type/<int:pk>/",
        export_cargo_type_views.GetExportCargoType.as_view(),
    ),
    path(
        "export_cargo_type/<int:pk>/update/",
        export_cargo_type_views.UpdateExportCargoType.as_view(),
    ),
    # REFCODE
    path("ref_code/add/", ref_code_views.AddRefCode.as_view()),
    path("ref_code/all/", ref_code_views.ListRefCode.as_view()),
    path("ref_code/delete/", ref_code_views.DeleteRefCode.as_view()),
    path("ref_code/<int:pk>/", ref_code_views.GetRefCode.as_view()),
    path("ref_code/<int:pk>/update/", ref_code_views.UpdateRefCode.as_view()),
    # Carrier Code
    path("carrier_code/add/", carrier_code_views.AddCarrierCode.as_view()),
    path("carrier_code/all/", carrier_code_views.ListCarrierCode.as_view()),
    path(
        "carrier_code/delete/",
        carrier_code_views.DeleteCarrierCode.as_view(),
    ),
    path("carrier_code/<int:pk>/", carrier_code_views.GetCarrierCode.as_view()),
    path(
        "carrier_code/<int:pk>/update/", carrier_code_views.UpdateCarrierCode.as_view()
    ),
    # Seal Number
    path("seal_no/add/", seal_no_views.AddSealNo.as_view()),
    path("seal_no/all/", seal_no_views.ListSealNo.as_view()),
    path("seal_no/delete/", seal_no_views.DeleteSealNo.as_view()),
    path("seal_no/<int:pk>/", seal_no_views.GetSealNo.as_view()),
    path("seal_no/<int:pk>/update/", seal_no_views.UpdateSealNo.as_view()),
    path(
        "get_seal_no_upload_sample_file/",
        bulk_upload_views.MasterSealNoUploadSampleFile.as_view(),
    ),
    path(
        "extract_seal_no_upload_file_data/",
        bulk_upload_views.MasterSealNoUploadSampleFile.as_view(),
    ),
    path(
        "extract_seal_no_data_import/", bulk_upload_views.MasterSealNoImport.as_view()
    ),
    path(
        "rejected_seal_no_file_download/",
        bulk_upload_views.MasterRejectedSealNoDataFile.as_view(),
    ),
    path(
        "get_available_seal_no_list/<str:pk>/",
        seal_no_views.GetAvailableSealNoView.as_view(),
    ),
    # Site incharge
    path("site_incharge/add/", site_incharge_views.AddSiteIncharge.as_view()),
    path("site_incharge/all/", site_incharge_views.ListSiteIncharge.as_view()),
    path("site_incharge/<int:pk>/", site_incharge_views.GetSiteIncharge.as_view()),
    path(
        "site_incharge/<int:pk>/update/",
        site_incharge_views.UpdateSiteIncharge.as_view(),
    ),
    path(
        "site_incharge/<int:pk>/delete/",
        site_incharge_views.DeleteSiteIncharge.as_view(),
    ),
    # LineHandlingCharges
    path(
        "line_handling_charges/add/",
        client_views.AddLineHandlingCharges.as_view(),
    ),
    path(
        "line_handling_charges/list/",
        client_views.GetLineHandlingCharges.as_view(),
    ),
    path(
        "line_handling_charges/list/<int:pk>/",
        client_views.GetLineHandlingChargesById.as_view(),
    ),
    path(
        "line_handling_charges/list/<int:pk>/update/",
        client_views.UpdateLineHandlingCharges.as_view(),
    ),
    path(
        "line_handling_charges/list/<int:pk>/delete/",
        client_views.DeleteLineHandlingCharges.as_view(),
    ),
    # HandlingChargesHistory
    path(
        "handling_charges_history/add/",
        client_views.AddHandlingChargesHistory.as_view(),
    ),
    path(
        "handling_charges_history/list/",
        client_views.GetHandlingChargesHistory.as_view(),
    ),
    path(
        "handling_charges_history/list/<int:pk>/",
        client_views.GetHandlingChargesHistoryById.as_view(),
    ),
    path(
        "handling_charges_history/list/<int:pk>/update/",
        client_views.UpdateHandlingChargesHistory.as_view(),
    ),
    path(
        "handling_charges_history/list/<int:pk>/delete/",
        client_views.DeleteHandlingChargesHistory.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns = [
#     # COUNTRY
#     path("add_country/", views.AddCountryMaster.as_view()),
#     path("get_all_country/", views.AddCountryMaster.as_view()),
#     path("get_all_country/<int:pk>/", views.EditCountryMaster.as_view()),
#     path("get_all_country/delete/", views.DeleteCountryMaster.as_view()),
#     # LOCATION
#     path("add_location/", views.AddLocationMaster.as_view()),
#     path("get_all_location/", views.AddLocationMaster.as_view()),
#     path("get_all_location/<int:pk>/", views.EditLocationMaster.as_view()),
#     path("get_all_location/delete/", views.DeleteLocationMaster.as_view()),
#     # SITE
#     path("add_site/", views.AddSiteMaster.as_view()),
#     path("get_all_site/", views.AddSiteMaster.as_view()),
#     path("get_all_site/<int:pk>/", views.EditSiteMaster.as_view()),
#     path("get_all_site/delete/", views.DeleteSiteMaster.as_view()),
#     # TRANSPORTER
#     path("add_transporter/", views.AddTransporterMaster.as_view()),
#     path("get_all_transporter/", views.GetAllTransporterMaster.as_view()),
#     path("get_all_transporter/<int:pk>/", views.EditTransporterMaster.as_view()),
#     path("get_all_transporter/delete/", views.DeleteTransporterMaster.as_view()),
#     # SIZE
#     path("add_size/", views.AddSizeMaster.as_view()),
#     path("get_all_size/", views.AddSizeMaster.as_view()),
#     path("get_all_size/<int:pk>/", views.EditSizeMaster.as_view()),
#     path("get_all_size/delete/", views.DeleteSizeMaster.as_view()),
#     # TYPE
#     path("add_type/", views.AddTypeMaster.as_view()),
#     path("get_all_type/", views.AddTypeMaster.as_view()),
#     path("get_all_type/<int:pk>/", views.EditTypeMaster.as_view()),
#     path("get_all_type/delete/", views.DeleteTypeMaster.as_view()),
#     # TYPE_SIZE_CODE --- AKA --- ISOCODE
#     path("add_type_size_code/", views.AddTypeSizeCodeMaster.as_view()),
#     path("get_all_type_size_code/", views.AddTypeSizeCodeMaster.as_view()),
#     path("get_all_type_size_code/<int:pk>/", views.EditTypeSizeCodeMaster.as_view()),
#     path("get_all_type_size_code/delete/", views.DeleteTypeSizeCodeMaster.as_view()),
#     # CLIENT
#     path("add_client/", views.AddClientMaster.as_view()),
#     path("get_all_client/", views.GetClientMaster.as_view()),
#     path("get_all_client/<int:pk>/", views.EditClientMaster.as_view()),
#     path("get_all_client/delete/", views.DeleteClientMaster.as_view()),
#     # CLIENT DOCUMENT
#     path("add_client_document/", views.AddClientDocumentMaster.as_view()),
#     path("get_all_client_document/", views.GetClientDocumentMaster.as_view()),
#     path("get_all_client_document/<int:pk>/", views.EditClientDocumentMaster.as_view()),
#     path(
#         "get_all_client_document/<int:pk>/download/",
#         views.DownloadClientDocumentMaster.as_view(),
#     ),
#     path("get_all_client_document/delete/", views.DeleteClientDocumentMaster.as_view()),
#     # HANDLING CHARGE
#     path("add_handling_charge/", views.AddHandlingChargeMaster.as_view()),
#     path(
#         "get_all_handling_charge/",
#         views.GetAllHandlingChargeMaster.as_view(),
#     ),
#     path("get_all_handling_charge/<int:pk>/", views.EditHandlingChargeMaster.as_view()),
#     path("get_all_handling_charge/delete/", views.DeleteHandlingChargeMaster.as_view()),
#     # TRANSPORTATION CHARGE
#     path("add_transportation_charge/", views.AddTransportationChargeMaster.as_view()),
#     path(
#         "get_all_transportation_charge/",
#         views.GetAllTransportationChargeMaster.as_view(),
#     ),
#     path(
#         "get_all_transportation_charge/<int:pk>/",
#         views.EditTransportationChargeMaster.as_view(),
#     ),
#     path(
#         "get_all_transportation_charge/delete/",
#         views.DeleteTransportationChargeMaster.as_view(),
#     ),
#     # GROUND RENT
#     path("add_ground_rent/", views.AddGroundRentMaster.as_view()),
#     path("get_all_ground_rent/", views.GetAllGroundRentMaster.as_view()),
#     path("get_all_ground_rent/<int:pk>/", views.EditGroundRentMaster.as_view()),
#     path("get_all_ground_rent/delete/", views.DeleteGroundRentMaster.as_view()),
#     # VESSEL BOOKING NO
#     path("add_vessel_bkgno/", views.AddVesselBkgNoMaster.as_view()),
#     path("get_all_vessel_bkgno/", views.GetAllVesselBkgNoMaster.as_view()),
#     path("get_all_vessel_bkgno/<int:pk>/", views.EditVesselBkgNoMaster.as_view()),
#     path("get_all_vessel_bkgno/delete/", views.DeleteVesselBkgNoMaster.as_view()),
#     # VESSEL VOYAGE
#     path("add_vessel_voyage_detail/", views.AddVesselVoyageDetailMaster.as_view()),
#     path(
#         "get_all_vessel_voyage_detail/",
#         views.GetAllVesselVoyageDetailMaster.as_view(),
#     ),
#     path(
#         "get_all_vessel_voyage_detail/<int:pk>/",
#         views.EditVesselVoyageDetailMaster.as_view(),
#     ),
#     path(
#         "get_all_vessel_voyage_detail/delete/",
#         views.DeleteVesselVoyageDetailMaster.as_view(),
#     ),
#     # LOCATION CODE DETAIL
#     path("add_location_code_detail/", views.AddLocationCodeDetailMaster.as_view()),
#     path(
#         "get_all_location_code_detail/",
#         views.GetAllLocationCodeDetailMaster.as_view(),
#     ),
#     path(
#         "get_all_location_code_detail/<int:pk>/",
#         views.EditLocationCodeDetailMaster.as_view(),
#     ),
#     path(
#         "get_all_location_code_detail/delete/",
#         views.DeleteLocationCodeDetailMaster.as_view(),
#     ),
#     # EXPORT CARGO TYPE
#     path("add_export_cargo_type/", views.AddExportCargoTypeMaster.as_view()),
#     path("get_all_export_cargo_type/", views.AddExportCargoTypeMaster.as_view()),
#     path(
#         "get_all_export_cargo_type/<int:pk>/", views.EditExportCargoTypeMaster.as_view()
#     ),
#     path(
#         "get_all_export_cargo_type/delete/", views.DeleteExportCargoTypeMaster.as_view()
#     ),
#     # REFCODE
#     path("add_ref_code/", views.AddRefCodeMaster.as_view()),
#     path("get_all_ref_code/", views.AddRefCodeMaster.as_view()),
#     path("get_all_ref_code/<int:pk>/", views.EditRefCodeMaster.as_view()),
#     path("get_all_ref_code/delete/", views.DeleteRefCodeMaster.as_view()),
#     # Carrier Code
#     path("add_carrier_code/", views.AddCarrierCodeMaster.as_view()),
#     path("get_all_carrier_code/", views.GetAllCarrierCodeMaster.as_view()),
#     path("get_all_carrier_code/<int:pk>/", views.EditCarrierCodeMaster.as_view()),
#     path("get_all_carrier_code/delete/", views.DeleteCarrierCodeMaster.as_view()),
#     # Seal Number
#     path("add_seal_no/", views.AddSealNoMaster.as_view()),
#     path("get_all_seal_no/", views.GetAllSealNoMaster.as_view()),
#     path("get_all_seal_no/<int:pk>/", views.EditSealNoMaster.as_view()),
#     path("get_all_seal_no/delete/", views.DeleteSealNoMaster.as_view()),
#     path(
#         "get_seal_no_upload_sample_file/",
#         bulk_upload_views.MasterSealNoUploadSampleFile.as_view(),
#     ),
#     path(
#         "extract_seal_no_upload_file_data/",
#         bulk_upload_views.MasterSealNoUploadSampleFile.as_view(),
#     ),
#     path(
#         "extract_seal_no_data_import/", bulk_upload_views.MasterSealNoImport.as_view()
#     ),
#     path(
#         "rejected_seal_no_file_download/",
#         bulk_upload_views.MasterRejectedSealNoDataFile.as_view(),
#     ),
#     path(
#         "get_available_seal_no_list/<str:pk>/", views.GetAvailableSealNoView.as_view()
#     ),
#     path(
#         "master_automation/",
#         automation_views.MasterDependencyCheck.as_view(),
#     ),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
