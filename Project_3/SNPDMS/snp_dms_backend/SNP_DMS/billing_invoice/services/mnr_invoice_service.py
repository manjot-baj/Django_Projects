# other imports
from master.functions import pagination_func
import ast
from datetime import datetime

# django
from django.db.models import F

# models
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoice,
    MNRInvoiceLine,
)
from master.models_two import ClientChildCompany
from mnr.models import Survey

# services
from billing_invoice.services.biiling_invoice_service import InvoiceService


class MNRInvoiceService:

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

    def getParams(self, payload):
        params = {}
        if payload["location"]:
            params["location__name"] = payload["location"]
        if payload["site"]:
            params["site__name"] = payload["site"]
        if payload["client"]:
            params["client__name"] = payload["client"]
        invoice_date = payload["invoice_date"]
        if not len(invoice_date["from"]) == 0 and not len(invoice_date["to"]) == 0:
            params["invoice_date__range"] = (invoice_date["from"], invoice_date["to"])
        if payload["invoice_no"]:
            params["invoice_no"] = payload["invoice_no"]
        if payload["bill_type"]:
            params["bill_type"] = payload["bill_type"]
        else:
            params["bill_type__in"] = ["Repair", "Washing/Cleaning"]

        return params

    def invoicesMNRDto(self, data):
        invoice = CustomerBillInvoice.objects.select_related("client").get(
            pk=data.mnr_invoice_id
        )
        return {
            "pk": data.mnr_invoice_id,
            "invoice_no": invoice.invoice_no,
            "invoice_date": (
                invoice.invoice_date.strftime("%d/%m/%Y")
                if invoice.invoice_date
                else None
            ),
            "bill_type": data.bill_type,
            "client": invoice.client.name if invoice.client else None,
            "total_amount": str(data.original_amount),
            "container_no": data.container_no,
            "credit_note": data.credit_note_mnr,
        }

    def getMNRInvoices(self, payload, on_page_data, page_no):
        params = self.getParams(payload)
        ids = CustomerBillInvoice.objects.filter(**params).values_list("pk", flat=True)
        qs = None
        if payload["container_no"]:
            qs = CustomerBill.objects.filter(
                mnr_invoice_id__in=ids, container_no=payload["container_no"]
            )
        else:
            qs = CustomerBill.objects.filter(mnr_invoice_id__in=ids)

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, page_no, qs)

        main_data = [self.invoicesMNRDto(each) for each in current_page.object_list]

        main_data.sort(
            key=lambda item: datetime.strptime(item["invoice_date"], "%d/%m/%Y"),
            reverse=True,
        )

        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": main_data,
        }

    def getMNRInvoiceData(self, pk):
        customer_invoice = CustomerBillInvoice.objects.select_related(
            "client",
            "bill_to_party_client",
            "ship_to_party_client",
            "location",
            "site",
        ).get(pk=pk)
        data = InvoiceService().invoiceDto(customer_invoice)

        mnr_invoice_qs = MNRInvoiceLine.objects.filter(parent=customer_invoice)
        data["invoice_lines"] = [
            {
                "pk": bill.pk,
                "process": bill.process,
                "size": bill.size,
                "total_amount": bill.total_amount,
                "discount": bill.discount,
                "total_amount_after_discount": bill.total_amount_after_discount,
                "bill_ids": ast.literal_eval(bill.bill_ids),
                "bill_count": bill.bill_count,
            }
            for bill in mnr_invoice_qs
        ]
        client = customer_invoice.client
        if ClientChildCompany.checkExistByParent(client.pk):
            client_qs = ClientChildCompany.getByParent(client.pk)
            data["client_child_company_list"] = [
                each.get_child_client_details() for each in client_qs
            ]
        else:
            data["client_child_company_list"] = []

        return data

    def getFinancialYear(self):
        current = datetime.now()
        year = current.year
        if current.month >= 4:
            return f"{str(year)[2:]}-{str(year+1)[2:]}"
        else:
            return f"{str(year-1)[2:]}-{str(year)[2:]}"

    def getOrCreateClientChildCompany(self, client_child_company_pk, **data):
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
            client_child_company_object = ClientChildCompany.create(
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
        bill_to_party_client_object = self.getOrCreateClientChildCompany(
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
                ship_to_party_client_object = self.get_or_create_client_child_company(
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

    def createInvoiceLine(self, data, client, location, site):
        bill_to_party_client_object = self.getBillToPartyClient(data, client)
        ship_to_party_client_object = self.getShipToPartyClient(
            data, bill_to_party_client_object, client
        )
        customer_bill = CustomerBillInvoice.create(
            client=client,
            bill_to_party_client=bill_to_party_client_object,
            ship_to_party_client=ship_to_party_client_object,
            apply_igst=data["apply_igst"],
            location=location,
            site=site,
            data=data,
        )
        customer_bill.save()
        for each_line in data["invoice_lines"]:
            mnr_line = MNRInvoiceLine.create(parent=customer_bill, data=each_line)
            mnr_line.save()
            CustomerBill.objects.filter(pk__in=each_line["bill_ids"]).values(
                "mnr_invoice_id", "remaining_amount", "is_payment_completed"
            ).update(
                mnr_invoice_id=customer_bill.pk,
                remaining_amount=float(0),
                is_payment_completed=True,
            )
            survey_ids = [
                each["survey_id"]
                for each in CustomerBill.objects.filter(
                    pk__in=each_line["bill_ids"]
                ).values("survey_id")
            ]
            Survey.objects.filter(pk__in=survey_ids).values("invoice_id").update(
                invoice_id=customer_bill.pk
            )

        return customer_bill

    def updateInvoice(self, data, client, location, site, customer_bill):
        bill_to_party_client_object = self.getBillToPartyClient(data, client)
        ship_to_party_client_object = self.getShipToPartyClient(
            data, bill_to_party_client_object, client
        )

        for each_line in data["invoice_lines"]:
            mnr_bill = MNRInvoiceLine.objects.get(pk=each_line["pk"])
            CustomerBill.objects.filter(
                pk__in=ast.literal_eval(mnr_bill.bill_ids)
            ).values("remaining_amount").update(remaining_amount=F("original_amount"))
            MNRInvoiceLine.objects.filter(pk=each_line["pk"]).values(
                "discount", "total_amount_after_discount"
            ).update(
                discount=each_line["discount"],
                total_amount_after_discount=each_line["total_amount_after_discount"],
            )
            CustomerBill.objects.filter(pk__in=each_line["bill_ids"]).values(
                "mnr_invoice_id", "remaining_amount", "is_payment_completed"
            ).update(remaining_amount=float(0), is_payment_completed=True)

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
        customer_bill.bill_to_party_client = bill_to_party_client_object
        customer_bill.ship_to_party_client = ship_to_party_client_object
        customer_bill.total_amount = data["total_amount"]
        customer_bill.remark = data["remark"]
        customer_bill.location = location
        customer_bill.site = site
        customer_bill.is_transaction_effected = True
        customer_bill.save()

    def deleteMNRInvoice(self, pk):
        customer_bill_invoice = CustomerBillInvoice.objects.get(pk=pk)
        invoice_line_obj = MNRInvoiceLine.objects.filter(parent=customer_bill_invoice)
        for each in invoice_line_obj:
            for each_bill in CustomerBill.objects.filter(
                pk__in=ast.literal_eval(each.bill_ids)
            ):
                each_bill.is_payment_completed = False
                each_bill.remaining_amount = each_bill.original_amount
                each_bill.save(
                    update_fields=["is_payment_completed", "remaining_amount"]
                )

        customer_bill_invoice.delete()
