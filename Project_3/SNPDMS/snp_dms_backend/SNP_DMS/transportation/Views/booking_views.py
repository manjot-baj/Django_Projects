from django.shortcuts import render
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import *
from ..models import *
import datetime
import traceback
from common.functions import *
from django.utils import timezone
from django.core.paginator import Paginator
from billing_invoice.models import get_fiscal_year_date
from account.permissions import HasAllowedRoles

class BookingEntry(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):

        try:

            data = request.data
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = data["location"]
                site_str = data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            general_data = data["general_data"]
            entry_no = general_data["entry_no"]
            if len(entry_no) == 0:
                return Response({"errorMsg": "Please provide booking No"}, status=200)
            booking_no = general_data["booking_no"]
            lr_no = general_data["lr_no"]
            if len(lr_no) == 0:
                return Response({"errorMsg": "Please provide lr no"}, status=200)
            booking_type = general_data["booking_type"]
            if len(booking_type) == 0:
                return Response({"errorMsg": "Please provide booking type"}, status=200)

            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )

            l_date_str = general_data["l_date"]
            if len(l_date_str) == 0:
                l_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                l_date = datetime.datetime.strptime(l_date_str, "%Y-%m-%d").date()

            s_date_str = general_data["s_date"]
            if len(s_date_str) == 0:
                s_date = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                ).date() + datetime.timedelta(days=1)
            else:
                s_date = datetime.datetime.strptime(s_date_str, "%Y-%m-%d").date()

            from_dest = general_data["from_dest"]
            if len(from_dest) == 0:
                return Response(
                    {"errorMsg": "Please provide from destination"}, status=200
                )
            else:
                BookingOptionMaster.objects.get_or_create(
                    source_destination=from_dest, location=location, site=site
                )

            to_dest = general_data["to_dest"]
            if len(to_dest) == 0:
                return Response(
                    {"errorMsg": "Please provide to destination"}, status=200
                )
            else:
                BookingOptionMaster.objects.get_or_create(
                    source_destination=to_dest, location=location, site=site
                )

            destination = f"{from_dest} - {to_dest}"

            consignor = general_data["consignor"]
            if len(consignor) == 0:
                return Response({"errorMsg": "Please provide consignor"}, status=200)
            else:
                BookingOptionMaster.objects.get_or_create(
                    consignor=consignor, location=location, site=site
                )

            consignee = general_data["consignee"]
            if len(consignee) == 0:
                return Response({"errorMsg": "Please provide consignee"}, status=200)
            else:
                BookingOptionMaster.objects.get_or_create(
                    consignee=consignee, location=location, site=site
                )

            no_of_pallets = general_data["no_of_pallets"]
            if len(no_of_pallets) == 0:
                return Response(
                    {"errorMsg": "Please provide no of pallets"}, status=200
                )

            actual_weight = general_data["actual_weight"]
            if len(actual_weight) == 0:
                return Response(
                    {"errorMsg": "Please provide actual weight"}, status=200
                )

            charge_weight = general_data["charge_weight"]
            if len(charge_weight) == 0:
                return Response(
                    {"errorMsg": "Please provide actual weight"}, status=200
                )

            particulars = general_data["particulars"]
            if len(particulars) == 0:
                return Response({"errorMsg": "Please provide particulars"}, status=200)
            else:
                BookingOptionMaster.objects.get_or_create(
                    particulars=particulars, location=location, site=site
                )

            transportation_data = data["transportation_data"]

            transporter_str = transportation_data["transporter"]
            if not len(transporter_str) == 0:
                transporter = CreditorMaster.objects.get(
                    name=transporter_str,
                    category="Transporter",
                    location=location,
                    site=site,
                )
            else:
                transporter = None

            truck_no = transportation_data["truck_no"]
            if not len(truck_no) == 0:
                TruckMaster.objects.get_or_create(
                    truck_no=truck_no,
                    transporter=transporter,
                    location=location,
                    site=site,
                )

            driver_name_str = transportation_data["driver_name"]
            if not len(driver_name_str) == 0:
                driver_name = DriverMaster.objects.get(
                    name=driver_name_str, transporter=transporter
                )
            else:
                driver_name = None

            container_no = transportation_data["container_no"]

            container_type = transportation_data["container_type"]

            container_size = transportation_data["container_size"]

            shipping_line = transportation_data["shipping_line"]
            if not len(shipping_line) == 0:
                BookingOptionMaster.objects.get_or_create(
                    shipping_line=shipping_line, location=location, site=site
                )

            seal_no = transportation_data["seal_no"]

            status = transportation_data["status"]
            if not len(status) == 0:
                BookingOptionMaster.objects.get_or_create(
                    status=status, location=location, site=site
                )

            port = transportation_data["port"]
            if not len(port) == 0:
                BookingOptionMaster.objects.get_or_create(
                    port=port, location=location, site=site
                )

            pod = transportation_data["pod"]
            if not len(pod) == 0:
                BookingOptionMaster.objects.get_or_create(
                    pod=pod, location=location, site=site
                )

            charges = data["charges"]

            tr_freight = charges["tr_freight"]
            if len(tr_freight) == 0:
                tr_freight = 0
            advance = charges["advance"]
            if len(advance) == 0:
                advance = 0
            advance_payment_type = charges["advance_payment_type"]
            diesel_quantity = charges["diesel_quantity"]
            diesel_rate = charges["diesel_rate"]
            if len(diesel_rate) == 0:
                diesel_rate
            diesel_cost = float(diesel_rate) * float(diesel_quantity)
            fuel_pump_str = charges["fuel_pump"]
            if not len(fuel_pump_str) == 0:
                fuel_pump = CreditorMaster.objects.get(
                    name=fuel_pump_str,
                    category="Fuel Pump",
                    location=location,
                    site=site,
                )
            else:
                fuel_pump = None

            detention_charges = charges["detention_charges"]
            if len(detention_charges) == 0:
                detention_charges = 0
            extra_charges = charges["extra_charges"]
            if len(extra_charges) == 0:
                extra_charges = 0
            balance = charges["balance"]
            if len(balance) == 0:
                balance = 0

            loading_unloading = charges["loading_unloading"]
            if len(loading_unloading) == 0:
                loading_unloading = 0
            handling_charges = charges["handling_charges"]
            if len(handling_charges) == 0:
                handling_charges = 0
            handling_payment_type = charges["handling_payment_type"]

            handling_company = charges["handling_company"]
            if not len(handling_company) == 0:
                BookingOptionMaster.objects.get_or_create(
                    handling_company=handling_company, location=location, site=site
                )

            washing_charges = charges["washing_charges"]
            if len(washing_charges) == 0:
                washing_charges = 0
            repair_charges = charges["repair_charges"]
            if len(repair_charges) == 0:
                repair_charges = 0
            weighment_charges = charges["weighment_charges"]
            if len(weighment_charges) == 0:
                weighment_charges

            bill = data["bill"]
            bill_party_str = bill["bill_party"]
            if not len(bill_party_str) == 0:
                bill_party = CustomerMaster.objects.get(name=bill_party_str)
            else:
                bill_party = None
            company_account_name = bill["company_acc_name"]
            bill_line = bill["bill_line"]
            category = bill_line["category"]
            type_of_charge_str = bill_line["type_of_charge"]
            if not len(type_of_charge_str) == 0:
                type_of_charge = ServiceTaxMaster.objects.get(
                    description=type_of_charge_str, location=location, site=site
                )

            bill_amount = bill_line["bill_amount"]
            if len(bill_amount) == 0:
                bill_amount = 0
            advance_bill_charges = bill_line["advance"]
            if len(advance_bill_charges) == 0:
                advance_bill_charges = 0
            payment_type = bill_line["payment_type"]
            rcm = bill_line["rcm"]

            booking_entry = BookingMaster.create(
                entry_no=entry_no,
                booking_no=booking_no,
                lr_no=lr_no,
                booking_type=booking_type,
                financial_year=financial_year,
                l_date=l_date,
                s_date=s_date,
                from_dest=from_dest,
                to_dest=to_dest,
                destination=destination,
                consignor=consignor,
                consignee=consignee,
                no_of_pallets=no_of_pallets,
                actual_weight=actual_weight,
                charge_weight=charge_weight,
                particulars=particulars,
                transporter=transporter,
                truck_no=truck_no,
                driver_name=driver_name,
                container_no=container_no,
                container_type=container_type,
                container_size=container_size,
                shipping_line=shipping_line,
                seal_no=seal_no,
                status=status,
                port=port,
                pod=pod,
                tr_freight=tr_freight,
                advance=advance,
                advance_payment_type=advance_payment_type,
                diesel_quantity=diesel_quantity,
                diesel_rate=diesel_rate,
                diesel_cost=diesel_cost,
                fuel_pump=fuel_pump,
                detention_charges=detention_charges,
                extra_charges=extra_charges,
                balance=balance,
                loading_unloading=loading_unloading,
                handling_charges=handling_charges,
                handling_company=handling_company,
                handling_payment_type=handling_payment_type,
                washing_charges=washing_charges,
                repair_charges=repair_charges,
                weighment_charges=weighment_charges,
                location=location,
                site=site,
            )
            booking_entry.save()

            bill_entry = BookingBill.create(
                booking=booking_entry,
                bill_party=bill_party,
                company_account_name=company_account_name,
            )
            bill_entry.save()

            bill_line = BookingBillLine.create(
                category=category,
                type_of_charge=type_of_charge,
                bill_amount=bill_amount,
                advance=advance_bill_charges,
                payment_type=payment_type,
                rcm=rcm,
                booking_bill=bill_entry,
            )
            bill_line.save()

            # VOUCHERS
            count_obj = PaymentReceiptMaster.objects.select_related(
                "location", "site"
            ).filter(
                financial_year=financial_year, location__name=location, site__name=site
            )
            journal_obj = JournalVoucher.objects.select_related(
                "location", "site"
            ).filter(
                financial_year=financial_year, location__name=location, site__name=site
            )
            if not len(advance) == 0:

                entry_no_pr = (
                    f"P/C/{financial_year}/{str(count_obj.count()+ 1).zfill(6)}"
                )
                advance_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no_pr,
                    financial_year=financial_year,
                    cheque_type=None,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    category="Advance",
                    name=transporter_str,
                    truck_no=truck_no,
                    extra_charges="Advance",
                    narration=f"LR No: {lr_no}, Trasnporter: {transporter.name},Truck No: {truck_no}",
                    pay_remarks=None,
                    recieve_given=advance,
                    kasar="0",
                    tds="0",
                    amount=advance,
                    transaction_from=advance_payment_type,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                advance_voucher.save()

            if not len(handling_charges) == 0:

                entry_no_pr = (
                    f"P/C/{financial_year}/{str(count_obj.count()+ 1).zfill(6)}"
                )
                handling_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no_pr,
                    financial_year=financial_year,
                    cheque_type=None,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    category="Advance",
                    name=transporter_str,
                    truck_no=truck_no,
                    extra_charges="Advance",
                    narration=f"LR No: {lr_no}, Handling: {handling_company}",
                    pay_remarks=None,
                    recieve_given=handling_charges,
                    kasar="0",
                    tds="0",
                    amount=handling_charges,
                    transaction_from=handling_payment_type,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                handling_voucher.save()

            if not len(weighment_charges) == 0:

                entry_no_pr = (
                    f"P/C/{financial_year}/{str(count_obj.count()+ 1).zfill(6)}"
                )
                weighing_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no_pr,
                    financial_year=financial_year,
                    cheque_type=None,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    category="Weighment",
                    name=transporter_str,
                    truck_no=truck_no,
                    extra_charges="Weighment",
                    narration=f"LR No: {lr_no} - Weighment",
                    pay_remarks=None,
                    recieve_given=weighment_charges,
                    kasar="0",
                    tds="0",
                    amount=weighment_charges,
                    transaction_from=advance_payment_type,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                weighing_voucher.save()

            if not len(washing_charges) == 0:

                entry_no_pr = (
                    f"P/C/{financial_year}/{str(count_obj.count()+1).zfill(6)}"
                )
                washing_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no_pr,
                    financial_year=financial_year,
                    cheque_type=None,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    category="Washing",
                    name=transporter_str,
                    truck_no=truck_no,
                    extra_charges="Washing",
                    narration=f"LR No: {lr_no} - Washing",
                    pay_remarks=None,
                    recieve_given=washing_charges,
                    kasar="0",
                    tds="0",
                    amount=washing_charges,
                    transaction_from=advance_payment_type,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                washing_voucher.save()

            if not len(loading_unloading) == 0:

                entry_no_pr = (
                    f"P/C/{financial_year}/{str(count_obj.count()+1).zfill(6)}"
                )
                loading_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no_pr,
                    financial_year=financial_year,
                    cheque_type=None,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    category="Loading/Unloading",
                    name=transporter_str,
                    truck_no=truck_no,
                    extra_charges="Loading/Unloading",
                    narration=f"LR No: {lr_no} - Loading/Unloading",
                    pay_remarks=None,
                    recieve_given=loading_unloading,
                    kasar="0",
                    tds="0",
                    amount=loading_unloading,
                    transaction_from=advance_payment_type,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                loading_voucher.save()

            if not len(repair_charges) == 0:

                entry_no_pr = (
                    f"P/C/{financial_year}/{str(count_obj.count()+1).zfill(6)}"
                )
                repairing_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no_pr,
                    financial_year=financial_year,
                    cheque_type=None,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    category="Repairing",
                    name=transporter_str,
                    truck_no=truck_no,
                    extra_charges="Repairing",
                    narration=f"LR No: {lr_no} - Repairing",
                    pay_remarks=None,
                    recieve_given=repair_charges,
                    kasar="0",
                    tds="0",
                    amount=repair_charges,
                    transaction_from=advance_payment_type,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                repairing_voucher.save()

            # JOURNAL VOUCHER
            if not len(handling_charges) == 0:

                entry_no_jv = (
                    f"JV/C/{financial_year}/{str(journal_obj.count()+1).zfill(6)}"
                )
                handling_j_voucher = JournalVoucher.create(
                    transaction="Credit",
                    financial_year=financial_year,
                    entry_no=entry_no_jv,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    name=handling_company,
                    narration=f"LR No: {lr_no}",
                    amount=handling_charges,
                    transporter_name="-",
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                handling_j_voucher.save()

            if not len(advance_bill_charges) == 0:

                entry_no_jv = (
                    f"JV/C/{financial_year}/{str(journal_obj.count()+1).zfill(6)}"
                )
                advance_j_voucher = JournalVoucher.create(
                    transaction="Credit",
                    financial_year=financial_year,
                    entry_no=entry_no_jv,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    name=bill_party.name,
                    narration=f"Truck No: {truck_no}, LR No: {lr_no}, Bill Party: {bill_party_str}",
                    amount=advance_bill_charges,
                    transporter_name="-",
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                advance_j_voucher.save()

            if not len(str(diesel_cost)) == 0:

                entry_no_jv = (
                    f"JV/C/{financial_year}/{str(journal_obj.count()+1).zfill(6)}"
                )
                diesel_voucher = JournalVoucher.create(
                    transaction="Credit",
                    financial_year=financial_year,
                    entry_no=entry_no_jv,
                    entry_date=datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date(),
                    name=fuel_pump.name,
                    narration=f"LR No: {lr_no}, Fuel Pump: {fuel_pump.name}",
                    amount=diesel_cost,
                    transporter_name=transporter.name,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                diesel_voucher.save()

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)


class UpdateBookingEntry(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:

            booking_obj = BookingMaster.objects.get(pk=pk)
            data = booking_obj.get_booking()
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:

            data = request.data
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = data["location"]
                site_str = data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            l_date_str = data["l_date"]
            if len(l_date_str) == 0:
                l_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                l_date = datetime.datetime.strptime(l_date_str, "%Y-%m-%d").date()

            s_date_str = data["s_date"]
            if len(s_date_str) == 0:
                s_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                s_date = datetime.datetime.strptime(s_date_str, "%Y-%m-%d").date()

            from_dest = data["from_dest"]
            if len(from_dest) == 0:
                return Response(
                    {"errorMsg": "Please provide from destination"}, status=200
                )
            else:
                BookingOptionMaster.objects.get_or_create(
                    source_destination=from_dest, location=location, site=site
                )

            to_dest = data["to_dest"]
            if len(to_dest) == 0:
                return Response(
                    {"errorMsg": "Please provide to destination"}, status=200
                )
            else:
                BookingOptionMaster.objects.get_or_create(
                    source_destination=to_dest, location=location, site=site
                )

            destination = f"{from_dest} - {to_dest}"

            consignor = data["consignor"]
            if len(consignor) == 0:
                return Response({"errorMsg": "Please provide  consignor"}, status=200)
            else:
                BookingOptionMaster.objects.get_or_create(
                    consignor=consignor, location=location, site=site
                )

            consignee = data["consignee"]
            if len(consignee) == 0:
                return Response({"errorMsg": "Please provide  consignee"}, status=200)
            else:
                BookingOptionMaster.objects.get_or_create(
                    consignee=consignee, location=location, site=site
                )

            no_of_pallets = data["no_of_pallets"]
            if len(no_of_pallets) == 0:
                return Response(
                    {"errorMsg": "Please provide  no of pallets"}, status=200
                )

            actual_weight = data["actual_weight"]
            if len(actual_weight) == 0:
                return Response(
                    {"errorMsg": "Please provide actual weight"}, status=200
                )

            charge_weight = data["charge_weight"]
            if len(charge_weight) == 0:
                return Response(
                    {"errorMsg": "Please provide actual weight"}, status=200
                )

            particulars = data["particulars"]
            if len(particulars) == 0:
                return Response({"errorMsg": "Please provide particulars"}, status=200)
            else:
                BookingOptionMaster.objects.get_or_create(
                    particulars=particulars, location=location, site=site
                )

            transporter_data = data["transporter_data"]

            transporter_str = transporter_data["transporter"]
            if not len(transporter_str) == 0:
                transporter = CreditorMaster.objects.get(
                    name=transporter_str,
                    category="Transporter",
                    location=location,
                    site=site,
                )
            else:
                transporter = None

            truck_no = transporter_data["truck_no"]
            if not len(truck_no) == 0:
                TruckMaster.objects.get_or_create(
                    truck_no=truck_no,
                    transporter=transporter,
                    location=location,
                    site=site,
                )

            driver_name_str = transporter_data["driver_name"]
            if not len(driver_name_str) == 0:
                driver_name = DriverMaster.objects.get(
                    name=driver_name_str, transporter=transporter
                )
            else:
                driver_name = None

            container_data = data["container_data"]

            container_no = container_data["container_no"]

            container_type = container_data["container_type"]

            container_size = container_data["container_size"]

            shipping_line = container_data["shipping_line"]
            if not len(shipping_line) == 0:
                BookingOptionMaster.objects.get_or_create(
                    shipping_line=shipping_line, location=location, site=site
                )

            seal_no = container_data["seal_no"]

            status = container_data["status"]
            if not len(status) == 0:
                BookingOptionMaster.objects.get_or_create(
                    status=status, location=location, site=site
                )

            booking_obj = BookingMaster.objects.get(pk=pk)

            port = container_data["port"]
            if not len(port) == 0:
                BookingOptionMaster.objects.get_or_create(
                    port=port, location=location, site=site
                )

            pod = container_data["pod"]
            if not len(pod) == 0:
                BookingOptionMaster.objects.get_or_create(
                    pod=pod, location=location, site=site
                )

            transportation_data = data["transportation_data"]

            tr_freight = transportation_data["tr_freight"]
            advance = transportation_data["advance"]
            advance_payment_type = transportation_data["advance_payment_type"]
            diesel_quantity = transportation_data["diesel_quantity"]
            diesel_rate = transportation_data["diesel_rate"]
            diesel_cost = float(diesel_rate) * float(diesel_quantity)
            fuel_pump_str = transportation_data["fuel_pump"]
            if not len(fuel_pump_str) == 0:
                fuel_pump = CreditorMaster.objects.get(
                    name=fuel_pump_str,
                    category="Fuel Pump",
                    location=location,
                    site=site,
                )
            else:
                fuel_pump = None

            detention_charges = transportation_data["detention_charges"]
            extra_charges = transportation_data["extra_charges"]
            balance = transportation_data["balance"]

            handling_data = data["handling_data"]
            loading_unloading = handling_data["loading_unloading"]
            handling_charges = handling_data["handling_charges"]

            handling_company = handling_data["handling_company"]
            if not len(handling_company) == 0:
                BookingOptionMaster.objects.get_or_create(
                    handling_company=handling_company, location=location, site=site
                )

            handling_payment_type = handling_data["handling_payment_type"]

            mnr_data = data["mnr_data"]
            washing_charges = mnr_data["washing_charges"]
            repair_charges = mnr_data["repair_charges"]

            weighing_data = data["weighing_data"]
            weighment_charges = weighing_data["weighment_charges"]

            booking_obj = BookingMaster.objects.get(pk=pk)
            booking_obj.l_date = l_date
            booking_obj.s_date = s_date
            booking_obj.from_dest = from_dest
            booking_obj.to_dest = to_dest
            booking_obj.destination = destination
            booking_obj.consignor = consignor
            booking_obj.consignee = consignee
            booking_obj.no_of_pallets = no_of_pallets
            booking_obj.actual_weight = actual_weight
            booking_obj.charge_weight = charge_weight
            booking_obj.particulars = particulars
            booking_obj.transporter = transporter
            booking_obj.truck_no = truck_no
            booking_obj.driver_name = driver_name
            booking_obj.container_no = container_no
            booking_obj.container_type = container_type
            booking_obj.container_size = container_size
            booking_obj.shipping_line = shipping_line
            booking_obj.seal_no = seal_no
            booking_obj.status = status
            booking_obj.port = port
            booking_obj.pod = pod
            booking_obj.tr_freight = tr_freight
            booking_obj.advance = advance
            booking_obj.advance_payment_type = advance_payment_type
            booking_obj.diesel_quantity = diesel_quantity
            booking_obj.diesel_rate = diesel_rate
            booking_obj.diesel_cost = diesel_cost
            booking_obj.fuel_pump = fuel_pump
            booking_obj.detention_charges = detention_charges
            booking_obj.extra_charges = extra_charges
            booking_obj.balance = balance
            booking_obj.loading_unloading = loading_unloading
            booking_obj.handling_charges = handling_charges
            booking_obj.handling_company = handling_company
            booking_obj.handling_payment_type = handling_payment_type
            booking_obj.washing_charges = washing_charges
            booking_obj.repair_charges = repair_charges
            booking_obj.weighment_charges = weighment_charges
            booking_obj.location = location
            booking_obj.site = site
            booking_obj.save()

            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)


class GetAllBookingEntry(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            pg_no = data["pg_no"]
            on_page_data = data["on_page_data"]
            location = data["location"]
            site = data["site"]
            lr_no = data["lr_no"]
            transporter = data["transporter"]
            consignor = data["consignor"]
            container_no = data["container_no"]
            truck_no = data["truck_no"]
            status = data["status"]
            fuel_pump = data["fuel_pump"]
            destination = data["destination"]
            consignee = data["consignee"]
            from_date = data["from_date"]
            to_date = data["to_date"]

            if location == "ALL":
                filtered_data = BookingMaster.objects.select_related("location", "site")
            elif site == "ALL":
                filtered_data = BookingMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = BookingMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if not len(lr_no) == 0:
                filtered_data = filtered_data.filter(lr_no=lr_no)

            if not len(transporter) == 0:
                filtered_data = filtered_data.filter(transporter__name=transporter)
            if not len(container_no) == 0:
                filtered_data = filtered_data.filter(container_no=container_no)

            if not len(consignor) == 0:
                filtered_data = filtered_data.filter(consignor=consignor)

            if not len(truck_no) == 0:
                filtered_data = filtered_data.filter(truck_no=truck_no)

            if not len(status) == 0:
                filtered_data = filtered_data.filter(status=status)

            if not len(fuel_pump) == 0:
                filtered_data = filtered_data.filter(fuel_pump=fuel_pump)

            if not len(destination) == 0:
                filtered_data = filtered_data.filter(destination=destination)

            if not len(consignee) == 0:
                filtered_data = filtered_data.filter(consignee=consignee)

            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(l_date__range=(from_date, to_date))

            paginator = Paginator(filtered_data, on_page_data)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            current_page = paginator.page(pg_no)
            on_page_data_count = (
                current_page.end_index() - current_page.start_index() + 1
            )
            prev_page = ""
            if current_page.has_previous():
                prev_page = current_page.previous_page_number()
            next_page = ""
            if current_page.has_next():
                next_page = current_page.next_page_number()
            response_data = [each.get_booking() for each in current_page]
            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": response_data,
                },
                status=200,
            )

        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteBookingEntry(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            for pk in data:
                bkg_obj = BookingMaster.objects.get(pk=pk)
                bkg_obj.delete()
                return Response({"successMsg": "Data Deleted"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class DownloadLR(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, pk, *args, **kwargs):

        try:
            data = request.data
            context = {}
            lr_object = BookingMaster.objects.get(pk=pk)
            type_of_copy = data["copy"]
            if type_of_copy == "CONSIGNOR":
                context["copy"] = "CONSIGNOR COPY"
            elif type_of_copy == "CONSIGNEE":
                context["copy"] = "CONSIGNEE COPY"
            elif type_of_copy == "DRIVER":
                context["copy"] = "DRIVER COPY"

            context["lr_no"] = lr_object.lr_no
            context["l_date"] = lr_object.l_date
            context["s_date"] = lr_object.s_date
            context["bill_party"] = lr_object.bill_party.name
            context["truck_no"] = lr_object.truck_no
            context["driver_name"] = lr_object.driver_name.name
            context["license_no"] = lr_object.driver_name.license_no
            context["mobile_no"] = lr_object.driver_name.mobile_no
            context["status"] = lr_object.status
            context["container_no"] = lr_object.container_no
            context["container_size"] = lr_object.container_size
            context["container_type"] = lr_object.container_type
            context["seal_no"] = lr_object.seal_no
            context["from_dest"] = lr_object.from_dest
            context["to_dest"] = lr_object.to_dest
            context["shipping_line"] = lr_object.shipping_line
            context["booking_no"] = lr_object.booking_no
            context["port"] = lr_object.port
            context["consignor"] = lr_object.consignor
            context["consignee"] = lr_object.consignee
            context["no_of_pallets"] = lr_object.no_of_pallets
            context["particulars"] = lr_object.particulars
            context["actual_weight"] = lr_object.actual_weight
            context["charge_weight"] = lr_object.charge_weight
            # for k, v in context.items():
            #     if v is None:
            #         context[k] = "-"

            return Response(context, status=200)

        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


# class BookingAndLR(views.APIView):

#     permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

#     def post(self, request, *args, **kwargs):
#         try:
#             data=request.data
#             location_str = data["location"]
#             site_str = data["site"]

#             f_year_start,f_year_end=get_fiscal_year_date()
#             fin_year=f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
#             count_obj=BookingMaster.objects.filter(financial_year=fin_year).count() + 1
#             booking_no = f"BO/{fin_year}/{str(count_obj).zfill(6)}"
#             lr_no=BookingMaster.objects.filter(location__name=location_str,site__name=site_str).count() + 1
#             return Response({
#                 "booking_no": str(booking_no),
#                 "lr_no": str(lr_no),
#             }, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
