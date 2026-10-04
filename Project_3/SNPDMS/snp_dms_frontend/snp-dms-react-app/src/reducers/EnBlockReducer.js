export const ENBLOCK_REDUCER_CONST = {
  EN_BLOCK_REDUCER_LISTING: "EN_BLOCK_REDUCER_LISTING",
  EN_BLOCK_REDUCER_LISTING_INIT: "EN_BLOCK_REDUCER_LISTING_INIT",
  EN_BLOCK_PRE_GATE_IN_LISTING:"EN_BLOCK_PRE_GATE_IN_LISTING",
  EN_BLOCK_PRE_GATE_IN_LISTING_INIT:"EN_BLOCK_PRE_GATE_IN_LISTING_INIT",
  EN_BLOCK_EDIT:"EN_BLOCK_EDIT",
  EN_BLOCK_EDIT_INIT:"EN_BLOCK_EDIT_INIT",
  EN_BLOCK_EXTRACT_DATA:"EN_BLOCK_EXTRACT_DATA",
  EN_BLOCK_VESSEL_VOYAGE_NAME:"EN_BLOCK_VESSEL_VOYAGE_NAME",
  EN_BLOCK_VESSEL_VOYAGE_NAME_INIT:"EN_BLOCK_VESSEL_VOYAGE_NAME_INIT",
  EN_BLOCK_PRE_GATE_IN_EXTRACT:"EN_BLOCK_PRE_GATE_IN_EXTRACT"
};

const initialState = {
  enBlockListing: {
    page_no: 1,
    on_page_data: 10,
    on_page_data_client: 10,
    vessel_no: "",
    voyage_no: "",
    job_order_no: "",
    no_of_data: 1,
    total_pages: 1,
    prev_page: "",
    next_page: "",
    data: [
    
    ],
  },
  enBlockPreGateInListing: {
    page_no: 1,
    on_page_data: 10,
    on_page_data_client: 10,
    container_no:"",
    vessel_name: "",
    status:"Pending",
    voyage_no: "",
    job_order_no: "",
    no_of_data: 1,
    total_pages: 1,
    prev_page: "",
    next_page: "",
    data: [
    
    ],
  },
  enBlock_data: {
    line: "",
    job_order_no: "",
    vessel_no: "",
    quantity: 0,
    voyage_no: "",
    gate_ins: 0,
    pendency: 0,
  },
  extractData:{
  
  },
  extractEnBlockPreData:{},
  enBlock_Vessel_Voyage_Name:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING:
      return {
        ...state,
        enBlockListing: { ...state.enBlockListing, ...action.payload },
      };
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING_INIT:
        return {
            ...state,enBlockListing:initialState.enBlockListing
        }
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING:
      return {...state,enBlockPreGateInListing:{...state.enBlockPreGateInListing,...action.payload}};
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_LISTING_INIT:
      return {...state,enBlockPreGateInListing:initialState.enBlockPreGateInListing}
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_REDUCER_LISTING_INIT:
      return {
        ...state,enBlockPreGateInListing:initialState.enBlockPreGateInListing
      }
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_EDIT:
        return {
            ...state,
            enBlock_data:{...state.enBlock_data,...action.payload}
        }
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_EDIT_INIT:
        return {
            ...state,enBlock_data: initialState.enBlock_data
        }
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_EXTRACT_DATA:
      return {
        ...state,extractData:action.payload
      }
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_PRE_GATE_IN_EXTRACT:
      return {...state,extractEnBlockPreData:action.payload}
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_VESSEL_VOYAGE_NAME:
      return {...state,enBlock_Vessel_Voyage_Name:action.payload}
    case ENBLOCK_REDUCER_CONST.EN_BLOCK_VESSEL_VOYAGE_NAME_INIT:
      return {...state,enBlock_Vessel_Voyage_Name:initialState.enBlock_Vessel_Voyage_Name}
    default:
      return { ...state };
  }
};
