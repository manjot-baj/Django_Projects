const initialState = {
  allCarrierCodeDetailListing: [],
  carrierCodeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_CARRIER_CODE":
      return { ...state, allCarrierCodeDetailListing: action.payload };
    case "GET_SINGLE_CARRIER_CODE_DETAIL": {
      return { ...state, carrierCodeDetails: action.payload };
    }
    case "CLEAN_CARRIER_CODE_DETAIL_MASTER":
      return {
        ...state,
        carrierCodeDetails: initialState.carrierCodeDetails,
      };
    default:
      return { ...state };
  }
};
