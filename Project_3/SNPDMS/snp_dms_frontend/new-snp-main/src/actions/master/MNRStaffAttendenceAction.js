import { axiosInstance } from "@/Axios";
import { startLoading, stopLoading } from "../UIActions";
import { MASTER_MNR_STAFF_ATTENDENCE } from "@/reducers/master/MNRStaffAttendanceReducer";

export const addMNRStaffAttendanceAction =
  (data, history, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .post("mnr/add_attendance/", data)
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          if (res.data.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
            history.goBack();
          } else {
            notify(res.data.errorMsg, { variant: "error" });
          }
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };
  
export const deleteMNRStaffAttendanceAction =
  (pk, history, notify) => async (dispatch) => {
    dispatch(startLoading());
    axiosInstance
      .delete(`mnr/get_all_attendance_list/${pk}/`)
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          if (res.data.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
            history.goBack();
          } else {
            notify(res.data.successMsg, { variant: "error" });
          }
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const updateMNRStaffAttendanceAction =
  (pk, employee_id, data, history, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .put(`mnr/get_all_attendance_list/${pk}/`, {
        id: pk,
        employee: employee_id,
        date: data.date,
        status: data.status,
        in_time: data.in_time,
        out_time: data.out_time,
        remarks: data.remarks,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          if (res.data.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
            history.goBack();
          } else {
            notify(res.data.successMsg, { variant: "error" });
          }
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const getSingleMNRStaffAttendanceAction =
  (pk, notify) => async (dispatch) => {
    dispatch(startLoading());
    axiosInstance
      .get(`/mnr/get_all_attendance_list/${pk}`)
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());
          if (res.data) {
            notify("Data Found Successfully", { variant: "success" });
            dispatch({
              type: MASTER_MNR_STAFF_ATTENDENCE.GET_SINGLE_STAFF_ATTENDANCE,
              payload: res.data,
            });
          } else {
            notify(res.data.successMsg, { variant: "error" });
          }
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const informDropdownMNRStaffAttendanceAction =
  (notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;

    dispatch(startLoading());
    axiosInstance
      .post("depot/inform_dropdown/", {
        location,
        site,
        get_list: ["mnr_staff_attendance"],
      })
      .then((res) => {
        if (res.data) {
          dispatch({
            type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_DROPDOWN,
            payload: res.data,
          });
          dispatch(stopLoading());
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const getMNRStaffAttendanceListingAction =
  (notify) => async (dispatch, getState) => {
    const {
      pg_no,
      on_page_data_client,
      from_date,
      to_date,
      role,
      firstName,
      lastName,
    } = await getState().MNRStaffAttendanceReducer.get_all_attendance_list;
    const { location, site } = await getState().user;

    dispatch(startLoading());
    axiosInstance
      .post("mnr/get_all_attendance_list/", {
        pg_no,
        on_page_data: on_page_data_client,
        from_date,
        to_date,
        role,
        firstName,
        lastName,
        location,
        site,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());

          dispatch({
            type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };
