# other imports

from decouple import config
from SNP_DMS.settings.base import BASE_DIR
import os
from common.functions import upload_file
from PIL import Image
import io
from django.core.files.uploadedfile import InMemoryUploadedFile

# model imports
from surveyor.models import Surveyor, SurveyorBeforeRepairImage

AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


def compressed_images(images):
    compressed_images = []
    for image in images:
        img = Image.open(image)
        extension = os.path.splitext(image.name)[1].lower()[1:]
        if img.mode == "P":
            img = img.convert("RGB")

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
        compressed_images.append(compressed_file)
    return compressed_images


def upload_mnr_repair_img_to_s3(process, file_list, pk):
    bucket_name = AWS_REPAIR_IMAGE_BUCKET_NAME
    if process == "Survey":
        surveyor = Surveyor.objects.get(pk=pk)
        img_type = "Before_Repair_Images"
        if SurveyorBeforeRepairImage.objects.filter(parent=surveyor).exists():
            count = SurveyorBeforeRepairImage.objects.filter(parent=surveyor).count()
        else:
            count = 0

        for file in file_list:
            count = count + 1
            serial_no = str(count).zfill(3)
            extension = file.name.split(".")[1]
            filename = f"B_{surveyor.container_no}_{surveyor.estimate_number}_{serial_no}.{extension}"
            object_name = f"MNR/{surveyor.location.name}/{surveyor.site.type}/{surveyor.site.name}/{img_type}_{surveyor.container_no}_{pk}/{filename}"
            try:
                if not os.path.exists(os.path.join(BASE_DIR, "temp/MNR/Survey/")):
                    os.makedirs(os.path.join(BASE_DIR, "temp/MNR/Survey/"))
                temp_file_path = os.path.join(BASE_DIR, f"temp/MNR/Survey/{file}")
                with open(temp_file_path, "wb") as temp:
                    temp.write(file.read())
                upload_file(temp_file_path, bucket_name, object_name, True)
                surveyor.is_img_uploaded = True
                surveyor.save(update_fields=["is_img_uploaded"])
                SurveyorBeforeRepairImage.objects.create_instance(
                    surveyor, object_name, filename
                )

                os.remove(temp_file_path)
            except:
                os.remove(temp_file_path)
                continue
    return True
