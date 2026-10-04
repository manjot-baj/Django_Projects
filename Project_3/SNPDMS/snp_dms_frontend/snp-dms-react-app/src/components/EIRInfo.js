import React, { useState, useEffect } from "react";
import { Typography, Grid, FormControlLabel, Radio } from "@material-ui/core";
import EIRmapster from "./EIRmapster";
import GateOutEIRMapster from "./gateOut/GateOutEIRMapster";
import { useSelector } from "react-redux";

const EIRInfo = (props) => {
  const store = useSelector((state) => state);
  const { gateInEdit, gateInEirFields, gateOutEdit, gateOutEIR } = store;
  const [eirStatus, setEIRStatus] = useState(false);
  const { todayDate, todayTime } = props;

  useEffect(() => {
    if (props.gateType === "IN") {
      gateInEdit.selectedContainer.eir_data.eir_line.length !== 0 &&
        setEIRStatus(true);
    } else {
      gateOutEdit.selectedContainer.eir_data?.eir_line.length !== 0 &&
        setEIRStatus(true);
    }
  }, [
    gateInEdit.selectedContainer.eir_data?.eir_line,
    gateOutEdit.selectedContainer.eir_data?.eir_line,
  ]);

  const handleEIRHide = () => {
    if (props.gateType === "IN") {
      if (
        gateInEdit.selectedContainer.eir_data.eir_line.length === 0 &&
        gateInEirFields.eir_line.length === 0
      )
        setEIRStatus(false);
    } else {
      if (
        gateOutEdit.selectedContainer.eir_data.eir_line.length === 0 &&
        gateOutEIR.eir_line.length === 0
      )
        setEIRStatus(false);
    }
  };

  return (
    <div>
      <Grid
        item
        xs={5}
        style={{
          display: "flex",
          alignItems: "center",
          // justifyContent: "space-between",
          padding: "2px 2px 8px 18px",
        }}
      >
        <Typography
          variant="subtitle2"
          style={{ paddingTop: 14, paddingBottom: 14 }}
        >
          EIR Info?
        </Typography>
        <FormControlLabel
          value="show"
          style={{ marginLeft: 10 }}
          control={
            <Radio
              style={{ color: "#2F6FB7" }}
              checked={eirStatus}
              onClick={() => setEIRStatus(true)}
            />
          }
          label="Show"
        />
        <FormControlLabel
          value="hide"
          control={
            <Radio
              style={{ color: "#2F6FB7" }}
              checked={!eirStatus}
              onClick={handleEIRHide}
            />
          }
          label="Hide"
        />
      </Grid>
      {props.gateType === "IN" ? (
        <EIRmapster
          todayDate={todayDate}
          todayTime={todayTime}
          hide={eirStatus}
        />
      ) : (
        <GateOutEIRMapster
          todayDate={todayDate}
          todayTime={todayTime}
          hide={eirStatus}
        />
      )}
    </div>
  );
};

export default EIRInfo;
