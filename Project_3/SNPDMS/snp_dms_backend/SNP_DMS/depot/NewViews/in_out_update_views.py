from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.permissions import HasAllowedRoles
from depot.Services.in_out_update_services import GateUpdateService
from django.db import transaction
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging
from depot.models import GateInHistory, GateOutHistory
from billing_invoice.functions import create_billing_lolo, create_billing_st
from depot.functions import (
    apply_lolo_night_charges,
    upload_driver_img_to_s3,
    unlock_mnr_bills,
)


class UpdateGateInProcess(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = GateUpdateService

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            app_user, location, site = self.service.get_user_and_location(request)
            main_data = self.service.get_gate_data(
                data=data,
                container_no=data["container_no"],
                date_str=data["date"],
                location=location,
                site=site,
                process_type="IN",
            )
            return Response(main_data, status=200)
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials {e}"}, status=200)

    def put(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            app_user, location, site = self.service.get_user_and_location(request)
            gih = GateInHistory.objects.get(pk=data["gih_pk"])

            with transaction.atomic():
                validation = self.service.validate_container_no(
                    data["container_data"]["container_no"],
                    location,
                    site,
                    gih.container,
                )
                self.service.validate_manufacturing_date(
                    data["container_data"]["container_no"],
                    data["container_data"]["manufacturing_date"],
                    location,
                    site,
                    app_user,
                    gih.container,
                    date_format="%Y-%m-%d",
                )

                if data.get("container_data"):
                    self.service.update_container(
                        data["container_data"],
                        location,
                        site,
                        validation,
                        data["container_data"].get("client"),
                        process_type="IN",
                    )
                if data.get("eir_data"):
                    self.service.update_eir(data["eir_data"])
                if data.get("gate_in_data"):
                    self.service.update_gate_in(
                        data["gate_in_data"], data["eir_data"], data["gih_pk"]
                    )
                if data.get("lolo_data"):
                    self.service.update_lolo(
                        data["lolo_data"],
                        data["container_data"],
                        location,
                        site,
                        data["container_data"].get("client"),
                        data["gih_pk"],
                        process_type="IN",
                    )
                if data.get("self_transportation_data"):
                    self.service.update_self_transportation(
                        data["self_transportation_data"],
                        data["container_data"],
                        location,
                        site,
                        data["container_data"].get("client"),
                        data["gih_pk"],
                        process_type="IN",
                    )

                gih = GateInHistory.objects.get(pk=data["gih_pk"])
                if gih.lolo.payment_type != "None":
                    create_billing_lolo(obj=gih, process="IN")
                if (
                    data.get("self_transportation_data")
                    and gih.st
                    and gih.st.payment_type != "None"
                ):
                    create_billing_st(obj=gih, process="IN")
                apply_lolo_night_charges(obj=gih, process="IN")

                if data["gate_in_data"].get("image_url"):
                    upload_driver_img_to_s3(
                        data["gate_in_data"]["image_url"],
                        gih,
                        data["container_data"]["container_no"],
                        data["gate_in_data"].get("driver_license"),
                        "IN",
                    )

                self.service.handle_en_block_movement(gih_object=gih)

            return Response(
                {"successMsg": "Data Update", "gih_pk": data["gih_pk"]}, status=200
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message), "data": None}, status=200)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=200,
            )


class UpdateGateOutProcess(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = GateUpdateService

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            app_user, location, site = self.service.get_user_and_location(request)
            main_data = self.service.get_gate_data(
                data,
                data["container_no"],
                data["date"],
                location,
                site,
                process_type="OUT",
            )
            return Response(main_data, status=200)
        except ValidationError as e:
            return Response({"errorMsg": str(e.message)}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials {e}"}, status=200)

    def put(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            app_user, location, site = self.service.get_user_and_location(request)
            goh = GateOutHistory.objects.get(pk=data["goh_pk"])

            with transaction.atomic():
                self.service.validate_container_no(
                    data["container_data"]["container_no"],
                    location,
                    site,
                    goh.container,
                )
                self.service.validate_manufacturing_date(
                    data["container_data"]["container_no"],
                    data["container_data"]["manufacturing_date"],
                    location,
                    site,
                    app_user,
                    goh.container,
                    date_format="%Y-%m-%d",
                )

                if data.get("eir_data"):
                    self.service.update_eir(data["eir_data"])
                if data.get("gate_out_data"):
                    self.service.update_gate_out(
                        data["gate_out_data"], data["eir_data"], data["goh_pk"]
                    )
                if data.get("lolo_data"):
                    self.service.update_lolo(
                        data["lolo_data"],
                        data["container_data"],
                        location,
                        site,
                        data["container_data"].get("client"),
                        data["goh_pk"],
                        process_type="OUT",
                    )
                if data.get("self_transportation_data"):
                    self.service.update_self_transportation(
                        data["self_transportation_data"],
                        data["container_data"],
                        location,
                        site,
                        data["container_data"].get("client"),
                        data["goh_pk"],
                        process_type="OUT",
                    )

                goh = GateOutHistory.objects.get(pk=data["goh_pk"])
                if goh.lolo.payment_type != "None":
                    create_billing_lolo(obj=goh, process="OUT")
                if (
                    data.get("self_transportation_data")
                    and goh.st
                    and goh.st.payment_type != "None"
                ):
                    create_billing_st(obj=goh, process="OUT")
                apply_lolo_night_charges(obj=goh, process="OUT")

                if data["gate_out_data"].get("image_url"):
                    upload_driver_img_to_s3(
                        data["gate_out_data"]["image_url"],
                        goh,
                        data["container_data"]["container_no"],
                        data["gate_out_data"].get("driver_license"),
                        "OUT",
                    )

                unlock_mnr_bills(goh, site)

            return Response(
                {"successMsg": "Data Update", "goh_pk": data["goh_pk"]}, status=200
            )
        except ValidationError as e:
            return Response({"errorMsg": str(e.message), "data": None}, status=200)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": "An unexpected error occurred. Please try again later."},
                status=200,
            )
