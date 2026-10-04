from procurement.models import Consumption, ToolRoom, ConsumptionLine, SharedClass
from datetime import datetime
from decimal import Decimal
from master.functions import pagination_func
import os
import xlsxwriter
from SNP_DMS.settings.base import BASE_DIR

# error handling
from common.exceptions import ValidationError


class ConsumptionService:
    def consumptionNo(self, location, site):
        site_obj = SharedClass().getSiteById(site)
        label = f"GHCS{site_obj.code}-"
        params = {"location": location, "site": site}
        queryset = Consumption.manager.getConsumptions(params)
        count = Consumption.manager.aggregateMaxOrderNoCount(queryset)

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

        while Consumption.manager.checkIfConsumptionNoExists(location, site, orderNo):
            nextSerialNumber += 1
            if nextSerialNumber < 10:
                serialNumber = "0" + str(nextSerialNumber)
            else:
                serialNumber = str(nextSerialNumber)

            orderNo = label + serialNumber

        return orderNo

    def validateConsumptionLines(self, data, location, site):
        names_and_quantities = [
            (each.get("name"), each.get("consumed_quantity")) for each in data
        ]
        names = [name for name, _ in names_and_quantities]
        tool_rooms = ToolRoom.manager.getToolDataForConsumption(
            names,
            location,
            site,
        )

        tool_rooms_dict = {tool["name"]: tool["count"] for tool in tool_rooms}

        return [
            tool_rooms_dict.get(name, 0) <= quantity
            for name, quantity in names_and_quantities
        ]

    def addConsumption(self, payload, location, site):
        date_str = payload.get("date")
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except:
            raise ValidationError("Date Format is wrong, Is should be YYYY-MM-DD")
        params = {
            "location_id": location,
            "site_id": site,
            "date": date,
            "consumption_no": payload.get("consumption_no"),
        }
        return Consumption.manager.createConsumption(params)

    def addConsumptionLine(self, parent, payload, location, site):

        for each in payload:
            tool = ToolRoom.manager.getToolById(
                each.get("tool_id"),
            )
            remarks = each.get("remarks")
            consumed_quantity = each.get("consumed_quantity")
            params = {
                "parent": parent,
                "tool": tool,
                "consumed_quantity": consumed_quantity,
                "remarks": remarks,
            }
            ConsumptionLine.manager.createConsumptionLine(params)
            tool.in_stock -= Decimal(consumed_quantity)
            tool.save(update_fields=["in_stock"])

    def consumption(self, pk):
        instance = Consumption.manager.getConsumptionById(pk)
        data = self.consumptionData(instance)
        line = ConsumptionLine.manager.getConsumptionByParents(instance)

        consumption_line = [self.consumptionLineData(each) for each in line]
        data["consumption_line"] = consumption_line
        return data

    def consumptionData(self, data):
        return {
            "pk": data.pk,
            "consumption_no": data.consumption_no,
            "date": data.date,
            "location_id": data.location_id,
            "site_id": data.site_id,
            "delete_history_lines": [],
        }

    def consumptionTableData(self, data):
        return {
            "pk": data.pk,
            "consumption_no": data.consumption_no,
            "date": data.date,
        }

    def consumptionLineData(self, data):
        return {
            "pk": data.pk,
            "category_id": data.tool.category_id,
            "tool_id": data.tool_id,
            "category": data.tool.category.name,
            "name": data.tool.name,
            "consumed_quantity": data.consumed_quantity,
            "rate": data.tool.rate,
            "in_stock": data.tool.in_stock,
            "sku_code": data.tool.sku_code,
            "remarks": data.remarks,
        }

    def updateConsumption(self, pk, data, location, site):

        date_str = data.get("date")
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except:
            raise ValidationError("Date format is incorrect.")

        instance = Consumption.manager.getConsumptionById(pk=pk)
        instance.location_id = location
        instance.site_id = site
        instance.date = date
        instance.save()
        return instance

    def updateConsumptionLine(self, parent, data, location, site):

        instances = []

        ids = [each.get("tool_id") for each in data]
        tool_room = ToolRoom.manager.getToolsByIdsIn(
            ids,
            location,
            site,
        )

        tool_room_dict = {each.pk: each for each in tool_room}

        for each in data:
            tool = tool_room_dict.get(each.get("tool_id"))
            remarks = each.get("remarks")
            consumed_quantity = each.get("consumed_quantity")
            if "pk" in each.keys():
                instance = ConsumptionLine.manager.getConsumptionLineById(
                    each.get("pk")
                )
                tool.in_stock += instance.consumed_quantity
                tool.save(update_fields=["in_stock"])
                instance.parent = parent
                instance.tool_id = each.get("tool_id")
                instance.consumed_quantity = consumed_quantity
                instance.remarks = remarks
                instance.save()
            else:
                params = {
                    "parent": parent,
                    "tool_id": each.get("tool_id"),
                    "consumed_quantity": consumed_quantity,
                    "remarks": remarks,
                }
                instance = ConsumptionLine.manager.createConsumptionLine(params)
                instances.append(instance)

            tool.in_stock -= Decimal(consumed_quantity)
            tool.save(update_fields=["in_stock"])
        ConsumptionLine.manager.bulkCreate(instances)
        return True

    def revertChanges(self, parent):
        consumption_line = ConsumptionLine.manager.getConsumptionByParents(parent)
        for each in consumption_line:
            each.tool.in_stock += each.consumed_quantity
            each.tool.save(update_fields=["in_stock"])

    def listConsumption(self, data):
        on_page_data = data.get("on_page_data")
        pg_no = data.get("pg_no")
        location = data.get("location_id")
        site = data.get("site_id")

        param = {}
        if location:
            param["parent__location_id"] = location
        if site:
            param["parent__site_id"] = site
        if data.get("from_date") and data.get("to_date"):
            param["parent__date__range"] = (data.get("from_date"), data.get("to_date"))
        if data.get("name"):
            param["tool__name"] = data.get("name")
        if data.get("consumption_no"):
            param["parent__consumption_no"] = data.get("consumption_no")
        if data.get("category"):
            param["tool__category__name"] = data.get("category")

        list_of_pks = ConsumptionLine.manager.getListOfIds(param)
        consumption_params = {"pk__in": list_of_pks}
        filtered_data = Consumption.manager.getConsumptions(consumption_params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(filtered_data, on_page_data, pg_no)

        filtered_data = [
            self.consumptionTableData(each) for each in current_page.object_list
        ]

        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": filtered_data,
        }

    def consumptionDfData(self, data_object_list, item=False):
        if item:
            df_data = [
                [
                    each.get("parent__consumption_no", ""),
                    each.get("tool__name", ""),
                    each.get("tool__sku_code", ""),
                    each.get("parent__date").strftime("%d/%m/%Y"),
                    each.get("quantity_consumed", ""),
                    each.get("tool__unit", ""),
                ]
                for _, each in enumerate(data_object_list, start=0)
            ]
            df_data = df_data or [["" for _ in range(6)]]

            return df_data
        else:
            df_data = [
                [
                    i + 1,
                    each.get("tool__name", ""),
                    each.get("sku_code", ""),
                    each.get("quantity_consumed", ""),
                    each.get("unit", ""),
                ]
                for i, each in enumerate(data_object_list, start=0)
            ]
            df_data = df_data or [["" for _ in range(5)]]

            return df_data

    def createConsumptionReport(self, from_date, to_date, df_data, item=False):
        base_temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(base_temp_dir, exist_ok=True)

        temp_file_path = os.path.join(
            base_temp_dir, f"consumption_report_{from_date}_to_{to_date}.xlsx"
        )

        workbook = xlsxwriter.Workbook(temp_file_path)
        consumption_sheet = workbook.add_worksheet("CONSUMPTION REPORT")

        report_name = "REPORT NAME : CONSUMPTION REPORT"
        report_date = f"REPORT DATE : {from_date}  to {to_date} "
        merge_format, merge_format3 = SharedClass().getMergeFormat(workbook)

        consumption_sheet.merge_range(
            "A1:U2", "Golden Horn Containers Service", merge_format
        )
        consumption_sheet.merge_range("A3:U3", report_name, merge_format3)
        consumption_sheet.merge_range("A4:U4", report_date, merge_format3)
        consumption_sheet.merge_range("A5:U5", None, merge_format3)

        if item:
            consumption_sheet.add_table(
                f"A7:F{7 + len(df_data)}",
                {
                    "data": df_data,
                    "columns": [
                        {"header": "Consumption No"},
                        {"header": "Item Name"},
                        {"header": "SKU Code"},
                        {"header": "Date"},
                        {"header": "Quantity Consumed"},
                        {"header": "Unit"},
                    ],
                },
            )
        else:
            consumption_sheet.add_table(
                f"A7:E{7 + len(df_data)}",
                {
                    "data": df_data,
                    "columns": [
                        {"header": "Sl.No."},
                        {"header": "Item Name"},
                        {"header": "SKU Code"},
                        {"header": "Quantity Consumed"},
                        {"header": "Unit"},
                    ],
                },
            )
        workbook.close()
        return temp_file_path
