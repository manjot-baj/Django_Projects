# rest framework
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from master.functions import (
    upload_client_doc_to_s3,
    download_client_doc_from_s3,
    delete_client_doc_from_s3,
)



# serializer
from master.Serializers.client_document_serializer import (
    ClientDocumentSerializer,
)

# models
from transportation.models import (
    ClientDocument,
)

# services
from master.services.client_document_service import ClientDocumentService

# error handling
from common.error_logging import ErrorLogging
from common.exceptions import ResourceNotFound, AlreadyExists, ValidationError

from account.permissions import HasAllowedRoles
class ListClientDocument(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ClientDocumentService()

    def getParams(self, payload):

        params = {
            "client__location__name": payload["location"],
            "client__site__name": payload["site"],
        }
        if payload["client_name"]:
            params["client__name"] = payload["client_name"]
        return params

    def post(self, request, *args, **kwargs):

        try:
            params = self.getParams(request.data)
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            data = self.service.listOfClientDocuments(params, on_page_data, pg_no)
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


class AddClientDocument(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ClientDocumentService()

    def post(self, request, *args, **kwargs):
        try:
            serializer = ClientDocumentSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            if not self.service.createData(request.data):
                raise ValidationError("Not able to save Data")

            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
            )

        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
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


class GetClientDocument(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            obj = ClientDocument.objects.getClientDocumentById(pk)
            data = obj.get_doc_detail()

            return Response(data, status=status.HTTP_200_OK)
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except AlreadyExists as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
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


class UpdateClientDocument(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ClientDocumentService()

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            document = ClientDocument.objects.getClientDocumentById(pk)
            serializer = ClientDocumentSerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            document.name = data["name"]
            document.save(update_fields=["name"])
            upload = data["upload"]
            if upload:
                if not self.service.uploadDocument(request.data, document):
                    raise ValidationError("Not able to Update Data")

            return Response({"successMsg": "Data Updated"}, status=status.HTTP_200_OK)
        except ValidationError as e:

            return Response(
                {"errorMsg": str(e.message), "data": None},
                status=status.HTTP_400_BAD_REQUEST,
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


# class ClientDocumentMaster(views.APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def create_data(self, data):
#         location = Location.objects.get(name=data["location"])
#         site = Site.objects.get(name=data["site"])
#         client_object = Client.objects.select_related("location", "site").get(
#             name=data["client"],
#             location=location,
#             site=site,
#         )
#         return ClientDocument.objects.create(client=client_object, name=data["name"])
#
#     def upload_doc(self, data, obj):
#         file = data["upload"]
#         location_new = data["location"].replace(" ", "_")
#         site_new = data["site"].replace(" ", "_")
#         client_new = data["client"].replace(" ", "_")
#         file.name = file.name.replace(" ", "_")
#         return upload_client_doc_to_s3(
#             location=location_new,
#             site=site_new,
#             client_name=client_new,
#             doc_id=obj.pk,
#             file=file,
#         )
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             obj = ClientDocument.objects.getClientDocumentById(pk).get_doc_detail()
#
#             return Response(obj, status=status.HTTP_200_OK)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             serializer = ClientDocumentSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             obj = self.create_data(data)
#             if self.upload_doc(data, obj) is True:
#                 return Response({"errorMsg": "Data Saved"}, status=200)
#             else:
#                 return Response({"errorMsg": "Not able to save Data"}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             document = ClientDocument.objects.get(pk=pk)
#             serializer = ClientDocumentSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             document.name = data["name"]
#             document.save()
#             upload = data["upload"]
#             if upload:
#                 file = data["upload"]
#                 location_new = data["location"].replace(" ", "_")
#                 site_new = data["site"].replace(" ", "_")
#                 client_new = data["client"].replace(" ", "_")
#                 file.name = file.name.replace(" ", "_")
#                 upload_obj = upload_client_doc_to_s3(
#                     location=location_new,
#                     site=site_new,
#                     client_name=client_new,
#                     doc_id=document.pk,
#                     file=file,
#                 )
#                 if upload_obj is False:
#                     return Response({"errorMsg": "Not able to Update Data"}, status=200)
#             return Response({"errorMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#


class DeleteClientDocument(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):

        try:
            data = request.data
            for pk in data:
                doc_object = ClientDocument.objects.getClientDocumentById(pk)
                delete_client_doc_from_s3(doc_id=doc_object.pk)
                doc_object.delete()
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


class DownloadClientDocument(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            return download_client_doc_from_s3(doc_id=pk)

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# @receiver(post_save)
# def log_save(sender, instance, created, **kwargs):
#     if sender in [ClientDocument]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_client_document_{location}_{site}")
#         cache.delete(f"request_body_client_document_{location}_{site}")


# @receiver(post_delete)
# def log_delete(sender, instance, **kwargs):
#     if sender in [ClientDocument]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_client_document_{location}_{site}")
#         cache.delete(f"request_body_client_document_{location}_{site}")
