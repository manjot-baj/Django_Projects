from master.models import CarrierCode, Location, Site
from rest_framework import serializers


class CarrierCodeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    code = serializers.CharField(required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)

    class Meta:
        model = CarrierCode
        exclude = ["id"]

    def get_data(self, data):
        location = Location.objects.get(name=data.pop("location")["name"])
        site = Site.objects.get(name=data.pop("site")["name"])
        return location, site

    def create(self, validated_data):
        location, site = self.get_data(validated_data)
        return CarrierCode.objects.create(
            location=location, site=site, **validated_data
        )

    def update(self, instance, validated_data):

        location, site = self.get_data(validated_data)
        instance.code = validated_data.pop("code")
        instance.location = location
        instance.site = site
        instance.save()
        return instance

    def validate(self, data):

        if (
            self.instance is None
            and CarrierCode.objects.filter(code=data["code"]).exists()
            or self.instance is not None
            and CarrierCode.objects.exclude(pk=self.instance.pk)
            .filter(code=data["code"])
            .exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "CarrierCode already exists"}
            )
        return data

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data["vessel_voyage_name"] = data.pop("vessel_voyage")
    #     data.pop("bkg")
    #     data = {key: value if value else "" for key, value in data.items()}
    #     return data
