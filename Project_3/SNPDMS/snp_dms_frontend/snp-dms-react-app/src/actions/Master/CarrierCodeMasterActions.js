import { axiosInstance } from "../../Axios";
import { clearCheck } from "./ClientMasterActions";
let tempJson = {};

export const getCarrierCodeListings = (data,alert) => async (dispatch) => {
  tempJson = data;
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(`master/carrier_code/all/`, data);
    console.log("Carrier Code Response", res.data);
    dispatch({ type: "GET_ALL_CARRIER_CODE", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const getSingleCarrierCode = (pkId, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`master/carrier_code/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_CARRIER_CODE_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const addMasterCarrierCode =
  (clientBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.post(
        `master/carrier_code/add/`,
        clientBodyData
      );
      if (res.data.successMsg) {
        alert("Carrier Code created successfully", { variant: "success" });
        history.push("/master/carrier-code");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const updateMasterCarrierCode =
  (pkId, clientBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `master/carrier_code/${pkId}/update/`,
        clientBodyData
      );
      if (res.data.successMsg) {
        alert("Carrier Code updated successfully", { variant: "success" });
        history.push("/master/carrier-code");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const deleteCarrierCodeListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `master/carrier_code/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getCarrierCodeListings(tempJson));
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};