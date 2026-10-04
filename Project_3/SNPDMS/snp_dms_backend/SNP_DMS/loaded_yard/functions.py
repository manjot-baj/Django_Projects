# import logging, traceback, openpyxl, datetime
# from depot.functions_two import check_char_digit
# from django.utils import timezone
# from SNP_DMS.settings.base import BASE_DIR
# import os
# from django.http import HttpResponse
# from loaded_yard.models import LoadedYard
# from django.db.models import Q


# def extract_data_list(input_excel):
#     ps = openpyxl.load_workbook(input_excel)
#     sheet = ps["loaded_yard"]
#     container_no_raw = [
#         sheet["A" + str(row)].value for row in range(1, sheet.max_row + 1)
#     ]
#     size_raw = [sheet["B" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     port_raw = [sheet["C" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     liner_raw = [sheet["D" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     inward_rake_raw = [
#         sheet["E" + str(row)].value for row in range(1, sheet.max_row + 1)
#     ]
#     outward_rake_raw = [
#         sheet["F" + str(row)].value for row in range(1, sheet.max_row + 1)
#     ]
#     iit_date_raw = [sheet["G" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     iit_time_raw = [sheet["H" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     dvan_date_raw = [sheet["I" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     dvan_time_raw = [sheet["J" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mtin_date_raw = [sheet["K" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mtin_time_raw = [sheet["L" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     van_date_raw = [sheet["M" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     van_time_raw = [sheet["N" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     booking_no_raw = [
#         sheet["O" + str(row)].value for row in range(1, sheet.max_row + 1)
#     ]
#     seal_no_raw = [sheet["P" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mir_date_raw = [sheet["Q" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mir_time_raw = [sheet["R" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mot_date_raw = [sheet["S" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mot_time_raw = [sheet["T" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mit_date_raw = [sheet["U" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mit_time_raw = [sheet["V" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mor_date_raw = [sheet["W" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     mor_time_raw = [sheet["X" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     expin_date_raw = [
#         sheet["Y" + str(row)].value for row in range(1, sheet.max_row + 1)
#     ]
#     expin_time_raw = [
#         sheet["Z" + str(row)].value for row in range(1, sheet.max_row + 1)
#     ]
#     eot_date_raw = [sheet["AA" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     eot_time_raw = [sheet["AB" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     report_raw = [sheet["AC" + str(row)].value for row in range(1, sheet.max_row + 1)]
#     remarks_raw = [sheet["AD" + str(row)].value for row in range(1, sheet.max_row + 1)]

#     container_no = [each if each is not None else "" for each in container_no_raw]
#     size = [each if each is not None else "" for each in size_raw]
#     port = [each if each is not None else "" for each in port_raw]
#     liner = [each if each is not None else "" for each in liner_raw]
#     inward_rake = [each if each is not None else "" for each in inward_rake_raw]
#     outward_rake = [each if each is not None else "" for each in outward_rake_raw]
#     iit_date = [each if each is not None else "" for each in iit_date_raw]
#     iit_time = [each if each is not None else "" for each in iit_time_raw]
#     dvan_date = [each if each is not None else "" for each in dvan_date_raw]
#     dvan_time = [each if each is not None else "" for each in dvan_time_raw]
#     mtin_date = [each if each is not None else "" for each in mtin_date_raw]

#     mtin_time = [each if each is not None else "" for each in mtin_time_raw]
#     van_date = [each if each is not None else "" for each in van_date_raw]
#     van_time = [each if each is not None else "" for each in van_time_raw]
#     booking_no = [each if each is not None else "" for each in booking_no_raw]
#     seal_no = [each if each is not None else "" for each in seal_no_raw]
#     mir_date = [each if each is not None else "" for each in mir_date_raw]
#     mir_time = [each if each is not None else "" for each in mir_time_raw]
#     mot_date = [each if each is not None else "" for each in mot_date_raw]
#     mot_time = [each if each is not None else "" for each in mot_time_raw]
#     mit_date = [each if each is not None else "" for each in mit_date_raw]
#     mit_time = [each if each is not None else "" for each in mit_time_raw]
#     mor_date = [each if each is not None else "" for each in mor_date_raw]
#     mor_time = [each if each is not None else "" for each in mor_time_raw]
#     expin_date = [each if each is not None else "" for each in expin_date_raw]
#     expin_time = [each if each is not None else "" for each in expin_time_raw]
#     eot_date = [each if each is not None else "" for each in eot_date_raw]
#     eot_time = [each if each is not None else "" for each in eot_time_raw]
#     report = [each if each is not None else "" for each in report_raw]
#     remarks = [each if each is not None else "" for each in remarks_raw]

#     popped = [
#         container_no.pop(0),
#         size.pop(0),
#         port.pop(0),
#         liner.pop(0),
#         inward_rake.pop(0),
#         outward_rake.pop(0),
#         iit_date.pop(0),
#         iit_time.pop(0),
#         dvan_date.pop(0),
#         dvan_time.pop(0),
#         mtin_date.pop(0),
#         mtin_time.pop(0),
#         van_date.pop(0),
#         van_time.pop(0),
#         booking_no.pop(0),
#         seal_no.pop(0),
#         mir_date.pop(0),
#         mir_time.pop(0),
#         mot_date.pop(0),
#         mot_time.pop(0),
#         mit_date.pop(0),
#         mit_time.pop(0),
#         mor_date.pop(0),
#         mor_time.pop(0),
#         expin_date.pop(0),
#         expin_time.pop(0),
#         eot_date.pop(0),
#         eot_time.pop(0),
#         report.pop(0),
#         remarks.pop(0),
#     ]

#     headers = [
#         "CONTAINER",
#         "SIZE",
#         "PORT",
#         "LINER/MERCHANT",
#         "INWARD RAKE",
#         "OUTWARD RAKE",
#         "IIT",
#         "IIT TIME",
#         "DVAN",
#         "DVAN TIME",
#         "MTIN",
#         "MTIN TIME",
#         "VAN",
#         "VAN TIME",
#         "BOOKING NO",
#         "SEAL NO",
#         "MIR",
#         "MIR TIME",
#         "MOT",
#         "MOT TIME",
#         "MIT",
#         "MIT TIME",
#         "MOR",
#         "MOR TIME",
#         "EXPIN",
#         "EXPIN TIME",
#         "EOT",
#         "EOT TIME",
#         "REPORT",
#         "REMARKS",
#     ]


#     if not popped == headers:
#         return "Header Not Found"

#     extracted_data_list = []

#     for i in range(len(container_no)):
#         extracted_data_list.append(
#             {
#                 "sr_no": str(i),
#                 "container_no": str(container_no[i]),
#                 "size": str(size[i]),
#                 "port": str(port[i]),
#                 "liner": str(liner[i]),
#                 "inward_rake": str(inward_rake[i]),
#                 "outward_rake": str(outward_rake[i]),
#                 "iit_date": str(iit_date[i]),
#                 "iit_time": str(iit_time[i]),
#                 "dvan_date": str(dvan_date[i]),
#                 "dvan_time": str(dvan_time[i]),
#                 "mtin_date": str(mtin_date[i]),
#                 "mtin_time": str(mtin_time[i]),
#                 "van_date": str(van_date[i]),
#                 "van_time": str(van_time[i]),
#                 "booking_no": str(booking_no[i]),
#                 "seal_no": str(seal_no[i]),
#                 "mir_date": str(mir_date[i]),
#                 "mir_time": str(mir_time[i]),
#                 "mot_date": str(mot_date[i]),
#                 "mot_time": str(mot_time[i]),
#                 "mit_date": str(mit_date[i]),
#                 "mit_time": str(mit_time[i]),
#                 "mor_date": str(mor_date[i]),
#                 "mor_time": str(mor_time[i]),
#                 "expin_date": str(expin_date[i]),
#                 "expin_time": str(expin_time[i]),
#                 "eot_date": str(eot_date[i]),
#                 "eot_time": str(eot_time[i]),
#                 "report": str(report[i]),
#                 "remarks": str(remarks[i]),
#             }
#         )
#     ps.close()
#     return extracted_data_list


# def get_date_time_obj(date_str):
#     if date_str:
#         date = datetime.datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
#     else:
#         date = None
#     return date


# def extract_loaded_yard_excel_data(input_excel, location, site):
#     try:

#         extracted_data_list = extract_data_list(input_excel)
#         error_data = []
#         error_data_msg = {}
#         correct_data = []

#         for each in extracted_data_list:
#             error_msg = []
#             in_move_code_count = 0
#             out_move_code_count = 0
#             container_no_str = each["container_no"]

#             if len(container_no_str) == 11 and check_char_digit(container_no_str):
#                 is_container_repeated = any(
#                     obj_data["container_no"] == container_no_str
#                     for obj_data in correct_data
#                 )
#                 if LoadedYard.objects.filter(
#                     container_no=container_no_str, location=location, site=site
#                 ).exists():
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
#                         f"({container_no_str}) already exists in system"
#                     )
#                 else:
#                     error_msg.append("")
#                 if is_container_repeated:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
#                         f"this({container_no_str}) container is repeated in your file"
#                     )
#                 else:
#                     error_msg.append("")

#             else:
#                 error_msg.append(
#                     f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
#                     f"container_no ({container_no_str}) is invalid"
#                 )

#             size_str = each["size"]
#             if not size_str == "":
#                 error_msg.append("")
#             else:
#                 error_msg.append(
#                     f"In row {str(int(each['sr_no']) + 2)} there is problem in SIZE column, "
#                     f"Please Fill Data"
#                 )

#             iit_date_str = each["iit_date"]
#             if not iit_date_str == "":
#                 in_move_code_count += 1
#                 try:
#                     datetime.datetime.strptime(iit_date_str, "%Y-%m-%d %H:%M:%S").date()

#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in IIT column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )

#                 if each["iit_time"] == "":
#                     each["iit_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["iit_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in IIT TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             dvan_date_str = each["dvan_date"]
#             if not dvan_date_str == "":
#                 out_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(
#                         dvan_date_str, "%Y-%m-%d %H:%M:%S"
#                     ).date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in DVAN column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["dvan_time"] == "":
#                     each["dvan_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["dvan_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in DVAN TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             mtin_date_str = each["mtin_date"]
#             if not mtin_date_str == "":
#                 in_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(
#                         mtin_date_str, "%Y-%m-%d %H:%M:%S"
#                     ).date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in MTIN column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["mtin_time"] == "":
#                     each["mtin_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["mtin_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in MTIN TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             van_date_str = each["van_date"]
#             if not van_date_str == "":
#                 out_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(van_date_str, "%Y-%m-%d %H:%M:%S").date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in VAN column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["van_time"] == "":
#                     each["van_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["van_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in VAN TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             mir_date_str = each["mir_date"]
#             if not mir_date_str == "":
#                 in_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(mir_date_str, "%Y-%m-%d %H:%M:%S").date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in MIR column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["mir_time"] == "":
#                     each["mir_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["mir_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in MIR TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             mot_date_str = each["mot_date"]
#             if not mot_date_str == "":
#                 out_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(mot_date_str, "%Y-%m-%d %H:%M:%S").date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["mot_time"] == "":
#                     each["mot_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["mot_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             mit_date_str = each["mit_date"]
#             if not mit_date_str == "":
#                 in_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(mit_date_str, "%Y-%m-%d %H:%M:%S").date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in MIT column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["mit_time"] == "":
#                     each["mit_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["mit_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in MIT TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             mor_date_str = each["mor_date"]
#             if not mor_date_str == "":
#                 out_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(mor_date_str, "%Y-%m-%d %H:%M:%S").date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["mor_time"] == "":
#                     each["mor_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["mor_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             expin_date_str = each["expin_date"]
#             if not expin_date_str == "":
#                 in_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(
#                         expin_date_str, "%Y-%m-%d %H:%M:%S"
#                     ).date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in EXPIN column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["expin_time"] == "":
#                     each["expin_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(
#                             each["expin_time"], "%H:%M:%S"
#                         ).time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in EXPIN TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             eot_date_str = each["eot_date"]
#             if not eot_date_str == "":
#                 out_move_code_count += 1

#                 try:
#                     datetime.datetime.strptime(eot_date_str, "%Y-%m-%d %H:%M:%S").date()
#                     error_msg.append("")
#                 except:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in EOT column,"
#                         f"date is not in dd-mm-yyyy format"
#                     )
#                 if each["eot_time"] == "":
#                     each["eot_time"] = (
#                         datetime.datetime.now()
#                         .astimezone(timezone.get_current_timezone())
#                         .time()
#                         .strftime("%H:%M:%S")
#                     )
#                 else:
#                     try:
#                         datetime.datetime.strptime(each["eot_time"], "%H:%M:%S").time()
#                         error_msg.append("")
#                     except:
#                         error_msg.append(
#                             f"In row {str(int(each['sr_no']) + 2)} there is problem in EOT TIME column,"
#                             f"time is not in HH:MM format"
#                         )
#             else:
#                 error_msg.extend([""] * 2)

#             booking_no_str = each["booking_no"]
#             if booking_no_str == "":
#                 if out_move_code_count > 0:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
#                         f"Cannot keep booking_no column empty for out move code"
#                     )
#                 else:
#                     error_msg.append("")
#             else:
#                 error_msg.append("")

#             iit_date = get_date_time_obj(date_str=each["iit_date"])
#             dvan_date = get_date_time_obj(date_str=each["dvan_date"])
#             mtin_date = get_date_time_obj(date_str=each["mtin_date"])
#             van_date = get_date_time_obj(date_str=each["van_date"])
#             mir_date = get_date_time_obj(date_str=each["mir_date"])
#             mot_date = get_date_time_obj(date_str=each["mot_date"])
#             mit_date = get_date_time_obj(date_str=each["mit_date"])
#             mor_date = get_date_time_obj(date_str=each["mor_date"])
#             expin_date = get_date_time_obj(date_str=each["expin_date"])
#             eot_date = get_date_time_obj(date_str=each["eot_date"])

#             if in_move_code_count == 0 and out_move_code_count == 0:
#                 error_msg.append(
#                     f"In row {str(int(each['sr_no']) + 2)} Please fill atleast one move code data"
#                 )
#             else:
#                 if (
#                     LoadedYard.objects.filter(
#                         Q(container_no=each["container_no"])
#                         & Q(type_size=each["size"])
#                         & Q(process_type="IN")
#                         & Q(port=each["port"])
#                         & Q(liner_merchant=each["liner"])
#                         & Q(inward_rake=each["inward_rake"])
#                         & Q(outward_rake=each["outward_rake"])
#                         & Q(iit_date=iit_date)
#                         & Q(mtin_date=mtin_date)
#                         & Q(mir_date=mir_date)
#                         & Q(mit_date=mit_date)
#                         & Q(expin_date=expin_date)
#                         & Q(booking_no=each["booking_no"])
#                         & Q(seal_no=each["seal_no"])
#                         & Q(report=each["report"])
#                         & Q(location=location)
#                         & Q(site=site)
#                     ).exists()
#                     or LoadedYard.objects.filter(
#                         Q(container_no=each["container_no"])
#                         & Q(type_size=each["size"])
#                         & Q(process_type="OUT")
#                         & Q(port=each["port"])
#                         & Q(liner_merchant=each["liner"])
#                         & Q(inward_rake=each["inward_rake"])
#                         & Q(outward_rake=each["outward_rake"])
#                         & Q(dvan_date=dvan_date)
#                         & Q(van_date=van_date)
#                         & Q(mot_date=mot_date)
#                         & Q(mor_date=mor_date)
#                         & Q(eot_date=eot_date)
#                         & Q(booking_no=each["booking_no"])
#                         & Q(seal_no=each["seal_no"])
#                         & Q(report=each["report"])
#                         & Q(location=location)
#                         & Q(site=site)
#                     ).exists()
#                 ):
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} {container_no_str} Similar Data Exists"
#                     )
#                 else:
#                     error_msg.append("")
#                 if dvan_date_str == "" and out_move_code_count != 0:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} DVAN DATE is mandatory if you want to fill OUT move codes,"
#                     )
#                 else:
#                     error_msg.append("")
#                 if iit_date_str == "" and in_move_code_count != 0:
#                     error_msg.append(
#                         f"In row {str(int(each['sr_no']) + 2)} IIT DATE is mandatory if you want to fill IN move codes,"
#                     )
#                 else:
#                     error_msg.append("")
#                 error_msg.append("")

#             each["in_move_code_count"] = in_move_code_count
#             each["out_move_code_count"] = out_move_code_count

#             error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
#             if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
#                 error_data.append(each)
#             if not each in error_data:
#                 correct_data.append(each)
#         correct_data_count = str(len(correct_data))
#         error_data_count = str(len(error_data))
#         main_data = {
#             "importable_data": correct_data,
#             "importable_data_count": correct_data_count,
#             "rejected_data": error_data,
#             "rejected_data_count": error_data_count,
#             "faults": error_data_msg,
#         }
#         return main_data
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return False


# def make_loaded_yard_edi_file(edi_content):
#     try:
#         if not os.path.exists(os.path.join(BASE_DIR, "temp/loaded_yard_edi/")):
#             os.makedirs(os.path.join(BASE_DIR, "temp/loaded_yard_edi/"))
#         temp_file_path = os.path.join(BASE_DIR, f"temp/loaded_yard_edi/loaded_yard.edi")

#         with open(temp_file_path, "w") as temp:
#             temp.write(edi_content)

#         return temp_file_path
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return False


# def download_loaded_yard_edi(temp_file_path):
#     try:
#         current_date_time = datetime.datetime.now()
#         current_date_time_str = current_date_time.strftime("%Y-%m-%d %H:%M:%S")
#         with open(temp_file_path, "rb") as temp:
#             file_response = HttpResponse(temp.read(), content_type=f"application/edi")
#             file_response[
#                 "Content-Disposition"
#             ] = f'attachment; filename="{current_date_time_str}_loaded_yard.edi"'
#             os.remove(temp_file_path)
#         return file_response
#     except:
#         error_log = logging.getLogger("error_log")
#         error_log.error(traceback.format_exc())
#         return False
