from django.contrib import admin
from .enquiry import *
from .dayBook import *
from .company_data import *
from .purchase_and_bill import *
from .product import *
from .amc import *
from .employee_data import *
from .service import *
from django.urls import path, reverse
from django.utils.html import format_html
from SMdashboard import reports
from .quotation import Quotation, Quotation_lines
from .invoice import Invoice, InvoiceLines
from .purchase_and_bill import Bill, BillLines, PurchaseOrder, PurchaseOrderLines
from .bill_of_supply import BillOfSupply, BillOfSupplyLines
from .payment_document import PaymentDocument
from .inventory import Inventory

admin.site.site_header = 'Storeck'
admin.site.site_title = 'Storeck'
admin.site.index_title = 'Storeck Administration'


@admin.register(CompanyDetail)
class CompanyDetailAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'address', 'city', 'state', 'pin_code', 'phone',
                    'email_id', 'website', 'GSTIN', 'taxation_type', 'tax_inclusive', 'TIN', 'VAT', 'service_tax_no',
                    'CST_tin_no', 'PAN', 'additional_details', 'currency']
    list_filter = ['name']
    search_fields = ['name']


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_Name', 'TIN', 'email', 'phone', 'billing_address',
                    'billing_zip', 'billing_city', 'billing_state', 'billing_country', 'shipping_address',
                    'shipping_zip', 'shipping_city', 'shipping_state', 'shipping_country', 'details', 'GSTIN',
                    'company']
    list_filter = ['name', 'phone', 'contact_Name', 'company']
    search_fields = ['name', 'phone', 'contact_Name', 'company']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_Name', 'TIN', 'email', 'phone', 'billing_address',
                    'billing_zip', 'billing_city', 'billing_state', 'billing_country', 'shipping_address',
                    'shipping_zip', 'shipping_city', 'shipping_state', 'shipping_country', 'details',
                    'GSTIN', 'PAN', 'balance', 'company']
    list_filter = ['name', 'phone', 'contact_Name', 'company']
    search_fields = ['name', 'phone', 'contact_Name', 'company']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['join_date', 'name', 'type', 'job_profile', 'qualification', 'address', 'city', 'state',
                    'pin_code', 'country', 'mobile_no', 'email_id', 'company']
    list_filter = ['type', 'join_date', 'city', 'state', 'company']
    search_fields = ['name', 'type', 'join_date', 'mobile_no', 'email_id', 'company']


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ['enquiry_date', 'customer_type', 'first_name', 'last_name', 'enquiry_type', 'create_user',
                    'write_user',
                    'product_name', 'price', 'mobile_no', 'email_id', 'create_user',
                    'write_user', 'company']
    list_select_related = ['customer_type', 'enquiry_type']
    list_filter = ['customer_type', 'enquiry_date', 'create_user',
                   'write_user', 'company']
    search_fields = ['first_name', 'enquiry_date', 'mobile_no', 'company']


@admin.register(EnquiryRecord)
class EnquiryRecordAdmin(admin.ModelAdmin):
    list_display = ['enquiryDetails', 'date', 'status', 'comments']
    list_select_related = ['enquiryDetails']
    list_filter = ['enquiryDetails', 'date', 'status']
    search_fields = ['date', 'status']


@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ['service_number', 'date', 'status', 'comment']
    list_select_related = ['service_number']
    list_filter = ['service_number', 'date', 'status']
    search_fields = ['date', 'status']


@admin.register(DayBook)
class DayBookAdmin(admin.ModelAdmin):
    list_display = ['date', 'number', 'name', 'customer_type', 'customer_name', 'employee_name', 'vendor_name',
                    'status', 'credit_amount', 'debit_amount', 'company']
    list_select_related = ['customer_name', 'employee_name', 'vendor_name']
    list_filter = ['customer_type', 'status', 'date', 'company']
    search_fields = ['customer_type', 'status', 'date', 'number', 'company']


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['date', 'service_number', 'client', 'service_type', 'company']
    list_select_related = ['client', 'service_type']
    list_filter = ['service_number', 'date', 'company']
    search_fields = ['service_number', 'date', 'client', 'company']


@admin.register(AMC)
class AMCAdmin(admin.ModelAdmin):
    list_display = ['start_date', 'number', 'client_name', 'end_date', 'company']
    list_filter = ['client_name', 'company']
    search_fields = ['start_date', 'number', 'client_name', 'company']


class QuotationAdminInline(admin.TabularInline):
    model = Quotation_lines
    fieldsets = [
        ('Quotation Lines', {'fields': (
            ('product', 'description', 'uom', 'quantity', 'unit_price', 'discount', 'tax'),
        )}),
    ]
    extra = 1


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ['no', 'number', 'client', 'place_of_supply', 'issue_date', 'due_date', 'clean_amount',
                    'discount_amount', 'tax_amount', 'grand_total', 'company',
                    'centralGst', 'stateGst', 'internationalGst', 'gst','rounded_off_value', 'grand_total_without_round']
    list_filter = ['client', 'company', 'gst']
    search_fields = ['number', 'client']
    inlines = [QuotationAdminInline]

    fieldsets = [
        ('Quotation Details', {'fields': (
            ('no'),
            ('number', 'issue_date', 'due_date'),
            ('client', 'ship_to', 'place_of_supply'),
            ('clean_amount', 'discount_amount', 'tax_amount', 'grand_total'),
            ('centralGst', 'stateGst', 'internationalGst'),
            ('company', 'gst'),
            ('rounded_off_value', 'grand_total_without_round'),
        ), }),
    ]


class InvoiceAdminInline(admin.TabularInline):
    model = InvoiceLines
    fieldsets = [
        ('InvoiceLines', {'fields': (
            ('product', 'description', 'uom', 'quantity', 'unit_price', 'discount', 'tax'),
        )}),
    ]
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['no', 'number', 'client', 'place_of_supply', 'issue_date', 'due_date', 'clean_amount',
                    'discount_amount', 'tax_amount', 'grand_total', 'company',
                    'with_gst', 'centralGst', 'stateGst', 'internationalGst', 'gst', 'rounded_off_value', 'grand_total_without_round']
    list_filter = ['client', 'company', 'with_gst']
    search_fields = ['number', 'client', 'place_of_supply']
    inlines = [InvoiceAdminInline]

    fieldsets = [
        ('Invoice Details', {'fields': (
            ('no'),
            ('number', 'issue_date', 'due_date'),
            ('client', 'ship_to', 'place_of_supply'),
            ('payment_terms', 'clean_amount', 'discount_amount', 'tax_amount', 'grand_total'),
            ('centralGst', 'stateGst', 'internationalGst'),
            ('company', 'with_gst', 'gst'),
            ('rounded_off_value', 'grand_total_without_round'),
        ), }),
    ]


class BillAdminInLine(admin.TabularInline):
    model = BillLines
    fieldsets = [
        ('BillLines', {'fields': (
            ('product', 'description', 'uom', 'quantity', 'purchase_rate', 'discount', 'tax'),
        )}),
    ]
    extra = 1


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['no', 'number', 'vendor', 'place_of_supply', 'issue_date', 'due_date', 'grand_total', 'company',
                    'with_gst']
    list_filter = ['vendor', 'company', 'with_gst']
    search_fields = ['number', 'vendor', 'place_of_supply']
    inlines = [BillAdminInLine]

    fieldsets = [
        ('Bill Details', {'fields': (
            ('no'),
            ('number', 'issue_date', 'due_date'),
            ('vendor', 'place_of_supply'),
            ('payment_terms', 'grand_total'),
            ('company', 'with_gst'),

        ), }),
    ]


class PurchaseOrderAdminInLine(admin.TabularInline):
    model = PurchaseOrderLines
    fieldsets = [
        ('PurchaseOrderLines', {'fields': (
            ('product', 'description', 'uom', 'quantity', 'purchase_rate', 'discount', 'tax'),
        )}),
    ]
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['no', 'number', 'vendor', 'place_of_supply', 'issue_date', 'due_date', 'grand_total', 'company',
                    'with_gst']
    list_filter = ['vendor', 'company', 'with_gst']
    search_fields = ['number', 'vendor', 'place_of_supply']
    inlines = [PurchaseOrderAdminInLine]

    fieldsets = [
        ('PurchaseOrder Details', {'fields': (
            ('no'),
            ('number', 'issue_date', 'due_date'),
            ('vendor', 'place_of_supply'),
            ('payment_terms', 'grand_total'),
            ('company', 'with_gst'),

        ), }),
    ]


class BillOfSupplyAdminInline(admin.TabularInline):
    model = BillOfSupplyLines
    fieldsets = [
        ('BillLines', {'fields': (
            ('product', 'description', 'uom', 'quantity', 'unit_price', 'discount', 'tax'),
        )}),
    ]
    extra = 1


@admin.register(BillOfSupply)
class BillOfSupplyAdmin(admin.ModelAdmin):
    list_display = ['number', 'client', 'place_of_supply', 'issue_date', 'due_date', 'clean_amount',
                    'discount_amount', 'tax_amount', 'grand_total', 'company',
                    'centralGst', 'stateGst', 'internationalGst', 'gst', 'rounded_off_value', 'grand_total_without_round']
    search_fields = ['number', 'client']
    list_filter = ['client', 'company']
    inlines = [BillOfSupplyAdminInline]

    fieldsets = [
        ('Bill Of Supply Details', {'fields': (
            ('number', 'issue_date', 'due_date'),
            ('client', 'ship_to', 'place_of_supply'),
            ('payment_terms', 'clean_amount', 'discount_amount', 'tax_amount', 'grand_total'),
            ('centralGst', 'stateGst', 'internationalGst'),
            ('company', 'gst'),
            ('rounded_off_value', 'grand_total_without_round'),
        ), }),
    ]


admin.site.register(CostumerType)
admin.site.register(EnquiryType)
admin.site.register(ServiceType)
admin.site.register(AMCRecord)
admin.site.register(Product)
admin.site.register(InvoiceLines)
admin.site.register(BillLines)
admin.site.register(PurchaseOrderLines)
admin.site.register(ServiceStoreData)
admin.site.register(PaymentDocument)
admin.site.register(Inventory)
admin.site.register(Quotation_lines)
admin.site.register(BillOfSupplyLines)

