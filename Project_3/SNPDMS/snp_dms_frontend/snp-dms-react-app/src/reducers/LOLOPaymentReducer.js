import {
  LOLO_APPLY_CHARGES,
  LOLO_INVOICE_DATE,
  LOLO_RECEIPT_DATE,
  LOLO_CUSTOMER_NAME,
  LOLO_TYPE,
  LOLO_PAYMENT_TYPE,
  LOLO_AMOUNT,
  LOLO_REMARK,
  LOLO_PAYMENT_DATE,
  LOLO_PAYMENT_BANK_NAME,
  LOLO_PAYMENT_ACCOUNT_NAME,
  LOLO_PAYMENT_ACCOUNT_NUMBER,
  LOLO_PAYMENT_CHEQUE_NUMBER,
  LOLO_PAYMENT_UTR_NO,
  LOLO_PAYMENT_CHEQUE_AMOUNT,
  LOLO_PAYMENT_QUANTITY,
  UPDATE_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT,
  LOLO_NIGHT_CHARGES
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
  invoice_date: "",
  receipt_date: todayDate,
  lolo_type: "",
  payment_type: "",
  lolo_amount: "",
  remark: "",
  is_night_charges_applied:false,
  is_night_charge_bill_invoiced:false,
  is_amt_editable:true,
  lolo_payment: {
    date: "",
    bank_name: "",
    account_name: "",
    account_no: "",
    cheque_no: "",
    utr_no: "",
    quantity: "",
    amount: "",
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOLO_APPLY_CHARGES:
      return { ...state, apply_charges: action.payload };
    case LOLO_INVOICE_DATE:
      return { ...state, invoice_date: action.payload };
    case LOLO_CUSTOMER_NAME:
      return { ...state, customer_name: action.payload };
    case LOLO_RECEIPT_DATE:
      return { ...state, receipt_date: action.payload };
    case LOLO_TYPE:
      return { ...state, lolo_type: action.payload };
    case LOLO_PAYMENT_TYPE:
      return { ...state, payment_type: action.payload };
    case LOLO_AMOUNT:
      return {
        ...state,
        lolo_amount: action.payload.toString(),
      };
    case LOLO_REMARK:
      return { ...state, remark: action.payload };
      case LOLO_NIGHT_CHARGES:
        return { ...state, is_night_charges_applied: action.payload };
    case LOLO_PAYMENT_DATE:
      var paymentDate = { ...state.lolo_payment, date: action.payload };
      return { ...state, lolo_payment: paymentDate };
    case LOLO_PAYMENT_BANK_NAME:
      var bankName = { ...state.lolo_payment, bank_name: action.payload };
      return { ...state, lolo_payment: bankName };
    case LOLO_PAYMENT_ACCOUNT_NAME:
      var accountName = { ...state.lolo_payment, account_name: action.payload };
      return { ...state, lolo_payment: accountName };
    case LOLO_PAYMENT_ACCOUNT_NUMBER:
      var accountNo = {
        ...state.lolo_payment,
        account_no: action.payload,
      };
      return { ...state, lolo_payment: accountNo };
    case LOLO_PAYMENT_CHEQUE_NUMBER:
      var chequeNumber = { ...state.lolo_payment, cheque_no: action.payload };
      return { ...state, lolo_payment: chequeNumber };
    case LOLO_PAYMENT_UTR_NO:
      var utrNumber = { ...state.lolo_payment, utr_no: action.payload };
      return { ...state, lolo_payment: utrNumber };
    case LOLO_PAYMENT_CHEQUE_AMOUNT:
      let amount = { ...state.lolo_payment, amount: action.payload };
      return {
        ...state,

        lolo_payment: amount,
      };
    case LOLO_PAYMENT_QUANTITY:
      var qty = { ...state.lolo_payment, quantity: action.payload };
      return { ...state, lolo_payment: qty };
    case UPDATE_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT:
      return { ...state, lolo_payment: action.payload };
    case "GATE_IN_LOLO_PAYMENT_REDUCER":
      return initialState;
    // case LOLO_PAYMENT_WITH_GST:
    //   var amt = { ...state.lolo_payment, amount: state.lolo_amount };
    //   return { ...state, lolo_payment: amt };
    // case LOLO_PAYMENT_GST:
    //   var withGST = {
    //     ...state.lolo_payment,
    //     with_gst: !state.lolo_payment.with_gst,
    //   };
    //   return { ...state, lolo_payment: withGST };
    // case GST_TYPE:
    //   var gstType = { ...state.lolo_payment, gst: action.payload };
    //   return { ...state, lolo_payment: gstType };
    default:
      return { ...state };
  }
};
