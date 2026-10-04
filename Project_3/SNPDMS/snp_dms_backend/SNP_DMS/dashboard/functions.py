import datetime, time, calendar
from depot.models import GateInHistory, GateOutHistory, ContainerStock
from master.models import Location, Site
from master.models_two import Client
import operator
from django.utils import timezone
import traceback, logging
from django.db.models import Sum
from django.db.models.functions import Coalesce


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

        week = int(week_num) - 1
        startdate = datetime.datetime.strptime(f"{year} {week} 0", "%Y %W %w")
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


def collect_in_out_data(location, site, requirement):
    dates = get_required_date_list(requirement=requirement)
    inward_data = GateInHistory.objects.select_related(
        "container",
        "container__client",
        "container__type",
        "container__size",
        "container__location",
        "container__site",
        "gate_in",
        "lolo",
        "st",
    ).filter(
        container__location__name=location,
        container__site__name=site,
        date__range=(dates["from_date_time"], dates["to_date_time"]),
    )
    outward_data = GateOutHistory.objects.select_related(
        "container",
        "container__client",
        "container__type",
        "container__size",
        "container__location",
        "container__site",
        "gate_out",
        "lolo",
        "st",
    ).filter(
        container__location__name=location,
        container__site__name=site,
        date__range=(dates["from_date_time"], dates["to_date_time"]),
    )
    return inward_data, outward_data


def movement_summary(inward_data, outward_data, edi_summary):
    try:
        if edi_summary is True:
            inward_data = inward_data.filter(is_email_sent=True)
            outward_data = outward_data.filter(is_email_sent=True)

        # inward
        inward_data_count = inward_data.count()

        # Line inward
        inward_line_data = inward_data.filter(lolo__apply_charges="Line")
        inward_line_data_count = inward_line_data.count()
        inward_line_data_20_count = inward_line_data.filter(
            container__size__name="20"
        ).count()
        inward_line_data_40_count = inward_line_data.filter(
            container__size__name="40"
        ).count()

        # Party inward
        inward_party_data = inward_data.filter(lolo__apply_charges="Party")
        inward_party_data_count = inward_party_data.count()
        inward_party_data_20_count = inward_party_data.filter(
            container__size__name="20"
        ).count()
        inward_party_data_40_count = inward_party_data.filter(
            container__size__name="40"
        ).count()

        # outward
        outward_data_count = outward_data.count()

        # Line outward
        outward_line_data = outward_data.filter(lolo__apply_charges="Line")
        outward_line_data_count = outward_line_data.count()
        outward_line_data_20_count = outward_line_data.filter(
            container__size__name="20"
        ).count()
        outward_line_data_40_count = outward_line_data.filter(
            container__size__name="40"
        ).count()

        # Party outward
        outward_party_data = outward_data.filter(lolo__apply_charges="Party")
        outward_party_data_count = outward_party_data.count()
        outward_party_data_20_count = outward_party_data.filter(
            container__size__name="20"
        ).count()
        outward_party_data_40_count = outward_party_data.filter(
            container__size__name="40"
        ).count()

        data = {
            "inward": {
                "count": str(inward_data_count),
                "line": {
                    "count": str(inward_line_data_count),
                    "20": str(inward_line_data_20_count),
                    "40": str(inward_line_data_40_count),
                },
                "party": {
                    "count": str(inward_party_data_count),
                    "20": str(inward_party_data_20_count),
                    "40": str(inward_party_data_40_count),
                },
            },
            "outward": {
                "count": str(outward_data_count),
                "line": {
                    "count": str(outward_line_data_count),
                    "20": str(outward_line_data_20_count),
                    "40": str(outward_line_data_40_count),
                },
                "party": {
                    "count": str(outward_party_data_count),
                    "20": str(outward_party_data_20_count),
                    "40": str(outward_party_data_40_count),
                },
            },
        }
        return data
    except:
        data = {
            "inward": {
                "count": "0",
                "line": {"count": "0", "20": "0", "40": "0"},
                "party": {"count": "0", "20": "0", "40": "0"},
            },
            "outward": {
                "count": "0",
                "line": {"count": "0", "20": "0", "40": "0"},
                "party": {"count": "0", "20": "0", "40": "0"},
            },
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return data


def inventory(location, site, requirement):
    try:
        stock_raw_data = ContainerStock.objects.select_related(
            "container",
            "container__size",
            "container__location",
            "container__site",
        ).filter(container__location__name=location, container__site__name=site)
        dates = get_required_date_list(requirement=requirement)

        # Available
        available_stock_data = stock_raw_data.filter(
            available_date__gte=dates["from_date_time"].date(),
            available_date__lte=dates["to_date_time"].date(),
        )
        available_stock_data_count = available_stock_data.count()

        available_20_data_count = available_stock_data.filter(
            container__size__name="20"
        ).count()

        available_40_data_count = available_stock_data.filter(
            container__size__name="40"
        ).count()

        available_other_data_count = (
            available_20_data_count + available_40_data_count
        ) - available_stock_data_count

        available_20_data_percent = (
            available_20_data_count * 100 / available_stock_data_count
        )
        available_40_data_percent = (
            available_40_data_count * 100 / available_stock_data_count
        )
        available_other_data_percent = (
            available_other_data_count * 100 / available_stock_data_count
        )

        # Allotment
        allotment_stock_data = stock_raw_data.filter(
            allotment_date__gte=dates["from_date_time"].date(),
            allotment_date__lte=dates["to_date_time"].date(),
        )
        allotment_stock_data_count = allotment_stock_data.count()

        allotment_20_data_count = allotment_stock_data.filter(
            container__size__name="20"
        ).count()

        allotment_40_data_count = allotment_stock_data.filter(
            container__size__name="40"
        ).count()

        allotment_other_data_count = (
            allotment_20_data_count + allotment_40_data_count
        ) - allotment_stock_data_count

        allotment_20_data_percent = (
            allotment_20_data_count * 100 / allotment_stock_data_count
        )
        allotment_40_data_percent = (
            allotment_40_data_count * 100 / allotment_stock_data_count
        )
        allotment_other_data_percent = (
            allotment_other_data_count * 100 / allotment_stock_data_count
        )

        data = {
            "available": {
                "count": str(available_stock_data_count),
                "20_total_count": str(available_20_data_count),
                "20_total_percent": str(round(float(available_20_data_percent), 2))
                + "%",
                "40_total_count": str(available_40_data_count),
                "40_total_percent": str(round(float(available_40_data_percent), 2))
                + "%",
                "other_total_count": str(available_other_data_count),
                "other_total_percent": str(
                    round(float(available_other_data_percent), 2)
                )
                + "%",
            },
            "allotment": {
                "count": str(allotment_stock_data_count),
                "20_total_count": str(allotment_20_data_count),
                "20_total_percent": str(round(float(allotment_20_data_percent), 2))
                + "%",
                "40_total_count": str(allotment_40_data_count),
                "40_total_percent": str(round(float(allotment_40_data_percent), 2))
                + "%",
                "other_total_count": str(allotment_other_data_count),
                "other_total_percent": str(
                    round(float(allotment_other_data_percent), 2)
                )
                + "%",
            },
        }

        return data
    except:
        data = {
            "available": {
                "count": str(0),
                "20_total_count": str(0),
                "20_total_percent": str(0) + "%",
                "40_total_count": str(0),
                "40_total_percent": str(0) + "%",
                "other_total_count": str(0),
                "other_total_percent": str(0) + "%",
            },
            "allotment": {
                "count": str(0),
                "20_total_count": str(0),
                "20_total_percent": str(0) + "%",
                "40_total_count": str(0),
                "40_total_percent": str(0) + "%",
                "other_total_count": str(0),
                "other_total_percent": str(0) + "%",
            },
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return data


def volume_revenue(process, location, site, year, week_num):
    try:
        week_dates = get_week_dates(year_str=year, week_num=week_num)
        monday = week_dates["Monday"]
        tuesday = week_dates["Tuesday"]
        wednesday = week_dates["Wednesday"]
        thursday = week_dates["Thursday"]
        friday = week_dates["Friday"]
        saturday = week_dates["Saturday"]
        sunday = week_dates["Sunday"]
        label = week_dates.keys()
        volume_data = []
        revenue_data = []

        if process == "IN":
            raw_data = GateInHistory.objects.select_related(
                "container",
                "container__size",
                "container__location",
                "container__site",
                "lolo",
                "st",
            ).filter(
                container__location__name=location,
                container__site__name=site,
                date__range=(monday["from_date_time"], sunday["to_date_time"]),
            )
        else:
            raw_data = GateOutHistory.objects.select_related(
                "container",
                "container__size",
                "container__location",
                "container__site",
                "lolo",
                "st",
            ).filter(
                container__location__name=location,
                container__site__name=site,
                date__range=(monday["from_date_time"], sunday["to_date_time"]),
            )

        # Monday
        monday_data = raw_data.filter(
            date__range=(monday["from_date_time"], monday["to_date_time"])
        )
        monday_20_data = monday_data.filter(container__size__name="20")
        monday_40_data = monday_data.filter(container__size__name="40")
        # Volume
        monday_data_count = monday_data.count()
        monday_20_data_count = monday_20_data.count()
        monday_40_data_count = monday_40_data.count()
        monday_other_data_count = monday_data_count - (
            monday_20_data_count + monday_40_data_count
        )
        # Revenue
        lolo_monday_data_revenue = monday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_monday_data_revenue = monday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_monday_20_data_revenue = monday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_monday_20_data_revenue = monday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_monday_40_data_revenue = monday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_monday_40_data_revenue = monday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        monday_data_revenue = round(
            float(lolo_monday_data_revenue) + float(st_monday_data_revenue), 2
        )
        monday_20_data_revenue = round(
            float(lolo_monday_20_data_revenue) + float(st_monday_20_data_revenue), 2
        )
        monday_40_data_revenue = round(
            float(lolo_monday_40_data_revenue) + float(st_monday_40_data_revenue), 2
        )
        monday_other_data_revenue_raw = monday_data_revenue - (
            monday_20_data_revenue + monday_40_data_revenue
        )
        monday_other_data_revenue = round(monday_other_data_revenue_raw, 2)

        # Tuesday
        tuesday_data = raw_data.filter(
            date__range=(tuesday["from_date_time"], tuesday["to_date_time"])
        )
        tuesday_20_data = tuesday_data.filter(container__size__name="20")
        tuesday_40_data = tuesday_data.filter(container__size__name="40")
        # Volume
        tuesday_data_count = tuesday_data.count()
        tuesday_20_data_count = tuesday_20_data.count()
        tuesday_40_data_count = tuesday_40_data.count()
        tuesday_other_data_count = tuesday_data_count - (
            tuesday_20_data_count + tuesday_40_data_count
        )
        # Revenue
        lolo_tuesday_data_revenue = tuesday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_tuesday_data_revenue = tuesday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_tuesday_20_data_revenue = tuesday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_tuesday_20_data_revenue = tuesday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_tuesday_40_data_revenue = tuesday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_tuesday_40_data_revenue = tuesday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        tuesday_data_revenue = round(
            float(lolo_tuesday_data_revenue) + float(st_tuesday_data_revenue), 2
        )
        tuesday_20_data_revenue = round(
            float(lolo_tuesday_20_data_revenue) + float(st_tuesday_20_data_revenue), 2
        )
        tuesday_40_data_revenue = round(
            float(lolo_tuesday_40_data_revenue) + float(st_tuesday_40_data_revenue), 2
        )
        tuesday_other_data_revenue_raw = tuesday_data_revenue - (
            tuesday_20_data_revenue + tuesday_40_data_revenue
        )
        tuesday_other_data_revenue = round(tuesday_other_data_revenue_raw, 2)

        # Wednesday
        wednesday_data = raw_data.filter(
            date__range=(wednesday["from_date_time"], wednesday["to_date_time"])
        )
        wednesday_20_data = wednesday_data.filter(container__size__name="20")
        wednesday_40_data = wednesday_data.filter(container__size__name="40")
        # Volume
        wednesday_data_count = wednesday_data.count()
        wednesday_20_data_count = wednesday_20_data.count()
        wednesday_40_data_count = wednesday_40_data.count()
        wednesday_other_data_count = wednesday_data_count - (
            wednesday_20_data_count + wednesday_40_data_count
        )
        # Revenue
        lolo_wednesday_data_revenue = wednesday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_wednesday_data_revenue = wednesday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_wednesday_20_data_revenue = wednesday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_wednesday_20_data_revenue = wednesday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_wednesday_40_data_revenue = wednesday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_wednesday_40_data_revenue = wednesday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        wednesday_data_revenue = round(
            float(lolo_wednesday_data_revenue) + float(st_wednesday_data_revenue), 2
        )
        wednesday_20_data_revenue = round(
            float(lolo_wednesday_20_data_revenue) + float(st_wednesday_20_data_revenue),
            2,
        )
        wednesday_40_data_revenue = round(
            float(lolo_wednesday_40_data_revenue) + float(st_wednesday_40_data_revenue),
            2,
        )
        wednesday_other_data_revenue_raw = wednesday_data_revenue - (
            wednesday_20_data_revenue + wednesday_40_data_revenue
        )
        wednesday_other_data_revenue = round(wednesday_other_data_revenue_raw, 2)

        # Thursday
        thursday_data = raw_data.filter(
            date__range=(thursday["from_date_time"], thursday["to_date_time"])
        )
        thursday_20_data = thursday_data.filter(container__size__name="20")
        thursday_40_data = thursday_data.filter(container__size__name="40")
        # Volume
        thursday_data_count = thursday_data.count()
        thursday_20_data_count = thursday_20_data.count()
        thursday_40_data_count = thursday_40_data.count()
        thursday_other_data_count = thursday_data_count - (
            thursday_20_data_count + thursday_40_data_count
        )
        # Revenue
        lolo_thursday_data_revenue = thursday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_thursday_data_revenue = thursday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_thursday_20_data_revenue = thursday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_thursday_20_data_revenue = thursday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_thursday_40_data_revenue = thursday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_thursday_40_data_revenue = thursday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        thursday_data_revenue = round(
            float(lolo_thursday_data_revenue) + float(st_thursday_data_revenue), 2
        )
        thursday_20_data_revenue = round(
            float(lolo_thursday_20_data_revenue) + float(st_thursday_20_data_revenue), 2
        )
        thursday_40_data_revenue = round(
            float(lolo_thursday_40_data_revenue) + float(st_thursday_40_data_revenue), 2
        )
        thursday_other_data_revenue_raw = thursday_data_revenue - (
            thursday_20_data_revenue + thursday_40_data_revenue
        )
        thursday_other_data_revenue = round(thursday_other_data_revenue_raw, 2)

        # Friday
        friday_data = raw_data.filter(
            date__range=(friday["from_date_time"], friday["to_date_time"])
        )
        friday_20_data = friday_data.filter(container__size__name="20")
        friday_40_data = friday_data.filter(container__size__name="40")
        # Volume
        friday_data_count = friday_data.count()
        friday_20_data_count = friday_20_data.count()
        friday_40_data_count = friday_40_data.count()
        friday_other_data_count = friday_data_count - (
            friday_20_data_count + friday_40_data_count
        )
        # Revenue
        lolo_friday_data_revenue = friday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_friday_data_revenue = friday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_friday_20_data_revenue = friday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_friday_20_data_revenue = friday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_friday_40_data_revenue = friday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_friday_40_data_revenue = friday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        friday_data_revenue = round(
            float(lolo_friday_data_revenue) + float(st_friday_data_revenue), 2
        )
        friday_20_data_revenue = round(
            float(lolo_friday_20_data_revenue) + float(st_friday_20_data_revenue), 2
        )
        friday_40_data_revenue = round(
            float(lolo_friday_40_data_revenue) + float(st_friday_40_data_revenue), 2
        )
        friday_other_data_revenue_raw = friday_data_revenue - (
            friday_20_data_revenue + friday_40_data_revenue
        )
        friday_other_data_revenue = round(friday_other_data_revenue_raw, 2)

        # Saturday
        saturday_data = raw_data.filter(
            date__range=(saturday["from_date_time"], saturday["to_date_time"])
        )
        saturday_20_data = saturday_data.filter(container__size__name="20")
        saturday_40_data = saturday_data.filter(container__size__name="40")
        # Volume
        saturday_data_count = saturday_data.count()
        saturday_20_data_count = saturday_20_data.count()
        saturday_40_data_count = saturday_40_data.count()
        saturday_other_data_count = saturday_data_count - (
            saturday_20_data_count + saturday_40_data_count
        )
        # Revenue
        lolo_saturday_data_revenue = saturday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_saturday_data_revenue = saturday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_saturday_20_data_revenue = saturday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_saturday_20_data_revenue = saturday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_saturday_40_data_revenue = saturday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_saturday_40_data_revenue = saturday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        saturday_data_revenue = round(
            float(lolo_saturday_data_revenue) + float(st_saturday_data_revenue), 2
        )
        saturday_20_data_revenue = round(
            float(lolo_saturday_20_data_revenue) + float(st_saturday_20_data_revenue), 2
        )
        saturday_40_data_revenue = round(
            float(lolo_saturday_40_data_revenue) + float(st_saturday_40_data_revenue), 2
        )
        saturday_other_data_revenue_raw = saturday_data_revenue - (
            saturday_20_data_revenue + saturday_40_data_revenue
        )
        saturday_other_data_revenue = round(saturday_other_data_revenue_raw, 2)

        # Sunday
        sunday_data = raw_data.filter(
            date__range=(sunday["from_date_time"], sunday["to_date_time"])
        )
        sunday_20_data = sunday_data.filter(container__size__name="20")
        sunday_40_data = sunday_data.filter(container__size__name="40")
        # Volume
        sunday_data_count = sunday_data.count()
        sunday_20_data_count = sunday_20_data.count()
        sunday_40_data_count = sunday_40_data.count()
        sunday_other_data_count = sunday_data_count - (
            sunday_20_data_count + sunday_40_data_count
        )
        # Revenue
        lolo_sunday_data_revenue = sunday_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_sunday_data_revenue = sunday_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_sunday_20_data_revenue = sunday_20_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_sunday_20_data_revenue = sunday_20_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        lolo_sunday_40_data_revenue = sunday_40_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_sunday_40_data_revenue = sunday_40_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        # calculate
        sunday_data_revenue = round(
            float(lolo_sunday_data_revenue) + float(st_sunday_data_revenue), 2
        )
        sunday_20_data_revenue = round(
            float(lolo_sunday_20_data_revenue) + float(st_sunday_20_data_revenue), 2
        )
        sunday_40_data_revenue = round(
            float(lolo_sunday_40_data_revenue) + float(st_sunday_40_data_revenue), 2
        )
        sunday_other_data_revenue_raw = sunday_data_revenue - (
            sunday_20_data_revenue + sunday_40_data_revenue
        )
        sunday_other_data_revenue = round(sunday_other_data_revenue_raw, 2)

        volume_data = [
            {
                "name": "per_day_count",
                "data": [
                    str(monday_data_count),
                    str(tuesday_data_count),
                    str(wednesday_data_count),
                    str(thursday_data_count),
                    str(friday_data_count),
                    str(saturday_data_count),
                    str(sunday_data_count),
                ],
            },
            {
                "name": "20",
                "data": [
                    str(monday_20_data_count),
                    str(tuesday_20_data_count),
                    str(wednesday_20_data_count),
                    str(thursday_20_data_count),
                    str(friday_20_data_count),
                    str(saturday_20_data_count),
                    str(sunday_20_data_count),
                ],
            },
            {
                "name": "40",
                "data": [
                    str(monday_40_data_count),
                    str(tuesday_40_data_count),
                    str(wednesday_40_data_count),
                    str(thursday_40_data_count),
                    str(friday_40_data_count),
                    str(saturday_40_data_count),
                    str(sunday_40_data_count),
                ],
            },
            {
                "name": "other",
                "data": [
                    str(monday_other_data_count),
                    str(tuesday_other_data_count),
                    str(wednesday_other_data_count),
                    str(thursday_other_data_count),
                    str(friday_other_data_count),
                    str(saturday_other_data_count),
                    str(sunday_other_data_count),
                ],
            },
        ]

        revenue_data = [
            {
                "name": "per_day_revenue",
                "data": [
                    str(monday_data_revenue),
                    str(tuesday_data_revenue),
                    str(wednesday_data_revenue),
                    str(thursday_data_revenue),
                    str(friday_data_revenue),
                    str(saturday_data_revenue),
                    str(sunday_data_revenue),
                ],
            },
            {
                "name": "20",
                "data": [
                    str(monday_20_data_revenue),
                    str(tuesday_20_data_revenue),
                    str(wednesday_20_data_revenue),
                    str(thursday_20_data_revenue),
                    str(friday_20_data_revenue),
                    str(saturday_20_data_revenue),
                    str(sunday_20_data_revenue),
                ],
            },
            {
                "name": "40",
                "data": [
                    str(monday_40_data_revenue),
                    str(tuesday_40_data_revenue),
                    str(wednesday_40_data_revenue),
                    str(thursday_40_data_revenue),
                    str(friday_40_data_revenue),
                    str(saturday_40_data_revenue),
                    str(sunday_40_data_revenue),
                ],
            },
            {
                "name": "other",
                "data": [
                    str(monday_other_data_revenue),
                    str(tuesday_other_data_revenue),
                    str(wednesday_other_data_revenue),
                    str(thursday_other_data_revenue),
                    str(friday_other_data_revenue),
                    str(saturday_other_data_revenue),
                    str(sunday_other_data_revenue),
                ],
            },
        ]
        data = {"label": label, "volume": volume_data, "revenue": revenue_data}
        return data
    except:
        volume_data = [
            {
                "name": "per_day_count",
                "data": [str(0), str(0), str(0), str(0), str(0), str(0), str(0)],
            },
            {
                "name": "20",
                "data": [str(0), str(0), str(0), str(0), str(0), str(0), str(0)],
            },
            {
                "name": "40",
                "data": [str(0), str(0), str(0), str(0), str(0), str(0), str(0)],
            },
            {
                "name": "other",
                "data": [str(0), str(0), str(0), str(0), str(0), str(0), str(0)],
            },
        ]

        revenue_data = [
            {
                "name": "per_day_revenue",
                "data": [
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                ],
            },
            {
                "name": "20",
                "data": [
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                ],
            },
            {
                "name": "40",
                "data": [
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                ],
            },
            {
                "name": "other",
                "data": [
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                    str(float(0)),
                ],
            },
        ]
        label = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]
        data = {"label": label, "volume": volume_data, "revenue": revenue_data}
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return data


def revenue(inward_data, outward_data):
    try:
        lolo_inward_data_revenue = inward_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        lolo_outward_data_revenue = outward_data.aggregate(
            lolo_revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
        )["lolo_revenue"]
        st_inward_data_revenue = inward_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        st_outward_data_revenue = outward_data.aggregate(
            st_revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
        )["st_revenue"]
        st_revenue = round(
            float(st_inward_data_revenue) + float(st_outward_data_revenue), 2
        )
        revenue_data = {
            "handling_in": str(lolo_inward_data_revenue),
            "handling_out": str(lolo_outward_data_revenue),
            "transportation": str(st_revenue),
        }
        return revenue_data
    except:
        revenue_data = {
            "handling_in": str(float(0)),
            "handling_out": str(float(0)),
            "transportation": str(float(0)),
        }
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return revenue_data


# Get Inward data according to client
def get_inward_revenue(inward_data, client):
    client_inward_data = inward_data.filter(container__client__name=client)
    if not client_inward_data.exists():
        return float(0)
    else:
        inward_aggregates = client_inward_data.aggregate(
            client_lolo_in_amount=Coalesce(Sum("lolo__gross_amount", default=0), 0),
            client_st_in_amount=Coalesce(Sum("st__gross_amount", default=0), 0),
        )
        client_lolo_in_amount_total = inward_aggregates["client_lolo_in_amount"]
        client_st_in_amount_total = inward_aggregates["client_st_in_amount"]
        return client_lolo_in_amount_total + client_st_in_amount_total


# Get Outward data according to client
def get_outward_revenue(outward_data, client):
    client_outward_data = outward_data.filter(container__client__name=client)
    if not client_outward_data.exists():
        return float(0)
    else:
        outward_aggregates = client_outward_data.aggregate(
            client_lolo_out_amount=Coalesce(Sum("lolo__gross_amount", default=0), 0),
            client_st_out_amount=Coalesce(Sum("st__gross_amount", default=0), 0),
        )
        client_lolo_out_amount_total = outward_aggregates["client_lolo_out_amount"]
        client_st_out_amount_total = outward_aggregates["client_st_out_amount"]
        return client_lolo_out_amount_total + client_st_out_amount_total


def client_sorter(client_revenue_data):
    try:
        total_overall_revenue = float(sum(list(client_revenue_data.values())))
        sorted_client_revenue_data = dict(
            sorted(
                client_revenue_data.items(), key=operator.itemgetter(1), reverse=True
            )
        )
        if len(sorted_client_revenue_data) >= 5:
            main_data = {
                k: sorted_client_revenue_data[k]
                for k in list(sorted_client_revenue_data)[:5]
            }
        else:
            main_data = sorted_client_revenue_data

        new_main_data = {}
        client_label = []
        client_revenue_data_list = []
        client_percent_data_list = []

        for each, revenue in main_data.items():
            total_revenue = str(revenue)
            new_main_data[each] = {}
            if total_overall_revenue == float(0):
                percent = "0%"
            else:
                percent = (
                    str(round(float(revenue * 100 / total_overall_revenue), 2)) + "%"
                )
            new_main_data[each] = {
                "total_revenue": total_revenue,
                "percent": percent,
            }
            client_label.append(each)
            client_revenue_data_list.append(total_revenue)
            client_percent_data_list.append(percent)

        top_client_revenue = sum(main_data.values())
        others_revenue = total_overall_revenue - top_client_revenue
        new_main_data["others"] = {
            "total_revenue": str(others_revenue),
            "percent": str(
                round(float(others_revenue * 100 / total_overall_revenue), 2)
            )
            + "%"
            if total_overall_revenue != float(0)
            else "0%",
        }

        response_data = {
            "label": client_label,
            "total_revenue": client_revenue_data_list,
            "percent": client_percent_data_list,
        }
        return response_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {"label": [], "total_revenue": [], "percent": []}


def top_client(inward_data, outward_data, data_type):
    try:
        client_revenue_data = {}
        total_overall_revenue = []
        inward_data_clients = []
        outward_data_clients = []
        if not inward_data is None and not inward_data.count() == 0:
            inward_data_clients = inward_data.values_list(
                "container__client__name", flat=True
            )
        if not outward_data is None and not outward_data.count() == 0:
            outward_data_clients = outward_data.values_list(
                "container__client__name", flat=True
            )
        clients = list(inward_data_clients) + list(outward_data_clients)
        for client in clients:
            if data_type == "inward_top_client":
                inward_revenue = get_inward_revenue(inward_data, client)
                total_revenue = float(inward_revenue)
            elif data_type == "outward_top_client":
                outward_revenue = get_outward_revenue(outward_data, client)
                total_revenue = float(outward_revenue)
            elif data_type == "top_client":
                inward_revenue = get_inward_revenue(inward_data, client)
                outward_revenue = get_outward_revenue(outward_data, client)
                total_revenue = float(inward_revenue) + float(outward_revenue)
            client_revenue_data[f"{client}"] = total_revenue
            total_overall_revenue.append(total_revenue)

        response_data = client_sorter(client_revenue_data)
        return response_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {"label": [], "total_revenue": [], "percent": []}


def lolo_st_inward_revenue(inward_data, client, data_type):
    client_inward_data = inward_data.filter(container__client__name=client)
    if not client_inward_data.exists():
        return float(0)
    else:
        if data_type == "inward_handling_top_client":
            inward_aggregates = client_inward_data.aggregate(
                client_lolo_in_amount=Coalesce(Sum("lolo__gross_amount", default=0), 0),
            )
            return inward_aggregates["client_lolo_in_amount"]
        elif data_type == "transportation_top_client":
            inward_aggregates = client_inward_data.aggregate(
                client_st_in_amount=Coalesce(Sum("st__gross_amount", default=0), 0),
            )
            return inward_aggregates["client_st_in_amount"]


# Get Outward data according to client
def lolo_st_outward_revenue(outward_data, client, data_type):
    client_outward_data = outward_data.filter(container__client__name=client)
    if not client_outward_data.exists():
        return float(0)
    else:
        if data_type == "outward_handling_top_client":
            outward_aggregates = client_outward_data.aggregate(
                client_lolo_out_amount=Coalesce(
                    Sum("lolo__gross_amount", default=0), 0
                ),
            )
            return outward_aggregates["client_lolo_out_amount"]
        elif data_type == "transportation_top_client":
            outward_aggregates = client_outward_data.aggregate(
                client_st_out_amount=Coalesce(Sum("st__gross_amount", default=0), 0),
            )
            return outward_aggregates["client_st_out_amount"]


def lolo_st_in_out_top_client(inward_data, outward_data, data_type):
    try:
        client_revenue_data = {}
        total_overall_revenue = []
        inward_data_clients = []
        outward_data_clients = []
        if not inward_data is None and not inward_data.count() == 0:
            inward_data_clients = inward_data.values_list(
                "container__client__name", flat=True
            )
        if not outward_data is None and not outward_data.count() == 0:
            outward_data_clients = outward_data.values_list(
                "container__client__name", flat=True
            )
        clients = list(inward_data_clients) + list(outward_data_clients)
        for client in clients:
            if data_type == "inward_handling_top_client":
                inward_revenue = lolo_st_inward_revenue(inward_data, client, data_type)
                total_revenue = float(inward_revenue)
            elif data_type == "outward_handling_top_client":
                outward_revenue = lolo_st_outward_revenue(
                    outward_data, client, data_type
                )
                total_revenue = float(outward_revenue)
            elif data_type == "transportation_top_client":
                inward_revenue = lolo_st_inward_revenue(inward_data, client, data_type)
                outward_revenue = lolo_st_outward_revenue(
                    outward_data, client, data_type
                )
                total_revenue = float(inward_revenue) + float(outward_revenue)
            client_revenue_data[f"{client}"] = total_revenue
            total_overall_revenue.append(total_revenue)

        response_data = client_sorter(client_revenue_data)
        return response_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return {"label": [], "total_revenue": [], "percent": []}
