import React, { useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  IconButton,
  useTheme,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { dropDownContainerAction, dropDownDispatch, dropDownPreGateInDispatch } from "../actions/GateInActions";
import GateSearch from "./GateSearch";
import GateInContainerDetails from "./GateInContainerDetails";
import EIRInfo from "./EIRInfo";
import GateInDetails from "./GateInDetails";
import PaymentDetails from "./PaymentDetails";
import LoloReceipt from "./LoloReceipt";
import EDIModal from "./EDIModal";
import { ADVANCE_FINANCE_CONSTANT } from "../reducers/AdvanceFinance/AdvanceFinanceReducer";



const GateIn = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);

  const { gateIn, ui } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const useStyles = makeStyles((theme) => ({
    pdHorizontal: {
      paddingLeft: ui.drawerOpen ? 0 : "30px",
      paddingRight: ui.drawerOpen ? 0 : 30,
      [theme.breakpoints.down("sm")]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  }));

  const classes = useStyles();
  const theme = useTheme();

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
   
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateIn.setDateTime]);

  useEffect(() => {
    let reqArray = [];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch(dropDownContainerAction())
    dispatch(dropDownPreGateInDispatch(["lf_advance_payment_client_list", "lf_pregatein_list","current_pregate_out_available_container_list"]))
    dispatch({type:ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH_INIT})
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
      dispatch({type:ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH_INIT})
    };
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.pdHorizontal}>
      <Grid container>
        <Grid item xs={12}>
          {/* <RenderOnViewportEntry
            threshold={0.25}
          > */}
            <GateSearch searchType="GateIn" />
          {/* </RenderOnViewportEntry> */}
          {gateIn.gateInStep === "Lolo_Receipt" ||
          gateIn.gateInStep === "Transport_Receipt" ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="h6"
                style={{ color: "#000", margin: "12px 0" }}
              >
                Handling Payments
              </Typography>
              <IconButton
                onClick={() =>
                  dispatch({ type: "GATE_IN_STEP", payload: "Gate_in" })
                }
                style={{ margin: "12px 0", backgroundColor: "#2A5FA5" }}
              >
                <KeyboardBackspaceIcon style={{ color: "#fff" }} />
              </IconButton>
            </div>
          ) : null}
          {/* <RenderOnViewportEntry
            threshold={0.25}
          > */}
            {gateIn.gateInStep === "Gate_in" ? (
              <>
                <GateInContainerDetails todayDate={todayDate} />
                <EIRInfo
                  todayDate={todayDate}
                  todayTime={todayTime}
                  gateType="IN"
                />
                {/* )} */}
                <GateInDetails todayDate={todayDate} todayTime={todayTime} />
                <PaymentDetails todayDate={todayDate} />
              </>
            ) : gateIn.gateInStep === "Lolo_Receipt" ? (
              <LoloReceipt receiptType="loloReceipt" />
            ) : gateIn.gateInStep === "Transport_Receipt" ? (
              <LoloReceipt receiptType="stReceipt" />
            ) : null}
          {/* </RenderOnViewportEntry> */}
        </Grid>
      </Grid>
      {/* <RenderOnViewportEntry threshold={0.25}> */}
        <EDIModal />
      {/* </RenderOnViewportEntry> */}
      <div style={theme.breakpoints.down("xs") && { marginBottom: 50 }} />
    </div>
  );
};

export default GateIn;
