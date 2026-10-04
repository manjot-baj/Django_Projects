import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getTransportationReports =
  (ediBodyData, setLoader, alert) => async (dispatch) => {
    tempJson = ediBodyData;
    try {
      setLoader(true);
      const res = await axiosInstance.post(
        `transportation/reports/`,
        ediBodyData,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data) {
        setLoader(false);
        downloadReport(res.data, ediBodyData.report_type);
      } else if (res.data.errorMsg) {
        setLoader(false);
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
      dispatch({
        type: "GET_ALL_TRANSAPORTATION_REPORTS",
        payload: res.data.data,
      });
    } catch (err) {
      console.log(err);
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
