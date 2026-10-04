import React from "react";

import DateFnsUtils from "@date-io/date-fns";
import { makeStyles } from "@material-ui/core";
// import moment from "moment";

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from "@material-ui/pickers";

import { useDispatch } from "react-redux";

const useStyles = makeStyles(() => ({
  input: {
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
}));

const DatePickerField = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { timeId, timeValue, timeChange, dispatchType } = props;

  const handlePickertimeChange = (date) => {
    // setTestDate(date);
    timeChange(date);
    dispatch({ type: dispatchType, payload: selectedTimeFormat });
  };
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardTimePicker
        variant="inline"
        inputVariant="outlined"
        id={`${timeId}-date-picker-inline`}
        value={timeValue ? timeValue : null}
        onChange={(date) => handlePickertimeChange(date)}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        className={classes.textField}
        inputProps={{ className: classes.input }}
      />
    </MuiPickersUtilsProvider>
  );
};

export default DatePickerField;
