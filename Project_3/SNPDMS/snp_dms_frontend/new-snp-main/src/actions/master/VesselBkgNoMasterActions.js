import axiosInstance from "@/AxiosExtend"
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";



// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getVesselBkgNoListings = (data,alert) => async (dispatch) => {
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  tempJson = data;
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(`master/vessel_bkgno/all/`, data);
    dispatch({ type: "GET_ALL_VESSEL_BKG_NO", payload: res.data.data });
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

  }finally{
    dispatch(stopLoading())
  }
};

export const getSingleVesselBkgNo = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.get(`master/vessel_bkgno/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_VESSEL_BKG_NO", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }finally{
    dispatch(stopLoading())
  }
};

export const addMasterVesselBkgNo =
  (vesselBkgNoBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/vessel_bkgno/add/`,
        vesselBkgNoBodyData
      );
      if (res.data.successMsg) {
        alert("VesselBkgNo created successfully", {
          variant: "success",
        });
        history.push("/master/vesselBkgNo");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };

export const updateMasterVesselBkgNo =
  (pkId, vesselBkgNoBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/vessel_bkgno/${pkId}/update/`,
        vesselBkgNoBodyData
      );
      if (res.data.successMsg) {
        alert("VesselBkgNo updated successfully", {
          variant: "success",
        });
        history.push("/master/vesselBkgNo");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };


export const deleteVesselBkgNoListings = ( deleteIDs, alert, data ) => async (dispatch) => {
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(
      `master/vessel_bkgno/delete/`,
      deleteIDs
    );
    dispatch(clearCheck());
    dispatch(getVesselBkgNoListings(data));
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