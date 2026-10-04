# models
from master.models import Location


class LocationService:

    def listOfLocation(self, role, name, params):
        if role == "Admin" and name:
            location_qs = Location.objects.getLocationQuerysetByParams(params)
        elif role == "Admin":
            location_qs = Location.objects.all()
        else:
            location_qs = Location.objects.getLocationQuerysetByParams(params)

        return [location.get_location_detail() for location in location_qs]

    def deleteLocation(self, queryset):
        not_deleted = []
        for location in queryset:

            if any(
                [
                    location.site_location_rel.exists(),
                    location.user_location_rel.exists(),
                    location.client_location_rel.exists(),
                    location.handling_charge_location_rel.exists(),
                    location.transportation_charge_location_rel.exists(),
                    # location.ground_rent_location_rel.exists(),
                    location.transporter_location_rel.exists(),
                    location.vessel_bkgno_location_rel.exists(),
                    location.loc_code_location_rel.exists(),
                    location.container_location_rel.exists(),
                    location.non_depot_container_location_rel.exists(),
                    location.gate_in_location_rel.exists(),
                    location.gate_out_location_rel.exists(),
                    # location.billing_location_rel.exists(),
                    # location.location_invoice_rel.exists(),
                    # location.location_invoice_no_rel.exists(),
                    location.customer_bill_location_rel.exists(),
                    location.customer_bill_invoice_location_rel.exists(),
                ]
            ):
                not_deleted.append(location.name)
            else:
                location.delete()
        return not_deleted
