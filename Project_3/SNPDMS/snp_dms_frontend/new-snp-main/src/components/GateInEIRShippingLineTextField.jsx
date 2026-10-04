import React from "react";
import { TextField } from "@mui/material";
import { useDispatch } from "react-redux";



const GateInEIRShippingLineTextField = ({
  fieldId,
  readOnlyTF,
  index,
  name,
  value,
  handleChange,
  type,
  select,
  dispatchType,
}) => {

  const dispatch = useDispatch();
  const onBlurDispatch = (event) => {
    dispatch({
      type: dispatchType,
      payload: { desc: event.target.value, index: index },
    });
  };

  return (
    <>
      <TextField
        id={fieldId}
        // select={select}
        type={type ? type : "text"}
        value={value ? value : ""}
        variant="outlined"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#243545",
            },
          },
        }}
        size="small"
        disabled={readOnlyTF ? readOnlyTF : false}
        style={{ backgroundColor: readOnlyTF ? "#E8EAEC" : "white" }}
        onChange={(e) => handleChange(e)}
        onBlur={onBlurDispatch}
      />
    </>
  );
};
export default GateInEIRShippingLineTextField;
