from master.models import VesselVoyageDetail, Location, Site, VesselBkgNo
from depot.models import GateInHistory
from rest_framework import serializers


class VesselVoyageDetailSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    booking_no = serializers.CharField(source="bkg.number", required=False)
    vessel_voyage_name = serializers.CharField(source="vessel_voyage", required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)

    class Meta:
        model = VesselVoyageDetail
        exclude = ["id"]

    def get_data(self, data):
        location = Location.objects.get(name=data["location"]["name"])
        site = Site.objects.get(name=data["site"]["name"])
        bkg_no = VesselBkgNo.objects.get(number=data["bkg"]["number"])
        return location, site, bkg_no

    def create(self, validated_data):
        location, site, bkg_no = self.get_data(validated_data)
        validated_data.pop("location")
        validated_data.pop("site")
        validated_data.pop("bkg")
        validated_data["vessel_name"], validated_data["voyage_no"] = validated_data[
            "vessel_voyage"
        ].split("-")
        if validated_data["vessel_name"] != validated_data["vessel_name"].strip():
            raise serializers.ValidationError(
                {"errorMsg": "Vessel Name should not contain any space"}
            )
        if validated_data["voyage_no"] != validated_data["voyage_no"].strip():
            raise serializers.ValidationError(
                {"errorMsg": "Voyage No should not contain any space"}
            )

        return VesselVoyageDetail.objects.create(
            location=location, site=site, bkg=bkg_no, **validated_data
        )

    def update(self, instance, validated_data):

        location, site, bkg_no = self.get_data(validated_data)
        vessel_name, voyage_no = validated_data["vessel_voyage"].split("-")
        if vessel_name != vessel_name.strip():
            raise serializers.ValidationError(
                {"errorMsg": "Vessel Name should not contain any space"}
            )
        if voyage_no != voyage_no.strip():
            raise serializers.ValidationError(
                {"errorMsg": "Voyage No should not contain any space"}
            )
        for each in GateInHistory.objects.select_related("container", "gate_in").filter(
            gate_in__vessel_name=instance.vessel_name,
            gate_in__voyage_no=instance.voyage_no,
        ):
            each.gate_in.do_ref = bkg_no.number
            each.gate_in.vessel_name = vessel_name
            each.gate_in.voyage_no = voyage_no
            each.gate_in.save()

        instance.vessel_voyage = validated_data["vessel_voyage"]
        instance.vessel_name = vessel_name
        instance.voyage_no = voyage_no
        instance.bkg = bkg_no
        instance.location = location
        instance.site = site
        instance.save()
        return instance

    def validate(self, data):
        obj = VesselVoyageDetail.objects.select_related("location", "site")
        if self.instance is None:
            if obj.filter(vessel_voyage=data["vessel_voyage"]).exists():
                raise serializers.ValidationError(
                    {"errorMsg": "VesselVoyageDetail already exists"}
                )
        elif (
            obj.exclude(pk=self.instance.pk)
            .filter(vessel_voyage=data["vessel_voyage"])
            .exists()
        ):

            raise serializers.ValidationError(
                {"errorMsg": "VesselVoyageDetail already exists"}
            )
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["vessel_voyage_name"] = data.pop("vessel_voyage")
        data.pop("bkg")
        data = {key: value if value else "" for key, value in data.items()}
        return data
