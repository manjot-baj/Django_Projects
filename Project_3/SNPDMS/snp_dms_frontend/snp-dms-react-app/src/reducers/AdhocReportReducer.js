export const ADHOC_REPORT_CONST = {
  GET_LISTING: "GET_LISTING",
  GET_LISTING_INIT: "GET_LISTING_INIT",
  CHANGE_STATUS:"CHANGE_STATUS",
  CHANGE_LOCATION:"CHANGE_LOCATION",
  CHANGE_SITE:"CHANGE_SITE",
  CHANGE_EMAIL_SENT:"CHANGE_EMAIL_SENT",
  CHANGE_REPORT_TYPE:"CHANGE_REPORT_TYPE",
  CHANGE_FROM_DATE:"CHANGE_FROM_DATE",
  CHANGE_TO_DATE:"CHANGE_TO_DATE"
};

const initialState = {
  from_date: "",
  to_date: "",
  report_type: null,
  status: null,
  email_sent: null,
  location: "ALL",
  site: "ALL",
  listing: [
    
  ],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADHOC_REPORT_CONST.GET_LISTING:
      return { ...state, listing: action.payload };
    case ADHOC_REPORT_CONST.GET_LISTING_INIT:
      return { ...state, listing: initialState.listing };
    case ADHOC_REPORT_CONST.CHANGE_STATUS:
      return {...state,status:action.payload}
    case ADHOC_REPORT_CONST.CHANGE_LOCATION:
      return {...state,location:action.payload}
    case ADHOC_REPORT_CONST.CHANGE_SITE:
      return {...state,site:action.payload}
    case ADHOC_REPORT_CONST.CHANGE_EMAIL_SENT:
      return {...state,email_sent:action.payload}
    case ADHOC_REPORT_CONST.CHANGE_REPORT_TYPE:
      return {...state,report_type:action.payload}
    case ADHOC_REPORT_CONST.CHANGE_FROM_DATE:
      return {...state,from_date:action.payload}
    case ADHOC_REPORT_CONST.CHANGE_TO_DATE:
      return {...state,to_date:action.payload}
    default:
      return { ...state };
  }
};
