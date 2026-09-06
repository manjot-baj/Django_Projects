import os
from django import forms
from SM import enquiry, employee_data, service, dayBook, company_data, amc, quotation, invoice, bill_of_supply
import datetime


class ClientForm(forms.Form):
    input_excel = forms.FileField(required=True, label=u"Upload the Excel file to import to the system.")

    def clean_input_excel(self):
        input_excel = self.cleaned_data['input_excel']
        print(input_excel.name)
        IMPORT_FILE_TYPES = ['.xls', ]
        FILE_NAME = ['Clients', ]
        extension = os.path.splitext(input_excel.name)[1]
        extension2 = os.path.splitext(input_excel.name)[0]
        print(extension2)
        if not (extension in IMPORT_FILE_TYPES) or not (extension2 in FILE_NAME):
            raise forms.ValidationError(
                u'%s is not a valid excel file or the correct file for import.'
                u' Please make sure your input file is a correct excel file' % extension)
        else:
            return input_excel


class ClientAddForm(forms.ModelForm):
    class Meta:
        model = company_data.Client

        fields = ['name', 'contact_Name', 'TIN', 'email', 'phone', 'billing_address', 'billing_zip', 'billing_city',
                  'billing_state', 'billing_country', 'shipping_address', 'shipping_zip', 'shipping_city',
                  'shipping_state', 'shipping_country', 'details', 'GSTIN', 'PAN', 'balance'
                  ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'contact_Name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'TIN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'phone': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_address': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_zip': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_address': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_zip': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'details': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'GSTIN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'PAN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'balance': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),

        }


class ClientEditForm(forms.ModelForm):
    class Meta:
        model = company_data.Client

        fields = ['name', 'contact_Name', 'TIN', 'email', 'phone', 'billing_address', 'billing_zip', 'billing_city',
                  'billing_state', 'billing_country', 'shipping_address', 'shipping_zip', 'shipping_city',
                  'shipping_state', 'shipping_country', 'details', 'GSTIN', 'PAN', 'balance'
                  ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'contact_Name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'TIN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'phone': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_address': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_zip': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_address': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_zip': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'details': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'GSTIN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'PAN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'balance': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),

        }


# class ProductForm(forms.Form):
#     input_excel = forms.FileField(required=True, label=u"Upload the Excel file to import to the system.")
#
#     def clean_input_excel(self):
#         input_excel = self.cleaned_data['input_excel']
#         print(input_excel.name)
#         IMPORT_FILE_TYPES = ['.xls', ]
#         FILE_NAME = ['Products_and_services', ]
#         extension = os.path.splitext(input_excel.name)[1]
#         extension2 = os.path.splitext(input_excel.name)[0]
#         print(extension2)
#         if not (extension in IMPORT_FILE_TYPES) or not (extension2 in FILE_NAME):
#             raise forms.ValidationError(
#                 u'%s is not a valid excel file or the correct file for import.'
#                 u' Please make sure your input file is a correct excel file' % extension)
#         else:
#             return input_excel


class VendorForm(forms.Form):
    input_excel = forms.FileField(required=True, label=u"Upload the Excel file to import to the system.")

    def clean_input_excel(self):
        input_excel = self.cleaned_data['input_excel']
        print(input_excel.name)
        IMPORT_FILE_TYPES = ['.xls', ]
        FILE_NAME = ['Vendors', ]
        extension = os.path.splitext(input_excel.name)[1]
        extension2 = os.path.splitext(input_excel.name)[0]
        print(extension2)
        if not (extension in IMPORT_FILE_TYPES) or not (extension2 in FILE_NAME):
            raise forms.ValidationError(
                u'%s is not a valid excel file or the correct file for import.'
                u' Please make sure your input file is a correct excel file' % extension)
        else:
            return input_excel


class VendorAddForm(forms.ModelForm):
    class Meta:
        model = company_data.Vendor

        fields = [
            'name', 'contact_Name', 'TIN', 'email', 'phone', 'billing_address', 'billing_zip', 'billing_city',
            'billing_state', 'billing_country', 'shipping_address', 'shipping_zip', 'shipping_city', 'shipping_state',
            'shipping_country', 'details', 'GSTIN'
        ]

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'contact_Name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'TIN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'phone': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_address': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_zip': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'billing_country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_address': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_zip': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'shipping_country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'details': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'GSTIN': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
        }


class EnquiryForm(forms.ModelForm):
    class Meta:
        model = enquiry.Enquiry
        fields = ['first_name', 'last_name', 'customer_type', 'address', 'enquiry_type', 'product_name',
                  'description', 'price', 'mobile_no', 'email_id']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'customer_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'address': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'enquiry_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'product_name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'price': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'mobile_no': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email_id': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
        }


class EnquiryEditForm(forms.ModelForm):
    class Meta:
        model = enquiry.Enquiry
        fields = ['first_name', 'last_name', 'customer_type', 'address', 'enquiry_type', 'product_name',
                  'description', 'price', 'mobile_no', 'email_id']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'customer_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'address': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'enquiry_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'product_name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'price': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'mobile_no': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email_id': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
        }


class EnquiryReplyForm(forms.ModelForm):
    class Meta:
        model = enquiry.EnquiryRecord
        fields = ['status', 'comments']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'comments': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control form-control-sm'}),
        }


class DayBookForm(forms.ModelForm):
    class Meta:
        model = dayBook.DayBook
        fields = ['number', 'date', 'customer_type', 'name', 'customer_name', 'employee_name', 'vendor_name',
                  'description', 'status', 'credit_amount', 'debit_amount']
        widgets = {
            'number': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'date': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'customer_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'customer_name': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'employee_name': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'vendor_name': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'status': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'credit_amount': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'debit_amount': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
        }


class DayBookEditForm(forms.ModelForm):
    class Meta:
        model = dayBook.DayBook
        fields = ['number', 'date', 'customer_type', 'name', 'customer_name', 'employee_name', 'vendor_name',
                  'description', 'status', 'credit_amount', 'debit_amount']
        widgets = {
            'number': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'date': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'customer_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'customer_name': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'employee_name': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'vendor_name': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'status': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'credit_amount': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'debit_amount': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
        }


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = employee_data.Employee
        fields = ['photo', 'join_date', 'name', 'address', 'city', 'state', 'pin_code', 'country', 'mobile_no',
                  'email_id',
                  'qualification', 'type', 'job_profile', 'job_description',
                  ]
        widgets = {
            'join_date': forms.widgets.DateInput(attrs={'type': 'date', 'class': 'form-control form-control-sm'}),
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'address': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'pin_code': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'mobile_no': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email_id': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'qualification': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm '}),
            'type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'job_profile': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'job_description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
        }


class EmployeeEditForm(forms.ModelForm):
    class Meta:
        model = employee_data.Employee
        fields = ['join_date', 'name', 'address', 'city', 'state', 'pin_code', 'country', 'mobile_no',
                  'email_id',
                  'qualification', 'type', 'job_profile', 'job_description',
                  ]
        widgets = {
            'join_date': forms.widgets.DateInput(attrs={'type': 'date', 'class': 'form-control form-control-sm'}),
            'name': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'address': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'city': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'state': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'pin_code': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'country': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'mobile_no': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'email_id': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'qualification': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm '}),
            'type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'job_profile': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'job_description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
        }


class ServiceForm(forms.ModelForm):
    class Meta:
        model = service.Service
        fields = [
            'service_number', 'date', 'client', 'service_type', 'description', 'photo'
        ]

        widgets = {
            'service_number': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'date': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'client': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'service_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
        }


class ServiceEditForm(forms.ModelForm):
    class Meta:
        model = service.Service
        fields = [
            'service_number', 'date', 'client', 'service_type', 'description'
        ]

        widgets = {
            'service_number': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'date': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'client': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'service_type': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),

        }


class ServiceReplyForm(forms.ModelForm):
    class Meta:
        model = service.ServiceRecord
        fields = [
            'photo', 'status', 'comment'
        ]
        Widgets = {
            'status': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'comment': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
        }


class AMC_Form(forms.ModelForm):
    class Meta:
        model = amc.AMC
        fields = [
            'number', 'description', 'start_date'
        ]
        widgets = {
            'number': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 58, 'class': 'form-control form-control-sm'}),
            'start_date': forms.widgets.DateInput(attrs={'type': 'date', 'class': 'form-control form-control-sm'}),
        }


class QuotationForm(forms.ModelForm):
    class Meta:
        model = quotation.Quotation

        fields = ['issue_date', 'client', 'ship_to', 'place_of_supply', 'gst', 'centralGst',
                  'stateGst', 'internationalGst']

        widgets = {
            'issue_date': forms.widgets.DateInput(attrs={'type': 'date', 'class': 'form-control form-control-sm'}),
            'client': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'ship_to': forms.Textarea(attrs={'rows': 10, 'cols': 60, 'class': 'form-control-sm'}),
            'place_of_supply': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),

            'gst': forms.Select(attrs={'class': 'form-control form-control-sm'}),
        }


class QuotationLineForm(forms.ModelForm):
    class Meta:
        model = quotation.Quotation_lines

        fields = ['product', 'description', 'uom', 'quantity', 'unit_price', 'discount', 'tax']

        widgets = {
            'product': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 30, 'class': 'form-control-sm'}),
            'uom': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control-sm', 'required': True}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control-sm', 'min': 0.0, 'step': 0.01,
                                                   'required': True}),
            'discount': forms.NumberInput(attrs={'class': 'form-control-sm', 'required': True}),
            'tax': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
        }


data = {
    'form-TOTAL_FORMS': '1',
    'form-INITIAL_FORMS': '0',
    'form-MAX_NUM_FORMS': '',
}

QuotationLineFormSet = forms.formset_factory(QuotationLineForm)
QuotationLineFormSetData = QuotationLineFormSet(data)


class InvoiceForm(forms.ModelForm):
    class Meta:
        model = invoice.Invoice

        fields = ['issue_date', 'client', 'ship_to', 'place_of_supply', 'payment_terms', 'gst', 'centralGst', 'stateGst', 'internationalGst']

        widgets = {
            'issue_date': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'client': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'ship_to': forms.Textarea(attrs={'rows': 10, 'cols': 60, 'class': 'form-control-sm'}),
            'place_of_supply': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'payment_terms': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'gst': forms.Select(attrs={'class': 'form-control form-control-sm'}),
        }


class InvoiceLineForm(forms.ModelForm):
    class Meta:
        model = invoice.InvoiceLines

        fields = ['product', 'description', 'uom', 'quantity', 'unit_price', 'discount', 'tax']

        widgets = {
            'product': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 30, 'class': 'form-control-sm'}),
            'uom': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control-sm', 'required': True}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control-sm', 'min': 0.0, 'step': 0.01,
                                                   'required': True}),
            'discount': forms.NumberInput(attrs={'class': 'form-control-sm', 'required': True}),
            'tax': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
        }


data = {
    'form-TOTAL_FORMS': '1',
    'form-INITIAL_FORMS': '0',
    'form-MAX_NUM_FORMS': '',
}

InvoiceLineFormSet = forms.formset_factory(InvoiceLineForm)
InvoiceLineFormSetData = InvoiceLineFormSet(data)

class BillOfSupplyForm(forms.ModelForm):
    class Meta:
        model = bill_of_supply.BillOfSupply

        fields = ['issue_date', 'client', 'ship_to', 'place_of_supply', 'payment_terms', 'gst', 'centralGst',
                  'stateGst', 'internationalGst']

        widgets = {
            'issue_date': forms.HiddenInput(attrs={'class': 'form-control-sm'}),
            'client': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'ship_to': forms.Textarea(attrs={'rows': 10, 'cols': 60, 'class': 'form-control-sm'}),
            'place_of_supply': forms.TextInput(attrs={'class': 'form-control form-control-sm'}),
            'payment_terms': forms.Select(attrs={'class': 'form-control form-control-sm'}),
            'gst': forms.Select(attrs={'class': 'form-control form-control-sm'}),
        }

class BillOfSupplyLineForm(forms.ModelForm):
    class Meta:
        model = bill_of_supply.BillOfSupplyLines

        fields = ['product', 'description', 'uom', 'quantity', 'unit_price', 'discount', 'tax']

        widgets = {
            'product': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 30, 'class': 'form-control-sm'}),
            'uom': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control-sm', 'required': True}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control-sm', 'min': 0.0, 'step': 0.01,
                                                   'required': True}),
            'discount': forms.NumberInput(attrs={'class': 'form-control-sm', 'required': True}),
            'tax': forms.Select(attrs={'class': 'form-control form-control-sm', 'required': True}),
        }

data = {
    'form-TOTAL_FORMS': '1',
    'form-INITIAL_FORMS': '0',
    'form-MAX_NUM_FORMS': '',
}
BillOfSupplyLineFormSet = forms.formset_factory(BillOfSupplyLineForm)

BillOfSupplyLineFormSetData = BillOfSupplyLineFormSet(data)

