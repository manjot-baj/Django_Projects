from rest_framework import serializers
from django.contrib.auth.models import User
from hsm import models
from hsm import society
from hsm import maintenance
from hsm import helpdesk
from hsm import pomodels
from hsm import POMaker
from rest_framework.authtoken.models import Token

class HsmUserTokenSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'user',
            'key',
        )
        model = Token

class HsmUserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'username',
            'password',
            'email'
        )
        model = User


class HsmSocietySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'registration_number',
            'partner',
            'society_wing_rel',
            'maintenance_due_days',
            'maintenance_due_charge',
        )
        model = society.ResSociety


class HsmFlatSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'number',
            'wing',
            'area',
            'registration_number',
            'registration_date',
            'society',
            'flat_owner',
            'flat_renter',
        )
        model = society.ResFlat


class HsmNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'title',
            'date',
            'description',
        )
        model = society.Notice


class HsmMemberSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'dob',
            'street1',
            'street2',
            'city',
            'state',
            'country',
            'zip_code',
            'mobile_no',
            'alt_mobile_no',
            'email',
            'user',
            'partner_type',
            'partner_post_rel',
            'society',
        )
        model = models.ResPartner


class HsmMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'flat',
            'notes',
            'state',
            'paid_date',
            'bill_date',
            'transaction',
            'sub_total',
            'total',
        )
        model = maintenance.Maintenance


class HsmMaintenanceLineSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'maintenance',
            'cost',
            'service',
        )
        model = maintenance.MaintenanceLine


class HsmHelpdeskSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'complaint_type',
            'comment',
            'status_type',
            'reply',
        )
        model = helpdesk.Complaint


class HsmProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'product_no',
            'name',
            'category',
            'description',
            'product_price',
        )
        model = pomodels.ResProductDetail


class HsmVendorDetailSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'vendor_no',
            'company_name',
            'category',
            'street1',
            'street2',
            'city',
            'state',
            'country',
            'zip_code',
            'mobile_no',
            'alt_mobile_no',
            'email',
            'description',
        )
        model = pomodels.ResVendorDetail


class HsmPurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'date',
            'purchase_order_no',
            'society',
            'vendor',
            'requistion_detail',
            'tax',
            'shipping_charges',
            'other_charges',
            'grand_total',
            'special_instructions',
        )
        model = POMaker.PurchaseOrderMaker


class HsmPurchaseOrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'purchase_order_no',
            'product',
            'quantity',
            'total',
        )
        model = POMaker.PurchaseOrderLine


class HsmResCountrySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'code',
        )
        model = models.ResCountry


class HsmResStateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'code',
            'country',
        )
        model = models.ResState


class HsmResPartnerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
        )
        model = models.ResPartnerType


class HsmResPostSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'period',
            'period_type',
        )
        model = models.ResPost


class HsmResWingSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
        )
        model = society.ResWing


class HsmServiceSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
        )
        model = society.Service


class HsmSocietyServiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'service_type',
            'price',
            'society',
        )
        model = society. SocietyServiceLine

class HsmComplaintCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'description',
        )
        model = helpdesk.ComplaintCategory

class HsmResProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'create_date',
            'write_date',
            'create_user_id',
            'write_user_id',
            'name',
            'description',
        )
        model = pomodels.ResProductCategory

