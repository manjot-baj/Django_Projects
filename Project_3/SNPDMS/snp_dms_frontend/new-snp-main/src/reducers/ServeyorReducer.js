export const SERVEY_REDUCER ={
    DATA_CHANGE : "DATA_CHANGE",
    TARIFF_CHANGE:"TARIFF_CHANGE",
    ADD_SERVEY_LINE:"ADD_SERVEY_LINE",
    ADD_TERIFF_DATA:"ADD_TERIFF_DATA",
    REMOVE_SERVEY_LINE:"REMOVE_SERVEY_LINE",
    INFORM_ADD:"INFORM_ADD",
    CONTAINERS_ADD:"CONTAINERS_ADD",
    INITIAL_SURVEY:"INITIAL_SURVEY"
}

const initialDate =()=>{
  var selectedDate = new Date();
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  return selectedDateFormat
}

const initialTime =()=>{
  var selectedDate = new Date();
  var hour = String(selectedDate.getHours()).padStart(2, "0");
  var minutes = String(selectedDate.getMinutes() + 1).padStart(2, "0"); //
  var selectedTimeFormat = hour + ":" + minutes;
  return selectedTimeFormat
}

const initialState = {
  data: {
    client: "",
    line: "",
    container_no: "",
    manufacturing_date: "",
    gate_in_date: initialDate(),
    survey_date: initialDate(),
    manufacturing_time: "12:00",
    gate_in_time: initialTime(),
    survey_time: initialTime(),
    type: "",
    size: "",
    tariff_id: "nothing",
    survey_by: null,
    gross_wt: 0,
    tare_wt: 0,
    survey_line: [],
    survey_name:"",
    arrived:""
  },
  tariff: {
    main_component: "",
    component_code:"",
    component_description: "",
    location_code:"",
    location_description: "",
    specific_location_code:"",
    specific_location_description: "",
    damage_code:"",
    damage_description: "",
    material_code:"",
    material_description: "",
    repair_code:"",
    repair_description: "",
    unit: "",
    measurement: "",
    length_and_width: "",
    quantity: "",
    remarks: "",
    tariff_code: ""
},
tariff_data:{

},
inform:null,
containers_list:null

};

export default (state = initialState, action) => {
  switch (action.type) {
    case SERVEY_REDUCER.DATA_CHANGE:
      return { ...state, data :{...state.data ,...action.payload} };
    case SERVEY_REDUCER.TARIFF_CHANGE:
      return { ...state, tariff :{...state.tariff ,...action.payload} };
    case SERVEY_REDUCER.ADD_SERVEY_LINE:
      return {...state,data:{...state.data,survey_line:[...state.data.survey_line,action.payload]}}
    case SERVEY_REDUCER.REMOVE_SERVEY_LINE:
      return {...state,data:{...state.data,servey_line:state.data.survey_line.splice(action.payload,1)}}
    case SERVEY_REDUCER.INFORM_ADD:
      return {...state,inform:action.payload}
    case SERVEY_REDUCER.ADD_TERIFF_DATA:
      return {...state,tariff_data:{...state.tariff_data,...action.payload}}
    case SERVEY_REDUCER.CONTAINERS_ADD:
      return {...state,containers_list:action.payload}
    case SERVEY_REDUCER.INITIAL_SURVEY:
      return {...state,data:initialState.data}
    default:
      return { ...state };
  }
};
