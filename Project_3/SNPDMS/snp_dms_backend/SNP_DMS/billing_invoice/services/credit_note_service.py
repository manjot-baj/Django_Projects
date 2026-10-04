# other imports
from datetime import datetime
from master.functions import pagination_func
from num2words import num2words
import ast

# services
from billing_invoice.services.biiling_invoice_service import InvoiceService

# django
from django.utils import formats

# models
from mnr.models import Survey
from depot.models import GateOutHistory, GateInHistory
from billing_invoice.models import (
    CreditNote,
    CustomerBill,
    CustomerBillInvoiceLine,
    MNRInvoiceLine,
)


class CreditNoteService:
    def getParams(self, payload):
        credit_note_no = payload.get("credit_note_no")
        from_credit_note_date = payload.get("from_credit_note_date")
        to_credit_note_date = payload.get("to_credit_note_date")
        bill_type = payload.get("bill_type")
        invoice_no = payload.get("invoice_no")
        params = {
            "invoice__location__name": payload.get("location"),
            "invoice__site__name": payload.get("site"),
        }
        if credit_note_no:
            params["credit_note_no"] = credit_note_no
        if from_credit_note_date and to_credit_note_date:
            from_date = datetime.strptime(from_credit_note_date, "%d/%m/%Y")
            to_date = datetime.strptime(to_credit_note_date, "%d/%m/%Y")
            params["credit_note_date__range"] = (from_date, to_date)
        if bill_type:
            if bill_type == "MNR":
                params["bill_type__in"] = ["Repair", "Washing/Cleaning"]
            else:
                params["bill_type"] = bill_type
        if invoice_no:
            params["invoice__invoice_no"] = invoice_no
        return params

    def creditNoteDto(self, data):
        return {
            "pk": data.pk,
            "credit_note_date": data.credit_note_date.strftime("%d/%m/%Y"),
            "credit_note_no": data.credit_note_no,
            "bill_type": data.bill_type,
            "total_amount": data.total_amount,
        }

    def getCreditNotes(self, payload, on_page_data, page_no):
        params = self.getParams(payload)
        qs = CreditNote.objects.select_related("invoice").filter(**params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, page_no, qs)
        data = [self.creditNoteDto(data) for data in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def paginationData(self, on_page_data, page_no, queryset):

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(queryset, on_page_data, page_no)
        return (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        )

    def getMNRData(self, credit_note):
        qs = CustomerBill.objects.filter(
            mnr_invoice_id=credit_note.invoice.pk, credit_note_mnr=True
        )
        return [
            {
                "pk": data.pk,
                "container_no": data.container_no,
                "amount": data.original_amount,
                "bill_type": data.bill_type,
            }
            for data in qs
        ]

    def getOtherData(self, credit_note):
        credit_note_lines = []

        qs = CustomerBillInvoiceLine.objects.filter(
            parent=credit_note.invoice, credit_note=True
        )
        return [
            {
                "pk": data.pk,
                "container_no": data.container_no,
                "amount": data.original_amount,
                "bill_type": data.parent.bill_type,
            }
            for data in qs
        ]

    def getCreditNoteNo(self, site):
        financial_year = InvoiceService().getFinancialYear().replace("-", "")
        site_code = site.code if site.code is not None else site.name
        credit_note_no = f"{site_code}/{financial_year}/C/"
        # credit_note_no = f"CRN/{financial_year}/{site_code}"

        return credit_note_no

    def getCreditNoteLinesMNR(self, bills):
        credit_note_lines = []
        total_amount = float(0)
        bills_pk_list = []

        for each in bills:
            credit_note_lines.append(
                {
                    "pk": each.pk,
                    "container_no": each.container_no,
                    "amount": each.original_amount,
                    "bill_type": each.bill_type,
                }
            )
            bills_pk_list.append(each.pk)
            total_amount += float(each.original_amount)
        return credit_note_lines, total_amount, bills_pk_list

    def getCreditNoteLines(self, invoices):
        credit_note_lines = []
        total_amount = float(0)
        invoice_pk_list = []
        for each in invoices:
            credit_note_lines.append(
                {
                    "pk": each.pk,
                    "container_no": each.container_no,
                    "amount": each.original_amount,
                    "bill_type": each.parent.bill_type,
                }
            )
            total_amount += float(each.original_amount)
            invoice_pk_list.append(each.pk)

        return credit_note_lines, total_amount, invoice_pk_list

    def getMNRInvoiceData(self, invoice):
        bill_ids_in_char = MNRInvoiceLine.objects.filter(parent=invoice).values_list(
            "bill_ids", flat=True
        )
        bill_ids = []
        for each in bill_ids_in_char:
            ids = ast.literal_eval(each)
            bill_ids.extend(ids)

        bills = CustomerBill.objects.filter(
            pk__in=bill_ids, credit_note_mnr=False
        ).values("pk", "container_no", "client__name", "original_amount", "bill_type")
        return [
            {
                "pk": each["pk"],
                "container_no": each["container_no"],
                "client": each["client__name"],
                "original_amount": each["original_amount"],
                "bill_type": each["bill_type"],
            }
            for each in bills
        ]

    def getOtherInvoiceData(self, invoice):
        line = CustomerBillInvoiceLine.objects.filter(
            parent=invoice, credit_note=False
        ).values(
            "pk",
            "container_no",
            "parent__client__name",
            "original_amount",
            "parent__bill_type",
        )
        return [
            {
                "pk": each["pk"],
                "container_no": each["container_no"],
                "client": each["parent__client__name"],
                "original_amount": each["original_amount"],
                "bill_type": each["parent__bill_type"],
            }
            for each in line
        ]

    def getFinancialYear(self):
        current = datetime.now()
        year = current.year
        if current.month >= 4:
            return f"{str(year)[2:]}-{str(year+1)[2:]}"
        else:
            return f"{str(year-1)[2:]}-{str(year)[2:]}"

    def createCreditNote(self, params, payload):

        obj = CreditNote.objects.create(**params)

        if params["bill_type"] in ["Repair", "Washing/Cleaning"]:
            CustomerBill.objects.filter(pk__in=payload.get("pk_list")).update(
                credit_note_mnr=True
            )
        else:
            CustomerBillInvoiceLine.objects.filter(
                pk__in=payload.get("pk_list")
            ).update(credit_note=True)

        return obj

    def buildDataForCreditNoteInvoice(
        self,
        credit_note,
    ):
        hsn_code = credit_note.invoice.hsn_code

        if credit_note.bill_type in ["Washing/Cleaning", "Repair"]:

            bills = CustomerBill.objects.filter(
                mnr_invoice_id=credit_note.invoice.pk, credit_note_mnr=True
            )
            total_amount = float(0)
            credit_line_data = []
            for each in bills:
                survey = Survey.objects.get(pk=each.survey_id)
                if each.site.type == "DEPOT":
                    uom_type = survey.depot.container.size.name
                else:
                    uom_type = survey.non_depot.container.size.name

                # credit_line_data = []

                credit_line_data.append(
                    {
                        "uom": uom_type,
                        "hsn_code": hsn_code,
                        "qty": 1,
                        "rate": round(each.original_amount, 2),
                        "disc": "",
                        "amount": round(each.original_amount, 2),
                        "taxable_amount": round(each.original_amount, 2),
                        "cgst_amount": (float(0)),
                        "sgst_amount": (float(0)),
                        "igst_amount": float(0),
                        "total_amount": round(each.original_amount, 2),
                        "container_no": each.container_no,
                    }
                )
                total_amount += float(each.original_amount)
                total_tax_amount = float(0.0)

        else:
            lines = CustomerBillInvoiceLine.objects.filter(
                parent=credit_note.invoice, credit_note=True
            )

            total_amount = float(0)
            credit_line_data = []
            for each in lines:

                customer_bill = CustomerBill.objects.get(pk=each.bill_id)
                model = (
                    GateInHistory if customer_bill.bill_for == "IN" else GateOutHistory
                )
                if customer_bill.bill_type in ["Handling", "Night Charge"]:

                    obj = model.objects.get(lolo__pk=customer_bill.lolo_id)
                    uom_type = obj.container.size.name
                elif customer_bill.bill_type == "Transportation":
                    obj = model.objects.get(st__pk=customer_bill.st_id)
                    uom_type = obj.container.size.name

                credit_line_data.append(
                    {
                        "uom": uom_type,
                        "hsn_code": hsn_code,
                        "qty": 1,
                        "rate": round(each.original_amount, 2),
                        "disc": "",
                        "amount": round(each.original_amount, 2),
                        "taxable_amount": round(each.original_amount, 2),
                        "cgst_amount": (float(0)),
                        "sgst_amount": (float(0)),
                        "igst_amount": float(0),
                        "total_amount": round(each.original_amount, 2),
                        "container_no": each.container_no,
                    }
                )
                total_amount += float(each.original_amount)
                total_tax_amount = float(0.0)

        bill_to_party_client = credit_note.invoice.bill_to_party_client
        ship_to_party_client = credit_note.invoice.ship_to_party_client
        location = credit_note.invoice.location
        site = credit_note.invoice.site
        try:
            location_icon = location.icon.url
        except:
            location_icon = None

        data = {
            "credit_note_no": credit_note.credit_note_no,
            "credit_note_date": formats.date_format(
                credit_note.credit_note_date, "d/m/Y"
            ),
            "location_state": credit_note.invoice.location.name,
            "location_gst_no": credit_note.invoice.location.gst_no,
            "location_icon": location_icon,
            "location_state_code": (
                credit_note.invoice.location.gst_no[:2]
                if credit_note.invoice.location.gst_no
                else ""
            ),
            "site_address": site.address,
            "site_contact": site.contact,
            "ref_booking_no": credit_note.invoice.ref_booking_no,
            "ref_bl_no": credit_note.invoice.ref_bl_no,
            "place_of_supply": credit_note.invoice.place_of_supply,
            "supply_date": (
                formats.date_format(credit_note.invoice.supply_date, "d/m/Y")
                if credit_note.invoice.supply_date
                else ""
            ),
            "main_client": credit_note.invoice.client.name,
            "bill_to_party_client": (
                bill_to_party_client.name if bill_to_party_client else ""
            ),
            "bill_to_party_address": (
                bill_to_party_client.address if bill_to_party_client else ""
            ),
            "bill_to_party_state": (
                bill_to_party_client.state if bill_to_party_client else ""
            ),
            "bill_to_party_gst_no": (
                bill_to_party_client.gst_no if bill_to_party_client else ""
            ),
            "bill_to_party_state_code": (
                bill_to_party_client.state_code if bill_to_party_client else ""
            ),
            "bill_to_party_zip_code": (
                bill_to_party_client.zip_code if bill_to_party_client else ""
            ),
            "ship_to_party_client": (
                ship_to_party_client.name if ship_to_party_client else ""
            ),
            "ship_to_party_address": (
                ship_to_party_client.address if ship_to_party_client else ""
            ),
            "ship_to_party_state": (
                ship_to_party_client.state if ship_to_party_client else ""
            ),
            "ship_to_party_gst_no": (
                ship_to_party_client.gst_no if ship_to_party_client else ""
            ),
            "ship_to_party_state_code": (
                ship_to_party_client.state_code if ship_to_party_client else ""
            ),
            "ship_to_party_zip_code": (
                ship_to_party_client.zip_code if ship_to_party_client else ""
            ),
            "total_taxable_amount": round(total_amount, 2),
            "total_cgst_amount": (float(0)),
            "total_sgst_amount": (float(0)),
            "total_igst_amount": (float(0)),
            "grand_total_amount": round(total_amount),
            "grand_total_amount_word": "Rupees "
            + (str(num2words(round(total_amount))).title()).replace(",", "")
            + " Only/-",
            "total_tax_amount": round(total_tax_amount, 2),
            "credit_line": credit_line_data,
            "remark": credit_note.remark,
            "bank_name": site.bank_name if site.bank_name else "",
            "account_no": site.bank_account_no if site.bank_account_no else "",
            "ifsc_code": site.ifsc_code if site.ifsc_code else "",
            "bank_branch": site.bank_branch if site.bank_branch else "",
            "organization": site.organization if site.organization else "",
        }

        return data
