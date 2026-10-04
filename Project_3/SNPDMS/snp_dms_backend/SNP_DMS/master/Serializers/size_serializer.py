from master.models import ContainerSize
from rest_framework import serializers


class ContainerSizeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)

    class Meta:
        model = ContainerSize
        exclude = ["id"]

    def validate(self, data):
        method = self.context["request"].method
        if (
            method == "POST"
            and ContainerSize.objects.filter(name=data["name"]).exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "ContainerSize already exists"}
            )
        elif (
            method == "PUT"
            and ContainerSize.objects.exclude(pk=self.instance.pk)
            .filter(name=data["name"])
            .exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "ContainerSize already exists"}
            )
        return data
