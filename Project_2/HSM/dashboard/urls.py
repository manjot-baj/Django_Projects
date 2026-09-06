from django.urls import path
from . import views
from . import datatables

app_name = 'dashboard'
urlpatterns = [
    path('login/', views.Dashboard.as_view(), {'login': ''}, name="login"),
    path('', views.Dashboard.as_view(), name="dashboard"),
    path('logout/', views.Dashboard.as_view(), {'logout': ''}, name="logout"),
    path('maintenance/', views.Maintenance.as_view(), name="maintenance_table"),
    path('viewMaintenance/<int:object_id>', views.Maintenance.as_view(), name="view_maintenance"),
    path('account/', views.Accounting.as_view(), name="accounting"),
    path('maintenance_wizard/', datatables.MaintenanceDT.as_view(), name="maintenance_wizard"),
    path('notice_table/', views.NoticeView.as_view(), name="notice_table"),
    path('my_notices/', views.GetNotice.as_view(), name="my_notices"),
    path('members/', views.Members.as_view(), name="members_table"),
    path('helpDesk/', views.HelpDesk.as_view(), name="complaint_table"),
    path('complaint/', views.HelpDesk.as_view(), {'complaint_form': ''}, name="complaint_form"),
    path('notice/', views.GetNotice.as_view(), {'add_notice': ''}, name="add_notice"),
    path('profile/', views.Profile.as_view(), name="user_profile"),
    path('flats/', views.Flats.as_view(), name="flats_table"),
    path('vehicle/', views.Vehicle.as_view(), name="vehicle_table"),
    path('purchase_order/', views.PurchaseOrder.as_view(), name="purchase_order_table"),
    path('filterPurchaseOrderDate/', views.PurchaseOrder.as_view(), {'filterDate': ''},
         name="filter_purchase_order_date"),
    path('viewPurchaseOrder/<int:object_id>', views.PurchaseOrder.as_view(), name="view_purchase_order"),
    path('purchase_order_maker/', views.PurchaseOrder.as_view(),
         {'purchase_order_maker': '', 'purchase_order_lines': ''},
         name="purchase_order_maker"),

]
