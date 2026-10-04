import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";

import GateInEIRShippingLineTextField from "./GateInEIRShippingLineTextField";

const GateInEIRShippingLineRow = ({
  lgsize,
  xssize,
  rowId,
  fieldValue,
  readOnlyTF,
  index,
  select,
  dispatchType,
}) => {
  const [textFieldValue, setTextFieldValue] = useState(fieldValue);
  useEffect(() => {
    setTextFieldValue(fieldValue);
  }, [fieldValue]);
  return (
    <Grid
      item
      xs={xssize}
      lg={lgsize}
      style={{ paddingLeft: 20 }}
      id={`${rowId}-row`}
    >
      <GateInEIRShippingLineTextField
        value={textFieldValue}
        fieldId={`${rowId}-field`}
        readOnlyTF={readOnlyTF}
        handleChange={(e) => setTextFieldValue(e.target.value)}
        index={index}
        select={select}
        dispatchType={dispatchType}
      />
    </Grid>
  );
};

export default GateInEIRShippingLineRow;
