# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
from transportation.functions import validate_email

# model imports
from master.models import Location, Site
from transportation.models import CreditorMaster
from account.permissions import HasAllowedRoles

class AddCreditorMaster(views.APIView):

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
                converted_data["name"],
                converted_data["category"],
                converted_data["location"],
                converted_data["site"],
            ]
            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if CreditorMaster.objects.filter(
                name=converted_data["name"],
                category=converted_data["category"],
                location__name=converted_data["location"],
                site__name=converted_data["site"],
            ).exists():
                return {"errorMsg": "Creditor Already exists"}
            
            if converted_data["email_id"] and not validate_email(
                converted_data["email_id"]
            ):
                return {"errorMsg": "Email is not valid"}

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
            category = data["category"]
            address = data["address"]
            state = data["state"]
            state_code = data["state_code"]
            gstin = data["gstin"]
            pan_no = data["pan_no"]
            contact_no = data["contact_no"]
            email_id = data["email_id"]
            remarks = data["remarks"]
            tds = data["tds"]
            location_object = Location.objects.get(name=data["location"])
            site_object = Site.objects.get(name=data["site"])

            creditor_entry = CreditorMaster.create(
                name=name,
                category=category,
                address=address,
                state=state,
                state_code=state_code,
                gstin=gstin,
                pan_no=pan_no,
                contact_no=contact_no,
                email_id=email_id,
                remarks=remarks,
                tds=tds,
                location=location_object,
                site=site_object,
            )
            creditor_entry.save()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllCreditorMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            name = data["name"]
            category = data["category"]
            filtered_data = None

            if location == "ALL":
                filtered_data = CreditorMaster.objects.select_related(
                    "location", "site"
                )
            elif site == "ALL":
                filtered_data = CreditorMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = CreditorMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if len(category) != 0:
                filtered_data = filtered_data.filter(category=category)

            if len(name) != 0:
                filtered_data = filtered_data.filter(name=name)

            response_data = [each.get_creditor() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditCreditorMaster(views.APIView):

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
                converted_data["name"],
                converted_data["category"],
                converted_data["location"],
                converted_data["site"],
            ]
            creditor_object = CreditorMaster.objects.get(pk=converted_data["pk"])

            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if (
                (
                    creditor_object.name != converted_data["name"]
                    or creditor_object.category != converted_data["category"]
                    or creditor_object.location.name != converted_data["location"]
                    or creditor_object.site.name != converted_data["site"]
                )
            ) and CreditorMaster.objects.filter(
                name=converted_data["name"],
                category=converted_data["category"],
                location__name=converted_data["location"],
                site__name=converted_data["site"],
            ).exists():
                return {"errorMsg": "Creditor Already exists"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            creditor_object = CreditorMaster.objects.get(pk=pk)
            data = creditor_object.get_creditor()
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
            category = data["category"]
            address = data["address"]
            state = data["state"]
            state_code = data["state_code"]
            gstin = data["gstin"]
            pan_no = data["pan_no"]
            contact_no = data["contact_no"]
            email_id = data["email_id"]
            remarks = data["remarks"]
            tds = data["tds"]
            location_object = Location.objects.get(name=data["location"])
            site_object = Site.objects.get(name=data["site"])
            creditor_object = CreditorMaster.objects.get(pk=pk)

            creditor_object.name = name
            creditor_object.category = category
            creditor_object.address = address
            creditor_object.state = state
            creditor_object.state_code = state_code
            creditor_object.gstin = gstin
            creditor_object.pan_no = pan_no
            creditor_object.contact_no = contact_no
            creditor_object.email_id = email_id
            creditor_object.remarks = remarks
            creditor_object.tds = tds
            creditor_object.location = location_object
            creditor_object.site = site_object
            creditor_object.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteCreditorMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            for pk in data:
                creditor_object = CreditorMaster.objects.get(pk=pk)
                dependent_list = [
                    creditor_object.driver_info_transporter_rel.exists(),
                    creditor_object.truck_transporter_rel.exists(),
                    creditor_object.booking_transporter_rel.exists(),
                    creditor_object.booking_fuel_pump_rel.exists(),
                    creditor_object.purchase_master_transporter_rel.exists(),
                    creditor_object.payment_receipt_creditor_rel.exists(),
                    creditor_object.transaction_logs_creditor_rel.exists(),
                ]
                if True not in dependent_list:
                    creditor_object.delete()
                else:
                    not_deleted.append(creditor_object.name)
            if not len(not_deleted) == 0:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=200,
                ) 
            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
