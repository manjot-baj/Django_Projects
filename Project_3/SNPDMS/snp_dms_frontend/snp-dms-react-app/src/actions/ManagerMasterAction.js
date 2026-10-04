import { axiosInstance } from "../Axios";
import { startLoading, stopLoading } from "./UIActions";

export const addManagerAction =
  (body, notify,history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    axiosInstance
      .post("master/site_incharge/add/", {
        ...body,
        location,
        site,
      })
      .then((res) => {
        dispatch(stopLoading());
        notify(res.data.successMsg, { variant: "success" });
        history.goBack()
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "success" });
      });
  };


  export const updateManagerAction =
  (pk, data,notify,history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    axiosInstance
      .put(`master/site_incharge/${pk}/update/`, {
        pk,
        ...data,
        location,
        site,
      })
      .then((res) => {
        dispatch(stopLoading());
        notify(res.data.successMsg, { variant: "success" });
        history.goBack()
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "success" });
      });
  };


  export const getListingManagerAction =
  ( notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    axiosInstance
      .post("master/site_incharge/all/", {
        location,
        site,
      })
      .then((res) => {
        dispatch(stopLoading());
      
        dispatch({ type: "GET_ALL_MANAGER", payload: res.data.data });
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "success" });
      });
  };



  export const getSingleManagerAction =
  ( pk,notify) => async (dispatch) => {
 
    dispatch(startLoading());
    axiosInstance
      .get(`master/site_incharge/${pk}/`)
      .then((res) => {
        dispatch(stopLoading());
        dispatch({ type: "GET_SINGLE_MANAGER", payload: res.data });
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "success" });
      });
  };


  export const deleteManagerAction =
  (pk,notify,history) => async (dispatch, getState) => {
  
    dispatch(startLoading());
    axiosInstance
      .delete(`master/site_incharge/${pk}/delete/`)
      .then((res) => {
        dispatch(stopLoading());
        notify(res.data.successMsg, { variant: "success" });
        history.goBack()
        dispatch(getListingManagerAction(notify))
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "success" });
      });
  };