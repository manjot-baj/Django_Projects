# models
from master.models import Country


class CountryService:
    def deleteCountry(self, pk_list):
        params = {"pk__in": pk_list}
        countries = Country.objects.getCountryQuerysetByParameter(params)

        not_deleted = [
            country.name
            for country in countries
            if country.location_country_rel.exists()
        ]
        countries.exclude(name__in=not_deleted).delete()

        return not_deleted
