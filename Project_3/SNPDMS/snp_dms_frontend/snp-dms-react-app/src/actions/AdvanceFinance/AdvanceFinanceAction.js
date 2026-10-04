import { axiosInstance } from "../../Axios";
import { ADVANCE_FINANCE_CONSTANT } from "../../reducers/AdvanceFinance/AdvanceFinanceReducer";
import { dropDownPreGateOUTContainerActionDispatch } from "../GateInActions";
import { START_LOADING, STOP_LOADING } from "../UIActions";

export const downloadSample = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};

export const getAdvanceFinanceTableAction =
  (notify) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {
      pg_no,
      on_page_data_client,
      client,
      entry_type,
      bl_no,
      bk_no,
      payment_type,
      from_date,
      to_date,
      is_balance_pymt_adjusted,
    } = await getState().AdvanceFinanceReducer.financeTable;
    axiosInstance
      .post("depot/lolo_advanced_payment_list/", {
        pg_no,
        on_page_data: on_page_data_client,
        client,
        entry_type,
        is_balance_pymt_adjusted,
        bl_no,
        bk_no,
        payment_type,
        from_date,
        to_date,
        location,
        site: site,
      })
      .then((res) => {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
          payload: res.data,
        });
      })
      .catch((err) => {
        notify("Data Load Failed . Try Again", { variant: "error" });
        console.log("Dashboard Error !", err);
      });
  };

export const addAdvanceFinanceAction =
  (notify, handleCloseUpdate) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {
      bl_no,
      bk_no,
      payment_type,
      entry_type,
      client,
      cheque_no,
      utr_no,
      bank_name,
      account_name,
      account_no,
      transaction_id,
      quantity,
      original_amount,
      tds
    } = await getState().AdvanceFinanceReducer.requestData;

    axiosInstance
      .post("depot/lolo_advanced_payment/", {
        bl_no: entry_type === "IN" ? bl_no : null,
        bk_no: entry_type === "OUT" ? bk_no : null,
        payment_type: payment_type,
        entry_type: entry_type,
        client: client,
        tds:tds,
        cheque_no: payment_type === "Cheque" ? cheque_no : null,
        utr_no:
          payment_type === "NEFT" || payment_type === "RTGS" ? utr_no : null,
        bank_name:
          payment_type === "NEFT" ||
          payment_type === "RTGS" ||
          payment_type === "Cheque"
            ? bank_name
            : null,
        account_name:
          payment_type === "NEFT" ||
          payment_type === "RTGS" ||
          payment_type === "Cheque"
            ? account_name
            : null,
        account_no:
          payment_type === "NEFT" ||
          payment_type === "RTGS" ||
          payment_type === "Cheque"
            ? account_no
            : null,
        transaction_id: payment_type === "UPI" ? transaction_id : null,
        location,
        site: site,
        original_amount: Number(original_amount),
        quantity: Number(quantity),
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          handleCloseUpdate();
          notify("Advance Payment Succesfull", { variant: "success" });
          dispatch(getAdvanceFinanceTableAction(notify));
          dispatch({ type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE_INIT });
        }
      })
      .catch((err) => {
        notify("Data Load Failed . Try Again", { variant: "error" });
        console.log("Dashboard Error !", err);
      });
  };

export const updateAdvanceFinanceAction =
  (notify, handleCloseUpdate) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const {
      pk,
      bl_no,
      bk_no,
      payment_type,
      entry_type,
      client,
      cheque_no,
      utr_no,
      bank_name,
      account_name,
      account_no,
      transaction_id,
      quantity,
      tds,
      original_amount,
    } = await getState().AdvanceFinanceReducer.requestData;

    axiosInstance
      .put(`depot/lolo_advanced_payment/${pk}/`, {
        bl_no: entry_type === "IN" ? bl_no : null,
        bk_no: entry_type === "OUT" ? bk_no : null,
        payment_type: payment_type,
        entry_type: entry_type,
        client: client,
        tds:tds,
        cheque_no: payment_type === "Cheque" ? cheque_no : null,
        utr_no:
          payment_type === "NEFT" || payment_type === "RTGS" ? utr_no : null,
        bank_name:
          payment_type === "NEFT" ||
          payment_type === "RTGS" ||
          payment_type === "Cheque"
            ? bank_name
            : null,
        account_name:
          payment_type === "NEFT" ||
          payment_type === "RTGS" ||
          payment_type === "Cheque"
            ? account_name
            : null,
        account_no:
          payment_type === "NEFT" ||
          payment_type === "RTGS" ||
          payment_type === "Cheque"
            ? account_no
            : null,
        transaction_id: payment_type === "UPI" ? transaction_id : null,
        location,
        site: site,
        original_amount: Number(original_amount),
        quantity: Number(quantity),
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          handleCloseUpdate();
          notify("Advance Payment Updated Succesfull", { variant: "success" });
          dispatch(getAdvanceFinanceTableAction(notify));
          dispatch({ type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE_INIT });
        }
      })
      .catch((err) => {
        notify("Data Load Failed . Try Again", { variant: "error" });
        console.log("Dashboard Error !", err);
      });
  };

export const getSingleAdvanceFinanceAction =
  (pk, handleOpen, notify) => async (dispatch, getState) => {
    axiosInstance
      .get(`depot/lolo_advanced_payment/${pk}/`)
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          dispatch({
            type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_UPDATE,
            payload: res.data?.adv_payment_data,
          });

          handleOpen(true);
        }
      })
      .catch((err) => {
        notify("Data Load Failed . Try Again", { variant: "error" });
        console.log("Dashboard Error !", err);
      });
  };

export const getSingleAdvanceFinanceProcessAction =
  (pk, notify) => async (dispatch, getState) => {
    axiosInstance
      .get(`depot/lolo_advanced_payment/${pk}/`)
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          dispatch({
            type: ADVANCE_FINANCE_CONSTANT.ADVANCE_FINANCE_PROCESS,
            payload: res.data,
          });
          if (res.data?.pregate_in_list?.length > 0) {
            dispatch({
              type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
              payload: {
                client: res.data.pregate_in_list[0].client,
                arrived: res.data.pregate_in_list[0].arrived,
                shipping_line: res.data.pregate_in_list[0].shipping_line,
                do_validity_in_date:
                  res.data.pregate_in_list[0].do_validity_in_date,
                consignee: res.data.pregate_in_list[0].consignee,
                shipper: res.data.pregate_in_list[0].shipper,
                cargo: res.data.pregate_in_list[0].cargo,
                remarks: res.data.pregate_in_list[0].remarks,
                newAdd: true,
              },
            });
          }

          if (res.data?.pregate_out_list?.length > 0) {
            dispatch({
              type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
              payload: {
                departed: res.data.pregate_out_list[0].departed,
                do_validity_in_date:
                  res.data.pregate_out_list[0].do_validity_out_date,
                consignee: res.data.pregate_out_list[0].consignee,
                shipper: res.data.pregate_out_list[0].shipper,
                cargo: res.data.pregate_out_list[0].cargo,
                remarks: res.data.pregate_out_list[0].remarks,
                newAdd: true,
              },
            });
          }
        }
      })
      .catch((err) => {
      
        console.log("Dashboard Error !", err);
      });
  };

export const downloadPreGateInSampleData = (alert) => async () => {
  try {
    const res = await axiosInstance.get(`/depot/pregatein_bulk_upload/`, {
      responseType: "arraybuffer",
    });
    if (res.data) {
      downloadSample(res.data, "Pre_Gate_In_Sample_File");
      alert("Sample File Downloaded Succesfully", { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const extractPreGateInData = (fileData, alert) => async (dispatch) => {
  try {
    dispatch({
      type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EXTRACT_DATA,
      payload: { loading: true },
    });
    const res = await axiosInstance.post(
      `/depot/pregatein_bulk_upload/`,
      fileData
    );
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    } else {
      dispatch({
        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EXTRACT_DATA,
        payload: { loading: false },
      });
      dispatch({
        type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EXTRACT_DATA,
        payload: { data: res.data },
      });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const importPreGateInData =
  (importArray, alert, history, payment_id, setExpanded) =>
  async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/depot/pregatein_bulk_import/`,
        importArray
      );
      if (res.data.successMsg) {
        dispatch(getSingleAdvanceFinanceProcessAction(payment_id, alert));
        if (setExpanded) {
          setExpanded("");
          dispatch({ type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT_INT });
        }
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, { variant: "error" });
    }
  };

export const downloadPreGateInRejectedData =
  (rejectArray, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/depot/rejected_pregatein_download/`,
        rejectArray,
        { responseType: "arraybuffer" }
      );
      if (res.data) {
        downloadSample(res.data, "Pre Gate In Rejected");
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const addPreGateInDoScanDataAction =
  (payment_id, data, alert, setExpanded) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    try {
      const response = await Promise.all(
        data.map((item) =>
          axiosInstance.post(`/depot/pregatein/`, {
            ...item,
            adv_payment_id: payment_id,
            site,
            location,
          })
        )
      );

      response.forEach((res) => {
        if (res.data.successMsg) {
          alert(res.data.successMsg, { variant: "success" });

          dispatch(getSingleAdvanceFinanceProcessAction(payment_id, alert));
        } else if (res.data.errorMsg) {
          alert(res.data.errorMsg, { variant: "error" });
        }
      });
      setExpanded("");
      dispatch({ type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT_INT });
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const addPreGateInDataAction =
  (payment_id, alert) => async (dispatch, getState) => {
    const { preGateInEdit } = await getState().AdvanceFinanceReducer;
    const location = await getState().user.location;
    const site = await getState().user.site;
    delete preGateInEdit.shipping_line_data;
    delete preGateInEdit.newAdd;
    try {
      const res = await axiosInstance.post(`/depot/pregatein/`, {
        ...preGateInEdit,
        adv_payment_id: payment_id,
        site,
        location,
      });
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_NEW_ADD });
        dispatch(getSingleAdvanceFinanceProcessAction(payment_id, alert));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const updatePreGateInDataAction =
  (alert) => async (dispatch, getState) => {
    const { preGateInEdit } = await getState().AdvanceFinanceReducer;
    const location = await getState().user.location;
    const site = await getState().user.site;
    delete preGateInEdit.shipping_line_data;
    delete preGateInEdit.validity_expired;
    delete preGateInEdit.is_gatein_done;
    delete preGateInEdit.is_survey_done;
    delete preGateInEdit.on_hold;
    delete preGateInEdit.updated_at;
    delete preGateInEdit.created_at;
    try {
      const res = await axiosInstance.put(
        `/depot/pregatein/${preGateInEdit.pk}/`,
        {
          ...preGateInEdit,
          site,
          location,
        }
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_INIT });
        dispatch(
          getSingleAdvanceFinanceProcessAction(
            preGateInEdit.adv_payment_id,
            alert
          )
        );
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateInDataTableAction =
  (alert) => async (dispatch, getState) => {
    const {
      pg_no,
      on_page_data_client,
      client,
      shipping_line,
      container_no,
      do_validity_date,
      on_hold,
      validity_expired,
      is_gatein_done,
      is_survey_done,
    } = await getState().AdvanceFinanceReducer.preGateIntable;
    const location = await getState().user.location;
    const site = await getState().user.site;

    try {
      const res = await axiosInstance.post(`/depot/pregatein_list/`, {
        pg_no,
        on_page_data: on_page_data_client,
        client,
        shipping_line,
        container_no,
        do_validity_date,
        on_hold,
        validity_expired,
        is_gatein_done,
        is_survey_done,
        site,
        location,
      });
      if (res.data) {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_TABLE_EDIT,
          payload: res.data,
        });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateOutDataTableAction =
  (alert) => async (dispatch, getState) => {
    const {
      pg_no,
      on_page_data_client,
      client,
      shipping_line,
      container_no,
      do_validity_date,
      on_hold,
      validity_expired,
      is_gateout_done,
    } = await getState().AdvanceFinanceReducer.preGateOutTable;
    const location = await getState().user.location;
    const site = await getState().user.site;

    try {
      const res = await axiosInstance.post(`/depot/pregateout_list/`, {
        pg_no,
        on_page_data: on_page_data_client,
        client,
        shipping_line,
        container_no,
        do_validity_date,
        on_hold,
        validity_expired,
        is_gateout_done,
        site,
        location,
      });
      if (res.data) {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_TABLE,
          payload: res.data,
        });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateInPkAction =
  (pk, alert) => async (dispatch, getState) => {
    try {
      const res = await axiosInstance.get(`/depot/pregatein/${pk}/`);
      if (res.data) {
        dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT_INIT });
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_EDIT,
          payload: {
            ...res.data,

            shipping_line_data: [{ name: res.data.shipping_line }],
          },
        });
        window.scrollTo(0, 0);
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateOutPreFillAction =
  (container, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    try {
      const res = await axiosInstance.post(`/depot/pregateout_prefill_info/`, {
        container_no: container,
        location,
        site,
      });
      if (res.data) {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
          payload: {
            ...res.data,
            shipping_line_data: [{ name: res.data.shipping_line }],
          },
        });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const addPreGateOutDataAction =
  (bk_no, payment_id, alert) => async (dispatch, getState) => {
    const { preGateOutEdit } = await getState().AdvanceFinanceReducer;
    const location = await getState().user.location;
    const site = await getState().user.site;
    delete preGateOutEdit.shipping_line_data;
    delete preGateOutEdit.newAdd;
    try {
      const res = await axiosInstance.post(`/depot/pregateout/`, {
        ...preGateOutEdit,
        adv_payment_id: payment_id,
        site,
        location,
      });
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT_NEW_ADD });
        dispatch(dropDownPreGateOUTContainerActionDispatch(bk_no, alert));
        dispatch(getSingleAdvanceFinanceProcessAction(payment_id, alert));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const handlePreGateInValidityUpdateAction =
  (pk_list, date, time, handleModalClose, alert) =>
  async (dispatch, getState) => {
    try {
      const res = await axiosInstance.post(
        `/depot/upgrade_pregatein_validity/`,
        {
          pk_list: pk_list,
          date: date,
          time: time,
        }
      );
      if (res.data.sucessMsg) {
        alert(res.data.sucessMsg, { variant: "success" });
        handleModalClose();
        dispatch(getPreGateInDataTableAction(alert));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const handlePreGateInDeleteAction =
  (
    payment_id,
    pk_list,
    handleModalCloseDelete,
    process,
    setSelectedRows,
    alert
  ) =>
  async (dispatch, getState) => {
    try {
      const res = await axiosInstance.post(`/depot/pregatein_delete/`, {
        pk_list: pk_list,
      });
      if (res.data.sucessMsg) {
        alert(res.data.sucessMsg, { variant: "success" });
        handleModalCloseDelete();
        setSelectedRows([]);
        if (process) {
          dispatch(getSingleAdvanceFinanceProcessAction(payment_id, alert));
        } else {
          dispatch(getPreGateInDataTableAction(alert));
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const handlePreGateOutValidityUpdateAction =
  (pk_list, date, time, handleModalClose, alert) =>
  async (dispatch, getState) => {
    try {
      const res = await axiosInstance.post(
        `/depot/upgrade_pregateout_validity/`,
        {
          pk_list: pk_list,
          date: date,
          time: time,
        }
      );
      if (res.data.sucessMsg) {
        alert(res.data.sucessMsg, { variant: "success" });
        handleModalClose();
        dispatch(getPreGateOutDataTableAction(alert));
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const handlePreGateOutDeleteAction =
  (
    bk_no,
    payment_id,
    pk_list,
    handleModalCloseDelete,
    process,
    setSelectedRows,
    alert
  ) =>
  async (dispatch, getState) => {
    const { advanceProcess } = await getState().AdvanceFinanceReducer;
    try {
      const res = await axiosInstance.post(`/depot/pregateout_delete/`, {
        pk_list: pk_list,
      });
      if (res.data.sucessMsg) {
        alert(res.data.sucessMsg, { variant: "success" });
        handleModalCloseDelete();
        setSelectedRows([]);
        if (process) {
          dispatch(dropDownPreGateOUTContainerActionDispatch(bk_no, alert));
          dispatch(getSingleAdvanceFinanceProcessAction(payment_id, alert));
        } else {
          dispatch(getPreGateOutDataTableAction(alert));
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateOutPkAction =
  (pk, alert) => async (dispatch, getState) => {
    try {
      const res = await axiosInstance.get(`/depot/pregateout/${pk}/`);
      if (res.data) {
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT,
          payload: {
            ...res.data,
            shipping_line_data: [{ name: res.data.shipping_line }],
          },
        });
        window.scrollTo(0, 0);
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const updatePreGateOutDataAction =
  (alert) => async (dispatch, getState) => {
    const { preGateOutEdit } = await getState().AdvanceFinanceReducer;
    const location = await getState().user.location;
    const site = await getState().user.site;
    delete preGateOutEdit.shipping_line_data;
    delete preGateOutEdit.validity_expired;
    delete preGateOutEdit.is_gateout_done;
    delete preGateOutEdit.on_hold;
    delete preGateOutEdit.updated_at;
    delete preGateOutEdit.created_at;
    try {
      const res = await axiosInstance.put(
        `/depot/pregateout/${preGateOutEdit.pk}/`,
        {
          ...preGateOutEdit,
          site,
          location,
        }
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_OUT_EDIT_INIT });
        dispatch(
          getSingleAdvanceFinanceProcessAction(
            preGateOutEdit.adv_payment_id,
            alert
          )
        );
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateOutPkBalanceAdjustmentINAction =
  (pk, alert) => async (dispatch, getState) => {
    try {
      const res = await axiosInstance.get(
        `/depot/lolo_advanced_payment/${pk}/adjust_balance/`
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        dispatch(getAdvanceFinanceTableAction(alert));
      } else {
        alert("Balance Adjustment Failed", { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateOutPkBalanceAdjustmentOutAction =
  (pk, alert) => async (dispatch, getState) => {
    try {
      const res = await axiosInstance.get(`/depot/pregateout/${pk}/`);
      if (res.data) {
        console.log(res.data);
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

export const getPreGateDOScanDataAction =
  (formData, alert, setExpanded) => async (dispatch) => {
    dispatch({ type: START_LOADING });
    try {
      const res = await axiosInstance.post(
        `/depot/pregatein_do_upload/`,
        formData
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
        dispatch({ type: STOP_LOADING });
      } else {
        setExpanded("panel2");
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.DO_SCAN_EDIT,
          payload: { fileData: res.data },
        });
        dispatch({ type: STOP_LOADING });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
      dispatch({ type: STOP_LOADING });
    }
  };


  export const downloadPreGateOutFoemSixAction =
  (pk,alert) => async (dispatch) => {
    dispatch({ type: START_LOADING });
    try {
      const res = await axiosInstance.get(
        `/depot/pregateout_form_download/${pk}/`,
        {
          responseType: "arraybuffer",
        }
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
        dispatch({ type: STOP_LOADING });
      } else {
       
        downloadSample(res.data,"Pre Gate Out Form 6.pdf")
        dispatch({ type: STOP_LOADING });
      }
    } catch (err) {
      alert(err.response.data.errorMsg, {
        variant: "error",
      });
      dispatch({ type: STOP_LOADING });
    }
  };


  export const deleteAdvancePaymentAction =
  (pk_list, alert, setSelectedPayment) => async (dispatch) => {
    dispatch({ type: START_LOADING });
    try {
      const res = await axiosInstance.post(
        `/depot/lolo_advanced_payment_delete/`,
        {
          pk_list: pk_list,
        }
      );
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
        dispatch({ type: STOP_LOADING });
      } else {
        alert(res.data.successMsg, { variant: "success" });
        setSelectedPayment([]);
        dispatch({
          type: ADVANCE_FINANCE_CONSTANT.GET_ADVANCE_TABLE,
          payload: {
            pg_no: 1,
          },
        });
        dispatch(getAdvanceFinanceTableAction(alert));
        dispatch({ type: STOP_LOADING });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
      dispatch({ type: STOP_LOADING });
    }
  };