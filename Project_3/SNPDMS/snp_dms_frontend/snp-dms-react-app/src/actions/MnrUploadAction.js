import { axiosInstance } from "../Axios";

export const downloadMnrSampleData = (alert, value) => async () => {
  try {
    const res = await axiosInstance.get(
      `mnr/${value}/get_repair_upload_sample_file/`,
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

export const downloadMnrSampleWashingData = (alert) => async () => {
  try {
    const res = await axiosInstance.get(
      `mnr/get_bulk_survey_sample_download/`,
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data) {
      downloadSample(res.data, "Sample ");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const downloadMnrWashingTariff =
  (alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    try {
      const res = await axiosInstance.post(
        `mnr/get_bulk_tariff_download/`,
        { location, site },
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        downloadSample(res.data, "Washing Tariff ");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const extractMnrData = (fileData, value, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `mnr/${value}/extract_repair_data/`,
      fileData
    );
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      dispatch({ type: "EXTRACT_MNR_DATA", payload: res.data });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const extractMnrWashingData = (fileData, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `mnr/extract_survey_data/`,
      fileData
    );
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      dispatch({ type: "EXTRACT_MNR_DATA", payload: res.data });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const importMnrStockData =
  (importArray, value, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `mnr/${value}/import_repair_data/`,
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

  export const importMnrWashingData =
  (importArray, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `mnr/import_survey_data/`,
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

export const downloadMnrRejectedData =
  (rejectArray, value, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `mnr/${value}/rejetcted_repair_data/`,
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


  export const downloadMnrRejectedWashingData =
  (rejectArray, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `mnr/rejected_survey_file/`,
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

export const downloadSample = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
