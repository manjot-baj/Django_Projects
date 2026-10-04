# model imports
from depot.models import GateInHistory, GateOutHistory
from master.models import Location
from depot.models import ContainerStock, ContainerType
from non_depot.models import NonDepotContainerStock
from mnr.models import Approval, Survey, SurveyLine

# other imports
from django.utils import timezone
import datetime, traceback, logging
from django.db.models import Sum, Value, Q
from django.db.models.functions import Coalesce


def lolo_st_top_client(
    movement,
    process,
    requirement,
    location,
    site,
):
    try:
        required_date = get_required_date_list(requirement=requirement)
        history_model = GateInHistory if movement == "IN" else GateOutHistory
        main_data = {}
        if movement == "IN":
            exclude_params = {"lolo": None, "consignee__is_null": False}
        else:
            exclude_params = {"lolo": None, "shipper__is_null": False}
        lolo_query_data = None
        st_query_data = None
        if process == "lolo":
            lolo_query_data = (
                history_model.objects
                .select_related(
                    "container",
                    "container__location",
                    "container__site",
                    "container__client",
                    "container__size",
                    "lolo",
                    "lolo__customer_name",
                )
                .exclude(**exclude_params)
                .filter(
                    container__location=location,
                    container__site=site,
                    date__range=(
                        required_date["from_date_time"],
                        required_date["to_date_time"],
                    ),
                )
            )
            total_lolo_volume = lolo_query_data.count()
            total_lolo_revenue = lolo_query_data.aggregate(
                revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
            )["revenue"]

            # line
            line_lolo_query_data = lolo_query_data.filter(lolo__apply_charges="Line")
            # 20
            line_20_lolo_query_data = line_lolo_query_data.filter(
                container__size__name="20"
            )
            line_20_lolo_clients_raw = line_20_lolo_query_data.values_list(
                "container__client__name", flat=True
            )
            line_20_lolo_clients = list(set(list(line_20_lolo_clients_raw)))
            # 40
            line_40_lolo_query_data = line_lolo_query_data.filter(
                container__size__name="40"
            )
            line_40_lolo_clients_raw = line_40_lolo_query_data.values_list(
                "container__client__name", flat=True
            )
            line_40_lolo_clients = list(set(list(line_40_lolo_clients_raw)))

            # party
            party_lolo_query_data = lolo_query_data.filter(
                lolo__apply_charges="Party"
            ).exclude(lolo__customer_name=None)
            # 20
            party_20_lolo_query_data = party_lolo_query_data.filter(
                container__size__name="20"
            )
            party_20_lolo_clients_raw = party_20_lolo_query_data.values_list(
                "lolo__customer_name__name", flat=True
            )
            party_20_lolo_clients = list(set(list(party_20_lolo_clients_raw)))
            # 40
            party_40_lolo_query_data = party_lolo_query_data.filter(
                container__size__name="40"
            )
            party_40_lolo_clients_raw = party_40_lolo_query_data.values_list(
                "lolo__customer_name__name", flat=True
            )
            party_40_lolo_clients = list(set(list(party_40_lolo_clients_raw)))

            # Volume
            # Line
            line_20_volume_client_list = [
                {
                    "name": client,
                    "value": line_20_lolo_query_data.filter(
                        container__client__name=client
                    ).count(),
                }
                for client in line_20_lolo_clients
            ]
            line_40_volume_client_list = [
                {
                    "name": client,
                    "value": line_40_lolo_query_data.filter(
                        container__client__name=client
                    ).count(),
                }
                for client in line_40_lolo_clients
            ]

            # Party
            party_20_volume_client_list = [
                {
                    "name": client,
                    "value": party_20_lolo_query_data.filter(
                        lolo__customer_name__name=client
                    ).count(),
                }
                for client in party_20_lolo_clients
            ]
            party_40_volume_client_list = [
                {
                    "name": client,
                    "value": party_40_lolo_query_data.filter(
                        lolo__customer_name__name=client
                    ).count(),
                }
                for client in party_40_lolo_clients
            ]

            # Revenue
            # Line
            line_20_revenue_client_list = [
                {
                    "name": client,
                    "value": line_20_lolo_query_data.filter(
                        container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in line_20_lolo_clients
            ]
            line_40_revenue_client_list = [
                {
                    "name": client,
                    "value": line_40_lolo_query_data.filter(
                        container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in line_40_lolo_clients
            ]
            # Party
            party_20_revenue_client_list = [
                {
                    "name": client,
                    "value": party_20_lolo_query_data.filter(
                        lolo__customer_name__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in party_20_lolo_clients
            ]
            party_40_revenue_client_list = [
                {
                    "name": client,
                    "value": party_40_lolo_query_data.filter(
                        lolo__customer_name__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("lolo__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in party_40_lolo_clients
            ]

            (
                top_5_clients_dict_by_revenue,
                top_5_clients_dict_by_volume,
            ) = get_lolo_st_sorted_data(
                line_20_revenue_client_list=line_20_revenue_client_list,
                line_40_revenue_client_list=line_40_revenue_client_list,
                party_20_revenue_client_list=party_20_revenue_client_list,
                party_40_revenue_client_list=party_40_revenue_client_list,
                line_20_volume_client_list=line_20_volume_client_list,
                line_40_volume_client_list=line_40_volume_client_list,
                party_20_volume_client_list=party_20_volume_client_list,
                party_40_volume_client_list=party_40_volume_client_list,
            )
            main_data["total_revenue"] = total_lolo_revenue
            main_data["total_volume"] = total_lolo_volume
            main_data["volume_data"] = top_5_clients_dict_by_volume
            main_data["revenue_data"] = top_5_clients_dict_by_revenue
            main_data["from_date"] = required_date["from_date_time"].strftime(
                "%d/%m/%Y"
            )
            main_data["to_date"] = required_date["to_date_time"].strftime("%d/%m/%Y")
        else:
            st_query_data = (
                history_model.objects
                .select_related(
                    "container",
                    "container__location",
                    "container__site",
                    "container__client",
                    "container__size",
                    "st",
                    "st__customer_name",
                )
                .exclude(st=None)
                .filter(
                    container__location=location,
                    container__site=site,
                    date__range=(
                        required_date["from_date_time"],
                        required_date["to_date_time"],
                    ),
                )
            )
            total_st_volume = st_query_data.count()
            total_st_revenue = st_query_data.aggregate(
                revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
            )["revenue"]

            # line
            line_st_query_data = st_query_data.filter(st__apply_charges="Line")
            # 20
            line_20_st_query_data = line_st_query_data.filter(
                container__size__name="20"
            )
            line_20_st_clients_raw = line_20_st_query_data.values_list(
                "container__client__name", flat=True
            )
            line_20_st_clients = list(set(list(line_20_st_clients_raw)))
            # 40
            line_40_st_query_data = line_st_query_data.filter(
                container__size__name="40"
            )
            line_40_st_clients_raw = line_40_st_query_data.values_list(
                "container__client__name", flat=True
            )
            line_40_st_clients = list(set(list(line_40_st_clients_raw)))

            # party
            party_st_query_data = st_query_data.filter(
                st__apply_charges="Party"
            ).exclude(st__customer_name=None)
            # 20
            party_20_st_query_data = party_st_query_data.filter(
                container__size__name="20"
            )
            party_20_st_clients_raw = party_20_st_query_data.values_list(
                "st__customer_name__name", flat=True
            )
            party_20_st_clients = list(set(list(party_20_st_clients_raw)))
            # 40
            party_40_st_query_data = party_st_query_data.filter(
                container__size__name="40"
            )
            party_40_st_clients_raw = party_40_st_query_data.values_list(
                "st__customer_name__name", flat=True
            )
            party_40_st_clients = list(set(list(party_40_st_clients_raw)))

            # Volume
            # Line
            line_20_volume_client_list = [
                {
                    "name": client,
                    "value": line_20_st_query_data.filter(
                        container__client__name=client
                    ).count(),
                }
                for client in line_20_st_clients
            ]
            line_40_volume_client_list = [
                {
                    "name": client,
                    "value": line_40_st_query_data.filter(
                        container__client__name=client
                    ).count(),
                }
                for client in line_40_st_clients
            ]

            # Party
            party_20_volume_client_list = [
                {
                    "name": client,
                    "value": party_20_st_query_data.filter(
                        container__client__name=client
                    ).count(),
                }
                for client in party_20_st_clients
            ]
            party_40_volume_client_list = [
                {
                    "name": client,
                    "value": party_40_st_query_data.filter(
                        container__client__name=client
                    ).count(),
                }
                for client in party_40_st_clients
            ]

            # Revenue
            # Line
            line_20_revenue_client_list = [
                {
                    "name": client,
                    "value": line_20_st_query_data.filter(
                        container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in line_20_st_clients
            ]
            line_40_revenue_client_list = [
                {
                    "name": client,
                    "value": line_40_st_query_data.filter(
                        container__client__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in line_40_st_clients
            ]
            # Party
            party_20_revenue_client_list = [
                {
                    "name": client,
                    "value": party_20_st_query_data.filter(
                        st__customer_name__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in party_20_st_clients
            ]
            party_40_revenue_client_list = [
                {
                    "name": client,
                    "value": party_40_st_query_data.filter(
                        st__customer_name__name=client
                    ).aggregate(
                        revenue=Coalesce(Sum("st__gross_amount", default=0), 0)
                    )[
                        "revenue"
                    ],
                }
                for client in party_40_st_clients
            ]

            (
                top_5_clients_dict_by_revenue,
                top_5_clients_dict_by_volume,
            ) = get_lolo_st_sorted_data(
                line_20_revenue_client_list=line_20_revenue_client_list,
                line_40_revenue_client_list=line_40_revenue_client_list,
                party_20_revenue_client_list=party_20_revenue_client_list,
                party_40_revenue_client_list=party_40_revenue_client_list,
                line_20_volume_client_list=line_20_volume_client_list,
                line_40_volume_client_list=line_40_volume_client_list,
                party_20_volume_client_list=party_20_volume_client_list,
                party_40_volume_client_list=party_40_volume_client_list,
            )
            main_data["total_revenue"] = total_st_revenue
            main_data["total_volume"] = total_st_volume
            main_data["volume_data"] = top_5_clients_dict_by_volume
            main_data["revenue_data"] = top_5_clients_dict_by_revenue
            main_data["from_date"] = required_date["from_date_time"].strftime(
                "%d/%m/%Y"
            )
            main_data["to_date"] = required_date["to_date_time"].strftime("%d/%m/%Y")
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
