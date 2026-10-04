import { axiosInstance } from "../Axios";
import { downloadReceiptsDO } from "./GateInActions";

export const getWistimDestimS3Listings = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`mnr/wistim_distim_s3_uploads/`, data);
    console.log("Westim Destim S3 Response", res.data);
    dispatch({ type: "GET_ALL_S3_DATA", payload: res.data.data });
    dispatch({
      type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
      payload: res.data.next_page,
    });
  } catch (err) {
    console.log(err);
  }
};

export const downloadWistimDestimS3Listings = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `mnr/wistim_distim_s3_uploads/` + data.pk + "/",
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data) {
      console.log(res.data);
      let type = {};
      if (
        res.headers["content-type"] ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
      ) {
        type = {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
      } else {
        type = {
          type: "application/text",
        };
      }
      downloadReceiptsDO(res.data, data.name, type);
    } else alert(res.data.errorMsg, { variant: "error" });
  } catch (err) {
    console.log(err);
  }
};
