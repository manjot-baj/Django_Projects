export const NEWBILLING_REDUCER = {
  EDIT_REPAIR_NEW_BILLING_COLLECTION: "EDIT_REPAIR_NEW_BILLING_COLLECTION",
  EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT:
    "EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT",
  GET_ALL_MNR_HISTORY: "GET_ALL_MNR_HISTORY",
  EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT_BY_ID:
    "EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT_BY_ID",
  EDIT_REPAIR_NEW_BILLING_COLLECTION_BY_ID:
    "EDIT_REPAIR_NEW_BILLING_COLLECTION_BY_ID",
  EDIT_REPAIR_NEW_BILLING_INVOICE_NO: "EDIT_REPAIR_NEW_BILLING_INVOICE_NO",
};
const initialState = {
  allHandlingBillsNew: [],
  allNightChargesNew: [],
  allHandlingTransNew: [],
  allHandlingRepairNew: [],
  allCollectedInvoiceNew: [],
  invoiceHistoryByIDNew: [],
  allInvoiceHistoryNew: [],
  client: "",
  customer: "",
  container_no: "",
  bill_type: "",
  pg_no: "1",
  on_page_data: "10",
  ref_code: "",
  from_date: "",
  from_gate_out_date: "",
  to_gate_out_date: "",
  to_date: "",
  invoice_date: {
    from: "",
    to: "",
  },
  invoice_no: "",
  next_page: "someLink",
  prev_page: "someLink",
  total_pages: "",
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  child_pk: "",
  shipper_child_pk: "",
  client_name: "",
  type: "",
  billing_pk: "",
  apply_igst: "False",
  apply_gst:true,
  invoice_on_old_lolo_rate: false,
  total_amount: 0,
  place_of_supply: "",
  invoice_label: "",
  rec_amount: 0,
  from_supply_date: "",
  to_supply_date: "",
  bill_for_in: true,
  mnr_history: {
    pg_no: 1,
    on_page_data_edit: 5,
    no_of_data: 0,
    on_page_data: 5,
    total_pages: 1,
    prev_page: "",
    next_page: "",
    client: "",
    container_no: "",
    bill_type: "",
    invoice_date: {
      from: "",
      to: "",
    },
    invoice_no: "",
    data: [],
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO:
      return {
        ...state,
        allCollectedInvoiceNew: {
          ...state.allCollectedInvoiceNew,
          ...action.payload,
        },
      };
    case NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_BY_ID:
      return {
        ...state,
        invoiceHistoryByIDNew: {
          ...state.invoiceHistoryByIDNew,
          invoice_lines: state.invoiceHistoryByIDNew.invoice_lines.map(
            (val, index) => {
              if (action.payload.index === index) {
                let total_amount_after = Number(
                  (
                    val.total_amount -
                    (val.total_amount * action.payload.discount) / 100
                  ).toFixed(2),
                );
                return {
                  ...val,
                  discount: action.payload.discount,
                  total_amount_after_discount: total_amount_after,
                };
              }
              return val;
            },
          ),
        },
      };
    case NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT_BY_ID:
      return {
        ...state,
        invoiceHistoryByIDNew: {
          ...state.invoiceHistoryByIDNew,
          total_amount: state.invoiceHistoryByIDNew.invoice_lines.reduce(
            (a, c) => a + c.total_amount_after_discount,
            0,
          ),
        },
      };
    case NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY:
      return {
        ...state,
        mnr_history: {
          ...state.mnr_history,
          ...action.payload,
        },
      };
    case NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION:
      return {
        ...state,
        allCollectedInvoiceNew: {
          ...state.allCollectedInvoiceNew,
          invoice_lines: state.allCollectedInvoiceNew.invoice_lines.map(
            (val, index) => {
              if (action.payload.index === index) {
                let total_amount_after = Number(
                  (
                    val.total_amount -
                    (val.total_amount * action.payload.discount) / 100
                  ).toFixed(2),
                );
                return {
                  ...val,
                  discount: action.payload.discount,
                  total_amount_after_discount: total_amount_after,
                };
              }
              return val;
            },
          ),
        },
      };
    case NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT:
      return {
        ...state,
        allCollectedInvoiceNew: {
          ...state.allCollectedInvoiceNew,
          total_amount: state.allCollectedInvoiceNew.invoice_lines.reduce(
            (a, c) => a + c.total_amount_after_discount,
            0,
          ),
        },
      };
    case "GET_BILLING_CLIENT_NEW":
      return { ...state, client: action.payload };
    case "GET_BILLING_PK_NEW":
      return { ...state, billing_pk: action.payload };
    case "GET_HANDLING_BILLING_NEW":
      return { ...state, allHandlingBillsNew: action.payload };
    case "GET_NIGHT_CHARGES_NEW":
      return { ...state, allNightChargesNew: action.payload };
    case "GET_HANDLING_TRANS_NEW":
      return { ...state, allHandlingTransNew: action.payload };
    case "GET_HANDLING_REPAIR_NEW":
      return { ...state, allHandlingRepairNew: action.payload };
    case "COLLECT_HANDLING_INVOICE_NEW":
      return { ...state, allCollectedInvoiceNew: action.payload };
    case "GET_BILLING_CONTAINER_NO_NEW":
      return { ...state, container_no: action.payload };
    case "GET_BILLING_CUSTOMER_NO_NEW":
      return { ...state, customer: action.payload };
    case "GET_BILLING_FROM_SUPPLY_NEW":
      return { ...state, from_supply_date: action.payload };
    case "GET_BILLING_TO_SUPPLY_NEW":
      return { ...state, to_supply_date: action.payload };
    case "GET_BILLING_STATE_CODE_NEW":
      return { ...state, state_codes: action.payload };
    case "GET_BILLING_INVOICE_NO_NEW":
      return { ...state, invoice_no: action.payload };
    case "GET_BILLING_INVOICE_NO_LABEL":
      return { ...state, invoice_label: action.payload };
    case "GET_BILLING_BILL_TYPE_NEW":
      return { ...state, bill_type: action.payload };
    case "GET_BILLING_FROM_DATE_NEW":
      return { ...state, from_date: action.payload };
    case "GET_BILLING_TO_DATE_NEW":
      return { ...state, to_date: action.payload };
    case "GET_BILLING_FROM_GATE_OUT_DATE":
      return { ...state, from_gate_out_date: action.payload };
    case "GET_BILLING_TO_GATE_OUT_DATE":
      return { ...state, to_gate_out_date: action.payload };
    case "GET_BILLING_REF_CODE_NEW":
      return { ...state, ref_code: action.payload };
    case "GET_BILLING_TOTAL_AMT_NEW":
      return { ...state, total_amount: action.payload };
    case "GET_BILLING_BILL_FOR_NEW":
      return { ...state, bill_for_in: action.payload };
    case "UPDATE_BILLING_AMOUNT":
      return { ...state, total_amount: action.payload };
    case "CLEAR_BILLING_AMOUNT":
      return { ...state, total_amount: action.payload };

    case "GET_BILLING_NEW_INVOICE_DATE_FROM":
      return {
        ...state,
        invoice_date: { ...state.invoice_date, from: action.payload },
      };
    case "GET_BILLING_NEW_INVOICE_DATE_TO":
      return {
        ...state,
        invoice_date: { ...state.invoice_date, to: action.payload },
      };
    case "GET_BILLING_LOCATION_NEW":
      return {
        ...state,
        location: { ...state.location, location: action.payload },
      };
    case "GET_BILLING_SITE_NEW":
      return {
        ...state,
        site: { ...state.location, location: action.payload },
      };
    case "GET_NEW_BILLING_PAGE_NO":
      return { ...state, pg_no: action.payload };
    case "GET_NEW_BILLING_ON_PAGE_DATA":
      return { ...state, on_page_data: action.payload };
    case "GET_NEW_BILLING_NEXT_PAGE_LINK":
      return { ...state, next_page: action.payload };
    case "GET_NEW_BILLING_PREV_PAGE_LINK":
      return { ...state, prev_page: action.payload };
    case "GET_NEW_BILLING_TOTAL_PAGE_LINK":
      return { ...state, total_pages: action.payload };
    case "SET_CHILD_CLIENT_PK":
      return { ...state, child_pk: action.payload };
    case "SET_SHIPPER_CHILD_CLIENT_PK":
      return { ...state, shipper_child_pk: action.payload };
    case "CLEAR_CHILD_CLIENT_PK":
      return { ...state, child_pk: "" };
    case "CLEAR_SHIPPER_CHILD_CLIENT_PK":
      return { ...state, shipper_child_pk: "" };
    case "GET_INVOICE_HISTORY_BY_ID_NEW":
      return { ...state, invoiceHistoryByIDNew: action.payload };
    case "GET_INVOICE_HISTORY_NEW":
      return { ...state, allInvoiceHistoryNew: action.payload };
    case "CLEAR_INVOICE_HISTORY_NEW":
      return { ...state, allInvoiceHistoryNew: [] };
    case "CLEAR_HANDLING_INVOICE_NEW":
      return { ...state, allCollectedInvoiceNew: [] };
    case "CLEAR_INVOICE_HISTORY_BY_ID_NEW":
      return { ...state, invoiceHistoryByIDNew: [] };
    case "INVOICE_APPLY_IGST":
      return { ...state, apply_igst: action.payload };
    case "INVOICE_ON_OLD_LOLO_RATES":
      return { ...state, invoice_on_old_lolo_rate: action.payload };
    case "INVOICE_APPLY_GST":
      return {...state,apply_gst:action.payload}
    case "RESET_BILLING_NEW_DATA":
      return initialState;
    default:
      return { ...state };
  }
};
