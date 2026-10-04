import { combineReducers } from "redux";
// UI
import UIReducer from "./UIReducer";
import UserReducer from "./UserReducer";
import ResetFormReducer from "./ResetFormReducer";
import NotiReducer from "./Notifs";
//Search
import SearchReducer from "./SearchReducer";
// BILLING
import BillingReducer from "./BillingReducer";
// GATE IN
import GateInReducer from "./GateInReducer";
import GateInContainerDetailsFieldsReducer from "./GateInContainerDetailsReducer";
import GateInEIRDetailsFieldsReducer from "./GateInEIRDetailsFieldReducer";
import GateInDetailsFieldsReducer from "./GateInDetailsFieldsReducer";
import LOLOPaymentReducer from "./LOLOPaymentReducer";
import SelfTransportationPaymentReducer from "./GateInSelfTransportationReducer";
import GateInEditFieldsReducer from "./GateInEditFieldsReducer";
import loadedYardSearchReducer from "./loadedYardSearchReducer";
// LOLO RECEIPT
import LoloReceiptReducer from "./LoloReceiptReducer";

// GATE OUT
import GateOutReducer from "./gateOut/GateOutReducer";
import GateOutEIRReducer from "./gateOut/GateOutEIRReducer";
import GateOutContainerDetailsReducer from "./gateOut/GateOutContainerDetailsReducer";
import GateOutDetailsReducer from "./gateOut/GateOutDetailsReducer";
import GateOutLoloPaymentReducer from "./gateOut/GateOutLoloPaymentReducer";
import GateOutSelfTransportPaymentReducer from "./gateOut/GateOutSelfTransportPaymentReducer";
import GateOutEditFieldsReducer from "./gateOut/GateOutEditFieldsReducer";
import GateOutHandlingPaymentReducer from "./gateOut/GateOutHandlingPaymentReducer";

// STOCKS AND ALLOTMENT
import StocksAndAllotmentReducer from "./StocksAndAllotmentReducer";
import StocksAndAllotmentSearchReducer from "./StocksAndAllotmentSearchReducer";
import StocksAllotmentReducer from "./StockAllotmentReducer";

// DASHBOARD
import DashboardReducer from "./DashboardReducer";
import AnalyticsReducer from "./AnalyticsReducer";

//Transportation
import CustomerReducer from "./transportation/CustomerReducer";
import MasterReducer from "./transportation/MasterReducer";
import AccountReducer from "./transportation/AccountReducer";
import CreditorReducer from "./transportation/CreditorReducer";
import BookingReducer from "./transportation/BookingReducer";
import InvoiceLrReducer from "./transportation/InvoiceLrReducer";
import DriverReducer from "./transportation/DriverReducer";
import ContraReducer from "./transportation/ContraReducer";
import JournalReducer from "./transportation/JournalReducer";
import PaymentReducer from "./transportation/PaymentReducer";
import TruckReducer from "./transportation/TruckReducer";
import ServiceReducer from "./transportation/ServiceReducer";
import LRCopyReducer from "./transportation/LRCopyReducer";
import InvoiceTemplateReducer from "./transportation/InvoiceTemplateReducer";
import PurchaseReducer from "./transportation/PurchaseReducer";
import PaymentTemplateReducer from "./transportation/PaymentTemplateReducer";
import TransporationReportReducer from "./transportation/TransportationReportsReducers";

// MASTER
import CarrierCodeMasterReducer from "./master/CarrierCodeMasterReducer";
import ClientMasterReducer from "./master/ClientMasterReducer";
import ClientMasterBillingReducer from "./master/ClientMasterBillingReducer";
import ClientDocMasterReducer from "./master/ClientDocumentMasterReducer";
import CountryMasterReducer from "./master/CountryMasterReducer";
import LocationMasterReducer from "./master/LocationMasterReducer";
import SiteMasterReducer from "./master/SiteMasterReducer";
import TransporterMasterReducer from "./master/TransporterMasterReducer";
import ContainerSizeMasterReducer from "./master/ContainerSizeMasterReducer";
import ContainerTypeMasterReducer from "./master/ContainerTypeMasterReducer";
import ContainerTypeSizeCodeMasterReducer from "./master/ContainerTypeSizeCodeMasterReducer";
import ExportCargoTypeMasterReducer from "./master/ExportCargoTypeMasterReducer";
import HandlingChargesMasterReducer from "./master/HandlingChargesMasterReducer";
import TransportationChargesMasterReducer from "./master/TransportationChargesMasterReducer";
import GroundRentChargesMasterReducer from "./master/GroundRentChargesMasterReducer";
import VesselBkgNoMasterReducer from "./master/VesselBkgNoMasterReducer";
import VesselVoyageDetailMasterReducer from "./master/VesselVoyageDetailMasterReducer";
import LocationCodeDetailMasterReducer from "./master/LocationCodeDetailMasterReducer";
import NewBillingReducer from "./NewBillingReducer";
import RoleMasterReducer from "./admin/RoleMasterReducer";
import RefCodeReducer from "./master/RefCodeReducer";
import AccountUserMasterReducer from "./admin/AccountUserMasterReducer";
import StaffMassterReducer from "./master/StaffMassterReducer";
import SealManagementMasterReducer from "./master/SealManagementMasterReducer";
import SealManagementSearchReducer from "./master/SealManagementSearchReducer";

// MNR
import MNRGridSearchReducer from "./MNRGridSearchReducer";
import MNRReducer from "./MNRReducer";
import MNREditReducer from "./MNREditFieldsReducer";
import MNRProcessReducer from "./MNRProcessReducer";
import TariffTypeMasterReducer from "./master/TariffTypeMasterReducer";

import WistimDestimS3Reducer from "./WistimDestimS3Reducer";
import AutomationAllotmentReducer from "./AutomationAllotmentReducer";
import LoadedYardReducer from "./LoadedYardReducer";
import ProcurementReducer from "./procurement/toolReducer"
import ProcurementRequestReducer from "./procurement/requesitionReducer"
import ProcurementConsumeReducer from './procurement/consumptionReducer'
import RepairTabReducer from "./RepairTabReducer";
import ServeyorReducer from "./ServeyorReducer";

// Web Socket Notificatio 
import WebSocketNotification from "./WebSocketNotificationReducer";
import WebSocketNotificationReducer from "./WebSocketNotificationReducer";
import EDIAnalyticsReducer from "./EDIAnalyticsReducer";
import AdvanceFinanceReducer from "./AdvanceFinance/AdvanceFinanceReducer";
import toolTransferReducer from "./procurement/toolTransferReducer";
import WISTIMAnalysisReducer from "./WISTIMAnalysisReducer";
import BillingCreditNoteReducer from "./BillingCreditNoteReducer";
import CustomReactTableReducer from "./CustomReactTableReducer";
import TruckTurnAroundReducer from "./TruckTurnAroundReducer";
import EnBlockReducer from "./EnBlockReducer";
import ManagerMasterReducer from "./ManagerMasterReducer";
import AdhocReportReducer from "./AdhocReportReducer";
import ManufacturinglogsReducer from "./ManufacturinglogsReducer";

export default combineReducers({
  // UI
  notifs: NotiReducer,
  ui: UIReducer,
  user: UserReducer,
  resetForm: ResetFormReducer,
  // SEARCH REDUCER
  search: SearchReducer,
  //BILLING
  billing: BillingReducer,
  // GATE IN
  gateIn: GateInReducer,
  gateInEdit: GateInEditFieldsReducer,
  gateInContainerDetails: GateInContainerDetailsFieldsReducer,
  gateInEirFields: GateInEIRDetailsFieldsReducer,
  gateInDetails: GateInDetailsFieldsReducer,
  loloPayment: LOLOPaymentReducer,
  selfTransportPayment: SelfTransportationPaymentReducer,
  loloReceipt: LoloReceiptReducer,
  loadedYard: LoadedYardReducer,
  newBilling: NewBillingReducer,

  // GATE OUT

  gateOut: GateOutReducer,
  gateOutEdit: GateOutEditFieldsReducer,
  gateOutEIR: GateOutEIRReducer,
  gateOutContainerDetails: GateOutContainerDetailsReducer,
  gateOutDetails: GateOutDetailsReducer,
  gateOutLoloPayment: GateOutLoloPaymentReducer,
  gateOutSelfTransportPayment: GateOutSelfTransportPaymentReducer,
  gateOutPaymentReceipt: GateOutHandlingPaymentReducer,

  // STOCKS AND ALLOTMENT

  stocksAndAllotment: StocksAndAllotmentReducer,
  stocksAndAllotmentSearch: StocksAndAllotmentSearchReducer,
  stocksAllotment: StocksAllotmentReducer,
  AutomationAllotment: AutomationAllotmentReducer,

  // DASHBOARD
  dashboard: DashboardReducer,
  analytics: AnalyticsReducer,

  //Transportation
  customerMaster: CustomerReducer,
  masterReducer: MasterReducer,
  accountMaster: AccountReducer,
  tranpostationReports: TransporationReportReducer,
  creditorMaster: CreditorReducer,
  bookingMaster: BookingReducer,
  invoiceLrMaster: InvoiceLrReducer,
  driverMaster: DriverReducer,
  contraMaster: ContraReducer,
  journalMaster: JournalReducer,
  paymentMaster: PaymentReducer,
  truckMaster: TruckReducer,
  serviceMaster: ServiceReducer,
  lRMaster: LRCopyReducer,
  invoiceTemplate: InvoiceTemplateReducer,
  purchaseMaster: PurchaseReducer,
  paymentTemplate: PaymentTemplateReducer,
  // Master
  carrierCodeMaster: CarrierCodeMasterReducer,
  clientMaster: ClientMasterReducer,
  clientMasterBilling: ClientMasterBillingReducer,
  clientDocMaster: ClientDocMasterReducer,
  countryMaster: CountryMasterReducer,
  locationMaster: LocationMasterReducer,
  siteMaster: SiteMasterReducer,
  transporterMaster: TransporterMasterReducer,
  containerSizeMaster: ContainerSizeMasterReducer,
  containerTypeMaster: ContainerTypeMasterReducer,
  containerTypeSizeCodeMaster: ContainerTypeSizeCodeMasterReducer,
  exportCargoTypeMaster: ExportCargoTypeMasterReducer,
  handlingChargesMaster: HandlingChargesMasterReducer,
  transportationChargesMaster: TransportationChargesMasterReducer,
  groundRentChargesMaster: GroundRentChargesMasterReducer,
  vesselBkgNoMaster: VesselBkgNoMasterReducer,
  vesselVoyageDetailMaster: VesselVoyageDetailMasterReducer,
  locationCodeDetailMaster: LocationCodeDetailMasterReducer,
  staffMaster: StaffMassterReducer,
  sealManagementMaster: SealManagementMasterReducer, //listing
  tariff: TariffTypeMasterReducer,
  refCode: RefCodeReducer,
  loadedYardSearch: loadedYardSearchReducer,
  sealManagementSearch: SealManagementSearchReducer,

  // Admin
  roleMaster: RoleMasterReducer,

  accountUserMaster: AccountUserMasterReducer,

  //MNR
  MNRGridSearch: MNRGridSearchReducer,
  MNR: MNRReducer,
  MNREdit: MNREditReducer,
  MNRProcess: MNRProcessReducer,
  WistimDestimS3: WistimDestimS3Reducer,
  Procurement: ProcurementReducer,
  ProcurementRequest: ProcurementRequestReducer,
  ProcurementConsume: ProcurementConsumeReducer,
  WebSocketNotification: WebSocketNotificationReducer,
  RepairTabReducer: RepairTabReducer,
  ServeyorReducer: ServeyorReducer,
  EDIAnalysisReducer: EDIAnalyticsReducer,
  AdvanceFinanceReducer: AdvanceFinanceReducer,
  toolTransferReducer: toolTransferReducer,
  WISTIMAnalysisReducer: WISTIMAnalysisReducer,
  BillingCreditNoteReducer: BillingCreditNoteReducer,
  CustomReactTableReducer: CustomReactTableReducer,
  EnBlockReducer: EnBlockReducer,
  TruckTurnAroundReducer:TruckTurnAroundReducer,
  ManagerMasterReducer: ManagerMasterReducer,
  AdhocReportReducer: AdhocReportReducer,
  ManufacturinglogsReducer:ManufacturinglogsReducer
});
