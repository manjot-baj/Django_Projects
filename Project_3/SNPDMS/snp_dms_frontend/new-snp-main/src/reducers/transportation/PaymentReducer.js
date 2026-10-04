const initialState = {
    allPaymentListing: [],
    deletePayment: false,
    paymentDetails: null,
    paymentAdded: false,
    paymentUpdated: false,
    getPaymentLine:[],
    check: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_PAYMENTS":
        return { ...state, allPaymentListing: action.payload };
      case "DELETE_PAYMENT":
        return { ...state, deletePayment: action.payload ? true : false };
        case "DELETE_PAYMENT_RESET":
          return { ...state, deletePayment:false };
      case "GET_PAYMENT":
        return { ...state, paymentDetails: action.payload };
        case "GET_PAYMENT_LINE":
        return { ...state, getPaymentLine: action.payload };
      case "CLEAR_PAYMENT_DATA":
        return { ...state, paymentDetails: null };
      case "ADD_PAYMENT":
        return { ...state, paymentAdded: action.payload ? true : false };
      case "UPDATE_PAYMENT":
        return { ...state, paymentUpdated: action.payload ? true : false };
  
      default:
        return { ...state };
    }
  };