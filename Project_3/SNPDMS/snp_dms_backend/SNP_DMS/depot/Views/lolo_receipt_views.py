from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import Location, Site
from master.models_two import ClientAbbreviation
from ..functions_two import *
from ..models import *
from wkhtmltopdf.views import PDFTemplateResponse
import datetime
from num2words import num2words
from django.utils import timezone

from account.permissions import HasAllowedRoles
class HandlingReceipt(views.APIView):
    """
    the Post function will get handling receipt data
    the Put function will update handling receipt data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:
            context = {}
            gih_object = GateInHistory.objects.get(pk=pk)
            container = gih_object.container.get_container()
            gate_in = gih_object.gate_in.get_gate_in()
            lolo = gih_object.lolo.get_handling()
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            context["proforma_invoice_no"] = lolo["receipt_no"]
            context["proforma_invoice_date"] = lolo["receipt_date"]
            # context["invoice_no"] = lolo["invoice_no"]
            # context["invoice_date"] = lolo["invoice_date"]
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            context["container_no"] = container["container_no"]
            context["client_name"] = container["client"]
            context["truck_no"] = gate_in["vehicle_no"]
            try:
                context["currency"] = location.country.currency
            except:
                context["currency"] = ""
            context["delivery_date"] = lolo["delivery_date"]
            context["due_date"] = lolo["due_date"]
            context["shipper"] = gate_in["shipper"]
            context["consignor"] = gate_in["consignee"]
            context["charge_type"] = f"IN / {gate_in['arrived']}"
            context["description"] = lolo["lolo_type"]
            context["amount"] = lolo["lolo_amount"]
            context["night_charges"] = lolo["night_charges"]
            context["gst"] = lolo["gst"]
            context["cgst"] = lolo["cgst"]
            context["sgst"] = lolo["sgst"]
            context["igst"] = lolo["igst"]
            context["cgst_amount"] = lolo["cgst_amount"]
            context["sgst_amount"] = lolo["sgst_amount"]
            context["igst_amount"] = lolo["igst_amount"]
            context["net_amount"] = lolo["net_amount"]
            context["taxable_amount"] = lolo["taxable_amount"]
            context["gross_amount"] = lolo["gross_amount"]
            context["remarks"] = lolo["remark"]
            context["gih_pk"] = pk
            return Response(context, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            context = request.data
            gih_object = GateInHistory.objects.get(pk=pk)
            container = gih_object.container
            gate_in = gih_object.gate_in
            lolo = gih_object.lolo

            proforma_invoice_date_str = context["proforma_invoice_date"]
            if len(proforma_invoice_date_str) == 0:
                proforma_invoice_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    proforma_invoice_date = datetime.datetime.strptime(
                        proforma_invoice_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    proforma_invoice_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            invoice_date_str = context["invoice_date"]
            if len(invoice_date_str) == 0:
                invoice_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    invoice_date = datetime.datetime.strptime(
                        invoice_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    invoice_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            delivery_date_str = context["delivery_date"]
            if len(delivery_date_str) == 0:
                delivery_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    delivery_date = datetime.datetime.strptime(
                        delivery_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    delivery_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            due_date_str = context["due_date"]
            if len(due_date_str) == 0:
                due_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    due_date = datetime.datetime.strptime(
                        due_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    due_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            lolo.invoice_date = invoice_date
            lolo.delivery_date = delivery_date
            lolo.due_date = due_date
            lolo.receipt_date = proforma_invoice_date
            lolo.save()

            container_no = context["container_no"]
            if len(container_no) == 0:
                container_no = None
            container.container_no = container_no
            container.save()

            client_name = context["client_name"]
            if len(client_name) == 0:
                client_name = None
            if container.client:
                ClientAbbreviation.objects.get_or_create(
                    client=container.client, name=client_name
                )

            truck_no = context["truck_no"]
            if len(truck_no) == 0:
                truck_no = None
            shipper = context["shipper"]
            if len(shipper) == 0:
                shipper = None
            consignor = context["consignor"]
            if len(consignor) == 0:
                consignor = None
            gate_in.vehicle_no = truck_no
            gate_in.shipper = shipper
            gate_in.consignee = consignor
            gate_in.save()

            description = context["description"]
            if len(description) == 0:
                description = None
            amount = context["amount"]
            if len(amount) == 0:
                amount = None
            gst = context["gst"]
            if len(gst) == 0:
                gst = None
            cgst = context["cgst"]
            if len(cgst) == 0:
                cgst = None
            sgst = context["sgst"]
            if len(sgst) == 0:
                sgst = None
            igst = context["igst"]
            if len(igst) == 0:
                igst = None
            cgst_amount = context["cgst_amount"]
            if len(cgst_amount) == 0:
                cgst_amount = 0
            sgst_amount = context["sgst_amount"]
            if len(sgst_amount) == 0:
                sgst_amount = 0
            igst_amount = context["igst_amount"]
            if len(igst_amount) == 0:
                igst_amount = 0
            net_amount = context["net_amount"]
            if len(net_amount) == 0:
                net_amount = 0
            taxable_amount = context["taxable_amount"]
            if len(taxable_amount) == 0:
                taxable_amount = 0
            gross_amount = context["gross_amount"]
            if len(gross_amount) == 0:
                gross_amount = 0
            remarks = context["remarks"]
            if len(remarks) == 0:
                remarks = None
            lolo.lolo_type = description
            lolo.lolo_amount = amount
            lolo.gst = gst
            lolo.cgst = cgst
            lolo.sgst = sgst
            lolo.igst = igst
            lolo.cgst_amount = cgst_amount
            lolo.sgst_amount = sgst_amount
            lolo.igst_amount = igst_amount
            lolo.net_amount = net_amount
            lolo.taxable_amount = taxable_amount
            lolo.gross_amount = gross_amount
            lolo.remark = remarks
            lolo.save()
            return Response({"successMsg": "Data Update"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid Credentials [ {e} ]"}, status=200)


class OutHandlingReceipt(views.APIView):
    """
    the Post function will get handling receipt data
    the Put function will update handling receipt data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:
            context = {}
            goh_object = GateOutHistory.objects.get(pk=pk)
            container = goh_object.container.get_container()
            gate_out = goh_object.gate_out.get_gate_out()
            lolo = goh_object.lolo.get_handling()
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            context["proforma_invoice_no"] = lolo["receipt_no"]
            context["proforma_invoice_date"] = lolo["receipt_date"]
            # context["invoice_no"] = lolo["invoice_no"]
            # context["invoice_date"] = lolo["invoice_date"]
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            context["container_no"] = container["container_no"]
            context["client_name"] = container["client"]
            context["truck_no"] = gate_out["vehicle_no"]
            try:
                context["currency"] = location.country.currency
            except:
                context["currency"] = ""
            context["delivery_date"] = lolo["delivery_date"]
            context["due_date"] = lolo["due_date"]
            context["shipper"] = gate_out["shipper"]
            context["consignor"] = gate_out["consignee"]
            context["charge_type"] = f"OUT / {gate_out['departed']}"
            context["description"] = lolo["lolo_type"]
            context["amount"] = lolo["lolo_amount"]
            context["night_charges"] = lolo["night_charges"]
            context["gst"] = lolo["gst"]
            context["cgst"] = lolo["cgst"]
            context["sgst"] = lolo["sgst"]
            context["igst"] = lolo["igst"]
            context["cgst_amount"] = lolo["cgst_amount"]
            context["sgst_amount"] = lolo["sgst_amount"]
            context["igst_amount"] = lolo["igst_amount"]
            context["net_amount"] = lolo["net_amount"]
            context["taxable_amount"] = lolo["taxable_amount"]
            context["gross_amount"] = lolo["gross_amount"]
            context["remarks"] = lolo["remark"]
            context["gih_pk"] = pk
            return Response(context, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            context = request.data
            goh_object = GateOutHistory.objects.get(pk=pk)
            container = goh_object.container
            gate_out = goh_object.gate_out
            lolo = goh_object.lolo

            proforma_invoice_date_str = context["proforma_invoice_date"]
            if len(proforma_invoice_date_str) == 0:
                proforma_invoice_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    proforma_invoice_date = datetime.datetime.strptime(
                        proforma_invoice_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    proforma_invoice_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            invoice_date_str = context["invoice_date"]
            if len(invoice_date_str) == 0:
                invoice_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    invoice_date = datetime.datetime.strptime(
                        invoice_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    invoice_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            delivery_date_str = context["delivery_date"]
            if len(delivery_date_str) == 0:
                delivery_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    delivery_date = datetime.datetime.strptime(
                        delivery_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    delivery_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            due_date_str = context["due_date"]
            if len(due_date_str) == 0:
                due_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    due_date = datetime.datetime.strptime(
                        due_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    due_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            lolo.invoice_date = invoice_date
            lolo.delivery_date = delivery_date
            lolo.due_date = due_date
            lolo.receipt_date = proforma_invoice_date
            lolo.save()

            container_no = context["container_no"]
            if len(container_no) == 0:
                container_no = None
            container.container_no = container_no
            container.save()

            client_name = context["client_name"]
            if len(client_name) == 0:
                client_name = None
            if container.client:
                ClientAbbreviation.objects.get_or_create(
                    client=container.client, name=client_name
                )

            truck_no = context["truck_no"]
            if len(truck_no) == 0:
                truck_no = None
            shipper = context["shipper"]
            if len(shipper) == 0:
                shipper = None
            consignor = context["consignor"]
            if len(consignor) == 0:
                consignor = None
            gate_out.vehicle_no = truck_no
            gate_out.shipper = shipper
            gate_out.consignee = consignor
            gate_out.save()

            description = context["description"]
            if len(description) == 0:
                description = None
            amount = context["amount"]
            if len(amount) == 0:
                amount = None
            gst = context["gst"]
            if len(gst) == 0:
                gst = None
            cgst = context["cgst"]
            if len(cgst) == 0:
                cgst = None
            sgst = context["sgst"]
            if len(sgst) == 0:
                sgst = None
            igst = context["igst"]
            if len(igst) == 0:
                igst = None
            cgst_amount = context["cgst_amount"]
            if len(cgst_amount) == 0:
                cgst_amount = 0
            sgst_amount = context["sgst_amount"]
            if len(sgst_amount) == 0:
                sgst_amount = 0
            igst_amount = context["igst_amount"]
            if len(igst_amount) == 0:
                igst_amount = 0
            net_amount = context["net_amount"]
            if len(net_amount) == 0:
                net_amount = 0
            taxable_amount = context["taxable_amount"]
            if len(taxable_amount) == 0:
                taxable_amount = 0
            gross_amount = context["gross_amount"]
            if len(gross_amount) == 0:
                gross_amount = 0
            remarks = context["remarks"]
            if len(remarks) == 0:
                remarks = None
            lolo.lolo_type = description
            lolo.lolo_amount = amount
            lolo.gst = gst
            lolo.cgst = cgst
            lolo.sgst = sgst
            lolo.igst = igst
            lolo.cgst_amount = cgst_amount
            lolo.sgst_amount = sgst_amount
            lolo.igst_amount = igst_amount
            lolo.net_amount = net_amount
            lolo.taxable_amount = taxable_amount
            lolo.gross_amount = gross_amount
            lolo.remark = remarks
            lolo.save()
            return Response({"successMsg": "Data Update"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid Credentials [ {e} ]"}, status=200)


class HandlingReceiptDownload(views.APIView):
    """
    the Post function will download handling receipt
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:
            context = {}
            gih_object = GateInHistory.objects.get(pk=pk)
            container = gih_object.container.get_container()
            gate_in = gih_object.gate_in.get_gate_in()
            lolo = gih_object.lolo.get_handling()
            night_charges = (
                gih_object.lolo.night_charges
                if gih_object.lolo.is_night_charges_applied
                else 0
            )
            taxable_amount_night_charge = (
                (float(night_charges) / 1.18) if float(night_charges) != float(0) else 0
            )
            tax_on_night_charge = float(night_charges) - taxable_amount_night_charge

            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            try:
                location_data = location.get_location_detail()
                context["location_name"] = location_data["name"]
                context["company_name"] = location_data["company_name"]
                context["location_icon"] = location_data["icon"]
            except:
                context["location_name"] = ""
                context["company_name"] = ""
                context["location_icon"] = ""
            try:
                site = site.get_site_detail()
                context["site_name"] = site["name"]
            except:
                context["site_name"] = ""
            try:
                context["client_name"] = gih_object.container.client.name
                try:
                    liner_name = (
                        ClientAbbreviation.objects.filter(
                            client=gih_object.container.client
                        )
                        .first()
                        .name
                    )
                except:
                    liner_name = ""
                context["liner_name"] = liner_name
                if gih_object.container.client.email_id is None:
                    context["email_id"] = ""
                else:
                    context["email_id"] = gih_object.container.client.email_id
                if gih_object.container.client.mobile_no is None:
                    context["mobile_no"] = ""
                else:
                    context["mobile_no"] = gih_object.container.client.mobile_no

                if gih_object.container.client.gst_no is None:
                    context["gst_no"] = ""
                else:
                    context["gst_no"] = gih_object.container.client.gst_no
            except:
                context["client_name"] = ""
                context["email_id"] = ""
                context["mobile_no"] = ""
            context["receipt_no"] = lolo["receipt_no"]
            if not lolo["receipt_date"] == "":
                date_str = lolo["receipt_date"]
                context["receipt_date"] = (
                    datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                )
            else:
                context["receipt_date"] = lolo["receipt_date"]
            # context["invoice_no"] = lolo["invoice_no"]
            # if not lolo["invoice_date"] == "":
            #     date_str = lolo["invoice_date"]
            #     context["invoice_date"] = (
            #         datetime.datetime.strptime(date_str, "%Y-%m-%d")
            #         .date()
            #         .strftime("%d/%m/%Y")
            #     )
            # else:
            #     context["invoice_date"] = lolo["invoice_date"]
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            prepared_by = app_user.role.name
            context["prepared_by"] = prepared_by
            context["prepared_date"] = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y")
            )
            in_date = datetime.datetime.strptime(gate_in["in_date"], "%Y-%m-%d").date()
            in_date_str = in_date.strftime("%d/%m/%Y")
            in_time = datetime.datetime.strptime(gate_in["in_time"], "%H:%M").time()
            in_time_str = in_time.strftime("%I:%M %p")
            gate_in_date = in_date_str
            gate_in_time = in_time_str
            context["date"] = gate_in_date
            context["time"] = gate_in_time
            context["container_no"] = container["container_no"]
            context["type"] = container["type"]
            context["size"] = container["size"]
            context["truck_no"] = gate_in["vehicle_no"]
            context["transporter_name"] = gate_in["transporter_name"]
            context["customer"] = lolo["customer_name"]
            context["payment_type"] = lolo["payment_type"]
            try:
                context["currency"] = location.country.currency
            except:
                context["currency"] = ""
            if not lolo["delivery_date"] == "":
                date_str = lolo["delivery_date"]
                context["delivery_date"] = (
                    datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                )
            else:
                context["delivery_date"] = lolo["delivery_date"]
            context["due_date"] = lolo["due_date"]
            if not lolo["due_date"] == "":
                date_str = lolo["due_date"]
                context["due_date"] = (
                    datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                )
            else:
                context["due_date"] = lolo["due_date"]
            context["shipper"] = gate_in["shipper"]
            context["consignor"] = gate_in["consignee"]
            context["charge_type"] = f"IN / {gate_in['arrived']}"
            context["description"] = lolo["lolo_type"]
            context["invoice_current_amount"] = float(lolo["net_amount"]) - float(
                night_charges
            )
            context["gross_amount"] = lolo["gross_amount"]
            context["amount_in_words"] = str(
                num2words(float(lolo["gross_amount"]))
            ).upper()
            context["remarks"] = lolo["remark"]
            context["night_charges"] = night_charges if night_charges else 0
            context["cgst"] = (
                tax_on_night_charge / 2 if float(night_charges) != float(0) else 0
            )
            context["sgst"] = (
                tax_on_night_charge / 2 if float(night_charges) != float(0) else 0
            )
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
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class OutHandlingReceiptDownload(views.APIView):
    """
    the Post function will download handling receipt
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:
            context = {}
            goh_object = GateOutHistory.objects.get(pk=pk)
            container = goh_object.container.get_container()
            gate_out = goh_object.gate_out.get_gate_out()
            lolo = goh_object.lolo.get_handling()
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            try:
                location_data = location.get_location_detail()
                context["location_name"] = location_data["name"]
                context["company_name"] = location_data["company_name"]
                context["location_icon"] = location_data["icon"]
            except:
                context["location_name"] = ""
                context["company_name"] = ""
                context["location_icon"] = ""
            try:
                site = site.get_site_detail()
                context["site_name"] = site["name"]
            except:
                context["site_name"] = ""
            try:
                context["client_name"] = goh_object.container.client.name
                try:
                    liner_name = (
                        ClientAbbreviation.objects.filter(
                            client=goh_object.container.client
                        )
                        .first()
                        .name
                    )
                except:
                    liner_name = ""
                context["liner_name"] = liner_name
                if goh_object.container.client.email_id is None:
                    context["email_id"] = ""
                else:
                    context["email_id"] = goh_object.container.client.email_id
                if goh_object.container.client.mobile_no is None:
                    context["mobile_no"] = ""
                else:
                    context["mobile_no"] = goh_object.container.client.mobile_no

                if goh_object.container.client.gst_no is None:
                    context["gst_no"] = ""
                else:
                    context["gst_no"] = goh_object.container.client.gst_no
            except:
                context["client_name"] = ""
                context["email_id"] = ""
                context["mobile_no"] = ""
            context["receipt_no"] = lolo["receipt_no"]
            if not lolo["receipt_date"] == "":
                date_str = lolo["receipt_date"]
                context["receipt_date"] = (
                    datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                )
            else:
                context["receipt_date"] = lolo["receipt_date"]
            # context["invoice_no"] = lolo["invoice_no"]
            # if not lolo["invoice_date"] == "":
            #     date_str = lolo["invoice_date"]
            #     context["invoice_date"] = (
            #         datetime.datetime.strptime(date_str, "%Y-%m-%d")
            #         .date()
            #         .strftime("%d/%m/%Y")
            #     )
            # else:
            #     context["invoice_date"] = lolo["invoice_date"]
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            prepared_by = app_user.role.name
            context["prepared_by"] = prepared_by
            context["prepared_date"] = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y")
            )
            out_date = datetime.datetime.strptime(
                gate_out["out_date"], "%Y-%m-%d"
            ).date()
            out_date_str = out_date.strftime("%d/%m/%Y")
            out_time = datetime.datetime.strptime(gate_out["out_time"], "%H:%M").time()
            out_time_str = out_time.strftime("%I:%M %p")
            gate_out_date = out_date_str
            gate_out_time = out_time_str
            context["date"] = gate_out_date
            context["time"] = gate_out_time
            context["container_no"] = container["container_no"]
            context["type"] = container["type"]
            context["size"] = container["size"]
            context["truck_no"] = gate_out["vehicle_no"]
            context["transporter_name"] = gate_out["transporter_name"]
            context["customer"] = lolo["customer_name"]
            context["payment_type"] = lolo["payment_type"]
            try:
                context["currency"] = location.country.currency
            except:
                context["currency"] = ""
            if not lolo["delivery_date"] == "":
                date_str = lolo["delivery_date"]
                context["delivery_date"] = (
                    datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                )
            else:
                context["delivery_date"] = lolo["delivery_date"]
            context["due_date"] = lolo["due_date"]
            if not lolo["due_date"] == "":
                date_str = lolo["due_date"]
                context["due_date"] = (
                    datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                )
            else:
                context["due_date"] = lolo["due_date"]
            context["shipper"] = gate_out["shipper"]
            context["consignor"] = gate_out["consignee"]
            context["charge_type"] = f"OUT / {gate_out['departed']}"
            context["description"] = lolo["lolo_type"]
            context["invoice_current_amount"] = lolo["net_amount"]
            context["gross_amount"] = lolo["gross_amount"]
            context["amount_in_words"] = str(
                num2words(float(lolo["gross_amount"]))
            ).upper()
            context["remarks"] = lolo["remark"]
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
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
