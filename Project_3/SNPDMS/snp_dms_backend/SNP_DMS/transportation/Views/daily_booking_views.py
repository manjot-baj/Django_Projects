# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import traceback, logging, datetime
from num2words import num2words
from django.utils import timezone

# from transportation.functions import has_numbers
import re
from transportation.functions import check_num_or_special_char, check_alphabets

# model imports
from master.models import Location, Site
from transportation.models import (
    CreditorMaster,
    CustomerMaster,
    DriverMaster,
    TruckMaster,
    BookingMaster,
    BookingOptionMaster,
    BookingBill,
    BookingBillLine,
    ServiceTaxMaster,
    PaymentReceiptMaster,
    JournalVoucher,
    AccountMaster,
    TransactionLog,
    PurchaseMasterLine,
    PaymentReceiptLine,
    PurchaseMaster,
    InvoiceBillLine,
)
from transportation.functions import get_fiscal_year_date
from account.permissions import HasAllowedRoles

# data = {
#     "general_data": {
#         "entry_no": "",
#         "booking_no": "",
#         "booking_type": "",
#         "lr_no": "",
#         "l_date": "",
#         "s_date": "",
#         "from_dest": "",
#         "to_dest": "",
#         "destination": "",
#         "consignor": "",
#         "consignee": "",
#         "no_of_pallets": "",
#         "actual_weight": "",
#         "charge_weight": "",
#         "particulars": "",
#     },
#     "transportation_data": {
#         "transporter": "",
#         "truck_no": "",
#         "driver_name": "",
#         "license_no": "",
#         "mobile_no": "",
#         "container_type": "",
#         "container_size": "",
#         "container_no": "",
#         "shipping_line": "",
#         "seal_no": "",
#         "status": "",
#         "port": "",
#         "pod": "",
#     },
#     "charges": {
#         "tr_freight": "",
#         "advance": "",
#         "diesel_quantity": "",
#         "diesel_rate": "",
#         "diesel_cost": "",
#         "fuel_pump": "",
#         "detention_charges": "",
#         "extra_charges": "",
#         "balance": "",
#         "loading_unloading": "",
#         "handling_charges": "",
#         "handling_company": "",
#         "washing_charges": "",
#         "repair_charges": "",
#         "weighment_charges": "",
#     },
#     "bill": {
#         "bill_party": "",
#         "company_acc_name": "",
#         "bill_line": [
#             {
#                 "type_of_charge": "",
#                 "bill_amount": "",
#                 "rcm": "No"
#             },
#         ],
#     "location": "",
#     "site": "",
# }


class AddDailyBooking(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def transaction_logs(
        self,
        l_date,
        account_obj,
        location,
        site,
        vch_no,
        particular,
        creditor,
        payment_reciept_id,
        amount,
    ):
        created_at = datetime.datetime.now().astimezone(timezone.get_current_timezone())

        logs = TransactionLog.create(
            created_at=created_at,
            date=l_date,
            vch_no=vch_no,
            vch_type="PAYMENT",
            particular=particular,
            creditor=creditor,
            customer=None,
            effect_on=account_obj,
            transaction_type="Debit",
            transaction_method="CASH",
            booking_id=None,
            invoice_id=None,
            payment_receipt_id=payment_reciept_id,
            contra_id=None,
            journal_id=None,
            amount=amount,
            location=location,
            site=site,
        )
        logs.save()
        return logs

    def bill_line_empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def empty_str_to_none(self, items):
        return {each: float(0) if items[each] == "" else items[each] for each in items}

    def validate_main_data(self, data):
        try:
            mandatory_list = [
                "general_data",
                "transportation_data",
                "charges",
                "bill",
                "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}
            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_general_data(self, data):
        try:
            mandatory_list = [
                data["entry_no"],
                data["booking_type"],
                data["lr_no"],
                data["l_date"],
                data["s_date"],
                data["from_dest"],
                data["to_dest"],
                data["destination"],
                data["consignor"],
                data["consignee"],
                data["particulars"],
            ]
            if check_num_or_special_char(data["consignor"]) is True:
                return {"errorMsg": "Consignor must contain only alphabet"}
            if check_num_or_special_char(data["consignee"]) is True:
                return {"errorMsg": "Consignee must contain only alphabet"}
            if check_num_or_special_char(data["from_dest"]) is True:
                return {"errorMsg": "From Destination must contain only alphabet"}
            if check_num_or_special_char(data["to_dest"]) is True:
                return {"errorMsg": "To Destination must contain only alphabet"}
            if check_num_or_special_char(data["particulars"]) is True:
                return {"errorMsg": "Particulars must contain only alphabet"}

            if None in mandatory_list:
                return {"errorMsg": "Please Provide General Mandatory Data"}
            if data["no_of_pallets"] is None:
                data["no_of_pallets"] = 0
            if data["actual_weight"] is None:
                data["actual_weight"] = 0
            if data["charge_weight"] is None:
                data["charge_weight"] = 0
            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_transportation_data(self, data, location, site):
        try:
            mandatory_list = [
                data["transporter"],
                data["truck_no"],
                data["driver_name"],
                data["container_type"],
                data["container_size"],
                data["container_no"],
                data["shipping_line"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Transporatation Mandatory Data"}

            if (
                not CreditorMaster.objects.select_related("location", "site")
                .filter(
                    name=data["transporter"],
                    category="Transporter",
                    location=location,
                    site=site,
                )
                .exists()
            ):
                return {"errorMsg": "Transporter Does not Exist"}

            if check_num_or_special_char(data["status"]) is True:
                return {"errorMsg": "Status must contain only alphabet"}
            if check_num_or_special_char(data["port"]) is True:
                return {"errorMsg": "Port must contain only alphabet"}
            if check_num_or_special_char(data["pod"]) is True:
                return {"errorMsg": "POD must contain only alphabet"}
            if check_num_or_special_char(data["shipping_line"]) is True:
                return {"errorMsg": "Shipping Line must contain only alphabet"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_charges_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["tr_freight"],
                converted_data["advance"],
            ]
            check_list = [
                converted_data["tr_freight"],
                converted_data["advance"],
                converted_data["diesel_cost"],
                converted_data["diesel_quantity"],
                converted_data["diesel_rate"],
                converted_data["detention_charges"],
                converted_data["extra_charges"],
                converted_data["balance"],
                converted_data["loading_unloading"],
                converted_data["handling_charges"],
                converted_data["washing_charges"],
                converted_data["repair_charges"],
                converted_data["weighment_charges"],
            ]
            for each in check_list:
                if float(each) < float(0):
                    return {"errorMsg": "Negative value is not acceptable"}
            if (
                None in mandatory_list
                or converted_data["handling_charges"] is not None
                and converted_data["handling_company"] is None
            ):
                return {"errorMsg": "Please Provide Charges Mandatory Data"}

            if converted_data["tr_freight"] is None:
                converted_data["tr_freight"] = float(0)

            if converted_data["advance"] is None:
                converted_data["advance"] = float(0)

            if converted_data["diesel_quantity"] is None:
                converted_data["diesel_quantity"] = 0

            if converted_data["diesel_rate"] is None:
                converted_data["diesel_rate"] = float(0)

            if converted_data["diesel_cost"] is None:
                converted_data["diesel_cost"] = float(0)

            if converted_data["detention_charges"] is None:
                converted_data["detention_charges"] = float(0)

            if converted_data["extra_charges"] is None:
                converted_data["extra_charges"] = float(0)

            if converted_data["loading_unloading"] is None:
                converted_data["loading_unloading"] = float(0)

            if converted_data["handling_charges"] is None:
                converted_data["handling_charges"] = float(0)

            if converted_data["washing_charges"] is None:
                converted_data["washing_charges"] = float(0)

            if converted_data["repair_charges"] is None:
                converted_data["repair_charges"] = float(0)

            if converted_data["weighment_charges"] is None:
                converted_data["weighment_charges"] = float(0)
            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_bill_data(self, data, location, site):
        try:
            mandatory_list = ["bill_party", "bill_line"]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Bill Mandatory Data"}

            if len(data["bill_party"]) == 0:
                return {"errorMsg": "Please Provide BillParty"}

            if (
                not CustomerMaster.objects.select_related("location", "site")
                .filter(name=data["bill_party"], location=location, site=site)
                .exists()
            ):
                return {"errorMsg": "Bill Party Customer Does not Exist"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_bill_line_data(self, data, location, site):
        try:
            converted_data = self.bill_line_empty_str_to_none(data)
            mandatory_list = [
                converted_data["type_of_charge"],
                converted_data["bill_amount"],
                converted_data["rcm"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Bill Line Mandatory Data"}

            if not check_alphabets(converted_data["bill_amount"]):
                return {"errorMsg": "Bill Amount accepts numbers only"}

            if (
                not ServiceTaxMaster.objects.select_related("location", "site")
                .filter(
                    description=converted_data["type_of_charge"],
                    location=location,
                    site=site,
                )
                .exists()
            ):
                return {"errorMsg": "Service Does not Exist"}

            if converted_data["bill_amount"] is None:
                converted_data["bill_amount"] = float(0)

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def post(self, request, *args, **kwargs):
        try:
            data = self.validate_main_data(request.data)
            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            if "errorMsg" in data.keys():
                return Response(data, status=200)
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])

            # general_data
            general_data = self.validate_general_data(data["general_data"])
            if "errorMsg" in general_data.keys():
                return Response(general_data, status=200)
            entry_no_main = general_data["entry_no"]
            lr_no = general_data["lr_no"]
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            if not "pk" in data.keys():
                if BookingMaster.checkEntryNo(
                    entry_no_main, lr_no, financial_year, location, site
                ):
                    return Response({"errorMsg": "Data Already exists"}, status=200)

            booking_type = general_data["booking_type"]
            l_date = datetime.datetime.strptime(
                general_data["l_date"], "%Y-%m-%d"
            ).date()
            s_date = datetime.datetime.strptime(
                general_data["s_date"], "%Y-%m-%d"
            ).date()
            from_dest = general_data["from_dest"]
            to_dest = general_data["to_dest"]
            destination = general_data["destination"]
            consignor = general_data["consignor"]
            consignee = general_data["consignee"]
            particulars = general_data["particulars"]
            booking_no = general_data["booking_no"]
            no_of_pallets = int(0)
            if general_data["no_of_pallets"] == "":
                no_of_pallets = 0
            else:
                no_of_pallets = general_data["no_of_pallets"]
            actual_weight = general_data["actual_weight"]
            charge_weight = general_data["charge_weight"]

            if not from_dest == "":
                BookingOptionMaster.objects.get_or_create(
                    source_destination=from_dest, location=location, site=site
                )
            if not to_dest == "":
                BookingOptionMaster.objects.get_or_create(
                    source_destination=to_dest, location=location, site=site
                )
            if not consignor == "":
                BookingOptionMaster.objects.get_or_create(
                    consignor=consignor, location=location, site=site
                )
            if not consignee == "":
                BookingOptionMaster.objects.get_or_create(
                    consignee=consignee, location=location, site=site
                )
            if not particulars == "":
                BookingOptionMaster.objects.get_or_create(
                    particulars=particulars, location=location, site=site
                )

            # transportation_data
            transportation_data = self.validate_transportation_data(
                data=data["transportation_data"], location=location, site=site
            )
            if "errorMsg" in transportation_data.keys():
                return Response(transportation_data, status=200)

            transporter = CreditorMaster.objects.get(
                name=transportation_data["transporter"],
                category="Transporter",
                location=location,
                site=site,
            )

            truck = None
            if (
                TruckMaster.objects.select_related("transporter")
                .filter(
                    truck_no=transportation_data["truck_no"], transporter=transporter
                )
                .exists()
            ):
                truck = TruckMaster.objects.get(
                    truck_no=transportation_data["truck_no"], transporter=transporter
                )
            else:
                truck = TruckMaster(
                    truck_no=transportation_data["truck_no"], transporter=transporter
                )
                truck.save()

            driver = None
            if (
                DriverMaster.objects.select_related("transporter")
                .filter(
                    name=transportation_data["driver_name"], transporter=transporter
                )
                .exists()
            ):
                driver = DriverMaster.objects.get(
                    name=transportation_data["driver_name"], transporter=transporter
                )
                driver.license_no = transportation_data["license_no"]
                driver.mobile_no = transportation_data["mobile_no"]
                driver.save()
            else:
                driver = DriverMaster(
                    name=transportation_data["driver_name"],
                    transporter=transporter,
                    license_no=transportation_data["license_no"],
                    mobile_no=transportation_data["mobile_no"],
                )
                driver.save()

            container_type = transportation_data["container_type"]
            container_size = transportation_data["container_size"]
            container_no = transportation_data["container_no"]
            shipping_line = transportation_data["shipping_line"]
            if not shipping_line == "":
                BookingOptionMaster.objects.get_or_create(
                    shipping_line=shipping_line, location=location, site=site
                )
            seal_no = transportation_data["seal_no"]
            status = transportation_data["status"]
            if not status == "":
                BookingOptionMaster.objects.get_or_create(
                    status=status, location=location, site=site
                )
            port = transportation_data["port"]
            if not port == "":
                BookingOptionMaster.objects.get_or_create(
                    port=port, location=location, site=site
                )
            pod = transportation_data["pod"]
            if not pod == "":
                BookingOptionMaster.objects.get_or_create(
                    pod=pod, location=location, site=site
                )

            # charges data
            charges = self.validate_charges_data(data["charges"])
            if "errorMsg" in charges.keys():
                return Response(charges, status=200)

            tr_freight = float(charges["tr_freight"])
            advance = float(charges["advance"])
            diesel_quantity = float(charges["diesel_quantity"])
            diesel_rate = float(charges["diesel_rate"])
            diesel_cost = float(charges["diesel_cost"])
            fuel_pump = None
            fuel_pump_str = charges["fuel_pump"]
            if charges["fuel_pump"] == float(0):
                fuel_pump_str = None
            creditor = CreditorMaster.objects.select_related("location", "site")
            if fuel_pump_str is not None:
                if creditor.filter(
                    name=charges["fuel_pump"],
                    category="Fuel Pump",
                    location=location,
                    site=site,
                ).exists():
                    fuel_pump = CreditorMaster.objects.get(
                        name=charges["fuel_pump"],
                        category="Fuel Pump",
                        location=location,
                        site=site,
                    )
                else:
                    fuel_pump = CreditorMaster(
                        name=charges["fuel_pump"],
                        category="Fuel Pump",
                        location=location,
                        site=site,
                    )
                    fuel_pump.save()

            detention_charges = float(charges["detention_charges"])
            extra_charges = float(charges["extra_charges"])
            loading_unloading = float(charges["loading_unloading"])
            handling_charges = float(charges["handling_charges"])
            handling_company = charges["handling_company"]
            if charges["handling_company"] == float(0):
                handling_company = None
            if handling_company is not None:
                BookingOptionMaster.objects.get_or_create(
                    handling_company=handling_company, location=location, site=site
                )
                if not creditor.filter(
                    name=charges["handling_company"],
                    category="Container Yard",
                    location=location,
                    site=site,
                ).exists():
                    new_handling = CreditorMaster(
                        name=charges["handling_company"],
                        category="Container Yard",
                        state=site.state,
                        state_code=site.state_code,
                        location=location,
                        site=site,
                    )
                    new_handling.save()

            washing_charges = float(charges["washing_charges"])
            repair_charges = float(charges["repair_charges"])
            weighment_charges = float(charges["weighment_charges"])

            # calculations
            diesel_cost = diesel_rate * diesel_quantity
            total_paid = advance + diesel_cost
            balance = (tr_freight - total_paid) + detention_charges + extra_charges

            # Bill for Customer
            # Bill

            bill = self.validate_bill_data(
                data=data["bill"], location=location, site=site
            )
            if "errorMsg" in bill.keys():
                return Response(bill, status=200)

            bill_party = CustomerMaster.objects.get(
                name=bill["bill_party"], location=location, site=site
            )
            company_account_name = bill["company_acc_name"]

            # Bill Lines
            validated_bill_lines = None
            if not len(bill["bill_line"]) == 0:
                validated_bill_lines = [
                    self.validate_bill_line_data(
                        data=line, location=location, site=site
                    )
                    for line in bill["bill_line"]
                ]
            for each in validated_bill_lines:
                if "errorMsg" in each.keys():
                    return Response(each, status=200)

            if not "pk" in data.keys():
                booking_entry = BookingMaster.create(
                    booking_type=booking_type,
                    entry_no=entry_no_main,
                    booking_no=booking_no,
                    lr_no=lr_no,
                    financial_year=financial_year,
                    is_draft=False,
                    is_proceed=True,
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
                    bill_party=bill_party,
                    transporter=transporter,
                    truck=truck,
                    driver=driver,
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
                    washing_charges=washing_charges,
                    repair_charges=repair_charges,
                    weighment_charges=weighment_charges,
                    transaction_effected=True,
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
                total_bill_amount = float(0)
                for line in validated_bill_lines:
                    type_of_charge = ServiceTaxMaster.objects.get(
                        description=line["type_of_charge"],
                        location=location,
                        site=site,
                    )
                    bill_amount = float(line["bill_amount"])
                    total_bill_amount += bill_amount
                    rcm = line["rcm"]

                    bill_line = BookingBillLine.create(
                        type_of_charge=type_of_charge,
                        bill_amount=bill_amount,
                        rcm=rcm,
                        booking_bill=bill_entry,
                    )
                    bill_line.save()

                logs = TransactionLog.create(
                    created_at=created_at,
                    date=l_date,
                    vch_no=entry_no_main,
                    vch_type="BOOKING",
                    particular=entry_no_main,
                    creditor=transporter,
                    customer=None,
                    effect_on=None,
                    transaction_type="Credit",
                    transaction_method=None,
                    booking_id=booking_entry.pk,
                    invoice_id=None,
                    payment_receipt_id=None,
                    contra_id=None,
                    journal_id=None,
                    amount=tr_freight,
                    location=location,
                    site=site,
                )
                logs.save()
            else:
                booking_entry = BookingMaster.objects.get(pk=data["pk"])
                booking_entry.booking_type = booking_type
                booking_entry.entry_no = entry_no_main
                booking_entry.lr_no = lr_no
                booking_entry.booking_no = booking_no
                booking_entry.l_date = l_date
                booking_entry.s_date = s_date
                booking_entry.from_dest = from_dest
                booking_entry.to_dest = to_dest
                booking_entry.destination = destination
                booking_entry.consignor = consignor
                booking_entry.consignee = consignee
                booking_entry.no_of_pallets = no_of_pallets
                booking_entry.actual_weight = actual_weight
                booking_entry.charge_weight = charge_weight
                booking_entry.particulars = particulars
                booking_entry.bill_party = bill_party
                booking_entry.transporter = transporter
                booking_entry.truck = truck
                booking_entry.driver = driver
                booking_entry.container_no = container_no
                booking_entry.container_type = container_type
                booking_entry.container_size = container_size
                booking_entry.shipping_line = shipping_line
                booking_entry.seal_no = seal_no
                booking_entry.status = status
                booking_entry.port = port
                booking_entry.pod = pod
                booking_entry.tr_freight = tr_freight
                booking_entry.advance = advance
                booking_entry.diesel_quantity = diesel_quantity
                booking_entry.diesel_rate = diesel_rate
                booking_entry.diesel_cost = diesel_cost
                booking_entry.fuel_pump = fuel_pump
                booking_entry.detention_charges = detention_charges
                booking_entry.extra_charges = extra_charges
                booking_entry.balance = balance
                booking_entry.loading_unloading = loading_unloading
                booking_entry.handling_charges = handling_charges
                booking_entry.handling_company = handling_company
                booking_entry.washing_charges = washing_charges
                booking_entry.repair_charges = repair_charges
                booking_entry.weighment_charges = weighment_charges
                booking_entry.transaction_effected = True
                booking_entry.location = location
                booking_entry.site = site
                booking_entry.save()

                if not len(data["delete_line_list"]) == 0:
                    for each in data["delete_line_list"]:
                        delete_obj = BookingBillLine.objects.filter(pk=each)
                        delete_obj.delete()

                if not "pk" in bill.keys():
                    bill_entry = BookingBill.create(
                        booking=booking_entry,
                        bill_party=bill_party,
                        company_account_name=company_account_name,
                    )
                    bill_entry.save()
                else:
                    bill_entry = BookingBill.objects.get(pk=bill["pk"])
                    bill_entry.bill_party = bill_party
                    bill_entry.company_account_name = company_account_name
                    bill_entry.save()

                for line in validated_bill_lines:
                    type_of_charge = ServiceTaxMaster.objects.get(
                        description=line["type_of_charge"],
                        location=location,
                        site=site,
                    )
                    bill_amount = line["bill_amount"]
                    rcm = line["rcm"]
                    if not "pk" in line.keys() or line["pk"] is None:
                        new_bill_line = BookingBillLine.create(
                            type_of_charge=type_of_charge,
                            bill_amount=bill_amount,
                            rcm=rcm,
                            booking_bill=bill_entry,
                        )
                        new_bill_line.save()
                    else:
                        bill_line = BookingBillLine.objects.get(pk=line["pk"])
                        bill_line.type_of_charge = type_of_charge
                        bill_line.bill_amount = bill_amount
                        bill_line.rcm = rcm
                        bill_line.save()
                booking_entry.is_proceed = True
                booking_entry.is_draft = False
                booking_entry.save()
                logs = TransactionLog.create(
                    created_at=created_at,
                    date=l_date,
                    vch_no=entry_no_main,
                    vch_type="BOOKING",
                    particular=entry_no_main,
                    creditor=transporter,
                    customer=None,
                    effect_on=None,
                    transaction_type="Credit",
                    transaction_method=None,
                    booking_id=booking_entry.pk,
                    invoice_id=None,
                    payment_receipt_id=None,
                    contra_id=None,
                    journal_id=None,
                    amount=tr_freight,
                    location=location,
                    site=site,
                )
                logs.save()

            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )

            payment_reciept_obj = PaymentReceiptMaster.objects.select_related(
                "location", "site"
            ).filter(financial_year=financial_year, location=location, site=site)
            journal_voucher_obj = JournalVoucher.objects.select_related(
                "location", "site"
            ).filter(financial_year=financial_year, location=location, site=site)

            account_obj = AccountMaster.objects.get(
                account_type="CASH_ON_HAND", location=location, site=site
            )

            if not advance == float(0):
                # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                check_number = payment_reciept_obj.count() + 1
                entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                while payment_reciept_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                    if not payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                advance_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=l_date,
                    customer=None,
                    creditor=transporter,
                    truck_no=truck.truck_no,
                    extra_charges="Advance",
                    narration=f"LR No: {lr_no}, Trasnporter: {transporter.name},Truck No: {truck.truck_no}",
                    pay_remarks=None,
                    receipt_amount=advance,
                    kasar=float(0),
                    tds=float(0),
                    total_amount=advance,
                    transaction_from=account_obj,
                    booking_id=booking_entry.pk,
                    location=location,
                    site=site,
                )
                advance_voucher.save()
                self.transaction_logs(
                    l_date,
                    account_obj,
                    location,
                    site,
                    vch_no=entry_no,
                    particular=f"LR No: {lr_no}, Trasnporter: {transporter.name},Truck No: {truck.truck_no}",
                    creditor=transporter,
                    payment_reciept_id=advance_voucher.pk,
                    amount=advance,
                )
                account_obj.total_balance = float(account_obj.total_balance) - advance
                account_obj.save()

            if not handling_charges == float(0):
                # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                check_number = payment_reciept_obj.count() + 1
                entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                while payment_reciept_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                    if not payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                handling = CreditorMaster.objects.get(
                    name=handling_company,
                    category="Container Yard",
                    location=location,
                    site=site,
                )

                handling_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=l_date,
                    customer=None,
                    creditor=handling,
                    truck_no=truck.truck_no,
                    extra_charges="Handling",
                    narration=f"LR No: {lr_no}, Handling: {handling_company}",
                    pay_remarks=None,
                    receipt_amount=handling_charges,
                    kasar=float(0),
                    tds=float(0),
                    total_amount=handling_charges,
                    transaction_from=account_obj,
                    booking_id=booking_entry.pk,
                    location=location,
                    site=site,
                )
                handling_voucher.save()

                self.transaction_logs(
                    l_date,
                    account_obj,
                    location,
                    site,
                    vch_no=entry_no,
                    particular=f"LR No: {lr_no}, Handling: {handling_company}",
                    creditor=handling,
                    payment_reciept_id=handling_voucher.pk,
                    amount=handling_charges,
                )
                account_obj.total_balance = (
                    float(account_obj.total_balance) - handling_charges
                )
                account_obj.save()

            if not weighment_charges == float(0):
                # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                check_number = payment_reciept_obj.count() + 1
                entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                while payment_reciept_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                    if not payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                weighing_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=l_date,
                    customer=None,
                    creditor=None,
                    truck_no=truck.truck_no,
                    extra_charges="Weighment",
                    narration=f"LR No: {lr_no} - Weighment",
                    pay_remarks=None,
                    receipt_amount=weighment_charges,
                    kasar=float(0),
                    tds=float(0),
                    total_amount=weighment_charges,
                    transaction_from=account_obj,
                    booking_id=booking_entry.pk,
                    location=location,
                    site=site,
                )
                weighing_voucher.save()
                self.transaction_logs(
                    l_date,
                    account_obj,
                    location,
                    site,
                    vch_no=entry_no,
                    particular=f"LR No: {lr_no} - Weighment",
                    creditor=None,
                    payment_reciept_id=weighing_voucher.pk,
                    amount=weighment_charges,
                )
                account_obj.total_balance = (
                    float(account_obj.total_balance) - weighment_charges
                )
                account_obj.save()

            if not washing_charges == float(0):
                # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                check_number = payment_reciept_obj.count() + 1
                entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                while payment_reciept_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                    if not payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                washing_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=l_date,
                    customer=None,
                    creditor=None,
                    truck_no=truck.truck_no,
                    extra_charges="Washing",
                    narration=f"LR No: {lr_no} - Washing",
                    pay_remarks=None,
                    receipt_amount=washing_charges,
                    kasar=float(0),
                    tds=float(0),
                    total_amount=washing_charges,
                    transaction_from=account_obj,
                    booking_id=booking_entry.pk,
                    location=location,
                    site=site,
                )
                washing_voucher.save()
                self.transaction_logs(
                    l_date,
                    account_obj,
                    location,
                    site,
                    vch_no=entry_no,
                    particular=f"LR No: {lr_no} - Washing",
                    creditor=None,
                    payment_reciept_id=washing_voucher.pk,
                    amount=washing_charges,
                )
                account_obj.total_balance = (
                    float(account_obj.total_balance) - washing_charges
                )
                account_obj.save()

            if not loading_unloading == float(0):
                # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                check_number = payment_reciept_obj.count() + 1
                entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                while payment_reciept_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                    if not payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                loading_unloading_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=l_date,
                    customer=None,
                    creditor=None,
                    truck_no=truck.truck_no,
                    extra_charges="Loading/Unloading",
                    narration=f"LR No: {lr_no} - Loading/Unloading",
                    pay_remarks=None,
                    receipt_amount=loading_unloading,
                    kasar=float(0),
                    tds=float(0),
                    total_amount=loading_unloading,
                    transaction_from=account_obj,
                    booking_id=booking_entry.pk,
                    location=location,
                    site=site,
                )
                loading_unloading_voucher.save()
                self.transaction_logs(
                    l_date,
                    account_obj,
                    location,
                    site,
                    vch_no=entry_no,
                    particular=f"LR No: {lr_no} - Loading/Unloading",
                    creditor=None,
                    payment_reciept_id=loading_unloading_voucher.pk,
                    amount=loading_unloading,
                )
                account_obj.total_balance = (
                    float(account_obj.total_balance) - loading_unloading
                )
                account_obj.save()

            if not repair_charges == float(0):
                # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                check_number = payment_reciept_obj.count() + 1
                entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                while payment_reciept_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                    if not payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                repair_voucher = PaymentReceiptMaster.create(
                    payment_receipt_type="CASH",
                    entry_type="Normal",
                    transaction="Payment",
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=l_date,
                    customer=None,
                    creditor=None,
                    truck_no=truck.truck_no,
                    extra_charges="Repairing",
                    narration=f"LR No: {lr_no} - Repairing",
                    pay_remarks=None,
                    receipt_amount=repair_charges,
                    kasar=float(0),
                    tds=float(0),
                    total_amount=repair_charges,
                    transaction_from=account_obj,
                    booking_id=booking_entry.pk,
                    location=location,
                    site=site,
                )
                repair_voucher.save()
                self.transaction_logs(
                    l_date,
                    account_obj,
                    location,
                    site,
                    vch_no=entry_no,
                    particular=f"LR No: {lr_no} - Repairing",
                    creditor=None,
                    payment_reciept_id=repair_voucher.pk,
                    amount=repair_charges,
                )
                account_obj.total_balance = (
                    float(account_obj.total_balance) - repair_charges
                )
                account_obj.save()

            # Journal Voucher

            if not handling_charges == float(0):
                # journal_entry_no = f"JV/C/{financial_year}/{str(journal_voucher_obj.count()+1).zfill(6)}"
                check_number = journal_voucher_obj.count() + 1
                entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"

                while journal_voucher_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"
                    if not journal_voucher_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                hanling_journal_voucher = JournalVoucher.create(
                    transaction="Debit",
                    financial_year=financial_year,
                    entry_no=entry_no,
                    entry_date=l_date,
                    account_name=handling_company,
                    narration=f"LR No: {lr_no}",
                    amount=handling_charges,
                    under_account_name=transporter.name,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                hanling_journal_voucher.save()

            if not (diesel_cost) == float(0):
                # journal_entry_no = f"JV/C/{financial_year}/{str(journal_voself.traucher_obj.count()+1).zfill(6)}"
                check_number = journal_voucher_obj.count() + 1
                entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"

                while journal_voucher_obj.filter(
                    entry_no=entry_no,
                ).exists():
                    check_number = check_number + 1
                    entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"
                    if not journal_voucher_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        break

                diesel_voucher = JournalVoucher.create(
                    transaction="Debit",
                    financial_year=financial_year,
                    entry_no=entry_no,
                    entry_date=l_date,
                    account_name=fuel_pump.name,
                    narration=f"LR No: {lr_no}, Fuel Pump: {fuel_pump.name}",
                    amount=diesel_cost,
                    under_account_name=transporter.name,
                    booking=booking_entry,
                    location=location,
                    site=site,
                )
                diesel_voucher.save()
                logs = TransactionLog.create(
                    created_at=created_at,
                    date=l_date,
                    vch_no=entry_no,
                    vch_type="JOURNAL",
                    particular=f"LR No: {lr_no}, Fuel Pump: {fuel_pump.name}",
                    creditor=fuel_pump,
                    customer=None,
                    effect_on=account_obj,
                    transaction_type="Debit",
                    transaction_method="CASH",
                    booking_id=None,
                    invoice_id=None,
                    payment_receipt_id=None,
                    contra_id=None,
                    journal_id=diesel_voucher.pk,
                    amount=diesel_cost,
                    location=location,
                    site=site,
                )
                logs.save()
                account_obj.total_balance = (
                    float(account_obj.total_balance) - diesel_cost
                )
                account_obj.save()

            return Response(
                {"successMsg": "Data Saved", "pk": booking_entry.pk}, status=200
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)


class UpdateDailyBooking(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def transaction_logs(
        self,
        l_date,
        account_obj,
        location,
        site,
        vch_no,
        particular,
        creditor,
        payment_reciept_id,
        amount,
    ):
        created_at = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        logs = TransactionLog.create(
            created_at=created_at,
            date=l_date,
            vch_no=vch_no,
            vch_type="PAYMENT",
            particular=particular,
            creditor=creditor,
            customer=None,
            effect_on=account_obj,
            transaction_type="Debit",
            transaction_method="CASH",
            booking_id=None,
            invoice_id=None,
            payment_receipt_id=payment_reciept_id,
            contra_id=None,
            journal_id=None,
            amount=amount,
            location=location,
            site=site,
        )
        logs.save()
        return logs

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_main_data(self, data):
        try:
            mandatory_list = [
                "general_data",
                "transportation_data",
                "charges",
                "bill",
                "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}
            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_general_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["entry_no"],
                converted_data["booking_type"],
                converted_data["lr_no"],
                converted_data["l_date"],
                converted_data["s_date"],
                converted_data["from_dest"],
                converted_data["to_dest"],
                converted_data["destination"],
                converted_data["consignor"],
                converted_data["consignee"],
                converted_data["particulars"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide General Mandatory Data"}
            if check_num_or_special_char(converted_data["consignor"]) is True:
                return {"errorMsg": "Consignor must contain only alphabet"}
            if check_num_or_special_char(converted_data["consignee"]) is True:
                return {"errorMsg": "Consignee must contain only alphabet"}
            if check_num_or_special_char(converted_data["from_dest"]) is True:
                return {"errorMsg": "From Destination must contain only alphabet"}
            if check_num_or_special_char(converted_data["to_dest"]) is True:
                return {"errorMsg": "To Destination must contain only alphabet"}
            if check_num_or_special_char(converted_data["particulars"]) is True:
                return {"errorMsg": "Particulars must contain only alphabet"}
            if converted_data["no_of_pallets"] is None:
                converted_data["no_of_pallets"] = 0
            if converted_data["actual_weight"] is None:
                converted_data["actual_weight"] = 0
            if converted_data["charge_weight"] is None:
                converted_data["charge_weight"] = 0
            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_transportation_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["transporter"],
                converted_data["truck_no"],
                converted_data["driver_name"],
                converted_data["container_type"],
                converted_data["container_size"],
                converted_data["container_no"],
                converted_data["shipping_line"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Transporatation Mandatory Data"}

            if (
                not CreditorMaster.objects.select_related("location", "site")
                .filter(
                    name=converted_data["transporter"],
                    category="Transporter",
                    location=location,
                    site=site,
                )
                .exists()
            ):
                return {"errorMsg": "Transporter Does not Exist"}

            if check_num_or_special_char(converted_data["status"]) is True:
                return {"errorMsg": "Status must contain only alphabet"}
            if check_num_or_special_char(converted_data["port"]) is True:
                return {"errorMsg": "Port must contain only alphabet"}
            if check_num_or_special_char(converted_data["pod"]) is True:
                return {"errorMsg": "POD must contain only alphabet"}
            if check_num_or_special_char(data["shipping_line"]) is True:
                return {"errorMsg": "Shipping Line must contain only alphabet"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_charges_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["tr_freight"],
                converted_data["advance"],
            ]
            check_list = [
                converted_data["tr_freight"],
                converted_data["advance"],
                converted_data["diesel_cost"],
                converted_data["diesel_quantity"],
                converted_data["diesel_rate"],
                converted_data["detention_charges"],
                converted_data["extra_charges"],
                converted_data["balance"],
                converted_data["loading_unloading"],
                converted_data["handling_charges"],
                converted_data["washing_charges"],
                converted_data["repair_charges"],
                converted_data["weighment_charges"],
            ]
            for each in check_list:
                if float(each) < float(0):
                    return {"errorMsg": "Negative value is not acceptable"}
            if (
                None in mandatory_list
                or converted_data["handling_charges"] is not None
                and converted_data["handling_company"] is None
            ):
                return {"errorMsg": "Please Provide Charges Mandatory Data"}

            if converted_data["tr_freight"] is None:
                converted_data["tr_freight"] = float(0)

            if converted_data["advance"] is None:
                converted_data["advance"] = float(0)

            if converted_data["diesel_quantity"] is None:
                converted_data["diesel_quantity"] = 0

            if converted_data["diesel_rate"] is None:
                converted_data["diesel_rate"] = float(0)

            if converted_data["diesel_cost"] is None:
                converted_data["diesel_cost"] = float(0)

            if converted_data["detention_charges"] is None:
                converted_data["detention_charges"] = float(0)

            if converted_data["extra_charges"] is None:
                converted_data["extra_charges"] = float(0)

            if converted_data["loading_unloading"] is None:
                converted_data["loading_unloading"] = float(0)

            if converted_data["handling_charges"] is None:
                converted_data["handling_charges"] = float(0)

            if converted_data["washing_charges"] is None:
                converted_data["washing_charges"] = float(0)

            if converted_data["repair_charges"] is None:
                converted_data["repair_charges"] = float(0)

            if converted_data["weighment_charges"] is None:
                converted_data["weighment_charges"] = float(0)
            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_bill_data(self, data, location, site):
        try:
            mandatory_list = ["bill_party", "bill_line"]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Bill Mandatory Data"}

            if len(data["bill_party"]) == 0:
                return {"errorMsg": "Please Provide BillParty"}

            if (
                not CustomerMaster.objects.select_related("location", "site")
                .filter(name=data["bill_party"], location=location, site=site)
                .exists()
            ):
                return {"errorMsg": "Bill Party Customer Does not Exist"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_bill_line_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["type_of_charge"],
                converted_data["bill_amount"],
                converted_data["rcm"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Bill Line Mandatory Data"}

            if not check_alphabets(converted_data["bill_amount"]):
                return {"errorMsg": "Bill Amount accepts numbers only"}

            if (
                not ServiceTaxMaster.objects.select_related("location", "site")
                .filter(
                    description=converted_data["type_of_charge"],
                    location=location,
                    site=site,
                )
                .exists()
            ):
                return {"errorMsg": "Service Does not Exist"}

            if converted_data["bill_amount"] is None:
                converted_data["bill_amount"] = float(0)

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            booking_obj = BookingMaster.objects.get(pk=pk)
            data = booking_obj.get_booking_data()
            if not BookingBill.objects.filter(booking=booking_obj).exists():
                data["bill"] = {
                    "bill_party": "",
                    "company_acc_name": "",
                    "bill_line": [],
                }
            else:
                bill = BookingBill.objects.get(booking=booking_obj)
                bill_line_obj = BookingBillLine.objects.filter(booking_bill=bill)
                data["bill"] = {
                    "pk": str(bill.pk),
                    "bill_party": ""
                    if bill.bill_party is None
                    else bill.bill_party.name,
                    "company_acc_name": bill.company_account_name,
                    "bill_line": [],
                }
                bill_line = [
                    {
                        "pk": str(line.pk),
                        "type_of_charge": line.type_of_charge.description,
                        "bill_amount": str(float(line.bill_amount)),
                        "rcm": line.rcm,
                    }
                    for line in bill_line_obj
                ]
                data["bill"]["bill_line"] = bill_line
            data["delete_line_list"] = []
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            booking_entry = BookingMaster.objects.get(pk=pk)
            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            if booking_entry.transaction_effected:
                return Response(
                    {"errorMsg": "Please Cancel Transaction Effect"}, status=200
                )
            else:
                data = self.validate_main_data(request.data)
                if "errorMsg" in data.keys():
                    return Response(data, status=200)
                location = Location.objects.get(name=data["location"])
                site = Site.objects.get(name=data["site"])

                # general_data
                general_data = self.validate_general_data(data["general_data"])
                if "errorMsg" in general_data.keys():
                    return Response(general_data, status=200)
                entry_no_main = general_data["entry_no"]
                booking_type = general_data["booking_type"]
                lr_no = general_data["lr_no"]
                l_date = datetime.datetime.strptime(
                    general_data["l_date"], "%Y-%m-%d"
                ).date()
                s_date = datetime.datetime.strptime(
                    general_data["s_date"], "%Y-%m-%d"
                ).date()
                from_dest = general_data["from_dest"]
                to_dest = general_data["to_dest"]
                destination = general_data["destination"]
                consignor = general_data["consignor"]
                consignee = general_data["consignee"]
                particulars = general_data["particulars"]
                booking_no = general_data["booking_no"]
                no_of_pallets = general_data["no_of_pallets"]
                actual_weight = general_data["actual_weight"]
                charge_weight = general_data["charge_weight"]

                if from_dest is not None:
                    BookingOptionMaster.objects.get_or_create(
                        source_destination=from_dest, location=location, site=site
                    )
                if to_dest is not None:
                    BookingOptionMaster.objects.get_or_create(
                        source_destination=to_dest, location=location, site=site
                    )
                if consignor is not None:
                    BookingOptionMaster.objects.get_or_create(
                        consignor=consignor, location=location, site=site
                    )
                if consignee is not None:
                    BookingOptionMaster.objects.get_or_create(
                        consignee=consignee, location=location, site=site
                    )
                if particulars is not None:
                    BookingOptionMaster.objects.get_or_create(
                        particulars=particulars, location=location, site=site
                    )

                # transportation_data
                transportation_data = self.validate_transportation_data(
                    data=data["transportation_data"], location=location, site=site
                )
                if "errorMsg" in transportation_data.keys():
                    return Response(transportation_data, status=200)

                transporter = CreditorMaster.objects.get(
                    name=transportation_data["transporter"],
                    category="Transporter",
                    location=location,
                    site=site,
                )

                truck = None
                if (
                    TruckMaster.objects.select_related("transporter")
                    .filter(
                        truck_no=transportation_data["truck_no"],
                        transporter=transporter,
                    )
                    .exists()
                ):
                    truck = TruckMaster.objects.get(
                        truck_no=transportation_data["truck_no"],
                        transporter=transporter,
                    )
                else:
                    truck = TruckMaster(
                        truck_no=transportation_data["truck_no"],
                        transporter=transporter,
                    )
                    truck.save()

                driver = None
                if (
                    DriverMaster.objects.select_related("transporter")
                    .filter(
                        name=transportation_data["driver_name"], transporter=transporter
                    )
                    .exists()
                ):
                    driver = DriverMaster.objects.get(
                        name=transportation_data["driver_name"], transporter=transporter
                    )
                    driver.license_no = transportation_data["license_no"]
                    driver.mobile_no = transportation_data["mobile_no"]
                    driver.save()
                else:
                    driver = DriverMaster(
                        name=transportation_data["driver_name"],
                        transporter=transporter,
                        license_no=transportation_data["license_no"],
                        mobile_no=transportation_data["mobile_no"],
                    )
                    driver.save()

                container_type = transportation_data["container_type"]
                container_size = transportation_data["container_size"]
                container_no = transportation_data["container_no"]
                shipping_line = transportation_data["shipping_line"]
                if shipping_line is not None:
                    BookingOptionMaster.objects.get_or_create(
                        shipping_line=shipping_line, location=location, site=site
                    )
                seal_no = transportation_data["seal_no"]
                status = transportation_data["status"]
                if status is not None:
                    BookingOptionMaster.objects.get_or_create(
                        status=status, location=location, site=site
                    )
                port = transportation_data["port"]
                if port is not None:
                    BookingOptionMaster.objects.get_or_create(
                        port=port, location=location, site=site
                    )
                pod = transportation_data["pod"]
                if pod is not None:
                    BookingOptionMaster.objects.get_or_create(
                        pod=pod, location=location, site=site
                    )

                # charges data
                charges = self.validate_charges_data(data["charges"])
                if "errorMsg" in charges.keys():
                    return Response(charges, status=200)

                tr_freight = float(charges["tr_freight"])
                advance = float(charges["advance"])
                diesel_quantity = float(charges["diesel_quantity"])
                diesel_rate = float(charges["diesel_rate"])
                diesel_cost = float(charges["diesel_cost"])
                fuel_pump = None
                fuel_pump_str = charges["fuel_pump"]
                if charges["fuel_pump"] == float(0):
                    fuel_pump_str = None
                creditor = CreditorMaster.objects.select_related("location", "site")
                if fuel_pump_str is not None:
                    if creditor.filter(
                        name=charges["fuel_pump"],
                        category="Fuel Pump",
                        location=location,
                        site=site,
                    ).exists():
                        fuel_pump = CreditorMaster.objects.get(
                            name=charges["fuel_pump"],
                            category="Fuel Pump",
                            location=location,
                            site=site,
                        )
                    else:
                        fuel_pump = CreditorMaster(
                            name=charges["fuel_pump"],
                            category="Fuel Pump",
                            location=location,
                            site=site,
                        )
                        fuel_pump.save()

                detention_charges = float(charges["detention_charges"])
                extra_charges = float(charges["extra_charges"])
                loading_unloading = float(charges["loading_unloading"])
                handling_charges = float(charges["handling_charges"])
                handling_company = charges["handling_company"]
                if charges["handling_company"] == float(0):
                    handling_company = None
                if handling_company is not None:
                    BookingOptionMaster.objects.get_or_create(
                        handling_company=handling_company, location=location, site=site
                    )
                washing_charges = float(charges["washing_charges"])
                repair_charges = float(charges["repair_charges"])
                weighment_charges = float(charges["weighment_charges"])

                # calculations
                diesel_cost = diesel_rate * diesel_quantity
                total_paid = advance + diesel_cost
                balance = (tr_freight - total_paid) + detention_charges + extra_charges

                # Bill for Customer
                # Bill
                bill = self.validate_bill_data(
                    data=data["bill"], location=location, site=site
                )
                if "errorMsg" in bill.keys():
                    return Response(bill, status=200)

                bill_party = CustomerMaster.objects.get(
                    name=bill["bill_party"], location=location, site=site
                )
                company_account_name = bill["company_acc_name"]

                # Bill Lines
                validated_bill_lines = None
                if not len(bill["bill_line"]) == 0:
                    validated_bill_lines = [
                        self.validate_bill_line_data(
                            data=line, location=location, site=site
                        )
                        for line in bill["bill_line"]
                    ]
                for each in validated_bill_lines:
                    if "errorMsg" in each.keys():
                        return Response(each, status=200)

                booking_entry.entry_no = entry_no_main
                booking_entry.booking_type = booking_type
                booking_entry.lr_no = lr_no
                booking_entry.booking_no = booking_no
                booking_entry.l_date = l_date
                booking_entry.s_date = s_date
                booking_entry.from_dest = from_dest
                booking_entry.to_dest = to_dest
                booking_entry.destination = destination
                booking_entry.consignor = consignor
                booking_entry.consignee = consignee
                booking_entry.no_of_pallets = no_of_pallets
                booking_entry.actual_weight = actual_weight
                booking_entry.charge_weight = charge_weight
                booking_entry.particulars = particulars
                booking_entry.bill_party = bill_party
                booking_entry.transporter = transporter
                booking_entry.truck = truck
                booking_entry.driver = driver
                booking_entry.container_no = container_no
                booking_entry.container_type = container_type
                booking_entry.container_size = container_size
                booking_entry.shipping_line = shipping_line
                booking_entry.seal_no = seal_no
                booking_entry.status = status
                booking_entry.port = port
                booking_entry.pod = pod
                booking_entry.tr_freight = tr_freight
                booking_entry.advance = advance
                booking_entry.diesel_quantity = diesel_quantity
                booking_entry.diesel_rate = diesel_rate
                booking_entry.diesel_cost = diesel_cost
                booking_entry.fuel_pump = fuel_pump
                booking_entry.detention_charges = detention_charges
                booking_entry.extra_charges = extra_charges
                booking_entry.balance = balance
                booking_entry.loading_unloading = loading_unloading
                booking_entry.handling_charges = handling_charges
                booking_entry.handling_company = handling_company
                booking_entry.washing_charges = washing_charges
                booking_entry.repair_charges = repair_charges
                booking_entry.weighment_charges = weighment_charges
                booking_entry.transaction_effected = True
                booking_entry.location = location
                booking_entry.site = site
                booking_entry.save()

                if not len(data["delete_line_list"]) == 0:
                    for each in data["delete_line_list"]:
                        delete_obj = BookingBillLine.objects.filter(pk=each)
                        delete_obj.delete()

                bill_entry = BookingBill.objects.get(pk=bill["pk"])
                bill_entry.bill_party = bill_party
                bill_entry.company_account_name = company_account_name
                bill_entry.save()

                for line in validated_bill_lines:
                    type_of_charge = ServiceTaxMaster.objects.get(
                        description=line["type_of_charge"],
                        location=location,
                        site=site,
                    )
                    bill_amount = line["bill_amount"]
                    rcm = line["rcm"]
                    if not "pk" in line.keys() or line["pk"] is None:
                        new_bill_line = BookingBillLine.create(
                            type_of_charge=type_of_charge,
                            bill_amount=bill_amount,
                            rcm=rcm,
                            booking_bill=bill_entry,
                        )
                        new_bill_line.save()
                    else:
                        bill_line = BookingBillLine.objects.get(pk=line["pk"])
                        bill_line.type_of_charge = type_of_charge
                        bill_line.bill_amount = bill_amount
                        bill_line.rcm = rcm
                        bill_line.save()

                f_year_start, f_year_end = get_fiscal_year_date()
                financial_year = (
                    f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
                )

                payment_reciept_obj = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                ).filter(financial_year=financial_year, location=location, site=site)
                journal_voucher_obj = JournalVoucher.objects.select_related(
                    "location", "site"
                ).filter(financial_year=financial_year, location=location, site=site)

                account_obj = AccountMaster.objects.get(
                    account_type="CASH_ON_HAND", location=location, site=site
                )

                logs = TransactionLog.create(
                    created_at=created_at,
                    date=l_date,
                    vch_no=entry_no_main,
                    vch_type="BOOKING",
                    particular=entry_no_main,
                    creditor=transporter,
                    customer=None,
                    effect_on=None,
                    transaction_type="Credit",
                    transaction_method=None,
                    booking_id=booking_entry.pk,
                    invoice_id=None,
                    payment_receipt_id=None,
                    contra_id=None,
                    journal_id=None,
                    amount=tr_freight,
                    location=location,
                    site=site,
                )
                logs.save()

                if not advance == float(0):
                    # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                    check_number = payment_reciept_obj.count() + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                    while payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                        if not payment_reciept_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break

                    advance_voucher = PaymentReceiptMaster.create(
                        payment_receipt_type="CASH",
                        entry_type="Normal",
                        transaction="Payment",
                        entry_no=entry_no,
                        financial_year=financial_year,
                        entry_date=l_date,
                        customer=None,
                        creditor=None,
                        truck_no=truck.truck_no,
                        extra_charges="Advance",
                        narration=f"LR No: {lr_no}, Trasnporter: {transporter.name},Truck No: {truck.truck_no}",
                        pay_remarks=None,
                        receipt_amount=advance,
                        kasar=float(0),
                        tds=float(0),
                        total_amount=advance,
                        transaction_from=account_obj,
                        booking_id=booking_entry.pk,
                        location=location,
                        site=site,
                    )
                    advance_voucher.save()
                    self.transaction_logs(
                        l_date,
                        account_obj,
                        location,
                        site,
                        vch_no=entry_no,
                        particular=f"LR No: {lr_no}, Trasnporter: {transporter.name},Truck No: {truck.truck_no}",
                        creditor=transporter,
                        payment_reciept_id=advance_voucher.pk,
                        amount=advance,
                    )
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - advance
                    )
                    account_obj.save()

                if not handling_charges == float(0):
                    # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                    check_number = payment_reciept_obj.count() + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                    while payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                        if not payment_reciept_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break
                    handling = CreditorMaster.objects.get(
                        name=handling_company,
                        category="Container Yard",
                        location=location,
                        site=site,
                    )

                    handling_voucher = PaymentReceiptMaster.create(
                        payment_receipt_type="CASH",
                        entry_type="Normal",
                        transaction="Payment",
                        entry_no=entry_no,
                        financial_year=financial_year,
                        entry_date=l_date,
                        customer=None,
                        creditor=handling,
                        truck_no=truck.truck_no,
                        extra_charges="Handling",
                        narration=f"LR No: {lr_no}, Handling: {handling_company}",
                        pay_remarks=None,
                        receipt_amount=handling_charges,
                        kasar=float(0),
                        tds=float(0),
                        total_amount=handling_charges,
                        transaction_from=account_obj,
                        booking_id=booking_entry.pk,
                        location=location,
                        site=site,
                    )
                    handling_voucher.save()
                    self.transaction_logs(
                        l_date,
                        account_obj,
                        location,
                        site,
                        vch_no=entry_no,
                        particular=f"LR No: {lr_no}, Handling: {handling_company}",
                        creditor=handling,
                        payment_reciept_id=handling_voucher.pk,
                        amount=handling_charges,
                    )
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - handling_charges
                    )
                    account_obj.save()

                if not weighment_charges == float(0):
                    # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                    check_number = payment_reciept_obj.count() + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                    while payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                        if not payment_reciept_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break

                    weighing_voucher = PaymentReceiptMaster.create(
                        payment_receipt_type="CASH",
                        entry_type="Normal",
                        transaction="Payment",
                        entry_no=entry_no,
                        financial_year=financial_year,
                        entry_date=l_date,
                        customer=None,
                        creditor=None,
                        truck_no=truck.truck_no,
                        extra_charges="Weighment",
                        narration=f"LR No: {lr_no} - Weighment",
                        pay_remarks=None,
                        receipt_amount=weighment_charges,
                        kasar=float(0),
                        tds=float(0),
                        total_amount=weighment_charges,
                        transaction_from=account_obj,
                        booking_id=booking_entry.pk,
                        location=location,
                        site=site,
                    )
                    weighing_voucher.save()
                    self.transaction_logs(
                        l_date,
                        account_obj,
                        location,
                        site,
                        vch_no=entry_no,
                        particular=f"LR No: {lr_no} - Weighment",
                        creditor=None,
                        payment_reciept_id=weighing_voucher.pk,
                        amount=weighment_charges,
                    )
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - weighment_charges
                    )
                    account_obj.save()

                if not washing_charges == float(0):
                    # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                    check_number = payment_reciept_obj.count() + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                    while payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                        if not payment_reciept_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break

                    washing_voucher = PaymentReceiptMaster.create(
                        payment_receipt_type="CASH",
                        entry_type="Normal",
                        transaction="Payment",
                        entry_no=entry_no,
                        financial_year=financial_year,
                        entry_date=l_date,
                        customer=None,
                        creditor=None,
                        truck_no=truck.truck_no,
                        extra_charges="Washing",
                        narration=f"LR No: {lr_no} - Washing",
                        pay_remarks=None,
                        receipt_amount=washing_charges,
                        kasar=float(0),
                        tds=float(0),
                        total_amount=washing_charges,
                        transaction_from=account_obj,
                        booking_id=booking_entry.pk,
                        location=location,
                        site=site,
                    )
                    washing_voucher.save()
                    self.transaction_logs(
                        l_date,
                        account_obj,
                        location,
                        site,
                        vch_no=entry_no,
                        particular=f"LR No: {lr_no} - Washing",
                        creditor=None,
                        payment_reciept_id=washing_voucher.pk,
                        amount=washing_charges,
                    )
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - washing_charges
                    )
                    account_obj.save()

                if not loading_unloading == float(0):
                    # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                    check_number = payment_reciept_obj.count() + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                    while payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                        if not payment_reciept_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break

                    loading_unloading_voucher = PaymentReceiptMaster.create(
                        payment_receipt_type="CASH",
                        entry_type="Normal",
                        transaction="Payment",
                        entry_no=entry_no,
                        financial_year=financial_year,
                        entry_date=l_date,
                        customer=None,
                        creditor=None,
                        truck_no=truck.truck_no,
                        extra_charges="Loading/Unloading",
                        narration=f"LR No: {lr_no} - Loading/Unloading",
                        pay_remarks=None,
                        receipt_amount=loading_unloading,
                        kasar=float(0),
                        tds=float(0),
                        total_amount=loading_unloading,
                        transaction_from=account_obj,
                        booking_id=booking_entry.pk,
                        location=location,
                        site=site,
                    )
                    loading_unloading_voucher.save()
                    self.transaction_logs(
                        l_date,
                        account_obj,
                        location,
                        site,
                        vch_no=entry_no,
                        particular=f"LR No: {lr_no} - Loading/Unloading",
                        creditor=None,
                        payment_reciept_id=loading_unloading_voucher.pk,
                        amount=loading_unloading,
                    )
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - loading_unloading
                    )
                    account_obj.save()

                if not repair_charges == float(0):
                    # payment_entry_no = f"P/C/{financial_year}/{str(payment_reciept_obj.count() + 1).zfill(6)}"
                    check_number = payment_reciept_obj.count() + 1
                    entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"

                    while payment_reciept_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"PR/{financial_year}/{str(check_number).zfill(6)}"
                        if not payment_reciept_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break

                    repair_voucher = PaymentReceiptMaster.create(
                        payment_receipt_type="CASH",
                        entry_type="Normal",
                        transaction="Payment",
                        entry_no=entry_no,
                        financial_year=financial_year,
                        entry_date=l_date,
                        customer=None,
                        creditor=None,
                        truck_no=truck.truck_no,
                        extra_charges="Repairing",
                        narration=f"LR No: {lr_no} - Repairing",
                        pay_remarks=None,
                        receipt_amount=repair_charges,
                        kasar=float(0),
                        tds=float(0),
                        total_amount=repair_charges,
                        transaction_from=account_obj,
                        booking_id=booking_entry.pk,
                        location=location,
                        site=site,
                    )
                    repair_voucher.save()
                    self.transaction_logs(
                        l_date,
                        account_obj,
                        location,
                        site,
                        vch_no=entry_no,
                        particular=f"LR No: {lr_no} - Repairing",
                        creditor=None,
                        payment_reciept_id=repair_voucher.pk,
                        amount=repair_charges,
                    )
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - repair_charges
                    )
                    account_obj.save()

                # Journal Voucher

                if not handling_charges == float(0):
                    check_number = journal_voucher_obj.count() + 1
                    entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"

                    while journal_voucher_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"
                        if not journal_voucher_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break
                    hanling_journal_voucher = JournalVoucher.create(
                        transaction="Debit",
                        financial_year=financial_year,
                        entry_no=entry_no,
                        entry_date=datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date(),
                        account_name=handling_company,
                        narration=f"LR No: {lr_no}",
                        amount=handling_charges,
                        under_account_name=transporter.name,
                        booking=booking_entry,
                        location=location,
                        site=site,
                    )
                    hanling_journal_voucher.save()

                if not (diesel_cost) == float(0):

                    check_number = journal_voucher_obj.count() + 1
                    entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"

                    while journal_voucher_obj.filter(
                        entry_no=entry_no,
                    ).exists():
                        check_number = check_number + 1
                        entry_no = f"JV/{financial_year}/{str(check_number).zfill(6)}"
                        if not journal_voucher_obj.filter(
                            entry_no=entry_no,
                        ).exists():
                            break

                    diesel_voucher = JournalVoucher.create(
                        transaction="Debit",
                        financial_year=financial_year,
                        entry_no=entry_no,
                        entry_date=datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date(),
                        account_name=fuel_pump.name,
                        narration=f"LR No: {lr_no}, Fuel Pump: {fuel_pump.name}",
                        amount=diesel_cost,
                        under_account_name=transporter.name,
                        booking=booking_entry,
                        location=location,
                        site=site,
                    )
                    diesel_voucher.save()
                    logs = TransactionLog.create(
                        created_at=created_at,
                        date=l_date,
                        vch_no=entry_no,
                        vch_type="JOURNAL",
                        particular=f"LR No: {lr_no}, Fuel Pump: {fuel_pump.name}",
                        creditor=fuel_pump,
                        customer=None,
                        effect_on=account_obj,
                        transaction_type="Debit",
                        transaction_method="CASH",
                        booking_id=None,
                        invoice_id=None,
                        payment_receipt_id=None,
                        contra_id=None,
                        journal_id=diesel_voucher.pk,
                        amount=diesel_cost,
                        location=location,
                        site=site,
                    )

                    logs.save()
                    account_obj.total_balance = (
                        float(account_obj.total_balance) - diesel_cost
                    )
                    account_obj.save()
                booking_entry.transaction_effected = True
                booking_entry.save()

            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)


class GetAllDailyBooking(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            lr_no = data["lr_no"]
            transporter = data["transporter"]
            bill_party = data["bill_party"]
            consignor = data["consignor"]
            consignee = data["consignee"]
            container_no = data["container_no"]
            truck_no = data["truck_no"]
            destination = data["destination"]
            from_date = data["from_date"]
            to_date = data["to_date"]
            if not "is draft" in data.keys():
                is_draft = None
            else:
                is_draft = data["is_draft"]
            if not "is_proceed" in data.keys():
                is_proceed = None
            else:
                is_proceed = data["is_proceed"]
            filtered_data = None

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

            if not len(bill_party) == 0:
                filtered_data = filtered_data.filter(bill_party__name=bill_party)

            if not len(container_no) == 0:
                filtered_data = filtered_data.filter(container_no=container_no)

            if not len(truck_no) == 0:
                filtered_data = filtered_data.filter(truck_no=truck_no)

            if not len(destination) == 0:
                filtered_data = filtered_data.filter(destination=destination)

            if not len(consignor) == 0:
                filtered_data = filtered_data.filter(consignor=consignor)

            if not len(consignee) == 0:
                filtered_data = filtered_data.filter(consignee=consignee)

            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(l_date__range=(from_date, to_date))

            if not is_draft is None:
                filtered_data = filtered_data.filter(is_draft=is_draft)

            if not is_proceed is None:
                filtered_data = filtered_data.filter(is_proceed=is_proceed)

            response_data = [each.get_booking_table_data() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteDailyBooking(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            bkg_obj = BookingMaster.objects.get(pk=pk)
            if bkg_obj.transaction_effected is True:
                return Response(
                    {
                        "errorMsg": "Please Cancel Transaction effect to delete the Booking"
                    },
                    status=200,
                )
            else:
                bkg_obj.delete()
            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class DownloadLR(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            bkg_object = BookingMaster.objects.get(pk=pk)
            context = {}
            if bkg_object.is_draft:
                return Response(
                    {"errorMsg": "Cannot Print LR Of Draft Booking"}, status=200
                )
            else:
                context["copy"] = data["copy"]
                context["comapny_name"] = bkg_object.location.company_name
                context["company_address"] = bkg_object.location.company_address
                context["lr_no"] = bkg_object.lr_no
                context["l_date"] = bkg_object.l_date
                context["s_date"] = bkg_object.s_date
                context["truck_no"] = bkg_object.truck.truck_no
                context["driver_name"] = bkg_object.driver.name
                context["license_no"] = bkg_object.driver.license_no
                context["mobile_no"] = bkg_object.driver.mobile_no
                context["status"] = bkg_object.status
                context["container_no"] = bkg_object.container_no
                context["container_size"] = bkg_object.container_size
                context["container_type"] = bkg_object.container_type
                context["seal_no"] = bkg_object.seal_no
                context["from_dest"] = bkg_object.from_dest
                context["to_dest"] = bkg_object.to_dest
                context["shipping_line"] = bkg_object.shipping_line
                context["pod"] = bkg_object.pod
                context["booking_no"] = bkg_object.booking_no
                context["port"] = bkg_object.port
                context["consignor"] = bkg_object.consignor
                context["consignee"] = bkg_object.consignee
                context["no_of_pallets"] = str(bkg_object.no_of_pallets)
                context["particulars"] = bkg_object.particulars
                context["actual_weight"] = bkg_object.actual_weight
                context["charge_weight"] = bkg_object.charge_weight
                context["services"] = "Goods Transport Services"
                context["sac_code"] = "9965"
            return Response(self.none_to_empty_str(items=context), status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class BookingDraft(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_zero(self, items):
        return {each: float(0) if items[each] == "" else items[each] for each in items}

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            # general_data
            general_data = data["general_data"]

            entry_no = general_data["entry_no"]
            lr_no = general_data["lr_no"]
            if not "pk" in data.keys():
                if BookingMaster.checkEntryNo(
                    entry_no, lr_no, financial_year, location, site
                ):
                    return Response({"errorMsg": "Data Already exists"}, status=200)
            booking_type = general_data["booking_type"]
            l_date = datetime.datetime.strptime(
                general_data["l_date"], "%Y-%m-%d"
            ).date()
            s_date = datetime.datetime.strptime(
                general_data["s_date"], "%Y-%m-%d"
            ).date()
            from_dest = general_data["from_dest"]
            to_dest = general_data["to_dest"]
            destination = general_data["destination"]
            consignor = general_data["consignor"]
            consignee = general_data["consignee"]

            bill = data["bill"]

            if (
                not len(bill["bill_party"]) == 0
                or not len(bill["company_acc_name"]) == 0
            ):
                if not len(bill["bill_line"]) == 0:
                    for line in bill["bill_line"]:
                        if not len(line["type_of_charge"]) == 0:
                            check_bill_amount = line["bill_amount"].isdigit()
                            if not check_bill_amount:
                                return Response(
                                    {
                                        "errorMsg": "Bill amount must contain only numbers not alphabets"
                                    },
                                    status=200,
                                )

            if check_num_or_special_char(consignor) is True:
                return Response(
                    {"errorMsg": "Consignor must contain only alphabet"},
                    status=200,
                )
            if check_num_or_special_char(consignee) is True:
                return Response(
                    {"errorMsg": "Consignee must contain only alphabet"},
                    status=200,
                )
            if check_num_or_special_char(from_dest) is True:
                return Response(
                    {"errorMsg": "From Destination must contain only alphabet"},
                    status=200,
                )
            if check_num_or_special_char(to_dest) is True:
                return Response(
                    {"errorMsg": "To Destination must contain only alphabet"},
                    status=200,
                )
            particulars = general_data["particulars"]
            if check_num_or_special_char(particulars) is True:
                return Response(
                    {"errorMsg": "Particulars must contain only alphabet"},
                    status=200,
                )
            booking_no = general_data["booking_no"]
            if general_data["no_of_pallets"] == "":
                no_of_pallets = 0
            else:
                no_of_pallets = general_data["no_of_pallets"]
            actual_weight = general_data["actual_weight"]
            charge_weight = general_data["charge_weight"]

            if not from_dest == "":
                BookingOptionMaster.objects.get_or_create(
                    source_destination=from_dest, location=location, site=site
                )
            if not to_dest == "":
                BookingOptionMaster.objects.get_or_create(
                    source_destination=to_dest, location=location, site=site
                )
            if not consignor == "":
                BookingOptionMaster.objects.get_or_create(
                    consignor=consignor, location=location, site=site
                )
            if not consignee == "":
                BookingOptionMaster.objects.get_or_create(
                    consignee=consignee, location=location, site=site
                )
            if not particulars == "":
                BookingOptionMaster.objects.get_or_create(
                    particulars=particulars, location=location, site=site
                )

            # transportation_data
            transportation_data = data["transportation_data"]
            try:
                transporter = CreditorMaster.objects.get(
                    name=transportation_data["transporter"],
                    category="Transporter",
                    location=location,
                    site=site,
                )
            except:
                transporter = None

            truck = None
            if (
                TruckMaster.objects.select_related("transporter")
                .filter(
                    truck_no=transportation_data["truck_no"], transporter=transporter
                )
                .exists()
            ):
                truck = TruckMaster.objects.get(
                    truck_no=transportation_data["truck_no"], transporter=transporter
                )
            else:
                truck = TruckMaster(
                    truck_no=transportation_data["truck_no"], transporter=transporter
                )
                truck.save()

            driver = None
            if (
                DriverMaster.objects.select_related("transporter")
                .filter(
                    name=transportation_data["driver_name"], transporter=transporter
                )
                .exists()
            ):
                driver = DriverMaster.objects.get(
                    name=transportation_data["driver_name"], transporter=transporter
                )
                driver.license_no = transportation_data["license_no"]
                driver.mobile_no = transportation_data["mobile_no"]
                driver.save()
            else:
                driver = DriverMaster(
                    name=transportation_data["driver_name"],
                    transporter=transporter,
                    license_no=transportation_data["license_no"],
                    mobile_no=transportation_data["mobile_no"],
                )
                driver.save()

            container_type = transportation_data["container_type"]
            container_size = transportation_data["container_size"]
            container_no = transportation_data["container_no"]
            shipping_line = transportation_data["shipping_line"]
            if check_num_or_special_char(shipping_line) is True:
                return Response(
                    {"errorMsg": "Shipping Line must contain only alphabet"},
                    status=200,
                )
            seal_no = transportation_data["seal_no"]
            status = transportation_data["status"]
            if check_num_or_special_char(status) is True:
                return Response(
                    {"errorMsg": "Status must contain only alphabet"},
                    status=200,
                )
            if not shipping_line == "":
                BookingOptionMaster.objects.get_or_create(
                    shipping_line=shipping_line, location=location, site=site
                )
            if not status == "":
                BookingOptionMaster.objects.get_or_create(
                    status=status, location=location, site=site
                )
            port = transportation_data["port"]
            if check_num_or_special_char(port) is True:
                return Response(
                    {"errorMsg": "Port must contain only alphabet"},
                    status=200,
                )
            if not port == "":
                BookingOptionMaster.objects.get_or_create(
                    port=port, location=location, site=site
                )
            pod = transportation_data["pod"]
            if check_num_or_special_char(pod) is True:
                return Response(
                    {"errorMsg": "POD must contain only alphabet"},
                    status=200,
                )
            if not pod == "":
                BookingOptionMaster.objects.get_or_create(
                    pod=pod, location=location, site=site
                )

            # charges data
            charges = self.empty_str_to_zero(data["charges"])

            tr_freight = float(charges["tr_freight"])
            advance = float(charges["advance"])
            diesel_quantity = float(charges["diesel_quantity"])
            diesel_rate = float(charges["diesel_rate"])
            diesel_cost = float(charges["diesel_cost"])
            fuel_pump = None
            fuel_pump_str = charges["fuel_pump"]
            if charges["fuel_pump"] == float(0):
                fuel_pump_str = None
            creditor = CreditorMaster.objects.select_related("location", "site")
            if fuel_pump_str is not None:
                if creditor.filter(
                    name=fuel_pump_str,
                    category="Fuel Pump",
                    location=location,
                    site=site,
                ).exists():
                    fuel_pump = CreditorMaster.objects.get(
                        name=charges["fuel_pump"],
                        category="Fuel Pump",
                        location=location,
                        site=site,
                    )
                else:
                    fuel_pump = CreditorMaster(
                        name=charges["fuel_pump"],
                        category="Fuel Pump",
                        location=location,
                        site=site,
                    )
                    fuel_pump.save()

            detention_charges = float(charges["detention_charges"])
            extra_charges = float(charges["extra_charges"])
            loading_unloading = float(charges["loading_unloading"])
            handling_charges = float(charges["handling_charges"])
            handling_company_str = charges["handling_company"]
            if charges["handling_company"] == float(0):
                handling_company_str = None
            if handling_company_str is not None:
                BookingOptionMaster.objects.get_or_create(
                    handling_company=handling_company_str, location=location, site=site
                )
                if not creditor.filter(
                    name=charges["handling_company"],
                    category="Container Yard",
                    location=location,
                    site=site,
                ).exists():
                    new_handling = CreditorMaster(
                        name=charges["handling_company"],
                        category="Container Yard",
                        state=site.state,
                        state_code=site.state_code,
                        location=location,
                        site=site,
                    )
                    new_handling.save()

            washing_charges = float(charges["washing_charges"])
            repair_charges = float(charges["repair_charges"])
            weighment_charges = float(charges["weighment_charges"])

            check_list = [
                charges["tr_freight"],
                charges["advance"],
                charges["diesel_cost"],
                charges["diesel_quantity"],
                charges["diesel_rate"],
                charges["detention_charges"],
                charges["extra_charges"],
                charges["balance"],
                charges["loading_unloading"],
                charges["handling_charges"],
                charges["washing_charges"],
                charges["repair_charges"],
                charges["weighment_charges"],
            ]
            for each in check_list:
                if float(each) < float(0):
                    return Response(
                        {"errorMsg": "Negative value is not acceptable"}, status=200
                    )

            # calculations
            diesel_cost = diesel_rate * diesel_quantity
            total_paid = advance + diesel_cost
            balance = (tr_freight - total_paid) + detention_charges + extra_charges

            # Bill for Customer
            # Bill

            try:
                bill_party = CustomerMaster.objects.get(
                    name=bill["bill_party"], location=location, site=site
                )
            except:
                bill_party = None
            company_account_name = bill["company_acc_name"]

            if "pk" in data.keys():
                booking = BookingMaster.objects.get(pk=data["pk"])
                booking.booking_type = booking_type
                booking.entry_no = entry_no
                booking.lr_no = lr_no
                booking.booking_no = booking_no
                booking.l_date = l_date
                booking.s_date = s_date
                booking.from_dest = from_dest
                booking.to_dest = to_dest
                booking.destination = destination
                booking.consignor = consignor
                booking.consignee = consignee
                booking.no_of_pallets = no_of_pallets
                booking.actual_weight = actual_weight
                booking.charge_weight = charge_weight
                booking.particulars = particulars
                booking.bill_party = bill_party
                booking.transporter = transporter
                booking.truck = truck
                booking.driver = driver
                booking.container_no = container_no
                booking.container_type = container_type
                booking.container_size = container_size
                booking.shipping_line = shipping_line
                booking.seal_no = seal_no
                booking.status = status
                booking.port = port
                booking.pod = pod
                booking.tr_freight = tr_freight
                booking.advance = advance
                booking.diesel_quantity = diesel_quantity
                booking.diesel_rate = diesel_rate
                booking.diesel_cost = diesel_cost
                booking.fuel_pump = fuel_pump
                booking.detention_charges = detention_charges
                booking.extra_charges = extra_charges
                booking.balance = balance
                booking.loading_unloading = loading_unloading
                booking.handling_charges = handling_charges
                booking.handling_company = handling_company_str
                booking.washing_charges = washing_charges
                booking.repair_charges = repair_charges
                booking.weighment_charges = weighment_charges
                booking.location = location
                booking.site = site
                booking.is_draft = True
                booking.is_proceed = False
                booking.transaction_effected = False
                booking.save()

                if not len(data["delete_line_list"]) == 0:
                    for each in data["delete_line_list"]:
                        delete_obj = BookingBillLine.objects.filter(pk=each)
                        delete_obj.delete()

                if (
                    not len(bill["bill_party"]) == 0
                    or not len(bill["company_acc_name"]) == 0
                ):
                    if not "pk" in bill.keys():
                        bill_entry = BookingBill.create(
                            booking=booking,
                            bill_party=bill_party,
                            company_account_name=company_account_name,
                        )
                        bill_entry.save()
                    else:
                        bill_entry = BookingBill.objects.get(pk=bill["pk"])
                        bill_entry.bill_party = bill_party
                        bill_entry.company_account_name = company_account_name
                        bill_entry.save()

                    if not len(bill["bill_line"]) == 0:
                        for line in bill["bill_line"]:
                            if not len(line["type_of_charge"]) == 0:
                                type_of_charge = ServiceTaxMaster.objects.get(
                                    description=line["type_of_charge"],
                                    location=location,
                                    site=site,
                                )
                                if line["bill_amount"] and not check_alphabets(
                                    line["bill_amount"]
                                ):
                                    return Response(
                                        {
                                            "errorMsg": "Bill Amount accepts numbers only."
                                        },
                                        status=200,
                                    )
                                bill_amount = line["bill_amount"]

                                rcm = line["rcm"]
                                if not "pk" in line.keys() or len(line["pk"]) == 0:
                                    new_bill_line = BookingBillLine.create(
                                        type_of_charge=type_of_charge,
                                        bill_amount=bill_amount,
                                        rcm=rcm,
                                        booking_bill=bill_entry,
                                    )
                                    new_bill_line.save()
                                else:
                                    bill_line = BookingBillLine.objects.get(
                                        pk=line["pk"]
                                    )
                                    bill_line.type_of_charge = type_of_charge
                                    bill_line.bill_amount = bill_amount
                                    bill_line.rcm = rcm
                                    bill_line.save()

            else:
                booking_entry = BookingMaster.create(
                    booking_type=booking_type,
                    entry_no=entry_no,
                    booking_no=booking_no,
                    lr_no=lr_no,
                    financial_year=financial_year,
                    is_draft=True,
                    is_proceed=False,
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
                    bill_party=bill_party,
                    transporter=transporter,
                    truck=truck,
                    driver=driver,
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
                    diesel_quantity=diesel_quantity,
                    diesel_rate=diesel_rate,
                    diesel_cost=diesel_cost,
                    fuel_pump=fuel_pump,
                    detention_charges=detention_charges,
                    extra_charges=extra_charges,
                    balance=balance,
                    loading_unloading=loading_unloading,
                    handling_charges=handling_charges,
                    handling_company=handling_company_str,
                    washing_charges=washing_charges,
                    repair_charges=repair_charges,
                    weighment_charges=weighment_charges,
                    transaction_effected=False,
                    location=location,
                    site=site,
                )
                booking_entry.save()
                if (
                    not len(bill["bill_party"]) == 0
                    or not len(bill["company_acc_name"]) == 0
                ):
                    bill_entry = BookingBill.create(
                        booking=booking_entry,
                        bill_party=bill_party,
                        company_account_name=company_account_name,
                    )
                    bill_entry.save()
                    total_bill_amount = float(0)
                    if not len(bill["bill_line"]) == 0:
                        for line in bill["bill_line"]:
                            if not len(line["type_of_charge"]) == 0:
                                type_of_charge = ServiceTaxMaster.objects.get(
                                    description=line["type_of_charge"],
                                    location=location,
                                    site=site,
                                )
                                if not check_alphabets(line["bill_amount"]):
                                    return Response(
                                        {
                                            "errorMsg": "Bill Amount accepts numbers only"
                                        },
                                        status=200,
                                    )
                                bill_amount = float(line["bill_amount"])

                                total_bill_amount += bill_amount
                                rcm = line["rcm"]

                                bill_line = BookingBillLine.create(
                                    type_of_charge=type_of_charge,
                                    bill_amount=bill_amount,
                                    rcm=rcm,
                                    booking_bill=bill_entry,
                                )
                                bill_line.save()

            return Response({"successMsg": "Data Saved"}, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}


class DeleteBookingDraft(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            for pk in data:
                bkg_obj = BookingMaster.objects.get(pk=pk)
                if not bkg_obj.is_draft is True:
                    return Response(
                        {"errorMsg": f"{pk} Booking Id is not saved as Draft"},
                        status=200,
                    )
                else:
                    bkg_obj.delete()

            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


# class CancelTransactionEffect(views.APIView):

#     permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

#     def get(self, request, pk, *args, **kwargs):
#         try:
#             booking = BookingMaster.objects.get(pk=pk)
#             created_at = datetime.datetime.now().astimezone(
#                 timezone.get_current_timezone()
#             )
#             if not booking.transaction_effected:
#                 return Response(
#                     {"errorMsg": "Transaction Effect Already Cancelled"}, status=200
#                 )
#             else:
#                 payment_receipt = PaymentReceiptMaster.objects.filter(booking_id=pk)
#                 main = PaymentReceiptLine.objects.select_related(
#                     "parent",
#                     "purchase_bill",
#                     "invoice_bill",
#                     "parent__location",
#                     "parent__site",
#                 ).filter(parent__location=booking.location, parent__site=booking.site)

#                 journal = JournalVoucher.objects.filter(booking=booking)
#                 account = AccountMaster.objects.get(
#                     account_type="CASH_ON_HAND",
#                     location=booking.location,
#                     site=booking.site,
#                 )
#                 for each in payment_receipt:

#                     account.total_balance = float(account.total_balance) + float(
#                         each.receipt_amount + each.kasar + each.tds
#                     )
#                     account.save()

#                     delete_payment_receipt_log = TransactionLog.objects.filter(
#                         payment_receipt_id=each.pk
#                     )
#                     if delete_payment_receipt_log.exists():
#                         delete_payment_receipt_log.delete()
#                     each.delete()
#                 for obj in journal:

#                     account.total_balance = float(account.total_balance) + float(
#                         obj.amount
#                     )
#                     account.save()
#                     delete_journal_log = TransactionLog.objects.filter(
#                         payment_receipt_id=each.pk
#                     )
#                     if delete_journal_log.exists():
#                         delete_journal_log.delete()
#                     obj.delete()

#                 # If Booking is Purchased
#                 if booking.is_purchased:
#                     purchase = PurchaseMasterLine.objects.get(booking=booking)
#                     purchase_amount = float(purchase.total_amount)

#                     # Check if Purchase is Transaction Effected
#                     if (
#                         PurchaseMasterLine.objects.filter(booking=booking)
#                         .first()
#                         .parent.is_transaction_effected
#                     ):

#                         # Check if Payment Receipt has one or less than one line
#                         if not main.filter(purchase_bill=purchase.parent).count() > 1:
#                             payment = PaymentReceiptLine.objects.get(
#                                 purchase_bill=purchase.parent
#                             )
#                             # If Due amount is less than bill amount of purchase
#                             if payment.due_amount < purchase_amount:
#                                 payment.parent.transaction_from.total_balance = (
#                                     float(payment.parent.transaction_from.total_balance)
#                                     + (
#                                         float(purchase_amount)
#                                         - float(payment.due_amount)
#                                     )
#                                     + float(payment.tds)
#                                     + float(payment.kasar)
#                                 )
#                                 payment.parent.transaction_from.save()

#                                 delete_log = TransactionLog.objects.filter(
#                                     payment_receipt_id=payment.parent.pk
#                                 )
#                                 if delete_log.exists():
#                                     delete_log.delete()

#                                 payment.parent.receipt_amount = float(
#                                     payment.parent.receipt_amount
#                                 ) - (float(purchase_amount) - float(payment.due_amount))
#                                 payment.parent.total_amount = float(
#                                     payment.parent.total_amount
#                                 ) - (float(purchase_amount) - float(payment.due_amount))
#                                 payment.parent.kasar = float(
#                                     payment.parent.kasar
#                                 ) - float(payment.kasar)
#                                 payment.parent.tds = float(payment.parent.tds) - float(
#                                     payment.tds
#                                 )
#                                 payment.parent.save()
#                                 purchase.parent.bill_amount = float(
#                                     purchase.parent.bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.due_bill_amount = float(
#                                     purchase.parent.due_bill_amount
#                                 ) - float(payment.due_amount)
#                                 purchase.parent.save()
#                                 payment.due_amount = float(payment.due_amount) - (
#                                     float(purchase_amount)
#                                     - (
#                                         float(purchase_amount)
#                                         - float(payment.due_amount)
#                                     )
#                                 )
#                                 payment.receipt_amount = float(
#                                     payment.receipt_amount
#                                 ) - (float(purchase_amount) - float(payment.due_amount))
#                                 payment.save()

#                                 if payment.due_amount == float(0):
#                                     payment.purchase_bill.is_purchase_completed = True
#                                     payment.purchase_bill.save()
#                                 if purchase.parent.bill_amount == float(0):
#                                     purchase.parent.delete()
#                                 else:
#                                     purchase.delete()
#                             # If Due amount is greather than Purchase amount
#                             elif payment.due_amount > purchase_amount:
#                                 purchase.parent.bill_amount = float(
#                                     purchase.parent.bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.due_bill_amount = float(
#                                     payment.due_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.save()
#                                 payment.due_amount = float(payment.due_amount) - float(
#                                     purchase_amount
#                                 )
#                                 payment.save()
#                                 if purchase.parent.bill_amount == float(0):
#                                     purchase.parent.delete()
#                                 else:
#                                     purchase.delete()
#                             # If Due amount is equal to Purchase amount
#                             elif payment.due_amount == purchase_amount:
#                                 purchase.parent.bill_amount = float(
#                                     purchase.parent.bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.due_bill_amount = float(
#                                     purchase.parent.due_bill_amount
#                                 ) - float(payment.due_amount)
#                                 purchase.parent.save()
#                                 payment.due_amount = float(payment.due_amount) - (
#                                     float(purchase_amount)
#                                     - (
#                                         float(purchase_amount)
#                                         - float(payment.due_amount)
#                                     )
#                                 )
#                                 payment.save()
#                                 if payment.due_amount == float(0):
#                                     payment.purchase_bill.is_purchase_completed = True
#                                     payment.purchase_bill.save()
#                                 if purchase.parent.bill_amount == float(0):
#                                     purchase.parent.delete()
#                                 else:
#                                     purchase.delete()

#                         else:
#                             payment = main.filter(purchase_bill=purchase.parent).last()

#                             purchase_payment = float(0)
#                             kasar = float(0)
#                             tds = float(0)
#                             temp1 = float(0)
#                             for purchase_line_1 in main.filter(
#                                 purchase_bill=purchase.parent
#                             ):
#                                 purchase_payment = float(purchase_payment) + float(
#                                     purchase_line_1.receipt_amount
#                                 )
#                                 kasar = kasar + float(purchase_line_1.kasar)
#                                 tds = tds + float(purchase_line_1.tds)
#                             if payment.due_amount < purchase_amount:
#                                 temp1 = float(purchase_payment) - (
#                                     float(purchase.parent.bill_amount)
#                                     - float(purchase_amount)
#                                 )
#                                 payment.parent.transaction_from.total_balance = (
#                                     float(payment.parent.transaction_from.total_balance)
#                                     + temp1
#                                 )
#                                 payment.parent.transaction_from.save()
#                                 delete_log = TransactionLog.objects.filter(
#                                     payment_receipt_id=payment.pk
#                                 )
#                                 if delete_log.exists():
#                                     delete_log.delete()

#                                 for j in main.filter(purchase_bill=purchase.parent):

#                                     if temp1 > j.receipt_amount:

#                                         j.parent.receipt_amount = float(
#                                             j.parent.receipt_amount
#                                         ) - (
#                                             temp1
#                                             - (float(temp1) - float(j.receipt_amount))
#                                         )
#                                         j.parent.total_amount = float(
#                                             j.parent.total_amount
#                                         ) - (
#                                             temp1
#                                             - (float(temp1) - float(j.receipt_amount))
#                                         )
#                                         # j.parent.tds = float(j.parent.tds) - float(j.tds)
#                                         # j.parent.kasar = float(j.parent.kasar) - float(j.kasar)
#                                         j.parent.save()
#                                         temp1 = temp1 - float(j.receipt_amount)
#                                         if j.parent.receipt_amount == float(0):
#                                             j.parent.delete()
#                                         else:
#                                             logs = TransactionLog.create(
#                                                 created_at=created_at,
#                                                 date=j.parent.entry_date,
#                                                 vch_no=j.parent.entry_no,
#                                                 vch_type="PAYMENT",
#                                                 particular=None,
#                                                 creditor=j.purchase_bill.transporter,
#                                                 customer=None,
#                                                 effect_on=j.parent.transaction_from,
#                                                 transaction_type="Debit",
#                                                 transaction_method=j.parent.payment_receipt_type,
#                                                 booking_id=None,
#                                                 invoice_id=None,
#                                                 payment_receipt_id=j.parent.pk,
#                                                 contra_id=None,
#                                                 journal_id=None,
#                                                 amount=j.parent.total_amount,
#                                                 location=j.parent.location,
#                                                 site=j.parent.site,
#                                             )
#                                             logs.save()
#                                             j.delete()
#                                     else:
#                                         j.parent.receipt_amount = (
#                                             float(j.parent.receipt_amount) - temp1
#                                         )
#                                         j.parent.total_amount = (
#                                             float(j.parent.total_amount) - temp1
#                                         )
#                                         # j.parent.tds = float(j.parent.tds) - float(j.tds)
#                                         # j.parent.kasar = float(j.parent.kasar) - float(j.kasar)
#                                         j.parent.save()
#                                         j.due_amount = float(0)
#                                         j.receipt_amount = (
#                                             float(j.receipt_amount) - temp1
#                                         )
#                                         j.save()
#                                         if j.parent.receipt_amount == float(0):
#                                             j.parent.delete()
#                                         else:
#                                             logs = TransactionLog.create(
#                                                 created_at=created_at,
#                                                 date=j.parent.entry_date,
#                                                 vch_no=j.parent.entry_no,
#                                                 vch_type="PAYMENT",
#                                                 particular=None,
#                                                 creditor=j.purchase_bill.transporter,
#                                                 customer=None,
#                                                 effect_on=j.parent.transaction_from,
#                                                 transaction_type="Debit",
#                                                 transaction_method=j.parent.payment_receipt_type,
#                                                 booking_id=None,
#                                                 invoice_id=None,
#                                                 payment_receipt_id=j.parent.pk,
#                                                 contra_id=None,
#                                                 journal_id=None,
#                                                 amount=j.parent.total_amount,
#                                                 location=j.parent.location,
#                                                 site=j.parent.site,
#                                             )
#                                             logs.save()
#                                         break
#                                 purchase.parent.is_purchase_completed = True
#                                 purchase.parent.bill_amount = float(
#                                     purchase.parent.bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.due_bill_amount = float(
#                                     purchase.parent.due_bill_amount
#                                 ) - float(payment.due_amount)
#                                 purchase.parent.save()
#                                 if purchase.parent.bill_amount == float(0):
#                                     purchase.parent.delete()
#                                 else:
#                                     purchase.delete()

#                             elif payment.due_amount > purchase_amount:
#                                 purchase.parent.bill_amount = float(
#                                     purchase.parent.bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.due_bill_amount = float(
#                                     purchase.parent.due_bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.save()
#                                 if purchase.parent.bill_amount == float(0):
#                                     purchase.parent.delete()
#                                 else:
#                                     purchase.delete()

#                             elif payment.due_amount == purchase_amount:
#                                 purchase.parent.bill_amount = float(
#                                     purchase.parent.bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.due_bill_amount = float(
#                                     purchase.parent.due_bill_amount
#                                 ) - float(purchase_amount)
#                                 purchase.parent.is_purchase_completed = True
#                                 purchase.parent.save()

#                                 if purchase.parent.bill_amount == float(0):
#                                     purchase.parent.delete()
#                                 else:
#                                     purchase.delete()
#                     else:
#                         purchase.parent.due_bill_amount = float(
#                             purchase.parent.due_bill_amount
#                         ) - float(purchase_amount)
#                         purchase.parent.bill_amount = float(
#                             purchase.parent.bill_amount
#                         ) - float(purchase_amount)
#                         purchase.parent.save()
#                         if purchase.parent.bill_amount == float(0):
#                             purchase.parent.delete()
#                         else:
#                             purchase.delete()

#                 # If Booking is Invoiced
#                 if booking.is_invoiced:
#                     invoice = InvoiceBillLine.objects.filter(booking=booking).first()
#                     delete_log = TransactionLog.objects.filter(
#                         invoice_id=invoice.parent.pk
#                     )
#                     if delete_log.exists():
#                         delete_log.delete()
#                     invoice_amount = float(0)
#                     invoice_amount_without_tax = float(0)
#                     for invoice_line in InvoiceBillLine.objects.filter(booking=booking):
#                         invoice_amount = float(invoice_amount) + float(
#                             invoice_line.total_amount
#                         )
#                         invoice_amount_without_tax = float(
#                             invoice_amount_without_tax
#                         ) + float(invoice_line.freight_amount)

#                     # Check if Invoice is transaction effected or not
#                     if (
#                         InvoiceBillLine.objects.filter(booking=booking)
#                         .first()
#                         .parent.is_transaction_effected
#                     ):
#                         # Check if Payment Receipt has one or less than one line
#                         if not main.filter(invoice_bill=invoice.parent).count() > 1:
#                             receipt = PaymentReceiptLine.objects.get(
#                                 invoice_bill=invoice.parent
#                             )

#                             if receipt.due_amount < invoice_amount:
#                                 receipt.parent.transaction_from.total_balance = (
#                                     float(receipt.parent.transaction_from.total_balance)
#                                     - (
#                                         float(invoice_amount)
#                                         - float(receipt.due_amount)
#                                     )
#                                     + float(receipt.tds)
#                                     + float(receipt.kasar)
#                                 )
#                                 receipt.parent.transaction_from.save()
#                                 delete_log = TransactionLog.objects.filter(
#                                     payment_receipt_id=receipt.parent.pk
#                                 )
#                                 if delete_log.exists():
#                                     delete_log.delete()

#                                 invoice.parent.total_amount_without_tax = float(
#                                     invoice.parent.total_amount_without_tax
#                                 ) - float(invoice_amount_without_tax)
#                                 invoice.parent.total_amount = float(
#                                     invoice.parent.total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.due_total_amount = float(
#                                     invoice.parent.due_total_amount
#                                 ) - float(receipt.due_amount)
#                                 invoice.parent.save()
#                                 if invoice.parent.state == invoice.parent.site.state:
#                                     invoice.parent.sgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.cgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.save()
#                                 else:
#                                     invoice.parent.sgst_amount = float(
#                                         invoice.parent.total_amount
#                                     ) - float(invoice.parent.total_amount_without_tax)
#                                     invoice.parent.save()

#                                 invoice.parent.amount_in_words = str(
#                                     num2words(round(invoice.parent.total_amount))
#                                 ).upper()
#                                 invoice.parent.save()
#                                 receipt.parent.receipt_amount = float(
#                                     receipt.parent.receipt_amount
#                                 ) - (float(invoice_amount) - float(receipt.due_amount))
#                                 receipt.parent.total_amount = float(
#                                     receipt.parent.total_amount
#                                 ) - (float(invoice_amount) - float(receipt.due_amount))
#                                 receipt.parent.tds = float(receipt.parent.tds) - float(
#                                     receipt.tds
#                                 )
#                                 receipt.parent.kasar = float(
#                                     receipt.parent.kasar
#                                 ) - float(receipt.kasar)
#                                 receipt.parent.save()
#                                 receipt.due_amount = float(receipt.due_amount) - (
#                                     float(invoice_amount)
#                                     - (
#                                         float(invoice_amount)
#                                         - float(receipt.due_amount)
#                                     )
#                                 )
#                                 receipt.receipt_amount = float(
#                                     receipt.receipt_amount
#                                 ) - (float(invoice_amount) - float(receipt.due_amount))
#                                 receipt.save()
#                                 if receipt.due_amount == float(0):
#                                     receipt.invoice_bill.is_invoice_completed = True
#                                     receipt.invoice_bill.save()

#                                 if invoice.parent.total_amount_without_tax == float(0):
#                                     invoice.parent.delete()
#                                 else:
#                                     for delete_line in InvoiceBillLine.objects.filter(
#                                         booking=booking
#                                     ):
#                                         delete_line.delete()

#                             elif receipt.due_amount > invoice_amount:
#                                 receipt.due_amount = float(receipt.due_amount) - float(
#                                     invoice_amount
#                                 )
#                                 receipt.save()
#                                 invoice.parent.total_amount_without_tax = float(
#                                     invoice.parent.total_amount_without_tax
#                                 ) - float(invoice_amount_without_tax)
#                                 invoice.parent.total_amount = float(
#                                     invoice.parent.total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.due_total_amount = float(
#                                     receipt.due_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.save()
#                                 if invoice.parent.state == invoice.parent.site.state:
#                                     invoice.parent.sgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.cgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.save()
#                                 else:
#                                     invoice.parent.sgst_amount = float(
#                                         invoice.parent.total_amount
#                                     ) - float(invoice.parent.total_amount_without_tax)
#                                     invoice.parent.save()
#                                 invoice.parent.amount_in_words = str(
#                                     num2words(round(invoice.parent.total_amount))
#                                 ).upper()
#                                 invoice.parent.save()
#                                 if invoice.parent.total_amount_without_tax == float(0):
#                                     invoice.parent.delete()
#                                 else:
#                                     for delete_line in InvoiceBillLine.objects.filter(
#                                         booking=booking
#                                     ):
#                                         delete_line.delete()

#                             elif receipt.due_amount == invoice_amount:
#                                 invoice.parent.total_amount_without_tax = float(
#                                     invoice.parent.total_amount_without_tax
#                                 ) - float(invoice_amount_without_tax)
#                                 invoice.parent.total_amount = float(
#                                     invoice.parent.total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.due_total_amount = float(
#                                     invoice.parent.due_total_amount
#                                 ) - float(receipt.due_amount)
#                                 invoice.parent.save()
#                                 if invoice.parent.state == invoice.parent.site.state:
#                                     invoice.parent.sgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.cgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.save()
#                                 else:
#                                     invoice.parent.sgst_amount = float(
#                                         invoice.parent.total_amount
#                                     ) - float(invoice.parent.total_amount_without_tax)
#                                     invoice.parent.save()
#                                 invoice.parent.amount_in_words = str(
#                                     num2words(round(invoice.parent.total_amount))
#                                 ).upper()
#                                 invoice.parent.save()
#                                 receipt.due_amount = float(receipt.due_amount) - (
#                                     float(invoice_amount)
#                                     - (
#                                         float(invoice_amount)
#                                         - float(receipt.due_amount)
#                                     )
#                                 )
#                                 receipt.save()
#                                 if receipt.due_amount == float(0):
#                                     receipt.invoice_bill.is_invoice_completed = True
#                                     receipt.invoice_bill.save()

#                                 if invoice.parent.total_amount_without_tax == float(0):
#                                     invoice.parent.delete()
#                                 else:
#                                     for delete_line in InvoiceBillLine.objects.filter(
#                                         booking=booking
#                                     ):
#                                         delete_line.delete()

#                         else:
#                             receipt = main.filter(invoice_bill=invoice.parent).last()
#                             invoice_payment = float(0)
#                             kasar1 = float(0)
#                             tds1 = float(0)
#                             for invoice_line_1 in main.filter(
#                                 invoice_bill=invoice.parent
#                             ):
#                                 invoice_payment = float(invoice_payment) + float(
#                                     invoice_line_1.receipt_amount
#                                 )
#                                 kasar1 = kasar1 + float(invoice_line_1.kasar)
#                                 tds1 = tds1 + float(invoice_line_1.tds)
#                             if receipt.due_amount < invoice_amount:
#                                 temp = float(invoice_payment) - (
#                                     float(invoice.parent.total_amount)
#                                     - float(invoice_amount)
#                                 )
#                                 receipt.parent.transaction_from.total_balance = (
#                                     float(receipt.parent.transaction_from.total_balance)
#                                     - temp
#                                 )
#                                 receipt.parent.transaction_from.save()
#                                 delete_log = TransactionLog.objects.filter(
#                                     payment_receipt_id=receipt.pk
#                                 )
#                                 if delete_log.exists():
#                                     delete_log.delete()

#                                 for i in main.filter(invoice_bill=invoice.parent):
#                                     if temp > i.receipt_amount:

#                                         i.parent.receipt_amount = float(
#                                             i.parent.receipt_amount
#                                         ) - (
#                                             temp
#                                             - (float(temp) - float(i.receipt_amount))
#                                         )
#                                         i.parent.total_amount = float(
#                                             i.parent.total_amount
#                                         ) - (
#                                             temp
#                                             - (float(temp) - float(i.receipt_amount))
#                                         )
#                                         # i.parent.tds = float(i.parent.tds) - float(i.tds)
#                                         # i.parent.kasar = float(i.parent.kasar) - float(i.kasar)
#                                         i.parent.save()
#                                         temp = float(temp) - float(i.receipt_amount)
#                                         if i.parent.receipt_amount == float(0):
#                                             i.parent.delete()
#                                         else:
#                                             logs = TransactionLog.create(
#                                                 created_at=created_at,
#                                                 date=i.parent.entry_date,
#                                                 vch_no=i.parent.entry_no,
#                                                 vch_type="RECEIPT",
#                                                 particular=None,
#                                                 creditor=None,
#                                                 customer=i.invoice_bill.customer,
#                                                 effect_on=i.parent.transaction_from,
#                                                 transaction_type="Credit",
#                                                 transaction_method=i.parent.payment_receipt_type,
#                                                 booking_id=None,
#                                                 invoice_id=None,
#                                                 payment_receipt_id=i.parent.pk,
#                                                 contra_id=None,
#                                                 journal_id=None,
#                                                 amount=i.parent.total_amount,
#                                                 location=i.parent.location,
#                                                 site=i.parent.site,
#                                             )
#                                             logs.save()
#                                             i.delete()
#                                     else:
#                                         i.parent.receipt_amount = (
#                                             float(i.parent.receipt_amount) - temp
#                                         )
#                                         i.parent.total_amount = (
#                                             float(i.parent.total_amount) - temp
#                                         )
#                                         # i.parent.tds = float(i.parent.tds) - float(i.tds)
#                                         # i.parent.kasar = float(i.parent.kasar) - float(i.kasar)
#                                         i.parent.save()
#                                         i.due_amount = float(0)
#                                         i.receipt_amount = (
#                                             float(i.receipt_amount) - temp
#                                         )
#                                         i.save()
#                                         if i.parent.receipt_amount == float(0):
#                                             i.parent.delete()
#                                         else:
#                                             logs = TransactionLog.create(
#                                                 created_at=created_at,
#                                                 date=i.parent.entry_date,
#                                                 vch_no=i.parent.entry_no,
#                                                 vch_type="RECEIPT",
#                                                 particular=None,
#                                                 creditor=None,
#                                                 customer=i.invoice_bill.customer,
#                                                 effect_on=i.parent.transaction_from,
#                                                 transaction_type="Credit",
#                                                 transaction_method=i.parent.payment_receipt_type,
#                                                 booking_id=None,
#                                                 invoice_id=None,
#                                                 payment_receipt_id=i.parent.pk,
#                                                 contra_id=None,
#                                                 journal_id=None,
#                                                 amount=i.parent.total_amount,
#                                                 location=i.parent.location,
#                                                 site=i.parent.site,
#                                             )
#                                             logs.save()
#                                         break
#                                 invoice.parent.is_invoice_completed = True
#                                 invoice.parent.total_amount_without_tax = float(
#                                     invoice.parent.total_amount_without_tax
#                                 ) - float(invoice_amount_without_tax)
#                                 invoice.parent.due_total_amount = float(
#                                     invoice.parent.due_total_amount
#                                 ) - float(receipt.due_amount)
#                                 invoice.parent.total_amount = float(
#                                     invoice.parent.total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.save()
#                                 if invoice.parent.state == invoice.parent.site.state:
#                                     invoice.parent.sgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.cgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.save()
#                                 else:
#                                     invoice.parent.sgst_amount = float(
#                                         invoice.parent.total_amount
#                                     ) - float(invoice.parent.total_amount_without_tax)
#                                     invoice.parent.save()
#                                 invoice.parent.amount_in_words = str(
#                                     num2words(round(invoice.parent.total_amount))
#                                 ).upper()
#                                 invoice.parent.save()
#                                 if invoice.parent.total_amount_without_tax == float(0):
#                                     invoice.parent.delete()
#                                 else:
#                                     for delete_line in InvoiceBillLine.objects.filter(
#                                         booking=booking
#                                     ):
#                                         delete_line.delete()

#                             elif receipt.due_amount > invoice_amount:
#                                 invoice.parent.total_amount_without_tax = float(
#                                     invoice.parent.total_amount_without_tax
#                                 ) - float(invoice_amount_without_tax)
#                                 invoice.parent.total_amount = float(
#                                     invoice.parent.total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.due_total_amount = float(
#                                     invoice.parent.due_total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.save()
#                                 if invoice.parent.state == invoice.parent.site.state:
#                                     invoice.parent.sgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.cgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.save()
#                                 else:
#                                     invoice.parent.sgst_amount = float(
#                                         invoice.parent.total_amount
#                                     ) - float(invoice.parent.total_amount_without_tax)
#                                     invoice.parent.save()
#                                 invoice.parent.amount_in_words = str(
#                                     num2words(round(invoice.parent.total_amount))
#                                 ).upper()
#                                 invoice.parent.save()
#                                 if invoice.parent.total_amount_without_tax == float(0):
#                                     invoice.parent.delete()
#                                 else:
#                                     for delete_line in InvoiceBillLine.objects.filter(
#                                         booking=booking
#                                     ):
#                                         delete_line.delete()
#                             elif receipt.due_amount == invoice_amount:
#                                 invoice.parent.total_amount_without_tax = float(
#                                     invoice.parent.total_amount_without_tax
#                                 ) - float(invoice_amount_without_tax)
#                                 invoice.parent.total_amount = float(
#                                     invoice.parent.total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.due_total_amount = float(
#                                     invoice.parent.due_total_amount
#                                 ) - float(invoice_amount)
#                                 invoice.parent.is_invoice_completed = True
#                                 invoice.parent.save()
#                                 if invoice.parent.state == invoice.parent.site.state:
#                                     invoice.parent.sgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.cgst_amount = (
#                                         float(invoice.parent.total_amount)
#                                         - float(invoice.parent.total_amount_without_tax)
#                                     ) / float(2)
#                                     invoice.parent.save()
#                                 else:
#                                     invoice.parent.sgst_amount = float(
#                                         invoice.parent.total_amount
#                                     ) - float(invoice.parent.total_amount_without_tax)
#                                     invoice.parent.save()
#                                 invoice.parent.amount_in_words = str(
#                                     num2words(round(invoice.parent.total_amount))
#                                 ).upper()
#                                 invoice.parent.save()
#                                 if invoice.parent.total_amount_without_tax == float(0):
#                                     invoice.parent.delete()
#                                 else:
#                                     for delete_line in InvoiceBillLine.objects.filter(
#                                         booking=booking
#                                     ):
#                                         delete_line.delete()

#                     else:
#                         invoice.parent.total_amount_without_tax = float(
#                             invoice.parent.total_amount_without_tax
#                         ) - float(invoice_amount_without_tax)
#                         invoice.parent.total_amount = float(
#                             invoice.parent.total_amount
#                         ) - float(invoice_amount)
#                         invoice.parent.save()
#                         if invoice.parent.state == invoice.parent.site.state:
#                             invoice.parent.sgst_amount = (
#                                 float(invoice.parent.total_amount)
#                                 - float(invoice.parent.total_amount_without_tax)
#                             ) / float(2)
#                             invoice.parent.cgst_amount = (
#                                 float(invoice.parent.total_amount)
#                                 - float(invoice.parent.total_amount_without_tax)
#                             ) / float(2)
#                             invoice.parent.save()
#                         else:
#                             invoice.parent.sgst_amount = float(
#                                 invoice.parent.total_amount
#                             ) - float(invoice.parent.total_amount_without_tax)
#                             invoice.parent.save()
#                         invoice.parent.amount_in_words = str(
#                             num2words(round(invoice.parent.total_amount))
#                         ).upper()
#                         invoice.parent.save()
#                         if invoice.parent.total_amount_without_tax == float(0):
#                             invoice.parent.delete()
#                         else:
#                             for delete_line in InvoiceBillLine.objects.filter(
#                                 booking=booking
#                             ):
#                                 delete_line.delete()

#                 booking.purchase_id = None
#                 booking.is_purchased = False
#                 booking.invoice_id = None
#                 booking.is_invoiced = False
#                 booking.transaction_effected = False
#                 booking.save()
#                 data = booking.get_booking_data()
#                 if not BookingBill.objects.filter(booking=booking).exists():
#                     data["bill"] = {
#                         "bill_party": "",
#                         "company_acc_name": "",
#                         "bill_line": [],
#                     }
#                 else:
#                     bill = BookingBill.objects.get(booking=booking)
#                     bill_line_obj = BookingBillLine.objects.filter(booking_bill=bill)
#                     data["bill"] = {
#                         "pk": str(bill.pk),
#                         "bill_party": ""
#                         if bill.bill_party is None
#                         else bill.bill_party.name,
#                         "company_acc_name": bill.company_account_name,
#                         "bill_line": [],
#                     }
#                     bill_line = [
#                         {
#                             "pk": str(line_two.pk),
#                             "type_of_charge": line_two.type_of_charge.description,
#                             "bill_amount": str(float(line_two.bill_amount)),
#                             "rcm": line_two.rcm,
#                         }
#                         for line_two in bill_line_obj
#                     ]
#                     data["bill"]["bill_line"] = bill_line
#                 data["delete_line_list"] = []
#                 return Response(data, status=200)

#         except Exception:
#             error_log = logging.getLogger("error_log")
#             error_log.error(traceback.format_exc())
#             return Response({"errorMsg": "Data Not Found"}, status=200)


class CancelTransactionEffect(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            booking = BookingMaster.objects.get(pk=pk)
            if not booking.transaction_effected:
                return Response(
                    {"errorMsg": "Transaction Effect Already Cancelled"}, status=200
                )

            booking_log = TransactionLog.objects.filter(booking_id=booking.pk)
            booking_log.delete()
            account = AccountMaster.objects.get(
                account_type="CASH_ON_HAND",
                location=booking.location,
                site=booking.site,
            )

            for each_pr_voucher in PaymentReceiptMaster.objects.filter(
                booking_id=booking.pk
            ):
                account.total_balance = float(account.total_balance) + float(
                    each_pr_voucher.total_amount
                )

                account.save()
                voucher_log = TransactionLog.objects.filter(
                    payment_receipt_id=each_pr_voucher.pk
                )
                if voucher_log.exists():
                    voucher_log.delete()
                each_pr_voucher.delete()

            for each_journal_voucher in JournalVoucher.objects.filter(
                booking_id=booking.pk
            ):
                voucher_log = TransactionLog.objects.filter(
                    journal_id=each_journal_voucher.pk
                )
                if voucher_log.exists():
                    voucher_log.delete()

                if not CreditorMaster.objects.filter(
                    name=each_journal_voucher.account_name,
                    category="Container Yard",
                    location=booking.location,
                    site=booking.site,
                ).exists():
                    account.total_balance = float(account.total_balance) + float(
                        each_journal_voucher.amount
                    )
                    account.save()

                each_journal_voucher.delete()

            if booking.is_purchased:
                purchase_line = PurchaseMasterLine.objects.get(booking=booking)
                if (
                    not purchase_line.parent.is_transaction_effected
                    and not PurchaseMasterLine.objects.filter(
                        parent=purchase_line.parent
                    ).count()
                    > 1
                ):
                    purchase_line.parent.delete()
                elif (
                    not purchase_line.parent.is_transaction_effected
                    and PurchaseMasterLine.objects.filter(
                        parent=purchase_line.parent
                    ).count()
                    > 1
                ):
                    purchase_line.parent.bill_amount = float(
                        purchase_line.parent.bill_amount
                    ) - float(booking.balance)
                    purchase_line.parent.due_bill_amount = float(
                        purchase_line.parent.due_bill_amount
                    ) - float(booking.balance)
                    purchase_line.parent.save()
                    purchase_line.delete()
                elif (
                    purchase_line.parent.is_transaction_effected
                    and not PurchaseMasterLine.objects.filter(
                        parent=purchase_line.parent
                    ).count()
                    > 1
                ):
                    payment_receipt_line = PaymentReceiptLine.objects.filter(
                        purchase_bill=purchase_line.parent
                    )

                    for each_pr_line in payment_receipt_line:
                        payment_receipt_parent = each_pr_line.parent
                        account = each_pr_line.parent.transaction_from

                        payment_receipt_parent.receipt_amount = float(
                            payment_receipt_parent.receipt_amount
                        ) - float(each_pr_line.receipt_amount)
                        payment_receipt_parent.kasar = float(
                            payment_receipt_parent.kasar
                        ) - float(each_pr_line.kasar)
                        payment_receipt_parent.tds = float(
                            payment_receipt_parent.tds
                        ) - float(each_pr_line.tds)
                        payment_receipt_parent.total_amount = float(
                            payment_receipt_parent.total_amount
                        ) - float(
                            each_pr_line.receipt_amount
                            + each_pr_line.kasar
                            + each_pr_line.tds
                        )
                        payment_receipt_parent.save()
                        delete_log = TransactionLog.objects.filter(
                            payment_receipt_id=payment_receipt_parent.pk
                        )
                        if delete_log.exists():
                            delete_log.delete()
                        if (
                            PaymentReceiptLine.objects.filter(
                                parent=payment_receipt_parent
                            ).count()
                            > 1
                        ):
                            account.total_balance = float(
                                account.total_balance
                            ) + float(each_pr_line.receipt_amount)
                            account.save()
                            logs = TransactionLog.create(
                                created_at=datetime.datetime.now().astimezone(
                                    timezone.get_current_timezone()
                                ),
                                date=payment_receipt_parent.entry_date,
                                vch_no=payment_receipt_parent.entry_no,
                                vch_type="PAYMENT",
                                particular=None,
                                creditor=payment_receipt_parent.creditor,
                                customer=None,
                                effect_on=payment_receipt_parent.transaction_from,
                                transaction_type="Debit",
                                transaction_method=payment_receipt_parent.payment_receipt_type,
                                booking_id=None,
                                invoice_id=None,
                                payment_receipt_id=payment_receipt_parent.pk,
                                contra_id=None,
                                journal_id=None,
                                amount=float(payment_receipt_parent.total_amount),
                                location=payment_receipt_parent.location,
                                site=payment_receipt_parent.site,
                            )
                            logs.save()
                            each_pr_line.delete()

                        else:
                            account.total_balance = float(
                                account.total_balance
                            ) + float(
                                each_pr_line.receipt_amount
                                + each_pr_line.kasar
                                + each_pr_line.tds
                            )
                            account.save()
                            payment_receipt_parent.delete()

                    purchase_line.parent.delete()
                elif (
                    purchase_line.parent.is_transaction_effected
                    and PurchaseMasterLine.objects.filter(
                        parent=purchase_line.parent
                    ).count()
                    > 1
                ):
                    total_receipt_amount = float(0)
                    for amount in PaymentReceiptLine.objects.filter(
                        purchase_bill=purchase_line.parent
                    ):
                        total_receipt_amount = float(total_receipt_amount) + float(
                            amount.receipt_amount
                        )

                    purchase_line.parent.bill_amount = float(
                        purchase_line.parent.bill_amount
                    ) - float(purchase_line.total_amount)
                    purchase_line.parent.save()

                    if float(purchase_line.parent.bill_amount) > float(
                        total_receipt_amount
                    ):
                        purchase_line.parent.due_bill_amount = float(
                            purchase_line.parent.bill_amount
                        ) - float(total_receipt_amount)
                        purchase_line.parent.save()

                    elif float(purchase_line.parent.bill_amount) == float(
                        total_receipt_amount
                    ):
                        purchase_line.parent.due_bill_amount = float(
                            purchase_line.parent.bill_amount
                        ) - float(total_receipt_amount)
                        purchase_line.parent.is_purchase_completed = True
                        purchase_line.parent.save()

                    elif float(purchase_line.parent.bill_amount) < float(
                        total_receipt_amount
                    ):
                        balance = float(total_receipt_amount) - float(
                            purchase_line.parent.bill_amount
                        )
                        count_of_line = PaymentReceiptLine.objects.filter(
                            purchase_bill=purchase_line.parent
                        ).count()
                        amount_to_decrement = float(balance) / float(count_of_line)
                        purchase_line.parent.due_bill_amount = float(
                            purchase_line.parent.due_bill_amount
                        ) - float(purchase_line.parent.bill_amount - balance)
                        purchase_line.parent.is_purchase_completed = True
                        purchase_line.parent.save()

                        payment_receipt_line = PaymentReceiptLine.objects.filter(
                            purchase_bill=purchase_line.parent
                        )
                        for each_line in payment_receipt_line:
                            account = each_line.parent.transaction_from
                            payment_receipt_parent = each_line.parent

                            account.total_balance = float(
                                account.total_balance
                            ) + float(amount_to_decrement)
                            account.save()
                            payment_receipt_parent.receipt_amount = float(
                                payment_receipt_parent.receipt_amount
                            ) - float(amount_to_decrement)
                            payment_receipt_parent.total_amount = float(
                                payment_receipt_parent.total_amount
                            ) - float(amount_to_decrement)
                            payment_receipt_parent.save()
                            each_line.receipt_amount = float(
                                each_line.receipt_amount
                            ) - float(amount_to_decrement)
                            each_line.due_amount = float(0)
                            each_line.save()

                            delete_log = TransactionLog.objects.filter(
                                payment_receipt_id=payment_receipt_parent.pk
                            )
                            if delete_log.exists():
                                delete_log.delete()

                            logs = TransactionLog.create(
                                created_at=datetime.datetime.now().astimezone(
                                    timezone.get_current_timezone()
                                ),
                                date=payment_receipt_parent.entry_date,
                                vch_no=payment_receipt_parent.entry_no,
                                vch_type="PAYMENT",
                                particular=None,
                                creditor=payment_receipt_parent.creditor,
                                customer=None,
                                effect_on=payment_receipt_parent.transaction_from,
                                transaction_type="Debit",
                                transaction_method=payment_receipt_parent.payment_receipt_type,
                                booking_id=None,
                                invoice_id=None,
                                payment_receipt_id=payment_receipt_parent.pk,
                                contra_id=None,
                                journal_id=None,
                                amount=float(payment_receipt_parent.total_amount),
                                location=payment_receipt_parent.location,
                                site=payment_receipt_parent.site,
                            )
                            logs.save()

                    purchase_line.delete()

            if booking.is_invoiced:
                collect_invoice_line = InvoiceBillLine.objects.filter(booking=booking)
                amount_to_collect = float(0)
                for each in collect_invoice_line:
                    amount_to_collect = amount_to_collect + float(each.total_amount)
                invoice_count = InvoiceBillLine.objects.filter(booking=booking).count()
                invoice_line = InvoiceBillLine.objects.filter(booking=booking).first()

                if TransactionLog.objects.filter(
                    invoice_id=invoice_line.parent.pk
                ).exists():
                    tlog = TransactionLog.objects.filter(
                        invoice_id=invoice_line.parent.pk
                    )
                    tlog.delete()

                if (
                    not PaymentReceiptLine.objects.filter(
                        invoice_bill=invoice_line.parent
                    ).exists()
                    and not InvoiceBillLine.objects.filter(
                        parent=invoice_line.parent
                    ).count()
                    > invoice_count
                ):
                    invoice_line.parent.delete()

                elif (
                    not PaymentReceiptLine.objects.filter(
                        invoice_bill=invoice_line.parent
                    ).exists()
                    and InvoiceBillLine.objects.filter(
                        parent=invoice_line.parent
                    ).count()
                    > invoice_count
                ):
                    without_tax_amount_to_decrement = float(0)
                    igst_to_decrement = float(0)
                    cgst_to_decrement = float(0)
                    sgst_to_decrement = float(0)
                    total_amount_to_decrement = float(0)
                    for each_invoice_line in InvoiceBillLine.objects.filter(
                        booking=booking
                    ):
                        each_invoice_line.parent.due_total_amount = float(
                            each_invoice_line.parent.due_total_amount
                        ) - float(each_invoice_line.total_amount)
                        each_invoice_line.parent.save()

                        without_tax_amount_to_decrement = float(
                            without_tax_amount_to_decrement
                        ) + float(each_invoice_line.freight_amount)
                        igst_to_decrement = float(igst_to_decrement) + float(
                            each_invoice_line.igst_amount
                        )
                        cgst_to_decrement = float(cgst_to_decrement) + float(
                            each_invoice_line.cgst_amount
                        )
                        sgst_to_decrement = float(sgst_to_decrement) + float(
                            each_invoice_line.sgst_amount
                        )
                        total_amount_to_decrement = float(
                            total_amount_to_decrement
                        ) + float(each_invoice_line.total_amount)
                        each_invoice_line.delete()

                    invoice_line.parent.total_amount_without_tax = float(
                        invoice_line.parent.total_amount_without_tax
                    ) - float(without_tax_amount_to_decrement)
                    invoice_line.parent.igst_amount = float(
                        invoice_line.parent.igst_amount
                    ) - float(igst_to_decrement)
                    invoice_line.parent.cgst_amount = float(
                        invoice_line.parent.cgst_amount
                    ) - float(cgst_to_decrement)
                    invoice_line.parent.sgst_amount = float(
                        invoice_line.parent.sgst_amount
                    ) - float(sgst_to_decrement)
                    invoice_line.parent.total_amount = float(
                        invoice_line.parent.total_amount
                    ) - float(total_amount_to_decrement)
                    invoice_line.parent.save()
                    invoice_line.parent.amount_in_words = str(
                        num2words(round(invoice_line.parent.total_amount))
                    ).upper()
                    invoice_line.parent.save()

                    logs = TransactionLog.create(
                        created_at=datetime.datetime.now().astimezone(
                            timezone.get_current_timezone()
                        ),
                        date=invoice_line.parent.bill_date,
                        vch_no=invoice_line.parent.bill_no,
                        vch_type="INVOICE",
                        particular=None,
                        creditor=None,
                        customer=invoice_line.parent.customer,
                        effect_on=None,
                        transaction_type="Debit",
                        transaction_method=None,
                        booking_id=None,
                        invoice_id=invoice_line.parent.pk,
                        payment_receipt_id=None,
                        contra_id=None,
                        journal_id=None,
                        amount=invoice_line.parent.total_amount,
                        location=invoice_line.parent.location,
                        site=invoice_line.parent.site,
                    )
                    logs.save()

                elif (
                    PaymentReceiptLine.objects.filter(
                        invoice_bill=invoice_line.parent
                    ).exists()
                    and not InvoiceBillLine.objects.filter(
                        parent=invoice_line.parent
                    ).count()
                    > invoice_count
                ):
                    payment_receipt_line = PaymentReceiptLine.objects.filter(
                        invoice_bill=invoice_line.parent
                    )
                    for each_pr_line in payment_receipt_line:
                        payment_receipt_parent = each_pr_line.parent

                        account = each_pr_line.parent.transaction_from
                        payment_receipt_parent.receipt_amount = float(
                            payment_receipt_parent.receipt_amount
                        ) - float(each_pr_line.receipt_amount)
                        payment_receipt_parent.kasar = float(
                            payment_receipt_parent.kasar
                        ) - float(each_pr_line.kasar)
                        payment_receipt_parent.tds = float(
                            payment_receipt_parent.tds
                        ) - float(each_pr_line.tds)
                        payment_receipt_parent.total_amount = float(
                            payment_receipt_parent.total_amount
                        ) - float(
                            each_pr_line.receipt_amount
                            + each_pr_line.kasar
                            + each_pr_line.tds
                        )
                        payment_receipt_parent.save()

                        delete_log = TransactionLog.objects.filter(
                            payment_receipt_id=payment_receipt_parent.pk
                        )
                        if delete_log.exists():
                            delete_log.delete()

                        if (
                            PaymentReceiptLine.objects.filter(
                                parent=payment_receipt_parent
                            ).count()
                            > 1
                        ):
                            account.total_balance = float(
                                account.total_balance
                            ) - float(each_pr_line.receipt_amount)
                            account.save()
                            logs = TransactionLog.create(
                                created_at=datetime.datetime.now().astimezone(
                                    timezone.get_current_timezone()
                                ),
                                date=payment_receipt_parent.entry_date,
                                vch_no=payment_receipt_parent.entry_no,
                                vch_type="RECEIPT",
                                particular=None,
                                creditor=None,
                                customer=payment_receipt_parent.customer,
                                effect_on=payment_receipt_parent.transaction_from,
                                transaction_type="Credit",
                                transaction_method=payment_receipt_parent.payment_receipt_type,
                                booking_id=None,
                                invoice_id=None,
                                payment_receipt_id=payment_receipt_parent.pk,
                                contra_id=None,
                                journal_id=None,
                                amount=float(payment_receipt_parent.total_amount),
                                location=payment_receipt_parent.location,
                                site=payment_receipt_parent.site,
                            )
                            logs.save()
                            each_pr_line.delete()

                        else:
                            account.total_balance = float(
                                account.total_balance
                            ) - float(
                                each_pr_line.receipt_amount
                                + each_pr_line.kasar
                                + each_pr_line.tds
                            )
                            account.save()
                            payment_receipt_parent.delete()
                    invoice_line.parent.delete()

                elif (
                    PaymentReceiptLine.objects.filter(
                        invoice_bill=invoice_line.parent
                    ).exists()
                    and InvoiceBillLine.objects.filter(
                        parent=invoice_line.parent
                    ).count()
                    > invoice_count
                ):

                    total_receipt_amount = float(0)
                    for amount in PaymentReceiptLine.objects.filter(
                        invoice_bill=invoice_line.parent
                    ):
                        total_receipt_amount = float(total_receipt_amount) + float(
                            amount.receipt_amount
                        )

                    without_tax_amount_to_decrement = float(0)
                    igst_to_decrement = float(0)
                    cgst_to_decrement = float(0)
                    sgst_to_decrement = float(0)
                    total_amount_to_decrement = float(0)

                    for each_invoice_line in InvoiceBillLine.objects.filter(
                        booking=booking
                    ):
                        without_tax_amount_to_decrement = float(
                            without_tax_amount_to_decrement
                        ) + float(each_invoice_line.freight_amount)
                        igst_to_decrement = float(igst_to_decrement) + float(
                            each_invoice_line.igst_amount
                        )
                        cgst_to_decrement = float(cgst_to_decrement) + float(
                            each_invoice_line.cgst_amount
                        )
                        sgst_to_decrement = float(sgst_to_decrement) + float(
                            each_invoice_line.sgst_amount
                        )
                        total_amount_to_decrement = float(
                            total_amount_to_decrement
                        ) + float(each_invoice_line.total_amount)

                    invoice_line.parent.total_amount_without_tax = float(
                        invoice_line.parent.total_amount_without_tax
                    ) - float(without_tax_amount_to_decrement)
                    invoice_line.parent.igst_amount = float(
                        invoice_line.parent.igst_amount
                    ) - float(igst_to_decrement)
                    invoice_line.parent.cgst_amount = float(
                        invoice_line.parent.cgst_amount
                    ) - float(cgst_to_decrement)
                    invoice_line.parent.sgst_amount = float(
                        invoice_line.parent.sgst_amount
                    ) - float(sgst_to_decrement)
                    invoice_line.parent.total_amount = float(
                        invoice_line.parent.total_amount
                    ) - float(total_amount_to_decrement)
                    invoice_line.parent.save()
                    invoice_line.parent.amount_in_words = str(
                        num2words(round(invoice_line.parent.total_amount))
                    ).upper()
                    invoice_line.parent.save()

                    if float(invoice_line.parent.total_amount) > float(
                        total_receipt_amount
                    ):
                        invoice_line.parent.due_total_amount = float(
                            invoice_line.parent.total_amount
                        ) - float(total_receipt_amount)
                        invoice_line.parent.save()

                    elif float(invoice_line.parent.total_amount) == float(
                        total_receipt_amount
                    ):
                        invoice_line.parent.due_total_amount = float(
                            invoice_line.parent.total_amount
                        ) - float(total_receipt_amount)
                        invoice_line.parent.is_invoice_completed = True
                        invoice_line.parent.save()

                    elif float(invoice_line.parent.total_amount) < float(
                        total_receipt_amount
                    ):

                        balance = float(total_receipt_amount) - float(
                            invoice_line.parent.total_amount
                        )
                        count_of_line = PaymentReceiptLine.objects.filter(
                            invoice_bill=invoice_line.parent
                        ).count()
                        amount_to_decrement = float(balance) / float(count_of_line)
                        invoice_line.parent.due_total_amount = float(0)
                        invoice_line.parent.is_invoice_completed = True
                        invoice_line.parent.save()
                        logs = TransactionLog.create(
                            created_at=datetime.datetime.now().astimezone(
                                timezone.get_current_timezone()
                            ),
                            date=invoice_line.parent.bill_date,
                            vch_no=invoice_line.parent.bill_no,
                            vch_type="INVOICE",
                            particular=None,
                            creditor=None,
                            customer=invoice_line.parent.customer,
                            effect_on=None,
                            transaction_type="Debit",
                            transaction_method=None,
                            booking_id=None,
                            invoice_id=invoice_line.parent.pk,
                            payment_receipt_id=None,
                            contra_id=None,
                            journal_id=None,
                            amount=invoice_line.parent.total_amount,
                            location=invoice_line.parent.location,
                            site=invoice_line.parent.site,
                        )
                        logs.save()

                        payment_receipt_line = PaymentReceiptLine.objects.filter(
                            invoice_bill=invoice_line.parent
                        )
                        for each_line in payment_receipt_line:
                            account = each_line.parent.transaction_from
                            payment_receipt_parent = each_line.parent

                            account.total_balance = float(
                                account.total_balance
                            ) - float(amount_to_decrement)
                            account.save()
                            payment_receipt_parent.receipt_amount = float(
                                payment_receipt_parent.receipt_amount
                            ) - float(amount_to_decrement)
                            payment_receipt_parent.total_amount = float(
                                payment_receipt_parent.total_amount
                            ) - float(amount_to_decrement)
                            payment_receipt_parent.save()
                            each_line.receipt_amount = float(
                                each_line.receipt_amount
                            ) - float(amount_to_decrement)
                            each_line.due_amount = float(0)
                            each_line.save()

                            delete_log = TransactionLog.objects.filter(
                                payment_receipt_id=payment_receipt_parent.pk
                            )
                            if delete_log.exists():
                                delete_log.delete()

                            logs = TransactionLog.create(
                                created_at=datetime.datetime.now().astimezone(
                                    timezone.get_current_timezone()
                                ),
                                date=payment_receipt_parent.entry_date,
                                vch_no=payment_receipt_parent.entry_no,
                                vch_type="RECEIPT",
                                particular=None,
                                creditor=None,
                                customer=payment_receipt_parent.customer,
                                effect_on=account,
                                transaction_type="Credit",
                                transaction_method=payment_receipt_parent.payment_receipt_type,
                                booking_id=None,
                                invoice_id=None,
                                payment_receipt_id=payment_receipt_parent.pk,
                                contra_id=None,
                                journal_id=None,
                                amount=float(payment_receipt_parent.total_amount),
                                location=payment_receipt_parent.location,
                                site=payment_receipt_parent.site,
                            )
                            logs.save()

                    for delete_line in InvoiceBillLine.objects.filter(booking=booking):
                        delete_line.delete()

            booking.purchase_id = None
            booking.is_purchased = False
            booking.invoice_id = None
            booking.is_invoiced = False
            booking.transaction_effected = False
            booking.save()
            data = booking.get_booking_data()
            if not BookingBill.objects.filter(booking=booking).exists():
                data["bill"] = {
                    "bill_party": "",
                    "company_acc_name": "",
                    "bill_line": [],
                }
            else:
                bill = BookingBill.objects.get(booking=booking)
                bill_line_obj = BookingBillLine.objects.filter(booking_bill=bill)
                data["bill"] = {
                    "pk": str(bill.pk),
                    "bill_party": ""
                    if bill.bill_party is None
                    else bill.bill_party.name,
                    "company_acc_name": bill.company_account_name,
                    "bill_line": [],
                }
                bill_line = [
                    {
                        "pk": str(line_two.pk),
                        "type_of_charge": line_two.type_of_charge.description,
                        "bill_amount": str(float(line_two.bill_amount)),
                        "rcm": line_two.rcm,
                    }
                    for line_two in bill_line_obj
                ]
                data["bill"]["bill_line"] = bill_line
            data["delete_line_list"] = []
            return Response(data, status=200)

        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
