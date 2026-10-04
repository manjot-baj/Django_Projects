import {
  handleDateCurrentUTILS,
  handleTimeCurentUTILS,
} from "../../utils/WeekNumbre";

export const ADVANCE_FINANCE_CONSTANT = {
  GET_ADVANCE_TABLE: "GET_ADVANCE_TABLE",
  GET_ADVANCE_TABLE_INIT: "GET_ADVANCE_TABLE_INIT",
  GET_ADVANCE_UPDATE: "GET_ADVANCE_UPDATE",
  GET_ADVANCE_UPDATE_INIT: "GET_ADVANCE_UPDATE_INIT",
  DO_SCAN_EDIT: "DO_SCAN_EDIT",
  DO_SCAN_EDIT_INT: "DO_SCAN_EDIT_INT",
  PRE_GATE_IN_EDIT: "PRE_GATE_IN_EDIT",
  PRE_GATE_IN_EDIT_NEW_ADD: "PRE_GATE_IN_EDIT_NEW_ADD",
  PRE_GATE_IN_EDIT_INIT: "PRE_GATE_IN_EDIT_INIT",
  PRE_GATE_IN_TABLE_EDIT: "PRE_GATE_IN_TABLE_EDIT",
  PRE_GATE_IN_TABLE_INIT: "PRE_GATE_IN_TABLE_INIT",
  PRE_GATE_IN_EXTRACT_DATA: "PRE_GATE_IN_EXTRACT_DATA",
  PRE_GATE_OUT_EDIT: "PRE_GATE_OUT_EDIT",
  PRE_GATE_OUT_EDIT_NEW_ADD: "PRE_GATE_OUT_EDIT_NEW_ADD",
  PRE_GATE_OUT_EDIT_INIT: "PRE_GATE_OUT_EDIT_INIT",
  PRE_GATE_OUT_TABLE: "PRE_GATE_OUT_TABLE",
  PRE_GATE_OUT_TABLE_INIT: "PRE_GATE_OUT_TABLE_INIT",
  PRE_GATE_IN_FETCH: "PRE_GATE_IN_FETCH",
  PRE_GATE_IN_FETCH_INIT: "PRE_GATE_IN_FETCH_INIT",
  PRE_GATE_OUT_FETCH: "PRE_GATE_OUT_FETCH",
  PRE_GATE_OUT_FETCH_INIT: "PRE_GATE_OUT_FETCH_INIT",
  PRE_GATE_IN_TABLE_ADVANCE_SEARCH: "PRE_GATE_IN_TABLE_ADVANCE_SEARCH",
  ADVANCE_FINANCE_PROCESS: "ADVANCE_FINANCE_PROCESS",
  ADVANCE_FINANCE_PROCESS_INIT: "ADVANCE_FINANCE_PROCESS_INIT",
  ADVANCE_LOLO_FINANCE_BULK_UPLOAD: "ADVANCE_LOLO_FINANCE_BULK_UPLOAD",
  ADVANCE_LOLO_FINANCE_SIZE_RATE_DATA:'ADVANCE_LOLO_FINANCE_SIZE_RATE_DATA'
};

const initialState = {
  preGateInFetch: null,
  preGateOutFetch: null,
  advanceProcess: null,
  extractData: {
    loading: false,
    data: null,
  },
  financeTable: {
    pg_no: 1,
    on_page_data_client: 5,
    client: "",
    entry_type: "IN",
    bl_no: "",
    bk_no: "",
    with_gst: true,
    payment_type: "",
    is_balance_pymt_adjusted: false,
    from_date: "",
    to_date: "",
    data: [],
    no_of_data: "",
    on_page_data: "",
    total_pages: "",
    prev_page: null,
    next_page: null,
  },
  requestData: {
    bl_no: "",
    bk_no: "",
    entry_type: "IN",
    payment_type: "Cash",
    client: "",
    cheque_no: "",
    utr_no: "",
    remarks:'',
    bank_name: "",
    account_name: "",
    account_no: "",
    transaction_id: "",
    size_20_quantity: 0,
    size_40_quantity: 0,
    tds: 1,
    original_amount: 0.0,
  },
  doScanEdit: {
    client: "",
    shipping_line_data: [],
    container_no: "",
    shipping_line: "",
    do_validity_in_date: handleDateCurrentUTILS(),
    do_validity_in_time: "23:59",
    consignee: null,
    shipper: null,
    bl_no: "",
    cargo: null,
    remarks: null,
    arrived: "",
  },
  preGateInEdit: {
    client: "",
    type: "",
    size: "",
    shipping_line_data: [],
    container_no: "",
    shipping_line: "",
    do_validity_in_date: handleDateCurrentUTILS(),
    do_validity_in_time: "23:59",
    consignee: null,
    shipper: null,
    bl_no: "",
    cargo: null,
    remarks: null,
    arrived: "",
  },
  preGateIntable: {
    pg_no: 1,
    on_page_data_client: 5,
    client: null,
    shipping_line: null,
    container_no: null,
    do_validity_date: {
      from_date: null,
      to_date: null,
    },
    on_hold: false,
    validity_expired: false,
    is_gatein_done: false,
    is_survey_done: false,
    no_of_data: "",
    on_page_data: "",
    total_pages: "",
    prev_page: null,
    next_page: null,
    data: [],
  },
  preGateOutEdit: {
    stock_id: "",
    container_no: "",
    client: "",
    shipping_line: "",
    manufacturing_date: "",
    type: "",
    size: "",
    do_validity_out_date: handleDateCurrentUTILS(),
    do_validity_out_time: "23:59",
    consignee: null,
    shipper: null,
    bk_no: "",
    cargo: null,
    remarks: null,
    departed: "",
  },
  preGateOutTable: {
    pg_no: 1,
    on_page_data_client: 5,
    client: null,
    shipping_line: null,
    container_no: null,
    do_validity_date: {
      from_date: null,
      to_date: null,
    },
    on_hold: false,
    validity_expired: false,
    is_gateout_done: false,
    no_of_data: "",
    on_page_data: "",
    total_pages: "",
    prev_page: null,
    next_page: null,
    data: [],
  },
  lolo_finance_extract_data: {},
  lolo_finance_size_rate_data:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADVANCE_FINANCE_CONSTANT.ADVANCE_LOLO_FINANCE_SIZE_RATE_DATA:
      return {
        ...state,
        lolo_finance_size_rate_data:action.payload
      }
    case ADVANCE_FINANCE_CONSTANT.ADVANCE_LOLO_FINANCE_BULK_UPLOAD:
      return {
        ...state,
        lolo_finance_extract_data: action.payload,
      };
    case ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT:
      return {
        ...state,
        doScanEdit: {
          ...state.doScanEdit,
          ...action.payload,
        },
      };
    case ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT_INT:
      return {
        ...state,
        doScanEdit: initialState.doScanEdit,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT_NEW_ADD:
      return {
        ...state,
        preGateOutEdit: {
          ...state.preGateOutEdit,
          newAdd: true,
          container_no: "",
        },
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_NEW_ADD:
      return {
        ...state,
        preGateInEdit: {
          ...state.preGateInEdit,
          type: "",
          size: "",
          container_no: "",
          newAdd: true,
        },
      };
    case ADVANCE_FINANCE_CONSTANT.ADVANCE_FINANCE_PROCESS_INIT:
      return {
        ...state,
        advanceProcess: initialState.advanceProcess,
      };
    case ADVANCE_FINANCE_CONSTANT.ADVANCE_FINANCE_PROCESS:
      return {
        ...state,
        advanceProcess: action.payload,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_ADVANCE_SEARCH:
      return {
        ...state,
        preGateIntable: {
          ...state.preGateIntable,
          do_validity_date: {
            ...state.preGateIntable.do_validity_date,
            ...action.payload,
          },
        },
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_FETCH:
      return {
        ...state,
        preGateOutFetch: action.payload,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_FETCH_INIT:
      return {
        ...state,
        preGateOutFetch: initialState.preGateOutFetch,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH:
      return {
        ...state,
        preGateInFetch: action.payload,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH_INIT:
      return {
        ...state,
        preGateInFetch: initialState.preGateInFetch,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT:
      return {
        ...state,
        preGateOutEdit: { ...state.preGateOutEdit, ...action.payload },
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT_INIT:
      return {
        ...state,
        preGateOutEdit: initialState.preGateOutEdit,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE:
      return {
        ...state,
        preGateOutTable: {
          ...state.preGateOutTable,
          ...action.payload,
        },
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE_INIT:
      return {
        ...state,
        preGateOutTable: initialState.preGateOutTable,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EXTRACT_DATA:
      return {
        ...state,
        extractData: {
          ...state.extractData,
          ...action.payload,
        },
      };
    case ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE:
      return {
        ...state,
        financeTable: { ...state.financeTable, ...action.payload },
      };
    case ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE_INIT:
      return {
        ...state,
        financeTable: initialState.financeTable,
      };
    case ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE:
      return {
        ...state,
        requestData: {
          ...state.requestData,
          ...action.payload,
        },
      };
    case ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE_INIT:
      return {
        ...state,
        requestData: initialState.requestData,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT:
      return {
        ...state,
        preGateInEdit: { ...state.preGateInEdit, ...action.payload },
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_INIT:
      return {
        ...state,
        preGateInEdit: initialState.preGateInEdit,
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT:
      return {
        ...state,
        preGateIntable: { ...state.preGateIntable, ...action.payload },
      };
    case ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_INIT:
      return {
        ...state,
        preGateIntable: initialState.preGateIntable,
      };
    default:
      return { ...state };
  }
};
