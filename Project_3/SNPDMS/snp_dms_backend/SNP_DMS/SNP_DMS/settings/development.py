from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEV_DEBUG", cast=bool)

ALLOWED_HOSTS = [
    "127.0.0.1",
    "0.0.0.0",
    "localhost.com",
    ".localhost.com",
    "localhost",
    "app",
]

CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:8000",
    "http://localhost:8000"
]

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("DEV_DB_NAME"),
        "USER": config("DEV_DB_USER"),
        "PASSWORD": config("DEV_DB_PASSWORD"),
        "HOST": config("DEV_DB_HOST"),
        "PORT": config("DEV_DB_PORT"),
    },
    config("ANALYTICS_DB_KEYWORD"): {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("ANALYTICS_DB_NAME"),
        "USER": config("ANALYTICS_DB_USER"),
        "PASSWORD": config("ANALYTICS_DB_PASSWORD"),
        "HOST": config("ANALYTICS_DB_HOST"),
        "PORT": config("ANALYTICS_DB_PORT"),
    },
    # config("TENANT1_DB_KEYWORD"): {
    #     "ENGINE": "django.db.backends.mysql",
    #     "NAME": config("TENANT1_DB_NAME"),
    #     "USER": config("TENANT1_DB_USER"),
    #     "PASSWORD": config("TENANT1_DB_PASSWORD"),
    #     "HOST": config("TENANT1_DB_HOST"),
    #     "PORT": config("TENANT1_DB_PORT"),
    # },
    # config("TENANT2_DB_KEYWORD"): {
    #     "ENGINE": "django.db.backends.mysql",
    #     "NAME": config("TENANT2_DB_NAME"),
    #     "USER": config("TENANT2_DB_USER"),
    #     "PASSWORD": config("TENANT2_DB_PASSWORD"),
    #     "HOST": config("TENANT2_DB_HOST"),
    #     "PORT": config("TENANT2_DB_PORT"),
    # },
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False if DEBUG else True,
    "formatters": {
        "simple": {
            "format": "%(levelname)s %(asctime)s %(module)s.%(funcName)s:%(lineno)s- %(message)s"
        },
    },
    "handlers": {
        "info": {
            "level": "INFO",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(BASE_DIR, "logs/info.log"),
            "maxBytes": 300 * 1024 * 1024,
            "backupCount": 50,
            "formatter": "simple",
            "encoding": "utf-8",
        },
        "error": {
            "level": "ERROR",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(BASE_DIR, "logs/error.log"),
            "maxBytes": 300 * 1024 * 1024,
            "backupCount": 50,
            "formatter": "simple",
            "encoding": "utf-8",
        },
    },
    "loggers": {
        "info_log": {
            "handlers": ["info"],
            "level": "INFO",
            "propagate": True,
        },
        "error_log": {
            "handlers": ["error"],
            "level": "ERROR",
            "propagate": True,
        },
    },
}
