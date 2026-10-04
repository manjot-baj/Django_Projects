import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

export const getHandlingChargesListings = (data) => async (dispatch) => {
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(`master/handling_charge/all/`, data);
    dispatch({ type: "GET_ALL_HANDLING_CHARGES", payload: res.data.data });
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
  } finally {
    dispatch(stopLoading());
  }
};

export const getSingleContainerHandlingCharge =
  (pkId, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.get(`master/handling_charge/${pkId}/`);
      if (!res.data.errorMsg)
        dispatch({
          type: "GET_SINGLE_CONTAINER_HANDLING_CHARGE_DETAIL",
          payload: res.data,
        });
      else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const addMasterContainerHandlingCharge =
  (containerHandlingChargeBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/handling_charge/add/`,
        containerHandlingChargeBodyData,
      );
      if (res.data.successMsg) {
        alert("Handling Charge created successfully", {
          variant: "success",
        });
        history.push("/master/containerHandlingCharges");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateMasterContainerHandlingCharge =
  (pkId, containerHandlingChargesBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/handling_charge/${pkId}/update/`,
        containerHandlingChargesBodyData,
      );
      if (res.data.successMsg) {
        alert("Container Handling Charge updated successfully", {
          variant: "success",
        });
        history.push("/master/containerHandlingCharges");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const deleteContainerHandlingChargeListings =
  (deleteIDs, alert, data) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/handling_charge/delete/`,
        deleteIDs,
      );
      dispatch(clearCheck());
      dispatch(getHandlingChargesListings(data));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
