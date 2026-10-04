import { axiosInstance } from "../../Axios";
import { clearCheck } from "../Master/ClientMasterActions";

export const getRefCodeListings = (alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/master/ref_code/all/");
    dispatch({ type: "GET_ALL_REF_CODE", payload: res.data });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const getSingleRefCode = (pkId) => async (dispatch) => {
  console.log("FROM ACTIONS pk is", pkId);
  try {
    const res = await axiosInstance.get(`/master/ref_code/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_REF_CODE_DETAIL",
        payload: res.data,
      });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const addAccountRefCode = (roleBodyData, history, alert) => async () => {
  try {
    const res = await axiosInstance.post(`/master/ref_code/add/`, roleBodyData);
    if (res.data.successMsg) {
      alert("Ref Code created successfully", { variant: "success" });
      history.push("/master/refcode");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const updateAccountRefCode =
  (pkId, roleBodyData, history, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.put(
        `/master/ref_code/${pkId}/update/`,
        roleBodyData
      );
      if (res.data.successMsg) {
        alert("Ref Code updated successfully", { variant: "success" });
        history.push("/master/refcode");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };


export const deleteRefCodeListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `master/ref_code/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getRefCodeListings());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};