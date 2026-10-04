from master.functions import pagination_func
from master.models import Transporter


class TransporterService:
    def deleteTransporter(self, queryset):
        not_deleted = []
        for transporter in queryset:
            if any(
                [
                    transporter.gate_in_transporter_rel.exists(),
                    transporter.self_transportation_transporter_rel.exists(),
                    transporter.gate_out_transporter_rel.exists(),
                ]
            ):

                not_deleted.append(transporter.name)
            else:
                transporter.delete()

        return not_deleted

    def tableData(self, obj):
        return {
            "pk": obj.pk,
            "name": obj.name,
            "code": obj.code,
            "location": obj.location.name,
            "site": obj.site.name,
        }

    def listOfTransporter(self, params, on_page_data, page_no):
        queryset = Transporter.objects.getTransporterQuerysetByParams(params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(queryset, on_page_data, page_no)

        # response_data = []
        start_index = current_page.start_index() - 1
        response_data = [
            {**self.tableData(each), "sr_no": index + 1}
            for index, each in enumerate(current_page, start=start_index)
        ]
        # for index, each in enumerate(
        #         current_page, start=current_page.start_index() - 1
        # ):
        #     data_dict = each.get_transporter()
        #     data_dict["sr_no"] = index + 1
        #     response_data.append(data_dict)
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": response_data,
        }
