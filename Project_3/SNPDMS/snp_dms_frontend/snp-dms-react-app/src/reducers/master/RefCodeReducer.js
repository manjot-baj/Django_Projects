const initialState = {
    allRefCodeListing: [],
    refcodeDetails: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_REF_CODE":
        return { ...state, allRefCodeListing: action.payload };
      case "GET_SINGLE_REF_CODE_DETAIL": {
        return { ...state, refcodeDetails: action.payload };
      }
      case "CLEAN_REF_CODE":
        return {
          ...state,
          refcodeDetails: initialState.refcodeDetails,
        };
      default:
        return { ...state };
    }
  };
  