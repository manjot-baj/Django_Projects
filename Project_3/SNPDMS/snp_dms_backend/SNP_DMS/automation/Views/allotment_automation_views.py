from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone


from master.models import Location, Site
from depot.models import ContainerAllotment, Container, ContainerStock

from account.permissions import HasAllowedRoles


class CheckBookingNumber(views.APIView):
    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]
    

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            booking_no = data["booking_no"]

            if ContainerAllotment.objects.filter(booking_no=booking_no).exists():
                return Response(
                    {"successMsg": " Booking Number Exists"},
                    status=200,
                )
            return Response(
                {"errorMsg": "Booking Number Doesn't Exists"},
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)


class BookingNoAllotment(views.APIView):
    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]

    def validate_remaining_quantity(
        self, allotment_obj, alloted_containers, container_list
    ):
        remaining_quantity = allotment_obj.quantity - alloted_containers.count()
        if remaining_quantity < 0:
            allotment_obj.remaining = 0
            allotment_obj.save()
        if remaining_quantity < len(container_list):
            allotment_obj.quantity += len(container_list)
            allotment_obj.remaining += len(container_list) - int(remaining_quantity)
            allotment_obj.save()

        return allotment_obj

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            booking_no = data["booking_no"]
            container_list = data["container_list"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            rejected_containers = []
            container_not_found = []

            allotment_obj = ContainerAllotment.objects.get(booking_no=booking_no)
            alloted_containers = allotment_obj.container.all()
            self.validate_remaining_quantity(
                allotment_obj, alloted_containers, container_list
            )

            for each in container_list:
                if not Container.objects.filter(
                    container_no=each, location=location, site=site
                ).exists():
                    container_not_found.append(each)
                    continue
                if not Container.objects.filter(
                    container_no=each, status="OUT", location=location, site=site
                ).exists():
                    rejected_containers.append(each)
                    continue
                container = Container.objects.get(
                    container_no=each, status="OUT", location=location, site=site
                )
                if container in alloted_containers:
                    rejected_containers.append(each)
                    continue
                allotment_obj.add_container(container)
                stock = ContainerStock.objects.filter(container=container).latest("pk")
                stock.allotment_date = allotment_obj.booking_date
                stock.available_out_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.allotment_in_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.allotment_out_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.status = "Alloted"
                stock.booking_no = booking_no
                stock.save()
                stock.gate_out.booking_no = booking_no
                stock.gate_out.save()

            if container_not_found:
                return Response(
                    {"errorMsg": f" {container_not_found} containers does not exist"},
                    status=200,
                )

            if rejected_containers:
                return Response(
                    {
                        "errorMsg": f"Either these {rejected_containers} containers already has allotment or Container status is IN"
                    },
                    status=200,
                )

            return Response(
                {"successMsg": "Allotment has been succesfully Done"},
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)


class NewBookingNoAllotment(views.APIView):
    permission_classes = (IsAuthenticated,HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]

    def validate_allotment_data(self, data):
        if not data["booking_no"]:
            return {"errorMsg": "Please enter Booking No"}
        if not data["booking_date"]:
            return {"errorMsg": "Please enter booking date"}
        if not data["container_list"]:
            return {"errorMsg": "Please enter Containers"}
        if not data["quantity"]:
            return {"errorMsg": "Please enter quantity"}
        if not data["booking_party"]:
            return {"errorMsg": "Please enter Booking Party"}
        return data

    def post(self, request, *args, **kwargs):
        try:

            self.validate_allotment_data(data=request.data)
            data = request.data
            booking_no = data["booking_no"]
            container_list = data["container_list"]
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            container_not_found = []

            booking_date = datetime.datetime.strptime(
                data["booking_date"], "%Y-%m-%d"
            ).date()
            booking_party = data["booking_party"]
            validity_date = datetime.datetime.strptime(
                data["validity_date"], "%Y-%m-%d"
            ).date()
            quantity = data["quantity"]
            remarks = data["remarks"]
            rejected_containers = []
            allotment = ContainerAllotment.create(
                booking_date=booking_date,
                booking_no=booking_no,
                booking_party=booking_party,
                validity_date=validity_date,
                quantity=quantity,
                remarks=remarks,
            )
            allotment.save()

            for each in container_list:
                if not Container.objects.filter(
                    container_no=each, location=location, site=site
                ).exists():
                    container_not_found.append(each)
                    continue
                if not Container.objects.filter(
                    container_no=each, status="OUT", location=location, site=site
                ).exists():
                    rejected_containers.append(each)
                    continue
                container = Container.objects.get(
                    container_no=each, status="OUT", location=location, site=site
                )
                allotment.add_container(container)
                stock = ContainerStock.objects.filter(container=container).latest("pk")
                stock.allotment_date = allotment.booking_date
                stock.available_out_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.allotment_in_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.allotment_out_date_time = datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                )
                stock.status = "Alloted"
                stock.booking_no = booking_no
                stock.save()
                stock.gate_out.booking_no = booking_no
                stock.gate_out.booking_party = booking_party
                stock.gate_out.booking_date = booking_date
                stock.gate_out.save()

            if container_not_found:
                return Response(
                    {"errorMsg": f" {container_not_found} containers does not exist"},
                    status=200,
                )

            if rejected_containers:
                return Response(
                    {"errorMsg": f" {rejected_containers} Container status is not OUT"},
                    status=200,
                )
            return Response(
                {"successMsg": "Allotment has been succesfully Done"},
                status=200,
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)
