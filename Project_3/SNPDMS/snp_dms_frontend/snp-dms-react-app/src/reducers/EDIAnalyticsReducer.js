import { short_months } from "../utils/Utils";

const initialState = {
  succesData : {
    data :null,
    loading :false,
    month:short_months(new Date()),
    line:"MSC",
    edi_type:"text"
  },
  backDated:{
    data :null,
    loading :false,
    month:short_months(new Date()),
    line:"MSC",
    edi_type:"text"
  },
  missingData:{
    data :null,
    loading :false,
    month:short_months(new Date()),
    line:"MSC",
    edi_type:"text"
  },
  moveCode:{
    data:null,
    loading:false,
    edi_type:"text",
    type:"Arrived",
    // month:short_months(new Date()),
    month:short_months(new Date()),
    process:"Factory",
    rowMoveCode:[
      "date",
      "MTIN",
      "DMG_MT",
      "REP_OUT_MT"
    ]
  }
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_SUCCESS_DATA":
        return { ...state, succesData: {...state.succesData,...action.payload} };
      case "GET_BACKDATED_DATA":
        return { ...state, backDated: {...state.backDated,...action.payload} };
      case "GET_MISSING_DATA":
        return { ...state, missingData: {...state.missingData,...action.payload} };
      case "GET_MOVE_CODE_DATA":
        return { ...state, moveCode: {...state.moveCode,...action.payload} };
      case "GET_SUCCESS_INITIAL":
        return {...state,succesData:{...initialState.succesData}}
      case "GET_BACK_INITIAL":
        return {...state,backDated:{...initialState.backDated}}
      case "GET_MISSING_INITIAL":
        return {...state,missingData:{...initialState.missingData}}
      case "GET_MOVE_CODE_INITIAL":
        return {...state,moveCode:{...initialState.moveCode}}
      default:
        return { ...state };
    }
  };
  