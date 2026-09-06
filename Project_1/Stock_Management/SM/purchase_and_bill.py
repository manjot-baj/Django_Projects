from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from .models import BaseModel
from .company_data import Vendor, CompanyDetail
from .product import Product
from .choices import Places, PaymentStatus, Prices, TaxType, TypeUOM
import random
from datetime import datetime, timedelta


def random_string():
    return str(random.randint(10000, 99999))


class Bill(BaseModel):
    no = models.CharField(default=random_string, max_length=50, null=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, null=True, blank=False)
    issue_date = models.DateField(null=True, blank=False)
    due_date = models.DateField(null=True, blank=True)
    payment_terms = models.CharField(max_length=50, choices=PaymentStatus, null=True, blank=False)
    prices_are = models.CharField(max_length=50, choices=Prices, null=True, blank=False)
    place_of_supply = models.CharField(max_length=50, choices=Places, null=True, blank=False)
    grand_total = models.FloatField(null=True, blank=True, default=0.0)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True, blank=False)
    with_gst = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return self.no

    class Meta:
        db_table = 'bill'
        verbose_name_plural = 'Bill'

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            if self.payment_terms == "7":
                date = self.issue_date + timedelta(days=7)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "10":
                date = self.issue_date + timedelta(days=10)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "15":
                date = self.issue_date + timedelta(days=15)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "30":
                date = self.issue_date + timedelta(days=30)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "45":
                date = self.issue_date + timedelta(days=45)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "60":
                date = self.issue_date + timedelta(days=60)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "90":
                date = self.issue_date + timedelta(days=90)
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            elif self.payment_terms == "Due on Receipt":
                date = self.issue_date
                self.due_date = date
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
            else:
                bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                                   update_fields=None)
        else:
            bill_save = super(Bill, self).save(force_insert=False, force_update=False, using=None,
                                               update_fields=None)
        return bill_save


class BillLines(BaseModel):
    bill = models.ForeignKey(Bill, null=True, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=False)
    description = models.TextField(null=True, blank=True)
    uom = models.CharField(choices=TypeUOM, max_length=20, null=True, blank=False)
    quantity = models.PositiveIntegerField(default=1, null=True, blank=False)
    purchase_rate = models.FloatField(null=True, blank=True, default=0.0)
    discount = models.PositiveIntegerField(null=True, blank=False,
                                           default=0, validators=[MaxValueValidator(100), MinValueValidator(0)])
    tax = models.CharField(choices=TaxType, max_length=50, null=True, blank=False)

    class Meta:
        db_table = 'bill_lines'
        verbose_name_plural = 'Bill Lines'

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            if self.tax == '0':
                company = list(Bill.objects.filter(no=self.bill).values('company'))
                count = Bill.objects.filter(company_id=company[0].get('company'), with_gst=False).count()
                Bill.objects.filter(no=self.bill).update(number=count + 1, with_gst=False)
                bill_save = super(BillLines, self).save(force_insert=False, force_update=False, using=None,
                                                        update_fields=None)
            elif not self.tax == '0':
                company = list(Bill.objects.filter(no=self.bill).values('company'))
                count = Bill.objects.filter(company_id=company[0].get('company'), with_gst=True).count()
                print(count)
                Bill.objects.filter(no=self.bill).update(number=count + 1, with_gst=True)
                bill_save = super(BillLines, self).save(force_insert=False, force_update=False, using=None,
                                                        update_fields=None)
            else:
                bill_save = super(BillLines, self).save(force_insert=False, force_update=False, using=None,
                                                        update_fields=None)
        else:
            bill_save = super(BillLines, self).save(force_insert=False, force_update=False, using=None,
                                                    update_fields=None)
        return bill_save


class PurchaseOrder(BaseModel):
    no = models.CharField(default=random_string, max_length=50, null=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, null=True, blank=False)
    issue_date = models.DateField(null=True, blank=False)
    due_date = models.DateField(null=True, blank=True)
    payment_terms = models.CharField(max_length=50, choices=PaymentStatus, null=True, blank=False)
    prices_are = models.CharField(max_length=50, choices=Prices, null=True, blank=False)
    place_of_supply = models.CharField(max_length=50, choices=Places, null=True, blank=False)
    grand_total = models.FloatField(null=True, blank=True, default=0.0)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True, blank=False)
    with_gst = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return self.no

    class Meta:
        db_table = 'purchase_order'
        verbose_name_plural = 'Purchase Order'

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            if self.payment_terms == "7":
                date = self.issue_date + timedelta(days=7)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "10":
                date = self.issue_date + timedelta(days=10)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "15":
                date = self.issue_date + timedelta(days=15)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "30":
                date = self.issue_date + timedelta(days=30)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "45":
                date = self.issue_date + timedelta(days=45)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "60":
                date = self.issue_date + timedelta(days=60)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "90":
                date = self.issue_date + timedelta(days=90)
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            elif self.payment_terms == "Due on Receipt":
                date = self.issue_date
                self.due_date = date
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
            else:
                purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                                update_fields=None)
        else:
            purchase_save = super(PurchaseOrder, self).save(force_insert=False, force_update=False, using=None,
                                                            update_fields=None)
        return purchase_save


class PurchaseOrderLines(BaseModel):
    purchase_order = models.ForeignKey(PurchaseOrder, null=True, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=False)
    description = models.TextField(null=True, blank=True)
    uom = models.CharField(choices=TypeUOM, max_length=20, null=True, blank=False)
    quantity = models.PositiveIntegerField(default=1, null=True, blank=False)
    purchase_rate = models.FloatField(null=True, blank=True, default=0.0)
    discount = models.PositiveIntegerField(null=True, blank=False,
                                           default=0, validators=[MaxValueValidator(100), MinValueValidator(0)])
    tax = models.CharField(choices=TaxType, max_length=50, null=True, blank=False)

    class Meta:
        db_table = 'purchase_order_lines'
        verbose_name_plural = 'PurchaseOrder Lines'

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            if self.tax == '0':
                company = list(PurchaseOrder.objects.filter(no=self.purchase_order).values('company'))
                count = PurchaseOrder.objects.filter(company_id=company[0].get('company'), with_gst=False).count()
                PurchaseOrder.objects.filter(no=self.purchase_order).update(number=count + 1, with_gst=False)
                purchase_order_save = super(PurchaseOrderLines, self).save(force_insert=False, force_update=False,
                                                                           using=None,
                                                                           update_fields=None)
            elif not self.tax == '0':
                company = list(PurchaseOrder.objects.filter(no=self.purchase_order).values('company'))
                count = PurchaseOrder.objects.filter(company_id=company[0].get('company'), with_gst=True).count()
                print(count)
                PurchaseOrder.objects.filter(no=self.purchase_order).update(number=count + 1, with_gst=True)
                purchase_order_save = super(PurchaseOrderLines, self).save(force_insert=False, force_update=False,
                                                                           using=None,
                                                                           update_fields=None)
            else:
                purchase_order_save = super(PurchaseOrderLines, self).save(force_insert=False, force_update=False,
                                                                           using=None,
                                                                           update_fields=None)
        else:
            purchase_order_save = super(PurchaseOrderLines, self).save(force_insert=False, force_update=False,
                                                                       using=None,
                                                                       update_fields=None)
        return purchase_order_save
