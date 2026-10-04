import { short_months } from "../utils/Utils";

export const WISTIM_CONST ={
    WISTIM_ESTIMATE: "WISTIM_ESTIMATE",
    WISTIM_ESTIMATE_INIT:"WISTIM_ESTIMATE_INIT",
    DISTIM_REPAIR: "DISTIM_REPAIR",
    DISTIM_REPAIR_INIT:"DISTIM_REPAIR_INIT",
 
}

const initialState = {
  estimateWestim: {
    data: null,
    loading: false,
    month: short_months(new Date()),
    line: "MSC",
  },
  repairDistim: {
    data: null,
    loading: false,
    month: short_months(new Date()),
    line: "MSC",
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case WISTIM_CONST.WISTIM_ESTIMATE:
      return {
        ...state,
        estimateWestim: { ...state.estimateWestim, ...action.payload },
      };
    case WISTIM_CONST.WISTIM_ESTIMATE_INIT:
        return {
            ...state,estimateWestim : initialState.estimateWestim
        }
    case WISTIM_CONST.DISTIM_REPAIR:
        return {
            ...state,repairDistim:{...state.repairDistim,...action.payload}
        }
    case WISTIM_CONST.DISTIM_REPAIR_INIT:
        return {
            ...state,repairDistim: initialState.repairDistim
        }
    default:
      return { ...state };
  }
};
