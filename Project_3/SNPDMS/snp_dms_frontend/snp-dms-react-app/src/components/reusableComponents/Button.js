import React from "react";
import { Button  } from "@material-ui/core";
import { useDispatch } from "react-redux";

const RadioButtonComponent = ({
  disabled,
  handleChange,
  dispatchType,
  color,
  variant
}) => {
  const dispatch = useDispatch();
  const handlefiledChange = (event) => {
    handleChange(event);
    dispatchType &&
      dispatch({ type: dispatchType, payload: event.target.value });
  };
  return (
    <>
      <Button 
        color={color}
        disabled={disabled}
        fullWidth	
        variant={variant}
        onChange={(e) => handlefiledChange(e)}
      />
    </>
  );
};
export default RadioButtonComponent;
