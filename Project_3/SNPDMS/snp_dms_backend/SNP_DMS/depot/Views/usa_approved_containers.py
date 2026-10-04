from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from SNP_DMS.settings.base import BASE_DIR
import xlsxwriter, os
from SNP_DMS.settings.base import BASE_DIR
from depot.models import ContainerStock
from master.models import Site
from report.xlsx_function2 import get_merge_format, get_merge_format2, get_merge_format3

from account.permissions import HasAllowedRoles
class USAApprovedContainerSheet(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    def getParams(self, payload):
        params = {
            "usa_approval_container": True,
            "container__location__name": payload.get("location"),
            "container__site__name": payload.get("site"),
        }
        return params

    def getObjectList(self, params):
        return ContainerStock.objects.filter(**params).values(
            "gate_in__in_date",
            "gate_in__in_time",
            "container__container_no",
            "container__size__name",
            "container__type__name",
            "status",
            "stage",
            "container__manufacturing_date",
            "gate_in__grade"
        )


    def getDfData(self, data_object_list):
        df_data = [
            [
                i + 1,
                each.get("gate_in__in_date").strftime("%b %d %Y")
                + " "
                + each.get("gate_in__in_time").strftime("%I:%M %p"),
                each.get("container__container_no", ""),
                each.get("container__size__name"),
                each.get("container__type__name"),
                each.get("container__manufacturing_date").strftime("%b %d %Y"),
                each.get("status", ""),
                each.get("stage", ""),
                each.get("gate_in__grade", ""),
            ]
            for i, each in enumerate(data_object_list, start=0)
        ]
        df_data = df_data or [["" for _ in range(9)]]
        return df_data

    def createUsaContainerSheet(self, df_data, location, site):
        base_temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(base_temp_dir, exist_ok=True)

        temp_file_path = os.path.join(base_temp_dir, f"usa_approved_containers.xlsx")

        workbook = xlsxwriter.Workbook(temp_file_path)
        stock_sheet = workbook.add_worksheet("USA APPROVED CONTAINER SHEET")

        merge_format = get_merge_format(workbook)
        merge_format2 = get_merge_format2(workbook)
        merge_format3 = get_merge_format3(workbook)
    
        site = Site.objects.get(name=site,location__name=location)

        stock_sheet.merge_range("A1:U2", "Golden Horn Containers Service", merge_format)
        stock_sheet.merge_range("A3:U3", site.address, merge_format2)

        stock_sheet.merge_range(
            "A4:U4", "REPORT NAME : USA APPROVED CONTAINERS", merge_format3
        )
        stock_sheet.merge_range("A5:U5", None, merge_format3)
        stock_sheet.merge_range(
            "A6:U6",
            f"LOCATION : {location} , SITE: {site}",
            merge_format3,
        )
        stock_sheet.merge_range("A7:U7", None, merge_format3)

        stock_sheet.add_table(
            f"A9:I{9 + len(df_data)}",
            {
                "data": df_data,
                "columns": [
                    {"header": "Sr No."},
                    {"header": "Gate In Date Time"},
                    {"header": "Container No"},
                    {"header": "Size"},
                    {"header": "Type"},
                    {"header": "Manufacturing Date"},
                    {"header": "Status"},
                    {"header": "Stage"},
                    {"header": "Grade"},
                ],
            },
        )

        workbook.close()
        return temp_file_path

    def post(self, request, *args, **kwargs):
        params = self.getParams(request.data)

        stock = self.getObjectList(params)

        df_data = self.getDfData(stock)

        temp_file_path = self.createUsaContainerSheet(
            df_data, request.data["location"], request.data["site"]
        )

        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/xlsx")
            file_response[
                "Content-Disposition"
            ] = f'attachment; filename="usa_approved_containers.xlsx"'
            os.remove(temp_file_path)
        return file_response