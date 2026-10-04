import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getCustomerListing = (data, currentPage) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_customer/`,
      data
    );
    dispatch({ type: "GET_ALL_CUSTOMERS", payload: res.data.data });
  } catch (err) {
  console.log(err);
  }
};

export const deleteCustomerData = (data, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_customer/delete/`,
      data
    );
    if (res.data.successMsg) {
      alert("Customer deleted successfully", { variant: "success" });
      dispatch({ type: "DELETE_CUSTOMER", payload: res.data.successMsg });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
      dispatch({ type: "DELETE_CUSTOMER", payload: res.data.errorMsg });
    }
    
  } catch (err) {
    console.log(err);
  }
};

export const deleteCustomerReset = () => async (dispatch) => {
  dispatch({ type: "DELETE_CUSTOMER_RESET" });
};

export const addCustomer = (data, history, alert) => async (dispatch) => {
  console.log("data", data);
  try {
    const res = await axiosInstance.post(`transportation/add_customer/`, data);
    if (res.data.successMsg) {
      alert("Customer added successfully", { variant: "success" });
      history.push("/transport/customer");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_CUSTOMER", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateCustomer = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_customer/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Customer Updated successfully", { variant: "success" });
      history.push("/transport/customer");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_CUSTOMER", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getCustomerDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_customer/${id}/`
    );
    dispatch({ type: "GET_CUSTOMER", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearCutomerData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_CUSTOMER_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
