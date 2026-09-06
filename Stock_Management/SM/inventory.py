from django.db import models
from .models import BaseModel
from .invoice import Invoice


class Inventory(BaseModel):
    sn = models.CharField(max_length=100, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=False)

    def __str__(self):
        return self.sn

    class Meta:
        db_table = 'inventory'
        verbose_name_plural = 'Inventory'
