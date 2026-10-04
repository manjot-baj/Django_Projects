from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from decouple import config
from .models import (
    SupportTicket,
    TicketAttachment,
    TicketComment,
    TicketActivity,
)
from account.models import AccountUser
from master.models import Location, Site
import os, uuid, datetime
from common.functions import upload_file, delete_file, download_file
from account.permissions import HasAllowedRoles
from common.error_logging import ErrorLogging
from common.exceptions import ValidationError
from django.db import transaction
from django.http import HttpResponse
from django.core.paginator import Paginator
from django.db.models import Q
import json, requests
from requests.auth import HTTPBasicAuth
from user_support.functions import JiraClient
from notification.utils import send_notification
import mimetypes

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")


class UserTicketList(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request):
        try:
            user = request.user
            data = request.data
            account_user = AccountUser.objects.get(username=user.username)

            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            location_name = data.get("location")
            site_name = data.get("site")
            ticket_number = data.get("ticket_number")
            ticket_type = data.get("ticket_type")
            status = data.get("status")
            module_name = data.get("module_name")

            from_date_time = None
            to_date_time = None
            if (
                not len(data.get("from_date")) == 0
                and not len(data.get("to_date")) == 0
            ):
                from_date = datetime.datetime.strptime(
                    data.get("from_date"), "%Y-%m-%d"
                ).date()
                from_time = datetime.datetime.strptime("00:00", "%H:%M").time()
                from_date_time = datetime.datetime.combine(from_date, from_time)
                to_date = datetime.datetime.strptime(
                    data.get("to_date"), "%Y-%m-%d"
                ).date()
                to_time = datetime.datetime.strptime("23:59", "%H:%M").time()
                to_date_time = datetime.datetime.combine(to_date, to_time)

            filters = Q()
            if location_name:
                filters &= Q(location__name=location_name)
            if site_name:
                filters &= Q(site__name=site_name)
            if ticket_number:
                filters &= Q(ticket_number=ticket_number)
            if ticket_type:
                filters &= Q(ticket_type=ticket_type)
            if status:
                filters &= Q(status=status)
            if module_name:
                filters &= Q(module_name=module_name)
            if from_date_time and to_date_time:
                filters &= Q(created_at__range=(from_date_time, to_date_time))

            qs = None
            if account_user.role.name == "Admin":
                qs = (
                    SupportTicket.objects.select_related()
                    .filter(filters)
                    .order_by("-created_at")
                )
            else:
                qs = (
                    SupportTicket.objects.select_related()
                    .filter(user=account_user)
                    .filter(filters)
                    .order_by("-created_at")
                )

            # pagination
            paginator = Paginator(qs, on_page_data)
            current_page = paginator.page(pg_no)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            on_page_data_count = current_page.object_list.count()
            prev_page = (
                current_page.previous_page_number()
                if current_page.has_previous()
                else None
            )
            next_page = (
                current_page.next_page_number() if current_page.has_next() else None
            )

            response_data = [
                {
                    **ticket.get_ticket_short_summary(),
                    "sr_no": current_page.start_index() + index,
                }
                for index, ticket in enumerate(current_page.object_list)
            ]

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": response_data,
                },
                status=200,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Error fetching tickets: {e}"}, status=200)


class CreateSupportTicket(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Location Admin", "Site Admin", "Depot User"]

    def post(self, request):
        try:
            with transaction.atomic():
                user = request.user
                data = request.data

                if None in [
                    data.get("location", None),
                    data.get("site", None),
                    data.get("ticket_type", None),
                    data.get("subject", None),
                    data.get("description", None),
                    data.get("module_name", None),
                ]:
                    raise ValidationError("All fields are required")

                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()
                location = Location.objects.filter(name=data.get("location")).first()
                site = Site.objects.filter(
                    name=data.get("site"), location=location
                ).first()

                ticket = SupportTicket.objects.create(
                    user=account_user,
                    ticket_type=data.get("ticket_type"),
                    subject=data.get("subject"),
                    description=data.get("description"),
                    module_name=data.get("module_name"),
                    status="Review Pending",
                    location=location,
                    site=site,
                )

                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="ticket_created",
                    description="User created a new support ticket",
                )

                send_notification(
                    location=location.name,
                    site=site.name,
                    category="USER_SUPPORT",
                    notification_type="SUCCESS",
                    message=f"New Support Ticket {ticket.ticket_number} created by {account_user.username}",
                )
                return Response(
                    {
                        "successMsg": "Ticket created successfully",
                        "ticket_id": ticket.pk,
                    },
                    status=200,
                )

        except ValidationError as e:
            return Response({"errorMsg": str(e.message), "data": None}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials {e}"}, status=200)


class AddTicketAttachment(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Location Admin", "Site Admin", "Depot User"]

    def post(self, request, ticket_id):
        try:
            with transaction.atomic():
                user = request.user
                ticket = get_object_or_404(SupportTicket, id=ticket_id)

                if ticket.status != "Review Pending":
                    return Response(
                        {
                            "errorMsg": "Cannot add attachment after review starts",
                        }
                    )

                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()

                files = request.FILES.getlist("file")
                if not files:
                    raise ValidationError("No file uploaded")

                uploaded_ids = []

                DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "txt"]
                IMAGE_EXT = ["jpg", "jpeg", "png"]
                VIDEO_EXT = ["mp4", "mov", "avi", "mkv"]

                for file in files:
                    ext = file.name.split(".")[-1].lower()

                    if ext in IMAGE_EXT:
                        file_type = "image"
                    elif ext in VIDEO_EXT:
                        file_type = "video"
                    elif ext in DOC_EXT:
                        file_type = "document"
                    else:
                        file_type = None

                    if file_type is not None:
                        s3_key = f"support_tickets/{ticket.ticket_number}/{uuid.uuid4()}.{ext}"

                        temp_path = f"/tmp/{uuid.uuid4()}.{ext}"
                        with open(temp_path, "wb+") as temp:
                            for chunk in file.chunks():
                                temp.write(chunk)

                        upload_file(temp_path, AWS_STORAGE_BUCKET_NAME, s3_key)
                        os.remove(temp_path)

                        attachment = TicketAttachment.objects.create(
                            ticket=ticket,
                            file_name=file.name,
                            file_type=file_type,
                            s3_file_key=s3_key,
                        )
                        uploaded_ids.append(attachment.id)

                        TicketActivity.objects.create(
                            ticket=ticket,
                            user=account_user,
                            action="attachment_added",
                            description=f"Uploaded: {file.name}",
                        )

                if len(uploaded_ids) == 0:
                    raise ValidationError("No valid files to upload")

                return Response(
                    {
                        "successMsg": "Attachments uploaded successfully",
                    },
                    status=200,
                )

        except ValidationError as e:
            return Response({"errorMsg": str(e)}, status=200)

        except Exception as e:
            return Response({"errorMsg": f"Error uploading file: {e}"}, status=200)


class DeleteTicketAttachment(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, attachment_id):
        try:
            with transaction.atomic():
                user = request.user
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()
                attachment = get_object_or_404(TicketAttachment, id=attachment_id)
                ticket = attachment.ticket

                if ticket.status != "Review Pending":
                    return Response(
                        {
                            "errorMsg": "Cannot delete attachment after review starts",
                        }
                    )

                delete_file(AWS_STORAGE_BUCKET_NAME, attachment.s3_file_key)
                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="attachment_deleted",
                    description=f"Deleted: {attachment.file_name}",
                )
                attachment.delete()
                return Response({"successMsg": "Attachment deleted"}, status=200)

        except Exception as e:
            return Response({"errorMsg": f"Error deleting attachment: {e}"}, status=200)


class DownloadTicketAttachment(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, attachment_id):
        try:
            attachment = get_object_or_404(TicketAttachment, id=attachment_id)

            temp_file_path = download_file(
                AWS_STORAGE_BUCKET_NAME,
                attachment.s3_file_key,
                attachment.file_name,
            )

            if not temp_file_path:
                return Response({"errorMsg": "File download failed"}, status=200)

            ext = attachment.file_name.rsplit(".", 1)[-1].lower()

            content_type, _ = mimetypes.guess_type(attachment.file_name)
            content_type = content_type or "application/octet-stream"

            with open(temp_file_path, "rb") as temp:
                response = HttpResponse(
                    temp.read(),
                    content_type=content_type,
                )
                response["Content-Disposition"] = (
                    f'attachment; filename="{attachment.file_name}"'
                )
                response["X-File-Extension"] = ext

            os.remove(temp_file_path)
            return response

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Error downloading file: {e}"},
                status=200,
            )


class UserTicketDetail(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, ticket_id):
        try:
            account_user = AccountUser.objects.filter(
                username=request.user.username
            ).first()
            ticket = SupportTicket.objects.get(id=ticket_id)
            ticket_data = ticket.get_ticket_summary()
            return Response(ticket_data, status=200)
        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Ticket not found: {e}"}, status=200)


class UpdateSupportTicket(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Location Admin", "Site Admin", "Depot User"]

    def put(self, request, ticket_id):
        try:
            with transaction.atomic():
                user = request.user
                data = request.data
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()
                if None in [
                    data.get("location", None),
                    data.get("site", None),
                    data.get("ticket_type", None),
                    data.get("subject", None),
                    data.get("description", None),
                    data.get("module_name", None),
                ]:
                    raise ValidationError("All fields are required")

                ticket = SupportTicket.objects.get(id=ticket_id, user=account_user)

                if ticket.status != "Review Pending":
                    return Response(
                        {
                            "errorMsg": "Cannot modify ticket after review starts",
                        },
                        status=200,
                    )

                ticket.ticket_type = data.get("ticket_type", ticket.ticket_type)
                ticket.subject = data.get("subject", ticket.subject)
                ticket.description = data.get("description", ticket.description)
                ticket.module_name = data.get("module_name", ticket.module_name)
                ticket.save()

                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="ticket_updated",
                    description="User updated the ticket",
                )

                return Response(
                    {"successMsg": "Ticket updated successfully"}, status=200
                )

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Ticket not found: {e}"}, status=200)


class DeleteSupportTicket(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, ticket_id):
        try:
            with transaction.atomic():
                user = request.user
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()
                ticket = SupportTicket.objects.get(id=ticket_id, user=account_user)

                if ticket.status != "Review Pending":
                    return Response(
                        {
                            "errorMsg": "Cannot delete once review has started",
                        },
                        status=200,
                    )
                for attachment in TicketAttachment.objects.filter(ticket=ticket):
                    delete_file(AWS_STORAGE_BUCKET_NAME, attachment.s3_file_key)
                ticket.delete()
                return Response({"successMsg": "Ticket deleted"}, status=200)

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Ticket not found: {e}"}, status=200)


class TicketReviewAPI(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, ticket_id):
        try:
            with transaction.atomic():
                user = request.user
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()
                ticket = get_object_or_404(SupportTicket, id=ticket_id)
                new_status = request.data.get("status")
                old_status = ticket.status
                ticket.status = new_status
                ticket.reviewer = account_user
                ticket.reviewed_at = timezone.now()
                ticket.save()

                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="review_updated",
                    old_status=old_status,
                    new_status=new_status,
                    description="Reviewer updated ticket status",
                )

                return Response({"successMsg": "Review updated"}, status=200)

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Error updating review: {e}"}, status=200)


class TicketCommentAPI(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, ticket_id):
        try:
            with transaction.atomic():
                user = request.user
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()
                ticket = get_object_or_404(SupportTicket, id=ticket_id)

                TicketComment.objects.create(
                    ticket=ticket,
                    user=account_user,
                    comment_text=request.data.get("comment_text"),
                )

                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="comment_added",
                    description="User added a comment",
                )

                if account_user.role.name != "Admin":
                    send_notification(
                        location=ticket.location.name,
                        site=ticket.site.name,
                        category="USER_SUPPORT",
                        notification_type="SUCCESS",
                        message=f"Comment added to Support Ticket {ticket.ticket_number} by {account_user.username}",
                    )

                return Response({"successMsg": "Comment added"}, status=200)

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Error adding comment: {e}"}, status=200)

    def put(self, request, comment_id):
        try:
            with transaction.atomic():
                user = request.user
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()

                comment = get_object_or_404(TicketComment, id=comment_id)
                ticket = comment.ticket

                if (
                    comment.user.role.name == "Admin"
                    and account_user.role.name != "Admin"
                ):
                    return Response(
                        {"errorMsg": "You are not allowed to edit this comment"},
                        status=200,
                    )
                if comment.user.role.name != "Admin" and comment.user != account_user:
                    return Response(
                        {"errorMsg": "You are not allowed to edit this comment"},
                        status=200,
                    )

                if not request.data.get("comment_text"):
                    return Response(
                        {"errorMsg": "Comment text is required"},
                        status=200,
                    )

                comment.comment_text = request.data.get("comment_text")
                comment.save()

                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="comment_updated",
                    description="Updated a comment",
                )

                return Response(
                    {"successMsg": "Comment updated successfully"}, status=200
                )

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Error updating comment: {e}"}, status=200)

    def delete(self, request, comment_id):
        try:
            with transaction.atomic():
                user = request.user
                account_user = AccountUser.objects.filter(
                    username=user.username
                ).first()

                comment = get_object_or_404(TicketComment, id=comment_id)
                ticket = comment.ticket

                if (
                    comment.user.role.name == "Admin"
                    and account_user.role.name != "Admin"
                ):
                    return Response(
                        {"errorMsg": "You are not allowed to delete this comment"},
                        status=200,
                    )
                if comment.user.role.name != "Admin" and comment.user != account_user:
                    return Response(
                        {"errorMsg": "You are not allowed to delete this comment"},
                        status=200,
                    )

                comment.delete()

                TicketActivity.objects.create(
                    ticket=ticket,
                    user=account_user,
                    action="comment_deleted",
                    description="Deleted a comment",
                )

                return Response(
                    {"successMsg": "Comment deleted successfully"}, status=200
                )

        except Exception as e:
            ErrorLogging().log_error()
            return Response({"errorMsg": f"Error deleting comment: {e}"}, status=200)


class CreateJiraTicketAPIView(APIView):

    def upload_attachments(self, jira, ticket, jira_key):
        attachments = TicketAttachment.objects.filter(ticket=ticket)

        for attachment in attachments:
            try:
                temp_file_path = download_file(
                    AWS_STORAGE_BUCKET_NAME,
                    attachment.s3_file_key,
                    attachment.file_name,
                )
                with open(temp_file_path, "rb") as file:
                    requests.post(
                        f"{jira.base_url}/rest/api/3/issue/{jira_key}/attachments",
                        headers={"X-Atlassian-Token": "no-check"},
                        auth=jira.auth,
                        files={"file": file},
                    )
                os.remove(temp_file_path)
            except Exception:
                pass

    def get(self, request, ticket_id):
        try:
            ticket = SupportTicket.objects.get(id=ticket_id)

            if ticket.status != "Review Passed":
                raise ValidationError("Ticket must be review_passed")

            jira = JiraClient()
            project_id = jira.get_project_id(config("JIRA_PROJECT_KEY"))
            issuetype_id = jira.get_issue_type_id(project_id)

            response = requests.post(
                f"{jira.base_url}/rest/api/3/issue",
                auth=jira.auth,
                headers=jira.headers,
                json={
                    "fields": {
                        "project": {"id": project_id},
                        "summary": ticket.subject,
                        "description": {
                            "type": "doc",
                            "version": 1,
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [
                                        {
                                            "type": "text",
                                            "text": ticket.description or "",
                                        }
                                    ],
                                }
                            ],
                        },
                        "issuetype": {"id": issuetype_id},
                    }
                },
            )

            if response.status_code != 201:
                raise ValidationError(response.text)

            jira_data = response.json()
            jira_key = jira_data["key"]
            jira_url = f"{config('JIRA_BASE_URL')}/browse/{jira_key}"
            ticket.jira_ticket_id = jira_key
            ticket.jira_ticket_url = jira_url
            ticket.jira_created_at = timezone.now()

            ticket.status = "Open"
            ticket.save()

            self.upload_attachments(jira, ticket, jira_key)

            return Response(
                {
                    "successMsg": "Jira ticket created successfully",
                    "jira_key": jira_key,
                },
                status=200,
            )

        except SupportTicket.DoesNotExist:
            return Response({"errorMsg": "Ticket not found"}, status=404)

        except ValidationError as e:
            return Response({"errorMsg": str(e)}, status=400)

        except Exception as e:
            return Response({"errorMsg": str(e)}, status=500)
