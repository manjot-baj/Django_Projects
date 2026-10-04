import { GET_GATE_OUT_LOLO_RECEIPT_DATA } from "../../actions/LoloReceiptActions";

import {
  GATE_OUT_LOLO_RECEIPT_PERFORMA_RECEIPT_DATE,
  GATE_OUT_LOLO_RECEIPT_INVOICE_DATE,
  GATE_OUT_LOLO_RECEIPT_CONTAINER_NUMBER,
  GATE_OUT_LOLO_RECEIPT_CLIENT_NAME,
  GATE_OUT_LOLO_RECEIPT_TRUCK_NUMBER,
  GATE_OUT_LOLO_RECEIPT_CURRENCY,
  GATE_OUT_LOLO_RECEIPT_DELIVERY_DATE,
  GATE_OUT_LOLO_RECEIPT_DUE_DATE,
  GATE_OUT_LOLO_RECEIPT_SHIPPER,
  GATE_OUT_LOLO_RECEIPT_CONSIGNOR,
  GATE_OUT_LOLO_RECEIPT_CHARGE_TYPE,
  GATE_OUT_LOLO_RECEIPT_DESCRIPTION,
  GATE_OUT_LOLO_RECEIPT_AMOUNT,
  GATE_OUT_LOLO_RECEIPT_REMARKS,
  GATE_OUT_LOLO_RECEIPT_GST_PERCENT_VALUE,
  GATE_OUT_LOLO_RECEIPT_NIGHT_CHARGES
} from "../../actions/types";

const initialState = {
  proforma_invoice_no: "",
  proforma_invoice_date: "",
  invoice_no: "",
  invoice_date: "",
  container_no: "",
  client_name: "",
  truck_no: "",
  currency: "",
  delivery_date: "",
  due_date: "",
  shipper: "",
  consignor: "",
  charge_type: "",
  description: "",
  amount: "",
  night_charges:"",
  gst: "",
  cgst: "",
  sgst: "",
  igst: "",
  cgst_amount: "0.00",
  sgst_amount: "0.00",
  igst_amount: "0.00",
  net_amount: "0.00",
  taxable_amount: "0.00",
  gross_amount: "0.00",
  remarks: "",
  gih_pk: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_GATE_OUT_LOLO_RECEIPT_DATA:
      return action.payload;
    case GATE_OUT_LOLO_RECEIPT_PERFORMA_RECEIPT_DATE:
      return { ...state, proforma_invoice_date: action.payload };
    case GATE_OUT_LOLO_RECEIPT_INVOICE_DATE:
      return { ...state, invoice_date: action.payload };
    case GATE_OUT_LOLO_RECEIPT_CONTAINER_NUMBER:
      return { ...state, container_no: action.payload };
    case GATE_OUT_LOLO_RECEIPT_CLIENT_NAME:
      return { ...state, client_name: action.payload };
    case GATE_OUT_LOLO_RECEIPT_TRUCK_NUMBER:
      return { ...state, truck_no: action.payload };
    case GATE_OUT_LOLO_RECEIPT_CURRENCY:
      return { ...state, currency: action.payload };
    case GATE_OUT_LOLO_RECEIPT_DELIVERY_DATE:
      return { ...state, delivery_date: action.payload };
      case GATE_OUT_LOLO_RECEIPT_NIGHT_CHARGES:
        return { ...state, night_charges: action.payload };
    case GATE_OUT_LOLO_RECEIPT_DUE_DATE:
      return { ...state, due_date: action.payload };
    case GATE_OUT_LOLO_RECEIPT_SHIPPER:
      return { ...state, shipper: action.payload };
    case GATE_OUT_LOLO_RECEIPT_CONSIGNOR:
      return { ...state, consignor: action.payload };
    case GATE_OUT_LOLO_RECEIPT_CHARGE_TYPE:
      return { ...state, charge_type: action.payload };
    case GATE_OUT_LOLO_RECEIPT_DESCRIPTION:
      return { ...state, description: action.payload };
    case GATE_OUT_LOLO_RECEIPT_AMOUNT:
      return {
        ...state,
        amount: action.payload,
        taxable_amount: action.payload,
        net_amount: action.payload,

        gross_amount: (
          parseFloat(action.payload) +
          parseFloat(action.payload) * state.gst
        ).toString(),
      };
    case GATE_OUT_LOLO_RECEIPT_REMARKS:
      return { ...state, remarks: action.payload };
    case GATE_OUT_LOLO_RECEIPT_GST_PERCENT_VALUE:
      if (action.payload.type === "gst") {
        return {
          ...state,
          gst: action.payload.val.toString(),
          cgst: (action.payload.val / 2).toString(),
          sgst: (action.payload.val / 2).toString(),
          igst_amount: "0.00",

          cgst_amount: (
            (parseInt(state.amount) * action.payload.val) /
            2
          ).toString(),
          sgst_amount: (
            (parseInt(state.amount) * action.payload.val) /
            2
          ).toString(),
          taxable_amount: parseFloat(state.amount).toString(),
          gross_amount: (
            parseFloat(state.amount) +
            parseFloat(state.amount) * action.payload.val
          ).toString(),
          net_amount: parseFloat(state.amount).toString(),
        };
      } else {
        return {
          ...state,
          gst: action.payload.val.toString(),
          cgst: "0.00",
          sgst: "0.00",
          igst: action.payload.val.toString(),
          igst_amount: (parseInt(state.amount) * action.payload.val).toString(),

          cgst_amount: "0.00",
          sgst_amount: "0.00",
          taxable_amount: parseFloat(state.amount).toString(),
          gross_amount: (
            parseFloat(state.amount) +
            parseFloat(state.amount) * action.payload.val
          ).toString(),
          net_amount: parseFloat(state.amount).toString(),
        };
      }
    default:
      return { ...state };
  }
};
