# from __future__ import absolute_import, unicode_literals
# from celery import shared_task
# import os
# from .functions import (
#     get_all_site_recent_destim_file_detail,
#     mark_all_site_destim_response,
# )
# from .service_functions import upload_estimate_img_on_ftp, upload_repair_img_on_ftp


# def destim_automation_process():
#     data_list = get_all_site_recent_destim_file_detail()
#     _ = mark_all_site_destim_response(data_list)
#     return True


# def estimate_img_ftp_upload_process():
#     _ = upload_estimate_img_on_ftp()
#     return True

# def repair_img_ftp_upload_process():
#     _ = upload_repair_img_on_ftp()
#     return True
