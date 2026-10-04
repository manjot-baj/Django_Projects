import { axiosInstance } from "../../Axios";
import { USER_INFO } from "../../reducers/UserReducer";
import { clearCheck } from "./ClientMasterActions";

export const getSiteListings = (alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("master/site/all/");
    dispatch({ type: "GET_ALL_SITES", payload: res.data });
  } catch (err) {
    alert(err.response?.data?.errorMsg, { variant: "error" });
  }
};

export const getSingleSite = (pkId, alert,fetchData) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`master/site/${pkId}/`);
    if (!res.data.errorMsg){
      dispatch({ type: "GET_SINGLE_SITE_DETAIL", payload: res.data });
      
    }
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });

  }
};

export const addMasterSite = (siteBodyData, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`master/site/add/`, siteBodyData);
    if (res.data.successMsg) {
      localStorage.setItem("mnr_module", siteBodyData.mnr_module);
      if (
        siteBodyData.transportation_module === "" ||
        siteBodyData.transportation_module === false
      ) {
        dispatch({
          type: "SET_TRANSPORTATION_MODULE",
          payload: false,
        });
        localStorage.setItem("transportation_module", false);
      } else {
        dispatch({
          type: "SET_TRANSPORTATION_MODULE",
          payload: true,
        });
        localStorage.setItem("transportation_module", true);
      }
      if (
        siteBodyData.new_billing_module === "" ||
        siteBodyData.new_billing_module === false
      ) {
        dispatch({
          type: "SET_NEW_BILLING_MODULE",
          payload: false,
        });
        localStorage.setItem("new_billing_module", false);
      } else {
        dispatch({
          type: "SET_NEW_BILLING_MODULE",
          payload: true,
        });
        localStorage.setItem("new_billing_module", true);
      }

      if (
        siteBodyData.loaded_yard_module === "" ||
        siteBodyData.loaded_yard_module === false
      ) {
        dispatch({
          type: "SET_LOADED_EMPTY_YARD_MODULE",
          payload: false,
        });
        localStorage.setItem("loaded_yard_module", false);
      } else {
        dispatch({
          type: "SET_LOADED_EMPTY_YARD_MODULE",
          payload: true,
        });
        localStorage.setItem("loaded_yard_module", true);
      }

      if (
        siteBodyData.lolo_finance === "" ||
        siteBodyData.lolo_finance === false
      ) {
        dispatch({
          type: USER_INFO.LOLO_FINANCE_MODULE,
          payload: false,
        });
        localStorage.setItem("lolo_finance", false);
      } else {
        dispatch({
          type: USER_INFO.LOLO_FINANCE_MODULE,
          payload: true,
        });
        localStorage.setItem("lolo_finance", true);
      }

      if (
        siteBodyData.procurement_module === "" ||
        siteBodyData.procurement_module === false
      ) {
        dispatch({
          type: USER_INFO.PROCUREMENT_MODULE,
          payload: false,
        });
        localStorage.setItem("procurement_module", false);
      } else {
        dispatch({
          type: USER_INFO.PROCUREMENT_MODULE,
          payload: true,
        });
        localStorage.setItem("procurement_module", true);
      }
      localStorage.setItem(
        "automatic_mnr_status_change",
        siteBodyData.automatic_mnr_status_change
      );
      alert("Site created successfully", {
        variant: "success",
      });
      history.push("/master/site");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });
  }
};

export const updateMasterSite =
  (pkId, siteBodyData, history, alert) => async (dispatch,getState) => {
    const currentLocation = await getState().user.location
    const currentSite = await getState().user.site
    try {
      const res = await axiosInstance.put(
        `master/site/${pkId}/update/`,
        siteBodyData
      );
      if (res.data.successMsg) {

       if (currentLocation === siteBodyData.location && currentSite ===siteBodyData.name) {
       


        localStorage.setItem("mnr_module", siteBodyData.mnr_module);
        if (
          siteBodyData.transportation_module === "" ||
          siteBodyData.transportation_module === false ||
          siteBodyData.transportation_module === "False"||
          siteBodyData.transportation_module ===null||
          siteBodyData.transportation_module === undefined
        ) {
          dispatch({
            type: "SET_TRANSPORTATION_MODULE",
            payload: false,
          });
          localStorage.setItem("transportation_module", false);
        } else {
          dispatch({
            type: "SET_TRANSPORTATION_MODULE",
            payload: true,
          });
          localStorage.setItem("transportation_module", true);
        }
        if (
          siteBodyData.new_billing_module === "" ||
          siteBodyData.new_billing_module === false||
          siteBodyData.new_billing_module === "False"||
          siteBodyData.new_billing_module ===null||
          siteBodyData.new_billing_module === undefined
        ) {
          dispatch({
            type: "SET_NEW_BILLING_MODULE",
            payload: false,
          });
          localStorage.setItem("new_billing_module", false);
        } else {
          dispatch({
            type: "SET_NEW_BILLING_MODULE",
            payload: true,
          });
          localStorage.setItem("new_billing_module", true);
        }

        if (
          siteBodyData.loaded_yard_module === "" ||
          siteBodyData.loaded_yard_module === false||
          siteBodyData.loaded_yard_module === "False"||
          siteBodyData.loaded_yard_module ===null||
          siteBodyData.loaded_yard_module === undefined
        ) {
          dispatch({
            type: "SET_LOADED_EMPTY_YARD_MODULE",
            payload: false,
          });
          localStorage.setItem("loaded_yard_module", false);
        } else {
          dispatch({
            type: "SET_LOADED_EMPTY_YARD_MODULE",
            payload: true,
          });
          localStorage.setItem("loaded_yard_module", true);
        }

        if (
          siteBodyData.lolo_finance === "" ||
          siteBodyData.lolo_finance === false||
          siteBodyData.lolo_finance === "False"||
          siteBodyData.lolo_finance ===null||
          siteBodyData.lolo_finance === undefined
        ) {
          dispatch({
            type: USER_INFO.LOLO_FINANCE_MODULE,
            payload: false,
          });
          localStorage.setItem("lolo_finance", false);
        } else {
          dispatch({
            type: USER_INFO.LOLO_FINANCE_MODULE,
            payload: true,
          });
          localStorage.setItem("lolo_finance", true);
        }


        if (
          siteBodyData.procurement_module === "" ||
          siteBodyData.procurement_module === false||
          siteBodyData.procurement_module === "False"||
          siteBodyData.procurement_module ===null||
          siteBodyData.procurement_module === undefined
        ) {
          dispatch({
            type: USER_INFO.PROCUREMENT_MODULE,
            payload: false,
          });
          localStorage.setItem("procurement_module", false);
        } else {
          dispatch({
            type: USER_INFO.PROCUREMENT_MODULE,
            payload: true,
          });
          localStorage.setItem("procurement_module", true);
        }

        if (
          siteBodyData.procurement_admin === "" ||
          siteBodyData.procurement_admin === false ||
          siteBodyData.procurement_admin === "False"||
          siteBodyData.procurement_admin ===null||
          siteBodyData.procurement_admin === undefined
        ) {
          dispatch({
            type: "SET_PROCUREMENT_ADMIN",
            payload: false,
          });
          localStorage.setItem("procurement_admin", false);
        } else {
          dispatch({
            type: "SET_PROCUREMENT_ADMIN",
            payload: true,
          });
          localStorage.setItem("procurement_admin", true);
        }


        localStorage.setItem(
          "automatic_mnr_status_change",
          siteBodyData.automatic_mnr_status_change
        );
       }

       
        alert("Site updated successfully", {
          variant: "success",
        });
        history.push("/master/site");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }
  };

export const deleteSiteListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `master/site/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getSiteListings());
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });
  }
};