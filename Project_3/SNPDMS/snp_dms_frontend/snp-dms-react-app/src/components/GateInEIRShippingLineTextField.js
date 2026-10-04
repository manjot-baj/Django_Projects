import React from "react";
import { makeStyles, TextField } from "@material-ui/core";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  input: {
    padding: 8,
    // backgroundColor: "#fff",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
}));

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
  const classes = useStyles();
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
        className={classes.textField}
        inputProps={{ className: classes.input }}
        disabled={readOnlyTF ? readOnlyTF : false}
        style={{ backgroundColor: readOnlyTF ? "#E8EAEC" : "white" }}
        onChange={(e) => handleChange(e)}
        onBlur={onBlurDispatch}
      />
    </>
  );
};
export default GateInEIRShippingLineTextField;
