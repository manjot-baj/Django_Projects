from django.contrib import admin
from .models import Notification


# Register your models here.
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "text",
        "created_at",
        "category",
        "is_seen",
        "notification_type",
        "location",
        "site",
    )
    list_filter = (
        "is_seen",
        "category",
        "notification_type",
        ("location", admin.RelatedOnlyFieldListFilter),
        ("site", admin.RelatedOnlyFieldListFilter),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related("location", "site")
