from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoiceLine,
)
import os, fiscalyear
from SNP_DMS.settings.base import BASE_DIR
import pandas as pd
import xlsxwriter
from openpyxl import load_workbook
import traceback, logging, datetime
from django.db import transaction
from django.utils import timezone
from depot.models import GateInHistory, GateOutHistory, Handling, SelfTransportation
from mnr.models import Survey

INDIAN_STATES = [
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
STATE_CODES = {
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


def toggle_lolo_st_amt():
    try:
        bill_ids = CustomerBillInvoiceLine.objects.all().values_list(
            "bill_id", flat=True
        )
        lolo_ids = (
            CustomerBill.objects.filter(pk__in=bill_ids)
            .exclude(lolo_id=None)
            .values_list("lolo_id", flat=True)
        )
        st_ids = (
            CustomerBill.objects.filter(pk__in=bill_ids)
            .exclude(st_id=None)
            .values_list("st_id", flat=True)
        )
        lolo_objects = Handling.objects.filter(pk__in=lolo_ids)
        lolo_objects.update(is_amt_editable=False)
        st_objects = SelfTransportation.objects.filter(pk__in=st_ids)
        st_objects.update(is_amt_editable=False)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def create_bills_through_shell(from_date, to_date, process, location, site):
#     try:
#         data = (
#             GateInHistory.objects.select_related(
#                 "gate_in",
#                 "lolo",
#                 "st",
#                 "container",
#                 "container__client",
#                 "container__location",
#                 "container__site",
#             ).filter(
#                 gate_in__in_date__range=(from_date, to_date),
#                 container__location=location,
#                 container__site=site,
#             )
#             if process == "IN"
#             else GateOutHistory.objects.select_related(
#                 "gate_out",
#                 "lolo",
#                 "st",
#                 "container",
#                 "container__client",
#                 "container__location",
#                 "container__site",
#             ).filter(
#                 gate_out__out_date__range=(from_date, to_date),
#                 container__location=location,
#                 container__site=site,
#             )
#         )
#         for each in data:

#             bill_date = (
#                 each.gate_in.in_date if process == "IN" else each.gate_out.out_date
#             )
#             if each.lolo:
#                 lolo_customer = (
#                     each.container.client
#                     if each.lolo.apply_charges == "Line"
#                     or each.lolo.customer_name is None
#                     else each.lolo.customer_name
#                 )
#                 if (
#                     not CustomerBill.objects.filter(lolo_id=each.lolo.pk).exists()
#                     or each.lolo.payment_type == "None"
#                 ):
#                     lolo_billing = CustomerBill.create(
#                         lolo_id=each.lolo.pk,
#                         st_id=None,
#                         survey_id=None,
#                         bill_type="Handling",
#                         bill_date=bill_date,
#                         apply_charge=each.lolo.apply_charges,
#                         container_no=each.container.container_no,
#                         client=each.container.client,
#                         customer=lolo_customer,
#                         ref_code=each.container.client.ref_code,
#                         is_payment_completed=False,
#                         payment_type=each.lolo.payment_type,
#                         original_amount=float(each.lolo.lolo_amount),
#                         remaining_amount=float(each.lolo.lolo_amount),
#                         location=each.container.location,
#                         site=each.container.site,
#                     )
#                     lolo_billing.save()
#             if each.st:
#                 st_customer = (
#                     each.container.client
#                     if each.st.apply_charges == "Line" or each.st.customer_name is None
#                     else each.st.customer_name
#                 )
#                 if (
#                     not CustomerBill.objects.filter(st_id=each.st.pk).exists()
#                     or each.st.payment_type == "None"
#                 ):
#                     st_billing = CustomerBill.create(
#                         lolo_id=None,
#                         st_id=each.lolo.pk,
#                         survey_id=None,
#                         bill_type="Transportation",
#                         bill_date=bill_date,
#                         apply_charge=each.st.apply_charges,
#                         container_no=each.container.container_no,
#                         client=each.container.client,
#                         customer=st_customer,
#                         ref_code=each.container.client.ref_code,
#                         is_payment_completed=False,
#                         payment_type=each.st.payment_type,
#                         original_amount=float(each.st.price),
#                         remaining_amount=float(each.st.price),
#                         location=each.container.location,
#                         site=each.container.site,
#                     )
#                     st_billing.save()

#         return True
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


def get_financial_year():

    current = datetime.datetime.now()
    year = current.year
    if current.month >= 4:
        return f"{str(year)[2:]}-{str(year+1)[2:]}"
    else:
        return f"{str(year-1)[2:]}-{str(year)[2:]}"


def get_invoice_no(location, site, bill_type):
    if site.location.name in ["West Bengal", "THE HINDUSTAN ENGINEERING & MARINE CORPORATION"]:
        financial_year = get_financial_year().replace("-", "")
    else:
        financial_year = "2526"

    site_code = site.code if site.code is not None else site.name
    if bill_type == "Night Charge":
        invoice_no = f"MNR/{financial_year}/{site_code}/N"
    else:
        invoice_no = f"MNR/{financial_year}/{site_code}"
    return invoice_no


def get_credit_note_no(site, bill_type):
    financial_year = get_financial_year().replace("-", "")
    site_code = site.code if site.code is not None else site.name
    credit_note_no = f"CRN/{financial_year}/{site_code}"
    return credit_note_no


def make_billing_statement_excel(context):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/billing_statement.xlsx")
        billing_workbook = xlsxwriter.Workbook(temp_file_path)
        billing_statement_sheet = billing_workbook.add_worksheet("billing_statement")
        billing_workbook.close()

        # New Version code
        book = load_workbook(temp_file_path)
        with pd.ExcelWriter(
            temp_file_path,
            engine="openpyxl",
            mode="a",
            if_sheet_exists="replace",
        ) as writer:
            billing_df = pd.DataFrame(context)
            billing_df.to_excel(writer, sheet_name="billing_statement", index=False)

        # Old Version
        # book = load_workbook(temp_file_path)
        # writer = pd.ExcelWriter(temp_file_path, engine="openpyxl")
        # writer.book = book
        # writer.sheets = dict((ws.title, ws) for ws in book.worksheets)
        # billing_df = pd.DataFrame(context)
        # billing_df.to_excel(
        #     writer, sheet_name="billing_statement", startrow=0, startcol=0, index=False
        # )
        # writer.save()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_handling_billing_statement(df_data, user_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))

        temp_file_path = os.path.join(BASE_DIR, f"temp/billing_statement.xlsx")
        billing_workbook = xlsxwriter.Workbook(temp_file_path)
        billing_sheet = billing_workbook.add_worksheet("Billing_statement")
        booking_merge_format = billing_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = billing_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = billing_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        billing_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        billing_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        billing_sheet.merge_range("A4:U4", None, booking_merge_format3)

        billing_sheet.add_table(
            f"A6:O{6 + len(df_data)}",
            {
                "data": df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Location"},
                    {"header": "Invoice Date"},
                    {"header": "Container No"},
                    {"header": "Gate IN/Out Date"},
                    {"header": "GST No"},
                    {"header": "Invoice No"},
                    {"header": "Party Name"},
                    {"header": "Payment Type"},
                    {"header": "Taxable Amount"},
                    {"header": "CGST Amount"},
                    {"header": "SGST Amount"},
                    {"header": "IGST Amount"},
                    {"header": "Received Amount"},
                    {"header": "Original Amount"},
                ],
            },
        )
        billing_workbook.close()
        return temp_file_path

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_mnr_billing_statement(df_data, user_data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))

        temp_file_path = os.path.join(BASE_DIR, f"temp/billing_statement_mnr.xlsx")
        billing_workbook = xlsxwriter.Workbook(temp_file_path)
        billing_sheet = billing_workbook.add_worksheet("Billing_statement")
        booking_merge_format = billing_workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        booking_merge_format2 = billing_workbook.add_format(
            {
                "bold": 1,
                "align": "center",
                "valign": "vcenter",
                "font_size": 11,
            }
        )
        booking_merge_format3 = billing_workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )

        billing_sheet.merge_range(
            "A1:U2", user_data["company_name"], booking_merge_format
        )
        billing_sheet.merge_range(
            "A3:U3", user_data["company_address"], booking_merge_format2
        )

        billing_sheet.merge_range("A4:U4", None, booking_merge_format3)

        billing_sheet.add_table(
            f"A6:O{6 + len(df_data)}",
            {
                "data": df_data,
                "columns": [
                    {"header": "Sl.No"},
                    {"header": "Container No"},
                    {"header": "Type"},
                    {"header": "Client Name"},
                    {"header": "Container Type"},
                    {"header": "Container Size"},
                    {"header": "Billing Date"},
                    {"header": "Labour Hours"},
                    {"header": "Labour Cost"},
                    {"header": "Material Cost"},
                    {"header": "Cleaning Cost"},
                    {"header": "Amount"},
                    {"header": "Name"},
                    {"header": "DORef"},
                    {"header": "Line"},
                ],
            },
        )
        billing_workbook.close()
        return temp_file_path

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def create_billing_lolo(obj, process):
    try:
        bill_date = obj.gate_in.in_date if process == "IN" else obj.gate_out.out_date
        customer = (
            obj.container.client
            if obj.lolo.apply_charges == "Line" or obj.lolo.customer_name is None
            else obj.lolo.customer_name
        )
        amount = obj.lolo.lolo_amount

        if obj.container.site.new_billing_module:
            if CustomerBill.objects.filter(
                lolo_id=obj.lolo.pk, bill_type="Handling"
            ).exists():
                if not obj.lolo.is_invoiced:
                    bill = CustomerBill.objects.get(
                        lolo_id=obj.lolo.pk, bill_type="Handling"
                    )
                    bill.bill_date = bill_date
                    bill.container_no = obj.container.container_no
                    bill.client = obj.container.client
                    bill.customer = customer
                    bill.ref_code = obj.container.client.ref_code
                    bill.payment_type = obj.lolo.payment_type
                    bill.apply_charge = obj.lolo.apply_charges
                    bill.original_amount = float(amount)
                    bill.remaining_amount = float(amount)
                    bill.save()
                else:
                    return True
            else:
                lolo_billing = CustomerBill.create(
                    lolo_id=obj.lolo.pk,
                    st_id=None,
                    survey_id=None,
                    bill_type="Handling",
                    bill_date=bill_date,
                    apply_charge=obj.lolo.apply_charges,
                    container_no=obj.container.container_no,
                    client=obj.container.client,
                    customer=customer,
                    ref_code=obj.container.client.ref_code,
                    is_payment_completed=False,
                    payment_type=obj.lolo.payment_type,
                    original_amount=float(amount),
                    remaining_amount=float(amount),
                    bill_for=process,
                    location=obj.container.location,
                    site=obj.container.site,
                )
                lolo_billing.save()
            return True
        else:
            return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def create_billing_st(obj, process):
    try:
        bill_date = obj.gate_in.in_date if process == "IN" else obj.gate_out.out_date
        customer = (
            obj.container.client
            if obj.st.apply_charges == "Line" or obj.st.customer_name is None
            else obj.st.customer_name
        )
        if obj.container.site.new_billing_module:
            if CustomerBill.objects.filter(st_id=obj.st.pk).exists():
                if not obj.st.is_invoiced:
                    bill = CustomerBill.objects.get(st_id=obj.st.pk)
                    bill.bill_date = bill_date
                    bill.container_no = obj.container.container_no
                    bill.client = obj.container.client
                    bill.customer = customer
                    bill.ref_code = obj.container.client.ref_code
                    bill.payment_type = obj.st.payment_type
                    bill.apply_charge = obj.st.apply_charges
                    bill.original_amount = float(obj.st.price)
                    bill.remaining_amount = float(obj.st.price)
                    bill.save()
                else:
                    return True
            else:
                st_billing = CustomerBill.create(
                    lolo_id=None,
                    st_id=obj.st.pk,
                    survey_id=None,
                    bill_type="Transportation",
                    bill_date=bill_date,
                    apply_charge=obj.st.apply_charges,
                    container_no=obj.container.container_no,
                    client=obj.container.client,
                    customer=customer,
                    ref_code=obj.container.client.ref_code,
                    is_payment_completed=False,
                    payment_type=obj.st.payment_type,
                    original_amount=float(obj.st.price),
                    remaining_amount=float(obj.st.price),
                    bill_for=process,
                    location=obj.container.location,
                    site=obj.container.site,
                )
                st_billing.save()
            return True
        else:
            return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def create_billing_mnr(obj, bill_type, repair_type, site):
    try:
        container = (
            obj.parent.parent.depot.container
            if site.type == "DEPOT"
            else obj.parent.parent.non_depot.container
        )
        if repair_type == "Repair":
            amount = bill_type["repair_amount"]
        if repair_type == "Washing/Cleaning":
            amount = bill_type["washing_amount"]

        if not CustomerBill.objects.filter(
            survey_id=obj.parent.parent.id,
            bill_type=repair_type,
        ).exists():
            new_repair_billing = CustomerBill.create(
                lolo_id=None,
                st_id=None,
                survey_id=obj.parent.parent.id,
                bill_type=repair_type,
                bill_date=obj.current_repair_date,
                apply_charge="Line",
                container_no=container.container_no,
                client=container.client,
                customer=container.client,
                ref_code=container.client.ref_code,
                is_payment_completed=False,
                payment_type=None,
                original_amount=float(amount),
                remaining_amount=float(amount),
                bill_for=None,
                location=container.location,
                site=container.site,
            )
            new_repair_billing.save()
            if (
                site.type == "DEPOT"
                and obj.parent.parent.depot.container_status == "IN"
            ):
                new_repair_billing.is_locked = True
                new_repair_billing.save(update_fields=["is_locked"])
            elif (
                site.type == "NON DEPOT"
                and obj.parent.parent.non_depot.container_status == "IN"
            ):
                new_repair_billing.is_locked = True
                new_repair_billing.save(update_fields=["is_locked"])
    except:
        pass


def create_bills_through_shell(from_date, to_date, process, bill_for, location, site):
    try:
        data = (
            GateInHistory.objects.select_related(
                "gate_in",
                "lolo",
                "st",
                "container",
                "container__client",
                "container__location",
                "container__site",
            ).filter(
                date__range=(from_date, to_date),
                container__location=location,
                container__site=site,
            )
            if process == "IN"
            else GateOutHistory.objects.select_related(
                "gate_out",
                "lolo",
                "st",
                "container",
                "container__client",
                "container__location",
                "container__site",
            ).filter(
                date__range=(from_date, to_date),
                container__location=location,
                container__site=site,
            )
        )

        if bill_for == "lolo":
            for each in data:
                create_billing_lolo(obj=each, process=process)
        else:
            for each in data:
                create_billing_st(obj=each, process=process)

        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def client_to_customer_repair_bill_shell_script():
    try:
        data = CustomerBill.objects.select_related(
            "location", "site", "client", "customer"
        ).exclude(survey_id=None)
        count = 0
        total = data.count()
        for each in data:
            count = count + 1
            each.customer = each.client
            each.save()
            print(f"{count}...of...{total}")
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def separate_lolo_and_night_charge_in_handling_bill():
    try:
        handling_ids = Handling.objects.filter(
            is_night_charges_applied=True, is_invoiced=False
        ).values_list("pk", flat=True)
        bills = CustomerBill.objects.filter(
            lolo_id__in=handling_ids, bill_type="Handling"
        )
        count = 0
        for each in bills:
            count += 1
            if not CustomerBill.objects.filter(
                lolo_id=each.lolo_id, bill_type="Night Charge"
            ).exists():
                lolo_object = Handling.objects.get(pk=each.lolo_id)
                lolo_object.lolo_amount = (
                    lolo_object.lolo_amount - lolo_object.night_charges
                )
                lolo_object.save()
                night_charge_with_tax = lolo_object.night_charges
                each.original_amount -= night_charge_with_tax
                each.remaining_amount -= night_charge_with_tax
                each.save(update_fields=["original_amount", "remaining_amount"])
                night_charge_bill = CustomerBill.create(
                    lolo_id=each.lolo_id,
                    st_id=None,
                    survey_id=None,
                    bill_type="Night Charge",
                    bill_date=each.bill_date,
                    apply_charge=each.apply_charge,
                    container_no=each.container_no,
                    client=each.client,
                    customer=each.customer,
                    ref_code=each.ref_code,
                    is_payment_completed=False,
                    payment_type=each.payment_type,
                    original_amount=float(night_charge_with_tax),
                    remaining_amount=float(night_charge_with_tax),
                    bill_for=lolo_object.entry_type,
                    location=each.location,
                    site=each.site,
                )
                night_charge_bill.save()
            print(f"{count}..of..{bills.count()}")
        return True

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def change_handling_bill_amount_shell_func():
    with transaction.atomic():
        handlig_pks = [
            each["pk"]
            for each in Handling.objects.filter(is_invoiced=False).values("pk")
        ]
        bills = (
            CustomerBill.objects.select_related("site")
            .filter(lolo_id__in=handlig_pks)
            .exclude(bill_type="Night Charge")
        )
        for bill in bills:
            lolo = Handling.objects.get(pk=bill.lolo_id)
            amount = float(lolo.lolo_amount)
            bill.original_amount = amount
            bill.remaining_amount = amount
            bill.save()
    return True


def get_merge_format(workbook):
    merge_format = workbook.add_format(
        {
            "bold": 2,
            "align": "center",
            "valign": "vcenter",
            "font_color": "#e0a92a",
            "font_size": 18,
        }
    )
    merge_format3 = workbook.add_format(
        {
            "bold": 1,
            "font_size": 11,
        }
    )
    return merge_format, merge_format3


def create_billing_statement_excel(main_data, type):
    file_name = (
        "billing_statement.xlsx"
        if type == "billing_statement"
        else "pre_billing_statement.xlsx"
    )
    base_temp_dir = os.path.join(BASE_DIR, "temp")
    os.makedirs(base_temp_dir, exist_ok=True)
    temp_file_path = os.path.join(base_temp_dir, file_name)
    billing_workbook = xlsxwriter.Workbook(temp_file_path)
    billing_workbook.add_worksheet(type)
    billing_workbook.close()

    # New Version code
    book = load_workbook(temp_file_path)
    with pd.ExcelWriter(
        temp_file_path,
        engine="openpyxl",
        mode="a",
        if_sheet_exists="replace",
    ) as writer:
        billing_df = pd.DataFrame(main_data)
        billing_df.to_excel(writer, sheet_name=type, index=False)

    # Old version
    # book = load_workbook(temp_file_path)
    # writer = pd.ExcelWriter(temp_file_path, engine="openpyxl")
    # writer.book = book
    # writer.sheets = dict((ws.title, ws) for ws in book.worksheets)
    # billing_df = pd.DataFrame(main_data)
    # billing_df.to_excel(
    #     writer,
    #     sheet_name=type,
    #     startrow=0,
    #     startcol=0,
    #     index=False,
    # )
    # writer.save()
    return temp_file_path


def script_to_modify_bill_for():
    with transaction.atomic():
        in_lolo_ids = Handling.objects.filter(entry_type="IN").values_list(
            "pk", flat=True
        )
        CustomerBill.objects.filter(
            lolo_id__in=in_lolo_ids, bill_type="Handling"
        ).update(bill_for="IN")
        CustomerBill.objects.filter(
            lolo_id__in=in_lolo_ids, bill_type="Night Charge"
        ).update(bill_for="IN")

        out_lolo_ids = Handling.objects.filter(entry_type="OUT").values_list(
            "pk", flat=True
        )
        CustomerBill.objects.filter(
            lolo_id__in=out_lolo_ids, bill_type="Handling"
        ).update(bill_for="OUT")
        CustomerBill.objects.filter(
            lolo_id__in=out_lolo_ids, bill_type="Night Charge"
        ).update(bill_for="OUT")

        in_st_ids = Handling.objects.filter(entry_type="IN").values_list(
            "pk", flat=True
        )
        CustomerBill.objects.filter(
            st_id__in=in_st_ids, bill_type="Transportation"
        ).update(bill_for="IN")
        out_st_ids = Handling.objects.filter(entry_type="OUT").values_list(
            "pk", flat=True
        )
        CustomerBill.objects.filter(
            st_id__in=out_st_ids, bill_type="Transportation"
        ).update(bill_for="OUT")

        # lolo_pk = [
        #     each["lolo_id"]
        #     for each in CustomerBill.objects.filter(
        #         bill_for=None,
        #         bill_type="Handling",
        #     ).values("lolo_id")
        # ]
        # lolo_pk_for_night_charge = [
        #     each["lolo_id"]
        #     for each in CustomerBill.objects.filter(
        #         bill_for=None,
        #         bill_type="Night Charge",
        #     ).values("lolo_id")
        # ]
        # st_pk = [
        #     each["st_id"]
        #     for each in CustomerBill.objects.filter(
        #         bill_for=None,
        #         bill_type="Transportation",
        #     ).values("st_id")
        # ]

        # # handling bills

        # handlings = Handling.objects.filter(pk__in=lolo_pk).values("pk", "entry_type")
        # for each in handlings:
        #     if each["entry_type"] == "IN":
        #         CustomerBill.objects.filter(
        #             lolo_id=each["pk"], bill_type="Handling"
        #         ).update(bill_for="IN")
        #     elif each["entry_type"] == "OUT":
        #         CustomerBill.objects.filter(
        #             lolo_id=each["pk"], bill_type="Handling"
        #         ).update(bill_for="OUT")

        # # night charges bills
        # night_charges = Handling.objects.filter(pk__in=lolo_pk_for_night_charge).values(
        #     "pk", "entry_type"
        # )
        # for each in night_charges:
        #     if each["entry_type"] == "IN":
        #         CustomerBill.objects.filter(
        #             lolo_id=each["pk"], bill_type="Night Charge"
        #         ).update(bill_for="IN")
        #     elif each["entry_type"] == "OUT":
        #         CustomerBill.objects.filter(
        #             lolo_id=each["pk"], bill_type="Night Charge"
        #         ).update(bill_for="OUT")

        # # self transportation bills
        # self_transportations = SelfTransportation.objects.filter(pk__in=st_pk).values(
        #     "pk", "entry_type"
        # )
        # for each in self_transportations:
        #     if each["entry_type"] == "IN":
        #         CustomerBill.objects.filter(
        #             st_id=each["pk"], bill_type="Transportation"
        #         ).update(bill_for="IN")
        #     elif each["entry_type"] == "OUT":
        #         CustomerBill.objects.filter(
        #             st_id=each["pk"], bill_type="Transportation"
        #         ).update(bill_for="OUT")
    return True


def script_to_modify_is_locked_flag():
    try:

        survey_ids = CustomerBill.objects.filter(
            bill_type__in=["Washing/Cleaning", "Repair"], is_payment_completed=False
        ).values_list("survey_id", flat=True)
        surveys = Survey.objects.filter(pk__in=survey_ids)
        count = 0
        for each in surveys:
            count = count + 1
            if each.depot:
                if each.depot.container.status == "OUT":
                    CustomerBill.objects.filter(survey_id=each.pk).update(
                        is_locked=False
                    )
                else:
                    CustomerBill.objects.filter(survey_id=each.pk).update(
                        is_locked=True
                    )

            elif each.non_depot:
                if each.non_depot.container.status == "OUT":
                    CustomerBill.objects.filter(survey_id=each.pk).update(
                        is_locked=False
                    )
                else:
                    CustomerBill.objects.filter(survey_id=each.pk).update(
                        is_locked=True
                    )

            print(f"{count}...of...{surveys.count()}")

        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
