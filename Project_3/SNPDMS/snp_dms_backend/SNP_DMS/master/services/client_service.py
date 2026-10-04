from master.Serializers.client_serializer import (
    ClientRepresentativeSerializer,
)
from master.functions import pagination_func
from master.models_two import (
    Client,
    ClientRepresentative,
    ClientAbbreviation,
    Location,
    Site,
)


class ClientService:
    def addClientData(self, params, shipping_line, client_representative_data):
        params["location"] = Location.objects.getLocationByName(params["location"])
        params["site"] = Site.objects.getSiteByName(params["site"])
        client = Client.objects.createClient(params)
        client.code = f"GH/{str(client.pk).zfill(5)}"
        client.save(update_fields=["code"])

        if shipping_line:
            ClientAbbreviation.objects.getOrCreateClientAbbriation(
                {"client": client, "name": shipping_line}
            )

        if client_representative_data:
            bulk_create_params = [
                ClientRepresentative(
                    client=client,
                    name=each["name"],
                    designation=each["designation"],
                    email_id=each["email_id"],
                    mobile_no=each["mobile_no"],
                    phone_no=each["phone_no"],
                )
                for each in client_representative_data
            ]
            ClientRepresentative.objects.bulkCreate(bulk_create_params)

    def clientData(self, pk):
        client_obj = Client.objects.getClientById(pk)
        client = client_obj.get_client()
        representative_obj = (
            ClientRepresentative.objects.getClientRepresentativeByClient(client_obj)
        )
        client_abbreviation_qs = (
            ClientAbbreviation.objects.getClientAbbreviationByClient(client_obj)
        )
        if client_abbreviation_qs.exists():
            client["shipping_line"] = client_abbreviation_qs.first().name
        else:
            client["shipping_line"] = ""

        return {
            "client_data": client,
            "client_representative_data": ClientRepresentativeSerializer(
                representative_obj, many=True
            ).data,
        }

    def listOfClients(self, params, on_page_data, pg_no):
        client_qs = Client.objects.getClientQuerysetByParams(params)

        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = self.paginationData(on_page_data, pg_no, client_qs)

        data = [
            {**self.clientTableData(each), "sr_no": index + 1}
            for index, each in enumerate(
                current_page.object_list, start=current_page.start_index()
            )
        ]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def clientTableData(self, data):
        return data.get_client()

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

    def updateClient(self, client_obj, client_data, client_representative_data):

        client_obj.name = client_data["name"]
        client_obj.code = client_data["code"]
        client_obj.alias_name_one = client_data["alias_name_one"]
        client_obj.alias_name_two = client_data["alias_name_two"]
        client_obj.type = client_data["type"]
        client_obj.office_address = client_data["office_address"]
        client_obj.city = client_data["city"]
        client_obj.zip = client_data["zip"]
        client_obj.office_phone_no = client_data["office_phone_no"]
        client_obj.mobile_no = client_data["mobile_no"]
        client_obj.email_id = client_data["email_id"]
        client_obj.website = client_data["website"]
        client_obj.fax = client_data["fax"]
        client_obj.business_description = client_data["business_description"]
        client_obj.notes = client_data["notes"]
        client_obj.cst_no = client_data["cst_no"]
        client_obj.service_tax_no = client_data["service_tax_no"]
        client_obj.bank_name = client_data["bank_name"]
        client_obj.account_name = client_data["account_name"]
        client_obj.vat_no = client_data["vat_no"]
        client_obj.ecc_no = client_data["ecc_no"]
        client_obj.bank_branch = client_data["bank_branch"]
        client_obj.account_no = client_data["account_no"]
        client_obj.gst_no = client_data["gst_no"]
        client_obj.pan_no = client_data["pan_no"]
        client_obj.ifsc_code = client_data["ifsc_code"]
        client_obj.swift_code = client_data["swift_code"]
        client_obj.edi_service = client_data["edi_service"]
        client_obj.ref_code = (
            client_data["ref_code"].upper() if client_data["ref_code"] else ""
        )
        client_obj.operator_code = client_data["operator_code"]
        client_obj.current_location_code = client_data["current_location_code"]
        client_obj.location_code = client_data["location_code"]
        client_obj.edi_code = client_data["edi_code"]
        client_obj.edi_to_email_id = client_data["edi_to_email_id"]
        client_obj.edi_cc_email_id = client_data["edi_cc_email_id"]
        client_obj.reported_by_from = client_data["reported_by_from"]
        client_obj.reported_by_to = client_data["reported_by_to"]
        client_obj.contact_person = client_data["contact_person"]
        client_obj.sales_term = client_data["sales_term"]
        client_obj.is_sez = client_data["is_sez"]
        client_obj.save()

        if client_data["shipping_line"]:
            if ClientAbbreviation.objects.filter(client=client_obj).exists():
                ClientAbbreviation.objects.filter(client=client_obj).update(
                    name=client_data["shipping_line"]
                )
            else:
                ClientAbbreviation.objects.get_or_create(
                    client=client_obj, name=client_data["shipping_line"]
                )

        if client_representative_data:
            update_instances = []
            bulk_create_instances = []
            for each in client_representative_data:
                if "pk" in each:
                    representative_obj = (
                        ClientRepresentative.objects.getClientAbbreviationById(
                            each["pk"]
                        )
                    )
                    representative_obj.client = client_obj
                    representative_obj.name = each["name"]
                    representative_obj.designation = each["designation"]
                    representative_obj.email_id = each["email_id"]
                    representative_obj.mobile_no = each["mobile_no"]
                    representative_obj.phone_no = each["phone_no"]
                    update_instances.append(representative_obj)

                else:
                    bulk_create_instances.append(
                        ClientRepresentative(
                            client=client_obj,
                            name=each["name"],
                            designation=each["designation"],
                            email_id=each["email_id"],
                            mobile_no=each["mobile_no"],
                            phone_no=each["phone_no"],
                        )
                    )
            ClientRepresentative.objects.bulkUpdate(update_instances)
            ClientRepresentative.objects.bulkCreate(bulk_create_instances)
