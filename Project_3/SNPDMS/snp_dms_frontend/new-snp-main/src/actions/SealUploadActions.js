import axiosInstance from "@/AxiosExtend";
import { downloadSample } from "./StockUploadActions";
import { startLoading, stopLoading } from "./UIActions";

export const downloadSealSampleData = (alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(
      `/master/get_seal_no_upload_sample_file/
    `,
      {
        responseType: "arraybuffer",
      },
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
  } finally {
    dispatch(stopLoading());
  }
};

export const extractSealData = (fileData, alert) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.post(
      `/master/extract_seal_no_upload_file_data/`,
      fileData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
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
  } finally {
    dispatch(stopLoading());
  }
};

export const importSealData =
  (importArray, alert, setDisableImport) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `master/extract_seal_no_data_import/        `,
        importArray,
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        if (setDisableImport) {
          setDisableImport(true);
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

export const downloadRejectedData =
  (rejectArray, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/master/rejected_seal_no_file_download/`,
        rejectArray,
        {
          responseType: "arraybuffer",
        },
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
    } finally {
      dispatch(stopLoading());
    }
  };
