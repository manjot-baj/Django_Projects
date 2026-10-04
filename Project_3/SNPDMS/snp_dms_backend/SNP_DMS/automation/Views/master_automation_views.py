from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import traceback, logging


from master.models import (
    Location,
    Site,
    Country,
    ExportCargoType,
    ContainerSize,
    ContainerType,
    VesselBkgNo,
    Transporter,
)
from master.models_two import Client
from mnr.models import MnrStaff
from account.permissions import HasAllowedRoles


class MasterDependencyCheck(views.APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = [
        "Automation",
        "Admin",
    ]

    def check_remark(self, name, obj_list, dependent_list):
        remark = [
            name
            for name, condition in zip(obj_list, dependent_list)
            if condition is True
        ]
        return remark

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            master_name = data["master_name"]
            name = data["name"]
            if master_name not in ["Location", "Country"]:
                location = Location.objects.get(name=data["location"])
            if master_name not in ["Location", "Country", "Site"]:
                site = Site.objects.get(name=data["site"])
            if master_name == "Location":
                location_object = Location.objects.get(name=name)
                location_dependent_list = [
                    location_object.site_location_rel.exists(),
                    location_object.user_location_rel.exists(),
                    location_object.client_location_rel.exists(),
                    location_object.handling_charge_location_rel.exists(),
                    location_object.transportation_charge_location_rel.exists(),
                    location_object.transporter_location_rel.exists(),
                    location_object.vessel_bkgno_location_rel.exists(),
                    location_object.loc_code_location_rel.exists(),
                    location_object.container_location_rel.exists(),
                    location_object.non_depot_container_location_rel.exists(),
                    location_object.gate_in_location_rel.exists(),
                    location_object.gate_out_location_rel.exists(),
                    location_object.customer_bill_location_rel.exists(),
                    location_object.customer_bill_invoice_location_rel.exists(),
                ]

                location_obj_list = [
                    "Site",
                    "AccountUser",
                    "Client",
                    "HandlingCharge",
                    "TransportationCharge",
                    "Transporter",
                    "VesselBkgNo",
                    "LocationCodeDetail",
                    "Container",
                    "NonDepotContainer",
                    "GateIn",
                    "GateOut",
                    "CustomerBill",
                    "CustomerBillInvoice",
                ]

                remarks = self.check_remark(
                    name,
                    obj_list=location_obj_list,
                    dependent_list=location_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )
            elif master_name == "Site":
                site_obj = Site.objects.get(name=name, location=location)
                site_dependent_list = [
                    site_obj.client_site_rel.exists(),
                    site_obj.user_site_rel.exists(),
                    site_obj.customer_bill_site_rel.exists(),
                    site_obj.container_site_rel.exists(),
                    site_obj.non_depot_container_site_rel.exists(),
                    site_obj.handling_charge_site_rel.exists(),
                    site_obj.transportation_charge_site_rel.exists(),
                    site_obj.vessel_bkgno_site_rel.exists(),
                    site_obj.loc_code_site_rel.exists(),
                ]
                site_obj_list = [
                    "Client",
                    "AccountUser",
                    "CustomerBill",
                    "Container",
                    "NonDepotContainer",
                    "HandlingCharge",
                    "TransportationCharge",
                    "VesselBkgNo",
                    "LocationCodeDetail",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=site_obj_list,
                    dependent_list=site_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )
            elif master_name == "Client":
                client_obj = Client.objects.get(name=name, location=location, site=site)
                client_dependent_list = [
                    client_obj.customer_bill_client_rel.exists(),
                    client_obj.customer_bill_customer_rel.exists(),
                    client_obj.client_customer_bill_invoice_rel.exists(),
                    client_obj.client_parent_child_company_rel.exists(),
                    client_obj.container_client_rel.exists(),
                    client_obj.non_depot_container_client_rel.exists(),
                    client_obj.adv_handling_payment_client_rel.exists(),
                    client_obj.pre_gatein_client_rel.exists(),
                    hasattr(client_obj, "fin_account_customer"),
                    client_obj.handling_client_rel.exists(),
                    client_obj.self_transportation_client_rel.exists(),
                    client_obj.client_representative_rel.exists(),
                    client_obj.client_document_rel.exists(),
                    client_obj.client_handling_charge_rel.exists(),
                    client_obj.client_transportation_charge_rel.exists(),
                ]
                client_obj_list = [
                    "CustomerBill",
                    "CustomerBill",
                    "CustomerBillInvoice",
                    "ClientChildCompany",
                    "Container",
                    "NonDepotContainer",
                    "AdvancedHandlingPayment",
                    "PreGateIn",
                    "CustomerFinAccount",
                    "Handling",
                    "SelfTransportation",
                    "ClientRepresentative",
                    "ClientDocument",
                    "HandlingCharge",
                    "TransportationCharge",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=client_obj_list,
                    dependent_list=client_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "Country":
                country_obj = Country.objects.get(name=name)
                country_dependent_list = [
                    country_obj.location_country_rel.exists(),
                ]
                country_obj_list = [
                    "location",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=country_obj_list,
                    dependent_list=country_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "ExportCargoType":
                export_cargo = ExportCargoType.objects.get(name=name)
                export_cargo_dependent_list = [
                    export_cargo.gate_in_export_cargo.exists(),
                ]
                export_cargo_obj_list = [
                    "gate_in",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=export_cargo_obj_list,
                    dependent_list=export_cargo_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "RefCode":
                ref_code_dependent_list = [
                    Client.objects.filter(ref_code=name).exists(),
                ]
                ref_code_obj_list = [
                    "client",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=ref_code_obj_list,
                    dependent_list=ref_code_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )
            elif master_name == "ContainerSize":
                size_object = ContainerSize.objects.get(name=name)
                size_dependent_list = [
                    size_object.container_size_rel.exists(),
                    size_object.non_depot_container_size_rel.exists(),
                    size_object.handling_charge_container_size_rel.exists(),
                    size_object.transportation_charge_container_size_rel.exists(),
                    size_object.ground_rent_container_size_rel.exists(),
                    size_object.ts_code_size_rel.exists(),
                ]
                size_obj_list = [
                    "container",
                    "non_depot_container",
                    "handling_charge",
                    "transportation_charge",
                    "ground_rent",
                    "ts_code",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=size_obj_list,
                    dependent_list=size_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "ContainerType":
                type_object = ContainerType.objects.get(name=name)
                type_dependent_list = [
                    type_object.container_type_rel.exists(),
                    type_object.non_depot_container_type_rel.exists(),
                    type_object.ts_code_type_rel.exists(),
                ]
                type_obj_list = [
                    "container",
                    "non_depot_container",
                    "ts_code",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=type_obj_list,
                    dependent_list=type_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "Transporter":
                transporter_object = Transporter.objects.get(name=name)
                tranporter_dependent_list = [
                    transporter_object.gate_in_transporter_rel.exists(),
                    transporter_object.self_transportation_transporter_rel.exists(),
                    transporter_object.gate_out_transporter_rel.exists(),
                ]
                tranporter_obj_list = [
                    "gate_in",
                    "self_transportation",
                    "gate_out",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=tranporter_obj_list,
                    dependent_list=tranporter_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "VesselBookingNumber":
                vessel_bkgno_object = VesselBkgNo.objects.get(number=name)
                vessel_bkgno_dependent_list = [
                    vessel_bkgno_object.vessel_voyage_bkgno_rel.exists()
                ]
                vessel_bkgno_obj_list = [
                    "vessel_voyage",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=vessel_bkgno_obj_list,
                    dependent_list=vessel_bkgno_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            elif master_name == "MNRStaff":
                mnr_staff = MnrStaff.objects.get(firstName=name)
                mnr_staff_dependent_list = [
                    mnr_staff.survey_by_staff_rel.exists(),
                    mnr_staff.estimate_by_staff_rel.exists(),
                    mnr_staff.repair_man_power_staff_rel.exists(),
                ]
                mnr_staff_obj_list = [
                    "survey",
                    "estimate",
                    "repair_man_power",
                ]
                remarks = self.check_remark(
                    name,
                    obj_list=mnr_staff_obj_list,
                    dependent_list=mnr_staff_dependent_list,
                )
                if remarks:
                    return Response(
                        {"errorMsg": f"{name} have following relations {remarks}"},
                        status=200,
                    )

            return Response(
                {"successMsg": "Data don't have any relation, you can delete data"},
                status=200,
            )
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            return Response({"errorMsg": "Data Not Found"}, status=200)
