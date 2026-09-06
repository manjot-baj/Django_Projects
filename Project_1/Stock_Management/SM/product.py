from django.db import models
# from django.utils import timezone
from .models import BaseModel
from .company_data import CompanyDetail, Client
from .choices import Places, PaymentStatus, Prices, TaxType, TypeUOM, Product_Type


class Product(BaseModel):
    type = models.CharField(max_length=50, choices=Product_Type, null=True, blank=False)
    sn = models.CharField(max_length=100, null=True, blank=True)
    uom = models.CharField(choices=TypeUOM, max_length=20, null=True, blank=False)
    sku = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=False)
    description = models.TextField(null=True, blank=True)
    hsn = models.CharField(max_length=100, null=True, blank=True)
    sac = models.CharField(max_length=100, null=True, blank=True)
    unit_price = models.FloatField(null=True, blank=False, default=0.0)
    purchase_rate = models.FloatField(null=True, blank=True, default=0.0)
    tax = models.CharField(choices=TaxType, max_length=50, null=True, blank=False)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True, blank=False)
    is_available = models.BooleanField(default=True, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'product'
        verbose_name_plural = 'Product'
