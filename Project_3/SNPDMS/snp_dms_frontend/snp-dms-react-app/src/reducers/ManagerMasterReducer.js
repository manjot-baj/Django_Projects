export const MANAGER_MASTER_CONST ={
    GET_ALL_MANAGERS:"GET_ALL_MANAGERS",
    GET_SINGLE_MANAGER_DETAILS:"GET_SINGLE_MANAGER_DETAILS",
    CLEAN_MANAGER_MASTER:"CLEAN_MANAGER_MASTER"
}

const initialState = {
    allManagerListing: [],
    managerDetails: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case MANAGER_MASTER_CONST.GET_ALL_MANAGERS:
        return { ...state, allManagerListing: action.payload };
      case MANAGER_MASTER_CONST.GET_SINGLE_MANAGER_DETAILS: {
        return { ...state, managerDetails: action.payload };
      }
      case MANAGER_MASTER_CONST.CLEAN_MANAGER_MASTER:
        return { ...state, managerDetails: initialState.managerDetails };
      default:
        return { ...state };
    }
  };