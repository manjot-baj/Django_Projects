const CUSTOM_REACT_TABLE_REDUCER={
    REACT_TABLE_EDIT:"REACT_TABLE_EDIT",
    REACT_TABLE_EDIT_INIT:"REACT_TABLE_EDIT_INIT"
}

const initialState = {
    data:[],
    on_page_data_client: 10,
    pg_no: 1,
    no_of_data: 1,
    on_page_data: 1,
    total_pages: 1,
    prev_page: "",
    next_page: "",
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case CUSTOM_REACT_TABLE_REDUCER.REACT_TABLE_EDIT:
        return { ...state, ...action.payload};
      case CUSTOM_REACT_TABLE_REDUCER.REACT_TABLE_EDIT_INIT:
        return initialState
      default:
        return { ...state };
    }
  };
  