import axiosInstance from "@/AxiosExtend";
import { startLoading, stopLoading } from "./UIActions";

export const downloadReports = (ediBodyData, setLoader, alert) => async (dispatch, getState) => {
  try {
      dispatch(startLoading());
    setLoader(true);
    const res = await axiosInstance.post(
      `report/download_report/`,
      ediBodyData,
      {
        responseType: "arraybuffer",
      },
    );

    if (res.data) {
      setLoader(false);
      if (res.headers["x-filename"]) {
        downloadReport(res.data, res.headers["x-filename"]);
      } else if (res.headers["content-type"] == "application/json") {
        alert("Data Not Found", {
          variant: "error",
        });
      } else {
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
  }finally{
      dispatch(stopLoading());
  }
};

export const LOLOInvoiceReportDownloadAction =
  (from_date, to_date, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/report/download_lolo_invoice_report/",
        {
          from_date,
          to_date,
          location,
          site,
        },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          downloadReport(res.data, "LOLO Invoice Report");
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const downloadAnalyticsReports =
  (ediBodyData, setLoader, alert) => async () => {
    try {
      setLoader(true);
      const res = await axiosInstance.post(
        `analytics/analytics_reports/`,
        ediBodyData,
        {
          responseType: "arraybuffer",
        },
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
