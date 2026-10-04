from master.models import Country
from rest_framework import serializers


class CountrySerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)
    currency = serializers.CharField(required=True)

    class Meta:
        model = Country
        exclude = ["id"]

    def validate(self, data):
        method = self.context["request"].method
        if (
            method == "POST"
            and Country.objects.filter(name=data["name"]).exists()
            or method == "PUT"
            and Country.objects.exclude(pk=self.instance.pk)
            .filter(name=data["name"])
            .exists()
        ):
            raise serializers.ValidationError({"errorMsg": "Country already exists"})
        # if method == "POST" and Country.objects.filter(name=data["name"]).exists():
        #     raise serializers.ValidationError({"errorMsg": "Country already exists"})
        # elif (
        #     method == "PUT"
        #     and Country.objects.exclude(pk=self.instance.pk)
        #     .filter(name=data["name"])
        #     .exists()
        # ):
        #     raise serializers.ValidationError({"errorMsg": "Country already exists"})
        return data
