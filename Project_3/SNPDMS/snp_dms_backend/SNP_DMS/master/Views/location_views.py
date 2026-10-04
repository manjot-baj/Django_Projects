# rest framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# serializer
from master.Serializers.location_serializer import LocationSerializer

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound

# models
from master.models import Location
from account.models import AccountUser

# service
from master.services.location_service import LocationService

from account.permissions import HasAllowedRoles
class AddLocation(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    def post(self, request, *args, **kwargs):
        try:
            serializer = LocationSerializer(
                data=request.data, context={"request": request}
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetLocation(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            location_object = Location.objects.getLocationById(pk)
            data = location_object.get_location_detail()
            return Response(data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateLocation(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def put(self, request, pk, *args, **kwargs):
        try:
            location_object = Location.objects.getLocationById(pk)
            serializer = LocationSerializer(
                instance=location_object,
                data=request.data,
                context={"request": request},
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=200)
            serializer.save()
            icon = request.data["icon"]
            if not type(icon) == str:
                location_object.icon = icon
                location_object.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteLocation(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    locationService = LocationService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data

            params = {"pk__in": data}
            location_qs = Location.objects.getLocationQuerysetByParams(params)
            not_deleted = self.locationService.deleteLocation(location_qs)
            if not_deleted:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response({"successMsg": "Data Deleted"}, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListLocation(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin"]
    locationService = LocationService()

    def getParams(self, user, role, name):
        params = {}
        if role == "Admin" and name:
            params = {"name": name}
        elif role != "Admin":
            params = {"name": user.location.name}
        return params

    def post(self, request, *args, **kwargs):
        try:
            user = AccountUser.objects.get(username=request.user.username)
            role = user.role.name
            name = request.data.get("name")
            params = self.getParams(user, role, name)
            data = self.locationService.listOfLocation(role, name, params)

            return Response(data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# @receiver(post_save)
# def log_save(sender, instance, created, **kwargs):
#     if sender in [Location]:
#         cache.delete("response_loc_view")


# @receiver(post_delete)
# def log_delete(sender, instance, **kwargs):
#     if sender in [Location]:
#         cache.delete("response_loc_view")
