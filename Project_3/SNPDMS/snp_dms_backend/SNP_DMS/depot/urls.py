from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# from .Views import search_views as searchViews
from .NewViews import search_views as searchViews

# from .Views import form_views as formViews
from .NewViews import form_views as formViews

# from .Views import in_out_process_views as opsViews
from .NewViews import in_out_process_views as opsViews

# from .Views import in_out_update_views as opsUpdateViews
from .NewViews import in_out_update_views as opsUpdateViews

# from .Views import gate_pass_views as gatePassViews
from .NewViews import gate_pass_views as gatePassViews

# from .Views import lolo_receipt_views as loloReceiptViews
from .NewViews import lolo_receipt_views as loloReceiptViews

# from .Views import st_receipt_views as stReceiptViews
from .NewViews import st_receipt_views as stReceiptViews

# from .Views import do_challan_views as challanViews
from .NewViews import do_challan_views as challanViews

# from .Views import stock_views as stockViews
from .NewViews import stock_views as stockViews

# from .Views import container_make_available_helper_view
from .Views import lolo_finance_views
from .Views import driver_details
from .Views import usa_approved_containers
from .Views import enblock_movement_views
from .Views import en_block_movement_2_views
from .Views import manufacturing_date_log_views
from .Views import handling_payment_views as handlingPaymentViews
from .Views import self_transportation_payment_views as selfTransportationPaymentViews
from .Views import lolo_finance_client_account_views as cust_fin_account

# from .Views import bulk_out_process_views as bulkOutViews


urlpatterns = [
    path("container_search/", searchViews.ContainerDetails.as_view()),
    path("container_no_validation/", formViews.ContainerNoValidator.as_view()),
    path("out_container_search/", searchViews.OutContainerDetails.as_view()),
    path("inform_dropdown/", formViews.InformDependency.as_view()),
    path("inform_client_dropdown/", formViews.InformClientDependency.as_view()),
    path("lolo_payment_search/", searchViews.LoloPaymentDetail.as_view()),
    path(
        "self_transportation_payment_search/",
        searchViews.SelfTransportationPaymentDetail.as_view(),
    ),
    path("gate_in/", opsViews.GateInProcess.as_view()),
    path("gate_out/", opsViews.GateOutProcess.as_view()),
    path("update_gate_in/", opsUpdateViews.UpdateGateInProcess.as_view()),
    path("update_gate_out/", opsUpdateViews.UpdateGateOutProcess.as_view()),
    path("gate_in_pass/<int:pk>/", gatePassViews.GateInpass.as_view()),
    path("gate_out_pass/<int:pk>/", gatePassViews.GateOutpass.as_view()),
    path("lolo_receipt/<int:pk>/", loloReceiptViews.HandlingReceipt.as_view()),
    path("out_lolo_receipt/<int:pk>/", loloReceiptViews.OutHandlingReceipt.as_view()),
    path("st_receipt/<int:pk>/", stReceiptViews.SelfTransportationReceipt.as_view()),
    path(
        "out_st_receipt/<int:pk>/",
        stReceiptViews.OutSelfTransportationReceipt.as_view(),
    ),
    path(
        "lolo_receipt_download/<int:pk>/",
        loloReceiptViews.HandlingReceiptDownload.as_view(),
    ),
    path(
        "out_lolo_receipt_download/<int:pk>/",
        loloReceiptViews.OutHandlingReceiptDownload.as_view(),
    ),
    path(
        "st_receipt_download/<int:pk>/",
        stReceiptViews.SelfTransportationReceiptDownload.as_view(),
    ),
    path(
        "out_st_receipt_download/<int:pk>/",
        stReceiptViews.OutSelfTransportationReceiptDownload.as_view(),
    ),
    path("stock/", stockViews.StockOfContainer.as_view()),
    path("stock_sheet_download/", stockViews.StockSheetDownloadView.as_view()),
    path("stock/<int:pk>/", stockViews.StockOfContainer.as_view()),
    path("add_remove_from_queue/", stockViews.AddOrRemoveContainerInQueue.as_view()),
    path("get_allotment_container_list/", stockViews.CollectContainerStock.as_view()),
    path("allotment/", stockViews.AllotmentOfContainer.as_view()),
    path("remove_allotment/", stockViews.RemoveAllotment.as_view()),
    path("update_allotment/<int:pk>/", stockViews.UpdateAllotmentOfContainer.as_view()),
    path("search_booking_no/", stockViews.BookingNumberDetails.as_view()),
    path("in_do_upload/<int:pk>/", challanViews.InProcessDoFile.as_view()),
    path("in_do_download/<int:pk>/", challanViews.InProcessDoFile.as_view()),
    path("out_do_upload/<int:pk>/", challanViews.OutProcessDoFile.as_view()),
    path("out_do_download/<int:pk>/", challanViews.OutProcessDoFile.as_view()),
    path("get_stock_upload_sample_file/", stockViews.StockUploadSampleFile.as_view()),
    path("extract_stock_upload_file_data/", stockViews.StockUploadSampleFile.as_view()),
    path("extract_stock_data_import/", stockViews.StockImport.as_view()),
    path(
        "rejected_stock_data_file_download/", stockViews.RejectedStockDataFile.as_view()
    ),
    # path(
    #     "container_automate/",
    #     container_make_available_helper_view.ContainerFix.as_view(),
    # ),
    # path("upload_out_sheet/", bulkOutViews.UploadOutExcelSheetFile.as_view()),
    # lolo finance
    # pregatein
    path("pregatein_list/", lolo_finance_views.PregateInListAPIView.as_view()),
    path(
        "pregatein_bulk_upload/",
        lolo_finance_views.PreGateInBulkUploadAPIView.as_view(),
    ),
    path(
        "pregatein_do_upload/",
        lolo_finance_views.PreGateInDOUploadAPIView.as_view(),
    ),
    path(
        "pregatein_bulk_import/",
        lolo_finance_views.PreGateInBulkImportAPIView.as_view(),
    ),
    path(
        "rejected_pregatein_download/",
        lolo_finance_views.RejectedPreGateInDataApiView.as_view(),
    ),
    path("pregatein/", lolo_finance_views.PreGateInAPIView.as_view()),
    path("pregatein/<int:pk>/", lolo_finance_views.PreGateInAPIView.as_view()),
    path("pregatein_delete/", lolo_finance_views.DeletePregateInApiView.as_view()),
    path(
        "gatein_bulk_upload_excel_download_from_pregatein/",
        lolo_finance_views.BulkUploadExcelPregateInToInApiView.as_view(),
    ),
    path(
        "upgrade_pregatein_validity/",
        lolo_finance_views.UpgradePregateInValidityApiView.as_view(),
    ),
    path(
        "pregatein_container_info/",
        lolo_finance_views.PreGateInContainerInfoAPIView.as_view(),
    ),
    # lolo advance payment
    path(
        "lolo_advanced_payment_report/",
        lolo_finance_views.AdvancedHandlingPaymentReportAPIView.as_view(),
    ),
    path(
        "lolo_advanced_payment_list/",
        lolo_finance_views.AdvancedHandlingPaymentListAPIView.as_view(),
    ),
    path(
        "lolo_advanced_payment/",
        lolo_finance_views.AdvancedHandlingPaymentAPIView.as_view(),
    ),
    path(
        "lolo_advanced_payment/<int:pk>/",
        lolo_finance_views.AdvancedHandlingPaymentAPIView.as_view(),
    ),
    path(
        "lolo_advanced_payment/<int:pk>/update_remarks/",
        lolo_finance_views.UpdateRemarksAdvLoloPymtAPIView.as_view(),
    ),
    path(
        "lolo_advanced_payment/<int:pk>/adjust_balance/",
        lolo_finance_views.AdjustBalanceAdvancedHandlingPaymentAPIView.as_view(),
    ),
    path(
        "lolo_advanced_payment_delete/",
        lolo_finance_views.DeleteAdvanceHandlingPaymentAPIView.as_view(),
    ),
    path(
        "advanced_payment_bulk_upload/",
        lolo_finance_views.AdvancedPaymentBulkUploadAPIView.as_view(),
    ),
    path(
        "advanced_payment_bulk_import/",
        lolo_finance_views.AdvancedPaymentBulkImportAPIView.as_view(),
    ),
    path(
        "rejected_advanced_payment_download/",
        lolo_finance_views.RejectedAdvancedPaymentDataApiView.as_view(),
    ),
    # pregateout
    path(
        "pregateout_form_download/<int:pk>/",
        lolo_finance_views.DownloadPreGateOutFormSix.as_view(),
    ),
    path("pregateout_list/", lolo_finance_views.PregateOutListAPIView.as_view()),
    path("pregateout/", lolo_finance_views.PreGateOutAPIView.as_view()),
    path("pregateout/<int:pk>/", lolo_finance_views.PreGateOutAPIView.as_view()),
    path("pregateout_delete/", lolo_finance_views.DeletePregateOutApiView.as_view()),
    path(
        "upgrade_pregateout_validity/",
        lolo_finance_views.UpgradePregateOutValidityApiView.as_view(),
    ),
    path(
        "pregateout_container_info/",
        lolo_finance_views.PreGateOutContainerInfoAPIView.as_view(),
    ),
    path(
        "pregateout_prefill_info/",
        lolo_finance_views.PreGateOutPrefillInfoAPIView.as_view(),
    ),
    path(
        "pregateout_available_container_list/",
        lolo_finance_views.PreGateOutAvailableContainersAPIView.as_view(),
    ),
    # Client Fin Account
    path(
        "customer_fin_account_ledger/",
        cust_fin_account.CustomerFinAccountLedgerAPIView.as_view(),
    ),
    path(
        "customer_fin_account_list/",
        cust_fin_account.CustomerFinAccountListAPIView.as_view(),
    ),
    path(
        "get_client_fin_account_balance/",
        cust_fin_account.GetCustomerFinAccountBalanceAPIView.as_view(),
    ),
    path(
        "update_client_fin_account/",
        cust_fin_account.GetCustomerFinAccountBalanceAPIView.as_view(),
    ),
    path(
        "customer_fin_account/",
        cust_fin_account.CustomerFinAccountAPIView.as_view(),
    ),
    path(
        "customer_fin_account/<int:pk>/",
        cust_fin_account.CustomerFinAccountAPIView.as_view(),
    ),
    path(
        "customer_fin_account/<int:pk>/delete/",
        cust_fin_account.DeleteCustomerFinAccountAPIView.as_view(),
    ),
    path(
        "customer_fin_account/<int:pk>/transaction_delete/",
        cust_fin_account.DeleteCustomerFinAccountTransactionAPIView.as_view(),
    ),
    path(
        "customer_fin_account_bulk_upload/",
        cust_fin_account.CustFinTransBulkUploadAPIView.as_view(),
    ),
    path(
        "customer_fin_account_bulk_import/",
        cust_fin_account.CustFinTransBulkImportAPIView.as_view(),
    ),
    path(
        "rejected_customer_fin_account_download/",
        cust_fin_account.RejectedCustFinTransDataApiView.as_view(),
    ),
    # Driver Details
    path(
        "download_driver_details/<str:pk>/",
        driver_details.DownloadDriverPhoto.as_view(),
    ),
    path(
        "usa_approved_containers/",
        usa_approved_containers.USAApprovedContainerSheet.as_view(),
    ),
    # EN Block
    path(
        "en_block/extract/",
        enblock_movement_views.ExtractAdvanceListData.as_view(),
    ),
    path(
        "en_block/import/",
        enblock_movement_views.ImportAdvanceListData.as_view(),
    ),
    path(
        "en_block/rejected_file/",
        enblock_movement_views.RejectedAdvanceListData.as_view(),
    ),
    path(
        "en_block/all/",
        enblock_movement_views.ListEnBlockMovement.as_view(),
    ),
    path(
        "en_block/sample_file/",
        enblock_movement_views.EnBlockSampleFile.as_view(),
    ),
    path(
        "en_block/report/",
        enblock_movement_views.EnBlockMovementReport.as_view(),
    ),
    path(
        "en_block/list/vessel_voyage/",
        enblock_movement_views.EnBlockVesselVoyageList.as_view(),
    ),
    path(
        "en_block/<str:pk>/",
        enblock_movement_views.GetEnBlockMovement.as_view(),
    ),
    path(
        "en_block_pregatein/extract/",
        en_block_movement_2_views.ExtractEnblockPreGateInData.as_view(),
    ),
    path(
        "en_block_pregatein/import/",
        en_block_movement_2_views.ImportEnblockPreGateInData.as_view(),
    ),
    path(
        "en_block_pregatein/download/",
        en_block_movement_2_views.EnBlockPreGateInSampleFile.as_view(),
    ),
    path(
        "en_block_pregatein/rejected/",
        en_block_movement_2_views.DownloadRejectedDataFile.as_view(),
    ),
    path(
        "en_block_pregatein/all/",
        en_block_movement_2_views.ListEnBlockPreGateInData.as_view(),
    ),
    path(
        "en_block_pregatein/pregatein_info/",
        en_block_movement_2_views.GetEnblockPreGateInInfo.as_view(),
    ),
    path(
        "en_block_pregatein/report/",
        en_block_movement_2_views.EnBlockPreGateInReport.as_view(),
    ),
    path(
        "en_block_pregatein/discard/",
        en_block_movement_2_views.DiscardContainers.as_view(),
    ),
    path(
        "en_block_pregatein/<str:pk>/",
        en_block_movement_2_views.GetEnblockPreGateIn.as_view(),
    ),
    # Manufacturing Date Log
    path(
        "manufacturing_date_log/",
        manufacturing_date_log_views.ManufacturingDateLogView.as_view(),
    ),
    # handling payment
    path(
        "handling_payment/add/",
        handlingPaymentViews.AddHandlingPayment.as_view(),
    ),
    path(
        "handling_payment/list/",
        handlingPaymentViews.ListHandlingPayment.as_view(),
    ),
    path(
        "handling_payment/<int:pk>/",
        handlingPaymentViews.GetHandlingPayment.as_view(),
    ),
    path(
        "handling_payment/<int:pk>/delete/",
        handlingPaymentViews.DeleteHandlingPayment.as_view(),
    ),
    path(
        "handling_payment/<int:pk>/update/",
        handlingPaymentViews.UpdateHandlingPayment.as_view(),
    ),
    path(
        "handling_payment/<int:pk>/remove_payment/",
        handlingPaymentViews.RemoveHandlingPayment.as_view(),
    ),
    # self transportation payment
    path(
        "self_transportation_payment/add/",
        selfTransportationPaymentViews.AddSelfTransportationPayment.as_view(),
    ),
    path(
        "self_transportation_payment/list/",
        selfTransportationPaymentViews.ListSelfTransportationPayment.as_view(),
    ),
    path(
        "self_transportation_payment/<int:pk>/",
        selfTransportationPaymentViews.GetSelfTransportationPayment.as_view(),
    ),
    path(
        "self_transportation_payment/<int:pk>/delete/",
        selfTransportationPaymentViews.DeleteSelfTransportationPayment.as_view(),
    ),
    path(
        "self_transportation_payment/<int:pk>/update/",
        selfTransportationPaymentViews.UpdateSelfTransportationPayment.as_view(),
    ),
    path(
        "self_transportation_payment/<int:pk>/remove_payment/",
        selfTransportationPaymentViews.RemoveSelfTransportationPayment.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
