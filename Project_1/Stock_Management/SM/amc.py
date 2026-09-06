from django.db import models
from django.utils import timezone
from .models import BaseModel
from .company_data import Client, CompanyDetail
import random

from datetime import timedelta


def random_string():
    return str(random.randint(10000, 99999))


class AMC(BaseModel):
    number = models.CharField(default=random_string, max_length=50, null=True, blank=False)
    client_name = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=False)
    description = models.TextField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=False)
    end_date = models.DateField(null=True, blank=False)
    first_service_date = models.DateField(null=True, blank=True)
    second_service_date = models.DateField(null=True, blank=True)
    third_service_date = models.DateField(null=True, blank=True)
    fourth_service_date = models.DateField(null=True, blank=True)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True,
                                blank=True)

    def __str__(self):
        return self.number

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            self.first_service_date = self.start_date + timedelta(days=90)
            self.second_service_date = self.start_date + timedelta(days=180)
            self.third_service_date = self.start_date + timedelta(days=270)
            self.fourth_service_date = self.start_date + timedelta(days=360)
            self.end_date = self.start_date + timedelta(days=365)
            res = super(AMC, self).save(force_insert=False, force_update=False, using=None, update_fields=None)
        else:
            res = super(AMC, self).save(force_insert=False, force_update=False, using=None, update_fields=None)
        return res


class AMCRecord(BaseModel):
    date = models.DateField(null=True, blank=False)
    client = models.CharField(max_length=100, null=True, blank=False)
    phone = models.CharField(max_length=12, null=True, blank=False)
    message = models.TextField(null=True, blank=False)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True,
                                blank=True)

    def __str__(self):
        return self.client
