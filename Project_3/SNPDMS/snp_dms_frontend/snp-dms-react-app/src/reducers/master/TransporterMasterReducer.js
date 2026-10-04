const initialState = {
  allTransporterListing: [],
  transporterDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_TRANSPORTERS":
      return { ...state, allTransporterListing: action.payload };

    case "GET_SINGLE_TRANSPORTER_DETAIL": {
      return { ...state, transporterDetails: action.payload };
    }
    case "CLEAN_TRANSPORTER_MASTER":
      return { ...state, transporterDetails: initialState.transporterDetails };

    default:
      return { ...state };
  }
};
