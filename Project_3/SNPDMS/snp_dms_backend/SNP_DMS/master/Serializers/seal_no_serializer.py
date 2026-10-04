# from master.models_two import SealNo
# from master.models import Location, Site
# from depot.models import ContainerStock, GateOut
# from rest_framework import serializers
# import datetime
# from django.utils import timezone


# class SealNoSerializer(serializers.ModelSerializer):
#     pk = serializers.PrimaryKeyRelatedField(read_only=True)
#     number = serializers.CharField(required=True)
#     in_date = serializers.DateField(format="%Y-%m-%d")
#     in_time = serializers.TimeField(format="%H:%M")
#     line = serializers.CharField(required=True)
#     location = serializers.CharField(source="location.name", required=True)
#     site = serializers.CharField(source="site.name", required=True)

#     class Meta:
#         model = SealNo
#         exclude = ["id"]

#     def get_data(self, data):
#         location = Location.objects.get(name=data["location"]["name"])
#         site = Site.objects.get(name=data["site"]["name"])
#         return location, site

#     def create(self, validated_data):
#         location, site = self.get_data(validated_data)
#         validated_data.pop("location")
#         validated_data.pop("site")
#         validated_data["in_date"] = datetime.datetime.combine(
#             validated_data["in_date"], validated_data["in_time"]
#         ).astimezone(timezone.get_current_timezone())
#         validated_data.pop("in_time")
#         return SealNo.objects.create(location=location, site=site, **validated_data)

#     def update(self, instance, validated_data):

#         location, site = self.get_data(validated_data)
#         validated_data["in_date"] = datetime.datetime.combine(
#             validated_data["in_date"], validated_data["in_time"]
#         )
#         instance.line = validated_data["line"]
#         instance.in_date = validated_data["in_date"]
#         validated_data["in_use_date"] = datetime.datetime.combine(
#             validated_data["in_use_date"], validated_data["in_use_time"]
#         )
#         instance.in_use_date = validated_data["in_use_date"]
#         if validated_data["out_date"] and validated_data["out_time"]:
#             validated_data["out_date"] = datetime.datetime.combine(
#                 validated_data["out_date"], validated_data["out_time"]
#             )
#             instance.out_date = validated_data["out_date"]
#         instance.is_available = validated_data["is_available"]
#         instance.is_damaged = validated_data["is_damaged"]
#         instance.is_cut = validated_data["is_cut"]
#         instance.in_use = validated_data["in_use"]
#         instance.is_first_allotment = validated_data["is_first_allotment"]
#         instance.is_lock = validated_data["is_lock"]
#         instance.location = location
#         instance.site = site
#         instance.save()
#         return instance

#     def validate(self, data):
#         if self.instance is None:
#             if (
#                 SealNo.objects.filter(number=data["number"]).exists()
#                 or ContainerStock.objects.filter(seal_no=data["number"]).exists()
#                 or GateOut.objects.filter(seal_no=data["number"]).exists()
#             ):
#                 raise serializers.ValidationError({"errorMsg": "SealNo already exists"})
#         elif (
#             SealNo.objects.exclude(pk=self.instance.pk)
#             .filter(number=data["number"])
#             .exists()
#             or ContainerStock.objects.filter(seal_no=data["number"]).exists()
#             or GateOut.objects.filter(seal_no=data["number"]).exists()
#         ):
#             raise serializers.ValidationError({"errorMsg": "SealNo already exists"})
#         return data

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         # data["vessel_voyage_name"] = data.pop("vessel_voyage")
#         # data.pop("bkg")
#         data = {key: value if value else "" for key, value in data.items()}
#         return data
