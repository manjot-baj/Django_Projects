from rest_framework import status
from rest_framework.response import Response
from depot.models import GateInHistory, GateOutHistory
from common.exceptions import ValidationError
from ..functions import upload_to_s3, download_from_s3


class DoFileProcessService:
    @staticmethod
    def validate_request_data(data):
        """Validate that request data contains a file."""
        if not data or "file" not in data:
            raise ValidationError("Please provide Data")
        return data

    @staticmethod
    def get_gate_in_history(pk):
        """Retrieve GateInHistory object by primary key."""
        try:
            return GateInHistory.objects.get(pk=pk)
        except GateInHistory.DoesNotExist:
            raise ValidationError("GateInHistory not found")

    @staticmethod
    def get_gate_out_history(pk):
        """Retrieve GateOutHistory object by primary key."""
        try:
            return GateOutHistory.objects.get(pk=pk)
        except GateOutHistory.DoesNotExist:
            raise ValidationError("GateOutHistory not found")

    @staticmethod
    def format_location_and_site(history_obj):
        """Format location and site names by replacing spaces with underscores."""
        location = history_obj.container.location.name
        site = history_obj.container.site.name
        return location.replace(" ", "_"), site.replace(" ", "_")

    @staticmethod
    def upload_do_file(history_obj, file, process):
        """Upload DO challan file to S3 bucket."""
        try:
            container_no = history_obj.container.container_no
            location, site = DoFileProcessService.format_location_and_site(history_obj)
            gate_pass_no = (
                history_obj.gate_in.gate_pass_no
                if process == "IN"
                else history_obj.gate_out.gate_pass_no
            )
            file.name = file.name.replace(" ", "_")
            upload_success = upload_to_s3(
                location=location,
                site=site,
                container_no=container_no,
                gate_pass_no=gate_pass_no,
                process=process,
                file=file,
            )
            if upload_success:
                return Response(
                    {"successMsg": "Data Uploaded", "flag": "DO_Uploaded"},
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"errorMsg": "Not able to Upload Data"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {str(e)} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def download_do_file(history_obj, process):
        """Download DO challan file from S3 bucket."""
        try:
            gate_pass_no = (
                history_obj.gate_in.gate_pass_no
                if process == "IN"
                else history_obj.gate_out.gate_pass_no
            )
            response = download_from_s3(gate_pass_no=gate_pass_no, process=process)
            return response
        except Exception as e:
            return Response(
                {"errorMsg": f"Data Not Found [ {str(e)} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def process_in_do_file(request, pk):
        """Handle file upload/download for gate-in process."""
        if request.method == "GET":
            history_obj = DoFileProcessService.get_gate_in_history(pk)
            return DoFileProcessService.download_do_file(history_obj, "IN")
        elif request.method == "POST":
            data = DoFileProcessService.validate_request_data(request.data)
            history_obj = DoFileProcessService.get_gate_in_history(pk)
            return DoFileProcessService.upload_do_file(history_obj, data["file"], "IN")

    @staticmethod
    def process_out_do_file(request, pk):
        """Handle file upload/download for gate-out process."""
        if request.method == "GET":
            history_obj = DoFileProcessService.get_gate_out_history(pk)
            return DoFileProcessService.download_do_file(history_obj, "OUT")
        elif request.method == "POST":
            data = DoFileProcessService.validate_request_data(request.data)
            history_obj = DoFileProcessService.get_gate_out_history(pk)
            return DoFileProcessService.upload_do_file(history_obj, data["file"], "OUT")
