import React from "react";
import {  TextField } from "@mui/material";
import { useDispatch } from "react-redux";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";

const GateInTextField = ({
  id,
  name,
  validation,
  value,
  handleChange,
  type,
  dispatchType,
  readOnlyP,
  isRemark,
}) => {

 
  const [showError, setError] = React.useState(false);
  const dispatch = useDispatch();
  const onBlurDispatch = (event) => {
    if (validation) {
      var regEx = /^([A-Za-z]{4}[0-9]{7})$/g.test(event.target.value);
      if (regEx) {
        setError(false);
      } else {
        setError(true);
      }
      if (
        dispatchType === NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO
      ) {
        dispatch({
          type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
          payload: {
            invoice_no: event.target.value,
          },
        });
      } else {
        dispatch({ type: dispatchType, payload: event.target.value });
      }
    }
  };
  const handlefiledChange = (event) => {
    handleChange(event);
    if (
      dispatchType === NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO
    ) {
      dispatch({
        type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_INVOICE_NO,
        payload: {
          invoice_no: event.target.value,
        },
      });

      return  
    }
    dispatchType &&
      dispatch({ type: dispatchType, payload: event.target.value });
  };
  return (
    <>
      <TextField
        id={id}
        name={name}
        type={type ? type : "text"}
        value={value ? value : ""}
        multiline={isRemark ? isRemark : false}
        rows={isRemark ? 2 : 1}
        variant="outlined"
        color="primary"
        fullWidth
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#243545",
            },
          },
           "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "rgba(0,0,0.05)", //Adjust text color here
            },
             "& .MuiInputBase-root.Mui-disabled": {
              backgroundColor: "#f9f9f9", //Adjust background color here
            },
        }}
        // slotProps={{ className: classes.input }}
        onChange={(e) => handlefiledChange(e)}
        onBlur={onBlurDispatch}
        autoComplete="off"
        disabled={readOnlyP ? readOnlyP : false}
        error={showError}
        helperText={showError && "Invalid container number"}
      />
    </>
  );
};
export default GateInTextField;
