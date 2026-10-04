import axiosInstance from "@/AxiosExtend"
let tempJson = {};

export const getInvoiceLrListing = (data, currentPage) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_invoice_bill/`,
      data
    );
    dispatch({ type: "GET_ALL_INVOICE_LR", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const addInvoiceLr = (data, history, alert) => async (dispatch) => {
  console.log("data", data);
  try {
    const res = await axiosInstance.post(
      `transportation/add_invoice_bill/`,
      data
    );
    if (res.data.successMsg) {
      alert("InvoiceLr added successfully", { variant: "success" });
      history.push("/transport/invoice-lr");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_INVOICE_LR", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const deleteInvoiceLrData =(data, history, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.delete(
        `transportation/get_all_invoice_bill/delete/${data}/`,
        data
      );
      if (res?.data?.successMsg) {
        alert("InvoiceLr deleted successfully", { variant: "success" });
        history.push("/transport/invoice-lr");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
      dispatch({ type: "DELETE_INVOICE_LR", payload: res.data.successMsg });
    } catch (err) {
      console.log(err);
    }
  };
  
  export const cancleInvoiceEffect = (pk) => async (dispatch) => {
    try {
      const res = await axiosInstance.get(
        `transportation/get_all_invoice_bill/cancel_transaction/${pk}/`,
      );
      dispatch({ type: "CANCEL_INVOICE_EFFECT", payload: res.data });
    } catch (err) {
      console.log(err);
    }
  };

  export const deleteInvoiceLRDataReset = () => async (dispatch) =>{
    dispatch({ type: "DELETE_INVOICE_LR_RESET"});
  }
  
export const updateInvoiceLr = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_invoice_bill/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("InvoiceLr Updated successfully", { variant: "success" });
      history.push("/transport/invoice-lr");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_INVOICE_LR", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getInvoiceLrDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_invoice_bill/${id}/`
    );
    dispatch({ type: "GET_INVOICE_LR", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const getBillLineDataByCutomerName = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_invoice_data/`,
      data
    );
    dispatch({ type: "GET_BILL_LINE", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearInvoiceLrData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_INVOICE_LR_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
