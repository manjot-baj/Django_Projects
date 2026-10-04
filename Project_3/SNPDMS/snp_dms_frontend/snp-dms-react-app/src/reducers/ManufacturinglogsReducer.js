export const MANUFACTURING_CONST = {
  GET_LISTING: "GET_LISTING",
  GET_LISTING_INIT: "GET_LISTING_INIT",
};

const initialState = {
  container_no:"",
  on_page_data_edit:10,
  pg_no:1,
  next_page:"",
  prev_page:'',
  total_pages:"",
  data: [
    
  ],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MANUFACTURING_CONST.GET_LISTING:
      return { ...state,...action.payload};
    case MANUFACTURING_CONST.GET_LISTING_INIT:
      return initialState;
    default:
      return { ...state };
  }
};