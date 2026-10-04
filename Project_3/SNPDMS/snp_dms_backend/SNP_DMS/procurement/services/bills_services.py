from common.functions import upload_file, download_file, delete_file
from decouple import config
from SNP_DMS.settings.base import BASE_DIR
import os

# django
from django.http import HttpResponse

# models
from procurement.models import (
    Requisition,
    RequisitionHistoryLine,
    BillUpload,
)


class BillService:
    def uploadBillToS3(self, file, pk):
        AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
        bucket_name = AWS_STORAGE_BUCKET_NAME
        bill_data = RequisitionHistoryLine.manager.getHistoryLineById(pk)
        bill_data.is_bill_uploaded = True
        bill_data.save(update_fields=["is_bill_uploaded"])
        if BillUpload.manager.checkBillExistence(bill_data):
            bill_to_delete = BillUpload.manager.getBillDataByParent(bill_data)
            delete_file(bucket_name, bill_to_delete.s3_object_name)
            bill_to_delete.delete()
        extension = file.name.split(".")[1]
        requisition_params = {"pk": bill_data.parent.pk}
        count = Requisition.manager.getRequisitions(requisition_params).count() + 1
        extension = file.name.split(".")[1]
        filename = f"{bill_data.parent.order_no}_{count}_{pk}.{extension}"

        object_name = f"Procurement/{bill_data.parent.location.name}_{bill_data.parent.site.type}_{bill_data.parent.site.name}_{bill_data.parent.order_no}_{pk}_{filename}"
        try:
            if not os.path.exists(
                os.path.join(BASE_DIR, "temp/Procurement/Requisition/")
            ):
                os.makedirs(os.path.join(BASE_DIR, "temp/Procurement/Requisition/"))
            temp_file_path = os.path.join(
                BASE_DIR, f"temp/Procurement/Requisition/{file}"
            )
            with open(temp_file_path, "wb") as temp:
                temp.write(file.read())
            upload_file(temp_file_path, bucket_name, object_name)
            bill_params = {
                "parent": bill_data,
                "s3_object_name": object_name,
                "s3_file_name": filename,
            }
            BillUpload.manager.createBill(bill_params)

            os.remove(temp_file_path)
            return True
        except:
            os.remove(temp_file_path)
            return False

    def downloadBillFromS3(self, pk):
        AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
        bucket_name = AWS_STORAGE_BUCKET_NAME
        requisition_history = RequisitionHistoryLine.manager.get(pk=pk)
        bill = BillUpload.manager.get(parent=requisition_history)
        file_name = bill.s3_file_name
        object_name = bill.s3_object_name
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
