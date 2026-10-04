from master.models import Location, Country
from rest_framework import serializers
from django.db.models import Q


class LocationSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    company_name = serializers.CharField(required=True)
    company_address = serializers.CharField(required=True)
    gst_no = serializers.CharField(required=True)
    country = serializers.CharField(source="country.name")
    lut_no = serializers.CharField(required=False)

    class Meta:
        model = Location
        exclude = ["id", "icon"]

    def get_all_objects(self, user):
        role = user.role.name
        if role == "Admin":
            return Location.objects.select_related("country")
        else:
            return Location.objects.filter(name=user.location.name).select_related(
                "country"
            )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop("organization")
        data = {key: value if value else "" for key, value in data.items()}
        return data

    def validate(self, data):
        method = self.context["request"].method
        if (
            method == "POST"
            and Location.objects.filter(
                Q(code=data["code"]) | Q(name=data["name"])
            ).exists()
        ):
            raise serializers.ValidationError({"errorMsg": "Location already exists"})
        elif (
            method == "PUT"
            and Location.objects.exclude(pk=self.instance.pk)
            .filter(Q(code=data["code"]) | Q(name=data["name"]))
            .exists()
        ):
            raise serializers.ValidationError({"errorMsg": "Location already exists"})
        return data

    def get_data(self, data):
        return Country.objects.get(name=data.pop("country")["name"])

    def create(self, validated_data):
        country = self.get_data(validated_data)
        return Location.objects.create(country=country, **validated_data)

    def update(self, instance, validated_data):
        country = self.get_data(validated_data)
        instance.country = country
        instance.name = validated_data["name"]
        instance.code = validated_data["code"]
        instance.target = validated_data["target"]
        instance.company_name = validated_data["company_name"]
        instance.company_address = validated_data["company_address"]
        instance.state_code = validated_data["state_code"]
        # instance.icon = validated_data["icon"]
        instance.gst_no = validated_data["gst_no"]
        instance.lut_no = validated_data["lut_no"]
        instance.save()
        return instance
