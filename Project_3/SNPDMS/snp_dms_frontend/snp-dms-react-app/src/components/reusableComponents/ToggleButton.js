import React from "react";
import { Switch  } from "@material-ui/core";
import { useDispatch } from "react-redux";

const ToggleButton = ({
  id,
  checked,
  disabled,
  value,
  handleChange,
  required,
  dispatchType,
  defaultChecked
}) => {
  const dispatch = useDispatch();
  const handlefiledChange = (event) => {
    // handleChange(event);
    dispatchType &&
      dispatch({ type: dispatchType, payload: event.target.value });
  };
  return (
    <>
      <Switch 
        id={id}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        required={required}
        onChange={(e) => handlefiledChange(e)}
      />
    </>
  );
};
export default ToggleButton;
