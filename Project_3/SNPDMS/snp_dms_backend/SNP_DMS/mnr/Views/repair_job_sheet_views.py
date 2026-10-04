import datetime, os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..functions import get_generic_job_sheet_main_data, create_generic_job_sheet_wb
from django.http import HttpResponse
from django.utils import timezone

from account.permissions import HasAllowedRoles


class DownloadJobSheetView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            sheet_data = get_generic_job_sheet_main_data([request.data["pk"]])
            temp_file_path = create_generic_job_sheet_wb(sheet_data)
            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M")
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="job_sheet_{date}{time}.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response
        except Exception as e:
            return Response({"errorMsg": str(e)}, status=200)
