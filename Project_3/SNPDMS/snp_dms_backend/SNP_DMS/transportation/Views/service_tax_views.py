# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging

# model imports
from master.models import Location, Site
from transportation.models import ServiceTaxMaster
from account.permissions import HasAllowedRoles

class AddServiceTax(views.APIView):

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
                converted_data["description"],
                converted_data["sac_code"],
                converted_data["under_rcm"],
                converted_data["total_tax"],
                converted_data["cgst"],
                converted_data["sgst"],
                converted_data["igst"],
                converted_data["location"],
                converted_data["site"],
            ]
            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if ServiceTaxMaster.objects.filter(
                description=converted_data["description"],
                location__name=converted_data["location"],
                site__name=converted_data["site"],
            ).exists():
                return {"errorMsg": "Tax Entry Already exists"}

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

            description = data["description"]
            sac_code = data["sac_code"]
            under_rcm = data["under_rcm"]
            total_tax = data["total_tax"]
            cgst = data["cgst"]
            sgst = data["sgst"]
            igst = data["igst"]
            location_object = Location.objects.get(name=data["location"])
            site_object = Site.objects.get(name=data["site"])

            tax_entry = ServiceTaxMaster.create(
                description=description,
                under_rcm=under_rcm,
                sac_code=sac_code,
                total_tax=total_tax,
                cgst=cgst,
                sgst=sgst,
                igst=igst,
                location=location_object,
                site=site_object,
            )
            tax_entry.save()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllServiceTax(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            description = data["description"]

            if location == "ALL":
                filtered_data = ServiceTaxMaster.objects.select_related(
                    "location", "site"
                )
            elif site == "ALL":
                filtered_data = ServiceTaxMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = ServiceTaxMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if len(description) != 0:
                filtered_data = filtered_data.filter(description__icontains=description)

            response_data = [each.get_tax() for each in filtered_data]
            return Response({"data": response_data}, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditServiceTax(views.APIView):

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
                converted_data["description"],
                converted_data["sac_code"],
                converted_data["under_rcm"],
                converted_data["total_tax"],
                converted_data["cgst"],
                converted_data["sgst"],
                converted_data["igst"],
                converted_data["location"],
                converted_data["site"],
            ]
            tax_obj = ServiceTaxMaster.objects.get(pk=converted_data["pk"])

            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if (
                tax_obj.description != converted_data["description"]
                and ServiceTaxMaster.objects.filter(
                    description=converted_data["description"],
                    location__name=converted_data["location"],
                    site__name=converted_data["site"],
                ).exists()
            ):
                return {"errorMsg": "Tax Entry Already exists"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            tax_obj = ServiceTaxMaster.objects.get(pk=pk)
            data = tax_obj.get_tax()
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

            description = data["description"]
            sac_code = data["sac_code"]
            under_rcm = data["under_rcm"]
            total_tax = data["total_tax"]
            cgst = data["cgst"]
            sgst = data["sgst"]
            igst = data["igst"]
            location_object = Location.objects.get(name=data["location"])
            site_object = Site.objects.get(name=data["site"])

            tax_obj = ServiceTaxMaster.objects.get(pk=pk)
            tax_obj.description = description
            tax_obj.sac_code = sac_code
            tax_obj.under_rcm = under_rcm
            tax_obj.total_tax = total_tax
            tax_obj.cgst = cgst
            tax_obj.sgst = sgst
            tax_obj.igst = igst
            tax_obj.location = location_object
            tax_obj.site = site_object
            tax_obj.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteServiceTax(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            for pk in data:
                tax_obj = ServiceTaxMaster.objects.get(pk=pk)
                dependent_list = [
                    tax_obj.booking_bill_line_service_tax_master_rel.exists(),
                ]
                if True not in dependent_list:
                    tax_obj.delete()
                else:
                    not_deleted.append(tax_obj.description)
            if not len(not_deleted) == 0:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=200,
                )  
            return Response({"successMsg": "Data Deleted"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
