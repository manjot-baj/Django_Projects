import { axiosInstance } from "../Axios";
import { downloadReceipts } from "./LoloReceiptActions";
export const GET_TRANSPORT_RECEIPT_DATA = "GET_TRANSPORT_RECEIPT_DATA";

export const getTransportReceiptData = (gih_pk, body) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`depot/st_receipt/${gih_pk}/`, body);
    dispatch({ type: "GET_LOLO_RECEIPT_DATA", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const makeTransportReceiptData =
  (gih_pk, body, alert) => async (dispatch) => {
    console.log(body);
    try {
      const res = await axiosInstance.put(`depot/st_receipt/${gih_pk}/`, body);
      if (res.data.successMsg)
        alert("ST receipt saved", { variant: "success" });
      else if (res.data.errorMsg)
        alert(res.data.errorMsg, { variant: "error" });
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const downloadTransportReceiptData = (gih_pk, body) => (dispatch) => {
  return axiosInstance
    .post(`depot/st_receipt_download/${gih_pk}/`, body, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      if (res.data) {
        downloadReceipts(res.data, "Transport-Receipt");
      }
    })
    .catch((err) => {
      alert(err, {
        variant: "error",
      });
    });
};

export const getGateOutTransportReceiptData =
  (gih_pk, body) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `depot/out_st_receipt/${gih_pk}/`,
        body
      );
      dispatch({ type: "GET_GATE_OUT_LOLORECEIPT_DATA", payload: res.data });
    } catch (err) {
      console.log(err);
    }
  };

export const makeGateOutTransportReceiptData =
  (gih_pk, body, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `depot/out_st_receipt/${gih_pk}/`,
        body
      );
      if (res.data.successMsg)
        alert("ST receipt saved", { variant: "success" });
      else if (res.data.errorMsg)
        alert(res.data.errorMsg, { variant: "error" });
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const downloadGateOutTransportReceiptData =
  (gih_pk, body) => async () => {
    try {
      const res = await axiosInstance.post(
        `depot/out_st_receipt_download/${gih_pk}/`,
        body,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        downloadReceipts(res.data, "Transport-Receipt");
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };
