import { START_LOADING, STOP_LOADING } from "../actions/UIActions";

const initialState = {
  drawerOpen: true,
  isloading: false,
  depotGateType: "IN",
  billingType: "Handling",
  newBillingType: "Handling",
  errorMessage: "",
  isRequired: false,
  stocksSelectedbookingNumber: "",
  automationBookingType: "NEW BOOKING NUMBER",
  automationSelectedBookingNumber: "",
  loginFailed: false,
  loadedYardType:"IN",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "TOGGLE_DRAWER_OPEN":
      return { ...state, drawerOpen: action.payload };
    case START_LOADING:
      return { ...state, isloading: true };
    case STOP_LOADING:
      return { ...state, isloading: false };
    case "SET_DEPOT_GATE_TYPE":
      return { ...state, depotGateType: action.payload };
    case "SET_LOADED_YARD_TYPE":
      return { ...state, loadedYardType: action.payload };
    case "SET_AUTOMATION_BOOKING_TYPE":
      return { ...state, automationBookingType: action.payload };
    case "SET_BILLING_TYPE":
      return { ...state, billingType: action.payload };
    case "SET_NEW_BILLING_TYPE":
      return { ...state, newBillingType: action.payload };
    case "SET_ERROR_MSG":
      return { ...state, errorMessage: action.payload };
    case "LOGIN_FAILED":
      return { ...state, loginFailed: true };
    case "LOGIN_FAILED_RESET":
      return { ...state, loginFailed: false };
    case "SET_IS_REQUIRED":
      return { ...state, isRequired: action.payload };
    case "Add_STOCKS_SELECTED_BK_NUMBER":
      return { ...state, stocksSelectedbookingNumber: action.payload };
    case "Add_AUTOMATION_SELECTED_BK_NUMBER":
      return { ...state, automationSelectedBookingNumber: action.payload };
    case "REMOVE_STOCKS_SELECTED_BK_NUMBER":
      return { ...state, stocksSelectedbookingNumber: "" };
    default:
      return { ...state };
  }
};
