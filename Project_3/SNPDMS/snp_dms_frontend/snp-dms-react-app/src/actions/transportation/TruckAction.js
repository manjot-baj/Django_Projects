import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getTruckListing = (data, currentPage) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_truck/`,
      data
    );
    dispatch({ type: "GET_ALL_TRUCK", payload: res.data.data });
    console.log(res.data.data,"res.data.data")
  } catch (err) {
    console.log(err);
  }
};
export const deleteTruckData = (data, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_truck/delete/`,
      data
    );
    if (res.data.successMsg) {
      alert("Truck deleted successfully", { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "DELETE_TRUCK", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const deleteTruckReset = () => async (dispatch) => {
  dispatch({ type: "DELETE_TRUCK_RESET" });
};

export const addTruck = (data, history, alert) => async (dispatch) => {
  console.log("data", data);
  try {
    const res = await axiosInstance.post(`transportation/add_truck/`, data);
    if (res.data.successMsg) {
      alert("Truck added successfully", { variant: "success" });
      history.push("/transport/truck");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_TRUCK", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateTruck = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_truck/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Truck Updated successfully", { variant: "success" });
      history.push("/transport/truck");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_TRUCK", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getTruckDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_truck/${id}/`
    );
    dispatch({ type: "GET_TRUCK", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearTruckData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_TRUCK_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
