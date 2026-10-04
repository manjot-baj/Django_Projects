import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getClientListing = (data, alert) => async (dispatch) => {
  tempJson = data;
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(`master/client/all/`, data);
    console.log("Client Response", res.data);
    dispatch({ type: "GET_ALL_CLIENTS", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
      payload: res.data.prev_page,
    });
    dispatch({
      type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
      payload: res.data.total_pages,
    });
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const getSingleClient = (pkId, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`master/client/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_CLIENT_DETAIL", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.errorMsg, { variant: "error" });

  }
};

export const addMasterClient =
  (clientBodyData, history, alert) => async (dispatch, getState) => {
    try {
      const res = await axiosInstance.post(
        `master/client/add/`,
        clientBodyData
      );
      if (res.data.successMsg) {
        alert("Client created successfully", { variant: "success" });
        let clientData = {
          client_name: "",
          ref_code: "",
          location: localStorage.getItem("location")
            ? localStorage.getItem("location")
            : null,
          site: localStorage.getItem("site")
            ? localStorage.getItem("site")
            : null,
          type: "",
          pg_no: 1,
          on_page_data: 5,
        };
        history.push("/master/client");
        dispatch(getClientListing(clientData));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };

export const updateMasterClient =
  (pkId, clientBodyData, history, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.put(
        `master/client/${pkId}/update/`,
        clientBodyData
      );
      if (res.data.successMsg) {
        alert("Client updated successfully", { variant: "success" });

        history.push("/master/client");
        let clientData = {
          client_name: "",
          ref_code: "",
          location: localStorage.getItem("location")
            ? localStorage.getItem("location")
            : null,
          site: localStorage.getItem("site")
            ? localStorage.getItem("site")
            : null,
          type: "",
          pg_no: 1,
          on_page_data: 5,
        };

        dispatch(getClientListing(clientData));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

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

export const deleteClientListings =
  (deleteIDs, alert, data) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `master/client/delete/`,
        deleteIDs
      );
      dispatch(clearCheck());
      dispatch(getClientListing(data));
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, { variant: "error" });

    }
  };
