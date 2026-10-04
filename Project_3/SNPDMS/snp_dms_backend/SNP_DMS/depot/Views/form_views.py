from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from account.models import AccountUser, Role
from master.models import (
    CarrierCode,
    ContainerType,
    ContainerSize,
    Location,
    Transporter,
    Site,
    RefCodeMaster,
    Country,
    VesselBkgNo,
)
from master.models_two import (
    Client,
    ClientAbbreviation,
    HandlingCharge,
    TransportationCharge,
    GroundRent,
)
from billing_invoice.models import CustomerBill
from depot.lolo_finance_models import PreGateIn, PreGateOut

from ..functions_two import *
from ..models import *
from non_depot.models import NonDepotContainer
from django.db.models import Q
import logging, traceback
from django.core.cache import cache
from common.functions import cache_api_view
from django.db.models import F
from account.permissions import HasAllowedRoles

class ContainerNoValidator(views.APIView):
    """
    Api to see whether the container provided is Valid or Not Valid,
    the post function will validate the container no
    by passing through the validation algorithm function
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User","Loaded Yard"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            container_no = request.data["container_no"]
            location = request.data["location"]
            if len(container_no) == 0:
                return Response({"errorMsg": "Please Enter Container_no"}, status=200)
            if not len(container_no) == 11:
                return Response(
                    {
                        "errorMsg": "Invalid Entry, "
                        "Please Enter Container_no having first 4 uppercase alphabets and "
                        "rest 7 digits"
                    },
                    status=200,
                )
            if check_char_digit(container_no) is False:
                return Response(
                    {
                        "errorMsg": "Invalid Entry, "
                        "Please Enter Container_no having first 4 uppercase alphabets and "
                        "rest 7 digits"
                    },
                    status=200,
                )
            validation = check_digit(container_no=container_no)
            if validation is True:
                if Container.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    return Response(
                        {"errorMsg": "Container_no Valid but already exist."},
                        status=200,
                    )
                else:
                    return Response({"successMsg": "Container_no Valid"}, status=200)
            else:
                if Container.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    return Response(
                        {"errorMsg": "Container_no Not Valid but already exist."},
                        status=200,
                    )
                else:
                    return Response({"errorMsg": "Container_no Not Valid"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {str(e)} ]"}, status=200)


class InformClientDependency(views.APIView):
    """the Post function will give all client dependent data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            main_data = {}
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            try:
                client_data = []
                for client in Client.objects.filter(location=location, site=site):
                    client_data_object = {
                        "name": client.get_client_name(),
                        "ref_code": client.get_client()["ref_code"],
                    }
                    try:
                        client_data_object["shipping_line"] = [
                            {
                                "name": (
                                    ClientAbbreviation.objects.filter(client=client)
                                    .first()
                                    .get_abbreviation_name()
                                )
                            }
                        ]
                    except:
                        client_data_object["shipping_line"] = ""
                    client_data.append(client_data_object)
                client_data.append({"name": "", "ref_code": "", "shipping_line": []})
                main_data["client_data"] = client_data
            except:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                client_data = ""
                main_data["client_data"] = client_data
            return Response(main_data, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class InformDependency(views.APIView):
#     """the Post function will give all form dependent data"""

#     permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             main_data = {}
#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = request.data["location"]
#                 site_str = request.data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             # ************ Depot Users **************
#             try:
#                 main_data["depot_user_data"] = [
#                     each.username
#                     for each in AccountUser.objects.select_related(
#                         "location", "site"
#                     ).filter(role__name="Depot User", location=location, site=site)
#                 ]
#             except:
#                 depot_user_data = []
#                 main_data["depot_user_data"] = depot_user_data

#             # ********** client_data ***********
#             client_query = []

#             if (
#                 Client.objects.select_related("location", "site")
#                 .filter(location=location, site=site)
#                 .exists()
#             ):
#                 client_query = Client.objects.select_related("location", "site").filter(
#                     location=location, site=site
#                 )

#             try:
#                 client_data = []
#                 for client in client_query:
#                     client_data_object = {
#                         "name": client.get_client_name(),
#                         "ref_code": client.get_client()["ref_code"],
#                     }
#                     try:
#                         client_data_object["shipping_line"] = [
#                             {
#                                 "name": (
#                                     ClientAbbreviation.objects.select_related("client")
#                                     .filter(client=client)
#                                     .first()
#                                     .get_abbreviation_name()
#                                 )
#                             }
#                         ]
#                     except:
#                         client_data_object["shipping_line"] = ""
#                     client_data.append(client_data_object)
#                 client_data.append({"name": "", "ref_code": "", "shipping_line": []})
#                 main_data["client_data"] = client_data
#             except:
#                 client_data = ""
#                 main_data["client_data"] = client_data

#             # ********** line_client_data ***********
#             try:
#                 line_client_data = []
#                 if type(client_query) is not list:
#                     for client in client_query.filter(type="Line"):
#                         line_client_data_object = {
#                             "name": client.get_client_name(),
#                             "ref_code": client.get_client()["ref_code"],
#                         }
#                         try:
#                             line_client_data_object["shipping_line"] = [
#                                 {
#                                     "name": (
#                                         ClientAbbreviation.objects.select_related(
#                                             "client"
#                                         )
#                                         .filter(client=client)
#                                         .first()
#                                         .get_abbreviation_name()
#                                     )
#                                 }
#                             ]
#                         except:
#                             line_client_data_object["shipping_line"] = ""
#                         line_client_data.append(line_client_data_object)
#                 line_client_data.append(
#                     {"name": "", "ref_code": "", "shipping_line": []}
#                 )
#                 main_data["line_client_data"] = line_client_data
#             except:
#                 line_client_data = ""
#                 main_data["line_client_data"] = line_client_data

#             # *********** party_client_data ***************
#             party_client_data = []
#             if type(client_query) is not list:
#                 party_client_data = [
#                     {"name": each.get_client_name()}
#                     for each in client_query.filter(type="Party")
#                 ]
#             main_data["party_client_data"] = party_client_data

#             # ********* size_data ************
#             try:
#                 size_data = [
#                     {"name": size.get_size()} for size in ContainerSize.objects.all()
#                 ]
#                 main_data["size_data"] = size_data
#             except:
#                 size_data = ""
#                 main_data["size_data"] = size_data

#             # ********* type_data ************
#             try:
#                 type_data = [
#                     {"name": type.get_type()} for type in ContainerType.objects.all()
#                 ]
#                 main_data["type_data"] = type_data
#             except:
#                 type_data = ""
#                 main_data["type_data"] = type_data

#             # ********* indian states ************
#             try:
#                 main_data["indian_states"] = [
#                     "Andhra Pradesh",
#                     "Arunachal Pradesh",
#                     "Assam",
#                     "Bihar",
#                     "Chhattisgarh",
#                     "Goa",
#                     "Gujarat",
#                     "Haryana",
#                     "Himachal Pradesh",
#                     "Jammu and Kashmir",
#                     "Jharkhand",
#                     "Karnataka",
#                     "Kerala",
#                     "Madhya Pradesh",
#                     "Maharashtra",
#                     "Manipur",
#                     "Meghalaya",
#                     "Mizoram",
#                     "Nagaland",
#                     "Odisha",
#                     "Punjab",
#                     "Rajasthan",
#                     "Sikkim",
#                     "Tamil Nadu",
#                     "Telangana",
#                     "Tripura",
#                     "Uttar Pradesh",
#                     "Uttarakhand",
#                     "West Bengal",
#                     "Andaman and Nicobar Islands",
#                     "Chandigarh",
#                     "Dadra and Nagar Haveli",
#                     "Daman and Diu",
#                     "Lakshadweep",
#                     "Delhi",
#                     "Puducherry",
#                 ]
#             except:
#                 main_data["indian_states"] = ""

#             # ********* export_cargo_type_data ************
#             try:
#                 export_cargo_type_data = [
#                     {"name": type.get_export_cargo_type()}
#                     for type in ExportCargoType.objects.all()
#                 ]
#                 main_data["export_cargo_type_data"] = export_cargo_type_data
#             except:
#                 export_cargo_type_data = ""
#                 main_data["export_cargo_type_data"] = export_cargo_type_data

#             # ********* lolo_amount ************
#             try:
#                 lolo_amount = [
#                     {"amount": charge.get_charge_detail()["amount"]}
#                     for charge in list(
#                         HandlingCharge.objects.select_related(
#                             "location", "site"
#                         ).filter(location=location, site=site)
#                     )
#                 ]
#                 main_data["lolo_amount"] = lolo_amount
#             except:
#                 lolo_amount = ""
#                 main_data["lolo_amount"] = lolo_amount

#             # ********* transportation_amount ************
#             try:
#                 transportation_amount = [
#                     {"amount": charge.get_charge_detail()["amount"]}
#                     for charge in list(
#                         TransportationCharge.objects.select_related(
#                             "location", "site"
#                         ).filter(location=location, site=site)
#                     )
#                 ]
#                 main_data["transportation_amount"] = transportation_amount
#             except:
#                 transportation_amount = ""
#                 main_data["transportation_amount"] = transportation_amount

#             # ********* transporter ************
#             try:
#                 transporter = [
#                     {"name": t.get_transporter()["name"]}
#                     for t in list(
#                         Transporter.objects.select_related("location", "site").filter(
#                             location=location, site=site
#                         )
#                     )
#                 ]
#                 main_data["transporter"] = transporter

#             except:
#                 transporter = ""
#                 main_data["transporter"] = transporter

#             # ********* carrier_code ************
#             try:
#                 carrier_code = [
#                     {"name": c.get_carrier_code()["code"]}
#                     for c in list(
#                         CarrierCode.objects.select_related("location", "site").filter(
#                             location=location, site=site
#                         )
#                     )
#                 ]
#                 main_data["carrier_code"] = carrier_code

#             except:
#                 carrier_code = ""
#                 main_data["carrier_code"] = carrier_code

#             # ********* damage_code_n_condition ************
#             damage_code_n_condition = [
#                 "OK",
#                 "CLEANING",
#                 "LD",
#                 "MD",
#                 "HD",
#                 "AV",
#                 "DM",
#                 "AR",
#             ]
#             main_data["damage_code_n_condition"] = damage_code_n_condition

#             # ********* grade ************
#             grade_code = ["A", "B+", "B", "C+", "C", "D"]
#             main_data["grade"] = grade_code

#             # ********* arrived ************
#             arrived = ["Factory", "Road/Rail", "By Rail", "CFS/ICD", "Port/Vessel"]
#             main_data["arrived"] = arrived

#             # ********* origin ************
#             origin = ["Factory", "Intercity", "CFS/ICD", "Port/Vessel"]
#             main_data["origin"] = origin

#             # ********* lolo_type ************
#             lolo_type = ["Lift ON / Lift OFF", "ON", "OFF"]
#             main_data["lolo_type"] = lolo_type

#             # ********* payment_type ************
#             payment_type = [
#                 "None",
#                 "Cash",
#                 "Cheque",
#                 "NEFT",
#                 "RTGS",
#                 "Outstanding",
#                 "Credit",
#             ]
#             main_data["payment_type"] = payment_type

#             # ********* gst_type ************
#             gst_type = [
#                 {"gst_percent": "0%", "gst_value": 0},
#                 {"gst_percent": "5%", "gst_value": 0.05},
#                 {"gst_percent": "12%", "gst_value": 0.12},
#                 {"gst_percent": "18%", "gst_value": 0.18},
#                 {"gst_percent": "28%", "gst_value": 0.28},
#                 {"igst_percent": "0%", "igst_value": 0},
#                 {"igst_percent": "5%", "igst_value": 0.05},
#                 {"igst_percent": "12%", "igst_value": 0.12},
#                 {"igst_percent": "18%", "igst_value": 0.18},
#                 {"igst_percent": "28%", "igst_value": 0.28},
#             ]

#             main_data["gst_type"] = gst_type

#             # ********* stock_stage ************
#             stock_stage = [
#                 "Survey Pending",
#                 "Estimate Pending",
#                 "Approval Pending",
#                 "Approved",
#                 "Under Repairing",
#                 "Empty Alloted",
#                 "Available",
#                 "Alloted",
#                 "",
#             ]
#             main_data["stock_stage"] = stock_stage

#             # ********* current_available_container_list ************
#             current_available_container = [
#                 each.container_no
#                 for each in Container.objects.select_related("location", "site").filter(
#                     location=location, site=site, status="IN", is_available=True
#                 )
#             ]
#             main_data["current_available_container_list"] = current_available_container

#             # ********* location_site_user_list and roles ************
#             try:
#                 account_user = AccountUser.objects.select_related(
#                     "location", "site"
#                 ).get(username=self.request.user.username)
#                 location_site_user_list = None
#                 roles = None
#                 if account_user.role.name == "Admin":
#                     location_site_user_list = {
#                         each.name: [
#                             site.name
#                             for site in list(
#                                 Site.objects.select_related("location").filter(
#                                     location=each
#                                 )
#                             )
#                         ]
#                         for each in list(Location.objects.all())
#                     }
#                     roles = [each.get_role() for each in Role.objects.all()]
#                     for each in location_site_user_list:
#                         location_site_user_list[each].append("ALL")
#                     location_site_user_list["ALL"] = ["ALL"]
#                 elif account_user.role.name == "Location Admin":
#                     location_site_user_list = {
#                         each.name: [
#                             site.name
#                             for site in list(
#                                 Site.objects.select_related("location").filter(
#                                     location=each
#                                 )
#                             )
#                         ]
#                         for each in list(Location.objects.all())
#                     }
#                     for each in location_site_user_list:
#                         location_site_user_list[each].append("ALL")
#                     roles = [
#                         each.get_role()
#                         for each in Role.objects.filter(~Q(name="Admin"))
#                     ]
#                 elif account_user.role.name == "Site Admin":
#                     location_site_user_list = {
#                         each.name: [
#                             site.name
#                             for site in list(
#                                 Site.objects.select_related("location").filter(
#                                     location=each
#                                 )
#                             )
#                         ]
#                         for each in list(Location.objects.all())
#                     }
#                     roles = [
#                         each.get_role()
#                         for each in Role.objects.filter(
#                             ~Q(name="Admin"), ~Q(name="Location Admin")
#                         )
#                     ]
#                 elif account_user.role.name == "Depot User":
#                     roles = [
#                         each.get_role()
#                         for each in Role.objects.filter(
#                             ~Q(name="Admin"),
#                             ~Q(name="Location Admin"),
#                             ~Q(name="Site Admin"),
#                         )
#                     ]
#                     location_site_user_list = {
#                         each.name: [
#                             site.name
#                             for site in list(Site.objects.filter(location=each))
#                         ]
#                         for each in list(Location.objects.all())
#                     }
#                 else:
#                     pass
#             except:
#                 location_site_user_list = {}
#             main_data["location_site_user_list"] = location_site_user_list
#             main_data["roles"] = roles

#             # ********* location_site_dashboard_list ************
#             try:
#                 location_site_dashboard_list = {
#                     each.name: [
#                         site.name
#                         for site in list(
#                             Site.objects.select_related("location").filter(
#                                 location=each
#                             )
#                         )
#                     ]
#                     for each in list(Location.objects.all())
#                 }
#                 for each in location_site_dashboard_list:
#                     location_site_dashboard_list[each].append("")
#                 location_site_dashboard_list[""] = [""]
#             except:
#                 location_site_dashboard_list = {}
#             main_data["location_site_dashboard_list"] = location_site_dashboard_list

#             # ********* location_site_dashboard_list with site type************
#             try:
#                 location_site_type_dashboard_list = {
#                     each.name: [
#                         {
#                             "site": site.name,
#                             "type": site.type,
#                             "automatic_mnr_status_change": site.automatic_mnr_status_change
#                             if site.automatic_mnr_status_change is not None
#                             else "",
#                             "mnr_module": site.mnr_module
#                             if site.mnr_module is not None
#                             else "",
#                         }
#                         for site in list(
#                             Site.objects.select_related("location").filter(
#                                 location=each
#                             )
#                         )
#                     ]
#                     for each in list(Location.objects.all())
#                 }
#                 for each in location_site_type_dashboard_list:
#                     location_site_type_dashboard_list[each].append("")
#                 location_site_type_dashboard_list[""] = [""]
#             except:
#                 location_site_type_dashboard_list = {}
#             main_data[
#                 "location_site_type_dashboard_list"
#             ] = location_site_type_dashboard_list

#             # ********* report_shipping_lines ************

#             report_shipping_lines = [
#                 "esl",
#                 "rcl",
#                 "msk",
#                 "hapag",
#                 "hyundai",
#                 "zim",
#                 "cma",
#                 "msc",
#                 "qnl",
#                 "sarjak",
#                 "atl",
#                 "cordelia",
#                 "fabking",
#                 "irisl",
#                 "janzin",
#                 "swen",
#                 "blpl",
#                 "expressway",
#                 "goodrich",
#                 "goodrich maritime",
#                 "maxicon",
#                 "perma",
#                 "soc",
#                 "hal",
#             ]
#             for each in RefCodeMaster.objects.all().iterator():
#                 report_shipping_lines.append(each.ref_code.lower())
#             report_lines = ["ALL"]
#             for client in Client.objects.filter(location=location, site=site):
#                 try:
#                     if client.ref_code.lower() in report_shipping_lines:
#                         report_lines.append(client.ref_code.upper())
#                 except:
#                     pass
#             uniq_report_lines = []
#             if not len(report_lines) == 0:
#                 seen = set()
#                 for x in report_lines:
#                     if x not in seen:
#                         uniq_report_lines.append(x)
#                         seen.add(x)
#             main_data["report_shipping_lines"] = uniq_report_lines

#             # ********* edi_shipping_lines ************
#             edi_shipping_lines = [
#                 "cma",
#                 "apl",
#                 "anl",
#                 "hmm",
#                 "rcl",
#                 "esl",
#                 "qnl",
#                 "msk",
#                 "egl",
#                 "zim",
#                 "msc",
#                 "hal",
#             ]
#             edi_lines = []
#             for client in Client.objects.filter(
#                 location=location, site=site, edi_service=True
#             ):
#                 try:
#                     if client.ref_code.lower() in edi_shipping_lines:
#                         edi_lines.append(client.ref_code.upper())
#                 except:
#                     pass
#             uniq_edi_lines = []
#             if not len(edi_lines) == 0:
#                 seen = set()
#                 for x in edi_lines:
#                     if x not in seen:
#                         uniq_edi_lines.append(x)
#                         seen.add(x)
#             main_data["edi_shipping_lines"] = uniq_edi_lines

#             # ********* location ************
#             location_list = [each.name for each in list(Location.objects.all())]
#             main_data["location"] = location_list

#             # ********* ground_rent_client_ref_codes ************
#             ground_rent_client_ref_code = [
#                 each.client_ref_code
#                 for each in GroundRent.objects.select_related(
#                     "location", "site"
#                 ).filter(location=location, site=site)
#             ]
#             ground_rent_client_ref_code_list = list(set(ground_rent_client_ref_code))
#             main_data["ground_rent_client_ref_codes"] = ground_rent_client_ref_code_list

#             # ********* client_ref_codes ************
#             client_ref_codes = edi_shipping_lines + report_shipping_lines
#             client_ref_codes_list = [
#                 each.upper() for each in list(set(client_ref_codes))
#             ] + ground_rent_client_ref_code_list

#             main_data["client_ref_codes"] = [
#                 each.upper() for each in list(set(client_ref_codes_list))
#             ]
#             return Response(main_data, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


def get_inform_dependency_old(request, location, site):
    try:
        main_data = {}
        # ************ Depot Users **************
        try:
            main_data["depot_user_data"] = list(
                AccountUser.objects.select_related("location", "site")
                .filter(role__name="Depot User", location=location, site=site)
                .values_list("username", flat=True)
            )
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            depot_user_data = []
            main_data["depot_user_data"] = depot_user_data

        # ********** client_data ***********
        try:
            client_query = Client.objects.select_related("location", "site").filter(
                location=location, site=site
            )
            client_data = []
            line_client_data = []
            for client in client_query:
                data = {
                    "name": client.name,
                    "ref_code": "" if client.ref_code is None else client.ref_code,
                    "shipping_line": [
                        {
                            "name": (
                                ""
                                if ClientAbbreviation.objects.filter(
                                    client=client
                                ).first()
                                is None
                                else ClientAbbreviation.objects.filter(client=client)
                                .first()
                                .name
                            )
                        }
                    ],
                }
                if client.type == "Line":
                    line_client_data.append(data)
                client_data.append(data)
            client_data.append({"name": "", "ref_code": "", "shipping_line": []})
            line_client_data.append({"name": "", "ref_code": "", "shipping_line": []})
            main_data["client_data"] = client_data
            main_data["line_client_data"] = line_client_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            client_data = ""
            main_data["client_data"] = client_data

        # # # ********** client_data ***********
        # try:
        #     client_data = list(
        #         Client.objects.select_related("location", "site")
        #         .filter(location=location, site=site)
        #         .values("name", "ref_code")
        #     )
        #     client_data.append({"name": "", "ref_code": ""})
        #     main_data["client_data"] = client_data
        # except:
        #     error_log = logging.getLogger("error_log")
        #     error_log.error(traceback.format_exc())
        #     client_data = ""
        #     main_data["client_data"] = client_data

        # # ********** line_client_data ***********
        # try:
        #     line_client_data = list(
        #         Client.objects.select_related("location", "site")
        #         .filter(type="Line", location=location, site=site)
        #         .values("name", "ref_code")
        #     )
        #     line_client_data.append({"name": "", "ref_code": ""})
        #     main_data["line_client_data"] = line_client_data
        # except:
        #     error_log = logging.getLogger("error_log")
        #     error_log.error(traceback.format_exc())
        #     line_client_data = ""
        #     main_data["line_client_data"] = line_client_data

        # *********** party_client_data ***************
        party_client_data = list(
            Client.objects.select_related("location", "site")
            .filter(type="Party", location=location, site=site)
            .values("name")
        )
        main_data["party_client_data"] = party_client_data

        # ********* size_data ************
        try:
            size_data = list(ContainerSize.objects.all().values("name"))
            main_data["size_data"] = size_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            size_data = ""
            main_data["size_data"] = size_data

        # ********* type_data ************
        try:
            type_data = list(ContainerType.objects.all().values("name"))
            main_data["type_data"] = type_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            type_data = ""
            main_data["type_data"] = type_data

        # # ********** Country *****************
        try:
            country_data = list(Country.objects.all().values("name"))
            main_data["country_data"] = country_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            country_data = ""
            main_data["country_data"] = country_data

        # # ********* indian states ************
        try:
            main_data["indian_states"] = [
                "Andhra Pradesh",
                "Arunachal Pradesh",
                "Assam",
                "Bihar",
                "Chhattisgarh",
                "Goa",
                "Gujarat",
                "Haryana",
                "Himachal Pradesh",
                "Jammu and Kashmir",
                "Jharkhand",
                "Karnataka",
                "Kerala",
                "Madhya Pradesh",
                "Maharashtra",
                "Manipur",
                "Meghalaya",
                "Mizoram",
                "Nagaland",
                "Odisha",
                "Punjab",
                "Rajasthan",
                "Sikkim",
                "Tamil Nadu",
                "Telangana",
                "Tripura",
                "Uttar Pradesh",
                "Uttarakhand",
                "West Bengal",
                "Andaman and Nicobar Islands",
                "Chandigarh",
                "Dadra and Nagar Haveli",
                "Daman and Diu",
                "Lakshadweep",
                "Delhi",
                "Puducherry",
            ]
            main_data["state_code"] = {
                "Andhra Pradesh": "37",
                "Arunachal Pradesh ": "12",
                "Assam": "18",
                "Bihar": "10",
                "Chattisgarh": "22",
                "Goa": "30",
                "Gujarat": "24",
                "Haryana": "06",
                "Himachal Pradesh": "02",
                "Jammu and Kashmir": "01",
                "Jharkhand": "20",
                "Karnataka": "29",
                "Kerala": "32",
                "Madhya Pradesh": "23",
                "Maharashtra": "27",
                "Manipur": "14",
                "Meghalaya": "17",
                "Mizoram": "15",
                "Nagaland": "13",
                "Odisha": "21",
                "Punjab": "03",
                "Rajasthan": "08",
                "Sikkim": "11",
                "Tamil Nadu": "33",
                "Telangana": "36",
                "Tripura": "16",
                "Uttar Pradesh": "09",
                "Uttarakhand": "05",
                "West Bengal": "19",
                "Andaman and Nicobar Islands": "35",
                "Chandigarh": "04",
                "Dadra and Nagar Haveli": "26",
                "Daman and Diu": "26",
                "Lakshadweep": "31",
                "Delhi": "07",
                "Puducherry": "97",
            }
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            main_data["indian_states"] = ""

        # # ********* export_cargo_type_data ************
        try:
            export_cargo_type_data = list(ExportCargoType.objects.all().values("name"))
            main_data["export_cargo_type_data"] = export_cargo_type_data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            export_cargo_type_data = ""
            main_data["export_cargo_type_data"] = export_cargo_type_data

        # ********* lolo_amount ************
        # try:
        #     lolo_amount = [
        #         {"amount": str(charge.amount)}
        #         for charge in list(
        #             HandlingCharge.objects.select_related("location", "site").filter(
        #                 location=location, site=site
        #             )
        #         )
        #     ]
        #     main_data["lolo_amount"] = lolo_amount
        # except:
        #     error_log = logging.getLogger("error_log")
        #     error_log.error(traceback.format_exc())
        #     lolo_amount = ""
        #     main_data["lolo_amount"] = lolo_amount

        # # ********* transportation_amount ************
        # try:
        #     transportation_amount = [
        #         {"amount": str(charge.amount)}
        #         for charge in list(
        #             TransportationCharge.objects.select_related(
        #                 "location", "site"
        #             ).filter(location=location, site=site)
        #         )
        #     ]
        #     main_data["transportation_amount"] = transportation_amount
        # except:
        #     error_log = logging.getLogger("error_log")
        #     error_log.error(traceback.format_exc())
        #     transportation_amount = ""
        #     main_data["transportation_amount"] = transportation_amount

        # # ********* transporter ************
        try:
            transporter = list(
                Transporter.objects.filter(location=location, site=site)
                .exclude(name__in=["N/A", "NA", "-NA-", "- NA -"])
                .values("name")
            )

            main_data["transporter"] = transporter
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            transporter = ""
            main_data["transporter"] = transporter

        # # ********* carrier_code ************
        try:
            carrier_code = list(
                CarrierCode.objects.select_related("location", "site")
                .filter(location=location, site=site)
                .annotate(name=F("code"))
                .values("name")
            )

            main_data["carrier_code"] = carrier_code

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            carrier_code = ""
            main_data["carrier_code"] = carrier_code

        # # ********* damage_code_n_condition ************
        damage_code_n_condition = [
            "OK",
            "CLEANING",
            "LD",
            "MD",
            "HD",
            "AV",
            "DM",
            "AR",
        ]
        main_data["damage_code_n_condition"] = damage_code_n_condition

        # # ********* grade ************
        grade_code = ["A", "B+", "B", "C+", "C", "D"]
        main_data["grade"] = grade_code

        # # ********* arrived ************
        arrived = [
            "Factory",
            "Road/Rail",
            "CFS/ICD",
            "Port/Vessel",
            "FS RETURN",
        ]
        main_data["arrived"] = arrived

        # # ********* origin ************
        origin = ["Factory", "Intercity", "CFS/ICD", "Port/Vessel"]
        main_data["origin"] = origin

        # # ********* lolo_type ************
        lolo_type = ["Lift ON / Lift OFF", "ON", "OFF"]
        main_data["lolo_type"] = lolo_type

        # # ********* payment_type ************
        payment_type = [
            "None",
            "Cash",
            "Cheque",
            "NEFT",
            "RTGS",
            "Outstanding",
            "Credit",
        ]
        main_data["payment_type"] = payment_type

        # # ********* gst_type ************
        gst_type = [
            {"gst_percent": "0%", "gst_value": 0},
            {"gst_percent": "5%", "gst_value": 0.05},
            {"gst_percent": "12%", "gst_value": 0.12},
            {"gst_percent": "18%", "gst_value": 0.18},
            {"gst_percent": "28%", "gst_value": 0.28},
            {"igst_percent": "0%", "igst_value": 0},
            {"igst_percent": "5%", "igst_value": 0.05},
            {"igst_percent": "12%", "igst_value": 0.12},
            {"igst_percent": "18%", "igst_value": 0.18},
            {"igst_percent": "28%", "igst_value": 0.28},
        ]

        main_data["gst_type"] = gst_type

        # # ********* stock_stage ************
        stock_stage = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Approved",
            "Under Repairing",
            "Empty Alloted",
            "Available",
            "Without_Repair_Available",
            "Alloted",
            "",
        ]
        main_data["stock_stage"] = stock_stage

        # # ********* current_available_container_list ************
        try:
            current_available_container = list(
                ContainerStock.objects.select_related(
                    "container", "container__location", "container__site"
                )
                .filter(
                    container__location=location,
                    container__site=site,
                    container__status="IN",
                    container_status="IN",
                    status__in=["Available", "Alloted", "Without_Repair_Available"],
                )
                .values_list("container__container_no", flat=True)
            )
            main_data["current_available_container_list"] = current_available_container

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            main_data["current_available_container_list"] = []

        # # ********* location_site_user_list and roles ************
        try:
            account_user = AccountUser.objects.select_related("location", "site").get(
                username=request.user.username
            )
            location_site_user_list = {}
            roles = []
            if account_user.role.name == "Admin":
                roles = list(Role.objects.all().values_list("name", flat=True))
            elif account_user.role.name == "Location Admin":
                roles = (["Location Admin", "Site Admin", "Depot User"],)
            elif account_user.role.name == "Site Admin":
                roles = (["Site Admin", "Depot User"],)
            elif account_user.role.name == "Depot User":
                roles = (["Depot User"],)

            for each in Location.objects.all():
                location_site_user_list.update(
                    {
                        each.name: list(
                            Site.objects.select_related("location")
                            .filter(location=each)
                            .values_list("name", flat=True)
                        )
                    }
                )
                location_site_user_list[each.name].append("ALL")
            location_site_user_list.update({"ALL": ["ALL"]})
            main_data["location_site_user_list"] = location_site_user_list
            main_data["roles"] = roles
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            location_site_user_list = {}
        main_data["location_site_user_list"] = location_site_user_list
        main_data["roles"] = roles

        # # ********* location_site_dashboard_list ************
        try:
            location_site_dashboard_list = {}
            for each in Location.objects.all():
                location_site_dashboard_list.update(
                    {
                        each.name: list(
                            Site.objects.select_related("location")
                            .filter(location=each)
                            .values_list("name", flat=True)
                        )
                    }
                )
                # location_site_user_list[each.name].append("")
            location_site_dashboard_list.update({"": [""]})
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            location_site_dashboard_list = {}
        main_data["location_site_dashboard_list"] = location_site_dashboard_list

        # # ********* location_site_dashboard_list with site type************

        # # ********* location_site_dashboard_list with site type************
        try:
            location_site_type_dashboard_list = {
                each.name: [
                    {
                        "site": site.name,
                        "type": site.type,
                        "automatic_mnr_status_change": (
                            site.automatic_mnr_status_change
                            if site.automatic_mnr_status_change is not None
                            else ""
                        ),
                        "mnr_module": (
                            site.mnr_module if site.mnr_module is not None else ""
                        ),
                        "transportation_module": (
                            site.transportation_module
                            if site.transportation_module is not None
                            else ""
                        ),
                        "new_billing_module": (
                            site.new_billing_module
                            if site.new_billing_module is not None
                            else ""
                        ),
                    }
                    for site in list(
                        Site.objects.select_related("location").filter(location=each)
                    )
                ]
                for each in list(Location.objects.all())
            }
            # for each in location_site_type_dashboard_list:
            #     location_site_type_dashboard_list[each].append("")
            location_site_type_dashboard_list[""] = [""]
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            location_site_type_dashboard_list = {}
        main_data["location_site_type_dashboard_list"] = (
            location_site_type_dashboard_list
        )

        # # ********* report_shipping_lines ************
        report_shipping_lines = [
            "esl",
            "rcl",
            "msk",
            "hapag",
            "hyundai",
            "zim",
            "cma",
            "msc",
            "qnl",
            "sarjak",
            "atl",
            "cordelia",
            "fabking",
            "irisl",
            "janzin",
            "swen",
            "blpl",
            "expressway",
            "goodrich",
            "goodrich maritime",
            "maxicon",
            "perma",
            "soc",
            "hal",
        ]
        for each in RefCodeMaster.objects.all():
            report_shipping_lines.append(each.ref_code.lower())
        report_lines = [
            client.ref_code.upper()
            for client in Client.objects.filter(
                location=location, site=site, ref_code__in=report_shipping_lines
            )
        ]
        uniq_report_lines = list(set(report_lines))
        uniq_report_lines.append("All")
        main_data["report_shipping_lines"] = uniq_report_lines

        # # ********* edi_shipping_lines ************
        edi_shipping_lines = [
            "cma",
            "apl",
            "anl",
            "hmm",
            "rcl",
            "esl",
            "qnl",
            "msk",
            "egl",
            "zim",
            "msc",
            "hal",
        ]
        edi_lines = [
            client.ref_code.upper()
            for client in Client.objects.filter(
                location=location,
                site=site,
                edi_service=True,
                ref_code__in=edi_shipping_lines,
            )
        ]

        uniq_edi_lines = list(set(edi_lines))
        main_data["edi_shipping_lines"] = uniq_edi_lines

        # # ********* location ************
        location_list = list(Location.objects.all().values_list("name", flat=True))
        main_data["location"] = location_list

        # # ********* ground_rent_client_ref_codes ************
        # ground_rent_client_ref_code = [
        #     each.client_ref_code
        #     for each in GroundRent.objects.select_related("location", "site").filter(
        #         location=location, site=site
        #     )
        # ]
        # ground_rent_client_ref_code_list = list(set(ground_rent_client_ref_code))
        # main_data["ground_rent_client_ref_codes"] = ground_rent_client_ref_code_list

        # ********* client_ref_codes ************
        client_ref_codes = edi_shipping_lines + report_shipping_lines
        # client_ref_codes_list = [
        #     each.upper() for each in list(set(client_ref_codes))
        # ] + ground_rent_client_ref_code_list
        main_data["client_ref_codes"] = [
            each.upper() for each in list(set(client_ref_codes))
        ]

        # ************* edi_move_code_process_list *************
        edi_move_code_process_list = {
            "cfs_in": ["DVAN", "MTIN", "DMG_MT", "REP_OUT_MT"],
            "cfs_out": ["REP_RET_MT", "VAN"],
            "factory_in": ["MTIN", "DMG_MT", "REP_OUT_MT"],
            "factory_out": ["REP_RET_MT", "VAN"],
            "vessel_in": ["MOR", "MIR", "DMG_MT", "REP_OUT_MT"],
            "vessel_out": ["REP_RET_MT", "MOR"],
            "road_in": ["MIR", "DMG_MT", "REP_OUT_MT"],
            "road_out": ["REP_RET_MT", "MOR"],
            "fs_return_in": ["RET"],
            "fs_return_out": ["VAN"],
        }
        main_data["edi_move_code_process_list"] = edi_move_code_process_list
        # ********************** vessel bkg **********************
        try:
            bkg_number = list(
                VesselBkgNo.objects.select_related("location", "site")
                .filter(location=location, site=site)
                .values_list("number", flat=True)
            )
            main_data["vessel_booking_no"] = bkg_number
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            main_data["vessel_booking_no"] = []

        try:
            adhoc_report_type = [
                "MNR Material Usage Report",
                "Volume Tues Report",
                "Provisional Bill Report",
            ]
            main_data["adhoc_report_type"] = adhoc_report_type
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            main_data["adhoc_report_type"] = []

        return main_data
    except Exception as e:
        return {"errorMsg": f"Data Not Found [{e}]"}


class InformDependency(views.APIView):
    """the Post function will give all form dependent data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "Surveyor", "MNR Team", "Repair","Automation","Analytics","Loaded Yard"]

    @cache_api_view("inform_dropdown", time=86400)
    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            main_data = {}
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            get_list = request.data.get("get_list", None)
            if get_list is None or len(get_list) == 0:
                response = get_inform_dependency_old(request, location, site)
                return Response(response, status=200)

            # get_list_refer = [
            #     "depot_user_data",
            #     "client_data",
            #     "line_client_data",
            #     "party_client_data",
            #     "size_data",
            #     "type_data",
            #     "indian_states",
            #     "export_cargo_type_data",
            #     "lolo_amount",
            #     "transportation_amount",
            #     "transporter",
            #     "carrier_code",
            #     "damage_code_n_condition",
            #     "grade",
            #     "arrived",
            #     "origin",
            #     "lolo_type",
            #     "payment_type",
            #     "gst_type",
            #     "stock_stage",
            #     "current_available_container_list",
            #     "location_site_user_list_and_roles",
            #     "location_site_dashboard_list",
            #     "location_site_type_dashboard_list",
            #     "location",
            #     "client_ref_codes",
            # ]

            if "depot_user_data" in get_list:
                # ************ Depot Users **************
                try:
                    main_data["depot_user_data"] = list(
                        AccountUser.objects.select_related("location", "site")
                        .filter(role__name="Depot User", location=location, site=site)
                        .values_list("username", flat=True)
                    )
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    depot_user_data = []
                    main_data["depot_user_data"] = depot_user_data

            if "client_data" in get_list or "line_client_data" in get_list:
                # ********** client_data ***********
                try:
                    client_query = Client.objects.select_related(
                        "location", "site"
                    ).filter(location=location, site=site)
                    client_data = []
                    line_client_data = []
                    for client in client_query:
                        data = {
                            "name": client.name,
                            "ref_code": (
                                "" if client.ref_code is None else client.ref_code
                            ),
                            "shipping_line": [
                                {
                                    "name": (
                                        ""
                                        if ClientAbbreviation.objects.filter(
                                            client=client
                                        ).first()
                                        is None
                                        else ClientAbbreviation.objects.filter(
                                            client=client
                                        )
                                        .first()
                                        .name
                                    )
                                }
                            ],
                        }
                        if client.type == "Line":
                            line_client_data.append(data)
                        client_data.append(data)
                    client_data.append(
                        {"name": "", "ref_code": "", "shipping_line": []}
                    )
                    line_client_data.append(
                        {"name": "", "ref_code": "", "shipping_line": []}
                    )
                    main_data["client_data"] = client_data
                    main_data["line_client_data"] = line_client_data
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    client_data = ""
                    main_data["client_data"] = client_data

            if "party_client_data" in get_list:
                # *********** party_client_data ***************
                party_client_data = list(
                    Client.objects.select_related("location", "site")
                    .filter(type="Party", location=location, site=site)
                    .values("name")
                )
                main_data["party_client_data"] = party_client_data

            if "size_data" in get_list:
                # ********* size_data ************
                try:
                    size_data = list(ContainerSize.objects.all().values("name"))
                    main_data["size_data"] = size_data
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    size_data = ""
                    main_data["size_data"] = size_data

            if "country_data" in get_list:
                try:
                    country_data = list(Country.objects.all().values("name"))
                    main_data["country_data"] = country_data
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    country_data = ""
                    main_data["country_data"] = country_data

            if "type_data" in get_list:
                # ********* type_data ************
                try:
                    type_data = list(ContainerType.objects.all().values("name"))
                    main_data["type_data"] = type_data
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    type_data = ""
                    main_data["type_data"] = type_data

            if "indian_states" in get_list:
                # ********* indian states ************
                try:
                    main_data["indian_states"] = [
                        "Andhra Pradesh",
                        "Arunachal Pradesh",
                        "Assam",
                        "Bihar",
                        "Chhattisgarh",
                        "Goa",
                        "Gujarat",
                        "Haryana",
                        "Himachal Pradesh",
                        "Jammu and Kashmir",
                        "Jharkhand",
                        "Karnataka",
                        "Kerala",
                        "Madhya Pradesh",
                        "Maharashtra",
                        "Manipur",
                        "Meghalaya",
                        "Mizoram",
                        "Nagaland",
                        "Odisha",
                        "Punjab",
                        "Rajasthan",
                        "Sikkim",
                        "Tamil Nadu",
                        "Telangana",
                        "Tripura",
                        "Uttar Pradesh",
                        "Uttarakhand",
                        "West Bengal",
                        "Andaman and Nicobar Islands",
                        "Chandigarh",
                        "Dadra and Nagar Haveli",
                        "Daman and Diu",
                        "Lakshadweep",
                        "Delhi",
                        "Puducherry",
                    ]
                    main_data["state_code"] = {
                        "Andhra Pradesh": "37",
                        "Arunachal Pradesh ": "12",
                        "Assam": "18",
                        "Bihar": "10",
                        "Chattisgarh": "22",
                        "Goa": "30",
                        "Gujarat": "24",
                        "Haryana": "06",
                        "Himachal Pradesh": "02",
                        "Jammu and Kashmir": "01",
                        "Jharkhand": "20",
                        "Karnataka": "29",
                        "Kerala": "32",
                        "Madhya Pradesh": "23",
                        "Maharashtra": "27",
                        "Manipur": "14",
                        "Meghalaya": "17",
                        "Mizoram": "15",
                        "Nagaland": "13",
                        "Odisha": "21",
                        "Punjab": "03",
                        "Rajasthan": "08",
                        "Sikkim": "11",
                        "Tamil Nadu": "33",
                        "Telangana": "36",
                        "Tripura": "16",
                        "Uttar Pradesh": "09",
                        "Uttarakhand": "05",
                        "West Bengal": "19",
                        "Andaman and Nicobar Islands": "35",
                        "Chandigarh": "04",
                        "Dadra and Nagar Haveli": "26",
                        "Daman and Diu": "26",
                        "Lakshadweep": "31",
                        "Delhi": "07",
                        "Puducherry": "97",
                    }
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["indian_states"] = ""

            if "export_cargo_type_data" in get_list:
                # ********* export_cargo_type_data ************
                try:
                    export_cargo_type_data = list(
                        ExportCargoType.objects.all().values("name")
                    )
                    main_data["export_cargo_type_data"] = export_cargo_type_data
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    export_cargo_type_data = ""
                    main_data["export_cargo_type_data"] = export_cargo_type_data

            # if "lolo_amount" in get_list:
            #     # ********* lolo_amount ************
            #     try:
            #         lolo_amount = [
            #             {"amount": str(charge.amount)}
            #             for charge in list(
            #                 HandlingCharge.objects.select_related(
            #                     "location", "site"
            #                 ).filter(location=location, site=site)
            #             )
            #         ]
            #         main_data["lolo_amount"] = lolo_amount
            #     except:
            #         error_log = logging.getLogger("error_log")
            #         error_log.error(traceback.format_exc())
            #         lolo_amount = ""
            #         main_data["lolo_amount"] = lolo_amount

            # if "transportation_amount" in get_list:
            #     # ********* transportation_amount ************
            #     try:
            #         transportation_amount = [
            #             {"amount": str(charge.amount)}
            #             for charge in list(
            #                 TransportationCharge.objects.select_related(
            #                     "location", "site"
            #                 ).filter(location=location, site=site)
            #             )
            #         ]
            #         main_data["transportation_amount"] = transportation_amount
            #     except:
            #         error_log = logging.getLogger("error_log")
            #         error_log.error(traceback.format_exc())
            #         transportation_amount = ""
            #         main_data["transportation_amount"] = transportation_amount

            if "transporter" in get_list:
                # ********* transporter ************
                try:
                    transporter = list(
                        Transporter.objects.filter(location=location, site=site)
                        .exclude(name__in=["N/A", "NA", "-NA-", "- NA -"])
                        .values("name")
                    )

                    main_data["transporter"] = transporter
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    transporter = ""
                    main_data["transporter"] = transporter

            if "carrier_code" in get_list:
                # ********* carrier_code ************
                try:
                    carrier_code = list(
                        CarrierCode.objects.select_related("location", "site")
                        .filter(location=location, site=site)
                        .annotate(name=F("code"))
                        .values("name")
                    )

                    main_data["carrier_code"] = carrier_code

                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    carrier_code = ""
                    main_data["carrier_code"] = carrier_code

            if "damage_code_n_condition" in get_list:
                # ********* damage_code_n_condition ************
                damage_code_n_condition = [
                    "OK",
                    "CLEANING",
                    "LD",
                    "MD",
                    "HD",
                    "AV",
                    "DM",
                    "AR",
                ]
                main_data["damage_code_n_condition"] = damage_code_n_condition

            if "grade" in get_list:
                # ********* grade ************
                grade_code = ["A", "B+", "B", "C+", "C", "D"]
                main_data["grade"] = grade_code

            if "arrived" in get_list:
                # ********* arrived ************
                arrived = [
                    "Factory",
                    "Road/Rail",
                    "CFS/ICD",
                    "Port/Vessel",
                    "FS RETURN",
                ]
                main_data["arrived"] = arrived

            if "origin" in get_list:
                # ********* origin ************
                origin = ["Factory", "Intercity", "CFS/ICD", "Port/Vessel"]
                main_data["origin"] = origin

            if "lolo_type" in get_list:
                # ********* lolo_type ************
                lolo_type = ["Lift ON / Lift OFF", "ON", "OFF"]
                main_data["lolo_type"] = lolo_type

            if "payment_type" in get_list:
                # ********* payment_type ************
                payment_type = [
                    "None",
                    "Cash",
                    "Cheque",
                    "NEFT",
                    "RTGS",
                    "Outstanding",
                    "Credit",
                    "Advance",
                ]
                main_data["payment_type"] = payment_type

            if "gst_type" in get_list:
                # ********* gst_type ************
                gst_type = [
                    {"gst_percent": "0%", "gst_value": 0},
                    {"gst_percent": "5%", "gst_value": 0.05},
                    {"gst_percent": "12%", "gst_value": 0.12},
                    {"gst_percent": "18%", "gst_value": 0.18},
                    {"gst_percent": "28%", "gst_value": 0.28},
                    {"igst_percent": "0%", "igst_value": 0},
                    {"igst_percent": "5%", "igst_value": 0.05},
                    {"igst_percent": "12%", "igst_value": 0.12},
                    {"igst_percent": "18%", "igst_value": 0.18},
                    {"igst_percent": "28%", "igst_value": 0.28},
                ]

                main_data["gst_type"] = gst_type

            if "stock_stage" in get_list:
                # ********* stock_stage ************
                stock_stage = [
                    "Survey Pending",
                    "Estimate Pending",
                    "Approval Pending",
                    "Approved",
                    "Under Repairing",
                    "Empty Alloted",
                    "Available",
                    "Without_Repair_Available",
                    "Alloted",
                    "",
                ]
                main_data["stock_stage"] = stock_stage

            if "current_available_container_list" in get_list:
                # ********* current_available_container_list ************
                try:
                    current_available_container = list(
                        ContainerStock.objects.select_related(
                            "container", "container__location", "container__site"
                        )
                        .filter(
                            container__location=location,
                            container__site=site,
                            container__status="IN",
                            container_status="IN",
                            status__in=[
                                "Available",
                                "Alloted",
                                "Without_Repair_Available",
                            ],
                        )
                        .values_list("container__container_no", flat=True)
                    )
                    main_data["current_available_container_list"] = (
                        current_available_container
                    )

                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["current_available_container_list"] = []

            if "current_pregate_out_available_container_list" in get_list:
                # ********* current_available_container_list ************
                try:
                    current_pregate_out_available_container_raw = list(
                        ContainerStock.objects.select_related(
                            "container", "container__location", "container__site"
                        )
                        .filter(
                            container__location=location,
                            container__site=site,
                            container__status="IN",
                            container_status="IN",
                            status__in=[
                                "Available",
                                "Alloted",
                                "Without_Repair_Available",
                            ],
                        )
                        .exclude(booking_no=None)
                    )
                    current_pregate_out_available_container = [
                        each.container.container_no
                        for each in current_pregate_out_available_container_raw
                        if not PreGateOut.objects.filter(stock=each).exists()
                    ]
                    main_data["current_pregate_out_available_container_list"] = (
                        current_pregate_out_available_container
                    )
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["current_pregate_out_available_container_list"] = []

            if "location_site_user_list_and_roles" in get_list:
                # ********* location_site_user_list and roles ************
                try:
                    account_user = AccountUser.objects.select_related(
                        "location", "site"
                    ).get(username=request.user.username)
                    location_site_user_list = {}
                    roles = []
                    if account_user.role.name == "Admin":
                        roles = list(Role.objects.all().values_list("name", flat=True))
                    elif account_user.role.name == "Location Admin":
                        roles = (["Location Admin", "Site Admin", "Depot User"],)
                    elif account_user.role.name == "Site Admin":
                        roles = (["Site Admin", "Depot User"],)
                    elif account_user.role.name == "Depot User":
                        roles = (["Depot User"],)

                    for each in Location.objects.all():
                        location_site_user_list.update(
                            {
                                each.name: list(
                                    Site.objects.select_related("location")
                                    .filter(location=each)
                                    .values_list("name", flat=True)
                                )
                            }
                        )
                        location_site_user_list[each.name].append("ALL")
                    location_site_user_list.update({"ALL": ["ALL"]})
                    main_data["location_site_user_list"] = location_site_user_list
                    main_data["roles"] = roles
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    location_site_user_list = {}
                main_data["location_site_user_list"] = location_site_user_list
                main_data["roles"] = roles

            if "location_site_dashboard_list" in get_list:
                # ********* location_site_dashboard_list ************
                try:
                    location_site_dashboard_list = {}
                    for each in Location.objects.all():
                        location_site_dashboard_list.update(
                            {
                                each.name: list(
                                    Site.objects.select_related("location")
                                    .filter(location=each)
                                    .values_list("name", flat=True)
                                )
                            }
                        )
                        # location_site_user_list[each.name].append("")
                    location_site_dashboard_list.update({"": [""]})
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    location_site_dashboard_list = {}
                main_data["location_site_dashboard_list"] = location_site_dashboard_list

                ##Location site pk
            if "location_site_id_name" in get_list:
                try:
                    locations = (
                        Location.objects.all().values("pk", "name").order_by("pk")
                    )

                    location_site_id_and_name = [
                        {
                            each["name"]: {
                                "pk": each["pk"],
                                "sites": [
                                    {"pk": site["pk"], "name": site["name"]}
                                    for site in Site.objects.filter(
                                        location_id=each["pk"]
                                    ).values("pk", "name")
                                ],
                            }
                        }
                        for each in locations
                    ]
                    main_data["location_site_id_and_name"] = location_site_id_and_name
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["location_site_id_and_name"] = []

            if "location_site_type_dashboard_list" in get_list:
                # ********* location_site_dashboard_list with site type************
                try:
                    location_site_type_dashboard_list = {
                        each.name: [
                            {
                                "site": site.name,
                                "type": site.type,
                                "automatic_mnr_status_change": (
                                    site.automatic_mnr_status_change
                                    if site.automatic_mnr_status_change is not None
                                    else ""
                                ),
                                "mnr_module": (
                                    site.mnr_module
                                    if site.mnr_module is not None
                                    else ""
                                ),
                                "transportation_module": (
                                    site.transportation_module
                                    if site.transportation_module is not None
                                    else ""
                                ),
                                "loaded_yard_module": (
                                    site.loaded_yard_module
                                    if site.loaded_yard_module is not None
                                    else ""
                                ),
                                "new_billing_module": (
                                    site.new_billing_module
                                    if site.new_billing_module is not None
                                    else ""
                                ),
                                "procurement_module": (
                                    site.procurement_module
                                    if site.procurement_module is not None
                                    else ""
                                ),
                                "mnr_ftp_upload": (
                                    site.mnr_ftp_upload
                                    if site.mnr_ftp_upload is not None
                                    else ""
                                ),
                                "procurement_admin": (
                                    site.procurement_admin
                                    if site.procurement_admin is not None
                                    else ""
                                ),
                                "lolo_finance": site.lolo_finance,
                                "truck_tracking":site.truck_tracking,
                                "en_block_movement": site.en_block_movement,
                                "en_block_movement_v2": site.en_block_movement_v2,
                                "mnr_team": site.mnr_team,
                                "payment_due_date": site.payment_due_date or "",
                            }
                            for site in list(
                                Site.objects.select_related("location").filter(
                                    location=each
                                )
                            )
                        ]
                        for each in list(Location.objects.all())
                    }
                    # for each in location_site_type_dashboard_list:
                    #     location_site_type_dashboard_list[each].append("")
                    location_site_type_dashboard_list[""] = [""]
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    location_site_type_dashboard_list = {}
                main_data["location_site_type_dashboard_list"] = (
                    location_site_type_dashboard_list
                )

            if "location" in get_list:
                # ********* location ************
                location_list = list(
                    Location.objects.all().values_list("name", flat=True)
                )
                main_data["location"] = location_list

            if "client_ref_codes" in get_list:
                # ********* report_shipping_lines ************
                report_shipping_lines = [
                    "esl",
                    "rcl",
                    "msk",
                    "hapag",
                    "hmm",
                    "zim",
                    "cma",
                    "msc",
                    "qnl",
                    "sarjak",
                    "atl",
                    "cordelia",
                    "fabking",
                    "irisl",
                    "janzin",
                    "swen",
                    "blpl",
                    "expressway",
                    "goodrich",
                    "goodrich maritime",
                    "maxicon",
                    "perma",
                    "soc",
                    "hal",
                ]
                for each in RefCodeMaster.objects.all():
                    report_shipping_lines.append(each.ref_code.lower())
                report_lines = [
                    client.ref_code.upper()
                    for client in Client.objects.filter(
                        location=location, site=site, ref_code__in=report_shipping_lines
                    )
                ]
                uniq_report_lines = list(set(report_lines))
                uniq_report_lines.append("All")
                main_data["report_shipping_lines"] = uniq_report_lines

                # # ********* edi_shipping_lines ************
                edi_shipping_lines = [
                    "cma",
                    "apl",
                    "anl",
                    "hmm",
                    "rcl",
                    "esl",
                    "qnl",
                    "msk",
                    "egl",
                    "zim",
                    "msc",
                    "hal",
                ]
                edi_lines = [
                    client.ref_code.upper()
                    for client in Client.objects.filter(
                        location=location,
                        site=site,
                        edi_service=True,
                        ref_code__in=edi_shipping_lines,
                    )
                ]

                uniq_edi_lines = list(set(edi_lines))
                main_data["edi_shipping_lines"] = uniq_edi_lines

                # # ********* ground_rent_client_ref_codes ************
                # ground_rent_client_ref_code = [
                #     each.client_ref_code
                #     for each in GroundRent.objects.select_related("location", "site").filter(
                #         location=location, site=site
                #     )
                # ]
                # ground_rent_client_ref_code_list = list(set(ground_rent_client_ref_code))
                # main_data["ground_rent_client_ref_codes"] = ground_rent_client_ref_code_list

                # ********* client_ref_codes ************
                client_ref_codes = edi_shipping_lines + report_shipping_lines
                # client_ref_codes_list = [
                #     each.upper() for each in list(set(client_ref_codes))
                # ] + ground_rent_client_ref_code_list
                main_data["client_ref_codes"] = [
                    each.upper() for each in list(set(client_ref_codes))
                ]

            # ************* edi_move_code_process_list *************
            if "edi_move_code_process_list" in get_list:
                edi_move_code_process_list = {
                    "cfs_in": ["DVAN", "MTIN", "DMG_MT", "REP_OUT_MT"],
                    "cfs_out": ["REP_RET_MT", "VAN"],
                    "factory_in": ["MTIN", "DMG_MT", "REP_OUT_MT"],
                    "factory_out": ["REP_RET_MT", "VAN"],
                    "vessel_in": ["MOR", "MIR", "DMG_MT", "REP_OUT_MT"],
                    "vessel_out": ["REP_RET_MT", "MOR"],
                    "road_in": ["MIR", "DMG_MT", "REP_OUT_MT"],
                    "road_out": ["REP_RET_MT", "MOR"],
                    "fs_return_in": ["RET"],
                    "fs_return_out": ["VAN"],
                }
                main_data["edi_move_code_process_list"] = edi_move_code_process_list

            if "vessel_booking_no" in get_list:
                try:
                    bkg_number = list(
                        VesselBkgNo.objects.select_related("location", "site")
                        .filter(location=location, site=site)
                        .values_list("number", flat=True)
                    )
                    main_data["vessel_booking_no"] = bkg_number
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["vessel_booking_no"] = []
            if "billing_client_customer" in get_list:
                customer_bill_query = CustomerBill.objects.select_related(
                    "location", "site", "client", "customer"
                ).filter(location=location, site=site, is_payment_completed=False)

                client_list = sorted(
                    list(
                        customer_bill_query.values_list(
                            "client__name", flat=True
                        ).distinct()
                    ),
                    key=lambda x: x.lower(),
                )
                customer_list = sorted(
                    list(
                        customer_bill_query.values_list(
                            "customer__name", flat=True
                        ).distinct()
                    ),
                    key=lambda x: x.lower(),
                )
                main_data["client"] = client_list
                main_data["customer"] = customer_list

            if "lf_advance_payment_client_list" in get_list:
                try:
                    lf_advance_payment_client_list = (
                        Client.objects.select_related("location", "site")
                        .filter(type="Party", location=location, site=site)
                        .values_list("name", flat=True)
                    )
                    main_data["lf_advance_payment_client_list"] = list(
                        lf_advance_payment_client_list
                    )
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["lf_advance_payment_client_list"] = []

            if "lf_pregatein_list" in get_list:
                try:
                    lf_pregatein_list = (
                        PreGateIn.objects.select_related("location", "site")
                        .filter(
                            location=location,
                            site=site,
                            on_hold=False,
                            validity_expired=False,
                            is_gatein_done=False,
                            is_survey_done=False,
                        )
                        .values_list("container_no", flat=True)
                    )
                    main_data["lf_pregatein_list"] = list(lf_pregatein_list)
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["lf_pregatein_list"] = []

            if "lf_pregateout_list" in get_list:
                try:
                    lf_pregateout_list = (
                        PreGateOut.objects.select_related("location", "site")
                        .filter(
                            location=location,
                            site=site,
                            on_hold=False,
                            validity_expired=False,
                            is_gateout_done=False,
                        )
                        .values_list("stock__container__container_no", flat=True)
                    )
                    main_data["lf_pregateout_list"] = list(lf_pregateout_list)
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["lf_pregateout_list"] = []

            if "adhoc_report_type" in get_list:
                try:
                    adhoc_report_type = [
                        "MNR Material Usage Report",
                        "Volume Tues Report",
                        "Provisional Bill Report",
                    ]
                    main_data["adhoc_report_type"] = adhoc_report_type
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    main_data["adhoc_report_type"] = []

            return Response(main_data, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


@receiver(post_save)
def inform_dropdown_save(sender, instance, created, **kwargs):
    if sender in [
        Client,
        HandlingCharge,
        TransportationCharge,
        GroundRent,
        CarrierCode,
        Transporter,
        AccountUser,
    ]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_inform_dropdown_{location}_{site}_movement")
        cache.delete(f"request_body_inform_dropdown_{location}_{site}_movement")

    elif sender in [
        Country,
        Location,
        Site,
        Role,
        ContainerSize,
        ContainerType,
        RefCodeMaster,
        ClientAbbreviation,
        ExportCargoType,
        ContainerStock,
    ]:
        all_keys = []
        key_list = cache._cache.keys()
        new_list = list(key_list)
        all_keys = [k.replace(":1:", "") for k in new_list]
        dropdown_keys = [each for each in all_keys if "inform_dropdown" in each]
        if dropdown_keys:
            for each_key in dropdown_keys:
                cache.delete((each_key))


@receiver(post_delete)
def inform_dropdown_delete(sender, instance, **kwargs):
    if sender in [
        Client,
        HandlingCharge,
        TransportationCharge,
        GroundRent,
        CarrierCode,
        Transporter,
        AccountUser,
    ]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_inform_dropdown_{location}_{site}_movement")
        cache.delete(f"request_body_inform_dropdown_{location}_{site}_movement")

    elif sender in [
        Country,
        Location,
        Site,
        Role,
        ContainerSize,
        ContainerType,
        RefCodeMaster,
        ClientAbbreviation,
        ExportCargoType,
        ContainerStock,
    ]:
        all_keys = []
        key_list = cache._cache.keys()
        new_list = list(key_list)
        all_keys = [k.replace(":1:", "") for k in new_list]
        dropdown_keys = [each for each in all_keys if "inform_dropdown" in each]
        if dropdown_keys:
            for each_key in dropdown_keys:
                cache.delete((each_key))
