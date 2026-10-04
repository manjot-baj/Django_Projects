from django.urls import path
from adhoc_reports import views

urlpatterns = [
    path("report-requests/", views.AdhocReportRequestListView.as_view()),
    path("report-requests/<int:pk>/download/", views.AdhocReportRequestView.as_view()),
    path("report-requests/add/", views.AdhocReportRequestView.as_view()),
    path("report-requests/delete/", views.AdhocReportRequestBulkDeleteView.as_view()),
]
