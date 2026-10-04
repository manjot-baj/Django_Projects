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

export default function TranspotationDetails(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [transporter, setTransporter] = useState("");
  const [truckNo, setTruckNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [containerNo, setContainerNo] = useState("");
  const [containerType, setContainerType] = useState("");
  const [containerSize, setContainerSize] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [sealNo, setSealNo] = useState("");
  const [status, setStatus] = useState("");
  const [port, setPort] = useState("");
  const [pod, setPod] = useState("");
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
            Transporter Details
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
                Transporter Name<span style={{ color: "red" }}>*</span>
              </Typography>

              <Select
                id="transport-type"
                value={transporter}
                fullWidth
                onChange={(e) => {
                  setTransporter(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setTransporter("");
                  }}
                >
                  1
                </MenuItem>
              </Select>
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
                Truck no<span style={{ color: "red" }}>*</span>
              </Typography>

              <Select
                id="truck-no"
                value={truckNo}
                fullWidth
                onChange={(e) => {
                  setTruckNo(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
        
              >
                <MenuItem
                  onClick={() => {
                    setTruckNo("");
                  }}
                >
                  1
                </MenuItem>
              </Select>
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
                Driver name<span style={{ color: "red" }}>*</span>
              </Typography>

              <Select
                id="driver-name"
                value={driverName}
                fullWidth
                onChange={(e) => {
                  setDriverName(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setDriverName("");
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
            Container Details
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
                Container Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <CustomTextfield
                id="container-number"
                value={containerNo}
                handleChange={(e) => setContainerNo(e.target.value)}
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
                Container Type
              </Typography>
              <CustomTextfield
                id="container-type"
                value={containerType}
                handleChange={(e) => setContainerType(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
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
                Container Size
              </Typography>
              <CustomTextfield
                id="container-size"
                value={containerSize}
                handleChange={(e) => setContainerSize(e.target.value)}
                dispatchType={getAllBookingEntries.bookingNumber}
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
                Shipping Line
              </Typography>

              <Select
                id="shipping-line"
                value={shippingLine}
                fullWidth
                onChange={(e) => {
                  setShippingLine(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setShippingLine("");
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
                Seal Number
              </Typography>
              <CustomTextfield
                id="seal-no"
                value={sealNo}
                handleChange={(e) => setSealNo(e.target.value)}
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
                Status
              </Typography>

              <Select
                id="status"
                value={status}
                fullWidth
                onChange={(e) => {
                  setStatus(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setStatus("");
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
                Port
              </Typography>

              <Select
                id="port"
                value={port}
                fullWidth
                onChange={(e) => {
                  setPort(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setPort("");
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
                Port of Departure
              </Typography>

              <Select
                id="pod"
                value={pod}
                fullWidth
                onChange={(e) => {
                  setPod(e.target.value);
                }}
                inputProps={{
                  style: {
                    padding: "0px",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setPod("");
                  }}
                >
                  1
                </MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Paper>
      </Paper>
    </Paper>
  );
}
