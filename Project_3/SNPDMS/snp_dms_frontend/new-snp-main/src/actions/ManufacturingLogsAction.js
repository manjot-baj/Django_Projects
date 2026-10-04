import axiosInstance from "@/AxiosExtend"
import { MANUFACTURING_CONST } from "../reducers/ManufacturinglogsReducer";
import { startLoading, stopLoading } from "./UIActions";

export const getManufacturingLogs =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;
    const {container_no,pg_no,on_page_data_edit} = await getState().ManufacturinglogsReducer;
    dispatch(startLoading());
    axiosInstance
      .post("depot/manufacturing_date_log/", {
        location,
        site,
        container_no,
        pg_no,
        on_page_data:Number(on_page_data_edit)
      })
      .then((res) => {
        dispatch(stopLoading());
        notify(res.data.message, { variant: "success" });
        dispatch({type:MANUFACTURING_CONST.GET_LISTING,payload:res.data.data})
      })
      .catch((err) => {
        dispatch(stopLoading());
        notify(err.response.data.message, { variant: "error" });
      });
  };
