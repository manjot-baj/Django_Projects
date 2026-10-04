import axiosInstance from "@/AxiosExtend"
let tempJson = {};

export const getContraListing = (data, currentPage) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_contra_entry/`,
      data
    );
    dispatch({ type: "GET_ALL_CONTRAS", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};


export const addContra = (data, history, alert) => async (dispatch) => {
  console.log("data", data);
  try {
    const res = await axiosInstance.post(`transportation/add_contra_entry/`, data);
    if (res.data.successMsg) {
      alert("Contra added successfully", { variant: "success" });
      history.push("/voucher/contraentry");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_CONTRA", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};

export const deleteContraData = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(
      `transportation/get_all_contra_entry/delete/${data}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Contra deleted successfully", { variant: "success" });
      history.push("/voucher/contraentry");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "DELETE_CONTRA", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};

export const updateContra = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(
      `transportation/get_all_contra_entry/delete/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Contra Deleted successfully", { variant: "success" });
      history.push("/voucher/contraentry");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_CONTRA", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};

export const getContraDetailsById = (id) => async (dispatch) => {
  console.log("id", id);
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_contra_entry/${id}/`
    );
    dispatch({ type: "GET_CONTRA", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearContraData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_CONTRA_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
