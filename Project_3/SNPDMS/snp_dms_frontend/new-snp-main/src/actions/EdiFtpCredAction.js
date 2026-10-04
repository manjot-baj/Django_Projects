import { axiosInstance } from "@/Axios";
import { EDI_FTP_CRED_CONST } from "@/reducers/FtpCredentialsReducer";
import { startLoading, stopLoading } from "./UIActions";

export const getMSCFtpCredentialsDataAction =
  (notify, selectedSite) => async (dispatch, getState) => {
    const { role } = await getState().user;
  
    if (role !=='Admin') {
      return
    }
      dispatch(startLoading());
    try {
      const res = await axiosInstance.get(`/edi/list_msc_ftp_credential/`);
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type: EDI_FTP_CRED_CONST.LIST_EDI_FTP_CRED,
            payload: res.data,
          });
          if (selectedSite) {
            dispatch({
              type: EDI_FTP_CRED_CONST.SINGLE_EDI_FTP_CRED,
              payload: {
                site: selectedSite,
                data: res.data?.[selectedSite],
              },
            });
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const getMSCFtpEnableSiteListingAction =
  (notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(`/depot/inform_dropdown/`, {
        get_list: ["edi_enabled_sites"],
        location,
        site,
      });
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type: EDI_FTP_CRED_CONST.LIST_EDI_FTP_ENABLED_SITES,
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

export const addUpdateMSCFtpCredentialsAction =
  (data, notify, handleCloseFTPLogin) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/edi/add_update_site_msc_ftp_credential/`,
        data,
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
            if (handleCloseFTPLogin) {
              handleCloseFTPLogin();
              dispatch(getMSCFtpCredentialsDataAction(notify));
              dispatch(getMSCFtpEnableSiteListingAction(notify));
              dispatch({
                type: EDI_FTP_CRED_CONST.SINGLE_EDI_FTP_CRED,
                payload: null,
              });
            }
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
