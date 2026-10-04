import { axiosInstance } from "../../Axios";
import { clearCheck } from "../Master/ClientMasterActions";

// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getStaffMasterListing = (data) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post("mnr/get_all_staff/", data);
    console.log(res.data);

    dispatch({ type: "GET_STAFF_MASTER", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const getSingleStaffMaster = (pkId, alert, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`/mnr/get_all_staff/${pkId}/`, data);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_STAFF_MASTER_DETAIL",
        payload: res.data,
      });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    // alert(err.response, { variant: "error" });
    console.log(err);
  }
};

export const addStaffMaster = (userBodyData, history, alert) => async () => {
  try {
    const res = await axiosInstance.post(`mnr/add_staff/`, userBodyData);
    if (res.data.successMsg) {
      alert("Staff Master created successfully", { variant: "success" });
      history.push("/master/staffMaster");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const updateStaffMaster =
  (pkId, userBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `/mnr/get_all_staff/${pkId}/`,
        userBodyData
      );
      if (res.data.successMsg) {
        alert("Staff Master updated successfully", { variant: "success" });
        history.push("/master/staffMaster");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, { variant: "error" });
    }
  };


export const deleteStaffMasterListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `/mnr/get_all_staff/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getStaffMasterListing());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  }
};