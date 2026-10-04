import { axiosInstance } from "@/Axios";
import { MASTER_LINE_HANDLING_CHARGES } from "@/reducers/master/MasterLineHandlingChargesReducer";
import { startLoading, stopLoading } from "../UIActions";

export const getLineHandlingChargesListingAction =
  (notify) => async (dispatch, getState) => {
     const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/master/line_handling_charges/list/`,
        {
          location,
          site
        }
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type: MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_LIST,
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

export const dropDownMasterLineHandlingChargesRefCodeAction =
  (array, alert) => async (dispatch, getState) => {
    dispatch({ type: "START_LOADING" });

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
          type: MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_REF_CODE_DROPDOWN,
          payload: res.data?.client_ref_codes,
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

export const createMasterLineHandlingChargesAction =
  (line_data, setCloseModal, resetForm, notify) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/master/line_handling_charges/add/`,
        {
          ...line_data,
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
          if (setCloseModal) {
            setCloseModal();
          }
          if (resetForm) {
            resetForm();
          }
          dispatch(getLineHandlingChargesListingAction(notify));
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateMasterLineHandlingChargesAction =
  (pk, line_data, setCloseModal, resetForm, notify) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.put(
        `/master/line_handling_charges/list/${pk}/update/`,
        {
          ...line_data,
          pk: pk,
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
          if (setCloseModal) {
            setCloseModal();
          }
          if (resetForm) {
            resetForm();
          }
          dispatch(getLineHandlingChargesListingAction(notify));
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const getSingleMasterLineHandlingChargesAction =
  (pk, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.get(
        `/master/line_handling_charges/list/${pk}/`,
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          dispatch({
            type: MASTER_LINE_HANDLING_CHARGES.MASTER_LINE_HANDLING_CHARGES_SINGLE_DETAILS,
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

export const deleteSingleMasterLineHandlingChargesAction =
  (pk, setCloseModal,resetForm ,notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.delete(
        `/master/line_handling_charges/list/${pk}/delete/`,
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          if (setCloseModal) {
            setCloseModal();
          }
          if (resetForm) {
            resetForm();
          }
          dispatch(getLineHandlingChargesListingAction(notify));
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
