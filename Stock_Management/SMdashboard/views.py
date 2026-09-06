from django.contrib.auth.models import User
from django.db.models.functions import Coalesce, Concat
from braces.views import GroupRequiredMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from SM.company_data import Client, Vendor, CompanyDetail
import xlrd
from django.shortcuts import render, redirect
from django.views.generic import ListView, View
from django.db.models import (Case, CharField, Count, DateTimeField,
                              ExpressionWrapper, F, FloatField, Func, Max, Min,
                              Prefetch, Q, Sum, Value, When, Subquery)
from SM import enquiry, employee_data, service, dayBook, product, amc, product, quotation
from django.utils import timezone
import http.client
import json
import datetime


from .forms import QuotationForm, QuotationLineForm, QuotationLineFormSet, QuotationLineFormSetData, \
    InvoiceForm, InvoiceLineForm, InvoiceLineFormSet, InvoiceLineFormSetData, \
    BillOfSupplyForm, BillOfSupplyLineForm, BillOfSupplyLineFormSet, BillOfSupplyLineFormSetData
from SM.quotation import Quotation, Quotation_lines
from SM.invoice import Invoice, InvoiceLines
from SM.product import Product
from SM.bill_of_supply import BillOfSupply, BillOfSupplyLines
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.db.models import Value as V

import inflect


conn = http.client.HTTPSConnection("api.msg91.com")
OWNER_GROUP = "Owner"


@csrf_exempt
def getProductPrice(request):
    # objId = request.POST.get('id')
    product_name = request.POST.get('product_name')
    print(product_name)
    test = product.Product.objects.filter(pk=product_name, company_id=request.session.get('company_id')).values(
        'unit_price')
    print(test)
    return JsonResponse(test, safe=False)


class OwnerRequiredMinxin(GroupRequiredMixin):
    group_required = OWNER_GROUP
    login_url = 'login'


class Dashboard(View):
    login_required = False
    login_template = 'SMdashboard/login.html'
    dashboard_template = 'SMdashboard/dashboard.html'

    def dashboard_info(self, request):
        print(request.session.get('company_id'))
        company_info = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk', 'name').annotate(

            company_address=Concat(
                F('address'), Value(', '), F('city'), Value(', '),
                F('state'), Value(', '),
                F('pin_code'), Value(', '), F('country'),
                Value(', '), F('phone'), Value(', '), F('email_id'),
                Value(', '), F('website'),
                output_field=CharField())
        )
        company = list(company_info)
        client_info = Client.objects.filter(company_id=request.session.get('company_id')).count()
        context = {"client": client_info}
        vendor_info = Vendor.objects.filter(company_id=request.session.get('company_id')).count()
        context.update({"vendor": vendor_info})
        employee_info = employee_data.Employee.objects.filter(company_id=request.session.get('company_id')).count()
        context.update({"employee": employee_info})
        # product_info = product.Product.objects.filter(company_id=request.session.get('company_id')).count()
        # context.update({"product": product_info})
        today_min = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
        today_max = datetime.datetime.combine(datetime.date.today(), datetime.time.max)
        dayBook_data = dayBook.DayBook.objects.filter(date__range=(today_min, today_max),
                                                      company_id=request.session.get('company_id')).values(
            'pk').annotate(
            dayBook_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            dayBook_credit_amount=ExpressionWrapper(
                F('credit_amount'), output_field=FloatField()),
            dayBook_debit_amount=ExpressionWrapper(
                F('debit_amount'), output_field=FloatField()),
        )
        dayBook_data2 = dayBook.DayBook.objects.filter(company_id=request.session.get('company_id')).values(
            'pk', 'date').first()
        if dayBook_data2:
            dayBook_data3 = dayBook.DayBook.objects.filter(date__gte=dayBook_data2['date'].date(),
                                                           date__lte=datetime.datetime.today().date(),
                                                           company_id=request.session.get('company_id')).values(
                'pk').annotate(
                dayBook_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                               output_field=CharField()),
                dayBook_credit_amount=ExpressionWrapper(
                    F('credit_amount'), output_field=FloatField()),
                dayBook_debit_amount=ExpressionWrapper(
                    F('debit_amount'), output_field=FloatField()),
            )
            previous_credit_total = []
            previous_debit_total = []
            for i in range(len(dayBook_data3)):
                previous_credit_total.append(dayBook_data3[i].get("dayBook_credit_amount"))
                previous_debit_total.append(dayBook_data3[i].get("dayBook_debit_amount"))
            credited = sum(previous_credit_total)
            debited = sum(previous_debit_total)
            previous_total = credited - debited
            print(dayBook_data3)
            print(previous_total)
            dayBook_data_list = list(dayBook_data)
            credit_total = []
            debit_total = []
            for i in range(len(dayBook_data_list)):
                credit_total.append(dayBook_data_list[i].get("dayBook_credit_amount"))
                debit_total.append(dayBook_data_list[i].get("dayBook_debit_amount"))
            credited = sum(credit_total)
            debited = sum(debit_total)
            present_total = credited - debited
            total = previous_total + present_total
            context.update({'credited': credited, 'debited': debited, 'total': total})

        enquiry_info = enquiry.Enquiry.objects.filter(company_id=request.session.get('company_id')).count()
        context.update({"enquiry": enquiry_info})
        service_info = service.Service.objects.filter(company_id=request.session.get('company_id')).count()
        on_progress = service.Service.objects.filter(status='On progress',
                                                     company_id=request.session.get('company_id')).count()
        completed = service.Service.objects.filter(status='Completed',
                                                   company_id=request.session.get('company_id')).count()
        pending = service.Service.objects.filter(status='Pending',
                                                 company_id=request.session.get('company_id')).count()
        context.update({"service": service_info, 'pending': pending, 'on_progress': on_progress,
                        'completed': completed})
        if not len(company) == 0:
            context.update({"company": company[0]})

        amc_info = amc.AMC.objects.filter(company_id=request.session.get('company_id')).count()
        context.update({"amc_info": amc_info})
        amcToday = list(amc.AMCRecord.objects.filter(date=datetime.datetime.today().date(),
                                                     company_id=request.session.get('company_id')).values("date",
                                                                                                          "client",
                                                                                                          "phone"))
        # print(amcToday)
        if not len(amcToday) == 0:
            context.update({'amcToday': amcToday})
        from .amc_task import amcAlert, amcAlertMonth, amcSms
        # print(amcSms())
        print(f"{request} this is request")
        amc_alert = amcAlert(request)
        this_month_amc = amcAlertMonth(request)
        context.update({'this_month_amc': this_month_amc})
        # print(amc_alert)
        context.update({'amc_alert': amc_alert})
        print(context)
        # print(timezone.now().time())
        return context

    def get(self, request, *args, **kwargs):
        if 'logout' in kwargs:
            logout(request)
            return render(request, self.login_template)
        elif request.user.is_authenticated:
            context = self.dashboard_info(request)
            return render(request, self.dashboard_template, context=context)
        else:
            return render(request, self.login_template)

    def post(self, request, *args, **kwargs):
        if 'login' in kwargs:
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(request, username=username, password=password)
            if user:
                a = login(request, user)
                company = list(CompanyDetail.objects.filter(employee__user=request.user.id).values('pk'))
                request.session['company_id'] = company[0]['pk']
                employee_photo = list(employee_data.Employee.objects.filter(user_id=request.user.id,
                                                                            company_id=request.session.get('company_id')
                                                                            ).annotate(
                    employee=F('name'),
                ))
                for each in employee_photo:
                    request.session['photo'] = each.photo.url
                return redirect(to='dashboard')
            else:
                return render(request, self.login_template)
        else:
            return render(request, self.login_template)


class DashboardLoginRequiredMixin(LoginRequiredMixin):
    login_url = 'login'


class ClientView(DashboardLoginRequiredMixin, ListView):
    from .forms import ClientForm
    dashboard_template = 'SMdashboard/dashboard.html'
    data_template = 'SMdashboard/client-table.html'
    form_template = 'SMdashboard/clientform.html'
    detailed_view = 'SMdashboard/view-client.html'
    form = ClientForm
    model = Client

    def get_data(self, request, company_id=None):
        data = self.model.objects.filter(company_id=company_id).values('pk', 'name').annotate(
            client_contact_Name=Coalesce('contact_Name', Value("-")),
            client_TIN=Coalesce('TIN', Value("-")),
            client_email=Coalesce('email', Value("-")),
            client_phone=Coalesce('phone', Value("-")),
            client_billing_address=Coalesce('billing_address', Value("-")),
            client_billing_zip=Coalesce('billing_zip', Value("-")),
            client_billing_city=Coalesce('billing_city', Value("-")),
            client_billing_state=Coalesce('billing_state', Value("-")),
            client_billing_country=Coalesce('billing_country', Value("-")),
            client_shipping_address=Coalesce('shipping_address', Value("-")),
            client_shipping_zip=Coalesce('shipping_zip', Value("-")),
            client_shipping_city=Coalesce('shipping_city', Value("-")),
            client_shipping_state=Coalesce('shipping_state', Value("-")),
            client_shipping_country=Coalesce('shipping_country', Value("-")),
            client_details=Coalesce('details', Value("-")),
            client_GSTIN=Coalesce('GSTIN', Value("-")),
            client_PAN=Coalesce('PAN', Value("-")),
            client_balance=Coalesce('balance', Value("-")),

        ).order_by("-pk")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'client_form' in kwargs:
            return render(request, self.form_template, {'form': self.form})
        elif 'object_id' in kwargs:
            from .reports import ClientReport
            data = ClientReport().get_data(request, client_id=kwargs.get('object_id'),
                                           company_id=request.session.get('company_id'))
            print(f'check data {data}')
            return render(request, self.detailed_view, data)
        data = self.get_data(request, company_id=request.session.get('company_id'))
        print(data)
        return render(request, self.data_template, {'data': data})

    def post(self, request, *args, **kwargs):
        form = self.ClientForm(request.POST, request.FILES)
        if form.is_valid():
            input_excel = request.FILES['input_excel']
            book = xlrd.open_workbook(file_contents=input_excel.read())
            sheet = book.sheet_by_index(0)
            # data = [[sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)]
            client_name = []
            contact_name = []
            client_tin = []
            email = []
            phone = []
            billing_address = []
            billing_zip = []
            billing_city = []
            billing_state = []
            billing_country = []
            shipping_address = []
            shipping_zip = []
            shipping_city = []
            shipping_state = []
            shipping_country = []
            private_details = []
            gstin = []
            pan = []
            balance = []

            for i in range(sheet.nrows):
                client_name.append(sheet.cell_value(i, 0))
                contact_name.append(sheet.cell_value(i, 1))
                client_tin.append(sheet.cell_value(i, 2))
                email.append(sheet.cell_value(i, 3))
                phone.append(sheet.cell_value(i, 4))
                billing_address.append(sheet.cell_value(i, 5))
                billing_zip.append(sheet.cell_value(i, 6))
                billing_city.append(sheet.cell_value(i, 7))
                billing_state.append(sheet.cell_value(i, 8))
                billing_country.append(sheet.cell_value(i, 9))
                shipping_address.append(sheet.cell_value(i, 10))
                shipping_zip.append(sheet.cell_value(i, 11))
                shipping_city.append(sheet.cell_value(i, 12))
                shipping_state.append(sheet.cell_value(i, 13))
                shipping_country.append(sheet.cell_value(i, 14))
                private_details.append(sheet.cell_value(i, 15))
                gstin.append(sheet.cell_value(i, 16))
                pan.append(sheet.cell_value(i, 17))
                balance.append(sheet.cell_value(i, 18))

            client_name.pop(0)
            contact_name.pop(0)
            client_tin.pop(0)
            email.pop(0)
            phone.pop(0)
            billing_address.pop(0)
            billing_zip.pop(0)
            billing_city.pop(0)
            billing_state.pop(0)
            billing_country.pop(0)
            shipping_address.pop(0)
            shipping_zip.pop(0)
            shipping_city.pop(0)
            shipping_state.pop(0)
            shipping_country.pop(0)
            private_details.pop(0)
            gstin.pop(0)
            pan.pop(0)
            balance.pop(0)

            for i in range(len(client_name)):
                self.model.objects.get_or_create(name=client_name[i], contact_Name=contact_name[i],
                                                 TIN=client_tin[i], email=email[i], phone=phone[i],
                                                 billing_address=billing_address[i], billing_zip=billing_zip[i],
                                                 billing_city=billing_city[i], billing_state=billing_state[i],
                                                 billing_country=billing_country[i],
                                                 shipping_address=shipping_address[i],
                                                 shipping_zip=shipping_zip[i], shipping_city=shipping_city[i],
                                                 shipping_state=shipping_state[i], shipping_country=shipping_country[i],
                                                 details=private_details[i], GSTIN=gstin[i], PAN=pan[i],
                                                 balance=balance[i], company_id=request.session.get('company_id'))
            return redirect(to='client_data')
        return redirect(to='new_client')


class ClientAdd(DashboardLoginRequiredMixin, ListView):
    from .forms import ClientAddForm
    dashboard_template = 'SMdashboard/dashboard.html'
    data_template = 'SMdashboard/client-table.html'
    form_template = 'SMdashboard/clientform-fill.html'
    detailed_view = 'SMdashboard/view-client.html'
    form = ClientAddForm
    model = Client

    def get(self, request, *args, **kwargs):
        if 'client_form_fill' in kwargs:
            return render(request, self.form_template, {'form': self.form})

    def post(self, request, *args, **kwargs):
        form = self.form(request.POST)
        print(form.is_valid())
        print(form)
        if form.is_valid():
            name = form.cleaned_data.get('name')
            contact_Name = form.cleaned_data.get('contact_Name')
            TIN = form.cleaned_data.get('TIN')
            email = form.cleaned_data.get('email')
            phone = form.cleaned_data.get('phone')
            billing_address = form.cleaned_data.get('billing_address')
            billing_zip = form.cleaned_data.get('billing_zip')
            billing_city = form.cleaned_data.get('billing_city')
            billing_state = form.cleaned_data.get('billing_state')
            billing_country = form.cleaned_data.get('billing_country')
            shipping_address = form.cleaned_data.get('shipping_address')
            shipping_zip = form.cleaned_data.get('shipping_zip')
            shipping_city = form.cleaned_data.get('shipping_city')
            shipping_state = form.cleaned_data.get('shipping_state')
            shipping_country = form.cleaned_data.get('shipping_country')
            details = form.cleaned_data.get('details')
            GSTIN = form.cleaned_data.get('GSTIN')
            PAN = form.cleaned_data.get('PAN')
            balance = form.cleaned_data.get('balance')

            Client.objects.create(
                name=name, contact_Name=contact_Name, TIN=TIN, email=email, phone=phone,
                billing_address=billing_address,
                billing_zip=billing_zip, billing_city=billing_city, billing_state=billing_state,
                billing_country=billing_country,
                shipping_address=shipping_address, shipping_zip=shipping_zip, shipping_city=shipping_city,
                shipping_state=shipping_state, shipping_country=shipping_country, details=details, GSTIN=GSTIN,
                PAN=PAN, balance=balance, company_id=request.session.get('company_id')
            )
            return redirect(to='client_data')
        return redirect(to='new_client_add')


class ClientEdit(DashboardLoginRequiredMixin, ListView):
    from .forms import ClientEditForm
    editForm = ClientEditForm
    model = Client
    client_edit_Form_template = 'SMdashboard/client_edit_form.html'

    def get(self, request, *args, **kwargs):
        if 'client_edit_form' in kwargs:
            record = self.model.objects.get(id=kwargs.get('object_id'))
            form = self.ClientEditForm(instance=record)
            return render(request, self.client_edit_Form_template, {'clientEdit': form})

    def post(self, request, *args, **kwargs):
        form = self.ClientEditForm(request.POST)
        print(form.is_valid())
        print(form)
        if form.is_valid():
            name = form.cleaned_data.get('name')
            contact_Name = form.cleaned_data.get('contact_Name')
            TIN = form.cleaned_data.get('TIN')
            email = form.cleaned_data.get('email')
            phone = form.cleaned_data.get('phone')
            billing_address = form.cleaned_data.get('billing_address')
            billing_zip = form.cleaned_data.get('billing_zip')
            billing_city = form.cleaned_data.get('billing_city')
            billing_state = form.cleaned_data.get('billing_state')
            billing_country = form.cleaned_data.get('billing_country')
            shipping_address = form.cleaned_data.get('shipping_address')
            shipping_zip = form.cleaned_data.get('shipping_zip')
            shipping_city = form.cleaned_data.get('shipping_city')
            shipping_state = form.cleaned_data.get('shipping_state')
            shipping_country = form.cleaned_data.get('shipping_country')
            details = form.cleaned_data.get('details')
            GSTIN = form.cleaned_data.get('GSTIN')
            PAN = form.cleaned_data.get('PAN')
            balance = form.cleaned_data.get('balance')

            Client.objects.filter(pk=kwargs.get('object_id')).update(
                name=name, contact_Name=contact_Name, TIN=TIN, email=email, phone=phone,
                billing_address=billing_address,
                billing_zip=billing_zip, billing_city=billing_city, billing_state=billing_state,
                billing_country=billing_country,
                shipping_address=shipping_address, shipping_zip=shipping_zip, shipping_city=shipping_city,
                shipping_state=shipping_state, shipping_country=shipping_country, details=details, GSTIN=GSTIN,
                PAN=PAN, balance=balance
            )
            return redirect(to='client_data')
        return redirect(to='new_client_add')


# class ProductView(OwnerRequiredMinxin, ListView):
#     from .forms import ProductForm
#     dashboard_template = 'SMdashboard/dashboard.html'
#     data_template = 'SMdashboard/product-table.html'
#     form_template = 'SMdashboard/productform.html'
#     detailed_template_view = 'SMdashboard/product.html'
#     form = ProductForm
#     model = product.Product
#
#     def get_data(self, request, company_id=None):
#         data = self.model.objects.filter(company_id=company_id).values('pk', 'name', 'unit_price', 'u_o_m', 'quantity',
#                                                                        'description',
#                                                                        'product_type',
#                                                                        'purchase_rate', 'purchase_rate_currency',
#                                                                        'h_s_n_or_s_a_c', 's_k_u',
#                                                                        'tax', 'c_e_s_s_percent', 'c_e_s_s'
#                                                                        ).order_by("-pk")
#         return list(data)
#
#     def get(self, request, *args, **kwargs):
#         if 'product_form' in kwargs:
#             return render(request, self.form_template, {'form': self.form})
#         elif 'object_id' in kwargs:
#             from .reports import ProductReport
#             data = ProductReport().get_data(request, product_id=kwargs.get('object_id'),
#                                             company_id=request.session.get('company_id'))
#             template = self.detailed_template_view
#             return render(request, template, data)
#
#         data = self.get_data(request, company_id=request.session.get('company_id'))
#         print(data)
#         return render(request, self.data_template, {'data': data})
#
#     def post(self, request, *args, **kwargs):
#         form = self.ProductForm(request.POST, request.FILES)
#         if form.is_valid():
#             input_excel = request.FILES['input_excel']
#             book = xlrd.open_workbook(file_contents=input_excel.read())
#             sheet = book.sheet_by_index(0)
#             # data = [[sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)]
#             product_name = []
#             unit_price = []
#             uom = []
#             quantity = []
#             description = []
#             type = []
#             purchase_rate = []
#             purchase_rate_currency = []
#             h_s_n_or_s_a_c = []
#             s_k_u = []
#             tax = []
#             c_e_s_s_percent = []
#             c_e_s_s = []
#
#             for i in range(sheet.nrows):
#                 product_name.append(sheet.cell_value(i, 0))
#                 unit_price.append(sheet.cell_value(i, 1))
#                 uom.append(sheet.cell_value(i, 2))
#                 quantity.append(sheet.cell_value(i, 3))
#                 description.append(sheet.cell_value(i, 4))
#                 type.append(sheet.cell_value(i, 5))
#                 purchase_rate.append(sheet.cell_value(i, 6))
#                 purchase_rate_currency.append(sheet.cell_value(i, 7))
#                 h_s_n_or_s_a_c.append(sheet.cell_value(i, 8))
#                 s_k_u.append(sheet.cell_value(i, 9))
#                 tax.append(sheet.cell_value(i, 10))
#                 c_e_s_s_percent.append(sheet.cell_value(i, 11))
#                 c_e_s_s.append(sheet.cell_value(i, 12))
#
#             product_name.pop(0)
#             unit_price.pop(0)
#             uom.pop(0)
#             quantity.pop(0)
#             description.pop(0)
#             type.pop(0)
#             purchase_rate.pop(0)
#             purchase_rate_currency.pop(0)
#             h_s_n_or_s_a_c.pop(0)
#             s_k_u.pop(0)
#             tax.pop(0)
#             c_e_s_s_percent.pop(0)
#             c_e_s_s.pop(0)
#
#             for i in range(len(product_name)):
#                 self.model.objects.get_or_create(name=product_name[i], unit_price=unit_price[i],
#                                                  u_o_m=uom[i], quantity=quantity[i], description=description[i],
#                                                  product_type=type[i], purchase_rate=purchase_rate[i],
#                                                  purchase_rate_currency=purchase_rate_currency[i],
#                                                  h_s_n_or_s_a_c=h_s_n_or_s_a_c[i],
#                                                  s_k_u=s_k_u[i],
#                                                  tax=tax[i],
#                                                  c_e_s_s_percent=c_e_s_s_percent[i], c_e_s_s=c_e_s_s[i],
#                                                  company_id=request.session.get('company_id'))
#
#             return redirect(to='product_data')
#         return redirect(to='new_product')


class VendorView(OwnerRequiredMinxin, ListView):
    from .forms import VendorForm
    dashboard_template = 'SMdashboard/dashboard.html'
    data_template = 'SMdashboard/vendor-table.html'
    form_template = 'SMdashboard/vendorform.html'
    detailed_view = 'SMdashboard/view-vendor.html'
    form = VendorForm
    model = Vendor

    def get_data(self, request, company_id=None):
        data = self.model.objects.filter(company_id=company_id).values('pk', 'name').annotate(
            vendor_contact_Name=Coalesce('contact_Name', Value("-")),
            vendor_TIN=Coalesce('TIN', Value("-")),
            vendor_email=Coalesce('email', Value("-")),
            vendor_phone=Coalesce('phone', Value("-")),
            vendor_billing_address=Coalesce('billing_address', Value("-")),
            vendor_billing_zip=Coalesce('billing_zip', Value("-")),
            vendor_billing_city=Coalesce('billing_city', Value("-")),
            vendor_billing_state=Coalesce('billing_state', Value("-")),
            vendor_billing_country=Coalesce('billing_country', Value("-")),
            vendor_shipping_address=Coalesce('shipping_address', Value("-")),
            vendor_shipping_zip=Coalesce('shipping_zip', Value("-")),
            vendor_shipping_city=Coalesce('shipping_city', Value("-")),
            vendor_shipping_state=Coalesce('shipping_state', Value("-")),
            vendor_shipping_country=Coalesce('shipping_country', Value("-")),
            vendor_details=Coalesce('details', Value("-")),
            vendor_GSTIN=Coalesce('GSTIN', Value("-")),

        ).order_by("-pk")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'vendor_form' in kwargs:
            return render(request, self.form_template, {'form': self.form})
        elif 'object_id' in kwargs:
            from .reports import VendorReport
            data = VendorReport().get_data(request, vendor_id=kwargs.get('object_id'),
                                           company_id=request.session.get('company_id'))
            return render(request, self.detailed_view, data)
        data = self.get_data(request, company_id=request.session.get('company_id'))
        print(data)
        return render(request, self.data_template, {'data': data})

    def post(self, request, *args, **kwargs):
        form = self.VendorForm(request.POST, request.FILES)
        if form.is_valid():
            input_excel = request.FILES['input_excel']
            book = xlrd.open_workbook(file_contents=input_excel.read())
            sheet = book.sheet_by_index(0)
            # data = [[sheet.cell_value(r, c) for c in range(sheet.ncols)] for r in range(sheet.nrows)]
            vendor_name = []
            contact_name = []
            vendor_tin = []
            email = []
            phone = []
            billing_address = []
            billing_zip = []
            billing_city = []
            billing_state = []
            billing_country = []
            shipping_address = []
            shipping_zip = []
            shipping_city = []
            shipping_state = []
            shipping_country = []
            private_details = []
            gstin = []

            for i in range(sheet.nrows):
                vendor_name.append(sheet.cell_value(i, 0))
                contact_name.append(sheet.cell_value(i, 1))
                vendor_tin.append(sheet.cell_value(i, 2))
                email.append(sheet.cell_value(i, 3))
                phone.append(sheet.cell_value(i, 4))
                billing_address.append(sheet.cell_value(i, 5))
                billing_zip.append(sheet.cell_value(i, 6))
                billing_city.append(sheet.cell_value(i, 7))
                billing_state.append(sheet.cell_value(i, 8))
                billing_country.append(sheet.cell_value(i, 9))
                shipping_address.append(sheet.cell_value(i, 10))
                shipping_zip.append(sheet.cell_value(i, 11))
                shipping_city.append(sheet.cell_value(i, 12))
                shipping_state.append(sheet.cell_value(i, 13))
                shipping_country.append(sheet.cell_value(i, 14))
                private_details.append(sheet.cell_value(i, 15))
                gstin.append(sheet.cell_value(i, 16))

            vendor_name.pop(0)
            contact_name.pop(0)
            vendor_tin.pop(0)
            email.pop(0)
            phone.pop(0)
            billing_address.pop(0)
            billing_zip.pop(0)
            billing_city.pop(0)
            billing_state.pop(0)
            billing_country.pop(0)
            shipping_address.pop(0)
            shipping_zip.pop(0)
            shipping_city.pop(0)
            shipping_state.pop(0)
            shipping_country.pop(0)
            private_details.pop(0)
            gstin.pop(0)

            for i in range(len(vendor_name)):
                self.model.objects.get_or_create(name=vendor_name[i], contact_Name=contact_name[i],
                                                 TIN=vendor_tin[i], email=email[i], phone=phone[i],
                                                 billing_address=billing_address[i], billing_zip=billing_zip[i],
                                                 billing_city=billing_city[i], billing_state=billing_state[i],
                                                 billing_country=billing_country[i],
                                                 shipping_address=shipping_address[i],
                                                 shipping_zip=shipping_zip[i], shipping_city=shipping_city[i],
                                                 shipping_state=shipping_state[i], shipping_country=shipping_country[i],
                                                 details=private_details[i], GSTIN=gstin[i],
                                                 company_id=request.session.get('company_id'))
            return redirect(to='vendor_data')
        return redirect(to='new_vendor')


class VendorAdd(OwnerRequiredMinxin, ListView):
    from .forms import VendorAddForm

    # dashboard_template = 'SMdashboard/dashboard.html'
    # data_template = 'SMdashboard/client-table.html'
    form_template = 'SMdashboard/vendorform-fill.html'
    # detailed_view = 'SMdashboard/view-client.html'
    form = VendorAddForm
    model = Vendor

    def get(self, request, *args, **kwargs):
        if 'vendor_form_fill' in kwargs:
            return render(request, self.form_template, {'form': self.form})

    def post(self, request, *args, **kwargs):
        form = self.form(request.POST)
        print(form.is_valid())
        if form.is_valid():
            name = form.cleaned_data.get('name')
            contact_Name = form.cleaned_data.get('contact_Name')
            TIN = form.cleaned_data.get('TIN')
            email = form.cleaned_data.get('email')
            phone = form.cleaned_data.get('phone')
            billing_address = form.cleaned_data.get('billing_address')
            billing_zip = form.cleaned_data.get('billing_zip')
            billing_city = form.cleaned_data.get('billing_city')
            billing_state = form.cleaned_data.get('billing_state')
            billing_country = form.cleaned_data.get('billing_country')
            shipping_address = form.cleaned_data.get('shipping_address')
            shipping_zip = form.cleaned_data.get('shipping_zip')
            shipping_city = form.cleaned_data.get('shipping_city')
            shipping_state = form.cleaned_data.get('shipping_state')
            shipping_country = form.cleaned_data.get('shipping_country')
            details = form.cleaned_data.get('details')
            GSTIN = form.cleaned_data.get('GSTIN')

            Vendor.objects.create(
                name=name, contact_Name=contact_Name, TIN=TIN, email=email, phone=phone,
                billing_address=billing_address,
                billing_zip=billing_zip, billing_city=billing_city, billing_state=billing_state,
                billing_country=billing_country,
                shipping_address=shipping_address, shipping_zip=shipping_zip, shipping_city=shipping_city,
                shipping_state=shipping_state, shipping_country=shipping_country, details=details, GSTIN=GSTIN,
                company_id=request.session.get('company_id')
            )
            return redirect(to='vendor_data')
        return redirect(to='new_vendor_add')


class Enquiry(DashboardLoginRequiredMixin, ListView):
    from .forms import EnquiryForm
    form = EnquiryForm
    # dashboard_template = 'SMdashboard/dashboard.html'
    enquiryForm_template = 'SMdashboard/enquiry_form.html'
    enquiryForm_table = 'SMdashboard/table-enquiry.html'
    detailed_template_view = 'SMdashboard/enquiry.html'

    model = enquiry.Enquiry

    def get_data(self, request, company_id=None, *args, **kwargs):
        if request.user.groups.filter(name=OWNER_GROUP).exists():
            if 'filter_date' in kwargs:
                data = self.model.objects.filter(enquiry_date__gte=request.POST.get('fromDate'),
                                                 enquiry_date__lte=request.POST.get('toDate'),
                                                 company_id=company_id).values(
                    'first_name', 'last_name', 'mobile_no',
                    'address', 'pk',
                ).annotate(
                    customer=F('customer_type__name'),
                    handled=F('create_user__first_name'),
                    enquiry=F('enquiry_type__name'),

                    enquiry_product_name=Coalesce('product_name', Value("-")),
                    enquiry_description=Coalesce('description', Value("-")),
                    enquiry_price=Coalesce('price', Value("-")),
                    enquiry_email_id=Coalesce('email_id', Value("-")),
                    date=ExpressionWrapper(Func(F('enquiry_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
                ).order_by("-date")
                return list(data)

            data = self.model.objects.filter(company_id=company_id).values(
                'first_name', 'last_name', 'mobile_no',
                'address', 'pk',

            ).annotate(
                customer=F('customer_type__name'),
                handled=F('create_user__first_name'),
                enquiry=F('enquiry_type__name'),

                enquiry_product_name=Coalesce('product_name', Value("-")),
                enquiry_description=Coalesce('description', Value("-")),
                enquiry_price=Coalesce('price', Value("-")),
                enquiry_email_id=Coalesce('email_id', Value("-")),
                date=ExpressionWrapper(Func(F('enquiry_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
            ).order_by("-date")
            return list(data)
        elif 'filter_date' in kwargs:
            data = self.model.objects.filter(create_user_id=request.user,
                                             enquiry_date__gte=request.POST.get('fromDate'),
                                             enquiry_date__lte=request.POST.get('toDate'),
                                             company_id=company_id).values(
                'first_name', 'last_name', 'mobile_no',
                'address', 'pk',
            ).annotate(
                customer=F('customer_type__name'),
                handled=F('create_user__first_name'),
                enquiry=F('enquiry_type__name'),

                enquiry_product_name=Coalesce('product_name', Value("-")),
                enquiry_description=Coalesce('description', Value("-")),
                enquiry_price=Coalesce('price', Value("-")),
                enquiry_email_id=Coalesce('email_id', Value("-")),
                date=ExpressionWrapper(Func(F('enquiry_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
            ).order_by("-date")
            return list(data)
        data = self.model.objects.filter(create_user_id=request.user, company_id=company_id).values(
            'first_name', 'last_name', 'mobile_no',
            'address', 'pk',

        ).annotate(
            customer=F('customer_type__name'),
            handled=F('create_user__first_name'),
            enquiry=F('enquiry_type__name'),

            enquiry_product_name=Coalesce('product_name', Value("-")),
            enquiry_description=Coalesce('description', Value("-")),
            enquiry_price=Coalesce('price', Value("-")),
            enquiry_email_id=Coalesce('email_id', Value("-")),
            date=ExpressionWrapper(Func(F('enquiry_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                   output_field=CharField()),
        ).order_by("-date")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'enquiry_form' in kwargs:
            return render(request, self.enquiryForm_template, {'enquiry': self.form()})
        elif 'object_id' in kwargs:
            from .reports import EnquiryReport
            data = EnquiryReport().get_data(request, enquiry_id=kwargs.get('object_id'),
                                            company_id=request.session.get('company_id'))
            data1 = EnquiryReport().get_data_Reply(request, enquiry_id=kwargs.get('object_id'))
            # print(data1)
            template = self.detailed_template_view
            return render(request, template, {"data": data, "data_list": data1})  # data

        data = self.get_data(request, company_id=request.session.get('company_id'))
        print(data)
        return render(request, self.enquiryForm_table, {'data': data})

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            data = self.get_data(request, company_id=request.session.get('company_id'), filter_date='')
            return JsonResponse(data, safe=False)
        form = self.EnquiryForm(request.POST)
        print(form.is_valid())
        print(form)
        if form.is_valid():
            first_name = form.cleaned_data.get('first_name')
            last_name = form.cleaned_data.get('last_name')
            customer_type = form.cleaned_data.get('customer_type')
            address = form.cleaned_data.get('address')
            enquiry_type = form.cleaned_data.get('enquiry_type')
            product_name = form.cleaned_data.get('product_name')
            description = form.cleaned_data.get('description')
            price = form.cleaned_data.get('price')
            mobile_no = form.cleaned_data.get('mobile_no')
            email_id = form.cleaned_data.get('email_id')
            enquiry.Enquiry.objects.create(
                first_name=first_name, last_name=last_name, customer_type=customer_type, address=address,
                enquiry_type=enquiry_type, product_name=product_name, description=description, price=price,
                mobile_no=mobile_no, email_id=email_id, create_user=request.user, write_user=request.user,
                company_id=request.session.get('company_id')
            )
            return redirect(to='enquiry')
        return redirect(to='enquiry_form')


class EnquiryEdit(DashboardLoginRequiredMixin, ListView):
    from .forms import EnquiryEditForm
    form = EnquiryEditForm
    enquiryForm_template = 'SMdashboard/enquiry_form.html'
    enquiryForm_table = 'SMdashboard/table-enquiry.html'
    detailed_template_view = 'SMdashboard/enquiry.html'
    enquiry_edit_Form_template = 'SMdashboard/enquiry_edit_form.html'

    model = enquiry.Enquiry

    def get(self, request, *args, **kwargs):
        if 'enquiry_edit_form' in kwargs:
            record = self.model.objects.get(id=kwargs.get('object_id'))
            print(record)
            form = self.form(instance=record)
            return render(request, self.enquiry_edit_Form_template, {'enquiry': form})

    def post(self, request, *args, **kwargs):
        editform = self.form(request.POST, request.FILES)
        if editform.is_valid():
            first_name = editform.cleaned_data.get('first_name')
            last_name = editform.cleaned_data.get('last_name')
            customer_type = editform.cleaned_data.get('customer_type')
            address = editform.cleaned_data.get('address')
            # handled_by = editform.cleaned_data.get('handled_by')
            enquiry_type = editform.cleaned_data.get('enquiry_type')
            product_name = editform.cleaned_data.get('product_name')
            description = editform.cleaned_data.get('description')
            price = editform.cleaned_data.get('price')
            mobile_no = editform.cleaned_data.get('mobile_no')
            email_id = editform.cleaned_data.get('email_id')
            enquiry.Enquiry.objects.filter(pk=kwargs.get('object_id')).update(
                first_name=first_name, last_name=last_name, customer_type=customer_type, address=address,
                enquiry_type=enquiry_type, product_name=product_name, description=description,
                price=price, mobile_no=mobile_no, email_id=email_id, create_user=request.user, write_user=request.user
            )
            return redirect(to='enquiry')
        return redirect(to='enquiry_edit_Form_template')


class EnquiryReply(DashboardLoginRequiredMixin, ListView):
    from .forms import EnquiryReplyForm
    form = EnquiryReplyForm
    enquiry_reply_Form_template = 'SMdashboard/enquiry_reply_form.html'

    def get(self, request, *args, **kwargs):
        if 'enquiry_reply_form' in kwargs:
            return render(request, self.enquiry_reply_Form_template, {'replyEnquiry': self.form()})

    def post(self, request, *args, **kwargs):
        replyForm = self.form(request.POST)
        if replyForm.is_valid():
            status = replyForm.cleaned_data.get('status')
            comments = replyForm.cleaned_data.get('comments')
            enquiry.EnquiryRecord.objects.create(
                enquiryDetails_id=kwargs.get('object_id'), status=status, comments=comments,
                create_user=request.user, write_user=request.user
            )
            return redirect(to='enquiry')
        return redirect(to='enquiry_form')


class DayBookView(OwnerRequiredMinxin, ListView):
    from .forms import DayBookForm
    form = DayBookForm
    dashboard_template = 'SMdashboard/dashboard.html'
    form_template = 'SMdashboard/daybookform.html'
    data_template = 'SMdashboard/daybook-table.html'
    detailed_template_view = 'SMdashboard/daybook.html'
    model = dayBook.DayBook

    def get_data(self, request, company_id=None, *args, **kwargs):
        if 'filter_date' in kwargs:
            data = self.model.objects.filter(date__gte=request.POST.get('fromDate'),
                                             date__lte=request.POST.get('toDate'),
                                             company_id=company_id).values('pk', 'number',
                                                                           'customer_type',
                                                                           'description',
                                                                           'status').annotate(
                dayBook_name=Coalesce('name', Value("-")),
                customer=Coalesce('customer_name__name', Value("-")),
                employee=Coalesce('employee_name__name', Value("-")),
                vendor=Coalesce('vendor_name__name', Value("-")),
                dayBook_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                               output_field=CharField()),
                dayBook_credit_amount=ExpressionWrapper(
                    F('credit_amount'), output_field=FloatField()),
                dayBook_debit_amount=ExpressionWrapper(
                    F('debit_amount'), output_field=FloatField()),
            )
            data1 = self.model.objects.filter(company_id=company_id).values('pk', 'date').first()
            if data1:
                data3 = self.model.objects.filter(date__gte=data1['date'].date(),
                                                  date__lte=request.POST.get('fromDate'),
                                                  company_id=company_id).values('pk').annotate(
                    dayBook_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                                   output_field=CharField()),
                    dayBook_credit_amount=ExpressionWrapper(
                        F('credit_amount'), output_field=FloatField()),
                    dayBook_debit_amount=ExpressionWrapper(
                        F('debit_amount'), output_field=FloatField()),
                )
                credit_total = []
                debit_total = []
                for i in range(len(data3)):
                    credit_total.append(data3[i].get("dayBook_credit_amount"))
                    debit_total.append(data3[i].get("dayBook_debit_amount"))
                credited = sum(credit_total)
                debited = sum(debit_total)
                total = credited - debited
                # print(data3)
                # print(total)
                return [list(data), total]
            return [list(data)]
        data = self.model.objects.filter(company_id=company_id).values('pk', 'number', 'customer_type',
                                                                       'description', 'status').annotate(
            dayBook_name=Coalesce('name', Value("-")),
            customer=Coalesce('customer_name__name', Value("-")),
            employee=Coalesce('employee_name__name', Value("-")),
            vendor=Coalesce('vendor_name__name', Value("-")),
            dayBook_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            dayBook_credit_amount=ExpressionWrapper(
                F('credit_amount'), output_field=FloatField()),
            dayBook_debit_amount=ExpressionWrapper(
                F('debit_amount'), output_field=FloatField()),
        ).order_by("-dayBook_date")
        data1 = self.model.objects.filter(company_id=company_id).values('pk', 'date').first()
        if data1:
            data3 = self.model.objects.filter(date__gte=data1['date'].date(),
                                              date__lte=datetime.datetime.today().date(),
                                              company_id=company_id).values('pk').annotate(
                dayBook_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                               output_field=CharField()),
                dayBook_credit_amount=ExpressionWrapper(
                    F('credit_amount'), output_field=FloatField()),
                dayBook_debit_amount=ExpressionWrapper(
                    F('debit_amount'), output_field=FloatField()),
            )
            credit_total = []
            debit_total = []
            for i in range(len(data3)):
                credit_total.append(data3[i].get("dayBook_credit_amount"))
                debit_total.append(data3[i].get("dayBook_debit_amount"))
            credited = sum(credit_total)
            debited = sum(debit_total)
            total = credited - debited
            print(data3)
            print(total)
            return [list(data), total]
        return [list(data)]

    def get(self, request, *args, **kwargs):
        if 'daybook_form' in kwargs:
            return render(request, self.form_template, {'daybook': self.form()})
        elif 'object_id' in kwargs:
            from .reports import DayBookReport
            data = DayBookReport().get_data(request, daybook_id=kwargs.get('object_id'),
                                            company_id=request.session.get('company_id'))
            template = self.detailed_template_view
            return render(request, template, data)
        context = {}
        main_data = self.get_data(request, company_id=request.session.get('company_id'))
        if len(main_data) > 1:
            data = main_data[0]
            opening_amount = main_data[1]
            context.update({'data': data, 'opening_amount': opening_amount})
        data = main_data[0]
        context.update({'data': data})
        credit_total = []
        debit_total = []
        for i in range(len(data)):
            credit_total.append(data[i].get("dayBook_credit_amount"))
            debit_total.append(data[i].get("dayBook_debit_amount"))
        credited = sum(credit_total)
        debited = sum(debit_total)
        total = credited - debited
        context.update({'credited': credited,
                        'debited': debited, 'total': total})
        print(context)
        return render(request, self.data_template, context)

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            main_data = self.get_data(request, company_id=request.session.get('company_id'), filter_date='')
            if len(main_data) > 1:
                data = {'data': main_data[0],
                        'opening_amount': main_data[1]}
            data = {'data': main_data[0]}
            print(data)
            credit_total = []
            debit_total = []
            for i in range(len(data.get('data'))):
                print(i)
                credit_total.append(data.get('data')[i].get("dayBook_credit_amount"))
                debit_total.append(data.get('data')[i].get("dayBook_debit_amount"))
            credited = sum(credit_total)
            debited = sum(debit_total)
            total = credited - debited
            data.update({'credited': credited, 'debited': debited, 'total': total})
            return JsonResponse(data, safe=False)
        form = self.DayBookForm(request.POST)
        print(form.is_valid())
        print(form)
        if form.is_valid():
            number = form.cleaned_data.get('number')
            date = form.cleaned_data.get('date')
            customer_type = form.cleaned_data.get('customer_type')
            name = form.cleaned_data.get('name')
            customer_name = form.cleaned_data.get('customer_name')
            employee_name = form.cleaned_data.get('employee_name')
            vendor_name = form.cleaned_data.get('vendor_name')
            description = form.cleaned_data.get('description')
            status = form.cleaned_data.get('status')
            credit_amount = form.cleaned_data.get('credit_amount')
            debit_amount = form.cleaned_data.get('debit_amount')
            self.model.objects.create(
                number=number, date=date, customer_type=customer_type, name=name,
                customer_name=customer_name, employee_name=employee_name, vendor_name=vendor_name,
                description=description, status=status, credit_amount=credit_amount, debit_amount=debit_amount,
                company_id=request.session.get('company_id'))
            return redirect(to='daybook')
        return redirect(to='daybook_form')


class DayBookEdit(OwnerRequiredMinxin, ListView):
    from .forms import DayBookEditForm
    form = DayBookEditForm
    model = dayBook.DayBook
    daybook_edit_Form_template = 'SMdashboard/daybook_edit_form.html'

    def get(self, request, *args, **kwargs):
        if 'daybook_edit_form' in kwargs:
            record = self.model.objects.get(id=kwargs.get('object_id'))
            editForm = self.form(instance=record)
            return render(request, self.daybook_edit_Form_template, {'editDaybook': editForm})

    def post(self, request, *args, **kwargs):
        form = self.form(request.POST)
        print(form.is_valid())
        print(form)
        if form.is_valid():
            number = form.cleaned_data.get('number')
            date = form.cleaned_data.get('date')
            customer_type = form.cleaned_data.get('customer_type')
            name = form.cleaned_data.get('name')
            customer_name = form.cleaned_data.get('customer_name')
            employee_name = form.cleaned_data.get('employee_name')
            vendor_name = form.cleaned_data.get('vendor_name')
            description = form.cleaned_data.get('description')
            status = form.cleaned_data.get('status')
            credit_amount = form.cleaned_data.get('credit_amount')
            debit_amount = form.cleaned_data.get('debit_amount')
            self.model.objects.filter(pk=kwargs.get('object_id')).update(
                number=number, date=date, customer_type=customer_type, name=name,
                customer_name=customer_name, employee_name=employee_name, vendor_name=vendor_name,
                description=description, status=status, credit_amount=credit_amount, debit_amount=debit_amount)
            return redirect(to='daybook')
        return redirect(to='daybook_form')


class Employee(OwnerRequiredMinxin, ListView):
    from .forms import EmployeeForm
    form = EmployeeForm

    model = employee_data.Employee

    detailed_template_view = 'SMdashboard/employee.html'

    # dashboard_template = 'SMdashboard/dashboard.html'
    employeeForm_template = 'SMdashboard/employee_form.html'
    employeeForm_table = 'SMdashboard/table-employee.html'

    def get_data(self, request, company_id=None, **kwargs):
        if 'filter_date' in kwargs:
            data = self.model.objects.filter(join_date__gte=request.POST.get('fromDate'),
                                             join_date__lte=request.POST.get('toDate'),
                                             company_id=company_id).values(
                'photo', 'name', 'address', 'city', 'state', 'pin_code', 'country', 'mobile_no', 'email_id',
                'qualification', 'type', 'job_profile', 'job_description', 'pk',
            ).annotate(
                date=ExpressionWrapper(Func(F('join_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
            )
            return list(data)

        data = self.model.objects.filter(company_id=company_id).values(
            'photo', 'name', 'address', 'city', 'state', 'pin_code', 'country', 'mobile_no', 'email_id',
            'qualification', 'type', 'job_profile', 'job_description', 'pk',
        ).annotate(
            date=ExpressionWrapper(Func(F('join_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                   output_field=CharField()),
        ).order_by("-date")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'employee_form' in kwargs:
            return render(request, self.employeeForm_template, {'employee': self.form()})

        elif 'object_id' in kwargs:
            from .reports import EmployeeReport
            data = EmployeeReport().get_data(request, employee_id=kwargs.get('object_id'),
                                             company_id=request.session.get('company_id'))
            template = self.detailed_template_view

            return render(request, template, data)

        data = self.get_data(request, company_id=request.session.get('company_id'))
        print(data)
        return render(request, self.employeeForm_table, {'data': data})

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            data = self.get_data(request, filter_date='')
            return JsonResponse(data, safe=False)
        form = self.EmployeeForm(request.POST, request.FILES, )
        print(form.is_valid)
        print(form)
        if form.is_valid():
            photo = form.cleaned_data.get('photo')
            join_date = form.cleaned_data.get('join_date')
            name = form.cleaned_data.get('name')
            address = form.cleaned_data.get('address')
            city = form.cleaned_data.get('city')
            state = form.cleaned_data.get('state')
            pin_code = form.cleaned_data.get('pin_code')
            country = form.cleaned_data.get('country')
            mobile_no = form.cleaned_data.get('mobile_no')
            email_id = form.cleaned_data.get('email_id')
            qualification = form.cleaned_data.get('qualification')
            type = form.cleaned_data.get('type')
            job_profile = form.cleaned_data.get('job_profile')
            job_description = form.cleaned_data.get('job_description')

            employee_data.Employee.objects.create(
                photo=photo, join_date=join_date, name=name, address=address, city=city, state=state, pin_code=pin_code,
                country=country, mobile_no=mobile_no, email_id=email_id, qualification=qualification, type=type,
                job_profile=job_profile, job_description=job_description, company_id=request.session.get('company_id')
            )
            return redirect(to="employee")
        return redirect(to="employee_form")


class EmployeeEdit(OwnerRequiredMinxin, ListView):
    from .forms import EmployeeEditForm
    editform = EmployeeEditForm
    model = employee_data.Employee
    employee_edit_Form_template = 'SMdashboard/employee_edit_form.html'

    def get(self, request, *args, **kwargs):
        if 'employee_edit_form' in kwargs:
            record = self.model.objects.get(id=kwargs.get('object_id'))
            editform = self.EmployeeEditForm(instance=record)
            return render(request, self.employee_edit_Form_template, {'employee': editform})

    def post(self, request, *args, **kwargs):
        form = self.EmployeeEditForm(request.POST, request.FILES, )
        # print(form.is_valid)
        # print(form)
        if form.is_valid():
            # photo = form.cleaned_data.get('photo')
            join_date = form.cleaned_data.get('join_date')
            name = form.cleaned_data.get('name')
            address = form.cleaned_data.get('address')
            city = form.cleaned_data.get('city')
            state = form.cleaned_data.get('state')
            pin_code = form.cleaned_data.get('pin_code')
            country = form.cleaned_data.get('country')
            mobile_no = form.cleaned_data.get('mobile_no')
            email_id = form.cleaned_data.get('email_id')
            qualification = form.cleaned_data.get('qualification')
            type = form.cleaned_data.get('type')
            job_profile = form.cleaned_data.get('job_profile')
            job_description = form.cleaned_data.get('job_description')

            employee_data.Employee.objects.filter(pk=kwargs.get('object_id')).update(

                join_date=join_date, name=name, address=address, city=city, state=state, pin_code=pin_code,
                country=country, mobile_no=mobile_no, email_id=email_id, qualification=qualification, type=type,
                job_profile=job_profile, job_description=job_description,
            )
            return redirect(to="employee")
        return redirect(to="employee_form")


class Service(DashboardLoginRequiredMixin, ListView):
    from .forms import ServiceForm
    form = ServiceForm
    model = service.Service
    detailed_view = 'SMdashboard/view-service.html'
    serviceForm_template = 'SMdashboard/service_form.html'
    serviceForm_table = 'SMdashboard/table-service.html'
    service_invoice = 'SMdashboard/ServiceInvoicePrint.html'

    def get_data(self, request, company_id=None, *args, **kwargs):
        if 'filter_date' in kwargs:
            data = self.model.objects.filter(date__gte=request.POST.get('fromDate'),
                                             date__lte=request.POST.get('toDate'),
                                             company_id=company_id).values(
                'status', 'service_number', 'description', 'photo', 'pk'
            ).annotate(
                service_client=F('client__name'),
                service_client_phone=F('client__phone'),
                service=F('service_type__name'),
                service_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                               output_field=CharField()),
            )
            return list(data)
        data = self.model.objects.filter(company_id=company_id).values(
            'status', 'service_number', 'description', 'photo', 'pk'
        ).annotate(
            service_client=F('client__name'),
            service_client_phone=F('client__phone'),
            service=F('service_type__name'),
            service_date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
        ).order_by("-service_date")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'service_form' in kwargs:
            clients = Client.objects.filter(company_id=request.session.get('company_id'))
            print(clients)
            return render(request, self.serviceForm_template, {'service': self.form(), 'clients': clients})
        elif 'service_id' in kwargs:
            from .reports import ServiceReportInvoice
            invoice_data = ServiceReportInvoice().get_data(request, service_id=kwargs.get('service_id'),
                                                           company_id=request.session.get('company_id'))
            print(invoice_data)
            return render(request, self.service_invoice, {"invoice_data": invoice_data})
        elif 'object_id' in kwargs:
            from .reports import ServiceReport
            data = ServiceReport().get_data(request, service_id=kwargs.get('object_id'),
                                            company_id=request.session.get('company_id'))
            data1 = ServiceReport().get_data_Reply(request, service_id=kwargs.get('object_id'))
            template = self.detailed_view
            return render(request, template, {"data": data, "data_list": data1})
        data = self.get_data(request, company_id=request.session.get('company_id'))
        print(data)
        return render(request, self.serviceForm_table, {'data': data})

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            data = self.get_data(request, company_id=request.session.get('company_id'), filter_date='')
            return JsonResponse(data, safe=False)
        form = self.ServiceForm(request.POST, request.FILES)
        print(form.is_valid())
        if form.is_valid():
            service_number = form.cleaned_data.get('service_number')
            date = form.cleaned_data.get('date')
            client = form.cleaned_data.get('client')
            service_type = form.cleaned_data.get('service_type')
            description = form.cleaned_data.get('description')
            photo = form.cleaned_data.get('photo')
            service.Service.objects.create(
                service_number=service_number, date=date, client=client, service_type=service_type,
                description=description, photo=photo, create_user=request.user, write_user=request.user,
                company_id=request.session.get('company_id')
            )
            my_client_data = list(service.Service.objects.filter(client=client,
                                                                 company_id=request.session.get('company_id')
                                                                 ).values('pk').annotate(
                phone=F('client__phone'),
                company_name=F('company__name'),
                company_phone=F('company__phone'),
                company_email=F('company__email_id'),
                company_website=F('company__website')
            ))
            print(my_client_data)
            client_no = my_client_data[0].get('phone')
            company_name = my_client_data[0].get('company_name')
            company_phone = my_client_data[0].get('company_phone')
            company_email = my_client_data[0].get('company_email')
            company_website = my_client_data[0].get('company_website')
            payload = {
                "sender": "KIINFO",
                "route": "4",
                "country": "91",
                "sms": [
                    {
                        "message": f"Dear {client},\n Your Service number for {service_type} is {service_number} "
                                   f"generated on {date} \n Thanks and Regards,\n {company_name}\n "
                                   f"[{company_phone}] / [{company_email}]"
                                   f"[{company_website}]",
                        "to": [
                            client_no,
                        ]
                    }
                ]
            }
            my_payload = json.dumps(payload)
            print(my_payload)
            headers = {
                'authkey': "319771ADVdNvaEDkN5e525394P1",
                'content-type': "application/json"
            }
            # conn.request("POST", "/api/v2/sendsms", my_payload, headers)
            # res = conn.getresponse()
            # data = res.read()
            # print(data.decode("utf-8"))
            service.ServiceStoreData.objects.create(date=date, client=client,
                                                    phone=client_no,
                                                    service_number=service_number,
                                                    message=f"Dear {client},\n Your Service number for {service_type}"
                                                            f" is {service_number} "
                                                            f"generated on {date} \n "
                                                            f"Thanks and Regards,\n {company_name}\n "
                                                            f"[{company_phone}] / [{company_email}]"
                                                            f"[{company_website}]",
                                                    company_id=request.session.get('company_id'))
            return redirect(to="service")


class ServiceEdit(DashboardLoginRequiredMixin, ListView):
    from .forms import ServiceEditForm
    editform = ServiceEditForm
    model = service.Service
    service_edit_Form_template = 'SMdashboard/service_edit_form.html'

    def get(self, request, *args, **kwargs):
        if 'service_edit_form' in kwargs:
            record = self.model.objects.get(id=kwargs.get('object_id'))
            print(record)
            form = self.ServiceEditForm(instance=record)
            return render(request, self.service_edit_Form_template, {'service': form})

    def post(self, request, *args, **kwargs):
        editform = self.ServiceEditForm(request.POST, request.FILES)
        if editform.is_valid():
            service_number = editform.cleaned_data.get('service_number')
            date = editform.cleaned_data.get('date')
            client = editform.cleaned_data.get('client')
            service_type = editform.cleaned_data.get('service_type')
            description = editform.cleaned_data.get('description')
            # photo = editform.cleaned_data.get('photo')

            service.Service.objects.filter(pk=kwargs.get('object_id')).update(
                service_number=service_number, date=date, client=client, service_type=service_type,
                description=description, create_user=request.user, write_user=request.user
            )
        return redirect(to="service")


class ServiceReply(DashboardLoginRequiredMixin, ListView):
    from .forms import ServiceReplyForm
    form = ServiceReplyForm
    service_reply_Form_template = 'SMdashboard/service_reply_form.html'

    def get(self, request, *args, **kwargs):
        if 'service_reply_form' in kwargs:
            return render(request, self.service_reply_Form_template, {'replyService': self.form()})

    def post(self, request, *args, **kwargs):
        replyForm = self.form(request.POST, request.FILES)
        print(f'object id : {replyForm}')
        print(kwargs.get('object_id'))
        if replyForm.is_valid():
            photo = replyForm.cleaned_data.get('photo')
            status = replyForm.cleaned_data.get('status')
            comment = replyForm.cleaned_data.get('comment')
            service.ServiceRecord.objects.create(service_number_id=kwargs.get('object_id'),
                                                 photo=photo, status=status, comment=comment,
                                                 create_user=request.user, write_user=request.user)
            service.Service.objects.filter(id=kwargs.get('object_id')).update(status=status)
            my_client_data = list(service.ServiceRecord.objects.filter(
                service_number_id=kwargs.get('object_id')).values('pk').annotate(
                client=F('service_number__client__name'),
                service_no=F('service_number__service_number'),
                service_type=F('service_number__service_type__name'),
                phone=F('service_number__client__phone'),
                company_name=F('service_number__company__name'),
                company_phone=F('service_number__company__phone'),
                company_email=F('service_number__company__email_id'),
                company_website=F('service_number__company__website')
            ))
            print(my_client_data)
            service_number = my_client_data[0].get('service_no')
            service_type = my_client_data[0].get('service_type')
            client_no = my_client_data[0].get('phone')
            client = my_client_data[0].get('client')
            company_name = my_client_data[0].get('company_name')
            company_phone = my_client_data[0].get('company_phone')
            company_email = my_client_data[0].get('company_email')
            company_website = my_client_data[0].get('company_website')
            payload = {
                "sender": "KIINFO",
                "route": "4",
                "country": "91",
                "sms": [
                    {
                        "message": f"Dear {client},\n Your Service Status for {service_type} having Service no "
                                   f"{service_number}"
                                   f" is changed to {status} on \n {datetime.datetime.now()}\n "
                                   f"Thanks and Regards,\n {company_name}\n "
                                   f"[{company_phone}] / [{company_email}]"
                                   f"[{company_website}]",
                        "to": [
                            client_no,
                        ]
                    }
                ]
            }
            my_payload = json.dumps(payload)
            print(my_payload)
            # headers = {
            #     'authkey': "319771ADVdNvaEDkN5e525394P1",
            #     'content-type': "application/json"
            # }
            # conn.request("POST", "/api/v2/sendsms", my_payload, headers)
            # res = conn.getresponse()
            # data = res.read()
            # print(data.decode("utf-8"))
            service.ServiceStoreData.objects.create(date=datetime.datetime.now(), client=client, phone=client_no,
                                                    service_number=service_number,
                                                    message=f"Dear {client},\n"
                                                            f" Your Service Status for {service_type}"
                                                            f" having Service no {service_number}"
                                                            f" is changed to {status} on"
                                                            f" \n {datetime.datetime.now()}\n "
                                                            f"Thanks and Regards,\n {company_name}\n "
                                                            f"[{company_phone}] / [{company_email}]"
                                                            f"[{company_website}]",
                                                    company_id=request.session.get('company_id'))
            return redirect(to="service")
        return redirect(to='service_form')


class AMC_View(OwnerRequiredMinxin, ListView):
    from .forms import AMC_Form
    model = amc.AMC
    form = AMC_Form
    data_template = 'SMdashboard/amc_datatable.html'
    detailed_view_template = 'SMdashboard/view_amc.html'
    AMC_Form_template = 'SMdashboard/amc_form.html'

    def get_data(self, request, company_id=None):
        data = self.model.objects.filter(company_id=company_id).values('pk', 'number').annotate(
            amc_client=F('client_name__name'),
            amc_start_date=ExpressionWrapper(Func(F('start_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
            amc_end_date=ExpressionWrapper(Func(F('end_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
        )
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'amc_form' in kwargs:
            a = Client.objects.filter(id=kwargs.get('object_id'),
                                      company_id=request.session.get("company_id")).values('name')
            print(a)
            context = {}
            context.update({'amc': self.form()})
            for i in a:
                context.update({"client_name": i.get('name')})
            return render(request, self.AMC_Form_template, context)
        if 'object_id' in kwargs:
            from .reports import AmcReport
            data = AmcReport().get_data(request, amc_id=kwargs.get('object_id'),
                                        company_id=request.session.get("company_id"))
            print(data)
            return render(request, self.detailed_view_template, {'data': data})
        data = self.get_data(request, company_id=request.session.get("company_id"))
        print(data)
        return render(request, self.data_template, {'data': data})

    def post(self, request, *args, **kwargs):
        amcForm = self.form(request.POST)
        print(amcForm.is_valid())
        print(amcForm)

        if amcForm.is_valid():
            number = amcForm.cleaned_data.get('number')
            description = amcForm.cleaned_data.get('description')
            start_date = amcForm.cleaned_data.get('start_date')
            end_date = amcForm.cleaned_data.get('end_date')
            self.model.objects.create(number=number, client_name_id=kwargs.get('object_id'),
                                      description=description, start_date=start_date,
                                      company_id=request.session.get("company_id"))
            return redirect(to="amc_data")
        return redirect(to="dashboard")


# from datetime import datetime
# from datetime import timedelta
#
# today = datetime.today().date()
# yesterday = today + timedelta(days=90 + 90 + 90 + 90)

class QuotationView(OwnerRequiredMinxin, ListView):
    template_name = 'SMdashboard/table-quotation-order.html'
    formTemplate = 'SMdashboard/quotation_order_build.html'
    model = Quotation
    detailed_template_view = 'SMdashboard/view-quotation.html'
    quotionForm = QuotationForm

    def get_data(self, request, user_id=None, company_id=None, **kwargs):
        if 'filter_date' in kwargs:
            data = self.model.objects.filter(issue_date__gte=request.POST.get('fromDate'),
                                          issue_date__lte=request.POST.get('toDate'),
                                          company_id=company_id).values(
                'pk', 'number', 'gst'
            ).annotate(
                client=F('client__name'),
                date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
                date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            )
            return list(data)

        if 'quotation_product_detail' in kwargs:
            data = Product.objects.filter(pk=request.POST.get('product_detail'), company_id=company_id).values('pk',
                                                                                                               'type',
                                                                                                               'unit_price')
            return list(data)

        if 'quotation_without_gst' in kwargs:
            data = self.model.objects.filter(company_id=company_id, gst='No').values('pk', 'number', 'gst').annotate(
                client=F('client__name'),
                date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
                date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            ).order_by("-number")
            return list(data)

        data = self.model.objects.filter(company_id=company_id, gst='Yes').values('pk', 'number', 'gst').annotate(
            client=F('client__name'),
            date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                         output_field=CharField()),
            date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
        ).order_by("-number")
        return list(data)


    def get(self, request, *args, **kwargs):
        if 'quotation_order_maker' and 'quotation_order_lines' in kwargs:
            return render(request, self.formTemplate,
                          {'quotation_order_maker': self.quotionForm(),
                           'quotation_order_lines': QuotationLineFormSetData})

        elif 'object_id' in kwargs:
            from .hmToPd import render_to_pdf
            print(kwargs.get('object_id'))
            from .reports import QuotationReport
            data = QuotationReport().get_data(request, quotation_order_id=kwargs.get('object_id'),
                                              company_id=request.session.get('company_id'))

            company_details = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk',
                                                                                                        'name', 'state',
                                                                                                        'address',
                                                                                                        'city',
                                                                                                        'pin_code',
                                                                                                        'country',
                                                                                                        'phone',
                                                                                                        'email_id',
                                                                                                        'website',
                                                                                                        'GSTIN',
                                                                                                        'taxation_type',
                                                                                                        'tax_inclusive',
                                                                                                        'TIN', 'VAT',
                                                                                                        'service_tax_no',
                                                                                                        'CST_tin_no',
                                                                                                        'PAN',
                                                                                                        'additional_details',
                                                                                                        'currency',
                                                                                                        'photo').annotate(


            )
            data.update({
                'company_name': company_details[0]['name'],
                'company_country': company_details[0]['country'],
                'company_address': company_details[0]['address'],
                'company_city': company_details[0]['city'],
                'company_state': company_details[0]['state'],
                'company_pin_code': company_details[0]['pin_code'],
                'company_phone': company_details[0]['phone'],
                'company_email_id': company_details[0]['email_id'],
                'company_website': company_details[0]['website'],
                'company_GSTIN': company_details[0]['GSTIN'],
                'company_taxation_type': company_details[0]['taxation_type'],
                'company_tax_inclusive': company_details[0]['tax_inclusive'],
                'company_TIN': company_details[0]['TIN'],
                'company_VAT': company_details[0]['VAT'],
                'company_service_tax_no': company_details[0]['service_tax_no'],
                'company_CST_tin_no': company_details[0]['CST_tin_no'],
                'company_PAN': company_details[0]['PAN'],
                'company_additional_details': company_details[0]['additional_details'],
                'company_currency': company_details[0]['currency'],
                'company_photo': company_details[0]['photo'],
            })
            print(data['discount_amount'])
            if data['discount_amount'] == 0.00:
                data.update({
                    'discount_condition': 'No',
                })
            else:
                data.update({
                    'discount_condition': 'Yes',
                })

            print(data['grand_total'])
            in_word = str(data['grand_total'])

            def int2words(n, p=inflect.engine()):
                return ''.join(p.number_to_words(n, wantlist=True, andword=''))

            def dollars2words(f):
                d, dot, cents = f.partition('.')
                return "{dollars}{cents} rupees".format(
                    dollars=int2words(int(d)),
                    cents=" and {}/100".format(cents) if cents and int(cents) else '')

            print(dollars2words(in_word))
            data.update({
                'grand_total_in_word': dollars2words(in_word),
            })

            print(data)
            pdf = render_to_pdf('SMdashboard/pdf_quotation.html', data)
            return HttpResponse(pdf, content_type='application/pdf')

        elif 'quotation_without_gst' in kwargs:
            company_id = request.session.get('company_id')
            data = self.get_data(request, user_id=request.user.id, company_id=company_id, quotation_without_gst='')
            print(data)
            return render(request, self.template_name, {'data': data})

        company_id = request.session.get('company_id')
        data = self.get_data(request, user_id=request.user.id, company_id=company_id)
        print(data)

        return render(request, self.template_name, {'data': data})

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            data = self.get_data(request, filter_date='', company_id=request.session.get('company_id'))
            print(data)
            return JsonResponse(data, safe=False)
        if 'quotation_product_detail' in kwargs:
            data = self.get_data(request, company_id=request.session.get('company_id'), quotation_product_detail='')
            print(data)
            return JsonResponse(data, safe=False)

        quotationForm = QuotationForm(request.POST)
        quotationLineFormSet = QuotationLineFormSet(request.POST)

        if quotationForm.is_valid() and quotationLineFormSet.is_valid():

            client = quotationForm.cleaned_data.get('client')
            ship_to = quotationForm.cleaned_data.get('ship_to')
            issue_date = quotationForm.cleaned_data.get('issue_date')
            place_of_supply = quotationForm.cleaned_data.get('place_of_supply')
            gst = quotationForm.cleaned_data.get('gst')

            clean_amount = sum(map(lambda x: x.cleaned_data.get('unit_price') *
                                             x.cleaned_data.get('quantity'), quotationLineFormSet))
            discount_amount = sum(map(lambda x: (x.cleaned_data.get('unit_price') *
                                                 x.cleaned_data.get('discount') / 100) *
                                                x.cleaned_data.get('quantity'), quotationLineFormSet))

            tax_amount = sum(map(lambda x: (x.cleaned_data.get('unit_price') *
                                            int(x.cleaned_data.get('tax')) / 100) *
                                           x.cleaned_data.get('quantity'), quotationLineFormSet))
            total = clean_amount - discount_amount + tax_amount

            total_rounded = round(total)
            rounded_off_value = total_rounded - total

            # getting compny details to compare state
            print("round up check value")
            print(total)
            print(total_rounded)

            company_details = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk',
                                                                                                        'name',
                                                                                                        'state').annotate(

                company_address=Concat(
                    F('address'), Value(', '), F('city'), Value(', '),
                    F('state'), Value(', '),
                    F('pin_code'), Value(', '), F('country'),
                    Value(', '), F('phone'), Value(', '), F('email_id'),
                    Value(', '), F('website'),
                    output_field=CharField())
            )
            company = list(company_details)
            print(company)
            print(company[0]['state'])
            print(place_of_supply)

            if company[0]['state'] == place_of_supply:

                centralGst = tax_amount / 2
                stateGst = tax_amount / 2
            else:
                centralGst = 0.0
                stateGst = 0.0

            if company[0]['state'] != place_of_supply:
                internationalGst = tax_amount
            else:
                internationalGst = 0.0

            # coding cor quotation no. generator

            if gst == 'Yes':
                first_time = self.model.objects.filter(gst='Yes').exists()
                print(first_time)

                if not first_time:
                    quotation_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,

                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value = rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=1
                                                            )
                    lines = []
                    for quotationlines_form in quotationLineFormSet:
                        # lines.append(InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=quotation_obj.pk))
                        # InvoiceLines.objects.bulk_create(lines)
                        lines_object = Quotation_lines(**quotationlines_form.cleaned_data, quotation_id=quotation_obj.pk)
                        lines_object.save()

                else:
                    second_time = self.model.objects.filter(gst='Yes').count()
                    print(second_time)
                    print("second condition")

                    quotation_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,

                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=second_time + 1
                                                            )
                    lines = []
                    for quotationlines_form in quotationLineFormSet:
                        # lines.append(InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=quotation_obj.pk))
                        # InvoiceLines.objects.bulk_create(lines)
                        lines_object = Quotation_lines(**quotationlines_form.cleaned_data, quotation_id=quotation_obj.pk)
                        lines_object.save()


            if gst == 'No':
                first_time = self.model.objects.filter(gst='No').exists()
                print(first_time)

                if not first_time:
                    quotation_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,

                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=1
                                                            )

                    lines = []
                    for quotationlines_form in quotationLineFormSet:
                        # lines.append(InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=quotation_obj.pk))
                        # InvoiceLines.objects.bulk_create(lines)
                        lines_object = Quotation_lines(**quotationlines_form.cleaned_data, quotation_id=quotation_obj.pk)
                        lines_object.save()

                else:
                    second_time = self.model.objects.filter(gst='No').count()
                    print(second_time)
                    print(" no second condition")

                    quotation_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,

                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=second_time + 1
                                                            )

                    lines = []
                    for quotationlines_form in quotationLineFormSet:
                        # lines.append(InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=quotation_obj.pk))
                        # InvoiceLines.objects.bulk_create(lines)
                        lines_object = Quotation_lines(**quotationlines_form.cleaned_data, quotation_id=quotation_obj.pk)
                        lines_object.save()


            return redirect(to='quotation_order_table')

        return redirect(to='quotation_order_maker')


class InvoiceView(OwnerRequiredMinxin, ListView):
    template_name = 'SMdashboard/table-invoice.html'
    formTemplate = 'SMdashboard/invoice_build.html'
    model = Invoice
    detailed_template_view = 'SMdashboard/view-invoice.html'
    invoiceForm = InvoiceForm

    def get_data(self, request, company_id=None, *args, **kwargs):
        if 'filter_date' in kwargs:
            data = Invoice.objects.filter(issue_date__gte=request.POST.get('fromDate'),
                                          issue_date__lte=request.POST.get('toDate'),
                                          company_id=company_id).values(
                'pk', 'number', 'gst'
            ).annotate(
                client=F('client__name'),
                date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
                date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            )

            return list(data)

        if 'product_detail' in kwargs:
            data = Product.objects.filter(pk=request.POST.get('product_detail'), company_id=company_id).values(
                'pk', 'type', 'unit_price')
            return list(data)

        if 'client_billing_state_detail' in kwargs:
            print(request.POST.get('client_billing_state_detail'))
            data = Client.objects.filter(pk=request.POST.get('client_billing_state_detail'),
                                         company_id=company_id).values(
                'pk', 'billing_state', 'billing_address')
            return list(data)

        if 'invoice_without_gst' in kwargs:
            data = self.model.objects.filter(company_id=company_id, gst='No').values('pk', 'number', 'gst').annotate(
                client=F('client__name'),
                date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
                date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            ).order_by("-number")
            return list(data)

        data = self.model.objects.filter(company_id=company_id, gst='Yes').values('pk', 'number', 'gst').annotate(
            client=F('client__name'),
            date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                         output_field=CharField()),
            date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
        ).order_by("-number")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'invoice_maker' and 'invoice_lines' in kwargs:
            return render(request, self.formTemplate,
                          {'invoice_maker': self.invoiceForm(),
                           'invoice_lines': InvoiceLineFormSetData})

        elif 'object_id' in kwargs:
            from .hmToPd import render_to_pdf
            print(kwargs.get('object_id'))
            from .reports import InvoiceReport
            data = InvoiceReport().get_data(request, invoice_order_id=kwargs.get('object_id'),
                                            company_id=request.session.get('company_id'))

            company_details = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk',
                                                                                                        'name', 'state',
                                                                                                        'address',
                                                                                                        'city',
                                                                                                        'pin_code',
                                                                                                        'country',
                                                                                                        'phone',
                                                                                                        'email_id',
                                                                                                        'website',
                                                                                                        'GSTIN',
                                                                                                        'taxation_type',
                                                                                                        'tax_inclusive',
                                                                                                        'TIN', 'VAT',
                                                                                                        'service_tax_no',
                                                                                                        'CST_tin_no',
                                                                                                        'PAN',
                                                                                                        'additional_details',
                                                                                                        'currency',
                                                                                                        'photo').annotate(

                # company_address=Concat(
                #     F('address'), Value(', '), F('city'), Value(', '),
                #     F('state'), Value(', '),
                #     F('pin_code'), Value(', '), F('country'),
                #     Value(', '), F('phone'), Value(', '), F('email_id'),
                #     Value(', '), F('website'),
                #     output_field=CharField())
            )
            # company = list(company_details)

            data.update({
                'company_name': company_details[0]['name'],
                'company_country': company_details[0]['country'],
                'company_address': company_details[0]['address'],
                'company_city': company_details[0]['city'],
                'company_state': company_details[0]['state'],
                'company_pin_code': company_details[0]['pin_code'],
                'company_phone': company_details[0]['phone'],
                'company_email_id': company_details[0]['email_id'],
                'company_website': company_details[0]['website'],
                'company_GSTIN': company_details[0]['GSTIN'],
                'company_taxation_type': company_details[0]['taxation_type'],
                'company_tax_inclusive': company_details[0]['tax_inclusive'],
                'company_TIN': company_details[0]['TIN'],
                'company_VAT': company_details[0]['VAT'],
                'company_service_tax_no': company_details[0]['service_tax_no'],
                'company_CST_tin_no': company_details[0]['CST_tin_no'],
                'company_PAN': company_details[0]['PAN'],
                'company_additional_details': company_details[0]['additional_details'],
                'company_currency': company_details[0]['currency'],
                'company_photo': company_details[0]['photo'],
            })
            print(data['discount_amount'])
            if data['discount_amount'] == 0.00:
                data.update({
                    'discount_condition': 'No',
                })
            else:
                data.update({
                    'discount_condition': 'Yes',
                })

            print(data['grand_total'])
            in_word = str(data['grand_total'])

            def int2words(n, p=inflect.engine()):
                return ''.join(p.number_to_words(n, wantlist=True, andword=''))

            def dollars2words(f):
                d, dot, cents = f.partition('.')
                return "{dollars}{cents} rupees".format(
                    dollars=int2words(int(d)),
                    cents=" and {}/100".format(cents) if cents and int(cents) else '')

            print(dollars2words(in_word))
            data.update({
                'grand_total_in_word': dollars2words(in_word),
            })

            print(data)
            pdf = render_to_pdf('SMdashboard/pdf_template.html', data)
            return HttpResponse(pdf, content_type='application/pdf')

        elif 'invoice_without_gst' in kwargs:
            company_id = request.session.get('company_id')
            data = self.get_data(request, user_id=request.user.id, company_id=company_id, invoice_without_gst='')
            print(data)
            return render(request, self.template_name, {'data': data})

        company_id = request.session.get('company_id')
        data = self.get_data(request, user_id=request.user.id, company_id=company_id)
        print(data)
        return render(request, self.template_name, {'data': data})

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            data = self.get_data(request, filter_date='', company_id=request.session.get('company_id'))
            print(data)
            return JsonResponse(data, safe=False)
        if 'product_detail' in kwargs:
            data = self.get_data(request, company_id=request.session.get('company_id'), product_detail='')
            print(data)
            return JsonResponse(data, safe=False)

        if 'client_billing_state_detail' in kwargs:
            data = self.get_data(request, company_id=request.session.get('company_id'), client_billing_state_detail='')
            print(data)
            return JsonResponse(data, safe=False)

        invoiceForm = InvoiceForm(request.POST)
        invoiceLineFormSet = InvoiceLineFormSet(request.POST)
        # print(invoiceForm.is_valid())
        # print(invoiceForm)
        # print(invoiceLineFormSet.is_valid())
        # print(invoiceLineFormSet)
        if invoiceForm.is_valid() and invoiceLineFormSet.is_valid():
            client = invoiceForm.cleaned_data.get('client')
            ship_to = invoiceForm.cleaned_data.get('ship_to')
            issue_date = invoiceForm.cleaned_data.get('issue_date')
            place_of_supply = invoiceForm.cleaned_data.get('place_of_supply')
            payment_terms = invoiceForm.cleaned_data.get('payment_terms')
            gst = invoiceForm.cleaned_data.get('gst')
            clean_amount = sum(map(lambda x: x.cleaned_data.get('unit_price') *
                                             x.cleaned_data.get('quantity'), invoiceLineFormSet))
            discount_amount = sum(map(lambda x: (x.cleaned_data.get('unit_price') *
                                                 x.cleaned_data.get('discount') / 100) *
                                                x.cleaned_data.get('quantity'), invoiceLineFormSet))
            tax_amount = sum(map(lambda x: (x.cleaned_data.get('unit_price') *
                                            int(x.cleaned_data.get('tax')) / 100) *
                                           x.cleaned_data.get('quantity'), invoiceLineFormSet))
            total = clean_amount - discount_amount + tax_amount

            total_rounded = round(total)
            rounded_off_value = total_rounded - total

            print(clean_amount)
            print(discount_amount)
            print(tax_amount)
            print(total)

            company_details = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk',
                                                                                                        'name',
                                                                                                        'state').annotate(

                company_address=Concat(
                    F('address'), Value(', '), F('city'), Value(', '),
                    F('state'), Value(', '),
                    F('pin_code'), Value(', '), F('country'),
                    Value(', '), F('phone'), Value(', '), F('email_id'),
                    Value(', '), F('website'),
                    output_field=CharField())
            )
            company = list(company_details)
            print(company)
            print(company[0]['state'])
            print(place_of_supply)

            if company[0]['state'] == place_of_supply:

                centralGst = tax_amount / 2
                stateGst = tax_amount / 2
            else:
                centralGst = 0.0
                stateGst = 0.0

            if company[0]['state'] != place_of_supply:
                internationalGst = tax_amount
            else:
                internationalGst = 0.0

            # for invoice no. coding

            if gst == 'Yes':
                first_time = self.model.objects.filter(gst='Yes').exists()
                print(first_time)

                if not first_time:

                    invoice_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=1
                                                            )
                    lines = []
                    for invoicelines_form in invoiceLineFormSet:
                        # lines.append(InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=invoice_obj.pk))
                        # InvoiceLines.objects.bulk_create(lines)
                        lines_object = InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=invoice_obj.pk)
                        lines_object.save()

                else:
                    second_time = self.model.objects.filter(gst='Yes').count()
                    print(second_time)
                    print("second condition")

                    invoice_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=second_time + 1
                                                            )
                    lines = []
                    for invoicelines_form in invoiceLineFormSet:
                        # lines.append(InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=invoice_obj.pk))
                        # InvoiceLines.objects.bulk_create(lines)

                        lines_object = InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=invoice_obj.pk)
                        lines_object.save()

            if gst == 'No':
                first_time = self.model.objects.filter(gst='No').exists()
                print(first_time)

                if not first_time:
                    invoice_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=1
                                                            )

                    for invoicelines_form in invoiceLineFormSet:

                        lines_object = InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=invoice_obj.pk)
                        lines_object.save()

                else:
                    second_time = self.model.objects.filter(gst='No').count()
                    print(second_time)
                    print(" no second condition")

                    invoice_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=second_time + 1
                                                            )

                    for invoicelines_form in invoiceLineFormSet:

                        lines_object = InvoiceLines(**invoicelines_form.cleaned_data, invoice_id=invoice_obj.pk)
                        lines_object.save()


            return redirect(to='invoice_table')
        return redirect(to='invoice_maker')

class BillOfSupplyView(OwnerRequiredMinxin, ListView):
    template_name = 'SMdashboard/table-billOfSupply.html'
    formTemplate = 'SMdashboard/billOfSupply_build.html'
    model = BillOfSupply
    detailed_template_view = 'SMdashboard/view-billOfSupply.html'
    billOfSupplyForm = BillOfSupplyForm

    def get_data(self, request, company_id=None, *args, **kwargs):
        if 'filter_date' in kwargs:
            data = BillOfSupply.objects.filter(issue_date__gte=request.POST.get('fromDate'),
                                          issue_date__lte=request.POST.get('toDate'),
                                          company_id=company_id).values(
                'pk', 'number', 'gst'
            ).annotate(
                client=F('client__name'),
                date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
                date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            ).order_by("-number")
            return list(data)

        if 'billOfSupply_without_gst' in kwargs:
            data = self.model.objects.filter(company_id=company_id, gst='No').values('pk', 'number', 'gst').annotate(
                client=F('client__name'),
                date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                             output_field=CharField()),
                date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                           output_field=CharField()),
            ).order_by("-number")
            return list(data)

        data = self.model.objects.filter(company_id=company_id, gst='Yes').values('pk', 'number', 'gst').annotate(
            client=F('client__name'),
            date_issue=ExpressionWrapper(Func(F('issue_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                         output_field=CharField()),
            date_due=ExpressionWrapper(Func(F('due_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
        ).order_by("-number")
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'billOfSupply_maker' and 'billOfSupply_lines' in kwargs:
            return render(request, self.formTemplate,
                          {'billOfSupply_maker': self.billOfSupplyForm(),
                           'billOfSupply_lines': BillOfSupplyLineFormSetData})

        elif 'object_id' in kwargs:
            from .hmToPd import render_to_pdf
            print(kwargs.get('object_id'))
            from .reports import BillOfSupplyReport
            data = BillOfSupplyReport().get_data(request, billOfSupply_id=kwargs.get('object_id'),
                                            company_id=request.session.get('company_id'))

            company_details = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk',
                                                                                                        'name', 'state',
                                                                                                        'address',
                                                                                                        'city',
                                                                                                        'pin_code',
                                                                                                        'country',
                                                                                                        'phone',
                                                                                                        'email_id',
                                                                                                        'website',
                                                                                                        'GSTIN',
                                                                                                        'taxation_type',
                                                                                                        'tax_inclusive',
                                                                                                        'TIN', 'VAT',
                                                                                                        'service_tax_no',
                                                                                                        'CST_tin_no',
                                                                                                        'PAN',
                                                                                                        'additional_details',
                                                                                                        'currency',
                                                                                                        'photo').annotate(


            )
            # company = list(company_details)

            data.update({
                'company_name': company_details[0]['name'],
                'company_country': company_details[0]['country'],
                'company_address': company_details[0]['address'],
                'company_city': company_details[0]['city'],
                'company_state': company_details[0]['state'],
                'company_pin_code': company_details[0]['pin_code'],
                'company_phone': company_details[0]['phone'],
                'company_email_id': company_details[0]['email_id'],
                'company_website': company_details[0]['website'],
                'company_GSTIN': company_details[0]['GSTIN'],
                'company_taxation_type': company_details[0]['taxation_type'],
                'company_tax_inclusive': company_details[0]['tax_inclusive'],
                'company_TIN': company_details[0]['TIN'],
                'company_VAT': company_details[0]['VAT'],
                'company_service_tax_no': company_details[0]['service_tax_no'],
                'company_CST_tin_no': company_details[0]['CST_tin_no'],
                'company_PAN': company_details[0]['PAN'],
                'company_additional_details': company_details[0]['additional_details'],
                'company_currency': company_details[0]['currency'],
                'company_photo': company_details[0]['photo'],
            })
            print(data['discount_amount'])
            if data['discount_amount'] == 0.00:
                data.update({
                    'discount_condition': 'No',
                })
            else:
                data.update({
                    'discount_condition': 'Yes',
                })

            print(data['grand_total'])
            in_word = str(data['grand_total'])

            def int2words(n, p=inflect.engine()):
                return ''.join(p.number_to_words(n, wantlist=True, andword=''))

            def dollars2words(f):
                d, dot, cents = f.partition('.')
                return "{dollars}{cents} rupees".format(
                    dollars=int2words(int(d)),
                    cents=" and {}/100".format(cents) if cents and int(cents) else '')

            print(dollars2words(in_word))
            data.update({
                'grand_total_in_word': dollars2words(in_word),
            })
            print("ok in id")
            print(data)
            pdf = render_to_pdf('SMdashboard/pdf_billOfSupply.html', data)
            return HttpResponse(pdf, content_type='application/pdf')



        elif 'billOfSupply_without_gst' in kwargs:
            company_id = request.session.get('company_id')
            data = self.get_data(request, user_id=request.user.id, company_id=company_id, billOfSupply_without_gst='')
            print(data)
            return render(request, self.template_name, {'data': data})


        company_id = request.session.get('company_id')
        data = self.get_data(request, user_id=request.user.id, company_id=company_id)

        print(data)
        return render(request, self.template_name, {'data': data})

    def post(self, request, *args, **kwargs):
        if 'filterDate' in kwargs:
            data = self.get_data(request, filter_date='', company_id=request.session.get('company_id'))
            print(data)
            return JsonResponse(data, safe=False)

        billOfSupplyForm = BillOfSupplyForm(request.POST)
        billOfSupplyLineFormSet = BillOfSupplyLineFormSet(request.POST)

        if billOfSupplyForm.is_valid() and billOfSupplyLineFormSet.is_valid():
            client = billOfSupplyForm.cleaned_data.get('client')
            ship_to = billOfSupplyForm.cleaned_data.get('ship_to')
            issue_date = billOfSupplyForm.cleaned_data.get('issue_date')
            place_of_supply = billOfSupplyForm.cleaned_data.get('place_of_supply')
            payment_terms = billOfSupplyForm.cleaned_data.get('payment_terms')
            gst = billOfSupplyForm.cleaned_data.get('gst')

            clean_amount = sum(map(lambda x: x.cleaned_data.get('unit_price') *
                                             x.cleaned_data.get('quantity'), billOfSupplyLineFormSet))
            discount_amount = sum(map(lambda x: (x.cleaned_data.get('unit_price') *
                                                 x.cleaned_data.get('discount') / 100) *
                                                x.cleaned_data.get('quantity'), billOfSupplyLineFormSet))
            tax_amount = sum(map(lambda x: (x.cleaned_data.get('unit_price') *
                                            int(x.cleaned_data.get('tax')) / 100) *
                                           x.cleaned_data.get('quantity'), billOfSupplyLineFormSet))
            total = clean_amount - discount_amount + tax_amount

            total_rounded = round(total)
            rounded_off_value = total_rounded - total

            print(clean_amount)
            print(discount_amount)
            print(tax_amount)
            print(total)

            company_details = CompanyDetail.objects.filter(pk=request.session.get('company_id')).values('pk',
                                                                                                        'name',
                                                                                                        'state').annotate(

                company_address=Concat(
                    F('address'), Value(', '), F('city'), Value(', '),
                    F('state'), Value(', '),
                    F('pin_code'), Value(', '), F('country'),
                    Value(', '), F('phone'), Value(', '), F('email_id'),
                    Value(', '), F('website'),
                    output_field=CharField())
            )
            company = list(company_details)
            print(company)
            print(company[0]['state'])
            print(place_of_supply)

            if company[0]['state'] == place_of_supply:

                centralGst = tax_amount / 2
                stateGst = tax_amount / 2
            else:
                centralGst = 0.0
                stateGst = 0.0

            if company[0]['state'] != place_of_supply:
                internationalGst = tax_amount
            else:
                internationalGst = 0.0

            # for generating no.
            if gst == 'Yes':
                first_time = self.model.objects.filter(gst='Yes').exists()
                print(first_time)

                if not first_time:

                    billOfSupply_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=1
                                                            )
                    lines = []
                    for billOfSupplylines_form in billOfSupplyLineFormSet:
                        # lines.append(BillOfSupplyLines(**billOfSupplylines_form.cleaned_data, bill_id=billOfSupply_obj.pk))
                        # BillOfSupplyLines.objects.bulk_create(lines)
                        lines_object = BillOfSupplyLines(**billOfSupplylines_form.cleaned_data, bill_id=billOfSupply_obj.pk)
                        lines_object.save()
                else:
                    second_time = self.model.objects.filter(gst='Yes').count()
                    print(second_time)
                    print("second condition")
                    billOfSupply_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=second_time + 1
                                                            )
                    lines = []
                    for billOfSupplylines_form in billOfSupplyLineFormSet:
                        # lines.append(BillOfSupplyLines(**billOfSupplylines_form.cleaned_data, bill_id=billOfSupply_obj.pk))
                        # BillOfSupplyLines.objects.bulk_create(lines)

                        lines_object = BillOfSupplyLines(**billOfSupplylines_form.cleaned_data, bill_id=billOfSupply_obj.pk)
                        lines_object.save()

            if gst == 'No':
                first_time = self.model.objects.filter(gst='No').exists()
                print(first_time)

                if not first_time:
                    billOfSupply_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=1
                                                            )

                    for billOfSupplylines_form in billOfSupplyLineFormSet:
                        lines_object = BillOfSupplyLines(**billOfSupplylines_form.cleaned_data,bill_id=billOfSupply_obj.pk)
                        lines_object.save()

                else:
                    second_time = self.model.objects.filter(gst='No').count()
                    print(second_time)
                    print(" no second condition")

                    billOfSupply_obj = self.model.objects.create(client=client, ship_to=ship_to, issue_date=issue_date,
                                                            place_of_supply=place_of_supply,
                                                            payment_terms=payment_terms,
                                                            company_id=request.session.get("company_id"),
                                                            clean_amount=clean_amount,
                                                            discount_amount=discount_amount,
                                                            tax_amount=tax_amount,
                                                            grand_total=total_rounded,
                                                            grand_total_without_round=total,
                                                            rounded_off_value=rounded_off_value,
                                                            centralGst=centralGst,
                                                            stateGst=stateGst,
                                                            internationalGst=internationalGst,
                                                            gst=gst,
                                                            number=second_time + 1
                                                            )

                    for billOfSupplylines_form in billOfSupplyLineFormSet:
                        lines_object = BillOfSupplyLines(**billOfSupplylines_form.cleaned_data,bill_id=billOfSupply_obj.pk)
                        lines_object.save()

            return redirect(to='billOfSupply_table')
        return redirect(to='billOfSupply_maker')