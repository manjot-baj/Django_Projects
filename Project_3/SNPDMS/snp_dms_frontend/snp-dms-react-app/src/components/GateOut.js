import React, { useEffect } from "react";
import { makeStyles, Typography, Grid, IconButton } from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import GateSearch from "./GateSearch";
import GateOutContainerDetails from "./gateOut/GateOutContainerDetails";
import EIRInfo from "./EIRInfo";
import GateOutDetails from "./gateOut/GateOutDetails";
import GateOutloloPaymentDetails from "./gateOut/GateOutLoloPayment";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import PaymentHandlingReceipt from "./gateOut/PaymentHandlingReceipt";
import { dropDownDispatch, dropDownPreGateInDispatch } from "../actions/GateInActions";
import { useSnackbar } from "notistack";
import { truckTurnAroundTransporterGateOutAction } from "../actions/TruckTurnAroundAction";

const GateOut = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateOut, ui ,user} = store;
  const notify = useSnackbar().enqueueSnackbar;

  const useStyles = makeStyles((theme) => ({
    pdHorizontal: {
      paddingLeft: ui.drawerOpen ? 0 : "30px",
      paddingRight: ui.drawerOpen ? 0 : 30,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
        marginBottom: 50,
      },
    },
    textField: {
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#243545",
        },
      },
    },
  }));

  const classes = useStyles();
  // TODAYS DATE
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //
  var yyyy = today.getFullYear();

  var todayDate = yyyy + "-" + mm + "-" + dd;

  // Todays time
  var curr_hour = today.getHours();
  var curr_min = today.getMinutes();
  var todayTime = curr_hour + ":" + curr_min;

  useEffect(() => {
    // TODAYS DATE
  
// eslint-disable-next-line react-hooks/exhaustive-deps
    todayDate = yyyy + "-" + mm + "-" + dd;
  
// eslint-disable-next-line react-hooks/exhaustive-deps
    todayTime = curr_hour + ":" + curr_min;
  }, [gateOut.setDateTime]);

  useEffect(() => {
    let reqArray = [];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(dropDownPreGateInDispatch(["lf_advance_payment_client_list", "lf_pregatein_list","lf_pregateout_list"],notify))
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
    <Grid container spacing={3} className={classes.pdHorizontal}>
      <Grid item xs={12}>
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
              style={{ margin: "12px 0", backgroundColor: "#2A5FA5" }}
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