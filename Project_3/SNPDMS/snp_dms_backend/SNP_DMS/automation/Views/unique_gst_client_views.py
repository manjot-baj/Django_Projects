import datetime
import logging
import traceback
import openpyxl
import xlsxwriter
import os
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.permissions import HasAllowedRoles
from SNP_DMS.settings.base import BASE_DIR
from django.http import HttpResponse
import pandas as pd
from openpyxl import load_workbook

from master.models import Location, Site
from master.models_two import Client
from common.exceptions import ValidationError
from rest_framework import status


class UniqueGstClientCleanUploadView(APIView):
    """
    Post Function will upload the file
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def unique_gst_client_clean_upload_func(self, input_excel, location, site):
        try:
            # Load workbook and sheet
            ps = openpyxl.load_workbook(input_excel)
            sheet = ps["clients"]
            headers = [
                "name",
                "type",
                "gst_no",
                "required Y/N ",
            ]

            # Extract raw data and clean it
            raw_data = {
                header: [
                    sheet[f"{chr(65 + i)}{row}"].value
                    for row in range(2, sheet.max_row + 1)
                ]
                for i, header in enumerate(headers)
            }

            # Clean None values from the data
            cleaned_data = {
                key: [val for val in values if val is not None]
                for key, values in raw_data.items()
            }

            # Extract and structure data

            extracted_data_list = [
                {
                    "sr_no": str(i + 1),
                    "name": str(cleaned_data["name"][i]),
                    "type": str(cleaned_data["type"][i]),
                    "gst_no": str(cleaned_data["gst_no"][i]),
                    "required": str(cleaned_data["required Y/N "][i]),
                }
                for i in range(len(cleaned_data["name"]))
            ]

            # Initialize error handling
            error_data_msg, correct_data = {}, {}

            # Validate each extracted data row
            for each in extracted_data_list:
                error_msg = []
                row_number = f"row {str(int(each['sr_no']) + 1)}"
                client_name = each["name"]
                required = each["required"]
                gst_no = each["gst_no"]

                #   Client
                if (
                    not Client.objects.select_related("location", "site")
                    .filter(
                        name=client_name, location=location, site=site, type="Party"
                    )
                    .exists()
                ):
                    error_msg.append(
                        f"In {row_number} client not found in system database"
                    )

                if required == "N":

                    # GST Validation
                    if gst_no == "_":
                        error_msg.append(
                            f"In {row_number} gst_no is None, cannot delete Client"
                        )
                    # else:
                    #     if (
                    #         Client.objects.select_related("location", "site")
                    #         .filter(
                    #             gst_no=gst_no,
                    #             location=location,
                    #             site=site,
                    #             type="Party",
                    #         )
                    #         .exists()
                    #     ):
                    #         error_msg.append(
                    #             f"In {row_number} client with same gst no exists in system database"
                    #         )

                    results = [
                        item
                        for item in extracted_data_list
                        if item["required"] == "Y" and item["gst_no"] == gst_no
                    ]

                    # Only one Ideal Client Validation
                    if len(results) == 0 or len(results) > 1:
                        error_msg.append(
                            f"In {row_number} required 1 'Y' Client for {client_name} with {gst_no}, cannot delete Client"
                        )

                    else:
                        ideal_client = results[0]
                        if len(error_msg) == 0:
                            # Same ideal client already exists
                            if ideal_client["sr_no"] in correct_data.keys():
                                correct_data[ideal_client["sr_no"]]["deletable"].append(
                                    each
                                )
                            else:
                                # Check if another ideal client already has same GST
                                duplicate_gst = any(
                                    data["gst_no"] == ideal_client["gst_no"]
                                    and data["sr_no"] != ideal_client["sr_no"]
                                    for data in correct_data.values()
                                )

                                if duplicate_gst:
                                    error_msg.append(
                                        f"In {row_number} gst_no {ideal_client['gst_no']} is duplicated for ideal clients"
                                    )
                                else:
                                    ideal_client["deletable"] = [each]
                                    correct_data[ideal_client["sr_no"]] = ideal_client

                    # Append errors msg
                    if not len(error_msg) == 0:
                        error_data_msg[row_number] = error_msg

                else:
                    pass

            faults_exists = False
            if not len(error_data_msg) == 0:
                faults_exists = True

            # Return final data
            return {
                "correct_data": correct_data,
                "faults": error_data_msg,
                "faults_exists": faults_exists,
            }
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return False

    def post(self, request, *args, **kwargs):
        file = request.data.get("file")
        location = Location.objects.get(name=request.data.get("location"))
        site = Site.objects.get(name=request.data.get("site"), location=location)
        try:
            result = self.unique_gst_client_clean_upload_func(
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


class UniqueGstClientCleanRejectView(APIView):
    """Post Function will get excel with rejected data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            faults = request.data["faults"]

            faults_list = []
            for row, messages in faults.items():
                for msg in messages:
                    faults_list.append({"row": row, "message": msg})

            dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
            date = dt.date().strftime("%Y%m%d")
            time = dt.time().strftime("%H%M%S")
            temp_file_path = os.path.join(
                BASE_DIR, f"temp/client_report_faults_{date}{time}.xlsx"
            )
            generic_workbook = xlsxwriter.Workbook(temp_file_path)
            generic_workbook.add_worksheet(f"faults")
            generic_workbook.close()

            book = load_workbook(temp_file_path)
            with pd.ExcelWriter(
                temp_file_path,
                engine="openpyxl",
                mode="a",
                if_sheet_exists="replace",
            ) as writer:

                faults_df = pd.DataFrame(faults_list)
                faults_df.to_excel(writer, sheet_name="faults", index=False)

            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="temp/client_report_faults_{date}{time}.xlsx"'
                )
                os.remove(temp_file_path)
            return file_response

        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {str(e)} ]"}, status=200
            )


class UniqueGstClientCleanProcessView(APIView):
    """Post Function will get excel with rejected data"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            correct_data = request.data["correct_data"]
            location = Location.objects.get(name=request.data.get("location"))
            site = Site.objects.get(name=request.data.get("site"), location=location)
            for each_key in correct_data:
                with transaction.atomic():
                    ideal_client_name = correct_data[each_key]["name"]
                    ideal_client_gst_no = correct_data[each_key]["gst_no"]
                    ideal_client = (
                        Client.objects.select_related("location", "site")
                        .filter(
                            name=ideal_client_name,
                            location=location,
                            site=site,
                            type="Party",
                        )
                        .first()
                    )
                    # ideal_client.gst_no = ideal_client_gst_no
                    # ideal_client.save()

                    deletable_client_list = correct_data[each_key]["deletable"]
                    for each_data in deletable_client_list:
                        del_client_name = each_data["name"]
                        del_clients = Client.objects.select_related(
                            "location", "site"
                        ).filter(
                            name=del_client_name,
                            location=location,
                            site=site,
                            type="Party",
                        )

                        for del_client in del_clients:

                            del_client.container_client_rel.update(client=ideal_client)

                            del_client.handling_client_rel.update(
                                customer_name=ideal_client
                            )

                            del_client.self_transportation_client_rel.update(
                                customer_name=ideal_client
                            )

                            del_client.customer_bill_client_rel.update(
                                client=ideal_client
                            )

                            del_client.customer_bill_customer_rel.update(
                                customer=ideal_client
                            )

                            del_client.client_customer_bill_invoice_rel.update(
                                client=ideal_client
                            )

                            del_client.client_parent_child_company_rel.update(
                                parent=ideal_client
                            )

                            del_client.non_depot_container_client_rel.update(
                                client=ideal_client
                            )

                            del_client.adv_handling_payment_client_rel.update(
                                client=ideal_client
                            )
                            del_client.pre_gatein_client_rel.update(client=ideal_client)

                            del_client.client_representative_rel.update(
                                client=ideal_client
                            )

                            del_client.client_document_rel.update(client=ideal_client)

                            del_client.client_handling_charge_rel.update(
                                client=ideal_client
                            )

                            del_client.client_transportation_charge_rel.update(
                                client=ideal_client
                            )

                            # if hasattr(del_client, "fin_account_customer") is True:
                            #     fin_account = del_client.fin_account_customer
                            #     if hasattr(ideal_client, "fin_account_customer") is False:
                            #         fin_account.customer = ideal_client
                            #         fin_account.save(update_fields=["customer"])
                            #     else:
                            #         fin_account.delete()

                            has_dependency = any(
                                [
                                    del_client.customer_bill_client_rel.exists(),
                                    del_client.customer_bill_customer_rel.exists(),
                                    del_client.client_customer_bill_invoice_rel.exists(),
                                    del_client.client_parent_child_company_rel.exists(),
                                    del_client.container_client_rel.exists(),
                                    del_client.non_depot_container_client_rel.exists(),
                                    del_client.adv_handling_payment_client_rel.exists(),
                                    del_client.pre_gatein_client_rel.exists(),
                                    # hasattr(del_client, "fin_account_customer"),
                                    del_client.handling_client_rel.exists(),
                                    del_client.self_transportation_client_rel.exists(),
                                    del_client.client_representative_rel.exists(),
                                    del_client.client_document_rel.exists(),
                                    del_client.client_handling_charge_rel.exists(),
                                    del_client.client_transportation_charge_rel.exists(),
                                ]
                            )

                            if has_dependency is False:
                                del_client.delete()
            return Response(
                {"successMsg": f"Duplicate Clients Deleted Successfully!"}, status=200
            )

        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {str(e)} ]"}, status=200
            )


class ClientDependencyTransferViews(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Automation", "Admin"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"], location=location)
            replace_from = data["replace_from"]
            replace_to = data["replace_to"]

            if (
                not Client.objects.select_related("location", "site")
                .filter(name=replace_from, location=location, site=site, type="Party")
                .exists()
                or not Client.objects.select_related("location", "site")
                .filter(name=replace_to, location=location, site=site, type="Party")
                .exists()
            ):
                return Response(
                    {
                        "errorMsg": f"Oops!!! Clients replace_from or replace_to dont exists in system."
                    },
                    status=200,
                )

            with transaction.atomic():

                replace_from_client_list = Client.objects.select_related(
                    "location", "site"
                ).filter(name=replace_from, location=location, site=site, type="Party")

                replace_to_client = (
                    Client.objects.select_related("location", "site")
                    .filter(name=replace_to, location=location, site=site, type="Party")
                    .first()
                )

                for replace_from_client in replace_from_client_list:
                    replace_from_client.container_client_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.handling_client_rel.update(
                        customer_name=replace_to_client
                    )

                    replace_from_client.self_transportation_client_rel.update(
                        customer_name=replace_to_client
                    )

                    replace_from_client.customer_bill_client_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.customer_bill_customer_rel.update(
                        customer=replace_to_client
                    )

                    replace_from_client.client_customer_bill_invoice_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.client_parent_child_company_rel.update(
                        parent=replace_to_client
                    )

                    replace_from_client.non_depot_container_client_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.adv_handling_payment_client_rel.update(
                        client=replace_to_client
                    )
                    replace_from_client.pre_gatein_client_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.client_representative_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.client_document_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.client_handling_charge_rel.update(
                        client=replace_to_client
                    )

                    replace_from_client.client_transportation_charge_rel.update(
                        client=replace_to_client
                    )

                    # if hasattr(replace_from_client, "fin_account_customer") is True:
                    #     fin_account = replace_from_client.fin_account_customer
                    #     if hasattr(replace_to_client, "fin_account_customer") is False:
                    #         fin_account.customer = replace_to_client
                    #         fin_account.save(update_fields=["customer"])
                    #     else:
                    #         fin_account.delete()

                    has_dependency = any(
                        [
                            replace_from_client.customer_bill_client_rel.exists(),
                            replace_from_client.customer_bill_customer_rel.exists(),
                            replace_from_client.client_customer_bill_invoice_rel.exists(),
                            replace_from_client.client_parent_child_company_rel.exists(),
                            replace_from_client.container_client_rel.exists(),
                            replace_from_client.non_depot_container_client_rel.exists(),
                            replace_from_client.adv_handling_payment_client_rel.exists(),
                            replace_from_client.pre_gatein_client_rel.exists(),
                            # hasattr(replace_from_client, "fin_account_customer"),
                            replace_from_client.handling_client_rel.exists(),
                            replace_from_client.self_transportation_client_rel.exists(),
                            replace_from_client.client_representative_rel.exists(),
                            replace_from_client.client_document_rel.exists(),
                            replace_from_client.client_handling_charge_rel.exists(),
                            replace_from_client.client_transportation_charge_rel.exists(),
                        ]
                    )

                    if has_dependency is False:
                        replace_from_client.delete()

                return Response(
                    {"successMsg": f"Client Replaced and Deleted Successfully!"},
                    status=200,
                )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=status.HTTP_200_OK)

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found[{e}]"}, status=200)


class ClientBulkGstUploadView(APIView):
    """
    Post Function will upload the file
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def extract_and_validate(self, input_excel, location, site):
        try:
            # Load workbook and sheet
            ps = openpyxl.load_workbook(input_excel)
            sheet = ps["clients"]
            headers = [
                "name",
                "type",
                "gst_no",
                "required Y/N ",
            ]

            # Extract raw data and clean it
            raw_data = {
                header: [
                    sheet[f"{chr(65 + i)}{row}"].value
                    for row in range(2, sheet.max_row + 1)
                ]
                for i, header in enumerate(headers)
            }

            # Clean None values from the data
            cleaned_data = {
                key: [val for val in values if val is not None]
                for key, values in raw_data.items()
            }

            # Extract and structure data

            extracted_data_list = [
                {
                    "sr_no": str(i + 1),
                    "name": str(cleaned_data["name"][i]),
                    "type": str(cleaned_data["type"][i]),
                    "gst_no": str(cleaned_data["gst_no"][i]),
                    "required": str(cleaned_data["required Y/N "][i]),
                }
                for i in range(len(cleaned_data["name"]))
            ]

            # Initialize error handling
            error_data_msg, correct_data = {}, {}

            # Validate each extracted data row
            for each in extracted_data_list:
                error_msg = []
                row_number = f"row {str(int(each['sr_no']) + 1)}"
                client_name = each["name"]
                required = each["required"]
                gst_no = each["gst_no"]

                #   Client
                if (
                    not Client.objects.select_related("location", "site")
                    .filter(
                        name=client_name, location=location, site=site, type="Party"
                    )
                    .exists()
                ):
                    error_msg.append(
                        f"In {row_number} client not found in system database"
                    )

                if required == "Y":

                    # GST Validation
                    if gst_no == "_":
                        error_msg.append(f"In {row_number} gst_no is None")
                    else:
                        if (
                            Client.objects.select_related("location", "site")
                            .filter(
                                gst_no=gst_no,
                                location=location,
                                site=site,
                                type="Party",
                            )
                            .exists()
                        ):
                            error_msg.append(
                                f"In {row_number} client with same gst no exists in system database"
                            )

                    results = [
                        item
                        for item in extracted_data_list
                        if item["required"] == "Y" and item["gst_no"] == gst_no
                    ]

                    # Only one Ideal Client Validation
                    if len(results) == 0 or len(results) > 1:
                        error_msg.append(
                            f"In {row_number} required 1 'Y' Client for {client_name} with {gst_no}"
                        )

                    else:
                        ideal_client = results[0]
                        if len(error_msg) == 0:
                            # Same ideal client already exists
                            if ideal_client["sr_no"] in correct_data.keys():
                                correct_data[ideal_client["sr_no"]]
                            else:
                                # Check if another ideal client already has same GST
                                duplicate_gst = any(
                                    data["gst_no"] == ideal_client["gst_no"]
                                    and data["sr_no"] != ideal_client["sr_no"]
                                    for data in correct_data.values()
                                )

                                if duplicate_gst:
                                    error_msg.append(
                                        f"In {row_number} gst_no {ideal_client['gst_no']} is duplicated for clients"
                                    )
                                else:
                                    correct_data[ideal_client["sr_no"]] = ideal_client

                    # Append errors msg
                    if not len(error_msg) == 0:
                        error_data_msg[row_number] = error_msg

                else:
                    pass

            faults_exists = False
            if not len(error_data_msg) == 0:
                faults_exists = True

            # Return final data
            return {
                "correct_data": correct_data,
                "faults": error_data_msg,
                "faults_exists": faults_exists,
            }
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return False

    def post(self, request, *args, **kwargs):
        file = request.data.get("file")
        location = Location.objects.get(name=request.data.get("location"))
        site = Site.objects.get(name=request.data.get("site"), location=location)
        try:
            result = self.extract_and_validate(
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


class ClientBulkGstUpdateView(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            correct_data = request.data["correct_data"]
            location = Location.objects.get(name=request.data.get("location"))
            site = Site.objects.get(name=request.data.get("site"), location=location)
            for each_key in correct_data:
                with transaction.atomic():
                    client_name = correct_data[each_key]["name"]
                    client_gst_no = correct_data[each_key]["gst_no"]
                    client = (
                        Client.objects.select_related("location", "site")
                        .filter(
                            name=client_name,
                            location=location,
                            site=site,
                            type="Party",
                        )
                        .first()
                    )
                    client.gst_no = client_gst_no
                    client.save()

            return Response(
                {"successMsg": f"Clients Updated Successfully!"}, status=200
            )

        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {str(e)} ]"}, status=200
            )


class ClientBulkGstNoneUpdateView(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            location = Location.objects.get(name=request.data.get("location"))
            site = Site.objects.get(name=request.data.get("site"), location=location)
            with transaction.atomic():
                Client.objects.select_related("location", "site").filter(
                    location=location,
                    site=site,
                    type="Party",
                ).update(gst_no=None)

            return Response(
                {"successMsg": f"Clients Gst Updated To None Successfully!"}, status=200
            )
        except Exception as e:
            logging.getLogger("error_log").error(traceback.format_exc())
            return Response(
                {"errorMsg": f"Invalid Data Provided [ {str(e)} ]"}, status=200
            )
