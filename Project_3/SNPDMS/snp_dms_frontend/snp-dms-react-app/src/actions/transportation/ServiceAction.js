import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getServiceListing = (data, currentPage) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_service_tax/`,
      data
    );
    console.log(res,"response");
    dispatch({ type: "GET_ALL_SERVICES", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};

export const deleteServiceData = (data, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_service_tax/delete/`,
      data
    );
    if (res.data.successMsg) {
      alert("Service deleted successfully", { variant: "success" });
      dispatch({ type: "DELETE_SERVICE", payload: res.data.successMsg });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
      dispatch({ type: "DELETE_SERVICE", payload: res.data.errorMsg });
    }
    
  } catch (err) {
    console.log(err);
  }
};

export const deleteServiceReset = () => async (dispatch) => {
  dispatch({ type: "DELETE_SERVICE_RESET" });
};
export const addService = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/add_service_tax/`,
      data
    );
    if (res.data.successMsg) {
      alert("Service added successfully", { variant: "success" });
      history.push("/transport/service");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_SERVICE", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateService = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_service_tax/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Service Updated successfully", { variant: "success" });
      history.push("/transport/service");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_SERVICE", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getServiceDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_service_tax/${id}/`
    );
    dispatch({ type: "GET_SERVICE", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearServiceData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_SERVICE_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
