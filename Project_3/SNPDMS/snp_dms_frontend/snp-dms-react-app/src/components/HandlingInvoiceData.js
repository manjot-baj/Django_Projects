import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Box,
  Checkbox,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import CustomTextfield from "./reusableComponents/GateInTextField";
import { dropDownDispatch } from "../actions/GateInActions";
import DatePickerField from "./reusableComponents/DatePickerField";
import { useSnackbar } from "notistack";

import { theme } from "../App";

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      // padding: "1px 4px",
      paddingBottom: 1,
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
}));

export default function HandlingInvoiceData() {
  const classes = useStyles();

  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const store = useSelector((state) => state);
  const { clientMaster, gateIn, user, billing } = store;
  const [invoiceClient, setInvoiceClient] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceLocation, setInvoiceLocation] = useState(
    localStorage.getItem("location") ? localStorage.getItem("location") : ""
  );
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [invoiceGSTNo, setInvoiceGSTNo] = useState("");

  useEffect(() => {
    if (billing.allCollectedInvoice) {
      setInvoiceClient(billing.allCollectedInvoice.client);
      setInvoiceDate(billing.allCollectedInvoice.invoice_date);
      setInvoiceNumber(billing.allCollectedInvoice.invoice_no);
      setInvoiceLocation(billing.allCollectedInvoice.location);
      setInvoiceAddress(billing.allCollectedInvoice.address);
      setInvoiceGSTNo(billing.allCollectedInvoice.gst_no);
    }
  }, [clientMaster.clientDetails]);

  useEffect(() => {
    let reqArray = ["location_site_dashboard_list"];

    dispatch(dropDownDispatch(reqArray, notify));
  }, []);

  const handleInvoiceDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setInvoiceDate(selectedDateFormat);
  };

  return (
    <div>
      <Typography
        variant="subtitle2"
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: "#243545",
          color: "#FFF",
          marginTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Billing Details
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Client Name <span style={{ color: "red" }}>*</span>
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <CustomTextfield
              id="client-handling-name"
              handleChange={(e) => setInvoiceClient(e.target.value)}
              value={invoiceClient}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            lg={6}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          />
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Invoice Date
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <DatePickerField
              dateId="to-date"
              dateValue={invoiceDate}
              dateChange={handleInvoiceDateChange}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Invoice Number
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <CustomTextfield
              id="client-invoice-number"
              handleChange={(e) => setInvoiceNumber(e.target.value)}
              value={invoiceNumber}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Grid style={{ display: "flex" }}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Reverse Charge (Y/N)
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Checkbox />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Location <span style={{ color: "red" }}>*</span>
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <TextField
              id="client-handling-location"
              select
              value={invoiceLocation}
              variant="outlined"
              fullWidth
              inputProps={{ className: classes.input }}
              onChange={(e) => {
                setInvoiceLocation(e.target.value);
              }}
              disabled={
                (user.role === "Location Admin" ||
                  user.role === "Site Admin" ||
                  user.role === "Depot User") &&
                true
              }
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.location_site_dashboard_list &&
                Object.keys(
                  gateIn.allDropDown.location_site_dashboard_list
                ).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Address
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <CustomTextfield
              id="client-handling-address"
              handleChange={(e) => setInvoiceAddress(e.target.value)}
              value={invoiceAddress}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              GST No
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <CustomTextfield
              id="client-handling-gst-number"
              handleChange={(e) => setInvoiceGSTNo(e.target.value)}
              value={invoiceGSTNo}
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
