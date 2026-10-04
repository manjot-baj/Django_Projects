from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from truck_tracking import views

urlpatterns = [
    path(
        "add/",
        views.TruckEntry.as_view(),
    ),
    path(
        "all/",
        views.ListTruckEntries.as_view(),
    ),
    path(
        "transporter/",
        views.TruckDataRelatedToContainer.as_view(),
    ),
    path(
        "vehicles/",
        views.VehicleNoAvailableUnderTransporter.as_view(),
    ),
    path(
        "transporter_list/",
        views.ListOfTransporters.as_view(),
    ),
    path(
        "<int:pk>/",
        views.GetTruckData.as_view(),
    ),
    path(
        "<int:pk>/update/",
        views.UpdateTruckeEntry.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
