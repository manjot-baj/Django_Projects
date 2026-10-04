# other imports
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


# views imports
from transportation import views
from transportation.Views import (
    account_views,
    customer_views,
    creditor_views,
    driver_views,
    truck_views,
    service_tax_views,
    form_views,
    voucher_views,
    purchase_lr_views,
    daily_booking_views,
    journal_voucher_views,
    contra_entry_views,
    invoice_bill_views,
    payment_receipt_views,
    report_views,
)

urlpatterns = [
    # Account Master
    path("add_account/", account_views.AddAccountMaster.as_view()),
    path("get_all_account/<int:pk>/", account_views.EditAccountMaster.as_view()),
    path("get_all_account/", account_views.GetAllAccountMaster.as_view()),
    path("get_all_account/delete/", account_views.DeleteAccountMaster.as_view()),
    # Customer Master
    path("add_customer/", customer_views.AddCustomerMaster.as_view()),
    path("get_all_customer/", customer_views.GetAllCustomerMaster.as_view()),
    path("get_all_customer/<int:pk>/", customer_views.EditCustomerMaster.as_view()),
    path("get_all_customer/delete/", customer_views.DeleteCustomerMaster.as_view()),
    # Creditor Master
    path("add_creditor/", creditor_views.AddCreditorMaster.as_view()),
    path("get_all_creditor/", creditor_views.GetAllCreditorMaster.as_view()),
    path("get_all_creditor/<int:pk>/", creditor_views.EditCreditorMaster.as_view()),
    path("get_all_creditor/delete/", creditor_views.DeleteCreditorMaster.as_view()),
    # Driver Master
    path("add_driver/", driver_views.AddDriverMaster.as_view()),
    path("get_all_driver/", driver_views.GetAllDriverMaster.as_view()),
    path("get_all_driver/<int:pk>/", driver_views.EditDriverMaster.as_view()),
    path("get_all_driver/delete/", driver_views.DeleteDriverMaster.as_view()),
    # Truck Master
    path("add_truck/", truck_views.AddTruckMaster.as_view()),
    path("get_all_truck/", truck_views.GetAllTruckMaster.as_view()),
    path("get_all_truck/<int:pk>/", truck_views.EditTruckMaster.as_view()),
    path("get_all_truck/delete/", truck_views.DeleteTruckMaster.as_view()),
    # Service Tax Master
    path("add_service_tax/", service_tax_views.AddServiceTax.as_view()),
    path("get_all_service_tax/", service_tax_views.GetAllServiceTax.as_view()),
    path("get_all_service_tax/<int:pk>/", service_tax_views.EditServiceTax.as_view()),
    path("get_all_service_tax/delete/", service_tax_views.DeleteServiceTax.as_view()),
    # Form Dependencies
    path("form_dependency/", form_views.FormDependency.as_view()),
    # Entry No Data
    path("entry_no_data/", form_views.EntryNoData.as_view()),
    # Daily Booking
    path("booking/", daily_booking_views.AddDailyBooking.as_view()),
    path("booking_draft/", daily_booking_views.BookingDraft.as_view()),
    path("update_booking/<int:pk>/", daily_booking_views.UpdateDailyBooking.as_view()),
    path("get_all_booking/", daily_booking_views.GetAllDailyBooking.as_view()),
    path(
        "get_all_booking/delete/<int:pk>/",
        daily_booking_views.DeleteDailyBooking.as_view(),
    ),
    path(
        "get_all_booking_draft/delete/",
        daily_booking_views.DeleteBookingDraft.as_view(),
    ),
    path(
        "get_all_booking/cancel_transaction/<int:pk>/",
        daily_booking_views.CancelTransactionEffect.as_view(),
    ),
    # Download LR
    path("print_lr/<int:pk>/", daily_booking_views.DownloadLR.as_view()),
    # Contra Entry
    path("add_contra_entry/", contra_entry_views.AddContraEntry.as_view()),
    path("get_all_contra_entry/", contra_entry_views.GetAllContraEntry.as_view()),
    path("get_all_contra_entry/<int:pk>/", contra_entry_views.GetContraEntry.as_view()),
    path(
        "get_all_contra_entry/delete/<int:pk>/",
        contra_entry_views.DeleteContraEntry.as_view(),
    ),
    # Journal Voucher Views
    path("add_journal_voucher/", journal_voucher_views.AddJournalVoucher.as_view()),
    path(
        "get_all_journal_voucher/", journal_voucher_views.GetAllJournalVoucher.as_view()
    ),
    path(
        "get_all_journal_voucher/<int:pk>/",
        journal_voucher_views.GetJournalVoucher.as_view(),
    ),
    path(
        "get_all_journal_voucher/delete/<int:pk>/",
        journal_voucher_views.DeleteJournalVoucher.as_view(),
    ),
    # Payment and Receipt
    path(
        "get_payment_receipt_data/",
        payment_receipt_views.GetPaymentRecieptData.as_view(),
    ),
    path("add_payment_receipt/", payment_receipt_views.AddPaymentReceipt.as_view()),
    path(
        "get_all_payment_receipt/",
        payment_receipt_views.GetAllPaymentReceiptMaster.as_view(),
    ),
    path(
        "get_all_payment_receipt/<int:pk>/",
        payment_receipt_views.GetPaymentReceiptMaster.as_view(),
    ),
    path(
        "get_all_payment_receipt/delete/<int:pk>/",
        payment_receipt_views.DeletePaymentReceiptMaster.as_view(),
    ),
    path(
        "print_payment_receipt/<int:pk>/",
        payment_receipt_views.DownloadPaymentReceipt.as_view(),
    ),
    # Purchase LR
    path("add_purchase_master/", purchase_lr_views.AddPurchaseMaster.as_view()),
    path("get_all_purchase_master/", purchase_lr_views.GetAllPurchaseMaster.as_view()),
    path(
        "get_all_purchase_master/<int:pk>/",
        purchase_lr_views.EditPurchaseMaster.as_view(),
    ),
    path(
        "get_all_purchase_master/delete/<int:pk>/",
        purchase_lr_views.DeletePurchaseMaster.as_view(),
    ),
    path("get_purchase_lr_data/", purchase_lr_views.GetPurchaseLRData.as_view()),
    path(
        "get_all_purchase_master/cancel_transaction/<int:pk>/",
        purchase_lr_views.CancelTransactionEffect.as_view(),
    ),
    # Invoice Bill
    path("print_invoice/<int:pk>/", invoice_bill_views.DownloadInvoice.as_view()),
    path("get_invoice_data/", invoice_bill_views.GetInvoiceData.as_view()),
    path("add_invoice_bill/", invoice_bill_views.AddInvoiceBill.as_view()),
    path("get_all_invoice_bill/", invoice_bill_views.GetAllInvoiceBill.as_view()),
    path(
        "get_all_invoice_bill/<int:pk>/", invoice_bill_views.EditInvoiceBill.as_view()
    ),
    path(
        "get_all_invoice_bill/delete/<int:pk>/",
        invoice_bill_views.DeleteInvoiceBill.as_view(),
    ),
    path(
        "get_all_invoice_bill/cancel_transaction/<int:pk>/",
        invoice_bill_views.CancelTransactionEffect.as_view(),
    ),
    path("reports/", report_views.Report.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
