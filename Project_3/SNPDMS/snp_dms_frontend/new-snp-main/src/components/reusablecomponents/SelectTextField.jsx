import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";



const SelectTextField = ({
  selectFieldId,
  menuItemList,
  dispatchType,
  value,
  index,
  validation
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
      dispatch({ type: dispatchType, payload: event.target.value });
    }
    
  };

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#243545",
          },
        },
      }}
      id={selectFieldId}
      value={value}
      style={{ backgroundColor: "white" }}
      size="small"
      onBlur={onBlurDispatch}
      error={showError}
      helperText={showError && "Please select an option"}
      onChange={(e) => {
        dispatch({
          type: dispatchType,
          payload: { damageCode: e.target.value, index: index },
        });
      }}
    >
      {menuItemList &&
        menuItemList.map((option, ind) => (
          <MenuItem key={selectFieldId + option} value={option}>
            {option}
          </MenuItem>
        ))}
    </TextField>
  );
};

export default SelectTextField;
