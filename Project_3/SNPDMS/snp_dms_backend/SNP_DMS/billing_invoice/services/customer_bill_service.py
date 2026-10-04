# other imports
from master.functions import pagination_func
from datetime import datetime
from collections import defaultdict
import pandas as pd

# models
from billing_invoice.models import CustomerBill
from master.models import Site
from mnr.models import Survey, SurveyLine
from depot.models import Container, ContainerStock
from non_depot.models import NonDepotContainer, NonDepotContainerStock


class CustomerBillService:

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

    def billsDto(self, data):
        return {
            "pk": data.pk or "",
            "bill_type": data.bill_type or "",
            "bill_date": (
                data.bill_date.strftime("%d/%m/%Y") if data.bill_date else ""
            ),
            "apply_charge": data.apply_charge or "",
            "container_no": data.container_no or "",
            "client": data.client.name if data.client else "",
            "customer": data.customer.name if data.customer else "",
            "original_amount": str(data.original_amount) or "",
            "remaining_amount": str(data.remaining_amount) or "",
            "bill_for": data.bill_for or "",
            "is_locked": data.is_locked,
        }

    def getParams(self, payload):
        params = {
            "location__name": payload["location"],
            "site__name": payload["site"],
            "is_payment_completed": False,
        }
        if payload["client"]:
            params["client__name"] = payload["client"]
        if payload["customer"]:
            params["customer__name"] = payload["customer"]
        if payload["container_no"]:
            params["container_no"] = payload["container_no"]
        if payload["bill_type"] == "Repair":
            params["bill_type__in"] = ["Repair", "Washing/Cleaning"]
            params["is_locked"] = False
        else:
            params["bill_type"] = payload["bill_type"]
        if payload["ref_code"]:
            params["ref_code"] = payload["ref_code"]
        if "bill_for_in" in payload.keys():
            if payload["bill_for_in"] is True:
                params["bill_for"] = "IN"
            elif payload["bill_for_in"] is False:
                params["bill_for"] = "OUT"

        if payload["from_date"] and payload["to_date"]:
            params["bill_date__range"] = (
                payload["from_date"],
                payload["to_date"],
            )

        if (
            "from_gate_out_date" in payload.keys()
            and "to_gate_out_date" in payload.keys()
            and payload["from_gate_out_date"]
            and payload["to_gate_out_date"]
        ):
            site = Site.objects.get(
                location__name=payload["location"], name=payload["site"]
            )
            model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
            stock_ids = model.objects.filter(
                gate_out__out_date__range=(
                    datetime.strptime(payload["from_gate_out_date"], "%Y-%m-%d"),
                    datetime.strptime(payload["to_gate_out_date"], "%Y-%m-%d"),
                ),
                container__location__name=payload["location"],
                container__site=site,
            ).values_list("pk", flat=True)
            if site.type == "DEPOT":
                filter_params = {"depot__pk__in": stock_ids}
            else:
                filter_params = {"non_depot__pk__in": stock_ids}
            survey_ids = Survey.objects.filter(**filter_params).values_list(
                "pk", flat=True
            )
            params["survey_id__in"] = survey_ids

        return params

    def getBills(self, payload, on_page_data, page_no):
        params = self.getParams(payload)
        qs = CustomerBill.objects.getBillQuerysetByParams(params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, page_no, qs)
        data = [self.billsDto(data) for data in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def getBillsForExcelDownload(self, payload):
        params = self.getParams(payload)
        qs = CustomerBill.objects.getBillQuerysetByParams(params)
        data = [self.billsDto(qs_data) for qs_data in qs]
        return data

    def getQuerysetForPreInvoiceStatement(self, pk_list):
        return CustomerBill.objects.getBillQuerysetByPkList(pk_list).values(
            "survey_id",
            "container_no",
            "bill_type",
            "original_amount",
            "client__name",
        )

    def getMnrData(self, pk_list, location, site):

        qs = self.getQuerysetForPreInvoiceStatement(pk_list)
        df = pd.DataFrame(qs)

        df["size"] = ""
        df["labour_cost"] = 0
        df["material_cost"] = 0
        df["cleaning_cost"] = 0
        df["total_cost"] = 0

        labour_cost_list = []
        material_cost_list = []
        cleaning_cost_list = []
        model = Container if site.type == "DEPOT" else NonDepotContainer
        # Map Size and Type
        size_type_map = defaultdict(str)
        containers = df["container_no"].unique().tolist()
        size_type_data = model.objects.filter(
            container_no__in=containers, location=location, site=site
        ).values(
            "container_no",
            "size__name",
            "type__name",
        )
        for each in size_type_data:
            size_type_map[each["container_no"]] = (
                f"{each["size__name"]}{each["type__name"]}"
            )
        for each in df.itertuples():
            df.at[each.Index, "size"] = size_type_map.get(each.container_no, "")

        # Evaluate Labour Cost, Material Cost, and Cleaning Cost
        for each in df.itertuples(index=False):
            labour_cost = 0
            material_cost = 0
            cleaning_cost = 0
            survey_line = SurveyLine.objects.filter(parent__pk=each.survey_id).values(
                "labour_cost", "material_cost", "wash_clean_tariff"
            )
            for each_survey in survey_line:
                if each_survey["wash_clean_tariff"] == 0:

                    labour_cost += each_survey["labour_cost"]
                    material_cost += each_survey["material_cost"]
                else:

                    cleaning_cost += each_survey["material_cost"]
            labour_cost_list.append(labour_cost)
            material_cost_list.append(material_cost)
            cleaning_cost_list.append(cleaning_cost)

        df["labour_cost"] = labour_cost_list
        df["material_cost"] = material_cost_list
        df["cleaning_cost"] = cleaning_cost_list

        # For Repair bills, set cleaning_cost to 0
        bill_type_mask = df["bill_type"]
        df["cleaning_cost"] = df["cleaning_cost"].where(bill_type_mask != "Repair", 0)

        # For Washing/Cleaning bills, set labour and material costs to 0
        wash_clean_mask = bill_type_mask == "Washing/Cleaning"
        df["labour_cost"] = df["labour_cost"].where(~wash_clean_mask, 0)
        df["material_cost"] = df["material_cost"].where(~wash_clean_mask, 0)

        # Calculate total cost
        df["total_cost"] = df[["labour_cost", "material_cost", "cleaning_cost"]].sum(
            axis=1
        )

        # Column processing
        df = (
            df.rename(
                columns={
                    "container_no": "Container No",
                    "size": "Size",
                    "client__name": "Line",
                    "labour_cost": "Labour Cost",
                    "material_cost": "Material Cost",
                    "cleaning_cost": "Washing Cost",
                    "total_cost": "Total Cost",
                }
            )
            .drop(columns=["survey_id", "original_amount", "bill_type"])
            .reindex(
                columns=[
                    "Container No",
                    "Size",
                    "Line",
                    "Labour Cost",
                    "Material Cost",
                    "Washing Cost",
                    "Total Cost",
                ]
            )
        )

        # Calculate sums and create total row
        columns_sums = df[
            ["Labour Cost", "Material Cost", "Washing Cost", "Total Cost"]
        ].sum()
        total_row = pd.Series(
            {
                "Line": "Total",
                "Labour Cost": columns_sums["Labour Cost"],
                "Material Cost": columns_sums["Material Cost"],
                "Washing Cost": columns_sums["Washing Cost"],
                "Total Cost": columns_sums["Total Cost"],
            }
        )

        # Append totals directly without empty row
        df = pd.concat(
            [df, pd.DataFrame([total_row], columns=df.columns)], ignore_index=True
        )
        return df
