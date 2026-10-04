import {
  GATE_OUT_DATE,
  GATE_OUT_TIME,
  GATE_OUT_CONDITION,
  GATE_OUT_GRADE,
  GATE_OUT_DEPARTED,
  GATE_OUT_CONSIGNEE,
  GATE_OUT_CUSTOMER,
  GATE_OUT_SHIPPER,
  GATE_OUT_DESTINATION,
  GATE_OUT_DELIVERY,
  GATE_OUT_TO_LOCATION,
  GATE_OUT_TO_PORT,
  GATE_OUT_VESSEL_NAME,
  GATE_OUT_VOYAGE_NUMBER,
  GATE_OUT_RO_REF,
  GATE_OUT_EXPORT_CARGO,
  GATE_OUT_TRANSPORTER_NAME,
  GATE_OUT_VEHICLE_NUMBER,
  GATE_OUT_DRIVER_NAME,
  GATE_OUT_DRIVER_MOBILE,
  GATE_OUT_DRIVER_LICENSE,
  GATE_OUT_CARRIER_CODE,
  GATE_OUT_LOCATION,
  GATE_OUT_PORT_OF_LOADING,
  GATE_OUT_PORT_OF_DISCHARGE,
  GATE_OUT_BOOKING_NUMBER,
  GATE_OUT_BOOKING_DATE,
  GATE_OUT_BOOKING_PARTY,
  GATE_OUT_SEAL_NUMBER,
  GATE_OUT_REMARKS,
  GATE_SEAL_NUMBER_LISITING,
  GATE_OUT_LICENSE_IMAGE,
  GATE_OUT_TO_DEPOT_CODE,
  GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE,
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
  out_date: todayDate,
  out_time: todayTime,
  condition: "",
  grade: "",
  departed: "",
  consignee: "",
  customer: "",
  shipper: "",
  destination: "",
  to_location_code: "",
  to_depot_code:"",
  road_rail_to_location_code:"",
  to_port_code: "",
  vessel_name: "",
  voyage_no: "",
  ro_ref: "",
  delivery: "",
  export_cargo: "",
  transporter_name: "",
  surveyor:'',
  vehicle_no: "",
  driver_name: "",
  driver_license: "",
  driver_mobile_no: "",
  carrier_code: "",
  location: "Gujarat",
  port_of_loading: "",
  port_of_discharge: "",
  booking_no: "",
  booking_date: todayDate,
  booking_party: "",
  image_url: "",
  seal_no: "",
  remarks: "",
  seal_number_listing: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_GATE_OUT_BOOKING_DETAILS":
      return {
        ...state,
        booking_date: action.payload.gate_out_data.booking_date,
        booking_no: action.payload.gate_out_data.booking_no,
        booking_party: action.payload.gate_out_data.booking_party,
        seal_no: action.payload.gate_out_data.seal_no,
        condition: action.payload.gate_out_data.condition,
        grade: action.payload.gate_out_data.grade,
        seal_number_listing: action.payload.gate_out_data.seal_no_list,
        consignee :action.payload.gate_out_data.consignee ??"",
        shipper :action.payload.gate_out_data.shipper ?? "",
        export_cargo :action.payload.gate_out_data.cargo ?? "",
        remarks:action.payload.gate_out_data.remarks ??"",
        departed:action.payload.gate_out_data.departed,
      };
    case GATE_OUT_DATE:
      return { ...state, out_date: action.payload };
    case GATE_OUT_TIME:
      return { ...state, out_time: action.payload };
    case GATE_OUT_CONDITION:
      return { ...state, condition: action.payload };
    case GATE_OUT_GRADE:
      return { ...state, grade: action.payload };
    case GATE_OUT_DEPARTED:
      return { ...state, departed: action.payload };
    case GATE_OUT_CONSIGNEE:
      return { ...state, consignee: action.payload };
    case GATE_OUT_CUSTOMER:
      return { ...state, customer: action.payload };
    case GATE_OUT_SHIPPER:
      return { ...state, shipper: action.payload };
    case GATE_OUT_DESTINATION:
      return { ...state, destination: action.payload };
    case "GATE_OUT_SURVEYED_BY":
      return {...state,surveyor:action.payload}
    case GATE_OUT_DELIVERY:
      return { ...state, delivery: action.payload };
    case GATE_OUT_TO_LOCATION:
      return { ...state, to_location_code: action.payload };
    case GATE_OUT_TO_PORT:
      return { ...state, to_port_code: action.payload };
    case GATE_OUT_VESSEL_NAME:
      return { ...state, vessel_name: action.payload };
    case GATE_OUT_LICENSE_IMAGE:
      return {
        ...state,
        image_url: action.payload,
      };
    case GATE_OUT_VOYAGE_NUMBER:
      return { ...state, voyage_no: action.payload };
    case GATE_OUT_RO_REF:
      return { ...state, ro_ref: action.payload };
    case GATE_OUT_EXPORT_CARGO:
      return { ...state, export_cargo: action.payload };
    case GATE_OUT_TRANSPORTER_NAME:
      return { ...state, transporter_name: action.payload };
    case GATE_OUT_VEHICLE_NUMBER:
      return { ...state, vehicle_no: action.payload };
    case GATE_OUT_DRIVER_NAME:
      return { ...state, driver_name: action.payload };
    case GATE_OUT_DRIVER_MOBILE:
      return { ...state, driver_mobile_no: action.payload };
    case GATE_OUT_DRIVER_LICENSE:
      return { ...state, driver_license: action.payload };
    case GATE_OUT_CARRIER_CODE:
      return { ...state, carrier_code: action.payload };
    case GATE_OUT_LOCATION:
      return { ...state, location: action.payload };
    case GATE_OUT_PORT_OF_LOADING:
      return { ...state, port_of_loading: action.payload };
    case GATE_OUT_PORT_OF_DISCHARGE:
      return { ...state, port_of_discharge: action.payload };
    case GATE_OUT_BOOKING_NUMBER:
      return { ...state, booking_no: action.payload };
    case GATE_OUT_BOOKING_DATE:
      return { ...state, booking_date: action.payload };
    case GATE_OUT_BOOKING_PARTY:
      return { ...state, booking_party: action.payload };
    case GATE_OUT_SEAL_NUMBER:
      return { ...state, seal_no: action.payload };
    case GATE_OUT_REMARKS:
      return { ...state, remarks: action.payload };
    case GATE_SEAL_NUMBER_LISITING:
      return { ...state, seal_number_listing: action.payload };
    case GATE_OUT_TO_DEPOT_CODE:
      return {...state, to_depot_code:action.payload};
    case GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE:
      return {...state , road_rail_to_location_code:action.payload}
    default:
      return { ...state };
  }
};
