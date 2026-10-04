const initialState = {
  allVesselVoyageDetailListing: [],
  vesselVoyageDetail: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_VESSEL_VOYAGE_DETAIL":
      return { ...state, allVesselVoyageDetailListing: action.payload };
    case "GET_SINGLE_VESSEL_VOYAGE_DETAIL": {
      return { ...state, vesselVoyageDetail: action.payload };
    }
    case "CLEAN_VESSEL_VOYAGE_DETAIL_MASTER":
      return { ...state, vesselVoyageDetail: initialState.vesselVoyageDetail };
    default:
      return { ...state };
  }
};
