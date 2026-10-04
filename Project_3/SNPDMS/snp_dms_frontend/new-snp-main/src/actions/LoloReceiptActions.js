import axiosInstance from "@/AxiosExtend"
import { startLoading, stopLoading } from "./UIActions";
export const GET_LOLO_RECEIPT_DATA = "GET_LOLO_RECEIPT_DATA";
export const GET_GATE_OUT_LOLO_RECEIPT_DATA = "GET_GATE_OUT_LOLORECEIPT_DATA";

export const getLoloReceiptData = (gih_pk, body) => (dispatch) => {
  dispatch(startLoading())
  return axiosInstance
    .post(`depot/lolo_receipt/${gih_pk}/`, body)
    .then((res) => {
      dispatch({ type: GET_LOLO_RECEIPT_DATA, payload: res.data });
    })
    .catch((err) => {
      console.log(err);
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const makeLoloReceiptData = (gih_pk, body, alert) => (dispatch) => {
  dispatch(startLoading())
  return axiosInstance
    .put(`depot/lolo_receipt/${gih_pk}/`, body)
    .then((res) => {
      if (res.data.successMsg)
        alert("LOLO Receipt Saved", {
          variant: "success",
        });
      else if (res.data.errorMsg)
        alert(res.data.errorMsg, {
          variant: "error",
        });
    })
    .catch((err) => {
      alert(err, {
        variant: "error",
      });
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const downloadloloReceiptData = (gih_pk, body) => (dispatch) => {
  dispatch(startLoading())
  return axiosInstance
    .post(`depot/lolo_receipt_download/${gih_pk}/`, body, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      if (res.data) {
        downloadReceipts(res.data, "Lolo-Receipt");
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

// GATE OUT
export const getGateOutLoloReceiptData = (gih_pk, body) => (dispatch) => {
  dispatch(startLoading())
  return axiosInstance
    .post(`depot/out_lolo_receipt/${gih_pk}/`, body)
    .then((res) => {
      dispatch({ type: GET_GATE_OUT_LOLO_RECEIPT_DATA, payload: res.data });
    })
    .catch((err) => {
      alert(err, {
        variant: "error",
      });
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const makeGateOutLoloReceiptData = (gih_pk, body, alert) => (dispatch) => {
  dispatch(startLoading())
  return axiosInstance
    .put(`depot/out_lolo_receipt/${gih_pk}/`, body)
    .then((res) => {
      if (res.data.successMsg)
        alert("LOLO Receipt Saved", {
          variant: "success",
        });
      else if (res.data.errorMsg)
        alert(res.data.errorMsg, {
          variant: "error",
        });
    })
    .catch((err) => {
      alert(err, {
        variant: "error",
      });
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const downloadGateOutloloReceiptData = (gih_pk, body) => (dispatch) => {
  dispatch(startLoading())
  return axiosInstance
    .post(`depot/out_lolo_receipt_download/${gih_pk}/`, body, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      if (res.data) {
        downloadReceipts(res.data, "Lolo-Receipt");
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

export const downloadReceipts = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], { type: "application/pdf" });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
