from __future__ import absolute_import, unicode_literals
from datetime import datetime, timedelta
from celery import shared_task
from report.service_functions import *
from master.models import Site
from common.functions import send_sms_from_sns
from tabulate import tabulate
from common.redis_lock import RedisLock


@shared_task
def daily_activity_reports_for_mgmt():
    lock = RedisLock(
        "daily_activity_report_service", expire=120, heartbeat_interval=30
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        # location_site = {
        #     "West Bengal": ["INGHK", "INGHC"],
        #     "Gujarat": ["Sanand", "Ankeleshwar", "Baroda", "Ahmedabad"],
        #     "Tamilnadu": ["TUTICORIN"],
        #     "ANDHRA PRADESH": ["GATEWAY(Vizag)", "kakinada", "VPL INTEGRAL "],
        #     "Hyderabad": ["Matrix"],
        #     "Nepal": ["Birgunj"],
        # }
        site_list = [
            "INGHK",
            "INGHC",
            "Sanand",
            "Ankeleshwar",
            "Baroda",
            "Ahmedabad",
            "TUTICORIN",
            "kakinada",
            "Matrix",
            "Birgunj",
        ]

        temp_file_path = []
        tz = timezone.get_current_timezone()
        current_datetime = datetime.now().astimezone(tz)
        datetime_24_hours_ago = current_datetime - timedelta(hours=24)
        datetime_24_hours_ago = datetime_24_hours_ago.astimezone(tz)
        from_date = datetime_24_hours_ago.date()
        to_date = current_datetime.date()
        time_obj = datetime.strptime("08:00", "%H:%M").time()
        from_date_time = datetime.combine(from_date, time_obj).astimezone(tz)
        to_date_time = datetime.combine(to_date, time_obj).astimezone(tz)
        movemnt_summary_df_data = []
        lolo_revenue_df_data = []
        pendency_df_data = []

        for each_site in site_list:
            site = Site.objects.get(name=each_site)
            # lolo revenue
            lolo_in_data = []
            lolo_out_data = []
            upto_30_days_data = []
            days_30_to_60_data = []
            days_61_to_90_data = []
            above_90_days_data = []
            # movement summary
            summary_20_data = []
            summary_40_data = []
            lines = (
                Client.objects.filter(type="Line", site=site)
                .exclude(ref_code=None)
                .values_list("ref_code", flat=True)
            )
            for line in list(set(lines)):
                if not len(line) == 0:
                    # <----- LOLO REVENUE ----->
                    # LOLO IN
                    # 20 Party
                    (
                        lolo_in_20_party_count,
                        lolo_in_20_party_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="IN",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="20",
                        apply_charges="Party",
                        line=line,
                        site=site,
                    )
                    # lolo_in_20_party_amount = float(
                    #     int(lolo_in_20_party_count) * float(site.size_20_rate)
                    # )

                    # 20 Line
                    (
                        lolo_in_20_line_count,
                        lolo_in_20_line_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="IN",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="20",
                        apply_charges="Line",
                        line=line,
                        site=site,
                    )
                    # lolo_in_20_line_amount = float(
                    #     int(lolo_in_20_line_count) * float(site.size_20_rate)
                    # )
                    # 40 Party
                    (
                        lolo_in_40_party_count,
                        lolo_in_40_party_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="IN",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="40",
                        apply_charges="Party",
                        line=line,
                        site=site,
                    )
                    # lolo_in_40_party_amount = float(
                    #     int(lolo_in_40_party_count) * float(site.size_40_rate)
                    # )
                    # 40 Line
                    (
                        lolo_in_40_line_count,
                        lolo_in_40_line_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="IN",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="40",
                        apply_charges="Line",
                        line=line,
                        site=site,
                    )
                    # lolo_in_40_line_amount = float(
                    #     int(lolo_in_40_line_count) * float(site.size_40_rate)
                    # )

                    # LOLO OUT
                    # 20 Party
                    (
                        lolo_out_20_party_count,
                        lolo_out_20_party_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="OUT",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="20",
                        apply_charges="Party",
                        line=line,
                        site=site,
                    )
                    # lolo_out_20_party_amount = float(
                    #     int(lolo_out_20_party_count) * float(site.size_20_rate)
                    # )
                    # 20 Line
                    (
                        lolo_out_20_line_count,
                        lolo_out_20_line_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="OUT",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="20",
                        apply_charges="Line",
                        line=line,
                        site=site,
                    )
                    # lolo_out_20_line_amount = float(
                    #     int(lolo_out_20_line_count) * float(site.size_20_rate)
                    # )
                    # 40 Party
                    (
                        lolo_out_40_party_count,
                        lolo_out_40_party_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="OUT",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="40",
                        apply_charges="Party",
                        line=line,
                        site=site,
                    )
                    # lolo_out_40_party_amount = float(
                    #     int(lolo_out_40_party_count) * float(site.size_40_rate)
                    # )
                    # 40 Line
                    (
                        lolo_out_40_line_count,
                        lolo_out_40_line_amount,
                    ) = get_mgmt_lolo_revenue_data(
                        movement="OUT",
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="40",
                        apply_charges="Line",
                        line=line,
                        site=site,
                    )
                    # lolo_out_40_line_amount = float(
                    #     int(lolo_out_40_line_count) * float(site.size_40_rate)
                    # )

                    # implement
                    lolo_in_data.append(
                        {
                            "line": line,
                            "party_20_qty": lolo_in_20_party_count,
                            "party_20_amt": lolo_in_20_party_amount,
                            "line_20_qty": lolo_in_20_line_count,
                            "line_20_amt": lolo_in_20_line_amount,
                            "party_40_qty": lolo_in_40_party_count,
                            "party_40_amt": lolo_in_40_party_amount,
                            "line_40_qty": lolo_in_40_line_count,
                            "line_40_amt": lolo_in_40_line_amount,
                        }
                    )
                    lolo_out_data.append(
                        {
                            "line": line,
                            "party_20_qty": lolo_out_20_party_count,
                            "party_20_amt": lolo_out_20_party_amount,
                            "line_20_qty": lolo_out_20_line_count,
                            "line_20_amt": lolo_out_20_line_amount,
                            "party_40_qty": lolo_out_40_party_count,
                            "party_40_amt": lolo_out_40_party_amount,
                            "line_40_qty": lolo_out_40_line_count,
                            "line_40_amt": lolo_out_40_line_amount,
                        }
                    )

                    # <------- Movement Summary ------>
                    # 20
                    (
                        op_bal_count_20,
                        in_data_count_20,
                        out_data_count_20,
                        cl_bal_count_20,
                    ) = get_size_summary_data(
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="20",
                        line=line,
                        site=site,
                    )
                    # 40
                    (
                        op_bal_count_40,
                        in_data_count_40,
                        out_data_count_40,
                        cl_bal_count_40,
                    ) = get_size_summary_data(
                        from_date_time=from_date_time,
                        to_date_time=to_date_time,
                        size="40",
                        line=line,
                        site=site,
                    )
                    summary_20_data.append(
                        {
                            "Line": line,
                            "OpBal": op_bal_count_20,
                            "InQty": in_data_count_20,
                            "OutQty": out_data_count_20,
                            "ClBal": cl_bal_count_20,
                        }
                    )
                    summary_40_data.append(
                        {
                            "Line": line,
                            "OpBal": op_bal_count_40,
                            "InQty": in_data_count_40,
                            "OutQty": out_data_count_40,
                            "ClBal": cl_bal_count_40,
                        }
                    )
                    # pendency count
                    (
                        survey_pending_30_days_count_size_20,
                        survey_pending_31_to_60_days_count_size_20,
                        survey_pending_61_to_90_days_count_size_20,
                        survey_pending_above_90_days_count_size_20,
                        estimate_pending_30_days_count_size_20,
                        estimate_pending_31_to_60_days_count_size_20,
                        estimate_pending_61_to_90_days_count_size_20,
                        estimate_pending_above_90_days_count_size_20,
                        approval_pending_30_days_count_size_20,
                        approval_pending_31_to_60_days_count_size_20,
                        approval_pending_61_to_90_days_count_size_20,
                        approval_pending_above_90_days_count_size_20,
                        repair_pending_30_days_count_size_20,
                        repair_pending_31_to_60_days_count_size_20,
                        repair_pending_61_to_90_days_count_size_20,
                        repair_pending_above_90_days_count_size_20,
                    ) = get_pendency_count_data(size="20", line=line, site=site)
                    (
                        survey_pending_30_days_count_size_40,
                        survey_pending_31_to_60_days_count_size_40,
                        survey_pending_61_to_90_days_count_size_40,
                        survey_pending_above_90_days_count_size_40,
                        estimate_pending_30_days_count_size_40,
                        estimate_pending_31_to_60_days_count_size_40,
                        estimate_pending_61_to_90_days_count_size_40,
                        estimate_pending_above_90_days_count_size_40,
                        approval_pending_30_days_count_size_40,
                        approval_pending_31_to_60_days_count_size_40,
                        approval_pending_61_to_90_days_count_size_40,
                        approval_pending_above_90_days_count_size_40,
                        repair_pending_30_days_count_size_40,
                        repair_pending_31_to_60_days_count_size_40,
                        repair_pending_61_to_90_days_count_size_40,
                        repair_pending_above_90_days_count_size_40,
                    ) = get_pendency_count_data(size="40", line=line, site=site)

                    upto_30_days_data.append(
                        {
                            "line": line,
                            "survey_pending_20_count": survey_pending_30_days_count_size_20,
                            "survey_pending_40_count": survey_pending_30_days_count_size_40,
                            "estimate_pending_20_count": estimate_pending_30_days_count_size_20,
                            "estimate_pending_40_count": estimate_pending_30_days_count_size_40,
                            "approval_pending_20_count": approval_pending_30_days_count_size_20,
                            "approval_pending_40_count": approval_pending_30_days_count_size_40,
                            "repair_pending_20_count": repair_pending_30_days_count_size_20,
                            "repair_pending_40_count": repair_pending_30_days_count_size_40,
                        }
                    )
                    days_30_to_60_data.append(
                        {
                            "line": line,
                            "survey_pending_20_count": survey_pending_31_to_60_days_count_size_20,
                            "survey_pending_40_count": survey_pending_31_to_60_days_count_size_40,
                            "estimate_pending_20_count": estimate_pending_31_to_60_days_count_size_20,
                            "estimate_pending_40_count": estimate_pending_31_to_60_days_count_size_40,
                            "approval_pending_20_count": approval_pending_31_to_60_days_count_size_20,
                            "approval_pending_40_count": approval_pending_31_to_60_days_count_size_40,
                            "repair_pending_20_count": repair_pending_31_to_60_days_count_size_20,
                            "repair_pending_40_count": repair_pending_31_to_60_days_count_size_40,
                        }
                    )
                    days_61_to_90_data.append(
                        {
                            "line": line,
                            "survey_pending_20_count": survey_pending_above_90_days_count_size_20,
                            "survey_pending_40_count": survey_pending_above_90_days_count_size_40,
                            "estimate_pending_20_count": estimate_pending_above_90_days_count_size_20,
                            "estimate_pending_40_count": estimate_pending_above_90_days_count_size_40,
                            "approval_pending_20_count": approval_pending_above_90_days_count_size_20,
                            "approval_pending_40_count": approval_pending_above_90_days_count_size_40,
                            "repair_pending_20_count": repair_pending_above_90_days_count_size_20,
                            "repair_pending_40_count": repair_pending_above_90_days_count_size_40,
                        }
                    )
                    above_90_days_data.append(
                        {
                            "line": line,
                            "survey_pending_20_count": survey_pending_61_to_90_days_count_size_20,
                            "survey_pending_40_count": survey_pending_61_to_90_days_count_size_40,
                            "estimate_pending_20_count": estimate_pending_61_to_90_days_count_size_20,
                            "estimate_pending_40_count": estimate_pending_61_to_90_days_count_size_40,
                            "approval_pending_20_count": approval_pending_61_to_90_days_count_size_20,
                            "approval_pending_40_count": approval_pending_61_to_90_days_count_size_40,
                            "repair_pending_20_count": repair_pending_61_to_90_days_count_size_20,
                            "repair_pending_40_count": repair_pending_61_to_90_days_count_size_40,
                        }
                    )

            # <--------------- LOLO REVENUE ----------->

            lolo_in_data_df_data = get_lolo_revenue_df_data(revenue_data=lolo_in_data)
            lolo_out_data_df_data = get_lolo_revenue_df_data(revenue_data=lolo_out_data)
            lolo_revenue_df_data.append(
                {
                    "site_name": site.name,
                    "lolo_in_revenue_df_data": lolo_in_data_df_data,
                    "lolo_out_revenue_df_data": lolo_out_data_df_data,
                }
            )

            # <----------- Movement Summary --------------->
            summary_20_df_data = get_summary_df_data(summary_data=summary_20_data)
            summary_40_df_data = get_summary_df_data(summary_data=summary_40_data)
            movemnt_summary_df_data.append(
                {
                    "site_name": site.name,
                    "summary_20_df_data": summary_20_df_data,
                    "summary_40_df_data": summary_40_df_data,
                }
            )

            # <----------- Pendency Count --------------->
            pendency_upto_30_days_df_data = get_pendency_df_data(
                pendency_data=upto_30_days_data
            )
            pendency_30_to_60_days_df_data = get_pendency_df_data(
                pendency_data=days_30_to_60_data
            )
            pendency_61_to_90_days_df_data = get_pendency_df_data(
                pendency_data=days_61_to_90_data
            )
            pendency_above_90_days_df_data = get_pendency_df_data(
                pendency_data=above_90_days_data
            )
            pendency_df_data.append(
                {
                    "site_name": site.name,
                    "pendency_upto_30_days_df_data": pendency_upto_30_days_df_data,
                    "pendency_30_to_60_days_df_data": pendency_30_to_60_days_df_data,
                    "pendency_61_to_90_days_df_data": pendency_61_to_90_days_df_data,
                    "pendency_above_90_days_df_data": pendency_above_90_days_df_data,
                }
            )

        file_name = (
            f"all_location_site_summary_{from_date}_{time_obj}_to_{to_date}_{time_obj}"
        )
        temp_file_path = create_all_line_daily_report_wb(
            movemnt_summary_df_data=movemnt_summary_df_data,
            lolo_revenue_df_data=lolo_revenue_df_data,
            pendency_df_data=pendency_df_data,
            from_date=from_date,
            from_time=time_obj,
            to_date=to_date,
            to_time=time_obj,
            file_name=file_name,
        )
        send_report_mail_to_mgmt(
            attachment_list=[temp_file_path], from_date=from_date, to_date=to_date
        )
        os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def westim_destim_reports_for_manager():
    lock = RedisLock(
        "daily_westim_destim_reports_for_manager_service",
        expire=120,
        heartbeat_interval=30,
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        site_managers = {
            "Ahmedabad": {
                "name": "Manish Mishra",
                "designation": "Manager - Operations",
                "email_id": "manish.mishra@goldenhorncontainers.com",
                "mobile_no": "9324950251",
            },
            "Sanand": {
                "name": "Manish Mishra",
                "designation": "Manager - Operations",
                "email_id": "manish.mishra@goldenhorncontainers.com",
                "mobile_no": "9324950251",
            },
            "Ankeleshwar": {
                "name": "Chirag Prahladdbhai Limbachiya",
                "designation": "Yard Incharge",
                "email_id": "opsankleshwar@goldenhorncontainers.com",
                "mobile_no": "9324950227",
            },
            "Baroda": {
                "name": "Parappattu Bhaskaran Sajeevan",
                "designation": "Manager - Operations",
                "email_id": "sajeevan@goldenhorncontainers.com",
                "mobile_no": "9727770903",
            },
            "INGHK": {
                "name": "Pinaki Maitra",
                "designation": "Manager - Operations & Business Development",
                "email_id": "pinaki.maitra@goldenhorncontainers.com",
                "mobile_no": "9727770249",
            },
            "INGHC": {
                "name": "Satyajit Sahoo",
                "designation": "Manager - Administration",
                "email_id": "satyajit.sahoo@goldenhorncontainers.com",
                "mobile_no": "9727770255",
            },
            "Matrix": {
                "name": "Kuracha Muthyala Naidu",
                "designation": "Kuracha Muthyala Naidu",
                "email_id": "opshyderabad@goldenhorncontainers.com",
                "mobile_no": "9727770238",
            },
            "JASAI": {
                "name": "Tapas Kumar Chatterjee",
                "designation": "Manager - Procurement",
                "email_id": "tapas.chatterjee@goldenhorncontainers.com",
                "mobile_no": "9727770244",
            },
            "Birgunj": {
                "name": "Prakash Sharma",
                "designation": "Manager - Operations",
                "email_id": "prakash.sharma@goldenhorncontainers.com",
                "mobile_no": "9845022044",
            },
            "kakinada": {
                "name": "K Bala Manikanta",
                "designation": "Manager - Operations ",
                "email_id": "manikanta.bala@goldenhorncontainers.com",
                "mobile_no": "9727770257",
            },
            "TUTICORIN": {
                "msc": {
                    "name": "Ranjith Kumar",
                    "designation": "Asst. Manager - Operations",
                    "email_id": "ranjith.kumar@goldenhorncontainers.com",
                    "mobile_no": "9003846693",
                },
                "cma": {
                    "name": "Pon Prakash Balakrishnan",
                    "designation": "Asst. Manager - Operations",
                    "email_id": "ponprakash.balakrishnan@goldenhorncontainers.com",
                    "mobile_no": "9003846693",
                },
            },
            "FARIDABAD": {
                "name": "Manoj Kamaldutt Naudiyal",
                "designation": "Manager - Operations",
                "email_id": "manoj.naudiyal@goldenhorncontainers.com",
                "mobile_no": "9727770253",
            },
            "Thimmapur": {
                "name": "Thupili Nagarjuna",
                "designation": "Asst. Manager - Operations",
                "email_id": "opsthimmapur@goldenhorncontainers.com",
                "mobile_no": "9727770239",
            },
            "Rishi CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "TG Terminal CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "Transworld CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "Allcargo CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "ZIRCONSIX": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "ZIRCON FOUR": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
        }
        for site_name in site_managers.keys():
            df_data = extract_data_for_destim_westim(site_name=site_name)
            if not len(df_data) == 0:
                temp_file_path = create_westim_destim_reports(
                    df_data=df_data, site=site_name
                )
                to_email_list = []

                manager = ""
                if site_name == "TUTICORIN":
                    to_email_list = [
                        site_managers[site_name]["msc"]["email_id"],
                        site_managers[site_name]["cma"]["email_id"],
                    ]
                    manager = f'{site_managers[site_name]["msc"]["name"]} and {site_managers[site_name]["cma"]["name"]}'
                else:
                    to_email_list = [site_managers[site_name]["email_id"]]
                    manager = site_managers[site_name]["name"]

                cc_email_list = [
                    "prakash.rewani@sunandpearls.com",
                    # "manjot.bajwa@sunandpearls.com",
                    "pooja.kumari@sunandpearls.com",
                ]
                send_report_mail_to_manager(
                    attachment_list=[temp_file_path],
                    to_email_list=to_email_list,
                    cc_email_list=cc_email_list,
                    manager=manager,
                    site=site_name,
                )
                os.remove(temp_file_path)
            else:
                pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion


@shared_task
def stuck_stock_sms_for_manager():
    lock = RedisLock(
        "daily_stuck_stock_sms_for_manager_service",
        expire=120,
        heartbeat_interval=30,
    )  # Using task name as lock name
    if not lock.acquire():
        return {"status": "Task already running, skipping execution"}

    try:
        site_managers = {
            "Ahmedabad": {
                "name": "Manish Mishra",
                "designation": "Manager - Operations",
                "email_id": "manish.mishra@goldenhorncontainers.com",
                "mobile_no": "9324950251",
            },
            "Sanand": {
                "name": "Manish Mishra",
                "designation": "Manager - Operations",
                "email_id": "manish.mishra@goldenhorncontainers.com",
                "mobile_no": "9324950251",
            },
            "Ankeleshwar": {
                "name": "Chirag Prahladdbhai Limbachiya",
                "designation": "Yard Incharge",
                "email_id": "opsankleshwar@goldenhorncontainers.com",
                "mobile_no": "9324950227",
            },
            "Baroda": {
                "name": "Parappattu Bhaskaran Sajeevan",
                "designation": "Manager - Operations",
                "email_id": "sajeevan@goldenhorncontainers.com",
                "mobile_no": "9727770903",
            },
            "INGHK": {
                "name": "Pinaki Maitra",
                "designation": "Manager - Operations & Business Development",
                "email_id": "pinaki.maitra@goldenhorncontainers.com",
                "mobile_no": "9727770249",
            },
            "INGHC": {
                "name": "Satyajit Sahoo",
                "designation": "Manager - Administration",
                "email_id": "satyajit.sahoo@goldenhorncontainers.com",
                "mobile_no": "9727770255",
            },
            "Matrix": {
                "name": "Kuracha Muthyala Naidu",
                "designation": "Kuracha Muthyala Naidu",
                "email_id": "opshyderabad@goldenhorncontainers.com",
                "mobile_no": "9727770238",
            },
            "JASAI": {
                "name": "Tapas Kumar Chatterjee",
                "designation": "Manager - Procurement",
                "email_id": "tapas.chatterjee@goldenhorncontainers.com",
                "mobile_no": "9727770244",
            },
            "Birgunj": {
                "name": "Prakash Sharma",
                "designation": "Manager - Operations",
                "email_id": "prakash.sharma@goldenhorncontainers.com",
                "mobile_no": "9845022044",
            },
            "kakinada": {
                "name": "K Bala Manikanta",
                "designation": "Manager - Operations ",
                "email_id": "manikanta.bala@goldenhorncontainers.com",
                "mobile_no": "9727770257",
            },
            "TUTICORIN": {
                "msc": {
                    "name": "Ranjith Kumar",
                    "designation": "Asst. Manager - Operations",
                    "email_id": "ranjith.kumar@goldenhorncontainers.com",
                    "mobile_no": "9003846693",
                },
                "cma": {
                    "name": "Pon Prakash Balakrishnan",
                    "designation": "Asst. Manager - Operations",
                    "email_id": "ponprakash.balakrishnan@goldenhorncontainers.com",
                    "mobile_no": "9003846693",
                },
            },
            "FARIDABAD": {
                "name": "Manoj Kamaldutt Naudiyal",
                "designation": "Manager - Operations",
                "email_id": "manoj.naudiyal@goldenhorncontainers.com",
                "mobile_no": "9727770253",
            },
            "Thimmapur": {
                "name": "Thupili Nagarjuna",
                "designation": "Asst. Manager - Operations",
                "email_id": "opsthimmapur@goldenhorncontainers.com",
                "mobile_no": "9727770239",
            },
            "Rishi CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "TG Terminal CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "Transworld CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "Allcargo CFS": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "ZIRCONSIX": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
            "ZIRCON FOUR": {
                "name": "Mallikarjun Malge",
                "designation": "Manager - Operations",
                "email_id": "mallikarjun.malge@goldenhorncontainers.com",
                "mobile_no": "9967274081",
            },
        }
        for site_name in site_managers.keys():
            stock_info, stock_data = get_stuck_stock_containers(site_name)
            if not len(stock_info) == 0:
                # mobile_no_list = []
                to_email_list = []
                manager = ""
                if site_name == "TUTICORIN":
                    # mobile_no_list = [
                    #     site_managers[site_name]["msc"]["mobile_no"],
                    #     site_managers[site_name]["cma"]["mobile_no"],
                    # ]
                    to_email_list = [
                        site_managers[site_name]["msc"]["email_id"],
                        site_managers[site_name]["cma"]["email_id"],
                    ]
                    manager = f'{site_managers[site_name]["msc"]["name"]} and {site_managers[site_name]["cma"]["name"]}'
                else:
                    # mobile_no_list = [site_managers[site_name]["mobile_no"]]
                    to_email_list = [site_managers[site_name]["email_id"]]
                    manager = site_managers[site_name]["name"]

                data = [
                    ["Line", "No of Containers"],
                ]
                for each_one in stock_info:
                    data.append([each_one, stock_info[each_one]])
                table = tabulate(data, headers="firstrow", tablefmt="simple")

                # for each in mobile_no_list:
                #     send_sms_from_sns(mobile_no=each, message=message)

                df_data = extract_data_for_stuck_stock_report(stock_data=stock_data)
                temp_file_path = create_stuck_stock_reports(
                    df_data=df_data, site=site_name
                )
                cc_email_list = [
                    "prakash.rewani@sunandpearls.com",
                    # "manjot.bajwa@sunandpearls.com",
                    "pooja.kumari@sunandpearls.com",
                ]

                if site_name == "TUTICORIN":
                    cc_email_list.append("seenivas@goldenhorncontainers.com")

                # to_email_list = ["manjot.bajwa@sunandpearls.com"]
                # cc_email_list = ["manjot.bajwa@sunandpearls.com"]
                send_report_mail_to_manager(
                    attachment_list=[temp_file_path],
                    to_email_list=to_email_list,
                    cc_email_list=cc_email_list,
                    manager=manager,
                    site=site_name,
                    is_westim_destim=False,
                    data=table,
                )
                os.remove(temp_file_path)
            else:
                pass
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
    finally:
        lock.release()  # Release the lock after completion
