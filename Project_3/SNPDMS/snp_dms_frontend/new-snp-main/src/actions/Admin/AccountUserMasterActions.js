import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

export const getSingleUser = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`account/get_all_user/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_ACCOUNT_USER_DETAIL",
        payload: res.data,
      });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const addUser = (userBodyData, history, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(`account/add_user/`, userBodyData);
    if (res.data.successMsg) {
      alert("User created successfully", { variant: "success" });
      history.push("/account/user");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const updateUser =
  (pkId, userBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.put(
        `account/get_all_user/${pkId}/`,
        userBodyData,
      );
      if (res.data.successMsg) {
        alert("User updated successfully", { variant: "success" });
        history.push("/account/user");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const deleteUserListings = (deleteIDs, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(
      `account/get_all_user/delete/`,
      deleteIDs,
    );
    dispatch(clearCheck());
    dispatch(getUserListings());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(stopLoading());
  }
};

// put filter changes fixes for user listing
export const getUserListings =
  (filter = {}) =>
  async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post("account/get_all_user/", filter);
      dispatch({ type: "GET_ACCOUNT_USER", payload: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(stopLoading());
    }
  };
