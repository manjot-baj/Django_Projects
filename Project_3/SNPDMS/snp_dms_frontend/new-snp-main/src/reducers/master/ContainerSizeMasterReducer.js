const initialState = {
  allContainerSizeListing: [],
  containerSizeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_SIZE":
      return { ...state, allContainerSizeListing: action.payload };
    case "GET_SINGLE_CONTAINER_SIZE_DETAIL": {
      return { ...state, containerSizeDetails: action.payload };
    }
    case "CLEAN_CONTAINER_SIZE_MASTER":
      return {
        ...state,
        containerSizeDetails: initialState.containerSizeDetails,
      };
    default:
      return { ...state };
  }
};
