from django.db import models
from .pomodels import ResProductDetail, ResVendorDetail
from .society import ResSociety
from .models import BaseModel
from django.utils import timezone
import random


def random_string():
    return str(random.randint(10000, 99999))


class PurchaseOrderMaker(BaseModel):
    date = models.DateTimeField(default=timezone.now, null=True, blank=False)
    purchase_order_no = models.CharField(default=random_string, max_length=50, null=True, blank=False)
    society = models.ForeignKey(ResSociety, null=True, blank=False, on_delete=models.CASCADE)
    vendor = models.ForeignKey(ResVendorDetail, null=True, blank=False, on_delete=models.CASCADE)
    special_instructions = models.TextField(max_length=50, null=True, blank=True)
    grand_total = models.DecimalField(decimal_places=2, max_digits=10, default=0.00)

    def __str__(self):
        return str(self.purchase_order_no)

    class Meta:
        db_table = 'res_purchase_order_maker'
        verbose_name_plural = 'Purchase Order'


class PurchaseOrderLine(BaseModel):
    purchase_order_no = models.ForeignKey(PurchaseOrderMaker, blank=True, null=True, on_delete=models.PROTECT)
    product = models.ForeignKey(ResProductDetail, null=True, blank=False, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, null=True, blank=False)
    product_unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=False, default=0.0)

    class Meta:
        db_table = 'purchase_order_line'
