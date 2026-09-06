from django.db.models import F
from django_datatables_view.base_datatable_view import BaseDatatableView
from hsm.maintenance import Maintenance


class MaintenanceDT(BaseDatatableView):
    model = Maintenance
    columns = ['pk', 'name', 'total', 'dues']
    order_columns = ['pk', 'name']

    def get_initial_queryset(self):
        self.request.session['maintenance_ids'] = self.request.POST.getlist('row[]')
        return self.model.objects.filter(pk__in=self.request.POST.getlist('row[]')).annotate(
            dues=F('total')-F('sub_total')
        )