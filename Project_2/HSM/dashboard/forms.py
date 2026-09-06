from django import forms
from hsm import society
from hsm import helpdesk
from hsm import POMaker
from ckeditor_uploader.widgets import CKEditorUploadingWidget


class PurchaseForm(forms.ModelForm):
    class Meta:
        model = POMaker.PurchaseOrderMaker
        fields = ['purchase_order_no', 'date', 'vendor', 'special_instructions']
        widgets = {
            'purchase_order_no': forms.TextInput(attrs={'class': 'form-control'}),
            'date': forms.TextInput(attrs={'class': 'form-control'}),
            'vendor': forms.Select(attrs={'class': 'form-control'}),
            'special_instructions': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control'}),
        }


class PurchaseLineForm(forms.ModelForm):
    class Meta:
        model = POMaker.PurchaseOrderLine
        fields = ['product', 'quantity', 'product_unit_price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control'}),
            'product_unit_price': forms.NumberInput(attrs={'class': 'form-control'}),
        }


class ComplaintForm(forms.ModelForm):
    class Meta:
        model = helpdesk.Complaint
        exclude = ['status_type', 'reply', 'user']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'complaint_type': forms.Select(attrs={'class': 'form-control'}),
            'comment': forms.Textarea(attrs={'rows': 3, 'cols': 58, 'class': 'form-control'}),
        }


class NoticeForm(forms.ModelForm):
    class Meta:
        model = society.Notice
        fields = ['title', 'description']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.CharField(widget=CKEditorUploadingWidget()),
        }
