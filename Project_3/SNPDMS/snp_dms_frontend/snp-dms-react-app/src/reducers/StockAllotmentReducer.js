const initialState = {
  booking_date: "",
  validity_date: "",
  booking_no: "",
  booking_party: "",
  quantity: "",
  container_list: [],
  extractStockData: [],
  remarks: "",
  storeSeal:[],
  location: localStorage.getItem("location")
  ? localStorage.getItem("location")
  : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_ALLOTMENT_BOOKING_DATE":
      return { ...state, booking_date: action.payload };
    case "SET_ALLOTMENT_SEAL_NUMBER_LISTING":
        return { ...state, storeSeal: action.payload };
    case "SET_ALLOTMENT_VALIDITY_DATE":
      return { ...state, validity_date: action.payload };
    case "SET_ALLOTMENT_BOOKING_NUMBER":
      return { ...state, booking_no: action.payload };
    case "SET_ALLOTMENT_BOOKING_PARTY":
      return { ...state, booking_party: action.payload };
    case "SET_ALLOTMENT_QUANTITY":
      return { ...state, quantity: action.payload };
    case "SET_ALLOTMENT_REMARKS":
      return { ...state, remarks: action.payload };
    case "ADD_BOOKING_CONTAINERS":
      return { ...state, container_list: action.payload };
    case "EXTRACT_STOCK_DATA":
      return { ...state, extractStockData: action.payload };
    case "ADD_SELECTED_CONTAINER":
      return {
        ...state,
        container_list: [...state.container_list, action.payload],
      };
    case "SET_STOCK_ALLOT_LOCATION":
        return {
          ...state,
          location: action.payload,
        };
    case "SET_STOCK_ALLOT_SITE":
        return {
          ...state,
          site: action.payload,
        };
    case "REMOVE_SELECTED_CONTAINER":
      var remCont = [...state.container_list].filter(
        (contNo) => contNo !== action.payload
      );
      // remCont.splice(action.payload.index, 1);
      return { ...state, container_list: remCont };
    case "UPDATE_ALLOTMENT_BOOKING_DETAILS":
      return { ...action.payload };

    case "CLEANUP_STOCKS_ALLOTMENT_BOOKING_DETAILS":
      return initialState;
    default:
      return { ...state };
  }
};
