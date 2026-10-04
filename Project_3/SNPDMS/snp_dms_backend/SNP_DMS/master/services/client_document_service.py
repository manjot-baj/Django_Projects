from master.functions import (
    pagination_func,
    upload_client_doc_to_s3,
)
from master.models_two import ClientDocument, Client


class ClientDocumentService:
    def listOfClientDocuments(self, params, on_page_data, pg_no):
        client_qs = ClientDocument.objects.getClientDocumentQuerysetByParams(params)

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, pg_no, client_qs)

        data = [self.clientDocumentTableData(each) for each in current_page.object_list]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def clientDocumentTableData(self, data):
        return data.get_doc_detail()

    def paginationData(self, on_page_data, page_no, queryset):
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(queryset, on_page_data, page_no)
        return (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        )

    def createData(self, payload):
        client_params = {
            "name": payload["client"],
            "location__name": payload["location"],
            "site__name": payload["site"],
        }
        client = Client.objects.getClientObjectByParams(client_params)

        client_doc = ClientDocument.objects.create(client=client, name=payload["name"])

        return self.uploadDocument(payload, client_doc)

    def uploadDocument(self, payload, obj):
        file = payload["upload"]
        location_new = payload["location"].replace(" ", "_")
        site_new = payload["site"].replace(" ", "_")
        client_new = payload["client"].replace(" ", "_")
        file.name = file.name.replace(" ", "_")
        return upload_client_doc_to_s3(
            location=location_new,
            site=site_new,
            client_name=client_new,
            doc_id=obj.pk,
            file=file,
        )
