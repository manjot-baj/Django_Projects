from master.models_two import ClientDocument
from rest_framework import serializers


class ClientDocumentSerializer(serializers.ModelSerializer):
    pk = serializers.PrimaryKeyRelatedField(read_only=True)
    name = serializers.CharField(required=True)
    client = serializers.CharField(source="client.name", required=True)
    upload = serializers.FileField(source="document_s3_object_name", required=False)

    class Meta:
        model = ClientDocument
        exclude = ["id"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop("upload")
        data.pop("document_s3_object_name")
        data.pop("document_s3_file_name")
        data = {key: value if value else "" for key, value in data.items()}
        return data
