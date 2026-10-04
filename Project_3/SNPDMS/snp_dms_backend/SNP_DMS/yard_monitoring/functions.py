from depot.models import GateInHistory, GateOutHistory
from depot.models import ContainerStock
from non_depot.models import NonDepotContainerStock
from mnr.models import (
    Approval,
    SurveyLine,
    Survey,
    Repair,
    MnrStaffAttendance,
    MnrStaff,
)

from django.utils import timezone
import datetime, traceback, logging
from django.db.models.functions import Coalesce
from django.db.models import F, Q, Count, Sum, FloatField


def get_yard_required_date_list(from_date_str=None, to_date_str=None):
    try:
        tz = timezone.get_current_timezone()
        today = datetime.datetime.now().astimezone(tz)
        from_date = None
        to_date = None
        if from_date_str and to_date_str:
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        else:
            from_date = datetime.date(today.date().year, today.date().month, 1)
            to_date = today.date()
        from_time = datetime.time.min
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(tz)
        to_time = datetime.time.max
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(tz)
        return {"from_date_time": from_date_time, "to_date_time": to_date_time}
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def yard_lolo_volume_revenue(movement, location, site, from_date=None, to_date=None):
    try:
        params = {}
        if from_date and to_date:
            required_date = get_yard_required_date_list(
                from_date_str=from_date, to_date_str=to_date
            )
        else:
            required_date = get_yard_required_date_list()
        params["date__range"] = (
            required_date["from_date_time"],
            required_date["to_date_time"],
        )
        history_model = GateInHistory if movement == "IN" else GateOutHistory
        query_for_lolo = history_model.objects.select_related(
            "container",
            "container__location",
            "container__site",
            "lolo",
        )

        _20_data = query_for_lolo.exclude(lolo=None).filter(
            container__location=location,
            container__site=site,
            container__size__name="20",
            **params,
        )
        _20_data = _20_data.annotate(revenue=Sum("lolo__gross_amount"))

        _40_data = query_for_lolo.exclude(lolo=None).filter(
            container__location=location,
            container__site=site,
            container__size__name="40",
            **params,
        )
        _40_data = _40_data.annotate(revenue=Sum("lolo__gross_amount"))

        _20_data_count = _20_data.count()
        _20_data_revenue = _20_data.aggregate(Sum("revenue"))["revenue__sum"]

        _40_data_count = _40_data.count()
        _40_data_revenue = _40_data.aggregate(Sum("revenue"))["revenue__sum"]

        data = [
            {
                "name": "20_data",
                "volume": _20_data_count,
                "revenue": (float(0) if _20_data_revenue is None else _20_data_revenue),
            },
            {
                "name": "40_data",
                "volume": _40_data_count,
                "revenue": (float(0) if _40_data_revenue is None else _40_data_revenue),
            },
        ]
        return {
            "data": data,
            "from_date": (required_date["from_date_time"].strftime("%d/%m/%Y")),
            "to_date": (required_date["to_date_time"].strftime("%d/%m/%Y")),
        }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [
            {
                "name": "20_data",
                "volume": 0,
                "revenue": float(0),
            },
            {
                "name": "40_data",
                "volume": 0,
                "revenue": float(0),
            },
        ]
        return {
            "data": data,
            "from_date": "",
            "to_date": "",
        }


def yard_mnr_volume_revenue(location, site, from_date=None, to_date=None):
    try:
        mnr_data_qs = None
        params = {
            "parent__parent__depot__container__location": location,
            "parent__parent__depot__container__site": site,
            "is_approved": True,
            "is_proceed": True,
        }
        if from_date and to_date:
            required_date = get_yard_required_date_list(
                from_date_str=from_date, to_date_str=to_date
            )
        else:
            required_date = get_yard_required_date_list()
        params["current_date_time__range"] = (
            required_date["from_date_time"],
            required_date["to_date_time"],
        )

        if site.type == "DEPOT":
            # depot
            mnr_data_qs = Approval.objects.select_related(
                "parent__parent__depot__container__location",
                "parent__parent__depot__container__site",
                "parent__parent__depot__container__size",
                "parent__parent__depot__container__client",
            ).filter(**params)
            size_20_data = mnr_data_qs.filter(
                parent__parent__depot__container__size__name="20"
            )
            size_40_data = mnr_data_qs.filter(
                parent__parent__depot__container__size__name="40"
            )
        else:
            # non_depot
            mnr_data_qs = Approval.objects.select_related(
                "parent__parent__non_depot__container__location",
                "parent__parent__non_depot__container__site",
                "parent__parent__non_depot__container__size",
                "parent__parent__non_depot__container__client",
            ).filter(**params)
            size_20_data = mnr_data_qs.filter(
                parent__parent__non_depot__container__size__name="20"
            )
            size_40_data = mnr_data_qs.filter(
                parent__parent__non_depot__container__size__name="40"
            )

        # 20
        # volume
        size_20_data_count = size_20_data.count()
        # revenue
        size_20_survey_data = [each.parent.parent for each in size_20_data]
        # damage_revenue
        size_20_damage_revenue_raw = SurveyLine.objects.filter(
            parent__in=size_20_survey_data, wash_clean_tariff=float(0)
        ).aggregate(
            revenue=Coalesce(
                Sum("total_cost", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )[
            "revenue"
        ]
        size_20_damage_revenue_raw = (
            float(0)
            if size_20_damage_revenue_raw is None
            else float(size_20_damage_revenue_raw)
        )
        size_20_damage_revenue_tax = round(size_20_damage_revenue_raw * 0, 2)
        size_20_damage_revenue_amount = (
            round(size_20_damage_revenue_raw, 2) + size_20_damage_revenue_tax
        )
        size_20_damage_revenue = round(size_20_damage_revenue_amount, 2)
        # cleaning_revenue
        size_20_cleaning_revenue_raw = (
            SurveyLine.objects.filter(parent__in=size_20_survey_data)
            .exclude(wash_clean_tariff=float(0))
            .aggregate(
                revenue=Coalesce(
                    Sum("total_cost", output_field=FloatField()),
                    0,
                    output_field=FloatField(),
                )
            )["revenue"]
        )
        size_20_cleaning_revenue_raw = (
            float(0)
            if size_20_cleaning_revenue_raw is None
            else float(size_20_cleaning_revenue_raw)
        )
        size_20_cleaning_revenue_tax = round(size_20_cleaning_revenue_raw * 0, 2)
        size_20_cleaning_revenue_amount = (
            round(size_20_cleaning_revenue_raw, 2) + size_20_cleaning_revenue_tax
        )
        size_20_cleaning_revenue = round(size_20_cleaning_revenue_amount, 2)

        # 40
        # volume
        size_40_data_count = size_40_data.count()
        # revenue
        size_40_survey_data = [each.parent.parent for each in size_40_data]
        # damage_revenue
        size_40_damage_revenue_raw = SurveyLine.objects.filter(
            parent__in=size_40_survey_data, wash_clean_tariff=float(0)
        ).aggregate(
            revenue=Coalesce(
                Sum("total_cost", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )[
            "revenue"
        ]
        size_40_damage_revenue_raw = (
            float(0)
            if size_40_damage_revenue_raw is None
            else float(size_40_damage_revenue_raw)
        )
        size_40_damage_revenue_tax = round(size_40_damage_revenue_raw * 0, 2)
        size_40_damage_revenue_amount = (
            round(size_40_damage_revenue_raw, 2) + size_40_damage_revenue_tax
        )
        size_40_damage_revenue = round(size_40_damage_revenue_amount, 2)
        # cleaning_revenue
        size_40_cleaning_revenue_raw = (
            SurveyLine.objects.filter(parent__in=size_40_survey_data)
            .exclude(wash_clean_tariff=float(0))
            .aggregate(
                revenue=Coalesce(
                    Sum("total_cost", output_field=FloatField()),
                    0,
                    output_field=FloatField(),
                )
            )["revenue"]
        )
        size_40_cleaning_revenue_raw = (
            float(0)
            if size_40_cleaning_revenue_raw is None
            else float(size_40_cleaning_revenue_raw)
        )
        size_40_cleaning_revenue_tax = round(size_40_cleaning_revenue_raw * 0, 2)
        size_40_cleaning_revenue_amount = (
            round(size_40_cleaning_revenue_raw, 2) + size_40_cleaning_revenue_tax
        )
        size_40_cleaning_revenue = round(size_40_cleaning_revenue_amount, 2)

        # response
        data = [
            {
                "name": "size_20",
                "volume": size_20_data_count,
                "revenue_damage": size_20_damage_revenue,
                "revenue_cleaning": size_20_cleaning_revenue,
            },
            {
                "name": "size_40",
                "volume": size_40_data_count,
                "revenue_damage": size_40_damage_revenue,
                "revenue_cleaning": size_40_cleaning_revenue,
            },
        ]
        return {
            "data": data,
            "from_date": (required_date["from_date_time"].strftime("%d/%m/%Y")),
            "to_date": (required_date["to_date_time"].strftime("%d/%m/%Y")),
        }
    except:
        data = [
            {
                "name": "size_20",
                "volume": 0,
                "revenue_damage": float(0),
                "revenue_cleaning": float(0),
            },
            {
                "name": "size_40",
                "volume": 0,
                "revenue_damage": float(0),
                "revenue_cleaning": float(0),
            },
        ]
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {
            "data": data,
            "from_date": "",
            "to_date": "",
        }


def yard_stock_data(location, site):
    try:
        main_data = {}
        if site.type == "DEPOT":
            stock = ContainerStock.objects.select_related(
                "container",
                "container__size",
                "container__type",
                "container__location",
                "container__site",
                "container__client",
            ).filter(
                container_status="IN",
                container__status="IN",
                container__location=location,
                container__site=site,
            )
        else:
            stock = NonDepotContainerStock.objects.select_related(
                "container",
                "container__size",
                "container__type",
                "container__location",
                "container__site",
                "container__client",
            ).filter(
                container_status="IN",
                container__status="IN",
                container__location=location,
                container__site=site,
            )

        status_list = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Under Repairing",
            "Available",
            "Alloted",
        ]

        total_20_data = []
        total_40_data = []
        for each in status_list:
            stock_query = stock.filter(status=each)
            total_20_count = stock_query.filter(container__size__name="20").count()
            total_40_count = stock_query.filter(container__size__name="40").count()
            total_20_data.append({"name": each, "value": total_20_count})
            total_40_data.append({"name": each, "value": total_40_count})
        main_data["20_total_data"] = total_20_data
        main_data["40_total_data"] = total_40_data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {"20_total_data": [], "40_total_data": []}


def yard_mnr_stage_data(location, site):
    try:
        main_data = {}
        if site.type == "DEPOT":
            stock = ContainerStock.objects.select_related(
                "container",
                "container__size",
                "container__type",
                "container__location",
                "container__site",
                "container__client",
            ).filter(
                container_status="IN",
                container__status="IN",
                container__location=location,
                container__site=site,
            )
        else:
            stock = NonDepotContainerStock.objects.select_related(
                "container",
                "container__size",
                "container__type",
                "container__location",
                "container__site",
                "container__client",
            ).filter(
                container_status="IN",
                container__status="IN",
                container__location=location,
                container__site=site,
            )
        stages = [
            "Survey",
            "Estimate",
            "Approval",
            "Repair",
            "Available",
        ]
        total_20_data = []
        total_40_data = []

        for each in stages:
            stock_query = stock.filter(stage=each)
            total_20_count = stock_query.filter(container__size__name="20").count()
            total_40_count = stock_query.filter(container__size__name="40").count()
            total_20_data.append({"name": each, "value": total_20_count})
            total_40_data.append({"name": each, "value": total_40_count})

        main_data["20_total_data"] = total_20_data
        main_data["40_total_data"] = total_40_data
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {}


def get_yard_mnr_raw_data(location, site, from_date_str=None, to_date_str=None):
    try:
        tz = timezone.get_current_timezone()
        today = datetime.datetime.now().astimezone(tz)
        yesterday = today.date() - datetime.timedelta(days=1)

        if from_date_str and to_date_str:
            from_date = datetime.datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(to_date_str, "%Y-%m-%d").date()
        else:
            from_date = to_date = yesterday

        depot_field = "depot" if site.type == "DEPOT" else "non_depot"
        depot_path = f"parent__parent__{depot_field}"
        base_filter = {
            f"{depot_path}__container__location": location,
            f"{depot_path}__container__site": site,
            "repair_date__gte": from_date,
            "repair_date__lte": to_date,
            "complete": True,
        }
        survey_20_pk_list = Repair.objects.filter(
            **base_filter, **{f"{depot_path}__container__size__name": "20"}
        ).values_list("parent__parent__pk", flat=True)

        survey_40_pk_list = Repair.objects.filter(
            **base_filter, **{f"{depot_path}__container__size__name": "40"}
        ).values_list("parent__parent__pk", flat=True)

        mnr_staff_present_count = MnrStaffAttendance.objects.filter(
            employee__location=location,
            employee__site=site,
            employee__role="Worker",
            status="Present",
            date__gte=from_date,
            date__lte=to_date,
        ).count()

        return mnr_staff_present_count, survey_20_pk_list, survey_40_pk_list

    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None, None, None


def bifurcate_ld_md_hd_survey_data(survey_pk_list):
    try:
        qs = Approval.objects.filter(parent__parent__in=survey_pk_list).annotate(
            amount=F("approved_amount")
        )

        counts = qs.aggregate(
            less_than_or_equalto_1500=Count("id", filter=Q(amount__lte=1500)),
            less_than_or_equalto_4000=Count(
                "id", filter=Q(amount__gt=1500, amount__lte=4000)
            ),
            greater_than_4000=Count("id", filter=Q(amount__gt=4000)),
        )

        return counts
    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return {}


def get_yard_mnr_productivity(location, site, from_date=None, to_date=None):
    try:
        mnr_staff_present_count, survey_20_pk_list, survey_40_pk_list = (
            get_yard_mnr_raw_data(
                location=location,
                site=site,
                from_date_str=from_date,
                to_date_str=to_date,
            )
        )
        mnr_20_data = bifurcate_ld_md_hd_survey_data(survey_20_pk_list)
        mnr_40_data = bifurcate_ld_md_hd_survey_data(survey_40_pk_list)
        return {
            "mnr_staff": mnr_staff_present_count,
            "mnr_20_data": mnr_20_data,
            "mnr_40_data": mnr_40_data,
        }
    except:
        logging.getLogger("error_log").error(traceback.format_exc())
        return {
            "mnr_staff": 0,
            "mnr_20_data": {
                "less_than_or_equalto_1500": 0,
                "less_than_or_equalto_4000": 0,
                "greater_than_4000": 0,
            },
            "mnr_40_data": {
                "less_than_or_equalto_1500": 0,
                "less_than_or_equalto_4000": 0,
                "greater_than_4000": 0,
            },
        }
