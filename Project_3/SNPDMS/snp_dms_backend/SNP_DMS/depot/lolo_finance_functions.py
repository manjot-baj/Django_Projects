import datetime, openpyxl, logging, traceback
from master.models_two import Client
from master.models import ContainerType, ContainerSize
from depot.functions_two import *
from depot.models import Container
from depot.lolo_finance_models import (
    AdvancedHandlingPayment,
    PreGateIn,
    PreGateOut,
    CustomerFinAccount,
    FinAccountTransaction,
)
from django.utils import timezone


def extract_pre_gate_in_excel_data(input_excel, location, site, adv_payment_id):
    try:
        # Load workbook and sheet
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["pre_gatein"]

        headers = [
            "client",
            "container_no",
            "type",
            "size",
            "arrived",
            "consignee",
            "shipper",
            "cargo",
            "remarks",
        ]

        # Extract raw data and clean it
        raw_data = {
            header: [
                sheet[f"{chr(65 + i)}{row}"].value
                for row in range(2, sheet.max_row + 1)
            ]
            for i, header in enumerate(headers)
        }

        # Clean None values from the data
        cleaned_data = {
            key: [val for val in values if val is not None]
            for key, values in raw_data.items()
        }

        # Extract and structure data
        extracted_data_list = [
            {
                "sr_no": str(i + 1),
                "client": str(cleaned_data["client"][i]),
                "container_no": str(cleaned_data["container_no"][i]),
                "type": str(cleaned_data["type"][i]),
                "size": str(cleaned_data["size"][i]),
                "arrived": str(cleaned_data["arrived"][i]),
                "consignee": str(cleaned_data["consignee"][i]),
                "shipper": str(cleaned_data["shipper"][i]),
                "cargo": str(cleaned_data["cargo"][i]),
                "remarks": str(cleaned_data["remarks"][i]),
            }
            for i in range(len(cleaned_data["client"]))
        ]

        # Initialize error handling containers
        error_data, error_data_msg, correct_data = [], {}, []
        correct_20_data, correct_40_data = [], []

        # Validate each extracted data row
        for each in extracted_data_list:
            error_msg = []
            row_number = f"row {str(int(each['sr_no']) + 1)}"
            client_name = each["client"]

            #   Client
            if not Client.objects.filter(
                name=client_name, type="Line", location=location, site=site
            ).exists():
                error_msg.append(f"In {row_number} client not found in system database")

            # Container number validation
            container_no_str = each["container_no"]
            if len(container_no_str) != 11 or not check_char_digit(container_no_str):
                error_msg.append(f"In {row_number} container_no is invalid")
            elif (
                Container.objects.filter(
                    container_no=container_no_str, status="IN", location=location
                ).exists()
                or PreGateIn.objects.filter(
                    location=location,
                    container_no=container_no_str,
                    is_gatein_done=False,
                ).exists()
            ):
                error_msg.append(
                    f"In {row_number} Container_no already exists in system with status 'IN' or in PreGateIn !!!"
                )
            elif any(
                container_no_str == obj_data["container_no"]
                for obj_data in correct_data
            ):
                error_msg.append(f"In {row_number} container_no is repeated")
            else:
                pass

            #   Type
            if not ContainerType.objects.filter(name=each["type"]).exists():
                error_msg.append(f"In {row_number} type not found in system database")

            #   Size
            if not ContainerSize.objects.filter(
                name=str(int(float(each["size"])))
            ).exists():
                error_msg.append(f"In {row_number} size not found in system database")

            arrived_str = each["arrived"]
            arrived_list = [
                "Factory",
                "CFS/ICD",
                "FS RETURN",
            ]
            if not arrived_str in arrived_list:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in arrived column,"
                    f"arrived provided is not correct, should be among these (Factory,"
                    f"CFS/ICD, FS RETURN)"
                )

            # Optional fields cleanup
            for field in [
                "consignee",
                "shipper",
                "cargo",
                "remarks",
            ]:
                each[field] = "" if each[field] == "_" else each[field]

            # Append errors or correct data
            error_data_msg[row_number] = error_msg
            if error_msg:
                error_data.append(each)
            else:
                correct_data.append(each)
                (correct_20_data if each["size"] == "20" else correct_40_data).append(
                    each
                )

        # Check payment eligibility
        remarks = None
        if correct_data:
            payment = AdvancedHandlingPayment.objects.get(pk=adv_payment_id)

            correct_20_data_count, correct_40_data_count = len(correct_20_data), len(
                correct_40_data
            )
            size_20_total_amount = get_total_site_lolo_amount(
                size="20",
                count=correct_20_data_count,
                payment_data=payment,
                with_gst=payment.with_gst,
            )
            size_40_total_amount = get_total_site_lolo_amount(
                size="40",
                count=correct_40_data_count,
                payment_data=payment,
                with_gst=payment.with_gst,
            )
            total_count, total_amount = (
                correct_20_data_count + correct_40_data_count,
                size_20_total_amount + size_40_total_amount,
            )
            approved_count = len(correct_data)

            if (
                not payment.remaining >= total_count
                or not payment.remaining_amount >= total_amount
            ):
                error_data.extend(correct_data)
                correct_data.clear()
                remarks = f"Approved data count is {approved_count} But, Advanced Payment Remaining or Amount is Not sufficient for Import"

        # Return final data
        return {
            "importable_data": correct_data,
            "importable_data_count": len(correct_data),
            "rejected_data": error_data,
            "rejected_data_count": len(error_data),
            "faults": error_data_msg,
            "remarks": remarks,
        }
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False


def get_total_site_lolo_amount(size, count, payment_data, with_gst=True):
    try:
        prefix = "size_20" if size == "20" else "size_40"
        unit_rate = float(getattr(payment_data, f"{prefix}_rate"))
        total_tds = float(getattr(payment_data, f"{prefix}_tds_amount"))
        total_qty = int(getattr(payment_data, f"{prefix}_quantity"))
        unit_tds = total_tds / total_qty if total_qty else 0
        tax = 0.18 if with_gst else 0
        tax_amt = float(unit_rate) * tax
        unit_rate_with_tax = round(float(unit_rate) + float(tax_amt))
        total_amount = (unit_rate_with_tax - unit_tds) * count
        total_amount = round(total_amount, 2)
        return total_amount
    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False


def give_ideal_advance_payment_obj(adv_payment_id, size):
    try:
        payment_data = AdvancedHandlingPayment.objects.get(pk=adv_payment_id)
        total_amount = get_total_site_lolo_amount(
            size=size,
            count=1,
            payment_data=payment_data,
            with_gst=payment_data.with_gst,
        )

        no_remaining_qty_data = None
        low_remaining_amount_data = None

        if int(payment_data.remaining) > 0:

            # -------------- Validation for Size Quantity --------------------------
            count_20 = 0
            count_40 = 0

            if PreGateIn.objects.filter(adv_payment_id=payment_data.pk).exists():
                count_20 = PreGateIn.objects.filter(
                    adv_payment_id=payment_data.pk, size__name="20"
                ).count()
                count_40 = PreGateIn.objects.filter(
                    adv_payment_id=payment_data.pk, size__name="40"
                ).count()

            if PreGateOut.objects.filter(adv_payment_id=payment_data.pk).exists():
                count_20 = PreGateOut.objects.filter(
                    adv_payment_id=payment_data.pk,
                    stock__container__size__name="20",
                ).count()
                count_40 = PreGateOut.objects.filter(
                    adv_payment_id=payment_data.pk,
                    stock__container__size__name="40",
                ).count()

            if size == "20" and int(payment_data.size_20_quantity) == int(count_20):
                return (
                    "No remaining size 20 quantity left for any of the AdvancedPayments"
                )

            if size == "40" and int(payment_data.size_40_quantity) == int(count_40):
                return (
                    "No remaining size 40 quantity left for any of the AdvancedPayments"
                )

            # ---------------------------------------

            if float(payment_data.remaining_amount) < float(total_amount):
                low_remaining_amount_data = payment_data
            else:
                return payment_data
        else:
            no_remaining_qty_data = payment_data

        def adjust_quantity_n_balance(payment_record):
            if float(payment_record.remaining_amount) > 0:
                payment_record.quantity = (
                    payment_record.quantity - payment_record.remaining
                )
                payment_record.remaining = 0
                payment_record.balance_amount = float(payment_record.remaining_amount)
                payment_record.remaining_amount = 0
                payment_record.is_adjusted = True
                payment_record.save()
            else:
                payment_record.quantity = (
                    payment_record.quantity - payment_record.remaining
                )
                payment_record.remaining = 0
                payment_record.is_adjusted = True
                payment_record.save()

        # No remaining quantity left in any payments
        if no_remaining_qty_data:
            adjust_quantity_n_balance(no_remaining_qty_data)
            return "No remaining quantity left for any of the AdvancedPayments"

        # Low remaining amount in some payments
        adjust_quantity_n_balance(low_remaining_amount_data)
        return "No remaining Amount left for any of the AdvancedPayments"

    except Exception as e:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return "Something went wrong with Advanced Payment"


def mark_expire_pre_gate():
    try:
        in_pregate_list = list(
            PreGateIn.objects.select_related().filter(validity_expired=False)
        )
        out_pregate_list = list(
            PreGateOut.objects.select_related().filter(validity_expired=False)
        )
        query_list = in_pregate_list + out_pregate_list
        for each in query_list:
            tz = timezone.get_current_timezone()
            now = datetime.datetime.now().astimezone(tz)
            try:
                do_date = datetime.datetime.combine(
                    each.do_validity_in_date, each.do_validity_in_time
                ).astimezone(tz)
            except:
                do_date = datetime.datetime.combine(
                    each.do_validity_out_date, each.do_validity_out_time
                ).astimezone(tz)

            if now > do_date:
                each.validity_expired = True
                each.on_hold = True
                each.save()
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_advanced_Payment_excel_data(input_excel, location, site):
    try:
        # Load workbook and sheet
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["advanced_payment"]
        headers = [
            "client",
            "entry_type",
            "bl_no",
            "bk_no",
            "payment_type",
            "cheque_no",
            "utr_no",
            "bank_name",
            "account_name",
            "account_no",
            "size_20_quantity",
            "size_40_quantity",
            "original_amount",
            "tds",
        ]

        # Extract raw data and clean it
        raw_data = {
            header: [
                sheet[f"{chr(65 + i)}{row}"].value
                for row in range(2, sheet.max_row + 1)
            ]
            for i, header in enumerate(headers)
        }

        # Clean None values from the data
        cleaned_data = {
            key: [val for val in values if val is not None]
            for key, values in raw_data.items()
        }

        # Extract and structure data
        extracted_data_list = [
            {
                "sr_no": str(i + 1),
                "client": str(cleaned_data["client"][i]),
                "entry_type": str(cleaned_data["entry_type"][i]),
                "bl_no": str(cleaned_data["bl_no"][i]),
                "bk_no": str(cleaned_data["bk_no"][i]),
                "payment_type": str(cleaned_data["payment_type"][i]),
                "cheque_no": str(cleaned_data["cheque_no"][i]),
                "utr_no": str(cleaned_data["utr_no"][i]),
                "bank_name": str(cleaned_data["bank_name"][i]),
                "account_name": str(cleaned_data["account_name"][i]),
                "account_no": str(cleaned_data["account_no"][i]),
                "size_20_quantity": str(cleaned_data["size_20_quantity"][i]),
                "size_40_quantity": str(cleaned_data["size_40_quantity"][i]),
                "original_amount": str(cleaned_data["original_amount"][i]),
                "tds": str(cleaned_data["tds"][i]),
            }
            for i in range(len(cleaned_data["client"]))
        ]

        # Initialize error handling
        error_data, error_data_msg, correct_data = [], {}, []

        # Validate each extracted data row
        for each in extracted_data_list:
            error_msg = []
            row_number = f"row {str(int(each['sr_no']) + 1)}"
            client_name = each["client"]

            #   Client
            client = None
            if not Client.objects.filter(
                name=client_name, type="Party", location=location, site=site
            ).exists():
                error_msg.append(f"In {row_number} client not found in system database")
            else:
                client = Client.objects.filter(
                    name=client_name, type="Party", location=location, site=site
                ).first()

            if not each["entry_type"] in ["IN", "OUT"]:
                error_msg.append(f"In {row_number} entry_type should be IN or OUT")

            if each["entry_type"] == "IN":
                if each["bl_no"] == "_":
                    error_msg.append(
                        f"In {row_number} bl_no cannot be '_' as the entry_type is IN"
                    )

                if not each["bk_no"] == "_":
                    error_msg.append(
                        f"In {row_number} bk_no should be '_' as the entry_type is IN"
                    )

                if client:
                    if AdvancedHandlingPayment.objects.filter(
                        bl_no=each["bl_no"]
                    ).exists():
                        temp_adv_payment = AdvancedHandlingPayment.objects.filter(
                            bl_no=each["bl_no"]
                        )
                        if not temp_adv_payment[0].client == client:
                            error_msg.append(
                                f"In {row_number} Client should be [ {temp_adv_payment[0].client.name} ] with given bl_no [ {each["bl_no"]} ]"
                            )
                each["bk_no"] = None
            else:
                if each["bk_no"] == "_":
                    error_msg.append(
                        f"In {row_number} bk_no cannot be '_' as the entry_type is OUT"
                    )

                if not each["bl_no"] == "_":
                    error_msg.append(
                        f"In {row_number} bl_no should be '_' as the entry_type is OUT"
                    )

                if client:
                    if AdvancedHandlingPayment.objects.filter(
                        bk_no=each["bk_no"]
                    ).exists():
                        temp_adv_payment = AdvancedHandlingPayment.objects.filter(
                            bk_no=each["bk_no"]
                        )
                        if not temp_adv_payment[0].client == client:
                            error_msg.append(
                                f"In {row_number} Client should be [ {temp_adv_payment[0].client.name} ] with given bk_no [ {each["bk_no"]} ]"
                            )

                each["bl_no"] = None

            payment_type = each["payment_type"]
            if not payment_type in ["Cheque", "NEFT", "RTGS", "Finance_Account"]:
                error_msg.append(
                    f"In {row_number} payment_type should be Cheque or NEFT or RTGS or Finance_Account "
                )

            if payment_type == "Cheque":
                if each["cheque_no"] == "_":
                    error_msg.append(
                        f"In {row_number} cheque_no cannot be '_' as payment_type is Cheque"
                    )

                if not each["utr_no"] == "_":
                    error_msg.append(
                        f"In {row_number} utr_no should be '_' as payment_type is Cheque"
                    )

                if AdvancedHandlingPayment.objects.filter(
                    cheque_no=each["cheque_no"]
                ).exists():
                    error_msg.append(
                        f"In {row_number}, Payment already exists with the given cheque_no"
                    )

                each["utr_no"] = None

            elif payment_type in ["NEFT", "RTGS"]:
                if each["utr_no"] == "_":
                    error_msg.append(
                        f"In {row_number} utr_no cannot be '_' as payment_type is not Cheque"
                    )

                if not each["cheque_no"] == "_":
                    error_msg.append(
                        f"In {row_number} cheque_no should be '_' as payment_type is not Cheque"
                    )

                if AdvancedHandlingPayment.objects.filter(
                    utr_no=each["utr_no"]
                ).exists():
                    error_msg.append(
                        f"In {row_number},Payment already exists with the given utr_no"
                    )

                each["cheque_no"] = None

            else:
                if not each["cheque_no"] == "_":
                    error_msg.append(
                        f"In {row_number} cheque_no should be '_' as payment_type is Finance_Account"
                    )

                if not each["utr_no"] == "_":
                    error_msg.append(
                        f"In {row_number} utr_no should be '_' as payment_type is Finance_Account"
                    )
                each["cheque_no"] = None
                each["utr_no"] = None

            size_20_quantity = each["size_20_quantity"]
            size_40_quantity = each["size_40_quantity"]
            original_amount = each["original_amount"]
            tds = each["tds"]

            try:
                if int(size_20_quantity) == 0 and int(size_40_quantity) == 0:
                    error_msg.append(
                        f"In {row_number} Both Size Quantity cannot be zero or None or '_'"
                    )

                if int(size_20_quantity) < 0 or int(size_40_quantity) < 0:
                    error_msg.append(
                        f"In {row_number} Size Quantity cannot be negative or None or '_'"
                    )

                if int(float(original_amount)) <= 0 or int(float(tds)) <= 0:
                    error_msg.append(
                        f"In {row_number} original_amount or tds  should not be 0 or None or '_'"
                    )

                for field in [
                    "size_20_quantity",
                    "size_40_quantity",
                    "tds",
                ]:
                    each[field] = int(float(each[field]))

                each["original_amount"] = float(each["original_amount"])

            except:
                error_msg.append(
                    f"In {row_number} size_20_quantity, size_40_quantity, original_amount or tds  should not be 0 or None or '_'"
                )

            # Optional fields cleanup
            for field in [
                "bank_name",
                "account_name",
                "account_no",
            ]:
                each[field] = "" if each[field] == "_" else each[field]

            with_gst = True
            if client and payment_type == "Finance_Account":
                if not CustomerFinAccount.objects.filter(customer=client).exists():
                    error_msg.append(
                        f"In {row_number}, Client {client_name} Finance Account Not Exist"
                    )

                fin_account_obj = CustomerFinAccount.objects.filter(
                    customer=client
                ).first()
                with_gst = fin_account_obj.with_gst
                if float(fin_account_obj.balance) < float(original_amount):
                    error_msg.append(
                        f"In {row_number}, Client {client_name} Finance Account balance is not sufficient"
                    )

            def validate_original_amt():
                size_20_original_amount = 0
                size_40_original_amount = 0

                if not int(size_20_quantity) == 0:
                    size_20_rate = client.site.size_20_rate
                    # tds
                    tds_amount = float(size_20_rate) * (int(tds) / 100)
                    size_20_tds_amount = round(
                        float(tds_amount) * int(size_20_quantity)
                    )

                    # tax
                    tax = 0.18
                    if not with_gst:
                        tax = 0
                    tax_amount = float(size_20_rate) * tax
                    size_20_total_amount_with_gst = round(
                        float(size_20_rate) + float(tax_amount)
                    ) * int(size_20_quantity)
                    # cal
                    size_20_original_amount = float(
                        size_20_total_amount_with_gst
                    ) + float(size_20_tds_amount)

                if not int(size_40_quantity) == 0:
                    size_40_rate = client.site.size_40_rate
                    # tds
                    tds_amount = float(size_40_rate) * (int(tds) / 100)
                    size_40_tds_amount = round(
                        float(tds_amount) * int(size_40_quantity)
                    )

                    # tax
                    tax = 0.18
                    if not with_gst:
                        tax = 0
                    tax_amount = float(size_40_rate) * tax
                    size_40_total_amount_with_gst = round(
                        float(size_40_rate) + float(tax_amount)
                    ) * int(size_40_quantity)
                    # cal
                    size_40_original_amount = float(
                        size_40_total_amount_with_gst
                    ) + float(size_40_tds_amount)

                my_original_amount = size_20_original_amount + size_40_original_amount
                if float(original_amount) < float(my_original_amount):
                    error_msg.append(
                        f"In {row_number}, Sorry...Your original_amount is insufficient with respect to the quantity and current rate"
                    )

            validate_original_amt()

            # Append errors or correct data
            error_data_msg[row_number] = error_msg
            if error_msg:
                error_data.append(each)
            else:
                correct_data.append(each)

        # Return final data
        return {
            "importable_data": correct_data,
            "importable_data_count": len(correct_data),
            "rejected_data": error_data,
            "rejected_data_count": len(error_data),
            "faults": error_data_msg,
        }
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False


def extract_cust_fin_trans_excel_data(input_excel, location, site):
    try:
        # Load workbook and sheet
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["cust_fin_trans"]
        headers = [
            "client",
            "payment_type",
            "cheque_no",
            "utr_no",
            "bank_name",
            "account_name",
            "account_no",
            "amount",
        ]

        # Extract raw data and clean it
        raw_data = {
            header: [
                sheet[f"{chr(65 + i)}{row}"].value
                for row in range(2, sheet.max_row + 1)
            ]
            for i, header in enumerate(headers)
        }

        # Clean None values from the data
        cleaned_data = {
            key: [val for val in values if val is not None]
            for key, values in raw_data.items()
        }

        # Extract and structure data
        extracted_data_list = [
            {
                "sr_no": str(i + 1),
                "client": str(cleaned_data["client"][i]),
                "payment_type": str(cleaned_data["payment_type"][i]),
                "cheque_no": str(cleaned_data["cheque_no"][i]),
                "utr_no": str(cleaned_data["utr_no"][i]),
                "bank_name": str(cleaned_data["bank_name"][i]),
                "account_name": str(cleaned_data["account_name"][i]),
                "account_no": str(cleaned_data["account_no"][i]),
                "amount": str(cleaned_data["amount"][i]),
            }
            for i in range(len(cleaned_data["client"]))
        ]

        # Initialize error handling
        error_data, error_data_msg, correct_data = [], {}, []

        # Validate each extracted data row
        for each in extracted_data_list:
            error_msg = []
            row_number = f"row {str(int(each['sr_no']) + 1)}"
            client_name = each["client"]

            #   Client
            if not Client.objects.filter(
                name=client_name, type="Party", location=location, site=site
            ).exists():
                error_msg.append(f"In {row_number} client not found in system database")

            payment_type = each["payment_type"]
            if not payment_type in ["Cheque", "NEFT", "RTGS"]:
                error_msg.append(
                    f"In {row_number} payment_type should be Cheque or NEFT or RTGS"
                )

            if payment_type == "Cheque":
                if each["cheque_no"] == "_":
                    error_msg.append(
                        f"In {row_number} cheque_no cannot be '_' as payment_type is Cheque"
                    )

                if not each["utr_no"] == "_":
                    error_msg.append(
                        f"In {row_number} utr_no should be '_' as payment_type is Cheque"
                    )

                if FinAccountTransaction.objects.filter(
                    cheque_no=each["cheque_no"]
                ).exists():
                    error_msg.append(
                        f"In {row_number}, Payment already exists with the given cheque_no"
                    )

                each["utr_no"] = None
            else:
                if each["utr_no"] == "_":
                    error_msg.append(
                        f"In {row_number} utr_no cannot be '_' as payment_type is not Cheque"
                    )

                if not each["cheque_no"] == "_":
                    error_msg.append(
                        f"In {row_number} cheque_no should be '_' as payment_type is not Cheque"
                    )

                if FinAccountTransaction.objects.filter(utr_no=each["utr_no"]).exists():
                    error_msg.append(
                        f"In {row_number},Payment already exists with the given utr_no"
                    )

                each["cheque_no"] = None

            amount = each["amount"]

            try:
                if int(float(amount)) <= 0:
                    error_msg.append(
                        f"In {row_number} quantity or original_amount or tds  should not be 0 or None or '_'"
                    )

                each["amount"] = float(each["amount"])

            except:
                error_msg.append(
                    f"In {row_number} quantity or original_amount or tds  should not be 0 or None or '_'"
                )

            # Optional fields cleanup
            for field in [
                "bank_name",
                "account_name",
                "account_no",
            ]:
                each[field] = "" if each[field] == "_" else each[field]

            # Append errors or correct data
            error_data_msg[row_number] = error_msg
            if error_msg:
                error_data.append(each)
            else:
                correct_data.append(each)

        # Return final data
        return {
            "importable_data": correct_data,
            "importable_data_count": len(correct_data),
            "rejected_data": error_data,
            "rejected_data_count": len(error_data),
            "faults": error_data_msg,
        }
    except Exception as e:
        logging.getLogger("error_log").error(traceback.format_exc())
        return False
