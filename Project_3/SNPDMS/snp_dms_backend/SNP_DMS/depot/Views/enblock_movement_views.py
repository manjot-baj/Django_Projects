import logging
import os
import shutil
import pandas as pd

from openpyxl import load_workbook
from SNP_DMS.settings.base import BASE_DIR
from datetime import datetime

# django
from django.db import transaction
from django.http import HttpResponse


# rest framework
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# functions
from depot.functions import (
    extract_advance_list_data,
    check_errors_in_advance_list,
    extract_advance_list_data_for_rejected_file,
    create_en_block_movement_report,
    get_enblock_df,
)
from master.functions import pagination_func

# models
from depot.models import EnBlockMovement
from master.models import VesselVoyageDetail

#error handling
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError
from account.permissions import HasAllowedRoles

class ExtractAdvanceListData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            file = request.data.get("file")
            location = request.data.get("location_id")
            site = request.data.get("site_id")
            extracted_data_list = extract_advance_list_data(file)

            correct_data, error_data, error_data_msg = check_errors_in_advance_list(
                extracted_data_list, location, site
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


class ImportAdvanceListData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            importable_data = request.data.get("importable_data")
            location = request.data.get("location_id")
            site = request.data.get("site_id")

            with transaction.atomic():
                data = []
                for each in importable_data:
                    vessel_name = each.get("vessel_name").strip()
                    voyage_no = each.get("voyage_no").strip()
                    if EnBlockMovement.objects.filter(
                        line=each.get("line"),
                        job_order_no=each.get("job_order_no"),
                        vessel_no=vessel_name,
                        voyage_no=voyage_no,
                        location_id=location,
                        site_id=site,
                    ).exists():
                        return Response({"message": "Data already exists"}, status=400)

                    data.append(
                        EnBlockMovement(
                            line=each.get("line"),
                            job_order_no=each.get("job_order_no"),
                            vessel_no=vessel_name,
                            quantity=each.get("quantity"),
                            voyage_no=voyage_no,
                            gate_ins=each.get("gate_ins"),
                            pendency=each.get("pendency"),
                            location_id=location,
                            site_id=site,
                        )
                    )

                EnBlockMovement.objects.bulk_create(data)

            return Response({"message": "Data imported successfully"}, status=201)
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


class RejectedAdvanceListData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            faults = request.data["faults"]
            tool_room_df_data = extract_advance_list_data_for_rejected_file(
                request.data["rejected_data"]
            )

            if not os.path.exists(os.path.join(BASE_DIR, "temp/sample_stock/")):
                os.makedirs(os.path.join(BASE_DIR, "temp/sample_stock/"))

            new_temp_file_path = os.path.join(
                BASE_DIR, "temp/sample_stock/sample_advance_list.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_advance_list.xlsx"
            )

            shutil.copyfile(temp_file_path, new_temp_file_path)

            book = load_workbook(new_temp_file_path)

            with pd.ExcelWriter(new_temp_file_path, engine="openpyxl") as writer:
                writer.workbook = book
                writer.worksheets = dict((ws.title, ws) for ws in book.worksheets)
                tool_room_df_data.to_excel(
                    writer,
                    sheet_name="advance_list",
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
                    'attachment; filename="rejected_advance_list.xlsx"'
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


class GetEnBlockMovement(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            en_block_movement = EnBlockMovement.objects.get(pk=pk)
            return Response(
                {
                    "message": "En Block Data Found",
                    "data": {
                        "pk": en_block_movement.pk,
                        "line": en_block_movement.line,
                        "job_order_no": en_block_movement.job_order_no,
                        "vessel_no": en_block_movement.vessel_no,
                        "quantity": en_block_movement.quantity,
                        "voyage_no": en_block_movement.voyage_no,
                        "gate_ins": en_block_movement.gate_ins,
                        "pendency": en_block_movement.pendency,
                    },
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


class ListEnBlockMovement(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        location = payload.get("location_id")
        site = payload.get("site_id")
        pg_no = payload.get("page_no")
        on_page_data = payload.get("on_page_data")
        vessel_no = payload.get("vessel_no")
        voyage_no = payload.get("voyage_no")
        job_order_no = payload.get("job_order_no")
        line = payload.get("line")
        params = {
            "location_id": location,
            "site_id": site,
        }
        if line:
            params["line"] = line
        if vessel_no:
            params["vessel_no"] = vessel_no
        if voyage_no:
            params["voyage_no"] = voyage_no
        if job_order_no:
            params["job_order_no"] = job_order_no
        return params, on_page_data, pg_no

    def formatData(self, data):
        return {
            "pk": data.pk,
            "line": data.line,
            "job_order_no": data.job_order_no,
            "vessel_voyage_no": data.vessel_no + "-" + data.voyage_no,
            "quantity": data.quantity,
            "gate_ins": data.gate_ins,
            "pendency": data.pendency,
            "discarded": data.discarded,
        }

    def getFilteredData(self, object):
        main_data = list(map(self.formatData, object))

        return main_data

    def post(self, request, *args, **kwargs):

        try:
            params, on_page_data, pg_no = self.getParams(request.data)

            filtered_data = EnBlockMovement.objects.filter(**params).order_by("-pk")
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


class EnBlockSampleFile(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_advance_list.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_advance_list.xlsx"'
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


class EnBlockMovementReport(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            location = request.data.get("location_id")
            site = request.data.get("site_id")
            job_order_no = request.data.get("job_order_no")

            en_block_df_data, enblock_summary_df_data, headers = get_enblock_df(
                job_order_no, location, site
            )

            temp_file_path = create_en_block_movement_report(
                location,
                site,
                en_block_df_data,
                enblock_summary_df_data,
                headers,
            )

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="en_block_movement_report_{datetime.today().date()}.xlsx"'
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


class EnBlockVesselVoyageList(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            location_id = request.data.get("location_id")
            site_id = request.data.get("site_id")

            vessel = VesselVoyageDetail.objects.filter(
                location_id=location_id, site_id=site_id
            ).values_list("vessel_name", flat=True)

            voyage = VesselVoyageDetail.objects.filter(
                location_id=location_id, site_id=site_id
            ).values_list("voyage_no", flat=True)

            data = {"vessel_name": vessel, "voyage_no": voyage}

            return Response(
                {"message": "Data retrieved successfully", "data": data}, status=200
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
