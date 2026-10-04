from django.contrib import admin
from .models import Role, AccountUser


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(AccountUser)
class AccountUserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "firstname",
        "lastname",
        "username",
        "password",
        "otp",
        "email_id",
        "mobile_no",
        "role",
        "location",
        "site",
        "is_active",
    )
    list_filter = ("role", "location", "site", "is_active")
