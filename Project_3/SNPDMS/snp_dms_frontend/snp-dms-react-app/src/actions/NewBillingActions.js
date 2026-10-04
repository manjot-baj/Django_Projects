import { axiosInstance } from "../Axios";
import { NEWBILLING_REDUCER } from "../reducers/NewBillingReducer";

// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getNewBilling = (data, setCurrentPage) => async (dispatch) => {
  dispatch({ type: "START_LOADING" });
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      "/billing_invoice/customer_billing_view/",
      data
    );
    dispatch({ type: "GET_HANDLING_BILLING_NEW", payload: res.data.data });
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_HANDLING_TRANS_NEW", payload: res.data.data });
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_HANDLING_REPAIR_NEW", payload: res.data.data });
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_NIGHT_CHARGES_NEW", payload: res.data.data });
    dispatch({ type: "STOP_LOADING" });
    dispatch({
      type: "GET_NEW_BILLING_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "GET_NEW_BILLING_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "GET_NEW_BILLING_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
   
    // dispatch({type:"GET_NEW_BILLING_PAGE_NO", payload:"1"})
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};

export const getInvoiceNewBilling = (data,setCurrentPage) => async (dispatch) => {
  tempJson = data;
  dispatch({ type: "START_LOADING" });
  try {
    const res = await axiosInstance.post(
      "billing_invoice/customer_invoice_view/",
      data
    );
    dispatch({ type: "STOP_LOADING" });
    dispatch({ type: "GET_INVOICE_HISTORY_NEW", payload: res.data.data });
    dispatch({
      type: "GET_NEW_BILLING_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "GET_NEW_BILLING_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "GET_NEW_BILLING_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
    setCurrentPage(1)
    dispatch({tpye:"GET_NEW_BILLING_PAGE_NO", payload:"1"})
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    console.log(err);
  }
};

export const collectInvoiceNew = (data, history, alert) => async (dispatch) => {
  const url = "/billing_invoice/collect_billing/";
  try {
    const res = await axiosInstance.post(url, data);
    if (res.data.error_msg) {
      alert(res.data.error_msg, { variant: "error" });
    } else {
      dispatch({ type: "COLLECT_HANDLING_INVOICE_NEW", payload: res.data });
      history.push({
        pathname: "/collect-invoice-new",
      });
    }
  } catch (err) {
    alert(err);
  }
};

export const collectPrestatement = (data, alert) => async (dispatch, getState) => {
  const url = "billing_invoice/pre_invoice_statement/";
  const location = await getState().user.location;
  const site = await getState().user.site;
  try {
    const res = await axiosInstance.post(url , {pk_list:data, location, site},{responseType: 'arraybuffer'});
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      downloadReceiptsExcel(res.data, "Billing-Prestatement");
      alert("Pre Statement has been Downloaded", { variant: "success" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};


export const addCheck = (category_id) => (dispatch) => {
  dispatch({
    type: "ADD_CHECKBOX_NEW",
    payload: category_id,
  });
};

export const removeCheck = (category_id) => (dispatch) => {
  dispatch({
    type: "REMOVE_CHECKBOX_NEW",
    payload: category_id,
  });
};

export const clearCheck = () => (dispatch) => {
  dispatch({
    type: "CLEAR_CHECKBOX_NEW",
  });
};

export const saveInvoice = (data, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      "billing_invoice/build_invoice/",
      data
    );
    if (res.data) {
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.invoice_pk });
       
      } else alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const saveInvoiceRepair = (data, alert,history) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      "billing_invoice/build_mnr_invoice/",
      data
    );
    if (res.data) {
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        history.replace({
          pathname: "/collect-invoice-new",
          state: { pk:res.data.invoice_pk, allDetails: {pk:res.data.invoice_pk},mnr:true },
        })
        history.go(0)
      } else alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const printInvoice = (data, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      "/billing_invoice/print_invoice/" + data + "/",
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data) {
      downloadReceipts(res.data, "Billing-Invoice");
    } else alert(res.data.errorMsg, { variant: "error" });
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const getStatement = (data, alert) => async (dispatch) => {
  const url = "/billing_invoice/download_billing_statement/";

  try {
    const res = await axiosInstance.get(url + data + "/", {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      downloadReceipts(res.data, "Billing-Statement");
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const getStatementExcel = (data, alert) => async (dispatch) => {
  const url = "/billing_invoice/download_billing_statement_excel/";

  try {
    const res = await axiosInstance.get(url + data + "/",  {
      responseType: 'arraybuffer',
  });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      downloadReceiptsExcel(res.data, "Billing-Statement");
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const getInvoiceHistoryByID = (id, alert,mnr=false) => async (dispatch) => {
  try {
    if (mnr) {
      const res = await axiosInstance.get(
        "billing_invoice/update_mnr_invoice/" + id + "/"
      );
      dispatch({ type: "GET_INVOICE_HISTORY_BY_ID_NEW", payload: res.data });
      dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.pk });
    }else{
      const res = await axiosInstance.get(
        "billing_invoice/update_invoice/" + id + "/"
      );
      dispatch({ type: "GET_INVOICE_HISTORY_BY_ID_NEW", payload: res.data });
      dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.pk });
    }
  
   
   
  } catch (err) {
    console.log(err);
  }
};

export const editInvoiceData = (id, invoiceData, alert,mnr=false) => async (dispatch) => {
  try {
  
      const res = await axiosInstance.put(
        `billing_invoice/${mnr?"update_mnr_invoice":"update_invoice"}/` + id + "/",
        invoiceData
      );
      if (res.data) {
        if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.invoice_pk });
        } else alert(res.data.errorMsg, { variant: "error" });
      }
    
   
  } catch (err) {
    console.log(err);
  }
};

export const downloadReceipts = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], { type: "application/pdf" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const downloadReceiptsExcel = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const deleteBillingHistoryData =
  (id, alert, history,mnr=false) => async (dispatch) => {
    try {
      
      const res = await axiosInstance.delete(
        `billing_invoice/${mnr?"delete_mnr_invoice":"delete_invoice"}` + "/" + id + "/"
      );
      if (res.data) {
        if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          history.push("/billing/invoice-billing");
          dispatch({
            type: "GET_BILLING_PK_NEW",
            payload: res.data.invoice_pk,
          });
        } else alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      console.log(err);
    }
  };

export const getAllMNRHistoryAction =
  (val, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {
      pg_no,
      container_no,
      invoice_no,
      invoice_date,
      bill_type,
      client,
      on_page_data_edit
    } = await getState().newBilling.mnr_history;

    axiosInstance
      .post("billing_invoice/mnr_invoice_view/", {
        location: location,
        site: site,
        pg_no,
        on_page_data:on_page_data_edit,
        container_no,
        invoice_no,
        invoice_date,
        bill_type,
        client,
      })
      .then((res) => {
        dispatch({
          type: NEWBILLING_REDUCER.GET_ALL_MNR_HISTORY,
          payload: res.data,
        });
      })
      .catch((err) => {
        notify("Error getting data", { variant: "warning" });
        console.log("Dashboard Error !", err);
      });
  };
