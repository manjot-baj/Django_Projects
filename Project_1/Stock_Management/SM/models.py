from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    create_date = models.DateTimeField(default=timezone.now, null=True, blank=True, editable=False)
    write_date = models.DateTimeField(default=timezone.now, null=True, blank=True, editable=False)
    create_user = models.ForeignKey(
        User, related_name='created_by_%(app_label)s_%(class)s_related',
        on_delete=models.SET_NULL, null=True, editable=False)
    write_user = models.ForeignKey(
        User, related_name='written_by_%(app_label)s_%(class)s_related',
        on_delete=models.SET_NULL, null=True, editable=False)

    class Meta:
        abstract = True

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        return super(BaseModel, self).save(force_insert=False, force_update=False, using=None, update_fields=None)
