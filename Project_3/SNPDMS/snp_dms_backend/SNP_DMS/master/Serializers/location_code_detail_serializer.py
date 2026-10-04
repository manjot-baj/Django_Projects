from master.models import LocationCodeDetail, Location, Site, VesselBkgNo
from depot.models import GateInHistory
from rest_framework import serializers


class LocationCodeDetailSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name_code = serializers.CharField(required=True)
    type = serializers.CharField(required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)
    depot_name = serializers.CharField(required=False)
    ova_code = serializers.CharField(required=False)

    class Meta:
        model = LocationCodeDetail
        exclude = ["id"]

    def get_data(self, data):
        location = Location.objects.get(name=data["location"]["name"])
        site = Site.objects.get(name=data["site"]["name"])
        return location, site

    def create(self, validated_data):
        location, site = self.get_data(validated_data)
        validated_data.pop("location")
        validated_data.pop("site")
        validated_data["name"], validated_data["code"] = validated_data[
            "name_code"
        ].split("-")
        return LocationCodeDetail.objects.create(
            location=location, site=site, **validated_data
        )

    def update(self, instance, validated_data):

        location, site = self.get_data(validated_data)
        name, code = validated_data["name_code"].split("-")
        instance.name_code = validated_data["name_code"]
        instance.name = name
        instance.code = code
        instance.type = validated_data["type"]
        instance.location = location
        instance.site = site
        instance.depot_name = validated_data["depot_name"]
        instance.ova_code = validated_data["ova_code"]
        instance.save()
        return instance

    def validate(self, data):
        if self.instance is None:
            if LocationCodeDetail.objects.filter(name_code=data["name_code"]).exists():
                raise serializers.ValidationError(
                    {"errorMsg": "LocationCodeDetail already exists"}
                )
        elif (
            LocationCodeDetail.objects.exclude(pk=self.instance.pk)
            .filter(name_code=data["name_code"])
            .exists()
        ):

            raise serializers.ValidationError(
                {"errorMsg": "LocationCodeDetail already exists"}
            )
        return data

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data["vessel_voyage_name"] = data.pop("vessel_voyage")
    #     data.pop("bkg")
    #     data = {key: value if value else "" for key, value in data.items()}
    #     return data
