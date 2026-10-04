import "./App.css";
import { Provider } from "react-redux";
import store from "./store";
import { createTheme, responsiveFontSizes, ThemeProvider } from "@mui/material";
import { Route, Switch, Redirect } from "react-router-dom";
import { lazy, Suspense } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Loader from "./components/dashboard/Loader";

import AdvanceFinanceBulkUpload from "./pages/MNR/AdvanceFinanceBulkUpload";
import Depot from "./pages/Depot";
import SealUploadForm from "./pages/SealUploadForm";
import MnrUploadWashingForm from "./pages/MnrUploadWashingForm";
import NotificationHistory from "./pages/NotificationHistory";
import MNRGridFilter from "./components/MNRGridFilter";
import Unauthorized from "./pages/Unauthorized";
import AccessDenied from "./pages/AccessDenied";

import ForgotPassword from "./pages/ForgotPassword";
import StocksAndAllotment from "./pages/StocksAndAllotment";
import MNREDIUpload from "./pages/MNREDIUpload";
import PaymentLOLOGateInOut from "./pages/EmptyYard/PaymentLOLOGateInOut";
import { createBreakpoints } from "@mui/system";

// import AiQueries from "./pages/AiQueries";
const Surveyor = lazy(() => import("./pages/Surveyor"));
const RepairLogin = lazy(() => import("./pages/RepairLogin"));
const EdiAnalysis = lazy(() => import("./pages/EmptyYard/EdiAnalysis"));
const WISTIMAnalysis = lazy(() => import("./pages/EmptyYard/WISTIMAnalysis"));
const EnBlockMovementPreGateInBulkUpload = lazy(
  () => import("./pages/ENBlock/EnBlockMovementPreGateInBulkUpload"),
);
const ENBlockMovementPreGateIn = lazy(
  () => import("./pages/ENBlock/ENBlockMovementPreGateIn"),
);
const ProcurementToolTransfer = lazy(
  () => import("./pages/Procurement/ProcurementToolTransfer"),
);
const ProcurementToolRateHistory = lazy(
  () => import("./pages/Procurement/ProcurementToolRateHistory"),
);
const ProcurementMasterStock = lazy(
  () => import("./pages/Procurement/ProcurementMasterStock"),
);
const AddManagerComponent = lazy(
  () => import("./pages/Master/ManagerManagement/AddManagerComponent"),
);
const Managermanagement = lazy(
  () => import("./pages/Master/ManagerManagement/Managermanagement"),
);
const TemplateDownload = lazy(
  () => import("@components/reusablecomponents/TemplateDownload"),
);
const InvoiceTemplateDownload = lazy(
  () => import("@components/reusablecomponents/InvoiceTemplateDownload"),
);
const PaymentTemplateDownload = lazy(
  () => import("@components/reusablecomponents/PaymentTemplateDownload"),
);
const InvoiceLrTemplate = lazy(
  () =>
    import("./pages/Transportation/InvoiceLr/InvoiceTemplate/InvoiceTemplate"),
);
const MnaufacturingLogsComponent = lazy(
  () => import("./pages/MnaufacturingLogsComponent"),
);
const LOLOFinancecustomerSingleAccount = lazy(
  () => import("./pages/LOLOFinance/LOLOFinancecustomerSingleAccount"),
);
const LOLOFinanceCustomerAccountBulkUpload = lazy(
  () => import("./pages/LOLOFinance/LOLOFinanceCustomerAccountBulkUpload"),
);
const LOLOFinanceCustomerComponenet = lazy(
  () => import("./pages/LOLOFinance/LOLOFinanceCustomerComponenet"),
);
const LoloFinanceBulkUpload = lazy(
  () => import("./pages/LoloFinanceBulkUpload"),
);
const MNRStaffAttendence = lazy(
  () => import("./pages/Master/StaffAttendance/MNRStaffAttendence"),
);
const MNRStaffAttendanceForm = lazy(
  () => import("./pages/Master/StaffAttendance/MNRStaffAttendanceForm"),
);
const UserSupportTicketDashboardComp = lazy(
  () => import("./pages/UserSupport/UserSupportTicketDashboardComp"),
);
const UserSupportTicketSingleKanbanPage = lazy(
  () => import("./pages/UserSupport/UserSupportTicketSingleKanbanPage"),
);
const AutomationClientOperation = lazy(
  () => import("./pages/Automation/AutomationClientOperation"),
);
const AutomationSinglePartyClientDependecyTransfer = lazy(
  () =>
    import("./pages/Automation/AutomationSinglePartyClientDependecyTransfer"),
);
const AutomationProcurementStockDelete = lazy(
  () => import("./pages/Automation/AutomationProcurementStockDelete"),
);
const MasterLineHandlingCharges = lazy(
  () => import("./pages/Master/LineHandlingCharges/MasterLineHandlingCharges"),
);
const MasterHandlingChargesHistory = lazy(
  () =>
    import("./pages/Master/HandlingChargesHistory/MasterHandlingChargesHistory"),
);

const AutomationContainerInfo = lazy(
  () => import("./pages/Automation/AutomationContainerInfo"),
);
const AutomationReciept = lazy(
  () => import("./pages/Automation/AutomationReciept"),
);
const AccountListing = lazy(
  () => import("./pages/Transportation/Account/accountListing"),
);
const MNRMaterial = lazy(() => import("./pages/Analytics/MNRMaterial"));
const AnalyticsDashboard = lazy(
  () => import("./pages/Analytics/AnalyticsDashboard"),
);

const AnalyticsReport = lazy(() => import("./pages/Analytics/AnalyticsReport"));
const StockData = lazy(() => import("./pages/Analytics/StockData"));
const MNRData = lazy(() => import("./pages/Analytics/MNR"));
const STVolumeRevenue = lazy(
  () => import("./pages/Analytics/SelfTransportation"),
);
const AdhocReportPage = lazy(() => import("./pages/AdhocReportPage"));
const RepoData = lazy(() => import("./pages/Analytics/RepoData"));
const HandlingVolumeRevenue = lazy(() => import("./pages/Analytics/Handling"));
const NonDepotContainer = lazy(
  () => import("./pages/Automation/NonDepotContainer"),
);
const Master = lazy(() => import("./pages/Automation/Master"));
const Operation = lazy(() => import("./pages/Automation/Operation"));
const Automation = lazy(() => import("./pages/Automation/Automation"));
const AccountForm = lazy(
  () => import("./pages/Transportation/Account/accountForm"),
);
const CustomerListing = lazy(
  () => import("./pages/Transportation/Customer/CustomerListing"),
);
const CustomerForm = lazy(
  () => import("./pages/Transportation/Customer/CustomerForm"),
);
const CreditorListing = lazy(
  () => import("./pages/Transportation/Creditor/creditorListing"),
);
const CreditorForm = lazy(
  () => import("./pages/Transportation/Creditor/creditorForm"),
);
const Driver = lazy(() => import("./pages/Transportation/Driver/Driver"));
const DriverForm = lazy(
  () => import("./pages/Transportation/Driver/DriverForm"),
);
const Truck = lazy(() => import("./pages/Transportation/Truck/Truck"));
const TruckForm = lazy(() => import("./pages/Transportation/Truck/TruckForm"));
const Service = lazy(() => import("./pages/Transportation/Service/Service"));
const ServiceForm = lazy(
  () => import("./pages/Transportation/Service/ServiceForm"),
);
const BookingLisitng = lazy(
  () => import("./pages/Transportation/Booking/BookingListing"),
);
const BookingForm = lazy(
  () => import("./pages/Transportation/Booking/BookingForm"),
);
const PurchaseListing = lazy(
  () => import("./pages/Transportation/Purchase/PurchaseListing"),
);
const PurchaseForm = lazy(
  () => import("./pages/Transportation/Purchase/PurchaseForm"),
);
const InvoiceLrLisitng = lazy(
  () => import("./pages/Transportation/InvoiceLr/InvoiceLrListing"),
);
const InvoiceLrForm = lazy(
  () => import("./pages/Transportation/InvoiceLr/InvoiceLrForm"),
);
const PaymentReciept = lazy(
  () => import("./pages/Transportation/Voucher/PaymentReciept/PaymentReciept"),
);
const PaymentRecieptForm = lazy(
  () =>
    import("./pages/Transportation/Voucher/PaymentReciept/PaymentRecieptForm"),
);
const ContraEntry = lazy(
  () => import("./pages/Transportation/Voucher/Contra/ContraEntry"),
);
const ContraEntryForm = lazy(
  () => import("./pages/Transportation/Voucher/Contra/ContraEntryForm"),
);
const JournalVoucher = lazy(
  () => import("./pages/Transportation/Voucher/JournalVoucher/JournalVoucher"),
);
const JournalVoucherForm = lazy(
  () =>
    import("./pages/Transportation/Voucher/JournalVoucher/JournalVoucherForm"),
);
const TransportationReports = lazy(
  () =>
    import("./pages/Transportation/TransportaationReports/TransportationReports"),
);
const CountryListing = lazy(
  () => import("./pages/Master/Country/CountryListing"),
);
const AddUpdateCountry = lazy(
  () => import("./pages/Master/Country/AddUpdateCountry"),
);
const LocationListing = lazy(
  () => import("./pages/Master/Location/LocationListing"),
);
const AddUpdateLocation = lazy(
  () => import("./pages/Master/Location/AddUpdateLocation"),
);
const SiteListing = lazy(() => import("./pages/Master/Site/SiteListing"));
const AddUpdateSite = lazy(() => import("./pages/Master/Site/AddUpdateSite"));
const SealManagement = lazy(
  () => import("./pages/Master/SealManagement/SealManagementListing"),
);
const AddUpdateSealManagement = lazy(
  () => import("./pages/Master/SealManagement/AddUpdateSealManagement"),
);
const RoleListings = lazy(() => import("./pages/Account/Role/RoleListings"));
const AddUpdateRole = lazy(() => import("./pages/Account/Role/AddUpdateRole"));
const UserListings = lazy(() => import("./pages/Account/User/UserListings"));
const AddUpdateUser = lazy(() => import("./pages/Account/User/AddUpdateUser"));
const ClientListing = lazy(() => import("./pages/Master/Client/ClientListing"));
const ClientMasterForm = lazy(
  () => import("./pages/Master/Client/ClientMasterForm"),
);
const ClientDocumentListing = lazy(
  () => import("./pages/Master/ClientDocument/ClientDocumentListing"),
);
const AddClientDoc = lazy(
  () => import("./pages/Master/ClientDocument/AddClientDoc"),
);
const RefCodeListing = lazy(
  () => import("./pages/Master/RefCode/RefCodeListing"),
);
const AddUpdateRefCode = lazy(
  () => import("./pages/Master/RefCode/AddUpdateRefCode"),
);
const TransporterListing = lazy(
  () => import("./pages/Master/Transporter/TransporterListing"),
);
const AddUpdateTransporter = lazy(
  () => import("./pages/Master/Transporter/AddUpdateTransporter"),
);
const ExportCargoTypeListing = lazy(
  () => import("./pages/Master/ExportCargoType/ExportCargoTypeListing"),
);
const AddUpdateExportCargoType = lazy(
  () => import("./pages/Master/ExportCargoType/AddUpdateExportCargoType"),
);
const CarrierCodeListing = lazy(
  () => import("./pages/Master/CarrierCode/CarrierCodeListing"),
);
const AddUpdateCarrierCode = lazy(
  () => import("./pages/Master/CarrierCode/AddUpdateCarrierCode"),
);
const ContainerSizeListing = lazy(
  () => import("./pages/Master/ContainerSize/ContainerSizeListing"),
);
const AddUpdateContainerSize = lazy(
  () => import("./pages/Master/ContainerSize/AddUpdateContainerSize"),
);
const ContainerTypeListing = lazy(
  () => import("./pages/Master/ContainerType/ContainerTypeListing"),
);
const AddUpdateContainerType = lazy(
  () => import("./pages/Master/ContainerType/AddUpdateContainerType"),
);
const ContainerTypeSizeCodeListing = lazy(
  () =>
    import("./pages/Master/ContainerTypeSizeCode/ContainerTypeSizeCodeListing"),
);
const AddUpdateContainerTypeSizeCode = lazy(
  () => import("./pages/Master/ContainerTypeSizeCode/AddUpdateTypeSizeCode"),
);
const HandlingChargesListings = lazy(
  () => import("./pages/Master/HandlingCharges/HandlingChargesListings"),
);
const AddUpdateContainerHandlingCharges = lazy(
  () => import("./pages/Master/HandlingCharges/AddUpdateHandlingCharges"),
);
const TransportationChargesListings = lazy(
  () =>
    import("./pages/Master/TransportationCharges/TransportationChargesListings"),
);
const AddUpdateContainerTransportationCharges = lazy(
  () =>
    import("./pages/Master/TransportationCharges/AddUpdateTransportationCharges"),
);
const GroundRentListings = lazy(
  () => import("./pages/Master/GroundRent/GroundRentListings"),
);
const AddUpdateContainerGroundRentCharges = lazy(
  () => import("./pages/Master/GroundRent/AddUpdateGroundRentCharges"),
);
const VesselBkgNoListings = lazy(
  () => import("./pages/Master/VesselBkgNo/VesselBkgNoListing"),
);
const AddUpdateVesselBkgNoCharges = lazy(
  () => import("./pages/Master/VesselBkgNo/AddUpdateVesselBkgNo"),
);
const VesselVoyageDetailListings = lazy(
  () => import("./pages/Master/VesselVoyageDetail/VesselVoyageDetailListing"),
);
const AddUpdateVesselVoyageDetail = lazy(
  () => import("./pages/Master/VesselVoyageDetail/AddUpdateVesselVoyageDetail"),
);
const LocationCodeDetailListing = lazy(
  () => import("./pages/Master/LocationCodeDetail/LocationCodeDetailListing"),
);
const AddUpdateLocationCodeDetails = lazy(
  () => import("./pages/Master/LocationCodeDetail/AddUpdateLocationCodeDetail"),
);
const TariffTypeListing = lazy(
  () => import("./pages/Master/Tarrif/TariffTypeListing"),
);
const AddTriffDoc = lazy(() => import("./pages/Master/Tarrif/AddTriffDoc"));
const StaffMasterListing = lazy(
  () => import("./pages/Master/StaffMaster/StaffMasterListing"),
);
const AddUpdateStaffMaster = lazy(
  () => import("./pages/Master/StaffMaster/AddUpdateStaffMaster"),
);
const ToolRoom = lazy(() => import("./pages/Procurement/ToolRoom"));
const Request = lazy(() => import("./pages/Procurement/Request"));
const RequestEdit = lazy(() => import("./components/Procurement/RequestEdit"));
const ProcurementReport = lazy(
  () => import("./pages/Procurement/ProcurementReport"),
);
const Consumption = lazy(() => import("./pages/Procurement/Consumption"));
const ConsumeEdit = lazy(() => import("./components/Procurement/ConsumeEdit"));
const Bulkupload = lazy(() => import("./pages/Procurement/Bulkupload"));
const MNRLoloFinance = lazy(() => import("./pages/MNR/MNRLoloFinance"));
const AdvanceFinanceProcess = lazy(
  () => import("./pages/MNR/AdvanceFinanceProcess"),
);
const PreGateOutListing = lazy(() => import("./pages/MNR/PreGateOutListing"));
const PreGateInListing = lazy(() => import("./pages/MNR/PreGateInListing"));
const LoadedYard = lazy(() => import("./pages/LoadedYard/LoadedYard"));
const LoadedStockUploadForm = lazy(
  () => import("./pages/LoadedYard/StockUploadForm"),
);
const LoadedYardEDI = lazy(() => import("./pages/LoadedYard/LoadedYardEDI"));
const NewBillingModule = lazy(
  () => import("./pages/NewBillingModule/NewBillingModule"),
);
const NewBillingInvoice = lazy(
  () => import("./pages/NewBillingModule/NewBillingInvoice"),
);
const BillingInvoiceNew = lazy(
  () => import("./pages/NewBillingModule/BillingInvoice"),
);
const NewMnrHistory = lazy(
  () => import("./pages/NewBillingModule/NewMnrHistory"),
);
const BillingCreditNotesHistory = lazy(
  () => import("./pages/NewBillingModule/BillingCreditNotesHistory"),
);
const BillingCreditNotesInvoice = lazy(
  () => import("./pages/NewBillingModule/BillingCreditNotesInvoice"),
);
const BillingCreditNotes = lazy(
  () => import("./pages/NewBillingModule/BillingCreditNotes"),
);
const TruckTrackingAdd = lazy(
  () => import("./pages/TruckTurnAround/TruckTrackingAdd"),
);
const TruckTurnArroundPage = lazy(
  () => import("./pages/TruckTurnAround/TruckTurnArroundPage"),
);
const ENBlockMovement = lazy(() => import("./pages/ENBlock/ENBlockMovement"));
const ENBlockMovementBulkUpload = lazy(
  () => import("./pages/ENBlock/ENBlockMovementBulkUpload"),
);
const WistimDestimS3 = lazy(() => import("./pages/WistimDestimS3"));
const Reports = lazy(() => import("./pages/Reports"));
const RegenerateEDI = lazy(() => import("./pages/RegenerateEDI"));
const MNR = lazy(() => import("./pages/MNR"));
const MNRProcess = lazy(() => import("./pages/MNRProcess"));
const MnrUploadForm = lazy(() => import("./pages/MnrUploadForm"));
const StockUploadForm = lazy(() => import("./pages/StockUploadForm"));
const StocksAllotmentSection = lazy(
  () => import("./components/StocksAllotmentSection"),
);

const breakpoints = createBreakpoints({});

export let theme = createTheme({
  palette: {
    primary: {
      main: "#6d28d2",
      contrastText: "#fff",
    },
    secondary: {
      main: "#1e1e1e",
      light: "#f2f7fa",
      dark: "#000",
      contrastText: "#FFF",
    },
    info: {
      main: "#2a5fa5",
      light: "#557aab",
      dark: "#0e51ab",
    },
    text: {
      primary: "#495057",
      secondary: "#EDEDF2",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          [breakpoints.down("sm")]: {
            fontSize: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },

  typography: {
    fontFamily: `"Poppins", sans-serif`,
    button: {
      textTransform: "none",
    },
  },
});

theme = responsiveFontSizes(theme);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Suspense fallback={<Loader />}>
          <Switch>
            {/* <Route path="/ai-analysis" component={AiQueries} /> */}
            <Route
              exact
              path="/user-support-ticket"
              component={UserSupportTicketDashboardComp}
            />
            <Route
              exact
              path="/user-support-ticket/:pk"
              component={UserSupportTicketSingleKanbanPage}
            />
            <Route exact path="/login" component={Login} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route
              exact
              path="/analytics/dashboard"
              component={AnalyticsDashboard}
            />
            <Route
              exact
              path="/analytics/mnr-material"
              component={MNRMaterial}
            />
            <Route
              exact
              path="/analytics/reports"
              component={AnalyticsReport}
            />
            <Route exact path="/analytics/mnr" component={MNRData} />
            <Route exact path="/analytics/stock-data" component={StockData} />
            <Route exact path="/analytics/st" component={STVolumeRevenue} />
            <Route exact path="/analytics/repo" component={RepoData} />
            <Route
              exact
              path="/analytics/handling"
              component={HandlingVolumeRevenue}
            />
            <Route exact path="/adhoc-report" component={AdhocReportPage} />
            {/* AUTOMATION */}
            <Route
              exact
              path="/automation/non-depot-container"
              component={NonDepotContainer}
            />
            <Route exact path="/automation/master" component={Master} />
            <Route exact path="/automation/operation" component={Operation} />
            <Route exact path="/automation/dashboard" component={Automation} />
            <Route
              exact
              path="/automation/container-info"
              component={AutomationContainerInfo}
            />
            <Route
              exact
              path="/automation/receipts"
              component={AutomationReciept}
            />
            <Route
              exact
              path="/automation/client-operation"
              component={AutomationClientOperation}
            />
            <Route
              exact
              path="/automation/client-dependency-transfer"
              component={AutomationSinglePartyClientDependecyTransfer}
            />
            <Route
              exact
              path="/automation/procurement-stock-delete"
              component={AutomationProcurementStockDelete}
            />
            {/* TRANSPORTATION */}
            <Route path="/transport/account" component={AccountListing} />
            <Route path="/transport/account-form" component={AccountForm} />
            <Route path="/transport/customer" component={CustomerListing} />
            <Route path="/transport/customer-form" component={CustomerForm} />
            <Route path="/transport/creditor" component={CreditorListing} />
            <Route path="/transport/creditor-form" component={CreditorForm} />
            <Route path="/transport/driver" component={Driver} />
            <Route path="/transport/driver-form" component={DriverForm} />
            <Route path="/transport/truck" component={Truck} />
            <Route path="/transport/truck-form" component={TruckForm} />
            <Route path="/transport/service" component={Service} />
            <Route path="/transport/service-form" component={ServiceForm} />
            <Route path="/transport/booking" component={BookingLisitng} />
            <Route path="/transport/booking-form" component={BookingForm} />
            <Route path="/transport/purchase-form" component={PurchaseForm} />
            <Route path="/transport/purchase" component={PurchaseListing} />
            <Route path="/transport/invoice-lr" component={InvoiceLrLisitng} />
            <Route
              path="/transport/invoice-lr-form"
              component={InvoiceLrForm}
            />
            <Route path="/voucher/paymentreciept" component={PaymentReciept} />
            <Route
              path="/voucher/paymentreciept-form"
              component={PaymentRecieptForm}
            />
            <Route path="/voucher/contraentry" component={ContraEntry} />
            <Route
              path="/voucher/contraentry-form"
              component={ContraEntryForm}
            />
            <Route path="/voucher/journalvoucher" component={JournalVoucher} />
            <Route
              path="/voucher/journalvoucher-form"
              component={JournalVoucherForm}
            />
            <Route
              path="/transport/reports"
              component={TransportationReports}
            />
            {/* MASTER */}
            <Route exact path="/master/country" component={CountryListing} />
            <Route
              exact
              path="/master/country/form"
              component={AddUpdateCountry}
            />
            <Route exact path="/master/location" component={LocationListing} />
            <Route
              exact
              path="/master/location/form"
              component={AddUpdateLocation}
            />
            <Route exact path="/master/site" component={SiteListing} />
            <Route exact path="/master/site/form" component={AddUpdateSite} />
            <Route
              exact
              path="/master/sealManagement"
              component={SealManagement}
            />
            <Route
              exact
              path="/master/sealManagement/form"
              component={AddUpdateSealManagement}
            />
            <Route
              exact
              path="/master/manager-management"
              component={Managermanagement}
            />
            <Route
              exact
              path="/master/manager-management/:pk"
              component={AddManagerComponent}
            />
            <Route exact path="/account/role" component={RoleListings} />
            <Route exact path="/account/role/form" component={AddUpdateRole} />
            <Route exact path="/account/user" component={UserListings} />
            <Route exact path="/account/user/form" component={AddUpdateUser} />
            <Route exact path="/master/client" component={ClientListing} />
            <Route
              exact
              path="/master/client/form"
              component={ClientMasterForm}
            />
            <Route
              exact
              path="/master/clientDocument"
              component={ClientDocumentListing}
            />
            <Route
              exact
              path="/master/clientDocument/form"
              component={AddClientDoc}
            />
            <Route
              exact
              path="/master/mnr-staff-attendance"
              component={MNRStaffAttendence}
            />
            <Route
              exact
              path="/master/mnr-staff-attendance/:pk"
              component={MNRStaffAttendanceForm}
            />
            <Route exact path="/master/refcode" component={RefCodeListing} />
            <Route
              exact
              path="/master/refcode/form"
              component={AddUpdateRefCode}
            />
            <Route
              exact
              path="/master/transporter"
              component={TransporterListing}
            />
            <Route
              exact
              path="/master/transporter/form"
              component={AddUpdateTransporter}
            />
            <Route
              exact
              path="/master/exportCargoType"
              component={ExportCargoTypeListing}
            />
            <Route
              exact
              path="/master/exportCargoType/form"
              component={AddUpdateExportCargoType}
            />
            <Route
              exact
              path="/master/carrier-code"
              component={CarrierCodeListing}
            />
            <Route
              exact
              path="/master/carrier-code/form"
              component={AddUpdateCarrierCode}
            />
            <Route
              exact
              path="/master/containerSize"
              component={ContainerSizeListing}
            />
            <Route
              exact
              path="/master/containerSize/form"
              component={AddUpdateContainerSize}
            />
            <Route
              exact
              path="/master/containerType"
              component={ContainerTypeListing}
            />
            <Route
              exact
              path="/master/containerType/form"
              component={AddUpdateContainerType}
            />
            <Route
              exact
              path="/master/containerTypeSizeCode"
              component={ContainerTypeSizeCodeListing}
            />
            <Route
              exact
              path="/master/containerTypeSizeCode/form"
              component={AddUpdateContainerTypeSizeCode}
            />
            <Route
              exact
              path="/master/line-handling-charges/:pk?"
              component={MasterLineHandlingCharges}
            />
            <Route
              exact
              path="/master/handling-charges-history/:pk?"
              component={MasterHandlingChargesHistory}
            />
            <Route
              exact
              path="/master/containerHandlingCharges"
              component={HandlingChargesListings}
            />
            <Route
              exact
              path="/master/containerHandlingCharges/form"
              component={AddUpdateContainerHandlingCharges}
            />
            <Route
              exact
              path="/master/containerTransportationCharges"
              component={TransportationChargesListings}
            />
            <Route
              exact
              path="/master/containerTransportationCharges/form"
              component={AddUpdateContainerTransportationCharges}
            />
            <Route
              exact
              path="/master/containerGroundRentCharges"
              component={GroundRentListings}
            />
            <Route
              exact
              path="/master/containerGroundRentCharges/form"
              component={AddUpdateContainerGroundRentCharges}
            />
            <Route
              exact
              path="/master/vesselBkgNo"
              component={VesselBkgNoListings}
            />
            <Route
              exact
              path="/master/vesselBkgNo/form"
              component={AddUpdateVesselBkgNoCharges}
            />
            <Route
              exact
              path="/master/vesselVoyageDetail"
              component={VesselVoyageDetailListings}
            />
            <Route
              exact
              path="/master/vesselVoyageDetail/form"
              component={AddUpdateVesselVoyageDetail}
            />
            <Route
              exact
              path="/master/locationCodeDetail"
              component={LocationCodeDetailListing}
            />
            <Route
              exact
              path="/master/locationCodeDetail/form"
              component={AddUpdateLocationCodeDetails}
            />
            <Route
              exact
              path="/master/tariffDocument"
              component={TariffTypeListing}
            />
            <Route
              exact
              path="/master/tariffDocument/form"
              component={AddTriffDoc}
            />
            <Route
              exact
              path="/master/staffMaster"
              component={StaffMasterListing}
            />
            <Route
              exact
              path="/master/staffMaster/form"
              component={AddUpdateStaffMaster}
            />
            <Route
              exact
              path="/master/sealManagement/seal-upload"
              component={SealUploadForm}
            />
            {/* PROCUREMENT */}
            <Route exact path="/procurement/tools" component={ToolRoom} />
            <Route
              exact
              path="/procurement/requesition"
              component={Request}
            ></Route>
            <Route
              path="/procurement/requesition/add"
              component={RequestEdit}
            ></Route>
            <Route path="/procurement/reports" component={ProcurementReport} />
            <Route
              path="/procurement/master-stock"
              component={ProcurementMasterStock}
            />
            <Route
              exact
              path="/procurement/consumption"
              component={Consumption}
            />
            <Route
              path="/procurement/consumption/add"
              component={ConsumeEdit}
            />
            <Route
              path="/procurement/tool-rate-history"
              component={ProcurementToolRateHistory}
            />
            <Route
              path="/procurement/tool-transfer"
              component={ProcurementToolTransfer}
            />
            {/* <Route
              path="/procurement/tool-transfer/request"
              component={ProcurementToolTransferRequest}
            /> */}
            <Route path="/procurement/tools/upload" component={Bulkupload} />
            {/* LOLO FINANCE */}{" "}
            <Route path="/lolo-finance" component={MNRLoloFinance} />
            <Route
              exact
              path="/lolo-payment/advance-lolo-payment"
              component={MNRLoloFinance}
            />
            <Route
              path="/lolo-payment/advance-lolo-payment/bulk-upload"
              component={LoloFinanceBulkUpload}
            />
            <Route
              exact
              path="/lolo-payment/pre-gate-in"
              component={PreGateInListing}
            />
            <Route
              exact
              path="/lolo-payment/pre-gate-out"
              component={PreGateOutListing}
            />
            <Route
              exact
              path="/lolo-payment/advance-lolo-payment/advance-payment-process/:pk"
              component={AdvanceFinanceProcess}
            />
            <Route
              exact
              path="/lolo-payment/advance-finance-bulk-upload/:id"
              component={AdvanceFinanceBulkUpload}
            />
            {/* LOADED YARD  */}
            <Route exact path="/loaded-yard" component={LoadedYard} />
            <Route path="/loaded-yard-edi" component={LoadedYardEDI} />
            <Route
              exact
              path="/loaded-yard/stock-upload"
              component={LoadedStockUploadForm}
            />
            {/* BILLING */}
            <Route
              exact
              path="/billing/new-billing"
              component={NewBillingModule}
            />
            <Route
              exact
              path="/billing/new-billing/collect-invoice-new"
              component={NewBillingInvoice}
            />
            <Route
              exact
              path="/billing/invoice-billing"
              component={BillingInvoiceNew}
            />
            <Route
              exact
              path="/billing/mnr-history"
              component={NewMnrHistory}
            />
            <Route
              exact
              path="/billing/credit-notes/history"
              component={BillingCreditNotesHistory}
            />
            <Route
              exact
              path="/billing/credit-notes/:pk"
              component={BillingCreditNotesInvoice}
            />
            <Route
              exact
              path="/billing/credit-notes"
              component={BillingCreditNotes}
            />
            {/* TRUCK TRACKING */}
            <Route
              exact
              path="/depot/truck-turn-around"
              component={TruckTurnArroundPage}
            />
            <Route
              exact
              path="/depot/truck-turn-around/:pk"
              component={TruckTrackingAdd}
            />
            {/* EMPTY_YARD */}
            <Route
              exact
              path="/empty-yard/enBlock"
              component={ENBlockMovement}
            />
            <Route
              exact
              path="/empty-yard/enBlock/bulk-upload"
              component={ENBlockMovementBulkUpload}
            />
            <Route
              exact
              path="/enBlock-Pre-Gate-IN"
              component={ENBlockMovementPreGateIn}
            />
            <Route
              exact
              path="/enBlock-Pre-Gate-IN/bulk-upload"
              component={EnBlockMovementPreGateInBulkUpload}
            />
            <Route path="/wistim-destim-s3" component={WistimDestimS3} />
            <Route exact path="/wistim-analysis" component={WISTIMAnalysis} />
            <Route exact path="/edi-analysis" component={EdiAnalysis} />
            <Route exact path="/mnr/reports" component={Reports} />
            <Route path="/regenerate-edi" component={RegenerateEDI} />
            <Route exact path="/mnr" component={MNR} />
            <Route path="/serveyor" component={Surveyor} />
            <Route path="/repair-tab" component={RepairLogin} />
            <Route path="/mnrprocess" component={MNRProcess} />
            <Route exact path="/depot" component={Depot} />
            <Route path="/mnr/mnr-upload" component={MnrUploadForm} />
            <Route
              path="/mnr/mnr-washing-upload"
              component={MnrUploadWashingForm}
            />
            <Route
              exact
              path="/depot/stocks-upload"
              component={StockUploadForm}
            />
            <Route
              path="/allotment_booking"
              component={StocksAllotmentSection}
            />
            <Route
              exact
              path="/notification-history"
              component={NotificationHistory}
            />
            <Route path="/mnrfilter" component={MNRGridFilter} />
            <Route path="/Unathorized" component={Unauthorized} />
            <Route path="/AccessDenied" component={AccessDenied} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/stocks" component={StocksAndAllotment} />
            <Route path="/mnr_edi_upload" component={MNREDIUpload} />
            <Route path="/transport/lr-print" component={TemplateDownload} />
            <Route
              path="/transport/invoice-lr-print"
              component={InvoiceTemplateDownload}
            />
            <Route
              path="/transport/payment-receipt-print"
              component={PaymentTemplateDownload}
            />
            <Route
              path="/transport/invoice-print"
              component={InvoiceLrTemplate}
            />
            <Route path="/loader" component={Loader} />
            <Route
              exact
              path="/manufacturing-logs"
              component={MnaufacturingLogsComponent}
            />
            <Route
              path="/lolo-payment-gate-in-out"
              component={PaymentLOLOGateInOut}
            />
            <Route
              exact
              path="/lolo-payment/customer-account"
              component={LOLOFinanceCustomerComponenet}
            />
            <Route
              exact
              path="/lolo-payment/customer-account/:pk"
              component={LOLOFinancecustomerSingleAccount}
            />
            <Route
              exact
              path="/lolo-payment/customer-account/bulk-upload"
              component={LOLOFinanceCustomerAccountBulkUpload}
            />
            <Route
              render={() => (
                <Redirect
                  to={
                    store.getState().user.role === "no role" ||
                    store.getState().user.role === "Wistim Distim"
                      ? "/mnr_edi_upload"
                      : store.getState().user.role === "Analytics"
                        ? "/analytics/dashboard"
                        : store.getState().user.role === "Automation"
                          ? "/automation/dashboard"
                          : "/dashboard"
                  }
                />
              )}
            />
          </Switch>
        </Suspense>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
