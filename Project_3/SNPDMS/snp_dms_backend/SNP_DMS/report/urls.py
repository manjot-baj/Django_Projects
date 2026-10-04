from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import new_views
from . import lolo_invoice_report_views

urlpatterns = [
    path("download_report/", new_views.Report.as_view()),
    path(
        "download_lolo_invoice_report/",
        lolo_invoice_report_views.LoloInvoiceReportView.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
