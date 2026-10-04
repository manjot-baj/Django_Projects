import { axiosInstance } from "../Axios";

export const sendStageWistim = (data, stage) => async (dispatch) => {
  try {
    console.log(data);
    const url =
      stage === "Estimate"
        ? "mnr/send_estimate_wistim/"
        : "mnr/send_repair_distim/";
    const res = await axiosInstance.post(url, data, {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      downloadEDI(
        res.data,
        stage === "Estimate" ? "Estimate_Wistim.txt" : "Repair_Wistim.txt",
        "data:text/plain;charset=utf-8"
      );
    }
  } catch (err) {
    console.log(err);
  }
};

export const uploadEstimateDestim = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("mnr/upload_estimate_distim/", data);
    console.log("Response is", res);
    dispatch({ type: "UPLOAD_ESTIMATE_DESTIM", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const downloadRejectedEstimateDestim =
  (data, alert, value) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        "mnr/get_rejected_estimate_distim/",
        data,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      } else {
        downloadEDI(
          res.data,
          value,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
      }
    } catch (err) {
      console.log(err);
    }
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
