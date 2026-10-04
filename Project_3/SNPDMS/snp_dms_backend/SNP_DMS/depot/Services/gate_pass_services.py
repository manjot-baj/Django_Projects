import datetime
import logging
import traceback
import os
from rest_framework import status
from rest_framework.response import Response
from wkhtmltopdf.views import PDFTemplateResponse
from account.models import AccountUser
from master.models import Location, Site
from depot.models import GateInHistory, GateOutHistory, EirLine
from common.error_logging import ErrorLogging
from django.conf import settings
from common.functions import send_sms_from_sns, upload_file
from decouple import config
from depot.whatsapp_utils import WhatsAppService


class GatePassService:
    """Service class to handle gate-in and gate-out pass generation."""

    @staticmethod
    def generate_gate_in_pass(request, gate_in_history_id):
        """Generate gate-in pass PDF for a given GateInHistory ID."""
        try:
            context = {}
            gih_object = GateInHistory.objects.get(pk=gate_in_history_id)
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)

            # Determine location and site
            try:
                location = Location.objects.get(name=request.data.get("location"))
                site = Site.objects.get(name=request.data.get("site"))
            except (Location.DoesNotExist, Site.DoesNotExist):
                location = app_user.location
                site = app_user.site

            # Gather data for PDF context
            container = gih_object.container.get_container()
            company_logo = location.get_location_detail().get("icon", "")
            eir = gih_object.eir.get_eir()
            eir_img = eir.get("eir_img", "")

            try:
                eir_line = [
                    line.get_eir_line()
                    for line in EirLine.objects.filter(eir=gih_object.eir)
                ]
            except:
                eir_line = []

            gate_in = gih_object.gate_in.get_gate_in()

            # Format context for PDF
            context = {
                "eir_no": eir.get("eir_no", ""),
                "company_logo": company_logo,
                "eir_img": eir_img,
                "shipping_line": container.get("shipping_line", ""),
                "container_no": container.get("container_no", ""),
                "date": (
                    datetime.datetime.strptime(gate_in.get("in_date", ""), "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                    if gate_in.get("in_date")
                    else ""
                ),
                "time": (
                    datetime.datetime.strptime(gate_in.get("in_time", ""), "%H:%M")
                    .time()
                    .strftime("%I:%M %p")
                    if gate_in.get("in_time")
                    else ""
                ),
                "cycle_type": "IN",
                "size": container.get("size", ""),
                "type": container.get("type", ""),
                "gate_pass_no": gate_in.get("gate_pass_no", ""),
                "license_no": gate_in.get("driver_license", ""),
                "truck_no": gate_in.get("vehicle_no", ""),
                "transporter_name": gate_in.get("transporter_name", ""),
                "going_to_coming_from": gate_in.get("source", ""),
                "seal_no": "",
                "booking_no": "",
                "driver_name": gate_in.get("driver_name", ""),
                "vessel": gate_in.get("vessel_name", ""),
                "voyage": gate_in.get("voyage_no", ""),
                "consignee_name": gate_in.get("consignee", ""),
                "eir_done_by": eir.get("done_by", ""),
                "shipper_name": gate_in.get("shipper", ""),
                "eir_line": eir_line,
                "site_address": site.get_site_detail().get("address", ""),
                "image_link": gate_in.get("image_link", ""),
                "driver_mobile_no": gate_in.get("driver_mobile_no", ""),
            }

            # Generate PDF response
            response = PDFTemplateResponse(
                request=request,
                template="depot/gate-pass.html",
                filename=f"gate_in_pass_{gate_in_history_id}.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={"margin-top": 50},
            )
            # ------------------Send SMS to Driver-------------------
            driver_mobile_no = gate_in.get("driver_mobile_no", "")
            if not len(driver_mobile_no) == 0:
                response.render()
                file_name = f"gate_in_pass_{gate_in_history_id}.pdf"

                temp_dir = os.path.join(settings.BASE_DIR, "temp")
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                temp_file_path = os.path.join(temp_dir, file_name)
                with open(temp_file_path, "wb") as f:
                    f.write(response.content)

                s3_object_path = f"gate_pass_IN/{file_name}"

                upload_status = upload_file(
                    file_name=temp_file_path,
                    bucket=config("AWS_REPAIR_IMAGE_BUCKET_NAME"),
                    object_name=s3_object_path,
                    public_access=True,
                )

                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

                if not upload_status:
                    return Response({"errorMsg": "Failed to upload PDF"}, status=200)

                file_url = f"https://{config('AWS_REPAIR_IMAGE_BUCKET_NAME')}.s3.{config('AWS_S3_REGION_NAME')}.amazonaws.com/{s3_object_path}"

                try:
                    _ = WhatsAppService.send_gatepass(
                        mobile=driver_mobile_no,
                        pdf_url=file_url,
                        container_no=container.get("container_no", ""),
                        vehicle_no=gate_in.get("vehicle_no", ""),
                    )
                except:
                    ErrorLogging().log_error()
                    pass

            return response

        except GateInHistory.DoesNotExist:
            return Response(
                {"errorMsg": "GateInHistory record not found"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [{str(e)}]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def generate_gate_out_pass(request, gate_out_history_id):
        """Generate gate-out pass PDF for a given GateOutHistory ID."""
        try:
            context = {}
            goh_object = GateOutHistory.objects.get(pk=gate_out_history_id)
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)

            # Determine location and site
            try:
                location = Location.objects.get(name=request.data.get("location"))
                site = Site.objects.get(name=request.data.get("site"))
            except (Location.DoesNotExist, Site.DoesNotExist):
                location = app_user.location
                site = app_user.site

            # Gather data for PDF context
            container = goh_object.container.get_container()
            company_logo = location.get_location_detail().get("icon", "")
            eir = goh_object.eir.get_eir()
            eir_img = eir.get("eir_img", "")

            try:
                eir_line = [
                    line.get_eir_line()
                    for line in EirLine.objects.filter(eir=goh_object.eir)
                ]
            except:
                eir_line = []

            gate_out = goh_object.gate_out.get_gate_out()

            # Format context for PDF
            context = {
                "eir_no": eir.get("eir_no", ""),
                "company_logo": company_logo,
                "eir_img": eir_img,
                "shipping_line": container.get("shipping_line", ""),
                "container_no": container.get("container_no", ""),
                "date": (
                    datetime.datetime.strptime(gate_out.get("out_date", ""), "%Y-%m-%d")
                    .date()
                    .strftime("%d/%m/%Y")
                    if gate_out.get("out_date")
                    else ""
                ),
                "time": (
                    datetime.datetime.strptime(gate_out.get("out_time", ""), "%H:%M")
                    .time()
                    .strftime("%I:%M %p")
                    if gate_out.get("out_time")
                    else ""
                ),
                "cycle_type": "OUT",
                "size": container.get("size", ""),
                "type": container.get("type", ""),
                "gate_pass_no": gate_out.get("gate_pass_no", ""),
                "license_no": gate_out.get("driver_license", ""),
                "truck_no": gate_out.get("vehicle_no", ""),
                "transporter_name": gate_out.get("transporter_name", ""),
                "going_to_coming_from": gate_out.get("destination", ""),
                "seal_no": gate_out.get("seal_no", ""),
                "booking_no": gate_out.get("booking_no", ""),
                "driver_name": gate_out.get("driver_name", ""),
                "vessel": gate_out.get("vessel_name", ""),
                "voyage": gate_out.get("voyage_no", ""),
                "consignee_name": gate_out.get("consignee", ""),
                "eir_done_by": eir.get("done_by", ""),
                "shipper_name": gate_out.get("shipper", ""),
                "eir_line": eir_line,
                "site_address": site.get_site_detail().get("address", ""),
                "image_link": gate_out.get("image_link", ""),
                "driver_mobile_no": gate_out.get("driver_mobile_no", ""),
            }

            # Generate PDF response
            response = PDFTemplateResponse(
                request=request,
                template="depot/gate-pass.html",
                filename=f"gate_out_pass_{gate_out_history_id}.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={"margin-top": 50},
            )

            # ------------------Send SMS to Driver-------------------
            driver_mobile_no = gate_out.get("driver_mobile_no", "")
            if not len(driver_mobile_no) == 0:
                response.render()
                file_name = f"gate_out_pass_{gate_out_history_id}.pdf"

                temp_dir = os.path.join(settings.BASE_DIR, "temp")
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)

                temp_file_path = os.path.join(temp_dir, file_name)
                with open(temp_file_path, "wb") as f:
                    f.write(response.content)

                s3_object_path = f"gate_pass_OUT/{file_name}"

                upload_status = upload_file(
                    file_name=temp_file_path,
                    bucket=config("AWS_REPAIR_IMAGE_BUCKET_NAME"),
                    object_name=s3_object_path,
                    public_access=True,
                )

                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

                if not upload_status:
                    return Response({"errorMsg": "Failed to upload PDF"}, status=200)

                file_url = f"https://{config('AWS_REPAIR_IMAGE_BUCKET_NAME')}.s3.{config('AWS_S3_REGION_NAME')}.amazonaws.com/{s3_object_path}"

                try:
                    _ = WhatsAppService.send_gatepass(
                        mobile=driver_mobile_no,
                        pdf_url=file_url,
                        container_no=container.get("container_no", ""),
                        vehicle_no=gate_out.get("vehicle_no", ""),
                    )
                except:
                    ErrorLogging().log_error()
                    pass

            return response

        except GateOutHistory.DoesNotExist:
            return Response(
                {"errorMsg": "GateOutHistory record not found"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [{str(e)}]"}, status=status.HTTP_200_OK
            )
