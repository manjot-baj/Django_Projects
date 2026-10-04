from django.urls import path, re_path
from .consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(
        "ws/notifications/(?P<location>[\w\s]+)/(?P<site>[\w\s]+)/$",
        NotificationConsumer.as_asgi(),
    ),
]

