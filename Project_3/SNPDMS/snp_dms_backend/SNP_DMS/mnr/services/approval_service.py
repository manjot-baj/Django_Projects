from mnr.models import Estimate, Approval
from datetime import datetime
from common.exceptions import ValidationError


class ApprovalService:

    def approvalEntry(self, data, app_user):
        estimate_data = None
        if Estimate.checkExistById(data["estimate_id"]):
            estimate_data = Estimate.getById(data["estimate_id"])
        else:
            raise ValidationError("Data Not Exist with the given Estimate Id")

        # Date stuff
        date = None
        approved_date = None

        if not len(data["date"]) == 0:
            date = datetime.strptime(data["date"], "%Y-%m-%d").date()

        if not len(data["approved_date"]) == 0:
            approved_date = datetime.strptime(data["approved_date"], "%Y-%m-%d").date()

        # Time Stuff
        time = None
        approved_time = None

        if not len(data["time"]) == 0:
            time = datetime.strptime(data["time"], "%H:%M").time()

        if not len(data["approved_time"]) == 0:
            approved_time = datetime.strptime(data["approved_time"], "%H:%M").time()

        # Amount Stuff
        approval_amount = None
        approved_amount = None
        denial_reason = None

        if not len(data["approval_amount"]) == 0:
            approval_amount = float(data["approval_amount"])

        if not len(data["approved_amount"]) == 0:
            approved_amount = float(data["approved_amount"])

        if not len(data["denial_reason"]) == 0:
            denial_reason = data["denial_reason"]

        # Main
        if Approval.checkExistByParentId(data["estimate_id"]):
            approval_data = Approval.getByParentId(data["estimate_id"])
            if approval_data.proceed_without_approval is True:
                if data["sent_to_line"] == "True":
                    if data["is_approved"] == "True":
                        approval_data.updateWithApproved(
                            date=date,
                            time=time,
                            approved_date=approved_date,
                            approved_time=approved_time,
                            approval_amount=approval_amount,
                            approved_amount=approved_amount,
                            updated_by=app_user,
                        )
                    elif data["is_denied"] == "True":
                        approval_data.updateWithDenied(
                            date=date,
                            time=time,
                            approval_amount=approval_amount,
                            approved_amount=approved_amount,
                            updated_by=app_user,
                            denial_reason=denial_reason,
                        )
                    else:
                        approval_data.updateWithSentToLine(
                            date=date,
                            time=time,
                            approval_amount=approval_amount,
                            updated_by=app_user,
                        )
            if approval_data.sent_to_line is True:
                if data["is_approved"] == "True":
                    approval_data.updateWithApproved(
                        date=date,
                        time=time,
                        approved_date=approved_date,
                        approved_time=approved_time,
                        approval_amount=approval_amount,
                        approved_amount=approved_amount,
                        updated_by=app_user,
                    )
                if data["is_denied"] == "True":
                    approval_data.updateWithDenied(
                        date=date,
                        time=time,
                        approval_amount=approval_amount,
                        approved_amount=approved_amount,
                        updated_by=app_user,
                        denial_reason=denial_reason,
                    )
        else:
            if data["proceed_without_approval"] == "True":
                Approval.createWithoutApprovalProceed(
                    parent=estimate_data, created_by=app_user
                )
            if data["sent_to_line"] == "True":
                if data["is_approved"] == "True":
                    Approval.createWithApproved(
                        parent=estimate_data,
                        date=date,
                        time=time,
                        approved_date=approved_date,
                        approved_time=approved_time,
                        approval_amount=approval_amount,
                        approved_amount=approved_amount,
                        created_by=app_user,
                    )
                elif data["is_denied"] == "True":
                    Approval.createWithDenied(
                        parent=estimate_data,
                        date=date,
                        time=time,
                        approval_amount=approval_amount,
                        approved_amount=approved_amount,
                        denial_reason=denial_reason,
                        created_by=app_user,
                    )
                else:
                    Approval.createWithSentToLine(
                        parent=estimate_data,
                        date=date,
                        time=time,
                        approval_amount=approval_amount,
                        created_by=app_user,
                    )
