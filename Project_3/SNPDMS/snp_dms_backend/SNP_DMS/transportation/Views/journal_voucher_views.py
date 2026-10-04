# other imports
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging
import datetime
from django.utils import timezone
from billing_invoice.models import get_fiscal_year_date
from transportation.functions import check_alphabets

# model imports
from master.models import Location, Site
from transportation.models import JournalVoucher, TransactionLog, AccountMaster

from account.permissions import HasAllowedRoles
class AddJournalVoucher(views.APIView):

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
                converted_data["transaction"],
                converted_data["entry_no"],
                converted_data["entry_date"],
                converted_data["account_name"],
                converted_data["amount"],
                converted_data["location"],
                converted_data["site"],
            ]
            if (
                not Location.objects.filter(name=converted_data["location"]).exists()
                or not Site.objects.filter(name=converted_data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}

            if not check_alphabets(converted_data["amount"]):
                return {"errorMsg": "Amount accepts numbers only"}

            if float(converted_data["amount"]) <= float(0):
                return {"errorMsg": "Zero Amount is not valid"}

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

            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            entry_no = data["entry_no"]
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            if JournalVoucher.checkEntryNo(entry_no, financial_year, location, site):
                return Response({"errorMsg": "Data Already exists"}, status=200)

            transaction = data["transaction"]
            entry_date = datetime.datetime.strptime(
                data["entry_date"], "%Y-%m-%d"
            ).date()
            account_name = data["account_name"]
            under_account_name = data["under_account_name"]
            narration = data["narration"]
            amount = float(0)
            if data["amount"] is not None:
                amount = float(data["amount"])

            account = AccountMaster.objects.get(
                account_type="CASH_ON_HAND",
                location=location,
                site=site,
            )

            journal_obj = JournalVoucher.create(
                transaction=transaction,
                entry_no=entry_no,
                financial_year=financial_year,
                entry_date=entry_date,
                account_name=account_name,
                narration=narration,
                amount=amount,
                under_account_name=under_account_name,
                booking=None,
                location=location,
                site=site,
            )
            journal_obj.save()

            journal_log = TransactionLog.create(
                created_at=created_at,
                date=entry_date,
                vch_no=entry_no,
                vch_type="JOURNAL",
                particular=None,
                creditor=None,
                customer=None,
                effect_on=account,
                transaction_type="Debit",
                transaction_method="CASH",
                booking_id=None,
                invoice_id=None,
                payment_receipt_id=None,
                contra_id=None,
                journal_id=journal_obj.pk,
                amount=amount,
                location=location,
                site=site,
            )
            journal_log.save()

            account.total_balance = float(account.total_balance) - amount
            account.save()

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllJournalVoucher(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            transaction = data["transaction"]
            account_name = data["account_name"]
            from_date = data["from_date"]
            to_date = data["to_date"]
            location = data["location"]
            site = data["site"]
            filtered_data = None

            if location == "ALL":
                filtered_data = JournalVoucher.objects.select_related(
                    "location", "site"
                )
            elif site == "ALL":
                filtered_data = JournalVoucher.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = JournalVoucher.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)

            if not len(transaction) == 0:
                filtered_data = filtered_data.filter(transaction=transaction)
            if not len(account_name) == 0:
                filtered_data = filtered_data.filter(account_name=account_name)
            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(
                    entry_date__range=(from_date, to_date)
                )

            response_data = [each.get_journal_voucher() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class GetJournalVoucher(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            journal_object = JournalVoucher.objects.get(pk=pk)
            data = journal_object.get_journal_voucher()
            return Response(data, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class DeleteJournalVoucher(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            journal_obj = JournalVoucher.objects.get(pk=pk)
            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            account = AccountMaster.objects.get(
                account_type="CASH_ON_HAND",
                location=journal_obj.location,
                site=journal_obj.site,
            )
            if account is None:
                return Response({"errorMsg": "Account Does Not Exists"}, status=200)

            account.total_balance = float(account.total_balance) + float(
                journal_obj.amount
            )
            account.save()
            delete_log = TransactionLog.objects.filter(journal_id=journal_obj.pk)
            if delete_log.exists():
                delete_log.delete()
            journal_obj.delete()

            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
