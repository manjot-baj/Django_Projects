from master.models_two import TransportationCharge
from master.functions import pagination_func


class TransportationChargeService:

    def paginationData(self, params, on_page_data, page_no):
        transportation_charge_qs = (
            TransportationCharge.objects.getTransportationChargeQuerysetByParams(params)
        )
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(transportation_charge_qs, on_page_data, page_no)
        return (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        )

    def listOfTransportationCharge(self, params, on_page_data, page_no):
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(params, on_page_data, page_no)
        data = [each.get_charge_detail() for each in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }
