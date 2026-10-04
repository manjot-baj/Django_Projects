import axiosInstance from "@/AxiosExtend";
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";

// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getTransporterListings = (data, alert) => async (dispatch) => {
  tempJson = data;
  dispatch(startLoading());
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(`master/transporter/all/`, data);
    dispatch({ type: "GET_ALL_TRANSPORTERS", payload: res.data.data });
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
    alert(err.response.data?.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getSingleTransporter = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.get(`master/transporter/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_TRANSPORTER_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data?.errorMsg, { variant: "error" });
  }finally{
    dispatch(stopLoading())
  }
};

export const addMasterTransporter =
  (transporterBodyData, history, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const page_no = await getState().stocksAndAllotmentSearch.pg_no;
    const on_page_data = await getState().stocksAndAllotmentSearch.on_page_data;
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/transporter/add/`,
        transporterBodyData,
      );
      if (res.data.successMsg) {
        alert("Transporter created successfully", {
          variant: "success",
        });
        let transporterdata = {
          transporter_code: "",
          transporter_name: "",
          location: location,
          site: site,
          pg_no: page_no,
          on_page_data: on_page_data,
        };
        dispatch(getTransporterListings(transporterdata));
        history.push("/master/transporter");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };

export const updateMasterTransporter =
  (pkId, transporterBodyData, history, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const page_no = await getState().stocksAndAllotmentSearch.pg_no;
    const on_page_data = await getState().stocksAndAllotmentSearch.on_page_data;
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/transporter/${pkId}/update/`,
        transporterBodyData,
      );
      if (res.data.successMsg) {
        alert("Transporter updated successfully", {
          variant: "success",
        });
        let transporterdata = {
          transporter_code: "",
          transporter_name: "",
          location: location,
          site: site,
          pg_no: page_no,
          on_page_data: on_page_data,
        };
        dispatch(getTransporterListings(transporterdata));
        history.push("/master/transporter");
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

export const deleteTransporterListings =
  (deleteIDs, alert, data) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/transporter/delete/`,
        deleteIDs,
      );
      dispatch(clearCheck());
      // dispatch(getTransporterListings(data));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data?.errorMsg, { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
  };
