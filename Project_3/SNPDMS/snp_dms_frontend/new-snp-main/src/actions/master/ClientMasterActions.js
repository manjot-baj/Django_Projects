import axiosInstance from "@/AxiosExtend";
import { startLoading, stopLoading } from "../UIActions";

export const getClientListing = (alert) => async (dispatch, getState) => {
  const { location, site } = await getState().user;
  const { client_name, ref_code, type, pg_no, on_page_data } =
    await getState().clientMaster;

  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(`master/client/all/`, {
      location,
      site,
      client_name,
      ref_code,
      type,
      pg_no,
      on_page_data,
    });

    dispatch({ type: "GET_ALL_CLIENTS", payload: res.data.data });
    dispatch({
      type: "CLIENT_MASTER_SET_NEXT_PAGE",
      payload: res.data.next_page,
    });
    dispatch({
      type: "CLIENT_MASTER_SET_PREV_PAGE",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "CLIENT_MASTER_SET_TOTAL_PAGE",
      payload: res.data.total_pages,
    });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const getSingleClient = (pkId, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(`master/client/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_CLIENT_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};

export const addMasterClient =
  (clientBodyData, history, alert) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/client/add/`,
        clientBodyData,
      );
      if (res.data.successMsg) {
        alert("Client created successfully", { variant: "success" });
        history.push("/master/client");
        dispatch(getClientListing(alert));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const updateMasterClient =
  (pkId, clientBodyData, history, alert) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(
        `master/client/${pkId}/update/`,
        clientBodyData,
      );
      if (res.data.successMsg) {
        alert("Client updated successfully", { variant: "success" });

        history.push("/master/client");
        dispatch(getClientListing(alert));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });
    }finally {
      dispatch(stopLoading());
    }
  };

export const addCheck = (category_id) => (dispatch) => {
  dispatch({
    type: "ADD_CHECKBOX",
    payload: category_id,
  });
};

export const removeCheck = (category_id) => (dispatch) => {
  dispatch({
    type: "REMOVE_CHECKBOX",
    payload: category_id,
  });
};

export const clearCheck = () => (dispatch) => {
  dispatch({
    type: "CLEAR_CHECKBOX",
  });
};

export const deleteClientListings = (deleteIDs, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(`master/client/delete/`, deleteIDs);
    dispatch(clearCheck());
    dispatch(getClientListing(alert));
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};
