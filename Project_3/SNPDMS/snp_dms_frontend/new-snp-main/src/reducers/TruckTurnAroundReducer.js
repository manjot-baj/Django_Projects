export const TRUCK_TRACKING_CONST = {
  TRUCK_TRACKING_LISTING: "TRUCK_TRACKING_LISTING",
  TRUCK_TRACKING_LISTING_INIT: "TRUCK_TRACKING_LISTING_INIT",
  TRUCK_TRACKING_GET_DATA: "TRUCK_TRACKING_GET_DATA",
  TRUCK_TRACKING_GET_DATA_INIT: "TRUCK_TRACKING_GET_DATA_INIT",
  TRUCK_TRACKING_GATE_IN_DATA:"TRUCK_TRACKING_GATE_IN_DATA",
  TRUCK_TRACKING_GATE_IN_DATA_INIT:"TRUCK_TRACKING_GATE_IN_DATA_INIT",
  TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST:"TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST",
  TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST_INIT:"TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST_INIT",
  TRUCK_TRACKING_GATE_OUT_TRANSPORTER:"TRUCK_TRACKING_GATE_OUT_TRANSPORTER",
  TRUCK_TRACKING_GATE_OUT_TRANSPORTER_INIT:"TRUCK_TRACKING_GATE_OUT_TRANSPORTER_INIT"
};

const initialState = {
  truckListing: {
    on_page_data_client: 10,
    page_no: 1,
    line: "",
    type: "Loaded",
    transporter: "",
    container_no: "",
    no_of_data: "",
    on_page_data: "",
    total_pages: "",
    prev_page: "",
    next_page: "",
    data: [],
  },
  getTruck: null,
  getTruckGateInData :null,
  getTruckGateOutVehicleList:null,
  getGateOutTransporter:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING:
      return {
        ...state,
        truckListing: { ...state.truckListing, ...action.payload },
      };
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING_INIT:
      return { ...state, truckListing: {...initialState.truckListing,type:state.truckListing.type} };
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GET_DATA:
      return {...state,getTruck:action.payload}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GET_DATA_INIT:
      return {...state,getTruck:initialState.getTruck}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_IN_DATA:
      return {...state,getTruckGateInData:action.payload}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_IN_DATA_INIT:
      return {...state,getTruckGateInData:initialState.getTruckGateInData}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST:
      return {...state,getTruckGateOutVehicleList:action.payload}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST_INIT:
      return {...state,getTruckGateOutVehicleList:initialState.getTruckGateOutVehicleList}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_TRANSPORTER:
      return {...state,getGateOutTransporter:action.payload}
    case TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_TRANSPORTER_INIT:
      return {...state,getGateOutTransporter:initialState.getGateOutTransporter}
    default:
      return { ...state };
  }
};
