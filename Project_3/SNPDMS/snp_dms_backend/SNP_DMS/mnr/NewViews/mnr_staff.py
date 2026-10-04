from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from ..models import MnrStaff
from master.functions import none_data_converter
import logging, traceback
from django.db import transaction
from common.error_logging import ErrorLogging
from common.exceptions import AlreadyExists, ValidationError, ResourceNotFound
from rest_framework import status
from account.permissions import HasAllowedRoles


class ListMnrStaff(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def getParams(self, payload):
        params = {
            "location__name": payload.get("location", ""),
            "site__name": payload.get("site", ""),
        }
        if payload.get("role", ""):
            params["role"] = payload.get("role")
        return params

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            params = self.getParams(data)
            queryset = MnrStaff.objects.select_related("location", "site").filter(
                **params
            )
            response_data = [each.get_staff() for each in queryset.iterator()]
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteMnrStaff(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):

        try:
            data = request.data
            not_deleted = []
            with transaction.atomic():
                queryset = MnrStaff.objects.filter(pk__in=data)
                for mnr_staff in queryset:
                    if any(
                        [
                            mnr_staff.survey_by_staff_rel.exists(),
                            mnr_staff.estimate_by_staff_rel.exists(),
                            mnr_staff.repair_man_power_staff_rel.exists(),
                        ]
                    ):
                        not_deleted.append(mnr_staff.firstName)
                    else:
                        mnr_staff.delete()

            if not_deleted:
                raise ValidationError(
                    f"Can't Delete {not_deleted}, data have dependencies"
                )
            return Response({"successMsg": "Data Deleted"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"errorMsg": "Please try again later!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AddMnrStaff(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                main_data = none_data_converter(dict_data=data)
                location_str = main_data["location"]
                site_str = main_data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
                if MnrStaff.objects.filter(
                    firstName=main_data["firstName"],
                    lastName=main_data["lastName"],
                    location=location,
                    site=site,
                    role=main_data["role"],
                ).exists():
                    raise AlreadyExists("Staff already exists")
                staff_object = MnrStaff(
                    firstName=main_data["firstName"],
                    lastName=main_data["lastName"],
                    emailId=main_data["emailId"],
                    mobileNo=main_data["mobileNo"],
                    qualification=main_data["qualification"],
                    role=main_data["role"],
                    location=location,
                    site=site,
                )
                staff_object.save()
            return Response({"successMsg": "Data Saved"}, status=200)
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetAndUpdateMnrStaff(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            staff_object = MnrStaff.objects.get(pk=pk)
            data = staff_object.get_staff()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again later"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                main_data = none_data_converter(dict_data=data)
                location_str = main_data["location"]
                site_str = main_data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
                staffObj = MnrStaff.objects.get(pk=pk)
                if (
                    MnrStaff.objects.exclude(pk=staffObj.pk)
                    .filter(
                        firstName=main_data["firstName"],
                        lastName=main_data["lastName"],
                        role=main_data["role"],
                        location=location,
                        site=site,
                    )
                    .exists()
                ):
                    raise AlreadyExists("Staff Already exists")
                staffObj.firstName = main_data["firstName"]
                staffObj.lastName = main_data["lastName"]
                staffObj.emailId = main_data["emailId"]
                staffObj.mobileNo = main_data["mobileNo"]
                staffObj.qualification = main_data["qualification"]
                staffObj.role = main_data["role"]
                staffObj.location = location
                staffObj.site = site
                staffObj.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except AlreadyExists as e:
            return Response(
                {"errorMsg": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Please try again later!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
