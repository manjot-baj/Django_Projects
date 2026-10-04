from master.models import ExportCargoType, Location, Site
from depot.models import GateInHistory
from rest_framework import serializers


class ExportCargoTypeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)

    class Meta:
        model = ExportCargoType
        exclude = ["id"]

    def create(self, validated_data):
        return ExportCargoType.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data["name"]
        instance.save()
        return instance

    def validate(self, data):
        if (
            self.instance is None
            and ExportCargoType.objects.filter(name=data["name"]).exists()
            or self.instance is not None
            and ExportCargoType.objects.exclude(pk=self.instance.pk)
            .filter(name=data["name"])
            .exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "ExportCargoType already exists"}
            )

        return data

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data["vessel_voyage_name"] = data.pop("vessel_voyage")
    #     data.pop("bkg")
    #     data = {key: value if value else "" for key, value in data.items()}
    #     return data
