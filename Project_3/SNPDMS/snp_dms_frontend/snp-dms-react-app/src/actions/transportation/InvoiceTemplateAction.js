import { axiosInstance } from "../../Axios";

export const getInvoiceTemplate = (pkId, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/print_invoice/${pkId}/`,
      data
    );
    dispatch({ type: "GET_ALL_INVOICE_LR_TEMPLATE_DATA", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
