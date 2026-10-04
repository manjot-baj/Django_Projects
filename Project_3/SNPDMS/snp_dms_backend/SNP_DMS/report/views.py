from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from .functions import *
from .xlsx_functions import *
from account.models import AccountUser
from master.models import Location, Site
from edi.msc_edi_excel_generation import *
from edi.cycle_functions import get_edi_tracking_data
from account.permissions import HasAllowedRoles

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

            user_data_dict = user_data(location=location, site=site)

            if line is None:
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = all_line_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="all_line_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = all_line_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="all_line_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line="ALL",
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line="ALL",
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line="ALL",
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line="ALL",
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line="ALL",
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = all_line_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = all_line_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = all_line_stock_main_data(
                        data_object_list=stock_data_list
                    )
                    summary_df_data = all_line_stock_summary_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    summary_b_df_data = all_line_stock_summary_b_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    av_aa_ar_df_data = all_line_stock_av_aa_ar_main_data(
                        location=location, site=site
                    )
                    movement_df_data = all_line_movement_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="all_line_daily_report_{date_str}.xlsx"'
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
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msk_line_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msk_line_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = msk_line_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msk_line_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
                        outward_df_data=outward_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line="ALL",
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line="ALL",
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line="ALL",
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line="ALL",
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line="ALL",
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = msk_line_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = msk_line_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = msk_line_stock_main_data(
                        data_object_list=stock_data_list
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
                    movement_df_data = msk_line_movement_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msk_line_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "cma":
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = cma_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="cma_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = cma_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="cma_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inventory_df_data = cma_inventory_main_data(
                        data_object_list=stock_data_list
                    )
                    inward_df_data = cma_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = cma_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="cma_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "baroda":
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msc_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = msc_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    stock_df_data = msc_stock_main_data(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msc_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = msc_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    status_df_data = msc_status_main_data(
                        data_object_list=stock_data_list
                    )
                    summary_df_data = msc_summary_main_data(
                        location=location, site=site
                    )
                    seal_df_data = msc_seal_main_data(data_object_list=stock_data_list)
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
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
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msc_amd_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_amd_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = msc_amd_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_amd_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = msc_amd_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = msc_amd_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = msc_amd_stock_main_data(
                        data_object_list=stock_data_list
                    )
                    summary_df_data = msc_amd_summary_main_data(
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_amd_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "sanand":
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msc_sanand_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_sanand_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = msc_sanand_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_sanand_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = msc_sanand_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = msc_sanand_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = msc_sanand_stock_main_data(
                        data_object_list=stock_data_list
                    )
                    summary_df_data = msc_sanand_summary_main_data(
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_sanand_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "tuticorin":
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = msc_tuticorin_inward_main_data(
                        data_object_list=inward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_tuticorin_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = msc_tuticorin_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_tuticorin_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = msc_tuticorin_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = msc_tuticorin_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = msc_tuticorin_stock_main_data(
                        data_object_list=stock_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_tuticorin_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
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
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = hemck_hemchc_inward_main_data(
                        data_object_list=inward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghk_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = hemck_hemchc_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghk_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
                        revenue_df_data=revenue_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
                        revenue_df_data=revenue_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    stock_df_data = hemck_hemchc_inventory_main_data(
                        data_object_list=stock_data_list
                    )
                    inward_df_data = hemck_hemchc_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = hemck_hemchc_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghk_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif (
                line.lower() in ["msc", "hub & link", "pil"]
                and str(site.name).lower() == "inghk"
            ):
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        data_object_list=inward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghk_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghk_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    stock_df_data = generic_inghk_inghc_inventory_main_data(
                        data_object_list=stock_data_list
                    )
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghk_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
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
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        data_object_list=inward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghc_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghc_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    stock_df_data = generic_inghk_inghc_inventory_main_data(
                        data_object_list=stock_data_list
                    )
                    inward_df_data = generic_inghk_inghc_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = generic_inghk_inghc_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_inghc_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.type).lower() == "non depot":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "msc" and str(site.name).lower() == "testing":
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = generic_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{line.lower()}_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = generic_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{line.lower()}_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
                        revenue_df_data=revenue_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
                        revenue_df_data=revenue_df_data,
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = generic_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = generic_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = generic_stock_main_data(
                        data_object_list=stock_data_list
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
                    summary_b_df_data = generic_stock_summary_b_data(
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
                    movement_df_data = generic_movement_data(
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{line.lower()}_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            elif line.lower() == "sarjak" and str(site.name).lower() == "tuticorin":
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = sarjak_tuticorin_inward_main_data(
                        data_object_list=inward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="sarjak_tuticorin_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = sarjak_tuticorin_outward_main_data(
                        data_object_list=outward_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="sarjak_tuticorin_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = sarjak_tuticorin_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = sarjak_tuticorin_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = sarjak_tuticorin_stock_main_data(
                        data_object_list=stock_data_list
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="sarjak_tuticorin_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

            else:
                if report == "IN REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    inward_df_data = generic_inward_main_data(
                        data_object_list=inward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{line.lower()}_inward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "OUT REPORT":
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_df_data = generic_outward_main_data(
                        data_object_list=outward_data_list
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{line.lower()}_outward_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "ESTIMATE REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_estimate_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "APPROVAL REPORT":
                    approval_data_list = msc_approval_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
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
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_approval_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "REPAIR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc_mundra_repair_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "OVMNR REPORT":
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="ovmnr_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "EDI MAIL TRACKED REPORT":
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

                    temp_file_path, date_str = create_edi_tracking_report_wb(
                        user_data=user_data_dict,
                        inward_df_data=inward_df_data,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MOVECODE EDI MAIL TRACKED REPORT":
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
                        line=line,
                        move_code_tracking=True,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="edi_email_track_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REQUEST REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_request_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "SEAL REPORT":
                    seal_dict = seal_raw_detail_dict(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
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
                        line=line,
                    )

                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="seal_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "HANDLING REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = handling_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    temp_file_path, date_str = create_handling_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="handling_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "SELF TRANSPORTATION REVENUE REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    revenue_df_data = self_transportation_revenue_main_data(
                        in_data_object_list=inward_data_list,
                        out_data_object_list=outward_data_list,
                    )
                    (
                        temp_file_path,
                        date_str,
                    ) = create_self_transportation_revenue_report_wb(
                        line=line,
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="self_transportation_revenue_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response
                elif report == "DAILY ACTIVITY REPORT":
                    inward_data_list = inward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    outward_data_list = outward_data_object_list(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        line=line,
                        location=location,
                        site=site,
                    )
                    stock_data_list = stock_data_object_list(
                        line=line, location=location, site=site
                    )
                    inward_df_data = generic_inward_main_data(
                        data_object_list=inward_data_list
                    )
                    outward_df_data = generic_outward_main_data(
                        data_object_list=outward_data_list
                    )
                    stock_df_data = generic_stock_main_data(
                        data_object_list=stock_data_list
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
                    movement_df_data = generic_movement_data(
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
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{line.lower()}_daily_report_{date_str}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                elif report == "MSC EXCEL EDI":
                    # collect data
                    msc_data_object_list = get_msc_inward_outward_data_object(
                        from_date_str=from_date_str,
                        to_date_str=to_date_str,
                        from_time_str=from_time_str,
                        to_time_str=to_time_str,
                        location=location,
                        site=site,
                    )
                    # process data
                    msc_df_data = get_msc_edi_excel_main_data(
                        data_object_list=msc_data_object_list
                    )
                    # filename
                    tz = timezone.get_current_timezone()
                    today = datetime.datetime.now().astimezone(tz)
                    date = today.date().strftime("%d_%m_%Y")
                    time = today.time().strftime("%H_%M_%S")
                    file_name = f"{location.name}_{site.name}_{date}_{time}"
                    # file creation
                    temp_file_path = make_msc_edi_excel_file(
                        context=msc_df_data, filename=file_name
                    )
                    # download file
                    with open(temp_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="{file_name}.xlsx"'
                        os.remove(temp_file_path)
                    return file_response

                else:
                    return Response(
                        {"errorMsg": f"Sorry, Report Not Available"}, status=200
                    )

        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
