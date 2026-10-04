import { axiosInstance } from "../../Axios";
import { clearCheck } from "./ClientMasterActions";

export const getContainerTypeListings = (alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get("master/type/all/");
    dispatch({ type: "GET_ALL_TYPE", payload: res.data });
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });

  }
};

export const getSingleContainerType = (pkId, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`master/type/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_CONTAINER_TYPE_DETAIL",
        payload: res.data,
      });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });

  }
};

export const addMasterContainerType =
  (containerTypeBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.post(
        `master/type/add/`,
        containerTypeBodyData
      );
      if (res.data.successMsg) {
        alert("Container Type created successfully", { variant: "success" });
        history.push("/master/containerType");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });

    }
  };

export const updateMasterContainerType =
  (pkId, containerTypeBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `master/type/${pkId}/update/`,
        containerTypeBodyData
      );
      if (res.data.successMsg) {
        alert("Container Type updated successfully", { variant: "success" });
        history.push("/master/containerType");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });

    }
  };

export const deleteContainerTypeListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `master/type/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getContainerTypeListings());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });

  }
};