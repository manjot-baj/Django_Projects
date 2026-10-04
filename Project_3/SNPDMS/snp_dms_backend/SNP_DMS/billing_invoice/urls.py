from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from billing_invoice.NewViews import (
    customer_billing,
    billing_invoice,
    mnr_invoice,
    credit_note,
)

urlpatterns = [
    path("customer_billing_view/", customer_billing.CustomerBillingView.as_view()),
    path(
        "customer_billing_view_download/",
        customer_billing.CustomerBillingViewDownload.as_view(),
    ),
    path("collect_billing/", billing_invoice.CollectCustomerInvoiceData.as_view()),
    path(
        "build_invoice/",
        billing_invoice.BuildBillingInvoice.as_view(),
    ),
    path(
        "update_invoice/<str:pk>/",
        billing_invoice.UpdateInvoice.as_view(),
    ),
    # path(
    #     "cancel_effect/<str:pk>/",
    #     customer_billing_invoice_views.CancelEffectandDeleteInvoice.as_view(),
    # ),
    path(
        "delete_invoice/<str:pk>/",
        billing_invoice.DeleteInvoice.as_view(),
    ),
    path(
        "customer_invoice_view/",
        billing_invoice.ListInvoices.as_view(),
    ),
    path(
        "customer_invoice_view_download/",
        billing_invoice.ListInvoicesDownload.as_view(),
    ),
    path(
        "print_invoice/<str:pk>/",
        billing_invoice.DownloadInvoice.as_view(),
    ),
    path(
        "download_billing_statement/<str:pk>/",
        billing_invoice.GetBillingStatement.as_view(),
    ),
    path(
        "download_billing_statement_excel/<str:pk>/",
        billing_invoice.DownloadExcelBillingStatement.as_view(),
    ),
    path(
        "build_mnr_invoice/",
        mnr_invoice.BuildMNRInvoice.as_view(),
    ),
    path(
        "update_mnr_invoice/<str:pk>/",
        mnr_invoice.UpdateMNRInvoice.as_view(),
    ),
    path(
        "update_mnr_invoice/<str:pk>/",
        mnr_invoice.UpdateMNRInvoice.as_view(),
    ),
    path(
        "mnr_invoice_view/",
        mnr_invoice.ListMNRInvoices.as_view(),
    ),
    path(
        "delete_mnr_invoice/<str:pk>/",
        mnr_invoice.DeleteMNRInvoice.as_view(),
    ),
    path(
        "pre_invoice_statement/",
        customer_billing.PreInvoiceStatement.as_view(),
    ),
    # Credit Note APIs
    path(
        "get_invoice_data_by_invoice_number/",
        credit_note.GetInvoicesByInvoiceNumber.as_view(),
    ),
    path(
        "collect_credit_note_mnr_prefill_data/",
        credit_note.CollectCreditNoteDataMNR.as_view(),
    ),
    path(
        "collect_credit_note_prefill_data/",
        credit_note.CollectCreditNoteData.as_view(),
    ),
    path(
        "create_credit_note/",
        credit_note.BuildCreditNote.as_view(),
    ),
    path(
        "get_credit_note/<str:pk>/",
        credit_note.GetCreditNote.as_view(),
    ),
    path(
        "download_credit_note_invoice/<str:pk>/",
        credit_note.DownloadCreditNoteInvoice.as_view(),
    ),
    path(
        "list_credit_notes/",
        credit_note.ListCreditNotes.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
