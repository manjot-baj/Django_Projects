# error handling
from common.exceptions import ValidationError
from django.utils import timezone

# pagination
from master.functions import pagination_func


# models
from truck_tracking.models import TruckTracking
from master.models_two import Client


class TruckTrackingService:

    def addTruck(self, params):
        return TruckTracking.objects.createTruckEntry(params)

    def truckData(self, pk):
        obj = TruckTracking.objects.getTruckEntryById(pk)
        return self.formatTruckData(obj)

    def formatDuration(self, duration):
        # Convert the duration to total seconds
        total_seconds = int(duration.total_seconds())

        # Calculate hours, minutes, and seconds
        return f"{total_seconds // 3600:02}:{(total_seconds % 3600) // 60:02}:{total_seconds % 60:02}"

    def formatTruckData(self, obj):
        return {
            "pk": obj.pk,
            "line": obj.line,
            "transporter": obj.transporter.name if obj.transporter else "",
            "move_mode": obj.move_mode,
            "vehicle_no": obj.vehicle_no,
            "booking_no": obj.booking_no or "",
            "status": obj.status,
            "gate_in_time": obj.gate_in_time.astimezone(
                timezone.get_current_timezone()
            ).strftime("%Y-%m-%d %H:%M:%S"),
            "gate_out_time": (
                obj.gate_out_time.astimezone(timezone.get_current_timezone()).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
                if obj.gate_out_time
                else ""
            ),
            "time_since": self.formatDuration(obj.time_since) if obj.time_since else "",
            "container_no": obj.container_no,
            "location_id": obj.location_id,
            "site": obj.site_id,
        }

    def tableData(self, obj):
        return {
            "pk": obj.pk,
            "line": obj.line,
            "transporter": obj.transporter.name if obj.transporter else "",
            "move_mode": obj.move_mode,
            "vehicle_no": obj.vehicle_no,
            "booking_no": obj.booking_no or "",
            "status": obj.status,
            "gate_in_time": obj.gate_in_time.astimezone(
                timezone.get_current_timezone()
            ).strftime("%Y-%m-%d %H:%M:%S"),
            "gate_out_time": (
                obj.gate_out_time.astimezone(timezone.get_current_timezone()).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
                if obj.gate_out_time
                else ""
            ),
            "time_since": self.formatDuration(obj.time_since) if obj.time_since else "",
            "container_no": obj.container_no,
        }

    def listOfTruckData(self, params, page_no, on_page_data):
        queryset = TruckTracking.objects.filter(**params).order_by("-pk")

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(queryset, on_page_data, page_no)

        data = [self.tableData(each) for each in current_page.object_list]

        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def updateData(self, pk, container_no):
        obj = TruckTracking.objects.getTruckEntryById(pk)

        # User cannot update the data if status of truck is "OUT"
        if obj.status == "OUT":
            raise ValidationError(
                "Truck is already out, so the data cannot be updated."
            )
        obj.container_no = container_no
        obj.save(update_fields=["container_no"])

    def fetchTransporterRelatedToContainer(self, params):
        transporter = TruckTracking.objects.getTransporterDataByParams(params)
        return {
            "transporter": transporter["transporter__name"],
            "vehicle_no": transporter["vehicle_no"],
            "client": transporter["line"],
            "line": Client.objects.filter(
                name=transporter["line"],
                location_id=params["location_id"],
                site_id=params["site_id"],
            )
            .first()
            .ref_code
            or "",
        }

    def fetchVehicleNoRelatedToTransporter(self, params):
        data = TruckTracking.objects.getTruckTrackingQuerysetByParams(
            params
        ).values_list("vehicle_no", flat=True)
        return data

    def validateDuplicateData(
        self, transporter, location, site, vehicle_no, container_no=None
    ):

        params = {
            "transporter": transporter,
            "location_id": location,
            "site_id": site,
            "status": "IN QUEUE",
            "vehicle_no": vehicle_no,
        }
        if container_no is not None:
            params["container_no"] = container_no
        return TruckTracking.objects.checkTruckEntry(params)

    def truckDto(self, obj):
        return {
            "pk": obj.pk,
            "line": obj.line,
            "transporter": obj.transporter.name if obj.transporter else "",
            "move_mode": obj.move_mode,
            "vehicle_no": obj.vehicle_no,
            "status": obj.status,
            "gate_in_time": obj.gate_in_time.astimezone(
                timezone.get_current_timezone()
            ).strftime("%Y-%m-%d %H:%M:%S"),
            "container_no": obj.container_no,
            "location_id": obj.location_id,
            "site": obj.site_id,
        }

    def listOfTransporters(self, params):
        return TruckTracking.objects.getListOfTransportersByParams(params)
