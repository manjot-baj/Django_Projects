const initialState = {
  allAccountListing: [],
  deleteAccount: false,
  accountDetails: null,
  check: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_ACCOUNTS":
      return { ...state, allAccountListing: action.payload };
    case "DELETE_ACCOUNT":
      return { ...state, deleteAccount: action.payload ? true : false };
    case "DELETE_ACCOUNT_RESET":
      return { ...state, deleteAccount: false };
    case "GET_ACCOUNT":
      return { ...state, accountDetails: action.payload };
    case "CLEAR_ACCOUNT_DATA":
      return { ...state, accountDetails: null };

    default:
      return { ...state };
  }
};
