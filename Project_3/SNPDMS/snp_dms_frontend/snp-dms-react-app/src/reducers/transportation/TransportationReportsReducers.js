const initialState = {
    allTransportationReports: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_TRANSAPORTATION_REPORTS":
        return { ...state, allTransportationReports: action.payload };
      default:
        return { ...state };
    }
  };
  