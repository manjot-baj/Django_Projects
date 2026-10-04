# rest framework
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# serializer
from master.Serializers.size_serializer import ContainerSizeSerializer

# models
from master.models import ContainerSize

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, ValidationError

# service
from master.services.size_service import SizeService

from account.permissions import HasAllowedRoles
class AddSize(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            serializer = ContainerSizeSerializer(
                data=request.data, context={"request": request}
            )
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()
            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )
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


class GetSize(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    def get(self, request, pk, *args, **kwargs):
        try:
            size = ContainerSize.objects.getSizeData(pk)

            return Response(size, status=200)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateSize(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:
            size = ContainerSize.objects.getSizeById(pk)
            serializer = ContainerSizeSerializer(
                instance=size, data=request.data, context={"request": request}
            )
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            serializer.save()
            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
        except ResourceNotFound as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# class SizeMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             obj = ContainerSize.objects.values("pk", "name").get(pk=pk)
#
#             return Response(obj, status=200)
#             except ResourceNotFound as e:
#
#             return Response(
#                 {"errorMsg": str(e.message), "data": None},
#                 status=status.HTTP_404_NOT_FOUND,
#             )
#
#         except Exception as e:
#
#             ErrorLogging().log_error()
#
#             return Response(
#                 {"errorMsg": "An unexpected error occurred. Please try again later."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             serializer = ContainerSizeSerializer(
#                 data=request.data, context={"request": request}
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             size = ContainerSize.objects.get(pk=pk)
#             serializer = ContainerSizeSerializer(
#                 instance=size, data=request.data, context={"request": request}
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             serializer.save()
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


class DeleteSize(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]
    sizeService = SizeService()

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            params = {"pk__in": data}
            not_deleted = self.sizeService.deleteSize(params)

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


class ListSize(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            data = ContainerSize.objects.getSizeData()
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
