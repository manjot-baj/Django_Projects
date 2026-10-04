from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


from procurement.NewViews import (
    tool_room_views,
    inform_dependency_views,
    requisition_views,
    consumption_views,
    procurements_reports,
    tool_rate_history_views,
    tool_request_transfer_views,
    master_stock_views,
)

urlpatterns = [
    # Tool Room Views
    path("tool/add/", tool_room_views.CreateTool.as_view()),
    path("tool/all_tools/", tool_room_views.ListTools.as_view()),
    path("tool/delete/", tool_room_views.DeleteTool.as_view()),
    path(
        "tool/tool_dropdown/",
        inform_dependency_views.ToolsDropdown.as_view(),
    ),
    # # Tools Bulk Upload
    path(
        "tool/extract/",
        tool_room_views.UploadToolsExcel.as_view(),
    ),
    path(
        "tool/sample_file/",
        tool_room_views.DownloadToolUploadSampleFile.as_view(),
    ),
    path(
        "tool/import/",
        tool_room_views.ImportTools.as_view(),
    ),
    path(
        "tool/rejected_file/",
        tool_room_views.DownloadRejectedDataFile.as_view(),
    ),
    # # Tool rate history
    path(
        "tool/tool_rate_history/",
        tool_rate_history_views.ToolRateHistoryView.as_view(),
    ),
    path("tool/<str:pk>/", tool_room_views.GetTool.as_view()),
    path("tool/<str:pk>/update/", tool_room_views.UpdateTool.as_view()),
    # Requisition Views
    path("requisition/add/", requisition_views.CreateRequisition.as_view()),
    path("requisition/all_requisition/", requisition_views.ListRequisition.as_view()),
    path(
        "requisition/bills/",
        requisition_views.RequisitionBillData.as_view(),
    ),
    path(
        "requisition/bill/upload/",
        requisition_views.BillUpload.as_view(),
    ),
    path(
        "requisition/history/update/",
        requisition_views.UpdateRequisitionHistory.as_view(),
    ),
    path("requisition/<str:pk>/", requisition_views.GetRequisition.as_view()),
    path("requisition/<str:pk>/update/", requisition_views.UpdateRequisition.as_view()),
    path("requisition/<str:pk>/delete/", requisition_views.DeleteRequisition.as_view()),
    path(
        "requisition/<str:pk>/approval/pdf/",
        requisition_views.ApprovalPDF.as_view(),
    ),
    path(
        "bill/<str:pk>/download/",
        requisition_views.BillDownload.as_view(),
    ),
    # # Consumption Views
    path("consumption/add/", consumption_views.CreateConsumption.as_view()),
    path("consumption/all_consumptions/", consumption_views.ListConsumptions.as_view()),
    path(
        "consumption/<str:pk>/",
        consumption_views.GetConsumption.as_view(),
    ),
    path(
        "consumption/<str:pk>/update/",
        consumption_views.UpdateConsumption.as_view(),
    ),
    path("consumption/<str:pk>/delete/", consumption_views.DeleteConsumption.as_view()),
    # # Tools Dropdown
    path(
        "dropdown/",
        inform_dependency_views.ProcurementDropdownAndOrderNo.as_view(),
    ),
    path(
        "reports/",
        procurements_reports.ProcurementReport.as_view(),
    ),
    # # Tool Transfer
    path(
        "tool_transfer/add/",
        tool_request_transfer_views.CreateToolRequest.as_view(),
    ),
    path(
        "tool_transfer/table/",
        tool_request_transfer_views.ToolRequestTable.as_view(),
    ),
    path(
        "tool_transfer/<str:pk>/form_data/",
        tool_request_transfer_views.GetToolTransfer.as_view(),
    ),
    path(
        "tool_transfer/<str:pk>/approve_request/",
        tool_request_transfer_views.ApproveToolRequest.as_view(),
    ),
    # # Master Stock
    path(
        "master_stock/",
        master_stock_views.MasterStockTableView.as_view(),
    ),
    path(
        "reports/master_stock/",
        master_stock_views.MasterStockReport.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
