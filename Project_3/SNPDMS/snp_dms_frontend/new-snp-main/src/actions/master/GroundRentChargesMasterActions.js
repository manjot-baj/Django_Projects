import axiosInstance from "@/AxiosExtend"
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";


// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getGroundRentChargesListings =
  (data, alert) => async (dispatch) => {
    tempJson = data;
    dispatch({
      type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
    });
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(`master/ground_rent/all/`, data);
      dispatch({ type: "GET_ALL_GROUND_RENT_CHARGES", payload: res.data.data });
      dispatch({
        type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
        payload: res.data.next_page,
      });
      dispatch({
        type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
        payload: res.data.prev_page,
      });
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const getSingleContainerGroundRentCharge =
  (pkId, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.get(`master/ground_rent/${pkId}/`);
      if (!res.data.errorMsg)
        dispatch({
          type: "GET_SINGLE_CONTAINER_GROUND_RENT_CHARGE_DETAIL",
          payload: res.data,
        });
      else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const addMasterContainerGroundRentCharge =
  (containerGroundRentChargesBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/ground_rent/add/`,
        containerGroundRentChargesBodyData
      );
      if (res.data.successMsg) {
        alert("Ground Rent Charge created successfully", {
          variant: "success",
        });
        history.push("/master/containerGroundRentCharges");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const updateMasterContainerGroundRentCharge =
  (pkId, containerGroundRentChargesBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/ground_rent/${pkId}/update/`,
        containerGroundRentChargesBodyData
      );
      if (res.data.successMsg) {
        alert("Container Ground Rent Charge updated successfully", {
          variant: "success",
        });
        history.push("/master/containerGroundRentCharges");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });

      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const deleteContainerGroundRentChargeListings =
  (deleteIDs, alert, data) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/ground_rent/delete/`,
        deleteIDs
      );
      dispatch(clearCheck());
      dispatch(getGroundRentChargesListings(data));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };
