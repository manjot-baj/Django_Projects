import {
  TRANSPORTATION_APPLY_CHARGES,
  TRANSPORTATION_CUSTOMER_NAME,
  TRANSPORTATION_TRANSPORTER,
  TRANSPORTATION_RECEIPT_DATE,
  TRANSPORTATION_ORIGIN,
  TRANSPORTATION_PAYMENT_TYPE,
  TRANSPORTATION_PRICE,
  TRANSPORTATION_REMARK,
  TRANSPORTATION_PAYMENT_DATE,
  TRANSPORTATION_PAYMENT_BANK_NAME,
  TRANSPORTATION_PAYMENT_ACCOUNT_NAME,
  TRANSPORTATION_PAYMENT_CHEQUE_NUMBER,
  TRANSPORTATION_PAYMENT_UTR_NO,
  TRANSPORTATION_PAYMENT_QUANTITY,
  TRANSPORTATION_PAYMENT_CHEQUE_AMOUNT,
  UPDATE_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT,
} from "../actions/types";

// TODAYS DATE
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //
var yyyy = today.getFullYear();

var todayDate = yyyy + "-" + mm + "-" + dd;

const initialState = {
  apply_charges: "Line",
  customer_name: "",
  transporter: "",
  invoice_date: "",
  receipt_date: todayDate,
  origin: "",
  payment_type: "",
  price: "",
  remark: "",
  is_amt_editable:true,
  self_transportation_payment: {
    date: todayDate,
    bank_name: "",
    account_name: "",
    cheque_no: "",
    utr_no: "",
    quantity: "",
    amount: "",
    account_no: "",
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRANSPORTATION_APPLY_CHARGES:
      return { ...state, apply_charges: action.payload };

    case TRANSPORTATION_CUSTOMER_NAME:
      return { ...state, customer_name: action.payload };
    case TRANSPORTATION_TRANSPORTER:
      return { ...state, transporter: action.payload };
    case TRANSPORTATION_RECEIPT_DATE:
      return { ...state, receipt_date: action.payload };
    case TRANSPORTATION_ORIGIN:
      return { ...state, origin: action.payload };

    case TRANSPORTATION_PAYMENT_TYPE:
      return { ...state, payment_type: action.payload };
    case TRANSPORTATION_PRICE:
      return {
        ...state,
        price: action.payload.toString(),
      };

    case TRANSPORTATION_REMARK:
      return { ...state, remark: action.payload };
    case TRANSPORTATION_PAYMENT_DATE:
      var paymentDate = {
        ...state.self_transportation_payment,
        date: action.payload,
      };
      return { ...state, self_transportation_payment: paymentDate };
    case TRANSPORTATION_PAYMENT_BANK_NAME:
      var bankName = {
        ...state.self_transportation_payment,
        bank_name: action.payload,
      };
      return { ...state, self_transportation_payment: bankName };
    case TRANSPORTATION_PAYMENT_ACCOUNT_NAME:
      var accountName = {
        ...state.self_transportation_payment,
        account_name: action.payload,
      };
      return { ...state, self_transportation_payment: accountName };
    case "TRANSPORTATION_PAYMENT_ACCOUNT_NUMBER":
      var accountNo = {
        ...state.self_transportation_payment,
        account_no: action.payload,
      };
      return { ...state, self_transportation_payment: accountNo };
    case TRANSPORTATION_PAYMENT_CHEQUE_NUMBER:
      var chequeNumber = {
        ...state.self_transportation_payment,
        cheque_no: action.payload,
      };
      return { ...state, self_transportation_payment: chequeNumber };
    case TRANSPORTATION_PAYMENT_UTR_NO:
      var utrNumber = {
        ...state.self_transportation_payment,
        utr_no: action.payload,
      };
      return { ...state, self_transportation_payment: utrNumber };
    case TRANSPORTATION_PAYMENT_QUANTITY:
      var qty = {
        ...state.self_transportation_payment,
        quantity: action.payload,
      };
      return { ...state, self_transportation_payment: qty };
    case TRANSPORTATION_PAYMENT_CHEQUE_AMOUNT:
      let amount = {
        ...state.self_transportation_payment,
        amount: action.payload,
      };
      return { ...state, self_transportation_payment: amount };
    case UPDATE_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT:
      return { ...state, self_transportation_payment: action.payload };
    case "GATE_IN_SELF_TRANSPORTATION_PAYMENT_REDUCER":
      return initialState;
    default:
      return { ...state };
  }
};
