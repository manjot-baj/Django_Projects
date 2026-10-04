from master.functions import pagination_func
from master.models import LocationCodeDetail


class LocationCodeService:
    def listOfLocationCodes(self, params, on_page_data, pg_no):
        location_code_qs = LocationCodeDetail.objects.getLocationCodeQuerysetByParams(
            params
        )
        if pg_no is None and on_page_data is None:
            return {"data": [self.locationCodeData(each) for each in location_code_qs]}
        else:

            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = self.paginationData(on_page_data, pg_no, location_code_qs)
            data = [self.locationCodeData(each) for each in current_page.object_list]
            return {
                "no_of_data": no_of_data_count,
                "on_page_data": on_page_data_count,
                "total_pages": no_of_pages,
                "prev_page": prev_page,
                "next_page": next_page,
                "data": data,
            }

    def locationCodeData(self, data):
        return data.get_location_code_detail()

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
