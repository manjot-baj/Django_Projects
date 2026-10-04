const initialState = {
  allSiteListing: [],
  siteDetails: [],
  siteManager:[],
  managerDetail:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_SITES":
      return { ...state, allSiteListing: action.payload };
    case "GET_SINGLE_SITE_DETAIL": {
      return { ...state, siteDetails: action.payload };
    }
    case "GET_ALL_MANAGER":
      return {...state,siteManager:action.payload}
    case "GET_SINGLE_MANAGER":
      return {...state,managerDetail:action.payload}
    case "GET_SINGLE_MANAGER_INIT":
      return {...state,managerDetail:initialState.managerDetail}
    case "CLEAN_SITE_MASTER":
      return { ...state, siteDetails: initialState.siteDetails };
    default:
      return { ...state };
  }
};
