import { axiosInstance } from "../Axios";
import { MNR_PROCESS_BY_EDIT, MNR_PROCESS_UNLOCK } from "./types";
import { downloadEDI } from "./MNREDIActions";
import { downloadReceiptsDO } from "./GateInActions";

export const getMNRProcessByEdit =
  (body, history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      stock_id: body.stock_id,
      location: location,
      site: site,
    };
    axiosInstance
      .post("mnr/get_by_edit/", bodyData)
      .then((res) => {
        if (res.data.errorMsg) alert(res.data.errorMsg);
        else {
          dispatch({ type: MNR_PROCESS_BY_EDIT, payload: res.data });
          history.push({
            pathname: '/mnrprocess', 
            state: {  
              // location state
              import: false, 
              repair_import:false
            },
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };


 

  export const getMNRProcessByEditImportAction =
  (body, history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      stock_id: body.stock_id,
      location: location,
      site: site,
    };
    axiosInstance
      .post("mnr/get_by_edit/", bodyData)
      .then((res) => {
        if (res.data.errorMsg) alert(res.data.errorMsg);
        else {
          dispatch({ type: MNR_PROCESS_BY_EDIT, payload: res.data });
          history.push({
            pathname: '/mnrprocess', 
            state: {  // location state
              import: true, 
              import_repair:true
            },
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  export const getMNRProcessByImportRepairAction =
  (container_no,notify,history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {container_data} =await getState().MNRProcess.mnrProcessData
   
    axiosInstance
      .post("repair/import_repair_data/", {
       location,
       site,
       container_no
      })
      .then((res) => {
        if (res.data.errorMsg) notify(res.data.errorMsg);
        else {
          notify("Successfully Imported Data",{variant:"success"})
          dispatch(getMNRProcessByEdit({stock_id:container_data.stock_id},history))
        }
      })
      .catch((err) => {
         console.log("Err!")
      });
  };


  export const getMNRProcessUnlock =
  (body, history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      stock_id: body.stock_id,
      location: location,
      site: site,
      reason_to_unlock: body.reason_to_unlock,
    };
    axiosInstance
      .post("mnr/unlock_survey_estimate/", bodyData)
      .then((res) => {
        console.log("Unlock Response", res.data);
        if (res.data.errorMsg) alert(res.data.errorMsg);
        else {
          dispatch({ type: MNR_PROCESS_UNLOCK, payload: res.data });
          history.push("/mnrprocess");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const getMNRProcessBySearch =
  (body, setDropdown) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const bodyData = {
      container_no: body.container_no,
      date: body.date,
      location: location,
      site: site,
    };
    axiosInstance
      .post("mnr/get_by_search/", bodyData)
      .then((res) => {
        console.log("First Response", res.data);
        setDropdown && setDropdown(false);
        if (res.data.errorMsg) alert(res.data.errorMsg);
        else {
          dispatch({ type: MNR_PROCESS_BY_EDIT, payload: res.data });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const getMNRProcessByImportAction =
  (container_no, notify, history) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { container_data } = await getState().MNRProcess.mnrProcessData;

    axiosInstance
      .post("surveyor/import_survey_data/", {
        location,
        site,
        container_no,
      })
      .then((res) => {
        if (res.data.errorMsg) notify(res.data.errorMsg,{variant:"error"});
        else {
          notify("Successfully Imported Data",{variant:"success"})
          dispatch(getMNRProcessByEdit({stock_id:container_data.stock_id},history))
        }
      })
      .catch((err) => {
        console.log("Err!");
      });
  };

export const createSurvey = (body, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  let reqBody = {
    container_no: body.reload_container_no,
    date: body.reload_container_date,
    location: location,
    site: site,
  };
  axiosInstance
    .post("mnr/survey/", body)
    .then((res) => {
      console.log("Created Survey", res.data);
      if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
      else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const updateSurvey = (body, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  let reqBody = {
    container_no: body.reload_container_no,
    date: body.reload_container_date,
    location: location,
    site: site,
  };
  axiosInstance
    .put(`mnr/survey/${body.pk}/`, body)
    .then((res) => {
      console.log("Updated Survey", res);
      if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
      else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const uploadSurveyImage =
  (body, req, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: req.reload_container_no,
      date: req.reload_container_date,
      location: location,
      site: site,
    };
    axiosInstance
      .post(`mnr/survey/${req.pk}/upload_image/`, body)
      .then((res) => {
        console.log("Survey Images Uploaded", res);
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          dispatch(getMNRProcessBySearch(reqBody));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const uploadRepairImage =
  (body, req, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: req.reload_container_no,
      date: req.reload_container_date,
      location: location,
      site: site,
    };
    console.log(req.pk, "PK");
    axiosInstance
      .post(`mnr/repair/${req.pk}/upload_image/`, body)
      .then((res) => {
        console.log("Repair Images Uploaded", res);
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          dispatch(getMNRProcessBySearch(reqBody));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const downloadSurveyImage =
  (body, pk, alert) => async (dispatch, getState) => {
    axiosInstance
      .post(`mnr/survey/${pk}/download_image/`, body, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        console.log("Survey Images Downloaded", res);
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else if (res.data) {
          downloadReceiptsDO(res.data, "Survey_Images", {
            type: "application/zip",
          });
          alert("Images downloaded successfully !", { variant: "success" });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const deleteSurveyImage =
  (body, pk, detail, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: detail.reload_container_no,
      date: detail.reload_container_date,
      location: location,
      site: site,
    };

    axiosInstance
      .post(`mnr/survey/${pk}/delete_image/`, body, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else {
          dispatch(getMNRProcessBySearch(reqBody));
          alert("Deleted Successfully", { variant: "success" });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const downloadRepairImage =
  (body, pk, alert) => async (dispatch, getState) => {
    axiosInstance
      .post(`mnr/repair/${pk}/download_image/`, body, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        console.log("Repair Images Downloaded", res);
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else if (res.data) {
          downloadReceiptsDO(res.data, "Repair_Images", {
            type: "application/zip",
          });
          alert("Images downloaded successfully !", { variant: "success" });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const deleteRepairImage =
  (body, pk, detail, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: detail.reload_container_no,
      date: detail.reload_container_date,
      location: location,
      site: site,
    };

    axiosInstance
      .post(`mnr/repair/${pk}/delete_image/`, body, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else {
          dispatch(getMNRProcessBySearch(reqBody));
          alert("Deleted Successfully", { variant: "success" });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const createEstimate = (body, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  let reqBody = {
    container_no: body.reload_container_no,
    date: body.reload_container_date,
    location: location,
    site: site,
  };
  axiosInstance
    .post("mnr/estimate/", body)
    .then((res) => {
      console.log("Created Estimate", res.data);
      if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
      else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const updateEstimate = (body, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  let reqBody = {
    container_no: body.reload_container_no,
    date: body.reload_container_date,
    location: location,
    site: site,
  };
  axiosInstance
    .put(`mnr/estimate/${body.pk}/`, body)
    .then((res) => {
      console.log("Updated Estimate", res.data);
      if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
      else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const calculateEstimate =
  (body, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: body.reload_container_no,
      date: body.reload_container_date,
      location: location,
      site: site,
    };
    console.log("Calc Estimate Body", body);
    console.log("get MNR Body", reqBody);
    axiosInstance
      .post("mnr/calculate_estimate/", body)
      .then((res) => {
        console.log("Calculated Estimate", res);
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else {
          alert("Estimate Updated", { variant: "success" });
          dispatch(getMNRProcessBySearch(reqBody));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const createApproval = (body, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  let reqBody = {
    container_no: body.reload_container_no,
    date: body.reload_container_date,
    location: location,
    site: site,
  };

  axiosInstance
    .post("mnr/approval/", body)
    .then((res) => {
      console.log("Created Approval", res.data);
      if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
      else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const createRepair = (body, alert) => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  let reqBody = {
    container_no: body.reload_container_no,
    date: body.reload_container_date,
    location: location,
    site: site,
  };

  axiosInstance
    .post("mnr/repair/", body)
    .then((res) => {
      console.log("Created Repair", res.data);
      if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
      else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

export const updateRepair =
  (body, reloadObj, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: reloadObj.reload_container_no,
      date: reloadObj.reload_container_date,
      location: location,
      site: site,
    };
    axiosInstance
      .put(`mnr/repair/${body.pk}/`, body)
      .then((res) => {
        console.log("Created Repair", res.data);
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          dispatch(getMNRProcessBySearch(reqBody));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const uploadSurvey =
  (surveyBodyData, req, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: req.reload_container_no,
      date: req.reload_container_date,
      location: location,
      site: site,
    };
    try {
      const res = await axiosInstance.post(
        `mnr/survey/${req.pk}/upload/`,
        surveyBodyData
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      } else {
        alert(res.data.sucessMsg, {
          variant: "success",
        });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const downloadSurvey = (pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`mnr/survey/${pk}/download/`, {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      downloadEDI(res.data, "Survey_Data", "application/zip");
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const makeAvailableReverse =
  (pk, alert, req) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: req.reload_container_no,
      date: req.reload_container_date,
      location: location,
      site: site,
    };

    axiosInstance
      .get(`mnr/survey/${pk}/make_available_reverse/`)
      .then((res) => {
        if (res.data.errorMsg) alert(res.data.errorMsg, { variant: "error" });
        else if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });
          dispatch(getMNRProcessBySearch(reqBody));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

export const uploadRepair =
  (repairBodyData, req, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    let reqBody = {
      container_no: req.reload_container_no,
      date: req.reload_container_date,
      location: location,
      site: site,
    };
    try {
      const res = await axiosInstance.post(
        `mnr/repair/${req.pk}/upload/`,
        repairBodyData
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, {
          variant: "error",
        });
      } else {
        alert(res.data.successMsg, {
          variant: "success",
        });
        dispatch(getMNRProcessBySearch(reqBody));
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const downloadRepair = (pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`mnr/repair/${pk}/download/`, {
      responseType: "arraybuffer",
    });
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      downloadEDI(res.data, "Repair_Data", "application/zip");
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};


export const ediFtpUploadEstimate = (pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`mnr/estimate/${pk}/edi_ftp_upload/`, {});
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      downloadSample(
        res.data,
        "edi_upload.txt",
        "data:text/plain;charset=utf-8"
      );
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const imgFtpUploadEstimate = (pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`mnr/estimate/${pk}/img_ftp_upload/`, {});
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      alert(res.data.successMsg, {
        variant: "success",
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const ediFtpUploadRepair = (pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`mnr/repair/${pk}/edi_ftp_upload/`, {});
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      downloadSample(
        res.data,
       "edi_upload.txt",
        "data:text/plain;charset=utf-8"
      );
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const imgFtpUploadRepair = (pk, alert) => async () => {
  try {
    const res = await axiosInstance.get(`mnr/repair/${pk}/img_ftp_upload/`, {});
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      alert(res.data.successMsg, {
        variant: "success",
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};


export const downloadJobSheet = (body, alert) => async () => {
  try {
    const res = await axiosInstance.post(`mnr/download_job_sheet/`, body, {
      responseType: "arraybuffer",
    });
    console.log(res);
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, {
        variant: "error",
      });
    } else {
      downloadEDI(
        res.data,
        "print_job",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;"
      );
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const downloadSample = (arrayBuffer, FileName, FileType) => {
  let blob = new Blob([arrayBuffer], {
    type: FileType,
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
