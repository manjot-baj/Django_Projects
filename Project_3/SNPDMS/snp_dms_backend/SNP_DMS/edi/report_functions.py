# model imports
from depot.models import GateInHistory, GateOutHistory, ContainerStock
from non_depot.models import NonDepotContainerStock
from master.models import Location, Site
from edi.models import EdiMailTracker, MscEdiContent, MscExcelEdiMoveCodeInfo
from mnr.models import Approval

# other imports
from django.db.models import Count


def getInOutEdiMailObjects(param, edi_type):
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

    if edi_type == "text":
        in_data = gate_in_queryset.filter(is_email_sent=True)
        out_data = gate_out_queryset.filter(is_email_sent=True)
    else:
        in_data = gate_in_queryset.filter(is_msc_excel_edi_sent=True)
        out_data = gate_out_queryset.filter(is_msc_excel_edi_sent=True)

    return in_data, out_data


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

    if edi_type == "text":
        in_data = gate_in_queryset.filter(is_email_sent=True)
        out_data = gate_out_queryset.filter(is_email_sent=True)
    else:
        in_data = gate_in_queryset.filter(is_msc_excel_edi_sent=True)
        out_data = gate_out_queryset.filter(is_msc_excel_edi_sent=True)

    return in_data, out_data


def getMissingEdiData(param, edi_type):

    gate_in_queryset = GateInHistory.objects.select_related(
        "container__client", "container__location", "container__site"
    ).filter(**param)
    gate_out_queryset = GateOutHistory.objects.select_related(
        "container__client", "container__location", "container__site"
    ).filter(**param)

    if edi_type == "text":
        in_data = gate_in_queryset.filter(is_email_sent=False)
        out_data = gate_out_queryset.filter(is_email_sent=False)
    else:
        in_data = gate_in_queryset.filter(is_msc_excel_edi_sent=False)
        out_data = gate_out_queryset.filter(is_msc_excel_edi_sent=False)
    return in_data, out_data


def getEDIMoveCodeData(param, edi_type, process, type):
    if type == "Arrived":
        gate_in_ids = (
            GateInHistory.objects.select_related(
                "container__client", "container__location", "container__site"
            )
            .filter(**param, gate_in__arrived=process)
            .values_list("pk", flat=True)
        )

    if type == "Departed":
        gate_out_ids = (
            GateOutHistory.objects.select_related(
                "container__client", "container__location", "container__site"
            )
            .filter(**param, gate_out__departed=process)
            .values_list("pk", flat=True)
        )
    if edi_type == "text":
        if type == "Arrived":
            sent_data = EdiMailTracker.objects.filter(
                in_data_id__in=gate_in_ids, is_excel_edi=False
            ).exclude(move_code=None)
            waiting_data = MscEdiContent.objects.filter(
                in_data_id__in=gate_in_ids, is_deleted=False
            ).exclude(move_code=None)

        else:
            sent_data = EdiMailTracker.objects.filter(
                out_data_id__in=gate_out_ids, is_excel_edi=False
            ).exclude(move_code=None)
            waiting_data = MscEdiContent.objects.filter(
                out_data_id__in=gate_out_ids, is_deleted=False
            ).exclude(move_code=None)

    else:
        if type == "Arrived":
            sent_data = EdiMailTracker.objects.filter(
                in_data_id__in=gate_in_ids, is_excel_edi=True
            ).exclude(excel_edi_move_code=None)
            waiting_data = MscExcelEdiMoveCodeInfo.objects.filter(
                in_data_id__in=gate_in_ids, is_deleted=False
            ).exclude(move_code=None)

        else:
            sent_data = EdiMailTracker.objects.filter(
                out_data_id__in=gate_out_ids, is_excel_edi=True
            ).exclude(excel_edi_move_code=None)
            waiting_data = MscExcelEdiMoveCodeInfo.objects.filter(
                out_data_id__in=gate_out_ids, is_deleted=False
            ).exclude(move_code=None)

    return sent_data, waiting_data


def getEstimateWistimReportData(site_type, param):
    model = ContainerStock if site_type == "DEPOT" else NonDepotContainerStock
    stock = (
        model.objects.select_related("gate_in")
        .filter(**param)
        .order_by("gate_in__in_date")
        .values_list(
            "pk",
            "container__container_no",
            "container__size__name",
            "container__type__name",
            "container__client__name",
            "container__client__ref_code",
            "gate_in__condition",
            "gate_in__in_date",
            "gate_in__in_time",
            "is_estimate_westim_sent",
            "is_repair_destim_sent",
        )
    )
    return stock


def getRepairDistimReportData(site_type, param):
    model = ContainerStock if site_type == "DEPOT" else NonDepotContainerStock
    stock = (
        model.objects.select_related("gate_in")
        .filter(**param)
        .values(
            "container__container_no",
            "container__size__name",
            "container__type__name",
            "container__client__name",
            "container__client__ref_code",
            "gate_in__condition",
            "gate_in__in_date",
            "gate_in__in_time",
            "pk",
            "gate_in__condition",
            "is_estimate_westim_sent",
            "estimate_date",
            "estimate_time",
        )
        .order_by("gate_in__in_date")
    )
    return stock
