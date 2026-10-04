from master.models import Site, Location
from rest_framework import serializers


class SiteSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    type = serializers.CharField(required=True)
    depot_code = serializers.CharField(required=True)
    depot_name = serializers.CharField(required=True)
    vendor_code = serializers.CharField(required=True)
    vendor_name = serializers.CharField(required=True)
    location = serializers.CharField(source="location.name")

    class Meta:
        model = Site
        exclude = ["id"]

    def get_data(self, data):
        return Location.objects.get(name=data.pop("location")["name"])

    def create(self, validated_data):
        location = self.get_data(validated_data)
        return Site.objects.create(location=location, **validated_data)

    def update(self, instance, validated_data):

        location = self.get_data(validated_data)
        instance.code = validated_data.pop("code")
        instance.location = location
        instance.type = validated_data.pop("type")
        instance.name = validated_data.pop("name")
        instance.depot_code = validated_data.pop("depot_code")
        instance.vendor_name = validated_data.pop("vendor_name")
        instance.address = validated_data.pop("address")
        instance.state = validated_data.pop("state")
        instance.state_code = validated_data.pop("state_code")
        instance.contact = validated_data.pop("contact")
        automatic_mnr_status_change = validated_data.pop("automatic_mnr_status_change")
        if automatic_mnr_status_change:
            instance.automatic_mnr_status_change = True
        else:
            instance.automatic_mnr_status_change = False
        mnr_module = validated_data.pop("mnr_module")
        if mnr_module:
            instance.mnr_module = True
        else:
            instance.mnr_module = False
        # instance.organization = validated_data.pop("organization")
        transportation_module = validated_data.pop("transportation_module")
        if transportation_module:
            instance.transportation_module = True
        else:
            instance.transportation_module = False
        if "loaded_yard_module" in validated_data.keys():
            loaded_yard_module = validated_data.pop("loaded_yard_module")
            if loaded_yard_module:
                instance.loaded_yard_module = True
            else:
                instance.loaded_yard_module = False
        if "procurement_module" in validated_data.keys():
            procurement_module = validated_data.pop("procurement_module")
            if procurement_module:
                instance.procurement_module = True
            else:
                instance.procurement_module = False
        if "lolo_finance" in validated_data.keys():
            lolo_finance = validated_data.pop("lolo_finance")
            if lolo_finance:
                instance.lolo_finance = True
            else:
                instance.lolo_finance = False
        new_billing_module = validated_data.pop("new_billing_module")
        if new_billing_module:
            instance.new_billing_module = True
        else:
            instance.new_billing_module = False
        if "procurement_admin" in validated_data.keys():
            procurement_admin = validated_data.pop("procurement_admin")
            if procurement_admin:
                instance.procurement_admin = True
            else:
                instance.procurement_admin = False
        if "en_block_movement" in validated_data.keys():
            en_block_movement = validated_data.pop("en_block_movement")
            if en_block_movement:
                instance.en_block_movement = True
            else:
                instance.en_block_movement = False
        instance.depot_name = validated_data.pop("depot_name")
        instance.vendor_code = validated_data.pop("vendor_code")
        if "invoice_start_from" in validated_data.keys():
            instance.invoice_start_from = validated_data.pop("invoice_start_from")
        if "bank_name" in validated_data.keys():
            instance.bank_name = validated_data.pop("bank_name")
        if "bank_branch" in validated_data.keys():
            instance.bank_branch = validated_data.pop("bank_branch")
        if "ifsc_code" in validated_data.keys():
            instance.ifsc_code = validated_data.pop("ifsc_code")
        if "bank_account_no" in validated_data.keys():
            instance.bank_account_no = validated_data.pop("bank_account_no")
        if "size_20_rate" in validated_data.keys():
            instance.size_20_rate = validated_data.pop("size_20_rate")
        if "size_40_rate" in validated_data.keys():
            instance.size_40_rate = validated_data.pop("size_40_rate")
        if "night_charge_size_20_rate" in validated_data.keys():
            instance.night_charge_size_20_rate = validated_data.pop(
                "night_charge_size_20_rate"
            )
        if "night_charge_size_40_rate" in validated_data.keys():
            instance.night_charge_size_40_rate = validated_data.pop(
                "night_charge_size_40_rate"
            )

        instance.save()
        return instance

    def validate(self, data):
        method = self.context["request"].method
        if method == "POST" and Site.objects.filter(name=data["name"]).exists():
            raise serializers.ValidationError({"errorMsg": "Site already exists"})
        elif (
            method == "PUT"
            and Site.objects.exclude(pk=self.instance.pk)
            .filter(name=data["name"])
            .exists()
        ):
            raise serializers.ValidationError({"errorMsg": "Site already exists"})
        return data
