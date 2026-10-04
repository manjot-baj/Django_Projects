import { axiosInstance } from "../../Axios";
import { clearCheck } from "./ClientMasterActions";

export const getTransportationChargesListings = (data,alert) => async (dispatch) => {
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(
      `master/transportation_charge/all/`,
      data
    );
    dispatch({
      type: "GET_ALL_TRANSPORTATION_CHARGES",
      payload: res.data.data,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });
  }
};

export const getSingleContainerTransportationCharges =
  (pkId, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.get(
        `master/transportation_charge/${pkId}/`
      );
      if (!res.data.errorMsg)
        dispatch({
          type: "GET_SINGLE_CONTAINER_TRANSPORTATION_CHARGE_DETAIL",
          payload: res.data,
        });
      else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }
  };

export const addMasterContainerTransportationCharges =
  (containerTransportationChargeBodyData, history, alert) =>
  async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `master/transportation_charge/add/`,
        containerTransportationChargeBodyData
      );
      if (res.data.successMsg) {
        alert("Transportation Charge created successfully", {
          variant: "success",
        });
        history.push("/master/containerTransportationCharges");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }
  };

export const updateMasterContainerTransportationCharges =
  (pkId, containerTransportationChargesBodyData, history, alert) =>
  async () => {
    try {
      const res = await axiosInstance.put(
        `master/transportation_charge/${pkId}/update/`,
        containerTransportationChargesBodyData
      );
      if (res.data.successMsg) {
        alert("Container Transportation Charge updated successfully", {
          variant: "success",
        });
        history.push("/master/containerTransportationCharges");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }
  };

  export const deleteContainerTransportationChargeListings = ( deleteIDs, alert, data ) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `master/transportation_charge/delete/`,
        deleteIDs
      );
      dispatch(clearCheck());
      dispatch(getTransportationChargesListings(data));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }
  };