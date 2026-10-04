const initialState = {
  allHandlingChargesListing: [],
  containerHandlingChargeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_HANDLING_CHARGES":
      return { ...state, allHandlingChargesListing: action.payload };
     
    case "GET_SINGLE_CONTAINER_HANDLING_CHARGE_DETAIL": {
      return { ...state, containerHandlingChargeDetails: action.payload };
    }
    case "CLEAN_CONTAINER_HANDLING_CHARGE_MASTER":
      return {
        ...state,
        containerHandlingChargeDetails:
          initialState.containerHandlingChargeDetails,
      };
    default:
      return { ...state };
  }
};
