from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("PROD_DEBUG", cast=bool)

ALLOWED_HOSTS = ['15.207.244.193', '0.0.0.0']

# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("PROD_DB_NAME"),
        "USER": config("PROD_DB_USER"),
        "PASSWORD": config("PROD_DB_PASSWORD"),
        "HOST": config("PROD_DB_HOST"),
        "PORT": config("PROD_DB_PORT"),
    }
}
