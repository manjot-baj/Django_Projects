import axiosInstance from "@/AxiosExtend"
let tempJson = {};

export const getPurchaseListing = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_purchase_master/`,
      data
    );
    dispatch({ type: "GET_ALL_PURCHASE", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const canclePurchaseEffect = (pk) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_purchase_master/cancel_transaction/${pk}/`,
    );
    dispatch({ type: "CANCEL_PURCHASE_EFFECT", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const getPurchaseLR = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_purchase_lr_data/`,
      data
    );
    dispatch({ type: "GET_PURCHASE_LR", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const deletePurchaseData = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(
      `transportation/get_all_purchase_master/delete/${data}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Purchase deleted successfully", { variant: "success" });
      history.push("/transport/purchase");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "DELETE_PURCHASE", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};

export const deletePurchaseReset = () => async (dispatch) =>{
  dispatch({ type: "DELETE_PURCHASE_RESET"});
}

export const addPurchase = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`transportation/add_purchase_master/`, data);
    if (res.data.successMsg) {
      alert("Purchase added successfully", { variant: "success" });
      history.push("/transport/purchase");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_PURCHASE", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};

export const updatePurchase = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `transportation/get_all_purchase_master/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Purchase Updated successfully", { variant: "success" });
      history.push("/transport/purchase");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_PURCHASE", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};


export const getPurchaseDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_purchase_master/${id}/`
    );
    dispatch({ type: "GET_PURCHASE", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearPurchaseData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_PURCHASE_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
