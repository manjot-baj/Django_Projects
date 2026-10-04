from master.models_two import GroundRent
from master.models import Location, Site, ContainerSize
from rest_framework import serializers


class GroundRentSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    client_ref_code = serializers.CharField(required=True)
    size = serializers.CharField(source="size.name", required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)
    day_1_to_30_amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2
    )
    day_31_to_60_amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2
    )
    day_61_to_90_amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2
    )
    day_91_to_120_amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2
    )
    day_over_120_amount = serializers.DecimalField(
        required=True, max_digits=10, decimal_places=2
    )

    class Meta:
        model = GroundRent
        exclude = ["id"]

    def validate(self, data):
        obj = GroundRent.objects.select_related("size", "location", "site").filter(
            client_ref_code=data["client_ref_code"],
            size__name=data["size"]["name"],
            location__name=data["location"]["name"],
            site__name=data["site"]["name"],
        )

        if self.instance is None:
            if obj.exists():
                raise serializers.ValidationError(
                    {"errorMsg": "GroundRent already exists"}
                )
        elif obj.exclude(pk=self.instance.pk).exists():

            raise serializers.ValidationError({"errorMsg": "GroundRent already exists"})
        return data

    def get_data(self, data):
        location = Location.objects.get(name=data.pop("location")["name"])
        site = Site.objects.get(name=data.pop("site")["name"])
        size = ContainerSize.objects.get(name=data.pop("size")["name"])
        return location, site, size

    def create(self, validated_data):
        location, site, size = self.get_data(validated_data)
        return GroundRent.objects.create(
            location=location, site=site, size=size, **validated_data
        )

    def update(self, instance, validated_data):
        location, site, size = self.get_data(validated_data)
        instance.client_ref_code = validated_data["client_ref_code"]
        instance.location = location
        instance.site = site
        instance.size = size
        instance.day_1_to_30_amount = validated_data["day_1_to_30_amount"]
        instance.day_31_to_60_amount = validated_data["day_31_to_60_amount"]
        instance.day_61_to_90_amount = validated_data["day_61_to_90_amount"]
        instance.day_91_to_120_amount = validated_data["day_91_to_120_amount"]
        instance.day_over_120_amount = validated_data["day_over_120_amount"]
        instance.save()
        return instance
