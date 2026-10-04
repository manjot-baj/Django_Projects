from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import ContainerType, ContainerSize, Location, Site
from master.models_two import Client, ClientAbbreviation
from depot.functions_two import *
from ..models import *
import datetime
from django.utils import timezone
import traceback, logging
from surveyor.models import Surveyor


class NonDepotInOutProcess(views.APIView):
    """
    the post function will store all IN Process data
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data
            user = request.user
            in_date = None
            in_time = None
            validation = None
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site

            # ************************************* Condition Check *************************************************

            try:
                container_no = data["container_no"]
                container_object = NonDepotContainer.objects.get(
                    container_no=container_no, location=location, site=site
                )

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

                if NonDepotGateIn.objects.filter(
                    container=container_object, in_date=in_date
                ).exists():
                    return Response(
                        {"errorMsg": "Container already exists with same in date"},
                        status=200,
                    )
                else:
                    pass
            except:
                pass

            # ***************************************** Adding Container *****************************************

            client_name = data["client"]
            if len(client_name) == 0:
                client = None
            else:
                client = Client.objects.get(
                    name=client_name, location=location, site=site
                )

            type_name = data["type"]
            if len(type_name) == 0:
                type_object = None
            else:
                try:
                    type_object = ContainerType.objects.get(name=type_name)
                except:
                    type_object = None

            size_name = data["size"]
            if len(size_name) == 0:
                size_object = None
            else:
                try:
                    size_object = ContainerSize.objects.get(name=size_name)
                except:
                    size_object = None

            container_no = data["container_no"]
            if len(container_no) == 0:
                return Response({"errorMsg": "Please provide container no"}, status=200)

            validation = check_digit(container_no=container_no)
            if validation is True:
                if NonDepotContainer.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    return Response(
                        {"errorMsg": "Container_no Valid but already exist."},
                        status=200,
                    )
                else:
                    pass
            else:
                if NonDepotContainer.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    return Response(
                        {"errorMsg": "Container_no Not Valid but already exist."},
                        status=200,
                    )
                else:
                    pass

            payload = data["payload"]
            if len(payload) == 0:
                payload = None

            gross_wt = data["gross_wt"]
            if len(gross_wt) == 0:
                gross_wt = None

            tare_wt = data["tare_wt"]
            if len(tare_wt) == 0:
                tare_wt = None

            manufacturing_date_str = data["manufacturing_date"]
            if len(manufacturing_date_str) == 0:
                return Response(
                    {"errorMsg": "Please provide manufacturing date"}, status=200
                )
            else:
                try:
                    manufacturing_date = datetime.datetime.strptime(
                        manufacturing_date_str, "%Y-%m-%d"
                    ).date()
                except:
                    manufacturing_date = None

            shipping_line_name = data["shipping_line"]
            if len(shipping_line_name) == 0:
                shipping_line = None
            else:
                try:
                    shipping_line = ClientAbbreviation.objects.get(
                        client=client, name=shipping_line_name
                    )
                except:
                    shipping_line = None

            mode = data["mode"]
            if len(mode) == 0:
                mode = None

            dock_destuff = data["dock_destuff"]
            if len(dock_destuff) == 0:
                dock_destuff = None

            automatic_mnr_status_change = data["automatic_mnr_status_change"]
            if len(automatic_mnr_status_change) == 0:
                automatic_mnr_status_change = None

            condition = data["condition"]
            if len(condition) == 0:
                condition = None
            try:
                grade = data["grade"]
                if len(grade) == 0:
                    grade = None
            except:
                grade = None

            if client.ref_code is None:
                return Response(
                    {
                        "errorMsg": "Client Reference code is missing, "
                        "Please update client in client master."
                    },
                    status=200,
                )
            # else:
            #     try:
            #         rent_object = GroundRent.objects.get(client_ref_code=client.ref_code,
            #                                                 location=location, site=site, size=size_object)
            #     except:
            #         return Response({"errorMsg": "Client Ground Rent Details are missing, "
            #                                      "Please enter ground rent details in "
            #                                      "Ground Rent Master for this Client."}, status=200)
            try:
                container_object = NonDepotContainer.objects.get(
                    container_no=container_no, location=location, site=site
                )
                container_object.status = "IN"
                container_object.is_available = False
                entry_count = int(container_object.in_entry_count) + 1
                container_object.in_entry_count = entry_count
                container_object.save()
            except:
                container_object = NonDepotContainer.create(
                    client=client,
                    type_object=type_object,
                    size_object=size_object,
                    container_no=container_no,
                    payload=payload,
                    gross_wt=gross_wt,
                    tare_wt=tare_wt,
                    manufacturing_date=manufacturing_date,
                    shipping_line=shipping_line,
                    dock_destuff=dock_destuff,
                    mode=mode,
                    condition=condition,
                    grade=grade,
                    automatic_mnr_status_change=automatic_mnr_status_change,
                )
                container_object.save()
                container_object.is_valid = validation
                container_object.location = location
                container_object.site = site
                entry_count = int(container_object.in_entry_count) + 1
                container_object.in_entry_count = entry_count
                container_object.save()

            # *************************************** In ********************************************************

            in_date_str = data["in_date"]
            if len(in_date_str) == 0:
                in_date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    in_date = datetime.datetime.strptime(in_date_str, "%Y-%m-%d").date()
                except:
                    in_date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )

            in_time_str = data["in_time"]
            if len(in_time_str) == 0:
                in_time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
            else:
                try:
                    in_time = datetime.datetime.strptime(in_time_str, "%H:%M").time()
                except:
                    in_time = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )

            in_date_time = datetime.datetime.combine(in_date, in_time).astimezone(
                timezone.get_current_timezone()
            )

            gate_in_object, created = NonDepotGateIn.objects.get_or_create(
                container=container_object,
                in_date=in_date_time.date(),
                in_time=in_date_time.time(),
            )

            # *********************************** Stock IN ***********************************************************

            NonDepotContainerStock.objects.get_or_create(
                gate_in=gate_in_object, container=container_object
            )
            stock_object = NonDepotContainerStock.objects.get(
                gate_in=gate_in_object, container=container_object
            )

            if Surveyor.objects.filter(
                container_no=container_no,
                location=location,
                site=site,
                is_new_container=True,
            ).exists():
                stock_object.is_survey_import_available = True
                stock_object.save(update_fields=["is_survey_import_available"])

            # *********************************** In Out Record ****************************************************

            NonDepotContainerInOutRecord.objects.get_or_create(
                container=container_object, gate_in=gate_in_object, gate_out=None
            )

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials : ![ {e} ]"}, status=200)
