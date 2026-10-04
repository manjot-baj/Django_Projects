# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
from transportation.functions import get_fiscal_year_date
from django.core.cache import cache
from common.functions import print_me, cache_api_view
from django.http import JsonResponse
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from account.permissions import HasAllowedRoles


# from django.contrib.contenttypes.models import ContentType


# model imports
from master.models import Location, Site
from transportation.models import (
    CreditorMaster,
    CustomerMaster,
    ServiceTaxMaster,
    DriverMaster,
    TruckMaster,
    BookingOptionMaster,
    BookingMaster,
    ContraEntry,
    JournalVoucher,
    AccountMaster,
    PurchaseMaster,
    InvoiceBill,
    PaymentReceiptMaster,
)


# class FormDependency(views.APIView):
#     permission_classes = (IsAuthenticated,)

#     def financial_year(self):
#         f_year_start, f_year_end = get_fiscal_year_date()
#         fin_year = f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
#         return fin_year

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             main_data = {}
#             data = request.data
#             field_list = data["field_list"]
#             location_str = data["location"]
#             site_str = data["site"]
#             location = Location.objects.get(name=location_str)
#             site = Site.objects.get(name=site_str)

#             mylist = [
#                 "source_destination",
#                 "consignor",
#                 "consignee",
#                 "particulars",
#                 "shipping_line",
#                 "status",
#                 "state",
#                 "port",
#                 "pod",
#                 "handling_company",
#                 "transporter",
#                 "transporter_driver_truck_data",
#                 "fuel_pump",
#                 "bill_party",
#                 "service_tax",
#                 "booking_data",
#                 "contra_entry_data",
#                 "journal_voucher_data",
#                 "account",
#                 "creditor",
#                 "customer",
#                 "all_entity",
#             ]
#             db = None
#             previous_data = cache.get(("request_body"))
#             if not (previous_data == request.data):

#                 bkg_obj = BookingOptionMaster.objects.select_related(
#                     "location", "site"
#                 ).filter(location=location, site=site)
#                 creditor_obj = CreditorMaster.objects.select_related(
#                     "location", "site"
#                 ).filter(location=location, site=site)
#                 tax_obj = ServiceTaxMaster.objects.select_related(
#                     "location", "site"
#                 ).filter(location=location, site=site)
#                 customer_obj = CustomerMaster.objects.select_related(
#                     "location", "site"
#                 ).filter(location=location, site=site)
#                 account_obj = AccountMaster.objects.select_related(
#                     "location", "site"
#                 ).filter(location=location, site=site)

#                 if "source_destination" in field_list:
#                     source_destination = [
#                         each.source_destination
#                         for each in bkg_obj.filter(source_destination__isnull=False)
#                     ]
#                     main_data["source_destination"] = source_destination

#                 if "consignor" in field_list:
#                     consignor = [
#                         each.consignor
#                         for each in bkg_obj.filter(consignor__isnull=False)
#                     ]
#                     main_data["consignor"] = consignor

#                 if "consignee" in field_list:
#                     consignee = [
#                         each.consignee
#                         for each in bkg_obj.filter(consignee__isnull=False)
#                     ]
#                     main_data["consignee"] = consignee

#                 if "particulars" in field_list:
#                     particulars = [
#                         each.particulars
#                         for each in bkg_obj.filter(particulars__isnull=False)
#                     ]
#                     main_data["particulars"] = particulars

#                 if "shipping_line" in field_list:
#                     shipping_line = [
#                         each.shipping_line
#                         for each in bkg_obj.filter(shipping_line__isnull=False)
#                     ]
#                     main_data["shipping_line"] = shipping_line

#                 if "status" in field_list:
#                     status = [
#                         each.status for each in bkg_obj.filter(status__isnull=False)
#                     ]
#                     main_data["status"] = status

#                 if "port" in field_list:
#                     port = [each.port for each in bkg_obj.filter(port__isnull=False)]
#                     main_data["port"] = port

#                 if "pod" in field_list:
#                     pod = [each.pod for each in bkg_obj.filter(pod__isnull=False)]
#                     main_data["pod"] = pod

#                 if "handling_company" in field_list:
#                     handling_company = [
#                         each.handling_company
#                         for each in bkg_obj.filter(handling_company__isnull=False)
#                     ]
#                     main_data["handling_company"] = handling_company

#                 if "creditor" in field_list:
#                     creditor = [each.name for each in creditor_obj]
#                     main_data["creditor"] = creditor

#                 if "transporter" in field_list:
#                     transporter = [
#                         each.name
#                         for each in creditor_obj.filter(category="Transporter")
#                     ]
#                     main_data["transporter"] = transporter

#                 if "transporter_driver_truck_data" in field_list:
#                     transporter_driver_truck_data = []
#                     for transporter in creditor_obj.filter(category="Transporter"):
#                         driver_list = [
#                             {
#                                 "name": each.name,
#                                 "license_no": each.license_no
#                                 if each.license_no is not None
#                                 else "",
#                                 "mobile_no": each.mobile_no
#                                 if each.mobile_no is not None
#                                 else "",
#                             }
#                             for each in DriverMaster.objects.filter(
#                                 transporter=transporter
#                             )
#                         ]
#                         truck_list = [
#                             each.truck_no
#                             for each in TruckMaster.objects.filter(
#                                 transporter=transporter
#                             )
#                         ]
#                         transporter_driver_truck_data.append(
#                             {
#                                 transporter.name: {
#                                     "driver_list": driver_list,
#                                     "truck_list": truck_list,
#                                 }
#                             }
#                         )
#                     main_data[
#                         "transporter_driver_truck_data"
#                     ] = transporter_driver_truck_data

#                 if "fuel_pump" in field_list:
#                     fuel_pump = [
#                         each.name for each in creditor_obj.filter(category="Fuel Pump")
#                     ]
#                     main_data["fuel_pump"] = fuel_pump

#                 if "customer" in field_list:
#                     customer = [each.name for each in customer_obj]
#                     main_data["customer"] = customer

#                 if "bill_party" in field_list:
#                     bill_party = [each.name for each in customer_obj]
#                     main_data["bill_party"] = bill_party

#                 if "service_tax" in field_list:
#                     service_tax = [each.description for each in tax_obj]
#                     main_data["service_tax"] = service_tax

#                 if "state" in field_list:
#                     state = {
#                         "Andhra Pradesh": "37",
#                         "Arunachal Pradesh ": "12",
#                         "Assam": "18",
#                         "Bihar": "10",
#                         "Chattisgarh": "22",
#                         "Goa": "30",
#                         "Gujarat": "24",
#                         "Haryana": "06",
#                         "Himachal Pradesh": "02",
#                         "Jammu and Kashmir": "01",
#                         "Jharkhand": "20",
#                         "Karnataka": "29",
#                         "Kerala": "32",
#                         "Madhya Pradesh": "23",
#                         "Maharashtra": "27",
#                         "Manipur": "14",
#                         "Meghalaya": "17",
#                         "Mizoram": "15",
#                         "Nagaland": "13",
#                         "Odisha": "21",
#                         "Punjab": "03",
#                         "Rajasthan": "08",
#                         "Sikkim": "11",
#                         "Tamil Nadu": "33",
#                         "Telangana": "36",
#                         "Tripura": "16",
#                         "Uttar Pradesh": "09",
#                         "Uttarakhand": "05",
#                         "West Bengal": "19",
#                         "Andaman and Nicobar Islands": "35",
#                         "Chandigarh": "04",
#                         "Dadra and Nagar Haveli": "26",
#                         "Daman and Diu": "26",
#                         "Lakshadweep": "31",
#                         "Delhi": "07",
#                         "Puducherry": "97",
#                     }
#                     main_data["state"] = state
#                 fin_year = self.financial_year()
#                 if "booking_data" in field_list:
#                     booking_obj = BookingMaster.objects.select_related(
#                         "location", "site"
#                     ).filter(location=location, site=site, financial_year=fin_year)
#                     # entry_no = f"BO/{fin_year}/{str(booking_obj.count() + 1).zfill(6)}"
#                     # lr_no = booking_obj.count() + 1
#                     entry_check = booking_obj.last()
#                     if entry_check is None:
#                         entry_no = f"BO/{fin_year}/{str(1).zfill(6)}"
#                         lr_no = 1
#                     else:
#                         number = int((entry_check.entry_no)[-4:])
#                         entry_no = f"BO/{fin_year}/{str(number + 1).zfill(6)}"
#                         lr_no = number + 1
#                     booking_data = {
#                         "entry_no": str(entry_no),
#                         "lr_no": str(lr_no),
#                     }
#                     main_data["booking_data"] = booking_data

#                 if "contra_entry_data" in field_list:
#                     contra_entry_obj = ContraEntry.objects.select_related(
#                         "account_debit__location", "account_debit__site"
#                     ).filter(
#                         account_debit__location=location,
#                         account_debit__site=site,
#                         financial_year=fin_year,
#                     )
#                     # entry_no = f"CE/{fin_year}/{str(contra_entry_obj.count() + 1).zfill(6)}"
#                     entry_check = contra_entry_obj.last()
#                     if entry_check is None:
#                         entry_no = f"CE/{fin_year}/{str(1).zfill(6)}"
#                     else:
#                         number = int((entry_check.entry_no)[-4:])
#                         entry_no = f"CE/{fin_year}/{str(number + 1).zfill(6)}"
#                     contra_entry_data = {"entry_no": str(entry_no)}
#                     main_data["contra_entry_data"] = contra_entry_data

#                 if "journal_voucher_data" in field_list:
#                     journal_voucher_obj = JournalVoucher.objects.select_related(
#                         "location", "site"
#                     ).filter(location=location, site=site, financial_year=fin_year)
#                     # entry_no = (
#                     #     f"JV/{fin_year}/{str(journal_voucher_obj.count() + 1).zfill(6)}"
#                     # )
#                     entry_check = journal_voucher_obj.last()
#                     if entry_check is None:
#                         entry_no = f"JV/{fin_year}/{str(1).zfill(6)}"
#                     else:
#                         number = int((entry_check.entry_no)[-4:])
#                         entry_no = f"JV/{fin_year}/{str(number + 1).zfill(6)}"
#                     journal_voucher_data = {"entry_no": str(entry_no)}
#                     main_data["journal_voucher_data"] = journal_voucher_data

#                 if "account" in field_list:
#                     account = [each.name for each in account_obj]
#                     main_data["account"] = account

#                 if "all_entity" in field_list:
#                     account = [each.name for each in account_obj]
#                     creditor = [each.name for each in creditor_obj]
#                     customer = [each.name for each in customer_obj]
#                     all_entity = account + customer + creditor
#                     main_data["all_entity"] = all_entity

#                 if "purchase_lr_data" in field_list:
#                     purchase_obj = PurchaseMaster.objects.select_related(
#                         "location", "site"
#                     ).filter(location=location, site=site, financial_year=fin_year)
#                     # entry_no = (
#                     #     f"P/{fin_year}/{str(purchase_obj.count() + 1).zfill(6)}"
#                     # )
#                     entry_check = purchase_obj.last()
#                     if entry_check is None:
#                         entry_no = f"P/{fin_year}/{str(1).zfill(6)}"
#                     else:
#                         number = int((entry_check.entry_no)[-4:])
#                         entry_no = f"P/{fin_year}/{str(number + 1).zfill(6)}"
#                     purchase_lr_data = {"entry_no": str(entry_no)}
#                     main_data["purchase_lr_data"] = purchase_lr_data

#                 if "invoice_bill_data" in field_list:
#                     invoice_obj = InvoiceBill.objects.select_related(
#                         "location", "site"
#                     ).filter(location=location, site=site, financial_year=fin_year)
#                     # bill_no = (
#                     #     f"GHS/{fin_year}/{str(invoice_obj.count() + 1).zfill(6)}"
#                     # )
#                     bill_check = invoice_obj.last()
#                     if bill_check is None:
#                         bill_no = f"GHS/{fin_year}/{str(1).zfill(6)}"
#                     else:
#                         number = int((bill_check.bill_no)[-4:])
#                         bill_no = f"GHS/{fin_year}/{str(number + 1).zfill(6)}"
#                     invoice_bill_data = {"bill_no": str(bill_no)}
#                     main_data["invoice_bill_data"] = invoice_bill_data

#                 if "payment_receipt_data" in field_list:
#                     payemnt_reciept = PaymentReceiptMaster.objects.select_related(
#                         "location", "site"
#                     ).filter(location=location, site=site, financial_year=fin_year)
#                     # entry_no = (
#                     #     f"PR/{fin_year}/{str(payemnt_reciept.count() + 1).zfill(6)}"
#                     # )
#                     entry_check = payemnt_reciept.last()
#                     if entry_check is None:
#                         entry_no = f"PR/{fin_year}/{str(1).zfill(6)}"
#                     else:
#                         number = int((entry_check.entry_no)[-4:])
#                         entry_no = f"PR/{fin_year}/{str(number + 1).zfill(6)}"
#                     payment_receipt_data = {"entry_no": str(entry_no)}
#                     main_data["payment_receipt_data"] = payment_receipt_data

#                 if "bank_list" in field_list:
#                     bank_list = [
#                         each.name for each in account_obj.filter(account_type="BANK")
#                     ]
#                     main_data["bank_list"] = bank_list

#                 cache.set_many(
#                         {"main_data": main_data, "request_body": request.data}, 30
#                     )

#                 db = "db"
#                 return Response({"data": main_data, "db": db}, status=200)
#             else:
#                 data = cache.get(("main_data"))
#                 db = "cache"
#                 return Response({"data":data,"db":db}, status=200)


#         except Exception as e:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)





class FormDependency(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    @cache_api_view(key="form_dependancy", time=86400)
    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            main_data = {}
            data = request.data
            field_list = data["field_list"]
            location_str = data["location"]
            site_str = data["site"]
            location = Location.objects.get(name=location_str)
            site = Site.objects.get(name=site_str)

            # mylist = [
            #     "source_destination",
            #     "consignor",
            #     "consignee",
            #     "particulars",
            #     "shipping_line",
            #     "status",
            #     "state",
            #     "port",
            #     "pod",
            #     "handling_company",
            #     "transporter",
            #     "transporter_driver_truck_data",
            #     "fuel_pump",
            #     "bill_party",
            #     "service_tax",
            #     "booking_data",
            #     "contra_entry_data",
            #     "journal_voucher_data",
            #     "account",
            #     "creditor",
            #     "customer",
            #     "all_entity",
            # ]

            bkg_obj = BookingOptionMaster.objects.select_related(
                "location", "site"
            ).filter(location=location, site=site)
            creditor_obj = CreditorMaster.objects.select_related(
                "location", "site"
            ).filter(location=location, site=site)
            tax_obj = ServiceTaxMaster.objects.select_related(
                "location", "site"
            ).filter(location=location, site=site)
            customer_obj = CustomerMaster.objects.select_related(
                "location", "site"
            ).filter(location=location, site=site)
            account_obj = AccountMaster.objects.select_related(
                "location", "site"
            ).filter(location=location, site=site)

            if "source_destination" in field_list:
                source_destination = [
                    each.source_destination
                    for each in bkg_obj.filter(source_destination__isnull=False)
                ]
                main_data["source_destination"] = source_destination

            if "consignor" in field_list:
                consignor = [
                    each.consignor for each in bkg_obj.filter(consignor__isnull=False)
                ]
                main_data["consignor"] = consignor

            if "consignee" in field_list:
                consignee = [
                    each.consignee for each in bkg_obj.filter(consignee__isnull=False)
                ]
                main_data["consignee"] = consignee

            if "particulars" in field_list:
                particulars = [
                    each.particulars
                    for each in bkg_obj.filter(particulars__isnull=False)
                ]
                main_data["particulars"] = particulars

            if "shipping_line" in field_list:
                shipping_line = [
                    each.shipping_line
                    for each in bkg_obj.filter(shipping_line__isnull=False)
                ]
                main_data["shipping_line"] = shipping_line

            if "status" in field_list:
                status = [each.status for each in bkg_obj.filter(status__isnull=False)]
                main_data["status"] = status

            if "port" in field_list:
                port = [each.port for each in bkg_obj.filter(port__isnull=False)]
                main_data["port"] = port

            if "pod" in field_list:
                pod = [each.pod for each in bkg_obj.filter(pod__isnull=False)]
                main_data["pod"] = pod

            if "handling_company" in field_list:
                handling_company = [
                    each.handling_company
                    for each in bkg_obj.filter(handling_company__isnull=False)
                ]
                main_data["handling_company"] = handling_company

            if "creditor" in field_list:
                creditor = [each.name for each in creditor_obj]
                main_data["creditor"] = creditor

            if "transporter" in field_list:
                transporter = [
                    each.name for each in creditor_obj.filter(category="Transporter")
                ]
                main_data["transporter"] = transporter

            if "transporter_driver_truck_data" in field_list:
                transporter_driver_truck_data = []
                for transporter in creditor_obj.filter(category="Transporter"):
                    driver_list = [
                        {
                            "name": each.name,
                            "license_no": (
                                each.license_no if each.license_no is not None else ""
                            ),
                            "mobile_no": (
                                each.mobile_no if each.mobile_no is not None else ""
                            ),
                        }
                        for each in DriverMaster.objects.filter(transporter=transporter)
                    ]
                    truck_list = [
                        each.truck_no
                        for each in TruckMaster.objects.filter(transporter=transporter)
                    ]
                    transporter_driver_truck_data.append(
                        {
                            transporter.name: {
                                "driver_list": driver_list,
                                "truck_list": truck_list,
                            }
                        }
                    )
                main_data["transporter_driver_truck_data"] = (
                    transporter_driver_truck_data
                )

            if "fuel_pump" in field_list:
                fuel_pump = [
                    each.name for each in creditor_obj.filter(category="Fuel Pump")
                ]
                main_data["fuel_pump"] = fuel_pump

            if "customer" in field_list:
                customer = [each.name for each in customer_obj]
                main_data["customer"] = customer

            if "bill_party" in field_list:
                bill_party = [each.name for each in customer_obj]
                main_data["bill_party"] = bill_party

            if "service_tax" in field_list:
                service_tax = [each.description for each in tax_obj]
                main_data["service_tax"] = service_tax

            if "state" in field_list:
                state = {
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
                main_data["state"] = state

            if "account" in field_list:
                account = [each.name for each in account_obj]
                main_data["account"] = account

            if "all_entity" in field_list:
                account = [each.name for each in account_obj]
                creditor = [each.name for each in creditor_obj]
                customer = [each.name for each in customer_obj]
                all_entity = account + customer + creditor
                main_data["all_entity"] = all_entity

            if "bank_list" in field_list:
                bank_list = [
                    each.name for each in account_obj.filter(account_type="BANK")
                ]
                main_data["bank_list"] = bank_list

            return Response(main_data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EntryNoData(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def financial_year(self):
        f_year_start, f_year_end = get_fiscal_year_date()
        fin_year = f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
        return fin_year

    def post(self, request, *args, **kwargs):
        try:
            main_data = {}
            # "field_list": [
            #     "purchase_lr_data",
            #     "invoice_bill_data",
            #     "booking_data",
            #     "contra_entry_data",
            #     "journal_voucher_data",
            #     "payment_receipt_data"
            # ]
            data = request.data
            field_list = data["field_list"]
            location_str = data["location"]
            site_str = data["site"]
            location = Location.objects.get(name=location_str)
            site = Site.objects.get(name=site_str)
            fin_year = self.financial_year()
            if "booking_data" in field_list:
                booking = BookingMaster.objects.select_related(
                    "location", "site"
                ).filter(
                    location=location,
                    site=site,
                    financial_year=fin_year,
                )

                check_number = booking.count() + 1
                lr_no = check_number
                entry_no = f"BO/{fin_year}/{str(check_number).zfill(6)}"

                while booking.filter(
                    entry_no=entry_no,
                    lr_no=lr_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"BO/{fin_year}/{str(check_number).zfill(6)}"
                    lr_no = check_number
                    if not booking.filter(
                        entry_no=entry_no,
                        lr_no=lr_no,
                    ).exists():
                        break

                main_data["booking_data"] = {
                    "entry_no": str(entry_no),
                    "lr_no": str(lr_no),
                }

            if "contra_entry_data" in field_list:
                contra_entry = ContraEntry.objects.select_related(
                    "account_debit__location", "account_debit__site"
                ).filter(
                    account_debit__location=location,
                    account_debit__site=site,
                    financial_year=fin_year,
                )
                check_number = contra_entry.count() + 1
                entry_no = f"CE/{fin_year}/{str(check_number).zfill(6)}"

                while contra_entry.filter(entry_no=entry_no).exists():
                    check_number = check_number + 1
                    entry_no = f"CE/{fin_year}/{str(check_number).zfill(6)}"
                    if not contra_entry.filter(entry_no=entry_no).exists():
                        break

                main_data["contra_entry_data"] = {"entry_no": str(entry_no)}

            if "journal_voucher_data" in field_list:
                journal_voucher = JournalVoucher.objects.select_related(
                    "location", "site"
                ).filter(
                    location=location,
                    site=site,
                    financial_year=fin_year,
                )
                check_number = journal_voucher.count() + 1
                entry_no = f"JV/{fin_year}/{str(check_number).zfill(6)}"

                while journal_voucher.filter(
                    entry_no=entry_no,
                ).exists():

                    check_number = check_number + 1
                    entry_no = f"JV/{fin_year}/{str(check_number).zfill(6)}"
                    if not journal_voucher.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                main_data["journal_voucher_data"] = {"entry_no": str(entry_no)}

            if "purchase_lr_data" in field_list:
                purchase_obj = PurchaseMaster.objects.select_related(
                    "location", "site"
                ).filter(
                    location=location,
                    site=site,
                    financial_year=fin_year,
                )
                check_number = purchase_obj.count() + 1

                entry_no = f"P/{fin_year}/{str(check_number).zfill(6)}"

                while purchase_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"P/{fin_year}/{str(check_number).zfill(6)}"
                    if not purchase_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                main_data["purchase_lr_data"] = {"entry_no": str(entry_no)}

            if "invoice_bill_data" in field_list:

                invoice_obj = InvoiceBill.objects.select_related(
                    "location", "site"
                ).filter(location=location, site=site, financial_year=fin_year)
                check_number = invoice_obj.count() + 1
                bill_no = f"GHS/{fin_year}/{str(check_number).zfill(6)}"

                while invoice_obj.filter(
                    bill_no=bill_no,
                ).exists():
                    check_number = check_number + 1
                    bill_no = f"GHS/{fin_year}/{str(check_number).zfill(6)}"
                    if not invoice_obj.filter(
                        bill_no=bill_no,
                    ).exists():
                        break

                main_data["invoice_bill_data"] = {"bill_no": str(bill_no)}

            if "payment_receipt_data" in field_list:

                payemnt_reciept = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                ).filter(location=location, site=site, financial_year=fin_year)
                check_number = payemnt_reciept.count() + 1
                entry_no = f"PR/{fin_year}/{str(check_number).zfill(6)}"

                while payemnt_reciept.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{fin_year}/{str(check_number).zfill(6)}"
                    if not payemnt_reciept.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                main_data["payment_receipt_data"] = {"entry_no": str(entry_no)}

            return Response(main_data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender in [
        AccountMaster,
        CustomerMaster,
        BookingOptionMaster,
        CreditorMaster,
        ServiceTaxMaster,
    ]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_form_dependancy_{location}_{site}_movement")
        cache.delete(f"request_body_form_dependancy_{location}_{site}_movement")

        # print_me(location,site)
        # model_name = sender._meta.label
        # print_me(model_name)
        # content_type = ContentType.objects.get_for_model(sender)
        # action = "insert" if created else "update"
        # table_name = sender._meta.db_table
        # row_id = instance.id
        # print_me(table_name,content_type)


@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender in [
        AccountMaster,
        CustomerMaster,
        BookingOptionMaster,
        CreditorMaster,
        ServiceTaxMaster,
    ]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_form_dependancy_{location}_{site}_movement")
        cache.delete(f"request_body_form_dependancy_{location}_{site}_movement")
