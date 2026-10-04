from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import *
from account.models import AccountUser
from depot.functions_two import *


class NonDepotContainerDetails(views.APIView):
    """
    Api to search IN process container dates,
    the post function will give requested container all IN process Dates
    according to location and site
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            container_no = request.data["container_no"]
            user = request.user
            app_user = AccountUser.objects.get(username=user.username)
            try:
                location_str = request.data["location"]
                site_str = request.data["site"]
                location = Location.objects.get(name=location_str)
                site = Site.objects.get(name=site_str)
            except:
                location = app_user.location
                site = app_user.site
            try:
                container_object = NonDepotContainer.objects.get(
                    container_no=container_no, location=location, site=site
                )
                date = [
                    x.in_date.strftime("%d/%m/%Y")
                    for x in NonDepotGateIn.objects.filter(container=container_object)
                ]
                return Response(
                    {"container_no": container_object.container_no, "dates": date},
                    status=200,
                )
            except Exception as e:
                return Response({"errorMsg": f"Data Not Found [{e}]"}, status=200)
        except Exception as e:
            return Response({"errorMsg": f"Invalid credentials [{e}]"}, status=200)
