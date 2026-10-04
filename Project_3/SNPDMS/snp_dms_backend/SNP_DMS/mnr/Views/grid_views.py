from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from master.models import Location, Site
from non_depot.models import NonDepotContainerStock
from depot.models import ContainerStock
from django.core.paginator import Paginator

from account.permissions import HasAllowedRoles


class GridView(APIView):
    permission_classes = (IsAuthenticated, HasAllowedRoles)
    allowed_roles = ["Admin", "Location Admin", "Site Admin", "Depot User", "MNR Team"]

    def post(self, request, *args, **kwargs):
        try:
            data = request.data

            pg_no = data["pg_no"]
            on_page_data = data["on_page_data"]

            ref_code = data.get("ref_code", None)

            site_object = Site.objects.select_related("location").get(
                location__name=data["location"], name=data["site"]
            )
            queryset = None
            if site_object.type == "DEPOT":
                if data["out_history"] == "True":
                    queryset = (
                        ContainerStock.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "gate_in",
                        )
                        .filter(
                            container_status="OUT",
                            container__location__name=data["location"],
                            container__site__name=data["site"],
                        )
                        .order_by("-gate_in__in_date")
                    )
                else:
                    queryset = (
                        ContainerStock.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "gate_in",
                        )
                        .filter(
                            container_status="IN",
                            container__location__name=data["location"],
                            container__site__name=data["site"],
                        )
                        .order_by("-gate_in__in_date")
                    )
            else:
                if data["out_history"] == "True":
                    queryset = (
                        NonDepotContainerStock.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "gate_in",
                        )
                        .filter(
                            container_status="OUT",
                            container__location__name=data["location"],
                            container__site__name=data["site"],
                        )
                        .order_by("-gate_in__in_date")
                    )
                else:
                    queryset = (
                        NonDepotContainerStock.objects.select_related(
                            "container",
                            "container__client",
                            "container__type",
                            "container__size",
                            "container__location",
                            "container__site",
                            "gate_in",
                        )
                        .filter(
                            container_status="IN",
                            container__location__name=data["location"],
                            container__site__name=data["site"],
                        )
                        .order_by("-gate_in__in_date")
                    )

            if ref_code is not None:
                if not len(ref_code) == 0:
                    queryset = queryset.filter(container__client__ref_code=ref_code)

            if not len(data["client"]) == 0:
                queryset = queryset.filter(container__client__name=data["client"])

            if not len(data["container_no"]) == 0:
                queryset = queryset.filter(
                    container__container_no__in=data["container_no"]
                )

            if not len(data["stage"]) == 0:
                queryset = queryset.filter(stage=data["stage"])

            if not len(data["from_date"]) == 0 and not len(data["to_date"]) == 0:
                queryset = queryset.filter(
                    gate_in__in_date__range=[data["from_date"], data["to_date"]]
                )
            # if (
            #     not len(data["stage"]) == 0
            #     and not len(data["from_date"]) == 0
            #     and not len(data["to_date"]) == 0
            # ):BeforeRepairImage.objects.create(parent=survey,s3_object_name=surveyor_images.o)
            #     if data["stage"] == "Survey":
            #         queryset = queryset.filter(
            #             survey_date__range=[data["from_date"], data["to_date"]]
            #         )
            #     elif data["stage"] == "Estimate":
            #         queryset = queryset.filter(
            #             estimate_date__range=[data["from_date"], data["to_date"]]
            #         )
            #     elif data["stage"] == "Approval":
            #         queryset = queryset.filter(
            #             approval_date__range=[data["from_date"], data["to_date"]]
            #         )
            #     elif data["stage"] == "Repair":
            #         queryset = queryset.filter(
            #             repair_date__range=[data["from_date"], data["to_date"]]
            #         )
            #     elif data["stage"] == "Available":
            #         queryset = queryset.filter(
            #             available_date__range=[data["from_date"], data["to_date"]]
            #         )
            #     else:
            #         pass
            if not len(data["ref_code"]) == 0:
                queryset = queryset.filter(container__client__ref_code=data["ref_code"])

            if "status" in data:
                if not len(data["status"]) == 0:
                    queryset = queryset.filter(status=data["status"])

            # Pagination
            paginator = Paginator(queryset, on_page_data)
            no_of_data_count = paginator.count
            no_of_pages = paginator.num_pages
            current_page = paginator.page(pg_no)
            on_page_data_count = (
                current_page.end_index() - current_page.start_index() + 1
            )
            prev_page = ""
            if current_page.has_previous():
                prev_page = current_page.previous_page_number()
            next_page = ""
            if current_page.has_next():
                next_page = current_page.next_page_number()

            response_data = []
            count = 0
            for each in current_page:
                data_dict = each.get_stock_for_grid()
                data_dict["sr_no"] = current_page.start_index() + count
                response_data.append(data_dict)
                count += 1

            return Response(
                {
                    "no_of_data": no_of_data_count,
                    "on_page_data": on_page_data_count,
                    "total_pages": no_of_pages,
                    "prev_page": prev_page,
                    "next_page": next_page,
                    "data": response_data,
                },
                status=200,
            )

            # response_data = [each.get_stock_for_grid() for each in queryset.iterator()]
            # return Response(response_data, status=200)
        except Exception as e:
            return Response({"errorMsg": str(e)}, status=200)
