from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from .functions2 import *
from .extend_functions2 import *
from .xlsx_function2 import *
from .extend_xlsx_functions2 import *
from account.models import AccountUser
from master.models import Location, Site
from edi.msc_edi_excel_generation import *
from edi.cycle_functions import get_edi_tracking_data
from django.db.models import F
import ftplib
from decouple import config
import os
from account.permissions import HasAllowedRoles
import random


class Report(views.APIView):
    """the post function will give the report"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            user = request.user
            download_and_upload_to_ftp = data.get("download_and_upload_to_ftp", None)
            container_no = data.get("container_no", None)
            from_date_str = data["from_date"]
            to_date_str = data["to_date"]
            if not len(from_date_str) == 0 and not len(to_date_str) == 0:
                from_date_str = data["from_date"]
                to_date_str = data["to_date"]
            else:
                from_date_str = ""
                to_date_str = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                    .strftime("%Y-%m-%d")
                )

            from_time_str = data["from_time"]
            to_time_str = data["to_time"]
            if not len(from_time_str) == 0 and not len(to_time_str) == 0:
                from_time_str = data["from_time"]
                to_time_str = data["to_time"]
            else:
                from_time_str = ""
                to_time_str = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                    .strftime("%H:%M")
                )
            line = None
            if not data["line"] == "All":
                line = data["line"]

            report = data["report"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = data["location"]
                site_str = data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            query_data = get_query_data(
                from_date_str,
                to_date_str,
                from_time_str,
                to_time_str,
                location,
                site,
                line,
            )

            user_data_dict = user_data(location=location, site=site)
            common_reports = [
                "HANDLING REVENUE REPORT",
                "SELF TRANSPORTATION REVENUE REPORT",
                "DAILY ACTIVITY REPORT",
            ]

            if report == "DAILY ACTIVITY REPORT":
                stock_data_query = stock_data_query_method(
                    line=line, location=location, site=site
                )

            if report == "DMR REPORT":
                if line != "MSC":
                    return Response({"errorMsg": "Only Report for MSC is supported"})

                current_month = datetime.datetime.now().month
                start_date = datetime.datetime(
                    datetime.datetime.now().year, current_month, 1
                )
                end_date = (
                    datetime.datetime(datetime.datetime.now().year + 1, 1, 1)
                    - datetime.timedelta(days=1)
                    if current_month == 12
                    else datetime.datetime(
                        datetime.datetime.now().year, current_month + 1, 1
                    )
                    - datetime.timedelta(days=1)
                )
                stock_data_query = stock_data_query_method(
                    line=line, location=location, site=site
                )
                if "container__client__ref_code" in query_data.keys():
                    query_data.pop("container__client__ref_code")
                if "container__client__ref_code" in stock_data_query.keys():
                    stock_data_query.pop("container__client__ref_code")
                inward_df_data = mundra_depot_inward_main_data(query_data=query_data)
                outward_df_data = mundra_depot_outward_main_data(query_data=query_data)
                stock_df_data = mundra_depot_stock_main_data(
                    stock_data_query=stock_data_query
                )
                summary_df_data = mundra_depot_summary_data(
                    location=location,
                    site=site,
                    query_data=query_data,
                    stock_data_query=stock_data_query,
                    start_date=start_date,
                    end_date=end_date,
                )
                cancel_allotment_df_data = mundra_depot_cancel_allotment_main_data(
                    query_data=query_data
                )
                change_allotment_df_data = mundra_depot_change_allotment_main_data(
                    query_data=query_data
                )
                temp_file_path, date_str = create_mundra_depot_daily_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    stock_df_data=stock_df_data,
                    summary_df_data=summary_df_data,
                    cancel_allotment_df_data=cancel_allotment_df_data,
                    change_allotment_df_data=change_allotment_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    start_date=start_date,
                    end_date=end_date,
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="msc_daily_report_{date_str}.xlsx"'
                    )

                    os.remove(temp_file_path)
                return file_response

            if report == "OVMNR REPORT":
                ovmnr_dict = ovmnr_data_object_list(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                )
                ovmnr_df_data = ovmnr_detail_main_data(data_object_list=ovmnr_dict)
                ovmnr_summary_df_data = ovmnr_summary_main_data(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    line=line,
                    location=location,
                    site=site,
                )
                temp_file_path, date_str = create_ovmnr_report_wb(
                    user_data=user_data_dict,
                    ovmnr_df_data=ovmnr_df_data,
                    ovmnr_summary_df_data=ovmnr_summary_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response
            if report == "EDI MAIL TRACKED REPORT":
                edi_tracked_data = get_edi_tracking_data(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                )
                in_edi_tracked_data = edi_tracked_data["in_data_dict"]
                out_edi_tracked_data = edi_tracked_data["out_data_dict"]

                inward_df_data = inward_edi_tracking_main_data(
                    data_object_list=in_edi_tracked_data
                )
                outward_df_data = outward_edi_tracking_main_data(
                    data_object_list=out_edi_tracked_data
                )
                edi_line = "ALL" if line is None else line

                temp_file_path, date_str = create_edi_tracking_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=edi_line,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "EXCEL EDI MAIL TRACKED REPORT":
                edi_tracked_data = get_edi_tracking_data(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                )
                in_edi_tracked_data = edi_tracked_data["in_data_dict"]
                out_edi_tracked_data = edi_tracked_data["out_data_dict"]

                inward_df_data = inward_edi_tracking_main_data(
                    data_object_list=in_edi_tracked_data, is_excel_edi=True
                )
                outward_df_data = outward_edi_tracking_main_data(
                    data_object_list=out_edi_tracked_data, is_excel_edi=True
                )
                edi_line = "ALL" if line is None else line

                temp_file_path, date_str = create_edi_tracking_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=edi_line,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="excel_edi_email_track_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "SURVEYOR CONTAINER REPORT":
                surveyor_containers_object_list = getSurvyorContainerObjectList(
                    location,
                    site,
                    line,
                    from_date_str,
                    to_date_str,
                    from_time_str,
                    to_time_str,
                )
                surveyor_container_df_data = getSurveyorContainerDfData(
                    surveyor_containers_object_list, site
                )
                temp_file_path, date_str = createSurveyorContainerReport(
                    surveyor_container_df_data,
                    location,
                    site,
                    user_data_dict,
                    from_date_str,
                    from_time_str,
                    to_date_str,
                    to_time_str,
                    line,
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="surveyor_container_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "MOVECODE EDI MAIL TRACKED REPORT":
                move_code_line = "ALL" if line is None else line
                edi_tracked_data = get_edi_tracking_data(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                    move_code_tracking=True,
                )
                in_edi_tracked_data = edi_tracked_data["in_data_dict"]
                out_edi_tracked_data = edi_tracked_data["out_data_dict"]

                inward_df_data = inward_edi_movecode_tracking_main_data(
                    data_object_list=in_edi_tracked_data,
                )
                outward_df_data = outward_edi_movecode_tracking_main_data(
                    data_object_list=out_edi_tracked_data,
                )

                temp_file_path, date_str = create_edi_tracking_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=move_code_line,
                    move_code_tracking=True,
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "MOVECODE EXCEL EDI MAIL TRACKED REPORT":
                move_code_line = "ALL" if line is None else line
                edi_tracked_data = get_edi_tracking_data(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                    move_code_tracking=True,
                )
                in_edi_tracked_data = edi_tracked_data["in_data_dict"]
                out_edi_tracked_data = edi_tracked_data["out_data_dict"]

                inward_df_data = inward_excel_edi_movecode_tracking_main_data(
                    data_object_list=in_edi_tracked_data,
                )
                outward_df_data = outward_excel_edi_movecode_tracking_main_data(
                    data_object_list=out_edi_tracked_data,
                )

                temp_file_path, date_str = create_edi_tracking_report_wb(
                    user_data=user_data_dict,
                    inward_df_data=inward_df_data,
                    outward_df_data=outward_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=move_code_line,
                    move_code_tracking=True,
                )
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="excel_edi_email_track_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "SEAL REQUEST REPORT" or report == "SEAL REPORT":
                seal_dict = seal_raw_detail_dict(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                )
                if report == "SEAL REQUEST REPORT":
                    seal_request_df_data = seal_request_main_data(data_object=seal_dict)

                    temp_file_path, date_str = create_generic_seal_request_report_wb(
                        user_data=user_data_dict,
                        seal_request_df_data=seal_request_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SEAL REPORT":
                    seal_line = "ALL" if line is None else line
                    seal_df_data = seal_main_data(data_object=seal_dict)
                    seal_stock_df_data = seal_stock_main_data(data_object=seal_dict)

                    temp_file_path, date_str = create_generic_seal_report_wb(
                        user_data=user_data_dict,
                        seal_df_data=seal_df_data,
                        seal_stock_df_data=seal_stock_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=seal_line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="seal_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

            if report == "SEAL SUMMARY REPORT":
                outward_data_list = outward_data_object_list(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                    filter_objects=True,
                )
                seal_stock = seal_stock_data(location=location, site=site)
                seal_issued_df_data = seal_issued_report_main_data(outward_data_list)
                seal_update_track_df_data = seal_update_track_report_main_data(
                    outward_data_list
                )
                seal_stock_df_data = seal_stock_report_main_data(seal_stock)
                seal_stock_summary_df_data = seal_stock_summary_report_main_data(
                    seal_stock, location, site
                )
                temp_file_path = create_seal_summary_report_wb(
                    seal_issued_df_data=seal_issued_df_data,
                    seal_stock_df_data=seal_stock_df_data,
                    seal_stock_summary_df_data=seal_stock_summary_df_data,
                    seal_update_track_df_data=seal_update_track_df_data,
                    site=site.name,
                )

                filename = os.path.basename(temp_file_path)
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="{filename}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "ESTIMATE REPORT":
                estimate_data_list = msc_estimate_data_object_list(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                )
                estimate_df_data = msc_estimate_report_main_data(
                    data_object_list=estimate_data_list
                )
                temp_file_path, date_str = msc_estimate_report_wb(
                    estimate_df_data=estimate_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    user_data=user_data_dict,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "REJECTED REPORT":
                approval_data_list = msc_approval_data_object_list(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                    is_rejected=True,
                )
                approval_df_data = msc_approval_report_main_data(
                    data_object_list=approval_data_list
                )
                temp_file_path, date_str = msc_approval_report_wb(
                    approval_df_data=approval_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    user_data=user_data_dict,
                    is_rejected=True,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="rejected_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response
            if report == "APPROVED  REPORT":
                approval_data_list = msc_approval_data_object_list(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                    is_rejected=False,
                )
                re_estimated_approval_data_list = approval_data_list.exclude(
                    parent__current_amount=F("parent__original_amount")
                )
                approval_df_data = msc_approval_report_main_data(
                    data_object_list=approval_data_list
                )
                re_estimated_approval_df_data = msc_approval_report_main_data(
                    data_object_list=re_estimated_approval_data_list
                )
                temp_file_path, date_str = msc_approval_report_wb(
                    approval_df_data=approval_df_data,
                    re_estimated_approval_df_data=re_estimated_approval_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    user_data=user_data_dict,
                    is_rejected=False,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "REPAIR REPORT":
                repair_data_list = msc_repair_data_object_list(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    line=line,
                    location=location,
                    site=site,
                )
                repair_df_data = msc_repair_completion_report_main_data(
                    data_object_list=repair_data_list
                )
                temp_file_path, date_str = msc_repair_completion_report_wb(
                    repair_df_data=repair_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    user_data=user_data_dict,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "MSC IN EXCEL EDI":
                msc_data_object_list = get_msc_inward_data_object(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    container_no=container_no,
                    location=location,
                    site=site,
                )

                if len(msc_data_object_list) == 0:
                    return Response(
                        {"errorMsg": f"Data Not Found"},
                        status=200,
                    )

                # process data
                msc_df_data_dict = get_msc_edi_excel_main_data(
                    data_object_list=msc_data_object_list, regenerate=True
                )
                msc_df_data = msc_df_data_dict["main_data"]
                eligible_data_list = msc_df_data_dict["eligible_data_list"]
                # filename
                tz = timezone.get_current_timezone()
                today = datetime.datetime.now().astimezone(tz)
                date = today.date().strftime("%d%m%Y")
                time = today.time().strftime("%H%M%S")
                file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_GOLDENHORN_GATEIN_{date}{time}"

                if site.name.upper() in ["HEMC HALDIA", "HEMC KOLKATA"]:
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_HEMC_GATEIN_{date}{time}"

                if site.name.upper() == "MATRIX":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_MATRIXCONTAINERYARD_GATEIN_{date}{time}"

                if site.name.upper() == "PGL DEPOT":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_PGLPL_GATEIN_{date}{time}"

                if site.name.upper() == "OM SHAILSHUTA LPL DEPOT":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSHAILSHUTALPL_GATEIN_{date}{time}"

                if site.name.upper() == "OMSSGRFL SAHNEWAL":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSSGRFLSAHNEWAL_GATEIN_{date}{time}"
                # file creation
                temp_file_path = make_msc_edi_excel_file(
                    context=msc_df_data, filename=file_name
                )

                # ftp upload
                try:
                    if download_and_upload_to_ftp:
                        """ftp stuff"""
                        session = ftplib.FTP(
                            config("WINDOWS_FTP_HOST"),
                            config("WINDOWS_FTP_USERNAME"),
                            config("WINDOWS_FTP_PASSWORD"),
                        )
                        file = open(temp_file_path, "rb")
                        session.storbinary(
                            f"STOR /edi_excel_files/{site.name.upper()}/{file_name}.xlsx",
                            file,
                        )
                        file.close()
                        session.quit()
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())

                # download file
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="{file_name}.xlsx"'
                    )
                    file_response["X-Filename"] = f"{file_name}.xlsx"
                    os.remove(temp_file_path)
                return file_response

            if report == "MSC OUT EXCEL EDI":
                msc_data_object_list = get_msc_outward_data_object(
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    container_no=container_no,
                    location=location,
                    site=site,
                )

                if len(msc_data_object_list) == 0:
                    return Response(
                        {"errorMsg": f"Data Not Found"},
                        status=200,
                    )

                # process data
                msc_df_data_dict = get_msc_edi_excel_main_data(
                    data_object_list=msc_data_object_list, regenerate=True
                )
                msc_df_data = msc_df_data_dict["main_data"]
                eligible_data_list = msc_df_data_dict["eligible_data_list"]
                # filename
                tz = timezone.get_current_timezone()
                today = datetime.datetime.now().astimezone(tz)
                date = today.date().strftime("%d%m%Y")
                time = today.time().strftime("%H%M%S")
                file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_GOLDENHORN_GATEOUT_{date}{time}"

                if site.name.upper() in ["HEMC HALDIA", "HEMC KOLKATA"]:
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_HEMC_GATEOUT_{date}{time}"

                if site.name.upper() == "MATRIX":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_MATRIXCONTAINERYARD_GATEOUT_{date}{time}"

                if site.name.upper() == "PGL DEPOT":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_PGLPL_GATEOUT_{date}{time}"

                if site.name.upper() == "OM SHAILSHUTA LPL DEPOT":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSHAILSHUTALPL_GATEOUT_{date}{time}"

                if site.name.upper() == "OMSSGRFL SAHNEWAL":
                    file_name = f"{site.event_location_msc_code}_{site.depot_msc_code}_OMSSGRFLSAHNEWAL_GATEOUT_{date}{time}"
                # file creation
                temp_file_path = make_msc_edi_excel_file(
                    context=msc_df_data, filename=file_name
                )

                # ftp upload
                try:
                    if download_and_upload_to_ftp:
                        """ftp stuff"""
                        session = ftplib.FTP(
                            config("WINDOWS_FTP_HOST"),
                            config("WINDOWS_FTP_USERNAME"),
                            config("WINDOWS_FTP_PASSWORD"),
                        )
                        file = open(temp_file_path, "rb")
                        session.storbinary(
                            f"STOR /edi_excel_files/{site.name.upper()}/{file_name}.xlsx",
                            file,
                        )
                        file.close()
                        session.quit()
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())

                # download file
                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="{file_name}.xlsx"'
                    )
                    file_response["X-Filename"] = f"{file_name}.xlsx"
                    os.remove(temp_file_path)
                return file_response

            if report == "SELF TRANSPORTATION REVENUE REPORT":
                st_line = "ALL" if line is None else line
                revenue_df_data = self_transportation_revenue_main_data(
                    query_data=query_data,
                )
                (
                    temp_file_path,
                    date_str,
                ) = create_self_transportation_revenue_report_wb(
                    line=st_line,
                    revenue_df_data=revenue_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    user_data=user_data_dict,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if report == "HANDLING REVENUE REPORT":
                lolo_line = "ALL" if line is None else line
                revenue_df_data = handling_revenue_main_data(
                    query_data=query_data,
                )
                temp_file_path, date_str = create_handling_revenue_report_wb(
                    line=lolo_line,
                    revenue_df_data=revenue_df_data,
                    from_date_str=from_date_str,
                    to_date_str=to_date_str,
                    from_time_str=from_time_str,
                    to_time_str=to_time_str,
                    user_data=user_data_dict,
                )

                with open(temp_file_path, "rb") as temp:
                    file_response = HttpResponse(
                        temp.read(), content_type=f"application/xlsx"
                    )
                    file_response["Content-Disposition"] = (
                        f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                    )
                    os.remove(temp_file_path)
                return file_response

            if line is None:
                if report == "IN REPORT":
                    inward_df_data = all_line_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_all_line_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="all_line_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = all_line_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_all_line_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="all_line_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = all_line_inward_main_data(query_data=query_data)
                    outward_df_data = all_line_outward_main_data(query_data=query_data)
                    stock_df_data = all_line_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = all_line_stock_summary_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    summary_b_df_data = stock_summary_b_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=None,
                    )
                    av_aa_ar_df_data = all_line_stock_av_aa_ar_main_data(
                        location=location, site=site
                    )
                    movement_df_data = movement_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=None,
                    )
                    # total_inward_df_data = all_line_total_inward_data(
                    #     to_date_str=to_date_str, location=location, site=site
                    # )
                    status_df_data = all_line_stock_status_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    temp_file_path, date_str = create_all_line_daily_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        stock_df_data=stock_df_data,
                        summary_df_data=summary_df_data,
                        summary_b_df_data=summary_b_df_data,
                        av_aa_ar_df_data=av_aa_ar_df_data,
                        movement_summary_df_data=movement_df_data,
                        # total_inward_df_data=total_inward_df_data,
                        status_df_data=status_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="all_line_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            # elif line.lower() == "zim":
            #     if report == "IN REPORT":
            #         inward_data_list = inward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         inward_df_data = zim_inward_main_data(
            #             data_object_list=inward_data_list
            #         )
            #         temp_file_path, date_str = create_zim_inward_report_wb(
            #             inward_df_data=inward_df_data,
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             user_data=user_data_dict,
            #         )

            #         with open(temp_file_path, "rb") as temp:
            #             file_response = HttpResponse(
            #                 temp.read(), content_type=f"application/xlsx"
            #             )
            #             file_response[
            #                 "Content-Disposition"
            #             ] = f'attachment; filename="zim_inward_report_{date_str}.xlsx"'
            #             os.remove(temp_file_path)
            #         return file_response
            #     elif report == "OUT REPORT":
            #         outward_data_list = outward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         outward_df_data = zim_outward_main_data(
            #             data_object_list=outward_data_list
            #         )
            #         temp_file_path, date_str = create_zim_outward_report_wb(
            #             outward_df_data=outward_df_data,
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             user_data=user_data_dict,
            #         )

            #         with open(temp_file_path, "rb") as temp:
            #             file_response = HttpResponse(
            #                 temp.read(), content_type=f"application/xlsx"
            #             )
            #             file_response[
            #                 "Content-Disposition"
            #             ] = f'attachment; filename="zim_outward_report_{date_str}.xlsx"'
            #             os.remove(temp_file_path)
            #         return file_response
            #     elif report == "HANDLING REVENUE REPORT":
            #         inward_data_list = inward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         outward_data_list = outward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         revenue_df_data = handling_revenue_main_data(
            #             in_data_object_list=inward_data_list,
            #             out_data_object_list=outward_data_list,
            #         )
            #         temp_file_path, date_str = create_handling_revenue_report_wb(
            #             line=line,
            #             revenue_df_data=revenue_df_data,
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             user_data=user_data_dict,
            #         )

            #         with open(temp_file_path, "rb") as temp:
            #             file_response = HttpResponse(
            #                 temp.read(), content_type=f"application/xlsx"
            #             )
            #             file_response[
            #                 "Content-Disposition"
            #             ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
            #             os.remove(temp_file_path)
            #         return file_response
            #     elif report == "SELF TRANSPORTATION REVENUE REPORT":
            #         inward_data_list = inward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         outward_data_list = outward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         revenue_df_data = self_transportation_revenue_main_data(
            #             in_data_object_list=inward_data_list,
            #             out_data_object_list=outward_data_list,
            #         )
            #         (
            #             temp_file_path,
            #             date_str,
            #         ) = create_self_transportation_revenue_report_wb(
            #             line=line,
            #             revenue_df_data=revenue_df_data,
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             user_data=user_data_dict,
            #         )

            #         with open(temp_file_path, "rb") as temp:
            #             file_response = HttpResponse(
            #                 temp.read(), content_type=f"application/xlsx"
            #             )
            #             file_response[
            #                 "Content-Disposition"
            #             ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
            #             os.remove(temp_file_path)
            #         return file_response
            #     elif report == "DAILY ACTIVITY REPORT":
            #         inward_data_list = inward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         outward_data_list = outward_data_object_list(
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             line=line,
            #             location=location,
            #             site=site,
            #         )
            #         stock_data_list = stock_data_object_list(
            #             line=line, location=location, site=site
            #         )
            #         inward_df_data = zim_inward_main_data(
            #             data_object_list=inward_data_list
            #         )
            #         outward_df_data = zim_outward_main_data(
            #             data_object_list=outward_data_list
            #         )
            #         stock_df_data = zim_stock_main_data(
            #             data_object_list=stock_data_list
            #         )
            #         temp_file_path, date_str = create_zim_daily_report_wb(
            #             inward_df_data=inward_df_data,
            #             outward_df_data=outward_df_data,
            #             stock_df_data=stock_df_data,
            #             from_date_str=from_date_str,
            #             to_date_str=to_date_str,
            #             from_time_str=from_time_str,
            #             to_time_str=to_time_str,
            #             user_data=user_data_dict,
            #         )

            #         with open(temp_file_path, "rb") as temp:
            #             file_response = HttpResponse(
            #                 temp.read(), content_type=f"application/xlsx"
            #             )
            #             file_response[
            #                 "Content-Disposition"
            #             ] = f'attachment; filename="zim_daily_report_{date_str}.xlsx"'
            #             os.remove(temp_file_path)
            #         return file_response
            #     else:
            #         return Response(
            #             {"errorMsg": f"Sorry, Report Not Available"}, status=200
            #         )

            elif line.lower() == "msk":
                if report == "IN REPORT":
                    inward_df_data = msk_line_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msk_line_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msk_line_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = msk_line_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msk_line_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msk_line_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = msk_line_inward_main_data(query_data=query_data)
                    outward_df_data = msk_line_outward_main_data(query_data=query_data)
                    stock_df_data = msk_line_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = msk_line_stock_summary_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    av_aa_ar_df_data = msk_line_stock_av_aa_ar_main_data(
                        location=location, site=site
                    )
                    movement_df_data = movement_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=None,
                    )
                    status_df_data = msk_line_stock_status_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    temp_file_path, date_str = create_msk_line_daily_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        stock_df_data=stock_df_data,
                        summary_df_data=summary_df_data,
                        av_aa_ar_df_data=av_aa_ar_df_data,
                        movement_summary_df_data=movement_df_data,
                        status_df_data=status_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msk_line_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "cma":
                if report == "IN REPORT":
                    inward_df_data = cma_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_cma_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="cma_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = cma_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_cma_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="cma_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inventory_df_data = cma_inventory_main_data(
                        stock_data_query=stock_data_query
                    )
                    inward_df_data = cma_inward_main_data(query_data=query_data)
                    outward_df_data = cma_outward_main_data(query_data=query_data)
                    summary_df_data = cma_summary_main_data(
                        location=location, site=site
                    )
                    allotment_df_data = cma_alloted_main_data(
                        location=location, site=site
                    )
                    temp_file_path, date_str = create_cma_daily_report_wb(
                        user_data=user_data_dict,
                        inventory_df_data=inventory_df_data,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        summary_df_data=summary_df_data,
                        allotment_df_data=allotment_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="cma_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "baroda":
                if report == "IN REPORT":
                    inward_df_data = msc_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msc_inward_report_wb(
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = msc_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msc_outward_report_wb(
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    stock_df_data = msc_stock_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msc_inward_main_data(query_data=query_data)
                    outward_df_data = msc_outward_main_data(query_data=query_data)
                    status_df_data = msc_status_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = msc_summary_main_data(
                        location=location, site=site
                    )
                    seal_df_data = msc_seal_main_data(stock_data_query=stock_data_query)
                    temp_file_path, date_str = create_msc_daily_report_wb(
                        stock_df_data=stock_df_data,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        status_df_data=status_df_data,
                        summary_df_data=summary_df_data,
                        seal_df_data=seal_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif (
                line.lower() == "msc"
                and str(site.name).lower() == "ahmedabad"
                or line.lower() == "msc"
                and str(site.name).lower() == "haldia"
            ):
                if report == "IN REPORT":
                    inward_df_data = msc_amd_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msc_amd_inward_report_wb(
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_amd_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = msc_amd_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msc_amd_outward_report_wb(
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_amd_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = msc_amd_inward_main_data(query_data=query_data)
                    outward_df_data = msc_amd_outward_main_data(query_data=query_data)
                    stock_df_data = msc_amd_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = msc_sanand_amd_summary_main_data(
                        location=location, site=site
                    )
                    temp_file_path, date_str = create_msc_amd_daily_report_wb(
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        summary_df_data=summary_df_data,
                        stock_df_data=stock_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_amd_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "sanand":
                if report == "IN REPORT":
                    inward_df_data = msc_sanand_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_msc_sanand_inward_report_wb(
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_sanand_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = msc_sanand_outward_main_data(
                        query_data=query_data
                    )
                    temp_file_path, date_str = create_msc_sanand_outward_report_wb(
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_sanand_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = msc_sanand_inward_main_data(query_data=query_data)
                    outward_df_data = msc_sanand_outward_main_data(
                        query_data=query_data
                    )
                    stock_df_data = msc_sanand_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = msc_sanand_amd_summary_main_data(
                        location=location, site=site
                    )
                    temp_file_path, date_str = create_msc_sanand_daily_report_wb(
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        summary_df_data=summary_df_data,
                        stock_df_data=stock_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_sanand_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "tuticorin":
                if report == "IN REPORT":
                    inward_df_data = msc_tuticorin_inward_main_data(
                        query_data=query_data
                    )
                    temp_file_path, date_str = create_msc_tuticorin_inward_report_wb(
                        date=to_date_str,
                        time=to_time_str,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_tuticorin_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = msc_tuticorin_outward_main_data(
                        query_data=query_data
                    )
                    temp_file_path, date_str = create_msc_tuticorin_outward_report_wb(
                        date=to_date_str,
                        time=to_time_str,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_tuticorin_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = msc_tuticorin_inward_main_data(
                        query_data=query_data
                    )
                    outward_df_data = msc_tuticorin_outward_main_data(
                        query_data=query_data
                    )
                    stock_df_data = msc_tuticorin_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    stock_av_df_data = msc_tuticorin_stock_av_main_data(
                        location=location, site=site
                    )
                    summary_df_data = msc_tuticorin_summary_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    temp_file_path, date_str = create_msc_tuticorin_daily_report_wb(
                        date=to_date_str,
                        time=to_time_str,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        stock_df_data=stock_df_data,
                        stock_av_df_data=stock_av_df_data,
                        summary_df_data=summary_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_tuticorin_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif (
                str(site.name).lower() == "hemc kolkata"
                or str(site.name).lower() == "hemc haldia"
            ):
                if report == "IN REPORT":
                    inward_df_data = hemck_hemchc_inward_main_data(
                        query_data=query_data
                    )
                    temp_file_path, date_str = create_hemck_hemchc_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghk_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = hemck_hemchc_outward_main_data(
                        query_data=query_data
                    )
                    temp_file_path, date_str = create_hemck_hemchc_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghk_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    stock_df_data = hemck_hemchc_inventory_main_data(
                        stock_data_query=stock_data_query
                    )
                    inward_df_data = hemck_hemchc_inward_main_data(
                        query_data=query_data
                    )
                    outward_df_data = hemck_hemchc_outward_main_data(
                        query_data=query_data
                    )
                    summary_df_data = hemck_hemchc_summary_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    temp_file_path, date_str = create_hemck_hemchc_daily_report_wb(
                        user_data=user_data_dict,
                        stock_df_data=stock_df_data,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        summary_df_data=summary_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghk_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() in ["msc", "hub & link", "pil"] and str(
                site.name
            ).lower() in ["inghk", "golden horn container services two kolkata"]:
                if report == "IN REPORT":
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        query_data=query_data
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_generic_inghk_inghc_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghk_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        query_data=query_data
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_generic_inghk_inghc_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghk_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    stock_df_data = generic_inghk_inghc_inventory_main_data(
                        stock_data_query=stock_data_query
                    )
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        query_data=query_data
                    )
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        query_data=query_data
                    )
                    summary_df_data = generic_inghk_inghc_summary_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_generic_inghk_inghc_daily_report_wb(
                        user_data=user_data_dict,
                        stock_df_data=stock_df_data,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        summary_df_data=summary_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghk_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif (
                line.lower() in ["msc", "hub & link", "sarjak"]
                and str(site.name).lower() == "inghc"
            ):
                if report == "IN REPORT":
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        query_data=query_data
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_generic_inghk_inghc_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghc_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        query_data=query_data
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_generic_inghk_inghc_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghc_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    stock_df_data = generic_inghk_inghc_inventory_main_data(
                        stock_data_query=stock_data_query
                    )
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        query_data=query_data
                    )
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        query_data=query_data
                    )
                    summary_df_data = generic_inghk_inghc_summary_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_generic_inghk_inghc_daily_report_wb(
                        user_data=user_data_dict,
                        stock_df_data=stock_df_data,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        summary_df_data=summary_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="msc_inghc_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            # elif line.lower() == "msc" and str(site.type).lower() == "non depot":
            #     if report == "REPAIR REPORT":

            #     else:
            #         return Response(
            #             {"errorMsg": f"Sorry, Report Not Available"}, status=200
            #         )

            elif line.lower() == "msc" and str(site.name).lower() == "testing":
                if report == "IN REPORT":
                    inward_df_data = generic_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_generic_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{line.lower()}_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = generic_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_generic_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{line.lower()}_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = generic_inward_main_data(query_data=query_data)
                    outward_df_data = generic_outward_main_data(query_data=query_data)
                    stock_df_data = generic_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = generic_stock_summary_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    summary_b_df_data = stock_summary_b_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    av_aa_ar_df_data = generic_stock_av_aa_ar_main_data(
                        location=location, site=site, line=line
                    )
                    movement_df_data = movement_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    total_inward_df_data = generic_total_inward_data(
                        to_date_str=to_date_str, location=location, site=site, line=line
                    )
                    total_outward_df_data = generic_total_outward_data(
                        to_date_str=to_date_str, location=location, site=site, line=line
                    )
                    status_df_data = generic_stock_status_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    temp_file_path, date_str = create_generic_daily_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        stock_df_data=stock_df_data,
                        summary_df_data=summary_df_data,
                        summary_b_df_data=summary_b_df_data,
                        av_aa_ar_df_data=av_aa_ar_df_data,
                        movement_summary_df_data=movement_df_data,
                        total_inward_df_data=total_inward_df_data,
                        total_outward_df_data=total_outward_df_data,
                        status_df_data=status_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{line.lower()}_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "sarjak" and str(site.name).lower() == "tuticorin":
                if report == "IN REPORT":
                    inward_df_data = sarjak_tuticorin_inward_main_data(
                        query_data=query_data
                    )
                    temp_file_path, date_str = create_sarjak_tuticorin_inward_report_wb(
                        date=to_date_str,
                        time=to_time_str,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="sarjak_tuticorin_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = sarjak_tuticorin_outward_main_data(
                        query_data=query_data
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_sarjak_tuticorin_outward_report_wb(
                        date=to_date_str,
                        time=to_time_str,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="sarjak_tuticorin_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = sarjak_tuticorin_inward_main_data(
                        query_data=query_data
                    )
                    outward_df_data = sarjak_tuticorin_outward_main_data(
                        query_data=query_data
                    )
                    stock_df_data = sarjak_tuticorin_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    stock_av_df_data = sarjak_tuticorin_stock_av_main_data(
                        location=location, site=site
                    )
                    summary_df_data = sarjak_tuticorin_summary_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    temp_file_path, date_str = create_sarjak_tuticorin_daily_report_wb(
                        date=to_date_str,
                        time=to_time_str,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        stock_df_data=stock_df_data,
                        stock_av_df_data=stock_av_df_data,
                        summary_df_data=summary_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        user_data=user_data_dict,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="sarjak_tuticorin_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            else:
                if report == "IN REPORT":
                    inward_df_data = generic_inward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_generic_inward_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{line.lower()}_inward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_df_data = generic_outward_main_data(query_data=query_data)
                    temp_file_path, date_str = create_generic_outward_report_wb(
                        user_data=user_data_dict,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{line.lower()}_outward_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_df_data = generic_inward_main_data(query_data=query_data)
                    outward_df_data = generic_outward_main_data(query_data=query_data)
                    stock_df_data = generic_stock_main_data(
                        stock_data_query=stock_data_query
                    )
                    summary_df_data = generic_stock_summary_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    # summary_b_df_data = generic_stock_summary_b_data(
                    #     from_date_str=from_date_str,
                    #     to_date_str=to_date_str,
                    #     from_time_str=from_time_str,
                    #     to_time_str=to_time_str,
                    #     location=location,
                    #     site=site,
                    #     line=line,
                    # )
                    av_aa_ar_df_data = generic_stock_av_aa_ar_main_data(
                        location=location, site=site, line=line
                    )
                    movement_df_data = movement_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )

                    total_inward_df_data = None
                    total_outward_df_data = None
                    if line.lower() == "cordelia":
                        total_inward_df_data = generic_total_inward_data(
                            to_date_str=to_date_str,
                            location=location,
                            site=site,
                            line=line,
                        )
                        total_outward_df_data = generic_total_outward_data(
                            to_date_str=to_date_str,
                            location=location,
                            site=site,
                            line=line,
                        )

                    status_df_data = generic_stock_status_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                        line=line,
                    )
                    temp_file_path, date_str = create_generic_daily_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        stock_df_data=stock_df_data,
                        summary_df_data=summary_df_data,
                        # summary_b_df_data=summary_b_df_data,
                        av_aa_ar_df_data=av_aa_ar_df_data,
                        movement_summary_df_data=movement_df_data,
                        total_inward_df_data=total_inward_df_data,
                        total_outward_df_data=total_outward_df_data,
                        status_df_data=status_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="{line.lower()}_daily_report_{date_str}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                elif report == "CLIENT REPORT":
                    df_data = client_report_main_data(site)

                    temp_file_path = create_client_report_report_wb(df_data)
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response["Content-Disposition"] = (
                            f'attachment; filename="client_report_{site.name}_{random.randint(100000, 999999)}.xlsx"'
                        )
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return None
