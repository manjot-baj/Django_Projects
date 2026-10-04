from master.functions import pagination_func
from master.models import CarrierCode


class CarrierCodeService:
    def carrierCodeData(self, data):
        return data.get_carrier_code()

    def listOfCarrierCodes(self, params, on_page_data, page_no):
        carrier_code_qs = CarrierCode.objects.getCarrierCodeQuerysetByParams(params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, page_no, carrier_code_qs)
        data = [self.carrierCodeData(each) for each in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

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
