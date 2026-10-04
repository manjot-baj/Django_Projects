import datetime, logging, traceback
from django.utils import timezone


def loaded_yard_edi_content(
    container_no,
    type_size,
    move_code,
    date,
    time,
    current_location,
    to_location,
    booking_no,
    customer,
    transporter,
    truck_no,
    condition,
    mode_of_transport,
    job_order_no,
):
    try:
        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        format_container_no = "{:<15}".format(container_no)
        c_size_type = type_size
        format_c_size_type = "{:<10}".format(c_size_type)
        format_move_code = "{:<10}".format(move_code)
        move_code_date = date
        move_code_time = time
        move_code_date_time = datetime.datetime.combine(
            date=move_code_date, time=move_code_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = move_code_date_time - datetime.timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        format_current_location = "{:<5}".format(current_location)
        format_to_location = "{:<5}".format(to_location)
        format_booking_no = "{:<25}".format(booking_no)
        format_customer = "{:<10}".format(customer)
        format_transporter = "{:<10}".format(transporter)
        format_truck_no = "{:<25}".format(truck_no)
        format_condition = "{:<1}".format(condition)
        reported_by = "MMS"
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_to_location[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
