# model imports
from depot.models import GateInHistory, GateOutHistory
from master.models import Location
from depot.models import ContainerStock, ContainerType
from non_depot.models import NonDepotContainerStock
from mnr.models import Approval, Repair, Survey, SurveyLine, Estimate
from billing_invoice.models import MNRInvoiceLine, CustomerBill


# other imports
from django.utils import timezone
import datetime, traceback, logging
from django.db.models import Sum, Value, FloatField, Count, F
from django.db.models.functions import Coalesce
import ast
from django.db.models import Exists, OuterRef


def get_required_date_list(requirement):
    try:
        main_date_list = []
        tz = timezone.get_current_timezone()
        today = datetime.datetime.now().astimezone(tz)
        one_months_ago = today - datetime.timedelta(days=1 * 30)
        three_months_ago = today - datetime.timedelta(days=3 * 30)
        six_months_ago = today - datetime.timedelta(days=6 * 30)
        nine_months_ago = today - datetime.timedelta(days=9 * 30)

        requirement_dict = {
            "Today": [today.date()],
            "Yesterday": [today.date() - datetime.timedelta(days=1), today.date()],
            "This Week": [
                today - datetime.timedelta(days=today.weekday()),
                today.date(),
            ],
            "Previous Week": [
                today - datetime.timedelta(days=today.weekday() + 7),
                today - datetime.timedelta(days=today.weekday() + 1),
            ],
            "This Month": [
                datetime.date(today.date().year, today.date().month, 1),
                today.date(),
            ],
            "Previous Month": [
                datetime.date(today.date().year, one_months_ago.date().month, 1),
                datetime.date(today.date().year, today.date().month, 1),
            ],
            "Last Three Month": [
                three_months_ago.date(),
                today.date(),
            ],
            "Last Six Month": [
                six_months_ago.date(),
                today.date(),
            ],
            "Last Nine Month": [
                nine_months_ago.date(),
                today.date(),
            ],
            "This Year": [datetime.date(today.date().year, 1, 1), today.date()],
            "Previous Year": [
                datetime.date(today.date().year - 1, 1, 1),
                datetime.date(today.date().year - 1, 12, 31),
            ],
        }
        main_date_list = requirement_dict[requirement]
        from_date = main_date_list[0]
        from_time = datetime.time.min
        from_date_time = datetime.datetime.combine(from_date, from_time).astimezone(tz)
        to_date = main_date_list[-1]
        to_time = datetime.time.max
        to_date_time = datetime.datetime.combine(to_date, to_time).astimezone(tz)
        return {"from_date_time": from_date_time, "to_date_time": to_date_time}
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_week_dates(year_str, week_num):
    try:
        if year_str == "This Year":
            year = datetime.datetime.now().year
        else:
            year = datetime.datetime.now().year - 1

        tz = timezone.get_current_timezone()

        week = int(week_num)
        startdate = datetime.datetime.strptime(f"{year} {week} 1", "%Y %W %w")
        dates = [startdate + datetime.timedelta(days=i) for i in range(7)]

        from_time = datetime.time.min
        to_time = datetime.time.max

        week_day = {
            "Monday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[0], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[0], to_time)
                ).astimezone(tz),
            },
            "Tuesday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[1], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[1], to_time)
                ).astimezone(tz),
            },
            "Wednesday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[2], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[2], to_time)
                ).astimezone(tz),
            },
            "Thursday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[3], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[3], to_time)
                ).astimezone(tz),
            },
            "Friday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[4], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[4], to_time)
                ).astimezone(tz),
            },
            "Saturday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[5], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[5], to_time)
                ).astimezone(tz),
            },
            "Sunday": {
                "from_date_time": (
                    datetime.datetime.combine(dates[6], from_time)
                ).astimezone(tz),
                "to_date_time": (
                    datetime.datetime.combine(dates[6], to_time)
                ).astimezone(tz),
            },
        }
        return week_day
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def all_location_weekly_lolo_st_volume_revenue(movement, process, year, week_num, line):
    try:

        week_dates = get_week_dates(year_str=year, week_num=week_num)
        days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        date_ranges = {day: week_dates[day] for day in days}

        history_model = GateInHistory if movement == "IN" else GateOutHistory

        param = {
            "date__range": (
                date_ranges["Monday"]["from_date_time"],
                date_ranges["Sunday"]["to_date_time"],
            ),
        }
        if line:
            param["container__client__ref_code"] = line

        related_fields = [
            "container",
            "container__location",
        ]
        if process == "lolo":
            related_fields.append("lolo")
        else:
            related_fields.append("st")

        query_data = history_model.objects.select_related(*related_fields).filter(
            **param,
        )

        locations = Location.objects.values_list("name", flat=True)
        volume_data = {
            day: {f"{location.upper()}": 0 for location in locations} for day in days
        }
        revenue_data = {
            day: {f"{location.upper()}": 0 for location in locations} for day in days
        }

        charge_type = "lolo" if process == "lolo" else "st"
        for location in locations:
            data = (
                query_data.filter(container__location__name=location)
                .exclude(**{f"{charge_type}": None})
                .values("date")
                .annotate(
                    volume=Count("id"), revenue=Sum(f"{charge_type}__gross_amount")
                )
            )
            for record in data:
                date_str = record.get("date").strftime("%A")
                if date_str in volume_data:
                    volume_data[date_str][f"{location.upper()}"] += record["volume"]

                    revenue_data[date_str][f"{location.upper()}"] += record["revenue"]

        main_data = {
            "label": days,
            "volume_data": [{**{"name": day}, **volume_data[day]} for day in days],
            "revenue_data": [{**{"name": day}, **revenue_data[day]} for day in days],
            "from_date": date_ranges["Monday"]["from_date_time"].strftime("%d/%m/%Y"),
            "to_date": date_ranges["Sunday"]["to_date_time"].strftime("%d/%m/%Y"),
        }

        for each in main_data["revenue_data"]:
            for key in each:
                if key != "name":
                    each[key] = round(each[key])

        return main_data
    except:
        main_data = {
            "label": [],
            "volume_data": [],
            "revenue_data": [],
            "from_date": "",
            "to_date": "",
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return main_data


def all_location_lolo_st_volume_revenue(
    movement, process, requirement, from_date, to_date, line
):
    try:
        required_date = get_required_date_list(requirement=requirement)
        locations = Location.objects.all()
        data = []
        params = {}

        if line:
            params["container__client__ref_code"] = line

        is_required_date = None
        if from_date and to_date:
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
            time_obj = datetime.datetime.now().time()
            from_date_time = datetime.datetime.combine(from_date_obj, time_obj)
            to_date_time = datetime.datetime.combine(to_date_obj, time_obj)
            params["date__range"] = (
                from_date_time,
                to_date_time,
            )

            is_required_date = False
        else:
            params["date__range"] = (
                required_date["from_date_time"],
                required_date["to_date_time"],
            )

            is_required_date = True
        history_model = GateInHistory if movement == "IN" else GateOutHistory
        for location in locations:
            if process == "lolo":
                location_data = (
                    history_model.objects.select_related(
                        "container",
                        "container__location",
                        "lolo",
                    )
                    .exclude(lolo=None)
                    .filter(container__location=location, **params)
                )
                location_data = location_data.annotate(
                    revenue=Sum("lolo__gross_amount")
                )
            else:
                location_data = (
                    history_model.objects.select_related(
                        "container",
                        "container__location",
                        "st",
                    )
                    .exclude(st=None)
                    .filter(container__location=location, **params)
                )
                location_data = location_data.annotate(revenue=Sum("st__gross_amount"))

            location_data_count = location_data.count()
            location_data_revenue = location_data.aggregate(Sum("revenue"))[
                "revenue__sum"
            ]
            data.append(
                {
                    "name": location.name.upper(),
                    "volume_data": location_data_count,
                    "revenue_data": (
                        0
                        if location_data_revenue is None
                        else round(location_data_revenue)
                    ),
                }
            )
        return {
            "data": data,
            "from_date": (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            ),
        }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {
            "data": [],
            "from_date": "",
            "to_date": "",
        }


def all_location_weekly_mnr_volume_revenue(year, week_num, line):
    try:
        week_dates = get_week_dates(year_str=year, week_num=week_num)
        days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        date_ranges = {day: week_dates[day] for day in days}

        depot_param = {
            "is_approved": True,
            "is_proceed": True,
            "current_date_time__range": (
                date_ranges["Monday"]["from_date_time"],
                date_ranges["Sunday"]["to_date_time"],
            ),
        }
        non_depot_param = {
            "is_approved": True,
            "is_proceed": True,
            "current_date_time__range": (
                date_ranges["Monday"]["from_date_time"],
                date_ranges["Sunday"]["to_date_time"],
            ),
        }
        if line:
            depot_param["parent__parent__depot__container__client__ref_code"] = line
            non_depot_param[
                "parent__parent__non_depot__container__client__ref_code"
            ] = line
        locations = Location.objects.values_list("name", flat=True)

        volume_data = {
            day: {f"{location.upper()}": 0 for location in locations} for day in days
        }
        revenue_data = {
            day: {f"{location.upper()}": 0 for location in locations} for day in days
        }
        depot_query_data = Approval.objects.filter(**depot_param)
        non_depot_query_data = Approval.objects.filter(**non_depot_param)

        def filter_and_aggregate_data(depot_data, non_depot_data, location):
            depot_query_data = (
                depot_data.filter(
                    parent__parent__depot__container__location__name=location
                )
                .values("current_date_time")
                .annotate(volume=Count("id"), revenue=Sum("approved_amount"))
            )
            non_depot_query_data = (
                depot_data.filter(
                    parent__parent__non_depot__container__location__name=location
                )
                .values("current_date_time")
                .annotate(volume=Count("id"), revenue=Sum("approved_amount"))
            )
            return depot_query_data, non_depot_query_data

        for location in locations:
            depot_data, non_depot_data = filter_and_aggregate_data(
                depot_query_data, non_depot_query_data, location
            )
            for record in depot_data:
                date_str = record["current_date_time"].strftime("%A")
                if date_str in volume_data:
                    volume_data[date_str][f"{location.upper()}"] += record["volume"]
                    revenue_data[date_str][f"{location.upper()}"] += record["revenue"]

            for each_record in non_depot_data:
                date_str = each_record["current_date_time"].strftime("%A")
                if date_str in volume_data:
                    volume_data[date_str][f"{location.upper()}"] += each_record[
                        "volume"
                    ]
                    revenue_data[date_str][f"{location.upper()}"] += each_record[
                        "revenue"
                    ]

        main_data = {
            "label": days,
            "volume_data": [{**{"name": day}, **volume_data[day]} for day in days],
            "revenue_data": [{**{"name": day}, **revenue_data[day]} for day in days],
            "from_date": date_ranges["Monday"]["from_date_time"].strftime("%d/%m/%Y"),
            "to_date": date_ranges["Sunday"]["to_date_time"].strftime("%d/%m/%Y"),
        }

        for each in main_data["revenue_data"]:
            for key in each:
                if key != "name":
                    each[key] = round(each[key])

        return main_data
    except:
        main_data = {
            "label": [],
            "volume_data": [],
            "revenue_data": [],
            "from_date": "",
            "to_date": "",
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return main_data


def all_location_mnr_volume_revenue(requirement, from_date, to_date, line):
    try:
        required_date = get_required_date_list(requirement=requirement)
        locations = Location.objects.all()
        data = []
        params = {}

        if line:
            params["container__client__ref_code"] = line

        is_required_date = None
        if from_date and to_date:
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
            time_obj = datetime.datetime.now().time()
            from_date_time = datetime.datetime.combine(from_date_obj, time_obj)
            to_date_time = datetime.datetime.combine(to_date_obj, time_obj)
            params["date__range"] = (
                from_date_time,
                to_date_time,
            )

            is_required_date = False
        else:
            params["date__range"] = (
                required_date["from_date_time"],
                required_date["to_date_time"],
            )

            is_required_date = True
        for location in locations:
            # depot
            location_depot_data = Approval.objects.select_related(
                "parent__parent__depot__container__location"
            ).filter(
                parent__parent__depot__container__location=location,
                is_approved=True,
                is_proceed=True,
                current_date_time__range=(
                    required_date["from_date_time"],
                    required_date["to_date_time"],
                ),
            )
            location_depot_data = location_depot_data.annotate(
                revenue=Sum("approved_amount")
            )
            location_depot_data_revenue = location_depot_data.aggregate(Sum("revenue"))[
                "revenue__sum"
            ]
            location_depot_data_revenue = (
                float(0)
                if location_depot_data_revenue is None
                else location_depot_data_revenue
            )

            # non-depot
            location_non_depot_data = Approval.objects.select_related(
                "parent__parent__non_depot__container__location"
            ).filter(
                parent__parent__non_depot__container__location=location,
                is_approved=True,
                is_proceed=True,
                current_date_time__range=(
                    required_date["from_date_time"],
                    required_date["to_date_time"],
                ),
            )
            location_non_depot_data = location_non_depot_data.annotate(
                revenue=Sum("approved_amount")
            )
            location_non_depot_data_revenue = location_non_depot_data.aggregate(
                Sum("revenue")
            )["revenue__sum"]
            location_non_depot_data_revenue = (
                float(0)
                if location_non_depot_data_revenue is None
                else location_non_depot_data_revenue
            )

            # main
            location_data_count = (
                location_depot_data.count() + location_non_depot_data.count()
            )
            location_data_revenue = float(location_depot_data_revenue) + float(
                location_non_depot_data_revenue
            )

            data.append(
                {
                    "name": location.name.upper(),
                    "volume_data": location_data_count,
                    "revenue_data": (
                        0
                        if location_data_revenue is None
                        else round(location_data_revenue)
                    ),
                }
            )
        return {
            "data": data,
            "from_date": (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            ),
        }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {
            "data": [],
            "from_date": "",
            "to_date": "",
        }


def location_site_stock_data(ref_code, location, site):
    try:
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
                container__location=location,
                container__site=site,
            )
        if ref_code != "":
            stock = stock.filter(container__client__ref_code=ref_code)

        main_data = {}
        status_list = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Approved",
            "Under Repairing",
            "Empty Alloted",
            "Available",
            "Alloted",
        ]

        container_type = [each_type.name for each_type in ContainerType.objects.all()]
        total_data = {}
        main_data = {"total_data": total_data}

        total_data = []
        total_20_data = []
        total_40_data = []
        for each in status_list:
            stock_query = stock.filter(status=each)
            total_count = stock_query.count()
            total_20_count = stock_query.filter(container__size__name="20").count()
            total_40_count = stock_query.filter(container__size__name="40").count()
            total_data.append({"name": each, "value": total_count})
            total_20_data.append({"name": each, "value": total_20_count})
            total_40_data.append({"name": each, "value": total_40_count})
        main_data["total_data"] = total_data
        main_data["20_total_data"] = total_20_data
        main_data["40_total_data"] = total_40_data

        type_wise_data = []
        type_wise_20_data = []
        type_wise_40_data = []
        count = 0
        for each in container_type:
            type_wise_data.append({"name": each})
            type_wise_20_data.append({"name": each})
            type_wise_40_data.append({"name": each})
            for each_status in status_list:
                stock_query = stock.filter(
                    status=each_status, container__type__name=each
                )
                type_wise_data[count][each_status] = stock_query.count()
                type_wise_20_data[count][each_status] = stock_query.filter(
                    container__size__name="20"
                ).count()
                type_wise_40_data[count][each_status] = stock_query.filter(
                    container__size__name="40"
                ).count()
            count = count + 1
        main_data["type_wise_data"] = type_wise_data
        main_data["20_type_wise_data"] = type_wise_20_data
        main_data["40_type_wise_data"] = type_wise_40_data
        main_data["from_date"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .strftime("%d/%m/%Y")
        )
        main_data["to_date"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .strftime("%d/%m/%Y")
        )
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {}


def location_site_weekly_lolo_st_volume_revenue(
    movement, process, year, week_num, location, site, line
):
    try:

        week_dates = get_week_dates(year_str=year, week_num=week_num)
        days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        date_ranges = {day: week_dates[day] for day in days}

        history_model = GateInHistory if movement == "IN" else GateOutHistory

        param = {
            "date__range": (
                date_ranges["Monday"]["from_date_time"],
                date_ranges["Sunday"]["to_date_time"],
            ),
        }
        if line:
            param["container__client__ref_code"] = line

        related_fields = [
            "container",
            "container__location",
            "container__site",
            "container__size",
        ]
        if process == "lolo":
            related_fields.append("lolo")
        else:
            related_fields.append("st")

        query_data = history_model.objects.select_related(*related_fields)

        data_containers = {
            "line": {"20": "Line", "40": "Line"},
            "party": {"20": "Party", "40": "Party"},
        }

        volume_data = {
            day: {
                f"{key}_{size}_volume_data": 0
                for key in data_containers
                for size in data_containers[key]
            }
            for day in days
        }
        revenue_data = {
            day: {
                f"{key}_{size}_revenue_data": 0
                for key in data_containers
                for size in data_containers[key]
            }
            for day in days
        }

        def filter_and_aggregate_data(query_data, size, apply_charges, charge_type):
            return (
                query_data.filter(
                    container__location=location,
                    container__site=site,
                    container__size__name=size,
                    **{f"{charge_type}__apply_charges": apply_charges},
                    **param,
                )
                .exclude(**{f"{charge_type}": None})
                .values("date")
                .annotate(
                    volume=Count("id"), revenue=Sum(f"{charge_type}__gross_amount")
                )
            )

        for key, value in data_containers.items():
            for size, apply_charges in value.items():
                data = filter_and_aggregate_data(
                    query_data,
                    size,
                    apply_charges,
                    "lolo" if process == "lolo" else "st",
                )
                for record in data:
                    date_str = record["date"].strftime("%A")
                    if date_str in volume_data:
                        volume_data[date_str][f"{key}_{size}_volume_data"] += record[
                            "volume"
                        ]

                        revenue_data[date_str][f"{key}_{size}_revenue_data"] += record[
                            "revenue"
                        ]

        main_data = {
            "label": days,
            "volume_data": [{**{"name": day}, **volume_data[day]} for day in days],
            "revenue_data": [{**{"name": day}, **revenue_data[day]} for day in days],
            "from_date": date_ranges["Monday"]["from_date_time"].strftime("%d/%m/%Y"),
            "to_date": date_ranges["Sunday"]["to_date_time"].strftime("%d/%m/%Y"),
        }

        return main_data

    except:
        main_data = {
            "label": [],
            "volume_data": [],
            "revenue_data": [],
            "from_date": "",
            "to_date": "",
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return main_data


def location_site_lolo_st_volume_revenue(
    movement, process, requirement, location, site, from_date, to_date, line
):
    try:
        required_date = get_required_date_list(requirement=requirement)
        params = {}
        if line:
            params["container__client__ref_code"] = line

        is_required_date = None
        if from_date and to_date:
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
            from_time = (
                datetime.datetime.now()
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .time()
            )
            to_time = (
                datetime.datetime.now()
                .replace(hour=23, minute=59, second=0, microsecond=0)
                .time()
            )
            from_date_time = datetime.datetime.combine(from_date_obj, from_time)
            to_date_time = datetime.datetime.combine(to_date_obj, to_time)
            params["date__range"] = (
                from_date_time,
                to_date_time,
            )

            is_required_date = False
        else:
            is_required_date = True
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
        query_for_st = history_model.objects.select_related(
            "container",
            "container__location",
            "container__site",
            "st",
        )
        if process == "lolo":

            line_20_data = query_for_lolo.exclude(lolo=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="20",
                lolo__apply_charges="Line",
                **params,
            )
            line_20_data = line_20_data.annotate(revenue=Sum("lolo__gross_amount"))

            line_40_data = query_for_lolo.exclude(lolo=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="40",
                lolo__apply_charges="Line",
                **params,
            )
            line_40_data = line_40_data.annotate(revenue=Sum("lolo__gross_amount"))

            party_20_data = query_for_lolo.exclude(lolo=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="20",
                lolo__apply_charges="Party",
                **params,
            )
            party_20_data = party_20_data.annotate(revenue=Sum("lolo__gross_amount"))

            party_40_data = query_for_lolo.exclude(lolo=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="40",
                lolo__apply_charges="Party",
                **params,
            )
            party_40_data = party_40_data.annotate(revenue=Sum("lolo__gross_amount"))
        else:
            line_20_data = query_for_st.exclude(st=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="20",
                lolo__apply_charges="Line",
                **params,
            )
            line_20_data = line_20_data.annotate(revenue=Sum("st__gross_amount"))

            line_40_data = query_for_st.exclude(st=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="40",
                lolo__apply_charges="Line",
                **params,
            )
            line_40_data = line_40_data.annotate(revenue=Sum("st__gross_amount"))

            party_20_data = query_for_st.exclude(st=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="20",
                lolo__apply_charges="Party",
                **params,
            )
            party_20_data = party_20_data.annotate(revenue=Sum("st__gross_amount"))

            party_40_data = query_for_st.exclude(st=None).filter(
                container__location=location,
                container__site=site,
                container__size__name="40",
                lolo__apply_charges="Party",
                **params,
            )
            party_40_data = party_40_data.annotate(revenue=Sum("st__gross_amount"))

        line_20_data_count = line_20_data.count()
        line_20_data_revenue = line_20_data.aggregate(Sum("revenue"))["revenue__sum"]

        line_40_data_count = line_40_data.count()
        line_40_data_revenue = line_40_data.aggregate(Sum("revenue"))["revenue__sum"]

        party_20_data_count = party_20_data.count()
        party_20_data_revenue = party_20_data.aggregate(Sum("revenue"))["revenue__sum"]

        party_40_data_count = party_40_data.count()
        party_40_data_revenue = party_40_data.aggregate(Sum("revenue"))["revenue__sum"]

        data = [
            {
                "name": "line_20",
                "volume": line_20_data_count,
                "revenue": (
                    float(0) if line_20_data_revenue is None else line_20_data_revenue
                ),
            },
            {
                "name": "line_40",
                "volume": line_40_data_count,
                "revenue": (
                    float(0) if line_40_data_revenue is None else line_40_data_revenue
                ),
            },
            {
                "name": "party_20",
                "volume": party_20_data_count,
                "revenue": (
                    float(0) if party_20_data_revenue is None else party_20_data_revenue
                ),
            },
            {
                "name": "party_40",
                "volume": party_40_data_count,
                "revenue": (
                    float(0) if party_40_data_revenue is None else party_40_data_revenue
                ),
            },
        ]
        return {
            "data": data,
            "from_date": (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            ),
        }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        data = [
            {
                "name": "line_20",
                "volume": 0,
                "revenue": float(0),
            },
            {
                "name": "line_40",
                "volume": 0,
                "revenue": float(0),
            },
            {
                "name": "party_20",
                "volume": 0,
                "revenue": float(0),
            },
            {
                "name": "party_40",
                "volume": 0,
                "revenue": float(0),
            },
        ]
        return {
            "data": data,
            "from_date": "",
            "to_date": "",
        }


def get_lolo_st_sorted_data(
    line_20_revenue_shipping_lines_list,
    line_40_revenue_shipping_lines_list,
    party_20_revenue_shipping_lines_list,
    party_40_revenue_shipping_lines_list,
    line_20_volume_shipping_lines_list,
    line_40_volume_shipping_lines_list,
    party_20_volume_shipping_lines_list,
    party_40_volume_shipping_lines_list,
):
    # Helper function to sort and slice a list
    def sort_and_slice(lst):
        lst.sort(key=lambda x: list(x.values())[1], reverse=True)
        sorted_lst = lst[:5] if len(lst) >= 5 else lst
        return sorted_lst

    top_5_clients_by_line_20_volume = sort_and_slice(line_20_volume_shipping_lines_list)
    top_5_clients_by_line_40_volume = sort_and_slice(line_40_volume_shipping_lines_list)
    top_5_clients_by_party_20_volume = sort_and_slice(
        party_20_volume_shipping_lines_list
    )
    top_5_clients_by_party_40_volume = sort_and_slice(
        party_40_volume_shipping_lines_list
    )

    top_5_clients_by_line_20 = sort_and_slice(line_20_revenue_shipping_lines_list)
    top_5_clients_by_line_40 = sort_and_slice(line_40_revenue_shipping_lines_list)
    top_5_clients_by_party_20 = sort_and_slice(party_20_revenue_shipping_lines_list)
    top_5_clients_by_party_40 = sort_and_slice(party_40_revenue_shipping_lines_list)

    top_5_clients_dict_by_revenue = {
        "line_20": top_5_clients_by_line_20,
        "line_40": top_5_clients_by_line_40,
        "party_20": top_5_clients_by_party_20,
        "party_40": top_5_clients_by_party_40,
    }
    top_5_clients_dict_by_volume = {
        "line_20": top_5_clients_by_line_20_volume,
        "line_40": top_5_clients_by_line_40_volume,
        "party_20": top_5_clients_by_party_20_volume,
        "party_40": top_5_clients_by_party_40_volume,
    }

    return top_5_clients_dict_by_revenue, top_5_clients_dict_by_volume


def lolo_st_top_client(
    movement, process, requirement, location, site, from_date, to_date, line
):
    try:
        required_date = get_required_date_list(requirement=requirement)
        params = {
            "container__location": location,
            "container__site": site,
            "container__client__ref_code__isnull": False,
        }
        if line:
            params["container__client__ref_code"] = line

        is_required_date = None
        if from_date and to_date:
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()

            from_time = (
                datetime.datetime.now()
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .time()
            )
            to_time = (
                datetime.datetime.now()
                .replace(hour=23, minute=59, second=0, microsecond=0)
                .time()
            )
            from_date_time = datetime.datetime.combine(from_date_obj, from_time)
            to_date_time = datetime.datetime.combine(to_date_obj, to_time)
            params["date__range"] = (
                from_date_time,
                to_date_time,
            )

            is_required_date = False
        else:
            params["date__range"] = (
                required_date["from_date_time"],
                required_date["to_date_time"],
            )

            is_required_date = True
        history_model = GateInHistory if movement == "IN" else GateOutHistory
        main_data = {}
        lolo_query_data = None
        st_query_data = None
        if process == "lolo":
            lolo_query_data = (
                history_model.objects.select_related(
                    "container__client",
                    "lolo",
                    "lolo__customer_name",
                )
                .exclude(lolo=None)
                .filter(
                    **params,
                )
            )
            total_lolo_volume = lolo_query_data.count()
            total_lolo_revenue = lolo_query_data.aggregate(
                revenue=Coalesce(
                    Sum("lolo__gross_amount", output_field=FloatField()),
                    0,
                    output_field=FloatField(),
                )
            )["revenue"]

            # line
            line_lolo_query_data = lolo_query_data.filter(lolo__apply_charges="Line")
            # 20
            line_20_lolo_query_data = line_lolo_query_data.filter(
                container__size__name="20"
            )
            line_20_lolo_shipping_lines_raw = line_20_lolo_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            line_20_lolo_shipping_lines = list(
                set(list(line_20_lolo_shipping_lines_raw))
            )
            # 40
            line_40_lolo_query_data = line_lolo_query_data.filter(
                container__size__name="40"
            )
            line_40_lolo_shipping_lines_raw = line_40_lolo_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            line_40_lolo_shipping_lines = list(
                set(list(line_40_lolo_shipping_lines_raw))
            )

            # party
            party_lolo_query_data = lolo_query_data.filter(
                lolo__apply_charges="Party"
            ).exclude(lolo__customer_name=None)
            # 20
            party_20_lolo_query_data = party_lolo_query_data.filter(
                container__size__name="20"
            )
            party_20_lolo_shipping_lines_raw = party_20_lolo_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            party_20_lolo_shipping_lines = list(
                set(list(party_20_lolo_shipping_lines_raw))
            )
            # 40
            party_40_lolo_query_data = party_lolo_query_data.filter(
                container__size__name="40"
            )
            party_40_lolo_shipping_lines_raw = party_40_lolo_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            party_40_lolo_shipping_lines = list(
                set(list(party_40_lolo_shipping_lines_raw))
            )

            # Volume
            # Line
            line_20_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_20_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in line_20_lolo_shipping_lines
            ]
            line_40_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_40_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in line_40_lolo_shipping_lines
            ]

            # Party
            party_20_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_20_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in party_20_lolo_shipping_lines
            ]
            party_40_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_40_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in party_40_lolo_shipping_lines
            ]

            # Revenue
            # Line
            line_20_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_20_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("lolo__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in line_20_lolo_shipping_lines
            ]
            line_40_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_40_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("lolo__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in line_40_lolo_shipping_lines
            ]
            # Party
            party_20_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_20_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("lolo__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in party_20_lolo_shipping_lines
            ]
            party_40_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_40_lolo_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("lolo__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in party_40_lolo_shipping_lines
            ]

            (
                top_5_shipping_lines_dict_by_revenue,
                top_5_shipping_lines_dict_by_volume,
            ) = get_lolo_st_sorted_data(
                line_20_revenue_shipping_lines_list=line_20_revenue_shipping_lines_list,
                line_40_revenue_shipping_lines_list=line_40_revenue_shipping_lines_list,
                party_20_revenue_shipping_lines_list=party_20_revenue_shipping_lines_list,
                party_40_revenue_shipping_lines_list=party_40_revenue_shipping_lines_list,
                line_20_volume_shipping_lines_list=line_20_volume_shipping_lines_list,
                line_40_volume_shipping_lines_list=line_40_volume_shipping_lines_list,
                party_20_volume_shipping_lines_list=party_20_volume_shipping_lines_list,
                party_40_volume_shipping_lines_list=party_40_volume_shipping_lines_list,
            )
            main_data["total_revenue"] = total_lolo_revenue
            main_data["total_volume"] = total_lolo_volume
            main_data["volume_data"] = top_5_shipping_lines_dict_by_volume
            main_data["revenue_data"] = top_5_shipping_lines_dict_by_revenue

            main_data["from_date"] = (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            )
            main_data["to_date"] = (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            )
        else:
            st_query_data = (
                history_model.objects.select_related(
                    "container__client",
                    "st",
                    "st__customer_name",
                )
                .exclude(st=None)
                .filter(
                    **params,
                )
            )
            total_st_volume = st_query_data.count()
            total_st_revenue = st_query_data.aggregate(
                revenue=Coalesce(
                    Sum("st__gross_amount", output_field=FloatField()),
                    0,
                    output_field=FloatField(),
                )
            )["revenue"]

            # line
            line_st_query_data = st_query_data.filter(st__apply_charges="Line")
            # 20
            line_20_st_query_data = line_st_query_data.filter(
                container__size__name="20"
            )
            line_20_st_shipping_lines_raw = line_20_st_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            line_20_st_shipping_lines = list(set(list(line_20_st_shipping_lines_raw)))
            # 40
            line_40_st_query_data = line_st_query_data.filter(
                container__size__name="40"
            )
            line_40_st_shipping_lines_raw = line_40_st_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            line_40_st_shipping_lines = list(set(list(line_40_st_shipping_lines_raw)))

            # party
            party_st_query_data = st_query_data.filter(
                st__apply_charges="Party"
            ).exclude(st__customer_name=None)
            # 20
            party_20_st_query_data = party_st_query_data.filter(
                container__size__name="20"
            )
            party_20_st_shipping_lines_raw = party_20_st_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            party_20_st_shipping_lines = list(set(list(party_20_st_shipping_lines_raw)))
            # 40
            party_40_st_query_data = party_st_query_data.filter(
                container__size__name="40"
            )
            party_40_st_shipping_lines_raw = party_40_st_query_data.values_list(
                "container__client__ref_code", flat=True
            )
            party_40_st_shipping_lines = list(set(list(party_40_st_shipping_lines_raw)))

            # Volume
            # Line
            line_20_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_20_st_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in line_20_st_shipping_lines
            ]
            line_40_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_40_st_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in line_40_st_shipping_lines
            ]

            # Party
            party_20_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_20_st_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in party_20_st_shipping_lines
            ]
            party_40_volume_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_40_st_query_data.filter(
                        container__client__ref_code=line
                    ).count(),
                }
                for line in party_40_st_shipping_lines
            ]

            # Revenue
            # Line
            line_20_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_20_st_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("st__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in line_20_st_shipping_lines
            ]
            line_40_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": line_40_st_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("st__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in line_40_st_shipping_lines
            ]
            # Party
            party_20_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_20_st_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("st__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in party_20_st_shipping_lines
            ]
            party_40_revenue_shipping_lines_list = [
                {
                    "name": line,
                    "value": party_40_st_query_data.filter(
                        container__client__ref_code=line
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("st__gross_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for line in party_40_st_shipping_lines
            ]

            (
                top_5_shipping_lines_dict_by_revenue,
                top_5_shipping_lines_dict_by_volume,
            ) = get_lolo_st_sorted_data(
                line_20_revenue_shipping_lines_list=line_20_revenue_shipping_lines_list,
                line_40_revenue_shipping_lines_list=line_40_revenue_shipping_lines_list,
                party_20_revenue_shipping_lines_list=party_20_revenue_shipping_lines_list,
                party_40_revenue_shipping_lines_list=party_40_revenue_shipping_lines_list,
                line_20_volume_shipping_lines_list=line_20_volume_shipping_lines_list,
                line_40_volume_shipping_lines_list=line_40_volume_shipping_lines_list,
                party_20_volume_shipping_lines_list=party_20_volume_shipping_lines_list,
                party_40_volume_shipping_lines_list=party_40_volume_shipping_lines_list,
            )
            main_data["total_revenue"] = total_st_revenue
            main_data["total_volume"] = total_st_volume
            main_data["volume_data"] = top_5_shipping_lines_dict_by_volume
            main_data["revenue_data"] = top_5_shipping_lines_dict_by_revenue
            main_data["from_date"] = (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            )
            main_data["to_date"] = (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            )
        return main_data
    except:
        main_data = {
            "total_revenue": 0,
            "total_volume": 0,
            "volume_data": {
                "line_20": [],
                "line_40": [],
                "party_20": [],
                "party_40": [],
            },
            "revenue_data": {
                "line_20": [],
                "line_40": [],
                "party_20": [],
                "party_40": [],
            },
            "from_date": "",
            "to_date": "",
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return main_data


def location_site_weekly_mnr_volume_revenue(location, site, ref_code, year, week_num):
    try:

        week_dates = get_week_dates(year_str=year, week_num=week_num)
        days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]

        date_ranges = {day: week_dates[day] for day in days}
        if site.type == "DEPOT":
            related_fields = [
                "parent__depot__container__size",
                "parent__parent__depot__container__location",
                "parent__parent__depot__container__site",
            ]
        else:
            related_fields = [
                "parent__parent__non_depot__container__size",
                "parent__parent__non_depot__container__location",
                "parent__parent__non_depot__container__site",
            ]

        if site.type == "DEPOT":

            param = {
                "parent__parent__depot__container__location": location,
                "parent__parent__depot__container__site": site,
                "is_approved": True,
                "is_proceed": True,
                "current_date_time__range": (
                    date_ranges["Monday"]["from_date_time"],
                    date_ranges["Sunday"]["to_date_time"],
                ),
            }
        else:
            param = {
                "parent__parent__non_depot__container__location": location,
                "parent__parent__non_depot__container__site": site,
                "is_approved": True,
                "is_proceed": True,
                "current_date_time__range": (
                    date_ranges["Monday"]["from_date_time"],
                    date_ranges["Sunday"]["to_date_time"],
                ),
            }
        if ref_code:
            param["parent__parent__depot__container__client__ref_code"] = ref_code
            if site.type == "DEPOT":
                related_fields.append("parent__parent__depot__container__client")
            else:
                related_fields.append("parent__parent__non_depot__container__client")

        query_data = Approval.objects.select_related(*related_fields).filter(**param)

        data_containers = {
            "cleaning": {"20": "Cleaning", "40": "Cleaning"},
            "damage": {"20": "Damage", "40": "Damage"},
        }

        volume_data = {
            day: {f"size_{size}_data": 0 for size in ["20", "40"]} for day in days
        }
        revenue_data = {
            day: {
                f"size_{size}_{key}_data": 0
                for key in data_containers
                for size in data_containers[key]
            }
            for day in days
        }

        def filter_and_aggregate_data(
            query_data, size, survey_type, day, site, date_ranges
        ):
            if site.type == "DEPOT":
                query_data = query_data.filter(
                    current_date_time__range=(
                        date_ranges[day]["from_date_time"],
                        date_ranges[day]["to_date_time"],
                    ),
                    parent__parent__depot__container__size__name=size,
                )
            else:
                query_data = query_data.filter(
                    current_date_time__range=(
                        date_ranges[day]["from_date_time"],
                        date_ranges[day]["to_date_time"],
                    ),
                    parent__parent__non_depot__container__size__name=size,
                )
            data_count = query_data.count()
            survey = query_data.values_list("parent__parent__pk", flat=True)

            if survey_type == "Damage":
                if site.type == "DEPOT":
                    return data_count, SurveyLine.objects.select_related(
                        "parent__depot__container__size"
                    ).filter(
                        parent__depot__container__size__name=size,
                        parent_id__in=survey,
                        wash_clean_tariff=float(0),
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("total_cost", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )
                else:
                    return data_count, SurveyLine.objects.select_related(
                        "parent__non_depot__container__size"
                    ).filter(
                        parent__non_depot__container__size__name=size,
                        parent_id__in=survey,
                        wash_clean_tariff=float(0),
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("total_cost", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )

            if survey_type == "Cleaning":
                if site.type == "DEPOT":
                    return data_count, SurveyLine.objects.select_related(
                        "parent__depot__container__size"
                    ).filter(
                        parent__depot__container__size__name=size, parent_id__in=survey
                    ).exclude(
                        wash_clean_tariff=float(0)
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("total_cost", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )
                else:
                    return data_count, SurveyLine.objects.select_related(
                        "parent__non_depot__container__size"
                    ).filter(
                        parent__non_depot__container__size__name=size,
                        parent_id__in=survey,
                    ).exclude(
                        wash_clean_tariff=float(0)
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("total_cost", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )

        for day in days:
            for key, value in data_containers.items():
                for size, survey_type in value.items():

                    data_count, data = filter_and_aggregate_data(
                        query_data, size, survey_type, day, site, date_ranges
                    )
                    volume_data[day][f"size_{size}_data"] = data_count
                    revenue_data[day][f"size_{size}_{key}_data"] = data["revenue"]

        main_data = {
            "label": days,
            "volume_data": [{**{"name": day}, **volume_data[day]} for day in days],
            "revenue_data": [{**{"name": day}, **revenue_data[day]} for day in days],
            "from_date": date_ranges["Monday"]["from_date_time"].strftime("%d/%m/%Y"),
            "to_date": date_ranges["Sunday"]["to_date_time"].strftime("%d/%m/%Y"),
        }
        return main_data
    except:
        main_data = {
            "label": [],
            "volume_data": [],
            "revenue_data": [],
            "from_date": "",
            "to_date": "",
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return main_data


def location_site_quaterly_mnr_volume_revenue(
    location, site, ref_code, requirement, from_date, to_date
):
    try:
        required_date = get_required_date_list(requirement=requirement)
        quaterly_data = None
        params = {
            "parent__parent__depot__container__location": location,
            "parent__parent__depot__container__site": site,
            "is_approved": True,
            "is_proceed": True,
        }
        is_required_date = None
        if from_date and to_date:
            is_required_date = False
            is_required_date = False
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
            from_time = (
                datetime.datetime.now()
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .time()
            )
            to_time = (
                datetime.datetime.now()
                .replace(hour=23, minute=59, second=0, microsecond=0)
                .time()
            )
            from_date_time = datetime.datetime.combine(from_date_obj, from_time)
            to_date_time = datetime.datetime.combine(to_date_obj, to_time)
            params["current_date_time__range"] = (
                from_date_time,
                to_date_time,
            )
        else:
            is_required_date = True
            params["current_date_time__range"] = (
                required_date["from_date_time"],
                required_date["to_date_time"],
            )
        if site.type == "DEPOT":
            # depot
            if ref_code:
                params["parent__parent__depot__container__client__ref_code"] = ref_code
            quaterly_data = Approval.objects.select_related(
                "parent__parent__depot__container__location",
                "parent__parent__depot__container__site",
                "parent__parent__depot__container__size",
                "parent__parent__depot__container__client",
            ).filter(**params)
            # if not len(ref_code) == 0:
            #     quaterly_data = quaterly_data.filter(
            #         parent__parent__depot__container__client__ref_code=ref_code
            #     )
            size_20_data = quaterly_data.filter(
                parent__parent__depot__container__size__name="20"
            )
            size_40_data = quaterly_data.filter(
                parent__parent__depot__container__size__name="40"
            )
        else:
            # non_depot
            if ref_code:
                params[
                    "parent__parent__non_depot__container__client__ref_code"
                ] = ref_code
            quaterly_data = Approval.objects.select_related(
                "parent__parent__non_depot__container__location",
                "parent__parent__non_depot__container__site",
                "parent__parent__non_depot__container__size",
                "parent__parent__non_depot__container__client",
            ).filter(**params)
            # if not len(ref_code) == 0:
            #     quaterly_data = quaterly_data.filter(
            #         parent__parent__non_depot__container__client__ref_code=ref_code
            #     )
            size_20_data = quaterly_data.filter(
                parent__parent__non_depot__container__size__name="20"
            )
            size_40_data = quaterly_data.filter(
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
            "from_date": (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            ),
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


def location_site_mnr_stage_data(ref_code, location, site):
    try:
        if site.type == "DEPOT":
            stock = ContainerStock.objects.filter(
                container_status="IN",
                container__location=location,
                container__site=site,
            )
        else:
            stock = NonDepotContainerStock.objects.filter(
                container_status="IN",
                container__location=location,
                container__site=site,
            )
        if ref_code != "":
            stock = stock.filter(container__client__ref_code=ref_code)

        main_data = {}
        stages = [
            "Survey",
            "Estimate",
            "Approval",
            "Repair",
            "Available",
        ]

        container_type = [each_type.name for each_type in ContainerType.objects.all()]
        total_data = {}
        main_data = {"total_data": total_data}

        total_data = []
        total_20_data = []
        total_40_data = []

        for each in stages:
            stock_query = stock.filter(stage=each)
            total_count = stock_query.count()
            total_20_count = stock_query.filter(container__size__name="20").count()
            total_40_count = stock_query.filter(container__size__name="40").count()
            total_data.append({"name": each, "value": total_count})
            total_20_count = stock.filter(
                status=each, container__size__name="20"
            ).count()
            total_20_data.append({"name": each, "value": total_20_count})
            total_40_count = stock.filter(
                status=each, container__size__name="40"
            ).count()
            total_40_data.append({"name": each, "value": total_40_count})

        main_data["total_data"] = total_data
        main_data["20_total_data"] = total_20_data
        main_data["40_total_data"] = total_40_data

        type_wise_data = []
        type_wise_20_data = []
        type_wise_40_data = []
        count = 0
        for each in container_type:
            type_wise_data.append({"name": each})
            type_wise_20_data.append({"name": each})
            type_wise_40_data.append({"name": each})
            for each_stage in stages:
                stock_query = stock.filter(stage=each_stage, container__type__name=each)
                type_wise_data[count][each_stage] = stock_query.count()
                type_wise_20_data[count][each_stage] = stock_query.filter(
                    container__size__name="20"
                ).count()
                type_wise_40_data[count][each_stage] = stock_query.filter(
                    container__size__name="40"
                ).count()
            count = count + 1
        main_data["type_wise_data"] = type_wise_data
        main_data["20_type_wise_data"] = type_wise_20_data
        main_data["40_type_wise_data"] = type_wise_40_data
        main_data["from_date"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .strftime("%d/%m/%Y")
        )
        main_data["to_date"] = (
            datetime.datetime.now()
            .astimezone(timezone.get_current_timezone())
            .strftime("%d/%m/%Y")
        )
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {}


def get_mnr_sorted_data(
    size_20_revenue_client_list,
    size_40_revenue_client_list,
    size_20_volume_client_list,
    size_40_volume_client_list,
):
    # Helper function to sort and slice a list
    def sort_and_slice(lst):
        lst.sort(key=lambda x: list(x.values())[1], reverse=True)
        sorted_lst = lst[:5] if len(lst) >= 5 else lst
        return sorted_lst

    top_5_clients_by_size_20_volume = sort_and_slice(size_20_volume_client_list)
    top_5_clients_by_size_40_volume = sort_and_slice(size_40_volume_client_list)

    top_5_clients_by_size_20 = sort_and_slice(size_20_revenue_client_list)
    top_5_clients_by_size_40 = sort_and_slice(size_40_revenue_client_list)

    top_5_clients_dict_by_revenue = {
        "size_20": top_5_clients_by_size_20,
        "size_40": top_5_clients_by_size_40,
    }
    top_5_clients_dict_by_volume = {
        "size_20": top_5_clients_by_size_20_volume,
        "size_40": top_5_clients_by_size_40_volume,
    }
    return top_5_clients_dict_by_revenue, top_5_clients_dict_by_volume


def mnr_top_client(
    location,
    site,
    requirement,
    ref_code,
    from_date,
    to_date,
):
    try:
        required_date = get_required_date_list(requirement=requirement)
        main_data = {}
        size_20_volume_client_list = []
        size_40_volume_client_list = []
        size_20_revenue_client_list = []
        size_40_revenue_client_list = []
        quaterly_data = None
        params = {
            "parent__parent__depot__container__location": location,
            "parent__parent__depot__container__site": site,
            "is_approved": True,
            "is_proceed": True,
        }
        is_required_date = None
        if from_date and to_date:
            is_required_date = False
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
            from_time = (
                datetime.datetime.now()
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .time()
            )
            to_time = (
                datetime.datetime.now()
                .replace(hour=23, minute=59, second=0, microsecond=0)
                .time()
            )
            from_date_time = datetime.datetime.combine(from_date_obj, from_time)
            to_date_time = datetime.datetime.combine(to_date_obj, to_time)
            params["current_date_time__range"] = (
                from_date_time,
                to_date_time,
            )
        else:
            is_required_date = True
            params["current_date_time__range"] = (
                required_date["from_date_time"],
                required_date["to_date_time"],
            )
        if site.type == "DEPOT":
            # depot

            if ref_code:
                params["parent__parent__depot__container__client__ref_code"] = ref_code

            quaterly_data = Approval.objects.select_related(
                "parent__parent__depot__container__location",
                "parent__parent__depot__container__site",
                "parent__parent__depot__container__size",
                "parent__parent__depot__container__client",
            ).filter(**params)
            # if not len(ref_code) == 0:
            #     quaterly_data = quaterly_data.filter(
            #         parent__parent__depot__container__client__ref_code=ref_code
            #     )
            # quaterly_data = quaterly_data.annotate(revenue=Sum("approved_amount"))
            size_20_data = quaterly_data.filter(
                parent__parent__depot__container__size__name="20"
            )
            size_40_data = quaterly_data.filter(
                parent__parent__depot__container__size__name="40"
            )
            # clients
            size_20_mnr_clients_raw = size_20_data.values_list(
                "parent__parent__depot__container__client__name", flat=True
            )
            size_20_mnr_clients = list(set(list(size_20_mnr_clients_raw)))
            size_40_mnr_clients_raw = size_40_data.values_list(
                "parent__parent__depot__container__client__name", flat=True
            )
            size_40_mnr_clients = list(set(list(size_40_mnr_clients_raw)))

            size_20_volume_client_list = [
                {
                    "name": client,
                    "value": size_20_data.filter(
                        parent__parent__depot__container__client__name=client
                    ).count(),
                }
                for client in size_20_mnr_clients
            ]
            size_20_revenue_client_list = [
                {
                    "name": client,
                    "value": size_20_data.filter(
                        parent__parent__depot__container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("approved_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for client in size_20_mnr_clients
            ]
            size_40_volume_client_list = [
                {
                    "name": client,
                    "value": size_40_data.filter(
                        parent__parent__depot__container__client__name=client
                    ).count(),
                }
                for client in size_40_mnr_clients
            ]
            size_40_revenue_client_list = [
                {
                    "name": client,
                    "value": size_40_data.filter(
                        parent__parent__depot__container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("approved_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for client in size_40_mnr_clients
            ]

        else:
            # non_depot

            if ref_code:
                params[
                    "parent__parent__non_depot__container__client__ref_code"
                ] = ref_code
            quaterly_data = Approval.objects.select_related(
                "parent__parent__non_depot__container__location",
                "parent__parent__non_depot__container__site",
                "parent__parent__non_depot__container__size",
                "parent__parent__non_depot__container__client",
            ).filter(**params)
            # if not len(ref_code) == 0:
            #     quaterly_data = quaterly_data.filter(
            #         parent__parent__non_depot__container__client__ref_code=ref_code
            #     )
            # quaterly_data = quaterly_data.annotate(revenue=Sum("approved_amount"))
            size_20_data = quaterly_data.filter(
                parent__parent__non_depot__container__size__name="20"
            )
            size_40_data = quaterly_data.filter(
                parent__parent__non_depot__container__size__name="40"
            )

            # clients
            size_20_mnr_clients_raw = size_20_data.values_list(
                "parent__parent__non_depot__container__client__name", flat=True
            )
            size_20_mnr_clients = list(set(list(size_20_mnr_clients_raw)))
            size_40_mnr_clients_raw = size_40_data.values_list(
                "parent__parent__non_depot__container__client__name", flat=True
            )
            size_40_mnr_clients = list(set(list(size_40_mnr_clients_raw)))

            size_20_volume_client_list = [
                {
                    "name": client,
                    "value": size_20_data.filter(
                        parent__parent__non_depot__container__client__name=client
                    ).count(),
                }
                for client in size_20_mnr_clients
            ]
            size_20_revenue_client_list = [
                {
                    "name": client,
                    "value": size_20_data.filter(
                        parent__parent__non_depot__container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("approved_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for client in size_20_mnr_clients
            ]
            size_40_volume_client_list = [
                {
                    "name": client,
                    "value": size_40_data.filter(
                        parent__parent__non_depot__container__client__name=client
                    ).count(),
                }
                for client in size_40_mnr_clients
            ]
            size_40_revenue_client_list = [
                {
                    "name": client,
                    "value": size_40_data.filter(
                        parent__parent__non_depot__container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(
                            Sum("approved_amount", output_field=FloatField()),
                            0,
                            output_field=FloatField(),
                        )
                    )[
                        "revenue"
                    ],
                }
                for client in size_40_mnr_clients
            ]

        # volume
        total_mnr_volume = quaterly_data.count()
        # revenue
        total_mnr_revenue = quaterly_data.aggregate(
            revenue=Coalesce(
                Sum("approved_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )["revenue"]
        (
            top_5_clients_dict_by_revenue,
            top_5_clients_dict_by_volume,
        ) = get_mnr_sorted_data(
            size_20_revenue_client_list=size_20_revenue_client_list,
            size_40_revenue_client_list=size_40_revenue_client_list,
            size_20_volume_client_list=size_20_volume_client_list,
            size_40_volume_client_list=size_40_volume_client_list,
        )
        main_data["total_revenue"] = total_mnr_revenue
        main_data["total_volume"] = total_mnr_volume
        main_data["volume_data"] = top_5_clients_dict_by_volume
        main_data["revenue_data"] = top_5_clients_dict_by_revenue
        main_data["from_date"] = (
            required_date["from_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else from_date_obj.strftime("%d/%m/%Y")
        )

        main_data["to_date"] = (
            required_date["to_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else to_date_obj.strftime("%d/%m/%Y")
        )
        return main_data
    except:
        main_data = {
            "total_revenue": 0,
            "total_volume": 0,
            "volume_data": {"size_20": [], "size_40": []},
            "revenue_data": {"size_20": [], "size_40": []},
            "from_date": "",
            "to_date": "",
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return main_data


def calculate_total_plywood_area(line_obj, length, width):
    if length == "96" and width == "48":
        quantity = line_obj.filter(
            repair_description__icontains="Replace",
            length_and_width=f"{length}*{width}",
        ).aggregate(count=Coalesce(Sum("quantity"), Value(0)))["count"]
    else:
        quantity = line_obj.filter(
            repair_description__icontains="Section",
            length_and_width=f"{length}*{width}",
        ).aggregate(count=Coalesce(Sum("quantity"), Value(0)))["count"]
    count = quantity * int(length) * int(width)
    return quantity, count


def mnr_plywood_material(requirement, location, site):
    try:
        required_date = get_required_date_list(requirement=requirement)
        if site.type == "DEPOT":
            data = Approval.objects.select_related(
                "parent__parent__depot__container__location",
                "parent__parent__depot__container__site",
                "parent__parent__depot__status",
                "parent__parent",
            ).filter(
                parent__parent__depot__container__location=location,
                parent__parent__depot__container__site=site,
                parent__parent__depot__status="Available",
                current_date_time__range=(
                    required_date["from_date_time"],
                    required_date["to_date_time"],
                ),
            )
        else:
            data = Approval.objects.select_related(
                "parent__parent__non_depot__container__location",
                "parent__parent__non_depot__container__site",
                "parent__parent__non_depot__status",
                "parent__parent",
            ).filter(
                parent__parent__non_depot__container__location=location,
                parent__parent__non_depot__container__site=site,
                parent__parent__non_depot__status="Available",
                current_date_time__range=(
                    required_date["from_date_time"],
                    required_date["to_date_time"],
                ),
            )
        main_data = {}
        survey_obj = data.values_list("parent__parent", flat=True).distinct()

        line_obj = SurveyLine.objects.select_related("parent").filter(
            parent__in=survey_obj, material_description__icontains="Plywood"
        )
        plywood_obj = []
        plywood_involved = 0
        plywood_used_area = 0
        for length, width in [
            ("96", "48"),
            ("84", "48"),
            ("48", "48"),
            ("36", "24"),
            ("48", "24"),
            ("48", "36"),
            ("48", "72"),
            ("48", "60"),
        ]:
            plywood_quantity, plywood_area = calculate_total_plywood_area(
                line_obj, length=length, width=width
            )
            plywood_involved += plywood_quantity
            plywood_used_area += plywood_area
            waste_plywood_area = (plywood_quantity * (96 * 48)) - plywood_area
            plywood_obj.append(
                {
                    "size": f"{length}*{width}",
                    "no_of_plywood_involved": plywood_quantity,
                    "area_of_plywood_involved": plywood_quantity * (96 * 48),
                    "no_of_plywood_used": plywood_area / (96 * 48),
                    "area_of_plywood_used": plywood_area,
                    "no_of_waste_plywood": waste_plywood_area / (96 * 48),
                    "area_of_waste_plywood": waste_plywood_area,
                }
            )
        main_data = {
            "no_of_total_plywood_involved": plywood_involved,
            "no_of_total_plywood_used": plywood_used_area / (96 * 48),
            "no_of_total_waste_plywood": plywood_involved
            - plywood_used_area / (96 * 48),
            "data": plywood_obj,
            "from_date": required_date["from_date_time"].strftime("%d/%m/%Y"),
            "to_date": required_date["to_date_time"].strftime("%d/%m/%Y"),
        }

        return main_data

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def total_mnr_data(from_date, to_date, location, site, line):
#     try:
#         if site.type == "DEPOT":
#             params = {
#                 "parent__depot__container__location": location,
#                 "parent__depot__container__site": site,
#             }
#             if line:
#                 params["parent__depot__container__client__ref_code"] = line

#         else:
#             params = {
#                 "parent__non_depot__container__location": location,
#                 "parent__non_depot__container__site": site,
#             }
#             if line:
#                 params["parent__non_depot__container__client__ref_code"] = line
#         is_required_date = None
#         if from_date and to_date:
#             from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
#             to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
#             is_required_date = False
#             params["current_date__range"] = (from_date_obj, to_date_obj)

#         else:
#             today = datetime.datetime.now().date()
#             params["current_date__lte"] = today
#             is_required_date = True

#         if site.type == "DEPOT":
#             # estimation_data = Estimate.objects.filter(**params).aggregate(
#             #     revenue=Coalesce(
#             #         Sum("current_amount", output_field=FloatField()),
#             #         0,
#             #         output_field=FloatField(),
#             #     ),
#             #     count=Count("id"),
#             # )
#             estimation = Estimate.objects.filter(**params)
#             rejected_ids = [
#                 each["parent__pk"]
#                 for each in Approval.objects.filter(
#                     parent__in=estimation, is_denied=True, is_partial_denied=True
#                 ).values("parent__pk")
#             ]
#             estimation = estimation.exclude(
#                 pk__in=rejected_ids,
#             )
#             estimation_data = estimation.filter(**params).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#             approval_pending_data = estimation.filter(
#                 parent__depot__status="Approval Pending",
#                 parent__depot__stage="Approval",
#                 is_approved=False,
#                 **params,
#             ).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#             under_repair_data = estimation.filter(
#                 parent__depot__status__in=["Approved", "Under Repairing"],
#                 parent__depot__stage="Repair",
#                 is_approved=True,
#                 **params,
#             ).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#             available_data = estimation.filter(
#                 parent__depot__status="Available",
#                 parent__depot__stage="Available",
#                 **params,
#             ).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#         else:
#             estimation_data = Estimate.objects.filter(**params).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#             approval_pending_data = Estimate.objects.filter(
#                 parent__non_depot__status="Approval Pending",
#                 is_approved=False,
#                 **params,
#             ).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#             under_repair_data = Estimate.objects.filter(
#                 parent__non_depot__status="Approved", is_approved=True, **params
#             ).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )
#             available_data = Estimate.objects.filter(
#                 parent__non_depot__status="Available", **params
#             ).aggregate(
#                 revenue=Coalesce(
#                     Sum("current_amount", output_field=FloatField()),
#                     0,
#                     output_field=FloatField(),
#                 ),
#                 count=Count("id"),
#             )

#         data = {
#             "estimation_cost": {
#                 "revenue": estimation_data["revenue"],
#                 "count": estimation_data["count"],
#             },
#             "approval_pending": {
#                 "revenue": approval_pending_data["revenue"],
#                 "count": approval_pending_data["count"],
#             },
#             "under_repairing": {
#                 "revenue": under_repair_data["revenue"],
#                 "count": under_repair_data["count"],
#             },
#             "available": {
#                 "revenue": available_data["revenue"],
#                 "count": available_data["count"],
#             },
#             "from_date": (
#                 "" if is_required_date else from_date_obj.strftime("%d/%m/%Y")
#             ),
#             "to_date": (
#                 today.strftime("%d/%m/%Y")
#                 if is_required_date
#                 else to_date_obj.strftime("%d/%m/%Y")
#             ),
#         }
#         return data

#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return None


def total_mnr_data(from_date, to_date, location, site, line):
    try:
        container_key = (
            "parent__depot__container__"
            if site.type == "DEPOT"
            else "parent__non_depot__container__"
        )
        stage_key = (
            "parent__depot__stage"
            if site.type == "DEPOT"
            else "parent__non_depot__stage"
        )
        approval_stage_params = {f"{stage_key}": "Approval"}
        repair_stage_params = {f"{stage_key}": "Repair"}
        available_stage_params = {f"{stage_key}": "Available"}
        params = {
            f"{container_key}location": location,
            f"{container_key}site": site,
        }
        if line:
            params[f"{container_key}client__ref_code"] = line

        is_required_date = None
        if from_date and to_date:
            from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
            is_required_date = False
        else:
            today = datetime.datetime.now()
            yesterday = today - datetime.timedelta(days=1)
            from_date_obj, to_date_obj = yesterday.date(), today.date()
            is_required_date = True

        params["current_date__gte"] = from_date_obj
        params["current_date__lte"] = to_date_obj

        # Queries
        estimate_query = Estimate.objects.filter(**params)
        estimate_data = estimate_query.aggregate(
            revenue=Coalesce(
                Sum("current_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            ),
            count=Count("id"),
        )
        approval_data = estimate_query.filter(**approval_stage_params).aggregate(
            revenue=Coalesce(
                Sum("current_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            ),
            count=Count("id"),
        )
        repair_data = estimate_query.filter(**repair_stage_params).aggregate(
            revenue=Coalesce(
                Sum("current_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            ),
            count=Count("id"),
        )
        available_data = estimate_query.filter(**available_stage_params).aggregate(
            revenue=Coalesce(
                Sum("current_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            ),
            count=Count("id"),
        )

        data = {
            "estimation_cost": {
                "revenue": round(estimate_data["revenue"]),
                "count": estimate_data["count"],
            },
            "approval_pending": {
                "revenue": round(approval_data["revenue"]),
                "count": approval_data["count"],
            },
            "under_repairing": {
                "revenue": round(repair_data["revenue"]),
                "count": repair_data["count"],
            },
            "available": {
                "revenue": round(available_data["revenue"]),
                "count": available_data["count"],
            },
            "from_date": (
                "" if is_required_date else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                today.strftime("%d/%m/%Y")
                if is_required_date
                else to_date_obj.strftime("%d/%m/%Y")
            ),
        }
        return data

    except Exception:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_approval_objects(from_date, to_date, location, site, site_obj, line):
    from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
    to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
    mnr_invoice_line = MNRInvoiceLine.objects.filter(
        parent__invoice_date__range=(from_date_obj, to_date_obj),
        parent__location__name=location,
        parent__site__name=site,
    )
    bill_ids = [ast.literal_eval(each.bill_ids) for each in mnr_invoice_line]
    # converts nested lists into flat list
    bill_ids = sum(bill_ids, [])

    survey_ids = CustomerBill.objects.filter(pk__in=bill_ids).values_list(
        "survey_id", flat=True
    )
    if line == "ALL":
        approval_objects = (
            Approval.objects.filter(parent__parent__pk__in=survey_ids)
            .exclude(denial_reason="REJECTED")
            .order_by("current_date")
        )
    else:
        if site_obj.type == "DEPOT":
            approval_objects = (
                Approval.objects.filter(
                    parent__parent__pk__in=survey_ids,
                    parent__parent__depot__container__client__ref_code=line,
                )
                .exclude(denial_reason="REJECTED")
                .order_by("current_date")
            )
        else:
            approval_objects = (
                Approval.objects.filter(
                    parent__parent__pk__in=survey_ids,
                    parent__parent__non_depot__container__client__ref_code=line,
                )
                .exclude(denial_reason="REJECTED")
                .order_by("current_date")
            )

    approval_objects = approval_objects.exclude(
        parent__current_amount=F("parent__original_amount")
    )
    return approval_objects


def change_key(dict, nameKey, valueKey):
    dict["name"] = dict.pop(nameKey)
    dict["value"] = dict.pop(valueKey)


def top_consignee_shipper(requirement, location, site, from_date, to_date, line):
    required_date = get_required_date_list(requirement=requirement)

    params = {
        "container__location": location,
        "container__site": site,
        "lolo__isnull": False,
    }
    if line:
        params["container__client__ref_code"] = line

    is_required_date = None
    if from_date and to_date:
        from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
        from_time = (
            datetime.datetime.now()
            .replace(hour=0, minute=0, second=0, microsecond=0)
            .time()
        )
        to_time = (
            datetime.datetime.now()
            .replace(hour=23, minute=59, second=0, microsecond=0)
            .time()
        )
        from_date_time = datetime.datetime.combine(from_date_obj, from_time)
        to_date_time = datetime.datetime.combine(to_date_obj, to_time)

        params["date__range"] = (
            from_date_time,
            to_date_time,
        )

        is_required_date = False
    else:
        params["date__range"] = (
            required_date["from_date_time"],
            required_date["to_date_time"],
        )

        is_required_date = True

    # For Top Consignor
    gate_in_queryset = GateInHistory.objects.select_related("gate_in").filter(
        gate_in__consignee__isnull=False, **params
    )
    total_consignee_revenue = gate_in_queryset.aggregate(
        revenue=Coalesce(
            Sum("lolo__gross_amount", output_field=FloatField()),
            0,
            output_field=FloatField(),
        )
    )["revenue"]

    consignee_20_revenue = list(
        gate_in_queryset.filter(container__size__name="20")
        .values("gate_in__consignee")
        .annotate(
            revenue=Coalesce(
                Sum("lolo__gross_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        .order_by("-revenue")
    )[:5]

    consignee_40_revenue = list(
        gate_in_queryset.filter(container__size__name="40")
        .values("gate_in__consignee")
        .annotate(
            revenue=Coalesce(
                Sum("lolo__gross_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        .order_by("-revenue")
    )[:5]

    # For Top shipper

    gate_out_queryset = GateOutHistory.objects.select_related(
        "gate_out", "lolo"
    ).filter(gate_out__shipper__isnull=False, **params)

    total_shipper_revenue = gate_out_queryset.aggregate(
        revenue=Coalesce(
            Sum("lolo__gross_amount", output_field=FloatField()),
            0,
            output_field=FloatField(),
        )
    )["revenue"]

    shipper_20_revenue = list(
        gate_out_queryset.filter(container__size__name="20")
        .values("gate_out__shipper")
        .annotate(
            revenue=Coalesce(
                Sum("lolo__gross_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        .order_by("-revenue")
    )[:5]
    shipper_40_revenue = list(
        gate_out_queryset.filter(container__size__name="40")
        .values("gate_out__shipper")
        .annotate(
            revenue=Coalesce(
                Sum("lolo__gross_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        .order_by("-revenue")
    )[:5]
    data = {
        "total_consignee_revenue": total_consignee_revenue,
        "total_shipper_revenue": total_shipper_revenue,
        "revenue_data": {
            "consignee_20": consignee_20_revenue,
            "consignee_40": consignee_40_revenue,
            "shipper_20": shipper_20_revenue,
            "shipper_40": shipper_40_revenue,
        },
        "from_date": (
            required_date["from_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else from_date_obj.strftime("%d/%m/%Y")
        ),
        "to_date": (
            required_date["to_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else to_date_obj.strftime("%d/%m/%Y")
        ),
    }
    if data["revenue_data"]["consignee_20"]:
        for each in data["revenue_data"]["consignee_20"]:
            change_key(each, "gate_in__consignee", "revenue")

    if data["revenue_data"]["consignee_40"]:
        for each in data["revenue_data"]["consignee_40"]:
            change_key(each, "gate_in__consignee", "revenue")

    if data["revenue_data"]["shipper_20"]:
        for each in data["revenue_data"]["shipper_20"]:
            change_key(each, "gate_out__shipper", "revenue")

    if data["revenue_data"]["shipper_40"]:
        for each in data["revenue_data"]["shipper_40"]:
            change_key(each, "gate_out__shipper", "revenue")

    # data["total_consignee_revenue"]=float(data["total_consignee_revenue"])
    # data["total_shipper_revenue"]=float(data["total_shipper_revenue"])
    # if data["revenue_data"]["consignee_20"]:
    #     for each in data["revenue_data"]["consignee_20"]:
    #         each["name"]=str(each["name"])
    #         each["value"]=float(each["value"])
    # if data["revenue_data"]["consignee_40"]:
    #     for each in data["revenue_data"]["consignee_40"]:
    #         each["name"]=str(each["name"])
    #         each["value"]=float(each["value"])
    # if data["revenue_data"]["shipper_20"]:
    #     for each in data["revenue_data"]["shipper_20"]:
    #         each["name"]=str(each["name"])
    #         each["value"]=float(each["value"])
    # if data["revenue_data"]["shipper_40"]:
    #     for each in data["revenue_data"]["shipper_40"]:
    #         each["name"]=str(each["name"])
    #         each["value"]=float(each["value"])
    # import json
    # json_string = json.dumps(data, indent=4)

    return data


def top_transporter(requirement, location, site, movement, from_date, to_date, line):
    required_date = get_required_date_list(requirement=requirement)
    model = GateInHistory if movement == "IN" else GateOutHistory
    if movement == "IN":
        param = {"gate_in__transporter_name__isnull": False}
        value = "gate_in__transporter_name__name"
    else:
        param = {"gate_out__transporter_name__isnull": False}
        value = "gate_out__transporter_name__name"
    if line:
        param["container__client__ref_code"] = line

    is_required_date = None
    if from_date and to_date:
        from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()

        from_time = (
            datetime.datetime.now()
            .replace(hour=0, minute=0, second=0, microsecond=0)
            .time()
        )
        to_time = (
            datetime.datetime.now()
            .replace(hour=23, minute=59, second=0, microsecond=0)
            .time()
        )
        from_date_time = datetime.datetime.combine(from_date_obj, from_time)
        to_date_time = datetime.datetime.combine(to_date_obj, to_time)
        param["date__range"] = (
            from_date_time,
            to_date_time,
        )

        is_required_date = False
    else:
        param["date__range"] = (
            required_date["from_date_time"],
            required_date["to_date_time"],
        )

        is_required_date = True
    queryset = model.objects.select_related("gate_in").filter(
        container__location=location,
        container__site=site,
        **param,
    )
    total_volume = queryset.values(value).count()

    line_20_volume = list(
        queryset.filter(container__size__name="20", lolo__apply_charges="Line")
        .values(value)
        .annotate(volume=Count(value))
        .order_by("-volume")
    )[:5]

    line_40_volume = list(
        queryset.filter(container__size__name="40", lolo__apply_charges="Line")
        .values(value)
        .annotate(volume=Count(value))
        .order_by("-volume")
    )[:5]

    party_20_volume = list(
        queryset.filter(container__size__name="20", lolo__apply_charges="Party")
        .values(value)
        .annotate(volume=Count(value))
        .order_by("-volume")
    )[:5]

    party_40_volume = list(
        queryset.filter(container__size__name="20", lolo__apply_charges="Party")
        .values(value)
        .annotate(volume=Count(value))
        .order_by("-volume")
    )[:5]

    data = {
        "total_volume": total_volume,
        "volume_data": {
            "line_20": line_20_volume,
            "line_40": line_40_volume,
            "party_20": party_20_volume,
            "party_40": party_40_volume,
        },
        "from_date": (
            required_date["from_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else from_date_obj.strftime("%d/%m/%Y")
        ),
        "to_date": (
            required_date["to_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else to_date_obj.strftime("%d/%m/%Y")
        ),
    }
    if data["volume_data"]["line_20"]:
        for each in data["volume_data"]["line_20"]:
            change_key(each, value, "volume")

    if data["volume_data"]["line_40"]:
        for each in data["volume_data"]["line_40"]:
            change_key(each, value, "volume")

    if data["volume_data"]["party_20"]:
        for each in data["volume_data"]["party_20"]:
            change_key(each, value, "volume")

    if data["volume_data"]["party_40"]:
        for each in data["volume_data"]["party_40"]:
            change_key(each, value, "volume")

    return data


def top_cargo(requirement, location, site, from_date, to_date, line):
    required_date = get_required_date_list(requirement=requirement)
    params = {
        "container__location": location,
        "container__site": site,
    }
    if line:
        params["container__client__ref_code"] = line

    is_required_date = None
    if from_date and to_date:
        from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
        from_time = (
            datetime.datetime.now()
            .replace(hour=0, minute=0, second=0, microsecond=0)
            .time()
        )
        to_time = (
            datetime.datetime.now()
            .replace(hour=23, minute=59, second=0, microsecond=0)
            .time()
        )
        from_date_time = datetime.datetime.combine(from_date_obj, from_time)
        to_date_time = datetime.datetime.combine(to_date_obj, to_time)
        params["date__range"] = (
            from_date_time,
            to_date_time,
        )

        is_required_date = False
    else:
        params["date__range"] = (
            required_date["from_date_time"],
            required_date["to_date_time"],
        )

        is_required_date = True
    import_cargo = GateInHistory.objects.select_related("gate_in").filter(
        gate_in__cargo__isnull=False, **params
    )
    total_import_cargo_volume = import_cargo.values("gate_in__cargo").count()
    import_cargo_20 = list(
        import_cargo.filter(container__size__name="20")
        .values("gate_in__cargo")
        .annotate(volume=Count("gate_in__cargo"))
        .order_by("-volume")
    )[:5]
    import_cargo_40 = list(
        import_cargo.filter(container__size__name="40")
        .values("gate_in__cargo")
        .annotate(volume=Count("gate_in__cargo"))
        .order_by("-volume")
    )[:5]

    export_cargo = GateOutHistory.objects.select_related("gate_out").filter(
        gate_out__export_cargo__isnull=False, **params
    )
    total_export_cargo_volume = export_cargo.values("gate_out__export_cargo").count()
    export_cargo_20 = list(
        export_cargo.filter(container__size__name="20")
        .values("gate_out__export_cargo")
        .annotate(volume=Count("gate_out__export_cargo"))
        .order_by("-volume")
    )[:5]
    export_cargo_40 = list(
        export_cargo.filter(container__size__name="40")
        .values("gate_out__export_cargo")
        .annotate(volume=Count("gate_out__export_cargo"))
        .order_by("-volume")
    )[:5]
    data = {
        "total_import_cargo_volume": total_import_cargo_volume,
        "total_export_cargo_volume": total_export_cargo_volume,
        "volume_data": {
            "import_20": import_cargo_20,
            "import_40": import_cargo_40,
            "export_20": export_cargo_20,
            "export_40": export_cargo_40,
        },
        "from_date": (
            required_date["from_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else from_date_obj.strftime("%d/%m/%Y")
        ),
        "to_date": (
            required_date["to_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else to_date_obj.strftime("%d/%m/%Y")
        ),
    }
    if data["volume_data"]["import_20"]:
        for each in data["volume_data"]["import_20"]:
            change_key(each, "gate_in__cargo", "volume")

    if data["volume_data"]["import_40"]:
        for each in data["volume_data"]["import_40"]:
            change_key(each, "gate_in__cargo", "volume")

    if data["volume_data"]["export_20"]:
        for each in data["volume_data"]["export_20"]:
            change_key(each, "gate_out__export_cargo", "volume")

    if data["volume_data"]["export_40"]:
        for each in data["volume_data"]["export_40"]:
            change_key(each, "gate_out__export_cargo", "volume")

    return data


def get_arrived_data(obj):
    repo_in_20_factory = list(
        obj.filter(container__size__name="20", gate_in__arrived="Factory")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    repo_in_40_factory = list(
        obj.filter(container__size__name="40", gate_in__arrived="Factory")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    repo_in_20_by_road_rail = list(
        obj.filter(container__size__name="20", gate_in__arrived="Road/Rail")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    repo_in_40_by_road_rail = list(
        obj.filter(container__size__name="40", gate_in__arrived="Road/Rail")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    repo_in_20_fs_return = list(
        obj.filter(container__size__name="20", gate_in__arrived="FS RETURN")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]
    repo_in_40_fs_return = list(
        obj.filter(container__size__name="40", gate_in__arrived="FS RETURN")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    repo_in_20_cfs_icd = list(
        obj.filter(container__size__name="20", gate_in__arrived="CFS/ICD")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]
    repo_in_40_cfs_icd = list(
        obj.filter(container__size__name="40", gate_in__arrived="CFS/ICD")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    repo_in_20_port_vessel = list(
        obj.filter(container__size__name="20", gate_in__arrived="Port/Vessel")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]
    repo_in_40_port_vessel = list(
        obj.filter(container__size__name="40", gate_in__arrived="Port/Vessel")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_in__arrived"))
        .order_by("-volume")
    )[:5]

    if repo_in_20_factory:
        for each in repo_in_20_factory:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_40_factory:
        for each in repo_in_40_factory:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_20_by_road_rail:
        for each in repo_in_20_by_road_rail:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_40_by_road_rail:
        for each in repo_in_40_by_road_rail:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_20_fs_return:
        for each in repo_in_20_fs_return:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_40_fs_return:
        for each in repo_in_40_fs_return:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_20_cfs_icd:
        for each in repo_in_20_cfs_icd:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_40_cfs_icd:
        for each in repo_in_40_cfs_icd:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_20_port_vessel:
        for each in repo_in_20_port_vessel:
            change_key(each, "container__client__ref_code", "volume")
    if repo_in_40_port_vessel:
        for each in repo_in_40_port_vessel:
            change_key(each, "container__client__ref_code", "volume")

    return {
        "repo_20_factory": repo_in_20_factory,
        "repo_40_factory": repo_in_40_factory,
        "repo_20_by_road_rail": repo_in_20_by_road_rail,
        "repo_40_by_road_rail": repo_in_40_by_road_rail,
        "repo_20_fs_return": repo_in_20_fs_return,
        "repo_40_fs_return": repo_in_40_fs_return,
        "repo_20_by_cfs_icd": repo_in_20_cfs_icd,
        "repo_40_by_cfs_icd": repo_in_40_cfs_icd,
        "repo_20_port_vessel": repo_in_20_port_vessel,
        "repo_40_port_vessel": repo_in_40_port_vessel,
    }


def get_departed_data(obj):

    repo_out_20_factory = list(
        obj.filter(container__size__name="20", gate_out__departed="Factory")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]
    repo_out_40_factory = list(
        obj.filter(container__size__name="40", gate_out__departed="Factory")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]

    repo_out_20_by_road_rail = list(
        obj.filter(container__size__name="20", gate_out__departed="Road/Rail")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]
    repo_out_40_by_road_rail = list(
        obj.filter(container__size__name="40", gate_out__departed="Road/Rail")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]

    repo_out_20_fs_return = list(
        obj.filter(container__size__name="20", gate_out__departed="FS RETURN")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]
    repo_out_40_fs_return = list(
        obj.filter(container__size__name="40", gate_out__departed="FS RETURN")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]

    repo_out_20_cfs_icd = list(
        obj.filter(container__size__name="20", gate_out__departed="CFS/ICD")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]
    repo_out_40_cfs_icd = list(
        obj.filter(container__size__name="40", gate_out__departed="CFS/ICD")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]

    repo_out_20_port_vessel = list(
        obj.filter(container__size__name="20", gate_out__departed="Port/Vessel")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]
    repo_out_40_port_vessel = list(
        obj.filter(container__size__name="40", gate_out__departed="Port/Vessel")
        .values("container__client__ref_code")
        .annotate(volume=Count("gate_out__departed"))
        .order_by("-volume")
    )[:5]

    if repo_out_20_factory:
        for each in repo_out_20_factory:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_40_factory:
        for each in repo_out_40_factory:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_20_by_road_rail:
        for each in repo_out_20_by_road_rail:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_40_by_road_rail:
        for each in repo_out_40_by_road_rail:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_20_fs_return:
        for each in repo_out_20_fs_return:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_40_fs_return:
        for each in repo_out_40_fs_return:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_20_cfs_icd:
        for each in repo_out_20_cfs_icd:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_40_cfs_icd:
        for each in repo_out_40_cfs_icd:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_20_port_vessel:
        for each in repo_out_20_port_vessel:
            change_key(each, "container__client__ref_code", "volume")
    if repo_out_40_port_vessel:
        for each in repo_out_40_port_vessel:
            change_key(each, "container__client__ref_code", "volume")

    return {
        "repo_20_factory": repo_out_20_factory,
        "repo_40_factory": repo_out_40_factory,
        "repo_20_by_road_rail": repo_out_20_by_road_rail,
        "repo_40_by_road_rail": repo_out_40_by_road_rail,
        "repo_20_fs_return": repo_out_20_fs_return,
        "repo_40_fs_return": repo_out_40_fs_return,
        "repo_20_by_cfs_icd": repo_out_20_cfs_icd,
        "repo_40_by_cfs_icd": repo_out_40_cfs_icd,
        "repo_20_port_vessel": repo_out_20_port_vessel,
        "repo_40_port_vessel": repo_out_40_port_vessel,
    }


def repo_movement(requirement, location, site, movement, from_date, to_date, line):
    required_date = get_required_date_list(requirement=requirement)
    params = {
        "container__location": location,
        "container__site": site,
        "container__client__ref_code__isnull": False,
    }
    if line:
        params["container__client__ref_code"] = line

    if from_date and to_date:
        from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
        time_obj = datetime.datetime.now().time()
        from_date_time = datetime.datetime.combine(from_date_obj, time_obj)
        to_date_time = datetime.datetime.combine(to_date_obj, time_obj)
        params["date__range"] = (
            from_date_time,
            to_date_time,
        )

        is_required_date = False
    else:
        params["date__range"] = (
            required_date["from_date_time"],
            required_date["to_date_time"],
        )
        is_required_date = True

    if movement == "Arrived":

        repo_in = GateInHistory.objects.select_related("gate_in").filter(
            gate_in__arrived__isnull=False, **params
        )
        arrived_data = get_arrived_data(repo_in)
        data = {
            "volume_data": arrived_data,
            "from_date": (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
        }
    elif movement == "Departed":
        repo_out = GateOutHistory.objects.select_related("gate_out").filter(
            gate_out__departed__isnull=False, **params
        )

        departed_data = get_departed_data(repo_out)
        # all_data = {**arrived_data, **departed_data}

        data = {
            "volume_data": departed_data,
            "from_date": (
                required_date["from_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
            "to_date": (
                required_date["to_date_time"].strftime("%d/%m/%Y")
                if is_required_date
                else from_date_obj.strftime("%d/%m/%Y")
            ),
        }
    return data


def get_approval_volumes_20_40(approval_params, selc_rel, values, size_params):

    return list(
        Approval.objects.select_related(selc_rel)
        .filter(
            **approval_params,
            **size_params,
        )
        .exclude(
            parent__current_amount=F("parent__original_amount"),
            denial_reason="REJECTED",
        )
        .values(values)
        .annotate(volume=Count(values))
        .order_by("-volume")
    )[:5]


def get_approval_revenue_20_40(approval_params, selc_rel, values, size_params):
    return list(
        Approval.objects.select_related(selc_rel)
        .filter(
            **approval_params,
            **size_params,
        )
        .exclude(
            parent__current_amount=F("parent__original_amount"),
            denial_reason="REJECTED",
        )
        .values(values)
        .annotate(
            revenue=Coalesce(
                Sum("parent__current_amount", output_field=FloatField()),
                0,
                output_field=FloatField(),
            )
        )
        .order_by(values)
    )[:5]


def top_client_partially_approved(
    requirement, location, site, site_obj, from_date, to_date, line
):
    required_date = get_required_date_list(requirement=requirement)
    params = {
        "parent__location__name": location,
        "parent__site__name": site,
    }
    if line:
        params["parent__client__ref_code"] = line

    if from_date and to_date:
        from_date_obj = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
        to_date_obj = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
        params["parent__invoice_date__range"] = (
            from_date_obj,
            to_date_obj,
        )

        is_required_date = False
    else:
        params["parent__invoice_date__range"] = (
            required_date["from_date_time"].date(),
            required_date["to_date_time"].date(),
        )
        is_required_date = True

    mnr_invoice_line = MNRInvoiceLine.objects.filter(**params).values("bill_ids")
    bill_ids = [ast.literal_eval(each["bill_ids"]) for each in mnr_invoice_line]
    # converts nested lists into flat list
    bill_ids = sum(bill_ids, [])

    survey_ids = CustomerBill.objects.filter(pk__in=bill_ids).values_list(
        "survey_id", flat=True
    )

    approval_params = {"parent__parent__pk__in": survey_ids}
    if line:
        if site_obj.type == "DEPOT":
            approval_params["parent__parent__depot__container__client__ref_code"] = line
            approval_params[
                "parent__parent__depot__container__client__ref_code__isnull"
            ] = False
        else:
            approval_params[
                "parent__parent__non_depot__container__client__ref_code"
            ] = line
            approval_params[
                "parent__parent__non_depot__container__client__ref_code__isnull"
            ] = False

    if site_obj.type == "DEPOT":
        values = "parent__parent__depot__container__client__ref_code"
        selc_rel = "parent__parent__depot__container__client"

        approval_total_volume = (
            Approval.objects.select_related(selc_rel)
            .filter(**approval_params)
            .exclude(
                parent__current_amount=F("parent__original_amount"),
                denial_reason="REJECTED",
            )
            .values(values)
            .aggregate(volume=Count(values))
        )["volume"]
        approval_20_volume = get_approval_volumes_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__depot__container__size__name": "20"},
        )
        approval_40_volume = get_approval_volumes_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__depot__container__size__name": "40"},
        )

        approval_total_revenue = (
            Approval.objects.select_related(selc_rel)
            .filter(
                **approval_params,
            )
            .exclude(
                parent__current_amount=F("parent__original_amount"),
                denial_reason="REJECTED",
            )
            .values(values)
            .aggregate(
                revenue=Coalesce(
                    Sum("parent__current_amount", output_field=FloatField()),
                    0,
                    output_field=FloatField(),
                )
            )
        )["revenue"]

        approval_20_revenue = get_approval_revenue_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__depot__container__size__name": "20"},
        )

        approval_40_revenue = get_approval_revenue_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__depot__container__size__name": "40"},
        )

    else:
        values = "parent__parent__non_depot__container__client__ref_code"
        selc_rel = "parent__parent__non_depot__container__client"

        approval_total_volume = (
            Approval.objects.select_related(selc_rel)
            .filter(**approval_params)
            .exclude(
                parent__current_amount=F("parent__original_amount"),
                denial_reason="REJECTED",
            )
            .values(values)
            .aggregate(volume=Count(values))
        )["volume"]
        approval_20_volume = get_approval_volumes_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__non_depot__container__size__name": "20"},
        )
        approval_40_volume = get_approval_volumes_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__non_depot__container__size__name": "40"},
        )

        approval_total_revenue = (
            Approval.objects.filter(
                **approval_params,
            )
            .select_related(selc_rel)
            .exclude(
                parent__current_amount=F("parent__original_amount"),
                denial_reason="REJECTED",
            )
            .values(values)
            .aggregate(
                revenue=Coalesce(
                    Sum("parent__current_amount", output_field=FloatField()),
                    0,
                    output_field=FloatField(),
                )
            )["revenue"]
        )

        approval_20_revenue = get_approval_revenue_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__non_depot__container__size__name": "20"},
        )

        approval_40_revenue = get_approval_revenue_20_40(
            approval_params,
            selc_rel,
            values,
            {"parent__parent__non_depot__container__size__name": "40"},
        )

    data = {
        "approval_total_volume": approval_total_volume,
        "approval_total_revenue": approval_total_revenue,
        "volume_data": {
            "approval_20_volume": approval_20_volume,
            "approval_40_volume": approval_40_volume,
        },
        "revenue_data": {
            "approval_20_revenue": approval_20_revenue,
            "approval_40_revenue": approval_40_revenue,
        },
        "from_date": (
            required_date["from_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else from_date_obj.strftime("%d/%m/%Y")
        ),
        "to_date": (
            required_date["to_date_time"].strftime("%d/%m/%Y")
            if is_required_date
            else to_date_obj.strftime("%d/%m/%Y")
        ),
    }

    if data["volume_data"]["approval_20_volume"]:
        for each in data["volume_data"]["approval_20_volume"]:
            change_key(each, values, "volume")
    if data["volume_data"]["approval_40_volume"]:
        for each in data["volume_data"]["approval_40_volume"]:
            change_key(each, values, "volume")
    if data["revenue_data"]["approval_20_revenue"]:
        for each in data["revenue_data"]["approval_20_revenue"]:
            change_key(each, values, "revenue")
    if data["revenue_data"]["approval_40_revenue"]:
        for each in data["revenue_data"]["approval_40_revenue"]:
            change_key(each, values, "revenue")

    return data
