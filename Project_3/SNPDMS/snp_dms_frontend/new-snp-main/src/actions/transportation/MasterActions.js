import axiosInstance from "@/AxiosExtend";
import { startLoading, stopLoading } from "../UIActions";
let tempJson = {};

export const getFormDependencyListing = (data) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(
      `transportation/form_dependency/`,
      data,
    );
    dispatch({ type: "GET_ALL_FORM_DEPENDENCY", payload: res.data });
  } catch (err) {
    console.log(err);
  } finally {
    dispatch(stopLoading());
  }
};
export const getEntryNumberDependencyListing = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `/transportation/entry_no_data/`,
      data,
    );
    console.log(res.data, "response");
    dispatch({ type: "GET_ALL_ENTRY_NUMBER_DEPENDENCY", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
