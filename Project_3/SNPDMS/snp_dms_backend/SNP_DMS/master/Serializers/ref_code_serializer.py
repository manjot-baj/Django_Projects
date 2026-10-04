from master.models import RefCodeMaster
from master.models_two import Client
from rest_framework import serializers


class RefCodeMasterSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    ref_code = serializers.CharField(required=True)

    class Meta:
        model = RefCodeMaster
        exclude = ["id"]

    def create(self, validated_data):
        validated_data["ref_code"] = validated_data["ref_code"].upper()
        return RefCodeMaster.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.ref_code = validated_data["ref_code"].upper()
        instance.save()
        return instance

    def validate(self, data):
        if self.instance is None:
            if (
                RefCodeMaster.objects.filter(ref_code=data["ref_code"]).exists()
                or Client.objects.filter(ref_code=data["ref_code"]).exists()
            ):
                raise serializers.ValidationError(
                    {"errorMsg": "RefCodeMaster already exists"}
                )
        elif (
            RefCodeMaster.objects.exclude(pk=self.instance.pk)
            .filter(ref_code=data["ref_code"])
            .exists()
            or Client.objects.filter(ref_code=data["ref_code"]).exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "RefCodeMaster already exists"}
            )
        return data

    # def to_representation(self, instance):
    #     data = super().to_representation(instance)
    #     data["vessel_voyage_name"] = data.pop("vessel_voyage")
    #     data.pop("bkg")
    #     data = {key: value if value else "" for key, value in data.items()}
    #     return data
