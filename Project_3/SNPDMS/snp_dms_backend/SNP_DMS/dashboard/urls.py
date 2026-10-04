from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path("", views.Dashboard.as_view()),
    path("movement_summary/", views.DashboardMovementSummary.as_view()),
    path("inventory/", views.DashboardInventory.as_view()),
    path("volume_revenue/", views.DashboardVolumeRevenue.as_view()),
    path("revenue/", views.DashboardRevenue.as_view()),
    path("top_client_revenue/", views.DashboardTopClientRevenue.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
