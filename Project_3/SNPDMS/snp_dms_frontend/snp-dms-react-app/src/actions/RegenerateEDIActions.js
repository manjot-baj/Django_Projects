import { axiosInstance } from "../Axios";

export const downloadRegeneratedEDI =
  (ediBodyData, setLoader, alert) => async () => {
    try {
      setLoader(true);
      var today = new Date();
      var date =
        String(today.getDate()).padStart(2, "0") +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getFullYear());
      var time = String(today.getHours()) + String(today.getMinutes());
      var dateTime = date + time;
      const res = await axiosInstance.post(`edi/download_edi/`, ediBodyData, {
        responseType: "arraybuffer",
      });
      if (res.status === 200) {
        setLoader(false);
        downloadEDI(res.data, ediBodyData.site + "_" + dateTime);
        alert("File Downloded", { variant: "success" });
      } else {
        setLoader(false);
        alert("Data Not Found", { variant: "error" });
      }
    } catch (err) {
      setLoader(false);
      alert("Data Not Found", { variant: "error" });
    }
  };

export const downloadRegeneratedEDILoaded =
  (ediBodyData, setLoader, alert) => async () => {
    try {
      setLoader(true);
      var today = new Date();
      var date =
        String(today.getDate()).padStart(2, "0") +
        String(today.getMonth() + 1).padStart(2, "0") +
        String(today.getFullYear());
      var time = String(today.getHours()) + String(today.getMinutes());
      var dateTime = date + time;

      const res = await axiosInstance.post(
        `loaded_yard/loaded_yard_edi_report/`,
        ediBodyData,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.status === 200) {
        setLoader(false);
        downloadEDILoaded(res.data, ediBodyData.site + "_" + dateTime);
        alert("File Downloded", { variant: "success" });
      } else {
        setLoader(false);
        alert("Data Not Found", { variant: "error" });
 
      }
    } catch (err) {
      setLoader(false);
      alert("Data Not Found", { variant: "error" });
  
    }
  };

  export const downloadExcelEDI = (data,alert) => async (dispatch) => {
    try {
   
      const url = "/loaded_yard/loaded_yard_excel_edi/"
      const res = await axiosInstance.post(url, data, {
        responseType: "arraybuffer",
      });
      if(res.headers["content-type"] !=="application/json"){
        alert("File Downloaded Successfully", {
          variant: "success",
        });
        if (res.headers["x-filename"]) {
          downloadExeclEDI(
            res.data , 
            res.headers["x-filename"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
        
        } else {
          downloadExeclEDI(
            res.data , 
            "Loaded Yard Excel EDI",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
      
        }
      
      }else{
        alert("Data Not Found ", {
          variant: "error",
        });
      }
      
      
    } catch (err) {
      console.log(err);
    }
  };

export const downloadEDILoaded = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer]);
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const downloadEDI = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/zip",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const downloadExeclEDI = (arrayBuffer, FileName, FileType) => {
  let blob = new Blob([arrayBuffer], {
    type: FileType,
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
