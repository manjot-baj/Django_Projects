import datetime
import os
import pandas as pd
from openpyxl import load_workbook
from django.utils import timezone
from django.core.paginator import Paginator
from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
from django.db import transaction
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from account.models import AccountUser
from master.models import (
    Location,
    Site,
    ContainerType,
    ContainerSize,
    Transporter,
    ExportCargoType,
)
from master.models_two import Client, ClientAbbreviation, SealNo, SealUpdateTracker
from depot.models import (
    Container,
    ContainerStock,
    GateIn,
    GateOut,
    GateOutHistory,
    Eir,
    Handling,
    ContainerInOutRecord,
    GateInHistory,
    ContainerAllotment,
    AllotmentTracker,
)
from depot.lolo_finance_models import PreGateIn
from depot.functions import save_default_eir_img
from depot.functions_two import check_digit
from report.functions2 import user_data
from edi.cycle_functions import zim_repair_edi_mail_process
from SNP_DMS.settings.base import BASE_DIR
from ..functions import (
    extract_excel_data,
    generic_stock_sheet_main_data,
    create_generic_stock_sheet_wb,
    create_allotment_track_record,
)
from common.error_logging import ErrorLogging


class StockService:

    @staticmethod
    def validate_request_data(data):
        """Validate that request data is not empty."""
        if not data:
            raise ValidationError("Please provide Data")
        return data

    @staticmethod
    def validate_location_and_site(request_data, user):
        """Validate location and site, falling back to user's defaults if not provided."""
        try:
            location = Location.objects.get(name=request_data["location"])
            site = Site.objects.get(name=request_data["site"], location=location)
        except:
            location = user.location
            site = user.site
        return location, site

    @staticmethod
    def validate_date_field(date_str, format_str="%Y-%m-%d"):
        """Validate date field and return parsed date or None."""
        if not date_str:
            return None
        try:
            return datetime.datetime.strptime(date_str, format_str).date()
        except:
            return None

    @staticmethod
    def validate_numeric_field(value, is_float=True):
        """Validate if a field is numeric and return converted value or default."""
        if not value or not value.replace(".", "", 1).isnumeric():
            return 0
        return float(value) if is_float else int(value)

    @staticmethod
    def get_container_stock(request_data, user):
        """Retrieve container stock with pagination and filtering."""
        try:
            StockService.validate_request_data(request_data)
            pg_no = request_data["pg_no"]
            on_page_data = request_data["on_page_data"]
            location, site = StockService.validate_location_and_site(request_data, user)
            ref_code = request_data.get("ref_code")
            queued_recently = request_data.get("queued_recently")
            out_history = request_data.get("out_history") == "True"
            do_not_lift_queue = request_data.get("do_not_lift_queue") == "True"

            queryset = ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
            )

            if out_history:
                queryset = queryset.filter(container_status="OUT")
                if location != "ALL":
                    queryset = queryset.filter(container__location__name=location)
                    if site != "ALL":
                        queryset = queryset.filter(container__site__name=site)
            else:
                queryset = queryset.filter(
                    container_status="IN",
                    container__in_do_not_lift_queue=do_not_lift_queue,
                )
                if location != "ALL":
                    queryset = queryset.filter(container__location__name=location)
                    if site != "ALL":
                        queryset = queryset.filter(container__site__name=site)
                if queued_recently:
                    queryset = queryset.filter(container__queued_recently=True)

            if ref_code:
                queryset = queryset.filter(container__client__ref_code=ref_code)
            if request_data.get("client"):
                queryset = queryset.filter(
                    container__client__name=request_data["client"]
                )
            if request_data.get("container_no"):
                queryset = queryset.filter(
                    container__container_no__in=request_data["container_no"]
                )
            if request_data.get("booking_no"):
                queryset = queryset.filter(booking_no=request_data["booking_no"])
            if request_data.get("status"):
                queryset = queryset.filter(status=request_data["status"])

            gate_in_date = request_data.get("gate_in_date", {})
            if gate_in_date.get("from") and gate_in_date.get("to"):
                queryset = queryset.filter(
                    gate_in__in_date__range=[gate_in_date["from"], gate_in_date["to"]]
                )

            gate_out_date = request_data.get("gate_out_date", {})
            if gate_out_date.get("from") and gate_out_date.get("to"):
                queryset = queryset.filter(
                    gate_out__out_date__range=[
                        gate_out_date["from"],
                        gate_out_date["to"],
                    ]
                )

            available_date = request_data.get("available_date", {})
            if available_date.get("from") and available_date.get("to"):
                queryset = queryset.filter(
                    available_date__range=[available_date["from"], available_date["to"]]
                )

            allotment_date = request_data.get("allotment_date", {})
            if allotment_date.get("from") and allotment_date.get("to"):
                queryset = queryset.filter(
                    allotment_date__range=[allotment_date["from"], allotment_date["to"]]
                )

            queryset = queryset.order_by("-gate_in__in_date")

            paginator = Paginator(queryset, on_page_data)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            current_page = paginator.page(pg_no)
            on_page_data_count = (
                current_page.end_index() - current_page.start_index() + 1
            )
            prev_page = (
                current_page.previous_page_number()
                if current_page.has_previous()
                else ""
            )
            next_page = (
                current_page.next_page_number() if current_page.has_next() else ""
            )

            response_data = [
                {**each.get_stock(), "sr_no": current_page.start_index() + i}
                for i, each in enumerate(current_page)
            ]

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": response_data,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def update_container_stock(pk, request_data, user):
        """Update container stock details including grade, status, and seal number."""
        try:
            with transaction.atomic():
                StockService.validate_request_data(request_data)
                stock_object = ContainerStock.objects.get(pk=pk)
                grade = request_data.get("grade") or None
                stock_status = request_data.get("status") or None
                seal_no = request_data.get("seal_no") or None
                seal_no_remarks = request_data.get("seal_no_remarks") or None
                available_date_str = request_data.get("available_date")
                is_alloted = request_data.get("is_alloted") == "True"
                booking_no = request_data.get("booking_no")
                container_no = request_data.get("container_no")

                available_date = StockService.validate_date_field(
                    available_date_str, "%d/%m/%Y"
                )

                # Update status and related timestamps
                if stock_object.status != stock_status and stock_status:
                    StockService.update_stock_status(stock_object, stock_status)

                # Update seal number
                if stock_object.seal_no != seal_no:
                    StockService.update_seal_no(stock_object, seal_no, seal_no_remarks)

                # Handle allotment removal
                if not is_alloted and booking_no:
                    StockService.remove_container_allotment(
                        stock_object, booking_no, container_no
                    )

                # Update available date
                if stock_object.available_date:
                    if stock_object.status in [
                        "Available",
                        "Alloted",
                        "Without_Repair_Available",
                    ]:
                        StockService.update_available_date(stock_object, available_date)
                    else:
                        stock_object.make_not_available()
                else:
                    if stock_object.status in [
                        "Available",
                        "Alloted",
                        "Without_Repair_Available",
                    ]:
                        stock_object.make_available()
                        if (
                            stock_object.container.client.ref_code.upper() == "ZIM"
                            and not stock_object.is_zim_repair_sent
                            and stock_object.status == "Available"
                        ):
                            zim_repair_edi_mail_process(obj=stock_object)
                            stock_object.is_zim_repair_sent = True
                            stock_object.save()

                stock_object.gate_in.grade = grade
                stock_object.gate_in.save()
                stock_object.grade = grade
                stock_object.status = stock_status
                stock_object.save()

                return Response(
                    {"successMsg": "Data Update"}, status=status.HTTP_200_OK
                )

        except ContainerStock.DoesNotExist:
            return Response(
                {"errorMsg": "Container Stock Not Found"}, status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def update_stock_status(stock_object, new_status):
        """Update container stock status and related timestamps."""
        status_transitions = {
            "Survey Pending": {
                "fields_to_clear": [
                    "estimate_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "approval_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "approved_in_date_time",
                    "approved_out_date_time",
                    "under_repair_in_date_time",
                    "under_repair_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                    "available_in_date_time",
                ],
                "fields_to_set": {"survey_pending_in_date_time": timezone.now()},
            },
            "Estimate Pending": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "approval_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "approved_in_date_time",
                    "approved_out_date_time",
                    "under_repair_in_date_time",
                    "under_repair_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                    "available_in_date_time",
                ],
                "fields_to_set": {"estimate_pending_in_date_time": timezone.now()},
            },
            "Approval Pending": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "survey_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "approved_in_date_time",
                    "approved_out_date_time",
                    "under_repair_in_date_time",
                    "under_repair_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                    "available_in_date_time",
                ],
                "fields_to_set": {"approval_pending_in_date_time": timezone.now()},
            },
            "Approved": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "survey_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "estimate_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "under_repair_in_date_time",
                    "under_repair_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                    "available_in_date_time",
                ],
                "fields_to_set": {"approved_in_date_time": timezone.now()},
            },
            "Under Repairing": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "survey_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "estimate_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "approval_pending_in_date_time",
                    "approved_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                    "available_in_date_time",
                ],
                "fields_to_set": {"under_repair_in_date_time": timezone.now()},
            },
            "Empty Alloted": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "survey_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "estimate_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "approval_pending_in_date_time",
                    "approved_out_date_time",
                    "under_repair_out_date_time",
                    "available_in_date_time",
                ],
                "fields_to_set": {
                    "empty_allotment_date": timezone.now().date(),
                    "empty_allotment_in_date_time": timezone.now(),
                },
            },
            "Available": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "survey_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "estimate_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "approval_pending_in_date_time",
                    "approved_out_date_time",
                    "under_repair_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                ],
                "fields_to_set": {"available_in_date_time": timezone.now()},
            },
            "Without_Repair_Available": {
                "fields_to_clear": [
                    "survey_pending_out_date_time",
                    "survey_pending_in_date_time",
                    "estimate_pending_out_date_time",
                    "estimate_pending_in_date_time",
                    "approval_pending_out_date_time",
                    "approval_pending_in_date_time",
                    "approved_out_date_time",
                    "under_repair_out_date_time",
                    "empty_allotment_date",
                    "empty_allotment_in_date_time",
                ],
                "fields_to_set": {"available_in_date_time": timezone.now()},
            },
        }

        current_status = stock_object.status
        if new_status in status_transitions:
            # Clear previous status timestamps
            if current_status in status_transitions:
                out_field = f"{current_status.lower().replace(' ', '_')}_out_date_time"
                if hasattr(stock_object, out_field):
                    setattr(stock_object, out_field, timezone.now())
            # Clear fields as per new status
            for field in status_transitions[new_status]["fields_to_clear"]:
                if hasattr(stock_object, field):
                    setattr(stock_object, field, None)
            # Set new status timestamps
            for field, value in status_transitions[new_status]["fields_to_set"].items():
                setattr(stock_object, field, value)
            stock_object.save()

    @staticmethod
    def update_seal_no(stock_object, seal_no, seal_no_remarks=None):
        """Update seal number for container stock."""

        old_seal_no = None
        new_seal_no = None

        if (
            stock_object.seal_no
            and SealNo.objects.filter(number=stock_object.seal_no).exists()
        ):
            old_seal_no_object = SealNo.objects.get(number=stock_object.seal_no)
            old_seal_no_object.is_available = True
            old_seal_no_object.in_use = False
            old_seal_no_object.container_no = None
            old_seal_no_object.in_use_date = None
            if (
                stock_object.container_status == "OUT"
                and stock_object.container.status == "OUT"
            ):
                old_seal_no_object.out_date = None
                old_seal_no_object.is_lock = False
            old_seal_no_object.save()
            old_seal_no = old_seal_no_object

        if seal_no:
            seal_no_object = SealNo.objects.get(number=seal_no)
            stock_object.seal_no = seal_no_object.number
            seal_no_object.is_available = False
            seal_no_object.in_use = True
            seal_no_object.container_no = stock_object.container.container_no
            seal_no_object.in_use_date = timezone.now()
            if (
                stock_object.container_status == "OUT"
                and stock_object.container.status == "OUT"
            ):
                seal_no_object.is_lock = True
                stock_object.gate_out.seal_no = seal_no_object.number
                out_history_object = GateOutHistory.objects.get(
                    container=stock_object.container, gate_out=stock_object.gate_out
                )
                seal_no_object.in_use_date = out_history_object.date
                seal_no_object.out_date = out_history_object.date
                stock_object.gate_out.save()
            seal_no_object.save()
            new_seal_no = seal_no_object
        else:
            stock_object.seal_no = None
            if (
                stock_object.container_status == "OUT"
                and stock_object.container.status == "OUT"
            ):
                stock_object.gate_out.seal_no = None
                stock_object.gate_out.save()
        stock_object.save()

        if seal_no_remarks and old_seal_no and new_seal_no:
            SealUpdateTracker.create(
                container_no=stock_object.container.container_no,
                stock_id=stock_object.pk,
                location=stock_object.container.location,
                site=stock_object.container.site,
                old_seal_no=old_seal_no,
                new_seal_no=new_seal_no,
                remarks=seal_no_remarks,
            )

    @staticmethod
    def remove_container_allotment(stock_object, booking_no, container_no):
        """Remove container from allotment."""
        container_object = Container.objects.get(container_no=container_no)
        booking_object = ContainerAllotment.objects.get(booking_no=booking_no)
        booking_object.remove_container(container=container_object)
        stock_object.allotment_date = None
        stock_object.status = "Available"
        stock_object.booking_no = None
        stock_object.save()

        if (
            stock_object.seal_no
            and SealNo.objects.filter(number=stock_object.seal_no).exists()
        ):
            seal_no_object = SealNo.objects.get(number=stock_object.seal_no)
            seal_no_object.is_available = True
            seal_no_object.in_use = False
            seal_no_object.container_no = None
            seal_no_object.in_use_date = None
            seal_no_object.out_date = None
            seal_no_object.is_lock = False
            seal_no_object.save()
            stock_object.seal_no = None
            stock_object.save()
            if stock_object.gate_out:
                stock_object.gate_out.seal_no = None
                stock_object.gate_out.save()

    @staticmethod
    def update_available_date(stock_object, available_date):
        """Update available date and time for stock."""
        if available_date:
            stock_object.available_date = available_date
            available_time = datetime.datetime.now().time()
            stock_object.available_in_date_time = datetime.datetime.combine(
                available_date, available_time
            ).astimezone(timezone.get_current_timezone())
            stock_object.save()

    @staticmethod
    def toggle_container_queue(request_data):
        """Add or remove containers from the do-not-lift queue."""
        try:
            StockService.validate_request_data(request_data)
            container_list = request_data["container_list"]
            for container_no in container_list:
                try:
                    container = Container.objects.get(
                        container_no=container_no, status="IN"
                    )
                    container.in_do_not_lift_queue = not container.in_do_not_lift_queue
                    container.queued_recently = container.in_do_not_lift_queue
                    container.save()
                except Container.DoesNotExist:
                    continue
            return Response({"successMsg": "Data Saved"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def collect_container_stock(request_data):
        """Collect and return containers with specific statuses."""
        try:
            StockService.validate_request_data(request_data)
            container_list = request_data
            main_container_list = []
            location = ""
            site = ""
            for pk in container_list:
                try:
                    stock_object = ContainerStock.objects.get(pk=pk)
                    if stock_object.status in ["Available", "Without_Repair_Available"]:
                        main_container_list.append(stock_object.container.container_no)
                        location = stock_object.container.location.name
                        site = stock_object.container.site.name
                except ContainerStock.DoesNotExist:
                    continue
            return Response(
                {
                    "container_list": main_container_list,
                    "no_of_container": str(len(main_container_list)),
                    "location": location,
                    "site": site,
                },
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": "Data Not Found"}, status=status.HTTP_200_OK)

    @staticmethod
    def allot_container(request_data, user):
        """Allot containers to a booking number."""
        try:
            with transaction.atomic():
                StockService.validate_request_data(request_data)
                location, site = StockService.validate_location_and_site(
                    request_data, user
                )
                container_list = request_data["container_list"]
                booking_no = request_data["booking_no"]
                if not booking_no:
                    raise ValidationError("Please provide booking no")

                main_container_list = []
                stock_list = []
                usa_containers = []
                for container_no in container_list:
                    try:
                        container = Container.objects.get(
                            container_no=container_no,
                            status="IN",
                            location__name=location.name,
                            site__name=site.name,
                        )
                        stock_object = ContainerStock.objects.get(
                            container=container, container_status="IN"
                        )
                        if stock_object.usa_approval_container:
                            usa_containers.append(container_no)
                        stock_list.append(stock_object)
                        main_container_list.append(container)
                    except (Container.DoesNotExist, ContainerStock.DoesNotExist):
                        continue

                if not main_container_list:
                    raise ValidationError("Please provide IN Stock Containers")

                alert = (
                    f"USA Approved Containers [{', '.join(usa_containers)}]"
                    if usa_containers
                    else ""
                )
                new_allotment = [s for s in stock_list if s.status != "Alloted"]

                try:
                    allot_object = ContainerAllotment.objects.get(booking_no=booking_no)
                    if allot_object.remaining <= 0:
                        raise ValidationError(
                            "No Remaining Quantity of Container Left on this booking no"
                        )
                    if len(new_allotment) > allot_object.remaining:
                        new_allot_qty = (
                            len(new_allotment) + allot_object.container.count()
                        )
                        raise ValidationError(
                            f"Remaining Quantity is [{allot_object.remaining}] and you are alloting [{len(new_allotment)}] more containers, Please Update Allot Quantity to [{new_allot_qty}]"
                        )
                except ContainerAllotment.DoesNotExist:
                    booking_date = (
                        StockService.validate_date_field(
                            request_data.get("booking_date")
                        )
                        or timezone.now().date()
                    )
                    booking_party = request_data.get("booking_party") or None
                    validity_date = (
                        StockService.validate_date_field(
                            request_data.get("validity_date")
                        )
                        or None
                    )
                    quantity = (
                        StockService.validate_numeric_field(
                            request_data.get("quantity"), is_float=False
                        )
                        or 1
                    )
                    remarks = request_data.get("remarks") or None

                    allot_object = ContainerAllotment.create(
                        booking_date=booking_date,
                        booking_no=booking_no,
                        booking_party=booking_party,
                        validity_date=validity_date,
                        quantity=quantity,
                        remarks=remarks,
                    )
                    allot_object.save()

                for stock_object in new_allotment:
                    allot_object.add_container(container=stock_object.container)
                    stock_object.allotment_date = allot_object.booking_date
                    stock_object.available_out_date_time = timezone.now()
                    stock_object.allotment_in_date_time = timezone.now()
                    stock_object.status = "Alloted"
                    stock_object.booking_no = booking_no
                    stock_object.save()
                    create_allotment_track_record(
                        location=stock_object.container.location,
                        site=stock_object.container.site,
                        booking_date=allot_object.booking_date,
                        booking_no=booking_no,
                        container_no=stock_object.container.container_no,
                        stock_id=stock_object.pk,
                    )

                return Response(
                    {"successMsg": "Data Saved", "alert": alert},
                    status=status.HTTP_200_OK,
                )

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def remove_allotment(request_data):
        """Remove containers from a booking."""
        try:
            with transaction.atomic():
                StockService.validate_request_data(request_data)
                for pk in request_data:
                    try:
                        stock_object = ContainerStock.objects.get(pk=pk)
                        booking_no = stock_object.booking_no
                        container_object = stock_object.container
                        booking_object = ContainerAllotment.objects.get(
                            booking_no=booking_no
                        )
                        booking_object.remove_container(container=container_object)

                        booking_track_record = AllotmentTracker.objects.filter(
                            location=stock_object.container.location,
                            site=stock_object.container.site,
                            booking_no=booking_no,
                            container_no=stock_object.container.container_no,
                            stock_id=stock_object.pk,
                        ).latest("pk")
                        booking_track_record.booking_canceled = True
                        booking_track_record.save()

                        if (
                            stock_object.seal_no
                            and SealNo.objects.filter(
                                number=stock_object.seal_no
                            ).exists()
                        ):
                            seal_no_object = SealNo.objects.get(
                                number=stock_object.seal_no
                            )
                            seal_no_object.is_available = True
                            seal_no_object.in_use = False
                            seal_no_object.container_no = None
                            seal_no_object.in_use_date = None
                            seal_no_object.out_date = None
                            seal_no_object.is_lock = False
                            seal_no_object.save()

                        stock_object.allotment_date = None
                        stock_object.available_out_date_time = None
                        stock_object.allotment_in_date_time = None
                        stock_object.status = "Available"
                        stock_object.booking_no = None
                        stock_object.seal_no = None
                        stock_object.save()
                    except (
                        ContainerStock.DoesNotExist,
                        ContainerAllotment.DoesNotExist,
                    ):
                        continue
                return Response({"successMsg": "Data Saved"}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def update_allotment(pk, request_data):
        """Update booking quantity for an allotment."""
        try:
            StockService.validate_request_data(request_data)
            allot_object = ContainerAllotment.objects.get(pk=pk)
            quantity = (
                StockService.validate_numeric_field(
                    request_data.get("quantity"), is_float=False
                )
                or 1
            )

            if allot_object.quantity != quantity:
                container_count = allot_object.container.count()
                if quantity > container_count:
                    remaining = quantity - container_count
                else:
                    quantity = container_count
                    remaining = 0
                    raise ValidationError(
                        "Given Quantity is less than or equal to the containers present on this booking no"
                    )
                allot_object.quantity = quantity
                allot_object.remaining = remaining
                allot_object.save()

            return Response({"successMsg": "Data Saved"}, status=status.HTTP_200_OK)
        except ContainerAllotment.DoesNotExist:
            return Response(
                {"errorMsg": "Booking Not Found"}, status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def get_booking_details(request_data):
        """Retrieve details for a specific booking number."""
        try:
            StockService.validate_request_data(request_data)
            booking_no = request_data["booking_no"]
            booking_detail = ContainerAllotment.objects.get(
                booking_no=booking_no
            ).get_allotment()
            return Response(booking_detail, status=status.HTTP_200_OK)
        except ContainerAllotment.DoesNotExist:
            return Response(
                {"errorMsg": "Booking Not Found"}, status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def get_stock_upload_sample_file():
        """Return the sample stock upload file."""
        try:
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_stock_upload.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    'attachment; filename="sample_stock_upload.xlsx"'
                )
            return file_response
        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": "Data Not Found"}, status=status.HTTP_200_OK)

    @staticmethod
    def extract_stock_upload_data(request_data, user):
        """Extract data from uploaded stock file."""
        try:
            StockService.validate_request_data(request_data)
            file_data = request_data["file"]
            location, site = StockService.validate_location_and_site(request_data, user)
            result = extract_excel_data(
                input_excel=file_data, location=location, site=site
            )
            if result == "Header Not Found" or result is False:
                raise ValidationError("Data file is corrupted, unable to import data")
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {e} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def import_stock_data(request_data, user):
        """Import stock data from provided data."""
        try:
            with transaction.atomic():
                StockService.validate_request_data(request_data)
                importable_data = request_data["importable_data"]
                location, site = StockService.validate_location_and_site(
                    request_data, user
                )
                app_user = AccountUser.objects.get(username=user.username)
                automatic_mnr_status_change = site.automatic_mnr_status_change

                for data in importable_data:
                    client = Client.objects.get(
                        name=data["client"], location=location, site=site
                    )
                    shipping_line = ClientAbbreviation.objects.filter(
                        client=client, name=data["shipping_line"]
                    ).first()
                    type_object = ContainerType.objects.get(name=data["type"])
                    size_object = ContainerSize.objects.get(
                        name=str(int(float(data["size"])))
                    )
                    container_no = data["container_no"]
                    gross_wt = (
                        StockService.validate_numeric_field(
                            data["gross_wt"], is_float=True
                        )
                        or 0
                    )
                    tare_wt = (
                        StockService.validate_numeric_field(
                            data["tare_wt"], is_float=True
                        )
                        or 0
                    )
                    manufacturing_date = datetime.datetime.strptime(
                        data["manufacturing_date"], "%d_%m_%Y"
                    ).date()
                    in_date = datetime.datetime.strptime(
                        data["in_date"], "%d_%m_%Y"
                    ).date()
                    in_time = datetime.datetime.strptime(
                        data["in_time"], "%H_%M"
                    ).time()
                    condition = data["condition"]
                    grade = data["grade"] or None
                    arrived = data["arrived"]
                    transporter = Transporter.objects.get(
                        name=data["transporter"], location=location, site=site
                    )
                    vehicle_no = data["vehicle_no"] or None
                    shipper = data["shipper"] or None
                    vessel = data["vessel"] or None
                    voyage = data["voyage"] or None
                    cargo = data["cargo"] or None
                    cargo_type = None
                    cargo_type_str = data["cargo_type"] or None
                    if cargo_type_str:
                        cargo_type = ExportCargoType.objects.get(name=cargo_type_str)

                    try:
                        container = Container.objects.get(
                            container_no=container_no, location=location, site=site
                        )
                        if container.status == "IN":
                            raise ValidationError("Container Already In")
                        container.status = "IN"
                        container.is_available = False
                        container.save()
                    except Container.DoesNotExist:
                        container_no_response = check_digit(container_no=container_no)
                        container = Container.create(
                            client=client,
                            type_object=type_object,
                            size_object=size_object,
                            container_no=container_no,
                            payload=None,
                            gross_wt=gross_wt,
                            tare_wt=tare_wt,
                            manufacturing_date=manufacturing_date,
                            shipping_line=shipping_line,
                            leased_box=False,
                            is_valid=container_no_response,
                            in_do_not_lift_queue=False,
                            queued_recently=False,
                            automatic_mnr_status_change=automatic_mnr_status_change,
                            do_not_lift_remarks=None,
                            location=location,
                            site=site,
                        )
                        container.save()

                    eir = Eir.create(
                        container=container,
                        done_by=app_user,
                        eir_date=in_date,
                        eir_time=in_time,
                        offload_date=in_date,
                        offload_time=in_time,
                        eir_img=save_default_eir_img(),
                        eir_amount=0.0,
                        repair_amount=0.0,
                        entry_type="IN",
                    )
                    eir.save()
                    eir.save_eir_no(location=location)
                    eir.upload_eir_img()
                    eir.save()

                    gate_in = GateIn.create(
                        container=container,
                        in_date=in_date,
                        in_time=in_time,
                        condition=condition,
                        grade=grade,
                        arrived=arrived,
                        consignee=None,
                        shipper=shipper,
                        source=None,
                        from_location_code=None,
                        from_port_code=None,
                        vessel_name=vessel,
                        voyage_no=voyage,
                        do_ref=None,
                        cargo=cargo,
                        export_cargo_type=cargo_type,
                        transporter_name=transporter,
                        vehicle_no=vehicle_no,
                        bl_no=None,
                        driver_name=None,
                        driver_license=None,
                        driver_mobile_no=None,
                        carrier_code=None,
                        location=location,
                        remarks=None,
                        from_location_name_code=None,
                        surveyor=None,
                    )
                    gate_in.save()
                    gate_in.save_gate_pass_no(location=location)

                    temp_date_time = datetime.datetime.combine(
                        in_date, in_time
                    ) - datetime.timedelta(minutes=15)
                    temp_date_time = temp_date_time.astimezone(
                        timezone.get_current_timezone()
                    )
                    eir.eir_date = temp_date_time.date()
                    eir.eir_time = temp_date_time.time()
                    eir.save()

                    stock = ContainerStock.create(
                        gate_in=gate_in, container=container, grade=grade
                    )
                    stock.survey_pending_in_date_time = datetime.datetime.combine(
                        in_date, in_time
                    ).astimezone(timezone.get_current_timezone())
                    stock.save()

                    if not automatic_mnr_status_change:
                        stock.status = "Estimate Pending"
                        stock.survey_pending_out_date_time = temp_date_time
                        stock.estimate_pending_in_date_time = temp_date_time
                        stock.save()

                    handling = Handling.create(
                        container=container,
                        apply_charges="Line",
                        customer_name=None,
                        invoice_date=in_date,
                        receipt_date=in_date,
                        lolo_type="OFF",
                        payment_type="None",
                        lolo_amount=0.0,
                        remark=None,
                        entry_type="IN",
                    )
                    handling.save()
                    handling.save_invoice_no(location=location)
                    handling.save_receipt_no(location=location)

                    gih = GateInHistory(
                        created_at=timezone.now(),
                        date=datetime.datetime.combine(in_date, in_time).astimezone(
                            timezone.get_current_timezone()
                        ),
                        container=container,
                        eir=eir,
                        gate_in=gate_in,
                        lolo=handling,
                        lolo_payment=None,
                        st=None,
                        st_payment=None,
                    )
                    gih.save()
                    ContainerInOutRecord(
                        container=container, in_data=gih, out_data=None
                    ).save()

                    # Set verification flags
                    eir.is_verified = True
                    eir.save()
                    gate_in.is_verified = True
                    gate_in.save()
                    handling.is_verified = True
                    handling.save()

                return Response(
                    {"successMsg": "Stock Imported"}, status=status.HTTP_200_OK
                )

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {e} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def download_rejected_stock_data(request_data):
        """Download rejected stock data as an Excel file."""
        try:
            StockService.validate_request_data(request_data)
            rejected_data = request_data["rejected_data"]
            faults = request_data["faults"]

            stock_df_data = {
                key: [each[key] if each[key] != "" else "_" for each in rejected_data]
                for key in [
                    "shipping_line",
                    "client",
                    "type",
                    "size",
                    "container_no",
                    "gross_wt",
                    "tare_wt",
                    "manufacturing_date",
                    "in_date",
                    "in_time",
                    "condition",
                    "grade",
                    "arrived",
                    "transporter",
                    "vehicle_no",
                    "shipper",
                    "vessel",
                    "voyage",
                    "cargo",
                ]
            }

            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_stock_upload.xlsx"
            )
            new_temp_file_path = os.path.join(
                BASE_DIR, "temp/sample_stock/sample_stock_upload.xlsx"
            )
            os.makedirs(os.path.dirname(new_temp_file_path), exist_ok=True)

            with open(temp_file_path, "rb") as temp:
                with open(new_temp_file_path, "wb") as f:
                    f.write(temp.read())

            book = load_workbook(new_temp_file_path)
            with pd.ExcelWriter(
                new_temp_file_path,
                engine="openpyxl",
                mode="a",
                if_sheet_exists="replace",
            ) as writer:
                pd.DataFrame(stock_df_data).to_excel(
                    writer, sheet_name="stock", index=False
                )
                pd.DataFrame(faults).to_excel(writer, sheet_name="faults", index=False)

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    'attachment; filename="sample_stock_upload.xlsx"'
                )
                os.remove(new_temp_file_path)
            return file_response

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {e} ]"},
                status=status.HTTP_200_OK,
            )

    @staticmethod
    def download_stock_sheet(request_data, user):
        """Generate and download stock sheet as an Excel file."""
        try:
            StockService.validate_request_data(request_data)
            location, site = StockService.validate_location_and_site(request_data, user)
            ref_code = request_data.get("ref_code")
            out_history = request_data.get("out_history") == "True"
            do_not_lift_queue = request_data.get("do_not_lift_queue") == "True"

            queryset = ContainerStock.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
            )

            if out_history:
                queryset = queryset.filter(container_status="OUT")
                if location != "ALL":
                    queryset = queryset.filter(container__location__name=location)
                    if site != "ALL":
                        queryset = queryset.filter(container__site__name=site)
            else:
                queryset = queryset.filter(
                    container_status="IN",
                    container__in_do_not_lift_queue=do_not_lift_queue,
                )
                if location != "ALL":
                    queryset = queryset.filter(container__location__name=location)
                    if site != "ALL":
                        queryset = queryset.filter(container__site__name=site)

            if ref_code:
                queryset = queryset.filter(container__client__ref_code=ref_code)
            if request_data.get("client"):
                queryset = queryset.filter(
                    container__client__name=request_data["client"]
                )
            if request_data.get("container_no"):
                queryset = queryset.filter(
                    container__container_no__in=request_data["container_no"]
                )
            if request_data.get("booking_no"):
                queryset = queryset.filter(booking_no=request_data["booking_no"])
            if request_data.get("status"):
                queryset = queryset.filter(status=request_data["status"])

            gate_in_date = request_data.get("gate_in_date", {})
            if gate_in_date.get("from") and gate_in_date.get("to"):
                queryset = queryset.filter(
                    gate_in__in_date__range=[gate_in_date["from"], gate_in_date["to"]]
                )

            gate_out_date = request_data.get("gate_out_date", {})
            if gate_out_date.get("from") and gate_out_date.get("to"):
                queryset = queryset.filter(
                    gate_out__out_date__range=[
                        gate_out_date["from"],
                        gate_out_date["to"],
                    ]
                )

            available_date = request_data.get("available_date", {})
            if available_date.get("from") and available_date.get("to"):
                queryset = queryset.filter(
                    available_date__range=[available_date["from"], available_date["to"]]
                )

            allotment_date = request_data.get("allotment_date", {})
            if allotment_date.get("from") and allotment_date.get("to"):
                queryset = queryset.filter(
                    allotment_date__range=[allotment_date["from"], allotment_date["to"]]
                )

            queryset = queryset.order_by("-gate_in__in_date")

            user_data_dict = user_data(location=location, site=site)
            stock_df_data = generic_stock_sheet_main_data(stock_data=queryset)
            stock_file_path = create_generic_stock_sheet_wb(
                stock_df_data=stock_df_data, user_data=user_data_dict
            )
            dt = timezone.now()
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M%S")

            with open(stock_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type="application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="stock_sheet_{date}{time}.xlsx"'
                )
                os.remove(stock_file_path)
            return file_response

        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [ {e} ]"}, status=status.HTTP_200_OK
            )
