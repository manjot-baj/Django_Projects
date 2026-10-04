const initialState = {
  masterData: null,
  entryNumberList: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_FORM_DEPENDENCY":
      return { ...state, masterData: action.payload };
      case "GET_ALL_ENTRY_NUMBER_DEPENDENCY":
        return { ...state, entryNumberList: action.payload };
   
    default:
      return { ...state };
  }
};
