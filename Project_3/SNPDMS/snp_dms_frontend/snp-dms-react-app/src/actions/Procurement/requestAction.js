import { axiosInstance } from "../../Axios";
import { REQ_REDUCER } from "../../reducers/procurement/requesitionReducer";

export const editCreateReq = (val) => async (dispatch, getState) => {
  const data = await getState().ProcurementRequest.createRequest.data
    .requisition_line;
  const amount = data.reduce((acc, curr) => acc + curr.amount, 0);
  dispatch({ type: "REQ_EDIT", payload: { total_amount: amount, ...val } });
};

export const changeModeAction = (val) => (dispatch) => {
  dispatch({ type: REQ_REDUCER.REQ_REDUCER_CHANGE_MODE, payload: val });
};

export const updateHistoryAmount = (pk, amount, notify) => {
  try {
    axiosInstance
      .post(`procurement/requisition/history/update/`, {
        pk,
        total_amount: amount,
      })
      .then((res) => {
        notify(res.data.message, {
          variant: "success",
        });
      })
      .finally(() => window.history.go(0));
  } catch (error) {
    notify(error.response.data.message, {
      variant: "error",
    });
  }
};

export const updateRequesition =
  (notify, history, partialy = false,setLineOriginal) =>
  async (dispatch, getState) => {
    const val = await getState().ProcurementRequest.getRequesition_by_pk;
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    if (partialy) {
      val.requisition_line = val.requisition_line.map((data) => {
        delete data.sku_code;
        data.received_qty = Number(data.received_qty);
        return data;
      });
    }
    const dataPk = val.pk;
    
    dispatch({ type: "START_LOADING" });
    try {
      axiosInstance
        .put(`procurement/requisition/${dataPk}/update/`, {
          ...val,
          location_id,
          site_id,
        })
        .then((res) => {
          notify(res.data.message, { variant: "success" });
          dispatch({ type: "STOP_LOADING" });
          if (res.data.data) {
            dispatch({
              type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
              payload: res.data.data,
            });
            if (setLineOriginal) {
            setLineOriginal(res.data.data.requisition_line);
            }
          }else {
            window.history.go(0)
          }
         
        })
      
    } catch (error) {
      dispatch({ type: "STOP_LOADING" });
      notify(error.response.data.message, { variant: "error" });
    }
  };

export const downloadPDF = (pk, notify) => async () => {
  try {
    axiosInstance
      .get(`procurement/requisition/${pk}/approval/pdf/`, {
        responseType: "blob",
      })
      .then((res) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(res.data);
        a.download = `Approval Report.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        notify("Downloaded Succesfully", { variant: "success" });
      });
  } catch (error) {
    notify(error.response.data.message, { variant: "error" });
  }
};

export const deleteRequesition =
  (notify, history) => async (dispatch, getState) => {
    const val = await getState().ProcurementRequest.getRequesition_by_pk;
    const dataPk = val.pk;

    try {
      axiosInstance
        .delete(`procurement/requisition/${dataPk}/delete/`)
        .then((res) => {
          notify(res.data.message, { variant: "success" });
        })
        .finally(() => history.goBack());
    } catch (error) {
      notify(error.response.data.message, { variant: "error" });
    }
  };

export const getRequistionByPk =
  (pk, notify, setLineOriginal) => async (dispatch) => {
    axiosInstance
      .get(`procurement/requisition/${pk}/`)
      .then((res) => {
        dispatch({
          type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
          payload: res.data,
        });
        setLineOriginal(res.data.requisition_line);
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const getAllRequistion = (notify) => async (dispatch, getState) => {
  const location = await getState().user.location_id;
  const site = await getState().user.site_id;
  const {
    pg_no,
    edit_on_page_data,
    is_approved,
    name,
    is_pending,
    is_partial_closed,
    is_closed,
    from_date,
    is_automate,
    to_date,
    order_no,
  } = await getState().ProcurementRequest.getRequisition;
  axiosInstance
    .post("procurement/requisition/all_requisition/", {
      pg_no,
      on_page_data: edit_on_page_data,
      location_id:location,
      is_approved,
      name,
      is_automate,
      is_pending,
      from_date,
      to_date,
      site_id:site,
      is_partial_closed,
      is_closed,
      order_no,
    })
    .then((res) => {
      dispatch({ type: "GET_ALL_REQUEST", payload: res.data });
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    });
};

export const getAllRequistionByBill =
  (notify) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    const {
      from_received_date,
      to_received_date,
      from_bill_date,
      to_bill_date,
      bill_no,
    } = await getState().ProcurementRequest.getRequisition;
    axiosInstance
      .post("procurement/requisition/bills/", {
        from_received_date,
        to_received_date,
        from_bill_date,
        to_bill_date,
        bill_no,
        location_id,
        site_id,
      })
      .then((res) => {
        dispatch({
          type: REQ_REDUCER.REQ_REDUCER_GET_ALL_BILL,
          payload: res.data,
        });
      })
      .catch((err) => {
        notify("Data Load Failed . Try Again", { variant: "error" });
        console.log("Dashboard Error !", err);
      });
  };

export const createRequisition =
  (val, notify, history) => async (dispatch, getState) => {
    const data = await getState().ProcurementRequest.getRequesition_by_pk;
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    delete data.mode;
    data.requisition_line = data.requisition_line.map((val, index) => {
      delete val.sku_code;
      delete val.status_list;
      return val;
    });
    axiosInstance
      .post("procurement/requisition/add/", {
        ...data,
        location_id,
        site_id,
      })
      .then((res) => {
        notify(res.data.message, { variant: "success" });

        history.goBack();
      })
      .catch((err) => {
        notify(err.response.data.message, {
          variant: "error",
        });
        dispatch({
          type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
          payload: {
            mode: "CREATE",
          },
        });
        console.log("Dashboard Error !", err);
      });
  };

export const createRequestFromToolRoom =
  (val) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    const data = {
      pk: "",
      cgst: 0.0,
      sgst: 0.0,
      igst: 0.0,
      is_approved: false,
      order_no: "",
      date: currentDate(),
      total_amount: "",
      location,
      site,
      requisition_line: val.map((val) => ({
        category: val.category,
        name: val.name,
        rate: val.rate,
        quantity: 1,
        amount: val.rate,
        remarks: `${1} Purchases`,
      })),
    };
    dispatch({ type: "CREATE_REQ_FROM_TOOL", payload: data });
  };

const currentDate = () => {
  var selectedDate = new Date();
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

  return selectedDateFormat;
};

export const selectRequestTab = (number) => async (dispatch) => {
  try {
    dispatch({ type: "SELECT_TAB", payload: number });
  } catch (error) {
    console.log("Dashboard Error !");
  }
};

export const editCreateField = (index, val) => async (dispatch, getState) => {
  const data = await getState().ProcurementRequest.createRequest.data
    .requisition_line;
  const newData = data.map((value, number) => {
    if (number === index) {
      return { ...value, ...val };
    } else {
      return { ...value };
    }
  });

  dispatch({ type: "REQ_EDIT_FIELD", payload: newData });
  dispatch(editCreateReq());
};

export const deleteCreateField = (index) => async (dispatch, getState) => {
  const data = await getState().ProcurementRequest.createRequest.data
    .requisition_line;
  const newData = data.filter((val, valindex) => {
    return valindex !== index;
  });
  dispatch({ type: "REQ_DELETE_FIELD", payload: newData });
};

export const addField = () => async (dispatch, getState) => {
  const data = await getState().ProcurementRequest.editField;
  dispatch({
    type: "REQ_ADD",
    payload: {
      category: data.category,
      quantity: data.quantity,
      name: data.name,
      rate: data.rate,
      amount: data.amount,
      remarks: data.remarks,
    },
  });
};

export const handleChangeEdit = (val) => async (dispatch) => {
  dispatch({ type: "REQ_CREATE_ADD_EDIT", payload: val });
};

export const approveRequisitionAction =
  (req_no, notify) => async (dispatch, getState) => {
    try {
      axiosInstance
        .get(`procurement/get_requisition/${req_no}/`)
        .then((res) => {
          const req_data = res.data;
          axiosInstance
            .post("procurement/requisition_approval/", req_data)
            .then((res) =>
              notify("Requesition Approved Succesfully", { variant: "success" })
            )
            .catch((err) =>
              notify("Requesition Approval failed", { variant: "error" })
            );
        })
        .catch((err) => {
          notify("Requistion Get Failed", { variant: "error" });
        });
    } catch (err) {
      notify("Requesition  failed", { variant: "error" });
    }
  };

export const deleteRequisitionAction =
  (req_no, notify) => async (dispatch, getState) => {
    try {
      axiosInstance
        .get(`procurement/get_requisition/${req_no}/`)
        .then((res) => {
          const req_data_pk = res.data.pk;
          axiosInstance
            .post("procurement/delete_requisition/", req_data_pk)
            .then((res) =>
              notify("Requesition Deleted Succesfully", { variant: "success" })
            )
            .catch((err) =>
              notify("Requesition Deleted failed", { variant: "error" })
            );
        })
        .catch((err) => {
          notify("Requistion Get Failed", { variant: "error" });
        });
    } catch (err) {
      notify("Requesition  failed", { variant: "error" });
    }
  };

export const cancelRequisitionApprovalAction =
  (req_no, notify) => async (dispatch, getState) => {
    try {
      axiosInstance
        .get(`procurement/get_requisition/${req_no}/`)
        .then((res) => {
          const req_data = res.data;
          axiosInstance
            .post("procurement/cancel_requisition_approval/", req_data)
            .then((res) =>
              notify("Requesition Approval Canceled Succesfully", {
                variant: "success",
              })
            )
            .catch((err) =>
              notify("Requesition Approval Canceled Deleted failed", {
                variant: "error",
              })
            );
        })
        .catch((err) => {
          notify("Requistion Get Failed", { variant: "error" });
        });
    } catch (err) {
      notify("Requesition  failed", { variant: "error" });
    }
  };

export const editRequisitionAction =
  (req_no, notify) => async (dispatch, getState) => {
    try {
      axiosInstance
        .get(`procurement/get_requisition/${req_no}/`)
        .then((res) => {
          dispatch({
            type: REQ_REDUCER.REQ_REDUCER_GET_EDIT_REQUISITION,
            payload: res.data,
          });
        })
        .catch((err) => {
          notify("Requistion Get Failed", { variant: "error" });
        });
    } catch (err) {
      notify("Requesition  failed", { variant: "error" });
    }
  };

export const editRequisitionButtonAction = (val, notify) => {
  try {
    axiosInstance
      .put(`procurement/get_requisition/${val.pk}/`, val)
      .then((res) => {
        notify("Requistion Edited Succesfully", { variant: "success" });
      })
      .catch((err) => {
        notify("Requistion Get Failed", { variant: "error" });
      });
  } catch (err) {
    notify("Requesition  failed", { variant: "error" });
  }
};

export const getToolDataAction =
  (field, name) => async (dispatch, getState) => {
    try {
      const location = await getState().user.location_id;
      const site = await getState().user.site_id;

      axiosInstance
        .post("procurement/tool/tool_dropdown/", {
          fields: field,
          id: name,
          location: location,
          site: site,
        })
        .then((res) => {
          dispatch({
            type: "REQ_CREATE_ADD_EDIT",
            payload: res.data.tool_data,
          });
        })
        .catch((err) => {
          dispatch({
            type: "REQ_CREATE_ADD_EDIT",
            payload: {
              rate: "",
              sku_code: "",
              in_stock: "",
            },
          });
          console.log("Dashboard Error !", err);
        });
    } catch (err) {
      console.log(err);
    }
  };

export const toolGetNameByCategory =
  (val, notify) => async (dispatch, getState) => {
    if (val===""||val===null||val===undefined) {
      return
    }
    try {
      const location = await getState().user.location_id;
      const site = await getState().user.site_id;
      axiosInstance
        .post("procurement/tool/tool_dropdown/", {
          fields: ["tool_list_under_category"],
          id: val,
          location: location,
          site: site,
        })
        .then((res) => {
          dispatch({
            type: REQ_REDUCER.REQ_REDUCER_GET_TOOL_BY_CATEGORY,
            payload: res.data.tool_list_under_category,
          });
        })
        .catch((err) => {
          notify(err.response.data.message, { variant: "error" });
        });
    } catch (err) {
      console.log(err);
    }
  };

export const toolGetNameByCategoryAdminAction =
  (val, admin) => async (dispatch, getState) => {
    if (val === ""|| val===null||val===undefined) {
      return 
    }
    try {
      const location = await getState().user.location_id;

      axiosInstance
        .post("procurement/tool/tool_dropdown/", {
          fields: ["tool_list_under_category"],
          id: val,
          location: location,
          site: admin,
        })
        .then((res) => {
          dispatch({
            type: REQ_REDUCER.REQ_REDUCER_GET_TOOL_BY_CATEGORY,
            payload: res.data.tool_list_under_category,
          });
        })
        .catch((err) => {
          console.log("Dashboard Error !", err);
        });
    } catch (err) {
      console.log(err);
    }
  };

export const getOrderNoRequestAction = () => async (dispatch, getState) => {
  try {
    const location = await getState().user.location_id;
    const site = await getState().user.site_id;

    axiosInstance
      .post("procurement/dropdown/", {
        fields: ["requisition_order_no"],
        location_id: location,
        site_id: site,
      })
      .then((res) => {
        dispatch({
          type: REQ_REDUCER.REQ_GET_REQUEST_ORDER,
          payload: res.data.requisition_order_no,
        });
        dispatch({
          type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
          payload: {
            order_no: res.data.requisition_order_no,
          },
        });
        dispatch({
          type: "REQ_EDIT",
          payload: { order_no: res.data.requisition_order_no },
        });
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      });
  } catch (err) {
    console.log(err);
  }
};

export const uploadBillByPK =
  (formData, config, notify) => async (dispatch) => {
    axiosInstance
      .post(`procurement/requisition/bill/upload/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        notify(res.data.message, { variant: "success" });
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      });
  };

export const downloadBillByPKAction = (pk, notify) => async () => {
  axiosInstance
    .get(`procurement/bill/${pk}/download/`, { responseType: "arraybuffer" })
    .then((response) => {
      const imageBlob = new Blob([response.data], {
        type: response.headers?.["content-type"],
      }); // Set the correct MIME type
      const imageURL = URL.createObjectURL(imageBlob);

      // Create a link element
      const link = document.createElement("a");
      link.href = imageURL;

      link.download = `bill.${
        response.headers?.["content-type"].split(".")[1]
      }`; // File name for download
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(imageURL); // F
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    });
};
