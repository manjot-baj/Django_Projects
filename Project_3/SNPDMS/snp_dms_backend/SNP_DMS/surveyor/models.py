from django.db import models
from master.models import Location, Site, ContainerSize, ContainerType
from master.models_two import Client, ClientAbbreviation
from mnr.models import (
    MnrStaff,
    TariffMaster,
    Survey,
    SurveyLine,
    BeforeRepairImage,
    Estimate,
    Approval,
)
from depot.models import ContainerStock
from depot.lolo_finance_models import PreGateIn, AdvancedHandlingPayment
from non_depot.models import NonDepotContainerStock
from datetime import datetime
from common.functions import get_location_site
from decouple import config
import random, logging, traceback

from analytics.functions import (
    location_site_lolo_st_volume_revenue,
)

GST_TYPE = [
    ("GST 0%", "GST 0%"),
    ("GST 5%", "GST 5%"),
    ("GST 12%", "GST 12%"),
    ("GST 18%", "GST 18%"),
    ("GST 28%", "GST 28%"),
    ("IGST 0%", "IGST 0%"),
    ("IGST 5%", "IGST 5%"),
    ("IGST 12%", "IGST 12%"),
    ("IGST 18%", "IGST 18%"),
    ("IGST 28%", "IGST 28%"),
]

AWS_REPAIR_IMAGE_BUCKET_NAME = config("AWS_REPAIR_IMAGE_BUCKET_NAME")


class SurveyorManager(models.Manager):
    def create_instance(self, location, site, data):

        location_obj, site_obj = get_location_site(
            location_name=location, site_name=site
        )
        size = ContainerSize.objects.get(name=data.get("size"))
        type = ContainerType.objects.get(name=data.get("type"))
        client = Client.objects.get(
            name=data.get("client"), location=location_obj, site=site_obj
        )
        line = ClientAbbreviation.objects.filter(
            name=data.get("line"), client=client
        ).latest("pk")
        gate_in_date = (
            datetime.strptime(data.get("gate_in_date"), "%Y-%m-%d").date()
            if data.get("gate_in_date")
            else None
        )
        survey_date = (
            datetime.strptime(data.get("survey_date"), "%Y-%m-%d").date()
            if data.get("survey_date")
            else None
        )
        manufacturing_date = (
            datetime.strptime(data.get("manufacturing_date"), "%Y-%m-%d").date()
            if data.get("manufacturing_date")
            else None
        )
        gate_in_time = datetime.strptime(data.get("gate_in_time"), "%H:%M").time()
        survey_time = datetime.strptime(data.get("survey_time"), "%H:%M").time()
        survey_by = MnrStaff.objects.get(pk=data.get("survey_by"))
        model = ContainerStock if site_obj.type == "DEPOT" else NonDepotContainerStock

        if model.objects.filter(
            container__container_no=data.get("container_no"),
            container__location=location_obj,
            container__site=site_obj,
            gate_in__in_date=gate_in_date,
        ).exists():
            is_new_container = False
            model.objects.filter(
                container__container_no=data.get("container_no"),
                container__location=location_obj,
                container__site=site_obj,
                gate_in__in_date=gate_in_date,
            ).update(is_survey_import_available=True)
        else:
            is_new_container = True

            arrived = data.get("arrived", None)
            if site_obj.lolo_finance and arrived in ["Factory", "FS RETURN", "CFS/ICD"]:
                try:
                    if not PreGateIn.objects.filter(
                        container_no=data.get("container_no"),
                        location=location_obj,
                        site=site_obj,
                        on_hold=False,
                        validity_expired=False,
                        is_gatein_done=False,
                        is_survey_done=False,
                    ).exists():
                        return None
                    else:
                        pregatein_obj = PreGateIn.objects.filter(
                            container_no=data.get("container_no"),
                            location=location_obj,
                            site=site_obj,
                            on_hold=False,
                            validity_expired=False,
                            is_gatein_done=False,
                            is_survey_done=False,
                        ).latest("pk")
                        pregatein_obj.is_survey_done = True
                        pregatein_obj.save()
                except:
                    error_log = logging.getLogger("error_log")
                    error_log.error(traceback.format_exc())
                    pass

        grade = data.get("grade")
        return self.create(
            location=location_obj,
            site=site_obj,
            container_no=data.get("container_no"),
            line=line,
            size=size,
            type=type,
            client=client,
            gate_in_date=gate_in_date,
            survey_date=survey_date,
            manufacturing_date=manufacturing_date,
            gate_in_time=gate_in_time,
            survey_time=survey_time,
            survey_by=survey_by,
            gross_wt=data.get("gross_wt", None),
            tare_wt=data.get("tare_wt", None),
            is_new_container=is_new_container,
            grade=grade,
            arrived=data.get("arrived", None),
        )

    def get_survey_containers(self, data):
        location_name = data.get("location")
        site_name = data.get("site")
        location, site = get_location_site(
            location_name=location_name, site_name=site_name
        )
        params = {
            "container__location": location,
            "container__site": site,
            "stage": "Survey",
            "container__client__ref_code": "MSC",
        }
        if site.type == "DEPOT":
            stock_objects = ContainerStock.objects.filter(**params)
            return [
                stock.container.container_no
                for stock in stock_objects
                if not Survey.objects.filter(depot=stock).exists()
                and not Surveyor.objects.filter(
                    container_no=stock.container.container_no,
                    location=location,
                    site=site,
                    gate_in_date=stock.gate_in.in_date,
                    gate_in_time=stock.gate_in.in_time,
                ).exists()
            ]
        else:
            stock_objects = NonDepotContainerStock.objects.filter(**params)
            return [
                stock.container.container_no
                for stock in stock_objects
                if not Survey.objects.filter(non_depot=stock).exists()
                and not Surveyor.objects.filter(
                    container_no=stock.container.container_no,
                    location=location,
                    site=site,
                    gate_in_date=stock.gate_in.in_date,
                    gate_in_time=stock.gate_in.in_time,
                ).exists()
            ]

    def get_surveyor_data(self, container_no, location, site, flag=False):
        if flag:
            parent = self.filter(
                location=location,
                site=site,
                is_img_uploaded=False,
            ).first()
        else:
            parent = self.select_related(
                "client", "line", "type", "size", "location", "site"
            ).get(container_no=container_no, location=location, site=site)
        survey_line = SurveyorLine.objects.get_survey_line(parent)
        current_time = datetime.today().time().strftime("%H:%M")

        lines = list(
            SurveyorLine.objects.filter(parent=parent).values_list(
                "total_cost", flat=True
            )
        )
        amount_without_tax = sum(lines)
        tax = round(amount_without_tax * 0, 2)
        amount = round(amount_without_tax, 2) + tax

        return {
            "pk": parent.pk,
            "client": parent.client.name or "",
            "line": parent.line.name or "",
            "container_no": parent.container_no,
            "manufacturing_date": parent.manufacturing_date,
            "gate_in_date": parent.gate_in_date,
            "survey_date": parent.survey_date,
            "gate_in_time": (
                parent.gate_in_time.strftime("%H:%M")
                if parent.gate_in_time
                else current_time
            ),
            "survey_time": (
                parent.survey_time.strftime("%H:%M")
                if parent.survey_time
                else current_time
            ),
            "type": parent.type.name,
            "size": parent.size.name,
            "tariff_id": TariffMaster.objects.get(
                client="MSC",
                location=location,
                site=site,
            ).pk
            or "",
            "survey_by": parent.survey_by.pk,
            "gross_wt": parent.gross_wt,
            "tare_wt": parent.tare_wt,
            "survey_line": survey_line,
            "is_editable": False,
            "is_img_uploaded": parent.is_img_uploaded,
            "estimate_number": parent.estimate_number,
            "total_amount": amount,
            "grade": parent.grade,
            "arrived": parent.arrived,
            "image_data": [
                {
                    "pk": image.pk,
                    "s3_object_name": image.s3_object_name,
                    "s3_file_name": image.s3_file_name,
                    "s3_image_link": f"https://{AWS_REPAIR_IMAGE_BUCKET_NAME}.s3.amazonaws.com/{image.s3_object_name}",
                }
                for image in SurveyorBeforeRepairImage.objects.filter(parent=parent)
            ],
        }

    def get_stock_data_for_surveyor(self, container_no, location, site):
        if site.type == "DEPOT":
            model = ContainerStock
        else:
            model = NonDepotContainerStock
        stock = model.objects.select_related(
            "container",
            "container__client",
            "container__shipping_line",
            "container__size",
            "container__type",
            "gate_in",
        ).get(
            container__container_no=container_no,
            container__location=location,
            container__site=site,
            stage="Survey",
        )
        try:
            tarrif = TariffMaster.objects.get(
                client=stock.container.shipping_line.name,
                location=location,
                site=site,
            ).pk
        except:
            tarrif = ""
        current_time = datetime.today().time().strftime("%H:%M")
        return {
            "container_no": stock.container.container_no,
            "client": stock.container.client.name,
            "line": stock.container.shipping_line.name,
            "gross_wt": stock.container.gross_wt,
            "tare_wt": stock.container.tare_wt,
            "size": stock.container.size.name,
            "type": stock.container.type.name,
            "manufacturing_date": stock.container.manufacturing_date,
            "gate_in_date": stock.gate_in.in_date,
            "gate_in_time": (
                stock.gate_in.in_time.strftime("%H:%M")
                if stock.gate_in.in_time
                else current_time
            ),
            "tariff_id": tarrif,
            "grade": stock.grade or "",
            "survey_time": current_time,
            "is_editable": True,
            "arrived": stock.gate_in.arrived,
        }

    def get_list_of_to_be_imported_contaiers(self, data):
        location, site = get_location_site(
            location_name=data.get("location"),
            site_name=data.get("site"),
        )

        model = ContainerStock if site.type == "DEPOT" else NonDepotContainerStock
        stock = (
            model.objects.select_related("container")
            .filter(container__location=location, container__site=site)
            .values("container__container_no")
        )
        containers = [each["container__container_no"] for each in stock]
        return [
            each
            for each in Surveyor.objects.filter(
                is_img_uploaded=True, location=location, site=site
            )
            .exclude(container_no__in=containers)
            .values("container_no", "pk")
        ]

    def get_gate_in_data(self, pk):
        surveyor = self.get(pk=pk)
        main_data = {
            "client": surveyor.client.name,
            "container_no": surveyor.container_no,
            "gross_wt": surveyor.gross_wt,
            "tare_wt": surveyor.tare_wt,
            "manufacturing_date": surveyor.manufacturing_date,
            "shipping_line": surveyor.line.name,
            "size": surveyor.size.name,
            "type": surveyor.type.name,
            "in_date": surveyor.gate_in_date or "",
            "in_time": surveyor.gate_in_time.strftime("%H:%M"),
            "location": surveyor.location.name,
            "site": surveyor.site.name,
            "grade": surveyor.grade or "",
            "arrived": surveyor.arrived,
            "apply_charges": "Line",
            "customer_name": None,
            "payment_type": None,
            "lolo_amount": None,
            "bl_no": None,
        }

        if surveyor.site.lolo_finance and surveyor.arrived in [
            "Factory",
            "FS RETURN",
            "CFS/ICD",
        ]:
            try:
                pregatein_obj = PreGateIn.objects.filter(
                    container_no=surveyor.container_no,
                    location=surveyor.location,
                    site=surveyor.site,
                    on_hold=False,
                    validity_expired=False,
                    is_gatein_done=False,
                ).latest("pk")
                adv_payment = AdvancedHandlingPayment.objects.get(
                    pk=pregatein_obj.adv_payment_id
                )
                main_data["apply_charges"] = "Party"
                main_data["customer_name"] = adv_payment.client.name
                main_data["payment_type"] = "Advance"
                main_data["lolo_amount"] = pregatein_obj.lolo_amount
                main_data["bl_no"] = pregatein_obj.bl_no
            except:
                pass

        return main_data

    def create_survey_object(self, site, stock, surveyor_data, created_by, labour_rate):

        if site.type == "DEPOT":
            return Survey.objects.create(
                depot=stock,
                non_depot=None,
                survey_by=surveyor_data.survey_by,
                created_by=created_by,
                updated_by=created_by,
                is_draft=True,
                is_proceed=False,
                original_date=surveyor_data.survey_date,
                original_time=surveyor_data.survey_time,
                current_date=surveyor_data.survey_date,
                current_time=surveyor_data.survey_time,
                labour_rate=labour_rate,
                estimate_number=surveyor_data.estimate_number,
            )
        else:
            return Survey.objects.create(
                depot=None,
                non_depot=stock,
                survey_by=surveyor_data.survey_by,
                created_by=created_by,
                updated_by=created_by,
                is_draft=True,
                is_proceed=False,
                original_date=surveyor_data.survey_date,
                original_time=surveyor_data.survey_time,
                current_date=surveyor_data.survey_date,
                current_time=surveyor_data.survey_time,
                labour_rate=labour_rate,
                estimate_number=surveyor_data.estimate_number,
            )

    def create_survey_line_object(self, survey, surveyor_data):
        survey_lines = SurveyorLine.objects.filter(parent=surveyor_data)
        for line_data in survey_lines:
            tariff_code = line_data.tariff_code
            main_component = line_data.main_component
            component_code = line_data.component_code
            component_description = line_data.component_description
            location_code = line_data.location_code
            location_description = line_data.location_description
            specific_location_code = line_data.specific_location_code
            specific_location_description = line_data.specific_location_description
            damage_code = line_data.damage_code
            damage_description = line_data.damage_description
            material_code = line_data.material_code
            material_description = line_data.material_description
            repair_code = line_data.repair_code
            repair_description = line_data.repair_description
            unit = line_data.unit
            measurement = line_data.measurement
            length_and_width = line_data.length_and_width
            quantity = line_data.quantity
            labour_hrs_tariff = line_data.labour_hrs_tariff
            wash_clean_tariff = line_data.wash_clean_tariff
            material_tariff = line_data.material_tariff
            labour_cost = line_data.labour_cost
            material_cost = line_data.material_cost
            total_cost = line_data.total_cost
            tariff_field_enabled = line_data.tariff_field_enabled
            remarks = line_data.remarks

            SurveyLine.objects.create(
                parent=survey,
                tariff_code=tariff_code,
                main_component=main_component,
                component_code=component_code,
                component_description=component_description,
                location_code=location_code,
                location_description=location_description,
                specific_location_code=specific_location_code,
                specific_location_description=specific_location_description,
                damage_code=damage_code,
                damage_description=damage_description,
                material_code=material_code,
                material_description=material_description,
                repair_code=repair_code,
                repair_description=repair_description,
                unit=unit,
                measurement=measurement,
                length_and_width=length_and_width,
                quantity=quantity,
                labour_hrs_tariff=labour_hrs_tariff,
                wash_clean_tariff=wash_clean_tariff,
                material_tariff=material_tariff,
                labour_cost=labour_cost,
                material_cost=material_cost,
                total_cost=total_cost,
                tariff_field_enabled=tariff_field_enabled,
                remarks=remarks,
            )

        return True

    def create_survey_image_objects(self, survey, surveyor_data):
        if SurveyorBeforeRepairImage.objects.filter(parent=surveyor_data).exists():
            surveyor_images = SurveyorBeforeRepairImage.objects.filter(
                parent=surveyor_data
            )
            for each in surveyor_images:
                BeforeRepairImage.objects.create(
                    parent=survey,
                    s3_object_name=each.s3_object_name,
                    s3_file_name=each.s3_file_name,
                )

            survey.is_img_uploaded = True
            if surveyor_data.site.type == "DEPOT":
                survey.depot.pre_mnr_img_uploaded = True
                survey.depot.save(update_fields=["pre_mnr_img_uploaded"])
            else:
                survey.non_depot.pre_mnr_img_uploaded = True
                survey.non_depot.save(update_fields=["pre_mnr_img_uploaded"])
            survey.save(update_fields=["is_img_uploaded"])
        return True


GRADE_CODE = [("A", "A"), ("B", "B"), ("C", "C"), ("D", "D"), ("E", "E"), ("F", "F")]


class Surveyor(models.Model):
    ARRIVED = [
        ("Factory", "Factory"),
        ("Road/Rail", "Road/Rail"),
        ("FS RETURN", "FS RETURN"),
        ("CFS/ICD", "CFS/ICD"),
        ("Port/Vessel", "Port/Vessel"),
    ]

    client = models.ForeignKey(
        Client,
        related_name="surveyor_client_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    line = models.ForeignKey(
        ClientAbbreviation,
        related_name="surveyor_line_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    container_no = models.CharField(max_length=200, null=True, blank=True)
    size = models.ForeignKey(
        ContainerSize,
        related_name="surveyor_container_size_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    type = models.ForeignKey(
        ContainerType,
        related_name="surveyor_container_type_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    location = models.ForeignKey(
        Location,
        related_name="surveyor_location_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        related_name="surveyor_site_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    survey_by = models.ForeignKey(
        MnrStaff,
        related_name="survey_by_surveyor_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    gate_in_date = models.DateField(null=True, blank=True)
    gate_in_time = models.TimeField(null=True, blank=True)
    survey_date = models.DateField(null=True, blank=True)
    survey_time = models.TimeField(null=True, blank=True)
    gross_wt = models.CharField(max_length=100, null=True, blank=True)
    tare_wt = models.CharField(max_length=100, null=True, blank=True)
    manufacturing_date = models.DateField(null=True, blank=True)
    is_img_uploaded = models.BooleanField(null=True, blank=True, default=False)
    is_new_container = models.BooleanField(null=True, blank=True, default=False)
    estimate_number = models.CharField(
        null=True, blank=True, max_length=200, unique=True, default=None
    )
    grade = models.CharField(max_length=100, null=True, blank=True, choices=GRADE_CODE)
    arrived = models.CharField(max_length=100, null=True, blank=True, choices=ARRIVED)
    objects = SurveyorManager()

    def __str__(self):
        return str(self.pk)


class SurveyorLineManager(models.Manager):
    def create_instance(self, parent, line_data):
        tariff_code = line_data.get("tariff_code", None)
        main_component = line_data.get("main_component", None)
        component_code = line_data.get("component_code", None)
        component_description = line_data.get("component_description", None)
        location_code = line_data.get("location_code", None)
        location_description = line_data.get("location_description", None)
        specific_location_code = line_data.get("specific_location_code", None)
        specific_location_description = line_data.get(
            "specific_location_description", None
        )
        damage_code = line_data.get("damage_code", None)
        damage_description = line_data.get("damage_description", None)
        material_code = line_data.get("material_code", None)
        material_description = line_data.get("material_description", None)
        repair_code = line_data.get("repair_code", None)
        repair_description = line_data.get("repair_description", None)
        unit = line_data.get("unit", None)
        measurement = line_data.get("measurement", None)
        length_and_width = line_data.get("length_and_width", None)
        quantity = line_data.get("quantity", None)
        labour_hrs_tariff = line_data.get("labour_hrs_tariff", None)
        wash_clean_tariff = line_data.get("wash_clean_tariff", None)
        material_tariff = line_data.get("material_tariff", None)
        labour_cost = line_data.get("labour_cost", None)
        material_cost = line_data.get("material_cost", None)
        total_cost = line_data.get("total_cost", None)
        tariff_field_enabled = line_data.get("tariff_field_enabled", None)
        remarks = line_data.get("remarks", None)

        return self.create(
            parent=parent,
            tariff_code=tariff_code,
            main_component=main_component,
            component_code=component_code,
            component_description=component_description,
            location_code=location_code,
            location_description=location_description,
            specific_location_code=specific_location_code,
            specific_location_description=specific_location_description,
            damage_code=damage_code,
            damage_description=damage_description,
            material_code=material_code,
            material_description=material_description,
            repair_code=repair_code,
            repair_description=repair_description,
            unit=unit,
            measurement=measurement,
            length_and_width=length_and_width,
            quantity=quantity,
            labour_hrs_tariff=labour_hrs_tariff,
            wash_clean_tariff=wash_clean_tariff,
            material_tariff=material_tariff,
            labour_cost=labour_cost,
            material_cost=material_cost,
            total_cost=total_cost,
            tariff_field_enabled=tariff_field_enabled,
            remarks=remarks,
        )

    def get_survey_line(self, parent):
        lines = self.filter(parent=parent)
        return [
            {
                "pk": line.pk,
                "main_component": line.main_component,
                "component_code": line.component_code,
                "component_description": line.component_description,
                "location_code": line.location_code,
                "location_description": line.location_description,
                "specific_location_code": line.specific_location_code,
                "specific_location_description": line.specific_location_description,
                "damage_code": line.damage_code,
                "damage_description": line.damage_description,
                "material_code": line.material_code,
                "material_description": line.material_description,
                "repair_code": line.repair_code,
                "repair_description": line.repair_description,
                "unit": line.unit,
                "measurement": line.measurement,
                "length_and_width": line.length_and_width,
                "quantity": line.quantity,
                "remarks": line.remarks,
                "tariff_code": line.tariff_code,
            }
            for line in lines
        ]


class SurveyorLine(models.Model):
    parent = models.ForeignKey(
        Surveyor,
        related_name="surveyor_line_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    tariff_field_enabled = models.BooleanField(null=True, blank=True, default=False)
    tariff_code = models.CharField(null=True, blank=True, max_length=200)
    main_component = models.CharField(null=True, blank=True, max_length=200)
    component_code = models.CharField(null=True, blank=True, max_length=200)
    component_description = models.CharField(null=True, blank=True, max_length=200)
    location_code = models.CharField(null=True, blank=True, max_length=200)
    location_description = models.CharField(null=True, blank=True, max_length=200)
    specific_location_code = models.CharField(null=True, blank=True, max_length=200)
    specific_location_description = models.CharField(
        null=True, blank=True, max_length=200
    )
    damage_code = models.CharField(null=True, blank=True, max_length=200)
    damage_description = models.CharField(null=True, blank=True, max_length=200)
    material_code = models.CharField(null=True, blank=True, max_length=200)
    material_description = models.CharField(null=True, blank=True, max_length=200)
    repair_code = models.CharField(null=True, blank=True, max_length=200)
    repair_description = models.CharField(null=True, blank=True, max_length=200)
    unit = models.CharField(null=True, blank=True, max_length=200)
    measurement = models.CharField(null=True, blank=True, max_length=200)
    length_and_width = models.CharField(null=True, blank=True, max_length=200)
    quantity = models.PositiveIntegerField(null=True, blank=True)
    labour_hrs_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    wash_clean_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    material_tariff = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    labour_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    material_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_cost = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    gst = models.CharField(max_length=100, null=True, blank=True, choices=GST_TYPE)
    cgst = models.CharField(max_length=100, null=True, blank=True)
    cgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    sgst = models.CharField(max_length=100, null=True, blank=True)
    sgst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    igst = models.CharField(max_length=100, null=True, blank=True)
    igst_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_tax_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    total_cost_with_tax = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remarks = models.TextField(null=True, blank=True)
    objects = SurveyorLineManager()

    def __str__(self):
        return str(self.pk)


class SurveyorBeforeRepairImageManager(models.Manager):
    def create_instance(self, surveyor, object_name, filename):
        return self.create(
            parent=surveyor,
            s3_object_name=object_name,
            s3_file_name=filename,
        )


class SurveyorBeforeRepairImage(models.Model):
    parent = models.ForeignKey(
        Surveyor,
        related_name="surveyor_before_repair_image_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    objects = SurveyorBeforeRepairImageManager()

    def __str__(self):
        return str(self.pk)


def randomNumber():
    random_no = f"E{random.randint(1000000, 9999999)}"
    while (
        Estimate.objects.filter(number=random_no).exists()
        or Survey.objects.filter(estimate_number=random_no).exists()
    ):
        random_no = f"E{random.randint(1000000, 9999999)}"
        if (
            not Estimate.objects.filter(number=random_no).exists()
            and not Survey.objects.filter(estimate_number=random_no).exists()
        ):
            break
    return random_no


def changeEstimateNumber():
    for each in Survey.objects.filter(
        depot__stage="Survey", estimate_number__isnull=True
    ):
        print("Im in Survey Depot")
        each.estimate_number = randomNumber()
        each.save()
    print("************ Survey Depot Done ***************")

    for each in Survey.objects.filter(
        non_depot__stage="Survey", estimate_number__isnull=True
    ):
        print("Im in Survey Non Depot")
        each.estimate_number = randomNumber()
        each.save()
    print("************** Survey Non Depot Done **************")

    for each in Estimate.objects.filter(
        parent__depot__stage="Estimate",
        parent__estimate_number__isnull=True,
    ):
        print("Im in Estimate Depot")
        each.parent.estimate_number = randomNumber()
        each.parent.save()
        each.number = each.parent.estimate_number
        each.est_rep_common_number = each.parent.estimate_number[1:]
        each.save()
    print("*************** Estimate Depot Done *****************")

    for each in Estimate.objects.filter(
        parent__non_depot__stage="Estimate",
        parent__estimate_number__isnull=True,
    ):
        print("Im in Estimate NonDepot")
        each.parent.estimate_number = randomNumber()
        each.parent.save()
        each.number = each.parent.estimate_number
        each.est_rep_common_number = each.parent.estimate_number[1:]
        each.save()
    print("************** Estimate NonDepot Done ****************")

    for each in Approval.objects.all():
        print("Im in Approval")
        each.parent.parent.estimate_number = each.parent.number
        each.parent.parent.save()
    print("************** Approval Done ****************")
    return True
