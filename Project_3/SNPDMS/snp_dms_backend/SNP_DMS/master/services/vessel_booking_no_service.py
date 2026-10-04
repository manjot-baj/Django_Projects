from master.functions import pagination_func
from master.models import VesselBkgNo


class VesselBookingService:
    def deleteVesselBookingNo(self, pk_list):
        not_deleted = []
        vessel_booking_no_qs = VesselBkgNo.objects.filter(pk__in=pk_list)
        for each in vessel_booking_no_qs:

            if any([each.vessel_voyage_bkgno_rel.exists()]):
                not_deleted.append(each.number)
            else:
                each.delete()
        return not_deleted

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

    def listOfVesselBookingNo(self, params, on_page_data, page_no):
        vessel_booking_qs = VesselBkgNo.objects.getVesselBookingNoQuerysetByParams(
            params
        )
        if page_no is None and on_page_data is None:
            return {"data": [each.get_vessel_bkgno() for each in vessel_booking_qs]}
        else:

            (
                no_of_data_count,
                on_page_data_count,
                no_of_pages,
                prev_page,
                next_page,
                current_page,
            ) = self.paginationData(on_page_data, page_no, vessel_booking_qs)
            data = [each.get_vessel_bkgno() for each in current_page.object_list]
            return {
                "no_of_data": no_of_data_count,
                "on_page_data": on_page_data_count,
                "total_pages": no_of_pages,
                "prev_page": prev_page,
                "next_page": next_page,
                "data": data,
            }
