from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("QA_DEBUG", cast=bool)

ALLOWED_HOSTS = ['3.108.171.12', '0.0.0.0']

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("QA_DB_NAME"),
        "USER": config("QA_DB_USER"),
        "PASSWORD": config("QA_DB_PASSWORD"),
        "HOST": config("QA_DB_HOST"),
        "PORT": config("QA_DB_PORT"),
    }
}
