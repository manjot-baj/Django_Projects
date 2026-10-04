# model imports
from depot.models import GateInHistory, GateOutHistory, ContainerStock
from non_depot.models import NonDepotContainerStock
from master.models import Location, Site
from edi.models import EdiMailTracker, MscEdiContent, MscExcelEdiMoveCodeInfo
from mnr.models import Approval, Repair

# other imports
import datetime, os
from django.utils import timezone
import logging, traceback
from django.db.models import Count


def get_dates(from_date_str, to_date_str, from_time_str, to_time_str):
    try:
        tz = timezone.get_current_timezone()
        to_date_time = datetime.datetime.now().astimezone(tz)
        from_date_time = to_date_time - datetime.timedelta(hours=24)
        from_date_time = from_date_time.astimezone(tz)
        from_date = from_date_time.date()
        to_date = to_date_time.date()
        from_time = datetime.datetime.strptime("00:00", "%H:%M").time()
        to_time = datetime.datetime.strptime("23:59", "%H:%M").time()
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.datetime.strptime(to_time_str, "%H:%M").time()
            else:
                from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(tz)
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(tz)
        return from_date_time, to_date_time
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None, None


def get_redi_raw_data(
    from_date_time, to_date_time, container_no, line, location, site, in_data
):
    try:
        model = GateInHistory if in_data else GateOutHistory
        data = []
        if len(container_no) == 0:
            data = list(
                model.objects.select_related(
                    "container",
                    "container__client",
                    "container__location",
                    "container__site",
                )
                .filter(
                    container__client__edi_service=True,
                    container__location=location,
                    container__site=site,
                    container__client__ref_code=line,
                    date__range=(from_date_time, to_date_time),
                )
                .order_by("-date")
            )
        else:
            line_list = []
            for each in container_no:
                try:
                    obj = (
                        model.objects.select_related(
                            "container",
                            "container__client",
                            "container__location",
                            "container__site",
                        ).filter(
                            container__client__edi_service=True,
                            container__location=location,
                            container__site=site,
                            container__container_no=each,
                        )
                    ).latest("pk")
                    line = obj.container.client.ref_code
                    line_list.append(line)
                    data.append(obj)
                except:
                    continue
            if len(set(line_list)) > 1:
                return None, {}
        return line, data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None, None


def get_redi_data(request):
    try:
        data = request.data
        from_date_str = data["from_date"]
        to_date_str = data["to_date"]
        from_time_str = data["from_time"]
        to_time_str = data["to_time"]
        container_no = data["container_no"]
        line = data["line"]
        edi_type = data["edi_type"]
        location_str = data["location"]
        site_str = data["site"]

        redi_data = None
        in_data_list = []
        out_data_list = []

        if len(location_str) == 0 or len(site_str) == 0 or len(edi_type) == 0:
            return None, {"errorMsg": "Please provide proper data"}

        if len(container_no) == 0:
            if len(line) == 0:
                return None, {"errorMsg": "Please provide proper data"}

        # location and site
        location = Location.objects.get(name=location_str)
        site = Site.objects.get(name=site_str, location=location)

        # dates
        from_date_time, to_date_time = get_dates(
            from_date_str, to_date_str, from_time_str, to_time_str
        )

        # data based on editype
        if edi_type == "IN":
            line, in_data_list = get_redi_raw_data(
                from_date_time,
                to_date_time,
                container_no,
                line,
                location,
                site,
                in_data=True,
            )

            if type(in_data_list) is dict:
                return None, {"errorMsg": "Please provide containers of same line"}

            if len(in_data_list) == 0:
                return None, {
                    "errorMsg": "EDI Service is not available for this Client"
                }

        if edi_type == "OUT":
            line, out_data_list = get_redi_raw_data(
                from_date_time,
                to_date_time,
                container_no,
                line,
                location,
                site,
                in_data=False,
            )

            if type(out_data_list) is dict:
                return None, {"errorMsg": "Please provide containers of same line"}

            if list(out_data_list) == 0:
                return None, {
                    "errorMsg": "EDI Service is not available for this Client"
                }

        if edi_type == "BOTH":
            line, in_data_list = get_redi_raw_data(
                from_date_time,
                to_date_time,
                container_no,
                line,
                location,
                site,
                in_data=True,
            )
            line, out_data_list = get_redi_raw_data(
                from_date_time,
                to_date_time,
                container_no,
                line,
                location,
                site,
                in_data=False,
            )

            if type(in_data_list) is dict or type(out_data_list) is dict:
                return None, {"errorMsg": "Please provide containers of same line"}

            if list(in_data_list) == 0 and list(out_data_list) == 0:
                return None, {
                    "errorMsg": "EDI Service is not available for this Client"
                }

        line = line.lower()
        redi_data = list(in_data_list) + list(out_data_list)
        if len(redi_data) == 0:
            return None, {"errorMsg": "Data Not Found"}
        return line, redi_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None, {"errorMsg": "Data Not Found"}


def getInOutEdiMailData(param, edi_type):
    gate_in_ids = []
    gate_out_ids = []
    for each in (
        GateInHistory.objects.select_related(
            "container__client", "container__location", "container__site"
        )
        .filter(**param)
        .values("pk", "created_at", "date")
        .order_by("date")
    ):
        if each["created_at"].date() == each["date"].date():
            gate_in_ids.append(each["pk"])
    for each in (
        GateOutHistory.objects.select_related(
            "container__client", "container__location", "container__site"
        )
        .filter(**param)
        .values("pk", "created_at", "date")
        .order_by("date")
    ):
        if each["created_at"].date() == each["date"].date():
            gate_out_ids.append(each["pk"])

    gate_in_queryset = GateInHistory.objects.filter(pk__in=gate_in_ids)
    gate_out_queryset = GateOutHistory.objects.filter(pk__in=gate_out_ids)

    in_count = gate_in_queryset.values("created_at").annotate(count=Count("id"))
    out_count = gate_out_queryset.values("created_at").annotate(count=Count("id"))
    if edi_type == "text":
        in_mail_sent_count = (
            gate_in_queryset.filter(is_email_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )
        out_mail_sent_count = (
            gate_out_queryset.filter(is_email_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )
    else:
        in_mail_sent_count = (
            gate_in_queryset.filter(is_msc_excel_edi_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )
        out_mail_sent_count = (
            gate_out_queryset.filter(is_msc_excel_edi_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )

    return in_count, out_count, in_mail_sent_count, out_mail_sent_count


def getBackDatedData(param, edi_type):
    gate_in_ids = []
    gate_out_ids = []
    for each in (
        GateInHistory.objects.select_related(
            "container__client", "container__location", "container__site"
        )
        .filter(**param)
        .values("pk", "created_at", "date")
        .order_by("date")
    ):
        if each["created_at"].date() != each["date"].date():
            gate_in_ids.append(each["pk"])
    for each in (
        GateOutHistory.objects.select_related(
            "container__client", "container__location", "container__site"
        )
        .filter(**param)
        .values("pk", "created_at", "date")
        .order_by("date")
    ):
        if each["created_at"].date() != each["date"].date():
            gate_out_ids.append(each["pk"])

    gate_in_queryset = GateInHistory.objects.filter(pk__in=gate_in_ids)
    gate_out_queryset = GateOutHistory.objects.filter(pk__in=gate_out_ids)

    in_count = gate_in_queryset.values("created_at").annotate(count=Count("id"))
    out_count = gate_out_queryset.values("created_at").annotate(count=Count("id"))
    if edi_type == "text":
        in_mail_sent_count = (
            gate_in_queryset.filter(is_email_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )
        out_mail_sent_count = (
            gate_out_queryset.filter(is_email_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )
    else:
        in_mail_sent_count = (
            gate_in_queryset.filter(is_msc_excel_edi_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )
        out_mail_sent_count = (
            gate_out_queryset.filter(is_msc_excel_edi_sent=True)
            .values("created_at")
            .annotate(count=Count("id"))
        )

    return in_count, out_count, in_mail_sent_count, out_mail_sent_count


def getMissingEdiData(param, edi_type):

    gate_in_queryset = GateInHistory.objects.select_related(
        "container__client", "container__location", "container__site"
    ).filter(**param)
    gate_out_queryset = GateOutHistory.objects.select_related(
        "container__client", "container__location", "container__site"
    ).filter(**param)

    if edi_type == "text":
        in_count = (
            gate_in_queryset.filter(is_email_sent=False)
            .values("created_at")
            .annotate(count=Count("id"))
        )
        out_count = (
            gate_out_queryset.filter(is_email_sent=False)
            .values("created_at")
            .annotate(count=Count("id"))
        )
    else:
        in_count = (
            gate_in_queryset.filter(is_msc_excel_edi_sent=False)
            .values("created_at")
            .annotate(count=Count("id"))
        )
        out_count = (
            gate_out_queryset.filter(is_msc_excel_edi_sent=False)
            .values("created_at")
            .annotate(count=Count("id"))
        )
    return in_count, out_count


def getEDIMoveCodeData(param, edi_type, process, type):

    if type == "Arrived":
        gate_in_ids = (
            GateInHistory.objects.select_related(
                "container__client", "container__location", "container__site"
            )
            .filter(**param, gate_in__arrived=process)
            .values_list("pk", flat=True)
        )
    else:
        gate_out_ids = (
            GateOutHistory.objects.select_related(
                "container__client", "container__location", "container__site"
            )
            .filter(**param, gate_out__departed=process)
            .values_list("pk", flat=True)
        )
    if edi_type == "text":

        if type == "Arrived":
            total_count = (
                GateInHistory.objects.filter(pk__in=gate_in_ids)
                .values("created_at")
                .annotate(count=Count("id"))
            ).order_by("created_at")
            total_data = (
                GateInHistory.objects.filter(pk__in=gate_in_ids)
                .values("pk", "created_at")
                .order_by("created_at")
            )

            sent_count = (
                EdiMailTracker.objects.filter(
                    in_data_id__in=gate_in_ids, is_excel_edi=False
                )
                .exclude(move_code=None)
                .values("in_data_id", "move_code")
                .annotate(count=Count("id"))
            )
            waiting_count = (
                MscEdiContent.objects.filter(
                    in_data_id__in=gate_in_ids, is_deleted=False
                )
                .exclude(move_code=None)
                .values("in_data_id", "move_code")
                .annotate(count=Count("id"))
            )
            # edi_quersyet = MscEdiContent.objects.filter(
            #     in_data_id__in=gate_in_ids
            # ).values("date", "move_code")
            # total_count = edi_quersyet.annotate(count=Count("id"))
            # sent_count = edi_quersyet.filter(is_deleted=True).annotate(
            #     count=Count("id")
            # )
            # waiting_count = edi_quersyet.filter(is_deleted=False).annotate(
            #     count=Count("id")
            # )
        else:
            total_count = (
                GateOutHistory.objects.filter(pk__in=gate_out_ids)
                .values("pk", "created_at")
                .annotate(count=Count("id"))
                .order_by("created_at")
            )
            total_data = (
                GateOutHistory.objects.filter(pk__in=gate_out_ids)
                .values("created_at", "pk")
                .order_by("created_at")
            )
            sent_count = (
                EdiMailTracker.objects.filter(
                    out_data_id__in=gate_out_ids, is_excel_edi=False
                )
                .exclude(move_code=None)
                .values("out_data_id", "move_code")
                .annotate(count=Count("id"))
            )
            waiting_count = (
                MscEdiContent.objects.filter(
                    out_data_id__in=gate_out_ids, is_deleted=False
                )
                .exclude(move_code=None)
                .values("out_data_id", "move_code")
                .annotate(count=Count("id"))
            )
            # edi_quersyet = MscEdiContent.objects.filter(
            #     out_data_id__in=gate_out_ids
            # ).values("date", "move_code")
            # total_count = edi_quersyet.annotate(count=Count("id"))
            # sent_count = edi_quersyet.filter(is_deleted=True).annotate(
            #     count=Count("id")
            # )
            # waiting_count = edi_quersyet.filter(is_deleted=False).annotate(
            #     count=Count("id")
            # )
        return total_data, total_count, sent_count, waiting_count
    else:

        if type == "Arrived":
            total_count = (
                GateInHistory.objects.filter(pk__in=gate_in_ids)
                .values("created_at")
                .annotate(count=Count("id"))
            ).order_by("created_at")
            total_data = (
                GateInHistory.objects.filter(pk__in=gate_in_ids)
                .values("created_at", "pk")
                .order_by("created_at")
            )
            sent_count = (
                EdiMailTracker.objects.filter(
                    in_data_id__in=gate_in_ids, is_excel_edi=True
                )
                .exclude(excel_edi_move_code=None)
                .values("in_data_id", "excel_edi_move_code")
                .annotate(count=Count("id"))
            )
            waiting_count = (
                MscExcelEdiMoveCodeInfo.objects.filter(
                    in_data_id__in=gate_in_ids, is_deleted=False
                )
                .exclude(move_code=None)
                .values("in_data_id", "move_code")
                .annotate(count=Count("id"))
            )
            # edi_quersyet = MscExcelEdiMoveCodeInfo.objects.filter(
            #     in_data_id__in=gate_in_ids
            # ).values("date", "move_code")
            # total_count = edi_quersyet.annotate(count=Count("id"))
            # sent_count = edi_quersyet.filter(is_deleted=True).annotate(
            #     count=Count("id")
            # )
            # waiting_count = edi_quersyet.filter(is_deleted=False).annotate(
            #     count=Count("id")
            # )
        else:
            total_count = (
                GateOutHistory.objects.filter(pk__in=gate_out_ids)
                .values("pk", "created_at")
                .annotate(count=Count("id"))
                .order_by("created_at")
            )
            total_data = (
                GateOutHistory.objects.filter(pk__in=gate_out_ids)
                .values("created_at", "pk")
                .order_by("created_at")
            )
            sent_count = (
                EdiMailTracker.objects.filter(
                    out_data_id__in=gate_out_ids, is_excel_edi=True
                )
                .exclude(excel_edi_move_code=None)
                .values("out_data_id", "excel_edi_move_code")
                .annotate(count=Count("id"))
            )
            waiting_count = (
                MscExcelEdiMoveCodeInfo.objects.filter(
                    out_data_id__in=gate_out_ids, is_deleted=False
                )
                .exclude(move_code=None)
                .values("out_data_id", "move_code")
                .annotate(count=Count("id"))
            )
            # edi_quersyet = MscExcelEdiMoveCodeInfo.objects.filter(
            #     out_data_id__in=gate_out_ids
            # ).values("date", "move_code")
            # total_count = edi_quersyet.annotate(count=Count("id"))
            # sent_count = edi_quersyet.filter(is_deleted=True).annotate(
            #     count=Count("id")
            # )
            # waiting_count = edi_quersyet.filter(is_deleted=False).annotate(
            #     count=Count("id")
            # )
        return total_data, total_count, sent_count, waiting_count


def getEstimateWistimData(param, site_type):
    model = ContainerStock if site_type == "DEPOT" else NonDepotContainerStock
    gate_in_count = (
        model.objects.select_related("gate_in")
        .filter(**param)
        .values("gate_in__in_date")
        .annotate(
            gate_in_count=Count("gate_in__pk"),
        )
        .order_by("gate_in__in_date")
    )
    estimate_and_response_count = (
        model.objects.select_related("gate_in")
        .filter(**param)
        .values("gate_in__in_date", "is_estimate_westim_sent", "is_repair_destim_sent")
    )
    stock = (
        model.objects.select_related("gate_in")
        .filter(**param)
        .values_list("pk", flat=True)
    )
    if site_type == "DEPOT":
        approval_params = {"parent__parent__depot__pk__in": stock}
        values_list = (
            "parent__parent__depot__gate_in__in_date",
            "is_approved",
            "is_denied",
            "is_partial_denied",
            "denial_reason",
        )
    else:
        approval_params = {"parent__parent__non_depot__pk__in": stock}
        values_list = (
            "parent__parent__non_depot__gate_in__in_date",
            "is_approved",
            "is_denied",
            "is_partial_denied",
            "denial_reason",
        )

    approval_data = (
        Approval.objects.select_related("parent__parent__depot__gate_in")
        .filter(**approval_params)
        .values(*values_list)
    )
    return gate_in_count, estimate_and_response_count, approval_data


def getRepairDistimData(param, site_type):
    model = ContainerStock if site_type == "DEPOT" else NonDepotContainerStock
    gate_in_count = (
        model.objects.select_related("gate_in")
        .filter(**param)
        .values("gate_in__in_date")
        .annotate(
            gate_in_count=Count("gate_in__pk"),
        )
        .order_by("gate_in__in_date")
    )
    stock = model.objects.filter(**param).values_list("pk", flat=True)
    estimate_data = model.objects.filter(**param, is_estimate_westim_sent=True).values(
        "estimate_date", "estimate_time", "gate_in__in_date", "gate_in__in_time"
    )
    if site_type == "DEPOT":
        approval_repair_params = {"parent__parent__depot__pk__in": stock}
        approval_values_list = (
            "parent__parent__depot__gate_in__in_date",
            "parent__parent__depot__gate_in__in_time",
            "approved_date",
            "approved_time",
        )
        repair_values_list = (
            "parent__parent__depot__gate_in__in_date",
            "parent__parent__depot__gate_in__in_time",
            "repair_date",
            "repair_time",
            "damage_category",
        )

    else:
        approval_repair_params = {"parent__parent__non_depot__pk__in": stock}
        approval_values_list = (
            "parent__parent__non_depot__gate_in__in_date",
            "parent__parent__non_depot__gate_in__in_time",
            "approved_date",
            "approved_time",
        )
        repair_values_list = (
            "parent__parent__non_depot__gate_in__in_date",
            "parent__parent__non_depot__gate_in__in_time",
            "repair_date",
            "repair_time",
            "damage_category",
        )

    approval_data = Approval.objects.filter(
        **approval_repair_params,
        approved_date__isnull=False,
        approved_time__isnull=False
    ).values(*approval_values_list)
    repair_data = Repair.objects.filter(
        **approval_repair_params, repair_date__isnull=False, repair_time__isnull=False
    ).values(*repair_values_list)
    return gate_in_count, estimate_data, approval_data, repair_data
