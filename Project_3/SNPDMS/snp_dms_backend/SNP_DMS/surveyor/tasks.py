from __future__ import absolute_import, unicode_literals
from celery import shared_task
from .functions import remove_corrupted_surveyor_data
from common.redis_lock import RedisLock
import logging, traceback


@shared_task
def corrupted_surveyor_data_removal_process():
    lock = RedisLock(
        "corrupted_surveyor_data_removal_process", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        _ = remove_corrupted_surveyor_data()
        return True
    except:
        logging.error(traceback.format_exc())
        return False
    finally:
        lock.release()  # Release the lock after completion
