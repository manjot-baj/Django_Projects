# from rest_framework import views
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.http import HttpResponse
# from ..bulk_out_process_functions import *
# import os, openpyxl


# class UploadOutExcelSheetFile(views.APIView):

#     """Post Function will give the payload"""

#     # permission_classes = (IsAuthenticated,)

#     def post(self, request, *args, **kwargs):
#         if not request.data:
#             return Response({"errorMsg": "Please provide Data"}, status=200)
#         try:
#             data = request.data["file"]
#             response = extract_out_excel_sheet_data(data)
#             return Response(response, status=200)
#         except Exception as e:
#             return Response({"errorMsg": f"Invalid Data Provided [ {e} ]"}, status=200)
