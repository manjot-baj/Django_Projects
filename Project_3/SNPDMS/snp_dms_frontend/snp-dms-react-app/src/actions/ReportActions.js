import { axiosInstance } from "../Axios";

export const downloadReports = (ediBodyData, setLoader, alert) => async () => {
  try {
    setLoader(true);
    const res = await axiosInstance.post(
      `report/download_report/`,
      ediBodyData,
      {
        responseType: "arraybuffer",
      }
    );
   
    if (res.data) {
      setLoader(false);
      if (res.headers["x-filename"]) {
      
        downloadReport(res.data, res.headers["x-filename"]);
      } else if(res.headers["content-type"] == "application/json") {
        alert("Data Not Found", {
          variant: "error",
        });
      
      }else{
        downloadReport(res.data, ediBodyData.report);
      }
    } else if (res.data.errorMsg) {
      setLoader(false);
      alert(res.data.errorMsg, {
        variant: "error",
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};


export const downloadAnalyticsReports = (ediBodyData, setLoader, alert) => async () => {
  try {
    setLoader(true);
    const res = await axiosInstance.post(
      `analytics/analytics_reports/`,
      ediBodyData,
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data) {
      setLoader(false);
      downloadReport(res.data, "Analytics Report");
    } else if (res.data.errorMsg) {
      setLoader(false);
      alert(res.data.errorMsg, {
        variant: "error",
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const downloadReport = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
