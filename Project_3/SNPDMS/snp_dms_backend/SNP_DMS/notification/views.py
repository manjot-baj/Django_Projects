# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback
import logging
from common.functions import get_location_site
from datetime import timedelta, datetime
from django.utils import timezone
from django.utils.timesince import timesince
from account.permissions import HasAllowedRoles

# model imports
from .models import Notification


class NotificationView(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User","MNR Team"]

    def get_params(self, request):
        end_date = timezone.now()
        start_date = end_date - timedelta(days=7)
        params = {
            "created_at__range": (start_date, end_date),
            # "created_at__lte": end_date,
        }
        if request.data.get("location") == "ALL" and request.data.get("site") == "ALL":
            return params
        elif request.data.get("site") == "ALL":
            params["location__name"] = request.data.get("location")
        else:
            params["site__name"] = request.data.get("site")
            params["location__name"] = request.data.get("location")
        return params

    def format_created_at(self, created_at):
        delta = timezone.now() - created_at
        # Checks if days are greater than zero or seconds are greater than 86400 seconds
        if delta.days > 0 or delta.seconds > 3600 * 24:
            return f"{delta.days} days ago"
        else:
            return timesince(created_at).split(", ")[0] + " ago"

    def post(self, request, *args, **kwargs):
        try:
            params = self.get_params(request)

            data = [
                {
                    "pk": notification["pk"],
                    "text": notification["text"],
                    "is_seen": notification["is_seen"],
                    "location": notification["location__name"],
                    "site": notification["site__name"],
                    "created_at": self.format_created_at(notification["created_at"]),
                    "category": notification["category"],
                    "notification_type": notification["notification_type"],
                }
                for notification in Notification.objects.filter(**params)
                .select_related("location", "site")
                .values(
                    "pk",
                    "text",
                    "is_seen",
                    "location__name",
                    "site__name",
                    "created_at",
                    "category",
                    "notification_type",
                )
                .order_by("-created_at")
            ]

            return Response(data)

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class NotificationHistory(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User","MNR Team"]

    def get_params(self, request):
        location, site = get_location_site(
            location_name=request.data.get("location"),
            site_name=request.data.get("site"),
        )
        from_date = request.data.get("from_date")
        to_date = request.data.get("to_date")
        seen = request.data.get("seen")
        notification_type = request.data.get("notification_type")
        params = {
            "location": location,
            "site": site,
        }
        if seen != "ALL":
            params["is_seen"] = seen

        if from_date and to_date:
            from_date_obj = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date()
            from_time = (
                datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).time()
            )
            to_time = (
                datetime.now()
                .replace(hour=23, minute=59, second=0, microsecond=0)
                .time()
            )
            from_date_time = datetime.combine(from_date_obj, from_time)
            to_date_time = datetime.combine(to_date_obj, to_time)
            params["created_at__range"] = (from_date_time, to_date_time)
        if notification_type != "ALL":
            params["notification_type"] = notification_type

        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.get_params(request)
            data = Notification.objects.filter(**params).values(
                "pk", "text", "created_at"
            )
            return Response(data)

        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class MarkAllAsRead(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User","MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            notification_ids = request.data.get("notification_ids")
            Notification.objects.filter(pk__in=notification_ids).update(is_seen=True)
            return Response({"successMsg": "Done"})
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
