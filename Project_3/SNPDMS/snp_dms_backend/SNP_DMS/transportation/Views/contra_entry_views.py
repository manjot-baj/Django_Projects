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
from transportation.models import ContraEntry, AccountMaster, TransactionLog

from account.permissions import HasAllowedRoles
class AddContraEntry(views.APIView):

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
                converted_data["entry_no"],
                converted_data["entry_date"],
                converted_data["account_debit"],
                converted_data["account_credit"],
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

            if (
                not AccountMaster.objects.filter(
                    name=converted_data["account_debit"],
                    location__name=converted_data["location"],
                    site__name=converted_data["site"],
                ).exists()
                or not AccountMaster.objects.filter(
                    name=converted_data["account_credit"],
                    location__name=converted_data["location"],
                    site__name=converted_data["site"],
                ).exists()
            ):
                return {"errorMsg": "Account Master Does not Exist"}
            
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

            entry_no = data["entry_no"]
            entry_date = datetime.datetime.strptime(
                data["entry_date"], "%Y-%m-%d"
            ).date()
            account_debit = AccountMaster.objects.get(
                name=data["account_debit"],
                location__name=data["location"],
                site__name=data["site"],
            )
            account_credit = AccountMaster.objects.get(
                name=data["account_credit"],
                location__name=data["location"],
                site__name=data["site"],
            )
            narration = data["narration"]
            amount = float(0)
            if data["amount"] is not None:
                amount = float(data["amount"])
            created_at = datetime.datetime.now().astimezone(
                timezone.get_current_timezone()
            )
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            if ContraEntry.checkEntryNo(entry_no, financial_year, location, site):
                return Response({"errorMsg": "Data Already exists"}, status=200)

            contra_entry = ContraEntry.create(
                entry_no=entry_no,
                financial_year=financial_year,
                entry_date=entry_date,
                account_debit=account_debit,
                account_credit=account_credit,
                narration=narration,
                amount=amount,
            )
            contra_entry.save()

            debit_log = TransactionLog.create(
                created_at=created_at,
                date=entry_date,
                vch_no=entry_no,
                vch_type="CONTRA",
                particular=None,
                creditor=None,
                customer=None,
                effect_on=account_debit,
                transaction_type="Debit",
                transaction_method="CASH",
                booking_id=None,
                invoice_id=None,
                payment_receipt_id=None,
                contra_id=contra_entry.pk,
                journal_id=None,
                amount=amount,
                location=location,
                site=site,
            )
            debit_log.save()
            credit_log = TransactionLog.create(
                created_at=created_at,
                date=entry_date,
                vch_no=entry_no,
                vch_type="CONTRA",
                particular=None,
                creditor=None,
                customer=None,
                effect_on=account_credit,
                transaction_type="Credit",
                transaction_method="CASH",
                booking_id=None,
                invoice_id=None,
                payment_receipt_id=None,
                contra_id=contra_entry.pk,
                journal_id=None,
                amount=amount,
                location=location,
                site=site,
            )
            credit_log.save()
            account_debit.total_balance = float(account_debit.total_balance) - amount
            account_debit.save()
            account_credit.total_balance = float(account_credit.total_balance) + amount
            account_credit.save()

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetContraEntry(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            contra_object = ContraEntry.objects.get(pk=pk)
            data = contra_object.get_contra_entry()
            return Response(data, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)


class GetAllContraEntry(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            from_date = data["from_date"]
            to_date = data["to_date"]
            location = data["location"]
            site = data["site"]
            filtered_data = None
            if location == "ALL":
                filtered_data = ContraEntry.objects.select_related(
                    "account_debit", "account_debit__location", "account_debit__site"
                )
            elif site == "ALL":
                filtered_data = ContraEntry.objects.select_related(
                    "account_debit", "account_debit__location", "account_debit__site"
                ).filter(account_debit__location__name=location)

            else:
                filtered_data = ContraEntry.objects.select_related(
                    "account_debit__location", "account_debit__site"
                ).filter(
                    account_debit__location__name=location,
                    account_debit__site__name=site,
                )

            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(
                    entry_date__range=(from_date, to_date)
                )

            response_data = [each.get_contra_entry() for each in filtered_data]
            return Response({"data": response_data}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeleteContraEntry(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            contra_entry = ContraEntry.objects.get(pk=pk)
            debit_acc = contra_entry.account_debit
            credit_acc = contra_entry.account_credit

            debit_acc.total_balance = float(debit_acc.total_balance) + float(
                contra_entry.amount
            )
            debit_acc.save()

            credit_acc.total_balance = float(credit_acc.total_balance) - float(
                contra_entry.amount
            )
            credit_acc.save()

            delete_logs = TransactionLog.objects.filter(contra_id=contra_entry.pk)
            if delete_logs.exists():
                delete_logs.delete()
            contra_entry.delete()
            return Response({"successMsg": "Data Deleted"}, status=200)
        except Exception:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
