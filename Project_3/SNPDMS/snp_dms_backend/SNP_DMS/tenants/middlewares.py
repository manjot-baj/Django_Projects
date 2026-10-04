import threading

THREAD_LOCAL = threading.local()

from django.db import connections
import sentry_sdk
from rest_framework_simplejwt.authentication import JWTAuthentication
from .utils import tenant_db_from_request

# Instantiated once at module load, reused across requests.
jwt_authenticator = JWTAuthentication()


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        db = tenant_db_from_request(request)
        setattr(THREAD_LOCAL, "DB", db)

        # Tag this request's app module (first URL path segment) so Sentry
        # errors/traces can be filtered per app, e.g. app_module:billing_invoice
        path_parts = request.path.strip("/").split("/")
        app_module = path_parts[0] if path_parts and path_parts[0] else "root"
        sentry_sdk.set_tag("app_module", app_module)
        if db:
            sentry_sdk.set_tag("tenant_db", db)

        # Identify the user for Sentry's Active Users / user-based widgets.
        #
        # NOTE: this backend authenticates via JWT (rest_framework_simplejwt),
        # and DRF only resolves that inside the view (APIView.dispatch) --
        # by the time middleware runs, request.user is always AnonymousUser,
        # so we decode the token ourselves here instead.
        #
        # This block is purely observability. Any failure (missing, expired,
        # or malformed token) is swallowed -- it must never change the
        # response or status code. The view's own JWTAuthentication still
        # runs afterwards and will return the correct 401 if the token is
        # actually invalid; we're not duplicating or short-circuiting that.
        try:
            auth_result = jwt_authenticator.authenticate(request)
            if auth_result is not None:
                user, _ = auth_result
                sentry_sdk.set_user({
                    "id": str(user.id),
                    # "email": getattr(user, "email", None),
                    "username": getattr(user, "username", None),
                })
            else:
                sentry_sdk.set_user(None)
        except Exception:
            sentry_sdk.set_user(None)

        response = self.get_response(request)
        return response


def get_current_db_name():
    return getattr(THREAD_LOCAL, "DB", None)