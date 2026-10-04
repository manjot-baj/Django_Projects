import React, { useState, useEffect } from "react";
import { Checkbox } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  addCheck,
  removeCheck,
} from "../../actions/NewBillingActions";

const ReusableCheckboxNew = (props) => {
  const dispatch = useDispatch();
  const { id, value } = props;
  const [state, setState] = useState(false);
  const store = useSelector((state) => state);
  const { clientMasterBilling } = store;

  useEffect(() => {
    for (var i = 0; i <= clientMasterBilling.checkNew.length; i++) {
      if (value === clientMasterBilling.checkNew[i]) setState(true);
    }
  }, [props]);

  const handleCheck = () => {
    setState(!state);
    if (state) dispatch(removeCheck(id));
    else dispatch(addCheck(id));
  };

  return (
    <Checkbox
      checked={state}
      key={id}
      onClick={handleCheck}
      style={{ color: "#243545" }}
      inputProps={{ "aria-label": "Checkbox A" }}
    />
  );
};

export default ReusableCheckboxNew;
