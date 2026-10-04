from __future__ import absolute_import, unicode_literals
from cmath import atan
from celery import shared_task
import os
import logging, traceback
from .excel_edi_functions import ly_excel_edi_upload_process
from common.redis_lock import RedisLock


@shared_task
def ly_excel_edi_upload_process_service():
    lock = RedisLock(
        "ly_excel_edi_upload_process_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}
    try:
        _ = ly_excel_edi_upload_process()
        return True
    except:
        logging.error(traceback.format_exc())
        return False
    finally:
        lock.release()  # Release the lock after completion
