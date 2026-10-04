import { axiosInstance } from "../Axios";
import { TRUCK_TRACKING_CONST } from "../reducers/TruckTurnAroundReducer";
import { startLoading, stopLoading } from "./UIActions";

export const truckTurnAroundListingAction =
  (data) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    const {
      on_page_data_client,
      page_no,
      line,
      type,
      transporter,
      container_no,
    } = await getState().TruckTurnAroundReducer.truckListing;
    dispatch(startLoading());
    try {
      axiosInstance
        .post("/truck_tracking/all/", {
          on_page_data: on_page_data_client,
          page_no,
          line,
          type,
          container_no,
          transporter,
          location_id,
          site_id,
        })
        .then((res) => {
          dispatch(stopLoading());
          dispatch({
            type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_LISTING,
            payload: res.data,
          });
        })
        .catch((err) => {
          dispatch(stopLoading());
          console.log("Notification Module Data!", err);
        });
    } catch (err) {
      dispatch(stopLoading());
      dispatch({ type: "STOP_LOADING" });
      console.log(err);
    }
  };

export const truckTurnAroundAddTruckAction =
  (data, history, notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    dispatch(startLoading());
    try {
      axiosInstance
        .post("/truck_tracking/add/", {
          ...data,
          location_id,
          site_id,
        })
        .then((res) => {
          notify(res.data.message, { variant: "success" });
          dispatch(stopLoading());
          history.goBack();
        })
        .catch((err) => {
          notify(err.response.data.message, { variant: "error" });

          dispatch(stopLoading());
        });
    } catch (err) {
      dispatch(stopLoading());
    }
  };

export const gettruckTurnAroundByPkTruckAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      axiosInstance
        .get(`/truck_tracking/${pk}/`)
        .then((res) => {
          notify(res.data.message, { variant: "success" });
          dispatch(stopLoading());
          dispatch({
            type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GET_DATA,
            payload: res.data.data,
          });
        })
        .catch((err) => {
          notify(err.response.data.message, { variant: "error" });
          dispatch(stopLoading());
        });
    } catch (err) {
      dispatch(stopLoading());
    }
  };

export const updatetruckTurnAroundByPkTruckAction =
  (pk, container_no, notify, history) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      axiosInstance
        .put(`/truck_tracking/${pk}/update/`, { container_no: container_no })
        .then((res) => {
          notify(res.data.message, { variant: "success" });
          dispatch(stopLoading());
          history.go(0);
        })
        .catch((err) => {
          notify(err.response.data.message, { variant: "error" });
          dispatch(stopLoading());
        });
    } catch (err) {
      dispatch(stopLoading());
    }
  };

export const truckTurnAroundGateInContainerDetailsAction =
  (container_no, notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    dispatch(startLoading());
    try {
      axiosInstance
        .post("/truck_tracking/transporter/", {
          container_no,
          location_id,
          site_id,
        })
        .then((res) => {
          dispatch(stopLoading());
          dispatch({
            type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_IN_DATA,
            payload: res.data.data,
          });
          dispatch({
            type: "SET_TRANSPORTER_NAME",
            payload: res.data.data.transporter,
          });
          dispatch({
            type: "SET_VEHICLE_NUMBER",
            payload: res.data.data.vehicle_no,
          });
        
          dispatch({
            type:"SET_CLIENT",
            payload:res.data.data.client
          })
          dispatch({
            type: "CLEAR_SHIPPING_LINE",
          }); 
          dispatch({
            type: "SET_SHIPPING_LINE",
            payload: res.data.data?.line,
          });
        })
        .catch((err) => {
          dispatch(stopLoading());
        });
    } catch (err) {
      notify(err.response.data.message, { variant: "error" });
      dispatch(stopLoading());
    }
  };

export const truckTurnAroundGateInVehicleDetailsAction =
  (transporter, notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    dispatch(startLoading());
    try {
      axiosInstance
        .post("/truck_tracking/vehicles/", {
          transporter,
          location_id,
          site_id,
        })
        .then((res) => {
          dispatch(stopLoading());
          dispatch({
            type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST,
            payload: res.data.data,
          });
        })
        .catch((err) => {
          dispatch({
            type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST_INIT,
          });
          dispatch(stopLoading());
        });
    } catch (err) {
      notify(err.response.data.message, { variant: "error" });
      dispatch({
        type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_VEHICLE_LIST_INIT,
      });

      dispatch(stopLoading());
    }
  };

export const truckTurnAroundTransporterGateOutAction =
  (notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;

    dispatch(startLoading());
    try {
      axiosInstance
        .post("/truck_tracking/transporter_list/", {
          location_id,
          site_id,
        })
        .then((res) => {
          dispatch(stopLoading());
          dispatch({
            type: TRUCK_TRACKING_CONST.TRUCK_TRACKING_GATE_OUT_TRANSPORTER,
            payload: res.data.data,
          });
        })
        .catch((err) => {
          dispatch(stopLoading());
         
        });
    } catch (err) {
      dispatch(stopLoading());
      dispatch({ type: "STOP_LOADING" });
      console.log(err);
    }
  };
