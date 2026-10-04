import React, { useEffect, useState } from "react";
import { Typography, Grid, IconButton } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import GateSearch from "./GateSearch";
import GateOutContainerDetails from "./gateOut/GateOutContainerDetails";
import EIRInfo from "./EIRInfo";
import GateOutDetails from "./gateOut/GateOutDetails";
import GateOutloloPaymentDetails from "./gateOut/GateOutLoloPayment";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PaymentHandlingReceipt from "./gateOut/PaymentHandlingReceipt";
import { dropDownDispatch } from "../actions/GateInActions";
import { useSnackbar } from "notistack";
import { truckTurnAroundTransporterGateOutAction } from "../actions/TruckTurnAroundAction";

const GateOut = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateOut, ui ,user} = store;
  const notify = useSnackbar().enqueueSnackbar;



   const getTodayTime = () => {
    const date = new Date();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const getTodayDate = () => {
    const date = new Date();

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${yyyy}-${mm}-${dd}`;
  };

    const [todayDate, setTodayDate] = useState(getTodayDate);
    const [todayTime, setTodayTime] = useState(getTodayTime);

  useEffect(() => {
    setTodayDate(getTodayDate());
    setTodayTime(getTodayTime());
  }, []);

  useEffect(() => {
    let reqArray = [];
    dispatch(dropDownDispatch(reqArray, notify));

    
    if (user.truck_tracking ==="True"||user.truck_tracking === true) {
      dispatch(truckTurnAroundTransporterGateOutAction(notify))
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_OUT_CONTAINER_DETAILS" });
      dispatch({ type: "RESET_GATE_OUT_UPDATE_FORM" });
    };
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid container spacing={3} sx={(theme)=>({
   
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom:24
      },
    })}>
      <Grid item size={{xs:12}}>
        <GateSearch searchType="GateOut" />
        {gateOut.gateOutStep === "Lolo_Receipt" ||
        gateOut.gateOutStep === "Transport_Receipt" ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              style={{ color: "#000", margin: "12px 0" }}
            >
              Handling Payments
            </Typography>
            <IconButton
              onClick={() =>
                dispatch({ type: "GATE_OUT_STEP", payload: "Gate_out" })
              }
              sx={(theme)=>({ margin: "12px 0", backgroundColor:theme.palette.secondary.main})}
            >
              <KeyboardBackspaceIcon style={{ color: "#fff" }} />
            </IconButton>
          </div>
        ) : null}
        {gateOut.gateOutStep === "Gate_out" ? (
          <>
            <GateOutContainerDetails />
            {/* <GateOutEIRInfo /> */}
            <EIRInfo
              todayDate={todayDate}
              todayTime={todayTime}
              gateType="OUT"
            />
            <GateOutDetails todayDate={todayDate} todayTime={todayTime} />
            <GateOutloloPaymentDetails
              todayDate={todayDate}
              todayTime={todayTime}
            />
          </>
        ) : gateOut.gateOutStep === "Lolo_Receipt" ? (
          <PaymentHandlingReceipt receiptType="loloReceipt" />
        ) : gateOut.gateOutStep === "Transport_Receipt" ? (
          <PaymentHandlingReceipt receiptType="stReceipt" />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default GateOut;