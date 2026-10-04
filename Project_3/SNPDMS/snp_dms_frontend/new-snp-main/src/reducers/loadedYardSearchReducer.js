const initialState = {
  container_no: "",
  size: "",
  in_date: {
    from: "",
    to: "",
  },
  out_date: {
    from: "",
    to: "",
  },
  history: "False",
  location: localStorage.getItem("location")
  ? localStorage.getItem("location")
  : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  pg_no: 1,
  booking_no: "",
  process_type: "",
  port: "",
  on_page_data_change: 10,
  next_page:"",
  prev_page:"",
  no_of_data:"",
  total_pages:"",
  on_page_data:"" ,
  yardListing:[],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "LOADEDYARD_PAGE_CHANGE":
      return {...state,...action.payload}
    case "LOADEDYARD_CONTAINER_NUMBER_SEARCH":
      return { ...state, container_no: action.payload };

    case "LOADEDYARD_SIZE_SEARCH":
      return { ...state, size: action.payload };

    case "LOADEDYARD_IN_FROM_DATE_SEARCH":
      return { ...state,  in_date: { ...state.in_date, from: action.payload } };

    case "LOADEDYARD_IN_TO_DATE_SEARCH":
      return { ...state,  in_date: { ...state.in_date, to: action.payload } };

    case "LOADEDYARD_OUT_FROM_DATE_SEARCH":
      return { ...state,  in_date: { ...state.out_date, from: action.payload } };

    case "LOADEDYARD_OUT_TO_DATE_SEARCH":
      return { ...state,  in_date: { ...state.out_date, to: action.payload } };
      
    case "LOADEDYARD_HISTORY_SEARCH":
      return { ...state, history: action.payload };

    case "TOGGLE_PAGE_NO_SEARCH_VALUE_YARD_SEARCH":
      return { ...state, pg_no: action.payload };

    case "TOGGLE_ON_PAGE_DATA_SEARCH_VALUE_YARD_SEARCH":
      return { ...state, on_page_data: action.payload };

    case "LOADEDYARD_PORT_SEARCH":
      return { ...state, port: action.payload };

    case "LOADEDYARD_PROCESSTYPE_SEARCH":
      return { ...state, process_type: action.payload };

    case "LOADEDYARD_BOOKING_NUMBER_SEARCH":
      return { ...state, booking_no: action.payload };

    case "RESET_YARD_SEARCH_DATA_SEARCH":
      return initialState;

    case "SET_STOCK_ALLOT_SEARCH_LOCATION":
        return {
          ...state,
          location: action.payload,
        };
    case "SET_STOCK_ALLOT_SEARCH_SITE":
        return {
          ...state,
          site: action.payload,
        };
      
    default:
      return { ...state };
  }
};
