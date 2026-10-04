import {
  // CONTAINER DETAILS
  SET_CLIENT,
  SET_TYPE,
  SET_CONTAINER_NUMBER,
  SET_SIZE,
  SET_PAYLOAD,
  SET_GROSS_WEIGHT,
  SET_TARE_WEIGHT,
  SET_MANUFACTURING_DATE,
  SET_SHIPPING_LINE,
  CLEAR_SHIPPING_LINE,
  SET_LEASED_BOX,
  SET_DO_NOT_LIFT,
  SET_GATE_IN_AUTO_MNR,
  RESET_GET_IN_CONTAINER,
  
} from "../actions/types";

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //
var yyyy = today.getFullYear();

var todayDate = yyyy + "-" + mm + "-" + dd;

const initialState = {
  // CONTAINER DETAILS
  client: "",
  type: "",
  container_no: "",
  size: "",
  payload: "",
  gross_wt: "0",
  tare_wt: "0",
  manufacturing_date:"",
  shipping_line: "",
  leased_box: "False",
  do_not_lift: "False",
  do_not_lift_remarks:"",
  automatic_mnr_status_change: localStorage.getItem(
    "automatic_mnr_status_change"
  )
    ? localStorage.getItem("automatic_mnr_status_change") === "true"
      ? "True"
      : "False"
    : null,
};

export default (state = initialState, action) => {
  switch (action.type) {

     case RESET_GET_IN_CONTAINER:
      return {
        ...state,
        client: "",
        type: "",
        container_no: "",
        size: "",
        payload: "",
        gross_wt: "0",
        tare_wt: "0",
        manufacturing_date: todayDate,
        shipping_line: "",
        leased_box: "False",
        do_not_lift: "False",
      };
    case "SET_GATE_IN_CONTAINER_DETAILS":
      return {...state,...action.payload}
    case SET_CLIENT:
      return { ...state, client: action.payload };
    case SET_TYPE:
      return { ...state, type: action.payload };
    case SET_CONTAINER_NUMBER:
      return { ...state, container_no: action.payload };
    case SET_SIZE:
      return { ...state, size: action.payload };
    case SET_PAYLOAD:
      return { ...state, payload: action.payload };
    case SET_GROSS_WEIGHT:
      return {
        ...state,
        gross_wt: action.payload,
        payload: (
          parseFloat(action.payload) - parseFloat(state.tare_wt)
        ).toString(),
      };
    case SET_TARE_WEIGHT:
      return {
        ...state,
        tare_wt: action.payload,
        payload: (
          parseFloat(state.gross_wt) - parseFloat(action.payload)
        ).toString(),
      };
    case SET_MANUFACTURING_DATE:
      return { ...state, manufacturing_date: action.payload };
    case SET_SHIPPING_LINE:
      return { ...state, shipping_line: action.payload };
    case CLEAR_SHIPPING_LINE:
      return { ...state, shipping_line: "" };
    case SET_LEASED_BOX:
      return { ...state, leased_box: action.payload };
    case SET_DO_NOT_LIFT:
      return { ...state, do_not_lift: action.payload };
    case SET_GATE_IN_AUTO_MNR:
      return { ...state, automatic_mnr_status_change: action.payload };
    case "SET_DO_NOT_LIFT_REMARKS":
      return { ...state, do_not_lift_remarks: action.payload };
    case "GATE_IN_CLEAR_CONTAINER_DETAILS_REDUCER":
      return initialState;

    default:
      return { ...state };
  }
};
