import {
  // GATE IN DETAILS
  SET_IN_DATE,
  SET_IN_TIME,
  SET_CONDITION,
  SET_GRADE,
  SET_ARRIVED,
  SET_CONSIGNOR,
  SET_CUSTOMER,
  SET_SHIPPER,
  SET_SOURCE,
  SET_FROM_LOCATION_CODE,
  SET_FROM_PORT_CODE,
  SET_VESSEL_NAME,
  SET_VOYAGE_NUMBER,
  SET_DO_REF,
  SET_IMPORT_CARGO,
  SET_EXPORT_CARGO_TYPE,
  SET_TRANSPORTER_NAME,
  SET_VEHICLE_NUMBER,
  SET_BL_NUMBER,
  SET_DRIVER_NAME,
  SET_DRIVER_MOBILE,
  SET_DRIVER_LICENSE_NUMBER,
  SET_CARRIER_CODE,
  SET_DRIVER_IMAGE,
  SET_LOCATION,
  SET_REMARK,
} from "../actions/types";

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
  // GATE IN DETAILS
  in_date: todayDate,
  in_time: todayTime,
  condition: "",
  grade: "",
  arrived: "",
  consignee: "",
  customer: "",
  shipper: "",
  source: "",
  from_location_code: "",
  from_port_code: "",
  vessel_name: "",
  voyage_no: "",
  do_ref: "",
  cargo: "",
  export_cargo_type: "",
  from_location_name_code:"",
  transporter_name: "",
  vehicle_no: "",
  surveyor:'',
  bl_no: "",
  driver_name: "",
  driver_license: "",
  driver_mobile_no: "",
  image_url:"",
  carrier_code: "",
  location: "",
  remarks: "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    //GATE IN DETAILS
    case "GATE_IN_SURVEYED_BY":
      return {...state,surveyor:action.payload}
    case SET_IN_DATE:
      return { ...state, in_date: action.payload };
    case "SET_IN_FROM_LOCATION_NAME_CODE":
      return { ...state, from_location_name_code: action.payload };
    case SET_IN_TIME:
      return { ...state, in_time: action.payload };
    case SET_CONDITION:
      return { ...state, condition: action.payload };
    case SET_GRADE:
      return { ...state, grade: action.payload };
    case SET_ARRIVED:
      return { ...state, arrived: action.payload };
    case SET_CONSIGNOR:
      return { ...state, consignee: action.payload };
    case SET_CUSTOMER:
      return { ...state, customer: action.payload };
    case SET_SHIPPER:
      return { ...state, shipper: action.payload };
    case SET_SOURCE:
      return { ...state, source: action.payload };
    case SET_FROM_LOCATION_CODE:
      return { ...state, from_location_code: action.payload };
    case SET_FROM_PORT_CODE:
      return { ...state, from_port_code: action.payload };
    case SET_VESSEL_NAME:
      return { ...state, vessel_name: action.payload };
    case SET_VOYAGE_NUMBER:
      return { ...state, voyage_no: action.payload };
    case SET_DO_REF:
      return { ...state, do_ref: action.payload };
    case SET_IMPORT_CARGO:
      return { ...state, cargo: action.payload };
    case SET_EXPORT_CARGO_TYPE:
      return { ...state, export_cargo_type: action.payload };
    case SET_TRANSPORTER_NAME:
      return { ...state, transporter_name: action.payload };
    case SET_VEHICLE_NUMBER:
      return { ...state, vehicle_no: action.payload };
    case SET_DRIVER_IMAGE:
      return  { ...state, image_url: action.payload };
    case SET_BL_NUMBER:
      return { ...state, bl_no: action.payload };
    case SET_DRIVER_NAME:
      return { ...state, driver_name: action.payload };
    case SET_DRIVER_MOBILE:
      return { ...state, driver_mobile_no: action.payload };
    case SET_DRIVER_LICENSE_NUMBER:
      return { ...state, driver_license: action.payload };
    case SET_CARRIER_CODE:
      return { ...state, carrier_code: action.payload };
    case SET_LOCATION:
      return { ...state, location: action.payload };
    case SET_REMARK:
      return { ...state, remarks: action.payload };
    case "GATE_IN_DETAILS_REDUCER":
      return initialState;
    default:
      return { ...state };
  }
};
