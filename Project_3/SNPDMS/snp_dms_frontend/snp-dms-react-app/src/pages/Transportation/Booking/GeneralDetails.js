import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  MenuItem,
  Grid,
  Box,
  Select,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { getAllBookingEntries } from "../../../actions/BookingAction";
import { useSnackbar } from "notistack";
import { theme } from "../../../App";
import CustomTextfield from "../../../components/reusableComponents/GateInTextField";
import { dropDownDispatch } from "../../../actions/GateInActions";
import DatePickerField from "../../../components/reusableComponents/DatePickerField";
import { set } from 'lodash.set';

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
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
}));

export default function GeneralDetails(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [bookingNumber, setBookingNumber] = useState("");
  const [lDate, setLDate] = useState("");
  const [entryNo, setEntryNo] = useState("");
  const [consignor, setConsignor] = useState("");
  const [consignee, setConsignee] = useState("");
  const [bookingType, setBookingType] = useState("");
  const [fromDestination, setFromDestination] = useState("");
  const [toDestination, setToDestination] = useState("");
  const [lRNo, setLrNo] = useState("");
  const [sDate, setSDate] = useState("");
  const [pallets, setPallets] = useState("");
  const [weight, setWeight] = useState("");
  const [chargeWeight, setChargeWeight] = useState("");
  const [particulars, setParticulars] = useState("");
  const [destination, setDestination] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = ["client_ref_codes", "location_site_dashboard_list"];
    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  return (
    <Paper className={classes.generalDetailsWrapper}>
      <Typography variant="subtitle2">
        <Box fontWeight="fontWeightBold" m={1}>
          General Booking Details
        </Box>
      </Typography>

      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container xs={12} spacing={3}>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Booking Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="booking-no"
              value={bookingNumber}
              handleChange={(e) => setBookingNumber(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Entry Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="entry-no"
              value={entryNo}
              handleChange={(e) => setEntryNo(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              LR Number <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="lr-no"
              value={lRNo}
              handleChange={(e) => setLrNo(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Loading DATE
            </Typography>
            <DatePickerField
              dateId="l-date"
              dateValue={lDate}
              dateChange={(date) => setLDate(date)}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_IN_DATE"}
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Stuffing DATE
            </Typography>
            <DatePickerField
              dateId="s-date"
              dateValue={sDate}
              dateChange={(date) => setSDate(date)}
              dispatchType={"SET_SEAL_MANAGEMENT_SEARCH_FROM_IN_DATE"}
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              From
            </Typography>

            <Select
              id="from"
              value={fromDestination}
              fullWidth
              onChange={(e) => {
                setFromDestination(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setFromDestination("");
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              To
            </Typography>

            <Select
              id="to-dest"
              value={toDestination}
              fullWidth
              onChange={(e) => {
                setToDestination(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setToDestination("");
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Destination
            </Typography>
            <CustomTextfield
              id="destination"
              value={destination}
              handleChange={(e) => setDestination(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Consignor
            </Typography>

            <Select
              id="consignor"
              value={consignor}
              fullWidth
              onChange={(e) => {
                setConsignor(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setConsignor("");
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Consignee
            </Typography>

            <Select
              id="consignee"
              value={consignee}
              fullWidth
              onChange={(e) => {
                setConsignee(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setConsignee("");
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Particulars
            </Typography>

            <Select
              id="particulars"
              value={particulars}
              fullWidth
              onChange={(e) => {
                setParticulars(e.target.value);
              }}
              inputProps={{
                style: {
                  padding: "0px",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setParticulars("");
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
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              No of pallets <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="pallets-no"
              value={pallets}
              handleChange={(e) => setPallets(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Actual Weight <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="actual-weight"
              value={weight}
              handleChange={(e) => setWeight(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Charge Weight <span style={{ color: "red" }}>*</span>
            </Typography>
            <CustomTextfield
              id="charge-no"
              value={chargeWeight}
              handleChange={(e) => setChargeWeight(e.target.value)}
              dispatchType={getAllBookingEntries.bookingNumber}
              type="number"
            />
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  );
}
