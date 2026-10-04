import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getPaymentListing = (data, currentPage) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_payment_receipt/`,
      data
    );
    dispatch({ type: "GET_ALL_PAYMENTS", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};

export const addPayment = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`transportation/add_payment_receipt/`, data);
    if (res.data.successMsg) {
      alert("Payment added successfully", { variant: "success" });
      history.push("/voucher/paymentreciept");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_PAYMENT", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};

export const getPaymentLine = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_payment_receipt_data/`,
      data
    );
    dispatch({ type: "GET_PAYMENT_LINE", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};

export const updatePayment = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(
      `transportation/get_all_payment_receipt/delete/${data}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Payment Deleted successfully", { variant: "success" });
      history.push("/voucher/paymentreciept");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_PAYMENT", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const deletePaymentReset = () => async (dispatch) =>{
  dispatch({ type: "DELETE_PAYMENT_RESET"});
}
export const getPaymentDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_payment_receipt/${id}/`
    );
    dispatch({ type: "GET_PAYMENT", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearPaymentData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_PAYMENT_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
