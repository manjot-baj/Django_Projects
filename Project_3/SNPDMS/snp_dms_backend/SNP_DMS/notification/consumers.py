import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import traceback, logging
from rest_framework.response import Response


class NotificationConsumer(WebsocketConsumer):

    def connect(self):
        try:
            from .models import Notification

            site = self.scope["url_route"]["kwargs"]["site"]
            location = self.scope["url_route"]["kwargs"]["location"]
            self.room_name = site
            self.room_group_name = "notification_group"
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )
            self.accept()
            if location == "all" and site == "all":
                self.send(
                    text_data=json.dumps(
                        {
                            "count": Notification.objects.filter(
                                is_seen=False,
                            ).count(),
                        }
                    )
                )
            elif site == "all":
                self.send(
                    text_data=json.dumps(
                        {
                            "count": Notification.objects.filter(
                                is_seen=False, location__name=location
                            ).count()
                        }
                    )
                )
            else:
                self.send(
                    text_data=json.dumps(
                        {
                            "count": Notification.objects.filter(
                                is_seen=False, site__name=site, location__name=location
                            ).count(),
                        }
                    )
                )
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def disconnect(self, *args, **kwargs):
        pass

    def receive(self, text_data):
        from .models import Notification

        data = json.loads(text_data)
        if data["action"] == "mark_as_read":
            pk = data["pk"]
            location = data["location"]
            site = data["site"]

            Notification.objects.filter(pk=pk).update(is_seen=True)
            async_to_sync(self.channel_layer.group_send)(
                "notification_group",
                {
                    "type": "notification_event",
                    "notification_id": pk,
                    "message": "Marked as read",
                    "location": location,
                    "site": site,
                },
            )

    def notification_event(self, event):
        from .models import Notification

        location = event["location"]
        site = event["site"]
        if location == "all" and site == "all":
            self.send(
                text_data=json.dumps(
                    {
                        "count": Notification.objects.filter(is_seen=False).count(),
                    }
                )
            )
        if site == "all":
            self.send(
                text_data=json.dumps(
                    {
                        "count": Notification.objects.filter(
                            is_seen=False, location__name=location
                        ).count(),
                    }
                )
            )
        else:
            self.send(
                text_data=json.dumps(
                    {
                        "count": Notification.objects.filter(
                            is_seen=False, site__name=site, location__name=location
                        ).count(),
                    }
                )
            )

    # def send_notification(self, event):
    #     print(event)
    #     data = json.loads(event.get("value"))
    #     print(data)
    #     self.send(text_data=json.dumps({"payload": data}))
    #     print("received notification")

    def notification_object(self, event):
        try:
            from .models import Notification
            from master.models import Location, Site

            message = event["message"]
            location_name = event["location"]
            site_name = event["site"]
            category = event["category"]
            notification_type = event["notification_type"]

            if not Notification.objects.filter(
                text=message,
                category=category,
                notification_type=notification_type,
                location=Location.objects.get(name=location_name),
                site=Site.objects.get(name=site_name),
            ).exists():
                obj = Notification.objects.create(
                    text=message,
                    category=category,
                    notification_type=notification_type,
                    location=Location.objects.get(name=location_name),
                    site=Site.objects.get(name=site_name),
                )
                self.send(text_data=json.dumps({"notification": message, "pk": obj.pk}))
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
