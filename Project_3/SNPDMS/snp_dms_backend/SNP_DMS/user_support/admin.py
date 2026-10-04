from django.contrib import admin
from .models import SupportTicket, TicketAttachment, TicketActivity, TicketComment


class TicketAttachmentInline(admin.TabularInline):
    model = TicketAttachment
    extra = 0
    readonly_fields = ("uploaded_at",)
    fields = ("file_name", "file_type", "s3_file_key", "uploaded_at")


class TicketCommentInline(admin.TabularInline):
    model = TicketComment
    extra = 1
    readonly_fields = ("created_at",)
    fields = ("user", "comment_text", "created_at")


class TicketActivityInline(admin.TabularInline):
    model = TicketActivity
    extra = 0
    can_delete = False
    readonly_fields = (
        "user",
        "action",
        "description",
        "old_status",
        "new_status",
        "created_at",
    )
    fields = (
        "user",
        "action",
        "description",
        "old_status",
        "new_status",
        "created_at",
    )


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = (
        "ticket_number",
        "subject",
        "ticket_type",
        "module_name",
        "status",
        "user",
        "reviewer",
        "location",
        "site",
        "created_at",
    )

    list_filter = (
        "ticket_type",
        "status",
        "module_name",
        "user",
        "reviewer",
        "location",
        "site",
        "created_at",
    )

    search_fields = (
        "ticket_number",
        "subject",
        "description",
        "jira_ticket_id",
    )

    readonly_fields = (
        "ticket_number",
        "created_at",
        "updated_at",
        "jira_created_at",
    )

    inlines = [
        TicketAttachmentInline,
        TicketCommentInline,
        TicketActivityInline,
    ]

    fieldsets = (
        (
            "Ticket Details",
            {
                "fields": (
                    "ticket_number",
                    "ticket_type",
                    "module_name",
                    "subject",
                    "description",
                )
            },
        ),
        (
            "Location Info",
            {
                "fields": (
                    "location",
                    "site",
                )
            },
        ),
        (
            "Users",
            {
                "fields": (
                    "user",
                    "reviewer",
                    "status",
                    "reviewed_at",
                )
            },
        ),
        (
            "JIRA Info",
            {
                "fields": (
                    "jira_ticket_id",
                    "jira_ticket_url",
                    "jira_created_at",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(TicketAttachment)
class TicketAttachmentAdmin(admin.ModelAdmin):
    list_display = ("ticket", "file_name", "file_type", "uploaded_at")
    search_fields = ("file_name", "ticket__ticket_number")
    list_filter = ("file_type", "uploaded_at")


@admin.register(TicketActivity)
class TicketActivityAdmin(admin.ModelAdmin):
    list_display = (
        "ticket",
        "user",
        "action",
        "old_status",
        "new_status",
        "created_at",
    )

    search_fields = (
        "ticket__ticket_number",
        "action",
        "description",
        "old_status",
        "new_status",
    )

    list_filter = ("action", "old_status", "new_status", "created_at")

    readonly_fields = (
        "ticket",
        "user",
        "action",
        "description",
        "old_status",
        "new_status",
        "created_at",
    )


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ("ticket", "user", "created_at")
    search_fields = ("ticket__ticket_number", "comment_text")
    list_filter = ("user", "created_at")
    readonly_fields = ("created_at",)
