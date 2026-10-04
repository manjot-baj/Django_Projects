import React from "react";
import { useDispatch } from "react-redux";
import { REQ_REDUCER_CONSUME } from "../../reducers/procurement/consumptionReducer";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const DatePickerField = (props) => {
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

    if (
      dispatchType === "REQ_EDIT" ||
      dispatchType === REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT
    ) {
      dispatch({ type: dispatchType, payload: { date: selectedDateFormat } });
    } else {
      dispatchType &&
        dispatch({ type: dispatchType, payload: selectedDateFormat });
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} >
      <DatePicker
        format="YYYY/MM/DD"
        slotProps={{textField:{size:'small',style:{width:props.smallWidth? "120px":props.fullWidth?"100%":"auto"}}}}
        id={`${dateId}-date-picker-inline`}
        value={dateValue ? dayjs(dateValue) : null}
        name="from_date"
        maxDate={props?.isDisableFuture ? dayjs(new Date()) : undefined}
        onChange={(date) => handlePickerDateChange(date)}
      
        sx={{
          width: props.procurement ? "190px" : "100%",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#243545",
            },
          },
        }}
        onError={(error)=>console.log(error)}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
