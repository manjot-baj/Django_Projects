export const TOOL_TRANSFER_CONSTANT = {
  TOOL_TRANSFER_REQUEST_FORM: "TOOL_TRANSFER_REQUEST_FORM",
  TOOL_TRANSFER_REQUEST_LINE: "TOOL_TRANSFER_REQUEST_LINE",
  TOOL_TRANSFER_TABLE: "TOOL_TRANSFER_TABLE",
  TOOL_TRANSFER_REQUEST_FORM_INIT: "TOOL_TRANSFER_REQUEST_FORM_INIT",
  TOOL_TRANSFER_TABLE_INIT: "TOOL_TRANSFER_TABLE_INIT",
  TOOL_TRANSFER_REQUEST_FORM_LINE_ADD: "TOOL_TRANSFER_REQUEST_FORM_LINE_ADD",
  TOOL_TRANSFER_REQUEST_FORM_LINE_REMOVE:
    "TOOL_TRANSFER_REQUEST_FORM_LINE_REMOVE",
  TOOL_TRANSFER_GET_TOOL: "TOOL_TRANSFER_GET_TOOL",
  TOOL_TRANSFER_GET_TOOL_INIT: "TOOL_TRANSFER_GET_TOOL_INIT",
};

const initialState = {
  toolRequest: {
    date: "",
    tool_transfer_no: "",
    tool_request_line: [],
  },
  toolTable: {
    tool_transfer_no: "",
    status: "Pending",
    item: "",
    sku_code: "",
    on_page_data: "",
    transfer_type:'Site Transfer',
    on_page_data_client: 10,
    is_admin:true,
    category:"",
    pg_no: 1,
    total_pages: "",
    prev_page: "",
    next_page: "",
    data: null,
  },
  getTool: {
    pk: "",
    location: "",
    site: "",
    date: "",
    tool_transfer_no: "",
    tool_request_line: [],
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM:
      return {
        ...state,
        toolRequest: { ...state.toolRequest, ...action.payload },
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_LINE:
      return {
        ...state,
        toolRequest: {
          ...state.toolRequest,
          tool_request_line: state.toolRequest.tool_request_line.map(
            (val, inde) => {
              if(val.received_quantity === 0 && (Number(action.payload.received_quantity) < 0)){
                 return val
              }
              if (
                 Number(action.payload.received_quantity) >
                  Number(val.required_quantity) 
              ) {
                return val;
              }
              if (inde === action.payload.index) {
                return {
                  ...val,
                  received_quantity: Number(action.payload.received_quantity),
                 
                };
              }
              return val;
            }
          ),
        },
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE:
      return {
        ...state,
        toolTable: { ...state.toolTable, ...action.payload },
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_INIT:
      return {
        ...state,
        toolRequest: initialState.toolRequest,
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_TABLE_INIT:
      return {
        ...state,
        toolTable: initialState.toolTable,
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_LINE_ADD:
      return {
        ...state,
        toolRequest: {
          ...state.toolRequest,
          tool_request_line: [
            ...state.toolRequest.tool_request_line,
            action.payload,
          ],
        },
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_REQUEST_FORM_LINE_REMOVE:
      return {
        ...state,
        toolRequest: {
          ...state.toolRequest,
          tool_request_line: state.toolRequest.tool_request_line.filter(
            (val, index) => index !== action.payload
          ),
        },
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_GET_TOOL:
      return {
        ...state,
        getTool: {
          ...state.getTool,
          ...action.payload,
        },
      };
    case TOOL_TRANSFER_CONSTANT.TOOL_TRANSFER_GET_TOOL_INIT:
      return {
        ...state,
        getTool: initialState.getTool,
      };
    default:
      return { ...state };
  }
};
