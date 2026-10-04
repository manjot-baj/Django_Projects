from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from .functions import *
import os, openpyxl
import traceback, logging
from account.permissions import HasAllowedRoles
class UploadExcelFile(views.APIView):

    """Post Function will give the edi"""

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            data = request.data["file"]
            if data.name.endswith(".xlsx"):

                ps = openpyxl.load_workbook(data)
                wistim = None
                repair_distim = None
                try:
                    ps["Sheet1"]
                    wistim = True
                    ps.close()
                except:
                    try:
                        ps["RepairSheet"]
                        repair_distim = True
                        ps.close()
                    except:
                        error_log = logging.getLogger("error_log")
                        error_log.error(traceback.format_exc())
                        return Response(
                            {
                                "errorMsg": "Data file is corrupted, unable to extract data"
                            },
                            status=200,
                        )

                if wistim is True:
                    extracted_data = extract_excel_data(input_excel=data)
                    if extracted_data == "Header Not Found":
                        return Response(
                            {
                                "errorMsg": "Data file is corrupted, unable to extract data"
                            },
                            status=200,
                        )
                    else:
                        edi_file_path = make_edi(extracted_data)
                        with open(edi_file_path, "r") as temp:
                            file_response = HttpResponse(
                                temp.read(), content_type=f"application/edi"
                            )
                            file_response[
                                "Content-Disposition"
                            ] = f'attachment; filename="msc.edi"'
                            os.remove(edi_file_path)
                        return file_response

                if repair_distim is True:
                    extracted_data = extract_repair_distim_excel_data(input_excel=data)
                    if extracted_data == "Header Not Found":
                        return Response(
                            {
                                "errorMsg": "Data file is corrupted, unable to extract data"
                            },
                            status=200,
                        )
                    else:
                        edi_file_path = make_repair_distim_edi(extracted_data)
                        with open(edi_file_path, "r") as temp:
                            file_response = HttpResponse(
                                temp.read(), content_type=f"application/edi"
                            )
                            file_response[
                                "Content-Disposition"
                            ] = f'attachment; filename="msc.edi"'
                            os.remove(edi_file_path)
                        return file_response
            else:
                extracted_data = extract_edi_data(data)
                if extracted_data is None:
                    return Response(
                        {"errorMsg": "Data file is corrupted, unable to extract data"},
                        status=200,
                    )
                else:
                    excel_file_path = make_excel_data(extracted_data)
                    with open(excel_file_path, "rb") as temp:
                        file_response = HttpResponse(
                            temp.read(), content_type=f"application/xlsx"
                        )
                        file_response[
                            "Content-Disposition"
                        ] = f'attachment; filename="msc.xlsx"'
                        os.remove(excel_file_path)
                    return file_response
        except Exception as e:
            return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)

