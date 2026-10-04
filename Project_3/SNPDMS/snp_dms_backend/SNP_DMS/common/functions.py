from email import message
import logging, os, boto3, json, traceback

# from re import T
from decouple import config
from SNP_DMS.settings.base import BASE_DIR
from twilio.rest import Client
from master.models import Location, Site
from django.http import JsonResponse
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.core.cache import cache
from rest_framework.response import Response

AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME")


def send_sms_from_sns(mobile_no, message):
    try:
        client = boto3.client(
            "sns",
            region_name=config("AWS_S3_REGION_NAME"),
            aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
        )
        client.publish(PhoneNumber=f"+91{mobile_no}", Message=message)
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
    return True


def upload_file(file_name, bucket, object_name=None, public_access=False):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name
    try:
        s3_resource = boto3.resource(
            "s3",
            region_name=config("AWS_S3_REGION_NAME"),
            aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
        )
        if public_access:
            s3_resource.Bucket(bucket).upload_file(
                Filename=file_name, Key=object_name, ExtraArgs={"ACL": "public-read"}
            )
        else:
            s3_resource.Bucket(bucket).upload_file(Filename=file_name, Key=object_name)
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
    return True


def download_file(bucket, object_name, file_name):
    s3_resource = boto3.resource(
        "s3",
        region_name=config("AWS_S3_REGION_NAME"),
        aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    )
    if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
        os.makedirs(os.path.join(BASE_DIR, "temp/"))
    temp_file_path = os.path.join(BASE_DIR, f"temp/{file_name}")
    try:
        s3_resource.Bucket(bucket).download_file(object_name, temp_file_path)
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
    return temp_file_path


def delete_file(bucket, object_name):
    s3_resource = boto3.resource(
        "s3",
        region_name=config("AWS_S3_REGION_NAME"),
        aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    )
    try:
        response = s3_resource.Object(bucket, object_name).delete()
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
    return True


def print_me(*args):
    for each in args:
        try:
            with open(config("DEBUG_TXT_PATH"), "a") as f:
                f.writelines(f"\n{json.dumps(each)}\n")
        except:
            with open(config("DEBUG_TXT_PATH"), "a") as f:
                f.writelines(f"\n{json.dumps(str(each))}\n")
    return True


def send_sms(from_no, to_no, body):
    try:
        account_sid = config("TWILIO_ACCOUNT_SID")
        auth_token = config("TWILIO_AUTH_TOKEN")
        client = Client(account_sid, auth_token)
        message = client.messages.create(from_=from_no, body=body, to=f"+91{to_no}")
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def get_location_site(location_name, site_name):
    location = Location.objects.get(name=location_name)
    site = Site.objects.get(name=site_name)
    return location, site


def cache_api_view(key, time):
    def decorator_func(view_func):
        def wrapper_func(self, request, *args, **kwargs):
            try:
                if (
                    not "location" in request.data.keys()
                    and not "site" in request.data.keys()
                ):
                    location = "location"
                    site = "site"
                else:
                    location = request.data["location"]
                    site = request.data["site"]
                if not "movement" in request.data.keys():
                    movement = "movement"
                else:
                    movement = request.data["movement"]
                cache_key = f"{key}_{location.replace(" ", "_")}_{site.replace(" ", "_")}_{movement}"

                request_body_key = f"request_body_{cache_key}"

                previous = cache.get((request_body_key))

                response = None
                get_key = cache.get((f"response_{cache_key}"))

                if get_key is None or not previous == request.data:
                    response = view_func(self, request, *args, **kwargs)

                    json_data = json.dumps(response.data, cls=DjangoJSONEncoder)
                    cache.set_many(
                        {
                            request_body_key: request.data,
                            f"response_{cache_key}": json_data,
                        },
                        timeout=time,
                    )
                    # print("DBBBBBBBBBBBBBBBBB")
                    # print_me("IN DBBBBBBBBBBBBBBBBBBBB")
                else:
                    # print("CACHEEEEEEEEEEEEEEEEEEEEEEEE")
                    # print_me("IN CACHEEEEEEEEEEEEEEEEEEEEEE")
                    json_data = get_key
                    loaded_data = json.loads(json_data)
                    loaded_data["cache"] = True
                    response = JsonResponse(loaded_data, status=200)
                return response
            except Exception as e:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                return Response({"errorMsg": "Data Not Found"}, status=200)

        return wrapper_func

    return decorator_func
