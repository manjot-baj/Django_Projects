from datetime import datetime

from django.utils import timezone

from common.exceptions import ValidationError
from depot.models import ContainerStock, GateOut
from master.functions import pagination_func
from master.models import Location, Site
from master.models_two import SealNo


class SealNoService:

    def listOfSealNos(self, params, on_page_data, pg_no):
        client_qs = SealNo.objects.getSealNoQuerysetByParams(params).order_by("-pk")

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, pg_no, client_qs)

        data = [self.sealNoTableData(each) for each in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def sealNoTableData(self, data):
        return data.get_seal_no()

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

    def strToNone(self, item):
        return {key: None if value == "" else value for key, value in item.items()}

    def validateData(self, data):
        converted_data = self.strToNone(data)
        mandatory_list = [
            converted_data["number"],
            converted_data["line"],
            converted_data["in_date"],
            converted_data["in_time"],
            converted_data["location"],
            converted_data["site"],
        ]
        if None in mandatory_list:
            raise ValidationError("Please provide mandatory data")

        return converted_data

    def createData(self, payload):

        self.validateData(payload)

        number = payload["number"]
        seal_box_number = payload["seal_box_number"]

        line = payload["line"]

        location = Location.objects.getLocationByName(payload["location"])

        site = Site.objects.getSiteByName(payload["site"])

        in_date_str = payload["in_date"]
        if not payload["in_date"]:
            in_date = datetime.now().astimezone(timezone.get_current_timezone()).date()
        else:

            in_date = datetime.strptime(in_date_str, "%Y-%m-%d").date()

        if not payload["in_time"]:
            in_time = datetime.now().astimezone(timezone.get_current_timezone()).time()
        else:

            in_time = datetime.strptime(payload["in_time"], "%H:%M").time()

        in_date_time = datetime.combine(in_date, in_time).astimezone(
            timezone.get_current_timezone()
        )

        if (
            SealNo.objects.filter(number=number).exists()
            or ContainerStock.objects.filter(seal_no=number).exists()
            or GateOut.objects.filter(seal_no=number).exists()
        ):
            raise ValidationError("Seal NO already exists")
        seal_no_params = {
            "number": number,
            "seal_box_number": seal_box_number,
            "location": location,
            "site": site,
            "line": line,
            "in_date": in_date_time,
        }
        seal_no_entry = SealNo.objects.createSealNo(seal_no_params)

    def updateData(self, payload, pk):
        self.validateData(payload)
        number = payload["number"]
        seal_box_number = payload["seal_box_number"]
        line = payload["line"]

        location = Location.objects.getLocationByName(payload["location"])

        site = Site.objects.getSiteByName(payload["site"])

        in_date_str = payload["in_date"]
        if not payload["in_date"]:
            in_date = datetime.now().astimezone(timezone.get_current_timezone()).date()
        else:

            in_date = datetime.strptime(in_date_str, "%Y-%m-%d").date()

        if not payload["in_time"]:
            in_time = datetime.now().astimezone(timezone.get_current_timezone()).time()
        else:

            in_time = datetime.strptime(payload["in_time"], "%H:%M").time()

        in_date_time = datetime.combine(in_date, in_time).astimezone(
            timezone.get_current_timezone()
        )

        # is_cut = payload["is_cut"]
        # is_damaged = payload["is_damaged"]
        # is_first_allotment = payload["is_first_allotment"]

        seal_no_object = SealNo.objects.getSealNoById(pk)

        if seal_no_object.is_lock:
            raise ValidationError("Sorry Seal No is Locked, Cannot Update")

        if seal_no_object.in_use and not seal_no_object.number == number:
            old_seal_no = seal_no_object.number
            stock = ContainerStock.objects.get(seal_no=old_seal_no)
            stock.seal_no = number
            stock.save()

        if not seal_no_object.in_use:
            seal_no_object.line = line
            seal_no_object.location = location
            seal_no_object.site = site

        seal_no_object.number = number
        seal_no_object.seal_box_number = seal_box_number
        seal_no_object.in_date = in_date_time
        # seal_no_object.is_cut = is_cut
        # seal_no_object.is_damaged = is_damaged
        # seal_no_object.is_first_allotment = is_first_allotment
        seal_no_object.save()
