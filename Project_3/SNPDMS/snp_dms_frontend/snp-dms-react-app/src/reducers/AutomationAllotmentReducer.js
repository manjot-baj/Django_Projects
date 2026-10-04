const initialState = {
  booking_date: "",
  validity_date: "",
  booking_no: "",
  booking_party: "",
  quantity: "",
  container_list: [],
  remarks: "",
  master_name: "",
  name: "",
  method: "",
  movement: "",
  date: "",
  container_no:"",
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_AUTOMATION_BOOKING_DATE":
      return { ...state, booking_date: action.payload };
    case "SET_AUTOMATION_VALIDITY_DATE":
      return { ...state, validity_date: action.payload };
    case "SET_AUTOMATION_BOOKING_NUMBER":
      return { ...state, booking_no: action.payload };
    case "SET_AUTOMATION_BOOKING_PARTY":
      return { ...state, booking_party: action.payload };
    case "SET_AUTOMATION_QUANTITY":
      return { ...state, quantity: action.payload };
    case "SET_AUTOMATION_MASTER_NAME":
      return { ...state, master_name: action.payload };
    case "SET_AUTOMATION_NAME":
      return { ...state, name: action.payload };
    case "SET_AUTOMATION_METHOD":
      return { ...state, method: action.payload };
    case "SET_AUTOMATION_MOVEMENT":
      return { ...state, movement: action.payload };
    case "SET_AUTOMATION_CONTAINER":
      return { ...state, container_no: action.payload };
    case "SET_AUTOMATION_DATE":
      return { ...state, date: action.payload };
    case "SET_AUTOMATION_REMARKS":
      return { ...state, remarks: action.payload };
    case "ADD_AUTOMATION_BOOKING_CONTAINERS":
      var removeSpace = action.payload.replace(/ /g, "");
      var array = removeSpace.split(",");
      return { ...state, container_list: array };
    case "ADD_SELECTED_AUTOMATION_CONTAINER":
      return {
        ...state,
        container_list: [...state.container_list, action.payload],
      };
    case "SET_AUTOMATION_ALLOT_LOCATION":
      return {
        ...state,
        location: action.payload,
      };
    case "SET_AUTOMATION_SITE":
      return {
        ...state,
        site: action.payload,
      };
    case "REMOVE_AUTOMATION_SELECTED_CONTAINER":
      var remCont = [...state.container_list].filter(
        (contNo) => contNo !== action.payload
      );
      // remCont.splice(action.payload.index, 1);
      return { ...state, container_list: remCont };
    case "UPDATE_AUTOMATION_BOOKING_DETAILS":
      return { ...action.payload };

    case "CLEANUP_AUTOMATION_BOOKING_DETAILS":
      return initialState;
    default:
      return { ...state };
  }
};
