from __future__ import absolute_import
import os

from celery import Celery

# from celery import task
from django.conf import settings
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "SNP_DMS.settings.staging")
app = Celery("SNP_DMS")

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object("django.conf:settings")

app.conf.broker_connection_retry_on_startup = True

app.conf.beat_schedule = {
    "edi_service": {
        "task": "edi.tasks.edi_process",
        "schedule": crontab(
            minute="15,45", hour="0-23"
        ),  # Every 30 minutes offset by 15 minutes
    },
    "in_out_patch_service": {
        "task": "depot.tasks.patch_process",
        "schedule": crontab(minute="*/15"),
    },
    "msc_move_code_edi_service": {
        "task": "edi.tasks.msc_edi_process",
        "schedule": crontab(
            minute=[0, 30], hour="0-23"
        ),  # Every half hour from 12 AM to 11:30 PM
    },
    "msc_edi_useless_db_object_delete_service": {
        "task": "edi.tasks.msc_edi_useless_db_object_delete",
        "schedule": crontab(minute=0, hour=[2, 14]),
    },
    "edi_tracker_report_mail_service": {
        "task": "edi.tasks.send_edi_mail_tracked_report",
        "schedule": crontab(minute=0, hour=[2, 14]),
    },
    "msc_move_code_edi_tracker_report_mail_service": {
        "task": "edi.tasks.send_msc_edi_movecode_mail_tracked_report",
        "schedule": crontab(minute=0, hour=[2, 8, 14, 20]),
    },
    "msc_in_excel_edi_upload_process": {
        "task": "edi.tasks.msc_in_excel_edi_upload_process",
        "schedule": crontab(minute="*/15"),
    },
    "msc_out_excel_edi_upload_process": {
        "task": "edi.tasks.msc_out_excel_edi_upload_process",
        "schedule": crontab(minute="*/15"),
    },
    "create_movecode_edi_mail_track_objects_process": {
        "task": "edi.tasks.create_movecode_edi_mail_track_objects",
        "schedule": crontab(minute="*/15"),
    },
    "ly_excel_edi_upload_process_service": {
        "task": "loaded_yard.tasks.ly_excel_edi_upload_process_service",
        "schedule": crontab(minute="*/30"),
    },
    "monitor_all_sites_ftp_folder_process": {
        "task": "edi.tasks.monitor_all_sites_ftp_folder_process",
        "schedule": crontab(minute=0, hour="*/1 * * *"),
    },
    "mark_expire_pre_gate_process": {
        "task": "depot.tasks.mark_expire_pre_gate_process",
        "schedule": crontab(minute=30, hour=18),
    },
    "corrupted_surveyor_data_removal_process": {
        "task": "surveyor.tasks.corrupted_surveyor_data_removal_process",
        "schedule": crontab(minute="*/10"),
    },
    "process_adhoc_report_requests": {
        "task": "adhoc_reports.tasks.process_adhoc_report_requests",
        "schedule": crontab(minute="*/10"),
    },
}

app.conf.timezone = "UTC"

app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print("Request: {0!r}".format(self.request))


# Not in Use

# "cma_mir_rwm_edi_service": {
#         "task": "edi.tasks.cma_edi_process",
#         "schedule": crontab(minute="*/10"),
#     },
# "cma_rwm_edi_data_creation_service": {
#     "task": "edi.tasks.create_cma_rwm_edi_object",
#     "schedule": crontab(minute="*/30"),
# },

# "faridabad_msc_in_excel_edi_upload_process": {
#         "task": "edi.tasks.faridabad_msc_in_excel_edi_upload_process",
#         "schedule": crontab(minute=0, hour="*/1 * * *"),
# },
# "faridabad_msc_out_excel_edi_upload_process": {
#     "task": "edi.tasks.faridabad_msc_out_excel_edi_upload_process",
#     "schedule": crontab(minute=0, hour="*/1 * * *"),
# },

# "daily_activity_report_service": {
#         "task": "report.tasks.daily_activity_reports_for_mgmt",
#         "schedule": crontab(
#             minute=0,
#             hour=[3],
#         ),
#     },
#     "daily_westim_destim_reports_for_manager_service": {
#         "task": "report.tasks.westim_destim_reports_for_manager",
#         "schedule": crontab(
#             minute=0,
#             hour=[3],
#         ),
#     },
#     "daily_stuck_stock_sms_for_manager_service": {
#         "task": "report.tasks.stuck_stock_sms_for_manager",
#         "schedule": crontab(
#             minute=0,
#             hour=[3],
#         ),
#     },

# "run_analytics_agent_tasks_process": {
#         "task": "analytics_with_llm.tasks.run_analytics_agent_tasks_process",
#         "schedule": crontab(minute="*/5"),
#     },
#  "edi_tracker_sms_service": {
#         "task": "edi.tasks.send_edi_mail_tracked_sms",
#         "schedule": crontab(minute=0, hour=[2, 14]),
#     },
