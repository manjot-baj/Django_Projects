# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from master.functions import pagination_func
import traceback, logging, datetime
from django.utils import timezone
from billing_invoice.functions import get_invoice_no, INDIAN_STATES, STATE_CODES
import os
from django.http import HttpResponse
from billing_invoice.functions import create_billing_statement_excel


# model imports
from billing_invoice.models import CustomerBill
from master.models import Location, Site
from master.models_two import Client, ClientChildCompany
from mnr.models import Survey, SurveyLine
from depot.models import Container, ContainerStock
from non_depot.models import NonDepotContainer, NonDepotContainerStock


def none_to_empty_str(items):
    return {each: "" if items[each] is None else items[each] for each in items}


class CustomerBillingView(views.APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self, data):
        query = Q()
        if data["location"]:
            query &= Q(location__name=data["location"])
        if data["site"]:
            query &= Q(site__name=data["site"])
        if data["client"]:
            query &= Q(client__name=data["client"])
        if data["customer"]:
            query &= Q(customer__name=data["customer"])
        if data["container_no"]:
            query &= Q(container_no=data["container_no"])
        if data["from_date"] and data["to_date"]:
            query &= Q(bill_date__range=(data["from_date"], data["to_date"]))

        if data["bill_type"] == "Repair":
            query &= Q(bill_type="Repair") | Q(bill_type="Washing/Cleaning")
            query &= Q(is_locked=False)
        else:
            query &= Q(bill_type=data["bill_type"])
        if data["ref_code"]:
            query &= Q(ref_code=data["ref_code"])

        if "bill_for_in" in data.keys():
            if data["bill_for_in"] is True:
                query &= Q(bill_for="IN")
            elif data["bill_for_in"] is False:
                query &= Q(bill_for="OUT")
        if (
            "from_gate_out_date" in data.keys()
            and "to_gate_out_date" in data.keys()
            and data["from_gate_out_date"]
            and data["to_gate_out_date"]
        ):
            site = Site.objects.get(location__name=data["location"], name=data["site"])
            model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
            stock_ids = model.objects.filter(
                gate_out__out_date__range=(
                    datetime.datetime.strptime(data["from_gate_out_date"], "%Y-%m-%d"),
                    datetime.datetime.strptime(data["to_gate_out_date"], "%Y-%m-%d"),
                ),
                container__location__name=data["location"],
                container__site=site,
            ).values_list("pk", flat=True)
            if site.type == "DEPOT":
                filter_params = {"depot__pk__in": stock_ids}
            else:
                filter_params = {"non_depot__pk__in": stock_ids}
            survey_ids = Survey.objects.filter(**filter_params).values_list(
                "pk", flat=True
            )
            query &= Q(survey_id__in=survey_ids)

        query &= Q(is_payment_completed=False)

        return CustomerBill.objects.select_related("client", "customer").filter(query)

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

            data = [each.get_customer_bill_view() for each in current_page.object_list]

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": data,
                },
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class CollectCustomerInvoiceData(views.APIView):
    permission_classes = (IsAuthenticated,)

    def check_client_consistency(self, customer_bill_objects, process):
        if process == "Handling/Transportation":
            client_list = [each.customer.name for each in customer_bill_objects]
        else:
            client_list = [each.client.name for each in customer_bill_objects]
        if not all(client == client_list[0] for client in client_list):
            return False, client_list
        return True, client_list

    def get_or_create_client_child_company(self, client_obj, client_data, client_name):
        existing_client_child = ClientChildCompany.objects.filter(
            parent=client_obj, name=client_name
        ).first()

        if existing_client_child:
            existing_client_child.address = client_data.office_address
            existing_client_child.gst_no = client_data.gst_no
            existing_client_child.state = client_data.state
            existing_client_child.state_code = (
                client_data.gst_no[:2] if client_data.gst_no else ""
            )
            existing_client_child.zip_code = client_data.zip
            existing_client_child.save()

        else:
            existing_client_child = ClientChildCompany.create(
                parent=client_obj,
                name=client_name,
                address=client_data.office_address,
                gst_no=client_data.gst_no,
                state=client_data.state,
                zip_code=client_data.zip,
                state_code=client_data.gst_no[:2] if client_data.gst_no else "",
            )
            existing_client_child.save()

        return existing_client_child

    def get_client_child_list(self, client_obj):
        if ClientChildCompany.checkExistByParent(client_obj.pk):
            return [
                each.get_child_client_details()
                for each in ClientChildCompany.getByParent(client_obj.pk)
            ]
        return []

    def get_invoice_lines(self, customer_bill_objects, bill_type):
        return list(
            {
                "pk": bill.pk,
                "container_no": bill.container_no,
                "client": bill.client.name,
                "payment_type": bill.payment_type,
                "original_amount": str(bill.original_amount),
                "remaining_amount": str(bill.remaining_amount),
                "rec_amount": (
                    str(bill.original_amount) if bill_type == "Handling" else "0"
                ),
                "bill_id": bill.pk,
            }
            for bill in customer_bill_objects
        )

    def get_mnr_invoice_lines(self, customer_bill_objects, site):
        data = []
        merged_data = {}
        for each in customer_bill_objects:
            size = (
                Survey.objects.select_related("depot__container__size")
                .get(pk=each.survey_id)
                .depot.container.size.name
                if site.type == "DEPOT"
                else Survey.objects.select_related("non_depot__container__size")
                .get(pk=each.survey_id)
                .non_depot.container.size.name
            )
            data.append(
                {
                    "process": each.bill_type,
                    "size": size,
                    "total_amount": each.remaining_amount,
                    "discount": "0",
                    "total_amount_after_discount": each.remaining_amount,
                    "bill_id": each.pk,
                }
            )
        for item in data:
            key = (item["process"], item["size"])
            if key not in merged_data:
                merged_data[key] = {
                    "process": item["process"],
                    "size": item["size"],
                    "total_amount": 0,
                    "discount": "0",
                    "total_amount_after_discount": 0,
                    "bill_ids": [],
                    "bill_count": 0,
                }
            merged_data[key]["total_amount"] += item["total_amount"]
            merged_data[key]["total_amount_after_discount"] += item[
                "total_amount_after_discount"
            ]
            merged_data[key]["bill_ids"].append(item["bill_id"])
            merged_data[key]["bill_count"] += 1

        return list(merged_data.values())

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pk_list = data["pk_list"]
            from_date = data["from_date"]
            to_date = data["to_date"]

            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            customer_bill_objects = CustomerBill.objects.select_related(
                "customer", "client"
            ).filter(pk__in=pk_list)
            customer_obj = customer_bill_objects.first()
            if (
                customer_obj.bill_type == "Handling"
                or customer_obj.bill_type == "Transportation"
                or customer_obj.bill_type == "Night Charge"
            ):
                is_same_client, client_list = self.check_client_consistency(
                    customer_bill_objects, process="Handling/Transportation"
                )
                client_data = customer_bill_objects[0].customer
            else:
                is_same_client, client_list = self.check_client_consistency(
                    customer_bill_objects, process="Repair"
                )
                client_data = customer_bill_objects[0].client

            if not is_same_client:
                return Response(
                    {
                        "error_msg": "Payer Customer/Client Should be Same for all requested Billing objects"
                    },
                    status=200,
                )

            # client_data = customer_bill_objects[0].customer
            client_obj = Client.objects.get(pk=client_data.pk)
            client_name = client_list[0]
            client_child_company = self.get_or_create_client_child_company(
                client_obj, client_data, client_name
            )
            client_child_company_list = self.get_client_child_list(client_obj)
            invoice_label = get_invoice_no(
                location, site, bill_type=customer_obj.bill_type
            )
            if customer_obj.bill_type in ["Handling", "Transportation", "Night Charge"]:
                invoice_lines = self.get_invoice_lines(
                    customer_bill_objects, bill_type=customer_obj.bill_type
                )
            else:
                invoice_lines = self.get_mnr_invoice_lines(customer_bill_objects, site)

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
                "hsn_code": hsn_code,
                "ref_booking_no": "",
                "ref_bl_no": "",
                "place_of_supply": "",
                "supply_date": "",
                "invoice_date": datetime.datetime.now()
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
            }
            data = none_to_empty_str(items=data)
            data["invoice_lines"] = invoice_lines

            return Response(data, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class PreInvoiceStatement(views.APIView):

    permission_classes = (IsAuthenticated,)

    def get_mnr_data(self, pk_list, location, site):
        customer_bills = (
            CustomerBill.objects.select_related("customer", "client")
            .filter(pk__in=pk_list)
            .values(
                "survey_id",
                "container_no",
                "bill_type",
                "original_amount",
                "client__name",
            )
        )
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
        for count, each in enumerate(customer_bills, start=1):
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
            model = Container if site.type == "DEPOT" else NonDepotContainer
            container = (
                model.objects.select_related("type", "size")
                .filter(
                    container_no=each["container_no"],
                    location=location,
                    site=site,
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
            main_data["Line"].append(each["client__name"])
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

        total_labour_cost = sum(main_data["Labour Cost"])
        total_material_cost = sum(main_data["Material Cost"])
        total_cleaning_cost = sum(main_data["Washing Cost"])
        total_amount = sum(main_data["Total Cost"])
        for _ in range(2):
            main_data["Sr.No"].append("")
            main_data["Container No"].append("")
            main_data["Size"].append("")
            main_data["Line"].append("" if _ == 0 else "Total")
            main_data["Labour Cost"].append(
                "" if _ == 0 else round(total_labour_cost, 2)
            )
            main_data["Material Cost"].append(
                "" if _ == 0 else round(total_material_cost, 2)
            )
            main_data["Washing Cost"].append(
                "" if _ == 0 else round(total_cleaning_cost, 2)
            )
            main_data["Total Cost"].append("" if _ == 0 else round(total_amount, 2))
        return main_data

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            pk_list = data["pk_list"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            main_data = self.get_mnr_data(pk_list, location, site)

            temp_file_path = create_billing_statement_excel(
                main_data, type="pre_billing_statement"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="pre_billing_statement.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
