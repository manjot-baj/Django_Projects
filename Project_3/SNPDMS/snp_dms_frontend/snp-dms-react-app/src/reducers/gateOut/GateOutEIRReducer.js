// GateOutEIR
import {
  // EIR DETAILS
  GATE_OUT_SET_EIR_DATE,
  GATE_OUT_SET_EIR_TIME,
  GATE_OUT_SET_EIR_AMOUNT,
  GATE_OUT_SET_OFFLOAD_DATE,
  GATE_OUT_SET_OFFLOAD_TIME,
  GATE_OUT_SET_REPAIR_AMOUNT,
  GATE_OUT_SET_ADD_EIR_LINE,
  GATE_OUT_SET_REMOVE_EIR_LINE,
  GATE_OUT_SET_EIR_SHIPPING_LINE_DAMAGE_CODE,
  GATE_OUT_SET_EIR_SHIPPING_LINE_DESCRIPTION,
} from "../../actions/types";

// TODAYS DATE
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //
var yyyy = today.getFullYear();

var todayDate = yyyy + "-" + mm + "-" + dd;

// Todays time
var curr_hour = today.getHours();
var curr_min = today.getMinutes();
var todayTime = curr_hour + ":" + curr_min;

const initialState = {
  // EIR DETAILS
  eir_date: todayDate,
  eir_time: todayTime,
  eir_amount: "",
  offload_date: todayDate,
  offload_time: todayTime,
  repair_amount: "",
  eir_line: [],
  eir_img: "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    // EIR DETAILS
    case GATE_OUT_SET_EIR_DATE:
      return { ...state, eir_date: action.payload };
    case GATE_OUT_SET_EIR_TIME:
      return { ...state, eir_time: action.payload };
    case GATE_OUT_SET_EIR_AMOUNT:
      return { ...state, eir_amount: action.payload };
    case GATE_OUT_SET_OFFLOAD_DATE:
      return { ...state, offload_date: action.payload };
    case GATE_OUT_SET_OFFLOAD_TIME:
      return { ...state, offload_time: action.payload };
    case GATE_OUT_SET_REPAIR_AMOUNT:
      return { ...state, repair_amount: action.payload };
    case GATE_OUT_SET_ADD_EIR_LINE:
      let eirLine = [...state.eir_line, action.payload];
      return { ...state, eir_line: eirLine };
    case GATE_OUT_SET_REMOVE_EIR_LINE:
      let removeEir = [...state.eir_line].filter(
        (eirLine) => eirLine.grap_position !== action.payload.areaName
      );
      return { ...state, eir_line: removeEir };
    case GATE_OUT_SET_EIR_SHIPPING_LINE_DAMAGE_CODE:
      let eirDamage = [...state.eir_line];

      eirDamage[action.payload.index] = {
        ...eirDamage[action.payload.index],
        damage_code: action.payload.damageCode,
      };
      return { ...state, eir_line: eirDamage };
    case GATE_OUT_SET_EIR_SHIPPING_LINE_DESCRIPTION:
      let eirLineDesc = [...state.eir_line];
      eirLineDesc[action.payload.index] = {
        ...eirLineDesc[action.payload.index],
        description: action.payload.desc,
      };

      return { ...state, eir_line: eirLineDesc };
    case "GATE_OUT_SET_EIR_IMAGE_BASE64_STRING":
      return { ...state, eir_img: action.payload };
    default:
      return { ...state };
  }
};
