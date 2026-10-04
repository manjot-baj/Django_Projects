# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone
from transportation.functions import validate_email

# model imports
from master.models import Location, Site
from transportation.models import AccountMaster, TransactionLog
from account.permissions import HasAllowedRoles

class AddAccountMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["account_type"],
                converted_data["name"],
                converted_data["location"],
                converted_data["site"],
            ]
            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}
            if (
                converted_data["account_type"] == "CASH_ON_HAND"
                and AccountMaster.objects.filter(
                    account_type=converted_data["account_type"],
                    location__name=converted_data["location"],
                    site__name=converted_data["site"],
                ).exists()
            ):
                return {"errorMsg": "CASH_ON_HAND Account Already exists"}

            if AccountMaster.objects.filter(
                account_type=converted_data["account_type"],
                name=converted_data["name"],
                location__name=converted_data["location"],
                site__name=converted_data["site"],
            ).exists():
                return {"errorMsg": "Account Already exists"}

            if converted_data["email_id"] and not validate_email(
                converted_data["email_id"]
            ):
                return {"errorMsg": "Email is not valid"}

            if float(converted_data["total_balance"]) < float(0):
                return {"errorMsg": "Balance should not be negative"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = self.validate_data(request.data)
            if "errorMsg" in data.keys():
                return Response(data, status=200)

            name = data["name"]
            account_type = data["account_type"]
            address = data["address"]
            contact_no = data["contact_no"]
            email_id = data["email_id"]

            remarks = data["remarks"]

            total_balance = float(0)
            if data["total_balance"] is not None:
                total_balance = data["total_balance"]

            location_object = Location.objects.get(name=data["location"])
            site_object = Site.objects.get(name=data["site"])

            accounts_entry = AccountMaster.create(
                name=name,
                account_type=account_type,
                address=address,
                contact_no=contact_no,
                email_id=email_id,
                remarks=remarks,
                total_balance=total_balance,
                location=location_object,
                site=site_object,
            )
            accounts_entry.save()
            logs = TransactionLog.create(
                created_at=datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                ),
                date=datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                ),
                vch_no=None,
                vch_type="JOURNAL",
                particular=None,
                creditor=None,
                customer=None,
                effect_on=accounts_entry,
                transaction_type="Credit",
                transaction_method="CASH",
                booking_id=None,
                invoice_id=None,
                payment_receipt_id=None,
                contra_id=None,
                journal_id=None,
                amount=total_balance,
                location=location_object,
                site=site_object,
                account_id=accounts_entry.pk,
            )
            logs.save()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllAccountMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            location = data["location"]
            site = data["site"]
            name = data["name"]
            account_type = data["account_type"]
            filtered_data = None

            if location == "ALL":
                filtered_data = AccountMaster.objects.select_related("location", "site")
            elif site == "ALL":
                filtered_data = AccountMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = AccountMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if len(name) != 0:
                filtered_data = filtered_data.filter(name=name)

            if len(account_type) != 0:
                filtered_data = filtered_data.filter(account_type=account_type)

            response_data = [each.get_account() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditAccountMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def empty_str_to_none(self, items):
        return {
            each: None if len(str(items[each])) == 0 else str(items[each])
            for each in items
        }

    def validate_data(self, data):
        try:
            converted_data = self.empty_str_to_none(data)
            mandatory_list = [
                converted_data["account_type"],
                converted_data["name"],
                converted_data["location"],
                converted_data["site"],
            ]
            account_object = AccountMaster.objects.get(pk=converted_data["pk"])

            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if (
                account_object.account_type != converted_data["account_type"]
                and AccountMaster.objects.filter(
                    account_type="CASH_ON_HAND",
                    location__name=converted_data["location"],
                    site__name=converted_data["site"],
                ).exists()
            ):
                return {"errorMsg": "CASH_ON_HAND Account Already exists"}

            if (
                account_object.name != converted_data["name"]
                or account_object.account_type != converted_data["account_type"]
                or account_object.location.name != converted_data["location"]
                or account_object.site.name != converted_data["site"]
            ) and AccountMaster.objects.filter(
                account_type=converted_data["account_type"],
                name=converted_data["name"],
                location__name=converted_data["location"],
                site__name=converted_data["site"],
            ).exists():
                return {"errorMsg": "Account Already exists"}

            if float(converted_data["total_balance"]) < float(0):
                return {"errorMsg": "Balance should not be negative"}

            return converted_data
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return {"errorMsg": f"Invalid credentials [{e}]"}

    def get(self, request, pk, *args, **kwargs):
        try:
            account_object = AccountMaster.objects.get(pk=pk)
            data = account_object.get_account()
            return Response(data, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def put(self, request, pk, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = self.validate_data(request.data)
            if "errorMsg" in data.keys():
                return Response(data, status=200)

            name = data["name"]
            account_type = data["account_type"]
            address = data["address"]
            contact_no = data["contact_no"]
            email_id = data["email_id"]
            remarks = data["remarks"]

            total_balance = float(0)
            if data["total_balance"] is not None:
                total_balance = data["total_balance"]

            location_object = Location.objects.get(name=data["location"])
            site_object = Site.objects.get(name=data["site"])

            account_object = AccountMaster.objects.get(pk=pk)

            if float(account_object.total_balance) > float(total_balance):
                return Response(
                    {"errorMsg": "Please Add Amount more than previous amount"},
                    status=200,
                )

            previous_balance = account_object.total_balance

            account_object.name = name
            account_object.account_type = account_type
            account_object.address = address
            account_object.contact_no = contact_no
            account_object.email_id = email_id
            account_object.remarks = remarks
            account_object.total_balance = total_balance
            account_object.location = location_object
            account_object.site = site_object
            account_object.save()
            logs = TransactionLog.create(
                created_at=datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                ),
                date=datetime.datetime.now().astimezone(
                    timezone.get_current_timezone()
                ),
                vch_no=None,
                vch_type="JOURNAL",
                particular=None,
                creditor=None,
                customer=None,
                effect_on=account_object,
                transaction_type="Credit",
                transaction_method="CASH",
                booking_id=None,
                invoice_id=None,
                payment_receipt_id=None,
                contra_id=None,
                journal_id=None,
                amount=float(total_balance) - float(previous_balance),
                location=location_object,
                site=site_object,
                account_id=account_object.pk,
            )
            logs.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteAccountMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            not_deleted = []
            for pk in data:
                account_object = AccountMaster.objects.get(pk=pk)
                delete_logs = TransactionLog.objects.filter(
                    account_id=account_object.pk
                )
                dependent_list = [
                    account_object.payment_receipt_account_rel.exists(),
                    account_object.contra_entry_account_debit_rel.exists(),
                    account_object.contra_entry_account_credit_rel.exists(),
                ]
                if True not in dependent_list:
                    delete_logs = TransactionLog.objects.filter(
                        account_id=account_object.pk
                    )
                    if delete_logs.exists():
                        delete_logs.delete()
                    account_object.delete()
                else:
                    not_deleted.append(account_object.name)
            if not len(not_deleted) == 0:
                return Response(
                    {"errorMsg": f"Can't Delete {not_deleted}, data have dependencies"},
                    status=200,
                )
            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
