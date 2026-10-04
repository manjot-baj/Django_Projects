# other imports
import os
from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from transportation.functions import *
from transportation.xlsx_function import *
import traceback, logging, datetime


# model Imports
from master.models import Location, Site
from transportation.models import CreditorMaster, CustomerMaster, AccountMaster

from account.permissions import HasAllowedRoles
class Report(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def validate_data(self, data):
        try:
            mandatory_list = [
                data["location"],
                data["site"],
            ]
            if (
                not Location.objects.filter(name=data["location"]).exists()
                or not Site.objects.filter(name=data["site"]).exists()
                or None in mandatory_list
            ):
                return {"errorMsg": "Please Provide Mandatory Data"}
            return data
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
            from_date = datetime.datetime.strptime(data["from_date"], "%Y-%m-%d").date()
            to_date = datetime.datetime.strptime(data["to_date"], "%Y-%m-%d").date()
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            user_data_dict = user_data(location=location, site=site)
            customer = None
            creditor = None
            account = None

            if not len(data["account"]) == 0:
                account = AccountMaster.objects.get(
                    name=data["account"],
                    location=location,
                    site=site,
                )
            if not len(data["customer"]) == 0:
                customer = CustomerMaster.objects.get(
                    name=data["customer"],
                    location=location,
                    site=site,
                )
            if not len(data["creditor"]) == 0:
                creditor = CreditorMaster.objects.get(
                    name=data["creditor"],
                    location=location,
                    site=site,
                )

            if data["report_type"] == "Daily Creditor Report":
                booking_data_list = creditor_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    creditor=creditor,
                    location=location,
                    site=site,
                )

                booking_df_data = creditor_main_data(data_object_list=booking_data_list)
                temp_file_path, date_str = create_creditor_wise_daily_report_wb(
                    user_data=user_data_dict,
                    creditor=creditor,
                    booking_df_data=booking_df_data,
                    from_date=from_date,
                    to_date=to_date,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="creditor_wise_report_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Creditor Ledger Bill Wise":
                creditor_bill_data_list = get_creditor_against_bill_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    creditor=creditor,
                    location=location,
                    site=site,
                )
                creditor_bill_df_data = get_creditor_against_bill_main_data(
                    data_object_list=creditor_bill_data_list
                )
                temp_file_path, date_str = create_creditor_against_bill_ledger_wb(
                    user_data=user_data_dict,
                    creditor=creditor,
                    creditor_bill_df_data=creditor_bill_df_data,
                    from_date=from_date,
                    to_date=to_date,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="creditor_ledger_billwise_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Creditor Balance Ledger":
                creditor_bill_data_list = get_creditor_against_bill_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    creditor=creditor,
                    location=location,
                    site=site,
                    balance=True,
                )
                creditor_bill_df_data = get_creditor_against_bill_main_data(
                    data_object_list=creditor_bill_data_list
                )
                temp_file_path = create_all_creditor_balance_ledger_wb(
                    user_data=user_data_dict,
                    creditor=creditor,
                    creditor_bill_df_data=creditor_bill_df_data,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="creditor_balance_ledger_{creditor.name}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Customer Ledger Bill Wise":
                customer_bill_data_list = get_customer_against_bill_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    customer=customer,
                    location=location,
                    site=site,
                    balance=False,
                )
                customer_bill_df_data = get_customer_against_bill_main_data(
                    data_object_list=customer_bill_data_list
                )
                temp_file_path, date_str = create_customer_against_bill_ledger_wb(
                    user_data=user_data_dict,
                    customer=customer,
                    customer_bill_df_data=customer_bill_df_data,
                    from_date=from_date,
                    to_date=to_date,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="customer_ledger_billwise_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Customer Balance Ledger":
                customer_bill_data_list = get_customer_against_bill_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    customer=customer,
                    location=location,
                    site=site,
                    balance=True,
                )
                customer_bill_df_data = get_customer_against_bill_main_data(
                    data_object_list=customer_bill_data_list
                )
                temp_file_path = create_all_customer_balance_ledger_wb(
                    user_data=user_data_dict,
                    customer=customer,
                    customer_bill_df_data=customer_bill_df_data,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="customer_balance_ledger_{customer.name}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Daily Booking Report":
                booking_data_list = booking_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    location=location,
                    site=site,
                )
                booking_df_data = booking_main_data(data_object_list=booking_data_list)

                temp_file_path, date_str = create_booking_daily_report_wb(
                    user_data=user_data_dict,
                    booking_df_data=booking_df_data,
                    from_date=from_date,
                    to_date=to_date,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="daily_booking_report_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Customer Ledger":
                (
                    opening_balance_object_list,
                    ledger_object_list,
                ) = get_ledger_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    location=location,
                    site=site,
                    customer=customer,
                )
                ledger_df_data = get_ledger_main_data(
                    from_date=from_date,
                    opening_balance_object_list=opening_balance_object_list,
                    ledger_object_list=ledger_object_list,
                    ledger_type=data["report_type"],
                )

                temp_file_path, date_str = create_ledger_wb(
                    user_data=user_data_dict,
                    from_date=from_date,
                    to_date=to_date,
                    entity=customer,
                    ledger_df_data=ledger_df_data,
                    ledger_type=data["report_type"],
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="ledger_report_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Creditor Ledger":
                (
                    opening_balance_object_list,
                    ledger_object_list,
                ) = get_ledger_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    location=location,
                    site=site,
                    creditor=creditor,
                )
                ledger_df_data = get_ledger_main_data(
                    from_date=from_date,
                    opening_balance_object_list=opening_balance_object_list,
                    ledger_object_list=ledger_object_list,
                    ledger_type=data["report_type"],
                )

                temp_file_path, date_str = create_ledger_wb(
                    user_data=user_data_dict,
                    from_date=from_date,
                    to_date=to_date,
                    entity=creditor,
                    ledger_df_data=ledger_df_data,
                    ledger_type=data["report_type"],
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="ledger_report_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

            elif data["report_type"] == "Account Ledger":
                (
                    opening_balance_object_list,
                    ledger_object_list,
                ) = get_ledger_data_object_list(
                    from_date=from_date,
                    to_date=to_date,
                    location=location,
                    site=site,
                    account=account,
                )
                ledger_df_data = get_ledger_main_data(
                    from_date=from_date,
                    opening_balance_object_list=opening_balance_object_list,
                    ledger_object_list=ledger_object_list,
                    ledger_type=data["report_type"],
                )

                temp_file_path, date_str = create_ledger_wb(
                    user_data=user_data_dict,
                    from_date=from_date,
                    to_date=to_date,
                    entity=account,
                    ledger_df_data=ledger_df_data,
                    ledger_type=data["report_type"],
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response[
                        "Content-Disposition"
                    ] = f'attachment; filename="ledger_report_{date_str}.xlsx"'
                    os.remove(temp_file_path)
                return file_response

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
