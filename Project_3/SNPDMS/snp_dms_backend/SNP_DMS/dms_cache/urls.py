# other imports
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


# views imports
from dms_cache import views

urlpatterns = [
    path("redis_keys/", views.GetRedisKeys.as_view(), name="home"),
    path(
        "redis_keys/<str:key_str>/", views.GetRedisValue.as_view(), name="display_value"
    ),
    path(
        "delete_keys/<str:key_str>/",
        views.DeleteRedisValue.as_view(),
        name="delete_keys",
    ),
    path("manage_cache_keys/", views.ManageCacheKeys.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
