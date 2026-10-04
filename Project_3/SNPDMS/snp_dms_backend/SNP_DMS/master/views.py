# from rest_framework import views
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import *
# from .models_two import *
# from account.models import AccountUser
# from .functions import *
# import datetime
# from django.utils import timezone
# from depot.models import ContainerStock, GateInHistory, GateOut
# from django.core.paginator import Paginator
# import traceback, logging
# from django.core.cache import cache
# from transportation.Views.form_views import cache_api_view
# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
# from common.functions import print_me
# from django.db.models import Q


# class AddCountryMaster(views.APIView):
#     """
#     The Post Function will create a new Country Entry.
#     The Get Function will get all the entries of Country.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             data_list = [
#                 each.get_country_detail() for each in Country.objects.all().iterator()
#             ]
#             return Response(data_list, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if Country.objects.filter(name=data["name"]).exists():
#                 return Response({"errorMsg": "Country already exists"}, status=200)
#             if name == "":
#                 name = None
#             currency = data["currency"]
#             if currency == "":
#                 currency = None
#             country_entry = Country.create(name=name, currency=currency)
#             country_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditCountryMaster(views.APIView):
#     """
#     The Get Function will get a entry of Country.
#     The Put Function will update a existing Country Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             country_object = Country.objects.get(pk=pk)
#             data = country_object.get_country_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             currency = data["currency"]
#             if currency == "":
#                 currency = None
#             country_object = Country.objects.get(pk=pk)
#             if Country.objects.exclude(pk=country_object.pk).filter(name=name).exists():
#                 return Response({"errorMsg": "Country already exists"}, status=200)
#             country_object = Country.objects.get(pk=pk)
#             country_object.name = name
#             country_object.currency = currency
#             country_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class DeleteCountryMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Country.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 country_object = Country.objects.get(pk=pk)
#                 dependent_list = [country_object.location_country_rel.exists()]
#                 if True not in dependent_list:
#                     country_object.delete()
#                 else:
#                     not_deleted.append(country_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddLocationMaster(views.APIView):
#     """
#     The Post Function will create a new Location Entry.
#     The Get Function will get all the entries of Location.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             user = AccountUser.objects.get(username=request.user.username)
#             role = user.role.name
#             all_objects = None
#             if role == "Admin":
#                 all_objects = Location.objects.select_related("country")
#             elif role == "Location Admin":
#                 all_objects = Location.objects.select_related("country").filter(
#                     name=user.location.name
#                 )
#             elif role == "Site Admin":
#                 all_objects = Location.objects.select_related("country").filter(
#                     name=user.location.name
#                 )
#             elif role == "Depot User":
#                 all_objects = Location.objects.select_related("country").filter(
#                     name=user.location.name
#                 )
#             else:
#                 all_objects = Location.objects.select_related("country")
#             data_list = [each.get_location_detail() for each in all_objects]
#             return Response(data_list, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             app_user = AccountUser.objects.get(username=request.user.username)
#             organization = app_user.organization
#             name = data["name"]
#             if name == "":
#                 name = None
#             target = data["target"]
#             if target == "":
#                 target = None
#             company_name = data["company_name"]
#             if company_name == "":
#                 company_name = None
#             company_address = data["company_address"]
#             if company_address == "":
#                 company_address = None
#             code = data["code"]
#             if code == "":
#                 code = None
#             state_code = data["state_code"]
#             if state_code == "":
#                 state_code = None
#             country = data["country"]
#             icon = data["icon"]
#             if icon == "":
#                 icon = None
#             gst_no = data["gst_no"]
#             if gst_no == "":
#                 gst_no = None

#             if Location.objects.filter(Q(code=code) | Q(name=name)).exists():
#                 return Response({"errorMsg": "Location already exists"}, status=200)

#             try:
#                 country_object = Country.objects.get(name=country)
#             except:
#                 country_object = None

#             location_entry = Location.create(
#                 name=name,
#                 code=code,
#                 target=target,
#                 company_name=company_name,
#                 company_address=company_address,
#                 state_code=state_code,
#                 country=country_object,
#                 icon=icon,
#                 gst_no=gst_no,
#             )
#             location_entry.save()
#             location_entry.organization = organization
#             location_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditLocationMaster(views.APIView):
#     """
#     The Get Function will get a entry of Location.
#     The Put Function will update a existing Location Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             location_object = Location.objects.get(pk=pk)
#             data = location_object.get_location_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             location_object = Location.objects.get(pk=pk)
#             name = data["name"]
#             if name == "":
#                 name = None
#             target = data["target"]
#             if target == "":
#                 target = None
#             company_name = data["company_name"]
#             if company_name == "":
#                 company_name = None
#             company_address = data["company_address"]
#             if company_address == "":
#                 company_address = None
#             state_code = data["state_code"]
#             if state_code == "":
#                 state_code = None
#             code = data["code"]
#             if code == "":
#                 code = None
#             country = data["country"]
#             icon = data["icon"]
#             if icon == "":
#                 icon = None
#             elif type(icon) == str:
#                 icon = location_object.icon
#             gst_no = data["gst_no"]
#             if gst_no == "":
#                 gst_no = None

#             if (
#                 Location.objects.exclude(pk=location_object.pk)
#                 .filter(Q(code=code) | Q(name=name))
#                 .exists()
#             ):
#                 return Response({"errorMsg": "Location already exists"}, status=200)

#             try:
#                 country_object = Country.objects.get(name=country)
#             except:
#                 country_object = None

#             location_object.name = name
#             location_object.code = code
#             location_object.target = target
#             location_object.company_name = company_name
#             location_object.company_address = company_address
#             location_object.state_code = state_code
#             location_object.icon = icon
#             location_object.country = country_object
#             location_object.gst_no = gst_no
#             location_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteLocationMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Location.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 location_object = Location.objects.get(pk=pk)
#                 dependent_list = [
#                     location_object.site_location_rel.exists(),
#                     location_object.user_location_rel.exists(),
#                     location_object.client_location_rel.exists(),
#                     location_object.handling_charge_location_rel.exists(),
#                     location_object.transportation_charge_location_rel.exists(),
#                     location_object.ground_rent_location_rel.exists(),
#                     location_object.transporter_location_rel.exists(),
#                     location_object.vessel_bkgno_location_rel.exists(),
#                     location_object.loc_code_location_rel.exists(),
#                     location_object.container_location_rel.exists(),
#                     location_object.non_depot_container_location_rel.exists(),
#                     location_object.gate_in_location_rel.exists(),
#                     location_object.gate_out_location_rel.exists(),
#                     location_object.billing_location_rel.exists(),
#                     location_object.location_invoice_rel.exists(),
#                     location_object.location_invoice_no_rel.exists(),
#                 ]
#                 if True not in dependent_list:
#                     location_object.delete()
#                 else:
#                     not_deleted.append(location_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddSiteMaster(views.APIView):
#     """
#     The Post Function will create a new Site Entry.
#     The Get Function will get all the entries of Site.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             user = AccountUser.objects.get(username=request.user.username)
#             role = user.role.name
#             all_objects = None
#             if role == "Admin":
#                 all_objects = Site.objects.select_related("location")
#             elif role == "Location Admin":
#                 all_objects = Site.objects.select_related("location").filter(
#                     location=user.location
#                 )
#             elif role == "Site Admin":
#                 all_objects = Site.objects.select_related("location").filter(
#                     name=user.site.name
#                 )
#             elif role == "Depot User":
#                 all_objects = Site.objects.select_related("location").filter(
#                     name=user.site.name
#                 )
#             else:
#                 all_objects = Site.objects.select_related("location")
#             data_list = [each.get_site_detail() for each in all_objects]
#             return Response(data_list, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             app_user = AccountUser.objects.get(username=request.user.username)
#             organization = app_user.organization
#             name = data["name"]
#             if name == "":
#                 name = None
#             address = data["address"]
#             if address == "":
#                 address = None
#             if not "state" in data.keys():
#                 state = None
#             else:
#                 state = data["state"]
#                 if state == "":
#                     state = None
#             if not "state_code" in data.keys():
#                 state_code = None
#             else:
#                 state_code = data["state_code"]
#                 if state_code == "":
#                     state_code = None
#             contact = data["contact"]
#             if contact == "":
#                 contact = None
#             code = data["code"]
#             if code == "":
#                 code = None
#             type = data["type"]
#             if type == "":
#                 type = None
#             depot_code = data["depot_code"]
#             if depot_code == "":
#                 depot_code = None
#             vendor_code = data["vendor_code"]
#             if vendor_code == "":
#                 vendor_code = None
#             depot_name = data["depot_name"]
#             if depot_name == "":
#                 depot_name = None
#             vendor_name = data["vendor_name"]
#             if vendor_name == "":
#                 vendor_name = None
#             automatic_mnr_status_change = data["automatic_mnr_status_change"]
#             if automatic_mnr_status_change == "":
#                 automatic_mnr_status_change = None
#             mnr_module = data["mnr_module"]
#             if mnr_module == "":
#                 mnr_module = None

#             if Site.objects.filter(Q(code=code) | Q(name=name)).exists():
#                 return Response({"errorMsg": "Site already exists"}, status=200)

#             if not "transportation_module" in data.keys():
#                 transportation_module = True
#             else:
#                 transportation_module = data["transportation_module"]
#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site_entry = Site.create(
#                 name=name,
#                 location=location_object,
#                 address=address,
#                 state=state,
#                 state_code=state_code,
#                 contact=contact,
#                 code=code,
#                 type=type,
#                 depot_code=depot_code,
#                 vendor_code=vendor_code,
#                 depot_name=depot_name,
#                 vendor_name=vendor_name,
#                 automatic_mnr_status_change=automatic_mnr_status_change,
#                 mnr_module=mnr_module,
#                 transportation_module=transportation_module,
#             )
#             site_entry.save()
#             site_entry.organization = organization
#             site_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditSiteMaster(views.APIView):
#     """
#     The Get Function will get a entry of Site.
#     The Put Function will update a existing Site Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             site_object = Site.objects.get(pk=pk)
#             data = site_object.get_site_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             address = data["address"]
#             if address == "":
#                 address = None
#             if not "state" in data.keys():
#                 state = None
#             else:
#                 state = data["state"]
#                 if state == "":
#                     state = None
#             if not "state_code" in data.keys():
#                 state_code = None
#             else:
#                 state_code = data["state_code"]
#                 if state_code == "":
#                     state_code = None
#             contact = data["contact"]
#             if contact == "":
#                 contact = None
#             code = data["code"]
#             if code == "":
#                 code = None
#             type = data["type"]
#             if type == "":
#                 type = None
#             depot_code = data["depot_code"]
#             if depot_code == "":
#                 depot_code = None
#             vendor_code = data["vendor_code"]
#             if vendor_code == "":
#                 vendor_code = None
#             depot_name = data["depot_name"]
#             if depot_name == "":
#                 depot_name = None
#             vendor_name = data["vendor_name"]
#             if vendor_name == "":
#                 vendor_name = None
#             automatic_mnr_status_change = data["automatic_mnr_status_change"]
#             if automatic_mnr_status_change == "":
#                 automatic_mnr_status_change = None
#             mnr_module = data["mnr_module"]
#             if mnr_module == "":
#                 mnr_module = None
#             if not "transportation_module" in data.keys():
#                 transportation_module = True
#             else:
#                 transportation_module = data["transportation_module"]
#             location = data["location"]


#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site_object = Site.objects.get(pk=pk)
#             if (
#                 Site.objects.exclude(pk=site_object.pk)
#                 .filter(Q(code=code) | Q(name=name))
#                 .exists()
#             ):
#                 return Response({"errorMsg": "Site already exists"}, status=200)
#             site_object.name = name
#             site_object.location = location_object
#             site_object.address = address
#             site_object.state = state
#             site_object.state_code = state_code
#             site_object.contact = contact
#             site_object.code = code
#             site_object.type = type
#             site_object.depot_code = depot_code
#             site_object.vendor_code = vendor_code
#             site_object.depot_name = depot_name
#             site_object.vendor_name = vendor_name
#             site_object.automatic_mnr_status_change = automatic_mnr_status_change
#             site_object.mnr_module = mnr_module
#             site_object.transportation_module = transportation_module
#             site_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteSiteMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Site.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 site_object = Site.objects.get(pk=pk)
#                 dependent_list = [
#                     site_object.client_site_rel.exists(),
#                     site_object.user_site_rel.exists(),
#                     site_object.billing_site_rel.exists(),
#                     site_object.container_site_rel.exists(),
#                     site_object.non_depot_container_site_rel.exists(),
#                     site_object.handling_charge_site_rel.exists(),
#                     site_object.transportation_charge_site_rel.exists(),
#                     site_object.ground_rent_site_rel.exists(),
#                     site_object.vessel_bkgno_site_rel.exists(),
#                     site_object.loc_code_site_rel.exists(),
#                 ]
#                 if True not in dependent_list:
#                     site_object.delete()
#                 else:
#                     not_deleted.append(site_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddTransporterMaster(views.APIView):
#     """
#     The Post Function will create a new Transporter Entry.

#     """

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             code = data["code"]
#             if code == "":
#                 code = None
#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None
#             transporter_entry = Transporter.create(
#                 name=name, location=location_object, site=site_object, code=code
#             )
#             transporter_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class GetAllTransporterMaster(views.APIView):
#     """
#     The Post Function will get all the entries of Transporter.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]
#             filtered_data = Transporter.objects.select_related("location", "site")
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["transporter_name"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     name__icontains=data["transporter_name"]
#                 )
#             if not len(data["transporter_code"]) == 0:
#                 filtered_data = filtered_data.filter(code=data["transporter_code"])
#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_transporter() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class EditTransporterMaster(views.APIView):
#     """
#     The Get Function will get a entry of Transporter.
#     The Put Function will update a existing Transporter Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             transporter_object = Transporter.objects.get(pk=pk)
#             data = transporter_object.get_transporter()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             code = data["code"]
#             if code == "":
#                 code = None
#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None
#             transporter_object = Transporter.objects.get(pk=pk)
#             transporter_object.name = name
#             transporter_object.location = location_object
#             transporter_object.site = site_object
#             transporter_object.code = code
#             transporter_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteTransporterMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Transporter.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 transporter_object = Transporter.objects.get(pk=pk)
#                 dependent_list = [
#                     transporter_object.gate_in_transporter_rel.exists(),
#                     transporter_object.self_transportation_transporter_rel.exists(),
#                     transporter_object.gate_out_transporter_rel.exists(),
#                 ]
#                 if True not in dependent_list:
#                     transporter_object.delete()
#                 else:
#                     not_deleted.append(transporter_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddSizeMaster(views.APIView):
#     """
#     The Post Function will create a new Size Entry.
#     The Get Function will get all the entries of Size.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             data_list = [
#                 each.get_size_display()
#                 for each in ContainerSize.objects.all().iterator()
#             ]
#             return Response(data_list, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             if ContainerSize.objects.filter(name=data["name"]).exists():
#                 return Response(
#                     {"errorMsg": "ContainerSize already exists"}, status=200
#                 )

#             size_entry = ContainerSize.create(name=name)
#             size_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditSizeMaster(views.APIView):
#     """
#     The Get Function will get a entry of Size.
#     The Put Function will update a existing Size Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             size_object = ContainerSize.objects.get(pk=pk)
#             data = size_object.get_size_display()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             if ContainerSize.objects.filter(name=data["name"]).exists():
#                 return Response(
#                     {"errorMsg": "ContainerSize already exists"}, status=200
#                 )
#             size_object = ContainerSize.objects.get(pk=pk)
#             size_object.name = name
#             size_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteSizeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Size.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 size_object = ContainerSize.objects.get(pk=pk)
#                 dependent_list = [
#                     size_object.container_size_rel.exists(),
#                     size_object.non_depot_container_size_rel.exists(),
#                     size_object.handling_charge_container_size_rel.exists(),
#                     size_object.transportation_charge_container_size_rel.exists(),
#                     size_object.ground_rent_container_size_rel.exists(),
#                     size_object.ts_code_size_rel.exists(),
#                 ]
#                 if True not in dependent_list:
#                     size_object.delete()
#                 else:
#                     not_deleted.append(size_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddTypeMaster(views.APIView):
#     """
#     The Post Function will create a new Type Entry.
#     The Get Function will get all the entries of Type.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             data_list = [
#                 each.get_type_display()
#                 for each in ContainerType.objects.all().iterator()
#             ]
#             return Response(data_list, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             if ContainerType.objects.filter(name=data["name"]).exists():
#                 return Response(
#                     {"errorMsg": "ContainerType already exists"}, status=200
#                 )

#             type_entry = ContainerType.create(name=name)
#             type_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditTypeMaster(views.APIView):
#     """
#     The Get Function will get a entry of Type.
#     The Put Function will update a existing Type Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             type_object = ContainerType.objects.get(pk=pk)
#             data = type_object.get_type_display()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             if ContainerType.objects.filter(name=data["name"]).exists():
#                 return Response(
#                     {"errorMsg": "ContainerType already exists"}, status=200
#                 )
#             type_object = ContainerType.objects.get(pk=pk)
#             type_object.name = name
#             type_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteTypeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Type.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 type_object = ContainerType.objects.get(pk=pk)
#                 dependent_list = [
#                     type_object.container_type_rel.exists(),
#                     type_object.non_depot_container_type_rel.exists(),
#                     type_object.ts_code_type_rel.exists(),
#                 ]
#                 if True not in dependent_list:
#                     type_object.delete()
#                 else:
#                     not_deleted.append(type_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddTypeSizeCodeMaster(views.APIView):
#     """
#     The Post Function will create a new TypeSizeCode Entry.
#     The Get Function will get all the entries of TypeSizeCode.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             all_objects = TypeSizeCode.objects.select_related("type", "size")
#             data_list = [each.get_container_type_size_code() for each in all_objects]
#             return Response(data_list, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["type"] is None:
#                 try:
#                     c_type = ContainerType.objects.get(name=main_data["type"])
#                 except:
#                     c_type = None
#             else:
#                 c_type = main_data["type"]
#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]
#             if TypeSizeCode.objects.filter(
#                 type=c_type, size=c_size, code=main_data["code"]
#             ).exists():
#                 return Response({"errorMsg": "TypeSizeCode already exists"}, status=200)

#             code_object = TypeSizeCode.create(
#                 c_type=c_type, c_size=c_size, code=main_data["code"]
#             )
#             code_object.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditTypeSizeCodeMaster(views.APIView):
#     """
#     The Get Function will get a entry of TypeSizeCode.
#     The Put Function will update a existing TypeSizeCode Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             code_object = TypeSizeCode.objects.get(pk=pk)
#             data = code_object.get_container_type_size_code()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["type"] is None:
#                 try:
#                     c_type = ContainerType.objects.get(name=main_data["type"])
#                 except:
#                     c_type = None
#             else:
#                 c_type = main_data["type"]
#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]
#             if TypeSizeCode.objects.filter(
#                 type=c_type, size=c_size, code=main_data["code"]
#             ).exists():
#                 return Response({"errorMsg": "TypeSizeCode already exists"}, status=200)
#             code_object = TypeSizeCode.objects.get(pk=pk)
#             code_object.type = c_type
#             code_object.size = c_size
#             code_object.code = main_data["code"]
#             code_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteTypeSizeCodeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of TypeSizeCode.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 code_object = TypeSizeCode.objects.get(pk=pk)
#                 code_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetClientMaster(views.APIView):
#     """
#     The post Function will get all the entries of Client.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]

#             filtered_data = Client.objects.select_related("location", "site")
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["client_name"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     name__icontains=data["client_name"]
#                 )

#             if not len(data["ref_code"]) == 0:
#                 filtered_data = filtered_data.filter(ref_code=data["ref_code"])

#             if not len(data["type"]) == 0:
#                 filtered_data = filtered_data.filter(type=data["type"])

#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_client() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except Exception as e:
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetClientDocumentMaster(views.APIView):
#     """
#     The post Function will get all the entries of Client Document.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]
#             filtered_data = ClientDocument.objects.select_related(
#                 "client__location", "client__site", "client"
#             )
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     client__location__name=data["location"]
#                 )
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(client__site__name=data["site"])
#             if not len(data["client_name"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     client__name__icontains=data["client_name"]
#                 )
#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_doc_detail() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddClientDocumentMaster(views.APIView):
#     """
#     The Post Function will create a new client document entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site
#             client_object = Client.objects.get(
#                 name=data["client"], location=location, site=site
#             )
#             document = ClientDocument.create(client=client_object, name=data["name"])
#             document.save()
#             file = data["upload"]
#             location_new = location.name.replace(" ", "_")
#             site_new = site.name.replace(" ", "_")
#             client_new = data["client"].replace(" ", "_")
#             file.name = file.name.replace(" ", "_")
#             upload = upload_client_doc_to_s3(
#                 location=location_new,
#                 site=site_new,
#                 client_name=client_new,
#                 doc_id=document.pk,
#                 file=file,
#             )
#             if upload is True:
#                 return Response({"successMsg": "Data Saved"}, status=200)
#             else:
#                 return Response({"errorMsg": "Not able to save Data"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditClientDocumentMaster(views.APIView):
#     """
#     The Get Function will get a entry of client document.
#     The Put Function will update a existing client document Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             data = ClientDocument.objects.get(pk=pk).get_doc_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             document = ClientDocument.objects.get(pk=pk)
#             upload = data["upload"]
#             if upload == "":
#                 upload = None
#             document.name = data["name"]
#             document.save()
#             if upload is not None:
#                 file = data["upload"]
#                 location_new = document.client.location.name.replace(" ", "_")
#                 site_new = document.client.site.name.replace(" ", "_")
#                 client_new = document.client.name.replace(" ", "_")
#                 file.name = file.name.replace(" ", "_")
#                 upload = upload_client_doc_to_s3(
#                     location=location_new,
#                     site=site_new,
#                     client_name=client_new,
#                     doc_id=document.pk,
#                     file=file,
#                 )
#                 if upload is True:
#                     return Response({"successMsg": "Data Updated"}, status=200)
#                 else:
#                     return Response({"errorMsg": "Not able to Update Data"}, status=200)
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class DownloadClientDocumentMaster(views.APIView):
#     """
#     Get function will download client doc from s3 bucket
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             response = download_client_doc_from_s3(doc_id=pk)
#             return response
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


# class DeleteClientDocumentMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Client Document.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 doc_object = ClientDocument.objects.get(pk=pk)
#                 delete_client_doc_from_s3(doc_id=doc_object.pk)
#                 doc_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddClientMaster(views.APIView):
#     """
#     The Post Function will create a new Client Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             client_data = data["client_data"]
#             client_main_data = none_data_converter(dict_data=client_data)
#             client_representative_main_data = None
#             try:
#                 if data["client_representative_data"]:
#                     client_representative_data = data["client_representative_data"]
#                     client_representative_main_data = [
#                         none_data_converter(dict_data=each)
#                         for each in client_representative_data
#                     ]
#             except:
#                 client_representative_main_data = None

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = client_main_data["location"]
#                 site_str = client_main_data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site
#             if client_main_data["type"] is None:
#                 return Response({"errorMsg": f"Please provide client type"}, status=200)
#             if client_main_data["type"] == "Line":
#                 if (
#                     Client.objects.filter(
#                         name=client_main_data["name"],
#                         location=location,
#                         site=site,
#                         type="Line",
#                     ).exists()
#                     is True
#                 ):
#                     return Response({"errorMsg": f"Client Already exists"}, status=200)
#                 elif (
#                     Client.objects.filter(
#                         name=client_main_data["name"],
#                         location=location,
#                         site=site,
#                         type="Party",
#                     ).exists()
#                     is True
#                 ):
#                     return Response(
#                         {"errorMsg": f"Client Already exists as type Party"}, status=200
#                     )
#                 else:
#                     client_object = Client.create(
#                         name=client_main_data["name"],
#                         alias_name_one=client_main_data["alias_name_one"],
#                         alias_name_two=client_main_data["alias_name_two"],
#                         contact_person=client_main_data["contact_person"],
#                         type=client_main_data["type"],
#                         office_address=client_main_data["office_address"],
#                         city=client_main_data["city"],
#                         state=client_main_data["state"],
#                         zip=client_main_data["zip"],
#                         office_phone_no=client_main_data["office_phone_no"],
#                         mobile_no=client_main_data["mobile_no"],
#                         email_id=client_main_data["email_id"],
#                         website=client_main_data["website"],
#                         fax=client_main_data["fax"],
#                         business_description=client_main_data["business_description"],
#                         notes=client_main_data["notes"],
#                         location=location,
#                         site=site,
#                         cst_no=client_main_data["cst_no"],
#                         service_tax_no=client_main_data["service_tax_no"],
#                         bank_name=client_main_data["bank_name"],
#                         account_name=client_main_data["account_name"],
#                         vat_no=client_main_data["vat_no"],
#                         ecc_no=client_main_data["ecc_no"],
#                         bank_branch=client_main_data["bank_branch"],
#                         account_no=client_main_data["account_no"],
#                         gst_no=client_main_data["gst_no"],
#                         pan_no=client_main_data["pan_no"],
#                         ifsc_code=client_main_data["ifsc_code"],
#                         swift_code=client_main_data["swift_code"],
#                         edi_service=client_main_data["edi_service"],
#                         ref_code=client_main_data["ref_code"],
#                         operator_code=client_main_data["operator_code"],
#                         current_location_code=client_main_data["current_location_code"],
#                         location_code=client_main_data["location_code"],
#                         edi_code=client_main_data["edi_code"],
#                         edi_to_email_id=client_main_data["edi_to_email_id"],
#                         edi_cc_email_id=client_main_data["edi_cc_email_id"],
#                         reported_by_from=client_main_data["reported_by_from"],
#                         reported_by_to=client_main_data["reported_by_to"],
#                     )
#                 client_object.save()
#                 if not client_object.ref_code is None:
#                     client_object.ref_code = client_object.ref_code.upper()
#                     client_object.save()
#                 client_object.create_client_code()
#                 if not client_main_data["shipping_line"] is None:
#                     ClientAbbreviation.objects.get_or_create(
#                         client=client_object, name=client_main_data["shipping_line"]
#                     )
#                 if not client_representative_main_data is None:
#                     for each in client_representative_main_data:
#                         representative = ClientRepresentative.create(
#                             client=client_object,
#                             name=each["name"],
#                             designation=each["designation"],
#                             phone_no=each["phone_no"],
#                             mobile_no=each["mobile_no"],
#                             email_id=each["email_id"],
#                         )
#                         representative.save()
#                 return Response({"successMsg": "Data Saved"}, status=200)
#             elif client_main_data["type"] == "Party":
#                 if (
#                     Client.objects.filter(
#                         name=client_main_data["name"],
#                         location=location,
#                         site=site,
#                         type="Party",
#                     ).exists()
#                     is True
#                 ):
#                     return Response({"errorMsg": f"Client Already exists"}, status=200)
#                 elif (
#                     Client.objects.filter(
#                         name=client_main_data["name"],
#                         location=location,
#                         site=site,
#                         type="Line",
#                     ).exists()
#                     is True
#                 ):
#                     return Response(
#                         {"errorMsg": f"Client Already exists as type Line"}, status=200
#                     )
#                 else:
#                     client_object = Client.create(
#                         name=client_main_data["name"],
#                         alias_name_one=client_main_data["alias_name_one"],
#                         alias_name_two=client_main_data["alias_name_two"],
#                         contact_person=client_main_data["contact_person"],
#                         type=client_main_data["type"],
#                         office_address=client_main_data["office_address"],
#                         city=client_main_data["city"],
#                         state=client_main_data["state"],
#                         zip=client_main_data["zip"],
#                         office_phone_no=client_main_data["office_phone_no"],
#                         mobile_no=client_main_data["mobile_no"],
#                         email_id=client_main_data["email_id"],
#                         website=client_main_data["website"],
#                         fax=client_main_data["fax"],
#                         business_description=client_main_data["business_description"],
#                         notes=client_main_data["notes"],
#                         location=location,
#                         site=site,
#                         cst_no=client_main_data["cst_no"],
#                         service_tax_no=client_main_data["service_tax_no"],
#                         bank_name=client_main_data["bank_name"],
#                         account_name=client_main_data["account_name"],
#                         vat_no=client_main_data["vat_no"],
#                         ecc_no=client_main_data["ecc_no"],
#                         bank_branch=client_main_data["bank_branch"],
#                         account_no=client_main_data["account_no"],
#                         gst_no=client_main_data["gst_no"],
#                         pan_no=client_main_data["pan_no"],
#                         ifsc_code=client_main_data["ifsc_code"],
#                         swift_code=client_main_data["swift_code"],
#                         edi_service=client_main_data["edi_service"],
#                         ref_code=client_main_data["ref_code"],
#                         operator_code=client_main_data["operator_code"],
#                         current_location_code=client_main_data["current_location_code"],
#                         location_code=client_main_data["location_code"],
#                         edi_code=client_main_data["edi_code"],
#                         edi_to_email_id=client_main_data["edi_to_email_id"],
#                         edi_cc_email_id=client_main_data["edi_cc_email_id"],
#                         reported_by_from=client_main_data["reported_by_from"],
#                         reported_by_to=client_main_data["reported_by_to"],
#                     )
#                 client_object.save()
#                 if not client_object.ref_code is None:
#                     client_object.ref_code = client_object.ref_code.upper()
#                     client_object.save()
#                 client_object.create_client_code()
#                 if not client_main_data["shipping_line"] is None:
#                     ClientAbbreviation.objects.get_or_create(
#                         client=client_object, name=client_main_data["shipping_line"]
#                     )
#                 if not client_representative_main_data is None:
#                     for each in client_representative_main_data:
#                         representative = ClientRepresentative.create(
#                             client=client_object,
#                             name=each["name"],
#                             designation=each["designation"],
#                             phone_no=each["phone_no"],
#                             mobile_no=each["mobile_no"],
#                             email_id=each["email_id"],
#                         )
#                         representative.save()
#                 return Response({"successMsg": "Data Saved"}, status=200)
#             else:
#                 pass

#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditClientMaster(views.APIView):
#     """
#     The Get Function will get a entry of Client.
#     The Put Function will update a existing Client Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             client_object = Client.objects.get(pk=pk)
#             data = {
#                 "client_data": client_object.get_client(),
#                 "client_representative_data": [
#                     each.get_representative()
#                     for each in list(
#                         ClientRepresentative.objects.filter(client=client_object)
#                     )
#                 ],
#             }
#             try:
#                 data["client_data"]["shipping_line"] = (
#                     ClientAbbreviation.objects.filter(client=client_object)
#                     .first()
#                     .get_abbreviation_name()
#                 )
#             except:
#                 data["client_data"]["shipping_line"] = ""

#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             client_data = data["client_data"]
#             client_main_data = none_data_converter(dict_data=client_data)
#             client_representative_main_data = None
#             try:
#                 if data["client_representative_data"]:
#                     client_representative_data = data["client_representative_data"]
#                     client_representative_main_data = [
#                         none_data_converter(dict_data=each)
#                         for each in client_representative_data
#                     ]
#             except:
#                 client_representative_main_data = None
#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = client_main_data["location"]
#                 site_str = client_main_data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             if client_main_data["type"] is None:
#                 return Response({"errorMsg": f"Please provide client type"}, status=200)

#             client_object = Client.objects.get(pk=pk)

#             if (
#                 not client_object.name == client_main_data["name"]
#                 or not client_object.type == client_main_data["type"]
#             ):

#                 if client_main_data["type"] == "Line":
#                     if (
#                         Client.objects.filter(
#                             name=client_main_data["name"],
#                             location=location,
#                             site=site,
#                             type="Line",
#                         ).exists()
#                         is True
#                     ):
#                         return Response(
#                             {"errorMsg": f"Client Already exists"}, status=200
#                         )
#                     elif (
#                         Client.objects.filter(
#                             name=client_main_data["name"],
#                             location=location,
#                             site=site,
#                             type="Party",
#                         ).exists()
#                         is True
#                     ):
#                         return Response(
#                             {"errorMsg": f"Client Already exists as type Party"},
#                             status=200,
#                         )
#                     else:
#                         client_object.name = client_main_data["name"]
#                         client_object.alias_name_one = client_main_data[
#                             "alias_name_one"
#                         ]
#                         client_object.alias_name_two = client_main_data[
#                             "alias_name_two"
#                         ]
#                         client_object.contact_person = client_main_data[
#                             "contact_person"
#                         ]
#                         client_object.type = client_main_data["type"]
#                         client_object.office_address = client_main_data[
#                             "office_address"
#                         ]
#                         client_object.city = client_main_data["city"]
#                         client_object.state = client_main_data["state"]
#                         client_object.zip = client_main_data["zip"]
#                         client_object.office_phone_no = client_main_data[
#                             "office_phone_no"
#                         ]
#                         client_object.mobile_no = client_main_data["mobile_no"]
#                         client_object.email_id = client_main_data["email_id"]
#                         client_object.website = client_main_data["website"]
#                         client_object.fax = client_main_data["fax"]
#                         client_object.business_description = client_main_data[
#                             "business_description"
#                         ]
#                         client_object.notes = client_main_data["notes"]
#                         client_object.location = location
#                         client_object.site = site
#                         client_object.cst_no = client_main_data["cst_no"]
#                         client_object.service_tax_no = client_main_data[
#                             "service_tax_no"
#                         ]
#                         client_object.bank_name = client_main_data["bank_name"]
#                         client_object.account_name = client_main_data["account_name"]
#                         client_object.vat_no = client_main_data["vat_no"]
#                         client_object.ecc_no = client_main_data["ecc_no"]
#                         client_object.bank_branch = client_main_data["bank_branch"]
#                         client_object.account_no = client_main_data["account_no"]
#                         client_object.gst_no = client_main_data["gst_no"]
#                         client_object.pan_no = client_main_data["pan_no"]
#                         client_object.ifsc_code = client_main_data["ifsc_code"]
#                         client_object.swift_code = client_main_data["swift_code"]
#                         client_object.edi_service = client_main_data["edi_service"]
#                         client_object.ref_code = client_main_data["ref_code"]
#                         client_object.operator_code = client_main_data["operator_code"]
#                         client_object.current_location_code = client_main_data[
#                             "current_location_code"
#                         ]
#                         client_object.location_code = client_main_data["location_code"]
#                         client_object.edi_code = client_main_data["edi_code"]
#                         client_object.edi_to_email_id = client_main_data[
#                             "edi_to_email_id"
#                         ]
#                         client_object.edi_cc_email_id = client_main_data[
#                             "edi_cc_email_id"
#                         ]
#                         client_object.reported_by_from = client_main_data[
#                             "reported_by_from"
#                         ]
#                         client_object.reported_by_to = client_main_data[
#                             "reported_by_to"
#                         ]
#                         client_object.save()

#                         if not client_object.ref_code is None:
#                             client_object.ref_code = client_object.ref_code.upper()
#                             client_object.save()
#                         if not client_main_data["shipping_line"] is None:
#                             ClientAbbreviation.objects.filter(
#                                 client=client_object
#                             ).update(name=client_main_data["shipping_line"])
#                         if not client_representative_main_data is None:
#                             for each in client_representative_main_data:
#                                 try:
#                                     ClientRepresentative.objects.filter(
#                                         pk=each["pk"]
#                                     ).update(
#                                         name=each["name"],
#                                         designation=each["designation"],
#                                         phone_no=each["phone_no"],
#                                         mobile_no=each["mobile_no"],
#                                         email_id=each["email_id"],
#                                     )
#                                 except:
#                                     representative = ClientRepresentative.create(
#                                         client=client_object,
#                                         name=each["name"],
#                                         designation=each["designation"],
#                                         phone_no=each["phone_no"],
#                                         mobile_no=each["mobile_no"],
#                                         email_id=each["email_id"],
#                                     )
#                                     representative.save()
#                         return Response({"successMsg": "Data Updated"}, status=200)
#                 elif client_main_data["type"] == "Party":
#                     if (
#                         Client.objects.filter(
#                             name=client_main_data["name"],
#                             location=location,
#                             site=site,
#                             type="Party",
#                         ).exists()
#                         is True
#                     ):
#                         return Response(
#                             {"errorMsg": f"Client Already exists"}, status=200
#                         )
#                     elif (
#                         Client.objects.filter(
#                             name=client_main_data["name"],
#                             location=location,
#                             site=site,
#                             type="Line",
#                         ).exists()
#                         is True
#                     ):
#                         return Response(
#                             {"errorMsg": f"Client Already exists as type Line"},
#                             status=200,
#                         )
#                     else:
#                         client_object.name = client_main_data["name"]
#                         client_object.alias_name_one = client_main_data[
#                             "alias_name_one"
#                         ]
#                         client_object.alias_name_two = client_main_data[
#                             "alias_name_two"
#                         ]
#                         client_object.contact_person = client_main_data[
#                             "contact_person"
#                         ]
#                         client_object.type = client_main_data["type"]
#                         client_object.office_address = client_main_data[
#                             "office_address"
#                         ]
#                         client_object.city = client_main_data["city"]
#                         client_object.state = client_main_data["state"]
#                         client_object.zip = client_main_data["zip"]
#                         client_object.office_phone_no = client_main_data[
#                             "office_phone_no"
#                         ]
#                         client_object.mobile_no = client_main_data["mobile_no"]
#                         client_object.email_id = client_main_data["email_id"]
#                         client_object.website = client_main_data["website"]
#                         client_object.fax = client_main_data["fax"]
#                         client_object.business_description = client_main_data[
#                             "business_description"
#                         ]
#                         client_object.notes = client_main_data["notes"]
#                         client_object.location = location
#                         client_object.site = site
#                         client_object.cst_no = client_main_data["cst_no"]
#                         client_object.service_tax_no = client_main_data[
#                             "service_tax_no"
#                         ]
#                         client_object.bank_name = client_main_data["bank_name"]
#                         client_object.account_name = client_main_data["account_name"]
#                         client_object.vat_no = client_main_data["vat_no"]
#                         client_object.ecc_no = client_main_data["ecc_no"]
#                         client_object.bank_branch = client_main_data["bank_branch"]
#                         client_object.account_no = client_main_data["account_no"]
#                         client_object.gst_no = client_main_data["gst_no"]
#                         client_object.pan_no = client_main_data["pan_no"]
#                         client_object.ifsc_code = client_main_data["ifsc_code"]
#                         client_object.swift_code = client_main_data["swift_code"]
#                         client_object.edi_service = client_main_data["edi_service"]
#                         client_object.ref_code = client_main_data["ref_code"]
#                         client_object.operator_code = client_main_data["operator_code"]
#                         client_object.current_location_code = client_main_data[
#                             "current_location_code"
#                         ]
#                         client_object.location_code = client_main_data["location_code"]
#                         client_object.edi_code = client_main_data["edi_code"]
#                         client_object.edi_to_email_id = client_main_data[
#                             "edi_to_email_id"
#                         ]
#                         client_object.edi_cc_email_id = client_main_data[
#                             "edi_cc_email_id"
#                         ]
#                         client_object.reported_by_from = client_main_data[
#                             "reported_by_from"
#                         ]
#                         client_object.reported_by_to = client_main_data[
#                             "reported_by_to"
#                         ]
#                         client_object.save()

#                         if not client_object.ref_code is None:
#                             client_object.ref_code = client_object.ref_code.upper()
#                             client_object.save()
#                         if not client_main_data["shipping_line"] is None:
#                             ClientAbbreviation.objects.filter(
#                                 client=client_object
#                             ).update(name=client_main_data["shipping_line"])
#                         if not client_representative_main_data is None:
#                             for each in client_representative_main_data:
#                                 try:
#                                     ClientRepresentative.objects.filter(
#                                         pk=each["pk"]
#                                     ).update(
#                                         name=each["name"],
#                                         designation=each["designation"],
#                                         phone_no=each["phone_no"],
#                                         mobile_no=each["mobile_no"],
#                                         email_id=each["email_id"],
#                                     )
#                                 except:
#                                     representative = ClientRepresentative.create(
#                                         client=client_object,
#                                         name=each["name"],
#                                         designation=each["designation"],
#                                         phone_no=each["phone_no"],
#                                         mobile_no=each["mobile_no"],
#                                         email_id=each["email_id"],
#                                     )
#                                     representative.save()
#                         return Response({"successMsg": "Data Updated"}, status=200)
#             else:
#                 client_object.name = client_main_data["name"]
#                 client_object.alias_name_one = client_main_data["alias_name_one"]
#                 client_object.alias_name_two = client_main_data["alias_name_two"]
#                 client_object.contact_person = client_main_data["contact_person"]
#                 client_object.type = client_main_data["type"]
#                 client_object.office_address = client_main_data["office_address"]
#                 client_object.city = client_main_data["city"]
#                 client_object.state = client_main_data["state"]
#                 client_object.zip = client_main_data["zip"]
#                 client_object.office_phone_no = client_main_data["office_phone_no"]
#                 client_object.mobile_no = client_main_data["mobile_no"]
#                 client_object.email_id = client_main_data["email_id"]
#                 client_object.website = client_main_data["website"]
#                 client_object.fax = client_main_data["fax"]
#                 client_object.business_description = client_main_data[
#                     "business_description"
#                 ]
#                 client_object.notes = client_main_data["notes"]
#                 client_object.location = location
#                 client_object.site = site
#                 client_object.cst_no = client_main_data["cst_no"]
#                 client_object.service_tax_no = client_main_data["service_tax_no"]
#                 client_object.bank_name = client_main_data["bank_name"]
#                 client_object.account_name = client_main_data["account_name"]
#                 client_object.vat_no = client_main_data["vat_no"]
#                 client_object.ecc_no = client_main_data["ecc_no"]
#                 client_object.bank_branch = client_main_data["bank_branch"]
#                 client_object.account_no = client_main_data["account_no"]
#                 client_object.gst_no = client_main_data["gst_no"]
#                 client_object.pan_no = client_main_data["pan_no"]
#                 client_object.ifsc_code = client_main_data["ifsc_code"]
#                 client_object.swift_code = client_main_data["swift_code"]
#                 client_object.edi_service = client_main_data["edi_service"]
#                 client_object.ref_code = client_main_data["ref_code"]
#                 client_object.operator_code = client_main_data["operator_code"]
#                 client_object.current_location_code = client_main_data[
#                     "current_location_code"
#                 ]
#                 client_object.location_code = client_main_data["location_code"]
#                 client_object.edi_code = client_main_data["edi_code"]
#                 client_object.edi_to_email_id = client_main_data["edi_to_email_id"]
#                 client_object.edi_cc_email_id = client_main_data["edi_cc_email_id"]
#                 client_object.reported_by_from = client_main_data["reported_by_from"]
#                 client_object.reported_by_to = client_main_data["reported_by_to"]
#                 client_object.save()

#                 if not client_object.ref_code is None:
#                     client_object.ref_code = client_object.ref_code.upper()
#                     client_object.save()
#                 if not client_main_data["shipping_line"] is None:
#                     ClientAbbreviation.objects.filter(client=client_object).update(
#                         name=client_main_data["shipping_line"]
#                     )
#                 if not client_representative_main_data is None:
#                     for each in client_representative_main_data:
#                         try:
#                             ClientRepresentative.objects.filter(pk=each["pk"]).update(
#                                 name=each["name"],
#                                 designation=each["designation"],
#                                 phone_no=each["phone_no"],
#                                 mobile_no=each["mobile_no"],
#                                 email_id=each["email_id"],
#                             )
#                         except:
#                             representative = ClientRepresentative.create(
#                                 client=client_object,
#                                 name=each["name"],
#                                 designation=each["designation"],
#                                 phone_no=each["phone_no"],
#                                 mobile_no=each["mobile_no"],
#                                 email_id=each["email_id"],
#                             )
#                             representative.save()
#                 return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class DeleteClientMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Client.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 client_object = Client.objects.get(pk=pk)
#                 dependent_list = [
#                     client_object.client_invoice_rel.exists(),
#                     client_object.container_client_rel.exists(),
#                     client_object.non_depot_container_client_rel.exists(),
#                     client_object.handling_client_rel.exists(),
#                     client_object.self_transportation_client_rel.exists(),
#                     client_object.client_representative_rel.exists(),
#                     client_object.client_document_rel.exists(),
#                     client_object.client_handling_charge_rel.exists(),
#                     client_object.client_transportation_charge_rel.exists(),
#                 ]
#                 if True not in dependent_list:
#                     client_object.delete()
#                 else:
#                     not_deleted.append(client_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAllHandlingChargeMaster(views.APIView):
#     """
#     The Get Function will get all the entries of HandlingCharge according to filter.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]
#             filtered_data = HandlingCharge.objects.select_related(
#                 "client", "location", "site"
#             )
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["client_name"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     client__name__icontains=data["client_name"]
#                 )
#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()

#             response_data = [each.get_charge_detail() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddHandlingChargeMaster(views.APIView):
#     """
#     The Post Function will create a new HandlingCharge Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def validate_data(self, main_data):
#         try:
#             mandatory_list = [
#                 main_data["client"],
#                 main_data["size"],
#                 main_data["location"],
#                 main_data["site"],
#                 main_data["type"],
#                 main_data["rate_of"],
#                 main_data["amount"],
#             ]

#             if HandlingCharge.objects.filter(
#                 rate_of=main_data["rate_of"],
#                 client__name=main_data["client"],
#                 type=main_data["type"],
#                 size__name=main_data["size"],
#                 location__name=main_data["location"],
#                 site__name=main_data["site"],
#             ).exists():
#                 return {"errorMsg": "HandlingCharge already exists"}

#             if None in mandatory_list:
#                 return {"errorMsg": "Please Provide General Mandatory Data"}

#             return main_data
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return {"errorMsg": f"Invalid credentials [{e}]"}

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["client"] is None:
#                 try:
#                     client = Client.objects.get(
#                         name=main_data["client"],
#                         location__name=main_data["location"],
#                         site__name=main_data["site"],
#                     )
#                 except:
#                     client = None
#             else:
#                 client = main_data["client"]

#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]

#             self.validate_data(main_data)

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             charge_object = HandlingCharge.create(
#                 client=client,
#                 type=main_data["type"],
#                 rate_of=main_data["rate_of"],
#                 location=location,
#                 site=site,
#                 size=c_size,
#                 amount=float(main_data["amount"]),
#             )
#             charge_object.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditHandlingChargeMaster(views.APIView):
#     """
#     The Get Function will get a entry of HandlingCharge.
#     The Put Function will update a existing HandlingCharge Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def validate_data(self, main_data):
#         try:
#             mandatory_list = [
#                 main_data["client"],
#                 main_data["size"],
#                 main_data["location"],
#                 main_data["site"],
#                 main_data["type"],
#                 main_data["rate_of"],
#                 main_data["amount"],
#             ]

#             if HandlingCharge.objects.filter(
#                 rate_of=main_data["rate_of"],
#                 client__name=main_data["client"],
#                 type=main_data["type"],
#                 size__name=main_data["size"],
#                 location__name=main_data["location"],
#                 site__name=main_data["site"],
#             ).exists():
#                 return {"errorMsg": "HandlingCharge already exists"}

#             if None in mandatory_list:
#                 return {"errorMsg": "Please Provide General Mandatory Data"}

#             return main_data
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return {"errorMsg": f"Invalid credentials [{e}]"}

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             charge_object = HandlingCharge.objects.get(pk=pk)
#             data = charge_object.get_charge_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["client"] is None:
#                 try:
#                     client = Client.objects.get(
#                         name=main_data["client"],
#                         location__name=main_data["location"],
#                         site__name=main_data["site"],
#                     )
#                 except:
#                     client = None
#             else:
#                 client = main_data["client"]

#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]

#             self.validate_data(main_data)

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             HandlingCharge.objects.filter(pk=pk).update(
#                 client=client,
#                 type=main_data["type"],
#                 rate_of=main_data["rate_of"],
#                 location=location,
#                 site=site,
#                 size=c_size,
#                 amount=float(main_data["amount"]),
#             )
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteHandlingChargeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of HandlingCharge.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 charge_object = HandlingCharge.objects.get(pk=pk)
#                 charge_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAllTransportationChargeMaster(views.APIView):
#     """
#     The Get Function will get all the entries of Transportation Charge according to filter.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]
#             filtered_data = TransportationCharge.objects.select_related(
#                 "client", "location", "site"
#             )
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["client_name"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     client__name__icontains=data["client_name"]
#                 )
#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_charge_detail() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddTransportationChargeMaster(views.APIView):
#     """
#     The Post Function will create a new TransportationCharge Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def validate_data(self, main_data):
#         try:
#             mandatory_list = [
#                 main_data["client"],
#                 main_data["size"],
#                 main_data["location"],
#                 main_data["site"],
#                 main_data["type"],
#                 main_data["rate_of"],
#                 main_data["amount"],
#             ]

#             if TransportationCharge.objects.filter(
#                 client__name=main_data["client"],
#                 type=main_data["type"],
#                 size__name=main_data["size"],
#                 location__name=main_data["location"],
#                 site__name=main_data["site"],
#             ).exists():
#                 return {"errorMsg": "TransportationCharge already exists"}

#             if None in mandatory_list:
#                 return {"errorMsg": "Please Provide Mandatory Data"}

#             return main_data
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return {"errorMsg": f"Invalid credentials [{e}]"}

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["client"] is None:
#                 try:
#                     client = Client.objects.get(
#                         name=main_data["client"],
#                         location__name=main_data["location"],
#                         site__name=main_data["site"],
#                     )
#                 except:
#                     client = None
#             else:
#                 client = main_data["client"]

#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]

#             self.validate_data(data)

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             charge_object = TransportationCharge.create(
#                 client=client,
#                 type=main_data["type"],
#                 location=location,
#                 site=site,
#                 size=c_size,
#                 amount=float(main_data["amount"]),
#             )
#             charge_object.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditTransportationChargeMaster(views.APIView):
#     """
#     The Get Function will get a entry of TransportationCharge.
#     The Put Function will update a existing TransportationCharge Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def validate_data(self, main_data):
#         try:
#             mandatory_list = [
#                 main_data["client"],
#                 main_data["size"],
#                 main_data["location"],
#                 main_data["site"],
#                 main_data["type"],
#                 main_data["rate_of"],
#                 main_data["amount"],
#             ]

#             if TransportationCharge.objects.filter(
#                 client__name=main_data["client"],
#                 type=main_data["type"],
#                 size__name=main_data["size"],
#                 location__name=main_data["location"],
#                 site__name=main_data["site"],
#             ).exists():
#                 return {"errorMsg": "TransportationCharge already exists"}

#             if None in mandatory_list:
#                 return {"errorMsg": "Please Provide Mandatory Data"}

#             return main_data
#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return {"errorMsg": f"Invalid credentials [{e}]"}

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             charge_object = TransportationCharge.objects.get(pk=pk)
#             data = charge_object.get_charge_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["client"] is None:
#                 try:
#                     client = Client.objects.get(
#                         name=main_data["client"],
#                         location__name=main_data["location"],
#                         site__name=main_data["site"],
#                     )
#                 except:
#                     client = None
#             else:
#                 client = main_data["client"]

#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]

#             self.validate_data(main_data)

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             TransportationCharge.objects.filter(pk=pk).update(
#                 client=client,
#                 type=main_data["type"],
#                 location=location,
#                 site=site,
#                 size=c_size,
#                 amount=float(main_data["amount"]),
#             )
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteTransportationChargeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of TransportationCharge.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 charge_object = TransportationCharge.objects.get(pk=pk)
#                 charge_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAllGroundRentMaster(views.APIView):
#     """
#     The Get Function will get all the entries of Ground Rent according to filter.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]
#             filtered_data = GroundRent.objects.select_related("location", "site")
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["client_ref_code"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     client_ref_code=data["client_ref_code"]
#                 )
#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_ground_rent_detail() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddGroundRentMaster(views.APIView):
#     """
#     The Post Function will create a new Ground Rent Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)
#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             if main_data["day_1_to_30_amount"] is None:
#                 main_data["day_1_to_30_amount"] = 0

#             if main_data["day_31_to_60_amount"] is None:
#                 main_data["day_31_to_60_amount"] = 0

#             if main_data["day_61_to_90_amount"] is None:
#                 main_data["day_61_to_90_amount"] = 0

#             if main_data["day_91_to_120_amount"] is None:
#                 main_data["day_91_to_120_amount"] = 0

#             if main_data["day_over_120_amount"] is None:
#                 main_data["day_over_120_amount"] = 0

#             try:
#                 GroundRent.objects.get(
#                     client_ref_code=main_data["client_ref_code"],
#                     location=location,
#                     site=site,
#                     size=c_size,
#                 )
#                 return Response({"errorMsg": f"Data already exist"}, status=200)
#             except:
#                 rent_object = GroundRent.create(
#                     client_ref_code=main_data["client_ref_code"],
#                     location=location,
#                     site=site,
#                     size=c_size,
#                     day_1_to_30_amount=main_data["day_1_to_30_amount"],
#                     day_31_to_60_amount=main_data["day_31_to_60_amount"],
#                     day_61_to_90_amount=main_data["day_61_to_90_amount"],
#                     day_91_to_120_amount=main_data["day_91_to_120_amount"],
#                     day_over_120_amount=main_data["day_over_120_amount"],
#                 )
#                 rent_object.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditGroundRentMaster(views.APIView):
#     """
#     The Get Function will get a entry of Ground Rent.
#     The Put Function will update a existing Ground Rent Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             rent_object = GroundRent.objects.get(pk=pk)
#             data = rent_object.get_ground_rent_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             main_data = none_data_converter(dict_data=data)

#             if not main_data["size"] is None:
#                 try:
#                     c_size = ContainerSize.objects.get(name=main_data["size"])
#                 except:
#                     c_size = None
#             else:
#                 c_size = main_data["size"]

#             user = request.user
#             app_user = AccountUser.objects.get(username=user.username)
#             try:
#                 location_str = data["location"]
#                 site_str = data["site"]
#                 location = Location.objects.get(name=location_str)
#                 site = Site.objects.get(name=site_str)
#             except:
#                 location = app_user.location
#                 site = app_user.site

#             if main_data["day_1_to_30_amount"] is None:
#                 main_data["day_1_to_30_amount"] = 0

#             if main_data["day_31_to_60_amount"] is None:
#                 main_data["day_31_to_60_amount"] = 0

#             if main_data["day_61_to_90_amount"] is None:
#                 main_data["day_61_to_90_amount"] = 0

#             if main_data["day_91_to_120_amount"] is None:
#                 main_data["day_91_to_120_amount"] = 0

#             if main_data["day_over_120_amount"] is None:
#                 main_data["day_over_120_amount"] = 0
#             GroundRent.objects.filter(pk=pk).update(
#                 client_ref_code=main_data["client_ref_code"],
#                 location=location,
#                 site=site,
#                 size=c_size,
#                 day_1_to_30_amount=main_data["day_1_to_30_amount"],
#                 day_31_to_60_amount=main_data["day_31_to_60_amount"],
#                 day_61_to_90_amount=main_data["day_61_to_90_amount"],
#                 day_91_to_120_amount=main_data["day_91_to_120_amount"],
#                 day_over_120_amount=main_data["day_over_120_amount"],
#             )
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteGroundRentMaster(views.APIView):
#     """
#     The Get Function will delete a entry of Ground Rent.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 rent_object = GroundRent.objects.get(pk=pk)
#                 rent_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAllVesselBkgNoMaster(views.APIView):
#     """
#     The Post Function will get all the entries of VesselBkgNo.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = data.get("pg_no", None)
#             on_page_data = data.get("on_page_data", None)
#             filtered_data = VesselBkgNo.objects.select_related("location", "site")
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["number"]) == 0:
#                 filtered_data = filtered_data.filter(number=data["number"])
#             if not len(data["from_date"]) == 0 and not len(data["to_date"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     date__range=[data["from_date"], data["to_date"]]
#                 )

#             if pg_no is not None and on_page_data is not None:
#                 # Pagination
#                 paginator = Paginator(filtered_data, on_page_data)
#                 no_of_data_count = paginator.count
#                 no_of_pages = paginator.num_pages
#                 current_page = paginator.page(pg_no)
#                 on_page_data_count = (
#                     current_page.end_index() - current_page.start_index() + 1
#                 )
#                 prev_page = ""
#                 if current_page.has_previous():
#                     prev_page = current_page.previous_page_number()
#                 next_page = ""
#                 if current_page.has_next():
#                     next_page = current_page.next_page_number()
#                 response_data = [each.get_vessel_bkgno() for each in current_page]
#                 return Response(
#                     {
#                         "no_of_data": no_of_data_count,
#                         "on_page_data": on_page_data_count,
#                         "total_pages": no_of_pages,
#                         "prev_page": prev_page,
#                         "next_page": next_page,
#                         "data": response_data,
#                     },
#                     status=200,
#                 )
#             else:
#                 response_data = [each.get_vessel_bkgno() for each in filtered_data]
#                 return Response(
#                     {
#                         "data": response_data,
#                     },
#                     status=200,
#                 )
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class AddVesselBkgNoMaster(views.APIView):
#     """
#     The Post Function will create a new VesselBkgNo Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             date_str = data["date"]
#             if len(date_str) == 0:
#                 date = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .date()
#                 )
#             else:
#                 date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

#             number = data["number"]
#             if number == "":
#                 number = None
#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None
#             vessel_bkgno_entry = VesselBkgNo.create(
#                 date=date, number=number, location=location_object, site=site_object
#             )
#             vessel_bkgno_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditVesselBkgNoMaster(views.APIView):
#     """
#     The Get Function will get a entry of VesselBkgNo.
#     The Put Function will update a existing VesselBkgNo Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             vessel_bkgno_object = VesselBkgNo.objects.get(pk=pk)
#             data = vessel_bkgno_object.get_vessel_bkgno()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             date_str = data["date"]
#             if len(date_str) == 0:
#                 date = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .date()
#                 )
#             else:
#                 date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

#             number = data["number"]
#             if number == "":
#                 number = None
#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None
#             vessel_bkgno_object = VesselBkgNo.objects.get(pk=pk)
#             vessel_bkgno_object.date = date
#             vessel_bkgno_object.number = number
#             vessel_bkgno_object.location_object = location_object
#             vessel_bkgno_object.site_object = site_object
#             vessel_bkgno_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class DeleteVesselBkgNoMaster(views.APIView):
#     """
#     The Get Function will delete a entry of VesselBkgNo.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 vessel_bkgno_object = VesselBkgNo.objects.get(pk=pk)
#                 dependent_list = [vessel_bkgno_object.vessel_voyage_bkgno_rel.exists()]
#                 if True not in dependent_list:
#                     vessel_bkgno_object.delete()
#                 else:
#                     not_deleted.append(vessel_bkgno_object.number)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAllVesselVoyageDetailMaster(views.APIView):
#     """
#     The Post Function will get all the entries of VesselVoyageDetail.
#     """

#     permission_classes = (IsAuthenticated,)

#     @cache_api_view(key="voyage_detail", time=86400)
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = data.get("pg_no", None)
#             on_page_data = data.get("on_page_data", None)
#             filtered_data = VesselVoyageDetail.objects.select_related(
#                 "location", "site", "bkg"
#             )
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["booking_no"]) == 0:
#                 filtered_data = filtered_data.filter(bkg__number=data["booking_no"])
#             if not len(data["vessel_name"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     vessel_name__icontains=data["vessel_name"]
#                 )
#             if not len(data["vessel_voyage"]) == 0:
#                 filtered_data = filtered_data.filter(
#                     vessel_voyage=data["vessel_voyage"]
#                 )
#             if not len(data["voyage_no"]) == 0:
#                 filtered_data = filtered_data.filter(voyage_no=data["voyage_no"])

#             if pg_no is not None and on_page_data is not None:
#                 # Pagination
#                 paginator = Paginator(filtered_data, on_page_data)
#                 no_of_data_count = paginator.count
#                 no_of_pages = paginator.num_pages
#                 current_page = paginator.page(pg_no)
#                 on_page_data_count = (
#                     current_page.end_index() - current_page.start_index() + 1
#                 )
#                 prev_page = ""
#                 if current_page.has_previous():
#                     prev_page = current_page.previous_page_number()
#                 next_page = ""
#                 if current_page.has_next():
#                     next_page = current_page.next_page_number()
#                 response_data = [
#                     each.get_vessel_voyage_detail() for each in current_page
#                 ]
#                 return Response(
#                     {
#                         "no_of_data": no_of_data_count,
#                         "on_page_data": on_page_data_count,
#                         "total_pages": no_of_pages,
#                         "prev_page": prev_page,
#                         "next_page": next_page,
#                         "data": response_data,
#                     },
#                     status=200,
#                 )
#             else:
#                 response_data = [
#                     each.get_vessel_voyage_detail() for each in filtered_data
#                 ]
#                 return Response(
#                     {
#                         "data": response_data,
#                     },
#                     status=200,
#                 )

#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class AddVesselVoyageDetailMaster(views.APIView):
#     """
#     The Post Function will create a new VesselVoyageDetail Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             booking_no = data["booking_no"]
#             if booking_no == "":
#                 booking_no = None
#             else:
#                 booking_no = VesselBkgNo.objects.get(number=data["booking_no"])

#             vessel_voyage_name = data["vessel_voyage_name"]
#             if vessel_voyage_name == "":
#                 vessel_voyage_name = None

#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             vessel_voyage_list = vessel_voyage_name.split("-")
#             vessel_name = vessel_voyage_list[0]
#             voyage_no = vessel_voyage_list[1]

#             if len(vessel_name) == 0 or len(voyage_no) == 0:
#                 return Response(
#                     {"errorMsg": f"Please Provide VesselName and VoyageNo Both"},
#                     status=200,
#                 )

#             vessel_voyage_detail = VesselVoyageDetail.create(
#                 bkg=booking_no,
#                 vessel_voyage=vessel_voyage_name,
#                 vessel_name=vessel_name,
#                 voyage_no=voyage_no,
#                 location=location_object,
#                 site=site_object,
#             )
#             vessel_voyage_detail.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditVesselVoyageDetailMaster(views.APIView):
#     """
#     The Get Function will get a entry of VesselVoyageDetail.
#     The Put Function will update a existing VesselVoyageDetail Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             vessel_voyage_detail_object = VesselVoyageDetail.objects.get(pk=pk)
#             data = vessel_voyage_detail_object.get_vessel_voyage_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             booking_no = data["booking_no"]
#             if booking_no == "":
#                 booking_no = None
#             else:
#                 booking_no = VesselBkgNo.objects.get(number=data["booking_no"])

#             vessel_voyage_name = data["vessel_voyage_name"]
#             if vessel_voyage_name == "":
#                 vessel_voyage_name = None

#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             vessel_voyage_list = vessel_voyage_name.split("-")
#             vessel_name = vessel_voyage_list[0]
#             voyage_no = vessel_voyage_list[1]

#             if len(vessel_name) == 0 or len(voyage_no) == 0:
#                 return Response(
#                     {"errorMsg": f"Please Provide VesselName and VoyageNo Both"},
#                     status=200,
#                 )

#             vessel_voyage_detail_object = VesselVoyageDetail.objects.get(pk=pk)

#             for each in GateInHistory.objects.select_related(
#                 "container", "gate_in"
#             ).filter(
#                 gate_in__vessel_name=vessel_voyage_detail_object.vessel_name,
#                 gate_in__voyage_no=vessel_voyage_detail_object.voyage_no,
#             ):
#                 each.gate_in.do_ref = booking_no.number
#                 each.gate_in.vessel_name = vessel_name
#                 each.gate_in.voyage_no = voyage_no
#                 each.gate_in.save()

#             vessel_voyage_detail_object.bkg = booking_no
#             vessel_voyage_detail_object.vessel_voyage = vessel_voyage_name
#             vessel_voyage_detail_object.vessel_name = vessel_name
#             vessel_voyage_detail_object.voyage_no = voyage_no
#             vessel_voyage_detail_object.location = location_object
#             vessel_voyage_detail_object.site = site_object
#             vessel_voyage_detail_object.save()

#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class DeleteVesselVoyageDetailMaster(views.APIView):
#     """
#     The Get Function will delete a entry of VesselVoyageDetail.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 vessel_voyage_detail_object = VesselVoyageDetail.objects.get(pk=pk)
#                 vessel_voyage_detail_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAllLocationCodeDetailMaster(views.APIView):
#     """
#     The Post Function will get all the entries of LocationCodeDetail.
#     """

#     permission_classes = (IsAuthenticated,)

#     @cache_api_view("location_code", time=86400)
#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = data.get("pg_no", None)
#             on_page_data = data.get("on_page_data", None)
#             filtered_data = LocationCodeDetail.objects.select_related(
#                 "location", "site"
#             )
#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["type"]) == 0:
#                 filtered_data = filtered_data.filter(type=data["type"])
#             if not len(data["name_code"]) == 0:
#                 filtered_data = filtered_data.filter(name_code=data["name_code"])
#             if not len(data["name"]) == 0:
#                 filtered_data = filtered_data.filter(name__icontains=data["name"])
#             if not len(data["code"]) == 0:
#                 filtered_data = filtered_data.filter(code=data["code"])

#             if pg_no is not None and on_page_data is not None:
#                 # Pagination
#                 paginator = Paginator(filtered_data, on_page_data)
#                 no_of_data_count = paginator.count
#                 no_of_pages = paginator.num_pages
#                 current_page = paginator.page(pg_no)
#                 on_page_data_count = (
#                     current_page.end_index() - current_page.start_index() + 1
#                 )
#                 prev_page = ""
#                 if current_page.has_previous():
#                     prev_page = current_page.previous_page_number()
#                 next_page = ""
#                 if current_page.has_next():
#                     next_page = current_page.next_page_number()
#                 response_data = [
#                     each.get_location_code_detail() for each in current_page
#                 ]
#                 return Response(
#                     {
#                         "no_of_data": no_of_data_count,
#                         "on_page_data": on_page_data_count,
#                         "total_pages": no_of_pages,
#                         "prev_page": prev_page,
#                         "next_page": next_page,
#                         "data": response_data,
#                     },
#                     status=200,
#                 )
#             else:
#                 response_data = [
#                     each.get_location_code_detail() for each in filtered_data
#                 ]
#                 return Response(
#                     {
#                         "data": response_data,
#                     },
#                     status=200,
#                 )
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class AddLocationCodeDetailMaster(views.APIView):
#     """
#     The Post Function will create a new LocationCodeDetail Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data

#             name_code = data["name_code"]
#             if name_code == "":
#                 name_code = None

#             type = data["type"]
#             if type == "":
#                 type = None

#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             name_code_list = name_code.split("-")
#             name = name_code_list[0]
#             code = name_code_list[1]

#             location_code_detail_entry = LocationCodeDetail.create(
#                 name_code=name_code,
#                 name=name,
#                 code=code,
#                 type=type,
#                 location=location_object,
#                 site=site_object,
#             )
#             location_code_detail_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditLocationCodeDetailMaster(views.APIView):
#     """
#     The Get Function will get a entry of LocationCodeDetail.
#     The Put Function will update a existing LocationCodeDetail Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             location_code_detail_object = LocationCodeDetail.objects.get(pk=pk)
#             data = location_code_detail_object.get_location_code_detail()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name_code = data["name_code"]
#             if name_code == "":
#                 name_code = None

#             type = data["type"]
#             if type == "":
#                 type = None

#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             name_code_list = name_code.split("-")
#             name = name_code_list[0]
#             code = name_code_list[1]

#             location_code_detail_object = LocationCodeDetail.objects.get(pk=pk)
#             location_code_detail_object.name_code = name_code
#             location_code_detail_object.name = name
#             location_code_detail_object.code = code
#             location_code_detail_object.type = type
#             location_code_detail_object.location = location_object
#             location_code_detail_object.site = site_object
#             location_code_detail_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class DeleteLocationCodeDetailMaster(views.APIView):
#     """
#     The Get Function will delete a entry of LocationCodeDetail.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 location_code_detail_object = LocationCodeDetail.objects.get(pk=pk)
#                 location_code_detail_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddExportCargoTypeMaster(views.APIView):
#     """
#     The Post Function will create a new Export Cargo Type Entry.
#     The Get Function will get all the entries of Export Cargo Type.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, *args, **kwargs):
#         try:
#             data_list = [
#                 each.get_export_cargo_type_display()
#                 for each in ExportCargoType.objects.all().iterator()
#             ]
#             return Response(data_list, status=200)
#         except:
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             if ExportCargoType.objects.filter(name=data["name"]).exists():
#                 return Response(
#                     {"errorMsg": "ExportCargoType already exists"}, status=200
#                 )

#             export_cargo_type_entry = ExportCargoType.create(name=name)
#             export_cargo_type_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditExportCargoTypeMaster(views.APIView):
#     """
#     The Get Function will get a entry of Export Cargo Type.
#     The Put Function will update a existing Export Cargo Type Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             export_cargo_type_object = ExportCargoType.objects.get(pk=pk)
#             data = export_cargo_type_object.get_export_cargo_type_display()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             name = data["name"]
#             if name == "":
#                 name = None
#             if ExportCargoType.objects.filter(name=data["name"]).exists():
#                 return Response(
#                     {"errorMsg": "ExportCargoType already exists"}, status=200
#                 )
#             export_cargo_type_object = ExportCargoType.objects.get(pk=pk)
#             export_cargo_type_object.name = name
#             export_cargo_type_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteExportCargoTypeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of  Export Cargo Type.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 export_cargo_type_object = ExportCargoType.objects.get(pk=pk)
#                 dependent_list = [
#                     export_cargo_type_object.gate_in_export_cargo.exists()
#                 ]
#                 if True not in dependent_list:
#                     export_cargo_type_object.delete()
#                 else:
#                     not_deleted.append(export_cargo_type_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddRefCodeMaster(views.APIView):
#     """
#     The Post Function will create a new RefCode Entry.

#     """

#     def get(self, request, *args, **kwargs):
#         try:
#             data = [
#                 each.get_ref_code_data()
#                 for each in RefCodeMaster.objects.all().iterator()
#             ]
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             ref_code = data["ref_code"]
#             if RefCodeMaster.objects.filter(ref_code=data["ref_code"]).exists():
#                 return Response({"errorMsg": "RefCode already exists"}, status=200)

#             if not Client.objects.filter(ref_code=ref_code.upper()).exists():
#                 RefCodeMaster.create(ref_code=ref_code.upper())
#                 return Response({"successMsg": "Data Saved"}, status=200)

#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class EditRefCodeMaster(views.APIView):
#     """
#     The Get Function will get a entry of RefCode.
#     The Put Function will update a existing RefCode Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             ref_code_object = RefCodeMaster.objects.get(pk=pk)
#             data = ref_code_object.get_ref_code_data()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             ref_code = data["ref_code"]
#             if RefCodeMaster.objects.filter(ref_code=data["ref_code"]).exists():
#                 return Response({"errorMsg": "RefCode already exists"}, status=200)
#             if not Client.objects.filter(ref_code=ref_code.upper()).exists():
#                 ref_code_object = RefCodeMaster.objects.get(pk=pk)
#                 ref_code_object.ref_code = ref_code.upper()
#                 ref_code_object.save()
#                 return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteRefCodeMaster(views.APIView):
#     """
#     The Get Function will delete a entry of RefCode.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             not_deleted = []
#             for pk in data:
#                 ref_code_object = RefCodeMaster.objects.get(pk=pk)
#                 dependent_list = [
#                     Client.objects.filter(ref_code=ref_code_object.ref_code).exists()
#                 ]
#                 if True not in dependent_list:
#                     ref_code_object.delete()
#                 else:
#                     not_deleted.append(ref_code_object.name)
#             if not len(not_deleted) == 0:
#                 return Response(
#                     {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
#                     status=200,
#                 )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddCarrierCodeMaster(views.APIView):
#     """
#     The Post Function will create a new Carrier Code Entry.

#     """

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             code = data["code"]
#             if code == "":
#                 code = None
#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             if CarrierCode.objects.filter(code=data["code"]).exists():
#                 return Response({"errorMsg": "CarrierCode already exists"}, status=200)

#             carrier_code_entry = CarrierCode.create(
#                 location=location_object, site=site_object, code=code
#             )
#             carrier_code_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class GetAllCarrierCodeMaster(views.APIView):
#     """
#     The Post Function will get all the entries of Carrier Code.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = request.data["pg_no"]
#             on_page_data = request.data["on_page_data"]
#             filtered_data = CarrierCode.objects.select_related("location", "site")

#             if not len(data["location"]) == 0:
#                 filtered_data = filtered_data.filter(location__name=data["location"])
#             if not len(data["site"]) == 0:
#                 filtered_data = filtered_data.filter(site__name=data["site"])
#             if not len(data["code"]) == 0:
#                 filtered_data = filtered_data.filter(code=data["code"])

#             # Pagination
#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_carrier_code() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class EditCarrierCodeMaster(views.APIView):
#     """
#     The Get Function will get a entry of Carrier Code.
#     The Put Function will update a existing Carrier Code Entry.
#     """

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             carrier_code_object = CarrierCode.objects.get(pk=pk)
#             data = carrier_code_object.get_carrier_code()
#             return Response(data, status=200)
#         except:
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             code = data["code"]
#             if code == "":
#                 code = None

#             location = data["location"]
#             if CarrierCode.objects.filter(code=data["code"]).exists():
#                 return Response({"errorMsg": "CarrierCode already exists"}, status=200)
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             carrier_code_object = CarrierCode.objects.get(pk=pk)
#             carrier_code_object.location = location_object
#             carrier_code_object.site = site_object
#             carrier_code_object.code = code
#             carrier_code_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class DeleteCarrierCodeMaster(views.APIView):
#     """
#     The post Function will delete a entry of Carrier Code.
#     """

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 carrier_code_object = CarrierCode.objects.get(pk=pk)
#                 carrier_code_object.delete()
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class AddSealNoMaster(views.APIView):

#     """The Post function will create new Seal Number"""

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data

#             number = data["number"]
#             if number == "":
#                 return Response({"errorMsg": "Please provide Seal No"}, status=200)

#             line = data["line"]
#             if line == "":
#                 return Response({"errorMsg": "Please provide Line"}, status=200)

#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             in_date = None
#             in_time = None
#             in_date_str = data["in_date"]
#             if len(in_date_str) == 0:
#                 in_date = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .date()
#                 )
#             else:
#                 try:
#                     in_date = datetime.datetime.strptime(in_date_str, "%Y-%m-%d").date()
#                 except:
#                     in_date = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .date()
#                     )

#             in_time_str = data["in_time"]
#             if len(in_time_str) == 0:
#                 in_time = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .time()
#                 )
#             else:
#                 try:
#                     in_time = datetime.datetime.strptime(in_time_str, "%H:%M").time()
#                 except:
#                     in_time = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                     )

#             in_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
#                 timezone.get_current_timezone()
#             )

#             if (
#                 SealNo.objects.filter(number=number).exists()
#                 or ContainerStock.objects.filter(seal_no=number).exists()
#                 or GateOut.objects.filter(seal_no=number).exists()
#             ):
#                 return Response({"errorMsg": "Seal NO already exists"})

#             seal_no_entry = SealNo.create(
#                 number=number,
#                 location=location_object,
#                 site=site_object,
#                 line=line,
#                 in_date=in_date_time,
#             )
#             seal_no_entry.save()
#             return Response({"successMsg": "Data Saved"}, status=200)

#         except Exception as e:
#             return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


# class GetAllSealNoMaster(views.APIView):

#     """The Post method will get all entries of Seal numbers"""

#     permission_classes = (IsAuthenticated,)

#     def get_date_range(start_date, end_date):
#         try:
#             date_range = []
#             delta = end_date - start_date
#             for i in range(delta.days + 1):
#                 day = start_date + timedelta(days=i)
#                 date_range.append(day)
#             return date_range
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return None

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             pg_no = data["pg_no"]
#             on_page_data = data["on_page_data"]
#             location = data["location"]
#             site = data["site"]
#             line = data["line"]
#             container_no = data.get("container_no", None)
#             is_available = data["is_available"]
#             is_history = data["is_history"]
#             is_damaged = data["is_damaged"]
#             is_cut = data["is_cut"]
#             is_first_allotment = data["is_first_allotment"]

#             if location == "ALL":
#                 filtered_data = SealNo.objects.select_related("location", "site")
#             elif site == "ALL":
#                 filtered_data = SealNo.objects.select_related(
#                     "location", "site"
#                 ).filter(location__name=location)
#             else:
#                 filtered_data = SealNo.objects.select_related(
#                     "location", "site"
#                 ).filter(location__name=location, site__name=site)

#             if is_history:
#                 filtered_data = filtered_data.filter(is_lock=True)
#                 filtered_data = filtered_data.filter(is_damaged=is_damaged)
#                 filtered_data = filtered_data.filter(is_cut=is_cut)
#             else:
#                 if is_available:
#                     filtered_data = filtered_data.filter(
#                         is_lock=False, is_available=True
#                     )
#                 else:
#                     filtered_data = filtered_data.filter(
#                         is_lock=False, is_available=False
#                     )
#                     filtered_data = filtered_data.filter(is_damaged=is_damaged)
#                     filtered_data = filtered_data.filter(is_cut=is_cut)

#             if not len(line) == 0:
#                 filtered_data = filtered_data.filter(line=line)
#             if container_no is not None:
#                 if not len(container_no) == 0:
#                     filtered_data = filtered_data.filter(container_no=container_no)
#             if not len(data["number"]) == 0:
#                 filtered_data = filtered_data.filter(number=data["number"])
#             filtered_data = filtered_data.filter(is_first_allotment=is_first_allotment)

#             in_date = data["in_date"]
#             if not len(in_date["from"]) == 0 and not len(in_date["to"]) == 0:
#                 in_from_date = datetime.datetime.strptime(
#                     in_date["from"], "%Y-%m-%d"
#                 ).date()
#                 in_to_date = datetime.datetime.strptime(
#                     in_date["to"], "%Y-%m-%d"
#                 ).date()
#                 filtered_data = filtered_data.filter(
#                     in_date__range=(
#                         datetime.datetime.combine(
#                             in_from_date, datetime.time.min
#                         ).astimezone(timezone.get_current_timezone()),
#                         datetime.datetime.combine(
#                             in_to_date, datetime.time.max
#                         ).astimezone(timezone.get_current_timezone()),
#                     )
#                 )

#             out_date = data["out_date"]
#             if not len(out_date["from"]) == 0 and not len(out_date["to"]) == 0:
#                 out_from_date = datetime.datetime.strptime(
#                     out_date["from"], "%Y-%m-%d"
#                 ).date()
#                 out_to_date = datetime.datetime.strptime(
#                     out_date["to"], "%Y-%m-%d"
#                 ).date()
#                 filtered_data = filtered_data.filter(
#                     out_date__range=(
#                         datetime.datetime.combine(
#                             out_from_date, datetime.time.min
#                         ).astimezone(timezone.get_current_timezone()),
#                         datetime.datetime.combine(
#                             out_to_date, datetime.time.max
#                         ).astimezone(timezone.get_current_timezone()),
#                     )
#                 )

#             in_use_date = data["in_use_date"]
#             if not len(in_use_date["from"]) == 0 and not len(in_use_date["to"]) == 0:
#                 in_use_from_date = datetime.datetime.strptime(
#                     in_use_date["from"], "%Y-%m-%d"
#                 ).date()
#                 in_use_to_date = datetime.datetime.strptime(
#                     in_use_date["to"], "%Y-%m-%d"
#                 ).date()
#                 filtered_data = filtered_data.filter(
#                     in_use_date__range=(
#                         datetime.datetime.combine(
#                             in_use_from_date, datetime.time.min
#                         ).astimezone(timezone.get_current_timezone()),
#                         datetime.datetime.combine(
#                             in_use_to_date, datetime.time.max
#                         ).astimezone(timezone.get_current_timezone()),
#                     )
#                 )

#             paginator = Paginator(filtered_data, on_page_data)
#             no_of_data_count = paginator.count
#             no_of_pages = paginator.num_pages
#             current_page = paginator.page(pg_no)
#             on_page_data_count = (
#                 current_page.end_index() - current_page.start_index() + 1
#             )
#             prev_page = ""
#             if current_page.has_previous():
#                 prev_page = current_page.previous_page_number()
#             next_page = ""
#             if current_page.has_next():
#                 next_page = current_page.next_page_number()
#             response_data = [each.get_seal_no() for each in current_page]
#             return Response(
#                 {
#                     "no_of_data": no_of_data_count,
#                     "on_page_data": on_page_data_count,
#                     "total_pages": no_of_pages,
#                     "prev_page": prev_page,
#                     "next_page": next_page,
#                     "data": response_data,
#                 },
#                 status=200,
#             )

#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class EditSealNoMaster(views.APIView):

#     """The Get method will get  entry of Seal Number"""

#     """The Post function will update existing Seal Number"""

#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             seal_no_object = SealNo.objects.get(pk=pk)
#             data = seal_no_object.get_seal_no()
#             return Response(data, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)

#     def put(self, request, pk, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data

#             number = data["number"]
#             if number == "":
#                 return Response({"errorMsg": "Please provide Seal No"}, status=200)

#             line = data["line"]
#             if line == "":
#                 return Response({"errorMsg": "Please provide Line"}, status=200)

#             location = data["location"]
#             try:
#                 location_object = Location.objects.get(name=location)
#             except:
#                 location_object = None

#             site = data["site"]
#             try:
#                 site_object = Site.objects.get(name=site)
#             except:
#                 site_object = None

#             in_date = None
#             in_time = None
#             in_date_str = data["in_date"]
#             if len(in_date_str) == 0:
#                 in_date = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .date()
#                 )
#             else:
#                 try:
#                     in_date = datetime.datetime.strptime(in_date_str, "%Y-%m-%d").date()
#                 except:
#                     in_date = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .date()
#                     )

#             in_time_str = data["in_time"]
#             if len(in_time_str) == 0:
#                 in_time = (
#                     datetime.datetime.now()
#                     .astimezone(timezone.get_current_timezone())
#                     .time()
#                 )
#             else:
#                 try:
#                     in_time = datetime.datetime.strptime(in_time_str, "%H:%M").time()
#                 except:
#                     in_time = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                     )

#             in_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
#                 timezone.get_current_timezone()
#             )

#             is_cut = data["is_cut"]
#             is_damaged = data["is_damaged"]
#             is_first_allotment = data["is_first_allotment"]

#             seal_no_object = SealNo.objects.get(pk=pk)

#             if seal_no_object.is_lock:
#                 return Response(
#                     {"errorMsg": "Sorry Seal No is Locked, Cannot Update"},
#                     status=200,
#                 )
#             if seal_no_object.in_use and not seal_no_object.number == number:
#                 old_seal_no = seal_no_object.number
#                 stock = ContainerStock.objects.get(seal_no=old_seal_no)
#                 stock.seal_no = number
#                 stock.save()

#             if not seal_no_object.in_use:
#                 seal_no_object.line = line
#                 seal_no_object.location = location_object
#                 seal_no_object.site = site_object

#             seal_no_object.number = number
#             seal_no_object.in_date = in_date_time
#             seal_no_object.is_cut = is_cut
#             seal_no_object.is_damaged = is_damaged
#             seal_no_object.is_first_allotment = is_first_allotment
#             seal_no_object.save()
#             return Response({"successMsg": "Data Updated"}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


# class DeleteSealNoMaster(views.APIView):

#     """The post number will delete Seal Number"""

#     permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data
#             for pk in data:
#                 seal_no_object = SealNo.objects.get(pk=pk)
#                 if not seal_no_object.is_lock:
#                     if seal_no_object.in_use:
#                         stock = ContainerStock.objects.get(
#                             seal_no=seal_no_object.number
#                         )
#                         stock.seal_no = None
#                         stock.save()
#                     seal_no_object.delete()
#                 else:
#                     return Response(
#                         {"errorMsg": "Seal No is Locked, Cannot be deleted "},
#                         status=200,
#                     )
#             return Response({"successMsg": "Data Deleted"}, status=200)
#         except:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


# class GetAvailableSealNoView(views.APIView):
#     permission_classes = (IsAuthenticated,)

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             stock = ContainerStock.objects.get(pk=pk)
#             line = stock.container.client.ref_code
#             location = stock.container.location
#             site = stock.container.site
#             data = SealNo.objects.select_related("location", "site").filter(
#                 is_available=True, location=location, site=site, line=line
#             )
#             seal_data = [each.number for each in data]
#             return Response({line: seal_data}, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)


# @receiver(post_save)
# def location_voyage_save(sender, instance, created, **kwargs):
#     if sender in [LocationCodeDetail]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_location_code_{location}_{site}")
#         cache.delete(f"request_body_location_code_{location}_{site}")
#     elif sender in [VesselVoyageDetail]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_voyage_detail_{location}_{site}")
#         cache.delete(f"request_body_voyage_detail_{location}_{site}")


# @receiver(post_delete)
# def location_voyage_delete(sender, instance, **kwargs):
#     if sender in [LocationCodeDetail]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_location_code_{location}_{site}")
#         cache.delete(f"request_body_location_code_{location}_{site}")
#     elif sender in [VesselVoyageDetail]:
#         location = instance.location
#         site = instance.site
#         cache.delete(f"response_voyage_detail_{location}_{site}")
#         cache.delete(f"request_body_voyage_detail_{location}_{site}")
