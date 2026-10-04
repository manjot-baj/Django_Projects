from master.functions import pagination_func
from datetime import datetime
from decimal import Decimal
from SNP_DMS.settings.base import BASE_DIR
import os
import xlsxwriter

# error handling
from common.exceptions import ValidationError

# models
from procurement.models import (
    Requisition,
    RequisitionHistoryLine,
    RequisitionLine,
    ToolRoom,
    ToolRateHistory,
    SharedClass,
)


class RequisitionService:
    def requisitionData(self, data):
        return {
            "pk": data.pk,
            "order_no": data.order_no,
            "date": data.date,
            "status": data.status,
            "status_list": (
                ["PENDING", "APPROVED"]
                if data.status == "PENDING"
                else (
                    ["PARTIAL CLOSED", "CLOSED"]
                    if data.status == "APPROVED"
                    else ["CLOSED"]
                )
            ),
            "total_amount": data.total_amount,
            "location_id": data.location_id,
            "site_id": data.site_id,
        }

    def requisitionOrderNo(self, location, site):
        site_obj = SharedClass().getSiteById(site)
        label = f"GHCS{site_obj.code}-"
        params = {"location_id": location, "site_id": site}
        queryset = Requisition.manager.getRequisitions(params)
        count = Requisition.manager.aggregateMaxOrderNoCount(queryset)

        if count:
            try:
                maxSerialNumber = int(count.split("-", 1)[1])
            except:
                maxSerialNumber = 0
        else:
            maxSerialNumber = 0

        nextSerialNumber = maxSerialNumber + 1

        if nextSerialNumber < 10:
            serialNumber = "0" + str(nextSerialNumber)
        else:
            serialNumber = str(nextSerialNumber)

        orderNo = label + serialNumber

        while Requisition.manager.checkIfOrderNoExists(location, site, orderNo):
            nextSerialNumber += 1
            if nextSerialNumber < 10:
                serialNumber = "0" + str(nextSerialNumber)
            else:
                serialNumber = str(nextSerialNumber)

            orderNo = label + serialNumber

        return orderNo

    def updateRequisition(self, payload, location, site, requisition):

        date_str = payload.get("date")
        date = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else None
        total_amount = payload.get("total_amount")
        status = payload.get("status")

        requisition.location_id = location
        requisition.site_id = site
        requisition.date = date
        requisition.total_amount = total_amount
        requisition.status = status
        requisition.save(
            update_fields=["location", "site", "date", "total_amount", "status"]
        )
        return requisition

    def requisitionLineData(self, data):

        return [
            {
                "pk": each.pk,
                "category": each.tool.category.name if each.tool.category else "",
                "category_id": each.tool.category_id,
                "name": each.tool.name if each.tool.name else "",
                "tool_id": each.tool_id,
                "required_qty": each.required_qty,
                "received_qty": each.received_qty,
                "remaining_qty": each.remaining_qty,
                "rate": each.tool.rate,
                "amount": each.amount,
                "remarks": each.remarks,
                "sku_code": each.tool.sku_code,
            }
            for each in data
        ]

    def updateRequisitionLine(self, parent, data, location, site):
        tool_ids = [each.get("tool_id") for each in data]

        tool_room = ToolRoom.manager.getToolsByIdsIn(tool_ids, location, site)
        List_of_pk1 = [each.get("pk") for each in data if "pk" in each.keys()]
        requisition_pks = RequisitionLine.manager.getRequisitionLinesIds(parent)
        list_of_pk2 = [each["pk"] for each in requisition_pks]
        line_to_be_deleted = list(set(List_of_pk1) ^ set(list_of_pk2))
        if line_to_be_deleted:
            RequisitionLine.manager.linesToBeDeleted(line_to_be_deleted)

        tool_room_dict = {each.pk: each for each in tool_room}
        for each in data:

            tool = tool_room_dict.get(each.get("tool_id"))

            required_qty = each.get("required_qty")
            received_qty = each.get("received_qty")
            remaining_qty = each.get("remaining_qty")
            amount = each.get("amount")
            remarks = each.get("remarks")
            rate = each.get("rate")

            if parent.status in ["PARTIAL CLOSED", "CLOSED"]:
                if tool.rate != rate:
                    if tool.rate < rate:
                        change_in_rate = float(rate) - float(tool.rate)
                        parent.total_amount = float(parent.total_amount) + (
                            change_in_rate * float(required_qty)
                        )
                    elif tool.rate > rate:
                        change_in_rate = float(tool.rate) - float(rate)
                        parent.total_amount = float(parent.total_amount) - (
                            change_in_rate * float(required_qty)
                        )
                    parent.save(update_fields=["total_amount"])
                    tool_rate_history_params = {
                        "tool": tool,
                        "previous_rate": tool.rate,
                        "modified_rate": rate,
                        "changed_in": "Requisition",
                        "requisition_order_no": parent.order_no,
                        "location_id": location,
                        "site_id": site,
                    }
                    ToolRateHistory.manager.createToolRateHistory(
                        tool_rate_history_params
                    )

                    tool.rate = rate
                    tool.save(update_fields=["rate"])
                previous_qty = RequisitionLine.manager.getRequisitionLineById(
                    each.get("pk")
                ).received_qty
                if previous_qty is None:
                    previous_qty = 0
                if not float(previous_qty) == received_qty:
                    tool.in_stock += Decimal(float(received_qty) - float(previous_qty))
                    tool.save(update_fields=["in_stock"])

                instance = RequisitionLine.manager.getRequisitionLineById(
                    pk=each.get("pk")
                )
                instance.received_qty = received_qty
                instance.remaining_qty = required_qty - received_qty
                instance.amount = amount
                instance.remarks = remarks
                instance.rate = rate
                instance.save(
                    update_fields=[
                        "received_qty",
                        "remaining_qty",
                        "amount",
                        "remarks",
                        "rate",
                    ]
                )

            else:
                if "pk" in each.keys():
                    instance = RequisitionLine.manager.getRequisitionLineById(
                        pk=each.get("pk")
                    )
                    instance.parent = parent
                    instance.tool = tool
                    instance.required_qty = required_qty
                    instance.received_qty = received_qty
                    instance.remaining_qty = remaining_qty
                    instance.amount = amount
                    instance.remarks = remarks
                    instance.save(
                        update_fields=[
                            "parent",
                            "tool",
                            "required_qty",
                            "received_qty",
                            "remaining_qty",
                            "amount",
                            "remarks",
                        ]
                    )

                else:
                    params = {
                        "parent": parent,
                        "tool": tool,
                        "required_qty": required_qty,
                        "received_qty": received_qty,
                        "remaining_qty": remaining_qty,
                        "amount": amount,
                        "remarks": remarks,
                    }
                    instance = RequisitionLine.manager.createRequisitionLine(params)

            tool.rate = rate
            tool.save(update_fields=["rate"])

        return True

    def requisitionHistoryLineData(self, data):
        return [
            {
                "pk": each["pk"],
                "order_no": each["order_no"],
                "date": each["date"],
                "bill_date": each["bill_date"],
                "received_date": each["received_date"],
                "bill_no": each["bill_no"],
                "total_amount": each["total_amount"],
                "bill_uploaded": each["is_bill_uploaded"],
            }
            for each in data
        ]

    def createRequisitionHistory(self, parent, data):
        for each in data:
            order_no = each.get("order_no")
            try:
                date = (
                    datetime.strptime(each.get("date"), "%Y-%m-%d").date()
                    if each.get("date")
                    else None
                )
            except:
                raise ValidationError("Date Format is Wrong!")
            try:
                bill_date = (
                    datetime.strptime(each.get("bill_date"), "%Y-%m-%d").date()
                    if each.get("date")
                    else None
                )
            except:
                raise ValidationError("Bill Date Format is Wrong!")
            try:
                received_date = (
                    datetime.strptime(each.get("received_date"), "%Y-%m-%d").date()
                    if each.get("date")
                    else None
                )
            except:
                raise ValidationError("Received Date Format is Wrong!")
            bill_no = each.get("bill_no")
            total_amount = each.get("total_amount")
            if not "pk" in each.keys():
                params = {
                    "parent": parent,
                    "order_no": order_no,
                    "date": date,
                    "bill_date": bill_date,
                    "received_date": received_date,
                    "bill_no": bill_no,
                    "total_amount": total_amount,
                }
                RequisitionHistoryLine.manager.createRequisitionHistoryLines(params)
        return True

    def allRequisition(self, payload):
        on_page_data = payload.get("on_page_data")
        pg_no = payload.get("pg_no")

        location = payload.get("location_id")
        site = payload.get("site_id")
        from_received_date = payload.get("from_received_date")
        to_received_date = payload.get("to_received_date")
        from_bill_date = payload.get("from_bill_date")
        to_bill_date = payload.get("to_bill_date")
        bill_no = payload.get("bill_no")

        param = {}
        if location:
            param["parent__location_id"] = location
        if site:
            param["parent__site_id"] = site
        if payload.get("from_date") and payload.get("to_date"):
            param["parent__date__range"] = (
                payload.get("from_date"),
                payload.get("to_date"),
            )
        if payload.get("is_pending"):
            param["parent__status"] = "PENDING"
        if payload.get("is_approved"):
            param["parent__status"] = "APPROVED"
        if payload.get("is_partial_closed"):
            param["parent__status"] = "PARTIAL CLOSED"
        if payload.get("is_closed"):
            param["parent__status"] = "CLOSED"
        if payload.get("is_automate"):
            param["parent__status"] = "AUTOMATE"
        if payload.get("name"):
            param["tool__name"] = payload.get("name")
        if payload["order_no"]:
            param["parent__order_no"] = payload.get("order_no")

        list_of_pks = RequisitionLine.manager.getListOfIds(param)
        if (
            (from_received_date and to_received_date)
            or (from_bill_date and to_bill_date)
            or bill_no
        ):
            billParams = {
                "parent__location_id": location,
                "parent__site_id": site,
            }
            if from_received_date and to_received_date:
                try:
                    billParams["received_date__range"] = (
                        datetime.strptime(from_received_date, "%Y-%m-%d"),
                        datetime.strptime(to_received_date, "%Y-%m-%d"),
                    )
                except:
                    raise ValidationError("Received Date Format is Wrong!")
            if from_bill_date and to_bill_date:
                try:
                    billParams["bill_date__range"] = (
                        datetime.strptime(from_bill_date, "%Y-%m-%d"),
                        datetime.strptime(to_bill_date, "%Y-%m-%d"),
                    )
                except:
                    raise ValidationError("Bill Date Format is Wrong!")
            if bill_no:
                billParams["bill_no"] = bill_no
            requisition_history_ids = RequisitionHistoryLine.manager.getListOfIds(
                billParams
            )
            requisition_params = {"pk__in": requisition_history_ids}
            main_data = Requisition.manager.getRequisitions(requisition_params)

        else:
            requisition_params = {"pk__in": list_of_pks}
            main_data = Requisition.manager.getRequisitions(requisition_params)

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(main_data, on_page_data, pg_no)

        filtered_data = [self.tableData(each) for each in current_page.object_list]

        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": filtered_data,
        }

    def tableData(self, data):
        return {
            "pk": data.pk,
            "order_no": data.order_no,
            "date": data.date,
            "status": data.status,
        }

    def getBillData(self, params):
        filtered_data = (
            RequisitionHistoryLine.manager.getRequisitionHistoryLinesByParams(params)
        )

        data = self.requisitionHistoryLineData(filtered_data)
        return data

    def getPdfData(
        self, requisition_line, requisition, indentor_name, designation, contact_no
    ):
        return {
            "requisition_line": requisition_line,
            "indent_no": requisition.order_no,
            "indent_date": requisition.date,
            "location": requisition.location.name,
            "site": requisition.site.name,
            "delivery_date": requisition.date,
            "delivery_address": "GOLDEN HORN CONTAINERS SERVICE",
            "indentor_name": indentor_name,
            "designation": designation,
            "contact_no": contact_no,
            "status": (
                ""
                if requisition.status == "APPROVED"
                else (
                    "This is Partially Closed Data*"
                    if requisition.status == "PARTIAL CLOSED"
                    else "This is Closed Data*"
                )
            ),
        }

    def requisitionDfData(self, data_object_list, item=False):

        if item:
            df_data = [
                [
                    each.get("parent__order_no", ""),
                    each.get("tool__name", ""),
                    each.get("tool__sku_code", ""),
                    each.get("parent__date").strftime("%d/%m/%Y"),
                    each.get("quantity_purchased", ""),
                    each.get("tool__unit", ""),
                    each.get("tool_amount", 0.00),
                    (
                        round(
                            each.get("tool_amount") / each.get("quantity_purchased"), 2
                        )
                        if float(each.get("quantity_purchased")) != float(0)
                        or float(each.get("quantity_purchased")) != float(0)
                        else 0.00
                    ),
                    each.get("tool__rate", ""),
                    each.get("parent__status", ""),
                ]
                for i, each in enumerate(data_object_list, start=0)
            ]
            df_data = df_data or [["" for _ in range(10)]]

            return df_data
        else:
            df_data = [
                [
                    i + 1,
                    each.get("tool__name", ""),
                    each.get("sku_code", ""),
                    each.get("quantity_purchased", ""),
                    each.get("unit", ""),
                    each.get("amount", ""),
                    (
                        round(each.get("amount") / each.get("quantity_purchased"), 2)
                        if float(each.get("quantity_purchased")) != float(0)
                        or float(each.get("quantity_purchased")) != float(0)
                        else 0.00
                    ),
                    each.get("current_price"),
                    each.get("current_status", ""),
                ]
                for i, each in enumerate(data_object_list, start=0)
            ]
            df_data = df_data or [["" for _ in range(9)]]

            return df_data

    def createRequisitionReport(self, from_date, to_date, df_data, item=False):
        base_temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(base_temp_dir, exist_ok=True)

        temp_file_path = os.path.join(
            base_temp_dir, f"requisition_report_{from_date}_to_{to_date}.xlsx"
        )

        workbook = xlsxwriter.Workbook(temp_file_path)
        requisition_sheet = workbook.add_worksheet("REQUISITION REPORT")

        report_name = "REPORT NAME : REQUISITION REPORT"
        report_date = f"REPORT DATE : {from_date}  to {to_date} "
        merge_format, merge_format3 = SharedClass().getMergeFormat(workbook)

        requisition_sheet.merge_range(
            "A1:U2", "Golden Horn Containers Service", merge_format
        )
        requisition_sheet.merge_range("A3:U3", report_name, merge_format3)
        requisition_sheet.merge_range("A4:U4", report_date, merge_format3)
        requisition_sheet.merge_range("A5:U5", None, merge_format3)

        if item:
            requisition_sheet.add_table(
                f"A7:J{7 + len(df_data)}",
                {
                    "data": df_data,
                    "columns": [
                        {"header": "Order No"},
                        {"header": "Item Name"},
                        {"header": "SKU Code"},
                        {"header": "Date"},
                        {"header": "Quantity Purchased"},
                        {"header": "Unit"},
                        {"header": "Amount"},
                        {"header": "Average Price"},
                        {"header": "Current Price"},
                        {"header": "Status"},
                    ],
                },
            )

        else:
            requisition_sheet.add_table(
                f"A7:I{7 + len(df_data)}",
                {
                    "data": df_data,
                    "columns": [
                        {"header": "Sl.No."},
                        {"header": "Item Name"},
                        {"header": "SKU Code"},
                        {"header": "Quantity Purchased"},
                        {"header": "Unit"},
                        {"header": "Amount"},
                        {"header": "Average Price"},
                        {"header": "Current Price"},
                        {"header": "Status"},
                    ],
                },
            )

        workbook.close()
        return temp_file_path
