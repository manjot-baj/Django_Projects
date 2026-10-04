"""SNP_DMS URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
import debug_toolbar

admin.site.site_header = "SNP DMS Admin"
admin.site.site_title = "SNP DMS Admin site"
admin.site.index_title = "SNP DMS Admin"

urlpatterns = [
    re_path(r"^$", RedirectView.as_view(url="/admin/")),
    path("__debug__/", include(debug_toolbar.urls)),
    path("admin/", admin.site.urls),
    path("account/", include("account.urls")),
    path("master/", include("master.urls")),
    path("depot/", include("depot.urls")),
    path("edi/", include("edi.urls")),
    path("report/", include("report.urls")),
    path("dashboard/", include("dashboard.urls")),
    path("non_depot/", include("non_depot.urls")),
    path("mnr/", include("mnr.urls")),
    path("wistim_distim/", include("wistim_distim.urls")),
    path("transportation/", include("transportation.urls")),
    path("analytics/", include("analytics.urls")),
    path("dms_cache/", include("dms_cache.urls")),
    path("loaded_yard/", include("loaded_yard.urls")),
    path("billing_invoice/", include("billing_invoice.urls")),
    path("automation/", include("automation.urls")),
    path("loaded_yard/", include("loaded_yard.urls")),
    path("procurement/", include("procurement.urls")),
    path("surveyor/", include("surveyor.urls")),
    path("notification/", include("notification.urls")),
    path("truck_tracking/", include("truck_tracking.urls")),
    path("adhoc_report/", include("adhoc_reports.urls")),
    path("yard_monitoring/", include("yard_monitoring.urls")),
    path("user_support/", include("user_support.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
