import logging
from .amc_task import amcSms
from celery.utils.log import get_task_logger

celery_logger = get_task_logger(__name__)
logger = logging.getLogger(__name__)

from celery import current_task
from celery.schedules import crontab
from celery.task import periodic_task
from django.core.cache import cache

Celery_Queue = 'celery_dev_queue'


@periodic_task(
    run_every=(crontab(minute='*')),
    name="sample",
    ignore_result=True,
    queue=Celery_Queue,
    options={'queue': Celery_Queue},
)
def sample():
    celery_logger.info("Starting Task pass expiry intimation")
    lock_expire = 300
    lock_key = 'sample'
    acquire_lock = lambda: cache.add(lock_key, '1', lock_expire)
    release_lock = lambda: cache.delete(lock_key)
    if acquire_lock():
        try:
            a = amcSms()
            print(a)
            celery_logger.info("AAAAAAAAA")

            celery_logger.info()
        except Exception as e:
            celery_logger.error("Exception while acquiring lock for pass expiry intimation {}".format(str(e)))
        finally:
            release_lock()
    else:
        celery_logger.info("Other task of pass expiry intimation is running, skipping")
    celery_logger.info("End Task pass expiry intimation")
