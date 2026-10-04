import { axiosInstance } from "../../Axios";
import { clearCheck } from "./ClientMasterActions";
// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getVesselVoyageDetailListings = (data,alert) => async (dispatch) => {
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      "master/vessel_voyage_detail/all/",
      data
    );
    dispatch({ type: "GET_ALL_VESSEL_VOYAGE_DETAIL", payload: res.data.data });
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

export const getSingleVesselVoyageDetail =
  (pkId, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.get(
        `master/vessel_voyage_detail/${pkId}/`
      );
      if (!res.data.errorMsg)
        dispatch({
          type: "GET_SINGLE_VESSEL_VOYAGE_DETAIL",
          payload: res.data,
        });
      else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const addMasterVesselVoyageDetail =
  (vesselVoyageDetailBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.post(
        `master/vessel_voyage_detail/add/`,
        vesselVoyageDetailBodyData
      );
      if (res.data.successMsg) {
        alert("VesselVoyageDetail created successfully", {
          variant: "success",
        });
        history.push("/master/vesselVoyageDetail");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const updateMasterVesselVoyageDetail =
  (pkId, vesselVoyageDetailBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `master/vessel_voyage_detail/${pkId}/update/`,
        vesselVoyageDetailBodyData
      );
      if (res.data.successMsg) {
        alert("VesselVoyageDetail updated successfully", {
          variant: "success",
        });
        history.push("/master/vesselVoyageDetail");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

  export const deleteVesselVoyageDetailListings = ( deleteIDs, alert, data ) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `master/vessel_voyage_detail/delete/`,
        deleteIDs
      );
      dispatch(clearCheck());
      dispatch(getVesselVoyageDetailListings(data));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };
