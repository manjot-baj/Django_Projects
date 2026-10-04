import axiosInstance from "@/AxiosExtend"
let tempJson = {};

export const webNotificationModule =
  (data) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    try {
      let req = {
        location: location,
        site: site,
      };
      axiosInstance
        .post("/notification/notification_history/", {
          ...req,
          ...data
        })
        .then((res) => {
          dispatch({
            type: "WEB_SOCKET_CONNECTION_DATA_HISTORY",
            payload: res.data,
          });
        
        })
        .catch((err) => {
          console.log("Notification Module Data!", err);
        });
    } catch (err) {
      dispatch({ type: "STOP_LOADING"});
      console.log(err);
    }
  };

  export const webNotificationGetMessageAction =
  () => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
   

    try {
      let req = {
        location: location||"ALL",
        site: site||"ALL",
      };
      axiosInstance
        .post("/notification/get_notifications/",req)
        .then((res) => {
          dispatch({
            type: "WEB_SOCKET_CONNECTION_DATA",
            payload: res.data,
          });
        })
        .catch((err) => {
          console.log("Notification Module Data!", err);
        });
    } catch (err) {
   
      console.log(err);
    }
  };

  export const getAllNotification = () => async (dispatch, getState) => {
    const notification_ids = await getState().WebSocketNotification?.data?.pk;
    console.log(notification_ids, "notification_idsnotification_ids")
    try {
      let req = {
        notification_ids: [],
      };
      axiosInstance
        .post("notification/mark_notification_as_read/", req)
        .then((res) => {
          dispatch({
            type: "WEB_SOCKET_CONNECTION_DATA",
            payload: res.data,
          });
        })
        .catch((err) => {
          console.log("Notification Module Data!", err);
        });
    } catch (err) {
   
      console.log(err);
    }
  };