from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from account.models import AccountUser, Role
from master.models import (
    CarrierCode,
    ContainerType,
    ContainerSize,
    Location,
    Transporter,
    Site,
    RefCodeMaster,
    Country,
    VesselBkgNo,
)
from master.models_two import (
    Client,
    ClientAbbreviation,
    HandlingCharge,
    TransportationCharge,
    GroundRent,
)
from billing_invoice.models import CustomerBill
from depot.lolo_finance_models import PreGateIn, PreGateOut
from depot.models import Container, ContainerStock, ExportCargoType
from depot.Services.form_services import DependencyService
from common.functions import cache_api_view
from django.core.cache import cache
from account.permissions import HasAllowedRoles


class ContainerNoValidator(views.APIView):
    """
    API to validate whether the provided container number is valid and check its existence.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "Loaded Yard"]
    service = DependencyService

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        try:
            container_no = request.data.get("container_no")
            location = request.data.get("location")
            response_data, status_code = self.service.validate_container_number(
                container_no, location
            )
            return Response(response_data, status=status_code)
        except Exception as e:
            return Response({"errorMsg": f"Data Not Found [{str(e)}]"}, status=200)


class InformClientDependency(views.APIView):
    """
    API to retrieve client-dependent data for form population.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User"]

    service = DependencyService

    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        location_str = request.data.get("location")
        site_str = request.data.get("site")
        return self.service.get_client_dependency_data(
            request.user, location_str, site_str
        )


class InformDependency(views.APIView):
    """
    API to retrieve all form-dependent data, optionally filtered by get_list.
    """

    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Admin",
        "Location Admin",
        "Site Admin",
        "Depot User",
        "Surveyor",
        "MNR Team",
        "Repair",
        "Automation",
        "Analytics",
        "Loaded Yard",
    ]

    service = DependencyService

    @cache_api_view("inform_dropdown", time=86400)
    def post(self, request, *args, **kwargs):
        if not request.data:
            return Response({"errorMsg": "Please provide Data"}, status=200)
        location_str = request.data.get("location")
        site_str = request.data.get("site")
        get_list = request.data.get("get_list", None)
        return self.service.get_form_dependency_data(
            request.user, location_str, site_str, get_list
        )


@receiver(post_save)
def inform_dropdown_save(sender, instance, created, **kwargs):
    if sender in [
        Client,
        HandlingCharge,
        TransportationCharge,
        GroundRent,
        CarrierCode,
        Transporter,
        AccountUser,
    ]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_inform_dropdown_{location}_{site}_movement")
        cache.delete(f"request_body_inform_dropdown_{location}_{site}_movement")
    elif sender in [
        Country,
        Location,
        Site,
        Role,
        ContainerSize,
        ContainerType,
        RefCodeMaster,
        ClientAbbreviation,
        ExportCargoType,
        ContainerStock,
    ]:
        all_keys = [k.replace(":1:", "") for k in cache._cache.keys()]
        dropdown_keys = [key for key in all_keys if "inform_dropdown" in key]
        for key in dropdown_keys:
            cache.delete(key)


@receiver(post_delete)
def inform_dropdown_delete(sender, instance, **kwargs):
    if sender in [
        Client,
        HandlingCharge,
        TransportationCharge,
        GroundRent,
        CarrierCode,
        Transporter,
        AccountUser,
    ]:
        location = instance.location
        site = instance.site
        cache.delete(f"response_inform_dropdown_{location}_{site}_movement")
        cache.delete(f"request_body_inform_dropdown_{location}_{site}_movement")
    elif sender in [
        Country,
        Location,
        Site,
        Role,
        ContainerSize,
        ContainerType,
        RefCodeMaster,
        ClientAbbreviation,
        ExportCargoType,
        ContainerStock,
    ]:
        all_keys = [k.replace(":1:", "") for k in cache._cache.keys()]
        dropdown_keys = [key for key in all_keys if "inform_dropdown" in key]
        for key in dropdown_keys:
            cache.delete(key)
