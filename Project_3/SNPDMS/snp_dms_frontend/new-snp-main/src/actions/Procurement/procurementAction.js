import axiosInstance from "@/AxiosExtend";
import { startLoading, stopLoading } from "../UIActions";

export const downloadProcurementReports =
  (ediBodyData, setLoader, alert) => async (dispatch) => {
    dispatch(startLoading());
    try {
      setLoader(true);
      const res = await axiosInstance.post(
        `procurement/reports/`,
        ediBodyData,
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        setLoader(false);
        downloadReport(res.data, ediBodyData.report);
      } else if (res.data.errorMsg) {
        setLoader(false);
        alert(res.data.errorMsg, {
          variant: "error",
        });
      }
    } catch (err) {
      console.log(err.response);
      alert(err.response.statusText, {
        variant: "error",
      });
    } finally {
      dispatch(stopLoading());
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

export const getProAllTools = (notify) => async (dispatch, getState) => {
  const location = await getState().user.location_id;
  const site = await getState().user.site_id;
  const {
    pg_no,
    set_on_page_data,
    category,
    sku_code,
    name,
    process,
    from_date,
    to_date,
  } = await getState().Procurement.allTools;
  dispatch({ type: "GET_ALL_TOOLS_TABLE_LOAD", payload: "TRUE" });
  dispatch(startLoading());
  axiosInstance
    .post("procurement/tool/all_tools/", {
      location: location,
      site: site,
      pg_no,
      on_page_data: set_on_page_data,
      category,
      sku_code,
      name,
      from_date,
      to_date,
      process,
    })
    .then((res) => {
      dispatch({ type: "GET_ALL_TOOLS_TABLE_LOAD", payload: "FALSE" });
      dispatch({ type: "GET_ALL_TOOLS", payload: res.data });
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    })
    .finally(() => {
      dispatch(stopLoading());
    });
};

export const addTools = (val, notify) => async (dispatch, getState) => {
  const location = await getState().user.location_id;
  const site = await getState().user.site_id;
  dispatch(startLoading());
  axiosInstance
    .post("procurement/tool/add/", {
      ...val,
      location,
      site,
    })
    .then((res) => {
      notify(res.data.message, { variant: "success" });
      dispatch(getProAllTools(notify));
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    })
    .finally(() => {
      dispatch(stopLoading());
    });
};

export const editTools = (val, notify) => async (dispatch) => {
  if (val.pk === undefined || val.pk === "" || val.pk === null) {
    return;
  }
  dispatch(startLoading());
  axiosInstance
    .get(`procurement/tool/${val.pk}/`)
    .then((res) => {
      dispatch({ type: "EDIT_TOOLS", payload: res.data.data });
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    })
    .finally(() => {
      dispatch(stopLoading());
    });
};

export const editToolsButton =
  (pk, val, notify) => async (dispatch, getState) => {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;
    dispatch(startLoading());
    axiosInstance
      .put(`procurement/tool/${pk}/update/`, {
        ...val,
        location,
        site,
      })
      .then((res) => {
        dispatch({
          type: "EDIT_TOOLS",
          payload: {
            category: "",
            hsn_code: "",
            rate: "",
            name: "",
          },
        });
        notify(res.data.message, { variant: "success" });
        dispatch(getProAllTools(notify));
      })
      .catch((err) => {
        notify(err.response.message, { variant: "error" });
        console.log("Dashboard Error !", err);
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  };

export const editToolsEmpty = () => async (dispatch, getState) => {
  dispatch({
    type: "EDIT_TOOLS",
    payload: {},
  });
};

export const extractToolData = (fileData, alert) => async (dispatch) => {
  try {
    dispatch({ type: "GET_EXTRACT_TOOL_DATA", payload: { loading: true } });
    const res = await axiosInstance.post(
      `/procurement/tool/extract/`,
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
      dispatch({ type: "GET_EXTRACT_TOOL_DATA", payload: { loading: false } });
      dispatch({ type: "GET_EXTRACT_TOOL_DATA", payload: { data: res.data } });
    }
  } catch (err) {
    alert(err.response.data.message, {
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

export const importToolData =
  (importArray, alert, history) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/procurement/tool/import/`,
        importArray,
        { responseType: "arraybuffer" },
        history.push("/procurement/tools"),
      );
      if (res.data) {
        downloadEDI(res.data, "ToolRoom_Approved");

        alert(res.data.message, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.message, { variant: "error" });
    }
  };

export const downloadToolRejectedData =
  (rejectArray, alert, history) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/procurement/tool/rejected_file/`,
        rejectArray,
        { responseType: "arraybuffer" },
        history.push("/procurement/tools"),
      );
      if (res.data) {
        downloadSample(res.data, "ToolRoom Rejected");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const deleteProAllTools = (val, notify) => async (dispatch) => {
  const data = val.map((d) => d.pk);
  dispatch(startLoading());
  try {
    axiosInstance
      .post(`procurement/tool/delete/`, data)
      .then((res) => {
        notify(res.data.message, { variant: "success" });
        dispatch(getProAllTools());
      })
      .catch((err) => {
        notify(err.response.data.message, {
          variant: "error",
        });
        console.log("Dashboard Error !", err);
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  } catch (error) {
    notify(error.message, { variant: "error" });
  } finally {
    dispatch(stopLoading());
  }
};
export const deleteSingleData = (val, notify) => async (dispatch) => {
  const data = val.pk;
  dispatch(startLoading());
  axiosInstance
    .post(`procurement/tool/delete/`, [data])
    .then((res) => {
      notify(res.data.message, { variant: "success" });
      dispatch(getProAllTools());
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    })
    .finally(() => {
      dispatch(stopLoading());
    });
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

export const downloadToolSampleData = (alert) => async () => {
  try {
    const res = await axiosInstance.get(`/procurement/tool/sample_file/`, {
      responseType: "arraybuffer",
    });
    if (res.data) {
      downloadSample(res.data, "ToolRoom_Sample_File");
      alert("Sample File Downloaded Succesfully", { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err.response.data.message, { variant: "error" });
  }
};

export const toolGetAllCategory = (notify) => async (dispatch, getState) => {
  try {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;
    dispatch(startLoading());
    axiosInstance
      .post("procurement/dropdown/", {
        fields: ["tools_list", "category_list", "sku_codes"],
        location_id: location,
        site_id: site,
      })
      .then((res) => {
        dispatch({ type: "GET_ALL_TOOLS_CATEGORY", payload: res.data });
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      })
      .finally(() => {
        dispatch(stopLoading());
      });
  } catch (err) {
    console.log(err);
  }
};

export const toolGetAllCategoryByAdminAction =
  (admin_site_id, admin_location_id, notify) => async (dispatch, getState) => {
    dispatch(startLoading());
    try {


      axiosInstance
        .post("procurement/dropdown/", {
          fields: ["tools_list", "category_list"],
          location_id:admin_location_id,
          site_id: admin_site_id,
        })
        .then((res) => {
          dispatch({ type: "GET_ALL_TOOLS_CATEGORY", payload: res.data });
        })
        .catch((err) => {
          console.log("Dashboard Error !", err);
        })
        .finally(() => {
          dispatch(stopLoading());
        });
    } catch (err) {
      console.log(err);
    }
  };

export const procurementToolHistoryAction =
  (body, setLoading, setData, alert) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    dispatch(startLoading());
    try {
      setLoading(true);
      const res = await axiosInstance.post(
        `/procurement/tool/tool_rate_history/`,
        { ...body, site_id, location_id },
      );
      if (res.data) {
        setData(res.data);
        setLoading(false);
        if (res.data.data.length === 0) {
          alert("No Data Found", { variant: "error" });
        }
      } else if (res.data.errorMsg) {
        setLoading(false);
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      setLoading(false);
      alert(err.response.data.message, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const procurementMasterStockAction =
  (alert) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const { category, name, sku_code, pg_no, on_page_data_client } =
      await getState().Procurement.masterStock;
    // const site = await getState().user.site;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(`/procurement/master_stock/`, {
        category,
        name,
        sku_code,
        pg_no,
        on_page_data: on_page_data_client,
        location_id,
      });
      if (res.data) {
        if (res.data.data.length === 0) {
          alert("No Data Found", { variant: "error" });
        } else {
          dispatch({ type: "GET_ALL_MASTER_STOCKS", payload: res.data });
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      alert(err.response.data.message, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const downloadMasterStockAction =
  (alert) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        `/procurement/reports/master_stock/`,
        { location_id },
        {
          responseType: "arraybuffer",
        },
      );
      if (res.data) {
        downloadSample(res.data, "Master_Stock_File");
        alert(" File Downloaded Succesfully", { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err.response.data.message, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };

export const automationProcurementDeleteStockAction =
  (notify, handleOnCloseWarningDialog) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    dispatch(startLoading());
    try {
      const res = await axiosInstance.post(
        "/automation/delete_procurement_stock/",
        {
          location,
          site,
        },
      );
      if (res.data) {
        if (res.data?.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          if (res.data?.successMsg) {
            notify(res.data.successMsg, { variant: "success" });
          }
          if (handleOnCloseWarningDialog) {
            handleOnCloseWarningDialog();
          }
        }
      }
    } catch (err) {
      notify(err.response?.data?.errorMsg, { variant: "error" });
    } finally {
      dispatch(stopLoading());
    }
  };
