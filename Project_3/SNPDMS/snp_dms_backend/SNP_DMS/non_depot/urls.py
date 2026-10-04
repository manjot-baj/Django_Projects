from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


# from .Views import search_views as searchViews
# from .Views import form_views as formViews
# from .Views import in_out_process_views as opsViews
# from .Views import in_out_update_views as opsUpdateViews
# from .Views import stock_views as stockViews
from non_depot.NewViews import bulk_upload_views, in_out, non_depot_views

urlpatterns = [
    path("container_search/", non_depot_views.NonDepotContainerDetails.as_view()),
    path(
        "container_no_validation/",
        non_depot_views.NonDepotContainerNoValidator.as_view(),
    ),
    path("in_out_process/", in_out.NonDepotInOutEntry.as_view()),
    path("update_in_out/", in_out.UpdateNonDepotContainer.as_view()),
    path(
        "get_stock_upload_sample_file/", bulk_upload_views.DownloadSampleFile.as_view()
    ),
    path(
        "extract_stock_upload_file_data/",
        bulk_upload_views.ExtractNonDepotData.as_view(),
    ),
    path("extract_stock_data_import/", bulk_upload_views.StockImport.as_view()),
    path(
        "rejected_stock_data_file_download/",
        bulk_upload_views.DownloadRejectedStockDataFile.as_view(),
    ),
    path("stock_sheet_download/", bulk_upload_views.StockSheetDownload.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
