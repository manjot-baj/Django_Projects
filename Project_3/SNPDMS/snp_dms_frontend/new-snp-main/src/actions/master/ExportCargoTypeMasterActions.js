import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

export const getExportCargoTypeListings = (alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get("master/export_cargo_type/all/");
    dispatch({ type: "GET_ALL_EXPORT_CARGO_TYPE", payload: res.data });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getSingleExportCargoType = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`master/export_cargo_type/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_EXPORT_CARGO_TYPE_DETAIL",
        payload: res.data,
      });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const addMasterExportCargoType =
  (exportCargoTypeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/export_cargo_type/add/`,
        exportCargoTypeBodyData,
      );
      if (res.data.successMsg) {
        alert("Export Cargo Type created successfully", { variant: "success" });
        history.push("/master/exportCargoType");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateMasterExportCargoType =
  (pkId, exportCargoTypeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/export_cargo_type/${pkId}/update/`,
        exportCargoTypeBodyData,
      );
      if (res.data.successMsg) {
        alert("Export Cargo Type updated successfully", { variant: "success" });
        history.push("/master/exportCargoType");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const deleteExportCargoTypeListings =
  (deleteIDs, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/export_cargo_type/delete/`,
        deleteIDs,
      );
      dispatch(clearCheck());
      dispatch(getExportCargoTypeListings());
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
