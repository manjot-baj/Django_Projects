# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging

# model imports
from master.models import Location, Site
from transportation.models import DriverMaster, CreditorMaster
from account.permissions import HasAllowedRoles

class AddDriverMaster(views.APIView):

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
                converted_data["name"],
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

            name = data["name"]
            mobile_no = data["mobile_no"]
            pan_no = data["pan_no"]
            license_no = data["license_no"]
            transporter = data["transporter"]
            transporter_obj = CreditorMaster.objects.get(
                name=transporter,
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            )
            driver_entry = DriverMaster.create(
                name=name,
                mobile_no=mobile_no,
                pan_no=pan_no,
                license_no=license_no,
                transporter_obj=transporter_obj,
            )
            driver_entry.save()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllDriverMaster(views.APIView):
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
            name = data["name"]
            filtered_data = None

            if location == "ALL":
                filtered_data = DriverMaster.objects.select_related(
                    "transporter", "transporter__location", "transporter__site"
                )
            elif site == "ALL":
                filtered_data = DriverMaster.objects.select_related(
                    "transporter", "transporter__location", "transporter__site"
                ).filter(transporter__location__name=location)
            else:
                filtered_data = DriverMaster.objects.select_related(
                    "transporter", "transporter__location", "transporter__site"
                ).filter(
                    transporter__location__name=location, transporter__site__name=site
                )

            if len(transporter) != 0:
                filtered_data = filtered_data.filter(transporter__name=transporter)

            if len(name) != 0:
                filtered_data = filtered_data.filter(name=name)

            response_data = [each.get_driver() for each in filtered_data]
            return Response({"data": response_data}, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditDriverMaster(views.APIView):

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
                converted_data["name"],
                converted_data["location"],
                converted_data["site"],
            ]
            driver_obj = DriverMaster.objects.get(pk=converted_data["pk"])

            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if (
                driver_obj.transporter.name != converted_data["transporter"]
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
            driver_obj = DriverMaster.objects.get(pk=pk)
            data = driver_obj.get_driver()
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

            name = data["name"]
            mobile_no = data["mobile_no"]
            pan_no = data["pan_no"]
            license_no = data["license_no"]
            transporter = data["transporter"]
            transporter_obj = CreditorMaster.objects.get(
                name=transporter,
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            )

            driver_obj = DriverMaster.objects.get(pk=pk)
            driver_obj.name = name
            driver_obj.mobile_no = mobile_no
            driver_obj.pan_no = pan_no
            driver_obj.license_no = license_no
            driver_obj.transporter = transporter_obj
            driver_obj.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteDriverMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            for pk in data:
                driver_obj = DriverMaster.objects.get(pk=pk)
                dependent_list = [
                    driver_obj.booking_driver_rel.exists(),
                ]
                if True not in dependent_list:
                    driver_obj.delete()
                else:
                    not_deleted.append(driver_obj.name)
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
