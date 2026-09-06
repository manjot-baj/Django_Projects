from django.contrib.auth.models import User
from django.contrib.postgres.aggregates import StringAgg
from django.db.models import CharField, ExpressionWrapper, F, Func, Prefetch, Q
from django.db.models import Value as V
from django.db.models.functions import Cast, Concat
from django.shortcuts import redirect
from num2words import num2words
from wkhtmltopdf.views import PDFTemplateResponse, PDFTemplateView

from hsm.templatetags.hsm_tags import is_secretory

from . import models as base
from . import society
from .maintenance import Maintenance, MaintenanceLine
from .models import ResPartner
from .society import ResFlat


class MaintenanceReport(PDFTemplateView):
    filename = 'maintenance.pdf'
    template_name = 'reports/maintenance.html'
    cmd_options = {
        'margin-top': 3,
    }

    def get_data(self, request, maintenance_id=None):
        data = {}
        is_secretory(request.user)
        is_valid = ResPartner.objects.filter(user=request.user).filter(owner_flat__maintenance__id=maintenance_id).count()
        if is_valid or request.user.is_superuser:
            maintenance_lines = MaintenanceLine.objects.annotate(service_name=F('service__name'))

            record = Maintenance.objects.filter(pk=maintenance_id).annotate(
                society_address=Concat(
                    F('flat__society__partner__street1'), V(','), F('flat__society__partner__street2'), V(','),
                    F('flat__society__partner__city'), V(','),
                    F('flat__society__partner__state__name'), V(','), F('flat__society__partner__country__name'),
                    V(','), F('flat__society__partner__zip_code'),
                    output_field=CharField()),
                society_name=F('flat__society__name'),
                maintenance_name=F('name'),
                flat_number=Concat(F('flat__wing__name'), V('-'), F('flat__number'), output_field=CharField()),
                flat_owner=F('flat__flat_owner__name'),

            ).prefetch_related('flat__flat_owner',
                               Prefetch('maintenanceline_set', queryset=maintenance_lines, to_attr='maintenance_lines')
                               )

            for each in record:
                data.update({
                    'society_name': each.society_name,
                    'society_address': each.society_address,
                    'maintenance_name': each.maintenance_name,
                    'bill_date': each.bill_date,
                    'paid_date': each.paid_date,
                    'sub_total': each.sub_total,
                    'total': each.total,
                    'pk': each.pk,
                    'flat_number': each.flat_number,
                    'flat_owner': ', '.join([owner.user.get_full_name() for owner in each.flat.flat_owner.all()]),
                    'maintenance_lines': [{'service_name': line.service_name, 'cost': line.cost} for line in
                                          each.maintenance_lines]
                })

            total_in_word = data.get('total') and num2words(data.get('total'), lang='en_IN') or ''
            data.update({'total_in_word': total_in_word})
        return data

    def get(self, request, *args, **kwargs):
        maintenance_id = kwargs.get('object_id')
        response = redirect(to='dashboard:dashboard')
        context = self.get_data(request, maintenance_id=maintenance_id)

        if context:
            maintenance_file_name = Maintenance.objects.filter(pk=maintenance_id).annotate(
                maintenance_file_name=Concat(
                    F('flat__society__name'), V('_'),
                    F('flat__wing__name'), V('-'),
                    F('flat__number'), V('_'),
                    F('name'), V('.pdf'), output_field=CharField()),
            ).values_list('maintenance_file_name', flat=True).first()
            response = PDFTemplateResponse(request=request,
                                           template=self.template_name,
                                           filename=maintenance_file_name,
                                           context=context,
                                           show_content_in_browser=False,
                                           cmd_options={'margin-top': 50, },
                                           )
            print("response", response)
        return response
