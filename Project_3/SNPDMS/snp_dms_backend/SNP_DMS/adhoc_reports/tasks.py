# Celery
from __future__ import absolute_import, unicode_literals
from celery import shared_task

# Standard Library Imports
import os
import logging
import traceback

# Models
## Adhoc
from adhoc_reports.models import AdhocReportRequest
from adhoc_reports.Functions.mnr_material_usage_functions import (
    create_mnr_material_usage_report,
)
from adhoc_reports.Functions.provisional_bill_functions import (
    create_provisional_bill_lolo_mnr_report,
)
from adhoc_reports.Functions.repo_movement_mnr_functions import (
    create_mnr_repo_movement_report_report,
)
from adhoc_reports.Functions.volume_tues_functions import create_daily_activity_report
from common.redis_lock import RedisLock


@shared_task
def process_adhoc_report_requests():
    lock = RedisLock(
        "process_adhoc_report_requests", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        adhoc_report_requests = AdhocReportRequest.objects.filter(
            email_sent=False, s3_object_name=None, s3_file_name=None
        )
        for each in adhoc_report_requests:
            each.status = "Processing"
            each.save()
            if each.report_type == "MNR Material Usage Report":
                create_mnr_material_usage_report(
                    location=each.location,
                    site=each.site,
                    from_date_str=each.from_date.strftime("%Y-%m-%d"),
                    to_date_str=each.to_date.strftime("%Y-%m-%d"),
                    request_report=each,
                )

            if each.report_type == "Provisional Bill Report":
                create_provisional_bill_lolo_mnr_report(
                    location=each.location,
                    site=each.site,
                    from_date_str=each.from_date.strftime("%Y-%m-%d"),
                    to_date_str=each.to_date.strftime("%Y-%m-%d"),
                    request_report=each,
                )

            if each.report_type == "Volume Tues Report":
                create_daily_activity_report(
                    location=each.location,
                    site=each.site,
                    from_date_str=each.from_date.strftime("%Y-%m-%d"),
                    to_date_str=each.to_date.strftime("%Y-%m-%d"),
                    request_report=each,
                )
            if each.report_type == "MNR Repo Movement Report":
                create_mnr_repo_movement_report_report(
                    location=each.location,
                    site=each.site,
                    from_date_str=each.from_date.strftime("%Y-%m-%d"),
                    to_date_str=each.to_date.strftime("%Y-%m-%d"),
                    request_report=each,
                )
        return True
    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False
    finally:
        lock.release()  # Release the lock after completion
