const initialState = {
  allAccountUserListing: [],
  accountUserDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ACCOUNT_USER":
      return { ...state, allAccountUserListing: action.payload };
    case "GET_SINGLE_ACCOUNT_USER_DETAIL": {
      return { ...state, accountUserDetails: action.payload };
    }
    case "CLEAN_ACCOUNT_USER_MASTER":
      return {
        ...state,
        accountUserDetails: initialState.accountUserDetails,
      };
    default:
      return { ...state };
  }
};
