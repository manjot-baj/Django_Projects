import axiosInstance from "@/AxiosExtend"
let tempJson = {};

export const getCreditorListing = (data, currentPage) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_creditor/`,
      data
    );
    dispatch({ type: "GET_ALL_CREDITORS", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};


export const deleteCreditorData = (data, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_creditor/delete/`,
      data
    );
    if (res.data.successMsg) {
      alert("Creditor deleted successfully", { variant: "success" });
      dispatch({ type: "DELETE_CREDITOR", payload: res.data.successMsg });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
      dispatch({ type: "DELETE_CREDITOR", payload: res.data.errorMsg });
    }
    
  } catch (err) {
    console.log(err);
  }
};

export const deleteCreditorReset = () => async (dispatch) =>{
  dispatch({type:"DELETE_CREDITOR_RESET"});
}

export const addCreditor = (data, history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(`transportation/add_creditor/`, data);
    if (res.data.successMsg) {
      alert("Creditor added successfully", { variant: "success" });
      history.push("/transport/creditor");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_CREDITOR", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateCreditor = (data, history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_creditor/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Creditir Updated successfully", { variant: "success" });
      history.push("/transport/creditor");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_CREDITOR", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getCreditorDetailsById = (data) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_creditor/${data}/`
    );
    dispatch({ type: "GET_CREDITOR", payload: res?.data });
  } catch (err) {
    console.log(err);
  }
};

export const clearCreditorData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_CREDITOR_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
