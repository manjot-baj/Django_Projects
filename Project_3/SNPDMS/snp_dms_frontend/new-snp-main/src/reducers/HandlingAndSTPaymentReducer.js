export const HANDLING_ST_PAYMENT = {
  HANDLING_LIST: "HANDLING_LIST",
  HANDLING_LIST_INIT: "HANDLING_LIST_INIT",
  HANDLING_SINGLE_PAYMENT: "HANDLING_SINGLE_PAYMENT",
  HANDLING_SINGLE_PAYMENT_INIT: "HANDLING_SINGLE_PAYMENT_INIT",
  ST_SINGLE_PAYMENT:"ST_SINGLE_PAYMENT",
  ST_SINGLE_PAYMENT_INIT:"ST_SINGLE_PAYMENT_INIT",
  ST_LIST: "ST_LIST",
  ST_LIST_INIT: "ST_LIST_INIT",
};
const initialState = {
  payment_handling_list: {
    pg_no: 1,
    next_page: "",
    prev_page: "",
    data: [],
    total_pages: "",
    cheque_no: "",
    utr_no: "",
    container_no: "",
    edit_on_page_data: 10,
  },
  handling_payment_get: {
    pk: "",
    date: "",
    bank_name: "",
    account_name: "",
    account_no: "",
    cheque_no: "",
    utr_no: "",
    quantity: "",
    container: [],
    remaining: "",
    amount: "",
    original_amount: "",
  },
  payment_st_list: {
    pg_no: 1,
    next_page: "",
    prev_page: "",
    data: [],
    total_pages: "",
    edit_on_page_data: 10,
    cheque_no: "",
    utr_no: "",
    container_no: "",
  },
  st_payment_get:{
       pk: "",
    date: "",
    bank_name: "",
    account_name: "",
    account_no: "",
    cheque_no: "",
    utr_no: "",
    quantity: "",
    container: [],
    remaining: "",
    amount: "",
    original_amount: "",
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case HANDLING_ST_PAYMENT.ST_SINGLE_PAYMENT_INIT:
      return {...state,st_payment_get:initialState.st_payment_get}
    case HANDLING_ST_PAYMENT.ST_SINGLE_PAYMENT:
      return {...state,st_payment_get:{...state.st_payment_get,...action.payload}}
    case HANDLING_ST_PAYMENT.HANDLING_SINGLE_PAYMENT_INIT:
      return {
        ...state,
        handling_payment_get: initialState.handling_payment_get,
      };
    case HANDLING_ST_PAYMENT.HANDLING_SINGLE_PAYMENT:
      return {
        ...state,
        handling_payment_get: {
          ...state.handling_payment_get,
          ...action.payload,
        },
      };
    case HANDLING_ST_PAYMENT.HANDLING_LIST:
      return {
        ...state,
        payment_handling_list: {
          ...state.payment_handling_list,
          ...action.payload,
        },
      };
    case HANDLING_ST_PAYMENT.HANDLING_LIST_INIT:
      return {
        ...state,
        payment_handling_list: initialState.payment_handling_list,
      };
    case HANDLING_ST_PAYMENT.ST_LIST:
      return {
        ...state,
        payment_st_list: {
          ...state.payment_st_list,
          ...action.payload,
        },
      };
    case HANDLING_ST_PAYMENT.ST_LIST_INIT:
      return {
        ...state,
        payment_st_list: initialState.payment_st_list,
      };
    default:
      return { ...state };
  }
};
