"""
ASGI config for SNP_DMS project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator
from notification.consumers import *
from channels.auth import AuthMiddlewareStack
from notification.routing import *

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SNP_DMS.settings")
# application = get_asgi_application()


# for local
application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": URLRouter(websocket_urlpatterns),
    }
)

# for prod
# application = ProtocolTypeRouter(
#     {
#         "https": get_asgi_application(),
#         "websocket": AllowedHostsOriginValidator(
#             AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
#         ),
#     }
# )
