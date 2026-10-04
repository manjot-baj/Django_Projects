import axiosInstance from "@/AxiosExtend"
import { REQ_REDUCER_CONSUME } from "../../reducers/procurement/consumptionReducer";
import { startLoading, stopLoading } from "../UIActions";

export const changeModeConsumeAction = (val) => (dispatch) => {
  dispatch({ type: REQ_REDUCER_CONSUME.REQ_REDUCER_CHANGE_MODE, payload: val });
};

export const getConsumprionByPk =
  (pk, notify, setCurrentConsume) => async (dispatch) => {
    dispatch(startLoading())
    axiosInstance
      .get(`procurement/consumption/${pk}/`)
      .then((res) => {
        dispatch({
          type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT,
          payload: res.data,
        });
        setCurrentConsume(res.data);
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const getAllConsumeNew = (notify) => async (dispatch, getState) => {
  const location_id = await getState().user.location_id;
  const site_id = await getState().user.site_id;
  const {
    pg_no,
    edit_on_page_data,
    from_date,
    to_date,
    name,
    consumption_no,
    category,
  } = await getState().ProcurementConsume.getConsumeAllNew;
  dispatch(startLoading())
  axiosInstance
    .post("procurement/consumption/all_consumptions/", {
      pg_no,
      on_page_data: edit_on_page_data,
      location_id,
      from_date,
      to_date,
      site_id,
      name,
      category,
      consumption_no,
    })
    .then((res) => {
      dispatch({
        type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
        payload: res.data,
      });
    })
    .catch((err) => {
      notify(err.response.data.message, { variant: "error" });
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const createConsumeFromToolRoom =
  (val) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const data = {
      pk: "",
      order_no: "",
      date: currentDate(),
      total_amount: "",
      location,
      site,
      consumption_line: val.map((val) => ({
        category: val.category,
        name: val.name,
        in_stock: val.in_stock,
        rate: val.rate,
        category: val.category_id,
        tool_id: val.pk,
        sku_code: val.sku_code,
        quantity: 0,
        amount: val.rate,
        remarks: `${1} Purchases`,
      })),
    };
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_CREATE_CONSUME_FROM_TOOLROOM,
      payload: data,
    });
  };

const currentDate = () => {
  var selectedDate = new Date();
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

  return selectedDateFormat;
};

export const handleChangeEditConsumerAction = (val) => async (dispatch) => {
  dispatch({
    type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_CREATE_ADD_EDIT,
    payload: val,
  });
};

export const editCreateFieldConsumeAction =
  (index, val) => async (dispatch, getState) => {
    const data = await getState().ProcurementConsume.createRequestConsume.data
      .consumption_line;
    const newData = data.map((value, number) => {
      if (number === index) {
        return { ...value, ...val };
      } else {
        return { ...value };
      }
    });

    dispatch({ type: REQ_REDUCER_CONSUME.REQ_EDIT_FIELD, payload: newData });
    dispatch(editCreateReqConsumeAction());
  };

export const deleteCreateFieldConsumeAction =
  (index) => async (dispatch, getState) => {
    const data = await getState().ProcurementConsume.createRequestConsume
      .consumption_line;
    const newData = data.filter((val, valindex) => {
      return valindex !== index;
    });
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_DELETE_FIELD,
      payload: newData,
    });
  };

export const addFieldConsumeAction = () => async (dispatch, getState) => {
  const data = await getState().ProcurementConsume.editFieldConsume;
  dispatch({
    type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_ADD,
    payload: {
      category: data.category,
      quantity: data.quantity,
      name: data.name,
      rate: data.rate,
      amount: data.amount,
      remarks: data.remarks,
      sku_code: data.sku_code,
      in_stock: data.in_stock,
      category_id: data.category_pk,
      tool_id: data.tool_pk,
    },
  });
};

export const editConsumeAction =
  (req_no, notify) => async (dispatch, getState) => {
    try {
      axiosInstance
        .get(`procurement/consumption/${req_no}/`)
        .then((res) => {
          dispatch({
            type: REQ_REDUCER_CONSUME.REQ_REDUCER_GET_EDIT_CONSUMER,
            payload: res.data,
          });
        })
        .catch((err) => {
          notify(err.response.data.message, { variant: "error" });
        });
    } catch (err) {
      notify("Requesition  failed", { variant: "error" });
    }
  };

export const editRequisitionButtonConsumeAction = (val, notify) => {
  try {
    axiosInstance
      .put(`procurement/get_consumption/${val.pk}/`, val)
      .then((res) => {
        notify("Consumption Edited Succesfully", { variant: "success" });
      })
      .catch((err) => {
        notify("Consumption Get Failed", { variant: "error" });
      });
  } catch (err) {
    notify("Requesition  failed", { variant: "error" });
  }
};

export const createConsumeAction =
  (val, notify, history) => async (dispatch, getState) => {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
     dispatch(startLoading())
    axiosInstance
      .post("procurement/consumption/add/", {
        ...{
          consumption_no: val.order_no,
          date: val.date,
          consumption_line: val.consumption_line.map((val, index) => {
            val.consumed_quantity = Number(val.quantity);
            delete val.quantity;
            delete val.amount;
            return val;
          }),
        },
        location_id,
        site_id,
      })
      .then((res) => {
        notify(res.data.success, { variant: "success" });
        history.goBack();
      })
      .catch((err) => {
        notify(err.response.data.message, { variant: "error" });
      }).finally(()=>{
        dispatch(stopLoading())
      })
  };

export const editCreateReqConsumeAction =
  (val) => async (dispatch, getState) => {
    const data = await getState().ProcurementConsume.createRequestConsume
      .consumption_line;
    const amount = data.reduce((acc, curr) => acc + curr.amount, 0);
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT,
      payload: { total_amount: amount, ...val },
    });
  };

export const getToolDataConsumeAction =
  (field, name) => async (dispatch, getState) => {
    try {
      const location = await getState().user.location_id;
      const site = await getState().user.site_id;
      dispatch(startLoading())
      axiosInstance
        .post("procurement/tool/tool_dropdown/", {
          fields: field,
          id: name,
          location: location,
          site: site,
        })
        .then((res) => {
          dispatch({
            type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_CREATE_ADD_EDIT,
            payload: res.data.tool_data,
          });
        })
        .catch((err) => {
          console.log("Dashboard Error !", err);
        }).finally(()=>{
          dispatch(stopLoading())
        })
    } catch (err) {
      console.log(err);
    }
  };

export const toolGetNameByCategoryConsume =
  (val) => async (dispatch, getState) => {
    if (val === undefined || val === "" || val === null) {
      return;
    }
    dispatch(startLoading())
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
            type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_REDUCER_GET_TOOL_BY_CATEGORY,
            payload: res.data.tool_list_under_category,
          });
        })
        .catch((err) => {
          console.log("Dashboard Error !", err);
        }).finally(()=>{
          dispatch(stopLoading())
        })
    } catch (err) {
      console.log(err);
    }
  };

export const deleteConsumptionAction =
  (pk, notify, history) => async (dispatch, getState) => {
    dispatch(startLoading())
    try {
      axiosInstance
        .delete(`procurement/consumption/${pk}/delete/`)
        .then((res) => {
          notify("Consumption Deleted Succesfully", { variant: "success" });
          history.goBack();
        })
        .catch((err) =>
          notify("Consumption Deleted failed", { variant: "error" })
        );
    } catch (err) {
      notify("Consumption  failed", { variant: "error" });
    }finally{
      dispatch(stopLoading())
    }
    
  };

export const updateConsumptionToolAction =
  (pk, notify, history, delete_line, index) => async (dispatch, getState) => {
    const data = await getState().ProcurementConsume.createRequestConsume;
    dispatch(startLoading())
    try {
      axiosInstance
        .put(`procurement/get_consumption/${pk}/`, {
          pk: data.pk,
          consumption_no: data.consumption_no,
          date: data.date,
          location: data.location,
          site: data.site,
          consumption_line: data.consumption_line
            .filter((val, indie) => index !== indie)
            .map((val, indie) => {
              return {
                ...val,
                consumed_quantity: Number(val.consumed_quantity),
              };
            }),
          delete_history_lines: [...data.delete_history_lines, delete_line],
        })
        .then((res) => {
          notify("Consumption Tool Deleted Succesfully", {
            variant: "success",
          });
          history.go(0);
        })
        .catch((err) =>
          notify("Consumption Tool Delete failed", { variant: "error" })
        ).finally(()=>{
          dispatch(stopLoading())
        })
    } catch (err) {
      notify("Consumption  failed", { variant: "error" });
    }
  };

export const updateConsumptionAction =
  (pk, notify, history, setCurrentConsume) => async (dispatch, getState) => {
    const data = await getState().ProcurementConsume.createRequestConsume;
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    dispatch(startLoading())
    try {
      axiosInstance
        .put(`procurement/consumption/${pk}/update/`, {
          pk: data.pk,
          consumption_no: data.consumption_no,
          date: data.date,
          location_id,
          site_id,
          delete_history_lines: data.delete_history_lines,
          consumption_line: data.consumption_line.map((val) => ({
            ...val,
            consumed_quantity: Number(val.consumed_quantity),
          })),
        })
        .then((res) => {
          notify(res.data.successMsg, { variant: "success" });
          if (res.data.data) {
            dispatch({
              type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT,
              payload: res.data.data,
            });
            if (setCurrentConsume) {
              setCurrentConsume(res.data.data);
            }
          } else {
            history.go(0);
          }
        })
        .catch((err) =>
          notify("Consumption Update failed", { variant: "error" })
        ).finally(()=>{
          dispatch(stopLoading())
        })
    } catch (err) {
      notify("Consumption  failed", { variant: "error" });
    }
  };

export const getOrderNoConsumeAction = () => async (dispatch, getState) => {
  try {
    const location_id = await getState().user.location_id;
    const site_id = await getState().user.site_id;
    dispatch(startLoading())
    axiosInstance
      .post("procurement/dropdown/", {
        fields: ["consumption_order_no"],
        location_id,
        site_id,
      })
      .then((res) => {
        dispatch({
          type: REQ_REDUCER_CONSUME.REQ_GET_CONSUME_ORDER,
          payload: res.data.consumption_order_no,
        });
        dispatch({
          type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT,
          payload: { order_no: res.data.consumption_order_no },
        });
      })
      .catch((err) => {
        console.log("Dashboard Error !", err);
      }).finally(()=>{
        dispatch(stopLoading())
      })
  } catch (err) {
    console.log(err);
  }
};
