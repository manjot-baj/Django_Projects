import axiosInstance from "@/AxiosExtend"
import { downloadReceipts } from "./LoloReceiptActions";
import { startLoading, stopLoading } from "./UIActions";
export const GET_TRANSPORT_RECEIPT_DATA = "GET_TRANSPORT_RECEIPT_DATA";

export const getTransportReceiptData = (gih_pk, body) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(`depot/st_receipt/${gih_pk}/`, body);
    dispatch({ type: "GET_LOLO_RECEIPT_DATA", payload: res.data });
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const makeTransportReceiptData =
  (gih_pk, body, alert) => async (dispatch) => {
    console.log(body);
    dispatch(startLoading())
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
    }finally{
      dispatch(stopLoading())
    }
  };

export const downloadTransportReceiptData = (gih_pk, body) => (dispatch) => {
  dispatch(startLoading())
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
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const getGateOutTransportReceiptData =
  (gih_pk, body) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `depot/out_st_receipt/${gih_pk}/`,
        body
      );
      dispatch({ type: "GET_GATE_OUT_LOLORECEIPT_DATA", payload: res.data });
    } catch (err) {
      console.log(err);
    }finally{
      dispatch(stopLoading())
    }
  };

export const makeGateOutTransportReceiptData =
  (gih_pk, body, alert) => async (dispatch) => {
    dispatch(startLoading())
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
    }finally{
      dispatch(stopLoading())
    }
  };

export const downloadGateOutTransportReceiptData =
  (gih_pk, body) => async (dispatch) => {
    dispatch(startLoading())
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
    }finally{
      dispatch(stopLoading())
    }
  };
