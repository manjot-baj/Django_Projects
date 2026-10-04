import React from "react";
import { TextField, makeStyles, MenuItem } from "@material-ui/core";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  input: {
    padding: 8,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
}));

const SelectTextField = ({
  selectFieldId,
  menuItemList,
  dispatchType,
  value,
  index,
  validation
}) => {
  const classes = useStyles();
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
      className={classes.textField}
      id={selectFieldId}
      value={value}
      style={{ backgroundColor: "white" }}
      inputProps={{ className: classes.input }}
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
