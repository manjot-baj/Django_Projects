from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
from django.utils import timezone


from depot.models import GateInHistory, GateOutHistory
from account.permissions import HasAllowedRoles

class ContainerInfo(views.APIView):

    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]
    

    def getParams(self, request):
        container_no = request.data.get("container_no")
        process = request.data.get("process")
        model = GateInHistory if process == "IN" else GateOutHistory
        return model, container_no

    def post(self, request, *args, **kwargs):
        try:
            model, container_no = self.getParams(request)
            data = [
                {
                    "created_at": each["created_at"]
                    .astimezone(timezone.get_current_timezone())
                    .strftime("%Y-%m-%d %H:%M"),
                    "updated_at": each["updated_at"]
                    .astimezone(timezone.get_current_timezone())
                    .strftime("%Y-%m-%d %H:%M"),
                    "is_date_updated": "Yes" if each["is_date_updated"] else "No",
                    "date": each["date"]
                    .astimezone(timezone.get_current_timezone())
                    .strftime("%Y-%m-%d %H:%M"),
                    "container_no": each["container__container_no"],
                    "size": each["container__size__name"],
                    "type": each["container__type__name"],
                    "location": each["container__location__name"],
                    "site": each["container__site__name"],
                    "text_edi_sent": "Yes" if each["is_email_sent"] else "No",
                    "excel_edi_sent": "Yes" if each["is_msc_excel_edi_sent"] else "No",
                    "status": each["container__status"],
                    "is_available": "Yes" if each["container__is_available"] else "No",
                    "is_valid": "Yes" if each["container__is_valid"] else "No",
                    "in_do_not_lift_queue": "Yes"
                    if each["container__in_do_not_lift_queue"]
                    else "No",
                    "automatic_mnr_status_change": "Yes"
                    if each["container__automatic_mnr_status_change"]
                    else "No",
                    "client": each["container__client__name"],
                    "ref_code": each["container__client__ref_code"],
                    "shipping_line": each["container__shipping_line__name"],
                    "in_entry_count": each["container__in_entry_count"],
                    "out_entry_count": each["container__out_entry_count"],
                }
                for each in model.objects.select_related(
                    "container",
                    "container__size",
                    "container__type",
                    "container__location",
                    "container__site",
                    "container__client",
                    "container__shipping_line",
                )
                .filter(container__container_no__in=container_no)
                .values(
                    "created_at",
                    "updated_at",
                    "is_date_updated",
                    "date",
                    "container__container_no",
                    "container__size__name",
                    "container__type__name",
                    "container__location__name",
                    "container__site__name",
                    "is_email_sent",
                    "is_msc_excel_edi_sent",
                    "container__status",
                    "container__is_available",
                    "container__is_valid",
                    "container__in_do_not_lift_queue",
                    "container__automatic_mnr_status_change",
                    "container__client__name",
                    "container__client__ref_code",
                    "container__shipping_line__name",
                    "container__in_entry_count",
                    "container__out_entry_count",
                )
            ]

            return Response(data)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
