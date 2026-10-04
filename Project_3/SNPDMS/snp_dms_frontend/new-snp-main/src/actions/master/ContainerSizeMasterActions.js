import axiosInstance from "@/AxiosExtend"
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";


export const getContainerSizeListings = (alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.get("master/size/all/");
    dispatch({ type: "GET_ALL_SIZE", payload: res.data });
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });
  }finally{
    dispatch(stopLoading())
  }
};

export const getSingleContainerSize = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.get(`master/size/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_CONTAINER_SIZE_DETAIL",
        payload: res.data,
      });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });

  }finally{
    dispatch(stopLoading())
  }
};

export const addMasterContainerSize =
  (containerSizeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/size/add/`,
        containerSizeBodyData
      );
      if (res.data.successMsg) {
        alert("Container Size created successfully", { variant: "success" });
        history.push("/master/containerSize");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const updateMasterContainerSize =
  (pkId, containerSizeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/size/${pkId}/update/`,
        containerSizeBodyData
      );
      if (res.data.successMsg) {
        alert("Container Size updated successfully", { variant: "success" });
        history.push("/master/containerSize");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };

export const deleteContainerSizeListings =
  (deleteIDs, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(`master/size/delete/`, deleteIDs);
      dispatch(clearCheck());
      dispatch(getContainerSizeListings());
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };
