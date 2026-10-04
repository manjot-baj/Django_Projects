export const USER_SUPPORT_CONST = {
  GET_ALL_TICKETS: "GET_ALL_TICKETS",
  GET_TICKET_DROPDOWN: "GET_TICKET_DROPDOWN",
  GET_SINGLE_TICKET: "GET_SINGLE_TICKET",
  GET_USER_SUPPORT_LOCATION_SITE:"GET_USER_SUPPORT_LOCATION_SITE"
};

const initialState = {
  ticket_listing: {
    pg_no: 1,
    on_page_data_client: 20,
    ticket_number: "",
    ticket_type: "",
    status: "",
    module_name: "",
    from_date: "",
    to_date: "",
    location:"",
    site:"",
    data: [],
  },
  ticket_dropdown: null,
  get_single_ticket: null,
  location_site:null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case USER_SUPPORT_CONST.GET_USER_SUPPORT_LOCATION_SITE:
      return {
        ...state,location_site:action.payload
      }
    case USER_SUPPORT_CONST.GET_SINGLE_TICKET:
      return { ...state, get_single_ticket: action.payload };
    case USER_SUPPORT_CONST.GET_TICKET_DROPDOWN:
      return {
        ...state,
        ticket_dropdown: action.payload,
      };
    case USER_SUPPORT_CONST.GET_ALL_TICKETS:
      return {
        ...state,
        ticket_listing: {
          ...state.ticket_listing,
          ...action.payload,
        },
      };
    default:
      return { ...state };
  }
};
