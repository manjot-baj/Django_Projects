import React, { Suspense, lazy } from "react";
import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import store from "./store";
import "./App.css";

import Loader from "./components/dashboard/Loader"
import NotificationHistory from "./pages/NotificationHistory";
import Dashboard from "./pages/Dashboard"
import RepairLogin from "./pages/RepairLogin";
import Surveyor from "./pages/Surveyor";
import MnrUploadWashingForm from "./pages/MnrUploadWashingForm"
import RepoData from "./pages/Analytics/RepoData";
import AutomationReciept from "./pages/Automation/AutomationReciept";
import AnalyticsReport from "./pages/Analytics/AnalyticsReport";
import AutomationContainerInfo from "./pages/Automation/AutomationContainerInfo";
import ProcurementToolRateHistory from "./pages/Procurement/ProcurementToolRateHistory";
import EdiAnalysis from "./pages/EmptyYard/EdiAnalysis";
import AdvanceFinanceBulkUpload from "./pages/MNR/AdvanceFinanceBulkUpload";
import ProcurementToolTransfer from "./pages/Procurement/ProcurementToolTransfer";
import ProcurementToolTransferRequest from "./pages/Procurement/ProcurementToolTransferRequest";
import Depot from "./pages/Depot";
import ProcurementMasterStock from "./pages/Procurement/ProcurementMasterStock";
import WISTIMAnalysis from "./pages/EmptyYard/WISTIMAnalysis";
import ENBlockMovementPreGateIn from "./pages/ENBlock/ENBlockMovementPreGateIn";
import EnBlockMovementPreGateInBulkUpload from "./pages/ENBlock/EnBlockMovementPreGateInBulkUpload";
import Managermanagement from "./pages/Master/ManagerManagement/Managermanagement";
import AddManagerComponent from "./pages/Master/ManagerManagement/AddManagerComponent";
import AdhocReportPage from "./pages/AdhocReportPage";
import MnaufacturingLogsComponent from "./pages/MnaufacturingLogsComponent";


const TruckTrackingAdd = lazy(()=>import("./pages/TruckTurnAround/TruckTrackingAdd"))
const TruckTurnArroundPage = lazy(()=>import("./pages/TruckTurnAround/TruckTurnArroundPage"));
const ENBlockMovement  = lazy(()=>import("./pages/ENBlock/ENBlockMovement"));
const ENBlockMovementBulkUpload = lazy(()=>import("./pages/ENBlock/ENBlockMovementBulkUpload"));
const BillingCreditNotesInvoice = lazy(()=>import("./pages/NewBillingModule/BillingCreditNotesInvoice"));
const TemplateDownload = lazy(() => import('./components/reusableComponents/TemplateDownload'))
const InvoiceTemplateDownload = lazy(() => import('./components/reusableComponents/InvoiceTemplateDownload'))
const PaymentTemplateDownload = lazy(() => import('./components/reusableComponents/PaymentTemplateDownload'))
const BillingCreditNotes = lazy(()=>import("./pages/NewBillingModule/BillingCreditNotes"))
const BillingCreditNotesHistory = lazy(()=>import("./pages/NewBillingModule/BillingCreditNotesHistory"))

const PreGateOutListing = lazy(()=> import("./pages/MNR/PreGateOutListing"))
const PreGateInListing = lazy(()=>import("./pages/MNR/PreGateInListing"))
const MNRLoloFinance = lazy(()=>import("./pages/MNR/MNRLoloFinance"))
const AdvanceFinanceProcess = lazy(()=>import("./pages/MNR/AdvanceFinanceProcess"))
const Login = lazy(() => import('./pages/Login'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

// Admin  Routes
const RoleListings = lazy(() => import('./pages/Account/Role/RoleListings'))
const AddUpdateRole = lazy(() => import('./pages/Account/Role/AddUpdateRole'))
const UserListings = lazy(() => import('./pages/Account/User/UserListings'))
const AddUpdateUser = lazy(() => import('./pages/Account/User/AddUpdateUser'))


// Automation  Routes
const Automation = lazy(() => import('./pages/Automation/Automation'))
const Master = lazy(() => import('./pages/Automation/Master'))
const Operation = lazy(() => import('./pages/Automation/Operation'))
const NonDepotContainer = lazy(() => import('./pages/Automation/NonDepotContainer'))

// Analytics  Routes
const HandlingVolumeRevenue = lazy(() => import('./pages/Analytics/Handling'))
const STVolumeRevenue = lazy(() => import('./pages/Analytics/SelfTransportation'))
const StockData = lazy(() => import('./pages/Analytics/StockData'))
const MNRData = lazy(() => import('./pages/Analytics/MNR'))
const MNRMaterial = lazy(() => import('./pages/Analytics/MNRMaterial'))
const AnalyticsDashboard = lazy(() => import('./pages/Analytics/AnalyticsDashboard'))
// const Dashboard = lazy(() => import('./pages/Dashboard'))



// Master Routes
const CarrierCodeListing = lazy(() => import('./pages/Master/CarrierCode/CarrierCodeListing'))
const AddUpdateCarrierCode = lazy(() => import('./pages/Master/CarrierCode/AddUpdateCarrierCode'))
const ClientListing = lazy(() => import('./pages/Master/Client/ClientListing'))
const SealManagement = lazy(() => import('./pages/Master/SealManagement/SealManagementListing'))
const ClientMasterForm = lazy(() => import('./pages/Master/Client/ClientMasterForm'))
const ClientDocumentListing = lazy(() => import('./pages/Master/ClientDocument/ClientDocumentListing'))
const AddClientDoc = lazy(() => import('./pages/Master/ClientDocument/AddClientDoc'))
const AddTriffDoc = lazy(() => import('./pages/Master/Tarrif/AddTriffDoc'))
const CountryListing = lazy(() => import('./pages/Master/Country/CountryListing'))
const AddUpdateCountry = lazy(() => import('./pages/Master/Country/AddUpdateCountry'))
const LocationListing = lazy(() => import('./pages/Master/Location/LocationListing'))
const AddUpdateLocation = lazy(() => import('./pages/Master/Location/AddUpdateLocation'))
const SiteListing = lazy(() => import('./pages/Master/Site/SiteListing'))
const AddUpdateSite = lazy(() => import('./pages/Master/Site/AddUpdateSite'))
const TransporterListing = lazy(() => import('./pages/Master/Transporter/TransporterListing'))
const AddUpdateTransporter = lazy(() => import('./pages/Master/Transporter/AddUpdateTransporter'))
const AddUpdateSealManagement = lazy(() => import('./pages/Master/SealManagement/AddUpdateSealManagement'))
const ContainerSizeListing = lazy(() => import('./pages/Master/ContainerSize/ContainerSizeListing'))
const AddUpdateContainerSize = lazy(() => import('./pages/Master/ContainerSize/AddUpdateContainerSize'))
const ContainerTypeListing = lazy(() => import('./pages/Master/ContainerType/ContainerTypeListing'))
const AddUpdateContainerType = lazy(() => import('./pages/Master/ContainerType/AddUpdateContainerType'))
const ContainerTypeSizeCodeListing = lazy(() => import('./pages/Master/ContainerTypeSizeCode/ContainerTypeSizeCodeListing'))
const AddUpdateContainerTypeSizeCode = lazy(() => import('./pages/Master/ContainerTypeSizeCode/AddUpdateTypeSizeCode'))
const ExportCargoTypeListing = lazy(() => import('./pages/Master/ExportCargoType/ExportCargoTypeListing'))
const AddUpdateExportCargoType = lazy(() => import('./pages/Master/ExportCargoType/AddUpdateExportCargoType'))
const HandlingChargesListings = lazy(() => import('./pages/Master/HandlingCharges/HandlingChargesListings'))
const AddUpdateContainerHandlingCharges = lazy(() => import('./pages/Master/HandlingCharges/AddUpdateHandlingCharges'))
const TransportationChargesListings = lazy(() => import('./pages/Master/TransportationCharges/TransportationChargesListings'))
const AddUpdateContainerTransportationCharges = lazy(() => import('./pages/Master/TransportationCharges/AddUpdateTransportationCharges'))
const GroundRentListings = lazy(() => import('./pages/Master/GroundRent/GroundRentListings'))
const AddUpdateContainerGroundRentCharges = lazy(() => import('./pages/Master/GroundRent/AddUpdateGroundRentCharges'))
const VesselBkgNoListings = lazy(() => import('./pages/Master/VesselBkgNo/VesselBkgNoListing'))
const AddUpdateVesselBkgNoCharges = lazy(() => import('./pages/Master/VesselBkgNo/AddUpdateVesselBkgNo'))
const VesselVoyageDetailListings = lazy(() => import('./pages/Master/VesselVoyageDetail/VesselVoyageDetailListing'))
const AddUpdateVesselVoyageDetail = lazy(() => import('./pages/Master/VesselVoyageDetail/AddUpdateVesselVoyageDetail'))
const LocationCodeDetailListing = lazy(() => import('./pages/Master/LocationCodeDetail/LocationCodeDetailListing'))
const AddUpdateLocationCodeDetails = lazy(() => import('./pages/Master/LocationCodeDetail/AddUpdateLocationCodeDetail'))
const TariffTypeListing = lazy(() => import('./pages/Master/Tarrif/TariffTypeListing'))
const StaffMasterListing = lazy(() => import('./pages/Master/StaffMaster/StaffMasterListing'))
const AddUpdateStaffMaster = lazy(() => import('./pages/Master/StaffMaster/AddUpdateStaffMaster'))
const RefCodeListing = lazy(() => import('./pages/Master/RefCode/RefCodeListing'))
const AddUpdateRefCode = lazy(() => import('./pages/Master/RefCode/AddUpdateRefCode'))


// Loaded Yard Routes
const LoadedYard = lazy(() => import('./pages/LoadedYard/LoadedYard'))
const LoadedStockUploadForm = lazy(() => import('./pages/LoadedYard/StockUploadForm'))
const LoadedYardEDI = lazy(() => import('./pages/LoadedYard/LoadedYardEDI'))


// MNR
const MNR = lazy(() => import('./pages/MNR'))

const MNRProcess = lazy(() => import('./pages/MNRProcess'))
const MNRGridFilter = lazy(() => import('./components/MNRGridFilter'))
const MNREDIUpload = lazy(() => import('./pages/MNREDIUpload'))
const WistimDestimS3 = lazy(() => import('./pages/WistimDestimS3'))
const StocksAndAllotment = lazy(() => import('./pages/StocksAndAllotment'))
const StocksAllotmentSection = lazy(() => import('./components/StocksAllotmentSection'))
const StockUploadForm = lazy(() => import('./pages/StockUploadForm'))
const MnrUploadForm = lazy(() => import('./pages/MnrUploadForm'))
const SealUploadForm = lazy(() => import('./pages/SealUploadForm'))
const RegenerateEDI = lazy(() => import('./pages/RegenerateEDI'))
const Reports = lazy(() => import('./pages/Reports'))



// Billing Routes
const NewBillingInvoice = lazy(() => import('./pages/NewBillingModule/NewBillingInvoice'))
const BillingInvoiceNew = lazy(() => import('./pages/NewBillingModule/BillingInvoice'))
const BillingHistory = lazy(() => import('./pages/BillingHistory'))
const BillingInvoice = lazy(() => import('./components/BillingInvoice'))
const NewBillingModule = lazy(() => import('./pages/NewBillingModule/NewBillingModule'))
const Billing = lazy(() => import('./pages/Billing'))
const NewMnrHistory = lazy(() => import('./pages/NewBillingModule/NewMnrHistory'))



const BookingForm = lazy(() => import('./pages/Transportation/Booking/BookingForm'))

// Procurement Routes
const ProcurementReport = lazy(() => import('./pages/Procurement/ProcurementReport'))
const RequestEdit = lazy(() => import('./components/Procurement/RequestEdit'))
const ToolRoom = lazy(() => import('./pages/Procurement/ToolRoom'))
const Consumption = lazy(() => import('./pages/Procurement/Consumption'))
const ConsumeEdit = lazy(() => import('./components/Procurement/ConsumeEdit'))
const Request = lazy(() => import('./pages/Procurement/Request'))
const Bulkupload = lazy(() => import('./pages/Procurement/Bulkupload'))

// Transportation Routes
const CustomerListing = lazy(() => import('./pages/Transportation/Customer/CustomerListing'))
const BookingLisitng = lazy(() => import('./pages/Transportation/Booking/BookingListing'))
const PurchaseListing = lazy(() => import('./pages/Transportation/Purchase/PurchaseListing'))
const PurchaseForm = lazy(() => import('./pages/Transportation/Purchase/PurchaseForm'))
const InvoiceLrLisitng = lazy(() => import('./pages/Transportation/InvoiceLr/InvoiceLrListing'))
const InvoiceLrForm = lazy(() => import('./pages/Transportation/InvoiceLr/InvoiceLrForm'))
const TransportationReports = lazy(() => import('./pages/Transportation/TransportaationReports/TransportationReports'))
const CustomerForm = lazy(() => import('./pages/Transportation/Customer/CustomerForm'))
const AccountListing = lazy(() => import('./pages/Transportation/Account/accountListing'))
const CreditorListing = lazy(() => import('./pages/Transportation/Creditor/creditorListing'))
const AccountForm = lazy(() => import('./pages/Transportation/Account/accountForm'))
const CreditorForm = lazy(() => import('./pages/Transportation/Creditor/creditorForm'))
const PaymentReciept = lazy(() => import('./pages/Transportation/Voucher/PaymentReciept/PaymentReciept'))
const PaymentRecieptForm = lazy(() => import('./pages/Transportation/Voucher/PaymentReciept/PaymentRecieptForm'))
const ContraEntry = lazy(() => import('./pages/Transportation/Voucher/Contra/ContraEntry'))
const ContraEntryForm = lazy(() => import('./pages/Transportation/Voucher/Contra/ContraEntryForm'))
const JournalVoucher = lazy(() => import('./pages/Transportation/Voucher/JournalVoucher/JournalVoucher'))
const JournalVoucherForm = lazy(() => import('./pages/Transportation/Voucher/JournalVoucher/JournalVoucherForm'))
const Driver = lazy(() => import('./pages/Transportation/Driver/Driver'))
const DriverForm = lazy(() => import('./pages/Transportation/Driver/DriverForm'))
const Truck = lazy(() => import('./pages/Transportation/Truck/Truck'))
const TruckForm = lazy(() => import('./pages/Transportation/Truck/TruckForm'))
const Service = lazy(() => import('./pages/Transportation/Service/Service'))
const ServiceForm = lazy(() => import('./pages/Transportation/Service/ServiceForm'))
const InvoiceLrTemplate = lazy(() => import('./pages/Transportation/InvoiceLr/InvoiceTemplate/InvoiceTemplate'))

export let theme = createTheme({
  palette: {
    primary: {
      main: "#2A5FA5",
    },
    secondary: {
      main: "#243545",
    },
    text: {
      primary: "#495057",
      secondary: "#EDEDF2",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
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
        <Router>
        <Suspense fallback={<Loader/>}>
          <Switch>
            <Route exact path="/notification-history" component={NotificationHistory}/>
            <Route exact path="/adhoc-report" component={AdhocReportPage} />
            <Route
              exact
              path="/analytics/dashboard"
              component={AnalyticsDashboard}
            />
            <Route exact path="/automation/dashboard" component={Automation} />

            <Route
              exact
              path="/analytics/handling"
              component={HandlingVolumeRevenue}
            />
            <Route exact path="/automation/master" component={Master} />
            <Route exact path="/automation/receipts" component={AutomationReciept} />
            <Route exact path="/automation/operation" component={Operation} />
            <Route exact path="/automation/non-depot-container" component={NonDepotContainer} />
            <Route exact path="/automation/container-info" component={AutomationContainerInfo} />
            <Route exact path="/analytics/st" component={STVolumeRevenue} />
            <Route exact path="/analytics/stock-data" component={StockData} />
            <Route exact path="/analytics/mnr" component={MNRData} />
            <Route exact path="/analytics/repo" component={RepoData}/>
            <Route exact path="/edi-analysis" component={EdiAnalysis}/>
            <Route exact path="/wistim-analysis" component={WISTIMAnalysis} />
            <Route
              exact
              path="/analytics/mnr-material"
              component={MNRMaterial}
            />
            <Route exact path="/analytics/reports" component={AnalyticsReport}/>
            <Route exact path="/dashboard" component={Dashboard} />
            <Route path="/serveyor" component={Surveyor}/>
            <Route exact path="/depot" component={Depot} />
            <Route path="/loaded-yard" component={LoadedYard} />
            <Route path="/loaded-yard-edi" component={LoadedYardEDI}/>
            <Route path="/repair-tab" component={RepairLogin}/>
            <Route exact path="/mnr" component={MNR} />
            <Route path="/lolo-finance" component={MNRLoloFinance} />
            <Route exact path="/lolo-payment/advance-lolo-payment" component={MNRLoloFinance}/>
            <Route exact path="/lolo-payment/pre-gate-in" component={PreGateInListing}/>
            <Route exact path="/lolo-payment/pre-gate-out" component={PreGateOutListing}/>
            <Route exact path="/lolo-payment/advance-payment-process" component={AdvanceFinanceProcess}/>
            <Route exact path="/lolo-payment/advance-finance-bulk-upload/:id" component={AdvanceFinanceBulkUpload}/>
            <Route path="/wistim-destim-s3" component={WistimDestimS3} />
            <Route path="/mnrprocess" component={MNRProcess} />
            <Route path="/mnrfilter" component={MNRGridFilter} />
            <Route exact path="/billing" component={Billing} />
            <Route exact path="/billing/new-billing" component={NewBillingModule} />
            <Route path="/collect-invoice" component={BillingInvoice} />
            <Route path="/collect-invoice-new" component={NewBillingInvoice} />
            <Route exact path='/billing/mnr-history' component={NewMnrHistory}/>
            <Route path="/invoice-history" component={BillingHistory} />
            <Route exact path="/billing/invoice-billing" component={BillingInvoiceNew} />
            <Route exact path="/billing/credit-notes" component={BillingCreditNotes} />
            <Route exact path="/billing/credit-notes-history" component={BillingCreditNotesHistory} />
            <Route exact path="/billing/credit-notes/:pk" component={BillingCreditNotesInvoice}/>
            <Route path="/regenerate-edi" component={RegenerateEDI} />
            <Route exact path="/mnr/reports" component={Reports} />
            <Route path="/login" component={Login} />
            <Route path="/Unathorized" component={Unauthorized} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/stocks" component={StocksAndAllotment} />
            <Route path="/stocks-upload" component={StockUploadForm} />
            <Route path="/mnr-upload" component={MnrUploadForm} />
            <Route path="/mnr-washing-upload" component={MnrUploadWashingForm}/>
            <Route
              path="/loaded-stock-upload"
              component={LoadedStockUploadForm}
            />
            <Route
              path="/allotment_booking"
              component={StocksAllotmentSection}
            />
            <Route path="/mnr_edi_upload" component={MNREDIUpload} />
            <Route path="/master/carrier-code" component={CarrierCodeListing} />
            <Route
              path="/master/carrier-code-form"
              component={AddUpdateCarrierCode}
            />
            <Route path="/transport/creditor" component={CreditorListing} />
            <Route path="/transport/creditor-form" component={CreditorForm} />
            <Route path="/transport/account" component={AccountListing} />
            <Route path="/transport/account-form" component={AccountForm} />
            <Route path="/transport/purchase-form" component={PurchaseForm} />
            <Route path="/transport/purchase" component={PurchaseListing} />
            <Route path="/transport/booking" component={BookingLisitng} />
            <Route path="/transport/invoice-lr" component={InvoiceLrLisitng} />
            <Route
              path="/transport/invoice-lr-form"
              component={InvoiceLrForm}
            />
            <Route path="/transport/booking-form" component={BookingForm} />
            <Route
              path="/voucher/paymentreciept-form"
              component={PaymentRecieptForm}
            />
            <Route
              path="/voucher/contraentry-form"
              component={ContraEntryForm}
            />
            <Route
              path="/voucher/journalvoucher-form"
              component={JournalVoucherForm}
            />
            <Route path="/voucher/paymentreciept" component={PaymentReciept} />
            <Route path="/voucher/contraentry" component={ContraEntry} />
            <Route path="/voucher/journalvoucher" component={JournalVoucher} />
            <Route path="/transport/customer" component={CustomerListing} />
            <Route path="/transport/customer-form" component={CustomerForm} />
            <Route path="/transport/driver" component={Driver} />
            <Route path="/transport/driver-form" component={DriverForm} />
            <Route path="/transport/truck" component={Truck} />
            <Route path="/transport/truck-form" component={TruckForm} />
            <Route path="/transport/service" component={Service} />
            <Route path="/transport/service-form" component={ServiceForm} />
            <Route path="/master/client" component={ClientListing} />
            <Route path="/master/sealManagement" component={SealManagement} />
            <Route path="/seal-upload" component={SealUploadForm} />
            <Route path="/master/client-form" component={ClientMasterForm} />
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
            <Route
              path="/master/clientDocument"
              component={ClientDocumentListing}
            />
            <Route
              path="/master/client-document-form"
              component={AddClientDoc}
            />
            <Route
              path="/master/tariffDocument"
              component={TariffTypeListing}
            />
            <Route
              path="/master/tariff-document-form"
              component={AddTriffDoc}
            />
            <Route path="/master/staffMaster" component={StaffMasterListing} />
            <Route
              path="/master/staff-master-form"
              component={AddUpdateStaffMaster}
            />
            <Route path="/master/refcode" component={RefCodeListing} />
            <Route path="/master/refcode-form" component={AddUpdateRefCode} />
            <Route path="/master/country" component={CountryListing} />
            <Route path="/master/country-form" component={AddUpdateCountry} />
            <Route path="/master/location" component={LocationListing} />
            <Route path="/master/location-form" component={AddUpdateLocation} />
            <Route path="/master/site" component={SiteListing} />
            <Route exact path="/master/manager-management" component={Managermanagement}/>
            <Route exact path="/master/manager-management/:pk" component={AddManagerComponent}/>
            <Route path="/master/site-form" component={AddUpdateSite} />
            <Route path="/master/transporter" component={TransporterListing} />
            <Route
              path="/master/transporter-form"
              component={AddUpdateTransporter}
            />
            <Route
              path="/transport/reports"
              component={TransportationReports}
            />
            <Route
              path="/master/sealManagement-form"
              component={AddUpdateSealManagement}
            />
            <Route
              path="/master/containerSize"
              component={ContainerSizeListing}
            />
            <Route
              path="/master/container-size-form"
              component={AddUpdateContainerSize}
            />
            <Route
              path="/master/containerType"
              component={ContainerTypeListing}
            />
            <Route
              path="/master/container-type-form"
              component={AddUpdateContainerType}
            />
            <Route
              path="/master/containerTypeSizeCode"
              component={ContainerTypeSizeCodeListing}
            />
            <Route
              path="/master/container-type-size-code-form"
              component={AddUpdateContainerTypeSizeCode}
            />

            <Route
              path="/master/exportCargoType"
              component={ExportCargoTypeListing}
            />
            <Route
              path="/master/export-cargo-type-form"
              component={AddUpdateExportCargoType}
            />
            <Route
              path="/master/containerHandlingCharges"
              component={HandlingChargesListings}
            />
            <Route
              path="/master/container-handling-charge-form"
              component={AddUpdateContainerHandlingCharges}
            />
            <Route
              path="/master/containerTransportationCharges"
              component={TransportationChargesListings}
            />
            <Route
              path="/master/container-transportation-charge-form"
              component={AddUpdateContainerTransportationCharges}
            />
            <Route
              path="/master/containerGroundRentCharges"
              component={GroundRentListings}
            />
            <Route
              path="/master/container-ground-rent-charge-form"
              component={AddUpdateContainerGroundRentCharges}
            />
            <Route path="/master/vesselBkgNo" component={VesselBkgNoListings} />
            <Route
              path="/master/vessel-bkg-no-form"
              component={AddUpdateVesselBkgNoCharges}
            />
            <Route
              path="/master/vesselVoyageDetail"
              component={VesselVoyageDetailListings}
            />
            <Route
              path="/master/vessel-voyage-detail-form"
              component={AddUpdateVesselVoyageDetail}
            />
            <Route
              path="/master/locationCodeDetail"
              component={LocationCodeDetailListing}
            />
            <Route
              path="/master/location-code-detail-form"
              component={AddUpdateLocationCodeDetails}
            />

            <Route path="/account/role" component={RoleListings} />
            <Route path="/account/role-form" component={AddUpdateRole} />
            <Route path="/account/user" component={UserListings} />
            <Route path="/account/user-form" component={AddUpdateUser} />
            <Route path="/loader" component={Loader} />
            {/* Procurement */}
            <Route path="/procurement/tools" component={ToolRoom} />
            <Route path="/procurement/requesition" component={Request}></Route>
            <Route
              path="/procurement/addrequesition"
              component={RequestEdit}
            ></Route>
            <Route path="/procurement/consumption" component={Consumption} />
            <Route path="/procurement/upload" component={Bulkupload} />
            <Route path="/procurement/addconsumption" component={ConsumeEdit}/>
            <Route path="/procurement/reports" component={ProcurementReport}/>
            <Route path="/procurement/tool-transfer" component={ProcurementToolTransfer}/>
            <Route path="/procurement/tool-transfer-request" component={ProcurementToolTransferRequest}/>
            <Route path="/procurement/master-stock" component={ProcurementMasterStock}/>
            <Route path="/procurement/tool-rate-history" component={ProcurementToolRateHistory}/>
            <Route exact path="/depot/truck-turn-around" component={TruckTurnArroundPage}/>
            <Route exact path="/depot/truck-turn-around/:pk" component={TruckTrackingAdd}/>
          
            <Route exact path="/enBlock" component={ENBlockMovement}/>
            <Route exact path="/enBlock/bulk-upload" component={ENBlockMovementBulkUpload}/>
            <Route exact path="/enBlock-Pre-Gate-IN" component={ENBlockMovementPreGateIn}/>
            <Route exact path="/enBlock-Pre-Gate-IN/bulk-upload" component={EnBlockMovementPreGateInBulkUpload}/>
            <Route exact path="/manufacturing-logs" component={MnaufacturingLogsComponent}/>
            {/* THIS WILL REDIRECT TO DASHBOARD IF NO ROUTE MATCHES  */}
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
        </Router>
      </ThemeProvider>
    </Provider>
  );
}
export default App;
