import React, { useEffect, useState } from "react";
import { Typography, Grid, IconButton, useTheme, Box } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { dropDownDispatch } from "../actions/GateInActions";
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

  const theme = useTheme();

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

    dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH_INIT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
      dispatch({ type: ADVANCE_FINANCE_CONSTANT.PRE_GATE_IN_FETCH_INIT });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={(theme) => ({
        [theme.breakpoints.down("sm")]: {
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 20,
        },
      })}
    >
      <Grid container>
        <Grid item size={{ xs: 12 }}>
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
                sx={(theme) => ({
                  margin: "12px 0",
                  backgroundColor: theme.palette.secondary.main,
                })}
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
    </Box>
  );
};

export default GateIn;
