from .models import *
import logging, traceback, os
from mnr.functions import (
    get_site_ftp_detail,
    upload_file_to_ftp_server,
)
from decouple import config
from common.functions import download_file
from notification.utils import send_notification

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


def upload_img_helper(images, site_name, after_image=False):
    try:
        bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
        site = Site.objects.get(name=site_name)
        for image in images:
            container_object = None
            process = None
            if after_image:
                process = "after_repair_image_upload"
                container_object = (
                    image.parent.parent.parent.depot.container
                    if image.parent.parent.parent.depot
                    else image.parent.parent.parent.non_depot.container
                )
            else:
                process = "before_repair_image_upload"
                container_object = (
                    image.parent.depot.container
                    if image.parent.depot
                    else image.parent.non_depot.container
                )

            file_name = image.s3_file_name
            object_name = image.s3_object_name
            temp_file_path = download_file(
                bucket=bucket_name, object_name=object_name, file_name=file_name
            )
            ftp_data = get_site_ftp_detail(site_name, process)
            if ftp_data is not None:
                ftp_response = upload_file_to_ftp_server(
                    host=ftp_data["host"],
                    username=ftp_data["username"],
                    password=ftp_data["password"],
                    working_directory=ftp_data["working_directory"],
                    file_name=file_name,
                    file_path=temp_file_path,
                )
                os.remove(temp_file_path)
                if ftp_response is True:
                    image.ftp_upload_successful = True
                    image.save()
                    send_notification(
                        location=site.location.name,
                        site=site.name,
                        category="MNR",
                        notification_type="SUCCESS",
                        message=f"Container No {container_object.container_no}, {file_name} Image FTP Upload Successful",
                    )
                else:
                    send_notification(
                        location=site.location.name,
                        site=site.name,
                        category="MNR",
                        notification_type="FAILURE",
                        message=f"Container No {container_object.container_no}, {file_name} Image FTP Upload Failed !!!",
                    )
        return True
    except:
        # Log any exceptions
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())


def get_site_wise_img_data(data, after_image=False):
    data = {}
    for each in data:
        if after_image:
            site = (
                each.parent.parent.parent.depot.container.site
                if each.parent.parent.parent.depot
                else each.parent.parent.parent.non_depot.container.site
            )
        else:
            site = (
                each.parent.depot.container.site
                if each.parent.depot
                else each.parent.non_depot.container.site
            )
        if site in data.keys():
            data[site].append(each)
        else:
            data[site] = [each]
    return data


def upload_estimate_img_on_ftp():
    try:
        if (
            BeforeRepairImage.objects.filter(
                upload_to_ftp=True, ftp_upload_successful=False
            ).exists()
            is False
        ):
            return True
        images_raw = BeforeRepairImage.objects.filter(
            upload_to_ftp=True, ftp_upload_successful=False
        )
        images_data = get_site_wise_img_data(data=list(images_raw), after_image=False)
        for site_name, images_list in images_data.items():
            for images in images_list:
                upload_img_helper(images=images, site_name=site_name, after_image=False)
    except:
        # Log any exceptions
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())


def upload_repair_img_on_ftp():
    try:
        if (
            AfterRepairImage.objects.filter(
                upload_to_ftp=True, ftp_upload_successful=False
            ).exists()
            is False
        ):
            return True
        images_raw = AfterRepairImage.objects.filter(
            upload_to_ftp=True, ftp_upload_successful=False
        )
        images_data = get_site_wise_img_data(data=list(images_raw), after_image=True)
        for site_name, images_list in images_data.items():
            for images in images_list:
                upload_img_helper(images=images, site_name=site_name, after_image=True)
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
