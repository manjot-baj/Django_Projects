const initialState = {
    allTruckListing: [],
    deleteTruck: false,
    truckDetails: null,
    truckAdded: false,
    truckUpdated: false,
    check: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_TRUCK":
        return { ...state, allTruckListing: action.payload };
      case "DELETE_TRUCK":
        return { ...state, deleteTruck: action.payload ? true : false };
        case "DELETE_TRUCK_RESET":
          return { ...state, deleteTruck: false };
      case "GET_TRUCK":
        return { ...state, truckDetails: action.payload };
      case "CLEAR_TRUCK_DATA":
        return { ...state, truckDetails: null };
      case "ADD_TRUCK":
        return { ...state, truckAdded: action.payload ? true : false };
      case "UPDATE_TRUCK":
        return { ...state, truckUpdated: action.payload ? true : false };
  
      default:
        return { ...state };
    }
  };