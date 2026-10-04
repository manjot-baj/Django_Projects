export const REPAIR_REDUCER ={
    CONTAINERS_ADD:"CONTAINERS_ADD",
    DATA_CHANGE:"DATA_CHANGE",
    INITIAL_DATA:"INITIAL_DATA"
}

const initialState = {
  mnrProcessData:{
      container_no: "",
      line: "",
      size_type: "",
      in_date: "",
      condition: "",
      grade: "",
      man_power: [
      ]
    
  },
containers_list:null

};

export default (state = initialState, action) => {
  switch (action.type) {
    case REPAIR_REDUCER.CONTAINERS_ADD:
      return {...state,containers_list:action.payload}
    case REPAIR_REDUCER.DATA_CHANGE:
      return {...state,mnrProcessData:{...state.mnrProcessData,...action.payload}}
    case REPAIR_REDUCER.INITIAL_DATA:
      return {...state,mnrProcessData:initialState.mnrProcessData}
    default:
      return { ...state };
  }
};