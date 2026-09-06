from django.db import models
from django.utils import timezone
from .models import BaseModel
from .company_data import CompanyDetail
from .employee_data import Employee


class CostumerType(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class EnquiryType(BaseModel):
    name = models.CharField(max_length=100, null=True, blank=False)

    def __str__(self):
        return self.name


class Enquiry(BaseModel):
    first_name = models.CharField(max_length=100, null=True, blank=False, )
    last_name = models.CharField(max_length=100, null=True, blank=True, )
    customer_type = models.ForeignKey(CostumerType, on_delete=models.CASCADE, null=True, blank=False)
    address = models.TextField(max_length=200, null=True, blank=False, )
    enquiry_date = models.DateTimeField(default=timezone.now, null=True, blank=True)
    enquiry_type = models.ForeignKey(EnquiryType, on_delete=models.CASCADE, null=True, blank=False)

    product_name = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    price = models.CharField(max_length=100, null=True, blank=True)
    mobile_no = models.CharField(max_length=15, null=True, blank=False, )
    email_id = models.CharField(max_length=50, null=True, blank=True, )
    company = models.ForeignKey(CompanyDetail, on_delete=models.SET_NULL, null=True,
                                blank=True)

    def __str__(self):
        # return 'Name : {0},  Enquiry_For:{1},  Date : {2}'.format(self.first_name, self.enquiry_type,
        # self.enquiry_date)
        return self.first_name


class EnquiryRecord(BaseModel):
    enquiryDetails = models.ForeignKey(Enquiry, on_delete=models.CASCADE, null=True, blank=False, )
    date = models.DateTimeField(default=timezone.now, null=True, blank=False)
    statusType = (
        ("Pending", "Pending"),
        ("OnProgress", "OnProgress"),
        ("Completed", "Completed")

    )
    status = models.CharField(max_length=32, choices=statusType, null=True, blank=True)
    comments = models.TextField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.enquiryDetails
