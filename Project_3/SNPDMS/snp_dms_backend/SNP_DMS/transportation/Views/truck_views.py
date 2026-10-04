# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging

# model imports
from master.models import Location, Site
from transportation.models import TruckMaster, CreditorMaster

from account.permissions import HasAllowedRoles
class AddTruckMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["transporter"],
                converted_data["truck_no"],
                converted_data["location"],
                converted_data["site"],
            ]
            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if not CreditorMaster.objects.filter(
                name=converted_data["transporter"],
                category="Transporter",
                location__name=converted_data["location"],
                site__name=converted_data["site"],
            ).exists():
                return {"errorMsg": "Transporter does not exists"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = self.validate_data(request.data)
            if "errorMsg" in data.keys():
                return Response(data, status=200)

            truck_no = data["truck_no"]
            transporter = data["transporter"]
            transporter_obj = CreditorMaster.objects.get(
                name=transporter,
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            )
            truck_entry = TruckMaster.create(
                truck_no=truck_no, transporter=transporter_obj
            )
            truck_entry.save()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllTruckMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            transporter = data["transporter"]
            truck_no = data["truck_no"]
            filtered_data = None

            if location == "ALL":
                filtered_data = TruckMaster.objects.select_related(
                    "transporter", "transporter__location", "transporter__site"
                )
            elif site == "ALL":
                filtered_data = TruckMaster.objects.select_related(
                    "transporter", "transporter__location", "transporter__site"
                ).filter(transporter__location__name=location)
            else:
                filtered_data = TruckMaster.objects.select_related(
                    "transporter", "transporter__location", "transporter__site"
                ).filter(
                    transporter__location__name=location, transporter__site__name=site
                )

            if len(transporter) != 0:
                filtered_data = filtered_data.filter(transporter__name=transporter)

            if len(truck_no) != 0:
                filtered_data = filtered_data.filter(truck_no=truck_no)

            response_data = [each.get_truck_details() for each in filtered_data]
            return Response({"data": response_data}, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditTruckMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["transporter"],
                converted_data["truck_no"],
                converted_data["location"],
                converted_data["site"],
            ]
            truck_obj = TruckMaster.objects.get(pk=converted_data["pk"])

            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if (
                truck_obj.transporter.name != converted_data["transporter"]
                and not CreditorMaster.objects.filter(
                    name=converted_data["transporter"],
                    category="Transporter",
                    location__name=converted_data["location"],
                    site__name=converted_data["site"],
                ).exists()
            ):
                return {"errorMsg": "Transporter does not exists"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            truck_obj = TruckMaster.objects.get(pk=pk)
            data = truck_obj.get_truck_details()
            return Response(data, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = self.validate_data(request.data)
            if "errorMsg" in data.keys():
                return Response(data, status=200)

            truck_no = data["truck_no"]
            transporter = data["transporter"]
            transporter_obj = CreditorMaster.objects.get(
                name=transporter,
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            )

            truck_obj = TruckMaster.objects.get(pk=pk)
            truck_obj.truck_no = truck_no
            truck_obj.transporter = transporter_obj
            truck_obj.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteTruckMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            for pk in data:
                truck_obj = TruckMaster.objects.get(pk=pk)
                dependent_list = [
                    truck_obj.booking_truck_rel.exists(),
                ]
                if True not in dependent_list:
                    truck_obj.delete()
                else:
                    not_deleted.append(truck_obj.truck_no)
            if not len(not_deleted) == 0:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=200,
                )  
            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
