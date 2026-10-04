const initialState = {
    allContraListing: [],
    deleteContraData: false,
    contraDetails: null,
    contraAdded: false,
    contraUpdated: false,
    check: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_CONTRAS":
        return { ...state, allContraListing: action.payload };
      case "DELETE_CONTRA":
        return { ...state, deleteContraData: action.payload ? true : false };
      case "DELETE_CONTRA_RESET":
        return { ...state, deleteContraData: false };
      case "GET_CONTRA":
        return { ...state, contraDetails: action.payload };
      case "CLEAR_CONTRA_DATA":
        return { ...state, contraDetails: null };
      case "ADD_CONTRA":
        return { ...state, contraAdded: action.payload ? true : false };
      case "UPDATE_CONTRA":
        return { ...state, contraUpdated: action.payload ? true : false };
      default:
        return { ...state };
    }
  };