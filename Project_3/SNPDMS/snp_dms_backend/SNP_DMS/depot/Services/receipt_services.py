import datetime
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from account.models import AccountUser
from master.models import Location, Site
from master.models_two import ClientAbbreviation
from depot.models import GateInHistory, GateOutHistory, Container, Handling
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from wkhtmltopdf.views import PDFTemplateResponse
from num2words import num2words


class HandlingReceiptService:
    @staticmethod
    def validate_request_data(data):
        """Validate that request data is not empty."""
        if not data:
            raise ValidationError("Please provide Data")
        return data

    @staticmethod
    def validate_location_and_site(request_data, user):
        """Validate location and site or use user's defaults."""
        try:
            location = Location.objects.get(name=request_data.get("location"))
            site = Site.objects.get(name=request_data.get("site"))
        except (Location.DoesNotExist, Site.DoesNotExist):
            app_user = AccountUser.objects.get(username=user.username)
            location = app_user.location
            site = app_user.site
        return location, site

    @staticmethod
    def validate_date_field(date_str, format_str="%Y-%m-%d"):
        """Validate date field and return parsed date or current date."""
        if not date_str:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )
        try:
            return datetime.datetime.strptime(date_str, format_str).date()
        except ValueError:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )

    @staticmethod
    def validate_numeric_field(value):
        """Validate if a field is numeric and return float or 0."""
        if not value or not str(value).replace(".", "", 1).isnumeric():
            return 0
        return float(value)

    @staticmethod
    def get_handling_receipt_data(pk, request, is_out=False):
        """Retrieve handling receipt data for GateInHistory or GateOutHistory."""
        try:
            context = {}
            history_obj = (
                GateOutHistory.objects.get(pk=pk)
                if is_out
                else GateInHistory.objects.get(pk=pk)
            )
            container = history_obj.container.get_container()
            gate = (
                history_obj.gate_out.get_gate_out()
                if is_out
                else history_obj.gate_in.get_gate_in()
            )
            lolo = history_obj.lolo.get_handling()
            user = request.user
            location, site = HandlingReceiptService.validate_location_and_site(
                request.data, user
            )

            context["proforma_invoice_no"] = lolo["receipt_no"]
            context["proforma_invoice_date"] = lolo["receipt_date"]
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            context["container_no"] = container["container_no"]
            context["client_name"] = container["client"]
            context["truck_no"] = gate["vehicle_no"]
            context["currency"] = getattr(location.country, "currency", "")
            context["delivery_date"] = lolo["delivery_date"]
            context["due_date"] = lolo["due_date"]
            context["shipper"] = gate["shipper"]
            context["consignor"] = gate["consignee"]
            context["charge_type"] = (
                f"{'OUT' if is_out else 'IN'} / {gate['departed' if is_out else 'arrived']}"
            )
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

            return Response(context, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {str(e)} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def update_handling_receipt_data(pk, request, is_out=False):
        """Update handling receipt data for GateInHistory or GateOutHistory."""
        try:
            HandlingReceiptService.validate_request_data(request.data)
            context = request.data
            history_obj = (
                GateOutHistory.objects.get(pk=pk)
                if is_out
                else GateInHistory.objects.get(pk=pk)
            )
            container = history_obj.container
            gate = history_obj.gate_out if is_out else history_obj.gate_in
            lolo = history_obj.lolo

            # Validate and parse dates
            proforma_invoice_date = HandlingReceiptService.validate_date_field(
                context.get("proforma_invoice_date", "")
            )
            invoice_date = HandlingReceiptService.validate_date_field(
                context.get("invoice_date", "")
            )
            delivery_date = HandlingReceiptService.validate_date_field(
                context.get("delivery_date", "")
            )
            due_date = HandlingReceiptService.validate_date_field(
                context.get("due_date", "")
            )

            # Update Handling object
            lolo.invoice_date = invoice_date
            lolo.delivery_date = delivery_date
            lolo.due_date = due_date
            lolo.receipt_date = proforma_invoice_date
            lolo.lolo_type = context.get("description") or None
            lolo.lolo_amount = HandlingReceiptService.validate_numeric_field(
                context.get("amount")
            )
            lolo.gst = context.get("gst") or None
            lolo.cgst = context.get("cgst") or None
            lolo.sgst = context.get("sgst") or None
            lolo.igst = context.get("igst") or None
            lolo.cgst_amount = HandlingReceiptService.validate_numeric_field(
                context.get("cgst_amount")
            )
            lolo.sgst_amount = HandlingReceiptService.validate_numeric_field(
                context.get("sgst_amount")
            )
            lolo.igst_amount = HandlingReceiptService.validate_numeric_field(
                context.get("igst_amount")
            )
            lolo.net_amount = HandlingReceiptService.validate_numeric_field(
                context.get("net_amount")
            )
            lolo.taxable_amount = HandlingReceiptService.validate_numeric_field(
                context.get("taxable_amount")
            )
            lolo.gross_amount = HandlingReceiptService.validate_numeric_field(
                context.get("gross_amount")
            )
            lolo.remark = context.get("remarks") or None
            lolo.save()

            # Update Container object
            container_no = context.get("container_no") or None
            container.container_no = container_no
            container.save()

            # Update ClientAbbreviation if client exists
            client_name = context.get("client_name") or None
            if container.client and client_name:
                ClientAbbreviation.objects.get_or_create(
                    client=container.client, name=client_name
                )

            # Update GateIn or GateOut object
            gate.vehicle_no = context.get("truck_no") or None
            gate.shipper = context.get("shipper") or None
            gate.consignee = context.get("consignor") or None
            gate.save()

            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid Credentials [ {str(e)} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def download_handling_receipt(pk, request, is_out=False):
        """Generate and download handling receipt PDF."""
        try:
            context = {}
            history_obj = (
                GateOutHistory.objects.get(pk=pk)
                if is_out
                else GateInHistory.objects.get(pk=pk)
            )
            container = history_obj.container.get_container()
            gate = (
                history_obj.gate_out.get_gate_out()
                if is_out
                else history_obj.gate_in.get_gate_in()
            )
            lolo = history_obj.lolo.get_handling()
            user = request.user
            location, site = HandlingReceiptService.validate_location_and_site(
                request.data, user
            )

            # Calculate night charges
            night_charges = (
                lolo["night_charges"] if lolo["is_night_charges_applied"] else 0
            )
            taxable_amount_night_charge = (
                (float(night_charges) / 1.18) if float(night_charges) != 0 else 0
            )
            tax_on_night_charge = float(night_charges) - taxable_amount_night_charge

            # Location and site details
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
                site_data = site.get_site_detail()
                context["site_name"] = site_data["name"]
            except:
                context["site_name"] = ""

            # Client details
            try:
                context["client_name"] = history_obj.container.client.name
                context["liner_name"] = (
                    ClientAbbreviation.objects.filter(
                        client=history_obj.container.client
                    )
                    .first()
                    .name
                    if ClientAbbreviation.objects.filter(
                        client=history_obj.container.client
                    ).exists()
                    else ""
                )
                context["email_id"] = history_obj.container.client.email_id or ""
                context["mobile_no"] = history_obj.container.client.mobile_no or ""
                context["gst_no"] = history_obj.container.client.gst_no or ""
            except:
                context["client_name"] = ""
                context["email_id"] = ""
                context["mobile_no"] = ""
                context["gst_no"] = ""

            # Receipt and invoice details
            context["receipt_no"] = lolo["receipt_no"]
            context["receipt_date"] = (
                datetime.datetime.strptime(lolo["receipt_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if lolo["receipt_date"]
                else ""
            )
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            context["prepared_by"] = AccountUser.objects.get(
                username=user.username
            ).role.name
            context["prepared_date"] = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y")
            )

            # Gate details
            gate_date = gate["out_date" if is_out else "in_date"]
            gate_time = gate["out_time" if is_out else "in_time"]
            context["date"] = (
                datetime.datetime.strptime(gate_date, "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if gate_date
                else ""
            )
            context["time"] = (
                datetime.datetime.strptime(gate_time, "%H:%M")
                .time()
                .strftime("%I:%M %p")
                if gate_time
                else ""
            )

            # Container and handling details
            context["container_no"] = container["container_no"]
            context["type"] = container["type"]
            context["size"] = container["size"]
            context["truck_no"] = gate["vehicle_no"]
            context["transporter_name"] = gate["transporter_name"]
            context["customer"] = lolo["customer_name"]
            context["payment_type"] = lolo["payment_type"]
            context["currency"] = getattr(location.country, "currency", "")
            context["delivery_date"] = (
                datetime.datetime.strptime(lolo["delivery_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if lolo["delivery_date"]
                else ""
            )
            context["due_date"] = (
                datetime.datetime.strptime(lolo["due_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if lolo["due_date"]
                else ""
            )
            context["shipper"] = gate["shipper"]
            context["consignor"] = gate["consignee"]
            context["charge_type"] = (
                f"{'OUT' if is_out else 'IN'} / {gate['departed' if is_out else 'arrived']}"
            )
            context["description"] = lolo["lolo_type"]
            context["invoice_current_amount"] = float(lolo["net_amount"]) - float(
                night_charges
            )
            context["gross_amount"] = lolo["gross_amount"]
            context["amount_in_words"] = str(
                num2words(float(lolo["gross_amount"]))
            ).upper()
            context["remarks"] = lolo["remark"]
            context["night_charges"] = night_charges
            context["cgst"] = (
                tax_on_night_charge / 2 if float(night_charges) != 0 else 0
            )
            context["sgst"] = (
                tax_on_night_charge / 2 if float(night_charges) != 0 else 0
            )

            # Generate PDF
            response = PDFTemplateResponse(
                request=request,
                template="depot/lolo-receipt.html",
                filename="foo.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={"margin-top": 50},
            )
            return response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {str(e)} ]"}, status=status.HTTP_200_OK
            )


class SelfTransportationReceiptService:
    @staticmethod
    def validate_request_data(data):
        """Validate that request data is not empty."""
        if not data:
            raise ValidationError("Please provide Data")
        return data

    @staticmethod
    def validate_location_and_site(request_data, user):
        """Validate location and site or use user's defaults."""
        try:
            location = Location.objects.get(name=request_data.get("location"))
            site = Site.objects.get(name=request_data.get("site"))
        except (Location.DoesNotExist, Site.DoesNotExist):
            app_user = AccountUser.objects.get(username=user.username)
            location = app_user.location
            site = app_user.site
        return location, site

    @staticmethod
    def validate_date_field(date_str, format_str="%Y-%m-%d"):
        """Validate date field and return parsed date or current date."""
        if not date_str:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )
        try:
            return datetime.datetime.strptime(date_str, format_str).date()
        except ValueError:
            return (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
            )

    @staticmethod
    def validate_numeric_field(value):
        """Validate if a field is numeric and return float or 0."""
        if not value or not str(value).replace(".", "", 1).isnumeric():
            return 0
        return float(value)

    @staticmethod
    def get_self_transportation_receipt_data(pk, request, is_out=False):
        """Retrieve self-transportation receipt data for GateInHistory or GateOutHistory."""
        try:
            context = {}
            history_obj = (
                GateOutHistory.objects.get(pk=pk)
                if is_out
                else GateInHistory.objects.get(pk=pk)
            )
            container = history_obj.container.get_container()
            gate = (
                history_obj.gate_out.get_gate_out()
                if is_out
                else history_obj.gate_in.get_gate_in()
            )
            st = history_obj.st.get_self_transportation()
            user = request.user
            location, site = (
                SelfTransportationReceiptService.validate_location_and_site(
                    request.data, user
                )
            )

            context["proforma_invoice_no"] = st["receipt_no"]
            context["proforma_invoice_date"] = st["receipt_date"]
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            context["container_no"] = container["container_no"]
            context["client_name"] = container["client"]
            context["truck_no"] = gate["vehicle_no"]
            context["currency"] = getattr(location.country, "currency", "")
            context["delivery_date"] = st["delivery_date"]
            context["due_date"] = st["due_date"]
            context["shipper"] = gate["shipper"]
            context["consignor"] = gate["consignee"]
            context["charge_type"] = f"{'OUT' if is_out else 'IN'} / TRANSPORTATION"
            context["description"] = st["origin"]
            context["amount"] = st["price"]
            context["gst"] = st["gst"]
            context["cgst"] = st["cgst"]
            context["sgst"] = st["sgst"]
            context["igst"] = st["igst"]
            context["cgst_amount"] = st["cgst_amount"]
            context["sgst_amount"] = st["sgst_amount"]
            context["igst_amount"] = st["igst_amount"]
            context["net_amount"] = st["net_amount"]
            context["taxable_amount"] = st["taxable_amount"]
            context["gross_amount"] = st["gross_amount"]
            context["remarks"] = st["remark"]
            context["gih_pk"] = pk

            return Response(context, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {str(e)} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def update_self_transportation_receipt_data(pk, request, is_out=False):
        """Update self-transportation receipt data for GateInHistory or GateOutHistory."""
        try:
            SelfTransportationReceiptService.validate_request_data(request.data)
            context = request.data
            history_obj = (
                GateOutHistory.objects.get(pk=pk)
                if is_out
                else GateInHistory.objects.get(pk=pk)
            )
            container = history_obj.container
            gate = history_obj.gate_out if is_out else history_obj.gate_in
            st = history_obj.st

            # Validate and parse dates
            proforma_invoice_date = (
                SelfTransportationReceiptService.validate_date_field(
                    context.get("proforma_invoice_date", "")
                )
            )
            invoice_date = SelfTransportationReceiptService.validate_date_field(
                context.get("invoice_date", "")
            )
            delivery_date = SelfTransportationReceiptService.validate_date_field(
                context.get("delivery_date", "")
            )
            due_date = SelfTransportationReceiptService.validate_date_field(
                context.get("due_date", "")
            )

            # Update SelfTransportation object
            st.receipt_date = proforma_invoice_date
            st.invoice_date = invoice_date
            st.delivery_date = delivery_date
            st.due_date = due_date
            st.origin = context.get("description") or None
            st.price = SelfTransportationReceiptService.validate_numeric_field(
                context.get("amount")
            )
            st.gst = context.get("gst") or None
            st.cgst = context.get("cgst") or None
            st.sgst = context.get("sgst") or None
            st.igst = context.get("igst") or None
            st.cgst_amount = SelfTransportationReceiptService.validate_numeric_field(
                context.get("cgst_amount")
            )
            st.sgst_amount = SelfTransportationReceiptService.validate_numeric_field(
                context.get("sgst_amount")
            )
            st.igst_amount = SelfTransportationReceiptService.validate_numeric_field(
                context.get("igst_amount")
            )
            st.net_amount = SelfTransportationReceiptService.validate_numeric_field(
                context.get("net_amount")
            )
            st.taxable_amount = SelfTransportationReceiptService.validate_numeric_field(
                context.get("taxable_amount")
            )
            st.gross_amount = SelfTransportationReceiptService.validate_numeric_field(
                context.get("gross_amount")
            )
            st.remark = context.get("remarks") or None
            st.save()

            # Update Container object
            container_no = context.get("container_no") or None
            container.container_no = container_no
            container.save()

            # Update ClientAbbreviation if client exists
            client_name = context.get("client_name") or None
            if container.client and client_name:
                ClientAbbreviation.objects.get_or_create(
                    client=container.client, name=client_name
                )

            # Update GateIn or GateOut object
            gate.vehicle_no = context.get("truck_no") or None
            gate.shipper = context.get("shipper") or None
            gate.consignee = context.get("consignor") or None
            gate.save()

            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid Credentials [ {str(e)} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def download_self_transportation_receipt(pk, request, is_out=False):
        """Generate and download self-transportation receipt PDF."""
        try:
            context = {}
            history_obj = (
                GateOutHistory.objects.get(pk=pk)
                if is_out
                else GateInHistory.objects.get(pk=pk)
            )
            container = history_obj.container.get_container()
            gate = (
                history_obj.gate_out.get_gate_out()
                if is_out
                else history_obj.gate_in.get_gate_in()
            )
            st = history_obj.st.get_self_transportation()
            user = request.user
            location, site = (
                SelfTransportationReceiptService.validate_location_and_site(
                    request.data, user
                )
            )

            # Location and site details
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
                site_data = site.get_site_detail()
                context["site_name"] = site_data["name"]
            except:
                context["site_name"] = ""

            # Client details
            try:
                context["client_name"] = history_obj.container.client.name
                context["liner_name"] = (
                    ClientAbbreviation.objects.filter(
                        client=history_obj.container.client
                    )
                    .first()
                    .name
                    if ClientAbbreviation.objects.filter(
                        client=history_obj.container.client
                    ).exists()
                    else ""
                )
                context["email_id"] = history_obj.container.client.email_id or ""
                context["mobile_no"] = history_obj.container.client.mobile_no or ""
                context["gst_no"] = history_obj.container.client.gst_no or ""
            except:
                context["client_name"] = ""
                context["email_id"] = ""
                context["mobile_no"] = ""
                context["gst_no"] = ""

            # Receipt and invoice details
            context["receipt_no"] = st["receipt_no"]
            context["receipt_date"] = (
                datetime.datetime.strptime(st["receipt_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if st["receipt_date"]
                else ""
            )
            context["invoice_no"] = ""
            context["invoice_date"] = ""
            context["prepared_by"] = AccountUser.objects.get(
                username=user.username
            ).role.name
            context["prepared_date"] = (
                datetime.datetime.now()
                .astimezone(timezone.get_current_timezone())
                .date()
                .strftime("%d/%m/%Y")
            )

            # Gate details
            gate_date = gate["out_date" if is_out else "in_date"]
            gate_time = gate["out_time" if is_out else "in_time"]
            context["date"] = (
                datetime.datetime.strptime(gate_date, "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if gate_date
                else ""
            )
            context["time"] = (
                datetime.datetime.strptime(gate_time, "%H:%M")
                .time()
                .strftime("%I:%M %p")
                if gate_time
                else ""
            )

            # Container and self-transportation details
            context["container_no"] = container["container_no"]
            context["type"] = container["type"]
            context["size"] = container["size"]
            context["truck_no"] = gate["vehicle_no"]
            context["transporter_name"] = st["transporter"]
            context["customer"] = st["customer_name"]
            context["payment_type"] = st["payment_type"]
            context["currency"] = getattr(location.country, "currency", "")
            context["delivery_date"] = (
                datetime.datetime.strptime(st["delivery_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if st["delivery_date"]
                else ""
            )
            context["due_date"] = (
                datetime.datetime.strptime(st["due_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
                if st["due_date"]
                else ""
            )
            context["shipper"] = gate["shipper"]
            context["consignor"] = gate["consignee"]
            context["charge_type"] = f"{'OUT' if is_out else 'IN'} / TRANSPORTATION"
            context["description"] = st["origin"]
            context["invoice_current_amount"] = st["net_amount"]
            context["gross_amount"] = st["gross_amount"]
            context["amount_in_words"] = str(
                num2words(float(st["gross_amount"]))
            ).upper()
            context["remarks"] = st["remark"]

            # Generate PDF
            response = PDFTemplateResponse(
                request=request,
                template="depot/st-receipt.html",
                filename="foo.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={"margin-top": 50},
            )
            return response
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {str(e)} ]"}, status=status.HTTP_200_OK
            )
