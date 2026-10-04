const initialState = {
  allInvoiceLrListing: [],
  invoiceLrDetails: null,
  deleteInvoiceLr: false,
  billLineDetails: [],
  cancleInvoiceEffect: null,
  check: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_INVOICE_LR":
      return { ...state, allInvoiceLrListing: action.payload };
    case "DELETE_INVOICE_LR":
      return { ...state, deleteInvoiceLr: action.payload ? true : false };
      case "DELETE_INVOICE_LR_RESET":
        return { ...state, billLineDetails: [] };
    case "GET_INVOICE_LR":
      return { ...state, invoiceLrDetails: action.payload };
    case "GET_BILL_LINE":
      return { ...state, billLineDetails: action.payload.data };
    case "CLEAR_INVOICE_LR_DATA":
      return { ...state, invoiceLrDetails: null };
    case "CANCEL_INVOICE_EFFECT":
      return { ...state, cancleInvoiceEffect: action.payload };

    default:
      return { ...state };
  }
};
