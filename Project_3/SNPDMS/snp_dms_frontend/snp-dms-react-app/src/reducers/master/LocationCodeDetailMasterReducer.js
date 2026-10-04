const initialState = {
  allLocationCodeDetailListing: [],
  locationCodeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_LOCATION_CODE_DETAIL":
      return { ...state, allLocationCodeDetailListing: action.payload };
    case "GET_SINGLE_LOCATION_CODE_DETAIL": {
      return { ...state, locationCodeDetails: action.payload };
    }
    case "CLEAN_LOCATION_CODE_DETAIL_MASTER":
      return {
        ...state,
        locationCodeDetails: initialState.locationCodeDetails,
      };
    default:
      return { ...state };
  }
};
