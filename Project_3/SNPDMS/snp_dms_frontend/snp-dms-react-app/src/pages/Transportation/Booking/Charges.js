import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Select,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookingEntries } from "../../../actions/BookingAction";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
    width: "100%",
  },
  input: {
    padding: 7,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: "0px",
      height: "30px",
    },
  },
  generalDetailsWrapper: {
    width: "100%",
    padding: "30px 20px",
    backgroundColor: "#243545",
    color: "#FFF",
  },
  tranportationDetailsWrapper: {
    width: "100%",
  },
}));

export default function Charges(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [trFrieght, setTrFrieght] = useState("");
  const [advance, setAdvance] = useState("");
  const [dieselLiter, setDieselLiter] = useState("");
  const [dieselRate, setDieselRate] = useState("");
  const [fuelPump, setFuelPump] = useState("");
  const [detentionCharges, setDetentionCharges] = useState("");
  const [extraCharges, setExtraCharges] = useState("");
  const [balance, setBalance] = useState("");
  const [dieselCost, setDieselCost] = useState("");
  const [loadingUnloading, setLoadingUnloading] = useState("");
  const [handlingCharges, setHandlingCharges] = useState("");
  const [handlingCompany, setHandlingCompany] = useState("");
  const [washingCharges, setWashingCharges] = useState("");
  const [repairCharges, setRepairCharges] = useState("");
  const [weighmentCharges, setWeighmentCharges] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  return (
    <Paper className={classes.tranportationDetailsWrapper}>
      <Paper className={classes.generalDetailsWrapper}>
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            Transportation Charges
          </Box>
        </Typography>

        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container xs={12} spacing={3}>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                TR Freight <span style={{ color: "red" }}>*</span>
              </Typography>
              <CustomTextfield
                id="tr_frieght"
                value={trFrieght}
                handleChange={(e) => setTrFrieght(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Advance
              </Typography>
              <CustomTextfield
                id="advance"
                value={advance}
                handleChange={(e) => setAdvance(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Diesel Liter
              </Typography>
              <CustomTextfield
                id="diesel_quantity"
                value={dieselLiter}
                handleChange={(e) => setDieselLiter(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
         
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Diesel Rate
              </Typography>
              <CustomTextfield
                id="diesel_rate"
                value={dieselRate}
                handleChange={(e) => setDieselRate(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Diesel Cost
              </Typography>
              <CustomTextfield
                id="diesel_cost"
                value={dieselCost}
                handleChange={(e) => setDieselCost(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Fuel Pump
              </Typography>

              <Select
                id="fuel-pump"
                value={fuelPump}
                fullWidth
                onChange={(e) => {
                  setFuelPump(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setFuelPump("");
                  }}
                >
                  1
                </MenuItem>
              </Select>
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Detention Charges
              </Typography>
              <CustomTextfield
                id="detention_charges"
                value={detentionCharges}
                handleChange={(e) => setDetentionCharges(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Extra Charges
              </Typography>
              <CustomTextfield
                id="extra_charges"
                value={extraCharges}
                handleChange={(e) => setExtraCharges(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={3}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Balance
              </Typography>
              <CustomTextfield
                id="balance"
                value={balance}
                handleChange={(e) => setBalance(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
          </Grid>
        </Paper>
      </Paper>
      <Paper
        className={classes.generalDetailsWrapper}
        style={{ marginTop: "20px" }}
      >
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            Handling charges
          </Box>
        </Typography>

        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container xs={12} spacing={3}>
            <Grid
              item
              xs={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Loading & Unloading
              </Typography>
              <CustomTextfield
                id="loading-unloading"
                value={loadingUnloading}
                handleChange={(e) => setLoadingUnloading(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>

            <Grid
              item
              xs={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Handling Charges
              </Typography>
              <CustomTextfield
                id="handling-charges"
                value={handlingCharges}
                handleChange={(e) => setHandlingCharges(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Handling Company
              </Typography>

              <Select
                id="handling_company"
                value={handlingCompany}
                fullWidth
                onChange={(e) => {
                  setHandlingCompany(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setHandlingCompany("");
                  }}
                >
                  1
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Paper>
      </Paper>
      <Paper
        className={classes.generalDetailsWrapper}
        style={{ marginTop: "20px" }}
      >
        <Typography variant="subtitle2">
          <Box fontWeight="fontWeightBold" m={1}>
            MNR charges
          </Box>
        </Typography>

        <Paper className={classes.paperContainer} elevation={0}>
          <Grid container xs={12} spacing={3}>
            <Grid
              item
              xs={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Washing Charge
              </Typography>
              <CustomTextfield
                id="container-number"
                value={washingCharges}
                handleChange={(e) => setWashingCharges(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Repair Charges
              </Typography>
              <CustomTextfield
                id="container-number"
                value={repairCharges}
                handleChange={(e) => setRepairCharges(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
            <Grid
              item
              xs={4}
              style={theme.breakpoints.down("sm") && { padding: 7 }}
            >
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Weighment charges
              </Typography>
              <CustomTextfield
                id="container-number"
                value={weighmentCharges}
                handleChange={(e) => setWashingCharges(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
                type="number"
              />
            </Grid>
          </Grid>
        </Paper>
      </Paper>
    
    </Paper>
  );
}
