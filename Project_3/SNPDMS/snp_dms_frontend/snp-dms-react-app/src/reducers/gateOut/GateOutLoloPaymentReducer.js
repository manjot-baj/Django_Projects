import {
  GATE_OUT_LOLO_APPLY_CHARGES,
  GATE_OUT_LOLO_CUSTOMER_NAME,
  GATE_OUT_LOLO_INVOICE_DATE,
  GATE_OUT_LOLO_RECEIPT_DATE,
  GATE_OUT_LOLO_TYPE,
  GATE_OUT_LOLO_PAYMENT_TYPE,
  GATE_OUT_LOLO_AMOUNT,
  GATE_OUT_LOLO_REMARK,
  GATE_OUT_LOLO_PAYMENT_CHEQUE_NUMBER,
  GATE_OUT_LOLO_PAYMENT_QUANTITY,
  GATE_OUT_LOLO_PAYMENT_UTR_NO,
  GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT,
  GATE_OUT_LOLO_PAYMENT_BANK_NAME,
  GATE_OUT_LOLO_PAYMENT_DATE,
  GATE_OUT_LOLO_PAYMENT_ACCOUNT_NAME,
  GATE_OUT_NIGHT_CHARGE,
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
  invoice_date: todayDate,
  receipt_date: todayDate,
  lolo_type: "",
  payment_type: "",
  lolo_amount: "",
  remark: "",
  is_amt_editable:true,
  self_transportation_payment:false,
  is_night_charge_bill_invoiced:false,
  is_night_charges_applied:false,
  lolo_payment: {
    date: "",
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
    case GATE_OUT_LOLO_APPLY_CHARGES:
      return { ...state, apply_charges: action.payload };
    case GATE_OUT_LOLO_CUSTOMER_NAME:
      return { ...state, customer_name: action.payload };
    case GATE_OUT_LOLO_INVOICE_DATE:
      return { ...state, invoice_date: action.payload };
    case GATE_OUT_LOLO_RECEIPT_DATE:
      return { ...state, receipt_date: action.payload };
    case GATE_OUT_LOLO_TYPE:
      return { ...state, lolo_type: action.payload };
    case GATE_OUT_LOLO_PAYMENT_TYPE:
      return { ...state, payment_type: action.payload };
    case GATE_OUT_LOLO_AMOUNT:
      return { ...state, lolo_amount: action.payload };
    case GATE_OUT_LOLO_REMARK:
      return { ...state, remark: action.payload };
    case GATE_OUT_NIGHT_CHARGE:
      return { ...state, is_night_charges_applied: action.payload };
    case GATE_OUT_LOLO_PAYMENT_CHEQUE_NUMBER:
      var chequeNumber = { ...state.lolo_payment, cheque_no: action.payload };
      return { ...state, lolo_payment: chequeNumber };
    case GATE_OUT_LOLO_PAYMENT_QUANTITY:
      var loloQty = { ...state.lolo_payment, quantity: action.payload };
      return { ...state, lolo_payment: loloQty };
    case GATE_OUT_LOLO_PAYMENT_QUANTITY:  // eslint-disable-line no-duplicate-case
        return { ...state, quantity: action.payload };
    case GATE_OUT_LOLO_PAYMENT_UTR_NO:
      var UTRno = { ...state.lolo_payment, utr_no: action.payload };
      return { ...state, lolo_payment: UTRno };
    case GATE_OUT_LOLO_PAYMENT_CHEQUE_AMOUNT:
      var chequeAmt = { ...state.lolo_payment, amount: action.payload };
      return { ...state, lolo_payment: chequeAmt };
    case GATE_OUT_LOLO_PAYMENT_BANK_NAME:
      var bankName = { ...state.lolo_payment, bank_name: action.payload };
      return { ...state, lolo_payment: bankName };
    case GATE_OUT_LOLO_PAYMENT_DATE:
      var loloChequeDate = { ...state.lolo_payment, date: action.payload };
      return { ...state, lolo_payment: loloChequeDate };
    case GATE_OUT_LOLO_PAYMENT_ACCOUNT_NAME:
      var loloChequeAccName = {
        ...state.lolo_payment,
        account_name: action.payload,
      };
      return { ...state, lolo_payment: loloChequeAccName };
    case "GATE_OUT_LOLO_PAYMENT_ACCOUNT_NUMBER":
      var accountNo = {
        ...state.lolo_payment,
        account_no: action.payload,
      };
      return { ...state, lolo_payment: accountNo };
    case "UPDATE_GATE_OUT_LOLO_PAYMENT_CHEQUE_UTR_SEARCH_RESULT":
      return { ...state, lolo_payment: action.payload };
    default:
      return { ...state };
  }
};
