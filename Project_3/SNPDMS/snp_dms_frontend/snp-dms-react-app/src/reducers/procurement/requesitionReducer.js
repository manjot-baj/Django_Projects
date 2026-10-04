export const REQ_REDUCER = {
  REQ_REDUCER_CHANGE_MODE: "REQ_REDUCER_CHANGE_MODE",
  REQ_REDUCER_APPROVE_REQUISITION: "REQ_REDUCER_APPROVE_REQUISITION",
  REQ_REDUCER_CANCEL_REQUISITION: "REQ_REDUCER_CANCEL_REQUISITION",
  REQ_REDUCER_GET_EDIT_REQUISITION: "REQ_REDUCER_GET_EDIT_REQUISITION",
  REQ_REDUCER_REMOVE_CREATEFIELD: "REQ_REDUCER_REMOVE_CREATEFIELD",
  REQ_REDUCER_GET_TOOL_BY_CATEGORY: "REQ_REDUCER_GET_TOOL_BY_CATEGORY",
  REQ_GET_REQUEST_ORDER:"REQ_GET_REQUEST_ORDER",
  REQ_GET_REQUEST_BY_PK:"REQ_GET_REQUEST_BY_PK",
  REQ_GET_REQUEST_BY_PK_CLEAR:"REQ_GET_REQUEST_BY_PK_CLEAR",
  REQ_EDIT_REQUEST_BY_PK_QTY:"REQ_EDIT_REQUEST_BY_PK_QTY",
  REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT:"REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT",
  REQ_REDUCER_ADD_TOOL_TO_PK:"REQ_REDUCER_ADD_TOOL_TO_PK",
  REQ_REDUCER_DELETE_TOOL_TO_PK:"REQ_REDUCER_DELETE_TOOL_TO_PK",
  REQ_REDUCER_ADD_REQUEST_BILL_LINES:"REQ_REDUCER_ADD_REQUEST_BILL_LINES",
  REQ_REDUCER_GET_ALL_BILL:"REQ_REDUCER_GET_ALL_BILL",
  REQ_EDIT_REQUEST_BY_PK_RATE: "REQ_EDIT_REQUEST_BY_PK_RATE",
};

const initialState = {
  loading: false,
  error: false,
  tabSelected: 1,
  requestOrderNo: null,
  toolByCategory: [],
  mode: {
    edit: false,
    create: true,
    approve: false,
    cancel: false,
    delete: false,
  },
  billData:null,
  getRequisition: {
    pg_no: "1",
    on_page_data: "",
    edit_on_page_data: 5,
    from_date: "",
    to_date: "",
    is_approved: "",
    name: "",
    is_pending: "",
    is_partial_closed: "",
    is_automate:"",
    is_closed: "",
    no_of_data: "",
    total_pages: "",
    prev_page: "",
    next_page: "",
    order_no:"",
    from_received_date: "",
    to_received_date: "",
    from_bill_date: "",
    to_bill_date: "",
    bill_no: "",
    data:[]
  },
  getRequesition_by_pk: null,
  editField: {
    category: "",
    quantity: 0,
    name: "",
    rate: "",
    required_qty: 0,
    hsn_code: "",
    in_stock: 0,
    amountAll: function () {
      return `${this.required_qty * this.rate}`;
    },
    remarks: "",
  },
  createRequest: {
    loading: false,
    data: {
      pk: "",
      cgst: 0.0,
      sgst: 0.0,
      igst: 0.0,
      is_approved: false,
      order_no: "",
      date: "",
      total_amount: null,
      requisition_line: [],
    },
    error: null,
    grand_total: function () {
      if (this.data.requisition_line.length === 0) {
        return 0;
      } else if (this.data.requisition_line.length === 1) {
        return this.data.requisition_line[0].amount;
      } else {
        return this.data.requisition_line.reduce(
          (acc, curr) => acc + curr.amount,
          0
        );
      }
    },
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REQ_REDUCER.REQ_REDUCER_ADD_REQUEST_BILL_LINES:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          requisition_history_line :[action.payload,...state.getRequesition_by_pk.requisition_history_line]
        }
      }
    case REQ_REDUCER.REQ_REDUCER_GET_ALL_BILL:
      return {
          ...state,billData:action.payload
      }
    case REQ_REDUCER.REQ_REDUCER_DELETE_TOOL_TO_PK:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          requisition_line: state.getRequesition_by_pk.requisition_line.filter(
            (val, index) => action.payload !== index
          ),
        },
      };
    case REQ_REDUCER.REQ_REDUCER_ADD_TOOL_TO_PK:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          requisition_line: [
            ...state.getRequesition_by_pk.requisition_line,
            action.payload,
          ],
        },
      };
    case REQ_REDUCER.REQ_GET_REQUEST_BY_PK_TOTAL_AMOUNT:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          total_amount: state.getRequesition_by_pk.requisition_line.reduce(
            (a, c) => a + c.amount,
            0
          ),
        },
      };
    case REQ_REDUCER.REQ_EDIT_REQUEST_BY_PK_QTY:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          requisition_line: state.getRequesition_by_pk.requisition_line.map(
            (val, ind) => {
              if (action.payload.index === ind) {
                if (action.payload.required_qty) {
                  return {
                    ...val,
                    required_qty: action.payload.required_qty,
                    received_qty: 0,
                    remaining_qty: action.payload.required_qty,
                    amount: action.payload.required_qty * val.rate,
                  };
                }
                return {
                  ...val,
                  received_qty: action.payload.received_qty,
                  remaining_qty: val.required_qty - action.payload.received_qty,
                  amount: action.payload.received_qty * val.rate,
                };
              }
              return val;
            }
          ),
        },
      };
    case REQ_REDUCER.REQ_GET_REQUEST_BY_PK_CLEAR:
      return { ...state, getRequesition_by_pk: null };
    case REQ_REDUCER.REQ_GET_REQUEST_BY_PK:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          ...action.payload,
        },
      };
    case "SELECT_TAB":
      return { ...state, tabSelected: action.payload };
    case REQ_REDUCER.REQ_GET_REQUEST_ORDER:
      return { ...state, requestOrderNo: action.payload };
    case REQ_REDUCER.REQ_REDUCER_CHANGE_MODE:
      return { ...state, mode: { ...state.mode, ...action.payload } };
    case "GET_ALL_REQUEST":
      return {
        ...state,
        getRequisition: {
          ...state.getRequisition,
          ...action.payload,
        },
      };
    case REQ_REDUCER.REQ_REDUCER_GET_EDIT_REQUISITION:
      return {
        ...state,
        createRequest: { ...state.createRequest, data: action.payload },
      };
    case "CREATE_REQ_FROM_TOOL":
      return {
        ...state,
        createRequest: { ...state.createRequest, data: action.payload },
      };
    case "REQ_EDIT":
      return {
        ...state,
        createRequest: {
          ...state.createRequest,
          data: { ...state.createRequest.data, ...action.payload },
        },
      };
    case "REQ_EDIT_FIELD":
      return {
        ...state,
        createRequest: {
          ...state.createRequest,
          data: {
            ...state.createRequest.data,
            requisition_line: action.payload,
          },
        },
      };
    case "REQ_DELETE_FIELD":
      return {
        ...state,
        createRequest: {
          ...state.createRequest,
          data: {
            ...state.createRequest.data,
            requisition_line: action.payload,
          },
        },
      };
    case "REQ_ADD":
      return {
        ...state,
        createRequest: {
          ...state.createRequest,
          data: {
            ...state.createRequest.data,
            requisition_line: [
              ...state.createRequest.data.requisition_line,
              action.payload,
            ],
          },
        },
      };
    case "REQ_CREATE_ADD_EDIT":
      return { ...state, editField: { ...state.editField, ...action.payload } };
    case REQ_REDUCER.REQ_REDUCER_GET_TOOL_BY_CATEGORY:
      return { ...state, toolByCategory: action.payload };
    case REQ_REDUCER.REQ_EDIT_REQUEST_BY_PK_RATE:
      return {
        ...state,
        getRequesition_by_pk: {
          ...state.getRequesition_by_pk,
          requisition_line: state.getRequesition_by_pk.requisition_line.map(
            (val, ind) => {
              if (action.payload.index === ind) {
                return {
                  ...val,
                  rate: Number(action.payload.rate),
                  amount:
                    Number(val.received_qty) === 0
                      ? Number(val.required_qty) * Number(action.payload.rate)
                      : Number(val.received_qty) * Number(action.payload.rate),
                };
              }
              return val;
            }
          ),
        },
      };
    default:
      return { ...state };
  }
};
