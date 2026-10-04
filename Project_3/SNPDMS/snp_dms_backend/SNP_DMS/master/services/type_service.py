from master.models import ContainerType


class TypeService:

    def deleteType(self, params):
        not_deleted = []
        type_qs = ContainerType.objects.getTypeQuerysetByParams(params)

        for each in type_qs:
            if any(
                [
                    each.container_type_rel.exists(),
                    each.non_depot_container_type_rel.exists(),
                    each.ts_code_type_rel.exists(),
                ]
            ):

                not_deleted.append(each.name)
            else:
                each.delete()

        return not_deleted
