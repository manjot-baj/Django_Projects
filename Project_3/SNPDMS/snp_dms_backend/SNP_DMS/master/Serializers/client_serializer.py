from master.models_two import (
    Client,
    ClientRepresentative,
    ClientAbbreviation,
    LineHandlingCharges,
    HandlingChargesHistory,
)
from rest_framework import serializers
from django.db.models import Q
from django.db.models import Count, Value
from django.db.models.functions import Lower, Replace


class ClientSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(read_only=False, allow_blank=True)
    type = serializers.CharField(required=True)
    office_address = serializers.CharField(required=True)
    location = serializers.CharField(source="location.name", required=True)
    site = serializers.CharField(source="site.name", required=True)
    gst_no = serializers.CharField(allow_blank=True)
    is_sez = serializers.BooleanField(required=False)

    class Meta:
        model = Client
        exclude = ["id"]

    def validate(self, data):
        query = (
            (Q(type="Line") | Q(type="Party"))
            & Q(name=data["name"])
            & Q(location__name=data["location"]["name"])
            & Q(site__name=data["site"]["name"])
        )
        if (
            self.instance is None
            and Client.objects.filter(query).exists()
            or self.instance is not None
            and Client.objects.exclude(pk=self.instance.pk).filter(query).exists()
        ):
            raise serializers.ValidationError({"errorMsg": "Client already exists"})

        if not len(data["gst_no"]) == 0:
            query = (
                Q(location__name=data["location"]["name"])
                & Q(site__name=data["site"]["name"])
                & Q(gst_no=data["gst_no"])
            )
            if (
                self.instance is None
                and Client.objects.filter(query).exists()
                or self.instance is not None
                and Client.objects.exclude(pk=self.instance.pk).filter(query).exists()
            ):
                raise serializers.ValidationError(
                    {"errorMsg": "Client with same gst_no already exists"}
                )

        name = data["name"]
        location = data["location"]["name"]
        site = data["site"]["name"]

        # Normalize input
        normalized_input = name.lower().replace(".", "").replace(" ", "")

        # DB normalization
        normalized_expr = Replace(
            Replace(Lower("name"), Value("."), Value("")), Value(" "), Value("")
        )

        queryset = Client.objects.annotate(normalized_name=normalized_expr).filter(
            normalized_name=normalized_input,
            location__name=location,
            site__name=site,
            type__in=["Line", "Party"],
        )

        # Exclude current instance on update
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {"errorMsg": "Client with same name already exists"}
            )

        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if ClientAbbreviation.objects.filter(client__name=data["name"]).exists():
            data["shipping_line"] = ClientAbbreviation.objects.values("name").get(
                client__name=data["name"]
            )["name"]
        data = {key: value if value else "" for key, value in data.items()}
        return data


class GetClientSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    location = serializers.CharField(source="location.name")
    site = serializers.CharField(source="site.name")

    class Meta:
        model = Client
        fields = [
            "pk",
            "name",
            "code",
            "contact_person",
            "mobile_no",
            "email_id",
            "type",
            "location",
            "site",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data = {key: value if value else "" for key, value in data.items()}
        return data


class ClientRepresentativeSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    client = serializers.CharField(
        source="client.name", read_only=False, allow_blank=True
    )

    class Meta:
        model = ClientRepresentative
        exclude = ["id"]
