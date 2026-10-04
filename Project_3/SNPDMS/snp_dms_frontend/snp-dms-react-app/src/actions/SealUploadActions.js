import { axiosInstance } from "../Axios";
import {downloadSample}  from "./StockUploadActions";

export const downloadSealSampleData = (alert) => async () => {
  try {
    const res = await axiosInstance.get(`/master/get_seal_no_upload_sample_file/
    `,
      {
        responseType: "arraybuffer",
      }
    );
    console.log(res, "response");
    if (res.data) {
      downloadSample(res.data, "Sample");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};


export const extractSealData =
  (fileData, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/master/extract_seal_no_upload_file_data/`,
        fileData
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else {
        dispatch({ type: "EXTRACT_SEAL_DATA", payload: res.data });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const importSealData =
  (importArray, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `master/extract_seal_no_data_import/        `,
        importArray
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const downloadRejectedData =
  (rejectArray, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/master/rejected_seal_no_file_download/`,
        rejectArray,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        downloadSample(res.data, "Rejected");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

