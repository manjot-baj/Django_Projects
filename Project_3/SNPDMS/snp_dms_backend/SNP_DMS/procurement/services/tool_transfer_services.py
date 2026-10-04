from master.functions import pagination_func

# models
from procurement.models import (
    ToolTransfer,
    ToolTransferLine,
    ToolTransferHistory,
    ToolRoom,
    SharedClass,
)


class ToolTransferService:

    def toolRequestFormData(self, pk):
        tool_transfer = ToolTransfer.manager.getToolTransferById(pk=pk)
        tool_transfer_line = ToolTransferLine.manager.getToolTransferLineByParent(
            tool_transfer
        )

        line_data = []
        if tool_transfer_line:
            for each in tool_transfer_line:
                line_data.append(
                    {
                        "pk": each.pk,
                        "tool_id": each.tool_id,
                        "name": each.tool.name,
                        "category": each.tool.category.name,
                        "category_id": each.tool.category_id,
                        "received_quantity": each.received_quantity,
                        "required_quantity": each.required_quantity,
                        "sku_code": each.tool.sku_code,
                        "unit": each.tool.unit,
                        "rate": each.tool.rate,
                    }
                )

        return {
            "pk": tool_transfer.pk,
            "location_id": tool_transfer.location_id,
            "site_id": tool_transfer.site_id,
            "location": tool_transfer.location.name,
            "site": tool_transfer.site.name,
            "date": tool_transfer.date.strftime("%Y-%m-%d"),
            "tool_transfer_no": tool_transfer.tool_transfer_no,
            "transfer_type": tool_transfer.transfer_type,
            "status": tool_transfer.status,
            "tool_request_line": line_data,
            "requested_from": (tool_transfer.requested_from_id),
            "requested_from_site": tool_transfer.requested_from.name,
            "requested_from_location": tool_transfer.requested_from.location.name,
            "status_list": (
                ["Partial Approved", "Approved"]
                if tool_transfer.status == "Pending"
                else ["CLOSED"]
            ),
        }

    def updateToolTransferLine(self, line_params, parent, location, site):

        for each in line_params:

            line = ToolTransferLine.manager.getToolTransferLineById(each.get("pk"))
            tool = ToolRoom.manager.getToolByName(line.tool.name, location, site)
            line.tool.rate = tool.rate
            line.tool.sku_code = tool.sku_code
            line.tool.unit = tool.unit
            line.tool.save(update_fields=["rate", "sku_code", "unit"])

            if float(each.get("received_quantity")) > float(line.received_quantity):

                stock_qty = float(each.get("received_quantity")) - float(
                    line.received_quantity
                )

                line.tool.in_stock = float(line.tool.in_stock) + stock_qty
                line.tool.save(update_fields=["in_stock"])

                line.received_quantity = float(each.get("received_quantity"))
                line.save(update_fields=["received_quantity"])

                ToolRoom.manager.decrementStock(
                    tool.pk,
                    stock_qty,
                )

                tool_rate_history_params = {
                    "parent": parent,
                    "approved_by_id": site,
                    "tool": line.tool,
                    "tools_added": stock_qty,
                }
                ToolTransferHistory.manager.createToolTransferHistory(
                    tool_rate_history_params
                )

            else:
                stock_qty = float(line.received_quantity) - float(
                    each.get("received_quantity")
                )
                line.tool.in_stock = float(line.tool.in_stock) - stock_qty

                line.tool.save(update_fields=["in_stock"])
                line.received_quantity = float(each.get("received_quantity"))
                line.save(update_fields=["received_quantity"])
                ToolRoom.manager.incrementStock(
                    tool.pk,
                    stock_qty,
                )
                tool_rate_history_params = {
                    "parent": parent,
                    "approved_by_id": site,
                    "tool": line.tool,
                    "tools_removed": stock_qty,
                }
                ToolTransferHistory.manager.createToolTransferHistory(
                    tool_rate_history_params
                )

    def getToolRequestTableData(self, params, payload):
        tool_request_data = []
        tool_transfer_pk = ToolTransferLine.manager.getToolTransferIds(params)
        tool_transfer_data = ToolTransfer.manager.toolTransferQueryset(tool_transfer_pk)
        on_page_data = payload.get("on_page_data")
        pg_no = payload.get("pg_no")
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(tool_transfer_data, on_page_data, pg_no)

        for each in current_page.object_list:
            tool_request_data.append(
                {
                    "pk": each.pk,
                    "date": each.date.strftime("%Y-%m-%d"),
                    "tool_transfer_no": each.tool_transfer_no,
                    "location": each.location.name,
                    "site": each.site.name,
                    "status": each.status,
                    "requested_from": (
                        each.requested_from.name if each.requested_from else ""
                    ),
                }
            )
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": tool_request_data,
        }

    def toolTransferNo(self, location, site, transfer_type):

        site_obj = SharedClass().getSiteById(site)
        site_obj = SharedClass().getSiteById(site)
        label = f"GHCS{site_obj.code}-"
        if transfer_type == "Location Transfer":
            label = f"GHCS{site_obj.location.code}-"
        params = {
            "location_id": location,
            "site_id": site,
            "transfer_type": transfer_type,
        }
        queryset = ToolTransfer.manager.getToolTransfers(params)
        count = ToolTransfer.manager.aggregateMaxOrderNoCount(queryset)

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

        while ToolTransfer.manager.checkIfToolTransferNoExists(
            location, site, orderNo, transfer_type
        ):
            nextSerialNumber += 1
            if nextSerialNumber < 10:
                serialNumber = "0" + str(nextSerialNumber)
            else:
                serialNumber = str(nextSerialNumber)

            orderNo = label + serialNumber

        return orderNo
