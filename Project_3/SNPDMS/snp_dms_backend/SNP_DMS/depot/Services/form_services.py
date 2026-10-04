from django.db.models import Q, F
from rest_framework import status
from rest_framework.response import Response
from account.models import AccountUser, Role
from master.models import (
    CarrierCode,
    ContainerType,
    ContainerSize,
    Location,
    Transporter,
    Site,
    RefCodeMaster,
    Country,
    VesselBkgNo,
)
from master.models_two import (
    Client,
    ClientAbbreviation,
    HandlingCharge,
    TransportationCharge,
    GroundRent,
)
from mnr.models import MnrStaff
from billing_invoice.models import CustomerBill
from depot.lolo_finance_models import PreGateIn, PreGateOut
from depot.models import Container, ContainerStock, ExportCargoType
from depot.functions_two import check_char_digit, check_digit
from common.exceptions import ValidationError
from common.error_logging import ErrorLogging


class DependencyService:
    """Service class to handle container validation and dependency data retrieval for form population."""

    @staticmethod
    def validate_container_number(container_no, location_name):
        """Validate container number and check its existence."""
        if not container_no:
            return {"errorMsg": "Please Enter Container_no"}, status.HTTP_200_OK

        if len(container_no) != 11 or not check_char_digit(container_no):
            return {
                "errorMsg": "Invalid Entry, Please Enter Container_no having first 4 uppercase alphabets and rest 7 digits"
            }, status.HTTP_200_OK

        is_valid = check_digit(container_no)
        container_exists = Container.objects.filter(
            container_no=container_no, status="IN", location__name=location_name
        ).exists()

        if is_valid and container_exists:
            return {
                "errorMsg": "Container_no Valid but already exist."
            }, status.HTTP_200_OK
        elif is_valid:
            return {"successMsg": "Container_no Valid"}, status.HTTP_200_OK
        elif container_exists:
            return {
                "errorMsg": "Container_no Not Valid but already exist."
            }, status.HTTP_200_OK
        else:
            return {"errorMsg": "Container_no Not Valid"}, status.HTTP_200_OK

    @staticmethod
    def get_client_dependency_data(user, location_name, site_name):
        """Retrieve client-dependent data for form population."""
        try:
            main_data = {}
            app_user = AccountUser.objects.get(username=user.username)
            location = (
                Location.objects.get(name=location_name)
                if location_name
                else app_user.location
            )
            site = Site.objects.get(name=site_name) if site_name else app_user.site

            client_data = []
            for client in Client.objects.filter(location=location, site=site):
                client_data_object = {
                    "name": client.get_client_name(),
                    "ref_code": client.get_client().get("ref_code", ""),
                }
                try:
                    abbreviation = ClientAbbreviation.objects.filter(
                        client=client
                    ).first()
                    client_data_object["shipping_line"] = (
                        [{"name": abbreviation.get_abbreviation_name()}]
                        if abbreviation
                        else []
                    )
                except:
                    client_data_object["shipping_line"] = []
                client_data.append(client_data_object)
            client_data.append({"name": "", "ref_code": "", "shipping_line": []})
            main_data["client_data"] = client_data

            return Response(main_data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [{str(e)}]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def get_form_dependency_data(user, location_name, site_name, get_list=None):
        """Retrieve all form-dependent data, optionally filtered by get_list."""
        try:
            main_data = {}
            app_user = AccountUser.objects.get(username=user.username)
            location = (
                Location.objects.get(name=location_name)
                if location_name
                else app_user.location
            )
            site = Site.objects.get(name=site_name) if site_name else app_user.site

            if not get_list:
                return Response(
                    DependencyService._get_full_dependency_data(user, location, site),
                    status=status.HTTP_200_OK,
                )

            if "depot_user_data" in get_list:
                main_data["depot_user_data"] = list(
                    AccountUser.objects.filter(
                        role__name="Depot User", location=location, site=site
                    ).values_list("username", flat=True)
                )

            if "client_data" in get_list or "line_client_data" in get_list:
                client_query = Client.objects.filter(location=location, site=site)
                client_data = []
                line_client_data = []
                for client in client_query:
                    data = {
                        "name": client.name,
                        "ref_code": client.ref_code or "",
                        "shipping_line": [
                            (
                                {
                                    "name": ClientAbbreviation.objects.filter(
                                        client=client
                                    )
                                    .first()
                                    .name
                                }
                                if ClientAbbreviation.objects.filter(
                                    client=client
                                ).exists()
                                else []
                            )
                        ],
                    }
                    if client.type == "Line":
                        line_client_data.append(data)
                    client_data.append(data)
                client_data.append({"name": "", "ref_code": "", "shipping_line": []})
                line_client_data.append(
                    {"name": "", "ref_code": "", "shipping_line": []}
                )
                main_data["client_data"] = client_data
                main_data["line_client_data"] = line_client_data

            if "party_client_data" in get_list:
                main_data["party_client_data"] = list(
                    Client.objects.filter(
                        type="Party", location=location, site=site
                    ).values("name")
                )

            if "size_data" in get_list:
                main_data["size_data"] = list(
                    ContainerSize.objects.all().values("name")
                )

            if "country_data" in get_list:
                main_data["country_data"] = list(Country.objects.all().values("name"))

            if "type_data" in get_list:
                main_data["type_data"] = list(
                    ContainerType.objects.all().values("name")
                )

            if "indian_states" in get_list:
                main_data["indian_states"] = [
                    "Andhra Pradesh",
                    "Arunachal Pradesh",
                    "Assam",
                    "Bihar",
                    "Chhattisgarh",
                    "Goa",
                    "Gujarat",
                    "Haryana",
                    "Himachal Pradesh",
                    "Jammu and Kashmir",
                    "Jharkhand",
                    "Karnataka",
                    "Kerala",
                    "Madhya Pradesh",
                    "Maharashtra",
                    "Manipur",
                    "Meghalaya",
                    "Mizoram",
                    "Nagaland",
                    "Odisha",
                    "Punjab",
                    "Rajasthan",
                    "Sikkim",
                    "Tamil Nadu",
                    "Telangana",
                    "Tripura",
                    "Uttar Pradesh",
                    "Uttarakhand",
                    "West Bengal",
                    "Andaman and Nicobar Islands",
                    "Chandigarh",
                    "Dadra and Nagar Haveli",
                    "Daman and Diu",
                    "Lakshadweep",
                    "Delhi",
                    "Puducherry",
                ]
                main_data["state_code"] = {
                    "Andhra Pradesh": "37",
                    "Arunachal Pradesh": "12",
                    "Assam": "18",
                    "Bihar": "10",
                    "Chattisgarh": "22",
                    "Goa": "30",
                    "Gujarat": "24",
                    "Haryana": "06",
                    "Himachal Pradesh": "02",
                    "Jammu and Kashmir": "01",
                    "Jharkhand": "20",
                    "Karnataka": "29",
                    "Kerala": "32",
                    "Madhya Pradesh": "23",
                    "Maharashtra": "27",
                    "Manipur": "14",
                    "Meghalaya": "17",
                    "Mizoram": "15",
                    "Nagaland": "13",
                    "Odisha": "21",
                    "Punjab": "03",
                    "Rajasthan": "08",
                    "Sikkim": "11",
                    "Tamil Nadu": "33",
                    "Telangana": "36",
                    "Tripura": "16",
                    "Uttar Pradesh": "09",
                    "Uttarakhand": "05",
                    "West Bengal": "19",
                    "Andaman and Nicobar Islands": "35",
                    "Chandigarh": "04",
                    "Dadra and Nagar Haveli": "26",
                    "Daman and Diu": "26",
                    "Lakshadweep": "31",
                    "Delhi": "07",
                    "Puducherry": "97",
                }

            if "export_cargo_type_data" in get_list:
                main_data["export_cargo_type_data"] = list(
                    ExportCargoType.objects.all().values("name")
                )

            if "transporter" in get_list:
                main_data["transporter"] = list(
                    Transporter.objects.filter(location=location, site=site)
                    .exclude(name__in=["N/A", "NA", "-NA-", "- NA -"])
                    .values("name")
                )

            if "carrier_code" in get_list:
                main_data["carrier_code"] = list(
                    CarrierCode.objects.filter(location=location, site=site)
                    .annotate(name=F("code"))
                    .values("name")
                )

            if "damage_code_n_condition" in get_list:
                if site.name in ["Ahmedabad", "Sanand", "CHEKLA CONTAINER YARD"]:
                    main_data["damage_code_n_condition"] = [
                        "LD",
                        "MD",
                        "HD",
                        "DM",
                        "AR",
                    ]
                else:
                    main_data["damage_code_n_condition"] = [
                        "OK",
                        "CLEANING",
                        "LD",
                        "MD",
                        "HD",
                        "AV",
                        "DM",
                        "AR",
                    ]

            if "grade" in get_list:
                main_data["grade"] = ["A", "B+", "B", "C+", "C", "D"]

            if "arrived" in get_list:
                main_data["arrived"] = [
                    "Factory",
                    "Road/Rail",
                    "CFS/ICD",
                    "Port/Vessel",
                    "FS RETURN",
                ]

            if "origin" in get_list:
                main_data["origin"] = ["Factory", "Intercity", "CFS/ICD", "Port/Vessel"]

            if "lolo_type" in get_list:
                main_data["lolo_type"] = ["Lift ON / Lift OFF", "ON", "OFF"]

            if "payment_type" in get_list:
                main_data["payment_type"] = [
                    "None",
                    "Cash",
                    "Cheque",
                    "NEFT",
                    "RTGS",
                    "Outstanding",
                    "Credit",
                    # "Advance",
                ]

            if "gst_type" in get_list:
                main_data["gst_type"] = [
                    {"gst_percent": "0%", "gst_value": 0},
                    {"gst_percent": "5%", "gst_value": 0.05},
                    {"gst_percent": "12%", "gst_value": 0.12},
                    {"gst_percent": "18%", "gst_value": 0.18},
                    {"gst_percent": "28%", "gst_value": 0.28},
                    {"igst_percent": "0%", "igst_value": 0},
                    {"igst_percent": "5%", "igst_value": 0.05},
                    {"igst_percent": "12%", "igst_value": 0.12},
                    {"igst_percent": "18%", "igst_value": 0.18},
                    {"igst_percent": "28%", "igst_value": 0.28},
                ]

            if "stock_stage" in get_list:
                main_data["stock_stage"] = [
                    "Survey Pending",
                    "Estimate Pending",
                    "Approval Pending",
                    "Approved",
                    "Under Repairing",
                    "Empty Alloted",
                    "Available",
                    "Without_Repair_Available",
                    "Alloted",
                    "",
                ]

            if "current_available_container_list" in get_list:
                main_data["current_available_container_list"] = list(
                    ContainerStock.objects.filter(
                        container__location=location,
                        container__site=site,
                        container__status="IN",
                        container_status="IN",
                        status__in=["Available", "Alloted", "Without_Repair_Available"],
                    ).values_list("container__container_no", flat=True)
                )

            if "current_pregate_out_available_container_list" in get_list:
                current_pregate_out_available_container_raw = (
                    ContainerStock.objects.filter(
                        container__location=location,
                        container__site=site,
                        container__status="IN",
                        container_status="IN",
                        status__in=["Available", "Alloted", "Without_Repair_Available"],
                    ).exclude(booking_no=None)
                )
                main_data["current_pregate_out_available_container_list"] = [
                    each.container.container_no
                    for each in current_pregate_out_available_container_raw
                    if not PreGateOut.objects.filter(stock=each).exists()
                ]

            if "location_site_user_list_and_roles" in get_list:
                account_user = AccountUser.objects.get(username=user.username)
                location_site_user_list = {
                    loc.name: list(
                        Site.objects.filter(location=loc).values_list("name", flat=True)
                    )
                    + ["ALL"]
                    for loc in Location.objects.all()
                }
                location_site_user_list["ALL"] = ["ALL"]
                roles = {
                    "Admin": list(Role.objects.all().values_list("name", flat=True)),
                    "Location Admin": ["Location Admin", "Site Admin", "Depot User"],
                    "Site Admin": ["Site Admin", "Depot User"],
                    "Depot User": ["Depot User"],
                }.get(account_user.role.name, [])
                main_data["location_site_user_list"] = location_site_user_list
                main_data["roles"] = roles

            if "location_site_dashboard_list" in get_list:
                location_site_dashboard_list = {
                    loc.name: list(
                        Site.objects.filter(location=loc).values_list("name", flat=True)
                    )
                    for loc in Location.objects.all()
                }
                location_site_dashboard_list[""] = [""]
                main_data["location_site_dashboard_list"] = location_site_dashboard_list

            if "location_site_id_name" in get_list:
                main_data["location_site_id_and_name"] = [
                    {
                        loc["name"]: {
                            "pk": loc["pk"],
                            "sites": [
                                {"pk": site["pk"], "name": site["name"]}
                                for site in Site.objects.filter(
                                    location_id=loc["pk"]
                                ).values("pk", "name")
                            ],
                        }
                    }
                    for loc in Location.objects.all().values("pk", "name")
                ]

            if "location_site_type_dashboard_list" in get_list:
                main_data["location_site_type_dashboard_list"] = {
                    loc.name: [
                        {
                            "site": site.name,
                            "type": site.type,
                            "automatic_mnr_status_change": site.automatic_mnr_status_change
                            or "",
                            "mnr_module": site.mnr_module or "",
                            "transportation_module": site.transportation_module or "",
                            "loaded_yard_module": site.loaded_yard_module or "",
                            "new_billing_module": site.new_billing_module or "",
                            "procurement_module": site.procurement_module or "",
                            "mnr_ftp_upload": site.mnr_ftp_upload or "",
                            "procurement_admin": site.procurement_admin or "",
                            "lolo_finance": site.lolo_finance,
                            "truck_tracking": site.truck_tracking,
                            "en_block_movement": site.en_block_movement,
                            "en_block_movement_v2": site.en_block_movement_v2,
                            "mnr_team": site.mnr_team,
                            "payment_due_date": site.payment_due_date or "",
                        }
                        for site in Site.objects.filter(location=loc)
                    ]
                    for loc in Location.objects.all()
                }
                main_data["location_site_type_dashboard_list"][""] = [""]

            if "location" in get_list:
                main_data["location"] = list(
                    Location.objects.all().values_list("name", flat=True)
                )

            if "client_ref_codes" in get_list:
                report_shipping_lines = [
                    "esl",
                    "rcl",
                    "msk",
                    "hapag",
                    "hmm",
                    "zim",
                    "cma",
                    "msc",
                    "qnl",
                    "sarjak",
                    "atl",
                    "cordelia",
                    "fabking",
                    "irisl",
                    "janzin",
                    "swen",
                    "blpl",
                    "expressway",
                    "goodrich",
                    "goodrich maritime",
                    "maxicon",
                    "perma",
                    "soc",
                    "hal",
                ] + [ref.ref_code.lower() for ref in RefCodeMaster.objects.all()]
                main_data["report_shipping_lines"] = list(
                    set(
                        [
                            client.ref_code.upper()
                            for client in Client.objects.filter(
                                location=location,
                                site=site,
                                ref_code__in=report_shipping_lines,
                            )
                        ]
                    )
                ) + ["All"]
                edi_shipping_lines = [
                    "cma",
                    "apl",
                    "anl",
                    "hmm",
                    "rcl",
                    "ts line",
                    "esl",
                    "qnl",
                    "msk",
                    "egl",
                    "zim",
                    "msc",
                    "hal",
                    "flk",
                ]
                main_data["edi_shipping_lines"] = list(
                    set(
                        [
                            client.ref_code.upper()
                            for client in Client.objects.filter(
                                location=location,
                                site=site,
                                edi_service=True,
                                ref_code__in=edi_shipping_lines,
                            )
                        ]
                    )
                )
                main_data["client_ref_codes"] = list(
                    set(
                        [
                            code.upper()
                            for code in report_shipping_lines + edi_shipping_lines
                        ]
                    )
                )

            if "edi_move_code_process_list" in get_list:
                main_data["edi_move_code_process_list"] = {
                    "cfs_in": ["DVAN", "MTIN", "DMG_MT", "REP_OUT_MT"],
                    "cfs_out": ["REP_RET_MT", "VAN"],
                    "factory_in": ["MTIN", "DMG_MT", "REP_OUT_MT"],
                    "factory_out": ["REP_RET_MT", "VAN"],
                    "vessel_in": ["MOR", "MIR", "DMG_MT", "REP_OUT_MT"],
                    "vessel_out": ["REP_RET_MT", "MOR"],
                    "road_in": ["MIR", "DMG_MT", "REP_OUT_MT"],
                    "road_out": ["REP_RET_MT", "MOR"],
                    "fs_return_in": ["RET"],
                    "fs_return_out": ["VAN"],
                }

            if "vessel_booking_no" in get_list:
                main_data["vessel_booking_no"] = list(
                    VesselBkgNo.objects.filter(
                        location=location, site=site
                    ).values_list("number", flat=True)
                )

            if "billing_client_customer" in get_list:
                customer_bill_query = CustomerBill.objects.filter(
                    location=location, site=site, is_payment_completed=False
                )
                main_data["client"] = sorted(
                    list(
                        customer_bill_query.values_list(
                            "client__name", flat=True
                        ).distinct()
                    ),
                    key=str.lower,
                )
                main_data["customer"] = sorted(
                    list(
                        customer_bill_query.values_list(
                            "customer__name", flat=True
                        ).distinct()
                    ),
                    key=str.lower,
                )

            if "lf_advance_payment_client_list" in get_list:
                main_data["lf_advance_payment_client_list"] = list(
                    Client.objects.filter(
                        type="Party", location=location, site=site
                    ).values_list("name", flat=True)
                )

            if "lf_pregatein_list" in get_list:
                main_data["lf_pregatein_list"] = list(
                    PreGateIn.objects.filter(
                        location=location,
                        site=site,
                        on_hold=False,
                        validity_expired=False,
                        is_gatein_done=False,
                        is_survey_done=False,
                    ).values_list("container_no", flat=True)
                )

            if "lf_pregateout_list" in get_list:
                main_data["lf_pregateout_list"] = list(
                    PreGateOut.objects.filter(
                        location=location,
                        site=site,
                        on_hold=False,
                        validity_expired=False,
                        is_gateout_done=False,
                    ).values_list("stock__container__container_no", flat=True)
                )

            if "adhoc_report_type" in get_list:
                main_data["adhoc_report_type"] = [
                    "MNR Repo Movement Report",
                    "MNR Material Usage Report",
                    "Volume Tues Report",
                    "Provisional Bill Report",
                ]

            if "mnr_staff_attendance" in get_list:
                main_data["mnr_staff_role"] = ["Surveyor", "EDP", "Worker"]
                main_data["mnr_staff_attendance_status"] = [
                    "Present",
                    "Absent",
                    "Leave",
                    "Half Day",
                ]
                main_data["mnr_staff"] = list(
                    MnrStaff.objects.select_related("location", "site")
                    .filter(location=location, site=site)
                    .values("pk", "firstName", "lastName", "role")
                )

            if "user_support" in get_list:
                main_data["ticket_type_list"] = [
                    "Bug Report",
                    "Feature Request",
                    "Demo Request",
                ]

                main_data["ticket_status_list"] = [
                    "Review Pending",
                    "Review Passed",
                    "Review Failed",
                    "Open",
                    "In Progress",
                    "Closed",
                ]

                main_data["ticket_modules_list"] = [
                    "Account",
                    "Analytics",
                    "Adhoc Reports",
                    "Automation Support",
                    "Dashboard",
                    "Masters",
                    "Depot IN",
                    "Depot OUT",
                    "NonDepot IN",
                    "NonDepot OUT",
                    "Stock",
                    "Allotment",
                    "MNR",
                    "EDI",
                    "Reports",
                    "Billing Invoice",
                    "Procurement",
                    "Lolo Finance",
                    "Enbloc Movement",
                    "Truck Tracking",
                    "Notification",
                    "Other",
                ]
            if "edi_enabled_sites" in get_list:
                main_data["edi_enabled_sites"] = [
                    name.upper()
                    for name in list(
                        set(
                            (
                                Client.objects.filter(edi_service=True).values_list(
                                    "site__name", flat=True
                                )
                            )
                        )
                    )
                ]

            if "site_lolo_rates" in get_list:
                main_data["site_lolo_rates"] = {
                    "size_20": float(site.size_20_rate),
                    "size_40": float(site.size_40_rate),
                    "size_20_night_charge": float(site.night_charge_size_20_rate),
                    "size_40_night_charge": float(site.night_charge_size_40_rate),
                }
            return Response(main_data, status=status.HTTP_200_OK)
        except Exception as e:
            ErrorLogging().log_error()
            return Response(
                {"errorMsg": f"Data Not Found [{str(e)}]"}, status=status.HTTP_200_OK
            )

    @staticmethod
    def _get_full_dependency_data(user, location, site):
        """Retrieve all dependency data when no specific get_list is provided."""
        main_data = {}
        main_data["depot_user_data"] = list(
            AccountUser.objects.filter(
                role__name="Depot User", location=location, site=site
            ).values_list("username", flat=True)
        )

        client_query = Client.objects.filter(location=location, site=site)
        client_data = []
        line_client_data = []
        for client in client_query:
            data = {
                "name": client.name,
                "ref_code": client.ref_code or "",
                "shipping_line": [
                    (
                        {
                            "name": ClientAbbreviation.objects.filter(client=client)
                            .first()
                            .name
                        }
                        if ClientAbbreviation.objects.filter(client=client).exists()
                        else []
                    )
                ],
            }
            if client.type == "Line":
                line_client_data.append(data)
            client_data.append(data)
        client_data.append({"name": "", "ref_code": "", "shipping_line": []})
        line_client_data.append({"name": "", "ref_code": "", "shipping_line": []})
        main_data["client_data"] = client_data
        main_data["line_client_data"] = line_client_data
        main_data["party_client_data"] = list(
            client_query.filter(type="Party").values("name")
        )
        main_data["size_data"] = list(ContainerSize.objects.all().values("name"))
        main_data["type_data"] = list(ContainerType.objects.all().values("name"))
        main_data["country_data"] = list(Country.objects.all().values("name"))
        main_data["indian_states"] = [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jammu and Kashmir",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Andaman and Nicobar Islands",
            "Chandigarh",
            "Dadra and Nagar Haveli",
            "Daman and Diu",
            "Lakshadweep",
            "Delhi",
            "Puducherry",
        ]
        main_data["state_code"] = {
            "Andhra Pradesh": "37",
            "Arunachal Pradesh": "12",
            "Assam": "18",
            "Bihar": "10",
            "Chattisgarh": "22",
            "Goa": "30",
            "Gujarat": "24",
            "Haryana": "06",
            "Himachal Pradesh": "02",
            "Jammu and Kashmir": "01",
            "Jharkhand": "20",
            "Karnataka": "29",
            "Kerala": "32",
            "Madhya Pradesh": "23",
            "Maharashtra": "27",
            "Manipur": "14",
            "Meghalaya": "17",
            "Mizoram": "15",
            "Nagaland": "13",
            "Odisha": "21",
            "Punjab": "03",
            "Rajasthan": "08",
            "Sikkim": "11",
            "Tamil Nadu": "33",
            "Telangana": "36",
            "Tripura": "16",
            "Uttar Pradesh": "09",
            "Uttarakhand": "05",
            "West Bengal": "19",
            "Andaman and Nicobar Islands": "35",
            "Chandigarh": "04",
            "Dadra and Nagar Haveli": "26",
            "Daman and Diu": "26",
            "Lakshadweep": "31",
            "Delhi": "07",
            "Puducherry": "97",
        }
        main_data["export_cargo_type_data"] = list(
            ExportCargoType.objects.all().values("name")
        )
        main_data["transporter"] = list(
            Transporter.objects.filter(location=location, site=site)
            .exclude(name__in=["N/A", "NA", "-NA-", "- NA -"])
            .values("name")
        )
        main_data["carrier_code"] = list(
            CarrierCode.objects.filter(location=location, site=site)
            .annotate(name=F("code"))
            .values("name")
        )

        if site.name in ["Ahmedabad", "Sanand", "CHEKLA CONTAINER YARD"]:
            main_data["damage_code_n_condition"] = [
                "LD",
                "MD",
                "HD",
                "DM",
                "AR",
            ]
        else:
            main_data["damage_code_n_condition"] = [
                "OK",
                "CLEANING",
                "LD",
                "MD",
                "HD",
                "AV",
                "DM",
                "AR",
            ]

        main_data["grade"] = ["A", "B+", "B", "C+", "C", "D"]
        main_data["arrived"] = [
            "Factory",
            "Road/Rail",
            "CFS/ICD",
            "Port/Vessel",
            "FS RETURN",
        ]
        main_data["origin"] = ["Factory", "Intercity", "CFS/ICD", "Port/Vessel"]
        main_data["lolo_type"] = ["Lift ON / Lift OFF", "ON", "OFF"]
        main_data["payment_type"] = [
            "None",
            "Cash",
            "Cheque",
            "NEFT",
            "RTGS",
            "Outstanding",
            "Credit",
            # "Advance",
        ]
        main_data["gst_type"] = [
            {"gst_percent": "0%", "gst_value": 0},
            {"gst_percent": "5%", "gst_value": 0.05},
            {"gst_percent": "12%", "gst_value": 0.12},
            {"gst_percent": "18%", "gst_value": 0.18},
            {"gst_percent": "28%", "gst_value": 0.28},
            {"igst_percent": "0%", "igst_value": 0},
            {"igst_percent": "5%", "igst_value": 0.05},
            {"igst_percent": "12%", "igst_value": 0.12},
            {"igst_percent": "18%", "igst_value": 0.18},
            {"igst_percent": "28%", "igst_value": 0.28},
        ]
        main_data["stock_stage"] = [
            "Survey Pending",
            "Estimate Pending",
            "Approval Pending",
            "Approved",
            "Under Repairing",
            "Empty Alloted",
            "Available",
            "Without_Repair_Available",
            "Alloted",
            "",
        ]
        main_data["current_available_container_list"] = list(
            ContainerStock.objects.filter(
                container__location=location,
                container__site=site,
                container__status="IN",
                container_status="IN",
                status__in=["Available", "Alloted", "Without_Repair_Available"],
            ).values_list("container__container_no", flat=True)
        )
        main_data["current_pregate_out_available_container_list"] = [
            each.container.container_no
            for each in ContainerStock.objects.filter(
                container__location=location,
                container__site=site,
                container__status="IN",
                container_status="IN",
                status__in=["Available", "Alloted", "Without_Repair_Available"],
            ).exclude(booking_no=None)
            if not PreGateOut.objects.filter(stock=each).exists()
        ]
        account_user = AccountUser.objects.get(username=user.username)
        location_site_user_list = {
            loc.name: list(
                Site.objects.filter(location=loc).values_list("name", flat=True)
            )
            + ["ALL"]
            for loc in Location.objects.all()
        }
        location_site_user_list["ALL"] = ["ALL"]
        roles = {
            "Admin": list(Role.objects.all().values_list("name", flat=True)),
            "Location Admin": ["Location Admin", "Site Admin", "Depot User"],
            "Site Admin": ["Site Admin", "Depot User"],
            "Depot User": ["Depot User"],
        }.get(account_user.role.name, [])
        main_data["location_site_user_list"] = location_site_user_list
        main_data["roles"] = roles
        main_data["location_site_dashboard_list"] = {
            loc.name: list(
                Site.objects.filter(location=loc).values_list("name", flat=True)
            )
            for loc in Location.objects.all()
        }
        main_data["location_site_dashboard_list"][""] = [""]
        main_data["location_site_id_and_name"] = [
            {
                loc["name"]: {
                    "pk": loc["pk"],
                    "sites": [
                        {"pk": site["pk"], "name": site["name"]}
                        for site in Site.objects.filter(location_id=loc["pk"]).values(
                            "pk", "name"
                        )
                    ],
                }
            }
            for loc in Location.objects.all().values("pk", "name")
        ]
        main_data["location_site_type_dashboard_list"] = {
            loc.name: [
                {
                    "site": site.name,
                    "type": site.type,
                    "automatic_mnr_status_change": site.automatic_mnr_status_change
                    or "",
                    "mnr_module": site.mnr_module or "",
                    "transportation_module": site.transportation_module or "",
                    "loaded_yard_module": site.loaded_yard_module or "",
                    "new_billing_module": site.new_billing_module or "",
                    "procurement_module": site.procurement_module or "",
                    "mnr_ftp_upload": site.mnr_ftp_upload or "",
                    "procurement_admin": site.procurement_admin or "",
                    "lolo_finance": site.lolo_finance,
                    "truck_tracking": site.truck_tracking,
                    "en_block_movement": site.en_block_movement,
                    "en_block_movement_v2": site.en_block_movement_v2,
                    "mnr_team": site.mnr_team,
                    "payment_due_date": site.payment_due_date or "",
                }
                for site in Site.objects.filter(location=loc)
            ]
            for loc in Location.objects.all()
        }
        main_data["location_site_type_dashboard_list"][""] = [""]
        main_data["location"] = list(
            Location.objects.all().values_list("name", flat=True)
        )
        report_shipping_lines = [
            "esl",
            "rcl",
            "msk",
            "hapag",
            "hmm",
            "zim",
            "cma",
            "msc",
            "qnl",
            "sarjak",
            "atl",
            "cordelia",
            "fabking",
            "irisl",
            "janzin",
            "swen",
            "blpl",
            "expressway",
            "goodrich",
            "goodrich maritime",
            "maxicon",
            "perma",
            "soc",
            "hal",
        ] + [ref.ref_code.lower() for ref in RefCodeMaster.objects.all()]
        main_data["report_shipping_lines"] = list(
            set(
                [
                    client.ref_code.upper()
                    for client in Client.objects.filter(
                        location=location, site=site, ref_code__in=report_shipping_lines
                    )
                ]
            )
        ) + ["All"]
        edi_shipping_lines = [
            "cma",
            "apl",
            "anl",
            "hmm",
            "rcl",
            "ts line",
            "esl",
            "qnl",
            "msk",
            "egl",
            "zim",
            "msc",
            "hal",
            "flk",
        ]
        main_data["edi_shipping_lines"] = list(
            set(
                [
                    client.ref_code.upper()
                    for client in Client.objects.filter(
                        location=location,
                        site=site,
                        edi_service=True,
                        ref_code__in=edi_shipping_lines,
                    )
                ]
            )
        )
        main_data["client_ref_codes"] = list(
            set([code.upper() for code in report_shipping_lines + edi_shipping_lines])
        )
        main_data["edi_move_code_process_list"] = {
            "cfs_in": ["DVAN", "MTIN", "DMG_MT", "REP_OUT_MT"],
            "cfs_out": ["REP_RET_MT", "VAN"],
            "factory_in": ["MTIN", "DMG_MT", "REP_OUT_MT"],
            "factory_out": ["REP_RET_MT", "VAN"],
            "vessel_in": ["MOR", "MIR", "DMG_MT", "REP_OUT_MT"],
            "vessel_out": ["REP_RET_MT", "MOR"],
            "road_in": ["MIR", "DMG_MT", "REP_OUT_MT"],
            "road_out": ["REP_RET_MT", "MOR"],
            "fs_return_in": ["RET"],
            "fs_return_out": ["VAN"],
        }
        main_data["vessel_booking_no"] = list(
            VesselBkgNo.objects.filter(location=location, site=site).values_list(
                "number", flat=True
            )
        )
        main_data["adhoc_report_type"] = [
            "MNR Repo Movement Report",
            "MNR Material Usage Report",
            "Volume Tues Report",
            "Provisional Bill Report",
        ]
        main_data["mnr_staff_role"] = ["Surveyor", "EDP", "Worker"]
        main_data["mnr_staff_attendance_status"] = [
            "Present",
            "Absent",
            "Leave",
            "Half Day",
        ]
        main_data["mnr_staff"] = list(
            MnrStaff.objects.select_related("location", "site")
            .filter(location=location, site=site)
            .values("pk", "firstName", "lastName", "role")
        )

        main_data["ticket_type_list"] = [
            "Bug Report",
            "Feature Request",
            "Demo Request",
        ]

        main_data["ticket_status_list"] = [
            "Review Pending",
            "Review Passed",
            "Review Failed",
            "Open",
            "In Progress",
            "Closed",
        ]

        main_data["ticket_modules_list"] = [
            "Account",
            "Analytics",
            "Adhoc Reports",
            "Automation Support",
            "Dashboard",
            "Masters",
            "Depot IN",
            "Depot OUT",
            "NonDepot IN",
            "NonDepot OUT",
            "Stock",
            "Allotment",
            "MNR",
            "EDI",
            "Reports",
            "Billing Invoice",
            "Procurement",
            "Lolo Finance",
            "Enbloc Movement",
            "Truck Tracking",
            "Notification",
            "Other",
        ]

        main_data["edi_enabled_sites"] = [
            name.upper()
            for name in list(
                set(
                    (
                        Client.objects.filter(edi_service=True).values_list(
                            "site__name", flat=True
                        )
                    )
                )
            )
        ]

        main_data["site_lolo_rates"] = {
            "size_20": float(site.size_20_rate),
            "size_40": float(site.size_40_rate),
            "size_20_night_charge": float(site.night_charge_size_20_rate),
            "size_40_night_charge": float(site.night_charge_size_40_rate),
        }

        return main_data
