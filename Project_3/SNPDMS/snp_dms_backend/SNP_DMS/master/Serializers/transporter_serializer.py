from master.models import Transporter, Location, Site
from rest_framework import serializers
from django.db.models import Q


class TransporterSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)

    class Meta:
        model = Transporter
        exclude = ["id"]

    def validate(self, data):
        body = self.context["request"].data
        if (
            not Location.objects.filter(name=body["location"]).exists()
            or not Site.objects.filter(name=body["site"]).exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "Location or Site does not exists"}
            )

        if self.context["request"].method == "POST":
            if Transporter.objects.filter(
                (Q(name=body["name"]) | Q(code=body["code"]))
                & Q(location__name=body["location"])
                & Q(site__name=body["site"])
            ).exists():
                raise serializers.ValidationError(
                    {"errorMsg": "Transporter already exists"}
                )
        elif self.context["request"].method == "PUT":
            if (
                Transporter.objects.exclude(pk=self.instance.pk)
                .filter(
                    (Q(name=body["name"]) | Q(code=body["code"]))
                    & Q(location__name=body["location"])
                    & Q(site__name=body["site"])
                )
                .exists()
            ):
                raise serializers.ValidationError(
                    {"errorMsg": "Transporter already exists"}
                )
        return data

    def get_data(self, data):
        location = Location.objects.get(name=data.pop("location")["name"])
        site = Site.objects.get(name=data.pop("site")["name"])
        return location, site

    def create(self, validated_data):
        location, site = self.get_data(validated_data)
        return Transporter.objects.create(
            location=location, site=site, **validated_data
        )

    def update(self, instance, validated_data):
        location, site = self.get_data(validated_data)
        instance.name = validated_data["name"]
        instance.code = validated_data["code"]
        instance.enblock_transporter = validated_data["enblock_transporter"]
        instance.location = location
        instance.site = site
        instance.save()
        return instance
