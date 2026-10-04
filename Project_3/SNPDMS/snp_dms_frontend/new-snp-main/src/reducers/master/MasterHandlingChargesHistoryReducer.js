export const MASTER_HANDLING_CHARGES_HISTORY = {
  MASTER_HANDLING_CHARGES_HISTORY_LIST: "MASTER_HANDLING_CHARGES_HISTORY_LIST",
  MASTER_HANDLING_CHARGES_HISTORY_LIST_INIT:
    "MASTER_HANDLING_CHARGES_HISTORY_LIST_INIT",
  MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS:
    "MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS",
  MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS_INIT:
    "MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS_INIT",
    MASTER_HANDLING_CHARGES_HISTORY_REF_CODE_DROPDOWN:"MASTER_HANDLING_CHARGES_HISTORY_REF_CODE_DROPDOWN"
};

const initialState = {
  allHandlingChargesHistoryListing: [],
  handlingChargesHistorySingleDetails: null,
  handlingChargesHistoryRefCodeDropDown:null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MASTER_HANDLING_CHARGES_HISTORY.MASTER_HANDLING_CHARGES_HISTORY_LIST:
      return { ...state, allHandlingChargesHistoryListing: action.payload };

    case MASTER_HANDLING_CHARGES_HISTORY.MASTER_HANDLING_CHARGES_HISTORY_LIST_INIT: {
      return {
        ...state,
        allHandlingChargesHistoryListing:
          initialState.allHandlingChargesHistoryListing,
      };
    }
    case MASTER_HANDLING_CHARGES_HISTORY.MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS:
      return {
        ...state,
        handlingChargesHistorySingleDetails: action.payload,
      };
    case MASTER_HANDLING_CHARGES_HISTORY.MASTER_HANDLING_CHARGES_HISTORY_SINGLE_DETAILS_INIT: {
      return {
        ...state,
        handlingChargesHistorySingleDetails:
          initialState.handlingChargesHistorySingleDetails,
      };
    }
    case MASTER_HANDLING_CHARGES_HISTORY.MASTER_HANDLING_CHARGES_HISTORY_REF_CODE_DROPDOWN:
      return {...state,handlingChargesHistoryRefCodeDropDown:action.payload}
    default:
      return { ...state };
  }
};
