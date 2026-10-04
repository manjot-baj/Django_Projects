// ICONS

import BuildIcon from "@material-ui/icons/Build";
import ExitToAppOutlinedIcon from "@material-ui/icons/ExitToAppOutlined";
import CheckIcon from "@material-ui/icons/CheckBoxOutlineBlankOutlined";
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
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

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
  {
    title: "Automation",
    icon: <RoomPreferencesOutlinedIcon fontSize="small" />,
    items: [
      { title: "Allotment", to: "/automation/dashboard" },
      { title: "Operations", to: "/automation/operation" },
      { title: "Masters", to: "/automation/master" },
      { title: "Non Depot Container", to: "/automation/non-depot-container" },
      { title: "Container Info", to: "/automation/container-info" },
      { title: "Receipts", to: "/automation/receipts" },
    ],
  },
  {
    title: "Adhoc Report",
    icon: <DescriptionOutlinedIcon fontSize="small" />,
    to: "/adhoc-report",
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
      { title: "Country", to: "/master/country" },
      { title: "Location", to: "/master/location" },
      { title: "Site", to: "/master/site" },
      { title: "Seal Management", to: "/master/sealManagement" },
      { title: "Manager Management", to: "/master/manager-management" },
      {
        title: "Account Master",
        sub: true,
        items: [
          {
            title: "Role",
            to: "/account/role",
          },
          {
            title: "User",
            to: "/account/user",
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
          },
          { title: "Document", to: "/master/clientDocument" },
          {
            title: "Ref Code",
            to: "/master/refcode",
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
          },
          {
            title: "Export Cargo Type",
            to: "/master/exportCargoType",
          },
          {
            title: "Carrier Code",
            to: "/master/carrier-code",
          },
        ],
      },
      {
        title: "Container Master",
        sub: true,
        items: [
          { title: "Size", to: "/master/containerSize" },
          { title: "Type", to: "/master/containerType" },
          {
            title: "ISO Code",
            to: "/master/containerTypeSizeCode",
          },
          {
            title: "Handling Charges",
            to: "/master/containerHandlingCharges",
          },
          {
            title: "Transportation Charges",
            to: "/master/containerTransportationCharges",
          },
          {
            title: "Ground Rent Charges",
            to: "/master/containerGroundRentCharges",
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
          },
          {
            title: "Vessel Voyage",
            to: "/master/vesselVoyageDetail",
          },
          {
            title: "Location Code",
            to: "/master/locationCodeDetail",
          },
        ],
      },
      {
        title: "MNR Master",
        sub: true,
        items: [
          {
            title: "Tariff",
            to: "/master/tariffDocument",
          },
          {
            title: "Staff",
            to: "/master/staffMaster",
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
      "enBlock",
      "enBlock-Pre-Gate-IN",
      "manufacturing-logs",
      "lolo-payment-gate-in-out",
    ],
    items: [
      { title: "Operations", to: "/depot" },
      { title: "Re-Generate EDI", to: "/regenerate-edi" },
      { title: "Reports", to: "/mnr/reports" },
      { title: "MNR ", to: "/mnr" },
      {
        title: "Manufacturing Logs",
        to: "/manufacturing-logs",
      },
      { title: "LoLo payment IN OUT", to: "/lolo-payment-gate-in-out" },
      { title: "EDI Analysis", to: "/edi-analysis" },

      { title: "Wistim And Destim Analysis", to: "/wistim-analysis" },
      {
        title: "Wistim Destim Repository",
        to: "/wistim-destim-s3",
      },
      { title: "Truck Tracking", to: "/depot/truck-turn-around" },

      { title: "EN Block Movement", to: "/enBlock" },
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
    items: [{ title: "Operations", to: "/loaded-yard" }],
  },
  {
    title: "CFS/ICD",
    // to: "/mnr",
    icon: <BuildIcon fontSize="small" />,
    headline: ["mnr"],
    items: [
      { title: "MNR ", to: "/mnr" },
      { title: "Reports", to: "/mnr/reports" },
    ],
  },
  {
    title: "Billing",
    icon: <ReceiptOutlinedIcon fontSize="small" />,
    items: [
      { title: "Transactions", to: "/billing/new-billing" },
      { title: "History", to: "/billing/invoice-billing" },
      { title: "MNR History", to: "/billing/mnr-history" },
      { title: "Credit Note History", to: "/billing/credit-notes-history" },
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
      { title: "ToolRoom", to: "/procurement/tools", info: "Procurement" },
      { title: "Requistion", to: "/procurement/requesition" },
      { title: "Consumption", to: "/procurement/consumption" },

      { title: "Tool Transfer", to: "/procurement/tool-transfer" },
      {
        title: "Tool Rate history",
        to: "/procurement/tool-rate-history",
      },
      { title: "Master Stock", to: "/procurement/master-stock" },
      { title: "Reports", to: "/procurement/reports" },
    ],
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

  {
    title: "Logout",
    to: "/login",
    icon: <ExitToAppOutlinedIcon fontSize="small" />,
    submenu: [],
  },
];

export const drawerMenuItemsServey = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <DashboardOutlinedIcon fontSize="small" />,
    items: [],
  },

  {
    title: "Servey",
    to: "/serveyor",
    icon: <CheckIcon fontSize="small" />,
  },

  {
    title: "Logout",
    to: "/login",
    icon: <ExitToAppOutlinedIcon fontSize="small" />,
    submenu: [],
  },
];
