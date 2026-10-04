import { axiosInstance } from "../Axios";
import { downloadReceipts } from "./LoloReceiptActions";
import { downloadSample } from "./StockUploadActions";
let tempJson = {};



export const getTransportationBilling = (data) => async (dispatch) => {
  dispatch({ type: "START_LOADING" });
  tempJson = data;
  try {
    const res = await axiosInstance.post("billing/transportation/", data);
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_TRANSPORTATION_BILLING", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};

export const getGroundRentBilling = (data) => async (dispatch) => {
  dispatch({ type: "START_LOADING" });
  tempJson = data;
  try {
    const res = await axiosInstance.post("billing/ground_rent/", data);
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_GROUND_RENT_BILLING", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};

export const getRepairBilling = (data) => async (dispatch) => {
  dispatch({ type: "START_LOADING" });
  tempJson = data;
  try {
    const res = await axiosInstance.post("billing/mnr/", data);
    console.log("Repair Billing", res.data);
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_REPAIR_BILLING", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};

export const collectInvoice = (data, history, mnr) => async (dispatch) => {
  const url =
    mnr === "mnr"
      ? "billing/collect_mnr_billings/"
      : mnr === "ground_rent"
      ? "billing/collect_ground_rent_billings/"
      : "billing/collect_billings/";
  try {
    const res = await axiosInstance.post(url, data);
    if (res.data.errorMsg) {
      alert(res.data.errorMsg);
    } else {
      dispatch({ type: "COLLECT_HANDLING_INVOICE", payload: res.data });
      history.push({
        pathname: "/collect-invoice",
        state: { value: mnr },
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const saveInvoice = (data, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("billing/build_invoice/", data);
    if (res.data) {
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: "GET_BILLING_PK", payload: res.data.invoice_pk });
      } else alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const printInvoice = (data, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get("billing/print_invoice/" + data + "/", {
      responseType: "arraybuffer",
    });
    if (res.data) {
      downloadReceipts(res.data, "Billing-Invoice");
    } else alert(res.data.errorMsg, { variant: "error" });
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const getStatement = (data, alert, mnr) => async (dispatch) => {
  const url =
    mnr === "mnr"
      ? "billing/download_mnr_billing_statement/"
      : "billing/download_billing_statement/";
  try {
    const res = await axiosInstance.get(url + data + "/", {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      downloadSample(res.data, "Billing-Statement");
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const rejectInvoice = (data, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("billing/reject_bill/", data);
    console.log("Reject Invoice", res);
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
      dispatch(getHandlingBilling(tempJson));
      dispatch(getTransportationBilling(tempJson));
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const deleteInvoiceNo = (data, history) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("billing/delete_invoice_no/", data);
    if (res.data.successMsg) {
      dispatch({
        type: "CLEAR_CHECKBOX",
      });
      history.goBack();
    }
  } catch (err) {
    console.log(err);
  }
};
export const getHandlingBilling = (data) => async (dispatch) => {
  dispatch({ type: "START_LOADING" });
  tempJson = data;
  try {
    const res = await axiosInstance.post("billing/handling/", data);
    console.log(res.data);
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_HANDLING_BILLING", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};
export const getInvoiceHistory = (data) => async (dispatch) => {
  tempJson = data;
  dispatch({ type: "START_LOADING" });
  try {
    const res = await axiosInstance.post("billing/invoice_history/", data);
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_INVOICE_HISTORY", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};

export const getInvoiceHistoryByID = (id, alert) => async (dispatch) => {
  console.log("billing/invoice_history/" + id + "/");
  try {
    const res = await axiosInstance.get("billing/invoice_history/" + id + "/");
    console.log(res);
    dispatch({ type: "GET_INVOICE_HISTORY_BY_ID", payload: res.data });
    dispatch({ type: "GET_BILLING_PK", payload: res.data.pk });
  } catch (err) {
    alert(err.response, { variant: "error" });
  }
};

export const editInvoiceData = (id, invoiceData, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      "billing/invoice_history/" + id + "/",
      invoiceData
    );
    if (res.data) {
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: "GET_BILLING_PK", payload: res.data.invoice_pk });
      } else alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response, { variant: "error" });
  }
};
