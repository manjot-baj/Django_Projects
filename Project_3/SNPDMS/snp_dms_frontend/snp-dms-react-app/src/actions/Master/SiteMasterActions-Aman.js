import { axiosInstance } from "../../Axios";
import { USER_INFO } from "../../reducers/UserReducer";
import { clearCheck } from "./ClientMasterActions";

export const getSiteListings = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("master/get_all_site/");
    dispatch({ type: "GET_ALL_SITES", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const getSingleSite = (pkId, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`master/get_all_site/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_SITE_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response, { variant: "error" });
  }
};

export const addMasterSite = (siteBodyData, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`master/add_site/`, siteBodyData);
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
          type:USER_INFO.LOLO_FINANCE_MODULE,
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
    alert(err, { variant: "error" });
  }
};

export const updateMasterSite =
  (pkId, siteBodyData, history, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.put(
        `master/get_all_site/${pkId}/`,
        siteBodyData
      );
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
            type:USER_INFO.LOLO_FINANCE_MODULE,
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
      alert(err, { variant: "error" });
    }
  };

export const deleteSiteListings = ( deleteIDs, alert ) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `master/get_all_site/delete/`,
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
    console.log(err);
  }
};