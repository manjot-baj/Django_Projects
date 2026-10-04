import axiosInstance from "@/AxiosExtend"

export const uploadDownloadMNREDI =
  (ediBodyData, fileType, alert) => async () => {
    try {
      let reqFileType = "";
      let downloadFileName = "";
      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        reqFileType = "data:text/plain;charset=utf-8";
        downloadFileName = ".txt";
      } else {
        reqFileType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;";
        downloadFileName = ".xlsx";
      }
      const res = await axiosInstance.post(
        `wistim_distim/upload/`,
        ediBodyData,
        {
          responseType: "arraybuffer",
          headers:{
            "Content-Type":"multipart/form-data"
          }
        }
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      } else {
        console.log("EDI response", res);
        downloadEDI(res.data, "MSC" + downloadFileName, reqFileType);
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
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
