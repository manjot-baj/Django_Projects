import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

// Action
export const getLocationListings =
  (filter = {}, alert) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post("master/location/all/", filter);
      dispatch({ type: "GET_ALL_LOCATIONS", payload: res.data });
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const getSingleLocation = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`master/location/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_LOCATION_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const addMasterLocation =
  (locationBodyData, history, alert) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/location/add/`,
        locationBodyData,
      );
      if (res.data.successMsg) {
        alert("Location created successfully", {
          variant: "success",
        });
        history.push("/master/location");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateMasterLocation =
  (pkId, locationBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.put(
        `master/location/${pkId}/update/`,
        locationBodyData,
      );
      if (res.data.successMsg) {
        alert("Location updated successfully", {
          variant: "success",
        });
        history.push("/master/location");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteLocationListings =
  (deleteIDs, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `master/location/delete/`,
        deleteIDs,
      );
      dispatch(clearCheck());
      dispatch(getLocationListings());
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }
  };
