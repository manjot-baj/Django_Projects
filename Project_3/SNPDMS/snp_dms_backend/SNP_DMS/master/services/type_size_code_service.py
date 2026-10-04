from master.models import TypeSizeCode


class TypeSizeCodeService:

    def formatData(self, obj):
        return {
            "pk": obj.pk,
            "type": obj.type.name if obj.type else "",
            "size": obj.size.name if obj.size else "",
            "code": obj.code or "",
        }

    def listOfData(self):
        type_size_qs = TypeSizeCode.objects.select_related("type", "size")
        return [self.formatData(obj) for obj in type_size_qs]

    def getTypeSizeCode(self, pk):
        return TypeSizeCode.objects.getTypeSizeCodeById(pk)
