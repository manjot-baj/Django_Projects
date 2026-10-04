#!/usr/bin/env python
# Dummy change for CI pipeline
"""Django's command-line utility for administrative tasks."""
import os
import sys
from django.db import connection
from tenants.utils_two import set_db_for_router


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SNP_DMS.settings.production")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    args = sys.argv
    db = args[1]
    with connection.cursor() as cursor:
        set_db_for_router(db)
        del args[1]
        execute_from_command_line(args)


if __name__ == "__main__":
    main()
