from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import WistimS3Upload
from decouple import config
from django.core.paginator import Paginator
import os
from common.functions import download_file
from django.http import HttpResponse

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")

from account.permissions import HasAllowedRoles


class DownloadWistimDistimFromS3View(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            bucket_name = AWS_STORAGE_BUCKET_NAME
            wistim_distim_s3_object = WistimS3Upload.objects.get(pk=pk)
            s3_object_name = wistim_distim_s3_object.s3_object_name
            s3_file_name = wistim_distim_s3_object.s3_file_name
            temp_file_path = download_file(
                bucket=bucket_name, object_name=s3_object_name, file_name=s3_file_name
            )
            extension = os.path.splitext(s3_file_name)[1]
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/{extension}"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="{s3_file_name}"'
                )
                os.remove(temp_file_path)
                return file_response
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            location = request.data["location"]
            site = request.data["site"]
            queryset = None
            date = data["date"]
            type = data["type"]

            type_dict = {
                "Estimate Westim": "Estimate",
                "Repair Destim": "Repair",
                "Destim": "Distim",
                "Rejected Westim": "Rejected Wistim",
                "Approved Westim": "Approved Wistim",
            }

            if location == "ALL":
                queryset = WistimS3Upload.objects.all().order_by("date")

            elif site == "ALL":
                queryset = WistimS3Upload.objects.filter(
                    location__name=location
                ).order_by("date")

            else:
                queryset = WistimS3Upload.objects.filter(
                    location__name=location, site__name=site
                ).order_by("date")

            if not len(data["type"]) == 0:
                queryset = queryset.filter(type=type_dict[type])

            if not len(date["from"]) == 0 and not len(date["to"]) == 0:
                queryset = queryset.filter(date__gte=date["from"], date__lte=date["to"])

            # Pagination
            paginator = Paginator(queryset, on_page_data)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            current_page = paginator.page(pg_no)
            on_page_data_count = (
                current_page.end_index() - current_page.start_index() + 1
            )
            prev_page = ""
            if current_page.has_previous():
                prev_page = current_page.previous_page_number()
            next_page = ""
            if current_page.has_next():
                next_page = current_page.next_page_number()

            response_data = []
            count = 0
            for each in current_page:
                data_dict = each.get_wistim_distim_s3_detail()
                data_dict["sr_no"] = current_page.start_index() + count
                response_data.append(data_dict)
                count += 1

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": response_data,
                },
                status=200,
            )
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
