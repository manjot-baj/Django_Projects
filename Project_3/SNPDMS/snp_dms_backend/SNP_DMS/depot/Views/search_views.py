from urllib import response
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from master.models_two import *
from account.models import AccountUser
from ..models import *
from ..functions_two import *
import datetime

from account.permissions import HasAllowedRoles


class ContainerDetails(views.APIView):
    """
    Api to search IN process container dates,
    the post function will give requested container all IN process Dates
    according to location and site
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            container_no = request.data["container_no"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            try:
                container_object = Container.objects.get(
                    container_no=container_no, location=location, site=site
                )
                date = [
                    x.date.astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%d/%m/%Y")
                    for x in GateInHistory.objects.filter(container=container_object)
                ]
                return Response(
                    {"container_no": container_object.container_no, "dates": date},
                    status=200,
                )
            except Exception as e:
                return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class OutContainerDetails(views.APIView):
    """
    Api to search OUT process container dates,
    and also to get details for OUT process ready containers.
    if container is already OUT then,
    the post function will give requested container all OUT process Dates
    according to location and site
    else if container is not OUT but ready for Out Process then,
    the post function will give requested container details for OUT process
    according to location and site
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            container_no = request.data["container_no"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            container_object = Container.objects.get(
                container_no=container_no, location=location, site=site
            )
            try:
                stock_object = ContainerStock.objects.get(
                    container=container_object, container_status="IN"
                )
            except:
                stock_object = None
            line = container_object.client.ref_code
            seal_no_object_list = SealNo.objects.select_related(
                "location", "site"
            ).filter(is_available=True, location=location, site=site, line=line)
            seal_no_list = [each.number for each in seal_no_object_list]
            if (
                not stock_object is None
                and container_object.status == "IN"
                and container_object.in_do_not_lift_queue is False
            ):
                if stock_object.status in [
                    "Available",
                    "Alloted",
                    "Without_Repair_Available",
                ]:
                    container_object_data = container_object.get_container()
                    try:
                        manufacturing_date = (
                            datetime.datetime.strptime(
                                container_object_data["manufacturing_date"],
                                "%Y-%m-%d",
                            )
                            .date()
                            .strftime("%d/%m/%Y")
                        )
                    except:
                        manufacturing_date = ""
                    container_object_data["manufacturing_date"] = manufacturing_date
                    gate_in_object_data = stock_object.gate_in.get_gate_in()
                    condition = gate_in_object_data["condition"]
                    try:
                        allotment_object = ContainerAllotment.objects.get(
                            booking_no=stock_object.booking_no
                        )
                        allotment_object_data = allotment_object.get_allotment()
                        booking_no = allotment_object_data["booking_no"]
                        booking_date = allotment_object_data["booking_date"]
                        booking_party = allotment_object_data["booking_party"]
                    except:
                        booking_no = ""
                        booking_date = ""
                        booking_party = ""
                    stock_object_data = stock_object.get_stock()
                    grade = stock_object_data["grade"]
                    gate_out_data = {
                        "booking_no": booking_no,
                        "booking_date": booking_date,
                        "booking_party": booking_party,
                        "seal_no": stock_object_data["seal_no"],
                        "condition": condition,
                        "grade": grade,
                    }
                    if not len(gate_out_data["booking_date"]) == 0:
                        booking_date = (
                            datetime.datetime.strptime(
                                gate_out_data["booking_date"], "%Y-%m-%d"
                            )
                            .date()
                            .strftime("%d/%m/%Y")
                        )
                        gate_out_data["booking_date"] = booking_date
                    gih_object = GateInHistory.objects.get(
                        container=container_object, gate_in=stock_object.gate_in
                    )

                    return Response(
                        {
                            "container_data": container_object_data,
                            "gate_out_data": gate_out_data,
                            "gih_pk": gih_object.pk,
                            "flag": "OUT",
                            "seal_no_list": seal_no_list,
                        },
                        status=200,
                    )
                else:
                    return Response(
                        {
                            "errorMsg": f"Container is not available yet for Out process."
                        },
                        status=200,
                    )
            else:
                try:
                    date = [
                        x.date.astimezone(timezone.get_current_timezone())
                        .date()
                        .strftime("%d/%m/%Y")
                        for x in GateOutHistory.objects.filter(
                            container=container_object
                        )
                    ]
                    return Response(
                        {
                            "container_no": container_object.container_no,
                            "dates": date,
                            "flag": "OUT EDIT",
                            "seal_no_list": seal_no_list,
                        },
                        status=200,
                    )
                except Exception as e:
                    return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class LoloPaymentDetail(views.APIView):
    """
    Api to search cheque or utr no payment objects for lolo aka. Handling
    the post function will give all payment data by taking cheque no or utr no
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            number = request.data["number"]
            try:
                try:
                    main_data = HandlingPayment.objects.get(
                        cheque_no=number
                    ).get_payment_details()
                    return Response(main_data, status=200)
                except:
                    main_data = HandlingPayment.objects.get(
                        utr_no=number
                    ).get_payment_details()
                    return Response(main_data, status=200)
            except Exception as e:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class SelfTransportationPaymentDetail(views.APIView):
    """
    Api to search cheque or utr no payment objects for st aka. SelfTransportation
    the post function will give all payment data by taking cheque no or utr no
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            number = request.data["number"]
            try:
                try:
                    main_data = SelfTransportationPayment.objects.get(
                        cheque_no=number
                    ).get_payment_details()
                    return Response(main_data, status=200)
                except:
                    main_data = SelfTransportationPayment.objects.get(
                        utr_no=number
                    ).get_payment_details()
                    return Response(main_data, status=200)
            except Exception as e:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
