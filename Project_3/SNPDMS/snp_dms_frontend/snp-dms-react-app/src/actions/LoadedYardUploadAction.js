import { axiosInstance } from "../Axios";

export const downloadStockSampleData = (alert) => async (dispatch,getState) => {
  const site = await getState().user.site;
  try {
    const res = await axiosInstance.get(
      `/loaded_yard/get_loaded_yard_sample_file/${site}/`,
      {
        responseType: "arraybuffer",
      }
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
  }
};

export const extractStockData =
  (fileData, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/loaded_yard/extract_loaded_yard_data/`,
        fileData
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else {
        dispatch({ type: "EXTRACT_STOCK_DATA", payload: res.data });      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };


  export const importStockData =
  (importArray,  alert, history) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/loaded_yard/import_loaded_yard_data/`,
        importArray, {responseType: "arraybuffer"}, history.push("/loaded-yard")
      );
      if (res.data) {
        downloadEDI(res.data, "loaded_yard_approved");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, { variant: "error"});
    }
  };

export const downloadStockRejectedData =
  (rejectArray,  alert, history) => async (dispatch) => {
    try {
      const res = await axiosInstance.post( `/loaded_yard/rejected_file_loaded_yard/`,rejectArray,
        {responseType: "arraybuffer" }, history.push("/loaded-yard"));
      if (res.data) {
        downloadSample(res.data, "loaded_yard_rejected");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
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


export const downloadEDI = (arrayBuffer, FileName, FileType) => {
  let blob = new Blob([arrayBuffer], {
    type: FileType,
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
