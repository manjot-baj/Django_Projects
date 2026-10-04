# rest framework
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# django
from django.db import transaction

# serializer
from master.Serializers.country_serializer import CountrySerializer

# models
from transportation.models import Country

# services
from master.services.country_service import CountryService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound

from account.permissions import HasAllowedRoles


class AddCountry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    service = CountryService()

    def post(self, request, *args, **kwargs):
        try:

            serializer = CountrySerializer(
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


class GetCountry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            country_object = Country.objects.getCountryData(pk)
            return Response(country_object, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"successMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateCountry(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def put(self, request, pk, *args, **kwargs):
        try:
            country = Country.objects.getCountryById(pk)
            serializer = CountrySerializer(
                instance=country, data=request.data, context={"request": request}
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


# class CountryMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, *args, **kwargs):
#         try:
#
#             serializer = CountrySerializer(
#                 data=request.data, context={"request": request}
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#
#
#             return Response({"errorMsg": "Data Saved"}, status=200)
#
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             country_object = Country.objects.values("pk", "name", "currency").get(pk=pk)
#             return Response(country_object, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             country = Country.objects.get(pk=pk)
#             serializer = CountrySerializer(
#                 instance=country, data=request.data, context={"request": request}
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteCountry(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    service = CountryService()

    def post(self, request, *args, **kwargs):
        try:

            pk_list = request.data
            with transaction.atomic():

                not_deleted = self.service.deleteCountry(pk_list)

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


class ListCountries(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            country = Country.objects.getCountryData()

            return Response(country, status=status.HTTP_200_OK)
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
#     if sender in [Country]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_country_{location}_{site}")
#         cache.delete(f"request_body_country_{location}_{site}")


# @receiver(post_delete)
# def log_delete(sender, instance, **kwargs):
#     if sender in [Country]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_country_{location}_{site}")
#         cache.delete(f"request_body_country_{location}_{site}")
