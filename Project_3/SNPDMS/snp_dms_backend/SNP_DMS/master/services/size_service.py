from master.models import ContainerSize


class SizeService:

    def deleteSize(self, params):
        not_deleted = []
        size_qs = ContainerSize.objects.getSizeQuerysetByParams(params)
        for size in size_qs:

            if any(
                [
                    size.container_size_rel.exists(),
                    size.non_depot_container_size_rel.exists(),
                    size.handling_charge_container_size_rel.exists(),
                    size.transportation_charge_container_size_rel.exists(),
                    size.ground_rent_container_size_rel.exists(),
                    size.ts_code_size_rel.exists(),
                ]
            ):

                not_deleted.append(size.name)
            else:
                size.delete()
        return not_deleted
