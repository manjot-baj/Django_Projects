import re
from rest_framework import views
from rest_framework.response import Response
from .models import *
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_serializer import MyTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from .functions import *
from decouple import config
from django.db.models import Q
from django.db import connection
import logging, traceback
from account.permissions import HasAllowedRoles

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class ResetPassword(views.APIView):
    """This function is used to change password"""

    def post(self, request, *args, **kwargs):
        """this post function will change password"""

        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=400)
        try:
            data = request.data
            email_id = data["email_id"]
            password = data["password"]
            user = User.objects.get(email=email_id)
            user.password = password
            user.set_password(user.password)
            user.save()
            acc_user = AccountUser.objects.get(email_id=email_id)
            acc_user.password = password
            acc_user.save()
            return Response({"successMsg": "Password Reset is Completed"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Invalid credentials"}, status=400)


class AddRoleMaster(views.APIView):
    """
    The Post Function will create a new Role Entry.
    The Get Function will get all the entries of Role.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            all_objects = Role.objects.all()
            data_list = [each.get_role_display() for each in all_objects]
            return Response(data_list, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            if request.user.role.name == "Admin":
                data = request.data
                name = data["name"]
                if name == "":
                    name = None

                if Role.objects.filter(name=data["name"]).exists():
                    return Response({"errorMsg": "Role already exists"}, status=200)

                role_entry = Role.create(name=name)
                role_entry.save()
                return Response({"successMsg": "Data Saved"}, status=200)
            else:
                return Response(
                    {"errorMsg": "You don't have permission to add Role"}, status=403
                )
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class EditRoleMaster(views.APIView):
    """
    The Get Function will get a entry of Role.
    The Put Function will update a existing Country Role.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    def get(self, request, pk, *args, **kwargs):
        try:
            role_object = Role.objects.get(pk=pk)
            data = role_object.get_role_display()
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            if request.user.role.name == "Admin":
                data = request.data
                name = data["name"]
                if name == "":
                    name = None
                role_object = Role.objects.get(pk=pk)
                if (
                    Role.objects.exclude(pk=role_object.pk)
                    .filter(name=data["name"])
                    .exists()
                ):
                    return Response({"errorMsg": "Role already exists"}, status=200)
                role_object.name = data["name"]
                role_object.save()
                return Response({"successMsg": "Data Updated"}, status=200)
            else:
                return Response(
                    {"errorMsg": "You don't have permission to edit Role"}, status=403
                )
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteRoleMaster(views.APIView):
    """
    The Get Function will delete a entry of Role.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            for pk in data:
                role_object = Role.objects.get(pk=pk)
                dependent_list = [role_object.user_role_rel.exists()]
                if True not in dependent_list:
                    role_object.delete()
                else:
                    not_deleted.append(role_object.name)
            if not len(not_deleted) == 0:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=200,
                )
            return Response({"successMsg": "Data Deleted"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class AddUserMaster(views.APIView):
    """
    The Post Function will create a new User Entry.
    The Get Function will get all the entries of User.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    # def get(self, request, *args, **kwargs):
    #     try:
    #         account_user = AccountUser.objects.get(username=self.request.user.username)
    #         account_objects = None
    #         if account_user.role.name == "Admin":
    #             account_objects = AccountUser.objects.all().filter(is_active=True)
    #         elif account_user.role.name == "Location Admin":
    #             account_objects = AccountUser.objects.filter(
    #                 ~Q(role__name="Admin"),
    #                 location=account_user.location,
    #                 is_active=True,
    #             )
    #         elif account_user.role.name == "Site Admin":
    #             account_objects = AccountUser.objects.filter(
    #                 ~Q(role__name="Admin"),
    #                 ~Q(role__name="Location Admin"),
    #                 location=account_user.location,
    #                 site=account_user.site,
    #                 is_active=True,
    #             )
    #         elif account_user.role.name == "Depot User":
    #             account_objects = AccountUser.objects.filter(
    #                 ~Q(role__name="Admin"),
    #                 ~Q(role__name="Location Admin"),
    #                 ~Q(role__name="Site Admin"),
    #                 location=account_user.location,
    #                 site=account_user.site,
    #                 is_active=True,
    #             )
    #         else:
    #             pass
    #         data_list = [each.account_user_data() for each in account_objects]
    #         return Response(data_list, status=200)
    #     except Exception as e:
    #         return Response({"errorMsg": f"Data Not Found {e}"}, status=200)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            app_user = AccountUser.objects.get(username=request.user.username)
            organization = app_user.organization

            firstname = data["firstname"]
            lastname = data["lastname"]
            username = data["username"]
            try:
                User.object.get(username=username)
                return Response({"errorMsg": f"Username Already exists"}, status=200)
            except:
                pass

            password = data["password"]
            email_id = data["email_id"]
            try:
                User.object.get(email=email_id)
                return Response({"errorMsg": f"Email_id Already exists"}, status=200)
            except:
                pass

            mobile_no = data["mobile_no"]
            edi_track_notification = data["edi_track_notification"]
            role_name = data["role"]
            role = Role.objects.get(name=role_name)

            if data["location"] == "ALL":
                location = None
            else:
                location_name = data["location"]
                location = Location.objects.get(name=location_name)

            if data["site"] == "ALL":
                site = None
            else:
                site_name = data["site"]
                site = Site.objects.get(name=site_name)

            user_object = AccountUser(
                firstname=firstname,
                lastname=lastname,
                username=username,
                password=password,
                email_id=email_id,
                mobile_no=mobile_no,
                role=role,
                location=location,
                site=site,
                edi_track_notification=edi_track_notification,
                is_active=True,
                organization=organization,
            )
            user_object.save()
            # user_object.organization = organization
            # user_object.save()

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class EditUserMaster(views.APIView):
    """
    The Get Function will get a entry of User.
    The Put Function will update a existing Country User.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def get(self, request, pk, *args, **kwargs):
        try:
            user_object = AccountUser.objects.get(pk=pk)
            data = user_object.account_user_data()
            return Response(data, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data

            firstname = data["firstname"]
            lastname = data["lastname"]
            email_id = data["email_id"]
            try:
                User.object.get(email=email_id)
                return Response({"errorMsg": f"Email_id Already exists"}, status=200)
            except:
                pass
            mobile_no = data["mobile_no"]
            edi_track_notification = data["edi_track_notification"]
            role_name = data["role"]
            role = Role.objects.get(name=role_name)

            if data["location"] == "ALL":
                location = None
            else:
                location_name = data["location"]
                location = Location.objects.get(name=location_name)

            if data["site"] == "ALL":
                site = None
            else:
                site_name = data["site"]
                site = Site.objects.get(name=site_name)

            AccountUser.objects.filter(pk=pk).update(
                firstname=firstname,
                lastname=lastname,
                email_id=email_id,
                mobile_no=mobile_no,
                role=role,
                location=location,
                site=site,
                edi_track_notification=edi_track_notification,
                is_active=True,
            )
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteUserMaster(views.APIView):
    """
    The post Function will delete a entry of User.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            for pk in data:
                account_user_object = AccountUser.objects.get(pk=pk)
                user = User.objects.get(username=account_user_object.username)
                account_user_object.is_active = False
                account_user_object.save()
                user.is_active = False
                user.save()
            return Response({"successMsg": "User Account Deactivated"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class SendOtpEmail(views.APIView):
    """
    The Post Function will send otp on users given email address.
    """

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            email_id = data["email_id"]
            try:
                account_user = AccountUser.objects.get(email_id=email_id)
                otp = generate_otp()
                account_user.otp = otp
                account_user.save()
                a = send_otp_mail(
                    otp=otp, from_email=config("EMAIL_HOST_USER"), to_email=[email_id]
                )
                return Response({"successMsg": f"Otp Sent {otp}"}, status=200)
            except:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                return Response({"errorMsg": "Invalid email address"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Something went wrong"}, status=200)


class OtpVerification(views.APIView):
    """
    The Post Function will verify otp.
    """

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            email_id = data["email_id"]
            otp = data["otp"]
            try:
                account_user = AccountUser.objects.get(email_id=email_id)
                if otp == account_user.otp:
                    account_user.otp = None
                    account_user.save()
                    return Response({"successMsg": "Otp Verified"}, status=200)
                else:
                    account_user.otp = None
                    account_user.save()
                    return Response(
                        {"errorMsg": "Verification Expired. Retry"}, status=200
                    )
            except:
                error_log = logging.getLogger("error_log")
                error_log.error(traceback.format_exc())
                return Response({"errorMsg": "Invalid email address"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Something went wrong"}, status=200)


class GetAllUsers(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            account_user = AccountUser.objects.get(username=self.request.user.username)
            account_objects = None
            params = {}
            if request.data.get("username"):
                params["username"] = request.data.get("username")
            if request.data.get("role"):
                params["role__name"] = request.data.get("role")

            if account_user.role.name == "Admin":
                account_objects = AccountUser.objects.all().filter(is_active=True)
            elif account_user.role.name == "Location Admin":
                account_objects = AccountUser.objects.select_related("role").filter(
                    ~Q(role__name="Admin"),
                    location=account_user.location,
                    is_active=True,
                )
            elif account_user.role.name == "Site Admin":
                account_objects = AccountUser.objects.select_related("role").filter(
                    ~Q(role__name="Admin"),
                    ~Q(role__name="Location Admin"),
                    location=account_user.location,
                    site=account_user.site,
                    is_active=True,
                )
            elif account_user.role.name == "Depot User":
                account_objects = AccountUser.objects.select_related("role").filter(
                    ~Q(role__name="Admin"),
                    ~Q(role__name="Location Admin"),
                    ~Q(role__name="Site Admin"),
                    location=account_user.location,
                    site=account_user.site,
                    is_active=True,
                )
            # else:
            #     pass
            if params:
                account_objects = account_objects.filter(**params)
            data_list = [each.account_user_data() for each in account_objects]
            return Response(data_list, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
