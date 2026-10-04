const initialState = {
  allVesselBkgNoListing: [],
  vesselBkgNoDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_VESSEL_BKG_NO":
      return { ...state, allVesselBkgNoListing: action.payload };
    case "GET_SINGLE_VESSEL_BKG_NO": {
      return { ...state, vesselBkgNoDetails: action.payload };
    }
    case "CLEAN_VESSEL_BKG_NO_MASTER":
      return { ...state, vesselBkgNoDetails: initialState.vesselBkgNoDetails };
    default:
      return { ...state };
  }
};
