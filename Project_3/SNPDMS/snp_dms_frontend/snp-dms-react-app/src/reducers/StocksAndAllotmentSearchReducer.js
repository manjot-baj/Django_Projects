const initialState = {
  itemListing: [],
  container_no: "",
  client: "",
  booking_no: "",
  status: "",
  ref_code: "",
  gate_in_date: { from: "", to: "" },
  gate_out_date: { from: "", to: "" },
  available_date: { from: "", to: "" },
  allotment_date: { from: "", to: "" },
  invoice_date: {from: "", to: ""},
  from:"",
  to:"",
  charge_type:"",
  out_history: "False",
  container_status:"OUT",
  do_not_lift_queue: "False",
  queued_recently:false,
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  pg_no: 1,
  sealno_list:[],
  on_page_data: 5,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_STOCK_ALLOT_SEARCH_CONTAINER_NUMBER":
      var removeSpace = action.payload.replace(/ /g, "");
      var array = removeSpace.split(",");
      return { ...state, container_no: array };

    case "SET_STOCK_ALLOT_SEARCH_CLIENT_NAME":
      return { ...state, client: action.payload };
      case "STOCK_ALLOTMENT_SEARCH_RESULT":
        return { ...state, itemListing: action.payload };
    case "SET_BILLING_HISTORY_CHARGE_TYPE":
      return { ...state, charge_type: action.payload };
      case "SET_BILLING_CONTAINER_STATUS":
        return { ...state, container_status: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_FROM_GATE_IN_DATE":
      return {
        ...state,
        gate_in_date: { ...state.gate_in_date, from: action.payload },
      };
    case "SET_STOCK_ALLOT_SEARCH_FROM_GATE_OUT_DATE":
      return {
        ...state,
        gate_out_date: { ...state.gate_out_date, from: action.payload },
      };
    case "SET_STOCK_ALLOT_SEARCH_TO_GATE_IN_DATE":
      return {
        ...state,
        gate_in_date: { ...state.gate_in_date, to: action.payload },
      };
      case "SELECT_SEAL_NUMBER":
        return { ...state, sealno_list: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_INVOICEFROM_DATE":
      return {
        ...state,
        invoice_date: { ...state.invoice_date, from: action.payload },
      };
    case "SET_STOCK_ALLOT_SEARCH_INVOICETO_DATE":
      return {
        ...state,
        invoice_date: { ...state.invoice_date, to: action.payload },
      };

    case "SET_STOCK_ALLOT_SEARCH_TO_GATE_OUT_DATE":
      return {
        ...state,
        gate_out_date: { ...state.gate_out_date, to: action.payload },
      };

    case "SET_STOCK_ALLOT_SEARCH_BOOKING_NUMBER":
      return {
        ...state,
        booking_no: action.payload,
      };
    case "SET_STOCK_ALLOT_SEARCH_FROM_AVAILABLE_DATE":
      return {
        ...state,
        available_date: { ...state.available_date, from: action.payload },
      };
    case "SET_STOCK_ALLOT_SEARCH_TO_AVAILABLE_DATE":
      return {
        ...state,
        available_date: { ...state.available_date, to: action.payload },
      };
    case "SET_STOCK_ALLOT_SEARCH_STATUS":
      return { ...state, status: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_REF_CODE":
      return { ...state, ref_code: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_FROMDATE":
      return { ...state, from: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_TODATE":
      return { ...state, to: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_FROM_ALLOTMENT_DATE":
      return {
        ...state,
        allotment_date: { ...state.allotment_date, from: action.payload },
      };
    case "SET_STOCK_ALLOT_SEARCH_TO_ALLOTMENT_DATE":
      return {
        ...state,
        allotment_date: { ...state.allotment_date, to: action.payload },
      };
    case "TOGGLE_SELF_STOCKS_SEARCH_VALUE":
      return { ...state, out_history: action.payload };
    case "TOGGLE_DO_NOT_LIFT_VALUE":
      return { ...state, do_not_lift_queue: action.payload };
    case "TOGGLE_QUEUED_RECENTLY":
      return { ...state, queued_recently: action.payload };
    case "SET_STOCK_ALLOT_SEARCH_LOCATION":
      return {
        ...state,
        location: action.payload,
      };
    case "SET_STOCK_ALLOT_SEARCH_SITE":
      return {
        ...state,
        site: action.payload,
      };
    case "TOGGLE_PAGE_NO_SEARCH_VALUE":
      return { ...state, pg_no: action.payload };
    case "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE":
      return { ...state, on_page_data: action.payload };
    case "RESET_STOCK_ALLOTMENT_DATA":
      return initialState;
    default:
      return { ...state };
  }
};
