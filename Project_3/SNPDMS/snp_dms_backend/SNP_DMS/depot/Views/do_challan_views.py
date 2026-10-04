from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..functions_two import *
from ..models import *
from ..functions import upload_to_s3, download_from_s3
from account.permissions import HasAllowedRoles

class InProcessDoFile(views.APIView):
    """Post function will upload do challan on s3 bucket"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            gih = GateInHistory.objects.get(pk=pk)
            gate_pass_no = gih.gate_in.gate_pass_no
            process = "IN"
            response = download_from_s3(gate_pass_no=gate_pass_no, process=process)
            return response
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)

    def post(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            file = data["file"]
            gih = GateInHistory.objects.get(pk=pk)
            container_no = gih.container.container_no
            location = gih.container.location.name
            location_new = location.replace(" ", "_")
            site = gih.container.site.name
            site_new = site.replace(" ", "_")
            gate_pass_no = gih.gate_in.gate_pass_no
            process = "IN"
            file.name = file.name.replace(" ", "_")
            upload = upload_to_s3(
                location=location_new,
                site=site_new,
                container_no=container_no,
                gate_pass_no=gate_pass_no,
                process=process,
                file=file,
            )
            if upload is True:
                return Response(
                    {"successMsg": "Data Uploaded", "flag": "DO_Uploaded"}, status=200
                )
            else:
                return Response({"errorMsg": "Not able to Upload Data"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)


class OutProcessDoFile(views.APIView):
    """Post function will upload do challan on s3 bucket"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            goh = GateOutHistory.objects.get(pk=pk)
            gate_pass_no = goh.gate_out.gate_pass_no
            process = "OUT"
            response = download_from_s3(gate_pass_no=gate_pass_no, process=process)
            return response
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)

    def post(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            file = data["file"]
            goh = GateOutHistory.objects.get(pk=pk)
            container_no = goh.container.container_no
            location = goh.container.location.name
            location_new = location.replace(" ", "_")
            site = goh.container.site.name
            site_new = site.replace(" ", "_")
            gate_pass_no = goh.gate_out.gate_pass_no
            process = "OUT"
            file.name = file.name.replace(" ", "_")
            upload = upload_to_s3(
                location=location_new,
                site=site_new,
                container_no=container_no,
                gate_pass_no=gate_pass_no,
                process=process,
                file=file,
            )
            if upload is True:
                return Response(
                    {"successMsg": "Data Uploaded", "flag": "DO_Uploaded"}, status=200
                )
            else:
                return Response({"errorMsg": "Not able to Upload Data"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)
