from django.db import models
from django.utils import timezone
from .models import BaseModel
from .company_data import CompanyDetail, Client
from .product import Product
from .choices import Places, PaymentStatus, Prices, TaxType, TypeUOM, Payment_status, Payment_Type


class PaymentDocument(BaseModel):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    payment_status = models.CharField(max_length=50, null=True, blank=True, choices=Payment_status)
    number = models.CharField(null=True, blank=True, max_length=100)
    reference = models.CharField(null=True, blank=True, max_length=100)
    amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00)
    payment_type = models.CharField(max_length=50, null=True, blank=True, choices=Payment_Type)
    pay_date = models.DateTimeField(default=timezone.now, null=True, blank=False)
    bank_charges = models.DecimalField(decimal_places=2, max_digits=10, default=0.00)
    note = models.TextField(null=True, blank=True)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.client

    class Meta:
        db_table = 'payment_document'
        verbose_name_plural = 'Payment Document'
