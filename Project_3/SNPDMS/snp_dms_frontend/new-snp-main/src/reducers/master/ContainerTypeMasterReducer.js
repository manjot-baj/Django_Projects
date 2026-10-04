const initialState = {
  allContainerTypeListing: [],
  containerTypeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_TYPE":
      return { ...state, allContainerTypeListing: action.payload };
    case "GET_SINGLE_CONTAINER_TYPE_DETAIL": {
      return { ...state, containerTypeDetails: action.payload };
    }
    case "CLEAN_CONTAINER_TYPE_MASTER":
      return {
        ...state,
        containerTypeDetails: initialState.containerTypeDetails,
      };
    default:
      return { ...state };
  }
};
