import {
  CONTAINER_SEARCH,
  GET_DROPDOWN_VALUES,
  CLEAR_DROPDOWN_VALUES,
  TOGGLE_SELF_TRANSPORT,
} from "../actions/GateInActions";
import {
  SET_SHIPPING_LINE_MENU_ITEMS,
  MNR_CONTAINER_SEARCH,
  SET_GATE_IN_DATE_TIME,
} from "../actions/types";

const initialState = {
  containerSearchResult: "",
  nonDepotContainerSearchResult: "",
  allDropDown: null,
  shippingLineMenu: [],
  container_list:[],
  isSelfTransport: false,
  gateInStep: "Gate_in",
  gihPKOfContainer: false,
  showEDIModal: false,
  setTransport: true,
  setDateTime: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CONTAINER_SEARCH:
      return { ...state, containerSearchResult: action.payload };
    case MNR_CONTAINER_SEARCH:
      return { ...state, nonDepotContainerSearchResult: action.payload };
    case GET_DROPDOWN_VALUES:
      return { ...state, allDropDown: action.payload };
    case "GET_DROPDOWN_VALUES_SITE_LOCATION_ID":
      return {
        ...state,allDropDown : {...state.allDropDown,location_site_id_and_name:action.payload}
      }
    case CLEAR_DROPDOWN_VALUES:
      return { ...state, allDropDown: null };
    case SET_SHIPPING_LINE_MENU_ITEMS:
      return { ...state, shippingLineMenu: action.payload };
    case SET_GATE_IN_DATE_TIME:
      return { ...state, setDateTime: !state.setDateTime };
    case TOGGLE_SELF_TRANSPORT:
      return { ...state, isSelfTransport: action.payload };
    case "GATE_IN_CONTAINER_LIST":
      return {...state,container_list:action.payload}
    case "GATE_IN_STEP":
      return { ...state, gateInStep: action.payload };
    case "SET_GIH_PK":
      return { ...state, gihPKOfContainer: action.payload };
    case "TOGGLE_EDI_MODAL":
      return {
        ...state,
        showEDIModal: action.payload ? action.payload : !state.showEDIModal,
      };

    case "SET_DISABLE_TRANSPORTATION":
      return { ...state, setTransport: false };
    case "SET_ENABLE_TRANSPORTATION":
      return { ...state, setTransport: true };

    case "CLEAR_GATE_IN_REDUCER":
      return initialState;
    default:
      return { ...state };
  }
};
