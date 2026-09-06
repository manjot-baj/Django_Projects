from django.db import models
from django.utils import timezone
from .models import BaseModel
from .company_data import CompanyDetail, Client
from .product import Product
from .choices import Places, PaymentStatus, Prices, TaxType, TypeUOM, WithGstOrNot
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime, timedelta



class BillOfSupply(BaseModel):
    number = models.CharField(null=True, blank=True, max_length=100)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    ship_to = models.TextField(null=True, blank=False, max_length=250)
    place_of_supply = models.CharField(null=True, blank=False, max_length=100)
    issue_date = models.DateTimeField(default=timezone.now, null=True, blank=False)
    payment_terms = models.CharField(max_length=50, choices=PaymentStatus, null=True, blank=False)
    due_date = models.DateField(null=True, blank=True)
    clean_amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    discount_amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    tax_amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    grand_total = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    rounded_off_value = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    grand_total_without_round = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True,
                                                    blank=True)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True, blank=False)
    # with_gst = models.BooleanField(null=True, blank=True)
    gst = models.CharField(choices=WithGstOrNot, max_length=20, null=True, blank=False)
    centralGst = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    stateGst = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    internationalGst = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)


    def __str__(self):
        return self.number

    class Meta:
        db_table = 'bill_of_supply'
        verbose_name_plural = 'Bill Of Supply'

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            if self.payment_terms == "7":
                date = self.issue_date + timedelta(days=7)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "10":
                date = self.issue_date + timedelta(days=10)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "15":
                date = self.issue_date + timedelta(days=15)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "30":
                date = self.issue_date + timedelta(days=30)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "45":
                date = self.issue_date + timedelta(days=45)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "60":
                date = self.issue_date + timedelta(days=60)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "90":
                date = self.issue_date + timedelta(days=90)
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "0":
                date = self.issue_date
                self.due_date = date
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            else:
                BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
        else:
            BillOfSupply_save = super(BillOfSupply, self).save(force_insert=False, force_update=False, using=None,
                                                     update_fields=None)
        return BillOfSupply_save


class BillOfSupplyLines(BaseModel):
    bill = models.ForeignKey(BillOfSupply, null=True, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    uom = models.CharField(choices=TypeUOM, max_length=20, null=True, blank=False)
    quantity = models.PositiveIntegerField(default=1, null=True, blank=False)
    unit_price = models.FloatField(null=True, blank=False, default=0.0)
    discount = models.PositiveIntegerField(null=True, blank=False,
                                           default=0, validators=[MaxValueValidator(100), MinValueValidator(0)])
    tax = models.CharField(choices=TaxType, default=0, max_length=50, null=True, blank=False)

    class Meta:
        db_table = 'Bill_of_supply_Lines'
        verbose_name_plural = 'Bill Of Supply Lines'
