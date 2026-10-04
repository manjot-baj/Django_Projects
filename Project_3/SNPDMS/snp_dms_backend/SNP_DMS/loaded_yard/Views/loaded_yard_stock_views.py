# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback, datetime
from django.db import transaction


# function
from loaded_yard.utils import (
    make_loaded_yard_edi_file,
    download_loaded_yard_edi,
    get_location_site,
)


# models imports
from loaded_yard.models import LoadedYard


class LoadedYardModule(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            main_data = LoadedYard.objects.get_all_loaded_yard(data=data)
            return Response(main_data)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)

    def get(self, request, pk, *args, **kwargs):
        try:
            data = LoadedYard.objects.get_loaded_yard(pk=pk)
            return Response(data)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class LoadedYardINContainerDetails(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            container_no = data["container_no"]
            location, site = get_location_site(
                location_name=data["location"], site_name=data["site"]
            )
            if site.organization == "Golden Horn Containers Service":
                data = LoadedYard.objects.get_detail_of_in_container(
                    container_no=container_no, location=location, site=site
                )
            else:
                data = LoadedYard.objects.client_specific_detail_of_in_container(
                    container_no=container_no, location=location, site=site
                )
            return Response(data)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class LoadedYardOUTContainerDetails(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            container_no = data["container_no"]
            location, site = get_location_site(
                location_name=data["location"], site_name=data["site"]
            )
            if site.organization == "Golden Horn Containers Service":
                data = LoadedYard.objects.get_detail_of_out_container(
                    container_no=container_no, location=location, site=site
                )
            else:
                data = LoadedYard.objects.client_specific_detail_of_out_container(
                    container_no=container_no, location=location, site=site
                )

            return Response(data)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class UpdateLoadedYard(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data["container_no"]
            process = data["process_type"]
            location, site = get_location_site(
                location_name=data["location"], site_name=data["site"]
            )
            date = datetime.datetime.strptime(data["date"], "%d/%m/%Y").date()
            response = LoadedYard.objects.get_loaded_yard_data_for_in_out(
                process=process,
                date=date,
                container_no=container_no,
                location=location,
                site=site,
            )

            return Response(response)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found "}, status=200)

    def validate_data(self, data):
        if not data["container_no"]:
            return {"errorMsg": "Container Number is mandatory"}
        if not data["size"]:
            return {"errorMsg": "Size is mandatory"}
        if data["process_type"] == "OUT" and not data["booking_no"]:
            return {"errorMsg": "Booking Number is mandatory for out operations"}

        return data

    def put(self, request, *args, **kwargs):
        try:
            data = request.data
            if not data["container_no"]:
                return {"errorMsg": "Container Number is mandatory"}
            if not data["size"]:
                return {"errorMsg": "Size is mandatory"}
            # if data["process_type"] == "OUT" and not data["booking_no"]:
            #     return Response({"errorMsg": "Booking Number is mandatory for out operations"}, status=200)

            # Checks if specific move with same date and container not exists or not
            move_codes = LoadedYard.objects.client_specific_validate_move_codes(data)
            if move_codes:
                return Response(
                    {
                        "errorMsg": f"{move_codes} dates already exists for {data['container_no']}"
                    }
                )

            with transaction.atomic():
                instance = LoadedYard.objects.update_instance(data=data)
            return Response({"successMsg": "Data Updated Succesfully"}, status=200)

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class GetLoadedYardEDI(views.APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            stock_id = data["stock_id"]

            attachment_list = LoadedYard.objects.get_move_code_content_by_checkbox(
                stock_id=stock_id
            )

            edi_content = "".join(attachment_list)
            temp_file_path = make_loaded_yard_edi_file(edi_content)

            return download_loaded_yard_edi(temp_file_path)

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class GetClientSpecificData(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk, *args, **kwargs):
        try:
            data = LoadedYard.objects.get_client_specific_container_data(pk=pk)
            return Response(data)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
