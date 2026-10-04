const initialState = {
  allContainerTypeSizeCodeListing: [],
  containerTypeSizeCodeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_TYPE_SIZE_CODE":
      return { ...state, allContainerTypeSizeCodeListing: action.payload };
    case "GET_SINGLE_CONTAINER_TYPE_SIZE_CODE_DETAIL": {
      return { ...state, containerTypeSizeCodeDetails: action.payload };
    }
    case "CLEAN_CONTAINER_TYPE_SIZE_CODE_MASTER":
      return {
        ...state,
        containerTypeSizeCodeDetails: initialState.containerTypeSizeCodeDetails,
      };
    default:
      return { ...state };
  }
};
