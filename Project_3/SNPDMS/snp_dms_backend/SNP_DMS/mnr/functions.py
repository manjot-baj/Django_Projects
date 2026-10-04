import os, xlsxwriter, random
from re import M
from decouple import config
from SNP_DMS.settings.base import BASE_DIR
from django.http import HttpResponse
from common.functions import upload_file, download_file, delete_file
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
import io

from .models import (
    TariffMaster,
    Survey,
    SurveyLine,
    Estimate,
    Approval,
    Repair,
    TariffMasterLine,
    BeforeRepairImage,
    AfterRepairImage,
    WistimS3Upload,
    TariffSpecificLocation,
    MnrStaff,
)
from PIL import Image
from io import BytesIO
from depot.models import Container
import zipfile
from SNP_DMS.settings.base import BASE_DIR
import os, datetime, openpyxl
from django.utils import timezone
from depot.functions_two import check_char_digit
from account.models import AccountUser
from depot.models import ContainerStock
from master.models import Site, Location
from non_depot.models import NonDepotContainerStock
import zipfile, ftplib, logging, traceback
from wistim_distim.functions import extract_edi_data, make_excel_data
import paramiko

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


def upload_mnr_file_to_s3(
    location, site, site_type, container_no, process, processId, file
):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        surveyObj = Survey.getById(processId)
        object_name = (
            f"MNR/{location}/{site_type}/{site}/{process}/{container_no}/{processId}/"
            f"{container_no}_{process}_{processId}_{file}"
        )
        if process == "Survey":
            if surveyObj.s3_object_name is not None:
                if not len(surveyObj.s3_object_name) == 0:
                    delete_file(
                        bucket=bucket_name, object_name=surveyObj.s3_object_name
                    )
            try:
                if not os.path.exists(os.path.join(BASE_DIR, "temp/MNR/Survey/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/MNR/Survey/"))
                temp_file_path = os.path.join(BASE_DIR, f"temp/MNR/Survey/{file}")
                with open(temp_file_path, "wb") as temp:
                    temp.write(file.read())
                upload_file(temp_file_path, bucket_name, object_name)
                surveyObj.is_uploaded = True
                surveyObj.s3_object_name = object_name
                surveyObj.s3_file_name = (
                    f"{container_no}_{process}_{processId}_{file.name}"
                )
                surveyObj.save()
                os.remove(temp_file_path)
                return True
            except Exception as e:
                os.remove(temp_file_path)
                return False
        else:
            repairObj = Repair.objects.get(parent__parent=surveyObj)
            if repairObj.s3_object_name is not None:
                if not len(repairObj.s3_object_name) == 0:
                    delete_file(
                        bucket=bucket_name, object_name=repairObj.s3_object_name
                    )
            try:
                if not os.path.exists(os.path.join(BASE_DIR, "temp/MNR/Repair/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/MNR/Repair/"))
                temp_file_path = os.path.join(BASE_DIR, f"temp/MNR/Repair/{file}")
                with open(temp_file_path, "wb") as temp:
                    temp.write(file.read())
                upload_file(temp_file_path, bucket_name, object_name)
                repairObj.is_uploaded = True
                repairObj.s3_object_name = object_name
                repairObj.s3_file_name = (
                    f"{container_no}_{process}_{repairObj.pk}_{file.name}"
                )
                repairObj.save()
                os.remove(temp_file_path)
                return True
            except Exception as e:
                os.remove(temp_file_path)
                return False
    except Exception as e:
        return False


def download_mnr_file_from_s3(process, process_id):
    try:
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_only_images(file_list):
    try:
        # ext = ["jpeg", "png", "jpg"]
        check = [True for file in file_list if file.name.split(".")[1] == "zip"]

        if True in check:
            images = []
            for each_file in file_list:
                with zipfile.ZipFile(each_file, "r") as zip_ref:
                    for file_info in zip_ref.infolist():
                        if file_info.filename.endswith((".jpeg", ".png", ".jpg")):
                            with zip_ref.open(file_info) as file:
                                image_bytes = BytesIO(file.read())
                                image_bytes.name = os.path.basename(file_info.filename)
                                images.append(image_bytes)
        else:
            images = [
                file
                for file in file_list
                if file.name.endswith((".jpeg", ".png", ".jpg"))
            ]
        if not images:
            return False

        compressed_images = []
        for image in images:
            compressed_image = compress_image(image)
            compressed_images.append(compressed_image)
        return compressed_images
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def upload_mnr_repair_img_to_s3(
    location, site, site_type, container_no, process, processId, file_list, add
):
    try:
        bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
        surveyObj = Survey.getById(processId)
        img_type = None

        if process == "Survey":
            if surveyObj.is_img_uploaded and add == "False":
                images = BeforeRepairImage.objects.filter(parent=surveyObj)
                for image in images:
                    delete_file(bucket=bucket_name, object_name=image.s3_object_name)
                    image.delete()

            img_type = "Before_Repair_Images"
            if add == "True":
                count = BeforeRepairImage.objects.filter(parent=surveyObj).count()
            else:
                count = 0

            for file in file_list:
                count = count + 1
                serial_no = str(count).zfill(3)
                extension = os.path.splitext(file.name)[1]
                filename = f"B_{container_no}_{surveyObj.estimate_number}_{serial_no}.{extension}"
                object_name = f"MNR/{location}/{site_type}/{site}/{img_type}_{container_no}_{processId}/{filename}"
                try:
                    if not os.path.exists(os.path.join(BASE_DIR, "temp/MNR/Survey/")):
                        os.makedirs(os.path.join(BASE_DIR, "temp/MNR/Survey/"))
                    temp_file_path = os.path.join(BASE_DIR, f"temp/MNR/Survey/{file}")
                    with open(temp_file_path, "wb") as temp:
                        temp.write(file.read())
                    upload_file(temp_file_path, bucket_name, object_name, True)
                    surveyObj.is_img_uploaded = True
                    surveyObj.save(update_fields=["is_img_uploaded"])

                    if surveyObj.depot:
                        surveyObj.depot.pre_mnr_img_uploaded = True
                        surveyObj.depot.save(update_fields=["pre_mnr_img_uploaded"])
                    else:
                        surveyObj.non_depot.pre_mnr_img_uploaded = True
                        surveyObj.non_depot.save(update_fields=["pre_mnr_img_uploaded"])

                    BeforeRepairImage(
                        parent=surveyObj,
                        s3_object_name=object_name,
                        s3_file_name=filename,
                    ).save()

                    os.remove(temp_file_path)
                except:
                    os.remove(temp_file_path)
                    continue
            return True

        else:
            estimateObj = Estimate.getByParentId(surveyObj.pk)
            repairObj = Repair.objects.get(parent=estimateObj)

            if repairObj.is_img_uploaded and add == "False":
                images = AfterRepairImage.objects.filter(parent=repairObj)
                for image in images:
                    delete_file(bucket=bucket_name, object_name=image.s3_object_name)
                    image.delete()

            img_type = "After_Repair_Images"
            if add == "True":
                count = AfterRepairImage.objects.filter(parent=repairObj).count()
            else:
                count = 0

            for file in file_list:
                count = count + 1
                serial_no = str(count).zfill(3)
                extension = os.path.splitext(file.name)[1]

                filename = (
                    f"A_{container_no}_{repairObj.number}_{serial_no}.{extension}"
                )
                if location == "Ludhiana":
                    filename = f"A_{container_no}_{surveyObj.estimate_number}_{serial_no}.{extension}"

                object_name = f"MNR/{location}/{site_type}/{site}/{img_type}_{container_no}_{processId}/{filename}"
                try:
                    if not os.path.exists(os.path.join(BASE_DIR, "temp/MNR/Repair/")):
                        os.makedirs(os.path.join(BASE_DIR, "temp/MNR/Repair/"))
                    temp_file_path = os.path.join(BASE_DIR, f"temp/MNR/Repair/{file}")
                    with open(temp_file_path, "wb") as temp:
                        temp.write(file.read())
                    upload_file(temp_file_path, bucket_name, object_name, True)
                    repairObj.is_img_uploaded = True
                    repairObj.save()

                    if repairObj.parent.parent.depot:
                        repairObj.parent.parent.depot.post_mnr_img_uploaded = True
                        repairObj.parent.parent.depot.save(
                            update_fields=["post_mnr_img_uploaded"]
                        )
                    else:
                        repairObj.parent.parent.non_depot.post_mnr_img_uploaded = True
                        repairObj.parent.parent.non_depot.save(
                            update_fields=["post_mnr_img_uploaded"]
                        )
                    AfterRepairImage(
                        parent=repairObj,
                        s3_object_name=object_name,
                        s3_file_name=filename,
                    ).save()

                    os.remove(temp_file_path)
                except:
                    os.remove(temp_file_path)
                    continue
            return True

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def download_mnr_repair_img_to_s3(process, process_id, image_id_list):
    try:
        bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
        file_name = None
        object_name = None
        surveyObj = Survey.getById(process_id)
        container_no = None
        temp_file_path_list = []
        if process == "Survey":
            if len(image_id_list) == 0:
                images = BeforeRepairImage.objects.filter(parent=surveyObj)
                for image in images:
                    file_name = image.s3_file_name
                    container_no = file_name.split("_")[1]
                    object_name = image.s3_object_name
                    temp_file_path = download_file(
                        bucket=bucket_name, object_name=object_name, file_name=file_name
                    )
                    temp_file_path_list.append(temp_file_path)
            else:
                images = BeforeRepairImage.objects.filter(
                    parent=surveyObj, pk__in=image_id_list
                )
                for image in images:
                    file_name = image.s3_file_name
                    container_no = file_name.split("_")[1]
                    object_name = image.s3_object_name
                    temp_file_path = download_file(
                        bucket=bucket_name, object_name=object_name, file_name=file_name
                    )
                    temp_file_path_list.append(temp_file_path)
        else:
            estimateObj = Estimate.getByParentId(surveyObj.pk)
            repairObj = Repair.objects.get(parent=estimateObj)
            if len(image_id_list) == 0:
                images = AfterRepairImage.objects.filter(parent=repairObj)
                for image in images:
                    file_name = image.s3_file_name
                    container_no = file_name.split("_")[1]
                    object_name = image.s3_object_name
                    temp_file_path = download_file(
                        bucket=bucket_name, object_name=object_name, file_name=file_name
                    )
                    temp_file_path_list.append(temp_file_path)
            else:
                images = AfterRepairImage.objects.filter(
                    parent=repairObj, pk__in=image_id_list
                )
                for image in images:
                    file_name = image.s3_file_name
                    container_no = file_name.split("_")[1]
                    object_name = image.s3_object_name
                    temp_file_path = download_file(
                        bucket=bucket_name, object_name=object_name, file_name=file_name
                    )
                    temp_file_path_list.append(temp_file_path)

        if not os.path.exists(os.path.join(BASE_DIR, f"temp/zip/MNR/")):
            os.makedirs(os.path.join(BASE_DIR, f"temp/zip/MNR/"))
        temp_zip_file_path = os.path.join(
            BASE_DIR, f"temp/zip/MNR/{process}_{container_no}.zip"
        )

        with zipfile.ZipFile(temp_zip_file_path, "w") as zipF:
            for file in temp_file_path_list:
                arcname = file.split(os.path.join(BASE_DIR, f"temp/"))[1]
                zipF.write(
                    file,
                    compress_type=zipfile.ZIP_DEFLATED,
                    arcname=arcname,
                )

        with open(temp_zip_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/zip")
            file_response["Content-Disposition"] = (
                f'attachment; filename="{process}_{container_no}.zip"'
            )

            for path in temp_file_path_list:
                os.remove(path)
            os.remove(temp_zip_file_path)
            return file_response
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getTariffData(client, location, site):
    try:
        parent = TariffMaster.objects.get(
            client=client,
            location__name=location,
            site__name=site,
        )
        labour_rate = str(parent.labour_rate)
        queryset = TariffMasterLine.objects.filter(parent=parent)
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getSurveyLineData(parent, line):
    tariff_code = None
    main_component = None
    component_code = None
    component_description = None
    location_code = None
    location_description = None
    specific_location_code = None
    specific_location_description = None
    damage_code = None
    damage_description = None
    material_code = None
    material_description = None
    repair_code = None
    repair_description = None
    unit = None
    measurement = None
    length_and_width = None
    quantity = None
    labour_hrs_tariff = None
    wash_clean_tariff = None
    material_tariff = None
    labour_cost = None
    material_cost = None
    total_cost = None
    tariff_field_enabled = None
    remarks = None

    if TariffMasterLine.objects.filter(
        parent=parent,
        main_component=line["main_component"],
        component_code=line["component_code"],
        location_code=line["location_code"],
        damage_code=line["damage_code"],
        material_code=line["material_code"],
        repair_code=line["repair_code"],
        unit=line["unit"],
        measurement=line["measurement"],
        length_and_width=line["length_and_width"],
    ).exists():
        tariff_line = list(
            TariffMasterLine.objects.filter(
                parent=parent,
                main_component=line["main_component"],
                component_code=line["component_code"],
                location_code=line["location_code"],
                damage_code=line["damage_code"],
                material_code=line["material_code"],
                repair_code=line["repair_code"],
                unit=line["unit"],
                measurement=line["measurement"],
                length_and_width=line["length_and_width"],
            )
        )[0]
        if not float(tariff_line.total_cost) == str(float(0)):
            specific_location_code = line["specific_location_code"]
            specific_location_description = line["specific_location_description"]
            remarks = line.get("remarks", None)

            if tariff_line.tariff_code is None:
                tariff_code = ""
            else:
                tariff_code = tariff_line.tariff_code

            if tariff_line.main_component is None:
                main_component = ""
            else:
                main_component = tariff_line.main_component

            if tariff_line.component_code is None:
                component_code = ""
            else:
                component_code = tariff_line.component_code

            if tariff_line.component_description is None:
                component_description = ""
            else:
                component_description = tariff_line.component_description

            if tariff_line.location_code is None:
                location_code = ""
            else:
                location_code = tariff_line.location_code

            if tariff_line.location_description is None:
                location_description = ""
            else:
                location_description = tariff_line.location_description

            if tariff_line.damage_code is None:
                damage_code = ""
            else:
                damage_code = tariff_line.damage_code

            if tariff_line.damage_description is None:
                damage_description = ""
            else:
                damage_description = tariff_line.damage_description

            if tariff_line.material_code is None:
                material_code = ""
            else:
                material_code = tariff_line.material_code

            if tariff_line.material_description is None:
                material_description = ""
            else:
                material_description = tariff_line.material_description

            if tariff_line.repair_code is None:
                repair_code = ""
            else:
                repair_code = tariff_line.repair_code

            if tariff_line.repair_description is None:
                repair_description = ""
            else:
                repair_description = tariff_line.repair_description

            if tariff_line.unit is None:
                unit = ""
            else:
                unit = tariff_line.unit

            if tariff_line.measurement is None:
                measurement = ""
            else:
                measurement = tariff_line.measurement

            if tariff_line.length_and_width is None:
                length_and_width = ""
            else:
                length_and_width = tariff_line.length_and_width

            quantity = int(line["quantity"])

            if tariff_line.labour_hrs_tariff is None:
                labour_hrs_tariff = str(float(0))
            else:
                labour_hrs_tariff = tariff_line.labour_hrs_tariff

            if tariff_line.wash_clean_tariff is None:
                wash_clean_tariff = str(float(0))
            else:
                wash_clean_tariff = tariff_line.wash_clean_tariff

            if tariff_line.material_tariff is None:
                material_tariff = str(float(0))
            else:
                material_tariff = tariff_line.material_tariff

            if tariff_line.labour_cost is None:
                labour_cost = str(float(0))
            else:
                labour_cost = round(float(tariff_line.labour_cost) * quantity, 2)

            if tariff_line.material_cost is None:
                material_cost = str(float(0))
            else:
                material_cost = round(float(tariff_line.material_cost) * quantity, 2)

            total_cost = labour_cost + material_cost

            tariff_field_enabled = False
        else:
            specific_location_code = line["specific_location_code"]
            specific_location_description = line["specific_location_description"]
            remarks = line.get("remarks", None)

            if tariff_line.tariff_code is None:
                tariff_code = ""
            else:
                tariff_code = tariff_line.tariff_code

            if tariff_line.main_component is None:
                main_component = ""
            else:
                main_component = tariff_line.main_component

            if tariff_line.component_code is None:
                component_code = ""
            else:
                component_code = tariff_line.component_code

            if tariff_line.component_description is None:
                component_description = ""
            else:
                component_description = tariff_line.component_description

            if tariff_line.location_code is None:
                location_code = ""
            else:
                location_code = tariff_line.location_code

            if tariff_line.location_description is None:
                location_description = ""
            else:
                location_description = tariff_line.location_description

            if tariff_line.damage_code is None:
                damage_code = ""
            else:
                damage_code = tariff_line.damage_code

            if tariff_line.damage_description is None:
                damage_description = ""
            else:
                damage_description = tariff_line.damage_description

            if tariff_line.material_code is None:
                material_code = ""
            else:
                material_code = tariff_line.material_code

            if tariff_line.material_description is None:
                material_description = ""
            else:
                material_description = tariff_line.material_description

            if tariff_line.repair_code is None:
                repair_code = ""
            else:
                repair_code = tariff_line.repair_code

            if tariff_line.repair_description is None:
                repair_description = ""
            else:
                repair_description = tariff_line.repair_description

            if tariff_line.unit is None:
                unit = ""
            else:
                unit = tariff_line.unit

            if tariff_line.measurement is None:
                measurement = ""
            else:
                measurement = tariff_line.measurement

            if tariff_line.length_and_width is None:
                length_and_width = ""
            else:
                length_and_width = tariff_line.length_and_width
            quantity = int(line["quantity"])
            labour_hrs_tariff = str(float(0))
            wash_clean_tariff = str(float(0))
            material_tariff = str(float(0))
            labour_cost = str(float(0))
            material_cost = str(float(0))
            total_cost = str(float(0))
            tariff_field_enabled = True
        data = {
            "tariff_code": tariff_code,
            "main_component": main_component,
            "component_code": component_code,
            "component_description": component_description,
            "location_code": location_code,
            "location_description": location_description,
            "specific_location_code": specific_location_code,
            "specific_location_description": specific_location_description,
            "damage_code": damage_code,
            "damage_description": damage_description,
            "material_code": material_code,
            "material_description": material_description,
            "repair_code": repair_code,
            "repair_description": repair_description,
            "unit": unit,
            "measurement": measurement,
            "length_and_width": length_and_width,
            "quantity": quantity,
            "labour_hrs_tariff": labour_hrs_tariff,
            "wash_clean_tariff": wash_clean_tariff,
            "material_tariff": material_tariff,
            "labour_cost": labour_cost,
            "material_cost": material_cost,
            "total_cost": total_cost,
            "tariff_field_enabled": tariff_field_enabled,
            "remarks": remarks,
        }
        return data

    elif TariffMasterLine.objects.filter(
        parent=parent,
        main_component=line["main_component"],
        component_code=line["component_code"],
        location_code=line["location_code"],
        damage_code=line["damage_code"],
        material_code=line["material_code"],
        repair_code=line["repair_code"],
        unit=line["unit"],
    ).exists():
        tariff_line = list(
            TariffMasterLine.objects.filter(
                parent=parent,
                main_component=line["main_component"],
                component_code=line["component_code"],
                location_code=line["location_code"],
                damage_code=line["damage_code"],
                material_code=line["material_code"],
                repair_code=line["repair_code"],
                unit=line["unit"],
            )
        )[0]

        specific_location_code = line["specific_location_code"]
        specific_location_description = line["specific_location_description"]
        remarks = line.get("remarks", None)

        if tariff_line.tariff_code is None:
            tariff_code = ""
        else:
            tariff_code = tariff_line.tariff_code

        if tariff_line.main_component is None:
            main_component = ""
        else:
            main_component = tariff_line.main_component

        if tariff_line.component_code is None:
            component_code = ""
        else:
            component_code = tariff_line.component_code

        if tariff_line.component_description is None:
            component_description = ""
        else:
            component_description = tariff_line.component_description

        if tariff_line.location_code is None:
            location_code = ""
        else:
            location_code = tariff_line.location_code

        if tariff_line.location_description is None:
            location_description = ""
        else:
            location_description = tariff_line.location_description

        if tariff_line.damage_code is None:
            damage_code = ""
        else:
            damage_code = tariff_line.damage_code

        if tariff_line.damage_description is None:
            damage_description = ""
        else:
            damage_description = tariff_line.damage_description

        if tariff_line.material_code is None:
            material_code = ""
        else:
            material_code = tariff_line.material_code

        if tariff_line.material_description is None:
            material_description = ""
        else:
            material_description = tariff_line.material_description

        if tariff_line.repair_code is None:
            repair_code = ""
        else:
            repair_code = tariff_line.repair_code

        if tariff_line.repair_description is None:
            repair_description = ""
        else:
            repair_description = tariff_line.repair_description

        if tariff_line.unit is None:
            unit = ""
        else:
            unit = tariff_line.unit
        measurement = line["measurement"]
        length_and_width = line["length_and_width"]
        quantity = int(line["quantity"])
        labour_hrs_tariff = str(float(0))
        wash_clean_tariff = str(float(0))
        material_tariff = str(float(0))
        labour_cost = str(float(0))
        material_cost = str(float(0))
        total_cost = str(float(0))
        tariff_field_enabled = True
        data = {
            "tariff_code": tariff_code,
            "main_component": main_component,
            "component_code": component_code,
            "component_description": component_description,
            "location_code": location_code,
            "location_description": location_description,
            "specific_location_code": specific_location_code,
            "specific_location_description": specific_location_description,
            "damage_code": damage_code,
            "damage_description": damage_description,
            "material_code": material_code,
            "material_description": material_description,
            "repair_code": repair_code,
            "repair_description": repair_description,
            "unit": unit,
            "measurement": measurement,
            "length_and_width": length_and_width,
            "quantity": quantity,
            "labour_hrs_tariff": labour_hrs_tariff,
            "wash_clean_tariff": wash_clean_tariff,
            "material_tariff": material_tariff,
            "labour_cost": labour_cost,
            "material_cost": material_cost,
            "total_cost": total_cost,
            "tariff_field_enabled": tariff_field_enabled,
            "remarks": remarks,
        }
        return data
    else:
        data = {
            "tariff_code": None,
            "main_component": line["main_component"],
            "component_code": line["component_code"],
            "component_description": None,
            "location_code": line["location_code"],
            "location_description": None,
            "specific_location_code": line["specific_location_code"],
            "specific_location_description": None,
            "damage_code": line["damage_code"],
            "damage_description": None,
            "material_code": line["material_code"],
            "material_description": None,
            "repair_code": line["repair_code"],
            "repair_description": None,
            "unit": line["unit"],
            "measurement": line["measurement"],
            "length_and_width": line["length_and_width"],
            "quantity": line["quantity"],
            "labour_hrs_tariff": str(float(0)),
            "wash_clean_tariff": str(float(0)),
            "material_tariff": str(float(0)),
            "labour_cost": str(float(0)),
            "material_cost": str(float(0)),
            "total_cost": str(float(0)),
            "tariff_field_enabled": True,
            "remarks": None,
        }
        return data


def getTariffExcelRowData(data_object):
    try:
        data = {}
        tariff_code = "_"
        main_component = "_"
        component_code = "_"
        component_description = "_"
        location_code = "_"
        location_description = "_"
        damage_code = "_"
        damage_description = "_"
        material_code = "_"
        material_description = "_"
        repair_code = "_"
        repair_description = "_"
        unit = "_"
        measurement = "_"
        length_and_width = "_"
        quantity = "0"
        labour_hrs_tariff = "0"
        wash_clean_tariff = "0"
        material_tariff = "0"

        if data_object.tariff_code is not None:
            tariff_code = data_object.tariff_code
        data["tariff_code"] = tariff_code

        if data_object.main_component is not None:
            main_component = data_object.main_component
        data["main_component"] = main_component

        if data_object.component_code is not None:
            component_code = str(data_object.component_code).split("_")[0]
        data["component_code"] = component_code

        if data_object.component_description is not None:
            component_description = data_object.component_description
        data["component_description"] = component_description

        if data_object.location_code is not None:
            location_code = str(data_object.location_code).split("_")[0]
        data["location_code"] = location_code

        if data_object.location_description is not None:
            location_description = data_object.location_description
        data["location_description"] = location_description

        if data_object.damage_code is not None:
            damage_code = str(data_object.damage_code).split("_")[0]
        data["damage_code"] = damage_code

        if data_object.damage_description is not None:
            damage_description = data_object.damage_description
        data["damage_description"] = damage_description

        if data_object.material_code is not None:
            material_code = str(data_object.material_code).split("_")[0]
        data["material_code"] = material_code

        if data_object.material_description is not None:
            material_description = data_object.material_description
        data["material_description"] = material_description

        if data_object.repair_code is not None:
            repair_code = str(data_object.repair_code).split("_")[0]
        data["repair_code"] = repair_code

        if data_object.repair_description is not None:
            repair_description = data_object.repair_description
        data["repair_description"] = repair_description

        if data_object.unit is not None:
            unit = data_object.unit
        data["unit"] = unit

        if data_object.measurement is not None:
            measurement = data_object.measurement
        data["measurement"] = measurement

        if data_object.length_and_width is not None:
            length_and_width = data_object.length_and_width
        data["length_and_width"] = length_and_width

        if data_object.quantity is not None:
            quantity = str(data_object.quantity)
        data["quantity"] = quantity

        if data_object.labour_hrs_tariff is not None:
            labour_hrs_tariff = str(data_object.labour_hrs_tariff)
        data["labour_hrs_tariff"] = labour_hrs_tariff

        if data_object.wash_clean_tariff is not None:
            wash_clean_tariff = str(data_object.wash_clean_tariff)
        data["wash_clean_tariff"] = wash_clean_tariff

        if data_object.material_tariff is not None:
            material_tariff = str(data_object.material_tariff)
        data["material_tariff"] = material_tariff

        return data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getTariffExcelData(pk):
    try:
        parent = TariffMaster.objects.get(pk=pk)
        queryset = TariffMasterLine.objects.filter(parent=parent)
        count = 0
        data = []
        for each in queryset:
            count += 1
            each_data = getTariffExcelRowData(each)
            each_data["sr_no"] = count
            data.append(each_data)
        sr_no = [each.get("sr_no") for each in data]
        tariff_code = [each.get("tariff_code") for each in data]
        main_component = [each.get("main_component") for each in data]
        component_code = [each.get("component_code") for each in data]
        component_description = [each.get("component_description") for each in data]
        location_code = [each.get("location_code") for each in data]
        location_description = [each.get("location_description") for each in data]
        damage_code = [each.get("damage_code") for each in data]
        damage_description = [each.get("damage_description") for each in data]
        material_code = [each.get("material_code") for each in data]
        material_description = [each.get("material_description") for each in data]
        repair_code = [each.get("repair_code") for each in data]
        repair_description = [each.get("repair_description") for each in data]
        unit = [each.get("unit") for each in data]
        measurement = [each.get("measurement") for each in data]
        length_and_width = [each.get("length_and_width") for each in data]
        quantity = [each.get("quantity") for each in data]
        labour_hrs_tariff = [each.get("labour_hrs_tariff") for each in data]
        wash_clean_tariff = [each.get("wash_clean_tariff") for each in data]
        material_tariff = [each.get("material_tariff") for each in data]
        df_data = [
            [
                tariff_code[i],
                main_component[i],
                component_code[i],
                component_description[i],
                location_code[i],
                location_description[i],
                damage_code[i],
                damage_description[i],
                material_code[i],
                material_description[i],
                repair_code[i],
                repair_description[i],
                unit[i],
                measurement[i],
                length_and_width[i],
                quantity[i],
                labour_hrs_tariff[i],
                wash_clean_tariff[i],
                material_tariff[i],
            ]
            for i in range(len(sr_no))
        ]

        if len(df_data) == 0:
            df_data.append(["" for i in range(0, 18)])
        main_response = {
            "client": parent.client,
            "labour_rate": parent.labour_rate,
            "tariff_lines": df_data,
        }
        return main_response
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        df_data = [["" for i in range(0, 18)]]
        main_response = {"client": "", "labour_rate": "", "tariff_lines": df_data}
        return main_response


def make_tariff_excel(data):
    try:
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/tariff_{data['client']}_{date}{time}.xlsx"
        )
        workbook = xlsxwriter.Workbook(temp_file_path)
        sheet = workbook.add_worksheet("tariff")
        sheet.write("D1", "Labour Rate")
        sheet.write("E1", f"{data['labour_rate']}")
        sheet.add_table(
            f"A2:S{2 + len(data['tariff_lines'])}",
            {
                "data": data["tariff_lines"],
                "columns": [
                    {"header": "TARIFF CODE"},
                    {"header": "MAIN COMPONENT"},
                    {"header": "COMPONENT CODE"},
                    {"header": "COMPONENT DESCRIPTION"},
                    {"header": "LOCATION CODE"},
                    {"header": "LOCATION DESCRIPTION"},
                    {"header": "DAMAGE CODE"},
                    {"header": "DAMAGE DESCRIPTION"},
                    {"header": "MATERIAL CODE"},
                    {"header": "MATERIAL DESCRIPTION"},
                    {"header": "REPAIR CODE"},
                    {"header": "REPAIR DESCRIPTION"},
                    {"header": "UNIT CODE"},
                    {"header": "UNIT DESCRIPTION"},
                    {"header": "L/W"},
                    {"header": "QTY"},
                    {"header": "Labour Hours Tarrif"},
                    {"header": "Wash/Clean Tarrif"},
                    {"header": "Material Rate Tarrif"},
                ],
            },
        )
        workbook.close()
        return temp_file_path
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_length_width_value_string(string):
    if "*" in string:
        return string.replace("*", " x ")
    else:
        return f"{string} x 0"


def getSurveyEntryFormat(stock_id, location, site):
    try:
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getEstimateEntryFormat(survey_id, location, site):
    try:
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
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
                    else get_length_width_value_string(line.length_and_width)
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
                    else get_length_width_value_string(line.length_and_width)
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getApprovalEntryFormat(estimate_id, location, site):
    try:
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getRepairEntryFormat(estimate_id, location, site):
    try:
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getSurveyData(survey_data, location, site):
    try:
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
                    else get_length_width_value_string(line.length_and_width)
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
                    else get_length_width_value_string(line.length_and_width)
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getEstimateData(estimate_data, survey_id, location, site):
    try:
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
                    else get_length_width_value_string(line.length_and_width)
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
                    else get_length_width_value_string(line.length_and_width)
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def calculateEstimate(data):
    try:
        line_data = None
        if not len(data["damage_lines"]) == 0:
            line_data = data["damage_lines"][0]
        else:
            line_data = data["cleaning_lines"][0]
        survey_line_data = SurveyLine.objects.get(pk=line_data["pk"])
        survey = survey_line_data.parent
        labour_rate = float(survey.labour_rate)

        for each in data["damage_lines"]:
            if each["tariff_field_enabled"] == "True":
                eachObj = SurveyLine.objects.get(pk=each["pk"])
                quantity = int(each["quantity"])
                labour_hrs_tariff = float(each["labour_hrs_tariff"])
                material_tariff = float(each["material_tariff"])
                wash_clean_tariff = float(each["wash_clean_tariff"])
                labour_cost_raw = labour_rate * labour_hrs_tariff * quantity
                labour_cost = round(labour_cost_raw, 2)
                material_cost_raw = material_tariff * quantity
                material_cost = round(material_cost_raw, 2)
                total_cost = float(labour_cost) + float(material_cost)
                eachObj.quantity = quantity
                eachObj.labour_hrs_tariff = labour_hrs_tariff
                eachObj.material_tariff = material_tariff
                eachObj.wash_clean_tariff = wash_clean_tariff
                eachObj.labour_cost = labour_cost
                eachObj.material_cost = material_cost
                eachObj.total_cost = total_cost
                eachObj.save()

        for each in data["cleaning_lines"]:
            if each["tariff_field_enabled"] == "True":
                eachObj = SurveyLine.objects.get(pk=each["pk"])
                quantity = int(each["quantity"])
                labour_hrs_tariff = float(each["labour_hrs_tariff"])
                material_tariff = float(each["material_tariff"])
                wash_clean_tariff = float(each["wash_clean_tariff"])
                labour_cost = float(0)
                material_cost_raw = wash_clean_tariff * quantity
                material_cost = round(material_cost_raw, 2)
                total_cost = float(material_cost)
                eachObj.quantity = quantity
                eachObj.labour_hrs_tariff = labour_hrs_tariff
                eachObj.material_tariff = material_tariff
                eachObj.wash_clean_tariff = wash_clean_tariff
                eachObj.labour_cost = labour_cost
                eachObj.material_cost = material_cost
                eachObj.total_cost = total_cost
                eachObj.save()

        amount_without_tax = sum(
            [
                float(line.total_cost)
                for line in SurveyLine.objects.filter(parent=survey).iterator()
            ]
        )

        tax = round(amount_without_tax * 0, 2)

        amount = round(amount_without_tax, 2) + tax

        main_data = {"amount": str(round(amount, 2))}
        damage_lines = [
            {
                "pk": line.pk,
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
                    else get_length_width_value_string(line.length_and_width)
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
            }
            for line in SurveyLine.objects.filter(parent=survey).iterator()
            if str(float(line.wash_clean_tariff)) == str(float(0))
        ]
        cleaning_lines = [
            {
                "pk": line.pk,
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
                    else get_length_width_value_string(line.length_and_width)
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
            }
            for line in SurveyLine.objects.filter(parent=survey).iterator()
            if not str(float(line.wash_clean_tariff)) == str(float(0))
        ]
        main_data["survey_lines"] = {
            "damage_lines": damage_lines,
            "cleaning_lines": cleaning_lines,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getApprovalData(approval_data, estimate_id, location, site):
    try:

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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getRepairData(repair_data, estimate_id, location, site):
    try:
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
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def getCleanLW(string):
    if "*" in str(string):
        string_list = string.split("*")
        l = str(int(float(string_list[0])))
        w = str(int(float(string_list[1])))
        return f"{l}*{w}"
    else:
        return str(int(string))


def extract_tariff_excel_data(input_excel):
    try:
        ps = openpyxl.load_workbook(input_excel, data_only=True)
        sheet = ps["tariff"]
        # Data Extraction
        # tariff data
        labour_rate = sheet["E1"].value

        tariff_code_raw1 = [
            sheet["A" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        tariff_code_raw2 = [each for each in tariff_code_raw1 if not each is None]
        tariff_code = [None if each == "_" else each for each in tariff_code_raw2]

        main_component_raw1 = [
            sheet["B" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        main_component_raw2 = [each for each in main_component_raw1 if not each is None]
        main_component = [None if each == "_" else each for each in main_component_raw2]

        component_code_raw1 = [
            sheet["C" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        component_code_raw2 = [each for each in component_code_raw1 if not each is None]
        component_code = [None if each == "_" else each for each in component_code_raw2]

        component_description_raw1 = [
            sheet["D" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        component_description_raw2 = [
            each for each in component_description_raw1 if not each is None
        ]
        component_description = [
            None if each == "_" else each for each in component_description_raw2
        ]

        location_code_raw1 = [
            sheet["E" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        location_code_raw2 = [each for each in location_code_raw1 if not each is None]
        location_code = [None if each == "_" else each for each in location_code_raw2]

        location_description_raw1 = [
            sheet["F" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        location_description_raw2 = [
            each for each in location_description_raw1 if not each is None
        ]
        location_description = [
            None if each == "_" else each for each in location_description_raw2
        ]

        damage_code_raw1 = [
            sheet["G" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        damage_code_raw2 = [each for each in damage_code_raw1 if not each is None]
        damage_code = [None if each == "_" else each for each in damage_code_raw2]

        damage_description_raw1 = [
            sheet["H" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        damage_description_raw2 = [
            each for each in damage_description_raw1 if not each is None
        ]
        damage_description = [
            None if each == "_" else each for each in damage_description_raw2
        ]

        material_code_raw1 = [
            sheet["I" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        material_code_raw2 = [each for each in material_code_raw1 if not each is None]
        material_code = [None if each == "_" else each for each in material_code_raw2]

        material_description_raw1 = [
            sheet["J" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        material_description_raw2 = [
            each for each in material_description_raw1 if not each is None
        ]
        material_description = [
            None if each == "_" else each for each in material_description_raw2
        ]

        repair_code_raw1 = [
            sheet["K" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        repair_code_raw2 = [each for each in repair_code_raw1 if not each is None]
        repair_code = [None if each == "_" else each for each in repair_code_raw2]

        repair_description_raw1 = [
            sheet["L" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        repair_description_raw2 = [
            each for each in repair_description_raw1 if not each is None
        ]
        repair_description = [
            None if each == "_" else each for each in repair_description_raw2
        ]

        unit_code_raw1 = [
            sheet["M" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        unit_code_raw2 = [each for each in unit_code_raw1 if not each is None]
        unit_code = [None if each == "_" else each for each in unit_code_raw2]

        unit_description_raw1 = [
            sheet["N" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        unit_description_raw2 = [
            each for each in unit_description_raw1 if not each is None
        ]
        unit_description = [
            None if each == "_" else each for each in unit_description_raw2
        ]

        length_width_raw1 = [
            sheet["O" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        length_width_raw2 = [each for each in length_width_raw1 if not each is None]
        length_width_1 = [None if each == "_" else each for each in length_width_raw2]

        quantity_raw1 = [
            sheet["P" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        quantity_raw2 = [each for each in quantity_raw1 if not each is None]
        quantity = [0 if each == "_" else each for each in quantity_raw2]

        labour_hrs_tariff_raw1 = [
            sheet["Q" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        labour_hrs_tariff_raw2 = [
            each for each in labour_hrs_tariff_raw1 if not each is None
        ]
        labour_hrs_tariff = [
            0 if each == "_" else each for each in labour_hrs_tariff_raw2
        ]

        wash_clean_tariff_raw1 = [
            sheet["R" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        wash_clean_tariff_raw2 = [
            each for each in wash_clean_tariff_raw1 if not each is None
        ]
        wash_clean_tariff = [
            0 if each == "_" else each for each in wash_clean_tariff_raw2
        ]

        material_rate_tariff_raw1 = [
            sheet["S" + str(row)].value for row in range(2, sheet.max_row + 1)
        ]
        material_rate_tariff_raw2 = [
            each for each in material_rate_tariff_raw1 if not each is None
        ]
        material_rate_tariff = [
            0 if each == "_" else each for each in material_rate_tariff_raw2
        ]

        ps.close()

        # Checking excel data if valid
        popped = [
            tariff_code.pop(0),
            main_component.pop(0),
            component_code.pop(0),
            component_description.pop(0),
            location_code.pop(0),
            location_description.pop(0),
            damage_code.pop(0),
            damage_description.pop(0),
            material_code.pop(0),
            material_description.pop(0),
            repair_code.pop(0),
            repair_description.pop(0),
            unit_code.pop(0),
            unit_description.pop(0),
            length_width_1.pop(0),
            quantity.pop(0),
            labour_hrs_tariff.pop(0),
            wash_clean_tariff.pop(0),
            material_rate_tariff.pop(0),
        ]

        headers = [
            "TARIFF CODE",
            "MAIN COMPONENT",
            "COMPONENT CODE",
            "COMPONENT DESCRIPTION",
            "LOCATION CODE",
            "LOCATION DESCRIPTION",
            "DAMAGE CODE",
            "DAMAGE DESCRIPTION",
            "MATERIAL CODE",
            "MATERIAL DESCRIPTION",
            "REPAIR CODE",
            "REPAIR DESCRIPTION",
            "UNIT CODE",
            "UNIT DESCRIPTION",
            "L/W",
            "QTY",
            "Labour Hours Tarrif",
            "Wash/Clean Tarrif",
            "Material Rate Tarrif",
        ]

        if not popped == headers:
            return "Header Not Found"
        # Data Gatheration

        length_width = [
            None if each == "_" else getCleanLW(each) for each in length_width_1
        ]

        helper_tariff_code = []
        helper_main_component = []
        helper_component_code = []
        helper_component_description = []
        helper_location_code = []
        helper_location_description = []
        helper_damage_code = []
        helper_damage_description = []
        helper_material_code = []
        helper_material_description = []
        helper_repair_code = []
        helper_repair_description = []
        helper_unit_code = []
        helper_unit_description = []
        helper_length_width = []
        helper_quantity = []
        helper_labour_hrs_tariff = []
        helper_wash_clean_tariff = []
        helper_material_rate_tariff = []

        for i in range(len(main_component)):
            if len(damage_code[i].split("/")) > 1:
                damage_code_list = damage_code[i].split("/")
                damage_description_list = damage_description[i].split("/")
                for j in range(len(damage_code_list)):
                    helper_tariff_code.append(tariff_code[i])
                    helper_main_component.append(main_component[i])
                    helper_component_code.append(component_code[i])
                    helper_component_description.append(component_description[i])
                    helper_location_code.append(location_code[i])
                    helper_location_description.append(location_description[i])
                    helper_damage_code.append(damage_code_list[j])
                    helper_damage_description.append(damage_description_list[j])
                    helper_material_code.append(material_code[i])
                    helper_material_description.append(material_description[i])
                    helper_repair_code.append(repair_code[i])
                    helper_repair_description.append(repair_description[i])
                    helper_unit_code.append(unit_code[i])
                    helper_unit_description.append(unit_description[i])
                    helper_length_width.append(length_width[i])
                    helper_quantity.append(quantity[i])
                    helper_labour_hrs_tariff.append(labour_hrs_tariff[i])
                    helper_wash_clean_tariff.append(wash_clean_tariff[i])
                    helper_material_rate_tariff.append(material_rate_tariff[i])
            else:
                helper_tariff_code.append(tariff_code[i])
                helper_main_component.append(main_component[i])
                helper_component_code.append(component_code[i])
                helper_component_description.append(component_description[i])
                helper_location_code.append(location_code[i])
                helper_location_description.append(location_description[i])
                helper_damage_code.append(damage_code[i])
                helper_damage_description.append(damage_description[i])
                helper_material_code.append(material_code[i])
                helper_material_description.append(material_description[i])
                helper_repair_code.append(repair_code[i])
                helper_repair_description.append(repair_description[i])
                helper_unit_code.append(unit_code[i])
                helper_unit_description.append(unit_description[i])
                helper_length_width.append(length_width[i])
                helper_quantity.append(quantity[i])
                helper_labour_hrs_tariff.append(labour_hrs_tariff[i])
                helper_wash_clean_tariff.append(wash_clean_tariff[i])
                helper_material_rate_tariff.append(material_rate_tariff[i])

        tariff_code = helper_tariff_code
        main_component = helper_main_component
        component_code = helper_component_code
        component_description = helper_component_description
        location_code = helper_location_code
        location_description = helper_location_description
        damage_code = helper_damage_code
        damage_description = helper_damage_description
        material_code = helper_material_code
        material_description = helper_material_description
        repair_code = helper_repair_code
        repair_description = helper_repair_description
        unit_code = helper_unit_code
        unit_description = helper_unit_description
        length_width = helper_length_width
        quantity = helper_quantity
        labour_hrs_tariff = helper_labour_hrs_tariff
        wash_clean_tariff = helper_wash_clean_tariff
        material_rate_tariff = helper_material_rate_tariff

        component = []
        component_dict = {}
        component_new_element = None
        for i in range(len(main_component)):
            if component_description[i] in component:
                component_code[i] = component_dict[component_description[i]]
            else:
                component.append(component_description[i])
                component_new_element = (
                    f"{component_code[i]}_{random.randint(1000, 9999)}"
                )
                component_dict[component_description[i]] = component_new_element
                component_code[i] = component_new_element

        location = []
        location_dict = {}
        location_new_element = None
        for i in range(len(main_component)):
            if location_description[i] in location:
                location_code[i] = location_dict[location_description[i]]
            else:
                location.append(location_description[i])
                location_new_element = (
                    f"{location_code[i]}_{random.randint(1000, 9999)}"
                )
                location_dict[location_description[i]] = location_new_element
                location_code[i] = location_new_element

        damage = []
        damage_dict = {}
        damage_new_element = None
        for i in range(len(main_component)):
            if damage_description[i] in damage:
                damage_code[i] = damage_dict[damage_description[i]]
            else:
                damage.append(damage_description[i])
                damage_new_element = f"{damage_code[i]}_{random.randint(1000, 9999)}"
                damage_dict[damage_description[i]] = damage_new_element
                damage_code[i] = damage_new_element

        material = []
        material_dict = {}
        material_new_element = None
        for i in range(len(main_component)):
            if material_description[i] in material:
                material_code[i] = material_dict[material_description[i]]
            else:
                material.append(material_description[i])
                material_new_element = (
                    f"{material_code[i]}_{random.randint(1000, 9999)}"
                )
                material_dict[material_description[i]] = material_new_element
                material_code[i] = material_new_element

        repair = []
        repair_dict = {}
        repair_new_element = None
        for i in range(len(main_component)):
            if repair_description[i] in repair:
                repair_code[i] = repair_dict[repair_description[i]]
            else:
                repair.append(repair_description[i])
                repair_new_element = f"{repair_code[i]}_{random.randint(1000, 9999)}"
                repair_dict[repair_description[i]] = repair_new_element
                repair_code[i] = repair_new_element

        main_data = [
            {
                "labour_rate": labour_rate,
                "tariff_code": tariff_code[i],
                "main_component": main_component[i],
                "component_code": component_code[i],
                "component_description": component_description[i],
                "location_code": location_code[i],
                "location_description": location_description[i],
                "damage_code": damage_code[i],
                "damage_description": damage_description[i],
                "material_code": material_code[i],
                "material_description": material_description[i],
                "repair_code": repair_code[i],
                "repair_description": repair_description[i],
                "unit_code": unit_code[i],
                "unit_description": unit_description[i],
                "length_width": length_width[i],
                "quantity": quantity[i],
                "labour_hrs_tariff": labour_hrs_tariff[i],
                "wash_clean_tariff": wash_clean_tariff[i],
                "material_rate_tariff": material_rate_tariff[i],
            }
            for i in range(len(main_component))
        ]
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_survey_line_length_width(string):
    if "*" in string:
        return string.split("*")[0], string.split("*")[1]
    else:
        return string, "0"


def set_estimate_status(location, site, approved, rejected, app_user):
    try:
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date()
        time = dt.time()

        if site.type == "DEPOT":
            for each in approved:
                try:
                    estimateObj = Estimate.objects.filter(
                        parent__depot__container__container_no=each["equipment_no"],
                        parent__depot__container__location=location,
                        parent__depot__container__site=site,
                    ).latest("pk")
                    each["edp_estimated_cost"] = str(float(estimateObj.current_amount))
                    approvalObj = Approval.getByParentId(estimateObj.pk)
                    if not approvalObj.is_locked:

                        response_upload = True
                        if site.name.upper() in [
                            "FARIDABAD",
                            "THIMMAPUR",
                            "MATRIX",
                            "TUTICORIN",
                        ]:
                            response_upload = False

                        approvalObj.updateWithApproved(
                            date=date,
                            time=time,
                            approved_date=date,
                            approved_time=time,
                            approval_amount=estimateObj.current_amount,
                            approved_amount=estimateObj.current_amount,
                            updated_by=app_user,
                            response_upload=response_upload,
                        )

                    if each["remark2"] == "POST REPAIR IMAGES REQUIRED":
                        stock = estimateObj.parent.depot
                        stock.estimate_status = "APPROVED & POST REPAIR IMAGES REQUIRED"
                        stock.save()
                except:
                    each["remark2"] = "Container Not Present in Current Site"

            for each in rejected:
                try:
                    remark = each["remark1"]
                    estimateObj = Estimate.objects.filter(
                        parent__depot__container__container_no=each["equipment_no"],
                        parent__depot__container__location=location,
                        parent__depot__container__site=site,
                    ).latest("pk")
                    each["edp_estimated_cost"] = str(float(estimateObj.current_amount))
                    approvalObj = Approval.getByParentId(estimateObj.pk)
                    if not approvalObj.is_locked:
                        approvalObj.updateWithDenied(
                            date=date,
                            time=time,
                            approval_amount=estimateObj.current_amount,
                            approved_amount=float(0),
                            updated_by=app_user,
                            denial_reason=remark,
                        )

                    if remark == "PARTIALLY":
                        if site.name.upper() in [
                            "FARIDABAD",
                            "THIMMAPUR",
                            "MATRIX",
                            "TUTICORIN",
                        ]:
                            set_partial_rejected_flag(
                                seq_data=each["seq_data"],
                                estimateObj=estimateObj,
                                site=site,
                            )
                        else:
                            set_partial_rejected_flag(
                                seq_data=each["seq_data"], estimateObj=estimateObj
                            )

                except:
                    each["remark2"] = "Container Not Present in Current Site"

        else:
            for each in approved:
                try:
                    estimateObj = Estimate.objects.filter(
                        parent__non_depot__container__container_no=each["equipment_no"],
                        parent__non_depot__container__location=location,
                        parent__non_depot__container__site=site,
                    ).latest("pk")
                    each["edp_estimated_cost"] = str(float(estimateObj.current_amount))
                    approvalObj = Approval.getByParentId(estimateObj.pk)
                    if not approvalObj.is_locked:
                        response_upload = True
                        if site.name.upper() in [
                            "FARIDABAD",
                            "THIMMAPUR",
                            "MATRIX",
                            "TUTICORIN",
                        ]:
                            response_upload = False
                        approvalObj.updateWithApproved(
                            date=date,
                            time=time,
                            approved_date=date,
                            approved_time=time,
                            approval_amount=estimateObj.current_amount,
                            approved_amount=estimateObj.current_amount,
                            updated_by=app_user,
                            response_upload=response_upload,
                        )

                    if each["remark2"] == "POST REPAIR IMAGES REQUIRED":
                        stock = estimateObj.parent.non_depot
                        stock.estimate_status = "APPROVED & POST REPAIR IMAGES REQUIRED"
                        stock.save()
                except:
                    each["remark2"] = "Container Not Present in Current Site"

            for each in rejected:
                try:
                    remark = each["remark1"]
                    estimateObj = Estimate.objects.filter(
                        parent__non_depot__container__container_no=each["equipment_no"],
                        parent__non_depot__container__location=location,
                        parent__non_depot__container__site=site,
                    ).latest("pk")
                    each["edp_estimated_cost"] = str(float(estimateObj.current_amount))
                    approvalObj = Approval.getByParentId(estimateObj.pk)
                    if not approvalObj.is_locked:
                        approvalObj.updateWithDenied(
                            date=date,
                            time=time,
                            approval_amount=estimateObj.current_amount,
                            approved_amount=float(0),
                            updated_by=app_user,
                            denial_reason=remark,
                        )
                    if remark == "PARTIALLY":
                        if site.name.upper() in [
                            "FARIDABAD",
                            "THIMMAPUR",
                            "MATRIX",
                            "TUTICORIN",
                        ]:
                            set_partial_rejected_flag(
                                seq_data=each["seq_data"],
                                estimateObj=estimateObj,
                                site=site,
                            )
                        else:
                            set_partial_rejected_flag(
                                seq_data=each["seq_data"], estimateObj=estimateObj
                            )

                except:
                    each["remark2"] = "Container Not Present in Current Site"

        return approved, rejected
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_generic_job_sheet_row_data(pk):
    try:
        repair_object = Repair.objects.get(pk=pk)
        if repair_object.parent.parent.depot is not None:
            container_header_data = (
                repair_object.parent.parent.depot.get_mnr_container_header_data()
            )
        else:
            container_header_data = (
                repair_object.parent.parent.non_depot.get_mnr_container_header_data()
            )
        main_data = {
            "container_no": container_header_data["container_no"],
            "size_type": container_header_data["size_type"],
            "line": container_header_data["line"],
            "aging": container_header_data["aging"],
        }
        survey_object = repair_object.parent.parent
        survey_line_objects = SurveyLine.objects.filter(
            parent=survey_object, is_rejected=False
        )
        survey_line_data = [
            {
                "main_component": (
                    "" if line.main_component is None else line.main_component
                ),
                "component_description": (
                    ""
                    if line.component_description is None
                    else line.component_description
                ),
                "location_description": (
                    ""
                    if line.location_description is None
                    else line.location_description
                ),
                "specific_location_description": (
                    ""
                    if line.specific_location_description is None
                    else line.specific_location_description
                ),
                "material_description": (
                    ""
                    if line.material_description is None
                    else line.material_description
                ),
                "damage_description": (
                    "" if line.damage_description is None else line.damage_description
                ),
                "repair_description": (
                    "" if line.repair_description is None else line.repair_description
                ),
                "unit": "" if line.unit is None else line.unit,
                "measurement": "" if line.measurement is None else line.measurement,
                "length_and_width": (
                    ""
                    if line.length_and_width is None
                    else get_length_width_value_string(line.length_and_width)
                ),
                "quantity": "" if line.quantity is None else str(line.quantity),
            }
            for line in survey_line_objects
        ]
        main_data["survey_lines"] = survey_line_data
        return main_data
    except Exception as e:
        return None


def get_generic_job_sheet_main_data(pk_list):
    try:
        main_data = []
        sr_no_count = 0
        for pk in pk_list:
            sr_no_count += 1
            row_data = get_generic_job_sheet_row_data(pk)
            row_data["sr_no"] = str(sr_no_count)
            main_data.append(row_data)

        sr_no = []
        container_no = []
        size_type = []
        line = []
        aging = []
        seq_no = []
        main_component = []
        component_description = []
        location_description = []
        specific_location_description = []
        damage_description = []
        material_description = []
        repair_description = []
        measurement = []
        unit = []
        length_and_width = []
        quantity = []

        for each in main_data:
            sr_no.append(each["sr_no"])
            container_no.append(each["container_no"])
            size_type.append(each["size_type"])
            line.append(each["line"])
            aging.append(each["aging"])
            seq_no_count = 0
            for line_data in each["survey_lines"]:
                seq_no_count += 1
                if seq_no_count > 1:
                    sr_no.append("")
                    container_no.append("")
                    size_type.append("")
                    line.append("")
                    aging.append("")
                seq_no.append(seq_no_count)
                main_component.append(line_data["main_component"])
                component_description.append(line_data["component_description"])
                location_description.append(line_data["location_description"])
                specific_location_description.append(
                    line_data["specific_location_description"]
                )
                damage_description.append(line_data["damage_description"])
                material_description.append(line_data["material_description"])
                repair_description.append(line_data["repair_description"])
                measurement.append(line_data["measurement"])
                unit.append(line_data["unit"])
                length_and_width.append(line_data["length_and_width"])
                quantity.append(line_data["quantity"])
            sr_no.append("")
            container_no.append("")
            size_type.append("")
            line.append("")
            aging.append("")
            seq_no.append("")
            main_component.append("")
            component_description.append("")
            location_description.append("")
            specific_location_description.append("")
            damage_description.append("")
            material_description.append("")
            repair_description.append("")
            measurement.append("")
            unit.append("")
            length_and_width.append("")
            quantity.append("")

        excel_data = [
            [
                sr_no[i],
                container_no[i],
                size_type[i],
                line[i],
                aging[i],
                seq_no[i],
                main_component[i],
                component_description[i],
                location_description[i],
                specific_location_description[i],
                damage_description[i],
                material_description[i],
                repair_description[i],
                measurement[i],
                unit[i],
                length_and_width[i],
                quantity[i],
            ]
            for i in range(len(sr_no))
        ]
        return excel_data
    except Exception as e:
        return None


def create_generic_job_sheet_wb(df_data):
    try:
        line = df_data[0][3]
        if not os.path.exists(os.path.join(BASE_DIR, "temp/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/"))
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        date = dt.date().strftime("%Y%m%d")
        time = dt.time().strftime("%H%M")
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/{line.lower()}_job_sheet_{date}{time}.xlsx"
        )
        generic_workbook = xlsxwriter.Workbook(temp_file_path)
        job_sheet = generic_workbook.add_worksheet("JOB")
        job_sheet.add_table(
            f"A1:Q{1 + len(df_data)}",
            {
                "data": df_data,
                "columns": [
                    {"header": "Sr.No"},
                    {"header": "Container No"},
                    {"header": "Size Type"},
                    {"header": "Line"},
                    {"header": "Aging"},
                    {"header": "Seq No"},
                    {"header": "Main Component"},
                    {"header": "Component"},
                    {"header": "Location"},
                    {"header": "Specific Location"},
                    {"header": "Damage"},
                    {"header": "Material"},
                    {"header": "Repair"},
                    {"header": "Measurement"},
                    {"header": "Unit"},
                    {"header": "L x W"},
                    {"header": "QTY"},
                ],
            },
        )
        generic_workbook.close()
        return temp_file_path
    except Exception as e:
        return None


def upload_wistim_to_s3(
    location, site, site_type, process, date, object_list, file_name, file_path
):
    try:
        bucket_name = AWS_STORAGE_BUCKET_NAME
        object_name = (
            f"MNR/WISTIM_DISTIM/{location}/{site_type}/{site}/{process}/{file_name}"
        )
        upload_file(file_path, bucket_name, object_name)
        location_object = Location.objects.get(name=location)
        site_object = Site.objects.get(name=site)
        wistim_object = WistimS3Upload(
            date=date,
            s3_object_name=object_name,
            s3_file_name=file_name,
            type=process,
            location=location_object,
            site=site_object,
        )
        wistim_object.save()
        if process == "Estimate":
            for each in object_list:
                wistim_object.estimate.add(each)
        else:
            for each in object_list:
                wistim_object.repair.add(each)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def get_site_ftp_detail(site, process):
    try:
        host = None
        username = None
        password = None
        try:
            site_obj = Site.objects.get(name=site)
            host = site_obj.ftp_host
            username = site_obj.ftp_username
            password = site_obj.ftp_password
        except:
            host = config(f"{str(site).upper()}_FTP_HOST")
            username = config(f"{str(site).upper()}_FTP_USERNAME")
            password = config(f"{str(site).upper()}_FTP_PASSWORD")

        main_dir = str(username).split("-")[1]
        working_directory = None
        if process == "estimate_wistim":
            working_directory = f"{main_dir}/WESTIM"
        elif process == "estimate_distim":
            working_directory = f"{main_dir}/ResponseDESTIM"
        elif process == "repair_distim":
            working_directory = f"{main_dir}/RepairCompletionDESTIM"
        elif process == "before_repair_image_upload":
            working_directory = f"{main_dir}/RepairEstimationImage/"
        elif process == "after_repair_image_upload":
            working_directory = f"{main_dir}/RepairEstimationImage/"
        elif process == "msc_excel_edi":
            working_directory = f"{str(username)}/To_MSC/EDI_XLS/"
        else:
            pass
        return {
            "host": host,
            "username": username,
            "password": password,
            "working_directory": working_directory,
        }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


# def upload_file_to_ftp_server(
#     host, username, password, working_directory, file_name, file_path
# ):
#     def upload(ftp):
#         ftp.login(username, password)
#         ftp.cwd(working_directory)
#         with open(file_path, "rb") as f:
#             return ftp.storbinary(f"STOR {file_name}", f)

#     try:
#         # Try FTPS first
#         ftp = ftplib.FTP_TLS(host)
#         ftp.prot_p()
#         ftp.set_pasv(True)
#         ret = upload(ftp)
#         ftp.quit()

#     except ftplib.all_errors:
#         try:
#             # Fallback to plain FTP
#             ftp = ftplib.FTP(host)
#             ret = upload(ftp)
#             ftp.quit()

#         except ftplib.all_errors:
#             logging.getLogger("error_log").error(traceback.format_exc())
#             return None

#     return ret.startswith(("226", "250"))


def upload_file_to_ftp_server(
    host, username, password, working_directory, file_name, file_path
):
    try:
        # Try SFTP first
        transport = paramiko.Transport((host, 22))
        transport.connect(
            username=username,
            password=password,
        )

        sftp = paramiko.SFTPClient.from_transport(transport)

        remote_path = f"{working_directory.rstrip('/')}/{file_name}"
        sftp.put(file_path, remote_path)

        sftp.close()
        transport.close()

        return True

    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return None
    
        # try:
        #     # Fallback to FTPS
        #     ftp = ftplib.FTP_TLS(host)
        #     ftp.login(username, password)
        #     ftp.prot_p()
        #     ftp.set_pasv(True)
        #     ftp.cwd(working_directory)

        #     with open(file_path, "rb") as f:
        #         ret = ftp.storbinary(f"STOR {file_name}", f)

        #     ftp.quit()

        #     return ret.startswith(("226", "250"))

        # except ftplib.all_errors:
        #     try:
        #         # Fallback to plain FTP
        #         ftp = ftplib.FTP(host)
        #         ftp.login(username, password)
        #         ftp.cwd(working_directory)

        #         with open(file_path, "rb") as f:
        #             ret = ftp.storbinary(f"STOR {file_name}", f)

        #         ftp.quit()

        #         return ret.startswith(("226", "250"))

        #     except ftplib.all_errors:
        #         logging.getLogger("error_log").error(traceback.format_exc())
        #         return None


def download_file_from_ftp_server(
    host, username, password, working_directory, file_name
):
    try:
        try:
            ftp = ftplib.FTP_TLS()
            ftp.connect(host)
            ftp.login(username, password)
            ftp.prot_p()
            ftp.cwd(working_directory)
        except:
            ftp = ftplib.FTP()
            ftp.connect(host)
            ftp.login(username, password)
            ftp.cwd(working_directory)

        if not os.path.exists(os.path.join(BASE_DIR, "temp/MNR/DESTIM_DOWNLOADS/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/MNR/DESTIM_DOWNLOADS/"))
        temp_file_path = os.path.join(
            BASE_DIR, f"temp/MNR/DESTIM_DOWNLOADS/{file_name}"
        )
        with open(temp_file_path, "wb") as file:
            retCode = ftp.retrbinary(f"RETR {file_name}", file.write)
        ftp.quit()
        if retCode.startswith(("226", "250")):
            return temp_file_path
        else:
            return None
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_all_site_recent_destim_file_detail():
    try:
        main_data = []
        for each in Site.objects.all():
            site_ftp_detail = get_site_ftp_detail(
                site=each.name, process="estimate_distim"
            )
            if site_ftp_detail is not None:
                host = site_ftp_detail["host"]
                username = site_ftp_detail["username"]
                password = site_ftp_detail["password"]
                working_directory = site_ftp_detail["working_directory"]

                try:
                    ftp = ftplib.FTP_TLS()
                    ftp.connect(host)
                    ftp.login(username, password)
                    ftp.prot_p()
                    ftp.cwd(working_directory)
                    file_data_raw = list(ftp.mlsd())
                    ftp.quit()
                except:
                    ftp = ftplib.FTP()
                    ftp.connect(host)
                    ftp.login(username, password)
                    ftp.cwd(working_directory)
                    file_data_raw = list(ftp.mlsd())
                    ftp.quit()

                file_names = []
                for data in file_data_raw:
                    file_name = data[0]
                    file_specs = data[1]
                    if file_specs["type"] == "file":
                        creation_date = datetime.datetime.strptime(
                            file_specs["create"], "%Y%m%d%H%M%S"
                        ).date()
                        today = datetime.datetime.now().astimezone(
                            timezone.get_current_timezone()
                        ) - datetime.timedelta(days=1)
                        if creation_date == today.date():
                            file_names.append(file_name)
                main_data.append(
                    (each.location.name, each.name, file_names, site_ftp_detail)
                )
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return []


def mark_all_site_destim_response(data_list):
    try:
        for each in data_list:
            location_name = each[0]
            site_name = each[1]
            site = Site.objects.get(name=site_name)
            location = Location.objects.get(name=location_name)
            file_names = each[2]
            ftp_detail = each[3]
            host = ftp_detail["host"]
            username = ftp_detail["username"]
            password = ftp_detail["password"]
            working_directory = ftp_detail["working_directory"]
            for file_name in file_names:
                temp_file_path = download_file_from_ftp_server(
                    host=host,
                    username=username,
                    password=password,
                    working_directory=working_directory,
                    file_name=file_name,
                )
                dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
                bucket_name = AWS_STORAGE_BUCKET_NAME
                distim_object_name = f"MNR/WISTIM_DISTIM/{location_name}/{site.type}/{site_name}/Distim/{file_name}"
                upload_file(temp_file_path, bucket_name, distim_object_name)
                distim_wistim_object = WistimS3Upload(
                    date=dt,
                    s3_object_name=distim_object_name,
                    s3_file_name=file_name,
                    type="Distim",
                    location=location,
                    site=site,
                )
                distim_wistim_object.save()
                extracted_data = extract_edi_data(temp_file_path)
                approved = []
                rejected = []

                for each in extracted_data["container_data"]:
                    remark1 = each["remark1"]
                    if remark1 == "APPROVED":
                        approved.append(each)
                    else:
                        rejected.append(each)
                set_estimate_status(
                    location=location,
                    site=site,
                    approved=approved,
                    rejected=rejected,
                    app_user=None,
                )

                if not len(approved) == 0:
                    approved_container_data = {
                        "depot_code": extracted_data["depot_code"],
                        "line": extracted_data["line"],
                        "labour_rate": extracted_data["labour_rate"],
                        "currency": extracted_data["currency"],
                        "container_data": approved,
                    }
                    excel_file_path = make_excel_data(approved_container_data)
                    object_name = f"MNR/WISTIM_DISTIM/{location_name}/{site.type}/{site_name}/ApprovedWistim/{dt.strftime('%Y%m%d%H%M%S')}_approved_destim.xlsx"
                    upload_file(excel_file_path, bucket_name, object_name)
                    wistim_object = WistimS3Upload(
                        date=dt,
                        s3_object_name=object_name,
                        s3_file_name=f"{dt.strftime('%Y%m%d%H%M%S')}_approved_destim.xlsx",
                        type="Approved Wistim",
                        location=location,
                        site=site,
                    )
                    wistim_object.save()
                    os.remove(temp_file_path)
                    os.remove(excel_file_path)

                elif not len(rejected) == 0:
                    rejected_container_data = {
                        "depot_code": extracted_data["depot_code"],
                        "line": extracted_data["line"],
                        "labour_rate": extracted_data["labour_rate"],
                        "currency": extracted_data["currency"],
                        "container_data": rejected,
                    }
                    excel_file_path = make_excel_data(rejected_container_data)
                    object_name = f"MNR/WISTIM_DISTIM/{location_name}/{site.type}/{site_name}/RejectedWistim/{dt.strftime('%Y%m%d%H%M%S')}_rejected_destim.xlsx"
                    upload_file(excel_file_path, bucket_name, object_name)
                    wistim_object = WistimS3Upload(
                        date=dt,
                        s3_object_name=object_name,
                        s3_file_name=f"{dt.strftime('%Y%m%d%H%M%S')}_rejected_destim.xlsx",
                        type="Rejected Wistim",
                        location=location,
                        site=site,
                    )
                    wistim_object.save()
                    os.remove(temp_file_path)
                    os.remove(excel_file_path)
                else:
                    os.remove(temp_file_path)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_specific_location_excel_data(input_excel):
    try:
        ps = openpyxl.load_workbook(input_excel, data_only=True)
        sheet = ps["Sheet1"]
        # Data Extraction
        main_location_code_raw1 = [
            sheet["A" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        main_location_code_raw2 = [
            each for each in main_location_code_raw1 if not each is None
        ]
        main_location_code = [
            None if each == "_" else each for each in main_location_code_raw2
        ]

        specific_location_code_raw1 = [
            sheet["B" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        specific_location_code_raw2 = [
            each for each in specific_location_code_raw1 if not each is None
        ]
        specific_location_code = [
            None if each == "_" else each for each in specific_location_code_raw2
        ]

        description_raw1 = [
            sheet["C" + str(row)].value for row in range(1, sheet.max_row + 1)
        ]
        description_raw2 = [each for each in description_raw1 if not each is None]
        description = [None if each == "_" else each for each in description_raw2]
        ps.close()

        # Checking excel data if valid
        popped = [
            main_location_code.pop(0),
            specific_location_code.pop(0),
            description.pop(0),
        ]
        headers = ["Main Location Code", "Specific Location Code", "Description"]

        if not popped == headers:
            return "Header Not Found"
        # Data Gatheration
        # main_data = {}
        # for i in range(len(main_location_code)):
        #     if main_location_code[i] in main_data.keys():
        #         main_data[main_location_code[i]].append(
        #             {
        #                 "specific_location_code": specific_location_code[i],
        #                 "specific_location_description": description[i],
        #             }
        #         )
        #     else:

        #         main_data.update(
        #             {
        #                 main_location_code[i]: [
        #                     {
        #                         "specific_location_code": specific_location_code[i],
        #                         "specific_location_description": description[i],
        #                     }
        #                 ]
        #             }
        #         )
        main_data = []
        for i in range(len(main_location_code)):
            main_data.append(
                TariffSpecificLocation(
                    location_code=main_location_code[i],
                    specific_location_code=specific_location_code[i],
                    specific_location_description=description[i],
                )
            )
        TariffSpecificLocation.objects.bulk_create(main_data)
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def get_bill_type_for_mnr(survey_data):
    try:
        general = SurveyLine.objects.filter(parent=survey_data)
        repair = general.filter(wash_clean_tariff=float(0))
        washing = general.exclude(wash_clean_tariff=float(0))
        washing_count = general.count() - repair.count()
        washing_amount = sum([float(line.total_cost) for line in washing])
        repair_amount = sum([float(line.total_cost) for line in repair])

        if general.count() == repair.count():
            return {
                "type": "repair",
                "washing_amount": float(washing_amount),
                "repair_amount": float(repair_amount),
            }
        elif general.count() == washing_count:
            return {
                "type": "wash",
                "washing_amount": float(washing_amount),
                "repair_amount": float(repair_amount),
            }
        else:
            return {
                "type": "repair and wash",
                "washing_amount": float(washing_amount),
                "repair_amount": float(repair_amount),
            }
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def extract_data_list(input_excel):
    ps = openpyxl.load_workbook(input_excel)
    sheet = ps["repair_upload"]
    container_no_raw = [
        sheet["A" + str(row)].value for row in range(1, sheet.max_row + 1)
    ]
    damage_raw = [sheet["B" + str(row)].value for row in range(1, sheet.max_row + 1)]
    first_name_raw = [
        sheet["C" + str(row)].value for row in range(1, sheet.max_row + 1)
    ]
    last_name_raw = [sheet["D" + str(row)].value for row in range(1, sheet.max_row + 1)]
    current_date_raw = [
        sheet["E" + str(row)].value for row in range(1, sheet.max_row + 1)
    ]
    current_time_raw = [
        sheet["F" + str(row)].value for row in range(1, sheet.max_row + 1)
    ]
    grade_raw = [sheet["G" + str(row)].value for row in range(1, sheet.max_row + 1)]
    remarks_raw = [sheet["H" + str(row)].value for row in range(1, sheet.max_row + 1)]

    container_no = [each for each in container_no_raw if not each is None]
    damage = [each for each in damage_raw if not each is None]
    first_name = [each for each in first_name_raw if not each is None]
    last_name = [each for each in last_name_raw if not each is None]
    current_date = [each for each in current_date_raw if not each is None]
    current_time = [each for each in current_time_raw if not each is None]
    grade = [each for each in grade_raw if not each is None]
    remarks = [each for each in remarks_raw if not each is None]

    popped = [
        container_no.pop(0),
        damage.pop(0),
        first_name.pop(0),
        last_name.pop(0),
        current_date.pop(0),
        current_time.pop(0),
        grade.pop(0),
        remarks.pop(0),
    ]

    headers = [
        "container_no",
        "damage",
        "first_name",
        "last_name",
        "current_date",
        "current_time",
        "grade",
        "remarks",
    ]

    if not popped == headers:
        return "Header Not Found"

    extracted_data_list = []

    for i in range(len(container_no)):
        extracted_data_list.append(
            {
                "sr_no": str(i),
                "container_no": str(container_no[i]),
                "damage": str(damage[i]),
                "first_name": str(first_name[i]),
                "last_name": str(last_name[i]),
                "current_date": str(current_date[i]),
                "current_time": str(current_time[i]),
                "grade": str(grade[i]),
                "remarks": str(remarks[i]),
            }
        )
    ps.close()
    return extracted_data_list


def validate_depot_container(container_no_str, location, site, error_msg, each):
    if not ContainerStock.objects.filter(
        container__container_no=container_no_str,
        container__location=location,
        container__site=site,
    ).exists():
        error_msg.append(
            f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
            f"this({container_no_str}) Container does not exists"
        )
    else:
        container_stock = ContainerStock.objects.get(
            container__container_no=container_no_str,
            container__location=location,
            container__site=site,
            container_status="IN",
        )
        if not Survey.objects.filter(depot=container_stock).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) in Survey Pending stage"
            )
        elif not Estimate.objects.filter(parent__depot=container_stock).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) Estimate data does not exists"
            )
        elif not Approval.objects.filter(
            parent__parent__depot=container_stock
        ).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) Approval data does not exists"
            )
        elif not Approval.objects.get(
            parent__parent__depot=container_stock
        ).is_approved:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) Estimate is Not Approved Yet"
            )
        elif Repair.objects.filter(parent__parent__depot=container_stock).exists():
            if Repair.objects.get(parent__parent__depot=container_stock).is_proceed:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                    f"this({container_no_str}) Repair Already exists"
                )
            elif Repair.objects.get(parent__parent__depot=container_stock).is_draft:
                error_msg.append("")
        else:
            error_msg.append("")

    return error_msg


def validate_non_depot_container(container_no_str, location, site, error_msg, each):
    if not NonDepotContainerStock.objects.filter(
        container__container_no=container_no_str,
        container__location=location,
        container__site=site,
    ).exists():
        error_msg.append(
            f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
            f"this({container_no_str}) Container does not exists"
        )
    else:
        container_stock = NonDepotContainerStock.objects.get(
            container__container_no=container_no_str,
            container__location=location,
            container__site=site,
            container_status="IN",
        )
        if not Survey.objects.filter(non_depot=container_stock).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) in Survey Pending stage"
            )
        elif not Estimate.objects.filter(parent__non_depot=container_stock).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) Estimate data does not exists"
            )
        elif not Approval.objects.filter(
            parent__parent__non_depot=container_stock
        ).exists():
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) Approval data does not exists"
            )
        elif not Approval.objects.get(
            parent__parent__non_depot=container_stock
        ).is_approved:
            error_msg.append(
                f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                f"this({container_no_str}) Estimate is Not Approved Yet"
            )
        elif Repair.objects.filter(parent__parent__non_depot=container_stock).exists():
            if Repair.objects.get(parent__parent__non_depot=container_stock).is_proceed:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                    f"this({container_no_str}) Repair Already exists"
                )
            elif Repair.objects.get(parent__parent__non_depot=container_stock).is_draft:
                error_msg.append("")

        else:
            error_msg.append("")

    return error_msg


def repair_extract_excel_data(input_excel, option, location, site):
    try:
        extracted_data_list = extract_data_list(input_excel)
        error_data = []
        error_data_msg = {}
        correct_data = []
        site_type = site.type

        for each in extracted_data_list:
            error_msg = []

            container_no_str = each["container_no"]
            if len(container_no_str) == 11 and check_char_digit(container_no_str):
                is_container_repeated = any(
                    obj_data["container_no"] == container_no_str
                    for obj_data in correct_data
                )
                if is_container_repeated:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this({container_no_str}) container is repeated in your file"
                    )
                else:
                    if site_type == "DEPOT":
                        validate_depot_container(
                            container_no_str, location, site, error_msg, each
                        )
                    else:
                        validate_non_depot_container(
                            container_no_str, location, site, error_msg, each
                        )

            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no ({container_no_str}) is invalid"
                )

            damage_str = each["damage"]
            damage_list = ["OK", "CLEANING", "LD", "MD", "HD", "AV", "AR", "DM"]
            if not damage_str in damage_list:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in damage column,"
                    f"damage provided is not correct, should be among these {', '.join(damage_list)}"
                )
            else:
                error_msg.append("")

            first_name_str = each.pop("first_name")
            last_name_str = each.pop("last_name")
            if last_name_str == "_":
                staff_filter = {
                    "firstName": first_name_str,
                    "role": "Worker",
                    "location": location,
                    "site": site,
                }
            else:
                staff_filter = {
                    "firstName": first_name_str,
                    "lastName": last_name_str,
                    "role": "Worker",
                    "location": location,
                    "site": site,
                }

            if MnrStaff.objects.filter(**staff_filter).exists():
                error_msg.append("")
                staff = MnrStaff.objects.get(**staff_filter)
                each["man_power"] = [staff.pk]
            else:
                error_msg.append(
                    f"In row {int(each['sr_no']) + 2} there is a problem in the first_name and last_name column, "
                    f"man_power not found in the system database"
                )

            if option == "Complete and Placement":
                current_date_str = each["current_date"]
                if current_date_str == "_" or current_date_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in current_date column,"
                        f"current date column cannot be empty"
                    )
                else:
                    try:
                        datetime.datetime.strptime(current_date_str, "%d_%m_%Y").date()
                        error_msg.append("")
                    except:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in current_date column,"
                            f"date is not in dd_mm_yyyy format"
                        )

                current_time_str = each["current_time"]
                if current_time_str == "_" or current_time_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in current time column,"
                        f"current time column cannot be empty"
                    )
                else:
                    try:
                        datetime.datetime.strptime(current_time_str, "%H_%M").time()
                        error_msg.append("")
                    except:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in current_time column,"
                            f"date is not in HH_MM format"
                        )

                grade_str = each["grade"]
                if grade_str == "_" or grade_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in grade column,"
                        f"grade column cannot be empty"
                    )
                else:
                    grade_list = ["A", "B", "C", "D", "E", "F"]
                    if not grade_str in grade_list:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in grade column,"
                            f"grade provided is not correct, should be among these {', '.join(grade_list)}"
                        )
                    else:
                        error_msg.append("")

                remarks_str = each["remarks"]
                try:
                    if remarks_str == "_":
                        each["remarks"] = ""

                    error_msg.append("")
                except:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in remarks column"
                    )
            else:
                each["current_date"] = ""
                each["current_time"] = ""
                each["grade"] = ""
                each["remarks"] = ""
                error_msg.extend([""] * 4)

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)
        correct_data_count = str(len(correct_data))
        error_data_count = str(len(error_data))
        main_data = {
            "importable_data": correct_data,
            "importable_data_count": correct_data_count,
            "rejected_data": error_data,
            "rejected_data_count": error_data_count,
            "faults": error_data_msg,
        }
        return main_data
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return False


def compress_image(image):
    img = Image.open(image)
    # Returns extension name
    extension = os.path.splitext(image.name)[1].lower()[1:]
    # Convert it to RGB mode if its in pallete mode
    if img.mode == "P":
        img = img.convert("RGB")
    # Compress the image
    compressed_img = img.copy()
    output = io.BytesIO()
    compressed_img.save(output, format="JPEG", optimize=True, quality=20)

    output.seek(0)

    compressed_file = InMemoryUploadedFile(
        output,
        "ImageField",
        f"{image.name.split('.')[0]}.{extension}",
        "image/jpeg",
        output.getbuffer().nbytes,
        None,
    )
    return compressed_file


def update_status_and_stage(stock, automatic_mnr_status_change, status, stage):
    if not stock.status == status and automatic_mnr_status_change:
        stock.status = status
        stock.save(update_fields=["status"])
    if not stock.stage == stage:
        stock.stage = stage
        stock.save(update_fields=["stage"])
    return True


def validate_mnr_status_and_condition():
    data = Survey.objects.all()
    print(f"Total {data.count()} Survey")
    mnr_dict = {"repair": [], "approval": [], "estimate": [], "survey": []}
    for each in data:
        if Repair.objects.filter(parent__parent=each).exists():
            mnr_dict["repair"].append(each.pk)
        elif Approval.objects.filter(parent__parent=each).exists():
            mnr_dict["approval"].append(each.pk)
        elif Estimate.objects.filter(parent=each):
            mnr_dict["estimate"].append(each.pk)
        else:
            mnr_dict["survey"].append(each.pk)

    print("Done with mnr_dict....")

    # Survey Objects

    if mnr_dict["survey"]:
        print("In Survey....")
        for survey_pk in mnr_dict["survey"]:
            survey = (
                Survey.objects.select_related(
                    "depot",
                    "non_depot",
                    "depot__container__site",
                    "non_depot__container__site",
                )
                .filter(pk=survey_pk)
                .latest("pk")
            )

            stock = survey.depot if survey.depot else survey.non_depot
            automatic_mnr_status_change = (
                stock.container.site.automatic_mnr_status_change
            )
            if survey.is_draft:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Survey Pending",
                    stage="Survey",
                )

            elif survey.is_proceed:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Estimate Pending",
                    stage="Estimate",
                )
                # Survey
                survey_in_date_time = datetime.datetime.combine(
                    stock.gate_in.in_date, stock.gate_in.in_time
                ).astimezone(timezone.get_current_timezone())
                date_time = datetime.datetime.combine(
                    survey.current_date, survey.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.survey_date = survey.current_date
                stock.survey_time = survey.current_time

                stock.survey_pending_in_date_time = survey_in_date_time
                stock.survey_pending_out_date_time = date_time
                stock.estimate_pending_in_date_time = date_time
                stock.save()
        print("Done with Survey....")

    # Estimate Objects

    if mnr_dict["estimate"]:
        print("In Estimate....")
        for survey_pk in mnr_dict["estimate"]:
            estimate = (
                Estimate.objects.select_related(
                    "parent__depot",
                    "parent__non_depot",
                    "parent__depot__container__site",
                    "parent__non_depot__container__site",
                )
                .filter(parent__pk=survey_pk)
                .latest("pk")
            )
            stock = (
                estimate.parent.depot
                if estimate.parent.depot
                else estimate.parent.non_depot
            )
            survey = estimate.parent
            automatic_mnr_status_change = (
                stock.container.site.automatic_mnr_status_change
            )
            if estimate.is_draft:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Estimate Pending",
                    stage="Estimate",
                )
            elif estimate.is_proceed:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Approval Pending",
                    stage="Approval",
                )
                # estimate
                date_time = datetime.datetime.combine(
                    estimate.current_date, estimate.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.estimate_date = estimate.current_date
                stock.estimate_time = estimate.current_time
                # survey
                survey_in_date_time = datetime.datetime.combine(
                    stock.gate_in.in_date, stock.gate_in.in_time
                ).astimezone(timezone.get_current_timezone())
                survey_date_time = datetime.datetime.combine(
                    survey.current_date, survey.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.survey_date = survey.current_date
                stock.survey_time = survey.current_time

                stock.survey_pending_in_date_time = survey_in_date_time
                stock.survey_pending_out_date_time = survey_date_time
                stock.estimate_pending_in_date_time = survey_date_time
                stock.estimate_pending_out_date_time = date_time
                stock.approval_pending_in_date_time = date_time
                stock.save()
        print("Done with Estimate....")
    # Approval Objects

    if mnr_dict.get("approval"):
        print("In Approval....")
        for survey_pk in mnr_dict.get("approval"):
            approval = (
                Approval.objects.select_related(
                    "parent__parent__depot",
                    "parent__parent__non_depot",
                    "parent__parent__depot__container__site",
                    "parent__parent__non_depot__container__site",
                )
                .filter(parent__parent__pk=survey_pk)
                .latest("pk")
            )
            stock = (
                approval.parent.parent.depot
                if approval.parent.parent.depot
                else approval.parent.parent.non_depot
            )
            survey = approval.parent.parent
            estimate = approval.parent
            automatic_mnr_status_change = (
                stock.container.site.automatic_mnr_status_change
            )
            if approval.is_draft:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Approval Pending",
                    stage="Approval",
                )

            elif approval.is_proceed and not approval.is_approved:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Approval Pending",
                    stage="Approval",
                )
            elif approval.is_proceed and approval.is_approved:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Approved",
                    stage="Repair",
                )
                # approval
                date_time = datetime.datetime.combine(
                    approval.current_date, approval.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.approval_date = approval.current_date
                stock.approval_time = approval.current_time
                # estimate
                estimate_date_time = datetime.datetime.combine(
                    estimate.current_date, estimate.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.estimate_date = estimate.current_date
                stock.estimate_time = estimate.current_time
                # survey
                survey_in_date_time = datetime.datetime.combine(
                    stock.gate_in.in_date, stock.gate_in.in_time
                ).astimezone(timezone.get_current_timezone())
                survey_date_time = datetime.datetime.combine(
                    survey.current_date, survey.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.survey_date = survey.current_date
                stock.survey_time = survey.current_time

                stock.survey_pending_in_date_time = survey_in_date_time
                stock.survey_pending_out_date_time = survey_date_time
                stock.estimate_pending_in_date_time = survey_date_time
                stock.estimate_pending_out_date_time = estimate_date_time
                stock.approval_pending_in_date_time = estimate_date_time
                stock.approval_pending_out_date_time = date_time
                stock.approved_in_date_time = date_time
                stock.save()
        print("Done with Approval....")
    # Repair Objects

    if mnr_dict.get("repair"):
        print("In Repair....")
        for survey_pk in mnr_dict.get("repair"):
            repair = (
                Repair.objects.select_related(
                    "parent__parent__depot",
                    "parent__parent__non_depot",
                    "parent__parent__depot__container__site",
                    "parent__parent__non_depot__container__site",
                )
                .filter(parent__parent__pk=survey_pk)
                .latest("pk")
            )
            stock = (
                repair.parent.parent.depot
                if repair.parent.parent.depot
                else repair.parent.parent.non_depot
            )
            survey = repair.parent.parent
            estimate = repair.parent
            automatic_mnr_status_change = (
                stock.container.site.automatic_mnr_status_change
            )
            if repair.placement and not repair.complete:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Under Repair",
                    stage="Repair",
                )
                repair.is_draft = True
                repair.save()
                date_time = datetime.datetime.combine(
                    repair.placement_date, repair.placement_time
                ).astimezone(timezone.get_current_timezone())
                stock.approved_out_date_time = date_time
                stock.under_repair_in_date_time = date_time
                stock.save()
            elif repair.placement and repair.complete:
                update_status_and_stage(
                    stock,
                    automatic_mnr_status_change,
                    status="Available",
                    stage="Available",
                )
                repair.is_proceed = True
                repair.save()
                # repair
                date_time = datetime.datetime.combine(
                    repair.current_repair_date, repair.current_repair_time
                ).astimezone(timezone.get_current_timezone())
                stock.repair_date = repair.current_repair_date
                stock.repair_time = repair.current_repair_time
                # approval
                approval = (
                    Approval.objects.select_related("parent")
                    .filter(parent=estimate)
                    .latest("pk")
                )
                approval_date_time = datetime.datetime.combine(
                    approval.current_date, approval.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.approval_date = approval.current_date
                stock.approval_time = approval.current_time
                # estimate
                estimate_date_time = datetime.datetime.combine(
                    estimate.current_date, estimate.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.estimate_date = estimate.current_date
                stock.estimate_time = estimate.current_time
                # survey
                survey_in_date_time = datetime.datetime.combine(
                    stock.gate_in.in_date, stock.gate_in.in_time
                ).astimezone(timezone.get_current_timezone())
                survey_date_time = datetime.datetime.combine(
                    survey.current_date, survey.current_time
                ).astimezone(timezone.get_current_timezone())
                stock.survey_date = survey.current_date
                stock.survey_time = survey.current_time

                stock.survey_pending_in_date_time = survey_in_date_time
                stock.survey_pending_out_date_time = survey_date_time
                stock.estimate_pending_in_date_time = survey_date_time
                stock.estimate_pending_out_date_time = estimate_date_time
                stock.approval_pending_in_date_time = estimate_date_time
                stock.approval_pending_out_date_time = approval_date_time
                stock.approved_in_date_time = approval_date_time
                stock.under_repair_out_date_time = date_time
                stock.available_in_date_time = date_time
                stock.save()
        print("Done with Repair....")

    return True


def delete_images(image_queryset, bucket_name):
    for image in image_queryset:
        delete_file(bucket=bucket_name, object_name=image.s3_object_name)
        image.delete()
    return True


def delete_mnr_repair_img_from_s3(process, process_id, image_id_list):
    try:
        bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
        surveyObj = Survey.getById(process_id)
        if image_id_list:
            if process == "Survey":
                images = BeforeRepairImage.objects.filter(
                    parent=surveyObj, pk__in=image_id_list
                )
            else:
                estimateObj = Estimate.getByParentId(surveyObj.pk)
                repairObj = Repair.objects.get(parent=estimateObj)
                images = AfterRepairImage.objects.filter(
                    parent=repairObj, pk__in=image_id_list
                )
                repairObj.is_img_uploaded = False
                repairObj.save(update_fields=["is_img_uploaded"])
            delete_images(images, bucket_name)
            if (
                process == "Survey"
                and not BeforeRepairImage.objects.filter(parent=surveyObj).exists()
            ):
                surveyObj.is_img_uploaded = False
                surveyObj.save(update_fields=["is_img_uploaded"])
            elif (
                process == "Repair"
                and not AfterRepairImage.objects.filter(parent=repairObj).exists()
            ):
                repairObj.is_img_uploaded = False
                repairObj.save(update_fields=["is_img_uploaded"])

            return True

        return False

    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def dummy():
    try:
        all_stock = ContainerStock.objects.select_related("container").filter(
            container__status="IN",
            container_status="IN",
            container__automatic_mnr_status_change=False,
        )
        tz = timezone.get_current_timezone()
        count = 0
        total = all_stock.count()

        for each in all_stock:
            count = count + 1
            in_date_time = datetime.datetime.combine(
                each.gate_in.in_date, each.gate_in.in_time
            ).astimezone(tz)

            if each.status in ["Available", "Without_Repair_Available"]:
                print("Im in Available")
                available_in_date_time = datetime.datetime.combine(
                    each.available_date, each.gate_in.in_time
                ).astimezone(tz)
                dummy_under_repair_in_date_time = (
                    available_in_date_time - datetime.timedelta(days=1)
                )
                dummy_approved_in_date_time = (
                    available_in_date_time - datetime.timedelta(days=1)
                )
                dummy_approval_in_date_time = in_date_time + datetime.timedelta(days=2)
                dummy_estimate_in_date_time = in_date_time + datetime.timedelta(days=1)
                if each.available_in_date_time is None:
                    each.available_in_date_time = available_in_date_time
                if each.under_repair_out_date_time is None:
                    each.under_repair_out_date_time = available_in_date_time
                if each.under_repair_in_date_time is None:
                    each.under_repair_in_date_time = (
                        dummy_under_repair_in_date_time.astimezone(tz)
                    )
                if each.approved_out_date_time is None:
                    each.approved_out_date_time = (
                        dummy_under_repair_in_date_time.astimezone(tz)
                    )
                if each.approved_in_date_time is None:
                    each.approved_in_date_time = dummy_approved_in_date_time.astimezone(
                        tz
                    )
                if each.approval_pending_out_date_time is None:
                    each.approval_pending_out_date_time = (
                        dummy_approved_in_date_time.astimezone(tz)
                    )
                if each.approval_pending_in_date_time is None:
                    each.approval_pending_in_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_out_date_time is None:
                    each.estimate_pending_out_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_in_date_time is None:
                    each.estimate_pending_in_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_out_date_time is None:
                    each.survey_pending_out_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_in_date_time is None:
                    each.survey_pending_in_date_time = in_date_time
                each.save()
                print("Available ... Done")

            elif each.status == "Under Repairing":
                print("Im in Under Repairing")
                dummy_under_repair_in_date_time = in_date_time + datetime.timedelta(
                    days=4
                )
                dummy_approved_in_date_time = in_date_time + datetime.timedelta(days=3)
                dummy_approval_in_date_time = in_date_time + datetime.timedelta(days=2)
                dummy_estimate_in_date_time = in_date_time + datetime.timedelta(days=1)
                if each.under_repair_in_date_time is None:
                    each.under_repair_in_date_time = (
                        dummy_under_repair_in_date_time.astimezone(tz)
                    )
                if each.approved_out_date_time is None:
                    each.approved_out_date_time = (
                        dummy_under_repair_in_date_time.astimezone(tz)
                    )
                if each.approved_in_date_time is None:
                    each.approved_in_date_time = dummy_approved_in_date_time.astimezone(
                        tz
                    )
                if each.approval_pending_out_date_time is None:
                    each.approval_pending_out_date_time = (
                        dummy_approved_in_date_time.astimezone(tz)
                    )
                if each.approval_pending_in_date_time is None:
                    each.approval_pending_in_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_out_date_time is None:
                    each.estimate_pending_out_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_in_date_time is None:
                    each.estimate_pending_in_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_out_date_time is None:
                    each.survey_pending_out_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_in_date_time is None:
                    each.survey_pending_in_date_time = in_date_time
                each.save()
                print("Under Repairing ... Done")

            elif each.status == "Approved":
                print("Im in Approved")
                dummy_approved_in_date_time = in_date_time + datetime.timedelta(days=3)
                dummy_approval_in_date_time = in_date_time + datetime.timedelta(days=2)
                dummy_estimate_in_date_time = in_date_time + datetime.timedelta(days=1)
                if each.approved_in_date_time is None:
                    each.approved_in_date_time = dummy_approved_in_date_time.astimezone(
                        tz
                    )
                if each.approval_pending_out_date_time is None:
                    each.approval_pending_out_date_time = (
                        dummy_approved_in_date_time.astimezone(tz)
                    )
                if each.approval_pending_in_date_time is None:
                    each.approval_pending_in_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_out_date_time is None:
                    each.estimate_pending_out_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_in_date_time is None:
                    each.estimate_pending_in_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_out_date_time is None:
                    each.survey_pending_out_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_in_date_time is None:
                    each.survey_pending_in_date_time = in_date_time
                each.save()
                print("Approved ... Done")

            elif each.status == "Approval Pending":
                print("Im in Approval Pending")
                dummy_approval_in_date_time = in_date_time + datetime.timedelta(days=2)
                dummy_estimate_in_date_time = in_date_time + datetime.timedelta(days=1)
                if each.approval_pending_in_date_time is None:
                    each.approval_pending_in_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_out_date_time is None:
                    each.estimate_pending_out_date_time = (
                        dummy_approval_in_date_time.astimezone(tz)
                    )
                if each.estimate_pending_in_date_time is None:
                    each.estimate_pending_in_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_out_date_time is None:
                    each.survey_pending_out_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_in_date_time is None:
                    each.survey_pending_in_date_time = in_date_time
                each.save()
                print("Approval Pending ... Done")

            elif each.status == "Estimate Pending":
                print("Im in Estimate Pending")
                dummy_estimate_in_date_time = in_date_time + datetime.timedelta(days=1)
                if each.estimate_pending_in_date_time is None:
                    each.estimate_pending_in_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_out_date_time is None:
                    each.survey_pending_out_date_time = (
                        dummy_estimate_in_date_time.astimezone(tz)
                    )
                if each.survey_pending_in_date_time is None:
                    each.survey_pending_in_date_time = in_date_time
                each.save()
                print("Estimate Pending ... Done")

            elif each.status == "Survey Pending":
                print("Im in Survey Pending")
                if each.survey_pending_in_date_time is None:
                    each.survey_pending_in_date_time = in_date_time
                print("Survey Pending ...  Done")
                each.save()
            else:
                pass

            print(f"{count}...of...{total}")
        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None


def set_partial_rejected_flag(seq_data, estimateObj, site=None):
    for seq in seq_data:
        if seq["remark3"] == "REJECTED":
            if SurveyLine.objects.filter(
                parent=estimateObj.parent,
                location_code__icontains=seq["damage_location"],
                component_code__icontains=seq["component"],
                damage_code__icontains=seq["damage_type"],
                material_code__icontains=seq["material_type"],
                repair_code__icontains=seq["repair_type"],
                unit__icontains=seq["unit"],
            ).exists():
                if site is None:
                    SurveyLine.objects.filter(
                        parent=estimateObj.parent,
                        location_code__icontains=seq["damage_location"],
                        component_code__icontains=seq["component"],
                        damage_code__icontains=seq["damage_type"],
                        material_code__icontains=seq["material_type"],
                        repair_code__icontains=seq["repair_type"],
                        unit__icontains=seq["unit"],
                    ).update(is_partial_rejected=True)
                else:
                    SurveyLine.objects.filter(
                        parent=estimateObj.parent,
                        location_code__icontains=seq["damage_location"],
                        component_code__icontains=seq["component"],
                        damage_code__icontains=seq["damage_type"],
                        material_code__icontains=seq["material_type"],
                        repair_code__icontains=seq["repair_type"],
                        unit__icontains=seq["unit"],
                    ).update(is_partial_rejected=True, is_rejected=True)

    return True


def mnr_img_validation(obj, after_repair=False):
    try:

        if after_repair:
            # here obj is repair_obj
            lines_count = SurveyLine.objects.filter(parent=obj.parent.parent).count()
            img_count = AfterRepairImage.objects.filter(parent=obj).count()
        else:
            # here obj is survey_obj
            lines_count = SurveyLine.objects.filter(parent=obj).count()
            img_count = BeforeRepairImage.objects.filter(parent=obj).count()

        if img_count > 40:
            return "Images are morethan maximum img limit, limit is 40"

        if lines_count == 1 and img_count < 5:
            return "Images are lessthan minimum img limit, limit is 5"

        if lines_count >= 2 and img_count < 10:
            return "Images are lessthan minimum img limit, limit is 10"

        return True
    except:
        error_log = logging.getLogger("error_log")
        error_log.error(traceback.format_exc())
        return None
