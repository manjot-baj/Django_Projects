const initialState = {
    lrTemplateData: null,
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_LR_TEMPLATE_DATA":
        return { ...state, lrTemplateData: action.payload };
     
      default:
        return { ...state };
    }
  };
  