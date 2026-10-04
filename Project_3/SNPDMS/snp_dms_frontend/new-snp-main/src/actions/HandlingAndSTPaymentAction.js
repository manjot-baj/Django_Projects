import axiosInstance from "@/AxiosExtend";
import { startLoading, stopLoading } from "./UIActions";
import { HANDLING_ST_PAYMENT } from "@/reducers/HandlingAndSTPaymentReducer";

export const getHandlingPaymentListing =
  (notify) => async (dispatch, getState) => {
    const { pg_no, edit_on_page_data, cheque_no, utr_no, container_no } =
      await getState().HandlingAndSTPaymentReducer.payment_handling_list;
    const { location, site } = await getState().user;

    dispatch(startLoading());
    axiosInstance
      .post("depot/handling_payment/list/", {
        pg_no,
        on_page_data: edit_on_page_data,
        cheque_no,
        utr_no,
        container_no,
        location,
        site,
      })
      .then((res) => {
        if (res.data) {
          dispatch(stopLoading());

          dispatch({
            type: HANDLING_ST_PAYMENT.HANDLING_LIST,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
        dispatch({type:HANDLING_ST_PAYMENT.HANDLING_LIST_INIT})
      });
  };

export const getHandlingPayment = (pk, notify) => async (dispatch) => {
  dispatch(startLoading());
  axiosInstance
    .get(`depot/handling_payment/${pk}/`)
    .then((res) => {
      if (res.data) {
        dispatch(stopLoading());

        dispatch({
          type: HANDLING_ST_PAYMENT.HANDLING_SINGLE_PAYMENT,
          payload: res.data,
        });
      }
    })
    .catch((err) => {
      dispatch(stopLoading());
      notify(err.response.data.errorMsg, { variant: "error" });
    });
};

export const deleteHandlingPayment = (pk, notify, handleModalClose) => async (dispatch) => {
  dispatch(startLoading());
  axiosInstance
    .get(`depot/handling_payment/${pk}/delete/`)
    .then((res) => {
      if (res.data) {
         handleModalClose()
        dispatch(getHandlingPaymentListing(notify));
      }
    })
    .catch((err) => {
      notify(err.response.data.errorMsg, { variant: "error" });
    })
    .finally(() => dispatch(stopLoading()));
};

export const getStPayment = (pk, notify) => async (dispatch) => {
  dispatch(startLoading());
  axiosInstance
    .get(`depot/self_transportation_payment/${pk}/`)
    .then((res) => {
      if (res.data) {
        dispatch(stopLoading());

        dispatch({
          type: HANDLING_ST_PAYMENT.ST_SINGLE_PAYMENT,
          payload: res.data,
        });
      }
    })
    .catch((err) => {
      dispatch(stopLoading());
      notify(err.response.data.errorMsg, { variant: "error" });
    });
};

export const deleteStPayment = (pk, notify,handleModalClose) => async (dispatch) => {
  dispatch(startLoading());
  axiosInstance
    .get(`depot/self_transportation_payment/${pk}/delete/`)
    .then((res) => {
      if (res.data) {
        dispatch(stopLoading());
        handleModalClose()
        dispatch(getSTPaymentListing(notify));
      }
    })
    .catch((err) => {
      dispatch(stopLoading());
      notify(err.response.data.errorMsg, { variant: "error" });
    });
};

export const addHandlingPaymentAction =
  (data, handleModalclose, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    axiosInstance
      .post("depot/handling_payment/add/", { ...data, location, site })
      .then((res) => {
        dispatch(stopLoading());

        if (res.data.message) {
          handleModalclose();
          notify(res.data.message, { variant: "success" });
          dispatch(getHandlingPaymentListing(notify));
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const addSTPaymentAction =
  (data, handleModalclose, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    axiosInstance
      .post("depot/self_transportation_payment/add/", {
        ...data,
        location,
        site,
      })
      .then((res) => {
        dispatch(stopLoading());

        if (res.data.message) {
          handleModalclose();
          notify(res.data.message, { variant: "success" });
          dispatch(getSTPaymentListing(notify));
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const updateSTPaymentAction =
  (pk, data, handleModalclose, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .put(`depot/self_transportation_payment/${pk}/update/`, data)
      .then((res) => {
        dispatch(stopLoading());

        if (res.data.successMsg) {
          handleModalclose();
          notify(res.data.successMsg, { variant: "success" });
          dispatch(getSTPaymentListing(notify));
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const updateHandlingPaymentAction =
  (pk, data, handleModalclose, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    axiosInstance
      .put(`depot/handling_payment/${pk}/update/`, data)
      .then((res) => {
        dispatch(stopLoading());

        if (res.data.successMsg) {
          handleModalclose();
          notify(res.data.successMsg, { variant: "success" });
          dispatch(getHandlingPaymentListing(notify));
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const deleteHandlingPaymentAction =
  (pk, deleteFunction, container_no, lolo_amount, handling_pk, notify) =>
  async (dispatch, getState) => {
    const { location_id, site_id } = await getState().user;
    dispatch(startLoading());
    axiosInstance
      .post(`depot/handling_payment/${pk}/remove_payment/`, {
        handling_pk: handling_pk,
        container_no: container_no,
        lolo_amount: lolo_amount,
        location: location_id,
        site: site_id,
      })
      .then((res) => {
        dispatch(stopLoading());

        if (res.data.message) {
          notify(res.data.message, { variant: "success" });
          deleteFunction();
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.errorMsg, { variant: "error" });
      });
  };

export const deletestPaymentAction =
  (pk, deleteFunction, container_no, st_amount, st_pk, notify) =>
  async (dispatch, getState) => {
    const { location_id, site_id } = await getState().user;
    dispatch(startLoading());
    axiosInstance
      .post(`depot/self_transportation_payment/${pk}/remove_payment/`, {
        st_pk: st_pk,
        container_no: container_no,
        st_amount: st_amount,
        location: location_id,
        site: site_id,
      })
      .then((res) => {
        dispatch(stopLoading());

        if (res.data.message) {
          notify(res.data.message, { variant: "success" });
          deleteFunction();
        }
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response?.data?.errorMsg, { variant: "error" });
      });
  };

export const getSTPaymentListing = (notify) => async (dispatch, getState) => {
  const { pg_no, edit_on_page_data, cheque_no, utr_no, container_no } =
    await getState().HandlingAndSTPaymentReducer.payment_st_list;
  const { location, site } = await getState().user;

  dispatch(startLoading());
  axiosInstance
    .post("depot/self_transportation_payment/list/", {
      pg_no,
      on_page_data: edit_on_page_data,
      cheque_no,
      utr_no,
      container_no,
      location,
      site,
    })
    .then((res) => {
      if (res.data) {
        dispatch(stopLoading());

        dispatch({
          type: HANDLING_ST_PAYMENT.ST_LIST,
          payload: res.data,
        });
      }
    })
    .catch((err) => {
      dispatch(stopLoading());
      notify(err.response.data.errorMsg, { variant: "error" });
        dispatch({type:HANDLING_ST_PAYMENT.ST_LIST_INIT})

    });
};
