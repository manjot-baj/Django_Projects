export const ADVANCE_FINANCE_CUSTOMER_ACCOUNT = {
  ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_BULK_UPLOAD:
    "ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_BULK_UPLOAD",
  ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING:
    "ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING",
  ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING_INIT:
    "ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING_INIT",
  SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT:
    "SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT",
  SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_INIT:
    "SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_INIT",
};

const initialState = {
  lolo_finance_customer_account_extract_data: {},
  get_single_customer_finance: null,
  lolo_finance_customer_account_list: {
    pg_no: 1,
    next_page: "",
    prev_page: "",
    data: [],
    total_pages: "",
    with_gst: true,
    client: "",
    edit_on_page_data: 5,
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADVANCE_FINANCE_CUSTOMER_ACCOUNT.SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_INIT:
      return {
        ...state,
        get_single_customer_finance: initialState.get_single_customer_finance,
      };
    case ADVANCE_FINANCE_CUSTOMER_ACCOUNT.SINGLE_ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT:
      return { ...state, get_single_customer_finance: action.payload };
    case ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING_INIT:
      return {
        ...state,
        lolo_finance_customer_account_list:
          initialState.lolo_finance_customer_account_list,
      };
    case ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING:
      return {
        ...state,
        lolo_finance_customer_account_list: {
          ...state.lolo_finance_customer_account_list,
          ...action.payload,
        },
      };
    case ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_BULK_UPLOAD:
      return {
        ...state,
        lolo_finance_customer_account_extract_data: action.payload,
      };
    default:
      return { ...state };
  }
};
