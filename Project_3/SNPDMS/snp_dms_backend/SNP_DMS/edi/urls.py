from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views
from edi.Views import (
    edi_analytics_views,
    edi_reports_views,
    wistim_distim_edi_analytics,
    wistim_distim_edi_reports_views,
    zim_repair_edi_views,
    msc_excel_edi_views,
)

urlpatterns = [
    path("download_edi/", views.DownloadEmailEdi.as_view()),
    path("edi_analytics/", edi_analytics_views.EDIAnalytics.as_view()),
    path("edi_backdated_data/", edi_analytics_views.EDIBackDatedStatus.as_view()),
    path("edi_missing_data/", edi_analytics_views.EDIMIssingStatus.as_view()),
    path("edi_move_code_wise_data/", edi_analytics_views.EDIMoveCodeData.as_view()),
    path("edi_reports/", edi_reports_views.EDIReports.as_view()),
    path("edi_backdated_reports/", edi_reports_views.EDIBackdatedReports.as_view()),
    path("edi_missing_reports/", edi_reports_views.EDIMissingReports.as_view()),
    path("edi_move_code_reports/", edi_reports_views.EDIMoveCodeReport.as_view()),
    path(
        "estimate_westim_analytics/",
        wistim_distim_edi_analytics.EstimateEdiAnalytics.as_view(),
    ),
    path(
        "repair_distim_analytics/",
        wistim_distim_edi_analytics.RepairDistimAnalytics.as_view(),
    ),
    path(
        "estimate_westim_reports/",
        wistim_distim_edi_reports_views.EstimateEdiReports.as_view(),
    ),
    path(
        "repair_distim_reports/",
        wistim_distim_edi_reports_views.RepairEdiReports.as_view(),
    ),
    path(
        "zim_repair_edi/",
        zim_repair_edi_views.ZimRepairEdiApiViews.as_view(),
    ),
    path(
        "list_msc_ftp_credential/",
        msc_excel_edi_views.ListMscExcelEdiFTPCredentials.as_view(),
    ),
    path(
        "add_update_site_msc_ftp_credential/",
        msc_excel_edi_views.AddUpdateMscExcelEdiFTPCredential.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
