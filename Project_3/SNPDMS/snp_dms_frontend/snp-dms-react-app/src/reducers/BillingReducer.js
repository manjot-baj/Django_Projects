const initialState = {
  allHandlingBills: [],
  allTransportationBills: [],
  allGroundRentBills: [],
  allRepairBills: [],
  allCollectedInvoice: [],
  allInvoiceHistory: [],
  from:"",
  to:"",
  client:"",
  ref_code:[],
  container_no:"",
  billing_pk: "",
  invoiceHistoryByID: [],
  child_pk: "",
  shipper_child_pk: "",
  is_rejected: "False",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_HANDLING_BILLING":
      return { ...state, allHandlingBills: action.payload };
    case "GET_TRANSPORTATION_BILLING":
      return { ...state, allTransportationBills: action.payload };
    case "GET_GROUND_RENT_BILLING":
      return { ...state, allGroundRentBills: action.payload };
    case "GET_REPAIR_BILLING":
      return { ...state, allRepairBills: action.payload };
    case "COLLECT_HANDLING_INVOICE":
      return { ...state, allCollectedInvoice: action.payload };
    case "GET_BILLING_PK":
      return { ...state, billing_pk: action.payload };
    case "GET_INVOICE_HISTORY":
      return { ...state, allInvoiceHistory: action.payload };
    case "GET_INVOICE_HISTORY_BY_ID":
      return { ...state, invoiceHistoryByID: action.payload };
    case "CLEAR_INVOICE_HISTORY":
      return { ...state, allInvoiceHistory: [] };
    case "CLEAR_HANDLING_INVOICE":
      return { ...state, allCollectedInvoice: [] };
    case "CLEAR_INVOICE_HISTORY_BY_ID":
      return { ...state, invoiceHistoryByID: [] };
    case "SET_CHILD_CLIENT_PK":
      return { ...state, child_pk: action.payload };
    case "SET_SHIPPER_CHILD_CLIENT_PK":
      return { ...state, shipper_child_pk: action.payload };
    case "SET_BILLING_FROM_DATE":
      return { ...state, from: action.payload };
    case "SET_BILLING_TO_DATE":
      return { ...state, to: action.payload };
    case "SET_BILLING_CLIENT":
      return { ...state, client: action.payload };
      case "SET_BILLING_REF_CODE":
        return { ...state, ref_code: action.payload };
    case "SET_BILLING_CONTAINER":
      return { ...state, container_no: action.payload };
    case "SET_IS_REJECTED":
      return { ...state, is_rejected: action.payload };
    case "CLEAR_CHILD_CLIENT_PK":
      return { ...state, child_pk: "" };
    case "CLEAR_SHIPPER_CHILD_CLIENT_PK":
      return { ...state, shipper_child_pk: "" };
    default:
      return { ...state };
  }
};
