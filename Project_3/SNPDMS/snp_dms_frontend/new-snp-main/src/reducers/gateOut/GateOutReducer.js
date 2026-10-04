import {
  GATE_OUT_CONTAINER_SEARCH,
  GET_GATE_OUT_LOLO_PAYMENT_SEARCH_RESULT,
  SET_SELECTED_GATE_OUT_LOLO_PAYMENT_SEARCH,
} from "../../actions/GateOutActions";

const initialState = {
  gateOutContainerSearchResult: "",
  gateOutLoloPaymentSearchResult: null,
  gateOutLoloSelectedCheque: null,
  isSelfTransport: false,
  gihPKOfContainer: null,
  gateOutStep: "Gate_out",
  setTransport: true,
  newGihPk: "",
  setDateTime: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GATE_OUT_CONTAINER_SEARCH:
      return { ...state, gateOutContainerSearchResult: action.payload };
    case GET_GATE_OUT_LOLO_PAYMENT_SEARCH_RESULT:
      return { ...state, gateOutLoloPaymentSearchResult: action.payload };
    case SET_SELECTED_GATE_OUT_LOLO_PAYMENT_SEARCH:
      return { ...state, gateOutLoloSelectedCheque: action.paylaod };
    case "TOGGLE_GATE_OUT_SELF_TRANSPORT":
      return { ...state, isSelfTransport: action.payload };
    case "SET_GATE_OUT_GIH_PK":
      return { ...state, gihPKOfContainer: action.payload };
    case "SET_GATE_OUT_DATE_TIME":
      return { ...state, setDateTime: !state.setDateTime };
    case "GATE_OUT_STEP":
      return { ...state, gateOutStep: action.payload };
    case "CLEAR_GATE_OUT_REDUCER":
      return initialState;
    case "SET_DISABLE_OUT_TRANSPORTATION":
      return { ...state, setTransport: false };
    case "SET_ENABLE_OUT_TRANSPORTATION":
      return { ...state, setTransport: true };
    case "SET_NEW_GIH_PK":
      return { ...state, newGihPk: action.payload };
    default:
      return { ...state };
  }
};
