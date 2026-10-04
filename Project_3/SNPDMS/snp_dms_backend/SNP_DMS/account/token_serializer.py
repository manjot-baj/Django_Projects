from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import AccountUser
import logging, traceback


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        try:
            role = ""
            account_user = AccountUser.objects.get(username=self.user.username)
            if account_user.role.name == "Admin":
                role = "Admin"
                location = ""
                site = ""
                site_type = ""
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "Location Admin":
                role = "Location Admin"
                location = account_user.location.name
                site = ""
                site_type = ""
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "Site Admin":
                # role = "Site Admin"
                # location = account_user.location.name
                # site_data = account_user.site.get_site_detail()
                # site = site_data["name"]
                # site_type = site_data["type"]
                role = "Site Admin"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                site = site_data["name"]
                site_type = site_data["type"]
                mnr_module = site_data["mnr_module"]
                automatic_mnr_status_change = site_data["automatic_mnr_status_change"]
                transportation_module = site_data["transportation_module"]
                loaded_yard_module = site_data["loaded_yard_module"]
                new_billing_module = site_data["new_billing_module"]
                procurement_module = site_data["procurement_module"]
                lolo_finance = site_data["lolo_finance"]
                procurement_admin = site_data["procurement_admin"]
                mnr_ftp_upload = site_data["mnr_ftp_upload"]
                truck_tracking = site_data["truck_tracking"]
                en_block_movement = site_data["en_block_movement"]
                en_block_movement_v2 = site_data["en_block_movement_v2"]
                mnr_team = site_data["mnr_team"]
                payment_due_date = site_data["payment_due_date"]
            elif account_user.role.name == "Depot User":
                role = "Depot User"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                site = site_data["name"]
                site_type = site_data["type"]
                mnr_module = site_data["mnr_module"]
                automatic_mnr_status_change = site_data["automatic_mnr_status_change"]
                transportation_module = site_data["transportation_module"]
                loaded_yard_module = site_data["loaded_yard_module"]
                new_billing_module = site_data["new_billing_module"]
                procurement_module = site_data["procurement_module"]
                lolo_finance = site_data["lolo_finance"]
                procurement_admin = site_data["procurement_admin"]
                mnr_ftp_upload = site_data["mnr_ftp_upload"]
                truck_tracking = site_data["truck_tracking"]
                en_block_movement = site_data["en_block_movement"]
                en_block_movement_v2 = site_data["en_block_movement_v2"]
                mnr_team = site_data["mnr_team"]
                payment_due_date = site_data["payment_due_date"]
                site = account_user.site.name
            elif account_user.role.name == "Wistim Distim":
                role = "Wistim Distim"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                site = site_data["name"]
                site_type = site_data["type"]
                mnr_module = site_data["mnr_module"]
                automatic_mnr_status_change = site_data["automatic_mnr_status_change"]
                transportation_module = site_data["transportation_module"]
                loaded_yard_module = site_data["loaded_yard_module"]
                new_billing_module = site_data["new_billing_module"]
                procurement_module = site_data["procurement_module"]
                lolo_finance = site_data["lolo_finance"]
                procurement_admin = site_data["procurement_admin"]
                mnr_ftp_upload = site_data["mnr_ftp_upload"]
                truck_tracking = site_data["truck_tracking"]
                en_block_movement = site_data["en_block_movement"]
                en_block_movement_v2 = site_data["en_block_movement_v2"]
                mnr_team = site_data["mnr_team"]
                payment_due_date = site_data["payment_due_date"]
            elif account_user.role.name == "Analytics":
                role = "Analytics"
                location = ""
                site = ""
                site_type = ""
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""

                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "Automation":
                role = "Automation"
                location = ""
                site = ""
                site_type = ""
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "Loaded Yard":
                role = "Loaded Yard"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                if site_data is None:
                    site = ""
                    site_type = ""
                else:
                    site = site_data["name"]
                    site_type = site_data["type"]
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = site_data["loaded_yard_module"]
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "Surveyor":
                role = "Surveyor"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                if site_data is None:
                    site = ""
                    site_type = ""
                else:
                    site = site_data["name"]
                    site_type = site_data["type"]
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "Repair":
                role = "Repair"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                if site_data is None:
                    site = ""
                    site_type = ""
                else:
                    site = site_data["name"]
                    site_type = site_data["type"]
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            elif account_user.role.name == "MNR Team":
                role = "MNR Team"
                location = account_user.location.name
                site_data = account_user.site.get_site_detail()
                if site_data is None:
                    site = ""
                    site_type = ""
                else:
                    site = site_data["name"]
                    site_type = site_data["type"]
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            else:
                role = "no role"
                location = ""
                site = ""
                site_type = ""
                mnr_module = ""
                automatic_mnr_status_change = ""
                transportation_module = ""
                loaded_yard_module = ""
                new_billing_module = ""
                procurement_module = ""
                lolo_finance = ""
                procurement_admin = ""
                mnr_ftp_upload = ""
                truck_tracking = ""
                en_block_movement = ""
                en_block_movement_v2 = ""
                mnr_team = ""
                payment_due_date = ""
            data["username"] = account_user.username
            data["role"] = role
            data["location"] = location
            data["site"] = site
            data["site_type"] = site_type
            data["mnr_module"] = mnr_module
            data["automatic_mnr_status_change"] = automatic_mnr_status_change
            data["transportation_module"] = transportation_module
            data["loaded_yard_module"] = loaded_yard_module
            data["new_billing_module"] = new_billing_module
            data["procurement_module"] = procurement_module
            data["lolo_finance"] = lolo_finance
            data["procurement_admin"] = procurement_admin
            data["mnr_ftp_upload"] = mnr_ftp_upload
            data["truck_tracking"] = truck_tracking
            data["en_block_movement"] = en_block_movement
            data["en_block_movement_v2"] = en_block_movement_v2
            data["mnr_team"] = mnr_team
            data["payment_due_date"] = payment_due_date
        except:
            error_log = logging.getLogger("error_log")
            error_log.error(traceback.format_exc())
            data["role"] = "no role"
        return data
