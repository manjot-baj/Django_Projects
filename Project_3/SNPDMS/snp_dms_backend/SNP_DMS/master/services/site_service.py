from master.models import Site


class SiteService:

    def listOfSite(self, params, role):
        if role == "Admin":
            site_qs = Site.objects.all()
        else:
            site_qs = Site.objects.filter(**params)

        data = [site.get_site_detail() for site in site_qs]
        return data

    def deleteSite(self, queryset):
        not_deleted = []
        for site in queryset:
            if any(
                [
                    site.client_site_rel.exists(),
                    site.user_site_rel.exists(),
                    # site.billing_site_rel.exists(),
                    site.customer_bill_site_rel.exists(),
                    site.container_site_rel.exists(),
                    site.non_depot_container_site_rel.exists(),
                    site.handling_charge_site_rel.exists(),
                    site.transportation_charge_site_rel.exists(),
                    # site.ground_rent_site_rel.exists(),
                    site.vessel_bkgno_site_rel.exists(),
                    site.loc_code_site_rel.exists(),
                ]
            ):
                not_deleted.append(site.name)
            else:
                site.delete()

        return not_deleted
