# models
from master.models import Location, Site
from account.models import AccountUser

# django
from django.db import models
from django.utils import timezone
from django.db.models import F, Sum, DecimalField, FloatField, Value, Max, Count
from django.db.models.functions import Coalesce

# error management
from common.exceptions import ResourceNotFound, AlreadyExists


class ToolCategoryManager(models.Manager):
    def getOrCreateCategoryByName(self, category):
        category, created = self.get_or_create(name=category)
        return category


class ToolCategory(models.Model):
    name = models.CharField(max_length=200, null=True, blank=False, unique=True)
    manager = ToolCategoryManager()

    def __str__(self):
        return self.name


class ToolRoomManager(models.Manager):
    def toolExists(self, params, exclude_pk=None):
        try:
            query = self.filter(**params)
        except:
            raise ResourceNotFound("Tool Does not Exists")
        if exclude_pk:
            query = query.exclude(pk=exclude_pk)
        return query.exists()

    def createTool(self, params):
        return self.create(**params)

    def checkToolNameExistence(self, name, category, location, site):
        if self.filter(
            name=name, category=category, location_id=location, site_id=site
        ).exists():
            raise AlreadyExists("Tool name already exists")
        return None

    def checkSKUExistence(self, sku_code, location, site):
        if self.filter(sku_code=sku_code, location_id=location, site_id=site).exists():
            raise AlreadyExists("SKU Code already exists")
        return None

    def getToolById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Tool Does not Exists")

    def updateToolById(self, pk, params):
        return self.filter(pk=pk).update(**params)

    def getToolList(self, param):
        try:
            return self.filter(**param).order_by("-pk")
        except:
            raise ResourceNotFound("Tool Does not Exists")

    def getToolNameList(self, params):
        try:
            return self.filter(**params).values("name", "pk")
        except:
            raise ResourceNotFound("Tool Does not Exists")

    def getToolByName(self, name, location, site):
        try:
            return self.get(name=name, location_id=location, site_id=site)
        except:
            raise ResourceNotFound("Tool not Found")

    def getToolByNameCategory(self, category, name, location, site):
        try:
            return self.get(
                category__name=category, name=name, location=location, site=site
            )
        except:
            raise ResourceNotFound("Tool not Found")

    def getToolCategoriesByLocationSite(self, location, site):
        try:
            return [
                {"pk": each["category_id"], "name": each["category__name"]}
                for each in self.select_related("category")
                .filter(location_id=location, site_id=site)
                .values("category__name", "category_id")
                .distinct()
            ]
        except:
            raise ResourceNotFound("Categories Does not Exists")

    def getSKUCodes(self, location, site):
        try:
            return (
                self.filter(location_id=location, site_id=site)
                .values_list("sku_code", flat=True)
                .distinct()
            )
        except:
            raise ResourceNotFound("SKU Code not found")

    def getToolsByIdsIn(self, ids, location, site):
        try:
            return self.filter(
                pk__in=ids,
                location_id=location,
                site_id=site,
            )
        except:
            raise ResourceNotFound("Tool Does not Exists")

    def getToolDataForConsumption(self, names, location, site):
        return (
            self.getToolsByNamesIn(
                names,
                location,
                site,
            )
            .values("name")
            .annotate(count=Count("name"))
        )

    def getToolsByNamesIn(
        self,
        names,
        location,
        site,
    ):
        return self.filter(name__in=names, location_id=location, site_id=site)

    def getInventoryDataObjectList(self, location, site, from_date, to_date):
        tools = self.filter(location_id=location, site_id=site).values(
            "pk", "name", "sku_code", "unit", "rate"
        )
        data_object_list = []
        for each in tools:
            # ------------------------ OP --------------------------------------
            requisition_data_for_op = (
                RequisitionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
                    parent__date__lt=from_date,
                )
                .values("received_qty")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_qty"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_op_add = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__lt=from_date,
                    parent__site_id=site,
                )
                .exclude(parent__requested_from_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            consumption_data_for_op = (
                ConsumptionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__date__lt=from_date,
                )
                .values("consumed_quantity")
                .aggregate(
                    quantity_consumed=Coalesce(
                        Sum("consumed_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_op_subs = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__lt=from_date,
                    parent__requested_from_id=site,
                )
                .exclude(parent__site_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            in_op = (
                requisition_data_for_op["quantity_purchased"]
                + tool_transfer_data_for_op_add["quantity_purchased"]
            )

            out_op = (
                consumption_data_for_op["quantity_consumed"]
                + tool_transfer_data_for_op_subs["quantity_purchased"]
            )

            opening_stock = 0
            if out_op > in_op:
                opening_stock = out_op - in_op
            else:
                opening_stock = in_op - out_op

            # opening_stock = (
            #     requisition_data_for_op["quantity_purchased"]
            #     + tool_transfer_data_for_op["quantity_purchased"]
            # ) - consumption_data_for_op["quantity_consumed"]

            # ----------------------------------------------------------------

            # --------------------------- CL ----------------------------------
            requisition_data_for_cl = (
                RequisitionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
                    parent__date__range=(from_date, to_date),
                )
                .values("received_qty")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_qty"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_cl_add = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__range=(from_date, to_date),
                    parent__site_id=site,
                )
                .exclude(parent__requested_from_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            consumption_data_for_cl = (
                ConsumptionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__date__range=(from_date, to_date),
                )
                .values("consumed_quantity")
                .aggregate(
                    quantity_consumed=Coalesce(
                        Sum("consumed_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_cl_subs = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__range=(from_date, to_date),
                    parent__requested_from_id=site,
                )
                .exclude(parent__site_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            in_cl = (
                opening_stock
                + requisition_data_for_cl["quantity_purchased"]
                + tool_transfer_data_for_cl_add["quantity_purchased"]
            )

            out_cl = (
                consumption_data_for_cl["quantity_consumed"]
                + tool_transfer_data_for_cl_subs["quantity_purchased"]
            )

            closing_stock = 0
            if out_cl > in_cl:
                closing_stock = out_cl - in_cl
            else:
                closing_stock = in_cl - out_cl

            # closing_stock = (
            #     opening_stock
            #     + (
            #         requisition_data_for_cl["quantity_purchased"]
            #         + tool_transfer_data_for_cl["quantity_purchased"]
            #     )
            # ) - consumption_data_for_cl["quantity_consumed"]

            # --------------------------------------------------------------

            data_object_list.append(
                {
                    "item_name": each["name"],
                    "sku_code": each["sku_code"],
                    "unit": each["unit"],
                    "opening_stock": opening_stock,
                    "received_quantity": in_cl,
                    "delivered_quantity": out_cl,
                    "closing_stock": closing_stock,
                    "rate": each["rate"],
                    "approx_value": closing_stock * each["rate"],
                }
            )

        return data_object_list

    def getStockDataObjectList(self, location, site, from_date, to_date):
        tools = (
            self.filter(location_id=location, site_id=site)
            .values("pk", "name", "sku_code", "unit", "rate")
            .order_by("-pk")
        )
        data = []
        for each in tools:
            # ------------------- OP ---------------------------------------
            requisition_data_for_op = (
                RequisitionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
                    parent__date__lt=from_date,
                )
                .values("received_qty")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_qty"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_op_add = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__lt=from_date,
                    parent__site_id=site,
                )
                .exclude(parent__requested_from_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            consumption_data_for_op = (
                ConsumptionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__date__lt=from_date,
                )
                .values("consumed_quantity")
                .aggregate(
                    quantity_consumed=Coalesce(
                        Sum("consumed_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_op_subs = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__lt=from_date,
                    parent__requested_from_id=site,
                )
                .exclude(parent__site_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            in_op = (
                requisition_data_for_op["quantity_purchased"]
                + tool_transfer_data_for_op_add["quantity_purchased"]
            )

            out_op = (
                consumption_data_for_op["quantity_consumed"]
                + tool_transfer_data_for_op_subs["quantity_purchased"]
            )

            opening_stock = 0
            if out_op > in_op:
                opening_stock = out_op - in_op
            else:
                opening_stock = in_op - out_op

            # opening_stock = (
            #     requisition_data_for_op["quantity_purchased"]
            #     + tool_transfer_data_for_op["quantity_purchased"]
            # ) - consumption_data_for_op["quantity_consumed"]

            #  ----------------------- CL ---------------------------------------
            requisition_data_for_cl = (
                RequisitionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
                    parent__date__range=(from_date, to_date),
                )
                .values("received_qty")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_qty"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_cl_add = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__range=(from_date, to_date),
                    parent__site_id=site,
                )
                .exclude(parent__requested_from_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            consumption_data_for_cl = (
                ConsumptionLine.manager.filter(
                    tool_id=each["pk"],
                    parent__date__range=(from_date, to_date),
                )
                .values("consumed_quantity")
                .aggregate(
                    quantity_consumed=Coalesce(
                        Sum("consumed_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            tool_transfer_data_for_cl_subs = (
                ToolTransferLine.manager.filter(
                    tool__name=each["name"],
                    parent__status__in=["Partial Approved", "Approved"],
                    parent__date__range=(from_date, to_date),
                    parent__requested_from_id=site,
                )
                .exclude(parent__site_id=site)
                .values("received_quantity")
                .aggregate(
                    quantity_purchased=Coalesce(
                        Sum("received_quantity"), 0, output_field=DecimalField()
                    ),
                )
            )

            in_cl = (
                opening_stock
                + requisition_data_for_cl["quantity_purchased"]
                + tool_transfer_data_for_cl_add["quantity_purchased"]
            )

            out_cl = (
                consumption_data_for_cl["quantity_consumed"]
                + tool_transfer_data_for_cl_subs["quantity_purchased"]
            )
            closing_stock = 0
            if out_cl > in_cl:
                closing_stock = out_cl - in_cl
            else:
                closing_stock = in_cl - out_cl

            # closing_stock = (
            #     opening_stock
            #     + (
            #         requisition_data_for_cl["quantity_purchased"]
            #         + tool_transfer_data_for_cl["quantity_purchased"]
            #     )
            # ) - consumption_data_for_cl["quantity_consumed"]

            #  -----------------------------------------------------------
            avg_price = abs(float(closing_stock) * float(each.get("rate", 0)))

            data.append(
                {
                    "tool": each.get("name", ""),
                    "sku_code": each.get("sku_code", ""),
                    "unit": each.get("unit", ""),
                    "stock_on_hand": closing_stock,
                    "avg_price": avg_price,
                    "rate": each.get("rate", ""),
                }
            )

        return data

    def decrementStock(self, pk, stock_quantity):
        tool = self.getToolById(pk)
        tool.in_stock = float(tool.in_stock) - float(stock_quantity)
        tool.save(update_fields=["in_stock"])

    def incrementStock(self, pk, stock_quantity):
        tool = self.getToolById(pk)
        tool.in_stock = float(tool.in_stock) + float(stock_quantity)
        tool.save(update_fields=["in_stock"])

    def getMasterStockData(self, params):
        return self.filter(**params).values(
            "pk",
            "category__name",
            "name",
            "sku_code",
            "rate",
            "in_stock",
            "unit",
            "location__name",
            "site__name",
        )

    def dataForMasterStock(self, site, params):
        return (
            self.filter(
                **params,
                site__name=site,
            )
            .values("name", "unit", "in_stock", "rate")
            .order_by("name")
        )


class ToolRoom(models.Model):
    UNIT = [
        ("NOS", "NOS"),
        ("FT", "FT"),
        ("PKT", "PKT"),
        ("SQFT", "SQFT"),
        ("MTR", "MTR"),
        ("LTR", "LTR"),
        ("KG", "KG"),
    ]
    category = models.ForeignKey(
        ToolCategory,
        blank=True,
        null=True,
        related_name="category_tool_room_rel",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=200, null=True, blank=False)
    sku_code = models.CharField(max_length=200, null=True, blank=False)
    unit = models.CharField(max_length=200, null=True, blank=True, choices=UNIT)
    rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    in_stock = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        blank=True,
        null=True,
        related_name="location_tool_room_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="site_tool_room_rel",
        on_delete=models.CASCADE,
    )
    manager = ToolRoomManager()

    def __str__(self):
        return self.name


class RequisitionManager(models.Manager):
    def getRequisitions(self, params):
        return self.filter(**params).order_by("-date")

    def aggregateMaxOrderNoCount(self, queryset):
        return queryset.aggregate(count=Max("order_no"))["count"]

    def checkIfOrderNoExists(self, location, site, order_no):
        return self.filter(
            location_id=location, site_id=site, order_no=order_no
        ).exists()

    def createRequisition(self, params):
        return self.create(**params)

    def getRequisitionById(self, pk):
        return self.get(pk=pk)


class Requisition(models.Model):
    STATUS = [
        ("PENDING", "PENDING"),
        ("APPROVED", "APPROVED"),
        ("PARTIAL CLOSED", "PARTIAL CLOSED"),
        ("CLOSED", "CLOSED"),
        ("AUTOMATE", "AUTOMATE"),
    ]
    order_no = models.CharField(max_length=200, null=True, blank=False)
    date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=200, null=True, blank=True, choices=STATUS)
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    location = models.ForeignKey(
        Location,
        blank=True,
        null=True,
        related_name="location_requisition_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="site_requisition_rel",
        on_delete=models.CASCADE,
    )
    manager = RequisitionManager()

    def __str__(self):
        return self.order_no


class RequisitionLineManager(models.Manager):
    def requisitionDataForToolRoom(self, param):
        return (
            self.select_related(
                "tool", "tool__category", "tool__location", "tool__site"
            )
            .filter(
                **param,
                parent__status__in=["PARTIAL CLOSED", "CLOSED"],
            )
            .values(
                "tool__pk",
                "tool__category__name",
                "tool__name",
                "tool__in_stock",
            )
            .annotate(
                quantity_purchased=Sum("received_qty"),
                purchased_amount=Sum("amount"),
            )
            .order_by("-tool__pk")
        )

    def createRequisitionLine(self, params):
        return self.create(**params)

    def getRequisitionLines(self, parent):
        return self.select_related("tool", "parent", "tool__category").filter(
            parent=parent
        )

    def linesToBeDeleted(self, line_to_be_deleted):
        self.filter(pk__in=line_to_be_deleted).delete()

    def getRequisitionLinesIds(self, parent):
        return self.filter(parent=parent).values("pk")

    def getRequisitionLineById(self, pk):
        return self.get(pk=pk)

    def getListOfIds(self, param):
        return list(
            set(
                self.select_related("parent")
                .filter(**param)
                .values_list("parent__pk", flat=True)
            )
        )

    def getRequisitionLineDataForApprovalPdf(self, parent):
        return list(
            self.select_related("tool")
            .filter(parent=parent)
            .values(
                "tool__name",
                "tool__sku_code",
                "tool__unit",
                "required_qty",
                "tool__in_stock",
            )
        )

    def getDateWiseRequisitionObjectList(
        self, from_date, to_date, location, site, tool
    ):
        return list(
            self.filter(
                parent__date__range=(from_date, to_date),
                parent__location_id=location,
                parent__site_id=site,
                tool__name=tool,
                parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
            )
            .select_related("tool", "parent")
            .values(
                "parent__date",
                "parent__order_no",
                "tool__name",
                "tool__unit",
                "tool__rate",
                "tool__sku_code",
                "parent__status",
            )
            .annotate(
                quantity_purchased=Coalesce(
                    Sum("received_qty"), 0, output_field=DecimalField()
                ),
                tool_amount=Coalesce(Sum("amount"), 0, output_field=DecimalField()),
            )
            .order_by("parent__date")
        )

    def getRequisitionObjectList(self, from_date, to_date, location, site, category):
        if category:
            return list(
                self.filter(
                    parent__date__range=(from_date, to_date),
                    parent__location_id=location,
                    parent__site_id=site,
                    parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
                    tool__category_id=category,
                )
                .select_related("tool")
                .values("tool__name")
                .annotate(
                    unit=F("tool__unit"),
                    sku_code=F("tool__sku_code"),
                    quantity_purchased=Coalesce(
                        Sum("received_qty"), 0, output_field=DecimalField()
                    ),
                    amount=Coalesce(Sum("amount"), 0, output_field=DecimalField()),
                    current_price=F("tool__rate"),
                    current_status=F("parent__status"),
                )
                .order_by("tool__name")
            )
        else:
            return list(
                self.filter(
                    parent__date__range=(from_date, to_date),
                    parent__location_id=location,
                    parent__site_id=site,
                    parent__status__in=["CLOSED", "PARTIAL CLOSED", "AUTOMATE"],
                )
                .select_related("tool")
                .values("tool__name")
                .annotate(
                    unit=F("tool__unit"),
                    sku_code=F("tool__sku_code"),
                    quantity_purchased=Coalesce(
                        Sum("received_qty"), 0, output_field=DecimalField()
                    ),
                    amount=Coalesce(Sum("amount"), 0, output_field=DecimalField()),
                    current_price=F("tool__rate"),
                    current_status=F("parent__status"),
                )
                .order_by("tool__name")
            )


class RequisitionLine(models.Model):
    parent = models.ForeignKey(
        Requisition,
        blank=True,
        null=True,
        related_name="parent_requisition_line_rel",
        on_delete=models.CASCADE,
    )
    tool = models.ForeignKey(
        ToolRoom,
        blank=True,
        null=True,
        related_name="tool_room_requisition_line_rel",
        on_delete=models.CASCADE,
    )
    rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    required_qty = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    received_qty = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remaining_qty = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remarks = models.TextField(null=True, blank=True)
    manager = RequisitionLineManager()

    def __str__(self):
        return str(self.pk)


class ConsumptionManager(models.Manager):
    def getConsumptions(self, params):
        return self.filter(**params).order_by("-date")

    def aggregateMaxOrderNoCount(self, queryset):
        return queryset.aggregate(count=Max("consumption_no"))["count"]

    def checkIfConsumptionNoExists(self, location, site, consumption_no):
        return self.filter(
            location_id=location, site_id=site, consumption_no=consumption_no
        ).exists()

    def createConsumption(self, params):
        return self.create(**params)

    def getConsumptionById(self, pk):
        return self.get(pk=pk)


class Consumption(models.Model):
    consumption_no = models.CharField(max_length=200, null=True, blank=False)
    date = models.DateField(null=True, blank=True)
    location = models.ForeignKey(
        Location,
        blank=True,
        null=True,
        related_name="location_consumption_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="site_consumption_rel",
        on_delete=models.CASCADE,
    )
    manager = ConsumptionManager()

    def __str__(self):
        return self.consumption_no


class ConsumptionLineManager(models.Manager):
    def consumptionDataForToolRoom(self, param):
        return (
            self.select_related(
                "tool", "tool__category", "tool__location", "tool__site"
            )
            .filter(**param)
            .values(
                "tool__pk",
                "tool__category__name",
                "tool__name",
                "tool__in_stock",
            )
            .annotate(quantity_consumed=Sum("consumed_quantity"))
            .order_by("-tool__pk")
        )

    def createConsumptionLine(self, params):
        return self.create(**params)

    def getConsumptionByParents(self, parent):
        return self.select_related("tool__category", "tool").filter(parent=parent)

    def getConsumptionLineById(self, pk):
        return self.get(pk=pk)

    def bulkCreate(self, data):
        self.bulk_create(data)

    def getListOfIds(self, param):
        return list(
            set(
                self.select_related("parent")
                .filter(**param)
                .values_list("parent__pk", flat=True)
            )
        )

    def getDateWiseConsumptionObjectList(
        self, from_date, to_date, location, site, tool
    ):
        return list(
            self.filter(
                parent__date__range=(from_date, to_date),
                parent__location_id=location,
                parent__site_id=site,
                tool__name=tool,
            )
            .select_related("tool")
            .values(
                "parent__consumption_no",
                "parent__date",
                "tool__name",
                "tool__unit",
                "tool__sku_code",
            )
            .annotate(
                quantity_consumed=Coalesce(
                    Sum("consumed_quantity"), 0, output_field=DecimalField()
                ),
            )
            .order_by("parent__date")
        )

    def getConsumptionDataObjectList(
        self, from_date, to_date, location, site, category
    ):
        if category:
            return list(
                self.filter(
                    parent__date__range=(from_date, to_date),
                    parent__location_id=location,
                    parent__site_id=site,
                    tool__category_id=category,
                )
                .select_related("tool")
                .values("tool__name")
                .annotate(
                    sku_code=F("tool__sku_code"),
                    unit=F("tool__unit"),
                    quantity_consumed=Coalesce(
                        Sum("consumed_quantity"), 0, output_field=DecimalField()
                    ),
                    amount=Sum(
                        F("consumed_quantity") * F("tool__rate"),
                        output_field=DecimalField(),
                    )
                    / Value(1.0, output_field=DecimalField()),
                    average_price=F("tool__rate"),
                )
                .order_by("tool__name")
            )
        else:
            return list(
                self.filter(
                    parent__date__range=(from_date, to_date),
                    parent__location_id=location,
                    parent__site_id=site,
                )
                .select_related("tool")
                .values("tool__name")
                .annotate(
                    sku_code=F("tool__sku_code"),
                    unit=F("tool__unit"),
                    quantity_consumed=Coalesce(
                        Sum("consumed_quantity"), 0, output_field=DecimalField()
                    ),
                    amount=Sum(
                        F("consumed_quantity") * F("tool__rate"),
                        output_field=DecimalField(),
                    )
                    / Value(1.0, output_field=DecimalField()),
                    average_price=F("tool__rate"),
                )
                .order_by("tool__name")
            )


class ConsumptionLine(models.Model):
    parent = models.ForeignKey(
        Consumption,
        blank=True,
        null=True,
        related_name="parent_consumption_line_rel",
        on_delete=models.CASCADE,
    )
    tool = models.ForeignKey(
        ToolRoom,
        blank=True,
        null=True,
        related_name="tool_room_consumption_line_rel",
        on_delete=models.CASCADE,
    )
    consumed_quantity = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    remarks = models.TextField(null=True, blank=True)
    manager = ConsumptionLineManager()

    def __str__(self):
        return str(self.pk)


class RequisitionHistoryLineManager(models.Manager):
    def getRequisitionHistoryLines(self, parent):
        return self.filter(parent=parent).values(
            "pk",
            "order_no",
            "date",
            "bill_date",
            "received_date",
            "bill_no",
            "total_amount",
            "is_bill_uploaded",
        )

    def createRequisitionHistoryLines(self, params):
        return self.create(**params)

    def getListOfIds(self, params):
        return self.filter(**params).values_list("parent__pk", flat=True)

    def getHistoryLineById(self, pk):
        return self.get(pk=pk)

    def getRequisitionHistoryLinesByParams(self, params):
        return self.filter(**params).values(
            "pk",
            "order_no",
            "date",
            "bill_date",
            "received_date",
            "bill_no",
            "total_amount",
            "is_bill_uploaded",
        )

    def updateRequisitionHistory(self, pk, total_amount):
        self.filter(pk=pk).update(total_amount=total_amount)


class RequisitionHistoryLine(models.Model):
    parent = models.ForeignKey(
        Requisition,
        blank=True,
        null=True,
        related_name="parent_requisition_history_line_rel",
        on_delete=models.CASCADE,
    )
    order_no = models.CharField(max_length=200, null=True, blank=False)
    date = models.DateField(null=True, blank=True)
    bill_date = models.DateField(null=True, blank=True)
    received_date = models.DateField(null=True, blank=True)
    bill_no = models.CharField(max_length=200, null=True, blank=True)
    total_amount = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    is_bill_uploaded = models.BooleanField(null=True, blank=True, default=False)
    manager = RequisitionHistoryLineManager()

    def __str__(self):
        return str(self.pk)


class ToolRateHistoryManager(models.Manager):
    def createToolRateHistory(self, params):
        return self.create(**params)

    def getToolRateHistory(self, params):
        return (
            self.select_related("tool", "tool__category", "location", "site")
            .filter(**params)
            .values(
                "created_at",
                "tool__category__name",
                "tool__name",
                "modified_rate",
                "previous_rate",
                "location__name",
                "site__name",
            )
        )


class ToolRateHistory(models.Model):
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    tool = models.ForeignKey(
        ToolRoom,
        blank=True,
        null=True,
        related_name="tool_room_tool_rate_history_rel",
        on_delete=models.CASCADE,
    )
    previous_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    modified_rate = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    changed_in = models.CharField(max_length=20, null=True, blank=False)
    requisition_order_no = models.CharField(max_length=30, null=True, blank=False)
    location = models.ForeignKey(
        Location,
        blank=True,
        null=True,
        related_name="location_tool_rate_history_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="site_tool_rate_history_rel",
        on_delete=models.CASCADE,
    )
    manager = ToolRateHistoryManager()

    def __str__(self):
        return str(self.pk)


class BillUploadManager(models.Manager):

    def checkBillExistence(self, parent):
        return self.filter(parent=parent)

    def getBillDataByParent(self, parent):
        return self.get(parent=parent)

    def createBill(self, params):
        self.create(**params)


class BillUpload(models.Model):
    parent = models.ForeignKey(
        RequisitionHistoryLine,
        related_name="bill_upload_parent_rel",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
    )
    s3_object_name = models.TextField(null=True, blank=True)
    s3_file_name = models.TextField(null=True, blank=True)
    manager = BillUploadManager()

    def __str__(self):
        return str(self.pk)


class ToolTransferManager(models.Manager):
    def getToolTransfers(self, params):
        return self.filter(**params)

    def aggregateMaxOrderNoCount(self, queryset):
        return queryset.aggregate(count=Max("tool_transfer_no"))["count"]

    def checkIfToolTransferNoExists(self, location, site, order_no, transfer_type):
        return self.filter(
            location_id=location,
            site_id=site,
            tool_transfer_no=order_no,
            transfer_type=transfer_type,
        ).exists()

    def createToolTransfer(self, params):
        return self.create(**params)

    def getToolTransferById(self, pk):
        return self.get(pk=pk)

    def toolTransferQueryset(self, tool_transfer_pk):
        return self.filter(pk__in=tool_transfer_pk)


class ToolTransfer(models.Model):
    TOOL_TRANSFER_STATUS = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Partial Approved", "Partial Approved"),
    ]
    TOOL_TRANSFER_TYPE = [
        ("Site Transfer", "Site Transfer"),
        ("Location Transfer", "Location Transfer"),
    ]
    date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True, default=timezone.now)
    status = models.CharField(
        max_length=200, null=True, blank=True, choices=TOOL_TRANSFER_STATUS
    )
    tool_transfer_no = models.CharField(max_length=30, null=True, blank=False)
    location = models.ForeignKey(
        Location,
        blank=True,
        null=True,
        related_name="tool_request_transfer_location_rel",
        on_delete=models.CASCADE,
    )
    site = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="tool_request_transfer_site_rel",
        on_delete=models.CASCADE,
    )
    requested_from = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="tool_request_transfer_requested_from_rel",
        on_delete=models.CASCADE,
    )
    transfer_type = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        choices=TOOL_TRANSFER_TYPE,
        default="Site Transfer",
    )

    manager = ToolTransferManager()

    def __str__(self):
        return self.tool_transfer_no


class ToolTransferLineManager(models.Manager):

    def createToolTransferLine(self, params):
        for each in params:
            self.create(**each)

    def getToolTransferLineByParent(self, parent):
        return self.filter(parent=parent)

    def getToolTransferLineById(self, pk):
        return self.get(pk=pk)

    def getToolTransferIds(self, params):
        return self.filter(**params).values_list("parent__pk", flat=True)


class ToolTransferLine(models.Model):
    parent = models.ForeignKey(
        ToolTransfer,
        blank=True,
        null=True,
        related_name="tool_transfer_line_parent_rel",
        on_delete=models.CASCADE,
    )
    tool = models.ForeignKey(
        ToolRoom,
        blank=True,
        null=True,
        related_name="tool_transfer_line_tool_rel",
        on_delete=models.CASCADE,
    )
    required_quantity = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    received_quantity = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )

    manager = ToolTransferLineManager()

    def __str__(self):
        return str(self.pk)


class ToolTransferHistoryManager(models.Manager):

    def createToolTransferHistory(self, params):
        self.create(**params)


class ToolTransferHistory(models.Model):
    parent = models.ForeignKey(
        ToolTransfer,
        blank=True,
        null=True,
        related_name="tool_transfer_history_parent_rel",
        on_delete=models.CASCADE,
    )
    approved_by = models.ForeignKey(
        Site,
        blank=True,
        null=True,
        related_name="tool_transfer_history_approved_by_rel",
        on_delete=models.CASCADE,
    )
    tool = models.ForeignKey(
        ToolRoom,
        blank=True,
        null=True,
        related_name="tool_transfer_history_tool_rel",
        on_delete=models.CASCADE,
    )
    tools_added = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    tools_removed = models.DecimalField(
        null=True, blank=True, decimal_places=2, default=0, max_digits=10
    )
    manager = ToolTransferHistoryManager()

    def __str__(self):
        return str(self.pk)


class SharedClass:
    def adminSites(self, location):
        return Site.objects.filter(location_id=location, procurement_admin=True).values(
            "name", "pk"
        )

    def allAdminSites(self, site_id):
        return (
            Site.objects.filter(procurement_admin=True)
            .exclude(pk=int(site_id))
            .annotate(
                location_name=F("location__name"),
                location_pk=F("location__pk"),
            )
            .values("name", "pk", "location_name", "location_pk")
        )

    def checkOrderNoExistence(self, process, order_no, location, site):
        if process == "Requisition":
            return Requisition.manager.checkIfOrderNoExists(location, site, order_no)
        else:
            return Consumption.manager.checkIfConsumptionNoExists(
                location, site, order_no
            )

    def getAccountUser(self, user):
        return AccountUser.objects.get(username=user)

    def getMergeFormat(self, workbook):
        merge_format = workbook.add_format(
            {
                "bold": 2,
                "align": "center",
                "valign": "vcenter",
                "font_color": "#e0a92a",
                "font_size": 18,
            }
        )
        merge_format3 = workbook.add_format(
            {
                "bold": 1,
                "font_size": 11,
            }
        )
        return merge_format, merge_format3

    def checkIfProcurementAdminExists(self, location):
        return Site.objects.filter(
            procurement_admin=True, location_id=location
        ).exists()

    def procurementEnabledSites(self, params):
        return Site.objects.filter(
            procurement_module=True, location_id=params.get("location_id")
        ).values_list("name", flat=True)

    def getSiteById(self, pk):
        try:
            return Site.objects.get(pk=pk)
        except:
            raise ResourceNotFound("Site not found")
