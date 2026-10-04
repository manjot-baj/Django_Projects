from django.db import models
from master.models import Location, Site
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

# Create your models here.

CATEGORY = [
    ("MASTER", "MASTER"),
    ("MNR", "MNR"),
    ("USER_SUPPORT", "USER_SUPPORT"),
    ("ACCOUNT", "ACCOUNT"),
    ("PROCUREMENT", "PROCUREMENT"),
    ("BILLING INVOICE", "BILLING INVOICE"),
    ("GATE IN", "GATE IN"),
    ("GATE OUT", "GATE OUT"),
]
NOTIFICATION_TYPE = [
    ("SUCCESS", "SUCCESS"),
    ("WARNING", "WARNING"),
    ("FAILURE", "FAILURE"),
    ("OTHER", "OTHER"),
]


class Notification(models.Model):
    text = models.TextField(max_length=200)
    is_seen = models.BooleanField(null=True, blank=True, default=False)
    created_at = models.DateTimeField(default=timezone.now)
    category = models.CharField(max_length=100, blank=True, null=True, choices=CATEGORY)
    notification_type = models.CharField(
        max_length=100, blank=True, null=True, choices=NOTIFICATION_TYPE
    )
    location = models.ForeignKey(
        Location,
        related_name="notification_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="notification_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.pk)

    # def save(self, *args, **kwargs):
    #     channel_layer = get_channel_layer()
    #     print(channel_layer)
    #     notification_object = Notification.objects.all().count()
    #     data = {"count": notification_object, "current_notification": self.text}
    #     print(data)
    #     async_to_sync(channel_layer.group_send)(
    #         "notification_group",
    #         {"type": "send_notification", "value": json.dumps(data)},
    #     )
    #     super(Notification, self).save(*args, **kwargs)
