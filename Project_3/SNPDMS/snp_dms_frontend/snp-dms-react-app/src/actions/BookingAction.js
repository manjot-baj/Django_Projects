import { axiosInstance } from "../Axios";

export const getAllBookingEntries = (data) => async (dispatch) => {
  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  try {
    const res = await axiosInstance.post(`transportation/get_all_booking/`, data);
    console.log("Booking Entries Response", res.data);
    dispatch({ type: "GET_ALL_BOOKING_ENTRIES", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getSingleBookingEntries = (pkId, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`transportation/update_booking/${pkId}/`);
    if (!res.data.errorMsg)
      dispatch({ type: "GET_SINGLE_BOOKING_ENTRIES", payload: res.data });
    else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response, { variant: "error" });
  }
};

export const updateBookingEntries =
  (pkId, BookingEntryBodyData, history, alert) => async () => {
    try {
      const res = await axiosInstance.put(
        `transportation/update_booking/${pkId}/`,
        BookingEntryBodyData
      );
      if (res.data.successMsg) {
        alert("Booking Entry updated successfully", {
          variant: "success",
        });
        history.push("/transport/booking");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      alert(err, { variant: "error" });
    }
  };
  


