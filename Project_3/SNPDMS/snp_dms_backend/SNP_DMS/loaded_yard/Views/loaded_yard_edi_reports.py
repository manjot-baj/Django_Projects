# other imports
import os
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback
from edi.msc_edi_excel_generation import make_msc_edi_excel_file
from django.http import HttpResponse

# function imports
from loaded_yard.utils import (
    get_location_site,
    download_loaded_yard_edi,
    make_loaded_yard_edi_file,
)
from loaded_yard.excel_edi_functions import *

# models imports
from loaded_yard.models import LoadedYard


class LoadedYardEDIReport(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location, site = get_location_site(
                location_name=data.get("location"), site_name=data.get("site")
            )
            if (
                not data.get("from_date")
                and not data.get("to_date")
                and not data.get("container_no")
            ):
                return Response(
                    {
                        "errorMsg": "Please fill either from_date and to_date or container_no"
                    }
                )

            edi_content = LoadedYard.objects.get_edi_report(
                data=data, location=location, site=site
            )

            if not edi_content:
                return Response({"errorMsg": "Data not available"}, status=204)

            temp_file_path = make_loaded_yard_edi_file(edi_content)

            return download_loaded_yard_edi(temp_file_path)

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class LoadedYardExcelEDI(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            move_code, data_object_list = get_ly_edi_data(request)
            if type(data_object_list) is dict:
                return Response(data_object_list, status=200)
            location, site = get_location_site(
                location_name=data.get("location"), site_name=data.get("site")
            )
            ly_df_data = ly_excel_edi_main_data(data_object_list, move_code)
            # filename
            tz = timezone.get_current_timezone()
            today = datetime.datetime.now().astimezone(tz)
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
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
