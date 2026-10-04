from .functions import *
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import Location, Site
from django.utils import timezone
import traceback, logging
from account.permissions import HasAllowedRoles

class Dashboard(views.APIView):
    """the get function will give requested dashboard details"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User","Automation", "Analytics", "Loaded Yard", "Surveyor", "MNR Team", "Repair"]

    def post(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = "Today"
            location = request.data["location"]
            site = request.data["site"]

            # # get data
            # inward_data, outward_data = collect_in_out_data(
            #     location=location, site=site, requirement=requirement
            # )

            # # movement_summary_data
            # movement_summary_data = movement_summary(
            #     inward_data=inward_data, outward_data=outward_data, edi_summary=False
            # )
            # data["movement_summary"] = movement_summary_data

            # # inventory_data
            # inventory_data = inventory(
            #     location=location, site=site, requirement=requirement
            # )
            # data["inventory"] = inventory_data

            # # volume_revenue_data
            # today = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            # year, week_num, dow = today.isocalendar()
            # volume_revenue_data = volume_revenue(
            #     location=location,
            #     site=site,
            #     process="IN",
            #     year="This Year",
            #     week_num=week_num,
            # )
            # data["volume_revenue_data"] = volume_revenue_data

            # # revenue_data
            # revenue_data = revenue(inward_data=inward_data, outward_data=outward_data)
            # data["revenue_data"] = revenue_data

            # # top_client_revenue_data
            # top_client_revenue_data = top_client(
            #     inward_data=inward_data,
            #     outward_data=outward_data,
            #     data_type="top_client",
            # )
            # data["top_client_revenue_data"] = top_client_revenue_data

            # inward_top_client_revenue_data = top_client(
            #     inward_data=inward_data,
            #     outward_data=None,
            #     data_type="inward_top_client",
            # )
            # data["inward_top_client_revenue_data"] = inward_top_client_revenue_data

            # outward_top_client_revenue_data = top_client(
            #     inward_data=None,
            #     outward_data=outward_data,
            #     data_type="outward_top_client",
            # )
            # data["outward_top_client_revenue_data"] = outward_top_client_revenue_data

            # inward_handling_top_client_revenue_data = lolo_st_in_out_top_client(
            #     inward_data=inward_data,
            #     outward_data=None,
            #     data_type="inward_handling_top_client",
            # )
            # data[
            #     "inward_handling_top_client_revenue_data"
            # ] = inward_handling_top_client_revenue_data

            # outward_handling_top_client_revenue_data = lolo_st_in_out_top_client(
            #     inward_data=None,
            #     outward_data=outward_data,
            #     data_type="outward_handling_top_client",
            # )
            # data[
            #     "outward_handling_top_client_revenue_data"
            # ] = outward_handling_top_client_revenue_data

            # transportation_top_client_revenue_data = lolo_st_in_out_top_client(
            #     inward_data=inward_data,
            #     outward_data=outward_data,
            #     data_type="transportation_top_client",
            # )
            # data[
            #     "transportation_top_client_revenue_data"
            # ] = transportation_top_client_revenue_data
            data = {
                "movement_summary": {
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
                },
                "inventory": {
                    "available": {
                        "count": "0",
                        "20_total_count": "0",
                        "20_total_percent": "0%",
                        "40_total_count": "0",
                        "40_total_percent": "0%",
                        "other_total_count": "0",
                        "other_total_percent": "0%",
                    },
                    "allotment": {
                        "count": "0",
                        "20_total_count": "0",
                        "20_total_percent": "0%",
                        "40_total_count": "0",
                        "40_total_percent": "0%",
                        "other_total_count": "0",
                        "other_total_percent": "0%",
                    },
                },
                "volume_revenue_data": {
                    "label": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                    "volume": [
                        {
                            "name": "per_day_count",
                            "data": ["0", "0", "0", "0", "0", "0", "0"],
                        },
                        {"name": "20", "data": ["0", "0", "0", "0", "0", "0", "0"]},
                        {"name": "40", "data": ["0", "0", "0", "0", "0", "0", "0"]},
                        {"name": "other", "data": ["0", "0", "0", "0", "0", "0", "0"]},
                    ],
                    "revenue": [
                        {
                            "name": "per_day_revenue",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                        {
                            "name": "20",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                        {
                            "name": "40",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                        {
                            "name": "other",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                    ],
                },
                "revenue_data": {
                    "handling_in": "0.0",
                    "handling_out": "0.0",
                    "transportation": "0.0",
                },
                "top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "inward_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "outward_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "inward_handling_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "outward_handling_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "transportation_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
            }
            return Response(data, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class DashboardMovementSummary(views.APIView):
    """the post function will give requested Movement Summary details"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = request.data["requirement"]
            location = request.data["location"]
            site = request.data["site"]
            edi_summary = request.data["edi_summary"]

            # # get data
            # inward_data, outward_data = collect_in_out_data(
            #     location=location, site=site, requirement=requirement
            # )

            # # movement_summary_data
            # movement_summary_data = movement_summary(
            #     inward_data=inward_data,
            #     outward_data=outward_data,
            #     edi_summary=edi_summary,
            # )

            # data["movement_summary"] = movement_summary_data
            data = {
                "movement_summary": {
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
            }
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found"}, status=200)


class DashboardInventory(views.APIView):
    """the post function will give requested Inventory details"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = {}
            # inventory_data
            # inventory_data = inventory(
            #     location=request.data["location"],
            #     site=request.data["site"],
            #     requirement=request.data["requirement"],
            # )
            # data["inventory"] = inventory_data
            data = {
                "inventory": {
                    "available": {
                        "count": "0",
                        "20_total_count": "0",
                        "20_total_percent": "0%",
                        "40_total_count": "0",
                        "40_total_percent": "0%",
                        "other_total_count": "0",
                        "other_total_percent": "0%",
                    },
                    "allotment": {
                        "count": "0",
                        "20_total_count": "0",
                        "20_total_percent": "0%",
                        "40_total_count": "0",
                        "40_total_percent": "0%",
                        "other_total_count": "0",
                        "other_total_percent": "0%",
                    },
                }
            }
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found"}, status=200)


class DashboardVolumeRevenue(views.APIView):
    """the post function will give requested volume and revenue details"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = {}
            year = request.data["year"]
            week_num = request.data["week_num"]
            process = request.data["process"]
            location = request.data["location"]
            site = request.data["site"]

            # volume_revenue_data
            # volume_revenue_data = volume_revenue(
            #     location=location,
            #     site=site,
            #     process=process,
            #     year=year,
            #     week_num=week_num,
            # )
            # data["volume_revenue_data"] = volume_revenue_data
            data = {
                "volume_revenue_data": {
                    "label": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                    ],
                    "volume": [
                        {
                            "name": "per_day_count",
                            "data": ["0", "0", "0", "0", "0", "0", "0"],
                        },
                        {"name": "20", "data": ["0", "0", "0", "0", "0", "0", "0"]},
                        {"name": "40", "data": ["0", "0", "0", "0", "0", "0", "0"]},
                        {"name": "other", "data": ["0", "0", "0", "0", "0", "0", "0"]},
                    ],
                    "revenue": [
                        {
                            "name": "per_day_revenue",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                        {
                            "name": "20",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                        {
                            "name": "40",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                        {
                            "name": "other",
                            "data": ["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"],
                        },
                    ],
                }
            }

            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found"}, status=200)


class DashboardRevenue(views.APIView):
    """the post function will give requested Revenue details"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = request.data["requirement"]
            location = request.data["location"]
            site = request.data["site"]

            # # get data
            # inward_data, outward_data = collect_in_out_data(
            #     location=location, site=site, requirement=requirement
            # )

            # # revenue_data
            # revenue_data = revenue(inward_data=inward_data, outward_data=outward_data)
            # data["revenue_data"] = revenue_data
            data = {
                "revenue_data": {
                    "handling_in": "0.0",
                    "handling_out": "0.0",
                    "transportation": "0.0",
                }
            }
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found"}, status=200)


class DashboardTopClientRevenue(views.APIView):
    """the post function will give requested top client details"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = {}
            requirement = request.data["requirement"]
            location = request.data["location"]
            site = request.data["site"]

            # get data
            # inward_data, outward_data = collect_in_out_data(
            #     location=location, site=site, requirement=requirement
            # )

            # # top_client_revenue_data
            # top_client_revenue_data = top_client(
            #     inward_data=inward_data,
            #     outward_data=outward_data,
            #     data_type="top_client",
            # )
            # data["top_client_revenue_data"] = top_client_revenue_data

            # inward_top_client_revenue_data = top_client(
            #     inward_data=inward_data,
            #     outward_data=None,
            #     data_type="inward_top_client",
            # )
            # data["inward_top_client_revenue_data"] = inward_top_client_revenue_data

            # outward_top_client_revenue_data = top_client(
            #     inward_data=None,
            #     outward_data=outward_data,
            #     data_type="outward_top_client",
            # )
            # data["outward_top_client_revenue_data"] = outward_top_client_revenue_data

            # inward_handling_top_client_revenue_data = lolo_st_in_out_top_client(
            #     inward_data=inward_data,
            #     outward_data=None,
            #     data_type="inward_handling_top_client",
            # )
            # data[
            #     "inward_handling_top_client_revenue_data"
            # ] = inward_handling_top_client_revenue_data

            # outward_handling_top_client_revenue_data = lolo_st_in_out_top_client(
            #     inward_data=None,
            #     outward_data=outward_data,
            #     data_type="outward_handling_top_client",
            # )
            # data[
            #     "outward_handling_top_client_revenue_data"
            # ] = outward_handling_top_client_revenue_data

            # transportation_top_client_revenue_data = lolo_st_in_out_top_client(
            #     inward_data=inward_data,
            #     outward_data=outward_data,
            #     data_type="transportation_top_client",
            # )
            # data[
            #     "transportation_top_client_revenue_data"
            # ] = transportation_top_client_revenue_data

            data = {
                "top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "inward_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "outward_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "inward_handling_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "outward_handling_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
                "transportation_top_client_revenue_data": {
                    "label": [],
                    "total_revenue": [],
                    "percent": [],
                },
            }
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found"}, status=200)
