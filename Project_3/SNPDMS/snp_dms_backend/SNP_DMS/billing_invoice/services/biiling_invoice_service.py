# other imports
from datetime import datetime
from num2words import num2words
from decimal import Decimal
from SNP_DMS.settings.base import BASE_DIR
import xlsxwriter
from openpyxl import load_workbook
import pandas as pd
import os
import ast
from master.functions import pagination_func
import numpy as np
import math

# django
from django.utils import timezone
from django.utils import formats

# models
from billing_invoice.models import CustomerBill, INDIAN_STATES, STATE_CODES
from billing_invoice.models import (
    CustomerBillInvoiceLine,
    CustomerBillInvoice,
    CustomerBill,
    MNRInvoiceLine,
)
from master.models_two import (
    ClientChildCompany,
    LineHandlingCharges,
    HandlingChargesHistory,
)
from mnr.models import Survey, SurveyLine
from depot.models import (
    Container,
    Handling,
    SelfTransportation,
    GateInHistory,
    GateOutHistory,
)
from non_depot.models import NonDepotContainer

# error handling
from common.exceptions import ValidationError


class InvoiceService:

    def checkDistinctClients(self, customer_bill_objects, process):
        if process == "Handling/Transportation":
            qs = customer_bill_objects.values_list(
                "customer__name", flat=True
            ).distinct()
        else:
            qs = customer_bill_objects.values_list("client__name", flat=True).distinct()

        if qs.count() == 1:
            return True, qs[0]
        else:
            return False, ""

    def updateClientChildCompanyInfo(self, client_data, client_name):
        state_code = client_data.gst_no[:2] if client_data.gst_no else ""
        try:
            existing_client_child, created = ClientChildCompany.objects.get_or_create(
                parent=client_data,
                name=client_name,
                defaults={
                    "address": client_data.office_address,
                    "gst_no": client_data.gst_no,
                    "state": client_data.state,
                    "state_code": state_code,
                    "zip_code": client_data.zip,
                },
            )
        except:
            existing_client_child = ClientChildCompany.objects.filter(
                parent=client_data, name=client_name
            ).first()
            created = False

        if not created:
            existing_client_child.address = client_data.office_address
            existing_client_child.gst_no = client_data.gst_no
            existing_client_child.state = client_data.state
            existing_client_child.state_code = (
                client_data.gst_no[:2] if client_data.gst_no else ""
            )
            existing_client_child.zip_code = client_data.zip
            existing_client_child.save(
                update_fields=["address", "gst_no", "state", "state_code", "zip_code"]
            )
        return existing_client_child

    def clientChildList(self, pk):
        if ClientChildCompany.checkExistByParent(pk):
            qs = ClientChildCompany.getByParent(pk)
            return [each.get_child_client_details() for each in qs]
        return []

    def invoiceLinesData(self, customer_bill_objects, bill_type):
        qs = customer_bill_objects.values(
            "pk",
            "container_no",
            "client__name",
            "payment_type",
            "original_amount",
            "remaining_amount",
        )
        return list(
            {
                "pk": bill.get("pk", ""),
                "container_no": bill.get("container_no", ""),
                "client": bill.get("client__name", ""),
                "payment_type": bill.get("payment_type", ""),
                "original_amount": str(bill.get("original_amount", "")),
                "remaining_amount": str(bill.get("remaining_amount", "")),
                "rec_amount": str(
                    bill.get("original_amount", "0") if bill_type == "Handling" else "0"
                ),
                "bill_id": bill.get("pk", ""),
            }
            for bill in qs
        )

    def invoiceLinesDataForMNR(self, customer_bill_objects, site):
        mapped_data = {}
        # mapping survey ids to container sizes
        survey_ids = customer_bill_objects.values_list(
            "survey_id", flat=True
        ).distinct()

        if site.type == "DEPOT":
            survey = (
                Survey.objects.select_related("depot__container__size")
                .filter(pk__in=survey_ids)
                .values("depot__container__size__name", "pk")
            )
            for each in survey:
                if each["pk"] not in mapped_data:
                    mapped_data[str(each["pk"])] = each["depot__container__size__name"]
        else:
            survey = (
                Survey.objects.select_related("non_depot__container__size")
                .filter(pk__in=survey_ids)
                .values("non_depot__container__size__name", "pk")
            )
            for each in survey:
                if each["pk"] not in mapped_data:
                    mapped_data[str(each["pk"])] = each[
                        "non_depot__container__size__name"
                    ]

        # data list before cleaning
        data = []
        for each in customer_bill_objects:

            data.append(
                {
                    "process": each.bill_type,
                    "total_amount": each.remaining_amount,
                    "discount": "0",
                    "total_amount_after_discount": each.remaining_amount,
                    "bill_id": each.pk,
                    "survey_id": each.survey_id,
                }
            )
        # add size to data
        for item in data:
            item["size"] = mapped_data[item["survey_id"]]

        # merge data list by process and size
        df = pd.DataFrame(data)
        df["discount"] = pd.to_numeric(df["discount"])
        merged_df = (
            df.groupby(["process", "size"])
            .agg(
                {
                    "total_amount": "sum",
                    "discount": "sum",
                    "total_amount_after_discount": "sum",
                    "bill_id": lambda x: x.tolist(),
                }
            )
            .reset_index()
        )
        merged_df["discount"] = merged_df["discount"].astype(str)
        merged_data = merged_df.to_dict()
        main_data = []

        for i in range(len(merged_data["process"])):
            main_data.append(
                {
                    "process": merged_data["process"][i],
                    "size": merged_data["size"][i],
                    "total_amount": merged_data["total_amount"][i],
                    "discount": merged_data["discount"][i],
                    "total_amount_after_discount": merged_data[
                        "total_amount_after_discount"
                    ][i],
                    "bill_ids": merged_data["bill_id"][i],
                    "bill_count": len(merged_data["bill_id"][i]),
                }
            )

        return main_data

    def getFinancialYear(self):
        current = datetime.now()
        year = current.year
        if current.month >= 4:
            return f"{str(year)[2:]}-{str(year+1)[2:]}"
        else:
            return f"{str(year-1)[2:]}-{str(year)[2:]}"

    def getInvoiceNo(self, location, site, bill_type):
        financial_year = self.getFinancialYear().replace("-", "")
        site_code = site.code if site.code is not None else site.name
        if bill_type == "Night Charge":
            invoice_no = f"{site_code}/{financial_year}/N/"
            # invoice_no = f"MNR/{financial_year}/{site_code}/N"
        else:
            invoice_no = f"{site_code}/{financial_year}/I/"
            # invoice_no = f"MNR/{financial_year}/{site_code}"
        return invoice_no

    def collectInvoiceData(self, ids, from_date, to_date):
        customer_bill_objects = CustomerBill.objects.getBillQuerysetByPkList(ids)
        customer_obj = customer_bill_objects.first()

        # location and site
        location = customer_obj.location
        site = customer_obj.site

        # check if all client.customers are same
        if (
            customer_obj.bill_type == "Handling"
            or customer_obj.bill_type == "Transportation"
            or customer_obj.bill_type == "Night Charge"
        ):
            is_same_client, client_name = self.checkDistinctClients(
                customer_bill_objects, process="Handling/Transportation"
            )
            client_data = customer_obj.customer
        else:
            is_same_client, client_name = self.checkDistinctClients(
                customer_bill_objects, process="Repair"
            )
            client_data = customer_obj.client

        if not is_same_client:
            raise ValidationError(
                "Payer Customer/Client Should be Same for all requested Billing objects"
            )

        # create or update client child company
        client_child_company = self.updateClientChildCompanyInfo(
            client_data, client_name
        )
        client_child_company_list = self.clientChildList(client_data.pk)

        # generate invoice number
        invoice_label = self.getInvoiceNo(
            location, site, bill_type=customer_obj.bill_type
        )
        # fetch invoice lines data
        if customer_obj.bill_type in ["Handling", "Transportation", "Night Charge"]:
            invoice_lines = self.invoiceLinesData(
                customer_bill_objects, bill_type=customer_obj.bill_type
            )
        else:
            invoice_lines = self.invoiceLinesDataForMNR(customer_bill_objects, site)

        # map hsn code based on bill type
        if (
            customer_obj.bill_type == "Handling"
            or customer_obj.bill_type == "Night Charge"
        ):
            hsn_code = "996711"
        elif customer_obj.bill_type == "Transportation":
            hsn_code = "996791"
        else:
            hsn_code = "998729"

        data = {
            "bill_to_party_address": client_data.office_address,
            "bill_to_party_client": client_name,
            "bill_to_party_client_pk": str(client_child_company.pk),
            "bill_to_party_gst_no": client_data.gst_no,
            "bill_to_party_state": client_data.state,
            "bill_to_party_state_code": (
                client_data.gst_no[:2] if client_data.gst_no else None
            ),
            "bill_to_party_zip_code": client_data.zip,
            "main_client": client_name,
            "indian_state_list": INDIAN_STATES,
            "state_codes": STATE_CODES,
            "invoice_label": invoice_label,
            "invoice_no": "0000",
            "bill_type": customer_bill_objects[0].bill_type,
            "location": location.name,
            "site": site.name,
            "client_child_company_list": client_child_company_list,
            "apply_igst": "False",
            "apply_gst": "False" if client_data.is_sez else "True",
            "hsn_code": hsn_code,
            "ref_booking_no": "",
            "ref_bl_no": "",
            "place_of_supply": "",
            "supply_date": "",
            "invoice_date": datetime.now()
            .astimezone(timezone.get_current_timezone())
            .date()
            .strftime("%d/%m/%Y"),
            "ship_to_party_client_pk": "",
            "ship_to_party_client": "",
            "ship_to_party_address": "",
            "ship_to_party_gst_no": "",
            "ship_to_party_state": "",
            "ship_to_party_state_code": "",
            "ship_to_party_zip_code": "",
            "remark": "",
            "total_amount": "0",
            "from_supply_date": from_date,
            "to_supply_date": to_date,
            "discount": "0",
            "invoice_on_old_lolo_rate": "False",
        }
        # add invoice lines to main data
        data["invoice_lines"] = invoice_lines
        return data

    def getParams(self, data):
        params = {
            "parent__location__name": data["location"],
            "parent__site__name": data["site"],
        }

        if data["client"]:
            params["parent__client__name"] = data["client"]

        if data["container_no"]:
            params["container_no"] = data["container_no"]

        invoice_date = data["invoice_date"]
        if invoice_date["from"] and invoice_date["to"]:
            params["parent__invoice_date__range"] = (
                invoice_date["from"],
                invoice_date["to"],
            )

        if data["invoice_no"]:
            params["parent__invoice_no"] = data["invoice_no"]

        if data["bill_type"]:
            params["parent__bill_type"] = data["bill_type"]

        return params

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

    def invoicesDto(self, data):
        return {
            "pk": data.parent.pk,
            "invoice_no": data.parent.invoice_no,
            "invoice_date": (
                data.parent.invoice_date.strftime("%d/%m/%Y")
                if data.parent.invoice_date
                else ""
            ),
            "bill_type": data.parent.bill_type,
            "client": data.parent.client.name if data.parent.client else None,
            "total_amount": str(data.rec_amount),
            "container_no": data.container_no,
            "credit_note": data.credit_note,
        }

    def getInvoices(self, payload, on_page_data, page_no):
        params = self.getParams(payload)
        qs = CustomerBillInvoiceLine.objects.getCustomerBillInvoiceLineQuerysetByParams(
            params
        ).order_by("-pk")
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, page_no, qs)
        data = [self.invoicesDto(data) for data in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def getInvoicesListToDownload(self, payload):
        params = self.getParams(payload)
        qs = CustomerBillInvoiceLine.objects.getCustomerBillInvoiceLineQuerysetByParams(
            params
        ).order_by("-pk")
        data = [self.invoicesDto(data) for data in qs]
        return data

    def invoiceDto(self, data):
        return {
            "pk": data.pk,
            "invoice_label": data.invoice_no[:-4],
            "invoice_no": data.invoice_no[-4:].replace("/", ""),
            "apply_igst": data.apply_igst,
            "apply_gst": data.apply_gst,
            "invoice_date": (
                data.invoice_date.strftime("%d/%m/%Y") if data.invoice_date else None
            ),
            "bill_type": data.bill_type,
            "hsn_code": data.hsn_code,
            "ref_booking_no": data.ref_booking_no,
            "ref_bl_no": data.ref_bl_no,
            "place_of_supply": data.place_of_supply,
            "supply_date": (
                data.supply_date.strftime("%d/%m/%Y") if data.supply_date else None
            ),
            "from_supply_date": (
                data.from_supply_date.strftime("%Y-%m-%d")
                if data.from_supply_date
                else None
            ),
            "to_supply_date": (
                data.to_supply_date.strftime("%Y-%m-%d")
                if data.to_supply_date
                else None
            ),
            "main_client": data.client.name if data.client else None,
            "bill_to_party_client": (
                data.bill_to_party_client.name if data.bill_to_party_client else None
            ),
            "bill_to_party_client_pk": (
                str(data.bill_to_party_client.pk) if data.bill_to_party_client else None
            ),
            "bill_to_party_address": data.bill_to_party_client.address,
            "bill_to_party_gst_no": data.bill_to_party_client.gst_no,
            "bill_to_party_state": data.bill_to_party_client.state,
            "bill_to_party_state_code": (
                data.bill_to_party_client.state_code
                if data.bill_to_party_client
                else None
            ),
            "bill_to_party_zip_code": data.bill_to_party_client.zip_code,
            "ship_to_party_client": (
                data.ship_to_party_client.name if data.ship_to_party_client else None
            ),
            "ship_to_party_client_pk": (
                str(data.ship_to_party_client.pk) if data.ship_to_party_client else None
            ),
            "ship_to_party_address": (
                data.ship_to_party_client.address if data.ship_to_party_client else None
            ),
            "ship_to_party_gst_no": (
                data.ship_to_party_client.gst_no if data.ship_to_party_client else None
            ),
            "ship_to_party_state": (
                data.ship_to_party_client.state if data.ship_to_party_client else None
            ),
            "ship_to_party_state_code": (
                data.ship_to_party_client.state_code
                if data.ship_to_party_client
                else None
            ),
            "ship_to_party_zip_code": (
                data.ship_to_party_client.zip_code
                if data.ship_to_party_client
                else None
            ),
            "total_amount": str(data.total_amount),
            "remark": data.remark,
            "location": data.location.name if data.location else None,
            "site": data.site.name if data.site else None,
            "indian_state_list": INDIAN_STATES,
            "state_codes": STATE_CODES,
            "discount": data.discount,
            "client_discount": data.client_discount,
            "invoice_on_old_lolo_rate": data.invoice_on_old_lolo_rate,
        }

    def getInvoiceData(self, pk):
        customer_invoice = CustomerBillInvoice.objects.select_related(
            "client", "bill_to_party_client", "ship_to_party_client", "location", "site"
        ).get(pk=pk)
        data = self.invoiceDto(customer_invoice)
        invoice_line_qs = CustomerBillInvoiceLine.objects.filter(
            parent=customer_invoice
        )
        data["invoice_lines"] = [
            {
                "pk": bill.pk,
                "container_no": bill.container_no,
                "original_amount": str(bill.original_amount),
                "remaining_amount": str(bill.remaining_amount),
                "rec_amount": str(bill.rec_amount),
                "bill_id": bill.bill_id,
            }
            for bill in invoice_line_qs
        ]
        client = customer_invoice.client
        if ClientChildCompany.checkExistByParent(client.pk):
            qs = ClientChildCompany.getByParent(client.pk)
            data["client_child_company_list"] = [
                each.get_child_client_details() for each in qs
            ]
        else:
            data["client_child_company_list"] = []

        return data

    def getHandlingPrintInvoiceData(
        self,
        ids,
        invoice,
        apply_igst,
        discount,
        discount_value,
        hsn_code,
        site_20_rate,
        site_40_rate,
        night_charge_20_rate,
        night_charge_40_rate,
        is_multiple_container,
        invoice_qs,
    ):
        # Prepare data
        lolo_ids = CustomerBill.objects.filter(pk__in=ids).values_list(
            "lolo_id", flat=True
        )
        handling_objects = (
            Handling.objects.select_related("container__size")
            .filter(pk__in=lolo_ids)
            .values("id", "container__size__name")
        )
        handling_df = pd.DataFrame(handling_objects)

        handling_df["qty"] = 1

        site_20_rate = 0
        site_40_rate = 0
        night_charge_20_rate = 0
        night_charge_40_rate = 0

        if (
            float(invoice.size_20_rate) == float(0)
            and float(invoice.size_40_rate) == float(0)
            and float(invoice.night_charge_size_20_rate) == float(0)
            and float(invoice.night_charge_size_40_rate) == float(0)
        ):
            if (
                invoice.client.type == "Line"
                and LineHandlingCharges.objects.filter(
                    ref_code=invoice.client.ref_code,
                    location=invoice.location,
                    site=invoice.site,
                ).exists()
            ):
                line_lolo_rate_obj = LineHandlingCharges.objects.filter(
                    ref_code=invoice.client.ref_code,
                    location=invoice.location,
                    site=invoice.site,
                ).first()
                site_20_rate = line_lolo_rate_obj.size_20_rate
                site_40_rate = line_lolo_rate_obj.size_40_rate
                night_charge_20_rate = line_lolo_rate_obj.night_charge_size_20_rate
                night_charge_40_rate = line_lolo_rate_obj.night_charge_size_40_rate
            else:
                site_20_rate = invoice.site.size_20_rate
                site_40_rate = invoice.site.size_40_rate
                night_charge_20_rate = invoice.site.night_charge_size_20_rate
                night_charge_40_rate = invoice.site.night_charge_size_40_rate
        else:
            site_20_rate = invoice.size_20_rate
            site_40_rate = invoice.size_40_rate
            night_charge_20_rate = invoice.night_charge_size_20_rate
            night_charge_40_rate = invoice.night_charge_size_40_rate

        if invoice.invoice_on_old_lolo_rate:
            if (
                invoice.client.type == "Line"
                and HandlingChargesHistory.objects.filter(
                    ref_code=invoice.client.ref_code,
                    client_type="Line",
                    location=invoice.location,
                    site=invoice.site,
                ).exists()
            ):
                lolo_rate_obj = HandlingChargesHistory.objects.filter(
                    ref_code=invoice.client.ref_code,
                    client_type="Line",
                    location=invoice.location,
                    site=invoice.site,
                ).first()
                site_20_rate = lolo_rate_obj.size_20_rate
                site_40_rate = lolo_rate_obj.size_40_rate
                night_charge_20_rate = lolo_rate_obj.night_charge_size_20_rate
                night_charge_40_rate = lolo_rate_obj.night_charge_size_40_rate

            if (
                invoice.client.type == "Party"
                and HandlingChargesHistory.objects.filter(
                    ref_code=None,
                    client_type="Party",
                    location=invoice.location,
                    site=invoice.site,
                ).exists()
            ):
                lolo_rate_obj = HandlingChargesHistory.objects.filter(
                    ref_code=None,
                    client_type="Party",
                    location=invoice.location,
                    site=invoice.site,
                ).first()

                site_20_rate = lolo_rate_obj.size_20_rate
                site_40_rate = lolo_rate_obj.size_40_rate
                night_charge_20_rate = lolo_rate_obj.night_charge_size_20_rate
                night_charge_40_rate = lolo_rate_obj.night_charge_size_40_rate

        handling_df["amount"] = np.where(
            handling_df["container__size__name"] == "20",
            float(site_20_rate),
            float(site_40_rate),
        )
        handling_df["bill_type"] = "Handling"
        handling_df["taxable_amount"] = handling_df["amount"] - (
            handling_df["amount"] * discount_value
        )

        # --------------------------------------------
        # Fin Account GST True or False
        # account = None
        # try:
        #     account = invoice.client.fin_account_customer
        # except:
        #     account = None
        # with_gst = True
        # if account is not None:
        #     with_gst = account.with_gst

        with_gst = invoice.apply_gst

        # ------------------------------------------

        if with_gst:
            if apply_igst:
                handling_df["igst_amount"] = handling_df["taxable_amount"] * float(0.18)
                handling_df["cgst_amount"] = 0
                handling_df["sgst_amount"] = 0

            else:
                handling_df["cgst_amount"] = handling_df["taxable_amount"] * float(0.09)
                handling_df["sgst_amount"] = handling_df["taxable_amount"] * float(0.09)
                handling_df["igst_amount"] = 0

        else:
            handling_df["cgst_amount"] = 0
            handling_df["sgst_amount"] = 0
            handling_df["igst_amount"] = 0

        handling_df["total_amount"] = (
            handling_df["taxable_amount"]
            + handling_df["cgst_amount"]
            + handling_df["sgst_amount"]
            + handling_df["igst_amount"]
        )
        # Merge data based on bill type and container size
        merged_df = (
            handling_df.groupby(["bill_type", "container__size__name"])
            .agg(
                {
                    "amount": "sum",
                    "taxable_amount": "sum",
                    "cgst_amount": "sum",
                    "sgst_amount": "sum",
                    "igst_amount": "sum",
                    "total_amount": "sum",
                    "qty": "sum",
                }
            )
            .reset_index()
        )
        merged_df["rate"] = np.where(
            merged_df["container__size__name"] == "20",
            float(site_20_rate),
            float(site_40_rate),
        )

        merged_df = merged_df.round(2)

        night_charge_objects = CustomerBill.objects.filter(
            lolo_id__in=lolo_ids, bill_type="Night Charge"
        ).values("id", "lolo_id", "bill_type")
        if night_charge_objects:
            night_charge_df = pd.DataFrame(night_charge_objects)

            night_charge_df["qty"] = 1
            handling_df["id"] = handling_df["id"].astype(str)

            night_charge_df["lolo_id"] = night_charge_df["lolo_id"].astype(str)
            night_charge_df = night_charge_df.merge(
                handling_df.rename(columns={"id": "lolo_id"})[
                    ["lolo_id", "container__size__name"]
                ],
                on="lolo_id",
                how="left",
            )
            night_charge_df["taxable_amount"] = np.where(
                night_charge_df["container__size__name"] == "20",
                float(night_charge_20_rate),
                float(night_charge_40_rate),
            )
            if with_gst:
                if apply_igst:
                    night_charge_df["igst_amount"] = night_charge_df[
                        "taxable_amount"
                    ] * float(0.18)
                    night_charge_df["cgst_amount"] = 0.0
                    night_charge_df["sgst_amount"] = 0.0
                else:
                    night_charge_df["cgst_amount"] = night_charge_df[
                        "taxable_amount"
                    ] * float(0.09)
                    night_charge_df["sgst_amount"] = night_charge_df[
                        "taxable_amount"
                    ] * float(0.09)
                    night_charge_df["igst_amount"] = 0.0
            else:
                night_charge_df["cgst_amount"] = 0.0
                night_charge_df["sgst_amount"] = 0.0
                night_charge_df["igst_amount"] = 0.0

            night_charge_df["total_amount"] = (
                night_charge_df["taxable_amount"]
                + night_charge_df["cgst_amount"]
                + night_charge_df["sgst_amount"]
                + night_charge_df["igst_amount"]
            )

            night_charge_merge = (
                night_charge_df.groupby(["bill_type", "container__size__name"])
                .agg(
                    {
                        "taxable_amount": "sum",
                        "cgst_amount": "sum",
                        "sgst_amount": "sum",
                        "igst_amount": "sum",
                        "total_amount": "sum",
                        "qty": "sum",
                    }
                )
                .reset_index()
            )
            night_charge_merge["rate"] = np.where(
                night_charge_merge["container__size__name"] == "20",
                float(night_charge_20_rate),
                float(night_charge_40_rate),
            )
            night_charge_merge["amount"] = np.where(
                night_charge_merge["container__size__name"] == "20",
                float(night_charge_20_rate),
                float(night_charge_40_rate),
            )

            night_charge_merge = night_charge_merge.round(2)

        if night_charge_objects:
            res = pd.concat([merged_df, night_charge_merge], ignore_index=True)
        else:
            res = merged_df
        # Add cgst, sgst, igst rates and other details
        if with_gst:
            if apply_igst:
                res["cgst_rate"] = "0%"
                res["sgst_rate"] = "0%"
                res["igst_rate"] = "18%"
            else:

                res["cgst_rate"] = "9%"
                res["sgst_rate"] = "9%"
                res["igst_rate"] = "0%"
        else:
            res["cgst_rate"] = "0%"
            res["sgst_rate"] = "0%"
            res["igst_rate"] = "0%"

        res["hsn_code"] = hsn_code
        res["disc"] = discount if discount else "0"
        if is_multiple_container:
            res["bill_type"] = np.where(
                res["bill_type"] == "Handling",
                "MNR (Lift-On & Lift-Off) ",
                "Night Charge",
            )
        else:
            container_no = invoice_qs.first().container_no
            res["bill_type"] = np.where(
                res["bill_type"] == "Handling",
                f"MNR (Lift-On & Lift-Off) {container_no}",
                f"Night Charge {container_no}",
            )
        res = res.rename(
            columns={
                "container__size__name": "uom",
                "bill_type": "charge_type",
            }
        )
        return res

    def getNightChargePrintInvoiceData(
        self,
        ids,
        invoice,
        apply_igst,
        discount,
        discount_value,
        hsn_code,
        night_charge_20_rate,
        night_charge_40_rate,
        is_multiple_container,
        invoice_qs,
    ):
        lolo_ids = CustomerBill.objects.filter(pk__in=ids).values_list(
            "lolo_id", flat=True
        )
        handling_objects = Handling.objects.filter(
            pk__in=lolo_ids, is_night_charges_applied=True
        ).values("id", "container__size__name")
        night_charge_df = pd.DataFrame(handling_objects)

        night_charge_df["qty"] = 1

        night_charge_df["amount"] = np.where(
            night_charge_df["container__size__name"] == "20",
            float(night_charge_20_rate),
            float(night_charge_40_rate),
        )
        night_charge_df["bill_type"] = "Night Charge"
        night_charge_df["taxable_amount"] = night_charge_df["amount"] - (
            night_charge_df["amount"] * discount_value
        )

        # --------------------------------------------
        # Fin Account GST True or False
        # account = None
        # try:
        #     account = invoice.client.fin_account_customer
        # except:
        #     account = None
        # with_gst = True
        # if account is not None:
        #     with_gst = account.with_gst

        with_gst = invoice.apply_gst

        # ------------------------------------------

        if with_gst:
            if apply_igst:
                night_charge_df["igst_amount"] = night_charge_df[
                    "taxable_amount"
                ] * float(0.18)
                night_charge_df["cgst_amount"] = 0
                night_charge_df["sgst_amount"] = 0

            else:
                night_charge_df["cgst_amount"] = night_charge_df[
                    "taxable_amount"
                ] * float(0.09)
                night_charge_df["sgst_amount"] = night_charge_df[
                    "taxable_amount"
                ] * float(0.09)
                night_charge_df["igst_amount"] = 0
        else:
            night_charge_df["cgst_amount"] = 0
            night_charge_df["sgst_amount"] = 0
            night_charge_df["igst_amount"] = 0

        night_charge_df["total_amount"] = (
            night_charge_df["taxable_amount"]
            + night_charge_df["cgst_amount"]
            + night_charge_df["sgst_amount"]
            + night_charge_df["igst_amount"]
        )
        # Merge data based on bill type and container size
        res = (
            night_charge_df.groupby(["bill_type", "container__size__name"])
            .agg(
                {
                    "amount": "sum",
                    "taxable_amount": "sum",
                    "cgst_amount": "sum",
                    "sgst_amount": "sum",
                    "igst_amount": "sum",
                    "total_amount": "sum",
                    "qty": "sum",
                }
            )
            .reset_index()
        )
        res["rate"] = np.where(
            res["container__size__name"] == "20",
            float(night_charge_20_rate),
            float(night_charge_40_rate),
        )

        res = res.round(2)

        # Add cgst, sgst, igst rates and other details
        if with_gst:
            if apply_igst:
                res["cgst_rate"] = "0%"
                res["sgst_rate"] = "0%"
                res["igst_rate"] = "18%"
            else:
                res["cgst_rate"] = "9%"
                res["sgst_rate"] = "9%"
                res["igst_rate"] = "0%"
        else:
            res["cgst_rate"] = "0%"
            res["sgst_rate"] = "0%"
            res["igst_rate"] = "0%"

        res["hsn_code"] = hsn_code
        res["disc"] = discount if discount else "0"
        if is_multiple_container:
            res["bill_type"] = np.where(
                res["bill_type"] == "Handling",
                "MNR (Lift-On & Lift-Off) ",
                "Night Charge",
            )
        else:
            container_no = invoice_qs.first().container_no
            res["bill_type"] = np.where(
                res["bill_type"] == "Handling",
                f"MNR (Lift-On & Lift-Off) {container_no}",
                f"Night Charge {container_no}",
            )
        res = res.rename(
            columns={
                "container__size__name": "uom",
                "bill_type": "charge_type",
            }
        )
        return res

    def getTransportationPrintInvoiceData(
        self, ids, invoice_qs, apply_igst, discount, hsn_code, is_multiple_container
    ):
        st_ids = CustomerBill.objects.filter(pk__in=ids).values_list("st_id", flat=True)
        st_objects = SelfTransportation.objects.filter(pk__in=st_ids).values(
            "id", "container__size__name", "container__container_no"
        )
        st_df = pd.DataFrame(st_objects)
        invoice_objects = invoice_qs.values(
            "id", "bill_id", "rec_amount", "container_no"
        )
        invoice_df_st = pd.DataFrame(invoice_objects)

        invoice_df_st["qty"] = 1
        if is_multiple_container:
            invoice_df_st["bill_type"] = "Transportation"
        else:
            invoice_df_st["bill_type"] = (
                f"Transportation {invoice_qs.first().container_no}"
            )
        invoice_df_st["taxable_amount"] = invoice_df_st["rec_amount"].astype(
            float
        ) / float(1.18)
        invoice_df_st["amount"] = invoice_df_st["taxable_amount"]
        invoice_df_st["rate"] = invoice_df_st["taxable_amount"]
        invoice_df_st = invoice_df_st.rename(columns={"rec_amount": "total_amount"})
        invoice_df_st["size"] = st_df["container__size__name"]

        if apply_igst:
            invoice_df_st["igst_amount"] = invoice_df_st["taxable_amount"] * float(0.18)
            invoice_df_st["cgst_amount"] = 0
            invoice_df_st["sgst_amount"] = 0

        else:
            invoice_df_st["cgst_amount"] = invoice_df_st["taxable_amount"] * float(0.09)
            invoice_df_st["sgst_amount"] = invoice_df_st["taxable_amount"] * float(0.09)
            invoice_df_st["igst_amount"] = 0
        # Merge data based on bill type and container size
        res = (
            invoice_df_st.groupby(["bill_type", "size"])
            .agg(
                {
                    "amount": "sum",
                    "taxable_amount": "sum",
                    "cgst_amount": "sum",
                    "sgst_amount": "sum",
                    "igst_amount": "sum",
                    "total_amount": "sum",
                    "qty": "sum",
                }
            )
            .reset_index()
        ).round(2)

        if apply_igst:

            res["cgst_rate"] = "0%"
            res["sgst_rate"] = "0%"
            res["igst_rate"] = "18%"
        else:

            res["cgst_rate"] = "9%"
            res["sgst_rate"] = "9%"
            res["igst_rate"] = "0%"

        res["hsn_code"] = hsn_code
        res["disc"] = discount if discount else "0"

        res = res.rename(
            columns={
                "size": "uom",
                "bill_type": "charge_type",
            }
        )

        return res

    def getMnrDataForPrintInvoice(self, invoice, apply_igst, hsn_code, sales_term):
        mnr_qs = MNRInvoiceLine.objects.select_related("parent").filter(parent=invoice)
        mnr_data = mnr_qs.values(
            "total_amount_after_discount",
            "size",
            "process",
            "discount",
            "total_amount",
            "bill_count",
        )
        df = pd.DataFrame(mnr_data)

        df["hsn_code"] = hsn_code
        df["rate"] = 0
        # Apply igst tax if apply igst is true else cgst and sgst
        if sales_term:
            df["igst_amount"] = 0
            df["cgst_amount"] = 0
            df["sgst_amount"] = 0
        elif apply_igst:
            df["igst_amount"] = df["total_amount_after_discount"] * (0.18)
            df["cgst_amount"] = 0
            df["sgst_amount"] = 0
        else:
            df["cgst_amount"] = df["total_amount_after_discount"] * Decimal(0.09)
            df["sgst_amount"] = df["total_amount_after_discount"] * Decimal(0.09)
            df["igst_amount"] = 0

        df = df.rename(
            columns={
                "size": "uom",
                "process": "charge_type",
                "discount": "disc",
                "total_amount_after_discount": "taxable_amount",
                "bill_count": "qty",
                "total_amount": "amount",
            }
        )
        # Calculate total amount
        df["total_amount"] = (
            df["taxable_amount"] + df["cgst_amount"] + df["sgst_amount"]
        )
        # Round the values to 2 decimal places
        df[["cgst_amount", "sgst_amount", "total_amount"]] = (
            df[["cgst_amount", "sgst_amount", "total_amount"]].astype(float).round(2)
        )
        return df

    def getContextData(
        self,
        invoice,
        location_icon,
        location,
        site,
        bill_to_party_client,
        ship_to_party_client,
        overall_taxable_amount,
        overall_tax_amount,
        total_amount,
        new_list,
        from_supply_date,
        to_supply_date,
        is_multiple_container,
        bill_date,
    ):
        from_supply_date_formatted = ""
        to_supply_date_formatted = ""
        # if not is_multiple_container:
        #     bill_date = (
        #         formats.date_format(invoice.supply_date, "d/m/Y")
        #         if invoice.supply_date
        #         else formats.date_format(datetime.now().date(), "d/m/Y")
        #     )
        if from_supply_date is not None and to_supply_date is not None:
            from_supply_date_formatted = formats.date_format(from_supply_date, "d/m/Y")
            to_supply_date_formatted = formats.date_format(to_supply_date, "d/m/Y")
        else:
            if not is_multiple_container:
                bill_date = (
                    formats.date_format(invoice.supply_date, "d/m/Y")
                    if invoice.supply_date
                    else formats.date_format(datetime.now().date(), "d/m/Y")
                )
            else:
                bill_date = None

        return {
            "invoice_no": invoice.invoice_no,
            "invoice_date": formats.date_format(invoice.invoice_date, "d/m/Y"),
            "location_state": location.name,
            "location_lut_no": location.lut_no,
            "location_gst_no": location.gst_no,
            "location_icon": location_icon,
            "location_state_code": location.gst_no[:2] if location.gst_no else "",
            "site_address": site.address,
            "site_contact": site.contact,
            "ref_booking_no": invoice.ref_booking_no,
            "ref_bl_no": invoice.ref_bl_no,
            "place_of_supply": invoice.place_of_supply,
            "supply_date": (
                f"{from_supply_date_formatted} to {to_supply_date_formatted}"
                if from_supply_date is not None and to_supply_date is not None
                else bill_date
            ),
            "main_client": invoice.client.name,
            "is_sez": invoice.client.is_sez,
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
            "total_taxable_amount": round(overall_taxable_amount, 2),
            "total_cgst_amount": (
                (0)
                if invoice.apply_igst
                else round(
                    (overall_tax_amount / (2)),
                    2,
                )
            ),
            "total_sgst_amount": (
                (0)
                if invoice.apply_igst
                else round(
                    (overall_tax_amount / (2)),
                    2,
                )
            ),
            "total_igst_amount": (
                round(overall_tax_amount, 2) if invoice.apply_igst else (0)
            ),
            "grand_total_amount": round(total_amount),
            "grand_total_client_discount": float(invoice.client_discount),
            "grand_total_amount_after_client_discount": round(
                float(total_amount) - float(invoice.client_discount)
            ),
            "grand_total_amount_word": "Rupees "
            + (
                str(
                    num2words(
                        round(float(total_amount) - float(invoice.client_discount))
                    )
                ).title()
            ).replace(",", "")
            + " Only/-",
            "total_tax_amount": round(overall_tax_amount, 2),
            "invoice_line": new_list,
            "remark": invoice.remark,
            "bank_name": site.bank_name if site.bank_name else "",
            "account_no": site.bank_account_no if site.bank_account_no else "",
            "ifsc_code": site.ifsc_code if site.ifsc_code else "",
            "bank_branch": site.bank_branch if site.bank_branch else "",
            "organization": site.organization if site.organization else "",
        }

    def adjustCustomerBills(self, each):
        customer_bill = CustomerBill.objects.get(pk=each.bill_id)
        customer_bill.is_payment_completed = False
        customer_bill.remaining_amount = (
            customer_bill.remaining_amount + each.rec_amount
        )
        customer_bill.save(update_fields=["is_payment_completed", "remaining_amount"])
        if customer_bill.lolo_id:
            lolo_obj = Handling.objects.get(pk=customer_bill.lolo_id)
            if customer_bill.bill_type == "Night Charge":
                lolo_obj.is_night_charge_bill_invoiced = False
                lolo_obj.save(update_fields=["is_night_charge_bill_invoiced"])
            else:
                lolo_obj.is_invoiced = False
                lolo_obj.is_amt_editable = True
                lolo_obj.save(update_fields=["is_invoiced", "is_amt_editable"])
        if customer_bill.st_id:
            st_obj = SelfTransportation.objects.get(pk=customer_bill.st_id)
            st_obj.is_amt_editable = True
            st_obj.is_invoiced = False
            st_obj.save(update_fields=["is_amt_editable", "is_invoiced"])

    def getOrCreateClient(self, client_child_company_pk, **data):

        if client_child_company_pk:
            client_child_company_object = ClientChildCompany.getById(
                client_child_company_pk
            )
            client_child_company_object.name = data["name"]
            client_child_company_object.address = data["address"]
            client_child_company_object.state = data["state"]
            client_child_company_object.gst_no = data["gst_no"]
            client_child_company_object.state_code = data["state_code"]
            client_child_company_object.zip_code = data["zip_code"]
            client_child_company_object.save()
        else:
            client_child_company_object = ClientChildCompany.objects.create(
                parent=data["client"],
                name=data["name"],
                address=data["address"],
                state=data["state"],
                gst_no=data["gst_no"],
                zip_code=data["zip_code"],
                state_code=data["state_code"],
            )
        return client_child_company_object

    def getBillToPartyClient(self, data, client):
        bill_to_party_client_object = self.getOrCreateClient(
            data["bill_to_party_client_pk"],
            client=client,
            name=data["bill_to_party_client"],
            address=data["bill_to_party_address"],
            state=data["bill_to_party_state"],
            state_code=data["bill_to_party_state_code"],
            gst_no=data["bill_to_party_gst_no"],
            zip_code=data["bill_to_party_zip_code"],
        )

        bill_to_party_client_object.save()
        return bill_to_party_client_object

    def getShipToPartyClient(self, data, bill_to_party_client_object, client):
        ship_to_party_client_object = None
        if (
            data["ship_to_party_client_pk"]
            and int(data["ship_to_party_client_pk"]) == bill_to_party_client_object.pk
        ):
            ship_to_party_client_object = bill_to_party_client_object
        elif data["ship_to_party_client"]:
            if (
                data["ship_to_party_client"] == bill_to_party_client_object.name
                and data["ship_to_party_state"] == bill_to_party_client_object.state
                and data["ship_to_party_zip_code"]
                == bill_to_party_client_object.zip_code
            ):
                ship_to_party_client_object = bill_to_party_client_object
            else:
                ship_to_party_client_object = self.getOrCreateClient(
                    data.get("ship_to_party_client_pk"),
                    client=client,
                    name=data.get("ship_to_party_client"),
                    address=data.get("ship_to_party_address"),
                    state=data.get("ship_to_party_state"),
                    state_code=data.get("ship_to_party_state_code"),
                    gst_no=data.get("ship_to_party_gst_no"),
                    zip_code=data.get("ship_to_party_zip_code"),
                )
                ship_to_party_client_object.save()

        return ship_to_party_client_object

    def createLineObjects(self, customer_bill, each_line):
        invoice_line = CustomerBillInvoiceLine.create(
            parent=customer_bill, data=each_line
        )
        invoice_line.save()

    def modifyCustomerBills(self, each_line, customer_bill):
        bill = CustomerBill.objects.get(pk=each_line["bill_id"])

        if bill.lolo_id:
            lolo_obj = Handling.objects.get(pk=bill.lolo_id)
            if lolo_obj.is_night_charges_applied and bill.bill_type == "Night Charge":
                lolo_obj.is_night_charge_bill_invoiced = True
                lolo_obj.save(update_fields=["is_night_charge_bill_invoiced"])
            if bill.bill_type == "Handling":
                lolo_obj.is_invoiced = True
                lolo_obj.is_amt_editable = False
                lolo_obj.save(update_fields=["is_invoiced", "is_amt_editable"])

        if bill.st_id:
            st_obj = SelfTransportation.objects.get(pk=bill.st_id)
            st_obj.is_invoiced = True
            st_obj.is_amt_editable = False
            st_obj.save(update_fields=["is_invoiced", "is_amt_editable"])
        if bill.survey_id:
            survey_id = Survey.objects.get(pk=bill.survey_id)
            survey_id.invoice_id = customer_bill.pk
            survey_id.save(update_fields=["invoice_id"])

        bill.remaining_amount = float(bill.remaining_amount) - float(
            each_line["rec_amount"]
        )
        bill.save(update_fields=["remaining_amount"])
        if bill.remaining_amount == float(0):
            bill.is_payment_completed = True
            bill.save(update_fields=["is_payment_completed"])

    def createInvoice(self, data, client, location, site):
        bill_to_party_client_object = self.getBillToPartyClient(data, client)
        ship_to_party_client_object = self.getShipToPartyClient(
            data, bill_to_party_client_object, client
        )
        customer_bill = CustomerBillInvoice.create(
            client=client,
            bill_to_party_client=bill_to_party_client_object,
            ship_to_party_client=ship_to_party_client_object,
            apply_igst=data["apply_igst"],
            apply_gst=data["apply_gst"],
            location=location,
            site=site,
            data=data,
        )
        customer_bill.save()
        total_amount = float(0)
        for each_line in data["invoice_lines"]:
            total_amount = float(total_amount) + float(each_line["rec_amount"])
            self.createLineObjects(customer_bill, each_line)
            self.modifyCustomerBills(each_line, customer_bill)
        customer_bill.total_amount = float(total_amount)
        customer_bill.save(update_fields=["total_amount"])

        # locking the current rate
        site_20_rate = 0
        site_40_rate = 0
        night_charge_20_rate = 0
        night_charge_40_rate = 0

        if (
            client.type == "Line"
            and LineHandlingCharges.objects.filter(
                ref_code=client.ref_code, location=location, site=site
            ).exists()
        ):
            line_lolo_rate_obj = LineHandlingCharges.objects.filter(
                ref_code=client.ref_code, location=location, site=site
            ).first()

            site_20_rate = line_lolo_rate_obj.size_20_rate
            site_40_rate = line_lolo_rate_obj.size_40_rate
            night_charge_20_rate = line_lolo_rate_obj.night_charge_size_20_rate
            night_charge_40_rate = line_lolo_rate_obj.night_charge_size_40_rate
        else:
            site_20_rate = site.size_20_rate
            site_40_rate = site.size_40_rate
            night_charge_20_rate = site.night_charge_size_20_rate
            night_charge_40_rate = site.night_charge_size_40_rate

        customer_bill.size_20_rate = site_20_rate
        customer_bill.size_40_rate = site_40_rate
        customer_bill.night_charge_size_20_rate = night_charge_20_rate
        customer_bill.night_charge_size_40_rate = night_charge_40_rate
        customer_bill.save()

        return customer_bill

    def validateInvoiceLines(self, data, method):

        for each in data:
            recieved_amount = float(each["rec_amount"])
            remaining_amount = float(each["remaining_amount"])

            if recieved_amount < float(0):
                raise ValidationError("Recieved Amount cannot be negative or zero")

            if recieved_amount > remaining_amount and method == "POST":
                raise ValidationError(
                    "Received Amount cannot be greater than Remaining Amount"
                )

    def updateInvoice(self, data, client, invoice_lines, customer_bill, location, site):
        bill_to_party_client_object = self.getBillToPartyClient(data, client)
        ship_to_party_client_object = self.getShipToPartyClient(
            data, bill_to_party_client_object, client
        )
        total_amount = float(0)
        sum_of_recieved_amount = float(0)

        for each_line in invoice_lines:
            sum_of_recieved_amount = sum_of_recieved_amount + float(
                each_line["rec_amount"]
            )
            line = CustomerBillInvoiceLine.objects.get(pk=each_line["pk"])
            bill = CustomerBill.objects.get(pk=each_line["bill_id"])
            if not float(each_line["rec_amount"]) == float(line.rec_amount):
                total_amount = total_amount + float(each_line["rec_amount"])

                bill.is_payment_completed = False
                bill.remaining_amount = float(bill.remaining_amount) + float(
                    line.rec_amount
                )
                bill.save(update_fields=["remaining_amount", "is_payment_completed"])
                line.remaining_amount = float(line.remaining_amount) + float(
                    line.rec_amount
                )
                line.save(update_fields=["remaining_amount"])
                line.container_no = each_line["container_no"]
                line.original_amount = each_line["original_amount"]
                line.rec_amount = each_line["rec_amount"]
                line.remaining_amount = float(line.remaining_amount) - float(
                    each_line["rec_amount"]
                )
                line.save(
                    update_fields=[
                        "container_no",
                        "rec_amount",
                        "remaining_amount",
                        "original_amount",
                    ]
                )
                bill.remaining_amount = float(bill.remaining_amount) - float(
                    each_line["rec_amount"]
                )
                bill.save(update_fields=["remaining_amount"])
                if bill.remaining_amount == float(0):
                    bill.is_payment_completed = True
                    bill.save(update_fields=["is_payment_completed"])

        customer_bill.invoice_no = data["invoice_label"] + data["invoice_no"]
        customer_bill.invoice_date = datetime.strptime(
            data["invoice_date"], "%d/%m/%Y"
        ).date()
        customer_bill.bill_type = data["bill_type"]
        customer_bill.hsn_code = data["hsn_code"]
        customer_bill.client = client
        customer_bill.ref_booking_no = data["ref_booking_no"]
        customer_bill.ref_bl_no = data["ref_bl_no"]
        customer_bill.place_of_supply = data["place_of_supply"]
        customer_bill.supply_date = (
            datetime.strptime(data["supply_date"], "%d/%m/%Y").date()
            if data["supply_date"]
            else None
        )

        customer_bill.apply_igst = data["apply_igst"]
        customer_bill.apply_gst = data["apply_gst"]
        customer_bill.bill_to_party_client = bill_to_party_client_object
        customer_bill.ship_to_party_client = ship_to_party_client_object
        customer_bill.total_amount = float(sum_of_recieved_amount)
        customer_bill.remark = data["remark"]
        customer_bill.location = location
        customer_bill.site = site
        customer_bill.is_transaction_effected = True
        customer_bill.discount = data["discount"]
        customer_bill.client_discount = data.get("client_discount", 0)
        customer_bill.invoice_on_old_lolo_rate = data.get(
            "invoice_on_old_lolo_rate", False
        )
        customer_bill.save()

    def getDfDataForExcelStatement(self, lines, data, bill_type, parent):
        invoice_date_str = parent.invoice_date.strftime("%d/%m/%Y")
        parent_location = parent.location.name
        parent_invoice_no = parent.invoice_no
        is_igst_applied = parent.apply_igst
        party_name = parent.bill_to_party_client.name
        main_data = {
            "Sr.No": [],
            "Location": [],
            "Invoice Date": [],
            "Container No": [],
            "Gate IN OUT Date": [],
            "GST No": [],
            "Invoice No": [],
            "Party Name": [],
            "Payment Type": [],
            "Taxable Amount": [],
            "CGST Amount": [],
            "SGST Amount": [],
            "IGST Amount": [],
            "Received Amount": [],
            "Original Amount": [],
        }

        site_20_rate = 0
        site_40_rate = 0
        night_charge_20_rate = 0
        night_charge_40_rate = 0

        if (
            float(parent.size_20_rate) == float(0)
            and float(parent.size_40_rate) == float(0)
            and float(parent.night_charge_size_20_rate) == float(0)
            and float(parent.night_charge_size_40_rate) == float(0)
        ):
            if (
                parent.client.type == "Line"
                and LineHandlingCharges.objects.filter(
                    ref_code=parent.client.ref_code,
                    location=parent.location,
                    site=parent.site,
                ).exists()
            ):
                line_lolo_rate_obj = LineHandlingCharges.objects.filter(
                    ref_code=parent.client.ref_code,
                    location=parent.location,
                    site=parent.site,
                ).first()
                site_20_rate = line_lolo_rate_obj.size_20_rate
                site_40_rate = line_lolo_rate_obj.size_40_rate
                night_charge_20_rate = line_lolo_rate_obj.night_charge_size_20_rate
                night_charge_40_rate = line_lolo_rate_obj.night_charge_size_40_rate
            else:
                site_20_rate = parent.site.size_20_rate
                site_40_rate = parent.site.size_40_rate
                night_charge_20_rate = parent.site.night_charge_size_20_rate
                night_charge_40_rate = parent.site.night_charge_size_40_rate
        else:
            site_20_rate = parent.size_20_rate
            site_40_rate = parent.size_40_rate
            night_charge_20_rate = parent.night_charge_size_20_rate
            night_charge_40_rate = parent.night_charge_size_40_rate

        if parent.invoice_on_old_lolo_rate:
            if (
                parent.client.type == "Line"
                and HandlingChargesHistory.objects.filter(
                    ref_code=parent.client.ref_code,
                    client_type="Line",
                    location=parent.location,
                    site=parent.site,
                ).exists()
            ):
                lolo_rate_obj = HandlingChargesHistory.objects.filter(
                    ref_code=parent.client.ref_code,
                    client_type="Line",
                    location=parent.location,
                    site=parent.site,
                ).first()
                site_20_rate = lolo_rate_obj.size_20_rate
                site_40_rate = lolo_rate_obj.size_40_rate
                night_charge_20_rate = lolo_rate_obj.night_charge_size_20_rate
                night_charge_40_rate = lolo_rate_obj.night_charge_size_40_rate

            if (
                parent.client.type == "Party"
                and HandlingChargesHistory.objects.filter(
                    ref_code=None,
                    client_type="Party",
                    location=parent.location,
                    site=parent.site,
                ).exists()
            ):
                lolo_rate_obj = HandlingChargesHistory.objects.filter(
                    ref_code=None,
                    client_type="Party",
                    location=parent.location,
                    site=parent.site,
                ).first()

                site_20_rate = lolo_rate_obj.size_20_rate
                site_40_rate = lolo_rate_obj.size_40_rate
                night_charge_20_rate = lolo_rate_obj.night_charge_size_20_rate
                night_charge_40_rate = lolo_rate_obj.night_charge_size_40_rate
        # --------------------------------------------
        # Fin Account GST True or False
        # account = None
        # try:
        #     account = parent.client.fin_account_customer
        # except:
        #     account = None
        # with_gst = True
        # if account is not None:
        #     with_gst = account.with_gst

        with_gst = parent.apply_gst

        # ------------------------------------------

        for count, (line, each) in enumerate(zip(lines, data), start=1):
            if bill_type in ["Handling", "Night Charge"]:
                if GateInHistory.objects.filter(lolo=each).exists():
                    in_history = GateInHistory.objects.select_related(
                        "container", "gate_in"
                    ).get(lolo=each)

                    in_out_date = in_history.gate_in.in_date.strftime("%d/%m/%Y")
                else:
                    out_history = GateOutHistory.objects.select_related(
                        "container", "gate_out"
                    ).get(lolo=each)
                    in_out_date = out_history.gate_out.out_date.strftime("%d/%m/%Y")

            elif bill_type in ["Transportation"]:
                if GateInHistory.objects.filter(st=each).exists():
                    in_history = GateInHistory.objects.select_related(
                        "container", "gate_in"
                    ).get(st=each)

                    in_out_date = in_history.gate_in.in_date.strftime("%d/%m/%Y")
                else:
                    out_history = GateOutHistory.objects.select_related(
                        "container", "gate_out"
                    ).get(st=each)
                    in_out_date = out_history.gate_out.out_date.strftime("%d/%m/%Y")

            bill = CustomerBill.objects.get(pk=line["bill_id"])
            if bill_type in ["Handling"]:
                taxable_amount = (
                    float(site_20_rate)
                    if each.container.size.name == "20"
                    else float(site_40_rate)
                )
                tax = 0
                if with_gst:
                    tax = 0.18
                tax_amount = taxable_amount * tax
            elif bill_type in ["Night Charge", "Transportation"]:
                taxable_amount = float(line["rec_amount"]) / 0.18
                tax_amount = float(line["rec_amount"]) - taxable_amount
            cgst_sgst = 0 if is_igst_applied else round(tax_amount / 2, 2)
            igst = round(tax_amount, 2) if is_igst_applied else 0
            received_amt = taxable_amount + tax_amount

            main_data["Sr.No"].append(count)
            main_data["Location"].append(parent_location)
            main_data["Invoice Date"].append(invoice_date_str)
            main_data["Container No"].append(line["container_no"])
            main_data["Gate IN OUT Date"].append(in_out_date)
            main_data["GST No"].append("")
            main_data["Invoice No"].append(parent_invoice_no)
            main_data["Party Name"].append(party_name)
            main_data["Payment Type"].append(bill.payment_type)
            main_data["Taxable Amount"].append(round(taxable_amount, 2))
            main_data["CGST Amount"].append(cgst_sgst)
            main_data["SGST Amount"].append(cgst_sgst)
            main_data["IGST Amount"].append(igst)
            main_data["Received Amount"].append(round(received_amt, 2))
            main_data["Original Amount"].append(round(received_amt, 2))

        df = pd.DataFrame(main_data)
        total_original_amount = df["Original Amount"].sum()
        total_received_amount = df["Received Amount"].sum()
        df = pd.concat(
            [
                df,
                pd.DataFrame(
                    {
                        "Received Amount": [
                            np.nan,
                            "TOTAL INVOICE AMOUNT",
                            "TOTAL RECEIVED AMOUNT",
                            "TOTAL REMAINING AMOUNT",
                        ],
                        "Original Amount": [
                            np.nan,
                            round(total_original_amount),
                            round(total_received_amount),
                            round(total_original_amount - total_received_amount),
                        ],
                    },
                    index=range(len(df), len(df) + 4),
                ),
            ]
        )

        return df

    def getMnrDfDataForExcelStatement(self, data, parent):
        main_data = {
            "Sr.No": [],
            "Container No": [],
            "Size": [],
            "Line": [],
            "Labour Cost": [],
            "Material Cost": [],
            "Washing Cost": [],
            "Total Cost": [],
        }
        for count, each in enumerate(data, start=1):
            labour_cost = 0
            material_cost = 0
            cleaning_cost = 0
            survey_line = SurveyLine.objects.filter(
                parent__pk=each["survey_id"]
            ).values("labour_cost", "material_cost", "wash_clean_tariff")
            for each_survey in survey_line:
                if each_survey["wash_clean_tariff"] == 0:
                    labour_cost += each_survey["labour_cost"]
                    material_cost += each_survey["material_cost"]
                else:
                    cleaning_cost += each_survey["material_cost"]

            model = Container if parent.site.type == "DEPOT" else NonDepotContainer

            container = (
                model.objects.select_related("type", "size")
                .filter(
                    container_no=each["container_no"],
                    location=parent.location,
                    site=parent.site,
                )
                .values(
                    "size__name",
                    "type__name",
                )
                .first()
            )

            main_data["Sr.No"].append(count)
            main_data["Container No"].append(each["container_no"])
            main_data["Size"].append(
                f"{container['size__name']}{container['type__name']}"
            )
            main_data["Line"].append(parent.client.name)
            main_data["Labour Cost"].append(
                labour_cost if each["bill_type"] == "Repair" else 0
            )
            main_data["Material Cost"].append(
                (material_cost if each["bill_type"] == "Repair" else 0)
            )
            main_data["Washing Cost"].append(
                (cleaning_cost if each["bill_type"] == "Washing/Cleaning" else 0)
            )
            main_data["Total Cost"].append(each["original_amount"])

        df = pd.DataFrame(main_data)

        total_labour_cost = df["Labour Cost"].sum()
        total_material_cost = df["Material Cost"].sum()
        total_cleaning_cost = df["Washing Cost"].sum()
        total_amount = df["Total Cost"].sum()

        df = pd.concat(
            [
                df,
                pd.DataFrame(
                    {
                        "Line": [np.nan, "TOTAL"],
                        "Labour Cost": [np.nan, round(total_labour_cost, 2)],
                        "Material Cost": [np.nan, round(total_material_cost, 2)],
                        "Washing Cost": [np.nan, round(total_cleaning_cost, 2)],
                        "Total Cost": [np.nan, round(total_amount, 2)],
                    },
                ),
            ]
        )

        return df

    def generateExcel(self, main_data):
        base_temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(base_temp_dir, exist_ok=True)
        temp_file_path = os.path.join(base_temp_dir, "billing_statement.xlsx")
        billing_workbook = xlsxwriter.Workbook(temp_file_path)
        billing_workbook.add_worksheet("billing_statement")
        billing_workbook.close()

        # New Version code
        book = load_workbook(temp_file_path)
        with pd.ExcelWriter(
            temp_file_path,
            engine="openpyxl",
            mode="a",
            if_sheet_exists="replace",
        ) as writer:
            main_data.to_excel(writer, sheet_name="billing_statement", index=False)

        return temp_file_path

    def getQuerysetDataForBillingStatement(self, bill_type, parent):
        if bill_type in ["Handling", "Night Charge"]:

            lines = CustomerBillInvoiceLine.objects.filter(parent=parent).values(
                "bill_id", "rec_amount", "container_no"
            )
            bill_ids = [line["bill_id"] for line in lines]
            lolo_ids = [
                bill["lolo_id"]
                for bill in CustomerBill.objects.filter(pk__in=bill_ids).values(
                    "lolo_id"
                )
            ]
            data = Handling.objects.select_related(
                "container__site", "container__size"
            ).filter(pk__in=lolo_ids)

        elif bill_type in ["Transportation"]:
            lines = CustomerBillInvoiceLine.objects.filter(parent=parent).values(
                "bill_id", "rec_amount", "container_no"
            )
            bill_ids = [line["bill_id"] for line in lines]
            st_ids = [
                bill["st_id"]
                for bill in CustomerBill.objects.filter(pk__in=bill_ids).values("st_id")
            ]
            data = SelfTransportation.objects.select_related(
                "container__site", "container__size"
            ).filter(pk__in=st_ids)
        else:
            lines = MNRInvoiceLine.objects.filter(parent=parent)
            bill_ids = [
                each for line in lines for each in ast.literal_eval(line.bill_ids)
            ]
            data = CustomerBill.objects.filter(pk__in=bill_ids).values(
                "survey_id", "container_no", "bill_type", "original_amount"
            )
        return data, lines

    def getHandlingDataForBillingStatement(
        self,
        location_str,
        invoice_date_str,
        gst_no_str,
        invoice_no_str,
        party_name_str,
        apply_igst,
        invoice_line,
        user_data_dict,
    ):
        invoice_line_data = []
        context = {
            "company_name": user_data_dict["company_name"],
            "company_address": user_data_dict["company_address"],
        }
        total_original_amount = float(0)
        total_received_amount = float(0)

        for each in invoice_line:

            site_20_rate = 0
            site_40_rate = 0
            night_charge_20_rate = 0
            night_charge_40_rate = 0

            if (
                float(each.parent.size_20_rate) == float(0)
                and float(each.parent.size_40_rate) == float(0)
                and float(each.parent.night_charge_size_20_rate) == float(0)
                and float(each.parent.night_charge_size_40_rate) == float(0)
            ):
                if (
                    each.parent.client.type == "Line"
                    and LineHandlingCharges.objects.filter(
                        ref_code=each.parent.client.ref_code,
                        location=each.parent.location,
                        site=each.parent.site,
                    ).exists()
                ):
                    line_lolo_rate_obj = LineHandlingCharges.objects.filter(
                        ref_code=each.parent.client.ref_code,
                        location=each.parent.location,
                        site=each.parent.site,
                    ).first()
                    site_20_rate = line_lolo_rate_obj.size_20_rate
                    site_40_rate = line_lolo_rate_obj.size_40_rate
                    night_charge_20_rate = line_lolo_rate_obj.night_charge_size_20_rate
                    night_charge_40_rate = line_lolo_rate_obj.night_charge_size_40_rate
                else:
                    site_20_rate = each.parent.site.size_20_rate
                    site_40_rate = each.parent.site.size_40_rate
                    night_charge_20_rate = each.parent.site.night_charge_size_20_rate
                    night_charge_40_rate = each.parent.site.night_charge_size_40_rate
            else:
                site_20_rate = each.parent.size_20_rate
                site_40_rate = each.parent.size_40_rate
                night_charge_20_rate = each.parent.night_charge_size_20_rate
                night_charge_40_rate = each.parent.night_charge_size_40_rate

            if each.parent.invoice_on_old_lolo_rate:
                if (
                    each.parent.client.type == "Line"
                    and HandlingChargesHistory.objects.filter(
                        ref_code=each.parent.client.ref_code,
                        client_type="Line",
                        location=each.parent.location,
                        site=each.parent.site,
                    ).exists()
                ):
                    lolo_rate_obj = HandlingChargesHistory.objects.filter(
                        ref_code=each.parent.client.ref_code,
                        client_type="Line",
                        location=each.parent.location,
                        site=each.parent.site,
                    ).first()
                    site_20_rate = lolo_rate_obj.size_20_rate
                    site_40_rate = lolo_rate_obj.size_40_rate
                    night_charge_20_rate = lolo_rate_obj.night_charge_size_20_rate
                    night_charge_40_rate = lolo_rate_obj.night_charge_size_40_rate

                if (
                    each.parent.client.type == "Party"
                    and HandlingChargesHistory.objects.filter(
                        ref_code=None,
                        client_type="Party",
                        location=each.parent.location,
                        site=each.parent.site,
                    ).exists()
                ):
                    lolo_rate_obj = HandlingChargesHistory.objects.filter(
                        ref_code=None,
                        client_type="Party",
                        location=each.parent.location,
                        site=each.parent.site,
                    ).first()

                    site_20_rate = lolo_rate_obj.size_20_rate
                    site_40_rate = lolo_rate_obj.size_40_rate
                    night_charge_20_rate = lolo_rate_obj.night_charge_size_20_rate
                    night_charge_40_rate = lolo_rate_obj.night_charge_size_40_rate

            bill = CustomerBill.objects.get(pk=each.bill_id)
            lolo = Handling.objects.select_related(
                "container__site", "container__size"
            ).get(pk=bill.lolo_id)
            taxable_amount = (
                site_20_rate if lolo.container.size.name == "20" else site_40_rate
            )
            in_out_date = None
            if bill.lolo_id is not None:
                if GateInHistory.objects.filter(lolo__pk=bill.lolo_id).exists():
                    in_history = GateInHistory.objects.select_related(
                        "container", "gate_in"
                    ).get(lolo__pk=bill.lolo_id)

                    in_out_date = in_history.gate_in.in_date
                else:
                    out_history = GateOutHistory.objects.select_related(
                        "container", "gate_out"
                    ).get(lolo__pk=bill.lolo_id)
                    in_out_date = out_history.gate_out.out_date

            # --------------------------------------------
            # Fin Account GST True or False
            # account = None
            # try:
            #     account = each.parent.client.fin_account_customer
            # except:
            #     account = None
            # with_gst = True
            # if account is not None:
            #     with_gst = account.with_gst

            with_gst = each.parent.apply_gst

            # ------------------------------------------

            tax = 0
            if with_gst:
                tax = 0.18
            lolo_tax = float(taxable_amount) * tax
            received_amt = float(taxable_amount) + lolo_tax
            original_amt = received_amt

            total_received_amount += received_amt
            total_original_amount += float(original_amt)
            invoice_line_data.append(
                {
                    "location": location_str,
                    "invoice_date": invoice_date_str,
                    "container_no": each.container_no,
                    "gate_in_out_date": (
                        in_out_date.strftime("%d/%m/%Y") if in_out_date else ""
                    ),
                    "gst_no": gst_no_str,
                    "invoice_no": invoice_no_str,
                    "party_name": party_name_str,
                    "payment_type": CustomerBill.objects.get(
                        pk=each.bill_id
                    ).payment_type,
                    "taxable_amount": round(taxable_amount, 2),
                    "cgst_amount": (
                        float(0) if apply_igst else round((lolo_tax / float(2)), 2)
                    ),
                    "sgst_amount": (
                        float(0) if apply_igst else round((lolo_tax / float(2)), 2)
                    ),
                    "igst_amount": round(lolo_tax, 2) if apply_igst else float(0),
                    "received_amount": round(received_amt, 2),
                    "original_amount": round(original_amt, 2),
                }
            )

        context["invoice_lines"] = invoice_line_data
        context["total_original_amount"] = round(total_original_amount)
        context["total_received_amount"] = round(total_received_amount)
        context["total_remaining_amount"] = 0

        return context

    def getMNRDataForBillingStatement(self, invoice_line, invoice, user_data_dict):
        invoice_line_data = []
        context = {
            "company_name": user_data_dict["company_name"],
            "company_address": user_data_dict["company_address"],
            "location": user_data_dict["location"],
        }

        bill_ids = [
            item for each in invoice_line for item in ast.literal_eval(each.bill_ids)
        ]

        bills = CustomerBill.objects.filter(pk__in=bill_ids).values(
            "survey_id", "container_no", "bill_type", "original_amount"
        )

        for each in bills:
            labour_cost = 0
            material_cost = 0
            cleaning_cost = 0
            survey_line = SurveyLine.objects.filter(
                parent__pk=each["survey_id"]
            ).values("labour_cost", "material_cost", "wash_clean_tariff")
            for each_survey in survey_line:
                if each_survey["wash_clean_tariff"] == 0:
                    labour_cost += each_survey["labour_cost"]
                    material_cost += each_survey["material_cost"]
                else:
                    cleaning_cost += each_survey["material_cost"]

            model = Container if invoice.site.type == "DEPOT" else NonDepotContainer

            container = (
                model.objects.select_related("type", "size")
                .filter(
                    container_no=each["container_no"],
                    location=invoice.location,
                    site=invoice.site,
                )
                .values(
                    "size__name",
                    "type__name",
                )
                .first()
            )
            invoice_line_data.append(
                {
                    "container_no": each["container_no"],
                    "line": invoice.client.name,
                    "container_size": f"{container['size__name']}{container['type__name']}",
                    "labour_cost": labour_cost if each["bill_type"] == "Repair" else "",
                    "material_cost": (
                        material_cost if each["bill_type"] == "Repair" else ""
                    ),
                    "cleaning_cost": (
                        cleaning_cost if each["bill_type"] == "Washing/Cleaning" else ""
                    ),
                    "amount": each["original_amount"],
                }
            )
        context["invoice_lines"] = invoice_line_data
        total_labour_cost = float(0)
        total_material_cost = float(0)
        total_cleaning_cost = float(0)
        total_amount = float(0)
        for each in invoice_line_data:
            labour_cost_sum = self.convertToFloat(each["labour_cost"])
            material_cost_sum = self.convertToFloat(each["material_cost"])
            cleaning_cost_sum = self.convertToFloat(each["cleaning_cost"])
            amount_sum = self.convertToFloat(each["amount"])
            total_labour_cost += labour_cost_sum
            total_material_cost += material_cost_sum
            total_cleaning_cost += cleaning_cost_sum
            total_amount += amount_sum

        context["total_labour_cost"] = round(total_labour_cost, 2)
        context["total_material_cost"] = round(total_material_cost, 2)
        context["total_cleaning_cost"] = round(total_cleaning_cost, 2)
        context["total_amount"] = round(total_amount, 2)

        return context

    def getOtherDataForBillingStatement(
        self,
        location_str,
        invoice_date_str,
        gst_no_str,
        invoice_no_str,
        party_name_str,
        apply_igst,
        invoice_line,
        user_data_dict,
    ):
        invoice_line_data = []
        context = {
            "company_name": user_data_dict["company_name"],
            "company_address": user_data_dict["company_address"],
        }
        total_original_amount = float(0)
        total_received_amount = float(0)
        for each in invoice_line:
            bill = CustomerBill.objects.get(pk=each.bill_id)

            container = None
            in_out_date = None
            if bill.lolo_id is not None:
                if GateInHistory.objects.filter(lolo__pk=bill.lolo_id).exists():
                    in_history = GateInHistory.objects.get(lolo__pk=bill.lolo_id)
                    container = in_history.container
                    in_out_date = in_history.gate_in.in_date
                else:
                    out_history = GateOutHistory.objects.get(lolo__pk=bill.lolo_id)
                    container = out_history.container
                    in_out_date = out_history.gate_out.out_date
            if bill.st_id is not None:
                if GateInHistory.objects.filter(st__pk=bill.st_id).exists():
                    in_history = GateInHistory.objects.get(st__pk=bill.st_id)
                    container = in_history.container
                    in_out_date = in_history.gate_in.in_date
                else:
                    out_history = GateOutHistory.objects.get(st__pk=bill.st_id)
                    container = out_history.container
                    in_out_date = out_history.gate_out.out_date
            tax_amount = float(each.rec_amount) - (float(each.rec_amount) / float(1.18))
            total_received_amount = total_received_amount + float(each.rec_amount)
            total_original_amount = total_original_amount + float(each.original_amount)
            invoice_line_data.append(
                {
                    "location": location_str,
                    "invoice_date": invoice_date_str,
                    "container_no": each.container_no,
                    "gate_in_out_date": (
                        in_out_date.strftime("%d/%m/%Y") if in_out_date else ""
                    ),
                    "gst_no": gst_no_str,
                    "invoice_no": invoice_no_str,
                    "party_name": party_name_str,
                    "payment_type": CustomerBill.objects.get(
                        pk=each.bill_id
                    ).payment_type,
                    "taxable_amount": round(float(each.rec_amount) / float(1.18), 2),
                    "cgst_amount": (
                        float(0) if apply_igst else round((tax_amount / float(2)), 2)
                    ),
                    "sgst_amount": (
                        float(0) if apply_igst else round((tax_amount / float(2)), 2)
                    ),
                    "igst_amount": round(tax_amount, 2) if apply_igst else float(0),
                    "received_amount": float(each.rec_amount),
                    "original_amount": float(each.original_amount),
                }
            )

        context["invoice_lines"] = invoice_line_data
        context["total_original_amount"] = round(total_original_amount, 2)
        context["total_received_amount"] = round(total_received_amount, 2)
        total_remaining_amount = float(round(total_original_amount, 2)) - float(
            round(total_received_amount, 2)
        )
        context["total_remaining_amount"] = total_remaining_amount

        return context

    def convertToFloat(self, value):
        return float(value) if value != "" else float(0)
