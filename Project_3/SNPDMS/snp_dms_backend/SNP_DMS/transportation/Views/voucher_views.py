from django.shortcuts import render
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import *
from ..models import *
import datetime
import traceback
from common.functions import *
from django.utils import timezone
from django.core.paginator import Paginator
from billing_invoice.models import get_fiscal_year_date

from account.permissions import HasAllowedRoles
class AddPaymentReceiptMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            payment_receipt_type = data["payment_receipt_type"]
            entry_type = data["entry_type"]
            transaction = data["transaction"]
            entry_no = data["entry_no"]
            entry_date_str = data["entry_date"]
            if len(entry_date_str) == 0:
                entry_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                entry_date = datetime.datetime.strptime(
                    entry_date_str, "%Y-%m-%d"
                ).date()
            cheque_type = data["cheque_type"]
            category = data["category"]
            name = data["name"]
            truck_no = data["truck_no"]
            extra_charges = data["extra_charges"]
            narration = data["narration"]
            pay_remarks = data["pay_remarks"]
            recieve_given = data["recieve_given"]
            kasar = data["kasar"]
            tds = data["tds"]
            amount = data["amount"]
            if len(amount) == 0:
                amount = 0
            transaction_from = data["transaction_from"]
            booking_str = data["booking_lr_no"]
            if not len(booking_str) == 0:
                booking = BookingMaster.objects.get(lr_no=booking_str)
            else:
                booking = None
            location = data["location"]
            try:
                location_object = Location.objects.get(name=location)
            except:
                location_object = None

            site = data["site"]
            try:
                site_object = Site.objects.get(name=site)
            except:
                site_object = None
            f_year_start, f_year_end = get_fiscal_year_date()
            financial_year = (
                f"{str(f_year_start.year)[-2:]}-{str(f_year_end.year)[-2:]}"
            )

            pay_rec_entry = PaymentReceiptMaster.create(
                payment_receipt_type=payment_receipt_type,
                entry_type=entry_type,
                transaction=transaction,
                entry_no=entry_no,
                financial_year=financial_year,
                cheque_type=cheque_type,
                entry_date=entry_date,
                category=category,
                name=name,
                truck_no=truck_no,
                extra_charges=extra_charges,
                narration=narration,
                pay_remarks=pay_remarks,
                recieve_given=recieve_given,
                kasar=kasar,
                tds=tds,
                amount=amount,
                transaction_from=transaction_from,
                booking=booking,
                location=location_object,
                site=site_object,
            )
            pay_rec_entry.save()
            # line_obj = PaymentReceiptLine.create(
            #     against_bill=against_bill,
            #     ref=ref,
            #     due_amount=due_amount,
            #     recieve_given=recieve_given,
            #     kasar=kasar,
            #     tds=tds,
            # )
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)


class GetAllPaymentReceiptMaster(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            pg_no = data["pg_no"]
            on_page_data = data["on_page_data"]
            name = data["name"]
            from_date = data["from_date"]
            to_date = data["to_date"]
            location = data["location"]
            site = data["site"]

            if location == "ALL":
                filtered_data = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                )
            elif site == "ALL":
                filtered_data = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location)
            else:
                filtered_data = PaymentReceiptMaster.objects.select_related(
                    "location", "site"
                ).filter(location__name=location, site__name=site)
            if not len(name) == 0:
                filtered_data = filtered_data.filter(name=name)
            if not len(from_date) == 0 and not len(to_date) == 0:
                from_date = datetime.datetime.strptime(from_date, "%Y-%m-%d").date()
                to_date = datetime.datetime.strptime(to_date, "%Y-%m-%d").date()
                filtered_data = filtered_data.filter(
                    entry_date__range=(from_date, to_date)
                )

            paginator = Paginator(filtered_data, on_page_data)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            current_page = paginator.page(pg_no)
            on_page_data_count = (
                current_page.end_index() - current_page.start_index() + 1
            )
            prev_page = ""
            if current_page.has_previous():
                prev_page = current_page.previous_page_number()
            next_page = ""
            if current_page.has_next():
                next_page = current_page.next_page_number()
            response_data = [each.get_payment_receipt() for each in current_page]
            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": response_data,
                },
                status=200,
            )

        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class EditPaymentReceiptMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            customer_object = PaymentReceiptMaster.objects.get(pk=pk)
            data = customer_object.get_payment_receipt()
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
            payment_receipt_type = data["payment_receipt_type"]
            entry_type = data["entry_type"]
            transaction = data["transaction"]
            entry_no = data["entry_no"]
            cheque_type = data["cheque_type"]
            category = data["category"]
            name = data["name"]
            truck_no = data["truck_no"]
            extra_charges = data["extra_charges"]
            narration = data["narration"]
            pay_remarks = data["pay_remarks"]
            recieve_given = data["recieve_given"]
            kasar = data["kasar"]
            tds = data["tds"]
            amount = data["amount"]
            if len(amount) == 0:
                amount = 0
            transaction_from = data["transaction_from"]
            location = data["location"]
            try:
                location_object = Location.objects.get(name=location)
            except:
                location_object = None

            site = data["site"]
            try:
                site_object = Site.objects.get(name=site)
            except:
                site_object = None

            customer_object = PaymentReceiptMaster.objects.get(pk=pk)
            customer_object.payment_receipt_type = payment_receipt_type
            customer_object.entry_type = entry_type
            customer_object.transaction = transaction
            customer_object.entry_no = entry_no
            customer_object.cheque_type = cheque_type
            customer_object.category = category
            customer_object.name = name
            customer_object.truck_no = truck_no
            customer_object.extra_charges = extra_charges
            customer_object.narration = narration
            customer_object.pay_remarks = pay_remarks
            customer_object.recieve_given = recieve_given
            customer_object.kasar = kasar
            customer_object.tds = tds
            customer_object.amount = amount
            customer_object.transaction_from = transaction_from
            customer_object.location = location_object
            customer_object.site = site_object
            customer_object.save()
            return Response({"successMsg": "Data Updated"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)


class DeletePaymentReceiptMaster(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            for pk in data:
                pay_rec_obj = PaymentReceiptMaster.objects.get(pk=pk)
                pay_rec_obj.delete()
                return Response({"successMsg": "Data Deleted"}, status=200)
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
