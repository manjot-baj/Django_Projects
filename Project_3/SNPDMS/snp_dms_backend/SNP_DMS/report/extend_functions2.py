import datetime
from django.utils import timezone
from master.models_two import SealNo, SealUpdateTracker
from depot.models import ContainerStock, ContainerAllotment
import logging
import traceback
from django.db.models import Count, Case, When, Value, CharField
from master.models_two import Client

from django.db.models import Count, Value
from django.db.models.functions import Lower, Replace


def seal_issued_report_row_data(outward_data):
    try:
        if (
            ContainerStock.objects.filter(
                container=outward_data.container, gate_out=outward_data.gate_out
            )
            .exclude(seal_no=None, booking_no=None)
            .exists()
        ):
            stock = (
                ContainerStock.objects.filter(
                    container=outward_data.container,
                    gate_out=outward_data.gate_out,
                )
                .exclude(seal_no=None, booking_no=None)
                .latest("pk")
            )
            if (
                SealNo.objects.filter(
                    number=stock.seal_no,
                    location=stock.container.location,
                    site=stock.container.site,
                ).exists()
                and ContainerAllotment.objects.filter(
                    booking_no=stock.booking_no
                ).exists()
            ):
                seal_obj = SealNo.objects.filter(
                    number=stock.seal_no,
                    location=stock.container.location,
                    site=stock.container.site,
                ).latest("pk")
                allotment = ContainerAllotment.objects.filter(
                    booking_no=stock.booking_no
                ).latest("pk")

                location = stock.container.location.name
                business_entity = stock.container.site.name
                box_number = (
                    seal_obj.seal_box_number if seal_obj.seal_box_number else ""
                )
                seal_number = seal_obj.number
                container_no = stock.container.container_no
                booking_no = stock.booking_no
                booking_party_name = allotment.booking_party
                issued_date = (
                    outward_data.date.astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%d-%m-%Y")
                )
                closing_stock = ""

                data = {
                    "location": location,
                    "business_entity": business_entity,
                    "box_number": box_number,
                    "seal_number": seal_number,
                    "container_no": container_no,
                    "booking_party_name": booking_party_name,
                    "booking_no": booking_no,
                    "issued_date": issued_date,
                    "closing_stock": closing_stock,
                }

                return data
            else:
                return None
        else:
            return None
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def seal_issued_report_main_data(outward_data_list):
    try:
        df_data = []

        for each in outward_data_list:
            row = seal_issued_report_row_data(each)
            if row:
                df_data.append(
                    [
                        row.get("location"),
                        row.get("business_entity"),
                        row.get("box_number"),
                        row.get("seal_number"),
                        row.get("container_no"),
                        row.get("booking_party_name"),
                        row.get("booking_no"),
                        row.get("issued_date"),
                        row.get("closing_stock"),
                    ]
                )

        if not df_data:
            df_data = [["" for _ in range(9)]]

        return df_data

    except Exception:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return [["" for _ in range(9)]]


def seal_stock_data(location, site):
    try:
        seal_stock_data = SealNo.objects.filter(
            location=location,
            site=site,
            in_use=False,
            is_available=True,
            in_use_date__isnull=True,
            is_damaged=False,
            is_cut=False,
        )
        return seal_stock_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def seal_stock_report_row_data(seal_stock):
    try:
        location = seal_stock.location.name
        business_entity = seal_stock.site.name
        box_number = seal_stock.seal_box_number if seal_stock.seal_box_number else ""
        seal_number = seal_stock.number
        closing_stock = ""

        data = {
            "location": location,
            "business_entity": business_entity,
            "box_number": box_number,
            "seal_number": seal_number,
            "closing_stock": closing_stock,
        }

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def seal_stock_report_main_data(seal_stock_data):
    try:
        df_data = []

        for each in seal_stock_data:
            row = seal_stock_report_row_data(each)
            if row:
                df_data.append(
                    [
                        row.get("location"),
                        row.get("business_entity"),
                        row.get("box_number"),
                        row.get("seal_number"),
                        row.get("closing_stock"),
                    ]
                )

        if not df_data:
            df_data = [["" for _ in range(5)]]

        return df_data

    except Exception:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return [["" for _ in range(5)]]


def seal_stock_summary_report_main_data(seal_stock_data, location, site):
    try:
        summary = (
            seal_stock_data.annotate(
                box=Case(
                    When(seal_box_number__isnull=True, then=Value("_")),
                    When(seal_box_number="", then=Value("_")),
                    default="seal_box_number",
                    output_field=CharField(),
                )
            )
            .values_list("box")
            .annotate(seal_number_count=Count("box"))
        )

        df_data = [[location.name, site.name, box, count] for box, count in summary]

        return df_data or [["" for _ in range(4)]]

    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return [["" for _ in range(4)]]


def seal_update_track_report_row_data(outward_data):
    try:
        data = []
        if (
            ContainerStock.objects.filter(
                container=outward_data.container,
                gate_out=outward_data.gate_out,
            )
            .exclude(seal_no=None, booking_no=None)
            .exists()
        ):
            stock = (
                ContainerStock.objects.filter(
                    container=outward_data.container,
                    gate_out=outward_data.gate_out,
                )
                .exclude(seal_no=None, booking_no=None)
                .latest("pk")
            )
            seal_update_tracker = SealUpdateTracker.objects.filter(stock_id=stock.pk)
            for tracker in seal_update_tracker:
                data.append(tracker.get_tracker_detail())
            if not len(data) == 0:
                return data
            else:
                return None
        else:
            return None
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def seal_update_track_report_main_data(outward_data_list):
    try:
        data = []
        for each in outward_data_list:
            row_data = seal_update_track_report_row_data(each)
            if row_data:
                data.extend(row_data)

        df_data = []
        for row in data:
            if row:
                df_data.append(
                    [
                        row.get("container_no"),
                        row.get("old_seal_no"),
                        row.get("new_seal_no"),
                        row.get("updated_at"),
                        row.get("remarks"),
                    ]
                )

        if not df_data:
            df_data = [["" for _ in range(5)]]

        return df_data

    except Exception:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return [["" for _ in range(5)]]


# def client_report_1_main_data(site):
#     try:
#         # Common normalization expression
#         normalized_expr = Replace(
#             Replace(Lower("name"), Value("."), Value("")), Value(" "), Value("")
#         )

#         # Step 1: Find duplicate normalized names
#         duplicate_names = list(
#             Client.objects.annotate(normalized_name=normalized_expr)
#             .values("normalized_name")
#             .annotate(total=Count("id"))
#             .filter(total__gt=1, site=site)
#             .values_list("normalized_name", flat=True)
#         )

#         # Step 2: Fetch actual matching clients
#         clients = (
#             Client.objects.annotate(normalized_name=normalized_expr)
#             .filter(normalized_name__in=duplicate_names, site=site)
#             .order_by("normalized_name", "name")
#         )

#         # Step 3: Final response
#         data = [
#             {
#                 "pk": client.pk,
#                 "name": client.name,
#                 "type": client.type,
#                 "gst_no": client.gst_no or "_",
#                 "required": "Y",
#             }
#             for client in clients
#         ]

#         df_data = []
#         for row in data:
#             if row:
#                 df_data.append(
#                     [
#                         row.get("name"),
#                         row.get("type"),
#                         row.get("gst_no"),
#                         row.get("required"),
#                     ]
#                 )

#         if not df_data:
#             df_data = [["" for _ in range(4)]]

#         return df_data

#     except Exception:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return [["" for _ in range(4)]]


def client_report_main_data(site):
    try:
        clients = (
            Client.objects.select_related()
            .filter(site=site, location=site.location, type="Party")
            .order_by("name")
        )
        data = [each.get_client_row() for each in clients]

        df_data = []
        for row in data:
            if row:
                df_data.append(
                    [
                        row.get("name"),
                        row.get("type"),
                        row.get("gst_no"),
                        row.get("required"),
                    ]
                )

        if not df_data:
            df_data = [["" for _ in range(4)]]

        return df_data

    except Exception:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return [["" for _ in range(4)]]
