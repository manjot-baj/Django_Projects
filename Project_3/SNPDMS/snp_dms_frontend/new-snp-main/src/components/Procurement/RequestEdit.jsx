import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editCreateReq,
  getToolDataAction,
  toolGetNameByCategory,
  getOrderNoRequestAction,
  getRequistionByPk,
} from "../../actions/Procurement/requestAction";

import { toolGetAllCategory } from "../../actions/Procurement/procurementAction";

import { useSnackbar } from "notistack";

import { REQ_REDUCER } from "../../reducers/procurement/requesitionReducer";
import RquestStatus from "./RquestStatus";
import { useHistory } from "react-router-dom";

const RequestEdit = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { user } = useSelector((state) => state);
  const { editField, mode, getRequesition_by_pk } = useSelector(
    (state) => state.ProcurementRequest
  );
  const notify = useSnackbar().enqueueSnackbar;
  // eslint-disable-next-line no-unused-vars
  const [IITDate, setIITDate] = useState("");
  const [lineOriginal, setLineOriginal] = useState(null);

  const handleIITDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setIITDate(selectedDateFormat);
    return selectedDateFormat;
  };

  useEffect(() => {
    if(user.procurement_admin ===false){
      history.push("/dashboard");
    }
    if (props.history.location.state?.original) {
      dispatch(
        getRequistionByPk(
          props.history.location.state.original.pk,
          notify,
          setLineOriginal
        )
      );
    } else {
      if (getRequesition_by_pk !== null) {
        return;
      }
      const currentDate = new Date();
      let current = handleIITDateChange(currentDate);
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK,
        payload: {
          mode: "CREATE",
          order_no: "",
          date: current,
          status: "PENDING",
          total_amount: 0,
          location: user.location,
          site: user.site,
          requisition_line: [],
        },
      });
    }

    dispatch(editCreateReq());
    dispatch(toolGetAllCategory(notify));
    return () => {
      dispatch({
        type: REQ_REDUCER.REQ_REDUCER_GET_EDIT_REQUISITION,
        payload: {
          pk: "",
          cgst: 0.0,
          sgst: 0.0,
          igst: 0.0,
          is_approved: false,
          order_no: "",
          date: "",
          total_amount: null,
          requisition_line: [],
        },
      });
      dispatch({
        type: REQ_REDUCER.REQ_REDUCER_CHANGE_MODE,
        payload: {
          create: true,
          edit: false,
        },
      });
      dispatch({
        type: REQ_REDUCER.REQ_GET_REQUEST_BY_PK_CLEAR,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(toolGetNameByCategory(editField.category_pk,notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editField.category, editField.name,editField.category_pk]);

  useEffect(() => {
    if (editField.category !== "") {
      dispatch(
        getToolDataAction(
          ["get_tool_data_by_id", ],
          editField.tool_pk
        )
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editField.name]);

  useEffect(() => {
    if (mode.create && props.history.location.state?.original===undefined) {
      const currentDate = new Date();
      let current = handleIITDateChange(currentDate);
      dispatch({ type: "REQ_EDIT", payload: { date: current } });
      dispatch(getOrderNoRequestAction());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 

  return <RquestStatus lineOriginal={lineOriginal} setLineOriginal={setLineOriginal}/>;
};

export default RequestEdit;
