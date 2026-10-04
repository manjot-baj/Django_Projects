# django
from django.db import models

# error handling
from common.exceptions import ResourceNotFound, ValidationError, AlreadyExists

# models
from master.models import Transporter, Location, Site


class TruckTrackingManager(models.Manager):
    def createTruckEntry(self, params):
        return self.create(**params)

    def getTruckTrackingQuerysetByParams(self, params):
        try:
            return self.filter(**params)
        except:
            raise ResourceNotFound("Truck Entry Not Found")

    def getTransporterByName(self, transporter, location, site):
        try:
            return Transporter.objects.get(
                name=transporter, location_id=location, site_id=site
            )
        except:
            raise ResourceNotFound("Transporter Not Found")

    def getTruckEntryById(self, pk):
        try:
            return self.get(pk=pk)
        except:
            raise ResourceNotFound("Data Not Found")

    def getTransporterDataByParams(self, params):
        try:
            return self.values("transporter__name", "vehicle_no", "line").get(**params)
        except:
            raise ResourceNotFound("Data Not Found")

    def checkTruckEntry(self, params):
        if self.filter(**params).exists():
            raise AlreadyExists("Vehicle with the same transporter already exists!")

        return None

    def getListOfTransportersByParams(self, params):
        try:
            return (
                self.select_related("transporter")
                .values_list("transporter__name", flat=True)
                .filter(**params)
                .distinct()
            )
        except:
            raise ResourceNotFound("Not Found")


class TruckTracking(models.Model):
    MOVE_MODE = [("IMPORT", "IMPORT"), ("EXPORT", "EXPORT"), ("RE-EXPORT", "RE-EXPORT")]
    STATUS = [
        ("IN QUEUE", "IN QUEUE"),
        ("OUT", "OUT"),
    ]
    line = models.CharField(max_length=100)
    vehicle_no = models.CharField(max_length=30)
    transporter = models.ForeignKey(
        Transporter,
        on_delete=models.CASCADE,
        related_name="transporter_to_truck_tracking_rel",
    )
    move_mode = models.CharField(max_length=20, choices=MOVE_MODE)
    booking_no = models.CharField(max_length=30)
    gate_in_time = models.DateTimeField(auto_now_add=True)
    gate_out_time = models.DateTimeField(null=True)
    status = models.CharField(max_length=20, choices=STATUS, default="IN QUEUE")
    time_since = models.DurationField(null=True)
    container_no = models.CharField(max_length=20)
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name="location_to_truck_tracking_rel",
    )
    site = models.ForeignKey(
        Site, on_delete=models.CASCADE, related_name="site_to_truck_tracking_rel"
    )
    objects = TruckTrackingManager()

    def __str__(self):
        return f"{self.vehicle_no} - {self.status}"
