from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from mnr.models import MnrStaff, MnrStaffAttendance
from datetime import datetime
import logging, traceback
from rest_framework.permissions import IsAuthenticated
from account.permissions import HasAllowedRoles
from django.core.paginator import Paginator
from django.db.models import Q
from django.db import IntegrityError


class AttendanceListAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin"]

    def post(self, request, *args, **kwargs):
        try:
            pg_no = request.data["pg_no"]
            on_page_data = request.data["on_page_data"]
            location_name = request.data.get("location")
            site_name = request.data.get("site")
            from_date = request.data.get("from_date")
            to_date = request.data.get("to_date")
            role = request.data.get("role")
            firstName = request.data.get("firstName")
            lastName = request.data.get("lastName")

            filters = Q()
            if location_name:
                filters &= Q(employee__location__name=location_name)
            if site_name:
                filters &= Q(employee__site__name=site_name)
            if from_date and to_date:
                filters &= Q(date__range=[from_date, to_date])
            if role:
                filters &= Q(employee__role=role)
            if firstName:
                filters &= Q(employee__firstName=firstName)
            if lastName:
                filters &= Q(employee__lastName=lastName)

            attendance_qs = (
                MnrStaffAttendance.objects.select_related(
                    "employee", "employee__location", "employee__site"
                )
                .filter(filters)
                .order_by("-date")
            )

            # pagination
            paginator = Paginator(attendance_qs, on_page_data)
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
                    "id": att.pk,
                    "employee": att.employee.get_staff(),
                    "date": att.date.strftime("%Y-%m-%d"),
                    "status": att.status,
                    "in_time": att.in_time.strftime("%H:%M") if att.in_time else "",
                    "out_time": att.out_time.strftime("%H:%M") if att.out_time else "",
                    "remarks": att.remarks if att.remarks else "",
                    "sr_no": current_page.start_index() + index,
                }
                for index, att in enumerate(current_page.object_list)
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


class AttendanceAPIView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin"]

    def get(self, request, pk):
        try:
            attendance = get_object_or_404(MnrStaffAttendance, pk=pk)
            data = {
                "id": attendance.id,
                "employee": attendance.employee.get_staff(),
                "date": attendance.date.strftime("%Y-%m-%d"),
                "status": attendance.status,
                "in_time": (
                    attendance.in_time.strftime("%H:%M") if attendance.in_time else ""
                ),
                "out_time": (
                    attendance.out_time.strftime("%H:%M") if attendance.out_time else ""
                ),
                "remarks": attendance.remarks if attendance.remarks else "",
            }
            return Response(data, status=200)
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    def post(self, request):
        try:
            emp_id = request.data.get("employee")
            date_str = request.data.get("date")
            status_val = request.data.get("status", "Absent")
            in_time = request.data.get("in_time", None)
            out_time = request.data.get("out_time", None)
            remarks = request.data.get("remarks", None)

            employee = get_object_or_404(MnrStaff, pk=emp_id)
            date = datetime.strptime(date_str, "%Y-%m-%d").date()

            if not status_val in ["Absent", "Leave"] and in_time is None:
                return Response(
                    {"errorMsg": "In time is required for Present status."},
                    status=200,
                )

            attendance = MnrStaffAttendance.objects.create(
                employee=employee,
                date=date,
                status=status_val,
                in_time=in_time,
                out_time=out_time,
                remarks=remarks,
            )

            return Response(
                {"successMsg": "Attendance created successfully"},
                status=200,
            )
        except IntegrityError:
            return Response(
                {
                    "errorMsg": "Attendance record for this employee and date already exists."
                },
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    def put(self, request, pk):
        try:
            attendance = get_object_or_404(MnrStaffAttendance, pk=pk)
            date_str = request.data.get("date")
            in_time_str = request.data.get("in_time", None)
            out_time_str = request.data.get("out_time", None)
            if (
                not request.data.get("status") in ["Absent", "Leave"]
                and in_time_str is None
            ):
                return Response(
                    {"errorMsg": "In time is required for Present status."},
                    status=200,
                )
            if date_str:
                attendance.date = datetime.strptime(date_str, "%Y-%m-%d").date()
            if in_time_str and not len(in_time_str) == 0:
                attendance.in_time = datetime.strptime(in_time_str, "%H:%M").time()
            if out_time_str and not len(out_time_str) == 0:
                attendance.out_time = datetime.strptime(out_time_str, "%H:%M").time()

            attendance.status = request.data.get("status", attendance.status)
            attendance.remarks = request.data.get("remarks", attendance.remarks)
            attendance.save()

            return Response(
                {"successMsg": "Attendance updated successfully"},
                status=200,
            )
        except IntegrityError:
            return Response(
                {
                    "errorMsg": "Attendance record for this employee and date already exists."
                },
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)

    def delete(self, request, pk):
        try:
            attendance = get_object_or_404(MnrStaffAttendance, pk=pk)
            attendance.delete()
            return Response(
                {"successMsg": "Attendance deleted successfully"},
                status=200,
            )
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": str(e)}, status=200)
