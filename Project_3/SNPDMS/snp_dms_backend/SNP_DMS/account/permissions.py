from django.core.exceptions import PermissionDenied
from .models import AccountUser
from rest_framework import permissions


class allowOnlyAdmin(object):
    def __call__(self, f):
        def wrapper(self, request, *args, **kwargs):
            account_user = AccountUser.objects.get(user=request.user)
            if not account_user.role.name == "Admin":
                raise PermissionDenied
            return f(self, request, *args, **kwargs)

        return wrapper


class allowOnlyLocationAdmin(object):
    def __call__(self, f):
        def wrapper(self, request, *args, **kwargs):
            account_user = AccountUser.objects.get(user=request.user)
            if not account_user.role.name == "Location Admin":
                raise PermissionDenied
            return f(self, request, *args, **kwargs)

        return wrapper


class allowOnlySiteAdmin(object):
    def __call__(self, f):
        def wrapper(self, request, *args, **kwargs):
            account_user = AccountUser.objects.get(user=request.user)
            if not account_user.role.name == "Site Admin":
                raise PermissionDenied
            return f(self, request, *args, **kwargs)

        return wrapper


class allowOnlyDepotUser(object):
    def __call__(self, f):
        def wrapper(self, request, *args, **kwargs):
            account_user = AccountUser.objects.get(user=request.user)
            if not account_user.role.name == "Depot User":
                raise PermissionDenied
            return f(self, request, *args, **kwargs)

        return wrapper

        
class HasAllowedRoles(permissions.BasePermission):
    """
    Custom permission to allow access to users with specific roles.
    """

    def has_permission(self, request, view):
        allowed_roles = getattr(view, 'allowed_roles', [])
        try:
            account_user = AccountUser.objects.get(username=request.user)
            return account_user.role.name in allowed_roles
        except AccountUser.DoesNotExist:
            return False
        except Exception as e:
            raise PermissionDenied(f"An error occurred: {str(e)}")
        