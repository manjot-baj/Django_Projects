import axiosInstance from "@/AxiosExtend"
import { startLoading, stopLoading } from "./UIActions";

export const getMainDashboardDetailsDispatch =
  () => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading())
    axiosInstance
      .post("dashboard/", {
        location: location,
        site: site,
      })
      .then((res) => {
        dispatch({ type: "GET_MAIN_DASHBOARD_DETAILS", payload: res.data });
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const getMovementSummaryByTimeDispatch =
  (body, ediSummary) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    axiosInstance
      .post("dashboard/movement_summary/", {
        requirement: body,
        location: location,
        site: site,
        edi_summary: ediSummary
      })
      .then((res) => {
        dispatch({
          type: "SET_DASHBOARD_MOVEMENT_SUMMARY",
          payload: res.data.movement_summary,
        });
        dispatch({
          type: "SET_EDI_SUMMARY",
          payload: ediSummary,
        });
      })
      .catch((err) => {
        console.log("Dashboard movement summary Error !", err);
      });
  };

export const getInventoryByTimeDispatch =
  (body) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    axiosInstance
      .post("dashboard/inventory/", {
        requirement: body,
        location: location,
        site: site,
      })
      .then((res) => {
        console.log(res.data);
        dispatch({
          type: "SET_DASHBOARD_INVENTORY",
          payload: res.data.inventory,
        });
      })
      .catch((err) => {
        console.log("Dashboard movement summary Error !", err);
      });
  };

export const getVolumeAndRevenueByTimeDispatch =
  (bodyYear, bodyWeek, process) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    axiosInstance
      .post("dashboard/volume_revenue/", {
        year: bodyYear,
        week_num: bodyWeek,
        process: process,
        location: location,
        site: site,
      })
      .then((res) => {
        dispatch({
          type: "SET_DASHBOARD_VOLUME_REVENUE",
          payload: res.data.volume_revenue_data,
        });
      })
      .catch((err) => {
        console.log("Dashboard movement summary Error !", err);
      });
  };

export const getRevenueByTimeDispatch =
  (body) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    console.log("Body is", body);
    axiosInstance
      .post("dashboard/revenue/", {
        requirement: body,
        location: location,
        site: site,
      })
      .then((res) => {
        console.log(res.data);
        dispatch({
          type: "SET_DASHBOARD_REVENUE",
          payload: res.data.revenue_data,
        });
      })
      .catch((err) => {
        console.log("Dashboard movement summary Error !", err);
      });
  };

export const getTopClientRevenueByTimeDispatch =
  (body) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    console.log("Body is", body);
    axiosInstance
      .post("dashboard/top_client_revenue/", {
        requirement: body,
        location: location,
        site: site,
      })
      .then((res) => {
        dispatch({
          type: "SET_DASHBOARD_TOP_CLIENT_REVENUE",
          payload: res.data.top_client_revenue_data,
        });
        dispatch({
          type: "SET_DASHBOARD_INWARD_TOP_CLIENT_REVENUE",
          payload: res.data.inward_top_client_revenue_data,
        });
        dispatch({
          type: "SET_DASHBOARD_OUTWARD_TOP_CLIENT_REVENUE",
          payload: res.data.outward_top_client_revenue_data,
        });
        dispatch({
          type: "SET_DASHBOARD_INWARD_HANDLING_TOP_CLIENT_REVENUE",
          payload: res.data.inward_handling_top_client_revenue_data,
        });
        dispatch({
          type: "SET_DASHBOARD_OUTWARD_HANDLING_TOP_CLIENT_REVENUE",
          payload: res.data.outward_handling_top_client_revenue_data,
        });
        dispatch({
          type: "SET_DASHBOARD_TRANSPORTATION_TOP_CLIENT_REVENUE",
          payload: res.data.transportation_top_client_revenue_data,
        });
      })
      .catch((err) => {
        console.log("Dashboard movement summary Error !", err);
      });
  };
