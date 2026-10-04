from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from non_depot.models import NonDepotContainer
from depot.functions_two import check_char_digit, check_digit
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from account.models import AccountUser
from master.models import Location, Site
from non_depot.models import NonDepotGateIn
from account.permissions import HasAllowedRoles

class NonDepotContainerNoValidator(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = NonDepotContainer()

    def post(self, request, *args, **kwargs):

        try:
            container_no = request.data["container_no"]
            location = request.data["location"]
            if len(container_no) == 0:
                raise ValidationError("Please Enter Container_no")
            if not len(container_no) == 11:
                raise ValidationError(
                    "Invalid Entry, "
                    "Please Enter Container_no having first 4 uppercase alphabets and "
                    "rest 7 digits"
                )
            if check_char_digit(container_no) is False:
                raise ValidationError(
                    "Invalid Entry, "
                    "Please Enter Container_no having first 4 uppercase alphabets and "
                    "rest 7 digits"
                )
            validation = check_digit(container_no=container_no)
            if validation is True:
                if NonDepotContainer.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    raise ValidationError("Container_no Valid but already exist.")
                else:
                    return Response({"successMsg": "Container_no Valid"}, status=200)
            else:
                if NonDepotContainer.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    raise ValidationError("Container_no Not Valid but already exist.")
                else:
                    return Response({"errorMsg": "Container_no Not Valid"}, status=200)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class NonDepotContainerDetails(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            container_no = request.data["container_no"]
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
            date = [
                x.in_date.strftime("%d/%m/%Y")
                for x in NonDepotGateIn.objects.filter(container=container_object)
            ]
            return Response(
                {"container_no": container_object.container_no, "dates": date},
                status=200,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
