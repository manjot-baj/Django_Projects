import axiosInstance from "@/AxiosExtend";
import { startLoading, stopLoading } from "./UIActions";

export const downloadSampleData = (alert, value) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const res = await axiosInstance.get(
      `${value}/get_stock_upload_sample_file/`,
      {
        responseType: "arraybuffer",
      },
    );
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

export const extractStockData =
  (fileData, value, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `${value}/extract_stock_upload_file_data/`,
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
        dispatch({ type: "EXTRACT_STOCK_DATA", payload: res.data });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    } finally {
      dispatch(stopLoading());
    }
  };

export const importStockData =
  (importArray, value, alert, setDisableImport) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `${value}/extract_stock_data_import/`,
        importArray,
      );
      if (res.data.successMsg) {
        if (setDisableImport) {
          setDisableImport(true);
        }
        alert(res.data.successMsg, { variant: "success" });
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
  (rejectArray, value, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `${value}/rejected_stock_data_file_download/`,
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

export const downloadSample = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
