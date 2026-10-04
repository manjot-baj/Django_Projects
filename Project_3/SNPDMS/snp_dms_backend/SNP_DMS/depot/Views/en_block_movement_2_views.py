import logging
import os
import shutil
import traceback
from datetime import datetime
from openpyxl import load_workbook
from SNP_DMS.settings.base import BASE_DIR
import pandas as pd


# django
from django.db import transaction
from django.http import HttpResponse
from django.db.models import Q

# rest framework
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# functions
from depot.functions import (
    extract_advance_list_data_for_enblock_pregate_in,
    check_errors_in_advance_list_for_enblock_pre_gatein,
    create_en_block_pregatein_report,
    en_block_pregatein_df_data,
    get_enblock_df,
    get_pendency_df_data,
    get_discarded_df_data,
)
from master.functions import pagination_func

# models
from depot.models import EnBlockMovement, EnBlockPreGateIn
from master.models_two import Client

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import AlreadyExists, ValidationError, ResourceNotFound

from account.permissions import HasAllowedRoles


class ExtractEnblockPreGateInData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            file = request.data.get("file")
            location = request.data.get("location_id")
            site = request.data.get("site_id")
            extracted_data_list = extract_advance_list_data_for_enblock_pregate_in(file)

            correct_data, error_data, error_data_msg = (
                check_errors_in_advance_list_for_enblock_pre_gatein(
                    extracted_data_list, location, site
                )
            )

            correct_data_count = len(correct_data)
            error_data_count = len(error_data)
            return Response(
                {
                    "importable_data": correct_data,
                    "importable_data_count": correct_data_count,
                    "rejected_data": error_data,
                    "rejected_data_count": error_data_count,
                    "faults": error_data_msg,
                },
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ImportEnblockPreGateInData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            importable_data = request.data.get("importable_data")
            location = request.data.get("location_id")
            site = request.data.get("site_id")
            categorize_data = {}
            for each in importable_data:
                key = (
                    f"{each['job_order_no']}_{each['vessel_name']}_{each['voyage_no']}"
                )

                if key in categorize_data.keys():
                    categorize_data[key]["data"].append(each)
                else:
                    categorize_data[key] = {"data": [each]}

            with transaction.atomic():
                en_block_objects = {}
                for key in categorize_data.keys():
                    job_order_no, vessel_name, voyage_no = key.split("_", 2)
                    value = categorize_data[key]
                    en_block, created = EnBlockMovement.objects.get_or_create(
                        vessel_no=vessel_name,
                        voyage_no=voyage_no,
                        job_order_no=job_order_no,
                        location_id=location,
                        site_id=site,
                        defaults={
                            "line": value["data"][0]["line"],
                            "quantity": 0,
                            "gate_ins": 0,
                            "pendency": 0,
                        },
                    )

                    en_block_objects[key] = en_block

                en_block_updates = []
                for key, value in categorize_data.items():
                    en_block = en_block_objects[key]
                    data_list = value["data"]
                    count = len(data_list)

                    query = Q()
                    for item in data_list:
                        query |= Q(
                            line=item["line"],
                            container_no=item["container_no"],
                            size=item["size"],
                            type=item["type"],
                            en_block=en_block,
                        )
                    if EnBlockPreGateIn.objects.filter(query).exists():
                        raise AlreadyExists("Data already exists!")

                    en_block_pregatein_instances = [
                        EnBlockPreGateIn(
                            line=each["line"],
                            container_no=each["container_no"],
                            size=each["size"],
                            type=each["type"],
                            en_block=en_block,
                        )
                        for each in data_list
                    ]

                    EnBlockPreGateIn.objects.bulk_create(en_block_pregatein_instances)
                    en_block.quantity += count
                    en_block.pendency += count
                    en_block_updates.append(en_block)

                EnBlockMovement.objects.bulk_update(
                    en_block_updates, ["quantity", "pendency"]
                )

            return Response(
                {"message": "Data imported successfully"},
                status=status.HTTP_201_CREATED,
            )

        except AlreadyExists as e:

            return Response(
                {"message": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EnBlockPreGateInSampleFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_enblock_pregatein_upload_file.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_enblock_pregatein_upload_file.xlsx"'
                )
            return file_response
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListEnBlockPreGateInData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        location = payload.get("location_id")
        site = payload.get("site_id")
        pg_no = payload.get("page_no")
        on_page_data = payload.get("on_page_data")
        vessel_name = payload.get("vessel_name")
        voyage_no = payload.get("voyage_no")
        job_order_no = payload.get("job_order_no")
        container_no = payload.get("container_no")
        status = payload.get("status")
        line = payload.get("line")
        params = {
            "en_block__location_id": location,
            "en_block__site_id": site,
        }

        if status:
            if status == "Pending":
                params["is_processed"] = False
                params["is_discarded"] = False
            elif status == "Processed":
                params["is_processed"] = True
            elif status == "Discarded":
                params["is_discarded"] = True

        if line:
            params["line"] = line
        if vessel_name:
            params["en_block__vessel_no"] = vessel_name
        if voyage_no:
            params["en_block__voyage_no"] = voyage_no
        if job_order_no:
            params["en_block__job_order_no"] = job_order_no
        if container_no:
            params["container_no"] = container_no
        return params, on_page_data, pg_no

    def formatData(self, data):
        return {
            "pk": data.pk,
            "line": data.line,
            "container_no": data.container_no,
            "vessel_name": data.en_block.vessel_no,
            "voyage_no": data.en_block.voyage_no,
            "job_order_no": data.en_block.job_order_no,
            "size": data.size,
            "type": data.type,
            "is_processed": data.is_processed,
            "is_discarded": data.is_discarded,
            "remark": data.remarks,
        }

    def getFilteredData(self, object):
        main_data = list(map(self.formatData, object))

        return main_data

    def post(self, request, *args, **kwargs):

        try:
            params, on_page_data, pg_no = self.getParams(request.data)
            filtered_data = (
                EnBlockPreGateIn.objects.select_related("en_block")
                .filter(**params)
                .order_by("-pk")
            )

            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = pagination_func(filtered_data, on_page_data, pg_no)

            main_data = self.getFilteredData(object=current_page.object_list)

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": main_data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetEnblockPreGateIn(ListEnBlockPreGateInData, APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            en_block_movement = EnBlockPreGateIn.objects.get(pk=pk)
            data = super().formatData(en_block_movement)

            return Response(
                {
                    "message": "Data Found",
                    "data": data,
                },
                status=200,
            )
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DownloadRejectedDataFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=422)
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]

            enblock_df = pd.DataFrame(data)[
                [
                    "line",
                    "container_no",
                    "size",
                    "type",
                    "vessel_name",
                    "voyage_no",
                    "job_order_no",
                ]
            ]
            enblock_df.columns = [
                "LINE",
                "CONTAINER NO",
                "SIZE",
                "TYPE",
                "VESSEL NAME",
                "VOYAGE NO",
                "JOB ORDER NO",
            ]

            if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

            new_temp_file_path = os.path.join(
                BASE_DIR, "temp/sample_stock/sample_enblock_pregatein_upload_file.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_enblock_pregatein_upload_file.xlsx"
            )

            shutil.copyfile(temp_file_path, new_temp_file_path)
            book = load_workbook(new_temp_file_path)

            with pd.ExcelWriter(new_temp_file_path, engine="openpyxl") as writer:

                writer.workbook = book

                writer.worksheets = dict((ws.title, ws) for ws in book.worksheets)

                enblock_df.to_excel(
                    writer,
                    sheet_name="enblock_pregatein",
                    startrow=0,
                    startcol=0,
                    index=False,
                )
                pd.DataFrame(faults).to_excel(
                    writer, sheet_name="faults", startrow=0, startcol=0, index=False
                )

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    'attachment; filename="rejected_enblock_pregatein_file.xlsx"'
                )

            os.remove(new_temp_file_path)

            return file_response

        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetEnblockPreGateIn(ListEnBlockPreGateInData, APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            en_block_movement = EnBlockPreGateIn.objects.get(pk=pk)
            data = super().formatData(en_block_movement)

            return Response(
                {
                    "message": "Data Found",
                    "data": data,
                },
                status=200,
            )
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetEnblockPreGateInInfo(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            container_no = request.data.get("container_no")
            location = request.data.get("location_id")
            site = request.data.get("site_id")
            params = {
                "container_no": container_no,
                "en_block__location_id": location,
                "en_block__site_id": site,
                "is_processed": False,
                "is_discarded": False,
            }
            en_block_movement = (
                EnBlockPreGateIn.objects.select_related("en_block")
                .filter(**params)
                .first()
            )
            if not en_block_movement:
                return Response(
                    {
                        "message": "Not Found",
                        "data": {},
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:

                data = {
                    "vessel_name": en_block_movement.en_block.vessel_no,
                    "voyage_no": en_block_movement.en_block.voyage_no,
                    "job_order_no": en_block_movement.en_block.job_order_no,
                    "size": en_block_movement.size,
                    "type": en_block_movement.type,
                    "client": en_block_movement.line,
                    "line": Client.objects.filter(
                        name=en_block_movement.line,
                        location_id=en_block_movement.en_block.location.pk,
                        site_id=en_block_movement.en_block.site.pk,
                    ).values_list("ref_code", flat=True),
                }

            return Response(
                {
                    "message": "Data Found",
                    "data": data,
                },
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EnBlockPreGateInReport(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            location = request.data.get("location_id")
            site = request.data.get("site_id")
            job_order_no = request.data.get("job_order_no")

            if not EnBlockPreGateIn.objects.filter(
                en_block__job_order_no=job_order_no,
                en_block__location_id=location,
                en_block__site_id=site,
            ).exists():
                raise ValidationError("Job order no does not exists")

            en_block_df_data, enblock_summary_df_data, headers = get_enblock_df(
                job_order_no, location, site
            )
            pendency_df_data = get_pendency_df_data(job_order_no, location, site)
            discarded_df_data = get_discarded_df_data(job_order_no, location, site)

            temp_file_path = create_en_block_pregatein_report(
                location,
                site,
                en_block_df_data,
                enblock_summary_df_data,
                headers,
                pendency_df_data,
                discarded_df_data,
            )

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="en_block_pregatein_report_{datetime.today().date()}.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response
        except ValidationError as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DiscardContainers(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request):
        try:
            with transaction.atomic():
                pk_list = request.data.get("pk_list", [])
                job_order_no = request.data.get("job_order_no")
                location = request.data.get("location_id")
                site = request.data.get("site_id")
                remark = request.data.get("remark", "")

                en_block = EnBlockPreGateIn.objects.filter(
                    en_block__location_id=location,
                    en_block__site_id=site,
                    en_block__job_order_no=job_order_no,
                    pk__in=pk_list,
                    is_processed=False,
                    is_discarded=False,
                )
                if not en_block.exists():
                    raise ResourceNotFound(
                        "No containers found for the given job order"
                    )

                count = en_block.count()
                # Decrement pendency and quantity according to count of containers discarded
                en_block_object = en_block.first()
                en_block_object.en_block.quantity = (
                    en_block_object.en_block.quantity - count
                )
                en_block_object.en_block.pendency = (
                    en_block_object.en_block.pendency - count
                )
                en_block_object.en_block.discarded = (
                    en_block_object.en_block.discarded + count
                )
                en_block_object.en_block.save(
                    update_fields=["quantity", "pendency", "discarded"]
                )
                en_block.update(remarks=remark, is_discarded=True)

            return Response(
                {"message": "Discarded Containers"}, status=status.HTTP_200_OK
            )

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
