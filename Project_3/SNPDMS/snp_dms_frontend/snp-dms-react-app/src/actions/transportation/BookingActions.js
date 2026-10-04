import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getBookingListing = (data, currentPage) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_booking/`,
      data
    );
    dispatch({ type: "GET_ALL_BOOKING", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const addBooking = (data, history, alert) => async (dispatch) => {
  console.log("data", data);
  try {
    const res = await axiosInstance.post(`transportation/booking/`, data);
    if (res.data.successMsg) {
      alert("Booking added successfully", { variant: "success" });
      history.push("/transport/booking");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_BOOKING", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const saveAsDraftBooking =
  (data, history, alert) => async (dispatch) => {
    console.log("data", data);
    try {
      const res = await axiosInstance.post(
        `transportation/booking_draft/`,
        data
      );
      if (res.data.successMsg) {
        alert("Booking Saved successfully", { variant: "success" });
        history.push("/transport/booking");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
      dispatch({ type: "BOOKING_SAVED", payload: res.data.successMsg });
    } catch (err) {
      console.log(err);
    }
  };

export const deleteBookingData = (data,history, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.delete(
      `transportation/get_all_booking/delete/${data.pk}/`, data);
    if (res.data.successMsg) {
      alert("Booking deleted successfully", { variant: "success" });
      history.push("/transport/booking");
      dispatch({ type: "DELETE_BOOKING", payload: res.data.successMsg });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
      dispatch({ type: "DELETE_BOOKING", payload: res.data.errorMsg });
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteDraftBooking = (data, alert) => async (dispatch) => {
  tempJson = data;
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_booking_draft/delete/`, 
      data 
      );
    if (res.data.successMsg) {
      alert("Booking deleted successfully", { variant: "success" });
      dispatch({ type: "DELETE_DRAFT_BOOKING", payload: res.data.successMsg });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
      dispatch({ type: "DELETE_DRAFT_BOOKING", payload: res.data.errorMsg });
    }

  } catch (err) {
    console.log(err);
  }
};


export const deleteBookingReset = () => async (dispatch) => {
  dispatch({ type: "DELETE_BOOKING_RESET" });
};

export const deleteDraftReset = () => async (dispatch) => {
  dispatch({ type: "DELETE_DRAFT_RESET" });
};

export const cancleBookingEffect = (pk) => async (dispatch) => {
  console.log(pk, "data")
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_booking/cancel_transaction/${pk}/`,
    );
    dispatch({ type: "CANCEL_BOOKING_EFFECT", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const updateBooking = (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `transportation/update_booking/${data.pk}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Booking Updated successfully", { variant: "success" });
      history.push("/transport/booking");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_BOOKING", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getBookingDetailsById = (id) => async (dispatch) => {
  console.log("id", id);
  try {
    const res = await axiosInstance.get(`transportation/update_booking/${id}/`);
    dispatch({ type: "GET_BOOKING", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearBookingData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_BOOKING_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
