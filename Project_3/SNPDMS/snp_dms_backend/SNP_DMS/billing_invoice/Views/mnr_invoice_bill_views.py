# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import F
from master.functions import pagination_func
import traceback
import logging
import datetime
import ast
from django.db import transaction
from billing_invoice.models import get_fiscal_year_date

# model imports
from billing_invoice.models import (
    CustomerBill,
    CustomerBillInvoice,
    MNRInvoiceLine,
)
from master.models import Location, Site
from master.models_two import Client, ClientChildCompany
from mnr.models import Survey

ERROR_MSG = "Data Not Found"


class BuildandUpdateMNRInvoice(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_or_create_client_child_company(self, client_child_company_pk, **data):
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

    def get_bill_to_party_client(self, data, client):
        bill_to_party_client_object = self.get_or_create_client_child_company(
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

    def get_ship_to_party_client(self, data, bill_to_party_client_object, client):
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

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            client = Client.objects.get(
                name=data["main_client"], location=location, site=site
            )
            f_year_start, f_year_end = get_fiscal_year_date()
            fin_year = f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            if CustomerBillInvoice.objects.filter(
                invoice_no=data["invoice_label"] + data["invoice_no"],
                financial_year=fin_year,
                location=location,
                site=site,
            ).exists():
                return Response(
                    {
                        "errorMsg": f"Invoice no {data['invoice_label']}{data['invoice_no']} already exists"
                    }
                )
            with transaction.atomic():
                bill_to_party_client_object = self.get_bill_to_party_client(
                    data, client
                )
                ship_to_party_client_object = self.get_ship_to_party_client(
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
                    mnr_line = MNRInvoiceLine.create(
                        parent=customer_bill, data=each_line
                    )
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
                    Survey.objects.filter(pk__in=survey_ids).values(
                        "invoice_id"
                    ).update(invoice_id=customer_bill.pk)

            return Response(
                {
                    "successMsg": "Invoice successfully created",
                    "invoice_pk": customer_bill.pk,
                }
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            client = Client.objects.get(
                name=data["main_client"], location=location, site=site
            )
            customer_bill = CustomerBillInvoice.objects.get(pk=data["pk"])

            with transaction.atomic():
                bill_to_party_client_object = self.get_bill_to_party_client(
                    data, client
                )
                ship_to_party_client_object = self.get_ship_to_party_client(
                    data, bill_to_party_client_object, client
                )

                for each_line in data["invoice_lines"]:
                    mnr_bill = MNRInvoiceLine.objects.get(pk=each_line["pk"])
                    CustomerBill.objects.filter(
                        pk__in=ast.literal_eval(mnr_bill.bill_ids)
                    ).values("remaining_amount").update(
                        remaining_amount=F("original_amount")
                    )
                    MNRInvoiceLine.objects.filter(pk=each_line["pk"]).values(
                        "discount", "total_amount_after_discount"
                    ).update(
                        discount=each_line["discount"],
                        total_amount_after_discount=each_line[
                            "total_amount_after_discount"
                        ],
                    )
                    CustomerBill.objects.filter(pk__in=each_line["bill_ids"]).values(
                        "mnr_invoice_id", "remaining_amount", "is_payment_completed"
                    ).update(remaining_amount=float(0), is_payment_completed=True)

                customer_bill.invoice_no = data["invoice_label"] + data["invoice_no"]
                customer_bill.invoice_date = datetime.datetime.strptime(
                    data["invoice_date"], "%d/%m/%Y"
                ).date()
                customer_bill.bill_type = data["bill_type"]
                customer_bill.hsn_code = data["hsn_code"]
                customer_bill.client = client
                customer_bill.ref_booking_no = data["ref_booking_no"]
                customer_bill.ref_bl_no = data["ref_bl_no"]
                customer_bill.place_of_supply = data["place_of_supply"]
                customer_bill.supply_date = (
                    datetime.datetime.strptime(data["supply_date"], "%d/%m/%Y").date()
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

            return Response({"successMsg": "Invoice successfully updated"})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)

    def get(self, request, pk, *args, **kwargs):
        try:
            customer_invoice = CustomerBillInvoice.objects.select_related(
                "client",
                "bill_to_party_client",
                "ship_to_party_client",
                "location",
                "site",
            ).get(pk=pk)
            data = customer_invoice.get_customer_bill_invoice()
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
                for bill in MNRInvoiceLine.objects.filter(parent=customer_invoice)
            ]
            client = customer_invoice.client
            if ClientChildCompany.checkExistByParent(client.pk):
                data["client_child_company_list"] = [
                    each.get_child_client_details()
                    for each in ClientChildCompany.getByParent(client.pk)
                ]
            else:
                data["client_child_company_list"] = []

            return Response(data)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class GetAllMNRInvoices(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self, data):
        query = {}
        if data["location"]:
            query["location__name"] = data["location"]
        if data["site"]:
            query["site__name"] = data["site"]
        if data["client"]:
            query["client__name"] = data["client"]
        invoice_date = data["invoice_date"]
        if not len(invoice_date["from"]) == 0 and not len(invoice_date["to"]) == 0:
            query["invoice_date__range"] = (invoice_date["from"], invoice_date["to"])
        if data["invoice_no"]:
            query["invoice_no"] = data["invoice_no"]
        if data["bill_type"]:
            query["bill_type"] = data["bill_type"]
        else:
            query["bill_type__in"] = ["Repair", "Washing/Cleaning"]

        invoice_ids = [
            each["pk"]
            for each in CustomerBillInvoice.objects.filter(**query).values("pk")
        ]
        if data["container_no"]:
            return CustomerBill.objects.filter(
                mnr_invoice_id__in=invoice_ids, container_no=data["container_no"]
            )

        return CustomerBill.objects.filter(mnr_invoice_id__in=invoice_ids)

    def key_func(item):
        return datetime.strptime(item["invoice_date"], "%m/%d/%Y")

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]

            filtered_data = self.get_object(data)
            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = pagination_func(filtered_data, on_page_data, pg_no)

            main_data = [
                each.get_mnr_invoice_view() for each in current_page.object_list
            ]

            # merged_dict = {}
            # for each in main_data:
            #     container_no = each["container_no"]
            #     bill_type = each["bill_type"]
            #     total_amount = each["total_amount"]
            #     invoice_no = each["invoice_no"]
            #     merged_dict.setdefault(
            #         invoice_no,
            #         {
            #             "container_no": container_no,
            #             "bill_type": bill_type,
            #             "total_amount": total_amount,
            #             "pk": each["pk"],
            #             "client": each["client"],
            #             "invoice_no": each["invoice_no"],
            #             "invoice_date": each["invoice_date"],
            #         },
            #     )
            #     if (
            #         container_no == merged_dict[invoice_no]["container_no"]
            #         and invoice_no == merged_dict[invoice_no]["invoice_no"]
            #     ):

            #         if not bill_type in merged_dict[invoice_no]["bill_type"]:
            #             merged_dict[invoice_no]["bill_type"] += "/" + bill_type
            #             merged_dict[invoice_no]["total_amount"] += "/" + total_amount

            result_list = main_data

            result_list.sort(
                key=lambda item: datetime.datetime.strptime(
                    item["invoice_date"], "%d/%m/%Y"
                ),
                reverse=True,
            )

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": result_list,
                }
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=200)


class DeleteMNRInvoice(views.APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                customer_bill_invoice = CustomerBillInvoice.objects.get(pk=pk)
                invoice_line_obj = MNRInvoiceLine.objects.filter(
                    parent=customer_bill_invoice
                )
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

            return Response({"successMsg": "Customer Invoice Deleted Succesfully"})

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": ERROR_MSG}, status=500)
