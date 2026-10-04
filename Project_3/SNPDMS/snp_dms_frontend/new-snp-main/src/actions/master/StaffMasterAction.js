import axiosInstance from "@/AxiosExtend"
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";


// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getStaffMasterListing = (data) => async (dispatch) => {
  dispatch(startLoading())
  tempJson = data;
  try {
    const res = await axiosInstance.post("mnr/get_all_staff/", data);
    console.log(res.data);

    dispatch({ type: "GET_STAFF_MASTER", payload: res.data });
  } catch (err) {
    console.log(err);
  }finally{
    dispatch(stopLoading())
  }
};

export const getSingleStaffMaster = (pkId, alert, data) => async (dispatch) => {
  dispatch(startLoading())
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
  }finally{
    dispatch(stopLoading())
  }
};

export const addStaffMaster = (userBodyData, history, alert) => async (dispatch) => {
  dispatch(startLoading())
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
  }finally{
    dispatch(stopLoading())
  }
};

export const updateStaffMaster =
  (pkId, userBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
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
    }finally{
      dispatch(stopLoading())
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
    alert(err?.response?.data?.errorMsg,{variant:"error"})
  }
};