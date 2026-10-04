from edi.cycle_functions import make_zim_repair_edi
from edi.format_functions import make_edi_file
from depot.models import ContainerStock
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging, traceback, os, random
from django.http import HttpResponse

from account.permissions import HasAllowedRoles

class ZimRepairEdiApiViews(views.APIView):

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def post(self, request, *args, **kwargs):
        try:
            pk_list = request.data.get("pk_list")
            stocks = ContainerStock.objects.filter(pk__in=pk_list, container__client__ref_code="ZIM")
            
            if len(stocks) == 0:
                return Response({"errorMsg": "Only Zim line containers are allowed"}, status=200)
            
            zim_context = make_zim_repair_edi(stocks)
            temp_file_path = None
            if zim_context["content"] is not None:
                temp_file_path = make_edi_file(
                    ref_code=zim_context["ref_code"],
                    site_code=zim_context["site_code"],
                    date=zim_context["date"],
                    time=zim_context["time"],
                    content=zim_context["content"],
                    move_code=None,
                    back=True,
                )
            email_data = zim_context["email_data"]
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/txt"
                )
                file_response[
                    "Content-Disposition"
                ] = f'attachment; filename="zim_repair_edi_{random.randint(100000, 999999)}.edi"'

                os.remove(temp_file_path)
                return file_response
        except Exception as e:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": f"Data Not Found {e}"}, status=200)

