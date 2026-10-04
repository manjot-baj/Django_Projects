import boto3, logging, traceback, time, re, os, random
from decouple import config
from datetime import datetime
from common.functions import upload_file, download_file, delete_file
from SNP_DMS.settings.base import BASE_DIR
from depot.lolo_finance_models import AdvancePaymentDoUpload
from depot.lolo_finance_functions import get_total_site_lolo_amount

# Load AWS configuration
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME")


def do_data_extraction(adv_pymt_obj, file):
    bucket_name = AWS_STORAGE_BUCKET_NAME
    location = adv_pymt_obj.location.name
    site = adv_pymt_obj.site.name

    try:
        # Prepare file details
        _, file_extension = os.path.splitext(file.name)
        new_file_name = (
            f"{random.randint(100000, 999999)}_{adv_pymt_obj.pk}{file_extension}"
        )
        object_name = f"Advance_Payment_DO/{location}/{site}/IN/{adv_pymt_obj.bl_no}/{new_file_name}"

        # Ensure temp directory exists
        temp_dir = os.path.join(BASE_DIR, "temp/")
        os.makedirs(temp_dir, exist_ok=True)
        temp_file_path = os.path.join(temp_dir, new_file_name)

        # Write file to temp path
        with open(temp_file_path, "wb") as temp:
            temp.write(file.read())

        # Upload file to S3
        upload_file(temp_file_path, bucket_name, object_name)
    except Exception:
        logging.getLogger("error_log").error(traceback.format_exc())
        return {"errorMsg": "Unable to Upload File on S3"}

    try:
        # Start text extraction
        textract_client = boto3.client(
            "textract",
            region_name=AWS_S3_REGION_NAME,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )
        response = textract_client.start_document_text_detection(
            DocumentLocation={"S3Object": {"Bucket": bucket_name, "Name": object_name}}
        )
        job_id = response["JobId"]

        # Poll for job status
        while True:
            status_response = textract_client.get_document_text_detection(JobId=job_id)
            status = status_response.get("JobStatus", "")
            if status in ["SUCCEEDED", "FAILED"]:
                break
            time.sleep(5)

        # Handle extraction result
        if status == "SUCCEEDED":
            return _process_extracted_data(
                status_response, adv_pymt_obj, object_name, temp_file_path
            )
        else:
            raise Exception("Textract job failed")

    except Exception:
        _cleanup(bucket_name, object_name, temp_file_path)
        logging.getLogger("error_log").error(traceback.format_exc())
        return {"errorMsg": "Unable to Extract Data from Provided File"}


def _process_extracted_data(status_response, adv_pymt_obj, object_name, temp_file_path):
    pages = status_response.get("Blocks", [])
    extracted_text = "".join(
        block["Text"] + "\n" for block in pages if block["BlockType"] == "LINE"
    )

    # Validate BL number
    bl_no_match = re.search(r"[Bb][Ll]:\s*(.+)", extracted_text)
    bl_no = bl_no_match.group(1).strip() if bl_no_match else None
    if bl_no != adv_pymt_obj.bl_no:
        _cleanup(AWS_STORAGE_BUCKET_NAME, object_name, temp_file_path)
        return {
            "errorMsg": "Uploaded DO bl_no is different from the Advance Payment bl_no"
        }

    # Extract DO validity and container data
    do_validity_match = re.search(r"on or Before\s+(.+)", extracted_text)
    do_validity_str = do_validity_match.group(1).strip() if do_validity_match else None
    if do_validity_str:
        date_match = re.search(r"\d{2}/\d{2}/\d{4}", do_validity_str)
        do_validity_str = date_match.group(0) if date_match else None
    do_validity = (
        datetime.strptime(do_validity_str, "%d/%m/%Y") if do_validity_str else None
    )

    container_matches = re.findall(r"([A-Z0-9]+)\s*/\s*(\d{2})([A-Z]+)", extracted_text)

    def change_container_type(ctype):
        if ctype == "HC":
            return "H/C"
        elif ctype == "OT":
            return "O/T"
        elif ctype == "FL":
            return "F/L"
        elif ctype == "FR":
            return "F/R"
        else:
            return ctype

    extracted_data = [
        {
            "sr_no": count,
            "client": "",
            "container_no": match[0],
            "type": change_container_type(ctype=match[2]),
            "size": match[1],
            "do_validity_in_date": (
                do_validity.strftime("%d_%m_%Y") if do_validity else ""
            ),
            "do_validity_in_time": "00_00",
            "consignee": "",
            "shipper": "",
            "cargo": "",
            "remarks": "",
            "arrived": "",
        }
        for count, match in enumerate(container_matches, start=1)
    ]

    # Check payment eligibility
    remarks = None
    importable_data = extracted_data
    if extracted_data:
        size_20_data = [each for each in extracted_data if each["size"] == "20"]
        size_40_data = [each for each in extracted_data if each["size"] == "40"]
        correct_20_data_count, correct_40_data_count = len(size_20_data), len(
            size_40_data
        )
        size_20_total_amount = get_total_site_lolo_amount(
            size="20",
            count=correct_20_data_count,
            payment_data=adv_pymt_obj,
            with_gst=adv_pymt_obj.with_gst,
        )
        size_40_total_amount = get_total_site_lolo_amount(
            size="40",
            count=correct_40_data_count,
            payment_data=adv_pymt_obj,
            with_gst=adv_pymt_obj.with_gst,
        )
        total_count, total_amount = (
            correct_20_data_count + correct_40_data_count,
            size_20_total_amount + size_40_total_amount,
        )

        if (
            not adv_pymt_obj.remaining >= total_count
            or not adv_pymt_obj.remaining_amount >= total_amount
        ):
            importable_data = []
            remarks = f"Extracted data count is {len(extracted_data)} But, Advanced Payment Remaining or Amount is Not sufficient for Import"

    if not len(importable_data) == 0:
        # Save to database
        AdvancePaymentDoUpload(
            do_s3_object_name=object_name,
            do_s3_file_name=os.path.basename(object_name),
            adv_payment_id=adv_pymt_obj.pk,
            entry_type="IN",
        ).save()

    os.remove(temp_file_path)

    return {
        "importable_data": importable_data,
        "location": adv_pymt_obj.location.name,
        "site": adv_pymt_obj.site.name,
        "adv_payment_id": adv_pymt_obj.pk,
        "remarks": remarks,
    }


def _cleanup(bucket_name, object_name, temp_file_path):
    try:
        delete_file(bucket=bucket_name, object_name=object_name)
    except Exception:
        pass
    try:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
    except Exception:
        pass
