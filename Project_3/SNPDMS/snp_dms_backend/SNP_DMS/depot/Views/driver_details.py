from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from ..functions_two import *
from ..models import *
from django.http import HttpResponse
from common.functions import download_file

from account.permissions import HasAllowedRoles
class DownloadDriverPhoto(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):
        try:

            AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
            bucket_name = AWS_STORAGE_BUCKET_NAME
            process = request.data.get("process")
            if process == "IN":
                gih = GateInHistory.objects.get(pk=pk)
                file_name = gih.gate_in.driver_image_s3_file_name
                object_name = gih.gate_in.driver_image_s3_object_name
            else:
                goh = GateOutHistory.objects.get(pk=pk)
                file_name = goh.gate_out.driver_image_s3_file_name
                object_name = goh.gate_out.driver_image_s3_object_name

            temp_file_path = download_file(
                bucket=bucket_name, object_name=object_name, file_name=file_name
            )
            extension = os.path.splitext(file_name)[1]
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/{extension}"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="{file_name}"'
                os.remove(temp_file_path)
                return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}
