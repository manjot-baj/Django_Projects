# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# serializer
from master.Serializers.site_serializer import SiteSerializer

# models
from master.models import Site, Location
from account.models import AccountUser

# service
from master.services.site_service import SiteService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound

from account.permissions import HasAllowedRoles


class AddSite(APIView):
    
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin"
    ]

    def post(self, request, *args, **kwargs):
        try:
            serializer = SiteSerializer(data=request.data, context={"request": request})
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


class GetSite(APIView):
   
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User"
    ]

    def get(self, request, pk, *args, **kwargs):
        try:
            site = Site.objects.getSiteById(pk)
            data = site.get_site_detail()
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


class UpdateSite(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
    ]

    def put(self, request, pk, *args, **kwargs):
        try:
            site_object = Site.objects.getSiteById(pk)
            serializer = SiteSerializer(
                instance=site_object, data=request.data, context={"request": request}
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
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


class DeleteSite(APIView):

    permission_classes = (IsAuthenticated,)
    siteService = SiteService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            params = {"pk__in": data}
            site_qs = Site.objects.getSiteQuerysetByParams(params)
            not_deleted = self.siteService.deleteSite(site_qs)
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


class ListSite(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User"
    ]
    siteService = SiteService()
    # def get_all_objects(self, user):
    #     role = user.role.name
    #     if role == "Admin":
    #         return Site.objects.select_related("location")
    #     elif role == "Location Admin":
    #         return Site.objects.filter(location=user.location).select_related(
    #             "location"
    #         )
    #     elif role in ["Site Admin", "Depot User"]:
    #         return Site.objects.filter(
    #             location=user.location, name=user.site.name
    #         ).select_related("location")
    #     else:
    #         return Site.objects.select_related("location")

    def getParams(self, role, user):
        if role == "Location Admin":
            params = {"location": user.location}
            return params
        elif role in ["Site Admin", "Depot User"]:
            params = {"location": user.location, "name": user.site.name}
            return params

        return {}

    def post(self, request, *args, **kwargs):
        try:

            user = AccountUser.objects.get(username=request.user.username)
            role = user.role.name
            params = self.getParams(role, user)

            data = self.siteService.listOfSite(params, role)

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
