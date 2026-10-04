import { axiosInstance } from "../../Axios";
import { clearCheck } from "../Master/ClientMasterActions";

export const getRoleListings = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("account/get_all_role/");
    dispatch({ type: "GET_ALL_ROLES", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const getSingleRole = (pkId) => async (dispatch) => {
  console.log("FROM ACTIONS pk is", pkId);
  try {
    const res = await axiosInstance.get(`account/get_all_role/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({
        type: "GET_SINGLE_ROLE_DETAIL",
        payload: res.data,
      });
      
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response, { variant: "error" });
  }
};


export const addAccountRole = (roleBodyData, history, alert) => async () => {
  try {
    const res = await axiosInstance.post(`account/add_role/`, roleBodyData);
    if (res.data.successMsg) {
      alert("Role created successfully", { variant: "success" });
      history.push("/account/role");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, { variant: "error" });
  }
};

export const updateAccountRole =
  (pkId, roleBodyData, history, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.put(
        `account/get_all_role/${pkId}/`,
        roleBodyData
      );
      if (res.data.successMsg) {
        alert("Role updated successfully", { variant: "success" });
        history.push("/account/role");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, { variant: "error" });
    }
  };

export const deleteRoleListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `account/get_all_role/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getRoleListings());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  }
};