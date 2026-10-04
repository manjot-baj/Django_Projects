# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
from master.models import Location, Site
from yard_monitoring.functions import *
from common.functions import cache_api_view
from account.permissions import HasAllowedRoles


class YardDashboard(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    @cache_api_view("yard_dashboard", time=86400)
    def post(self, request, *args, **kwargs):
        try:
            data = {}
            main_data = request.data
            location = Location.objects.get(name=main_data["location"])
            site = Site.objects.get(name=main_data["site"], location=location)
            from_date = request.data["from_date"]
            to_date = request.data["to_date"]
            get_list = request.data["get_list"]
            if "yard_stock_main_data" in get_list:
                data["yard_stock_main_data"] = yard_stock_data(
                    location=location,
                    site=site,
                )
            if "yard_mnr_stage_main_data" in get_list:
                data["yard_mnr_stage_main_data"] = yard_mnr_stage_data(
                    location=location,
                    site=site,
                )
            if len(from_date) == 0 and len(to_date) == 0:
                if "yard_in_lolo_volume_revenue_data" in get_list:
                    data["yard_in_lolo_volume_revenue_data"] = yard_lolo_volume_revenue(
                        movement="IN",
                        location=location,
                        site=site,
                    )
                if "yard_out_lolo_volume_revenue_data" in get_list:
                    data["yard_out_lolo_volume_revenue_data"] = (
                        yard_lolo_volume_revenue(
                            movement="OUT",
                            location=location,
                            site=site,
                        )
                    )
                if "yard_mnr_volume_revenue_data" in get_list:
                    data["yard_mnr_volume_revenue_data"] = yard_mnr_volume_revenue(
                        location=location,
                        site=site,
                    )

                if "yard_mnr_productivity" in get_list:
                    data["yard_mnr_productivity"] = get_yard_mnr_productivity(
                        location=location,
                        site=site,
                    )

            else:
                if "yard_in_lolo_volume_revenue_data" in get_list:
                    data["yard_in_lolo_volume_revenue_data"] = yard_lolo_volume_revenue(
                        movement="IN",
                        location=location,
                        site=site,
                        from_date=from_date,
                        to_date=to_date,
                    )
                if "yard_out_lolo_volume_revenue_data" in get_list:
                    data["yard_out_lolo_volume_revenue_data"] = (
                        yard_lolo_volume_revenue(
                            movement="OUT",
                            location=location,
                            site=site,
                            from_date=from_date,
                            to_date=to_date,
                        )
                    )
                if "yard_mnr_volume_revenue_data" in get_list:
                    data["yard_mnr_volume_revenue_data"] = yard_mnr_volume_revenue(
                        location=location,
                        site=site,
                        from_date=from_date,
                        to_date=to_date,
                    )

                if "yard_mnr_productivity" in get_list:
                    data["yard_mnr_productivity"] = get_yard_mnr_productivity(
                        location=location,
                        site=site,
                        from_date=from_date,
                        to_date=to_date,
                    )

            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
