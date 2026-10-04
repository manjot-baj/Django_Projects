const initialState = {
  client: "",
  container_no: [],
  stage: "",
  status:"",
  from_date: "",
  to_date: "",
  ref_code: "",
  damage_code_n_condition:"",
  out_history: "False",
  pg_no: 1,
  on_page_data: 10,
  extractMnrData: [],
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  option:"",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_MNR_SEARCH_CONTAINER_NUMBER":
      var removeSpace = action.payload.replace(/ /g, "");
      var array = removeSpace.split(",");
      return { ...state, container_no: array };
    case "EXTRACT_MNR_DATA":
      return { ...state, extractMnrData: action.payload };
    case "SET_MNR_SEARCH_CLIENT_NAME":
      return { ...state, client: action.payload };
    case "SET_MNR_SEARCH_LOCATION":
      return { ...state, location: action.payload };
    case "SET_MNR_SEARCH_SITE":
      return { ...state, site: action.payload };
    case "SET_MNR_REF_CODE":
      return { ...state, ref_code: action.payload };
      case "SET_MNR_STAGE":
        return { ...state, damage_code_n_condition: action.payload };
    case "SET_MNR_SEARCH_STAGE":
      return { ...state, stage: action.payload };
      case "SET_MNR_SEARCH_STATUS":
        return { ...state, status: action.payload };
    case "SET_MNR_OPTION":
      return { ...state, option: action.payload };
    case "SET_MNR_SEARCH_FROM_DATE":
      return { ...state, from_date: action.payload };
    case "SET_MNR_SEARCH_TO_DATE":
      return { ...state, to_date: action.payload };
    case "SET_MNR_SEARCH_OUT_HISTORY":
      return { ...state, out_history: action.payload };
    case "TOGGLE_MNR_PAGE_NO_SEARCH_VALUE":
      return { ...state, pg_no: action.payload };
    case "TOGGLE_MNR_ON_PAGE_DATA_SEARCH_VALUE":
      return { ...state, on_page_data: action.payload };
    case "RESET_MNR_SEARCH_DATA":
      return initialState;
    default:
      return { ...state };
  }
};
