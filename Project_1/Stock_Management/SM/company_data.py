from django.db import models

from .models import BaseModel
from .choices import Places, PaymentStatus, Prices, TaxType, TypeUOM, WithGstOrNot


class CompanyDetail(BaseModel):
    name = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    address = models.TextField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=50, choices=Places, null=True, blank=False)
    pin_code = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=100, null=True, blank=True)
    email_id = models.CharField(max_length=100, null=True, blank=True)
    website = models.CharField(max_length=100, null=True, blank=True)
    GSTIN = models.CharField(max_length=100, null=True, blank=True)
    taxation_type = models.CharField(max_length=100, null=True, blank=True)
    tax_inclusive = models.CharField(max_length=100, null=True, blank=True)
    TIN = models.CharField(max_length=100, null=True, blank=True)
    VAT = models.CharField(max_length=100, null=True, blank=True)
    service_tax_no = models.CharField(max_length=100, null=True, blank=True)
    CST_tin_no = models.CharField(max_length=100, null=True, blank=True)
    PAN = models.CharField(max_length=100, null=True, blank=True)
    additional_details = models.TextField(max_length=200, null=True, blank=True)
    currency = models.CharField(max_length=100, null=True, blank=True)
    photo = models.ImageField(default='/uploads/default_service.jpg')

    def __str__(self):
        return self.name


class Vendor(BaseModel):
    name = models.CharField(max_length=100, null=True, blank=False)
    contact_Name = models.CharField(max_length=100, null=True, blank=True)
    TIN = models.CharField(max_length=100, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=100, null=True, blank=False)
    billing_address = models.CharField(max_length=100, null=True, blank=True)
    billing_zip = models.CharField(max_length=100, null=True, blank=True)
    billing_city = models.CharField(max_length=100, null=True, blank=True)
    billing_state = models.CharField(max_length=100, null=True, blank=True)
    billing_country = models.CharField(max_length=100, null=True, blank=True)
    shipping_address = models.CharField(max_length=100, null=True, blank=True)
    shipping_zip = models.CharField(max_length=100, null=True, blank=True)
    shipping_city = models.CharField(max_length=100, null=True, blank=True)
    shipping_state = models.CharField(max_length=100, null=True, blank=True)
    shipping_country = models.CharField(max_length=100, null=True, blank=True)
    details = models.CharField(max_length=100, null=True, blank=True)
    GSTIN = models.CharField(max_length=100, null=True, blank=True)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True,
                                blank=True)

    def __str__(self):
        return self.name


class Client(BaseModel):
    name = models.CharField(max_length=100, null=True, blank=False)
    contact_Name = models.CharField(max_length=100, null=True, blank=True)
    TIN = models.CharField(max_length=100, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=100, null=True, blank=False)
    billing_address = models.CharField(max_length=100, null=True, blank=True)
    billing_zip = models.CharField(max_length=100, null=True, blank=True)
    billing_city = models.CharField(max_length=100, null=True, blank=True)
    billing_state = models.CharField(max_length=100, null=True, blank=True)
    billing_country = models.CharField(max_length=100, null=True, blank=True)
    shipping_address = models.CharField(max_length=100, null=True, blank=True)
    shipping_zip = models.CharField(max_length=100, null=True, blank=True)
    shipping_city = models.CharField(max_length=100, null=True, blank=True)
    shipping_state = models.CharField(max_length=100, null=True, blank=True)
    shipping_country = models.CharField(max_length=100, null=True, blank=True)
    details = models.CharField(max_length=100, null=True, blank=True)
    GSTIN = models.CharField(max_length=100, null=True, blank=True)
    PAN = models.CharField(max_length=100, null=True, blank=True)
    balance = models.CharField(max_length=100, null=True, blank=True)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True,
                                blank=True)

    def __str__(self):
        return self.name
