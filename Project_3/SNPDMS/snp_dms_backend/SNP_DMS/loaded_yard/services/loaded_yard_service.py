from loaded_yard.models import LoadedYard
from master.functions import pagination_func
from datetime import datetime, timedelta
from django.utils import timezone
import os
from SNP_DMS.settings.base import BASE_DIR
from django.http import HttpResponse
from master.models import Site, Location
import openpyxl
from django.db.models import Q
from depot.functions_two import check_char_digit
import pandas as pd

LOADEDYARD_CONTAINER_MOVE_CODE_STATUS = {
    "IIT": "IDR",
    "MTIN": "MCY",
    "EXPIN": "ERY",
    "MIR": "MPI",
    "MIT": "MDR",
    "DVAN": "ICO",
    "MOT": "MLR",
    "MOR": "MPO",
    "VAN": "MSH",
    "EOT": "ELR",
}


class LoadedYardService:
    def getLoadedYardData(self, params, on_page_data, page_no):
        filtered_data = LoadedYard.objects.filter(**params)
        (
            no_of_data_count,
            on_page_data_count,
            no_of_pages,
            prev_page,
            next_page,
            current_page,
        ) = pagination_func(filtered_data, on_page_data, page_no)

        # filtered_data = self.get_filtered_data(object=current_page)
        data = [self.loadedYardDto(each, idx) for idx, each in enumerate(current_page)]
        return {
            "no_of_data": no_of_data_count,
            "on_page_data": on_page_data_count,
            "total_pages": no_of_pages,
            "prev_page": prev_page,
            "next_page": next_page,
            "data": data,
        }

    def loadedYardDto(self, data, idx):
        return {
            "pk": data.pk,
            "sr_no": idx + 1,
            "container_no": data.container_no,
            "size": data.type_size or "",
            "port": data.port or "",
            "process_type": data.process_type or "",
            "booking_no": data.booking_no or "",
        }

    def getDetailOfINContainer(self, container_no, location, site):

        date = [
            each.iit_date.strftime("%d/%m/%Y")
            for each in LoadedYard.objects.filter(
                container_no=container_no,
                process_type="IN",
                location__name=location,
                site__name=site,
            )
        ]
        return {
            "container_no": container_no,
            "dates": date,
            "process_type": "IN",
        }

    def clientSpecificDetailOfINContainer(self, container_no, location, site):
        data = []
        for each in LoadedYard.objects.filter(
            container_no=container_no,
            process_type="IN",
            location__name=location,
            site__name=site,
        ).values(
            "pk",
            "container_no",
            "iit_date",
            "mtin_date",
            "mir_date",
            "mit_date",
            "expin_date",
        ):

            data_dict = {
                "container_no": each["container_no"],
                "move_codes": [],
                "pk": each["pk"],
            }
            if each["iit_date"]:
                data_dict["move_codes"].append("IIT")
            if each["mtin_date"]:
                data_dict["move_codes"].append("MTIN")
            if each["mir_date"]:
                data_dict["move_codes"].append("MIR")
            if each["mit_date"]:
                data_dict["move_codes"].append("MIT")
            if each["expin_date"]:
                data_dict["move_codes"].append("EXPIN")
            data.append(data_dict)
        return {
            "data": data,
            "process_type": "IN",
        }

    def getDetailOfOutContainer(self, container_no, location, site):
        date = [
            each.dvan_date.strftime("%d/%m/%Y")
            for each in LoadedYard.objects.filter(
                container_no=container_no,
                process_type="OUT",
                location__name=location,
                site__name=site,
            )
        ]
        return {"container_no": container_no, "dates": date, "process_type": "OUT"}

    def clientSpecificDetailOfOutContainer(self, container_no, location, site):
        data = []
        for each in LoadedYard.objects.filter(
            container_no=container_no,
            process_type="OUT",
            location__name=location,
            site__name=site,
        ).values(
            "pk",
            "container_no",
            "dvan_date",
            "van_date",
            "mot_date",
            "mor_date",
            "eot_date",
        ):
            data_dict = {
                "container_no": each["container_no"],
                "move_codes": [],
                "pk": each["pk"],
            }
            if each["dvan_date"]:
                data_dict["move_codes"].append("DVAN")
            if each["van_date"]:
                data_dict["move_codes"].append("VAN")
            if each["mot_date"]:
                data_dict["move_codes"].append("MOT")
            if each["mor_date"]:
                data_dict["move_codes"].append("MOR")
            if each["eot_date"]:
                data_dict["move_codes"].append("EOT")
            data.append(data_dict)
        return {
            "data": data,
            "process_type": "OUT",
        }

    def loadedYardEdiContent(
        self,
        container_no,
        type_size,
        move_code,
        date,
        time,
        current_location,
        to_location,
        booking_no,
        customer,
        transporter,
        truck_no,
        condition,
        mode_of_transport,
        job_order_no,
    ):

        shipping_line = "MSC"
        format_line = "{:<5}".format(shipping_line)
        format_container_no = "{:<15}".format(container_no)
        c_size_type = type_size
        format_c_size_type = "{:<10}".format(c_size_type)
        format_move_code = "{:<10}".format(move_code)
        move_code_date = date
        move_code_time = time
        move_code_date_time = datetime.combine(
            date=move_code_date, time=move_code_time
        ).astimezone(timezone.get_current_timezone())
        new_transaction_date_time = move_code_date_time - timedelta(minutes=30)
        str_transaction_date = new_transaction_date_time.date().strftime("%d%m%Y")
        str_transaction_time = new_transaction_date_time.time().strftime("%H:%M")
        transaction_date = str_transaction_date + str_transaction_time
        format_transaction_date = "{:<13}".format(transaction_date)
        format_current_location = "{:<5}".format(current_location)
        format_to_location = "{:<5}".format(to_location)
        format_booking_no = "{:<25}".format(booking_no)
        format_customer = "{:<10}".format(customer)
        format_transporter = "{:<10}".format(transporter)
        format_truck_no = "{:<25}".format(truck_no)
        format_condition = "{:<1}".format(condition)
        reported_by = "MMS"
        format_reported_by = "{:<10}".format(reported_by)
        now = datetime.now().astimezone(timezone.get_current_timezone()).date()
        str_now = now.strftime("%d%m%Y")
        report_date = str_now
        format_report_date = "{:<8}".format(report_date)
        remarks = ""
        format_remarks = "{:<50}".format(remarks)
        format_mode_of_transport = "{:<1}".format(mode_of_transport)
        format_job_order_no = "{:<25}".format(job_order_no)
        content = (
            format_line[:5]
            + format_container_no[:15]
            + format_c_size_type[:10]
            + format_move_code[:10]
            + format_transaction_date[:13]
            + format_current_location[:5]
            + format_to_location[:5]
            + format_booking_no[:25]
            + format_customer[:10]
            + format_transporter[:10]
            + format_truck_no[:25]
            + format_condition[:1]
            + format_reported_by[:10]
            + format_report_date[:8]
            + format_remarks[:50]
            + format_mode_of_transport[:1]
            + format_job_order_no[:25]
            + "\n"
        )
        data = {
            "date": new_transaction_date_time,
            "content": content,
            "move_code": move_code,
        }
        return data

    def getMoveCodeContentByCheckbox(self, stock_id):
        attachment_list = []
        for pk in stock_id:
            stock = LoadedYard.objects.get(pk=pk)
            if stock.iit_date:
                iit_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="IIT",
                    date=stock.iit_date,
                    time=stock.iit_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(iit_content["content"])
            if stock.dvan_date:
                dvan_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="DVAN",
                    date=stock.dvan_date,
                    time=stock.dvan_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="R",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(dvan_content["content"])

            if stock.mtin_date:
                mtin_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="MTIN",
                    date=stock.mtin_date,
                    time=stock.mtin_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(mtin_content["content"])
            if stock.mir_date:
                mir_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="MIR",
                    date=stock.mir_date,
                    time=stock.mir_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(mir_content["content"])

            if stock.mot_date:
                if stock.site.organization == "Golden Horn Container Service":
                    mot_content = self.loadedYardEdiContent(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOT",
                        date=stock.mot_date,
                        time=stock.mot_time,
                        current_location="NPBRG",
                        to_location="INMJ1",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="CONKOL",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                else:
                    mot_content = self.loadedYardEdiContent(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOT",
                        date=stock.mot_date,
                        time=stock.mot_time,
                        current_location=stock.mot_current_location,
                        to_location=stock.mot_to_location,
                        booking_no=stock.mot_booking_no,
                        customer="",
                        transporter=stock.mot_transporter,
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                attachment_list.append(mot_content["content"])

            if stock.mit_date:
                if stock.site.organization == "Golden Horn Container Service":
                    mit_content = self.loadedYardEdiContent(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MIT",
                        date=stock.mit_date,
                        time=stock.mit_time,
                        current_location="INMJ1",
                        to_location="",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                else:
                    mit_content = self.loadedYardEdiContent(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MIT",
                        date=stock.mit_date,
                        time=stock.mit_time,
                        current_location=stock.mit_current_location,
                        to_location="",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                attachment_list.append(mit_content["content"])

            if stock.mor_date:
                if stock.site.organization == "Golden Horn Container Service":
                    mor_content = self.loadedYardEdiContent(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOR",
                        date=stock.mor_date,
                        time=stock.mor_time,
                        current_location="INMJ1",
                        to_location="INGHK",
                        booking_no=stock.booking_no,
                        customer="",
                        transporter="HRL001",
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )
                else:
                    mor_content = self.loadedYardEdiContent(
                        container_no=stock.container_no,
                        type_size=stock.type_size,
                        move_code="MOR",
                        date=stock.mor_date,
                        time=stock.mor_time,
                        current_location=stock.mor_current_location,
                        to_location=stock.mor_to_location,
                        booking_no=stock.mor_booking_no,
                        customer="",
                        transporter=stock.mor_transporter,
                        truck_no="",
                        condition="",
                        mode_of_transport="",
                        job_order_no=stock.seal_no,
                    )

                attachment_list.append(mor_content["content"])

            if stock.van_date:
                van_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="VAN",
                    date=stock.van_date,
                    time=stock.van_time,
                    current_location="NPBRG",
                    to_location="INMJ1",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="CONKOL",
                    truck_no="",
                    condition="",
                    mode_of_transport="",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(van_content["content"])
            if stock.expin_date:
                expin_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="EXPIN",
                    date=stock.expin_date,
                    time=stock.expin_time,
                    current_location="NPBRG",
                    to_location="",
                    booking_no=stock.booking_no,
                    customer="",
                    transporter="",
                    truck_no="",
                    condition="",
                    mode_of_transport="R",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(expin_content["content"])

            if stock.eot_date:
                eot_content = self.loadedYardEdiContent(
                    container_no=stock.container_no,
                    type_size=stock.type_size,
                    move_code="EOT",
                    date=stock.eot_date,
                    time=stock.eot_time,
                    current_location="NPBRG",
                    to_location=stock.eot_to_location,
                    booking_no=stock.booking_no,
                    customer="",
                    transporter=stock.eot_transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport="T",
                    job_order_no=stock.seal_no,
                )
                attachment_list.append(eot_content["content"])
        return attachment_list

    def makeLoadedYardEdiFile(self, edi_content):

        if not os.path.exists(os.path.join(BASE_DIR, "temp/loaded_yard_edi/")):
            os.makedirs(os.path.join(BASE_DIR, "temp/loaded_yard_edi/"))
        temp_file_path = os.path.join(BASE_DIR, f"temp/loaded_yard_edi/loaded_yard.edi")

        with open(temp_file_path, "w") as temp:
            temp.write(edi_content)

        return temp_file_path

    def downloadLoadedYardEdi(self, temp_file_path):
        current_date_time = datetime.now()
        current_date_time_str = current_date_time.strftime("%Y-%m-%d %H:%M:%S")
        with open(temp_file_path, "rb") as temp:
            file_response = HttpResponse(temp.read(), content_type=f"application/edi")
            file_response["Content-Disposition"] = (
                f'attachment; filename="{current_date_time_str}_loaded_yard.edi"'
            )
            os.remove(temp_file_path)
        return file_response

    def loadedYardInData(self, data):
        return {
            "pk": data.pk,
            "container_no": data.container_no or "",
            "size": data.type_size or "",
            "port": data.port or "",
            "process_type": data.process_type or "",
            "liner": data.liner_merchant or "",
            "inward_rake": data.inward_rake or "",
            "outward_rake": data.outward_rake or "",
            "in_date": data.iit_date if data.iit_date else "",
            "iit_date": data.iit_date if data.iit_date else "",
            "iit_time": data.iit_time.strftime("%H:%M") if data.iit_time else "",
            "iit_move_code": "Loaded IN ICD" if data.iit_date else "",
            "mtin_date": data.mtin_date if data.mtin_date else "",
            "mtin_time": data.mtin_time.strftime("%H:%M") if data.mtin_time else "",
            "mtin_move_code": "Empty IN ICD from Party" if data.mtin_date else "",
            "mir_date": data.mir_date if data.mir_date else "",
            "mir_time": data.mir_time.strftime("%H:%M") if data.mir_time else "",
            "mir_move_code": (
                "Empty IN ICD plot from Golden Plot" if data.mir_date else ""
            ),
            "mit_date": data.mit_date if data.mit_date else "",
            "mit_time": data.mit_time.strftime("%H:%M") if data.mit_time else "",
            "mit_current_location": data.mit_current_location or "",
            "mit_move_code": (
                "Terminal IN empty (kol) from Nepal rake" if data.mit_date else ""
            ),
            "expin_date": data.expin_date if data.expin_date else "",
            "expin_time": data.expin_time.strftime("%H:%M") if data.expin_time else "",
            "expin_move_code": "Party IN Loaded" if data.expin_date else "",
            "booking_no": data.booking_no or "",
            "seal_no": data.seal_no or "",
            "report": data.report or "",
            "remarks": data.remarks or "",
            "location": data.location.name if data.location else "",
            "site": data.site.name if data.site else "",
        }

    def loadedYardOutData(self, data):
        return {
            "pk": data.pk,
            "container_no": data.container_no or "",
            "size": data.type_size or "",
            "port": data.port or "",
            "process_type": data.process_type or "",
            "liner": data.liner_merchant or "",
            "inward_rake": data.inward_rake or "",
            "outward_rake": data.outward_rake or "",
            "out_date": data.dvan_date if data.dvan_date else "",
            "dvan_date": data.dvan_date if data.dvan_date else "",
            "dvan_time": data.dvan_time.strftime("%H:%M") if data.dvan_time else "",
            "dvan_move_code": (
                "Load OUT factory,CFS etc from ICD" if data.dvan_date else ""
            ),
            "van_date": data.van_date if data.van_date else "",
            "van_time": data.van_time.strftime("%H:%M") if data.van_time else "",
            "van_move_code": "Empty Out Party from ICD" if data.van_date else "",
            "mot_date": data.mot_date if data.mot_date else "",
            "mot_time": data.mot_time.strftime("%H:%M") if data.mot_time else "",
            "mot_current_location": data.mot_current_location or "",
            "mot_to_location": data.mot_to_location or "",
            "mot_booking_no": data.mot_booking_no or "",
            "mot_transporter": data.mot_transporter or "",
            "mot_truck_no": data.mot_truck_no or "",
            "mot_to_depot_code": data.mot_to_depot_code or "",
            "mot_move_code": "rake out empty from ICD" if data.mot_date else "",
            "mor_date": data.mor_date if data.mor_date else "",
            "mor_time": data.mor_time.strftime("%H:%M") if data.mor_time else "",
            "mor_current_location": data.mor_current_location or "",
            "mor_to_location": data.mor_to_location or "",
            "mor_booking_no": data.mor_booking_no or "",
            "mor_transporter": data.mor_transporter or "",
            "mor_truck_no": data.mor_truck_no or "",
            "mor_to_depot_code": data.mor_to_depot_code or "",
            "mor_move_code": (
                "Terminal OUT empty (kol) to Golden Plot" if data.mor_date else ""
            ),
            "eot_date": data.eot_date if data.eot_date else "",
            "eot_time": data.eot_time.strftime("%H:%M") if data.eot_time else "",
            "eot_move_code": "Rake Out Loaded" if data.eot_date else "",
            "eot_to_location": data.eot_to_location or "",
            "eot_to_depot_code": data.eot_to_depot_code or "",
            "eot_transporter": data.eot_transporter or "",
            "booking_no": data.booking_no or "",
            "seal_no": data.seal_no or "",
            "report": data.report or "",
            "remarks": data.remarks or "",
            "location": data.location.name if data.location else "",
            "site": data.site.name if data.site else "",
        }

    def getClientSpecificContainerData(self, pk):
        instance = LoadedYard.objects.get(pk=pk)
        if instance.process_type == "IN":
            return self.loadedYardInData(data=instance)
        else:
            return self.loadedYardOutData(data=instance)

    def validateMoveCodesClientSpecific(self, data):
        move_codes = []
        if data["process_type"] == "IN":
            for date_field, move_code in [
                ("iit_date", "IIT"),
                ("mtin_date", "MTIN"),
                ("mir_date", "MIR"),
                ("mit_date", "MIT"),
                ("expin_date", "EXPIN"),
            ]:
                if data[date_field]:
                    date_obj = datetime.strptime(data[date_field], "%Y-%m-%d").date()
                    if (
                        LoadedYard.objects.filter(
                            container_no=data["container_no"],
                            **{date_field: date_obj},
                            location__name=data["location"],
                            site__name=data["site"],
                        )
                        .exclude(pk=data["pk"])
                        .exists()
                    ):
                        move_codes.append(move_code)
        else:
            for date_field, move_code in [
                ("dvan_date", "DVAN"),
                ("mot_date", "MOT"),
                ("mor_date", "MOR"),
                ("van_date", "VAN"),
                ("eot_date", "EOT"),
            ]:
                if data[date_field]:
                    date_obj = datetime.strptime(data[date_field], "%Y-%m-%d").date()
                    if (
                        LoadedYard.objects.filter(
                            container_no=data["container_no"],
                            **{date_field: date_obj},
                            location__name=data["location"],
                            site__name=data["site"],
                        )
                        .exclude(pk=data["pk"])
                        .exists()
                    ):
                        move_codes.append(move_code)

        return move_codes

    def getDateTimeObj(self, date_str, time_str):
        if date_str:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
            time = datetime.strptime(time_str, "%H:%M").time()
        else:
            date = None
            time = None
        return date, time

    def updateInstance(self, data):

        instance = LoadedYard.objects.get(pk=data["pk"])
        instance.container_no = data["container_no"]
        instance.type_size = data["size"]
        instance.port = data["port"]
        instance.process_type = data["process_type"]
        instance.liner_merchant = data["liner"]
        instance.inward_rake = data["inward_rake"]
        instance.outward_rake = data["outward_rake"]
        instance.booking_no = data["booking_no"]
        instance.seal_no = data["seal_no"]
        instance.report = data["report"]
        instance.remarks = data["remarks"]

        if data["process_type"] == "IN":
            iit_date, iit_time = self.getDateTimeObj(
                date_str=data["iit_date"], time_str=data["iit_time"]
            )

            mtin_date, mtin_time = self.getDateTimeObj(
                date_str=data["mtin_date"], time_str=data["mtin_time"]
            )

            mir_date, mir_time = self.getDateTimeObj(
                date_str=data["mir_date"], time_str=data["mir_time"]
            )

            mit_date, mit_time = self.getDateTimeObj(
                date_str=data["mit_date"], time_str=data["mit_time"]
            )

            expin_date, expin_time = self.getDateTimeObj(
                date_str=data["expin_date"], time_str=data["expin_time"]
            )

            instance.iit_date = iit_date
            instance.iit_time = iit_time
            instance.mtin_date = mtin_date
            instance.mtin_time = mtin_time
            instance.mir_date = mir_date
            instance.mir_time = mir_time
            instance.mit_date = mit_date
            instance.mit_time = mit_time
            instance.expin_date = expin_date
            instance.expin_time = expin_time
            if instance.site.organization != "Golden Horn Containers Service":
                instance.mit_current_location = data["mit_current_location"]

        if data["process_type"] == "OUT":
            dvan_date, dvan_time = self.getDateTimeObj(
                date_str=data["dvan_date"], time_str=data["dvan_time"]
            )

            van_date, van_time = self.getDateTimeObj(
                date_str=data["van_date"], time_str=data["van_time"]
            )

            mot_date, mot_time = self.getDateTimeObj(
                date_str=data["mot_date"], time_str=data["mot_time"]
            )

            mor_date, mor_time = self.getDateTimeObj(
                date_str=data["mor_date"], time_str=data["mor_time"]
            )

            eot_date, eot_time = self.getDateTimeObj(
                date_str=data["eot_date"], time_str=data["eot_time"]
            )
            instance.dvan_date = dvan_date
            instance.dvan_time = dvan_time
            instance.van_date = van_date
            instance.van_time = van_time
            instance.mot_date = mot_date
            instance.mot_time = mot_time
            instance.mor_date = mor_date
            instance.mor_time = mor_time
            instance.eot_date = eot_date
            instance.eot_time = eot_time
            if instance.site.organization != "Golden Horn Containers Service":
                instance.mot_current_location = data["mot_current_location"]
                instance.mot_to_location = data["mot_to_location"]
                instance.mot_booking_no = data["mot_booking_no"]
                instance.mot_transporter = data["mot_transporter"]
                instance.mot_truck_no = data["mot_truck_no"]
                instance.mot_to_depot_code = data["mot_to_depot_code"]
                instance.mor_current_location = data["mor_current_location"]
                instance.mor_to_location = data["mor_to_location"]
                instance.mor_booking_no = data["mor_booking_no"]
                instance.mor_transporter = data["mor_transporter"]
                instance.mor_truck_no = data["mor_truck_no"]
                instance.mor_to_depot_code = data["mor_to_depot_code"]
                instance.eot_to_location = data["eot_to_location"]
                instance.eot_transporter = data["eot_transporter"]
                instance.eot_to_depot_code = data["eot_to_depot_code"]
        instance.save()

    def getLoadedYardDataForInOut(self, process, date, container_no, location, site):
        if process == "IN":
            instance = LoadedYard.objects.select_related("location", "site").get(
                container_no=container_no,
                iit_date=date,
                location__name=location,
                site__name=site,
            )
            return self.loadedYardInData(instance)
        if process == "OUT":
            instance = LoadedYard.objects.select_related("location", "site").get(
                container_no=container_no,
                dvan_date=date,
                location__name=location,
                site__name=site,
            )
            return self.loadedYardOutData(instance)

    def getDateObject(self, date_str):
        if date_str:
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
        else:
            date = None
        return date

    def getSampleFile(self, site):
        if Site.objects.get(name=site).organization == "Golden Horn Containers Service":

            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_loaded_yard_upload.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_loaded_yard_upload.xlsx"'
                )

        else:

            temp_file_path = os.path.join(
                BASE_DIR, "sample_stock/sample_loaded_yard_client_specific.xlsx"
            )
            with open(temp_file_path, "rb") as temp:
                file_response = HttpResponse(
                    temp.read(), content_type=f"application/xlsx"
                )
                file_response["Content-Disposition"] = (
                    f'attachment; filename="sample_loaded_yard_client_specific.xlsx"'
                )

        return file_response

    def extractDataList(self, input_excel):
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["loaded_yard"]
        container_no_raw = []
        size_raw = []
        port_raw = []
        liner_raw = []
        inward_rake_raw = []
        outward_rake_raw = []
        iit_date_raw = []
        iit_time_raw = []
        dvan_date_raw = []
        dvan_time_raw = []
        mtin_date_raw = []
        mtin_time_raw = []
        van_date_raw = []
        van_time_raw = []
        booking_no_raw = []
        seal_no_raw = []
        mir_date_raw = []
        mir_time_raw = []
        mot_date_raw = []
        mot_time_raw = []
        mit_date_raw = []
        mit_time_raw = []
        mor_date_raw = []
        mor_time_raw = []
        expin_date_raw = []
        expin_time_raw = []
        eot_date_raw = []
        eot_time_raw = []
        report_raw = []
        remarks_raw = []

        for row in sheet.iter_rows():
            container_no_raw.append(row[0].value if row[0].value is not None else "")
            size_raw.append(row[1].value if row[1].value is not None else "")
            port_raw.append(row[2].value if row[2].value is not None else "")
            liner_raw.append(row[3].value if row[3].value is not None else "")
            inward_rake_raw.append(row[4].value if row[4].value is not None else "")
            outward_rake_raw.append(row[5].value if row[5].value is not None else "")
            iit_date_raw.append(row[6].value if row[6].value is not None else "")
            iit_time_raw.append(row[7].value if row[7].value is not None else "")
            dvan_date_raw.append(row[8].value if row[8].value is not None else "")
            dvan_time_raw.append(row[9].value if row[9].value is not None else "")
            mtin_date_raw.append(row[10].value if row[10].value is not None else "")
            mtin_time_raw.append(row[11].value if row[11].value is not None else "")
            van_date_raw.append(row[12].value if row[12].value is not None else "")
            van_time_raw.append(row[13].value if row[13].value is not None else "")
            booking_no_raw.append(row[14].value if row[14].value is not None else "")
            seal_no_raw.append(row[15].value if row[15].value is not None else "")
            mir_date_raw.append(row[16].value if row[16].value is not None else "")
            mir_time_raw.append(row[17].value if row[17].value is not None else "")
            mot_date_raw.append(row[18].value if row[18].value is not None else "")
            mot_time_raw.append(row[19].value if row[19].value is not None else "")
            mit_date_raw.append(row[20].value if row[20].value is not None else "")
            mit_time_raw.append(row[21].value if row[21].value is not None else "")
            mor_date_raw.append(row[22].value if row[22].value is not None else "")
            mor_time_raw.append(row[23].value if row[23].value is not None else "")
            expin_date_raw.append(row[24].value if row[24].value is not None else "")
            expin_time_raw.append(row[25].value if row[25].value is not None else "")
            eot_date_raw.append(row[26].value if row[26].value is not None else "")
            eot_time_raw.append(row[27].value if row[27].value is not None else "")
            report_raw.append(row[28].value if row[28].value is not None else "")
            remarks_raw.append(row[29].value if row[29].value is not None else "")

        headers = [
            container_no_raw.pop(0),
            size_raw.pop(0),
            port_raw.pop(0),
            liner_raw.pop(0),
            inward_rake_raw.pop(0),
            outward_rake_raw.pop(0),
            iit_date_raw.pop(0),
            iit_time_raw.pop(0),
            dvan_date_raw.pop(0),
            dvan_time_raw.pop(0),
            mtin_date_raw.pop(0),
            mtin_time_raw.pop(0),
            van_date_raw.pop(0),
            van_time_raw.pop(0),
            booking_no_raw.pop(0),
            seal_no_raw.pop(0),
            mir_date_raw.pop(0),
            mir_time_raw.pop(0),
            mot_date_raw.pop(0),
            mot_time_raw.pop(0),
            mit_date_raw.pop(0),
            mit_time_raw.pop(0),
            mor_date_raw.pop(0),
            mor_time_raw.pop(0),
            expin_date_raw.pop(0),
            expin_time_raw.pop(0),
            eot_date_raw.pop(0),
            eot_time_raw.pop(0),
            report_raw.pop(0),
            remarks_raw.pop(0),
        ]
        if headers != [
            "CONTAINER",
            "SIZE",
            "PORT",
            "LINER/MERCHANT",
            "INWARD RAKE",
            "OUTWARD RAKE",
            "IIT",
            "IIT TIME",
            "DVAN",
            "DVAN TIME",
            "MTIN",
            "MTIN TIME",
            "VAN",
            "VAN TIME",
            "BOOKING NO",
            "SEAL NO",
            "MIR",
            "MIR TIME",
            "MOT",
            "MOT TIME",
            "MIT",
            "MIT TIME",
            "MOR",
            "MOR TIME",
            "EXPIN",
            "EXPIN TIME",
            "EOT",
            "EOT TIME",
            "REPORT",
            "REMARKS",
        ]:
            return "Header Not Found"

        data = [
            (
                container_no,
                size,
                port,
                liner,
                inward_rake,
                outward_rake,
                iit_date,
                iit_time.strftime("%H:%M:%S") if iit_time else "",
                dvan_date,
                dvan_time.strftime("%H:%M:%S") if dvan_time else "",
                mtin_date,
                mtin_time.strftime("%H:%M:%S") if mtin_time else "",
                van_date,
                van_time.strftime("%H:%M:%S") if van_date else "",
                booking_no,
                seal_no,
                mir_date,
                mir_time.strftime("%H:%M:%S") if mir_time else "",
                mot_date,
                mot_time.strftime("%H:%M:%S") if mot_time else "",
                mit_date,
                mit_time.strftime("%H:%M:%S") if mit_time else "",
                mor_date,
                mor_time.strftime("%H:%M:%S") if mor_time else "",
                expin_date,
                expin_time.strftime("%H:%M:%S") if expin_time else "",
                eot_date,
                eot_time.strftime("%H:%M:%S") if eot_time else "",
                report,
                remarks,
            )
            for container_no, size, port, liner, inward_rake, outward_rake, iit_date, iit_time, dvan_date, dvan_time, mtin_date, mtin_time, van_date, van_time, booking_no, seal_no, mir_date, mir_time, mot_date, mot_time, mit_date, mit_time, mor_date, mor_time, expin_date, expin_time, eot_date, eot_time, report, remarks in zip(
                container_no_raw,
                size_raw,
                port_raw,
                liner_raw,
                inward_rake_raw,
                outward_rake_raw,
                iit_date_raw,
                iit_time_raw,
                dvan_date_raw,
                dvan_time_raw,
                mtin_date_raw,
                mtin_time_raw,
                van_date_raw,
                van_time_raw,
                booking_no_raw,
                seal_no_raw,
                mir_date_raw,
                mir_time_raw,
                mot_date_raw,
                mot_time_raw,
                mit_date_raw,
                mit_time_raw,
                mor_date_raw,
                mor_time_raw,
                expin_date_raw,
                expin_time_raw,
                eot_date_raw,
                eot_time_raw,
                report_raw,
                remarks_raw,
            )
            if container_no != ""
        ]

        extracted_data_list = [
            {
                "sr_no": str(i),
                "container_no": str(container_no),
                "size": str(size),
                "port": str(port),
                "liner": str(liner),
                "inward_rake": str(inward_rake),
                "outward_rake": str(outward_rake),
                "iit_date": str(iit_date),
                "iit_time": str(iit_time),
                "dvan_date": str(dvan_date),
                "dvan_time": str(dvan_time),
                "mtin_date": str(mtin_date),
                "mtin_time": str(mtin_time),
                "van_date": str(van_date),
                "van_time": str(van_time),
                "booking_no": str(booking_no),
                "seal_no": str(seal_no),
                "mir_date": str(mir_date),
                "mir_time": str(mir_time),
                "mot_date": str(mot_date),
                "mot_time": str(mot_time),
                "mit_date": str(mit_date),
                "mit_time": str(mit_time),
                "mor_date": str(mor_date),
                "mor_time": str(mor_time),
                "expin_date": str(expin_date),
                "expin_time": str(expin_time),
                "eot_date": str(eot_date),
                "eot_time": str(eot_time),
                "report": str(report),
                "remarks": str(remarks),
            }
            for i, (
                container_no,
                size,
                port,
                liner,
                inward_rake,
                outward_rake,
                iit_date,
                iit_time,
                dvan_date,
                dvan_time,
                mtin_date,
                mtin_time,
                van_date,
                van_time,
                booking_no,
                seal_no,
                mir_date,
                mir_time,
                mot_date,
                mot_time,
                mit_date,
                mit_time,
                mor_date,
                mor_time,
                expin_date,
                expin_time,
                eot_date,
                eot_time,
                report,
                remarks,
            ) in enumerate(data, start=1)
        ]

        ps.close()

        return extracted_data_list

    def checkErrors(self, extracted_data_list, location, site):
        error_data = []
        error_data_msg = {}
        correct_data = []

        for each in extracted_data_list:
            error_msg = []
            in_move_code_count = 0
            out_move_code_count = 0
            container_no_str = each["container_no"]

            if len(container_no_str) == 11 and check_char_digit(container_no_str):
                is_container_repeated = any(
                    obj_data["container_no"] == container_no_str
                    for obj_data in correct_data
                )
                if is_container_repeated:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this({container_no_str}) container is repeated in your file"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no ({container_no_str}) is invalid"
                )

            size_str = each["size"]
            if not size_str == "":
                error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in SIZE column, "
                    f"Please Fill Data"
                )

            columns = [
                "iit",
                "dvan",
                "mtin",
                "van",
                "mir",
                "mot",
                "mit",
                "mor",
                "expin",
                "eot",
            ]
            for column in columns:
                date_str = each[f"{column}_date"]
                time_str = each[f"{column}_time"]

                if not date_str == "":
                    try:
                        datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
                        error_msg.append("")
                    except:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} column,"
                            f"date is not in dd-mm-yyyy format"
                        )
                    if time_str == "":
                        time_str = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                            .strftime("%H:%M:%S")
                        )
                    else:
                        try:
                            datetime.strptime(time_str, "%H:%M:%S").time()
                            error_msg.append("")
                        except:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} TIME column,"
                                f"time is not in HH:MM format"
                            )
                else:
                    error_msg.extend([""] * 2)

            in_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["iit", "mtin", "mir", "mit", "expin"]
            )
            out_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["dvan", "van", "mot", "mor", "eot"]
            )

            booking_no_str = each["booking_no"]
            if booking_no_str == "":
                if out_move_code_count > 0:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                        f"Cannot keep booking_no column empty for out move code"
                    )
                else:
                    error_msg.append("")
            else:
                error_msg.append("")

            iit_date = self.getDateObject(date_str=each["iit_date"])
            dvan_date = self.getDateObject(date_str=each["dvan_date"])
            # mtin_date = get_date_obj(date_str=each["mtin_date"])
            # van_date = get_date_obj(date_str=each["van_date"])
            # mir_date = get_date_obj(date_str=each["mir_date"])
            # mot_date = get_date_obj(date_str=each["mot_date"])
            # mit_date = get_date_obj(date_str=each["mit_date"])
            # mor_date = get_date_obj(date_str=each["mor_date"])
            # expin_date = get_date_obj(date_str=each["expin_date"])
            # eot_date = get_date_obj(date_str=each["eot_date"])

            if in_move_code_count == 0 and out_move_code_count == 0:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} Please fill atleast one move code data"
                )
            else:
                if (
                    LoadedYard.objects.filter(
                        Q(container_no=each["container_no"])
                        & Q(process_type="IN")
                        & Q(iit_date=iit_date)
                        & Q(location__name=location)
                        & Q(site__name=site)
                    ).exists()
                    or LoadedYard.objects.filter(
                        Q(container_no=each["container_no"])
                        & Q(process_type="OUT")
                        & Q(dvan_date=dvan_date)
                        & Q(location__name=location)
                        & Q(site__name=site)
                    ).exists()
                ):
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} {container_no_str} Similar Data Exists"
                    )
                else:
                    error_msg.append("")
                if each["dvan_date"] == "" and out_move_code_count != 0:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} DVAN DATE is mandatory if you want to fill OUT move codes,"
                    )
                else:
                    error_msg.append("")
                if each["iit_date"] == "" and in_move_code_count != 0:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} IIT DATE is mandatory if you want to fill IN move codes,"
                    )
                else:
                    error_msg.append("")
                error_msg.append("")

            each["in_move_code_count"] = in_move_code_count
            each["out_move_code_count"] = out_move_code_count

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)

        return correct_data, error_data, error_data_msg

    def collectMainData(self, correct_data, error_data, error_data_msg):
        correct_data_count = str(len(correct_data))
        error_data_count = str(len(error_data))
        return {
            "importable_data": correct_data,
            "importable_data_count": correct_data_count,
            "rejected_data": error_data,
            "rejected_data_count": error_data_count,
            "faults": error_data_msg,
        }

    def extractLoadedYardData(self, input_excel, location, site):
        extracted_data_list = self.extractDataList(input_excel)

        correct_data, error_data, error_data_msg = self.checkErrors(
            extracted_data_list, location, site
        )
        main_data = self.collectMainData(correct_data, error_data, error_data_msg)

        return main_data

    def clientSpecificExtractDataList(self, input_excel):
        ps = openpyxl.load_workbook(input_excel)
        sheet = ps["loaded_yard"]
        container_no_raw = []
        size_raw = []
        port_raw = []
        liner_raw = []
        inward_rake_raw = []
        outward_rake_raw = []
        iit_date_raw = []
        iit_time_raw = []
        dvan_date_raw = []
        dvan_time_raw = []
        mtin_date_raw = []
        mtin_time_raw = []
        van_date_raw = []
        van_time_raw = []
        booking_no_raw = []
        seal_no_raw = []
        mir_date_raw = []
        mir_time_raw = []
        mot_date_raw = []
        mot_time_raw = []
        mot_current_location_raw = []
        mot_to_location_raw = []
        mot_booking_no_raw = []
        mot_transporter_raw = []
        mot_truck_no_raw = []
        mot_to_depot_code_raw = []
        mit_date_raw = []
        mit_time_raw = []
        mit_current_location_raw = []
        mor_date_raw = []
        mor_time_raw = []
        mor_current_location_raw = []
        mor_to_location_raw = []
        mor_booking_no_raw = []
        mor_transporter_raw = []
        mor_truck_no_raw = []
        mor_to_depot_code_raw = []
        expin_date_raw = []
        expin_time_raw = []
        eot_date_raw = []
        eot_time_raw = []
        report_raw = []
        remarks_raw = []
        eot_to_location_raw = []
        eot_transporter_raw = []
        eot_to_depot_code_raw = []

        for row in sheet.iter_rows():
            container_no_raw.append(row[0].value if row[0].value is not None else "")
            size_raw.append(row[1].value if row[1].value is not None else "")
            port_raw.append(row[2].value if row[2].value is not None else "")
            liner_raw.append(row[3].value if row[3].value is not None else "")
            inward_rake_raw.append(row[4].value if row[4].value is not None else "")
            outward_rake_raw.append(row[5].value if row[5].value is not None else "")
            iit_date_raw.append(row[6].value if row[6].value is not None else "")
            iit_time_raw.append(row[7].value if row[7].value is not None else "")
            dvan_date_raw.append(row[8].value if row[8].value is not None else "")
            dvan_time_raw.append(row[9].value if row[9].value is not None else "")
            mtin_date_raw.append(row[10].value if row[10].value is not None else "")
            mtin_time_raw.append(row[11].value if row[11].value is not None else "")
            van_date_raw.append(row[12].value if row[12].value is not None else "")
            van_time_raw.append(row[13].value if row[13].value is not None else "")
            booking_no_raw.append(row[14].value if row[14].value is not None else "")
            seal_no_raw.append(row[15].value if row[15].value is not None else "")
            mir_date_raw.append(row[16].value if row[16].value is not None else "")
            mir_time_raw.append(row[17].value if row[17].value is not None else "")
            mot_date_raw.append(row[18].value if row[18].value is not None else "")
            mot_time_raw.append(row[19].value if row[19].value is not None else "")
            mot_current_location_raw.append(
                row[20].value if row[20].value is not None else ""
            )
            mot_to_location_raw.append(
                row[21].value if row[21].value is not None else ""
            )
            mot_booking_no_raw.append(
                row[22].value if row[22].value is not None else ""
            )
            mot_transporter_raw.append(
                row[23].value if row[23].value is not None else ""
            )
            mot_truck_no_raw.append(row[24].value if row[24].value is not None else "")
            mot_to_depot_code_raw.append(
                row[25].value if row[25].value is not None else ""
            )

            mit_date_raw.append(row[26].value if row[26].value is not None else "")
            mit_time_raw.append(row[27].value if row[27].value is not None else "")
            mit_current_location_raw.append(
                row[28].value if row[28].value is not None else ""
            )
            mor_date_raw.append(row[29].value if row[29].value is not None else "")
            mor_time_raw.append(row[30].value if row[30].value is not None else "")
            mor_current_location_raw.append(
                row[31].value if row[31].value is not None else ""
            )
            mor_to_location_raw.append(
                row[32].value if row[32].value is not None else ""
            )
            mor_booking_no_raw.append(
                row[33].value if row[33].value is not None else ""
            )
            mor_transporter_raw.append(
                row[34].value if row[34].value is not None else ""
            )
            mor_truck_no_raw.append(row[35].value if row[35].value is not None else "")
            mor_to_depot_code_raw.append(
                row[36].value if row[36].value is not None else ""
            )
            expin_date_raw.append(row[37].value if row[37].value is not None else "")
            expin_time_raw.append(row[38].value if row[38].value is not None else "")
            eot_date_raw.append(row[39].value if row[39].value is not None else "")
            eot_time_raw.append(row[40].value if row[40].value is not None else "")
            eot_to_location_raw.append(
                row[41].value if row[41].value is not None else ""
            )
            eot_to_depot_code_raw.append(
                row[42].value if row[42].value is not None else ""
            )
            eot_transporter_raw.append(
                row[43].value if row[43].value is not None else ""
            )
            report_raw.append(row[44].value if row[44].value is not None else "")
            remarks_raw.append(row[45].value if row[45].value is not None else "")

        headers = [
            container_no_raw.pop(0),
            size_raw.pop(0),
            port_raw.pop(0),
            liner_raw.pop(0),
            inward_rake_raw.pop(0),
            outward_rake_raw.pop(0),
            iit_date_raw.pop(0),
            iit_time_raw.pop(0),
            dvan_date_raw.pop(0),
            dvan_time_raw.pop(0),
            mtin_date_raw.pop(0),
            mtin_time_raw.pop(0),
            van_date_raw.pop(0),
            van_time_raw.pop(0),
            booking_no_raw.pop(0),
            seal_no_raw.pop(0),
            mir_date_raw.pop(0),
            mir_time_raw.pop(0),
            mot_date_raw.pop(0),
            mot_time_raw.pop(0),
            mot_current_location_raw.pop(0),
            mot_to_location_raw.pop(0),
            mot_booking_no_raw.pop(0),
            mot_transporter_raw.pop(0),
            mot_truck_no_raw.pop(0),
            mot_to_depot_code_raw.pop(0),
            mit_date_raw.pop(0),
            mit_time_raw.pop(0),
            mit_current_location_raw.pop(0),
            mor_date_raw.pop(0),
            mor_time_raw.pop(0),
            mor_current_location_raw.pop(0),
            mor_to_location_raw.pop(0),
            mor_booking_no_raw.pop(0),
            mor_transporter_raw.pop(0),
            mor_truck_no_raw.pop(0),
            mor_to_depot_code_raw.pop(0),
            expin_date_raw.pop(0),
            expin_time_raw.pop(0),
            eot_date_raw.pop(0),
            eot_time_raw.pop(0),
            eot_to_location_raw.pop(0),
            eot_to_depot_code_raw.pop(0),
            eot_transporter_raw.pop(0),
            report_raw.pop(0),
            remarks_raw.pop(0),
        ]
        if headers != [
            "CONTAINER",
            "SIZE",
            "PORT",
            "LINER/MERCHANT",
            "INWARD RAKE",
            "OUTWARD RAKE",
            "IIT",
            "IIT TIME",
            "DVAN",
            "DVAN TIME",
            "MTIN",
            "MTIN TIME",
            "VAN",
            "VAN TIME",
            "BOOKING NO",
            "SEAL NO",
            "MIR",
            "MIR TIME",
            "MOT",
            "MOT TIME",
            "MOT CURRENT LOCATION",
            "MOT TO LOCATION",
            "MOT BOOKING REF NO",
            "MOT TRANSPORTER",
            "MOT TRUCK NO",
            "MOT TO DEPOT CODE",
            "MIT",
            "MIT TIME",
            "MIT CURRENT LOCATION",
            "MOR",
            "MOR TIME",
            "MOR CURRENT LOCATION",
            "MOR TO LOCATION",
            "MOR BOOKING REF NO",
            "MOR TRANSPORTER",
            "MOR TRUCK NO",
            "MOR TO DEPOT CODE",
            "EXPIN",
            "EXPIN TIME",
            "EOT",
            "EOT TIME",
            "EOT TO LOCATION",
            "EOT TO DEPOT CODE",
            "EOT TRANSPORTER",
            "REPORT",
            "REMARKS",
        ]:
            return "Header Not Found"

        data = [
            (
                container_no,
                size,
                port,
                liner,
                inward_rake,
                outward_rake,
                iit_date,
                iit_time.strftime("%H:%M:%S") if iit_time else "",
                dvan_date,
                dvan_time.strftime("%H:%M:%S") if dvan_time else "",
                mtin_date,
                mtin_time.strftime("%H:%M:%S") if mtin_time else "",
                van_date,
                van_time.strftime("%H:%M:%S") if van_time else "",
                booking_no,
                seal_no,
                mir_date,
                mir_time.strftime("%H:%M:%S") if mir_time else "",
                mot_date,
                mot_time.strftime("%H:%M:%S") if mot_time else "",
                mot_current_location,
                mot_to_location,
                mot_booking_no,
                mot_transporter,
                mot_truck_no,
                mot_to_depot_code,
                mit_date,
                mit_time.strftime("%H:%M:%S") if mit_time else "",
                mit_current_location,
                mor_date,
                mor_time.strftime("%H:%M:%S") if mor_time else "",
                mor_current_location,
                mor_to_location,
                mor_booking_no,
                mor_transporter,
                mor_truck_no,
                mor_to_depot_code,
                expin_date,
                expin_time.strftime("%H:%M:%S") if expin_time else "",
                eot_date,
                eot_time.strftime("%H:%M:%S") if eot_time else "",
                eot_to_location,
                eot_to_depot_code,
                eot_transporter,
                report,
                remarks,
            )
            for container_no, size, port, liner, inward_rake, outward_rake, iit_date, iit_time, dvan_date, dvan_time, mtin_date, mtin_time, van_date, van_time, booking_no, seal_no, mir_date, mir_time, mot_date, mot_time, mot_current_location, mot_to_location, mot_booking_no, mot_transporter, mot_truck_no, mot_to_depot_code, mit_date, mit_time, mit_current_location, mor_date, mor_time, mor_current_location, mor_to_location, mor_booking_no, mor_transporter, mor_truck_no, mor_to_depot_code, expin_date, expin_time, eot_date, eot_time, eot_to_location, eot_to_depot_code, eot_transporter, report, remarks in zip(
                container_no_raw,
                size_raw,
                port_raw,
                liner_raw,
                inward_rake_raw,
                outward_rake_raw,
                iit_date_raw,
                iit_time_raw,
                dvan_date_raw,
                dvan_time_raw,
                mtin_date_raw,
                mtin_time_raw,
                van_date_raw,
                van_time_raw,
                booking_no_raw,
                seal_no_raw,
                mir_date_raw,
                mir_time_raw,
                mot_date_raw,
                mot_time_raw,
                mot_current_location_raw,
                mot_to_location_raw,
                mot_booking_no_raw,
                mot_transporter_raw,
                mot_truck_no_raw,
                mot_to_depot_code_raw,
                mit_date_raw,
                mit_time_raw,
                mit_current_location_raw,
                mor_date_raw,
                mor_time_raw,
                mor_current_location_raw,
                mor_to_location_raw,
                mor_booking_no_raw,
                mor_transporter_raw,
                mor_truck_no_raw,
                mor_to_depot_code_raw,
                expin_date_raw,
                expin_time_raw,
                eot_date_raw,
                eot_time_raw,
                eot_to_location_raw,
                eot_to_depot_code_raw,
                eot_transporter_raw,
                report_raw,
                remarks_raw,
            )
            if container_no != ""
        ]

        extracted_data_list = [
            {
                "sr_no": str(i),
                "container_no": str(container_no),
                "size": str(size),
                "port": str(port),
                "liner": str(liner),
                "inward_rake": str(inward_rake),
                "outward_rake": str(outward_rake),
                "iit_date": str(iit_date),
                "iit_time": str(iit_time),
                "dvan_date": str(dvan_date),
                "dvan_time": str(dvan_time),
                "mtin_date": str(mtin_date),
                "mtin_time": str(mtin_time),
                "van_date": str(van_date),
                "van_time": str(van_time),
                "booking_no": str(booking_no),
                "seal_no": str(seal_no),
                "mir_date": str(mir_date),
                "mir_time": str(mir_time),
                "mot_date": str(mot_date),
                "mot_time": str(mot_time),
                "mot_current_location": str(mot_current_location),
                "mot_to_location": str(mot_to_location),
                "mot_booking_no": str(mot_booking_no),
                "mot_transporter": str(mot_transporter),
                "mot_truck_no": str(mot_truck_no),
                "mot_to_depot_code": str(mot_to_depot_code),
                "mit_date": str(mit_date),
                "mit_time": str(mit_time),
                "mit_current_location": str(mit_current_location),
                "mor_date": str(mor_date),
                "mor_time": str(mor_time),
                "mor_current_location": str(mor_current_location),
                "mor_to_location": str(mor_to_location),
                "mor_booking_no": str(mor_booking_no),
                "mor_transporter": str(mor_transporter),
                "mor_truck_no": str(mor_truck_no),
                "mor_to_depot_code": str(mor_to_depot_code),
                "expin_date": str(expin_date),
                "expin_time": str(expin_time),
                "eot_date": str(eot_date),
                "eot_time": str(eot_time),
                "eot_to_location": str(eot_to_location),
                "eot_to_depot_code": str(eot_to_depot_code),
                "eot_transporter": str(eot_transporter),
                "report": str(report),
                "remarks": str(remarks),
            }
            for i, (
                container_no,
                size,
                port,
                liner,
                inward_rake,
                outward_rake,
                iit_date,
                iit_time,
                dvan_date,
                dvan_time,
                mtin_date,
                mtin_time,
                van_date,
                van_time,
                booking_no,
                seal_no,
                mir_date,
                mir_time,
                mot_date,
                mot_time,
                mot_current_location,
                mot_to_location,
                mot_booking_no,
                mot_transporter,
                mot_truck_no,
                mot_to_depot_code,
                mit_date,
                mit_time,
                mit_current_location,
                mor_date,
                mor_time,
                mor_current_location,
                mor_to_location,
                mor_booking_no,
                mor_transporter,
                mor_truck_no,
                mor_to_depot_code,
                expin_date,
                expin_time,
                eot_date,
                eot_time,
                eot_to_location,
                eot_to_depot_code,
                eot_transporter,
                report,
                remarks,
            ) in enumerate(data, start=1)
        ]

        ps.close()

        return extracted_data_list

    def clientSpecificCheckErrors(self, extracted_data_list, location, site):
        error_data = []
        error_data_msg = {}
        correct_data = []

        for each in extracted_data_list:
            error_msg = []
            in_move_code_count = 0
            out_move_code_count = 0
            container_no_str = each["container_no"]

            if len(container_no_str) == 11 and check_char_digit(container_no_str):
                is_container_repeated = any(
                    obj_data["container_no"] == container_no_str
                    for obj_data in correct_data
                )
                if is_container_repeated:
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column, "
                        f"this({container_no_str}) container is repeated in your file"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in container_no column,"
                    f"container_no ({container_no_str}) is invalid"
                )

            size_str = each["size"]
            if not size_str == "":
                error_msg.append("")
            else:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} there is problem in SIZE column, "
                    f"Please Fill Data"
                )

            columns = [
                "iit",
                "dvan",
                "mtin",
                "van",
                "mir",
                "mot",
                "mit",
                "mor",
                "expin",
                "eot",
            ]
            for column in columns:
                date_str = each[f"{column}_date"]
                time_str = each[f"{column}_time"]

                if not date_str == "":
                    try:
                        datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
                        error_msg.append("")
                    except:
                        error_msg.append(
                            f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} column,"
                            f"date is not in dd-mm-yyyy format"
                        )
                    if time_str == "":
                        time_str = (
                            datetime.now()
                            .astimezone(timezone.get_current_timezone())
                            .time()
                            .strftime("%H:%M:%S")
                        )
                    else:
                        try:
                            datetime.strptime(time_str, "%H:%M:%S").time()
                            error_msg.append("")
                        except:
                            error_msg.append(
                                f"In row {str(int(each['sr_no']) + 2)} there is problem in {column.upper()} TIME column,"
                                f"time is not in HH:MM format"
                            )
                else:
                    error_msg.extend([""] * 2)

            in_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["iit", "mtin", "mir", "mit", "expin"]
            )
            out_move_code_count += sum(
                1
                for col in columns
                if each[f"{col}_date"] and col in ["dvan", "van", "mot", "mor", "eot"]
            )

            # In move codes validation

            if each["iit_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    iit_date=datetime.strptime(
                        each["iit_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in IIT DATE column,"
                        f"Container {container_no_str} with same IIT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["expin_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    expin_date=datetime.strptime(
                        each["expin_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in EXPIN DATE column,"
                        f"Container {container_no_str} with same EXPIN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mtin_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    mtin_date=datetime.strptime(
                        each["mtin_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MTIN DATE column,"
                        f"Container {container_no_str} with same MTIN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mir_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    mir_date=datetime.strptime(
                        each["mir_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MIR DATE column,"
                        f"Container {container_no_str} with same MIR date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mit_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    mit_date=datetime.strptime(
                        each["mit_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MIT DATE column,"
                        f"Container {container_no_str} with same MIT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            # Out Move code validations

            if each["dvan_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    dvan_date=datetime.strptime(
                        each["dvan_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in DVAN DATE column,"
                        f"Container {container_no_str} with same DVAN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["van_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    van_date=datetime.strptime(
                        each["van_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in VAN DATE column,"
                        f"Container {container_no_str} with same VAN date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mot_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    mot_date=datetime.strptime(
                        each["mot_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT DATE column,"
                        f"Container {container_no_str} with same MOT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mor_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    mor_date=datetime.strptime(
                        each["mor_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR DATE column,"
                        f"Container {container_no_str} with same MOR date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            eot_to_location_str = each["eot_to_location"]
            eot_to_depot_code_str = each["eot_to_depot_code"]
            eot_transporter_str = each["eot_transporter"]

            if each["eot_date"]:
                if LoadedYard.objects.filter(
                    container_no=container_no_str,
                    eot_date=datetime.strptime(
                        each["eot_date"], "%Y-%m-%d %H:%M:%S"
                    ).date(),
                    location__name=location,
                    site__name=site,
                ).exists():
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in EOT DATE column,"
                        f"Container {container_no_str} with same EOT date already exists"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            booking_no_str = each["booking_no"]
            if each["van_date"]:
                if booking_no_str == "":

                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                        f"Cannot keep booking_no column empty for VAN DATE"
                    )
                    # if out_move_code_count > 0:
                    #     error_msg.append(
                    #         f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                    #         f"Cannot keep booking_no column empty for out move code"
                    #     )
                else:
                    error_msg.append("")
            else:
                error_msg.append("")

            seal_no_str = each["seal_no"]
            if each["van_date"]:
                if seal_no_str == "":

                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in SEAL NO column,"
                        f"Cannot keep seal_no column empty for VAN DATE"
                    )
                    # if out_move_code_count > 0:
                    #     error_msg.append(
                    #         f"In row {str(int(each['sr_no']) + 2)} there is problem in BOOKING NO column,"
                    #         f"Cannot keep seal_no column empty for out move code"
                    #     )
                else:
                    error_msg.append("")
            else:
                error_msg.append("")

            mot_current_location_str = each["mot_current_location"]
            mot_to_location_str = each["mot_to_location"]
            mot_booking_no_str = each["mot_booking_no"]
            mot_transporter_str = each["mot_transporter"]
            mot_truck_no_str = each["mot_truck_no"]
            mot_to_depot_code_str = each["mot_to_depot_code"]

            if each["mot_date"]:
                if mot_current_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT CURRENT LOCATION column,"
                        f"Cannot keep MOT CURRENT LOCATION column empty for MOT move code"
                    )
                else:
                    error_msg.append("")
                if mot_to_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT TO LOCATION column,"
                        f"Cannot keep MOT TO LOCATION column empty for MOT move code"
                    )
                else:
                    error_msg.append("")
                if mot_booking_no_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT BOOKING NO REF column,"
                        f"Cannot keep MOT BOOKING NO REF column empty for MOT move code"
                    )
                else:
                    error_msg.append("")
                if mot_transporter_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOT TRANSPORTER column,"
                        f"Cannot keep MOT TRANSPORTER column empty for MOT move code"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.extend([""] * 4)

            mit_current_location_str = each["mit_current_location"]

            if each["mit_date"]:
                if mit_current_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MIT CURRENT LOCATION column,"
                        f"Cannot keep MIT CURRENT LOCATION column empty for MIT move code"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.append("")

            if each["mor_date"]:
                mor_current_location_str = each["mor_current_location"]
                mor_to_location_str = each["mor_to_location"]
                mor_booking_no_str = each["mor_booking_no"]
                mor_transporter_str = each["mor_transporter"]
                mor_truck_no_str = each["mor_truck_no"]
                mor_to_depot_code_str = each["mor_to_depot_code"]

                if mor_current_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR CURRENT LOCATION column,"
                        f"Cannot keep MOR CURRENT LOCATION column empty for MOR move code"
                    )
                else:
                    error_msg.append("")
                if mor_to_location_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR TO LOCATION column,"
                        f"Cannot keep MOR TO LOCATION column empty for MOR move code"
                    )
                else:
                    error_msg.append("")
                if mor_booking_no_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR BOOKING NO REF column,"
                        f"Cannot keep MOR BOOKING NO REF column empty for MOR move code"
                    )
                else:
                    error_msg.append("")
                if mor_transporter_str == "":
                    error_msg.append(
                        f"In row {str(int(each['sr_no']) + 2)} there is problem in MOR TRANSPORTER column,"
                        f"Cannot keep MOR TRANSPORTER column empty for MOR move code"
                    )
                else:
                    error_msg.append("")

            else:
                error_msg.extend([""] * 4)

            iit_date = self.getDateObject(date_str=each["iit_date"])
            dvan_date = self.getDateObject(date_str=each["dvan_date"])

            if in_move_code_count == 0 and out_move_code_count == 0:
                error_msg.append(
                    f"In row {str(int(each['sr_no']) + 2)} Please fill atleast one move code data"
                )
            else:
                # if (
                #     self.filter(
                #         Q(container_no=each["container_no"])
                #         & Q(process_type="IN")
                #         & Q(iit_date=iit_date)
                #         & Q(location=location)
                #         & Q(site=site)
                #     ).exists()
                #     or self.filter(
                #         Q(container_no=each["container_no"])
                #         & Q(process_type="OUT")
                #         & Q(dvan_date=dvan_date)
                #         & Q(location=location)
                #         & Q(site=site)
                #     ).exists()
                # ):
                #     error_msg.append(
                #         f"In row {str(int(each['sr_no']) + 2)} {container_no_str} Similar Data Exists"
                #     )
                # else:
                #     error_msg.append("")
                # if each["dvan_date"] == "" and out_move_code_count != 0:
                #     error_msg.append(
                #         f"In row {str(int(each['sr_no']) + 2)} DVAN DATE is mandatory if you want to fill OUT move codes,"
                #     )
                # else:
                #     error_msg.append("")
                # if each["iit_date"] == "" and in_move_code_count != 0:
                #     error_msg.append(
                #         f"In row {str(int(each['sr_no']) + 2)} IIT DATE is mandatory if you want to fill IN move codes,"
                #     )
                # else:
                #     error_msg.append("")
                error_msg.append("")

            each["in_move_code_count"] = in_move_code_count
            each["out_move_code_count"] = out_move_code_count

            error_data_msg[f"row {str(int(each['sr_no']) + 2)}"] = error_msg
            if any(error_data_msg[f"row {str(int(each['sr_no']) + 2)}"]) is True:
                error_data.append(each)
            if not each in error_data:
                correct_data.append(each)

        return correct_data, error_data, error_data_msg

    def getDateTimeObjectForMoveCode(self, date_str, time_str):
        if date_str:
            date = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S").date()
            time = datetime.strptime(time_str, "%H:%M:%S").time()
        else:
            date = None
            time = None
        return date, time

    def clientSpecificExtractLoadedYardData(self, input_excel, location, site):

        extracted_data_list = self.clientSpecificExtractDataList(input_excel)

        correct_data, error_data, error_data_msg = self.clientSpecificCheckErrors(
            extracted_data_list, location, site
        )
        main_data = self.collectMainData(correct_data, error_data, error_data_msg)

        return main_data

    def getMoveCodeContent(self, each, MOVE_CODES, attachment_list):
        for (
            move_code,
            current_location,
            to_location,
            mode_of_transport,
            transporter,
            job_order_no,
        ) in MOVE_CODES:
            if each[f"{move_code.lower()}_date"] != "":
                date, time = self.getDateTimeObjectForMoveCode(
                    date_str=each[f"{move_code.lower()}_date"],
                    time_str=each[f"{move_code.lower()}_time"],
                )
                move_code_content = self.loadedYardEdiContent(
                    container_no=each["container_no"],
                    type_size=each["size"],
                    move_code=move_code,
                    date=date,
                    time=time,
                    current_location=current_location,
                    to_location=to_location,
                    booking_no=each["booking_no"],
                    customer="",
                    transporter=transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport=mode_of_transport,
                    job_order_no=job_order_no,
                )
                attachment_list.append(move_code_content["content"])
        return attachment_list

    def createLoadedYardData(self, importable_data, location, site):
        attachment_list = []
        for each in importable_data:
            container_no = each["container_no"]
            type_size = each["size"]
            port = each["port"]
            liner_merchant = each["liner"]
            inward_rake = each["inward_rake"]
            outward_rake = each["outward_rake"]
            iit_date, iit_time = self.getDateTimeObjectForMoveCode(
                date_str=each["iit_date"], time_str=each["iit_time"]
            )

            dvan_date, dvan_time = self.getDateTimeObjectForMoveCode(
                date_str=each["dvan_date"], time_str=each["dvan_time"]
            )

            mtin_date, mtin_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mtin_date"], time_str=each["mtin_time"]
            )

            van_date, van_time = self.getDateTimeObjectForMoveCode(
                date_str=each["van_date"], time_str=each["van_time"]
            )

            mir_date, mir_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mir_date"], time_str=each["mir_time"]
            )

            mot_date, mot_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mot_date"], time_str=each["mot_time"]
            )

            mit_date, mit_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mit_date"], time_str=each["mit_time"]
            )

            mor_date, mor_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mor_date"], time_str=each["mor_time"]
            )

            expin_date, expin_time = self.getDateTimeObjectForMoveCode(
                date_str=each["expin_date"], time_str=each["expin_time"]
            )
            eot_date, eot_time = self.getDateTimeObjectForMoveCode(
                date_str=each["eot_date"], time_str=each["eot_time"]
            )
            booking_no = each["booking_no"]
            seal_no = each["seal_no"]
            report = each["report"]
            remarks = each["remarks"]

            if not each["in_move_code_count"] == 0:
                LoadedYard.objects.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="IN",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=iit_date,
                    iit_time=iit_time,
                    dvan_date=None,
                    dvan_time=None,
                    mtin_date=mtin_date,
                    mtin_time=mtin_time,
                    van_date=None,
                    van_time=None,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=None,
                    mot_time=None,
                    mit_date=mit_date,
                    mit_time=mit_time,
                    mor_date=None,
                    mor_time=None,
                    expin_date=expin_date,
                    expin_time=expin_time,
                    eot_date=None,
                    eot_time=None,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )

            if not each["out_move_code_count"] == 0:
                LoadedYard.objects.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="OUT",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=None,
                    iit_time=None,
                    dvan_date=dvan_date,
                    dvan_time=dvan_time,
                    mtin_date=None,
                    mtin_time=None,
                    van_date=van_date,
                    van_time=van_time,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=mot_date,
                    mot_time=mot_time,
                    mit_date=None,
                    mit_time=None,
                    mor_date=mor_date,
                    mor_time=mor_time,
                    expin_date=None,
                    expin_time=None,
                    eot_date=eot_date,
                    eot_time=eot_time,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )
            MOVE_CODES = [
                ("IIT", "NPBRG", "", "", "", ""),
                ("DVAN", "NPBRG", "", "R", "", ""),
                ("MTIN", "NPBRG", "", "", "", ""),
                ("MIR", "NPBRG", "", "", "", ""),
                ("MOT", "NPBRG", "INMJ1", "", "CONKOL", ""),
                ("MIT", "INMJ1", "", "", "", ""),
                ("MOR", "INMJ1", "INGHK", "", "HRL001", ""),
                ("VAN", "NPBRG", "INMJ1", "", "CONKOL", seal_no),
                ("EXPIN", "NPBRG", "", "R", "", ""),
                ("EOT", "NPBRG", "INMJ1", "T", "CONKOL", ""),
            ]

            move_code_content = self.getMoveCodeContent(
                each, MOVE_CODES, attachment_list
            )
        edi_content = "".join(move_code_content)

        return edi_content

    def clientSpecificGetMoveCodeContent(self, each, MOVE_CODES, attachment_list):
        for (
            move_code,
            current_location,
            to_location,
            mode_of_transport,
            transporter,
            job_order_no,
        ) in MOVE_CODES:
            if each[f"{move_code.lower()}_date"] != "":
                if move_code in ["MOT", "MOR"]:
                    booking_no = each[f"{move_code.lower()}_booking_no"]
                else:
                    booking_no = each["booking_no"]
                date, time = self.getDateTimeObjectForMoveCode(
                    date_str=each[f"{move_code.lower()}_date"],
                    time_str=each[f"{move_code.lower()}_time"],
                )
                move_code_content = self.loadedYardEdiContent(
                    container_no=each["container_no"],
                    type_size=each["size"],
                    move_code=move_code,
                    date=date,
                    time=time,
                    current_location=current_location,
                    to_location=to_location,
                    booking_no=booking_no,
                    customer="",
                    transporter=transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport=mode_of_transport,
                    job_order_no=job_order_no,
                )
                attachment_list.append(move_code_content["content"])
        return attachment_list

    def clientSpecificCreateLoadedYardData(self, importable_data, location, site):
        attachment_list = []
        for each in importable_data:
            container_no = each["container_no"]
            type_size = each["size"]
            port = each["port"]
            liner_merchant = each["liner"]
            inward_rake = each["inward_rake"]
            outward_rake = each["outward_rake"]
            iit_date, iit_time = self.getDateTimeObjectForMoveCode(
                date_str=each["iit_date"], time_str=each["iit_time"]
            )

            dvan_date, dvan_time = self.getDateTimeObjectForMoveCode(
                date_str=each["dvan_date"], time_str=each["dvan_time"]
            )

            mtin_date, mtin_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mtin_date"], time_str=each["mtin_time"]
            )

            van_date, van_time = self.getDateTimeObjectForMoveCode(
                date_str=each["van_date"], time_str=each["van_time"]
            )

            mir_date, mir_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mir_date"], time_str=each["mir_time"]
            )

            mot_date, mot_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mot_date"], time_str=each["mot_time"]
            )

            mit_date, mit_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mit_date"], time_str=each["mit_time"]
            )

            mor_date, mor_time = self.getDateTimeObjectForMoveCode(
                date_str=each["mor_date"], time_str=each["mor_time"]
            )

            expin_date, expin_time = self.getDateTimeObjectForMoveCode(
                date_str=each["expin_date"], time_str=each["expin_time"]
            )
            eot_date, eot_time = self.getDateTimeObjectForMoveCode(
                date_str=each["eot_date"], time_str=each["eot_time"]
            )
            mot_current_location = each["mot_current_location"]
            mot_to_location = each["mot_to_location"]
            mot_booking_no = each["mot_booking_no"]
            mot_transporter = each["mot_transporter"]
            mot_truck_no = each["mot_truck_no"]
            mot_to_depot_code = each["mot_to_depot_code"]
            mit_current_location = each["mit_current_location"]
            mor_current_location = each["mor_current_location"]
            mor_to_location = each["mor_to_location"]
            mor_booking_no = each["mor_booking_no"]
            mor_transporter = each["mor_transporter"]
            mor_truck_no = each["mor_truck_no"]
            mor_to_depot_code = each["mor_to_depot_code"]
            booking_no = each["booking_no"]
            seal_no = each["seal_no"]
            report = each["report"]
            remarks = each["remarks"]
            eot_to_location = each["eot_to_location"]
            eot_transporter = each["eot_transporter"]
            eot_to_depot_code = each["eot_to_depot_code"]

            if not each["in_move_code_count"] == 0:
                LoadedYard.objects.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="IN",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=iit_date,
                    iit_time=iit_time,
                    dvan_date=None,
                    dvan_time=None,
                    mtin_date=mtin_date,
                    mtin_time=mtin_time,
                    van_date=None,
                    van_time=None,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=None,
                    mot_time=None,
                    mot_current_location=None,
                    mot_to_location=None,
                    mot_booking_no=None,
                    mot_transporter=None,
                    mot_to_depot_code=None,
                    mot_truck_no=None,
                    mit_date=mit_date,
                    mit_time=mit_time,
                    mit_current_location=mit_current_location,
                    mor_date=None,
                    mor_time=None,
                    mor_current_location=None,
                    mor_to_location=None,
                    mor_booking_no=None,
                    mor_transporter=None,
                    mor_to_depot_code=None,
                    mor_truck_no=None,
                    expin_date=expin_date,
                    expin_time=expin_time,
                    eot_date=None,
                    eot_time=None,
                    eot_to_location=None,
                    eot_to_depot_code=None,
                    eot_transporter=None,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )

            if not each["out_move_code_count"] == 0:
                LoadedYard.objects.create(
                    container_no=container_no,
                    type_size=type_size,
                    process_type="OUT",
                    port=port,
                    liner_merchant=liner_merchant,
                    inward_rake=inward_rake,
                    outward_rake=outward_rake,
                    iit_date=None,
                    iit_time=None,
                    dvan_date=dvan_date,
                    dvan_time=dvan_time,
                    mtin_date=None,
                    mtin_time=None,
                    van_date=van_date,
                    van_time=van_time,
                    mir_date=mir_date,
                    mir_time=mir_time,
                    mot_date=mot_date,
                    mot_time=mot_time,
                    mot_current_location=mot_current_location,
                    mot_to_location=mot_to_location,
                    mot_booking_no=mot_booking_no,
                    mot_transporter=mot_transporter,
                    mot_truck_no=mot_truck_no,
                    mot_to_depot_code=mot_to_depot_code,
                    mit_date=None,
                    mit_time=None,
                    mit_current_location=None,
                    mor_date=mor_date,
                    mor_time=mor_time,
                    mor_current_location=mor_current_location,
                    mor_to_location=mor_to_location,
                    mor_booking_no=mor_booking_no,
                    mor_transporter=mor_transporter,
                    mor_truck_no=mor_truck_no,
                    mor_to_depot_code=mor_to_depot_code,
                    expin_date=None,
                    expin_time=None,
                    eot_date=eot_date,
                    eot_time=eot_time,
                    eot_to_location=eot_to_location,
                    eot_to_depot_code=eot_to_depot_code,
                    eot_transporter=eot_transporter,
                    booking_no=booking_no,
                    seal_no=seal_no,
                    report=report,
                    remarks=remarks,
                    location=location,
                    site=site,
                )
            MOVE_CODES = [
                ("IIT", "NPBRG", "", "", "", ""),
                ("DVAN", "NPBRG", "", "R", "", ""),
                ("MTIN", "NPBRG", "", "", "", ""),
                ("MIR", "NPBRG", "", "", "", ""),
                ("MOT", mot_current_location, mot_to_location, "", mot_transporter, ""),
                ("MIT", mit_current_location, "", "", "", ""),
                ("MOR", mor_current_location, mor_to_location, "", mor_transporter, ""),
                ("VAN", "NPBRG", "INMJ1", "", "CONKOL", seal_no),
                ("EXPIN", "NPBRG", "", "R", "", ""),
                # ("EOT", "NPBRG", "INMJ1", "T", "CONKOL", ""),
                ("EOT", "NPBRG", eot_to_location, "T", eot_transporter, ""),
            ]

            move_code_content = self.clientSpecificGetMoveCodeContent(
                each, MOVE_CODES, attachment_list
            )
        edi_content = "".join(move_code_content)

        return edi_content

    def extractLoadedYardDataForRejectedFile(self, data):
        loaded_yard_df_data = pd.DataFrame(data)[
            [
                "container_no",
                "size",
                "port",
                "liner",
                "inward_rake",
                "outward_rake",
                "iit_date",
                "iit_time",
                "dvan_date",
                "dvan_time",
                "mtin_date",
                "mtin_time",
                "van_date",
                "van_time",
                "booking_no",
                "seal_no",
                "mir_date",
                "mir_time",
                "mot_date",
                "mot_time",
                "mit_date",
                "mit_time",
                "mor_date",
                "mor_time",
                "expin_date",
                "expin_time",
                "eot_date",
                "eot_time",
                "report",
                "remarks",
            ]
        ]
        loaded_yard_df_data.columns = [
            "CONTAINER",
            "SIZE",
            "PORT",
            "LINER/MERCHANT",
            "INWARD RAKE",
            "OUTWARD RAKE",
            "IIT",
            "IIT TIME",
            "DVAN",
            "DVAN TIME",
            "MTIN",
            "MTIN TIME",
            "VAN",
            "VAN TIME",
            "BOOKING NO",
            "SEAL NO",
            "MIR",
            "MIR TIME",
            "MOT",
            "MOT TIME",
            "MIT",
            "MIT TIME",
            "MOR",
            "MOR TIME",
            "EXPIN",
            "EXPIN TIME",
            "EOT",
            "EOT TIME",
            "REPORT",
            "REMARKS",
        ]
        return loaded_yard_df_data

    def clientSpecificExtractLoadedYardDataForRejectedFile(self, data):
        loaded_yard_df_data = pd.DataFrame(data)[
            [
                "container_no",
                "size",
                "port",
                "liner",
                "inward_rake",
                "outward_rake",
                "iit_date",
                "iit_time",
                "dvan_date",
                "dvan_time",
                "mtin_date",
                "mtin_time",
                "van_date",
                "van_time",
                "booking_no",
                "seal_no",
                "mir_date",
                "mir_time",
                "mot_date",
                "mot_time",
                "mot_current_location",
                "mot_to_location",
                "mot_booking_no",
                "mot_transporter",
                "mot_truck_no",
                "mot_to_depot_code",
                "mit_date",
                "mit_time",
                "mit_current_location",
                "mor_date",
                "mor_time",
                "mor_current_location",
                "mor_to_location",
                "mor_booking_no",
                "mor_transporter",
                "mor_truck_no",
                "mor_to_depot_code",
                "expin_date",
                "expin_time",
                "eot_date",
                "eot_time",
                "eot_to_location",
                "eot_to_depot_code",
                "eot_transporter",
                "report",
                "remarks",
            ]
        ]
        loaded_yard_df_data.columns = [
            "CONTAINER",
            "SIZE",
            "PORT",
            "LINER/MERCHANT",
            "INWARD RAKE",
            "OUTWARD RAKE",
            "IIT",
            "IIT TIME",
            "DVAN",
            "DVAN TIME",
            "MTIN",
            "MTIN TIME",
            "VAN",
            "VAN TIME",
            "BOOKING NO",
            "SEAL NO",
            "MIR",
            "MIR TIME",
            "MOT",
            "MOT TIME",
            "MOT CURRENT LOCATION",
            "MOT TO LOCATION",
            "MOT BOOKING REF NO",
            "MOT TRANSPORTER",
            "MOT TRUCK NO",
            "MOT TO DEPOT CODE",
            "MIT",
            "MIT TIME",
            "MIT CURRENT LOCATION",
            "MOR",
            "MOR TIME",
            "MOR CURRENT LOCATION",
            "MOR TO LOCATION",
            "MOR BOOKING REF NO",
            "MOR TRANSPORTER",
            "MOR TRUCK NO",
            "MOR TO DEPOT CODE",
            "EXPIN",
            "EXPIN TIME",
            "EOT",
            "EOT TIME",
            "EOT TO LOCATION",
            "EOT TO DEPOT CODE",
            "EOT TRANSPORTER",
            "REPORT",
            "REMARKS",
        ]
        return loaded_yard_df_data

    def getDataForContainerReport(self, param, move_code, process):
        if process == "IN":
            stock = (
                LoadedYard.objects.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "iit_date",
                    "iit_time",
                    "mtin_date",
                    "mtin_time",
                    "mir_date",
                    "mir_time",
                    "mit_date",
                    "mit_time",
                    "expin_date",
                    "expin_time",
                    "booking_no",
                    "seal_no",
                )
                .latest("iit_date")
            )
        else:
            stock = (
                LoadedYard.objects.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "dvan_date",
                    "dvan_time",
                    "van_date",
                    "van_time",
                    "mot_date",
                    "mot_time",
                    "mor_date",
                    "mor_time",
                    "eot_date",
                    "eot_time",
                    "booking_no",
                    "seal_no",
                )
                .latest("dvan_date")
            )
        attachment_list = []

        move_codes = {
            "IIT": ["NPBRG", "", "", ""],
            "DVAN": ["NPBRG", "", "R", ""],
            "MTIN": ["NPBRG", "", "", ""],
            "MIR": ["NPBRG", "", "", ""],
            "MOT": ["NPBRG", "INMJ1", "", "CONKOL"],
            "MIT": ["INMJ1", "", "", ""],
            "MOR": ["INMJ1", "INGHK", "", "HRL001"],
            "VAN": ["NPBRG", "INMJ1", "", "CONKOL"],
            "EXPIN": ["NPBRG", "", "R", ""],
            "EOT": ["NPBRG", "INMJ1", "T", "CONKOL"],
        }
        current_location, to_location, mode_of_transport, transporter = move_codes[
            move_code
        ]
        code = f"{move_code.lower()}"

        if stock[f"{code}_date"]:
            edi_content = self.loadedYardEdiContent(
                container_no=stock["container_no"],
                type_size=stock["type_size"],
                move_code=move_code,
                date=stock[f"{code}_date"],
                time=stock[f"{code}_time"],
                current_location=current_location,
                to_location=to_location,
                booking_no=stock["booking_no"],
                customer="",
                transporter=transporter,
                truck_no="",
                condition="",
                mode_of_transport=mode_of_transport,
                job_order_no=stock["seal_no"],
            )
            attachment_list.append(edi_content["content"])
        return attachment_list

    def getDataForDateReport(self, param, move_code, process):
        if process == "IN":
            stock = (
                LoadedYard.objects.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "iit_date",
                    "iit_time",
                    "mtin_date",
                    "mtin_time",
                    "mir_date",
                    "mir_time",
                    "mit_date",
                    "mit_time",
                    "expin_date",
                    "expin_time",
                    "booking_no",
                    "seal_no",
                )
                .order_by("iit_date")
            )
        else:
            stock = (
                LoadedYard.objects.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "dvan_date",
                    "dvan_time",
                    "van_date",
                    "van_time",
                    "mot_date",
                    "mot_time",
                    "mor_date",
                    "mor_time",
                    "eot_date",
                    "eot_time",
                    "booking_no",
                    "seal_no",
                )
                .order_by("dvan_date")
            )
        attachment_list = []

        for each in stock:
            move_codes = {
                "IIT": ["NPBRG", "", "", ""],
                "DVAN": ["NPBRG", "", "R", ""],
                "MTIN": ["NPBRG", "", "", ""],
                "MIR": ["NPBRG", "", "", ""],
                "MOT": ["NPBRG", "INMJ1", "", "CONKOL"],
                "MIT": ["INMJ1", "", "", ""],
                "MOR": ["INMJ1", "INGHK", "", "HRL001"],
                "VAN": ["NPBRG", "INMJ1", "", "CONKOL"],
                "EXPIN": ["NPBRG", "", "R", ""],
                "EOT": ["NPBRG", "INMJ1", "T", "CONKOL"],
            }
            current_location, to_location, mode_of_transport, transporter = move_codes[
                move_code
            ]
            code = f"{move_code.lower()}"

            if each[f"{code}_date"]:
                edi_content = self.loadedYardEdiContent(
                    container_no=each["container_no"],
                    type_size=each["type_size"],
                    move_code=move_code,
                    date=each[f"{code}_date"],
                    time=each[f"{code}_time"],
                    current_location=current_location,
                    to_location=to_location,
                    booking_no=each["booking_no"],
                    customer="",
                    transporter=transporter,
                    truck_no="",
                    condition="",
                    mode_of_transport=mode_of_transport,
                    job_order_no=each["seal_no"],
                )
                attachment_list.append(edi_content["content"])
        return attachment_list

    def clientSpecificGetDataForContainerReport(self, param, move_code, process):
        if process == "IN":
            stock = (
                LoadedYard.objects.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "iit_date",
                    "iit_time",
                    "mtin_date",
                    "mtin_time",
                    "mir_date",
                    "mir_time",
                    "mit_date",
                    "mit_time",
                    "mit_current_location",
                    "expin_date",
                    "expin_time",
                    "booking_no",
                    "seal_no",
                )
                .latest("iit_date")
            )
        else:
            stock = (
                LoadedYard.objects.filter(**param)
                .values(
                    "container_no",
                    "type_size",
                    "dvan_date",
                    "dvan_time",
                    "van_date",
                    "van_time",
                    "mot_date",
                    "mot_time",
                    "mot_current_location",
                    "mot_to_location",
                    "mot_booking_no",
                    "mot_transporter",
                    "mot_to_depot_code",
                    "mot_truck_no",
                    "mor_date",
                    "mor_time",
                    "mor_current_location",
                    "mor_to_location",
                    "mor_booking_no",
                    "mor_transporter",
                    "mor_to_depot_code",
                    "mor_truck_no",
                    "eot_date",
                    "eot_time",
                    "eot_to_location",
                    "eot_to_depot_code",
                    "eot_transporter",
                    "booking_no",
                    "seal_no",
                )
                .latest("dvan_date")
            )
        attachment_list = []
        move_codes = {
            "IIT": ["NPBRG", "", "", ""],
            "DVAN": ["NPBRG", "", "R", ""],
            "MTIN": ["NPBRG", "", "", ""],
            "MIR": ["NPBRG", "", "", ""],
            "MOT": ["NPBRG", "INMJ1", "", "CONKOL"],
            "MIT": ["INMJ1", "", "", ""],
            "MOR": ["INMJ1", "INGHK", "", "HRL001"],
            "VAN": ["NPBRG", "INMJ1", "", "CONKOL"],
            "EXPIN": ["NPBRG", "", "R", ""],
            "EOT": ["NPBRG", "INMJ1", "T", "CONKOL"],
        }
        current_location, to_location, mode_of_transport, transporter = move_codes[
            move_code
        ]
        code = f"{move_code.lower()}"

        if stock[f"{code}_date"]:
            if move_code in ["MOT", "MOR"]:
                booking_no = stock[f"{code}_booking_no"]
            else:
                booking_no = stock["booking_no"]
            if move_code == "MIT":
                current_location = stock["mit_current_location"]
            if move_code in ["MOT", "MOR"]:
                current_location = stock[f"{code}_current_location"]
                to_location = stock[f"{code}_to_location"]
                transporter = stock[f"{code}_transporter"]
            edi_content = self.loadedYardEdiContent(
                container_no=stock["container_no"],
                type_size=stock["type_size"],
                move_code=move_code,
                date=stock[f"{code}_date"],
                time=stock[f"{code}_time"],
                current_location=current_location,
                to_location=to_location,
                booking_no=booking_no,
                customer="",
                transporter=transporter,
                truck_no="",
                condition="",
                mode_of_transport=mode_of_transport,
                job_order_no=stock["seal_no"],
            )
            attachment_list.append(edi_content["content"])
        return attachment_list

    def getEdiReport(self, data, location, site):
        site_obj = Site.objects.get(name=site)
        from_date = data.get("from_date")
        to_date = data.get("to_date")
        from_date_obj = (
            datetime.strptime(from_date, "%Y-%m-%d").date() if from_date else None
        )
        to_date_obj = datetime.strptime(to_date, "%Y-%m-%d").date() if to_date else None
        from_time = data.get("from_time")
        to_time = data.get("to_time")
        from_time_obj = (
            datetime.strptime(from_time, "%H:%M").time() if from_time else None
        )
        to_time_obj = datetime.strptime(to_time, "%H:%M").time() if to_time else None
        container_no = data.get("container_no")
        process = data.get("process")
        move_code = data.get("move_code")

        param = {}
        if process == "IN":
            param["process_type"] = "IN"
        else:
            param["process_type"] = "OUT"
        if from_date and to_date:
            if process == "IN":
                param["iit_date__range"] = (from_date_obj, to_date_obj)
                if from_time_obj and to_time_obj:
                    param["iit_time__range"] = (from_time_obj, to_time_obj)
            else:
                param["dvan_date__range"] = (from_date_obj, to_date_obj)
                if from_time_obj and to_time_obj:
                    param["dvan_time__range"] = (from_time_obj, to_time_obj)
        if container_no:
            param["container_no"] = container_no
        if location:
            param["location__name"] = location
        if site:
            param["site__name"] = site

        if site_obj.organization == "Golden Horn Containers Service":
            if container_no:
                attachment_list = self.getDataForContainerReport(
                    param, move_code, process
                )
            else:
                attachment_list = self.getDataForDateReport(param, move_code, process)
        else:
            attachment_list = self.clientSpecificGetDataForContainerReport(
                param, move_code, process
            )

        edi_content = "".join(attachment_list)
        return edi_content

    def getDates(self, from_date_str, to_date_str, from_time_str, to_time_str):
        tz = timezone.get_current_timezone()
        to_date_time = datetime.now().astimezone(tz)
        from_date_time = to_date_time - timedelta(hours=24)
        from_date_time = from_date_time.astimezone(tz)
        from_date = from_date_time.date()
        to_date = to_date_time.date()
        from_time = datetime.strptime("00:00", "%H:%M").time()
        to_time = datetime.strptime("23:59", "%H:%M").time()
        if not len(from_date_str) == 0:
            if not len(from_time_str) == 0:
                from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.strptime(to_date_str, "%Y-%m-%d").date()
                from_time = datetime.strptime(from_time_str, "%H:%M").time()
                to_time = datetime.strptime(to_time_str, "%H:%M").time()
            else:
                from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date()
                to_date = datetime.strptime(to_date_str, "%Y-%m-%d").date()
        from_date_time = datetime.combine(from_date, from_time).astimezone(tz)
        to_date_time = datetime.combine(to_date, to_time).astimezone(tz)
        return from_date_time, to_date_time

    def getLyEdiData(self, request):
        data = request.data
        from_date_str = data["from_date"]
        to_date_str = data["to_date"]
        from_time_str = data["from_time"]
        to_time_str = data["to_time"]
        container_no = data["container_no"]
        move_code = data["move_code"]
        process = data["process"]
        location_str = data["location"]
        site_str = data["site"]
        data_list = []

        if len(location_str) == 0 or len(site_str) == 0 or len(move_code) == 0:
            return None, {"errorMsg": "Please provide proper data"}

        # location and site
        location = Location.objects.get(name=location_str)
        site = Site.objects.get(name=site_str, location=location)
        param = {
            "location": location,
            "site": site,
            "process_type": process,
        }
        if not len(container_no) == 0:
            param["container_no"] = container_no
            move_code_date = f"{move_code.lower()}_date"
            move_code_time = f"{move_code.lower()}_time"
            exclude_params = {}
            exclude_params[move_code_date] = None
            exclude_params[move_code_time] = None
            data_list = LoadedYard.objects.filter(**param).exclude(**exclude_params)
        else:
            # dates
            from_date_time, to_date_time = self.getDates(
                from_date_str, to_date_str, from_time_str, to_time_str
            )
            # data based on movecode
            move_code_date_gte = f"{move_code.lower()}_date__gte"
            move_code_time_gte = f"{move_code.lower()}_time__gte"
            move_code_date_lte = f"{move_code.lower()}_date__lte"
            move_code_time_lte = f"{move_code.lower()}_time__lte"
            param[move_code_date_gte] = from_date_time.date()
            param[move_code_time_gte] = from_date_time.time()
            param[move_code_date_lte] = to_date_time.date()
            param[move_code_time_lte] = to_date_time.time()
            data_list = LoadedYard.objects.filter(**param)
        if len(list(data_list)) == 0:
            return None, {"errorMsg": "Data Not Found"}
        return move_code, data_list

    def lyExcelEdiRowData(self, obj_data, row_dict, move_code):
        tz = timezone.get_current_timezone()
        # depot_name = obj_data.site.name
        depot_name = None
        depot_msc_code = obj_data.site.depot_msc_code
        event_location = obj_data.site.event_location_msc_code
        container_status = LOADEDYARD_CONTAINER_MOVE_CODE_STATUS[move_code]
        full_empty = "F" if move_code in ["IIT", "EXPIN", "DVAN", "EOT"] else "E"
        container_no = obj_data.container_no

        date = None
        time = None
        transporter_name = None
        next_event_location = None
        next_depot_code = None
        truck_no = None
        edi_partner_code = None

        if move_code == "IIT":
            date = obj_data.iit_date
            time = obj_data.iit_time
        elif move_code == "MTIN":
            date = obj_data.mtin_date
            time = obj_data.mtin_time
        elif move_code == "EXPIN":
            date = obj_data.expin_date
            time = obj_data.expin_time
        elif move_code == "MIR":
            date = obj_data.mir_date
            time = obj_data.mir_time
        elif move_code == "MIT":
            date = obj_data.mit_date
            time = obj_data.mit_time
        elif move_code == "DVAN":
            date = obj_data.dvan_date
            time = obj_data.dvan_time
            # edi_partner_code = obj_data.site.vendor_name
        elif move_code == "MOT":
            date = obj_data.mot_date
            time = obj_data.mot_time
            transporter_name = obj_data.mot_transporter
            truck_no = obj_data.mot_truck_no
            next_event_location = obj_data.mot_to_location
            next_depot_code = obj_data.mot_to_depot_code
            edi_partner_code = obj_data.site.vendor_name

        elif move_code == "MOR":
            date = obj_data.mor_date
            time = obj_data.mor_time
            transporter_name = obj_data.mor_transporter
            truck_no = obj_data.mor_truck_no
            next_event_location = obj_data.mor_to_location
            next_depot_code = obj_data.mor_to_depot_code
            edi_partner_code = obj_data.site.vendor_name

        elif move_code == "VAN":
            date = obj_data.van_date
            time = obj_data.van_time
        elif move_code == "EOT":
            date = obj_data.eot_date
            time = obj_data.eot_time
            transporter_name = obj_data.eot_transporter
            next_event_location = obj_data.eot_to_location
            next_depot_code = obj_data.eot_to_depot_code
            edi_partner_code = obj_data.site.vendor_name
        else:
            pass
        date_time = datetime.combine(date=date, time=time).astimezone(tz)
        move_date_time = date_time.astimezone(tz).strftime("%d-%m-%Y %H:%M")
        cargo_wt = 0
        booking_no = obj_data.booking_no if move_code == "VAN" else None
        seal_no_1 = obj_data.seal_no if booking_no is not None else None
        seal_type_1 = "M" if seal_no_1 is not None else None

        # row update
        row_dict["depot_name"] = depot_name
        row_dict["depot_msc_code"] = depot_msc_code
        row_dict["edi_partner_code"] = edi_partner_code
        row_dict["event_location"] = event_location
        row_dict["container_status"] = container_status
        row_dict["full_empty"] = full_empty
        row_dict["container_no"] = container_no
        row_dict["move_date_time"] = move_date_time
        row_dict["booking_no"] = booking_no
        row_dict["cargo_wt"] = int(cargo_wt)
        row_dict["seal_type_1"] = seal_type_1
        row_dict["seal_no_1"] = seal_no_1
        row_dict["transporter_name"] = (
            transporter_name[:35] if transporter_name is not None else transporter_name
        )
        row_dict["truck_no"] = truck_no[:35] if truck_no is not None else truck_no
        row_dict["next_event_location"] = (
            next_event_location[:5]
            if next_event_location is not None
            else next_event_location
        )
        row_dict["next_depot_code"] = (
            next_depot_code[:7] if next_depot_code is not None else next_depot_code
        )

        return row_dict

    def lyExcelEdiMainData(self, data_object_list, move_code):
        main_row_dict = {
            "depot_name": None,
            "depot_msc_code": None,
            "edi_partner_code": None,
            "event_location": None,
            "container_status": None,
            "full_empty": None,
            "container_no": None,
            "move_date_time": None,
            "booking_no": None,
            "bl_no": None,
            "vessel": None,
            "voyage": None,
            "pol": None,
            "pod": None,
            "cargo_wt": None,
            "seal_type_1": None,
            "seal_no_1": None,
            "seal_type_2": None,
            "seal_no_2": None,
            "seal_type_3": None,
            "seal_no_3": None,
            "transport_carrier": None,
            "vehicle": None,
            "lease_company": None,
            "remarks": None,
            "lease_company_code": None,
            "pick_up_ref": None,
            "lesser_code": None,
            "transporter_name": None,
            "truck_no": None,
            "next_event_location": None,
            "next_depot_code": None,
        }
        main_dict_list = [
            self.lyExcelEdiRowData(
                obj_data=each, row_dict=main_row_dict.copy(), move_code=move_code
            )
            for each in data_object_list
        ]
        main_data = {
            "depot_name": [each.get("depot_name") for each in main_dict_list],
            "depot_msc_code": [each.get("depot_msc_code") for each in main_dict_list],
            "edi_partner_code": [
                each.get("edi_partner_code") for each in main_dict_list
            ],
            "event_location": [each.get("event_location") for each in main_dict_list],
            "container_status": [
                each.get("container_status") for each in main_dict_list
            ],
            "full_empty": [each.get("full_empty") for each in main_dict_list],
            "container_no": [each.get("container_no") for each in main_dict_list],
            "move_date_time": [each.get("move_date_time") for each in main_dict_list],
            "booking_no": [each.get("booking_no") for each in main_dict_list],
            "bl_no": [each.get("bl_no") for each in main_dict_list],
            "vessel": [each.get("vessel") for each in main_dict_list],
            "voyage": [each.get("voyage") for each in main_dict_list],
            "pol": [each.get("pol") for each in main_dict_list],
            "pod": [each.get("pod") for each in main_dict_list],
            "cargo_wt": [each.get("cargo_wt") for each in main_dict_list],
            "seal_type_1": [each.get("seal_type_1") for each in main_dict_list],
            "seal_no_1": [each.get("seal_no_1") for each in main_dict_list],
            "seal_type_2": [each.get("seal_type_2") for each in main_dict_list],
            "seal_no_2": [each.get("seal_no_2") for each in main_dict_list],
            "seal_type_3": [each.get("seal_type_3") for each in main_dict_list],
            "seal_no_3": [each.get("seal_no_3") for each in main_dict_list],
            "transport_carrier": [
                each.get("transport_carrier") for each in main_dict_list
            ],
            "vehicle": [each.get("vehicle") for each in main_dict_list],
            "lease_company": [each.get("lease_company") for each in main_dict_list],
            "remarks": [each.get("remarks") for each in main_dict_list],
            "lease_company_code": [
                each.get("lease_company_code") for each in main_dict_list
            ],
            "pick_up_ref": [each.get("pick_up_ref") for each in main_dict_list],
            "lesser_code": [each.get("lesser_code") for each in main_dict_list],
            "transporter_name": [
                each.get("transporter_name") for each in main_dict_list
            ],
            "truck_no": [each.get("truck_no") for each in main_dict_list],
            "next_event_location": [
                each.get("next_event_location") for each in main_dict_list
            ],
            "next_depot_code": [each.get("next_depot_code") for each in main_dict_list],
        }
        return main_data
