import React from "react";

import DateFnsUtils from "@date-io/date-fns";
import { makeStyles } from "@material-ui/core";
// import moment from "moment";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import { useDispatch } from "react-redux";
import { REQ_REDUCER_CONSUME } from "../../reducers/procurement/consumptionReducer";

const useStyles = makeStyles((theme) => ({
  input: {
    fontSize:12,
    padding: 8,
    backgroundColor: "#fff",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  textFieldProc: {
    width:"190px",
    padding:"0 !important",
    "& .MuiOutlinedInput-root":{
      "& fieldset": {
        borderRadius:"4px",
        border: "2px solid rgba(0,0,0,0.08)",
      },
    },
    [theme.breakpoints.down('sm')]:{
      width:"150px"
    }
  },
  preGateInField:{
    width:"100%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  }
}));

const DatePickerField = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { dateId, dateValue, dateChange, dispatchType } = props;

  const handlePickerDateChange = (date) => {
    // setTestDate(date);
    dateChange(date);
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

   

      if(dispatchType === "REQ_EDIT"|| dispatchType === REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT){
        dispatch({ type: dispatchType, payload: {date :selectedDateFormat} });
      }else{
        dispatchType &&
        dispatch({ type: dispatchType, payload: selectedDateFormat });
      }
  };
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} >
      <KeyboardDatePicker
        fullWidth={props?.fullWidth}
        variant="inline"
        format="yyyy/MM/dd"
        autoOk={true}
        inputVariant="outlined"
        id={`${dateId}-date-picker-inline`}
        value={dateValue ? dateValue : null}
        emptyLabel=""
        maxDate={props?.isDisableFuture ?new Date():undefined}
        onChange={(date) => handlePickerDateChange(date)}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        className={props.procurement ?classes.textFieldProc: props.preGateIn ?classes.preGateInField: classes.textField}
        inputProps={{ className: classes.input }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DatePickerField;
