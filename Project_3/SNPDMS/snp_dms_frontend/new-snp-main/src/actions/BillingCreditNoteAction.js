import axiosInstance from "@/AxiosExtend";
import { BILLING_CREDIT_NOTE_REDUCER } from "../reducers/BillingCreditNoteReducer";

export const getCreditNoteByInvoiceAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { bill_type, invoice_number } =
      await getState().BillingCreditNoteReducer.creditNoteSearch;
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
      payload: { loading: true },
    });
    axiosInstance
      .post("billing_invoice/get_invoice_data_by_invoice_number/", {
        location: location,
        site: site,
        bill_type,
        invoice_number,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
            loading: false,
          });
        } else {
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
            payload: { data: res.data.data, loading: false },
          });
        }
      })
      .catch((err) => {
        dispatch({
          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_SEARCH,
          payload: { loading: false },
        });

        console.log("Dashboard Error !", err);
      });
  };

export const getCreditNotePrefillByContainerAction =
  (pk_list, history, notify) => async (dispatch, getState) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
      payload: { loading: true },
    });
    axiosInstance
      .post("billing_invoice/collect_credit_note_prefill_data/", {
        pk_list: pk_list,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            payload: { loading: false },
          });
        } else {
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            payload: { data: res.data, loading: false },
          });
          history.push("/billing/credit-notes/create");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
        dispatch({
          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
          payload: { loading: false },
        });
      });
  };

export const getCreditNotePrefillByContainerMNRAction =
  (pk_list, history, notify) => async (dispatch, getState) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
      payload: { loading: true },
    });
    axiosInstance
      .post("billing_invoice/collect_credit_note_mnr_prefill_data/", {
        pk_list: pk_list,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            payload: { loading: false },
          });
        } else {
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            payload: { data: res.data, loading: false },
          });
          history.push("/billing/credit-notes/create");
        }
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
        dispatch({
          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
          payload: { loading: false },
        });
      });
  };

export const saveCreditNoteByInvoiceAction =
  (history, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {
      credit_note_no,
      bill_type,
      credit_note_date,
      remark,
      total_amount,
      credit_note_label,
      credit_note_lines,
      invoice_pk,
      pk_list,
    } = await getState().BillingCreditNoteReducer.creditNoteInvoice.data;
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
      payload: { loading: true },
    });
    axiosInstance
      .post("billing_invoice/create_credit_note/", {
        location: location,
        site: site,
        bill_type,
        credit_note_no,
        credit_note_date,
        remark,
        total_amount,
        credit_note_label,
        credit_note_lines,
        invoice_pk,
        pk_list,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            loading: false,
          });
        } else {
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            payload: { loading: false },
          });
          notify(res.data?.message, { variant: "success" });
          history.replace(`/billing/credit-notes/${res.data?.pk}`);
        }
      })
      .catch((err) => {
        notify(err.response.data.errorMsg, { variant: "error" });
        dispatch({
          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
          payload: { loading: false },
        });

        console.log("Dashboard Error !", err);
      });
  };

export const fetchCreditNoteByPKAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
      payload: { loading: true },
    });
    axiosInstance
      .get(`billing_invoice/get_credit_note/${pk}/`)
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            loading: false,
          });
        } else {
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
            payload: { loading: false, data: res.data },
          });
        }
      })
      .catch((err) => {
        dispatch({
          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
          payload: { loading: false },
        });

        console.log("Dashboard Error !", err);
      });
  };

export const fetchCreditNotesHistoryAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {
      credit_note_no,
      from_credit_note_date,
      to_credit_note_date,
      bill_type,
      on_page_data_client,
      pg_no,
      invoice_no,
    } = await getState().BillingCreditNoteReducer.creditNoteHistoryList;
    dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
      payload: { loading: true },
    });
    axiosInstance
      .post(`billing_invoice/list_credit_notes/`, {
        location,
        site,
        credit_note_no,
        from_credit_note_date,
        to_credit_note_date,
        bill_type,
        on_page_data: on_page_data_client,
        pg_no,
        invoice_no,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
            payload: { loading: false },
          });
        } else {
          dispatch({
            type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
            payload: { loading: false, ...res.data },
          });
        }
      })
      .catch((err) => {
        dispatch({
          type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_HISTORY,
          payload: { loading: false },
        });

        console.log("Dashboard Error !", err);
      });
  };

export const downloadReceipts = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], { type: "application/pdf" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const printCreditNotesInvoice = (data, alert) => async (dispatch) => {
  dispatch({
    type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
    payload: { loading: true },
  });
  try {
    const res = await axiosInstance.get(
      "/billing_invoice/download_credit_note_invoice/" + data + "/",
      {
        responseType: "arraybuffer",
      },
    );
    if (res.data) {
      downloadReceipts(res.data, "Credit-Note-Invoice");
    } else alert(res.data.errorMsg, { variant: "error" });
  } catch (err) {
    alert(err, { variant: "error" });
  }finally{
       dispatch({
      type: BILLING_CREDIT_NOTE_REDUCER.CREDIT_NOTE_INVOICE_EDIT,
      payload: { loading: false },
    });
  }
};
