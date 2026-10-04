export const MASTER_LINE_HANDLING_CHARGES = {
  MASTER_LINE_HANDLING_CHARGES_LIST: "MASTER_LINE_HANDLING_CHARGES_LIST",
  MASTER_LINE_HANDLING_CHARGES_LIST_INIT:
    "MASTER_LINE_HANDLING_CHARGES_LIST_INIT",
  MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS:
    "MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS",
  MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS_INIT:
    "MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS_INIT",
    MASTER_LINE_HANDLING_CHARGES_REF_CODE_DROPDOWN:"MASTER_LINE_HANDLING_CHARGES_REF_CODE_DROPDOWN"
};

const initialState = {
  allLineHandlingChargesListing: [],
  lineHandlingChargesSingleDetails: null,
  lineHandlingChargesRefCodeDropDown:null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_LIST:
      return { ...state, allLineHandlingChargesListing: action.payload };

    case MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_LIST_INIT: {
      return {
        ...state,
        allLineHandlingChargesListing:
          initialState.allLineHandlingChargesListing,
      };
    }
    case MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS:
      return {
        ...state,
        lineHandlingChargesSingleDetails: action.payload,
      };
    case MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS_INIT: {
      return {
        ...state,
        lineHandlingChargesSingleDetails:
          initialState.lineHandlingChargesSingleDetails,
      };
    }
    case MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_REF_CODE_DROPDOWN:
      return {...state,lineHandlingChargesRefCodeDropDown:action.payload}
    default:
      return { ...state };
  }
};
