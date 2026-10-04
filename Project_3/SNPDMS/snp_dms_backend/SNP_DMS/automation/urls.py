from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


from automation.Views import (
    allotment_automation_views,
    master_automation_views,
    corrupted_container_deletion_views,
    non_depot_container_views,
    container_info_views,
    lolo_receipt_automation_views,
    unique_gst_client_views,
    procurement_views,
)

urlpatterns = [
    path(
        "master_dependency_check/",
        master_automation_views.MasterDependencyCheck.as_view(),
    ),
    path("check_booking_no/", allotment_automation_views.CheckBookingNumber.as_view()),
    path(
        "container_allotment/", allotment_automation_views.BookingNoAllotment.as_view()
    ),
    path(
        "new_booking_no_entry/",
        allotment_automation_views.NewBookingNoAllotment.as_view(),
    ),
    path(
        "corrupted_in_out_container_delete/",
        corrupted_container_deletion_views.InOutRegularCorruptedContainer.as_view(),
    ),
    path(
        "non_depot_container_delete/",
        non_depot_container_views.DeleteNonDepotContainer.as_view(),
    ),
    # path(
    #     "in_out_container_delete/",
    #     corrupted_container_deletion_views.InOutContainer.as_view(),
    # ),
    path(
        "container_info/",
        container_info_views.ContainerInfo.as_view(),
    ),
    path(
        "get_container_details/",
        lolo_receipt_automation_views.GetContainerDetails.as_view(),
    ),
    path(
        "download_lolo_receipt/",
        lolo_receipt_automation_views.DownloadLoloReceipt.as_view(),
    ),
    path(
        "unique_gst_client_clean_upload/",
        unique_gst_client_views.UniqueGstClientCleanUploadView.as_view(),
    ),
    path(
        "unique_gst_client_clean_process/",
        unique_gst_client_views.UniqueGstClientCleanProcessView.as_view(),
    ),
    path(
        "rejected_unique_gst_client_clean_download/",
        unique_gst_client_views.UniqueGstClientCleanRejectView.as_view(),
    ),
    path(
        "client_gst_bulk_upload/",
        unique_gst_client_views.ClientBulkGstUploadView.as_view(),
    ),
    path(
        "client_gst_bulk_update/",
        unique_gst_client_views.ClientBulkGstUpdateView.as_view(),
    ),
    path(
        "client_gst_bulk_none_update/",
        unique_gst_client_views.ClientBulkGstNoneUpdateView.as_view(),
    ),
    path(
        "transfer_client_dependency/",
        unique_gst_client_views.ClientDependencyTransferViews.as_view(),
    ),
    path(
        "delete_procurement_stock/",
        procurement_views.DeleteProcurementStockViews.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
