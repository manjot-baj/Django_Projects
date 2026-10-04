from django.db import models
from account.models import AccountUser
from master.models import Location, Site
from django.utils import timezone
from datetime import timedelta


class SupportTicket(models.Model):
    TICKET_TYPE_CHOICES = [
        ("Bug Report", "Bug Report"),
        ("Feature Request", "Feature Request"),
        ("Demo Request", "Demo Request"),
    ]

    STATUS_CHOICES = [
        ("Review Pending", "Review Pending"),
        ("Review Passed", "Review Passed"),
        ("Review Failed", "Review Failed"),
        ("Open", "Open"),
        ("In Progress", "In Progress"),
        ("Closed", "Closed"),
    ]

    MODULES = [
        ("Account", "Account"),
        ("Analytics", "Analytics"),
        ("Adhoc Reports", "Adhoc Reports"),
        ("Automation Support", "Automation Support"),
        ("Dashboard", "Dashboard"),
        ("Masters", "Masters"),
        ("Depot IN", "Depot IN"),
        ("Depot OUT", "Depot OUT"),
        ("NonDepot IN", "NonDepot IN"),
        ("NonDepot OUT", "NonDepot OUT"),
        ("Stock", "Stock"),
        ("Allotment", "Allotment"),
        ("MNR", "MNR"),
        ("EDI", "EDI"),
        ("Reports", "Reports"),
        ("Billing Invoice", "Billing Invoice"),
        ("Procurement", "Procurement"),
        ("Lolo Finance", "Lolo Finance"),
        ("Enbloc Movement", "Enbloc Movement"),
        ("Truck Tracking", "Truck Tracking"),
        ("Notification", "Notification"),
        ("Other", "Other"),
    ]

    ticket_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(
        AccountUser,
        on_delete=models.SET_NULL,
        related_name="support_tickets",
        null=True,
        blank=True,
    )
    ticket_type = models.CharField(max_length=20, choices=TICKET_TYPE_CHOICES)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    module_name = models.CharField(max_length=200, choices=MODULES)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="review_pending"
    )
    reviewer = models.ForeignKey(
        AccountUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_tickets",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    jira_ticket_id = models.CharField(max_length=50, blank=True, null=True)
    jira_ticket_url = models.URLField(blank=True, null=True)
    jira_created_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    location = models.ForeignKey(
        Location,
        related_name="support_ticket_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="support_ticket_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = "support_tickets"
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "created_at"], name="idx_spt_tkt_user_created_at"
            ),
            models.Index(
                fields=["status", "created_at"], name="idx_spt_tkt_status_created_at"
            ),
            models.Index(fields=["ticket_number"], name="idx_ticket_number"),
            models.Index(
                fields=["reviewer", "reviewed_at"], name="idx_reviewer_reviewed"
            ),
            models.Index(fields=["module_name"], name="idx_spt_tkt_module"),
            models.Index(fields=["ticket_type"], name="idx_ticket_type"),
            models.Index(fields=["location"], name="idx_spt_tkt_location"),
            models.Index(fields=["site"], name="idx_spt_tkt_site"),
        ]

    def __str__(self):
        return f"{self.ticket_number} - {self.subject}"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            # Generate ticket number: TKT-YYYYMMDD-XXXX
            today = timezone.now().strftime("%Y%m%d")
            last_ticket = (
                SupportTicket.objects.filter(ticket_number__startswith=f"TKT-{today}")
                .order_by("-ticket_number")
                .first()
            )

            if last_ticket:
                last_num = int(last_ticket.ticket_number.split("-")[-1])
                new_num = last_num + 1
            else:
                new_num = 1

            self.ticket_number = f"TKT-{today}-{new_num:04d}"

        super().save(*args, **kwargs)

    def can_create_jira(self):
        """Check if ticket is eligible for JIRA creation"""
        return self.status == "review_passed" and not self.jira_ticket_id

    def should_be_deleted(self):
        """Check if ticket should be auto-deleted"""
        if self.status == "review_failed" and self.reviewed_at:
            return timezone.now() > self.reviewed_at + timedelta(days=15)
        elif self.status == "closed" and self.updated_at:
            return timezone.now() > self.updated_at + timedelta(days=15)
        return False

    def get_ticket_summary(self):
        """Return a summary of the ticket"""
        try:
            tz = timezone.get_current_timezone()
            attachments = [
                {
                    "file_name": a.file_name,
                    "file_type": a.file_type,
                    "s3_key": a.s3_file_key,
                    "pk": a.pk,
                }
                for a in TicketAttachment.objects.filter(ticket=self).order_by(
                    "-uploaded_at"
                )
            ]

            comments = [
                {
                    "commented_by": (
                        "Reviewer"
                        if c.user.role.name == "Admin"
                        else f"{c.user.role.name} : {c.user.username}: {c.user.firstname} {c.user.lastname}"
                    ),
                    "comment": c.comment_text,
                    "created_at": c.created_at.astimezone(tz).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                    "pk": c.pk,
                }
                for c in TicketComment.objects.filter(ticket=self).order_by(
                    "-created_at"
                )
            ]

            activity = [
                {
                    "activity_by": (
                        "Reviewer"
                        if aty.user.role.name == "Admin"
                        else f"{aty.user.role.name} : {aty.user.username}: {aty.user.firstname} {aty.user.lastname}"
                    ),
                    "action": aty.action,
                    "description": aty.description,
                    "status": (
                        f"changed from {aty.old_status} to {aty.new_status}"
                        if aty.old_status and aty.new_status
                        else None
                    ),
                    "created_at": aty.created_at.astimezone(tz).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                    "pk": aty.pk,
                }
                for aty in TicketActivity.objects.filter(ticket=self).order_by(
                    "-created_at"
                )
            ]

            ticket_data = {
                "ticket_number": self.ticket_number,
                "reported_by": f"{self.user.role.name} : {self.user.username}: {self.user.firstname} {self.user.lastname}",
                "subject": self.subject,
                "description": self.description,
                "module_name": self.module_name,
                "ticket_type": self.ticket_type,
                "status": self.status,
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
                "created_at": self.created_at.astimezone(tz).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "jira_ticket_id": self.jira_ticket_id,
                "jira_ticket_url": self.jira_ticket_url,
                "jira_created_at": (
                    self.jira_created_at.strftime("%Y-%m-%d %H:%M:%S")
                    if self.jira_created_at
                    else None
                ),
                "attachments": attachments,
                "comments": comments,
                "activity": activity,
                "pk": self.pk,
            }
            return ticket_data
        except:
            return None

    def get_ticket_short_summary(self):
        """Return a short summary of the ticket"""
        try:
            tz = timezone.get_current_timezone()

            ticket_data = {
                "ticket_number": self.ticket_number,
                "reported_by": f"{self.user.role.name} : {self.user.username}: {self.user.firstname} {self.user.lastname}",
                "subject": self.subject,
                "module_name": self.module_name,
                "ticket_type": self.ticket_type,
                "status": self.status,
                "location": self.location.name if self.location else None,
                "site": self.site.name if self.site else None,
                "created_at": self.created_at.astimezone(tz).strftime(
                    "%Y-%m-%d %H:%M:%S"
                ),
                "pk": self.pk,
            }
            return ticket_data
        except:
            return None


class TicketAttachment(models.Model):
    ATTACHMENT_TYPE_CHOICES = [
        ("image", "Image"),
        ("video", "Video"),
    ]

    ticket = models.ForeignKey(
        SupportTicket, on_delete=models.CASCADE, related_name="attachments"
    )
    s3_file_key = models.CharField(max_length=500, help_text="S3 object key")
    file_type = models.CharField(max_length=10, choices=ATTACHMENT_TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ticket_attachments"
        ordering = ["uploaded_at"]
        indexes = [
            models.Index(fields=["ticket", "uploaded_at"], name="idx_ticket_uploaded"),
        ]

    def __str__(self):
        return f"{self.ticket.ticket_number} - {self.file_name}"


class TicketActivity(models.Model):
    """Log all activities on tickets for audit trail"""

    ticket = models.ForeignKey(
        SupportTicket, on_delete=models.CASCADE, related_name="activities"
    )
    user = models.ForeignKey(
        AccountUser, on_delete=models.SET_NULL, null=True, blank=True
    )
    action = models.CharField(max_length=50)
    description = models.TextField()
    old_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ticket_activities"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["ticket", "created_at"], name="idx_ticket_activity"),
            models.Index(fields=["user"], name="idx_activity_user"),
        ]

    def __str__(self):
        return f"{self.ticket.ticket_number} - {self.action}"


class TicketComment(models.Model):
    ticket = models.ForeignKey(
        SupportTicket, on_delete=models.CASCADE, related_name="comments"
    )
    user = models.ForeignKey(
        AccountUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ticket_comments",
    )
    comment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ticket_comments"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["ticket", "created_at"], name="idx_ticket_comments"),
            models.Index(fields=["user"], name="idx_comment_user"),
        ]

    def __str__(self):
        return f"{self.ticket.ticket_number} - Comment by {self.user}"
