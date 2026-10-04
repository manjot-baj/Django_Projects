import {
  GET_LOLO_PAYMENT_SEARCH_RESULT,
  SET_SELECTED_LOLO_PAYMENT_SEARCH,
  GET_SELF_TRANSPORT_SEARCH_RESULT,
  SET_SELECTED_SELF_TRANSPORT_SEARCH,
} from "../actions/GateInActions";

const initialState = {
  // LOLO PAYMENT SEARCH
  loloPaymentSearchResult: null,
  loloSelectedCheque: null,

  // SELF TRANSPORT SEARCH
  selfTransportPaymentSearchResult: null,
  selfTransportPaymentSelectedCheque: null,

  // STOCKS BOOKING NUMBER
  stocksAndAllotmentBookingSearchResult: null,
  stocksAndAllotmentBookingSelectedNumber: null,

  //Automation Booking Number
  AutomationBookingSerachResult: null,
  AutomationBookingSelectNumber: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_LOLO_PAYMENT_SEARCH_RESULT:
      return { ...state, loloPaymentSearchResult: action.payload };
    case SET_SELECTED_LOLO_PAYMENT_SEARCH:
      return { ...state, loloSelectedCheque: action.payload };
    case "SET_SELECTED_LOLO_PAYMENT_SEARCH_INIT":
      return {...state,loloSelectedCheque:null}
    case GET_SELF_TRANSPORT_SEARCH_RESULT:
      return { ...state, selfTransportPaymentSearchResult: action.payload };
    case SET_SELECTED_SELF_TRANSPORT_SEARCH:
      return { ...state, selfTransportPaymentSelectedCheque: action.payload };
    case "GET_AUTOMATION_BOOKING_SEARCH_RESULTS":
      return { ...state, AutomationBookingSerachResult: action.payload };
    case "SET_AUTOMATION_BOOKING_NUMBER":
      return { ...state, AutomationBookingSelectNumber: action.payload };
    case "GET_STOCKS_ALLOTMENT_BOOKING_NUMBER":
      return {...state, stocksAndAllotmentBookingSearchResult: action.payload};
    case "SET_SELECTED_BOOKING_NUMBER":
      return { ...state, stocksAndAllotmentBookingSelectedNumber: action.payload};
    case "RESET_SEARCHED_CHEQUE":
      return initialState;
    default:
      return { ...state };
  }
};
