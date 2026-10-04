import datetime, logging, traceback, os
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.permissions import HasAllowedRoles
from django.core.paginator import Paginator
from django.db.models import Q
import datetime
from depot.lolo_finance_models import (
    CustomerFinAccount,
    FinAccountTransaction,
)
from master.models import Location, Site
from master.models_two import Client
from SNP_DMS.settings.base import BASE_DIR
from django.http import HttpResponse
import pandas as pd
from openpyxl import load_workbook
from depot.lolo_finance_functions import extract_cust_fin_trans_excel_data
from django.db.models import Sum
from wkhtmltopdf.views import PDFTemplateResponse
import random


class CustomerFinAccountListAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            customer_name = request.data.get("client")
            location_name = request.data.get("location")
            site_name = request.data.get("site")
            with_gst = request.data.get("with_gst", None)

            filters = Q()
            if customer_name:
                filters &= Q(customer__name=customer_name)
            if location_name:
                filters &= Q(customer__location__name=location_name)
            if site_name:
                filters &= Q(customer__site__name=site_name)
            if with_gst is not None:
                filters &= Q(with_gst=with_gst)

            fin_account_qs = CustomerFinAccount.objects.filter(filters)

            # pagination
            paginator = Paginator(fin_account_qs, on_page_data)
            current_page = paginator.page(pg_no)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            on_page_data_count = current_page.object_list.count()
            prev_page = (
                current_page.previous_page_number()
                if current_page.has_previous()
                else None
            )
            next_page = (
                current_page.next_page_number() if current_page.has_next() else None
            )

            response_data = [
                {
                    **each.get_fin_account_data(),
                    "sr_no": current_page.start_index() + index,
                }
                for index, each in enumerate(current_page.object_list)
            ]

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
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class GetCustomerFinAccountBalanceAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def _get_customer(self, data):
        """
        Helper function to get client based on location, site, and client name.
        """
        location = Location.objects.get(name=data.get("location"))
        site = Site.objects.get(name=data.get("site"), location=location)
        return Client.objects.get(
            name=data.get("client"), type="Party", location=location, site=site
        )

    def post(self, request, *args, **kwargs):
        try:
            customer = self._get_customer(request.data)
            fin_account_obj = CustomerFinAccount.objects.get(customer=customer)
            fin_account_data = fin_account_obj.get_fin_account_data()
            return Response(fin_account_data, status=200)
        except CustomerFinAccount.DoesNotExist:
            return Response({"errorMsg": "Account record not found"}, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    def put(self, request, *args, **kwargs):
        try:
            customer = self._get_customer(request.data)
            with_gst = request.data.get("with_gst", True)
            fin_account_obj = CustomerFinAccount.objects.get(customer=customer)
            fin_account_obj.with_gst = with_gst
            fin_account_obj.save()
            return Response(
                {"success": "Account record updated successfully"}, status=200
            )
        except CustomerFinAccount.DoesNotExist:
            return Response({"errorMsg": "Account record not found"}, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class CustomerFinAccountAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def _get_customer(self, data):
        """
        Helper function to get client based on location, site, and client name.
        """
        location = Location.objects.get(name=data.get("location"))
        site = Site.objects.get(name=data.get("site"), location=location)
        return Client.objects.get(
            name=data.get("client"), type="Party", location=location, site=site
        )

    def _validate_payment_data(self, data):
        """
        Helper function to validate payment data fields and return the necessary values.
        """
        payment_type = data.get("payment_type")
        cheque_no = data.get("cheque_no", None)
        utr_no = data.get("utr_no", None)
        amount = data.get("amount")
        customer = self._get_customer(data)

        if amount <= 0:
            raise ValueError("Amount cannot be zero or negative")

        def validate_cheque_or_utr():
            nonlocal cheque_no, utr_no
            if not cheque_no and not utr_no:
                raise ValueError("Please fill cheque_no or utr_no")
            if cheque_no:
                utr_no = None
                if FinAccountTransaction.objects.filter(cheque_no=cheque_no).exists():
                    raise ValueError("Payment already exists with the given cheque_no")
            if utr_no:
                cheque_no = None
                if FinAccountTransaction.objects.filter(utr_no=utr_no).exists():
                    raise ValueError("Payment already exists with the given utr_no")

        if payment_type in ["Cheque", "NEFT", "RTGS"]:
            validate_cheque_or_utr()
        else:
            pass

        return (payment_type, cheque_no, utr_no, amount)

    def get(self, request, pk, *args, **kwargs):
        try:
            fin_account_obj = CustomerFinAccount.objects.get(pk=pk)
            fin_account_data = fin_account_obj.get_fin_account_trans_data()
            return Response(fin_account_data, status=200)
        except CustomerFinAccount.DoesNotExist:
            return Response({"errorMsg": "Payment record not found"}, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data

            # Validate input data
            payment_type, cheque_no, utr_no, amount = self._validate_payment_data(data)

            with transaction.atomic():
                customer = self._get_customer(data)
                account = None
                if CustomerFinAccount.objects.filter(customer=customer).exists():
                    account = CustomerFinAccount.objects.filter(
                        customer=customer
                    ).first()
                else:
                    account = CustomerFinAccount(customer=customer)
                    account.save()

                main_data = {
                    "account": account,
                    "cheque_no": cheque_no,
                    "utr_no": utr_no,
                    "bank_name": data.get("bank_name", ""),
                    "account_name": data.get("account_name", ""),
                    "account_no": data.get("account_no", ""),
                    "payment_type": payment_type,
                    "amount": amount,
                }
                FinAccountTransaction.credit_amount(**main_data)
                return Response({"successMsg": "Data Saved"}, status=200)

        except (Client.DoesNotExist, Location.DoesNotExist, Site.DoesNotExist):
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response(
                {"errorMsg": "Invalid client, location, or site details"}, status=200
            )
        except ValueError as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class DeleteCustomerFinAccountTransactionAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            if not FinAccountTransaction.objects.filter(
                pk=pk, transaction_type="Credit", linked_payment=None
            ).exists():
                return Response({"errorMsg": f"Transaction Not Found"}, status=200)

            transaction_obj = FinAccountTransaction.objects.get(
                pk=pk, transaction_type="Credit", linked_payment=None
            )
            if transaction_obj.account.balance >= transaction_obj.amount:
                transaction_obj.account.balance = float(
                    transaction_obj.account.balance
                ) - float(transaction_obj.amount)
                transaction_obj.account.save()
                transaction_obj.delete()
            else:
                return Response(
                    {
                        "errorMsg": "Cant Delete the Transaction, the balance is lower than the transaction amount"
                    },
                    status=200,
                )
            return Response({"successMsg": "Payment Deleted"}, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class DeleteCustomerFinAccountAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            fin_account = CustomerFinAccount.objects.get(pk=pk)

            if (
                fin_account.balance <= 0
                and not FinAccountTransaction.objects.filter(
                    transaction_type="Debit",
                    account=fin_account,
                ).exists()
            ):
                fin_account.delete()
            else:
                return Response(
                    {"errorMsg": "Cant Delete the fin account, account has dependency"},
                    status=200,
                )
            return Response({"successMsg": "Fin Account Deleted"}, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)


class CustFinTransBulkUploadAPIView(APIView):
    """
    Get Function will provide the sample file
    Post Function will upload the file
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, *args, **kwargs):
        try:
            file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_cust_fin_trans_upload.xlsx"
            )
            with open(file_path, "rb") as file:
                response = HttpResponse(file.read(), content_type="application/xlsx")
                response["Content-Disposition"] = (
                    'attachment; filename="sample_cust_fin_trans_upload.xlsx"'
                )
            return response
        except:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)

    def post(self, request, *args, **kwargs):
        file = request.data.get("file")
        location = Location.objects.get(name=request.data.get("location"))
        site = Site.objects.get(name=request.data.get("site"), location=location)
        try:
            result = extract_cust_fin_trans_excel_data(
                input_excel=file,
                location=location,
                site=site,
            )
            if result in ["Header Not Found", False]:
                return Response(
                    {"errorMsg": "Data file is corrupted, unable to import data"},
                    status=200,
                )
            return Response(result, status=200)
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": f"Invalid Data Provided [{e}]"}, status=200)


class CustFinTransBulkImportAPIView(APIView):
    """Post Function will Import the data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def _validate_payment_data(self, data):
        """
        Helper function to validate payment data fields and return the necessary values.
        """
        payment_type = data.get("payment_type")
        cheque_no = data.get("cheque_no", None)
        utr_no = data.get("utr_no", None)
        amount = data.get("amount")

        if amount <= 0:
            raise ValueError("Amount cannot be zero or negative")

        def validate_cheque_or_utr():
            nonlocal cheque_no, utr_no
            if not cheque_no and not utr_no:
                raise ValueError("Please fill cheque_no or utr_no")
            if cheque_no:
                utr_no = None
                if FinAccountTransaction.objects.filter(cheque_no=cheque_no).exists():
                    raise ValueError("Payment already exists with the given cheque_no")
            if utr_no:
                cheque_no = None
                if FinAccountTransaction.objects.filter(utr_no=utr_no).exists():
                    raise ValueError("Payment already exists with the given utr_no")

        if payment_type in ["Cheque", "NEFT", "RTGS"]:
            validate_cheque_or_utr()
        else:
            pass

        return (payment_type, cheque_no, utr_no, amount)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data_list = request.data["importable_data"]
            for data in data_list:
                with transaction.atomic():
                    location = Location.objects.get(name=request.data.get("location"))
                    site = Site.objects.get(
                        name=request.data.get("site"), location=location
                    )
                    client = Client.objects.get(
                        name=data.get("client"),
                        type="Party",
                        location=location,
                        site=site,
                    )
                    payment_type, cheque_no, utr_no, amount = (
                        self._validate_payment_data(data=data)
                    )

                    account = None
                    if CustomerFinAccount.objects.filter(customer=client).exists():
                        account = CustomerFinAccount.objects.filter(
                            customer=client
                        ).first()
                    else:
                        account = CustomerFinAccount(customer=client)
                        account.save()

                    main_data = {
                        "account": account,
                        "cheque_no": cheque_no,
                        "utr_no": utr_no,
                        "bank_name": data.get("bank_name", ""),
                        "account_name": data.get("account_name", ""),
                        "account_no": data.get("account_no", ""),
                        "payment_type": payment_type,
                        "amount": amount,
                    }
                    FinAccountTransaction.credit_amount(**main_data)

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"{e}"}, status=200)


class RejectedCustFinTransDataApiView(APIView):
    """Post Function will get excel with rejected cust_fin_trans data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data["rejected_data"]
            faults = request.data["faults"]
            df_data = {
                "client": [each["client"] for each in data],
                "payment_type": [each["payment_type"] for each in data],
                "cheque_no": [each["cheque_no"] for each in data],
                "utr_no": [each["utr_no"] for each in data],
                "bank_name": [each["bank_name"] for each in data],
                "account_name": [each["account_name"] for each in data],
                "account_no": [each["account_no"] for each in data],
                "amount": [each["amount"] for each in data],
            }

            faults_list = []
            for row, messages in faults.items():
                for msg in messages:
                    faults_list.append({"row": row, "message": msg})

            temp_dir = os.path.join(BASE_DIR, "temp/sample_stock/")
            os.makedirs(temp_dir, exist_ok=True)

            new_temp_file_path = os.path.join(
                temp_dir, "sample_cust_fin_trans_upload.xlsx"
            )
            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_cust_fin_trans_upload.xlsx"
            )

            with open(temp_file_path, "rb") as temp:
                old_temp_data = temp.read()

            with open(new_temp_file_path, "wb") as f:
                f.write(old_temp_data)

            book = load_workbook(new_temp_file_path)
            with pd.ExcelWriter(
                new_temp_file_path,
                engine="openpyxl",
                mode="a",
                if_sheet_exists="replace",
            ) as writer:

                stock_df = pd.DataFrame(df_data)
                stock_df.to_excel(writer, sheet_name="cust_fin_trans", index=False)

                faults_df = pd.DataFrame(faults_list)
                faults_df.to_excel(writer, sheet_name="faults", index=False)

            with open(new_temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_cust_fin_trans_upload.xlsx"'
                )
                os.remove(new_temp_file_path)
            return file_response

        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {str(e)} ]"}, status=200
            )


class CustomerFinAccountLedgerAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            customer_name = request.data.get("client")
            location_name = request.data.get("location")
            site_name = request.data.get("site")

            from_date = datetime.datetime.strptime(
                request.data.get("from_date"), "%Y-%m-%d"
            ).date()
            from_time = datetime.datetime.strptime("00:00", "%H:%M").time()

            to_date = datetime.datetime.strptime(
                request.data.get("to_date"), "%Y-%m-%d"
            ).date()
            to_time = datetime.datetime.strptime("23:59", "%H:%M").time()

            from_date_time = datetime.datetime.combine(from_date, from_time)
            to_date_time = datetime.datetime.combine(to_date, to_time)

            fin_account = CustomerFinAccount.objects.filter(
                customer__name=customer_name,
                customer__location__name=location_name,
                customer__site__name=site_name,
            ).first()

            # Opening
            earlier_transactions = FinAccountTransaction.objects.filter(
                account=fin_account, date__lt=from_date_time
            )

            earlier_credit_total = (
                earlier_transactions.filter(transaction_type="Credit").aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            earlier_debit_total = (
                earlier_transactions.filter(transaction_type="Debit").aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            opening_balance = 0
            if earlier_credit_total > earlier_debit_total:
                opening_balance = earlier_credit_total - earlier_debit_total
            else:
                opening_balance = earlier_debit_total - earlier_credit_total

            # Closing
            current_transactions = FinAccountTransaction.objects.filter(
                account=fin_account, date__range=(from_date_time, to_date_time)
            )

            current_credit_total = (
                current_transactions.filter(transaction_type="Credit").aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            current_debit_total = (
                current_transactions.filter(transaction_type="Debit").aggregate(
                    total=Sum("amount")
                )["total"]
                or 0
            )

            closing_balance = 0
            total_credit = opening_balance + current_credit_total
            if total_credit > current_debit_total:
                closing_balance = total_credit - current_debit_total
            else:
                closing_balance = current_debit_total - total_credit

            # data
            organization = fin_account.customer.site.organization
            site_address = fin_account.customer.site.address
            customer = fin_account.customer.name
            customer_address = fin_account.customer.office_address
            date_info = f'{from_date_time.date().strftime("%-d-%b-%y")} to {to_date_time.date().strftime("%-d-%b-%y")}'
            transactions = []
            for each in current_transactions:
                rows = each.get_ledger_trans_row_data()
                for row in rows:
                    transactions.append(row)
            context = {
                "organization": organization,
                "site_address": site_address,
                "customer": customer,
                "customer_address": customer_address,
                "date_info": date_info,
                "opening_balance": opening_balance,
                "transactions": transactions,
                "closing_balance": closing_balance,
                "total_credit": total_credit,
                "total_debit": current_debit_total,
                "grand_total_credit": total_credit,
                "grand_total_debit": closing_balance + current_debit_total,
            }

            # Generate PDF response
            response = PDFTemplateResponse(
                request=request,
                template="depot/client_fin_account_ledger.html",
                filename=f"client_fin_account_ledger_{random.randint(100000, 999999)}.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={"margin-top": 50},
            )
            return response
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)
