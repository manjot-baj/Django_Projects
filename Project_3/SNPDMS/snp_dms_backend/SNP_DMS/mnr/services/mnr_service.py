from master.models import Site
from non_depot.models import NonDepotContainerStock
from depot.models import ContainerStock
from django.core.paginator import Paginator
from decouple import config
from common.functions import upload_file, download_file, delete_file
from mnr.models import (
    Survey,
    Repair,
    MnrStaff,
    SurveyLine,
    BeforeRepairImage,
    TariffMaster,
    TariffMasterLine,
    Estimate,
    Approval,
    AfterRepairImage,
    SurveyUnlockDetail,
)
import os
from django.http import HttpResponse
from datetime import datetime
from common.exceptions import ValidationError

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")
from django.utils import timezone


class MNRService:

    def detect_repair_type(self, stock):
        try:
            condition = stock.gate_in.condition
        except:
            condition = stock.container.condition
        return "Washing" if condition in ["OK", "CLEANING", "AV"] else "Damage"

    def getLengthWidthValueString(self, string):
        if "*" in string:
            return string.replace("*", " x ")
        else:
            return f"{string} x 0"

    def getGridData(self, payload, params, pg_no, on_page_data):
        site_object = Site.objects.select_related("location").get(
            location__name=payload["location"], name=payload["site"]
        )

        model = (
            ContainerStock if site_object.type == "DEPOT" else NonDepotContainerStock
        )
        queryset = (
            model.objects.select_related(
                "container",
                "container__client",
                "container__type",
                "container__size",
                "container__location",
                "container__site",
                "gate_in",
            )
            .filter(**params)
            .order_by("-gate_in__in_date")
        )

        # Pagination
        paginator = Paginator(queryset, on_page_data)
        no_of_data_count = paginator.count
        no_of_pages = paginator.num_pages
        current_page = paginator.page(pg_no)
        on_page_data_count = current_page.end_index() - current_page.start_index() + 1
        prev_page = ""
        if current_page.has_previous():
            prev_page = current_page.previous_page_number()
        next_page = ""
        if current_page.has_next():
            next_page = current_page.next_page_number()

        response_data = []
        count = 0
        for each in current_page:
            data_dict = each.get_stock_for_grid()
            data_dict["sr_no"] = current_page.start_index() + count
            response_data.append(data_dict)
            count += 1

        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": response_data,
        }

    def downloadMnrFileFromS3(self, process, process_id):
        bucket_name = AWS_STORAGE_BUCKET_NAME
        file_name = None
        object_name = None
        surveyObj = Survey.getById(process_id)
        if process == "Survey":
            file_name = surveyObj.s3_file_name
            object_name = surveyObj.s3_object_name
        else:
            repairObj = Repair.objects.get(parent__parent=surveyObj)
            file_name = repairObj.s3_file_name
            object_name = repairObj.s3_object_name
        temp_file_path = download_file(
            bucket=bucket_name, object_name=object_name, file_name=file_name
        )
        extension = os.path.splitext(file_name)[1]
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(
                temp.read(), content_type=f"application/{extension}"
            )
            file_response["Content-Disposition"] = f'attachment; filename="{file_name}"'
            os.remove(temp_file_path)
            return file_response

    def getTariffData(self, client, location, site, repair_type):
        parent = TariffMaster.objects.get(
            client=client,
            location__name=location,
            site__name=site,
        )
        labour_rate = str(parent.labour_rate)
        queryset = None
        
        if repair_type == "Washing":
            queryset = TariffMasterLine.objects.filter(parent=parent).exclude(wash_clean_tariff=float(0))
        else:
            queryset = TariffMasterLine.objects.filter(parent=parent, wash_clean_tariff=float(0))

        main_component_list = list(
            set(
                [
                    each.main_component
                    for each in queryset
                    if each.main_component is not None
                ]
            )
        )
        # main_component_list.append("UnSpecified")
        data = {
            "parent_id": parent.pk,
            "main_component": main_component_list,
            "labour_rate": labour_rate,
        }
        return data

    def getSurveyData(self, survey_data, location, site):
        data = {
            "pk": survey_data.pk,
            "survey_id": str(survey_data.pk),
            "make_available": str(survey_data.make_available),
            "is_draft": str(survey_data.is_draft),
            "is_proceed": str(survey_data.is_proceed),
            "is_img_uploaded": str(survey_data.is_img_uploaded),
            "is_locked": str(survey_data.is_locked),
            "update_count": str(survey_data.update_count),
            "location": location,
            "site": site,
            "estimate_number": survey_data.estimate_number,
            "survey_lines_rejected": [],
            "survey_lines_deleted": [],
        }
        if not survey_data.depot is None:
            data["stock_id"] = survey_data.depot.pk
        else:
            data["stock_id"] = survey_data.non_depot.pk

        if survey_data.number is None:
            data["number"] = ""
        else:
            data["number"] = survey_data.number

        if survey_data.original_date is None:
            data["original_date"] = ""
        else:
            data["original_date"] = survey_data.original_date.strftime("%Y-%m-%d")

        if survey_data.original_time is None:
            data["original_time"] = ""
        else:
            data["original_time"] = survey_data.original_time.strftime("%H:%M")

        if survey_data.current_date is None:
            data["current_date"] = ""
            data["date"] = ""
        else:
            data["date"] = survey_data.current_date.strftime("%Y-%m-%d")
            data["current_date"] = survey_data.current_date.strftime("%Y-%m-%d")

        if survey_data.current_time is None:
            data["current_time"] = ""
            data["time"] = ""
        else:
            data["time"] = survey_data.current_time.strftime("%H:%M")
            data["current_time"] = survey_data.current_time.strftime("%H:%M")

        if survey_data.survey_by is None:
            data["survey_by"] = ""
        else:
            data["survey_by"] = survey_data.survey_by.pk

        if survey_data.created_by is None:
            data["created_by"] = ""
        else:
            data["created_by"] = survey_data.created_by.firstname

        if survey_data.updated_by is None:
            data["updated_by"] = ""
        else:
            data["updated_by"] = survey_data.updated_by.firstname
        survey_line_data = SurveyLine.objects.filter(parent=survey_data)
        data["survey_lines"] = [
            {
                "pk": line.pk,
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_code": (
                    ""
                    if line.component_code is None
                    else line.component_code.split("_")[0]
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_code": (
                    ""
                    if line.location_code is None
                    else line.location_code.split("_")[0]
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_code": (
                    ""
                    if line.specific_location_code is None
                    else line.specific_location_code
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_code": (
                    ""
                    if line.material_code is None
                    else line.material_code.split("_")[0]
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_code": (
                    ""
                    if line.damage_code is None
                    else line.damage_code.split("_")[0].split("/")[0]
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_code": (
                    "" if line.repair_code is None else line.repair_code.split("_")[0]
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else self.getLengthWidthValueString(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "is_rejected": (
                    "" if line.is_rejected is None else str(line.is_rejected)
                ),
                "labour_hrs_tariff": (
                    str(float(0))
                    if line.labour_hrs_tariff is None
                    else str(line.labour_hrs_tariff)
                ),
                "material_tariff": (
                    str(float(0))
                    if line.material_tariff is None
                    else str(line.material_tariff)
                ),
                "wash_clean_tariff": (
                    str(float(0))
                    if line.wash_clean_tariff is None
                    else str(line.wash_clean_tariff)
                ),
                "labour_cost": (
                    str(float(0)) if line.labour_cost is None else str(line.labour_cost)
                ),
                "material_cost": (
                    str(float(0))
                    if line.material_cost is None
                    else str(line.material_cost)
                ),
                "total_cost": (
                    str(float(0)) if line.total_cost is None else str(line.total_cost)
                ),
                "tariff_field_enabled": (
                    ""
                    if line.tariff_field_enabled is None
                    else str(line.tariff_field_enabled)
                ),
                "delete_disabled": (
                    "" if line.delete_disabled is None else str(line.delete_disabled)
                ),
                "remarks": "" if line.remarks is None else str(line.remarks),
            }
            for line in survey_line_data
            if not line.is_rejected
        ]

        data["all_rejected_survey_lines"] = [
            {
                "pk": line.pk,
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_code": (
                    ""
                    if line.component_code is None
                    else line.component_code.split("_")[0]
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_code": (
                    ""
                    if line.location_code is None
                    else line.location_code.split("_")[0]
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_code": (
                    ""
                    if line.specific_location_code is None
                    else line.specific_location_code
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_code": (
                    ""
                    if line.material_code is None
                    else line.material_code.split("_")[0]
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_code": (
                    ""
                    if line.damage_code is None
                    else line.damage_code.split("_")[0].split("/")[0]
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_code": (
                    "" if line.repair_code is None else line.repair_code.split("_")[0]
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else self.getLengthWidthValueString(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "is_rejected": (
                    "" if line.is_rejected is None else str(line.is_rejected)
                ),
                "labour_hrs_tariff": (
                    str(float(0))
                    if line.labour_hrs_tariff is None
                    else str(line.labour_hrs_tariff)
                ),
                "material_tariff": (
                    str(float(0))
                    if line.material_tariff is None
                    else str(line.material_tariff)
                ),
                "wash_clean_tariff": (
                    str(float(0))
                    if line.wash_clean_tariff is None
                    else str(line.wash_clean_tariff)
                ),
                "labour_cost": (
                    str(float(0)) if line.labour_cost is None else str(line.labour_cost)
                ),
                "material_cost": (
                    str(float(0))
                    if line.material_cost is None
                    else str(line.material_cost)
                ),
                "total_cost": (
                    str(float(0)) if line.total_cost is None else str(line.total_cost)
                ),
                "tariff_field_enabled": (
                    ""
                    if line.tariff_field_enabled is None
                    else str(line.tariff_field_enabled)
                ),
                "delete_disabled": (
                    "" if line.delete_disabled is None else str(line.delete_disabled)
                ),
                "remarks": "" if line.remarks is None else str(line.remarks),
            }
            for line in survey_line_data
            if line.is_rejected
        ]

        data["survey_images"] = [
            {
                "pk": image.pk,
                "s3_object_name": image.s3_object_name,
                "s3_file_name": image.s3_file_name,
                "s3_image_link": f"https://{AWS_REPAIR_IMAGE_BUCKET_NAME}.s3.amazonaws.com/{image.s3_object_name}",
            }
            for image in BeforeRepairImage.objects.filter(parent=survey_data).iterator()
        ]

        return data

    def getEstimateData(self, estimate_data, survey_id, location, site):
        data = {
            "pk": estimate_data.pk,
            "estimate_id": str(estimate_data.pk),
            "is_draft": str(estimate_data.is_draft),
            "is_proceed": str(estimate_data.is_proceed),
            "is_locked": str(estimate_data.is_locked),
            "is_approved": str(estimate_data.is_approved),
            "survey_id": str(survey_id),
            "location": location,
            "site": site,
        }
        if estimate_data.number is None:
            data["number"] = ""
        else:
            data["number"] = estimate_data.number

        if estimate_data.original_date is None:
            data["original_date"] = ""
        else:
            data["original_date"] = estimate_data.original_date.strftime("%Y-%m-%d")

        if estimate_data.original_time is None:
            data["original_time"] = ""
        else:
            data["original_time"] = estimate_data.original_time.strftime("%H:%M")

        if estimate_data.current_date is None:
            data["current_date"] = ""
            data["date"] = ""
        else:
            data["date"] = estimate_data.current_date.strftime("%Y-%m-%d")
            data["current_date"] = estimate_data.current_date.strftime("%Y-%m-%d")

        if estimate_data.current_time is None:
            data["current_time"] = ""
            data["time"] = ""
        else:
            data["time"] = estimate_data.current_time.strftime("%H:%M")
            data["current_time"] = estimate_data.current_time.strftime("%H:%M")

        if estimate_data.estimate_by is None:
            data["estimate_by"] = ""
        else:
            data["estimate_by"] = estimate_data.estimate_by.pk

        if estimate_data.created_by is None:
            data["created_by"] = ""
        else:
            data["created_by"] = estimate_data.created_by.firstname

        if estimate_data.updated_by is None:
            data["updated_by"] = ""
        else:
            data["updated_by"] = estimate_data.updated_by.firstname

        survey_line_data = SurveyLine.objects.filter(parent__pk=survey_id)
        amount_without_tax = sum([float(line.total_cost) for line in survey_line_data])
        tax = round(amount_without_tax * 0, 2)
        amount = round(amount_without_tax, 2) + tax
        data["amount"] = str(round(amount, 2))
        data["original_amount"] = str(estimate_data.original_amount)
        data["current_amount"] = str(amount)
        survey_line_data = SurveyLine.objects.filter(parent__pk=estimate_data.parent.pk)
        damage_lines = [
            {
                "pk": line.pk,
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_code": (
                    ""
                    if line.component_code is None
                    else line.component_code.split("_")[0]
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_code": (
                    ""
                    if line.location_code is None
                    else line.location_code.split("_")[0]
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_code": (
                    ""
                    if line.specific_location_code is None
                    else line.specific_location_code
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_code": (
                    ""
                    if line.material_code is None
                    else line.material_code.split("_")[0]
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_code": (
                    ""
                    if line.damage_code is None
                    else line.damage_code.split("_")[0].split("/")[0]
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_code": (
                    "" if line.repair_code is None else line.repair_code.split("_")[0]
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else self.getLengthWidthValueString(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "is_rejected": (
                    "" if line.is_rejected is None else str(line.is_rejected)
                ),
                "labour_hrs_tariff": (
                    str(float(0))
                    if line.labour_hrs_tariff is None
                    else str(line.labour_hrs_tariff)
                ),
                "material_tariff": (
                    str(float(0))
                    if line.material_tariff is None
                    else str(line.material_tariff)
                ),
                "wash_clean_tariff": (
                    str(float(0))
                    if line.wash_clean_tariff is None
                    else str(line.wash_clean_tariff)
                ),
                "labour_cost": (
                    str(float(0)) if line.labour_cost is None else str(line.labour_cost)
                ),
                "material_cost": (
                    str(float(0))
                    if line.material_cost is None
                    else str(line.material_cost)
                ),
                "total_cost": (
                    str(float(0)) if line.total_cost is None else str(line.total_cost)
                ),
                "tariff_field_enabled": (
                    ""
                    if line.tariff_field_enabled is None
                    else str(line.tariff_field_enabled)
                ),
                "delete_disabled": (
                    "" if line.delete_disabled is None else str(line.delete_disabled)
                ),
                "remarks": "" if line.remarks is None else str(line.remarks),
            }
            for line in survey_line_data
            if str(float(line.wash_clean_tariff)) == str(float(0))
            and line.is_rejected is False
        ]
        cleaning_lines = [
            {
                "pk": line.pk,
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_code": (
                    ""
                    if line.component_code is None
                    else line.component_code.split("_")[0]
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_code": (
                    ""
                    if line.location_code is None
                    else line.location_code.split("_")[0]
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_code": (
                    ""
                    if line.specific_location_code is None
                    else line.specific_location_code
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_code": (
                    ""
                    if line.material_code is None
                    else line.material_code.split("_")[0]
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_code": (
                    ""
                    if line.damage_code is None
                    else line.damage_code.split("_")[0].split("/")[0]
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_code": (
                    "" if line.repair_code is None else line.repair_code.split("_")[0]
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else self.getLengthWidthValueString(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "is_rejected": (
                    "" if line.is_rejected is None else str(line.is_rejected)
                ),
                "labour_hrs_tariff": (
                    str(float(0))
                    if line.labour_hrs_tariff is None
                    else str(line.labour_hrs_tariff)
                ),
                "material_tariff": (
                    str(float(0))
                    if line.material_tariff is None
                    else str(line.material_tariff)
                ),
                "wash_clean_tariff": (
                    str(float(0))
                    if line.wash_clean_tariff is None
                    else str(line.wash_clean_tariff)
                ),
                "labour_cost": (
                    str(float(0)) if line.labour_cost is None else str(line.labour_cost)
                ),
                "material_cost": (
                    str(float(0))
                    if line.material_cost is None
                    else str(line.material_cost)
                ),
                "total_cost": (
                    str(float(0)) if line.total_cost is None else str(line.total_cost)
                ),
                "tariff_field_enabled": (
                    ""
                    if line.tariff_field_enabled is None
                    else str(line.tariff_field_enabled)
                ),
                "delete_disabled": (
                    "" if line.delete_disabled is None else str(line.delete_disabled)
                ),
                "remarks": "" if line.remarks is None else str(line.remarks),
            }
            for line in survey_line_data
            if not str(float(line.wash_clean_tariff)) == str(float(0))
            and line.is_rejected is False
        ]
        data["survey_lines"] = {
            "damage_lines": damage_lines,
            "cleaning_lines": cleaning_lines,
        }
        return data

    def getApprovalData(self, approval_data, estimate_id, location, site):

        data = {
            "pk": approval_data.pk,
            "approval_id": approval_data.pk,
            "is_draft": str(approval_data.is_draft),
            "is_proceed": str(approval_data.is_proceed),
            "sent_to_line": str(approval_data.sent_to_line),
            "is_approved": str(approval_data.is_approved),
            "is_locked": str(approval_data.is_locked),
            "is_denied": str(approval_data.is_denied),
            "proceed_without_approval": str(approval_data.proceed_without_approval),
            "estimate_id": estimate_id,
            "location": location,
            "site": site,
        }

        if approval_data.original_date is None:
            data["original_date"] = ""
        else:
            data["original_date"] = approval_data.original_date.strftime("%Y-%m-%d")

        if approval_data.original_time is None:
            data["original_time"] = ""
        else:
            data["original_time"] = approval_data.original_time.strftime("%H:%M")

        if approval_data.current_date is None:
            data["current_date"] = ""
            data["date"] = ""
        else:
            data["date"] = approval_data.current_date.strftime("%Y-%m-%d")
            data["current_date"] = approval_data.current_date.strftime("%Y-%m-%d")

        if approval_data.current_time is None:
            data["current_time"] = ""
            data["time"] = ""
        else:
            data["time"] = approval_data.current_time.strftime("%H:%M")
            data["current_time"] = approval_data.current_time.strftime("%H:%M")

        if approval_data.approved_date is None:
            data["approved_date"] = ""
        else:
            data["approved_date"] = approval_data.approved_date.strftime("%Y-%m-%d")

        if approval_data.approved_time is None:
            data["approved_time"] = ""
        else:
            data["approved_time"] = approval_data.approved_time.strftime("%H:%M")

        if approval_data.created_by is None:
            data["created_by"] = ""
        else:
            data["created_by"] = approval_data.created_by.username

        if approval_data.updated_by is None:
            data["updated_by"] = ""
        else:
            data["updated_by"] = approval_data.updated_by.username

        if approval_data.denial_reason is None:
            data["denial_reason"] = ""
        else:
            data["denial_reason"] = approval_data.denial_reason

        estimate_data = Estimate.getById(estimate_id)
        survey_line_data = SurveyLine.objects.filter(parent__pk=estimate_data.parent.pk)
        amount_without_tax = sum([float(line.total_cost) for line in survey_line_data])
        tax = round(amount_without_tax * 0, 2)
        amount = round(amount_without_tax, 2) + tax
        data["approval_amount"] = str(round(amount, 2))
        data["approved_amount"] = str(approval_data.approved_amount)
        data["denied_amount"] = str(approval_data.denied_amount)
        return data

    def getRepairData(self, repair_data, estimate_id, location, site):

        man_hours = sum(
            list(
                SurveyLine.objects.filter(parent=repair_data.parent.parent).values_list(
                    "labour_hrs_tariff", flat=True
                )
            )
        )
        data = {
            "pk": repair_data.pk,
            "repair_id": repair_data.pk,
            "placement": str(repair_data.placement),
            "complete": str(repair_data.complete),
            "is_img_uploaded": str(repair_data.is_img_uploaded),
            "is_draft": str(repair_data.is_draft),
            "is_proceed": str(repair_data.is_proceed),
            "estimate_id": str(estimate_id),
            "location": location,
            "site": site,
            "man_hours": man_hours,
        }

        if repair_data.number is None:
            data["number"] = ""
        else:
            data["number"] = repair_data.number

        if repair_data.placement_date is None:
            data["placement_date"] = ""
        else:
            data["placement_date"] = repair_data.placement_date.strftime("%Y-%m-%d")

        if repair_data.placement_time is None:
            data["placement_time"] = ""
        else:
            data["placement_time"] = repair_data.placement_time.strftime("%H:%M")

        if repair_data.repair_date is None:
            data["repair_date"] = ""
        else:
            data["repair_date"] = repair_data.repair_date.strftime("%Y-%m-%d")

        if repair_data.repair_time is None:
            data["repair_time"] = ""
        else:
            data["repair_time"] = repair_data.repair_time.strftime("%H:%M")

        if repair_data.current_repair_date is None:
            data["current_repair_date"] = ""
        else:
            data["current_repair_date"] = repair_data.current_repair_date.strftime(
                "%Y-%m-%d"
            )

        if repair_data.current_repair_time is None:
            data["current_repair_time"] = ""
        else:
            data["current_repair_time"] = repair_data.current_repair_time.strftime(
                "%H:%M"
            )

        if repair_data.created_by is None:
            data["created_by"] = ""
        else:
            data["created_by"] = repair_data.created_by.username

        if repair_data.updated_by is None:
            data["updated_by"] = ""
        else:
            data["updated_by"] = repair_data.updated_by.username

        if repair_data.damage_category is None:
            data["damage_category"] = ""
        else:
            data["damage_category"] = repair_data.damage_category

        if repair_data.grade is None:
            data["grade"] = ""
        else:
            data["grade"] = repair_data.grade

        if repair_data.remarks is None:
            data["remarks"] = ""
        else:
            data["remarks"] = repair_data.remarks

        if repair_data.man_power.all().count() == 0:
            data["man_power"] = []
        else:
            data["man_power"] = [each.pk for each in repair_data.man_power.all()]

        data["repair_images"] = [
            {
                "pk": image.pk,
                "s3_object_name": image.s3_object_name,
                "s3_file_name": image.s3_file_name,
                "s3_image_link": f"https://{AWS_REPAIR_IMAGE_BUCKET_NAME}.s3.amazonaws.com/{image.s3_object_name}",
            }
            for image in AfterRepairImage.objects.filter(parent=repair_data).iterator()
        ]
        return data

    def getMNRDataBySearch(self, site, data):
        response = {}
        if site.type == "DEPOT":
            req_date = datetime.strptime(data["date"], "%d/%m/%Y").date()
            stock = ContainerStock.objects.get(
                container__container_no=data["container_no"],
                gate_in__in_date=req_date,
                container__location__name=data["location"],
                container__site__name=data["site"],
            )
            client = stock.container.client.ref_code
            repair_type = self.detect_repair_type(stock)
            response["container_data"] = stock.get_mnr_container_header_data()
            response["tariff_data"] = self.getTariffData(
                client=client,
                location=data["location"],
                site=data["site"],
                repair_type=repair_type,
            )
            response["repair_type"] = repair_type
            surveyor_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Surveyor",
                ).values("pk", "firstName", "lastName", "role")
            )
            edp_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="EDP",
                ).values("pk", "firstName", "lastName", "role")
            )
            worker_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Worker",
                ).values("pk", "firstName", "lastName", "role")
            )
            response["staff_data"] = {
                "surveyor_list": surveyor_list,
                "edp_list": edp_list,
                "worker_list": worker_list,
            }
            if Survey.checkExistByDepotId(stock.pk):
                survey_data = Survey.getByDepotId(stock.pk)
                response["survey"] = self.getSurveyData(
                    survey_data=survey_data,
                    location=data["location"],
                    site=data["site"],
                )
                if Estimate.checkExistByParentId(survey_data.pk):
                    estimate_data = Estimate.getByParentId(survey_data.pk)
                    response["estimate"] = self.getEstimateData(
                        estimate_data=estimate_data,
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Approval.checkExistByParentId(estimate_data.pk):
                        approval_data = Approval.getByParentId(estimate_data.pk)
                        response["approval"] = self.getApprovalData(
                            approval_data=approval_data,
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Repair.checkExistByParentId(estimate_data.pk):
                            repair_data = Repair.getByParentId(estimate_data.pk)
                            response["repair"] = self.getRepairData(
                                repair_data=repair_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                        else:
                            response["repair"] = self.getRepairEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["approval"] = self.getApprovalEntryFormat(
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["estimate"] = self.getEstimateEntryFormat(
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            else:
                response["survey"] = self.getSurveyEntryFormat(
                    stock_id=stock.pk,
                    location=data["location"],
                    site=data["site"],
                )
        else:
            req_date = datetime.strptime(data["date"], "%d/%m/%Y").date()
            stock = NonDepotContainerStock.objects.get(
                container__container_no=data["container_no"],
                gate_in__in_date=req_date,
                container__location__name=data["location"],
                container__site__name=data["site"],
            )
            client = stock.container.client.ref_code
            repair_type = self.detect_repair_type(stock)
            response["container_data"] = stock.get_mnr_container_header_data()
            response["tariff_data"] = self.getTariffData(
                client=client,
                location=data["location"],
                site=data["site"],
                repair_type=repair_type,
            )
            response["repair_type"] = repair_type
            surveyor_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Surveyor",
                ).values("pk", "firstName", "lastName", "role")
            )
            edp_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="EDP",
                ).values("pk", "firstName", "lastName", "role")
            )
            worker_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Worker",
                ).values("pk", "firstName", "lastName", "role")
            )
            response["staff_data"] = {
                "surveyor_list": surveyor_list,
                "edp_list": edp_list,
                "worker_list": worker_list,
            }
            if Survey.checkExistByNonDepotId(stock.pk):
                survey_data = Survey.getByNonDepotId(stock.pk)
                response["survey"] = self.getSurveyData(
                    survey_data=survey_data,
                    location=data["location"],
                    site=data["site"],
                )
                if Estimate.checkExistByParentId(survey_data.pk):
                    estimate_data = Estimate.getByParentId(survey_data.pk)
                    response["estimate"] = self.getEstimateData(
                        estimate_data=estimate_data,
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Approval.checkExistByParentId(estimate_data.pk):
                        approval_data = Approval.getByParentId(estimate_data.pk)
                        response["approval"] = self.getApprovalData(
                            approval_data=approval_data,
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Repair.checkExistByParentId(estimate_data.pk):
                            repair_data = Repair.getByParentId(estimate_data.pk)
                            response["repair"] = self.getRepairData(
                                repair_data=repair_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                        else:
                            response["repair"] = self.getRepairEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["approval"] = self.getApprovalEntryFormat(
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["estimate"] = self.getEstimateEntryFormat(
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            else:
                response["survey"] = self.getSurveyEntryFormat(
                    stock_id=stock.pk,
                    location=data["location"],
                    site=data["site"],
                )
        return response

    def getSurveyEntryFormat(self, stock_id, location, site):

        dt = datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        time = dt.time().strftime("%H:%M")
        survey_data = {
            "stock_id": stock_id,
            "location": location,
            "site": site,
            "date": date,
            "time": time,
            "survey_by": "",
            "make_available": "False",
            "is_draft": "False",
            "is_proceed": "False",
            "survey_lines_rejected": [],
            "survey_lines_deleted": [],
            "survey_lines": [],
        }
        return survey_data

    def getEstimateEntryFormat(self, survey_id, location, site):
        dt = datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        time = dt.time().strftime("%H:%M")
        survey_line_data = SurveyLine.objects.filter(parent__pk=survey_id)
        amount_without_tax = sum([float(line.total_cost) for line in survey_line_data])
        tax = round(amount_without_tax * 0, 2)
        amount = round(amount_without_tax, 2) + tax
        estimate_data = {
            "survey_id": survey_id,
            "location": location,
            "site": site,
            "date": date,
            "time": time,
            "estimate_by": "",
            "amount": str(round(amount, 2)),
            "is_draft": "False",
            "is_proceed": "False",
        }
        damage_lines = [
            {
                "pk": line.pk,
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_code": (
                    ""
                    if line.component_code is None
                    else line.component_code.split("_")[0]
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_code": (
                    ""
                    if line.location_code is None
                    else line.location_code.split("_")[0]
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_code": (
                    ""
                    if line.specific_location_code is None
                    else line.specific_location_code
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_code": (
                    ""
                    if line.material_code is None
                    else line.material_code.split("_")[0]
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_code": (
                    ""
                    if line.damage_code is None
                    else line.damage_code.split("_")[0].split("/")[0]
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_code": (
                    "" if line.repair_code is None else line.repair_code.split("_")[0]
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else self.getLengthWidthValueString(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "is_rejected": (
                    "" if line.is_rejected is None else str(line.is_rejected)
                ),
                "labour_hrs_tariff": (
                    str(float(0))
                    if line.labour_hrs_tariff is None
                    else str(line.labour_hrs_tariff)
                ),
                "material_tariff": (
                    str(float(0))
                    if line.material_tariff is None
                    else str(line.material_tariff)
                ),
                "wash_clean_tariff": (
                    str(float(0))
                    if line.wash_clean_tariff is None
                    else str(line.wash_clean_tariff)
                ),
                "labour_cost": (
                    str(float(0)) if line.labour_cost is None else str(line.labour_cost)
                ),
                "material_cost": (
                    str(float(0))
                    if line.material_cost is None
                    else str(line.material_cost)
                ),
                "total_cost": (
                    str(float(0)) if line.total_cost is None else str(line.total_cost)
                ),
                "tariff_field_enabled": (
                    ""
                    if line.tariff_field_enabled is None
                    else str(line.tariff_field_enabled)
                ),
                "delete_disabled": (
                    "" if line.delete_disabled is None else str(line.delete_disabled)
                ),
                "remarks": "" if line.remarks is None else str(line.remarks),
            }
            for line in survey_line_data
            if str(float(line.wash_clean_tariff)) == str(float(0))
            and line.is_rejected is False
        ]
        cleaning_lines = [
            {
                "pk": line.pk,
                "tariff_code": "" if line.tariff_code is None else line.tariff_code,
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_code": (
                    ""
                    if line.component_code is None
                    else line.component_code.split("_")[0]
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_code": (
                    ""
                    if line.location_code is None
                    else line.location_code.split("_")[0]
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_code": (
                    ""
                    if line.specific_location_code is None
                    else line.specific_location_code
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_code": (
                    ""
                    if line.material_code is None
                    else line.material_code.split("_")[0]
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_code": (
                    ""
                    if line.damage_code is None
                    else line.damage_code.split("_")[0].split("/")[0]
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_code": (
                    "" if line.repair_code is None else line.repair_code.split("_")[0]
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else self.getLengthWidthValueString(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
                "is_rejected": (
                    "" if line.is_rejected is None else str(line.is_rejected)
                ),
                "labour_hrs_tariff": (
                    str(float(0))
                    if line.labour_hrs_tariff is None
                    else str(line.labour_hrs_tariff)
                ),
                "material_tariff": (
                    str(float(0))
                    if line.material_tariff is None
                    else str(line.material_tariff)
                ),
                "wash_clean_tariff": (
                    str(float(0))
                    if line.wash_clean_tariff is None
                    else str(line.wash_clean_tariff)
                ),
                "labour_cost": (
                    str(float(0)) if line.labour_cost is None else str(line.labour_cost)
                ),
                "material_cost": (
                    str(float(0))
                    if line.material_cost is None
                    else str(line.material_cost)
                ),
                "total_cost": (
                    str(float(0)) if line.total_cost is None else str(line.total_cost)
                ),
                "tariff_field_enabled": (
                    ""
                    if line.tariff_field_enabled is None
                    else str(line.tariff_field_enabled)
                ),
                "delete_disabled": (
                    "" if line.delete_disabled is None else str(line.delete_disabled)
                ),
                "remarks": "" if line.remarks is None else str(line.remarks),
            }
            for line in survey_line_data
            if not str(float(line.wash_clean_tariff)) == str(float(0))
            and line.is_rejected is False
        ]
        estimate_data["survey_lines"] = {
            "damage_lines": damage_lines,
            "cleaning_lines": cleaning_lines,
        }
        return estimate_data

    def getApprovalEntryFormat(self, estimate_id, location, site):

        dt = datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y-%m-%d")
        time = dt.time().strftime("%H:%M")
        estimate_data = Estimate.getById(estimate_id)
        survey_line_data = SurveyLine.objects.filter(parent__pk=estimate_data.parent.pk)
        amount_without_tax = sum([float(line.total_cost) for line in survey_line_data])
        tax = round(amount_without_tax * 0, 2)
        amount = round(amount_without_tax, 2) + tax
        approval_data = {
            "estimate_id": estimate_data.pk,
            "location": location,
            "site": site,
            "date": date,
            "time": time,
            "approved_date": "",
            "approved_time": "",
            "denial_reason": "",
            "approval_amount": str(round(amount, 2)),
            "approved_amount": str(float(0)),
            "denied_amount": str(float(0)),
            "sent_to_line": "False",
            "is_approved": "False",
            "is_denied": "False",
            "proceed_without_approval": "False",
            "is_draft": "False",
            "is_proceed": "False",
        }
        return approval_data

    def getRepairEntryFormat(self, estimate_id, location, site):

        repair_data = {
            "estimate_id": estimate_id,
            "location": location,
            "site": site,
            "placement": "False",
            "damage_category": "",
            "grade": "",
            "complete": "False",
            "remarks": "",
            "man_power": [],
            "is_draft": "False",
            "is_proceed": "False",
            "man_hours": "",
        }
        return repair_data

    def getMNRDataByEdit(self, data, site):
        response = {}
        if site.type == "DEPOT":
            stock = ContainerStock.objects.get(pk=data["stock_id"])
            client = stock.container.client.ref_code
            repair_type = self.detect_repair_type(stock)
            response["container_data"] = stock.get_mnr_container_header_data()
            response["tariff_data"] = self.getTariffData(
                client=client,
                location=data["location"],
                site=data["site"],
                repair_type=repair_type,
            )
            response["repair_type"] = repair_type
            surveyor_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Surveyor",
                ).values("pk", "firstName", "lastName", "role")
            )
            edp_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="EDP",
                ).values("pk", "firstName", "lastName", "role")
            )
            worker_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Worker",
                ).values("pk", "firstName", "lastName", "role")
            )
            response["staff_data"] = {
                "surveyor_list": surveyor_list,
                "edp_list": edp_list,
                "worker_list": worker_list,
            }
            if Survey.checkExistByDepotId(stock.pk):
                survey_data = Survey.getByDepotId(stock.pk)
                response["survey"] = self.getSurveyData(
                    survey_data=survey_data,
                    location=data["location"],
                    site=data["site"],
                )
                if Estimate.checkExistByParentId(survey_data.pk):
                    estimate_data = Estimate.getByParentId(survey_data.pk)
                    response["estimate"] = self.getEstimateData(
                        estimate_data=estimate_data,
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Approval.checkExistByParentId(estimate_data.pk):
                        approval_data = Approval.getByParentId(estimate_data.pk)
                        response["approval"] = self.getApprovalData(
                            approval_data=approval_data,
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Repair.checkExistByParentId(estimate_data.pk):
                            repair_data = Repair.getByParentId(estimate_data.pk)
                            response["repair"] = self.getRepairData(
                                repair_data=repair_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                        else:
                            response["repair"] = self.getRepairEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["approval"] = self.getApprovalEntryFormat(
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["estimate"] = self.getEstimateEntryFormat(
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            else:
                response["survey"] = self.getSurveyEntryFormat(
                    stock_id=stock.pk,
                    location=data["location"],
                    site=data["site"],
                )
        else:
            stock = NonDepotContainerStock.objects.get(pk=data["stock_id"])
            client = stock.container.client.ref_code
            repair_type = self.detect_repair_type(stock)
            response["container_data"] = stock.get_mnr_container_header_data()
            response["tariff_data"] = self.getTariffData(
                client=client,
                location=data["location"],
                site=data["site"],
                repair_type=repair_type,
            )
            response["repair_type"] = repair_type
            surveyor_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Surveyor",
                ).values("pk", "firstName", "lastName", "role")
            )
            edp_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="EDP",
                ).values("pk", "firstName", "lastName", "role")
            )
            worker_list = list(
                MnrStaff.objects.filter(
                    location__name=data["location"],
                    site__name=data["site"],
                    role="Worker",
                ).values("pk", "firstName", "lastName", "role")
            )
            response["staff_data"] = {
                "surveyor_list": surveyor_list,
                "edp_list": edp_list,
                "worker_list": worker_list,
            }
            if Survey.checkExistByNonDepotId(stock.pk):
                survey_data = Survey.getByNonDepotId(stock.pk)
                response["survey"] = self.getSurveyData(
                    survey_data=survey_data,
                    location=data["location"],
                    site=data["site"],
                )
                if Estimate.checkExistByParentId(survey_data.pk):
                    estimate_data = Estimate.getByParentId(survey_data.pk)
                    response["estimate"] = self.getEstimateData(
                        estimate_data=estimate_data,
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
                    if Approval.checkExistByParentId(estimate_data.pk):
                        approval_data = Approval.getByParentId(estimate_data.pk)
                        response["approval"] = self.getApprovalData(
                            approval_data=approval_data,
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                        if Repair.checkExistByParentId(estimate_data.pk):
                            repair_data = Repair.getByParentId(estimate_data.pk)
                            response["repair"] = self.getRepairData(
                                repair_data=repair_data,
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                        else:
                            response["repair"] = self.getRepairEntryFormat(
                                estimate_id=estimate_data.pk,
                                location=data["location"],
                                site=data["site"],
                            )
                    else:
                        response["approval"] = self.getApprovalEntryFormat(
                            estimate_id=estimate_data.pk,
                            location=data["location"],
                            site=data["site"],
                        )
                else:
                    response["estimate"] = self.getEstimateEntryFormat(
                        survey_id=survey_data.pk,
                        location=data["location"],
                        site=data["site"],
                    )
            else:
                response["survey"] = self.getSurveyEntryFormat(
                    stock_id=stock.pk,
                    location=data["location"],
                    site=data["site"],
                )
        return response

    def unlockSurveyEstimates(self, data, site, location):
        response = {}
        if len(data["reason_to_unlock"]) == 0:
            raise ValidationError("Please provide a reason to unlock")
        reason_to_unlock = data["reason_to_unlock"]
        stock_model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
        stock = stock_model.objects.get(pk=data["stock_id"])
        client = stock.container.client.ref_code
        automatic_mnr_status_change = stock.container.automatic_mnr_status_change
        if stock.stage in ["Available", "Repair"]:
            survey = None
            estimate = None
            approval = None
            repair = None
            if site.type == "DEPOT":
                if Survey.objects.filter(depot=stock).exists():
                    survey = Survey.objects.get(depot=stock)
            else:
                if Survey.objects.filter(non_depot=stock).exists():
                    survey = Survey.objects.get(non_depot=stock)
            if Estimate.objects.filter(parent=survey).exists():
                estimate = Estimate.objects.get(parent=survey)
            if Approval.objects.filter(parent=estimate).exists():
                approval = Approval.objects.get(parent=estimate)
            if Repair.objects.filter(parent=estimate).exists():
                repair = Repair.objects.get(parent=estimate)
            if survey is not None:
                survey.is_locked = False
                survey.save()
            if estimate is not None:
                estimate.is_locked = False
                estimate.save()
            if approval is not None:
                approval.delete()
            if repair is not None:
                repair.delete()
            stock.approval_date = None
            stock.approval_time = None
            stock.repair_date = None
            stock.repair_time = None
            stock.available_date = None
            stock.available_time = None
            stock.estimate_status = None
            stock.is_repair_destim_sent = False
            stock.stage = "Approval"
            stock.container.is_available = False
            stock.container.save()
            if automatic_mnr_status_change is True:
                stock.status = "Approval Pending"
                stock.approval_pending_out_date_time = None
                stock.approved_in_date_time = None
                stock.approved_out_date_time = None
                stock.under_repair_in_date_time = None
                stock.under_repair_out_date_time = None
                stock.available_in_date_time = None
                stock.available_out_date_time = None
            stock.save()

            # Saving unlock reason
            SurveyUnlockDetail(parent=survey, reason_to_unlock=reason_to_unlock).save()

            # response
            response["container_data"] = stock.get_mnr_container_header_data()
            repair_type = self.detect_repair_type(stock)
            response["tariff_data"] = self.getTariffData(
                client=client,
                location=location,
                site=site,
                repair_type=repair_type,
            )
            response["repair_type"] = repair_type
            surveyor_list = list(
                MnrStaff.objects.filter(
                    location=location,
                    site=site,
                    role="Surveyor",
                ).values("pk", "firstName", "lastName", "role")
            )
            edp_list = list(
                MnrStaff.objects.filter(
                    location=location,
                    site=site,
                    role="EDP",
                ).values("pk", "firstName", "lastName", "role")
            )
            worker_list = list(
                MnrStaff.objects.filter(
                    location=location,
                    site=site,
                    role="Worker",
                ).values("pk", "firstName", "lastName", "role")
            )
            response["staff_data"] = {
                "surveyor_list": surveyor_list,
                "edp_list": edp_list,
                "worker_list": worker_list,
            }
            if survey is not None:
                response["survey"] = self.getSurveyData(
                    survey_data=survey,
                    location=data["location"],
                    site=data["site"],
                )
                if estimate is not None:
                    response["estimate"] = self.getEstimateData(
                        estimate_data=estimate,
                        survey_id=survey.pk,
                        location=data["location"],
                        site=data["site"],
                    )
                    response["approval"] = self.getApprovalEntryFormat(
                        estimate_id=estimate.pk,
                        location=data["location"],
                        site=data["site"],
                    )

            return response
        else:
            raise ValidationError(
                "You can only unlock a survey or estimate that is in 'Available' or 'Repair' stage."
            )
