from django.core.handlers.wsgi import WSGIRequest

from .amc_task import amcSms
import schedule
import time


def callAmcSms():
    my_data = amcSms()
    print(my_data)


# schedule.every(5).seconds.do(lambda: callAmcSms(request="<WSGIRequest: GET '/'>"))
schedule.every().day.at("10:30").do(callAmcSms)
while True:
    schedule.run_pending()
    time.sleep(1)
