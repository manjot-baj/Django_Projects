# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone
from transportation.functions import get_fiscal_year_date

# models imports
from master.models import Location, Site
from transportation.models import (
    PurchaseMaster,
    CreditorMaster,
    BookingMaster,
    PurchaseMasterLine,
    PaymentReceiptLine,
    TransactionLog,
)

from account.permissions import HasAllowedRoles
class AddPurchaseMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            mandatory_list = [
                "bill_type",
                "entry_no",
                "entry_date",
                "transporter",
                "purchase_line",
                "due_bill_amount",
                "bill_amount",
                "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if len(data["bill_type"]) == 0:
                return {"errorMsg": "Please Provide Bill Type"}
            if len(data["entry_date"]) == 0:
                return {"errorMsg": "Please Provide Entry Date"}
            if len(data["due_bill_amount"]) == 0:
                return {"errorMsg": "Please Provide Due Bill amount"}
            if len(data["bill_amount"]) == 0:
                return {"errorMsg": "Please Provide Bill amount"}
            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please provide correct location or site"}

            if not CreditorMaster.objects.filter(
                name=data["transporter"],
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            ).exists():
                return {"errorMsg": "Transporter Does not Exist"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_purchase_line_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["lr_no"],
                converted_data["due_amount"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Bill Line Mandatory Data"}

            if not BookingMaster.objects.filter(
                lr_no=converted_data["lr_no"],
                location=location,
                site=site,
            ).exists():
                return {"errorMsg": "Booking Does not exist"}

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

            bill_type = data["bill_type"]
            entry_no = data["entry_no"]
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])

            if PurchaseMaster.checkEntryNo(entry_no, financial_year, location, site):
                return Response({"errorMsg": "Data Already exists"}, status=200)

            entry_date = datetime.datetime.strptime(
                data["entry_date"], "%Y-%m-%d"
            ).date()
            transporter = CreditorMaster.objects.get(
                name=data["transporter"],
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            )
            sup_bill_no = data["sup_bill_no"]
            if not len(data["sup_bill_date"]) == 0:
                sup_bill_date = datetime.datetime.strptime(
                    data["sup_bill_date"], "%Y-%m-%d"
                ).date()
            else:
                sup_bill_date = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
            narration = data["narration"]

            bill_amount = float(0)
            if data["bill_amount"] is not None:
                bill_amount = float(data["bill_amount"])

            due_bill_amount = float(0)
            if data["due_bill_amount"] is not None:
                due_bill_amount = float(data["due_bill_amount"])

            validated_purchase_lines = None
            if not len(data["purchase_line"]) == 0:
                validated_purchase_lines = [
                    self.validate_purchase_line_data(
                        data=line, location=location, site=site
                    )
                    for line in data["purchase_line"]
                ]
            for each in validated_purchase_lines:
                if "errorMsg" in each.keys():
                    return Response(each, status=200)

            purchase_obj = PurchaseMaster.create(
                bill_type=bill_type,
                entry_no=entry_no,
                financial_year=financial_year,
                entry_date=entry_date,
                transporter=transporter,
                sup_bill_no=sup_bill_no,
                sup_bill_date=sup_bill_date,
                narration=narration,
                bill_amount=bill_amount,
                due_bill_amount=due_bill_amount,
                location=location,
                site=site,
            )
            purchase_obj.save()

            # Purchase Line
            total_due_amount = float(0)
            for line in validated_purchase_lines:
                booking = BookingMaster.objects.get(
                    pk=line["booking_pk"],
                )
                booking.is_purchased = True
                booking.purchase_id = purchase_obj.pk
                booking.save()
                purchase_obj.narration = f"{booking.lr_no}, {booking.l_date}"
                purchase_obj.save()
                due_amount = float(line["due_amount"])

                purchase_bill_obj = PurchaseMasterLine.create(
                    parent=purchase_obj,
                    booking=booking,
                    due_amount=due_amount,
                    gst_rate=None,
                    sgst_amount=float(0),
                    cgst_amount=float(0),
                    igst_amount=float(0),
                    total_amount=due_amount,
                )

                purchase_bill_obj.save()
                total_due_amount += due_amount
            purchase_obj.due_bill_amount = total_due_amount
            purchase_obj.save()
            return Response(
                {"successMsg": "Data Saved", "pk": purchase_obj.pk}, status=200
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllPurchaseMaster(views.APIView):
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
            from_date = data["from_date"]
            to_date = data["to_date"]

            if location == "ALL":
                filtered_data = PurchaseMaster.objects.select_related(
                    "location", "site"
                )
            elif site == "ALL":
                filtered_data = PurchaseMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = PurchaseMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if not len(transporter) == 0:
                filtered_data = filtered_data.filter(transporter=transporter)

            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(
                    entry_date__range=(from_date, to_date)
                )

            response_data = [each.get_purchase_lr() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditPurchaseMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            mandatory_list = [
                "bill_type",
                "entry_no",
                "entry_date",
                "transporter",
                "purchase_line",
                "due_bill_amount",
                "bill_amount",
                "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if len(data["bill_type"]) == 0:
                return {"errorMsg": "Please Provide Bill Type"}
            if len(data["entry_date"]) == 0:
                return {"errorMsg": "Please Provide Entry Date"}
            if len(data["due_bill_amount"]) == 0:
                return {"errorMsg": "Please Provide Due Bill amount"}
            if len(data["bill_amount"]) == 0:
                return {"errorMsg": "Please Provide Bill amount"}
            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please provide correct location or site"}

            if not CreditorMaster.objects.filter(
                name=data["transporter"],
                category="Transporter",
                location__name=data["location"],
                site__name=data["site"],
            ).exists():
                return {"errorMsg": "Transporter Does not Exist"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_purchase_line_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [converted_data["lr_no"], converted_data["due_amount"]]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Bill Line Mandatory Data"}

            if not BookingMaster.objects.filter(
                lr_no=converted_data["lr_no"],
                location=location,
                site=site,
            ).exists():
                return {"errorMsg": "Booking Does not exist"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            booking_obj = PurchaseMaster.objects.get(pk=pk)
            data = booking_obj.get_purchase_lr()
            bill = PurchaseMasterLine.objects.filter(parent=booking_obj)
            bill_line = [
                {
                    "pk": str(line.pk),
                    "booking_pk": str(line.booking.pk),
                    "l_date": line.booking.l_date,
                    "lr_no": line.booking.lr_no,
                    "due_amount": str(float(line.due_amount)),
                }
                for line in bill
            ]
            data["purchase_line"] = bill_line
            data["delete_purchase_list"] = []

            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            purchase_obj = PurchaseMaster.objects.get(pk=pk)
            if purchase_obj.is_transaction_effected:
                return Response(
                    {"errorMsg": "Please Cancel the transaction effect"}, status=200
                )
            else:
                data = self.validate_data(request.data)
                if "errorMsg" in data.keys():
                    return Response(data, status=200)

                bill_type = data["bill_type"]
                entry_no = data["entry_no"]
                entry_date = datetime.datetime.strptime(
                    data["entry_date"], "%Y-%m-%d"
                ).date()
                transporter = CreditorMaster.objects.get(
                    name=data["transporter"],
                    category="Transporter",
                    location__name=data["location"],
                    site__name=data["site"],
                )
                sup_bill_no = data["sup_bill_no"]
                if not len(data["sup_bill_date"]) == 0:
                    sup_bill_date = datetime.datetime.strptime(
                        data["sup_bill_date"], "%Y-%m-%d"
                    ).date()
                else:
                    sup_bill_date = datetime.datetime.now().astimezone(
                        timezone.get_current_timezone()
                    )
                narration = data["narration"]
                location_object = Location.objects.get(name=data["location"])
                site_object = Site.objects.get(name=data["site"])

                bill_amount = float(0)
                if data["bill_amount"] is not None:
                    bill_amount = float(data["bill_amount"])

                due_bill_amount = float(0)
                if data["due_bill_amount"] is not None:
                    due_bill_amount = float(data["due_bill_amount"])

                validated_purchase_lines = None
                if not len(data["purchase_line"]) == 0:
                    validated_purchase_lines = [
                        self.validate_purchase_line_data(
                            data=line, location=location_object, site=site_object
                        )
                        for line in data["purchase_line"]
                    ]
                for each in validated_purchase_lines:
                    if "errorMsg" in each.keys():
                        return Response(each, status=200)

                purchase_obj.bill_type = bill_type
                purchase_obj.entry_no = entry_no
                purchase_obj.entry_date = entry_date
                purchase_obj.transporter = transporter
                purchase_obj.sup_bill_no = sup_bill_no
                purchase_obj.sup_bill_date = sup_bill_date
                purchase_obj.narration = narration
                purchase_obj.due_bill_amount = due_bill_amount
                purchase_obj.bill_amount = bill_amount
                purchase_obj.location = location_object
                purchase_obj.site = site_object
                purchase_obj.save()

                if not len(data["delete_purchase_list"]) == 0:
                    for each in data["delete_purchase_list"]:
                        delete_obj = PurchaseMasterLine.objects.filter(pk=each)
                        for obj in delete_obj:
                            obj.booking.purchase_id = None
                            obj.booking.is_purchased = False
                            obj.booking.save()
                            obj.delete()

                # Purchase Bill
                for line in validated_purchase_lines:
                    booking = BookingMaster.objects.get(
                        pk=line["booking_pk"],
                    )
                    due_amount = float(line["due_amount"])
                    if not "pk" in line.keys():
                        new_purchase_bill = PurchaseMasterLine.create(
                            parent=purchase_obj,
                            booking=booking,
                            due_amount=due_amount,
                            gst_rate=None,
                            sgst_amount=float(0),
                            cgst_amount=float(0),
                            igst_amount=float(0),
                            total_amount=due_amount,
                        )
                        new_purchase_bill.save()
                        booking.is_purchased = True
                        booking.save()
                    else:
                        purchase_bill_obj = PurchaseMasterLine.objects.get(
                            pk=line["pk"]
                        )
                        purchase_bill_obj.parent = purchase_obj
                        purchase_bill_obj.booking = booking
                        purchase_bill_obj.due_amount = due_amount
                        purchase_bill_obj.total_amount = due_amount
                        purchase_bill_obj.save()

                    booking.purchase_id = purchase_obj.pk
                    booking.save()

            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeletePurchaseMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            purchase_obj = PurchaseMaster.objects.get(pk=pk)
            if purchase_obj.is_transaction_effected:
                return Response(
                    {
                        "errorMsg": "Please Cancel Transaction effect to delete the Purchase"
                    },
                    status=200,
                )
            else:
                purchase_line = PurchaseMasterLine.objects.filter(parent=purchase_obj)
                for each in purchase_line:
                    each.booking.is_purchased = False
                    each.booking.purchase_id = None
                    each.booking.save()
                purchase_obj.delete()
            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class GetPurchaseLRData(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data

            bkg_obj = BookingMaster.objects.select_related("location", "site").filter(
                location__name=data["location"],
                site__name=data["site"],
                transporter__name=data["transporter"],
                transaction_effected=True,
                is_purchased=False,
                is_draft=False,
            )
            response_data = [each.get_purchase_lr_data() for each in bkg_obj]
            if not response_data:
                return Response({"errorMsg": f"Data of {data['transporter']} not available"}, status=200)


            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class CancelTransactionEffect(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            purchase_obj = PurchaseMaster.objects.get(pk=pk)
            if not purchase_obj.is_transaction_effected:
                return Response(
                    {"errorMsg": "Transaction Effect already cancelled"}, status=200
                )

            if PaymentReceiptLine.objects.filter(purchase_bill=purchase_obj).exists():
                payment_receipt_line = PaymentReceiptLine.objects.filter(
                    purchase_bill=purchase_obj
                )
                for each in payment_receipt_line:
                    parent = each.parent
                    account = each.parent.transaction_from
                    total_amount_to_increase = (
                        float(each.receipt_amount) + float(each.kasar) + float(each.tds)
                    )
                    account.total_balance = float(account.total_balance) + float(
                        total_amount_to_increase
                    )
                    account.save()
                    purchase_obj.due_bill_amount = float(
                        purchase_obj.due_bill_amount
                    ) + float(each.receipt_amount)
                    purchase_obj.save()
                    parent.receipt_amount = float(parent.receipt_amount) - float(
                        each.receipt_amount
                    )
                    parent.kasar = float(parent.kasar) - float(each.kasar)
                    parent.tds = float(parent.tds) - float(each.tds)
                    parent.total_amount = float(parent.total_amount) - float(
                        total_amount_to_increase
                    )
                    parent.save()
                    tlog = TransactionLog.objects.get(payment_receipt_id=parent.pk)
                    tlog.delete()
                    each.delete()
                    if not PaymentReceiptLine.objects.filter(parent=parent).exists():
                        parent.delete()
                    else:
                        tlogs = TransactionLog.create(
                            created_at=datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date(),
                            date=parent.entry_date,
                            vch_no=parent.entry_no,
                            vch_type="PAYMENT",
                            particular=None,
                            creditor=parent.creditor,
                            customer=None,
                            effect_on=parent.transaction_from,
                            transaction_type="Debit",
                            transaction_method=parent.payment_receipt_type,
                            booking_id=None,
                            invoice_id=None,
                            payment_receipt_id=parent.pk,
                            contra_id=None,
                            journal_id=None,
                            amount=parent.total_amount,
                            location=parent.location,
                            site=parent.site,
                        )
                        tlogs.save()

            purchase_obj.is_purchase_completed = False
            purchase_obj.is_transaction_effected = False
            purchase_obj.save()
            data = {}
            data = purchase_obj.get_purchase_lr()
            bill = PurchaseMasterLine.objects.filter(parent=purchase_obj)
            bill_line = [
                {
                    "pk": str(line.pk),
                    "booking_pk": str(line.booking.pk),
                    "l_date": line.booking.l_date,
                    "lr_no": line.booking.lr_no,
                    "due_amount": str(float(line.due_amount)),
                }
                for line in bill
            ]
            data["purchase_line"] = bill_line
            data["delete_purchase_list"] = []
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
