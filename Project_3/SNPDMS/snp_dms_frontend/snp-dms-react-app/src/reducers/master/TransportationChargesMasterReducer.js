const initialState = {
  allTransportationChargesListing: [],
  containerTransportationChargesDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_TRANSPORTATION_CHARGES":
      return { ...state, allTransportationChargesListing: action.payload };
    case "GET_SINGLE_CONTAINER_TRANSPORTATION_CHARGE_DETAIL": {
      return {
        ...state,
        containerTransportationChargesDetails: action.payload,
      };
    }
    case "CLEAN_CONTAINER_TRANSPORTATION_CHARGE_MASTER":
      return {
        ...state,
        containerTransportationChargesDetails:
          initialState.containerTransportationChargesDetails,
      };
    default:
      return { ...state };
  }
};
