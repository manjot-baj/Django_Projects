from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import traceback, logging

def send_notification(site, location, category, notification_type, message):
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notification_group",
            {
                "type": "notification_object",
                "location": location,
                "site": site,
                "category": category,
                "notification_type": notification_type,
                "message": message,
            },
        )
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
