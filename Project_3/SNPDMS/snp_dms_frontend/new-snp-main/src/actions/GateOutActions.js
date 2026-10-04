import axiosInstance from "@/AxiosExtend";

import { startLoading, stopLoading } from "./UIActions";
import { downloadReceipts } from "./LoloReceiptActions";
import { ADVANCE_FINANCE_CONSTANT } from "../reducers/AdvanceFinance/AdvanceFinanceReducer";
import {
  GATE_OUT_LOLO_AMOUNT,
  GATE_OUT_LOLO_APPLY_CHARGES,
  GATE_OUT_LOLO_CUSTOMER_NAME,
  GATE_OUT_LOLO_PAYMENT_TYPE,
} from "./types";

// GATE OUT CONTAINER SEARCH
export const GATE_OUT_CONTAINER_SEARCH = "GATE_OUT_CONTAINER_SEARCH";
export const GET_GATE_OUT_CONTAINER_BY_DATE = "GET_GATE_OUT_CONTAINER_BY_DATE";
export const SET_GATE_OUT_CONTAINER_DETAILS = "SET_GATE_OUT_CONTAINER_DETAILS";
export const GATE_SEAL_NUMBER_LISITING = "GATE_SEAL_NUMBER_LISITING";

// Payment Cheque Search
export const GET_GATE_OUT_LOLO_PAYMENT_SEARCH_RESULT =
  "GET_GATE_OUT_LOLO_PAYMENT_SEARCH_RESULT";
export const SET_SELECTED_GATE_OUT_LOLO_PAYMENT_SEARCH =
  "SET_SELECTED_GATE_OUT_LOLO_PAYMENT_SEARCH";

// GATE OUT CONTAINER SEARCH
export const gateOutContainerSearchDispatch =
  (body, setDropdown, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      container_no: body.container_no,
      location: location,
      site: site,
    };
    axiosInstance
      .post("depot/out_container_search/", bodyData)
      .then((res) => {
        //   If the container is IN and available (new OUT)
        dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_FETCH_INIT });
        if (res.data.flag === "OUT") {
          dispatch({
            type: SET_GATE_OUT_CONTAINER_DETAILS,
            payload: res.data.container_data,
          });
          dispatch({
            type: "SET_GATE_OUT_BOOKING_DETAILS",
            payload: {
              ...res.data,
              gate_out_data: { ...res.data?.gate_out_data, condition: "OK" },
            },
          });
          dispatch({
            type: "SET_NEW_GIH_PK",
            payload: res.data.gih_pk,
          });
          dispatch({
            type: GATE_SEAL_NUMBER_LISITING,
            payload: res.data?.seal_no_list,
          });
        } else if (res.data.container_no) {
          setDropdown(true);
          dispatch({ type: GATE_OUT_CONTAINER_SEARCH, payload: res.data });
        } else if (res.data.errorMsg) {
          setDropdown(true);
          dispatch({
            type: GATE_OUT_CONTAINER_SEARCH,
            payload: res.data,
          });
        } else if (res.data.seal_no_list) {
          setDropdown(true);
          dispatch({
            type: GATE_SEAL_NUMBER_LISITING,
            payload: res.data.seal_no_list,
          });
        }
      })
      .catch((err) => {
        if (err.response.data.code === "token_not_valid") {
          alert("Session expired please login again", {
            variant: "info",
          });
        } else {
          console.error(err);
          alert(err, {
            variant: "error",
          });
        }
      });
  };

export const getGateOutContainerByDateDispatch =
  (body, setDropdown, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    axiosInstance
      .post("depot/update_gate_out/", body)
      .then((res) => {
        dispatch({
          type: "EDIT_GATE_OUT_LICENSE_IMAGE",
          payload: "",
        });
        dispatch({
          type: "GATE_OUT_LICENSE_IMAGE",
          payload: "",
        });
        if (!res.data.errorMsg) {
          if (res.data.self_transportation_data === "") {
            dispatch({ type: "SET_ENABLE_OUT_TRANSPORTATION" });
          } else {
            dispatch({ type: "SET_DISABLE_OUT_TRANSPORTATION" });
          }
          let { gate_out_data, ...data } = res.data;
          dispatch({
            type: GET_GATE_OUT_CONTAINER_BY_DATE,
            payload: {
              ...data,
              gate_out_data: { image_url: "", ...gate_out_data },
            },
          });
        } else {
          alert(res.data.errorMsg, {
            variant: "error",
          });
        }
        dispatch({ type: "SET_GATE_OUT_GIH_PK", payload: res.data.goh_pk });
        setDropdown(false);
      })
      .catch((err) => {
        if (err.response.data.code === "token_not_valid") {
          alert("Session expired please login again", {
            variant: "info",
          });
        } else {
          console.error(err);
          alert(err, {
            variant: "error",
          });
        }
      });
  };

export const getGateOutContainerByPreGateInDispatch =
  (container_no, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch({ type: "START_LOADING" });
    axiosInstance
      .post("depot/pregateout_container_info/", {
        container_no: container_no,
        location,
        site,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          alert(res.data.errorMsg, { variant: "error" });
        }
        if (res.data.flag === "OUT") {
          dispatch({
            type: SET_GATE_OUT_CONTAINER_DETAILS,
            payload: res.data.container_data,
          });
          dispatch({
            type: "SET_GATE_OUT_BOOKING_DETAILS",
            payload: {...res.data,gate_out_data:{...res.data?.gate_out_data,condition:'OK',seal_no_list:res.data?.seal_no_list}},
          });
          dispatch({
            type: GATE_OUT_LOLO_APPLY_CHARGES,
            payload: res.data.lolo_data.apply_charges,
          });
          dispatch({
            type: GATE_OUT_LOLO_CUSTOMER_NAME,
            payload: res.data.lolo_data.customer_name,
          });
          dispatch({
            type: GATE_OUT_LOLO_PAYMENT_TYPE,
            payload: res.data.lolo_data.payment_type,
          });
          dispatch({
            type: GATE_OUT_LOLO_AMOUNT,
            payload: res.data.lolo_data.lolo_amount,
          });
          dispatch({
            type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_FETCH,
            payload: res.data.lolo_data,
          });
          dispatch({
            type: "SET_NEW_GIH_PK",
            payload: res.data.gih_pk,
          });
        } else if (res.data.container_no) {
          dispatch({ type: GATE_OUT_CONTAINER_SEARCH, payload: res.data });
        } else if (res.data.errorMsg) {
          dispatch({
            type: GATE_OUT_CONTAINER_SEARCH,
            payload: res.data,
          });
        } else if (res.data.seal_no_list) {
          dispatch({
            type: GATE_SEAL_NUMBER_LISITING,
            payload: res.data,
          });
        }
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        dispatch({ type: "STOP_LOADING" });
        if (err?.response?.data.code === "token_not_valid") {
          alert("Session expired please login again", {
            variant: "info",
          });
        } else {
          console.error(err);
          alert(err, {
            variant: "error",
          });
        }
      });
  };

// LOLO PAYMENT SEARCH
export const gateLoloPaymentSearch = (body) => (dispatch) => {
  axiosInstance
    .post("depot/lolo_payment_search/", body)
    .then((res) => {
      dispatch({
        type: GET_GATE_OUT_LOLO_PAYMENT_SEARCH_RESULT,
        payload: res.data,
      });
    })
    .catch((err) => {
      if (err.response.data.code === "token_not_valid") {
        alert("Session expired please login again", {
          variant: "info",
        });
      } else {
        console.error(err.response.data);
        alert(err.response, {
          variant: "error",
        });
      }
    });
};

// SAVE
export const saveGateOutInfo = (body, alert, setDisableSave) => (dispatch) => {
  if (
    body?.lolo_data?.payment_type !== "NEFT" &&
    body?.lolo_data?.payment_type !== "RTGS" &&
    body?.lolo_data?.payment_type !== "Cheque"
  ) {
    body.lolo_data.lolo_payment = "";
  }
  if (
    body?.self_transportation_data?.payment_type !== "NEFT" &&
    body?.self_transportation_data?.payment_type !== "RTGS" &&
    body?.self_transportation_data?.payment_type !== "Cheque"
  ) {
    if (body.self_transportation_data) {
      body.self_transportation_data.self_transportation_payment = "";
    }
  }

  dispatch(startLoading());
  body.lolo_data.lolo_amount = body.lolo_data.lolo_amount.toString();
  axiosInstance
    .post("depot/gate_out/", body)
    .then((res) => {
      if (res.data.successMsg) {
        alert(res.data.successMsg, {
          variant: "success",
        });
        if (setDisableSave) {
          setDisableSave(true);
        }
        // dispatch({ type: "RESET_GATE_IN_FORM" });
        dispatch({ type: "SET_GATE_OUT_GIH_PK", payload: res.data.goh_pk });

        if (
          body.self_transportation_data === "" ||
          body.self_transportation_data === undefined
        ) {
          dispatch({ type: "SET_ENABLE_OUT_TRANSPORTATION" });
        } else {
          dispatch({ type: "SET_DISABLE_OUT_TRANSPORTATION" });
        }
        // window.location.reload();
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
      dispatch(stopLoading());
    })
    .catch((err) => {
      console.error(err.response);
      if (err.response.data.code === "token_not_valid") {
        alert("Session expired please login again", {
          variant: "info",
        });
      } else {
        console.error(err.response);
        alert(err.response, {
          variant: "error",
        });
      }
      dispatch(stopLoading());
    });
};

export const updateGateOutDetails =
  (body, alert) => async (dispatch, getState) => {
    dispatch(startLoading());
    const location = await getState().user.location;
    const site = await getState().user.site;
    body["location"] = location;
    body["site"] = site;
    if (
      body?.lolo_data?.payment_type !== "NEFT" &&
      body?.lolo_data?.payment_type !== "RTGS" &&
      body?.lolo_data?.payment_type !== "Cheque"
    ) {
      body.lolo_data.lolo_payment = "";
    }
    if (
      body?.self_transportation_data?.payment_type !== "NEFT" &&
      body?.self_transportation_data?.payment_type !== "RTGS" &&
      body?.self_transportation_data?.payment_type !== "Cheque"
    ) {
      if (body.self_transportation_data) {
        body.self_transportation_data.self_transportation_payment = "";
      }
    }
    axiosInstance
      .put("depot/update_gate_out/", body)
      .then((res) => {
        if (res.data.errorMsg) {
          alert(res.data.errorMsg, {
            variant: "error",
          });
        } else {
          alert(res.data.successMsg, {
            variant: "success",
          });
          if (
            body.self_transportation_data === "" ||
            body.self_transportation_data === undefined
          ) {
            dispatch({ type: "SET_ENABLE_OUT_TRANSPORTATION" });
          } else {
            dispatch({ type: "SET_DISABLE_OUT_TRANSPORTATION" });
          }
          // dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
          // window.location.reload();
        }

        dispatch(stopLoading());
      })
      .catch((err) => {
        if (err.response.data.code === "token_not_valid") {
          alert("Session expired please login again", {
            variant: "info",
          });
        }
        dispatch(stopLoading());
      });
  };

// PRINT GATE OUT GATE PASS
export const printOutGatePass = (gih_pk, body) => async () => {
  return axiosInstance
    .post(`depot/gate_out_pass/${gih_pk}/`, body, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      if (res.data) {
        downloadReceipts(res.data, "Gate-Pass");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// DO CHALAAN
export const gateOutDOUpload = (file, gih_pk, alert) => async () => {
  try {
    const res = await axiosInstance.post(
      `depot/out_do_upload/${gih_pk}/`,
      file,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (res.data.successMsg) {
      alert(res.data.successMsg, {
        variant: "success",
      });
    } else {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const gateOutDODownload = (gih_pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`depot/out_do_download/${gih_pk}/`, {
      responseType: "arraybuffer",
    });
    downloadReceipts(res.data, "DO Chalaan");
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};
