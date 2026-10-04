const initialState = {
  allClientDocListing: [],
  clientDocDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_CLIENT_DOCS":
      return { ...state, allClientDocListing: action.payload };
    case "GET_SINGLE_CLIENT_DOC": {
      return { ...state, clientDocDetails: action.payload };
    }
    case "CLEAN_CLIENT_DOC":
      return { ...state, clientDocDetails: initialState.clientDocDetails };  
    default:
      return { ...state };
  }
};
