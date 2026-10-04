from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from depot.Services.search_services import ContainerSearchService
from account.permissions import HasAllowedRoles

class ContainerDetails(views.APIView):
    """
    API to search IN process container dates
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ContainerSearchService

    def post(self, request, *args, **kwargs):
        return self.service.get_container_in_details(request)


class OutContainerDetails(views.APIView):
    """
    API to search OUT process container dates or details for OUT process ready containers
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ContainerSearchService

    def post(self, request, *args, **kwargs):
        return self.service.get_container_out_details(request)


class LoloPaymentDetail(views.APIView):
    """
    API to search cheque or UTR number payment objects for handling (lolo)
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ContainerSearchService

    def post(self, request, *args, **kwargs):
        return self.service.get_lolo_payment_details(request)


class SelfTransportationPaymentDetail(views.APIView):
    """
    API to search cheque or UTR number payment objects for self-transportation,
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]
    service = ContainerSearchService

    def post(self, request, *args, **kwargs):
        return self.service.get_self_transportation_payment_details(request)
