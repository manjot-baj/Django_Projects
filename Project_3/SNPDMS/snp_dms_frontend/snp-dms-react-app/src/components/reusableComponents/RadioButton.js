import React from "react";
import { Radio } from "@material-ui/core";
import { useDispatch } from "react-redux";

const RadioButtonComponent = ({
  id,
  checked,
  disabled,
  label,
  value,
  handleChange,
  required,
  dispatchType,
}) => {
  const dispatch = useDispatch();
  const handlefiledChange = (event) => {
    // handleChange(event);
    dispatchType &&
      dispatch({ type: dispatchType, payload: event.target.value });
  };
  return (
    <>
      <Radio
        id={id}
        label={label}
        value={value}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={(e) => handlefiledChange(e)}
      />
    </>
  );
};
export default RadioButtonComponent;
