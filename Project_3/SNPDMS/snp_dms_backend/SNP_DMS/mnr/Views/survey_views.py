from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import AccountUser
from master.models import Location, Site
from non_depot.models import NonDepotContainerStock
from depot.models import ContainerStock
from ..models import (
    Survey,
    SurveyLine,
    TariffMaster,
    MnrStaff,
    Estimate,
)
from surveyor.models import Surveyor
from django.utils import timezone
import datetime, random
from ..functions import (
    upload_mnr_file_to_s3,
    download_mnr_file_from_s3,
    getSurveyLineData,
    upload_mnr_repair_img_to_s3,
    get_only_images,
    download_mnr_repair_img_to_s3,
    delete_mnr_repair_img_from_s3,
)
import logging, traceback
from django.db import transaction
from account.permissions import HasAllowedRoles


class SurveyImageDownloadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            image_id_list = data["image_id_list"]
            response = download_mnr_repair_img_to_s3(
                process="Survey", process_id=pk, image_id_list=image_id_list
            )
            return response
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class SurveyImageUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            if not "file_list" in data.keys():
                return Response(
                    {"errorMsg": "Please upload a file"},
                    status=200,
                )
            file_list = get_only_images(request.FILES.getlist("file_list"))
            if file_list is False:
                return Response(
                    {"errorMsg": "Please upload a [jpeg,png,jpg] file"},
                    status=200,
                )

            if file_list is not None:
                # Condition
                survey_data = None
                # estimate_data = None
                try:
                    survey_data = Survey.getById(pk)
                    # estimate_data = Estimate.objects.get(parent=survey_data)
                    # if not Estimate.checkProceedExistById(estimate_data.pk):
                    #     return Response(
                    #         {
                    #             "errorMsg": "Please Complete Estimate stage before Image Upload"
                    #         },
                    #         status=200,
                    #     )
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    # return Response(
                    #     {
                    #         "errorMsg": "Please Complete Estimate stage before Image Upload"
                    #     },
                    #     status=200,
                    # )

                # getting data
                container_no = None
                site = Site.objects.get(name=data["site"])
                if site.type == "DEPOT":
                    container_no = survey_data.depot.container.container_no
                else:
                    container_no = survey_data.non_depot.container.container_no

                response = upload_mnr_repair_img_to_s3(
                    location=data["location"],
                    site=data["site"],
                    site_type=site.type,
                    container_no=container_no,
                    process="Survey",
                    processId=pk,
                    file_list=file_list,
                    add=data["add"],
                )

                if response is True:
                    return Response({"successMsg": "File Uploaded"}, status=200)
                else:
                    return Response({"errorMsg": "File Not Uploaded"}, status=200)
            else:
                return Response(
                    {"errorMsg": "Please Provide Images To Upload"}, status=200
                )
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class SurveyUploadView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            if data["file"] is not None:
                site = Site.objects.get(name=data["site"])
                # Getting Survey Data
                survey_data = None
                if Survey.checkExistById(pk):
                    survey_data = Survey.getById(pk)
                else:
                    return Response(
                        {"errorMsg": "Data Not Exist with the given Survey Id"},
                        status=200,
                    )
                container_no = None
                if site.type == "DEPOT":
                    container_no = survey_data.depot.container.container_no
                else:
                    container_no = survey_data.non_depot.container.container_no
                response = upload_mnr_file_to_s3(
                    location=data["location"],
                    site=data["site"],
                    site_type=site.type,
                    container_no=container_no,
                    process="Survey",
                    processId=pk,
                    file=data["file"],
                )
                if response is True:
                    return Response({"successMsg": "File Uploaded"}, status=200)
                else:
                    return Response({"errorMsg": "File Not Uploaded"}, status=200)
            else:
                return Response(
                    {"errorMsg": "Please Provide File To Upload"}, status=200
                )
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)


class SurveyView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def randomNumber(self):
        random_no = f"E{random.randint(1000000, 9999999)}"
        while (
            Estimate.objects.filter(number=random_no).exists()
            or Survey.objects.filter(estimate_number=random_no).exists()
        ):
            random_no = f"E{random.randint(1000000, 9999999)}"
            if (
                not Estimate.objects.filter(number=random_no).exists()
                and not Survey.objects.filter(estimate_number=random_no).exists()
            ):
                break
        return random_no

    def convertNone(self, dict_data):
        for key in dict_data:
            if len(str(dict_data[key])) == 0:
                dict_data[key] = None
        return dict_data

    def get(self, request, pk, *args, **kwargs):
        try:
            response = download_mnr_file_from_s3(process="Survey", process_id=pk)
            return response
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)

    def post(self, request, *args, **kwargs):
        try:
            # General Data

            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            created_by = AccountUser.objects.get(username=request.user.username)
            survey_by = MnrStaff.objects.get(pk=data["survey_by"])

            survey_lines = data["survey_lines"]
            if len(data["survey_lines"]) == 0:
                survey_lines = None

            survey_lines_deleted = data["survey_lines_deleted"]
            if len(survey_lines_deleted) == 0:
                survey_lines_deleted = None

            # Data extraction on depot or non depot
            depot = None
            non_depot = None
            # client_ref_code = None
            if site.type == "DEPOT":
                depot = ContainerStock.objects.get(pk=data["stock_id"])
                # client_ref_code = depot.container.client.ref_code
            else:
                non_depot = NonDepotContainerStock.objects.get(pk=data["stock_id"])
                # client_ref_code = non_depot.container.client.ref_code

            parent = TariffMaster.objects.get(pk=data["parent_id"])

            # date stuff
            if len(data["date"]) == 0:
                date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    date = datetime.datetime.strptime(data["date"], "%Y-%m-%d").date()
                except:
                    date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
            # time stuff
            if len(data["time"]) == 0:
                time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
            else:
                try:
                    time = datetime.datetime.strptime(data["time"], "%H:%M").time()
                except:
                    time = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )

            # Checking for draft data
            survey_data = None
            if depot is not None:
                if Survey.checkExistByDepotId(depot.pk):
                    if Survey.checkDraftExistByDepotId(id=depot.pk):
                        survey_data = Survey.getDraftByDepotId(id=depot.pk)
                    else:
                        return Response({"errorMsg": "Survey Already Done"}, status=200)
            else:
                if Survey.checkExistByNonDepotId(non_depot.pk):
                    if Survey.checkDraftExistByNonDepotId(id=non_depot.pk):
                        survey_data = Survey.getDraftByNonDepotId(id=non_depot.pk)
                    else:
                        return Response({"errorMsg": "Survey Already Done"}, status=200)

            with transaction.atomic():
                # Main data input
                if data["is_draft"] == "True":
                    if survey_data is not None:
                        survey_data.updateDraft(
                            created_by=created_by,
                            survey_by=survey_by,
                            date=date,
                            time=time,
                        )
                        if survey_lines_deleted is not None:
                            SurveyLine.objects.filter(
                                pk__in=survey_lines_deleted
                            ).delete()
                        if survey_lines is not None:
                            for line in survey_lines:
                                line = self.convertNone(line)
                                if not "pk" in line.keys():
                                    line_data = getSurveyLineData(parent, line)
                                    tariff_code = line_data["tariff_code"]
                                    main_component = line_data["main_component"]
                                    component_code = line_data["component_code"]
                                    component_description = line_data[
                                        "component_description"
                                    ]
                                    location_code = line_data["location_code"]
                                    location_description = line_data[
                                        "location_description"
                                    ]
                                    specific_location_code = line_data[
                                        "specific_location_code"
                                    ]
                                    specific_location_description = line_data[
                                        "specific_location_description"
                                    ]
                                    damage_code = line_data["damage_code"]
                                    damage_description = line_data["damage_description"]
                                    material_code = line_data["material_code"]
                                    material_description = line_data[
                                        "material_description"
                                    ]
                                    repair_code = line_data["repair_code"]
                                    repair_description = line_data["repair_description"]
                                    unit = line_data["unit"]
                                    measurement = line_data["measurement"]
                                    length_and_width = line_data["length_and_width"]
                                    quantity = line_data["quantity"]
                                    labour_hrs_tariff = line_data["labour_hrs_tariff"]
                                    wash_clean_tariff = line_data["wash_clean_tariff"]
                                    material_tariff = line_data["material_tariff"]
                                    labour_cost = line_data["labour_cost"]
                                    material_cost = line_data["material_cost"]
                                    total_cost = line_data["total_cost"]
                                    tariff_field_enabled = line_data[
                                        "tariff_field_enabled"
                                    ]
                                    remarks = line_data["remarks"]

                                    if not SurveyLine.objects.filter(
                                        parent=survey_data,
                                        tariff_code=tariff_code,
                                        main_component=main_component,
                                        component_code=component_code,
                                        component_description=component_description,
                                        location_code=location_code,
                                        location_description=location_description,
                                        specific_location_code=specific_location_code,
                                        specific_location_description=specific_location_description,
                                        damage_code=damage_code,
                                        damage_description=damage_description,
                                        material_code=material_code,
                                        material_description=material_description,
                                        repair_code=repair_code,
                                        repair_description=repair_description,
                                        unit=unit,
                                        measurement=measurement,
                                        length_and_width=length_and_width,
                                        quantity=quantity,
                                        labour_hrs_tariff=labour_hrs_tariff,
                                        wash_clean_tariff=wash_clean_tariff,
                                        material_tariff=material_tariff,
                                        labour_cost=labour_cost,
                                        material_cost=material_cost,
                                        total_cost=total_cost,
                                        tariff_field_enabled=tariff_field_enabled,
                                        remarks=remarks,
                                    ).exists():

                                        SurveyLine(
                                            parent=survey_data,
                                            tariff_code=tariff_code,
                                            main_component=main_component,
                                            component_code=component_code,
                                            component_description=component_description,
                                            location_code=location_code,
                                            location_description=location_description,
                                            specific_location_code=specific_location_code,
                                            specific_location_description=specific_location_description,
                                            damage_code=damage_code,
                                            damage_description=damage_description,
                                            material_code=material_code,
                                            material_description=material_description,
                                            repair_code=repair_code,
                                            repair_description=repair_description,
                                            unit=unit,
                                            measurement=measurement,
                                            length_and_width=length_and_width,
                                            quantity=quantity,
                                            labour_hrs_tariff=labour_hrs_tariff,
                                            wash_clean_tariff=wash_clean_tariff,
                                            material_tariff=material_tariff,
                                            labour_cost=labour_cost,
                                            material_cost=material_cost,
                                            total_cost=total_cost,
                                            tariff_field_enabled=tariff_field_enabled,
                                            remarks=remarks,
                                        ).save()
                                else:
                                    if SurveyLine.objects.filter(
                                        pk=line["pk"]
                                    ).exists():
                                        survey_line_object = SurveyLine.objects.get(
                                            pk=line["pk"]
                                        )
                                        survey_line_object.remarks = line.get(
                                            "remarks", None
                                        )
                                        survey_line_object.save()
                        else:
                            pass

                    else:
                        survey_data = Survey.createDraft(
                            depot=depot,
                            non_depot=non_depot,
                            created_by=created_by,
                            survey_by=survey_by,
                            date=date,
                            time=time,
                            labour_rate=float(data["labour_rate"]),
                        )
                        survey_data.estimate_number = self.randomNumber()
                        survey_data.save(update_fields=["estimate_number"])
                        if survey_lines_deleted is not None:
                            SurveyLine.objects.filter(
                                pk__in=survey_lines_deleted
                            ).delete()
                        if survey_lines is not None:
                            for line in survey_lines:
                                line = self.convertNone(line)
                                if not "pk" in line.keys():
                                    line_data = getSurveyLineData(parent, line)
                                    tariff_code = line_data["tariff_code"]
                                    main_component = line_data["main_component"]
                                    component_code = line_data["component_code"]
                                    component_description = line_data[
                                        "component_description"
                                    ]
                                    location_code = line_data["location_code"]
                                    location_description = line_data[
                                        "location_description"
                                    ]
                                    specific_location_code = line_data[
                                        "specific_location_code"
                                    ]
                                    specific_location_description = line_data[
                                        "specific_location_description"
                                    ]
                                    damage_code = line_data["damage_code"]
                                    damage_description = line_data["damage_description"]
                                    material_code = line_data["material_code"]
                                    material_description = line_data[
                                        "material_description"
                                    ]
                                    repair_code = line_data["repair_code"]
                                    repair_description = line_data["repair_description"]
                                    unit = line_data["unit"]
                                    measurement = line_data["measurement"]
                                    length_and_width = line_data["length_and_width"]
                                    quantity = line_data["quantity"]
                                    labour_hrs_tariff = line_data["labour_hrs_tariff"]
                                    wash_clean_tariff = line_data["wash_clean_tariff"]
                                    material_tariff = line_data["material_tariff"]
                                    labour_cost = line_data["labour_cost"]
                                    material_cost = line_data["material_cost"]
                                    total_cost = line_data["total_cost"]
                                    tariff_field_enabled = line_data[
                                        "tariff_field_enabled"
                                    ]
                                    remarks = line_data["remarks"]

                                    if not SurveyLine.objects.filter(
                                        parent=survey_data,
                                        tariff_code=tariff_code,
                                        main_component=main_component,
                                        component_code=component_code,
                                        component_description=component_description,
                                        location_code=location_code,
                                        location_description=location_description,
                                        specific_location_code=specific_location_code,
                                        specific_location_description=specific_location_description,
                                        damage_code=damage_code,
                                        damage_description=damage_description,
                                        material_code=material_code,
                                        material_description=material_description,
                                        repair_code=repair_code,
                                        repair_description=repair_description,
                                        unit=unit,
                                        measurement=measurement,
                                        length_and_width=length_and_width,
                                        quantity=quantity,
                                        labour_hrs_tariff=labour_hrs_tariff,
                                        wash_clean_tariff=wash_clean_tariff,
                                        material_tariff=material_tariff,
                                        labour_cost=labour_cost,
                                        material_cost=material_cost,
                                        total_cost=total_cost,
                                        tariff_field_enabled=tariff_field_enabled,
                                        remarks=remarks,
                                    ).exists():

                                        SurveyLine(
                                            parent=survey_data,
                                            tariff_code=tariff_code,
                                            main_component=main_component,
                                            component_code=component_code,
                                            component_description=component_description,
                                            location_code=location_code,
                                            location_description=location_description,
                                            specific_location_code=specific_location_code,
                                            specific_location_description=specific_location_description,
                                            damage_code=damage_code,
                                            damage_description=damage_description,
                                            material_code=material_code,
                                            material_description=material_description,
                                            repair_code=repair_code,
                                            repair_description=repair_description,
                                            unit=unit,
                                            measurement=measurement,
                                            length_and_width=length_and_width,
                                            quantity=quantity,
                                            labour_hrs_tariff=labour_hrs_tariff,
                                            wash_clean_tariff=wash_clean_tariff,
                                            material_tariff=material_tariff,
                                            labour_cost=labour_cost,
                                            material_cost=material_cost,
                                            total_cost=total_cost,
                                            tariff_field_enabled=tariff_field_enabled,
                                            remarks=remarks,
                                        ).save()
                                else:
                                    if SurveyLine.objects.filter(
                                        pk=line["pk"]
                                    ).exists():
                                        survey_line_object = SurveyLine.objects.get(
                                            pk=line["pk"]
                                        )
                                        survey_line_object.remarks = line.get(
                                            "remarks", None
                                        )
                                        survey_line_object.save()
                        else:
                            pass

                elif data["is_proceed"] == "True":
                    if survey_data is not None:
                        survey_data.makeDraftToProceed(
                            created_by=created_by,
                            survey_by=survey_by,
                            date=date,
                            time=time,
                        )
                        if survey_lines_deleted is not None:
                            SurveyLine.objects.filter(
                                pk__in=survey_lines_deleted
                            ).delete()
                        if survey_lines is not None:
                            for line in survey_lines:
                                line = self.convertNone(line)
                                if not "pk" in line.keys():
                                    line_data = getSurveyLineData(parent, line)
                                    tariff_code = line_data["tariff_code"]
                                    main_component = line_data["main_component"]
                                    component_code = line_data["component_code"]
                                    component_description = line_data[
                                        "component_description"
                                    ]
                                    location_code = line_data["location_code"]
                                    location_description = line_data[
                                        "location_description"
                                    ]
                                    specific_location_code = line_data[
                                        "specific_location_code"
                                    ]
                                    specific_location_description = line_data[
                                        "specific_location_description"
                                    ]
                                    damage_code = line_data["damage_code"]
                                    damage_description = line_data["damage_description"]
                                    material_code = line_data["material_code"]
                                    material_description = line_data[
                                        "material_description"
                                    ]
                                    repair_code = line_data["repair_code"]
                                    repair_description = line_data["repair_description"]
                                    unit = line_data["unit"]
                                    measurement = line_data["measurement"]
                                    length_and_width = line_data["length_and_width"]
                                    quantity = line_data["quantity"]
                                    labour_hrs_tariff = line_data["labour_hrs_tariff"]
                                    wash_clean_tariff = line_data["wash_clean_tariff"]
                                    material_tariff = line_data["material_tariff"]
                                    labour_cost = line_data["labour_cost"]
                                    material_cost = line_data["material_cost"]
                                    total_cost = line_data["total_cost"]
                                    tariff_field_enabled = line_data[
                                        "tariff_field_enabled"
                                    ]
                                    remarks = line_data["remarks"]

                                    if not SurveyLine.objects.filter(
                                        parent=survey_data,
                                        tariff_code=tariff_code,
                                        main_component=main_component,
                                        component_code=component_code,
                                        component_description=component_description,
                                        location_code=location_code,
                                        location_description=location_description,
                                        specific_location_code=specific_location_code,
                                        specific_location_description=specific_location_description,
                                        damage_code=damage_code,
                                        damage_description=damage_description,
                                        material_code=material_code,
                                        material_description=material_description,
                                        repair_code=repair_code,
                                        repair_description=repair_description,
                                        unit=unit,
                                        measurement=measurement,
                                        length_and_width=length_and_width,
                                        quantity=quantity,
                                        labour_hrs_tariff=labour_hrs_tariff,
                                        wash_clean_tariff=wash_clean_tariff,
                                        material_tariff=material_tariff,
                                        labour_cost=labour_cost,
                                        material_cost=material_cost,
                                        total_cost=total_cost,
                                        tariff_field_enabled=tariff_field_enabled,
                                        remarks=remarks,
                                    ).exists():

                                        SurveyLine(
                                            parent=survey_data,
                                            tariff_code=tariff_code,
                                            main_component=main_component,
                                            component_code=component_code,
                                            component_description=component_description,
                                            location_code=location_code,
                                            location_description=location_description,
                                            specific_location_code=specific_location_code,
                                            specific_location_description=specific_location_description,
                                            damage_code=damage_code,
                                            damage_description=damage_description,
                                            material_code=material_code,
                                            material_description=material_description,
                                            repair_code=repair_code,
                                            repair_description=repair_description,
                                            unit=unit,
                                            measurement=measurement,
                                            length_and_width=length_and_width,
                                            quantity=quantity,
                                            labour_hrs_tariff=labour_hrs_tariff,
                                            wash_clean_tariff=wash_clean_tariff,
                                            material_tariff=material_tariff,
                                            labour_cost=labour_cost,
                                            material_cost=material_cost,
                                            total_cost=total_cost,
                                            tariff_field_enabled=tariff_field_enabled,
                                            remarks=remarks,
                                        ).save()
                                else:
                                    if SurveyLine.objects.filter(
                                        pk=line["pk"]
                                    ).exists():
                                        survey_line_object = SurveyLine.objects.get(
                                            pk=line["pk"]
                                        )
                                        survey_line_object.remarks = line.get(
                                            "remarks", None
                                        )
                                        survey_line_object.save()
                        else:
                            pass
                        survey_data.createNumber()
                    else:
                        if data["make_available"] == "True":
                            Survey.createNoDamage(
                                depot=depot,
                                non_depot=non_depot,
                                created_by=created_by,
                                survey_by=survey_by,
                                date=date,
                                time=time,
                                labour_rate=float(data["labour_rate"]),
                            )
                        else:
                            survey_data = Survey.create(
                                depot=depot,
                                non_depot=non_depot,
                                created_by=created_by,
                                survey_by=survey_by,
                                date=date,
                                time=time,
                                labour_rate=float(data["labour_rate"]),
                            )
                            survey_data.estimate_number = self.randomNumber()
                            survey_data.save(update_fields=["estimate_number"])

                            if survey_lines_deleted is not None:
                                SurveyLine.objects.filter(
                                    pk__in=survey_lines_deleted
                                ).delete()
                            if survey_lines is not None:
                                for line in survey_lines:
                                    line = self.convertNone(line)
                                    line_data = getSurveyLineData(parent, line)
                                    tariff_code = line_data["tariff_code"]
                                    main_component = line_data["main_component"]
                                    component_code = line_data["component_code"]
                                    component_description = line_data[
                                        "component_description"
                                    ]
                                    location_code = line_data["location_code"]
                                    location_description = line_data[
                                        "location_description"
                                    ]
                                    specific_location_code = line_data[
                                        "specific_location_code"
                                    ]
                                    specific_location_description = line_data[
                                        "specific_location_description"
                                    ]
                                    damage_code = line_data["damage_code"]
                                    damage_description = line_data["damage_description"]
                                    material_code = line_data["material_code"]
                                    material_description = line_data[
                                        "material_description"
                                    ]
                                    repair_code = line_data["repair_code"]
                                    repair_description = line_data["repair_description"]
                                    unit = line_data["unit"]
                                    measurement = line_data["measurement"]
                                    length_and_width = line_data["length_and_width"]
                                    quantity = line_data["quantity"]
                                    labour_hrs_tariff = line_data["labour_hrs_tariff"]
                                    wash_clean_tariff = line_data["wash_clean_tariff"]
                                    material_tariff = line_data["material_tariff"]
                                    labour_cost = line_data["labour_cost"]
                                    material_cost = line_data["material_cost"]
                                    total_cost = line_data["total_cost"]
                                    tariff_field_enabled = line_data[
                                        "tariff_field_enabled"
                                    ]
                                    remarks = line_data["remarks"]

                                    if not SurveyLine.objects.filter(
                                        parent=survey_data,
                                        tariff_code=tariff_code,
                                        main_component=main_component,
                                        component_code=component_code,
                                        component_description=component_description,
                                        location_code=location_code,
                                        location_description=location_description,
                                        specific_location_code=specific_location_code,
                                        specific_location_description=specific_location_description,
                                        damage_code=damage_code,
                                        damage_description=damage_description,
                                        material_code=material_code,
                                        material_description=material_description,
                                        repair_code=repair_code,
                                        repair_description=repair_description,
                                        unit=unit,
                                        measurement=measurement,
                                        length_and_width=length_and_width,
                                        quantity=quantity,
                                        labour_hrs_tariff=labour_hrs_tariff,
                                        wash_clean_tariff=wash_clean_tariff,
                                        material_tariff=material_tariff,
                                        labour_cost=labour_cost,
                                        material_cost=material_cost,
                                        total_cost=total_cost,
                                        tariff_field_enabled=tariff_field_enabled,
                                        remarks=remarks,
                                    ).exists():

                                        SurveyLine(
                                            parent=survey_data,
                                            tariff_code=tariff_code,
                                            main_component=main_component,
                                            component_code=component_code,
                                            component_description=component_description,
                                            location_code=location_code,
                                            location_description=location_description,
                                            specific_location_code=specific_location_code,
                                            specific_location_description=specific_location_description,
                                            damage_code=damage_code,
                                            damage_description=damage_description,
                                            material_code=material_code,
                                            material_description=material_description,
                                            repair_code=repair_code,
                                            repair_description=repair_description,
                                            unit=unit,
                                            measurement=measurement,
                                            length_and_width=length_and_width,
                                            quantity=quantity,
                                            labour_hrs_tariff=labour_hrs_tariff,
                                            wash_clean_tariff=wash_clean_tariff,
                                            material_tariff=material_tariff,
                                            labour_cost=labour_cost,
                                            material_cost=material_cost,
                                            total_cost=total_cost,
                                            tariff_field_enabled=tariff_field_enabled,
                                            remarks=remarks,
                                        ).save()
                            survey_data.createNumber()
                else:
                    return Response(
                        {"errorMsg": "Please select draft or proceed"}, status=200
                    )
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": str(e)}, status=200)

    def put(self, request, pk, *args, **kwargs):
        try:
            # General Data
            data = request.data
            location = Location.objects.get(name=data["location"])
            site = Site.objects.get(name=data["site"])
            updated_by = AccountUser.objects.get(username=request.user.username)
            survey_by = MnrStaff.objects.get(pk=data["survey_by"])

            survey_lines = data["survey_lines"]
            if len(data["survey_lines"]) == 0:
                survey_lines = None

            survey_lines_rejected = data["survey_lines_rejected"]
            if len(survey_lines_rejected) == 0:
                survey_lines_rejected = None

            survey_lines_deleted = data["survey_lines_deleted"]
            if len(survey_lines_deleted) == 0:
                survey_lines_deleted = None

            # Getting Survey Data
            survey_data = None
            if Survey.checkExistById(pk):
                survey_data = Survey.getById(pk)
            else:
                return Response(
                    {"errorMsg": "Data Not Exist with the given Id"}, status=200
                )

            parent = TariffMaster.objects.get(pk=data["parent_id"])

            # # Data extraction on depot or non depot
            # client_ref_code = None
            # if survey_data.depot is not None:
            #     client_ref_code = survey_data.depot.container.client.ref_code
            # else:
            #     client_ref_code = survey_data.non_depot.container.client.ref_code

            # date stuff
            if len(data["date"]) == 0:
                date = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .date()
                )
            else:
                try:
                    date = datetime.datetime.strptime(data["date"], "%Y-%m-%d").date()
                except:
                    date = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .date()
                    )
            # time stuff
            if len(data["time"]) == 0:
                time = (
                    datetime.datetime.now()
                    .astimezone(timezone.get_current_timezone())
                    .time()
                )
            else:
                try:
                    time = datetime.datetime.strptime(data["time"], "%H:%M").time()
                except:
                    time = (
                        datetime.datetime.now()
                        .astimezone(timezone.get_current_timezone())
                        .time()
                    )
            survey_data.survey_by = survey_by
            survey_data.updated_by = updated_by
            survey_data.current_date = date
            survey_data.current_time = time
            survey_data.save()

            if survey_lines_deleted is not None:
                SurveyLine.objects.filter(pk__in=survey_lines_deleted).delete()

            if survey_lines is not None:
                for line in survey_lines:
                    line = self.convertNone(line)

                    if not "pk" in line.keys():
                        line_data = getSurveyLineData(parent, line)
                        tariff_code = line_data["tariff_code"]
                        main_component = line_data["main_component"]
                        component_code = line_data["component_code"]
                        component_description = line_data["component_description"]
                        location_code = line_data["location_code"]
                        location_description = line_data["location_description"]
                        specific_location_code = line_data["specific_location_code"]
                        specific_location_description = line_data[
                            "specific_location_description"
                        ]
                        damage_code = line_data["damage_code"]
                        damage_description = line_data["damage_description"]
                        material_code = line_data["material_code"]
                        material_description = line_data["material_description"]
                        repair_code = line_data["repair_code"]
                        repair_description = line_data["repair_description"]
                        unit = line_data["unit"]
                        measurement = line_data["measurement"]
                        length_and_width = line_data["length_and_width"]
                        quantity = line_data["quantity"]
                        labour_hrs_tariff = line_data["labour_hrs_tariff"]
                        wash_clean_tariff = line_data["wash_clean_tariff"]
                        material_tariff = line_data["material_tariff"]
                        labour_cost = line_data["labour_cost"]
                        material_cost = line_data["material_cost"]
                        total_cost = line_data["total_cost"]
                        tariff_field_enabled = line_data["tariff_field_enabled"]
                        remarks = line_data["remarks"]

                        if not SurveyLine.objects.filter(
                            parent=survey_data,
                            tariff_code=tariff_code,
                            main_component=main_component,
                            component_code=component_code,
                            component_description=component_description,
                            location_code=location_code,
                            location_description=location_description,
                            specific_location_code=specific_location_code,
                            specific_location_description=specific_location_description,
                            damage_code=damage_code,
                            damage_description=damage_description,
                            material_code=material_code,
                            material_description=material_description,
                            repair_code=repair_code,
                            repair_description=repair_description,
                            unit=unit,
                            measurement=measurement,
                            length_and_width=length_and_width,
                            quantity=quantity,
                            labour_hrs_tariff=labour_hrs_tariff,
                            wash_clean_tariff=wash_clean_tariff,
                            material_tariff=material_tariff,
                            labour_cost=labour_cost,
                            material_cost=material_cost,
                            total_cost=total_cost,
                            tariff_field_enabled=tariff_field_enabled,
                            remarks=remarks,
                        ).exists():
                            SurveyLine(
                                parent=survey_data,
                                tariff_code=tariff_code,
                                main_component=main_component,
                                component_code=component_code,
                                component_description=component_description,
                                location_code=location_code,
                                location_description=location_description,
                                specific_location_code=specific_location_code,
                                specific_location_description=specific_location_description,
                                damage_code=damage_code,
                                damage_description=damage_description,
                                material_code=material_code,
                                material_description=material_description,
                                repair_code=repair_code,
                                repair_description=repair_description,
                                unit=unit,
                                measurement=measurement,
                                length_and_width=length_and_width,
                                quantity=quantity,
                                labour_hrs_tariff=labour_hrs_tariff,
                                wash_clean_tariff=wash_clean_tariff,
                                material_tariff=material_tariff,
                                labour_cost=labour_cost,
                                material_cost=material_cost,
                                total_cost=total_cost,
                                tariff_field_enabled=tariff_field_enabled,
                                remarks=remarks,
                            ).save()
                    else:
                        if SurveyLine.objects.filter(pk=line["pk"]).exists():
                            survey_line_object = SurveyLine.objects.get(pk=line["pk"])
                            survey_line_object.remarks = line.get("remarks", None)
                            survey_line_object.save()
            else:
                pass
            survey_data.incrementUpdateCount()
            survey_data.createNumber()

            if survey_lines_rejected is not None:
                SurveyLine.objects.filter(pk__in=survey_lines_rejected).update(
                    is_rejected=True, total_cost=float(0)
                )

            if survey_data.depot is not None:
                survey_data.depot.survey_pending_out_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                survey_data.depot.estimate_pending_in_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
            else:
                survey_data.non_depot.survey_pending_out_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )
                survey_data.non_depot.estimate_pending_in_date_time = (
                    datetime.datetime.combine(date, time).astimezone(
                        timezone.get_current_timezone()
                    )
                )

            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": str(e)}, status=200)


class MakeAvailableReverseView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def get(self, request, pk, *args, **kwargs):
        try:
            with transaction.atomic():
                survey = Survey.getById(pk)
                stock_object = None
                if survey.depot is not None:
                    stock_object = survey.depot
                else:
                    stock_object = survey.non_depot
                stock_object.survey_date = None
                stock_object.survey_time = None
                stock_object.survey_pending_out_date_time = None
                stock_object.available_in_date_time = None
                stock_object.available_date = None
                stock_object.available_time = None
                stock_object.stage = "Survey"
                stock_object.status = "Survey Pending"
                stock_object.save()
                stock_object.make_not_available()
                survey.delete()
            return Response({"successMsg": "Data Saved"}, status=200)
        except Exception as e:
            return Response({"errorMsg": str(e)}, status=200)


class SurveyImageDeleteView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            image_id_list = data["image_id_list"]
            response = delete_mnr_repair_img_from_s3(
                process="Survey", process_id=pk, image_id_list=image_id_list
            )
            if response:
                return Response({"successMsg": "Successfully deleted images"})
            return Response({"errorMsg": "Images not found"})
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {e} ]"}, status=200)
