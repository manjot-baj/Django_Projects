const initialState = {
    allDriverListing: [],
    deleteDriver: false,
    driverDetails: null,
    driverAdded: false,
    driverUpdated: false,
    check: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_DRIVERS":
        return { ...state, allDriverListing: action.payload };
      case "DELETE_DRIVER":
        return { ...state, deleteDriver: action.payload ? true : false };
        case "DELETE_DRIVER_RESET":
          return { ...state, deleteDriver: false };
      case "GET_DRIVER":
        return { ...state, driverDetails: action.payload };
      case "CLEAR_DRIVER_DATA":
        return { ...state, driverDetails: null };
      case "ADD_DRIVER":
        return { ...state, driverAdded: action.payload ? true : false };
      case "UPDATE_DRIVER":
        return { ...state, driverUpdated: action.payload ? true : false };
      default:
        return { ...state };
    }
  };