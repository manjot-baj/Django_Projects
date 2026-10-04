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
    CreditorMaster,
    CustomerMaster,
    PurchaseMaster,
    AccountMaster,
    PaymentReceiptMaster,
    PaymentReceiptLine,
    InvoiceBill,
    TransactionLog,
)
from account.permissions import HasAllowedRoles

class AddPaymentReceipt(views.APIView):
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
                "payment_receipt_type",
                "entry_type",
                "transaction",
                "entry_no",
                "entry_date",
                "receipt_amount",
                "total_amount",
                "transaction_from",
                "location",
                "site",
            ]
            if not (data.keys() & mandatory_list):
                return {"errorMsg": "Please Provide Main Mandatory Data"}

            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
            ):
                return {"errorMsg": "Please provide correct location or site"}

            if len(data["creditor"]) == 0 and len(data["customer"]) == 0:
                return {"errorMsg": "Crditor and Customer Both cannot be empty "}

            if not len(data["creditor"]) == 0:
                if not CreditorMaster.objects.filter(
                    name=data["creditor"],
                    location__name=data["location"],
                    site__name=data["site"],
                ).exists():
                    return {"errorMsg": "Creditor Does not Exist"}

            if not len(data["customer"]) == 0:
                if not CustomerMaster.objects.filter(
                    name=data["customer"],
                    location__name=data["location"],
                    site__name=data["site"],
                ).exists():
                    return {"errorMsg": "Customer Does not Exist"}

            if float(data["receipt_amount"]) <= float(0):
                return {"errorMsg": "Zero Receipt Amount is not valid"}

            return data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def validate_payment_receipt_line_data(self, data, location, site):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["against_bill"],
                converted_data["ref_date"],
                converted_data["due_bill_amount"],
                converted_data["receipt_amount"],
                converted_data["kasar"],
                converted_data["tds"],
            ]
            if None in mandatory_list:
                return {"errorMsg": "Please Provide Bill Line Mandatory Data"}
            if float(converted_data["receipt_amount"]) > float(
                converted_data["due_bill_amount"]
            ):
                return {"errorMsg": "Receipt Amount cannot be greater than due amount"}

            if float(converted_data["kasar"]) < float(0) or float(
                converted_data["tds"]
            ) < float(0):
                return {"errorMsg": "Negative Amount is not acceptable"}

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
            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            entry_no = data["entry_no"]
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            if PaymentReceiptMaster.checkEntryNo(
                entry_no, financial_year, location, site
            ):
                return Response({"errorMsg": "Data Already exists"}, status=200)

            payment_receipt_type = data["payment_receipt_type"]
            entry_type = data["entry_type"]
            transaction = data["transaction"]

            entry_date = datetime.datetime.strptime(
                data["entry_date"], "%Y-%m-%d"
            ).date()
            if not len(data["creditor"]) == 0:
                creditor = CreditorMaster.objects.get(
                    name=data["creditor"],
                    location__name=data["location"],
                    site__name=data["site"],
                )
            else:
                creditor = None

            if not len(data["customer"]) == 0:
                customer = CustomerMaster.objects.get(
                    name=data["customer"],
                    location__name=data["location"],
                    site__name=data["site"],
                )
            else:
                customer = None

            truck_no = data["truck_no"]
            extra_charges = data["extra_charges"]
            pay_remarks = data["pay_remarks"]
            narration = data["narration"]

            kasar = float(0)
            if data["kasar"] is not None:
                kasar = float(data["kasar"])
            tds = float(0)
            if data["tds"] is not None:
                tds = float(data["tds"])

            if float(tds) < float(0) or float(kasar) < float(0):
                return Response(
                    {"errorMsg": "Negative Amount is not acceptable"}, status=200
                )

            receipt_amount = float(0)
            if data["receipt_amount"] is not None:
                receipt_amount = float(data["receipt_amount"])

            total_amount = float(0)
            if data["total_amount"] is not None:
                total_amount = float(data["total_amount"])

            total_amount = float(receipt_amount + kasar + tds)

            validated_lines = None
            if len(data["transaction_from"]) == 0:
                transaction_from = AccountMaster.objects.get(
                    account_type="CASH_ON_HAND",
                    location__name=data["location"],
                    site__name=data["site"],
                )
            else:
                transaction_from = AccountMaster.objects.get(
                    name=data["transaction_from"],
                    account_type="BANK",
                    location__name=data["location"],
                    site__name=data["site"],
                )

            if entry_type == "Billwise":
                if not len(data["line"]) == 0:
                    validated_lines = [
                        self.validate_payment_receipt_line_data(
                            data=line, location=location, site=site
                        )
                        for line in data["line"]
                    ]

                for each in validated_lines:
                    if "errorMsg" in each.keys():
                        return Response(each, status=200)

                payment_receipt_obj = PaymentReceiptMaster.create(
                    payment_receipt_type=payment_receipt_type,
                    entry_type=entry_type,
                    transaction=transaction,
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=entry_date,
                    customer=customer,
                    creditor=creditor,
                    truck_no=truck_no,
                    extra_charges=extra_charges,
                    narration=narration,
                    pay_remarks=pay_remarks,
                    receipt_amount=receipt_amount,
                    kasar=kasar,
                    tds=tds,
                    total_amount=total_amount,
                    transaction_from=transaction_from,
                    booking_id=None,
                    location=location,
                    site=site,
                )
                payment_receipt_obj.save()

                if creditor is not None:
                    # For Transporter
                    for line in validated_lines:
                        purchase_bill = PurchaseMaster.objects.get(pk=line["pk"])
                        due_amount_line = float(line["due_bill_amount"])
                        kasar_line = float(0)
                        tds_line = float(0)
                        if line["kasar"] is not None:
                            kasar_line = float(line["kasar"])
                        if data["tds"] is not None:
                            tds_line = float(line["tds"])
                        receipt_amount_line = float(line["receipt_amount"])

                        if not due_amount_line == receipt_amount_line:
                            purchase_bill.due_bill_amount = (
                                float(purchase_bill.due_bill_amount)
                                - receipt_amount_line
                            )
                            purchase_bill.save()
                            if purchase_bill.due_bill_amount == float(0):
                                purchase_bill.is_purchase_completed = True
                                purchase_bill.save()
                        else:
                            purchase_bill.is_purchase_completed = True
                            purchase_bill.due_bill_amount = (
                                float(purchase_bill.due_bill_amount)
                                - receipt_amount_line
                            )
                            purchase_bill.save()

                        payment_receipt_line = PaymentReceiptLine.create(
                            parent=payment_receipt_obj,
                            purchase_bill=purchase_bill,
                            invoice_bill=None,
                            due_amount=due_amount_line - receipt_amount_line,
                            receipt_amount=receipt_amount_line,
                            kasar=kasar_line,
                            tds=tds_line,
                        )
                        payment_receipt_line.save()
                        purchase_bill.is_transaction_effected = True
                        purchase_bill.save()

                    logs = TransactionLog.create(
                        created_at=created_at,
                        date=entry_date,
                        vch_no=entry_no,
                        vch_type="PAYMENT",
                        particular=None,
                        creditor=creditor,
                        customer=None,
                        effect_on=transaction_from,
                        transaction_type="Debit",
                        transaction_method=payment_receipt_type,
                        booking_id=None,
                        invoice_id=None,
                        payment_receipt_id=payment_receipt_obj.pk,
                        contra_id=None,
                        journal_id=None,
                        amount=total_amount,
                        location=location,
                        site=site,
                    )
                    logs.save()
                    transaction_from.total_balance = (
                        float(transaction_from.total_balance) - total_amount
                    )
                    transaction_from.save()

                if customer is not None:
                    # For Customer
                    for line in validated_lines:
                        invoice_bill = InvoiceBill.objects.get(pk=line["pk"])
                        due_amount_line = float(line["due_bill_amount"])
                        kasar_line = float(0)
                        tds_line = float(0)
                        if line["kasar"] is not None:
                            kasar_line = float(line["kasar"])
                        if data["tds"] is not None:
                            tds_line = float(line["tds"])
                        receipt_amount_line = float(line["receipt_amount"])

                        if not due_amount_line == receipt_amount_line:
                            invoice_bill.due_total_amount = (
                                float(invoice_bill.due_total_amount)
                                - receipt_amount_line
                            )
                            invoice_bill.save()
                            if invoice_bill.due_total_amount == float(0):
                                invoice_bill.is_invoice_completed = True
                                invoice_bill.save()
                        else:
                            invoice_bill.is_invoice_completed = True
                            invoice_bill.due_total_amount = (
                                float(invoice_bill.due_total_amount)
                                - receipt_amount_line
                            )
                            invoice_bill.save()

                        payment_receipt_line = PaymentReceiptLine.create(
                            parent=payment_receipt_obj,
                            purchase_bill=None,
                            invoice_bill=invoice_bill,
                            due_amount=due_amount_line - receipt_amount_line,
                            receipt_amount=receipt_amount_line,
                            kasar=kasar_line,
                            tds=tds_line,
                        )
                        payment_receipt_line.save()
                        invoice_bill.is_transaction_effected = True
                        invoice_bill.save()

                    logs = TransactionLog.create(
                        created_at=created_at,
                        date=entry_date,
                        vch_no=entry_no,
                        vch_type="RECEIPT",
                        particular=None,
                        creditor=None,
                        customer=customer,
                        effect_on=transaction_from,
                        transaction_type="Credit",
                        transaction_method=payment_receipt_type,
                        booking_id=None,
                        invoice_id=None,
                        payment_receipt_id=payment_receipt_obj.pk,
                        contra_id=None,
                        journal_id=None,
                        amount=total_amount,
                        location=location,
                        site=site,
                    )
                    logs.save()
                    transaction_from.total_balance = (
                        float(transaction_from.total_balance) + total_amount
                    )
                    transaction_from.save()

            else:

                payment_receipt_obj = PaymentReceiptMaster.create(
                    payment_receipt_type=payment_receipt_type,
                    entry_type=entry_type,
                    transaction=transaction,
                    entry_no=entry_no,
                    financial_year=financial_year,
                    entry_date=entry_date,
                    customer=customer,
                    creditor=creditor,
                    truck_no=truck_no,
                    extra_charges=extra_charges,
                    narration=narration,
                    pay_remarks=pay_remarks,
                    receipt_amount=receipt_amount,
                    kasar=kasar,
                    tds=tds,
                    total_amount=total_amount,
                    transaction_from=transaction_from,
                    booking_id=None,
                    location=location,
                    site=site,
                )
                payment_receipt_obj.save()

                if creditor is not None:
                    logs = TransactionLog.create(
                        created_at=created_at,
                        date=entry_date,
                        vch_no=entry_no,
                        vch_type="PAYMENT",
                        particular=None,
                        creditor=creditor,
                        customer=None,
                        effect_on=transaction_from,
                        transaction_type="Debit",
                        transaction_method=payment_receipt_type,
                        booking_id=None,
                        invoice_id=None,
                        payment_receipt_id=payment_receipt_obj.pk,
                        contra_id=None,
                        journal_id=None,
                        amount=total_amount,
                        location=location,
                        site=site,
                    )
                    logs.save()
                    transaction_from.total_balance = (
                        float(transaction_from.total_balance) - total_amount
                    )
                    transaction_from.save()

                if customer is not None:
                    logs = TransactionLog.create(
                        created_at=created_at,
                        date=entry_date,
                        vch_no=entry_no,
                        vch_type="RECEIPT",
                        particular=None,
                        creditor=None,
                        customer=customer,
                        effect_on=transaction_from,
                        transaction_type="Credit",
                        transaction_method=payment_receipt_type,
                        booking_id=None,
                        invoice_id=None,
                        payment_receipt_id=payment_receipt_obj.pk,
                        contra_id=None,
                        journal_id=None,
                        amount=total_amount,
                        location=location,
                        site=site,
                    )
                    logs.save()
                    transaction_from.total_balance = (
                        float(transaction_from.total_balance) + total_amount
                    )
                    transaction_from.save()

            return Response(
                {"successMsg": "Data Saved", "pk": payment_receipt_obj.pk}, status=200
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllPaymentReceiptMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            customer = data["customer"]
            creditor = data["creditor"]
            transaction_type = data["transaction_type"]
            from_date = data["from_date"]
            to_date = data["to_date"]

            if location == "ALL":
                filtered_data = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                )
            elif site == "ALL":
                filtered_data = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if not len(customer) == 0:
                filtered_data = filtered_data.filter(customer__name=customer)

            if not len(creditor) == 0:
                filtered_data = filtered_data.filter(creditor__name=creditor)

            if not len(transaction_type) == 0:
                filtered_data = filtered_data.filter(
                    payment_receipt_type=transaction_type
                )

            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(
                    entry_date__range=(from_date, to_date)
                )

            response_data = [each.get_payment_receipt() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class GetPaymentRecieptData(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            customer = data["customer"]
            transporter = data["transporter"]
            if not len(customer) == 0:
                invoice_obj = InvoiceBill.objects.select_related(
                    "location", "site"
                ).filter(
                    customer__name=customer,
                    location__name=data["location"],
                    site__name=data["site"],
                    is_invoice_completed=False,
                )
                response_data = [
                    each.invoice_payment_receipt_data() for each in invoice_obj
                ]

            if not len(transporter) == 0:
                purchase_obj = PurchaseMaster.objects.select_related(
                    "location", "site"
                ).filter(
                    transporter__name=transporter,
                    location__name=data["location"],
                    site__name=data["site"],
                    is_purchase_completed=False,
                )
                response_data = [
                    each.purchase_payment_receipt_data() for each in purchase_obj
                ]

            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class GetPaymentReceiptMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):

        try:
            payment_reciept = PaymentReceiptMaster.objects.get(pk=pk)
            data = payment_reciept.get_payment_receipt()
            line = [
                {
                    "pk": str(each.pk),
                    "against_bill": each.purchase_bill.entry_no
                    if each.purchase_bill is not None
                    else each.invoice_bill.bill_no,
                    "ref_date": each.purchase_bill.entry_date
                    if each.purchase_bill is not None
                    else each.invoice_bill.bill_date,
                    "original_bill_amount": str(each.purchase_bill.bill_amount)
                    if each.purchase_bill is not None
                    else str(each.invoice_bill.total_amount),
                    "due_bill_amount": str(each.due_amount),
                    "kasar": str(each.kasar),
                    "tds": str(each.tds),
                    "receipt_amount": str(each.receipt_amount),
                }
                for each in PaymentReceiptLine.objects.filter(parent=payment_reciept)
            ]
            data["line"] = line

            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeletePaymentReceiptMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            parent = PaymentReceiptMaster.objects.get(pk=pk)
            account = parent.transaction_from
            if parent.entry_type == "Normal":
                account.total_balance = float(account.total_balance) + float(
                    parent.total_amount
                )
                account.save()
            else:
                main_child = PaymentReceiptLine.objects.select_related(
                    "parent", "purchase_bill", "invoice_bill", "parent__location", "parent__site"
                ).filter(parent__location=parent.location, parent__site=parent.site)
                child = main_child.filter(parent=parent)

                if parent.transaction == "Payment":
                    for each in child:
                        purchase = each.purchase_bill
                        purchase.due_bill_amount = float(
                            purchase.due_bill_amount
                        ) + float(each.receipt_amount)
                        if not main_child.filter(purchase_bill=purchase).count() > 1:
                            purchase.is_transaction_effected = False
                            purchase.save()
                        purchase.is_purchase_completed = False
                        purchase.save()
                    account.total_balance = float(account.total_balance) + float(
                        parent.total_amount
                    )
                    account.save()

                elif parent.transaction == "Receipt":
                    for each in child:
                        each.invoice_bill.due_total_amount = float(
                            each.invoice_bill.due_total_amount
                        ) + float(each.receipt_amount)
                        each.invoice_bill.is_invoice_completed = False
                        each.invoice_bill.save()
                    account.total_balance = float(account.total_balance) - float(
                        parent.total_amount
                    )
                    account.save()

            delete_logs = TransactionLog.objects.filter(payment_receipt_id=parent.pk)
            if delete_logs.exists():
                delete_logs.delete()
            parent.delete()

            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DownloadPaymentReceipt(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def none_to_empty_str(self, items):
        return {each: "" if items[each] is None else items[each] for each in items}

    def get(self, request, pk, *args, **kwargs):

        try:
            payment_receipt = PaymentReceiptMaster.objects.get(pk=pk)
            context = {}
            context["comapny_name"] = payment_receipt.location.company_name
            context["company_address"] = payment_receipt.location.company_address
            if payment_receipt.creditor is not None:
                context["name"] = payment_receipt.creditor.name
            elif payment_receipt.customer is not None:
                context["name"] = payment_receipt.customer.name
            context["truck_no"] = payment_receipt.truck_no
            context["voucher_no"] = payment_receipt.entry_no
            context["date"] = payment_receipt.entry_date
            context["narration"] = payment_receipt.narration
            context["extra_charges"] = payment_receipt.extra_charges
            context["receipt_amount"] = str(payment_receipt.receipt_amount)
            context["kasar"] = str(payment_receipt.kasar)
            context["tds"] = str(payment_receipt.tds)
            context["total_amount"] = str(payment_receipt.total_amount)

            return Response(self.none_to_empty_str(items=context), status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
