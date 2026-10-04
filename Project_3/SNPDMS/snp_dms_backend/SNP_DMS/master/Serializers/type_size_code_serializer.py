from master.models import TypeSizeCode, ContainerSize, ContainerType
from rest_framework import serializers


class TypeSizeCodeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    code = serializers.CharField(required=True)
    type = serializers.CharField(source="type.name", required=True)
    size = serializers.CharField(source="size.name", required=True)

    class Meta:
        model = TypeSizeCode
        exclude = ["id"]

    def validate(self, data):
        body = self.context["request"].data
        method = self.context["request"].method
        if (
            method == "POST"
            and TypeSizeCode.objects.filter(
                code=body["code"], type__name=body["type"], size__name=body["size"]
            ).exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "TypeSizeCode already exists"}
            )

        elif (
            method == "PUT"
            and TypeSizeCode.objects.exclude(pk=self.instance.pk)
            .filter(code=body["code"], type__name=body["type"], size__name=body["size"])
            .exists()
        ):
            raise serializers.ValidationError(
                {"errorMsg": "TypeSizeCode already exists"}
            )

        return data

    def get_data(self, data):
        size_obj = ContainerSize.objects.get(name=data.pop("size")["name"])
        type_obj = ContainerType.objects.get(name=data.pop("type")["name"])
        return size_obj, type_obj

    def create(self, validated_data):
        size_obj, type_obj = self.get_data(validated_data)
        return TypeSizeCode.objects.create(
            size=size_obj, type=type_obj, **validated_data
        )

    def update(self, instance, validated_data):
        size_obj, type_obj = self.get_data(validated_data)
        instance.code = validated_data["code"]
        instance.type = type_obj
        instance.size = size_obj
        instance.save()
        return instance
