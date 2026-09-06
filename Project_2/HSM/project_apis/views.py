from django.shortcuts import render
from rest_framework import generics
from . import serializers
from django.contrib.auth.models import User
from hsm import society
from hsm import models
from hsm import maintenance
from hsm import helpdesk
from hsm import pomodels
from hsm import POMaker
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token


class ListHsmUserTokenSerializer(generics.ListCreateAPIView):
    queryset = Token.objects.all()
    serializer_class = serializers.HsmUserTokenSerializer


class ListHsmUserSerializer(generics.ListCreateAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = serializers.HsmUserSerializer


class DetailHsmUserSerializer(generics.RetrieveUpdateDestroyAPIView):
    # permission_classes = (IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = serializers.HsmUserSerializer


class ListHsmSocietySerializer(generics.ListCreateAPIView):
    queryset = society.ResSociety.objects.all()
    serializer_class = serializers.HsmSocietySerializer


class DetailHsmSocietySerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = society.ResSociety.objects.all()
    serializer_class = serializers.HsmSocietySerializer


class ListHsmFlatSerializer(generics.ListCreateAPIView):
    queryset = society.ResFlat.objects.all()
    serializer_class = serializers.HsmFlatSerializer


class DetailHsmFlatSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = society.ResFlat.objects.all()
    serializer_class = serializers.HsmFlatSerializer


class ListHsmNoticeSerializer(generics.ListCreateAPIView):
    queryset = society.Notice.objects.all()
    serializer_class = serializers.HsmNoticeSerializer


class DetailHsmNoticeSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = society.Notice.objects.all()
    serializer_class = serializers.HsmNoticeSerializer


class ListHsmMemberSerializer(generics.ListCreateAPIView):
    queryset = models.ResPartner.objects.all()
    serializer_class = serializers.HsmMemberSerializer


class DetailHsmMemberSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.ResPartner.objects.all()
    serializer_class = serializers.HsmMemberSerializer


class ListHsmMaintenanceSerializer(generics.ListCreateAPIView):
    queryset = maintenance.Maintenance.objects.all()
    serializer_class = serializers.HsmMaintenanceSerializer


class DetailHsmMaintenanceSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = maintenance.Maintenance.objects.all()
    serializer_class = serializers.HsmMaintenanceSerializer


class ListHsmMaintenanceLineSerializer(generics.ListCreateAPIView):
    queryset = maintenance.MaintenanceLine.objects.all()
    serializer_class = serializers.HsmMaintenanceLineSerializer


class DetailHsmMaintenanceLineSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = maintenance.MaintenanceLine.objects.all()
    serializer_class = serializers.HsmMaintenanceLineSerializer


class ListHsmHelpdeskSerializer(generics.ListCreateAPIView):
    queryset = helpdesk.Complaint.objects.all()
    serializer_class = serializers.HsmHelpdeskSerializer


class DetailHsmHelpdeskSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = helpdesk.Complaint.objects.all()
    serializer_class = serializers.HsmHelpdeskSerializer


class ListHsmProductDetailSerializer(generics.ListCreateAPIView):
    queryset = pomodels.ResProductDetail.objects.all()
    serializer_class = serializers.HsmProductDetailSerializer


class DetailHsmProductDetailSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = pomodels.ResProductDetail.objects.all()
    serializer_class = serializers.HsmProductDetailSerializer


class ListHsmVendorDetailSerializer(generics.ListCreateAPIView):
    queryset = pomodels.ResVendorDetail.objects.all()
    serializer_class = serializers.HsmVendorDetailSerializer


class DetailHsmVendorDetailSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = pomodels.ResVendorDetail.objects.all()
    serializer_class = serializers.HsmVendorDetailSerializer


class ListHsmPurchaseOrderSerializer(generics.ListCreateAPIView):
    queryset = POMaker.PurchaseOrderMaker.objects.all()
    serializer_class = serializers.HsmPurchaseOrderSerializer


class DetailHsmPurchaseOrderSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = POMaker.PurchaseOrderMaker.objects.all()
    serializer_class = serializers.HsmPurchaseOrderSerializer


class ListHsmPurchaseOrderLineSerializer(generics.ListCreateAPIView):
    queryset = POMaker.PurchaseOrderLine.objects.all()
    serializer_class = serializers.HsmPurchaseOrderLineSerializer


class DetailHsmPurchaseOrderLineSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = POMaker.PurchaseOrderLine.objects.all()
    serializer_class = serializers.HsmPurchaseOrderLineSerializer


class ListHsmResCountrySerializer(generics.ListCreateAPIView):
    queryset = models.ResCountry.objects.all()
    serializer_class = serializers.HsmResCountrySerializer


class DetailHsmResCountrySerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.ResCountry.objects.all()
    serializer_class = serializers.HsmResCountrySerializer


class ListHsmResStateSerializer(generics.ListCreateAPIView):
    queryset = models.ResState.objects.all()
    serializer_class = serializers.HsmResStateSerializer


class DetailHsmResStateSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.ResState.objects.all()
    serializer_class = serializers.HsmResStateSerializer


class ListHsmResPartnerTypeSerializer(generics.ListCreateAPIView):
    queryset = models.ResPartnerType.objects.all()
    serializer_class = serializers.HsmResPartnerTypeSerializer


class DetailHsmResPartnerTypeSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.ResPartnerType.objects.all()
    serializer_class = serializers.HsmResPartnerTypeSerializer


class ListHsmResPostSerializer(generics.ListCreateAPIView):
    queryset = models.ResPost.objects.all()
    serializer_class = serializers.HsmResPostSerializer


class DetailHsmResPostSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.ResPost.objects.all()
    serializer_class = serializers.HsmResPostSerializer


class ListHsmResWingSerializer(generics.ListCreateAPIView):
    queryset = society.ResWing.objects.all()
    serializer_class = serializers.HsmResWingSerializer


class DetailHsmResWingSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = society.ResWing.objects.all()
    serializer_class = serializers.HsmResWingSerializer


class ListHsmServiceSerializer(generics.ListCreateAPIView):
    queryset = society.Service.objects.all()
    serializer_class = serializers.HsmServiceSerializer


class DetailHsmServiceSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = society.Service.objects.all()
    serializer_class = serializers.HsmServiceSerializer


class ListHsmSocietyServiceLineSerializer(generics.ListCreateAPIView):
    queryset = society.SocietyServiceLine.objects.all()
    serializer_class = serializers.HsmSocietyServiceLineSerializer


class DetailHsmSocietyServiceLineSerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = society.SocietyServiceLine.objects.all()
    serializer_class = serializers.HsmSocietyServiceLineSerializer


class ListHsmComplaintCategorySerializer(generics.ListCreateAPIView):
    queryset = helpdesk.ComplaintCategory.objects.all()
    serializer_class = serializers.HsmComplaintCategorySerializer


class DetailHsmComplaintCategorySerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = helpdesk.ComplaintCategory.objects.all()
    serializer_class = serializers.HsmComplaintCategorySerializer


class ListHsmResProductCategorySerializer(generics.ListCreateAPIView):
    queryset = pomodels.ResProductCategory.objects.all()
    serializer_class = serializers.HsmResProductCategorySerializer


class DetailHsmResProductCategorySerializer(generics.RetrieveUpdateDestroyAPIView):
    queryset = pomodels.ResProductCategory.objects.all()
    serializer_class = serializers.HsmResProductCategorySerializer
