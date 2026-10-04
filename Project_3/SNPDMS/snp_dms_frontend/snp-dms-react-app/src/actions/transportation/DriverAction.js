import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getDriverListing = (data, currentPage) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_driver/`,
      data
    );
    dispatch({ type: "GET_ALL_DRIVERS", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const deleteDriverData = (data, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_driver/delete/`,
      data
    );
    if (res.data.successMsg) {
      alert("Driver deleted successfully", { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "DELETE_DRIVER", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const deleteDriverReset = () => async (dispatch) => {
    dispatch({ type: "DELETE_DRIVER_RESET" });
};

export const addDriver = (data, history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(`transportation/add_driver/`, data);
    if (res.data.successMsg) {
      alert("Driver added successfully", { variant: "success" });
      history.push("/transport/driver");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_DRIVER", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateDriver = (data, history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_driver/${data.pk}/`,
      data
    );
    dispatch({ type: "UPDATE_DRIVER", payload: res.data.successMsg });
    if (res.data.successMsg) {
      alert("Driver Updated successfully", { variant: "success" });
      history.push("/transport/driver");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    console.log(err);
  }
};
export const getDriverDetailsById = (data) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_driver/${data}/`
    );
    dispatch({ type: "GET_DRIVER", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearDriverData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_DRIVER_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
