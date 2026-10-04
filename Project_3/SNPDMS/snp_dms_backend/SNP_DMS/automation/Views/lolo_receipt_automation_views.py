from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone
from wkhtmltopdf.views import PDFTemplateResponse
from num2words import num2words

from depot.models import (
    GateOutHistory,
    GateInHistory,
    ClientAbbreviation,
)
from account.models import AccountUser
from account.permissions import HasAllowedRoles


class GetContainerDetails(views.APIView):
    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]

    def post(self, request, *args, **kwargs):
        try:
            process = request.data.get("process")
            model = GateInHistory if process == "IN" else GateOutHistory
            return Response(
                {
                    "data": [
                        {
                            "container_no": each["container__container_no"],
                            "date": each["date"].strftime("%d/%m/%Y"),
                            "process": process,
                            "pk": each["pk"],
                        }
                        for each in model.objects.select_related("container")
                        .filter(
                            container__container_no=request.data.get("container_no"),
                            container__location__name=request.data.get("location"),
                            container__site__name=request.data.get("site"),
                        )
                        .values("container__container_no", "date", "pk")
                    ]
                }
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)


class DownloadLoloReceipt(views.APIView):
    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]

    def getReceiptData(self, obj, process, app_user):
        context = {}
        night_charges = (
            obj.lolo.night_charges if obj.lolo.is_night_charges_applied else 0
        )
        taxable_amount_night_charge = (
            (float(night_charges) / 1.18) if float(night_charges) != float(0) else 0
        )
        tax_on_night_charge = float(night_charges) - taxable_amount_night_charge

        context["location_name"] = obj.container.location.name or ""
        context["company_name"] = obj.container.location.company_name or ""
        context["location_icon"] = (
            obj.container.location.icon.url if obj.container.location.icon else None
        )
        context["site_name"] = obj.container.site.name or ""
        context["client_name"] = obj.container.client.name or ""
        context["liner_name"] = (
            ClientAbbreviation.objects.filter(client=obj.container.client).first().name
        ) or ""
        context["email_id"] = obj.container.client.email_id or ""
        context["mobile_no"] = obj.container.client.mobile_no or ""
        context["gst_no"] = obj.container.client.gst_no or ""
        context["receipt_no"] = obj.lolo.receipt_no or ""
        context["receipt_date"] = (
            obj.lolo.receipt_date.strftime("%d/%m/%Y") if obj.lolo.receipt_date else ""
        )
        context["invoice_no"] = ""
        context["invoice_date"] = ""
        context["prepared_by"] = app_user.role.name
        context["prepared_date"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%d/%m/%Y")
        )
        context["date"] = (
            obj.gate_in.in_date.strftime("%d/%m/%Y")
            if process == "IN"
            else obj.gate_out.out_date.strftime("%d/%m/%Y")
        )
        context["time"] = (
            obj.gate_in.in_time.strftime("%I:%M %p")
            if process == "IN"
            else obj.gate_out.out_time.strftime("%I:%M %p")
        )
        context["container_no"] = obj.container.container_no or ""
        context["type"] = obj.container.type.name or ""
        context["size"] = obj.container.size.name or ""
        context["truck_no"] = (
            obj.gate_in.vehicle_no if process == "IN" else obj.gate_out.vehicle_no
        )
        if process == "IN":
            context["transporter_name"] = (
                obj.gate_in.transporter_name.name
                if obj.gate_in.transporter_name
                else ""
            )
        else:
            context["transporter_name"] = (
                obj.gate_out.transporter_name.name
                if obj.gate_out.transporter_name
                else ""
            )
        context["customer"] = (
            obj.lolo.customer_name.name if obj.lolo.customer_name else ""
        )
        context["payment_type"] = obj.lolo.payment_type or ""
        context["currency"] = obj.container.location.country.currency or ""
        context["delivery_date"] = (
            obj.lolo.delivery_date.strftime("%d/%m/%Y")
            if obj.lolo.delivery_date
            else ""
        )
        context["due_date"] = (
            obj.lolo.due_date.strftime("%d/%m/%Y") if obj.lolo.due_date else ""
        )
        context["shipper"] = (
            obj.gate_in.shipper if process == "IN" else obj.gate_out.shipper
        )
        context["consignor"] = (
            obj.gate_in.consignee if process == "IN" else obj.gate_out.consignee
        )
        context["charge_type"] = (
            f"IN / {obj.gate_in.arrived}"
            if process == "IN"
            else f"OUT / {obj.gate_out.departed}"
        )
        context["description"] = obj.lolo.lolo_type or ""
        context["invoice_current_amount"] = float(obj.lolo.net_amount) - float(
            night_charges
        )
        context["gross_amount"] = obj.lolo.gross_amount
        context["amount_in_words"] = str(
            num2words(float(obj.lolo.gross_amount))
        ).upper()
        context["remarks"] = obj.lolo.remark
        context["night_charges"] = night_charges if night_charges else 0
        context["cgst"] = (
            tax_on_night_charge / 2 if float(night_charges) != float(0) else 0
        )
        context["sgst"] = (
            tax_on_night_charge / 2 if float(night_charges) != float(0) else 0
        )
        return context

    def post(self, request, *args, **kwargs):
        try:

            process = request.data.get("process")
            model = GateInHistory if process == "IN" else GateOutHistory
            obj = model.objects.select_related(
                "container__location",
                "container__site",
                "lolo",
                "container__size",
                "container__type",
                "lolo__customer_name",
                "container__client",
            ).get(pk=request.data.get("pk"))
            app_user = AccountUser.objects.select_related("role").get(
                username=request.user.username
            )
            context = self.getReceiptData(obj, process, app_user)

            response = PDFTemplateResponse(
                request=request,
                template="depot/lolo-receipt.html",
                filename="foo.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={
                    "margin-top": 50,
                },
            )
            return response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)
