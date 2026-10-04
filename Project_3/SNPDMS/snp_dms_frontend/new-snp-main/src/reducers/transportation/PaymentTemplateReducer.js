const initialState = {
    paymentTemplateData: null,
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_PAYMENT_DATA":
        return { ...state, paymentTemplateData: action.payload };
      default:
        return { ...state };
    }
  };
  