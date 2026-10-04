# other imports
from wkhtmltopdf.views import PDFTemplateResponse
from datetime import datetime

# django
from django.db import transaction

# rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# error handling
from common.exceptions import ResourceNotFound, AlreadyExists, ValidationError
from common.error_logging import ErrorLogging

# services
from procurement.services.requisition_services import RequisitionService
from procurement.services.bills_services import BillService

# model
from procurement.models import (
    Requisition,
    RequisitionLine,
    RequisitionHistoryLine,
    SharedClass,
    SharedClass,
)

from account.permissions import HasAllowedRoles


class CreateRequisition(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        date_str = payload.get("date")
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except:
            raise ValidationError("Please check date format")
        params = {
            "order_no": payload.get("order_no"),
            "date": date,
            "status": payload.get("status"),
            "total_amount": payload.get("total_amount"),
            "location_id": payload.get("location_id"),
            "site_id": payload.get("site_id"),
        }
        return params

    def getLineParams(self, payload, parent):

        line_params = {
            "parent": parent,
            "tool_id": payload.get("tool_id"),
            "required_qty": payload.get("required_qty"),
            "received_qty": payload.get("received_qty"),
            "remaining_qty": payload.get("remaining_qty"),
            "amount": payload.get("amount"),
            "remarks": payload.get("remarks"),
            "rate": payload.get("rate"),
        }
        return line_params

    def post(self, request, *args, **kwargs):
        try:
            payload = request.data
            params = self.getParams(request.data)
            if not "pk" in payload.keys():
                if SharedClass().checkOrderNoExistence(
                    "Requisition",
                    payload.get("order_no"),
                    params["location_id"],
                    params["site_id"],
                ):
                    raise ValidationError("Enter another order no!")

            with transaction.atomic():
                requisition = Requisition.manager.createRequisition(params)
                for each in request.data.get("requisition_line"):
                    if float(each.get("required_qty")) < 0:
                        raise ValidationError("required_qty cannot be less than 0")
                    if float(each.get("received_qty")) < 0:
                        raise ValidationError("received_qty cannot be less than 0")

                    line_params = self.getLineParams(each, requisition)
                    RequisitionLine.manager.createRequisitionLine(line_params)

            return Response(
                {
                    "message": "Requisition created succesfully",
                    "requisition_pk": requisition.pk,
                },
                status=status.HTTP_201_CREATED,
            )
        except ValidationError as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetRequisition(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:

            requisiton = Requisition.manager.getRequisitionById(pk)

            requisition_data = RequisitionService().requisitionData(requisiton)

            requisition_line = RequisitionLine.manager.getRequisitionLines(requisiton)

            requisition_line_data = RequisitionService().requisitionLineData(
                requisition_line
            )

            requisition_history_line = (
                RequisitionHistoryLine.manager.getRequisitionHistoryLines(requisiton)
            )

            requisition_history_line_data = (
                RequisitionService().requisitionHistoryLineData(
                    requisition_history_line
                )
            )
            data = requisition_data
            data["requisition_line"] = requisition_line_data
            data["requisition_history_line"] = requisition_history_line_data

            return Response(data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {
                    "message": "An unexpected error occurred. Please try again later.",
                    "data": None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateRequisition(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def put(self, request, pk, *args, **kwargs):
        try:
            data = request.data
            location = data.get("location_id")
            site = data.get("site_id")
            requisition_line = data.get("requisition_line")
            requisition_history_line = data.get("requisition_history_line")

            with transaction.atomic():
                requisition = Requisition.manager.getRequisitionById(pk)
                instance = RequisitionService().updateRequisition(
                    request.data, location, site, requisition
                )

                for each in requisition_line:
                    required_qty = each.get("required_qty")
                    received_qty = each.get("received_qty")

                    if float(required_qty) < 0:
                        raise ValidationError("required_qty cannot be less than 0")
                    else:
                        pass
                    if float(received_qty) < 0:
                        raise ValidationError("received_qty cannot be less than 0")
                    else:
                        pass

                line = RequisitionService().updateRequisitionLine(
                    instance, requisition_line, location, site
                )

                if data.get("status") in ["PARTIAL CLOSED", "CLOSED"]:
                    RequisitionService().createRequisitionHistory(
                        instance, requisition_history_line
                    )

            requisition_data = RequisitionService().requisitionData(instance)

            requisition_line = RequisitionLine.manager.getRequisitionLines(instance)

            requisition_line_data = RequisitionService().requisitionLineData(
                requisition_line
            )

            requisition_history_line = (
                RequisitionHistoryLine.manager.getRequisitionHistoryLines(instance)
            )

            requisition_history_line_data = (
                RequisitionService().requisitionHistoryLineData(
                    requisition_history_line
                )
            )
            data = requisition_data
            data["requisition_line"] = requisition_line_data
            data["requisition_history_line"] = requisition_history_line_data

            return Response(
                {"message": "Requisition updated succesfully", "data": data},
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DeleteRequisition(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def delete(self, request, pk, *args, **kwargs):
        try:
            instance = Requisition.manager.getRequisitionById(pk=pk)
            if instance.status in ["PARTIAL CLOSED", "CLOSED"]:
                raise ValidationError("Requisition Approved cannot delete data")
            instance.delete()

            return Response(
                {"successMsg": "Requisition deleted succesfully"},
                status=status.HTTP_200_OK,
            )
        except ValidationError as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ListRequisition(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            main_data = RequisitionService().allRequisition(request.data)
            return Response(main_data, status=status.HTTP_200_OK)
        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BillUpload(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            file = request.FILES["file"]
            pk = request.POST.get("pk")
            with transaction.atomic():
                bill_upload = BillService().uploadBillToS3(file, pk)
                if bill_upload:
                    return Response(
                        {"successMsg": "File uploaded successfully"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    raise ValidationError("File not uploaded! Please try again later.")
        except ResourceNotFound as e:
            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BillDownload(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:

            file_response = BillService().downloadBillFromS3(pk)

            return file_response

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RequisitionBillData(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        location = payload.get("location_id")
        site = payload.get("site_id")
        from_received_date = payload.get("from_received_date")
        to_received_date = payload.get("to_received_date")
        from_bill_date = payload.get("from_bill_date")
        to_bill_date = payload.get("to_bill_date")
        bill_no = payload.get("bill_no")
        if (
            (from_received_date and to_received_date)
            or (from_bill_date and to_bill_date)
            or bill_no
        ):
            params = {
                "parent__location_id": location,
                "parent__site_id": site,
            }
            if from_received_date and to_received_date:

                try:
                    params["received_date__range"] = (
                        datetime.strptime(from_received_date, "%Y-%m-%d"),
                        datetime.strptime(to_received_date, "%Y-%m-%d"),
                    )
                except:
                    raise ValidationError("Received Date Format is not correct.")
            if from_bill_date and to_bill_date:
                try:
                    params["bill_date__range"] = (
                        datetime.strptime(from_bill_date, "%Y-%m-%d"),
                        datetime.strptime(to_bill_date, "%Y-%m-%d"),
                    )
                except:
                    raise ValidationError("Bill Date format is not correct.")
            if bill_no:
                params["bill_no"] = bill_no
        return params

    def post(self, request, *args, **kwargs):
        try:
            params = self.getParams(request.data)

            data = RequisitionService().getBillData(params)

            return Response(data, status=status.HTTP_200_OK)

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValidationError as e:

            return Response(
                {"message": str(e.message)}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ApprovalPDF(APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def get(self, request, pk, *args, **kwargs):
        try:
            requisition = Requisition.manager.getRequisitionById(pk=pk)
            requisition_line = (
                RequisitionLine.manager.getRequisitionLineDataForApprovalPdf(
                    requisition
                )
            )
            user = SharedClass().getAccountUser(request.user)
            indentor_name = f"{user.firstname} {user.lastname}"
            designation = user.role.name
            contact_no = user.mobile_no or ""

            context = RequisitionService().getPdfData(
                requisition_line, requisition, indentor_name, designation, contact_no
            )
            response = PDFTemplateResponse(
                request=request,
                template="procurement/approval.html",
                filename="foo.pdf",
                context=context,
                show_content_in_browser=True,
                cmd_options={
                    "margin-top": 50,
                },
            )
            return response

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateRequisitionHistory(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            RequisitionHistoryLine.manager.updateRequisitionHistory(
                request.data.get("pk"), request.data.get("total_amount")
            )
            return Response(
                {"successMsg": "Total Amount Updated successfully"},
                status=status.HTTP_200_OK,
            )

        except ResourceNotFound as e:

            return Response(
                {"message": str(e.message), "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:

            ErrorLogging().log_error()

            return Response(
                {"message": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
