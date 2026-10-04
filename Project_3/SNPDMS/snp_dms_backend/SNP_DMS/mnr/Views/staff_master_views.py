from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from ..models import MnrStaff
from master.functions import none_data_converter
import logging, traceback
from django.db import transaction

from account.permissions import HasAllowedRoles


class GetAllMnrStaff(views.APIView):
    """
    The Get Function will get all the mnr staff according to filter.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            queryset = MnrStaff.objects.all()
            if not len(data["location"]) == 0:
                queryset = queryset.filter(location__name=data["location"])
            if not len(data["site"]) == 0:
                queryset = queryset.filter(site__name=data["site"])
            if not len(data["role"]) == 0:
                queryset = queryset.filter(role=data["role"])
            response_data = [each.get_staff() for each in queryset.iterator()]
            return Response(response_data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class DeleteMnrStaff(views.APIView):
    """
    The Get Function will delete a entry of mnr staff
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            with transaction.atomic():
                for pk in data:
                    mnr_staff = MnrStaff.objects.get(pk=pk)
                    dependent_list = [
                        mnr_staff.survey_by_staff_rel.exists(),
                        mnr_staff.estimate_by_staff_rel.exists(),
                        mnr_staff.repair_man_power_staff_rel.exists(),
                    ]
                    if not any(dependent_list):
                        mnr_staff.delete()
                    else:
                        not_deleted.append(mnr_staff.firstName)
            if not_deleted:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=200,
                )
            return Response({"successMsg": "Data Deleted"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class AddMnrStaff(views.APIView):
    """
    The Post Function will create a new Mnr Staff.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
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
                    return Response({"errorMsg": "Staff already exists"}, status=200)
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
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class EditMnrStaff(views.APIView):
    """
    The Get Function will get a entry of Mnr staff.
    The Put Function will update a existing Mnr staff.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            staff_object = MnrStaff.objects.get(pk=pk)
            data = staff_object.get_staff()
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
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
                    return Response({"errorMsg": "Staff Already exists"}, status=200)
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
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
