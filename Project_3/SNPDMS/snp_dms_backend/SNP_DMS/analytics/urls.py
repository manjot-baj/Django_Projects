from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from analytics.Views import all_location_dashboard_views as first_screen_views
from analytics.Views import handling_dashbord_views as second_screen_views
from analytics.Views import self_transportation_dashboard_views as third_screen_views
from analytics.Views import stock_dashboard_view as fourth_screen_views
from analytics.Views import mnr_dashboard_views as fifth_screen_views
from analytics.Views import mnr_material_dashboard_views as sixth_screen_views
from analytics.Views import analytics_reports
from analytics.Views import movement_views
from analytics.Views import repo_movement_views

urlpatterns = [
    # first_screen
    path("first_screen_dashboard/", first_screen_views.DAFSDashboard.as_view()),
    path(
        "first_screen_weekly_lolo_st_volume_revenue/",
        first_screen_views.DAFSWeeklyLoloSTVR.as_view(),
    ),
    path(
        "first_screen_quaterly_lolo_st_volume_revenue/",
        first_screen_views.DAFSQuaterlyLoloSTVR.as_view(),
    ),
    path(
        "first_screen_weekly_mnr_volume_revenue/",
        first_screen_views.DAFSWeeklyMNRVR.as_view(),
    ),
    path(
        "first_screen_quaterly_mnr_volume_revenue/",
        first_screen_views.DAFSQuaterlyMNRVR.as_view(),
    ),
    # second_screen
    path("second_screen_dashboard/", second_screen_views.DASSDashboard.as_view()),
    path(
        "second_screen_weekly_lolo_volume_revenue/",
        second_screen_views.DASSWeeklyLoloVR.as_view(),
    ),
    path(
        "second_screen_quaterly_lolo_volume_revenue/",
        second_screen_views.DASSQuaterlyLoloVR.as_view(),
    ),
    path(
        "second_screen_top_client_lolo_volume_revenue/",
        second_screen_views.DASSTopClientLoloVR.as_view(),
    ),
    # third screen
    path("third_screen_dashboard/", third_screen_views.DATSDashboard.as_view()),
    path(
        "third_screen_weekly_st_volume_revenue/",
        third_screen_views.DATSWeeklyStVR.as_view(),
    ),
    path(
        "third_screen_quaterly_st_volume_revenue/",
        third_screen_views.DATSQuaterlyStVR.as_view(),
    ),
    path(
        "third_screen_top_client_st_volume_revenue/",
        third_screen_views.DASSTopClientStVR.as_view(),
    ),
    # fourth screen
    path("fourth_screen_dashboard/", fourth_screen_views.DAFTSDashboard.as_view()),
    # fifth screen
    path("fifth_screen_dashboard/", fifth_screen_views.DAFthDashboard.as_view()),
    path(
        "fifth_screen_weekly_mnr_volume_revenue/",
        fifth_screen_views.DAFthWeeklyMNR.as_view(),
    ),
    path(
        "fifth_screen_quaterly_mnr_volume_revenue/",
        fifth_screen_views.DAFthQuaterlyMNR.as_view(),
    ),
    path(
        "fifth_screen_top_client_mnr_volume_revenue/",
        fifth_screen_views.DAFthTopClientMNR.as_view(),
    ),
    path(
        "mnr_material_dashboard/",
        sixth_screen_views.MaterialAnalyticsMNR.as_view(),
    ),
    path(
        "total_mnr_data/",
        sixth_screen_views.TotalMNRData.as_view(),
    ),
    path(
        "analytics_reports/",
        analytics_reports.AnalyticsReport.as_view(),
    ),
    path(
        "movement_top_consignee_shipper/",
        movement_views.TopConsigneeShipper.as_view(),
    ),
    path(
        "movement_top_transporter/",
        movement_views.TopTransporter.as_view(),
    ),
    path(
        "movement_top_cargo/",
        movement_views.TopCargo.as_view(),
    ),
    path(
        "repo_movement_dashboard/",
        repo_movement_views.RepoMovement.as_view(),
    ),
    path(
        "top_client_partially_approved/",
        fifth_screen_views.TopClientPartiallyApproved.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
