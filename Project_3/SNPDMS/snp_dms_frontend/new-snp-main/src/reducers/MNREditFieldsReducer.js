import {
  EDIT_CONTAINER_NUMBER,
  EDIT_CONTAINER_SIZE,
  EDIT_CONTAINER_TYPE,
} from "../actions/types";

const initialState = {
  container_data: {
    pk: "",
    gate_in_pk: "",
    gate_out_pk: "",
    client: "",
    container_no: "",
    condition: "",
    grade: "",
    gross_wt: "",
    in_date: "",
    in_time: "",
    leased_box: "",
    manufacturing_date: "",
    out_date: "",
    out_time: "",
    payload: "",
    shipping_line: "",
    size: "",
    tare_wt: "",
    type: "",
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_MNR_CONTAINER_BY_DATE":
      return { ...state, container_data: action.payload };
    case "RESET_MNR_UPDATE_FORM":
      return initialState;
    case "EDIT_MNR_CLIENT_NAME":
      var clientName = {
        ...state.container_data,
        container_data: {
          ...state.container_data,
          client: action.payload,
        },
      };
      return { ...state, container_data: clientName };
    case EDIT_CONTAINER_NUMBER:
      var containerNumber = {
        ...state.container_data,
        container_data: {
          ...state.container_data.container_data,
          container_no: action.payload,
        },
      };
      return { ...state, container_data: containerNumber };
    case EDIT_CONTAINER_SIZE:
      var containerSize = {
        ...state.container_data,
        container_data: {
          ...state.container_data.container_data,
          size: action.payload,
        },
      };
      return { ...state, container_data: containerSize };
    case EDIT_CONTAINER_TYPE:
      var containerType = {
        ...state.container_data,
        container_data: {
          ...state.container_data.container_data,
          type: action.payload,
        },
      };
      return { ...state, container_data: containerType };

    default:
      return { ...state };
  }
};
