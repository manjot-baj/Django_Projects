from django.db import models


class AdhocReportRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Processing", "Processing"),
        ("Completed", "Completed"),
        ("Failed", "Failed"),
    ]

    REPORT_TYPES = [
        ("MNR Repo Movement Report", "MNR Repo Movement Report"),
        ("MNR Material Usage Report", "MNR Material Usage Report"),
        ("Volume Tues Report", "Volume Tues Report"),
        ("Provisional Bill Report", "Provisional Bill Report"),
    ]

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    from_date = models.DateField()
    to_date = models.DateField()
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    email_sent = models.BooleanField(default=False)
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    site = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return str(self.pk)
