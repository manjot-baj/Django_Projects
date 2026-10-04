from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import *
from master.models import Location, Site
from account.models import AccountUser
from wkhtmltopdf.views import PDFTemplateResponse
import datetime
from account.permissions import HasAllowedRoles

class GateInpass(views.APIView):
    """the Post function will download gate in pass"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:
            context = {}
            gih_object = GateInHistory.objects.get(pk=pk)
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
            container = gih_object.container.get_container()
            company_logo = location.get_location_detail()["icon"]
            eir = gih_object.eir.get_eir()
            eir_img = eir["eir_img"]
            try:
                eir_line = [
                    line.get_eir_line()
                    for line in EirLine.objects.filter(eir=gih_object.eir)
                ]
            except:
                eir_line = []
            gate_in = gih_object.gate_in.get_gate_in()
            context["eir_no"] = eir["eir_no"]
            context["company_logo"] = company_logo
            context["eir_img"] = eir_img
            context["shipping_line"] = container["shipping_line"]
            context["container_no"] = container["container_no"]
            context["date"] = (
                datetime.datetime.strptime(gate_in["in_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
            )
            context["time"] = (
                datetime.datetime.strptime(gate_in["in_time"], "%H:%M")
                .time()
                .strftime("%I:%M %p")
            )
            context["cycle_type"] = "IN"
            context["size"] = container["size"]
            context["type"] = container["type"]
            context["gate_pass_no"] = gate_in["gate_pass_no"]
            context["license_no"] = gate_in["driver_license"]
            context["truck_no"] = gate_in["vehicle_no"]
            context["transporter_name"] = gate_in["transporter_name"]
            context["going_to_coming_from"] = gate_in["source"]
            context["seal_no"] = ""
            context["booking_no"] = ""
            context["driver_name"] = gate_in["driver_name"]
            context["vessel"] = gate_in["vessel_name"]
            context["voyage"] = gate_in["voyage_no"]
            context["consignee_name"] = gate_in["consignee"]
            context["eir_done_by"] = eir["done_by"]
            context["shipper_name"] = gate_in["shipper"]
            context["eir_line"] = eir_line
            context["site_address"] = site.get_site_detail()["address"]
            response = PDFTemplateResponse(
                request=request,
                template="depot/gate-pass.html",
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


class GateOutpass(views.APIView):
    """the get function will download gate out pass"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:
            context = {}
            goh_object = GateOutHistory.objects.get(pk=pk)
            container = goh_object.container.get_container()
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
            company_logo = location.get_location_detail()["icon"]
            eir = goh_object.eir.get_eir()
            eir_img = eir["eir_img"]
            try:
                eir_line = [
                    line.get_eir_line()
                    for line in EirLine.objects.filter(eir=goh_object.eir)
                ]
            except:
                eir_line = []
            gate_out = goh_object.gate_out.get_gate_out()
            context["eir_no"] = eir["eir_no"]
            context["company_logo"] = company_logo
            context["eir_img"] = eir_img
            context["shipping_line"] = container["shipping_line"]
            context["container_no"] = container["container_no"]
            context["date"] = (
                datetime.datetime.strptime(gate_out["out_date"], "%Y-%m-%d")
                .date()
                .strftime("%d/%m/%Y")
            )
            context["time"] = (
                datetime.datetime.strptime(gate_out["out_time"], "%H:%M")
                .time()
                .strftime("%I:%M %p")
            )
            context["cycle_type"] = "OUT"
            context["size"] = container["size"]
            context["type"] = container["type"]
            context["gate_pass_no"] = gate_out["gate_pass_no"]
            context["license_no"] = gate_out["driver_license"]
            context["truck_no"] = gate_out["vehicle_no"]
            context["transporter_name"] = gate_out["transporter_name"]
            context["going_to_coming_from"] = gate_out["destination"]
            context["seal_no"] = gate_out["seal_no"]
            context["booking_no"] = gate_out["booking_no"]
            context["driver_name"] = gate_out["driver_name"]
            context["vessel"] = gate_out["vessel_name"]
            context["voyage"] = gate_out["voyage_no"]
            context["consignee_name"] = gate_out["consignee"]
            context["eir_done_by"] = eir["done_by"]
            context["shipper_name"] = gate_out["shipper"]
            context["eir_line"] = eir_line
            context["site_address"] = site.get_site_detail()["address"]
            response = PDFTemplateResponse(
                request=request,
                template="depot/gate-pass.html",
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
