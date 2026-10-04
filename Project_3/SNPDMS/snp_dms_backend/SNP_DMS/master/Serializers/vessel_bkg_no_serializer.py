from master.models import VesselBkgNo, Location, Site
from rest_framework import serializers


class VesselBkgNoSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    date = serializers.DateField(required=True, format="%Y-%m-%d")
    number = serializers.CharField(required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)

    class Meta:
        model = VesselBkgNo
        exclude = ["id"]

    def get_data(self, data):
        location = Location.objects.get(name=data["location"]["name"])
        site = Site.objects.get(name=data["site"]["name"])
        return location, site

    def create(self, validated_data):
        location, site = self.get_data(validated_data)
        validated_data.pop("location")
        validated_data.pop("site")
        return VesselBkgNo.objects.create(
            location=location, site=site, **validated_data
        )

    def update(self, instance, validated_data):

        location, site = self.get_data(validated_data)
        validated_data.pop("location")
        validated_data.pop("site")
        instance.number = validated_data["number"]
        instance.date = validated_data["date"].strftime("%Y-%m-%d")
        instance.location = location
        instance.site = site
        instance.save()
        return instance

    def validate(self, data):
        obj = VesselBkgNo.objects.select_related("location", "site")
        if self.instance is None:
            if obj.filter(
                number=data["number"],
            ).exists():
                raise serializers.ValidationError(
                    {"errorMsg": "VesselBkgNo already exists"}
                )
        elif (
            obj.exclude(pk=self.instance.pk)
            .filter(
                number=data["number"],
            )
            .exists()
        ):

            raise serializers.ValidationError(
                {"errorMsg": "VesselBkgNo already exists"}
            )
        return data
