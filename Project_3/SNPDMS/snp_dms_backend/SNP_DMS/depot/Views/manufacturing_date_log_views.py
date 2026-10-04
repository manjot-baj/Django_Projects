from master.functions import pagination_func
from rest_framework.response import Response
from rest_framework.views import APIView
from depot.models import ManufacturingDateLog
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound
import pytz
from account.permissions import HasAllowedRoles

class ManufacturingDateLogView(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        params = {
            "location__id": payload.get("location"),
            "site_id": payload.get("site"),
        }
        if payload.get("container_no"):
            params["container_no"] = payload.get("container_no")
        return params

    def manufacturingDateLogData(self, data):

        return [
            {
                "pk": each.pk,
                "container_no": each.container_no,
                "previous_manufacturing_date": each.previous_manufacturing_date.strftime(
                    "%Y-%m-%d"
                ),
                "current_manufacturing_date": each.current_manufacturing_date.strftime(
                    "%Y-%m-%d"
                ),
                "location": each.location.name,
                "site": each.site.name,
                "changed_by": each.changed_by.username,
                "updated_at": each.updated_at.astimezone(pytz.timezone("Asia/Kolkata")).strftime("%Y-%m-%d %H:%M:%S"),
            }
            for each in data
        ]

    def post(self, request):

        try:
            params = self.getParams(request.data)
            filtered_data = ManufacturingDateLog.objects.select_related(
                "location", "site", "changed_by"
            ).filter(**params)

            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = pagination_func(
                filtered_data,
                request.data.get("on_page_data"),
                request.data.get("pg_no"),
            )
            main_data = self.manufacturingDateLogData(current_page.object_list)
            if not main_data:
                raise ResourceNotFound("No data found")
            data = {
                "no_of_data": no_of_data_count,
                "on_page_data": on_page_data_count,
                "total_pages": no_of_pages,
                "prev_page": prev_page,
                "next_page": next_page,
                "data": main_data,
            }

            return Response(
                {"message": "Data Found", "data": data}, status=status.HTTP_200_OK
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
