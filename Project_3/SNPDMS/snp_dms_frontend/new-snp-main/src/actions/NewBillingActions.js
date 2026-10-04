import axiosInstance from "@/AxiosExtend";
import { NEWBILLING_REDUCER } from "../reducers/NewBillingReducer";
import { startLoading, stopLoading } from "./UIActions";

// eslint-disable-next-line no-unused-vars
let tempJson = {};

const downloadReport = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const getNewBilling = (data) => async (dispatch, getState) => {
  dispatch({ type: "START_LOADING" });
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      "/billing_invoice/customer_billing_view/",
      data,
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

export const getNewBillinghandling = () => async (dispatch, getState) => {
  const {
    client,
    container_no,
    customer,

    pg_no,
    on_page_data,
    ref_code,
    from_date,
    to_date,
    bill_for_in,
  } = await getState().newBilling;
  const location = await getState().user.location;
  const site = await getState().user.site;

  dispatch({ type: "START_LOADING" });

  try {
    const res = await axiosInstance.post(
      "/billing_invoice/customer_billing_view/",
      {
        client,
        container_no,
        customer,
        bill_type: "Handling",
        pg_no,
        on_page_data,
        ref_code,
        from_date,
        to_date,
        bill_for_in,
        location,
        site,
      },
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

export const getNewBillinghandlingAndDownloadExcel =
  (handleClose, notify) => async (dispatch, getState) => {
    const {
      client,
      container_no,
      customer,
      ref_code,
      from_date,
      to_date,
      bill_for_in,
    } = await getState().newBilling;
    const location = await getState().user.location;
    const site = await getState().user.site;

    dispatch({ type: "START_LOADING" });

    try {
      const res = await axiosInstance.post(
        "/billing_invoice/customer_billing_view_download/",
        {
          client,
          container_no,
          customer,
          bill_type: "Handling",
          ref_code,
          from_date,
          to_date,
          bill_for_in,
          location,
          site,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data?.errorMsg, { variant: "error" });
        }

        downloadReport(res.data, "Handling Data");
        if (handleClose) {
          handleClose();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const getNewBillingRepairDownloadExcel =
  (handleClose, notify) => async (dispatch, getState) => {
    const {
      client,
      container_no,
      customer,
      ref_code,
      from_date,
      to_date,
      from_gate_out_date,
      to_gate_out_date,
    } = await getState().newBilling;
    const location = await getState().user.location;
    const site = await getState().user.site;

    dispatch({ type: "START_LOADING" });

    try {
      const res = await axiosInstance.post(
        "/billing_invoice/customer_billing_view_download/",
        {
          client,
          container_no,
          customer,
          bill_type: "Repair",
          ref_code,
          from_date,
          to_date,
          from_gate_out_date,
          to_gate_out_date,
          location,
          site,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data?.errorMsg, { variant: "error" });
        }

        downloadReport(res.data, "Repair Data");
        if (handleClose) {
          handleClose();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const getNewBillingTransporatationDownloadExcel =
  (handleClose, notify) => async (dispatch, getState) => {
    const {
      client,
      container_no,
      customer,
      ref_code,
      from_date,
      to_date,
      bill_for_in,
    } = await getState().newBilling;
    const location = await getState().user.location;
    const site = await getState().user.site;

    dispatch({ type: "START_LOADING" });

    try {
      const res = await axiosInstance.post(
        "/billing_invoice/customer_billing_view_download/",
        {
          client,
          container_no,
          customer,
          bill_type: "Transportation",
          ref_code,
          from_date,
          to_date,
          bill_for_in,
          location,
          site,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data?.errorMsg, { variant: "error" });
        }

        downloadReport(res.data, "Transportation Data");
        if (handleClose) {
          handleClose();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const getNewBillingRepair = () => async (dispatch, getState) => {
  const {
    client,
    container_no,
    customer,

    pg_no,
    on_page_data,
    ref_code,
    from_date,
    to_date,
    from_gate_out_date,
    to_gate_out_date,
  } = await getState().newBilling;
  const location = await getState().user.location;
  const site = await getState().user.site;

  dispatch({ type: "START_LOADING" });

  try {
    const res = await axiosInstance.post(
      "/billing_invoice/customer_billing_view/",
      {
        client,
        container_no,
        customer,
        bill_type: "Repair",
        pg_no: pg_no,
        on_page_data,
        ref_code,
        from_date,
        from_gate_out_date,
        to_gate_out_date,
        to_date,

        location,
        site,
      },
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

export const getNewBillingTransportation = () => async (dispatch, getState) => {
  const {
    client,
    container_no,
    customer,

    pg_no,
    on_page_data,
    ref_code,
    from_date,
    to_date,
    bill_for_in,
  } = await getState().newBilling;
  const location = await getState().user.location;
  const site = await getState().user.site;

  dispatch({ type: "START_LOADING" });

  try {
    const res = await axiosInstance.post(
      "/billing_invoice/customer_billing_view/",
      {
        client,
        container_no,
        customer,
        bill_type: "Transportation",
        pg_no,
        on_page_data,
        ref_code,
        from_date,
        to_date,
        bill_for_in,
        location,
        site,
      },
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

export const getNewBillingNightCharge = () => async (dispatch, getState) => {
  const {
    client,
    container_no,
    customer,

    pg_no,
    on_page_data,
    ref_code,
    from_date,
    to_date,
    bill_for_in,
  } = await getState().newBilling;
  const location = await getState().user.location;
  const site = await getState().user.site;

  dispatch({ type: "START_LOADING" });

  try {
    const res = await axiosInstance.post(
      "/billing_invoice/customer_billing_view/",
      {
        client,
        container_no,
        customer,
        bill_type: "Night Charge",
        pg_no,
        on_page_data,
        ref_code,
        from_date,
        to_date,
        bill_for_in,
        location,
        site,
      },
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

export const getNewBillingNightChargeAndDownloadExcel =
  (handleClose, notify) => async (dispatch, getState) => {
    const {
      client,
      container_no,
      customer,
      ref_code,
      from_date,
      to_date,
      bill_for_in,
    } = await getState().newBilling;
    const location = await getState().user.location;
    const site = await getState().user.site;

    dispatch({ type: "START_LOADING" });

    try {
      const res = await axiosInstance.post(
        "/billing_invoice/customer_billing_view_download/",
        {
          client,
          container_no,
          customer,
          bill_type: "Night Charge",
          ref_code,
          from_date,
          to_date,
          bill_for_in,
          location,
          site,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data?.errorMsg, { variant: "error" });
        }

        downloadReport(res.data, "Night Charge Data");
        if (handleClose) {
          handleClose();
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const getInvoiceNewBilling = (notify) => async (dispatch, getState) => {
  const { location, site } = await getState().user;
  const {
    client,
    container_no,
    bill_type,
    invoice_no,
    pg_no,
    invoice_date,
    on_page_data,
  } = await getState().newBilling;

  dispatch({ type: "START_LOADING" });
  try {
    const res = await axiosInstance.post(
      "billing_invoice/customer_invoice_view/",
      {
        location,
        site,
        client,
        container_no,
        bill_type,
        invoice_no,
        pg_no,
        invoice_date,
        on_page_data,
      },
    );
    if (res.data) {
      if (res.data?.errorMsg) {
        notify(res.data?.errorMsg, { variant: "error" });
      }
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
    }
  } catch (err) {
    dispatch({ type: "STOP_LOADING" });
    notify(err?.response?.data?.errorMsg, { variant: "error" });
  }
};

export const downloadExcelInvoiceNewBilling =
  (notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    const { client, container_no, bill_type, invoice_no, invoice_date } =
      await getState().newBilling;

    dispatch({ type: "START_LOADING" });
    try {
      const res = await axiosInstance.post(
        "billing_invoice/customer_invoice_view_download/",
        {
          location,
          site,
          client,
          container_no,
          bill_type,
          invoice_no,
          invoice_date,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data?.errorMsg, { variant: "error" });
        }
        downloadReport(res.data, "Billing history Data");
      }
    } catch (err) {
      notify(err?.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const collectInvoiceNew = (data, history, alert) => async (dispatch) => {
  const url = "/billing_invoice/collect_billing/";
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(url, data);
    if (res.data.error_msg) {
      alert(res.data.error_msg, { variant: "error" });
    } else {
      dispatch({ type: "COLLECT_HANDLING_INVOICE_NEW", payload: res.data });
      history.push({
        pathname: "/billing/new-billing/collect-invoice-new",
      });
    }
  } catch (err) {
    alert(err.response?.data?.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const collectPrestatement =
  (data, alert) => async (dispatch, getState) => {
    const url = "billing_invoice/pre_invoice_statement/";
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        url,
        { pk_list: data, location, site },
        { responseType: "arraybuffer" },
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else {
        downloadReceiptsExcel(res.data, "Billing-Prestatement");
        alert("Pre Statement has been Downloaded", { variant: "success" });
      }
    } catch (err) {
      alert(err, { variant: "error" });
    } finally {
      dispatch(stopLoading());
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

export const saveInvoice = (data, alert, history) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(
      "billing_invoice/build_invoice/",
      data,
    );
    if (res.data) {
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.invoice_pk });
        if (history) {
          history.replace({
            pathname: "/billing/new-billing/collect-invoice-new",
            state: {
              pk: res.data.invoice_pk,
              allDetails: {
                pk: res.data.invoice_pk,
              },
            },
          });
        }
      } else alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err?.response?.data?.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const saveInvoiceRepair = (data, alert, history) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(
      "billing_invoice/build_mnr_invoice/",
      data,
    );
    if (res.data) {
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        history.replace({
          pathname: "/billing/new-billing/collect-invoice-new",
          state: {
            pk: res.data.invoice_pk,
            allDetails: { pk: res.data.invoice_pk },
            mnr: true,
          },
        });
        history.go(0);
      } else alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err?.response?.data?.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const printInvoice = (data, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(
      "/billing_invoice/print_invoice/" + data + "/",
      {
        responseType: "arraybuffer",
      },
    );
    if (res.data) {
      downloadReceipts(res.data, "Billing-Invoice");
    } else alert(res.data.errorMsg, { variant: "error" });
  } catch (err) {
    alert(err, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getStatement = (data, alert) => async (dispatch) => {
  const url = "/billing_invoice/download_billing_statement/";
  dispatch(startLoading());
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
  } finally {
    dispatch(stopLoading());
  }
};

export const getStatementExcel = (data, alert) => async (dispatch) => {
  const url = "/billing_invoice/download_billing_statement_excel/";
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(url + data + "/", {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      downloadReceiptsExcel(res.data, "Billing-Statement");
    }
  } catch (err) {
    alert(err, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getInvoiceHistoryByID =
  (id, alert, mnr = false) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      if (mnr) {
        const res = await axiosInstance.get(
          "billing_invoice/update_mnr_invoice/" + id + "/",
        );
        dispatch({ type: "GET_INVOICE_HISTORY_BY_ID_NEW", payload: res.data });
        dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.pk });
      } else {
        const res = await axiosInstance.get(
          "billing_invoice/update_invoice/" + id + "/",
        );
        dispatch({ type: "GET_INVOICE_HISTORY_BY_ID_NEW", payload: res.data });
        dispatch({ type: "GET_BILLING_PK_NEW", payload: res.data.pk });
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(stopLoading());
    }
  };

export const editInvoiceData =
  (id, invoiceData, alert, mnr = false) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.put(
        `billing_invoice/${mnr ? "update_mnr_invoice" : "update_invoice"}/` +
          id +
          "/",
        invoiceData,
      );
      if (res.data) {
        if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          dispatch({
            type: "GET_BILLING_PK_NEW",
            payload: res.data.invoice_pk,
          });
        } else alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(stopLoading());
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
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const deleteBillingHistoryData =
  (id, alert, history, mnr = false) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.delete(
        `billing_invoice/${mnr ? "delete_mnr_invoice" : "delete_invoice"}` +
          "/" +
          id +
          "/",
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
    } finally {
      dispatch(stopLoading());
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
      on_page_data_edit,
    } = await getState().newBilling.mnr_history;
    dispatch(startLoading());
    axiosInstance
      .post("billing_invoice/mnr_invoice_view/", {
        location: location,
        site: site,
        pg_no,
        on_page_data: on_page_data_edit,
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
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };
