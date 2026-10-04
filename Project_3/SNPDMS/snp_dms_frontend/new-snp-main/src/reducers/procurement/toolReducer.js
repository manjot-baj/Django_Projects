const initialState = {
    toolTableLoading:"FALSE",
    allTools:{
      total_pages:"",
      pg_no:1,
      on_page_data:"",
      set_on_page_data:5,
      no_of_data:"",
      prev_page:"",
      next_page:"",
      category:"",
      sku_code:"",
      name:"",
      process:"",
      from_date:"",
      to_date:"",
      data:[]
    },
    toolEdit:{},
    getAllToolsCategory:[],
    allToolsRequest:[],
    allToolByCategoryAndItem:null,
    toolConsumption:{ 
      name: "",
      size: "",
      quantity: "",
      model: ""},
    allToolConsumption:[],
    extractData:{
      loading:false,
      error:false,
      data:{

      }
    },
    masterStock:{
      category: "",
      name:"",
      sku_code:"",
      pg_no: 1,
      on_page_data_client: 10,
      location:"",
      no_of_data: "",
      on_page_data: "",
      total_pages: "",
      prev_page: "",
      next_page: "",
      data:[]
    }
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_MASTER_STOCKS":{
        return {...state, masterStock:{...state.masterStock,...action.payload} };
      }
      case "GET_ALL_MASTER_STOCKS_INIT":{
        return {...state,masterStock: initialState.masterStock}
      }
      case "GET_ALL_TOOLS_TABLE_LOAD":
        return { ...state, toolTableLoading: action.payload };
      case "GET_ALL_TOOLS_BY_CATEGORY_AND_NAME":
        return { ...state, allToolByCategoryAndItem: action.payload };
      case "GET_ALL_TOOLS":
        return { ...state, allTools:{...state.allTools,...action.payload} };
      case "ADD_TOOLS":
        return { ...state, allTools: action.payload };
      case "EDIT_TOOLS":
        return { ...state ,toolEdit:action.payload};
      case "GET_ALL_TOOLS_CATEGORY":{
        return { ...state, getAllToolsCategory: action.payload };
      }
      case "GET_EXTRACT_TOOL_DATA":{
        return { ...state, extractData :{...state.extractData ,...action.payload} };
        }
      case "DELETE_PRO_TOOL": {
        return { ...state, allTools: state.allTools.filter(val=>val!==action.payload) };
      }
      case "GET_ALL_TOOLS_REQUEST":
        return {...state,allToolsRequest:action.payload}
      case "EDIT_REQUEST":{
        return {...state,toolEdit:action.payload}
      }
      case "DELETE_EDIT_REQUEST":{
        return {...state,toolEdit:{}}
      }
      case "REQUEST_TOOL":{
        return {...state,allToolsRequest:[...state.allToolsRequest,action.payload]}
      }
      case "GET_ALL_TOOLS_CONSUME":
        return {...state,allToolConsumption:action.payload}
      case "CONSUME_INPUT_CHANGE":
        const {name:inputname,value} =action.payload
        return {...state,toolConsumption:{...state.toolConsumption,[inputname]:value}}
      case "CONSUME_INPUT":
        return {...state,toolConsumption:{...action.payload}}
      case "CONSUME_INPUT_DELETE":
        return {...state,toolConsumption:{}}
      case "CONSUME_ADD":
        return {...state,allToolConsumption:[...state.allToolConsumption,action.payload]}
      default:
        return { ...state };
    }
  };