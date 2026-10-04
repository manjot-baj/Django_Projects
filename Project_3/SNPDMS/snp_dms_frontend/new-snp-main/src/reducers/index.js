import { combineReducers } from "redux";
import UIReducer from "./UIReducer";
import UserReducer from "./UserReducer";
import AdvanceFinanceReducer from "./AdvanceFinance/AdvanceFinanceReducer";
import ServeyorReducer from "./ServeyorReducer";
import StocksAllotmentReducer from "./StockAllotmentReducer";
import DashboardReducer from "./DashboardReducer";
import GateInReducer from "./GateInReducer";
import AnalyticsReducer from "./AnalyticsReducer";
import NewBillingReducer from "./NewBillingReducer";
import AdhocReportReducer from "./AdhocReportReducer";
import AutomationAllotmentReducer from "./AutomationAllotmentReducer";
import SearchReducer from "./SearchReducer";
import AccountReducer from "./AccountReducer";
import CustomerReducer from "./CustomerReducer";
import MasterReducer from "./transportation/MasterReducer";
import CreditorReducer from "./transportation/CreditorReducer";
import DriverReducer from "../../../snp-dms-react-app/src/reducers/transportation/DriverReducer";
import TruckReducer from "./transportation/TruckReducer";
import ServiceReducer from "./transportation/ServiceReducer";
import BookingReducer from "./transportation/BookingReducer";
import PurchaseReducer from "./transportation/PurchaseReducer";
import InvoiceLrReducer from "./transportation/InvoiceLrReducer";
import PaymentReducer from "./transportation/PaymentReducer";
import ContraReducer from "./transportation/ContraReducer";
import JournalReducer from "./transportation/JournalReducer";
import CountryMasterReducer from "./master/CountryMasterReducer";
import ClientMasterReducer from "./master/ClientMasterReducer";
import LocationMasterReducer from "./master/LocationMasterReducer";
import SiteMasterReducer from "./master/SiteMasterReducer";
import SealManagementMasterReducer from "./master/SealManagementMasterReducer";
import SealManagementSearchReducer from "./master/SealManagementSearchReducer";
import StocksAndAllotmentSearchReducer from "./StocksAndAllotmentSearchReducer";
import StocksAndAllotmentReducer from "./StocksAndAllotmentReducer";
import RoleMasterReducer from "./admin/RoleMasterReducer";
import AccountUserMasterReducer from "./admin/AccountUserMasterReducer";
import ClientDocumentMasterReducer from "./master/ClientDocumentMasterReducer";
import RefCodeReducer from "./master/RefCodeReducer";
import TransporterMasterReducer from "./master/TransporterMasterReducer";
import ExportCargoTypeMasterReducer from "./master/ExportCargoTypeMasterReducer";
import CarrierCodeMasterReducer from "./master/CarrierCodeMasterReducer";
import ContainerSizeMasterReducer from "./master/ContainerSizeMasterReducer";
import ContainerTypeMasterReducer from "./master/ContainerTypeMasterReducer";
import ContainerTypeSizeCodeMasterReducer from "./master/ContainerTypeSizeCodeMasterReducer";
import HandlingChargesMasterReducer from "./master/HandlingChargesMasterReducer";
import TransportationChargesMasterReducer from "./master/TransportationChargesMasterReducer";
import GroundRentChargesMasterReducer from "./master/GroundRentChargesMasterReducer";
import VesselBkgNoMasterReducer from "./master/VesselBkgNoMasterReducer";
import VesselVoyageDetailMasterReducer from "./master/VesselVoyageDetailMasterReducer";
import LocationCodeDetailMasterReducer from "./master/LocationCodeDetailMasterReducer";
import TariffTypeMasterReducer from "./master/TariffTypeMasterReducer";
import StaffMassterReducer from "./master/StaffMassterReducer";
import ProcurementReducer from "./procurement/toolReducer";
import ProcurementRequestReducer from "./procurement/requesitionReducer";
import ProcurementConsumeReducer from "./procurement/consumptionReducer";
import toolTransferReducer from "./procurement/toolTransferReducer";
import LoadedYardReducer from "./LoadedYardReducer";
import loadedYardSearchReducer from "./loadedYardSearchReducer";
import BillingCreditNoteReducer from "./BillingCreditNoteReducer";
import TruckTurnAroundReducer from "./TruckTurnAroundReducer";
import EnBlockReducer from "./EnBlockReducer";
import WistimDestimS3Reducer from "./WistimDestimS3Reducer";
import WISTIMAnalysisReducer from "./WISTIMAnalysisReducer";
import EDIAnalyticsReducer from "./EDIAnalyticsReducer";
import MNRGridSearchReducer from "./MNRGridSearchReducer";
import MNRReducer from "./MNRReducer";
import MNREditFieldsReducer from "./MNREditFieldsReducer";
import MNRProcessReducer from "./MNRProcessReducer";
import RepairTabReducer from "./RepairTabReducer";
import GateInEditFieldsReducer from "./GateInEditFieldsReducer";
import GateInContainerDetailsFieldsReducer from "./GateInContainerDetailsReducer";
import GateOutEditFieldsReducer from "./gateOut/GateOutEditFieldsReducer";
import GateInDetailsFieldsReducer from "./GateInDetailsFieldsReducer";
import LOLOPaymentReducer from "./LOLOPaymentReducer";
import GateOutReducer from "./gateOut/GateOutReducer";
import GateInEIRDetailsFieldsReducer from "./GateInEIRDetailsFieldReducer";
import GateOutContainerDetailsReducer from "./gateOut/GateOutContainerDetailsReducer";
import GateOutDetailsReducer from "./gateOut/GateOutDetailsReducer";
import GateOutLoloPaymentReducer from "./gateOut/GateOutLoloPaymentReducer";
import SelfTransportationPaymentReducer from "./GateInSelfTransportationReducer";
import LoloReceiptReducer from "./LoloReceiptReducer";
import GateOutSelfTransportPaymentReducer from "./gateOut/GateOutSelfTransportPaymentReducer";
import GateOutHandlingPaymentReducer from "./gateOut/GateOutHandlingPaymentReducer";
import GateOutEIRReducer from "./gateOut/GateOutEIRReducer";
import WebSocketNotificationReducer from "./WebSocketNotificationReducer";
import LRCopyReducer from "./transportation/LRCopyReducer";
import InvoiceTemplateReducer from "./transportation/InvoiceTemplateReducer";
import PaymentTemplateReducer from "./transportation/PaymentTemplateReducer";
import ManufacturinglogsReducer from "./ManufacturinglogsReducer";
import HandlingAndSTPaymentReducer from "./HandlingAndSTPaymentReducer";
import LoloFinanceCustomerReducer from "./LOLOFinance/LoloFinanceCustomerReducer";
import MNRStaffAttendanceReducer from "./master/MNRStaffAttendanceReducer";
import UserSupportReducer from "./UserSupportReducer";
import AIAnalyticsReducer from "./AIAnalyticsReducer";
import FtpCredentialsReducer from "./FtpCredentialsReducer";
import AutomationClientOperationReducer from "./AutomationClientOperationReducer";
import MasterLineHandlingChargesReducer from "./master/MasterLineHandlingChargesReducer";
import MasterHandlingChargesHistoryReducer from "./master/MasterHandlingChargesHistoryReducer";

export default combineReducers({
  ui: UIReducer,
  user: UserReducer,
  ftpCredentialsReducer: FtpCredentialsReducer,
  AdvanceFinanceReducer: AdvanceFinanceReducer,
  ServeyorReducer: ServeyorReducer,
  stocksAllotment: StocksAllotmentReducer,
  dashboard: DashboardReducer,
  gateIn: GateInReducer,
  analytics: AnalyticsReducer,
  newBilling: NewBillingReducer,
  AdhocReportReducer: AdhocReportReducer,
  AutomationAllotment: AutomationAllotmentReducer,
  search: SearchReducer,
  accountMaster: AccountReducer,
  customerMaster: CustomerReducer,
  masterReducer: MasterReducer,
  creditorMaster: CreditorReducer,
  driverMaster: DriverReducer,
  truckMaster: TruckReducer,
  serviceMaster: ServiceReducer,
  bookingMaster: BookingReducer,
  purchaseMaster: PurchaseReducer,
  invoiceLrMaster: InvoiceLrReducer,
  paymentMaster: PaymentReducer,
  contraMaster: ContraReducer,
  journalMaster: JournalReducer,
  countryMaster: CountryMasterReducer,
  clientMaster: ClientMasterReducer,
  locationMaster: LocationMasterReducer,
  siteMaster: SiteMasterReducer,
  sealManagementMaster: SealManagementMasterReducer,
  sealManagementSearch: SealManagementSearchReducer,
  stocksAndAllotmentSearch: StocksAndAllotmentSearchReducer,
  stocksAndAllotment: StocksAndAllotmentReducer,
  roleMaster: RoleMasterReducer,
  accountUserMaster: AccountUserMasterReducer,
  clientDocMaster: ClientDocumentMasterReducer,
  refCode: RefCodeReducer,
  transporterMaster: TransporterMasterReducer,
  exportCargoTypeMaster: ExportCargoTypeMasterReducer,
  carrierCodeMaster: CarrierCodeMasterReducer,
  containerSizeMaster: ContainerSizeMasterReducer,
  containerTypeMaster: ContainerTypeMasterReducer,
  containerTypeSizeCodeMaster: ContainerTypeSizeCodeMasterReducer,
  handlingChargesMaster: HandlingChargesMasterReducer,
  transportationChargesMaster: TransportationChargesMasterReducer,
  groundRentChargesMaster: GroundRentChargesMasterReducer,
  vesselBkgNoMaster: VesselBkgNoMasterReducer,
  vesselVoyageDetailMaster: VesselVoyageDetailMasterReducer,
  locationCodeDetailMaster: LocationCodeDetailMasterReducer,
  tariff: TariffTypeMasterReducer,
  staffMaster: StaffMassterReducer,
  Procurement: ProcurementReducer,
  ProcurementRequest: ProcurementRequestReducer,
  ProcurementConsume: ProcurementConsumeReducer,
  toolTransferReducer: toolTransferReducer,
  loadedYard: LoadedYardReducer,
  loadedYardSearch: loadedYardSearchReducer,
  BillingCreditNoteReducer: BillingCreditNoteReducer,
  TruckTurnAroundReducer: TruckTurnAroundReducer,
  EnBlockReducer: EnBlockReducer,
  WistimDestimS3: WistimDestimS3Reducer,
  WISTIMAnalysisReducer: WISTIMAnalysisReducer,
  EDIAnalysisReducer: EDIAnalyticsReducer,
  MNRGridSearch: MNRGridSearchReducer,
  MNR: MNRReducer,
  MNREdit: MNREditFieldsReducer,
  MNRProcess: MNRProcessReducer,
  RepairTabReducer: RepairTabReducer,
  gateInEdit: GateInEditFieldsReducer,
  gateInContainerDetails: GateInContainerDetailsFieldsReducer,
  gateOutEdit: GateOutEditFieldsReducer,
  gateInDetails: GateInDetailsFieldsReducer,
  loloPayment: LOLOPaymentReducer,
  gateOut: GateOutReducer,
  gateInEirFields: GateInEIRDetailsFieldsReducer,
  gateOutContainerDetails: GateOutContainerDetailsReducer,
  gateOutDetails: GateOutDetailsReducer,
  gateOutLoloPayment: GateOutLoloPaymentReducer,
  selfTransportPayment: SelfTransportationPaymentReducer,
  loloReceipt: LoloReceiptReducer,
  gateOutSelfTransportPayment: GateOutSelfTransportPaymentReducer,
  gateOutPaymentReceipt: GateOutHandlingPaymentReducer,
  gateOutEIR: GateOutEIRReducer,
  WebSocketNotification: WebSocketNotificationReducer,
  lRMaster: LRCopyReducer,
  invoiceTemplate: InvoiceTemplateReducer,
  paymentTemplate: PaymentTemplateReducer,
  ManufacturinglogsReducer: ManufacturinglogsReducer,
  HandlingAndSTPaymentReducer: HandlingAndSTPaymentReducer,
  LoloFinanceCustomerReducer: LoloFinanceCustomerReducer,
  MNRStaffAttendanceReducer: MNRStaffAttendanceReducer,
  UserSupportReducer: UserSupportReducer,
  AIAnalyticsReducer: AIAnalyticsReducer,
  AutomationClientOperationReducer:AutomationClientOperationReducer,
  MasterLineHandlingChargesReducer:MasterLineHandlingChargesReducer,
  MasterHandlingChargesHistoryReducer:MasterHandlingChargesHistoryReducer
});
