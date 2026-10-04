const initialState = {
  allGroundRentChargesListing: [],
  containerGroundRentChargeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_GROUND_RENT_CHARGES":
      return { ...state, allGroundRentChargesListing: action.payload };
    case "GET_SINGLE_CONTAINER_GROUND_RENT_CHARGE_DETAIL": {
      return { ...state, containerGroundRentChargeDetails: action.payload };
    }
    case "CLEAN_CONTAINER_GROUND_RENT_CHARGE_MASTER":
      return {
        ...state,
        containerGroundRentChargeDetails:
          initialState.containerGroundRentChargeDetails,
      };
    default:
      return { ...state };
  }
};
