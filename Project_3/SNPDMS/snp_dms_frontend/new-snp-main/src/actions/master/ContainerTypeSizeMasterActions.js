import axiosInstance from "@/AxiosExtend"
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";


export const getContainerTypeSizeCodeListings = (alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.get("master/type_size_code/all/");
    dispatch({ type: "GET_ALL_TYPE_SIZE_CODE", payload: res.data });
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });

  }finally{
    dispatch(stopLoading())
  }
};

export const getSingleContainerTypeSizeCode =
  (pkId, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.get(
        `master/type_size_code/${pkId}/`
      );
      if (!res.data.errorMsg)
        dispatch({
          type: "GET_SINGLE_CONTAINER_TYPE_SIZE_CODE_DETAIL",
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

export const addMasterContainerTypeSizeCode =
  (containerTypeSizeCodeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/type_size_code/add/`,
        containerTypeSizeCodeBodyData
      );
      if (res.data.successMsg) {
        alert("Container Type Size Code created successfully", {
          variant: "success",
        });
        history.push("/master/containerTypeSizeCode");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };

export const updateMasterContainerTypeSizeCode =
  (pkId, containerTypeSizeCodeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/type_size_code/${pkId}/update/`,
        containerTypeSizeCodeBodyData
      );
      if (res.data.successMsg) {
        alert("Container Type Size Code updated successfully", {
          variant: "success",
        });
        history.push("/master/containerTypeSizeCode");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };

  export const deleteContainerTypeSizeCodeListings = ( deleteIDs, alert ) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/type_size_code/delete/`,
        deleteIDs
      );
      dispatch(clearCheck());
      dispatch(getContainerTypeSizeCodeListings());
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