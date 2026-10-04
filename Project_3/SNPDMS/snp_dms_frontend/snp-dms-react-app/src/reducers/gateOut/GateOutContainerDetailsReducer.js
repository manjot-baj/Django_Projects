import { SET_GATE_OUT_CONTAINER_DETAILS } from "../../actions/GateOutActions";

const initialState = {
  gateOutContainerDetails: {
    client: "",
    type: "",
    size: "",
    container_no: "",
    payload: "",
    gross_wt: "",
    tare_wt: "",
    manufacturing_date: "",
    shipping_line: "",
    leased_box: "False",
    do_not_lift_remarks:""
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_GATE_OUT_CONTAINER_DETAILS:
      return { ...state, gateOutContainerDetails: action.payload };
    case "SET_GATE_OUT_LEASED_BOX":
      var leasedBox = {
        ...state.gateOutContainerDetails,
        leased_box: action.payload,
      };
      return { ...state, gateOutContainerDetails: leasedBox };
    case "SET_GATE_OUT_DO_NOT_LIFT_REMARKS":
      var gateOutDoNotLiftRemarks = {
        ...state.gateOutContainerDetails,
        do_not_lift_remarks: action.payload,
      };
      return { ...state, gateOutContainerDetails: gateOutDoNotLiftRemarks };
    case "RESET_GATE_OUT_CONTAINER_DETAILS":
      return initialState;
    default:
      return { ...state };
  }
};
