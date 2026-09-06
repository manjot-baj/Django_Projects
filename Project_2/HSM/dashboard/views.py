import json

from braces.views import GroupRequiredMixin
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import (Case, CharField, Count, DateTimeField,
                              ExpressionWrapper, F, FloatField, Func, Max, Min,
                              Prefetch, Q, Sum, Value, When)
from django.db.models.functions import Concat
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.generic import ListView, View

from hsm import maintenance
from hsm.account import AccountLine
from hsm.constants import SECRETORY_GROUP
from hsm.forms import PaymentForm
from hsm.helpdesk import Complaint, ComplaintCategory
from hsm.models import ResPartner
from hsm.society import ResFlat, ResSociety, Notice
from hsm.POMaker import PurchaseOrderMaker, PurchaseOrderLine
from rest_framework.authtoken.models import Token


class SecretoryRequiredMinxin(GroupRequiredMixin):
    group_required = SECRETORY_GROUP
    login_url = 'dashboard:login'


class Dashboard(View):
    login_required = False
    dashboard_template = 'dashboard/dashboard.html'
    login_template = 'dashboard/login.html'

    def get(self, request, *args, **kwargs):
        if 'logout' in kwargs:
            logout(request)
            return render(request, self.login_template)
        elif request.user.is_authenticated:
            society_ids = request.session.get('society_ids')
            info = ResSociety.objects.filter(pk__in=society_ids).values('name').annotate(
                flat_allocated=Count('resflat', filter=F('resflat__is_allocated')),
                total_flats=Count('resflat'),
                address=Concat(
                    F('partner__street1'), Value(','), F('partner__street2'), Value(','),
                    F('partner__city'), Value(','),
                    F('partner__state__name'), Value(','), F('partner__country__name'),
                    Value(','), F('partner__zip_code'),
                    output_field=CharField())
            )[0]
            ctx = {'society': info}
            return render(request, self.dashboard_template, context=ctx)
        else:
            return render(request, self.login_template)


def post(self, request, *args, **kwargs) -> render:
        print(kwargs)
        if 'login' in kwargs:
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(request, username=username, password=password)
            data = {}
            # if user and user.has_perm('dashboard.view_dashboard'):
            if user:
                a = login(request, user)
                society_rec = ResSociety.objects.filter(resflat__flat_owner__user=request.user).aggregate(
                    flat_ids=ArrayAgg('resflat__pk'), society_ids=ArrayAgg('pk', distinct=True))
                print(f" This is Society REc ******** {society_rec}")
                request.session['society_ids'] = society_rec['society_ids']
                request.session['flat_ids'] = society_rec['flat_ids']
                Token.objects.get_or_create(user=user)
                return render(request, self.dashboard_template)
            else:
                return render(request, self.login_template)
        else:
            return render(request, self.login_template)


class DashboardLoginRequiredMixin(LoginRequiredMixin):
    login_url = 'dashboard:login'


class Maintenance(DashboardLoginRequiredMixin, ListView):
    template_name = 'dashboard/table-maintenance.html'
    detailed_template_view = 'dashboard/view-maintenance.html'

    def get_data(self, request, user_id=None):
        qs = maintenance.Maintenance.objects.filter()
        if request.user.groups.filter(name=SECRETORY_GROUP).exists():
            qs = qs.filter(flat__society__pk__in=request.session.get('society_ids'))
        else:
            qs = qs.filter(flat__flat_owner__user=user_id)
        data = qs.annotate(
            flat_number=Concat('flat__wing__name', Value("-"), 'flat__number', output_field=CharField()),
            payment_method=F('transaction__payment_method'),
            bill_date_format=ExpressionWrapper(
                Func(F('bill_date'), Value("DD/MM/YYY"), function='TO_CHAR'), output_field=CharField()),
            paid_date_format=ExpressionWrapper(
                Func(F('paid_date'), Value("DD/MM/YYY"), function='TO_CHAR'), output_field=CharField())
        ).values(
            'name',
            'flat_number',
            'bill_date_format',
            'paid_date_format',
            'state', 'payment_method', 'pk'
        ).annotate(
            amount=Sum('total'),
            paid=Sum(F('total'), filter=Q(state=maintenance.Maintenance.STATE_TYPE_PAID)),
            unpaid=Sum(F('total'), filter=Q(state=maintenance.Maintenance.STATE_TYPE_UNPAID)),
            dues=F('total') - F('sub_total'),
        ).order_by(
            F('bill_date').desc(nulls_last=True)
        )
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'object_id' in kwargs and ResPartner.objects.filter(user=request.user).filter(
                owner_flat__maintenance__id=kwargs['object_id']).count():
            from hsm.reports import MaintenanceReport
            data = MaintenanceReport().get_data(request, maintenance_id=kwargs.get('object_id'))
            template = self.detailed_template_view
            return render(request, template, data)
        else:
            data = self.get_data(request, user_id=request.user.id)
            template = self.template_name
        return render(request, template, {'data': json.dumps(data), 'payment': PaymentForm()})

    def post(self, request, *args, **kwargs):
        if 'maintenance_info':
            from hsm.reports import MaintenanceReport
            data = MaintenanceReport().get_data(request, maintenance_id=kwargs.get('object_id'))

        return render(request, self.template_name)


class NoticeView(DashboardLoginRequiredMixin, View):
    template_name = 'dashboard/table-notice.html'

    def get_data(self, user_id=None):
        from hsm import maintenance
        data = {}
        return json.dumps(list(data))

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        return render(request, self.template_name)


class Members(DashboardLoginRequiredMixin, View):
    from hsm.models import ResPartner
    template_name = 'dashboard/table-members.html'
    model = ResPartner

    def get_data(self, user_id=None, society_ids=None):
        from hsm.models import ResPartner
        from hsm.society import ResFlat, ResSociety
        # society_ids = ResPartner.objects.filter(user_id=user_id).values_list('society', flat=True)
        data = []
        print(society_ids)
        data = self.model.objects.filter(society__in=society_ids).values(
            'pk', 'alt_mobile_no', 'mobile_no', 'email'
        ).annotate(
            member_name=Concat('user__first_name', Value(' '), 'user__last_name'),
            dob=ExpressionWrapper(Func(F('dob'), Value("DD/MM/YYY"), function='TO_CHAR'), output_field=CharField()),
        )

        # for flat in flat_obj:
        #     owners_list = []
        #     if flat.flat_owner.exists():
        #         owners_list = [' '.join([owner.user.first_name, owner.user.last_name]) for owner in flat.flat_owner.all()]
        #     data.append({'wing_name': flat.wing_name, 'society_name': flat.society_name, 'number': flat.number,
        #                  'owners': owners_list})
        return list(data)

    def get(self, request, *args, **kwargs):
        society_ids = request.session.get('society_ids')
        data = self.get_data(user_id=request.user.id, society_ids=society_ids)
        print(data)
        return render(request, self.template_name, {'data': data})

    def post(self, request, *args, **kwargs):
        return render(request, self.template_name)


class HelpDesk(DashboardLoginRequiredMixin, View):
    from .forms import ComplaintForm
    template_name = 'dashboard/table-helpDesk.html'
    formTemplate = 'dashboard/complaint_form.html'
    form = ComplaintForm()

    def get_data(self, user_id=None):
        from hsm.models import ResPartner
        data = Complaint.objects.filter(create_user_id=user_id).values(
            'name', 'status_type', 'reply'
        ).annotate(
            create_date=ExpressionWrapper(Func(F('create_date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                          output_field=CharField()),
            complaint_type=F('complaint_type__name')

        )
        # Name = models.CharField(max_length=20)
        # Complaint_type = models.ForeignKey(Complaint, on_delete=models.SET_NULL, null=True, blank=False)
        # Comment = models.TextField()
        # Date_time = models.DateTimeField(default=timezone.now)
        # Status_type = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, blank=False, default='Pending')
        # Reply =

        return list(data)

    def get(self, request, *args, **kwargs):
        if 'complaint_form' in kwargs:
            return render(request, self.formTemplate, {'complaint': self.form})
        data = self.get_data(user_id=request.user.id)
        print(data)
        return render(request, self.template_name, {'data': json.dumps(data)})

    def post(self, request, *args, **kwargs):
        form = self.ComplaintForm(request.POST)
        print(form.is_valid())
        print(form)
        if form.is_valid():
            name = form.cleaned_data.get('name')
            complaint = form.cleaned_data.get('complaint_type')
            comment = form.cleaned_data.get('comment')
            status = Complaint.STATUS_SUBMITTED
            Complaint.objects.create(
                name=name, complaint_type=complaint, comment=comment, status_type=status,
                create_user=request.user, write_user=request.user)
        return redirect(to='dashboard:complaint_table')


class Accounting(DashboardLoginRequiredMixin, View):
    template_name = 'dashboard/table-accounting.html'

    def get_data(self, user_id):
        data = {}
        data = AccountLine.objects.filter(account__partner__user__id=user_id).values('pk', 'amount',
                                                                                     'action_type').annotate(
            create_date=ExpressionWrapper(Func(F('create_date'), Value("DD/MM/YYY"), function='TO_CHAR'),
                                          output_field=CharField()),
            payment_type=F('transaction__payment_method'),
            name=F('account__name'),
            balance=F('account__balance'),
        )
        print(data)
        return list(data)

    def get(self, request, *args, **kwargs):
        data = self.get_data(user_id=request.user.id)
        print(data)
        return render(request, self.template_name, {'data': data})


class Flats(DashboardLoginRequiredMixin, View):
    template_name = 'dashboard/table-flats.html'
    model = ResFlat

    def get_data(self, user_id=None, society_ids=None):
        flats = []
        # society_ids = request.session.get('society_ids')
        data = self.model.objects.filter(society_id__in=society_ids).annotate(
            registration_date_str=ExpressionWrapper(
                Func(F('registration_date'), Value("DD/MM/YYY"), function='TO_CHAR'), output_field=CharField()),
            wing_str=F('wing__name'),
            is_allocated_str=Case(When(is_allocated=True, then=Value('Yes')), default=Value('No'),
                                  output_field=CharField())
        ).prefetch_related('flat_owner__user')

        for rec in data:
            flats.append({
                'pk': rec.pk, 'number': rec.number, 'area': rec.area, 'registration_number': rec.registration_number,
                'registration_date': rec.registration_date_str, 'wing': rec.wing_str,
                'is_allocated': rec.is_allocated_str,
                'owner': '<br>'.join([owner.user.get_full_name() for owner in rec.flat_owner.all()])
            })
        return flats

    def get(self, request, *args, **kwargs):
        society_ids = request.session.get('society_ids')
        print(society_ids)
        data = self.get_data(user_id=request.user.id, society_ids=society_ids)
        print(data)
        return render(request, self.template_name, {'data': data})


class Profile(DashboardLoginRequiredMixin, View):
    template_name = 'dashboard/profile.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        return render(request, self.template_name)


class GetNotice(DashboardLoginRequiredMixin, View):
    from .forms import NoticeForm
    template_name = 'dashboard/notice.html'
    formTemplate = 'dashboard/add_notice.html'
    form = NoticeForm()
    model = Notice

    def get_data(self, user_id=None, society_ids=None):
        data = self.model.objects.filter(society_id__in=society_ids).order_by("-date").values('title', 'description',
                                                                                              'date')
        print(data)
        return list(data)

    def get(self, request, *args, **kwargs):
        society_ids = request.session.get('society_ids')
        if 'add_notice' in kwargs:
            return render(request, self.formTemplate, {'add_notice': self.form})
        data = self.get_data(user_id=request.user.id, society_ids=society_ids)
        return render(request, self.template_name, {'data': data})

    def post(self, request, *args, **kwargs):
        from .forms import NoticeForm
        if request.method == 'POST':
            form = NoticeForm(request.POST)
            if form.is_valid():
                title = form.cleaned_data.get('title')
                description = form.cleaned_data.get('description')
                society = request.session.get('society_ids')[0]
                Notice(title=title, description=description, society_id=society, create_user=request.user,
                       write_user=request.user).save()
        return redirect(to='dashboard:my_notices')


class CurrentUser(DashboardLoginRequiredMixin, View):
    def get_data(self, user_id):
        data = {}
        data = User.objects.filter(username=user_id).values('id', 'username', 'password', 'first_name', 'last_name')
        print(data)
        return list(data)


class ComplaintType(DashboardLoginRequiredMixin, View):
    def get_data(self, request):
        data = {}
        data = ComplaintCategory.objects.all().values('id', 'name', 'description')
        print(data)
        return list(data)


class Vehicle(DashboardLoginRequiredMixin, View):
    from hsm.vehicle import PartnerVehicle
    template_name = 'dashboard/table-vehicle.html'
    model = PartnerVehicle

    def get_data(self, user_id=None, society_ids=None):
        data = self.model.objects.filter(society__in=society_ids).values('vehicle', 'registration_number').annotate(
            owner=F('owner__name'),
        )
        return list(data)

    def get(self, request, *args, **kwargs):
        society_ids = request.session.get('society_ids')
        data = self.get_data(user_id=request.user.id, society_ids=society_ids)
        print(data)
        return render(request, self.template_name, {'data': json.dumps(data)})


class PurchaseOrder(DashboardLoginRequiredMixin, ListView):
    from .forms import PurchaseForm, PurchaseLineForm
    template_name = 'dashboard/table-purchase-order.html'
    formTemplate = 'dashboard/purchase_order_build.html'
    model = PurchaseOrderMaker
    detailed_template_view = 'dashboard/view-purchase.html'
    form1 = PurchaseForm()
    form2 = PurchaseLineForm()

    def get_data(self, request, user_id=None, society_ids=None, ** kwargs):
        if 'filter_date' in kwargs:
            data = self.model.objects.filter(society__in=society_ids,
                                             date__gte=request.POST.get('fromDate'),
                                             date__lte=request.POST.get('toDate')).values('pk', 'purchase_order_no') \
                .annotate(
                vendor=F('vendor__name'),
                date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                       output_field=CharField()),
                grand_total=ExpressionWrapper(
                    F('grand_total'), output_field=FloatField())
            ).order_by('-date')
            return list(data)
        data = self.model.objects.filter(society__in=society_ids).values('pk', 'purchase_order_no') \
            .annotate(
            vendor=F('vendor__name'), date=ExpressionWrapper(Func(F('date'), Value("DD/MM/YYYY"), function='TO_CHAR'),
                                                             output_field=CharField()),
            grand_total=ExpressionWrapper(
                F('grand_total'), output_field=FloatField())
        ).order_by('-date')
        return list(data)

    def get(self, request, *args, **kwargs):
        if 'purchase_order_maker' and 'purchase_order_lines' in kwargs:
            return render(request, self.formTemplate,
                          {'purchase_order_maker': self.form1, 'purchase_order_lines': self.form2})

        elif 'object_id' in kwargs:
            from hsm.POreports import PurchaseOrderReport
            data = PurchaseOrderReport().get_data(request, purchase_order_id=kwargs.get('object_id'))
            template = self.detailed_template_view
            return render(request, template, data)

        society_ids = request.session.get('society_ids')
        data = self.get_data(request, user_id=request.user.id, society_ids=society_ids)
        print(data)
        return render(request, self.template_name, {'data': data})

    def post(self, request, *args, **kwargs):
        from .forms import PurchaseForm, PurchaseLineForm
        if request.method == 'POST':
            form1 = PurchaseForm(request.POST)
            form2 = PurchaseLineForm(request.POST)
            if form1.is_valid() and form2.is_valid():
                date = form1.cleaned_data.get('date')
                purchase_order_no = form1.cleaned_data.get('purchase_order_no')
                society = request.session.get('society_ids')[0]
                vendor = form1.cleaned_data.get('vendor')
                special_instructions = form1.cleaned_data.get('special_instructions')
                product = form2.cleaned_data.get('product')
                quantity = form2.cleaned_data.get('quantity')
                product_unit_price = form2.cleaned_data.get('product_unit_price')
                PurchaseOrderMaker(date=date, purchase_order_no=purchase_order_no,
                                   society_id=society, vendor=vendor,
                                   special_instructions=special_instructions).save()
                PurchaseOrderLine(product=product, quantity=quantity, product_unit_price=product_unit_price).save()

                if 'filterDate' in kwargs:
                    data = self.get_data(request, user_id=request.user.id, filter_date='')
                    print(data)
                    return JsonResponse(data, safe=False)

        return redirect(to='dashboard:purchase_order_table')
