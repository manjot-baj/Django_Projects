from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from account.models import AccountUser
from master.models import Location, Site
from depot.models import (
    Container,
    GateInHistory,
    GateOutHistory,
    ContainerStock,
    SealNo,
    ContainerAllotment,
    HandlingPayment,
    SelfTransportationPayment,
)
import datetime
from common.error_logging import ErrorLogging


class ContainerSearchService:
    """Service class to handle container-related data retrieval and payment searches."""

    @staticmethod
    def get_container_in_details(request):
        """Retrieve all IN process dates for a specified container based on location and site."""
        if not request.data:
            return Response(
                {"errorMsg": "Please provide Data"}, status=status.HTTP_200_OK
            )
        try:
            container_no = request.data.get("container_no")
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)

            # Determine location and site
            try:
                location = Location.objects.get(name=request.data.get("location"))
                site = Site.objects.get(name=request.data.get("site"))
            except (Location.DoesNotExist, Site.DoesNotExist):
                location = app_user.location
                site = app_user.site

            # Fetch container and gate-in history
            try:
                container_object = Container.objects.get(
                    container_no=container_no, location=location, site=site
                )
                dates = [
                    x.date.astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%d/%m/%Y")
                    for x in GateInHistory.objects.filter(container=container_object)
                ]
                return Response(
                    {"container_no": container_object.container_no, "dates": dates},
                    status=status.HTTP_200_OK,
                )
            except Container.DoesNotExist:
                return Response(
                    {"errorMsg": "Container not found"}, status=status.HTTP_200_OK
                )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid credentials [{str(e)}]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def get_container_out_details(request):
        """Retrieve OUT process dates or details for containers ready for OUT process based on location and site."""
        if not request.data:
            return Response(
                {"errorMsg": "Please provide Data"}, status=status.HTTP_200_OK
            )
        try:
            container_no = request.data.get("container_no")
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)

            # Determine location and site
            try:
                location = Location.objects.get(name=request.data.get("location"))
                site = Site.objects.get(name=request.data.get("site"))
            except (Location.DoesNotExist, Site.DoesNotExist):
                location = app_user.location
                site = app_user.site

            # Fetch container
            try:
                container_object = Container.objects.get(
                    container_no=container_no, location=location, site=site
                )
            except Container.DoesNotExist:
                return Response(
                    {"errorMsg": "Container not found"}, status=status.HTTP_200_OK
                )

            # Check if container is in stock and ready for OUT process
            try:
                stock_object = ContainerStock.objects.get(
                    container=container_object, container_status="IN"
                )
            except ContainerStock.DoesNotExist:
                stock_object = None

            line = (
                container_object.client.ref_code
                if hasattr(container_object, "client")
                else ""
            )
            seal_no_list = [
                each.number
                for each in SealNo.objects.select_related("location", "site").filter(
                    is_available=True, location=location, site=site, line=line
                )
            ]

            if (
                stock_object
                and container_object.status == "IN"
                and not container_object.in_do_not_lift_queue
                and stock_object.status
                in ["Available", "Alloted", "Without_Repair_Available"]
            ):
                # Container is ready for OUT process
                container_data = container_object.get_container()
                container_data["manufacturing_date"] = (
                    datetime.datetime.strptime(
                        container_data["manufacturing_date"], "%Y-%m-%d"
                    )
                    .date()
                    .strftime("%d/%m/%Y")
                    if container_data.get("manufacturing_date")
                    else ""
                )
                gate_in_data = stock_object.gate_in.get_gate_in()
                condition = gate_in_data.get("condition", "")

                # Fetch allotment details
                try:
                    allotment_object = ContainerAllotment.objects.get(
                        booking_no=stock_object.booking_no
                    )
                    allotment_data = allotment_object.get_allotment()
                    booking_no = allotment_data.get("booking_no", "")
                    booking_date = (
                        datetime.datetime.strptime(
                            allotment_data["booking_date"], "%Y-%m-%d"
                        )
                        .date()
                        .strftime("%d/%m/%Y")
                        if allotment_data.get("booking_date")
                        else ""
                    )
                    booking_party = allotment_data.get("booking_party", "")
                except ContainerAllotment.DoesNotExist:
                    booking_no = ""
                    booking_date = ""
                    booking_party = ""

                stock_data = stock_object.get_stock()
                gate_out_data = {
                    "booking_no": booking_no,
                    "booking_date": booking_date,
                    "booking_party": booking_party,
                    "seal_no": stock_data.get("seal_no", ""),
                    "condition": condition,
                    "grade": stock_data.get("grade", ""),
                }

                gih_object = GateInHistory.objects.get(
                    container=container_object, gate_in=stock_object.gate_in
                )

                return Response(
                    {
                        "container_data": container_data,
                        "gate_out_data": gate_out_data,
                        "gih_pk": gih_object.pk,
                        "flag": "OUT",
                        "seal_no_list": seal_no_list,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # Container is already OUT, return OUT process dates
                try:
                    dates = [
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
                            "dates": dates,
                            "flag": "OUT EDIT",
                            "seal_no_list": seal_no_list,
                        },
                        status=status.HTTP_200_OK,
                    )
                except Exception as e:
                    return Response(
                        {"errorMsg": f"Data Not Found [{str(e)}]"},
                        status=status.HTTP_200_OK,
                    )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid credentials [{str(e)}]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def get_lolo_payment_details(request):
        """Retrieve payment details for handling (lolo) by cheque or UTR number."""
        if not request.data:
            return Response(
                {"errorMsg": "Please provide Data"}, status=status.HTTP_200_OK
            )
        try:
            number = request.data.get("number")
            try:
                payment = HandlingPayment.objects.get(cheque_no=number)
                return Response(
                    payment.get_payment_details(), status=status.HTTP_200_OK
                )
            except HandlingPayment.DoesNotExist:
                try:
                    payment = HandlingPayment.objects.get(utr_no=number)
                    return Response(
                        payment.get_payment_details(), status=status.HTTP_200_OK
                    )
                except HandlingPayment.DoesNotExist:
                    return Response(
                        {"errorMsg": "Payment not found"}, status=status.HTTP_200_OK
                    )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid credentials [{str(e)}]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def get_self_transportation_payment_details(request):
        """Retrieve payment details for self-transportation by cheque or UTR number."""
        if not request.data:
            return Response(
                {"errorMsg": "Please provide Data"}, status=status.HTTP_200_OK
            )
        try:
            number = request.data.get("number")
            try:
                payment = SelfTransportationPayment.objects.get(cheque_no=number)
                return Response(
                    payment.get_payment_details(), status=status.HTTP_200_OK
                )
            except SelfTransportationPayment.DoesNotExist:
                try:
                    payment = SelfTransportationPayment.objects.get(utr_no=number)
                    return Response(
                        payment.get_payment_details(), status=status.HTTP_200_OK
                    )
                except SelfTransportationPayment.DoesNotExist:
                    return Response(
                        {"errorMsg": "Payment not found"}, status=status.HTTP_200_OK
                    )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid credentials [{str(e)}]"},
                status=status.HTTP_200_OK,
            )
