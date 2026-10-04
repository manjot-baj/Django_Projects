from django.db import connection
from decouple import config


def get_tenants_map():
    try:
        return {config("TENANT1_NAME"): config("TENANT1_DB_KEYWORD")}
    except:
        return {}


def hostname_from_request(request):
    try:
        try:
            return request.headers['X-Forwarded-Host'].split(":")[0].split(".")[0].lower()
        except:
            return request.headers['Host'].split(":")[0].split(".")[0].lower()
    except:
        return None


def tenant_db_from_request(request):
    hostname = hostname_from_request(request)
    tenants_map = get_tenants_map()
    return tenants_map.get(hostname)


def set_tenant_schema_for_request(request):
    schema = tenant_db_from_request(request)
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path to {schema}")
