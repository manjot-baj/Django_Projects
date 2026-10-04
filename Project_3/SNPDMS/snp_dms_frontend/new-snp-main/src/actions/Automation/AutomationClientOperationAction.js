import { axiosInstance } from "@/Axios";
import { AUTOMATION_CLIENT_GST_REMOVE_REDUCER } from "@/reducers/AutomationClientOperationReducer";
import { startLoading, stopLoading } from "../UIActions";
import { downloadReceiptsExcel } from "../NewBillingActions";

export const clientUniqueGstUploadExtractAction =
  (formData, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/automation/unique_gst_client_clean_upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type: AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA,
            payload: res.data,
          });
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const clientGstNoUpdateExtractAction =
  (formData, notify) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/automation/client_gst_bulk_upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type: AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA,
            payload: res.data,
          });
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const processClientUniqueGSTAction =
  (correct_data, handleRemoveFile, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/automation/unique_gst_client_clean_process/",
        {
          correct_data: correct_data,
          location,
          site,
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          if (handleRemoveFile) {
            handleRemoveFile();
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const processClientGstUpdateAction =
  (correct_data, handleRemoveFile, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/automation/client_gst_bulk_update/",
        {
          correct_data: correct_data,
          location,
          site,
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          if (handleRemoveFile) {
            handleRemoveFile();
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const rejectedDownloadUniqueClientGSTAction =
  (faults, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/automation/rejected_unique_gst_client_clean_download/`,
        {
          faults: faults,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          downloadReceiptsExcel(res.data, "Rejected Client Data");
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const singlePartyClientOperationAction =
  (replace_from, replace_to, resetForm, notify) =>
  async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/automation/transfer_client_dependency/",
        {
          replace_from: replace_from,
          replace_to: replace_to,
          location,
          site,
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          if (resetForm) {
            resetForm();
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const singlePartyClientOperationdropDownDispatchAction =
  (array, alert) => async (dispatch, getState) => {
    dispatch({ type: "START_LOADING" });
    await dispatch({ type: "CLEAR_DROPDOWN_VALUES" });
    const location = await getState().user.location;
    const site = await getState().user.site;
    const stateCode = await getState().user.state_code;

    const dataArray = array !== undefined ? array : [];
    axiosInstance
      .post("depot/inform_dropdown/", {
        location: location,
        site: site,
        state_code: stateCode,
        get_list: dataArray,
      })
      .then((res) => {
        dispatch({
          type: AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_PARTY_DATA_DROPDOWN_DEPENDENCY_TRANSFER,
          payload: res.data?.party_client_data,
        });
        dispatch({ type: "STOP_LOADING" });
      })
      .catch((err) => {
        console.error(err);
        if (!err.response)
          alert("Please check your internet connection and reload the page", {
            variant: "info",
          });
        dispatch({ type: "STOP_LOADING" });
      });
  };

export const clientGstBulkNoneUpdateAction =
  (handleCloseWarning, notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/automation/client_gst_bulk_none_update/`,
        {
          location,
          site,
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          if (handleCloseWarning) {
            handleCloseWarning();
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
