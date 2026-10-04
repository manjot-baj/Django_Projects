from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from loaded_yard.services.loaded_yard_service import LoadedYardService
from rest_framework import status
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, ValidationError
from master.models import Site
from datetime import datetime

import os
from django.http import HttpResponse
from django.utils import timezone
from edi.msc_edi_excel_generation import make_msc_edi_excel_file

from account.permissions import HasAllowedRoles
class LoadedYardEDIReport(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = request.data.get("location")
            site = request.data.get("site")

            if (
                not data.get("from_date")
                and not data.get("to_date")
                and not data.get("container_no")
            ):
                raise ValidationError(
                    "Please fill either from_date and to_date or container_no"
                )

            edi_content = self.service.getEdiReport(
                data=data, location=location, site=site
            )

            if not edi_content:
                raise ResourceNotFound("Data Not Available")

            temp_file_path = self.service.makeLoadedYardEdiFile(edi_content)

            return self.service.downloadLoadedYardEdi(temp_file_path)

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoadedYardExcelEDI(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin","Location Admin","Site Admin", "Depot User","Loaded Yard"]
    service = LoadedYardService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            move_code, data_object_list = self.service.getLyEdiData(request)
            if type(data_object_list) is dict:
                return Response(data_object_list, status=200)
            site = Site.objects.get(name=request.data.get("site"))
            ly_df_data = self.service.lyExcelEdiMainData(data_object_list, move_code)
            # filename
            tz = timezone.get_current_timezone()
            today = datetime.now().astimezone(tz)
            date = today.date().strftime("%d%m%Y")
            time = today.time().strftime("%H%M%S")
            depot_name = site.name.upper().replace(" ", "")
            file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_{depot_name}_{date}{time}"
            # file creation
            temp_file_path = make_msc_edi_excel_file(
                context=ly_df_data, filename=file_name
            )
            # download file
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="{file_name}.xlsx"'
                )
                file_response["X-Filename"] = f"{file_name}.xlsx"
                os.remove(temp_file_path)
            return file_response
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
