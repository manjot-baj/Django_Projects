import React, { useState, useEffect } from "react";
import { Checkbox } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
  addCheck,
  removeCheck,
} from "../../actions/Master/ClientMasterActions";

const ReusableCheckbox = (props) => {
  const dispatch = useDispatch();
  const { id, value } = props;
  const [state, setState] = useState(false);
  const store = useSelector((state) => state);
  const { clientMaster } = store;

  useEffect(() => {
    for (var i = 0; i <= clientMaster.check.length; i++) {
      if (value === clientMaster.check[i]) setState(true);
    }
  }, [props]);

  const handleCheck = () => {
    setState(!state);
    if (state) dispatch(removeCheck(id));
    else dispatch(addCheck(id));
  };

  return (
    <Checkbox
      checked={clientMaster?.check.some((value, index)=> id === value)}
      key={id}
      onClick={handleCheck}
      style={{ color: "#243545" }}
      inputProps={{ "aria-label": "Checkbox A" }}
    />
  );
};

export default ReusableCheckbox;
