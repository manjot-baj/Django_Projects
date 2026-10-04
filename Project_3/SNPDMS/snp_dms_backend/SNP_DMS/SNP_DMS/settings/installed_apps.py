PROJECT_APPS = [
    "account",
    "master",
    "depot",
    "edi",
    "report",
    "dashboard",
    "tenants",
    "non_depot",
    "mnr",
    "wistim_distim",
    "transportation",
    "analytics",
    "dms_cache",
    "billing_invoice",
    "automation",
    "loaded_yard",
    "procurement",
    "surveyor",
    "notification",
    "truck_tracking",
    "adhoc_reports",
    "user_support",
]

THIRD_PARTY_APPS = [
    "corsheaders",
    "wkhtmltopdf",
    "django_celery_results",
    "django_celery_beat",
    "rangefilter",
    "channels",
    # "debug_toolbar",
    # "django_extensions"
]

ASGI_APPLICATION = "SNP_DMS.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("localhost", 6379)],
        },
    },
}

# ==========================================
# SENTRY CONFIGURATION
# ==========================================
import sentry_sdk
from decouple import config

SENTRY_SENSITIVE_KEYS = {
    "password", "token", "authorization", "jwt", "secret",
    "api_key", "access_key", "secret_key",
}

def sentry_before_send(event, hint):
    request = event.get("request", {})

    for field in ("data", "cookies", "query_string"):
        val = request.get(field)
        if isinstance(val, dict):
            for key in list(val.keys()):
                if key.lower() in SENTRY_SENSITIVE_KEYS:
                    val[key] = "[Filtered]"
        elif isinstance(val, str) and field == "cookies":
            request[field] = "[Filtered]"

    headers = request.get("headers")
    if isinstance(headers, dict):
        for h in ("Authorization", "Cookie", "X-Api-Key"):
            if h in headers:
                headers[h] = "[Filtered]"

    return event


def sentry_before_breadcrumb(crumb, hint):
    if crumb.get("category") == "httplib":
        url = crumb.get("data", {}).get("url")
        if url:
            crumb["data"]["url"] = url.split("?")[0]
    return crumb

# def sentry_before_send(event, hint):
#     """Strip sensitive fields from request data/headers before sending to Sentry."""
#     request = event.get("request", {})

#     data = request.get("data")
#     if isinstance(data, dict):
#         for key in list(data.keys()):
#             if key.lower() in SENTRY_SENSITIVE_KEYS:
#                 data[key] = "[Filtered]"

#     headers = request.get("headers")
#     if isinstance(headers, dict):
#         for h in ("Authorization", "Cookie", "X-Api-Key"):
#             if h in headers:
#                 headers[h] = "[Filtered]"

#     return event


sentry_sdk.init(
    dsn=config("SENTRY_DSN", default=""),
    # Separates dev/qa/staging/production data within the same Sentry project.
    environment=config("SENTRY_ENVIRONMENT", default="development"),
    # Tie errors to a specific deploy so perf regressions can be correlated with releases.
    release=config("GIT_COMMIT_SHA", default="unknown"),
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    # Defaults to False — set SENTRY_SEND_PII=True per-environment only if you deliberately want this.
    send_default_pii=config("SENTRY_SEND_PII", default=False, cast=bool),
    # Enable sending logs to Sentry
    enable_logs=True,
    # Fraction of transactions to trace. Set per-environment via SENTRY_TRACES_SAMPLE_RATE.
    # Defaults to 0.0 (off) so an unconfigured .env never accidentally traces 100%.
    traces_sample_rate=config("SENTRY_TRACES_SAMPLE_RATE", default=0.0, cast=float),
    # Fraction of sessions to profile. Set per-environment via SENTRY_PROFILE_SAMPLE_RATE.
    profile_session_sample_rate=config("SENTRY_PROFILE_SAMPLE_RATE", default=0.0, cast=float),
    # Set profile_lifecycle to "trace" to automatically
    # run the profiler on when there is an active transaction
    profile_lifecycle="trace",
    before_send=sentry_before_send,
    before_breadcrumb=sentry_before_breadcrumb,
)
