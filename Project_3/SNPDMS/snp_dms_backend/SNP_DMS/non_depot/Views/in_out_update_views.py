from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import (
    ContainerType,
    ContainerSize,
    Location,
    Site,
)
from master.models_two import Client, ClientAbbreviation
from depot.functions_two import *
from ..models import *
import datetime
from django.utils import timezone
import logging, traceback


class NonDepotUpdateInOutProcess(views.APIView):
    """
    the Post function will update data
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            container_no = data["container_no"]
            date_str = data["date"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            container_object = NonDepotContainer.objects.get(
                container_no=container_no, location=location, site=site
            )
            gate_in_object = None
            req_date = datetime.datetime.strptime(date_str, "%d/%m/%Y").date()
            gate_in_object = NonDepotGateIn.objects.get(
                container=container_object, in_date=req_date
            )
            main_data = gate_in_object.container.get_container()
            gate_in_data = gate_in_object.get_gate_in()
            main_data.update(gate_in_data)
            record = NonDepotContainerInOutRecord.objects.get(
                container=container_object, gate_in=gate_in_object
            )
            if record.gate_out is not None:
                gate_out_data = record.gate_out.get_gate_out()
                main_data.update(gate_out_data)
            else:
                main_data["gate_out_pk"] = ""
                main_data["out_date"] = ""
                main_data["out_time"] = ""
            return Response(main_data, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials {e}"}, status=200)

    def put(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data

            # **************************************** Update Container ************************************************

            try:
                if data["client"]:
                    client_name = data["client"]
                    if len(client_name) == 0:
                        client = None
                    else:
                        client = Client.objects.get(name=client_name)
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        client=client
                    )
            except:
                pass

            try:
                if data["type"]:
                    type_name = data["type"]
                    if len(data) == 0:
                        type_object = None
                    else:
                        type_object = ContainerType.objects.get(name=type_name)
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        type=type_object
                    )
            except:
                pass

            try:
                if data["size"]:
                    size_name = data["size"]
                    if len(size_name) == 0:
                        size_object = None
                    else:
                        size_object = ContainerSize.objects.get(name=size_name)
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        size=size_object
                    )
            except:
                pass

            try:
                if data["container_no"]:
                    non_depot_container_object = NonDepotContainer.objects.get(
                        pk=data["container_pk"]
                    )
                    container_no = data["container_no"]
                    validation = None
                    if len(container_no) == 0:
                        return Response(
                            {"errorMsg": "Please Enter Container_no"}, status=200
                        )
                    if not len(container_no) == 11:
                        return Response(
                            {
                                "errorMsg": "Invalid Entry, "
                                "Please Enter Container_no having first 4 uppercase alphabets and "
                                "rest 7 digits"
                            },
                            status=200,
                        )
                    if check_char_digit(container_no) is False:
                        return Response(
                            {
                                "errorMsg": "Invalid Entry, "
                                "Please Enter Container_no having first 4 uppercase alphabets and "
                                "rest 7 digits"
                            },
                            status=200,
                        )
                    if not non_depot_container_object.container_no == container_no:
                        validation = check_digit(container_no=container_no)
                        if validation is True:
                            if NonDepotContainer.objects.filter(
                                container_no=container_no,
                                status="IN",
                                location__name=data["location"],
                            ).exists():
                                return Response(
                                    {
                                        "errorMsg": "Container_no Valid but already exist."
                                    },
                                    status=200,
                                )
                            else:
                                pass
                        else:
                            if NonDepotContainer.objects.filter(
                                container_no=container_no,
                                status="IN",
                                location__name=data["location"],
                            ).exists():
                                return Response(
                                    {
                                        "errorMsg": "Container_no Not Valid but already exist."
                                    },
                                    status=200,
                                )
                            else:
                                pass

                        NonDepotContainer.objects.filter(
                            pk=data["container_pk"]
                        ).update(container_no=container_no, is_valid=validation)
            except:
                pass

            try:
                if data["payload"]:
                    payload = data["payload"]
                    if len(payload) == 0:
                        payload = None
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        payload=payload
                    )
            except:
                pass

            try:
                if data["gross_wt"]:
                    gross_wt = data["gross_wt"]
                    if len(gross_wt) == 0:
                        gross_wt = None
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        gross_wt=gross_wt
                    )
            except:
                pass

            try:
                if data["tare_wt"]:
                    tare_wt = data["tare_wt"]
                    if len(tare_wt) == 0:
                        tare_wt = None
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        tare_wt=tare_wt
                    )
            except:
                pass

            try:
                if data["manufacturing_date"]:
                    manufacturing_date_str = data["manufacturing_date"]
                    if len(manufacturing_date_str) == 0:
                        manufacturing_date = None
                    else:
                        try:
                            manufacturing_date = datetime.datetime.strptime(
                                manufacturing_date_str, "%Y-%m-%d"
                            ).date()
                        except:
                            manufacturing_date = None

                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        manufacturing_date=manufacturing_date
                    )
            except:
                pass

            try:
                if data["shipping_line"]:
                    shipping_line_name = data["shipping_line"]
                    try:
                        client = NonDepotContainer.objects.get(
                            pk=data["container_pk"]
                        ).client
                    except:
                        client = None
                    if len(shipping_line_name) == 0 or client is None:
                        shipping_line_object = None
                    else:
                        shipping_line_object = ClientAbbreviation.objects.get_or_create(
                            client=client, name=shipping_line_name
                        )
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        shipping_line=shipping_line_object
                    )
            except:
                pass

            try:
                if data["mode"]:
                    mode = data["mode"]
                    if len(mode) == 0:
                        mode = False
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        mode=mode
                    )
            except:
                pass

            try:
                if data["dock_destuff"]:
                    dock_destuff = data["dock_destuff"]
                    if len(dock_destuff) == 0:
                        dock_destuff = False
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        dock_destuff=dock_destuff
                    )
            except:
                pass
            try:
                if data["automatic_mnr_status_change"]:
                    automatic_mnr_status_change = data["automatic_mnr_status_change"]
                    if len(automatic_mnr_status_change) == 0:
                        automatic_mnr_status_change = False
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        automatic_mnr_status_change=automatic_mnr_status_change
                    )
            except:
                pass

            try:
                if data["condition"]:
                    condition = data["condition"]
                    if len(condition) == 0:
                        condition = None

                    if (
                        not len(str(data["gate_out_pk"])) == 0
                        and not data["condition"] == "OK"
                    ):
                        return Response(
                            {"errorMsg": "OUT Container Condition should be 'OK'"},
                            status=200,
                        )

                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        condition=condition
                    )
            except:
                pass

            try:
                if data["grade"]:
                    grade = data["grade"]
                    if len(grade) == 0:
                        grade = None
                    NonDepotContainer.objects.filter(pk=data["container_pk"]).update(
                        grade=grade
                    )
            except:
                pass

            # ***************************************** Update In ************************************************

            try:
                in_date = None
                in_time = None

                if data["in_date"]:
                    in_date_str = data["in_date"]
                    if len(in_date_str) == 0:
                        in_date = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date()
                        )
                    else:
                        try:
                            in_date = datetime.datetime.strptime(
                                in_date_str, "%Y-%m-%d"
                            ).date()
                        except:
                            in_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )
                if data["in_time"]:
                    in_time_str = data["in_time"]
                    if len(in_time_str) == 0:
                        in_time = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                        )
                    else:
                        try:
                            in_time = datetime.datetime.strptime(
                                in_time_str, "%H:%M"
                            ).time()
                        except:
                            in_time = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .time()
                            )

                temp_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
                    timezone.get_current_timezone()
                )

                NonDepotGateIn.objects.filter(pk=data["gate_in_pk"]).update(
                    in_date=temp_date_time.date(), in_time=temp_date_time.time()
                )
            except:
                pass

            # *********************************** Out *************************************************

            if len(str(data["gate_out_pk"])) == 0:
                if not len(data["out_date"]) == 0 and not len(data["out_time"]) == 0:
                    out_date_str = data["out_date"]
                    if len(out_date_str) == 0:
                        out_date = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .date()
                        )
                    else:
                        try:
                            out_date = datetime.datetime.strptime(
                                out_date_str, "%Y-%m-%d"
                            ).date()
                        except:
                            out_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )

                    out_time_str = data["out_time"]
                    if len(out_time_str) == 0:
                        out_time = (
                            datetime.datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                        )
                    else:
                        try:
                            out_time = datetime.datetime.strptime(
                                out_time_str, "%H:%M"
                            ).time()
                        except:
                            out_time = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .time()
                            )

                    out_date_time = datetime.datetime.combine(out_date, out_time)
                    out_date_time = out_date_time.astimezone(
                        timezone.get_current_timezone()
                    )
                    container_object = NonDepotContainer.objects.get(
                        pk=data["container_pk"]
                    )

                    if container_object.is_available is False:
                        return Response(
                            {
                                "errorMsg": "Container is not available yet for Out process."
                            },
                            status=200,
                        )

                    if not data["condition"] == "OK":
                        return Response(
                            {"errorMsg": "Container Condition should be 'OK'."},
                            status=200,
                        )

                    if NonDepotGateOut.objects.filter(
                        container=container_object,
                        out_date=out_date_time.date(),
                        out_time=out_date_time.time(),
                    ).exists():
                        return Response(
                            {"errorMsg": "Container already exists with same Out date"},
                            status=200,
                        )
                    else:
                        pass

                    gate_out_object, created = NonDepotGateOut.objects.get_or_create(
                        container=container_object,
                        out_date=out_date_time.date(),
                        out_time=out_date_time.time(),
                    )

                    # ************************** Stock Update ***************************************
                    gin_object = NonDepotGateIn.objects.get(pk=data["gate_in_pk"])

                    stock_object = NonDepotContainerStock.objects.get(
                        container__container_no=container_no, gate_in=gin_object
                    )
                    stock_object.gate_out = gate_out_object
                    stock_object.save()
                    stock_object.make_out_of_stock()
                    container_object.status = "OUT"
                    entry_count = int(container_object.out_entry_count) + 1
                    container_object.out_entry_count = entry_count
                    container_object.save()

                    # *********************************** In Out Record *************************************************

                    container_in_out_record = NonDepotContainerInOutRecord.objects.get(
                        container=container_object, gate_in=gin_object
                    )
                    container_in_out_record.gate_out = gate_out_object
                    container_in_out_record.save()
                else:
                    pass
            else:
                try:
                    out_date = None
                    out_time = None

                    if data["out_date"]:
                        out_date_str = data["out_date"]
                        if len(out_date_str) == 0:
                            out_date = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .date()
                            )
                        else:
                            try:
                                out_date = datetime.datetime.strptime(
                                    out_date_str, "%Y-%m-%d"
                                ).date()
                            except:
                                out_date = (
                                    datetime.datetime.now()
                                    .astimezone(timezone.get_current_timezone())
                                    .date()
                                )
                    if data["out_time"]:
                        out_time_str = data["out_time"]
                        if len(out_time_str) == 0:
                            out_time = (
                                datetime.datetime.now()
                                .astimezone(timezone.get_current_timezone())
                                .time()
                            )
                        else:
                            try:
                                out_time = datetime.datetime.strptime(
                                    out_time_str, "%H:%M"
                                ).time()
                            except:
                                out_time = (
                                    datetime.datetime.now()
                                    .astimezone(timezone.get_current_timezone())
                                    .time()
                                )

                    temp_date_time = datetime.datetime.combine(
                        out_date, out_time
                    ).astimezone(timezone.get_current_timezone())

                    NonDepotGateOut.objects.filter(pk=data["gate_out_pk"]).update(
                        out_date=temp_date_time.date(), out_time=temp_date_time.time()
                    )
                except:
                    pass

            return Response({"successMsg": "Data Update"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
