const initialState = {
  allCustomerListing: [],
  deleteCutomer: false,
  customerDetails: null,
  customerAdded: false,
  customerUpdated: false,
  check: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_CUSTOMERS":
      return { ...state, allCustomerListing: action.payload };
    case "DELETE_CUSTOMER":
      return { ...state, deleteCutomer: action.payload ? true : false };
      case "DELETE_CUSTOMER_RESET":
        return { ...state, deleteCutomer: false };
    case "GET_CUSTOMER":
      return { ...state, customerDetails: action.payload };
    case "CLEAR_CUSTOMER_DATA":
      return { ...state, customerDetails: null };
    case "ADD_CUSTOMER":
      return { ...state, customerAdded: action.payload ? true : false };
    case "UPDATE_CUSTOMER":
      return { ...state, customerUpdated: action.payload ? true : false };

    default:
      return { ...state };
  }
};