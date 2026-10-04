import {
  GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES,
  GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME,
  GATE_OUT_SELF_TRANSPORT_RECEIPT_DATE,
  GATE_OUT_SELF_TRANSPORT_TRANSPORTER,
  GATE_OUT_SELF_TRANSPORT_ORIGIN,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE,
  GATE_OUT_SELF_TRANSPORT_PRICE,
  GATE_OUT_SELF_TRANSPORT_REMARK,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_NUMBER,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_QUANTITY,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_UTR_NO,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_AMOUNT,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_BANK_NAME,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_DATE,
  GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NAME,
} from "../../actions/types";

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
  receipt_date: todayDate,
  invoice_date: "",
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
    case GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES:
      return { ...state, apply_charges: action.payload };

    case GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME:
      return { ...state, customer_name: action.payload };
    case GATE_OUT_SELF_TRANSPORT_TRANSPORTER:
      return { ...state, transporter: action.payload };
    case GATE_OUT_SELF_TRANSPORT_RECEIPT_DATE:
      return { ...state, receipt_date: action.payload };
    case GATE_OUT_SELF_TRANSPORT_ORIGIN:
      return { ...state, origin: action.payload };

    case GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE:
      return { ...state, payment_type: action.payload };
    case GATE_OUT_SELF_TRANSPORT_PRICE:
      return {
        ...state,
        price: action.payload.toString(),
      };

    case GATE_OUT_SELF_TRANSPORT_REMARK:
      return { ...state, remark: action.payload };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_DATE:
      var paymentDate = {
        ...state.self_transportation_payment,
        date: action.payload,
      };
      return { ...state, self_transportation_payment: paymentDate };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_BANK_NAME:
      var bankName = {
        ...state.self_transportation_payment,
        bank_name: action.payload,
      };
      return { ...state, self_transportation_payment: bankName };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NAME:
      var accountName = {
        ...state.self_transportation_payment,
        account_name: action.payload,
      };
      return { ...state, self_transportation_payment: accountName };
    case "GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NUMBER":
      var accountNo = {
        ...state.self_transportation_payment,
        account_no: action.payload,
      };
      return { ...state, self_transportation_payment: accountNo };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_NUMBER:
      var chequeNumber = {
        ...state.self_transportation_payment,
        cheque_no: action.payload,
      };
      return { ...state, self_transportation_payment: chequeNumber };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_UTR_NO:
      var utrNumber = {
        ...state.self_transportation_payment,
        utr_no: action.payload,
      };
      return { ...state, self_transportation_payment: utrNumber };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_QUANTITY:
      var qty = {
        ...state.self_transportation_payment,
        quantity: action.payload,
      };
      return { ...state, self_transportation_payment: qty };
    case GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_AMOUNT:
      let amount = {
        ...state.self_transportation_payment,
        amount: action.payload,
      };
      return { ...state, self_transportation_payment: amount };
    case "UPDATE_GATE_OUT_SELF_TRANSPORT_PAYMENT_CHEQUE_UTR_SEARCH_RESULT":
      return { ...state, self_transportation_payment: action.payload };
    default:
      return { ...state };
  }
};
