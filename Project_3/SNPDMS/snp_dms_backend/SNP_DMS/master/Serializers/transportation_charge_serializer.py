from master.models_two import TransportationCharge, Client
from master.models import Location, Site, ContainerSize
from rest_framework import serializers


class TransportationChargeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    client = serializers.CharField(source="client.name", required=True)
    type = serializers.CharField(required=True)
    amount = serializers.DecimalField(required=True, max_digits=10, decimal_places=2)
    size = serializers.CharField(source="size.name", required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)

    class Meta:
        model = TransportationCharge
        exclude = ["id"]

    def validate(self, data):

        handling_obj = TransportationCharge.objects.select_related(
            "client", "size", "location", "site"
        )

        if self.instance is None:
            if handling_obj.filter(
                client__name=data["client"]["name"],
                type=data["type"],
                size__name=data["size"]["name"],
                location__name=data["location"]["name"],
                site__name=data["site"]["name"],
            ).exists():
                raise serializers.ValidationError(
                    {"errorMsg": "TransportationCharge already exists"}
                )
        elif (
            handling_obj.exclude(pk=self.instance.pk)
            .filter(
                client__name=data["client"]["name"],
                type=data["type"],
                size__name=data["size"]["name"],
                location__name=data["location"]["name"],
                site__name=data["site"]["name"],
            )
            .exists()
        ):

            raise serializers.ValidationError(
                {"errorMsg": "TransportationCharge already exists"}
            )
        return data

    def get_data(self, data):
        location = Location.objects.get(name=data.pop("location")["name"])
        site = Site.objects.get(name=data.pop("site")["name"])
        size = ContainerSize.objects.get(name=data.pop("size")["name"])
        client = Client.objects.get(
            name=data.pop("client")["name"], location=location, site=site
        )
        return location, site, size, client

    def create(self, validated_data):
        location, site, size, client = self.get_data(validated_data)
        return TransportationCharge.objects.create(
            location=location, site=site, size=size, client=client, **validated_data
        )

    def update(self, instance, validated_data):
        location, site, size, client = self.get_data(validated_data)
        instance.location = location
        instance.site = site
        instance.size = size
        instance.client = client
        instance.type = validated_data["type"]
        instance.amount = float(validated_data["amount"])
        instance.save()
        return instance
