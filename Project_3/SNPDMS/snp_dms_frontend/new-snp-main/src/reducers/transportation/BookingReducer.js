const initialState = {
  allBookingListing: [],
  bookingDetails: null,
  deleteBooking: false,
  cancleBookingEffect: null,
  check: [],
  is_draft: false,
  deleteDraftBooking: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_BOOKING":
      return { ...state, allBookingListing: action.payload };
    case "DELETE_DRAFT_BOOKING":
      return { ...state, deleteDraftBooking: action.payload ? true : false };
    case "DELETE_DRAFT_RESET":
      return { ...state, deleteDraftBooking: false };
    case "DELETE_BOOKING":
      return { ...state, deleteBooking: action.payload ? true : false };
    case "DELETE_BOOKING_RESET":
      return { ...state, deleteBooking: false };
    case "GET_BOOKING":
      return { ...state, bookingDetails: action.payload };
    case "CLEAR_BOOKING_DATA":
      return { ...state, bookingDetails: null };
    case "CANCEL_BOOKING_EFFECT":
      return { ...state, cancleBookingEffect: action.payload };
    case "BOOKING_DRAFT_CHECK":
      return { ...state, is_draft: action.payload };
    default:
      return { ...state };
  }
};
