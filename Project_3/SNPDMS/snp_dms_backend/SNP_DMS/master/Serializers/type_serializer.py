from master.models import ContainerType
from rest_framework import serializers


class ContainerTypeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)

    class Meta:
        model = ContainerType
        exclude = ["id"]

    def validate(self, data):
        method = self.context["request"].method
        if (
            method == "POST"
            and ContainerType.objects.filter(name=data["name"]).exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "ContainerType already exists"}
            )
        elif (
            method == "PUT"
            and ContainerType.objects.exclude(pk=self.instance.pk)
            .filter(name=data["name"])
            .exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "ContainerType already exists"}
            )
        return data
