from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from non_depot.models import NonDepotContainerStock
from depot.models import ContainerStock
from django.core.paginator import Paginator
from mnr.services.mnr_service import MNRService
from rest_framework import status
from common.error_logging import ErrorLogging
from common.exceptions import AlreadyExists, ValidationError, ResourceNotFound
from account.permissions import HasAllowedRoles


class GridView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]
    service = MNRService()

    def getParams(self, payload):
        params = {
            "container__location__name": payload["location"],
            "container__site__name": payload["site"],
        }
        if payload.get("ref_code"):
            params["container__client__ref_code"] = payload["ref_code"]

        if payload.get("client"):
            params["container__client__name"] = payload["client"]

        if payload.get("container_no"):
            params["container__container_no__in"] = payload["container_no"]

        if payload.get("stage"):
            params["stage"] = payload["stage"]

        if payload.get("from_date") and payload.get("to_date"):
            params["gate_in__in_date__range"] = [
                payload["from_date"],
                payload["to_date"],
            ]

        if payload.get("status"):
            params["status"] = payload["status"]

        if payload.get("out_history") == "True":
            params["container_status"] = "OUT"
        else:
            params["container_status"] = "IN"
        return params

    def post(self, request, *args, **kwargs):
        try:

            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            params = self.getParams(request.data)

            data = self.service.getGridData(request.data, params, pg_no, on_page_data)

            return Response(data, status=status.HTTP_200_OK)
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred, please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
