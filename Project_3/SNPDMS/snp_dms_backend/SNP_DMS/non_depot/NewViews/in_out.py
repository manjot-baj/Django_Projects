from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from account.models import AccountUser
from master.models import Location, Site

from depot.functions_two import *
from ..models import *
import datetime
from non_depot.services.non_depot_service import NonDepotService
from common.exceptions import ValidationError, AlreadyExists
from common.error_logging import ErrorLogging

from account.permissions import HasAllowedRoles
class NonDepotInOutEntry(APIView):
    """
    the post function will store all IN Process data
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotService()

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            user = request.user
            in_date = None
            in_time = None
            validation = None
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            # ************************************* Condition Check *************************************************

            self.service.validateContainerDetails(request.data, location, site)

            # ***************************************** Adding Container *****************************************

            self.service.createNonDepotEntry(request.data, location, site)

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)


class UpdateNonDepotContainer(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            container_no = data["container_no"]
            date_str = data["date"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            container_object = NonDepotContainer.objects.get(
                container_no=container_no, location=location, site=site
            )
            gate_in_object = None
            req_date = datetime.datetime.strptime(date_str, "%d/%m/%Y").date()
            gate_in_object = NonDepotGateIn.objects.get(
                container=container_object, in_date=req_date
            )
            main_data = gate_in_object.container.get_container()
            gate_in_data = gate_in_object.get_gate_in()
            main_data.update(gate_in_data)
            record = NonDepotContainerInOutRecord.objects.get(
                container=container_object, gate_in=gate_in_object
            )
            if record.gate_out is not None:
                gate_out_data = record.gate_out.get_gate_out()
                main_data.update(gate_out_data)
            else:
                main_data["gate_out_pk"] = ""
                main_data["out_date"] = ""
                main_data["out_time"] = ""
            return Response(main_data, status=status.HTTP_200_OK)
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            self.service.updateNonDepot(request.data)

            return Response({"successMsg": "Data Update"}, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
