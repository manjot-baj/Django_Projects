import axiosInstance from "@/AxiosExtend"
import { clearCheck } from "@/actions/master/ClientMasterActions";
import { startLoading, stopLoading } from "../UIActions";


// eslint-disable-next-line no-unused-vars
let tempJson = {};

export const getLocationCodeDetailListings = (data,alert) => async (dispatch,getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  tempJson = data;
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  dispatch(startLoading())
  try {
    const res = await axiosInstance.post(
      "master/location_code_detail/all/",
     { ...data,location,site }
    );
    dispatch({ type: "GET_ALL_LOCATION_CODE_DETAIL", payload: res.data.data });
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

export const getSingleLocationCodeDetail =
  (pkId, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.get(
        `master/location_code_detail/${pkId}/`
      );
      if (!res.data.errorMsg)
        dispatch({
          type: "GET_SINGLE_LOCATION_CODE_DETAIL",
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

export const addMasterLocationCodeDetail =
  (locationCodeDetailBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/location_code_detail/add/`,
        locationCodeDetailBodyData
      );
      if (res.data.successMsg) {
        alert("LocationCodeDetail created successfully", {
          variant: "success",
        });
        history.push("/master/locationCodeDetail");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }finally{
      dispatch(stopLoading())
    }
  };

export const updateMasterLocationCodeDetail =
  (pkId, locationCodeDetailBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/location_code_detail/${pkId}/update/`,
        locationCodeDetailBodyData
      );
      if (res.data.successMsg) {
        alert("LocationCodeDetail updated successfully", {
          variant: "success",
        });
        history.push("/master/locationCodeDetail");
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

  export const deleteLocationCodeDetailListings = ( deleteIDs, alert, data ) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.post(
        `master/location_code_detail/delete/`,
        deleteIDs
      );
      dispatch(clearCheck());
      dispatch(getLocationCodeDetailListings(data));
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