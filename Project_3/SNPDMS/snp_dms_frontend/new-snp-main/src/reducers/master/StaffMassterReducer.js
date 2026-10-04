const initialState = {
  allStaffMasterListing: [],
  staffMasterDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_STAFF_MASTER":
      return { ...state, allStaffMasterListing: action.payload };
    case "GET_SINGLE_STAFF_MASTER_DETAIL": {
      return { ...state, staffMasterDetails: action.payload };
    }
    case "CLEAN_STAFF_MASTER":
      return {
        ...state,   
        staffMasterDetails: initialState.staffMasterDetails,
      };
    default:
      return { ...state };
  }
};
