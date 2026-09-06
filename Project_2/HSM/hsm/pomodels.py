from django.db import models
from .models import BaseModel, ResState, ResCountry, ResPartner, ResPartnerType
import random


class ResProductCategory(BaseModel):
    name = models.CharField(max_length=50, null=True, blank=False)
    description = models.TextField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'res_product_category'
        verbose_name_plural = 'Product Category'


def random_string():
    return str(random.randint(10000, 99999))


class ResProductDetail(BaseModel):
    STOCKABLE = "Stockable"
    CONSUMABLE = "Consumable"
    SERVICE = "Services"
    TYPE_CHOICES = (
        (STOCKABLE, "Stockable"),
        (CONSUMABLE, "Consumable"),
        (SERVICE, "Services"),
    )
    product_no = models.CharField(default=random_string, max_length=50, null=True, blank=False)
    name = models.CharField(max_length=50, null=True, blank=False)
    category = models.ForeignKey(ResProductCategory, null=True, blank=False, on_delete=models.CASCADE)
    type = models.CharField(choices=TYPE_CHOICES, max_length=20, null=True, blank=False)
    description = models.TextField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'res_product_detail'
        verbose_name_plural = 'Product Detail'


class OnlyVendorManager(models.Manager):
    def get_queryset(self):
        return super(OnlyVendorManager, self).get_queryset().filter(partner_type__name='Vendor')


class ResVendorDetail(ResPartner):
    objects = OnlyVendorManager()

    def __str__(self):
        return self.name

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.pk is None:
            partner_type_id = ResPartnerType.objects.get(name='Vendor')
            partner_obj = ResPartner.objects.create(name=self.name, partner_type=partner_type_id)
            self.partner = partner_obj
        res = super(ResVendorDetail, self).save(force_insert=False, force_update=False, using=None, update_fields=None)
        return res

    class Meta:
        verbose_name_plural = 'Vendor Detail'
        proxy = True
