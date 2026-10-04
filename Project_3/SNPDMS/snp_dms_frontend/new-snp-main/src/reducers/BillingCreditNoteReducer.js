import {
  handleGetCurrentDateCreditNoteUtils,
  handleGetCurrentDateUtils,
} from "../utils/WeekNumbre";

export const BILLING_CREDIT_NOTE_REDUCER = {
  CREDIT_NOTE_SEARCH: "CREDIT_NOTE_SEARCH",
  CREDIT_NOTE_SEARCH_INIT: "CREDIT_NOTE_SEARCH_INIT",
  CREDIT_NOTE_SELECTED: "CREDIT_NOTE_SELECTED",
  CREDIT_NOTE_SELECTED_REMOVE: "CREDIT_NOTE_SELECTED_REMOVE",
  CREDIT_NOTE_SELECTED_INIT: "CREDIT_NOTE_SELECTED_INIT",
  CREDIT_NOTE_HISTORY: "CREDIT_NOTE_HISTORY",
  CREDIT_NOTE_HISTORY_INIT: "CREDIT_NOTE_HISTORY_INIT",
  CREDIT_NOTE_INVOICE_EDIT: "CREDIT_NOTE_INVOICE_EDIT",
  CREDIT_NOTE_INVOICE_INIT: "CREDIT_NOTE_INVOICE_INIT",
  CREDIT_NOTE_INVOICE_EDIT_DATE: "CREDIT_NOTE_INVOICE_EDIT_DATE",
  CREDIT_NOTE_INVOICE_EDIT_NUMBER: "CREDIT_NOTE_INVOICE_EDIT_NUMBER",
  CREDIT_NOTE_INVOICE_EDIT_REMARK: "CREDIT_NOTE_INVOICE_EDIT_REMARK",
};
const initialState = {
  creditNoteSearch: {
    loading: false,
    data: null,
    bill_type: "Other",
    invoice_number: "",
  },
  creditNotSelected: [],
  creditNoteInvoice: {
    loading: false,
    data: {
      bill_to_party_client: "",
      ship_to_party_client: "",
      main_client: "",
      credit_note_no: "0000",
      bill_type: "",
      location: "",
      site: "",
      apply_igst: false,
      hsn_code: "",
      ref_booking_no: "",
      ref_bl_no: "",
      place_of_supply: "",
      supply_date: "",
      credit_note_date: handleGetCurrentDateCreditNoteUtils(),
      remark: "",
      total_amount: 0,
      discount: "0",
      credit_note_label: "",
      credit_note_lines: [],
      invoice_pk: "",
      pk_list: [],
    },
  },
  creditNoteHistoryList: {
    loading: false,
    credit_note_no: "",
    from_credit_note_date: "",
    to_credit_note_date: "",
    invoice_no:"",
    bill_type: "",
    on_page_data_client: 10,
    pg_no: 1,
    no_of_data: 1,
    on_page_data: 1,
    total_pages: 1,
    prev_page: "",
    next_page: "",
    data: [],
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY:
      return {
        ...state,
        creditNoteHistoryList: {
          ...state.creditNoteHistoryList,
          ...action.payload,
        },
      };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY_INIT:
      return {
        ...state,
        creditNoteHistoryList: initialState.creditNoteHistoryList,
      };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH:
      return {
        ...state,
        creditNoteSearch: { ...state.creditNoteSearch, ...action.payload },
      };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH_INIT:
      return { ...state, creditNoteSearch: initialState.creditNoteSearch };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT:
      return {
        ...state,
        creditNoteInvoice: { ...state.creditNoteInvoice, ...action.payload },
      };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_DATE:
      return {
        ...state,
        creditNoteInvoice: {
          ...state.creditNoteInvoice,
          data: {
            ...state.creditNoteInvoice.data,
            credit_note_date: action.payload,
          },
        },
      };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_NUMBER:
      return {
        ...state,
        creditNoteInvoice: {
          ...state.creditNoteInvoice,
          data: {
            ...state.creditNoteInvoice.data,
            credit_note_no: action.payload,
          },
        },
      };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_INIT:
      return { ...state, creditNoteInvoice: initialState.creditNoteInvoice };
    case BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT_REMARK:
      return {
        ...state,
        creditNoteInvoice: {
          ...state.creditNoteInvoice,
          data: { ...state.creditNoteInvoice.data, remark: action.payload },
        },
      };
    default:
      return { ...state };
  }
};
