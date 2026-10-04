# other imports
import datetime, fiscalyear
from django.utils import timezone
import traceback, logging, datetime
from django.db.models import Sum
import re

# model imports
from .models import (
    BookingMaster,
    PurchaseMaster,
    BookingBill,
    PaymentReceiptLine,
    InvoiceBill,
    TransactionLog,
)


def has_numbers(inputString):
    return any(char.isdigit() for char in inputString)


def get_fiscal_year_date():
    fiscalyear.START_MONTH = 4
    cur_y = fiscalyear.FiscalYear(
        datetime.datetime.now().astimezone(timezone.get_current_timezone()).year + 1
    )
    start_date = cur_y.start.date()
    end_date = cur_y.end.date()
    return start_date, end_date


def user_data(location, site):
    try:
        data = {
            "company_name": location.company_name.upper(),
            # "company_name": site.organization.upper(),
            "company_address": site.address,
            "location": location.name.upper(),
            "site": site.name.upper(),
        }
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def creditor_row_data(data_object):
    try:
        data = {}
        general_data = data_object.get_booking_data()["general_data"]
        transportation_data = data_object.get_booking_data()["transportation_data"]
        charges = data_object.get_booking_data()["charges"]
        data["lr_no"] = general_data["lr_no"]
        data["l_date"] = general_data["l_date"]
        data["destination"] = general_data["destination"]
        data["truck_no"] = transportation_data["truck_no"]
        data["container_no"] = transportation_data["container_no"]
        data["tr_freight"] = charges["tr_freight"]
        data["advance"] = charges["advance"]
        data["diesel_cost"] = charges["diesel_cost"]
        data["detention_charges"] = charges["detention_charges"]
        data["balance"] = charges["balance"]

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def creditor_data_object_list(from_date, to_date, creditor, location, site):
    try:
        booking_data_list = list(
            BookingMaster.objects.select_related(
                "location",
                "site",
                "transporter",
            )
            .filter(
                l_date__range=(from_date, to_date),
                is_purchased=False,
                is_proceed=True,
                transporter=creditor,
                transporter__category="Transporter",
                location=location,
                site=site,
            )
            .order_by("l_date")
        )
        return booking_data_list

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def creditor_main_data(
    data_object_list,
):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = creditor_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        lr_no = [each.get("lr_no") for each in data]
        l_date = [each.get("l_date") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        container_no = [each.get("container_no") for each in data]
        destination = [each.get("destination") for each in data]
        tr_freight = [each.get("tr_freight") for each in data]
        advance = [each.get("advance") for each in data]
        diesel = [each.get("diesel_cost") for each in data]
        detention_charges = [each.get("detention_charges") for each in data]
        balance = [each.get("balance") for each in data]
        df_data = [
            [
                sl_no[i],
                lr_no[i],
                l_date[i],
                truck_no[i],
                container_no[i],
                destination[i],
                tr_freight[i],
                advance[i],
                diesel[i],
                detention_charges[i],
                balance[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 11)])

        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 11)]]
        return df_data


def get_creditor_against_bill_data_object_list(
    from_date,
    to_date,
    creditor,
    location,
    site,
    balance=False,
):
    try:
        purchase_raw_data = PurchaseMaster.objects.select_related(
            "location",
            "site",
            "transporter",
        ).filter(
            location=location,
            site=site,
            transporter=creditor,
        )
        if balance:
            purchase_raw_data = purchase_raw_data.filter(is_purchase_completed=False)
        else:
            purchase_raw_data = purchase_raw_data.filter(
                entry_date__range=(from_date, to_date)
            )
        return purchase_raw_data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_creditor_against_bill_raw_data(data_object):
    try:
        data = {}
        receipt_amount = 0
        kasar = 0
        tds = 0
        if data_object.is_transaction_effected:
            payment = PaymentReceiptLine.objects.filter(purchase_bill=data_object)
            receipt_amount_raw = payment.aggregate(Sum("receipt_amount"))
            receipt_amount = receipt_amount_raw["receipt_amount__sum"]
            kasar_raw = payment.aggregate(Sum("kasar"))
            kasar = kasar_raw["kasar__sum"]
            tds_raw = payment.aggregate(Sum("tds"))
            tds = tds_raw["tds__sum"]
        data["entry_no"] = data_object.entry_no
        data["entry_date"] = data_object.entry_date.strftime("%d/%m/%Y")
        data["bill_amount"] = round(float(data_object.bill_amount), 2)
        data["receipt_amount"] = round(float(receipt_amount), 2)
        data["kasar"] = round(float(kasar), 2)
        data["tds"] = round(float(tds), 2)
        data["due_bill_amount"] = round(float(data_object.due_bill_amount), 2)

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_creditor_against_bill_main_data(
    data_object_list,
):
    try:
        data = []
        count = 0
        for obj in data_object_list:
            count += 1
            each_data = get_creditor_against_bill_raw_data(data_object=obj)
            each_data["sl_no"] = count
            data.append(each_data)

        sl_no = [each.get("sl_no") for each in data]
        entry_no = [each.get("entry_no") for each in data]
        entry_date = [each.get("entry_date") for each in data]
        bill_amount = [each.get("bill_amount") for each in data]
        receipt_amount = [each.get("receipt_amount") for each in data]
        kasar = [each.get("kasar") for each in data]
        tds = [each.get("tds") for each in data]
        due_bill_amount = [each.get("due_bill_amount") for each in data]

        total_amount_sum = 0
        if not len(bill_amount) == 0:
            total_amount_sum = sum(bill_amount)

        receipt_amount_sum = 0
        if not len(receipt_amount) == 0:
            receipt_amount_sum = sum(receipt_amount)

        kasar_sum = 0
        if not len(kasar) == 0:
            kasar_sum = sum(kasar)

        tds_sum = 0
        if not len(tds) == 0:
            tds_sum = sum(tds)

        due_amount_sum = 0
        if not len(tds) == 0:
            due_amount_sum = sum(due_bill_amount)

        sl_no.append("")
        entry_no.append("")
        entry_date.append("")
        bill_amount.append("")
        receipt_amount.append("")
        kasar.append("")
        tds.append("")
        due_bill_amount.append("")

        sl_no.append("")
        entry_no.append("TOTAL")
        entry_date.append("")
        bill_amount.append(total_amount_sum)
        receipt_amount.append(receipt_amount_sum)
        kasar.append(kasar_sum)
        tds.append(tds_sum)
        due_bill_amount.append(due_amount_sum)

        df_data = [
            [
                sl_no[i],
                entry_no[i],
                entry_date[i],
                bill_amount[i],
                receipt_amount[i],
                kasar[i],
                tds[i],
                due_bill_amount[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 9)])
        return df_data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 9)]]
        return df_data


def booking_row_data(data_object):
    try:
        data = {}
        booking_data = data_object.get_booking_data()
        general_data = booking_data["general_data"]
        transportation_data = booking_data["transportation_data"]
        bill_party = BookingBill.objects.get(booking=data_object)
        charges = booking_data["charges"]
        data["lr_no"] = general_data["lr_no"]
        data["l_date"] = general_data["l_date"]
        data["destination"] = general_data["destination"]
        data["truck_no"] = transportation_data["truck_no"]
        data["transporter"] = transportation_data["transporter"]
        data["container_no"] = transportation_data["container_no"]
        data["tr_freight"] = charges["tr_freight"]
        data["advance"] = charges["advance"]
        data["diesel_cost"] = charges["diesel_cost"]
        data["detention_charges"] = charges["detention_charges"]
        data["balance"] = charges["balance"]
        data["bill_party"] = bill_party.booking.bill_party.name

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def booking_data_object_list(from_date, to_date, location, site):
    try:
        booking_data_list = list(
            BookingMaster.objects.select_related(
                "location",
                "site",
            )
            .filter(
                l_date__range=(from_date, to_date),
                is_proceed=True,
                location=location,
                site=site,
            )
            .order_by("l_date")
        )
        return booking_data_list

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def booking_main_data(
    data_object_list,
):
    try:
        count = 0
        data = []
        for each in data_object_list:
            count += 1
            each_data = booking_row_data(each)
            each_data["sl_no"] = count
            data.append(each_data)
        sl_no = [each.get("sl_no") for each in data]
        lr_no = [each.get("lr_no") for each in data]
        l_date = [each.get("l_date") for each in data]
        truck_no = [each.get("truck_no") for each in data]
        transporter = [each.get("transporter") for each in data]
        container_no = [each.get("container_no") for each in data]
        destination = [each.get("destination") for each in data]
        bill_party = [each.get("bill_party") for each in data]
        tr_freight = [each.get("tr_freight") for each in data]
        advance = [each.get("advance") for each in data]
        diesel = [each.get("diesel_cost") for each in data]
        detention_charges = [each.get("detention_charges") for each in data]
        balance = [each.get("balance") for each in data]
        df_data = [
            [
                sl_no[i],
                lr_no[i],
                l_date[i],
                truck_no[i],
                transporter[i],
                container_no[i],
                destination[i],
                bill_party[i],
                tr_freight[i],
                advance[i],
                diesel[i],
                detention_charges[i],
                balance[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 13)])

        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 13)]]
        return df_data


def get_customer_against_bill_data_object_list(
    from_date,
    to_date,
    customer,
    location,
    site,
    balance=False,
):
    try:
        invoice_raw_data = InvoiceBill.objects.select_related(
            "location",
            "site",
            "customer",
        ).filter(
            location=location,
            site=site,
            customer=customer,
        )
        if balance:
            invoice_raw_data = invoice_raw_data.filter(is_invoice_completed=False)
        else:
            invoice_raw_data = invoice_raw_data.filter(
                bill_date__range=(from_date, to_date)
            )
        return invoice_raw_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_customer_against_bill_raw_data(data_object):
    try:
        data = {}
        receipt_amount = 0
        kasar = 0
        tds = 0
        if data_object.is_transaction_effected:
            payment = PaymentReceiptLine.objects.filter(invoice_bill=data_object)
            receipt_amount_raw = payment.aggregate(Sum("receipt_amount"))
            receipt_amount = receipt_amount_raw["receipt_amount__sum"]
            kasar_raw = payment.aggregate(Sum("kasar"))
            kasar = kasar_raw["kasar__sum"]
            tds_raw = payment.aggregate(Sum("tds"))
            tds = tds_raw["tds__sum"]
        data["bill_no"] = data_object.bill_no
        data["bill_date"] = data_object.bill_date.strftime("%d/%m/%Y")
        data["total_amount"] = round(float(data_object.total_amount), 2)
        data["receipt_amount"] = round(float(receipt_amount), 2)
        data["kasar"] = round(float(kasar), 2)
        data["tds"] = round(float(tds), 2)
        data["due_amount"] = round(float(data_object.due_total_amount), 2)
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_customer_against_bill_main_data(data_object_list):
    try:
        data = []
        count = 0
        for obj in data_object_list:
            count += 1
            each_data = get_customer_against_bill_raw_data(data_object=obj)
            each_data["sl_no"] = count
            data.append(each_data)

        sl_no = [each.get("sl_no") for each in data]
        bill_no = [each.get("bill_no") for each in data]
        bill_date = [each.get("bill_date") for each in data]
        total_amount = [each.get("total_amount") for each in data]
        receipt_amount = [each.get("receipt_amount") for each in data]
        kasar = [each.get("kasar") for each in data]
        tds = [each.get("tds") for each in data]
        due_amount = [each.get("due_amount") for each in data]

        total_amount_sum = 0
        if not len(total_amount) == 0:
            total_amount_sum = sum(total_amount)

        receipt_amount_sum = 0
        if not len(receipt_amount) == 0:
            receipt_amount_sum = sum(receipt_amount)

        kasar_sum = 0
        if not len(kasar) == 0:
            kasar_sum = sum(kasar)

        tds_sum = 0
        if not len(tds) == 0:
            tds_sum = sum(tds)

        due_amount_sum = 0
        if not len(tds) == 0:
            due_amount_sum = sum(due_amount)

        sl_no.append("")
        bill_no.append("")
        bill_date.append("")
        total_amount.append("")
        receipt_amount.append("")
        kasar.append("")
        tds.append("")
        due_amount.append("")

        sl_no.append("")
        bill_no.append("TOTAL")
        bill_date.append("")
        total_amount.append(total_amount_sum)
        receipt_amount.append(receipt_amount_sum)
        kasar.append(kasar_sum)
        tds.append(tds_sum)
        due_amount.append(due_amount_sum)

        df_data = [
            [
                sl_no[i],
                bill_no[i],
                bill_date[i],
                total_amount[i],
                receipt_amount[i],
                kasar[i],
                tds[i],
                due_amount[i],
            ]
            for i in range(len(sl_no))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 9)])
        return df_data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 9)]]
        return df_data


def get_ledger_data_object_list(
    from_date,
    to_date,
    location,
    site,
    customer=None,
    creditor=None,
    account=None,
):
    try:
        query = TransactionLog.objects.select_related(
            "location", "site", "customer", "creditor", "effect_on"
        ).filter(
            location=location,
            site=site,
        )

        if customer is not None:
            query = query.filter(customer=customer)
        if creditor is not None:
            query = query.filter(creditor=creditor)
        if account is not None:
            query = query.filter(effect_on=account)

        ledger_object_list = query.filter(date__range=(from_date, to_date))
        opening_balance_object_list = query.filter(date__lt=from_date)
        return opening_balance_object_list, ledger_object_list
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_ledger_main_data(
    from_date, opening_balance_object_list, ledger_object_list, ledger_type
):
    try:
        total_opening_credit_amount = 0
        total_opening_debit_amount = 0

        total_opening_credit_query = opening_balance_object_list.filter(
            transaction_type="Credit"
        )
        total_opening_credit_dict = total_opening_credit_query.aggregate(Sum("amount"))
        if total_opening_credit_dict["amount__sum"] is not None:
            total_opening_credit_amount = total_opening_credit_dict["amount__sum"]

        total_opening_debit_query = opening_balance_object_list.filter(
            transaction_type="Debit"
        )
        total_opening_debit_dict = total_opening_debit_query.aggregate(Sum("amount"))
        if total_opening_debit_dict["amount__sum"] is not None:
            total_opening_debit_amount = total_opening_debit_dict["amount__sum"]

        outstanding_amount = round(
            float(total_opening_credit_amount) - float(total_opening_debit_amount), 2
        )
        if ledger_type == "Customer Ledger":
            outstanding_amount = round(
                float(total_opening_debit_amount) - float(total_opening_credit_amount),
                2,
            )

        credit_list = []
        debit_list = []

        date_list = [
            from_date.strftime("%d/%m/%Y"),
        ]
        vch_no_list = [
            "",
        ]
        vch_type_list = [
            "",
        ]
        particular_list = [
            "Opening Balance",
        ]
        credit_amount_list = [
            "",
        ]
        debit_amount_list = [
            "",
        ]
        outstanding_amount_list = [
            outstanding_amount,
        ]

        for each in ledger_object_list:
            credit_amount = 0
            debit_amount = 0
            date = each.date.strftime("%d/%m/%Y")
            vch_no = each.vch_no
            vch_type = each.vch_type
            particular = each.particular

            if each.transaction_type == "Credit":
                credit_amount = round(float(each.amount), 2)
                if ledger_type == "Customer Ledger":
                    outstanding_amount = round(
                        float(outstanding_amount) - float(each.amount), 2
                    )
                else:
                    outstanding_amount = round(
                        float(outstanding_amount) + float(each.amount), 2
                    )
            else:
                debit_amount = round(float(each.amount), 2)
                if ledger_type == "Customer Ledger":
                    outstanding_amount = round(
                        float(outstanding_amount) + float(each.amount), 2
                    )
                else:
                    outstanding_amount = round(
                        float(outstanding_amount) - float(each.amount), 2
                    )

            date_list.append(date)
            vch_no_list.append(vch_no)
            vch_type_list.append(vch_type)
            particular_list.append(particular)
            debit_amount_list.append(debit_amount)
            debit_list.append(debit_amount)
            credit_amount_list.append(credit_amount)
            credit_list.append(credit_amount)
            outstanding_amount_list.append(outstanding_amount)

        total_credit = round(sum(credit_list), 2)
        total_debit = round(sum(debit_list), 2)
        final_credit = 0
        final_debit = 0
        final_credit_outstanding = 0
        final_debit_outstanding = 0

        if ledger_type == "Customer Ledger":
            final_credit = round(float(total_credit) + float(outstanding_amount), 2)
            final_credit_outstanding = outstanding_amount
            final_debit = total_debit
        else:
            final_debit = round(float(total_debit) + float(outstanding_amount), 2)
            final_debit_outstanding = outstanding_amount
            final_credit = total_credit

        date_list.append("")
        vch_no_list.append("")
        vch_type_list.append("")
        particular_list.append("")
        debit_amount_list.append("")
        credit_amount_list.append("")
        outstanding_amount_list.append("")

        date_list.append("")
        vch_no_list.append("")
        vch_type_list.append("")
        particular_list.append("")
        debit_amount_list.append(total_debit)
        credit_amount_list.append(total_credit)
        outstanding_amount_list.append("")

        date_list.append("")
        vch_no_list.append("")
        vch_type_list.append("")
        particular_list.append("Closing Balance")
        debit_amount_list.append(final_debit_outstanding)
        credit_amount_list.append(final_credit_outstanding)
        outstanding_amount_list.append("")

        date_list.append("")
        vch_no_list.append("")
        vch_type_list.append("")
        particular_list.append("")
        debit_amount_list.append("")
        credit_amount_list.append("")
        outstanding_amount_list.append("")

        date_list.append("")
        vch_no_list.append("")
        vch_type_list.append("")
        particular_list.append("")
        debit_amount_list.append(final_debit)
        credit_amount_list.append(final_credit)
        outstanding_amount_list.append("")

        df_data = [
            [
                date_list[i],
                vch_no_list[i],
                vch_type_list[i],
                particular_list[i],
                debit_amount_list[i],
                credit_amount_list[i],
                outstanding_amount_list[i],
            ]
            for i in range(len(date_list))
        ]
        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 8)])
        return df_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 8)]]
        return df_data


def check_num_or_special_char(string):
    pattern = r'[0-9!@#$%^&*(),.?":{}|<>]'
    return bool(re.search(pattern, string))


def validate_email(data):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, data))


def check_alphabets(data):
    return bool(re.match(r"^[0-9].+$", data))
