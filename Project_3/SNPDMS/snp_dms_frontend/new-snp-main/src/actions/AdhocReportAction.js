import axiosInstance from "@/AxiosExtend";
import { ADHOC_REPORT_CONST } from "../reducers/AdhocReportReducer";
import { downloadFileReusable } from "../utils/Utils";
import { startLoading, stopLoading } from "./UIActions";

export const adhocReportListingAction =
  (notify) => async (dispatch, getState) => {
    const {
      from_date,
      to_date,
      report_type,
      status,
      email_sent,
      location,
      site,
    } = await getState().AdhocReportReducer;
    dispatch(startLoading());
    try {
      axiosInstance
        .post("/adhoc_report/report-requests/", {
          from_date,
          to_date,
          report_type,
          status,
          email_sent,
          location: location === "ALL" ? null : location,
          site: site === "ALL" ? null : site,
        })
        .then((res) => {
          dispatch(stopLoading());
          dispatch({
            type: ADHOC_REPORT_CONST.GET_LISTING,
            payload: res.data,
          });
        })
        .catch((err) => {
          dispatch(stopLoading());
        });
    } catch (err) {
      dispatch(stopLoading());
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const adhocReportAddRequestAction =
  (data, notify, handleModalClose) => async (dispatch, getState) => {
    if (data.location === "ALL") {
      data.location = null;
    }
    if (data.site === "ALL") {
      data.site = null;
    }
    dispatch(startLoading());
    try {
      axiosInstance
        .post("/adhoc_report/report-requests/add/", {
          ...data,
        })
        .then((res) => {
          dispatch(stopLoading());
          notify(res.data.successMsg, { variant: "success" });
          handleModalClose();
          dispatch(adhocReportListingAction(notify));
        })
        .catch((err) => {
          dispatch(stopLoading());
        });
    } catch (err) {
      dispatch(stopLoading());
      dispatch({ type: "STOP_LOADING" });
    }
  };

export const adhocReportdeleteRequestAction =
  (pk_list, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/adhoc_report/report-requests/delete/",
        {
          pk_list: pk_list,
        },
      );
      dispatch(adhocReportListingAction(notify));
      notify(res.data.successMsg, { variant: "success" });
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(stopLoading());
    }
  };

export const downloadAdhocReportAction =
  (pk, name, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/adhoc_report/report-requests/${pk}/download/`,
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        dispatch(stopLoading());
        downloadFileReusable(
          res.data,
          name,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
        );

        alert("Adhoc Report File Downloaded Succesfully", {
          variant: "success",
        });
      } else if (res.data.errorMsg) {
        dispatch(stopLoading());
      }
    } catch (err) {
      dispatch(stopLoading());
    }
  };
