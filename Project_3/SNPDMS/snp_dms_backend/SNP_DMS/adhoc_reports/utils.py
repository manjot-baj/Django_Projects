# Standard Library Imports
import logging
import traceback
import os

# Project Settings & Common Functions
from common.functions import upload_file

# Third-Party Packages
from decouple import config

# Django Utilities
from django.core.mail import EmailMessage
from django.http import HttpResponse

# Project Settings & Common Functions
from common.functions import upload_file, download_file


def send_adhoc_report_to_mgmnt(
    attachment_list, subject, to_email_list, cc_email_list, request_report
):
    try:
        msg = EmailMessage(
            subject=subject,
            body="Please find the attachments",
            from_email=config("EMAIL_HOST_USER"),
            to=to_email_list,
            cc=cc_email_list,
        )
        for each in attachment_list:
            msg.attach_file(each)
        msg.send()
        request_report.email_sent = True
        request_report.save()
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def upload_adhoc_report_to_s3(request_report, file, file_name):
    try:
        bucket_name = config("AWS_STORAGE_BUCKET_NAME")
        object_name = f"Adhoc_Reports/{request_report.report_type}/{file_name}.xlsx"
        upload_file(file, bucket_name, object_name)
        request_report.s3_object_name = object_name
        request_report.s3_file_name = file_name
        request_report.save()
        return True
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def download_adhoc_report_from_s3(report_request):
    try:
        bucket_name = config("AWS_STORAGE_BUCKET_NAME")
        file_name = report_request.s3_file_name
        object_name = report_request.s3_object_name
        temp_file_path = download_file(
            bucket=bucket_name, object_name=object_name, file_name=file_name
        )
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/xlsx")
            file_response["Content-Disposition"] = (
                f'attachment; filename="{file_name}.xlsx"'
            )
            os.remove(temp_file_path)
            return file_response
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
