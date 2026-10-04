from django.urls import path
from django.conf import settings
from django.conf.urls.static import static


from .views import NotificationView, NotificationHistory, MarkAllAsRead

urlpatterns = [
    path("get_notifications/", NotificationView.as_view()),
    path("notification_history/", NotificationHistory.as_view()),
    path("mark_notification_as_read/", MarkAllAsRead.as_view()),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
