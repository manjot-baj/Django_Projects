# rest framework
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

# django
from django.core.cache import cache
from common.functions import cache_api_view
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# serializer
from master.Serializers.client_serializer import ClientSerializer

# models
from master.models import Location, Site
from master.models_two import Client, LineHandlingCharges, HandlingChargesHistory

# error handling
from common.exceptions import ValidationError, ResourceNotFound
from common.error_logging import ErrorLogging

# services
from master.services.client_service import ClientService

from account.permissions import HasAllowedRoles
from rest_framework import viewsets
from django.db import transaction


class AddClient(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    clientService = ClientService()

    def getParams(self, payload):
        return {
            "name": payload["name"],
            "code": payload["code"],
            "alias_name_one": payload["alias_name_one"],
            "alias_name_two": payload["alias_name_two"],
            "contact_person": payload["contact_person"],
            "type": payload["type"],
            "office_address": payload["office_address"],
            "city": payload["city"],
            "state": payload["state"],
            "zip": payload["zip"],
            "office_phone_no": payload["office_phone_no"],
            "mobile_no": payload["mobile_no"],
            "email_id": payload["email_id"],
            "website": payload["website"],
            "fax": payload["fax"],
            "business_description": payload["business_description"],
            "notes": payload["notes"],
            "location": payload["location"],
            "site": payload["site"],
            "cst_no": payload["cst_no"],
            "service_tax_no": payload["service_tax_no"],
            "bank_name": payload["bank_name"],
            "account_name": payload["account_name"],
            "vat_no": payload["vat_no"],
            "ecc_no": payload["ecc_no"],
            "bank_branch": payload["bank_branch"],
            "account_no": payload["account_no"],
            "gst_no": payload["gst_no"],
            "pan_no": payload["pan_no"],
            "ifsc_code": payload["ifsc_code"],
            "swift_code": payload["swift_code"],
            "edi_service": payload["edi_service"],
            "ref_code": payload["ref_code"].upper() if payload["ref_code"] else "",
            "operator_code": payload["operator_code"],
            "current_location_code": payload["current_location_code"],
            "location_code": payload["location_code"],
            "edi_code": payload["edi_code"],
            "edi_to_email_id": payload["edi_to_email_id"],
            "edi_cc_email_id": payload["edi_cc_email_id"],
            "reported_by_from": payload["reported_by_from"],
            "reported_by_to": payload["reported_by_to"],
            "sales_term": payload["sales_term"],
            "is_sez": payload["is_sez"],
        }

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            client_data = data["client_data"]

            shipping_line = client_data.pop("shipping_line")
            params = self.getParams(client_data)

            serializer = ClientSerializer(instance=None, data=client_data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            self.clientService.addClientData(
                params, shipping_line, data["client_representative_data"]
            )

            return Response(
                {"successMsg": "Data Saved"}, status=status.HTTP_201_CREATED
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


class GetClient(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    clientService = ClientService()

    def get(self, request, pk, *args, **kwargs):
        try:
            data = self.clientService.clientData(pk)
            return Response(
                data,
                status=status.HTTP_200_OK,
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


class UpdateClient(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    clientService = ClientService()

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            client_data = data["client_data"]
            client_obj = Client.objects.getClientById(pk=pk)
            serializer = ClientSerializer(
                instance=client_obj, data=client_data, context={"request": request}
            )
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)
            client_representative_data = data["client_representative_data"]

            self.clientService.updateClient(
                client_obj, client_data, client_representative_data
            )

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


# class ClientMaster(APIView):
#
#     permission_classes = (IsAuthenticated,)
#
#     def get_data(self, client_data):
#         location = Location.objects.get(name=client_data["location"])
#         site = Site.objects.get(name=client_data["site"])
#         return location, site
#
#     def create_representative_data(self, each, obj):
#         return ClientRepresentative.objects.create(
#             client=obj,
#             name=each["name"],
#             designation=each["designation"],
#             email_id=each["email_id"],
#             mobile_no=each["mobile_no"],
#             phone_no=each["phone_no"],
#         )
#
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             client_data = data["client_data"]
#             shipping_line = client_data.pop("shipping_line")
#
#             serializer = ClientSerializer(instance=None, data=client_data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#
#             location, site = self.get_data(client_data)
#             obj = Client.create_obj(client_data, location, site)
#             if not obj.ref_code is None:
#                 obj.ref_code = obj.ref_code.upper()
#                 obj.save()
#             obj.create_client_code()
#
#             if shipping_line:
#                 ClientAbbreviation.objects.get_or_create(client=obj, name=shipping_line)
#
#             client_representative_data = data["client_representative_data"]
#
#             if client_representative_data:
#                 for each in client_representative_data:
#                     self.create_representative_data(each, obj=obj)
#
#             return Response({"successMsg": "Data Saved"}, status=200)
#
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
#
#     def get(self, request, pk, *args, **kwargs):
#         try:
#             client_obj = Client.objects.get(pk=pk)
#             client = client_obj.get_client()
#             representative_obj = ClientRepresentative.objects.filter(client=client_obj)
#             try:
#                 client["shipping_line"] = (
#                     ClientAbbreviation.objects.filter(client=client_obj)
#                     .first()
#                     .get_abbreviation_name()
#                 )
#             except:
#                 client["shipping_line"] = ""
#
#             return Response(
#                 {
#                     "client_data": client,
#                     "client_representative_data": ClientRepresentativeSerializer(
#                         representative_obj, many=True
#                     ).data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)
#
#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             client_data = data["client_data"]
#             client_obj = Client.objects.get(pk=pk)
#             serializer = ClientSerializer(
#                 instance=client_obj, data=client_data, context={"request": request}
#             )
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=200)
#             location, site = self.get_data(client_data)
#
#             client_obj.name = client_data["name"]
#             client_obj.code = client_data["code"]
#             client_obj.alias_name_one = client_data["alias_name_one"]
#             client_obj.alias_name_two = client_data["alias_name_two"]
#             client_obj.type = client_data["type"]
#             client_obj.office_address = client_data["office_address"]
#             client_obj.city = client_data["city"]
#             client_obj.zip = client_data["zip"]
#             client_obj.office_phone_no = client_data["office_phone_no"]
#             client_obj.mobile_no = client_data["mobile_no"]
#             client_obj.email_id = client_data["email_id"]
#             client_obj.website = client_data["website"]
#             client_obj.fax = client_data["fax"]
#             client_obj.business_description = client_data["business_description"]
#             client_obj.notes = client_data["notes"]
#             client_obj.cst_no = client_data["cst_no"]
#             client_obj.service_tax_no = client_data["service_tax_no"]
#             client_obj.bank_name = client_data["bank_name"]
#             client_obj.account_name = client_data["account_name"]
#             client_obj.vat_no = client_data["vat_no"]
#             client_obj.ecc_no = client_data["ecc_no"]
#             client_obj.bank_branch = client_data["bank_branch"]
#             client_obj.account_no = client_data["account_no"]
#             client_obj.gst_no = client_data["gst_no"]
#             client_obj.pan_no = client_data["pan_no"]
#             client_obj.ifsc_code = client_data["ifsc_code"]
#             client_obj.swift_code = client_data["swift_code"]
#             client_obj.edi_service = client_data["edi_service"]
#             client_obj.ref_code = client_data["ref_code"]
#             client_obj.operator_code = client_data["operator_code"]
#             client_obj.current_location_code = client_data["current_location_code"]
#             client_obj.location_code = client_data["location_code"]
#             client_obj.edi_code = client_data["edi_code"]
#             client_obj.edi_to_email_id = client_data["edi_to_email_id"]
#             client_obj.edi_cc_email_id = client_data["edi_cc_email_id"]
#             client_obj.reported_by_from = client_data["reported_by_from"]
#             client_obj.reported_by_to = client_data["reported_by_to"]
#             client_obj.contact_person = client_data["contact_person"]
#             client_obj.sales_term = client_data["sales_term"]
#             client_obj.location = location
#             client_obj.site = site
#             client_obj.save()
#
#             if client_data["shipping_line"]:
#                 ClientAbbreviation.objects.filter(client=client_obj).update(
#                     name=client_data["shipping_line"]
#                 )
#
#             if client_obj.ref_code:
#                 client_obj.ref_code = client_obj.ref_code.upper()
#                 client_obj.save()
#
#             if data["client_representative_data"]:
#                 for each in data["client_representative_data"]:
#                     if "pk" in each:
#                         representative_obj = ClientRepresentative.objects.get(
#                             pk=each["pk"]
#                         )
#                         representative_obj.client = client_obj
#                         representative_obj.name = each["name"]
#                         representative_obj.designation = each["designation"]
#                         representative_obj.email_id = each["email_id"]
#                         representative_obj.mobile_no = each["mobile_no"]
#                         representative_obj.phone_no = each["phone_no"]
#                         representative_obj.save()
#                     else:
#                         self.create_representative_data(each, obj=client_obj)
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteClient(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            not_deleted = []
            client_qs = Client.objects.filter(pk__in=data)
            for client in client_qs:
                if any(
                    [
                        client.customer_bill_client_rel.exists(),
                        client.customer_bill_customer_rel.exists(),
                        client.client_customer_bill_invoice_rel.exists(),
                        client.client_parent_child_company_rel.exists(),
                        client.container_client_rel.exists(),
                        client.non_depot_container_client_rel.exists(),
                        client.adv_handling_payment_client_rel.exists(),
                        client.pre_gatein_client_rel.exists(),
                        hasattr(client, "fin_account_customer"),
                        client.handling_client_rel.exists(),
                        client.self_transportation_client_rel.exists(),
                        client.client_representative_rel.exists(),
                        client.client_document_rel.exists(),
                        client.client_handling_charge_rel.exists(),
                        client.client_transportation_charge_rel.exists(),
                    ]
                ):
                    not_deleted.append(client.name)
                else:
                    client.delete()

            if not_deleted:
                raise ValidationError(
                    f"Can't Delete {not_deleted}, data have dependencies"
                )
            return Response({"successMsg": "Data Deleted"}, status=status.HTTP_200_OK)
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


class ListClients(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    clientService = ClientService()

    def getParams(self, payload):
        params = {"location__name": payload["location"], "site__name": payload["site"]}
        if payload["client_name"]:
            params["name"] = payload["client_name"]
        if payload["type"]:
            params["type"] = payload["type"]
        if payload["ref_code"]:
            params["ref_code"] = payload["ref_code"]

        return params

    @cache_api_view("client", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            params = self.getParams(request.data)

            data = self.clientService.listOfClients(params, on_page_data, pg_no)

            return Response(
                data,
                status=status.HTTP_200_OK,
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


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender in [Client]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_client_{location}_{site}_movement")
        cache.delete(f"request_body_client_{location}_{site}_movement")


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [Client]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_client_{location}_{site}_movement")
        cache.delete(f"request_body_client_{location}_{site}_movement")


class AddLineHandlingCharges(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def getParams(self, payload):
        location = Location.objects.filter(name=payload.get("location")).first()
        site = Site.objects.filter(name=payload.get("site"), location=location).first()
        return {
            "ref_code": payload.get("ref_code").upper(),
            "size_20_rate": float(payload.get("size_20_rate")),
            "size_40_rate": float(payload.get("size_40_rate")),
            "night_charge_size_20_rate": float(
                payload.get("night_charge_size_20_rate")
            ),
            "night_charge_size_40_rate": float(
                payload.get("night_charge_size_40_rate")
            ),
            "location": location,
            "site": site,
        }

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                params = self.getParams(data)

                if LineHandlingCharges.objects.filter(
                    ref_code=params["ref_code"],
                    location=params["location"],
                    site=params["site"],
                ).exists():
                    raise ValidationError(f"Data Already Exists!")

                LineHandlingCharges.create(params)

                return Response(
                    {"successMsg": "Data Saved"},
                    status=status.HTTP_201_CREATED,
                )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateLineHandlingCharges(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def put(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                obj = LineHandlingCharges.objects.get(pk=pk)
                payload = request.data
                obj.size_20_rate = float(payload.get("size_20_rate"))
                obj.size_40_rate = float(payload.get("size_40_rate"))
                obj.night_charge_size_20_rate = float(
                    payload.get("night_charge_size_20_rate")
                )
                obj.night_charge_size_40_rate = float(
                    payload.get("night_charge_size_40_rate")
                )
                obj.save()

                return Response(
                    {"successMsg": "Data Updated"},
                    status=status.HTTP_200_OK,
                )
        except LineHandlingCharges.DoesNotExist:
            return Response(
                {"errorMsg": "Record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetLineHandlingCharges(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            payload = request.data
            location = Location.objects.filter(name=payload.get("location")).first()
            site = Site.objects.filter(
                name=payload.get("site"), location=location
            ).first()
            queryset = LineHandlingCharges.objects.filter(
                location=location, site=site
            ).order_by("-id")
            data = [qs.get_data() for qs in queryset]
            return Response(data, status=status.HTTP_200_OK)
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteLineHandlingCharges(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                obj = LineHandlingCharges.objects.get(pk=pk)
                obj.delete()
                return Response(
                    {"successMsg": "Data Deleted"},
                    status=status.HTTP_200_OK,
                )
        except LineHandlingCharges.DoesNotExist:
            return Response(
                {"errorMsg": "Record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetLineHandlingChargesById(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            obj = LineHandlingCharges.objects.get(pk=pk)
            return Response(obj.get_data(), status=status.HTTP_200_OK)
        except LineHandlingCharges.DoesNotExist:
            return Response(
                {"errorMsg": "Record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AddHandlingChargesHistory(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def getParams(self, payload):
        location = Location.objects.filter(name=payload.get("location")).first()
        site = Site.objects.filter(name=payload.get("site"), location=location).first()
        return {
            "ref_code": (
                payload.get("ref_code").upper()
                if payload.get("ref_code") is not None
                and payload.get("client_type") == "Line"
                else None
            ),
            "client_type": payload.get("client_type"),
            "size_20_rate": float(payload.get("size_20_rate")),
            "size_40_rate": float(payload.get("size_40_rate")),
            "night_charge_size_20_rate": float(
                payload.get("night_charge_size_20_rate")
            ),
            "night_charge_size_40_rate": float(
                payload.get("night_charge_size_40_rate")
            ),
            "location": location,
            "site": site,
        }

    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                data = request.data
                params = self.getParams(data)

                if params["client_type"] == "Line":
                    if HandlingChargesHistory.objects.filter(
                        ref_code=params["ref_code"],
                        client_type="Line",
                        location=params["location"],
                        site=params["site"],
                    ).exists():
                        raise ValidationError(f"Data Already Exists!")
                else:
                    if HandlingChargesHistory.objects.filter(
                        ref_code=None,
                        client_type="Party",
                        location=params["location"],
                        site=params["site"],
                    ).exists():
                        raise ValidationError(f"Data Already Exists!")

                HandlingChargesHistory.create(params)

                return Response(
                    {"successMsg": "Data Saved"},
                    status=status.HTTP_201_CREATED,
                )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateHandlingChargesHistory(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def put(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                obj = HandlingChargesHistory.objects.get(pk=pk)
                payload = request.data
                obj.size_20_rate = float(payload.get("size_20_rate"))
                obj.size_40_rate = float(payload.get("size_40_rate"))
                obj.night_charge_size_20_rate = float(
                    payload.get("night_charge_size_20_rate")
                )
                obj.night_charge_size_40_rate = float(
                    payload.get("night_charge_size_40_rate")
                )
                obj.save()

                return Response(
                    {"successMsg": "Data Updated"},
                    status=status.HTTP_200_OK,
                )
        except HandlingChargesHistory.DoesNotExist:
            return Response(
                {"errorMsg": "Record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {"errorMsg": str(e.message)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetHandlingChargesHistory(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            payload = request.data
            location = Location.objects.filter(name=payload.get("location")).first()
            site = Site.objects.filter(
                name=payload.get("site"), location=location
            ).first()
            queryset = HandlingChargesHistory.objects.filter(
                location=location, site=site
            ).order_by("-id")
            data = [qs.get_data() for qs in queryset]
            return Response(data, status=status.HTTP_200_OK)
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteHandlingChargesHistory(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                obj = HandlingChargesHistory.objects.get(pk=pk)
                obj.delete()
                return Response(
                    {"successMsg": "Data Deleted"},
                    status=status.HTTP_200_OK,
                )
        except HandlingChargesHistory.DoesNotExist:
            return Response(
                {"errorMsg": "Record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetHandlingChargesHistoryById(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            obj = HandlingChargesHistory.objects.get(pk=pk)
            return Response(obj.get_data(), status=status.HTTP_200_OK)
        except HandlingChargesHistory.DoesNotExist:
            return Response(
                {"errorMsg": "Record not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
