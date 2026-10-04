from django.db import models
from master.models import Location, Site
from django.contrib.auth.models import User
from decouple import config
import logging, traceback


class Role(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False)

    def __str__(self):
        return self.name

    @classmethod
    def create(cls, name):
        try:
            role = cls(name=name)
            return role
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_role(self):
        try:
            return self.name
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None

    def get_role_display(self):
        try:
            return {"pk": self.pk, "name": self.name}
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None


class AccountUser(models.Model):
    firstname = models.CharField(max_length=200, null=True, blank=False)
    lastname = models.CharField(max_length=200, null=True, blank=False)
    username = models.CharField(max_length=200, null=True, blank=False)
    password = models.CharField(max_length=200, null=True, blank=False)
    otp = models.CharField(max_length=10, null=True, blank=True)
    email_id = models.CharField(max_length=200, null=True, blank=True)
    mobile_no = models.CharField(max_length=12, null=True, blank=True)
    role = models.ForeignKey(
        Role,
        related_name="user_role_rel",
        null=True,
        blank=False,
        on_delete=models.CASCADE,
    )
    location = models.ForeignKey(
        Location,
        related_name="user_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="user_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    organization = models.CharField(max_length=200, null=True, blank=True)
    edi_track_notification = models.BooleanField(null=True, blank=True, default=False)
    is_active = models.BooleanField(null=True, blank=True, default=True)

    def __str__(self):
        return self.username
    
    class Meta:
        indexes = [
            models.Index(
                fields=["username"], name="idx_acc_username"
            ),
            models.Index(
                fields=["location_id", "site_id"],
                name="idx_acc_location_site",
            ),
        ]

    def save(
        self, force_insert=False, force_update=False, using=None, update_fields=None
    ):
        if self.pk is None:
            user_obj = User.objects.create_user(
                username=self.username,
                password=self.password,
                is_staff=True,
                email=self.email_id,
                first_name=self.firstname,
                last_name=self.lastname,
            )
            user_obj.save()
            user_data = list(User.objects.filter(username=user_obj).values("pk"))
            user_data[0].get("pk")
            self.user_id = user_data[0].get("pk")
            register = super(AccountUser, self).save(
                force_insert=False, force_update=False, update_fields=None
            )
        else:
            register = super(AccountUser, self).save(
                force_insert=False, force_update=False, update_fields=None
            )
        return register

    def account_user_data(self):
        try:
            data = {
                "pk": self.pk,
                "firstname": self.firstname,
                "lastname": self.lastname,
                "username": self.username,
                "role": self.role.name,
                "email_id": self.email_id,
                "mobile_no": self.mobile_no,
                "edi_track_notification": self.edi_track_notification,
                "is_active": self.is_active,
            }
            if self.location is None:
                data["location"] = ""
            else:
                data["location"] = self.location.name
            if self.site is None:
                data["site"] = ""
            else:
                data["site"] = self.site.name
            return data
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
