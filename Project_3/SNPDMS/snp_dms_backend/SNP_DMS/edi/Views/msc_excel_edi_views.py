from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from account.permissions import HasAllowedRoles
import logging, traceback
from edi.models import MscExcelEdiFTPCredential, MscExcelEdiEmail


class AddUpdateMscExcelEdiFTPCredential(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            site = data.get("site")
            ftp_username = data.get("username")
            ftp_password = data.get("password")
            email_list = data.get("email_list", [])
            if not MscExcelEdiFTPCredential.objects.filter(site=site).exists():
                MscExcelEdiFTPCredential(
                    site=site,
                    ftp_username=ftp_username,
                    ftp_password=ftp_password,
                ).save()
            else:
                MscExcelEdiFTPCredential.objects.filter(site=site).update(
                    ftp_username=ftp_username,
                    ftp_password=ftp_password,
                )
            parent_obj = MscExcelEdiFTPCredential.objects.get(
                site=site, is_disabled=False
            )
            MscExcelEdiEmail.objects.filter(parent=parent_obj).delete()
            for email in email_list:
                MscExcelEdiEmail.objects.get_or_create(
                    parent=parent_obj,
                    email=email,
                )
            return Response(
                {"successMsg": "Credentials saved successfully"}, status=200
            )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)


class ListMscExcelEdiFTPCredentials(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def get(self, request, *args, **kwargs):
        try:
            credentials = {}
            objs = MscExcelEdiFTPCredential.objects.filter(is_disabled=False)
            for obj in objs:
                emails = MscExcelEdiEmail.objects.filter(parent=obj).values_list(
                    "email", flat=True
                )

                credentials.update(
                    {
                        obj.site: {
                            "username": obj.ftp_username,
                            "password": obj.ftp_password,
                            "email_list": list(emails),
                        }
                    }
                )
            return Response(credentials, status=200)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)
