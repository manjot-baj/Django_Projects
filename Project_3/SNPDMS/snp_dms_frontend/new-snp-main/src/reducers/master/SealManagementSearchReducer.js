const initialState = {
  location: "",
  site: "",
  line: "",
  number: "",
  container_no: "",
  seal_box_number: "",
  is_available: true,
  is_damaged: false,
  is_cut: false,
  is_first_allotment: true,
  is_history: false,
  charge_type: "",
  in_date: { from: "", to: "" },
  out_date: { from: "", to: "" },
  in_use_date: { from: "", to: "" },
  pg_no: 1,
  on_page_data: 5,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_SEAL_MANAGEMENT_SEARCH_NUMBER":
      var removeSpace = action.payload.replace(/ /g, "");
      var array = removeSpace.split(",");
      return { ...state, number: array };
    case "SET_SEAL_MANAGEMENT_SEARCH_LINE":
      return { ...state, line: action.payload };
    case "SET_SEAL_MANAGEMENT_SEAL_BOX_NUMBER":
      return { ...state, seal_box_number: action.payload };
    case "SET_SEAL_MANAGEMENT_CONTAINER_NUMBER":
      return { ...state, container_no: action.payload };
    case "SET_BILLING_HISTORY_CHARGE_TYPE":
      return { ...state, charge_type: action.payload };
    case "SET_SEAL_MANAGEMENT_SEARCH_FROM_IN_DATE":
      return {
        ...state,
        in_date: { ...state.in_date, from: action.payload },
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_FROM_OUT_DATE":
      return {
        ...state,
        out_date: { ...state.out_date, from: action.payload },
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_TO_IN_DATE":
      return {
        ...state,
        in_date: { ...state.in_date, to: action.payload },
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_TO_OUT_DATE":
      return {
        ...state,
        out_date: { ...state.out_date, to: action.payload },
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_FROM_INUSE_DATE":
      return {
        ...state,
        in_use_date: { ...state.in_use_date, to: action.payload },
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_TO_INUSE_DATE":
      return {
        ...state,
        in_use_date: { ...state.in_use_date, to: action.payload },
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_LOCATION":
      return {
        ...state,
        location: action.payload,
      };
    case "SET_SEAL_MANAGEMENT_SEARCH_SITE":
      return {
        ...state,
        site: action.payload,
      };
    case "TOGGLE_SELF_SEAL_SEARCH_VALUE":
      return { ...state, is_history: action.payload };
    case "TOGGLE_FIRST_ALLOTMENT_SEAL_VALUE":
      return { ...state, is_first_allotment: action.payload };

    case "TOGGLE_CUT_SEAL_VALUE":
      return { ...state, is_cut: action.payload };

    case "TOGGLE_DAMAGED_SEAL_VALUE":
      return { ...state, is_damaged: action.payload };

    case "TOGGLE_AVAILABLE_SEAL_VALUE":
      return { ...state, is_available: action.payload };

    case "TOGGLE_PAGE_NO_SEARCH_VALUE":
      return { ...state, pg_no: action.payload };
    case "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE":
      return { ...state, on_page_data: action.payload };
    case "RESET_SEAL_DATA":
      return initialState;
    default:
      return { ...state };
  }
};
