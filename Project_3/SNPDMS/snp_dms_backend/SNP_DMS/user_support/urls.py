from django.urls import path
from .views import (
    CreateSupportTicket,
    UserTicketList,
    UserTicketDetail,
    UpdateSupportTicket,
    DeleteSupportTicket,
    AddTicketAttachment,
    DeleteTicketAttachment,
    DownloadTicketAttachment,
    TicketReviewAPI,
    TicketCommentAPI,
    CreateJiraTicketAPIView,
)
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    # Support Ticket CRUD APIs
    path(
        "tickets/",
        UserTicketList.as_view(),
    ),
    path("tickets/create/", CreateSupportTicket.as_view()),
    path(
        "tickets/<int:ticket_id>/detail/",
        UserTicketDetail.as_view(),
    ),
    path(
        "tickets/<int:ticket_id>/update/",
        UpdateSupportTicket.as_view(),
    ),
    path(
        "tickets/<int:ticket_id>/delete/",
        DeleteSupportTicket.as_view(),
    ),
    # Ticket Attachments APIs
    path(
        "tickets/<int:ticket_id>/attachment/add/",
        AddTicketAttachment.as_view(),
    ),
    path(
        "attachments/<int:attachment_id>/delete/",
        DeleteTicketAttachment.as_view(),
    ),
    path(
        "attachments/<int:attachment_id>/download/",
        DownloadTicketAttachment.as_view(),
    ),
    # Ticket Review (Reviewer Only)
    path(
        "tickets/<int:ticket_id>/review/",
        TicketReviewAPI.as_view(),
    ),
    path(
        "tickets/<int:ticket_id>/create_jira_ticket/",
        CreateJiraTicketAPIView.as_view(),
    ),
    # Ticket Comments
    path(
        "tickets/<int:ticket_id>/comment/add/",
        TicketCommentAPI.as_view(),
    ),
    path(
        "comments/<int:comment_id>/update/",
        TicketCommentAPI.as_view(),
    ),
    path(
        "comments/<int:comment_id>/delete/",
        TicketCommentAPI.as_view(),
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
