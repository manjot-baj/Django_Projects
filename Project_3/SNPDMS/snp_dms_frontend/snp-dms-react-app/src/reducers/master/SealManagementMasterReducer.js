const initialState = {
  allSealManangementListing: [],
  sealManagementDetails: [],
  extractSealData: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_SEALMANAGEMENT": //store all seal mana
      return { ...state, allSealManangementListing: action.payload };

    case "GET_SINGLE_SEALMANAGEMENT_DETAIL": {
      // get single seal
      return { ...state, sealManagementDetails: action.payload };
    }
    case "CLEAN_SEALMANAGEMENT_MASTER": // clear seal array
      return {
        ...state,
        sealManagementDetails: initialState.sealManagementDetails,
      };

    case "EXTRACT_SEAL_DATA":
      return { ...state, extractSealData: action.payload };

    default:
      return { ...state };
  }
};
