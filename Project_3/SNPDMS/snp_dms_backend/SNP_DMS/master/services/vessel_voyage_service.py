from master.functions import pagination_func
from master.models import VesselVoyageDetail


class VesselVoyageService:

    def vesselVoyageData(self, data):

        data = {
            "pk": data.pk,
            "vessel_name": data.vessel_name,
            "voyage_no": data.voyage_no,
            "booking_no": data.bkg.number,
            "vessel_voyage_name": data.vessel_voyage,
        }
        return data

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

    def listOfVesselVoyage(self, params, on_page_data, page_no):
        vessel_voyage_qs = VesselVoyageDetail.objects.getVesselVoyageQuerysetByParams(
            params
        )
        if page_no is None and on_page_data is None:
            return {
                "data": [each.get_vessel_voyage_detail() for each in vessel_voyage_qs]
            }
        else:

            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = self.paginationData(on_page_data, page_no, vessel_voyage_qs)
            data = [
                each.get_vessel_voyage_detail() for each in current_page.object_list
            ]
            return {
                "no_of_data": no_of_data_count,
                "on_page_data": on_page_data_count,
                "total_pages": no_of_pages,
                "prev_page": prev_page,
                "next_page": next_page,
                "data": data,
            }
