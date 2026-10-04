from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from loaded_yard.Views import (
    bulk_upload_loaded_yard_views,
    loaded_yard_stock_views,
    # loaded_yard_edi_reports,
)
from loaded_yard.NewViews import (
    loaded_yard_views,
    bulk_upload_views,
    loaded_yard_edi_reports,
)

urlpatterns = [
    path(
        "extract_loaded_yard_data/",
        bulk_upload_views.ExtractLoadedYardData.as_view(),
    ),
    path(
        "get_loaded_yard_sample_file/<str:site>/",
        bulk_upload_views.DownloadSampleFile.as_view(),
    ),
    path(
        "import_loaded_yard_data/",
        bulk_upload_views.LoadedYardImport.as_view(),
    ),
    path(
        "rejected_file_loaded_yard/",
        bulk_upload_views.RejectedLoadedYardFile.as_view(),
    ),
    path("get_all_loaded_yard/", loaded_yard_views.ListLoadedYard.as_view()),
    path("get_loaded_yard/", loaded_yard_views.GetLoadedYardDataForInOut.as_view()),
    path(
        "update_loaded_yard/",
        loaded_yard_views.UpdateLoadedYard.as_view(),
    ),
    path("get_loaded_yard_edi/", loaded_yard_views.GetLoadedYardEDI.as_view()),
    path(
        "loaded_yard_in_container_details/",
        loaded_yard_views.LoadedYardINContainerDetails.as_view(),
    ),
    path(
        "loaded_yard_out_container_details/",
        loaded_yard_views.LoadedYardOUTContainerDetails.as_view(),
    ),
    path(
        "loaded_yard_edi_report/",
        loaded_yard_edi_reports.LoadedYardEDIReport.as_view(),
    ),
    path(
        "loaded_yard_excel_edi/",
        loaded_yard_edi_reports.LoadedYardExcelEDI.as_view(),
    ),
    path(
        "get_client_specific_data/<int:pk>/",
        loaded_yard_views.GetClientSpecificData.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
