from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import *
from depot.functions_two import *
from depot.models import Container


class NonDepotContainerNoValidator(views.APIView):
    """
    Api to see whether the container provided is Valid or Not Valid,
    the post function will validate the container no
    by passing through the validation algorithm function
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            container_no = request.data["container_no"]
            location = request.data["location"]
            if len(container_no) == 0:
                return Response({"errorMsg": "Please Enter Container_no"}, status=200)
            if not len(container_no) == 11:
                return Response(
                    {
                        "errorMsg": "Invalid Entry, "
                        "Please Enter Container_no having first 4 uppercase alphabets and "
                        "rest 7 digits"
                    },
                    status=200,
                )
            if check_char_digit(container_no) is False:
                return Response(
                    {
                        "errorMsg": "Invalid Entry, "
                        "Please Enter Container_no having first 4 uppercase alphabets and "
                        "rest 7 digits"
                    },
                    status=200,
                )
            validation = check_digit(container_no=container_no)
            if validation is True:
                if NonDepotContainer.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    return Response(
                        {"errorMsg": "Container_no Valid but already exist."},
                        status=200,
                    )
                else:
                    return Response({"successMsg": "Container_no Valid"}, status=200)
            else:
                if NonDepotContainer.objects.filter(
                    container_no=container_no, status="IN", location__name=location
                ).exists():
                    return Response(
                        {"errorMsg": "Container_no Not Valid but already exist."},
                        status=200,
                    )
                else:
                    return Response({"errorMsg": "Container_no Not Valid"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [ {str(e)} ]"}, status=200)
