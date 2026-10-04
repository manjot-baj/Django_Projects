from mnr.models import Estimate, Survey, TariffMaster, SurveyLine, Approval
from master.models import TypeSizeCode
from django.utils import timezone
from common.exceptions import ValidationError, AlreadyExists, ResourceNotFound
import datetime
from wistim_distim.functions import make_estimate_edi_func
from mnr.functions import *
from common.error_logging import ErrorLogging


class EstimateService:

    def createEstimate(self, data, created_by, estimate_by):
        survey_data = None
        if Survey.checkExistById(data["survey_id"]):
            survey_data = Survey.getById(data["survey_id"])
        else:
            raise ResourceNotFound("Survey not found")

        # Date stuff
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

        # Time Stuff
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

        amount = data["amount"]
        if data["amount"] == "":
            amount = None

        # Checking for draft data
        estimate_data = None
        if Estimate.checkExistByParentId(data["survey_id"]):
            if Estimate.checkDraftExistByParentId(data["survey_id"]):
                estimate_data = Estimate.getDraftByParentId(data["survey_id"])
            else:
                raise AlreadyExists("Estimate already exists")
        # Main data input
        if data["is_draft"] == "True":
            if estimate_data is not None:
                estimate_data.updateDraft(
                    created_by=created_by,
                    estimate_by=estimate_by,
                    date=date,
                    time=time,
                    amount=amount,
                )
            else:
                estimate_data = Estimate.createDraft(
                    parent=survey_data,
                    created_by=created_by,
                    estimate_by=estimate_by,
                    date=date,
                    time=time,
                    amount=amount,
                )
        elif data["is_proceed"] == "True":
            if estimate_data is not None:
                estimate_data.makeDraftToProceed(
                    created_by=created_by,
                    estimate_by=estimate_by,
                    date=date,
                    time=time,
                    amount=amount,
                )
                if not survey_data.estimate_number:
                    estimate_data.createNumber()
                else:
                    estimate_data.number = survey_data.estimate_number
                    estimate_data.est_rep_common_number = survey_data.estimate_number[
                        1:
                    ]
                    estimate_data.save(
                        update_fields=["number", "est_rep_common_number"]
                    )
            else:
                estimate_data = Estimate.create(
                    parent=survey_data,
                    created_by=created_by,
                    estimate_by=estimate_by,
                    date=date,
                    time=time,
                    amount=amount,
                )
                if not survey_data.estimate_number:
                    estimate_data.createNumber()
                else:
                    estimate_data.number = survey_data.estimate_number
                    estimate_data.est_rep_common_number = survey_data.estimate_number[
                        1:
                    ]
                    estimate_data.save(
                        update_fields=["number", "est_rep_common_number"]
                    )
        else:
            raise ValidationError("Invalid action specified")

    def updateEstimate(self, data, updated_by, estimate_by, pk):
        # Getting Estimate Data
        estimate_data = None
        if Estimate.checkExistById(pk):
            estimate_data = Estimate.getById(pk)
        else:
            raise ResourceNotFound("Estimate not found")

        # Date stuff
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

        # Time Stuff
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

        amount = data["amount"]
        if data["amount"] == "":
            amount = None

        estimate_data.estimate_by = estimate_by
        estimate_data.updated_by = updated_by
        estimate_data.current_date = date
        estimate_data.current_time = time
        estimate_data.current_amount = amount
        estimate_data.save()

        if estimate_data.parent.depot is not None:
            estimate_data.parent.depot.estimate_pending_out_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            estimate_data.parent.depot.approval_pending_in_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            estimate_data.parent.depot.pre_mnr_edi_uploaded_to_ftp = False
            estimate_data.parent.depot.save()
        else:
            estimate_data.parent.non_depot.estimate_pending_out_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            estimate_data.parent.non_depot.approval_pending_in_date_time = (
                datetime.datetime.combine(date, time).astimezone(
                    timezone.get_current_timezone()
                )
            )
            estimate_data.parent.non_depot.pre_mnr_edi_uploaded_to_ftp = False
            estimate_data.parent.non_depot.save()

    def sendEstimateToWistim(self, stock_id, site, location, date, time, app_user):
        if site.type == "DEPOT":
            estimate_list = [
                Estimate.objects.get(parent__depot__pk=id)
                for id in stock_id
                if Estimate.objects.filter(
                    parent__depot__pk=id, is_proceed=True
                ).exists()
            ]
            client = estimate_list[0].parent.depot.container.client.ref_code

            if len(estimate_list) == 0:
                raise ValidationError(
                    "Please select stock objects whose Estimate stage is completed"
                )
        else:
            estimate_list = [
                Estimate.objects.get(parent__non_depot__pk=id)
                for id in stock_id
                if Estimate.objects.filter(
                    parent__non_depot__pk=id, is_proceed=True
                ).exists()
            ]
            client = estimate_list[0].parent.non_depot.container.client.ref_code

            if len(estimate_list) == 0:
                raise ValidationError(
                    "Please select stock objects whose Estimate stage is completed"
                )

        # special condition
        if not client.lower() == "msc":
            raise ValidationError("Wistim Estimate can only be sent for MSC client")

        response = {}
        if site.vendor_code is None:
            response["vendor_code"] = ""
        else:
            response["vendor_code"] = site.vendor_code

        if site.depot_code is None:
            response["depot_code"] = ""
        else:
            response["depot_code"] = site.depot_code

        if location.country.currency is None:
            response["currency"] = ""
        else:
            response["currency"] = location.country.currency

        response["shipping_line"] = client
        tariff_object = TariffMaster.objects.select_related("location", "site").get(
            client=client, location=location, site=site
        )

        if tariff_object.labour_rate is None:
            response["labour_hourly_rate"] = 0
        else:
            response["labour_hourly_rate"] = tariff_object.labour_rate

        container_data = []
        sr_no = 1
        for estimate in estimate_list:
            single_container_data = {}
            container_object = None
            stock = None
            if estimate.parent.depot is not None:
                container_object = estimate.parent.depot.container
                stock = estimate.parent.depot
                stock.is_estimate_westim_sent = True
                stock.save()
            else:
                container_object = estimate.parent.non_depot.container
                stock = estimate.parent.non_depot
                stock.is_estimate_westim_sent = True
                stock.save()
            surveyline_data = SurveyLine.objects.filter(
                parent=estimate.parent, is_rejected=False
            )

            # Approval Check
            if Approval.checkExistByParentId(id=estimate.pk):
                approval_data = Approval.getByParentId(id=estimate.pk)
                if approval_data.sent_to_line is False:
                    approval_data.updateWithSentToLine(
                        date=date,
                        time=time,
                        approval_amount=estimate.current_amount,
                        updated_by=app_user,
                    )
                else:
                    pass
            else:
                Approval.createWithSentToLine(
                    parent=estimate,
                    date=date,
                    time=time,
                    approval_amount=estimate.current_amount,
                    created_by=app_user,
                )

            ###container_data
            single_container_data["sr_no"] = sr_no
            single_container_data["stock_id"] = stock.pk
            single_container_data["equipment_no"] = container_object.container_no

            if (
                TypeSizeCode.objects.select_related("size", "type")
                .filter(size=container_object.size, type=container_object.type)
                .exists()
            ):
                single_container_data["iso_code"] = (
                    TypeSizeCode.objects.select_related("size", "type")
                    .get(size=container_object.size, type=container_object.type)
                    .code
                )
            else:
                single_container_data["iso_code"] = ""

            if estimate.current_date is None:
                single_container_data["estimate_date_time"] = ""
            else:
                single_container_data["estimate_date_time"] = estimate.current_date

            if estimate.number is None:
                single_container_data["repair_estimate_ref_no"] = ""
            else:
                single_container_data["repair_estimate_ref_no"] = estimate.number
            ###seq_data
            repair_seq_no = 1
            seq_data = []
            for surveyline in surveyline_data:
                seq = {}
                seq["repair_sequence"] = repair_seq_no
                if (
                    surveyline.specific_location_code is None
                    or surveyline.specific_location_code == "NA"
                ):
                    seq["damage_location"] = surveyline.location_code.split("_")[0]
                else:
                    seq["damage_location"] = surveyline.specific_location_code

                if surveyline.component_code is None:
                    seq["component"] = ""
                else:
                    seq["component"] = surveyline.component_code.split("_")[0]

                if surveyline.damage_code is None:
                    seq["damage_type"] = ""
                else:
                    seq["damage_type"] = surveyline.damage_code.split("_")[0].split(
                        "/"
                    )[0]

                if surveyline.material_code is None:
                    seq["material_type"] = ""
                else:
                    seq["material_type"] = surveyline.material_code.split("_")[0]

                if surveyline.repair_code is None:
                    seq["repair_type"] = ""
                else:
                    seq["repair_type"] = surveyline.repair_code.split("_")[0]

                if surveyline.length_and_width is None:
                    length = ""
                    width = ""
                    seq["length"] = length
                    seq["width"] = width
                else:
                    length, width = get_survey_line_length_width(
                        surveyline.length_and_width
                    )
                    seq["length"] = length
                    seq["width"] = width

                if surveyline.unit is None:
                    seq["unit_type"] = ""
                else:
                    seq["unit_type"] = surveyline.unit

                if surveyline.quantity is None:
                    seq["quantity"] = ""
                else:
                    seq["quantity"] = surveyline.quantity

                if surveyline.labour_hrs_tariff is None:
                    seq["man_hrs_tariff"] = str(float(0))
                else:
                    seq["man_hrs_tariff"] = surveyline.labour_hrs_tariff

                if surveyline.material_tariff is None:
                    seq["material_tariff"] = str(float(0))
                else:
                    seq["material_tariff"] = surveyline.material_tariff

                if surveyline.wash_clean_tariff is None:
                    seq["cleaning_cost_tariff"] = str(float(0))
                else:
                    seq["cleaning_cost_tariff"] = surveyline.wash_clean_tariff

                seq_data.append(seq)
                repair_seq_no = repair_seq_no + 1
            single_container_data["seq_data"] = seq_data
            container_data.append(single_container_data)
            sr_no = sr_no + 1
        response["container_data"] = container_data

        # EDI
        # edi_file_path = None
        # if site.name == "FARIDABAD":
        #     edi_file_path = make_edi(response, site=site.name)
        # else:
        #     edi_file_path = make_edi(response)

        edi_file_path = make_estimate_edi_func(response, site.type)

        date_str = date.strftime("%Y%m%d")
        time_str = time.strftime("%H%M")
        file_name = f"{date_str}{time_str}_{client.lower()}_estimate_wistim.edi"
        dt = datetime.datetime.now().astimezone(timezone.get_current_timezone())
        upload_wistim_to_s3(
            location=location.name,
            site=site.name,
            site_type=site.type,
            process="Estimate",
            date=dt,
            object_list=estimate_list,
            file_name=file_name,
            file_path=edi_file_path,
        )

        # ftp_data = get_site_ftp_detail(
        #     site=site.name, process="estimate_wistim"
        # # )
        # if ftp_data is not None:
        #     upload_file_to_ftp_server(
        #         host=ftp_data["host"],
        #         username=ftp_data["username"],
        #         password=ftp_data["password"],
        #         working_directory=ftp_data["working_directory"],
        #         file_name=file_name,
        #         file_path=edi_file_path,
        #     )

        return edi_file_path, file_name

    def get_responsible_party(stock):
        try:
            pass
        except Exception as e:
            ErrorLogging().log_error()
