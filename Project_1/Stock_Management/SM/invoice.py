from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone
from .models import BaseModel
from .company_data import CompanyDetail, Client
from .product import Product
from .choices import Places, PaymentStatus, Prices, TaxType, TypeUOM, WithGstOrNot
import random
from datetime import datetime, timedelta


def random_string():
    return str(random.randint(10000, 99999))



class Invoice(BaseModel):
    no = models.CharField(default=random_string, max_length=50, null=True)
    number = models.CharField(null=True, blank=True, max_length=100)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    ship_to = models.TextField(null=True, blank=False, max_length=250)
    place_of_supply = models.CharField(null=True, blank=False, max_length=100)
    issue_date = models.DateTimeField(default=timezone.now, null=True, blank=False)
    payment_terms = models.CharField(max_length=50, choices=PaymentStatus, null=True, blank=False)
    due_date = models.DateTimeField(null=True, blank=True)
    clean_amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    discount_amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    tax_amount = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    grand_total = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    rounded_off_value = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    grand_total_without_round = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True,blank=True)
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True, blank=False)
    with_gst = models.BooleanField(null=True, blank=True)
    gst = models.CharField(choices=WithGstOrNot, max_length=20, null=True, blank=False)
    centralGst = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    stateGst = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)
    internationalGst = models.DecimalField(decimal_places=2, max_digits=10, default=0.00, null=True, blank=True)

    def __str__(self):
        return self.no

    class Meta:
        db_table = 'invoice'
        verbose_name_plural = 'Invoice'

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            if self.payment_terms == "7":
                date = self.issue_date + timedelta(days=7)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "10":
                date = self.issue_date + timedelta(days=10)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "15":
                date = self.issue_date + timedelta(days=15)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "30":
                date = self.issue_date + timedelta(days=30)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "45":
                date = self.issue_date + timedelta(days=45)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "60":
                date = self.issue_date + timedelta(days=60)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "90":
                date = self.issue_date + timedelta(days=90)
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            elif self.payment_terms == "0":
                date = self.issue_date
                self.due_date = date
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
            else:
                invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                         update_fields=None)
        else:
            invoice_save = super(Invoice, self).save(force_insert=False, force_update=False, using=None,
                                                     update_fields=None)
        return invoice_save


class InvoiceLines(BaseModel):
    invoice = models.ForeignKey(Invoice, null=True, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=False)
    description = models.TextField(null=True, blank=True)
    uom = models.CharField(choices=TypeUOM, max_length=20, null=True, blank=False)
    quantity = models.PositiveIntegerField(default=1, null=True, blank=False)
    unit_price = models.FloatField(null=True, blank=False, default=0.0)
    discount = models.PositiveIntegerField(null=True, blank=False,
                                           default=0, validators=[MaxValueValidator(100), MinValueValidator(0)])
    tax = models.CharField(choices=TaxType, default=0, max_length=50, null=True, blank=False)

    class Meta:
        db_table = 'Invoice_Lines'
        verbose_name_plural = 'Invoice Lines'

    # def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
    #
    #     print(self.pk)
    #     if self.pk is None:
    #
    #         if self.tax == '0':
    #             company = list(Invoice.objects.filter(no=self.invoice).values('company'))
    #             count = Invoice.objects.filter(company_id=company[0].get('company'), with_gst=False).count()
    #             print("in model")
    #             print(count)
    #             print("in model")
    #
    #             Invoice.objects.filter(no=self.invoice).update(number=count + 1, with_gst=False)
    #
    #             invoice_save = super(InvoiceLines, self).save(force_insert=False, force_update=False, using=None,
    #                                                                       update_fields=None)
    #         elif not self.tax == '0':
    #             company = list(Invoice.objects.filter(no=self.invoice).values('company'))
    #             count = Invoice.objects.filter(company_id=company[0].get('company'), with_gst=True).count()
    #
    #             Invoice.objects.filter(no=self.invoice).update(number=count + 1, with_gst=True)
    #             invoice_save = super(InvoiceLines, self).save(force_insert=False, force_update=False, using=None,
    #                                                                       update_fields=None)
    #         else:
    #             invoice_save = super(InvoiceLines, self).save(force_insert=False, force_update=False, using=None,
    #                                                                       update_fields=None)
    #
    #     else:
    #         invoice_save = super(InvoiceLines, self).save(force_insert=False, force_update=False, using=None,
    #                                                       update_fields=None)
    #     return invoice_save
