from master.models_two import GroundRent
from master.functions import pagination_func


class GroundRentService:

    def paginationData(self, params, on_page_data, page_no):
        ground_rent_qs = GroundRent.objects.getGroundRentQuerysetByParams(params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(ground_rent_qs, on_page_data, page_no)
        return (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        )

    def groundRentData(self, data):

        data = {
            "pk": self.pk,
            "client_ref_code": self.client_ref_code,
            "day_1_to_30_amount": str(self.day_1_to_30_amount),
            "day_31_to_60_amount": str(self.day_31_to_60_amount),
            "day_61_to_90_amount": str(self.day_61_to_90_amount),
            "day_91_to_120_amount": str(self.day_91_to_120_amount),
            "day_over_120_amount": str(self.day_over_120_amount),
            "size": data.size.name if data.size else "",
            "location": data.location.name,
            "site": data.site.name,
        }
        return data

    def listOfGroundRent(self, params, on_page_data, page_no):
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(params, on_page_data, page_no)
        data = [each.get_ground_rent_detail() for each in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }
