from django.db import models

from . import models as base
from . import society


class PartnerVehicle(base.BaseModel):
    VEHICLE_FOUR_WHEELER = "Four Wheeler"
    VEHICLE_TWO_WHEELER = "Two Wheeler"
    VEHICLE_OTHER = "Other"
    VEHICLE_CHOICES = (
        (VEHICLE_FOUR_WHEELER, "Four Wheeler"),
        (VEHICLE_TWO_WHEELER, "Two Wheeler"),
        (VEHICLE_OTHER, "Other"),
    )
    owner = models.ForeignKey(base.ResPartner, on_delete=models.SET_NULL, null=True, blank=False)
    vehicle = models.CharField(choices=VEHICLE_CHOICES, max_length=20, null=True, blank=False)
    registration_number = models.CharField(max_length=40, unique=True, null=True, blank=False)
    society = models.ForeignKey(society.ResSociety, on_delete=models.SET_NULL, null=True, blank=False)

    def __str__(self):
        return self.registration_number

    class Meta:
        db_table = 'partner_vehicle_rel'


class VehicleParking(base.BaseModel):
    name = models.CharField(max_length=40, null=True, blank=False)
    parked_vehicle = models.ForeignKey(PartnerVehicle, on_delete=models.SET_NULL, null=True, blank=False)
    society = models.ForeignKey(society.ResSociety, on_delete=models.SET_NULL, null=True, blank=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'vehicle_parking'
