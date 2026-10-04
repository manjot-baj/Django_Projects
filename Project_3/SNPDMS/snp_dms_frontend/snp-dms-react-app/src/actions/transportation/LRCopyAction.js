import { axiosInstance } from "../../Axios";

export const getLRTemplateData = ( pkId ,data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`transportation/print_lr/${pkId}/`, data );
    dispatch({ type: "GET_ALL_LR_TEMPLATE_DATA", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};