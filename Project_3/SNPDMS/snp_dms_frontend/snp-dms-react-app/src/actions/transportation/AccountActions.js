import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getAccountListing = (data, currentPage) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_account/`,
      data
    );
    dispatch({ type: "GET_ALL_ACCOUNTS", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const deleteAccountData = (data, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_account/delete/`,
      data
    );
    if (res.data.successMsg) {
      alert("Account deleted successfully", { variant: "success" });
      dispatch({ type: "DELETE_ACCOUNT", payload: res.data.successMsg });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
      dispatch({ type: "DELETE_ACCOUNT", payload: res.data.errorMsg });
    }
  } catch (err) {
    console.log(err);
  }
};
export const deleteAccountReset = () => async (dispatch) => {
    dispatch({ type: "DELETE_ACCOUNT_RESET" });
};

export const addAccount = (data, history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(`transportation/add_account/`, data);
    if (res.data.successMsg) {
      alert("Account added successfully", { variant: "success" });
      history.push("/transport/account");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_ACCOUNT", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateAccount = (data, history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_account/${data.pk}/`,
      data
    );
    dispatch({ type: "UPDATE_ACCOUNT", payload: res.data.successMsg });
    if (res.data.successMsg) {
      alert("Account Updated successfully", { variant: "success" });
      history.push("/transport/account");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    console.log(err);
  }
};
export const getAccountDetailsById = (data) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_account/${data}/`
    );
    dispatch({ type: "GET_ACCOUNT", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearAccountData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_ACCOUNT_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
