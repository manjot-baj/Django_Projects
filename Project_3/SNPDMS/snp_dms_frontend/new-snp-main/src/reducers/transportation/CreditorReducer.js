const initialState = {
  allCreditorListing: [],
  deleteCreditor: false,
  creditorDetails: null,
  check: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_CREDITORS":
      return { ...state, allCreditorListing: action.payload };
    case "DELETE_CREDITOR":
      return { ...state, deleteCreditor: action.payload ? true : false };
      case "DELETE_CREDITOR_RESET":
        return { ...state, deleteCreditor: false };
    case "GET_CREDITOR":
      return { ...state, creditorDetails: action.payload };
    case "CLEAR_CREDITOR_DATA":
      return { ...state, creditorDetails: null };

    default:
      return { ...state };
  }
};
