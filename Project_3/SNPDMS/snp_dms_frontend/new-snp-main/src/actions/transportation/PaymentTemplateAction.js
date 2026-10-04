import axiosInstance from "@/AxiosExtend"

export const getPaymentTemplate = (pkId, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/print_payment_receipt/${pkId}/`,
      data
    );
    dispatch({ type: "GET_ALL_PAYMENT_DATA", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
