export const REQ_REDUCER_CONSUME = {
  REQ_REDUCER_CONSUME_GET_ALL: "REQ_REDUCER_CONSUME_GET_ALL",
  REQ_REDUCER_CONSUME_CHANGE_MODE: "REQ_REDUCER_CONSUME_CHANGE_MODE",
  REQ_REDUCER_CONSUME_APPROVE_REQUISITION:
    "REQ_REDUCER_CONSUME_APPROVE_REQUISITION",
  REQ_REDUCER_CONSUME_CANCEL_REQUISITION:
    "REQ_REDUCER_CONSUME_CANCEL_REQUISITION",
  REQ_REDUCER_CONSUME_GET_EDIT_REQUISITION:
    "REQ_REDUCER_CONSUME_GET_EDIT_REQUISITION",
  REQ_REDUCER_CONSUME_REMOVE_CREATEFIELD:
    "REQ_REDUCER_CONSUME_REMOVE_CREATEFIELD",
  REQ_REDUCER_CONSUME_CREATE_ADD_EDIT: " REQ_REDUCER_CONSUME_CREATE_ADD_EDIT",
  REQ_REDUCER_CONSUME_EDIT_FIELD: "REQ_REDUCER_CONSUME_EDIT_FIELD",
  REQ_REDUCER_CONSUME_REQ_DELETE_FIELD: "REQ_REDUCER_CONSUME_REQ_DELETE_FIELD",
  REQ_REDUCER_CONSUME_REQ_ADD: "REQ_REDUCER_CONSUME_REQ_ADD",
  REQ_REDUCER_CONSUME_REQ_EDIT: "REQ_REDUCER_CONSUME_REQ_EDIT",
  REQ_REDUCER_CONSUME_CREATE_CONSUME_FROM_TOOLROOM:
    "REQ_REDUCER_CONSUME_CREATE_CONSUME_FROM_TOOLROOM",
    REQ_REDUCER_CONSUME_REQ_REDUCER_GET_TOOL_BY_CATEGORY:"REQ_REDUCER_CONSUME_REQ_REDUCER_GET_TOOL_BY_CATEGORY",
    REQ_REDUCER_GET_EDIT_CONSUMER:'REQ_REDUCER_GET_EDIT_CONSUMER',
    REQ_REDUCER_CHANGE_MODE:"REQ_REDUCER_CHANGE_MODE",
    REQ_EDIT_FIELD:"REQ_EDIT_FIELD",
    REQ_GET_CONSUME_ORDER:"REQ_GET_CONSUME_ORDER",
    REQ_GET_CONSUMER_ALL_NEW:"REQ_GET_CONSUMER_ALL_NEW",
    REQ_EDIT_CONSUME_LINE_QUANTITY:"REQ_EDIT_CONSUME_LINE_QUANTITY"
};

const initialState = {
  loading: false,
  error: false,
  toolByCategory: [],
  consumeOrderNo:null,
  mode: {
    edit: false,
    create: true,
    approve: false,
  },
  getConsumeAllNew: {
    pg_no: "1",
    on_page_data: "",
    edit_on_page_data:5,
    from_date: "",
    to_date: "",
    name:"",
    consumption_no:"",
    category:"",
    no_of_data: "",
    total_pages: "",
    prev_page: "",
    next_page: "",
    data:[]
  },
  getAllConsume: {
    loading: false,
    error: null,
    data: {
      no_of_data: 2,
      on_page_data: 2,
      total_pages: 1,
      prev_page: "",
      next_page: "",
      data: [
       
      ],
    },
  },
  editFieldConsume: {
    category: "",
    quantity: 1,
    name: "",
    rate: "",
    sku_code: "",
    in_stock: 0,
    amountAll: function () {
      return `${this.quantity * this.rate}`;
    },
    remarks: "",
  },
  createRequestConsume: {
      pk: "",
      order_no: "",
      date: "",
      total_amount: null,
      location: "West Bengal",
      site: "INGHK",
      consumption_line: [],
      grand_total: function () {
      if (this.consumption_line.length === 0) {
        return 0;
      } else if (this.consumption_line.length === 1) {
        return this.consumption_line[0].amount;
      } else {
        return this.consumption_line.reduce(
          (acc, curr) => acc + curr.amount,0
        );
      }
    },
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case REQ_REDUCER_CONSUME.REQ_EDIT_CONSUME_LINE_QUANTITY:
      return {
        ...state,
        createRequestConsume:{
          ...state.createRequestConsume,consumption_line:state.createRequestConsume.consumption_line.map((val,index)=>{
            if(action.payload.index===index){
              return {
                ...val,
                quantity:action.payload.quantity,
                consumed_quantity:action.payload.quantity
              }
            }else{
              return val
            }
          })
        }
      }
    case REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW:
      return {
        ...state,
        getConsumeAllNew: {
          ...state.getConsumeAllNew,
          ...action.payload,
        },
      };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_GET_ALL:
      return {
        ...state,
        getAllConsume: {
          ...state.getAllConsume,
          ...action.payload,
        },
      };
    case REQ_REDUCER_CONSUME.REQ_GET_CONSUME_ORDER:
      return {...state,consumeOrderNo:action.payload}
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CHANGE_MODE:
      return { ...state, mode: { ...state.mode, ...action.payload } };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_GET_EDIT_CONSUMER:
      return {
        ...state,
        createRequestConsume: { ...state.createRequestConsume, data: action.payload },
      };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_REDUCER_GET_TOOL_BY_CATEGORY:
      return { ...state, toolByCategory: action.payload };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_CREATE_ADD_EDIT:
      return {
        ...state,
        editFieldConsume: { ...state.editFieldConsume, ...action.payload },
      };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_EDIT_FIELD:
      return {
        ...state,
        createRequestConsume: {
          ...state.createRequestConsume,
          data: {
            ...state.createRequestConsume.data,
            consumption_line: action.payload,
          },
        },
      };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_DELETE_FIELD:
      return {
        ...state,
        createRequestConsume: {
          ...state.createRequestConsume,
          consumption_line: action.payload
        },
      };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_ADD:
      return {
        ...state,
        createRequestConsume: {
          ...state.createRequestConsume,
          consumption_line: [
            ...state.createRequestConsume.consumption_line,
            action.payload,
          ]
        },
      };
    case REQ_REDUCER_CONSUME.REQ_EDIT_FIELD:
        return {
          ...state,
          createRequestConsume: {
            ...state.createRequestConsume,
            data: {
              ...state.createRequestConsume.data,
              consumption_line: action.payload,
            },
          },
        };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_CREATE_CONSUME_FROM_TOOLROOM:
      return {
        ...state,
        createRequestConsume: {
          ...state.createRequestConsume,
          ... action.payload,
        },
      };
    case REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT:
      return {
        ...state,
        createRequestConsume: {
          ...state.createRequestConsume,
          ...action.payload },
        
      };
    default:
      return { ...state };
  }
};
