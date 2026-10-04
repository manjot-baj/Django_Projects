// ICONS

import BuildIcon from "@mui/icons-material/Build";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import React from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import RoomPreferencesOutlinedIcon from "@mui/icons-material/RoomPreferencesOutlined";
import DisplaySettingsOutlinedIcon from "@mui/icons-material/DisplaySettingsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import GarageOutlinedIcon from "@mui/icons-material/GarageOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import NextWeekOutlinedIcon from "@mui/icons-material/NextWeekOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import { Image } from "semantic-ui-react";
import AIIMAGE from "@/assets/images/generative.png";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

export const drawerMenuItems = (user) => [
  {
    title: "Analytics",
    icon: <InsertChartOutlinedIcon fontSize="small" />,
    items: [
      { title: "Analytics Dashboard", to: "/analytics/dashboard" },
      { title: "Movement", to: "/analytics/handling" },
      { title: "Repo Movement", to: "/analytics/repo" },
      { title: "Self Transportation", to: "/analytics/st" },
      { title: "Stock", to: "/analytics/stock-data" },
      { title: "MNR", to: "/analytics/mnr" },
      { title: "Reports", to: "/analytics/reports" },
      { title: "MNR Material", to: "/analytics/mnr-material" },
    ],
  },
  // {
  //   title: "AI Analytics",
  //   icon: (
  //     <Image
  //       src={AIIMAGE}
  //       style={{
  //         height: 20,
  //         width: 20,
  //         cursor: "pointer",
  //       }}
  //     />
  //   ),
  //   to: "/ai-analysis",
  //   enableSinglePageLink: "ai-analysis",
  //   enableNestedSinglePageLink: "ai-analysis",
  // },
  {
    title: "Adhoc Report",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    to: "/adhoc-report",
  },
  {
    title: "Automation",
    icon: <RoomPreferencesOutlinedIcon fontSize="small" />,
    items: [
      { title: "Allotment", to: "/automation/dashboard" },
      { title: "Client GST Operation", to: "/automation/client-operation" },
      {
        title: "Dependency Transfer",
        to: "/automation/client-dependency-transfer",
      },
      {
        title: "Procurement Stock",
        to: "/automation/procurement-stock-delete",
      },
      { title: "Operations", to: "/automation/operation" },
      { title: "Masters", to: "/automation/master" },
      { title: "Non Depot Container", to: "/automation/non-depot-container" },
      { title: "Container Info", to: "/automation/container-info" },
      { title: "Receipts", to: "/automation/receipts" },
    ],
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <DashboardOutlinedIcon fontSize="small" />,
    items: [],
  },
  {
    title: "Masters",
    icon: <DisplaySettingsOutlinedIcon fontSize="small" />,
    headline: ["master", "account"],
    items: [
      {
        title: "Country",
        to: "/master/country",
        enableNestedSinglePageLink: "country",
      },
      {
        title: "Location",
        to: "/master/location",
        enableNestedSinglePageLink: "location",
      },
      { title: "Site", to: "/master/site", enableNestedSinglePageLink: "site" },
      {
        title: "Seal Management",
        to: "/master/sealManagement",
        enableNestedSinglePageLink: "sealManagement",
      },
      {
        title: "Manager Management",
        to: "/master/manager-management",
        enableNestedSinglePageLink: "manager-management",
      },
      {
        title: "Account Master",
        sub: true,

        items: [
          {
            title: "Role",
            to: "/account/role",
            enableNestedSinglePageLink: "role",
          },
          {
            title: "Role Add",
            to: "/account/role/form",
            disableOnDrawer: true,
          },
          {
            title: "User",
            to: "/account/user",
            enableNestedSinglePageLink: "user",
          },
          {
            title: "User  Add",
            to: "/account/user/form",
            disableOnDrawer: true,
          },
        ],
      },
      {
        title: "Client Master",
        sub: true,
        items: [
          {
            title: "Client",
            to: "/master/client",
            enableNestedSinglePageLink: "client",
          },
          {
            title: "Client  Add",
            to: "/master/client/form",
            disableOnDrawer: true,
          },
          {
            title: "Document",
            to: "/master/clientDocument",
            enableNestedSinglePageLink: "clientDocument",
          },
          {
            title: "Client Document Add",
            to: "/master/clientDocument/form",
            disableOnDrawer: true,
          },
          {
            title: "Ref Code",
            to: "/master/refcode",
            enableNestedSinglePageLink: "refcode",
          },
          {
            title: "Ref Code Add",
            to: "/master/refcode/form",
            disableOnDrawer: true,
          },
        ],
      },
      {
        title: "Transporter Master",
        sub: true,
        items: [
          {
            title: "Transporter",
            to: "/master/transporter",
            enableNestedSinglePageLink: "transporter",
          },
          {
            title: "Transporter  Add",
            to: "/master/transporter/form",
            disableOnDrawer: true,
          },
          {
            title: "Export Cargo Type",
            to: "/master/exportCargoType",
            enableNestedSinglePageLink: "exportCargoType",
          },
          {
            title: "Export Cargo Type  Add",
            to: "/master/exportCargoType/form",
            disableOnDrawer: true,
          },
          {
            title: "Carrier Code",
            to: "/master/carrier-code",
            enableNestedSinglePageLink: "carrier-code",
          },
          {
            title: "Carrier Code  Add",
            to: "/master/carrier-code/form",
            disableOnDrawer: true,
          },
        ],
      },
      {
        title: "Handling Charges",
        sub: true,
        items: [
          {
            title: "Line Handling Charges",
            to: "/master/line-handling-charges",
            enableNestedSinglePageLink: "line-handling-charges",
          },
          {
            title: "Handling Charges History",
            to: "/master/handling-charges-history",
            enableNestedSinglePageLink: "handling-charges-history",
          },
        ],
      },
      {
        title: "Container Master",
        sub: true,
        items: [
          {
            title: "Size",
            to: "/master/containerSize",
            enableNestedSinglePageLink: "containerSize",
          },
          {
            title: "Size   Add",
            to: "/master/containerSize/form",
            disableOnDrawer: true,
          },
          {
            title: "Type",
            to: "/master/containerType",
            enableNestedSinglePageLink: "containerType",
          },
          {
            title: "Type   Add",
            to: "/master/containerType/form",
            disableOnDrawer: true,
          },
          {
            title: "ISO Code",
            to: "/master/containerTypeSizeCode",
            enableNestedSinglePageLink: "containerTypeSizeCode",
          },
          {
            title: "ISO Code   Add",
            to: "/master/containerTypeSizeCode/form",
            disableOnDrawer: true,
          },
          {
            title: "Handling Charges",
            to: "/master/containerHandlingCharges",
            enableNestedSinglePageLink: "containerHandlingCharges",
          },
          {
            title: "Handling Charges   Add",
            to: "/master/containerHandlingCharges/form",
            disableOnDrawer: true,
          },

          {
            title: "Transportation Charges",
            to: "/master/containerTransportationCharges",
            enableNestedSinglePageLink: "containerTransportationCharges",
          },
          {
            title: "Transportation Charges   Add",
            to: "/master/containerTransportationCharges/form",
            disableOnDrawer: true,
          },
          {
            title: "Ground Rent Charges",
            to: "/master/containerGroundRentCharges",
            enableNestedSinglePageLink: "containerGroundRentCharges",
          },
          {
            title: "Ground Rent Charges   Add",
            to: "/master/containerGroundRentCharges/form",
            disableOnDrawer: true,
          },
        ],
      },
      {
        title: "Vessel Master",
        sub: true,
        items: [
          {
            title: "Vessel Booking",
            to: "/master/vesselBkgNo",
            enableNestedSinglePageLink: "vesselBkgNo",
          },
          {
            title: "Vessel Booking   Add",
            to: "/master/vesselBkgNo/form",
            disableOnDrawer: true,
          },
          {
            title: "Vessel Voyage",
            to: "/master/vesselVoyageDetail",
            enableNestedSinglePageLink: "vesselVoyageDetail",
          },
          {
            title: "Vessel Voyage   Add",
            to: "/master/vesselVoyageDetail/form",
            disableOnDrawer: true,
          },
          {
            title: "Location Code",
            to: "/master/locationCodeDetail",
            enableNestedSinglePageLink: "locationCodeDetail",
          },
          {
            title: "Location   Add",
            to: "/master/locationCodeDetail/form",
            disableOnDrawer: true,
          },
        ],
      },
      {
        title: "MNR Master",
        sub: true,
        items: [
          {
            title: "Staff Attendance",
            to: "/master/mnr-staff-attendance",
            enableNestedSinglePageLink: "mnr-staff-attendance",
          },
          {
            title: "Tariff",
            to: "/master/tariffDocument",
            enableNestedSinglePageLink: "tariffDocument",
          },
          {
            title: "Tariff  Add",
            to: "/master/tariffDocument/form",
            disableOnDrawer: true,
          },
          {
            title: "Staff",
            to: "/master/staffMaster",
            enableNestedSinglePageLink: "staffMaster",
          },
          {
            title: "Staff  Add",
            to: "/master/staffMaster/form",
            disableOnDrawer: true,
          },
        ],
      },
    ],
  },
  {
    title: "Empty Yard",
    icon: <LocalShippingOutlinedIcon fontSize="small" />,
    headline: [
      "depot",
      "regenerate-edi",
      "mnr",
      "edi-analysis",
      "wistim-analysis",
      "wistim-destim-s3",
      "enBlock-Pre-Gate-IN",
      "manufacturing-logs",
      "lolo-payment-gate-in-out",
      "empty-yard",
    ],
    items: [
      {
        title: "Operations",
        to: "/depot",
        enableNestedSinglePageLink: "depot",
      },
      { title: "Re-Generate EDI", to: "/regenerate-edi" },
      { title: "Reports", to: "/mnr/reports" },
      {
        title: "Handling & ST Payment",
        to: "/lolo-payment-gate-in-out",
      },
      { title: "MNR ", to: "/mnr", enableNestedSinglePageLink: "mnr" },
      { title: "EDI Analysis", to: "/edi-analysis" },
      {
        title: "Manufacturing Logs",
        to: "/manufacturing-logs",
      },
      { title: "Wistim And Destim Analysis", to: "/wistim-analysis" },
      {
        title: "Wistim Destim Repository",
        to: "/wistim-destim-s3",
      },
      {
        title: "Truck Tracking",
        to: "/depot/truck-turn-around",
        enableNestedSinglePageLink: "truck-turn-around",
      },

      {
        title: "EN Block Movement",
        to: "/empty-yard/enBlock",
        enableNestedSinglePageLink: "enBlock",
      },
      { title: "EN Block Pre Gate In", to: "/enBlock-Pre-Gate-IN" },
    ],
  },
  {
    title: "Lolo Payment",
    icon: <PaymentOutlinedIcon fontSize="small" />,
    headline: ["lolo-payment"],
    items: [
      {
        title: "Advance LOLO Payment",
        to: "/lolo-payment/advance-lolo-payment",
        enableNestedSinglePageLink: "advance-lolo-payment",
      },
      {
        title: "Customer Account",
        to: "/lolo-payment/customer-account",
        enableNestedSinglePageLink: "customer-account",
      },

      {
        title: "Pre Gate IN",
        to: "/lolo-payment/pre-gate-in",
      },
      {
        title: "Pre Gate OUT",
        to: "/lolo-payment/pre-gate-out",
      },
    ],
  },
  {
    title: "Loaded-Yard",
    icon: <WarehouseOutlinedIcon fontSize="small" />,
    items: [
      {
        title: "Operations",
        to: "/loaded-yard",
        enableNestedSinglePageLink: "loaded-yard",
      },
    ],
  },
  {
    title: "CFS/ICD",
    // to: "/mnr",
    icon: <BuildIcon fontSize="small" />,
    headline: ["mnr", "depot"],
    items: [
      { title: "MNR ", to: "/mnr", enableNestedSinglePageLink: "depot" },
      { title: "Reports", to: "/mnr/reports" },
    ],
  },
  {
    title: "Billing",
    icon: <ReceiptOutlinedIcon fontSize="small" />,
    items: [
      {
        title: "Transactions",
        to: "/billing/new-billing",
        enableNestedSinglePageLink: "new-billing",
      },
      { title: "History", to: "/billing/invoice-billing" },
      { title: "MNR History", to: "/billing/mnr-history" },
      {
        title: "Credit Note History",
        to: "/billing/credit-notes/history",
        enableNestedSinglePageLink: "credit-notes",
      },
    ],
  },
  {
    title: "Transportation",
    icon: <NextWeekOutlinedIcon fontSize="small" />,
    headline: ["transport", "voucher"],
    items: [
      {
        title: "Masters",
        sub: true,
        items: [
          { title: "Account Master", to: "/transport/account" },
          { title: "Customer Master", to: "/transport/customer" },
          { title: "Creditor Master", to: "/transport/creditor" },
          { title: "Driver Master", to: "/transport/driver" },
          { title: "Truck Master", to: "/transport/truck" },
          { title: "Service Tax Master", to: "/transport/service" },
        ],
      },
      { title: "Daily Booking", to: "/transport/booking" },
      { title: "Purchase LR", to: "/transport/purchase" },
      { title: "Invoice LR", to: "/transport/invoice-lr" },
      {
        title: "Transactions",
        sub: true,
        items: [
          { title: "Payment and Receipt", to: "/voucher/paymentreciept" },
          { title: "Contra Entry", to: "/voucher/contraentry" },
          { title: "Journal Vouchers", to: "/voucher/journalvoucher" },
        ],
      },
      { title: "Reports", to: "/transport/reports" },
    ],
  },
  {
    title: "Procurement",
    icon: <BuildCircleOutlinedIcon fontSize="small" />,
    items: [
      {
        title: "ToolRoom",
        to: "/procurement/tools",
        info: "Procurement",
        enableNestedSinglePageLink: "tools",
      },
      {
        title: "Requistion",
        to: "/procurement/requesition",
        enableNestedSinglePageLink: "requesition",
      },
      {
        title: "Consumption",
        to: "/procurement/consumption",
        enableNestedSinglePageLink: "consumption",
      },

      {
        title: "Tool Transfer",
        to: "/procurement/tool-transfer",
        enableNestedSinglePageLink: "tool-transfer",
      },
      {
        title: "Tool Rate history",
        to: "/procurement/tool-rate-history",
      },
      { title: "Master Stock", to: "/procurement/master-stock" },
      { title: "Reports", to: "/procurement/reports" },
    ],
  },
  {
    title: "User Support Ticket",
    icon: <SupportAgentIcon fontSize="small" />,
    to: "/user-support-ticket",
    enableSinglePageLink: "user-support-ticket",
    enableNestedSinglePageLink: "user-support-ticket",
  },
];

export const drawerMenuItemsLoaded = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <DashboardOutlinedIcon fontSize="small" />,
    items: [],
  },

  {
    title: "Loaded Yard",
    icon: <GarageOutlinedIcon fontSize="small" />,
    items: [
      { title: "Operations", to: "/loaded-yard" },
      {
        title: "EDI",
        to: "/loaded-yard-edi",
      },
    ],
  },
];

export const drawerMenuItemsServey = [
  {
    title: "Dashboard",
    to: "/dashboard",
    //   icon: <DashboardOutlinedIcon
    //   fontSize="small"
    //  />,
    items: [],
  },

  {
    title: "Servey",
    to: "/serveyor",
    // icon: <CheckIcon  fontSize="small"/>,
  },

  {
    title: "Logout",
    to: "/login",
    // icon: <ExitToAppOutlinedIcon  fontSize="small"/>,
    submenu: [],
  },
];
