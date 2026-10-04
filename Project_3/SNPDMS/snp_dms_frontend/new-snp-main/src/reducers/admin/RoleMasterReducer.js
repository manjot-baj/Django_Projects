const initialState = {
  allRoleListing: [],
  roleDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_ROLES":
      return { ...state, allRoleListing: action.payload };
    case "GET_SINGLE_ROLE_DETAIL": {
      return { ...state, roleDetails: action.payload };
    }
    case "CLEAN_ROLE_MASTER":
      return {
        ...state,
        roleDetails: initialState.roleDetails,
      };
    default:
      return { ...state };
  }
};
